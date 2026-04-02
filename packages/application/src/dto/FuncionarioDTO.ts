// packages/application/src/dto/FuncionarioDTO.ts
//
// DTOs trafegam pelo IPC (main ↔ renderer).
// Nunca exponha entidades de domínio diretamente no IPC.

export type Regime = 'A' | 'B';

// ─── Dados exclusivos da Folha A (CLT oficial) ────────────────────────────────
// Todos opcionais no tipo — o use-case valida presença quando regime === 'A'
export interface DadosCLTDTO {
  cpf?:             string;   // "000.000.000-00"
  ctps?:            string;   // nº carteira
  ctpsSerie?:       string;
  pis?:             string;   // "000.00000.00-0"
  emailPessoal?:    string;
  admissaoData?:    string;   // YYYY-MM-DD
  desligamentoData?: string;  // YYYY-MM-DD
  cargo?:           string;
}

// ─── DTO de leitura (vem do banco → renderer) ────────────────────────────────
export interface FuncionarioDTO {
  id:              string;
  empresaId:       string;
  regime:          Regime;
  nome:            string;
  salarioMensal:   number;   // centavos
  salarioPorHora:  number;   // centavos
  ativo:           boolean;
  dadosClt?:       DadosCLTDTO;  // presente quando regime === 'A'
  createdAt:       string;
  updatedAt:       string;
}

// ─── DTO de criação (renderer → main) ────────────────────────────────────────
export interface CreateFuncionarioDTO {
  empresaId:       string;
  regime:          Regime;
  nome:            string;
  salarioMensal:   number;   // centavos
  salarioPorHora?: number;   // centavos
  dadosClt?:       DadosCLTDTO;
}

// ─── DTO de atualização (renderer → main) ────────────────────────────────────
export interface UpdateFuncionarioDTO {
  id:              string;
  nome?:           string;
  salarioMensal?:  number;
  salarioPorHora?: number;
  ativo?:          boolean;
  dadosClt?:       Partial<DadosCLTDTO>;
  // regime NÃO pode ser alterado após criação — exige nova admissão
}
