import type { Empresa, CreateEmpresaPayload, UpdateEmpresaPayload } from '@sudo-sys/shared'

export interface IEmpresaRepository {
  list(): Empresa[]
  getById(id: number): Empresa | null
  nextCodigo(): string
  create(payload: CreateEmpresaPayload): Empresa
  update(payload: UpdateEmpresaPayload): Empresa
  softDelete(id: number): void
}
