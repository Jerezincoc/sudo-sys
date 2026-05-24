import React from 'react'
import { Settings } from 'lucide-react'

export default function AdminPage() {
  return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
      <Settings size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
      <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Em desenvolvimento</p>
      <h2 style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 600, margin: 0 }}>Administração</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: 0, textAlign: 'center', maxWidth: 320 }}>
        Usuários, perfis de acesso, logs de auditoria e tabelas internas. Disponível em breve.
      </p>
    </div>
  )
}
