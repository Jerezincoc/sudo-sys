// packages/application/src/ports/repositories/FuncionarioRepository.ts
import type { FuncionarioDTO } from '../../dto/FuncionarioDTO';
import type { Regime } from '../../dto/FuncionarioDTO';

export interface FuncionarioFilters {
  empresaId?: string;
  regime?:    Regime;
  ativo?:     boolean;
  search?:    string;   // busca por nome
}

export interface FuncionarioRepository {
  create(f: FuncionarioDTO): Promise<void>;
  update(f: FuncionarioDTO): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<FuncionarioDTO | null>;
  list(filters: FuncionarioFilters): Promise<FuncionarioDTO[]>;
}
