// packages/infrastructure/src/repositories/SqliteChamadoRepository.ts
import type { ChamadoRepository, ChamadoDTO, ChamadoFilters } from '@sudo/application';
import type { SqliteClient } from '../db/sqlite/SqliteClient';

export class SqliteChamadoRepository implements ChamadoRepository {
  constructor(private readonly db: SqliteClient) {}

  async create(chamado: ChamadoDTO): Promise<void> {
    const sql = `
      INSERT INTO chamados 
        (id, empresa_id, criador_id, responsavel_id, titulo, descricao, status, prioridade, concluido_em, created_at, updated_at)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.db.run(sql, [
      chamado.id,
      chamado.empresaId,
      chamado.criadorId,
      chamado.responsavelId || null,
      chamado.titulo,
      chamado.descricao,
      chamado.status,
      chamado.prioridade,
      chamado.concluidoEm || null,
      chamado.createdAt,
      chamado.updatedAt
    ]);
  }

  async list(filters: ChamadoFilters): Promise<ChamadoDTO[]> {
    let sql = `SELECT * FROM chamados WHERE 1=1`;
    const params: any[] = [];

    if (filters.empresaId) {
      sql += ` AND empresa_id = ?`;
      params.push(filters.empresaId);
    }
    if (filters.criadorId) {
      sql += ` AND criador_id = ?`;
      params.push(filters.criadorId);
    }
    if (filters.responsavelId) {
      sql += ` AND responsavel_id = ?`;
      params.push(filters.responsavelId);
    }
    if (filters.status) {
      sql += ` AND status = ?`;
      params.push(filters.status);
    }

    sql += ` ORDER BY created_at DESC`;

    const rows = await this.db.all(sql, params) as any[];
    return rows.map(r => ({
      id: r.id,
      empresaId: r.empresa_id,
      criadorId: r.criador_id,
      responsavelId: r.responsavel_id,
      titulo: r.titulo,
      descricao: r.descricao,
      status: r.status,
      prioridade: r.prioridade,
      concluidoEm: r.concluido_em,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  }

  async update(chamado: ChamadoDTO): Promise<void> {
    const sql = `
      UPDATE chamados SET
        responsavel_id = ?,
        titulo = ?,
        descricao = ?,
        status = ?,
        prioridade = ?,
        concluido_em = ?,
        updated_at = ?
      WHERE id = ?
    `;
    await this.db.run(sql, [
      chamado.responsavelId || null,
      chamado.titulo,
      chamado.descricao,
      chamado.status,
      chamado.prioridade,
      chamado.concluidoEm || null,
      chamado.updatedAt,
      chamado.id
    ]);
  }

  async findById(id: string): Promise<ChamadoDTO | null> {
    const r = await this.db.get(`SELECT * FROM chamados WHERE id = ?`, [id]) as any;
    if (!r) return null;

    return {
      id: r.id,
      empresaId: r.empresa_id,
      criadorId: r.criador_id,
      responsavelId: r.responsavel_id,
      titulo: r.titulo,
      descricao: r.descricao,
      status: r.status,
      prioridade: r.prioridade,
      concluidoEm: r.concluido_em,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  }
}
