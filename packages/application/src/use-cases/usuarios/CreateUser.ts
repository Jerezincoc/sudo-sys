// packages/application/src/use-cases/usuarios/CreateUser.ts
import type { UsuarioRepository } from '../../ports/repositories/UsuarioRepository';
import type { PasswordHasher } from '../../ports/hash/PasswordHasher';
import type { CreateUserDTO, UserDTO } from '../../dto/UserDTO';
import { createUsuario } from '@sudo/domain';
import { ValidationError } from '@sudo/shared';
import { v4 as uuid } from 'uuid';

export class CreateUser {
  constructor(
    private readonly repo: UsuarioRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute(dto: CreateUserDTO): Promise<UserDTO> {
    if (!dto.email?.trim()) throw new ValidationError('email', 'Email é obrigatório');
    if (!dto.passwordRaw || dto.passwordRaw.length < 6) {
      throw new ValidationError('passwordRaw', 'A senha deve ter no mínimo 6 caracteres');
    }

    const { hash, salt } = await this.hasher.hash(dto.passwordRaw);

    const usuario = createUsuario({
      id: uuid(),
      nome: dto.nome.trim(),
      email: dto.email.trim(),
      passwordHash: hash,
      passwordSalt: salt,
    });

    // Definindo "COMUM" como padrão se vazio
    const roles = dto.roles && dto.roles.length > 0 ? dto.roles : ['COMUM'];

    await this.repo.create(usuario, roles);

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      isActive: usuario.isActive,
      roles: roles,
      createdAt: usuario.createdAt,
    };
  }
}
