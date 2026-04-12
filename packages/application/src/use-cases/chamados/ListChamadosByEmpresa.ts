// packages/application/src/use-cases/chamados/ListChamadosByEmpresa.ts
import type { ChamadoRepository } from '../../ports/repositories/ChamadoRepository';
import type { ChamadoDTO, ChamadoFilters } from '../../dto/ChamadoDTO';
import { ValidationError } from '@sudo/shared';

export class ListChamadosByEmpresa {
  constructor(private readonly repo: ChamadoRepository) {}

  async execute(empresaId: string, filters?: Omit<ChamadoFilters, 'empresaId'>): Promise<ChamadoDTO[]> {
    if (!empresaId) throw new ValidationError('empresaId', 'ID da empresa é obrigatório');
    
    return this.repo.list({
      ...filters,
      empresaId
    });
  }
}
