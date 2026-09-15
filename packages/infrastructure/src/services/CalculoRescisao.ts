import type { Rescisao } from '@sudo-sys/shared'

// Motor de cálculo das verbas rescisórias (TRCT). Extraído de `rescisaoHandlers.ts`
// para ser testável isoladamente (mesmo padrão de `CalculoFolha.ts`) e validado verba a
// verba contra o texto legal na ACAO-0033. Pontos marcados [A CONFIRMAR] mantêm o
// comportamento original de propósito — ver REC-0019 em CONTEXTO_TOTAL.md.

export interface EntradaRescisao {
  dataAdmissao: string // AAAA-MM-DD
  dataDemissao: string // AAAA-MM-DD (último dia trabalhado)
  motivo: Rescisao['motivo']
  avisoPrevio: Rescisao['aviso_previo']
  salario: number
  diasTrabalhados: number
  feriasVencidas: number // valor simples, sem o 1/3
  outrosProventos: number
  inss: number
  irrf: number
  outrosDescontos: number
  multaFgtsInformada: number
}

export interface ResultadoRescisao {
  saldoSalario: number
  feriasProporcionais: number
  umTercoFerias: number // 1/3 sobre férias vencidas + proporcionais
  decimoTerceiro: number
  avisoPrevioDias: number
  avisoPrevioValor: number
  /** Informativa: depositada na conta vinculada (Lei 8.036/90, art. 18 §1º), não soma ao líquido. */
  multaFgts: number
  totalProventos: number
  totalDescontos: number
  valorLiquido: number
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

/** Soma meses preservando o dia, limitado ao último dia do mês de destino. */
function addMonths(d: Date, n: number): Date {
  const alvo = new Date(d.getFullYear(), d.getMonth() + n, 1)
  const ultimoDia = new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0).getDate()
  return new Date(alvo.getFullYear(), alvo.getMonth(), Math.min(d.getDate(), ultimoDia))
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

/** Anos completos de serviço, contando o dia da demissão como trabalhado. */
function anosCompletos(adm: Date, dem: Date): number {
  const limite = addDays(dem, 1)
  let anos = 0
  while (addMonths(adm, 12 * (anos + 1)) <= limite) anos++
  return anos
}

/** Lei 12.506/2011 + Nota Técnica 184/2012/CGRT/SRT/MTE: 30 dias, +3 por ano completo, máximo 90. */
export function diasAvisoPrevio(dataAdmissao: string, dataDemissao: string): number {
  const anos = anosCompletos(parseLocalDate(dataAdmissao), parseLocalDate(dataDemissao))
  return Math.min(30 + 3 * anos, 90)
}

/** CLT art. 146, parágrafo único: 1/12 por mês de serviço ou fração superior a 14 dias,
 *  no período aquisitivo em curso na data de demissão. */
function avosFerias(adm: Date, dem: Date, fim: Date): number {
  let inicio = adm
  while (addMonths(inicio, 12) <= dem) inicio = addMonths(inicio, 12)
  const limite = addDays(fim, 1)
  let meses = 0
  while (addMonths(inicio, meses + 1) <= limite) meses++
  const resto = diffDays(addMonths(inicio, meses), limite)
  return Math.min(meses + (resto > 14 ? 1 : 0), 12)
}

/** Lei 4.090/62, art. 1º §§1º-2º: 1/12 por mês do ano com 15 ou mais dias de trabalho. */
function avos13(adm: Date, dem: Date, fim: Date): number {
  const inicioAno = new Date(dem.getFullYear(), 0, 1)
  const inicio = adm > inicioAno ? adm : inicioAno
  let avos = 0
  for (let m = new Date(inicio.getFullYear(), inicio.getMonth(), 1); m <= fim; m = addMonths(m, 1)) {
    const fimMes = new Date(m.getFullYear(), m.getMonth() + 1, 0)
    const de = inicio > m ? inicio : m
    const ate = fim < fimMes ? fim : fimMes
    if (diffDays(de, ate) + 1 >= 15) avos++
  }
  return avos
}

export function calcularRescisao(e: EntradaRescisao): ResultadoRescisao {
  const sal = e.salario
  const adm = parseLocalDate(e.dataAdmissao)
  const dem = parseLocalDate(e.dataDemissao)
  const indenizado = e.avisoPrevio === 'indenizado'

  // ── 1. Saldo de salário (CLT art. 64: mensalista, divisor 30) ────────────────
  const saldoSalario = round2((sal / 30) * e.diasTrabalhados)

  // ── 2. Aviso prévio ─────────────────────────────────────────────────────────
  // CLT art. 487: devido pela parte que rescinde "sem justo motivo" — o empregador não
  // indeniza aviso na justa causa nem no pedido de demissão (§2º dá ao empregador, não ao
  // empregado, o direito sobre o prazo não cumprido). Art. 484-A, I, a: metade no acordo.
  // Aposentadoria: [A CONFIRMAR] — mantém o comportamento original (30 dias, se indenizado).
  let avisoPrevioDias = 0
  let avisoPrevioValor = 0
  if (indenizado) {
    if (e.motivo === 'sem_justa_causa' || e.motivo === 'acordo_mutuo') {
      avisoPrevioDias = diasAvisoPrevio(e.dataAdmissao, e.dataDemissao)
      const integral = (sal / 30) * avisoPrevioDias
      avisoPrevioValor = round2(e.motivo === 'acordo_mutuo' ? integral / 2 : integral)
    } else if (e.motivo === 'aposentadoria') {
      avisoPrevioDias = 30
      avisoPrevioValor = round2(sal)
    }
  }

  // CLT art. 487 §1º/§6º + OJ 82 SBDI-1/TST: o aviso indenizado integra o tempo de serviço.
  // Projeção aplicada só na dispensa sem justa causa; no acordo (aviso pela metade) a
  // extensão da projeção é [A CONFIRMAR].
  const fimProjetado =
    indenizado && e.motivo === 'sem_justa_causa' ? addDays(dem, avisoPrevioDias) : dem

  // ── 3. Férias vencidas + proporcionais, com 1/3 (CF art. 7º XVII; Súmula 328/TST) ─
  // Justa causa: CLT art. 146 p.ú. e Súmula 171/TST negam as proporcionais, mas o tema
  // está afetado no TST (IRR Tema 96, sem tese) — [A CONFIRMAR], comportamento mantido.
  const feriasProporcionais = round2((sal / 12) * avosFerias(adm, dem, fimProjetado))
  const umTercoFerias = round2(round2(e.feriasVencidas / 3) + round2(feriasProporcionais / 3))

  // ── 4. 13º proporcional (Lei 4.090/62; Súmula 157/TST no pedido de demissão) ────
  // Justa causa: Lei 4.090 art. 3º nega, mas mesmo IRR Tema 96 — [A CONFIRMAR], mantido.
  const decimoTerceiro = round2((sal / 12) * avos13(adm, dem, fimProjetado))

  // ── 5. Multa FGTS ───────────────────────────────────────────────────────────
  // Lei 8.036/90 art. 18 §1º (40%, despedida sem justa causa) e CLT art. 484-A, I, b (20%,
  // acordo). O valor continua informado manualmente (o sistema não tem o saldo da conta
  // vinculada); é DEPOSITADO na conta vinculada, então não entra no total nem no líquido.
  const multaFgts =
    e.motivo === 'sem_justa_causa' || e.motivo === 'acordo_mutuo'
      ? round2(e.multaFgtsInformada)
      : 0

  const totalProventos = round2(
    saldoSalario + e.feriasVencidas + feriasProporcionais + umTercoFerias +
    decimoTerceiro + avisoPrevioValor + e.outrosProventos,
  )
  // ── 6. INSS/IRRF: informados manualmente (não há cálculo nem separação de bases) ─
  const totalDescontos = round2(e.inss + e.irrf + e.outrosDescontos)
  const valorLiquido   = round2(totalProventos - totalDescontos)

  return {
    saldoSalario, feriasProporcionais, umTercoFerias, decimoTerceiro,
    avisoPrevioDias, avisoPrevioValor, multaFgts, totalProventos, totalDescontos, valorLiquido,
  }
}
