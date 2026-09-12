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

Antes de sugerir ou alterar qualquer coisa no projeto, todo agente deve:

1. Ler este arquivo.
2. Ler o `HISTORICO_AGENTES.md`.
3. Identificar o estado atual do projeto.
4. Verificar a fase atual.
5. Verificar recomendações pendentes.
6. Verificar decisões técnicas já tomadas.
7. Evitar mudanças grandes sem justificativa.
8. Registrar qualquer ação relevante no histórico.
9. Atualizar este arquivo se o estado atual do projeto mudar.

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
- **Última ação registrada:** `ACAO-0016` — Claude tornou `folha:calcular` transacional (todo o recálculo da folha — todos os funcionários, holerites e lançamentos automáticos — roda dentro de uma única `runInTransaction`) e adicionou `UNIQUE(folha_id, funcionario_id, rubrica_codigo, origem)` em `folha_lancamentos` (migration `056`). Validado com 3 testes novos (rollback completo, idempotência, constraint em ação) — 10/10 testes passando. Ver `HISTORICO_AGENTES.md` para o detalhamento completo (inclui também `ACAO-0009` a `ACAO-0015`, ações anteriores).
- **Próxima ação recomendada:** aguardando decisão do usuário sobre qual recomendação executar em seguida — candidatas ativas: `REC-0009`, `REC-0008`, `REC-0010`, `REC-0011`, `REC-0012`, `REC-0013`, `REC-0014`, `REC-0015`, e o restante de `REC-0003` (Rescisão/Férias/Ponto) (ver seção 7).
- **Uso em produção:** Não recomendado antes das correções críticas e dos testes de cálculo.

## 2. Objetivo do projeto

O SUDO SYS é, ou aparenta ser, um aplicativo desktop para gestão de folha de pagamento e rotinas relacionadas. A interface existente contempla empresas, funcionários, folhas por competência, rubricas, férias, rescisões, registros de ponto, relatórios, documentos, cálculos rápidos, custos, CBO, autenticação e administração.

O escopo fiscal definitivo, incluindo eSocial, obrigações acessórias e uso multiusuário, está **A confirmar**. No estado atual, o projeto deve ser tratado como protótipo funcional em estabilização, não como sistema pronto para processar pagamentos reais.

## 3. Como o projeto está organizado

- **`packages/ui`:** interface React/Vite, páginas, formulários, componentes, rotas, estado Zustand e cliente IPC. É uma das áreas mais completas do projeto.
- **`app-host`:** processo principal e preload do Electron, registro dos handlers IPC, inicialização do banco SQLite, autenticação, configuração inicial e geração de PDFs. É o backend efetivo da aplicação.
- **`packages/shared`:** tipos e contratos compartilhados entre UI e host. Parte dos arquivos planejados está vazia.
- **`packages/domain`:** entidades, enums, value objects, serviços e motor de fórmulas da arquitetura de domínio pretendida. Essa camada não governa o runtime atual e contém implementações muito pequenas ou incompletas.
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

Não foram encontrados secrets, tokens ou chaves privadas versionados. Foram encontrados riscos relevantes: configuração de conexão potencialmente sensível salva em texto puro, canais de setup públicos após a inicialização, autorização limitada a uma distinção parcial de administrador e ausência de auditoria funcional. O risco de credencial padrão conhecida (`admin@sudosys.local`/`admin123`) foi mitigado na `ACAO-0014` (`REC-0002`): o seed do admin agora nasce marcado para troca obrigatória de senha no primeiro login, e a UI não expõe mais a credencial.

### Performance

O processo principal executa operações síncronas de SQLite, hash de senha, filesystem e parte da geração de PDFs. Listagens são majoritariamente sem paginação, há poucos limites explícitos, faltam índices de consulta planejados e o cálculo de folha realiza múltiplas operações por funcionário. Medições formais de desempenho estão **A confirmar**.

### Testes

Desde a `ACAO-0015` existe um framework de testes (`vitest`) e uma suíte funcional (`pnpm test`), mas cobrindo só o motor de cálculo IRRF/INSS/FGTS (`packages/infrastructure/src/services/CalculoFolha.test.ts`, 7 testes). Rescisão, férias, ponto e os demais cálculos trabalhistas continuam sem nenhum teste automatizado (`REC-0003` parcialmente executada).

### Motor de cálculo (IRRF) e schema de funcionários

A `ACAO-0008` corrigiu `calcularIRRF` (`packages/infrastructure/src/services/CalculoFolha.ts`): o redutor da Lei 15.270/2025 (teto R$7.350, fórmula `978,62 - 0,133145 × rendimento`) agora usa o salário bruto do funcionário (5º parâmetro opcional `salarioBruto`, com fallback para a base líquida se omitido), não mais a base já líquida de INSS/dependentes — evitando redução indevida de IRRF para quem tem bruto acima do teto mas base líquida na faixa de transição. `folhaHandlers.ts` já passa `baseIrrf` (pré-INSS) nesse parâmetro.

A tabela `funcionarios` (`app-host/src/db/database.ts`) ganhou a migration `054_funcionario_regime_irrf_check`, restringindo `regime_irrf` a `'dependentes'`/`'simplificado'` via CHECK constraint (recriação de tabela, padrão SQLite). Aplicada e validada no banco de dev real, que estava vazio de funcionários no momento da aplicação.

### Build

Os quatro pacotes internos agora geram JavaScript e declarações em `dist`, expõem entradas públicas e são compilados antes dos consumidores. Os 19 imports privados do `app-host` foram substituídos pela API pública de `@sudo-sys/infrastructure`; não restaram imports por `/src` no código-fonte ou no JavaScript gerado. Um pacote Electron em diretório alternativo abriu `#/setup` a partir do `app.asar`, sem `MODULE_NOT_FOUND`, erro de preload ou ABI. Permanecem pendentes a cópia do CSV completo de CBO, o ícone, a exclusão de fontes TypeScript excedentes do ASAR e a validação do instalador completo.

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

- **Status:** Ativa
- **Decisão:** Publicar `@sudo-sys/shared` como ESM e `@sudo-sys/domain`, `@sudo-sys/application` e `@sudo-sys/infrastructure` como CommonJS na configuração atual.
- **Motivo:** O renderer Vite consome exports nomeados de `shared`, enquanto o processo principal Electron emitido atualmente usa `require()`.
- **Impacto:** Os consumidores usam a API pública de cada pacote em `dist`; qualquer mudança futura de formato deve validar UI, host, desenvolvimento e pacote Electron em conjunto.
- **Autor/origem:** Codex
- **Data:** 2026-09-11

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

### REC-0003

- **Status:** Parcialmente executado
- **Recomendação:** Criar testes automatizados para cálculos trabalhistas críticos.
- **Motivo:** Rescisão, férias, ponto, INSS e IRRF têm risco funcional e fiscal.
- **Prioridade:** Crítica
- **Origem:** Codex
- **Data:** 2026-09-11
- **Execução:** Parcialmente concluída na `ACAO-0015` — introduzido `vitest` (primeiro framework de testes do projeto, instalado em `packages/infrastructure`) e criada suíte para `calcularIRRF`/`calcularINSS`/`calcularFGTS` (`CalculoFolha.test.ts`), cobrindo os 4 cenários de IRRF e a guarda de competência do redutor da Lei 15.270/2025 validados manualmente nesta sessão. Rodável via `pnpm test` (raiz) ou `pnpm --filter @sudo-sys/infrastructure test`. **Escopo restante pendente:** Rescisão, Férias, Ponto e demais cálculos trabalhistas continuam sem nenhum teste automatizado — restrição de escopo foi instrução explícita do usuário, não limitação técnica.

### REC-0004

- **Status:** Executado
- **Recomendação:** Tornar o recálculo da folha transacional e idempotente.
- **Motivo:** Evitar dados parcialmente atualizados em caso de erro.
- **Prioridade:** Alta
- **Origem:** Codex
- **Data:** 2026-09-11
- **Execução:** Concluída na `ACAO-0016` — `folha:calcular` roda inteiro (todos os funcionários + totais da folha + status) dentro de uma única `runInTransaction`, e `folha_lancamentos` ganhou `UNIQUE(folha_id, funcionario_id, rubrica_codigo, origem)` (migration `056`). Validado com rollback simulado (holerite e lançamentos revertem juntos), recálculo duplo (sem duplicar automáticos, manuais intactos) e a constraint rejeitando duplicata fora do fluxo normal. Item de controle de concorrência (lock) ficou fora do escopo — ver `REC-0015`.

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

- **Status:** Não executado
- **Recomendação:** Finalizar a higiene e os assets da distribuição Electron, copiando o CSV de CBO e o ícone, removendo fontes TypeScript excedentes do ASAR e validando o instalador completo.
- **Motivo:** O runtime já usa JavaScript compilado, mas o pacote ainda contém fontes desnecessárias e não possui todos os assets ou validações finais de distribuição confirmados.
- **Prioridade:** Alta
- **Origem:** Codex
- **Data:** 2026-09-11

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

- **Status:** Não executado
- **Recomendação:** Corrigir `scripts/test-holerite.ps1` em `main` para usar `window.electronAPI.gerarHolerite` em vez de `folhaGerarPdf` (que não existe mais em `app-host/src/preload.ts`).
- **Motivo:** O script de teste manual de geração de holerite está quebrado em `main`; a branch remota não mergeada `canhoto-wip` já tem a correção do nome, independente do destino dessa branch.
- **Prioridade:** Baixa (script de teste manual, não afeta runtime da aplicação)
- **Origem:** Claude
- **Data:** 2026-09-11
- **Referência:** `ACAO-0011`.

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
- **Motivo:** Item 3 do diagnóstico da `REC-0004`, deixado de fora por instrução do usuário. Hoje não existe nenhum controle de concorrência — a proteção atual contra clicar "calcular" duas vezes rápido é só um efeito colateral do event loop síncrono de um único processo Node, não uma garantia deliberada. `folha_holerites` já tem `UNIQUE(folha_id, funcionario_id)` e `folha_lancamentos` ganhou `UNIQUE(folha_id, funcionario_id, rubrica_codigo, origem)` na `ACAO-0016`, o que já limita bastante o dano de uma corrida real, mas não impede duas transações concorrentes de colidir (uma delas falharia com erro de constraint em vez de simplesmente ser bloqueada de forma amigável).
- **Prioridade:** Não definida — só é necessário se/quando o sistema deixar de ser single-user/single-instância (hoje documentado como tal). Não é uma correção urgente enquanto essa premissa se mantiver.
- **Origem:** Claude
- **Data:** 2026-09-12
- **Referência:** `ACAO-0016`.

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
- **Comando de teste:** `pnpm test` (raiz) ou `pnpm --filter @sudo-sys/infrastructure test` — roda a suíte `vitest` do motor de cálculo IRRF/INSS/FGTS (`ACAO-0015`). Cobertura ainda restrita a esse motor; outras áreas (Rescisão, Férias, Ponto) continuam sem teste automatizado.
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

`REC-0002` foi executada na `ACAO-0014`. `REC-0003` foi parcialmente executada na `ACAO-0015` (só o motor IRRF/INSS/FGTS). `REC-0004` foi executada na `ACAO-0016` (transação + constraint; lock de concorrência virou `REC-0015` separada). Não há uma única próxima ação definida entre as demais — várias recomendações continuam ativas e não executadas, aguardando priorização do usuário:

1. `REC-0009` — finalizar os assets da distribuição Electron, remover fontes excedentes do ASAR e validar o instalador completo.
2. `REC-0003` (restante) — estender os testes automatizados para Rescisão, Férias, Ponto e demais cálculos trabalhistas críticos.
3. `REC-0008` — planejar (sem executar ainda) a migração controlada de Node 20 para uma linha LTS suportada.
4. `REC-0010` — definir o escopo funcional de `custos`/`extras`/`quickcalc` antes de implementar qualquer backend para eles.
5. `REC-0011` — decidir a granularidade de RBAC por rota/canal antes de aplicar qualquer guard novo.
6. `REC-0012` — corrigir `scripts/test-holerite.ps1` em `main` (nome de API desatualizado; baixa prioridade, script de teste manual).
7. `REC-0013` — confirmar se o domínio "Chamados" ainda é um recurso desejado.
8. `REC-0014` — decidir o tratamento de VT/VR no motor de Relatórios Personalizados. **Não executar sem decisão explícita do usuário.**
9. `REC-0015` — lock de concorrência para `folha:calcular`. Só necessário se/quando o sistema deixar de ser single-user/single-instância.

## 11. Referência do histórico

O histórico detalhado das ações dos agentes está no arquivo `HISTORICO_AGENTES.md`. A referência específica de ambiente está em `README_AMBIENTE.md`.
