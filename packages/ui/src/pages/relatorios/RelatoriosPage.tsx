import React, { useState } from 'react'
import { useSelectedEmpresaStore } from '@/state/selectedEmpresaSlice'

type ReportType = 'folha' | 'funcionarios' | 'empresas' | 'ferias' | 'rescisao' | 'ponto'

const REPORTS = [
  { id: 'folha', title: '📋 Folha Mensal', desc: 'Por competência', actionText: 'Gerar PDF' },
  { id: 'funcionarios', title: '👥 Funcionários', desc: 'Cadastro completo', actionText: 'Gerar PDF' },
  { id: 'empresas', title: '🏢 Empresas', desc: 'Cadastro completo', actionText: 'Gerar PDF' },
  { id: 'ferias', title: '🌴 Férias', desc: 'Por período', actionText: 'Gerar PDF' },
  { id: 'rescisao', title: '📝 Rescisões', desc: 'Por período', actionText: 'Gerar PDF' },
  { id: 'ponto', title: '⏰ Espelho Ponto', desc: 'Por funcionário', actionText: 'Gerar PDF' },
]

export default function RelatoriosPage() {
  const { empresaId } = useSelectedEmpresaStore()
  const [activeDialog, setActiveDialog] = useState<ReportType | null>(null)
  
  // Filtros
  const [competencia, setCompetencia] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    if (!empresaId) return alert('Selecione uma empresa primeiro.')
    setLoading(true)
    try {
      if (activeDialog === 'folha') {
        // Mock ou chamada real caso folhaId exista. O ideal seria listar as folhas e escolher
        alert('Em breve: Seleção de folha e geração de holerites agrupados.')
      } else if (activeDialog === 'empresas') {
        const res = await window.electronAPI.exportEmpresas({ ids: [Number(empresaId)], format: 'pdf' })
        if (res.success) alert('PDF Gerado: ' + res.data.filePath)
        else alert('Erro: ' + res.error)
      } else {
        alert('Em breve: Este relatório será implementado na próxima versão.')
      }
    } finally {
      setLoading(false)
      setActiveDialog(null)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 16 }}>Relatórios</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {REPORTS.map(r => (
          <div key={r.id} style={{
            background: 'var(--color-bg-white)',
            border: '1px solid var(--color-border-main)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 120
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 'bold' }}>{r.title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{r.desc}</div>
            </div>
            <button
              onClick={() => setActiveDialog(r.id as ReportType)}
              style={{ alignSelf: 'flex-start', padding: '4px 8px', fontSize: 11, fontWeight: 'bold', cursor: 'default' }}
            >
              {r.actionText}
            </button>
          </div>
        ))}
      </div>

      {activeDialog && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--color-bg-white)', padding: 16, border: '1px solid var(--color-border-main)', width: 300, boxShadow: '2px 2px 5px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>Gerar Relatório</div>
            
            {activeDialog === 'folha' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, marginBottom: 2 }}>Competência (MM/AAAA)</label>
                <input value={competencia} onChange={e => setCompetencia(e.target.value)} placeholder="05/2026" style={{ width: '100%', padding: 4 }} />
              </div>
            )}
            
            <div style={{ fontSize: 11, marginBottom: 16, color: 'var(--color-text-muted)' }}>
              Apenas os dados da empresa selecionada serão incluídos.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setActiveDialog(null)} style={{ padding: '4px 8px' }}>Cancelar</button>
              <button onClick={handleGenerate} disabled={loading} style={{ padding: '4px 8px', fontWeight: 'bold' }}>
                {loading ? 'Gerando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
