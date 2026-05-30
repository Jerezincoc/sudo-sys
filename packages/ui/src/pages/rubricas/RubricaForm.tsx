import React, { useState, useEffect } from 'react'
import type { Rubrica, CreateRubricaPayload, UpdateRubricaPayload } from '@sudo-sys/shared'
import { ESOCIAL_TABELA3 } from '@sudo-sys/shared'

interface Props {
  rubrica: Rubrica | null
  empresaId: number | null
  onSave: (payload: CreateRubricaPayload | UpdateRubricaPayload) => Promise<void>
  onCancel: () => void
  saving: boolean
  error: string | null
}

const TABS = ['Identificação', 'Cálculo', 'Incidências'] as const
type Tab = typeof TABS[number]

const TIPOS = [
  { value: 'provento',     label: 'Provento' },
  { value: 'desconto',     label: 'Desconto' },
  { value: 'informativo',  label: 'Informativo' },
] as const

const MODOS = [
  { value: 'fixo',       label: 'Valor Fixo' },
  { value: 'percentual', label: 'Percentual' },
  { value: 'formula',    label: 'Fórmula' },
] as const

export default function RubricaForm({ rubrica, empresaId, onSave, onCancel, saving, error }: Props) {
  const isEdit = rubrica != null

  const [tab, setTab] = useState<Tab>('Identificação')
  const [codigo, setCodigo]           = useState(rubrica?.codigo ?? '')
  const [nome, setNome]               = useState(rubrica?.nome ?? '')
  const [tipo, setTipo]               = useState<string>(rubrica?.tipo ?? 'provento')
  const [modoValor, setModoValor]     = useState<string>(rubrica?.modo_valor ?? 'fixo')
  const [valor, setValor]             = useState(String(rubrica?.valor ?? 0))
  const [percentual, setPercentual]   = useState(String(rubrica?.percentual ?? 0))
  const [formula, setFormula]         = useState(rubrica?.formula ?? '')
  const [incInss, setIncInss]         = useState(Boolean(rubrica?.incide_inss))
  const [incIrrf, setIncIrrf]         = useState(Boolean(rubrica?.incide_irrf))
  const [incFgts, setIncFgts]         = useState(Boolean(rubrica?.incide_fgts))
  const [incFerias, setIncFerias]     = useState(Boolean(rubrica?.incide_ferias))
  const [inc13, setInc13]             = useState(Boolean(rubrica?.incide_13))

  const [numero, setNumero]           = useState(rubrica?.numero ?? '')
  const [fator, setFator]             = useState(rubrica?.fator ?? 'valor')
  const [esocialRubrica, setEsocialRubrica] = useState(rubrica?.esocial_rubrica ?? '')
  const [mediaFerias, setMediaFerias] = useState(Boolean(rubrica?.media_ferias))
  const [mediaDecimo, setMediaDecimo] = useState(Boolean(rubrica?.media_decimo))
  const [mediaAviso, setMediaAviso]   = useState(Boolean(rubrica?.media_aviso))
  const [mediaRescisao, setMediaRescisao] = useState(Boolean(rubrica?.media_rescisao))

  useEffect(() => {
    if (rubrica) {
      setCodigo(rubrica.codigo)
      setNome(rubrica.nome)
      setTipo(rubrica.tipo)
      setModoValor(rubrica.modo_valor)
      setValor(String(rubrica.valor))
      setPercentual(String(rubrica.percentual))
      setFormula(rubrica.formula ?? '')
      setIncInss(Boolean(rubrica.incide_inss))
      setIncIrrf(Boolean(rubrica.incide_irrf))
      setIncFgts(Boolean(rubrica.incide_fgts))
      setIncFerias(Boolean(rubrica.incide_ferias))
      setInc13(Boolean(rubrica.incide_13))
      setNumero(rubrica.numero ?? '')
      setFator(rubrica.fator ?? 'valor')
      setEsocialRubrica(rubrica.esocial_rubrica ?? '')
      setMediaFerias(Boolean(rubrica.media_ferias))
      setMediaDecimo(Boolean(rubrica.media_decimo))
      setMediaAviso(Boolean(rubrica.media_aviso))
      setMediaRescisao(Boolean(rubrica.media_rescisao))
    }
  }, [rubrica])

  async function handleSubmit() {
    const base = {
      empresa_id:    empresaId,
      codigo:        codigo.trim(),
      nome:          nome.trim(),
      tipo:          tipo as Rubrica['tipo'],
      modo_valor:    modoValor as Rubrica['modo_valor'],
      valor:         parseFloat(valor) || 0,
      percentual:    parseFloat(percentual) || 0,
      formula:       formula.trim() || null,
      incide_inss:   incInss ? 1 : 0,
      incide_irrf:   incIrrf ? 1 : 0,
      incide_fgts:   incFgts ? 1 : 0,
      incide_ferias: incFerias ? 1 : 0,
      incide_13:     inc13 ? 1 : 0,
      ativo:         rubrica?.ativo ?? 1,
      numero:        numero.trim() || null,
      fator:         fator as Rubrica['fator'],
      esocial_rubrica: esocialRubrica || null,
      media_ferias:  mediaFerias ? 1 : 0,
      media_decimo:  mediaDecimo ? 1 : 0,
      media_aviso:   mediaAviso ? 1 : 0,
      media_rescisao:mediaRescisao ? 1 : 0,
    }
    if (isEdit) {
      await onSave({ id: rubrica!.id, ...base } as UpdateRubricaPayload)
    } else {
      await onSave(base as CreateRubricaPayload)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-white)' }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--color-text-primary)' }}>
          {isEdit ? `Editar Rubrica — ${rubrica!.codigo}` : 'Nova Rubrica'}
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
        {tab === 'Identificação' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
            <Field label="Código *"><input value={codigo} onChange={(e) => setCodigo(e.target.value)} style={inp} /></Field>
            <Field label="Nome *"><input value={nome} onChange={(e) => setNome(e.target.value)} style={inp} /></Field>
            <Field label="Tipo *">
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inp}>
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Número"><input value={numero} onChange={(e) => setNumero(e.target.value)} style={inp} placeholder="001" /></Field>
            <Field label="Fator">
              <select value={fator} onChange={(e) => setFator(e.target.value as any)} style={inp}>
                <option value="valor">Valor R$</option>
                <option value="percentual">Percentual %</option>
                <option value="horas">Horas</option>
                <option value="dias">Dias</option>
              </select>
            </Field>
            <Field label="Classificação eSocial">
              <select value={esocialRubrica} onChange={(e) => setEsocialRubrica(e.target.value)} style={inp}>
                <option value="">-- Selecione --</option>
                {(ESOCIAL_TABELA3 as {codigo: string; descricao: string}[]).map(item => (
                  <option key={item.codigo} value={item.codigo}>{item.codigo} — {item.descricao}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {tab === 'Cálculo' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="Modo de Valor">
              <select value={modoValor} onChange={(e) => setModoValor(e.target.value)} style={inp}>
                {MODOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            {modoValor === 'fixo' && (
              <Field label="Valor (R$)"><input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} style={inp} /></Field>
            )}
            {modoValor === 'percentual' && (
              <Field label="Percentual (%)"><input type="number" step="0.01" value={percentual} onChange={(e) => setPercentual(e.target.value)} style={inp} /></Field>
            )}
            {modoValor === 'formula' && (
              <Field label="Fórmula" style={{ gridColumn: '1 / -1' }}>
                <input value={formula} onChange={(e) => setFormula(e.target.value)} style={inp} placeholder="Ex: SALARIO * 0.05" />
              </Field>
            )}
          </div>
        )}

        {tab === 'Incidências' && (
          <div style={{ display: 'flex', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>
              <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Bases de Cálculo</div>
              {[
                { label: 'Incide no INSS',   value: incInss,   set: setIncInss },
                { label: 'Incide no IRRF',   value: incIrrf,   set: setIncIrrf },
                { label: 'Incide no FGTS',   value: incFgts,   set: setIncFgts },
                { label: 'Incide em Férias', value: incFerias, set: setIncFerias },
                { label: 'Incide no 13°',    value: inc13,     set: setInc13 },
              ].map(({ label, value, set }) => (
                <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>
              <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>Composição de Médias</div>
              {[
                { label: 'Média de Férias',       value: mediaFerias,   set: setMediaFerias },
                { label: 'Média de 13° Salário',  value: mediaDecimo,   set: setMediaDecimo },
                { label: 'Média de Aviso Prévio', value: mediaAviso,    set: setMediaAviso },
                { label: 'Média de Rescisão',     value: mediaRescisao, set: setMediaRescisao },
              ].map(({ label, value, set }) => (
                <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} />
                  {label}
                </label>
              ))}
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, padding: '8px 12px', borderTop: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)' }}>
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
  border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)',
  color: 'var(--color-text-primary)',
}
const btnPri: React.CSSProperties = {
  height: 24, padding: '0 14px', fontSize: 11, borderRadius: 0, cursor: 'pointer',
  border: '1px solid var(--color-brand)', background: 'var(--color-brand)', color: '#fff', fontWeight: 600,
}
