/**
 * FuncionariosDaEmpresaPage.tsx
 * Grid de Funcionários estilo TOTVS RM — mesmo padrão de EmpresasPage.
 * Filtrado pela empresa ativa em useSelectedEmpresaStore.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { Funcionario, TipoAditivo } from '@sudo-sys/shared'
import { usePageActionsStore } from '@/state/pageActionsSlice'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import FuncionarioForm from './FuncionarioForm'
import ConfirmDialog from '@/components/feedback/ConfirmDialog'

// ── Formatadores ────────────────────────────────────────────────────────────

function fmtCPF(v: string): string {
  const d = v.replace(/\D/g, '')
  if (d.length !== 11) return v
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function fmtSalario(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(v: string | null | undefined): string {
  if (!v) return '—'
  // aceita YYYY-MM-DD
  const [y, m, d] = v.split('-')
  if (!y || !m || !d) return v
  return `${d}/${m}/${y}`
}

// ── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg =
    status === 'ativo'
      ? { bg: '#d4edda', color: '#155724', border: '#c3e6cb', label: 'Ativo' }
      : status === 'inativo'
        ? { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb', label: 'Inativo' }
        : { bg: '#fff3cd', color: '#856404', border: '#ffeeba', label: 'Demitido' }
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

// ── Colunas ─────────────────────────────────────────────────────────────────

interface ColDef {
  key: string
  label: string
  width: number | string
  render?: (row: Funcionario) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

const COLUMNS: ColDef[] = [
  { key: '_arrow',       label: '',              width: 14,    align: 'center', render: () => null },
  { key: '_check',       label: '',              width: 20,    align: 'center', render: () => null },
  { key: 'codigo',       label: 'Código',        width: 55,    align: 'center' },
  { key: 'nome',         label: 'Nome',          width: '1fr' },
  { key: 'cpf',          label: 'CPF',           width: 130,   align: 'center',
    render: (r) => fmtCPF(r.cpf) },
  { key: 'cargo',        label: 'Cargo',         width: 140 },
  { key: 'departamento', label: 'Departamento',  width: 130 },
  { key: 'data_admissao',label: 'Admissão',      width: 90,    align: 'center',
    render: (r) => fmtDate(r.data_admissao) },
  { key: 'salario_base', label: 'Salário Base',  width: 110,   align: 'right',
    render: (r) => fmtSalario(r.salario_base) },
  { key: 'status',       label: 'Status',        width: 72,    align: 'center',
    render: (r) => <StatusBadge status={r.status} /> },
]

// ── Tipos internos ───────────────────────────────────────────────────────────

type FormMode = 'new' | number | null
type FilterStatus = 'all' | 'ativo' | 'inativo' | 'demitido'

// ── FuncionariosPage ─────────────────────────────────────────────────────────

export default function FuncionariosDaEmpresaPage() {
  const { empresaId, empresaNome } = useSelectedEmpresaStore()
  const empresaIdNum = empresaId != null ? parseInt(empresaId, 10) : null

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [search, setSearch] = useState('')

  const [aditivoOpen, setAditivoOpen] = useState(false)
  const [aditivoTipo, setAditivoTipo] = useState<TipoAditivo>('salario')
  const [aditivoAnterior, setAditivoAnterior] = useState('')
  const [aditivoNovo, setAditivoNovo] = useState('')
  const [aditivoVigencia, setAditivoVigencia] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`
  })
  const [docLoading, setDocLoading] = useState(false)

  const [confirmAction, setConfirmAction] = useState<{
    ids: number[]
    title: string
    message: string
    confirmLabel: string
    danger: boolean
  } | null>(null)

  // ── Stable refs ───────────────────────────────────────────────────
  const handleDeleteRef = useRef<() => void>(() => {})
  const loadRef = useRef<() => Promise<void>>(async () => {})

  const setActions  = usePageActionsStore((s) => s.setActions)
  const clearActions = usePageActionsStore((s) => s.clearActions)
  const setStatus   = usePageActionsStore((s) => s.setStatus)

  // ── Carregar dados ────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (empresaIdNum == null) {
      setFuncionarios([])
      return
    }
    setLoading(true)
    try {
      const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
      if (hasElectron) {
        const list = await window.electronAPI.listFuncionarios(empresaIdNum)
        setFuncionarios(list)
      } else {
        setFuncionarios([])
      }
    } catch (err) {
      setStatus('Erro ao carregar funcionários: ' + String(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [empresaIdNum, setStatus])

  useEffect(() => { loadRef.current = load }, [load])
  useEffect(() => { load() }, [load])

  // ── Resetar seleção ao trocar de empresa ──────────────────────────
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
  const filtered = funcionarios.filter((f) => {
    if (filterStatus !== 'all' && f.status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        f.nome.toLowerCase().includes(q) ||
        f.cpf.includes(q) ||
        f.codigo.includes(q) ||
        (f.cargo  ?? '').toLowerCase().includes(q) ||
        (f.departamento ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const selectedIdx = filtered.findIndex((f) => f.id === selectedId)

  // ── handleDelete ──────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    const ids = getTargetIds()
    if (!ids) return

    const targets = ids
      .map((id) => funcionarios.find((f) => f.id === id))
      .filter((f): f is Funcionario => f !== undefined)

    const ativos   = targets.filter((f) => f.status === 'ativo')
    const inativos = targets.filter((f) => f.status !== 'ativo')

    let title: string, message: string, confirmLabel: string, danger: boolean

    if (inativos.length === 0) {
      title        = 'Inativar Funcionário(s)'
      confirmLabel = 'Inativar'
      danger       = false
      message = targets.length === 1
        ? `Deseja inativar "${targets[0].nome}"?\nEle(a) poderá ser reativado(a) posteriormente.`
        : `Deseja inativar ${targets.length} funcionário(s) selecionado(s)?\nPoderão ser reativados posteriormente.`
    } else if (ativos.length === 0) {
      title        = 'Excluir Permanentemente'
      confirmLabel = 'Excluir'
      danger       = true
      message = targets.length === 1
        ? `"${targets[0].nome}" já está ${targets[0].status}.\nDeseja EXCLUIR PERMANENTEMENTE? Esta ação não pode ser desfeita.`
        : `${targets.length} funcionário(s) selecionado(s) não estão ativos.\nDeseja EXCLUIR PERMANENTEMENTE? Esta ação não pode ser desfeita.`
    } else {
      title        = 'Ação Mista de Exclusão'
      confirmLabel = 'Confirmar'
      danger       = true
      const listaAtivos   = ativos.map((f)   => `"${f.nome}"`).join(', ')
      const listaInativos = inativos.map((f) => `"${f.nome}"`).join(', ')
      message =
        `Serão realizadas ações diferentes por registro:\n` +
        `• Inativados (${ativos.length}): ${listaAtivos}\n` +
        `• Excluídos permanentemente (${inativos.length}): ${listaInativos}\n\n` +
        `Deseja continuar?`
    }

    setConfirmAction({ ids, title, message, confirmLabel, danger })
  }, [getTargetIds, funcionarios])

  useEffect(() => { handleDeleteRef.current = handleDelete }, [handleDelete])

  // ── doDeleteAction ────────────────────────────────────────────────
  const doDeleteAction = useCallback(async () => {
    if (!confirmAction) return
    const { ids } = confirmAction
    setConfirmAction(null)

    const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
    let countInativados = 0
    let countExcluidos  = 0

    for (const id of ids) {
      if (hasElectron) {
        const r = await window.electronAPI.deleteFuncionario(id)
        if (r.success) {
          if ((r as { action?: string }).action === 'excluido') countExcluidos++
          else countInativados++
        }
      } else {
        const f = funcionarios.find((x) => x.id === id)
        if (f?.status !== 'ativo') countExcluidos++
        else countInativados++
      }
    }

    const parts: string[] = []
    if (countInativados > 0) parts.push(`${countInativados} inativado(s)`)
    if (countExcluidos  > 0) parts.push(`${countExcluidos} excluído(s) permanentemente`)
    setStatus(parts.join(' · ') + '.', 'success')

    setCheckedIds(new Set())
    setSelectedId(null)
    load()
  }, [confirmAction, funcionarios, load, setStatus])

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
  function handleSaved(saved: Funcionario) {
    setFormMode(null)
    setSelectedId(saved.id)
    load()
  }

  const editFuncionario = typeof formMode === 'number'
    ? funcionarios.find((f) => f.id === formMode) ?? null
    : null

  // ── Geração de documentos ──────────────────────────────────────────
  async function handleContrato() {
    if (selectedId == null || empresaIdNum == null) return
    setDocLoading(true)
    const r = await window.electronAPI.docContrato({ funcionarioId: selectedId, empresaId: empresaIdNum })
    setDocLoading(false)
    if (!r.success || !r.data) { setStatus('Erro ao gerar contrato: ' + (r.error ?? ''), 'error'); return }
    setStatus('Contrato CLT gerado.', 'success')
    window.electronAPI.openPath(r.data.filePath)
  }

  async function doGerarAditivo() {
    if (selectedId == null || empresaIdNum == null) return
    setDocLoading(true)
    const r = await window.electronAPI.docAditivo({
      funcionarioId: selectedId, empresaId: empresaIdNum,
      tipo: aditivoTipo, valorAnterior: aditivoAnterior,
      valorNovo: aditivoNovo, dataVigencia: aditivoVigencia,
    })
    setDocLoading(false)
    setAditivoOpen(false)
    if (!r.success || !r.data) { setStatus('Erro ao gerar aditivo: ' + (r.error ?? ''), 'error'); return }
    setStatus('Aditivo gerado.', 'success')
    window.electronAPI.openPath(r.data.filePath)
  }

  // ── Layout da tabela ──────────────────────────────────────────────
  const colTemplate = COLUMNS.map((c) => {
    const w = c.width
    return typeof w === 'number' ? `${w}px` : w
  }).join(' ')

  // ── Sem empresa selecionada ───────────────────────────────────────
  if (empresaIdNum == null) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 8,
        background: 'var(--color-bg-app)',
      }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          Nenhuma empresa selecionada.
        </span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', opacity: 0.7 }}>
          Selecione uma empresa para ver os funcionários.
        </span>
      </div>
    )
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--color-bg-app)',
    }}>

      {/* ── Cabeçalho da empresa ────────────────────────────────── */}
      {empresaNome && (
        <div style={{
          height: 22,
          flexShrink: 0,
          background: 'var(--color-bg-ribbon)',
          borderBottom: '1px solid var(--color-border-main)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: 6,
          fontSize: 11,
          color: 'var(--color-text-secondary)',
        }}>
          <span style={{ fontWeight: 600, color: 'var(--color-brand)' }}>Empresa:</span>
          <span>{empresaNome}</span>
        </div>
      )}

      {/* ── Search/Filter bar ────────────────────────────────────── */}
      <div style={{
        height: 28,
        flexShrink: 0,
        background: 'var(--color-bg-panel)',
        borderBottom: '1px solid var(--color-border-main)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        gap: 6,
      }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginRight: 2 }}>
          Localizar:
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nome, CPF, Código, Cargo..."
          style={{
            width: 220,
            height: 20,
            fontSize: 11,
            padding: '0 4px',
            border: '1px solid var(--color-border-main)',
            background: 'var(--color-bg-white)',
            color: 'var(--color-text-primary)',
            outline: 'none',
            borderRadius: 0,
          }}
        />
        <div style={{ width: 1, height: 16, background: 'var(--color-border-main)' }} />
        <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          Status:
        </span>
        {(['all', 'ativo', 'inativo', 'demitido'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              height: 20,
              padding: '0 8px',
              fontSize: 11,
              border: '1px solid var(--color-border-main)',
              background: filterStatus === s ? 'var(--color-brand)' : 'var(--color-bg-white)',
              color: filterStatus === s ? '#fff' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              borderRadius: 0,
            }}
          >
            {s === 'all' ? 'Todos' : s === 'ativo' ? 'Ativos' : s === 'inativo' ? 'Inativos' : 'Demitidos'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {loading && (
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Carregando...</span>
        )}
        {/* ── Botões de documentos ──── */}
        {selectedId != null && (
          <>
            <div style={{ width: 1, height: 16, background: 'var(--color-border-main)' }} />
            <button
              onClick={handleContrato}
              disabled={docLoading}
              title="Gerar Contrato CLT (PDF)"
              style={{
                height: 20, padding: '0 8px', fontSize: 11,
                border: '1px solid var(--color-border-main)',
                background: 'var(--color-bg-white)', color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              Contrato CLT
            </button>
            <button
              onClick={() => setAditivoOpen(true)}
              disabled={docLoading}
              title="Gerar Aditivo Contratual (PDF)"
              style={{
                height: 20, padding: '0 8px', fontSize: 11,
                border: '1px solid var(--color-border-main)',
                background: 'var(--color-bg-white)', color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              Aditivo ▾
            </button>
          </>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: colTemplate,
          height: 22,
          flexShrink: 0,
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
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-muted)',
              padding: '0 4px',
              textAlign: col.align ?? 'left',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              userSelect: 'none',
            }}>
              {col.label}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {filtered.length === 0 && !loading && (
            <div style={{
              padding: '32px 16px',
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--color-text-muted)',
            }}>
              {search
                ? 'Nenhum funcionário encontrado para a pesquisa.'
                : 'Nenhum funcionário cadastrado. Clique em + para incluir.'}
            </div>
          )}

          {filtered.map((func, idx) => {
            const isSelected = func.id === selectedId
            const isChecked  = checkedIds.has(func.id)
            const isEven     = idx % 2 === 0

            return (
              <div
                key={func.id}
                onClick={() => setSelectedId(func.id)}
                onDoubleClick={() => setFormMode(func.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: colTemplate,
                  height: 21,
                  alignItems: 'center',
                  background: isSelected
                    ? 'var(--color-bg-row-selected)'
                    : isChecked
                      ? 'rgba(30,79,138,0.08)'
                      : isEven
                        ? 'var(--color-bg-row-even)'
                        : 'var(--color-bg-white)',
                  color: isSelected ? '#ffffff' : 'var(--color-text-primary)',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--color-border-light)',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-row-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLDivElement).style.background = isChecked
                      ? 'rgba(30,79,138,0.08)'
                      : isEven ? 'var(--color-bg-row-even)' : 'var(--color-bg-white)'
                }}
              >
                {/* ▶ ativo indicator */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, color: isSelected ? '#fff' : 'transparent',
                }}>▶</div>

                {/* checkbox */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => toggleCheck(func.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 12, height: 12, cursor: 'pointer' }}
                  />
                </div>

                {/* data cols */}
                {COLUMNS.slice(2).map((col) => {
                  const raw = (func as unknown as Record<string, unknown>)[col.key]
                  const content = col.render ? col.render(func) : (raw as string | null) ?? ''
                  return (
                    <div key={col.key} style={{
                      fontSize: 11,
                      padding: '0 4px',
                      textAlign: col.align ?? 'left',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
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

      {/* ── Rodapé ───────────────────────────────────────────────── */}
      <div style={{
        height: 20,
        flexShrink: 0,
        background: 'var(--color-bg-panel)',
        borderTop: '1px solid var(--color-border-main)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        fontSize: 10,
        color: 'var(--color-text-muted)',
        gap: 12,
      }}>
        <span>{filtered.length} registro(s)</span>
        {checkedIds.size > 0 && (
          <span>{checkedIds.size} selecionado(s)</span>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ opacity: 0.7 }}>Ins=Novo · F2=Editar · Del=Excluir · F5=Atualizar</span>
      </div>

      {/* ── ConfirmDialog ─────────────────────────────────────────── */}
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

      {/* ── Aditivo Modal ────────────────────────────────────────── */}
      {aditivoOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            width: 420, background: 'var(--color-bg-white)',
            border: '1px solid var(--color-border-main)',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              height: 28, background: 'var(--color-brand)',
              display: 'flex', alignItems: 'center', padding: '0 10px',
              fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0,
            }}>
              Gerar Aditivo Contratual
            </div>
            {/* Body */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Tipo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Tipo de Alteração</span>
                <select
                  value={aditivoTipo}
                  onChange={(e) => setAditivoTipo(e.target.value as TipoAditivo)}
                  style={{ height: 24, padding: '0 6px', border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', color: 'var(--color-text-primary)', fontSize: 12, outline: 'none' }}
                >
                  <option value="salario">Alteração Salarial</option>
                  <option value="cargo">Alteração de Cargo</option>
                  <option value="jornada">Alteração de Jornada</option>
                </select>
              </div>
              {/* Valor Anterior */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {aditivoTipo === 'salario' ? 'Salário Anterior (R$)' : aditivoTipo === 'cargo' ? 'Cargo Anterior' : 'Horas Semanais Anteriores'}
                </span>
                <input
                  type="text" value={aditivoAnterior} onChange={(e) => setAditivoAnterior(e.target.value)}
                  style={{ height: 24, padding: '0 6px', border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', color: 'var(--color-text-primary)', fontSize: 12, outline: 'none' }}
                />
              </div>
              {/* Valor Novo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {aditivoTipo === 'salario' ? 'Novo Salário (R$)' : aditivoTipo === 'cargo' ? 'Novo Cargo' : 'Novas Horas Semanais'}
                </span>
                <input
                  type="text" value={aditivoNovo} onChange={(e) => setAditivoNovo(e.target.value)}
                  style={{ height: 24, padding: '0 6px', border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', color: 'var(--color-text-primary)', fontSize: 12, outline: 'none' }}
                />
              </div>
              {/* Data Vigência */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Data de Vigência</span>
                <input
                  type="date" value={aditivoVigencia} onChange={(e) => setAditivoVigencia(e.target.value)}
                  style={{ height: 24, padding: '0 6px', border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', color: 'var(--color-text-primary)', fontSize: 12, outline: 'none' }}
                />
              </div>
            </div>
            {/* Footer */}
            <div style={{
              height: 36, background: 'var(--color-bg-panel)', borderTop: '1px solid var(--color-border-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 10px', gap: 6, flexShrink: 0,
            }}>
              <button
                onClick={() => setAditivoOpen(false)}
                style={{ height: 24, padding: '0 12px', border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', color: 'var(--color-text-primary)', fontSize: 11, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={doGerarAditivo}
                disabled={!aditivoAnterior || !aditivoNovo || docLoading}
                style={{
                  height: 24, padding: '0 14px',
                  border: '1px solid var(--color-border-main)',
                  background: aditivoAnterior && aditivoNovo && !docLoading ? 'var(--color-brand)' : 'var(--color-bg-panel)',
                  color: aditivoAnterior && aditivoNovo && !docLoading ? '#fff' : 'var(--color-text-muted)',
                  fontSize: 11, cursor: aditivoAnterior && aditivoNovo ? 'pointer' : 'default',
                }}
              >
                {docLoading ? 'Gerando...' : 'Gerar PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FuncionarioForm ───────────────────────────────────────── */}
      {formMode !== null && (
        <FuncionarioForm
          funcionario={formMode === 'new' ? null : editFuncionario}
          empresaId={empresaIdNum}
          onClose={() => setFormMode(null)}
          onSaved={handleSaved}
          setStatusMsg={(msg, type) => setStatus(msg, type)}
        />
      )}
    </div>
  )
}
