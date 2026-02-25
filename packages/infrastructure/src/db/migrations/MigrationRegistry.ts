// packages/infrastructure/src/db/migrations/MigrationRegistry.ts
export type Migration = {
  id: string;          // imutável (ex.: "001_init")
  filename: string;    // arquivo .sql correspondente
};

export const MIGRATIONS: Migration[] = [
  { id: "001_init", filename: "001_init.sql" },
  { id: "002_auth_rbac", filename: "002_auth_rbac.sql" },
  { id: "003_rubricas", filename: "003_rubricas.sql" },
  { id: "004_folha", filename: "004_folha.sql" },
  { id: "005_ferias", filename: "005_ferias.sql" },
  { id: "006_rescisao", filename: "006_rescisao.sql" },
  { id: "007_extras", filename: "007_extras.sql" },
  { id: "008_ponto", filename: "008_ponto.sql" },
  { id: "009_audit_logs", filename: "009_audit_logs.sql" },
  { id: "010_pdf_exports", filename: "010_pdf_exports.sql" },
];