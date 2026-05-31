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

  // ── Funcionários ───────────────────────────────────────────────
  async listFuncionarios(empresaId?: number): Promise<Funcionario[]> {
    if (hasElectron()) return window.electronAPI.listFuncionarios(empresaId)
    return []
  },

  async getFuncionario(id: number): Promise<Funcionario | null> {
    if (hasElectron()) return window.electronAPI.getFuncionario(id)
    return null
  },

  async createFuncionario(payload: CreateFuncionarioPayload): Promise<IpcResult<Funcionario>> {
    if (hasElectron()) return window.electronAPI.createFuncionario(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async updateFuncionario(payload: UpdateFuncionarioPayload): Promise<IpcResult<Funcionario>> {
    if (hasElectron()) return window.electronAPI.updateFuncionario(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async deleteFuncionario(id: number): Promise<IpcResult<void> & { action?: string }> {
    if (hasElectron()) return window.electronAPI.deleteFuncionario(id)
    return { success: true, data: undefined }
  },

  // ── Auth ───────────────────────────────────────────────────────
  async login(payload: LoginPayload): Promise<LoginResult> {
    if (hasElectron()) return window.electronAPI.login(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async logout(token: string): Promise<{ success: boolean }> {
    if (hasElectron()) return window.electronAPI.logout(token)
    return { success: true }
  },

  async register(payload: { nome: string; email: string; senha: string; papel: string; requestingToken: string }): Promise<LoginResult> {
    if (hasElectron()) return window.electronAPI.register(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async me(token: string): Promise<Usuario | null> {
    if (hasElectron()) return window.electronAPI.me(token)
    return null
  },

  async listUsuarios(): Promise<IpcResult<Usuario[]>> {
    if (hasElectron()) return window.electronAPI.listUsuarios()
    return { success: true, data: [] }
  },

  async createUsuario(payload: { nome: string; email: string; senha: string; papel: string }): Promise<IpcResult<Usuario>> {
    if (hasElectron()) return window.electronAPI.createUsuario(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async deleteUsuario(id: number): Promise<IpcResult<void>> {
    if (hasElectron()) return window.electronAPI.deleteUsuario(id)
    return { success: true, data: undefined }
  },

  // ── Admin ────────────────────────────────────────────────────────
  async backupDatabase(): Promise<IpcResult<{ filePath: string }>> {
    if (hasElectron()) return window.electronAPI.backupDatabase()
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  // ── Rescisão ───────────────────────────────────────────────────
  async listRescisoes(empresaId: number): Promise<Rescisao[]> {
    if (hasElectron()) return window.electronAPI.listRescisoes(empresaId)
    return []
  },

  async getRescisao(id: number): Promise<Rescisao | null> {
    if (hasElectron()) return window.electronAPI.getRescisao(id)
    return null
  },

  async createRescisao(payload: CreateRescisaoPayload): Promise<IpcResult<Rescisao>> {
    if (hasElectron()) return window.electronAPI.createRescisao(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async updateRescisao(payload: UpdateRescisaoPayload): Promise<IpcResult<Rescisao>> {
    if (hasElectron()) return window.electronAPI.updateRescisao(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async deleteRescisao(id: number): Promise<IpcResult<void>> {
    if (hasElectron()) return window.electronAPI.deleteRescisao(id)
    return { success: true, data: undefined }
  },

  async calcularRescisao(id: number): Promise<IpcResult<Rescisao>> {
    if (hasElectron()) return window.electronAPI.calcularRescisao(id)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  // ── Rubricas ───────────────────────────────────────────────────
  async listRubricas(empresaId?: number): Promise<Rubrica[]> {
    if (hasElectron()) return window.electronAPI.listRubricas(empresaId)
    return []
  },

  async getRubrica(id: number): Promise<Rubrica | null> {
    if (hasElectron()) return window.electronAPI.getRubrica(id)
    return null
  },

  async createRubrica(payload: CreateRubricaPayload): Promise<IpcResult<Rubrica>> {
    if (hasElectron()) return window.electronAPI.createRubrica(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async updateRubrica(payload: UpdateRubricaPayload): Promise<IpcResult<Rubrica>> {
    if (hasElectron()) return window.electronAPI.updateRubrica(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async deleteRubrica(id: number): Promise<IpcResult<void> & { action?: string }> {
    if (hasElectron()) return window.electronAPI.deleteRubrica(id)
    return { success: true, data: undefined }
  },

  // ── Férias ─────────────────────────────────────────────────────
  async listFerias(empresaId: number): Promise<Ferias[]> {
    if (hasElectron()) return window.electronAPI.listFerias(empresaId)
    return []
  },

  async getFerias(id: number): Promise<Ferias | null> {
    if (hasElectron()) return window.electronAPI.getFerias(id)
    return null
  },

  async createFerias(payload: CreateFeriasPayload): Promise<IpcResult<Ferias>> {
    if (hasElectron()) return window.electronAPI.createFerias(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async updateFerias(payload: UpdateFeriasPayload): Promise<IpcResult<Ferias>> {
    if (hasElectron()) return window.electronAPI.updateFerias(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async deleteFerias(id: number): Promise<IpcResult<void>> {
    if (hasElectron()) return window.electronAPI.deleteFerias(id)
    return { success: true, data: undefined }
  },

  // ── Ponto ──────────────────────────────────────────────────────────
  async listPonto(empresaId: number, mes?: number, ano?: number, funcionarioId?: number): Promise<RegistroPonto[]> {
    if (hasElectron()) return window.electronAPI.listPonto(empresaId, mes, ano, funcionarioId)
    return []
  },

  async getPonto(id: number): Promise<RegistroPonto | null> {
    if (hasElectron()) return window.electronAPI.getPonto(id)
    return null
  },

  async createPonto(payload: CreatePontoPayload): Promise<IpcResult<RegistroPonto>> {
    if (hasElectron()) return window.electronAPI.createPonto(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async updatePonto(payload: UpdatePontoPayload): Promise<IpcResult<RegistroPonto>> {
    if (hasElectron()) return window.electronAPI.updatePonto(payload)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },

  async deletePonto(id: number): Promise<IpcResult<void>> {
    if (hasElectron()) return window.electronAPI.deletePonto(id)
    return { success: true, data: undefined }
  },

  async espelhoPonto(empresaId: number, funcionarioId: number, mes: number, ano: number): Promise<IpcResult<EspelhoPonto>> {
    if (hasElectron()) return window.electronAPI.espelhoPonto(empresaId, funcionarioId, mes, ano)
    return { success: false, error: 'Sem Electron (modo dev browser).' }
  },
}
