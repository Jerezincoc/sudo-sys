import Database from "better-sqlite3";

export type SqliteConnection = Database.Database;

export function openDatabase(dbFilePath: string): SqliteConnection {
  const db = new Database(dbFilePath);

  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");

  return db;
}