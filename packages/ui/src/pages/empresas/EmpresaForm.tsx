/**
 * EmpresaForm.tsx
 * Modal com 4 abas (Dados Gerais | Endereço | Contato | Parâmetros DP).
 * Estilo TOTVS RM: zero border-radius, zero shadow, inputs 24px, labels 11px uppercase.
 */
import React, { useState, useEffect, useCallback } from 'react'
import type { Empresa, CreateEmpresaPayload, UpdateEmpresaPayload } from '@sudo-sys/shared'

// ── Tipos ──────────────────────────────────────────────────────────────────

type FormData = Partial<Omit<Empresa, 'id' | 'created_at' | 'updated_at'>>
type Errors = Record<string, string>
type Tab = 0 | 1 | 2 | 3

interface Props {
  /** null = novo, Empresa = editar */
  empresa: Empresa | null
  onClose: () => void
  onSaved: (empresa: Empresa) => void
  setStatusMsg: (msg: string, type?: 'success' | 'error') => void
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCNPJ(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function formatCEP(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

function validateCNPJ(cnpj: string): boolean {
  const s = cnpj.replace(/\D/g, '')
  if (s.length !== 14) return false
  if (/^(\d)\1+$/.test(s)) return false
  let sum = 0, w = 5
  for (let i = 0; i < 12; i++) { sum += parseInt(s[i]) * w; w = w === 2 ? 9 : w - 1 }
  const d1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (parseInt(s[12]) !== d1) return false
  sum = 0; w = 6
  for (let i = 0; i < 13; i++) { sum += parseInt(s[i]) * w; w = w === 2 ? 9 : w - 1 }
  const d2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  return parseInt(s[13]) === d2
}

async function fetchViaCEP(cep: string): Promise<Partial<FormData> | null> {
  const stripped = cep.replace(/\D/g, '')
  if (stripped.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${stripped}/json/`)
    const data = await res.json() as Record<string, string>
    if (data.erro) return null
    return {
      logradouro: data.logradouro ?? '',
      bairro: data.bairro ?? '',
      cidade: data.localidade ?? '',
      uf: data.uf ?? '',
    }
  } catch {
    return null
  }
}

function emptyForm(): FormData {
  return {
    codigo: '',
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    cnae_principal: '',
    natureza_juridica: '',
    data_abertura: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    telefone: '',
    email: '',
    site: '',
    responsavel: '',
    cargo_responsavel: '',
    regime_tributario: '',
    fpas: '',
    codigo_gps: '',
    aliquota_rat: undefined,
    fap: undefined,
    lotacao_tributaria: '',
    grau_risco: undefined,
    status: 'ativa',
  }
}

// ── Componentes de campo ──────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--color-text-muted)',
      marginBottom: 1,
      userSelect: 'none',
    }}>
      {children}{required && <span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>}
    </div>
  )
}

interface InputProps {
  label: string
  value: string | number | undefined | null
  onChange: (v: string) => void
  onBlur?: () => void
  error?: string
  required?: boolean
  placeholder?: string
  type?: string
  maxLength?: number
  disabled?: boolean
  width?: number | string
}

function Field({
  label, value, onChange, onBlur, error, required, placeholder,
  type = 'text', maxLength, disabled, width,
}: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        style={{
          height: 24,
          padding: '0 4px',
          fontSize: 12,
          border: `1px solid ${error ? '#e53e3e' : 'var(--color-border-main)'}`,
          background: disabled ? 'var(--color-bg-panel)' : 'var(--color-bg-white)',
          color: 'var(--color-text-primary)',
          outline: 'none',
          borderRadius: 0,
          width: '100%',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-brand)'
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = error ? '#e53e3e' : 'var(--color-border-main)'
        }}
      />
      {error && (
        <span style={{ fontSize: 10, color: '#e53e3e', marginTop: 1 }}>{error}</span>
      )}
    </div>
  )
}

interface SelectFieldProps {
  label: string
  value: string | number | undefined | null
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
  width?: number | string
}

function SelectField({ label, value, onChange, options, error, required, width }: SelectFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 24,
          padding: '0 4px',
          fontSize: 12,
          border: `1px solid ${error ? '#e53e3e' : 'var(--color-border-main)'}`,
          background: 'var(--color-bg-white)',
          color: 'var(--color-text-primary)',
          outline: 'none',
          borderRadius: 0,
          width: '100%',
          boxSizing: 'border-box',
          cursor: 'pointer',
        }}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: 10, color: '#e53e3e', marginTop: 1 }}>{error}</span>
      )}
    </div>
  )
}

// ── UF options ─────────────────────────────────────────────────────────────
const UF_OPTIONS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO',
].map((uf) => ({ value: uf, label: uf }))

const REGIME_OPTIONS = [
  { value: 'simples', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
]

const GRAU_OPTIONS = [
  { value: '1', label: '1 — Mínimo' },
  { value: '2', label: '2 — Médio' },
  { value: '3', label: '3 — Alto' },
  { value: '4', label: '4 — Máximo' },
]

// ── Row helper ─────────────────────────────────────────────────────────────
function Row({ children, gap = 8 }: { children: React.ReactNode; gap?: number }) {
  return (
    <div style={{ display: 'flex', gap, marginBottom: 8 }}>
      {children}
    </div>
  )
}

// ── EmpresaForm ────────────────────────────────────────────────────────────

export default function EmpresaForm({ empresa, onClose, onSaved, setStatusMsg }: Props) {
  const isNew = empresa === null
  const [tab, setTab] = useState<Tab>(0)
  const [form, setForm] = useState<FormData>(() =>
    isNew ? emptyForm() : {
      codigo: empresa.codigo,
      razao_social: empresa.razao_social,
      nome_fantasia: empresa.nome_fantasia ?? '',
      cnpj: empresa.cnpj,
      inscricao_estadual: empresa.inscricao_estadual ?? '',
      inscricao_municipal: empresa.inscricao_municipal ?? '',
      cnae_principal: empresa.cnae_principal ?? '',
      natureza_juridica: empresa.natureza_juridica ?? '',
      data_abertura: empresa.data_abertura ?? '',
      cep: empresa.cep ?? '',
      logradouro: empresa.logradouro ?? '',
      numero: empresa.numero ?? '',
      complemento: empresa.complemento ?? '',
      bairro: empresa.bairro ?? '',
      cidade: empresa.cidade ?? '',
      uf: empresa.uf ?? '',
      telefone: empresa.telefone ?? '',
      email: empresa.email ?? '',
      site: empresa.site ?? '',
      responsavel: empresa.responsavel ?? '',
      cargo_responsavel: empresa.cargo_responsavel ?? '',
      regime_tributario: empresa.regime_tributario ?? '',
      fpas: empresa.fpas ?? '',
      codigo_gps: empresa.codigo_gps ?? '',
      aliquota_rat: empresa.aliquota_rat ?? undefined,
      fap: empresa.fap ?? undefined,
      lotacao_tributaria: empresa.lotacao_tributaria ?? '',
      grau_risco: empresa.grau_risco ?? undefined,
      status: empresa.status,
    }
  )

  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)

  // ── field helper ─────────────────────────────────────────────────
  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e })
  }

  // ── ViaCEP ───────────────────────────────────────────────────────
  const handleCepBlur = useCallback(async () => {
    const cep = form.cep?.replace(/\D/g, '') ?? ''
    if (cep.length !== 8) return
    setCepLoading(true)
    const addr = await fetchViaCEP(cep)
    setCepLoading(false)
    if (addr) {
      setForm((prev) => ({ ...prev, ...addr }))
    }
  }, [form.cep])

  // ── validação ────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Errors = {}
    if (!form.razao_social || form.razao_social.trim().length < 3)
      e.razao_social = 'Mínimo 3 caracteres.'
    if (!form.cnpj)
      e.cnpj = 'CNPJ é obrigatório.'
    else if (!validateCNPJ(form.cnpj))
      e.cnpj = 'CNPJ inválido.'
    if (form.aliquota_rat !== undefined && form.aliquota_rat !== null) {
      if (form.aliquota_rat < 0.1 || form.aliquota_rat > 3.0)
        e.aliquota_rat = 'Entre 0.1 e 3.0.'
    }
    if (form.fap !== undefined && form.fap !== null) {
      if (form.fap < 0.5 || form.fap > 2.0)
        e.fap = 'Entre 0.5 e 2.0.'
    }
    setErrors(e)
    // Ir para a aba com o primeiro erro
    if (e.razao_social || e.cnpj) setTab(0)
    else if (e.cep) setTab(1)
    else if (e.aliquota_rat || e.fap) setTab(3)
    return Object.keys(e).length === 0
  }

  // ── salvar ───────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const hasElectron = typeof window !== 'undefined' && !!window.electronAPI

      if (isNew) {
        const payload: CreateEmpresaPayload = {
          codigo: form.codigo || '',
          razao_social: form.razao_social!,
          nome_fantasia: form.nome_fantasia || null,
          cnpj: form.cnpj!,
          inscricao_estadual: form.inscricao_estadual || null,
          inscricao_municipal: form.inscricao_municipal || null,
          cnae_principal: form.cnae_principal || null,
          natureza_juridica: form.natureza_juridica || null,
          data_abertura: form.data_abertura || null,
          cep: form.cep || null,
          logradouro: form.logradouro || null,
          numero: form.numero || null,
          complemento: form.complemento || null,
          bairro: form.bairro || null,
          cidade: form.cidade || null,
          uf: form.uf || null,
          telefone: form.telefone || null,
          email: form.email || null,
          site: form.site || null,
          responsavel: form.responsavel || null,
          cargo_responsavel: form.cargo_responsavel || null,
          regime_tributario: form.regime_tributario || null,
          fpas: form.fpas || null,
          codigo_gps: form.codigo_gps || null,
          aliquota_rat: form.aliquota_rat ?? null,
          fap: form.fap ?? null,
          lotacao_tributaria: form.lotacao_tributaria || null,
          grau_risco: form.grau_risco ?? null,
          status: form.status ?? 'ativa',
        }

        if (hasElectron) {
          const result = await window.electronAPI.createEmpresa(payload)
          if (!result.success) {
            setErrors({ _global: result.error })
            return
          }
          setStatusMsg(`Empresa "${result.data.razao_social}" cadastrada com sucesso.`, 'success')
          onSaved(result.data)
        } else {
          // mock para dev browser
          const mock: Empresa = { ...payload, id: Date.now(), codigo: '0001', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
          setStatusMsg(`[DEV] Empresa "${mock.razao_social}" cadastrada.`, 'success')
          onSaved(mock)
        }
      } else {
        const payload: UpdateEmpresaPayload = {
          id: empresa!.id,
          razao_social: form.razao_social,
          nome_fantasia: form.nome_fantasia || null,
          cnpj: form.cnpj,
          inscricao_estadual: form.inscricao_estadual || null,
          inscricao_municipal: form.inscricao_municipal || null,
          cnae_principal: form.cnae_principal || null,
          natureza_juridica: form.natureza_juridica || null,
          data_abertura: form.data_abertura || null,
          cep: form.cep || null,
          logradouro: form.logradouro || null,
          numero: form.numero || null,
          complemento: form.complemento || null,
          bairro: form.bairro || null,
          cidade: form.cidade || null,
          uf: form.uf || null,
          telefone: form.telefone || null,
          email: form.email || null,
          site: form.site || null,
          responsavel: form.responsavel || null,
          cargo_responsavel: form.cargo_responsavel || null,
          regime_tributario: form.regime_tributario || null,
          fpas: form.fpas || null,
          codigo_gps: form.codigo_gps || null,
          aliquota_rat: form.aliquota_rat ?? null,
          fap: form.fap ?? null,
          lotacao_tributaria: form.lotacao_tributaria || null,
          grau_risco: form.grau_risco ?? null,
          status: form.status ?? 'ativa',
        }

        if (hasElectron) {
          const result = await window.electronAPI.updateEmpresa(payload)
          if (!result.success) {
            setErrors({ _global: result.error })
            return
          }
          setStatusMsg(`Empresa "${result.data.razao_social}" atualizada.`, 'success')
          onSaved(result.data)
        } else {
          const mock: Empresa = { ...empresa!, ...payload, updated_at: new Date().toISOString() }
          setStatusMsg(`[DEV] Empresa "${mock.razao_social}" atualizada.`, 'success')
          onSaved(mock)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Esc fecha ───────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // ── Render ───────────────────────────────────────────────────────
  const TABS = ['Dados Gerais', 'Endereço', 'Contato', 'Parâmetros DP']

  return (
    /* Overlay */
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      {/* Modal */}
      <div style={{
        width: 780,
        maxHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-white)',
        border: '1px solid var(--color-border-main)',
        overflow: 'hidden',
      }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{
          height: 28,
          background: 'var(--color-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
            {isNew ? 'Nova Empresa' : `Empresa — ${empresa!.codigo} · ${empresa!.razao_social}`}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 18, height: 18,
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.8)', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div style={{
          height: 26,
          background: 'var(--color-bg-panel)',
          borderBottom: '1px solid var(--color-border-main)',
          display: 'flex',
          alignItems: 'flex-end',
          flexShrink: 0,
        }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i as Tab)}
              style={{
                height: 24,
                padding: '0 14px',
                border: '1px solid var(--color-border-main)',
                borderBottom: tab === i ? '1px solid var(--color-bg-white)' : '1px solid var(--color-border-main)',
                borderTop: tab === i ? '2px solid var(--color-brand)' : '2px solid transparent',
                background: tab === i ? 'var(--color-bg-white)' : 'var(--color-bg-panel)',
                color: tab === i ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: 11,
                fontWeight: tab === i ? 600 : 400,
                cursor: 'pointer',
                marginRight: 2,
                position: 'relative',
                bottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Conteúdo das Abas ───────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, background: 'var(--color-bg-app)' }}>

          {errors._global && (
            <div style={{
              marginBottom: 8,
              padding: '4px 8px',
              background: '#fff0f0',
              border: '1px solid #e53e3e',
              fontSize: 11,
              color: '#c53030',
            }}>
              {errors._global}
            </div>
          )}

          {/* ── Aba 0: Dados Gerais ─────────────────────────────── */}
          {tab === 0 && (
            <div>
              <Row>
                <Field label="Código" value={form.codigo} onChange={(v) => set('codigo', v)}
                  width={70} maxLength={4} />
                <div style={{ flex: 1 }}>
                  <Field label="Razão Social" value={form.razao_social}
                    onChange={(v) => set('razao_social', v)} required error={errors.razao_social} />
                </div>
              </Row>
              <Row>
                <div style={{ flex: 1 }}>
                  <Field label="Nome Fantasia" value={form.nome_fantasia}
                    onChange={(v) => set('nome_fantasia', v)} />
                </div>
                <div style={{ width: 180 }}>
                  <Field label="CNPJ" value={formatCNPJ(form.cnpj ?? '')}
                    onChange={(v) => set('cnpj', v.replace(/\D/g, ''))}
                    onBlur={() => {
                      if (form.cnpj && !validateCNPJ(form.cnpj))
                        setErrors((prev) => ({ ...prev, cnpj: 'CNPJ inválido.' }))
                    }}
                    required error={errors.cnpj} maxLength={18} />
                </div>
              </Row>
              <Row>
                <div style={{ flex: 1 }}>
                  <Field label="Inscrição Estadual" value={form.inscricao_estadual}
                    onChange={(v) => set('inscricao_estadual', v)} />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Inscrição Municipal" value={form.inscricao_municipal}
                    onChange={(v) => set('inscricao_municipal', v)} />
                </div>
              </Row>
              <Row>
                <div style={{ width: 120 }}>
                  <Field label="CNAE Principal" value={form.cnae_principal}
                    onChange={(v) => set('cnae_principal', v)} maxLength={10} />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Natureza Jurídica" value={form.natureza_juridica}
                    onChange={(v) => set('natureza_juridica', v)} />
                </div>
                <div style={{ width: 130 }}>
                  <Field label="Data de Abertura" value={form.data_abertura}
                    onChange={(v) => set('data_abertura', v)} type="date" />
                </div>
              </Row>
              <Row>
                <SelectField label="Status" value={form.status}
                  onChange={(v) => set('status', v as 'ativa' | 'inativa')}
                  options={[{ value: 'ativa', label: 'Ativa' }, { value: 'inativa', label: 'Inativa' }]}
                  width={100}
                />
              </Row>
            </div>
          )}

          {/* ── Aba 1: Endereço ─────────────────────────────────── */}
          {tab === 1 && (
            <div>
              <Row>
                <div style={{ width: 110 }}>
                  <Field label={cepLoading ? 'CEP (buscando...)' : 'CEP'}
                    value={formatCEP(form.cep ?? '')}
                    onChange={(v) => set('cep', v.replace(/\D/g, ''))}
                    onBlur={handleCepBlur}
                    maxLength={9}
                    error={errors.cep}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Logradouro" value={form.logradouro}
                    onChange={(v) => set('logradouro', v)} />
                </div>
                <div style={{ width: 80 }}>
                  <Field label="Número" value={form.numero}
                    onChange={(v) => set('numero', v)} />
                </div>
              </Row>
              <Row>
                <div style={{ flex: 1 }}>
                  <Field label="Complemento" value={form.complemento}
                    onChange={(v) => set('complemento', v)} />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Bairro" value={form.bairro}
                    onChange={(v) => set('bairro', v)} />
                </div>
              </Row>
              <Row>
                <div style={{ flex: 1 }}>
                  <Field label="Cidade" value={form.cidade}
                    onChange={(v) => set('cidade', v)} />
                </div>
                <SelectField label="UF" value={form.uf}
                  onChange={(v) => set('uf', v)} options={UF_OPTIONS} width={80} />
              </Row>
            </div>
          )}

          {/* ── Aba 2: Contato ──────────────────────────────────── */}
          {tab === 2 && (
            <div>
              <Row>
                <div style={{ width: 160 }}>
                  <Field label="Telefone" value={form.telefone}
                    onChange={(v) => set('telefone', v)} />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="E-mail" value={form.email}
                    onChange={(v) => set('email', v)} type="email" />
                </div>
              </Row>
              <Row>
                <div style={{ flex: 1 }}>
                  <Field label="Site" value={form.site}
                    onChange={(v) => set('site', v)} placeholder="https://" />
                </div>
              </Row>
              <div style={{
                height: 1, background: 'var(--color-border-main)',
                margin: '8px 0',
              }} />
              <Row>
                <div style={{ flex: 1 }}>
                  <Field label="Responsável" value={form.responsavel}
                    onChange={(v) => set('responsavel', v)} />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Cargo do Responsável" value={form.cargo_responsavel}
                    onChange={(v) => set('cargo_responsavel', v)} />
                </div>
              </Row>
            </div>
          )}

          {/* ── Aba 3: Parâmetros DP ───────────────────────────── */}
          {tab === 3 && (
            <div>
              <Row>
                <SelectField label="Regime Tributário" value={form.regime_tributario}
                  onChange={(v) => set('regime_tributario', v)}
                  options={REGIME_OPTIONS} width={200} />
                <div style={{ width: 100 }}>
                  <Field label="FPAS" value={form.fpas}
                    onChange={(v) => set('fpas', v)} maxLength={10} />
                </div>
                <div style={{ width: 100 }}>
                  <Field label="Código GPS" value={form.codigo_gps}
                    onChange={(v) => set('codigo_gps', v)} maxLength={10} />
                </div>
              </Row>
              <Row>
                <div style={{ width: 120 }}>
                  <Field label="Alíquota RAT (0.1–3.0)" value={form.aliquota_rat ?? ''}
                    onChange={(v) => set('aliquota_rat', v === '' ? undefined : parseFloat(v))}
                    type="number" error={errors.aliquota_rat} />
                </div>
                <div style={{ width: 120 }}>
                  <Field label="FAP (0.5–2.0)" value={form.fap ?? ''}
                    onChange={(v) => set('fap', v === '' ? undefined : parseFloat(v))}
                    type="number" error={errors.fap} />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Lotação Tributária" value={form.lotacao_tributaria}
                    onChange={(v) => set('lotacao_tributaria', v)} />
                </div>
              </Row>
              <Row>
                <SelectField label="Grau de Risco" value={form.grau_risco?.toString() ?? ''}
                  onChange={(v) => set('grau_risco', v === '' ? undefined : parseInt(v))}
                  options={GRAU_OPTIONS} width={160} />
              </Row>
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div style={{
          height: 36,
          flexShrink: 0,
          background: 'var(--color-bg-panel)',
          borderTop: '1px solid var(--color-border-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '0 8px',
          gap: 6,
        }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={footerBtn('secondary')}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={footerBtn('primary')}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function footerBtn(variant: 'primary' | 'secondary'): React.CSSProperties {
  return {
    height: 24,
    padding: '0 16px',
    fontSize: 12,
    fontWeight: 500,
    border: '1px solid var(--color-border-main)',
    background: variant === 'primary' ? 'var(--color-brand)' : 'var(--color-bg-white)',
    color: variant === 'primary' ? '#fff' : 'var(--color-text-primary)',
    cursor: 'pointer',
    borderRadius: 0,
  }
}
