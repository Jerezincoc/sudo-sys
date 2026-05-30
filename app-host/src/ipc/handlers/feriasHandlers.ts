import { ipcMain } from 'electron'
import { getDb } from '../../db/database'
import { SqliteFeriasRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteFeriasRepository'
import type { CreateFeriasPayload, UpdateFeriasPayload } from '@sudo-sys/shared'

function repo() {
  return new SqliteFeriasRepository(getDb())
}

export function registerFeriasHandlers(): void {
  ipcMain.handle('ferias:list', (_e, empresaId: number) => {
    return repo().list(Number(empresaId))
  })

  ipcMain.handle('ferias:get', (_e, id: number) => {
    return repo().getById(id)
  })

  ipcMain.handle('ferias:create', (_e, payload: CreateFeriasPayload) => {
    try {
      if (!payload.funcionario_id) return { success: false, error: 'Funcionário é obrigatório.' }
      if (!payload.empresa_id)     return { success: false, error: 'Empresa é obrigatória.' }
      if (!payload.periodo_inicio) return { success: false, error: 'Período aquisitivo início é obrigatório.' }
      if (!payload.periodo_fim)    return { success: false, error: 'Período aquisitivo fim é obrigatório.' }
      if (!payload.inicio_gozo)    return { success: false, error: 'Início do gozo é obrigatório.' }
      if (!payload.fim_gozo)       return { success: false, error: 'Fim do gozo é obrigatório.' }

      const dias = payload.dias_concedidos ?? 30
      if (dias < 5 || dias > 30)
        return { success: false, error: 'Dias concedidos deve ser entre 5 e 30.' }

      const f = repo().create({ ...payload, dias_concedidos: dias })
      return { success: true, data: f }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('ferias:update', (_e, payload: UpdateFeriasPayload) => {
    try {
      if (payload.dias_concedidos !== undefined && (payload.dias_concedidos < 5 || payload.dias_concedidos > 30))
        return { success: false, error: 'Dias concedidos deve ser entre 5 e 30.' }

      const f = repo().update(payload)
      return { success: true, data: f }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('ferias:delete', (_e, id: number) => {
    try {
      repo().delete(id)
      return { success: true, data: undefined }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
