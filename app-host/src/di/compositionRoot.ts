import type Database from "better-sqlite3";

import type { BancoPaths } from "../../../packages/infrastructure/src/bootstrap/ensureBancoFolder";
import { ensureBancoFolderStructure } from "../../../packages/infrastructure/src/bootstrap/ensureBancoFolder";
import { openDatabase } from "../../../packages/infrastructure/src/bootstrap/openDatabase";
import { runMigrations } from "../../../packages/infrastructure/src/bootstrap/runMigrations";

export type AppServices = {
  banco: BancoPaths;
  db: Database.Database;
};

let singleton: AppServices | null = null;

/**
 * Composition Root do SUDO SYS
 * - Cria ./BANCO/
 * - Abre SQLite
 * - Roda migrações
 * - Retorna serviços (singleton)
 */
export function getAppServices(): AppServices {
  if (singleton) return singleton;

  const banco = ensureBancoFolderStructure();
  const db = openDatabase(banco.dbFile);

  runMigrations(db);

  singleton = { banco, db };
  return singleton;
}

export function shutdownAppServices(): void {
  if (!singleton) return;

  try {
    singleton.db.close();
  } finally {
    singleton = null;
  }
}