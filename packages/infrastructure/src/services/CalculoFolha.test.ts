import { describe, expect, it } from 'vitest'
import { calcularFGTS, calcularINSS, calcularIRRF } from './CalculoFolha'

// Cenários confirmados manualmente contra a Receita Federal / Lei 15.270/2025 e
// registrados em ACAO-0008 (correção do bug de [11a] que esta suíte protege contra
// regressão: o redutor da Lei 15.270/2025 usa o salário bruto do funcionário, não a
// base já líquida de INSS/dependentes).
describe('calcularIRRF — Lei 15.270/2025 (competência 2026-01)', () => {
  it('Cenário A: bruto R$2.800, 0 dependentes, tradicional — isenção total (redutor)', () => {
    const bruto = 2800
    const competencia = '2026-01'
    const inss = calcularINSS(bruto, competencia)
    const irrf = calcularIRRF(bruto - inss.valor, 0, 'dependentes', competencia, bruto)
    expect(irrf.valor).toBe(0)
  })

  it('Cenário B: bruto R$6.000, 0 dependentes, tradicional — faixa de transição do redutor', () => {
    const bruto = 6000
    const competencia = '2026-01'
    const inss = calcularINSS(bruto, competencia)
    const irrf = calcularIRRF(bruto - inss.valor, 0, 'dependentes', competencia, bruto)
    expect(irrf.valor).toBe(385.10)
  })

  it('Cenário C: bruto R$8.500, 2 dependentes, tradicional — acima do teto, redutor não se aplica', () => {
    const bruto = 8500
    const competencia = '2026-01'
    const inss = calcularINSS(bruto, competencia)
    const irrf = calcularIRRF(bruto - inss.valor, 2, 'dependentes', competencia, bruto)
    expect(irrf.valor).toBe(1052.77)
  })

  it('Cenário D: bruto R$4.500, 0 dependentes, simplificado — desconto simplificado + redutor cumulativos', () => {
    const bruto = 4500
    const competencia = '2026-01'
    const inss = calcularINSS(bruto, competencia)
    const irrf = calcularIRRF(bruto - inss.valor, 0, 'simplificado', competencia, bruto)
    expect(irrf.valor).toBe(0)
  })

  it('Guarda de competência: mesma base do Cenário B mas em 2025-12 (antes da Lei 15.270/2025) — sem redutor', () => {
    // Reaproveita a mesma base de cálculo do Cenário B (bruto R$6.000, já líquido de
    // INSS) para isolar o efeito exclusivo da data de vigência do redutor — não
    // recalcula o INSS de 2025-12 porque o que está sob teste aqui é só o gate de
    // competência de `calcularIRRF`, não a interação com a tabela de INSS de outro ano.
    const bruto = 6000
    const baseCalculo = bruto - calcularINSS(bruto, '2026-01').valor
    const irrf = calcularIRRF(baseCalculo, 0, 'dependentes', '2025-12', bruto)
    expect(irrf.valor).toBe(564.85)
  })
})

describe('calcularINSS — tabela vigente 2026-01', () => {
  it('aplica as faixas progressivas corretamente para os brutos testados em calcularIRRF', () => {
    expect(calcularINSS(2800, '2026-01').valor).toBe(227.69)
    expect(calcularINSS(6000, '2026-01').valor).toBe(641.51)
    expect(calcularINSS(8500, '2026-01').valor).toBe(988.09)
    expect(calcularINSS(4500, '2026-01').valor).toBe(431.51)
  })
})

describe('calcularFGTS', () => {
  it('aplica 8% sobre o salário bruto', () => {
    expect(calcularFGTS(2800)).toBe(224)
    expect(calcularFGTS(6000)).toBe(480)
  })
})
