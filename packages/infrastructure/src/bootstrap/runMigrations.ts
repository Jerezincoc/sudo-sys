import path from "node:path";
import type Database from "better-sqlite3";
import { runMigrations as run } from "../db/migrations/MigrationRunner";

function resolveSchemaDir(): string {
  const isProd = process.env.NODE_ENV === "production";

  // PROD (empacotado): schema copiado como recurso do app
  if (isProd) {
    return path.join(process.resourcesPath, "schema");
  }

  // DEV: usa os .sql direto do repo
  return path.join(process.cwd(), "packages", "infrastructure", "src", "db", "schema");
}

export function runMigrations(db: Database.Database): void {
  run(db, { schemaDir: resolveSchemaDir() });
}