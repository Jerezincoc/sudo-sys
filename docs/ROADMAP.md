# SudoSys — Roadmap até a Versão Final

> Documento gerado a partir de análise do histórico de commits (54 commits), leitura completa
> dos módulos de backend (`app-host`, `packages/infrastructure`) e frontend (`packages/ui`),
> e varredura de código morto/incompleto em todo o monorepo. Data da análise: 2026-07-10.

## Como ler este documento

Os itens estão organizados por prioridade, não por módulo. **P0** são bloqueadores para
qualquer uso em produção real (risco legal, de segurança ou de correção de cálculo). **P1**
são lacunas funcionais que um sistema de folha de pagamento "completo" precisa ter. **P2** é
dívida técnica que não impede o uso, mas vai custar caro se ignorada. **P3** é escopo a
decidir com o dono do produto — não são bugs, são perguntas.

Cada item tem referência de arquivo/linha quando aplicável, para ser acionável direto.

---

## P0 — Bloqueadores (correção de cálculo, segurança, compliance)

### 1. ~~Tabelas de INSS/IRRF/salário-mínimo estão hardcoded em "2025" e hoje é 2026~~ — CORRIGIDO
**Status: resolvido em 2026-07-10.** As tabelas foram atualizadas com valores oficiais
verificados em fonte primária (não estimados):

- **INSS** (`packages/infrastructure/src/services/CalculoFolha.ts`, `INSS_2026`): faixas
  7,5% / 9% / 12% / 14% com teto de R$ 8.475,55, conforme **Portaria Interministerial
  MPS/MF nº 13, de 9/1/2026** (Diário Oficial da União, 12/1/2026, Anexo II — PDF oficial
  lido diretamente do Planalto/Previdência para extrair a tabela).
- **IRRF** (mesmo arquivo, `IRRF_2026`): faixa de isenção até R$ 2.428,80, com as demais
  faixas e parcelas a deduzir atualizadas (7,5% ded. R$182,16; 15% ded. R$394,16; 22,5%
  ded. R$675,49; 27,5% ded. R$908,73), conforme **Lei nº 15.191, de 11/8/2025** (vigente
  desde maio/2025, ainda em vigor em 2026 — confirmado em duas fontes independentes, com
  as parcelas a deduzir batendo matematicamente com o deslocamento da faixa de isenção). O
  redutor adicional da Lei 15.270/2025 (isenção efetiva até R$5.000, transição até
  R$7.350) e o desconto simplificado (R$607,20) já estavam corretos e não mudaram.
- `packages/ui/src/pages/custos/CustosSimuladorPage.tsx:12` (`MINIMO`) e
  `app-host/src/pdf/HoleriteRenderer.ts:84` (`fmtIrrfFaixa`, usado para exibir a faixa de
  alíquota no holerite impresso) tinham os mesmos valores antigos hardcoded e também foram
  corrigidos, para não ficarem inconsistentes com `CalculoFolha.ts`.
- Salário mínimo nacional 2026: **R$ 1.621,00**, conforme Decreto nº 12.797/2025 (confirmado
  também no Art. 2º da própria Portaria MPS/MF nº 13/2026).

**Risco estrutural também corrigido (2026-07-10):** `CalculoFolha.ts` agora versiona as
tabelas por competência (`TABELAS_INSS`/`TABELAS_IRRF`, cada entrada com `vigenteDesde:
"AAAA-MM"`), e `calcularINSS`/`calcularIRRF` recebem a competência da folha
(`folha.competencia`, passada em `folhaHandlers.ts`) para escolher a tabela correta —
inclusive o redutor da Lei 15.270/2025, que agora só se aplica a partir de 2026-01. Hoje
há histórico verificado de: IRRF desde 2024-02 (Lei 14.848/2024) e desde 2025-05 (Lei
15.191/2025); INSS desde 2025-01 e 2026-01. Competências anteriores a essas datas caem na
tabela mais antiga disponível (limitação documentada em comentário no próprio arquivo,
por não terem sido pesquisadas). A duplicação da faixa de IRRF que existia separadamente em
`HoleriteRenderer.ts` (usada só para exibir o rótulo "Faixa IRRF" no holerite impresso) foi
removida — agora reusa `descreverFaixaIrrf()` exportada do mesmo arquivo, então as duas
nunca mais podem dessincronizar.

### 2. ~~Nenhum handler de IPC valida quem está chamando~~ — CORRIGIDO
**Status: resolvido em 2026-07-10.** Criado `app-host/src/ipc/authGuard.ts`: em vez de editar
um por um os ~80 `ipcMain.handle(...)` espalhados em 13 arquivos, o módulo substitui
`ipcMain.handle` por uma versão que intercepta **todo** registro futuro e exige sessão válida
antes de delegar ao handler original. A sessão é amarrada ao `WebContents` que fez a chamada
(`event.sender.id`, atribuído em `auth:login` via `setSessionUser` e limpo em `auth:logout`
via `clearSessionUser`) — não a um token passado como argumento, então não dá pra forjar pelo
renderer. Canais que **não** exigem sessão (`CANAIS_PUBLICOS`): `setup:*`, `auth:login`,
`auth:logout`, `auth:me`, `auth:register` (esse último já tinha checagem própria e não é usado
por nenhuma tela hoje). Canais que exigem **admin**, além de sessão (`CANAIS_ADMIN`):
`usuario:list`, `usuario:create`, `usuario:delete`, `admin:backup`. Qualquer canal novo que
ninguém adicionar a uma dessas duas listas fica protegido por padrão (fail-safe).

Verificado ponta a ponta no app rodando de verdade (via CDP, o mesmo mecanismo do
`scripts/cdp-test.mjs` já existente no projeto): chamada sem login é rejeitada
("Sessão inválida. Faça login novamente."), funciona depois do login, volta a ser bloqueada
depois do logout, canal público continua acessível sem sessão, e um usuário `operador` de
teste (criado e removido pelo próprio script de verificação) consegue usar canais comuns mas
é bloqueado em `usuario:list`/`admin:backup` com "Apenas administradores podem executar esta
ação.".

### 3. ~~RBAC não existe de fato~~ — PARCIALMENTE CORRIGIDO
**Status: parcial, 2026-07-10.** O que foi resolvido:
- `packages/ui/src/permissions/usePermission.ts` agora expõe `isAdmin` a partir do `role` da
  sessão; `guards.tsx` agora tem um `<RequireAdmin>` que redireciona pro Dashboard quem não é
  admin.
- `Router.tsx`: a rota `/admin` é envolvida por `RequireAdmin`.
- `Sidebar.tsx`: o grupo de menu "ADMIN" some da navegação para quem não é admin.
- Verificado no app rodando (CDP + interação real de DOM no formulário de login): logado como
  `operador`, o texto "Administração" não aparece em lugar nenhum da página, e forçar
  `location.hash = '#/admin'` na mão redireciona pra `#/dashboard`.
- A proteção que realmente importa (o backend, item 2 acima) já cobre isso independente da UI
  — mesmo que alguém reative o menu ou a rota no frontend, o IPC por trás continua bloqueado.

O que **não** foi resolvido, de propósito: só existe a distinção binária admin/não-admin. Não
existe matriz de permissão por módulo (ex.: quem pode excluir empresa, quem pode editar folha
fechada) porque isso depende de decisão de produto — ver pergunta de escopo #3 na seção
seguinte. `docs/architecture/rbac-model.md` continua vazio.

### 4. Log de auditoria é 100% inexistente
`packages/infrastructure/src/repositories/SqliteAuditLogRepository.ts` está vazio, não há
tabela `audit_log` na migration (`app-host/src/db/database.ts`), e a tela
(`packages/ui/src/pages/admin/AdminPage.tsx:159-174`) já assume isso e mostra
"Em desenvolvimento — logs de auditoria serão exibidos aqui". Para um sistema de folha de
pagamento, rastrear quem alterou salário/rubrica/rescisão de quem é normalmente requisito de
auditoria interna e, dependendo do cliente, contratual.

---

## P1 — Lacunas funcionais (falta para ser um sistema de folha "completo")

### 5. 13º salário não existe como processo próprio
Hoje `decimo_terceiro` só aparece como uma linha dentro do cálculo de **rescisão**
(`packages/shared/src/types/rescisao.ts:15`). Não há um fluxo de "gerar folha de 13º salário"
para todos os funcionários ativos (1ª parcela até 30/11, 2ª até 20/12), que é obrigatório
independente de desligamento. Não existe `tipo_folha` na tabela `folha_competencias` para
diferenciar folha mensal normal de folha de 13º. Este é provavelmente o maior gap funcional do
sistema hoje.

### 6. Postgres é só decorativo
O wizard de setup (`packages/ui/src/pages/setup/steps/DatabaseStep.tsx`) deixa escolher
"PostgreSQL" e testa a conexão de verdade (`app-host/src/setup/dbTester.ts`), mas **nada no
runtime usa isso** — `getDb()` (`app-host/src/db/database.ts:442`) ignora completamente a
config salva e sempre abre SQLite via `better-sqlite3`. Todos os 10 repositórios em
`packages/infrastructure/src/repositories/` são `Sqlite*` sem abstração de driver. Duas
saídas: (a) implementar de verdade um driver Postgres por trás da mesma interface de
repositório, o que é trabalho substancial, ou (b) remover a opção Postgres do wizard até que
seja implementada, para não prometer algo que não existe.

### 7. Ponto (cartão de horas) não alimenta a Folha
`pontoHandlers.ts` calcula `horas_extras_50`/`horas_extras_100` corretamente, mas
`folhaHandlers.ts` não lê nada de `registro_ponto` — não há integração automática das horas
extras apuradas no módulo de Ponto para virarem provento na folha do mês. Hoje isso exigiria
lançamento manual via Rubricas/QuickCalc.

### 8. QuickCalc não salva lançamentos avulsos
`packages/ui/src/pages/quickcalc/QuickCalcPage.tsx:97` — o botão de salvar mostra
`alert('Em breve: Salvar lançamentos avulsos na folha aberta da competência.')`. O handler de
backend correspondente (`app-host/src/ipc/handlers/quickCalcHandlers.ts`) está vazio e nem é
registrado em `ipcRouter.ts`. Resultado: cálculo avulso funciona só como calculadora
descartável, sem persistir nada.

### 9. Admin: Restaurar backup não existe
`adminHandlers.ts` só tem `admin:backup` (copia o `.db` para onde o usuário escolher). Não há
`admin:restore`. A tela mostra o rótulo "Backup/Restore" mas só o botão "Fazer Backup"
(`AdminPage.tsx:202-213`).

### 10. Contadores do painel "Tabelas Internas" são falsos
`AdminPage.tsx:182-190` — de 8 contadores mostrados (Empresas, Funcionários, Rubricas, Férias,
Rescisões, Registros de Ponto, Folhas, Usuários), só 3 (Empresas, Funcionários, Usuários) vêm
de consulta real; os outros 5 são hardcoded como `'-'`.

### 11. Relatórios: VT/VR sempre aparecem como zero
`app-host/src/ipc/handlers/relatorioHandlers.ts:115` — comentário `// TODO: buscar de
lancamentos` — os campos `vt`/`vr` nos relatórios de competência nunca são preenchidos de
verdade, sempre retornam `0`.

### 12. Sem eSocial de verdade
Existe uma tabela de referência (`packages/shared/src/constants/esocialTabela3.ts`) usada só
para classificar rubricas, mas não há geração de eventos/XML do eSocial (S-1200, S-1210,
S-2200 etc.) nem de guias (GPS, GRF/FGTS Digital, DARF). Se o objetivo do produto é ser um
sistema de folha "de verdade" para uso fiscal, isso é a maior peça de trabalho do roadmap
inteiro — vale confirmar com o cliente/dono do produto se está no escopo da v1 ou é uma fase
posterior (ver seção P3).

---

## P2 — Dívida técnica (não trava uso, mas custa caro se ignorada)

### 13. Existem duas arquiteturas no repositório, e uma delas está morta
Os commits `e542f15`/`1f22f89` criaram uma camada "clean architecture" completa —
`packages/domain` (entidades, value objects, formula engine, ~30 arquivos) e
`packages/application` (DTOs, ports, ~50 use-cases) — mas **nada disso é importado por
`app-host`**. Confirmado: `grep` por `@sudo-sys/domain` e `@sudo-sys/application` dentro de
`app-host/src` não retorna nada, e o próprio `app-host/src/di/container.ts` lança erro se
usado (`compositionRoot.ts:6` tem só um `TODO` e retorna `{}`). O app real foi reescrito de
forma pragmática direto em `app-host/src/ipc/handlers/*` chamando
`packages/infrastructure/src/repositories/Sqlite*Repository` na mão.
**Decisão necessária:** apagar as duas pastas mortas (`packages/domain`, `packages/application`
e o `di/` não usado) ou migrar o app real para usá-las de verdade. Mantê-las como estão só
confunde quem entra no projeto — parecem a arquitetura "oficial" mas são código morto.

### 14. Dezenas de arquivos-esqueleto vazios da mesma leva
Além de domain/application, ficaram órfãos e vazios (0 bytes): componentes de UI planejados
(`DataTable.tsx`, `MoneyInput.tsx`, `FormulaInput.tsx`, `PercentInput.tsx`, `RubricaPicker.tsx`,
`Toasts.tsx`, `LoadingOverlay.tsx`, `ModuleTabs.tsx`), páginas duplicadas nunca usadas
(`pages/auth/LoginPage.tsx`, `pages/admin/AuditLogsPage.tsx`,
`pages/admin/RolesPermissionsPage.tsx`, `pages/extras/*`, `pages/quickcalc/QuickLancamentosEditor.tsx`),
e serviços de infra (`PdfService.ts`, `Logger.ts`, `AuditLogger.ts`, `BackupService.ts`,
`RbacGuard.ts`, `LocalSessionManager.ts`, `MigrationRunner.ts`). Recomendo uma limpeza única:
apagar tudo que está confirmadamente vazio e não referenciado (ver lista completa que gerei
durante a análise, posso exportar se for útil) em vez de ir preenchendo peça por peça —
preencher implicaria refazer a arquitetura que já foi abandonada.

### 15. Duplicação de componentes de formulário por página
`FuncionarioForm.tsx`, `EmpresaForm.tsx`, `RescisaoForm.tsx`, `CompanyStep.tsx` (e outros) cada
um define seu próprio `Field`/`SelectField` local em vez de usar um componente compartilhado.
É consistente com o item 14 (a lib de componentes planejada nunca foi construída), mas hoje
qualquer ajuste visual em campo de formulário precisa ser replicado em ~6+ arquivos.

### 16. Zero testes automatizados
`app-host/tests/integration-ipc.test.ts` e `packages/ui/tests/ui-smoke.test.ts` existem mas
estão **vazios**. Não há `test` script no `package.json` raiz. A única verificação hoje é
manual, via scripts CDP ad-hoc (`scripts/cdp-test.mjs`) rodados uma vez por feature. Para um
sistema que faz cálculo de folha de pagamento (onde um bug de arredondamento é dinheiro real
errado no bolso de alguém), isso é o item de maior risco silencioso do projeto.

### 17. Hash de senha com nome de arquivo enganoso
`packages/infrastructure/src/auth/Argon2PasswordHasher.ts` — o arquivo se chama "Argon2" mas a
classe exportada é `SimplePasswordHasher`, implementada com PBKDF2/SHA-512 (100k iterações).
Não é inseguro, mas o nome do arquivo mente sobre o algoritmo — ou renomeia o arquivo, ou migra
de verdade para Argon2id (melhor prática atual para hash de senha).

### 18. Erros engolidos silenciosamente
Padrão recorrente em vários handlers: `try { ... } catch { return [] }` (ex.:
`folhaHandlers.ts:14`) sem logar nada. Sem um `Logger` central (item 14), um erro de banco vira
silenciosamente "lista vazia" na tela, dificultando diagnosticar problemas em produção.

---

## P3 — Empacotamento e distribuição (para existir uma "versão final" instalável)

### 19. Build do Electron não tem ícone
`app-host/package.json` referencia `build/icon.ico` para Windows, mas a pasta `build/` não
existe no projeto — `electron-builder` provavelmente falha ou cai no ícone padrão do Electron.
Falta gerar/adicionar ícones para Windows (`.ico`), Mac (`.icns`) e Linux (`.png`).

### 20. Sem auto-update
Não há `electron-updater` nem qualquer mecanismo de atualização. Se a distribuição for para
clientes externos (não só uso interno), toda atualização de tabela fiscal (item 1) vai exigir
reinstalação manual — o que é particularmente ruim dado que tabelas fiscais mudam todo ano.

### 21. Sem CI
Não existe `.github/workflows` nem qualquer pipeline. `pnpm typecheck`/`pnpm lint` existem como
scripts mas rodam só manualmente. Sem testes (item 16) o CI teria pouco a rodar hoje, mas vale
pelo menos gate de typecheck+lint em PR.

### 22. Versão travada em 1.0.0 em todos os pacotes
Todo `package.json` do monorepo está em `1.0.0` desde o início — não há processo de
versionamento/changelog para saber o que mudou entre builds distribuídas a clientes.

---

## P3 — Perguntas de escopo (não são bugs, precisam de decisão do dono do produto)

1. **eSocial (item 12) entra na v1 ou é fase 2?** É o maior item do roadmap de longe — vale
   alinhar expectativa antes de estimar prazo de "versão final".
2. **Postgres (item 6) é requisito real ou pode sair do wizard por enquanto?** Se o produto é
   para escritórios de contabilidade rodando localmente, SQLite sozinho pode ser suficiente e
   isso vira um item descartável em vez de um item a implementar.
3. **RBAC fino: quais ações por módulo cada papel pode fazer?** O gate admin/não-admin já
   existe (item 3). O que falta decidir é mais granular — ex.: `operador` pode excluir
   empresa? Pode editar folha já fechada? Existe uso real para o papel `visualizador` que já
   está no tipo (`SessionUser['role']`) mas não é seedado em lugar nenhum? Mapear isso antes
   de implementar enforcement por módulo.
4. **Multiusuário simultâneo é um caso de uso real?** O banco é um único arquivo SQLite local;
   se dois usuários vão usar o mesmo banco ao mesmo tempo (rede compartilhada), `better-sqlite3`
   tem limitações de concorrência que valeria revisar.

---

## Sugestão de ordem de execução

1. ~~Item 1 (tabelas fiscais)~~ — **feito**.
2. ~~Itens 2-3 (autorização de IPC + RBAC)~~ — **feito** (RBAC só no nível admin/não-admin;
   matriz fina por módulo depende da pergunta de escopo #3 abaixo).
3. Resolver as perguntas de escopo (P3) — evita trabalho na direção errada nos itens grandes.
4. Item 13-14 (limpeza do código morto) — barato, reduz confusão para todo trabalho seguinte.
5. Itens 5, 7, 8 (13º salário, integração Ponto→Folha, QuickCalc) — lacunas funcionais que
   usuários vão sentir no dia a dia.
6. Item 16 (testes) — idealmente em paralelo com qualquer item acima que mexa em cálculo.
7. Itens 19-22 (empacotamento) — última milha, só depois do funcional estar redondo.
