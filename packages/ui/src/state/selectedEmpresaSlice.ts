import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function currentCompetencia(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

interface SelectedEmpresaState {
  empresaId: string | null
  empresaNome: string | null
  competencia: string          // formato YYYY-MM
  setEmpresa: (id: string, nome: string) => void
  setCompetencia: (c: string) => void
  clearEmpresa: () => void
}

export const useSelectedEmpresaStore = create<SelectedEmpresaState>()(
  persist(
    (set) => ({
      empresaId: null,
      empresaNome: null,
      competencia: currentCompetencia(),
      setEmpresa: (id, nome) => set({ empresaId: id, empresaNome: nome }),
      setCompetencia: (c) => set({ competencia: c }),
      clearEmpresa: () => set({ empresaId: null, empresaNome: null }),
    }),
    { name: 'sudosys:empresa' },
  ),
)
