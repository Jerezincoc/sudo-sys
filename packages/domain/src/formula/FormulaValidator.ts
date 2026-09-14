import type { FormulaNode } from './FormulaAst'
import { FormulaParser } from './FormulaParser'

/** As 15 variáveis documentadas em `VariablesDictionaryPage.tsx` (UI) — única
 *  fonte de verdade sobre nomes válidos até que exista um dicionário
 *  compartilhado entre UI e domínio (fora do escopo desta tarefa). */
export const VARIAVEIS_CONHECIDAS: readonly string[] = [
  'SALARIO',
  'CARGA_HORARIA',
  'SALARIO_HORA',
  'VALE_REFEICAO',
  'PLANO_SAUDE',
  'DIAS_MES',
  'SALARIO_DIA',
  'DIAS_UTEIS',
  'HORAS_TRABALHADAS',
  'HORAS_EXTRAS_50',
  'HORAS_EXTRAS_100',
  'HORAS_FALTA',
  'BASE_INSS',
  'BASE_IRRF',
  'BASE_FGTS',
]

export interface FormulaValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Valida uma fórmula de rubrica sem avaliá-la: (1) sintaxe — via
 * `FormulaParser`, e (2) semântica — toda variável referenciada precisa estar
 * em `VARIAVEIS_CONHECIDAS`. Não verifica se o contexto de execução tem essas
 * variáveis (isso só existe em tempo de avaliação, é responsabilidade do
 * `FormulaEvaluator`).
 */
export class FormulaValidator {
  private readonly conhecidas: ReadonlySet<string>

  constructor(variaveisConhecidas: readonly string[] = VARIAVEIS_CONHECIDAS) {
    this.conhecidas = new Set(variaveisConhecidas)
  }

  validate(formula: string): FormulaValidationResult {
    let ast: FormulaNode
    try {
      ast = new FormulaParser().parse(formula)
    } catch (err) {
      return { valid: false, errors: [err instanceof Error ? err.message : String(err)] }
    }

    const errors: string[] = []
    this.coletarVariaveisDesconhecidas(ast, errors)
    return { valid: errors.length === 0, errors }
  }

  private coletarVariaveisDesconhecidas(node: FormulaNode, errors: string[]): void {
    switch (node.type) {
      case 'numero':
        return
      case 'variavel':
        if (!this.conhecidas.has(node.nome)) {
          errors.push(`Variável desconhecida: ${node.nome}`)
        }
        return
      case 'unario':
        this.coletarVariaveisDesconhecidas(node.operando, errors)
        return
      case 'binario':
        this.coletarVariaveisDesconhecidas(node.esquerda, errors)
        this.coletarVariaveisDesconhecidas(node.direita, errors)
        return
    }
  }
}
