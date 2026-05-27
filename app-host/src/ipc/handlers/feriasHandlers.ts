/**
 * feriasHandlers.ts
 * IPC handlers para Férias (ferias:*).
 * Hard delete — cancelamento via update status='cancelada'.
 * Validações: funcionario_id e empresa_id obrigatórios, datas obrigatórias,
 *             dias_concedidos entre 5 e 30.
 */
import { ipcMain } from 'electron'
import { getDb } from '../../db/database'
import { SqliteFeriasRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteFeriasRepository'
import type { CreateFeriasPayload, UpdateFeriasPayload } from '@sudo-sys/shared'

function repo() {
  return new SqliteFeriasRepository(getDb())
}

export function registerFeriasHandlers(): void {
  // ── ferias:list ────────────────────────────────────────────────────
  ipcMain.handle('ferias:list', (_e, empresaId: number) => {
    return repo().listByEmpresa(empresaId)
  })

  // ── ferias:listByFuncionario ───────────────────────────────────────
  ipcMain.handle('ferias:listByFuncionario', (_e, funcionarioId: number) => {
    return repo().listByFuncionario(funcionarioId)
  })

  // ── ferias:get ─────────────────────────────────────────────────────
  ipcMain.handle('ferias:get', (_e, id: number) => {
    return repo().getById(id)
  })

  // ── ferias:create ──────────────────────────────────────────────────
  ipcMain.handle('ferias:create', (_e, payload: CreateFeriasPayload) => {
    try {
      if (!payload.funcionario_id)
        return { success: false, error: 'Funcionário é obrigatório.' }
      if (!payload.empresa_id)
        return { success: false, error: 'Empresa é obrigatória.' }
      if (!payload.periodo_aquisitivo_inicio)
        return { success: false, error: 'Período aquisitivo início é obrigatório.' }
      if (!payload.periodo_aquisitivo_fim)
        return { success: false, error: 'Período aquisitivo fim é obrigatório.' }
      if (!payload.data_inicio_gozo)
        return { success: false, error: 'Data de início do gozo é obrigatória.' }
      if (!payload.data_fim_gozo)
        return { success: false, error: 'Data de fim do gozo é obrigatória.' }
      const dias = payload.dias_concedidos ?? 30
      if (dias < 5 || dias > 30)
        return { success: false, error: 'Dias concedidos deve ser entre 5 e 30.' }

      const ferias = repo().create({ ...payload, dias_concedidos: dias })
      return { success: true, data: ferias }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── ferias:update ──────────────────────────────────────────────────
  ipcMain.handle('ferias:update', (_e, payload: UpdateFeriasPayload) => {
    try {
      if (payload.dias_concedidos !== undefined) {
        const dias = payload.dias_concedidos
        if (dias < 5 || dias > 30)
          return { success: false, error: 'Dias concedidos deve ser entre 5 e 30.' }
      }
      const ferias = repo().update(payload)
      return { success: true, data: ferias }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── ferias:delete (hard delete) ────────────────────────────────────
  ipcMain.handle('ferias:delete', (_e, id: number) => {
    try {
      const r = repo()
      const exists = r.getById(id)
      if (!exists) return { success: false, error: `Férias ${id} não encontrado.` }
      r.delete(id)
      return { success: true, data: undefined }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
