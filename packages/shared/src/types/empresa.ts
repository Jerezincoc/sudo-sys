// ─────────────────────────────────────────────
//  Tipos de Empresa (compartilhados main ↔ renderer)
// ─────────────────────────────────────────────

export interface Empresa {
  id: number
  codigo: string
  razao_social: string
  nome_fantasia?: string | null
  cnpj: string
  inscricao_estadual?: string | null
  inscricao_municipal?: string | null
  cnae_principal?: string | null
  natureza_juridica?: string | null
  data_abertura?: string | null
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  uf?: string | null
  telefone?: string | null
  email?: string | null
  site?: string | null
  responsavel?: string | null
  cargo_responsavel?: string | null
  regime_tributario?: string | null
  fpas?: string | null
  codigo_gps?: string | null
  aliquota_rat?: number | null
  fap?: number | null
  lotacao_tributaria?: string | null
  grau_risco?: number | null
  status: 'ativa' | 'inativa'
  created_at: string
  updated_at: string
}

export type CreateEmpresaPayload = Omit<Empresa, 'id' | 'created_at' | 'updated_at'>
export type UpdateEmpresaPayload = { id: number } & Partial<Omit<Empresa, 'id' | 'created_at' | 'updated_at'>>
