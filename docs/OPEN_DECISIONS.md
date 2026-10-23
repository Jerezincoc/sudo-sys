# Decisões abertas — SUDO SYS 2.0

Nenhum agente pode resolver estes itens silenciosamente. Propostas devem apresentar alternativas, impactos, recomendação e riscos para decisão de Jeremias. Ao fechar um item, atualizar o documento temático e esta fila.

## Prioridade P0 — antes da fundação executável

### OD-001 — Comunicação UI ↔ Core

**[FECHADO]** REST (ASP.NET Core) para comandos/consultas e SignalR para progresso/eventos, único protocolo para as três topologias.

### OD-002 — Jobs e concorrência

**[FECHADO]** Jobs persistentes. Cálculo integral é exclusivo por Empresa + Competência + Tipo, com lock do escopo. Acompanhamento via SignalR. Sem takeover normal do lock. Jobs precisam de idempotência e recuperação.

### OD-003 — Autenticação, sessão, autorização e licença

**[FECHADO]** ASP.NET Core Identity com autenticação por tokens e refresh controlado. RBAC pelos perfis SUDO (LOW/MEDIUM/HIGH/MASTER) com escopo de empresas. Licença separada da identidade, com tolerância temporária à indisponibilidade do servidor de licenças. Recuperação do MASTER fortemente protegida.

### OD-004 — Storage concreto

**[FECHADO]** Abstração única de storage. Filesystem local/rede e object storage cloud como providers intercambiáveis. Banco guarda metadados/referências, nunca caminhos espalhados pelo domínio. Escrita atômica e hash dos arquivos.

### OD-005 — Backup e restauração

**[FECHADO]** Backup consistente de PostgreSQL + storage, com manifesto versionado, criptografia, verificação automática e rotina real de teste de restauração.

### OD-006 — Atualização, migrations e rollback

**[FECHADO]** Migrations versionadas. Compatibilidade verificada antes de cada atualização. Backup obrigatório antes de mudanças destrutivas. Artefatos assinados. Atualização interrompível com recuperação segura. Rollback de banco não depende cegamente de "down migration".

### OD-007 — Segurança, segredos e certificados

**[FECHADO]** TLS obrigatório fora de localhost. Secret stores do SO/cloud. Certificado A1 protegido, nunca em texto puro. Princípio de menor privilégio. Proteção de endpoints, auditoria de operações sensíveis e threat model formal.

### OD-008 — Estratégia de testes

**[FECHADO]** Unitários + testes de arquitetura + integração real com PostgreSQL + testes de contrato + E2E. Golden tests obrigatórios para os cálculos trabalhistas.

### OD-009 — Estrutura do repositório e CI/CD

**[FECHADO]** Monorepo.

### OD-010 — Versões baseline

**[FECHADO]** Versões estáveis fixadas, priorizando LTS onde aplicável. Windows Tier 1 no lançamento inicial; macOS/Linux Tier 2, sem dependência arquitetural de Windows em nenhum caso.

## Prioridade P1 — antes dos módulos de negócio

### OD-011 — Observabilidade e suporte

**[FECHADO]** OpenTelemetry + logs estruturados + correlação + health checks. Pacote de diagnóstico com sanitização de dados pessoais.

### OD-012 — Modelo físico de Escritório

**[FECHADO]** Isolamento lógico por `office_id`/tenant_id, com uma fonte autoritativa por Escritório. PostgreSQL central por instalação. Arquitetura preparada para isolamento físico futuro, sem obrigá-lo agora.

### OD-013 — Transações e integração entre módulos

**[FECHADO]** Transação dentro do módulo. Contratos explícitos entre módulos. Eventos internos. Outbox para efeitos externos/confiabilidade. Um módulo nunca consulta tabela privada de outro módulo.

### OD-014 — Precisão monetária e temporal

**[FECHADO]** `decimal` para dinheiro, nunca `float`/`double`. Política central de arredondamento. Competência/data civil separada de timestamp. Auditoria em UTC, com timezone apresentado ao usuário.

### OD-015 — Privacidade, LGPD e retenção

**[FECHADO]** Privacy-by-design, minimização de dados, retenção configurável quando legalmente possível, trilha de acesso a dados sensíveis, exportação e descarte controlado. Regras jurídicas específicas continuam parametrizáveis/documentadas, nunca hardcoded por suposição.

### OD-016 — Pessoa e compartilhamento entre empresas

**[FECHADO]** Pessoa separada de Vínculo. Dados pessoais podem ser reutilizados dentro do Escritório conforme as relações autorizadas. Histórico trabalhista continua pertencendo ao vínculo/empresa. Transferência não mistura históricos.

### OD-017 — Migração e convivência com o legado

**[FECHADO]** Legado preservado. SUDO 2.0 nasce independente. Migração será feita por importadores explícitos com validação/reconciliação, nunca por leitura acoplada ao banco legado.

### OD-018 — Integrações externas

**[FECHADO]** Integrações externas atrás de adapters, com contratos/versionamento próprios, retry controlado, idempotência e circuit breaker onde aplicável. eSocial não contamina o domínio da folha.

## Prioridade P2 — detalhamento de produto/UX

- **[FECHADO] OD-019:** DSL própria e segura para fórmulas — parser/AST, funções controladas, `V(código)`, `R(código)` e catálogo de variáveis. Nada de executar SQL/C#/JavaScript arbitrário.
- **[FECHADO] OD-020:** Acumuladores versionados por vigência. Médias legais obrigatórias e não removíveis; adicionais permitidos. Memória de cálculo explicável.
- **[FECHADO] OD-021:** Máquina de estados explícita para cada processo (folha, férias, rescisão, 13º). Movimento separado do cálculo. Recálculo substitui o resultado vigente preservando auditoria.
- **[FECHADO] OD-022:** Tabelas legais/rubricas/CCT com vigência e versionamento. Padrões SUDO copiáveis quando aplicável. Mudanças nunca reescrevem competência histórica.
- **[FECHADO] OD-023:** TecnoFormas com modelo declarativo versionado — variáveis tipadas, blocos repetidores, condições e layout. Sem código arbitrário no template.
- **[FECHADO] OD-024:** Proposta 2 como base visual. Design System próprio, tokens. Abas + janelas contextuais + painéis. Densidade configurável e persistência do workspace.
- **[FECHADO] OD-025:** Acessibilidade desde os componentes-base — teclado completo, contraste, escala. pt-BR inicial, mas textos/formatos não hardcoded, para permitir i18n futura.
- **[FECHADO] OD-026:** Metas mensuráveis e testes de carga por topologia. Processamento pesado fora da thread da UI. Paginação/virtualização obrigatória para grandes conjuntos. Dimensionamento documentado por benchmark, não por chute.

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
