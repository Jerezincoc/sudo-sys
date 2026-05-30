import React, { useState, useEffect } from 'react'
import type { Rescisao, Funcionario, CreateRescisaoPayload, UpdateRescisaoPayload } from '@sudo-sys/shared'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type FormData = Partial<Omit<Rescisao, 'id' | 'created_at' | 'updated_at'>>
type Errors   = Record<string, string>
type Tab      = 0 | 1 | 2

interface Props {
  rescisao:    Rescisao | null
  empresaId:   number
  funcionarios: Funcionario[]
  onClose:     () => void
  onSaved:     (r: Rescisao) => void
  setStatusMsg: (msg: string, type?: 'success' | 'error') => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function emptyForm(empresaId: number): FormData {
  return {
    empresa_id:           empresaId,
    funcionario_id:       undefined,
    data_demissao:        '',
    motivo:               'sem_justa_causa',
    aviso_previo:         'trabalhado',
    data_aviso:           '',
    salario_referencia:   0,
    dias_trabalhados:     0,
    ferias_vencidas:      0,
    outros_proventos:     0,
    inss_rescisao:        0,
    irrf_rescisao:        0,
    outros_descontos:     0,
    multa_fgts:           0,
    saldo_salario:        null,
    ferias_proporcionais: null,
    um_terco_ferias:      null,
    decimo_terceiro:      null,
    aviso_previo_valor:   null,
    total_proventos:      null,
    total_descontos:      null,
    valor_liquido:        null,
    status:               'rascunho',
    observacao:           '',
  }
}

function fmtBRL(v: number | null | undefined): string {
  if (v == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

// ── Componentes de campo ──────────────────────────────────────────────────────

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

interface InputProps {
  label: string
  value: string | number | undefined | null
  onChange: (v: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  type?: string
  step?: string
  maxLength?: number
  disabled?: boolean
  width?: number | string
}

function Field({ label, value, onChange, error, required, placeholder, type = 'text', step, maxLength, disabled, width }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        step={step}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        style={{
          height: 24, padding: '0 4px', fontSize: 12,
          border: `1px solid ${error ? '#e53e3e' : 'var(--color-border-main)'}`,
          background: disabled ? 'var(--color-bg-panel)' : 'var(--color-bg-white)',
          color: 'var(--color-text-primary)', outline: 'none', borderRadius: 0,
          width: '100%', boxSizing: 'border-box',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-brand)' }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = error ? '#e53e3e' : 'var(--color-border-main)'
        }}
      />
      {error && <span style={{ fontSize: 10, color: '#e53e3e', marginTop: 1 }}>{error}</span>}
    </div>
  )
}

interface SelectProps {
  label: string
  value: string | number | undefined | null
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
  width?: number | string
  disabled?: boolean
}

function SelectField({ label, value, onChange, options, error, required, width, disabled }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          height: 24, padding: '0 4px', fontSize: 12,
          border: `1px solid ${error ? '#e53e3e' : 'var(--color-border-main)'}`,
          background: disabled ? 'var(--color-bg-panel)' : 'var(--color-bg-white)',
          color: 'var(--color-text-primary)', outline: 'none', borderRadius: 0,
          width: '100%', boxSizing: 'border-box', cursor: disabled ? 'default' : 'pointer',
        }}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span style={{ fontSize: 10, color: '#e53e3e', marginTop: 1 }}>{error}</span>}
    </div>
  )
}

function Row({ children, gap = 8 }: { children: React.ReactNode; gap?: number }) {
  return <div style={{ display: 'flex', gap, marginBottom: 8 }}>{children}</div>
}

// Linha de valor para proventos/descontos (somente leitura)
function ValueRow({ label, value, bold, color }: {
  label: string
  value: number | null | undefined
  bold?: boolean
  color?: string
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '4px 8px', borderBottom: '1px solid var(--color-border-light)',
    }}>
      <span style={{
        fontSize: 12, color: 'var(--color-text-secondary)',
        fontWeight: bold ? 700 : 400,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 12, fontWeight: bold ? 700 : 400,
        color: color ?? 'var(--color-text-primary)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {fmtBRL(value)}
      </span>
    </div>
  )
}

// ── Opções ────────────────────────────────────────────────────────────────────

const MOTIVO_OPTIONS = [
  { value: 'sem_justa_causa', label: 'Sem Justa Causa'   },
  { value: 'com_justa_causa', label: 'Com Justa Causa'   },
  { value: 'pedido_demissao', label: 'Pedido de Demissão' },
  { value: 'acordo_mutuo',    label: 'Acordo Mútuo'       },
  { value: 'aposentadoria',   label: 'Aposentadoria'      },
]

const AVISO_OPTIONS = [
  { value: 'trabalhado', label: 'Trabalhado' },
  { value: 'indenizado', label: 'Indenizado' },
  { value: 'dispensado', label: 'Dispensado' },
]

const STATUS_OPTIONS = [
  { value: 'rascunho',  label: 'Rascunho'  },
  { value: 'calculada', label: 'Calculada' },
  { value: 'paga',      label: 'Paga'      },
  { value: 'cancelada', label: 'Cancelada' },
]

// ── RescisaoForm ──────────────────────────────────────────────────────────────

export default function RescisaoForm({ rescisao, empresaId, funcionarios, onClose, onSaved, setStatusMsg }: Props) {
  const isNew = rescisao === null
  const [tab, setTab]       = useState<Tab>(0)
  const [saving, setSaving] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  // For new rescisoes that have been auto-saved during Calcular
  const [savedId, setSavedId] = useState<number | null>(null)
  const effectiveId = rescisao?.id ?? savedId

  const [form, setForm] = useState<FormData>(() =>
    isNew
      ? emptyForm(empresaId)
      : {
          empresa_id:           rescisao.empresa_id,
          funcionario_id:       rescisao.funcionario_id,
          data_demissao:        rescisao.data_demissao,
          motivo:               rescisao.motivo,
          aviso_previo:         rescisao.aviso_previo         ?? 'trabalhado',
          data_aviso:           rescisao.data_aviso           ?? '',
          salario_referencia:   rescisao.salario_referencia,
          dias_trabalhados:     rescisao.dias_trabalhados     ?? 0,
          ferias_vencidas:      rescisao.ferias_vencidas      ?? 0,
          outros_proventos:     rescisao.outros_proventos     ?? 0,
          inss_rescisao:        rescisao.inss_rescisao        ?? 0,
          irrf_rescisao:        rescisao.irrf_rescisao        ?? 0,
          outros_descontos:     rescisao.outros_descontos     ?? 0,
          multa_fgts:           rescisao.multa_fgts           ?? 0,
          saldo_salario:        rescisao.saldo_salario,
          ferias_proporcionais: rescisao.ferias_proporcionais,
          um_terco_ferias:      rescisao.um_terco_ferias,
          decimo_terceiro:      rescisao.decimo_terceiro,
          aviso_previo_valor:   rescisao.aviso_previo_valor,
          total_proventos:      rescisao.total_proventos,
          total_descontos:      rescisao.total_descontos,
          valor_liquido:        rescisao.valor_liquido,
          status:               rescisao.status,
          observacao:           rescisao.observacao           ?? '',
        },
  )

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e })
  }

  // ── Funcionário options ───────────────────────────────────────────
  const funcOptions = funcionarios.map((f) => ({
    value: String(f.id),
    label: `${f.codigo} — ${f.nome}`,
  }))

  // ── Validação básica ──────────────────────────────────────────────
  function validate(): boolean {
    const e: Errors = {}
    if (!form.funcionario_id)
      e.funcionario_id = 'Funcionário é obrigatório.'
    if (!form.data_demissao)
      e.data_demissao = 'Data de demissão é obrigatória.'
    if (form.salario_referencia == null || form.salario_referencia <= 0)
      e.salario_referencia = 'Salário de referência deve ser maior que zero.'
    setErrors(e)
    if (Object.keys(e).length > 0) setTab(0)
    return Object.keys(e).length === 0
  }

  // ── Montar payload ────────────────────────────────────────────────
  function buildPayload(): Omit<CreateRescisaoPayload, 'empresa_id'> {
    return {
      funcionario_id:       Number(form.funcionario_id),
      data_demissao:        form.data_demissao!,
      motivo:               (form.motivo as Rescisao['motivo']) ?? 'sem_justa_causa',
      aviso_previo:         (form.aviso_previo as Rescisao['aviso_previo']) || null,
      data_aviso:           form.data_aviso                     || null,
      salario_referencia:   form.salario_referencia             ?? 0,
      dias_trabalhados:     form.dias_trabalhados               ?? 0,
      ferias_vencidas:      form.ferias_vencidas                ?? 0,
      outros_proventos:     form.outros_proventos               ?? 0,
      inss_rescisao:        form.inss_rescisao                  ?? 0,
      irrf_rescisao:        form.irrf_rescisao                  ?? 0,
      outros_descontos:     form.outros_descontos               ?? 0,
      multa_fgts:           form.multa_fgts                     ?? 0,
      saldo_salario:        form.saldo_salario                  ?? null,
      ferias_proporcionais: form.ferias_proporcionais           ?? null,
      um_terco_ferias:      form.um_terco_ferias                ?? null,
      decimo_terceiro:      form.decimo_terceiro                ?? null,
      aviso_previo_valor:   form.aviso_previo_valor             ?? null,
      total_proventos:      form.total_proventos                ?? null,
      total_descontos:      form.total_descontos                ?? null,
      valor_liquido:        form.valor_liquido                  ?? null,
      status:               (form.status as Rescisao['status']) ?? 'rascunho',
      observacao:           form.observacao                     || null,
    }
  }

  // ── Salvar ────────────────────────────────────────────────────────
  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
      if (!hasElectron) {
        setErrors({ _global: 'Sem Electron (modo dev browser).' })
        return
      }

      if (isNew && effectiveId == null) {
        const payload: CreateRescisaoPayload = { empresa_id: empresaId, ...buildPayload() }
        const result = await window.electronAPI.createRescisao(payload)
        if (!result.success) { setErrors({ _global: result.error }); return }
        setStatusMsg(`Rescisão criada com sucesso.`, 'success')
        onSaved(result.data)
      } else {
        const id = effectiveId ?? rescisao!.id
        const payload: UpdateRescisaoPayload = { id, ...buildPayload() }
        const result = await window.electronAPI.updateRescisao(payload)
        if (!result.success) { setErrors({ _global: result.error }); return }
        setStatusMsg(`Rescisão atualizada.`, 'success')
        onSaved(result.data)
      }
    } finally {
      setSaving(false)
    }
  }

  // ── Calcular ──────────────────────────────────────────────────────
  async function handleCalcular() {
    if (!form.funcionario_id || !form.data_demissao || !form.salario_referencia) {
      setErrors({ _global: 'Preencha Funcionário, Data Demissão e Salário antes de calcular.' })
      setTab(0)
      return
    }
    const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
    if (!hasElectron) {
      setErrors({ _global: 'Sem Electron (modo dev browser).' })
      return
    }

    setCalculating(true)
    try {
      let idToCalc = effectiveId

      if (idToCalc == null) {
        // Cria antes de calcular
        const payload: CreateRescisaoPayload = { empresa_id: empresaId, ...buildPayload() }
        const createResult = await window.electronAPI.createRescisao(payload)
        if (!createResult.success) { setErrors({ _global: createResult.error }); return }
        idToCalc = createResult.data.id
        setSavedId(idToCalc)
      } else {
        // Salva dados atuais antes de calcular
        const payload: UpdateRescisaoPayload = { id: idToCalc, ...buildPayload() }
        const updateResult = await window.electronAPI.updateRescisao(payload)
        if (!updateResult.success) { setErrors({ _global: updateResult.error }); return }
      }

      const calcResult = await window.electronAPI.calcularRescisao(idToCalc)
      if (!calcResult.success) { setErrors({ _global: calcResult.error }); return }

      const r = calcResult.data
      setForm((prev) => ({
        ...prev,
        saldo_salario:        r.saldo_salario,
        ferias_proporcionais: r.ferias_proporcionais,
        um_terco_ferias:      r.um_terco_ferias,
        decimo_terceiro:      r.decimo_terceiro,
        aviso_previo_valor:   r.aviso_previo_valor,
        multa_fgts:           r.multa_fgts,
        total_proventos:      r.total_proventos,
        total_descontos:      r.total_descontos,
        valor_liquido:        r.valor_liquido,
        status:               r.status,
      }))
      setErrors({})
      setTab(1) // Vai para aba Proventos para ver os valores
    } finally {
      setCalculating(false)
    }
  }

  // ── Esc fecha ─────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const TABS = ['Dados', 'Proventos', 'Descontos / Líquido']

  const mostraMulhaFgts = form.motivo === 'sem_justa_causa' || form.motivo === 'acordo_mutuo'

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        width: 800, maxHeight: 'calc(100vh - 80px)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--color-bg-white)',
        border: '1px solid var(--color-border-main)',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          height: 28, background: 'var(--color-brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 8px', flexShrink: 0,
        }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
            {isNew ? 'Nova Rescisão' : `Rescisão #${rescisao!.id}`}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 18, height: 18, border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.8)', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
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
                height: 24, padding: '0 14px',
                border: '1px solid var(--color-border-main)',
                borderBottom: tab === i ? '1px solid var(--color-bg-white)' : '1px solid var(--color-border-main)',
                borderTop: tab === i ? '2px solid var(--color-brand)' : '2px solid transparent',
                background: tab === i ? 'var(--color-bg-white)' : 'var(--color-bg-panel)',
                color: tab === i ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: 11, fontWeight: tab === i ? 600 : 400,
                cursor: 'pointer', marginRight: 2, position: 'relative', bottom: -1,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, background: 'var(--color-bg-app)' }}>

          {errors._global && (
            <div style={{
              marginBottom: 8, padding: '4px 8px',
              background: '#fff0f0', border: '1px solid #e53e3e',
              fontSize: 11, color: '#c53030',
            }}>
              {errors._global}
            </div>
          )}

          {/* ── Aba 0: Dados ──────────────────────────────────────── */}
          {tab === 0 && (
            <div>
              <Row>
                <div style={{ flex: 1 }}>
                  <SelectField
                    label="Funcionário"
                    value={form.funcionario_id != null ? String(form.funcionario_id) : ''}
                    onChange={(v) => set('funcionario_id', v ? Number(v) : undefined)}
                    options={funcOptions}
                    required
                    error={errors.funcionario_id}
                  />
                </div>
              </Row>
              <Row>
                <div style={{ width: 160 }}>
                  <Field
                    label="Data Demissão"
                    value={form.data_demissao}
                    onChange={(v) => set('data_demissao', v)}
                    type="date"
                    required
                    error={errors.data_demissao}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <SelectField
                    label="Motivo"
                    value={form.motivo}
                    onChange={(v) => set('motivo', v as Rescisao['motivo'])}
                    options={MOTIVO_OPTIONS}
                    required
                  />
                </div>
              </Row>
              <Row>
                <div style={{ width: 170 }}>
                  <SelectField
                    label="Aviso Prévio"
                    value={form.aviso_previo ?? ''}
                    onChange={(v) => set('aviso_previo', v as Rescisao['aviso_previo'] || null)}
                    options={AVISO_OPTIONS}
                  />
                </div>
                <div style={{ width: 160 }}>
                  <Field
                    label="Data do Aviso"
                    value={form.data_aviso}
                    onChange={(v) => set('data_aviso', v)}
                    type="date"
                  />
                </div>
                <div style={{ width: 160 }}>
                  <SelectField
                    label="Status"
                    value={form.status}
                    onChange={(v) => set('status', v as Rescisao['status'])}
                    options={STATUS_OPTIONS}
                  />
                </div>
              </Row>
              <Row>
                <div style={{ width: 180 }}>
                  <Field
                    label="Salário de Referência (R$)"
                    value={form.salario_referencia}
                    onChange={(v) => set('salario_referencia', v === '' ? 0 : parseFloat(v))}
                    type="number"
                    step="0.01"
                    required
                    error={errors.salario_referencia}
                  />
                </div>
                <div style={{ width: 140 }}>
                  <Field
                    label="Dias Trabalhados"
                    value={form.dias_trabalhados}
                    onChange={(v) => set('dias_trabalhados', v === '' ? 0 : parseInt(v))}
                    type="number"
                    step="1"
                  />
                </div>
                <div style={{ width: 160 }}>
                  <Field
                    label="Férias Vencidas (R$)"
                    value={form.ferias_vencidas}
                    onChange={(v) => set('ferias_vencidas', v === '' ? 0 : parseFloat(v))}
                    type="number"
                    step="0.01"
                  />
                </div>
                {mostraMulhaFgts && (
                  <div style={{ width: 160 }}>
                    <Field
                      label="Multa FGTS (R$)"
                      value={form.multa_fgts}
                      onChange={(v) => set('multa_fgts', v === '' ? 0 : parseFloat(v))}
                      type="number"
                      step="0.01"
                    />
                  </div>
                )}
              </Row>
              <Row>
                <div style={{ flex: 1 }}>
                  <Field
                    label="Observação"
                    value={form.observacao}
                    onChange={(v) => set('observacao', v)}
                    maxLength={500}
                  />
                </div>
              </Row>

              {/* Botão Calcular */}
              <div style={{ marginTop: 12 }}>
                <button
                  onClick={handleCalcular}
                  disabled={calculating || saving}
                  style={{
                    height: 28, padding: '0 20px', fontSize: 12, fontWeight: 600,
                    border: '1px solid #2980b9',
                    background: calculating ? '#85c1e9' : '#3498db',
                    color: '#fff', cursor: calculating ? 'not-allowed' : 'pointer',
                    borderRadius: 0,
                  }}
                >
                  {calculating ? 'Calculando...' : '⟳ Calcular'}
                </button>
                <span style={{
                  marginLeft: 8, fontSize: 11, color: 'var(--color-text-muted)',
                }}>
                  Salva os dados e recalcula proventos automaticamente.
                </span>
              </div>
            </div>
          )}

          {/* ── Aba 1: Proventos (somente leitura) ────────────────── */}
          {tab === 1 && (
            <div style={{
              background: 'var(--color-bg-white)',
              border: '1px solid var(--color-border-main)',
            }}>
              <div style={{
                padding: '4px 8px', background: 'var(--color-bg-panel)',
                borderBottom: '1px solid var(--color-border-main)',
                fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.05em', color: 'var(--color-text-muted)',
              }}>
                Proventos — valores calculados
              </div>
              <ValueRow label="Saldo de Salário"          value={form.saldo_salario} />
              <ValueRow label="Férias Vencidas"           value={form.ferias_vencidas} />
              <ValueRow label="Férias Proporcionais"      value={form.ferias_proporcionais} />
              <ValueRow label="1/3 de Férias"             value={form.um_terco_ferias} />
              <ValueRow label="13° Salário Proporcional"  value={form.decimo_terceiro} />
              <ValueRow label="Aviso Prévio"              value={form.aviso_previo_valor} />
              <ValueRow label="Multa FGTS (40%)"          value={form.multa_fgts} />
              <ValueRow label="Outros Proventos"          value={form.outros_proventos} />
              <div style={{ height: 1, background: 'var(--color-border-main)', margin: '4px 0' }} />
              <ValueRow label="TOTAL PROVENTOS"           value={form.total_proventos} bold />
              <div style={{
                padding: '6px 8px', fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic',
              }}>
                Clique em "Calcular" na aba Dados para atualizar os valores.
              </div>
            </div>
          )}

          {/* ── Aba 2: Descontos / Líquido ────────────────────────── */}
          {tab === 2 && (
            <div>
              <div style={{
                background: 'var(--color-bg-white)',
                border: '1px solid var(--color-border-main)',
                marginBottom: 12,
              }}>
                <div style={{
                  padding: '4px 8px', background: 'var(--color-bg-panel)',
                  borderBottom: '1px solid var(--color-border-main)',
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.05em', color: 'var(--color-text-muted)',
                }}>
                  Descontos
                </div>
                <div style={{ padding: 10 }}>
                  <Row>
                    <div style={{ width: 200 }}>
                      <Field
                        label="INSS Rescisão (R$)"
                        value={form.inss_rescisao}
                        onChange={(v) => set('inss_rescisao', v === '' ? 0 : parseFloat(v))}
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div style={{ width: 200 }}>
                      <Field
                        label="IRRF Rescisão (R$)"
                        value={form.irrf_rescisao}
                        onChange={(v) => set('irrf_rescisao', v === '' ? 0 : parseFloat(v))}
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div style={{ width: 200 }}>
                      <Field
                        label="Outros Descontos (R$)"
                        value={form.outros_descontos}
                        onChange={(v) => set('outros_descontos', v === '' ? 0 : parseFloat(v))}
                        type="number"
                        step="0.01"
                      />
                    </div>
                  </Row>
                </div>
                <ValueRow label="TOTAL DESCONTOS" value={form.total_descontos} bold />
              </div>

              {/* Valor Líquido */}
              <div style={{
                background: 'var(--color-bg-white)',
                border: '1px solid var(--color-border-main)',
              }}>
                <div style={{
                  padding: '4px 8px', background: 'var(--color-bg-panel)',
                  borderBottom: '1px solid var(--color-border-main)',
                  fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                  letterSpacing: '0.05em', color: 'var(--color-text-muted)',
                }}>
                  Resultado
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Valor Líquido
                  </span>
                  <span style={{
                    fontSize: 20, fontWeight: 700,
                    color: (form.valor_liquido ?? 0) >= 0 ? '#27ae60' : '#e53e3e',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {fmtBRL(form.valor_liquido)}
                  </span>
                </div>
                <div style={{
                  padding: '0 8px 8px', fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic',
                }}>
                  Clique em "Calcular" na aba Dados após informar os descontos para recalcular.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          height: 36, flexShrink: 0, background: 'var(--color-bg-panel)',
          borderTop: '1px solid var(--color-border-main)',
          display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6,
        }}>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} disabled={saving || calculating} style={footerBtn('secondary')}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || calculating} style={footerBtn('primary')}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function footerBtn(variant: 'primary' | 'secondary'): React.CSSProperties {
  return {
    height: 24, padding: '0 16px', fontSize: 12, fontWeight: 500,
    border: '1px solid var(--color-border-main)',
    background: variant === 'primary' ? 'var(--color-brand)' : 'var(--color-bg-white)',
    color: variant === 'secondary' ? 'var(--color-text-primary)' : '#fff',
    cursor: 'pointer', borderRadius: 0,
  }
}
