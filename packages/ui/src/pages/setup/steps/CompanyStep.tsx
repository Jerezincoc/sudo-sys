import React from 'react'
import { useWizardStore } from '@/state/wizardStore'

function formatCnpj(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function validateCnpj(cnpj: string): boolean {
  const d = cnpj.replace(/\D/g, '')
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false
  const calc = (s: string, w: number[]) => w.reduce((sum, x, i) => sum + Number(s[i]) * x, 0)
  const r1 = calc(d, [5,4,3,2,9,8,7,6,5,4,3,2]) % 11
  const r2 = calc(d, [6,5,4,3,2,9,8,7,6,5,4,3,2]) % 11
  return Number(d[12]) === (r1 < 2 ? 0 : 11 - r1) && Number(d[13]) === (r2 < 2 ? 0 : 11 - r2)
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 26,
  padding: '0 8px',
  border: '1px solid var(--color-border-main)',
  background: 'var(--color-bg-white)',
  color: 'var(--color-text-primary)',
  fontSize: 12,
  outline: 'none',
  fontFamily: "'Segoe UI', system-ui, sans-serif",
}

const inputErrStyle: React.CSSProperties = {
  ...inputStyle,
  border: '1px solid var(--color-btn-del)',
}

interface FieldProps {
  label: string; value: string; onChange: (v: string) => void
  onBlur?: () => void; placeholder?: string; error?: string
  hint?: string; maxLength?: number
}

function Field({ label, value, onChange, onBlur, placeholder, error, hint, maxLength }: FieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 3 }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        style={error ? inputErrStyle : inputStyle}
      />
      {hint && !error && (
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: 10, color: 'var(--color-btn-del)', marginTop: 2, fontWeight: 600 }}>
          ✕ {error}
        </div>
      )}
    </div>
  )
}

export default function CompanyStep() {
  const { empresa, setEmpresa, nextStep, prevStep, skipEmpresaStep } = useWizardStore()
  const [touched, setTouch] = React.useState<Record<string, boolean>>({})
  const [showSkipConfirm, setShowSkipConfirm] = React.useState(false)

  const anyFilled =
    empresa.razaoSocial.trim().length > 0 || empresa.cnpj.length > 0 ||
    empresa.endereco.trim().length > 0   || empresa.responsavel.trim().length > 0

  const isValid =
    empresa.razaoSocial.trim().length >= 3 && validateCnpj(empresa.cnpj) &&
    empresa.endereco.trim().length >= 5   && empresa.responsavel.trim().length >= 3

  const cnpjError = touched.cnpj && empresa.cnpj.length > 0 && !validateCnpj(empresa.cnpj)
    ? 'CNPJ inválido' : undefined

  function blur(f: string) { setTouch((t) => ({ ...t, [f]: true })) }

  function handleNext() {
    if (anyFilled && !isValid) {
      setTouch({ razaoSocial: true, cnpj: true, endereco: true, responsavel: true })
      return
    }
    nextStep()
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 600 }}>

      {/* Header */}
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid var(--color-brand)' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: 4 }}>
          Dados da Empresa / Passo 3 de 4
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-brand)', display: 'flex', alignItems: 'center', gap: 10 }}>
          Dados da Empresa
          <span style={{
            fontSize: 10,
            fontWeight: 600,
            background: 'var(--color-bg-panel)',
            border: '1px solid var(--color-border-main)',
            color: 'var(--color-text-muted)',
            padding: '1px 8px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            Opcional
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
          Preencha os dados que aparecerão nos documentos e relatórios.
          Você pode pular e configurar depois ao gerar o primeiro documento.
        </div>
      </div>

      {/* Form */}
      <Field
        label="Razão Social"
        value={empresa.razaoSocial}
        onChange={(v) => setEmpresa({ razaoSocial: v })}
        placeholder="Empresa Exemplo Ltda"
        error={touched.razaoSocial && anyFilled && empresa.razaoSocial.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined}
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
        hint="Digite apenas os números — a formatação é automática."
      />
      <Field
        label="Endereço completo"
        value={empresa.endereco}
        onChange={(v) => setEmpresa({ endereco: v })}
        placeholder="Rua, nº, bairro, cidade/UF — CEP"
        error={touched.endereco && anyFilled && empresa.endereco.trim().length < 5 ? 'Informe o endereço completo' : undefined}
        onBlur={() => blur('endereco')}
        maxLength={200}
      />
      <Field
        label="Responsável / Sócio-administrador"
        value={empresa.responsavel}
        onChange={(v) => setEmpresa({ responsavel: v })}
        placeholder="Nome completo do responsável legal"
        error={touched.responsavel && anyFilled && empresa.responsavel.trim().length < 3 ? 'Mínimo 3 caracteres' : undefined}
        onBlur={() => blur('responsavel')}
        maxLength={120}
        hint="Nome exibido como assinante nos documentos."
      />

      {/* Skip confirm */}
      {showSkipConfirm && (
        <div style={{
          marginBottom: 12,
          padding: '8px 10px',
          background: '#fff8e1',
          border: '1px solid #f59e0b',
          fontSize: 11,
        }}>
          <div style={{ fontWeight: 600, color: '#7a4f00', marginBottom: 4 }}>
            ⚠ Pular com dados parciais?
          </div>
          <div style={{ color: '#92400e', marginBottom: 8 }}>
            Os campos preenchidos serão descartados. Você configurará a empresa depois.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setShowSkipConfirm(false); skipEmpresaStep() }}
              style={{ height: 22, padding: '0 10px', background: '#92400e', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              Sim, pular
            </button>
            <button
              onClick={() => setShowSkipConfirm(false)}
              style={{ height: 22, padding: '0 10px', background: 'var(--color-bg-panel)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-main)', fontSize: 11, cursor: 'pointer' }}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 20,
        paddingTop: 12,
        borderTop: '1px solid var(--color-border-main)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={prevStep}
          style={{ height: 26, padding: '0 14px', border: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)', color: 'var(--color-text-secondary)', fontSize: 12, cursor: 'pointer' }}
        >
          ← Anterior
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => anyFilled ? setShowSkipConfirm(true) : skipEmpresaStep()}
            style={{ height: 26, padding: '0 12px', border: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)', color: 'var(--color-text-muted)', fontSize: 11, cursor: 'pointer' }}
          >
            Pular por enquanto »
          </button>
          <button
            onClick={handleNext}
            style={{ height: 26, padding: '0 20px', border: '1px solid var(--color-brand)', background: 'var(--color-brand)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            Próximo →
          </button>
        </div>
      </div>
    </div>
  )
}
