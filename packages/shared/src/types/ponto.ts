export interface RegistroPonto {
  id: number
  funcionario_id: number
  empresa_id: number
  data: string
  entrada: string | null
  saida_almoco: string | null
  retorno_almoco: string | null
  saida: string | null
  horas_trabalhadas: number
  horas_normais: number
  horas_extras_50: number
  horas_extras_100: number
  horas_falta: number
  tipo: 'normal' | 'feriado' | 'folga' | 'afastamento' | 'falta'
  justificativa: string | null
  status: 'pendente' | 'aprovado' | 'rejeitado'
  created_at: string
  updated_at: string
}

export type CreatePontoPayload = Omit<RegistroPonto, 'id' | 'created_at' | 'updated_at'>
export type UpdatePontoPayload = { id: number } & Partial<Omit<RegistroPonto, 'id' | 'created_at' | 'updated_at'>>

export interface EspelhoPonto {
  funcionario_id: number
  empresa_id: number
  mes: number
  ano: number
  registros: RegistroPonto[]
  total_trabalhadas: number
  total_normais: number
  total_extras_50: number
  total_extras_100: number
  total_faltas: number
}
