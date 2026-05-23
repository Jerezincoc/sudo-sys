// ─────────────────────────────────────────────
//  Tipos do Setup Wizard
// ─────────────────────────────────────────────

export type DbType = 'sqlite' | 'postgres'

export interface DbConfig {
  type: DbType
  connectionString?: string   // só para postgres
}

export interface EmpresaConfig {
  razaoSocial: string
  cnpj: string
  endereco: string
  responsavel: string
}

export interface AppConfig {
  initialized: boolean
  version: string
  database: DbConfig
  empresa: EmpresaConfig
}

export interface TestDbPayload {
  type: DbType
  connectionString?: string
}

export interface TestDbResult {
  success: boolean
  latencyMs?: number
  error?: string
}

export interface SaveConfigPayload {
  database: DbConfig
  empresa: EmpresaConfig
}
