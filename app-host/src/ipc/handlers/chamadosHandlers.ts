// app-host/src/ipc/handlers/chamadosHandlers.ts
import { ipcMain } from 'electron';
import type { AppServices } from '../../di/compositionRoot';
import type { IpcMainInvokeEvent } from "electron";

function toIpcError(err: unknown): any {
  if (err instanceof Error) {
    return { ok: false, error: { code: "INTERNAL_ERROR", message: err.message } };
  }
  return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Erro desconhecido" } };
}

export function registerChamadosHandlers(ctx: AppServices): void {
  ipcMain.handle("chamados:listByEmpresa", async (_e: IpcMainInvokeEvent, payload: { empresaId: string, filters?: any }) => {
    try {
      const data = await ctx.listChamados.execute(payload.empresaId, payload.filters);
      return { ok: true, data };
    } catch (e) { return toIpcError(e); }
  });

  ipcMain.handle("chamados:create", async (_e: IpcMainInvokeEvent, payload: any) => {
    try {
      const data = await ctx.createChamado.execute(payload);
      return { ok: true, data };
    } catch (e) { return toIpcError(e); }
  });
}
