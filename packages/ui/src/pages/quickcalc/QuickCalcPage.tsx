import React, { useState, useMemo, useEffect } from 'react'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'
import type { Funcionario } from '@sudo-sys/shared'

type LancamentoAvulso = {
  id: number
  codigo: string
  descricao: string
  referencia: string
  valor: number
  tipo: 'provento' | 'desconto'
}

export default function QuickCalcPage() {
  const { empresaId } = useSelectedEmpresaStore()
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [selectedFunc, setSelectedFunc] = useState<string>('')
  
  const [modo, setModo] = useState<'empresa' | 'manual'>('empresa')

  const [nomeAvulso, setNomeAvulso] = useState('')
  const [salarioAvulso, setSalarioAvulso] = useState(2500)
  const [competencia, setCompetencia] = useState('05/2026')
  const [cpfAvulso, setCpfAvulso] = useState('')
  const [cargoAvulso, setCargoAvulso] = useState('')
  const [deptoAvulso, setDeptoAvulso] = useState('')
  const [admissaoAvulso, setAdmissaoAvulso] = useState('')

  const [lancamentos, setLancamentos] = useState<LancamentoAvulso[]>([
    { id: 1, codigo: '0001', descricao: 'Salário Base', referencia: '30.00', valor: 2500, tipo: 'provento' }
  ])

  useEffect(() => {
    if (empresaId) {
      window.electronAPI.listFuncionarios(Number(empresaId)).then(setFuncionarios)
    } else {
      setFuncionarios([])
    }
  }, [empresaId])

  const calc = useMemo(() => {
    let proventos = 0
    let descontos = 0
    lancamentos.forEach(l => {
      if (l.tipo === 'provento') proventos += Number(l.valor)
      else descontos += Number(l.valor)
    })
    
    // Simplification for visual representation
    const inss = proventos * 0.09 // Mock
    const irrf = proventos > 2800 ? (proventos * 0.075) : 0 // Mock
    const fgts = proventos * 0.08
    
    const totalDescontos = descontos + inss + irrf
    const liquido = proventos - totalDescontos

    return { proventos, descontos: totalDescontos, inss, irrf, fgts, liquido }
  }, [lancamentos])

  const handleFuncChange = (val: string) => {
    setSelectedFunc(val)
    const f = funcionarios.find(x => x.id.toString() === val)
    if (f) {
      setNomeAvulso(f.nome)
      setSalarioAvulso(f.salario_base)
      setLancamentos([{ id: Date.now(), codigo: '0001', descricao: 'Salário Base', referencia: '30.00', valor: f.salario_base, tipo: 'provento' }])
    }
  }

  const handleManualSalarioChange = (v: number) => {
    setSalarioAvulso(v)
    const baseLanc = lancamentos.find(l => l.codigo === '0001')
    if (baseLanc) {
      handleUpdate(baseLanc.id, 'valor', v)
    } else {
      setLancamentos([{ id: Date.now(), codigo: '0001', descricao: 'Salário Base', referencia: '30.00', valor: v, tipo: 'provento' }, ...lancamentos])
    }
  }

  const handleAddLancamento = () => {
    setLancamentos([...lancamentos, { id: Date.now(), codigo: '', descricao: '', referencia: '', valor: 0, tipo: 'provento' }])
  }

  const handleUpdate = (id: number, field: keyof LancamentoAvulso, val: string | number) => {
    setLancamentos(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l))
  }

  const handleRemove = (id: number) => {
    setLancamentos(prev => prev.filter(l => l.id !== id))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSave = () => {
    alert('Em breve: Salvar lançamentos avulsos na folha aberta da competência.')
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div style={{ padding: 16, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      
      {/* ── Inputs e Lançamentos ──────────────────────────────────────── */}
      <div style={{ flex: 1, background: 'var(--color-bg-white)', padding: 16, border: '1px solid var(--color-border-main)' }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Calculadora Avulsa
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setModo('empresa')} style={{ padding: '4px 8px', fontSize: 11, background: modo === 'empresa' ? 'var(--color-brand)' : 'transparent', color: modo === 'empresa' ? '#fff' : 'inherit' }}>Modo Empresa</button>
            <button onClick={() => setModo('manual')} style={{ padding: '4px 8px', fontSize: 11, background: modo === 'manual' ? 'var(--color-brand)' : 'transparent', color: modo === 'manual' ? '#fff' : 'inherit' }}>Modo Manual</button>
          </div>
        </div>

        {modo === 'empresa' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Funcionário (Opcional)</label>
              <select value={selectedFunc} onChange={e => handleFuncChange(e.target.value)} style={{ width: '100%', padding: 4 }}>
                <option value="">-- Avulso --</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Nome</label>
              <input value={nomeAvulso} onChange={e => setNomeAvulso(e.target.value)} style={{ width: '100%', padding: 4 }} disabled={!!selectedFunc} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Competência</label>
              <input value={competencia} onChange={e => setCompetencia(e.target.value)} style={{ width: '100%', padding: 4 }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div><label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Nome *</label><input value={nomeAvulso} onChange={e => setNomeAvulso(e.target.value)} style={{ width: '100%', padding: 4 }} /></div>
            <div><label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Salário Base *</label><input type="number" value={salarioAvulso} onChange={e => handleManualSalarioChange(Number(e.target.value))} style={{ width: '100%', padding: 4 }} /></div>
            <div><label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Competência *</label><input value={competencia} onChange={e => setCompetencia(e.target.value)} style={{ width: '100%', padding: 4 }} /></div>
            <div><label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>CPF</label><input value={cpfAvulso} onChange={e => setCpfAvulso(e.target.value)} style={{ width: '100%', padding: 4 }} /></div>
            <div><label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Cargo</label><input value={cargoAvulso} onChange={e => setCargoAvulso(e.target.value)} style={{ width: '100%', padding: 4 }} /></div>
            <div><label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Departamento</label><input value={deptoAvulso} onChange={e => setDeptoAvulso(e.target.value)} style={{ width: '100%', padding: 4 }} /></div>
            <div><label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Admissão</label><input type="date" value={admissaoAvulso} onChange={e => setAdmissaoAvulso(e.target.value)} style={{ width: '100%', padding: 4 }} /></div>
          </div>
        )}

        <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          Lançamentos
          <button onClick={handleAddLancamento} style={{ padding: '2px 6px', fontSize: 11 }}>+ Linha</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px 80px 100px 40px', background: 'var(--color-bg-ribbon)', fontSize: 11, fontWeight: 700, borderBottom: '2px solid var(--color-brand)' }}>
          <div style={{ padding: 4 }}>Código</div>
          <div style={{ padding: 4 }}>Descrição</div>
          <div style={{ padding: 4 }}>Ref.</div>
          <div style={{ padding: 4 }}>Valor</div>
          <div style={{ padding: 4 }}>Tipo</div>
          <div style={{ padding: 4 }}></div>
        </div>
        {lancamentos.map((l, i) => (
          <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px 80px 100px 40px', background: i % 2 === 0 ? 'transparent' : 'var(--color-bg-row-even)', borderBottom: '1px solid var(--color-border-light)' }}>
            <input value={l.codigo} onChange={e => handleUpdate(l.id, 'codigo', e.target.value)} style={{ border: 'none', background: 'transparent', padding: 4, width: '100%' }} />
            <input value={l.descricao} onChange={e => handleUpdate(l.id, 'descricao', e.target.value)} style={{ border: 'none', background: 'transparent', padding: 4, width: '100%' }} />
            <input value={l.referencia} onChange={e => handleUpdate(l.id, 'referencia', e.target.value)} style={{ border: 'none', background: 'transparent', padding: 4, width: '100%' }} />
            <input type="number" value={l.valor} onChange={e => handleUpdate(l.id, 'valor', Number(e.target.value))} style={{ border: 'none', background: 'transparent', padding: 4, width: '100%' }} />
            <select value={l.tipo} onChange={e => handleUpdate(l.id, 'tipo', e.target.value)} style={{ border: 'none', background: 'transparent', padding: 4, width: '100%' }}>
              <option value="provento">Provento</option>
              <option value="desconto">Desconto</option>
            </select>
            <button onClick={() => handleRemove(l.id)} style={{ border: 'none', background: 'transparent', color: 'red', cursor: 'pointer' }}>X</button>
          </div>
        ))}
      </div>

      {/* ── Holerite Preview ─────────────────────────────────────────── */}
      <div style={{ width: 350, background: 'var(--color-bg-white)', padding: 16, border: '1px solid var(--color-border-main)' }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' }}>Resumo do Holerite</div>
        
        <div style={{ fontSize: 12, marginBottom: 12 }}>
          <div><strong>Nome:</strong> {nomeAvulso || 'Não informado'}</div>
          <div><strong>Competência:</strong> {competencia}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          <span>Total Proventos:</span>
          <span style={{ color: 'green' }}>{fmt(calc.proventos)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          <span>Total Descontos:</span>
          <span style={{ color: 'red' }}>{fmt(calc.descontos)}</span>
        </div>
        <hr style={{ margin: '8px 0', borderColor: 'var(--color-border-light)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 'bold' }}>
          <span>Líquido:</span>
          <span>{fmt(calc.liquido)}</span>
        </div>

        <div style={{ marginTop: 16, fontSize: 10, color: 'var(--color-text-muted)' }}>
          <div>Base INSS: {fmt(calc.proventos)} | Valor INSS: {fmt(calc.inss)}</div>
          <div>Base IRRF: {fmt(calc.proventos - calc.inss)} | Valor IRRF: {fmt(calc.irrf)}</div>
          <div>Base FGTS: {fmt(calc.proventos)} | Valor FGTS: {fmt(calc.fgts)}</div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
          <button onClick={handlePrint} style={{ flex: 1, padding: 8, fontWeight: 'bold' }}>Imprimir</button>
          {modo === 'empresa' && (
            <button onClick={handleSave} style={{ flex: 1, padding: 8, fontWeight: 'bold', background: 'var(--color-brand)', color: 'white' }}>Salvar Lançamentos</button>
          )}
        </div>
      </div>

    </div>
  )
}
