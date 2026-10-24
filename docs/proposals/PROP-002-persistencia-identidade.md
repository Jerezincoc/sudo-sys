# PROP-002 — Persistência do módulo Identidade

**Status:** decisão técnica do coordenador, dentro do que Jeremias já fechou (OD-012, OD-013, OD-006, OD-008, PROP-001 D1). Vale só para o módulo Identidade; o acesso a dados dos demais módulos segue **[ABERTO]**. Revisável por Jeremias a qualquer momento.

## Decisões

1. **Um DbContext e um schema PostgreSQL por módulo.** Identidade usa o schema `identity`. Nenhum módulo lê tabela de outro (OD-013). Um único banco por instalação (OD-012).
2. **Domain intacto.** O mapeamento EF vive em `SudoSys.Identity.Infrastructure` (`IEntityTypeConfiguration`), sem atributos nem pacotes de EF no Domain. Tipos de identificador (`UserId`, `RoleId`, `OfficeId`, `CompanyId`) usam `ValueConverter`.
3. **Portas na Application.** `IUserRepository`, `IRoleRepository` e `IUnitOfWork` são definidos em `SudoSys.Identity.Application`; a Infrastructure os implementa.
4. **Isolamento por Escritório.** Toda tabela de negócio tem `office_id`. Um `ITenantContext` (porta na Application) informa o Escritório corrente; o DbContext aplica filtro global por `office_id`. Perfis do sistema (`office_id` nulo) são visíveis a todos. Consulta sem contexto de Escritório falha, não devolve tudo.
5. **Migrations do EF Core**, versionadas no projeto Infrastructure, aplicadas explicitamente (nunca ao subir a Api sem comando). Nomes de tabela e coluna em `snake_case`.
6. **Testes de integração com PostgreSQL real** (OD-008), em projeto próprio `tests/SudoSys.Identity.IntegrationTests`. A conexão vem da variável de ambiente `SUDOSYS_TEST_PG` (sem senha em arquivo versionado). Cada execução cria um banco temporário com nome único e o remove ao final. Sem Docker: usa o PostgreSQL 18 local da máquina de desenvolvimento.
7. **Sem ASP.NET Core Identity nesta fatia.** Senha, tokens e login entram na fatia 3.

## Fora de escopo

Fundação de persistência dos outros módulos, replicação, pooling avançado, criptografia em repouso e estratégia de backup (OD-005), que seguem seus próprios itens.
