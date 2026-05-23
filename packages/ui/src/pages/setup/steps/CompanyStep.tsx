import React from 'react'
import { useWizardStore } from '@/state/wizardStore'

// ── Helpers ────────────────────────────────────────────────────────────────

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

// ── Input field genérico ────────────────────────────────────────────────────

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: string
  required?: boolean
  hint?: string
  maxLength?: number
  type?: string
}

function Field({ label, value, onChange, onBlur, placeholder, error, required, hint, maxLength, type = 'text' }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-baseline gap-1">
        <span className="text-gray-300 text-sm font-medium">{label}</span>
        {required && <span className="text-brand-400 text-xs">*</span>}
      </label>
      <input
        type={type}
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
      {error && <p className="text-red-400 text-xs flex items-center gap-1">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
          <path fillRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8-3.25a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4.75zm0 7.5A.75.75 0 118 11a.75.75 0 010 1.5z" />
        </svg>
        {error}
      </p>}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────

export default function CompanyStep() {
  const { empresa, setEmpresa, nextStep, prevStep } = useWizardStore()
  const [touched, setTouch] = React.useState<Record<string, boolean>>({})

  const cnpjRaw    = empresa.cnpj.replace(/\D/g, '')
  const cnpjError  = touched.cnpj && cnpjRaw.length > 0 && !validateCnpj(empresa.cnpj)
    ? 'CNPJ inválido'
    : undefined

  const isValid =
    empresa.razaoSocial.trim().length >= 3 &&
    validateCnpj(empresa.cnpj) &&
    empresa.endereco.trim().length >= 5 &&
    empresa.responsavel.trim().length >= 3

  function blur(field: string) {
    setTouch((t) => ({ ...t, [field]: true }))
  }

  return (
    <div className="flex flex-col min-h-full px-12 py-12">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">Dados da empresa</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
          Preencha os dados da empresa que aparecerão nos documentos e relatórios gerados pelo sistema.
          Essas informações podem ser alteradas posteriormente.
        </p>
      </div>

      {/* Formulário */}
      <div className="max-w-2xl space-y-5">
        <Field
          label="Razão Social"
          value={empresa.razaoSocial}
          onChange={(v) => setEmpresa({ razaoSocial: v })}
          placeholder="Ex: Empresa Exemplo Ltda"
          required
          error={touched.razaoSocial && empresa.razaoSocial.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined}
          onBlur={() => blur('razaoSocial')}
          maxLength={120}
        />

        <Field
          label="CNPJ"
          value={empresa.cnpj}
          onChange={(v) => setEmpresa({ cnpj: formatCnpj(v) })}
          placeholder="00.000.000/0000-00"
          required
          error={cnpjError}
          onBlur={() => blur('cnpj')}
          maxLength={18}
          hint="Digite apenas os números — a formatação é automática."
        />

        <Field
          label="Endereço completo"
          value={empresa.endereco}
          onChange={(v) => setEmpresa({ endereco: v })}
          placeholder="Rua, nº, bairro, cidade/UF — CEP"
          required
          error={touched.endereco && empresa.endereco.trim().length < 5 ? 'Informe o endereço completo' : undefined}
          onBlur={() => blur('endereco')}
          maxLength={200}
        />

        <Field
          label="Responsável / Sócio-administrador"
          value={empresa.responsavel}
          onChange={(v) => setEmpresa({ responsavel: v })}
          placeholder="Nome completo do responsável legal"
          required
          error={touched.responsavel && empresa.responsavel.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined}
          onBlur={() => blur('responsavel')}
          maxLength={120}
          hint="Nome que será exibido como assinante nos documentos."
        />
      </div>

      {/* Rodapé */}
      <div className="mt-auto pt-8 flex items-center justify-between border-t border-surface-500">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-700 transition-all duration-150 text-sm font-medium"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Anterior
        </button>

        <button
          onClick={nextStep}
          disabled={!isValid}
          className="
            flex items-center gap-2 px-7 py-2.5 rounded-lg
            bg-brand-600 hover:bg-brand-500
            text-white font-semibold text-sm
            disabled:opacity-40 disabled:cursor-not-allowed
            shadow-lg shadow-brand-600/30
            transition-all duration-150 active:scale-95
          "
        >
          Próximo
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}

