// ─────────────────────────────────────────────
//  Tipos de Funcionário (compartilhados main ↔ renderer)
// ─────────────────────────────────────────────

export interface Funcionario {
  id: number
  empresa_id: number
  codigo: string
  nome: string
  cpf: string
  rg?: string | null
  data_nascimento?: string | null
  sexo?: string | null
  estado_civil?: string | null
  escolaridade?: string | null
  cargo?: string | null
  departamento?: string | null
  data_admissao: string
  data_demissao?: string | null
  tipo_contrato?: string | null
  salario_base: number
  carga_horaria?: number | null
  periculosidade?: number | null
  insalubridade?: string | null
  vale_transporte?: number | null
  vale_refeicao?: number | null
  plano_saude?: number | null
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  uf?: string | null
  telefone?: string | null
  email?: string | null
  banco?: string | null
  agencia?: string | null
  conta?: string | null
  pis_pasep?: string | null
  ctps?: string | null
  status: 'ativo' | 'inativo' | 'demitido'
  created_at: string
  updated_at: string
}

export type CreateFuncionarioPayload = Omit<Funcionario, 'id' | 'created_at' | 'updated_at'>
export type UpdateFuncionarioPayload = { id: number } & Partial<Omit<Funcionario, 'id' | 'created_at' | 'updated_at'>>
