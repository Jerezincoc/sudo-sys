import { create } from 'zustand'
import type { DbType } from '@sudo-sys/shared'

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface WizardDbConfig {
  type: DbType
  connectionString: string
  testStatus: 'idle' | 'testing' | 'ok' | 'error'
  testError: string | null
  latencyMs: number | null
}

export interface WizardEmpresaData {
  razaoSocial: string
  cnpj: string
  endereco: string
  responsavel: string
}

export interface WizardState {
  currentStep: number          // 0-3
  totalSteps: number
  db: WizardDbConfig
  empresa: WizardEmpresaData
  saving: boolean
  savedOk: boolean
  saveError: string | null
}

export interface WizardActions {
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setDbType: (type: DbType) => void
  setConnectionString: (cs: string) => void
  setDbTestStatus: (status: WizardDbConfig['testStatus'], error?: string | null, latencyMs?: number | null) => void
  setEmpresa: (data: Partial<WizardEmpresaData>) => void
  setSaving: (saving: boolean) => void
  setSavedOk: (ok: boolean) => void
  setSaveError: (err: string | null) => void
  reset: () => void
}

// ── Estado inicial ─────────────────────────────────────────────────────────

const initialState: WizardState = {
  currentStep: 0,
  totalSteps: 4,
  db: {
    type: 'sqlite',
    connectionString: '',
    testStatus: 'idle',
    testError: null,
    latencyMs: null,
  },
  empresa: {
    razaoSocial: '',
    cnpj: '',
    endereco: '',
    responsavel: '',
  },
  saving: false,
  savedOk: false,
  saveError: null,
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useWizardStore = create<WizardState & WizardActions>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, s.totalSteps - 1) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

  setDbType: (type) =>
    set((s) => ({
      db: { ...s.db, type, testStatus: 'idle', testError: null, latencyMs: null },
    })),

  setConnectionString: (connectionString) =>
    set((s) => ({
      db: { ...s.db, connectionString, testStatus: 'idle', testError: null },
    })),

  setDbTestStatus: (testStatus, testError = null, latencyMs = null) =>
    set((s) => ({ db: { ...s.db, testStatus, testError, latencyMs } })),

  setEmpresa: (data) =>
    set((s) => ({ empresa: { ...s.empresa, ...data } })),

  setSaving: (saving) => set({ saving }),
  setSavedOk: (savedOk) => set({ savedOk }),
  setSaveError: (saveError) => set({ saveError }),
  reset: () => set(initialState),
}))
