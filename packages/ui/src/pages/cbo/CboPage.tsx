import React, { useState, useEffect, useRef, useCallback } from 'react'

interface CboItem { codigo: string; descricao: string }

const LEAF_LEN = 7

export default function CboPage() {
  const [tab, setTab] = useState<'navegar' | 'pesquisar'>('navegar')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-app)' }}>
      {/* ── Tab bar ─────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-border-main)',
        background: 'var(--color-bg-panel)',
        flexShrink: 0,
      }}>
        {(['navegar', 'pesquisar'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              height: 26,
              padding: '0 16px',
              border: 'none',
              borderRight: '1px solid var(--color-border-main)',
              borderBottom: tab === t ? '2px solid var(--color-brand)' : '2px solid transparent',
              background: tab === t ? 'var(--color-bg-white)' : 'transparent',
              color: tab === t ? 'var(--color-brand)' : 'var(--color-text-secondary)',
              fontSize: 12,
              fontWeight: tab === t ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {t === 'navegar' ? 'Navegar' : 'Pesquisar'}
          </button>
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'navegar' ? <NavPane /> : <SearchPane />}
      </div>
    </div>
  )
}

/* ── Navegação hierárquica ──────────────────────────────────────────── */
function NavPane() {
  // path[i] = selected codigo at level i
  const [path, setPath] = useState<string[]>([])
  // columns[i] = items at level i
  const [columns, setColumns] = useState<CboItem[][]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    window.electronAPI.cboListGrupos().then((items) => {
      setColumns([items])
      setLoading(false)
    })
  }, [])

  function handleSelect(level: number, item: CboItem) {
    const isLeaf = item.codigo.length === LEAF_LEN
    const newPath = [...path.slice(0, level), item.codigo]
    const newCols = columns.slice(0, level + 1)
    setPath(newPath)
    setColumns(newCols)

    if (!isLeaf) {
      setLoading(true)
      window.electronAPI.cboListSubgrupo(item.codigo).then((children) => {
        setColumns([...newCols, children])
        setLoading(false)
      })
    }
  }

  if (loading && columns.length === 0) {
    return <Spinner />
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {columns.map((items, level) => (
        <NavColumn
          key={level}
          items={items}
          selected={path[level]}
          onSelect={(item) => handleSelect(level, item)}
          isLast={level === columns.length - 1}
        />
      ))}
      {/* Detail pane when leaf selected */}
      {path.length > 0 && path[path.length - 1].length === LEAF_LEN && (
        <LeafDetail codigo={path[path.length - 1]} columns={columns} />
      )}
    </div>
  )
}

interface NavColumnProps {
  items: CboItem[]
  selected: string | undefined
  onSelect: (item: CboItem) => void
  isLast: boolean
}

function NavColumn({ items, selected, onSelect, isLast }: NavColumnProps) {
  const isLeafCol = items.length > 0 && items[0].codigo.length === LEAF_LEN

  return (
    <div style={{
      width: isLeafCol ? 280 : 120,
      minWidth: isLeafCol ? 280 : 120,
      borderRight: '1px solid var(--color-border-main)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: isLast ? 'var(--color-bg-white)' : 'var(--color-bg-panel)',
    }}>
      <div style={{
        height: 21,
        padding: '0 6px',
        display: 'flex',
        alignItems: 'center',
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--color-text-muted)',
        background: 'var(--color-bg-ribbon)',
        borderBottom: '1px solid var(--color-border-light)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        {isLeafCol ? 'Ocupação' : `Grupo (${items[0]?.codigo.length ?? 1} dígito${items[0]?.codigo.length !== 1 ? 's' : ''})`}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {items.map((item) => (
          <div
            key={item.codigo}
            onClick={() => onSelect(item)}
            style={{
              height: 21,
              padding: '0 8px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              fontSize: 12,
              background: selected === item.codigo ? 'var(--color-brand)' : 'transparent',
              color: selected === item.codigo ? '#fff' : 'var(--color-text-primary)',
              borderBottom: '1px solid var(--color-border-light)',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (selected !== item.codigo)
                (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-row-hover)'
            }}
            onMouseLeave={(e) => {
              if (selected !== item.codigo)
                (e.currentTarget as HTMLDivElement).style.background = ''
            }}
          >
            <span style={{ fontFamily: 'monospace', flexShrink: 0, opacity: 0.75 }}>
              {item.codigo}
            </span>
            {item.descricao && (
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.descricao}
              </span>
            )}
            {!isLeafCol && (
              <span style={{ marginLeft: 'auto', opacity: 0.4, fontSize: 10 }}>›</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface LeafDetailProps {
  codigo: string
  columns: CboItem[][]
}

function LeafDetail({ codigo, columns }: LeafDetailProps) {
  const lastCol = columns[columns.length - 1]
  const item = lastCol?.find((i) => i.codigo === codigo)

  return (
    <div style={{
      flex: 1,
      padding: '16px 20px',
      overflow: 'auto',
      background: 'var(--color-bg-app)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Código CBO
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-brand)', marginBottom: 8 }}>
        {codigo}
      </div>
      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Denominação
      </div>
      <div style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500 }}>
        {item?.descricao ?? '—'}
      </div>
    </div>
  )
}

/* ── Pesquisa ───────────────────────────────────────────────────────── */
function SearchPane() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<CboItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<CboItem | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((value: string) => {
    if (!value.trim()) { setResults([]); return }
    setLoading(true)
    window.electronAPI.cboSearch(value).then((items) => {
      setResults(items)
      setLoading(false)
    })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQ(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 300)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Input bar */}
      <div style={{
        padding: '6px 8px',
        background: 'var(--color-bg-panel)',
        borderBottom: '1px solid var(--color-border-main)',
        flexShrink: 0,
      }}>
        <input
          autoFocus
          type="text"
          value={q}
          onChange={handleChange}
          placeholder="Buscar por código ou descrição…"
          style={{
            width: '100%',
            height: 24,
            padding: '0 8px',
            border: '1px solid var(--color-border-main)',
            background: 'var(--color-bg-white)',
            color: 'var(--color-text-primary)',
            fontSize: 12,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Results + detail */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* List */}
        <div style={{
          width: 360,
          minWidth: 360,
          borderRight: '1px solid var(--color-border-main)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            height: 21,
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            background: 'var(--color-bg-ribbon)',
            borderBottom: '1px solid var(--color-border-light)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}>
            <span>Resultados</span>
            {results.length > 0 && (
              <span style={{ fontWeight: 400 }}>{results.length}</span>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && <Spinner />}
            {!loading && q && results.length === 0 && (
              <div style={{ padding: '12px 8px', fontSize: 12, color: 'var(--color-text-muted)' }}>
                Nenhum resultado.
              </div>
            )}
            {!loading && !q && (
              <div style={{ padding: '12px 8px', fontSize: 12, color: 'var(--color-text-muted)' }}>
                Digite para buscar.
              </div>
            )}
            {results.map((item) => (
              <div
                key={item.codigo}
                onClick={() => setSelected(item)}
                style={{
                  height: 21,
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  fontSize: 12,
                  background: selected?.codigo === item.codigo ? 'var(--color-brand)' : 'transparent',
                  color: selected?.codigo === item.codigo ? '#fff' : 'var(--color-text-primary)',
                  borderBottom: '1px solid var(--color-border-light)',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (selected?.codigo !== item.codigo)
                    (e.currentTarget as HTMLDivElement).style.background = 'var(--color-bg-row-hover)'
                }}
                onMouseLeave={(e) => {
                  if (selected?.codigo !== item.codigo)
                    (e.currentTarget as HTMLDivElement).style.background = ''
                }}
              >
                <span style={{ fontFamily: 'monospace', flexShrink: 0, opacity: 0.75, fontSize: 11 }}>
                  {item.codigo}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.descricao}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div style={{ flex: 1, padding: '16px 20px', overflow: 'auto', background: 'var(--color-bg-app)' }}>
          {selected ? (
            <>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Código CBO
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-brand)', marginBottom: 8 }}>
                {selected.codigo}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Denominação
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500 }}>
                {selected.descricao}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              Selecione um item para ver os detalhes.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div style={{ padding: '12px 8px', fontSize: 12, color: 'var(--color-text-muted)' }}>
      Carregando…
    </div>
  )
}
