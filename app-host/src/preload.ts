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
  LoginPayload,
  LoginResult,
  Usuario,
  Rescisao,
  CreateRescisaoPayload,
  UpdateRescisaoPayload,
  Rubrica,
  CreateRubricaPayload,
  UpdateRubricaPayload,
  Ferias,
  CreateFeriasPayload,
  UpdateFeriasPayload,
  RegistroPonto,
  CreatePontoPayload,
  UpdatePontoPayload,
  EspelhoPonto,
  FolhaCompetencia,
  FolhaLancamento,
  FolhaHolerite,
  CreateFolhaPayload,
  CreateLancamentoPayload,
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

  // ── Shell / Sistema ────────────────────────────────────────────────
  /** Revela o arquivo no gerenciador de arquivos do SO. */
  openPath: (filePath: string): Promise<void> =>
    ipcRenderer.invoke('shell:open-path', filePath),

  // ── Auth ──────────────────────────────────────────────────────────
  login: (payload: LoginPayload): Promise<LoginResult> =>
    ipcRenderer.invoke('auth:login', payload),

  logout: (token: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('auth:logout', token),

  register: (payload: { nome: string; email: string; senha: string; papel: string; requestingToken: string }): Promise<LoginResult> =>
    ipcRenderer.invoke('auth:register', payload),

  me: (token: string): Promise<Usuario | null> =>
    ipcRenderer.invoke('auth:me', token),

  listUsuarios: (): Promise<IpcResult<Usuario[]>> =>
    ipcRenderer.invoke('usuario:list'),

  createUsuario: (payload: { nome: string; email: string; senha: string; papel: string }): Promise<IpcResult<Usuario>> =>
    ipcRenderer.invoke('usuario:create', payload),

  deleteUsuario: (id: number): Promise<IpcResult<void>> =>
    ipcRenderer.invoke('usuario:delete', id),

  // ── Admin ─────────────────────────────────────────────────────────
  backupDatabase: (): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('admin:backup'),

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

  // ── Rescisão ──────────────────────────────────────────────────────
  listRescisoes: (empresaId: number): Promise<Rescisao[]> =>
    ipcRenderer.invoke('rescisao:list', empresaId),

  getRescisao: (id: number): Promise<Rescisao | null> =>
    ipcRenderer.invoke('rescisao:get', id),

  createRescisao: (payload: CreateRescisaoPayload): Promise<IpcResult<Rescisao>> =>
    ipcRenderer.invoke('rescisao:create', payload),

  updateRescisao: (payload: UpdateRescisaoPayload): Promise<IpcResult<Rescisao>> =>
    ipcRenderer.invoke('rescisao:update', payload),

  deleteRescisao: (id: number): Promise<IpcResult<void>> =>
    ipcRenderer.invoke('rescisao:delete', id),

  calcularRescisao: (id: number): Promise<IpcResult<Rescisao>> =>
    ipcRenderer.invoke('rescisao:calcular', id),

  // ── Rubricas ──────────────────────────────────────────────────────
  listRubricas: (empresaId?: number): Promise<Rubrica[]> =>
    ipcRenderer.invoke('rubrica:list', empresaId),

  getRubrica: (id: number): Promise<Rubrica | null> =>
    ipcRenderer.invoke('rubrica:get', id),

  createRubrica: (payload: CreateRubricaPayload): Promise<IpcResult<Rubrica>> =>
    ipcRenderer.invoke('rubrica:create', payload),

  updateRubrica: (payload: UpdateRubricaPayload): Promise<IpcResult<Rubrica>> =>
    ipcRenderer.invoke('rubrica:update', payload),

  deleteRubrica: (id: number): Promise<IpcResult<void> & { action?: string }> =>
    ipcRenderer.invoke('rubrica:delete', id),

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

  // ── Ponto ────────────────────────────────────────────────────────
  listPonto: (empresaId: number, mes?: number, ano?: number, funcionarioId?: number): Promise<RegistroPonto[]> =>
    ipcRenderer.invoke('ponto:list', empresaId, mes, ano, funcionarioId),

  getPonto: (id: number): Promise<RegistroPonto | null> =>
    ipcRenderer.invoke('ponto:get', id),

  createPonto: (payload: CreatePontoPayload): Promise<IpcResult<RegistroPonto>> =>
    ipcRenderer.invoke('ponto:create', payload),

  updatePonto: (payload: UpdatePontoPayload): Promise<IpcResult<RegistroPonto>> =>
    ipcRenderer.invoke('ponto:update', payload),

  deletePonto: (id: number): Promise<IpcResult<void>> =>
    ipcRenderer.invoke('ponto:delete', id),

  espelhoPonto: (empresaId: number, funcionarioId: number, mes: number, ano: number): Promise<IpcResult<EspelhoPonto>> =>
    ipcRenderer.invoke('ponto:espelho', empresaId, funcionarioId, mes, ano),

  // ── Folha ────────────────────────────────────────────────────
  listFolhas: (empresaId: number): Promise<FolhaCompetencia[]> =>
    ipcRenderer.invoke('folha:list', empresaId),

  getFolha: (id: number): Promise<(FolhaCompetencia & { holerites: FolhaHolerite[] }) | null> =>
    ipcRenderer.invoke('folha:get', id),

  createFolha: (payload: CreateFolhaPayload): Promise<IpcResult<FolhaCompetencia>> =>
    ipcRenderer.invoke('folha:create', payload),

  updateFolha: (payload: Partial<FolhaCompetencia> & { id: number }): Promise<IpcResult<FolhaCompetencia>> =>
    ipcRenderer.invoke('folha:update', payload),

  fecharFolha: (id: number): Promise<IpcResult<FolhaCompetencia>> =>
    ipcRenderer.invoke('folha:fechar', id),

  listLancamentos: (folhaId: number, funcionarioId?: number): Promise<FolhaLancamento[]> =>
    ipcRenderer.invoke('folha:lancamentos:list', folhaId, funcionarioId),

  addLancamento: (payload: CreateLancamentoPayload): Promise<IpcResult<FolhaLancamento>> =>
    ipcRenderer.invoke('folha:lancamentos:add', payload),

  deleteLancamento: (id: number): Promise<IpcResult<void>> =>
    ipcRenderer.invoke('folha:lancamentos:delete', id),

  calcularFolha: (folhaId: number): Promise<IpcResult<FolhaCompetencia>> =>
    ipcRenderer.invoke('folha:calcular', folhaId),

  listHolerites: (folhaId: number): Promise<FolhaHolerite[]> =>
    ipcRenderer.invoke('folha:holerites:list', folhaId),

  getHolerite: (folhaId: number, funcionarioId: number): Promise<(FolhaHolerite & { lancamentos: FolhaLancamento[] }) | null> =>
    ipcRenderer.invoke('folha:holerites:get', folhaId, funcionarioId),

  gerarHolerite: (payload: { folhaId: number; funcionarioId?: number }): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('folha:gerar-holerite', payload),

  // ── PDFs Documentos ───────────────────────────────────────────────
  gerarPdfRescisao: (id: number): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('rescisao:gerar-pdf', id),

  gerarPdfFerias: (id: number): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('ferias:gerar-pdf', id),

  gerarEspelhoPdf: (payload: { empresaId: number; funcionarioId: number; mes: number; ano: number }): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('ponto:gerar-espelho-pdf', payload),

  gerarFichaFuncionario: (id: number): Promise<IpcResult<{ filePath: string }>> =>
    ipcRenderer.invoke('funcionario:gerar-ficha-pdf', id),
})
