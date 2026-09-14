import { describe, expect, it } from 'vitest'
import { FormulaEvaluator, FormulaEvaluationError } from './FormulaEvaluator'
import { FormulaParser } from './FormulaParser'
import { FormulaSyntaxError } from './FormulaTokenizer'
import { FormulaValidator } from './FormulaValidator'
import { contarDiasUteis } from './DiasUteis'

// Cobre a construção do motor de fórmulas pedida em [7a]: tokenizer, parser,
// evaluator e validator para a gramática já documentada em
// `VariablesDictionaryPage.tsx` (UI) — operadores + - * / ( ), 15 variáveis
// nomeadas resolvidas via `ctx`. Não testa integração com folha de pagamento
// de propósito: o motor não está plugado em nenhum handler ainda (decisão de
// produto separada, fora desta tarefa).

const evaluator = new FormulaEvaluator()

describe('FormulaEvaluator — exemplos reais documentados na UI', () => {
  it('"SALARIO * 0.05" com SALARIO=3000 → 150', () => {
    expect(evaluator.evaluate('SALARIO * 0.05', { SALARIO: 3000 })).toBe(150)
  })

  it('"SALARIO_HORA * 1.5 * HORAS_EXTRAS_50" com contexto de exemplo', () => {
    const ctx = { SALARIO_HORA: 20, HORAS_EXTRAS_50: 10 }
    expect(evaluator.evaluate('SALARIO_HORA * 1.5 * HORAS_EXTRAS_50', ctx)).toBe(300)
  })

  it('"BASE_INSS * 0.08" com BASE_INSS=5000 → 400', () => {
    expect(evaluator.evaluate('BASE_INSS * 0.08', { BASE_INSS: 5000 })).toBe(400)
  })
})

describe('FormulaEvaluator — precedência e parênteses', () => {
  it('"2 + 3 * 4" respeita precedência (multiplicação antes de soma) → 14, não 20', () => {
    expect(evaluator.evaluate('2 + 3 * 4', {})).toBe(14)
  })

  it('"(2 + 3) * 4" com parênteses força a soma primeiro → 20', () => {
    expect(evaluator.evaluate('(2 + 3) * 4', {})).toBe(20)
  })

  it('divisão e subtração combinadas: "10 - 8 / 4" → 8 (não 0.5)', () => {
    expect(evaluator.evaluate('10 - 8 / 4', {})).toBe(8)
  })

  it('unário negativo: "-SALARIO + 100" com SALARIO=30 → 70', () => {
    expect(evaluator.evaluate('-SALARIO + 100', { SALARIO: 30 })).toBe(70)
  })

  it('parênteses aninhados: "((1 + 2)) * ((3))" → 9', () => {
    expect(evaluator.evaluate('((1 + 2)) * ((3))', {})).toBe(9)
  })
})

describe('FormulaEvaluator — divisão por zero (comportamento decidido: erro, não Infinity/NaN)', () => {
  it('lança FormulaEvaluationError em vez de retornar Infinity', () => {
    expect(() => evaluator.evaluate('SALARIO / 0', { SALARIO: 100 })).toThrow(FormulaEvaluationError)
    expect(() => evaluator.evaluate('SALARIO / 0', { SALARIO: 100 })).toThrow(/Divisão por zero/)
  })

  it('divisão por zero decorrente de subexpressão também lança (ex: "10 / (5 - 5)")', () => {
    expect(() => evaluator.evaluate('10 / (5 - 5)', {})).toThrow(FormulaEvaluationError)
  })
})

describe('FormulaEvaluator — variável ausente do contexto', () => {
  it('lança FormulaEvaluationError em vez de tratar como 0 silenciosamente', () => {
    expect(() => evaluator.evaluate('SALARIO * 2', {})).toThrow(FormulaEvaluationError)
    expect(() => evaluator.evaluate('SALARIO * 2', {})).toThrow(/Variável desconhecida no contexto: SALARIO/)
  })
})

describe('FormulaParser — erros de sintaxe', () => {
  it('rejeita parêntese não fechado', () => {
    expect(() => new FormulaParser().parse('(SALARIO * 2')).toThrow(FormulaSyntaxError)
  })

  it('rejeita operador duplicado ("5 + + 3")', () => {
    expect(() => new FormulaParser().parse('5 + + 3')).toThrow(FormulaSyntaxError)
  })

  it('rejeita operando faltando no fim ("5 *")', () => {
    expect(() => new FormulaParser().parse('5 *')).toThrow(FormulaSyntaxError)
  })

  it('rejeita fórmula vazia', () => {
    expect(() => new FormulaParser().parse('')).toThrow(FormulaSyntaxError)
    expect(() => new FormulaParser().parse('   ')).toThrow(FormulaSyntaxError)
  })

  it('rejeita caractere desconhecido (ex: "SALARIO % 2")', () => {
    expect(() => new FormulaParser().parse('SALARIO % 2')).toThrow(FormulaSyntaxError)
  })

  it('rejeita token sobrando depois de uma expressão válida ("5 5")', () => {
    expect(() => new FormulaParser().parse('5 5')).toThrow(FormulaSyntaxError)
  })
})

describe('FormulaValidator', () => {
  const validator = new FormulaValidator()

  it('aceita os 3 exemplos reais documentados na UI', () => {
    expect(validator.validate('SALARIO * 0.05')).toEqual({ valid: true, errors: [] })
    expect(validator.validate('SALARIO_HORA * 1.5 * HORAS_EXTRAS_50')).toEqual({ valid: true, errors: [] })
    expect(validator.validate('BASE_INSS * 0.08')).toEqual({ valid: true, errors: [] })
  })

  it('rejeita variável desconhecida (fora das 15 documentadas)', () => {
    const resultado = validator.validate('SALARIO * FATOR_INVENTADO')
    expect(resultado.valid).toBe(false)
    expect(resultado.errors[0]).toMatch(/Variável desconhecida: FATOR_INVENTADO/)
  })

  it('rejeita erro de sintaxe (parêntese não fechado) sem tentar avaliar', () => {
    const resultado = validator.validate('(SALARIO * 2')
    expect(resultado.valid).toBe(false)
    expect(resultado.errors[0]).toMatch(/Parêntese não fechado/)
  })

  it('rejeita erro de sintaxe (operador duplicado) sem tentar avaliar', () => {
    const resultado = validator.validate('SALARIO + + 1')
    expect(resultado.valid).toBe(false)
  })

  it('reporta todas as variáveis desconhecidas de uma fórmula com mais de uma', () => {
    const resultado = validator.validate('FOO + BAR')
    expect(resultado.valid).toBe(false)
    expect(resultado.errors).toHaveLength(2)
  })

  it('aceita todas as 15 variáveis documentadas individualmente', () => {
    const variaveis = [
      'SALARIO', 'CARGA_HORARIA', 'SALARIO_HORA', 'VALE_REFEICAO', 'PLANO_SAUDE',
      'DIAS_MES', 'SALARIO_DIA', 'DIAS_UTEIS', 'HORAS_TRABALHADAS', 'HORAS_EXTRAS_50',
      'HORAS_EXTRAS_100', 'HORAS_FALTA', 'BASE_INSS', 'BASE_IRRF', 'BASE_FGTS',
    ]
    for (const nome of variaveis) {
      expect(validator.validate(nome)).toEqual({ valid: true, errors: [] })
    }
  })
})

describe('contarDiasUteis', () => {
  it('conta dias úteis (segunda a sexta) de janeiro/2026 → 22', () => {
    expect(contarDiasUteis('2026-01')).toBe(22)
  })

  it('conta dias úteis de fevereiro/2026 (28 dias, não bissexto) → 20', () => {
    expect(contarDiasUteis('2026-02')).toBe(20)
  })
})
