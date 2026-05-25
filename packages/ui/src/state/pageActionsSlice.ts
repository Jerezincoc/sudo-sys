import { create } from 'zustand'

export interface PageActions {
  onNew?: () => void
  onDelete?: () => void
  onEdit?: () => void
  onRefresh?: () => void
  // Exportação / impressão — implementação real por página
  onExportCsv?: () => void
  onExportJson?: () => void
  onExportPdf?: () => void
  onPrint?: () => void
  onPreview?: () => void
  total?: number
  current?: number
}

type ActionRefs = Required<Pick<
  PageActions,
  'onNew' | 'onDelete' | 'onEdit' | 'onRefresh' |
  'onExportCsv' | 'onExportJson' | 'onExportPdf' | 'onPrint' | 'onPreview'
>>

const _refs: ActionRefs = {
  onNew:        () => {},
  onDelete:     () => {},
  onEdit:       () => {},
  onRefresh:    () => {},
  onExportCsv:  () => {},
  onExportJson: () => {},
  onExportPdf:  () => {},
  onPrint:      () => {},
  onPreview:    () => {},
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

const noop = () => {}

export const usePageActionsStore = create<PageActionsState>((set) => ({
  actions: {},
  statusMessage: null,
  statusType: 'info',

  setActions: (a) => {
    _refs.onNew        = a.onNew        ?? noop
    _refs.onDelete     = a.onDelete     ?? noop
    _refs.onEdit       = a.onEdit       ?? noop
    _refs.onRefresh    = a.onRefresh    ?? noop
    _refs.onExportCsv  = a.onExportCsv  ?? noop
    _refs.onExportJson = a.onExportJson ?? noop
    _refs.onExportPdf  = a.onExportPdf  ?? noop
    _refs.onPrint      = a.onPrint      ?? noop
    _refs.onPreview    = a.onPreview    ?? noop
    set({ actions: a })
  },

  clearActions: () => {
    _refs.onNew        = noop
    _refs.onDelete     = noop
    _refs.onEdit       = noop
    _refs.onRefresh    = noop
    _refs.onExportCsv  = noop
    _refs.onExportJson = noop
    _refs.onExportPdf  = noop
    _refs.onPrint      = noop
    _refs.onPreview    = noop
    set({ actions: {} })
  },

  setStatus: (msg, type = 'info') => set({ statusMessage: msg, statusType: type }),
}))
