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
    name: '031_rubricas',
    sql: `CREATE TABLE IF NOT EXISTS rubricas (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id    INTEGER REFERENCES empresas(id),
      codigo        TEXT NOT NULL,
      nome          TEXT NOT NULL,
      tipo          TEXT NOT NULL DEFAULT 'provento',
      natureza      TEXT DEFAULT 'normal',
      incide_inss   INTEGER DEFAULT 1,
      incide_irrf   INTEGER DEFAULT 1,
      incide_fgts   INTEGER DEFAULT 1,
      modo_valor    TEXT DEFAULT 'fixo',
      valor_fixo    REAL,
      percentual    REAL,
      formula       TEXT,
      referencia    TEXT,
      observacao    TEXT,
      ativo         INTEGER DEFAULT 1,
      created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at    TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(empresa_id, codigo)
    )`,
  },
  {
    name: '031b_rubricas_seed',
    sql: `INSERT OR IGNORE INTO rubricas
      (empresa_id, codigo, nome, tipo, natureza, incide_inss, incide_irrf, incide_fgts, modo_valor, percentual, ativo)
    VALUES
      (NULL, '0001', 'Salário Base',           'provento',    'normal',    1, 1, 1, 'fixo',       NULL, 1),
      (NULL, '0002', 'Horas Extras 50%',        'provento',    'normal',    1, 1, 1, 'percentual', 50,   1),
      (NULL, '0003', 'Horas Extras 100%',       'provento',    'normal',    1, 1, 1, 'percentual', 100,  1),
      (NULL, '0004', 'Adicional Noturno',       'provento',    'normal',    1, 1, 1, 'percentual', 20,   1),
      (NULL, '0005', 'Periculosidade',          'provento',    'normal',    1, 1, 1, 'percentual', 30,   1),
      (NULL, '0006', 'Insalubridade Mínima',    'provento',    'normal',    1, 1, 1, 'percentual', 10,   1),
      (NULL, '0007', 'Insalubridade Média',     'provento',    'normal',    1, 1, 1, 'percentual', 20,   1),
      (NULL, '0008', 'Insalubridade Máxima',    'provento',    'normal',    1, 1, 1, 'percentual', 40,   1),
      (NULL, '0009', 'Vale Transporte',         'desconto',    'normal',    0, 0, 0, 'percentual', 6,    1),
      (NULL, '0010', 'INSS',                    'desconto',    'normal',    0, 0, 0, 'formula',    NULL, 1),
      (NULL, '0011', 'IRRF',                    'desconto',    'normal',    0, 0, 0, 'formula',    NULL, 1),
      (NULL, '0012', 'FGTS',                    'informativo', 'normal',    0, 0, 1, 'percentual', 8,    1),
      (NULL, '0013', 'Adiantamento Salarial',   'desconto',    'normal',    0, 0, 0, 'percentual', 40,   1),
      (NULL, '0014', 'Férias',                  'provento',    'ferias',    1, 1, 1, 'formula',    NULL, 1),
      (NULL, '0015', '1/3 Constitucional',      'provento',    'ferias',    1, 1, 1, 'formula',    NULL, 1),
      (NULL, '0016', '13° Salário',             'provento',    'normal',    1, 1, 1, 'formula',    NULL, 1),
      (NULL, '0017', 'Desconto Faltas',         'desconto',    'normal',    0, 0, 0, 'formula',    NULL, 1),
      (NULL, '0018', 'Plano de Saúde',          'desconto',    'normal',    0, 0, 0, 'fixo',       NULL, 1),
      (NULL, '0019', 'Vale Refeição',           'provento',    'normal',    0, 0, 0, 'fixo',       NULL, 1),
      (NULL, '0020', 'Comissão',                'provento',    'normal',    1, 1, 1, 'percentual', NULL, 1)
    `,
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
    name: '041_cbo',
    sql: `CREATE TABLE IF NOT EXISTS cbo (
      codigo    TEXT PRIMARY KEY,
      descricao TEXT NOT NULL
    )`,
  },
  {
    name: '032_ferias',
    sql: `CREATE TABLE IF NOT EXISTS ferias (
      id                         INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id             INTEGER NOT NULL REFERENCES funcionarios(id),
      empresa_id                 INTEGER NOT NULL REFERENCES empresas(id),
      periodo_aquisitivo_inicio  TEXT NOT NULL,
      periodo_aquisitivo_fim     TEXT NOT NULL,
      data_inicio_gozo           TEXT NOT NULL,
      data_fim_gozo              TEXT NOT NULL,
      dias_direito               INTEGER NOT NULL DEFAULT 30,
      dias_concedidos            INTEGER NOT NULL DEFAULT 30,
      dias_abono                 INTEGER DEFAULT 0,
      adiantamento_13            INTEGER DEFAULT 0,
      salario_referencia         REAL NOT NULL DEFAULT 0,
      valor_ferias               REAL,
      valor_abono                REAL,
      valor_total                REAL,
      status                     TEXT DEFAULT 'agendada',
      observacao                 TEXT,
      created_at                 TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at                 TEXT DEFAULT CURRENT_TIMESTAMP
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
