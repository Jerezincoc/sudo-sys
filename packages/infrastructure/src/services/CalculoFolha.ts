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

export function calcularIRRF(baseCalculo: number, dependentes = 0): { base: number; valor: number } {
  const deducaoDependente = 189.59 * dependentes
  const base = Math.max(0, baseCalculo - deducaoDependente)
  for (const faixa of IRRF_2025) {
    if (base <= faixa.ate) {
      const valor = Math.max(0, base * faixa.aliquota - faixa.deducao)
      return { base, valor: Math.round(valor * 100) / 100 }
    }
  }
  return { base, valor: 0 }
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
