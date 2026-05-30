import { ipcMain, dialog, app } from 'electron'
import path from 'path'
import fs from 'fs'

export function registerAdminHandlers() {
  ipcMain.handle('admin:backup', async () => {
    try {
      const dbPath = path.join(app.getPath('userData'), 'banco', 'sudosys.db')
      if (!fs.existsSync(dbPath)) {
        return { success: false, error: 'Banco de dados não encontrado.' }
      }

      const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Fazer Backup do Banco de Dados',
        defaultPath: 'sudosys_backup.db',
        filters: [{ name: 'SQLite Database', extensions: ['db', 'sqlite'] }]
      })

      if (canceled || !filePath) {
        return { success: false, error: 'Cancelado pelo usuário.' }
      }

      fs.copyFileSync(dbPath, filePath)
      return { success: true, data: { filePath } }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
