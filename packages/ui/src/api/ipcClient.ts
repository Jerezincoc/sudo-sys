/**
 * ipcClient.ts
 * Abstrai as chamadas IPC para o Electron.
 * Em modo browser (sem Electron), retorna valores mockados para facilitar dev.
 */
import type {
  TestDbPayload,
  TestDbResult,
  SaveConfigPayload,
  AppConfig,
  Empresa,
  CreateEmpresaPayload,
  UpdateEmpresaPayload,
} from '@sudo-sys/shared'

function hasElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI
}

type IpcResult<T = void> = { success: true; data: T } | { success: false; error: string }

export const ipcClient = {
  // ── Setup ──────────────────────────────────────────────────────
  async checkInitialized(): Promise<boolean> {
    if (hasElectron()) return window.electronAPI.checkInitialized()
    return false
  },

  async testDatabase(payload: TestDbPayload): Promise<TestDbResult> {
    if (hasElectron()) return window.electronAPI.testDatabase(payload)
    await new Promise((r) => setTimeout(r, 800))
    return { success: true, latencyMs: 12 }
  },

  async saveConfig(payload: SaveConfigPayload): Promise<{ success: boolean; error?: string }> {
    if (hasElectron()) return window.electronAPI.saveConfig(payload)
    await new Promise((r) => setTimeout(r, 500))
    return { success: true }
  },

  async getConfig(): Promise<AppConfig | null> {
    if (hasElectron()) return window.electronAPI.getConfig()
    return null
  },

  // ── Empresas ───────────────────────────────────────────────────
  async listEmpresas(): Promise<Empresa[]> {
    if (hasElectron()) return window.electronAPI.listEmpresas()
    return []
  },

  async getEmpresa(id: number): Promise<Empresa | null> {
    if (hasElectron()) return window.electronAPI.getEmpresa(id)
    return null
  },

  async createEmpresa(payload: CreateEmpresaPayload): Promise<IpcResult<Empresa>> {
    if (hasElectron()) return window.electronAPI.createEmpresa(payload)
    const mock: Empresa = {
      ...payload,
      id: Date.now(),
      codigo: payload.codigo || '0001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return { success: true, data: mock }
  },

  async updateEmpresa(payload: UpdateEmpresaPayload): Promise<IpcResult<Empresa>> {
    if (hasElectron()) return window.electronAPI.updateEmpresa(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async deleteEmpresa(id: number): Promise<IpcResult<void>> {
    if (hasElectron()) return window.electronAPI.deleteEmpresa(id)
    return { success: true, data: undefined }
  },
}
