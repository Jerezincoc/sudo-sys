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

## 2026-09-29T13:49:31-03:00 — Codex — fundação documental do reinício

- Branch: `docs/sudo-sys-2-foundation`, criada a partir de `main` atualizada em `ed8da1141a052ed9c8f4f2eebc99bfdb7e52f17d`
- Ação/tarefa: inspecionou repositório, documentação e ambiente; criou a fonte de verdade modular do SUDO SYS 2.0 sem alterar funcionalidades nem o legado
- Arquivos afetados: somente `docs/sudo-sys-2/*.md`
- Testes/validações: validação de links Markdown relativos, status permitidos, consistência cruzada, escopo do diff e whitespace; resultado registrado no encerramento da tarefa
- Commit: `HEAD desta entrada`
- Decisões/pendências: nenhuma decisão aberta foi fechada; REST/SignalR e demais sugestões permanecem abertas; ZIP de UI/UX apenas referenciado, não copiado
- Próximo passo: Jeremias priorizar as decisões em [OPEN_DECISIONS.md](OPEN_DECISIONS.md) antes de autorizar fundação de código

## 2026-09-29T13:55:37-03:00 — Codex — validação e encerramento documental

- Branch: `docs/sudo-sys-2-foundation`
- Ação/tarefa: revisou a fundação documental, a separação entre legado e 2.0 e a cobertura do escopo solicitado
- Arquivos afetados: somente `docs/sudo-sys-2/*.md`
- Testes/validações: 10 Markdown; 33 links relativos resolvidos; 238 usos de status pertencentes ao vocabulário permitido; todos os tópicos mínimos encontrados; `git diff --check` sem erro; escopo Git limitado à nova pasta
- Commit: `HEAD desta entrada`
- Decisões/pendências: nenhuma; permanecem as decisões listadas em [OPEN_DECISIONS.md](OPEN_DECISIONS.md)
- Próximo passo: revisão de Jeremias e priorização de OD-001 a OD-010; não iniciar implementação antes disso

## 2026-09-29T00:00:00-03:00 — Claude — reinício de histórico e fechamento de OD-001 a OD-026

- Branch: `main` (aviso: entrada registrada em desacordo com AGENT_PROTOCOL.md §2.2, que exige branch própria; trabalho conduzido diretamente por instrução explícita de Jeremias)
- Ação/tarefa: (1) a pedido de Jeremias, reset completo do repositório Git — histórico local e remoto apagados, todas as branches (locais e `origin`) removidas exceto `main`, que passou a ter um único commit-raiz preservando os arquivos então presentes no disco; (2) leitura da fundação documental completa (10 Markdown na raiz); (3) Jeremias forneceu decisões para OD-001 a OD-026 em texto livre ao final de [OPEN_DECISIONS.md](OPEN_DECISIONS.md); reorganizei essas decisões nas seções correspondentes, trocando o status de cada item de **[ABERTO]** para **[FECHADO]**
- Arquivos afetados: `OPEN_DECISIONS.md` (reescrito); histórico Git local e remoto (`origin`) integralmente substituído
- Testes/validações: revisão visual da reorganização; nenhuma validação automatizada de links/status executada nesta entrada
- Commit: não houve commit desta alteração até o momento desta entrada
- Decisões/pendências: OD-001 a OD-026 registradas como **[FECHADO]** conforme texto de Jeremias, porém sem o detalhamento de alternativas rejeitadas exigido pelo template de encerramento (seção não preenchida por falta da informação); [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) e [ENVIRONMENT.md](ENVIRONMENT.md) ainda não refletem essas decisões (ex.: OD-009 monorepo, OD-010 Windows Tier 1) — pendente de autorização para atualizar
- Próximo passo: Jeremias confirmar se `ARCHITECTURE_DECISIONS.md` e `ENVIRONMENT.md` devem ser atualizados para refletir OD-001–OD-026; considerar recriar fluxo de branch própria para os próximos trabalhos, conforme protocolo
