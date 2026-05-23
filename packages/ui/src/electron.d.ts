// Declaração do objeto exposto pelo preload script via contextBridge
import type { TestDbPayload, TestDbResult, SaveConfigPayload, AppConfig } from '@sudo-sys/shared'

export interface ElectronAPI {
  checkInitialized: () => Promise<boolean>
  testDatabase: (payload: TestDbPayload) => Promise<TestDbResult>
  saveConfig: (payload: SaveConfigPayload) => Promise<{ success: boolean; error?: string }>
  getConfig: () => Promise<AppConfig | null>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
