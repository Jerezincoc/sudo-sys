import React from 'react'
import { Calculator } from 'lucide-react'

export default function CustosSimuladorPage() {
  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
      <Calculator size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Em desenvolvimento</p>
      <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 600, margin: 0 }}>Custo / Simulador</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: 0, textAlign: 'center', maxWidth: 320 }}>
        Simulação de custo de contratação e folha projetada. Disponível em breve.
      </p>
    </div>
  )
}
