// packages/application/src/use-cases/usuarios/ListUsers.ts
import type { UsuarioRepository } from '../../ports/repositories/UsuarioRepository';
import type { UserDTO } from '../../dto/UserDTO';

export class ListUsers {
  constructor(private readonly repo: UsuarioRepository) {}

  async execute(): Promise<UserDTO[]> {
    return this.repo.listUsers();
  }
}
