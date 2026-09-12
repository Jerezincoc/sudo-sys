import type { FormulaNode } from './FormulaAst'
import { FormulaParser } from './FormulaParser'

export class FormulaEvaluationError extends Error {}

/**
 * Avalia uma fórmula de rubrica (ex: "SALARIO * 0.05") contra um contexto de
 * variáveis já resolvidas. Não busca dado nenhum sozinho — quem chama decide
 * o que cada variável (SALARIO, BASE_INSS, etc.) vale naquele momento; isso é
 * responsabilidade de quem integra o motor ao cálculo de folha, não deste
 * arquivo.
 *
 * Decisões de comportamento (documentadas aqui por não serem óbvias):
 * - Variável presente na fórmula mas ausente do `ctx` → lança
 *   `FormulaEvaluationError`, em vez de tratar como 0 silenciosamente. Um
 *   valor de rubrica errado por variável "esquecida" no contexto é pior do
 *   que a rubrica falhar visivelmente.
 * - Divisão por zero → lança `FormulaEvaluationError`, em vez de propagar
 *   `Infinity`/`NaN`. Numa folha de pagamento, um valor `Infinity`/`NaN`
 *   silenciosamente gravado como valor de lançamento é um risco financeiro
 *   maior do que interromper o cálculo com um erro claro.
 */
export class FormulaEvaluator {
  evaluate(formula: string, ctx: Record<string, number>): number {
    const ast = new FormulaParser().parse(formula)
    return this.avaliarNode(ast, ctx)
  }

  private avaliarNode(node: FormulaNode, ctx: Record<string, number>): number {
    switch (node.type) {
      case 'numero':
        return node.valor

      case 'variavel': {
        const valor = ctx[node.nome]
        if (valor === undefined) {
          throw new FormulaEvaluationError(`Variável desconhecida no contexto: ${node.nome}`)
        }
        return valor
      }

      case 'unario':
        return -this.avaliarNode(node.operando, ctx)

      case 'binario': {
        const esquerda = this.avaliarNode(node.esquerda, ctx)
        const direita = this.avaliarNode(node.direita, ctx)
        switch (node.operador) {
          case '+': return esquerda + direita
          case '-': return esquerda - direita
          case '*': return esquerda * direita
          case '/':
            if (direita === 0) {
              throw new FormulaEvaluationError('Divisão por zero.')
            }
            return esquerda / direita
        }
      }
    }
  }
}
