export type ModoRelatorio = 'sintetico' | 'analitico'

export interface CampoSintetico {
  id: string           // ex: 'trabalhador.nome'
  label: string        // ex: 'Nome do Trabalhador'
  nivel: string        // ex: '1', '1.1', '1.2', '2'
  tipo: 'texto' | 'valor' | 'data'
}

export interface RelatorioPersonalizado {
  id: number
  nome: string
  descricao?: string | null
  modo: ModoRelatorio
  campos: CampoSintetico[]  // JSON serializado no banco
  cabecalho?: string | null
  empresa_id?: number | null
  created_at: string
  updated_at: string
}

export type CreateRelatorioPayload = Omit<RelatorioPersonalizado, 'id' | 'created_at' | 'updated_at'>
export type UpdateRelatorioPayload = { id: number } & Partial<Omit<RelatorioPersonalizado, 'id' | 'created_at' | 'updated_at'>>

export interface RelatorioLinhaFuncionario {
  funcionario: Record<string, unknown>
  derivados: Array<{ nivel: string; dados: Record<string, unknown> }>
}

export interface ExecutarRelatorioPayload {
  id: number
  empresa_id: number
  matricula?: string
  competencia_inicio?: string
  competencia_fim?: string
}
