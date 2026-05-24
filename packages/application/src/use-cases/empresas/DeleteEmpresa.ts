import type { IEmpresaRepository } from './IEmpresaRepository'

export function deleteEmpresa(repo: IEmpresaRepository, id: number): void {
  const empresa = repo.getById(id)
  if (!empresa) {
    throw new Error(`Empresa com id ${id} não encontrada.`)
  }
  repo.softDelete(id)
}
