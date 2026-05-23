export type RegimeTributario = 'CLT' | 'PJ'

export interface Funcionario {
  id: string
  empresaId: string
  nome: string
  cpf: string
  cargo: string
  salarioBase: number
  regime: RegimeTributario
  dataAdmissao: Date
  dataDemissao?: Date
  ativo: boolean
}
