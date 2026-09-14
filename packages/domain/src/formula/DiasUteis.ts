/**
 * Conta os dias úteis (segunda a sexta) de uma competência "AAAA-MM" — mesma
 * convenção de string usada em `folha_competencias.competencia` e em
 * `diasDoMes()`/`salarioDia()` (`packages/infrastructure/CalculoFolha.ts`).
 *
 * Não considera feriados — nenhuma fonte de feriados (nacional/municipal)
 * existe hoje no projeto; isso ficaria para quem integrar a variável
 * DIAS_UTEIS de verdade, se for necessário.
 */
export function contarDiasUteis(competencia: string): number {
  const [ano, mes] = competencia.split('-').map(Number)
  const totalDias = new Date(ano, mes, 0).getDate()

  let uteis = 0
  for (let dia = 1; dia <= totalDias; dia++) {
    const diaSemana = new Date(ano, mes - 1, dia).getDay()
    if (diaSemana !== 0 && diaSemana !== 6) uteis++
  }
  return uteis
}
