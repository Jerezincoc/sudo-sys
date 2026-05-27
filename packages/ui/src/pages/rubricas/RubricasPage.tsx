/**
 * RubricasPage.tsx
 * Grid de Rubricas estilo TOTVS RM.
 * Mostra rubricas globais (empresa_id = null) + as da empresa selecionada.
 * Dual-delete: ativo=1 → desativa, ativo=0 → exclui permanentemente.
 * Rubricas globais: somente leitura, não deletáveis.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { Rubrica } from '@sudo-sys/shared'
import { usePageActionsStore } from '@/state/pageActionsSlice'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import RubricaForm from './RubricaForm'
import ConfirmDialog from '@/components/feedback/ConfirmDialog'

// ── Badges ────────────────────────────────────────────────────────────────────

function TipoBadge({ tipo }: { tipo: string }) {
  const cfg =
    tipo === 'provento'    ? { bg: '#d4edda', color: '#155724', border: '#c3e6cb', label: 'Provento'    } :
    tipo === 'desconto'    ? { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb', label: 'Desconto'    } :
                             { bg: '#cce5ff', color: '#004085', border: '#b8daff', label: 'Informativo' }
  return (
    <span style={{
      display: 'inline-block', padding: '1px 6px', fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.04em',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  )
}

function StatusBadge({ ativo }: { ativo: number }) {
  return (
    <span style={{
      display: 'inline-block', padding: '1px 6px', fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.04em',
      background: ativo ? '#d4edda' : '#f8d7da',
      color: ativo ? '#155724' : '#721c24',
      border: `1px solid ${ativo ? '#c3e6cb' : '#f5c6cb'}`,
    }}>
      {ativo ? 'Ativa' : 'Inativa'}
    </span>
  )
}

function GlobalBadge() {
  return (
    <span style={{
      display: 'inline-block', padding: '1px 5px', fontSize: 9, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.04em',
      background: '#e2e8f0', color: '#4a5568', border: '1px solid #cbd5e0',
      marginLeft: 4,
    }}>
      GLOBAL
    </span>
  )
}

function fmtModo(r: Rubrica): string {
  if (r.modo_valor === 'fixo')       return r.valor_fixo != null ? `R$ ${r.valor_fixo.toFixed(2)}` : 'Fixo'
  if (r.modo_valor === 'percentual') return r.percentual  != null ? `${r.percentual}%`             : '%'
  if (r.modo_valor === 'formula')    return 'Fórmula'
  return '—'
}

// ── Colunas ───────────────────────────────────────────────────────────────────

interface ColDef {
  key: string; label: string; width: number | string
  render?: (row: Rubrica) => React.ReactNode; align?: 'left' | 'center' | 'right'
}

const COLUMNS: ColDef[] = [
  { key: '_arrow',     label: '',           width: 14,    align: 'center', render: () => null },
  { key: '_check',     label: '',           width: 20,    align: 'center', render: () => null },
  { key: 'codigo',     label: 'Código',     width: 80,    align: 'center',
    render: (r) => <><span>{r.codigo}</span>{r.empresa_id == null && <GlobalBadge />}</> },
  { key: 'nome',       label: 'Nome',       width: '1fr' },
  { key: 'tipo',       label: 'Tipo',       width: 105,   align: 'center',
    render: (r) => <TipoBadge tipo={r.tipo} /> },
  { key: 'modo_valor', label: 'Modo',       width: 90,    align: 'center',
    render: (r) => {
      const labels: Record<string, string> = { fixo: 'Fixo', percentual: '%', formula: 'Fórmula' }
      return labels[r.modo_valor ?? ''] ?? '—'
    }},
  { key: '_valor',     label: 'Valor / %',  width: 110,   align: 'right',
    render: (r) => fmtModo(r) },
  { key: 'incide_inss',label: 'INSS',       width: 46,    align: 'center',
    render: (r) => r.incide_inss ? '✔' : '—' },
  { key: 'incide_irrf',label: 'IRRF',       width: 46,    align: 'center',
    render: (r) => r.incide_irrf ? '✔' : '—' },
  { key: 'ativo',      label: 'Status',     width: 68,    align: 'center',
    render: (r) => <StatusBadge ativo={r.ativo} /> },
]

type FormMode = 'new' | number | null
type FilterTipo = 'all' | 'provento' | 'desconto' | 'informativo'
type FilterAtivo = 'all' | 'ativo' | 'inativo'

// ── RubricasPage ──────────────────────────────────────────────────────────────

export default function RubricasPage() {
  const { empresaId, empresaNome } = useSelectedEmpresaStore()
  const empresaIdNum = empresaId != null ? parseInt(empresaId, 10) : null

  const [rubricas, setRubricas]   = useState<Rubrica[]>([])
  const [loading, setLoading]     = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [formMode, setFormMode]   = useState<FormMode>(null)
  const [filterTipo, setFilterTipo] = useState<FilterTipo>('all')
  const [filterAtivo, setFilterAtivo] = useState<FilterAtivo>('ativo')
  const [search, setSearch]       = useState('')

  const [confirmAction, setConfirmAction] = useState<{
    ids: number[]; title: string; message: string; confirmLabel: string; danger: boolean
  } | null>(null)

  const handleDeleteRef = useRef<() => void>(() => {})
  const loadRef = useRef<() => Promise<void>>(async () => {})

  const setActions  = usePageActionsStore((s) => s.setActions)
  const clearActions = usePageActionsStore((s) => s.clearActions)
  const setStatus   = usePageActionsStore((s) => s.setStatus)

  // ── Carregar ──────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
      if (hasElectron) {
        // Passa empresaId para obter globais + da empresa
        const list = await window.electronAPI.listRubricas(empresaIdNum)
        setRubricas(list)
      } else {
        setRubricas([])
      }
    } catch (err) {
      setStatus('Erro ao carregar rubricas: ' + String(err), 'error')
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
  }, [empresaId])

  // ── Filtro ────────────────────────────────────────────────────────
  const filtered = rubricas.filter((r) => {
    if (filterTipo !== 'all' && r.tipo !== filterTipo) return false
    if (filterAtivo === 'ativo'   && r.ativo !== 1) return false
    if (filterAtivo === 'inativo' && r.ativo !== 0) return false
    if (search) {
      const q = search.toLowerCase()
      return r.codigo.includes(q) || r.nome.toLowerCase().includes(q)
    }
    return true
  })

  const selectedIdx = filtered.findIndex((r) => r.id === selectedId)

  // ── getTargetIds ──────────────────────────────────────────────────
  const getTargetIds = useCallback((): number[] | null => {
    if (checkedIds.size > 0) return Array.from(checkedIds)
    if (selectedId != null)  return [selectedId]
    setStatus('Selecione ao menos um registro para continuar.', 'error')
    return null
  }, [checkedIds, selectedId, setStatus])

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    const ids = getTargetIds()
    if (!ids) return

    // Filtrar globais — não deletáveis
    const targets = ids
      .map((id) => rubricas.find((r) => r.id === id))
      .filter((r): r is Rubrica => r !== undefined)

    const globais = targets.filter((r) => r.empresa_id == null)
    if (globais.length > 0) {
      setStatus(`Rubricas globais não podem ser excluídas: ${globais.map((r) => r.nome).join(', ')}.`, 'error')
      return
    }

    const ativas   = targets.filter((r) => r.ativo === 1)
    const inativas = targets.filter((r) => r.ativo === 0)

    let title: string, message: string, confirmLabel: string, danger: boolean

    if (inativas.length === 0) {
      title = 'Inativar Rubrica(s)'; confirmLabel = 'Inativar'; danger = false
      message = targets.length === 1
        ? `Deseja inativar a rubrica "${targets[0].nome}"?`
        : `Deseja inativar ${targets.length} rubrica(s)?`
    } else if (ativas.length === 0) {
      title = 'Excluir Permanentemente'; confirmLabel = 'Excluir'; danger = true
      message = targets.length === 1
        ? `A rubrica "${targets[0].nome}" já está inativa.\nDeseja EXCLUIR PERMANENTEMENTE?`
        : `${targets.length} rubrica(s) já inativas.\nDeseja EXCLUIR PERMANENTEMENTE?`
    } else {
      title = 'Ação Mista'; confirmLabel = 'Confirmar'; danger = true
      message =
        `Ativas (${ativas.length}) → serão inativadas.\n` +
        `Inativas (${inativas.length}) → serão excluídas permanentemente.\nContinuar?`
    }

    setConfirmAction({ ids, title, message, confirmLabel, danger })
  }, [getTargetIds, rubricas, setStatus])

  useEffect(() => { handleDeleteRef.current = handleDelete }, [handleDelete])

  const doDeleteAction = useCallback(async () => {
    if (!confirmAction) return
    const { ids } = confirmAction
    setConfirmAction(null)
    const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
    let countInativadas = 0, countExcluidas = 0

    for (const id of ids) {
      if (hasElectron) {
        const r = await window.electronAPI.deleteRubrica(id)
        if (r.success) {
          if ((r as { action?: string }).action === 'excluido') countExcluidas++
          else countInativadas++
        }
      } else {
        const rub = rubricas.find((r) => r.id === id)
        if (rub?.ativo === 0) countExcluidas++
        else countInativadas++
      }
    }

    const parts: string[] = []
    if (countInativadas > 0) parts.push(`${countInativadas} inativada(s)`)
    if (countExcluidas  > 0) parts.push(`${countExcluidas} excluída(s) permanentemente`)
    setStatus(parts.join(' · ') + '.', 'success')

    setCheckedIds(new Set())
    setSelectedId(null)
    load()
  }, [confirmAction, rubricas, load, setStatus])

  // ── Registro no store ─────────────────────────────────────────────
  useEffect(() => {
    setActions({
      onNew:     () => setFormMode('new'),
      onDelete:  () => handleDeleteRef.current(),
      onEdit:    () => { if (selectedId != null) setFormMode(selectedId) },
      onRefresh: () => loadRef.current(),
      total:   filtered.length,
      current: selectedId != null ? selectedIdx + 1 : 0,
    })
    return () => clearActions()
  }, [filtered.length, selectedId, selectedIdx, setActions, clearActions])

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
        setFormMode('new')
      } else if (e.key === 'F2' && selectedId != null) {
        setFormMode(selectedId)
      } else if (e.key === 'F5') {
        load()
      } else if (e.key === 'Delete') {
        handleDeleteRef.current()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [filtered, selectedId, formMode, load])

  // ── Salvo ─────────────────────────────────────────────────────────
  function handleSaved(saved: Rubrica) {
    setFormMode(null)
    setSelectedId(saved.id)
    load()
  }

  const editRubrica = typeof formMode === 'number'
    ? rubricas.find((r) => r.id === formMode) ?? null
    : null

  const colTemplate = COLUMNS.map((c) => {
    const w = c.width
    return typeof w === 'number' ? `${w}px` : w
  }).join(' ')

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', background: 'var(--color-bg-app)',
    }}>

      {/* Filter bar */}
      <div style={{
        height: 28, flexShrink: 0, background: 'var(--color-bg-panel)',
        borderBottom: '1px solid var(--color-border-main)',
        display: 'flex', alignItems: 'center', padding: '0 6px', gap: 6,
      }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginRight: 2 }}>
          Localizar:
        </span>
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Código, Nome..."
          style={{
            width: 200, height: 20, fontSize: 11, padding: '0 4px', borderRadius: 0,
            border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)',
            color: 'var(--color-text-primary)', outline: 'none',
          }}
        />
        <div style={{ width: 1, height: 16, background: 'var(--color-border-main)' }} />
        <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Tipo:</span>
        {(['all', 'provento', 'desconto', 'informativo'] as const).map((t) => (
          <button key={t} onClick={() => setFilterTipo(t)} style={{
            height: 20, padding: '0 7px', fontSize: 11, borderRadius: 0,
            border: '1px solid var(--color-border-main)',
            background: filterTipo === t ? 'var(--color-brand)' : 'var(--color-bg-white)',
            color: filterTipo === t ? '#fff' : 'var(--color-text-secondary)', cursor: 'pointer',
          }}>
            {t === 'all' ? 'Todos' : t === 'provento' ? 'Proventos' : t === 'desconto' ? 'Descontos' : 'Informativos'}
          </button>
        ))}
        <div style={{ width: 1, height: 16, background: 'var(--color-border-main)' }} />
        {(['all', 'ativo', 'inativo'] as const).map((a) => (
          <button key={a} onClick={() => setFilterAtivo(a)} style={{
            height: 20, padding: '0 7px', fontSize: 11, borderRadius: 0,
            border: '1px solid var(--color-border-main)',
            background: filterAtivo === a ? 'var(--color-brand)' : 'var(--color-bg-white)',
            color: filterAtivo === a ? '#fff' : 'var(--color-text-secondary)', cursor: 'pointer',
          }}>
            {a === 'all' ? 'Todos' : a === 'ativo' ? 'Ativas' : 'Inativas'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {empresaNome && (
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            {empresaNome}
          </span>
        )}
        {loading && <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Carregando...</span>}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: colTemplate,
          height: 22, flexShrink: 0,
          background: 'var(--color-bg-panel)',
          borderBottom: '2px solid var(--color-border-main)', alignItems: 'center',
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
              fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: 'var(--color-text-muted)', padding: '0 4px', textAlign: col.align ?? 'left',
              whiteSpace: 'nowrap', overflow: 'hidden', userSelect: 'none',
            }}>{col.label}</div>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {filtered.length === 0 && !loading && (
            <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)' }}>
              {search ? 'Nenhuma rubrica encontrada.' : 'Nenhuma rubrica disponível.'}
            </div>
          )}

          {filtered.map((rub, idx) => {
            const isSelected = rub.id === selectedId
            const isChecked  = checkedIds.has(rub.id)
            const isEven     = idx % 2 === 0
            const isGlobal   = rub.empresa_id == null

            return (
              <div
                key={rub.id}
                onClick={() => setSelectedId(rub.id)}
                onDoubleClick={() => setFormMode(rub.id)}
                style={{
                  display: 'grid', gridTemplateColumns: colTemplate,
                  height: 21, alignItems: 'center',
                  background: isSelected
                    ? 'var(--color-bg-row-selected)'
                    : isChecked
                      ? 'rgba(30,79,138,0.08)'
                      : isGlobal
                        ? (isEven ? '#f5f7fa' : '#eef1f5')
                        : isEven ? 'var(--color-bg-row-even)' : 'var(--color-bg-white)',
                  color: isSelected ? '#ffffff' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--color-border-light)',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-row-hover)' }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.background = isChecked
                      ? 'rgba(30,79,138,0.08)'
                      : isGlobal
                        ? (isEven ? '#f5f7fa' : '#eef1f5')
                        : isEven ? 'var(--color-bg-row-even)' : 'var(--color-bg-white)'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: isSelected ? '#fff' : 'transparent' }}>▶</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="checkbox" checked={isChecked}
                    onChange={(e) => toggleCheck(rub.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 12, height: 12, cursor: 'pointer' }}
                  />
                </div>
                {COLUMNS.slice(2).map((col) => {
                  const raw = (rub as unknown as Record<string, unknown>)[col.key]
                  const content = col.render ? col.render(rub) : (raw as string | null) ?? ''
                  return (
                    <div key={col.key} style={{
                      fontSize: 11, padding: '0 4px', textAlign: col.align ?? 'left',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{content}</div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        height: 20, flexShrink: 0, background: 'var(--color-bg-panel)',
        borderTop: '1px solid var(--color-border-main)',
        display: 'flex', alignItems: 'center', padding: '0 6px',
        fontSize: 10, color: 'var(--color-text-muted)', gap: 12,
      }}>
        <span>{filtered.length} rubrica(s)</span>
        {checkedIds.size > 0 && <span>{checkedIds.size} selecionada(s)</span>}
        <div style={{ flex: 1 }} />
        <span style={{ opacity: 0.7 }}>Ins=Nova · F2=Editar · Del=Excluir · F5=Atualizar</span>
      </div>

      {/* Confirm dialog */}
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

      {/* Modal form */}
      {formMode !== null && (
        <RubricaForm
          rubrica={formMode === 'new' ? null : editRubrica}
          empresaId={empresaIdNum}
          onClose={() => setFormMode(null)}
          onSaved={handleSaved}
          setStatusMsg={(msg, type) => setStatus(msg, type)}
        />
      )}
    </div>
  )
}
