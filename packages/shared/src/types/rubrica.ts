export interface Rubrica {
  id: number
  empresa_id: number | null
  codigo: string
  nome: string
  tipo: 'provento' | 'desconto' | 'informativo'
  modo_valor: 'fixo' | 'percentual' | 'formula'
  valor: number
  percentual: number
  formula: string | null
  incide_inss: number
  incide_irrf: number
  incide_fgts: number
  incide_ferias: number
  incide_13: number
  numero?: string | null
  fator?: 'valor' | 'percentual' | 'horas' | 'dias' | null
  esocial_rubrica?: string | null
  media_ferias?: number | null
  media_decimo?: number | null
  media_aviso?: number | null
  media_rescisao?: number | null
  ativo: number
  created_at: string
  updated_at: string
}

export type CreateRubricaPayload = Omit<Rubrica, 'id' | 'created_at' | 'updated_at'>
export type UpdateRubricaPayload = { id: number } & Partial<Omit<Rubrica, 'id' | 'created_at' | 'updated_at'>>
