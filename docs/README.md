# SUDO SYS 2.0 — índice documental

Esta pasta é a fonte de entrada do reinício do SUDO SYS 2.0. Ela registra o que foi decidido do zero, o que continua aberto e como agentes humanos e de IA devem colaborar antes de qualquer implementação.

> O código, os documentos e as decisões anteriores fora desta pasta descrevem o sistema legado. Eles podem ser consultados para inventário e preservação, mas **não são fonte de verdade funcional ou arquitetural do SUDO SYS 2.0**.

## Ordem de leitura obrigatória

1. [HANDOFF_SUDO_SYS_2.md](HANDOFF_SUDO_SYS_2.md) — contexto mestre e orientação de entrada.
2. [AGENT_PROTOCOL.md](AGENT_PROTOCOL.md) — regras obrigatórias de colaboração.
3. [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) — decisões e limites funcionais.
4. [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) — arquitetura aprovada e separação do legado.
5. [UI_UX_DIRECTION.md](UI_UX_DIRECTION.md) — direção visual e estrutural aprovada.
6. [ENVIRONMENT.md](ENVIRONMENT.md) — ambiente, versões e topologias.
7. [OPEN_DECISIONS.md](OPEN_DECISIONS.md) — decisões que não podem ser presumidas.
8. [WORKSTREAMS.md](WORKSTREAMS.md) — decomposição futura, dependências e bloqueios.
9. [AGENT_TIMELINE.md](AGENT_TIMELINE.md) — registro append-only do trabalho dos agentes.

## Vocabulário de status

- **[FECHADO]**: aprovado por Jeremias e suficientemente definido no nível indicado. Só muda após discussão e registro explícito.
- **[PARCIALMENTE FECHADO]**: a direção foi aprovada, mas detalhes relevantes permanecem abertos. Implementar apenas a parte claramente fechada.
- **[ABERTO]**: ainda requer decisão. Nenhum agente pode escolher silenciosamente.
- **[HIPÓTESE — NÃO IMPLEMENTAR SEM DECISÃO]**: alternativa, exemplo ou sugestão em estudo; não é requisito nem autorização de implementação.

O status vale para o escopo exato da afirmação. Um tema pode conter partes fechadas e abertas.

## Autoridade e manutenção

- Em conflito, os documentos desta pasta prevalecem para o 2.0; o conflito deve ser registrado e levado a Jeremias.
- Uma conversa, protótipo ou implementação do legado não altera estes documentos automaticamente.
- Toda nova decisão deve atualizar o documento temático, [OPEN_DECISIONS.md](OPEN_DECISIONS.md) quando aplicável e [AGENT_TIMELINE.md](AGENT_TIMELINE.md).
- Links internos devem permanecer relativos para funcionar no GitHub e em checkouts locais.
