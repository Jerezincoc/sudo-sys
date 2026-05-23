import type { EmpresaRepository } from '../../ports'; export class ListEmpresas { constructor(private repo: EmpresaRepository) {} async execute() { return this.repo.findAll() } }
