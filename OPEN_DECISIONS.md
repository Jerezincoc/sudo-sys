# Decisões abertas — SUDO SYS 2.0

Nenhum agente pode resolver estes itens silenciosamente. Propostas devem apresentar alternativas, impactos, recomendação e riscos para decisão de Jeremias. Ao fechar um item, atualizar o documento temático e esta fila.

## Prioridade P0 — antes da fundação executável

### OD-001 — Comunicação UI ↔ Core

**[ABERTO]** Definir protocolo único para local, servidor próprio e cloud; contratos, versionamento, descoberta, erros, cancelamento e progresso.

**[HIPÓTESE — NÃO IMPLEMENTAR SEM DECISÃO]** ASP.NET Core REST para comandos/consultas e SignalR para progresso/eventos foi sugerido. Comparar também SSE/WebSocket/IPC onde pertinente, sem criar protocolos divergentes por topologia.

### OD-002 — Jobs e concorrência

**[ABERTO]** Definir execução de folha, PDFs, relatórios e eSocial sem bloquear a UI; filas, prioridades, cancelamento, retomada, idempotência, locks e prevenção de cálculos conflitantes.

### OD-003 — Autenticação, sessão, autorização e licença

**[ABERTO]** Definir login local/cloud, sessões, credenciais, vínculo Escritório↔licença, ativação, indisponibilidade do serviço de licença, perfis, escopo por empresa e recuperação do MASTER.

### OD-004 — Storage concreto

**[ABERTO]** Definir provedores local/rede/cloud, layout, metadados, atomicidade com PostgreSQL, retenção, criptografia, antivírus e tratamento de arquivos grandes.

### OD-005 — Backup e restauração

**[ABERTO]** Garantir consistência entre PostgreSQL e arquivos; formatos, criptografia, agendamento, retenção, verificação, restauração granular/total e teste obrigatório de recuperação.

### OD-006 — Atualização, migrations e rollback

**[ABERTO]** Compatibilidade entre Desktop/Core/banco/módulos, ordem de atualização, migrations transacionais, interrupção, rollback, canais e assinatura de artefatos.

### OD-007 — Segurança, segredos e certificados

**[ABERTO]** Threat model, TLS, exposição do Core na LAN/cloud, secret stores, certificado A1, criptografia em trânsito/repouso, rotação, rate limiting, hardening e resposta a incidentes.

### OD-008 — Estratégia de testes

**[ABERTO]** Pirâmide/portfólio de testes, cenários dourados do motor trabalhista, propriedades/invariantes, contratos, integração PostgreSQL, E2E desktop/web, regressão visual, performance e dados de teste.

### OD-009 — Estrutura do repositório e CI/CD

**[ABERTO]** Monorepo ou separação, layout .NET/React/Tauri, ownership, checks obrigatórios, plataformas de build, releases, artefatos, assinatura e política de branches/PRs.

### OD-010 — Versões baseline

**[ABERTO]** Versões suportadas de .NET, PostgreSQL, Node, package manager, React, TypeScript, Tauri/Rust e sistemas operacionais.

## Prioridade P1 — antes dos módulos de negócio

### OD-011 — Observabilidade e suporte

**[ABERTO]** Logs estruturados, métricas, traces, health checks, correlação de jobs, pacote diagnóstico, retenção e proteção de dados pessoais.

### OD-012 — Modelo físico de Escritório

**[ABERTO]** Banco/schema/tenant_id/instalação por Escritório, isolamento, administração, restauração e consolidação.

### OD-013 — Transações e integração entre módulos

**[ABERTO]** Fronteiras transacionais, eventos internos, consistência, outbox, leitura entre módulos e contratos versionados.

### OD-014 — Precisão monetária e temporal

**[ABERTO]** Tipos decimais, escalas, arredondamento, datas civis, timezone, competência, instante de auditoria e calendários.

### OD-015 — Privacidade, LGPD e retenção

**[ABERTO]** Papéis de tratamento, minimização, bases legais, retenção, anonimização, exportação, descarte e auditoria de acesso.

### OD-016 — Pessoa e compartilhamento entre empresas

**[ABERTO]** Escopo do cadastro, deduplicação, visibilidade, consentimento, transferência e separação de históricos em grupos/filiais.

### OD-017 — Migração e convivência com o legado

**[ABERTO]** Se haverá importação, leitura, convivência paralela, corte ou arquivamento; mapeamento, reconciliação, validação e rollback. Até decisão, preservar tudo e não migrar.

### OD-018 — Integrações externas

**[ABERTO]** eSocial, certificados, serviços governamentais, bancos, relógios de ponto, e-mail e demais integrações; responsabilidade, resiliência e versionamento.

## Prioridade P2 — detalhamento de produto/UX

- **[ABERTO] OD-019:** gramática e runtime do motor de fórmulas.
- **[ABERTO] OD-020:** modelo de acumuladores, médias e precedência de regras.
- **[ABERTO] OD-021:** estados/fechamentos de folha, férias, rescisão e 13º.
- **[ABERTO] OD-022:** governança de tabelas legais, CCTs, rubricas e vigências.
- **[ABERTO] OD-023:** formato e runtime do TecnoFormas.
- **[ABERTO] OD-024:** arquitetura de informação, comportamento do workspace e Design System.
- **[ABERTO] OD-025:** acessibilidade, internacionalização e formatos regionais.
- **[ABERTO] OD-026:** metas de desempenho, capacidade e dimensionamento por topologia.

## Template de encerramento

Ao decidir:

```text
- Status anterior: [ABERTO]
- Decisão de Jeremias: ...
- Data/hora e contexto: ...
- Alternativas rejeitadas e motivo: ...
- Documentos atualizados: ...
- Consequências e tarefas liberadas: ...
```
