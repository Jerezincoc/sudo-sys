import PDFDocument from 'pdfkit'
import fs from 'fs'

export interface HoleriteData {
  empresa: { razao_social: string; cnpj: string; endereco: string; cidade: string; uf: string }
  funcionario: {
    codigo: string
    nome: string
    cpf: string
    cargo: string
    cbo_codigo: string
    departamento: string
    data_admissao: string
    pis_pasep: string
    ctps: string
  }
  competencia: string
  lancamentos: Array<{
    codigo: string
    nome: string
    tipo: 'provento' | 'desconto' | 'informativo'
    referencia: string
    valor: number
  }>
  totais: {
    proventos: number
    descontos: number
    liquido: number
    base_inss: number
    valor_inss: number
    base_irrf: number
    valor_irrf: number
    fgts_mes: number
  }
}

// ── Layout constants ────────────────────────────────────────────────────────
const ML         = 20      // left margin
const BODY_W     = 495     // body width (table area)
const VIA_H      = 390     // each via height
const ROW_H      = 13      // table row height
const MIN_ROWS   = 15      // min rows (fills body)

// Section heights — fixed, sum <= VIA_H
const EMPRESA_H     = 42
const FUNC_H        = 24
const TABLE_HDR_H   = 13
const FOOTER_TOT_H  = 36
const FOOTER_BASE_H = 26
const SIGN_H        = 52   // faixa de assinatura horizontal (fim de cada via)
// Rows budget: 390 - (42+24+13+36+26+52) = 197 → floor(197/13)=15 rows ✓

// Colors
const BORDER_C = '#aaaaaa'
const LABEL_C  = '#777777'
const HDR_BG   = '#dddddd'

// Table column defs: 28+220+70+88+89=495
const COL_COD  = { x: ML,       w: 28  }
const COL_DESC = { x: ML + 28,  w: 220 }
const COL_REF  = { x: ML + 248, w: 70  }
const COL_PRO  = { x: ML + 318, w: 88  }
const COL_DES  = { x: ML + 406, w: 89  }

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtCompetencia(s: string) {
  const [y, m] = s.split('-')
  return `${MESES[parseInt(m, 10) - 1]}/${y}`
}

function fmtCnpj(s: string) {
  const d = s.replace(/\D/g, '')
  if (d.length !== 14) return s
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

function fmtIrrfFaixa(base: number): string {
  if (base <= 2259.20) return 'Isento'
  if (base <= 2826.65) return '7,5%'
  if (base <= 3751.05) return '15%'
  if (base <= 4664.68) return '22,5%'
  return '27,5%'
}

function drawVia(doc: PDFKit.PDFDocument, data: HoleriteData, y0: number): void {
  const numRows = Math.max(data.lancamentos.length, MIN_ROWS)
  let y = y0

  // ── Cabeçalho Empresa ────────────────────────────────────────────────────
  doc.rect(ML, y, BODY_W, EMPRESA_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()

  doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
    .text('EMPREGADOR', ML + 3, y + 2, { lineBreak: false })

  doc.fontSize(8).font('Helvetica-Bold').fillColor('#111111')
    .text(data.empresa.razao_social, ML + 3, y + 10, { lineBreak: false, width: BODY_W / 2 - 6 })

  doc.fontSize(7).font('Helvetica').fillColor('#333333')
    .text(`Endereço: ${data.empresa.endereco}`, ML + 3, y + 22, { lineBreak: false, width: BODY_W / 2 - 6 })
  doc.text(`${data.empresa.cidade}/${data.empresa.uf}   CNPJ: ${fmtCnpj(data.empresa.cnpj)}`,
    ML + 3, y + 31, { lineBreak: false, width: BODY_W / 2 - 6 })

  doc.fontSize(11).font('Helvetica-Bold').fillColor('#1e4f8a')
    .text('Recibo de Pagamento de Salário',
      ML + BODY_W / 2, y + 7, { lineBreak: false, width: BODY_W / 2 - 6, align: 'right' })

  doc.fontSize(7).font('Helvetica').fillColor('#333333')
    .text(`Referente ao Mês/Ano: ${fmtCompetencia(data.competencia)}`,
      ML + BODY_W / 2, y + 28, { lineBreak: false, width: BODY_W / 2 - 6, align: 'right' })

  y += EMPRESA_H

  // ── Linha Funcionário ────────────────────────────────────────────────────
  doc.rect(ML, y, BODY_W, FUNC_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()

  const funcCols = [
    { label: 'CÓDIGO',              w: 60,  value: data.funcionario.codigo },
    { label: 'NOME DO FUNCIONÁRIO', w: 195, value: data.funcionario.nome   },
    { label: 'CBO',                 w: 120, value: data.funcionario.cbo_codigo },
    { label: 'FUNÇÃO',              w: 120, value: data.funcionario.cargo  },
  ]
  let fx = ML
  for (const fc of funcCols) {
    doc.moveTo(fx, y).lineTo(fx, y + FUNC_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
    doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
      .text(fc.label, fx + 3, y + 3, { lineBreak: false, width: fc.w - 4 })
    doc.fontSize(8).font('Helvetica').fillColor('#111111')
      .text(fc.value, fx + 3, y + 13, { lineBreak: false, width: fc.w - 4 })
    fx += fc.w
  }
  y += FUNC_H

  // ── Cabeçalho tabela ─────────────────────────────────────────────────────
  doc.rect(ML, y, BODY_W, TABLE_HDR_H).fillColor(HDR_BG).fill()
  doc.rect(ML, y, BODY_W, TABLE_HDR_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()

  const tHdrCols = [
    { label: 'CÓD.',       ...COL_COD  },
    { label: 'DESCRIÇÃO',  ...COL_DESC },
    { label: 'REFERÊNCIA', ...COL_REF  },
    { label: 'PROVENTOS',  ...COL_PRO  },
    { label: 'DESCONTOS',  ...COL_DES  },
  ]
  for (const c of tHdrCols) {
    doc.moveTo(c.x, y).lineTo(c.x, y + TABLE_HDR_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333')
      .text(c.label, c.x + 2, y + 3, { lineBreak: false, width: c.w - 4 })
  }
  y += TABLE_HDR_H

  // ── Linhas lançamentos ───────────────────────────────────────────────────
  for (let i = 0; i < numRows; i++) {
    const l = data.lancamentos[i]
    const bg = i % 2 === 0 ? '#ffffff' : '#f5f5f5'
    doc.rect(ML, y, BODY_W, ROW_H).fillColor(bg).fill()
    doc.rect(ML, y, BODY_W, ROW_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()

    for (const cx2 of [COL_DESC.x, COL_REF.x, COL_PRO.x, COL_DES.x]) {
      doc.moveTo(cx2, y).lineTo(cx2, y + ROW_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
    }

    if (l) {
      doc.fontSize(8).font('Helvetica').fillColor('#111111')
      doc.text(l.codigo, COL_COD.x + 2, y + 2.5, { lineBreak: false, width: COL_COD.w - 4 })
      doc.text(l.nome,   COL_DESC.x + 2, y + 2.5, { lineBreak: false, width: COL_DESC.w - 4 })
      if (l.referencia) {
        doc.text(l.referencia, COL_REF.x + 2, y + 2.5,
          { lineBreak: false, width: COL_REF.w - 4, align: 'right' })
      }
      if (l.tipo === 'provento' && l.valor > 0) {
        doc.text(fmtMoeda(l.valor), COL_PRO.x + 2, y + 2.5,
          { lineBreak: false, width: COL_PRO.w - 4, align: 'right' })
      } else if (l.tipo === 'desconto' && l.valor > 0) {
        doc.text(fmtMoeda(l.valor), COL_DES.x + 2, y + 2.5,
          { lineBreak: false, width: COL_DES.w - 4, align: 'right' })
      }
    }
    y += ROW_H
  }

  // ── Rodapé totais ────────────────────────────────────────────────────────
  const MSG_W     = BODY_W - 300  // 195
  const TOT_COL_W = 150
  const HALF_H    = FOOTER_TOT_H / 2  // 18

  // Mensagens (full height)
  doc.rect(ML, y, MSG_W, FOOTER_TOT_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
    .text('MENSAGENS', ML + 3, y + 3, { lineBreak: false })

  // Total Vencimentos (top half)
  const tvX = ML + MSG_W
  doc.rect(tvX, y, TOT_COL_W, HALF_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
    .text('Total Vencimentos', tvX + 3, y + 2, { lineBreak: false, width: TOT_COL_W - 6 })
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#111111')
    .text(fmtMoeda(data.totais.proventos), tvX + 3, y + 9,
      { lineBreak: false, width: TOT_COL_W - 6, align: 'right' })

  // Total Descontos (top half)
  const tdX = tvX + TOT_COL_W
  doc.rect(tdX, y, TOT_COL_W, HALF_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
    .text('Total Descontos', tdX + 3, y + 2, { lineBreak: false, width: TOT_COL_W - 6 })
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#111111')
    .text(fmtMoeda(data.totais.descontos), tdX + 3, y + 9,
      { lineBreak: false, width: TOT_COL_W - 6, align: 'right' })

  // Líquido a Receber (bottom half, spans both cols)
  const liqY = y + HALF_H
  doc.rect(tvX, liqY, TOT_COL_W * 2, HALF_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
    .text('Líquido a Receber:', tvX + 3, liqY + 2, { lineBreak: false })
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#1e4f8a')
    .text(fmtMoeda(data.totais.liquido), tvX + 3, liqY + 7,
      { lineBreak: false, width: TOT_COL_W * 2 - 6, align: 'right' })

  y += FOOTER_TOT_H

  // ── Rodapé bases ─────────────────────────────────────────────────────────
  const baseColW = BODY_W / 6
  const bases = [
    { label: 'Salário Base',   value: fmtMoeda(data.totais.proventos) },
    { label: 'Base Calc INSS', value: fmtMoeda(data.totais.base_inss) },
    { label: 'Base Calc FGTS', value: fmtMoeda(data.totais.base_inss) },
    { label: 'FGTS Mês',       value: fmtMoeda(data.totais.fgts_mes)  },
    { label: 'Base IRRF',      value: fmtMoeda(data.totais.base_irrf) },
    { label: 'Faixa IRRF',     value: fmtIrrfFaixa(data.totais.base_irrf) },
  ]
  for (let i = 0; i < bases.length; i++) {
    const b = bases[i]
    const bx = ML + baseColW * i
    doc.rect(bx, y, baseColW, FOOTER_BASE_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
    doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
      .text(b.label, bx + 2, y + 2, { lineBreak: false, width: baseColW - 4 })
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#111111')
      .text(b.value, bx + 2, y + 13, { lineBreak: false, width: baseColW - 4, align: 'right' })
  }
  y += FOOTER_BASE_H

  // ── Faixa de assinatura (horizontal, mesma orientação da página) ────────
  doc.rect(ML, y, BODY_W, SIGN_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()

  doc.fontSize(7).font('Helvetica').fillColor('#333333')
    .text('Declaro ter recebido a importância líquida discriminada neste holerite.',
      ML + 10, y + 8, { lineBreak: false, width: BODY_W - 20 })

  const sigLineY  = y + 34
  const sigLabelY = y + 38
  const sigLineW  = 300

  doc.moveTo(ML + 10, sigLineY).lineTo(ML + 10 + sigLineW, sigLineY)
    .lineWidth(0.5).strokeColor('#555555').stroke()
  doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
    .text('Assinatura do Funcionário', ML + 10, sigLabelY, { lineBreak: false, width: sigLineW })

  const dataX = ML + 10 + sigLineW + 20
  doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
    .text('Data:  ____ / ____ / ________', dataX, sigLabelY, { lineBreak: false })
}

function drawSeparator(doc: PDFKit.PDFDocument, sepY: number): void {
  const x1 = ML
  const x2 = ML + BODY_W
  const midX = (x1 + x2) / 2

  doc.moveTo(x1, sepY).lineTo(midX - 8, sepY)
    .dash(4, { space: 3 }).lineWidth(0.5).strokeColor('#999999').stroke()
  doc.undash()
  doc.fontSize(9).font('Helvetica').fillColor('#999999')
    .text('✂', midX - 6, sepY - 6, { lineBreak: false })
  doc.moveTo(midX + 8, sepY).lineTo(x2, sepY)
    .dash(4, { space: 3 }).lineWidth(0.5).strokeColor('#999999').stroke()
  doc.undash()
}

export class HoleriteRenderer {
  static render(data: HoleriteData, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true })
      const stream = fs.createWriteStream(filePath)
      doc.pipe(stream)
      stream.on('finish', resolve)
      stream.on('error', reject)

      drawVia(doc, data, 15)
      drawSeparator(doc, 410)
      drawVia(doc, data, 420)

      doc.end()
    })
  }

  static renderMulti(items: HoleriteData[], filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true })
      const stream = fs.createWriteStream(filePath)
      doc.pipe(stream)
      stream.on('finish', resolve)
      stream.on('error', reject)

      items.forEach((data, idx) => {
        if (idx > 0) doc.addPage()
        drawVia(doc, data, 15)
        drawSeparator(doc, 410)
        drawVia(doc, data, 420)
      })

      doc.end()
    })
  }
}
