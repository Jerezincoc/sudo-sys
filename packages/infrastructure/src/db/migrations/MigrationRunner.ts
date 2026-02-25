// packages/infrastructure/src/db/migrations/MigrationRunner.ts
import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";
import { MIGRATIONS } from "./MigrationRegistry";

export type RunMigrationsOptions = {
  schemaDir: string; // caminho absoluto até a pasta dos .sql
};

/**
 * Roda migrações pendentes de forma transacional.
 */
export function runMigrations(
  db: Database.Database,
  options: RunMigrationsOptions
): void {
  // tabela de controle
  db.exec(`
    CREATE TABLE IF NOT EXISTS __migrations (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set<string>();
  const rows = db.prepare(`SELECT id FROM __migrations`).all() as Array<{ id: string }>;
  for (const r of rows) applied.add(r.id);

  const pending = MIGRATIONS.filter(m => !applied.has(m.id));
  if (pending.length === 0) return;

  const tx = db.transaction(() => {
    for (const m of pending) {
      const filePath = path.join(options.schemaDir, m.filename);
      const sql = fs.readFileSync(filePath, "utf-8");

      db.exec(sql);

      db.prepare(`
        INSERT INTO __migrations (id, filename, applied_at)
        VALUES (?, ?, datetime('now'))
      `).run(m.id, m.filename);
    }
  });

  tx();
}