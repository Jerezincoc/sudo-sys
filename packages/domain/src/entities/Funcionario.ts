// packages/domain/src/entities/Funcionario.ts

/**
 * Regime define em qual "mundo" o funcionário vive:
 *  A = CLT oficial — exige dados completos (CPF, CTPS, PIS, etc.)
 *  B = Informal / PJ / Avulso — só nome + salário são obrigatórios,
 *      sem encargos, sem registro formal, mas os cálculos de custo
 *      ainda rodam internamente para estimativa do empregador.
 */
export type Regime = 'A' | 'B';

/** Campos exclusivos da Folha A (CLT oficial). Todos opcionais no tipo
 *  pois a Folha B não os usa — mas o use-case de CreateFuncionario
 *  deve validar que estão presentes quando regime === 'A'. */
export interface DadosCLT {
  cpf?: string;
  ctps?: string;          // número da carteira
  ctpsSerie?: string;
  pis?: string;
  emailPessoal?: string;
  admissaoData?: string;  // ISO date YYYY-MM-DD
  desligamentoData?: string;
  cargo?: string;
}

export interface Funcionario {
  id: string;
  empresaId: string;

  /** A ou B — determina regras de validação, campos visíveis e cálculos. */
  regime: Regime;

  nome: string;

  /** Salário base em centavos (Money). Obrigatório nos dois regimes. */
  salarioMensal: number;
  salarioPorHora: number;

  /** Dados adicionais obrigatórios apenas na Folha A. */
  dadosClt?: DadosCLT;

  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Guards
// ────────────────────────────────────────────────────────────────────────────

export function isFolhaA(f: Funcionario): boolean {
  return f.regime === 'A';
}

export function isFolhaB(f: Funcionario): boolean {
  return f.regime === 'B';
}

// ────────────────────────────────────────────────────────────────────────────
// Factory
// ────────────────────────────────────────────────────────────────────────────

export function createFuncionario(
  data: Omit<Funcionario, 'createdAt' | 'updatedAt'>
): Funcionario {
  return {
    ...data,
    ativo: data.ativo ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
