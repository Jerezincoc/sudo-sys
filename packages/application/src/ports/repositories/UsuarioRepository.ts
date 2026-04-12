// packages/application/src/ports/repositories/UsuarioRepository.ts
import type { UserDTO } from '../../dto/UserDTO';
import type { Usuario } from '@sudo/domain';

export interface UsuarioRepository {
  create(usuario: Usuario, roles: string[]): Promise<void>;
  findByEmailWithPassword(email: string): Promise<(Usuario & { roles: string[] }) | null>;
  findUserDTOById(id: string): Promise<UserDTO | null>;
  listUsers(): Promise<UserDTO[]>;
  updateUserRoles(usuarioId: string, newRoles: string[]): Promise<void>;
}
