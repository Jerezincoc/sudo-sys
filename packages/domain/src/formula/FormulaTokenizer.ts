export type FormulaTokenType = 'numero' | 'identificador' | '+' | '-' | '*' | '/' | '(' | ')' | 'eof'

export interface FormulaToken {
  type: FormulaTokenType
  valor: string
  posicao: number
}

export class FormulaSyntaxError extends Error {}

const OPERADORES_SIMBOLO = new Set(['+', '-', '*', '/', '(', ')'])

/** Divide uma fórmula (ex: "SALARIO_HORA * 1.5 * HORAS_EXTRAS_50") em tokens.
 *  Não valida semântica (variável conhecida, parênteses balanceados) — isso é
 *  responsabilidade de `FormulaParser`/`FormulaValidator`. */
export class FormulaTokenizer {
  tokenize(input: string): FormulaToken[] {
    const tokens: FormulaToken[] = []
    let i = 0

    while (i < input.length) {
      const c = input[i]

      if (/\s/.test(c)) { i++; continue }

      if (OPERADORES_SIMBOLO.has(c)) {
        tokens.push({ type: c as FormulaTokenType, valor: c, posicao: i })
        i++
        continue
      }

      if (/[0-9]/.test(c)) {
        const inicio = i
        let viuPonto = false
        while (i < input.length && (/[0-9]/.test(input[i]) || (input[i] === '.' && !viuPonto))) {
          if (input[i] === '.') viuPonto = true
          i++
        }
        const texto = input.slice(inicio, i)
        if (texto.endsWith('.') || /\.\./.test(texto)) {
          throw new FormulaSyntaxError(`Número inválido "${texto}" na posição ${inicio}.`)
        }
        tokens.push({ type: 'numero', valor: texto, posicao: inicio })
        continue
      }

      if (/[A-Za-z_]/.test(c)) {
        const inicio = i
        while (i < input.length && /[A-Za-z0-9_]/.test(input[i])) i++
        tokens.push({ type: 'identificador', valor: input.slice(inicio, i), posicao: inicio })
        continue
      }

      throw new FormulaSyntaxError(`Caractere inesperado "${c}" na posição ${i}.`)
    }

    tokens.push({ type: 'eof', valor: '', posicao: input.length })
    return tokens
  }
}
