// packages/ui/src/api/ipcClient.ts
import type { IpcChannel } from "@shared/ipc/channels";

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

export class IpcError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

/**
 * Interface exposta pelo preload no window.
 * (Vamos implementar no próximo arquivo: app-host/src/preload.ts)
 */
declare global {
  interface Window {
    sudoSysIpc?: {
      invoke<TArgs, TResult>(channel: IpcChannel, args: TArgs): Promise<IpcResponse<TResult>>;
    };
  }
}

function getBridge() {
  if (!window.sudoSysIpc) {
    throw new IpcError(
      "IPC_BRIDGE_MISSING",
      "IPC bridge não está disponível. Verifique o preload/contextIsolation."
    );
  }
  return window.sudoSysIpc;
}

/**
 * Invoke tipado + padrão de erro.
 */
export async function ipcInvoke<TArgs, TResult>(
  channel: IpcChannel,
  args: TArgs
): Promise<TResult> {
  const bridge = getBridge();
  const res = await bridge.invoke<TArgs, TResult>(channel, args);

  if (res.ok) return res.data;

  throw new IpcError(res.error.code, res.error.message, res.error.details);
}