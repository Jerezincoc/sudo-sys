/**
 * empresaHandlers.ts
 * IPC handlers para o cadastro de empresas (empresa:*).
 * Usa SqliteEmpresaRepository + validações inline neste camada de IPC.
 */
import { ipcMain } from 'electron'
import { getDb } from '../../db/database'
import { SqliteEmpresaRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteEmpresaRepository'
import type { CreateEmpresaPayload, UpdateEmpresaPayload } from '@sudo-sys/shared'

function repo() {
  return new SqliteEmpresaRepository(getDb())
}

function validateCreate(payload: CreateEmpresaPayload): string | null {
  if (!payload.razao_social || payload.razao_social.trim().length < 3)
    return 'Razão Social deve ter pelo menos 3 caracteres.'
  if (!payload.cnpj)
    return 'CNPJ é obrigatório.'
  if (payload.aliquota_rat != null && (payload.aliquota_rat < 0.1 || payload.aliquota_rat > 3.0))
    return 'Alíquota RAT deve estar entre 0.1 e 3.0.'
  if (payload.fap != null && (payload.fap < 0.5 || payload.fap > 2.0))
    return 'FAP deve estar entre 0.5 e 2.0.'
  return null
}

export function registerEmpresaHandlers(): void {
  // ── empresa:list ────────────────────────────────────────────────
  ipcMain.handle('empresa:list', () => {
    return repo().list()
  })

  // ── empresa:get ─────────────────────────────────────────────────
  ipcMain.handle('empresa:get', (_e, id: number) => {
    return repo().getById(id)
  })

  // ── empresa:create ──────────────────────────────────────────────
  ipcMain.handle('empresa:create', (_e, payload: CreateEmpresaPayload) => {
    try {
      const err = validateCreate(payload)
      if (err) return { success: false, error: err }

      const r = repo()
      const codigo = payload.codigo || r.nextCodigo()
      const empresa = r.create({ ...payload, codigo, status: payload.status ?? 'ativa' })
      return { success: true, data: empresa }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      // UNIQUE constraint falhou → CNPJ duplicado
      const dupCNPJ = msg.includes('UNIQUE') && msg.includes('cnpj')
      const dupCod  = msg.includes('UNIQUE') && msg.includes('codigo')
      return {
        success: false,
        error: dupCNPJ
          ? 'Já existe uma empresa com este CNPJ.'
          : dupCod
            ? 'Código de empresa já em uso.'
            : msg,
      }
    }
  })

  // ── empresa:update ──────────────────────────────────────────────
  ipcMain.handle('empresa:update', (_e, payload: UpdateEmpresaPayload) => {
    try {
      if (payload.razao_social !== undefined && payload.razao_social.trim().length < 3)
        return { success: false, error: 'Razão Social deve ter pelo menos 3 caracteres.' }
      if (payload.aliquota_rat != null && (payload.aliquota_rat < 0.1 || payload.aliquota_rat > 3.0))
        return { success: false, error: 'Alíquota RAT deve estar entre 0.1 e 3.0.' }
      if (payload.fap != null && (payload.fap < 0.5 || payload.fap > 2.0))
        return { success: false, error: 'FAP deve estar entre 0.5 e 2.0.' }

      const empresa = repo().update(payload)
      return { success: true, data: empresa }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── empresa:delete (soft-delete → status = inativa) ─────────────
  ipcMain.handle('empresa:delete', (_e, id: number) => {
    try {
      const r = repo()
      const exists = r.getById(id)
      if (!exists) return { success: false, error: `Empresa ${id} não encontrada.` }
      r.softDelete(id)
      return { success: true, data: undefined }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
