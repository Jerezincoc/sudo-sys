import React from 'react'
import { Users, FileText, DollarSign, AlertCircle } from 'lucide-react'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'

interface SummaryCard {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  accent: string
}

const CARDS: SummaryCard[] = [
  {
    icon:   Users,
    label:  'Funcionários ativos',
    value:  '—',
    sub:    'Nenhuma empresa selecionada',
    accent: 'var(--brand-600)',
  },
  {
    icon:   FileText,
    label:  'Folhas abertas',
    value:  '—',
    sub:    'Nenhuma competência processada',
    accent: 'var(--info)',
  },
  {
    icon:   DollarSign,
    label:  'Total bruto da folha',
    value:  'R$ —',
    sub:    'Competência atual',
    accent: 'var(--success)',
  },
  {
    icon:   AlertCircle,
    label:  'Pendências',
    value:  '—',
    sub:    'Documentos e lançamentos',
    accent: 'var(--warning)',
  },
]

export default function DashboardPage() {
  const { empresaNome, competencia } = useSelectedEmpresaStore()

  const [year, month] = competencia.split('-')
  const months = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
  ]
  const monthName = months[parseInt(month, 10) - 1] ?? month

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      {/* ── Cabeçalho ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            color: 'var(--text-primary)',
            fontSize: 20,
            fontWeight: 600,
            margin: '0 0 4px',
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
          {empresaNome
            ? `${empresaNome} · ${monthName} ${year}`
            : `${monthName} ${year} · Selecione uma empresa na barra superior`}
        </p>
      </div>

      {/* ── Cards de resumo ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {CARDS.map(({ icon: Icon, label, value, sub, accent }) => (
          <div
            key={label}
            style={{
              background: 'var(--surface-800)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              transition: 'border-color 200ms',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = accent
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
            }}
          >
            {/* Icon + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${accent}1a`,
                  flexShrink: 0,
                }}
              >
                <Icon size={18} style={{ color: accent }} />
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.3,
                }}
              >
                {label}
              </span>
            </div>

            {/* Value */}
            <div>
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: '0 0 2px',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                {value}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Atividade recente (placeholder) ──────────────────────────── */}
      <div
        style={{
          background: 'var(--surface-800)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '18px 20px',
        }}
      >
        <h2
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 16px',
          }}
        >
          Atividade recente
        </h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 0',
            gap: 8,
          }}
        >
          <FileText size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>
            Nenhuma atividade recente
          </p>
        </div>
      </div>
    </div>
  )
}
