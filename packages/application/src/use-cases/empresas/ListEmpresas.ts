import type { Empresa } from '@sudo-sys/shared'
import type { IEmpresaRepository } from './IEmpresaRepository'

export function listEmpresas(repo: IEmpresaRepository): Empresa[] {
  return repo.list()
}
