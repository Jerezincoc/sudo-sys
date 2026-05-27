/**
 * RubricaForm.tsx
 * Modal 700px — 3 abas: Identificação | Cálculo | Incidências.
 * Rubricas globais (empresa_id === null) são somente leitura.
 * Botão "Duplicar para esta empresa" cria cópia com empresa_id atual.
 */
import React, { useState, useEffect } from 'react'
import type { Rubrica, CreateRubricaPayload, UpdateRubricaPayload } from '@sudo-sys/shared'

type Tab = 0 | 1 | 2

type FormData = Partial<Omit<Rubrica, 'id' | 'created_at' | 'updated_at'>>
type Errors = Record<string, string>

interface Props {
  rubrica: Rubrica | null
  empresaId: number | null
  onClose: () => void
  onSaved: (r: Rubrica) => void
  setStatusMsg: (msg: string, type?: 'success' | 'error') => void
}

// ── Opções ──────────────────────────────────────────────────────────────────

const TIPO_OPTIONS = [
  { value: 'provento',    label: 'Provento'    },
  { value: 'desconto',   label: 'Desconto'    },
  { value: 'informativo',label: 'Informativo' },
]

const NATUREZA_OPTIONS = [
  { value: 'normal',    label: 'Normal'      },
  { value: 'ferias',    label: 'Férias'      },
  { value: '13salario', label: '13° Salário' },
  { value: 'rescisao',  label: 'Rescisão'    },
  { value: 'outros',    label: 'Outros'      },
]

const MODO_OPTIONS = [
  { value: 'fixo',       label: 'Fixo (R$)'    },
  { value: 'percentual', label: 'Percentual (%)' },
  { value: 'formula',    label: 'Fórmula'      },
]

// ── Form inicial ─────────────────────────────────────────────────────────────

function emptyForm(empresaId: number | null): FormData {
  return {
    empresa_id:  empresaId,
    codigo:      '',
    nome:        '',
    tipo:        'provento',
    natureza:    'normal',
    incide_inss: 1,
    incide_irrf: 1,
    incide_fgts: 1,
    modo_valor:  'fixo',
    valor_fixo:  undefined,
    percentual:  undefined,
    formula:     '',
    referencia:  '',
    observacao:  '',
    ativo:       1,
  }
}

// ── Componentes de campo ─────────────────────────────────────────────────────

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

function Field({ label, value, onChange, error, required, placeholder, type = 'text', disabled, width, step }: {
  label: string; value: string | number | undefined | null; onChange: (v: string) => void
  error?: string; required?: boolean; placeholder?: string; type?: string
  disabled?: boolean; width?: number | string; step?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type} step={step} value={value ?? ''} placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 24, padding: '0 4px', fontSize: 12, borderRadius: 0,
          border: `1px solid ${error ? '#e53e3e' : 'var(--color-border-main)'}`,
          background: disabled ? 'var(--color-bg-panel)' : 'var(--color-bg-white)',
          color: 'var(--color-text-primary)', outline: 'none',
          width: '100%', boxSizing: 'border-box' as const,
        }}
        onFocus={(e) => { if (!disabled) e.currentTarget.style.borderColor = 'var(--color-brand)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#e53e3e' : 'var(--color-border-main)' }}
      />
      {error && <span style={{ fontSize: 10, color: '#e53e3e', marginTop: 1 }}>{error}</span>}
    </div>
  )
}

function SelectField({ label, value, onChange, options, required, disabled, width }: {
  label: string; value: string | number | undefined | null; onChange: (v: string) => void
  options: { value: string; label: string }[]; required?: boolean; disabled?: boolean; width?: number | string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select
        value={value ?? ''} disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 24, padding: '0 4px', fontSize: 12, borderRadius: 0,
          border: '1px solid var(--color-border-main)',
          background: disabled ? 'var(--color-bg-panel)' : 'var(--color-bg-white)',
          color: 'var(--color-text-primary)', outline: 'none',
          width: '100%', boxSizing: 'border-box' as const, cursor: disabled ? 'default' : 'pointer',
        }}
      >
        <option value="">—</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Textarea({ label, value, onChange, disabled, placeholder }: {
  label: string; value: string | undefined | null; onChange: (v: string) => void
  disabled?: boolean; placeholder?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value ?? ''} disabled={disabled} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          minHeight: 60, padding: '4px', fontSize: 12, borderRadius: 0,
          border: '1px solid var(--color-border-main)',
          background: disabled ? 'var(--color-bg-panel)' : 'var(--color-bg-white)',
          color: 'var(--color-text-primary)', outline: 'none',
          resize: 'vertical', fontFamily: 'monospace',
          width: '100%', boxSizing: 'border-box' as const,
        }}
      />
    </div>
  )
}

function CheckRow({ label, checked, onChange, disabled }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 6, cursor: disabled ? 'default' : 'pointer',
      fontSize: 12, color: 'var(--color-text-primary)',
    }}>
      <input
        type="checkbox" checked={checked} disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 14, height: 14 }}
      />
      {label}
    </label>
  )
}

function Row({ children, gap = 8, mb = 8 }: { children: React.ReactNode; gap?: number; mb?: number }) {
  return <div style={{ display: 'flex', gap, marginBottom: mb }}>{children}</div>
}

function footerBtn(variant: 'primary' | 'secondary' | 'warning'): React.CSSProperties {
  const bg = variant === 'primary' ? 'var(--color-brand)' : variant === 'warning' ? '#e67e22' : 'var(--color-bg-white)'
  return {
    height: 24, padding: '0 16px', fontSize: 12, fontWeight: 500, borderRadius: 0,
    border: '1px solid var(--color-border-main)', background: bg,
    color: variant === 'secondary' ? 'var(--color-text-primary)' : '#fff', cursor: 'pointer',
  }
}

// ── RubricaForm ──────────────────────────────────────────────────────────────

export default function RubricaForm({ rubrica, empresaId, onClose, onSaved, setStatusMsg }: Props) {
  const isNew     = rubrica === null
  const isGlobal  = !isNew && rubrica.empresa_id == null
  const isReadOnly = isGlobal

  const [tab, setTab] = useState<Tab>(0)
  const [form, setForm] = useState<FormData>(() =>
    isNew
      ? emptyForm(empresaId)
      : {
          empresa_id:  rubrica.empresa_id,
          codigo:      rubrica.codigo,
          nome:        rubrica.nome,
          tipo:        rubrica.tipo,
          natureza:    rubrica.natureza    ?? 'normal',
          incide_inss: rubrica.incide_inss ?? 1,
          incide_irrf: rubrica.incide_irrf ?? 1,
          incide_fgts: rubrica.incide_fgts ?? 1,
          modo_valor:  rubrica.modo_valor  ?? 'fixo',
          valor_fixo:  rubrica.valor_fixo  ?? undefined,
          percentual:  rubrica.percentual  ?? undefined,
          formula:     rubrica.formula     ?? '',
          referencia:  rubrica.referencia  ?? '',
          observacao:  rubrica.observacao  ?? '',
          ativo:       rubrica.ativo,
        }
  )

  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function validate(): boolean {
    const e: Errors = {}
    if (!form.codigo || !form.codigo.trim()) e.codigo = 'Obrigatório.'
    if (!form.nome || form.nome.trim().length < 2) e.nome = 'Mínimo 2 caracteres.'
    if (!form.tipo) e.tipo = 'Obrigatório.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (isReadOnly || !validate()) return
    setSaving(true)
    try {
      const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
      if (isNew) {
        const payload: CreateRubricaPayload = {
          empresa_id:  empresaId,
          codigo:      form.codigo!,
          nome:        form.nome!,
          tipo:        form.tipo as Rubrica['tipo'],
          natureza:    form.natureza    || 'normal',
          incide_inss: form.incide_inss ?? 1,
          incide_irrf: form.incide_irrf ?? 1,
          incide_fgts: form.incide_fgts ?? 1,
          modo_valor:  (form.modo_valor as Rubrica['modo_valor']) ?? 'fixo',
          valor_fixo:  form.valor_fixo  ?? null,
          percentual:  form.percentual  ?? null,
          formula:     form.formula     || null,
          referencia:  form.referencia  || null,
          observacao:  form.observacao  || null,
          ativo:       form.ativo       ?? 1,
        }
        if (hasElectron) {
          const r = await window.electronAPI.createRubrica(payload)
          if (!r.success) { setErrors({ _global: r.error }); return }
          setStatusMsg(`Rubrica "${r.data.nome}" cadastrada.`, 'success')
          onSaved(r.data)
        } else {
          setErrors({ _global: 'Sem Electron (modo dev browser).' })
        }
      } else {
        const payload: UpdateRubricaPayload = {
          id:          rubrica!.id,
          nome:        form.nome,
          tipo:        form.tipo as Rubrica['tipo'],
          natureza:    form.natureza    || null,
          incide_inss: form.incide_inss ?? null,
          incide_irrf: form.incide_irrf ?? null,
          incide_fgts: form.incide_fgts ?? null,
          modo_valor:  (form.modo_valor as Rubrica['modo_valor']) ?? null,
          valor_fixo:  form.valor_fixo  ?? null,
          percentual:  form.percentual  ?? null,
          formula:     form.formula     || null,
          referencia:  form.referencia  || null,
          observacao:  form.observacao  || null,
          ativo:       form.ativo,
        }
        if (hasElectron) {
          const r = await window.electronAPI.updateRubrica(payload)
          if (!r.success) { setErrors({ _global: r.error }); return }
          setStatusMsg(`Rubrica "${r.data.nome}" atualizada.`, 'success')
          onSaved(r.data)
        } else {
          setErrors({ _global: 'Sem Electron (modo dev browser).' })
        }
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDuplicate() {
    if (!rubrica || empresaId == null) return
    setSaving(true)
    try {
      const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
      if (!hasElectron) { setErrors({ _global: 'Sem Electron (modo dev browser).' }); return }

      // Busca próximo código para a empresa
      const nextList = await window.electronAPI.listRubricas(empresaId)
      const maxCode = nextList
        .filter((r) => r.empresa_id === empresaId)
        .reduce((max, r) => Math.max(max, parseInt(r.codigo, 10) || 0), 0)
      const nextCodigo = String(maxCode + 1).padStart(4, '0')

      const payload: CreateRubricaPayload = {
        empresa_id:  empresaId,
        codigo:      nextCodigo,
        nome:        rubrica.nome,
        tipo:        rubrica.tipo,
        natureza:    rubrica.natureza    ?? 'normal',
        incide_inss: rubrica.incide_inss ?? 1,
        incide_irrf: rubrica.incide_irrf ?? 1,
        incide_fgts: rubrica.incide_fgts ?? 1,
        modo_valor:  rubrica.modo_valor  ?? 'fixo',
        valor_fixo:  rubrica.valor_fixo  ?? null,
        percentual:  rubrica.percentual  ?? null,
        formula:     rubrica.formula     ?? null,
        referencia:  rubrica.referencia  ?? null,
        observacao:  rubrica.observacao  ?? null,
        ativo:       1,
      }
      const r = await window.electronAPI.createRubrica(payload)
      if (!r.success) { setErrors({ _global: r.error }); return }
      setStatusMsg(`Rubrica duplicada como "${r.data.codigo} — ${r.data.nome}".`, 'success')
      onSaved(r.data)
    } finally {
      setSaving(false)
    }
  }

  const TABS = ['Identificação', 'Cálculo', 'Incidências']
  const modo = form.modo_valor

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
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
            {isNew
              ? 'Nova Rubrica'
              : `Rubrica — ${rubrica!.codigo} · ${rubrica!.nome}${isGlobal ? ' [GLOBAL]' : ''}`}
          </span>
          <button onClick={onClose} style={{
            width: 18, height: 18, border: 'none', background: 'transparent',
            color: 'rgba(255,255,255,0.8)', fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Banner de rubrica global */}
        {isGlobal && (
          <div style={{
            padding: '6px 10px', background: '#fff3cd',
            borderBottom: '1px solid #ffc107', fontSize: 11, color: '#856404',
          }}>
            ⚠ Rubrica global do sistema — não editável. Use "Duplicar para esta empresa" para criar uma cópia editável.
          </div>
        )}

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
                height: 24, padding: '0 14px', fontSize: 11, cursor: 'pointer',
                border: '1px solid var(--color-border-main)',
                borderBottom: tab === i ? '1px solid var(--color-bg-white)' : '1px solid var(--color-border-main)',
                borderTop: tab === i ? '2px solid var(--color-brand)' : '2px solid transparent',
                background: tab === i ? 'var(--color-bg-white)' : 'var(--color-bg-panel)',
                color: tab === i ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: tab === i ? 600 : 400, marginRight: 2, position: 'relative', bottom: -1,
              }}
            >{t}</button>
          ))}
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, background: 'var(--color-bg-app)' }}>
          {errors._global && (
            <div style={{
              marginBottom: 8, padding: '4px 8px', background: '#fff0f0',
              border: '1px solid #e53e3e', fontSize: 11, color: '#c53030',
            }}>{errors._global}</div>
          )}

          {/* Aba 0 — Identificação */}
          {tab === 0 && (
            <div>
              <Row>
                <Field label="Código" value={form.codigo} onChange={(v) => set('codigo', v)}
                  required error={errors.codigo} width={80} disabled={isReadOnly || !isNew} />
                <div style={{ flex: 1 }}>
                  <Field label="Nome" value={form.nome} onChange={(v) => set('nome', v)}
                    required error={errors.nome} disabled={isReadOnly} />
                </div>
              </Row>
              <Row>
                <SelectField label="Tipo" value={form.tipo}
                  onChange={(v) => set('tipo', v as Rubrica['tipo'])}
                  options={TIPO_OPTIONS} required disabled={isReadOnly} width={180} />
                <SelectField label="Natureza" value={form.natureza}
                  onChange={(v) => set('natureza', v)}
                  options={NATUREZA_OPTIONS} disabled={isReadOnly} width={180} />
              </Row>
              <Row>
                <Textarea label="Observação" value={form.observacao}
                  onChange={(v) => set('observacao', v)} disabled={isReadOnly}
                  placeholder="Observações sobre a rubrica..." />
              </Row>
            </div>
          )}

          {/* Aba 1 — Cálculo */}
          {tab === 1 && (
            <div>
              <Row mb={12}>
                <SelectField label="Modo de Valor" value={form.modo_valor}
                  onChange={(v) => set('modo_valor', v as Rubrica['modo_valor'])}
                  options={MODO_OPTIONS} disabled={isReadOnly} width={200} />
              </Row>

              {modo === 'fixo' && (
                <Row>
                  <Field label="Valor Fixo (R$)" value={form.valor_fixo ?? ''}
                    onChange={(v) => set('valor_fixo', v === '' ? undefined : parseFloat(v))}
                    type="number" step="0.01" disabled={isReadOnly} width={160} />
                </Row>
              )}

              {modo === 'percentual' && (
                <Row>
                  <Field label="Percentual (%)" value={form.percentual ?? ''}
                    onChange={(v) => set('percentual', v === '' ? undefined : parseFloat(v))}
                    type="number" step="0.01" disabled={isReadOnly} width={160} />
                </Row>
              )}

              {modo === 'formula' && (
                <Row>
                  <Textarea label="Fórmula" value={form.formula}
                    onChange={(v) => set('formula', v)} disabled={isReadOnly}
                    placeholder="Ex: SALARIO_BASE * PERCENTUAL / 100" />
                </Row>
              )}

              <Row mb={0}>
                <Field label="Referência" value={form.referencia}
                  onChange={(v) => set('referencia', v)} disabled={isReadOnly}
                  placeholder="Ex: Salário Mínimo, Salário Base..." width={300} />
              </Row>
            </div>
          )}

          {/* Aba 2 — Incidências */}
          {tab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
              <div style={{ padding: '10px 12px', background: 'var(--color-bg-panel)', border: '1px solid var(--color-border-main)' }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 10, fontWeight: 600 }}>
                  Encargos e Retenções
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <CheckRow
                    label="Incide INSS"
                    checked={(form.incide_inss ?? 1) === 1}
                    onChange={(v) => set('incide_inss', v ? 1 : 0)}
                    disabled={isReadOnly}
                  />
                  <CheckRow
                    label="Incide IRRF"
                    checked={(form.incide_irrf ?? 1) === 1}
                    onChange={(v) => set('incide_irrf', v ? 1 : 0)}
                    disabled={isReadOnly}
                  />
                  <CheckRow
                    label="Incide FGTS"
                    checked={(form.incide_fgts ?? 1) === 1}
                    onChange={(v) => set('incide_fgts', v ? 1 : 0)}
                    disabled={isReadOnly}
                  />
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
          {isGlobal && empresaId != null && (
            <button onClick={handleDuplicate} disabled={saving} style={footerBtn('warning')}>
              {saving ? 'Duplicando...' : '⊕ Duplicar para esta empresa'}
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} disabled={saving} style={footerBtn('secondary')}>Cancelar</button>
          {!isReadOnly && (
            <button onClick={handleSave} disabled={saving} style={footerBtn('primary')}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
