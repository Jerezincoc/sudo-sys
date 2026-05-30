import { ipcMain, app } from 'electron'
import path from 'path'
import { getDb } from '../../db/database'
import { SqlitePontoRepository } from '@sudo-sys/infrastructure/src/repositories/SqlitePontoRepository'
import { SqliteFuncionarioRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteFuncionarioRepository'
import { SqliteEmpresaRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteEmpresaRepository'
import type { CreatePontoPayload, UpdatePontoPayload } from '@sudo-sys/shared'
import { EspelhoPontoRenderer } from '../../pdf/EspelhoPontoRenderer'

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

  // ── ponto:gerar-espelho-pdf ──────────────────────────────────────
  ipcMain.handle('ponto:gerar-espelho-pdf', async (_e, payload: { empresaId: number; funcionarioId: number; mes: number; ano: number }) => {
    try {
      const { empresaId, funcionarioId, mes, ano } = payload
      const espelho = new SqlitePontoRepository(getDb()).espelho(empresaId, funcionarioId, mes, ano)

      const func = new SqliteFuncionarioRepository(getDb()).getById(funcionarioId)
      if (!func) return { success: false, error: 'Funcionário não encontrado.' }

      const emp = new SqliteEmpresaRepository(getDb()).getById(empresaId)
      if (!emp) return { success: false, error: 'Empresa não encontrada.' }

      const downloads = app.getPath('downloads')
      const mesStr = String(mes).padStart(2, '0')
      const fileName = `EspelhoPonto_${func.nome.replace(/\s+/g, '_')}_${ano}${mesStr}.pdf`
      const filePath = path.join(downloads, fileName)

      await EspelhoPontoRenderer.render({
        empresa: { razao_social: emp.razao_social, cnpj: emp.cnpj, cidade: emp.cidade ?? '', uf: emp.uf ?? '' },
        funcionario: {
          codigo: func.codigo,
          nome: func.nome,
          cpf: func.cpf,
          cargo: func.cargo ?? '',
          departamento: func.departamento ?? '',
        },
        mes,
        ano,
        registros: espelho.registros.map(r => ({
          data: r.data,
          entrada: r.entrada,
          saida_almoco: r.saida_almoco,
          retorno_almoco: r.retorno_almoco,
          saida: r.saida,
          horas_trabalhadas: r.horas_trabalhadas,
          horas_normais: r.horas_normais,
          horas_extras_50: r.horas_extras_50,
          horas_extras_100: r.horas_extras_100,
          horas_falta: r.horas_falta,
          tipo: r.tipo,
          justificativa: r.justificativa,
        })),
        totais: {
          total_trabalhadas: espelho.total_trabalhadas,
          total_normais: espelho.total_normais,
          total_extras_50: espelho.total_extras_50,
          total_extras_100: espelho.total_extras_100,
          total_faltas: espelho.total_faltas,
        },
      }, filePath)

      return { success: true, data: { filePath } }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
