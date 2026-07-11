// As tabelas abaixo são versionadas por competência (`vigenteDesde`, formato "AAAA-MM")
// porque INSS e IRRF mudam de valor por lei/portaria em datas que não coincidem — e um
// recálculo de folha de competência passada precisa usar a tabela que valia naquele mês,
// não a mais recente. `tabelaVigente` escolhe a entrada mais recente cujo `vigenteDesde`
// seja menor ou igual à competência informada (ou a mais nova, se a competência for
// omitida). Só entram aqui tabelas com fonte oficial verificada — não há entrada anterior
// a 2024-02 (IRRF) / 2025-01 (INSS) porque não foram pesquisadas.

interface FaixaInss { ate: number; aliquota: number }
interface TabelaInss { vigenteDesde: string; faixas: FaixaInss[] }

// Mais recente primeiro.
const TABELAS_INSS: TabelaInss[] = [
  {
    // Portaria Interministerial MPS/MF nº 13, de 9/1/2026 (DOU 12/1/2026, Anexo II).
    // Teto do salário-de-contribuição: R$ 8.475,55.
    vigenteDesde: '2026-01',
    faixas: [
      { ate: 1621.00, aliquota: 0.075 },
      { ate: 2902.84, aliquota: 0.09  },
      { ate: 4354.27, aliquota: 0.12  },
      { ate: 8475.55, aliquota: 0.14  },
    ],
  },
  {
    // Tabela vigente em 2025 (teto R$ 8.157,41), mantida aqui só para recálculo
    // retroativo de folhas de competência 2025.
    vigenteDesde: '2025-01',
    faixas: [
      { ate: 1518.00, aliquota: 0.075 },
      { ate: 2793.88, aliquota: 0.09  },
      { ate: 4190.83, aliquota: 0.12  },
      { ate: 8157.41, aliquota: 0.14  },
    ],
  },
]

interface FaixaIrrf { ate: number; aliquota: number; deducao: number }
interface TabelaIrrf { vigenteDesde: string; faixas: FaixaIrrf[] }

// Mais recente primeiro.
const TABELAS_IRRF: TabelaIrrf[] = [
  {
    // Lei nº 15.191, de 11/8/2025 — vigente desde a competência maio/2025, ainda em
    // vigor em 2026 (não houve nova alteração de faixas para 2026, só o redutor abaixo).
    vigenteDesde: '2025-05',
    faixas: [
      { ate: 2428.80,  aliquota: 0,     deducao: 0       },
      { ate: 2826.65,  aliquota: 0.075, deducao: 182.16  },
      { ate: 3751.05,  aliquota: 0.15,  deducao: 394.16  },
      { ate: 4664.68,  aliquota: 0.225, deducao: 675.49  },
      { ate: Infinity, aliquota: 0.275, deducao: 908.73  },
    ],
  },
  {
    // Lei nº 14.848, de 1/5/2024 — vigente desde a competência fevereiro/2024 até
    // abril/2025. Mantida só para recálculo retroativo.
    vigenteDesde: '2024-02',
    faixas: [
      { ate: 2259.20,  aliquota: 0,     deducao: 0       },
      { ate: 2826.65,  aliquota: 0.075, deducao: 169.44  },
      { ate: 3751.05,  aliquota: 0.15,  deducao: 381.44  },
      { ate: 4664.68,  aliquota: 0.225, deducao: 662.77  },
      { ate: Infinity, aliquota: 0.275, deducao: 896.00  },
    ],
  },
]

/** Escolhe a tabela vigente na competência informada (ou a mais recente, se omitida). */
function tabelaVigente<T extends { vigenteDesde: string }>(tabelas: T[], competencia?: string): T {
  if (!competencia) return tabelas[0]
  return tabelas.find((t) => t.vigenteDesde <= competencia) ?? tabelas[tabelas.length - 1]
}

export function calcularINSS(salarioBruto: number, competencia?: string): { base: number; valor: number } {
  const { faixas } = tabelaVigente(TABELAS_INSS, competencia)
  let inss = 0
  let baseAnterior = 0
  for (const faixa of faixas) {
    if (salarioBruto <= 0) break
    const base = Math.min(salarioBruto, faixa.ate) - baseAnterior
    if (base <= 0) break
    inss += base * faixa.aliquota
    baseAnterior = faixa.ate
    if (salarioBruto <= faixa.ate) break
  }
  return { base: salarioBruto, valor: Math.round(inss * 100) / 100 }
}

// Lei 15.270/2025: redutor adicional sobre o IRRF da tabela tradicional — isenção total
// até R$ 5.000 de rendimento tributável, redução parcial entre R$ 5.000,01 e R$ 7.350,00,
// tabela tradicional pura acima disso. Só existe a partir da competência 2026-01 — antes
// disso a lei não existia, então o redutor não deve ser aplicado.
const REDUTOR_VIGENTE_DESDE = '2026-01'
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
  competencia?: string,
): { base: number; valor: number } {
  const { faixas } = tabelaVigente(TABELAS_IRRF, competencia)
  const deducao = regimeIrrf === 'simplificado' ? DESCONTO_SIMPLIFICADO : 189.59 * dependentes
  const base = Math.max(0, baseCalculo - deducao)

  let irrfTabela = 0
  for (const faixa of faixas) {
    if (base <= faixa.ate) {
      irrfTabela = Math.max(0, base * faixa.aliquota - faixa.deducao)
      break
    }
  }

  // rendimentoTributavel = base já reduzida pela dedução de dependentes (após INSS)
  const rendimentoTributavel = base
  let valor = irrfTabela
  const redutorVigente = (competencia ?? REDUTOR_VIGENTE_DESDE) >= REDUTOR_VIGENTE_DESDE
  if (redutorVigente && rendimentoTributavel <= REDUTOR_ISENCAO_ATE) {
    valor = 0
  } else if (redutorVigente && rendimentoTributavel <= REDUTOR_LIMITE_ATE) {
    const redutor = REDUTOR_A - (REDUTOR_B * rendimentoTributavel)
    valor = Math.max(0, irrfTabela - redutor)
  }

  return { base, valor: Math.round(valor * 100) / 100 }
}

function fmtAliquota(aliquota: number): string {
  if (aliquota === 0) return 'Isento'
  const pct = (aliquota * 100).toFixed(1).replace(/\.0$/, '')
  return `${pct.replace('.', ',')}%`
}

/** Rótulo da faixa da tabela tradicional de IRRF (para exibição no holerite), vigente
 *  na competência informada — usa a mesma tabela de `calcularIRRF`, então não duplica
 *  faixas em outro arquivo. */
export function descreverFaixaIrrf(baseCalculo: number, competencia?: string): string {
  const { faixas } = tabelaVigente(TABELAS_IRRF, competencia)
  const faixa = faixas.find((f) => baseCalculo <= f.ate) ?? faixas[faixas.length - 1]
  return fmtAliquota(faixa.aliquota)
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
