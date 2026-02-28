import sqlite3 from "sqlite3";
import path from "path";

export function openDatabase(dbPath: string) {
  const resolvedPath = path.resolve(dbPath);

  const db = new sqlite3.Database(resolvedPath, (err: Error | null) => {
    if (err) {
      console.error("Erro ao abrir banco:", err);
      throw err;
    }
  });

  return db;
}