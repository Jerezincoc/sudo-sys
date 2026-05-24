import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  FileText,
  Tag,
  Umbrella,
  LogOut,
  Clock,
  Calculator,
  Zap,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useUiStore } from '@/state/uiSlice'
import { ROUTES } from '@/app/routes'

interface NavItem {
  label: string
  icon: React.ElementType
  to: string
}

interface NavGroup {
  group: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    group: 'GERAL',
    items: [
      { label: 'Dashboard',        icon: LayoutDashboard, to: ROUTES.DASHBOARD },
    ],
  },
  {
    group: 'CADASTROS',
    items: [
      { label: 'Empresas',         icon: Building2,       to: ROUTES.EMPRESAS },
    ],
  },
  {
    group: 'FOLHA',
    items: [
      { label: 'Folha de Pagamento', icon: FileText,       to: ROUTES.FOLHA },
      { label: 'Rubricas',           icon: Tag,            to: ROUTES.RUBRICAS },
    ],
  },
  {
    group: 'OPERAÇÕES',
    items: [
      { label: 'Férias',           icon: Umbrella,         to: ROUTES.FERIAS },
      { label: 'Rescisão',         icon: LogOut,           to: ROUTES.RESCISAO },
      { label: 'Ponto',            icon: Clock,            to: ROUTES.PONTO },
      { label: 'Custo / Simulador',icon: Calculator,       to: ROUTES.CUSTOS },
      { label: 'QuickCalc',        icon: Zap,              to: ROUTES.QUICKCALC },
    ],
  },
  {
    group: 'RELATÓRIOS',
    items: [
      { label: 'Relatórios',       icon: BarChart2,        to: ROUTES.RELATORIOS },
    ],
  },
  {
    group: 'ADMIN',
    items: [
      { label: 'Administração',    icon: Settings,         to: ROUTES.ADMIN },
    ],
  },
]

const COLLAPSED_W = 56
const EXPANDED_W  = 240

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const w = sidebarCollapsed ? COLLAPSED_W : EXPANDED_W

  return (
    <aside
      style={{
        width: w,
        minWidth: w,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 220ms ease, min-width 220ms ease',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: sidebarCollapsed ? '0 12px' : '0 16px',
          borderBottom: '1px solid var(--sidebar-border)',
          flexShrink: 0,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: 6,
            background: 'var(--brand-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" style={{ width: 16, height: 16, color: '#fff' }} stroke="currentColor" strokeWidth={2}>
            <rect x={3} y={3} width={7} height={7} rx={1} />
            <rect x={14} y={3} width={7} height={7} rx={1} />
            <rect x={3} y={14} width={7} height={7} rx={1} />
            <rect x={14} y={14} width={7} height={7} rx={1} />
          </svg>
        </div>
        {!sidebarCollapsed && (
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>
            SudoSys
          </span>
        )}
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
        {NAV.map(({ group, items }) => (
          <div key={group} style={{ marginBottom: 4 }}>
            {/* Group label */}
            {!sidebarCollapsed && (
              <div
                style={{
                  padding: '8px 16px 4px',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  userSelect: 'none',
                }}
              >
                {group}
              </div>
            )}
            {sidebarCollapsed && (
              <div style={{ height: 8 }} />
            )}

            {/* Items */}
            {items.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: sidebarCollapsed ? '8px 14px' : '7px 16px',
                  margin: '1px 6px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--sidebar-item-active-text)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--sidebar-item-active-bg)' : 'transparent',
                  transition: 'background 150ms, color 150ms',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                })}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  if (!el.getAttribute('data-active')) {
                    el.style.background = 'var(--sidebar-item-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement
                  if (!el.getAttribute('data-active')) {
                    el.style.background = ''
                  }
                }}
                title={sidebarCollapsed ? label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={16}
                      style={{
                        flexShrink: 0,
                        color: isActive ? 'var(--sidebar-item-active-text)' : 'var(--text-secondary)',
                      }}
                    />
                    {!sidebarCollapsed && (
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Toggle button ─────────────────────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid var(--sidebar-border)',
          padding: '8px 6px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: sidebarCollapsed ? '8px 14px' : '7px 10px',
            borderRadius: 6,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 13,
            transition: 'background 150ms, color 150ms',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--sidebar-item-hover)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = ''
            ;(e.currentTarget as HTMLButtonElement).style.color = ''
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!sidebarCollapsed && <span>Recolher</span>}
        </button>
      </div>
    </aside>
  )
}
