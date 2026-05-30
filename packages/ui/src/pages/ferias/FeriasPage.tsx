import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { Ferias, Funcionario, CreateFeriasPayload, UpdateFeriasPayload } from '@sudo-sys/shared'
import { usePageActionsStore } from '@/state/pageActionsSlice'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import FeriasForm from './FeriasForm'
import ConfirmDialog from '@/components/feedback/ConfirmDialog'

function StatusBadge({ status }: { status: string }) {
  const cfg =
    status === 'agendada'  ? { bg: '#e2e3e5', color: '#383d41', label: 'Agendada'  } :
    status === 'aprovada'  ? { bg: '#cce5ff', color: '#004085', label: 'Aprovada'  } :
    status === 'paga'      ? { bg: '#d4edda', color: '#155724', label: 'Paga'      } :
                             { bg: '#f8d7da', color: '#721c24', label: 'Cancelada' }
  return (
    <span style={{ display: 'inline-block', padding: '1px 6px', fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.04em', background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

function fmtDate(s: string) {
  if (!s) return '—'
  const [y, m, d] = s.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

function fmtBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

interface ColDef { key: string; label: string; width: number | string; align?: 'left'|'center'|'right'; render?: (r: Ferias, nomes: Map<number,string>) => React.ReactNode }

const COLUMNS: ColDef[] = [
  { key: '_arrow',    label: '',                   width: 14,    align: 'center', render: () => null },
  { key: '_check',    label: '',                   width: 20,    align: 'center', render: () => null },
  { key: 'func',      label: 'Funcionário',        width: '1fr', render: (r, nomes) => nomes.get(r.funcionario_id) ?? String(r.funcionario_id) },
  { key: 'periodo',   label: 'Período Aquisitivo', width: 160,   align: 'center', render: (r) => `${fmtDate(r.periodo_inicio)} — ${fmtDate(r.periodo_fim)}` },
  { key: 'ini_gozo',  label: 'Início Gozo',        width: 90,    align: 'center', render: (r) => fmtDate(r.inicio_gozo) },
  { key: 'fim_gozo',  label: 'Fim Gozo',           width: 90,    align: 'center', render: (r) => fmtDate(r.fim_gozo) },
  { key: 'dias',      label: 'Dias',               width: 44,    align: 'center', render: (r) => String(r.dias_concedidos) },
  { key: 'total',     label: 'Valor Total',        width: 110,   align: 'right',  render: (r) => fmtBRL(r.valor_total) },
  { key: 'status',    label: 'Status',             width: 90,    align: 'center', render: (r) => <StatusBadge status={r.status} /> },
]

type FormMode = 'new' | number | null

export default function FeriasPage() {
  const { empresaId } = useSelectedEmpresaStore()
  const empresaIdNum = empresaId != null ? parseInt(empresaId, 10) : null

  const [ferias, setFerias]         = useState<Ferias[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading]       = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [formMode, setFormMode]     = useState<FormMode>(null)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState<'all'|'agendada'|'aprovada'|'paga'|'cancelada'>('all')
  const [saving, setSaving]         = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<{ ids: number[]; message: string } | null>(null)

  const handleDeleteRef = useRef<() => void>(() => {})
  const loadRef         = useRef<() => Promise<void>>(async () => {})

  const setActions   = usePageActionsStore((s) => s.setActions)
  const clearActions = usePageActionsStore((s) => s.clearActions)
  const setStatus    = usePageActionsStore((s) => s.setStatus)

  const nomeMap = React.useMemo(() => {
    const m = new Map<number, string>()
    funcionarios.forEach((f) => m.set(f.id, `${f.codigo} — ${f.nome}`))
    return m
  }, [funcionarios])

  const load = useCallback(async () => {
    if (empresaIdNum == null) return
    setLoading(true)
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const [list, funcs] = await Promise.all([
          window.electronAPI.listFerias(empresaIdNum),
          window.electronAPI.listFuncionarios(empresaIdNum),
        ])
        setFerias(list)
        setFuncionarios(funcs)
      }
    } catch (err) {
      setStatus('Erro ao carregar férias: ' + String(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [empresaIdNum, setStatus])

  useEffect(() => { loadRef.current = load }, [load])
  useEffect(() => { load() }, [load])

  const filtered = ferias.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      const nome = nomeMap.get(r.funcionario_id) ?? ''
      return nome.toLowerCase().includes(q)
    }
    return true
  })

  const getTargetIds = useCallback((): number[] | null => {
    if (checkedIds.size > 0) return Array.from(checkedIds)
    if (selectedId != null)  return [selectedId]
    setStatus('Selecione ao menos um registro.', 'error')
    return null
  }, [checkedIds, selectedId, setStatus])

  const handleDelete = useCallback(() => {
    const ids = getTargetIds()
    if (!ids) return
    setConfirmDel({ ids, message: `Excluir ${ids.length} registro(s) de férias? Esta ação é permanente.` })
  }, [getTargetIds])

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
  }, [ferias.length, selectedId, filtered.length])

  const doDelete = useCallback(async () => {
    if (!confirmDel || !window.electronAPI) return
    let ok = 0
    for (const id of confirmDel.ids) {
      const res = await window.electronAPI.deleteFerias(id)
      if (res.success) ok++
    }
    setStatus(`${ok} registro(s) excluído(s).`, 'success')
    setConfirmDel(null)
    setCheckedIds(new Set())
    setSelectedId(null)
    load()
  }, [confirmDel, load, setStatus])

  const handleSave = useCallback(async (payload: CreateFeriasPayload | UpdateFeriasPayload) => {
    if (!window.electronAPI) return
    setSaving(true)
    setFormError(null)
    try {
      const res = 'id' in payload
        ? await window.electronAPI.updateFerias(payload as UpdateFeriasPayload)
        : await window.electronAPI.createFerias(payload as CreateFeriasPayload)
      if (!res.success) { setFormError(res.error ?? 'Erro ao salvar.'); return }
      setFormMode(null)
      setStatus('Férias salvas.', 'success')
      load()
    } finally {
      setSaving(false)
    }
  }, [load, setStatus])

  const colTemplate = COLUMNS.map((c) => typeof c.width === 'number' ? `${c.width}px` : c.width).join(' ')
  const selectedFerias = typeof formMode === 'number' ? (ferias.find((r) => r.id === formMode) ?? null) : null

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '0 6px',
          borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)' }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            style={{ height: 20, fontSize: 11, border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', borderRadius: 0, padding: '0 4px' }}>
            <option value="all">Todos os Status</option>
            <option value="agendada">Agendadas</option>
            <option value="aprovada">Aprovadas</option>
            <option value="paga">Pagas</option>
            <option value="cancelada">Canceladas</option>
          </select>
          <input placeholder="Buscar funcionário…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ height: 20, fontSize: 11, border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', borderRadius: 0, padding: '0 6px', width: 180 }} />
          <div style={{ flex: 1 }} />
          {loading && <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Carregando…</span>}
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
          {filtered.map((row) => {
            const isSel = row.id === selectedId
            const isChk = checkedIds.has(row.id)
            const rowBg = isSel ? 'var(--color-bg-row-selected)' : 'var(--color-bg-white)'

            return (
              <div key={row.id}
                onClick={() => setSelectedId(row.id === selectedId ? null : row.id)}
                onDoubleClick={() => { setFormMode(row.id); setFormError(null) }}
                style={{ display: 'grid', gridTemplateColumns: colTemplate,
                  background: rowBg, borderBottom: '1px solid var(--color-border-main)', cursor: 'pointer' }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--color-brand)' }}>
                  {isSel ? '▶' : ''}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={(e) => { e.stopPropagation(); setCheckedIds((s) => { const n = new Set(s); n.has(row.id) ? n.delete(row.id) : n.add(row.id); return n }) }}>
                  <input type="checkbox" readOnly checked={isChk} style={{ pointerEvents: 'none', width: 11, height: 11 }} />
                </div>

                {COLUMNS.slice(2).map((col) => (
                  <div key={col.key} style={{ padding: '3px 6px', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center',
                    justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
                    color: 'var(--color-text-primary)' }}>
                    {col.render ? col.render(row, nomeMap) : String((row as unknown as Record<string,unknown>)[col.key] ?? '')}
                  </div>
                ))}
              </div>
            )
          })}
          {filtered.length === 0 && !loading && (
            <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
              Nenhum registro de férias encontrado.
            </div>
          )}
        </div>
      </div>

      {formMode !== null && empresaIdNum != null && (
        <div style={{ width: 460, flexShrink: 0, borderLeft: '1px solid var(--color-border-main)', display: 'flex', flexDirection: 'column' }}>
          <FeriasForm
            ferias={selectedFerias}
            empresaId={empresaIdNum}
            funcionarios={funcionarios}
            onSave={handleSave}
            onCancel={() => setFormMode(null)}
            saving={saving}
            error={formError}
          />
        </div>
      )}

      {confirmDel && (
        <ConfirmDialog
          title="Excluir Férias"
          message={confirmDel.message}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          danger
          onConfirm={doDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}
