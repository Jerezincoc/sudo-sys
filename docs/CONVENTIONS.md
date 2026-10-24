# Convenções de código — SUDO SYS 2.0

Guia curto para humanos e agentes. Objetivo: código fácil de entender e de manter. Em dúvida, escolha a opção mais simples que passe nos testes. Este guia aplica as decisões de [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) e [OPEN_DECISIONS.md](OPEN_DECISIONS.md); não as substitui.

## 1. Princípios

1. **Simples primeiro.** Sem abstração, interface ou configuração "para o futuro". Uma interface só existe quando isola regra de negócio de infraestrutura (porta) ou quando há mais de uma implementação real.
2. **Mudança cirúrgica.** Cada commit toca só o que a tarefa pede. Sem reformatar nem renomear em massa de passagem.
3. **Nome diz a intenção.** Se precisa de comentário para explicar o que o código faz, renomeie ou extraia. Comentário explica o **porquê** (regra legal, decisão, armadilha), nunca o "o quê".
4. **Funções pequenas.** Uma razão para mudar por classe; um nível de abstração por método.
5. **Falhe cedo e alto.** Entradas inválidas em fronteira (API, importação); dentro do domínio, invariantes garantidas por construção.

## 2. Estrutura e dependências

- Monorepo conforme [README](../README.md). Código do Core em `src/core`, host em `src/api`, testes em `tests`.
- Cada módulo de negócio tem quatro projetos: `Domain`, `Application`, `Infrastructure` e `Contracts`. A dependência aponta sempre para dentro: Infrastructure → Application → Domain. `Contracts` é a única parte que outros módulos podem referenciar.
- Módulo nunca lê tabela, classe interna ou tipo de `Domain`/`Infrastructure` de outro módulo (OD-013). Comunicação por `Contracts`, eventos internos e outbox.
- `SharedKernel` guarda só o que todos os módulos realmente compartilham (tipos monetários, competência, abstrações de evento). Não é depósito de utilitários.
- O ponto de composição (injeção de dependências) fica em `src/api`. Nada interno busca suas dependências em contêiner global.
- Domínio e aplicação não referenciam ASP.NET, EF Core, Npgsql nem APIs exclusivas de Windows. Testes de arquitetura em `tests/SudoSys.ArchitectureTests` travam isso e crescem junto com os módulos.

## 3. C#

- `net10.0`, `Nullable` habilitado, avisos tratados como erro (`Directory.Build.props`). Não desligar regra para fazer o build passar; corrigir a causa.
- Código em inglês técnico, no estilo .NET (PascalCase tipos/métodos, camelCase locais, `_campo` privado). Termos do domínio trabalhista ficam em português quando não há tradução estável (`Competencia`, `Rubrica`, `Vinculo`) e usados de forma consistente.
- Dinheiro é sempre `decimal`, nunca `float`/`double`. Arredondamento só pela política central (OD-014).
- Competência e data civil são tipos próprios, separados de `DateTime`/`DateTimeOffset`. Timestamps de auditoria em UTC (OD-014).
- Preferir `record`/imutabilidade para valores; entidades mudam estado por métodos que protegem invariantes, sem setters públicos.
- Exceção para erro excepcional; resultado explícito para falha de negócio esperada (validação, regra violada). Não usar exceção como fluxo normal.
- `async` de ponta a ponta com `CancellationToken`; nunca `.Result`/`.Wait()`.
- Sem `static` mutável, sem relógio direto (`DateTime.Now`): injetar um `TimeProvider`.

## 4. Banco de dados

- PostgreSQL, modelagem relacional; JSONB não substitui modelagem (AD-006).
- Toda tabela de negócio carrega `office_id` (OD-012). Acesso sempre filtrado pelo escritório.
- Migrations versionadas e revisadas; mudança destrutiva exige backup (OD-006). Dado histórico respeita vigência e nunca é reescrito (OD-022).

## 5. Testes

- Teste primeiro quando for regra de negócio (red → green → refactor).
- Cálculo trabalhista tem **golden tests** com valores conferidos por fonte legal citada no teste (OD-008).
- Integração usa PostgreSQL real, não banco em memória.
- Nome do teste descreve o comportamento, em português ou inglês, sem sublinhados forçados pelo analisador.
- Um teste de arquitetura novo acompanha cada regra de dependência nova.

## 6. Git e trabalho de agentes

- Uma branch por tarefa a partir da `main` atualizada: `feat/`, `fix/`, `docs/`, `chore/`. Nunca commitar direto na `main`.
- Commit pequeno, mensagem no imperativo explicando o motivo. Sem arquivos fora do escopo.
- Antes de concluir: `dotnet build` e `dotnet test` sem avisos/falhas, diff revisado, entrada na [AGENT_TIMELINE.md](AGENT_TIMELINE.md).
- Agente executor (Codex) só faz commit/push quando o coordenador (Claude) delegar; merge na `main` só com autorização de Jeremias ou do coordenador.
- Item **[ABERTO]** nunca é decidido por agente: documente a dúvida e pergunte (ver [AGENT_PROTOCOL.md](AGENT_PROTOCOL.md)).

## 7. Revisão

Antes de pedir merge, passar pela lista: dependências só para dentro? algum comentário que só repete o código? abstração sem uso real? `decimal` e `TimeProvider` onde cabem? teste cobre o comportamento novo? Se qualquer resposta for "não", corrigir antes.
