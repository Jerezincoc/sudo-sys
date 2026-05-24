import React from 'react'
import { useWizardStore } from '@/state/wizardStore'
import WizardSidebar from './WizardSidebar'
import WelcomeStep    from './steps/WelcomeStep'
import DatabaseStep   from './steps/DatabaseStep'
import CompanyStep    from './steps/CompanyStep'
import ConclusionStep from './steps/ConclusionStep'

const STEPS = [WelcomeStep, DatabaseStep, CompanyStep, ConclusionStep]

export default function SetupWizardPage() {
  const currentStep = useWizardStore((s) => s.currentStep)
  const StepComponent = STEPS[currentStep] ?? WelcomeStep

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      background: 'var(--color-bg-app)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Titlebar ───────────────────────────────────────────── */}
      <div style={{
        height: 22,
        background: 'var(--color-brand)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        flexShrink: 0,
        userSelect: 'none',
      }}>
        <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>
          SudoSys — Assistente de Configuração Inicial
        </span>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <WizardSidebar />

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Sub-header */}
          <div style={{
            height: 22,
            background: 'var(--color-bg-panel)',
            borderBottom: '1px solid var(--color-border-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ASSISTENTE DE CONFIGURAÇÃO
            </span>
            {/* Progress pips */}
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === currentStep ? 24 : 12,
                    height: 4,
                    background: i <= currentStep ? 'var(--color-brand)' : 'var(--color-border-main)',
                    transition: 'width 200ms, background 200ms',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Step content */}
          <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg-white)' }}>
            <StepComponent />
          </div>

        </div>
      </div>

      {/* ── Status bar ─────────────────────────────────────────── */}
      <div style={{
        height: 20,
        background: 'var(--color-status-bar)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontSize: 11,
        color: 'rgba(255,255,255,0.8)',
        flexShrink: 0,
        userSelect: 'none',
      }}>
        SudoSys v1.0.0 — Configuração inicial
      </div>
    </div>
  )
}
