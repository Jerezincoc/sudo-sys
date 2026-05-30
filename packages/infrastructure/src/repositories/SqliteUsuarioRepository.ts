import type Database from 'better-sqlite3'
import type { Usuario } from '@sudo-sys/shared'

interface CreatePayload {
  nome: string
  email: string
  senha_hash: string
  papel?: string
}

interface UpdatePayload {
  id: number
  nome?: string
  email?: string
  papel?: string
  ativo?: number
}

export class SqliteUsuarioRepository {
  constructor(private db: Database.Database) {}

  findByEmail(email: string): Usuario | null {
    return (
      (this.db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email) as Usuario | undefined) ?? null
    )
  }

  getById(id: number): Usuario | null {
    return (
      (this.db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id) as Usuario | undefined) ?? null
    )
  }

  list(): Usuario[] {
    return this.db.prepare('SELECT * FROM usuarios ORDER BY nome').all() as Usuario[]
  }

  create(payload: CreatePayload): Usuario {
    const stmt = this.db.prepare(`
      INSERT INTO usuarios (nome, email, senha_hash, papel)
      VALUES (@nome, @email, @senha_hash, @papel)
    `)
    const info = stmt.run({
      nome: payload.nome,
      email: payload.email,
      senha_hash: payload.senha_hash,
      papel: payload.papel ?? 'operador',
    })
    return this.getById(Number(info.lastInsertRowid))!
  }

  update(payload: UpdatePayload): Usuario {
    const fields: string[] = ['updated_at = CURRENT_TIMESTAMP']
    const params: Record<string, unknown> = { id: payload.id }
    if (payload.nome    !== undefined) { fields.push('nome = @nome');   params['nome']   = payload.nome }
    if (payload.email   !== undefined) { fields.push('email = @email'); params['email']  = payload.email }
    if (payload.papel   !== undefined) { fields.push('papel = @papel'); params['papel']  = payload.papel }
    if (payload.ativo   !== undefined) { fields.push('ativo = @ativo'); params['ativo']  = payload.ativo }
    this.db.prepare(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = @id`).run(params)
    return this.getById(payload.id)!
  }

  updateUltimoLogin(id: number): void {
    this.db.prepare(`UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(id)
  }

  updateSenha(id: number, senha_hash: string): void {
    this.db.prepare(`UPDATE usuarios SET senha_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(senha_hash, id)
  }

  softDelete(id: number): void {
    this.db.prepare(`UPDATE usuarios SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(id)
  }

  getSenhaHash(id: number): string | null {
    const row = this.db.prepare('SELECT senha_hash FROM usuarios WHERE id = ?').get(id) as { senha_hash: string } | undefined
    return row?.senha_hash ?? null
  }
}
