// packages/infrastructure/src/db/migrations/MigrationRunner.ts
import fs from "node:fs";
import path from "node:path";
import type sqlite3 from "sqlite3";
import { MIGRATIONS } from "./MigrationRegistry";

export type RunMigrationsOptions = {
  schemaDir: string; // caminho absoluto até a pasta dos .sql
};

function exec(db: sqlite3.Database, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });
}

function all<T = unknown>(db: sqlite3.Database, sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params as any, (err, rows) => (err ? reject(err) : resolve(rows as T[])));
  });
}

function run(db: sqlite3.Database, sql: string, params: unknown[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params as any, (err) => (err ? reject(err) : resolve()));
  });
}

/**
 * Roda migrações pendentes de forma transacional.
 * Observação: sqlite3 é assíncrono; por isso esta função retorna Promise.
 */
export async function runMigrations(
  db: sqlite3.Database,
  options: RunMigrationsOptions
): Promise<void> {
  // tabela de controle
  await exec(
    db,
    `
    CREATE TABLE IF NOT EXISTS __migrations (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `
  );

  const rows = await all<{ id: string }>(db, `SELECT id FROM __migrations`);
  const applied = new Set(rows.map((r) => r.id));

  const pending = MIGRATIONS.filter((m) => !applied.has(m.id));
  if (pending.length === 0) return;

  // transação manual
  await exec(db, "BEGIN IMMEDIATE TRANSACTION;");
  try {
    for (const m of pending) {
      const filePath = path.join(options.schemaDir, m.filename);
      const sql = fs.readFileSync(filePath, "utf-8");

      await exec(db, sql);

      await run(
        db,
        `
        INSERT INTO __migrations (id, filename, applied_at)
        VALUES (?, ?, datetime('now'))
      `,
        [m.id, m.filename]
      );
    }

    await exec(db, "COMMIT;");
  } catch (err) {
    try {
      await exec(db, "ROLLBACK;");
    } catch {
      // ignore rollback error
    }
    throw err;
  }
}