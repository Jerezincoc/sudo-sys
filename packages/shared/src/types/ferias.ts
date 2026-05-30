export interface Ferias {
  id: number
  funcionario_id: number
  empresa_id: number
  periodo_inicio: string
  periodo_fim: string
  inicio_gozo: string
  fim_gozo: string
  dias_concedidos: number
  dias_abono: number
  adiantamento_13: number
  salario_referencia: number
  valor_ferias: number
  valor_abono: number
  valor_adiantamento_13: number
  valor_total: number
  status: 'agendada' | 'aprovada' | 'paga' | 'cancelada'
  observacao: string | null
  created_at: string
  updated_at: string
}

export type CreateFeriasPayload = Omit<Ferias, 'id' | 'created_at' | 'updated_at'>
export type UpdateFeriasPayload = { id: number } & Partial<Omit<Ferias, 'id' | 'created_at' | 'updated_at'>>
