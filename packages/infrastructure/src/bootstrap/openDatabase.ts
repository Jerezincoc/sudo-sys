// packages/infrastructure/src/bootstrap/openDatabase.ts
import sqlite3 from "sqlite3";
import path from "path";

export async function openDatabase(dbPath: string): Promise<sqlite3.Database> {
  const resolvedPath = path.resolve(dbPath);

  const db = await new Promise<sqlite3.Database>((resolve, reject) => {
    const instance = new sqlite3.Database(resolvedPath, (err) => {
      if (err) {
        console.error("Erro ao abrir banco:", err);
        reject(err);
        return;
      }
      resolve(instance);
    });
  });

  // PRAGMAs recomendados para desktop offline
  await exec(db, "PRAGMA foreign_keys = ON;");
  await exec(db, "PRAGMA busy_timeout = 5000;");
  await exec(db, "PRAGMA journal_mode = WAL;");

  return db;
}

function exec(db: sqlite3.Database, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}