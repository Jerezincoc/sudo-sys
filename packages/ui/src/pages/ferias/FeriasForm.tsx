/**
 * FeriasForm.tsx
 * Modal 700px, 2 abas: Dados | Financeiro.
 * Cálculo automático ao mudar salário ou dias.
 */
import React, { useState, useEffect } from 'react'
import type { Ferias, Funcionario, CreateFeriasPayload, UpdateFeriasPayload } from '@sudo-sys/shared'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type FormData = {
  funcionario_id: number | ''
  periodo_aquisitivo_inicio: string
  periodo_aquisitivo_fim: string
  data_inicio_gozo: string
  data_fim_gozo: string
  dias_direito: number
  dias_concedidos: number
  dias_abono: number
  status: Ferias['status']
  salario_referencia: number
  adiantamento_13: boolean
  valor_ferias: number
  valor_abono: number
  valor_total: number
  observacao: string
}

type Errors = Record<string, string>
type Tab = 0 | 1

interface Props {
  ferias: Ferias | null
  empresaId: number
  funcMap: Map<number, Funcionario>
  onClose: () => void
  onSaved: (f: Ferias) => void
  setStatusMsg: (msg: string, type?: 'success' | 'error') => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcDias(inicio: string, fim: string): number {
  if (!inicio || !fim) return 0
  const d1 = new Date(inicio)
  const d2 = new Date(fim)
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0
  const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(0, diff)
}

function calcValores(salario: number, diasConcedidos: number, diasAbono: number, adiant13: boolean) {
  const valorFerias = (salario / 30) * diasConcedidos
  const valorAbono  = (salario / 30) * diasAbono * (1 / 3)
  const valorTotal  = valorFerias + valorAbono + (adiant13 ? salario / 12 : 0)
  return {
    valor_ferias: parseFloat(valorFerias.toFixed(2)),
    valor_abono:  parseFloat(valorAbono.toFixed(2)),
    valor_total:  parseFloat(valorTotal.toFixed(2)),
  }
}

function emptyForm(): FormData {
  return {
    funcionario_id:            '',
    periodo_aquisitivo_inicio: '',
    periodo_aquisitivo_fim:    '',
    data_inicio_gozo:          '',
    data_fim_gozo:             '',
    dias_direito:              30,
    dias_concedidos:           30,
    dias_abono:                0,
    status:                    'agendada',
    salario_referencia:        0,
    adiantamento_13:           false,
    valor_ferias:              0,
    valor_abono:               0,
    valor_total:               0,
    observacao:                '',
  }
}

function fromFerias(f: Ferias): FormData {
  const calc = calcValores(f.salario_referencia, f.dias_concedidos, f.dias_abono ?? 0, !!(f.adiantamento_13))
  return {
    funcionario_id:            f.funcionario_id,
    periodo_aquisitivo_inicio: f.periodo_aquisitivo_inicio,
    periodo_aquisitivo_fim:    f.periodo_aquisitivo_fim,
    data_inicio_gozo:          f.data_inicio_gozo,
    data_fim_gozo:             f.data_fim_gozo,
    dias_direito:              f.dias_direito,
    dias_concedidos:           f.dias_concedidos,
    dias_abono:                f.dias_abono ?? 0,
    status:                    f.status,
    salario_referencia:        f.salario_referencia,
    adiantamento_13:           !!(f.adiantamento_13),
    valor_ferias:              f.valor_ferias   ?? calc.valor_ferias,
    valor_abono:               f.valor_abono    ?? calc.valor_abono,
    valor_total:               f.valor_total    ?? calc.valor_total,
    observacao:                f.observacao     ?? '',
  }
}

// ── Field components ──────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{
      fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em',
      color: 'var(--color-text-muted)', marginBottom: 1, userSelect: 'none',
    }}>
      {children}{required && <span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>}
    </div>
  )
}

interface FieldProps {
  label: string; value: string | number; onChange: (v: string) => void
  required?: boolean; error?: string; type?: string; step?: string
  disabled?: boolean; width?: number | string; min?: number; max?: number
}

function Field({ label, value, onChange, required, error, type = 'text', step, disabled, width, min, max }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type} step={step} min={min} max={max}
        value={value} disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 24, padding: '0 4px', fontSize: 12, borderRadius: 0,
          border: `1px solid ${error ? '#e53e3e' : 'var(--color-border-main)'}`,
          background: disabled ? 'var(--color-bg-panel)' : 'var(--color-bg-white)',
          color: 'var(--color-text-primary)', outline: 'none',
          width: '100%', boxSizing: 'border-box' as const,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#e53e3e' : 'var(--color-border-main)' }}
      />
      {error && <span style={{ fontSize: 10, color: '#e53e3e', marginTop: 1 }}>{error}</span>}
    </div>
  )
}

interface SelectFieldProps {
  label: string; value: string | number; onChange: (v: string) => void
  options: { value: string | number; label: string }[]
  required?: boolean; error?: string; width?: number | string
}

function SelectField({ label, value, onChange, options, required, error, width }: SelectFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 24, padding: '0 4px', fontSize: 12, borderRadius: 0,
          border: `1px solid ${error ? '#e53e3e' : 'var(--color-border-main)'}`,
          background: 'var(--color-bg-white)', color: 'var(--color-text-primary)',
          outline: 'none', width: '100%', boxSizing: 'border-box' as const, cursor: 'pointer',
        }}
      >
        <option value="">— Selecione —</option>
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span style={{ fontSize: 10, color: '#e53e3e', marginTop: 1 }}>{error}</span>}
    </div>
  )
}

function Row({ children, gap = 8 }: { children: React.ReactNode; gap?: number }) {
  return <div style={{ display: 'flex', gap, marginBottom: 8 }}>{children}</div>
}

function fmtCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function footerBtn(variant: 'primary' | 'secondary'): React.CSSProperties {
  return {
    height: 24, padding: '0 16px', fontSize: 12, fontWeight: 500, borderRadius: 0,
    border: '1px solid var(--color-border-main)',
    background: variant === 'primary' ? 'var(--color-brand)' : 'var(--color-bg-white)',
    color: variant === 'primary' ? '#fff' : 'var(--color-text-primary)',
    cursor: 'pointer',
  }
}

const STATUS_OPTIONS = [
  { value: 'agendada',  label: 'Agendada'  },
  { value: 'aprovada',  label: 'Aprovada'  },
  { value: 'paga',      label: 'Paga'      },
  { value: 'cancelada', label: 'Cancelada' },
]

// ── FeriasForm ────────────────────────────────────────────────────────────────

export default function FeriasForm({ ferias, empresaId, funcMap, onClose, onSaved, setStatusMsg }: Props) {
  const isNew = ferias === null
  const [tab, setTab] = useState<Tab>(0)
  const [form, setForm] = useState<FormData>(() => isNew ? emptyForm() : fromFerias(ferias))
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  // ── Funcionários para o select ────────────────────────────────────
  const funcOptions = Array.from(funcMap.values())
    .filter((f) => f.status === 'ativo')
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .map((f) => ({ value: f.id, label: `${f.codigo} – ${f.nome}` }))

  // ── Helpers de set ────────────────────────────────────────────────
  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e })
  }

  // ── Recalcular dias ao mudar datas de gozo ────────────────────────
  useEffect(() => {
    const dias = calcDias(form.data_inicio_gozo, form.data_fim_gozo)
    if (dias > 0 && dias !== form.dias_concedidos) {
      const bounded = Math.min(30, Math.max(5, dias))
      setForm((prev) => {
        const calc = calcValores(prev.salario_referencia, bounded, prev.dias_abono, prev.adiantamento_13)
        return { ...prev, dias_concedidos: bounded, ...calc }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.data_inicio_gozo, form.data_fim_gozo])

  // ── Recalcular valores ao mudar salário, dias ou adiantamento ────
  function recalc(base: FormData) {
    const calc = calcValores(base.salario_referencia, base.dias_concedidos, base.dias_abono, base.adiantamento_13)
    return { ...base, ...calc }
  }

  function setSalario(v: string) {
    const sal = v === '' ? 0 : parseFloat(v)
    setForm((prev) => recalc({ ...prev, salario_referencia: isNaN(sal) ? 0 : sal }))
    if (errors.salario_referencia) setErrors((e) => { const n = { ...e }; delete n.salario_referencia; return n })
  }

  function setDiasConcedidos(v: string) {
    const d = v === '' ? 0 : parseInt(v)
    setForm((prev) => recalc({ ...prev, dias_concedidos: isNaN(d) ? 0 : d }))
    if (errors.dias_concedidos) setErrors((e) => { const n = { ...e }; delete n.dias_concedidos; return n })
  }

  function setDiasAbono(v: string) {
    const d = v === '' ? 0 : parseInt(v)
    setForm((prev) => recalc({ ...prev, dias_abono: isNaN(d) ? 0 : Math.min(10, Math.max(0, d)) }))
  }

  function setAdiant13(checked: boolean) {
    setForm((prev) => recalc({ ...prev, adiantamento_13: checked }))
  }

  // ── Validação ─────────────────────────────────────────────────────
  function validate(): boolean {
    const e: Errors = {}
    if (!form.funcionario_id)
      e.funcionario_id = 'Funcionário é obrigatório.'
    if (!form.periodo_aquisitivo_inicio)
      e.periodo_aquisitivo_inicio = 'Obrigatório.'
    if (!form.periodo_aquisitivo_fim)
      e.periodo_aquisitivo_fim = 'Obrigatório.'
    if (!form.data_inicio_gozo)
      e.data_inicio_gozo = 'Obrigatório.'
    if (!form.data_fim_gozo)
      e.data_fim_gozo = 'Obrigatório.'
    if (form.dias_concedidos < 5 || form.dias_concedidos > 30)
      e.dias_concedidos = 'Deve ser entre 5 e 30.'
    if (form.salario_referencia <= 0)
      e.salario_referencia = 'Salário deve ser maior que 0.'
    setErrors(e)
    if (e.funcionario_id || e.periodo_aquisitivo_inicio || e.periodo_aquisitivo_fim ||
        e.data_inicio_gozo || e.data_fim_gozo || e.dias_concedidos) {
      setTab(0)
    } else if (e.salario_referencia) {
      setTab(1)
    }
    return Object.keys(e).length === 0
  }

  // ── Salvar ────────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
      const basePayload = {
        funcionario_id:            form.funcionario_id as number,
        empresa_id:                empresaId,
        periodo_aquisitivo_inicio: form.periodo_aquisitivo_inicio,
        periodo_aquisitivo_fim:    form.periodo_aquisitivo_fim,
        data_inicio_gozo:          form.data_inicio_gozo,
        data_fim_gozo:             form.data_fim_gozo,
        dias_direito:              form.dias_direito,
        dias_concedidos:           form.dias_concedidos,
        dias_abono:                form.dias_abono,
        adiantamento_13:           form.adiantamento_13 ? 1 : 0,
        salario_referencia:        form.salario_referencia,
        valor_ferias:              form.valor_ferias,
        valor_abono:               form.valor_abono,
        valor_total:               form.valor_total,
        status:                    form.status,
        observacao:                form.observacao || null,
      }

      if (isNew) {
        if (!hasElectron) { setErrors({ _global: 'Sem Electron.' }); return }
        const result = await window.electronAPI.createFerias(basePayload as CreateFeriasPayload)
        if (!result.success) { setErrors({ _global: result.error }); return }
        const nomeFunc = funcMap.get(result.data.funcionario_id)?.nome ?? ''
        setStatusMsg(`Férias de "${nomeFunc}" cadastradas.`, 'success')
        onSaved(result.data)
      } else {
        if (!hasElectron) { setErrors({ _global: 'Sem Electron.' }); return }
        const payload: UpdateFeriasPayload = { id: ferias!.id, ...basePayload }
        const result = await window.electronAPI.updateFerias(payload)
        if (!result.success) { setErrors({ _global: result.error }); return }
        const nomeFunc = funcMap.get(result.data.funcionario_id)?.nome ?? ''
        setStatusMsg(`Férias de "${nomeFunc}" atualizadas.`, 'success')
        onSaved(result.data)
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Esc fecha ─────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const TABS = ['Dados', 'Financeiro']

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        width: 700, maxHeight: 'calc(100vh - 80px)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--color-bg-white)',
        border: '1px solid var(--color-border-main)', overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          height: 28, background: 'var(--color-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 8px', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
            {isNew ? 'Novas Férias' : `Férias — ${funcMap.get(ferias!.funcionario_id)?.nome ?? ferias!.funcionario_id}`}
          </span>
          <button
            onClick={onClose}
            style={{ width: 18, height: 18, border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
        </div>

        {/* Tabs */}
        <div style={{
          height: 26, background: 'var(--color-bg-panel)',
          borderBottom: '1px solid var(--color-border-main)',
          display: 'flex', alignItems: 'flex-end', flexShrink: 0,
        }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i as Tab)}
              style={{
                height: 24, padding: '0 14px', cursor: 'pointer', marginRight: 2,
                border: '1px solid var(--color-border-main)',
                borderBottom: tab === i ? '1px solid var(--color-bg-white)' : '1px solid var(--color-border-main)',
                borderTop: tab === i ? '2px solid var(--color-brand)' : '2px solid transparent',
                background: tab === i ? 'var(--color-bg-white)' : 'var(--color-bg-panel)',
                color: tab === i ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: 11, fontWeight: tab === i ? 600 : 400,
                position: 'relative', bottom: -1,
              }}
            >{t}</button>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, background: 'var(--color-bg-app)' }}>

          {errors._global && (
            <div style={{ marginBottom: 8, padding: '4px 8px', background: '#fff0f0', border: '1px solid #e53e3e', fontSize: 11, color: '#c53030' }}>
              {errors._global}
            </div>
          )}

          {/* ── Aba 0: Dados ─────────────────────────────────────── */}
          {tab === 0 && (
            <div>
              <Row>
                <div style={{ flex: 1 }}>
                  <SelectField
                    label="Funcionário" required
                    value={form.funcionario_id}
                    onChange={(v) => set('funcionario_id', v === '' ? '' : parseInt(v))}
                    options={funcOptions}
                    error={errors.funcionario_id}
                  />
                </div>
                <SelectField
                  label="Status" value={form.status}
                  onChange={(v) => set('status', v as Ferias['status'])}
                  options={STATUS_OPTIONS} width={130}
                />
              </Row>

              <div style={{ height: 1, background: 'var(--color-border-main)', margin: '4px 0 8px' }} />
              <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>
                Período Aquisitivo
              </div>
              <Row>
                <div style={{ flex: 1 }}>
                  <Field label="Início" type="date" required
                    value={form.periodo_aquisitivo_inicio}
                    onChange={(v) => set('periodo_aquisitivo_inicio', v)}
                    error={errors.periodo_aquisitivo_inicio}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Fim" type="date" required
                    value={form.periodo_aquisitivo_fim}
                    onChange={(v) => set('periodo_aquisitivo_fim', v)}
                    error={errors.periodo_aquisitivo_fim}
                  />
                </div>
              </Row>

              <div style={{ height: 1, background: 'var(--color-border-main)', margin: '4px 0 8px' }} />
              <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>
                Período de Gozo
              </div>
              <Row>
                <div style={{ flex: 1 }}>
                  <Field label="Início Gozo" type="date" required
                    value={form.data_inicio_gozo}
                    onChange={(v) => set('data_inicio_gozo', v)}
                    error={errors.data_inicio_gozo}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Fim Gozo" type="date" required
                    value={form.data_fim_gozo}
                    onChange={(v) => set('data_fim_gozo', v)}
                    error={errors.data_fim_gozo}
                  />
                </div>
                <Field label="Dias Direito" type="number" min={5} max={30}
                  value={form.dias_direito}
                  onChange={(v) => set('dias_direito', v === '' ? 30 : parseInt(v))}
                  width={90}
                />
                <Field label="Dias Concedidos" type="number" min={5} max={30} required
                  value={form.dias_concedidos}
                  onChange={setDiasConcedidos}
                  error={errors.dias_concedidos}
                  width={110}
                />
                <Field label="Dias Abono (0–10)" type="number" min={0} max={10}
                  value={form.dias_abono}
                  onChange={setDiasAbono}
                  width={110}
                />
              </Row>
            </div>
          )}

          {/* ── Aba 1: Financeiro ─────────────────────────────────── */}
          {tab === 1 && (
            <div>
              <Row>
                <div style={{ width: 180 }}>
                  <Field label="Salário Referência (R$)" type="number" step="0.01" required
                    value={form.salario_referencia === 0 ? '' : form.salario_referencia}
                    onChange={setSalario}
                    error={errors.salario_referencia}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', width: 160 }}>
                  <FieldLabel>Adiantamento 13°</FieldLabel>
                  <div style={{ height: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="checkbox"
                      checked={form.adiantamento_13}
                      onChange={(e) => setAdiant13(e.target.checked)}
                      style={{ width: 14, height: 14, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {form.adiantamento_13 ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>
              </Row>

              <div style={{ height: 1, background: 'var(--color-border-main)', margin: '4px 0 8px' }} />
              <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>
                Valores Calculados
              </div>

              <Row>
                {[
                  { label: 'Valor Férias', val: form.valor_ferias },
                  { label: 'Valor Abono (1/3)', val: form.valor_abono },
                  { label: 'Valor Total', val: form.valor_total },
                ].map(({ label, val }) => (
                  <div key={label} style={{
                    flex: 1, background: 'var(--color-bg-panel)',
                    border: '1px solid var(--color-border-main)',
                    padding: '4px 8px',
                  }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-brand)', marginTop: 2 }}>
                      {fmtCurrency(val)}
                    </div>
                  </div>
                ))}
              </Row>

              <div style={{ height: 1, background: 'var(--color-border-main)', margin: '8px 0' }} />
              <div>
                <FieldLabel>Observação</FieldLabel>
                <textarea
                  value={form.observacao}
                  onChange={(e) => set('observacao', e.target.value)}
                  rows={3}
                  style={{
                    width: '100%', padding: '4px', fontSize: 12, borderRadius: 0,
                    border: '1px solid var(--color-border-main)',
                    background: 'var(--color-bg-white)', color: 'var(--color-text-primary)',
                    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-main)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          height: 36, flexShrink: 0,
          background: 'var(--color-bg-panel)',
          borderTop: '1px solid var(--color-border-main)',
          display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6,
        }}>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} disabled={saving} style={footerBtn('secondary')}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={footerBtn('primary')}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
