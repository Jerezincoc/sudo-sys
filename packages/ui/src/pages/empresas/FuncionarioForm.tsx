/**
 * FuncionarioForm.tsx
 * Modal com 5 abas (Dados Pessoais | Dados Profissionais | Remuneração | Endereço | Bancários/Docs).
 * Estilo TOTVS RM: zero border-radius, zero shadow, inputs 24px, labels 11px uppercase.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { Funcionario, CreateFuncionarioPayload, UpdateFuncionarioPayload } from '@sudo-sys/shared'

// ── Tipos ──────────────────────────────────────────────────────────────────

type FormData = Partial<Omit<Funcionario, 'id' | 'created_at' | 'updated_at'>>
type Errors = Record<string, string>
type Tab = 0 | 1 | 2 | 3 | 4

interface Props {
  /** null = novo, Funcionario = editar */
  funcionario: Funcionario | null
  empresaId: number
  onClose: () => void
  onSaved: (func: Funcionario) => void
  setStatusMsg: (msg: string, type?: 'success' | 'error') => void
}

// ── Formatadores / validadores ─────────────────────────────────────────────

function formatCPF(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function validateCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i)
  const r1 = (sum * 10) % 11
  const d1 = r1 === 10 || r1 === 11 ? 0 : r1
  if (parseInt(d[9]) !== d1) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i)
  const r2 = (sum * 10) % 11
  const d2 = r2 === 10 || r2 === 11 ? 0 : r2
  return parseInt(d[10]) === d2
}

function formatCEP(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
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
      bairro:     data.bairro    ?? '',
      cidade:     data.localidade ?? '',
      uf:         data.uf        ?? '',
    }
  } catch {
    return null
  }
}

function emptyForm(empresaId: number): FormData {
  return {
    empresa_id:      empresaId,
    codigo:          '',
    nome:            '',
    cpf:             '',
    rg:              '',
    data_nascimento: '',
    sexo:            '',
    estado_civil:    '',
    escolaridade:    '',
    cargo:           '',
    cbo_codigo:      '',
    numero_dependentes_irrf: 0,
    regime_irrf:     'dependentes',
    departamento:    '',
    data_admissao:   '',
    data_demissao:   '',
    tipo_contrato:   'clt',
    salario_base:    0,
    carga_horaria:   220,
    periculosidade:  0,
    insalubridade:   '',
    vale_transporte: 0,
    vale_refeicao:   undefined,
    plano_saude:     undefined,
    cep:             '',
    logradouro:      '',
    numero:          '',
    complemento:     '',
    bairro:          '',
    cidade:          '',
    uf:              '',
    telefone:        '',
    email:           '',
    banco:           '',
    agencia:         '',
    conta:           '',
    pis_pasep:       '',
    ctps:            '',
    status:          'ativo',
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
  step?: string
}

function Field({
  label, value, onChange, onBlur, error, required, placeholder,
  type = 'text', maxLength, disabled, width, step,
}: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        step={step}
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
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)' }}
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

interface CheckFieldProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  width?: number | string
}

function CheckField({ label, checked, onChange, width }: CheckFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{
        height: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 14, height: 14, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {checked ? 'Sim' : 'Não'}
        </span>
      </div>
    </div>
  )
}

function Row({ children, gap = 8 }: { children: React.ReactNode; gap?: number }) {
  return (
    <div style={{ display: 'flex', gap, marginBottom: 8 }}>
      {children}
    </div>
  )
}

// ── Opções de select ───────────────────────────────────────────────────────

const SEXO_OPTIONS     = [{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }, { value: 'O', label: 'Outro' }]
const EC_OPTIONS       = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'Outros'].map((v) => ({ value: v, label: v }))
const ESC_OPTIONS      = ['Fundamental Incompleto', 'Fundamental Completo', 'Médio Incompleto', 'Médio Completo', 'Superior Incompleto', 'Superior Completo', 'Pós-Graduação', 'Mestrado', 'Doutorado'].map((v) => ({ value: v, label: v }))
const CONTRATO_OPTIONS = [{ value: 'clt', label: 'CLT' }, { value: 'pj', label: 'PJ' }, { value: 'temporario', label: 'Temporário' }, { value: 'estagio', label: 'Estágio' }]
const STATUS_OPTIONS   = [{ value: 'ativo', label: 'Ativo' }, { value: 'inativo', label: 'Inativo' }, { value: 'demitido', label: 'Demitido' }]
const INSALUB_OPTIONS  = [{ value: '', label: 'Não' }, { value: '10', label: '10%' }, { value: '20', label: '20%' }, { value: '40', label: '40%' }]
const UF_OPTIONS       = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map((uf) => ({ value: uf, label: uf }))
const REGIME_IRRF_OPTIONS = [{ value: 'dependentes', label: 'Dependentes' }, { value: 'simplificado', label: 'Desconto Simplificado' }]

// ── CboSearchField ────────────────────────────────────────────────────────

interface CboSearchFieldProps {
  value: string
  onChange: (codigo: string, descricao: string) => void
  cboList: { codigo: string; descricao: string }[]
  width?: number | string
}

function CboSearchField({ value, onChange, cboList, width }: CboSearchFieldProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = cboList.find((c) => c.codigo === value)
  const displayText = selected ? `${selected.codigo} — ${selected.descricao}` : query

  const filtered = query.length < 2
    ? []
    : cboList.filter(
        (c) =>
          c.codigo.includes(query) ||
          c.descricao.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 30)

  useEffect(() => {
    function onClickOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOut)
    return () => document.removeEventListener('mousedown', onClickOut)
  }, [])

  function handleSelect(c: { codigo: string; descricao: string }) {
    onChange(c.codigo, c.descricao)
    setQuery('')
    setOpen(false)
  }

  function handleClear() {
    onChange('', '')
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', width, position: 'relative' }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 1, userSelect: 'none' }}>
        CBO
      </div>
      <div style={{ display: 'flex', height: 24 }}>
        <input
          type="text"
          value={open ? query : displayText}
          placeholder="Código ou descrição..."
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setQuery(''); setOpen(true) }}
          style={{
            flex: 1,
            height: 24,
            padding: '0 4px',
            fontSize: 12,
            border: '1px solid var(--color-border-main)',
            borderRight: 'none',
            background: 'var(--color-bg-white)',
            color: 'var(--color-text-primary)',
            outline: 'none',
            borderRadius: 0,
            boxSizing: 'border-box',
          }}
        />
        {value && (
          <button
            onClick={handleClear}
            style={{
              width: 20,
              height: 24,
              border: '1px solid var(--color-border-main)',
              background: 'var(--color-bg-panel)',
              cursor: 'pointer',
              fontSize: 10,
              color: 'var(--color-text-muted)',
              padding: 0,
              borderRadius: 0,
            }}
          >✕</button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 37,
          left: 0,
          right: 0,
          zIndex: 200,
          background: 'var(--color-bg-white)',
          border: '1px solid var(--color-border-main)',
          maxHeight: 180,
          overflowY: 'auto',
        }}>
          {filtered.map((c) => (
            <div
              key={c.codigo}
              onMouseDown={() => handleSelect(c)}
              style={{
                padding: '3px 6px',
                fontSize: 11,
                cursor: 'pointer',
                borderBottom: '1px solid var(--color-border-main)',
                background: 'var(--color-bg-white)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-panel)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg-white)' }}
            >
              <span style={{ color: 'var(--color-brand)', fontWeight: 600 }}>{c.codigo}</span>
              {' '}— {c.descricao}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── FuncionarioForm ────────────────────────────────────────────────────────

export default function FuncionarioForm({ funcionario, empresaId, onClose, onSaved, setStatusMsg }: Props) {
  const isNew = funcionario === null
  const [tab, setTab] = useState<Tab>(0)
  const [form, setForm] = useState<FormData>(() =>
    isNew ? emptyForm(empresaId) : {
      empresa_id:      funcionario.empresa_id,
      codigo:          funcionario.codigo,
      nome:            funcionario.nome,
      cpf:             funcionario.cpf,
      rg:              funcionario.rg              ?? '',
      data_nascimento: funcionario.data_nascimento ?? '',
      sexo:            funcionario.sexo            ?? '',
      estado_civil:    funcionario.estado_civil    ?? '',
      escolaridade:    funcionario.escolaridade    ?? '',
      cargo:           funcionario.cargo           ?? '',
      cbo_codigo:      funcionario.cbo_codigo      ?? '',
      numero_dependentes_irrf: funcionario.numero_dependentes_irrf ?? 0,
      regime_irrf:     funcionario.regime_irrf     ?? 'dependentes',
      departamento:    funcionario.departamento    ?? '',
      data_admissao:   funcionario.data_admissao,
      data_demissao:   funcionario.data_demissao   ?? '',
      tipo_contrato:   funcionario.tipo_contrato   ?? 'clt',
      salario_base:    funcionario.salario_base,
      carga_horaria:   funcionario.carga_horaria   ?? 220,
      periculosidade:  funcionario.periculosidade  ?? 0,
      insalubridade:   funcionario.insalubridade   ?? '',
      vale_transporte: funcionario.vale_transporte ?? 0,
      vale_refeicao:   funcionario.vale_refeicao   ?? undefined,
      plano_saude:     funcionario.plano_saude     ?? undefined,
      cep:             funcionario.cep             ?? '',
      logradouro:      funcionario.logradouro      ?? '',
      numero:          funcionario.numero          ?? '',
      complemento:     funcionario.complemento     ?? '',
      bairro:          funcionario.bairro          ?? '',
      cidade:          funcionario.cidade          ?? '',
      uf:              funcionario.uf              ?? '',
      telefone:        funcionario.telefone        ?? '',
      email:           funcionario.email           ?? '',
      banco:           funcionario.banco           ?? '',
      agencia:         funcionario.agencia         ?? '',
      conta:           funcionario.conta           ?? '',
      pis_pasep:       funcionario.pis_pasep       ?? '',
      ctps:            funcionario.ctps            ?? '',
      status:          funcionario.status,
    }
  )

  const [errors, setErrors]     = useState<Errors>({})
  const [saving, setSaving]     = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cboList, setCboList]   = useState<{ codigo: string; descricao: string }[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.listCbo) {
      window.electronAPI.listCbo().then(setCboList).catch(() => {})
    }
  }, [])

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
    if (addr) setForm((prev) => ({ ...prev, ...addr }))
  }, [form.cep])

  // ── Validação ────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Errors = {}
    if (!form.nome || form.nome.trim().length < 2)
      e.nome = 'Mínimo 2 caracteres.'
    if (!form.cpf)
      e.cpf = 'CPF é obrigatório.'
    else if (!validateCPF(form.cpf))
      e.cpf = 'CPF inválido.'
    if (!form.data_admissao)
      e.data_admissao = 'Data de admissão é obrigatória.'
    if (form.salario_base == null || form.salario_base < 0)
      e.salario_base = 'Salário deve ser ≥ 0.'
    setErrors(e)
    // Foca aba com primeiro erro
    if (e.nome || e.cpf) setTab(0)
    else if (e.data_admissao) setTab(1)
    else if (e.salario_base) setTab(2)
    return Object.keys(e).length === 0
  }

  // ── Salvar ───────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const hasElectron = typeof window !== 'undefined' && !!window.electronAPI

      if (isNew) {
        const payload: CreateFuncionarioPayload = {
          empresa_id:      empresaId,
          codigo:          form.codigo          || '',
          nome:            form.nome!,
          cpf:             form.cpf!,
          rg:              form.rg              || null,
          data_nascimento: form.data_nascimento || null,
          sexo:            form.sexo            || null,
          estado_civil:    form.estado_civil    || null,
          escolaridade:    form.escolaridade    || null,
          cargo:           form.cargo           || null,
          numero_dependentes_irrf: form.numero_dependentes_irrf ?? 0,
          regime_irrf:     (form.regime_irrf as Funcionario['regime_irrf']) ?? 'dependentes',
          departamento:    form.departamento    || null,
          data_admissao:   form.data_admissao!,
          data_demissao:   form.data_demissao   || null,
          tipo_contrato:   form.tipo_contrato   || 'clt',
          salario_base:    form.salario_base    ?? 0,
          carga_horaria:   form.carga_horaria   ?? 220,
          periculosidade:  form.periculosidade  ?? 0,
          insalubridade:   form.insalubridade   || null,
          vale_transporte: form.vale_transporte ?? 0,
          vale_refeicao:   form.vale_refeicao   ?? null,
          plano_saude:     form.plano_saude     ?? null,
          cep:             form.cep             || null,
          logradouro:      form.logradouro      || null,
          numero:          form.numero          || null,
          complemento:     form.complemento     || null,
          bairro:          form.bairro          || null,
          cidade:          form.cidade          || null,
          uf:              form.uf              || null,
          telefone:        form.telefone        || null,
          email:           form.email           || null,
          banco:           form.banco           || null,
          agencia:         form.agencia         || null,
          conta:           form.conta           || null,
          pis_pasep:       form.pis_pasep       || null,
          ctps:            form.ctps            || null,
          status:          (form.status as Funcionario['status']) ?? 'ativo',
        }

        if (hasElectron) {
          const result = await window.electronAPI.createFuncionario(payload)
          if (!result.success) {
            setErrors({ _global: result.error ?? 'Erro desconhecido.' })
            return
          }
          setStatusMsg(`Funcionário "${result.data.nome}" cadastrado com sucesso.`, 'success')
          onSaved(result.data)
        } else {
          setErrors({ _global: 'Sem Electron (modo dev browser).' })
        }
      } else {
        const payload: UpdateFuncionarioPayload = {
          id:              funcionario!.id,
          nome:            form.nome,
          cpf:             form.cpf,
          rg:              form.rg              || null,
          data_nascimento: form.data_nascimento || null,
          sexo:            form.sexo            || null,
          estado_civil:    form.estado_civil    || null,
          escolaridade:    form.escolaridade    || null,
          cargo:           form.cargo           || null,
          numero_dependentes_irrf: form.numero_dependentes_irrf ?? 0,
          regime_irrf:     (form.regime_irrf as Funcionario['regime_irrf']) ?? 'dependentes',
          departamento:    form.departamento    || null,
          data_admissao:   form.data_admissao,
          data_demissao:   form.data_demissao   || null,
          tipo_contrato:   form.tipo_contrato   || null,
          salario_base:    form.salario_base,
          carga_horaria:   form.carga_horaria   ?? null,
          periculosidade:  form.periculosidade  ?? null,
          insalubridade:   form.insalubridade   || null,
          vale_transporte: form.vale_transporte ?? null,
          vale_refeicao:   form.vale_refeicao   ?? null,
          plano_saude:     form.plano_saude     ?? null,
          cep:             form.cep             || null,
          logradouro:      form.logradouro      || null,
          numero:          form.numero          || null,
          complemento:     form.complemento     || null,
          bairro:          form.bairro          || null,
          cidade:          form.cidade          || null,
          uf:              form.uf              || null,
          telefone:        form.telefone        || null,
          email:           form.email           || null,
          banco:           form.banco           || null,
          agencia:         form.agencia         || null,
          conta:           form.conta           || null,
          pis_pasep:       form.pis_pasep       || null,
          ctps:            form.ctps            || null,
          status:          (form.status as Funcionario['status']) ?? undefined,
        }

        if (hasElectron) {
          const result = await window.electronAPI.updateFuncionario(payload)
          if (!result.success) {
            setErrors({ _global: result.error ?? 'Erro desconhecido.' })
            return
          }
          setStatusMsg(`Funcionário "${result.data.nome}" atualizado.`, 'success')
          onSaved(result.data)
        } else {
          setErrors({ _global: 'Sem Electron (modo dev browser).' })
        }
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Reativar ─────────────────────────────────────────────────────
  async function handleReactivate() {
    if (isNew || !funcionario) return
    setSaving(true)
    try {
      const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
      if (hasElectron) {
        const result = await window.electronAPI.updateFuncionario({ id: funcionario.id, status: 'ativo' })
        if (!result.success) {
          setErrors({ _global: result.error ?? 'Erro desconhecido.' })
          return
        }
        setStatusMsg(`Funcionário "${result.data.nome}" reativado com sucesso.`, 'success')
        onSaved(result.data)
      } else {
        setErrors({ _global: 'Sem Electron (modo dev browser).' })
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Esc fecha ────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // ── Render ───────────────────────────────────────────────────────
  const TABS = ['Dados Pessoais', 'Dados Profissionais', 'Remuneração', 'Endereço', 'Banco / Docs']

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        width: 820,
        maxHeight: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-bg-white)',
        border: '1px solid var(--color-border-main)',
        overflow: 'hidden',
      }}>

        {/* ── Header ────────────────────────────────────────── */}
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
            {isNew
              ? 'Novo Funcionário'
              : `Funcionário — ${funcionario!.codigo} · ${funcionario!.nome}`}
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

        {/* ── Tabs ──────────────────────────────────────────── */}
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

        {/* ── Conteúdo ──────────────────────────────────────── */}
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

          {/* ── Aba 0: Dados Pessoais ──────────────────────── */}
          {tab === 0 && (
            <div>
              <Row>
                <Field label="Código" value={form.codigo}
                  onChange={(v) => set('codigo', v)} width={70} maxLength={4} />
                <div style={{ flex: 1 }}>
                  <Field label="Nome" value={form.nome}
                    onChange={(v) => set('nome', v)} required error={errors.nome} />
                </div>
              </Row>
              <Row>
                <div style={{ width: 180 }}>
                  <Field label="CPF" value={formatCPF(form.cpf ?? '')}
                    onChange={(v) => set('cpf', v.replace(/\D/g, ''))}
                    onBlur={() => {
                      if (form.cpf && !validateCPF(form.cpf))
                        setErrors((prev) => ({ ...prev, cpf: 'CPF inválido.' }))
                    }}
                    required error={errors.cpf} maxLength={14} />
                </div>
                <div style={{ width: 160 }}>
                  <Field label="RG" value={form.rg} onChange={(v) => set('rg', v)} maxLength={20} />
                </div>
                <div style={{ width: 150 }}>
                  <Field label="Data de Nascimento" value={form.data_nascimento}
                    onChange={(v) => set('data_nascimento', v)} type="date" />
                </div>
              </Row>
              <Row>
                <SelectField label="Sexo" value={form.sexo}
                  onChange={(v) => set('sexo', v)} options={SEXO_OPTIONS} width={140} />
                <SelectField label="Estado Civil" value={form.estado_civil}
                  onChange={(v) => set('estado_civil', v)} options={EC_OPTIONS} width={180} />
                <div style={{ flex: 1 }}>
                  <SelectField label="Escolaridade" value={form.escolaridade}
                    onChange={(v) => set('escolaridade', v)} options={ESC_OPTIONS} />
                </div>
              </Row>
            </div>
          )}

          {/* ── Aba 1: Dados Profissionais ─────────────────── */}
          {tab === 1 && (
            <div>
              <Row>
                <CboSearchField
                  value={form.cbo_codigo ?? ''}
                  cboList={cboList}
                  onChange={(codigo, descricao) => {
                    set('cbo_codigo', codigo)
                    if (descricao) set('cargo', descricao)
                  }}
                  width={300}
                />
                <div style={{ flex: 1 }}>
                  <Field label="Cargo / Função" value={form.cargo}
                    onChange={(v) => set('cargo', v)} />
                </div>
              </Row>
              <Row>
                <div style={{ flex: 1 }}>
                  <Field label="Departamento" value={form.departamento}
                    onChange={(v) => set('departamento', v)} />
                </div>
              </Row>
              <Row>
                <div style={{ width: 150 }}>
                  <Field label="Data de Admissão" value={form.data_admissao}
                    onChange={(v) => set('data_admissao', v)} type="date"
                    required error={errors.data_admissao} />
                </div>
                <div style={{ width: 150 }}>
                  <Field label="Data de Demissão" value={form.data_demissao}
                    onChange={(v) => set('data_demissao', v)} type="date" />
                </div>
                <SelectField label="Tipo de Contrato" value={form.tipo_contrato}
                  onChange={(v) => set('tipo_contrato', v)} options={CONTRATO_OPTIONS} width={160} />
                <SelectField label="Status" value={form.status}
                  onChange={(v) => set('status', v as Funcionario['status'])} options={STATUS_OPTIONS} width={120} />
              </Row>
            </div>
          )}

          {/* ── Aba 2: Remuneração ─────────────────────────── */}
          {tab === 2 && (
            <div>
              <Row>
                <div style={{ width: 160 }}>
                  <Field label="Salário Base (R$)" value={form.salario_base ?? ''}
                    onChange={(v) => set('salario_base', v === '' ? 0 : parseFloat(v))}
                    type="number" step="0.01" required error={errors.salario_base} />
                </div>
                <div style={{ width: 130 }}>
                  <Field label="Carga Horária (h/mês)" value={form.carga_horaria ?? ''}
                    onChange={(v) => set('carga_horaria', v === '' ? null : parseFloat(v))}
                    type="number" step="0.5" />
                </div>
              </Row>
              <Row>
                <SelectField label="Dedução IRRF" value={form.regime_irrf ?? 'dependentes'}
                  onChange={(v) => set('regime_irrf', v as Funcionario['regime_irrf'])}
                  options={REGIME_IRRF_OPTIONS} width={200} />
                <div style={{ width: 150 }}>
                  <Field label="Nº de Dependentes (IRRF)" value={form.numero_dependentes_irrf ?? 0}
                    onChange={(v) => set('numero_dependentes_irrf', v === '' ? 0 : Math.max(0, parseInt(v, 10)))}
                    type="number" step="1" disabled={form.regime_irrf === 'simplificado'} />
                </div>
              </Row>
              <Row>
                <CheckField label="Periculosidade (30%)"
                  checked={(form.periculosidade ?? 0) > 0}
                  onChange={(v) => set('periculosidade', v ? 1 : 0)}
                  width={180}
                />
                <SelectField label="Insalubridade" value={form.insalubridade ?? ''}
                  onChange={(v) => set('insalubridade', v || null)} options={INSALUB_OPTIONS} width={120} />
              </Row>
              <Row>
                <CheckField label="Vale Transporte"
                  checked={(form.vale_transporte ?? 0) > 0}
                  onChange={(v) => set('vale_transporte', v ? 1 : 0)}
                  width={160}
                />
                <div style={{ width: 160 }}>
                  <Field label="Vale Refeição (R$)" value={form.vale_refeicao ?? ''}
                    onChange={(v) => set('vale_refeicao', v === '' ? null : parseFloat(v))}
                    type="number" step="0.01" />
                </div>
                <div style={{ width: 160 }}>
                  <Field label="Plano de Saúde (R$)" value={form.plano_saude ?? ''}
                    onChange={(v) => set('plano_saude', v === '' ? null : parseFloat(v))}
                    type="number" step="0.01" />
                </div>
              </Row>
            </div>
          )}

          {/* ── Aba 3: Endereço ────────────────────────────── */}
          {tab === 3 && (
            <div>
              <Row>
                <div style={{ width: 110 }}>
                  <Field label={cepLoading ? 'CEP (buscando...)' : 'CEP'}
                    value={formatCEP(form.cep ?? '')}
                    onChange={(v) => set('cep', v.replace(/\D/g, ''))}
                    onBlur={handleCepBlur}
                    maxLength={9} error={errors.cep} />
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

          {/* ── Aba 4: Banco / Documentos ──────────────────── */}
          {tab === 4 && (
            <div>
              <Row>
                <div style={{ flex: 1 }}>
                  <Field label="Banco" value={form.banco}
                    onChange={(v) => set('banco', v)} />
                </div>
                <div style={{ width: 100 }}>
                  <Field label="Agência" value={form.agencia}
                    onChange={(v) => set('agencia', v)} maxLength={10} />
                </div>
                <div style={{ width: 160 }}>
                  <Field label="Conta" value={form.conta}
                    onChange={(v) => set('conta', v)} maxLength={20} />
                </div>
              </Row>
              <div style={{ height: 1, background: 'var(--color-border-main)', margin: '8px 0' }} />
              <Row>
                <div style={{ width: 160 }}>
                  <Field label="PIS / PASEP" value={form.pis_pasep}
                    onChange={(v) => set('pis_pasep', v)} maxLength={14} />
                </div>
                <div style={{ width: 160 }}>
                  <Field label="CTPS" value={form.ctps}
                    onChange={(v) => set('ctps', v)} maxLength={20} />
                </div>
              </Row>
              <div style={{ height: 1, background: 'var(--color-border-main)', margin: '8px 0' }} />
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
            </div>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <div style={{
          height: 36,
          flexShrink: 0,
          background: 'var(--color-bg-panel)',
          borderTop: '1px solid var(--color-border-main)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: 6,
        }}>
          {!isNew && funcionario?.status !== 'ativo' && (
            <button
              onClick={handleReactivate}
              disabled={saving}
              style={footerBtn('reactivate')}
              title="Define o status como Ativo e salva imediatamente"
            >
              {saving ? 'Reativando...' : '↑ Reativar Funcionário'}
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} disabled={saving} style={footerBtn('secondary')}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} style={footerBtn('primary')}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function footerBtn(variant: 'primary' | 'secondary' | 'reactivate'): React.CSSProperties {
  const bg =
    variant === 'primary'    ? 'var(--color-brand)' :
    variant === 'reactivate' ? '#27ae60' :
                               'var(--color-bg-white)'
  return {
    height: 24,
    padding: '0 16px',
    fontSize: 12,
    fontWeight: 500,
    border: '1px solid var(--color-border-main)',
    background: bg,
    color: variant === 'secondary' ? 'var(--color-text-primary)' : '#fff',
    cursor: 'pointer',
    borderRadius: 0,
  }
}
