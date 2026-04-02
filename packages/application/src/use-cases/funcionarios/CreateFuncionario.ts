// packages/application/src/use-cases/funcionarios/CreateFuncionario.ts
import type { FuncionarioRepository } from '../../ports/repositories/FuncionarioRepository';
import type { CreateFuncionarioDTO, FuncionarioDTO } from '../../dto/FuncionarioDTO';
import { ValidationError } from '@sudo-sys/shared';
import { v4 as uuid } from 'uuid';

export class CreateFuncionario {
  constructor(private readonly repo: FuncionarioRepository) {}

  async execute(dto: CreateFuncionarioDTO): Promise<FuncionarioDTO> {
    // ── Validações comuns ──────────────────────────────────────────────────
    if (!dto.nome?.trim())       throw new ValidationError('nome', 'Nome é obrigatório');
    if (!dto.empresaId)          throw new ValidationError('empresaId', 'Empresa é obrigatória');
    if (dto.salarioMensal < 0)   throw new ValidationError('salarioMensal', 'Salário inválido');
    if (!['A','B'].includes(dto.regime))
      throw new ValidationError('regime', 'Regime deve ser A ou B');

    // ── Validações exclusivas da Folha A ───────────────────────────────────
    if (dto.regime === 'A') {
      const clt = dto.dadosClt;
      if (clt?.cpf && !isValidCpf(clt.cpf))
        throw new ValidationError('cpf', 'CPF inválido');
      if (clt?.pis && !/^\d{11}$/.test(clt.pis.replace(/\D/g, '')))
        throw new ValidationError('pis', 'PIS inválido');
    }

    const now = new Date().toISOString();
    const funcionario: FuncionarioDTO = {
      id:             uuid(),
      empresaId:      dto.empresaId,
      regime:         dto.regime,
      nome:           dto.nome.trim(),
      salarioMensal:  dto.salarioMensal,
      salarioPorHora: dto.salarioPorHora ?? 0,
      ativo:          true,
      dadosClt:       dto.regime === 'A' ? dto.dadosClt : undefined,
      createdAt:      now,
      updatedAt:      now,
    };

    await this.repo.create(funcionario);
    return funcionario;
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  const calc = (factor: number) =>
    digits.slice(0, factor - 1).split('').reduce((acc, d, i) => acc + Number(d) * (factor - i), 0);
  const mod = (n: number) => ((n * 10) % 11) % 10;
  return mod(calc(10)) === Number(digits[9]) && mod(calc(11)) === Number(digits[10]);
}
