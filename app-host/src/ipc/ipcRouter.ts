// app-host/src/ipc/ipcRouter.ts
import { ipcMain } from "electron";
import type { IpcMainInvokeEvent } from "electron";

import { IPC_CHANNELS } from "./channels";
import type { AppServices } from "../di/compositionRoot";

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
 * - Injeta ctx (services) já inicializado
 * - Normaliza resposta ok/fail
 */
function handler<TArgs, TResult>(
  ctx: AppServices,
  fn: (args: TArgs, ctx: AppServices) => TResult | Promise<TResult>
) {
  return async (_event: IpcMainInvokeEvent, args: TArgs): Promise<IpcResponse<TResult>> => {
    try {
      const data = await fn(args, ctx);
      return { ok: true, data };
    } catch (e) {
      return toIpcError(e);
    }
  };
}

/**
 * Registra todos os handlers IPC.
 * Registra somente após o bootstrap (BANCO/ + DB + migrations).
 */
export function registerIpcHandlers(ctx: AppServices): void {
  // BANCO INFO
  ipcMain.handle(
    "banco:info",
    handler(ctx, async (_args, services) => {
      return { 
        dbFile: services.banco.dbFile, 
        version: "v3" // Simplificado
      };
    })
  );

  // AUTH (stub)
  ipcMain.handle(
    IPC_CHANNELS.AUTH_ME,
    handler(ctx, async () => {
      return { user: null };
    })
  );

  // EMPRESAS (stub)
  ipcMain.handle(
    IPC_CHANNELS.EMPRESAS_LIST,
    handler(ctx, async (_args, services) => {
      // services.db já existe; listagem real virá com repositório/use case
      return { items: [], dbIsOpen: !!services.db };
    })
  );

  // RUBRICAS (stub)
  ipcMain.handle(
    IPC_CHANNELS.RUBRICAS_VARIABLES_DICTIONARY,
    handler(ctx, async () => {
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