// packages/infrastructure/src/repositories/SqliteFuncionarioRepository.ts
import type { FuncionarioRepository, FuncionarioFilters } from '@sudo/application';
import type { FuncionarioDTO, DadosCLTDTO } from '@sudo/application';
import type { SqliteClient } from '../db/sqlite/SqliteClient';

// ─── linha raw do SQLite ──────────────────────────────────────────────────────
interface FuncionarioRow {
  id:                string;
  empresa_id:        string;
  regime:            string;
  nome:              string;
  cpf:               string | null;
  email:             string | null;
  cargo:             string | null;
  ctps:              string | null;
  ctps_serie:        string | null;
  pis:               string | null;
  admissao_data:     string | null;
  desligamento_data: string | null;
  salario_mensal:    number;
  salario_por_hora:  number;
  ativo:             number;
  created_at:        string;
  updated_at:        string;
}

function rowToDTO(row: FuncionarioRow): FuncionarioDTO {
  const isA = row.regime === 'A';
  const dadosClt: DadosCLTDTO | undefined = isA ? {
    cpf:              row.cpf              ?? undefined,
    ctps:             row.ctps             ?? undefined,
    ctpsSerie:        row.ctps_serie       ?? undefined,
    pis:              row.pis              ?? undefined,
    emailPessoal:     row.email            ?? undefined,
    cargo:            row.cargo            ?? undefined,
    admissaoData:     row.admissao_data    ?? undefined,
    desligamentoData: row.desligamento_data ?? undefined,
  } : undefined;

  return {
    id:             row.id,
    empresaId:      row.empresa_id,
    regime:         row.regime as 'A' | 'B',
    nome:           row.nome,
    salarioMensal:  row.salario_mensal,
    salarioPorHora: row.salario_por_hora,
    ativo:          row.ativo === 1,
    dadosClt,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  };
}

export class SqliteFuncionarioRepository implements FuncionarioRepository {
  constructor(private readonly db: SqliteClient) {}

  async create(f: FuncionarioDTO): Promise<void> {
    const clt = f.dadosClt;
    this.db.run(
      `INSERT INTO funcionarios
         (id, empresa_id, regime, nome,
          cpf, email, cargo, ctps, ctps_serie, pis,
          admissao_data, desligamento_data,
          salario_mensal, salario_por_hora, ativo,
          created_at, updated_at)
       VALUES
         (?,?,?,?, ?,?,?,?,?,?, ?,?, ?,?,?, ?,?)`,
      [
        f.id, f.empresaId, f.regime, f.nome,
        clt?.cpf            ?? null,
        clt?.emailPessoal   ?? null,
        clt?.cargo          ?? null,
        clt?.ctps           ?? null,
        clt?.ctpsSerie      ?? null,
        clt?.pis            ?? null,
        clt?.admissaoData   ?? null,
        clt?.desligamentoData ?? null,
        f.salarioMensal, f.salarioPorHora, f.ativo ? 1 : 0,
        f.createdAt, f.updatedAt,
      ]
    );
  }

  async update(f: FuncionarioDTO): Promise<void> {
    const clt = f.dadosClt;
    this.db.run(
      `UPDATE funcionarios SET
         nome = ?, cpf = ?, email = ?, cargo = ?,
         ctps = ?, ctps_serie = ?, pis = ?,
         admissao_data = ?, desligamento_data = ?,
         salario_mensal = ?, salario_por_hora = ?,
         ativo = ?, updated_at = ?
       WHERE id = ?`,
      [
        f.nome,
        clt?.cpf            ?? null,
        clt?.emailPessoal   ?? null,
        clt?.cargo          ?? null,
        clt?.ctps           ?? null,
        clt?.ctpsSerie      ?? null,
        clt?.pis            ?? null,
        clt?.admissaoData   ?? null,
        clt?.desligamentoData ?? null,
        f.salarioMensal, f.salarioPorHora,
        f.ativo ? 1 : 0, f.updatedAt,
        f.id,
      ]
    );
  }

  async delete(id: string): Promise<void> {
    this.db.run(`UPDATE funcionarios SET ativo = 0 WHERE id = ?`, [id]);
    // soft-delete: marca como inativo ao invés de remover
    // Para hard-delete use: this.db.run(`DELETE FROM funcionarios WHERE id = ?`, [id]);
  }

  async findById(id: string): Promise<FuncionarioDTO | null> {
    const row = this.db.get<FuncionarioRow>(
      `SELECT * FROM funcionarios WHERE id = ?`, [id]
    );
    return row ? rowToDTO(row) : null;
  }

  async list(filters: FuncionarioFilters): Promise<FuncionarioDTO[]> {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters.empresaId) {
      conditions.push('empresa_id = ?');
      params.push(filters.empresaId);
    }
    if (filters.regime) {
      conditions.push('regime = ?');
      params.push(filters.regime);
    }
    if (filters.ativo !== undefined) {
      conditions.push('ativo = ?');
      params.push(filters.ativo ? 1 : 0);
    }
    if (filters.search) {
      conditions.push('nome LIKE ?');
      params.push(`%${filters.search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = this.db.all<FuncionarioRow>(
      `SELECT * FROM funcionarios ${where} ORDER BY nome ASC`,
      params
    );
    return rows.map(rowToDTO);
  }
}
