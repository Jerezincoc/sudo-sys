import React from 'react'
import { useWizardStore } from '@/state/wizardStore'

const FEATURES = [
  { label: 'Folha A — CLT',        desc: 'INSS, IRRF, FGTS, horas extras, faltas e eventos.' },
  { label: 'Folha B — PJ/Informal', desc: 'Registro simplificado por nome e valor, sem encargos.' },
  { label: 'Documentos & PDF',      desc: 'Holerites e relatórios em PDF com múltiplos templates.' },
  { label: 'Controle de Acesso',    desc: 'Perfis RBAC e log de auditoria completo.' },
]

export default function WelcomeStep() {
  const nextStep = useWizardStore((s) => s.nextStep)

  return (
    <div style={{ padding: '24px 32px', maxWidth: 680 }}>

      {/* Header */}
      <div style={{
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: '2px solid var(--color-brand)',
      }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>
          Boas-vindas / Passo 1 de 4
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-brand)' }}>
          Bem-vindo ao SudoSys
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
          Sistema de gestão de folha de pagamento para empresas que precisam de controle
          completo, praticidade e confiabilidade. Este assistente levará cerca de 2 minutos.
        </div>
      </div>

      {/* Feature table */}
      <div style={{
        border: '1px solid var(--color-border-main)',
        marginBottom: 20,
      }}>
        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '180px 1fr',
          background: 'var(--color-bg-ribbon)',
          borderBottom: '2px solid var(--color-brand)',
        }}>
          <div style={{ padding: '3px 8px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)', borderRight: '1px solid var(--color-border-main)' }}>Módulo</div>
          <div style={{ padding: '3px 8px', fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)' }}>Descrição</div>
        </div>
        {FEATURES.map((f, i) => (
          <div
            key={f.label}
            style={{
              display: 'grid',
              gridTemplateColumns: '180px 1fr',
              background: i % 2 === 0 ? 'var(--color-bg-white)' : 'var(--color-bg-row-even)',
              borderBottom: i < FEATURES.length - 1 ? '1px solid var(--color-border-light)' : 'none',
            }}
          >
            <div style={{
              padding: '4px 8px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-brand)',
              borderRight: '1px solid var(--color-border-light)',
            }}>
              {f.label}
            </div>
            <div style={{ padding: '4px 8px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={nextStep}
          style={{
            height: 28,
            padding: '0 20px',
            background: 'var(--color-brand)',
            color: '#fff',
            border: '1px solid var(--color-brand)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          Iniciar configuração →
        </button>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          Pressione para continuar
        </span>
      </div>
    </div>
  )
}
