import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import { SqliteFolhaRepository } from './SqliteFolhaRepository'
import { runInTransaction } from '../db/sqlite/SqliteTx'

// Cobre a REC-0004: o recálculo de folha em `folhaHandlers.ts` (`folha:calcular`) usa
// exatamente `runInTransaction` + os métodos de `SqliteFolhaRepository` testados aqui
// (`upsertHolerite` → `deleteLancamentosAutomaticos` → `addLancamento`). Este arquivo não
// reimplementa a lógica de IRRF/INSS (já coberta por `CalculoFolha.test.ts`) — testa
// especificamente o contrato de transação/idempotência que a REC-0004 pediu, usando um
// banco SQLite real (em memória), com o mesmo schema de `folha_lancamentos`/
// `folha_holerites` criado pelas migrations 042/043/056 do `app-host`. A migration 056
// virou um índice único PARCIAL (só `origem = 'automatico'`) depois de uma correção de
// escopo — a versão original (UNIQUE de tabela envolvendo todos os `origem`) bloqueava
// também lançamentos manuais duplicados, o que nunca foi um problema real e podia travar
// um caso de uso legítimo (ex.: dois adiantamentos manuais na mesma competência).
function criarBancoDeTeste(): Database.Database {
  const db = new Database(':memory:')
  db.pragma('foreign_keys = OFF')
  db.exec(`
    CREATE TABLE folha_competencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      competencia TEXT NOT NULL,
      status TEXT DEFAULT 'aberta',
      total_proventos REAL DEFAULT 0,
      total_descontos REAL DEFAULT 0,
      total_liquido REAL DEFAULT 0,
      total_inss REAL DEFAULT 0,
      total_fgts REAL DEFAULT 0,
      total_irrf REAL DEFAULT 0,
      observacao TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Mesmo shape pos-migration 056 (indice unico parcial, so sobre origem = 'automatico').
    CREATE TABLE folha_lancamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folha_id INTEGER NOT NULL,
      funcionario_id INTEGER NOT NULL,
      empresa_id INTEGER NOT NULL,
      rubrica_id INTEGER,
      rubrica_codigo TEXT NOT NULL,
      rubrica_nome TEXT NOT NULL,
      rubrica_tipo TEXT NOT NULL,
      referencia REAL DEFAULT 0,
      valor REAL NOT NULL DEFAULT 0,
      origem TEXT DEFAULT 'manual',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE UNIQUE INDEX idx_folha_lancamentos_automatico_unico
    ON folha_lancamentos(folha_id, funcionario_id, rubrica_codigo, origem)
    WHERE origem = 'automatico';

    CREATE TABLE folha_holerites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folha_id INTEGER NOT NULL,
      funcionario_id INTEGER NOT NULL,
      empresa_id INTEGER NOT NULL,
      total_proventos REAL DEFAULT 0,
      total_descontos REAL DEFAULT 0,
      valor_liquido REAL DEFAULT 0,
      base_inss REAL DEFAULT 0,
      valor_inss REAL DEFAULT 0,
      base_irrf REAL DEFAULT 0,
      valor_irrf REAL DEFAULT 0,
      valor_fgts REAL DEFAULT 0,
      status TEXT DEFAULT 'calculado',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(folha_id, funcionario_id)
    );
  `)
  return db
}

const FOLHA_ID = 1
const FUNCIONARIO_ID = 1
const EMPRESA_ID = 1

describe('REC-0004: recálculo de folha — transação e idempotência', () => {
  let db: Database.Database
  let repo: SqliteFolhaRepository

  beforeEach(() => {
    db = criarBancoDeTeste()
    repo = new SqliteFolhaRepository(db)
    db.prepare(
      `INSERT INTO folha_competencias (id, empresa_id, competencia) VALUES (?, ?, ?)`,
    ).run(FOLHA_ID, EMPRESA_ID, '2026-01')
    // Lançamento manual (ex.: salário base do LancamentosEditor) — deve sobreviver a
    // qualquer número de recálculos.
    repo.addLancamento({
      folha_id: FOLHA_ID, funcionario_id: FUNCIONARIO_ID, empresa_id: EMPRESA_ID,
      rubrica_codigo: '0001', rubrica_nome: 'Salário Base', rubrica_tipo: 'provento',
      valor: 3000, origem: 'manual',
    })
  })

  it('rollback completo: falha entre delete e insert dos automáticos não deixa holerite com totais novos e lançamentos com os antigos', () => {
    // Estado de um cálculo anterior bem-sucedido: holerite com totais antigos + 1
    // automático de INSS antigo.
    repo.upsertHolerite({
      folha_id: FOLHA_ID, funcionario_id: FUNCIONARIO_ID, empresa_id: EMPRESA_ID,
      total_proventos: 3000, total_descontos: 200, valor_liquido: 2800,
      base_inss: 3000, valor_inss: 200, base_irrf: 2800, valor_irrf: 0, valor_fgts: 240,
      status: 'calculado',
    })
    repo.addLancamento({
      folha_id: FOLHA_ID, funcionario_id: FUNCIONARIO_ID, empresa_id: EMPRESA_ID,
      rubrica_codigo: '0100', rubrica_nome: 'INSS', rubrica_tipo: 'desconto',
      valor: 200, origem: 'automatico',
    })

    // Simula uma falha no meio do recálculo — sem tocar em folhaHandlers.ts: só o
    // callback passado a `runInTransaction` (o mesmo helper usado em produção) lança a
    // exceção depois do upsert e do delete, mas antes do insert do automático novo.
    expect(() => {
      runInTransaction(db, () => {
        repo.upsertHolerite({
          folha_id: FOLHA_ID, funcionario_id: FUNCIONARIO_ID, empresa_id: EMPRESA_ID,
          total_proventos: 3000, total_descontos: 350, valor_liquido: 2650,
          base_inss: 3000, valor_inss: 350, base_irrf: 2650, valor_irrf: 0, valor_fgts: 240,
          status: 'calculado',
        })
        repo.deleteLancamentosAutomaticos(FOLHA_ID, FUNCIONARIO_ID)
        throw new Error('falha simulada entre delete e insert dos automáticos')
      })
    }).toThrow('falha simulada')

    // Holerite deve continuar com os totais ANTIGOS (rollback do upsert).
    const holerite = repo.getHolerite(FOLHA_ID, FUNCIONARIO_ID)!
    expect(holerite.total_descontos).toBe(200)
    expect(holerite.valor_liquido).toBe(2800)

    // O automático antigo deve continuar existindo (rollback do delete).
    const automaticos = repo.listLancamentos(FOLHA_ID, FUNCIONARIO_ID).filter((l) => l.origem === 'automatico')
    expect(automaticos).toHaveLength(1)
    expect(automaticos[0].valor).toBe(200)

    // O manual não deve ter sido tocado em nenhum momento.
    const manuais = repo.listLancamentos(FOLHA_ID, FUNCIONARIO_ID).filter((l) => l.origem === 'manual')
    expect(manuais).toHaveLength(1)
    expect(manuais[0].valor).toBe(3000)
  })

  it('idempotência: rodar o mesmo ciclo upsert+delete+insert duas vezes não duplica automáticos e preserva o manual', () => {
    function rodarCicloDeCalculo(valorInss: number): void {
      runInTransaction(db, () => {
        repo.upsertHolerite({
          folha_id: FOLHA_ID, funcionario_id: FUNCIONARIO_ID, empresa_id: EMPRESA_ID,
          total_proventos: 3000, total_descontos: valorInss, valor_liquido: 3000 - valorInss,
          base_inss: 3000, valor_inss: valorInss, base_irrf: 3000 - valorInss, valor_irrf: 0, valor_fgts: 240,
          status: 'calculado',
        })
        repo.deleteLancamentosAutomaticos(FOLHA_ID, FUNCIONARIO_ID)
        repo.addLancamento({
          folha_id: FOLHA_ID, funcionario_id: FUNCIONARIO_ID, empresa_id: EMPRESA_ID,
          rubrica_codigo: '0100', rubrica_nome: 'INSS', rubrica_tipo: 'desconto',
          valor: valorInss, origem: 'automatico',
        })
      })
    }

    rodarCicloDeCalculo(200)
    rodarCicloDeCalculo(200) // recálculo idêntico (ex.: segundo clique em "Calcular")

    const todos = repo.listLancamentos(FOLHA_ID, FUNCIONARIO_ID)
    const automaticos = todos.filter((l) => l.origem === 'automatico')
    const manuais = todos.filter((l) => l.origem === 'manual')

    expect(automaticos).toHaveLength(1) // não duplicou
    expect(automaticos[0].valor).toBe(200)
    expect(manuais).toHaveLength(1) // sobreviveu intacto
    expect(manuais[0].valor).toBe(3000)

    const holerite = repo.getHolerite(FOLHA_ID, FUNCIONARIO_ID)!
    expect(holerite.total_descontos).toBe(200)
  })

  it('o índice único parcial rejeita duas linhas automáticas iguais inseridas fora do fluxo de delete-então-insert', () => {
    repo.addLancamento({
      folha_id: FOLHA_ID, funcionario_id: FUNCIONARIO_ID, empresa_id: EMPRESA_ID,
      rubrica_codigo: '0100', rubrica_nome: 'INSS', rubrica_tipo: 'desconto',
      valor: 200, origem: 'automatico',
    })
    expect(() => {
      repo.addLancamento({
        folha_id: FOLHA_ID, funcionario_id: FUNCIONARIO_ID, empresa_id: EMPRESA_ID,
        rubrica_codigo: '0100', rubrica_nome: 'INSS', rubrica_tipo: 'desconto',
        valor: 250, origem: 'automatico',
      })
    }).toThrow(/UNIQUE constraint failed/)
  })

  it('lançamentos MANUAIS com a mesma rubrica na mesma folha+funcionário continuam permitidos (sem regressão)', () => {
    // Ex.: dois adiantamentos manuais na mesma competência, mesma rubrica — caso de uso
    // legítimo que a versão original (UNIQUE de tabela, corrigida nesta ação) bloquearia
    // por engano. O `beforeEach` já insere 1 manual de rubrica '0001'; este teste adiciona
    // um segundo com a mesma rubrica.
    expect(() => {
      repo.addLancamento({
        folha_id: FOLHA_ID, funcionario_id: FUNCIONARIO_ID, empresa_id: EMPRESA_ID,
        rubrica_codigo: '0001', rubrica_nome: 'Adiantamento', rubrica_tipo: 'provento',
        valor: 500, origem: 'manual',
      })
    }).not.toThrow()

    const manuais = repo.listLancamentos(FOLHA_ID, FUNCIONARIO_ID).filter((l) => l.origem === 'manual')
    expect(manuais).toHaveLength(2)
  })
})
