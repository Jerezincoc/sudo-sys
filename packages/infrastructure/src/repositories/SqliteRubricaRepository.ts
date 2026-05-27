/**
 * SqliteRubricaRepository.ts
 * Implementação SQLite do repositório de Rubricas.
 * Recebe a instância já aberta do banco (singleton do app-host).
 */
import type Database from 'better-sqlite3'
import type { Rubrica, CreateRubricaPayload, UpdateRubricaPayload } from '@sudo-sys/shared'

export class SqliteRubricaRepository {
  constructor(private db: Database.Database) {}

  /**
   * Lista rubricas globais (empresa_id IS NULL) + as da empresa informada.
   * Se empresaId for null/undefined, retorna todas.
   */
  list(empresaId?: number | null): Rubrica[] {
    if (empresaId != null) {
      return this.db
        .prepare(
          `SELECT * FROM rubricas
           WHERE empresa_id IS NULL OR empresa_id = ?
           ORDER BY codigo`,
        )
        .all(empresaId) as Rubrica[]
    }
    return this.db
      .prepare('SELECT * FROM rubricas ORDER BY codigo')
      .all() as Rubrica[]
  }

  getById(id: number): Rubrica | null {
    return (
      (this.db.prepare('SELECT * FROM rubricas WHERE id = ?').get(id) as Rubrica | undefined) ?? null
    )
  }

  /**
   * Próximo código disponível para uma empresa (sequencial 4 dígitos).
   * Considera apenas rubricas da empresa (não globais).
   */
  nextCodigo(empresaId?: number | null): string {
    const row = empresaId != null
      ? this.db
          .prepare(
            'SELECT MAX(CAST(codigo AS INTEGER)) as max_code FROM rubricas WHERE empresa_id = ?',
          )
          .get(empresaId) as { max_code: number | null }
      : this.db
          .prepare(
            'SELECT MAX(CAST(codigo AS INTEGER)) as max_code FROM rubricas',
          )
          .get() as { max_code: number | null }
    const next = (row.max_code ?? 0) + 1
    return String(next).padStart(4, '0')
  }

  create(payload: CreateRubricaPayload): Rubrica {
    const stmt = this.db.prepare(`
      INSERT INTO rubricas (
        empresa_id, codigo, nome, tipo, natureza,
        incide_inss, incide_irrf, incide_fgts,
        modo_valor, valor_fixo, percentual, formula,
        referencia, observacao, ativo
      ) VALUES (
        @empresa_id, @codigo, @nome, @tipo, @natureza,
        @incide_inss, @incide_irrf, @incide_fgts,
        @modo_valor, @valor_fixo, @percentual, @formula,
        @referencia, @observacao, @ativo
      )
    `)

    const result = stmt.run({
      empresa_id:  payload.empresa_id  ?? null,
      codigo:      payload.codigo,
      nome:        payload.nome,
      tipo:        payload.tipo,
      natureza:    payload.natureza    ?? 'normal',
      incide_inss: payload.incide_inss ?? 1,
      incide_irrf: payload.incide_irrf ?? 1,
      incide_fgts: payload.incide_fgts ?? 1,
      modo_valor:  payload.modo_valor  ?? 'fixo',
      valor_fixo:  payload.valor_fixo  ?? null,
      percentual:  payload.percentual  ?? null,
      formula:     payload.formula     ?? null,
      referencia:  payload.referencia  ?? null,
      observacao:  payload.observacao  ?? null,
      ativo:       payload.ativo       ?? 1,
    })

    return this.getById(Number(result.lastInsertRowid))!
  }

  update(payload: UpdateRubricaPayload): Rubrica {
    const { id, ...fields } = payload
    if (Object.keys(fields).length === 0) return this.getById(id)!

    const sets = Object.keys(fields)
      .map((k) => `${k} = @${k}`)
      .join(', ')

    this.db
      .prepare(
        `UPDATE rubricas SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`,
      )
      .run({ ...fields, id })

    return this.getById(id)!
  }

  softDelete(id: number): void {
    this.db
      .prepare(
        'UPDATE rubricas SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      )
      .run(id)
  }

  /**
   * Lógica dupla de exclusão:
   * - ativo = 1 → soft-delete (ativo = 0) → action: 'inativado'
   * - ativo = 0 → hard-delete (DELETE)     → action: 'excluido'
   *
   * Rejeita rubricas globais (empresa_id IS NULL) — não deletáveis.
   */
  deleteOrPermanent(id: number): { action: 'inativado' | 'excluido' } {
    const rub = this.getById(id)
    if (!rub) throw new Error(`Rubrica ${id} não encontrada.`)
    if (rub.empresa_id == null) throw new Error('Rubricas globais não podem ser excluídas.')

    if (rub.ativo === 1) {
      this.db
        .prepare('UPDATE rubricas SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(id)
      return { action: 'inativado' }
    }

    this.db.prepare('DELETE FROM rubricas WHERE id = ?').run(id)
    return { action: 'excluido' }
  }
}
