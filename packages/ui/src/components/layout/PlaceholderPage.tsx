import React from 'react'

interface Props {
  module: string
  name: string
}

export default function PlaceholderPage({ module, name }: Props) {
  return (
    <div style={{ padding: 8 }}>
      <div style={{
        marginBottom: 8,
        paddingBottom: 4,
        borderBottom: '1px solid var(--color-border-main)',
      }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
          {module}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {name}
        </div>
      </div>

      <div style={{
        background: 'var(--color-bg-white)',
        border: '1px solid var(--color-border-main)',
        padding: '16px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 2,
          height: 32,
          background: 'var(--color-brand)',
          flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>
            EM DESENVOLVIMENTO
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            O módulo <strong style={{ color: 'var(--color-text-primary)' }}>{name}</strong> está
            em desenvolvimento e será disponibilizado em versão futura.
          </div>
        </div>
      </div>
    </div>
  )
}
