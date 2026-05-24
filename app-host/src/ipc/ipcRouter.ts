/**
 * ipcRouter.ts
 * Registra todos os handlers de IPC (exceto setup, que é registrado antes).
 */
import { ipcMain } from 'electron'
import { registerEmpresaHandlers } from './handlers/empresaHandlers'

function noop(channel: string) {
  ipcMain.handle(channel, () => {
    throw new Error(`Handler não implementado: ${channel}`)
  })
}

export function registerAllHandlers(): void {
  // ── Empresas (implementado) ──────────────────────────────────────
  registerEmpresaHandlers()

  // ── Auth ─────────────────────────────────────────────────────────
  noop('auth:login')
  noop('auth:logout')
  noop('auth:register')

  // ── Funcionários ──────────────────────────────────────────────────
  noop('funcionario:list')
  noop('funcionario:create')
  noop('funcionario:update')
  noop('funcionario:delete')

  // ── Folha ─────────────────────────────────────────────────────────
  noop('folha:list')
  noop('folha:create')
  noop('folha:generate-pdf')

  // ── Rubricas ──────────────────────────────────────────────────────
  noop('rubrica:list')
  noop('rubrica:create')
  noop('rubrica:delete')
}
