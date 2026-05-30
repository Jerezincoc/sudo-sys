/**
 * funcionarioHandlers.ts
 * IPC handlers para o cadastro de funcionários (funcionario:*).
 * Usa SqliteFuncionarioRepository + validações inline nesta camada de IPC.
 */
import { ipcMain, app } from 'electron'
import path from 'path'
import { getDb } from '../../db/database'
import { SqliteFuncionarioRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteFuncionarioRepository'
import { SqliteEmpresaRepository } from '@sudo-sys/infrastructure/src/repositories/SqliteEmpresaRepository'
import type { CreateFuncionarioPayload, UpdateFuncionarioPayload } from '@sudo-sys/shared'
import { FichaFuncionarioRenderer } from '../../pdf/FichaFuncionarioRenderer'

function repo() {
  return new SqliteFuncionarioRepository(getDb())
}

export function registerFuncionarioHandlers(): void {
  // ── funcionario:list ────────────────────────────────────────────
  ipcMain.handle('funcionario:list', (_e, empresaId?: number) => {
    const r = repo()
    return empresaId != null ? r.listByEmpresa(empresaId) : r.listAll()
  })

  // ── funcionario:get ─────────────────────────────────────────────
  ipcMain.handle('funcionario:get', (_e, id: number) => {
    return repo().getById(id)
  })

  // ── funcionario:create ──────────────────────────────────────────
  ipcMain.handle('funcionario:create', (_e, payload: CreateFuncionarioPayload) => {
    try {
      if (!payload.nome || payload.nome.trim().length < 2)
        return { success: false, error: 'Nome deve ter pelo menos 2 caracteres.' }
      if (!payload.cpf)
        return { success: false, error: 'CPF é obrigatório.' }
      if (!payload.data_admissao)
        return { success: false, error: 'Data de admissão é obrigatória.' }
      if (!payload.empresa_id)
        return { success: false, error: 'Empresa é obrigatória.' }

      const r = repo()
      const codigo = payload.codigo || r.nextCodigo(payload.empresa_id)
      const func = r.create({ ...payload, codigo })
      return { success: true, data: func }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const dupCpf = msg.includes('UNIQUE') && msg.includes('cpf')
      return {
        success: false,
        error: dupCpf
          ? 'Já existe um funcionário com este CPF nesta empresa.'
          : msg,
      }
    }
  })

  // ── funcionario:update ──────────────────────────────────────────
  ipcMain.handle('funcionario:update', (_e, payload: UpdateFuncionarioPayload) => {
    try {
      if (payload.nome !== undefined && payload.nome.trim().length < 2)
        return { success: false, error: 'Nome deve ter pelo menos 2 caracteres.' }

      const func = repo().update(payload)
      return { success: true, data: func }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── funcionario:delete (lógica dupla) ───────────────────────────
  //   Funcionário ATIVO   → soft-delete (status = 'inativo') → action: 'inativado'
  //   Funcionário INATIVO → hard-delete (DELETE)             → action: 'excluido'
  ipcMain.handle('funcionario:delete', (_e, id: number) => {
    try {
      const r = repo()
      const exists = r.getById(id)
      if (!exists) return { success: false, error: `Funcionário ${id} não encontrado.` }
      const { action } = r.deleteOrPermanent(id)
      return { success: true, data: undefined, action }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  // ── funcionario:gerar-ficha-pdf ──────────────────────────────────
  ipcMain.handle('funcionario:gerar-ficha-pdf', async (_e, id: number) => {
    try {
      const func = repo().getById(id)
      if (!func) return { success: false, error: `Funcionário ${id} não encontrado.` }

      const emp = new SqliteEmpresaRepository(getDb()).getById(func.empresa_id)
      if (!emp) return { success: false, error: 'Empresa não encontrada.' }

      const downloads = app.getPath('downloads')
      const fileName = `FichaFuncionario_${func.nome.replace(/\s+/g, '_')}.pdf`
      const filePath = path.join(downloads, fileName)

      await FichaFuncionarioRenderer.render({
        empresa: {
          razao_social: emp.razao_social,
          cnpj: emp.cnpj,
          cidade: emp.cidade ?? '',
          uf: emp.uf ?? '',
        },
        funcionario: {
          codigo: func.codigo,
          nome: func.nome,
          cpf: func.cpf,
          rg: func.rg ?? null,
          data_nascimento: func.data_nascimento ?? null,
          sexo: func.sexo ?? null,
          estado_civil: func.estado_civil ?? null,
          escolaridade: func.escolaridade ?? null,
          cargo: func.cargo ?? null,
          departamento: func.departamento ?? null,
          data_admissao: func.data_admissao,
          tipo_contrato: func.tipo_contrato ?? null,
          salario_base: func.salario_base,
          carga_horaria: func.carga_horaria ?? null,
          periculosidade: func.periculosidade ?? 0,
          insalubridade: func.insalubridade ?? null,
          vale_transporte: func.vale_transporte ?? 0,
          vale_refeicao: func.vale_refeicao ?? 0,
          plano_saude: func.plano_saude ?? 0,
          cep: func.cep ?? null,
          logradouro: func.logradouro ?? null,
          numero: func.numero ?? null,
          complemento: func.complemento ?? null,
          bairro: func.bairro ?? null,
          cidade: func.cidade ?? null,
          uf: func.uf ?? null,
          telefone: func.telefone ?? null,
          email: func.email ?? null,
          banco: func.banco ?? null,
          agencia: func.agencia ?? null,
          conta: func.conta ?? null,
          pis_pasep: func.pis_pasep ?? null,
          ctps: func.ctps ?? null,
          status: func.status,
        },
      }, filePath)

      return { success: true, data: { filePath } }
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
