/**
 * empresaHandlers.ts
 * IPC handlers para o cadastro de empresas (empresa:*).
 * Usa SqliteEmpresaRepository + validações inline nesta camada de IPC.
 */
import { ipcMain, app } from 'electron'
import fs from 'fs'
import path from 'path'
import { getDb } from '../../db/database'
// pdfkit é carregado em runtime para evitar dependência de compilação de @types/pdfkit.
// Após fechar o Electron, rode: pnpm add pdfkit && pnpm add -D @types/pdfkit
// e substitua esta linha por: import PDFDocument from 'pdfkit'
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const PDFDocument: any = require('pdfkit')
import { SqliteEmpresaRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteEmpresaRepository'
import type { Empresa, CreateEmpresaPayload, UpdateEmpresaPayload } from '@sudo-sys/shared'

function repo() {
  return new SqliteEmpresaRepository(getDb())
}

function validateCreate(payload: CreateEmpresaPayload): string | null {
  if (!payload.razao_social || payload.razao_social.trim().length < 3)
    return 'Razão Social deve ter pelo menos 3 caracteres.'
  if (!payload.cnpj)
    return 'CNPJ é obrigatório.'
  if (payload.aliquota_rat != null && (payload.aliquota_rat < 0.1 || payload.aliquota_rat > 3.0))
    return 'Alíquota RAT deve estar entre 0.1 e 3.0.'
  if (payload.fap != null && (payload.fap < 0.5 || payload.fap > 2.0))
    return 'FAP deve estar entre 0.5 e 2.0.'
  return null
}

// ── Helpers de exportação ─────────────────────────────────────────────────────

/** Timestamp no formato YYYYMMDD_HHmmss para nomes de arquivo. */
function makeTimestamp(): string {
  const now = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}_${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`
}

/** Formata CNPJ: 00.000.000/0001-00 */
function fmtCNPJ(v: string): string {
  const d = v.replace(/\D/g, '')
  if (d.length !== 14) return v
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

/** Campos selecionados para exportação (todos os formatos usam o mesmo conjunto). */
interface ExportRow {
  codigo: string
  razao_social: string
  cnpj: string
  nome_fantasia: string
  cnae_principal: string
  uf: string
  status: string
}

function toExportRow(e: Empresa): ExportRow {
  return {
    codigo:        e.codigo,
    razao_social:  e.razao_social,
    cnpj:          fmtCNPJ(e.cnpj),
    nome_fantasia: e.nome_fantasia  ?? '',
    cnae_principal:e.cnae_principal ?? '',
    uf:            e.uf             ?? '',
    status:        e.status === 'ativa' ? 'Ativa' : 'Inativa',
  }
}

const CSV_LABELS: string[]            = ['Código', 'Razão Social', 'CNPJ', 'Nome Fantasia', 'CNAE', 'UF', 'Status']
const CSV_KEYS:   (keyof ExportRow)[] = ['codigo', 'razao_social', 'cnpj', 'nome_fantasia', 'cnae_principal', 'uf', 'status']

// ── CSV ───────────────────────────────────────────────────────────────────────

function buildCSV(empresas: Empresa[]): string {
  const bom  = '﻿'   // BOM UTF-8 para o Excel reconhecer a codificação
  const header = CSV_LABELS.join(';')
  const rows = empresas.map((e) => {
    const r = toExportRow(e)
    return CSV_KEYS.map((k) => {
      const val = String(r[k])
      return val.includes(';') || val.includes('"')
        ? `"${val.replace(/"/g, '""')}"`
        : val
    }).join(';')
  })
  return bom + [header, ...rows].join('\r\n')
}

// ── JSON ──────────────────────────────────────────────────────────────────────

function buildJSON(empresas: Empresa[]): string {
  return JSON.stringify(empresas.map(toExportRow), null, 2)
}

// ── PDF ───────────────────────────────────────────────────────────────────────

/**
 * Gera um PDF A4 com tabela de empresas usando pdfkit.
 * Coordenadas absolutas — y é gerenciado manualmente para evitar
 * surpresas com o cursor interno do pdfkit.
 */
function buildPDF(empresas: Empresa[], filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true })
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)

    const ML = 40        // left margin
    const MT = 40        // top margin
    const PW = 515       // usable width  (595 - 2*40)
    const PH = 841.89    // A4 height (pt)
    const BOT= 50        // bottom safe zone
    const RH = 15        // row height

    // ── Definição das colunas ─────────────────────────────────────
    const COLS: { label: string; key: keyof ExportRow; x: number; w: number }[] = [
      { label: 'Código',        key: 'codigo',        x: ML,       w: 42  },
      { label: 'Razão Social',  key: 'razao_social',  x: ML + 42,  w: 163 },
      { label: 'CNPJ',          key: 'cnpj',          x: ML + 205, w: 107 },
      { label: 'Nome Fantasia', key: 'nome_fantasia',  x: ML + 312, w: 90  },
      { label: 'CNAE',          key: 'cnae_principal', x: ML + 402, w: 50  },
      { label: 'UF',            key: 'uf',             x: ML + 452, w: 22  },
      { label: 'Status',        key: 'status',         x: ML + 474, w: 41  },
    ]

    let page = 1
    let y = MT

    // ── Função auxiliar: cabeçalho de página ──────────────────────
    function drawPageHeader() {
      // Título
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a2744')
        .text('Relatório de Empresas — SudoSys', ML, y, { width: PW, align: 'center', lineBreak: false })
      y += 16

      // Subtítulo
      const now = new Date()
      const dt  = now.toLocaleDateString('pt-BR')
      const hr  = now.toLocaleTimeString('pt-BR')
      doc.fontSize(8).font('Helvetica').fillColor('#666666')
        .text(`Gerado em ${dt} às ${hr}  ·  ${empresas.length} registro(s)`, ML, y, { width: PW, align: 'center', lineBreak: false })
      y += 12

      // Linha separadora azul
      doc.moveTo(ML, y).lineTo(ML + PW, y).lineWidth(1.5).strokeColor('#1e4f8a').stroke()
      y += 6

      // Cabeçalho da tabela
      doc.rect(ML, y, PW, RH).fillColor('#1e4f8a').fill()
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#ffffff')
      COLS.forEach((c) => {
        doc.text(c.label, c.x + 3, y + 4, { width: c.w - 4, lineBreak: false })
      })
      y += RH

      // Linha fina abaixo do cabeçalho
      doc.moveTo(ML, y).lineTo(ML + PW, y).lineWidth(0.3).strokeColor('#aaaaaa').stroke()
    }

    drawPageHeader()

    // ── Linhas de dados ───────────────────────────────────────────
    empresas.forEach((emp, i) => {
      // Quebra de página
      if (y + RH > PH - BOT) {
        // Número de página no rodapé antes de trocar
        doc.fontSize(7).font('Helvetica').fillColor('#999999')
          .text(`Página ${page}`, ML, PH - 30, { width: PW, align: 'right', lineBreak: false })

        doc.addPage({ size: 'A4', margin: 0 })
        page++
        y = MT
        drawPageHeader()
      }

      // Faixa zebrada — a cada linha ímpar (base 0)
      if (i % 2 === 1) {
        doc.rect(ML, y, PW, RH).fillColor('#f0f4f8').fill()
      }

      const row = toExportRow(emp)
      doc.fontSize(7.5).font('Helvetica').fillColor('#1a2744')
      COLS.forEach((c) => {
        doc.text(String(row[c.key]), c.x + 3, y + 4, { width: c.w - 4, lineBreak: false })
      })

      y += RH
    })

    // Linha de fechamento da tabela
    doc.moveTo(ML, y).lineTo(ML + PW, y).lineWidth(0.5).strokeColor('#aaaaaa').stroke()

    // Número de página na última página
    doc.fontSize(7).font('Helvetica').fillColor('#999999')
      .text(`Página ${page}`, ML, PH - 30, { width: PW, align: 'right', lineBreak: false })

    doc.end()
  })
}

// ── Handlers IPC ─────────────────────────────────────────────────────────────

export function registerEmpresaHandlers(): void {
  // ── empresa:list ────────────────────────────────────────────────
  ipcMain.handle('empresa:list', () => {
    return repo().list()
  })

  // ── empresa:get ─────────────────────────────────────────────────
  ipcMain.handle('empresa:get', (_e, id: number) => {
    return repo().getById(id)
  })

  // ── empresa:create ──────────────────────────────────────────────
  ipcMain.handle('empresa:create', (_e, payload: CreateEmpresaPayload) => {
    try {
      const err = validateCreate(payload)
      if (err) return { success: false, error: err }

      const r = repo()
      const codigo = payload.codigo || r.nextCodigo()
      const empresa = r.create({ ...payload, codigo, status: payload.status ?? 'ativa' })
      return { success: true, data: empresa }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const dupCNPJ = msg.includes('UNIQUE') && msg.includes('cnpj')
      const dupCod  = msg.includes('UNIQUE') && msg.includes('codigo')
      return {
        success: false,
        error: dupCNPJ ? 'Já existe uma empresa com este CNPJ.'
             : dupCod  ? 'Código de empresa já em uso.'
             : msg,
      }
    }
  })

  // ── empresa:update ──────────────────────────────────────────────
  ipcMain.handle('empresa:update', (_e, payload: UpdateEmpresaPayload) => {
    try {
      if (payload.razao_social !== undefined && payload.razao_social.trim().length < 3)
        return { success: false, error: 'Razão Social deve ter pelo menos 3 caracteres.' }
      if (payload.aliquota_rat != null && (payload.aliquota_rat < 0.1 || payload.aliquota_rat > 3.0))
        return { success: false, error: 'Alíquota RAT deve estar entre 0.1 e 3.0.' }
      if (payload.fap != null && (payload.fap < 0.5 || payload.fap > 2.0))
        return { success: false, error: 'FAP deve estar entre 0.5 e 2.0.' }

      const empresa = repo().update(payload)
      return { success: true, data: empresa }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── empresa:delete (lógica dupla) ───────────────────────────────
  //   Empresa ATIVA   → soft-delete (status = 'inativa') → action: 'inativada'
  //   Empresa INATIVA → hard-delete (DELETE FROM empresas) → action: 'excluida'
  ipcMain.handle('empresa:delete', (_e, id: number) => {
    try {
      const r = repo()
      const exists = r.getById(id)
      if (!exists) return { success: false, error: `Empresa ${id} não encontrada.` }
      const { action } = r.deleteOrPermanent(id)
      return { success: true, data: undefined, action }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── empresa:export (CSV | JSON | PDF) ───────────────────────────
  ipcMain.handle('empresa:export', async (_e, payload: { ids: number[]; format: 'csv' | 'json' | 'pdf' }) => {
    try {
      const { ids, format } = payload

      // Busca registros completos (ignora ids inexistentes silenciosamente)
      const r = repo()
      const empresas = ids
        .map((id) => r.getById(id))
        .filter((e): e is Empresa => e !== null)

      if (empresas.length === 0)
        return { success: false, error: 'Nenhuma empresa encontrada para os ids fornecidos.' }

      // Diretório de destino: pasta Downloads do usuário
      const downloadsDir = app.getPath('downloads')
      const fileName     = `empresas_${makeTimestamp()}.${format}`
      const filePath     = path.join(downloadsDir, fileName)

      if (format === 'csv') {
        fs.writeFileSync(filePath, buildCSV(empresas), 'utf-8')
      } else if (format === 'json') {
        fs.writeFileSync(filePath, buildJSON(empresas), 'utf-8')
      } else {
        await buildPDF(empresas, filePath)
      }

      return { success: true, data: { filePath } }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
