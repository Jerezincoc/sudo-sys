// packages/infrastructure/src/repositories/SqliteUsuarioRepository.ts
import type { UsuarioRepository, UserDTO } from '@sudo/application';
import type { Usuario } from '@sudo/domain';
import type { SqliteClient } from '../db/sqlite/SqliteClient';

export class SqliteUsuarioRepository implements UsuarioRepository {
  constructor(private readonly db: SqliteClient) {}

  async create(usuario: Usuario, roles: string[]): Promise<void> {
    const sqlUser = `
      INSERT INTO usuarios (id, nome, email, password_hash, password_salt, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.db.run(sqlUser, [
      usuario.id,
      usuario.nome,
      usuario.email,
      usuario.passwordHash,
      usuario.passwordSalt,
      usuario.isActive ? 1 : 0,
      usuario.createdAt,
      usuario.updatedAt
    ]);
    
    for (const r of roles) {
      let roleQuery = await this.db.get(`SELECT id FROM roles WHERE nome = ?`, [r]) as {id: string} | undefined;
      let roleId = '';
      if (!roleQuery) {
        roleId = Math.random().toString(36).substring(7); // fake id
        await this.db.run(`INSERT INTO roles (id, nome) VALUES (?, ?)`, [roleId, r]);
      } else {
        roleId = roleQuery.id;
      }

      await this.db.run(`INSERT INTO usuario_roles (usuario_id, role_id) VALUES (?, ?)`, [usuario.id, roleId]);
    }
  }

  async findByEmailWithPassword(email: string): Promise<(Usuario & { roles: string[] }) | null> {
    const row = await this.db.get(`SELECT * FROM usuarios WHERE email = ? AND is_active = 1`, [email]) as any;
    if (!row) return null;

    const rolesRows = await this.db.all(`
      SELECT r.nome 
      FROM usuario_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.usuario_id = ?
    `, [row.id]) as { nome: string }[];

    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      passwordHash: row.password_hash,
      passwordSalt: row.password_salt,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      roles: rolesRows.map(rr => rr.nome)
    };
  }

  async findUserDTOById(id: string): Promise<UserDTO | null> {
    const row = await this.db.get(`SELECT * FROM usuarios WHERE id = ?`, [id]) as any;
    if (!row) return null;

    const rolesRows = await this.db.all(`
      SELECT r.nome 
      FROM usuario_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.usuario_id = ?
    `, [row.id]) as { nome: string }[];

    return {
      id: row.id,
      nome: row.nome,
      email: row.email,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      roles: rolesRows.map(rr => rr.nome)
    };
  }

  async listUsers(): Promise<UserDTO[]> {
    const rows = await this.db.all(`SELECT * FROM usuarios ORDER BY nome ASC`) as any[];
    
    return Promise.all(rows.map(async r => {
      const rolesRows = await this.db.all(`
        SELECT r.nome 
        FROM usuario_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.usuario_id = ?
      `, [r.id]) as { nome: string }[];

      return {
        id: r.id,
        nome: r.nome,
        email: r.email,
        isActive: r.is_active === 1,
        createdAt: r.created_at,
        roles: rolesRows.map(rr => rr.nome)
      };
    }));
  }

  async updateUserRoles(usuarioId: string, newRoles: string[]): Promise<void> {
    await this.db.run(`DELETE FROM usuario_roles WHERE usuario_id = ?`, [usuarioId]);

    for (const r of newRoles) {
      let roleQuery = await this.db.get(`SELECT id FROM roles WHERE nome = ?`, [r]) as {id: string} | undefined;
      let roleId = '';
      if (!roleQuery) {
        roleId = Math.random().toString(36).substring(7);
        await this.db.run(`INSERT INTO roles (id, nome) VALUES (?, ?)`, [roleId, r]);
      } else {
        roleId = roleQuery.id;
      }
      await this.db.run(`INSERT INTO usuario_roles (usuario_id, role_id) VALUES (?, ?)`, [usuarioId, roleId]);
    }
  }
}
