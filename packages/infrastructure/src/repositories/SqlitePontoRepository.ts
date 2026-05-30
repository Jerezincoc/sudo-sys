import type Database from 'better-sqlite3'
import type { RegistroPonto, CreatePontoPayload, UpdatePontoPayload, EspelhoPonto } from '@sudo-sys/shared'

export class SqlitePontoRepository {
  constructor(private db: Database.Database) {}

  list(empresaId: number, mes?: number, ano?: number, funcionarioId?: number): RegistroPonto[] {
    let sql = 'SELECT * FROM registros_ponto WHERE empresa_id = ?'
    const params: unknown[] = [empresaId]
    if (mes != null && ano != null) {
      const mesStr = String(mes).padStart(2, '0')
      sql += ` AND data LIKE '${ano}-${mesStr}-%'`
    }
    if (funcionarioId != null) {
      sql += ' AND funcionario_id = ?'
      params.push(funcionarioId)
    }
    sql += ' ORDER BY data DESC, funcionario_id ASC'
    return this.db.prepare(sql).all(...params) as RegistroPonto[]
  }

  getById(id: number): RegistroPonto | null {
    return (this.db.prepare('SELECT * FROM registros_ponto WHERE id = ?').get(id) as RegistroPonto | undefined) ?? null
  }

  create(payload: CreatePontoPayload): RegistroPonto {
    const stmt = this.db.prepare(`
      INSERT INTO registros_ponto (funcionario_id, empresa_id, data, entrada, saida_almoco,
        retorno_almoco, saida, horas_trabalhadas, horas_normais, horas_extras_50,
        horas_extras_100, horas_falta, tipo, justificativa, status)
      VALUES (@funcionario_id, @empresa_id, @data, @entrada, @saida_almoco,
        @retorno_almoco, @saida, @horas_trabalhadas, @horas_normais, @horas_extras_50,
        @horas_extras_100, @horas_falta, @tipo, @justificativa, @status)
    `)
    const info = stmt.run({
      funcionario_id:    payload.funcionario_id,
      empresa_id:        payload.empresa_id,
      data:              payload.data,
      entrada:           payload.entrada ?? null,
      saida_almoco:      payload.saida_almoco ?? null,
      retorno_almoco:    payload.retorno_almoco ?? null,
      saida:             payload.saida ?? null,
      horas_trabalhadas: payload.horas_trabalhadas ?? 0,
      horas_normais:     payload.horas_normais ?? 0,
      horas_extras_50:   payload.horas_extras_50 ?? 0,
      horas_extras_100:  payload.horas_extras_100 ?? 0,
      horas_falta:       payload.horas_falta ?? 0,
      tipo:              payload.tipo ?? 'normal',
      justificativa:     payload.justificativa ?? null,
      status:            payload.status ?? 'pendente',
    })
    return this.getById(Number(info.lastInsertRowid))!
  }

  update(payload: UpdatePontoPayload): RegistroPonto {
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const params: Record<string, unknown> = { id: payload.id }
    const cols = ['data','entrada','saida_almoco','retorno_almoco','saida',
      'horas_trabalhadas','horas_normais','horas_extras_50','horas_extras_100',
      'horas_falta','tipo','justificativa','status'] as const
    for (const col of cols) {
      if ((payload as Record<string, unknown>)[col] !== undefined) {
        fields.push(`${col} = @${col}`)
        params[col] = (payload as Record<string, unknown>)[col]
      }
    }
    this.db.prepare(`UPDATE registros_ponto SET ${fields.join(', ')} WHERE id = @id`).run(params)
    return this.getById(payload.id)!
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM registros_ponto WHERE id = ?').run(id)
  }

  espelho(empresaId: number, funcionarioId: number, mes: number, ano: number): EspelhoPonto {
    const registros = this.list(empresaId, mes, ano, funcionarioId)
    const total = registros.reduce(
      (acc, r) => ({
        total_trabalhadas: acc.total_trabalhadas + r.horas_trabalhadas,
        total_normais:     acc.total_normais + r.horas_normais,
        total_extras_50:   acc.total_extras_50 + r.horas_extras_50,
        total_extras_100:  acc.total_extras_100 + r.horas_extras_100,
        total_faltas:      acc.total_faltas + r.horas_falta,
      }),
      { total_trabalhadas: 0, total_normais: 0, total_extras_50: 0, total_extras_100: 0, total_faltas: 0 }
    )
    return { funcionario_id: funcionarioId, empresa_id: empresaId, mes, ano, registros, ...total }
  }
}
