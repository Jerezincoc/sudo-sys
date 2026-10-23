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
