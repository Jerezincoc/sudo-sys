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

async function invokeSafe<T = any>(channel: string, args?: any): Promise<T> {
  const result = await window.sudoSysIpc.invoke(channel, args);
  if (result && typeof result === 'object' && 'ok' in result) {
    if (!result.ok) throw new Error(result.error?.message || 'Erro IPC');
    return result.data;
  }
  return result;
}

export const ipcClient = {
  // Autenticação
  auth: {
    login: (email: string, passwordRaw: string) => invokeSafe("auth:login", { email, passwordRaw }),
  },
  
  // Gestão de Usuários
  users: {
    list: () => invokeSafe("users:list"),
    create: (dto: any) => invokeSafe("users:create", dto),
  },

  // Chamados / Demandas
  chamados: {
    listByEmpresa: (empresaId: string, filters?: any) => invokeSafe("chamados:listByEmpresa", { empresaId, filters }),
    create: (dto: any) => invokeSafe("chamados:create", dto),
  },

  // Chamadas relacionadas a "banco" / healthcheck
  banco: {
    getInfo: () => invokeSafe("banco:info"),
  },
  
  // Chamadas relacionadas a Empresas (exemplo de implementação)
  empresas: {
    list: () => invokeSafe("empresas:list"),
    create: (dto: any) => invokeSafe("empresas:create", dto),
    update: (dto: any) => invokeSafe("empresas:update", dto),
    delete: (id: string) => invokeSafe("empresas:delete", id),
  },

  // Chamadas relacionadas a Funcionários
  funcionarios: {
    listByEmpresa: (empresaId: string) => invokeSafe("funcionarios:listByEmpresa", empresaId),
    create: (dto: any) => invokeSafe("funcionarios:create", dto),
    update: (dto: any) => invokeSafe("funcionarios:update", dto),
    delete: (id: string) => invokeSafe("funcionarios:delete", id),
  }
};
