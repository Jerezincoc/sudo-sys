import type Database from 'better-sqlite3'
import type {
  FolhaCompetencia,
  FolhaLancamento,
  FolhaHolerite,
  CreateFolhaPayload,
  CreateLancamentoPayload,
} from '@sudo-sys/shared'

export class SqliteFolhaRepository {
  constructor(private db: Database.Database) {}

  listByEmpresa(empresaId: number): FolhaCompetencia[] {
    return this.db
      .prepare('SELECT * FROM folha_competencias WHERE empresa_id = ? ORDER BY competencia DESC')
      .all(empresaId) as FolhaCompetencia[]
  }

  getById(id: number): FolhaCompetencia | null {
    return (
      (this.db.prepare('SELECT * FROM folha_competencias WHERE id = ?').get(id) as FolhaCompetencia | undefined) ?? null
    )
  }

  getByCompetencia(empresaId: number, competencia: string): FolhaCompetencia | null {
    return (
      (this.db
        .prepare('SELECT * FROM folha_competencias WHERE empresa_id = ? AND competencia = ?')
        .get(empresaId, competencia) as FolhaCompetencia | undefined) ?? null
    )
  }

  create(payload: CreateFolhaPayload): FolhaCompetencia {
    const info = this.db
      .prepare(
        `INSERT INTO folha_competencias (empresa_id, competencia, status, observacao)
         VALUES (@empresa_id, @competencia, @status, @observacao)`,
      )
      .run({
        empresa_id: payload.empresa_id,
        competencia: payload.competencia,
        status: payload.status ?? 'aberta',
        observacao: payload.observacao ?? null,
      })
    return this.getById(Number(info.lastInsertRowid))!
  }

  update(payload: Partial<FolhaCompetencia> & { id: number }): FolhaCompetencia {
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const params: Record<string, unknown> = { id: payload.id }
    const cols = ['status', 'observacao', 'total_proventos', 'total_descontos', 'total_liquido', 'total_inss', 'total_fgts', 'total_irrf'] as const
    for (const col of cols) {
      if ((payload as Record<string, unknown>)[col] !== undefined) {
        fields.push(`${col} = @${col}`)
        params[col] = (payload as Record<string, unknown>)[col]
      }
    }
    this.db.prepare(`UPDATE folha_competencias SET ${fields.join(', ')} WHERE id = @id`).run(params)
    return this.getById(payload.id)!
  }

  fechar(id: number): FolhaCompetencia {
    this.db
      .prepare(`UPDATE folha_competencias SET status = 'fechada', updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .run(id)
    return this.getById(id)!
  }

  listLancamentos(folhaId: number, funcionarioId?: number): FolhaLancamento[] {
    if (funcionarioId != null) {
      return this.db
        .prepare('SELECT * FROM folha_lancamentos WHERE folha_id = ? AND funcionario_id = ? ORDER BY rubrica_codigo ASC')
        .all(folhaId, funcionarioId) as FolhaLancamento[]
    }
    return this.db
      .prepare('SELECT * FROM folha_lancamentos WHERE folha_id = ? ORDER BY funcionario_id ASC, rubrica_codigo ASC')
      .all(folhaId) as FolhaLancamento[]
  }

  addLancamento(payload: CreateLancamentoPayload): FolhaLancamento {
    const info = this.db
      .prepare(
        `INSERT INTO folha_lancamentos
          (folha_id, funcionario_id, empresa_id, rubrica_id, rubrica_codigo, rubrica_nome, rubrica_tipo, referencia, valor, origem)
         VALUES
          (@folha_id, @funcionario_id, @empresa_id, @rubrica_id, @rubrica_codigo, @rubrica_nome, @rubrica_tipo, @referencia, @valor, @origem)`,
      )
      .run({
        folha_id: payload.folha_id,
        funcionario_id: payload.funcionario_id,
        empresa_id: payload.empresa_id,
        rubrica_id: payload.rubrica_id ?? null,
        rubrica_codigo: payload.rubrica_codigo,
        rubrica_nome: payload.rubrica_nome,
        rubrica_tipo: payload.rubrica_tipo,
        referencia: payload.referencia ?? 0,
        valor: payload.valor,
        origem: payload.origem ?? 'manual',
      })
    return this.db
      .prepare('SELECT * FROM folha_lancamentos WHERE id = ?')
      .get(Number(info.lastInsertRowid)) as FolhaLancamento
  }

  deleteLancamento(id: number): void {
    this.db.prepare('DELETE FROM folha_lancamentos WHERE id = ?').run(id)
  }

  listHolerites(folhaId: number): FolhaHolerite[] {
    return this.db
      .prepare('SELECT * FROM folha_holerites WHERE folha_id = ? ORDER BY funcionario_id ASC')
      .all(folhaId) as FolhaHolerite[]
  }

  getHolerite(folhaId: number, funcionarioId: number): FolhaHolerite | null {
    return (
      (this.db
        .prepare('SELECT * FROM folha_holerites WHERE folha_id = ? AND funcionario_id = ?')
        .get(folhaId, funcionarioId) as FolhaHolerite | undefined) ?? null
    )
  }

  upsertHolerite(data: Omit<FolhaHolerite, 'id' | 'created_at' | 'updated_at'>): FolhaHolerite {
    this.db
      .prepare(
        `INSERT INTO folha_holerites
          (folha_id, funcionario_id, empresa_id, total_proventos, total_descontos, valor_liquido,
           base_inss, valor_inss, base_irrf, valor_irrf, valor_fgts, status)
         VALUES
          (@folha_id, @funcionario_id, @empresa_id, @total_proventos, @total_descontos, @valor_liquido,
           @base_inss, @valor_inss, @base_irrf, @valor_irrf, @valor_fgts, @status)
         ON CONFLICT(folha_id, funcionario_id) DO UPDATE SET
          total_proventos = excluded.total_proventos,
          total_descontos = excluded.total_descontos,
          valor_liquido   = excluded.valor_liquido,
          base_inss       = excluded.base_inss,
          valor_inss      = excluded.valor_inss,
          base_irrf       = excluded.base_irrf,
          valor_irrf      = excluded.valor_irrf,
          valor_fgts      = excluded.valor_fgts,
          status          = excluded.status,
          updated_at      = CURRENT_TIMESTAMP`,
      )
      .run(data)
    return this.getHolerite(data.folha_id, data.funcionario_id)!
  }

  calcularTotaisHolerite(folhaId: number, funcionarioId: number): {
    proventos: number; descontos: number; baseInss: number; baseIrrf: number
  } {
    const rows = this.listLancamentos(folhaId, funcionarioId)
    let proventos = 0
    let descontos = 0
    for (const r of rows) {
      if (r.rubrica_tipo === 'provento') proventos += r.valor
      else if (r.rubrica_tipo === 'desconto') descontos += r.valor
    }
    return { proventos, descontos, baseInss: proventos, baseIrrf: proventos }
  }

  recalcularTotaisFolha(folhaId: number): FolhaCompetencia {
    const holerites = this.listHolerites(folhaId)
    const totais = holerites.reduce(
      (acc, h) => ({
        total_proventos: acc.total_proventos + h.total_proventos,
        total_descontos: acc.total_descontos + h.total_descontos,
        total_liquido:   acc.total_liquido   + h.valor_liquido,
        total_inss:      acc.total_inss      + h.valor_inss,
        total_fgts:      acc.total_fgts      + h.valor_fgts,
        total_irrf:      acc.total_irrf      + h.valor_irrf,
      }),
      { total_proventos: 0, total_descontos: 0, total_liquido: 0, total_inss: 0, total_fgts: 0, total_irrf: 0 },
    )
    return this.update({ id: folhaId, ...totais })
  }
}
