/**
 * database.ts
 * Singleton SQLite — abre a conexão uma vez e roda as migrations ao inicializar.
 */
import BetterSqlite3 from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { runCboSeed } from './migrations/023_cbo_completo'

let _db: BetterSqlite3.Database | null = null

// ── Migrations inline (idempotentes) ──────────────────────────────────────
const MIGRATIONS: { name: string; sql: string }[] = [
  {
    name: '001_migrations_table',
    sql: `CREATE TABLE IF NOT EXISTS _migrations (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      ran_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: '011_empresas',
    sql: `CREATE TABLE IF NOT EXISTS empresas (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo             TEXT UNIQUE NOT NULL,
      razao_social       TEXT NOT NULL,
      nome_fantasia      TEXT,
      cnpj               TEXT UNIQUE NOT NULL,
      inscricao_estadual TEXT,
      inscricao_municipal TEXT,
      cnae_principal     TEXT,
      natureza_juridica  TEXT,
      data_abertura      TEXT,
      cep                TEXT,
      logradouro         TEXT,
      numero             TEXT,
      complemento        TEXT,
      bairro             TEXT,
      cidade             TEXT,
      uf                 TEXT,
      telefone           TEXT,
      email              TEXT,
      site               TEXT,
      responsavel        TEXT,
      cargo_responsavel  TEXT,
      regime_tributario  TEXT,
      fpas               TEXT,
      codigo_gps         TEXT,
      aliquota_rat       REAL,
      fap                REAL,
      lotacao_tributaria TEXT,
      grau_risco         INTEGER,
      status             TEXT DEFAULT 'ativa',
      created_at         TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at         TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: '033_rescisao',
    sql: `CREATE TABLE IF NOT EXISTS rescisoes (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id        INTEGER NOT NULL REFERENCES funcionarios(id),
      empresa_id            INTEGER NOT NULL REFERENCES empresas(id),
      data_demissao         TEXT NOT NULL,
      motivo                TEXT NOT NULL DEFAULT 'sem_justa_causa',
      aviso_previo          TEXT DEFAULT 'trabalhado',
      data_aviso            TEXT,
      salario_referencia    REAL NOT NULL DEFAULT 0,
      dias_trabalhados      INTEGER DEFAULT 0,
      saldo_salario         REAL DEFAULT 0,
      ferias_vencidas       REAL DEFAULT 0,
      ferias_proporcionais  REAL DEFAULT 0,
      um_terco_ferias       REAL DEFAULT 0,
      decimo_terceiro       REAL DEFAULT 0,
      aviso_previo_valor    REAL DEFAULT 0,
      multa_fgts            REAL DEFAULT 0,
      outros_proventos      REAL DEFAULT 0,
      total_proventos       REAL DEFAULT 0,
      inss_rescisao         REAL DEFAULT 0,
      irrf_rescisao         REAL DEFAULT 0,
      outros_descontos      REAL DEFAULT 0,
      total_descontos       REAL DEFAULT 0,
      valor_liquido         REAL DEFAULT 0,
      status                TEXT DEFAULT 'rascunho',
      observacao            TEXT,
      created_at            TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at            TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: '021_funcionarios',
    sql: `CREATE TABLE IF NOT EXISTS funcionarios (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id        INTEGER NOT NULL REFERENCES empresas(id),
      codigo            TEXT NOT NULL,
      nome              TEXT NOT NULL,
      cpf               TEXT NOT NULL,
      rg                TEXT,
      data_nascimento   TEXT,
      sexo              TEXT,
      estado_civil      TEXT,
      escolaridade      TEXT,
      cargo             TEXT,
      departamento      TEXT,
      data_admissao     TEXT NOT NULL,
      data_demissao     TEXT,
      tipo_contrato     TEXT DEFAULT 'clt',
      salario_base      REAL NOT NULL DEFAULT 0,
      carga_horaria     REAL DEFAULT 220,
      periculosidade    INTEGER DEFAULT 0,
      insalubridade     TEXT,
      vale_transporte   INTEGER DEFAULT 0,
      vale_refeicao     REAL DEFAULT 0,
      plano_saude       REAL DEFAULT 0,
      cep               TEXT,
      logradouro        TEXT,
      numero            TEXT,
      complemento       TEXT,
      bairro            TEXT,
      cidade            TEXT,
      uf                TEXT,
      telefone          TEXT,
      email             TEXT,
      banco             TEXT,
      agencia           TEXT,
      conta             TEXT,
      pis_pasep         TEXT,
      ctps              TEXT,
      status            TEXT DEFAULT 'ativo',
      created_at        TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at        TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: '022_cbo_seed',
    sql: `CREATE TABLE IF NOT EXISTS cbo (
      codigo    TEXT PRIMARY KEY,
      descricao TEXT NOT NULL
    );
    INSERT OR IGNORE INTO cbo VALUES
      ('111105','Senador'),
      ('111110','Deputado federal'),
      ('114005','Diretor geral'),
      ('121005','Diretor administrativo'),
      ('122205','Gerente de recursos humanos'),
      ('141410','Gerente de loja'),
      ('211105','Analista de sistemas'),
      ('211110','Programador de sistemas'),
      ('212205','Analista de suporte'),
      ('225125','Médico clínico'),
      ('231105','Professor de ensino superior'),
      ('241005','Advogado'),
      ('251105','Administrador'),
      ('261505','Jornalista'),
      ('311105','Técnico de informática'),
      ('313205','Técnico em contabilidade'),
      ('351305','Agente administrativo'),
      ('351605','Auxiliar administrativo'),
      ('354205','Vendedor interno'),
      ('354210','Vendedor externo'),
      ('371105','Auxiliar de escritório'),
      ('391105','Operador de caixa'),
      ('411005','Recepcionista'),
      ('411010','Secretário'),
      ('412105','Auxiliar de pessoal'),
      ('413110','Auxiliar contábil'),
      ('414105','Almoxarife'),
      ('415105','Auxiliar de cobrança'),
      ('422105','Operador de telemarketing'),
      ('510105','Supervisor de produção'),
      ('511105','Motorista de caminhão'),
      ('511205','Motorista de ônibus'),
      ('512105','Cozinheiro'),
      ('513405','Garçom'),
      ('514210','Porteiro'),
      ('514320','Vigilante'),
      ('514325','Segurança'),
      ('516210','Auxiliar de limpeza'),
      ('516310','Cuidador de idosos'),
      ('517410','Motoboy'),
      ('519105','Auxiliar de serviços gerais'),
      ('521110','Atendente de loja'),
      ('711105','Pedreiro'),
      ('715210','Encanador'),
      ('715615','Eletricista'),
      ('716505','Pintor'),
      ('721105','Mecânico'),
      ('782510','Operador de empilhadeira'),
      ('784105','Repositor de mercadorias'),
      ('810105','Operador de máquinas')
    `,
  },
  {
    name: '022b_funcionario_cbo_campo',
    sql: `ALTER TABLE funcionarios ADD COLUMN cbo_codigo TEXT`,
  },
  {
    name: '031_rubricas',
    sql: `CREATE TABLE IF NOT EXISTS rubricas (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id    INTEGER REFERENCES empresas(id),
      codigo        TEXT NOT NULL,
      nome          TEXT NOT NULL,
      tipo          TEXT NOT NULL DEFAULT 'provento',
      modo_valor    TEXT NOT NULL DEFAULT 'fixo',
      valor         REAL DEFAULT 0,
      percentual    REAL DEFAULT 0,
      formula       TEXT,
      incide_inss   INTEGER DEFAULT 0,
      incide_irrf   INTEGER DEFAULT 0,
      incide_fgts   INTEGER DEFAULT 0,
      incide_ferias INTEGER DEFAULT 0,
      incide_13     INTEGER DEFAULT 0,
      ativo         INTEGER DEFAULT 1,
      created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at    TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: '031b_rubricas_seed',
    sql: `INSERT OR IGNORE INTO rubricas (codigo, nome, tipo, modo_valor, valor, percentual, incide_inss, incide_irrf, incide_fgts, incide_ferias, incide_13, ativo)
    VALUES
      ('0001','Salário Base','provento','fixo',0,0,1,1,1,1,1,1),
      ('0002','Horas Extras 50%','provento','percentual',0,50,1,1,1,1,1,1),
      ('0003','Horas Extras 100%','provento','percentual',0,100,1,1,1,1,1,1),
      ('0004','Adicional Noturno','provento','percentual',0,20,1,1,1,1,1,1),
      ('0005','Adicional Periculosidade','provento','percentual',0,30,1,1,1,1,1,1),
      ('0006','Adicional Insalubridade','provento','percentual',0,20,0,0,0,0,0,1),
      ('0007','Comissão','provento','fixo',0,0,1,1,1,1,1,1),
      ('0008','Gratificação','provento','fixo',0,0,1,1,1,1,1,1),
      ('0009','Adiantamento Salarial','provento','fixo',0,0,0,0,0,0,0,1),
      ('0010','Diárias de Viagem','provento','fixo',0,0,0,0,0,0,0,1),
      ('0100','INSS','desconto','percentual',0,0,0,0,0,0,0,1),
      ('0101','IRRF','desconto','percentual',0,0,0,0,0,0,0,1),
      ('0102','Vale Transporte','desconto','percentual',0,6,0,0,0,0,0,1),
      ('0103','Vale Refeição','desconto','fixo',0,0,0,0,0,0,0,1),
      ('0104','Plano de Saúde','desconto','fixo',0,0,0,0,0,0,0,1),
      ('0105','Adiantamento Salarial Desc.','desconto','fixo',0,0,0,0,0,0,0,1),
      ('0106','Falta','desconto','fixo',0,0,0,0,0,0,0,1),
      ('0107','Atraso','desconto','fixo',0,0,0,0,0,0,0,1),
      ('0200','Horas Trabalhadas','informativo','fixo',0,0,0,0,0,0,0,1),
      ('0201','Base INSS','informativo','fixo',0,0,0,0,0,0,0,1)`,
  },
  {
    name: '031c_rubricas_v2',
    sql: `
      ALTER TABLE rubricas ADD COLUMN numero TEXT;
      ALTER TABLE rubricas ADD COLUMN fator TEXT DEFAULT 'valor';
      ALTER TABLE rubricas ADD COLUMN esocial_rubrica TEXT;
      ALTER TABLE rubricas ADD COLUMN media_ferias INTEGER DEFAULT 0;
      ALTER TABLE rubricas ADD COLUMN media_decimo INTEGER DEFAULT 0;
      ALTER TABLE rubricas ADD COLUMN media_aviso INTEGER DEFAULT 0;
      ALTER TABLE rubricas ADD COLUMN media_rescisao INTEGER DEFAULT 0;
    `,
  },
  {
    name: '032_ferias',
    sql: `CREATE TABLE IF NOT EXISTS ferias (
      id                    INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id        INTEGER NOT NULL REFERENCES funcionarios(id),
      empresa_id            INTEGER NOT NULL REFERENCES empresas(id),
      periodo_inicio        TEXT NOT NULL,
      periodo_fim           TEXT NOT NULL,
      inicio_gozo           TEXT NOT NULL,
      fim_gozo              TEXT NOT NULL,
      dias_concedidos       INTEGER NOT NULL DEFAULT 30,
      dias_abono            INTEGER DEFAULT 0,
      adiantamento_13       INTEGER DEFAULT 0,
      salario_referencia    REAL DEFAULT 0,
      valor_ferias          REAL DEFAULT 0,
      valor_abono           REAL DEFAULT 0,
      valor_adiantamento_13 REAL DEFAULT 0,
      valor_total           REAL DEFAULT 0,
      status                TEXT DEFAULT 'agendada',
      observacao            TEXT,
      created_at            TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at            TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: '035_usuarios',
    sql: `CREATE TABLE IF NOT EXISTS usuarios (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      nome         TEXT NOT NULL,
      email        TEXT UNIQUE NOT NULL,
      senha_hash   TEXT NOT NULL,
      papel        TEXT DEFAULT 'operador',
      ativo        INTEGER DEFAULT 1,
      ultimo_login TEXT,
      created_at   TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at   TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: '040_ponto',
    sql: `CREATE TABLE IF NOT EXISTS registros_ponto (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id    INTEGER NOT NULL REFERENCES funcionarios(id),
      empresa_id        INTEGER NOT NULL REFERENCES empresas(id),
      data              TEXT NOT NULL,
      entrada           TEXT,
      saida_almoco      TEXT,
      retorno_almoco    TEXT,
      saida             TEXT,
      horas_trabalhadas REAL DEFAULT 0,
      horas_normais     REAL DEFAULT 0,
      horas_extras_50   REAL DEFAULT 0,
      horas_extras_100  REAL DEFAULT 0,
      horas_falta       REAL DEFAULT 0,
      tipo              TEXT DEFAULT 'normal',
      justificativa     TEXT,
      status            TEXT DEFAULT 'pendente',
      created_at        TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at        TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(funcionario_id, data)
    )`,
  },
  {
    name: '035b_usuario_admin_seed',
    sql: `INSERT OR IGNORE INTO usuarios (nome, email, senha_hash, papel)
      VALUES ('Administrador', 'admin@sudosys.local',
      '$argon2id$v=19$m=65536,t=3,p=4$placeholder', 'admin')`,
  },
  {
    name: '041_folha_competencias',
    sql: `CREATE TABLE IF NOT EXISTS folha_competencias (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id      INTEGER NOT NULL REFERENCES empresas(id),
      competencia     TEXT NOT NULL,
      status          TEXT DEFAULT 'aberta',
      total_proventos REAL DEFAULT 0,
      total_descontos REAL DEFAULT 0,
      total_liquido   REAL DEFAULT 0,
      total_inss      REAL DEFAULT 0,
      total_fgts      REAL DEFAULT 0,
      total_irrf      REAL DEFAULT 0,
      observacao      TEXT,
      created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at      TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(empresa_id, competencia)
    )`,
  },
  {
    name: '042_folha_lancamentos',
    sql: `CREATE TABLE IF NOT EXISTS folha_lancamentos (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      folha_id          INTEGER NOT NULL REFERENCES folha_competencias(id),
      funcionario_id    INTEGER NOT NULL REFERENCES funcionarios(id),
      empresa_id        INTEGER NOT NULL REFERENCES empresas(id),
      rubrica_id        INTEGER REFERENCES rubricas(id),
      rubrica_codigo    TEXT NOT NULL,
      rubrica_nome      TEXT NOT NULL,
      rubrica_tipo      TEXT NOT NULL,
      referencia        REAL DEFAULT 0,
      valor             REAL NOT NULL DEFAULT 0,
      origem            TEXT DEFAULT 'manual',
      created_at        TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at        TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  {
    name: '043_folha_holerites',
    sql: `CREATE TABLE IF NOT EXISTS folha_holerites (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      folha_id          INTEGER NOT NULL REFERENCES folha_competencias(id),
      funcionario_id    INTEGER NOT NULL REFERENCES funcionarios(id),
      empresa_id        INTEGER NOT NULL REFERENCES empresas(id),
      total_proventos   REAL DEFAULT 0,
      total_descontos   REAL DEFAULT 0,
      valor_liquido     REAL DEFAULT 0,
      base_inss         REAL DEFAULT 0,
      valor_inss        REAL DEFAULT 0,
      base_irrf         REAL DEFAULT 0,
      valor_irrf        REAL DEFAULT 0,
      valor_fgts        REAL DEFAULT 0,
      status            TEXT DEFAULT 'calculado',
      created_at        TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at        TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(folha_id, funcionario_id)
    )`,
  },
  {
    name: '051_relatorios_personalizados',
    sql: `CREATE TABLE IF NOT EXISTS relatorios_personalizados (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nome        TEXT NOT NULL,
      descricao   TEXT,
      modo        TEXT NOT NULL DEFAULT 'sintetico',
      campos      TEXT NOT NULL DEFAULT '[]',
      cabecalho   TEXT,
      empresa_id  INTEGER REFERENCES empresas(id),
      created_at  TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at  TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
  },
]

function runMigrations(db: BetterSqlite3.Database): void {
  // Garante tabela de controle
  db.exec(MIGRATIONS[0].sql)

  const check = db.prepare('SELECT id FROM _migrations WHERE name = ?')
  const insert = db.prepare('INSERT INTO _migrations (name) VALUES (?)')

  for (const { name, sql } of MIGRATIONS) {
    const exists = check.get(name)
    if (!exists) {
      db.exec(sql)
      try { insert.run(name) } catch { /* já inserido por race condition */ }
    }
  }
}

export function initDatabase(): void {
  if (_db) return   // já inicializado

  const dbDir = path.join(app.getPath('userData'), 'banco')
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

  const dbPath = path.join(dbDir, 'sudosys.db')
  _db = new BetterSqlite3(dbPath)

  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  runMigrations(_db)
  runCboSeed(_db)

  console.log('[db] SQLite inicializado em', dbPath)
}

export function getDb(): BetterSqlite3.Database {
  if (!_db) throw new Error('Database não inicializado. Chame initDatabase() primeiro.')
  return _db
}
