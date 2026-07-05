import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { Rubrica, CreateRubricaPayload, UpdateRubricaPayload } from '@sudo-sys/shared'
import { usePageActionsStore } from '@/state/pageActionsSlice'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import RubricaForm from './RubricaForm'
import VariablesDictionaryPage from './VariablesDictionaryPage'
import ConfirmDialog from '@/components/feedback/ConfirmDialog'

function TipoBadge({ tipo }: { tipo: string }) {
  const cfg =
    tipo === 'provento'   ? { bg: '#d4edda', color: '#155724', label: 'Provento' } :
    tipo === 'desconto'   ? { bg: '#f8d7da', color: '#721c24', label: 'Desconto' } :
                            { bg: '#d1ecf1', color: '#0c5460', label: 'Informativo' }
  return (
    <span style={{ display: 'inline-block', padding: '1px 6px', fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.04em', background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

interface ColDef { key: string; label: string; width: number | string; align?: 'left'|'center'|'right'; render?: (r: Rubrica) => React.ReactNode }

const COLUMNS: ColDef[] = [
  { key: '_arrow',      label: '',          width: 14,   align: 'center', render: () => null },
  { key: '_check',      label: '',          width: 20,   align: 'center', render: () => null },
  { key: 'codigo',      label: 'Código',    width: 70,   align: 'center' },
  { key: 'nome',        label: 'Nome',      width: '1fr' },
  { key: 'tipo',        label: 'Tipo',      width: 110,  align: 'center', render: (r) => <TipoBadge tipo={r.tipo} /> },
  { key: 'modo_valor',  label: 'Modo',      width: 90,   align: 'center',
    render: (r) => r.modo_valor === 'fixo' ? 'Fixo' : r.modo_valor === 'percentual' ? 'Percentual' : 'Fórmula' },
  { key: 'valor',       label: 'Valor/%',   width: 90,   align: 'right',
    render: (r) => r.modo_valor === 'percentual' ? `${r.percentual}%` : `R$ ${r.valor.toFixed(2)}` },
  { key: 'incide_inss', label: 'INSS',      width: 44,   align: 'center', render: (r) => r.incide_inss ? '✔' : '—' },
  { key: 'incide_irrf', label: 'IRRF',      width: 44,   align: 'center', render: (r) => r.incide_irrf ? '✔' : '—' },
  { key: 'ativo',       label: 'Status',    width: 66,   align: 'center',
    render: (r) => r.ativo === 1
      ? <span style={{ fontSize: 10, fontWeight: 600, color: '#155724' }}>Ativo</span>
      : <span style={{ fontSize: 10, fontWeight: 600, color: '#721c24' }}>Inativo</span> },
]

type FormMode = 'new' | number | null

export default function RubricasPage() {
  const { empresaId } = useSelectedEmpresaStore()
  const empresaIdNum = empresaId != null ? parseInt(empresaId, 10) : null

  const [rubricas, setRubricas]     = useState<Rubrica[]>([])
  const [loading, setLoading]       = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [formMode, setFormMode]     = useState<FormMode>(null)
  const [search, setSearch]         = useState('')
  const [filterTipo, setFilterTipo] = useState<'all'|'provento'|'desconto'|'informativo'>('all')
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<{ ids: number[]; title: string; message: string; danger: boolean } | null>(null)
  const [showVariaveis, setShowVariaveis] = useState(false)

  const handleDeleteRef = useRef<() => void>(() => {})
  const loadRef = useRef<() => Promise<void>>(async () => {})

  const setActions   = usePageActionsStore((s) => s.setActions)
  const clearActions = usePageActionsStore((s) => s.clearActions)
  const setStatus    = usePageActionsStore((s) => s.setStatus)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const list = await window.electronAPI.listRubricas(empresaIdNum ?? undefined)
        setRubricas(list)
      }
    } catch (err) {
      setStatus('Erro ao carregar rubricas: ' + String(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [empresaIdNum, setStatus])

  useEffect(() => { loadRef.current = load }, [load])
  useEffect(() => { load() }, [load])

  const filtered = rubricas.filter((r) => {
    if (filterTipo !== 'all' && r.tipo !== filterTipo) return false
    if (search) {
      const q = search.toLowerCase()
      return r.codigo.toLowerCase().includes(q) || r.nome.toLowerCase().includes(q)
    }
    return true
  })

  const getTargetIds = useCallback((): number[] | null => {
    if (checkedIds.size > 0) return Array.from(checkedIds)
    if (selectedId != null)  return [selectedId]
    setStatus('Selecione ao menos uma rubrica.', 'error')
    return null
  }, [checkedIds, selectedId, setStatus])

  const handleDelete = useCallback(() => {
    const ids = getTargetIds()
    if (!ids) return
    const targets = ids.map((id) => rubricas.find((r) => r.id === id)).filter((r): r is Rubrica => !!r)
    const globais = targets.filter((r) => r.empresa_id == null)
    if (globais.length > 0) { setStatus('Rubricas globais não podem ser excluídas.', 'error'); return }
    const ativos = targets.filter((r) => r.ativo === 1)
    if (ativos.length === targets.length) {
      setConfirmDel({ ids, title: 'Desativar Rubrica(s)', message: `Desativar ${ids.length} rubrica(s)? Poderão ser reativadas.`, danger: false })
    } else {
      setConfirmDel({ ids, title: 'Excluir Rubrica(s)', message: `Excluir permanentemente ${ids.length} rubrica(s) inativa(s)?`, danger: true })
    }
  }, [getTargetIds, rubricas, setStatus])

  useEffect(() => { handleDeleteRef.current = handleDelete }, [handleDelete])

  useEffect(() => {
    setActions({
      onNew:     () => { setFormMode('new'); setFormError(null) },
      onDelete:  () => handleDeleteRef.current(),
      onEdit:    () => { if (selectedId != null) { setFormMode(selectedId); setFormError(null) } },
      onRefresh: () => loadRef.current(),
      total: filtered.length,
      current: selectedId != null ? filtered.findIndex((r) => r.id === selectedId) + 1 : 0,
    })
    return clearActions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rubricas.length, selectedId, filtered.length])

  const doDelete = useCallback(async () => {
    if (!confirmDel || !window.electronAPI) return
    let ok = 0
    for (const id of confirmDel.ids) {
      const res = await window.electronAPI.deleteRubrica(id)
      if (res.success) ok++
    }
    setStatus(`${ok} rubrica(s) processada(s).`, 'success')
    setConfirmDel(null)
    setCheckedIds(new Set())
    setSelectedId(null)
    load()
  }, [confirmDel, load, setStatus])

  const handleSave = useCallback(async (payload: CreateRubricaPayload | UpdateRubricaPayload) => {
    if (!window.electronAPI) return
    setSaving(true)
    setFormError(null)
    try {
      const res = 'id' in payload
        ? await window.electronAPI.updateRubrica(payload as UpdateRubricaPayload)
        : await window.electronAPI.createRubrica(payload as CreateRubricaPayload)
      if (!res.success) { setFormError(res.error ?? 'Erro ao salvar.'); return }
      setFormMode(null)
      setStatus('Rubrica salva.', 'success')
      load()
    } finally {
      setSaving(false)
    }
  }, [load, setStatus])

  const handleDuplicate = useCallback(async (rubrica: Rubrica) => {
    if (!window.electronAPI) return
    const payload: CreateRubricaPayload = {
      empresa_id:    empresaIdNum,
      codigo:        rubrica.codigo + '_CP',
      nome:          rubrica.nome + ' (Cópia)',
      tipo:          rubrica.tipo,
      modo_valor:    rubrica.modo_valor,
      valor:         rubrica.valor,
      percentual:    rubrica.percentual,
      formula:       rubrica.formula,
      incide_inss:   rubrica.incide_inss,
      incide_irrf:   rubrica.incide_irrf,
      incide_fgts:   rubrica.incide_fgts,
      incide_ferias: rubrica.incide_ferias,
      incide_13:     rubrica.incide_13,
      ativo:         1,
    }
    const res = await window.electronAPI.createRubrica(payload)
    if (res.success) { setStatus('Rubrica duplicada.', 'success'); load() }
    else setStatus('Erro: ' + res.error, 'error')
  }, [empresaIdNum, load, setStatus])

  const colTemplate = COLUMNS.map((c) => typeof c.width === 'number' ? `${c.width}px` : c.width).join(' ')
  const selectedRubrica = typeof formMode === 'number' ? (rubricas.find((r) => r.id === formMode) ?? null) : null

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '0 6px',
          borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)' }}>
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as typeof filterTipo)}
            style={{ height: 20, fontSize: 11, border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', borderRadius: 0, padding: '0 4px' }}>
            <option value="all">Todos os Tipos</option>
            <option value="provento">Proventos</option>
            <option value="desconto">Descontos</option>
            <option value="informativo">Informativos</option>
          </select>
          <input placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ height: 20, fontSize: 11, border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', borderRadius: 0, padding: '0 6px', width: 160 }} />
          <div style={{ flex: 1 }} />
          {loading && <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Carregando…</span>}
          <button onClick={() => setShowVariaveis((v) => !v)}
            style={{ height: 20, padding: '0 8px', fontSize: 10, fontWeight: showVariaveis ? 700 : 400,
              border: '1px solid var(--color-border-main)', borderRadius: 0, cursor: 'pointer',
              background: showVariaveis ? 'var(--color-brand)' : 'var(--color-bg-white)',
              color: showVariaveis ? '#fff' : 'var(--color-text-secondary)' }}
            title="Dicionário de variáveis de fórmula">
            ƒ Variáveis
          </button>
        </div>

        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: colTemplate, flexShrink: 0,
          background: 'var(--color-bg-panel)', borderBottom: '2px solid var(--color-border-main)' }}>
          {COLUMNS.map((col) => (
            <div key={col.key} style={{ padding: '3px 6px', fontSize: 10, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-secondary)',
              textAlign: col.align ?? 'left', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.map((rubrica) => {
            const isSel    = rubrica.id === selectedId
            const isChk    = checkedIds.has(rubrica.id)
            const isGlobal = rubrica.empresa_id == null
            const isInativo = rubrica.ativo === 0
            const rowBg = isSel ? 'var(--color-bg-row-selected)'
              : isGlobal ? '#f5f5f5'
              : isInativo ? 'rgba(0,0,0,0.02)'
              : 'var(--color-bg-white)'

            return (
              <div key={rubrica.id}
                onClick={() => setSelectedId(rubrica.id === selectedId ? null : rubrica.id)}
                onDoubleClick={() => { if (!isGlobal) { setFormMode(rubrica.id); setFormError(null) } }}
                style={{ display: 'grid', gridTemplateColumns: colTemplate,
                  background: rowBg, borderBottom: '1px solid var(--color-border-main)',
                  cursor: 'pointer', opacity: isInativo ? 0.6 : 1 }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--color-brand)' }}>
                  {isSel ? '▶' : ''}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={(e) => { e.stopPropagation(); setCheckedIds((s) => { const n = new Set(s); n.has(rubrica.id) ? n.delete(rubrica.id) : n.add(rubrica.id); return n }) }}>
                  <input type="checkbox" readOnly checked={isChk} style={{ pointerEvents: 'none', width: 11, height: 11 }} />
                </div>

                {COLUMNS.slice(2).map((col) => (
                  <div key={col.key} style={{ padding: '3px 6px', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center',
                    justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
                    color: 'var(--color-text-primary)' }}>
                    {col.render ? col.render(rubrica) : String((rubrica as unknown as Record<string,unknown>)[col.key] ?? '')}
                    {col.key === 'nome' && isGlobal && (
                      <>
                        <span style={{ marginLeft: 6, fontSize: 9, padding: '1px 4px', background: '#e2e3e5', color: '#383d41', fontWeight: 700, flexShrink: 0 }}>GLOBAL</span>
                        <button onClick={(e) => { e.stopPropagation(); handleDuplicate(rubrica) }}
                          style={{ marginLeft: 8, fontSize: 10, padding: '0 6px', height: 16, border: '1px solid var(--color-border-main)',
                            background: 'var(--color-bg-white)', cursor: 'pointer', borderRadius: 0, flexShrink: 0 }}>
                          Duplicar
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
          {filtered.length === 0 && !loading && (
            <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
              Nenhuma rubrica encontrada.
            </div>
          )}
        </div>
      </div>

      {showVariaveis && (
        <div style={{ width: 340, flexShrink: 0, borderLeft: '1px solid var(--color-border-main)', display: 'flex', flexDirection: 'column' }}>
          <VariablesDictionaryPage onClose={() => setShowVariaveis(false)} />
        </div>
      )}

      {formMode !== null && (
        <div style={{ width: 440, flexShrink: 0, borderLeft: '1px solid var(--color-border-main)', display: 'flex', flexDirection: 'column' }}>
          <RubricaForm
            rubrica={selectedRubrica}
            empresaId={empresaIdNum}
            onSave={handleSave}
            onCancel={() => setFormMode(null)}
            saving={saving}
            error={formError}
          />
        </div>
      )}

      {confirmDel && (
        <ConfirmDialog
          title={confirmDel.title}
          message={confirmDel.message}
          confirmLabel={confirmDel.danger ? 'Excluir' : 'Desativar'}
          cancelLabel="Cancelar"
          danger={confirmDel.danger}
          onConfirm={doDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}
