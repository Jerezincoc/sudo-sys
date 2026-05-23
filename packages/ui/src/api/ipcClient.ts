/**
 * ipcClient.ts
 * Abstrai as chamadas IPC para o Electron.
 * Em modo browser (sem Electron), retorna valores mockados para facilitar dev.
 */
import type { TestDbPayload, TestDbResult, SaveConfigPayload, AppConfig } from '@sudo-sys/shared'

function hasElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI
}

export const ipcClient = {
  async checkInitialized(): Promise<boolean> {
    if (hasElectron()) {
      return window.electronAPI.checkInitialized()
    }
    // Mock: nunca inicializado em modo browser puro
    return false
  },

  async testDatabase(payload: TestDbPayload): Promise<TestDbResult> {
    if (hasElectron()) {
      return window.electronAPI.testDatabase(payload)
    }
    // Mock para dev sem Electron
    await new Promise((r) => setTimeout(r, 800))
    return { success: true, latencyMs: 12 }
  },

  async saveConfig(payload: SaveConfigPayload): Promise<{ success: boolean; error?: string }> {
    if (hasElectron()) {
      return window.electronAPI.saveConfig(payload)
    }
    await new Promise((r) => setTimeout(r, 500))
    return { success: true }
  },

  async getConfig(): Promise<AppConfig | null> {
    if (hasElectron()) {
      return window.electronAPI.getConfig()
    }
    return null
  },
}
