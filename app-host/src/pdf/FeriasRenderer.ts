import PDFDocument from 'pdfkit'
import fs from 'fs'

export interface FeriasData {
  empresa: { razao_social: string; cnpj: string; endereco: string; cidade: string; uf: string }
  funcionario: { codigo: string; nome: string; cpf: string; cargo: string; departamento: string; data_admissao: string }
  ferias: {
    periodo_inicio: string; periodo_fim: string
    inicio_gozo: string; fim_gozo: string
    dias_concedidos: number; dias_abono: number; adiantamento_13: number
    salario_referencia: number; valor_ferias: number; valor_abono: number
    valor_adiantamento_13: number; valor_total: number
    observacao: string | null
  }
  inss: number
  irrf: number
  outros_descontos?: number
}

const ML = 30, PW = 535
const BORDER_C = '#aaaaaa', LABEL_C = '#666666', HDR_BG = '#dddddd', BLUE = '#1e4f8a'
const ROW_H = 16, CELL_PAD = 3

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtCnpj(s: string) {
  const d = s.replace(/\D/g, ''); if (d.length !== 14) return s
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}
function fmtCpf(s: string) {
  const d = s.replace(/\D/g, ''); if (d.length !== 11) return s
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}
function fmtData(s: string) {
  if (!s) return ''
  const [y, m, d] = s.slice(0,10).split('-'); return `${d}/${m}/${y}`
}

function drawHeader(doc: PDFKit.PDFDocument, empresa: FeriasData['empresa'], y: number): number {
  doc.fontSize(8).font('Helvetica-Bold').fillColor(BLUE)
    .text(empresa.razao_social, ML, y, { lineBreak: false, width: PW })
  doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
    .text(`CNPJ: ${fmtCnpj(empresa.cnpj)}   ${empresa.endereco} — ${empresa.cidade}/${empresa.uf}`,
      ML, y + 10, { lineBreak: false, width: PW })
  doc.moveTo(ML, y + 20).lineTo(ML + PW, y + 20).lineWidth(1).strokeColor(BLUE).stroke()
  return y + 26
}

function drawFuncRow(doc: PDFKit.PDFDocument, data: FeriasData, y: number): number {
  const cw = PW / 4
  const items = [
    { label: 'Funcionário',   value: data.funcionario.nome },
    { label: 'Matrícula',     value: data.funcionario.codigo },
    { label: 'Cargo',         value: data.funcionario.cargo },
    { label: 'Departamento',  value: data.funcionario.departamento },
  ]
  items.forEach((item, i) => {
    doc.rect(ML + cw * i, y, cw, ROW_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
    doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
      .text(item.label.toUpperCase(), ML + cw * i + CELL_PAD, y + CELL_PAD, { lineBreak: false, width: cw - CELL_PAD * 2 })
    doc.fontSize(8).font('Helvetica').fillColor('#111111')
      .text(item.value, ML + cw * i + CELL_PAD, y + CELL_PAD + 7, { lineBreak: false, width: cw - CELL_PAD * 2 })
  })
  return y + ROW_H
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string, y: number): number {
  doc.fontSize(12).font('Helvetica-Bold').fillColor(BLUE)
    .text(title, ML, y, { lineBreak: false, width: PW, align: 'center' })
  return y + 18
}

function cell(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, w: number, h = ROW_H): void {
  doc.rect(x, y, w, h).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
    .text(label.toUpperCase(), x + CELL_PAD, y + CELL_PAD, { lineBreak: false, width: w - CELL_PAD * 2 })
  doc.fontSize(8).font('Helvetica').fillColor('#111111')
    .text(value, x + CELL_PAD, y + CELL_PAD + 7, { lineBreak: false, width: w - CELL_PAD * 2 })
}

// ── PÁGINA 1: AVISO DE FÉRIAS ─────────────────────────────────────────────
function drawAviso(doc: PDFKit.PDFDocument, data: FeriasData): void {
  let y = drawHeader(doc, data.empresa, 30)
  y = sectionTitle(doc, 'AVISO DE FÉRIAS', y)
  y += 4
  y = drawFuncRow(doc, data, y)
  y += 8

  // Tabela período / datas
  const cw = PW / 6
  const periodCols = [
    { label: 'Período Aquisitivo Início', value: fmtData(data.ferias.periodo_inicio) },
    { label: 'Período Aquisitivo Fim',    value: fmtData(data.ferias.periodo_fim) },
    { label: 'Início das Férias',         value: fmtData(data.ferias.inicio_gozo) },
    { label: 'Retorno ao Trabalho',       value: fmtData(data.ferias.fim_gozo) },
    { label: 'Dias Concedidos',           value: String(data.ferias.dias_concedidos) },
    { label: 'Dias Abono',                value: String(data.ferias.dias_abono) },
  ]
  periodCols.forEach((col, i) => {
    cell(doc, col.label, col.value, ML + cw * i, y, cw)
  })
  y += ROW_H

  const infoCols = [
    { label: 'Adiantamento 13°',          value: data.ferias.adiantamento_13 ? 'Sim' : 'Não' },
    { label: 'CPF',                       value: fmtCpf(data.funcionario.cpf) },
    { label: 'Admissão',                  value: fmtData(data.funcionario.data_admissao) },
  ]
  infoCols.forEach((col, i) => {
    cell(doc, col.label, col.value, ML + cw * i, y, cw)
  })
  y += ROW_H + 16

  // Texto comunicado
  doc.fontSize(9).font('Helvetica').fillColor('#222222')
    .text(
      `Comunicamos a V.Sa. que entrará em gozo de férias no período de ${fmtData(data.ferias.inicio_gozo)} a ${fmtData(data.ferias.fim_gozo)}, ` +
      `correspondente ao período aquisitivo de ${fmtData(data.ferias.periodo_inicio)} a ${fmtData(data.ferias.periodo_fim)}, ` +
      `devendo retornar ao trabalho em ${fmtData(data.ferias.fim_gozo)}.`,
      ML, y, { lineBreak: true, width: PW }
    )
  y += 40

  if (data.ferias.observacao) {
    cell(doc, 'Observações', data.ferias.observacao, ML, y, PW, 22)
    y += 26
  }

  // Assinaturas
  y += 20
  const sigW = (PW - 20) / 2
  ;['Assinatura do Empregador', 'Ciente — Assinatura do Funcionário'].forEach((s, i) => {
    const sx = ML + (sigW + 20) * i
    doc.moveTo(sx, y + 22).lineTo(sx + sigW, y + 22).lineWidth(0.5).strokeColor('#333333').stroke()
    doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
      .text(s, sx, y + 26, { lineBreak: false, width: sigW, align: 'center' })
  })
  y += 40
  doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
    .text('Favor assinar e devolver a 1ª via ao Departamento de Pessoal.', ML, y, { lineBreak: false, width: PW, align: 'center' })
}

// ── PÁGINA 2: RECIBO DE FÉRIAS ────────────────────────────────────────────
function drawRecibo(doc: PDFKit.PDFDocument, data: FeriasData): void {
  let y = drawHeader(doc, data.empresa, 30)
  y = sectionTitle(doc, 'RECIBO DE FÉRIAS', y)
  y += 4
  y = drawFuncRow(doc, data, y)
  y += 8

  // Tabela valores brutos
  const sectionBar = (label: string) => {
    doc.rect(ML, y, PW, 13).fillColor(HDR_BG).fill()
    doc.rect(ML, y, PW, 13).lineWidth(0.3).strokeColor(BORDER_C).stroke()
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333')
      .text(label.toUpperCase(), ML + 4, y + 3, { lineBreak: false })
    y += 13
  }

  sectionBar('Vencimentos')
  const cw6 = PW / 6
  const provCols = [
    { label: 'Salário Base',        value: fmtMoeda(data.ferias.salario_referencia) },
    { label: 'Dias Férias',         value: String(data.ferias.dias_concedidos) },
    { label: 'Valor Férias',        value: fmtMoeda(data.ferias.valor_ferias) },
    { label: '1/3 Constitucional',  value: fmtMoeda(data.ferias.valor_ferias / 3) },
    { label: 'Adiant. 13°',         value: fmtMoeda(data.ferias.valor_adiantamento_13) },
    { label: 'Total Bruto',         value: fmtMoeda(data.ferias.valor_total) },
  ]
  provCols.forEach((col, i) => {
    cell(doc, col.label, col.value, ML + cw6 * i, y, cw6)
  })
  y += ROW_H + 6

  sectionBar('Descontos')
  const totalDesc = data.inss + data.irrf + (data.outros_descontos ?? 0)
  const cw4 = PW / 4
  const descCols = [
    { label: 'INSS',           value: fmtMoeda(data.inss) },
    { label: 'IRRF',           value: fmtMoeda(data.irrf) },
    { label: 'Outros',         value: fmtMoeda(data.outros_descontos ?? 0) },
    { label: 'Total Descontos', value: fmtMoeda(totalDesc) },
  ]
  descCols.forEach((col, i) => {
    cell(doc, col.label, col.value, ML + cw4 * i, y, cw4)
  })
  y += ROW_H + 4

  // Valor líquido destaque
  const liquido = data.ferias.valor_total - totalDesc
  doc.rect(ML, y, PW, 22).fillColor(BLUE).fill()
  doc.rect(ML, y, PW, 22).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff')
    .text('VALOR LÍQUIDO A RECEBER', ML + 6, y + 3, { lineBreak: false })
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#ffffff')
    .text(`R$ ${fmtMoeda(liquido)}`, ML + 6, y + 3, { lineBreak: false, width: PW - 12, align: 'right' })
  y += 30

  // Declaração
  doc.fontSize(8).font('Helvetica').fillColor('#222222')
    .text('Declaro ter recebido a importância líquida acima discriminada, referente às minhas férias regulamentares.',
      ML, y, { lineBreak: true, width: PW })
  y += 30

  // Assinaturas
  const sigW = (PW - 20) / 2
  ;['Assinatura do Empregador', 'Assinatura do Funcionário'].forEach((s, i) => {
    const sx = ML + (sigW + 20) * i
    doc.moveTo(sx, y + 22).lineTo(sx + sigW, y + 22).lineWidth(0.5).strokeColor('#333333').stroke()
    doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
      .text(s, sx, y + 26, { lineBreak: false, width: sigW, align: 'center' })
  })
  y += 40
  doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
    .text(`Data de Pagamento: ___/___/______    Local: ${data.empresa.cidade}/${data.empresa.uf}`,
      ML, y, { lineBreak: false, width: PW, align: 'center' })
}

export class FeriasRenderer {
  static render(data: FeriasData, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true })
      const stream = fs.createWriteStream(filePath)
      doc.pipe(stream)
      stream.on('finish', resolve)
      stream.on('error', reject)
      drawAviso(doc, data)
      doc.addPage()
      drawRecibo(doc, data)
      doc.end()
    })
  }
}
