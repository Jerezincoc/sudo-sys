import { ipcMain } from 'electron'
import crypto from 'crypto'
import { getDb } from '../../db/database'
import { SqliteUsuarioRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteUsuarioRepository'
import { SimplePasswordHasher } from '@sudo-sys/infrastructure/src/auth/Argon2PasswordHasher'
import type { Usuario, LoginPayload } from '@sudo-sys/shared'

function repo() {
  return new SqliteUsuarioRepository(getDb())
}

function sanitize(u: Usuario): Usuario {
  const { ...safe } = u as Usuario & { senha_hash?: string }
  delete safe.senha_hash
  return safe
}

const hasher = new SimplePasswordHasher()

// token → usuario em memória (válido enquanto o processo estiver vivo)
const tokenMap = new Map<string, Usuario>()

export async function registerAuthHandlers(): Promise<void> {
  // Substituir hash placeholder do admin seed pelo hash real de admin123
  const r = repo()
  const adminUser = r.findByEmail('admin@sudosys.local')
  if (adminUser) {
    const currentHash = r.getSenhaHash(adminUser.id) ?? ''
    if (currentHash.startsWith('$argon2id$')) {
      const hash = await hasher.hash('admin123')
      r.updateSenha(adminUser.id, hash)
    }
  }

  // ── auth:login ───────────────────────────────────────────────────
  ipcMain.handle('auth:login', async (_e, payload: LoginPayload) => {
    try {
      const r2 = repo()
      const user = r2.findByEmail(payload.email)
      if (!user || !user.ativo) {
        return { success: false, error: 'Usuário não encontrado ou inativo.' }
      }

      const senhaHash = r2.getSenhaHash(user.id)
      if (!senhaHash) return { success: false, error: 'Credenciais inválidas.' }

      const ok = await hasher.verify(payload.senha, senhaHash)
      if (!ok) return { success: false, error: 'Senha incorreta.' }

      r2.updateUltimoLogin(user.id)
      const token = crypto.randomUUID()
      const updated = r2.getById(user.id)!
      tokenMap.set(token, updated)

      return { success: true, usuario: sanitize(updated), token }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── auth:logout ──────────────────────────────────────────────────
  ipcMain.handle('auth:logout', (_e, token: string) => {
    if (token) tokenMap.delete(token)
    return { success: true }
  })

  // ── auth:register ────────────────────────────────────────────────
  ipcMain.handle('auth:register', async (_e, payload: {
    nome: string
    email: string
    senha: string
    papel: string
    requestingToken: string
  }) => {
    try {
      const requester = tokenMap.get(payload.requestingToken)
      if (!requester || requester.papel !== 'admin') {
        return { success: false, error: 'Apenas administradores podem criar usuários.' }
      }

      const senha_hash = await hasher.hash(payload.senha)
      const user = repo().create({
        nome: payload.nome,
        email: payload.email,
        senha_hash,
        papel: payload.papel,
      })
      return { success: true, usuario: sanitize(user) }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return { success: false, error: msg.includes('UNIQUE') ? 'E-mail já cadastrado.' : msg }
    }
  })

  // ── auth:me ──────────────────────────────────────────────────────
  ipcMain.handle('auth:me', (_e, token: string) => {
    const user = tokenMap.get(token)
    return user ? sanitize(user) : null
  })

  // ── usuario:list ─────────────────────────────────────────────────
  ipcMain.handle('usuario:list', (_e) => {
    try {
      const users = repo().list()
      return { success: true, data: users.map(sanitize) }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── usuario:create ───────────────────────────────────────────────
  ipcMain.handle('usuario:create', async (_e, payload: {
    nome: string
    email: string
    senha: string
    papel: string
  }) => {
    try {
      const senha_hash = await hasher.hash(payload.senha)
      const user = repo().create({
        nome: payload.nome,
        email: payload.email,
        senha_hash,
        papel: payload.papel,
      })
      return { success: true, usuario: sanitize(user) }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return { success: false, error: msg.includes('UNIQUE') ? 'E-mail já cadastrado.' : msg }
    }
  })

  // ── usuario:delete ───────────────────────────────────────────────
  ipcMain.handle('usuario:delete', (_e, id: number) => {
    try {
      repo().softDelete(id)
      return { success: true }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
