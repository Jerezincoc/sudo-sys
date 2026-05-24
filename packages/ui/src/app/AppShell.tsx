import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Topbar  from '@/components/layout/Topbar'

export default function AppShell() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--surface-900)',
      }}
    >
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── Coluna direita: topbar + conteúdo + status bar ─────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />

        {/* ── Área de conteúdo ─────────────────────────────────── */}
        <main
          style={{
            flex: 1,
            overflow: 'auto',
            background: 'var(--surface-900)',
          }}
        >
          <Outlet />
        </main>

        {/* ── Status bar ────────────────────────────────────────── */}
        <footer
          style={{
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            background: 'var(--brand-600)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: 11,
            flexShrink: 0,
            userSelect: 'none',
          }}
        >
          <span>SudoSys v1.0.0</span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>
            Gestão de Folha de Pagamento
          </span>
        </footer>
      </div>
    </div>
  )
}
