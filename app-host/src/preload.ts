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
  Empresa,
  CreateEmpresaPayload,
  UpdateEmpresaPayload,
} from '@sudo-sys/shared'

type IpcResult<T> = { success: true; data: T } | { success: false; error: string }

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Setup ─────────────────────────────────────────────────────────
  checkInitialized: (): Promise<boolean> =>
    ipcRenderer.invoke('setup:check-initialized'),

  testDatabase: (payload: TestDbPayload): Promise<TestDbResult> =>
    ipcRenderer.invoke('setup:test-database', payload),

  saveConfig: (payload: SaveConfigPayload): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('setup:save-config', payload),

  getConfig: (): Promise<AppConfig | null> =>
    ipcRenderer.invoke('setup:get-config'),

  // ── Empresas ──────────────────────────────────────────────────────
  listEmpresas: (): Promise<Empresa[]> =>
    ipcRenderer.invoke('empresa:list'),

  getEmpresa: (id: number): Promise<Empresa | null> =>
    ipcRenderer.invoke('empresa:get', id),

  createEmpresa: (payload: CreateEmpresaPayload): Promise<IpcResult<Empresa>> =>
    ipcRenderer.invoke('empresa:create', payload),

  updateEmpresa: (payload: UpdateEmpresaPayload): Promise<IpcResult<Empresa>> =>
    ipcRenderer.invoke('empresa:update', payload),

  deleteEmpresa: (id: number): Promise<IpcResult<void>> =>
    ipcRenderer.invoke('empresa:delete', id),
})
