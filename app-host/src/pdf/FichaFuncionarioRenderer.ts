import PDFDocument from 'pdfkit'
import fs from 'fs'

export interface FichaFuncionarioData {
  empresa: { razao_social: string; cnpj: string; cidade: string; uf: string }
  funcionario: {
    codigo: string; nome: string; cpf: string; rg: string | null
    data_nascimento: string | null; sexo: string | null; estado_civil: string | null
    escolaridade: string | null
    cargo: string | null; departamento: string | null; data_admissao: string
    tipo_contrato: string | null; salario_base: number; carga_horaria: number | null
    periculosidade: number; insalubridade: string | null
    vale_transporte: number; vale_refeicao: number; plano_saude: number
    cep: string | null; logradouro: string | null; numero: string | null
    complemento: string | null; bairro: string | null; cidade: string | null
    uf: string | null; telefone: string | null; email: string | null
    banco: string | null; agencia: string | null; conta: string | null
    pis_pasep: string | null; ctps: string | null; status: string
  }
}

const ML = 30, PW = 535
const BORDER_C = '#aaaaaa', LABEL_C = '#666666', HDR_BG = '#dddddd', BLUE = '#1e4f8a'
const FIELD_H = 18, CELL_PAD = 3

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
function fmtData(s: string | null) {
  if (!s) return ''
  const [y, m, d] = s.slice(0,10).split('-'); return `${d}/${m}/${y}`
}
function yn(v: number | null | undefined) { return (v ?? 0) > 0 ? 'Sim' : 'Não' }
function str(v: string | null | undefined) { return v ?? '' }

function sectionBar(doc: PDFKit.PDFDocument, label: string, y: number): number {
  doc.rect(ML, y, PW, 14).fillColor(HDR_BG).fill()
  doc.rect(ML, y, PW, 14).lineWidth(0.3).strokeColor(BORDER_C).stroke()
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333')
    .text(label.toUpperCase(), ML + 4, y + 3.5, { lineBreak: false, width: PW - 8 })
  return y + 14
}

function fields(doc: PDFKit.PDFDocument, items: { label: string; value: string; w: number }[], y: number): number {
  let x = ML
  let rowMaxH = FIELD_H
  for (const item of items) {
    doc.rect(x, y, item.w, rowMaxH).lineWidth(0.3).strokeColor(BORDER_C).stroke()
    doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
      .text(item.label.toUpperCase(), x + CELL_PAD, y + CELL_PAD, { lineBreak: false, width: item.w - CELL_PAD * 2 })
    doc.fontSize(8).font('Helvetica').fillColor('#111111')
      .text(item.value, x + CELL_PAD, y + CELL_PAD + 7, { lineBreak: false, width: item.w - CELL_PAD * 2 })
    x += item.w
  }
  return y + rowMaxH
}

function drawFicha(doc: PDFKit.PDFDocument, data: FichaFuncionarioData): void {
  const f = data.funcionario
  let y = 30

  // ── Cabeçalho ─────────────────────────────────────────────────────────
  doc.fontSize(8).font('Helvetica-Bold').fillColor(BLUE)
    .text(data.empresa.razao_social, ML, y, { lineBreak: false, width: PW })
  doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
    .text(`CNPJ: ${fmtCnpj(data.empresa.cnpj)}   ${data.empresa.cidade}/${data.empresa.uf}`,
      ML, y + 10, { lineBreak: false })
  doc.moveTo(ML, y + 20).lineTo(ML + PW, y + 20).lineWidth(1).strokeColor(BLUE).stroke()
  y += 26

  doc.fontSize(11).font('Helvetica-Bold').fillColor(BLUE)
    .text('FICHA CADASTRAL DO FUNCIONÁRIO', ML, y, { lineBreak: false, width: PW, align: 'center' })
  y += 20

  // ── Dados Pessoais ────────────────────────────────────────────────────
  y = sectionBar(doc, 'Dados Pessoais', y)
  y = fields(doc, [
    { label: 'Nome Completo', value: f.nome, w: PW * 0.6 },
    { label: 'Matrícula',     value: f.codigo, w: PW * 0.15 },
    { label: 'Status',        value: f.status, w: PW * 0.25 },
  ], y)
  y = fields(doc, [
    { label: 'CPF', value: fmtCpf(f.cpf), w: PW * 0.2 },
    { label: 'RG',  value: str(f.rg),     w: PW * 0.2 },
    { label: 'Data Nascimento', value: fmtData(f.data_nascimento), w: PW * 0.2 },
    { label: 'Sexo', value: str(f.sexo),  w: PW * 0.15 },
    { label: 'Estado Civil', value: str(f.estado_civil), w: PW * 0.25 },
  ], y)
  y = fields(doc, [
    { label: 'Escolaridade', value: str(f.escolaridade), w: PW * 0.4 },
    { label: 'Telefone', value: str(f.telefone), w: PW * 0.3 },
    { label: 'Email', value: str(f.email), w: PW * 0.3 },
  ], y)
  y += 4

  // ── Endereço ──────────────────────────────────────────────────────────
  y = sectionBar(doc, 'Endereço', y)
  y = fields(doc, [
    { label: 'CEP', value: str(f.cep), w: PW * 0.15 },
    { label: 'Logradouro', value: str(f.logradouro), w: PW * 0.5 },
    { label: 'Número', value: str(f.numero), w: PW * 0.1 },
    { label: 'Complemento', value: str(f.complemento), w: PW * 0.25 },
  ], y)
  y = fields(doc, [
    { label: 'Bairro', value: str(f.bairro), w: PW * 0.35 },
    { label: 'Cidade', value: str(f.cidade), w: PW * 0.45 },
    { label: 'UF', value: str(f.uf), w: PW * 0.2 },
  ], y)
  y += 4

  // ── Dados Profissionais ───────────────────────────────────────────────
  y = sectionBar(doc, 'Dados Profissionais', y)
  y = fields(doc, [
    { label: 'Cargo / Função', value: str(f.cargo), w: PW * 0.35 },
    { label: 'Departamento', value: str(f.departamento), w: PW * 0.3 },
    { label: 'Admissão', value: fmtData(f.data_admissao), w: PW * 0.2 },
    { label: 'Tipo Contrato', value: str(f.tipo_contrato), w: PW * 0.15 },
  ], y)
  y = fields(doc, [
    { label: 'Salário Base', value: `R$ ${fmtMoeda(f.salario_base)}`, w: PW * 0.25 },
    { label: 'Carga Horária', value: f.carga_horaria ? `${f.carga_horaria}h/mês` : '', w: PW * 0.2 },
    { label: 'Periculosidade', value: yn(f.periculosidade), w: PW * 0.2 },
    { label: 'Insalubridade', value: str(f.insalubridade), w: PW * 0.35 },
  ], y)
  y += 4

  // ── Documentos ────────────────────────────────────────────────────────
  y = sectionBar(doc, 'Documentos e Dados Bancários', y)
  y = fields(doc, [
    { label: 'CTPS', value: str(f.ctps), w: PW * 0.25 },
    { label: 'PIS/PASEP', value: str(f.pis_pasep), w: PW * 0.25 },
    { label: 'Banco', value: str(f.banco), w: PW * 0.2 },
    { label: 'Agência', value: str(f.agencia), w: PW * 0.15 },
    { label: 'Conta', value: str(f.conta), w: PW * 0.15 },
  ], y)
  y += 4

  // ── Benefícios ────────────────────────────────────────────────────────
  y = sectionBar(doc, 'Benefícios', y)
  y = fields(doc, [
    { label: 'Vale Transporte', value: yn(f.vale_transporte), w: PW * 0.2 },
    { label: 'Vale Refeição', value: f.vale_refeicao > 0 ? `R$ ${fmtMoeda(f.vale_refeicao)}` : 'Não', w: PW * 0.2 },
    { label: 'Plano de Saúde', value: f.plano_saude > 0 ? `R$ ${fmtMoeda(f.plano_saude)}` : 'Não', w: PW * 0.2 },
    { label: 'Periculosidade %', value: f.periculosidade ? '30%' : '—', w: PW * 0.2 },
    { label: 'Insalubridade %', value: str(f.insalubridade) || '—', w: PW * 0.2 },
  ], y)
  y += 16

  // ── Assinatura ────────────────────────────────────────────────────────
  const sigW = (PW - 20) / 2
  ;['Assinatura do Funcionário', `Data: ${data.empresa.cidade}, ___/___/______`].forEach((s, i) => {
    const sx = ML + (sigW + 20) * i
    doc.moveTo(sx, y + 22).lineTo(sx + sigW, y + 22).lineWidth(0.5).strokeColor('#333333').stroke()
    doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
      .text(s, sx, y + 26, { lineBreak: false, width: sigW, align: 'center' })
  })
}

export class FichaFuncionarioRenderer {
  static render(data: FichaFuncionarioData, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true })
      const stream = fs.createWriteStream(filePath)
      doc.pipe(stream)
      stream.on('finish', resolve)
      stream.on('error', reject)
      drawFicha(doc, data)
      doc.end()
    })
  }
}
