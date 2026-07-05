import React, { useState } from 'react'
import type { FolhaCompetencia } from '@sudo-sys/shared'

interface Props {
  /** Folhas existentes da empresa — usadas para sugerir a próxima competência e avisar duplicata. */
  folhas: FolhaCompetencia[]
  onCreate: (competencia: string) => void
  onCancel: () => void
}

/** Sugere a competência seguinte à última folha, ou o mês atual se não houver folhas. */
function sugerirCompetencia(folhas: FolhaCompetencia[]): string {
  const ultima = folhas.map((f) => f.competencia).sort().pop()
  if (!ultima) {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
  const [y, m] = ultima.split('-').map(Number)
  const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 }
  return `${next.y}-${String(next.m).padStart(2, '0')}`
}

export default function CompetenciaPicker({ folhas, onCreate, onCancel }: Props) {
  const [competencia, setCompetencia] = useState(() => sugerirCompetencia(folhas))

  const duplicada = competencia !== '' && folhas.some((f) => f.competencia === competencia)

  return (
    <div style={{ padding: 8, borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', flexShrink: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
        Competência (AAAA-MM)
      </div>
      <input type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)}
        style={{ width: '100%', height: 24, fontSize: 11, border: '1px solid var(--color-border-main)',
          borderRadius: 0, padding: '0 4px', boxSizing: 'border-box', marginBottom: 6 }} />
      {duplicada && (
        <div style={{ fontSize: 10, color: '#c0392b', marginBottom: 6 }}>
          Já existe folha para esta competência.
        </div>
      )}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
        <button onClick={onCancel}
          style={{ height: 22, padding: '0 8px', fontSize: 10, border: '1px solid var(--color-border-main)',
            background: 'var(--color-bg-white)', cursor: 'pointer', borderRadius: 0 }}>
          Cancelar
        </button>
        <button onClick={() => onCreate(competencia)} disabled={!competencia || duplicada}
          style={{ height: 22, padding: '0 8px', fontSize: 10, fontWeight: 600, border: 'none',
            background: 'var(--color-brand)', color: '#fff', borderRadius: 0,
            cursor: !competencia || duplicada ? 'not-allowed' : 'pointer',
            opacity: !competencia || duplicada ? 0.5 : 1 }}>
          Criar
        </button>
      </div>
    </div>
  )
}
