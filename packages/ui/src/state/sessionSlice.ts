import { create } from 'zustand'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'operador' | 'visualizador'
  avatar?: string
}

interface SessionState {
  user: SessionUser | null
  setUser: (u: SessionUser) => void
  clearUser: () => void
}

export const useSessionStore = create<SessionState>()((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
  clearUser: () => set({ user: null }),
}))
