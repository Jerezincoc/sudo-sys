import React, { useState, useEffect, useCallback, useRef } from 'react'
import type { FolhaCompetencia, FolhaLancamento, FolhaHolerite, Funcionario, Rubrica } from '@sudo-sys/shared'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import { usePageActionsStore } from '@/state/pageActionsSlice'
import CompetenciaPicker from './CompetenciaPicker'
import LancamentosEditor from './LancamentosEditor'
import FolhaPreviewPdf from './FolhaPreviewPdf'

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtCompetencia(s: string) {
  if (!s) return s
  const [y, m] = s.split('-')
  return `${MESES[parseInt(m, 10) - 1]}/${y}`
}

function StatusBadge({ status }: { status: string }) {
  const cfg =
    status === 'aberta'     ? { bg: '#cce5ff', color: '#004085', label: 'Aberta'     } :
    status === 'processada' ? { bg: '#fff3cd', color: '#856404', label: 'Processada' } :
    status === 'fechada'    ? { bg: '#d4edda', color: '#155724', label: 'Fechada'    } :
                              { bg: '#f8d7da', color: '#721c24', label: 'Cancelada'  }
  return (
    <span style={{ display: 'inline-block', padding: '1px 6px', fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.04em', background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  )
}

type SubAba = 'lancamentos' | 'holerites' | 'resumo'

export default function FolhaPage() {
  const { empresaId } = useSelectedEmpresaStore()
  const empresaIdNum = empresaId != null ? parseInt(empresaId, 10) : null

  const setActions   = usePageActionsStore((s) => s.setActions)
  const clearActions = usePageActionsStore((s) => s.clearActions)
  const setStatus    = usePageActionsStore((s) => s.setStatus)

  const [folhas, setFolhas]           = useState<FolhaCompetencia[]>([])
  const [selectedFolha, setSelectedFolha] = useState<FolhaCompetencia | null>(null)
  const [subAba, setSubAba]           = useState<SubAba>('lancamentos')
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [rubricas, setRubricas]       = useState<Rubrica[]>([])
  const [holerites, setHolerites]     = useState<FolhaHolerite[]>([])
  const [expandedHolerite, setExpandedHolerite] = useState<number | null>(null)
  const [holeriteDetalhe, setHoleriteDetalhe] = useState<Map<number, FolhaLancamento[]>>(new Map())

  const [loading, setLoading]         = useState(false)
  const [showNova, setShowNova]       = useState(false)
  const [obsEdit, setObsEdit]         = useState('')

  const loadRef = useRef<() => Promise<void>>(async () => {})

  const loadFolhas = useCallback(async () => {
    if (empresaIdNum == null || !window.electronAPI) return
    setLoading(true)
    try {
      const [fs, funcs, rubs] = await Promise.all([
        window.electronAPI.listFolhas(empresaIdNum),
        window.electronAPI.listFuncionarios(empresaIdNum),
        window.electronAPI.listRubricas(empresaIdNum),
      ])
      setFolhas(fs)
      setFuncionarios(funcs)
      setRubricas(rubs)
      if (selectedFolha) {
        const updated = fs.find((f) => f.id === selectedFolha.id)
        if (updated) setSelectedFolha(updated)
      }
    } finally {
      setLoading(false)
    }
  }, [empresaIdNum, selectedFolha])

  useEffect(() => { loadRef.current = loadFolhas }, [loadFolhas])
  useEffect(() => { loadFolhas() }, [empresaIdNum])

  useEffect(() => {
    setActions({ onRefresh: () => loadRef.current(), total: folhas.length, current: 0 })
    return clearActions
  }, [folhas.length])

  const loadHolerites = useCallback(async () => {
    if (!selectedFolha || !window.electronAPI) return
    const list = await window.electronAPI.listHolerites(selectedFolha.id)
    setHolerites(list)
  }, [selectedFolha])

  useEffect(() => {
    if (subAba === 'holerites') loadHolerites()
  }, [subAba, selectedFolha])

  function handleSelectFolha(f: FolhaCompetencia) {
    setSelectedFolha(f)
    setObsEdit(f.observacao ?? '')
    setSubAba('lancamentos')
    setExpandedHolerite(null)
  }

  async function handleNova(competencia: string) {
    if (!competencia || !empresaIdNum || !window.electronAPI) return
    const res = await window.electronAPI.createFolha({ empresa_id: empresaIdNum, competencia, status: 'aberta' })
    if (!res.success) { setStatus(res.error, 'error'); return }
    setShowNova(false)
    setStatus('Folha criada.', 'success')
    loadFolhas()
  }

  function handleFolhaCalculada(f: FolhaCompetencia) {
    setSelectedFolha(f)
    loadHolerites()
    loadFolhas()
  }

  async function handleFechar() {
    if (!selectedFolha || !window.electronAPI) return
    const res = await window.electronAPI.fecharFolha(selectedFolha.id)
    if (!res.success) { setStatus(res.error, 'error'); return }
    setStatus('Folha fechada.', 'success')
    setSelectedFolha(res.data)
    loadFolhas()
  }

  async function toggleHoleriteDetalhe(funcionarioId: number) {
    if (expandedHolerite === funcionarioId) {
      setExpandedHolerite(null)
      return
    }
    setExpandedHolerite(funcionarioId)
    if (!selectedFolha || !window.electronAPI) return
    const detalhe = await window.electronAPI.getHolerite(selectedFolha.id, funcionarioId)
    if (detalhe) {
      setHoleriteDetalhe((m) => new Map(m).set(funcionarioId, detalhe.lancamentos))
    }
  }

  async function handleSalvarObs() {
    if (!selectedFolha || !window.electronAPI) return
    const res = await window.electronAPI.updateFolha({ id: selectedFolha.id, observacao: obsEdit })
    if (res.success) { setSelectedFolha(res.data); setStatus('Observação salva.', 'success') }
  }

  const nomeMap = React.useMemo(() => {
    const m = new Map<number, string>()
    funcionarios.forEach((f) => m.set(f.id, `${f.codigo} — ${f.nome}`))
    return m
  }, [funcionarios])

  if (empresaIdNum == null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
        fontSize: 12, color: 'var(--color-text-muted)' }}>
        Selecione uma empresa para acessar a Folha de Pagamento.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ── Coluna esquerda ── */}
      <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--color-border-main)',
        display: 'flex', flexDirection: 'column', background: 'var(--color-bg-panel)' }}>

        <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--color-border-main)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Folhas de Pagamento
          </span>
          <button onClick={() => setShowNova(true)}
            style={{ height: 20, padding: '0 8px', fontSize: 10, fontWeight: 600, border: 'none',
              background: 'var(--color-brand)', color: '#fff', cursor: 'pointer', borderRadius: 0 }}>
            + Nova
          </button>
        </div>

        {showNova && (
          <CompetenciaPicker
            folhas={folhas}
            onCreate={handleNova}
            onCancel={() => setShowNova(false)}
          />
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: 12, fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Carregando…
            </div>
          )}
          {folhas.map((f) => {
            const isSel = selectedFolha?.id === f.id
            return (
              <div key={f.id} onClick={() => handleSelectFolha(f)}
                style={{ padding: '6px 8px', cursor: 'pointer', borderBottom: '1px solid var(--color-border-main)',
                  background: isSel ? 'var(--color-bg-row-selected)' : 'transparent',
                  color: isSel ? '#fff' : 'var(--color-text-primary)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
                  {fmtCompetencia(f.competencia)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <StatusBadge status={f.status} />
                  <span style={{ fontSize: 11, color: isSel ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                    R$ {fmtMoeda(f.total_liquido)}
                  </span>
                </div>
              </div>
            )
          })}
          {folhas.length === 0 && !loading && (
            <div style={{ padding: 16, fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>
              Nenhuma folha cadastrada.
            </div>
          )}
        </div>
      </div>

      {/* ── Coluna direita ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {!selectedFolha ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
            fontSize: 12, color: 'var(--color-text-muted)' }}>
            Selecione uma folha
          </div>
        ) : (
          <>
            {/* Sub-aba bar */}
            <div style={{ height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0,
              borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)', padding: '0 8px' }}>
              {(['lancamentos', 'holerites', 'resumo'] as SubAba[]).map((a) => (
                <button key={a} onClick={() => setSubAba(a)}
                  style={{ height: 22, padding: '0 12px', fontSize: 11, border: 'none', cursor: 'pointer', borderRadius: 0,
                    fontWeight: subAba === a ? 700 : 400,
                    background: subAba === a ? 'var(--color-bg-white)' : 'transparent',
                    color: subAba === a ? 'var(--color-brand)' : 'var(--color-text-secondary)',
                    borderBottom: subAba === a ? '2px solid var(--color-brand)' : '2px solid transparent' }}>
                  {a === 'lancamentos' ? 'Lançamentos' : a === 'holerites' ? 'Holerites' : 'Resumo'}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginRight: 8 }}>
                {fmtCompetencia(selectedFolha.competencia)}
              </span>
              <StatusBadge status={selectedFolha.status} />
            </div>

            {/* ── Sub-aba Lançamentos ── */}
            {subAba === 'lancamentos' && (
              <LancamentosEditor
                key={selectedFolha.id}
                folha={selectedFolha}
                funcionarios={funcionarios}
                rubricas={rubricas}
                onFolhaCalculada={handleFolhaCalculada}
                setStatus={setStatus}
              />
            )}

            {/* ── Sub-aba Holerites ── */}
            {subAba === 'holerites' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px',
                  borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)', gap: 8 }}>
                  <FolhaPreviewPdf
                    folhaId={selectedFolha.id}
                    disabled={holerites.length === 0}
                    setStatus={setStatus}
                  />
                  {selectedFolha.status === 'processada' && (
                    <button onClick={handleFechar}
                      style={{ height: 22, padding: '0 12px', fontSize: 11, fontWeight: 600, border: 'none',
                        background: '#155724', color: '#fff', cursor: 'pointer', borderRadius: 0 }}>
                      Fechar Folha
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 80px 80px 80px 90px 80px 28px',
                  flexShrink: 0, background: 'var(--color-bg-panel)', borderBottom: '2px solid var(--color-border-main)' }}>
                  {['Funcionário','Proventos','Descontos','INSS','IRRF','FGTS','Líquido','Status',''].map((h, i) => (
                    <div key={i} style={{ padding: '3px 6px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>{h}</div>
                  ))}
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {holerites.map((h) => (
                    <React.Fragment key={h.funcionario_id}>
                      <div onClick={() => toggleHoleriteDetalhe(h.funcionario_id)}
                        style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 80px 80px 80px 90px 80px 28px',
                          borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', cursor: 'pointer' }}>
                        <div style={{ padding: '3px 6px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 9, color: 'var(--color-brand)' }}>
                            {expandedHolerite === h.funcionario_id ? '▼' : '▶'}
                          </span>
                          {nomeMap.get(h.funcionario_id) ?? String(h.funcionario_id)}
                        </div>
                        <div style={{ padding: '3px 6px', fontSize: 11, textAlign: 'right', color: '#155724', fontWeight: 600 }}>{fmtMoeda(h.total_proventos)}</div>
                        <div style={{ padding: '3px 6px', fontSize: 11, textAlign: 'right', color: '#c0392b' }}>{fmtMoeda(h.total_descontos)}</div>
                        <div style={{ padding: '3px 6px', fontSize: 11, textAlign: 'right' }}>{fmtMoeda(h.valor_inss)}</div>
                        <div style={{ padding: '3px 6px', fontSize: 11, textAlign: 'right' }}>{fmtMoeda(h.valor_irrf)}</div>
                        <div style={{ padding: '3px 6px', fontSize: 11, textAlign: 'right' }}>{fmtMoeda(h.valor_fgts)}</div>
                        <div style={{ padding: '3px 6px', fontSize: 11, textAlign: 'right', fontWeight: 700 }}>{fmtMoeda(h.valor_liquido)}</div>
                        <div style={{ padding: '3px 6px', fontSize: 11 }}><StatusBadge status={h.status} /></div>
                        <div style={{ padding: '2px 3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={(e) => e.stopPropagation()}>
                          <FolhaPreviewPdf
                            folhaId={selectedFolha.id}
                            funcionarioId={h.funcionario_id}
                            variant="icon"
                            setStatus={setStatus}
                          />
                        </div>
                      </div>
                      {expandedHolerite === h.funcionario_id && (
                        <div style={{ background: 'var(--color-bg-panel)', borderBottom: '1px solid var(--color-border-main)', padding: '4px 16px' }}>
                          {(holeriteDetalhe.get(h.funcionario_id) ?? []).map((l) => (
                            <div key={l.id} style={{ display: 'flex', gap: 12, fontSize: 11, padding: '2px 0',
                              borderBottom: '1px solid var(--color-border-light)' }}>
                              <span style={{ minWidth: 50, color: 'var(--color-text-muted)' }}>{l.rubrica_codigo}</span>
                              <span style={{ flex: 1 }}>{l.rubrica_nome}</span>
                              <span style={{ color: l.rubrica_tipo === 'desconto' ? '#c0392b' : '#155724', fontWeight: 600 }}>
                                {l.rubrica_tipo === 'desconto' ? '−' : '+'} {fmtMoeda(l.valor)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                  {holerites.length === 0 && (
                    <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Nenhum holerite calculado. Use "Calcular Folha" na aba Lançamentos.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Sub-aba Resumo ── */}
            {subAba === 'resumo' && (
              <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { label: 'Funcionários', value: String(holerites.length || funcionarios.filter(f => f.status === 'ativo').length) },
                    { label: 'Total Proventos', value: 'R$ ' + fmtMoeda(selectedFolha.total_proventos) },
                    { label: 'Total Descontos', value: 'R$ ' + fmtMoeda(selectedFolha.total_descontos) },
                    { label: 'Total INSS', value: 'R$ ' + fmtMoeda(selectedFolha.total_inss) },
                    { label: 'Total FGTS', value: 'R$ ' + fmtMoeda(selectedFolha.total_fgts) },
                    { label: 'Total IRRF', value: 'R$ ' + fmtMoeda(selectedFolha.total_irrf) },
                    { label: 'Total Líquido', value: 'R$ ' + fmtMoeda(selectedFolha.total_liquido) },
                  ].map((card) => (
                    <div key={card.label} style={{ border: '1px solid var(--color-border-main)', padding: '8px 12px',
                      background: 'var(--color-bg-white)' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                        {card.label}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {card.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info folha */}
                <div style={{ border: '1px solid var(--color-border-main)', padding: 12, background: 'var(--color-bg-white)' }}>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Competência</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtCompetencia(selectedFolha.competencia)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Status</div>
                      <div style={{ marginTop: 2 }}><StatusBadge status={selectedFolha.status} /></div>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>
                      Observação
                    </label>
                    <textarea value={obsEdit} onChange={(e) => setObsEdit(e.target.value)} rows={3}
                      style={{ width: '100%', fontSize: 11, border: '1px solid var(--color-border-main)', borderRadius: 0, padding: 6, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <button onClick={handleSalvarObs}
                        style={{ height: 22, padding: '0 12px', fontSize: 11, border: 'none', background: 'var(--color-brand)', color: '#fff', cursor: 'pointer', borderRadius: 0, fontWeight: 600 }}>
                        Salvar Observação
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
