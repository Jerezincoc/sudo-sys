// packages/infrastructure/src/repositories/SqliteEmpresaRepository.ts
import type Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

// Modelo “de banco” (bem direto)
export type EmpresaRow = {
  id: string;
  nome: string;
  cnpj: string | null;
  fantasia: string | null;
  endereco: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateEmpresaInput = {
  nome: string;
  cnpj?: string | null;
  fantasia?: string | null;
  endereco?: string | null;
};

export type UpdateEmpresaInput = {
  id: string;
  nome?: string;
  cnpj?: string | null;
  fantasia?: string | null;
  endereco?: string | null;
};

export class SqliteEmpresaRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  list(): EmpresaRow[] {
    const stmt = this.db.prepare<[], EmpresaRow>(`
      SELECT id, nome, cnpj, fantasia, endereco, created_at, updated_at
      FROM empresas
      ORDER BY nome ASC
    `);

    return stmt.all();
  }

  getById(id: string): EmpresaRow | null {
    const stmt = this.db.prepare<[string], EmpresaRow>(`
      SELECT id, nome, cnpj, fantasia, endereco, created_at, updated_at
      FROM empresas
      WHERE id = ?
      LIMIT 1
    `);

    return stmt.get(id) ?? null;
  }

  create(input: CreateEmpresaInput): { id: string } {
    const id = randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO empresas (id, nome, cnpj, fantasia, endereco, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    stmt.run(
      id,
      input.nome.trim(),
      input.cnpj?.trim() || null,
      input.fantasia?.trim() || null,
      input.endereco?.trim() || null
    );

    return { id };
  }

  update(input: UpdateEmpresaInput): void {
    const current = this.getById(input.id);
    if (!current) {
      throw new Error("Empresa não encontrada.");
    }

    const nome = input.nome !== undefined ? input.nome.trim() : current.nome;
    const cnpj =
      input.cnpj !== undefined ? (input.cnpj?.trim() || null) : current.cnpj;
    const fantasia =
      input.fantasia !== undefined
        ? (input.fantasia?.trim() || null)
        : current.fantasia;
    const endereco =
      input.endereco !== undefined
        ? (input.endereco?.trim() || null)
        : current.endereco;

    const stmt = this.db.prepare(`
      UPDATE empresas
      SET nome = ?, cnpj = ?, fantasia = ?, endereco = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(nome, cnpj, fantasia, endereco, input.id);
  }

  delete(id: string): void {
    // FK já está ON e funcionarios tem ON DELETE CASCADE por empresa_id,
    // então deletar empresa apaga funcionários e tudo dependente.
    const stmt = this.db.prepare(`
      DELETE FROM empresas
      WHERE id = ?
    `);

    stmt.run(id);
  }
}