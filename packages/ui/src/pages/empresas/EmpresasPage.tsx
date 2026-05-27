/**
 * EmpresasPage.tsx
 * Grid de Empresas estilo TOTVS RM — DataTable + painel de detalhes em modal.
 * Zero border-radius, zero shadow, inputs 24px, labels 11px uppercase.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { Empresa } from '@sudo-sys/shared'
import { usePageActionsStore } from '@/state/pageActionsSlice'
import EmpresaForm from './EmpresaForm'
import ConfirmDialog from '@/components/feedback/ConfirmDialog'

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

interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativa' | 'inativa'>('all')
  const [search, setSearch] = useState('')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importMenuOpen, setImportMenuOpen] = useState(false)
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // ── Dialog de confirmação de ação de exclusão ─────────────────────
  // Tipagem genérica: o diálogo é pré-configurado pelo handleDelete
  // com a mensagem e rótulo certos para o cenário (inativar / excluir / misto).
  const [confirmAction, setConfirmAction] = useState<{
    ids: number[]
    title: string
    message: string
    confirmLabel: string
    danger: boolean
  } | null>(null)

  // ── Refs estáveis ──────────────────────────────────────────────────
  // Permitem que setActions rode apenas quando filtered.length / selectedId
  // mudam, sem incluir os callbacks voláteis no deps array.
  const handleDeleteRef    = useRef<() => void>(() => {})
  const handleExportCsvRef = useRef<() => void>(() => {})
  const handleExportJsonRef= useRef<() => void>(() => {})
  const handleExportPdfRef = useRef<() => void>(() => {})
  const handlePrintRef     = useRef<() => void>(() => {})
  const handlePreviewRef   = useRef<() => void>(() => {})
  const loadRef = useRef<() => Promise<void>>(async () => {})

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

  useEffect(() => { loadRef.current = load }, [load])
  useEffect(() => { load() }, [load])

  // ── Resolução de alvos ────────────────────────────────────────
  /**
   * Retorna os ids alvo de qualquer operação (Excluir, Exportar, etc.):
   * 1. checkedIds (multiselect) — se houver algum marcado
   * 2. selectedId (linha ativa) — fallback de seleção única
   * 3. [] + mensagem de erro    — nada selecionado
   *
   * Função reutilizável por todos os handlers de ação.
   */
  const getTargetIds = useCallback((): number[] | null => {
    if (checkedIds.size > 0) return Array.from(checkedIds)
    if (selectedId != null)  return [selectedId]
    setStatus('Selecione ao menos um registro para continuar.', 'error')
    return null
  }, [checkedIds, selectedId, setStatus])

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

  /**
   * FASE 1 — Exclusão com lógica dupla.
   * Inspeciona o status de cada empresa selecionada e configura
   * o ConfirmDialog com a mensagem e o nível de perigo adequados:
   *
   * • Todas ATIVAS   → soft-delete (inativar)   — danger=false
   * • Todas INATIVAS → hard-delete permanente    — danger=true
   * • Mistas         → cada uma recebe a ação do backend — danger=true
   */
  const handleDelete = useCallback(() => {
    const ids = getTargetIds()
    if (!ids) return

    const targets = ids
      .map((id) => empresas.find((e) => e.id === id))
      .filter((e): e is Empresa => e !== undefined)

    const ativas   = targets.filter((e) => e.status === 'ativa')
    const inativas = targets.filter((e) => e.status === 'inativa')

    let title: string
    let message: string
    let confirmLabel: string
    let danger: boolean

    if (inativas.length === 0) {
      // ── Todas ativas → apenas inativar ─────────────────────────
      title        = 'Inativar Empresa(s)'
      confirmLabel = 'Inativar'
      danger       = false
      message = targets.length === 1
        ? `Deseja inativar a empresa "${targets[0].razao_social}"?\nEla poderá ser reativada posteriormente.`
        : `Deseja inativar ${targets.length} empresa(s) selecionada(s)?\nElas poderão ser reativadas posteriormente.`

    } else if (ativas.length === 0) {
      // ── Todas inativas → exclusão permanente ───────────────────
      title        = 'Excluir Permanentemente'
      confirmLabel = 'Excluir'
      danger       = true
      message = targets.length === 1
        ? `A empresa "${targets[0].razao_social}" já está inativa.\nDeseja EXCLUIR PERMANENTEMENTE? Esta ação não pode ser desfeita.`
        : `${targets.length} empresa(s) selecionada(s) já estão inativas.\nDeseja EXCLUIR PERMANENTEMENTE? Esta ação não pode ser desfeita.`

    } else {
      // ── Misto: ativas serão inativadas, inativas serão apagadas ─
      title        = 'Ação Mista de Exclusão'
      confirmLabel = 'Confirmar'
      danger       = true
      const listaAtivas   = ativas.map((e) => `"${e.razao_social}"`).join(', ')
      const listaInativas = inativas.map((e) => `"${e.razao_social}"`).join(', ')
      message =
        `Serão realizadas ações diferentes por registro:\n` +
        `• Inativadas (${ativas.length}): ${listaAtivas}\n` +
        `• Excluídas permanentemente (${inativas.length}): ${listaInativas}\n\n` +
        `Deseja continuar?`
    }

    setConfirmAction({ ids, title, message, confirmLabel, danger })
  }, [getTargetIds, empresas])

  useEffect(() => { handleDeleteRef.current = handleDelete }, [handleDelete])

  /**
   * FASE 2 — Executa a ação após confirmação.
   * O backend decide o que fazer (soft ou hard) com base no status atual.
   * Usa o campo `action` retornado para montar o feedback na status bar.
   */
  const doDeleteAction = useCallback(async () => {
    if (!confirmAction) return
    const { ids } = confirmAction
    setConfirmAction(null)

    const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
    let countInativadas = 0
    let countExcluidas  = 0

    for (const id of ids) {
      if (hasElectron) {
        const r = await window.electronAPI.deleteEmpresa(id)
        if (r.success) {
          if ((r as { action?: string }).action === 'excluida') countExcluidas++
          else countInativadas++
        }
      } else {
        // mock dev: simula com base no status local
        const emp = empresas.find((e) => e.id === id)
        if (emp?.status === 'inativa') countExcluidas++
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
  }, [confirmAction, empresas, load, setStatus])

  // ── Exportar ──────────────────────────────────────────────────
  /**
   * Chama o backend para gerar o arquivo (CSV / JSON / PDF),
   * exibe feedback na status bar e abre o explorador na pasta do arquivo.
   */
  const handleExport = useCallback(async (format: 'csv' | 'json' | 'pdf') => {
    const ids = getTargetIds()
    if (!ids) return

    setStatus(`Exportando ${ids.length} registro(s) como ${format.toUpperCase()}...`, 'info')

    const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
    if (!hasElectron) {
      // Mock dev browser
      console.log(`[EmpresasPage][DEV] Export ${format.toUpperCase()}:`, ids)
      setStatus(`[DEV] Export ${format.toUpperCase()} — ${ids.length} registro(s). (sem Electron)`, 'info')
      return
    }

    try {
      const result = await window.electronAPI.exportEmpresas({ ids, format })
      if (!result.success) {
        setStatus(`Erro ao exportar: ${result.error}`, 'error')
        return
      }
      setStatus(`${ids.length} empresa(s) exportada(s) para ${format.toUpperCase()}.`, 'success')
      // Abre o explorador do SO na pasta do arquivo gerado
      await window.electronAPI.openPath(result.data.filePath)
    } catch (err) {
      setStatus(`Erro ao exportar: ${String(err)}`, 'error')
    }
  }, [getTargetIds, setStatus])

  useEffect(() => { handleExportCsvRef.current  = () => handleExport('csv')  }, [handleExport])
  useEffect(() => { handleExportJsonRef.current = () => handleExport('json') }, [handleExport])
  useEffect(() => { handleExportPdfRef.current  = () => handleExport('pdf')  }, [handleExport])

  // ── Stubs: Imprimir / Preview ─────────────────────────────────
  const handlePrint = useCallback(() => {
    const ids = getTargetIds()
    if (!ids) return
    console.log('[EmpresasPage] Print:', ids)
    setStatus(`Preparando impressão de ${ids.length} registro(s)...`, 'info')
  }, [getTargetIds, setStatus])

  const handlePreview = useCallback(() => {
    const ids = getTargetIds()
    if (!ids) return
    console.log('[EmpresasPage] Preview:', ids)
    setStatus(`Abrindo preview de ${ids.length} registro(s)...`, 'info')
  }, [getTargetIds, setStatus])

  useEffect(() => { handlePrintRef.current   = handlePrint   }, [handlePrint])
  useEffect(() => { handlePreviewRef.current = handlePreview }, [handlePreview])

  // ── Importar CSV / JSON ────────────────────────────────────────
  const handleImport = useCallback(async (format: 'csv' | 'json') => {
    setImportMenuOpen(false)
    const hasElectron = typeof window !== 'undefined' && !!window.electronAPI
    if (!hasElectron) {
      setStatus('Importação disponível apenas no app desktop.', 'error')
      return
    }

    const filters = format === 'csv'
      ? [{ name: 'CSV – Valores Separados por Vírgula', extensions: ['csv'] }]
      : [{ name: 'JSON – JavaScript Object Notation', extensions: ['json'] }]

    const filePath = await window.electronAPI.openFileDialog({
      title: `Importar empresas (${format.toUpperCase()})`,
      filters,
    })

    if (!filePath) return

    setStatus('Importando...', 'info')
    const res = await window.electronAPI.importEmpresas({ filePath, format })

    if (!res.success) {
      setStatus(`Erro na importação: ${res.error}`, 'error')
      return
    }

    setStatus(
      `Importação concluída: ${res.imported} importada(s), ${res.skipped} ignorada(s), ${res.errors.length} erro(s).`,
      res.errors.length > 0 ? 'error' : 'success',
    )
    setImportResult({ imported: res.imported, skipped: res.skipped, errors: res.errors })
    load()
  }, [load, setStatus])

  // ── Registro no store global ───────────────────────────────────
  useEffect(() => {
    setActions({
      onNew:        () => setFormMode('new'),
      onDelete:     () => handleDeleteRef.current(),
      onEdit:       () => { if (selectedId != null) setFormMode(selectedId) },
      onRefresh:    () => loadRef.current(),
      onExportCsv:  () => handleExportCsvRef.current(),
      onExportJson: () => handleExportJsonRef.current(),
      onExportPdf:  () => handleExportPdfRef.current(),
      onPrint:      () => handlePrintRef.current(),
      onPreview:    () => handlePreviewRef.current(),
      total:   filtered.length,
      current: selectedId != null ? selectedIdx + 1 : 0,
    })
    return () => clearActions()
  }, [filtered.length, selectedId, selectedIdx, setActions, clearActions])

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

        {/* ── Botão Importar com dropdown CSV / JSON ── */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setImportMenuOpen((o) => !o)}
            title="Importar empresas (CSV ou JSON)"
            style={{
              height: 20,
              padding: '0 8px',
              fontSize: 11,
              border: '1px solid var(--color-border-main)',
              background: importMenuOpen ? 'var(--color-brand)' : 'var(--color-bg-white)',
              color: importMenuOpen ? '#fff' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            ↑ Importar ▾
          </button>

          {importMenuOpen && (
            <>
              {/* overlay para fechar ao clicar fora */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                onClick={() => setImportMenuOpen(false)}
              />
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                zIndex: 100,
                background: 'var(--color-bg-white)',
                border: '1px solid var(--color-border-main)',
                boxShadow: '2px 2px 6px rgba(0,0,0,0.15)',
                minWidth: 120,
              }}>
                {(['csv', 'json'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => handleImport(fmt)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '5px 12px',
                      textAlign: 'left',
                      fontSize: 11,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-row-hover)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

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

      {/* ── Dialog de confirmação de exclusão (soft ou hard) ────── */}
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

      {/* ── Modal do formulário ───────────────────────────────── */}
      {formMode !== null && (
        <EmpresaForm
          empresa={formMode === 'new' ? null : editEmpresa}
          onClose={() => setFormMode(null)}
          onSaved={handleSaved}
          setStatusMsg={(msg, type) => setStatus(msg, type)}
        />
      )}

      {/* ── Resultado da importação ───────────────────────────── */}
      {importResult !== null && (
        <ConfirmDialog
          title="Resultado da Importação"
          message={
            <div style={{ fontSize: 12 }}>
              <p style={{ margin: '0 0 8px' }}>
                <strong>Importação concluída:</strong>
              </p>
              <ul style={{ margin: '0 0 8px', paddingLeft: 18, lineHeight: 1.8 }}>
                <li>
                  <span style={{ color: '#155724', fontWeight: 600 }}>
                    {importResult.imported} empresa(s) importada(s)
                  </span>
                </li>
                <li>
                  {importResult.skipped} ignorada(s){' '}
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                    (CNPJ duplicado)
                  </span>
                </li>
                <li>
                  <span style={{ color: importResult.errors.length > 0 ? '#721c24' : 'inherit' }}>
                    {importResult.errors.length} erro(s)
                  </span>
                </li>
              </ul>
              {importResult.errors.length > 0 && (
                <div style={{
                  background: '#fff3f3',
                  border: '1px solid #f5c6cb',
                  padding: '6px 8px',
                  fontSize: 11,
                  maxHeight: 120,
                  overflowY: 'auto',
                  lineHeight: 1.5,
                }}>
                  {importResult.errors.map((e, i) => (
                    <div key={i} style={{ color: '#721c24' }}>{e}</div>
                  ))}
                </div>
              )}
            </div>
          }
          confirmLabel="Fechar"
          onConfirm={() => setImportResult(null)}
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
