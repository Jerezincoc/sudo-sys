import React, { useEffect, useState, useCallback } from 'react'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import type {
  RelatorioPersonalizado,
  CampoSintetico,
  RelatorioLinhaFuncionario,
  ModoRelatorio,
} from '@sudo-sys/shared'
import { CAMPOS_DISPONIVEIS, CATEGORIAS_CAMPOS } from '@sudo-sys/shared'

type SubAba = 'configurar' | 'executar' | 'preview'

const BADGE: Record<ModoRelatorio, { label: string; color: string }> = {
  sintetico: { label: 'Sintético', color: '#1e4f8a' },
  analitico: { label: 'Analítico', color: '#7c3aed' },
}

const NIVEIS = ['1', '1.1', '1.2', '1.3', '2']

const PREDEF: RelatorioPersonalizado[] = [
  { id: -1, nome: 'Funcionários Ativos', descricao: 'Cadastro completo', modo: 'sintetico', campos: [
    { id: 'trabalhador.matricula', label: 'Matrícula', nivel: '1', tipo: 'texto' },
    { id: 'trabalhador.nome',      label: 'Nome',      nivel: '1', tipo: 'texto' },
    { id: 'trabalhador.cargo',     label: 'Cargo',     nivel: '1', tipo: 'texto' },
    { id: 'trabalhador.admissao',  label: 'Admissão',  nivel: '1', tipo: 'data'  },
    { id: 'trabalhador.salario_base', label: 'Salário', nivel: '1', tipo: 'valor' },
  ], created_at: '', updated_at: '' },
  { id: -2, nome: 'Folha por Competência', descricao: 'Proventos / descontos / líquido', modo: 'sintetico', campos: [
    { id: 'trabalhador.nome',          label: 'Nome',       nivel: '1',   tipo: 'texto' },
    { id: 'competencia.periodo',       label: 'Competência',nivel: '1.1', tipo: 'texto' },
    { id: 'competencia.salario_bruto', label: 'Bruto',      nivel: '1.1', tipo: 'valor' },
    { id: 'competencia.inss',          label: 'INSS',       nivel: '1.1', tipo: 'valor' },
    { id: 'competencia.irrf',          label: 'IRRF',       nivel: '1.1', tipo: 'valor' },
    { id: 'competencia.liquido',       label: 'Líquido',    nivel: '1.1', tipo: 'valor' },
  ], created_at: '', updated_at: '' },
  { id: -3, nome: 'Férias Concedidas', descricao: 'Períodos e valores', modo: 'sintetico', campos: [
    { id: 'trabalhador.nome',          label: 'Nome',             nivel: '1',   tipo: 'texto' },
    { id: 'ferias.periodo_aquisitivo', label: 'Período Aquisit.', nivel: '1.2', tipo: 'texto' },
    { id: 'ferias.dias_concedidos',    label: 'Dias',             nivel: '1.2', tipo: 'texto' },
    { id: 'ferias.valor_total',        label: 'Valor',            nivel: '1.2', tipo: 'valor' },
  ], created_at: '', updated_at: '' },
]

function fmtVal(campo: CampoSintetico, val: unknown): string {
  if (campo.tipo === 'valor' && typeof val === 'number')
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return String(val ?? '')
}

export default function RelatoriosPage() {
  const { empresaId } = useSelectedEmpresaStore()

  const [relatorios, setRelatorios] = useState<RelatorioPersonalizado[]>([])
  const [selected, setSelected]     = useState<RelatorioPersonalizado | null>(null)
  const [subAba, setSubAba]         = useState<SubAba>('configurar')

  // form configurar
  const [nome, setNome]               = useState('')
  const [modo, setModo]               = useState<ModoRelatorio>('sintetico')
  const [cabecalho, setCabecalho]     = useState('')
  const [camposSel, setCamposSel]     = useState<CampoSintetico[]>([])
  const [templateAnalitico, setTemplateAnalitico] = useState('')
  const [formDirty, setFormDirty]     = useState(false)
  const [saving, setSaving]           = useState(false)

  // form executar
  const [filtroMatricula, setFiltroMatricula]       = useState('')
  const [compInicio, setCompInicio]                 = useState('')
  const [compFim, setCompFim]                       = useState('')
  const [executando, setExecutando]                 = useState(false)
  const [gerandoPdf, setGerandoPdf]                 = useState(false)

  // preview
  const [previewLinhas, setPreviewLinhas] = useState<RelatorioLinhaFuncionario[]>([])

  const empId = empresaId != null ? Number(empresaId) : undefined

  const loadList = useCallback(async () => {
    const res = await window.electronAPI.listRelatorios(empId)
    if (res.success) setRelatorios(res.data)
  }, [empId])

  useEffect(() => { loadList() }, [loadList])

  function selectRel(rel: RelatorioPersonalizado) {
    setSelected(rel)
    setNome(rel.nome)
    setModo(rel.modo)
    setCabecalho(rel.cabecalho ?? '')
    setCamposSel(rel.campos ?? [])
    setTemplateAnalitico(rel.modo === 'analitico' ? (rel.cabecalho ?? '') : '')
    setFormDirty(false)
    setPreviewLinhas([])
    setSubAba('configurar')
  }

  function novoRel() {
    const blank: RelatorioPersonalizado = {
      id: 0, nome: '', descricao: null, modo: 'sintetico',
      campos: [], cabecalho: null, empresa_id: empId ?? null,
      created_at: '', updated_at: '',
    }
    setSelected(blank)
    setNome('')
    setModo('sintetico')
    setCabecalho('')
    setCamposSel([])
    setTemplateAnalitico('')
    setFormDirty(false)
    setPreviewLinhas([])
    setSubAba('configurar')
  }

  function addCampo(campo: CampoSintetico, nivel: string) {
    if (camposSel.find(c => c.id === campo.id)) return
    setCamposSel(prev => [...prev, { ...campo, nivel }])
    setFormDirty(true)
  }

  function removeCampo(id: string) {
    setCamposSel(prev => prev.filter(c => c.id !== id))
    setFormDirty(true)
  }

  function moveCampo(idx: number, dir: -1 | 1) {
    const next = [...camposSel]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    setCamposSel(next)
    setFormDirty(true)
  }

  async function salvar() {
    if (!nome.trim()) return
    setSaving(true)
    const campos = modo === 'analitico' ? camposSel : camposSel
    const payload = {
      nome: nome.trim(),
      modo,
      campos,
      cabecalho: modo === 'analitico' ? templateAnalitico : (cabecalho || null),
      empresa_id: empId ?? null,
    }
    if (!selected || selected.id === 0) {
      const res = await window.electronAPI.createRelatorio(payload)
      if (res.success) { await loadList(); selectRel(res.data) }
      else alert('Erro: ' + res.error)
    } else if (selected.id > 0) {
      const res = await window.electronAPI.updateRelatorio({ id: selected.id, ...payload })
      if (res.success) { await loadList(); setFormDirty(false) }
      else alert('Erro: ' + res.error)
    }
    setSaving(false)
  }

  async function excluir() {
    if (!selected || selected.id <= 0) return
    if (!confirm(`Excluir "${selected.nome}"?`)) return
    const res = await window.electronAPI.deleteRelatorio(selected.id)
    if (res.success) { setSelected(null); await loadList() }
    else alert('Erro: ' + res.error)
  }

  async function visualizar() {
    if (!selected || !empId) return alert('Selecione uma empresa.')
    const id = selected.id > 0 ? selected.id : -1
    if (id < 0) {
      // pré-definido: usar campos diretamente
      const tempRel = selected
      setExecutando(true)
      const payload = {
        id: 0,
        empresa_id: empId!,
        matricula: filtroMatricula || undefined,
        competencia_inicio: compInicio || undefined,
        competencia_fim: compFim || undefined,
      }
      // Para pré-definidos, criar temporário e usar o executor inline
      const res = await window.electronAPI.executarRelatorio({ ...payload, id: tempRel.id })
      if (res.success) { setPreviewLinhas(res.data); setSubAba('preview') }
      else alert('Erro: ' + res.error)
      setExecutando(false)
      return
    }
    setExecutando(true)
    const res = await window.electronAPI.executarRelatorio({
      id,
      empresa_id: empId!,
      matricula: filtroMatricula || undefined,
      competencia_inicio: compInicio || undefined,
      competencia_fim: compFim || undefined,
    })
    setExecutando(false)
    if (res.success) { setPreviewLinhas(res.data); setSubAba('preview') }
    else alert('Erro: ' + res.error)
  }

  async function gerarPdf() {
    if (!selected || selected.id <= 0 || !empId) return alert('Salve o relatório antes de gerar PDF.')
    setGerandoPdf(true)
    const res = await window.electronAPI.gerarPdfRelatorio({
      id: selected.id,
      empresa_id: empId,
      matricula: filtroMatricula || undefined,
      competencia_inicio: compInicio || undefined,
      competencia_fim: compFim || undefined,
    })
    setGerandoPdf(false)
    if (res.success) {
      await window.electronAPI.openPath(res.data.filePath)
    } else {
      alert('Erro: ' + res.error)
    }
  }

  const nivel1Campos = camposSel.filter(c => c.nivel === '1')
  const tdStyle: React.CSSProperties = { padding: '2px 6px', borderBottom: '1px solid var(--color-border-main)', fontSize: 11 }
  const thStyle: React.CSSProperties = { padding: '3px 6px', background: 'var(--color-bg-panel)', fontSize: 10, fontWeight: 'bold', textAlign: 'left', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border-main)' }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 220, borderRight: '1px solid var(--color-border-main)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: '1px solid var(--color-border-main)' }}>
          <span style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--color-text-label)' }}>Relatórios</span>
          <button onClick={novoRel} style={{ fontSize: 10, padding: '2px 6px', cursor: 'default', background: 'var(--color-brand)', color: '#fff', border: 'none' }}>+ Novo</button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {relatorios.length > 0 && (
            <div style={{ padding: '6px 10px 2px', fontSize: 9, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Salvos</div>
          )}
          {relatorios.map(r => (
            <div
              key={r.id}
              onClick={() => selectRel(r)}
              style={{
                padding: '5px 10px', cursor: 'default', fontSize: 11,
                background: selected?.id === r.id ? 'var(--color-brand)' : 'transparent',
                color: selected?.id === r.id ? '#fff' : 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 21,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{r.nome}</span>
              <span style={{ fontSize: 9, padding: '1px 4px', marginLeft: 4, background: selected?.id === r.id ? 'rgba(255,255,255,0.25)' : BADGE[r.modo].color, color: '#fff', flexShrink: 0 }}>
                {BADGE[r.modo].label}
              </span>
            </div>
          ))}

          <div style={{ padding: '6px 10px 2px', fontSize: 9, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginTop: 4 }}>Pré-definidos</div>
          {PREDEF.map(r => (
            <div
              key={r.id}
              onClick={() => selectRel(r)}
              style={{
                padding: '5px 10px', cursor: 'default', fontSize: 11,
                background: selected?.id === r.id ? 'var(--color-brand)' : 'transparent',
                color: selected?.id === r.id ? '#fff' : 'inherit',
                height: 21, display: 'flex', alignItems: 'center',
              }}
            >
              {r.nome}
            </div>
          ))}
        </div>
      </div>

      {/* Área principal */}
      {!selected ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
          Selecione um relatório ou clique em "+ Novo"
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Sub-aba bar */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border-main)', padding: '0 12px', gap: 2 }}>
            {(['configurar', 'executar', 'preview'] as SubAba[]).map(tab => (
              <button
                key={tab}
                onClick={() => setSubAba(tab)}
                style={{
                  fontSize: 11, padding: '5px 10px', cursor: 'default', border: 'none',
                  borderBottom: subAba === tab ? '2px solid var(--color-brand)' : '2px solid transparent',
                  background: 'transparent', fontWeight: subAba === tab ? 'bold' : 'normal',
                  color: subAba === tab ? 'var(--color-brand)' : 'inherit',
                }}
              >
                {tab === 'configurar' ? 'Configurar' : tab === 'executar' ? 'Executar' : 'Preview'}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            {selected.id > 0 && (
              <button onClick={excluir} style={{ fontSize: 10, padding: '4px 8px', cursor: 'default', color: '#c0392b', background: 'transparent', border: 'none' }}>Excluir</button>
            )}
          </div>

          {/* Sub-aba Configurar */}
          {subAba === 'configurar' && (
            <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-label)', marginBottom: 2 }}>Nome *</div>
                  <input
                    value={nome}
                    onChange={e => { setNome(e.target.value); setFormDirty(true) }}
                    style={{ width: '100%', height: 24, fontSize: 11, padding: '0 6px', boxSizing: 'border-box', border: '1px solid var(--color-border-main)' }}
                    disabled={selected.id < 0}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-label)', marginBottom: 2 }}>Modo</div>
                  <div style={{ display: 'flex', border: '1px solid var(--color-border-main)', height: 24 }}>
                    {(['sintetico', 'analitico'] as ModoRelatorio[]).map(m => (
                      <button
                        key={m}
                        disabled={selected.id < 0}
                        onClick={() => { setModo(m); setFormDirty(true) }}
                        style={{
                          fontSize: 11, padding: '0 10px', cursor: 'default', border: 'none',
                          background: modo === m ? 'var(--color-brand)' : 'transparent',
                          color: modo === m ? '#fff' : 'inherit',
                        }}
                      >
                        {m === 'sintetico' ? 'Sintético' : 'Analítico'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {modo === 'sintetico' && (
                <div style={{ display: 'flex', gap: 10, height: 340 }}>
                  {/* Campos disponíveis */}
                  <div style={{ flex: 1, border: '1px solid var(--color-border-main)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '4px 8px', background: 'var(--color-bg-panel)', fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold', borderBottom: '1px solid var(--color-border-main)' }}>
                      Campos Disponíveis
                    </div>
                    <div style={{ overflow: 'auto', flex: 1 }}>
                      {CATEGORIAS_CAMPOS.map(cat => {
                        const campos = CAMPOS_DISPONIVEIS.filter(c => c.id.startsWith(cat.prefixo + '.'))
                        return (
                          <div key={cat.prefixo}>
                            <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--color-text-muted)', padding: '4px 8px 2px', background: 'var(--color-bg-panel)' }}>{cat.label}</div>
                            {campos.map(campo => {
                              const jaAdicionado = !!camposSel.find(c => c.id === campo.id)
                              return (
                                <div key={campo.id} style={{ display: 'flex', alignItems: 'center', height: 21, padding: '0 8px', fontSize: 11, color: jaAdicionado ? 'var(--color-text-muted)' : 'inherit', gap: 6 }}>
                                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{campo.label}</span>
                                  {!jaAdicionado && !selected.id.toString().startsWith('-') && (
                                    <select
                                      style={{ fontSize: 10, height: 18, cursor: 'default' }}
                                      defaultValue=""
                                      onChange={e => { if (e.target.value) { addCampo(campo, e.target.value); e.target.value = '' } }}
                                    >
                                      <option value="">Nível</option>
                                      {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Campos selecionados */}
                  <div style={{ flex: 1, border: '1px solid var(--color-border-main)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '4px 8px', background: 'var(--color-bg-panel)', fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold', borderBottom: '1px solid var(--color-border-main)' }}>
                      Campos Selecionados ({camposSel.length})
                    </div>
                    <div style={{ overflow: 'auto', flex: 1 }}>
                      {camposSel.length === 0 && (
                        <div style={{ padding: 12, fontSize: 11, color: 'var(--color-text-muted)' }}>Adicione campos da lista ao lado.</div>
                      )}
                      {camposSel.map((campo, idx) => (
                        <div key={campo.id} style={{ display: 'flex', alignItems: 'center', height: 21, padding: '0 4px 0 8px', fontSize: 11, gap: 4, borderBottom: '1px solid var(--color-border-main)' }}>
                          <span style={{ fontSize: 9, padding: '1px 4px', background: '#e8f0fe', color: '#1e4f8a', flexShrink: 0 }}>{campo.nivel}</span>
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{campo.label}</span>
                          {selected.id >= 0 && (
                            <>
                              <button onClick={() => moveCampo(idx, -1)} style={{ fontSize: 10, padding: '0 3px', cursor: 'default', background: 'transparent', border: 'none' }}>↑</button>
                              <button onClick={() => moveCampo(idx, 1)}  style={{ fontSize: 10, padding: '0 3px', cursor: 'default', background: 'transparent', border: 'none' }}>↓</button>
                              <button onClick={() => removeCampo(campo.id)} style={{ fontSize: 10, padding: '0 4px', cursor: 'default', color: '#c0392b', background: 'transparent', border: 'none' }}>×</button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {modo === 'analitico' && (
                <div style={{ display: 'flex', gap: 10, height: 340 }}>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-label)', marginBottom: 2 }}>Template (use {'{{campo.id}}'} para inserir valores)</div>
                    <textarea
                      value={templateAnalitico}
                      onChange={e => { setTemplateAnalitico(e.target.value); setFormDirty(true) }}
                      disabled={selected.id < 0}
                      style={{ flex: 1, resize: 'none', fontSize: 11, padding: 6, border: '1px solid var(--color-border-main)', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div style={{ flex: 1, border: '1px solid var(--color-border-main)', overflow: 'auto' }}>
                    <div style={{ padding: '4px 8px', background: 'var(--color-bg-panel)', fontSize: 10, textTransform: 'uppercase', fontWeight: 'bold', borderBottom: '1px solid var(--color-border-main)' }}>
                      Campos Disponíveis
                    </div>
                    {CAMPOS_DISPONIVEIS.map(campo => (
                      <div
                        key={campo.id}
                        onClick={() => {
                          if (selected.id < 0) return
                          setTemplateAnalitico(prev => prev + `{{${campo.id}}}`)
                          setFormDirty(true)
                        }}
                        style={{ height: 21, padding: '0 8px', fontSize: 10, display: 'flex', alignItems: 'center', cursor: selected.id < 0 ? 'default' : 'pointer', borderBottom: '1px solid var(--color-border-main)' }}
                        title={`Inserir {{${campo.id}}}`}
                      >
                        {campo.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selected || selected.id >= 0 ? (
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <button
                    onClick={salvar}
                    disabled={saving || !nome.trim()}
                    style={{ fontSize: 11, padding: '4px 12px', cursor: 'default', background: 'var(--color-brand)', color: '#fff', border: 'none', fontWeight: 'bold' }}
                  >
                    {saving ? 'Salvando...' : selected?.id === 0 ? 'Criar Relatório' : 'Salvar Alterações'}
                  </button>
                  {formDirty && <span style={{ fontSize: 10, color: 'var(--color-text-muted)', alignSelf: 'center' }}>Alterações não salvas</span>}
                </div>
              ) : (
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--color-text-muted)' }}>
                  Relatório pré-definido — não editável. Use como base ou crie uma cópia.
                </div>
              )}
            </div>
          )}

          {/* Sub-aba Executar */}
          {subAba === 'executar' && (
            <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, maxWidth: 560, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-label)', marginBottom: 2 }}>Matrícula (opcional)</div>
                  <input
                    value={filtroMatricula}
                    onChange={e => setFiltroMatricula(e.target.value)}
                    placeholder="Todos"
                    style={{ width: '100%', height: 24, fontSize: 11, padding: '0 6px', boxSizing: 'border-box', border: '1px solid var(--color-border-main)' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-label)', marginBottom: 2 }}>Competência Início</div>
                  <input
                    value={compInicio}
                    onChange={e => setCompInicio(e.target.value)}
                    placeholder="AAAA-MM"
                    style={{ width: '100%', height: 24, fontSize: 11, padding: '0 6px', boxSizing: 'border-box', border: '1px solid var(--color-border-main)' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--color-text-label)', marginBottom: 2 }}>Competência Fim</div>
                  <input
                    value={compFim}
                    onChange={e => setCompFim(e.target.value)}
                    placeholder="AAAA-MM"
                    style={{ width: '100%', height: 24, fontSize: 11, padding: '0 6px', boxSizing: 'border-box', border: '1px solid var(--color-border-main)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={visualizar}
                  disabled={executando}
                  style={{ fontSize: 11, padding: '4px 12px', cursor: 'default', background: 'var(--color-bg-panel)', border: '1px solid var(--color-border-main)', fontWeight: 'bold' }}
                >
                  {executando ? 'Buscando...' : 'Visualizar'}
                </button>
                <button
                  onClick={gerarPdf}
                  disabled={gerandoPdf || !selected || selected.id <= 0}
                  style={{ fontSize: 11, padding: '4px 12px', cursor: 'default', background: 'var(--color-brand)', color: '#fff', border: 'none', fontWeight: 'bold' }}
                >
                  {gerandoPdf ? 'Gerando PDF...' : 'Gerar PDF'}
                </button>
                {selected.id <= 0 && <span style={{ fontSize: 10, color: 'var(--color-text-muted)', alignSelf: 'center' }}>Salve o relatório para gerar PDF.</span>}
              </div>
            </div>
          )}

          {/* Sub-aba Preview */}
          {subAba === 'preview' && (
            <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
              {previewLinhas.length === 0 ? (
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Nenhum dado. Use a aba "Executar" para visualizar.</div>
              ) : (
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11 }}>
                  <thead>
                    <tr>
                      {nivel1Campos.map(c => (
                        <th key={c.id} style={thStyle}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewLinhas.map((linha, li) => (
                      <React.Fragment key={li}>
                        <tr style={{ background: 'var(--color-bg-panel)' }}>
                          {nivel1Campos.map(c => (
                            <td key={c.id} style={{ ...tdStyle, fontWeight: 'bold' }}>
                              {fmtVal(c, linha.funcionario[c.id])}
                            </td>
                          ))}
                        </tr>
                        {linha.derivados.map((d, di) => {
                          const derivCols = (selected?.campos ?? []).filter(c => c.nivel === d.nivel)
                          if (derivCols.length === 0) return null
                          return (
                            <tr key={di} style={{ background: '#ffffff' }}>
                              <td colSpan={nivel1Campos.length} style={{ ...tdStyle, paddingLeft: 24, color: '#444' }}>
                                {derivCols.map(c => (
                                  <span key={c.id} style={{ marginRight: 16 }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{c.label}: </span>
                                    <strong>{fmtVal(c, d.dados[c.id])}</strong>
                                  </span>
                                ))}
                              </td>
                            </tr>
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
