import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Users, FileText, Tag, Umbrella,
  LogOut, Clock, Calculator, Zap, BarChart2, Settings, BookOpen, FolderOpen,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useUiStore } from '@/state/uiSlice'
import { ROUTES } from '@/app/routes'

interface NavItem { label: string; icon: React.ElementType; to: string }
interface NavGroup { group: string; items: NavItem[] }

const NAV: NavGroup[] = [
  { group: 'GERAL', items: [
    { label: 'Dashboard',          icon: LayoutDashboard, to: ROUTES.DASHBOARD  },
  ]},
  { group: 'CADASTROS', items: [
    { label: 'Empresas',           icon: Building2,       to: ROUTES.EMPRESAS      },
    { label: 'Funcionários',       icon: Users,           to: ROUTES.FUNCIONARIOS  },
  ]},
  { group: 'FOLHA', items: [
    { label: 'Folha de Pagamento', icon: FileText,        to: ROUTES.FOLHA      },
    { label: 'Rubricas',           icon: Tag,             to: ROUTES.RUBRICAS   },
  ]},
  { group: 'OPERAÇÕES', items: [
    { label: 'Férias',             icon: Umbrella,        to: ROUTES.FERIAS     },
    { label: 'Rescisão',           icon: LogOut,          to: ROUTES.RESCISAO   },
    { label: 'Ponto',              icon: Clock,           to: ROUTES.PONTO      },
    { label: 'Custo / Simulador',  icon: Calculator,      to: ROUTES.CUSTOS     },
    { label: 'QuickCalc',          icon: Zap,             to: ROUTES.QUICKCALC  },
  ]},
  { group: 'TABELAS', items: [
    { label: 'CBO',                icon: BookOpen,        to: ROUTES.CBO        },
    { label: 'Documentos',         icon: FolderOpen,      to: ROUTES.DOCUMENTOS },
  ]},
  { group: 'RELATÓRIOS', items: [
    { label: 'Relatórios',         icon: BarChart2,       to: ROUTES.RELATORIOS },
  ]},
  { group: 'ADMIN', items: [
    { label: 'Administração',      icon: Settings,        to: ROUTES.ADMIN      },
  ]},
]

const EXP_W = 200
const COL_W = 48

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const w = sidebarCollapsed ? COL_W : EXP_W

  return (
    <aside style={{
      width: w,
      minWidth: w,
      background: 'var(--color-bg-white)',
      borderRight: '1px solid var(--color-border-main)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 180ms linear, min-width 180ms linear',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV.map(({ group, items }) => (
          <div key={group}>
            {/* Group header */}
            {!sidebarCollapsed ? (
              <div style={{
                height: 18,
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                background: 'var(--color-bg-ribbon)',
                borderBottom: '1px solid var(--color-border-light)',
                borderTop: '1px solid var(--color-border-light)',
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                userSelect: 'none',
              }}>
                {group}
              </div>
            ) : (
              <div style={{
                height: 6,
                background: 'var(--color-border-light)',
              }} />
            )}

            {/* Items */}
            {items.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                title={sidebarCollapsed ? label : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 24,
                  padding: sidebarCollapsed ? '0 14px' : '0 12px',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#ffffff' : 'var(--color-text-primary)',
                  background: isActive ? 'var(--color-brand)' : 'transparent',
                  borderLeft: isActive ? '2px solid var(--color-brand)' : '2px solid transparent',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                })}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  if (!el.getAttribute('aria-current')) {
                    el.style.background = 'var(--color-bg-row-hover)'
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  if (!el.getAttribute('aria-current')) {
                    el.style.background = ''
                  }
                }}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={14}
                      style={{ flexShrink: 0, color: isActive ? '#fff' : 'var(--color-text-secondary)' }}
                    />
                    {!sidebarCollapsed && (
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Toggle ──────────────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid var(--color-border-main)',
        flexShrink: 0,
      }}>
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expandir' : 'Recolher'}
          style={{
            width: '100%',
            height: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: sidebarCollapsed ? '0 14px' : '0 10px',
            border: 'none',
            background: 'var(--color-bg-panel)',
            color: 'var(--color-text-muted)',
            fontSize: 11,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-row-hover)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-panel)'
          }}
        >
          {sidebarCollapsed
            ? <ChevronRight size={12} />
            : <><ChevronLeft size={12} /><span>Recolher</span></>
          }
        </button>
      </div>
    </aside>
  )
}
