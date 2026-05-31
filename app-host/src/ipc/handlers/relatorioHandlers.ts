import { ipcMain, app, dialog } from 'electron'
import path from 'path'
import { getDb } from '../../db/database'
import { SqliteRelatorioRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteRelatorioRepository'
import { RelatorioRenderer } from '../../pdf/RelatorioRenderer'
import type {
  CreateRelatorioPayload,
  UpdateRelatorioPayload,
  ExecutarRelatorioPayload,
  CampoSintetico,
  RelatorioLinhaFuncionario,
} from '@sudo-sys/shared'

type IpcResult<T> = { success: true; data: T } | { success: false; error: string }

function ok<T>(data: T): IpcResult<T> { return { success: true, data } }
function err(e: unknown): IpcResult<never> {
  return { success: false, error: e instanceof Error ? e.message : String(e) }
}

export function registerRelatorioHandlers(): void {
  const getRepo = () => new SqliteRelatorioRepository(getDb())

  ipcMain.handle('relatorio:list', (_e, empresaId?: number) => {
    try { return ok(getRepo().list(empresaId)) } catch (e) { return err(e) }
  })

  ipcMain.handle('relatorio:get', (_e, id: number) => {
    try { return ok(getRepo().getById(id)) } catch (e) { return err(e) }
  })

  ipcMain.handle('relatorio:create', (_e, payload: CreateRelatorioPayload) => {
    try { return ok(getRepo().create(payload)) } catch (e) { return err(e) }
  })

  ipcMain.handle('relatorio:update', (_e, payload: UpdateRelatorioPayload) => {
    try { return ok(getRepo().update(payload)) } catch (e) { return err(e) }
  })

  ipcMain.handle('relatorio:delete', (_e, id: number) => {
    try { getRepo().delete(id); return ok(undefined) } catch (e) { return err(e) }
  })

  ipcMain.handle('relatorio:executar', (_e, payload: ExecutarRelatorioPayload) => {
    try {
      const db = getDb()
      const relatorio = getRepo().getById(payload.id)
      if (!relatorio) return err(new Error('Relatório não encontrado'))

      const campos = relatorio.campos as CampoSintetico[]
      const camposNivel1   = campos.filter(c => c.nivel === '1')
      const camposNivel1_1 = campos.filter(c => c.nivel === '1.1')
      const camposNivel1_2 = campos.filter(c => c.nivel === '1.2')

      // Buscar funcionários
      let funcionarios: Record<string, unknown>[]
      if (payload.matricula) {
        funcionarios = db
          .prepare("SELECT * FROM funcionarios WHERE empresa_id = ? AND codigo = ? AND status = 'ativo'")
          .all(payload.empresa_id, payload.matricula) as Record<string, unknown>[]
      } else {
        funcionarios = db
          .prepare("SELECT * FROM funcionarios WHERE empresa_id = ? AND status = 'ativo' ORDER BY nome")
          .all(payload.empresa_id) as Record<string, unknown>[]
      }

      // Para cada funcionário, montar dados de nível 1 e derivados
      const resultado: RelatorioLinhaFuncionario[] = funcionarios.map(func => {
        const funcId = func['id'] as number

        // Dados nível 1 (direto do funcionário)
        const campoKeyMap: Record<string, string> = { matricula: 'codigo', admissao: 'data_admissao', salario_base: 'salario_base' }
        const dadosFunc: Record<string, unknown> = {}
        for (const campo of camposNivel1) {
          const raw = campo.id.split('.')[1]
          const key = campoKeyMap[raw] ?? raw
          dadosFunc[campo.id] = func[key] ?? ''
        }

        const derivados: RelatorioLinhaFuncionario['derivados'] = []

        // Dados de competência (nível 1.1) — buscar pelo holerite
        if (camposNivel1_1.some(c => c.id.startsWith('competencia.') || c.id.startsWith('ponto.'))) {
          let holQuery = 'SELECT * FROM folha_holerites WHERE funcionario_id = ? AND empresa_id = ?'
          const holParams: unknown[] = [funcId, payload.empresa_id]

          if (payload.competencia_inicio || payload.competencia_fim) {
            holQuery = `
              SELECT h.* FROM folha_holerites h
              JOIN folha_competencias fc ON fc.id = h.folha_id
              WHERE h.funcionario_id = ? AND h.empresa_id = ?
              ${payload.competencia_inicio ? 'AND fc.competencia >= ?' : ''}
              ${payload.competencia_fim   ? 'AND fc.competencia <= ?' : ''}
              ORDER BY fc.competencia
            `
            if (payload.competencia_inicio) holParams.push(payload.competencia_inicio)
            if (payload.competencia_fim)   holParams.push(payload.competencia_fim)
          }

          const holerites = db.prepare(holQuery).all(...holParams) as Record<string, unknown>[]

          for (const hol of holerites) {
            // Buscar competência associada
            const folha = db.prepare('SELECT * FROM folha_competencias WHERE id = ?').get(hol['folha_id']) as Record<string, unknown> | undefined
            const dadosComp: Record<string, unknown> = {}
            for (const campo of camposNivel1_1) {
              if (campo.id.startsWith('competencia.')) {
                const key = campo.id.split('.')[1]
                if (key === 'periodo')       dadosComp[campo.id] = folha?.['competencia'] ?? ''
                else if (key === 'salario_bruto') dadosComp[campo.id] = hol['total_proventos'] ?? 0
                else if (key === 'inss')     dadosComp[campo.id] = hol['valor_inss'] ?? 0
                else if (key === 'irrf')     dadosComp[campo.id] = hol['valor_irrf'] ?? 0
                else if (key === 'fgts')     dadosComp[campo.id] = hol['valor_fgts'] ?? 0
                else if (key === 'liquido')  dadosComp[campo.id] = hol['valor_liquido'] ?? 0
                else if (key === 'vt' || key === 'vr') dadosComp[campo.id] = 0 // TODO: buscar de lancamentos
              }
            }
            derivados.push({ nivel: '1.1', dados: dadosComp })
          }
        }

        // Dados de férias (nível 1.2)
        if (camposNivel1_2.some(c => c.id.startsWith('ferias.'))) {
          const ferias = db
            .prepare('SELECT * FROM ferias WHERE funcionario_id = ? AND empresa_id = ? ORDER BY inicio_gozo')
            .all(funcId, payload.empresa_id) as Record<string, unknown>[]
          for (const f of ferias) {
            const dadosF: Record<string, unknown> = {}
            for (const campo of camposNivel1_2) {
              const key = campo.id.split('.')[1]
              if (key === 'periodo_aquisitivo') dadosF[campo.id] = `${f['periodo_inicio']} a ${f['periodo_fim']}`
              else if (key === 'dias_concedidos') dadosF[campo.id] = f['dias_ferias'] ?? 0
              else if (key === 'valor_total')     dadosF[campo.id] = f['valor_ferias'] ?? 0
            }
            derivados.push({ nivel: '1.2', dados: dadosF })
          }
        }

        return { funcionario: dadosFunc, derivados }
      })

      return ok(resultado)
    } catch (e) {
      return err(e)
    }
  })

  ipcMain.handle('relatorio:gerar-pdf', async (_e, payload: ExecutarRelatorioPayload) => {
    try {
      const db = getDb()
      const relatorio = getRepo().getById(payload.id)
      if (!relatorio) return err(new Error('Relatório não encontrado'))

      const empresaRow = db.prepare('SELECT razao_social FROM empresas WHERE id = ?').get(payload.empresa_id) as { razao_social: string } | undefined
      const empresaNome = empresaRow?.razao_social ?? ''

      // Re-executar para obter os dados
      const execResult = await new Promise<ReturnType<typeof ok>>((resolve) => {
        try {
          const campos = relatorio.campos as CampoSintetico[]
          const camposNivel1   = campos.filter(c => c.nivel === '1')
          const camposNivel1_1 = campos.filter(c => c.nivel === '1.1')
          const camposNivel1_2 = campos.filter(c => c.nivel === '1.2')

          let funcionarios: Record<string, unknown>[]
          if (payload.matricula) {
            funcionarios = db
              .prepare("SELECT * FROM funcionarios WHERE empresa_id = ? AND codigo = ? AND status = 'ativo'")
              .all(payload.empresa_id, payload.matricula) as Record<string, unknown>[]
          } else {
            funcionarios = db
              .prepare("SELECT * FROM funcionarios WHERE empresa_id = ? AND status = 'ativo' ORDER BY nome")
              .all(payload.empresa_id) as Record<string, unknown>[]
          }

          const campoKeyMap: Record<string, string> = { matricula: 'codigo', admissao: 'data_admissao' }
          const resultado: RelatorioLinhaFuncionario[] = funcionarios.map(func => {
            const funcId = func['id'] as number
            const dadosFunc: Record<string, unknown> = {}
            for (const campo of camposNivel1) {
              const raw = campo.id.split('.')[1]
              dadosFunc[campo.id] = func[campoKeyMap[raw] ?? raw] ?? ''
            }
            const derivados: RelatorioLinhaFuncionario['derivados'] = []
            if (camposNivel1_1.length > 0) {
              let holQuery = 'SELECT h.*, fc.competencia FROM folha_holerites h JOIN folha_competencias fc ON fc.id = h.folha_id WHERE h.funcionario_id = ? AND h.empresa_id = ?'
              const holParams: unknown[] = [funcId, payload.empresa_id]
              if (payload.competencia_inicio) { holQuery += ' AND fc.competencia >= ?'; holParams.push(payload.competencia_inicio) }
              if (payload.competencia_fim)    { holQuery += ' AND fc.competencia <= ?'; holParams.push(payload.competencia_fim) }
              holQuery += ' ORDER BY fc.competencia'
              const holerites = db.prepare(holQuery).all(...holParams) as Record<string, unknown>[]
              for (const hol of holerites) {
                const dadosComp: Record<string, unknown> = {}
                for (const campo of camposNivel1_1) {
                  if (campo.id.startsWith('competencia.')) {
                    const key = campo.id.split('.')[1]
                    if (key === 'periodo')       dadosComp[campo.id] = hol['competencia'] ?? ''
                    else if (key === 'salario_bruto') dadosComp[campo.id] = hol['total_proventos'] ?? 0
                    else if (key === 'inss')     dadosComp[campo.id] = hol['valor_inss'] ?? 0
                    else if (key === 'irrf')     dadosComp[campo.id] = hol['valor_irrf'] ?? 0
                    else if (key === 'fgts')     dadosComp[campo.id] = hol['valor_fgts'] ?? 0
                    else if (key === 'liquido')  dadosComp[campo.id] = hol['valor_liquido'] ?? 0
                    else dadosComp[campo.id] = 0
                  }
                }
                derivados.push({ nivel: '1.1', dados: dadosComp })
              }
            }
            if (camposNivel1_2.length > 0) {
              const ferias = db.prepare('SELECT * FROM ferias WHERE funcionario_id = ? AND empresa_id = ? ORDER BY inicio_gozo').all(funcId, payload.empresa_id) as Record<string, unknown>[]
              for (const f of ferias) {
                const dadosF: Record<string, unknown> = {}
                for (const campo of camposNivel1_2) {
                  const key = campo.id.split('.')[1]
                  if (key === 'periodo_aquisitivo') dadosF[campo.id] = `${f['periodo_inicio']} a ${f['periodo_fim']}`
                  else if (key === 'dias_concedidos') dadosF[campo.id] = f['dias_concedidos'] ?? 0
                  else if (key === 'valor_total')     dadosF[campo.id] = f['valor_total'] ?? 0
                }
                derivados.push({ nivel: '1.2', dados: dadosF })
              }
            }
            return { funcionario: dadosFunc, derivados }
          })
          resolve(ok(resultado))
        } catch (e) { resolve(err(e)) }
      })

      if (!execResult.success) return execResult

      const downloads = app.getPath('downloads')
      const safeName = relatorio.nome.replace(/[^a-zA-Z0-9À-ÿ _-]/g, '_')
      const filePath = path.join(downloads, `${safeName}_${Date.now()}.pdf`)

      if (relatorio.modo === 'analitico') {
        await RelatorioRenderer.renderAnalitico(relatorio, execResult.data as RelatorioLinhaFuncionario[], empresaNome, filePath)
      } else {
        await RelatorioRenderer.renderSintetico(relatorio, execResult.data as RelatorioLinhaFuncionario[], empresaNome, filePath)
      }

      return ok({ filePath })
    } catch (e) {
      return err(e)
    }
  })
}
