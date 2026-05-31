import { ipcMain, app } from 'electron'
import path from 'path'
import { getDb } from '../../db/database'
import { SqliteFeriasRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteFeriasRepository'
import { SqliteFuncionarioRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteFuncionarioRepository'
import { SqliteEmpresaRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteEmpresaRepository'
import type { CreateFeriasPayload, UpdateFeriasPayload } from '@sudo-sys/shared'
import { FeriasRenderer } from '../../pdf/FeriasRenderer'

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

  // ── ferias:gerar-pdf ─────────────────────────────────────────────
  ipcMain.handle('ferias:gerar-pdf', async (_e, id: number) => {
    try {
      const ferias = repo().getById(id)
      if (!ferias) return { success: false, error: `Férias ${id} não encontradas.` }

      const func = new SqliteFuncionarioRepository(getDb()).getById(ferias.funcionario_id)
      if (!func) return { success: false, error: 'Funcionário não encontrado.' }

      const emp = new SqliteEmpresaRepository(getDb()).getById(ferias.empresa_id)
      if (!emp) return { success: false, error: 'Empresa não encontrada.' }

      const downloads = app.getPath('downloads')
      const fileName = `Ferias_${func.nome.replace(/\s+/g, '_')}_${ferias.inicio_gozo.slice(0, 10)}.pdf`
      const filePath = path.join(downloads, fileName)

      await FeriasRenderer.render({
        empresa: {
          razao_social: emp.razao_social,
          cnpj: emp.cnpj,
          endereco: `${emp.logradouro ?? ''} ${emp.numero ?? ''}`.trim(),
          cidade: emp.cidade ?? '',
          uf: emp.uf ?? '',
        },
        funcionario: {
          codigo: func.codigo,
          nome: func.nome,
          cpf: func.cpf,
          cargo: func.cargo ?? '',
          departamento: func.departamento ?? '',
          data_admissao: func.data_admissao,
        },
        ferias: {
          periodo_inicio: ferias.periodo_inicio,
          periodo_fim: ferias.periodo_fim,
          inicio_gozo: ferias.inicio_gozo,
          fim_gozo: ferias.fim_gozo,
          dias_concedidos: ferias.dias_concedidos,
          dias_abono: ferias.dias_abono,
          adiantamento_13: ferias.adiantamento_13,
          salario_referencia: ferias.salario_referencia,
          valor_ferias: ferias.valor_ferias,
          valor_abono: ferias.valor_abono,
          valor_adiantamento_13: ferias.valor_adiantamento_13,
          valor_total: ferias.valor_total,
          observacao: ferias.observacao,
        },
        inss: 0,
        irrf: 0,
      }, filePath)

      return { success: true, data: { filePath } }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
