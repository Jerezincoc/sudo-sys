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
  RelatorioPersonalizado,
  CreateRelatorioPayload,
  UpdateRelatorioPayload,
  RelatorioLinhaFuncionario,
  ExecutarRelatorioPayload,
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

  // Shell / Sistema
  /** Revela o arquivo no explorador do sistema operacional. */
  openPath: (filePath: string) => Promise<void>

  // Auth
  login: (payload: LoginPayload) => Promise<LoginResult>
  logout: (token: string) => Promise<{ success: boolean }>
  register: (payload: { nome: string; email: string; senha: string; papel: string; requestingToken: string }) => Promise<LoginResult>
  me: (token: string) => Promise<Usuario | null>
  listUsuarios: () => Promise<IpcResult<Usuario[]>>
  createUsuario: (payload: { nome: string; email: string; senha: string; papel: string }) => Promise<IpcResult<Usuario>>
  deleteUsuario: (id: number) => Promise<IpcResult<void>>

  // Admin
  backupDatabase: () => Promise<IpcResult<{ filePath: string }>>

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

  // Rescisão
  listRescisoes: (empresaId: number) => Promise<Rescisao[]>
  getRescisao: (id: number) => Promise<Rescisao | null>
  createRescisao: (payload: CreateRescisaoPayload) => Promise<IpcResult<Rescisao>>
  updateRescisao: (payload: UpdateRescisaoPayload) => Promise<IpcResult<Rescisao>>
  deleteRescisao: (id: number) => Promise<IpcResult<void>>
  calcularRescisao: (id: number) => Promise<IpcResult<Rescisao>>

  // Rubricas
  listRubricas: (empresaId?: number) => Promise<Rubrica[]>
  getRubrica: (id: number) => Promise<Rubrica | null>
  createRubrica: (payload: CreateRubricaPayload) => Promise<IpcResult<Rubrica>>
  updateRubrica: (payload: UpdateRubricaPayload) => Promise<IpcResult<Rubrica>>
  deleteRubrica: (id: number) => Promise<IpcResult<void> & { action?: string }>

  // Férias
  listFerias: (empresaId: number) => Promise<Ferias[]>
  getFerias: (id: number) => Promise<Ferias | null>
  createFerias: (payload: CreateFeriasPayload) => Promise<IpcResult<Ferias>>
  updateFerias: (payload: UpdateFeriasPayload) => Promise<IpcResult<Ferias>>
  deleteFerias: (id: number) => Promise<IpcResult<void>>

  // Ponto
  listPonto: (empresaId: number, mes?: number, ano?: number, funcionarioId?: number) => Promise<RegistroPonto[]>
  getPonto: (id: number) => Promise<RegistroPonto | null>
  createPonto: (payload: CreatePontoPayload) => Promise<IpcResult<RegistroPonto>>
  updatePonto: (payload: UpdatePontoPayload) => Promise<IpcResult<RegistroPonto>>
  deletePonto: (id: number) => Promise<IpcResult<void>>
  espelhoPonto: (empresaId: number, funcionarioId: number, mes: number, ano: number) => Promise<IpcResult<EspelhoPonto>>

  // Folha
  listFolhas: (empresaId: number) => Promise<FolhaCompetencia[]>
  getFolha: (id: number) => Promise<(FolhaCompetencia & { holerites: FolhaHolerite[] }) | null>
  createFolha: (payload: CreateFolhaPayload) => Promise<IpcResult<FolhaCompetencia>>
  updateFolha: (payload: Partial<FolhaCompetencia> & { id: number }) => Promise<IpcResult<FolhaCompetencia>>
  fecharFolha: (id: number) => Promise<IpcResult<FolhaCompetencia>>
  listLancamentos: (folhaId: number, funcionarioId?: number) => Promise<FolhaLancamento[]>
  addLancamento: (payload: CreateLancamentoPayload) => Promise<IpcResult<FolhaLancamento>>
  deleteLancamento: (id: number) => Promise<IpcResult<void>>
  calcularFolha: (folhaId: number) => Promise<IpcResult<FolhaCompetencia>>
  listHolerites: (folhaId: number) => Promise<FolhaHolerite[]>
  getHolerite: (folhaId: number, funcionarioId: number) => Promise<(FolhaHolerite & { lancamentos: FolhaLancamento[] }) | null>
  gerarHolerite: (payload: { folhaId: number; funcionarioId?: number }) => Promise<IpcResult<{ filePath: string }>>

  // Relatórios Personalizados
  listRelatorios: (empresaId?: number) => Promise<IpcResult<RelatorioPersonalizado[]>>
  getRelatorio: (id: number) => Promise<IpcResult<RelatorioPersonalizado | null>>
  createRelatorio: (payload: CreateRelatorioPayload) => Promise<IpcResult<RelatorioPersonalizado>>
  updateRelatorio: (payload: UpdateRelatorioPayload) => Promise<IpcResult<RelatorioPersonalizado>>
  deleteRelatorio: (id: number) => Promise<IpcResult<void>>
  executarRelatorio: (payload: ExecutarRelatorioPayload) => Promise<IpcResult<RelatorioLinhaFuncionario[]>>
  gerarPdfRelatorio: (payload: ExecutarRelatorioPayload) => Promise<IpcResult<{ filePath: string }>>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
