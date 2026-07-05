import React, { useState, useEffect, useCallback } from 'react'
import type { FolhaCompetencia, FolhaLancamento, Funcionario, Rubrica, CreateLancamentoPayload } from '@sudo-sys/shared'

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface LancamentoFormData {
  rubrica_id: number | null
  rubrica_codigo: string
  rubrica_nome: string
  rubrica_tipo: 'provento' | 'desconto' | 'informativo'
  referencia: string
  valor: string
}

function LancamentoFormModal({
  rubricas,
  onSave,
  onClose,
  saving,
  error,
}: {
  rubricas: Rubrica[]
  onSave: (d: LancamentoFormData) => void
  onClose: () => void
  saving: boolean
  error: string | null
}) {
  const [form, setForm] = useState<LancamentoFormData>({
    rubrica_id: null, rubrica_codigo: '', rubrica_nome: '', rubrica_tipo: 'provento',
    referencia: '0', valor: '0',
  })

  function handleRubrica(id: string) {
    const r = rubricas.find((x) => x.id === parseInt(id, 10))
    if (!r) return
    setForm((f) => ({
      ...f,
      rubrica_id: r.id,
      rubrica_codigo: r.codigo,
      rubrica_nome: r.nome,
      rubrica_tipo: r.tipo as 'provento' | 'desconto' | 'informativo',
    }))
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ width: 400, background: 'var(--color-bg-white)', border: '1px solid var(--color-border-main)',
        padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 12, fontWeight: 700, borderBottom: '1px solid var(--color-border-main)', paddingBottom: 8 }}>
          Adicionar Lançamento
        </div>

        <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
          Rubrica
        </label>
        <select value={form.rubrica_id ?? ''} onChange={(e) => handleRubrica(e.target.value)}
          style={{ height: 24, fontSize: 11, border: '1px solid var(--color-border-main)', borderRadius: 0, padding: '0 4px', background: 'var(--color-bg-white)' }}>
          <option value="">— Selecione —</option>
          {rubricas.map((r) => (
            <option key={r.id} value={r.id}>{r.codigo} — {r.nome} ({r.tipo})</option>
          ))}
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
              Referência
            </label>
            <input type="number" value={form.referencia} onChange={(e) => setForm((f) => ({ ...f, referencia: e.target.value }))}
              style={{ width: '100%', height: 24, fontSize: 11, border: '1px solid var(--color-border-main)', borderRadius: 0, padding: '0 4px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
              Valor (R$)
            </label>
            <input type="number" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
              style={{ width: '100%', height: 24, fontSize: 11, border: '1px solid var(--color-border-main)', borderRadius: 0, padding: '0 4px', boxSizing: 'border-box' }} />
          </div>
        </div>

        {error && <div style={{ fontSize: 11, color: '#c0392b' }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
          <button onClick={onClose} disabled={saving}
            style={{ height: 24, padding: '0 12px', fontSize: 11, border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', cursor: 'pointer', borderRadius: 0 }}>
            Cancelar
          </button>
          <button onClick={() => onSave(form)} disabled={saving || !form.rubrica_id}
            style={{ height: 24, padding: '0 12px', fontSize: 11, border: 'none', background: 'var(--color-brand)', color: '#fff', cursor: 'pointer', borderRadius: 0, fontWeight: 600 }}>
            {saving ? 'Salvando…' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  folha: FolhaCompetencia
  funcionarios: Funcionario[]
  rubricas: Rubrica[]
  /** Chamado após "Calcular Folha" com a folha atualizada — o pai atualiza seleção/lista/holerites. */
  onFolhaCalculada: (folha: FolhaCompetencia) => void
  setStatus: (msg: string | null, type?: 'info' | 'success' | 'error') => void
}

export default function LancamentosEditor({ folha, funcionarios, rubricas, onFolhaCalculada, setStatus }: Props) {
  const [selectedFuncId, setSelectedFuncId] = useState<number | null>(funcionarios[0]?.id ?? null)
  const [lancamentos, setLancamentos] = useState<FolhaLancamento[]>([])
  const [calculando, setCalculando]   = useState(false)
  const [showForm, setShowForm]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const fechada = folha.status === 'fechada'

  const load = useCallback(async () => {
    if (!window.electronAPI) return
    const list = await window.electronAPI.listLancamentos(folha.id, selectedFuncId ?? undefined)
    setLancamentos(list)
  }, [folha.id, selectedFuncId])

  useEffect(() => { load() }, [load])

  async function handleAdd(data: LancamentoFormData) {
    if (!selectedFuncId || !window.electronAPI) return
    setSaving(true)
    setError(null)
    try {
      const payload: CreateLancamentoPayload = {
        folha_id: folha.id,
        funcionario_id: selectedFuncId,
        empresa_id: folha.empresa_id,
        rubrica_id: data.rubrica_id,
        rubrica_codigo: data.rubrica_codigo,
        rubrica_nome: data.rubrica_nome,
        rubrica_tipo: data.rubrica_tipo,
        referencia: parseFloat(data.referencia) || 0,
        valor: parseFloat(data.valor) || 0,
        origem: 'manual',
      }
      const res = await window.electronAPI.addLancamento(payload)
      if (!res.success) { setError(res.error); return }
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.electronAPI) return
    await window.electronAPI.deleteLancamento(id)
    load()
  }

  async function handleCalcular() {
    if (!window.electronAPI) return
    setCalculando(true)
    try {
      const res = await window.electronAPI.calcularFolha(folha.id)
      if (!res.success) { setStatus(res.error, 'error'); return }
      setStatus('Folha calculada com sucesso.', 'success')
      onFolhaCalculada(res.data)
    } finally {
      setCalculando(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px',
        borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)' }}>
        <select value={selectedFuncId ?? ''} onChange={(e) => setSelectedFuncId(e.target.value ? Number(e.target.value) : null)}
          style={{ height: 22, fontSize: 11, border: '1px solid var(--color-border-main)', borderRadius: 0, padding: '0 4px', background: 'var(--color-bg-white)', minWidth: 200 }}>
          <option value="">— Selecione funcionário —</option>
          {funcionarios.map((f) => <option key={f.id} value={f.id}>{f.codigo} — {f.nome}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        {selectedFuncId && !fechada && (
          <button onClick={() => { setShowForm(true); setError(null) }}
            style={{ height: 22, padding: '0 10px', fontSize: 11, border: '1px solid var(--color-brand)', background: 'var(--color-bg-white)', color: 'var(--color-brand)', cursor: 'pointer', borderRadius: 0, fontWeight: 600 }}>
            + Lançamento
          </button>
        )}
        {!fechada && (
          <button onClick={handleCalcular} disabled={calculando}
            style={{ height: 22, padding: '0 14px', fontSize: 11, border: 'none', background: 'var(--color-brand)', color: '#fff', cursor: 'pointer', borderRadius: 0, fontWeight: 700 }}>
            {calculando ? 'Calculando…' : 'Calcular Folha'}
          </button>
        )}
      </div>

      {/* Grid lançamentos */}
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 90px 80px 90px 80px 36px', flexShrink: 0,
        background: 'var(--color-bg-panel)', borderBottom: '2px solid var(--color-border-main)' }}>
        {['Código','Rubrica','Tipo','Referência','Valor','Origem',''].map((h, i) => (
          <div key={i} style={{ padding: '3px 6px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>{h}</div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {lancamentos.map((l) => (
          <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 90px 80px 90px 80px 36px',
            borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)' }}>
            <div style={{ padding: '3px 6px', fontSize: 11 }}>{l.rubrica_codigo}</div>
            <div style={{ padding: '3px 6px', fontSize: 11 }}>{l.rubrica_nome}</div>
            <div style={{ padding: '3px 6px', fontSize: 11, color: l.rubrica_tipo === 'desconto' ? '#c0392b' : l.rubrica_tipo === 'provento' ? '#155724' : 'inherit' }}>
              {l.rubrica_tipo}
            </div>
            <div style={{ padding: '3px 6px', fontSize: 11, textAlign: 'right' }}>{l.referencia}</div>
            <div style={{ padding: '3px 6px', fontSize: 11, textAlign: 'right', fontWeight: 600 }}>
              {fmtMoeda(l.valor)}
            </div>
            <div style={{ padding: '3px 6px', fontSize: 11, color: 'var(--color-text-muted)' }}>{l.origem}</div>
            <div style={{ padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!fechada && (
                <button onClick={() => handleDelete(l.id)}
                  style={{ width: 18, height: 18, fontSize: 11, border: 'none', background: 'transparent',
                    color: '#c0392b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
        {lancamentos.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
            {selectedFuncId ? 'Nenhum lançamento para este funcionário.' : 'Selecione um funcionário para ver os lançamentos.'}
          </div>
        )}
      </div>

      {showForm && (
        <LancamentoFormModal
          rubricas={rubricas}
          onSave={handleAdd}
          onClose={() => setShowForm(false)}
          saving={saving}
          error={error}
        />
      )}
    </div>
  )
}
