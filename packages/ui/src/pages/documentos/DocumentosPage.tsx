import React, { useState, useEffect } from 'react'
import type { Funcionario, TipoVale, TipoAdvertencia, TipoAditivo } from '@sudo-sys/shared'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import { usePageActionsStore } from '@/state/pageActionsSlice'

// ── Helpers ──────────────────────────────────────────────────────────────────

function mesAtual(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        height: 22,
        background: 'var(--color-bg-ribbon)',
        borderTop: '1px solid var(--color-border-main)',
        borderBottom: '1px solid var(--color-border-main)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--color-text-muted)',
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        userSelect: 'none',
      }}>
        {title}
      </div>
      <div style={{ padding: '12px 10px 4px' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

const INPUT: React.CSSProperties = {
  height: 24,
  padding: '0 6px',
  border: '1px solid var(--color-border-main)',
  background: 'var(--color-bg-white)',
  color: 'var(--color-text-primary)',
  fontSize: 12,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const SELECT: React.CSSProperties = { ...INPUT, cursor: 'pointer' }

// ── DocumentosPage ────────────────────────────────────────────────────────────

export default function DocumentosPage() {
  const { empresaId, empresaNome } = useSelectedEmpresaStore()
  const empresaIdNum = empresaId != null ? parseInt(empresaId, 10) : null
  const { setStatus, clearActions } = usePageActionsStore()

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])

  useEffect(() => {
    clearActions()
    if (empresaIdNum == null) return
    window.electronAPI.listFuncionarios(empresaIdNum).then(setFuncionarios).catch(() => {})
  }, [empresaIdNum, clearActions])

  if (empresaIdNum == null) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Nenhuma empresa selecionada.</span>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', opacity: 0.7 }}>Selecione uma empresa para emitir documentos.</span>
      </div>
    )
  }

  async function gerarPdf(
    invoke: () => Promise<{ success: boolean; data?: { filePath: string }; error?: string }>,
    nome: string
  ) {
    setStatus(`Gerando ${nome}...`, 'info')
    try {
      const r = await invoke()
      if (!r.success || !r.data) {
        setStatus(`Erro: ${r.error ?? 'Falha ao gerar PDF.'}`, 'error')
        return
      }
      setStatus(`${nome} gerado com sucesso.`, 'success')
      await window.electronAPI.openPath(r.data.filePath)
    } catch (e) {
      setStatus(`Erro inesperado: ${String(e)}`, 'error')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-app)', overflow: 'auto' }}>
      {/* Empresa header */}
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

      <div style={{ padding: '0 0 16px' }}>
        <ValesSection
          funcionarios={funcionarios}
          empresaId={empresaIdNum}
          gerarPdf={gerarPdf}
        />
        <AdvertenciaSection
          funcionarios={funcionarios}
          empresaId={empresaIdNum}
          gerarPdf={gerarPdf}
        />
      </div>
    </div>
  )
}

// ── Seção Vales ───────────────────────────────────────────────────────────────

interface SectionProps {
  funcionarios: Funcionario[]
  empresaId: number
  gerarPdf: (invoke: () => Promise<any>, nome: string) => Promise<void>
}

function ValesSection({ funcionarios, empresaId, gerarPdf }: SectionProps) {
  const [funcId, setFuncId] = useState<number | ''>('')
  const [tipo, setTipo] = useState<TipoVale>('VT')
  const [competencia, setCompetencia] = useState(mesAtual())
  const [valor, setValor] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGerar() {
    if (!funcId || !valor || !quantidade) return
    setLoading(true)
    await gerarPdf(
      () => window.electronAPI.docVale({
        funcionarioId: Number(funcId),
        empresaId,
        tipo,
        competencia,
        valor: parseFloat(valor.replace(',', '.')),
        quantidade: parseInt(quantidade, 10),
      }),
      `Vale ${tipo}`
    )
    setLoading(false)
  }

  const canGerar = !!funcId && !!valor && !!quantidade && !loading

  return (
    <Section title="Vales (VT / VR)">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 130px 130px auto', gap: 8, alignItems: 'end' }}>
        <Field label="Funcionário">
          <select value={funcId} onChange={(e) => setFuncId(e.target.value ? Number(e.target.value) : '')} style={SELECT}>
            <option value="">— Selecione —</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </Field>

        <Field label="Tipo">
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoVale)} style={SELECT}>
            <option value="VT">VT</option>
            <option value="VR">VR</option>
          </select>
        </Field>

        <Field label="Competência">
          <input type="month" value={competencia} onChange={(e) => setCompetencia(e.target.value)} style={INPUT} />
        </Field>

        <Field label="Valor Unitário (R$)">
          <input
            type="text" value={valor} onChange={(e) => setValor(e.target.value)}
            placeholder="0,00" style={INPUT}
          />
        </Field>

        <Field label={tipo === 'VT' ? 'Dias' : 'Refeições'}>
          <input
            type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
            placeholder="0" style={INPUT}
          />
        </Field>

        <div style={{ paddingTop: 16 }}>
          <button
            onClick={handleGerar}
            disabled={!canGerar}
            style={{
              height: 24, padding: '0 14px',
              background: canGerar ? 'var(--color-brand)' : 'var(--color-bg-panel)',
              color: canGerar ? '#fff' : 'var(--color-text-muted)',
              border: '1px solid var(--color-border-main)',
              fontSize: 12, cursor: canGerar ? 'pointer' : 'default',
            }}
          >
            {loading ? 'Gerando...' : 'Gerar PDF'}
          </button>
        </div>
      </div>
    </Section>
  )
}

// ── Seção Advertência/Suspensão ───────────────────────────────────────────────

function AdvertenciaSection({ funcionarios, empresaId, gerarPdf }: SectionProps) {
  const [funcId, setFuncId] = useState<number | ''>('')
  const [tipo, setTipo] = useState<TipoAdvertencia>('ADVERTENCIA')
  const [motivo, setMotivo] = useState('')
  const [dias, setDias] = useState('1')
  const [loading, setLoading] = useState(false)

  const isSuspensao = tipo === 'SUSPENSAO'

  async function handleGerar() {
    if (!funcId || !motivo.trim()) return
    setLoading(true)
    await gerarPdf(
      () => window.electronAPI.docAdvertencia({
        funcionarioId: Number(funcId),
        empresaId,
        tipo,
        motivo,
        diasSuspensao: isSuspensao ? parseInt(dias, 10) : undefined,
      }),
      tipo === 'ADVERTENCIA' ? 'Advertência' : 'Suspensão'
    )
    setLoading(false)
  }

  const canGerar = !!funcId && !!motivo.trim() && !loading

  return (
    <Section title="Advertência / Suspensão">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 8, marginBottom: 8 }}>
        <Field label="Funcionário">
          <select value={funcId} onChange={(e) => setFuncId(e.target.value ? Number(e.target.value) : '')} style={SELECT}>
            <option value="">— Selecione —</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </Field>

        <Field label="Tipo">
          <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoAdvertencia)} style={SELECT}>
            <option value="ADVERTENCIA">Advertência</option>
            <option value="SUSPENSAO">Suspensão</option>
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isSuspensao ? '1fr 100px auto' : '1fr auto', gap: 8, alignItems: 'end' }}>
        <Field label="Motivo / Descrição da ocorrência">
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            placeholder="Descreva o motivo da advertência ou suspensão..."
            style={{
              ...INPUT,
              height: 'auto',
              padding: '4px 6px',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </Field>

        {isSuspensao && (
          <Field label="Dias suspensão">
            <input
              type="number" min={1} max={30} value={dias}
              onChange={(e) => setDias(e.target.value)}
              style={INPUT}
            />
          </Field>
        )}

        <div style={{ paddingTop: 16 }}>
          <button
            onClick={handleGerar}
            disabled={!canGerar}
            style={{
              height: 24, padding: '0 14px',
              background: canGerar ? 'var(--color-brand)' : 'var(--color-bg-panel)',
              color: canGerar ? '#fff' : 'var(--color-text-muted)',
              border: '1px solid var(--color-border-main)',
              fontSize: 12, cursor: canGerar ? 'pointer' : 'default',
            }}
          >
            {loading ? 'Gerando...' : 'Gerar PDF'}
          </button>
        </div>
      </div>
    </Section>
  )
}
