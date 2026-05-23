/**
 * setupHandlers.ts
 * IPC handlers para o Setup Wizard (setup:*).
 * src/ipc/handlers/ -> src/setup/ = ../../setup/
 */
import { ipcMain } from 'electron'
import { isInitialized, readConfig, writeConfig } from '../../setup/configManager'
import { testDatabase } from '../../setup/dbTester'
import type { TestDbPayload, SaveConfigPayload } from '@sudo-sys/shared'

export function registerSetupHandlers(): void {
  // Verifica se o sistema ja foi configurado
  ipcMain.handle('setup:check-initialized', (): boolean => {
    return isInitialized()
  })

  // Testa a conexao com o banco escolhido
  ipcMain.handle('setup:test-database', async (_event, payload: TestDbPayload) => {
    return testDatabase(payload)
  })

  // Salva a configuracao e marca como inicializado
  ipcMain.handle('setup:save-config', async (_event, payload: SaveConfigPayload) => {
    try {
      writeConfig(payload)
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return { success: false, error: msg }
    }
  })

  // Retorna a configuracao atual (ou null se nao configurado)
  ipcMain.handle('setup:get-config', () => {
    return readConfig()
  })
}