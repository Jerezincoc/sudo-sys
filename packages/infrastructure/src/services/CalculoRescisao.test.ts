import { describe, expect, it } from 'vitest'
import {
  calcularRescisao,
  diasAvisoPrevio,
  DadoObrigatorioRescisaoError,
  type EntradaRescisao,
} from './CalculoRescisao'

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
    outrosDescontos: 0,
    saldoFgts: 0,
    dependentes: 0,
    regimeIrrf: 'dependentes',
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

describe('5. INSS rescisório — Lei 8.212/91 art. 28, Decreto 3.048/99 art. 214 §7º (tabela 2025)', () => {
  it('saldo de salário e 13º em cálculos separados: R$500 → 37,50; R$2.000 → 157,23', () => {
    // 13º: 1.518 × 7,5% = 113,85 + 482 × 9% = 43,38 → 157,23
    const r = calcularRescisao(entrada())
    expect(r.inss).toBe(37.5)
    expect(r.inssDecimoTerceiro).toBe(157.23)
  })
  it('aviso indenizado (STJ Tema 478) e férias + 1/3 (art. 28 §9º d) fora da base', () => {
    const r = calcularRescisao(entrada({ avisoPrevio: 'indenizado', feriasVencidas: 3000 }))
    expect(r.avisoPrevioValor).toBe(3600)
    expect(r.inss).toBe(37.5)
  })
  it('"outros proventos" fora das bases de INSS, IRRF e FGTS (REC-0021), mas no total', () => {
    const base = calcularRescisao(entrada())
    const r = calcularRescisao(entrada({ outrosProventos: 5000 }))
    expect([r.inss, r.inssDecimoTerceiro, r.irrf, r.irrfDecimoTerceiro, r.fgtsRescisao])
      .toEqual([base.inss, base.inssDecimoTerceiro, base.irrf, base.irrfDecimoTerceiro, base.fgtsRescisao])
    expect(r.totalProventos).toBe(base.totalProventos + 5000)
  })
})

describe('6. IRRF rescisório — Lei 7.713/88 art. 6º V, Lei 8.134/90 art. 16', () => {
  it('dependentes deduzidos no saldo e no 13º: 2 × 189,59', () => {
    // (10.000 − 951,63 − 379,18) × 27,5% − 908,73 = 1.475,30
    const r = calcularRescisao(entrada({
      salario: 12000, dataDemissao: '2025-09-25', diasTrabalhados: 25, avisoPrevio: 'indenizado', dependentes: 2,
    }))
    expect(r.irrf).toBe(1475.3)
    expect(r.irrfDecimoTerceiro).toBe(1475.3)
  })
  it('redutor Lei 15.270 (2026) usa o valor bruto, não a base líquida (REC-0021)', () => {
    // Saldo R$6.000, INSS 2026 = 641,51; base 5.358,49 → tabela 564,85475;
    // redutor 978,62 − 0,133145 × 6.000 = 179,75 → 385,10 (com a base seria 299,69).
    const r = calcularRescisao(entrada({
      salario: 6000, dataAdmissao: '2025-03-01', dataDemissao: '2026-02-28', diasTrabalhados: 30,
    }))
    expect(r.inss).toBe(641.51)
    expect(r.irrf).toBe(385.1)
  })
})

describe('7. FGTS e multa — Lei 8.036/90 arts. 15 e 18, Decreto 99.684/90 art. 9º, CLT art. 484-A I b', () => {
  it('FGTS do mês sobre saldo + 13º + aviso indenizado; férias fora (art. 15 §6º)', () => {
    const r = calcularRescisao(entrada({ avisoPrevio: 'indenizado', feriasVencidas: 3000 }))
    expect(r.fgtsRescisao).toBe(508) // (500 + 2.250 + 3.600) × 8%
  })
  it('multa 40% sobre saldo informado + depósitos da rescisão, incluindo o do aviso (REC-0021)', () => {
    const r = calcularRescisao(entrada({ avisoPrevio: 'indenizado', saldoFgts: 5492 }))
    expect(r.multaFgts).toBe(2400) // (5.492 + 508) × 40%
  })
  it('é informativa: fora do total e do líquido', () => {
    const r = calcularRescisao(entrada({ saldoFgts: 2200 }))
    expect(r.multaFgts).toBe(960) // (2.200 + 200) × 40%
    expect(r.totalProventos).toBe(500 + 1500 + 500 + 2000)
    expect(r.valorLiquido).toBe(round2(r.totalProventos - r.inss - r.inssDecimoTerceiro))
  })
  it('20% no acordo mútuo', () => {
    expect(calcularRescisao(entrada({ motivo: 'acordo_mutuo', saldoFgts: 2200 })).multaFgts).toBe(480)
  })
  it('zerada no pedido de demissão e na justa causa', () => {
    expect(calcularRescisao(entrada({ motivo: 'pedido_demissao', saldoFgts: 1000 })).multaFgts).toBe(0)
    expect(calcularRescisao(entrada({ motivo: 'com_justa_causa', saldoFgts: 1000 })).multaFgts).toBe(0)
  })
})

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

describe('8. Saldo FGTS não informado — trava da ACAO-0036', () => {
  it('lança DadoObrigatorioRescisaoError em vez de calcular sobre base parcial', () => {
    expect(() => calcularRescisao(entrada({ saldoFgts: null }))).toThrow(DadoObrigatorioRescisaoError)
  })

  it('a mensagem identifica o campo e explica o risco de valor menor', () => {
    try {
      calcularRescisao(entrada({ saldoFgts: null }))
      throw new Error('deveria ter lançado')
    } catch (err) {
      expect(err).toBeInstanceOf(DadoObrigatorioRescisaoError)
      const e = err as DadoObrigatorioRescisaoError
      expect(e.campo).toBe('saldoFgts')
      expect(e.message).toMatch(/menor que o devido/)
    }
  })

  it('também trava no acordo mútuo (multa de 20%)', () => {
    expect(() => calcularRescisao(entrada({ motivo: 'acordo_mutuo', saldoFgts: null })))
      .toThrow(DadoObrigatorioRescisaoError)
  })

  it('NÃO trava quando não há multa devida (pedido de demissão e justa causa)', () => {
    expect(calcularRescisao(entrada({ motivo: 'pedido_demissao', saldoFgts: null })).multaFgts).toBe(0)
    expect(calcularRescisao(entrada({ motivo: 'com_justa_causa', saldoFgts: null })).multaFgts).toBe(0)
  })

  it('saldo 0 é valor INFORMADO, não ausente: calcula normalmente', () => {
    const r = calcularRescisao(entrada({ saldoFgts: 0 }))
    expect(r.multaFgts).toBe(80) // (0 + 200) × 40%
  })

  it('o caminho normal (saldo informado) continua com o valor validado na ACAO-0035', () => {
    const r = calcularRescisao(entrada({ avisoPrevio: 'indenizado', saldoFgts: 5492 }))
    expect(r.multaFgts).toBe(2400) // (5.492 + 508) × 40% — mesmo valor da ACAO-0035
  })

  it('demonstra a regressão evitada: base parcial sairia muito menor que a real', () => {
    const comSaldoReal = calcularRescisao(entrada({ saldoFgts: 20000 }))
    expect(comSaldoReal.multaFgts).toBe(8080) // (20.000 + 200) × 40%
    // Sem o saldo, o motor antigo calcularia só sobre os depósitos da rescisão: R$ 80.
    // Agora isso é impossível — falha em vez de exibir 80 no lugar de 8.080.
    expect(() => calcularRescisao(entrada({ saldoFgts: null }))).toThrow(DadoObrigatorioRescisaoError)
  })
})

describe('Cenários completos (PASSO 3)', () => {
  it('(a) sem justa causa, 2 anos e meio, aviso indenizado', () => {
    const r = calcularRescisao(entrada({ avisoPrevio: 'indenizado', saldoFgts: 5492 }))
    expect(r).toMatchObject({
      saldoSalario: 500, avisoPrevioDias: 36, avisoPrevioValor: 3600,
      feriasProporcionais: 1750, umTercoFerias: 583.33, decimoTerceiro: 2250,
      inss: 37.5, inssDecimoTerceiro: 179.73, irrf: 0, irrfDecimoTerceiro: 0,
      fgtsRescisao: 508, multaFgts: 2400,
      totalProventos: 8683.33, totalDescontos: 217.23, valorLiquido: 8466.1,
    })
  })

  it('(b) pedido de demissão, aviso trabalhado', () => {
    const r = calcularRescisao(entrada({
      motivo: 'pedido_demissao', dataAdmissao: '2024-06-20', dataDemissao: '2025-09-18',
      diasTrabalhados: 18, saldoFgts: 1000,
    }))
    expect(r).toMatchObject({
      saldoSalario: 1800, avisoPrevioValor: 0, feriasProporcionais: 750, umTercoFerias: 250,
      decimoTerceiro: 2250, inss: 139.23, inssDecimoTerceiro: 179.73, irrf: 0, irrfDecimoTerceiro: 0,
      fgtsRescisao: 324, multaFgts: 0, totalProventos: 5050, valorLiquido: 4731.04,
    })
  })

  it('(c) acordo mútuo (art. 484-A), 5 anos, aviso indenizado, um período de férias vencido', () => {
    const r = calcularRescisao(entrada({
      motivo: 'acordo_mutuo', dataAdmissao: '2020-02-03', dataDemissao: '2025-08-14',
      salario: 4000, diasTrabalhados: 14, avisoPrevio: 'indenizado', feriasVencidas: 4000,
      saldoFgts: 15424,
    }))
    expect(r).toMatchObject({
      saldoSalario: 1866.67, avisoPrevioDias: 45, avisoPrevioValor: 3000,
      feriasProporcionais: 2000, umTercoFerias: 2000, decimoTerceiro: 2333.33,
      inss: 145.23, inssDecimoTerceiro: 187.23, irrf: 0, irrfDecimoTerceiro: 0,
      fgtsRescisao: 576, multaFgts: 3200, // (15.424 + 576) × 20%
      totalProventos: 15200, valorLiquido: 14867.54,
    })
  })

  it('(d) sem justa causa, salário alto: IRRF > 0 e teto do INSS atingido no saldo e no 13º', () => {
    // Saldo 10.000 (25 dias); aviso 36 dias = 14.400; projeção até 31/10 → 13º 10/12 = 10.000,
    // férias 8/12 = 8.000 + 1/3 = 2.666,67. INSS no teto 2025 em cada base, separado:
    // 113,85 + 114,8292 + 167,634 + 555,3212 = 951,63 (somados dariam o mesmo teto uma vez só).
    // IRRF: (10.000 − 951,63) × 27,5% − 908,73 = 1.579,57, em cada base.
    const r = calcularRescisao(entrada({
      salario: 12000, dataDemissao: '2025-09-25', diasTrabalhados: 25, avisoPrevio: 'indenizado',
      saldoFgts: 20000,
    }))
    expect(r).toMatchObject({
      saldoSalario: 10000, avisoPrevioDias: 36, avisoPrevioValor: 14400,
      feriasProporcionais: 8000, umTercoFerias: 2666.67, decimoTerceiro: 10000,
      inss: 951.63, inssDecimoTerceiro: 951.63, irrf: 1579.57, irrfDecimoTerceiro: 1579.57,
      fgtsRescisao: 2752, multaFgts: 9100.8, // (20.000 + 2.752) × 40%
      totalProventos: 45066.67, totalDescontos: 5062.4, valorLiquido: 40004.27,
    })
  })
})
