import type { Rescisao } from '@sudo-sys/shared'
import { calcularFGTS, calcularINSS, calcularIRRF } from './CalculoFolha'

// Motor de cálculo das verbas rescisórias (TRCT). Extraído de `rescisaoHandlers.ts`
// para ser testável isoladamente (mesmo padrão de `CalculoFolha.ts`) e validado verba a
// verba contra o texto legal na ACAO-0033. Pontos marcados [A CONFIRMAR] mantêm o
// comportamento original de propósito — ver REC-0019 e REC-0021 em CONTEXTO_TOTAL.md.
// INSS/IRRF/FGTS rescisórios (ACAO-0035): plano e fontes em docs/plano-rec-0020.md.

/**
 * Dado obrigatorio ausente na entrada da rescisao. Segue o mesmo padrao de
 * `FormulaEvaluationError` (packages/domain/src/formula/FormulaEvaluator.ts): interromper
 * o calculo com erro claro e melhor do que produzir um valor errado em silencio.
 *
 * Nao importa a classe de `@sudo-sys/domain` de proposito: `infrastructure` e CommonJS e
 * `domain` e ESM (DEC-0004/DEC-0005), e criar esse consumidor exigiria a validacao de
 * interoperabilidade que a DEC-0005 deixou registrada como pendente. Reaproveita-se o
 * padrao, nao o modulo.
 */
export class DadoObrigatorioRescisaoError extends Error {
  constructor(
    readonly campo: string,
    mensagem: string,
  ) {
    super(mensagem)
    this.name = 'DadoObrigatorioRescisaoError'
  }
}

export interface EntradaRescisao {
  dataAdmissao: string // AAAA-MM-DD
  dataDemissao: string // AAAA-MM-DD (último dia trabalhado)
  motivo: Rescisao['motivo']
  avisoPrevio: Rescisao['aviso_previo']
  salario: number
  diasTrabalhados: number
  feriasVencidas: number // valor simples, sem o 1/3
  outrosProventos: number
  outrosDescontos: number
  /** Saldo da conta vinculada informado pelo usuario (o sistema nao acessa a conta CAIXA),
   *  sem os depositos gerados por esta rescisao.
   *  `null` significa NAO INFORMADO e e diferente de `0` (saldo informado como zero):
   *  com multa aplicavel e saldo nao informado o calculo falha, em vez de usar base parcial
   *  (ACAO-0036). */
  saldoFgts: number | null
  dependentes: number
  regimeIrrf: 'dependentes' | 'simplificado'
}

export interface ResultadoRescisao {
  saldoSalario: number
  feriasProporcionais: number
  umTercoFerias: number // 1/3 sobre férias vencidas + proporcionais
  decimoTerceiro: number
  avisoPrevioDias: number
  avisoPrevioValor: number
  inss: number // sobre o saldo de salário
  inssDecimoTerceiro: number
  irrf: number // sobre o saldo de salário
  irrfDecimoTerceiro: number
  /** Informativo: depósito de FGTS sobre saldo de salário, 13º e aviso indenizado. */
  fgtsRescisao: number
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

  // Tabelas de INSS/IRRF da competência da data de demissão.
  const competencia = e.dataDemissao.slice(0, 7)

  // ── 5. INSS (Lei 8.212/91 art. 28) ──────────────────────────────────────────
  // Base: só saldo de salário. Aviso indenizado (STJ Tema 478) e férias + 1/3 (art. 28
  // §9º d) não incidem. 13º calculado em separado, com teto próprio (Decreto 3.048/99
  // art. 214 §7º). "Outros proventos" ficam fora de todas as bases: natureza desconhecida
  // — [A CONFIRMAR], REC-0021.
  const inss               = calcularINSS(saldoSalario, competencia).valor
  const inssDecimoTerceiro = calcularINSS(decimoTerceiro, competencia).valor

  // ── 6. IRRF ─────────────────────────────────────────────────────────────────
  // Aviso indenizado (Lei 7.713/88 art. 6º V) e férias + 1/3 (Súmula 386/STJ) isentos.
  // 13º com tributação exclusiva, deduzindo o INSS do próprio 13º e dependentes (Lei
  // 8.134/90 art. 16). Redutor da Lei 15.270 sobre o valor bruto — [A CONFIRMAR], REC-0021.
  const irrf = calcularIRRF(saldoSalario - inss, e.dependentes, e.regimeIrrf, competencia, saldoSalario).valor
  const irrfDecimoTerceiro = calcularIRRF(
    decimoTerceiro - inssDecimoTerceiro, e.dependentes, e.regimeIrrf, competencia, decimoTerceiro,
  ).valor

  // ── 7. FGTS e multa ─────────────────────────────────────────────────────────
  // Depósito sobre saldo, 13º e aviso indenizado (Lei 8.036/90 art. 15; Súmula 305/TST);
  // férias indenizadas + 1/3 excluídas (art. 15 §6º). Multa: 40% (art. 18 §1º) ou 20% no
  // acordo (CLT art. 484-A, I, b) sobre todos os depósitos (Decreto 99.684/90 art. 9º §§1º
  // e 3º), incluindo o depósito do aviso indenizado — prática operacional da CAIXA; tema
  // sem tese firmada no TST (OJ 42 II / RR-1001438-06.2018), ver REC-0021. Ambos são
  // DEPOSITADOS na conta vinculada: não entram no total nem no líquido.
  const fgtsRescisao = calcularFGTS(saldoSalario + decimoTerceiro + avisoPrevioValor)
  const percentualMulta =
    e.motivo === 'sem_justa_causa' ? 0.4 : e.motivo === 'acordo_mutuo' ? 0.2 : 0

  // Trava da ACAO-0036: `saldoFgts` nulo significa NAO INFORMADO, nao zero. Sem ele a multa
  // sairia apenas sobre os depositos desta rescisao — base parcial e silenciosamente menor
  // que o saldo real da conta vinculada. Falha explicita, no padrao de FormulaEvaluationError.
  if (percentualMulta > 0 && e.saldoFgts == null) {
    throw new DadoObrigatorioRescisaoError(
      'saldoFgts',
      'Saldo FGTS p/ fins rescisorios nao informado. Sem esse saldo a multa do FGTS sairia ' +
        'calculada somente sobre os depositos desta rescisao, resultando em valor menor que o ' +
        'devido. Informe o saldo da conta vinculada (use 0 apenas se o saldo for realmente zero).',
    )
  }
  const multaFgts = round2(((e.saldoFgts ?? 0) + fgtsRescisao) * percentualMulta)

  const totalProventos = round2(
    saldoSalario + e.feriasVencidas + feriasProporcionais + umTercoFerias +
    decimoTerceiro + avisoPrevioValor + e.outrosProventos,
  )
  const totalDescontos = round2(inss + inssDecimoTerceiro + irrf + irrfDecimoTerceiro + e.outrosDescontos)
  const valorLiquido   = round2(totalProventos - totalDescontos)

  return {
    saldoSalario, feriasProporcionais, umTercoFerias, decimoTerceiro,
    avisoPrevioDias, avisoPrevioValor, inss, inssDecimoTerceiro, irrf, irrfDecimoTerceiro,
    fgtsRescisao, multaFgts, totalProventos, totalDescontos, valorLiquido,
  }
}
