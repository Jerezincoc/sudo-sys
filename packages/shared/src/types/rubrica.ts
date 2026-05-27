export interface Rubrica {
  id: number
  empresa_id?: number | null
  codigo: string
  nome: string
  tipo: 'provento' | 'desconto' | 'informativo'
  natureza?: string | null
  incide_inss?: number | null
  incide_irrf?: number | null
  incide_fgts?: number | null
  modo_valor?: 'fixo' | 'percentual' | 'formula' | null
  valor_fixo?: number | null
  percentual?: number | null
  formula?: string | null
  referencia?: string | null
  observacao?: string | null
  ativo: number
  created_at: string
  updated_at: string
}

export type CreateRubricaPayload = Omit<Rubrica, 'id' | 'created_at' | 'updated_at'>
export type UpdateRubricaPayload = { id: number } & Partial<Omit<Rubrica, 'id' | 'created_at' | 'updated_at'>>
