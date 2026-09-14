import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  Users,
} from 'lucide-react'
import { ROUTES } from '@/app/routes'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'

const MONTHS_LONG = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface QuickAction {
  label: string
  description: string
  route: string
  icon: React.ElementType
  requiresEmpresa?: boolean
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Empresas',
    description: 'Selecione ou cadastre a empresa de trabalho.',
    route: ROUTES.EMPRESAS,
    icon: Building2,
  },
  {
    label: 'Funcionários',
    description: 'Consulte os colaboradores da empresa selecionada.',
    route: ROUTES.FUNCIONARIOS,
    icon: Users,
    requiresEmpresa: true,
  },
  {
    label: 'Folha mensal',
    description: 'Acesse as competências e lançamentos existentes.',
    route: ROUTES.FOLHA,
    icon: CalendarDays,
    requiresEmpresa: true,
  },
  {
    label: 'Documentos',
    description: 'Encontre documentos e modelos disponíveis.',
    route: ROUTES.DOCUMENTOS,
    icon: FileText,
    requiresEmpresa: true,
  },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { empresaNome, competencia } = useSelectedEmpresaStore()
  const [year, month] = competencia.split('-')
  const monthName = MONTHS_LONG[parseInt(month, 10) - 1] ?? month
  const hasEmpresa = Boolean(empresaNome)

  return (
    <main style={{ padding: 20, maxWidth: 1180, margin: '0 auto', width: '100%' }}>
      <header style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 20,
        marginBottom: 18,
        paddingBottom: 14,
        borderBottom: '1px solid var(--color-border-main)',
      }}>
        <div>
          <div style={eyebrowStyle}>Visão geral</div>
          <h1 style={{
            margin: '3px 0 4px',
            fontSize: 20,
            lineHeight: 1.25,
            color: 'var(--color-text-primary)',
          }}>
            Olá! O que você precisa fazer hoje?
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Acesse rapidamente as áreas mais usadas do SudoSys.
          </p>
        </div>

        <div style={{
          minWidth: 190,
          padding: '8px 10px',
          background: 'var(--color-bg-white)',
          border: '1px solid var(--color-border-main)',
          textAlign: 'right',
        }}>
          <div style={eyebrowStyle}>Competência atual</div>
          <div style={{ marginTop: 2, fontSize: 14, fontWeight: 700, color: 'var(--color-brand)' }}>
            {monthName} de {year}
          </div>
        </div>
      </header>

      <section
        aria-label="Contexto de trabalho"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '14px 16px',
          marginBottom: 18,
          background: 'var(--color-bg-white)',
          border: `1px solid ${hasEmpresa ? 'var(--color-border-main)' : 'var(--color-brand)'}`,
          borderLeft: '4px solid var(--color-brand)',
        }}
      >
        <div style={iconBoxStyle}>
          <Building2 size={22} aria-hidden="true" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {hasEmpresa ? empresaNome : 'Comece selecionando uma empresa'}
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {hasEmpresa
              ? 'Esta é a empresa ativa. Os atalhos abaixo usarão esse contexto.'
              : 'A empresa ativa organiza funcionários, competências e demais rotinas do sistema.'}
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.EMPRESAS)}
          style={primaryButtonStyle}
        >
          {hasEmpresa ? 'Trocar empresa' : 'Selecionar empresa'}
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </section>

      <section aria-labelledby="quick-actions-title" style={{ marginBottom: 18 }}>
        <div style={{ marginBottom: 8 }}>
          <h2 id="quick-actions-title" style={sectionTitleStyle}>Acesso rápido</h2>
          <p style={sectionDescriptionStyle}>Escolha uma área para continuar.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10 }}>
          {QUICK_ACTIONS.map((action) => {
            const disabled = Boolean(action.requiresEmpresa && !hasEmpresa)
            const Icon = action.icon

            return (
              <button
                key={action.label}
                type="button"
                disabled={disabled}
                onClick={() => navigate(action.route)}
                title={disabled ? 'Selecione uma empresa para acessar esta área.' : undefined}
                style={{
                  minHeight: 112,
                  padding: 14,
                  border: '1px solid var(--color-border-main)',
                  borderTop: `3px solid ${disabled ? 'var(--color-border-main)' : 'var(--color-brand)'}`,
                  background: 'var(--color-bg-white)',
                  color: 'var(--color-text-primary)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  opacity: disabled ? 0.55 : 1,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                <Icon size={20} color="var(--color-brand)" aria-hidden="true" />
                <span style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>{action.label}</span>
                <span style={{ marginTop: 3, fontSize: 11, lineHeight: 1.4, color: 'var(--color-text-secondary)' }}>
                  {disabled ? 'Selecione uma empresa primeiro.' : action.description}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section
        aria-labelledby="recent-activity-title"
        style={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border-main)' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 12px',
          borderBottom: '1px solid var(--color-border-main)',
          background: 'var(--color-bg-ribbon)',
        }}>
          <h2 id="recent-activity-title" style={{ ...sectionTitleStyle, margin: 0 }}>Atividade recente</h2>
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sem dados integrados
          </span>
        </div>

        <div style={{
          minHeight: 132,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          <Clock3 size={26} color="var(--color-text-muted)" aria-hidden="true" />
          <div style={{ marginTop: 9, fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Nenhuma atividade disponível
          </div>
          <p style={{ maxWidth: 480, margin: '4px 0 0', fontSize: 11, color: 'var(--color-text-secondary)' }}>
            O Dashboard ainda não recebe um histórico automático. Use os atalhos acima para acessar os dados reais de cada área.
          </p>
        </div>
      </section>
    </main>
  )
}

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--color-text-muted)',
}

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--color-text-primary)',
}

const sectionDescriptionStyle: React.CSSProperties = {
  margin: '2px 0 0',
  fontSize: 11,
  color: 'var(--color-text-muted)',
}

const iconBoxStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  background: 'var(--color-bg-ribbon)',
  color: 'var(--color-brand)',
  border: '1px solid var(--color-border-main)',
}

const primaryButtonStyle: React.CSSProperties = {
  minHeight: 32,
  padding: '0 12px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  flexShrink: 0,
  border: '1px solid var(--color-brand)',
  background: 'var(--color-brand)',
  color: '#fff',
  fontSize: 11,
  fontWeight: 700,
}
