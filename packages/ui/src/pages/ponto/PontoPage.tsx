import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { RegistroPonto, Funcionario, CreatePontoPayload, UpdatePontoPayload } from '@sudo-sys/shared'
import { usePageActionsStore } from '@/state/pageActionsSlice'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import BatidaForm from './BatidaForm'
import ConfirmDialog from '@/components/feedback/ConfirmDialog'

function StatusBadge({ tipo }: { tipo: string }) {
  const cfg =
    tipo === 'feriado'     ? { bg: '#cce5ff', color: '#004085', label: 'Feriado'     } :
    tipo === 'folga'       ? { bg: '#d4edda', color: '#155724', label: 'Folga'       } :
    tipo === 'afastamento' ? { bg: '#fde5cc', color: '#7a3500', label: 'Afastamento' } :
    tipo === 'falta'       ? { bg: '#f8d7da', color: '#721c24', label: 'Falta'       } :
                             { bg: 'transparent', color: 'var(--color-text-primary)', label: 'Normal' }
  if (tipo === 'normal') return <span style={{ fontSize: 11 }}>Normal</span>
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

function fmtH(h: number) {
  if (h === 0) return '—'
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

interface ColDef {
  key: string
  label: string
  width: number | string
  align?: 'left'|'center'|'right'
  render?: (r: RegistroPonto, nomes: Map<number,string>) => React.ReactNode
}

const COLUMNS: ColDef[] = [
  { key: '_arrow',      label: '',             width: 14,    align: 'center', render: () => null },
  { key: '_check',      label: '',             width: 20,    align: 'center', render: () => null },
  { key: 'data',        label: 'Data',         width: 84,    align: 'center', render: (r) => fmtDate(r.data) },
  { key: 'func',        label: 'Funcionário',  width: '1fr', render: (r, nomes) => nomes.get(r.funcionario_id) ?? String(r.funcionario_id) },
  { key: 'entrada',     label: 'Entrada',      width: 64,    align: 'center', render: (r) => r.entrada ?? '—' },
  { key: 'saida_alm',   label: 'S.Alm',        width: 54,    align: 'center', render: (r) => r.saida_almoco ?? '—' },
  { key: 'ret_alm',     label: 'R.Alm',        width: 54,    align: 'center', render: (r) => r.retorno_almoco ?? '—' },
  { key: 'saida',       label: 'Saída',        width: 64,    align: 'center', render: (r) => r.saida ?? '—' },
  { key: 'h_trab',      label: 'H.Trab',       width: 60,    align: 'center', render: (r) => fmtH(r.horas_trabalhadas) },
  { key: 'h_extra',     label: 'H.Extra',      width: 60,    align: 'center',
    render: (r) => {
      const e = r.horas_extras_50 + r.horas_extras_100
      return e > 0 ? <span style={{ color: '#155724', fontWeight: 600 }}>{fmtH(e)}</span> : '—'
    }
  },
  { key: 'h_falta',     label: 'H.Falta',      width: 60,    align: 'center',
    render: (r) => r.horas_falta > 0
      ? <span style={{ color: '#c0392b', fontWeight: 600 }}>{fmtH(r.horas_falta)}</span>
      : '—'
  },
  { key: 'tipo',        label: 'Status',       width: 90,    align: 'center', render: (r) => <StatusBadge tipo={r.tipo} /> },
]

type FormMode = 'new' | number | null
type Visao = 'empresa' | 'funcionario'

export default function PontoPage() {
  const { empresaId } = useSelectedEmpresaStore()
  const empresaIdNum = empresaId != null ? parseInt(empresaId, 10) : null

  const now = new Date()
  const [mes, setMes]               = useState(now.getMonth() + 1)
  const [ano, setAno]               = useState(now.getFullYear())
  const [visao, setVisao]           = useState<Visao>('empresa')
  const [filterFunc, setFilterFunc] = useState<number | undefined>(undefined)

  const [registros, setRegistros]   = useState<RegistroPonto[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading]       = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set())
  const [formMode, setFormMode]     = useState<FormMode>(null)
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
        const funcId = visao === 'funcionario' ? filterFunc : undefined
        const [list, funcs] = await Promise.all([
          window.electronAPI.listPonto(empresaIdNum, mes, ano, funcId),
          window.electronAPI.listFuncionarios(empresaIdNum),
        ])
        setRegistros(list)
        setFuncionarios(funcs)
      }
    } catch (err) {
      setStatus('Erro ao carregar ponto: ' + String(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [empresaIdNum, mes, ano, visao, filterFunc, setStatus])

  useEffect(() => { loadRef.current = load }, [load])
  useEffect(() => { load() }, [load])

  const getTargetIds = useCallback((): number[] | null => {
    if (checkedIds.size > 0) return Array.from(checkedIds)
    if (selectedId != null)  return [selectedId]
    setStatus('Selecione ao menos um registro.', 'error')
    return null
  }, [checkedIds, selectedId, setStatus])

  const handleDelete = useCallback(() => {
    const ids = getTargetIds()
    if (!ids) return
    setConfirmDel({ ids, message: `Excluir ${ids.length} registro(s) de ponto?` })
  }, [getTargetIds])

  useEffect(() => { handleDeleteRef.current = handleDelete }, [handleDelete])

  useEffect(() => {
    setActions({
      onNew:     () => { setFormMode('new'); setFormError(null) },
      onDelete:  () => handleDeleteRef.current(),
      onEdit:    () => { if (selectedId != null) { setFormMode(selectedId); setFormError(null) } },
      onRefresh: () => loadRef.current(),
      total: registros.length,
      current: selectedId != null ? registros.findIndex((r) => r.id === selectedId) + 1 : 0,
    })
    return clearActions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registros.length, selectedId])

  const doDelete = useCallback(async () => {
    if (!confirmDel || !window.electronAPI) return
    let ok = 0
    for (const id of confirmDel.ids) {
      const res = await window.electronAPI.deletePonto(id)
      if (res.success) ok++
    }
    setStatus(`${ok} registro(s) excluído(s).`, 'success')
    setConfirmDel(null)
    setCheckedIds(new Set())
    setSelectedId(null)
    load()
  }, [confirmDel, load, setStatus])

  const handleSave = useCallback(async (payload: CreatePontoPayload | UpdatePontoPayload) => {
    if (!window.electronAPI) return
    setSaving(true)
    setFormError(null)
    try {
      const res = 'id' in payload
        ? await window.electronAPI.updatePonto(payload as UpdatePontoPayload)
        : await window.electronAPI.createPonto(payload as CreatePontoPayload)
      if (!res.success) { setFormError(res.error ?? 'Erro ao salvar.'); return }
      setFormMode(null)
      setStatus('Registro salvo.', 'success')
      load()
    } finally {
      setSaving(false)
    }
  }, [load, setStatus])

  const colTemplate = COLUMNS.map((c) => typeof c.width === 'number' ? `${c.width}px` : c.width).join(' ')
  const selectedRegistro = typeof formMode === 'number' ? (registros.find((r) => r.id === formMode) ?? null) : null

  const anos = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '0 6px',
          borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)' }}>

          {/* Toggle visão */}
          <div style={{ display: 'flex', border: '1px solid var(--color-border-main)', height: 20 }}>
            {(['empresa','funcionario'] as Visao[]).map((v) => (
              <button key={v} onClick={() => setVisao(v)} style={{
                height: '100%', padding: '0 8px', fontSize: 10, border: 'none', cursor: 'pointer',
                fontWeight: visao === v ? 600 : 400, borderRadius: 0,
                background: visao === v ? 'var(--color-brand)' : 'var(--color-bg-white)',
                color: visao === v ? '#fff' : 'var(--color-text-secondary)',
              }}>
                {v === 'empresa' ? 'Empresa' : 'Funcionário'}
              </button>
            ))}
          </div>

          {/* Mês/Ano */}
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))}
            style={{ height: 20, fontSize: 11, border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', borderRadius: 0, padding: '0 4px' }}>
            {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))}
            style={{ height: 20, fontSize: 11, border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', borderRadius: 0, padding: '0 4px' }}>
            {anos.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Filtro funcionário */}
          {visao === 'funcionario' && (
            <select value={filterFunc ?? ''} onChange={(e) => setFilterFunc(e.target.value ? Number(e.target.value) : undefined)}
              style={{ height: 20, fontSize: 11, border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', borderRadius: 0, padding: '0 4px', minWidth: 180 }}>
              <option value="">— Todos os funcionários —</option>
              {funcionarios.map((f) => <option key={f.id} value={f.id}>{f.codigo} — {f.nome}</option>)}
            </select>
          )}

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
          {registros.map((row) => {
            const isSel = row.id === selectedId
            const isChk = checkedIds.has(row.id)
            const isFalta = row.tipo === 'falta' || row.horas_falta > 0
            const rowBg = isSel ? 'var(--color-bg-row-selected)'
              : isFalta ? 'rgba(248,215,218,0.3)'
              : 'var(--color-bg-white)'

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
          {registros.length === 0 && !loading && (
            <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
              Nenhum registro encontrado para {MESES[mes - 1]}/{ano}.
            </div>
          )}
        </div>
      </div>

      {formMode !== null && empresaIdNum != null && (
        <div style={{ width: 460, flexShrink: 0, borderLeft: '1px solid var(--color-border-main)', display: 'flex', flexDirection: 'column' }}>
          <BatidaForm
            registro={selectedRegistro}
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
          title="Excluir Registro(s)"
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
