import PDFDocument from 'pdfkit'
import fs from 'fs'

export interface RegistroPontoRow {
  data: string
  entrada: string | null
  saida_almoco: string | null
  retorno_almoco: string | null
  saida: string | null
  horas_trabalhadas: number
  horas_normais: number
  horas_extras_50: number
  horas_extras_100: number
  horas_falta: number
  tipo: string
  justificativa: string | null
}

export interface EspelhoPontoData {
  empresa: { razao_social: string; cnpj: string; cidade: string; uf: string }
  funcionario: { codigo: string; nome: string; cpf: string; cargo: string; departamento: string }
  mes: number
  ano: number
  registros: RegistroPontoRow[]
  totais: {
    total_trabalhadas: number
    total_normais: number
    total_extras_50: number
    total_extras_100: number
    total_faltas: number
  }
}

const ML = 20, PW = 555, PAGE_H = 841
const BORDER_C = '#aaaaaa', LABEL_C = '#666666', HDR_BG = '#dddddd', BLUE = '#1e4f8a'
const ROW_H = 13

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DIAS_SEM = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function fmtH(h: number): string {
  if (h === 0) return '—'
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`
}
function fmtCnpj(s: string) {
  const d = s.replace(/\D/g, ''); if (d.length !== 14) return s
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

// Column layout: 40+28+42+42+42+42+42+48+50+46+91 = 513 ≤ 555
const COLS = [
  { key: 'data',        label: 'Data',     w: 40 },
  { key: 'dia',         label: 'Dia',      w: 28 },
  { key: 'entrada',     label: 'Entrada',  w: 42 },
  { key: 'saida_alm',   label: 'S.Alm',    w: 42 },
  { key: 'ret_alm',     label: 'R.Alm',    w: 42 },
  { key: 'saida',       label: 'Saída',    w: 42 },
  { key: 'h_trab',      label: 'H.Trab',   w: 42 },
  { key: 'h_ext50',     label: 'H.Ext 50%', w: 48 },
  { key: 'h_ext100',    label: 'H.Ext 100%', w: 50 },
  { key: 'h_falta',     label: 'H.Falta',  w: 46 },
  { key: 'ocorrencia',  label: 'Ocorrência', w: 91 },
]

function drawPageHeader(doc: PDFKit.PDFDocument, data: EspelhoPontoData, y: number): number {
  doc.fontSize(8).font('Helvetica-Bold').fillColor(BLUE)
    .text(data.empresa.razao_social, ML, y, { lineBreak: false, width: PW })
  doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
    .text(`CNPJ: ${fmtCnpj(data.empresa.cnpj)}   ${data.empresa.cidade}/${data.empresa.uf}`,
      ML, y + 10, { lineBreak: false })
  doc.moveTo(ML, y + 20).lineTo(ML + PW, y + 20).lineWidth(1).strokeColor(BLUE).stroke()
  y += 24

  doc.fontSize(10).font('Helvetica-Bold').fillColor(BLUE)
    .text('ESPELHO DE PONTO', ML, y, { lineBreak: false, width: PW, align: 'center' })
  doc.fontSize(8).font('Helvetica').fillColor('#333333')
    .text(`Competência: ${MESES[data.mes - 1]}/${data.ano}`, ML, y + 12, { lineBreak: false, width: PW, align: 'center' })
  y += 26

  // Funcionário info
  const cw = PW / 4
  const items = [
    { label: 'Funcionário',  value: data.funcionario.nome },
    { label: 'Matrícula',    value: data.funcionario.codigo },
    { label: 'Cargo',        value: data.funcionario.cargo },
    { label: 'Departamento', value: data.funcionario.departamento },
  ]
  items.forEach((item, i) => {
    doc.rect(ML + cw * i, y, cw, 16).lineWidth(0.3).strokeColor(BORDER_C).stroke()
    doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
      .text(item.label.toUpperCase(), ML + cw * i + 3, y + 2, { lineBreak: false, width: cw - 6 })
    doc.fontSize(8).font('Helvetica').fillColor('#111111')
      .text(item.value, ML + cw * i + 3, y + 9, { lineBreak: false, width: cw - 6 })
  })
  y += 20

  return y
}

function drawTableHeader(doc: PDFKit.PDFDocument, y: number): number {
  doc.rect(ML, y, PW, ROW_H).fillColor(BLUE).fill()
  let cx = ML
  for (const col of COLS) {
    doc.moveTo(cx, y).lineTo(cx, y + ROW_H).lineWidth(0.3).strokeColor('#4477aa').stroke()
    doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#ffffff')
      .text(col.label, cx + 2, y + 3, { lineBreak: false, width: col.w - 2, align: 'center' })
    cx += col.w
  }
  return y + ROW_H
}

export class EspelhoPontoRenderer {
  static render(data: EspelhoPontoData, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true })
      const stream = fs.createWriteStream(filePath)
      doc.pipe(stream)
      stream.on('finish', resolve)
      stream.on('error', reject)

      let y = drawPageHeader(doc, data, 20)
      y = drawTableHeader(doc, y)

      const FOOTER_H = 60
      const MAX_Y = PAGE_H - FOOTER_H - 10

      for (let i = 0; i < data.registros.length; i++) {
        if (y + ROW_H > MAX_Y) {
          doc.addPage()
          y = drawPageHeader(doc, data, 20)
          y = drawTableHeader(doc, y)
        }

        const r = data.registros[i]
        const dateObj = new Date(r.data + 'T12:00:00')
        const diaSem = DIAS_SEM[dateObj.getDay()]
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
        const isFeriado = r.tipo === 'feriado'
        const isFalta   = r.tipo === 'falta' || r.horas_falta > 0

        const bg = isFeriado  ? '#d8e8ff'
          : isWeekend         ? '#f0f0f0'
          : isFalta           ? '#fff0f0'
          : i % 2 === 0       ? '#ffffff' : '#f8f8f8'

        doc.rect(ML, y, PW, ROW_H).fillColor(bg).fill()
        doc.rect(ML, y, PW, ROW_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()

        const [yr, mo, dy] = r.data.slice(0,10).split('-')
        const rowVals = [
          `${dy}/${mo}/${yr}`,
          diaSem,
          r.entrada ?? '—',
          r.saida_almoco ?? '—',
          r.retorno_almoco ?? '—',
          r.saida ?? '—',
          fmtH(r.horas_trabalhadas),
          r.horas_extras_50 > 0 ? fmtH(r.horas_extras_50) : '—',
          r.horas_extras_100 > 0 ? fmtH(r.horas_extras_100) : '—',
          r.horas_falta > 0 ? fmtH(r.horas_falta) : '—',
          r.tipo !== 'normal' ? (r.justificativa ?? r.tipo) : '',
        ]

        let cx = ML
        rowVals.forEach((v, vi) => {
          const w = COLS[vi].w
          doc.moveTo(cx, y).lineTo(cx, y + ROW_H).lineWidth(0.3).strokeColor(BORDER_C).stroke()
          const isNum = vi >= 6
          const color = vi === 9 && r.horas_falta > 0 ? '#c0392b'
            : vi >= 7 && vi <= 8 && v !== '—' ? '#155724'
            : '#111111'
          doc.fontSize(7.5).font('Helvetica').fillColor(color)
            .text(v, cx + 2, y + 2.5, { lineBreak: false, width: w - 4, align: isNum ? 'center' : 'left' })
          cx += w
        })
        y += ROW_H
      }

      // Linha totais
      if (y + ROW_H > MAX_Y) {
        doc.addPage()
        y = 20
      }
      y += 4
      doc.rect(ML, y, PW, ROW_H + 2).fillColor(HDR_BG).fill()
      doc.rect(ML, y, PW, ROW_H + 2).lineWidth(0.3).strokeColor(BORDER_C).stroke()

      const totalItems = [
        { label: 'Total H.Trabalhadas', value: fmtH(data.totais.total_trabalhadas) },
        { label: 'Total H.Extras 50%',  value: fmtH(data.totais.total_extras_50) },
        { label: 'Total H.Extras 100%', value: fmtH(data.totais.total_extras_100) },
        { label: 'Total H.Faltas',      value: fmtH(data.totais.total_faltas) },
        { label: 'Total H.Normais',     value: fmtH(data.totais.total_normais) },
      ]
      const tw = PW / totalItems.length
      totalItems.forEach((t, i) => {
        const tx = ML + tw * i
        doc.fontSize(6).font('Helvetica').fillColor(LABEL_C)
          .text(t.label, tx + 3, y + 1, { lineBreak: false, width: tw - 6 })
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#111111')
          .text(t.value, tx + 3, y + 8, { lineBreak: false, width: tw - 6, align: 'right' })
      })
      y += ROW_H + 14

      // Assinaturas
      const sigW = (PW - 20) / 2
      ;['Assinatura do Empregador', 'Assinatura do Funcionário'].forEach((s, i) => {
        const sx = ML + (sigW + 20) * i
        doc.moveTo(sx, y + 22).lineTo(sx + sigW, y + 22).lineWidth(0.5).strokeColor('#333333').stroke()
        doc.fontSize(7).font('Helvetica').fillColor(LABEL_C)
          .text(s, sx, y + 26, { lineBreak: false, width: sigW, align: 'center' })
      })

      doc.end()
    })
  }
}
