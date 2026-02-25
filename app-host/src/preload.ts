import { contextBridge, ipcRenderer } from "electron";

/**
 * Ponte segura entre Main e Renderer.
 * Não colocar regra de negócio aqui.
 */
contextBridge.exposeInMainWorld("sudoSysIpc", {
  invoke: (channel: string, args: unknown) => {
    return ipcRenderer.invoke(channel, args);
  },
});