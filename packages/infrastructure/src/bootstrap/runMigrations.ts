// packages/infrastructure/src/bootstrap/runMigrations.ts
import type sqlite3 from "sqlite3";
import { runMigrations as run } from "../db/migrations/MigrationRunner";

/**
 * Infrastructure NÃO deve depender de Electron (process.resourcesPath).
 * O schemaDir deve ser resolvido no app-host (Electron main) e passado pra cá.
 */
export async function runMigrations(db: sqlite3.Database, schemaDir: string): Promise<void> {
  await run(db, { schemaDir });
}