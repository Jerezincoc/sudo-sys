import { create } from 'zustand'
import type { Usuario } from '@sudo-sys/shared'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'operador' | 'visualizador'
  avatar?: string
}

interface SessionState {
  user: SessionUser | null
  token: string | null
  setUser: (u: SessionUser, token: string) => void
  clearUser: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  user: null,
  token: null,
  setUser: (u, token) => set({ user: u, token }),
  clearUser: () => set({ user: null, token: null }),
}))

export function usuarioToSessionUser(u: Usuario): SessionUser {
  return {
    id: String(u.id),
    name: u.nome,
    email: u.email,
    role: u.papel as SessionUser['role'],
  }
}
