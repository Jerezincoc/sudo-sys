// packages/infrastructure/src/index.ts
export type { BancoPaths } from "./bootstrap/ensureBancoFolder";
export { ensureBancoFolderStructure } from "./bootstrap/ensureBancoFolder";

export { openDatabase } from "./bootstrap/openDatabase";
export { runMigrations } from "./bootstrap/runMigrations";

// Repositories
export { SqliteFuncionarioRepository } from "./repositories/SqliteFuncionarioRepository";
export { SqliteUsuarioRepository } from "./repositories/SqliteUsuarioRepository";
export { SqliteChamadoRepository } from "./repositories/SqliteChamadoRepository";

// Hasher
export { BcryptPasswordHasher } from "./hash/BcryptPasswordHasher";