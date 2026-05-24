import type { Empresa, CreateEmpresaPayload } from '@sudo-sys/shared'
import type { IEmpresaRepository } from './IEmpresaRepository'

export function createEmpresa(repo: IEmpresaRepository, payload: CreateEmpresaPayload): Empresa {
  if (!payload.razao_social || payload.razao_social.trim().length < 3) {
    throw new Error('Razão Social deve ter pelo menos 3 caracteres.')
  }
  if (!payload.cnpj) {
    throw new Error('CNPJ é obrigatório.')
  }
  const codigo = payload.codigo || repo.nextCodigo()
  return repo.create({ ...payload, codigo, status: payload.status ?? 'ativa' })
}
