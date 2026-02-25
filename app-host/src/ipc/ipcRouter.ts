// app-host/src/ipc/ipcRouter.ts
import { ipcMain } from "electron";
import type { IpcMainInvokeEvent } from "electron";

import { IPC_CHANNELS } from "./channels";
import { getAppServices } from "../di/compositionRoot";

export type IpcOk<T> = { ok: true; data: T };
export type IpcFail = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type IpcResponse<T> = IpcOk<T> | IpcFail;

function toIpcError(err: unknown): IpcFail {
  if (err instanceof Error) {
    return {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: err.message,
      },
    };
  }

  return {
    ok: false,
    error: {
      code: "UNKNOWN_ERROR",
      message: "Erro desconhecido",
      details: err,
    },
  };
}

/**
 * Wrapper padrão para handlers IPC.
 */
function handler<TArgs, TResult>(
  fn: (args: TArgs, ctx: ReturnType<typeof getAppServices>) => TResult | Promise<TResult>
) {
  return async (_event: IpcMainInvokeEvent, args: TArgs): Promise<IpcResponse<TResult>> => {
    try {
      const ctx = getAppServices();
      const data = await fn(args, ctx);
      return { ok: true, data };
    } catch (e) {
      return toIpcError(e);
    }
  };
}

/**
 * Registra todos os handlers IPC.
 * Por enquanto deixamos “stubs” (retornos dummy) só para testar o pipeline IPC.
 * Depois vamos implementando módulo por módulo.
 */
export function registerIpcHandlers(): void {
  // AUTH (stub)
  ipcMain.handle(
    IPC_CHANNELS.AUTH_ME,
    handler(async () => {
      return { user: null };
    })
  );

  // EMPRESAS (stub)
  ipcMain.handle(
    IPC_CHANNELS.EMPRESAS_LIST,
    handler(async (_args, ctx) => {
      // ctx.db já existe; listagem real virá com repositório/use case
      return { items: [], dbIsOpen: !!ctx.db };
    })
  );

  // RUBRICAS (stub)
  ipcMain.handle(
    IPC_CHANNELS.RUBRICAS_VARIABLES_DICTIONARY,
    handler(async () => {
      // Depois vamos puxar do domain/formula/VariableDictionary
      return {
        variables: [
          { sigla: "SM", descricao: "Salário Mensal" },
          { sigla: "SPH", descricao: "Salário por Hora" },
        ],
      };
    })
  );

  // (Os demais handlers serão adicionados em arquivos separados por módulo,
  // e registrados aqui, pra não virar um monolito.)
}