// Declaração do objeto exposto pelo preload script via contextBridge
import type {
  TestDbPayload,
  TestDbResult,
  SaveConfigPayload,
  AppConfig,
  Empresa,
  CreateEmpresaPayload,
  UpdateEmpresaPayload,
} from '@sudo-sys/shared'

type IpcResult<T = void> = { success: true; data: T } | { success: false; error: string }

export interface ElectronAPI {
  // Setup
  checkInitialized: () => Promise<boolean>
  testDatabase: (payload: TestDbPayload) => Promise<TestDbResult>
  saveConfig: (payload: SaveConfigPayload) => Promise<{ success: boolean; error?: string }>
  getConfig: () => Promise<AppConfig | null>

  // Empresas
  listEmpresas: () => Promise<Empresa[]>
  getEmpresa: (id: number) => Promise<Empresa | null>
  createEmpresa: (payload: CreateEmpresaPayload) => Promise<IpcResult<Empresa>>
  updateEmpresa: (payload: UpdateEmpresaPayload) => Promise<IpcResult<Empresa>>
  deleteEmpresa: (id: number) => Promise<IpcResult<void>>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
