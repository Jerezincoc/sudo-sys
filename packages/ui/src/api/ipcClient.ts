// packages/ui/src/api/ipcClient.ts
//
// Wrapper tipado em volta de window.electron.ipcRenderer.invoke
// Nunca chame ipcRenderer diretamente nas páginas — use este client.

import { Channels } from '@sudo-sys/shared';
import type {
  EmpresaDTO, CreateEmpresaDTO, UpdateEmpresaDTO,
  FuncionarioDTO, CreateFuncionarioDTO, UpdateFuncionarioDTO,
} from '@sudo-sys/application';

// O preload expõe window.electron com invoke tipado
declare global {
  interface Window {
    electron: {
      invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T>;
    };
  }
}

const invoke = <T>(channel: string, ...args: unknown[]): Promise<T> =>
  window.electron.invoke<T>(channel, ...args);

// ─── Empresas ─────────────────────────────────────────────────────────────────
export const empresaClient = {
  list:   ()                      => invoke<EmpresaDTO[]>(Channels.EMPRESA_LIST),
  create: (dto: CreateEmpresaDTO) => invoke<EmpresaDTO>(Channels.EMPRESA_CREATE, dto),
  update: (dto: UpdateEmpresaDTO) => invoke<EmpresaDTO>(Channels.EMPRESA_UPDATE, dto),
  delete: (id: string)            => invoke<void>(Channels.EMPRESA_DELETE, id),
};

// ─── Funcionários ─────────────────────────────────────────────────────────────
export const funcionarioClient = {
  list: (params: {
    empresaId: string;
    regime?:   'A' | 'B';
    ativo?:    boolean;
    search?:   string;
  }) => invoke<FuncionarioDTO[]>(Channels.FUNC_LIST, params),

  create: (dto: CreateFuncionarioDTO) =>
    invoke<FuncionarioDTO>(Channels.FUNC_CREATE, dto),

  update: (dto: UpdateFuncionarioDTO) =>
    invoke<FuncionarioDTO>(Channels.FUNC_UPDATE, dto),

  delete: (id: string) =>
    invoke<void>(Channels.FUNC_DELETE, id),
};

// ─── Folha ────────────────────────────────────────────────────────────────────
export const folhaClient = {
  list:              (empresaId: string) =>
    invoke(Channels.FOLHA_LIST, empresaId),
  createCompetencia: (dto: unknown) =>
    invoke(Channels.FOLHA_CREATE_COMPETENCIA, dto),
  addLancamento:     (dto: unknown) =>
    invoke(Channels.FOLHA_ADD_LANCAMENTO, dto),
  removeLancamento:  (id: string) =>
    invoke(Channels.FOLHA_REMOVE_LANCAMENTO, id),
  generatePdf:       (folhaId: string) =>
    invoke(Channels.FOLHA_GENERATE_PDF, folhaId),
};
