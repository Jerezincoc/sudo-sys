/**
 * database.ts
 * Singleton SQLite — abre a conexão uma vez e roda as migrations ao inicializar.
 */
import BetterSqlite3 from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'

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

  console.log('[db] SQLite inicializado em', dbPath)
}

export function getDb(): BetterSqlite3.Database {
  if (!_db) throw new Error('Database não inicializado. Chame initDatabase() primeiro.')
  return _db
}
