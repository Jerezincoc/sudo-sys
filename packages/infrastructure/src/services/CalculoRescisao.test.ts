import { describe, expect, it } from 'vitest'
import { calcularRescisao, diasAvisoPrevio, type EntradaRescisao } from './CalculoRescisao'

// Validação verba a verba contra o texto legal (ACAO-0033). Valores esperados calculados à
// mão a partir de: CLT arts. 64, 146, 484-A, 487; Lei 12.506/2011 + NT 184/2012/MTE;
// Lei 4.090/62 art. 1º; Lei 8.036/90 art. 18; Súmulas 157, 261, 328 e OJ 82 SBDI-1 do TST.

function entrada(over: Partial<EntradaRescisao> = {}): EntradaRescisao {
  return {
    dataAdmissao: '2023-03-10',
    dataDemissao: '2025-09-05',
    motivo: 'sem_justa_causa',
    avisoPrevio: 'trabalhado',
    salario: 3000,
    diasTrabalhados: 5,
    feriasVencidas: 0,
    outrosProventos: 0,
    inss: 0,
    irrf: 0,
    outrosDescontos: 0,
    multaFgtsInformada: 0,
    ...over,
  }
}

describe('1. Saldo de salário — CLT art. 64 (divisor 30)', () => {
  it('R$3.000 × 5/30 = R$500', () => {
    expect(calcularRescisao(entrada()).saldoSalario).toBe(500)
  })
  it('R$4.000 × 14/30 = R$1.866,67', () => {
    expect(calcularRescisao(entrada({ salario: 4000, diasTrabalhados: 14 })).saldoSalario).toBe(1866.67)
  })
})

describe('2. Aviso prévio — CLT art. 487/484-A, Lei 12.506/2011', () => {
  it('menos de 1 ano completo: 30 dias', () => {
    expect(diasAvisoPrevio('2025-01-10', '2026-01-08')).toBe(30)
  })
  it('1 ano completo exato (NT 184/2012): 33 dias', () => {
    expect(diasAvisoPrevio('2025-01-10', '2026-01-09')).toBe(33)
  })
  it('2 anos completos: 36 dias', () => {
    expect(diasAvisoPrevio('2023-03-10', '2025-09-05')).toBe(36)
  })
  it('teto de 90 dias (20 anos completos → 30 + 60)', () => {
    expect(diasAvisoPrevio('2000-01-01', '2025-06-30')).toBe(90)
  })
  it('sem justa causa, indenizado, 2 anos: 36/30 × R$3.000 = R$3.600', () => {
    const r = calcularRescisao(entrada({ avisoPrevio: 'indenizado' }))
    expect(r.avisoPrevioDias).toBe(36)
    expect(r.avisoPrevioValor).toBe(3600)
  })
  it('pedido de demissão com "indenizado": empregador não paga aviso (art. 487 §2º)', () => {
    expect(calcularRescisao(entrada({ motivo: 'pedido_demissao', avisoPrevio: 'indenizado' })).avisoPrevioValor).toBe(0)
  })
  it('justa causa com "indenizado": não há aviso (art. 487 caput, "sem justo motivo")', () => {
    expect(calcularRescisao(entrada({ motivo: 'com_justa_causa', avisoPrevio: 'indenizado' })).avisoPrevioValor).toBe(0)
  })
  it('acordo mútuo, indenizado: metade de 36 dias = R$1.800 (art. 484-A, I, a)', () => {
    expect(calcularRescisao(entrada({ motivo: 'acordo_mutuo', avisoPrevio: 'indenizado' })).avisoPrevioValor).toBe(1800)
  })
  it('trabalhado: nada indenizado', () => {
    expect(calcularRescisao(entrada()).avisoPrevioValor).toBe(0)
  })
})

describe('3. Férias — CLT art. 146 p.ú., CF art. 7º XVII, Súmula 328/TST', () => {
  it('fração de 13 dias não conta como mês (código original contava 6/12)', () => {
    // Período aquisitivo desde 20/03/2025; até 01/09: 5 meses (até 19/08) + 13 dias.
    const r = calcularRescisao(entrada({ dataAdmissao: '2024-03-20', dataDemissao: '2025-09-01' }))
    expect(r.feriasProporcionais).toBe(1250)
  })
  it('fração de 30 dias conta como mês: 3/12', () => {
    const r = calcularRescisao(entrada({ dataAdmissao: '2024-06-20', dataDemissao: '2025-09-18' }))
    expect(r.feriasProporcionais).toBe(750)
  })
  it('1/3 incide também sobre férias vencidas e entra no total', () => {
    const r = calcularRescisao(entrada({ feriasVencidas: 3000 }))
    // proporcionais: 10/03/2025 → 05/09/2025 = 5 meses + 27 dias = 6/12 = 1.500
    expect(r.feriasProporcionais).toBe(1500)
    expect(r.umTercoFerias).toBe(1500) // 1.000 (vencidas) + 500 (proporcionais)
    expect(r.totalProventos).toBe(500 + 3000 + 1500 + 1500 + 2000)
  })
  it('aviso indenizado projeta o tempo de serviço (art. 487 §1º, OJ 82): 7/12', () => {
    // 05/09/2025 + 36 dias = 11/10/2025; desde 10/03: 7 meses + 2 dias.
    const r = calcularRescisao(entrada({ avisoPrevio: 'indenizado' }))
    expect(r.feriasProporcionais).toBe(1750)
  })
})

describe('4. 13º proporcional — Lei 4.090/62 art. 1º §2º', () => {
  it('mês da demissão com 5 dias não conta (código original contava 9/12)', () => {
    expect(calcularRescisao(entrada()).decimoTerceiro).toBe(2000)
  })
  it('mês de admissão com 12 dias não conta: 3/12', () => {
    const r = calcularRescisao(entrada({ dataAdmissao: '2025-03-20', dataDemissao: '2025-06-30' }))
    expect(r.decimoTerceiro).toBe(750)
  })
  it('mês com 15 dias conta', () => {
    const r = calcularRescisao(entrada({ dataDemissao: '2025-09-15' }))
    expect(r.decimoTerceiro).toBe(2250)
  })
  it('aviso indenizado projeta: 05/09 + 36 dias = 11/10 → setembro conta, outubro não: 9/12', () => {
    expect(calcularRescisao(entrada({ avisoPrevio: 'indenizado' })).decimoTerceiro).toBe(2250)
  })
})

describe('5. Multa FGTS — Lei 8.036/90 art. 18 §1º, CLT art. 484-A I b', () => {
  it('é informativa: depositada na conta vinculada, fora do total e do líquido', () => {
    const r = calcularRescisao(entrada({ multaFgtsInformada: 2400 }))
    expect(r.multaFgts).toBe(2400)
    expect(r.totalProventos).toBe(500 + 1500 + 500 + 2000)
    expect(r.valorLiquido).toBe(r.totalProventos)
  })
  it('zerada no pedido de demissão e na justa causa', () => {
    expect(calcularRescisao(entrada({ motivo: 'pedido_demissao', multaFgtsInformada: 1000 })).multaFgts).toBe(0)
    expect(calcularRescisao(entrada({ motivo: 'com_justa_causa', multaFgtsInformada: 1000 })).multaFgts).toBe(0)
  })
})

describe('Cenários completos (PASSO 3)', () => {
  it('(a) sem justa causa, 2 anos e meio, aviso indenizado', () => {
    const r = calcularRescisao(entrada({ avisoPrevio: 'indenizado', multaFgtsInformada: 2400 }))
    expect(r).toMatchObject({
      saldoSalario: 500, avisoPrevioDias: 36, avisoPrevioValor: 3600,
      feriasProporcionais: 1750, umTercoFerias: 583.33, decimoTerceiro: 2250,
      multaFgts: 2400, totalProventos: 8683.33, valorLiquido: 8683.33,
    })
  })

  it('(b) pedido de demissão, aviso trabalhado', () => {
    const r = calcularRescisao(entrada({
      motivo: 'pedido_demissao', dataAdmissao: '2024-06-20', dataDemissao: '2025-09-18',
      diasTrabalhados: 18, multaFgtsInformada: 1000,
    }))
    expect(r).toMatchObject({
      saldoSalario: 1800, avisoPrevioValor: 0, feriasProporcionais: 750, umTercoFerias: 250,
      decimoTerceiro: 2250, multaFgts: 0, totalProventos: 5050,
    })
  })

  it('(c) acordo mútuo (art. 484-A), 5 anos, aviso indenizado, um período de férias vencido', () => {
    const r = calcularRescisao(entrada({
      motivo: 'acordo_mutuo', dataAdmissao: '2020-02-03', dataDemissao: '2025-08-14',
      salario: 4000, diasTrabalhados: 14, avisoPrevio: 'indenizado', feriasVencidas: 4000,
      multaFgtsInformada: 3200,
    }))
    expect(r).toMatchObject({
      saldoSalario: 1866.67, avisoPrevioDias: 45, avisoPrevioValor: 3000,
      feriasProporcionais: 2000, umTercoFerias: 2000, decimoTerceiro: 2333.33,
      multaFgts: 3200, totalProventos: 15200,
    })
  })
})
