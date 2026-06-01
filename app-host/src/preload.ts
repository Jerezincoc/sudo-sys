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

  exportEmpresas: (payload: { ids: number[]; format: 'csv' | 'json' | 'pdf' }): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('empresa:export', payload),

  // ── Funcionários ──────────────────────────────────────────────────
  listFuncionarios: (empresaId?: number): Promise<Funcionario[]> =>
    ipcRenderer.invoke('funcionario:list', empresaId),

  getFuncionario: (id: number): Promise<Funcionario | null> =>
    ipcRenderer.invoke('funcionario:get', id),

  createFuncionario: (payload: CreateFuncionarioPayload): Promise<IpcResult<Funcionario>> =>
    ipcRenderer.invoke('funcionario:create', payload),

  updateFuncionario: (payload: UpdateFuncionarioPayload): Promise<IpcResult<Funcionario>> =>
    ipcRenderer.invoke('funcionario:update', payload),

  deleteFuncionario: (id: number): Promise<IpcResult<void> & { action?: string }> =>
    ipcRenderer.invoke('funcionario:delete', id),

  // ── Férias ────────────────────────────────────────────────────────
  listFerias: (empresaId: number): Promise<Ferias[]> =>
    ipcRenderer.invoke('ferias:list', empresaId),

  getFerias: (id: number): Promise<Ferias | null> =>
    ipcRenderer.invoke('ferias:get', id),

  createFerias: (payload: CreateFeriasPayload): Promise<IpcResult<Ferias>> =>
    ipcRenderer.invoke('ferias:create', payload),

  updateFerias: (payload: UpdateFeriasPayload): Promise<IpcResult<Ferias>> =>
    ipcRenderer.invoke('ferias:update', payload),

  deleteFerias: (id: number): Promise<IpcResult<void>> =>
    ipcRenderer.invoke('ferias:delete', id),

  // ── Rubricas ──────────────────────────────────────────────────────
  listRubricas: (empresaId?: number | null): Promise<Rubrica[]> =>
    ipcRenderer.invoke('rubrica:list', empresaId),

  getRubrica: (id: number): Promise<Rubrica | null> =>
    ipcRenderer.invoke('rubrica:get', id),

  createRubrica: (payload: CreateRubricaPayload): Promise<IpcResult<Rubrica>> =>
    ipcRenderer.invoke('rubrica:create', payload),

  updateRubrica: (payload: UpdateRubricaPayload): Promise<IpcResult<Rubrica>> =>
    ipcRenderer.invoke('rubrica:update', payload),

  deleteRubrica: (id: number): Promise<IpcResult<void> & { action?: string }> =>
    ipcRenderer.invoke('rubrica:delete', id),

  // ── Documentos PDF ────────────────────────────────────────────────
  docContrato:    (p: DocContratoParams): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('doc:contrato', p),

  docAditivo:     (p: DocAditivoParams): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('doc:aditivo', p),

  docVale:        (p: DocValeParams): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('doc:vale', p),

  docAdvertencia: (p: DocAdvertenciaParams): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('doc:advertencia', p),

  // ── CBO ───────────────────────────────────────────────────────────
  cboListGrupos: (): Promise<{ codigo: string; descricao: string }[]> =>
    ipcRenderer.invoke('cbo:list-grupos'),

  cboListSubgrupo: (prefix: string): Promise<{ codigo: string; descricao: string }[]> =>
    ipcRenderer.invoke('cbo:list-subgrupo', prefix),

  cboSearch: (q: string): Promise<{ codigo: string; descricao: string }[]> =>
    ipcRenderer.invoke('cbo:search', q),

  // ── Folha ─────────────────────────────────────────────────────────
  folhaGerarPdf: (payload: unknown): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('folha:generate-pdf', payload),

  // ── Shell / Sistema ────────────────────────────────────────────────
  /** Revela o arquivo no gerenciador de arquivos do SO. */
  openPath: (filePath: string): Promise<void> =>
    ipcRenderer.invoke('shell:open-path', filePath),

  // ── Diálogos ──────────────────────────────────────────────────────
  openFileDialog: (options: {
    filters?: Array<{ name: string; extensions: string[] }>
    title?: string
  }): Promise<string | null> =>
    ipcRenderer.invoke('dialog:open-file', options),

  // ── Importação ────────────────────────────────────────────────────
  importEmpresas: (payload: {
    filePath: string
    format: 'csv' | 'json'
  }): Promise<
    | { success: true; imported: number; skipped: number; errors: string[] }
    | { success: false; error: string }
  > =>
    ipcRenderer.invoke('empresa:import', payload),
})
