/**
 * EmpresasPage.tsx
 * Grid de Empresas estilo TOTVS RM — DataTable + painel de detalhes em modal.
 * Zero border-radius, zero shadow, inputs 24px, labels 11px uppercase.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { Empresa } from '@sudo-sys/shared'
import { usePageActionsStore } from '@/state/pageActionsSlice'
import EmpresaForm from './EmpresaForm'

// ── Helpers de formatação ──────────────────────────────────────────────────

function fmtCNPJ(v: string): string {
  const d = v.replace(/\D/g, '')
  if (d.length !== 14) return v
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'ativa'
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 6px',
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      background: active ? '#d4edda' : '#f8d7da',
      color: active ? '#155724' : '#721c24',
      border: `1px solid ${active ? '#c3e6cb' : '#f5c6cb'}`,
    }}>
      {active ? 'Ativa' : 'Inativa'}
    </span>
  )
}

// ── Colunas ────────────────────────────────────────────────────────────────

interface ColDef {
  key: string
  label: string
  width: number | string
  render?: (row: Empresa) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

const COLUMNS: ColDef[] = [
  { key: '_arrow', label: '', width: 14, align: 'center',
    render: () => null },   // preenchido no render da linha
  { key: '_check', label: '', width: 20, align: 'center',
    render: () => null },   // preenchido no render da linha
  { key: 'codigo',       label: 'Código',       width: 55, align: 'center' },
  { key: 'razao_social', label: 'Razão Social',  width: '1fr' },
  { key: 'cnpj',        label: 'CNPJ',          width: 145,
    render: (r) => fmtCNPJ(r.cnpj) },
  { key: 'nome_fantasia',label: 'Nome Fantasia', width: 160 },
  { key: 'cnae_principal',label: 'CNAE',         width: 75, align: 'center' },
  { key: 'uf',           label: 'UF',            width: 36, align: 'center' },
  { key: 'status',       label: 'Status',        width: 68, align: 'center',
    render: (r) => <StatusBadge status={r.status} /> },
]

// ── EmpresasPage ───────────────────────────────────────────────────────────

type FormMode = 'new' | number | null   // null=fechado, 'new'=novo, number=editar id

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativa' | 'inativa'>('all')
  const [search, setSearch] = useState('')
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  const setActions = usePageActionsStore((s) => s.setActions)
  const clearActions = usePageActionsStore((s) => s.clearActions)
  const setStatus = usePageActionsStore((s) => s.setStatus)

  // ── Carregar dados ─────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
      if (hasElectron) {
        const list = await window.electronAPI.listEmpresas()
        setEmpresas(list)
      } else {
        // mock para dev browser
        setEmpresas(MOCK_EMPRESAS)
      }
    } catch (err) {
      setStatus('Erro ao carregar empresas: ' + String(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [setStatus])

  useEffect(() => { load() }, [load])

  // ── Filtro ─────────────────────────────────────────────────────
  const filtered = empresas.filter((e) => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        e.razao_social.toLowerCase().includes(q) ||
        e.cnpj.includes(q) ||
        e.codigo.includes(q) ||
        (e.nome_fantasia ?? '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const selectedIdx = filtered.findIndex((e) => e.id === selectedId)

  // ── Ações da toolbar ───────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    const ids = checkedIds.size > 0
      ? Array.from(checkedIds)
      : selectedId != null ? [selectedId] : []

    if (ids.length === 0) {
      setStatus('Selecione ao menos uma empresa para excluir.', 'error')
      return
    }

    const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
    let count = 0
    for (const id of ids) {
      if (hasElectron) {
        const r = await window.electronAPI.deleteEmpresa(id)
        if (r.success) count++
      } else {
        count++
      }
    }
    setStatus(`${count} empresa(s) inativada(s).`, 'success')
    setCheckedIds(new Set())
    setSelectedId(null)
    load()
  }, [checkedIds, selectedId, load, setStatus])

  useEffect(() => {
    setActions({
      onNew: () => setFormMode('new'),
      onDelete: handleDelete,
      onEdit: () => { if (selectedId != null) setFormMode(selectedId) },
      onRefresh: load,
      total: filtered.length,
      current: selectedId != null ? selectedIdx + 1 : 0,
    })
    return () => clearActions()
  }, [filtered.length, selectedId, selectedIdx, handleDelete, load, setActions, clearActions])

  // ── Checkbox ────────────────────────────────────────────────────
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

  // ── Navegação teclado ──────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (formMode !== null) return   // form aberto, não interceptar
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedId((prev) => {
          const idx = filtered.findIndex((r) => r.id === prev)
          const next = filtered[Math.min(idx + 1, filtered.length - 1)]
          return next?.id ?? prev
        })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedId((prev) => {
          const idx = filtered.findIndex((r) => r.id === prev)
          const next = filtered[Math.max(idx - 1, 0)]
          return next?.id ?? prev
        })
      } else if (e.key === 'Insert') {
        setFormMode('new')
      } else if (e.key === 'F2' && selectedId != null) {
        setFormMode(selectedId)
      } else if (e.key === 'F5') {
        load()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [filtered, selectedId, formMode, load])

  // ── Salvo ─────────────────────────────────────────────────────
  function handleSaved(saved: Empresa) {
    setFormMode(null)
    setSelectedId(saved.id)
    load()
  }

  // ── Empresa sendo editada ─────────────────────────────────────
  const editEmpresa = typeof formMode === 'number'
    ? empresas.find((e) => e.id === formMode) ?? null
    : null

  // ── Layout da tabela ──────────────────────────────────────────
  const colTemplate = COLUMNS.map((c) => {
    const w = c.width
    return typeof w === 'number' ? `${w}px` : w
  }).join(' ')

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--color-bg-app)',
    }}>

      {/* ── Search/Filter bar ─────────────────────────────────── */}
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
          placeholder="Código, Razão Social, CNPJ..."
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
        {(['all', 'ativa', 'inativa'] as const).map((s) => (
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
            {s === 'all' ? 'Todos' : s === 'ativa' ? 'Ativas' : 'Inativas'}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {loading && (
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Carregando...</span>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
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
          {/* arrow col */}
          <div />
          {/* checkbox all */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <input
              type="checkbox"
              checked={filtered.length > 0 && checkedIds.size === filtered.length}
              onChange={toggleAll}
              style={{ width: 12, height: 12, cursor: 'pointer' }}
            />
          </div>
          {/* data cols */}
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
                ? 'Nenhuma empresa encontrada para a pesquisa.'
                : 'Nenhuma empresa cadastrada. Clique em + para incluir.'}
            </div>
          )}

          {filtered.map((emp, idx) => {
            const isSelected = emp.id === selectedId
            const isChecked = checkedIds.has(emp.id)
            const isEven = idx % 2 === 0

            return (
              <div
                key={emp.id}
                ref={(el) => { if (el) rowRefs.current.set(emp.id, el) }}
                onClick={() => setSelectedId(emp.id)}
                onDoubleClick={() => setFormMode(emp.id)}
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
                  if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-row-hover)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.background = isChecked
                      ? 'rgba(30,79,138,0.08)'
                      : isEven ? 'var(--color-bg-row-even)' : 'var(--color-bg-white)'
                  }
                }}
              >
                {/* ▶ active indicator */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, color: isSelected ? '#fff' : 'transparent',
                }}>
                  ▶
                </div>

                {/* checkbox */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => toggleCheck(emp.id, e)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: 12, height: 12, cursor: 'pointer' }}
                  />
                </div>

                {/* data cols */}
                {COLUMNS.slice(2).map((col) => {
                  const raw = (emp as unknown as Record<string, unknown>)[col.key]
                  const content = col.render ? col.render(emp) : (raw as string | null) ?? ''
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

      {/* ── Rodapé da grid ────────────────────────────────────── */}
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

      {/* ── Modal do formulário ───────────────────────────────── */}
      {formMode !== null && (
        <EmpresaForm
          empresa={formMode === 'new' ? null : editEmpresa}
          onClose={() => setFormMode(null)}
          onSaved={handleSaved}
          setStatusMsg={(msg, type) => setStatus(msg, type)}
        />
      )}
    </div>
  )
}

// ── Mock data para dev browser (sem Electron) ──────────────────────────────
const MOCK_EMPRESAS: Empresa[] = [
  {
    id: 1, codigo: '0001',
    razao_social: 'ACME Tecnologia Ltda',
    nome_fantasia: 'ACME Tech',
    cnpj: '12345678000195',
    cnae_principal: '6201-5',
    uf: 'SP',
    status: 'ativa',
    created_at: '2024-01-01', updated_at: '2024-01-01',
  },
  {
    id: 2, codigo: '0002',
    razao_social: 'Beta Serviços de TI S/A',
    nome_fantasia: 'BetaIT',
    cnpj: '98765432000100',
    cnae_principal: '6202-3',
    uf: 'RJ',
    status: 'ativa',
    created_at: '2024-02-01', updated_at: '2024-02-01',
  },
  {
    id: 3, codigo: '0003',
    razao_social: 'Gamma Consultoria ME',
    nome_fantasia: 'Gamma',
    cnpj: '11222333000180',
    cnae_principal: '7020-4',
    uf: 'MG',
    status: 'inativa',
    created_at: '2024-03-01', updated_at: '2024-03-01',
  },
]
