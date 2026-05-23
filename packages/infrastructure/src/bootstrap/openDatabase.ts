import { SqliteClient } from '../db/sqlite/SqliteClient'
import path from 'path'
import fs from 'fs'

export function openSqliteDatabase(userDataPath: string): SqliteClient {
  const dbDir = path.join(userDataPath, 'banco')
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  const dbPath = path.join(dbDir, 'sudosys.db')
  return new SqliteClient(dbPath)
}
