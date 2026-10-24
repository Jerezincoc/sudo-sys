# PROP-001 — Módulo Identidade

**Status:** proposta para decisão de Jeremias. Nada aqui é decisão até ser aprovado. Detalha OD-003 e PD-018; não altera nenhum item **[FECHADO]**.

## 1. Escopo da primeira entrega

Dentro: usuário, perfil (papel) com permissões, vínculo do usuário a um Escritório e a empresas, login, sessão com refresh, bloqueio por tentativas, auditoria de eventos de acesso, criação do primeiro MASTER.

Fora (outras frentes): licença (OD-003 a mantém separada), recuperação do MASTER detalhada, SSO/MFA, matriz completa de permissões por módulo de negócio (cresce com cada módulo).

## 2. Já decidido (não reabrir)

ASP.NET Core Identity; tokens com refresh controlado; RBAC por perfis LOW/MEDIUM/HIGH/MASTER com escopo de empresas; perfis copiáveis e personalizáveis; licença separada da identidade; usuários isolados por Escritório (PD-001); ações sensíveis exigem autorização e auditoria; TLS fora de localhost.

## 3. Modelo proposto

Separação clean architecture: o **Domain** tem seus próprios tipos, sem herdar de `IdentityUser`; o ASP.NET Core Identity fica na **Infrastructure**, atrás de portas definidas na **Application**.

| Conceito | Descrição |
|---|---|
| **Usuário** | Pertence a **um** Escritório (`office_id`). Login único dentro do Escritório. Estados: ativo, bloqueado, desativado (nunca apagado). |
| **Perfil** | Conjunto nomeado de permissões. Os 4 de partida (LOW/MEDIUM/HIGH/MASTER) vêm do sistema; perfis do Escritório são cópias personalizadas. |
| **Permissão** | Texto `modulo.recurso.acao` (ex.: `empresas.cadastro.editar`), de um catálogo versionado em código. Só permite; sem negação explícita na v1. |
| **Escopo de empresas** | Por usuário: "todas as empresas do Escritório" ou lista específica. Vale para qualquer permissão. |
| **Sessão** | Access token curto (15 min) + refresh token rotativo, guardado só como hash, com detecção de reuso (reuso revoga a cadeia). |
| **Evento de acesso** | Login ok/falho, bloqueio, troca de senha, revogação, mudança de perfil. Registrado em UTC com autor e contexto (OD-014, PD-019). |

Regras: o perfil MASTER não pode ser removido do último usuário MASTER do Escritório; mudança de perfil, escopo ou senha de outro usuário gera evento de auditoria; troca de senha obrigatória no primeiro login.

## 4. Decisões necessárias

Cada uma traz minha recomendação.

**D1 — Acesso a dados (bloqueia a persistência).** ORM/acesso a dados está **[ABERTO]** (AD-005). O ASP.NET Core Identity usa EF Core. *Recomendo EF Core para o módulo Identidade* e manter a escolha para os demais módulos em aberto. Alternativa: Dapper com stores próprios (mais código, sem ganho claro aqui).

**D2 — Hash de senha.** *Recomendo o hasher padrão do ASP.NET Core Identity (PBKDF2)*: sem código próprio de criptografia. Argon2id pode entrar depois atrás da mesma porta.

**D3 — Negações e herança de permissões.** PD-018 deixa em aberto. *Recomendo v1 sem herança e sem negação*: permissão efetiva = união das permissões do perfil. Mais simples de entender e auditar; negação entra só se um caso real exigir.

**D4 — Um usuário em vários Escritórios?** *Recomendo não na v1*: um usuário, um Escritório (consistente com PD-001). Contador que atende dois escritórios teria dois logins. Custo de mudar depois é moderado.

**D5 — Recuperação do MASTER (parcial).** *Recomendo*: no setup do Escritório gera-se um código de recuperação exibido uma única vez e guardado só como hash; seu uso gera auditoria e invalida o código. Detalhes de licença/suporte ficam para depois. Precisa de aprovação por ser tema sensível (OD-003, OD-007).

**D6 — Política de bloqueio.** *Recomendo*: 5 falhas seguidas bloqueiam por 15 minutos, com aviso de auditoria; MASTER pode desbloquear. Números parametrizáveis, não fixos no código.

**D7 — Tempos de token.** *Recomendo* access 15 min e refresh 8 h de inatividade, com expiração absoluta de 30 dias; configuráveis.

## 5. Fatias de implementação (após aprovação)

1. **Domain/Application:** tipos, invariantes, catálogo de permissões e portas, com testes unitários (sem banco).
2. **Persistência:** esquema PostgreSQL do módulo, migrations e integração real (depende de D1 e da fundação de persistência, WS-04).
3. **Autenticação:** login, refresh rotativo, bloqueio e auditoria expostos em REST pela Api.
4. **Autorização:** política por permissão e escopo de empresas aplicada nos endpoints.
5. **Revisão de segurança** conforme [AGENT_WORKFLOWS.md](../AGENT_WORKFLOWS.md) §5 e threat model de OD-007.

Cada fatia é uma tarefa delegável ao Codex, sequencial; a 1 pode começar assim que D3 e D4 forem decididos.

## 6. Riscos

- Sessão e recuperação do MASTER são alvos naturais de ataque; a fatia 5 não é opcional.
- Permissões por texto livre podem divergir; o catálogo em código com teste de unicidade evita isso.
- Sem D1 a fatia 2 fica bloqueada.
