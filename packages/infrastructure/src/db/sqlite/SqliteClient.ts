import Database from 'better-sqlite3'
import type { Database as DB } from 'better-sqlite3'

export class SqliteClient {
  private db: DB

  constructor(dbPath: string) {
    this.db = new Database(dbPath)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
  }

  get raw(): DB { return this.db }

  close(): void { this.db.close() }
}
