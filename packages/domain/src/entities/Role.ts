// packages/domain/src/entities/Role.ts

export interface Role {
  id: string;
  nome: string; // Ex: ADMIN, SUPORTE, COMUM, ATENDIMENTO
  descricao?: string;
  createdAt: string;
}

export type RoleName = 'ADMIN' | 'SUPORTE' | 'ATENDIMENTO' | 'COMUM';

export function createRole(
  data: Omit<Role, 'createdAt'>
): Role {
  return {
    ...data,
    createdAt: new Date().toISOString(),
  };
}
