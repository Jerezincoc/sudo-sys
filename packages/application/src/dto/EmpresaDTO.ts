// packages/application/src/dto/EmpresaDTO.ts

export interface EmpresaDTO {
  id:        string;
  nome:      string;
  cnpj?:     string;
  fantasia?: string;
  endereco?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmpresaDTO {
  nome:      string;
  cnpj?:     string;
  fantasia?: string;
  endereco?: string;
}

export interface UpdateEmpresaDTO {
  id:        string;
  nome?:     string;
  cnpj?:     string;
  fantasia?: string;
  endereco?: string;
}
