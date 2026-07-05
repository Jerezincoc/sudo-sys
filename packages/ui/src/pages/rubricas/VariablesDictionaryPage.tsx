import React, { useState } from 'react'

/**
 * Dicionário de variáveis disponíveis para o campo Fórmula das rubricas
 * (modo_valor = 'formula', ex: "SALARIO * 0.05").
 *
 * Cada variável é resolvida a partir de dados reais do cadastro do
 * funcionário, da competência da folha ou do espelho de ponto do mês.
 */

export interface VariavelFormula {
  nome: string
  descricao: string
  origem: string
  exemplo: string
  categoria: 'Funcionário' | 'Competência' | 'Ponto' | 'Encargos'
}

export const FORMULA_VARIAVEIS: VariavelFormula[] = [
  // ── Funcionário ──────────────────────────────────────────────────
  { nome: 'SALARIO', categoria: 'Funcionário',
    descricao: 'Salário base mensal do funcionário',
    origem: 'funcionarios.salario_base',
    exemplo: 'SALARIO * 0.05' },
  { nome: 'CARGA_HORARIA', categoria: 'Funcionário',
    descricao: 'Carga horária mensal contratada (padrão 220h)',
    origem: 'funcionarios.carga_horaria',
    exemplo: 'SALARIO / CARGA_HORARIA' },
  { nome: 'SALARIO_HORA', categoria: 'Funcionário',
    descricao: 'Valor da hora normal (SALARIO ÷ CARGA_HORARIA)',
    origem: 'derivado',
    exemplo: 'SALARIO_HORA * 1.5' },
  { nome: 'VALE_REFEICAO', categoria: 'Funcionário',
    descricao: 'Valor diário de vale-refeição cadastrado',
    origem: 'funcionarios.vale_refeicao',
    exemplo: 'VALE_REFEICAO * DIAS_UTEIS' },
  { nome: 'PLANO_SAUDE', categoria: 'Funcionário',
    descricao: 'Valor mensal do plano de saúde cadastrado',
    origem: 'funcionarios.plano_saude',
    exemplo: 'PLANO_SAUDE * 0.5' },

  // ── Competência ──────────────────────────────────────────────────
  { nome: 'DIAS_MES', categoria: 'Competência',
    descricao: 'Total de dias corridos do mês da competência',
    origem: 'derivado da competência (AAAA-MM)',
    exemplo: 'SALARIO / DIAS_MES' },
  { nome: 'SALARIO_DIA', categoria: 'Competência',
    descricao: 'Salário-dia (SALARIO ÷ DIAS_MES)',
    origem: 'derivado',
    exemplo: 'SALARIO_DIA * HORAS_FALTA' },
  { nome: 'DIAS_UTEIS', categoria: 'Competência',
    descricao: 'Dias úteis do mês (segunda a sexta)',
    origem: 'derivado da competência',
    exemplo: 'VALE_REFEICAO * DIAS_UTEIS' },

  // ── Ponto (espelho do mês da competência) ────────────────────────
  { nome: 'HORAS_TRABALHADAS', categoria: 'Ponto',
    descricao: 'Total de horas trabalhadas no mês',
    origem: 'espelho de ponto — total_trabalhadas',
    exemplo: 'SALARIO_HORA * HORAS_TRABALHADAS' },
  { nome: 'HORAS_EXTRAS_50', categoria: 'Ponto',
    descricao: 'Total de horas extras a 50% no mês',
    origem: 'espelho de ponto — total_extras_50',
    exemplo: 'SALARIO_HORA * 1.5 * HORAS_EXTRAS_50' },
  { nome: 'HORAS_EXTRAS_100', categoria: 'Ponto',
    descricao: 'Total de horas extras a 100% no mês',
    origem: 'espelho de ponto — total_extras_100',
    exemplo: 'SALARIO_HORA * 2 * HORAS_EXTRAS_100' },
  { nome: 'HORAS_FALTA', categoria: 'Ponto',
    descricao: 'Total de horas de falta no mês',
    origem: 'espelho de ponto — total_faltas',
    exemplo: 'SALARIO_HORA * HORAS_FALTA' },

  // ── Encargos (bases calculadas na folha) ─────────────────────────
  { nome: 'BASE_INSS', categoria: 'Encargos',
    descricao: 'Base de INSS acumulada dos proventos com incidência',
    origem: 'calculada na folha',
    exemplo: 'BASE_INSS * 0.08' },
  { nome: 'BASE_IRRF', categoria: 'Encargos',
    descricao: 'Base de IRRF acumulada dos proventos com incidência',
    origem: 'calculada na folha',
    exemplo: 'BASE_IRRF * 0.275' },
  { nome: 'BASE_FGTS', categoria: 'Encargos',
    descricao: 'Base de FGTS acumulada dos proventos com incidência',
    origem: 'calculada na folha',
    exemplo: 'BASE_FGTS * 0.08' },
]

const CATEGORIAS = ['Funcionário', 'Competência', 'Ponto', 'Encargos'] as const

interface Props {
  /** Renderizado como painel lateral — botão de fechar opcional. */
  onClose?: () => void
  /** Callback ao clicar em uma variável (ex: inserir na fórmula). */
  onPick?: (nome: string) => void
}

export default function VariablesDictionaryPage({ onClose, onPick }: Props) {
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const q = search.trim().toLowerCase()
  const filtered = q
    ? FORMULA_VARIAVEIS.filter((v) =>
        v.nome.toLowerCase().includes(q) || v.descricao.toLowerCase().includes(q))
    : FORMULA_VARIAVEIS

  function handleClick(nome: string) {
    if (onPick) { onPick(nome); return }
    navigator.clipboard?.writeText(nome).catch(() => {})
    setCopied(nome)
    setTimeout(() => setCopied((c) => (c === nome ? null : c)), 1200)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-white)' }}>
      {/* Header */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--color-text-primary)' }}>
          ƒ Variáveis de Fórmula
        </div>
        {onClose && (
          <button onClick={onClose}
            style={{ width: 18, height: 18, fontSize: 11, border: 'none', background: 'transparent',
              color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            ✕
          </button>
        )}
      </div>

      {/* Busca */}
      <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--color-border-main)' }}>
        <input placeholder="Buscar variável…" value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', height: 22, fontSize: 11, border: '1px solid var(--color-border-main)',
            borderRadius: 0, padding: '0 6px', boxSizing: 'border-box', background: 'var(--color-bg-white)' }} />
      </div>

      {/* Lista */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {CATEGORIAS.map((cat) => {
          const vars = filtered.filter((v) => v.categoria === cat)
          if (vars.length === 0) return null
          return (
            <div key={cat}>
              <div style={{ padding: '4px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.04em', color: 'var(--color-text-secondary)', background: 'var(--color-bg-panel)',
                borderBottom: '1px solid var(--color-border-main)' }}>
                {cat}
              </div>
              {vars.map((v) => (
                <div key={v.nome} onClick={() => handleClick(v.nome)} title={onPick ? 'Inserir na fórmula' : 'Clique para copiar'}
                  style={{ padding: '5px 12px', borderBottom: '1px solid var(--color-border-main)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <code style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-brand)' }}>{v.nome}</code>
                    {copied === v.nome && (
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#155724' }}>copiado ✔</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-primary)', marginTop: 1 }}>{v.descricao}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 1 }}>
                    Origem: {v.origem} · Ex: <code>{v.exemplo}</code>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
            Nenhuma variável encontrada.
          </div>
        )}
      </div>

      {/* Rodapé informativo */}
      <div style={{ padding: '6px 12px', borderTop: '1px solid var(--color-border-main)', background: 'var(--color-bg-panel)',
        fontSize: 10, color: 'var(--color-text-muted)' }}>
        Operadores: + − * / ( ). Clique em uma variável para copiá-la e usá-la no campo Fórmula da rubrica.
      </div>
    </div>
  )
}
