# Linha do tempo dos agentes — SUDO SYS 2.0

Registro **append-only** exclusivo do reinício 2.0. Não substituir, reordenar, resumir nem corrigir silenciosamente entradas antigas. Correções são novas entradas que referenciam a anterior.

## Formato obrigatório

```text
## AAAA-MM-DDTHH:mm:ss±HH:mm — agente — resumo curto

- Branch: nome
- Ação/tarefa: objetivo e resultado
- Arquivos afetados: lista ou "nenhum"
- Testes/validações: comandos/verificações e resultados
- Commit: hash, "HEAD desta entrada", "não houve" ou motivo
- Decisões/pendências: decisões registradas, dúvidas e bloqueios
- Próximo passo: ação segura recomendada
```

Regras:

- usar data/hora ISO 8601 com timezone real do ambiente;
- registrar início e encerramento de toda tarefa material;
- não incluir segredos, dados pessoais ou saídas extensas;
- nunca usar a timeline como substituta dos documentos de decisão;
- commits posteriores não reescrevem entradas anteriores.

## Entradas

## 2026-10-23T00:00:00-03:00 — Claude — assume coordenação e zera a timeline

- Branch: `chore/limpa-timeline`
- Ação/tarefa: por instrução de Jeremias, Claude assume a coordenação do projeto e Codex passa a atuar como agente executor delegado (commit/push só sob delegação de Claude); entradas anteriores da timeline removidas a pedido (permanecem no histórico git); branches remotas antigas já ausentes no `origin` (limpeza de refs com `fetch --prune`); cópias locais das branches antigas preservadas como `backup/*`
- Arquivos afetados: `AGENT_TIMELINE.md`
- Testes/validações: `git ls-remote` confirma `origin` só com `main` e tags
- Commit: HEAD desta entrada
- Decisões/pendências: pendente atualizar `ARCHITECTURE_DECISIONS.md` e `ENVIRONMENT.md` com OD-001 a OD-026
- Próximo passo: Claude propor e delegar a atualização dos documentos de arquitetura e ambiente
## 2026-10-23T00:00:00-03:00 — Claude — ARCHITECTURE_DECISIONS e ENVIRONMENT refletem OD-001 a OD-026

- Branch: `docs/atualiza-arquitetura-ambiente`
- Ação/tarefa: incorporou as decisões fechadas ao `ARCHITECTURE_DECISIONS.md` (AD-001 a AD-009 anotados, novo AD-010, "Não decisões" reduzida) e ao `ENVIRONMENT.md` (Tier 1/2, TLS, monorepo); sem criar decisão nova
- Arquivos afetados: `ARCHITECTURE_DECISIONS.md`, `ENVIRONMENT.md`, `AGENT_TIMELINE.md`
- Testes/validações: revisão do diff; sem validação automatizada de links
- Commit: HEAD desta entrada
- Decisões/pendências: versões exatas (.NET, PostgreSQL, Node, Rust), estrutura do monorepo e CI/CD continuam abertos
- Próximo passo: Jeremias priorizar WS-00/WS-01 (ADRs de detalhe e ambiente reproduzível)
## 2026-10-23T00:00:00-03:00 — Claude — WS-01: instala .NET 10 e PostgreSQL 18 na máquina de Jeremias

- Branch: `docs/ws01-baseline-ambiente`
- Ação/tarefa: instalou via winget .NET SDK 10.0.402 e PostgreSQL 18.6 (serviço local, porta 5432); registrou a proposta de baseline em `ENVIRONMENT.md` §5.1
- Arquivos afetados: `ENVIRONMENT.md`, `AGENT_TIMELINE.md`
- Testes/validações: `dotnet --list-sdks` = 10.0.402; `psql` conecta e retorna PostgreSQL 18.6; serviço Running
- Commit: HEAD desta entrada
- Decisões/pendências: confirmar baseline; Node 24 LTS e Docker não instalados; senha do superusuário de dev está em arquivo local fora do repositório
- Próximo passo: Jeremias confirmar versões; depois definir estrutura do monorepo (WS-01/WS-02)
## 2026-10-23T00:00:00-03:00 — Claude — baseline aprovado e Node 24 instalado

- Branch: `docs/confirma-baseline`
- Ação/tarefa: Jeremias aprovou .NET 10 LTS, PostgreSQL 18 e Node 24 LTS; instalou fnm + Node 24.22.1 sem alterar o Node 20 do legado; `ENVIRONMENT.md` atualizado
- Arquivos afetados: `ENVIRONMENT.md`, `AGENT_TIMELINE.md`
- Testes/validações: `fnm exec --using=24 node --version` = v24.22.1; `node --version` do sistema = v20.20.0
- Commit: HEAD desta entrada
- Decisões/pendências: estrutura do monorepo e CI/CD abertas; versão do pnpm 2.0 pendente
- Próximo passo: aprovar proposta de estrutura do monorepo
## 2026-10-23T00:00:00-03:00 — Claude — estrutura do monorepo e documentos movidos para docs/

- Branch: `chore/estrutura-monorepo`
- Ação/tarefa: Jeremias aprovou a estrutura do monorepo e a mudança dos `.md` para `docs/`; criado o esqueleto vazio (`src/{core,api,ui,desktop}`, `tests`, `tools`), `global.json` (.NET 10.0.402), `.node-version` (24.22.1), `pnpm-workspace.yaml`, `.gitignore` e README raiz
- Arquivos afetados: `docs/*.md` (movidos com `git mv`; só `AGENT_PROTOCOL.md` teve o caminho `docs/` corrigido), arquivos de manifesto na raiz
- Testes/validações: links relativos entre os `.md` mantidos por mudarem juntos; nenhum projeto .NET ou pacote criado ainda
- Commit: HEAD desta entrada
- Decisões/pendências: CI/CD, versão do pnpm do 2.0 e solução .NET inicial ainda abertas
- Próximo passo: definir solução .NET inicial e CI (WS-01/WS-02)
## 2026-10-23T00:00:00-03:00 — Claude — WS-02: solução .NET inicial

- Branch: `feat/ws02-solucao-dotnet-inicial`
- Ação/tarefa: criada `SudoSys.slnx` com `SudoSys.SharedKernel` (src/core), `SudoSys.Api` (src/api, host ASP.NET Core com `/health`) e `SudoSys.ArchitectureTests` (tests); `Directory.Build.props` com net10.0, nullable e warnings como erro; um teste de arquitetura garante que o SharedKernel não referencia ASP.NET Core, Npgsql, EF Core nem a Api
- Arquivos afetados: `SudoSys.slnx`, `Directory.Build.props`, `src/core/SudoSys.SharedKernel`, `src/api/SudoSys.Api`, `tests/SudoSys.ArchitectureTests`
- Testes/validações: `dotnet build` 0 avisos/0 erros; `dotnet test` 1/1 aprovado; `GET /health` retornou Healthy
- Commit: HEAD desta entrada
- Decisões/pendências: nenhum módulo de negócio criado, pois o mapa de módulos (AD-004) segue [ABERTO]; REST de negócio, SignalR, EF/acesso a dados e conteúdo do SharedKernel (dinheiro, competência — OD-014) ainda não implementados
- Próximo passo: fechar o mapa de módulos e o padrão de camadas por módulo (Domain/Application/Infrastructure + Contracts), depois criar o primeiro módulo
## 2026-10-23T00:00:00-03:00 — Claude — guia de convenções e code-review-graph

- Branch: `docs/guia-convencoes`
- Ação/tarefa: criado `docs/CONVENTIONS.md`; instalado `code-review-graph` 2.3.9 (pip) configurado para Claude Code, com grafo da solução construído (6 nós, 17 arestas, C#); `.gitignore` ignora `.code-review-graph/`
- Arquivos afetados: `docs/CONVENTIONS.md`, `docs/README.md`, `.gitignore`, `docs/AGENT_TIMELINE.md`
- Testes/validações: `code-review-graph build` e `status` executados com sucesso
- Commit: HEAD desta entrada
- Decisões/pendências: `.mcp.json`, `.claude/` e `skills-lock.json` ficam fora do repositório (excluídos localmente) por conterem caminhos da máquina; estrutura de 4 projetos por módulo é convenção proposta, a confirmar com o mapa de módulos
- Próximo passo: fechar o mapa de módulos
## 2026-10-23T00:00:00-03:00 — Claude — AD-011 (mapa inicial de módulos) e fluxos de agentes

- Branch: `docs/ad-011-modulos-e-fluxos`
- Ação/tarefa: Jeremias aprovou a ordem Identidade → Escritórios/Empresas → Pessoas/Vínculos; registrado AD-011; criado `docs/AGENT_WORKFLOWS.md` com ideias genéricas (contrato de tarefa, ondas paralelas, revisão, segurança, tamanho de arquivo) lidas do `vibe-coding-toolkit`, sem instalar nada dele
- Arquivos afetados: `docs/ARCHITECTURE_DECISIONS.md`, `docs/AGENT_WORKFLOWS.md`, `docs/README.md`, `docs/AGENT_TIMELINE.md`
- Testes/validações: revisão do diff
- Commit: HEAD desta entrada
- Decisões/pendências: dependências permitidas entre módulos serão definidas ao criar cada um
- Próximo passo: Codex cria o esqueleto do módulo Identidade (4 projetos, sem regra de negócio)
## 2026-10-23T00:00:00-03:00 — Claude (coordenador) / Codex (executor) — esqueleto do módulo Identidade

- Branch: `feat/identity-esqueleto`
- Ação/tarefa: Codex (CLI, sandbox workspace-write, sem commit) criou os 4 projetos `SudoSys.Identity.{Domain,Application,Infrastructure,Contracts}` e testes de arquitetura; Claude revisou e substituiu as checagens por reflexão (que passavam sem validar nada, pois o compilador omite referências não usadas) por leitura das `ProjectReference` dos `.csproj`; removido `PropertyGroup` vazio do Contracts
- Arquivos afetados: `src/core/Identity/*`, `SudoSys.slnx`, `tests/SudoSys.ArchitectureTests/*`
- Testes/validações: build 0 avisos/0 erros; 9 testes aprovados; adicionando temporariamente Domain→Infrastructure, 1 teste falhou como esperado (revertido)
- Commit: HEAD desta entrada
- Decisões/pendências: nenhuma regra de negócio criada; modelo de usuário/papéis, tokens, ORM e hash de senha seguem [ABERTO] a detalhar (OD-003)
- Próximo passo: detalhar OD-003 em proposta (usuário, papéis, sessão) antes de implementar Identidade
