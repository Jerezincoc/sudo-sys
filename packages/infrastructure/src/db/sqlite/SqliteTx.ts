import type { Database } from 'better-sqlite3'

export function runInTransaction<T>(db: Database, fn: () => T): T {
  return db.transaction(fn)()
}
