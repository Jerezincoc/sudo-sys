// packages/domain/src/entities/Chamado.ts

export type ChamadoStatus = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO';
export type ChamadoPriority = 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';

export interface Chamado {
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

export function createChamado(
  data: Omit<Chamado, 'createdAt' | 'updatedAt' | 'status' | 'concluidoEm' | 'responsavelId'>
): Chamado {
  return {
    ...data,
    status: 'ABERTO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
