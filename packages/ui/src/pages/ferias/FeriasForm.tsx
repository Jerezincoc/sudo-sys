import React, { useState, useEffect } from 'react'
import type { Ferias, Funcionario, CreateFeriasPayload, UpdateFeriasPayload } from '@sudo-sys/shared'

interface Props {
  ferias: Ferias | null
  empresaId: number
  funcionarios: Funcionario[]
  onSave: (payload: CreateFeriasPayload | UpdateFeriasPayload) => Promise<void>
  onCancel: () => void
  saving: boolean
  error: string | null
}

const TABS = ['Dados', 'Financeiro'] as const
type Tab = typeof TABS[number]

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export default function FeriasForm({ ferias, empresaId, funcionarios, onSave, onCancel, saving, error }: Props) {
  const isEdit = ferias != null

  const [tab, setTab] = useState<Tab>('Dados')
  const [funcionarioId, setFuncionarioId] = useState(ferias?.funcionario_id ?? 0)
  const [periodoInicio, setPeriodoInicio] = useState(ferias?.periodo_inicio ?? '')
  const [periodoFim, setPeriodoFim]       = useState(ferias?.periodo_fim ?? '')
  const [inicioGozo, setInicioGozo]       = useState(ferias?.inicio_gozo ?? '')
  const [fimGozo, setFimGozo]             = useState(ferias?.fim_gozo ?? '')
  const [diasConcedidos, setDiasConcedidos] = useState(ferias?.dias_concedidos ?? 30)
  const [diasAbono, setDiasAbono]         = useState(ferias?.dias_abono ?? 0)
  const [adiant13, setAdiant13]           = useState(Boolean(ferias?.adiantamento_13))
  const [salario, setSalario]             = useState(ferias?.salario_referencia ?? 0)
  const [status, setStatus]               = useState(ferias?.status ?? 'agendada')
  const [observacao, setObservacao]       = useState(ferias?.observacao ?? '')

  // Auto-calcular fim_gozo quando inicio_gozo ou diasConcedidos mudam
  useEffect(() => {
    if (!inicioGozo) return
    try {
      const d = new Date(inicioGozo)
      d.setDate(d.getDate() + diasConcedidos - 1)
      setFimGozo(d.toISOString().slice(0, 10))
    } catch { /* datas inválidas */ }
  }, [inicioGozo, diasConcedidos])

  // Cálculos financeiros
  const valorFerias     = salario > 0 ? (salario / 30) * diasConcedidos : 0
  const valorAbono      = salario > 0 && diasAbono > 0 ? (salario / 30) * diasAbono * (1 / 3) : 0
  const valorAdiant13   = adiant13 && salario > 0 ? salario / 12 : 0
  const valorTotal      = valorFerias + valorAbono + valorAdiant13

  async function handleSubmit() {
    const base: Omit<CreateFeriasPayload, never> = {
      funcionario_id:        funcionarioId,
      empresa_id:            empresaId,
      periodo_inicio:        periodoInicio,
      periodo_fim:           periodoFim,
      inicio_gozo:           inicioGozo,
      fim_gozo:              fimGozo,
      dias_concedidos:       diasConcedidos,
      dias_abono:            diasAbono,
      adiantamento_13:       adiant13 ? 1 : 0,
      salario_referencia:    salario,
      valor_ferias:          parseFloat(valorFerias.toFixed(2)),
      valor_abono:           parseFloat(valorAbono.toFixed(2)),
      valor_adiantamento_13: parseFloat(valorAdiant13.toFixed(2)),
      valor_total:           parseFloat(valorTotal.toFixed(2)),
      status:                status as Ferias['status'],
      observacao:            observacao.trim() || null,
    }
    if (isEdit) {
      await onSave({ id: ferias!.id, ...base } as UpdateFeriasPayload)
    } else {
      await onSave(base as CreateFeriasPayload)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-white)' }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--color-text-primary)' }}>
          {isEdit ? 'Editar Férias' : 'Agendar Férias'}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)' }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            height: 26, padding: '0 14px', border: 'none', fontSize: 11,
            borderBottom: tab === t ? '2px solid var(--color-brand)' : '2px solid transparent',
            background: tab === t ? 'var(--color-bg-white)' : 'transparent',
            color: tab === t ? 'var(--color-brand)' : 'var(--color-text-secondary)',
            fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {tab === 'Dados' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Funcionário *" style={{ gridColumn: '1 / -1' }}>
              <select value={funcionarioId} onChange={(e) => setFuncionarioId(Number(e.target.value))} style={inp}>
                <option value={0}>— Selecione —</option>
                {funcionarios.map((f) => (
                  <option key={f.id} value={f.id}>{f.codigo} — {f.nome}</option>
                ))}
              </select>
            </Field>
            <Field label="Início do Período Aquisitivo *">
              <input type="date" value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} style={inp} />
            </Field>
            <Field label="Fim do Período Aquisitivo *">
              <input type="date" value={periodoFim} onChange={(e) => setPeriodoFim(e.target.value)} style={inp} />
            </Field>
            <Field label="Início do Gozo *">
              <input type="date" value={inicioGozo} onChange={(e) => setInicioGozo(e.target.value)} style={inp} />
            </Field>
            <Field label="Fim do Gozo (auto)">
              <input type="date" value={fimGozo} readOnly style={{ ...inp, background: 'var(--color-bg-panel)', color: 'var(--color-text-muted)' }} />
            </Field>
            <Field label="Dias Concedidos (5–30)">
              <input type="number" min={5} max={30} value={diasConcedidos}
                onChange={(e) => setDiasConcedidos(Math.max(5, Math.min(30, parseInt(e.target.value) || 30)))} style={inp} />
            </Field>
            <Field label="Dias de Abono Pecuniário">
              <input type="number" min={0} max={10} value={diasAbono}
                onChange={(e) => setDiasAbono(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))} style={inp} />
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as Ferias['status'])} style={inp}>
                <option value="agendada">Agendada</option>
                <option value="aprovada">Aprovada</option>
                <option value="paga">Paga</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </Field>
            <div />
            <Field label="Observação" style={{ gridColumn: '1 / -1' }}>
              <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)}
                style={{ ...inp, height: 54, resize: 'vertical', paddingTop: 4, paddingBottom: 4 }} />
            </Field>
          </div>
        )}

        {tab === 'Financeiro' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Salário de Referência (R$)">
              <input type="number" step="0.01" value={salario}
                onChange={(e) => setSalario(parseFloat(e.target.value) || 0)} style={inp} />
            </Field>
            <Field label="Adiantamento 13°">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, height: 24, fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={adiant13} onChange={(e) => setAdiant13(e.target.checked)} />
                Sim
              </label>
            </Field>

            <div style={{ gridColumn: '1 / -1', marginTop: 8, borderTop: '1px solid var(--color-border-main)', paddingTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                Cálculo Estimado
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['Férias', valorFerias],
                  ['Abono Pecuniário', valorAbono],
                  ['Adiantamento 13°', valorAdiant13],
                ].map(([label, val]) => (
                  <React.Fragment key={String(label)}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{label}</div>
                    <div style={{ fontSize: 11, textAlign: 'right', fontFamily: 'monospace' }}>{fmtBRL(Number(val))}</div>
                  </React.Fragment>
                ))}
                <div style={{ gridColumn: '1 / -1', height: 1, background: 'var(--color-border-main)', margin: '4px 0' }} />
                <div style={{ fontSize: 12, fontWeight: 700 }}>Total</div>
                <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'right', fontFamily: 'monospace', color: 'var(--color-brand)' }}>{fmtBRL(valorTotal)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {error && (
        <div style={{ margin: '0 12px', padding: '5px 8px', fontSize: 11, color: '#c0392b', background: '#fdf0ef', border: '1px solid #e8c4c0' }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, padding: '8px 12px',
        borderTop: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)' }}>
        <button onClick={onCancel} style={btnSec} disabled={saving}>Cancelar</button>
        <button onClick={handleSubmit} style={btnPri} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
      </div>
    </div>
  )
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, ...style }}>
      <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  height: 24, padding: '0 6px', fontSize: 12,
  border: '1px solid var(--color-border-main)',
  background: 'var(--color-bg-white)', color: 'var(--color-text-primary)',
  borderRadius: 0, width: '100%', boxSizing: 'border-box',
}
const btnSec: React.CSSProperties = {
  height: 24, padding: '0 14px', fontSize: 11, borderRadius: 0, cursor: 'pointer',
  border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', color: 'var(--color-text-primary)',
}
const btnPri: React.CSSProperties = {
  height: 24, padding: '0 14px', fontSize: 11, borderRadius: 0, cursor: 'pointer',
  border: '1px solid var(--color-brand)', background: 'var(--color-brand)', color: '#fff', fontWeight: 600,
}
