// app-host/src/di/compositionRoot.ts
import type sqlite3 from "sqlite3";
import path from "node:path";

import type { BancoPaths } from "@sudo/infrastructure";
import { ensureBancoFolderStructure, openDatabase, runMigrations } from "@sudo/infrastructure";

export type AppServices = {
  banco: BancoPaths;
  db: sqlite3.Database;
};

let singleton: AppServices | undefined;
let initializing: Promise<AppServices> | undefined;

function resolveRepoRootFromCwd(): string {
  const cwd = process.cwd();

  // Se o Electron foi iniciado a partir de /app-host, volta pra raiz do monorepo
  if (path.basename(cwd) === "app-host") {
    return path.resolve(cwd, "..");
  }

  return cwd;
}

function resolveSchemaDir(): string {
  const isProd = process.env.NODE_ENV === "production";

  // PROD (Electron empacotado): schema copiado como recurso do app
  if (isProd) {
    return path.join(process.resourcesPath, "schema");
  }

  // DEV: usa os .sql direto do repo (raiz do monorepo)
  const repoRoot = resolveRepoRootFromCwd();
  return path.join(repoRoot, "packages", "infrastructure", "src", "db", "schema");
}

// Helper: sqlite3.Database.close é callback-based
function closeDb(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => (err ? reject(err) : resolve()));
  });
}

export async function getAppServices(): Promise<AppServices> {
  if (singleton) return singleton;
  if (initializing) return initializing;

  initializing = (async () => {
    const banco = ensureBancoFolderStructure();

    const db = await openDatabase(banco.dbFile);

    const schemaDir = resolveSchemaDir();
    await runMigrations(db, schemaDir);

    singleton = { banco, db };
    return singleton;
  })();

  try {
    return await initializing;
  } finally {
    initializing = undefined;
  }
}

export async function shutdownAppServices(): Promise<void> {
  if (!singleton) return;

  const { db } = singleton;
  singleton = undefined;

  await closeDb(db);
}