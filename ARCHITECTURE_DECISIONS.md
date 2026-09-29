# Decisões de arquitetura — SUDO SYS 2.0

Somente decisões aprovadas aparecem como fechadas. Sugestões tecnicamente plausíveis continuam abertas até decisão explícita.

## AD-001 — Produto único, topologia configurável

**[FECHADO]** O mesmo produto deve operar em três topologias:

1. local/individual: Desktop, Core, banco e arquivos na mesma máquina;
2. servidor próprio: clientes acessam um Core hospedado na rede do escritório;
3. cloud: clientes acessam Core, banco e storage hospedados.

**[FECHADO]** A diferença é implantação/configuração vinculada à oferta/licença, não uma bifurcação funcional do produto.

**[ABERTO]** Descoberta do Core, configuração, provisionamento, modo offline e matriz exata de recursos por licença.

## AD-002 — Fonte autoritativa por Escritório

**[FECHADO]** Em cada Escritório existe uma única fonte autoritativa de dados por vez. Clientes não mantêm cópias concorrentes que depois sejam fundidas como iguais.

**[FECHADO]** Na topologia local, a fonte fica na máquina; no servidor próprio, no servidor; na cloud, no ambiente hospedado.

**[ABERTO]** Representação física de tenants, replicação para disponibilidade, cache, leitura offline e recuperação de desastre.

## AD-003 — Core/API separado da UI

**[FECHADO]** Regra de negócio, casos de uso, cálculos e acesso a dados residem no Core, separados da interface.

**[FECHADO]** A UI não acessa PostgreSQL diretamente nem contém regra trabalhista como autoridade.

**[FECHADO]** O contrato com o Core deve permitir que a mesma UI opere contra Core local, de rede ou cloud.

**[ABERTO]** Protocolo e formato do contrato. REST e SignalR foram sugeridos, mas não aprovados.

## AD-004 — Monólito modular

**[FECHADO]** O Core inicia como monólito modular, não como microserviços.

**[FECHADO]** Módulos possuem fronteiras fortes, contratos explícitos, regras separadas da infraestrutura e testes próprios. Um módulo não consulta tabelas internas de outro como atalho.

**[PARCIALMENTE FECHADO]** Domínios candidatos incluem Identidade, Escritórios, Empresas, Pessoas, Folha, Férias, Rescisão, 13º, Benefícios, Jornada/Ponto, Sindicato/CCT, eSocial, Documentos/TecnoFormas e Auditoria.

**[ABERTO]** Mapa definitivo, dependências permitidas, mecanismo de eventos, transações entre módulos e versionamento independente.

## AD-005 — C#/.NET no Core

**[FECHADO]** O Core será construído em C#/.NET moderno e multiplataforma.

**[FECHADO]** Domínio e aplicação não dependem diretamente de APIs exclusivas de Windows. Integrações de plataforma ficam atrás de abstrações.

**[ABERTO]** Versão do .NET, modelo de hosting, ORM/acesso a dados, bibliotecas e política de suporte de sistemas operacionais.

## AD-006 — PostgreSQL

**[FECHADO]** PostgreSQL é o banco de dados oficial do SUDO SYS 2.0 nas topologias local, servidor próprio e cloud.

**[FECHADO]** Dados estruturados de folha, vínculos, rubricas, vigências e cálculos são relacionais; JSONB não será um atalho para evitar modelagem.

**[ABERTO]** Versão, instalação local, provedores cloud, pooling, alta disponibilidade, criptografia, estratégia de migrations e modelo físico de tenants.

## AD-007 — React + TypeScript na UI

**[FECHADO]** A interface será construída com React e TypeScript, permitindo desktop e futuro acesso web quando aplicável.

**[FECHADO]** O Design System SUDO será próprio; bibliotecas podem oferecer primitivas, acessibilidade e comportamento sem impor identidade visual genérica.

**[ABERTO]** Versões, bundler, bibliotecas, gerenciamento de estado, grid, editor, testes e estratégia de compartilhamento desktop/web.

## AD-008 — Tauri como shell desktop

**[FECHADO]** Tauri é a casca desktop e ponte com recursos do sistema operacional.

**[FECHADO]** Nenhuma regra de negócio do SUDO deve migrar para Rust/Tauri. A autoridade permanece no Core .NET.

**[ABERTO]** Versão, ciclo de vida do Core local, integração de arquivos/impressão/certificados, atualizador e assinatura dos binários.

## AD-009 — Storage abstrato

**[FECHADO]** Documentos, XMLs, anexos, CCTs e artefatos não dependem de um provedor concreto no domínio. O Core usa contratos de storage.

**[ABERTO]** Implementações para disco/pasta de rede/object storage, layout de chaves, metadados, versionamento, retenção, criptografia e consistência com o banco.

## Não decisões

Os itens abaixo **não estão aprovados**, mesmo que tenham sido sugeridos:

- **[ABERTO]** ASP.NET Core REST para comandos/consultas.
- **[ABERTO]** SignalR, WebSocket ou SSE para eventos e progresso.
- **[ABERTO]** Mensageria, job runner, filas e locks distribuídos.
- **[ABERTO]** Autenticação, sessão, autorização técnica e licenciamento.
- **[ABERTO]** Backup, restauração, atualização, migrations e rollback.
- **[ABERTO]** Segurança, segredos, certificados, TLS e criptografia.
- **[ABERTO]** Estratégia de testes e observabilidade.
- **[ABERTO]** Estrutura final do repositório, CI/CD, empacotamento e release.

As perguntas e critérios estão em [OPEN_DECISIONS.md](OPEN_DECISIONS.md).
