# Handoff mestre — SUDO SYS 2.0

## 1. Finalidade

Este documento permite que Codex, Claude e outros agentes iniciem trabalho no SUDO SYS 2.0 sem depender do histórico de conversas. Ele não autoriza implementação: a fase atual é consolidar a fundação documental, resolver decisões abertas e preparar frentes independentes.

## 2. Origem do produto

**[FECHADO]** O SUDO SYS nasceu para resolver uma lacuna dos ERPs contábeis: administrar e documentar pagamentos e controles de profissionais que não estavam registrados como empregados CLT, mas ainda precisavam de recibos, registros operacionais e, quando aplicável, controles de jornada.

**[FECHADO]** A visão evoluiu para um ERP contábil, trabalhista e administrativo completo, incluindo Departamento Pessoal e relações CLT, sem abandonar o módulo e a flexibilidade para relações não-CLT.

**[FECHADO]** O público inclui escritórios/prestadores de serviços contábeis e empresas que executam suas próprias rotinas. O produto deve servir desde uma pessoa em um notebook até operações com equipe presencial e remota.

## 3. Princípios do produto

- **[FECHADO] Liberdade com orientação:** o sistema informa, recomenda, alerta e registra; a decisão operacional permanece com o profissional autorizado.
- **[FECHADO] Conformidade assistiva:** divergências normativas normalmente geram alertas e trilha de auditoria, não bloqueios arbitrários. Impossibilidades técnicas e dados indispensáveis ausentes ainda podem impedir uma operação.
- **[FECHADO] Flexibilidade por natureza da relação:** uma operação simples não deve ser obrigada a simular um vínculo CLT; um vínculo CLT deve poder usar escrituração completa.
- **[FECHADO] Histórico reproduzível:** dados legais, cadastrais e de cálculo relevantes precisam respeitar vigências e preservar o passado.
- **[FECHADO] Um produto, várias topologias:** local, servidor próprio e cloud são formas de hospedar o mesmo produto, não produtos divergentes.
- **[FECHADO] Preservação do legado:** nada do sistema antigo será apagado, reescrito ou adotado no 2.0 sem decisão explícita.

## 4. Estado atual

**[FECHADO]** A fundação tecnológica aprovada é: Core em C#/.NET multiplataforma, PostgreSQL, UI em React + TypeScript, Tauri como shell desktop, Core/API separado da UI e monólito modular com fronteiras fortes.

**[FECHADO]** A direção de UX é a Proposta 2: workspace híbrido, denso, desktop-first, com abas de trabalho, janelas contextuais e painéis laterais.

**[ABERTO]** Ainda não há autorização para criar a nova solução, migrar dados ou implementar módulos. Comunicação UI↔Core, jobs, autenticação/licença, storage concreto, backup, atualização, segurança, testes, observabilidade, estrutura final do repositório e CI/CD precisam ser decididos.

## 5. Mapa da documentação

| Documento | Papel |
|---|---|
| [README.md](README.md) | Índice, ordem de leitura e semântica dos status |
| [PRODUCT_DECISIONS.md](PRODUCT_DECISIONS.md) | Fonte de verdade funcional |
| [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) | Fonte de verdade arquitetural |
| [UI_UX_DIRECTION.md](UI_UX_DIRECTION.md) | Direção visual e comportamental |
| [ENVIRONMENT.md](ENVIRONMENT.md) | Matriz de ambiente e versões |
| [OPEN_DECISIONS.md](OPEN_DECISIONS.md) | Fila de decisões pendentes |
| [AGENT_PROTOCOL.md](AGENT_PROTOCOL.md) | Regras obrigatórias para agentes |
| [WORKSTREAMS.md](WORKSTREAMS.md) | Frentes futuras e dependências |
| [AGENT_TIMELINE.md](AGENT_TIMELINE.md) | Registro cronológico append-only |

## 6. Limite entre legado e 2.0

O repositório contém uma aplicação anterior baseada em Electron/TypeScript/SQLite e documentos como `CONTEXTO_TOTAL.md`, `DECISOES_TECNICAS.md`, `README_AMBIENTE.md`, `HISTORICO_AGENTES.md` e `docs/ROADMAP.md`. Esses materiais continuam preservados e úteis para compreender o legado, mas não autorizam decisões para o 2.0.

Em especial:

- não transportar automaticamente entidades, banco, IPC, permissões, cálculos ou estrutura de pacotes;
- não considerar funcionalidades já codificadas como requisitos aprovados do 2.0;
- não substituir PostgreSQL por SQLite nem Tauri por Electron por causa do legado;
- não editar o legado durante esta fase documental;
- tratar eventual reaproveitamento, migração ou descarte como decisão própria e explícita.

## 7. Como um agente deve começar

1. Ler todos os documentos desta pasta, começando pelo [README.md](README.md).
2. Verificar a branch, a `main` atualizada e o estado do worktree.
3. Registrar o início em [AGENT_TIMELINE.md](AGENT_TIMELINE.md).
4. Confirmar se a tarefa está liberada em [WORKSTREAMS.md](WORKSTREAMS.md) e se depende de algo em [OPEN_DECISIONS.md](OPEN_DECISIONS.md).
5. Trabalhar em branch própria, sem tocar em `main`.
6. Não preencher lacunas com preferências pessoais ou com a arquitetura antiga.
7. Encerrar com validação, commit e entrada append-only na timeline.

## 8. Questões que exigem Jeremias

Toda decisão marcada **[ABERTO]**, todo conflito entre documentos e toda alteração de item **[FECHADO]** exigem decisão explícita de Jeremias. Os primeiros temas recomendados estão priorizados em [OPEN_DECISIONS.md](OPEN_DECISIONS.md).
