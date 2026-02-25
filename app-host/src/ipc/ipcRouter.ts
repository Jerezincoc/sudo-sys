// app-host/src/ipc/ipcRouter.ts
import { IPC_CHANNELS } from "./channels";
import { registerEmpresaHandlers } from "./handlers/empresaHandlers";

/**
 * Registra todos os handlers IPC.
 * Cada módulo registra seus próprios canais.
 */
export function registerIpcHandlers(): void {
  // Empresas (real)
  registerEmpresaHandlers();

  // ⚠️ Aqui depois vamos registrar:
  // registerAuthHandlers();
  // registerRubricaHandlers();
  // registerFolhaHandlers();
  // etc...
}