import { create } from 'zustand'

export interface PageActions {
  onNew?: () => void
  onDelete?: () => void
  onEdit?: () => void
  onRefresh?: () => void
  total?: number
  current?: number
}

const _refs: Required<Pick<PageActions, 'onNew' | 'onDelete' | 'onEdit' | 'onRefresh'>> = {
  onNew: () => {},
  onDelete: () => {},
  onEdit: () => {},
  onRefresh: () => {},
}

export const pageActionRefs = _refs

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

  setActions: (a) => {
    _refs.onNew     = a.onNew     ?? (() => {})
    _refs.onDelete  = a.onDelete  ?? (() => {})
    _refs.onEdit    = a.onEdit    ?? (() => {})
    _refs.onRefresh = a.onRefresh ?? (() => {})
    set({ actions: a })
  },

  clearActions: () => {
    _refs.onNew     = () => {}
    _refs.onDelete  = () => {}
    _refs.onEdit    = () => {}
    _refs.onRefresh = () => {}
    set({ actions: {} })
  },

  setStatus: (msg, type = 'info') => set({ statusMessage: msg, statusType: type }),
}))
