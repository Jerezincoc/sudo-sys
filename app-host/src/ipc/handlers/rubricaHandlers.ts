/**
 * rubricaHandlers.ts
 * IPC handlers para o cadastro de rubricas (rubrica:*).
 */
import { ipcMain } from 'electron'
import { getDb } from '../../db/database'
import { SqliteRubricaRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteRubricaRepository'
import type { CreateRubricaPayload, UpdateRubricaPayload } from '@sudo-sys/shared'

const TIPOS_VALIDOS = ['provento', 'desconto', 'informativo'] as const

function repo() {
  return new SqliteRubricaRepository(getDb())
}

export function registerRubricaHandlers(): void {
  // ── rubrica:list ──────────────────────────────────────────────────
  ipcMain.handle('rubrica:list', (_e, empresaId?: number | null) => {
    return repo().list(empresaId)
  })

  // ── rubrica:get ───────────────────────────────────────────────────
  ipcMain.handle('rubrica:get', (_e, id: number) => {
    return repo().getById(id)
  })

  // ── rubrica:create ────────────────────────────────────────────────
  ipcMain.handle('rubrica:create', (_e, payload: CreateRubricaPayload) => {
    try {
      if (!payload.codigo || !payload.codigo.trim())
        return { success: false, error: 'Código é obrigatório.' }
      if (!payload.nome || payload.nome.trim().length < 2)
        return { success: false, error: 'Nome deve ter pelo menos 2 caracteres.' }
      if (!TIPOS_VALIDOS.includes(payload.tipo as typeof TIPOS_VALIDOS[number]))
        return { success: false, error: 'Tipo inválido. Use: provento, desconto ou informativo.' }

      const r = repo()
      const codigo = payload.codigo || r.nextCodigo(payload.empresa_id)
      const rubrica = r.create({ ...payload, codigo })
      return { success: true, data: rubrica }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const dupCodigo = msg.includes('UNIQUE')
      return {
        success: false,
        error: dupCodigo
          ? 'Já existe uma rubrica com este código para esta empresa.'
          : msg,
      }
    }
  })

  // ── rubrica:update ────────────────────────────────────────────────
  ipcMain.handle('rubrica:update', (_e, payload: UpdateRubricaPayload) => {
    try {
      if (payload.nome !== undefined && payload.nome.trim().length < 2)
        return { success: false, error: 'Nome deve ter pelo menos 2 caracteres.' }
      if (payload.tipo !== undefined && !TIPOS_VALIDOS.includes(payload.tipo as typeof TIPOS_VALIDOS[number]))
        return { success: false, error: 'Tipo inválido.' }

      // Bloquear edição de rubricas globais
      const existing = repo().getById(payload.id)
      if (!existing) return { success: false, error: 'Rubrica não encontrada.' }
      if (existing.empresa_id == null)
        return { success: false, error: 'Rubricas globais não podem ser editadas.' }

      const rubrica = repo().update(payload)
      return { success: true, data: rubrica }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── rubrica:delete (lógica dupla) ────────────────────────────────
  ipcMain.handle('rubrica:delete', (_e, id: number) => {
    try {
      const r = repo()
      const exists = r.getById(id)
      if (!exists) return { success: false, error: `Rubrica ${id} não encontrada.` }
      if (exists.empresa_id == null)
        return { success: false, error: 'Rubricas globais não podem ser excluídas.' }
      const { action } = r.deleteOrPermanent(id)
      return { success: true, data: undefined, action }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
