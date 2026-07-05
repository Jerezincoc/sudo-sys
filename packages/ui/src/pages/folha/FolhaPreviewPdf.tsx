import React, { useState } from 'react'

interface Props {
  folhaId: number
  /** Omitido = gera o PDF consolidado de todos os holerites da folha. */
  funcionarioId?: number
  disabled?: boolean
  /** Botão compacto de ícone (linha da tabela) ou botão com rótulo (toolbar). */
  variant?: 'toolbar' | 'icon'
  label?: string
  setStatus: (msg: string | null, type?: 'info' | 'success' | 'error') => void
}

/**
 * Gera o PDF do holerite no main process (HoleriteRenderer) e abre o
 * arquivo retornado — os PDFs nunca trafegam como Buffer para a UI.
 */
export default function FolhaPreviewPdf({ folhaId, funcionarioId, disabled, variant = 'toolbar', label, setStatus }: Props) {
  const [gerando, setGerando] = useState(false)

  async function handleGerar(e: React.MouseEvent) {
    e.stopPropagation()
    if (!window.electronAPI || gerando) return
    setGerando(true)
    try {
      const res = await window.electronAPI.gerarHolerite({ folhaId, funcionarioId })
      if (!res.success) { setStatus(res.error, 'error'); return }
      await window.electronAPI.openPath(res.data.filePath)
      setStatus('Holerite gerado.', 'success')
    } finally {
      setGerando(false)
    }
  }

  if (variant === 'icon') {
    return (
      <button onClick={handleGerar} disabled={disabled || gerando} title="Imprimir holerite"
        style={{ width: 20, height: 18, fontSize: 10, border: 'none', background: 'transparent',
          cursor: 'pointer', color: 'var(--color-text-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        🖨
      </button>
    )
  }

  return (
    <button onClick={handleGerar} disabled={disabled || gerando}
      style={{ height: 22, padding: '0 10px', fontSize: 11, border: '1px solid var(--color-border-main)',
        background: 'var(--color-bg-white)', color: 'var(--color-text-primary)', cursor: 'pointer', borderRadius: 0 }}>
      {gerando ? 'Gerando…' : (label ?? '🖨 Imprimir Todos')}
    </button>
  )
}
