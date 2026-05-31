/**
 * SqliteFuncionarioRepository.ts
 * Implementação SQLite do repositório de Funcionários.
 * Recebe a instância já aberta do banco (singleton do app-host).
 */
import type Database from 'better-sqlite3'
import type { Funcionario, CreateFuncionarioPayload, UpdateFuncionarioPayload } from '@sudo-sys/shared'

export class SqliteFuncionarioRepository {
  constructor(private db: Database.Database) {}

  listByEmpresa(empresaId: number): Funcionario[] {
    return this.db
      .prepare('SELECT * FROM funcionarios WHERE empresa_id = ? ORDER BY codigo')
      .all(empresaId) as Funcionario[]
  }

  listAll(): Funcionario[] {
    return this.db
      .prepare('SELECT * FROM funcionarios ORDER BY empresa_id, codigo')
      .all() as Funcionario[]
  }

  getById(id: number): Funcionario | null {
    return (
      (this.db.prepare('SELECT * FROM funcionarios WHERE id = ?').get(id) as Funcionario | undefined) ?? null
    )
  }

  nextCodigo(empresaId: number): string {
    const row = this.db
      .prepare('SELECT MAX(CAST(codigo AS INTEGER)) as max_code FROM funcionarios WHERE empresa_id = ?')
      .get(empresaId) as { max_code: number | null }
    const next = (row.max_code ?? 0) + 1
    return String(next).padStart(4, '0')
  }

  create(payload: CreateFuncionarioPayload): Funcionario {
    const stmt = this.db.prepare(`
      INSERT INTO funcionarios (
        empresa_id, codigo, nome, cpf, rg, data_nascimento, sexo, estado_civil,
        escolaridade, cargo, departamento, data_admissao, data_demissao,
        tipo_contrato, salario_base, carga_horaria, periculosidade, insalubridade,
        vale_transporte, vale_refeicao, plano_saude, cep, logradouro, numero,
        complemento, bairro, cidade, uf, telefone, email, banco, agencia, conta,
        pis_pasep, ctps, cbo_codigo, status
      ) VALUES (
        @empresa_id, @codigo, @nome, @cpf, @rg, @data_nascimento, @sexo, @estado_civil,
        @escolaridade, @cargo, @departamento, @data_admissao, @data_demissao,
        @tipo_contrato, @salario_base, @carga_horaria, @periculosidade, @insalubridade,
        @vale_transporte, @vale_refeicao, @plano_saude, @cep, @logradouro, @numero,
        @complemento, @bairro, @cidade, @uf, @telefone, @email, @banco, @agencia, @conta,
        @pis_pasep, @ctps, @cbo_codigo, @status
      )
    `)

    const result = stmt.run({
      empresa_id:      payload.empresa_id,
      codigo:          payload.codigo,
      nome:            payload.nome,
      cpf:             payload.cpf,
      rg:              payload.rg              ?? null,
      data_nascimento: payload.data_nascimento ?? null,
      sexo:            payload.sexo            ?? null,
      estado_civil:    payload.estado_civil    ?? null,
      escolaridade:    payload.escolaridade    ?? null,
      cargo:           payload.cargo           ?? null,
      departamento:    payload.departamento    ?? null,
      data_admissao:   payload.data_admissao,
      data_demissao:   payload.data_demissao   ?? null,
      tipo_contrato:   payload.tipo_contrato   ?? 'clt',
      salario_base:    payload.salario_base,
      carga_horaria:   payload.carga_horaria   ?? 220,
      periculosidade:  payload.periculosidade  ?? 0,
      insalubridade:   payload.insalubridade   ?? null,
      vale_transporte: payload.vale_transporte ?? 0,
      vale_refeicao:   payload.vale_refeicao   ?? null,
      plano_saude:     payload.plano_saude     ?? null,
      cep:             payload.cep             ?? null,
      logradouro:      payload.logradouro      ?? null,
      numero:          payload.numero          ?? null,
      complemento:     payload.complemento     ?? null,
      bairro:          payload.bairro          ?? null,
      cidade:          payload.cidade          ?? null,
      uf:              payload.uf              ?? null,
      telefone:        payload.telefone        ?? null,
      email:           payload.email           ?? null,
      banco:           payload.banco           ?? null,
      agencia:         payload.agencia         ?? null,
      conta:           payload.conta           ?? null,
      pis_pasep:       payload.pis_pasep       ?? null,
      ctps:            payload.ctps            ?? null,
      cbo_codigo:      payload.cbo_codigo      ?? null,
      status:          payload.status          ?? 'ativo',
    })

    return this.getById(Number(result.lastInsertRowid))!
  }

  update(payload: UpdateFuncionarioPayload): Funcionario {
    const { id, ...fields } = payload
    if (Object.keys(fields).length === 0) return this.getById(id)!

    const sets = Object.keys(fields)
      .map((k) => `${k} = @${k}`)
      .join(', ')

    this.db
      .prepare(
        `UPDATE funcionarios SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`,
      )
      .run({ ...fields, id })

    return this.getById(id)!
  }

  softDelete(id: number): void {
    this.db
      .prepare(
        "UPDATE funcionarios SET status = 'inativo', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      )
      .run(id)
  }

  /**
   * Lógica dupla de exclusão:
   * - Funcionário ATIVO   → soft-delete (status = 'inativo')    → action: 'inativado'
   * - Funcionário INATIVO → hard-delete (DELETE FROM funcionarios) → action: 'excluido'
   *
   * Lança erro se o id não existir.
   */
  deleteOrPermanent(id: number): { action: 'inativado' | 'excluido' } {
    const func = this.getById(id)
    if (!func) throw new Error(`Funcionário ${id} não encontrado.`)

    if (func.status === 'ativo') {
      this.db
        .prepare(
          "UPDATE funcionarios SET status = 'inativo', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        )
        .run(id)
      return { action: 'inativado' }
    }

    // status === 'inativo' ou 'demitido' → remoção permanente
    this.db
      .prepare('DELETE FROM funcionarios WHERE id = ?')
      .run(id)
    return { action: 'excluido' }
  }
}
