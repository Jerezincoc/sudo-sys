import React, { useState, useEffect, useCallback } from 'react'
import type { FolhaCompetencia, FolhaLancamento, Funcionario, Rubrica, CreateLancamentoPayload } from '@sudo-sys/shared'
import { FormulaEvaluator, FormulaEvaluationError, FormulaValidator, contarDiasUteis } from '@sudo-sys/domain'

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function calcularDiasMes(competencia: string): number {
  const [ano, mes] = competencia.split('-').map(Number)
  return new Date(ano, mes, 0).getDate()
}

/**
 * Resolve o contexto (`ctx: Record<string,number>`) das 15 variáveis de
 * fórmula para um funcionário numa competência específica. O motor
 * (`FormulaEvaluator`) não busca dado nenhum sozinho — essa resolução é a
 * parte de "integração" que ficou de fora da implementação do motor em si.
 *
 * Decisões de fallback (documentadas aqui por não serem óbvias):
 * - HORAS_TRABALHADAS/EXTRAS_50/EXTRAS_100/FALTA: se não houver nenhum
 *   registro de ponto para o funcionário na competência, `ponto:espelho`
 *   já retorna totais zerados (não lança erro) — 0 é o valor real "não
 *   trabalhou/não bateu ponto ainda", não uma aproximação.
 * - BASE_INSS/BASE_IRRF: lidos do holerite já calculado da folha, se existir
 *   (`folha:holerites:get`). Se a folha ainda não foi calculada nenhuma vez,
 *   não existe holerite — fallback 0 (não há base ainda, é o estado real).
 * - BASE_FGTS: `folha_holerites` não persiste uma coluna própria de base de
 *   FGTS (só `valor_fgts`, o valor já calculado). Como o cálculo de FGTS é
 *   sempre `valor = base * 0.08` (sem faixas/teto), a base é recuperável de
 *   forma exata a partir do valor persistido (`valor_fgts / 0.08`) — não é
 *   uma aproximação, é a mesma conta invertida. Sem holerite, fallback 0.
 */
async function resolverContextoFormula(
  funcionario: Funcionario,
  folha: FolhaCompetencia,
): Promise<Record<string, number>> {
  const salario = funcionario.salario_base
  const cargaHoraria = funcionario.carga_horaria ?? 220
  const salarioHora = cargaHoraria > 0 ? salario / cargaHoraria : 0
  const diasMes = calcularDiasMes(folha.competencia)
  const diasUteis = contarDiasUteis(folha.competencia)

  let horasTrabalhadas = 0
  let horasExtras50 = 0
  let horasExtras100 = 0
  let horasFalta = 0
  if (window.electronAPI) {
    const [anoStr, mesStr] = folha.competencia.split('-')
    const espelhoRes = await window.electronAPI.espelhoPonto(
      folha.empresa_id, funcionario.id, Number(mesStr), Number(anoStr),
    )
    if (espelhoRes.success) {
      horasTrabalhadas = espelhoRes.data.total_trabalhadas
      horasExtras50 = espelhoRes.data.total_extras_50
      horasExtras100 = espelhoRes.data.total_extras_100
      horasFalta = espelhoRes.data.total_faltas
    }
  }

  let baseInss = 0
  let baseIrrf = 0
  let baseFgts = 0
  if (window.electronAPI) {
    const holerite = await window.electronAPI.getHolerite(folha.id, funcionario.id)
    if (holerite) {
      baseInss = holerite.base_inss
      baseIrrf = holerite.base_irrf
      baseFgts = holerite.valor_fgts / 0.08
    }
  }

  return {
    SALARIO: salario,
    CARGA_HORARIA: cargaHoraria,
    SALARIO_HORA: salarioHora,
    VALE_REFEICAO: funcionario.vale_refeicao ?? 0,
    PLANO_SAUDE: funcionario.plano_saude ?? 0,
    DIAS_MES: diasMes,
    SALARIO_DIA: diasMes > 0 ? salario / diasMes : 0,
    DIAS_UTEIS: diasUteis,
    HORAS_TRABALHADAS: horasTrabalhadas,
    HORAS_EXTRAS_50: horasExtras50,
    HORAS_EXTRAS_100: horasExtras100,
    HORAS_FALTA: horasFalta,
    BASE_INSS: baseInss,
    BASE_IRRF: baseIrrf,
    BASE_FGTS: baseFgts,
  }
}

interface LancamentoFormData {
  rubrica_id: number | null
  rubrica_codigo: string
  rubrica_nome: string
  rubrica_tipo: 'provento' | 'desconto' | 'informativo'
  referencia: string
  valor: string
}

function LancamentoFormModal({
  rubricas,
  funcionario,
  folha,
  onSave,
  onClose,
  saving,
  error,
}: {
  rubricas: Rubrica[]
  funcionario: Funcionario | null
  folha: FolhaCompetencia
  onSave: (d: LancamentoFormData) => void
  onClose: () => void
  saving: boolean
  error: string | null
}) {
  const [form, setForm] = useState<LancamentoFormData>({
    rubrica_id: null, rubrica_codigo: '', rubrica_nome: '', rubrica_tipo: 'provento',
    referencia: '0', valor: '0',
  })
  const [calculandoFormula, setCalculandoFormula] = useState(false)
  const [formulaError, setFormulaError] = useState<string | null>(null)

  const rubricaSelecionada = rubricas.find((r) => r.id === form.rubrica_id) ?? null
  const podeCalcularFormula = rubricaSelecionada?.modo_valor === 'formula' && !!rubricaSelecionada.formula

  function handleRubrica(id: string) {
    const r = rubricas.find((x) => x.id === parseInt(id, 10))
    if (!r) return
    setFormulaError(null)
    setForm((f) => ({
      ...f,
      rubrica_id: r.id,
      rubrica_codigo: r.codigo,
      rubrica_nome: r.nome,
      rubrica_tipo: r.tipo as 'provento' | 'desconto' | 'informativo',
    }))
  }

  async function handleCalcularFormula() {
    if (!rubricaSelecionada?.formula || !funcionario) return
    setFormulaError(null)

    const validacao = new FormulaValidator().validate(rubricaSelecionada.formula)
    if (!validacao.valid) {
      setFormulaError(`Fórmula inválida: ${validacao.errors.join('; ')}`)
      return
    }

    setCalculandoFormula(true)
    try {
      const ctx = await resolverContextoFormula(funcionario, folha)
      const resultado = new FormulaEvaluator().evaluate(rubricaSelecionada.formula, ctx)
      setForm((f) => ({ ...f, valor: resultado.toFixed(2) }))
    } catch (err) {
      const msg = err instanceof FormulaEvaluationError ? err.message : String(err)
      setFormulaError(`Não foi possível calcular: ${msg}`)
    } finally {
      setCalculandoFormula(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ width: 400, background: 'var(--color-bg-white)', border: '1px solid var(--color-border-main)',
        padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 12, fontWeight: 700, borderBottom: '1px solid var(--color-border-main)', paddingBottom: 8 }}>
          Adicionar Lançamento
        </div>

        <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
          Rubrica
        </label>
        <select value={form.rubrica_id ?? ''} onChange={(e) => handleRubrica(e.target.value)}
          style={{ height: 24, fontSize: 11, border: '1px solid var(--color-border-main)', borderRadius: 0, padding: '0 4px', background: 'var(--color-bg-white)' }}>
          <option value="">— Selecione —</option>
          {rubricas.map((r) => (
            <option key={r.id} value={r.id}>{r.codigo} — {r.nome} ({r.tipo})</option>
          ))}
        </select>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
              Referência
            </label>
            <input type="number" value={form.referencia} onChange={(e) => setForm((f) => ({ ...f, referencia: e.target.value }))}
              style={{ width: '100%', height: 24, fontSize: 11, border: '1px solid var(--color-border-main)', borderRadius: 0, padding: '0 4px', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 2 }}>
              Valor (R$)
            </label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input type="number" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
                style={{ width: '100%', height: 24, fontSize: 11, border: '1px solid var(--color-border-main)', borderRadius: 0, padding: '0 4px', boxSizing: 'border-box' }} />
              {podeCalcularFormula && (
                <button
                  type="button"
                  onClick={handleCalcularFormula}
                  disabled={calculandoFormula || !funcionario}
                  title={`Calcular a partir da fórmula: ${rubricaSelecionada?.formula}`}
                  style={{
                    width: 24, height: 24, flexShrink: 0, fontSize: 12, fontWeight: 700,
                    border: '1px solid var(--color-brand)', background: 'var(--color-bg-white)',
                    color: 'var(--color-brand)', cursor: calculandoFormula ? 'wait' : 'pointer', borderRadius: 0,
                  }}
                >
                  {calculandoFormula ? '…' : 'ƒ'}
                </button>
              )}
            </div>
          </div>
        </div>

        {podeCalcularFormula && (
          <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
            Fórmula da rubrica: <code>{rubricaSelecionada!.formula}</code>
          </div>
        )}
        {formulaError && <div style={{ fontSize: 11, color: '#c0392b' }}>{formulaError}</div>}

        {error && <div style={{ fontSize: 11, color: '#c0392b' }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 4 }}>
          <button onClick={onClose} disabled={saving}
            style={{ height: 24, padding: '0 12px', fontSize: 11, border: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)', cursor: 'pointer', borderRadius: 0 }}>
            Cancelar
          </button>
          <button onClick={() => onSave(form)} disabled={saving || !form.rubrica_id}
            style={{ height: 24, padding: '0 12px', fontSize: 11, border: 'none', background: 'var(--color-brand)', color: '#fff', cursor: 'pointer', borderRadius: 0, fontWeight: 600 }}>
            {saving ? 'Salvando…' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  folha: FolhaCompetencia
  funcionarios: Funcionario[]
  rubricas: Rubrica[]
  /** Chamado após "Calcular Folha" com a folha atualizada — o pai atualiza seleção/lista/holerites. */
  onFolhaCalculada: (folha: FolhaCompetencia) => void
  setStatus: (msg: string | null, type?: 'info' | 'success' | 'error') => void
}

export default function LancamentosEditor({ folha, funcionarios, rubricas, onFolhaCalculada, setStatus }: Props) {
  const [selectedFuncId, setSelectedFuncId] = useState<number | null>(funcionarios[0]?.id ?? null)
  const [lancamentos, setLancamentos] = useState<FolhaLancamento[]>([])
  const [calculando, setCalculando]   = useState(false)
  const [showForm, setShowForm]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const fechada = folha.status === 'fechada'

  const load = useCallback(async () => {
    if (!window.electronAPI) return
    const list = await window.electronAPI.listLancamentos(folha.id, selectedFuncId ?? undefined)
    setLancamentos(list)
  }, [folha.id, selectedFuncId])

  useEffect(() => { load() }, [load])

  async function handleAdd(data: LancamentoFormData) {
    if (!selectedFuncId || !window.electronAPI) return
    setSaving(true)
    setError(null)
    try {
      const payload: CreateLancamentoPayload = {
        folha_id: folha.id,
        funcionario_id: selectedFuncId,
        empresa_id: folha.empresa_id,
        rubrica_id: data.rubrica_id,
        rubrica_codigo: data.rubrica_codigo,
        rubrica_nome: data.rubrica_nome,
        rubrica_tipo: data.rubrica_tipo,
        referencia: parseFloat(data.referencia) || 0,
        valor: parseFloat(data.valor) || 0,
        origem: 'manual',
      }
      const res = await window.electronAPI.addLancamento(payload)
      if (!res.success) { setError(res.error); return }
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.electronAPI) return
    await window.electronAPI.deleteLancamento(id)
    load()
  }

  async function handleCalcular() {
    if (!window.electronAPI) return
    setCalculando(true)
    try {
      const res = await window.electronAPI.calcularFolha(folha.id)
      if (!res.success) { setStatus(res.error, 'error'); return }
      setStatus('Folha calculada com sucesso.', 'success')
      onFolhaCalculada(res.data)
    } finally {
      setCalculando(false)
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ height: 28, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px',
        borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)' }}>
        <select value={selectedFuncId ?? ''} onChange={(e) => setSelectedFuncId(e.target.value ? Number(e.target.value) : null)}
          style={{ height: 22, fontSize: 11, border: '1px solid var(--color-border-main)', borderRadius: 0, padding: '0 4px', background: 'var(--color-bg-white)', minWidth: 200 }}>
          <option value="">— Selecione funcionário —</option>
          {funcionarios.map((f) => <option key={f.id} value={f.id}>{f.codigo} — {f.nome}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        {selectedFuncId && !fechada && (
          <button onClick={() => { setShowForm(true); setError(null) }}
            style={{ height: 22, padding: '0 10px', fontSize: 11, border: '1px solid var(--color-brand)', background: 'var(--color-bg-white)', color: 'var(--color-brand)', cursor: 'pointer', borderRadius: 0, fontWeight: 600 }}>
            + Lançamento
          </button>
        )}
        {!fechada && (
          <button onClick={handleCalcular} disabled={calculando}
            style={{ height: 22, padding: '0 14px', fontSize: 11, border: 'none', background: 'var(--color-brand)', color: '#fff', cursor: 'pointer', borderRadius: 0, fontWeight: 700 }}>
            {calculando ? 'Calculando…' : 'Calcular Folha'}
          </button>
        )}
      </div>

      {/* Grid lançamentos */}
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 90px 80px 90px 80px 36px', flexShrink: 0,
        background: 'var(--color-bg-panel)', borderBottom: '2px solid var(--color-border-main)' }}>
        {['Código','Rubrica','Tipo','Referência','Valor','Origem',''].map((h, i) => (
          <div key={i} style={{ padding: '3px 6px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.04em', color: 'var(--color-text-secondary)' }}>{h}</div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {lancamentos.map((l) => (
          <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 90px 80px 90px 80px 36px',
            borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-white)' }}>
            <div style={{ padding: '3px 6px', fontSize: 11 }}>{l.rubrica_codigo}</div>
            <div style={{ padding: '3px 6px', fontSize: 11 }}>{l.rubrica_nome}</div>
            <div style={{ padding: '3px 6px', fontSize: 11, color: l.rubrica_tipo === 'desconto' ? '#c0392b' : l.rubrica_tipo === 'provento' ? '#155724' : 'inherit' }}>
              {l.rubrica_tipo}
            </div>
            <div style={{ padding: '3px 6px', fontSize: 11, textAlign: 'right' }}>{l.referencia}</div>
            <div style={{ padding: '3px 6px', fontSize: 11, textAlign: 'right', fontWeight: 600 }}>
              {fmtMoeda(l.valor)}
            </div>
            <div style={{ padding: '3px 6px', fontSize: 11, color: 'var(--color-text-muted)' }}>{l.origem}</div>
            <div style={{ padding: '3px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!fechada && (
                <button onClick={() => handleDelete(l.id)}
                  style={{ width: 18, height: 18, fontSize: 11, border: 'none', background: 'transparent',
                    color: '#c0392b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
        {lancamentos.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
            {selectedFuncId ? 'Nenhum lançamento para este funcionário.' : 'Selecione um funcionário para ver os lançamentos.'}
          </div>
        )}
      </div>

      {showForm && (
        <LancamentoFormModal
          rubricas={rubricas}
          funcionario={funcionarios.find((f) => f.id === selectedFuncId) ?? null}
          folha={folha}
          onSave={handleAdd}
          onClose={() => setShowForm(false)}
          saving={saving}
          error={error}
        />
      )}
    </div>
  )
}
