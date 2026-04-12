// packages/application/src/use-cases/chamados/CreateChamado.ts
import type { ChamadoRepository } from '../../ports/repositories/ChamadoRepository';
import type { CreateChamadoDTO, ChamadoDTO } from '../../dto/ChamadoDTO';
import { createChamado } from '@sudo/domain';
import { ValidationError } from '@sudo/shared';
import { v4 as uuid } from 'uuid';

export class CreateChamado {
  constructor(private readonly repo: ChamadoRepository) {}

  async execute(dto: CreateChamadoDTO): Promise<ChamadoDTO> {
    if (!dto.titulo?.trim()) throw new ValidationError('titulo', 'Título é obrigatório');
    if (!dto.descricao?.trim()) throw new ValidationError('descricao', 'Descrição é obrigatória');
    if (!dto.empresaId) throw new ValidationError('empresaId', 'Empresa é obrigatória');

    const chamado = createChamado({
      id: uuid(),
      empresaId: dto.empresaId,
      criadorId: dto.criadorId,
      titulo: dto.titulo.trim(),
      descricao: dto.descricao.trim(),
      prioridade: dto.prioridade,
    });

    await this.repo.create(chamado);

    return chamado;
  }
}
