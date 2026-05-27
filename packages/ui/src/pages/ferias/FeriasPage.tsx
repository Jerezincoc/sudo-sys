/**
 * FeriasPage.tsx
 * Grid de Férias estilo TOTVS RM — padrão pageActionRefs idêntico ao FuncionariosDaEmpresaPage.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { Ferias, Funcionario } from '@sudo-sys/shared'
import { usePageActionsStore } from '@/state/pageActionsSlice'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import FeriasForm from './FeriasForm'
import ConfirmDialog from '@/components/feedback/ConfirmDialog'

// ── Formatadores ─────────────────────────────────────────────────────────────

function fmtDate(v: string | null | undefined): string {
  if (!v) return '—'
  const [y, m, d] = v.split('-')
  if (!y || !m || !d) return v
  return `${d}/${m}/${y}`
}

function fmtPeriodo(ini: string, fim: string): string {
  return `${fmtDate(ini)} – ${fmtDate(fim)}`
}

function fmtCurrency(v: number | null | undefined): string {
  if (v == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

// ── StatusBadge ──────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { bg: string; color: string; border: string; label: string }> = {
  agendada:  { bg: '#f0f0f0', color: '#555',    border: '#ccc',    label: 'Agendada'  },
  aprovada:  { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', label: 'Aprovada'  },
  paga:      { bg: '#d4edda', color: '#155724', border: '#c3e6cb', label: 'Paga'      },
  cancelada: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb', label: 'Cancelada' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG['agendada']
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 6px',
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  )
}

// ── Tipos internos ────────────────────────────────────────────────────────────

type FormMode = 'new' | number | null
type FilterStatus = 'all' | 'agendada' | 'aprovada' | 'paga' | 'cancelada'

// ── Colunas ───────────────────────────────────────────────────────────────────

interface ColDef {
  key: string
  label: string
  width: number | string
  align?: 'left' | 'center' | 'right'
  render?: (row: Ferias, funcMap: Map<number, Funcionario>) => React.ReactNode
}

const COLUMNS: ColDef[] = [
  { key: '_arrow',                    label: '',                    width: 14,    align: 'center', render: () => null },
  { key: '_check',                    label: '',                    width: 20,    align: 'center', render: () => null },
  { key: 'funcionario',               label: 'Funcionário',         width: '1fr',
    render: (r, m) => m.get(r.funcionario_id)?.nome ?? `ID ${r.funcionario_id}` },
  { key: 'periodo_aquisitivo',        label: 'Período Aquisitivo',  width: 180,
    render: (r) => fmtPeriodo(r.periodo_aquisitivo_inicio, r.periodo_aquisitivo_fim) },
  { key: 'data_inicio_gozo',          label: 'Início Gozo',         width: 90,    align: 'center',
    render: (r) => fmtDate(r.data_inicio_gozo) },
  { key: 'data_fim_gozo',             label: 'Fim Gozo',            width: 90,    align: 'center',
    render: (r) => fmtDate(r.data_fim_gozo) },
  { key: 'dias_concedidos',           label: 'Dias',                width: 48,    align: 'center' },
  { key: 'valor_total',               label: 'Valor Total',         width: 110,   align: 'right',
    render: (r) => fmtCurrency(r.valor_total) },
  { key: 'status',                    label: 'Status',              width: 80,    align: 'center',
    render: (r) => <StatusBadge status={r.status} /> },
]

// ── FeriasPage ────────────────────────────────────────────────────────────────

export default function FeriasPage() {
  const { empresaId, empresaNome } = useSelectedEmpresaStore()
  const empresaIdNum = empresaId != null ? parseInt(empresaId, 10) : null

  const [ferias, setFerias] = useState<Ferias[]>([])
  const [funcMap, setFuncMap] = useState<Map<number, Funcionario>>(new Map())
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

  const [confirmAction, setConfirmAction] = useState<{
    ids: number[]
    title: string
    message: string
    confirmLabel: string
    danger: boolean
  } | null>(null)

  const handleDeleteRef = useRef<() => void>(() => {})
  const loadRef         = useRef<() => Promise<void>>(async () => {})

  const setActions   = usePageActionsStore((s) => s.setActions)
  const clearActions = usePageActionsStore((s) => s.clearActions)
  const setStatus    = usePageActionsStore((s) => s.setStatus)

  // ── Carregar ──────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (empresaIdNum == null) { setFerias([]); setFuncMap(new Map()); return }
    setLoading(true)
    try {
      const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
      if (hasElectron) {
        const [list, funcs] = await Promise.all([
          window.electronAPI.listFerias(empresaIdNum),
          window.electronAPI.listFuncionarios(empresaIdNum),
        ])
        setFerias(list)
        setFuncMap(new Map(funcs.map((f) => [f.id, f])))
      } else {
        setFerias([])
        setFuncMap(new Map())
      }
    } catch (err) {
      setStatus('Erro ao carregar férias: ' + String(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [empresaIdNum, setStatus])

  useEffect(() => { loadRef.current = load }, [load])
  useEffect(() => { load() }, [load])

  useEffect(() => {
    setSelectedId(null)
    setCheckedIds(new Set())
    setFormMode(null)
  }, [empresaIdNum])

  // ── getTargetIds ──────────────────────────────────────────────────
  const getTargetIds = useCallback((): number[] | null => {
    if (checkedIds.size > 0) return Array.from(checkedIds)
    if (selectedId != null)  return [selectedId]
    setStatus('Selecione ao menos um registro para continuar.', 'error')
    return null
  }, [checkedIds, selectedId, setStatus])

  // ── Filtro ────────────────────────────────────────────────────────
  const filtered = ferias.filter((f) => {
    if (filterStatus !== 'all' && f.status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      const nomeFunc = funcMap.get(f.funcionario_id)?.nome ?? ''
      return nomeFunc.toLowerCase().includes(q)
    }
    return true
  })

  const selectedIdx = filtered.findIndex((f) => f.id === selectedId)

  // ── handleDelete ──────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    const ids = getTargetIds()
    if (!ids) return

    const targets = ids
      .map((id) => ferias.find((f) => f.id === id))
      .filter((f): f is Ferias => f !== undefined)

    const message = targets.length === 1
      ? `Deseja EXCLUIR PERMANENTEMENTE este registro de férias?\nEsta ação não pode ser desfeita.`
      : `Deseja EXCLUIR PERMANENTEMENTE ${targets.length} registro(s) de férias?\nEsta ação não pode ser desfeita.`

    setConfirmAction({
      ids,
      title: 'Excluir Férias',
      message,
      confirmLabel: 'Excluir',
      danger: true,
    })
  }, [getTargetIds, ferias])

  useEffect(() => { handleDeleteRef.current = handleDelete }, [handleDelete])

  // ── doDeleteAction ────────────────────────────────────────────────
  const doDeleteAction = useCallback(async () => {
    if (!confirmAction) return
    const { ids } = confirmAction
    setConfirmAction(null)

    const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
    let count = 0

    for (const id of ids) {
      if (hasElectron) {
        const r = await window.electronAPI.deleteFerias(id)
        if (r.success) count++
      } else {
        count++
      }
    }

    setStatus(`${count} registro(s) de férias excluído(s).`, 'success')
    setCheckedIds(new Set())
    setSelectedId(null)
    load()
  }, [confirmAction, load, setStatus])

  // ── setActions ────────────────────────────────────────────────────
  useEffect(() => {
    setActions({
      onNew:     () => { if (empresaIdNum != null) setFormMode('new') },
      onDelete:  () => handleDeleteRef.current(),
      onEdit:    () => { if (selectedId != null) setFormMode(selectedId) },
      onRefresh: () => loadRef.current(),
      total:   filtered.length,
      current: selectedId != null ? selectedIdx + 1 : 0,
    })
    return () => clearActions()
  }, [filtered.length, selectedId, selectedIdx, empresaIdNum, setActions, clearActions])

  // ── Checkbox ──────────────────────────────────────────────────────
  function toggleCheck(id: number, e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation()
    setCheckedIds((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })
  }

  function toggleAll(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckedIds(e.target.checked ? new Set(filtered.map((r) => r.id)) : new Set())
  }

  // ── Teclado ───────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (formMode !== null) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedId((prev) => {
          const idx = filtered.findIndex((r) => r.id === prev)
          return filtered[Math.min(idx + 1, filtered.length - 1)]?.id ?? prev
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedId((prev) => {
          const idx = filtered.findIndex((r) => r.id === prev)
          return filtered[Math.max(idx - 1, 0)]?.id ?? prev
        })
      } else if (e.key === 'Insert') {
        if (empresaIdNum != null) setFormMode('new')
      } else if (e.key === 'F2' && selectedId != null) {
        setFormMode(selectedId)
      } else if (e.key === 'F5') {
        load()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [filtered, selectedId, formMode, load, empresaIdNum])

  // ── Salvo ─────────────────────────────────────────────────────────
  function handleSaved(saved: Ferias) {
    setFormMode(null)
    setSelectedId(saved.id)
    load()
  }

  const editFerias = typeof formMode === 'number'
    ? ferias.find((f) => f.id === formMode) ?? null
    : null

  // ── Layout ────────────────────────────────────────────────────────
  const colTemplate = COLUMNS.map((c) =>
    typeof c.width === 'number' ? `${c.width}px` : c.width
  ).join(' ')

  // ── Guard ─────────────────────────────────────────────────────────
  if (empresaIdNum == null) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 8, background: 'var(--color-bg-app)',
      }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Nenhuma empresa selecionada.</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', opacity: 0.7 }}>
          Selecione uma empresa para ver as férias.
        </span>
      </div>
    )
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: 'var(--color-bg-app)',
    }}>

      {/* Cabeçalho empresa */}
      {empresaNome && (
        <div style={{
          height: 22, flexShrink: 0,
          background: 'var(--color-bg-ribbon)',
          borderBottom: '1px solid var(--color-border-main)',
          display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6,
          fontSize: 11, color: 'var(--color-text-secondary)',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--color-brand)' }}>Empresa:</span>
          <span>{empresaNome}</span>
        </div>
      )}

      {/* Search / Filter */}
      <div style={{
        height: 28, flexShrink: 0,
        background: 'var(--color-bg-panel)',
        borderBottom: '1px solid var(--color-border-main)',
        display: 'flex', alignItems: 'center', padding: '0 6px', gap: 6,
      }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginRight: 2 }}>
          Localizar:
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nome do funcionário..."
          style={{
            width: 200, height: 20, fontSize: 11, padding: '0 4px',
            border: '1px solid var(--color-border-main)',
            background: 'var(--color-bg-white)', color: 'var(--color-text-primary)',
            outline: 'none', borderRadius: 0,
          }}
        />
        <div style={{ width: 1, height: 16, background: 'var(--color-border-main)' }} />
        <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Status:</span>
        {(['all', 'agendada', 'aprovada', 'paga', 'cancelada'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              height: 20, padding: '0 8px', fontSize: 11, borderRadius: 0,
              border: '1px solid var(--color-border-main)',
              background: filterStatus === s ? 'var(--color-brand)' : 'var(--color-bg-white)',
              color: filterStatus === s ? '#fff' : 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            {s === 'all' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {loading && <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Carregando...</span>}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: colTemplate,
          height: 22, flexShrink: 0,
          background: 'var(--color-bg-panel)',
          borderBottom: '2px solid var(--color-border-main)',
          alignItems: 'center',
        }}>
          <div />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <input
              type="checkbox"
              checked={filtered.length > 0 && checkedIds.size === filtered.length}
              onChange={toggleAll}
              style={{ width: 12, height: 12, cursor: 'pointer' }}
            />
          </div>
          {COLUMNS.slice(2).map((col) => (
            <div key={col.key} style={{
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.05em', color: 'var(--color-text-muted)',
              padding: '0 4px', textAlign: col.align ?? 'left',
              whiteSpace: 'nowrap', overflow: 'hidden', userSelect: 'none',
            }}>
              {col.label}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {filtered.length === 0 && !loading && (
            <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)' }}>
              {search
                ? 'Nenhuma férias encontrada para a pesquisa.'
                : 'Nenhuma férias cadastrada. Clique em + para incluir.'}
            </div>
          )}

          {filtered.map((row, idx) => {
            const isSelected = row.id === selectedId
            const isChecked  = checkedIds.has(row.id)
            const isEven     = idx % 2 === 0

            return (
              <div
                key={row.id}
                onClick={() => setSelectedId(row.id)}
                onDoubleClick={() => setFormMode(row.id)}
                style={{
                  display: 'grid', gridTemplateColumns: colTemplate,
                  height: 21, alignItems: 'center',
                  background: isSelected
                    ? 'var(--color-bg-row-selected)'
                    : isChecked
                      ? 'rgba(30,79,138,0.08)'
                      : isEven ? 'var(--color-bg-row-even)' : 'var(--color-bg-white)',
                  color: isSelected ? '#ffffff' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--color-border-light)',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-row-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = isChecked
                    ? 'rgba(30,79,138,0.08)'
                    : isEven ? 'var(--color-bg-row-even)' : 'var(--color-bg-white)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: isSelected ? '#fff' : 'transparent' }}>▶</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => toggleCheck(row.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 12, height: 12, cursor: 'pointer' }}
                  />
                </div>
                {COLUMNS.slice(2).map((col) => {
                  const content = col.render ? col.render(row, funcMap) : String((row as unknown as Record<string, unknown>)[col.key] ?? '')
                  return (
                    <div key={col.key} style={{
                      fontSize: 11, padding: '0 4px', textAlign: col.align ?? 'left',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {content}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Rodapé */}
      <div style={{
        height: 20, flexShrink: 0,
        background: 'var(--color-bg-panel)',
        borderTop: '1px solid var(--color-border-main)',
        display: 'flex', alignItems: 'center', padding: '0 6px',
        fontSize: 10, color: 'var(--color-text-muted)', gap: 12,
      }}>
        <span>{filtered.length} registro(s)</span>
        {checkedIds.size > 0 && <span>{checkedIds.size} selecionado(s)</span>}
        <div style={{ flex: 1 }} />
        <span style={{ opacity: 0.7 }}>Ins=Novo · F2=Editar · Del=Excluir · F5=Atualizar</span>
      </div>

      {/* ConfirmDialog */}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          danger={confirmAction.danger}
          onConfirm={doDeleteAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* FeriasForm */}
      {formMode !== null && (
        <FeriasForm
          ferias={formMode === 'new' ? null : editFerias}
          empresaId={empresaIdNum}
          funcMap={funcMap}
          onClose={() => setFormMode(null)}
          onSaved={handleSaved}
          setStatusMsg={(msg, type) => setStatus(msg, type)}
        />
      )}
    </div>
  )
}
