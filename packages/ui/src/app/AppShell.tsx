import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Minus, Square, X, Sun, Moon } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import RibbonBar from '@/components/layout/RibbonBar'
import { useTheme } from '@/app/theme/ThemeContext'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import { useSessionStore } from '@/state/sessionSlice'
import { ipcClient } from '@/api/ipcClient'
import { usePageActionsStore } from '@/state/pageActionsSlice'
import { ROUTES } from '@/app/routes'

const PAGE_NAMES: Record<string, string> = {
  [ROUTES.DASHBOARD]:    'Dashboard',
  [ROUTES.EMPRESAS]:     'Empresas',
  [ROUTES.FUNCIONARIOS]: 'Funcionários',
  [ROUTES.FOLHA]:      'Folha de Pagamento',
  [ROUTES.RUBRICAS]:   'Rubricas',
  [ROUTES.FERIAS]:     'Férias',
  [ROUTES.RESCISAO]:   'Rescisão',
  [ROUTES.PONTO]:      'Ponto',
  [ROUTES.CUSTOS]:     'Custo / Simulador',
  [ROUTES.QUICKCALC]:  'QuickCalc',
  [ROUTES.RELATORIOS]: 'Relatórios',
  [ROUTES.ADMIN]:      'Administração',
}

const MENU_ITEMS = ['Arquivo', 'Editar', 'Exibir', 'Ferramentas', 'Janela', 'Ajuda']

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function AppShell() {
  const location = useLocation()
  const { theme, toggle } = useTheme()
  const { empresaNome, competencia } = useSelectedEmpresaStore()
  const { user, token, clearUser } = useSessionStore()
  const [menuHover, setMenuHover] = useState<string | null>(null)

  async function handleLogout() {
    await ipcClient.logout(token ?? '')
    clearUser()
    window.location.reload()
  }

  const [cYear, cMonth] = competencia.split('-')
  const compLabel = `${MONTHS[parseInt(cMonth, 10) - 1] ?? cMonth}/${cYear}`

  const pageName = PAGE_NAMES[location.pathname] ?? 'SudoSys'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-bg-app)', overflow: 'hidden' }}>

      {/* ── TITLEBAR 22px ───────────────────────────────────────── */}
      <div style={{
        height: 22,
        flexShrink: 0,
        background: 'var(--color-brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 0 0 8px',
        userSelect: 'none',
      }}>
        <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>
          SudoSys — Gestão de Folha de Pagamento
          {empresaNome && (
            <span style={{ fontWeight: 400, opacity: 0.75, marginLeft: 8 }}>
              | {empresaNome}
            </span>
          )}
        </span>

        {/* Window controls */}
        <div style={{ display: 'flex' }}>
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
            style={winBtn}
          >
            {theme === 'dark' ? <Sun size={10} /> : <Moon size={10} />}
          </button>
          <button style={winBtn} title="Minimizar"><Minus size={10} /></button>
          <button style={winBtn} title="Maximizar"><Square size={10} /></button>
          <button
            style={{ ...winBtn, width: 32 }}
            title="Fechar"
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#c0392b' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '' }}
          >
            <X size={10} />
          </button>
        </div>
      </div>

      {/* ── MENUBAR 22px ────────────────────────────────────────── */}
      <div style={{
        height: 22,
        flexShrink: 0,
        background: 'var(--color-bg-panel)',
        borderBottom: '1px solid var(--color-border-main)',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
      }}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item}
            onMouseEnter={() => setMenuHover(item)}
            onMouseLeave={() => setMenuHover(null)}
            style={{
              height: '100%',
              padding: '0 10px',
              border: 'none',
              background: menuHover === item ? 'var(--color-brand)' : 'transparent',
              color: menuHover === item ? '#fff' : 'var(--color-text-primary)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {item}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          padding: '0 8px',
          fontSize: 11,
          color: 'var(--color-text-secondary)',
        }}>
          <span>{user?.name ?? 'Usuário'}</span>
          <span style={{ margin: '0 8px', color: 'var(--color-border-main)' }}>|</span>
          <span>{empresaNome ?? 'Nenhuma empresa selecionada'}</span>
          <span style={{ margin: '0 8px', color: 'var(--color-border-main)' }}>|</span>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--color-text-secondary)', cursor: 'pointer', padding: 0 }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* ── RIBBON ──────────────────────────────────────────────── */}
      <RibbonBar />

      {/* ── BODY: Sidebar + Content ──────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        <Sidebar />

        {/* Content column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ── TAB BAR 24px ─────────────────────────────── */}
          <div style={{
            height: 24,
            flexShrink: 0,
            background: 'var(--color-bg-panel)',
            borderBottom: '1px solid var(--color-border-main)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '0 0 0 4px',
          }}>
            {/* Active tab */}
            <div style={{
              height: 22,
              padding: '0 16px',
              background: 'var(--color-bg-white)',
              border: '1px solid var(--color-border-main)',
              borderBottom: '1px solid var(--color-bg-white)',
              borderTop: '2px solid var(--color-brand)',
              display: 'flex',
              alignItems: 'center',
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              gap: 8,
              whiteSpace: 'nowrap',
            }}>
              {pageName}
            </div>
          </div>

          {/* ── ACTION TOOLBAR 26px ──────────────────────── */}
          <ActionToolbar />

          {/* ── PAGE CONTENT ─────────────────────────────── */}
          <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg-app)' }}>
            <Outlet />
          </div>

        </div>
      </div>

      {/* ── STATUS BAR 20px ─────────────────────────────────────── */}
      <StatusBar compLabel={compLabel} empresaNome={empresaNome} />
    </div>
  )
}

function StatusBar({ compLabel, empresaNome }: { compLabel: string; empresaNome: string | null }) {
  const { statusMessage, statusType } = usePageActionsStore()

  const msgColor = statusType === 'error'
    ? '#ff6b6b'
    : statusType === 'success'
      ? '#69db7c'
      : 'rgba(255,255,255,0.9)'

  return (
    <div style={{
      height: 20,
      flexShrink: 0,
      background: 'var(--color-status-bar)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      fontSize: 11,
      color: 'rgba(255,255,255,0.9)',
      userSelect: 'none',
      gap: 0,
    }}>
      <span>Sistema</span>
      <StatusSep />
      <span>Aplicação</span>
      <StatusSep />
      <span style={{ color: msgColor, minWidth: 180, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {statusMessage ?? 'Pronto'}
      </span>
      <div style={{ flex: 1, textAlign: 'center' }}>
        Período: {compLabel}
        <span style={{ margin: '0 8px', opacity: 0.35 }}>·</span>
        Empresa: {empresaNome ?? '—'}
        <span style={{ margin: '0 8px', opacity: 0.35 }}>·</span>
        Folha: 1 - Mensal
      </div>
      <span style={{ opacity: 0.75 }}>SudoSys v1.0.0</span>
    </div>
  )
}

function StatusSep() {
  return <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.25)', margin: '0 8px' }} />
}

const winBtn: React.CSSProperties = {
  width: 28,
  height: 22,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  color: 'rgba(255,255,255,0.8)',
  cursor: 'pointer',
}

/* ── Action Toolbar ─────────────────────────────────────────────────── */
function ActionToolbar() {
  const { actions } = usePageActionsStore()
  const { total, current } = actions

  return (
    <div style={{
      height: 26,
      flexShrink: 0,
      background: 'var(--color-bg-panel)',
      borderBottom: '1px solid var(--color-border-main)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px',
      gap: 1,
    }}>
      <TBtn color="var(--color-btn-add)" title="Novo (Ins)" onClick={actions.onNew}>+</TBtn>
      <TBtn color="var(--color-btn-del)" title="Excluir (Del)" onClick={actions.onDelete}>✕</TBtn>
      <TBtn color="var(--color-text-secondary)" title="Editar (F2)" onClick={actions.onEdit}>✎</TBtn>
      <TBtn color="var(--color-text-secondary)" title="Atualizar (F5)" onClick={actions.onRefresh}>⟳</TBtn>
      <TDivider />
      <TDrop>Anexos ▾</TDrop>
      <TDrop>Processos ▾</TDrop>
      <TDivider />
      <TDrop>Filtro: Todos ▾</TDrop>
      <div style={{ flex: 1 }} />
      {total !== undefined && (
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', padding: '0 6px' }}>
          {current ?? 0}/{total}
        </span>
      )}
    </div>
  )
}

function TBtn({ children, color, title, onClick }: { children: React.ReactNode; color: string; title?: string; onClick?: () => void }) {
  const [h, setH] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${h ? 'var(--color-border-main)' : 'transparent'}`,
        background: h ? 'var(--color-bg-row-hover)' : 'transparent',
        color: onClick ? color : 'var(--color-text-muted)',
        fontSize: 13,
        cursor: onClick ? 'pointer' : 'default',
        lineHeight: 1,
        opacity: onClick ? 1 : 0.5,
      }}
    >
      {children}
    </button>
  )
}

function TDrop({ children }: { children: React.ReactNode }) {
  const [h, setH] = useState(false)
  return (
    <button
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        height: 20,
        padding: '0 7px',
        display: 'flex',
        alignItems: 'center',
        border: `1px solid ${h ? 'var(--color-border-main)' : 'transparent'}`,
        background: h ? 'var(--color-bg-row-hover)' : 'transparent',
        color: 'var(--color-text-primary)',
        fontSize: 11,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

function TDivider() {
  return <div style={{ width: 1, height: 18, background: 'var(--color-border-main)', margin: '0 2px', flexShrink: 0 }} />
}
