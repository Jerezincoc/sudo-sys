import React from 'react'
import { useWizardStore } from '@/state/wizardStore'
import WizardSidebar from './WizardSidebar'
import WelcomeStep     from './steps/WelcomeStep'
import DatabaseStep    from './steps/DatabaseStep'
import CompanyStep     from './steps/CompanyStep'
import ConclusionStep  from './steps/ConclusionStep'

const STEP_COMPONENTS = [
  WelcomeStep,
  DatabaseStep,
  CompanyStep,
  ConclusionStep,
]

export default function SetupWizardPage() {
  const currentStep = useWizardStore((s) => s.currentStep)
  const StepComponent = STEP_COMPONENTS[currentStep] ?? WelcomeStep

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-900">
      {/* Sidebar */}
      <WizardSidebar />

      {/* Conteúdo principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Barra superior */}
        <header className="flex items-center justify-between px-10 py-4 border-b border-surface-500 bg-surface-800">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
            Assistente de Configuração
          </p>
          <div className="flex items-center gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={[
                  'h-1.5 rounded-full transition-all duration-300',
                  i === currentStep
                    ? 'w-8 bg-brand-600'
                    : i < currentStep
                    ? 'w-4 bg-brand-700'
                    : 'w-4 bg-surface-500',
                ].join(' ')}
              />
            ))}
          </div>
        </header>

        {/* Step atual */}
        <div className="flex-1 overflow-y-auto">
          <StepComponent />
        </div>
      </main>
    </div>
  )
}
