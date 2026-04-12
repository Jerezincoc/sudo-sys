// packages/application/src/use-cases/auth/LoginUser.ts
import type { UsuarioRepository } from '../../ports/repositories/UsuarioRepository';
import type { PasswordHasher } from '../../ports/hash/PasswordHasher';
import type { UserDTO } from '../../dto/UserDTO';
import { AuthError, ValidationError } from '@sudo/shared';

export interface LoginParams {
  email: string;
  passwordRaw: string;
}

export class LoginUser {
  constructor(
    private readonly repo: UsuarioRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(params: LoginParams): Promise<UserDTO> {
    if (!params.email) throw new ValidationError('email', 'E-mail obrigatório');
    if (!params.passwordRaw) throw new ValidationError('password', 'Senha obrigatória');

    const usuarioWithRoles = await this.repo.findByEmailWithPassword(params.email);
    if (!usuarioWithRoles) {
      throw new AuthError('Credenciais inválidas');
    }

    if (!usuarioWithRoles.isActive) {
      throw new AuthError('Usuário inativo');
    }

    const isValid = await this.hasher.compare(
      params.passwordRaw,
      usuarioWithRoles.passwordHash,
      usuarioWithRoles.passwordSalt
    );

    if (!isValid) {
      throw new AuthError('Credenciais inválidas');
    }

    return {
      id: usuarioWithRoles.id,
      nome: usuarioWithRoles.nome,
      email: usuarioWithRoles.email,
      isActive: usuarioWithRoles.isActive,
      roles: usuarioWithRoles.roles,
      createdAt: usuarioWithRoles.createdAt,
    };
  }
}
