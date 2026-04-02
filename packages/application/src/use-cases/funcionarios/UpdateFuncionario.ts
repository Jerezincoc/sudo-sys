// packages/application/src/use-cases/funcionarios/UpdateFuncionario.ts
import type { FuncionarioRepository } from '../../ports/repositories/FuncionarioRepository';
import type { UpdateFuncionarioDTO, FuncionarioDTO } from '../../dto/FuncionarioDTO';
import { ValidationError } from '@sudo-sys/shared';

export class UpdateFuncionario {
  constructor(private readonly repo: FuncionarioRepository) {}

  async execute(dto: UpdateFuncionarioDTO): Promise<FuncionarioDTO> {
    const existing = await this.repo.findById(dto.id);
    if (!existing) throw new ValidationError('id', 'Funcionário não encontrado');

    // regime é imutável após criação
    const updated: FuncionarioDTO = {
      ...existing,
      nome:           dto.nome?.trim()      ?? existing.nome,
      salarioMensal:  dto.salarioMensal     ?? existing.salarioMensal,
      salarioPorHora: dto.salarioPorHora    ?? existing.salarioPorHora,
      ativo:          dto.ativo             ?? existing.ativo,
      dadosClt: existing.regime === 'A'
        ? { ...existing.dadosClt, ...dto.dadosClt }
        : undefined,
      updatedAt: new Date().toISOString(),
    };

    await this.repo.update(updated);
    return updated;
  }
}
