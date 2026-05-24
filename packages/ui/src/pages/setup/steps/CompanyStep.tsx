import React from 'react'
import { useWizardStore } from '@/state/wizardStore'

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCnpj(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function validateCnpj(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '')
  if (digits.length !== 14) return false
  if (/^(\d)\1+$/.test(digits)) return false
  const calc = (str: string, weights: number[]) =>
    weights.reduce((sum, w, i) => sum + Number(str[i]) * w, 0)
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const r1 = calc(digits, w1) % 11
  const d1 = r1 < 2 ? 0 : 11 - r1
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const r2 = calc(digits, w2) % 11
  const d2 = r2 < 2 ? 0 : 11 - r2
  return Number(digits[12]) === d1 && Number(digits[13]) === d2
}

// ── Field ────────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: string
  hint?: string
  maxLength?: number
}

function Field({ label, value, onChange, onBlur, placeholder, error, hint, maxLength }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-gray-300 text-sm font-medium">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className={[
          'px-4 py-3 rounded-lg text-sm',
          'bg-surface-700 border text-white placeholder-gray-600',
          'focus:outline-none focus:ring-1 transition-colors duration-150',
          error
            ? 'border-red-600 focus:border-red-500 focus:ring-red-600/30'
            : 'border-surface-500 focus:border-brand-600 focus:ring-brand-600/30',
        ].join(' ')}
      />
      {hint && !error && <p className="text-gray-600 text-xs">{hint}</p>}
      {error && (
        <p className="text-red-400 text-xs flex items-center gap-1">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
            <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8-3.25a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4.75zm0 7.5A.75.75 0 118 11a.75.75 0 010 1.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function CompanyStep() {
  const { empresa, setEmpresa, nextStep, prevStep, skipEmpresaStep } = useWizardStore()
  const [touched, setTouch] = React.useState<Record<string, boolean>>({})
  const [showSkipConfirm, setShowSkipConfirm] = React.useState(false)

  // Qualquer campo foi iniciado?
  const anyFilled =
    empresa.razaoSocial.trim().length > 0 ||
    empresa.cnpj.length > 0 ||
    empresa.endereco.trim().length > 0 ||
    empresa.responsavel.trim().length > 0

  const cnpjError =
    touched.cnpj && empresa.cnpj.length > 0 && !validateCnpj(empresa.cnpj)
      ? 'CNPJ invalido'
      : undefined

  const isValid =
    empresa.razaoSocial.trim().length >= 3 &&
    validateCnpj(empresa.cnpj) &&
    empresa.endereco.trim().length >= 5 &&
    empresa.responsavel.trim().length >= 3

  function blur(field: string) {
    setTouch((t) => ({ ...t, [field]: true }))
  }

  function handleNext() {
    // Toca todos os campos para mostrar erros se parcialmente preenchido
    if (anyFilled && !isValid) {
      setTouch({ razaoSocial: true, cnpj: true, endereco: true, responsavel: true })
      return
    }
    nextStep()
  }

  function handleSkip() {
    if (anyFilled) {
      // Mostra confirmacao inline se o usuario digitou alguma coisa
      setShowSkipConfirm(true)
    } else {
      skipEmpresaStep()
    }
  }

  function confirmSkip() {
    setShowSkipConfirm(false)
    skipEmpresaStep()
  }

  return (
    <div className="flex flex-col min-h-full px-12 py-12">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-white">Dados da empresa</h2>
          <span className="px-2.5 py-1 rounded-full bg-surface-700 border border-surface-500 text-gray-400 text-xs font-medium">
            Opcional
          </span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
          Preencha os dados da empresa que aparecerao nos documentos e relatorios.
          Voce pode pular esta etapa e configurar depois, ao gerar o primeiro documento.
        </p>
      </div>

      {/* Formulario */}
      <div className="max-w-2xl space-y-5">
        <Field
          label="Razao Social"
          value={empresa.razaoSocial}
          onChange={(v) => setEmpresa({ razaoSocial: v })}
          placeholder="Ex: Empresa Exemplo Ltda"
          error={
            touched.razaoSocial && anyFilled && empresa.razaoSocial.trim().length < 3
              ? 'Minimo 3 caracteres'
              : undefined
          }
          onBlur={() => blur('razaoSocial')}
          maxLength={120}
        />

        <Field
          label="CNPJ"
          value={empresa.cnpj}
          onChange={(v) => setEmpresa({ cnpj: formatCnpj(v) })}
          placeholder="00.000.000/0000-00"
          error={cnpjError}
          onBlur={() => blur('cnpj')}
          maxLength={18}
          hint="Digite apenas os numeros - a formatacao e automatica."
        />

        <Field
          label="Endereco completo"
          value={empresa.endereco}
          onChange={(v) => setEmpresa({ endereco: v })}
          placeholder="Rua, no, bairro, cidade/UF - CEP"
          error={
            touched.endereco && anyFilled && empresa.endereco.trim().length < 5
              ? 'Informe o endereco completo'
              : undefined
          }
          onBlur={() => blur('endereco')}
          maxLength={200}
        />

        <Field
          label="Responsavel / Socio-administrador"
          value={empresa.responsavel}
          onChange={(v) => setEmpresa({ responsavel: v })}
          placeholder="Nome completo do responsavel legal"
          error={
            touched.responsavel && anyFilled && empresa.responsavel.trim().length < 3
              ? 'Minimo 3 caracteres'
              : undefined
          }
          onBlur={() => blur('responsavel')}
          maxLength={120}
          hint="Nome que sera exibido como assinante nos documentos."
        />
      </div>

      {/* Confirmacao de skip inline */}
      {showSkipConfirm && (
        <div className="max-w-2xl mt-6 p-4 rounded-xl bg-yellow-900/20 border border-yellow-700/50 flex items-start gap-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-yellow-300 text-sm font-medium mb-1">
              Pular com dados parciais?
            </p>
            <p className="text-yellow-400/70 text-xs mb-3">
              Os campos preenchidos serao descartados. Voce configurara os dados da empresa depois.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmSkip}
                className="px-4 py-1.5 rounded-lg bg-yellow-700/50 hover:bg-yellow-700/70 text-yellow-200 text-xs font-medium transition-colors"
              >
                Sim, pular mesmo assim
              </button>
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="px-4 py-1.5 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-300 text-xs font-medium transition-colors"
              >
                Continuar preenchendo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rodape */}
      <div className="mt-auto pt-8 flex items-center justify-between border-t border-surface-500">

        {/* Anterior */}
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-700 transition-all duration-150 text-sm font-medium"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Anterior
        </button>

        {/* Grupo direito: Pular + Proximo */}
        <div className="flex items-center gap-3">

          {/* Pular por enquanto */}
          <button
            onClick={handleSkip}
            className="
              flex items-center gap-1.5 px-4 py-2.5 rounded-lg
              text-gray-500 hover:text-gray-300
              hover:bg-surface-700
              border border-transparent hover:border-surface-500
              text-sm font-medium
              transition-all duration-150
            "
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10.21 14.77a.75.75 0 01.02-1.06L14.168 10 10.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4.21 14.77a.75.75 0 01.02-1.06L8.168 10 4.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
            Pular por enquanto
          </button>

          {/* Proximo */}
          <button
            onClick={handleNext}
            className="
              flex items-center gap-2 px-7 py-2.5 rounded-lg
              bg-brand-600 hover:bg-brand-500
              text-white font-semibold text-sm
              shadow-lg shadow-brand-600/30
              transition-all duration-150 active:scale-95
            "
          >
            Proximo
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
            </svg>
          </button>

        </div>
      </div>
    </div>
  )
}