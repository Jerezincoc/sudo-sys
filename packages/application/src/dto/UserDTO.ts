// packages/application/src/dto/UserDTO.ts

export interface UserDTO {
  id: string;
  nome: string;
  email: string;
  isActive: boolean;
  roles: string[]; // Nomes das roles (ex: ['ADMIN', 'SUPORTE'])
  createdAt: string;
}

export interface CreateUserDTO {
  nome: string;
  email: string;
  passwordRaw: string; // Vai ser hasheado no use-case
  roles: string[];
}
