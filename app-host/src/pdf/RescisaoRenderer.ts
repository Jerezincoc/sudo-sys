import PDFDocument from 'pdfkit'
import fs from 'fs'

export interface RescisaoData {
  empresa: { razao_social: string; cnpj: string; endereco: string; bairro: string; cidade: string; uf: string; cep: string; telefone: string }
  funcionario: { codigo: string; nome: string; cpf: string; rg: string; cargo: string; departamento: string; data_admissao: string; ctps: string; pis_pasep: string }
  rescisao: {
    data_demissao: string; motivo: string; aviso_previo: string | null; data_aviso: string | null
    salario_referencia: number; dias_trabalhados: number
    saldo_salario: number; ferias_vencidas: number; ferias_proporcionais: number
    um_terco_ferias: number; decimo_terceiro: number; aviso_previo_valor: number
    multa_fgts: number; outros_proventos: number; total_proventos: number
    inss_rescisao: number; irrf_rescisao: number; outros_descontos: number
    total_descontos: number; valor_liquido: number
    observacao: string | null
  }
}

const ML = 30, PW = 535, PAGE_W = 595
const BORDER_C = '#aaaaaa', LABEL_C = '#666666', HDR_BG = '#dddddd', BLUE = '#1e4f8a'
const ROW_H = 14, CELL_PAD = 3

const MOTIVOS: Record<string, string> = {
  sem_justa_causa: 'Rescisão Sem Justa Causa pelo Empregador',
  com_justa_causa: 'Rescisão Com Justa Causa pelo Empregador',
  pedido_demissao: 'Pedido de Demissão',
  acordo_mutuo:    'Distrato (Acordo Mútuo) — Art. 484-A CLT',
  aposentadoria:   'Aposentadoria',
}

function fmtMoeda(v: number | null | undefined) {
  return (v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

function sectionBar(doc: PDFKit.PDFDocument, label: string, y: number, h = 14): void {
  doc.rect(ML, y, PW, h).fillColor(HDR_BG).fill()
  doc.rect(ML, y, PW, h).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333')
    .text(label.toUpperCase(), ML + 4, y + (h - 7) / 2 + 1, { lineBreak: false, width: PW - 8 })
}

function field(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, w: number, h = ROW_H): void {
  doc.rect(x, y, w, h).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
    .text(label.toUpperCase(), x + CELL_PAD, y + CELL_PAD, { lineBreak: false, width: w - CELL_PAD * 2 })
  doc.fontSize(8).font('Helvetica').fillColor('#111111')
    .text(value, x + CELL_PAD, y + CELL_PAD + 7, { lineBreak: false, width: w - CELL_PAD * 2 })
}

function drawRescisao(doc: PDFKit.PDFDocument, data: RescisaoData): void {
  let y = 30

  // ── Título ────────────────────────────────────────────────────────────
  doc.fontSize(11).font('Helvetica-Bold').fillColor(BLUE)
    .text('TERMO DE RESCISÃO DO CONTRATO DE TRABALHO', ML, y, { lineBreak: false, width: PW, align: 'center' })
  y += 14
  doc.fontSize(8).font('Helvetica').fillColor('#333333')
    .text(MOTIVOS[data.rescisao.motivo] ?? data.rescisao.motivo, ML, y, { lineBreak: false, width: PW, align: 'center' })
  y += 16

  // ── Bloco Empregador ───────────────────────────────────────────────────
  sectionBar(doc, '01 — Identificação do Empregador', y)
  y += 14
  field(doc, '01 CNPJ', fmtCnpj(data.empresa.cnpj),          ML,          y, PW * 0.35)
  field(doc, '02 Razão Social', data.empresa.razao_social,    ML + PW * 0.35, y, PW * 0.65)
  y += ROW_H
  field(doc, '03 Endereço', data.empresa.endereco,            ML,          y, PW * 0.5)
  field(doc, '04 Bairro', data.empresa.bairro,               ML + PW * 0.5, y, PW * 0.25)
  field(doc, '05 UF', data.empresa.uf,                       ML + PW * 0.75, y, PW * 0.08)
  field(doc, '06 CEP', data.empresa.cep,                     ML + PW * 0.83, y, PW * 0.17)
  y += ROW_H
  field(doc, '07 Cidade', data.empresa.cidade,               ML,          y, PW * 0.5)
  field(doc, '08 Telefone', data.empresa.telefone,           ML + PW * 0.5, y, PW * 0.25)
  y += ROW_H + 4

  // ── Bloco Trabalhador ─────────────────────────────────────────────────
  sectionBar(doc, '10 — Identificação do Trabalhador', y)
  y += 14
  field(doc, '10 Nome', data.funcionario.nome,               ML,          y, PW * 0.55)
  field(doc, '11 CPF', fmtCpf(data.funcionario.cpf),         ML + PW * 0.55, y, PW * 0.25)
  field(doc, '12 RG', data.funcionario.rg,                   ML + PW * 0.8, y, PW * 0.2)
  y += ROW_H
  field(doc, '13 CTPS', data.funcionario.ctps,               ML,          y, PW * 0.25)
  field(doc, '14 PIS/PASEP', data.funcionario.pis_pasep,     ML + PW * 0.25, y, PW * 0.3)
  field(doc, '15 Matrícula', data.funcionario.codigo,        ML + PW * 0.55, y, PW * 0.2)
  field(doc, '16 Admissão', fmtData(data.funcionario.data_admissao), ML + PW * 0.75, y, PW * 0.25)
  y += ROW_H
  field(doc, '17 Cargo/Função', data.funcionario.cargo,      ML,          y, PW * 0.5)
  field(doc, '18 Departamento', data.funcionario.departamento, ML + PW * 0.5, y, PW * 0.5)
  y += ROW_H + 4

  // ── Bloco Dados Contrato ──────────────────────────────────────────────
  sectionBar(doc, '21 — Dados do Contrato', y)
  y += 14
  field(doc, '21 Data Demissão', fmtData(data.rescisao.data_demissao), ML, y, PW * 0.2)
  field(doc, '22 Tipo Aviso', data.rescisao.aviso_previo ?? '—',       ML + PW * 0.2, y, PW * 0.25)
  field(doc, '23 Data Aviso', data.rescisao.data_aviso ? fmtData(data.rescisao.data_aviso) : '—', ML + PW * 0.45, y, PW * 0.2)
  field(doc, '24 Dias Trabalhados', String(data.rescisao.dias_trabalhados ?? 0), ML + PW * 0.65, y, PW * 0.15)
  field(doc, '25 Salário Base', `R$ ${fmtMoeda(data.rescisao.salario_referencia)}`, ML + PW * 0.8, y, PW * 0.2)
  y += ROW_H + 4

  // ── Verbas Rescisórias ────────────────────────────────────────────────
  sectionBar(doc, 'Verbas Rescisórias', y, 14)
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#ffffff')
  y += 14

  // Header 3 colunas
  const cw = PW / 3
  const CCod = 28, CDesc = cw - CCod - 65, CVal = 65
  for (let i = 0; i < 3; i++) {
    const bx = ML + cw * i
    doc.rect(bx, y, cw, 12).fillColor(BLUE).fill()
    doc.fontSize(7).font('Helvetica-Bold').fillColor('#ffffff')
    doc.text('CÓD.',       bx + 2,          y + 2.5, { lineBreak: false, width: CCod - 2 })
    doc.text('DESCRIÇÃO',  bx + CCod + 2,   y + 2.5, { lineBreak: false, width: CDesc - 2 })
    doc.text('VALOR',      bx + CCod + CDesc + 2, y + 2.5, { lineBreak: false, width: CVal - 2, align: 'right' })
  }
  y += 12

  const verbas = [
    { cod: '51', desc: 'Saldo de Salário',           val: data.rescisao.saldo_salario },
    { cod: '52', desc: '13° Salário Proporcional',   val: data.rescisao.decimo_terceiro },
    { cod: '53', desc: 'Férias Vencidas',             val: data.rescisao.ferias_vencidas },
    { cod: '54', desc: '1/3 s/ Férias Vencidas',     val: (data.rescisao.ferias_vencidas ?? 0) / 3 },
    { cod: '55', desc: 'Férias Proporcionais',        val: data.rescisao.ferias_proporcionais },
    { cod: '56', desc: '1/3 s/ Férias Proporcionais',val: (data.rescisao.ferias_proporcionais ?? 0) / 3 },
    { cod: '57', desc: 'Aviso Prévio Indenizado',     val: data.rescisao.aviso_previo_valor },
    { cod: '58', desc: 'Multa FGTS 40%',              val: data.rescisao.multa_fgts },
    { cod: '59', desc: 'Outros Proventos',             val: data.rescisao.outros_proventos },
  ].filter((v) => (v.val ?? 0) > 0)

  // Fill to multiple of 3
  while (verbas.length % 3 !== 0) verbas.push({ cod: '', desc: '', val: 0 })
  for (let row = 0; row < verbas.length / 3; row++) {
    const isOdd = row % 2 !== 0
    for (let col = 0; col < 3; col++) {
      const item = verbas[row * 3 + col]
      const bx = ML + cw * col
      doc.rect(bx, y, cw, ROW_H).fillColor(isOdd ? '#f5f5f5' : '#ffffff').fill()
      doc.rect(bx, y, cw, ROW_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
      if (item.cod) {
        doc.fontSize(8).font('Helvetica').fillColor('#111111')
        doc.text(item.cod,             bx + 2,          y + 3, { lineBreak: false, width: CCod - 2 })
        doc.text(item.desc,            bx + CCod + 2,   y + 3, { lineBreak: false, width: CDesc - 2 })
        if ((item.val ?? 0) > 0) {
          doc.text(fmtMoeda(item.val ?? 0), bx + CCod + CDesc + 2, y + 3,
            { lineBreak: false, width: CVal - 4, align: 'right' })
        }
      }
    }
    y += ROW_H
  }

  // Total bruto
  doc.rect(ML, y, PW, ROW_H).fillColor(HDR_BG).fill()
  doc.rect(ML, y, PW, ROW_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333')
    .text('TOTAL DE VENCIMENTOS', ML + 4, y + 3, { lineBreak: false })
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#111111')
    .text(fmtMoeda(data.rescisao.total_proventos), ML + 4, y + 3,
      { lineBreak: false, width: PW - 8, align: 'right' })
  y += ROW_H + 4

  // ── Deduções ──────────────────────────────────────────────────────────
  sectionBar(doc, 'Deduções (100–114)', y)
  y += 14
  const deducoes = [
    { cod: '100', desc: 'INSS',             val: data.rescisao.inss_rescisao },
    { cod: '101', desc: 'IRRF',             val: data.rescisao.irrf_rescisao },
    { cod: '102', desc: 'Outros Descontos', val: data.rescisao.outros_descontos },
  ].filter((d) => (d.val ?? 0) > 0)
  while (deducoes.length % 3 !== 0) deducoes.push({ cod: '', desc: '', val: 0 })
  for (let row = 0; row < deducoes.length / 3; row++) {
    for (let col = 0; col < 3; col++) {
      const item = deducoes[row * 3 + col]
      const bx = ML + cw * col
      doc.rect(bx, y, cw, ROW_H).fillColor('#ffffff').fill()
      doc.rect(bx, y, cw, ROW_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
      if (item.cod) {
        doc.fontSize(8).font('Helvetica').fillColor('#111111')
        doc.text(item.cod,  bx + 2,          y + 3, { lineBreak: false, width: CCod - 2 })
        doc.text(item.desc, bx + CCod + 2,   y + 3, { lineBreak: false, width: CDesc - 2 })
        if ((item.val ?? 0) > 0) {
          doc.text(fmtMoeda(item.val ?? 0), bx + CCod + CDesc + 2, y + 3,
            { lineBreak: false, width: CVal - 4, align: 'right' })
        }
      }
    }
    y += ROW_H
  }

  // Total deduções
  doc.rect(ML, y, PW * 0.5, ROW_H).fillColor(HDR_BG).fill()
  doc.rect(ML, y, PW * 0.5, ROW_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333')
    .text('TOTAL DE DEDUÇÕES', ML + 4, y + 3, { lineBreak: false })
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#111111')
    .text(fmtMoeda(data.rescisao.total_descontos), ML + 4, y + 3,
      { lineBreak: false, width: PW * 0.5 - 8, align: 'right' })

  // Valor líquido (destaque azul)
  doc.rect(ML + PW * 0.5, y, PW * 0.5, ROW_H).fillColor(BLUE).fill()
  doc.rect(ML + PW * 0.5, y, PW * 0.5, ROW_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#ffffff')
    .text('VALOR LÍQUIDO A RECEBER', ML + PW * 0.5 + 4, y + 1, { lineBreak: false })
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff')
    .text(fmtMoeda(data.rescisao.valor_liquido), ML + PW * 0.5 + 4, y + 1,
      { lineBreak: false, width: PW * 0.5 - 8, align: 'right' })
  y += ROW_H + 8

  if (data.rescisao.observacao) {
    field(doc, 'Observações', data.rescisao.observacao, ML, y, PW, 20)
    y += 24
  }

  // ── Assinaturas ───────────────────────────────────────────────────────
  y += 10
  const sigW = (PW - 20) / 3
  ;[
    { label: `Empregador\n${data.empresa.razao_social}` },
    { label: `Trabalhador\n${data.funcionario.nome}` },
    { label: `Local e Data: ___/___/______` },
  ].forEach((s, i) => {
    const sx = ML + (sigW + 10) * i
    doc.moveTo(sx, y + 22).lineTo(sx + sigW, y + 22).lineWidth(0.5).strokeColor('#333333').stroke()
    doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
      .text(s.label, sx, y + 25, { lineBreak: true, width: sigW, align: 'center' })
  })
}

export class RescisaoRenderer {
  static render(data: RescisaoData, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true })
      const stream = fs.createWriteStream(filePath)
      doc.pipe(stream)
      stream.on('finish', resolve)
      stream.on('error', reject)
      drawRescisao(doc, data)
      doc.end()
    })
  }
}
