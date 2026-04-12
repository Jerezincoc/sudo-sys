// packages/application/src/ports/repositories/ChamadoRepository.ts
import type { ChamadoDTO, ChamadoFilters } from '../../dto/ChamadoDTO';

export interface ChamadoRepository {
  create(chamado: ChamadoDTO): Promise<void>;
  list(filters: ChamadoFilters): Promise<ChamadoDTO[]>;
  update(chamado: ChamadoDTO): Promise<void>;
  findById(id: string): Promise<ChamadoDTO | null>;
}
