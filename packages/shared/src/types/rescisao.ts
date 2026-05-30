export interface Rescisao {
  id: number
  funcionario_id: number
  empresa_id: number
  data_demissao: string
  motivo: 'sem_justa_causa' | 'com_justa_causa' | 'pedido_demissao' | 'acordo_mutuo' | 'aposentadoria'
  aviso_previo?: 'trabalhado' | 'indenizado' | 'dispensado' | null
  data_aviso?: string | null
  salario_referencia: number
  dias_trabalhados?: number | null
  saldo_salario?: number | null
  ferias_vencidas?: number | null
  ferias_proporcionais?: number | null
  um_terco_ferias?: number | null
  decimo_terceiro?: number | null
  aviso_previo_valor?: number | null
  multa_fgts?: number | null
  outros_proventos?: number | null
  total_proventos?: number | null
  inss_rescisao?: number | null
  irrf_rescisao?: number | null
  outros_descontos?: number | null
  total_descontos?: number | null
  valor_liquido?: number | null
  status: 'rascunho' | 'calculada' | 'paga' | 'cancelada'
  observacao?: string | null
  created_at: string
  updated_at: string
}

export type CreateRescisaoPayload = Omit<Rescisao, 'id' | 'created_at' | 'updated_at'>
export type UpdateRescisaoPayload = { id: number } & Partial<Omit<Rescisao, 'id' | 'created_at' | 'updated_at'>>
