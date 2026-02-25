// packages/ui/src/api/useCasesClient.ts
import { ipcInvoke } from "./ipcClient";
import { IPC_CHANNELS } from "../../../app-host/src/ipc/channels";

/**
 * Tipos de retorno mínimos pra UI (por enquanto).
 * Depois podemos trocar pra DTOs do packages/application/src/dto
 * e expor isso via packages/ui/src/api/contracts.ts.
 */

export type EmpresaListItem = {
  id: string;
  nome: string;
  cnpj?: string | null;
  fantasia?: string | null;
};

export type VariablesDictionaryItem = {
  sigla: string;
  descricao: string;
};

export async function getVariablesDictionary(): Promise<{
  variables: VariablesDictionaryItem[];
}> {
  return ipcInvoke(IPC_CHANNELS.RUBRICAS_VARIABLES_DICTIONARY, {});
}

/**
 * Stub inicial (vai retornar vazio até implementarmos o handler real no app-host).
 */
export async function listEmpresas(): Promise<{
  items: EmpresaListItem[];
}> {
  return ipcInvoke(IPC_CHANNELS.EMPRESAS_LIST, {});
}

/**
 * Exemplo de criação (vai falhar/retornar stub até existir handler real).
 * Mantém padrão de contrato desde já.
 */
export async function createEmpresa(input: {
  nome: string;
  cnpj?: string;
  fantasia?: string;
  endereco?: string;
}): Promise<{ id: string }> {
  return ipcInvoke(IPC_CHANNELS.EMPRESAS_CREATE, input);
}