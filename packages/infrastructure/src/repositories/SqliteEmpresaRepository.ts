/**
 * SqliteEmpresaRepository.ts
 * Implementação SQLite do repositório de Empresas.
 * Recebe a instância já aberta do banco (singleton do app-host).
 */
import type Database from 'better-sqlite3'
import type { Empresa, CreateEmpresaPayload, UpdateEmpresaPayload } from '@sudo-sys/shared'

export class SqliteEmpresaRepository {
  constructor(private db: Database.Database) {}

  list(): Empresa[] {
    return this.db
      .prepare('SELECT * FROM empresas ORDER BY codigo')
      .all() as Empresa[]
  }

  getById(id: number): Empresa | null {
    return (
      (this.db
        .prepare('SELECT * FROM empresas WHERE id = ?')
        .get(id) as Empresa | undefined) ?? null
    )
  }

  nextCodigo(): string {
    const row = this.db
      .prepare('SELECT MAX(CAST(codigo AS INTEGER)) as max_code FROM empresas')
      .get() as { max_code: number | null }
    const next = (row.max_code ?? 0) + 1
    return String(next).padStart(4, '0')
  }

  create(payload: CreateEmpresaPayload): Empresa {
    const stmt = this.db.prepare(`
      INSERT INTO empresas (
        codigo, razao_social, nome_fantasia, cnpj,
        inscricao_estadual, inscricao_municipal, cnae_principal, natureza_juridica,
        data_abertura, cep, logradouro, numero, complemento, bairro, cidade, uf,
        telefone, email, site, responsavel, cargo_responsavel,
        regime_tributario, fpas, codigo_gps, aliquota_rat, fap,
        lotacao_tributaria, grau_risco, status
      ) VALUES (
        @codigo, @razao_social, @nome_fantasia, @cnpj,
        @inscricao_estadual, @inscricao_municipal, @cnae_principal, @natureza_juridica,
        @data_abertura, @cep, @logradouro, @numero, @complemento, @bairro, @cidade, @uf,
        @telefone, @email, @site, @responsavel, @cargo_responsavel,
        @regime_tributario, @fpas, @codigo_gps, @aliquota_rat, @fap,
        @lotacao_tributaria, @grau_risco, @status
      )
    `)

    const result = stmt.run({
      codigo: payload.codigo,
      razao_social: payload.razao_social,
      nome_fantasia: payload.nome_fantasia ?? null,
      cnpj: payload.cnpj,
      inscricao_estadual: payload.inscricao_estadual ?? null,
      inscricao_municipal: payload.inscricao_municipal ?? null,
      cnae_principal: payload.cnae_principal ?? null,
      natureza_juridica: payload.natureza_juridica ?? null,
      data_abertura: payload.data_abertura ?? null,
      cep: payload.cep ?? null,
      logradouro: payload.logradouro ?? null,
      numero: payload.numero ?? null,
      complemento: payload.complemento ?? null,
      bairro: payload.bairro ?? null,
      cidade: payload.cidade ?? null,
      uf: payload.uf ?? null,
      telefone: payload.telefone ?? null,
      email: payload.email ?? null,
      site: payload.site ?? null,
      responsavel: payload.responsavel ?? null,
      cargo_responsavel: payload.cargo_responsavel ?? null,
      regime_tributario: payload.regime_tributario ?? null,
      fpas: payload.fpas ?? null,
      codigo_gps: payload.codigo_gps ?? null,
      aliquota_rat: payload.aliquota_rat ?? null,
      fap: payload.fap ?? null,
      lotacao_tributaria: payload.lotacao_tributaria ?? null,
      grau_risco: payload.grau_risco ?? null,
      status: payload.status ?? 'ativa',
    })

    return this.getById(Number(result.lastInsertRowid))!
  }

  update(payload: UpdateEmpresaPayload): Empresa {
    const { id, ...fields } = payload
    if (Object.keys(fields).length === 0) return this.getById(id)!

    const sets = Object.keys(fields)
      .map((k) => `${k} = @${k}`)
      .join(', ')

    this.db
      .prepare(
        `UPDATE empresas SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`,
      )
      .run({ ...fields, id })

    return this.getById(id)!
  }

  softDelete(id: number): void {
    this.db
      .prepare(
        "UPDATE empresas SET status = 'inativa', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      )
      .run(id)
  }
}
