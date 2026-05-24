import React from 'react'
import { FileText } from 'lucide-react'

export default function FolhaPage() {
  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
      <FileText size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Em desenvolvimento</p>
      <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 600, margin: 0 }}>Folha de Pagamento</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: 0, textAlign: 'center', maxWidth: 320 }}>
        Processamento de Folha A (CLT) e Folha B (PJ/Informal). Disponível em breve.
      </p>
    </div>
  )
}
