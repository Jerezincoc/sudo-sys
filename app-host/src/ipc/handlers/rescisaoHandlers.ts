import { ipcMain, app } from 'electron'
import fs from 'fs'
import path from 'path'
import { getDb } from '../../db/database'
import { SqliteRescisaoRepository } from '@sudo-sys/infrastructure'
import { SqliteFuncionarioRepository } from '@sudo-sys/infrastructure'
import { SqliteEmpresaRepository } from '@sudo-sys/infrastructure'
import { calcularRescisao } from '@sudo-sys/infrastructure'
import type { CreateRescisaoPayload, UpdateRescisaoPayload } from '@sudo-sys/shared'
import { RescisaoRenderer } from '../../pdf/RescisaoRenderer'

function repo() {
  return new SqliteRescisaoRepository(getDb())
}

export function registerRescisaoHandlers(): void {
  // ── rescisao:list ────────────────────────────────────────────────
  ipcMain.handle('rescisao:list', (_e, empresaId: number) => {
    return repo().listByEmpresa(empresaId)
  })

  // ── rescisao:get ─────────────────────────────────────────────────
  ipcMain.handle('rescisao:get', (_e, id: number) => {
    return repo().getById(id)
  })

  // ── rescisao:create ──────────────────────────────────────────────
  ipcMain.handle('rescisao:create', (_e, payload: CreateRescisaoPayload) => {
    try {
      if (!payload.funcionario_id)
        return { success: false, error: 'Funcionário é obrigatório.' }
      if (!payload.empresa_id)
        return { success: false, error: 'Empresa é obrigatória.' }
      if (!payload.data_demissao)
        return { success: false, error: 'Data de demissão é obrigatória.' }
      if (payload.salario_referencia == null || payload.salario_referencia < 0)
        return { success: false, error: 'Salário de referência inválido.' }

      const r = repo().create(payload)
      return { success: true, data: r }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── rescisao:update ──────────────────────────────────────────────
  ipcMain.handle('rescisao:update', (_e, payload: UpdateRescisaoPayload) => {
    try {
      const r = repo().update(payload)
      return { success: true, data: r }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── rescisao:delete ──────────────────────────────────────────────
  ipcMain.handle('rescisao:delete', (_e, id: number) => {
    try {
      repo().delete(id)
      return { success: true, data: undefined }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── rescisao:calcular ────────────────────────────────────────────
  // Recalcula todos os proventos/descontos e persiste. Status -> 'calculada'.
  ipcMain.handle('rescisao:calcular', (_e, id: number) => {
    try {
      const r = repo()
      const rescisao = r.getById(id)
      if (!rescisao) return { success: false, error: `Rescisão ${id} não encontrada.` }

      const funcRepo = new SqliteFuncionarioRepository(getDb())
      const funcionario = funcRepo.getById(rescisao.funcionario_id)
      if (!funcionario) return { success: false, error: 'Funcionário não encontrado.' }

      const c = calcularRescisao({
        dataAdmissao:       funcionario.data_admissao,
        dataDemissao:       rescisao.data_demissao,
        motivo:             rescisao.motivo,
        avisoPrevio:        rescisao.aviso_previo ?? null,
        salario:            rescisao.salario_referencia,
        diasTrabalhados:    rescisao.dias_trabalhados ?? 0,
        feriasVencidas:     rescisao.ferias_vencidas  ?? 0,
        outrosProventos:    rescisao.outros_proventos ?? 0,
        outrosDescontos:    rescisao.outros_descontos ?? 0,
        saldoFgts:          rescisao.saldo_fgts       ?? 0,
        dependentes:        funcionario.numero_dependentes_irrf ?? 0,
        regimeIrrf:         funcionario.regime_irrf   ?? 'dependentes',
      })

      const updated = r.update({
        id,
        saldo_salario:        c.saldoSalario,
        ferias_proporcionais: c.feriasProporcionais,
        um_terco_ferias:      c.umTercoFerias,
        decimo_terceiro:      c.decimoTerceiro,
        aviso_previo_valor:   c.avisoPrevioValor,
        inss_rescisao:        c.inss,
        inss_decimo_terceiro: c.inssDecimoTerceiro,
        irrf_rescisao:        c.irrf,
        irrf_decimo_terceiro: c.irrfDecimoTerceiro,
        fgts_rescisao:        c.fgtsRescisao,
        multa_fgts:           c.multaFgts,
        total_proventos:      c.totalProventos,
        total_descontos:      c.totalDescontos,
        valor_liquido:        c.valorLiquido,
        status:               'calculada',
      })

      return { success: true, data: updated }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── rescisao:gerar-pdf ───────────────────────────────────────────
  ipcMain.handle('rescisao:gerar-pdf', async (_e, id: number) => {
    try {
      const rescisao = repo().getById(id)
      if (!rescisao) return { success: false, error: `Rescisão ${id} não encontrada.` }

      const funcRepo = new SqliteFuncionarioRepository(getDb())
      const func = funcRepo.getById(rescisao.funcionario_id)
      if (!func) return { success: false, error: 'Funcionário não encontrado.' }

      const empRepo = new SqliteEmpresaRepository(getDb())
      const emp = empRepo.getById(rescisao.empresa_id)
      if (!emp) return { success: false, error: 'Empresa não encontrada.' }

      const downloads = app.getPath('downloads')
      const fileName = `TRCT_${func.nome.replace(/\s+/g, '_')}_${rescisao.data_demissao.slice(0, 10)}.pdf`
      const filePath = path.join(downloads, fileName)

      await RescisaoRenderer.render({
        empresa: {
          razao_social: emp.razao_social,
          cnpj: emp.cnpj,
          endereco: `${emp.logradouro ?? ''} ${emp.numero ?? ''}`.trim(),
          bairro: emp.bairro ?? '',
          cidade: emp.cidade ?? '',
          uf: emp.uf ?? '',
          cep: emp.cep ?? '',
          telefone: emp.telefone ?? '',
        },
        funcionario: {
          codigo: func.codigo,
          nome: func.nome,
          cpf: func.cpf,
          rg: func.rg ?? '',
          cargo: func.cargo ?? '',
          departamento: func.departamento ?? '',
          data_admissao: func.data_admissao,
          ctps: func.ctps ?? '',
          pis_pasep: func.pis_pasep ?? '',
        },
        rescisao: {
          data_demissao: rescisao.data_demissao,
          motivo: rescisao.motivo,
          aviso_previo: rescisao.aviso_previo ?? null,
          data_aviso: rescisao.data_aviso ?? null,
          salario_referencia: rescisao.salario_referencia,
          dias_trabalhados: rescisao.dias_trabalhados ?? 0,
          saldo_salario: rescisao.saldo_salario ?? 0,
          ferias_vencidas: rescisao.ferias_vencidas ?? 0,
          ferias_proporcionais: rescisao.ferias_proporcionais ?? 0,
          um_terco_ferias: rescisao.um_terco_ferias ?? 0,
          decimo_terceiro: rescisao.decimo_terceiro ?? 0,
          aviso_previo_valor: rescisao.aviso_previo_valor ?? 0,
          multa_fgts: rescisao.multa_fgts ?? 0,
          outros_proventos: rescisao.outros_proventos ?? 0,
          total_proventos: rescisao.total_proventos ?? 0,
          inss_rescisao: rescisao.inss_rescisao ?? 0,
          irrf_rescisao: rescisao.irrf_rescisao ?? 0,
          inss_decimo_terceiro: rescisao.inss_decimo_terceiro ?? 0,
          irrf_decimo_terceiro: rescisao.irrf_decimo_terceiro ?? 0,
          fgts_rescisao: rescisao.fgts_rescisao ?? 0,
          outros_descontos: rescisao.outros_descontos ?? 0,
          total_descontos: rescisao.total_descontos ?? 0,
          valor_liquido: rescisao.valor_liquido ?? 0,
          observacao: rescisao.observacao ?? null,
        },
      }, filePath)

      return { success: true, data: { filePath } }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
