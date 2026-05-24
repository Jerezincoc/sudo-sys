import React from 'react'
import { Clock } from 'lucide-react'

export default function PontoPage() {
  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
      <Clock size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Em desenvolvimento</p>
      <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 600, margin: 0 }}>Ponto</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: 0, textAlign: 'center', maxWidth: 320 }}>
        Controle de jornada, batidas e espelho de ponto. Disponível em breve.
      </p>
    </div>
  )
}
