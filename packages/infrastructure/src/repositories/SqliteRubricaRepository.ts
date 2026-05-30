import type Database from 'better-sqlite3'
import type { Rubrica, CreateRubricaPayload, UpdateRubricaPayload } from '@sudo-sys/shared'

export class SqliteRubricaRepository {
  constructor(private db: Database.Database) {}

  list(empresaId?: number): Rubrica[] {
    if (empresaId != null) {
      return this.db
        .prepare('SELECT * FROM rubricas WHERE empresa_id = ? OR empresa_id IS NULL ORDER BY codigo')
        .all(empresaId) as Rubrica[]
    }
    return this.db.prepare('SELECT * FROM rubricas ORDER BY codigo').all() as Rubrica[]
  }

  getById(id: number): Rubrica | null {
    return (this.db.prepare('SELECT * FROM rubricas WHERE id = ?').get(id) as Rubrica | undefined) ?? null
  }

  create(payload: CreateRubricaPayload): Rubrica {
    const stmt = this.db.prepare(`
      INSERT INTO rubricas (empresa_id, codigo, nome, tipo, modo_valor, valor, percentual, formula,
        incide_inss, incide_irrf, incide_fgts, incide_ferias, incide_13, ativo)
      VALUES (@empresa_id, @codigo, @nome, @tipo, @modo_valor, @valor, @percentual, @formula,
        @incide_inss, @incide_irrf, @incide_fgts, @incide_ferias, @incide_13, @ativo)
    `)
    const info = stmt.run({
      empresa_id:    payload.empresa_id ?? null,
      codigo:        payload.codigo,
      nome:          payload.nome,
      tipo:          payload.tipo,
      modo_valor:    payload.modo_valor,
      valor:         payload.valor ?? 0,
      percentual:    payload.percentual ?? 0,
      formula:       payload.formula ?? null,
      incide_inss:   payload.incide_inss ?? 0,
      incide_irrf:   payload.incide_irrf ?? 0,
      incide_fgts:   payload.incide_fgts ?? 0,
      incide_ferias: payload.incide_ferias ?? 0,
      incide_13:     payload.incide_13 ?? 0,
      ativo:         payload.ativo ?? 1,
    })
    return this.getById(Number(info.lastInsertRowid))!
  }

  update(payload: UpdateRubricaPayload): Rubrica {
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const params: Record<string, unknown> = { id: payload.id }
    const cols = ['codigo','nome','tipo','modo_valor','valor','percentual','formula',
      'incide_inss','incide_irrf','incide_fgts','incide_ferias','incide_13','ativo'] as const
    for (const col of cols) {
      if ((payload as Record<string, unknown>)[col] !== undefined) {
        fields.push(`${col} = @${col}`)
        params[col] = (payload as Record<string, unknown>)[col]
      }
    }
    this.db.prepare(`UPDATE rubricas SET ${fields.join(', ')} WHERE id = @id`).run(params)
    return this.getById(payload.id)!
  }

  deleteOrDeactivate(id: number): { action: 'desativada' | 'excluida' } {
    const row = this.getById(id)
    if (!row) throw new Error(`Rubrica ${id} não encontrada.`)
    if (row.ativo === 1) {
      this.db.prepare('UPDATE rubricas SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id)
      return { action: 'desativada' }
    }
    this.db.prepare('DELETE FROM rubricas WHERE id = ?').run(id)
    return { action: 'excluida' }
  }
}
