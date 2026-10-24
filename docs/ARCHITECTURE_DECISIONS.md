# Decisões de arquitetura — SUDO SYS 2.0

Somente decisões aprovadas aparecem como fechadas. Sugestões tecnicamente plausíveis continuam abertas até decisão explícita.

## AD-001 — Produto único, topologia configurável

**[FECHADO]** O mesmo produto deve operar em três topologias:

1. local/individual: Desktop, Core, banco e arquivos na mesma máquina;
2. servidor próprio: clientes acessam um Core hospedado na rede do escritório;
3. cloud: clientes acessam Core, banco e storage hospedados.

**[FECHADO]** A diferença é implantação/configuração vinculada à oferta/licença, não uma bifurcação funcional do produto.

**[ABERTO]** Descoberta do Core, configuração, provisionamento, modo offline e matriz exata de recursos por licença.

**[FECHADO]** (OD-001) REST (ASP.NET Core) e SignalR são o único protocolo UI↔Core nas três topologias.

## AD-002 — Fonte autoritativa por Escritório

**[FECHADO]** Em cada Escritório existe uma única fonte autoritativa de dados por vez. Clientes não mantêm cópias concorrentes que depois sejam fundidas como iguais.

**[FECHADO]** Na topologia local, a fonte fica na máquina; no servidor próprio, no servidor; na cloud, no ambiente hospedado.

**[FECHADO]** (OD-012) Isolamento lógico por `office_id`/tenant_id, PostgreSQL central por instalação, preparado para isolamento físico futuro sem obrigá-lo agora.

**[ABERTO]** Replicação para disponibilidade, cache, leitura offline e recuperação de desastre.

## AD-003 — Core/API separado da UI

**[FECHADO]** Regra de negócio, casos de uso, cálculos e acesso a dados residem no Core, separados da interface.

**[FECHADO]** A UI não acessa PostgreSQL diretamente nem contém regra trabalhista como autoridade.

**[FECHADO]** O contrato com o Core deve permitir que a mesma UI opere contra Core local, de rede ou cloud.

**[FECHADO]** (OD-001) Protocolo: REST (ASP.NET Core) para comandos/consultas e SignalR para progresso/eventos.

**[ABERTO]** Formato detalhado do contrato (versionamento de API, esquema de erros, geração de clientes).

## AD-004 — Monólito modular

**[FECHADO]** O Core inicia como monólito modular, não como microserviços.

**[FECHADO]** Módulos possuem fronteiras fortes, contratos explícitos, regras separadas da infraestrutura e testes próprios. Um módulo não consulta tabelas internas de outro como atalho.

**[PARCIALMENTE FECHADO]** Domínios candidatos incluem Identidade, Escritórios, Empresas, Pessoas, Folha, Férias, Rescisão, 13º, Benefícios, Jornada/Ponto, Sindicato/CCT, eSocial, Documentos/TecnoFormas e Auditoria.

**[FECHADO]** (OD-013) Transação dentro do módulo; contratos explícitos entre módulos; eventos internos; outbox para efeitos externos; nenhum módulo consulta tabela privada de outro.

**[ABERTO]** Mapa definitivo de módulos, dependências permitidas e versionamento independente.

## AD-005 — C#/.NET no Core

**[FECHADO]** O Core será construído em C#/.NET moderno e multiplataforma.

**[FECHADO]** Domínio e aplicação não dependem diretamente de APIs exclusivas de Windows. Integrações de plataforma ficam atrás de abstrações.

**[FECHADO]** (OD-010, OD-014) Versões estáveis fixadas, priorizando LTS; Windows Tier 1 no lançamento, macOS/Linux Tier 2. `decimal` para dinheiro, política central de arredondamento, competência/data civil separada de timestamp, auditoria em UTC.

**[ABERTO]** Versão exata do .NET, modelo de hosting, ORM/acesso a dados e bibliotecas.

## AD-006 — PostgreSQL

**[FECHADO]** PostgreSQL é o banco de dados oficial do SUDO SYS 2.0 nas topologias local, servidor próprio e cloud.

**[FECHADO]** Dados estruturados de folha, vínculos, rubricas, vigências e cálculos são relacionais; JSONB não será um atalho para evitar modelagem.

**[FECHADO]** (OD-006) Migrations versionadas, compatibilidade verificada antes da atualização, backup obrigatório antes de mudança destrutiva, rollback sem depender cegamente de "down migration".

**[ABERTO]** Versão exata, instalação local, provedores cloud, pooling, alta disponibilidade e criptografia em repouso.

## AD-007 — React + TypeScript na UI

**[FECHADO]** A interface será construída com React e TypeScript, permitindo desktop e futuro acesso web quando aplicável.

**[FECHADO]** O Design System SUDO será próprio; bibliotecas podem oferecer primitivas, acessibilidade e comportamento sem impor identidade visual genérica.

**[FECHADO]** (OD-024, OD-025) Proposta 2 como base visual, Design System próprio com tokens, abas + janelas contextuais + painéis; acessibilidade desde os componentes-base; pt-BR inicial sem textos/formatos hardcoded.

**[ABERTO]** Versões, bundler, bibliotecas, gerenciamento de estado, grid, editor e estratégia de compartilhamento desktop/web.

## AD-008 — Tauri como shell desktop

**[FECHADO]** Tauri é a casca desktop e ponte com recursos do sistema operacional.

**[FECHADO]** Nenhuma regra de negócio do SUDO deve migrar para Rust/Tauri. A autoridade permanece no Core .NET.

**[ABERTO]** Versão, ciclo de vida do Core local, integração de arquivos/impressão/certificados, atualizador e assinatura dos binários.

## AD-009 — Storage abstrato

**[FECHADO]** Documentos, XMLs, anexos, CCTs e artefatos não dependem de um provedor concreto no domínio. O Core usa contratos de storage.

**[FECHADO]** (OD-004) Abstração única; filesystem local/rede e object storage cloud como providers intercambiáveis; banco guarda metadados/referências, nunca caminhos espalhados pelo domínio; escrita atômica e hash dos arquivos.

**[ABERTO]** Layout de chaves, versionamento, retenção, criptografia e consistência detalhada com o banco.

## AD-010 — Jobs, identidade, segurança e operação

**[FECHADO]** Decisões transversais aprovadas (detalhes em [OPEN_DECISIONS.md](OPEN_DECISIONS.md)):

- **OD-002 Jobs:** persistentes, com cálculo integral exclusivo por Empresa + Competência + Tipo (lock do escopo), idempotência e recuperação; sem takeover normal do lock.
- **OD-003 Identidade:** ASP.NET Core Identity, tokens com refresh controlado, RBAC LOW/MEDIUM/HIGH/MASTER com escopo de empresas; licença separada da identidade.
- **OD-005 Backup:** PostgreSQL + storage consistentes, manifesto versionado, criptografia, verificação e teste real de restauração.
- **OD-007 Segurança:** TLS fora de localhost, secret stores, certificado A1 nunca em texto puro, menor privilégio, threat model formal.
- **OD-008 Testes:** unitários, arquitetura, integração real com PostgreSQL, contrato, E2E e golden tests para cálculos trabalhistas.
- **OD-009 Repositório:** monorepo.
- **OD-011 Observabilidade:** OpenTelemetry, logs estruturados, correlação, health checks, diagnóstico sanitizado.
- **OD-015 LGPD:** privacy-by-design, minimização, retenção configurável, trilha de acesso a dados sensíveis.
- **OD-017/OD-018 Legado e integrações:** legado preservado, migração só por importadores explícitos; integrações atrás de adapters com retry, idempotência e circuit breaker.

**[ABERTO]** Detalhamento técnico de cada item (formato de tokens, política de lock, manifesto de backup, estrutura do monorepo, pipeline de CI/CD).

## AD-011 — Mapa inicial de módulos

**[FECHADO]** (Jeremias, 2026-10-23) Ordem de criação dos primeiros módulos do Core:

1. **Identidade** (OD-003): usuários, autenticação, sessão, papéis LOW/MEDIUM/HIGH/MASTER e escopo de empresas.
2. **Escritórios/Empresas** (OD-012): Escritório como tenant (`office_id`) e Empresa.
3. **Pessoas/Vínculos** (OD-016): Pessoa separada de Vínculo.

**[FECHADO]** Cada módulo tem quatro projetos — `Domain`, `Application`, `Infrastructure` e `Contracts` — com dependência apontando para dentro; módulos conversam só por `Contracts`, eventos internos e outbox (OD-013). Ver [CONVENTIONS.md](CONVENTIONS.md).

**[ABERTO]** Folha, Férias, Rescisão, 13º, Benefícios, Jornada/Ponto, Sindicato/CCT, eSocial, Documentos/TecnoFormas e Auditoria seguem como domínios candidatos (AD-004) até decisão. Dependências permitidas entre os três módulos acima serão definidas ao criar cada um.

## Não decisões

Os itens abaixo **continuam não aprovados** em nível de detalhe:

- **[ABERTO]** Versões exatas de .NET, PostgreSQL, Node, Rust e bibliotecas.
- **[ABERTO]** Mensageria externa e locks distribuídos além do definido em OD-002.
- **[ABERTO]** Estrutura final do monorepo, CI/CD, empacotamento e release.

As perguntas e critérios estão em [OPEN_DECISIONS.md](OPEN_DECISIONS.md).
