/**
 * pageActionsSlice.ts
 * Estado global para os botões da ActionToolbar do AppShell.
 * Cada página registra seus callbacks via setActions() no mount.
 */
import { create } from 'zustand'

export interface PageActions {
  onNew?: () => void
  onDelete?: () => void
  onEdit?: () => void
  onRefresh?: () => void
  total?: number
  current?: number
}

interface PageActionsState {
  actions: PageActions
  statusMessage: string | null
  statusType: 'info' | 'success' | 'error'
  setActions: (a: PageActions) => void
  clearActions: () => void
  setStatus: (msg: string | null, type?: 'info' | 'success' | 'error') => void
}

export const usePageActionsStore = create<PageActionsState>((set) => ({
  actions: {},
  statusMessage: null,
  statusType: 'info',
  setActions: (a) => set({ actions: a }),
  clearActions: () => set({ actions: {} }),
  setStatus: (msg, type = 'info') => set({ statusMessage: msg, statusType: type }),
}))
