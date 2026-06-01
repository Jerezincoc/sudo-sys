import { ipcMain, app } from 'electron'
import path from 'path'
import fs from 'fs'
import { getDb } from '../../db/database'
import type {
  DocContratoParams, DocAditivoParams, DocValeParams, DocAdvertenciaParams,
  Empresa, Funcionario,
} from '@sudo-sys/shared'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const PDFDocument: any = require('pdfkit')

// ── Helpers ───────────────────────────────────────────────────────────────────

function tmpPath(prefix: string): string {
  return path.join(app.getPath('temp'), `${prefix}-${Date.now()}.pdf`)
}

function fmtDate(v: string | null | undefined): string {
  if (!v) return '—'
  const [y, m, d] = v.split('-')
  return d && m && y ? `${d}/${m}/${y}` : v
}

function fmtCNPJ(v: string): string {
  const d = v.replace(/\D/g, '')
  if (d.length !== 14) return v
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

function fmtCPF(v: string): string {
  const d = v.replace(/\D/g, '')
  if (d.length !== 11) return v
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

function fmtMoney(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtComp(v: string): string {
  const [y, m] = v.split('-')
  return m && y ? `${m}/${y}` : v
}

function empEndereco(e: Empresa): string {
  return [e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf]
    .filter(Boolean).join(', ')
}

function funcEndereco(f: Funcionario): string {
  return [f.logradouro, f.numero, f.complemento, f.bairro, f.cidade, f.uf]
    .filter(Boolean).join(', ')
}

function getFunc(id: number): Funcionario | undefined {
  return getDb().prepare('SELECT * FROM funcionarios WHERE id = ?').get(id) as Funcionario | undefined
}

function getEmp(id: number): Empresa | undefined {
  return getDb().prepare('SELECT * FROM empresas WHERE id = ?').get(id) as Empresa | undefined
}

// ── buildContrato ─────────────────────────────────────────────────────────────

function buildContrato(func: Funcionario, emp: Empresa, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 55, bottom: 60, left: 60, right: 60 },
    })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)

    const PW = 475  // 595 - 2*60
    const ML = 60

    // ── Cabeçalho empresa ─────────────────────────────────────────
    doc.font('Times-Bold').fontSize(14).fillColor('#1a2744')
      .text(emp.razao_social, { align: 'center' })
    const addr = empEndereco(emp)
    doc.font('Times-Roman').fontSize(9).fillColor('#444444')
      .text(`CNPJ: ${fmtCNPJ(emp.cnpj)}${addr ? ' | ' + addr : ''}`, { align: 'center' })
    doc.moveDown(0.6)
    doc.moveTo(ML, doc.y).lineTo(ML + PW, doc.y).lineWidth(1).strokeColor('#1a2744').stroke()
    doc.moveDown(0.8)

    // ── Título ────────────────────────────────────────────────────
    doc.font('Times-Bold').fontSize(13).fillColor('#000000')
      .text('CONTRATO INDIVIDUAL DE TRABALHO', { align: 'center' })
    doc.font('Times-Roman').fontSize(10).fillColor('#333333')
      .text('Regime: CLT — Prazo Indeterminado com Período de Experiência', { align: 'center' })
    doc.moveDown(1.2)

    doc.fillColor('#000000')
    doc.font('Times-Roman').fontSize(11)
      .text(
        'Pelo presente instrumento particular, as partes abaixo qualificadas celebram o presente Contrato ' +
        'Individual de Trabalho, regido pelas disposições da Consolidação das Leis do Trabalho (CLT) e pela ' +
        'legislação trabalhista vigente:',
        { align: 'justify' }
      )
    doc.moveDown(0.8)

    // ── Partes ────────────────────────────────────────────────────
    doc.font('Times-Bold').fontSize(11).text('CONTRATANTE: ', { continued: true })
    doc.font('Times-Roman')
      .text(`${emp.razao_social}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº ${fmtCNPJ(emp.cnpj)}${addr ? ', com sede em ' + addr : ''}.`, { align: 'justify' })
    doc.moveDown(0.5)

    const fAddr = funcEndereco(func)
    doc.font('Times-Bold').fontSize(11).text('CONTRATADO(A): ', { continued: true })
    doc.font('Times-Roman')
      .text(
        `${func.nome}, portador(a) do CPF nº ${fmtCPF(func.cpf)}` +
        `${func.rg ? ', RG nº ' + func.rg : ''}` +
        `${func.data_nascimento ? ', nascido(a) em ' + fmtDate(func.data_nascimento) : ''}` +
        `${fAddr ? ', residente em ' + fAddr : ''}.`,
        { align: 'justify' }
      )
    doc.moveDown(1)

    // ── Cláusulas ─────────────────────────────────────────────────
    const hSemanais = Math.round((func.carga_horaria ?? 220) / 4.33)

    function clausula(n: string, titulo: string, corpo: string) {
      doc.font('Times-Bold').fontSize(11).text(`${n} — ${titulo}`)
      doc.font('Times-Roman').fontSize(11).text(corpo, { align: 'justify' })
      doc.moveDown(0.6)
    }

    clausula('Cláusula 1ª', 'DO CARGO',
      `O(A) CONTRATADO(A) exercerá o cargo de ${func.cargo || 'a ser definido'}, desempenhando as funções ` +
      `que lhe forem atribuídas pelo CONTRATANTE, nos termos da legislação trabalhista vigente.`
    )
    clausula('Cláusula 2ª', 'DA REMUNERAÇÃO',
      `Pela prestação dos serviços, o(a) CONTRATADO(A) receberá remuneração mensal de ` +
      `${fmtMoney(func.salario_base)}, paga até o 5º (quinto) dia útil do mês subsequente ao trabalhado, ` +
      `podendo ser efetuada via depósito em conta-corrente ou da forma acordada pelas partes.`
    )
    clausula('Cláusula 3ª', 'DA JORNADA DE TRABALHO',
      `A jornada de trabalho será de ${hSemanais} (${hSemanais} horas) semanais, ` +
      `distribuídas de segunda-feira a sexta-feira, nos horários definidos pelo CONTRATANTE, respeitado o limite legal.`
    )
    clausula('Cláusula 4ª', 'DO LOCAL DE TRABALHO',
      `Os serviços serão prestados no estabelecimento localizado em ` +
      `${addr || 'endereço da empresa'}` +
      `, podendo o CONTRATANTE, por necessidade operacional, designar outro local de trabalho.`
    )
    clausula('Cláusula 5ª', 'DAS ANOTAÇÕES NA CTPS',
      `O CONTRATANTE providenciará, no prazo legal, as anotações na Carteira de Trabalho e Previdência Social ` +
      `(CTPS) do(a) CONTRATADO(A), em conformidade com o artigo 29 da CLT.`
    )
    clausula('Cláusula 6ª', 'DO PERÍODO DE EXPERIÊNCIA',
      `O presente contrato é celebrado pelo prazo de experiência de 45 (quarenta e cinco) dias, a contar de ` +
      `${fmtDate(func.data_admissao)}, podendo ser prorrogado por igual período, totalizando o máximo de 90 (noventa) dias, ` +
      `conforme o artigo 445, parágrafo único, da CLT.`
    )
    clausula('Cláusula 7ª', 'DO FORO',
      `As partes elegem o foro da comarca de ${emp.cidade || 'domicílio do empregador'} para dirimir quaisquer ` +
      `litígios decorrentes deste instrumento, com renúncia a qualquer outro foro, por mais privilegiado que seja.`
    )

    // ── Data ─────────────────────────────────────────────────────
    const hoje = new Date()
    doc.moveDown(0.5)
    doc.font('Times-Roman').fontSize(11)
      .text(`${emp.cidade || 'Local'}, ${hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.`, { align: 'right' })

    // ── Assinaturas ───────────────────────────────────────────────
    const SIG_H = 90
    if (doc.y > 841.89 - 60 - SIG_H) doc.addPage()
    const sy1 = doc.y + 30
    const sy2 = sy1 + 55

    function sig(x: number, y: number, w: number, label: string, sub?: string) {
      doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.5).strokeColor('#000').stroke()
      doc.font('Times-Roman').fontSize(9).fillColor('#000')
        .text(label, x, y + 4, { width: w, align: 'center', lineBreak: false })
      if (sub) {
        doc.font('Times-Roman').fontSize(8).fillColor('#666')
          .text(sub, x, y + 15, { width: w, align: 'center', lineBreak: false })
        doc.fillColor('#000')
      }
    }

    sig(ML,       sy1, 200, 'CONTRATANTE', emp.razao_social)
    sig(ML + 275, sy1, 200, 'CONTRATADO(A)', func.nome)
    sig(ML,       sy2, 200, 'TESTEMUNHA 1', 'CPF:')
    sig(ML + 275, sy2, 200, 'TESTEMUNHA 2', 'CPF:')

    doc.end()
  })
}

// ── buildAditivo ──────────────────────────────────────────────────────────────

function buildAditivo(func: Funcionario, emp: Empresa, p: DocAditivoParams, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 55, bottom: 60, left: 60, right: 60 },
    })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)

    const PW = 475
    const ML = 60

    const tipoLabel = p.tipo === 'salario' ? 'ALTERAÇÃO SALARIAL'
      : p.tipo === 'cargo' ? 'ALTERAÇÃO DE CARGO'
      : 'ALTERAÇÃO DE JORNADA'

    const addr = empEndereco(emp)

    doc.font('Times-Bold').fontSize(14).fillColor('#1a2744').text(emp.razao_social, { align: 'center' })
    doc.font('Times-Roman').fontSize(9).fillColor('#444444')
      .text(`CNPJ: ${fmtCNPJ(emp.cnpj)}${addr ? ' | ' + addr : ''}`, { align: 'center' })
    doc.moveDown(0.6)
    doc.moveTo(ML, doc.y).lineTo(ML + PW, doc.y).lineWidth(1).strokeColor('#1a2744').stroke()
    doc.moveDown(0.8)

    doc.font('Times-Bold').fontSize(13).fillColor('#000000')
      .text('ADITIVO AO CONTRATO INDIVIDUAL DE TRABALHO', { align: 'center' })
    doc.font('Times-Roman').fontSize(10).fillColor('#333333')
      .text(tipoLabel, { align: 'center' })
    doc.moveDown(1.2)

    doc.fillColor('#000000')
    doc.font('Times-Roman').fontSize(11)
      .text(
        'Pelo presente instrumento, as partes identificadas abaixo celebram o presente Aditivo ao Contrato ' +
        'Individual de Trabalho firmado entre si, ficando acordadas as alterações nas condições contratuais abaixo especificadas:',
        { align: 'justify' }
      )
    doc.moveDown(0.8)

    doc.font('Times-Bold').text('EMPREGADOR: ', { continued: true })
    doc.font('Times-Roman').text(`${emp.razao_social}, CNPJ nº ${fmtCNPJ(emp.cnpj)}.`)
    doc.moveDown(0.4)
    doc.font('Times-Bold').text('EMPREGADO(A): ', { continued: true })
    doc.font('Times-Roman').text(`${func.nome}, CPF nº ${fmtCPF(func.cpf)}, admitido(a) em ${fmtDate(func.data_admissao)}.`)
    doc.moveDown(1)

    // ── Cláusula de alteração ─────────────────────────────────────
    doc.font('Times-Bold').fontSize(11).text('Cláusula 1ª — DA ALTERAÇÃO CONTRATUAL')
    doc.font('Times-Roman').fontSize(11)

    if (p.tipo === 'salario') {
      doc.text(
        `Fica alterada a remuneração mensal do(a) EMPREGADO(A), que passa de ${p.valorAnterior} ` +
        `para ${p.valorNovo}, com vigência a partir de ${fmtDate(p.dataVigencia)}.`,
        { align: 'justify' }
      )
    } else if (p.tipo === 'cargo') {
      doc.text(
        `Fica alterado o cargo do(a) EMPREGADO(A), que passa de "${p.valorAnterior}" ` +
        `para "${p.valorNovo}", com vigência a partir de ${fmtDate(p.dataVigencia)}.`,
        { align: 'justify' }
      )
    } else {
      doc.text(
        `Fica alterada a jornada de trabalho do(a) EMPREGADO(A), que passa de ${p.valorAnterior} horas ` +
        `para ${p.valorNovo} horas semanais, com vigência a partir de ${fmtDate(p.dataVigencia)}.`,
        { align: 'justify' }
      )
    }
    doc.moveDown(0.8)

    doc.font('Times-Bold').fontSize(11).text('Cláusula 2ª — DAS DEMAIS CLÁUSULAS')
    doc.font('Times-Roman').fontSize(11)
      .text(
        'Permanecem inalteradas todas as demais cláusulas e condições do contrato de trabalho original, ' +
        'não expressamente modificadas por este instrumento.',
        { align: 'justify' }
      )
    doc.moveDown(0.8)

    doc.font('Times-Bold').fontSize(11).text('Cláusula 3ª — DO FORO')
    doc.font('Times-Roman').fontSize(11)
      .text(
        `As partes elegem o foro da comarca de ${emp.cidade || 'domicílio do empregador'} para dirimir ` +
        `quaisquer litígios decorrentes deste instrumento.`,
        { align: 'justify' }
      )
    doc.moveDown(0.5)

    const hoje = new Date()
    doc.font('Times-Roman').fontSize(11)
      .text(`${emp.cidade || 'Local'}, ${hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.`, { align: 'right' })

    const SIG_H = 60
    if (doc.y > 841.89 - 60 - SIG_H) doc.addPage()
    const sy = doc.y + 30

    function sig(x: number, y: number, w: number, label: string, sub?: string) {
      doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.5).strokeColor('#000').stroke()
      doc.font('Times-Roman').fontSize(9).fillColor('#000')
        .text(label, x, y + 4, { width: w, align: 'center', lineBreak: false })
      if (sub) {
        doc.font('Times-Roman').fontSize(8).fillColor('#666')
          .text(sub, x, y + 15, { width: w, align: 'center', lineBreak: false })
        doc.fillColor('#000')
      }
    }

    sig(ML,       sy, 200, 'EMPREGADOR', emp.razao_social)
    sig(ML + 275, sy, 200, 'EMPREGADO(A)', func.nome)

    doc.end()
  })
}

// ── buildVale ─────────────────────────────────────────────────────────────────

function buildVale(func: Funcionario, emp: Empresa, p: DocValeParams, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)

    const ML = 50
    const PW = 495  // 595 - 2*50
    const tipoLabel = p.tipo === 'VT' ? 'VALE TRANSPORTE' : 'VALE REFEIÇÃO'
    const qtdLabel = p.tipo === 'VT' ? 'Dias de trabalho' : 'Refeições'
    const total = p.valor * p.quantidade

    for (let i = 0; i < 2; i++) {
      const base = i === 0 ? 0 : 421
      const viaLabel = i === 0 ? '1ª VIA — EMPRESA' : '2ª VIA — FUNCIONÁRIO (CANHOTO)'

      let y = base + 20

      // Header empresa
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a2744')
        .text(emp.razao_social, ML, y, { width: PW, align: 'center', lineBreak: false })
      y += 14
      doc.font('Helvetica').fontSize(8.5).fillColor('#555555')
        .text(`CNPJ: ${fmtCNPJ(emp.cnpj)}`, ML, y, { width: PW, align: 'center', lineBreak: false })
      y += 12

      // Divider
      doc.moveTo(ML, y).lineTo(ML + PW, y).lineWidth(0.5).strokeColor('#aaaaaa').stroke()
      y += 8

      // Título vale
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#000000')
        .text(tipoLabel, ML, y, { width: PW, align: 'center', lineBreak: false })
      y += 16
      doc.font('Helvetica').fontSize(9).fillColor('#333333')
        .text(`Competência: ${fmtComp(p.competencia)}`, ML, y, { width: PW, align: 'center', lineBreak: false })
      y += 18

      // Dados funcionário
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#000')
        .text('Funcionário:', ML, y, { lineBreak: false })
      doc.font('Helvetica').text(`  ${func.nome}  |  CPF: ${fmtCPF(func.cpf)}`, ML + 70, y, { lineBreak: false })
      y += 14

      doc.font('Helvetica-Bold').fontSize(9).text('Matrícula:', ML, y, { lineBreak: false })
      doc.font('Helvetica').text(`  ${func.codigo}`, ML + 70, y, { lineBreak: false })
      if (func.cargo) {
        doc.font('Helvetica-Bold').text('  Cargo:', ML + 130, y, { lineBreak: false })
        doc.font('Helvetica').text(`  ${func.cargo}`, ML + 175, y, { lineBreak: false })
      }
      y += 18

      // Divider fina
      doc.moveTo(ML, y).lineTo(ML + PW, y).lineWidth(0.3).strokeColor('#cccccc').stroke()
      y += 10

      // Valores
      const colX = [ML, ML + 160, ML + 320]
      const colW = 140

      doc.font('Helvetica').fontSize(8).fillColor('#666')
        .text(qtdLabel, colX[0], y, { width: colW, align: 'center', lineBreak: false })
        .text('Valor Unitário', colX[1], y, { width: colW, align: 'center', lineBreak: false })
        .text('Valor Total', colX[2], y, { width: colW, align: 'center', lineBreak: false })
      y += 12

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#000')
        .text(String(p.quantidade), colX[0], y, { width: colW, align: 'center', lineBreak: false })
        .text(fmtMoney(p.valor), colX[1], y, { width: colW, align: 'center', lineBreak: false })
        .text(fmtMoney(total), colX[2], y, { width: colW, align: 'center', lineBreak: false })
      y += 20

      // Linha desconto (6% VT ou custo empresa VR)
      if (p.tipo === 'VT') {
        const desconto = total * 0.06
        const empresa = total - desconto
        doc.font('Helvetica').fontSize(8).fillColor('#555')
          .text(`Desconto empregado (6%): ${fmtMoney(desconto)}  |  Custo empresa: ${fmtMoney(empresa)}`,
            ML, y, { width: PW, lineBreak: false })
        y += 14
      }

      // Assinatura
      y += 6
      doc.moveTo(ML, y).lineTo(ML + 220, y).lineWidth(0.5).strokeColor('#000').stroke()
      doc.font('Helvetica').fontSize(8.5).fillColor('#000')
        .text('Assinatura do Empregado / Data de recebimento', ML, y + 3, { width: 220, align: 'center', lineBreak: false })

      // Via label
      doc.font('Helvetica').fontSize(7.5).fillColor('#999999')
        .text(viaLabel, ML, base + 395, { width: PW, align: 'right', lineBreak: false })
      doc.fillColor('#000')
    }

    // Linha tracejada separadora
    doc.moveTo(40, 421).lineTo(555, 421)
      .dash(5, { space: 3 }).lineWidth(0.5).strokeColor('#888888').stroke()
    doc.undash()
    // Tesoura
    doc.font('Helvetica').fontSize(8).fillColor('#888').text('✂', 35, 416, { lineBreak: false })
    doc.fillColor('#000')

    doc.end()
  })
}

// ── buildAdvertencia ──────────────────────────────────────────────────────────

function buildAdvertencia(func: Funcionario, emp: Empresa, p: DocAdvertenciaParams, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 55, bottom: 60, left: 60, right: 60 },
    })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)

    const PW = 475
    const ML = 60
    const isSuspensao = p.tipo === 'SUSPENSAO'
    const titulo = isSuspensao ? 'TERMO DE SUSPENSÃO DISCIPLINAR' : 'ADVERTÊNCIA DISCIPLINAR'
    const addr = empEndereco(emp)

    // Header
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#1a2744').text(emp.razao_social, { align: 'center' })
    doc.font('Helvetica').fontSize(9).fillColor('#444444')
      .text(`CNPJ: ${fmtCNPJ(emp.cnpj)}${addr ? ' | ' + addr : ''}`, { align: 'center' })
    doc.moveDown(0.6)
    doc.moveTo(ML, doc.y).lineTo(ML + PW, doc.y).lineWidth(1).strokeColor('#1a2744').stroke()
    doc.moveDown(0.8)

    // Título
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#000000').text(titulo, { align: 'center' })
    doc.moveDown(1.2)

    // Identificação
    doc.fillColor('#000')
    doc.font('Helvetica-Bold').fontSize(11).text('Dados do Empregador:')
    doc.font('Helvetica').fontSize(11)
      .text(`Razão Social: ${emp.razao_social} | CNPJ: ${fmtCNPJ(emp.cnpj)}`)
    doc.moveDown(0.5)

    doc.font('Helvetica-Bold').fontSize(11).text('Dados do Empregado:')
    doc.font('Helvetica').fontSize(11)
      .text(`Nome: ${func.nome} | CPF: ${fmtCPF(func.cpf)}` +
        `${func.cargo ? ' | Cargo: ' + func.cargo : ''}` +
        ` | Admissão: ${fmtDate(func.data_admissao)}`)
    doc.moveDown(1)

    // Corpo
    const hoje = new Date()
    const dataHoje = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

    if (isSuspensao) {
      doc.font('Helvetica').fontSize(11).text(
        `Por meio do presente instrumento, fica o(a) Sr(a). ${func.nome} suspenso(a) disciplinarmente ` +
        `com fundamento no artigo 474 da CLT, pelo período de ${p.diasSuspensao ?? 1} ` +
        `(${p.diasSuspensao ?? 1}) dia(s) corrido(s), a contar desta data.`,
        { align: 'justify' }
      )
    } else {
      doc.font('Helvetica').fontSize(11).text(
        `Por meio do presente instrumento, fica o(a) Sr(a). ${func.nome} formalmente advertido(a), ` +
        `nos termos do artigo 473 e seguintes da CLT, em razão dos fatos abaixo descritos.`,
        { align: 'justify' }
      )
    }
    doc.moveDown(0.8)

    doc.font('Helvetica-Bold').fontSize(11).text(`Motivo${isSuspensao ? ' da Suspensão' : ' da Advertência'}:`)
    doc.font('Helvetica').fontSize(11).text(p.motivo, { align: 'justify' })
    doc.moveDown(0.8)

    if (isSuspensao) {
      doc.font('Helvetica').fontSize(11)
        .text(
          `Durante o período de suspensão, o(a) empregado(a) ficará impedido(a) de comparecer ao trabalho, ` +
          `não tendo direito à remuneração pelos dias suspensos. A reincidência poderá implicar em rescisão ` +
          `motivada do contrato de trabalho por justa causa.`,
          { align: 'justify' }
        )
      doc.moveDown(0.8)
    }

    // Declaração de ciência
    doc.font('Helvetica-Bold').fontSize(11).text('Declaração de Ciência:')
    doc.font('Helvetica').fontSize(11)
      .text(
        `Declaro que fui devidamente cientificado(a) do presente instrumento e de seu conteúdo, ` +
        `recebendo uma via deste documento nesta data de ${dataHoje}.`,
        { align: 'justify' }
      )
    doc.moveDown(0.5)

    doc.font('Helvetica').fontSize(11)
      .text(`${emp.cidade || 'Local'}, ${dataHoje}.`, { align: 'right' })

    // Assinaturas
    const SIG_H = 70
    if (doc.y > 841.89 - 60 - SIG_H) doc.addPage()
    const sy = doc.y + 30

    function sig(x: number, y: number, w: number, label: string, sub?: string) {
      doc.moveTo(x, y).lineTo(x + w, y).lineWidth(0.5).strokeColor('#000').stroke()
      doc.font('Helvetica').fontSize(9).fillColor('#000')
        .text(label, x, y + 4, { width: w, align: 'center', lineBreak: false })
      if (sub) {
        doc.font('Helvetica').fontSize(8).fillColor('#666')
          .text(sub, x, y + 15, { width: w, align: 'center', lineBreak: false })
        doc.fillColor('#000')
      }
    }

    const SW = 140
    sig(ML,           sy, SW, 'EMPREGADOR', emp.razao_social)
    sig(ML + 167,     sy, SW, 'EMPREGADO(A)', func.nome)
    sig(ML + 334,     sy, SW, 'TESTEMUNHA', 'CPF:')

    doc.end()
  })
}

// ── Register handlers ─────────────────────────────────────────────────────────

export function registerDocumentosHandlers(): void {
  ipcMain.handle('doc:contrato', async (_e, p: DocContratoParams) => {
    try {
      const func = getFunc(p.funcionarioId)
      const emp  = getEmp(p.empresaId)
      if (!func) return { success: false, error: 'Funcionário não encontrado.' }
      if (!emp)  return { success: false, error: 'Empresa não encontrada.' }
      const fp = tmpPath('contrato')
      await buildContrato(func, emp, fp)
      return { success: true, data: { filePath: fp } }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('doc:aditivo', async (_e, p: DocAditivoParams) => {
    try {
      const func = getFunc(p.funcionarioId)
      const emp  = getEmp(p.empresaId)
      if (!func) return { success: false, error: 'Funcionário não encontrado.' }
      if (!emp)  return { success: false, error: 'Empresa não encontrada.' }
      const fp = tmpPath('aditivo')
      await buildAditivo(func, emp, p, fp)
      return { success: true, data: { filePath: fp } }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('doc:vale', async (_e, p: DocValeParams) => {
    try {
      const func = getFunc(p.funcionarioId)
      const emp  = getEmp(p.empresaId)
      if (!func) return { success: false, error: 'Funcionário não encontrado.' }
      if (!emp)  return { success: false, error: 'Empresa não encontrada.' }
      const fp = tmpPath('vale')
      await buildVale(func, emp, p, fp)
      return { success: true, data: { filePath: fp } }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })

  ipcMain.handle('doc:advertencia', async (_e, p: DocAdvertenciaParams) => {
    try {
      const func = getFunc(p.funcionarioId)
      const emp  = getEmp(p.empresaId)
      if (!func) return { success: false, error: 'Funcionário não encontrado.' }
      if (!emp)  return { success: false, error: 'Empresa não encontrada.' }
      const fp = tmpPath('advertencia')
      await buildAdvertencia(func, emp, p, fp)
      return { success: true, data: { filePath: fp } }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })
}
