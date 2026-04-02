// packages/ui/src/pages/empresas/hooks/useFuncionarios.ts
//
// Hook que encapsula toda a lógica de estado de funcionários.
// As páginas só consomem este hook, nunca chamam ipcClient diretamente.

import { useState, useEffect, useCallback } from 'react';
import { funcionarioClient } from '../../../api/ipcClient';
import type { FuncionarioDTO, CreateFuncionarioDTO, UpdateFuncionarioDTO } from '@sudo-sys/application';

interface State {
  funcionarios: FuncionarioDTO[];
  loading:      boolean;
  error:        string | null;
}

interface Filters {
  regime?: 'A' | 'B';
  ativo?:  boolean;
  search?: string;
}

export function useFuncionarios(empresaId: string, filters: Filters = {}) {
  const [state, setState] = useState<State>({ funcionarios: [], loading: true, error: null });

  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await funcionarioClient.list({ empresaId, ...filters });
      setState({ funcionarios: data, loading: false, error: null });
    } catch (e: unknown) {
      setState(s => ({ ...s, loading: false, error: String(e) }));
    }
  }, [empresaId, filters.regime, filters.ativo, filters.search]);

  useEffect(() => { load(); }, [load]);

  async function create(dto: Omit<CreateFuncionarioDTO, 'empresaId'>) {
    const novo = await funcionarioClient.create({ ...dto, empresaId });
    setState(s => ({ ...s, funcionarios: [...s.funcionarios, novo] }));
    return novo;
  }

  async function update(dto: UpdateFuncionarioDTO) {
    const updated = await funcionarioClient.update(dto);
    setState(s => ({
      ...s,
      funcionarios: s.funcionarios.map(f => f.id === updated.id ? updated : f),
    }));
    return updated;
  }

  async function remove(id: string) {
    await funcionarioClient.delete(id);
    setState(s => ({
      ...s,
      funcionarios: s.funcionarios.filter(f => f.id !== id),
    }));
  }

  return {
    ...state,
    create,
    update,
    remove,
    reload: load,
  };
}
