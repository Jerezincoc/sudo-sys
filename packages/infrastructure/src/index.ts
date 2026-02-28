// packages/infrastructure/src/index.ts
export type { BancoPaths } from "./bootstrap/ensureBancoFolder";
export { ensureBancoFolderStructure } from "./bootstrap/ensureBancoFolder";

export { openDatabase } from "./bootstrap/openDatabase";
export { runMigrations } from "./bootstrap/runMigrations";