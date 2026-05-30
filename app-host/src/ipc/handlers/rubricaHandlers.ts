import { ipcMain } from 'electron'
import { getDb } from '../../db/database'
import { SqliteRubricaRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteRubricaRepository'
import type { CreateRubricaPayload, UpdateRubricaPayload } from '@sudo-sys/shared'

function repo() {
  return new SqliteRubricaRepository(getDb())
}

const TIPOS_VALIDOS = ['provento', 'desconto', 'informativo'] as const

export function registerRubricaHandlers(): void {
  ipcMain.handle('rubrica:list', (_e, empresaId?: number) => {
    return repo().list(empresaId != null ? Number(empresaId) : undefined)
  })

  ipcMain.handle('rubrica:get', (_e, id: number) => {
    return repo().getById(id)
  })

  ipcMain.handle('rubrica:create', (_e, payload: CreateRubricaPayload) => {
    try {
      if (!payload.codigo?.trim())
        return { success: false, error: 'Código é obrigatório.' }
      if (!payload.nome || payload.nome.trim().length < 2)
        return { success: false, error: 'Nome deve ter pelo menos 2 caracteres.' }
      if (!TIPOS_VALIDOS.includes(payload.tipo as typeof TIPOS_VALIDOS[number]))
        return { success: false, error: 'Tipo inválido. Use: provento, desconto ou informativo.' }

      const r = repo().create(payload)
      return { success: true, data: r }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const dup = msg.includes('UNIQUE') && msg.includes('codigo')
      return { success: false, error: dup ? 'Código de rubrica já cadastrado.' : msg }
    }
  })

  ipcMain.handle('rubrica:update', (_e, payload: UpdateRubricaPayload) => {
    try {
      if (payload.nome !== undefined && payload.nome.trim().length < 2)
        return { success: false, error: 'Nome deve ter pelo menos 2 caracteres.' }
      if (payload.tipo !== undefined && !TIPOS_VALIDOS.includes(payload.tipo as typeof TIPOS_VALIDOS[number]))
        return { success: false, error: 'Tipo inválido.' }

      const r = repo().update(payload)
      return { success: true, data: r }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('rubrica:delete', (_e, id: number) => {
    try {
      const { action } = repo().deleteOrDeactivate(id)
      return { success: true, data: undefined, action }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
