export type TipoVale = 'VT' | 'VR'
export type TipoAdvertencia = 'ADVERTENCIA' | 'SUSPENSAO'
export type TipoAditivo = 'salario' | 'cargo' | 'jornada'

export interface DocContratoParams {
  funcionarioId: number
  empresaId: number
}

export interface DocAditivoParams {
  funcionarioId: number
  empresaId: number
  tipo: TipoAditivo
  valorAnterior: string
  valorNovo: string
  dataVigencia: string
}

export interface DocValeParams {
  funcionarioId: number
  empresaId: number
  tipo: TipoVale
  competencia: string
  valor: number
  quantidade: number
}

export interface DocAdvertenciaParams {
  funcionarioId: number
  empresaId: number
  tipo: TipoAdvertencia
  motivo: string
  diasSuspensao?: number
}
