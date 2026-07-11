const INSS_2025 = [
  { ate: 1518.00,  aliquota: 0.075 },
  { ate: 2793.88,  aliquota: 0.09  },
  { ate: 4190.83,  aliquota: 0.12  },
  { ate: 8157.41,  aliquota: 0.14  },
]

const IRRF_2025 = [
  { ate: 2259.20,  aliquota: 0,     deducao: 0       },
  { ate: 2826.65,  aliquota: 0.075, deducao: 169.44  },
  { ate: 3751.05,  aliquota: 0.15,  deducao: 381.44  },
  { ate: 4664.68,  aliquota: 0.225, deducao: 662.77  },
  { ate: Infinity, aliquota: 0.275, deducao: 896.00  },
]

export function calcularINSS(salarioBruto: number): { base: number; valor: number } {
  let inss = 0
  let baseAnterior = 0
  for (const faixa of INSS_2025) {
    if (salarioBruto <= 0) break
    const base = Math.min(salarioBruto, faixa.ate) - baseAnterior
    if (base <= 0) break
    inss += base * faixa.aliquota
    baseAnterior = faixa.ate
    if (salarioBruto <= faixa.ate) break
  }
  return { base: salarioBruto, valor: Math.round(inss * 100) / 100 }
}

// Lei 15.270/2025 (vigente desde 01/01/2026): redutor adicional sobre o IRRF
// da tabela tradicional — isenção total até R$ 5.000 de rendimento tributável,
// redução parcial entre R$ 5.000,01 e R$ 7.350,00, tabela tradicional pura acima disso.
const REDUTOR_ISENCAO_ATE = 5000.00
const REDUTOR_LIMITE_ATE  = 7350.00
const REDUTOR_A = 978.62
const REDUTOR_B = 0.133145

// Desconto simplificado (orientação RFB dez/2025): valor fixo mensal que substitui
// todas as demais deduções (dependentes, pensão etc.) quando escolhido pelo funcionário.
const DESCONTO_SIMPLIFICADO = 607.20

export function calcularIRRF(
  baseCalculo: number,
  dependentes = 0,
  regimeIrrf: 'dependentes' | 'simplificado' = 'dependentes',
): { base: number; valor: number } {
  const deducao = regimeIrrf === 'simplificado' ? DESCONTO_SIMPLIFICADO : 189.59 * dependentes
  const base = Math.max(0, baseCalculo - deducao)

  let irrfTabela = 0
  for (const faixa of IRRF_2025) {
    if (base <= faixa.ate) {
      irrfTabela = Math.max(0, base * faixa.aliquota - faixa.deducao)
      break
    }
  }

  // rendimentoTributavel = base já reduzida pela dedução de dependentes (após INSS)
  const rendimentoTributavel = base
  let valor = irrfTabela
  if (rendimentoTributavel <= REDUTOR_ISENCAO_ATE) {
    valor = 0
  } else if (rendimentoTributavel <= REDUTOR_LIMITE_ATE) {
    const redutor = REDUTOR_A - (REDUTOR_B * rendimentoTributavel)
    valor = Math.max(0, irrfTabela - redutor)
  }

  return { base, valor: Math.round(valor * 100) / 100 }
}

export function calcularFGTS(salarioBruto: number): number {
  return Math.round(salarioBruto * 0.08 * 100) / 100
}

export function diasDoMes(competencia: string): number {
  const [ano, mes] = competencia.split('-').map(Number)
  return new Date(ano, mes, 0).getDate()
}

export function salarioDia(salarioBase: number, competencia: string): number {
  return salarioBase / diasDoMes(competencia)
}
