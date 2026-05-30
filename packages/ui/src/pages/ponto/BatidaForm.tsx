import React, { useState, useEffect } from 'react'
import type { RegistroPonto, Funcionario, CreatePontoPayload, UpdatePontoPayload } from '@sudo-sys/shared'

interface Props {
  registro: RegistroPonto | null
  empresaId: number
  funcionarios: Funcionario[]
  onSave: (payload: CreatePontoPayload | UpdatePontoPayload) => Promise<void>
  onCancel: () => void
  saving: boolean
  error: string | null
}

function toMin(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function calcHoras(entrada: string, saidaAlmoco: string, retornoAlmoco: string, saida: string, cargaDiaria = 8.8) {
  if (!entrada || !saida) return { trabalhadas: 0, normais: 0, extras50: 0, extras100: 0, falta: 0 }
  const manha = saidaAlmoco ? toMin(saidaAlmoco) - toMin(entrada) : 0
  const tarde = retornoAlmoco ? toMin(saida) - toMin(retornoAlmoco) : toMin(saida) - toMin(entrada)
  const trabalhadas = (manha + tarde) / 60
  const normais = Math.min(trabalhadas, cargaDiaria)
  const extra = Math.max(0, trabalhadas - cargaDiaria)
  const extras50 = Math.min(extra, 2)
  const extras100 = Math.max(0, extra - 2)
  const falta = Math.max(0, cargaDiaria - trabalhadas)
  return { trabalhadas, normais, extras50, extras100, falta }
}

function fmtH(h: number) {
  if (h === 0) return '—'
  const sign = h < 0 ? '-' : ''
  const abs = Math.abs(h)
  const hh = Math.floor(abs)
  const mm = Math.round((abs - hh) * 60)
  return `${sign}${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

const TIPOS: { value: RegistroPonto['tipo']; label: string }[] = [
  { value: 'normal',      label: 'Normal'      },
  { value: 'feriado',     label: 'Feriado'     },
  { value: 'folga',       label: 'Folga'       },
  { value: 'afastamento', label: 'Afastamento' },
  { value: 'falta',       label: 'Falta'       },
]

const STATUS: { value: RegistroPonto['status']; label: string }[] = [
  { value: 'pendente',  label: 'Pendente'  },
  { value: 'aprovado',  label: 'Aprovado'  },
  { value: 'rejeitado', label: 'Rejeitado' },
]

export default function BatidaForm({ registro, empresaId, funcionarios, onSave, onCancel, saving, error }: Props) {
  const isEdit = registro != null

  const [funcionarioId, setFuncionarioId] = useState(registro?.funcionario_id ?? 0)
  const [data, setData]                   = useState(registro?.data ?? '')
  const [entrada, setEntrada]             = useState(registro?.entrada ?? '')
  const [saidaAlm, setSaidaAlm]           = useState(registro?.saida_almoco ?? '')
  const [retornoAlm, setRetornoAlm]       = useState(registro?.retorno_almoco ?? '')
  const [saida, setSaida]                 = useState(registro?.saida ?? '')
  const [tipo, setTipo]                   = useState<RegistroPonto['tipo']>(registro?.tipo ?? 'normal')
  const [status, setStatus]               = useState<RegistroPonto['status']>(registro?.status ?? 'pendente')
  const [justificativa, setJustificativa] = useState(registro?.justificativa ?? '')

  useEffect(() => {
    if (registro) {
      setFuncionarioId(registro.funcionario_id)
      setData(registro.data)
      setEntrada(registro.entrada ?? '')
      setSaidaAlm(registro.saida_almoco ?? '')
      setRetornoAlm(registro.retorno_almoco ?? '')
      setSaida(registro.saida ?? '')
      setTipo(registro.tipo)
      setStatus(registro.status)
      setJustificativa(registro.justificativa ?? '')
    }
  }, [registro])

  const calc = calcHoras(entrada, saidaAlm, retornoAlm, saida)

  async function handleSubmit() {
    const base: Omit<CreatePontoPayload, never> = {
      funcionario_id:    funcionarioId,
      empresa_id:        empresaId,
      data,
      entrada:           entrada || null,
      saida_almoco:      saidaAlm || null,
      retorno_almoco:    retornoAlm || null,
      saida:             saida || null,
      horas_trabalhadas: parseFloat(calc.trabalhadas.toFixed(4)),
      horas_normais:     parseFloat(calc.normais.toFixed(4)),
      horas_extras_50:   parseFloat(calc.extras50.toFixed(4)),
      horas_extras_100:  parseFloat(calc.extras100.toFixed(4)),
      horas_falta:       parseFloat(calc.falta.toFixed(4)),
      tipo,
      status,
      justificativa:     justificativa.trim() || null,
    }
    if (isEdit) {
      await onSave({ id: registro!.id, ...base } as UpdatePontoPayload)
    } else {
      await onSave(base as CreatePontoPayload)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-white)' }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--color-text-primary)' }}>
          {isEdit ? 'Editar Registro de Ponto' : 'Novo Registro de Ponto'}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Funcionário *" style={{ gridColumn: '1 / -1' }}>
            <select value={funcionarioId} onChange={(e) => setFuncionarioId(Number(e.target.value))} style={inp}>
              <option value={0}>— Selecione —</option>
              {funcionarios.map((f) => (
                <option key={f.id} value={f.id}>{f.codigo} — {f.nome}</option>
              ))}
            </select>
          </Field>

          <Field label="Data *">
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} style={inp} />
          </Field>
          <Field label="Tipo">
            <select value={tipo} onChange={(e) => setTipo(e.target.value as RegistroPonto['tipo'])} style={inp}>
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>

          <Field label="Entrada">
            <input type="time" value={entrada} onChange={(e) => setEntrada(e.target.value)} style={inp} />
          </Field>
          <Field label="Saída Almoço">
            <input type="time" value={saidaAlm} onChange={(e) => setSaidaAlm(e.target.value)} style={inp} />
          </Field>
          <Field label="Retorno Almoço">
            <input type="time" value={retornoAlm} onChange={(e) => setRetornoAlm(e.target.value)} style={inp} />
          </Field>
          <Field label="Saída">
            <input type="time" value={saida} onChange={(e) => setSaida(e.target.value)} style={inp} />
          </Field>

          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as RegistroPonto['status'])} style={inp}>
              {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
          <div />

          <Field label="Justificativa" style={{ gridColumn: '1 / -1' }}>
            <textarea value={justificativa} onChange={(e) => setJustificativa(e.target.value)}
              style={{ ...inp, height: 54, resize: 'vertical', paddingTop: 4, paddingBottom: 4 }} />
          </Field>

          {/* Preview de horas */}
          <div style={{ gridColumn: '1 / -1', marginTop: 4, borderTop: '1px solid var(--color-border-main)', paddingTop: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              Apuração
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {[
                ['H. Trabalhadas', calc.trabalhadas],
                ['H. Normais',     calc.normais],
                ['H. Extras 50%',  calc.extras50],
                ['H. Extras 100%', calc.extras100],
                ['H. Falta',       calc.falta],
              ].map(([label, val]) => (
                <React.Fragment key={String(label)}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{label}</div>
                  <div style={{ fontSize: 11, textAlign: 'right', fontFamily: 'monospace',
                    color: String(label).includes('Falta') && Number(val) > 0 ? '#c0392b'
                      : String(label).includes('Extra') && Number(val) > 0 ? '#155724'
                      : 'var(--color-text-primary)' }}>
                    {fmtH(Number(val))}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
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
