/**
 * funcionarioHandlers.ts
 * IPC handlers para o cadastro de funcionários (funcionario:*).
 * Usa SqliteFuncionarioRepository + validações inline nesta camada de IPC.
 */
import { ipcMain } from 'electron'
import { getDb } from '../../db/database'
import { SqliteFuncionarioRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteFuncionarioRepository'
import type { CreateFuncionarioPayload, UpdateFuncionarioPayload } from '@sudo-sys/shared'

function repo() {
  return new SqliteFuncionarioRepository(getDb())
}

export function registerFuncionarioHandlers(): void {
  // ── funcionario:list ────────────────────────────────────────────
  ipcMain.handle('funcionario:list', (_e, empresaId?: number) => {
    const r = repo()
    return empresaId != null ? r.listByEmpresa(empresaId) : r.listAll()
  })

  // ── funcionario:get ─────────────────────────────────────────────
  ipcMain.handle('funcionario:get', (_e, id: number) => {
    return repo().getById(id)
  })

  // ── funcionario:create ──────────────────────────────────────────
  ipcMain.handle('funcionario:create', (_e, payload: CreateFuncionarioPayload) => {
    try {
      if (!payload.nome || payload.nome.trim().length < 2)
        return { success: false, error: 'Nome deve ter pelo menos 2 caracteres.' }
      if (!payload.cpf)
        return { success: false, error: 'CPF é obrigatório.' }
      if (!payload.data_admissao)
        return { success: false, error: 'Data de admissão é obrigatória.' }
      if (!payload.empresa_id)
        return { success: false, error: 'Empresa é obrigatória.' }

      const r = repo()
      const codigo = payload.codigo || r.nextCodigo(payload.empresa_id)
      const func = r.create({ ...payload, codigo })
      return { success: true, data: func }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const dupCpf = msg.includes('UNIQUE') && msg.includes('cpf')
      return {
        success: false,
        error: dupCpf
          ? 'Já existe um funcionário com este CPF nesta empresa.'
          : msg,
      }
    }
  })

  // ── funcionario:update ──────────────────────────────────────────
  ipcMain.handle('funcionario:update', (_e, payload: UpdateFuncionarioPayload) => {
    try {
      if (payload.nome !== undefined && payload.nome.trim().length < 2)
        return { success: false, error: 'Nome deve ter pelo menos 2 caracteres.' }

      const func = repo().update(payload)
      return { success: true, data: func }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── funcionario:delete (lógica dupla) ───────────────────────────
  //   Funcionário ATIVO   → soft-delete (status = 'inativo') → action: 'inativado'
  //   Funcionário INATIVO → hard-delete (DELETE)             → action: 'excluido'
  ipcMain.handle('funcionario:delete', (_e, id: number) => {
    try {
      const r = repo()
      const exists = r.getById(id)
      if (!exists) return { success: false, error: `Funcionário ${id} não encontrado.` }
      const { action } = r.deleteOrPermanent(id)
      return { success: true, data: undefined, action }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
