/**
 * ConfirmDialog.tsx
 * Modal de confirmação genérico — estilo TOTVS RM.
 * Uso: monte condicionalmente com onConfirm / onCancel.
 */
import React, { useEffect } from 'react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  /** Quando true, o botão de confirmação fica vermelho (ação destrutiva). */
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  // Fechar com Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') onConfirm()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel, onConfirm])

  return (
    /* Overlay */
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      {/* Modal — stop propagation so click inside não fecha */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          background: 'var(--color-bg-white)',
          border: '1px solid var(--color-border-main)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{
          height: 28,
          background: danger ? '#c0392b' : 'var(--color-brand)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          flexShrink: 0,
        }}>
          <span style={{
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}>
            {title}
          </span>
        </div>

        {/* Body */}
        <div style={{
          padding: '18px 14px',
          fontSize: 12,
          color: 'var(--color-text-primary)',
          lineHeight: 1.6,
          minHeight: 60,
        }}>
          {message}
        </div>

        {/* Footer */}
        <div style={{
          height: 36,
          flexShrink: 0,
          background: 'var(--color-bg-panel)',
          borderTop: '1px solid var(--color-border-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 8px',
          gap: 6,
        }}>
          <button
            onClick={onCancel}
            style={dlgBtn('secondary')}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={dlgBtn(danger ? 'danger' : 'primary')}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function dlgBtn(variant: 'primary' | 'secondary' | 'danger'): React.CSSProperties {
  const bg =
    variant === 'danger'    ? '#c0392b' :
    variant === 'primary'   ? 'var(--color-brand)' :
                              'var(--color-bg-white)'
  return {
    height: 24,
    padding: '0 16px',
    fontSize: 12,
    fontWeight: 500,
    border: '1px solid var(--color-border-main)',
    background: bg,
    color: variant === 'secondary' ? 'var(--color-text-primary)' : '#fff',
    cursor: 'pointer',
    borderRadius: 0,
  }
}
