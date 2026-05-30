import { ipcMain } from 'electron'
import { getDb } from '../../db/database'
import { SqlitePontoRepository } from '@sudo-sys/infrastructure/src/repositories/SqlitePontoRepository'
import type { CreatePontoPayload, UpdatePontoPayload } from '@sudo-sys/shared'

function calcHoras(entrada?: string | null, saidaAlmoco?: string | null, retornoAlmoco?: string | null, saida?: string | null, cargaDiaria = 8.8) {
  if (!entrada || !saida) return { trabalhadas: 0, normais: 0, extras50: 0, extras100: 0, falta: 0 }
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const manha = saidaAlmoco ? toMin(saidaAlmoco) - toMin(entrada) : 0
  const tarde = retornoAlmoco ? toMin(saida) - toMin(retornoAlmoco) : toMin(saida) - toMin(entrada)
  const trabalhadas = (manha + tarde) / 60
  const normais = Math.min(trabalhadas, cargaDiaria)
  const extra = Math.max(0, trabalhadas - cargaDiaria)
  const extras50 = Math.min(extra, 2)
  const extras100 = Math.max(0, extra - 2)
  const falta = Math.max(0, cargaDiaria - trabalhadas)
  return { trabalhadas, normais, extras50, extras100, falta }
}

export function registerPontoHandlers(): void {
  ipcMain.handle('ponto:list', (_e, empresaId: number, mes?: number, ano?: number, funcionarioId?: number) => {
    try {
      const repo = new SqlitePontoRepository(getDb())
      return repo.list(empresaId, mes, ano, funcionarioId)
    } catch (err) {
      return []
    }
  })

  ipcMain.handle('ponto:get', (_e, id: number) => {
    try {
      const repo = new SqlitePontoRepository(getDb())
      return repo.getById(id)
    } catch { return null }
  })

  ipcMain.handle('ponto:create', (_e, payload: CreatePontoPayload) => {
    try {
      if (!payload.funcionario_id) return { success: false, error: 'Funcionário obrigatório.' }
      if (!payload.empresa_id)     return { success: false, error: 'Empresa obrigatória.' }
      if (!payload.data)           return { success: false, error: 'Data obrigatória.' }

      const h = calcHoras(payload.entrada, payload.saida_almoco, payload.retorno_almoco, payload.saida)
      const enriched: CreatePontoPayload = {
        ...payload,
        horas_trabalhadas: parseFloat(h.trabalhadas.toFixed(4)),
        horas_normais:     parseFloat(h.normais.toFixed(4)),
        horas_extras_50:   parseFloat(h.extras50.toFixed(4)),
        horas_extras_100:  parseFloat(h.extras100.toFixed(4)),
        horas_falta:       parseFloat(h.falta.toFixed(4)),
      }
      const repo = new SqlitePontoRepository(getDb())
      const created = repo.create(enriched)
      return { success: true, data: created }
    } catch (err) {
      const msg = String(err)
      if (msg.includes('UNIQUE')) return { success: false, error: 'Já existe registro para este funcionário nesta data.' }
      return { success: false, error: msg }
    }
  })

  ipcMain.handle('ponto:update', (_e, payload: UpdatePontoPayload) => {
    try {
      if (!payload.id) return { success: false, error: 'ID obrigatório.' }
      const h = calcHoras(payload.entrada, payload.saida_almoco, payload.retorno_almoco, payload.saida)
      const enriched: UpdatePontoPayload = {
        ...payload,
        horas_trabalhadas: parseFloat(h.trabalhadas.toFixed(4)),
        horas_normais:     parseFloat(h.normais.toFixed(4)),
        horas_extras_50:   parseFloat(h.extras50.toFixed(4)),
        horas_extras_100:  parseFloat(h.extras100.toFixed(4)),
        horas_falta:       parseFloat(h.falta.toFixed(4)),
      }
      const repo = new SqlitePontoRepository(getDb())
      const updated = repo.update(enriched)
      return { success: true, data: updated }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('ponto:delete', (_e, id: number) => {
    try {
      const repo = new SqlitePontoRepository(getDb())
      repo.delete(id)
      return { success: true, data: undefined }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('ponto:espelho', (_e, empresaId: number, funcionarioId: number, mes: number, ano: number) => {
    try {
      const repo = new SqlitePontoRepository(getDb())
      return { success: true, data: repo.espelho(empresaId, funcionarioId, mes, ano) }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
