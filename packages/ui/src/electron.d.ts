// Declaração do objeto exposto pelo preload script via contextBridge
import type {
  TestDbPayload,
  TestDbResult,
  SaveConfigPayload,
  AppConfig,
  Empresa,
  CreateEmpresaPayload,
  UpdateEmpresaPayload,
  Funcionario,
  CreateFuncionarioPayload,
  UpdateFuncionarioPayload,
  Ferias,
  CreateFeriasPayload,
  UpdateFeriasPayload,
  Rubrica,
  CreateRubricaPayload,
  UpdateRubricaPayload,
  DocContratoParams,
  DocAditivoParams,
  DocValeParams,
  DocAdvertenciaParams,
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
  deleteEmpresa: (id: number) => Promise<IpcResult<void> & { action?: string }>
  exportEmpresas: (payload: {
    ids: number[]
    format: 'csv' | 'json' | 'pdf'
  }) => Promise<IpcResult<{ filePath: string }>>

  // Funcionários
  listFuncionarios: (empresaId?: number) => Promise<Funcionario[]>
  getFuncionario: (id: number) => Promise<Funcionario | null>
  createFuncionario: (payload: CreateFuncionarioPayload) => Promise<IpcResult<Funcionario>>
  updateFuncionario: (payload: UpdateFuncionarioPayload) => Promise<IpcResult<Funcionario>>
  deleteFuncionario: (id: number) => Promise<IpcResult<void> & { action?: string }>

  // Férias
  listFerias: (empresaId: number) => Promise<Ferias[]>
  getFerias: (id: number) => Promise<Ferias | null>
  createFerias: (payload: CreateFeriasPayload) => Promise<IpcResult<Ferias>>
  updateFerias: (payload: UpdateFeriasPayload) => Promise<IpcResult<Ferias>>
  deleteFerias: (id: number) => Promise<IpcResult<void>>

  // Rubricas
  listRubricas: (empresaId?: number | null) => Promise<Rubrica[]>
  getRubrica: (id: number) => Promise<Rubrica | null>
  createRubrica: (payload: CreateRubricaPayload) => Promise<IpcResult<Rubrica>>
  updateRubrica: (payload: UpdateRubricaPayload) => Promise<IpcResult<Rubrica>>
  deleteRubrica: (id: number) => Promise<IpcResult<void> & { action?: string }>

  // Documentos PDF
  docContrato:    (p: DocContratoParams)    => Promise<IpcResult<{ filePath: string }>>
  docAditivo:     (p: DocAditivoParams)     => Promise<IpcResult<{ filePath: string }>>
  docVale:        (p: DocValeParams)        => Promise<IpcResult<{ filePath: string }>>
  docAdvertencia: (p: DocAdvertenciaParams) => Promise<IpcResult<{ filePath: string }>>

  // CBO
  cboListGrupos: () => Promise<{ codigo: string; descricao: string }[]>
  cboListSubgrupo: (prefix: string) => Promise<{ codigo: string; descricao: string }[]>
  cboSearch: (q: string) => Promise<{ codigo: string; descricao: string }[]>

  // Shell / Sistema
  /** Revela o arquivo no explorador do sistema operacional. */
  openPath: (filePath: string) => Promise<void>

  // Diálogos do sistema
  openFileDialog: (options: {
    filters?: Array<{ name: string; extensions: string[] }>
    title?: string
  }) => Promise<string | null>

  // Importação de empresas
  importEmpresas: (payload: {
    filePath: string
    format: 'csv' | 'json'
  }) => Promise<{ success: true; imported: number; skipped: number; errors: string[] }
              | { success: false; error: string }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
