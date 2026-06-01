import { ipcMain } from 'electron'
import { getDb } from '../../db/database'

export function registerCboHandlers(): void {
  // ── cbo:list-grupos ───────────────────────────────────────────────
  ipcMain.handle('cbo:list-grupos', () => {
    const db = getDb()
    const rows = db.prepare(
      `SELECT DISTINCT substr(codigo,1,1) as codigo FROM cbo ORDER BY 1`
    ).all() as { codigo: string }[]
    return rows.map((r) => ({ codigo: r.codigo, descricao: '' }))
  })

  // ── cbo:list-subgrupo ─────────────────────────────────────────────
  ipcMain.handle('cbo:list-subgrupo', (_e, prefix: string) => {
    const db = getDb()
    const nextLen = prefix.length + 1
    const isLeafLevel = prefix.length >= 6

    if (isLeafLevel) {
      return db.prepare(
        `SELECT codigo, descricao FROM cbo WHERE codigo LIKE ? ORDER BY codigo`
      ).all(`${prefix}%`) as { codigo: string; descricao: string }[]
    }

    const rows = db.prepare(
      `SELECT DISTINCT substr(codigo, 1, ?) as codigo FROM cbo WHERE codigo LIKE ? ORDER BY 1`
    ).all(nextLen, `${prefix}%`) as { codigo: string }[]
    return rows.map((r) => ({ codigo: r.codigo, descricao: '' }))
  })

  // ── cbo:search ────────────────────────────────────────────────────
  ipcMain.handle('cbo:search', (_e, q: string) => {
    const db = getDb()
    const term = `%${q}%`
    return db.prepare(
      `SELECT codigo, descricao FROM cbo WHERE codigo LIKE ? OR descricao LIKE ? LIMIT 50`
    ).all(term, term) as { codigo: string; descricao: string }[]
  })
}
