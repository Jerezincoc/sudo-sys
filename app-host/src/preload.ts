/**
 * preload.ts
 * Roda em contexto isolado (contextIsolation=true).
 * Expõe a API IPC ao renderer via contextBridge.
 */
import { contextBridge, ipcRenderer } from 'electron'
import type {
  TestDbPayload,
  TestDbResult,
  SaveConfigPayload,
  AppConfig,
} from '@sudo-sys/shared'

contextBridge.exposeInMainWorld('electronAPI', {
  checkInitialized: (): Promise<boolean> =>
    ipcRenderer.invoke('setup:check-initialized'),

  testDatabase: (payload: TestDbPayload): Promise<TestDbResult> =>
    ipcRenderer.invoke('setup:test-database', payload),

  saveConfig: (payload: SaveConfigPayload): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('setup:save-config', payload),

  getConfig: (): Promise<AppConfig | null> =>
    ipcRenderer.invoke('setup:get-config'),
})
