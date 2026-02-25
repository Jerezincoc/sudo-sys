// app-host/src/ipc/handlers/empresaHandlers.ts
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../channels";
import { getAppServices } from "../../di/compositionRoot";
import { SqliteEmpresaRepository } from "../../../../packages/infrastructure/src/repositories/SqliteEmpresaRepository";

/**
 * Padroniza resposta IPC
 */
type IpcOk<T> = { ok: true; data: T };
type IpcFail = { ok: false; error: { code: string; message: string; details?: unknown } };
type IpcResponse<T> = IpcOk<T> | IpcFail;

function ok<T>(data: T): IpcOk<T> {
  return { ok: true, data };
}

function fail(code: string, message: string, details?: unknown): IpcFail {
  return { ok: false, error: { code, message, details } };
}

export function registerEmpresaHandlers(): void {
  // LISTAR
  ipcMain.handle(IPC_CHANNELS.EMPRESAS_LIST, async (): Promise<IpcResponse<{ items: any[] }>> => {
    try {
      const { db } = getAppServices();
      const repo = new SqliteEmpresaRepository(db);

      const items = repo.list();
      return ok({ items });
    } catch (e) {
      return fail("EMPRESAS_LIST_FAILED", "Falha ao listar empresas.", e);
    }
  });

  // CRIAR
  ipcMain.handle(
    IPC_CHANNELS.EMPRESAS_CREATE,
    async (
      _event,
      args: { nome: string; cnpj?: string; fantasia?: string; endereco?: string }
    ): Promise<IpcResponse<{ id: string }>> => {
      try {
        if (!args?.nome || args.nome.trim().length < 2) {
          return fail("VALIDATION_ERROR", "Nome da empresa é obrigatório (mín. 2 caracteres).");
        }

        const { db } = getAppServices();
        const repo = new SqliteEmpresaRepository(db);

        const created = repo.create({
          nome: args.nome,
          cnpj: args.cnpj ?? null,
          fantasia: args.fantasia ?? null,
          endereco: args.endereco ?? null,
        });

        return ok(created);
      } catch (e) {
        return fail("EMPRESAS_CREATE_FAILED", "Falha ao criar empresa.", e);
      }
    }
  );

  // ATUALIZAR
  ipcMain.handle(
    IPC_CHANNELS.EMPRESAS_UPDATE,
    async (
      _event,
      args: { id: string; nome?: string; cnpj?: string | null; fantasia?: string | null; endereco?: string | null }
    ): Promise<IpcResponse<{ ok: true }>> => {
      try {
        if (!args?.id) {
          return fail("VALIDATION_ERROR", "ID da empresa é obrigatório.");
        }

        const { db } = getAppServices();
        const repo = new SqliteEmpresaRepository(db);

        repo.update({
          id: args.id,
          nome: args.nome,
          cnpj: args.cnpj,
          fantasia: args.fantasia,
          endereco: args.endereco,
        });

        return ok({ ok: true });
      } catch (e) {
        return fail("EMPRESAS_UPDATE_FAILED", "Falha ao atualizar empresa.", e);
      }
    }
  );

  // DELETAR
  ipcMain.handle(
    IPC_CHANNELS.EMPRESAS_DELETE,
    async (_event, args: { id: string }): Promise<IpcResponse<{ ok: true }>> => {
      try {
        if (!args?.id) {
          return fail("VALIDATION_ERROR", "ID da empresa é obrigatório.");
        }

        const { db } = getAppServices();
        const repo = new SqliteEmpresaRepository(db);

        repo.delete(args.id);
        return ok({ ok: true });
      } catch (e) {
        return fail("EMPRESAS_DELETE_FAILED", "Falha ao excluir empresa.", e);
      }
    }
  );
}