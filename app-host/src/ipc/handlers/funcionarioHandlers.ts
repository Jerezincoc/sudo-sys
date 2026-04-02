// app-host/src/ipc/handlers/funcionarioHandlers.ts
//
// Registra todos os canais IPC relacionados a funcionários.
// O container injeta os use-cases via DI (compositionRoot).

import { ipcMain } from 'electron';
import type { CreateFuncionario }  from '@sudo-sys/application';
import type { UpdateFuncionario }  from '@sudo-sys/application';
import type { DeleteFuncionario }  from '@sudo-sys/application';
import type { ListFuncionariosByEmpresa } from '@sudo-sys/application';
import type {
  CreateFuncionarioDTO,
  UpdateFuncionarioDTO,
} from '@sudo-sys/application';

interface Deps {
  createFuncionario:        CreateFuncionario;
  updateFuncionario:        UpdateFuncionario;
  deleteFuncionario:        DeleteFuncionario;
  listFuncionariosByEmpresa: ListFuncionariosByEmpresa;
}

export function registerFuncionarioHandlers(deps: Deps): void {
  // ── Listar por empresa (com filtro de regime opcional) ────────────────────
  ipcMain.handle('funcionario:list', async (_e, payload: {
    empresaId: string;
    regime?:   'A' | 'B';
    ativo?:    boolean;
    search?:   string;
  }) => {
    return deps.listFuncionariosByEmpresa.execute(payload);
  });

  // ── Criar ─────────────────────────────────────────────────────────────────
  ipcMain.handle('funcionario:create', async (_e, dto: CreateFuncionarioDTO) => {
    return deps.createFuncionario.execute(dto);
  });

  // ── Atualizar ─────────────────────────────────────────────────────────────
  ipcMain.handle('funcionario:update', async (_e, dto: UpdateFuncionarioDTO) => {
    return deps.updateFuncionario.execute(dto);
  });

  // ── Desativar (soft-delete) ───────────────────────────────────────────────
  ipcMain.handle('funcionario:delete', async (_e, id: string) => {
    return deps.deleteFuncionario.execute(id);
  });
}
