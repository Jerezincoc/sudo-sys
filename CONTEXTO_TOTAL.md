# CONTEXTO TOTAL DO PROJETO

## Finalidade deste arquivo

Este arquivo é o resumo principal do estado atual do projeto. Ele deve ser mantido como documentação viva e usado por agentes de IA e desenvolvedores para entender rapidamente:

- que projeto é este;
- qual é o objetivo do projeto;
- qual stack está sendo usada;
- qual é a fase atual;
- quais decisões técnicas estão valendo;
- quais riscos precisam de atenção;
- quais recomendações estão ativas;
- qual deve ser o próximo passo.

Este arquivo não substitui o histórico completo. O histórico detalhado, acumulado e explicado das ações fica em:

`HISTORICO_AGENTES.md`

## Como agentes devem usar este arquivo

Antes de sugerir ou alterar qualquer coisa no projeto, todo agente deve ler, nesta ordem:

1. `CONTEXTO_TOTAL.md` — estado atual, fase, riscos e recomendações.
2. `HISTORICO_AGENTES.md` — histórico completo das ações executadas.
3. `README_AMBIENTE.md` — ambiente, comandos, build e cuidados operacionais.
4. `BLOQUEIOS_AGENTES.md` — áreas e tarefas que exigem verificação antes de alteração.
5. `COMUNICACAO_AGENTES.md` — mensagens, handoffs, dúvidas e orientações entre agentes.
6. `DECISOES_TECNICAS.md` — índice das decisões técnicas que ainda importam para o estado atual.

Depois da leitura, o agente deve identificar a fase atual, verificar recomendações, decisões e bloqueios, evitar mudanças grandes sem justificativa, registrar ações relevantes no histórico e atualizar este arquivo se o estado atual mudar.

## Relação com o HISTORICO_AGENTES.md

- `CONTEXTO_TOTAL.md` mostra onde o projeto está agora.
- `HISTORICO_AGENTES.md` mostra como o projeto chegou até aqui.
- Se uma ação mudar o estado atual, os dois arquivos devem ser atualizados.
- Se a ação for apenas registro, recomendação ou anotação, pode ser suficiente atualizar apenas o `HISTORICO_AGENTES.md`.

## Regra principal

- Nunca apagar informações importantes sem registrar o motivo no histórico.
- Nunca substituir contexto relevante apenas para "organizar melhor".
- Se houver dúvida, adicionar a observação `A confirmar`.
- O histórico antigo deve ser preservado.
- Alterações devem ser pequenas, rastreáveis e justificadas.

## 1. Resumo rápido

- **Nome do projeto:** SUDO SYS
- **Tipo de projeto:** Aplicativo desktop Electron para gestão de folha.
- **Stack principal:** Electron, React, TypeScript, Vite, SQLite e pnpm monorepo.
- **Estado atual:** Protótipo funcional com baixa confiabilidade operacional e fiscal.
- **Fase atual:** Estabilização do build e da distribuição Electron.
- **Última ação registrada:** `ACAO-0035` — `REC-0020` executada: INSS e IRRF rescisórios calculados (saldo de salário e 13º em linhas separadas, tetos independentes, aviso indenizado e férias fora das bases), depósito de FGTS da rescisão e multa 40%/20% calculada sobre o saldo FGTS informado + depósitos da rescisão (incluindo o do aviso indenizado — tema **contestado**, sem tese firmada no TST, sinalizado na tela e no PDF). Migration `057`. Validado com 4 cenários à mão (novo cenário (d) com IRRF > 0 e teto do INSS), via IPC real/CDP (56/56 campos) e nos PDFs. `pnpm test` 69/69. Plano em `docs/plano-rec-0020.md`; pontos `[A CONFIRMAR]` em `REC-0021`.
- **Ação anterior sobre rescisão:** `ACAO-0033` — diagnóstico do cálculo de Rescisão (TRCT) contra o texto literal da CLT, Lei 12.506/2011, Lei 4.090/62 e Lei 8.036/90. Motor extraído para `CalculoRescisao.ts` (com testes). Corrigidos: aviso prévio proporcional; aviso zerado em justa causa/pedido de demissão e pela metade no acordo; 1/3 sobre férias vencidas no total; fração de dias em férias/13º; projeção do aviso indenizado; multa FGTS fora do líquido. Validado com 3 cenários à mão, via IPC real (CDP) e nos PDFs (27/27 campos). `pnpm test` 60/60. Pontos em dúvida em `REC-0019`; INSS/IRRF/FGTS rescisórios não implementados em `REC-0020`.
- **Próxima ação recomendada:** decisão do usuário sobre os itens `[A CONFIRMAR]` da `REC-0019` (principalmente justa causa × IRR Tema 96 do TST) e da `REC-0021` (outros proventos; redutor Lei 15.270 no 13º). Continuam pendentes: confirmar com o Codex o envio de `EmpresasPage.tsx` (`ACAO-0031`), `REC-0018`, `REC-0011` e `REC-0016`.
- **Uso em produção:** Não recomendado antes das correções críticas e dos testes de cálculo.

## 2. Objetivo do projeto

O SUDO SYS é, ou aparenta ser, um aplicativo desktop para gestão de folha de pagamento e rotinas relacionadas. A interface existente contempla empresas, funcionários, folhas por competência, rubricas, férias, rescisões, registros de ponto, relatórios, documentos, cálculos rápidos, custos, CBO, autenticação e administração.

O escopo fiscal definitivo, incluindo eSocial, obrigações acessórias e uso multiusuário, está **A confirmar**. No estado atual, o projeto deve ser tratado como protótipo funcional em estabilização, não como sistema pronto para processar pagamentos reais.

## 3. Como o projeto está organizado

- **`packages/ui`:** interface React/Vite, páginas, formulários, componentes, rotas, estado Zustand e cliente IPC. É uma das áreas mais completas do projeto.
- **`app-host`:** processo principal e preload do Electron, registro dos handlers IPC, inicialização do banco SQLite, autenticação, configuração inicial e geração de PDFs. É o backend efetivo da aplicação.
- **`packages/shared`:** tipos e contratos compartilhados entre UI e host. Parte dos arquivos planejados está vazia.
- **`packages/domain`:** entidades, enums, value objects, serviços e motor de fórmulas da arquitetura de domínio pretendida. A maior parte dessa camada não governa o runtime atual e contém implementações muito pequenas ou incompletas. Exceção: o motor de fórmulas (`formula/`) foi implementado na `ACAO-0018` e conectado à UI na `ACAO-0019` (botão "ƒ" em `LancamentosEditor.tsx`) — é a primeira e única parte de `packages/domain` com um consumidor real em runtime. Publicado como **ESM** (não CommonJS como `application`/`infrastructure`) desde a revisão técnica registrada na `ACAO-0019`, para ser importável pelo bundle Vite da UI.
- **`packages/application`:** portas, DTOs e casos de uso da Clean Architecture pretendida. A maioria dos casos de uso está vazia e o runtime atual não usa essa camada.
- **`packages/infrastructure`:** repositórios SQLite, hash de senha e serviço de cálculo de folha. Parte desta camada é usada diretamente pelo `app-host`; vários arquivos planejados continuam vazios.
- **`config`:** arquivos de configuração padrão. Os arquivos identificados no diagnóstico estão vazios.
- **`docs`:** documentação arquitetural, de dados, UX e roadmap. O roadmap possui conteúdo, mas vários documentos estruturais estão vazios.
- **`scripts`:** scripts auxiliares de verificação manual e arquivos planejados de operação. Há scripts CDP/PowerShell e documentos vazios.

A estrutura pretendida se aproxima de Clean Architecture, mas a implementação real funciona como um monólito Electron com regras e orquestração concentradas nos handlers IPC e acesso direto a repositórios de infraestrutura.

## 4. Stack e dependências principais

- **Electron:** host desktop da aplicação.
- **React:** biblioteca da interface.
- **Vite:** servidor e build do renderer.
- **React Router:** navegação da interface por `HashRouter`.
- **Zustand:** estado da sessão, empresa selecionada, UI, wizard e ações de página.
- **TypeScript:** linguagem principal, com modo `strict` configurado.
- **SQLite via `better-sqlite3`:** banco efetivamente utilizado no runtime.
- **PostgreSQL:** existe teste e configuração no wizard, mas o runtime continua usando SQLite; suporte real a PostgreSQL não foi confirmado.
- **PDFKit:** geração de holerites, relatórios e outros documentos.
- **Tailwind CSS:** configurado no pacote de UI; também há uso significativo de estilos inline.
- **pnpm:** gerenciador de pacotes e workspaces do monorepo.

O diagnóstico também identificou dependências com versões principais defasadas e vulnerabilidades moderadas na cadeia do React Router. Upgrades grandes não devem ser feitos em lote.

## 5. Estado técnico atual

### Qualidade do código

A base funcional é ampla, mas há arquivos muito grandes, duplicação de componentes de formulário e formatadores, responsabilidades misturadas em páginas e handlers e muitos arquivos vazios que representam funcionalidades ou camadas ainda não implementadas.

### Qualidade da tipagem TypeScript

O modo `strict` está habilitado e o typecheck geral passa desde a `ACAO-0006`. A correção mínima adicionou os tipos de Node já resolvidos no lockfile ao pacote `application`, sem alterar seus contratos com `Buffer`. `@types/node` 22.19.19 continua desalinhado com o runtime Node 20 e deve ser revisto em uma migração controlada. Há poucos usos explícitos de `any`, concentrados principalmente em PDFKit e alguns componentes, mas os dados do banco e payloads IPC recebem casts sem validação em runtime.

### Organização

Existem duas arquiteturas concorrentes: uma Clean Architecture quase vazia e uma implementação direta em handlers IPC. A estrutura física sugere uma arquitetura mais madura do que a realmente executada, o que aumenta a chance de trabalho duplicado ou feito na camada errada.

### Segurança

Não foram encontrados secrets, tokens ou chaves privadas versionados. Foram encontrados riscos relevantes: configuração de conexão potencialmente sensível salva em texto puro, canais de setup públicos após a inicialização, autorização limitada a uma distinção parcial de administrador e ausência de auditoria funcional. O risco de credencial padrão conhecida (`admin@sudosys.local`/`admin123`) foi mitigado na `ACAO-0014` (`REC-0002`): o seed do admin agora nasce marcado para troca obrigatória de senha no primeiro login, e a UI não expõe mais a credencial. A `ACAO-0027` estendeu esse enforcement para o backend: antes, `must_change_password` só era respeitado pelo roteamento do frontend, e uma chamada de IPC direta contornava a troca obrigatória; agora o gate central (`authGuard.ts`) bloqueia todo canal autenticado até a troca, exceto `auth:trocarSenha`. O risco de "canais de setup públicos após a inicialização", mencionado genericamente desde a `ACAO-0001`, foi confirmado na prática na `ACAO-0030` (`setup:save-config`/`setup:get-config` aceitando reescrever/ler a configuração inteira, inclusive a seção `database`, sem sessão, a qualquer momento) e corrigido na `ACAO-0032` (`REC-0017`): os dois canais agora só ficam públicos enquanto `isInitialized() === false`; depois disso, exigem sessão + papel admin.

### Performance

O processo principal executa operações síncronas de SQLite, hash de senha, filesystem e parte da geração de PDFs. Listagens são majoritariamente sem paginação, há poucos limites explícitos, faltam índices de consulta planejados e o cálculo de folha realiza múltiplas operações por funcionário. Medições formais de desempenho estão **A confirmar**.

### Testes

Desde a `ACAO-0015` existe um framework de testes (`vitest`) e uma suíte funcional (`pnpm test`, raiz), hoje cobrindo: motor de cálculo IRRF/INSS/FGTS (`packages/infrastructure/src/services/CalculoFolha.test.ts`, 7 testes), transação/idempotência do recálculo de folha (`packages/infrastructure/src/repositories/SqliteFolhaRepository.test.ts`, 4 testes) o motor de fórmulas (`packages/domain/src/formula/Formula.test.ts`, 25 testes) e, desde a `ACAO-0033`, o cálculo de rescisão (`packages/infrastructure/src/services/CalculoRescisao.test.ts`, 24 testes) — **60 testes no total**. Férias (módulo próprio), ponto e os demais cálculos trabalhistas continuam sem teste automatizado (`REC-0003` parcialmente executada).

### Motor de cálculo (Rescisão/TRCT)

Desde a `ACAO-0033`, `rescisao:calcular` usa `calcularRescisao()` (`packages/infrastructure/src/services/CalculoRescisao.ts`), validado contra o texto legal. Saldo de salário, aviso prévio (proporcional, por motivo), férias proporcionais + 1/3 (inclusive sobre vencidas) e 13º proporcional são calculados. Desde a `ACAO-0035`, INSS e IRRF (saldo de salário e 13º separados), depósito de FGTS da rescisão e multa FGTS (sobre o saldo FGTS informado pelo usuário) também são calculados, reaproveitando `calcularINSS`/`calcularIRRF`/`calcularFGTS` de `CalculoFolha.ts` com a tabela da competência da demissão. Férias vencidas, saldo FGTS e outros proventos/descontos continuam **informados manualmente**. Regras em dúvida mantidas como no código original — ver `REC-0019` e `REC-0021`.

### Motor de cálculo (IRRF) e schema de funcionários

A `ACAO-0008` corrigiu `calcularIRRF` (`packages/infrastructure/src/services/CalculoFolha.ts`): o redutor da Lei 15.270/2025 (teto R$7.350, fórmula `978,62 - 0,133145 × rendimento`) agora usa o salário bruto do funcionário (5º parâmetro opcional `salarioBruto`, com fallback para a base líquida se omitido), não mais a base já líquida de INSS/dependentes — evitando redução indevida de IRRF para quem tem bruto acima do teto mas base líquida na faixa de transição. `folhaHandlers.ts` já passa `baseIrrf` (pré-INSS) nesse parâmetro.

A tabela `funcionarios` (`app-host/src/db/database.ts`) ganhou a migration `054_funcionario_regime_irrf_check`, restringindo `regime_irrf` a `'dependentes'`/`'simplificado'` via CHECK constraint (recriação de tabela, padrão SQLite). Aplicada e validada no banco de dev real, que estava vazio de funcionários no momento da aplicação.

### Build

Os quatro pacotes internos geram JavaScript e declarações em `dist`, expõem entradas públicas e são compilados antes dos consumidores. Os 19 imports privados do `app-host` foram substituídos pela API pública de `@sudo-sys/infrastructure`. A `ACAO-0020` incluiu o CSV completo de CBO no caminho esperado do ASAR, removeu todos os `.ts`/`.tsx` e diretórios `src` dos workspaces empacotados, gerou o instalador NSIS e abriu `#/setup` com 2.495 CBOs em banco temporário. Permanecem pendentes um ícone oficial, assinatura e execução controlada do instalador.

### Manutenção

O comando `pnpm lint` retorna sucesso sem executar lint, pois nenhum workspace possui script de lint. O `pnpm typecheck` passa; não há CI nem cobertura de testes. Node 20.20.2 e pnpm 9.15.9 foram fixados provisoriamente; Node 20 está fora de suporte e uma migração futura para LTS continua pendente. O projeto exige estabilização e criação de gates reais antes de refatorações amplas.

A `ACAO-0004` tornou `pnpm dev` autocontido: o fluxo gera o preload, executa `electron-rebuild` para preparar `better-sqlite3` para a ABI do Electron e inicia o aplicativo com `--user-data-dir=../.dev-user-data`. A validação abriu a rota de setup e manteve os metadados do banco real inalterados.

A `ACAO-0006` integrou o build dos pacotes internos ao `pnpm build`, `pnpm typecheck` e preparo de desenvolvimento. A distribuição deixou de depender de imports privados para TypeScript cru; o smoke test do executável empacotado passou com `userData` temporário e isolado.

## 6. Decisões técnicas atuais

### DEC-0001

- **Status:** Ativa
- **Decisão:** Assumir temporariamente o projeto como monólito modular Electron.
- **Motivo:** A Clean Architecture existe parcialmente, mas não governa o runtime atual.
- **Impacto:** Priorizar estabilização, handlers mais finos, serviços por módulo, repositórios encapsulados e contratos IPC validados em runtime.
- **Autor/origem:** Codex
- **Data:** 2026-09-11

### DEC-0002

- **Status:** Ativa
- **Decisão:** Não realizar refatorações grandes antes de corrigir riscos críticos, build, segurança e testes.
- **Motivo:** Reduzir o risco de quebrar comportamento existente.
- **Impacto:** Mudanças futuras devem ser pequenas, rastreáveis e registradas.
- **Autor/origem:** Codex
- **Data:** 2026-09-11

### DEC-0003

- **Status:** Ativa / Provisória
- **Decisão:** Usar Node 20.20.2 e pnpm 9.15.9 como baseline de compatibilidade do ambiente atual.
- **Motivo:** Essa combinação já foi validada com instalação congelada, Electron 32.3.3, preload e `better-sqlite3`; trocar a linha do Node nesta etapa ampliaria o escopo.
- **Impacto:** `.node-version`, `packageManager` e `engines` exigem essas versões. Como Node 20 está fora de suporte, a decisão deve ser revista após estabilizar o build.
- **Autor/origem:** Codex
- **Data:** 2026-09-11

### DEC-0004

- **Status:** Parcialmente superada (ver `DEC-0005`)
- **Decisão:** Publicar `@sudo-sys/shared` como ESM e `@sudo-sys/domain`, `@sudo-sys/application` e `@sudo-sys/infrastructure` como CommonJS na configuração atual.
- **Motivo:** O renderer Vite consome exports nomeados de `shared`, enquanto o processo principal Electron emitido atualmente usa `require()`.
- **Impacto:** Os consumidores usam a API pública de cada pacote em `dist`; qualquer mudança futura de formato deve validar UI, host, desenvolvimento e pacote Electron em conjunto.
- **Autor/origem:** Codex
- **Data:** 2026-09-11

### DEC-0005

- **Status:** Ativa
- **Decisão:** `@sudo-sys/domain` passa a ser publicado como **ESM** (não mais CommonJS), revisando a parte de `DEC-0004` específica a esse pacote. `application` e `infrastructure` continuam CommonJS, sem mudança.
- **Motivo:** A `ACAO-0019` precisou importar o motor de fórmulas (`FormulaEvaluator`/`FormulaValidator`/`contarDiasUteis`) direto no `packages/ui` (bundle Vite/Rollup). O formato CommonJS original de `domain` não bundlava corretamente nesse contexto (Rollup não resolvia os exports nomeados através da cadeia de barrels, mesmo com o shape de módulo comprovadamente correto em runtime). Como `@sudo-sys/domain` nunca teve nenhum consumidor real em CommonJS (`app-host` não o importa; `application` só usa `import type`, que independe do formato de saída), a razão original de `DEC-0004` para esse pacote específico não se aplicava na prática.
- **Impacto:** `packages/domain` segue o mesmo padrão de `@sudo-sys/shared` (`"type": "module"`, condição `"import"` no `package.json`, `tsconfig.json` herdando `ESNext`/`bundler` do `tsconfig.base.json`). Se `app-host` algum dia precisar importar `@sudo-sys/domain` diretamente (hoje não importa), isso vai exigir validação — `app-host` compila para CommonJS.
- **Autor/origem:** Claude
- **Data:** 2026-09-12
- **Ação relacionada:** `ACAO-0019`

## 7. Recomendações ativas para próximos agentes

### REC-0001

- **Status:** Executado
- **Recomendação:** Corrigir o build dos pacotes internos e impedir imports por `src`.
- **Motivo:** O executável distribuído pode falhar ao iniciar.
- **Prioridade:** Crítica
- **Origem:** Codex
- **Data:** 2026-09-11
- **Execução:** Concluída na `ACAO-0006`; os pacotes geram `dist`, expõem API pública e o pacote Electron passou no smoke test sem depender de imports por `/src`.

### REC-0002

- **Status:** Executado
- **Recomendação:** Remover credencial padrão fixa e exigir criação ou troca de senha no primeiro uso.
- **Motivo:** Existe risco de segurança por credenciais conhecidas.
- **Prioridade:** Crítica
- **Origem:** Codex
- **Data:** 2026-09-11
- **Execução:** Concluída na `ACAO-0014` — migration `055_usuario_must_change_password`, canal IPC `auth:trocarSenha`, tela `TrocarSenhaPage.tsx` e ajuste no state machine de `App.tsx` para bloquear o acesso ao Dashboard até a troca; removido também o texto que expunha a credencial no rodapé do `LoginPage.tsx`. Validado via UI real (login → troca forçada → Dashboard liberado → logout/login com senha nova sem nova cobrança).
- **Extensão (`ACAO-0027`):** o enforcement de `must_change_password = 1` original só existia no roteamento do frontend (`App.tsx`) — nenhum handler de IPC verificava o flag, então uma chamada de IPC direta (fora da UI) contornava a troca obrigatória por completo. Corrigido no gate central `app-host/src/ipc/authGuard.ts`: com sessão válida e `must_change_password = 1`, todo canal autenticado é bloqueado exceto `auth:trocarSenha`. `authHandlers.ts` também passou a sincronizar a sessão do `authGuard` (`setSessionUser`) após uma troca de senha real, para não deixar o gate bloqueando o resto do sistema mesmo depois da troca ter funcionado. Validado via IPC direto (CDP) e via UI real (login → Dashboard, sem regressão no caminho feliz). A `REC-0002` continua "Executado"; esta é uma extensão de enforcement, não uma REC nova.

### REC-0003

- **Status:** Parcialmente executado
- **Recomendação:** Criar testes automatizados para cálculos trabalhistas críticos.
- **Motivo:** Rescisão, férias, ponto, INSS e IRRF têm risco funcional e fiscal.
- **Prioridade:** Crítica
- **Origem:** Codex
- **Data:** 2026-09-11
- **Execução:** Parcialmente concluída na `ACAO-0015` — introduzido `vitest` (primeiro framework de testes do projeto, instalado em `packages/infrastructure`) e criada suíte para `calcularIRRF`/`calcularINSS`/`calcularFGTS` (`CalculoFolha.test.ts`), cobrindo os 4 cenários de IRRF e a guarda de competência do redutor da Lei 15.270/2025 validados manualmente nesta sessão. Rodável via `pnpm test` (raiz) ou `pnpm --filter @sudo-sys/infrastructure test`. **Escopo restante pendente:** Rescisão, Férias, Ponto e demais cálculos trabalhistas continuam sem nenhum teste automatizado — restrição de escopo foi instrução explícita do usuário, não limitação técnica.
- **Extensão (`ACAO-0033`):** Rescisão passou a ter suíte própria (`CalculoRescisao.test.ts`, 24 testes, com caracterização prévia do código original). Restam Férias (módulo) e Ponto. Na `ACAO-0035` a suíte de rescisão passou a 33 testes (INSS/IRRF/FGTS rescisórios e cenário (d)).

### REC-0004

- **Status:** Executado
- **Recomendação:** Tornar o recálculo da folha transacional e idempotente.
- **Motivo:** Evitar dados parcialmente atualizados em caso de erro.
- **Prioridade:** Alta
- **Origem:** Codex
- **Data:** 2026-09-11
- **Execução:** Concluída na `ACAO-0016` — `folha:calcular` roda inteiro (todos os funcionários + totais da folha + status) dentro de uma única `runInTransaction`, e `folha_lancamentos` ganhou proteção de unicidade contra automáticos duplicados (migration `056`). Validado com rollback simulado (holerite e lançamentos revertem juntos), recálculo duplo (sem duplicar automáticos, manuais intactos) e a constraint rejeitando duplicata fora do fluxo normal. Item de controle de concorrência (lock) ficou fora do escopo — ver `REC-0015`. **Ajuste de escopo na `ACAO-0017`:** a migration `056` originalmente usava `UNIQUE(folha_id, funcionario_id, rubrica_codigo, origem)` de tabela inteira, o que bloqueava também lançamentos manuais duplicados (fora do escopo pedido); corrigida para um índice único **parcial**, `WHERE origem = 'automatico'` — manuais duplicados voltaram a ser aceitos, automáticos duplicados continuam rejeitados.

### REC-0005

- **Status:** Não executado
- **Recomendação:** Criar padronização de ambiente com `README_AMBIENTE.md`, `.env.example` e avaliar Docker.
- **Motivo:** O projeto pode ser trabalhado por agentes e máquinas diferentes com versões e dependências diferentes.
- **Prioridade:** Alta
- **Origem:** ChatGPT/Codex
- **Data:** 2026-09-11
- **Observação:** `README_AMBIENTE.md` foi criado na `ACAO-0002`; `.env.example` não foi criado por não haver variável manual obrigatória confirmada, e a avaliação prática de Docker continua pendente.

### REC-0006

- **Status:** Executado
- **Recomendação:** Tornar o fluxo `pnpm dev` autocontido e seguro, gerando o preload, preparando `better-sqlite3` para a ABI do Electron e usando um `userData` exclusivo de desenvolvimento.
- **Motivo:** Em instalação limpa, o Electron falha por ABI antes de abrir a interface; o preload não é criado automaticamente e o script atual pode abrir o banco real em `%APPDATA%\Electron`.
- **Prioridade:** Crítica
- **Origem:** Codex
- **Data:** 2026-09-11
- **Execução:** Concluída na `ACAO-0004`.

### REC-0007

- **Status:** Executado
- **Recomendação:** Validar e fixar versões oficiais de Node e pnpm, incluindo `packageManager` e arquivo de versão do Node, sem realizar upgrades em lote.
- **Motivo:** Sem versões fixas, o Corepack pode selecionar outra versão do pnpm e alterar o tratamento de scripts de dependências nativas.
- **Prioridade:** Alta
- **Origem:** Codex
- **Data:** 2026-09-11
- **Execução:** Concluída provisoriamente na `ACAO-0005`.

### REC-0008

- **Status:** Não executado
- **Recomendação:** Validar uma migração controlada do Node 20 para uma linha LTS suportada, incluindo Electron, `better-sqlite3`, build e distribuição.
- **Motivo:** Node 20 encerrou suporte oficial em 2026-04-30; a versão fixada atualmente é apenas um baseline provisório de compatibilidade.
- **Prioridade:** Alta
- **Origem:** Codex
- **Data:** 2026-09-11

### REC-0009

- **Status:** Parcial
- **Recomendação:** Finalizar a higiene e os assets da distribuição Electron, copiando o CSV de CBO e o ícone, removendo fontes TypeScript excedentes do ASAR e validando o instalador completo.
- **Motivo:** O runtime já usa JavaScript compilado, mas o pacote ainda contém fontes desnecessárias e não possui todos os assets ou validações finais de distribuição confirmados.
- **Prioridade:** Alta
- **Origem:** Codex
- **Data:** 2026-09-11
- **Execução:** `ACAO-0020` incluiu e validou o CSV, eliminou fontes TypeScript, gerou o NSIS e passou no smoke test. Ícone oficial, assinatura e instalação efetiva permanecem **A confirmar**. Esta ação era a `ACAO-0014` local e foi renumerada durante a reconciliação documentada na `ACAO-0021` para evitar colisão com a `ACAO-0014` remota. `ACAO-0024` rodou um build real do NSIS e inspecionou o `app.asar` gerado, confirmando na prática: CSV de CBO presente e 0 arquivos `.ts` empacotados. Ícone oficial continua ausente (`app-host/build/icon.ico` não existe no repo) — build confirmou `default Electron icon is used`. Assinatura e instalação/desinstalação efetiva continuam **A confirmar**.

### REC-0010

- **Status:** Não executado
- **Recomendação:** Definir com o usuário o escopo funcional de `custos`, `extras` e `quickcalc` (canais IPC, payloads, regra de negócio) antes de implementar qualquer backend para eles.
- **Motivo:** `custosHandlers.ts`, `extrasHandlers.ts` e `quickCalcHandlers.ts` estão vazios (0 bytes) — não há função, canal IPC ou lógica para "registrar"; `ExtrasPage.tsx` também está vazia. Implementar do zero exige decisão de produto, não é registro mecânico.
- **Prioridade:** Não definida — **A confirmar** com o usuário.
- **Origem:** Claude
- **Data:** 2026-09-11
- **Referência:** `ACAO-0009`.

### REC-0011

- **Status:** Não executado
- **Recomendação:** Decidir quais rotas/canais IPC precisam de restrição por papel (e com qual granularidade — admin-only, operador+, etc.) antes de aplicar qualquer guard novo em `Router.tsx`/`guards.tsx`/`authGuard.ts`.
- **Motivo:** Das 14 rotas do frontend, só `/admin` tem guard de UI (`RequireAdmin`); no backend, só 4 canais (`usuario:list/create/delete`, `admin:backup`) exigem papel admin — todos os outros ~76 canais exigem só sessão autenticada, qualquer papel. Não existe distinção prática entre `operador` e `visualizador` em nenhum lugar do código hoje.
- **Prioridade:** Não definida — **A confirmar** com o usuário.
- **Origem:** Claude
- **Data:** 2026-09-11
- **Referência:** `ACAO-0010`.

### REC-0012

- **Status:** Executado
- **Recomendação:** Corrigir `scripts/test-holerite.ps1` em `main` para usar `window.electronAPI.gerarHolerite` em vez de `folhaGerarPdf` (que não existe mais em `app-host/src/preload.ts`).
- **Motivo:** O script de teste manual de geração de holerite está quebrado em `main`; a branch remota não mergeada `canhoto-wip` já tem a correção do nome, independente do destino dessa branch.
- **Prioridade:** Baixa (script de teste manual, não afeta runtime da aplicação)
- **Origem:** Claude
- **Data:** 2026-09-11
- **Referência:** `ACAO-0011`.
- **Execução:** Concluída na `ACAO-0026` — script atualizado para `gerarHolerite({folhaId, funcionarioId})` (canal `folha:gerar-holerite`), com descoberta dinâmica de empresa/folha/funcionário via IPC (a API real não aceita mais rubricas/totais brutos no payload). Validado gerando um PDF de verdade contra o banco de dev real (`pnpm dev` real, login real, dados mínimos de teste criados via IPC com autorização explícita do usuário). `scripts/seed-test.ps1`, citado como possível mesmo problema, não existe no repositório.

### REC-0013

- **Status:** Não executado
- **Recomendação:** Confirmar com o usuário se o domínio "Chamados" (suporte/tickets), visto na branch remota não mergeada `feature/core-foundation`, ainda é um recurso desejado para o produto antes de decidir o destino final dessa branch.
- **Motivo:** Esse domínio (entidade, repositório, casos de uso, handlers IPC) não existe em `main` nem está documentado em `CONTEXTO_TOTAL.md`; a branch em si é tecnicamente incompatível com a arquitetura atual (usa `sqlite3` assíncrono em vez de `better-sqlite3`), então não é "recuperável" por merge — só como referência de escopo.
- **Prioridade:** Não definida — **A confirmar** com o usuário.
- **Origem:** Claude
- **Data:** 2026-09-11
- **Referência:** `ACAO-0011`.

### REC-0014

- **Status:** Não executado, aguardando decisão do usuário
- **Recomendação:** Decidir se os campos `competencia.vt`/`competencia.vr` do motor de Relatórios Personalizados devem passar a ler de lançamentos automáticos de VT/VR em `folha:calcular` (correção arquitetural — VT/VR virariam lançamento automático, como INSS/IRRF/FGTS) ou se uma leitura aproximada (lançamento manual existente, ou o campo de configuração do funcionário) é aceitável por ora.
- **Motivo:** Hoje `relatorioHandlers.ts:115` retorna `0` fixo para VT/VR porque nada no cálculo de folha gera lançamento automático para essas rubricas (`0102`/`0103`) — diferente de INSS/IRRF/FGTS. Não há uma correção pequena que seja também correta; a decisão de qual caminho seguir é de produto, não só técnica.
- **Prioridade:** Não definida — **A confirmar** com o usuário.
- **Origem:** Claude
- **Data:** 2026-09-11
- **Referência:** `ACAO-0012`. **Não executar sem decisão explícita do usuário.**

### REC-0015

- **Status:** Não executado
- **Recomendação:** Implementar um lock de concorrência para `folha:calcular` (ex.: campo/estado `status = 'calculando'` checado no início do handler, rejeitando uma segunda chamada sobreposta para a mesma folha).
- **Motivo:** Item 3 do diagnóstico da `REC-0004`, deixado de fora por instrução do usuário. Hoje não existe nenhum controle de concorrência — a proteção atual contra clicar "calcular" duas vezes rápido é só um efeito colateral do event loop síncrono de um único processo Node, não uma garantia deliberada. `folha_holerites` já tem `UNIQUE(folha_id, funcionario_id)` e `folha_lancamentos` ganhou um índice único parcial sobre os automáticos (`ACAO-0016`, ajustado na `ACAO-0017`), o que já limita bastante o dano de uma corrida real sobre os automáticos, mas não impede duas transações concorrentes de colidir (uma delas falharia com erro de constraint em vez de simplesmente ser bloqueada de forma amigável).
- **Prioridade:** Não definida — só é necessário se/quando o sistema deixar de ser single-user/single-instância (hoje documentado como tal). Não é uma correção urgente enquanto essa premissa se mantiver.
- **Origem:** Claude
- **Data:** 2026-09-12
- **Referência:** `ACAO-0016`.

### REC-0016

- **Status:** Não executado — pendente de confirmação do usuário
- **Recomendação:** Confirmar em qual máquina/sessão (usuário `holdi`, path `C:\Users\holdi\OneDrive\Documentos\sudo-sys`) ocorreu o bug de ABI mismatch do `better-sqlite3` por sincronização OneDrive de `node_modules`, e se a migração para uma pasta fora de sincronização de nuvem (ex.: `C:\Dev\sudo-sys`) ainda é necessária lá.
- **Motivo:** Foi solicitada essa migração nesta sessão (`ACAO-0029`), mas o ambiente real observado aqui é `C:\Users\JEREeGABI\Documents\sistema\sudo-sys`, que já está fora do OneDrive; não existe usuário `holdi` nesta máquina. A tarefa não foi executada por não se aplicar a este ambiente.
- **Prioridade:** Não definida — **A confirmar** com o usuário.
- **Origem:** Claude
- **Data:** 2026-09-14
- **Referência:** `ACAO-0029`.

### REC-0017

- **Status:** Executado
- **Recomendação:** Corrigir `setup:save-config` (e considerar `setup:get-config`) em `app-host/src/ipc/handlers/setupHandlers.ts` para checar `isInitialized()` e recusar chamadas fora do fluxo legítimo do wizard depois da primeira inicialização — ou trazer esses canais para dentro do gate central de sessão assim que `initialized=true`.
- **Motivo:** Ambos os canais estão em `CANAIS_PUBLICOS` no `authGuard.ts` e o handler nunca verifica `isInitialized()`. Confirmado na prática via IPC direto (CDP), sem nenhum login: `setup:save-config` aceitou sobrescrever `config.json` inteiro (incluindo a seção `database`) tanto antes quanto depois do sistema já estar `initialized:true`, com um payload adversarial simulando `database.host`/`database.user` arbitrários. `setup:get-config` expõe a mesma configuração (que pode conter connection string PostgreSQL em texto puro, per `README_AMBIENTE.md` §10) sem exigir sessão. É a mesma classe de gap da `REC-0002` original: canal que deveria ter deixado de ser acessível após um certo estado do sistema, mas ficou público indefinidamente.
- **Prioridade:** Crítica — exploração confirmada na prática, sem necessidade de credenciais.
- **Origem:** Claude
- **Data:** 2026-09-14
- **Referência:** `ACAO-0030`.
- **Execução:** Concluída na `ACAO-0032` — `authGuard.ts` passou a checar `isInitialized()` para `setup:save-config`/`setup:get-config`: públicos só enquanto `false` (wizard de primeira configuração); a partir de `true`, exigem sessão + papel admin (mesmo padrão de `CANAIS_ADMIN`). Validado via IPC direto (CDP) nos 3 cenários pedidos: (a) pré-init sem sessão continua funcionando; (b) pós-init sem sessão passou a ser rejeitado (ataque original da `ACAO-0030` bloqueado); (c) pós-init com sessão admin (e senha já trocada) continua funcionando normalmente. `pnpm test` 36/36 sem regressão.

### REC-0018

- **Status:** Não executado
- **Recomendação:** Avaliar se `auth:register` deve ser removido (não tem consumidor de UI hoje) ou migrado para usar o gate central por `webContents` como os demais canais administrativos, em vez do mecanismo próprio de autorização por `requestingToken` passado como parâmetro.
- **Motivo:** `auth:register` está em `CANAIS_PUBLICOS` (não passa pela checagem central de sessão por `webContents`) e faz sua própria verificação de admin via um token recebido como argumento — mecanismo mais fraco do que o resto do sistema, que amarra a sessão ao `event.sender.id` (não forjável pelo renderer). Nenhuma tela chama esse canal hoje (confirmado por busca recursiva em `packages/ui/src`), mas ele continua totalmente alcançável via IPC direto; se um token de admin vazar, esse canal contorna o gate central.
- **Prioridade:** Baixa — sem consumidor de UI ativo hoje; risco só se materializa se um token de admin vazar.
- **Origem:** Claude
- **Data:** 2026-09-14
- **Referência:** `ACAO-0030`.

### REC-0019

- **Status:** A confirmar — aguardando decisão do usuário
- **Recomendação:** Decidir as regras de rescisão abaixo, que ficaram **sem correção** na `ACAO-0033` porque a regra correta não pôde ser confirmada com segurança. Hoje todas mantêm o comportamento do código original.
  1. **Justa causa × férias proporcionais e 13º proporcional:** o sistema **paga** as duas verbas. A CLT (art. 146 p.ú.), a Lei 4.090/62 (art. 3º) e a Súmula 171/TST as negam, mas o TST afetou o **IRR Tema 96** exatamente sobre isso (afetação publicada em 07/05/2025, sem tese, sem suspensão de processos) e há turmas concedendo com base na Convenção 132 da OIT. Opções: seguir a lei e as súmulas vigentes (zerar) até a tese sair, ou manter.
  2. **Acordo mútuo — projeção do aviso indenizado** (pago pela metade, art. 484-A I a) nos avos de férias/13º: hoje **não projeta**. Falta confirmar se projeta os dias integrais, a metade ou nada.
  3. **Motivo "aposentadoria":** o aviso indenizado continua fixo em 30 dias, sem proporcionalidade nem projeção. Falta confirmar o que esse motivo representa no produto (aposentadoria espontânea não extingue o contrato por si só) e qual regra aplicar.
  4. **Aviso trabalhado com mais de 1 ano de casa:** os dias adicionais da Lei 12.506/2011 além de 30 não são calculados. Falta confirmar se devem ser indenizados ou trabalhados.
  5. **Pedido de demissão sem cumprir aviso:** o desconto do aviso pelo empregador (CLT art. 487 §2º) é faculdade, não obrigação; hoje não é automatizado (só via "outros descontos"). Falta decidir se deve virar campo/opção.
  6. **Projeção que completa novo período aquisitivo:** os avos de férias ficam limitados ao período em curso na data da demissão (teto 12/12). Falta confirmar o tratamento do período que se completa só com a projeção.
- **Motivo:** Guardrail da tarefa: só corrigir divergência confirmada contra fonte oficial; em dúvida, reportar e não presumir.
- **Prioridade:** Alta para o item 1 (afeta quem é dispensado por justa causa); média para os demais.
- **Origem:** Claude
- **Data:** 2026-09-14
- **Referência:** `ACAO-0033`.

### REC-0020

- **Status:** Executado — `ACAO-0035` (2026-09-16). Plano aprovado em `docs/plano-rec-0020.md`; pontos em dúvida em `REC-0021`.
- **Recomendação:** Implementar, no módulo de Rescisão, (a) o cálculo de INSS e IRRF rescisórios com **separação entre verbas indenizatórias e tributáveis** (aviso prévio indenizado, férias indenizadas + 1/3 e multa FGTS × saldo de salário, 13º e aviso trabalhado; 13º com tributação separada), reaproveitando `calcularINSS`/`calcularIRRF`; (b) o depósito de FGTS do mês da rescisão e do anterior (Lei 8.036/90 art. 18 caput); (c) a multa FGTS calculada (40% / 20% no art. 484-A) a partir do saldo da conta vinculada, se o produto passar a guardar esse saldo.
- **Motivo:** Hoje INSS, IRRF e multa FGTS são **digitados à mão** em R$ — não há fórmula nem classificação de incidência, então o risco de base errada (mesma classe do bug do `[9e]` no IRRF) fica inteiramente com o usuário. As fontes de incidência (Lei 8.212/91 art. 28 §9º, Lei 7.713/88 art. 6º, RIR/2018, posição da RFB/PGFN) **não foram levantadas nem validadas** na `ACAO-0033` e precisam ser, antes da implementação.
- **Prioridade:** Alta (risco fiscal).
- **Origem:** Claude
- **Data:** 2026-09-14
- **Referência:** `ACAO-0033`; executada na `ACAO-0035`.

### REC-0021

- **Status:** A confirmar — item 1 decidido pelo usuário, mas **contestado**; itens 2 e 3 aguardando decisão
- **Recomendação:** Acompanhar/decidir os pontos abaixo, implementados na `ACAO-0035` com o comportamento indicado:
  1. **FGTS do aviso prévio indenizado na base da multa de 40%/20% — CONTESTADO / sem tese firmada no TST.** Decisão do usuário (2026-09-16): **incluir**, junto com os demais depósitos. Fundamento: Lei 8.036/90 art. 18 §1º e Decreto 99.684/90 art. 9º §1º ("todos os depósitos realizados na conta vinculada durante a vigência do contrato", sem dedução de saques; lidos em planalto.gov.br) não excluem depósito por origem nem mencionam aviso prévio; Súmula 305/TST (FGTS devido sobre o aviso). A OJ 42, II, SBDI-1 ("desconsiderada a projeção do aviso prévio indenizado") trata da **data** do saldo, não da exclusão do depósito. **Ambiguidade:** o TST, no RR-1001438-06.2018.5.02.0043, excluiu na prática "a incidência da multa de 40% do FGTS sobre o aviso prévio indenizado" citando a OJ 42 II com fundamentação pouco clara, e há crítica publicada (Guia Trabalhista, 2018) apontando conflito com a Súmula 305. O comportamento implementado segue a **prática operacional da CAIXA** (manual de recolhimentos rescisórios — PDF não lido diretamente, só via resumo de busca), não uma tese fixada. Sinalizado com nota na aba Proventos e no PDF. Mesmo padrão do Tema 96 (`REC-0019`): reavaliar se surgir tese/IRR.
  2. **"Outros proventos":** natureza desconhecida — ficam **fora** das bases de INSS, IRRF e FGTS (entram só no total); aviso na tela quando > 0. Falta decidir se o campo deve ser classificado por natureza (ex.: vincular a rubricas com incidências).
  3. **Redutor da Lei 15.270/2025 no 13º:** aplicado sobre o **valor bruto** do 13º (mesmo critério do saldo de salário). Não afeta cenários de 2025; a página da Receita que poderia confirmar tratamento diferenciado exigia login. Confirmar antes de rescisões com competência ≥ 2026-01 envolvendo 13º entre R$ 5.000 e R$ 7.350.
- **Motivo:** Guardrail: registrar como contestado/a confirmar o que não tem fonte oficial pacificada, em vez de apresentar como certeza.
- **Prioridade:** Média (item 1 afeta toda dispensa sem justa causa/acordo com aviso indenizado; itens 2 e 3 são casos mais restritos).
- **Origem:** Claude
- **Data:** 2026-09-16
- **Referência:** `ACAO-0035`; `docs/plano-rec-0020.md`.

## 8. Ambiente padrão do projeto

- **Estratégia de ambiente:** Documentada em `README_AMBIENTE.md`; instalação e desenvolvimento validados; versões fixadas provisoriamente na `ACAO-0005`.
- **Docker utilizado:** Não identificado no projeto nem no ambiente observado.
- **Docker necessário:** Parcial/opcional; não recomendado como ambiente principal neste momento.
- **Node recomendado:** 20.20.2, provisório; Node 20 está fora de suporte e deve ser migrado após validação controlada.
- **Gerenciador de pacotes:** pnpm 9.15.9, fixado em `packageManager` e `engines`.
- **Banco de dados local:** SQLite.
- **Serviços externos:** ViaCEP é chamado pela UI para consulta de CEP; outros serviços externos estão **A confirmar**. PostgreSQL pode ser testado no wizard, mas não é o banco efetivo do runtime.
- **Variáveis de ambiente:** A confirmar. Foi identificado o uso de `VITE_DEV_SERVER_URL` no fluxo de desenvolvimento Electron.
- **Arquivo de exemplo de ambiente:** `.env.example` não criado; reavaliar se surgir variável manual obrigatória.
- **Documentação de ambiente:** `README_AMBIENTE.md`, criado em 2026-09-11.
- **Comando de instalação:** `pnpm install --frozen-lockfile`.
- **Comando de typecheck:** `pnpm typecheck`; passou na `ACAO-0006` e compila os pacotes internos antes da verificação.
- **Comando de lint:** `pnpm lint`. Atualmente não executa lint real.
- **Comando de build:** `pnpm build`; compila `shared`, `domain`, `application` e `infrastructure` antes da UI e do `app-host`.
- **Comando de teste:** `pnpm test` (raiz) roda `packages/domain` e `packages/infrastructure` em sequência (69 testes no total desde a `ACAO-0035`); `pnpm --filter @sudo-sys/domain test` ou `pnpm --filter @sudo-sys/infrastructure test` isoladamente. Cobertura: IRRF/INSS/FGTS, transação de folha, motor de fórmulas e cálculo de rescisão; Férias (módulo) e Ponto continuam sem teste automatizado. Validação de rescisão via IPC real: `scripts/cdp-rescisao-verify.mjs` (usar `--user-data-dir` descartável).
- **Desenvolvimento limpo:** Validado. `pnpm dev` gera preload e reconstrói `better-sqlite3` automaticamente antes de iniciar Electron.
- **Isolamento do banco de desenvolvimento:** Confirmado em `<raiz>/.dev-user-data`, via `--user-data-dir` explícito; Linux e macOS continuam **A confirmar**.

Nenhum agente deve corrigir erro de execução antes de verificar se o ambiente local está seguindo a documentação de ambiente ou o Docker, quando existir.

## 9. Riscos e cuidados

- Não alterar múltiplas áreas ao mesmo tempo sem registrar.
- Não apagar histórico anterior.
- Não refatorar antes de validar o build e o modo de execução afetado.
- Não fazer upgrades grandes em lote.
- Não usar o sistema para pagamentos reais antes de corrigir os riscos críticos.
- Sempre atualizar `HISTORICO_AGENTES.md` após mudanças relevantes.
- Sempre atualizar `CONTEXTO_TOTAL.md` se o estado atual mudar.
- Não tratar erro de ambiente como erro de código sem antes validar dependências, versão de Node, pnpm e instruções de ambiente.
- Não assumir que build concluído significa que o executável distribuído inicia; validar o binário empacotado.
- Não considerar uma recomendação como executada sem evidência e registro de uma nova ação.
- Preservar comportamento existente ao estabilizar regras trabalhistas e criar testes de caracterização antes de modificá-las.

## 10. Próximo passo recomendado

`REC-0002` foi executada na `ACAO-0014`. `REC-0003` foi parcialmente executada na `ACAO-0015` (só o motor IRRF/INSS/FGTS). `REC-0004` foi executada na `ACAO-0016` (transação + constraint; lock de concorrência virou `REC-0015` separada). `REC-0017` foi executada na `ACAO-0032`. Não há uma única próxima ação definida entre as demais — várias recomendações continuam ativas e não executadas, aguardando priorização do usuário:

1. `REC-0009` — fornecer um ícone oficial, tratar assinatura e validar instalação/desinstalação do NSIS em ambiente autorizado; a inclusão do CSV, a remoção das fontes excedentes e o smoke test foram concluídos parcialmente na `ACAO-0020`.
2. `REC-0003` (restante) — estender os testes automatizados para Rescisão, Férias, Ponto e demais cálculos trabalhistas críticos.
3. `REC-0008` — planejar (sem executar ainda) a migração controlada de Node 20 para uma linha LTS suportada.
4. `REC-0010` — definir o escopo funcional de `custos`/`extras`/`quickcalc` antes de implementar qualquer backend para eles.
5. `REC-0011` — decidir a granularidade de RBAC por rota/canal antes de aplicar qualquer guard novo.
6. `REC-0013` — confirmar se o domínio "Chamados" ainda é um recurso desejado.
7. `REC-0014` — decidir o tratamento de VT/VR no motor de Relatórios Personalizados. **Não executar sem decisão explícita do usuário.**
8. `REC-0015` — lock de concorrência para `folha:calcular`. Só necessário se/quando o sistema deixar de ser single-user/single-instância.
9. `REC-0016` — confirmar em qual máquina/sessão (`holdi`, OneDrive) a migração de path do projeto ainda é necessária.
10. `REC-0018` — avaliar remoção ou migração de `auth:register` para o gate central; prioridade baixa, sem consumidor de UI hoje.
11. `REC-0019` — decidir as regras de rescisão `[A CONFIRMAR]` (justa causa × IRR Tema 96/TST, projeção no acordo, aposentadoria, dias adicionais com aviso trabalhado, desconto do aviso no pedido de demissão). **Não alterar sem decisão do usuário.**
12. `REC-0021` — pontos `[A CONFIRMAR]` dos INSS/IRRF/FGTS rescisórios: FGTS do aviso indenizado na base da multa (decidido: incluir, mas **contestado**, sem tese no TST), natureza de "outros proventos", redutor Lei 15.270 no 13º. (`REC-0020` executada na `ACAO-0035`.)

`REC-0012` foi executada na `ACAO-0026` — `scripts/test-holerite.ps1` corrigido e validado com PDF real gerado contra o banco de dev.

`[7a]` (motor de fórmulas) foi concluído na `ACAO-0019` — motor implementado (`ACAO-0018`) e conectado à UI (botão "ƒ" em `LancamentosEditor.tsx`), validado via UI real. Não é mais um item pendente.

A reconciliação da `ACAO-0021` não iniciou nenhuma nova REC nem alterou a prioridade das recomendações pendentes.

## 11. Referência do histórico

O histórico detalhado das ações dos agentes está no arquivo `HISTORICO_AGENTES.md`. A referência específica de ambiente está em `README_AMBIENTE.md`.
