import React from 'react'
import { Zap } from 'lucide-react'

export default function QuickCalcPage() {
  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
      <Zap size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Em desenvolvimento</p>
      <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 600, margin: 0 }}>QuickCalc</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: 0, textAlign: 'center', maxWidth: 320 }}>
        Cálculo avulso rápido de holerite sem vínculo com folha. Disponível em breve.
      </p>
    </div>
  )
}
