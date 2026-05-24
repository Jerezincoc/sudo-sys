import React from 'react'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'

const MONTHS_LONG = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

interface SummaryPanel {
  label: string
  value: string
  sub: string
  accent: string
}

const PANELS: SummaryPanel[] = [
  { label: 'FUNCIONÁRIOS ATIVOS',  value: '—',     sub: 'Nenhuma empresa selecionada', accent: 'var(--color-brand)'    },
  { label: 'FOLHAS ABERTAS',       value: '—',     sub: 'Competência atual',            accent: '#1e7e34'               },
  { label: 'TOTAL BRUTO DA FOLHA', value: 'R$ —',  sub: 'Valores calculados',           accent: '#8b5e00'               },
  { label: 'PENDÊNCIAS',           value: '—',     sub: 'Documentos e lançamentos',     accent: 'var(--color-btn-del)'  },
]

const ACTIVITY_ROWS = [
  { data: '24/05/2026', usuario: 'admin',     acao: 'Cálculo de folha', competencia: 'Mai/2026', status: 'OK'       },
  { data: '23/05/2026', usuario: 'operador1', acao: 'Importação AFD',   competencia: 'Mai/2026', status: 'OK'       },
  { data: '22/05/2026', usuario: 'admin',     acao: 'Geração PDF',      competencia: 'Abr/2026', status: 'OK'       },
  { data: '20/05/2026', usuario: 'operador1', acao: 'Transmissão eSoc', competencia: 'Abr/2026', status: 'PENDENTE' },
]

export default function DashboardPage() {
  const { empresaNome, competencia } = useSelectedEmpresaStore()
  const [cYear, cMonth] = competencia.split('-')
  const monthName = MONTHS_LONG[parseInt(cMonth, 10) - 1] ?? cMonth

  return (
    <div style={{ padding: 8 }}>

      {/* ── Page header ──────────────────────────────────────────── */}
      <div style={{
        marginBottom: 8,
        paddingBottom: 4,
        borderBottom: '1px solid var(--color-border-main)',
      }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
          Módulo / Geral
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Dashboard — {empresaNome ?? 'Nenhuma empresa selecionada'}
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>
            {monthName} {cYear}
          </span>
        </div>
      </div>

      {/* ── Summary panels (4 colunas) ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
        {PANELS.map((p) => (
          <div
            key={p.label}
            style={{
              background: 'var(--color-bg-white)',
              border: '1px solid var(--color-border-main)',
              padding: '6px 10px',
            }}
          >
            <div style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-text-muted)',
              marginBottom: 4,
            }}>
              {p.label}
            </div>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: p.accent,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1,
              marginBottom: 2,
            }}>
              {p.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {p.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Atividade recente (DataTable style) ──────────────────── */}
      <div style={{
        background: 'var(--color-bg-white)',
        border: '1px solid var(--color-border-main)',
      }}>
        {/* Panel title */}
        <div style={{
          padding: '3px 8px',
          background: 'var(--color-bg-ribbon)',
          borderBottom: '1px solid var(--color-border-main)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}>
          Atividade Recente
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '20px 90px 100px 1fr 100px 80px',
          background: 'var(--color-bg-ribbon)',
          borderBottom: '2px solid var(--color-brand)',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}>
          {['', 'Data', 'Usuário', 'Ação', 'Competência', 'Status'].map((h) => (
            <div key={h} style={{ padding: '3px 4px', borderRight: '1px solid var(--color-border-light)' }}>
              {h}
            </div>
          ))}
        </div>

        {/* Table rows */}
        {ACTIVITY_ROWS.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '20px 90px 100px 1fr 100px 80px',
              background: i % 2 === 0 ? 'var(--color-bg-white)' : 'var(--color-bg-row-even)',
              fontSize: 11,
              color: 'var(--color-text-primary)',
              borderBottom: '1px solid var(--color-border-light)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-row-hover)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = i % 2 === 0 ? 'var(--color-bg-white)' : 'var(--color-bg-row-even)' }}
          >
            {/* Row indicator */}
            <div style={{ padding: '3px 4px', borderRight: '1px solid var(--color-border-light)', color: 'var(--color-brand)', fontWeight: 700 }}>▶</div>
            <div style={{ padding: '3px 4px', borderRight: '1px solid var(--color-border-light)', fontFamily: 'monospace' }}>{row.data}</div>
            <div style={{ padding: '3px 4px', borderRight: '1px solid var(--color-border-light)' }}>{row.usuario}</div>
            <div style={{ padding: '3px 4px', borderRight: '1px solid var(--color-border-light)' }}>{row.acao}</div>
            <div style={{ padding: '3px 4px', borderRight: '1px solid var(--color-border-light)' }}>{row.competencia}</div>
            <div style={{
              padding: '3px 4px',
              color: row.status === 'OK' ? 'var(--color-btn-add)' : 'var(--color-btn-del)',
              fontWeight: 600,
            }}>
              {row.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
