# Plano aprovado — REC-0020 (INSS/IRRF/FGTS rescisórios)

- **Status:** Aprovado pelo usuário em 2026-09-16; implementado na `ACAO-0035`.
- **Motivo deste arquivo:** o plano foi perdido uma vez por `/clear` de sessão; registrado antes de codificar.

## Estado do motor (mapeado em sessão anterior — reconferir no código)

- `CalculoRescisao.ts` soma no total: saldo de salário, férias vencidas, férias proporcionais, 1/3, 13º, aviso indenizado e outros proventos.
- INSS e IRRF: digitados à mão.
- Multa FGTS: digitada à mão, informativa, fora do líquido.

## Tabela de incidência (validada contra fonte oficial)

| Verba | INSS | IRRF | FGTS |
|---|---|---|---|
| Saldo de salário | Sim | Sim (tabela mensal) | Sim |
| 13º proporcional | Sim, separado | Sim, exclusiva/separada | Sim |
| Aviso prévio indenizado | Não (STJ Tema 478) | Isento (Lei 7.713 art. 6º V) | Sim (Súmula 305 TST) |
| Férias + 1/3 | Não (Lei 8.212 art. 28 §9º d) | Isento (Súmula 386 STJ) | Não (Lei 8.036 art. 15 §6º) |

- **Teto do INSS:** não vale sobre saldo + 13º somados — Decreto 3.048/99 art. 214 §7º manda aplicar a tabela "em separado" ao 13º. Dois cálculos, dois tetos.
- **IRRF do 13º:** Lei 8.134/90 art. 16 permite deduzir o INSS do próprio 13º e dependentes. Redutor da Lei 15.270 também se aplica ao 13º (§3º).
- **Base da multa:** 40% / 20% sobre **todos** os depósitos da conta, sem descontar saques.
  - Lei 8.036/90 art. 18 §1º (lido em planalto.gov.br, 2026-09-16): "importância igual a quarenta por cento do montante de todos os depósitos realizados na conta vinculada durante a vigência do contrato de trabalho, atualizados monetariamente e acrescidos dos respectivos juros."
  - Decreto 99.684/90 art. 9º §1º (idem): mesma redação, "não sendo permitida, para este fim a dedução dos saques ocorridos". §3º: computam-se os depósitos do mês da rescisão e do imediatamente anterior.
  - Nenhuma das duas exclui depósito por origem nem menciona aviso prévio.
  - Saldo FGTS continua sendo campo **informado** pelo usuário (o sistema não acessa a conta CAIXA).

## Decisão: FGTS do aviso indenizado na base da multa

- **Incluir**, junto com os demais depósitos, sem exceção.
- OJ 42 II SBDI-1/TST (literal): "O cálculo da multa de 40% do FGTS deverá ser feito com base no saldo da conta vinculada na data do efetivo pagamento das verbas rescisórias, desconsiderada a projeção do aviso prévio indenizado, por ausência de previsão legal." Trata de critério temporal (data do saldo), não de exclusão do depósito por origem.
- **Contestada / sem tese firmada no TST:** RR-1001438-06.2018.5.02.0043 excluiu "a incidência da multa de 40% do FGTS sobre o aviso prévio indenizado" com fundamentação pouco clara; há crítica publicada apontando conflito com a Súmula 305. O comportamento implementado segue a prática operacional da CAIXA (manual de recolhimentos rescisórios), não uma tese fixada. Registrar em `REC-0021` no mesmo padrão do Tema 96 (`REC-0019`).
- UI/PDF: sinalizar discretamente (nota/tooltip, no padrão visual de avisos informativos já existente).

## Plano de implementação

1. **Motor** (`CalculoRescisao.ts`): reaproveitar `calcularINSS`, `calcularIRRF` e `calcularFGTS` de `CalculoFolha.ts` sem duplicar tabelas. INSS e IRRF em duas linhas: saldo de salário e 13º (separados, tetos independentes). FGTS do mês informativo; multa calculada sobre o saldo informado (incluindo o depósito do aviso). Tabelas escolhidas pela competência da data de demissão.
2. **Migration 057:** colunas `inss_decimo_terceiro`, `irrf_decimo_terceiro`, `saldo_fgts` (informado), `fgts_rescisao`. Atualizar tipo compartilhado e repositório.
3. **Handler:** repassar dependentes e regime de IRRF do funcionário ao motor.
4. **UI e PDF:** INSS e IRRF só leitura, linhas separadas para o 13º. "Multa FGTS" vira "Saldo FGTS para fins rescisórios". FGTS do mês e multa como informativos. Nota/tooltip sobre a controvérsia do aviso na base da multa.
5. **Testes:** refazer os 3 cenários originais à mão + cenário novo (d) com salário alto que gera IRRF > 0 e bate no teto do INSS no 13º.
6. **Validação real:** atualizar `cdp-rescisao-verify.mjs`, rodar o app com `--user-data-dir` descartável, conferir PDFs.
7. **Regressão:** `pnpm typecheck` e `pnpm test` (base 60 + novos).
8. **Registro:** `ACAO-0035` em `HISTORICO_AGENTES.md`; `REC-0020` → Executado; `REC-0021` nova com os 3 pontos `[A CONFIRMAR]`:
   1. FGTS do aviso na base da multa — resolvido (incluir), mantido na lista como **contestado / sem tese firmada**.
   2. "Outros proventos" — natureza desconhecida; fora das bases de INSS/IRRF/FGTS; aviso na tela.
   3. Redutor Lei 15.270 no 13º — usar valor bruto (não afeta cenários de 2025; página da Receita exigia login).

## Prévia de valores (tabelas 2025, sem dependentes — conferir contra a implementação final)

| Cenário | INSS saldo | INSS 13º | IRRF | Líquido | FGTS mês |
|---|---|---|---|---|---|
| (a) Sem justa causa | 37,50 | 179,73 | 0 | 8.466,10 | 508,00 |
| (b) Pedido de demissão | 139,23 | 179,73 | — | 4.731,04 | 324,00 |
| (c) Acordo mútuo | 145,23 | 187,23 | — | 14.867,54 | 576,00 |

## Guardrails

- Não usar `git add -A`; conferir `git status -sb` antes de começar.
- Não mexer em `REC-0019`.
