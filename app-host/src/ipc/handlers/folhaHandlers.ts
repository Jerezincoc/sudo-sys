import { ipcMain, app } from 'electron'
import path from 'path'
import { getDb } from '../../db/database'
import { HoleriteRenderer } from '../../pdf/HoleriteRenderer'

function fmtCNPJ(v: string): string {
  const d = v.replace(/\D/g, '')
  if (d.length !== 14) return v
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`
}

function empEndereco(e: Record<string, string>): string {
  return [e.logradouro, e.numero, e.complemento, e.bairro].filter(Boolean).join(', ')
}

interface RubricaPayload {
  codigo: string
  descricao: string
  referencia: string
  proventos?: number | null
  descontos?: number | null
}

interface GeneratePdfParams {
  funcionarioId: number
  empresaId: number
  competencia: string
  rubricas: RubricaPayload[]
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
      const db   = getDb()
      const func = db.prepare('SELECT * FROM funcionarios WHERE id = ?').get(p.funcionarioId) as Record<string, string> | undefined
      const emp  = db.prepare('SELECT * FROM empresas WHERE id = ?').get(p.empresaId) as Record<string, string> | undefined

      if (!func) return { success: false, error: 'Funcionário não encontrado.' }
      if (!emp)  return { success: false, error: 'Empresa não encontrada.' }

      // Mapear rubricas → lancamentos no formato original do HoleriteRenderer
      const lancamentos = p.rubricas.map(r => ({
        codigo:     r.codigo,
        nome:       r.descricao,
        referencia: r.referencia ?? '',
        tipo:       (r.proventos != null && r.proventos > 0) ? 'provento' as const
                  : (r.descontos != null && r.descontos > 0) ? 'desconto' as const
                  : 'informativo' as const,
        valor:      r.proventos ?? r.descontos ?? 0,
      }))

      const filePath = path.join(app.getPath('temp'), `holerite-${Date.now()}.pdf`)

      await HoleriteRenderer.render({
        empresa: {
          razao_social: emp.razao_social,
          cnpj:         fmtCNPJ(emp.cnpj),
          endereco:     empEndereco(emp),
          cidade:       emp.cidade ?? '',
          uf:           emp.uf ?? '',
        },
        funcionario: {
          codigo:       func.codigo,
          nome:         func.nome,
          cpf:          func.cpf ?? '',
          cargo:        func.cargo ?? '',
          departamento: func.departamento ?? '',
          data_admissao: func.data_admissao ?? '',
          pis_pasep:    func.pis_pasep ?? '',
          ctps:         func.ctps ?? '',
        },
        competencia: p.competencia,
        lancamentos,
        totais: {
          proventos:  p.totais.vencimentos,
          descontos:  p.totais.descontos,
          liquido:    p.totais.liquido,
          base_inss:  p.bases.baseInss,
          valor_inss: p.totais.descontos,    // aproximação
          base_irrf:  p.bases.baseIrrf,
          valor_irrf: 0,
          fgts_mes:   p.bases.fgtsMes,
        },
      }, filePath)

      return { success: true, data: { filePath } }
    } catch (e) {
      return { success: false, error: String(e) }
    }
  })
}
