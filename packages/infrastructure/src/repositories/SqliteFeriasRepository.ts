import type Database from 'better-sqlite3'
import type { Ferias, CreateFeriasPayload, UpdateFeriasPayload } from '@sudo-sys/shared'

export class SqliteFeriasRepository {
  constructor(private db: Database.Database) {}

  list(empresaId: number): Ferias[] {
    return this.db
      .prepare('SELECT * FROM ferias WHERE empresa_id = ? ORDER BY inicio_gozo DESC')
      .all(empresaId) as Ferias[]
  }

  listByFuncionario(funcionarioId: number): Ferias[] {
    return this.db
      .prepare('SELECT * FROM ferias WHERE funcionario_id = ? ORDER BY inicio_gozo DESC')
      .all(funcionarioId) as Ferias[]
  }

  getById(id: number): Ferias | null {
    return (this.db.prepare('SELECT * FROM ferias WHERE id = ?').get(id) as Ferias | undefined) ?? null
  }

  create(payload: CreateFeriasPayload): Ferias {
    const stmt = this.db.prepare(`
      INSERT INTO ferias (funcionario_id, empresa_id, periodo_inicio, periodo_fim,
        inicio_gozo, fim_gozo, dias_concedidos, dias_abono, adiantamento_13,
        salario_referencia, valor_ferias, valor_abono, valor_adiantamento_13,
        valor_total, status, observacao)
      VALUES (@funcionario_id, @empresa_id, @periodo_inicio, @periodo_fim,
        @inicio_gozo, @fim_gozo, @dias_concedidos, @dias_abono, @adiantamento_13,
        @salario_referencia, @valor_ferias, @valor_abono, @valor_adiantamento_13,
        @valor_total, @status, @observacao)
    `)
    const info = stmt.run({
      funcionario_id:        payload.funcionario_id,
      empresa_id:            payload.empresa_id,
      periodo_inicio:        payload.periodo_inicio,
      periodo_fim:           payload.periodo_fim,
      inicio_gozo:           payload.inicio_gozo,
      fim_gozo:              payload.fim_gozo,
      dias_concedidos:       payload.dias_concedidos,
      dias_abono:            payload.dias_abono ?? 0,
      adiantamento_13:       payload.adiantamento_13 ?? 0,
      salario_referencia:    payload.salario_referencia ?? 0,
      valor_ferias:          payload.valor_ferias ?? 0,
      valor_abono:           payload.valor_abono ?? 0,
      valor_adiantamento_13: payload.valor_adiantamento_13 ?? 0,
      valor_total:           payload.valor_total ?? 0,
      status:                payload.status ?? 'agendada',
      observacao:            payload.observacao ?? null,
    })
    return this.getById(Number(info.lastInsertRowid))!
  }

  update(payload: UpdateFeriasPayload): Ferias {
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const params: Record<string, unknown> = { id: payload.id }
    const cols = ['periodo_inicio','periodo_fim','inicio_gozo','fim_gozo','dias_concedidos',
      'dias_abono','adiantamento_13','salario_referencia','valor_ferias','valor_abono',
      'valor_adiantamento_13','valor_total','status','observacao'] as const
    for (const col of cols) {
      if ((payload as Record<string, unknown>)[col] !== undefined) {
        fields.push(`${col} = @${col}`)
        params[col] = (payload as Record<string, unknown>)[col]
      }
    }
    this.db.prepare(`UPDATE ferias SET ${fields.join(', ')} WHERE id = @id`).run(params)
    return this.getById(payload.id)!
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM ferias WHERE id = ?').run(id)
  }
}
