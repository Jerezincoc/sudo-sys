/**
 * ipcRouter.ts
 * Registra todos os handlers de IPC (exceto setup, que é registrado antes).
 */
import { ipcMain, shell } from 'electron'
import { registerEmpresaHandlers } from './handlers/empresaHandlers'
import { registerFuncionarioHandlers } from './handlers/funcionarioHandlers'

function noop(channel: string) {
  ipcMain.handle(channel, () => {
    throw new Error(`Handler não implementado: ${channel}`)
  })
}

export function registerAllHandlers(): void {
  // ── Empresas (implementado) ──────────────────────────────────────
  registerEmpresaHandlers()

  // ── Shell utilitários ────────────────────────────────────────────
  // Revela o arquivo no gerenciador de arquivos do SO (Explorer, Finder, etc.)
  ipcMain.handle('shell:open-path', (_e, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  // ── Auth ─────────────────────────────────────────────────────────
  noop('auth:login')
  noop('auth:logout')
  noop('auth:register')

  // ── Funcionários (implementado) ───────────────────────────────────
  registerFuncionarioHandlers()

  // ── Folha ─────────────────────────────────────────────────────────
  noop('folha:list')
  noop('folha:create')
  noop('folha:generate-pdf')

  // ── Rubricas ──────────────────────────────────────────────────────
  noop('rubrica:list')
  noop('rubrica:create')
  noop('rubrica:delete')
}
