import type Database from 'better-sqlite3'
import type {
  RelatorioPersonalizado,
  CreateRelatorioPayload,
  UpdateRelatorioPayload,
  CampoSintetico,
} from '@sudo-sys/shared'

type RelatorioRow = Omit<RelatorioPersonalizado, 'campos'> & { campos: string }

function deserialize(row: RelatorioRow): RelatorioPersonalizado {
  let campos: CampoSintetico[] = []
  try { campos = JSON.parse(row.campos) } catch { campos = [] }
  return { ...row, campos }
}

export class SqliteRelatorioRepository {
  constructor(private db: Database.Database) {}

  list(empresaId?: number): RelatorioPersonalizado[] {
    let rows: RelatorioRow[]
    if (empresaId != null) {
      rows = this.db
        .prepare('SELECT * FROM relatorios_personalizados WHERE empresa_id = ? OR empresa_id IS NULL ORDER BY nome')
        .all(empresaId) as RelatorioRow[]
    } else {
      rows = this.db
        .prepare('SELECT * FROM relatorios_personalizados ORDER BY nome')
        .all() as RelatorioRow[]
    }
    return rows.map(deserialize)
  }

  getById(id: number): RelatorioPersonalizado | null {
    const row = this.db
      .prepare('SELECT * FROM relatorios_personalizados WHERE id = ?')
      .get(id) as RelatorioRow | undefined
    return row ? deserialize(row) : null
  }

  create(payload: CreateRelatorioPayload): RelatorioPersonalizado {
    const stmt = this.db.prepare(`
      INSERT INTO relatorios_personalizados (nome, descricao, modo, campos, cabecalho, empresa_id)
      VALUES (@nome, @descricao, @modo, @campos, @cabecalho, @empresa_id)
    `)
    const info = stmt.run({
      nome:       payload.nome,
      descricao:  payload.descricao ?? null,
      modo:       payload.modo,
      campos:     JSON.stringify(payload.campos ?? []),
      cabecalho:  payload.cabecalho ?? null,
      empresa_id: payload.empresa_id ?? null,
    })
    return this.getById(Number(info.lastInsertRowid))!
  }

  update(payload: UpdateRelatorioPayload): RelatorioPersonalizado {
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const params: Record<string, unknown> = { id: payload.id }

    if (payload.nome !== undefined)       { fields.push('nome = @nome');             params.nome = payload.nome }
    if (payload.descricao !== undefined)  { fields.push('descricao = @descricao');   params.descricao = payload.descricao }
    if (payload.modo !== undefined)       { fields.push('modo = @modo');             params.modo = payload.modo }
    if (payload.campos !== undefined)     { fields.push('campos = @campos');         params.campos = JSON.stringify(payload.campos) }
    if (payload.cabecalho !== undefined)  { fields.push('cabecalho = @cabecalho');   params.cabecalho = payload.cabecalho }
    if (payload.empresa_id !== undefined) { fields.push('empresa_id = @empresa_id'); params.empresa_id = payload.empresa_id }

    this.db.prepare(`UPDATE relatorios_personalizados SET ${fields.join(', ')} WHERE id = @id`).run(params)
    return this.getById(payload.id)!
  }

  delete(id: number): void {
    this.db.prepare('DELETE FROM relatorios_personalizados WHERE id = ?').run(id)
  }
}
