import React from 'react'
import { useWizardStore } from '@/state/wizardStore'

const FEATURES = [
  {
    icon: '📋',
    title: 'Folha A — CLT',
    desc: 'Cálculo completo: INSS, IRRF, FGTS, horas extras, faltas e eventos.',
  },
  {
    icon: '🤝',
    title: 'Folha B — PJ / Informal',
    desc: 'Registro simplificado por nome e valor, sem encargos obrigatórios.',
  },
  {
    icon: '📄',
    title: 'Documentos & PDF',
    desc: 'Geração de recibos, holerites e relatórios em PDF com múltiplos templates.',
  },
  {
    icon: '🔒',
    title: 'Segurança',
    desc: 'Controle de acesso por perfis (RBAC) e log de auditoria completo.',
  },
]

export default function WelcomeStep() {
  const nextStep = useWizardStore((s) => s.nextStep)

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-12 py-16">
      {/* Ícone central */}
      <div className="w-20 h-20 rounded-2xl bg-brand-600 flex items-center justify-center shadow-2xl shadow-brand-600/40 mb-8">
        <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      </div>

      {/* Título */}
      <h1 className="text-4xl font-bold text-white text-center leading-tight mb-3">
        Bem-vindo ao <span className="text-brand-400">SudoSys</span>
      </h1>
      <p className="text-gray-400 text-center text-base max-w-md mb-12 leading-relaxed">
        Sistema de gestão de folha de pagamento desenvolvido para empresas que precisam
        de controle completo, praticidade e confiabilidade.
      </p>

      {/* Funcionalidades */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-12">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-surface-800 border border-surface-500 rounded-xl p-5 hover:border-brand-600/50 transition-colors duration-200"
          >
            <div className="text-2xl mb-3">{f.icon}</div>
            <p className="text-white text-sm font-semibold mb-1">{f.title}</p>
            <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={nextStep}
        className="
          flex items-center gap-3 px-8 py-3.5
          bg-brand-600 hover:bg-brand-500
          text-white font-semibold rounded-lg
          shadow-lg shadow-brand-600/30
          transition-all duration-200
          hover:shadow-xl hover:shadow-brand-600/40
          active:scale-95
        "
      >
        Iniciar configuração
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
        </svg>
      </button>

      <p className="mt-4 text-gray-600 text-xs">
        Este assistente levará aproximadamente 2 minutos para ser concluído.
      </p>
    </div>
  )
}
