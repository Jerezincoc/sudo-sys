import React, { useState } from 'react'

interface Props {
  empresaId: number
  /** Espelho é individual — sem funcionário selecionado o botão fica desabilitado. */
  funcionarioId: number | undefined
  mes: number
  ano: number
  setStatus: (msg: string | null, type?: 'info' | 'success' | 'error') => void
}

/**
 * Gera o espelho de ponto mensal do funcionário no main process
 * (EspelhoPontoRenderer) e abre o PDF retornado.
 */
export default function EspelhoPreviewPdf({ empresaId, funcionarioId, mes, ano, setStatus }: Props) {
  const [gerando, setGerando] = useState(false)

  async function handleGerar() {
    if (!window.electronAPI || funcionarioId == null || gerando) return
    setGerando(true)
    try {
      const res = await window.electronAPI.gerarEspelhoPdf({ empresaId, funcionarioId, mes, ano })
      if (!res.success) { setStatus(res.error, 'error'); return }
      await window.electronAPI.openPath(res.data.filePath)
      setStatus('Espelho de ponto gerado.', 'success')
    } finally {
      setGerando(false)
    }
  }

  const habilitado = funcionarioId != null && !gerando

  return (
    <button onClick={handleGerar} disabled={!habilitado}
      title={funcionarioId == null ? 'Selecione um funcionário para gerar o espelho' : 'Gerar espelho de ponto em PDF'}
      style={{ height: 20, padding: '0 8px', fontSize: 10, border: '1px solid var(--color-border-main)',
        background: 'var(--color-bg-white)', color: habilitado ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
        cursor: habilitado ? 'pointer' : 'not-allowed', borderRadius: 0 }}>
      {gerando ? 'Gerando…' : '🖨 Espelho PDF'}
    </button>
  )
}
