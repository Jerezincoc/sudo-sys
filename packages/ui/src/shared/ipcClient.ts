// packages/ui/src/shared/ipcClient.ts

/**
 * Define de forma segura como o Frontend (React) enxerga os métodos expostos pelo app-host no IPC.
 */
declare global {
  interface Window {
    sudoSysIpc: {
      invoke(channel: string, args?: any): Promise<any>;
    };
  }
}

export const ipcClient = {
  // Chamadas relacionadas a "banco" / healthcheck
  banco: {
    getInfo: () => window.sudoSysIpc.invoke("banco:info"),
  },
  
  // Chamadas relacionadas a Empresas (exemplo de implementação)
  empresas: {
    list: () => window.sudoSysIpc.invoke("empresas:list"),
    create: (dto: any) => window.sudoSysIpc.invoke("empresas:create", dto),
    update: (dto: any) => window.sudoSysIpc.invoke("empresas:update", dto),
    delete: (id: string) => window.sudoSysIpc.invoke("empresas:delete", id),
  },

  // Chamadas relacionadas a Funcionários
  funcionarios: {
    listByEmpresa: (empresaId: string) => window.sudoSysIpc.invoke("funcionarios:listByEmpresa", empresaId),
    create: (dto: any) => window.sudoSysIpc.invoke("funcionarios:create", dto),
    update: (dto: any) => window.sudoSysIpc.invoke("funcionarios:update", dto),
    delete: (id: string) => window.sudoSysIpc.invoke("funcionarios:delete", id),
  }
};
