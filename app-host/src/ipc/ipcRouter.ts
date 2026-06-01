/**
 * ipcRouter.ts
 * Registra todos os handlers de IPC (exceto setup, que é registrado antes).
 */
import { ipcMain, shell } from 'electron'
import { registerEmpresaHandlers } from './handlers/empresaHandlers'
import { registerFuncionarioHandlers } from './handlers/funcionarioHandlers'
import { registerFeriasHandlers } from './handlers/feriasHandlers'
import { registerRubricaHandlers } from './handlers/rubricaHandlers'
import { registerCboHandlers } from './handlers/cboHandlers'
import { registerDocumentosHandlers } from './handlers/documentosHandlers'
import { registerFolhaHandlers } from './handlers/folhaHandlers'

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
  registerFolhaHandlers()

  // ── Rubricas (implementado) ───────────────────────────────────────
  registerRubricaHandlers()

  // ── Férias (implementado) ─────────────────────────────────────────
  registerFeriasHandlers()

  // ── CBO (implementado) ────────────────────────────────────────────
  registerCboHandlers()

  // ── Documentos PDF (implementado) ─────────────────────────────────
  registerDocumentosHandlers()
}
