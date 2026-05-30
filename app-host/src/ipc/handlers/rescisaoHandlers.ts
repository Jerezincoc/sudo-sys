import { ipcMain } from 'electron'
import { getDb } from '../../db/database'
import { SqliteRescisaoRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteRescisaoRepository'
import { SqliteFuncionarioRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteFuncionarioRepository'
import type { CreateRescisaoPayload, UpdateRescisaoPayload } from '@sudo-sys/shared'

function repo() {
  return new SqliteRescisaoRepository(getDb())
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function diffMonths(start: Date, end: Date): number {
  return Math.max(
    0,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
  )
}

// Months in current acquisition period (last anniversary of admission to demissao)
function mesesPeriodoAquisitivo(dataAdmissao: string, dataDemissao: string): number {
  const adm = parseLocalDate(dataAdmissao)
  const dem = parseLocalDate(dataDemissao)
  const aniversario = new Date(adm)
  aniversario.setFullYear(dem.getFullYear())
  if (aniversario > dem) aniversario.setFullYear(dem.getFullYear() - 1)
  return Math.min(diffMonths(aniversario, dem), 11)
}

// Months worked in current calendar year
function mesesNoAnoCorrente(dataAdmissao: string, dataDemissao: string): number {
  const adm = parseLocalDate(dataAdmissao)
  const dem = parseLocalDate(dataDemissao)
  const inicioAno = new Date(dem.getFullYear(), 0, 1)
  const inicio = adm > inicioAno ? adm : inicioAno
  return Math.min(diffMonths(inicio, dem) + 1, 12)
}

export function registerRescisaoHandlers(): void {
  // ── rescisao:list ────────────────────────────────────────────────
  ipcMain.handle('rescisao:list', (_e, empresaId: number) => {
    return repo().listByEmpresa(empresaId)
  })

  // ── rescisao:get ─────────────────────────────────────────────────
  ipcMain.handle('rescisao:get', (_e, id: number) => {
    return repo().getById(id)
  })

  // ── rescisao:create ──────────────────────────────────────────────
  ipcMain.handle('rescisao:create', (_e, payload: CreateRescisaoPayload) => {
    try {
      if (!payload.funcionario_id)
        return { success: false, error: 'Funcionário é obrigatório.' }
      if (!payload.empresa_id)
        return { success: false, error: 'Empresa é obrigatória.' }
      if (!payload.data_demissao)
        return { success: false, error: 'Data de demissão é obrigatória.' }
      if (payload.salario_referencia == null || payload.salario_referencia < 0)
        return { success: false, error: 'Salário de referência inválido.' }

      const r = repo().create(payload)
      return { success: true, data: r }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── rescisao:update ──────────────────────────────────────────────
  ipcMain.handle('rescisao:update', (_e, payload: UpdateRescisaoPayload) => {
    try {
      const r = repo().update(payload)
      return { success: true, data: r }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── rescisao:delete ──────────────────────────────────────────────
  ipcMain.handle('rescisao:delete', (_e, id: number) => {
    try {
      repo().delete(id)
      return { success: true, data: undefined }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── rescisao:calcular ────────────────────────────────────────────
  // Recalcula todos os proventos/descontos e persiste. Status -> 'calculada'.
  ipcMain.handle('rescisao:calcular', (_e, id: number) => {
    try {
      const r = repo()
      const rescisao = r.getById(id)
      if (!rescisao) return { success: false, error: `Rescisão ${id} não encontrada.` }

      const funcRepo = new SqliteFuncionarioRepository(getDb())
      const funcionario = funcRepo.getById(rescisao.funcionario_id)
      if (!funcionario) return { success: false, error: 'Funcionário não encontrado.' }

      const sal        = rescisao.salario_referencia
      const dias       = rescisao.dias_trabalhados   ?? 0
      const feriasVenc = rescisao.ferias_vencidas    ?? 0
      const outrosProv = rescisao.outros_proventos   ?? 0
      const inssResc   = rescisao.inss_rescisao      ?? 0
      const irrfResc   = rescisao.irrf_rescisao      ?? 0
      const outrosDesc = rescisao.outros_descontos   ?? 0

      const mesesPeriodo = mesesPeriodoAquisitivo(funcionario.data_admissao, rescisao.data_demissao)
      const mesesAno     = mesesNoAnoCorrente(funcionario.data_admissao, rescisao.data_demissao)

      const saldoSalario        = round2((sal / 30) * dias)
      const feriasProporcionais  = round2((sal / 12) * mesesPeriodo)
      const umTercoFerias        = round2(feriasProporcionais / 3)
      const decimoTerceiro       = round2((sal / 12) * mesesAno)
      const avisoValor           = rescisao.aviso_previo === 'indenizado' ? round2(sal) : 0
      // Multa FGTS: preserve user-entered value only for qualifying motivos
      const multaFgts            =
        rescisao.motivo === 'sem_justa_causa' || rescisao.motivo === 'acordo_mutuo'
          ? round2(rescisao.multa_fgts ?? 0)
          : 0

      const totalProventos = round2(
        saldoSalario + feriasVenc + feriasProporcionais + umTercoFerias +
        decimoTerceiro + avisoValor + multaFgts + outrosProv,
      )
      const totalDescontos = round2(inssResc + irrfResc + outrosDesc)
      const valorLiquido   = round2(totalProventos - totalDescontos)

      const updated = r.update({
        id,
        saldo_salario:        saldoSalario,
        ferias_proporcionais: feriasProporcionais,
        um_terco_ferias:      umTercoFerias,
        decimo_terceiro:      decimoTerceiro,
        aviso_previo_valor:   avisoValor,
        multa_fgts:           multaFgts,
        total_proventos:      totalProventos,
        total_descontos:      totalDescontos,
        valor_liquido:        valorLiquido,
        status:               'calculada',
      })

      return { success: true, data: updated }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
