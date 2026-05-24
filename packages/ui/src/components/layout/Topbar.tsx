import React from 'react'
import { Sun, Moon, User, ChevronDown, Menu } from 'lucide-react'
import { useTheme } from '@/app/theme/ThemeContext'
import { useUiStore } from '@/state/uiSlice'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import { useSessionStore } from '@/state/sessionSlice'

function CompetenciaLabel({ value }: { value: string }) {
  const [year, month] = value.split('-')
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ]
  const monthName = months[parseInt(month, 10) - 1] ?? month
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {monthName}/{year}
    </span>
  )
}

export default function Topbar() {
  const { theme, toggle } = useTheme()
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const { empresaNome, competencia } = useSelectedEmpresaStore()
  const user = useSessionStore((s) => s.user)

  return (
    <header
      style={{
        height: 48,
        flexShrink: 0,
        background: 'var(--topbar-bg)',
        borderBottom: '1px solid var(--topbar-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8,
        zIndex: 20,
      }}
    >
      {/* Hamburger */}
      <button
        onClick={toggleSidebar}
        style={btnStyle}
        title="Menu"
      >
        <Menu size={18} />
      </button>

      {/* ── Centro: empresa + competência ─────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--surface-700)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 500,
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-600)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-700)'
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>
            {empresaNome ?? 'Nenhuma empresa selecionada'}
          </span>
          <span
            style={{
              width: 1,
              height: 14,
              background: 'var(--border)',
              flexShrink: 0,
            }}
          />
          <span style={{ color: 'var(--brand-500)', fontVariantNumeric: 'tabular-nums' }}>
            <CompetenciaLabel value={competencia} />
          </span>
          <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* ── Direita: theme toggle + user ──────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          style={btnStyle}
          title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User avatar */}
        <button
          style={{
            ...btnStyle,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 8px',
            minWidth: 0,
          }}
          title="Usuário"
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'var(--brand-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <User size={14} style={{ color: 'var(--brand-200, #9ebfec)' }} />
          </div>
          {user && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}

const btnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  transition: 'background 150ms, color 150ms',
  flexShrink: 0,
}
