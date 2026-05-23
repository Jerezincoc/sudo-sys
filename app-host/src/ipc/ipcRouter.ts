/**
 * ipcRouter.ts
 * Registra todos os handlers de IPC (exceto setup, que e registrado antes).
 */
import { ipcMain } from 'electron'

// Handlers de negocio (a implementar nas proximas fases)
function noop(channel: string) {
  ipcMain.handle(channel, () => {
    throw new Error(`Handler nao implementado: ${channel}`)
  })
}

export function registerAllHandlers(): void {
  // Auth
  noop('auth:login')
  noop('auth:logout')
  noop('auth:register')

  // Empresas
  noop('empresa:list')
  noop('empresa:create')
  noop('empresa:update')
  noop('empresa:delete')

  // Funcionarios
  noop('funcionario:list')
  noop('funcionario:create')
  noop('funcionario:update')
  noop('funcionario:delete')

  // Folha
  noop('folha:list')
  noop('folha:create')
  noop('folha:generate-pdf')

  // Rubricas
  noop('rubrica:list')
  noop('rubrica:create')
  noop('rubrica:delete')
}
