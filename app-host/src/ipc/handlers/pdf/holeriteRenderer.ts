import { app } from 'electron'
import path from 'path'
import fs from 'fs'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const PDFDocument: any = require('pdfkit')

export interface HoleriteRubrica {
  codigo: string
  descricao: string
  referencia: string
  proventos?: number
  descontos?: number
}

export interface HoleriteData {
  empresa: { nome: string; endereco: string; cnpj: string }
  funcionario: { codigo: string; nome: string; cbo_descricao: string }
  competencia: string
  rubricas: HoleriteRubrica[]
  totais: { vencimentos: number; descontos: number; liquido: number }
  bases: {
    salarioBase: number
    baseInss: number
    baseFgts: number
    fgtsMes: number
    baseIrrf: number
    faixaIrrf: string
  }
}

function fmtMoney(v: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)
}

function tmpPath(): string {
  return path.join(app.getPath('temp'), `holerite-${Date.now()}.pdf`)
}

// ── Geometry ──────────────────────────────────────────────────────────────────
const PAGE_W = 595
const PAGE_H = 842
const VIA_H = 410        // height of each via
const SEP_Y = PAGE_H / 2 // y of separator line = 421
const CANHOTO_W = 65     // width of left vertical strip
const MAIN_X = CANHOTO_W
const MAIN_W = PAGE_W - CANHOTO_W
const INNER_PAD = 5

// ── Canhoto ───────────────────────────────────────────────────────────────────
//
// After rotate(-90, {origin:[cx, cy]}), a point drawn at rotated coords (rx, ry) maps to:
//   page_x = cx + ry - cy
//   page_y = cx + cy - rx
//
// With cx = CANHOTO_W/2, cy = via_y + VIA_H/2:
//   ry = cy              → page_x = cx (centered in strip horizontally)
//   rx = cx + cy - page_y → to target a specific page_y in the strip
//
// Strip: page_y from via_y to via_y+VIA_H
//   rx at bottom (page_y = via_y + VIA_H - 8):  rx = cx - VIA_H/2 + 8  ≈ -155
//   rx at top    (page_y = via_y + 8):           rx = cx + VIA_H/2 - 8  ≈ +210
//
// A signature line spanning strip width (horizontal on page when reading rotated):
//   moveTo(rx, cy - 28).lineTo(rx, cy + 28) → page_x from cx-28 to cx+28 (centered in strip)

function drawCanhoto(doc: any, via_y: number): void {
  const cx = CANHOTO_W / 2           // 32.5
  const cy = via_y + VIA_H / 2

  // Strip background
  doc.rect(0, via_y, CANHOTO_W, VIA_H).fillColor('#f2f2f2').fill()
  // Right border
  doc.moveTo(CANHOTO_W, via_y).lineTo(CANHOTO_W, via_y + VIA_H)
    .lineWidth(0.5).strokeColor('#bbbbbb').stroke()

  doc.save()
  doc.rotate(-90, { origin: [cx, cy] })

  // Helper: rx position for a given page_y within this via
  const rxAt = (page_y: number) => cx + cy - page_y

  // ── DECLARO text (near bottom of strip) ──────────────────────────────
  const declaroText = 'DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DISCRIMINADA NESTE RECIBO.'
  const declaroRx = rxAt(via_y + VIA_H - 10)   // ≈ bottom edge
  doc.font('Helvetica').fontSize(5.5).fillColor('#444444')
    .text(declaroText, declaroRx, cy - 4, {
      width: VIA_H * 0.48,
      align: 'left',
      lineBreak: true,
    })

  // ── Signature line (horizontal on page = vertical in rotated frame) ──
  const sigRx = rxAt(via_y + VIA_H * 0.38)
  doc.moveTo(sigRx, cy - 27).lineTo(sigRx, cy + 27)
    .lineWidth(0.5).strokeColor('#555555').stroke()

  // ── ASSINATURA label ─────────────────────────────────────────────────
  const asnRx = rxAt(via_y + VIA_H * 0.38 - 6)
  doc.font('Helvetica').fontSize(5).fillColor('#555555')
    .text('ASSINATURA DO FUNCIONÁRIO', asnRx - 50, cy - 4, {
      width: 100,
      align: 'center',
      lineBreak: false,
    })

  // ── DATA label ───────────────────────────────────────────────────────
  const dataRx = rxAt(via_y + VIA_H * 0.18)
  doc.font('Helvetica').fontSize(5).fillColor('#555555')
    .text('DATA: ____/____/________', dataRx - 40, cy - 3, {
      width: 80,
      align: 'center',
      lineBreak: false,
    })

  doc.restore()
}

// ── Main block of each via ────────────────────────────────────────────────────

function drawVia(doc: any, via_y: number, data: HoleriteData, viaLabel: string): void {
  drawCanhoto(doc, via_y)

  const x0 = MAIN_X + INNER_PAD
  const w  = MAIN_W - INNER_PAD * 2
  let y    = via_y + INNER_PAD

  // ── Via label (top-right corner, tiny) ───────────────────────────────
  doc.font('Helvetica').fontSize(5.5).fillColor('#999999')
    .text(viaLabel, MAIN_X, via_y + 2, { width: MAIN_W - 4, align: 'right', lineBreak: false })
  doc.fillColor('#000000')

  // ── Empresa header ────────────────────────────────────────────────────
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1a1a2e')
    .text(data.empresa.nome, x0, y, { width: w, align: 'center', lineBreak: false })
  y += 11
  doc.font('Helvetica').fontSize(6.5).fillColor('#444444')
    .text(`CNPJ: ${data.empresa.cnpj}${data.empresa.endereco ? '  |  ' + data.empresa.endereco : ''}`,
      x0, y, { width: w, align: 'center', lineBreak: false })
  y += 9

  // Thin divider
  doc.moveTo(MAIN_X, y).lineTo(PAGE_W, y).lineWidth(0.3).strokeColor('#cccccc').stroke()
  y += 4

  // ── Título ────────────────────────────────────────────────────────────
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#1a1a2e')
    .text('RECIBO DE PAGAMENTO DE SALÁRIO', x0, y, { width: w, align: 'center', lineBreak: false })
  y += 9
  doc.font('Helvetica').fontSize(6.5).fillColor('#555555')
    .text(`Referente ao Mês/Ano: ${data.competencia}`, x0, y, { width: w, align: 'center', lineBreak: false })
  y += 8

  // ── Faixa funcionário (dark bg) ───────────────────────────────────────
  const faixaH = 22
  doc.rect(MAIN_X, y, MAIN_W, faixaH).fillColor('#1a1a2e').fill()

  // Column widths: CÓDIGO=50, NOME=resto, CBO FUNÇÃO=130
  const COL_COD  = 50
  const COL_CBO  = 130
  const COL_NOME = MAIN_W - 4 - COL_COD - COL_CBO

  const labelY = y + 2
  const valY   = y + 11

  doc.font('Helvetica').fontSize(5.5).fillColor('#aaaaaa')
    .text('CÓDIGO', MAIN_X + 4,              labelY, { width: COL_COD,  lineBreak: false })
    .text('NOME DO FUNCIONÁRIO', MAIN_X + 4 + COL_COD, labelY, { width: COL_NOME, lineBreak: false })
    .text('CBO / FUNÇÃO', MAIN_X + MAIN_W - COL_CBO - 4, labelY, { width: COL_CBO, align: 'right', lineBreak: false })

  doc.font('Helvetica-Bold').fontSize(7).fillColor('#ffffff')
    .text(data.funcionario.codigo,      MAIN_X + 4,              valY, { width: COL_COD,  lineBreak: false })
    .text(data.funcionario.nome,        MAIN_X + 4 + COL_COD,   valY, { width: COL_NOME, lineBreak: false })
    .text(data.funcionario.cbo_descricao, MAIN_X + MAIN_W - COL_CBO - 4, valY, { width: COL_CBO, align: 'right', lineBreak: false })
  y += faixaH

  // ── Grid de rubricas ─────────────────────────────────────────────────
  const GCW = [32, 0, 52, 60, 60]  // CÓD, DESC(auto), REF, PROVENTOS, DESCONTOS
  GCW[1] = MAIN_W - GCW[0] - GCW[2] - GCW[3] - GCW[4]

  const gx = [
    MAIN_X,
    MAIN_X + GCW[0],
    MAIN_X + GCW[0] + GCW[1],
    MAIN_X + GCW[0] + GCW[1] + GCW[2],
    MAIN_X + GCW[0] + GCW[1] + GCW[2] + GCW[3],
  ]

  // Grid header
  const GRID_HDR_H = 11
  doc.rect(MAIN_X, y, MAIN_W, GRID_HDR_H).fillColor('#f0f0f0').fill()
  doc.font('Helvetica-Bold').fontSize(5.5).fillColor('#333333')
    .text('CÓD',       gx[0] + 2, y + 2, { width: GCW[0] - 2, lineBreak: false })
    .text('DESCRIÇÃO', gx[1] + 2, y + 2, { width: GCW[1] - 2, lineBreak: false })
    .text('REFERÊNCIA', gx[2] + 2, y + 2, { width: GCW[2] - 2, align: 'right', lineBreak: false })
    .text('PROVENTOS',  gx[3] + 2, y + 2, { width: GCW[3] - 2, align: 'right', lineBreak: false })
    .text('DESCONTOS',  gx[4] + 2, y + 2, { width: GCW[4] - 2, align: 'right', lineBreak: false })
  y += GRID_HDR_H

  // Grid rows
  const ROW_H = 12
  const MAX_ROWS = Math.floor((VIA_H - 120) / ROW_H)  // dynamic limit
  const rows = data.rubricas.slice(0, MAX_ROWS)

  rows.forEach((r, i) => {
    const bg = i % 2 === 0 ? '#ffffff' : '#e8e8e8'
    doc.rect(MAIN_X, y, MAIN_W, ROW_H).fillColor(bg).fill()
    doc.font('Helvetica').fontSize(6).fillColor('#222222')
      .text(r.codigo,    gx[0] + 2, y + 3, { width: GCW[0] - 2, lineBreak: false })
      .text(r.descricao, gx[1] + 2, y + 3, { width: GCW[1] - 2, lineBreak: false })
      .text(r.referencia || '', gx[2] + 2, y + 3, { width: GCW[2] - 4, align: 'right', lineBreak: false })
    if (r.proventos != null)
      doc.text(fmtMoney(r.proventos), gx[3] + 2, y + 3, { width: GCW[3] - 4, align: 'right', lineBreak: false })
    if (r.descontos != null)
      doc.text(fmtMoney(r.descontos), gx[4] + 2, y + 3, { width: GCW[4] - 4, align: 'right', lineBreak: false })
    y += ROW_H
  })

  // Grid bottom border
  doc.moveTo(MAIN_X, y).lineTo(PAGE_W, y).lineWidth(0.3).strokeColor('#bbbbbb').stroke()
  y += 4

  // ── Bases (2 colunas) ─────────────────────────────────────────────────
  const basesH = 22
  const bColW  = MAIN_W / 2
  const bases  = data.bases

  doc.rect(MAIN_X, y, MAIN_W, basesH).fillColor('#f7f7f7').fill()
  doc.moveTo(MAIN_X, y).lineTo(PAGE_W, y).lineWidth(0.3).strokeColor('#dddddd').stroke()

  const bLabelSz = 5
  const bValSz   = 6
  const bPad     = 3

  const bCol1x = MAIN_X + bPad
  const bCol2x = MAIN_X + bColW + bPad

  function baseItem(lx: number, by: number, label: string, val: string | number) {
    doc.font('Helvetica').fontSize(bLabelSz).fillColor('#777777')
      .text(label, lx, by, { width: bColW - bPad * 2, lineBreak: false })
    doc.font('Helvetica-Bold').fontSize(bValSz).fillColor('#222222')
      .text(typeof val === 'number' ? fmtMoney(val) : val, lx, by + bLabelSz + 1, { width: bColW - bPad * 2, lineBreak: false })
  }

  baseItem(bCol1x, y + 2, 'Salário Base',    bases.salarioBase)
  baseItem(bCol1x + 80, y + 2, 'Base INSS',  bases.baseInss)
  baseItem(bCol1x + 160, y + 2, 'Base FGTS', bases.baseFgts)
  baseItem(bCol2x, y + 2, 'FGTS Mês',        bases.fgtsMes)
  baseItem(bCol2x + 80, y + 2, 'Base IRRF',  bases.baseIrrf)
  baseItem(bCol2x + 160, y + 2, 'Faixa IRRF', bases.faixaIrrf)

  y += basesH + 3

  // ── Rodapé ────────────────────────────────────────────────────────────
  const TOT_W = 120
  const totX  = PAGE_W - TOT_W - 4

  doc.font('Helvetica').fontSize(6.5).fillColor('#333333')
    .text(`Total Vencimentos: R$ ${fmtMoney(data.totais.vencimentos)}`, totX, y, { width: TOT_W, align: 'right', lineBreak: false })
  y += 9
  doc.text(`Total Descontos:   R$ ${fmtMoney(data.totais.descontos)}`, totX, y, { width: TOT_W, align: 'right', lineBreak: false })
  y += 9
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#1a1a2e')
    .text(`Líquido a Receber: R$ ${fmtMoney(data.totais.liquido)}`, totX, y, { width: TOT_W, align: 'right', lineBreak: false })

  // MENSAGENS (left side)
  doc.font('Helvetica').fontSize(5.5).fillColor('#888888')
    .text('MENSAGENS:', x0, via_y + VIA_H - 28, { width: 160, lineBreak: false })
  doc.moveTo(x0, via_y + VIA_H - 18).lineTo(x0 + 160, via_y + VIA_H - 18)
    .lineWidth(0.3).strokeColor('#bbbbbb').stroke()

  doc.fillColor('#000000')
}

// ── Public API ────────────────────────────────────────────────────────────────

export function renderHolerite(data: HoleriteData): Promise<string> {
  return new Promise((resolve, reject) => {
    const filePath = tmpPath()
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    stream.on('finish', () => resolve(filePath))
    stream.on('error', reject)

    doc.addPage()

    // Via 1 (original) — top half
    drawVia(doc, 0, data, '1ª VIA — EMPRESA')

    // Separator line
    doc.moveTo(20, SEP_Y).lineTo(PAGE_W - 20, SEP_Y)
      .dash(5, { space: 3 }).lineWidth(0.5).strokeColor('#888888').stroke()
    doc.undash()
    doc.font('Helvetica').fontSize(7).fillColor('#888888')
      .text('✂', 10, SEP_Y - 5, { lineBreak: false })
    doc.fillColor('#000000')

    // Via 2 (funcionário) — bottom half
    drawVia(doc, SEP_Y + 1, data, '2ª VIA — FUNCIONÁRIO')

    doc.end()
  })
}
