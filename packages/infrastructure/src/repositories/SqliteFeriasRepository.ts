/**
 * SqliteFeriasRepository.ts
 * Implementação SQLite do repositório de Férias.
 */
import type Database from 'better-sqlite3'
import type { Ferias, CreateFeriasPayload, UpdateFeriasPayload } from '@sudo-sys/shared'

export class SqliteFeriasRepository {
  constructor(private db: Database.Database) {}

  listByEmpresa(empresaId: number): Ferias[] {
    return this.db
      .prepare('SELECT * FROM ferias WHERE empresa_id = ? ORDER BY data_inicio_gozo DESC')
      .all(empresaId) as Ferias[]
  }

  listByFuncionario(funcionarioId: number): Ferias[] {
    return this.db
      .prepare('SELECT * FROM ferias WHERE funcionario_id = ? ORDER BY data_inicio_gozo DESC')
      .all(funcionarioId) as Ferias[]
  }

  getById(id: number): Ferias | null {
    return (
      (this.db.prepare('SELECT * FROM ferias WHERE id = ?').get(id) as Ferias | undefined) ?? null
    )
  }

  create(payload: CreateFeriasPayload): Ferias {
    const stmt = this.db.prepare(`
      INSERT INTO ferias (
        funcionario_id, empresa_id,
        periodo_aquisitivo_inicio, periodo_aquisitivo_fim,
        data_inicio_gozo, data_fim_gozo,
        dias_direito, dias_concedidos, dias_abono,
        adiantamento_13, salario_referencia,
        valor_ferias, valor_abono, valor_total,
        status, observacao
      ) VALUES (
        @funcionario_id, @empresa_id,
        @periodo_aquisitivo_inicio, @periodo_aquisitivo_fim,
        @data_inicio_gozo, @data_fim_gozo,
        @dias_direito, @dias_concedidos, @dias_abono,
        @adiantamento_13, @salario_referencia,
        @valor_ferias, @valor_abono, @valor_total,
        @status, @observacao
      )
    `)

    const result = stmt.run({
      funcionario_id:             payload.funcionario_id,
      empresa_id:                 payload.empresa_id,
      periodo_aquisitivo_inicio:  payload.periodo_aquisitivo_inicio,
      periodo_aquisitivo_fim:     payload.periodo_aquisitivo_fim,
      data_inicio_gozo:           payload.data_inicio_gozo,
      data_fim_gozo:              payload.data_fim_gozo,
      dias_direito:               payload.dias_direito       ?? 30,
      dias_concedidos:            payload.dias_concedidos,
      dias_abono:                 payload.dias_abono         ?? 0,
      adiantamento_13:            payload.adiantamento_13    ?? 0,
      salario_referencia:         payload.salario_referencia,
      valor_ferias:               payload.valor_ferias       ?? null,
      valor_abono:                payload.valor_abono        ?? null,
      valor_total:                payload.valor_total        ?? null,
      status:                     payload.status             ?? 'agendada',
      observacao:                 payload.observacao         ?? null,
    })

    return this.getById(Number(result.lastInsertRowid))!
  }

  update(payload: UpdateFeriasPayload): Ferias {
    const { id, ...fields } = payload
    if (Object.keys(fields).length === 0) return this.getById(id)!

    const sets = Object.keys(fields)
      .map((k) => `${k} = @${k}`)
      .join(', ')

    this.db
      .prepare(
        `UPDATE ferias SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`,
      )
      .run({ ...fields, id })

    return this.getById(id)!
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM ferias WHERE id = ?').run(id)
  }
}
