// packages/domain/src/entities/Empresa.ts

export interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  fantasia?: string;
  endereco?: string;
  createdAt: string;
  updatedAt: string;
}

export function createEmpresa(
  data: Omit<Empresa, 'createdAt' | 'updatedAt'>
): Empresa {
  return {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
