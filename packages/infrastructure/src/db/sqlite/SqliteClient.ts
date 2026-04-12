// packages/infrastructure/src/db/sqlite/SqliteClient.ts

export interface SqliteClient {
  run(sql: string, params?: any[]): void;
  get<T = any>(sql: string, params?: any[]): T | undefined;
  all<T = any>(sql: string, params?: any[]): T[];
}
