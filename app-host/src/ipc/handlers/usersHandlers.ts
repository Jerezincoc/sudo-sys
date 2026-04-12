// app-host/src/ipc/handlers/usersHandlers.ts
import { ipcMain } from 'electron';
import type { AppServices } from '../../di/compositionRoot';
import type { IpcMainInvokeEvent } from "electron";
import { IpcResponse } from '../ipcRouter';

function toIpcError(err: unknown): any {
  if (err instanceof Error) {
    return { ok: false, error: { code: "INTERNAL_ERROR", message: err.message } };
  }
  return { ok: false, error: { code: "UNKNOWN_ERROR", message: "Erro desconhecido" } };
}

export function registerUsersHandlers(ctx: AppServices): void {
  ipcMain.handle("auth:login", async (_e: IpcMainInvokeEvent, payload: any) => {
    try {
      const data = await ctx.loginUser.execute(payload);
      return { ok: true, data };
    } catch (e) { return toIpcError(e); }
  });

  ipcMain.handle("users:create", async (_e: IpcMainInvokeEvent, payload: any) => {
    try {
      const data = await ctx.createUser.execute(payload);
      return { ok: true, data };
    } catch (e) { return toIpcError(e); }
  });

  ipcMain.handle("users:list", async (_e: IpcMainInvokeEvent) => {
    try {
      const data = await ctx.listUsers.execute();
      return { ok: true, data };
    } catch (e) { return toIpcError(e); }
  });
}
