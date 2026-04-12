// packages/domain/src/entities/Usuario.ts

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  isActive: boolean;
  emailVerifiedAt?: string;
  verifyToken?: string;
  verifyTokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function createUsuario(
  data: Omit<Usuario, 'createdAt' | 'updatedAt' | 'isActive'>
): Usuario {
  return {
    ...data,
    isActive: true, // ativo por padrão
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
