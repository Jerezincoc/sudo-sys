import React from 'react'
import { useWizardStore } from '@/state/wizardStore'

const STEPS = [
  { label: 'Boas-vindas',      desc: 'Apresentação do sistema' },
  { label: 'Banco de dados',   desc: 'SQLite ou PostgreSQL'    },
  { label: 'Dados da empresa', desc: 'Cadastro inicial'        },
  { label: 'Conclusão',        desc: 'Revisão e ativação'      },
]

export default function WizardSidebar() {
  const currentStep = useWizardStore((s) => s.currentStep)

  return (
    <aside style={{
      width: 220,
      flexShrink: 0,
      background: 'var(--color-brand)',
      borderRight: '1px solid rgba(255,255,255,0.15)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26,
            height: 26,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }} stroke="white" strokeWidth={2.5}>
              <rect x={3} y={3} width={7} height={7} rx={0} />
              <rect x={14} y={3} width={7} height={7} rx={0} />
              <rect x={3} y={14} width={7} height={7} rx={0} />
              <rect x={14} y={14} width={7} height={7} rx={0} />
            </svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1.1 }}>SudoSys</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>v1.0.0 — Configuração</div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {STEPS.map((step, idx) => {
          const done   = idx < currentStep
          const active = idx === currentStep

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 10,
                padding: '6px 16px',
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderLeft: active ? '3px solid #fff' : '3px solid transparent',
              }}
            >
              {/* Number / check */}
              <div style={{
                width: 20,
                height: 20,
                flexShrink: 0,
                background: done ? 'rgba(255,255,255,0.9)' : active ? '#fff' : 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: done || active ? 'var(--color-brand)' : 'rgba(255,255,255,0.5)',
                marginTop: 1,
              }}>
                {done ? '✓' : idx + 1}
              </div>

              {/* Label */}
              <div>
                <div style={{
                  fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  color: active || done ? '#fff' : 'rgba(255,255,255,0.55)',
                  lineHeight: 1.2,
                }}>
                  {step.label}
                </div>
                <div style={{
                  fontSize: 10,
                  color: active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)',
                }}>
                  {step.desc}
                </div>
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid rgba(255,255,255,0.15)',
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
      }}>
        © {new Date().getFullYear()} SudoSys. Todos os direitos reservados.
      </div>
    </aside>
  )
}
