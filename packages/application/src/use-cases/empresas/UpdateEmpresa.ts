import type { Empresa, UpdateEmpresaPayload } from '@sudo-sys/shared'
import type { IEmpresaRepository } from './IEmpresaRepository'

export function updateEmpresa(repo: IEmpresaRepository, payload: UpdateEmpresaPayload): Empresa {
  if (payload.razao_social !== undefined && payload.razao_social.trim().length < 3) {
    throw new Error('Razão Social deve ter pelo menos 3 caracteres.')
  }
  if (payload.aliquota_rat !== undefined && payload.aliquota_rat !== null) {
    if (payload.aliquota_rat < 0.1 || payload.aliquota_rat > 3.0) {
      throw new Error('Alíquota RAT deve estar entre 0.1 e 3.0.')
    }
  }
  if (payload.fap !== undefined && payload.fap !== null) {
    if (payload.fap < 0.5 || payload.fap > 2.0) {
      throw new Error('FAP deve estar entre 0.5 e 2.0.')
    }
  }
  return repo.update(payload)
}
