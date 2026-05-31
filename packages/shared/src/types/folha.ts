export interface FolhaCompetencia {
  id: number
  empresa_id: number
  competencia: string
  status: 'aberta' | 'processada' | 'fechada' | 'cancelada'
  total_proventos: number
  total_descontos: number
  total_liquido: number
  total_inss: number
  total_fgts: number
  total_irrf: number
  observacao?: string | null
  created_at: string
  updated_at: string
}

export interface FolhaLancamento {
  id: number
  folha_id: number
  funcionario_id: number
  empresa_id: number
  rubrica_id?: number | null
  rubrica_codigo: string
  rubrica_nome: string
  rubrica_tipo: 'provento' | 'desconto' | 'informativo'
  referencia: number
  valor: number
  origem: 'manual' | 'automatico' | 'importado'
  created_at: string
  updated_at: string
}

export interface FolhaHolerite {
  id: number
  folha_id: number
  funcionario_id: number
  empresa_id: number
  total_proventos: number
  total_descontos: number
  valor_liquido: number
  base_inss: number
  valor_inss: number
  base_irrf: number
  valor_irrf: number
  valor_fgts: number
  status: 'calculado' | 'pago' | 'cancelado'
  created_at: string
  updated_at: string
}

export type CreateFolhaPayload = Omit<FolhaCompetencia, 'id' | 'created_at' | 'updated_at' | 'total_proventos' | 'total_descontos' | 'total_liquido' | 'total_inss' | 'total_fgts' | 'total_irrf'>
export type CreateLancamentoPayload = Omit<FolhaLancamento, 'id' | 'created_at' | 'updated_at'>
