import { ipcMain } from 'electron'
import { getDb } from '../../db/database'
import { renderHolerite } from './pdf/holeriteRenderer'
import type { HoleriteData, HoleriteRubrica } from './pdf/holeriteRenderer'

function fmtCNPJ(v: string): string {
  const d = v.replace(/\D/g, '')
  if (d.length !== 14) return v
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

function empEndereco(e: Record<string, string>): string {
  return [e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf]
    .filter(Boolean).join(', ')
}

interface GeneratePdfParams {
  funcionarioId: number
  empresaId: number
  competencia: string
  rubricas: HoleriteRubrica[]
  totais: { vencimentos: number; descontos: number; liquido: number }
  bases: {
    salarioBase: number
    baseInss: number
    baseFgts: number
    fgtsMes: number
    baseIrrf: number
    faixaIrrf: string
  }
}

export function registerFolhaHandlers(): void {
  ipcMain.handle('folha:generate-pdf', async (_e, p: GeneratePdfParams) => {
    try {
      const db  = getDb()
      const func = db.prepare('SELECT * FROM funcionarios WHERE id = ?').get(p.funcionarioId) as Record<string, string> | undefined
      const emp  = db.prepare('SELECT * FROM empresas WHERE id = ?').get(p.empresaId) as Record<string, string> | undefined

      if (!func) return { success: false, error: 'Funcionário não encontrado.' }
      if (!emp)  return { success: false, error: 'Empresa não encontrada.' }

      const data: HoleriteData = {
        empresa: {
          nome:     emp.razao_social,
          cnpj:     fmtCNPJ(emp.cnpj),
          endereco: empEndereco(emp),
        },
        funcionario: {
          codigo:        func.codigo,
          nome:          func.nome,
          cbo_descricao: func.cargo || '—',
        },
        competencia: p.competencia,
        rubricas:    p.rubricas,
        totais:      p.totais,
        bases:       p.bases,
      }

      const filePath = await renderHolerite(data)
      return { success: true, data: { filePath } }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })
}
