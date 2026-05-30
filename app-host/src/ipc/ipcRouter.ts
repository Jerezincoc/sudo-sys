/**
 * ipcRouter.ts
 * Registra todos os handlers de IPC (exceto setup, que é registrado antes).
 */
import { ipcMain, shell } from 'electron'
import { registerEmpresaHandlers } from './handlers/empresaHandlers'
import { registerFuncionarioHandlers } from './handlers/funcionarioHandlers'
import { registerAuthHandlers } from './handlers/authHandlers'
import { registerRescisaoHandlers } from './handlers/rescisaoHandlers'
import { registerRubricaHandlers } from './handlers/rubricaHandlers'
import { registerFeriasHandlers } from './handlers/feriasHandlers'
import { registerPontoHandlers } from './handlers/pontoHandlers'

export async function registerAllHandlers(): Promise<void> {
  registerEmpresaHandlers()

  ipcMain.handle('shell:open-path', (_e, filePath: string) => {
    shell.showItemInFolder(filePath)
  })

  await registerAuthHandlers()

  registerFuncionarioHandlers()
  registerRubricaHandlers()
  registerFeriasHandlers()
  registerRescisaoHandlers()
  registerPontoHandlers()
}
