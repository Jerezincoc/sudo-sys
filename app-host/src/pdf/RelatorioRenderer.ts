import PDFDocument from 'pdfkit'
import fs from 'fs'
import type { RelatorioPersonalizado, CampoSintetico, RelatorioLinhaFuncionario } from '@sudo-sys/shared'

const ML     = 25
const PAGE_W = 595
const BODY_W = PAGE_W - ML * 2

function fmtMoeda(v: unknown): string {
  if (typeof v === 'number') return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return String(v ?? '')
}

function fmtVal(campo: CampoSintetico, val: unknown): string {
  if (campo.tipo === 'valor') return fmtMoeda(val)
  return String(val ?? '')
}

function rodape(doc: PDFKit.PDFDocument, pag: number, total: number) {
  const y = doc.page.height - 22
  doc.fontSize(7).font('Helvetica').fillColor('#888888')
    .text(`Página ${pag} de ${total}`, ML, y, { width: BODY_W, align: 'center', lineBreak: false })
  const now = new Date().toLocaleString('pt-BR')
  doc.text(`Emitido em: ${now}`, ML, y + 9, { width: BODY_W, align: 'center', lineBreak: false })
}

function cabecalhoPDF(
  doc: PDFKit.PDFDocument,
  relatorio: RelatorioPersonalizado,
  empresaNome: string,
  y: number,
): number {
  // título
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#1e4f8a')
    .text(relatorio.nome, ML, y, { width: BODY_W, align: 'center', lineBreak: false })
  y += 16
  if (relatorio.cabecalho) {
    doc.fontSize(9).font('Helvetica').fillColor('#444444')
      .text(relatorio.cabecalho, ML, y, { width: BODY_W, align: 'center', lineBreak: false })
    y += 12
  }
  doc.fontSize(8).font('Helvetica').fillColor('#666666')
    .text(`Empresa: ${empresaNome}`, ML, y, { width: BODY_W, align: 'center', lineBreak: false })
  y += 14
  doc.moveTo(ML, y).lineTo(ML + BODY_W, y).lineWidth(0.5).strokeColor('#aaaaaa').stroke()
  y += 8
  return y
}

export class RelatorioRenderer {
  static renderSintetico(
    relatorio: RelatorioPersonalizado,
    dados: RelatorioLinhaFuncionario[],
    empresaNome: string,
    filePath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true })
      const stream = fs.createWriteStream(filePath)
      doc.pipe(stream)
      stream.on('finish', resolve)
      stream.on('error', reject)

      const camposSel = relatorio.campos as CampoSintetico[]
      const nivel1    = camposSel.filter(c => c.nivel === '1')

      // Calcular larguras das colunas
      const colW = nivel1.length > 0 ? Math.floor(BODY_W / nivel1.length) : BODY_W

      let y = 20
      y = cabecalhoPDF(doc, relatorio, empresaNome, y)

      // Header tabela
      const HDR_H = 14
      doc.rect(ML, y, BODY_W, HDR_H).fillColor('#dddddd').fill()
      doc.rect(ML, y, BODY_W, HDR_H).lineWidth(0.3).strokeColor('#aaaaaa').stroke()
      nivel1.forEach((c, i) => {
        const cx = ML + colW * i
        doc.fontSize(7).font('Helvetica-Bold').fillColor('#333333')
          .text(c.label.toUpperCase(), cx + 2, y + 3, { width: colW - 4, lineBreak: false, ellipsis: true })
      })
      y += HDR_H

      // Linhas
      const ROW_H  = 13
      const SUB_H  = 12

      dados.forEach(linha => {
        // Checar se cabe na página
        if (y + ROW_H > doc.page.height - 40) {
          doc.addPage()
          y = 20
          y = cabecalhoPDF(doc, relatorio, empresaNome, y)
        }

        // Linha nível 1
        doc.rect(ML, y, BODY_W, ROW_H).fillColor('#f0f4f8').fill()
        doc.rect(ML, y, BODY_W, ROW_H).lineWidth(0.2).strokeColor('#cccccc').stroke()
        nivel1.forEach((c, i) => {
          const cx = ML + colW * i
          doc.fontSize(8).font('Helvetica-Bold').fillColor('#111111')
            .text(fmtVal(c, linha.funcionario[c.id]), cx + 2, y + 2.5, { width: colW - 4, lineBreak: false, ellipsis: true })
        })
        y += ROW_H

        // Sub-linhas derivadas
        linha.derivados.forEach(d => {
          const colsDer = camposSel.filter(c => c.nivel === d.nivel)
          if (colsDer.length === 0) return
          if (y + SUB_H > doc.page.height - 40) {
            doc.addPage()
            y = 20
            y = cabecalhoPDF(doc, relatorio, empresaNome, y)
          }
          doc.rect(ML, y, BODY_W, SUB_H).fillColor('#ffffff').fill()
          doc.rect(ML, y, BODY_W, SUB_H).lineWidth(0.2).strokeColor('#dddddd').stroke()

          // Mini-células de derivados numa só linha
          const dColW = colsDer.length > 0 ? Math.floor(BODY_W / colsDer.length) : BODY_W
          colsDer.forEach((c, i) => {
            const cx = ML + dColW * i + 16  // indentado
            doc.fontSize(7).font('Helvetica').fillColor('#555555')
              .text(`${c.label}: `, cx, y + 2.5, { lineBreak: false, continued: true })
              .font('Helvetica-Bold').fillColor('#111111')
              .text(fmtVal(c, d.dados[c.id]), { lineBreak: false })
          })
          y += SUB_H
        })
      })

      // Rodapé (paginação única — usamos 1/1 como simplificação)
      rodape(doc, 1, 1)
      doc.end()
    })
  }

  static renderAnalitico(
    relatorio: RelatorioPersonalizado,
    dados: RelatorioLinhaFuncionario[],
    empresaNome: string,
    filePath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true })
      const stream = fs.createWriteStream(filePath)
      doc.pipe(stream)
      stream.on('finish', resolve)
      stream.on('error', reject)

      const template = relatorio.cabecalho ?? ''

      let y = 20
      y = cabecalhoPDF(doc, relatorio, empresaNome, y)

      dados.forEach((linha, idx) => {
        if (idx > 0 && y > doc.page.height - 80) {
          doc.addPage()
          y = 20
          y = cabecalhoPDF(doc, relatorio, empresaNome, y)
        }

        // Resolver placeholders
        let texto = template
        const todos: Record<string, unknown> = { ...linha.funcionario }
        linha.derivados.forEach(d => Object.assign(todos, d.dados))
        Object.entries(todos).forEach(([k, v]) => {
          texto = texto.replace(new RegExp(`\\{\\{${k.replace('.', '\\.')}\\}\\}`, 'g'), String(v ?? ''))
        })

        doc.fontSize(9).font('Helvetica').fillColor('#111111')
          .text(texto, ML, y, { width: BODY_W, lineBreak: true })
        y = doc.y + 12

        // Linha divisória entre registros
        doc.moveTo(ML, y - 6).lineTo(ML + BODY_W, y - 6)
          .dash(3, { space: 2 }).lineWidth(0.3).strokeColor('#cccccc').stroke()
        doc.undash()
      })

      rodape(doc, 1, 1)
      doc.end()
    })
  }
}
