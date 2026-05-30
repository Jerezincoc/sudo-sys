import React, { useState, useMemo } from 'react'

export default function CustosSimuladorPage() {
  const [salarioBase, setSalarioBase] = useState(2500)
  const [periculosidade, setPericulosidade] = useState(false)
  const [insalubridade, setInsalubridade] = useState('0') // 0, 10, 20, 40
  const [vt, setVt] = useState(150)
  const [vr, setVr] = useState(400)
  const [planoSaude, setPlanoSaude] = useState(0)
  const [regime, setRegime] = useState('CLT')

  const MINIMO = 1412

  const calculo = useMemo(() => {
    const base = Number(salarioBase) || 0
    const insal = (Number(insalubridade) / 100) * MINIMO
    const peric = periculosidade ? base * 0.3 : 0
    
    const remuneracao = base + insal + peric

    if (regime === 'PJ') {
      const custo = remuneracao + Number(vt) + Number(vr) + Number(planoSaude)
      return {
        isPJ: true,
        remuneracao,
        beneficios: Number(vt) + Number(vr) + Number(planoSaude),
        totalMensal: custo,
        totalAnual: custo * 12,
        percentual: (custo / (base || 1)) * 100
      }
    }

    const inss = remuneracao * 0.20
    const rat = remuneracao * 0.02
    const salEducacao = remuneracao * 0.025
    const sistemaS = remuneracao * 0.031 // SESC/SENAC etc
    const fgts = remuneracao * 0.08
    const decimoTerceiro = remuneracao / 12
    const ferias = (remuneracao * (1 + 1/3)) / 12

    const beneficios = Number(vt) + Number(vr) + Number(planoSaude)

    const custoMensal = remuneracao + inss + rat + salEducacao + sistemaS + fgts + decimoTerceiro + ferias + beneficios

    return {
      isPJ: false,
      remuneracao,
      inss,
      rat,
      salEducacao,
      sistemaS,
      fgts,
      decimoTerceiro,
      ferias,
      vt: Number(vt),
      vr: Number(vr),
      planoSaude: Number(planoSaude),
      totalMensal: custoMensal,
      totalAnual: custoMensal * 12,
      percentual: (custoMensal / (base || 1)) * 100
    }
  }, [salarioBase, periculosidade, insalubridade, vt, vr, planoSaude, regime])

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div style={{ padding: 16, display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      
      {/* ── Inputs ─────────────────────────────────────────── */}
      <div style={{ width: 300, background: 'var(--color-bg-white)', padding: 16, border: '1px solid var(--color-border-main)' }}>
        <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 16 }}>Parâmetros da Vaga</div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Regime de Contratação</label>
          <select value={regime} onChange={e => setRegime(e.target.value)} style={{ width: '100%', padding: 4 }}>
            <option value="CLT">CLT (Lucro Real/Presumido)</option>
            <option value="PJ">PJ / Prestador de Serviço</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Salário Base (R$)</label>
          <input type="number" value={salarioBase} onChange={e => setSalarioBase(Number(e.target.value))} style={{ width: '100%', padding: 4 }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: 11, gap: 4 }}>
            <input type="checkbox" checked={periculosidade} onChange={e => setPericulosidade(e.target.checked)} />
            Adicional de Periculosidade (30%)
          </label>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Insalubridade</label>
          <select value={insalubridade} onChange={e => setInsalubridade(e.target.value)} style={{ width: '100%', padding: 4 }}>
            <option value="0">Não</option>
            <option value="10">10% (Grau Mínimo)</option>
            <option value="20">20% (Grau Médio)</option>
            <option value="40">40% (Grau Máximo)</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Vale Transporte (R$/mês)</label>
          <input type="number" value={vt} onChange={e => setVt(Number(e.target.value))} style={{ width: '100%', padding: 4 }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Vale Refeição (R$/mês)</label>
          <input type="number" value={vr} onChange={e => setVr(Number(e.target.value))} style={{ width: '100%', padding: 4 }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, marginBottom: 4 }}>Plano de Saúde (R$/mês)</label>
          <input type="number" value={planoSaude} onChange={e => setPlanoSaude(Number(e.target.value))} style={{ width: '100%', padding: 4 }} />
        </div>
      </div>

      {/* ── Outputs ────────────────────────────────────────── */}
      <div style={{ flex: 1, background: 'var(--color-bg-white)', padding: 16, border: '1px solid var(--color-border-main)' }}>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>CUSTO TOTAL EMPREGADOR</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Remuneração (Salário + Adicionais):</span>
            <span style={{ fontWeight: 'bold' }}>{fmt(calculo.remuneracao)}</span>
          </div>

          {!calculo.isPJ && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>INSS Patronal (20%):</span>
                <span>{fmt(calculo.inss!)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>RAT ajustado (2%):</span>
                <span>{fmt(calculo.rat!)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Salário Educação (2,5%):</span>
                <span>{fmt(calculo.salEducacao!)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SESC/SENAC (3,1%):</span>
                <span>{fmt(calculo.sistemaS!)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>FGTS (8%):</span>
                <span>{fmt(calculo.fgts!)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>13° Salário (Provisão 1/12):</span>
                <span>{fmt(calculo.decimoTerceiro!)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Férias + 1/3 (Provisão 1/12):</span>
                <span>{fmt(calculo.ferias!)}</span>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Vale Transporte:</span>
            <span>{fmt(calculo.isPJ ? calculo.beneficios! : calculo.vt!)}</span>
          </div>
          
          {!calculo.isPJ && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Vale Refeição:</span>
                <span>{fmt(calculo.vr!)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Plano de Saúde:</span>
                <span>{fmt(calculo.planoSaude!)}</span>
              </div>
            </>
          )}

          <hr style={{ margin: '8px 0', borderColor: 'var(--color-border-light)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 'bold', color: 'var(--color-brand)' }}>
            <span>CUSTO TOTAL MENSAL:</span>
            <span>{fmt(calculo.totalMensal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 'bold' }}>
            <span>CUSTO ANUAL:</span>
            <span>{fmt(calculo.totalAnual)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
            <span>% sobre salário base:</span>
            <span>{calculo.percentual.toFixed(2)}%</span>
          </div>
        </div>
      </div>

    </div>
  )
}
