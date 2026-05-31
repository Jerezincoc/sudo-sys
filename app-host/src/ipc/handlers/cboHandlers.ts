import { ipcMain } from 'electron'
import { getDb } from '../../db/database'

export function registerCboHandlers(): void {
  ipcMain.handle('cbo:list', () => {
    try {
      return getDb().prepare('SELECT codigo, descricao FROM cbo ORDER BY descricao').all()
    } catch { return [] }
  })
}
