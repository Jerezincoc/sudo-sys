import type { FormulaNode } from './FormulaAst'
import { FormulaSyntaxError, FormulaTokenizer, type FormulaToken } from './FormulaTokenizer'

/**
 * Parser recursivo descendente para a gramática de fórmulas de rubrica
 * (operadores + - * / e parênteses, precedência padrão de aritmética):
 *
 *   expressao := termo (('+' | '-') termo)*
 *   termo     := fator (('*' | '/') fator)*
 *   fator     := '-'? primario
 *   primario  := NUMERO | IDENTIFICADOR | '(' expressao ')'
 *
 * Só constrói a árvore (AST) — não avalia variáveis nem valida se elas são
 * conhecidas (isso é `FormulaEvaluator`/`FormulaValidator`).
 */
export class FormulaParser {
  private tokens: FormulaToken[] = []
  private pos = 0

  parse(input: string): FormulaNode {
    if (input.trim() === '') {
      throw new FormulaSyntaxError('Fórmula vazia.')
    }
    this.tokens = new FormulaTokenizer().tokenize(input)
    this.pos = 0

    const node = this.parseExpressao()
    this.esperar('eof', 'Token inesperado após o fim da expressão')
    return node
  }

  private atual(): FormulaToken {
    return this.tokens[this.pos]
  }

  private avancar(): FormulaToken {
    return this.tokens[this.pos++]
  }

  private esperar(type: FormulaToken['type'], mensagem: string): FormulaToken {
    const token = this.atual()
    if (token.type !== type) {
      throw new FormulaSyntaxError(`${mensagem} (encontrado "${token.valor || 'fim da fórmula'}" na posição ${token.posicao}).`)
    }
    return this.avancar()
  }

  private parseExpressao(): FormulaNode {
    let esquerda = this.parseTermo()
    while (this.atual().type === '+' || this.atual().type === '-') {
      const operador = this.avancar().type as '+' | '-'
      const direita = this.parseTermo()
      esquerda = { type: 'binario', operador, esquerda, direita }
    }
    return esquerda
  }

  private parseTermo(): FormulaNode {
    let esquerda = this.parseFator()
    while (this.atual().type === '*' || this.atual().type === '/') {
      const operador = this.avancar().type as '*' | '/'
      const direita = this.parseFator()
      esquerda = { type: 'binario', operador, esquerda, direita }
    }
    return esquerda
  }

  private parseFator(): FormulaNode {
    if (this.atual().type === '-') {
      this.avancar()
      const operando = this.parseFator()
      return { type: 'unario', operador: '-', operando }
    }
    return this.parsePrimario()
  }

  private parsePrimario(): FormulaNode {
    const token = this.atual()

    if (token.type === 'numero') {
      this.avancar()
      return { type: 'numero', valor: Number(token.valor) }
    }

    if (token.type === 'identificador') {
      this.avancar()
      return { type: 'variavel', nome: token.valor }
    }

    if (token.type === '(') {
      this.avancar()
      const node = this.parseExpressao()
      this.esperar(')', 'Parêntese não fechado')
      return node
    }

    throw new FormulaSyntaxError(`Esperava número, variável ou "(" (encontrado "${token.valor || 'fim da fórmula'}" na posição ${token.posicao}).`)
  }
}
