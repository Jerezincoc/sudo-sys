// packages/application/src/dto/ChamadoDTO.ts
import type { ChamadoStatus, ChamadoPriority } from '@sudo/domain';

export interface ChamadoDTO {
  id: string;
  empresaId: string;
  criadorId: string;
  responsavelId?: string;
  titulo: string;
  descricao: string;
  status: ChamadoStatus;
  prioridade: ChamadoPriority;
  concluidoEm?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChamadoDTO {
  empresaId: string;
  criadorId: string; // Vai ser injetado pelo backend (usuário autenticado localmente pelo IPC se aplicavel, dependendo de como chamamos)
  titulo: string;
  descricao: string;
  prioridade: ChamadoPriority;
}

export interface ChamadoFilters {
  empresaId?: string;
  criadorId?: string;
  responsavelId?: string;
  status?: ChamadoStatus;
}
