import type Database from 'better-sqlite3'
import type { Rescisao, CreateRescisaoPayload, UpdateRescisaoPayload } from '@sudo-sys/shared'

export class SqliteRescisaoRepository {
  constructor(private db: Database.Database) {}

  listByEmpresa(empresaId: number): Rescisao[] {
    return this.db
      .prepare('SELECT * FROM rescisoes WHERE empresa_id = ? ORDER BY data_demissao DESC')
      .all(empresaId) as Rescisao[]
  }

  listByFuncionario(funcionarioId: number): Rescisao[] {
    return this.db
      .prepare('SELECT * FROM rescisoes WHERE funcionario_id = ? ORDER BY data_demissao DESC')
      .all(funcionarioId) as Rescisao[]
  }

  getById(id: number): Rescisao | null {
    return (
      (this.db.prepare('SELECT * FROM rescisoes WHERE id = ?').get(id) as Rescisao | undefined) ?? null
    )
  }

  create(payload: CreateRescisaoPayload): Rescisao {
    const stmt = this.db.prepare(`
      INSERT INTO rescisoes (
        funcionario_id, empresa_id, data_demissao, motivo, aviso_previo, data_aviso,
        salario_referencia, dias_trabalhados, saldo_salario, ferias_vencidas,
        ferias_proporcionais, um_terco_ferias, decimo_terceiro, aviso_previo_valor,
        multa_fgts, outros_proventos, total_proventos, inss_rescisao, irrf_rescisao,
        outros_descontos, total_descontos, valor_liquido, status, observacao
      ) VALUES (
        @funcionario_id, @empresa_id, @data_demissao, @motivo, @aviso_previo, @data_aviso,
        @salario_referencia, @dias_trabalhados, @saldo_salario, @ferias_vencidas,
        @ferias_proporcionais, @um_terco_ferias, @decimo_terceiro, @aviso_previo_valor,
        @multa_fgts, @outros_proventos, @total_proventos, @inss_rescisao, @irrf_rescisao,
        @outros_descontos, @total_descontos, @valor_liquido, @status, @observacao
      )
    `)

    const result = stmt.run({
      funcionario_id:      payload.funcionario_id,
      empresa_id:          payload.empresa_id,
      data_demissao:       payload.data_demissao,
      motivo:              payload.motivo,
      aviso_previo:        payload.aviso_previo        ?? null,
      data_aviso:          payload.data_aviso          ?? null,
      salario_referencia:  payload.salario_referencia,
      dias_trabalhados:    payload.dias_trabalhados    ?? null,
      saldo_salario:       payload.saldo_salario       ?? null,
      ferias_vencidas:     payload.ferias_vencidas     ?? null,
      ferias_proporcionais: payload.ferias_proporcionais ?? null,
      um_terco_ferias:     payload.um_terco_ferias     ?? null,
      decimo_terceiro:     payload.decimo_terceiro     ?? null,
      aviso_previo_valor:  payload.aviso_previo_valor  ?? null,
      multa_fgts:          payload.multa_fgts          ?? null,
      outros_proventos:    payload.outros_proventos    ?? null,
      total_proventos:     payload.total_proventos     ?? null,
      inss_rescisao:       payload.inss_rescisao       ?? null,
      irrf_rescisao:       payload.irrf_rescisao       ?? null,
      outros_descontos:    payload.outros_descontos    ?? null,
      total_descontos:     payload.total_descontos     ?? null,
      valor_liquido:       payload.valor_liquido       ?? null,
      status:              payload.status              ?? 'rascunho',
      observacao:          payload.observacao          ?? null,
    })

    return this.getById(Number(result.lastInsertRowid))!
  }

  update(payload: UpdateRescisaoPayload): Rescisao {
    const { id, ...fields } = payload
    if (Object.keys(fields).length === 0) return this.getById(id)!

    const sets = Object.keys(fields)
      .map((k) => `${k} = @${k}`)
      .join(', ')

    this.db
      .prepare(`UPDATE rescisoes SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`)
      .run({ ...fields, id })

    return this.getById(id)!
  }

  delete(id: number): void {
    const r = this.getById(id)
    if (!r) throw new Error(`Rescisão ${id} não encontrada.`)
    if (r.status !== 'rascunho')
      throw new Error('Apenas rescisões com status "rascunho" podem ser excluídas.')
    this.db.prepare('DELETE FROM rescisoes WHERE id = ?').run(id)
  }
}
