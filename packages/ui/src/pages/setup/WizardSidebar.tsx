import React from 'react'
import { useWizardStore } from '@/state/wizardStore'

const STEPS = [
  { label: 'Boas-vindas',      description: 'Apresentação do sistema' },
  { label: 'Banco de dados',   description: 'SQLite ou PostgreSQL' },
  { label: 'Dados da empresa', description: 'Cadastro inicial' },
  { label: 'Conclusão',        description: 'Revisão e ativação' },
]

export default function WizardSidebar() {
  const currentStep = useWizardStore((s) => s.currentStep)

  return (
    <aside className="w-72 flex-shrink-0 bg-surface-800 border-r border-surface-500 flex flex-col">
      {/* Logo / Header */}
      <div className="px-8 py-8 border-b border-surface-500">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2}>
              <rect x={3} y={3} width={8} height={8} rx={1} />
              <rect x={13} y={3} width={8} height={8} rx={1} />
              <rect x={3} y={13} width={8} height={8} rx={1} />
              <rect x={13} y={13} width={8} height={8} rx={1} />
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">SudoSys</p>
            <p className="text-gray-500 text-xs">v1.0.0 — Configuração</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 px-6 py-8 space-y-1">
        {STEPS.map((step, idx) => {
          const done    = idx < currentStep
          const active  = idx === currentStep
          const pending = idx > currentStep

          return (
            <div key={idx} className="flex gap-4">
              {/* Indicador vertical */}
              <div className="flex flex-col items-center">
                {/* Círculo */}
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300',
                    done    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : '',
                    active  ? 'bg-brand-600 text-white ring-2 ring-brand-400 ring-offset-2 ring-offset-surface-800 shadow-lg shadow-brand-600/30' : '',
                    pending ? 'bg-surface-700 text-gray-500 border border-surface-500' : '',
                  ].join(' ')}
                >
                  {done ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                {/* Linha conectora */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={[
                      'w-px flex-1 mt-1 mb-1 min-h-[32px] transition-all duration-300',
                      done ? 'bg-brand-600' : 'bg-surface-500',
                    ].join(' ')}
                  />
                )}
              </div>

              {/* Texto */}
              <div className="pb-8 pt-1">
                <p
                  className={[
                    'text-sm font-medium leading-tight transition-colors duration-200',
                    active  ? 'text-white' : '',
                    done    ? 'text-brand-400' : '',
                    pending ? 'text-gray-500' : '',
                  ].join(' ')}
                >
                  {step.label}
                </p>
                <p
                  className={[
                    'text-xs mt-0.5 transition-colors duration-200',
                    active  ? 'text-gray-400' : 'text-gray-600',
                  ].join(' ')}
                >
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-surface-500">
        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} SudoSys. Todos os direitos reservados.
        </p>
      </div>
    </aside>
  )
}
