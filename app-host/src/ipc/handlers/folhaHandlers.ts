import { ipcMain, app } from 'electron'
import fs from 'fs'
import path from 'path'
import { getDb } from '../../db/database'
import { SqliteFolhaRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteFolhaRepository'
import { calcularINSS, calcularIRRF, calcularFGTS } from '@sudo-sys/infrastructure/src/services/CalculoFolha'
import { HoleriteRenderer } from '../../pdf/HoleriteRenderer'
import type { CreateFolhaPayload, CreateLancamentoPayload } from '@sudo-sys/shared'
import type { HoleriteData } from '../../pdf/HoleriteRenderer'

export function registerFolhaHandlers(): void {
  ipcMain.handle('folha:list', (_e, empresaId: number) => {
    try {
      return new SqliteFolhaRepository(getDb()).listByEmpresa(empresaId)
    } catch { return [] }
  })

  ipcMain.handle('folha:get', (_e, id: number) => {
    try {
      const repo = new SqliteFolhaRepository(getDb())
      const folha = repo.getById(id)
      if (!folha) return null
      return { ...folha, holerites: repo.listHolerites(id) }
    } catch { return null }
  })

  ipcMain.handle('folha:create', (_e, payload: CreateFolhaPayload) => {
    try {
      if (!payload.empresa_id)  return { success: false, error: 'Empresa obrigatória.' }
      if (!payload.competencia) return { success: false, error: 'Competência obrigatória.' }
      const repo = new SqliteFolhaRepository(getDb())
      const exists = repo.getByCompetencia(payload.empresa_id, payload.competencia)
      if (exists) return { success: false, error: 'Já existe folha para esta competência.' }
      const created = repo.create(payload)
      return { success: true, data: created }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('folha:update', (_e, payload: Partial<{ id: number; status: string; observacao: string }>) => {
    try {
      if (!payload.id) return { success: false, error: 'ID obrigatório.' }
      const updated = new SqliteFolhaRepository(getDb()).update(payload as { id: number })
      return { success: true, data: updated }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('folha:fechar', (_e, id: number) => {
    try {
      const updated = new SqliteFolhaRepository(getDb()).fechar(id)
      return { success: true, data: updated }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('folha:lancamentos:list', (_e, folhaId: number, funcionarioId?: number) => {
    try {
      return new SqliteFolhaRepository(getDb()).listLancamentos(folhaId, funcionarioId)
    } catch { return [] }
  })

  ipcMain.handle('folha:lancamentos:add', (_e, payload: CreateLancamentoPayload) => {
    try {
      if (!payload.folha_id)       return { success: false, error: 'Folha obrigatória.' }
      if (!payload.funcionario_id) return { success: false, error: 'Funcionário obrigatório.' }
      if (!payload.rubrica_codigo) return { success: false, error: 'Rubrica obrigatória.' }
      const created = new SqliteFolhaRepository(getDb()).addLancamento(payload)
      return { success: true, data: created }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('folha:lancamentos:delete', (_e, id: number) => {
    try {
      new SqliteFolhaRepository(getDb()).deleteLancamento(id)
      return { success: true, data: undefined }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('folha:calcular', (_e, folhaId: number) => {
    try {
      const db = getDb()
      const repo = new SqliteFolhaRepository(db)
      const folha = repo.getById(folhaId)
      if (!folha) return { success: false, error: 'Folha não encontrada.' }

      const funcionarios = db
        .prepare("SELECT id FROM funcionarios WHERE empresa_id = ? AND status = 'ativo'")
        .all(folha.empresa_id) as { id: number }[]

      const rubricaFlags = db.prepare(
        'SELECT id, codigo, incide_inss, incide_irrf, incide_fgts FROM rubricas WHERE (empresa_id = ? OR empresa_id IS NULL) ORDER BY empresa_id DESC'
      ).all(folha.empresa_id) as { id: number; codigo: string; incide_inss: number; incide_irrf: number; incide_fgts: number }[]
      const rubricaMap = new Map(rubricaFlags.map((r) => [r.codigo, r]))

      // Rubricas globais de encargos — reaproveita o seed existente (0100/0101);
      // FGTS não tem rubrica própria seedada, então usa rubrica_id nulo.
      const RUBRICA_INSS_COD = '0100'
      const RUBRICA_IRRF_COD = '0101'
      const RUBRICA_FGTS_COD = '0202'

      for (const { id: funcionarioId } of funcionarios) {
        const todosLancamentos = repo.listLancamentos(folhaId, funcionarioId)
        // Lançamentos automáticos de um cálculo anterior não entram na base —
        // senão INSS/IRRF já descontados seriam contados de novo a cada recálculo.
        const lancamentos = todosLancamentos.filter((l) => l.origem !== 'automatico')
        if (lancamentos.length === 0) continue

        let proventos = 0
        let descontosManuais = 0
        let baseInss = 0
        let baseIrrf = 0
        let baseFgts = 0
        for (const l of lancamentos) {
          if (l.rubrica_tipo === 'provento') {
            proventos += l.valor
            const flags = rubricaMap.get(l.rubrica_codigo)
            if (!flags || flags.incide_inss) baseInss += l.valor
            if (!flags || flags.incide_irrf) baseIrrf += l.valor
            if (!flags || flags.incide_fgts) baseFgts += l.valor
          } else if (l.rubrica_tipo === 'desconto') {
            descontosManuais += l.valor
          }
        }

        const inss  = calcularINSS(baseInss)
        const irrf  = calcularIRRF(baseIrrf - inss.valor)
        const fgts  = calcularFGTS(baseFgts)
        const totalDescontos = descontosManuais + inss.valor + irrf.valor
        const liquido = Math.max(0, proventos - totalDescontos)

        repo.upsertHolerite({
          folha_id:        folhaId,
          funcionario_id:  funcionarioId,
          empresa_id:      folha.empresa_id,
          total_proventos: proventos,
          total_descontos: totalDescontos,
          valor_liquido:   liquido,
          base_inss:       baseInss,
          valor_inss:      inss.valor,
          base_irrf:       irrf.base,
          valor_irrf:      irrf.valor,
          valor_fgts:      fgts,
          status:          'calculado',
        })

        // Sobrescreve (não duplica) os lançamentos automáticos desta folha+funcionário.
        repo.deleteLancamentosAutomaticos(folhaId, funcionarioId)

        if (inss.valor > 0) {
          const rInss = rubricaMap.get(RUBRICA_INSS_COD)
          repo.addLancamento({
            folha_id: folhaId, funcionario_id: funcionarioId, empresa_id: folha.empresa_id,
            rubrica_id: rInss?.id ?? null, rubrica_codigo: RUBRICA_INSS_COD, rubrica_nome: 'INSS',
            rubrica_tipo: 'desconto', referencia: 0, valor: inss.valor, origem: 'automatico',
          })
        }
        if (irrf.valor > 0) {
          const rIrrf = rubricaMap.get(RUBRICA_IRRF_COD)
          repo.addLancamento({
            folha_id: folhaId, funcionario_id: funcionarioId, empresa_id: folha.empresa_id,
            rubrica_id: rIrrf?.id ?? null, rubrica_codigo: RUBRICA_IRRF_COD, rubrica_nome: 'IRRF',
            rubrica_tipo: 'desconto', referencia: 0, valor: irrf.valor, origem: 'automatico',
          })
        }
        if (fgts > 0) {
          // FGTS não é desconto do funcionário (não entra no líquido) — entra como
          // linha informativa separada, mantendo a mesma separação do layout do holerite.
          repo.addLancamento({
            folha_id: folhaId, funcionario_id: funcionarioId, empresa_id: folha.empresa_id,
            rubrica_id: null, rubrica_codigo: RUBRICA_FGTS_COD, rubrica_nome: 'FGTS Mês',
            rubrica_tipo: 'informativo', referencia: 0, valor: fgts, origem: 'automatico',
          })
        }
      }

      const folhaAtualizada = repo.recalcularTotaisFolha(folhaId)
      repo.update({ id: folhaId, status: 'processada' })

      return { success: true, data: { ...folhaAtualizada, status: 'processada' } }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('folha:holerites:list', (_e, folhaId: number) => {
    try {
      return new SqliteFolhaRepository(getDb()).listHolerites(folhaId)
    } catch { return [] }
  })

  ipcMain.handle('folha:holerites:get', (_e, folhaId: number, funcionarioId: number) => {
    try {
      const repo = new SqliteFolhaRepository(getDb())
      const holerite = repo.getHolerite(folhaId, funcionarioId)
      if (!holerite) return null
      return { ...holerite, lancamentos: repo.listLancamentos(folhaId, funcionarioId) }
    } catch { return null }
  })

  ipcMain.handle('folha:gerar-holerite', async (_e, payload: { folhaId: number; funcionarioId?: number }) => {
    try {
      const db  = getDb()
      const repo = new SqliteFolhaRepository(db)

      const folha = repo.getById(payload.folhaId)
      if (!folha) return { success: false, error: 'Folha não encontrada.' }

      const empresa = db.prepare('SELECT * FROM empresas WHERE id = ?').get(folha.empresa_id) as Record<string, unknown> | undefined
      if (!empresa) return { success: false, error: 'Empresa não encontrada.' }

      function buildData(funcId: number): HoleriteData | null {
        const func = db.prepare('SELECT * FROM funcionarios WHERE id = ?').get(funcId) as Record<string, unknown> | undefined
        if (!func) return null
        const holerite = repo.getHolerite(folha!.id, funcId)
        if (!holerite) return null
        const lancamentos = repo.listLancamentos(folha!.id, funcId)

        const endereco = [empresa!['logradouro'], empresa!['numero'], empresa!['complemento']]
          .filter(Boolean).join(', ')

        return {
          empresa: {
            razao_social: String(empresa!['razao_social'] ?? ''),
            cnpj:         String(empresa!['cnpj'] ?? ''),
            endereco,
            cidade:       String(empresa!['cidade'] ?? ''),
            uf:           String(empresa!['uf'] ?? ''),
          },
          funcionario: {
            codigo:       String(func['codigo'] ?? ''),
            nome:         String(func['nome'] ?? ''),
            cpf:          String(func['cpf'] ?? ''),
            cargo:        String(func['cargo'] ?? ''),
            cbo_codigo:   String(func['cbo_codigo'] ?? ''),
            departamento: String(func['departamento'] ?? ''),
            data_admissao: String(func['data_admissao'] ?? ''),
            pis_pasep:    String(func['pis_pasep'] ?? ''),
            ctps:         String(func['ctps'] ?? ''),
          },
          competencia: folha!.competencia,
          lancamentos: lancamentos.map((l) => ({
            codigo:    l.rubrica_codigo,
            nome:      l.rubrica_nome,
            tipo:      l.rubrica_tipo as 'provento' | 'desconto' | 'informativo',
            referencia: l.referencia > 0 ? String(l.referencia) : '',
            valor:     l.valor,
          })),
          totais: {
            proventos:  holerite.total_proventos,
            descontos:  holerite.total_descontos,
            liquido:    holerite.valor_liquido,
            base_inss:  holerite.base_inss,
            valor_inss: holerite.valor_inss,
            base_irrf:  holerite.base_irrf,
            valor_irrf: holerite.valor_irrf,
            fgts_mes:   holerite.valor_fgts,
          },
        }
      }

      const downloadsDir = app.getPath('downloads')
      const ts = Date.now()

      if (payload.funcionarioId != null) {
        const data = buildData(payload.funcionarioId)
        if (!data) return { success: false, error: 'Holerite não calculado para este funcionário.' }
        const safeName = data.funcionario.nome.replace(/[^\wÀ-ɏ]/g, '_')
        const filePath = path.join(downloadsDir, `holerite_${folha.competencia}_${safeName}_${ts}.pdf`)
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
        await HoleriteRenderer.render(data, filePath)
        return { success: true, data: { filePath } }
      } else {
        const holerites = repo.listHolerites(folha.id)
        const items: HoleriteData[] = []
        for (const h of holerites) {
          const d = buildData(h.funcionario_id)
          if (d) items.push(d)
        }
        if (items.length === 0) return { success: false, error: 'Nenhum holerite calculado nesta folha.' }
        const filePath = path.join(downloadsDir, `holerites_${folha.competencia}_${ts}.pdf`)
        await HoleriteRenderer.renderMulti(items, filePath)
        return { success: true, data: { filePath } }
      }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })
}
