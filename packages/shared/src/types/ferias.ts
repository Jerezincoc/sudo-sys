export interface Ferias {
  id: number
  funcionario_id: number
  empresa_id: number
  periodo_aquisitivo_inicio: string
  periodo_aquisitivo_fim: string
  data_inicio_gozo: string
  data_fim_gozo: string
  dias_direito: number
  dias_concedidos: number
  dias_abono?: number | null
  adiantamento_13?: number | null
  salario_referencia: number
  valor_ferias?: number | null
  valor_abono?: number | null
  valor_total?: number | null
  status: 'agendada' | 'aprovada' | 'paga' | 'cancelada'
  observacao?: string | null
  created_at: string
  updated_at: string
}

export type CreateFeriasPayload = Omit<Ferias, 'id' | 'created_at' | 'updated_at'>
export type UpdateFeriasPayload = { id: number } & Partial<Omit<Ferias, 'id' | 'created_at' | 'updated_at'>>
