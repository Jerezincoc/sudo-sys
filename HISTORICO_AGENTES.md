# HISTÓRICO DE AGENTES DO PROJETO

## Finalidade deste arquivo

Este arquivo é o registro vivo das ações realizadas no projeto por agentes de IA ou desenvolvedores. Ele funciona como um Git log detalhado e explicado, com contexto técnico adicional sobre cada intervenção.

O registro deve permitir que qualquer agente futuro entenda:

- o que foi feito;
- quem fez;
- quando foi feito;
- por que foi feito;
- quais arquivos foram alterados;
- quais problemas foram encontrados;
- quais melhorias foram aplicadas;
- quais decisões técnicas foram tomadas;
- quais recomendações ficaram para depois;
- quais riscos ou pendências ainda existem.

Este arquivo deve ser atualizado continuamente. O fato de uma mudança também existir no Git não elimina a necessidade de explicar aqui sua finalidade, seu impacto e as pendências resultantes.

## Regras obrigatórias para agentes

1. Nunca apagar histórico anterior.
2. Sempre adicionar novas ações no final do arquivo.
3. Sempre usar o próximo ID disponível.
4. Sempre informar o autor da ação.
5. Sempre informar a data da ação.
6. Sempre informar arquivos alterados ou analisados.
7. Sempre explicar o motivo da ação.
8. Sempre registrar riscos, pendências ou recomendações quando existirem.
9. Não marcar ideia como feita se ela ainda não foi executada.
10. Ideias devem ser registradas como recomendação com status `Não executado`.
11. Decisões técnicas devem ser registradas como decisão, não como correção.
12. Se algo não estiver confirmado, escrever `A confirmar`.
13. Não inventar informações.
14. Não reescrever o histórico para parecer mais organizado.
15. Não remover entradas antigas, mesmo que estejam incompletas.
16. Se corrigir algo feito por outro agente, registrar uma nova ação explicando a correção.
17. Se a ação mudar o estado atual do projeto, atualizar também o `CONTEXTO_TOTAL.md`.
18. Se a ação envolver ambiente, dependências, Docker, Node, pnpm ou scripts, registrar isso claramente.

## Diferença entre ação, recomendação e decisão técnica

### Ação

É algo realmente feito.

Exemplos:

- diagnóstico realizado;
- arquivo alterado;
- bug corrigido;
- dependência removida;
- estrutura reorganizada;
- teste criado;
- documentação atualizada.

Usar ID no formato:

`ACAO-0001`

### Recomendação

É uma ideia, sugestão ou próximo passo que ainda pode ou não ser executado.

Exemplos:

- criar testes;
- refatorar uma pasta;
- melhorar tipagem;
- revisar segurança;
- trocar biblioteca;
- separar responsabilidades;
- validar build antes de deploy;
- criar Dockerfile;
- criar `README_AMBIENTE.md`.

Usar ID no formato:

`REC-0001`

Status possíveis:

- Não executado
- Em análise
- Executado
- Cancelado
- A confirmar

### Decisão técnica

É uma escolha feita sobre o rumo do projeto.

Exemplos:

- manter a arquitetura atual temporariamente;
- não refatorar determinada parte agora;
- usar determinada biblioteca;
- evitar alteração no comportamento existente;
- priorizar correções pequenas antes de grandes mudanças.

Usar ID no formato:

`DEC-0001`

## Como novos agentes devem usar este arquivo

Antes de alterar o projeto, o agente deve:

1. Ler `CONTEXTO_TOTAL.md`.
2. Ler `HISTORICO_AGENTES.md`.
3. Identificar a fase atual do projeto.
4. Verificar recomendações pendentes.
5. Verificar decisões técnicas já tomadas.
6. Verificar riscos críticos.
7. Verificar se existe orientação de ambiente.
8. Evitar repetir trabalho já feito.
9. Evitar desfazer decisões anteriores sem justificar.
10. Fazer alterações pequenas e rastreáveis.
11. Registrar uma nova ação após concluir qualquer mudança relevante.

## Relação com o CONTEXTO_TOTAL.md

- `CONTEXTO_TOTAL.md` mostra o estado atual.
- `HISTORICO_AGENTES.md` mostra o histórico acumulado.
- Se uma ação mudar o estado atual, os dois arquivos devem ser atualizados.
- Se uma ação for apenas recomendação, anotação ou registro histórico, pode ser suficiente atualizar apenas este arquivo.

## Padrão de ID

Usar sempre o próximo número disponível:

- `ACAO-0001`, `ACAO-0002`, `ACAO-0003` para ações.
- `REC-0001`, `REC-0002`, `REC-0003` para recomendações.
- `DEC-0001`, `DEC-0002`, `DEC-0003` para decisões técnicas.

Nunca reutilizar IDs antigos. Se houver dúvida sobre o próximo ID, procurar a última entrada existente de cada categoria e continuar a numeração.

Quando a mesma ação, recomendação ou decisão aparecer no `CONTEXTO_TOTAL.md`, deve conservar o mesmo ID nos dois arquivos. Essa repetição representa uma referência sincronizada ao mesmo registro, não um novo registro.

## Histórico

### ACAO-0001 — 2026-09-11 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Diagnóstico / Registro de contexto
- **Status:** Concluído
- **Resumo:**
  - Foi criado o sistema de memória técnica do projeto usando os arquivos `CONTEXTO_TOTAL.md` e `HISTORICO_AGENTES.md`.
  - O objetivo foi permitir que agentes de IA e desenvolvedores entendam o estado atual, o histórico, as decisões e as recomendações do projeto.
- **O que foi encontrado:**
  - Projeto Electron com React, TypeScript, Vite, SQLite e pnpm monorepo.
  - Projeto com boa base de protótipo, mas ainda com baixa confiabilidade operacional e fiscal.
  - Riscos críticos em build/distribuição Electron, credencial padrão, cálculos trabalhistas, ausência de testes e arquitetura concorrente.
- **O que foi mudado:**
  - Criado `CONTEXTO_TOTAL.md`.
  - Criado `HISTORICO_AGENTES.md`.
  - Nenhum arquivo de código-fonte foi alterado nesta ação.
- **O que foi melhorado:**
  - O projeto passou a ter uma memória técnica local.
  - Próximos agentes poderão continuar o trabalho com menos risco de perda de contexto.
  - Recomendações, decisões e ações passaram a ter padrão de registro.
- **Por que foi feito:**
  - Para evitar que agentes diferentes trabalhem sem contexto, repitam decisões, desfaçam ações anteriores ou confundam problema de ambiente com problema de código.
- **Arquivos envolvidos:**
  - `CONTEXTO_TOTAL.md`
  - `HISTORICO_AGENTES.md`
- **Impacto esperado:**
  - Maior rastreabilidade das ações.
  - Continuidade mais segura entre agentes diferentes.
  - Melhor organização para correções futuras.
- **Riscos ou observações:**
  - Os arquivos precisam ser mantidos atualizados após cada ação relevante.
  - Recomendações não executadas não devem ser tratadas como correções já aplicadas.
  - O diagnóstico não corrige os problemas encontrados; apenas registra o estado observado.
- **Decisões técnicas registradas nesta ação:**
  - `DEC-0001`: assumir temporariamente o projeto como monólito modular Electron.
  - `DEC-0002`: não realizar refatorações grandes antes de corrigir riscos críticos, build, segurança e testes.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0001`: corrigir o build dos pacotes internos e impedir imports por `src`.
  - `REC-0002`: remover a credencial padrão fixa e exigir criação ou troca de senha no primeiro uso.
  - `REC-0003`: criar testes automatizados para cálculos trabalhistas críticos.
  - `REC-0004`: tornar o recálculo da folha transacional e idempotente.
  - `REC-0005`: criar `README_AMBIENTE.md`, `.env.example` e avaliar Docker.
  - Ler `CONTEXTO_TOTAL.md` e `HISTORICO_AGENTES.md` antes de qualquer alteração.
  - Analisar o ambiente de execução antes de corrigir erros locais.
  - Corrigir primeiro os riscos críticos do diagnóstico.
- **Próxima ação sugerida:**
  - Analisar o ambiente de execução do projeto sem alterar código, para decidir se `Dockerfile`, `docker-compose.yml`, `.env.example` e `README_AMBIENTE.md` são necessários.

## Decisões técnicas registradas

### DEC-0001 — 2026-09-11 — Codex

- **Status:** Ativa
- **Decisão:** Assumir temporariamente o projeto como monólito modular Electron.
- **Motivo:** A Clean Architecture existe parcialmente, mas não governa o runtime atual.
- **Impacto:** Priorizar estabilização, handlers mais finos, serviços por módulo, repositórios encapsulados e contratos IPC validados em runtime.
- **Autor/origem:** Codex
- **Ação relacionada:** `ACAO-0001`

### DEC-0002 — 2026-09-11 — Codex

- **Status:** Ativa
- **Decisão:** Não realizar refatorações grandes antes de corrigir riscos críticos, build, segurança e testes.
- **Motivo:** Reduzir o risco de quebrar comportamento existente.
- **Impacto:** Mudanças futuras devem ser pequenas, rastreáveis e registradas.
- **Autor/origem:** Codex
- **Ação relacionada:** `ACAO-0001`

## Recomendações registradas

### REC-0001 — 2026-09-11 — Codex

- **Status:** Executado
- **Recomendação:** Corrigir o build dos pacotes internos e impedir imports por `src`.
- **Motivo:** O executável distribuído pode falhar ao iniciar.
- **Prioridade:** Crítica
- **Ações relacionadas:** recomendada na `ACAO-0001`; executada na `ACAO-0006`.

### REC-0002 — 2026-09-11 — Codex

- **Status:** Executado
- **Recomendação:** Remover credencial padrão fixa e exigir criação ou troca de senha no primeiro uso.
- **Motivo:** Existe risco de segurança por credenciais conhecidas.
- **Prioridade:** Crítica
- **Ações relacionadas:** recomendada na `ACAO-0001`; executada na `ACAO-0014`.

### REC-0003 — 2026-09-11 — Codex

- **Status:** Parcialmente executado
- **Recomendação:** Criar testes automatizados para cálculos trabalhistas críticos.
- **Motivo:** Rescisão, férias, ponto, INSS e IRRF têm risco funcional e fiscal.
- **Prioridade:** Crítica
- **Ações relacionadas:** recomendada na `ACAO-0001`; parcialmente executada na `ACAO-0015` (cobre só IRRF/INSS/FGTS de `CalculoFolha.ts`, por pedido explícito do usuário de não expandir escopo para Rescisão/Férias/Ponto nesta tarefa).

### REC-0004 — 2026-09-11 — Codex

- **Status:** Executado
- **Recomendação:** Tornar o recálculo da folha transacional e idempotente.
- **Motivo:** Evitar dados parcialmente atualizados em caso de erro.
- **Prioridade:** Alta
- **Ações relacionadas:** recomendada na `ACAO-0001`; diagnosticada (sem código alterado, só levantamento) numa conversa anterior à `ACAO-0016` — não registrada como ação própria por instrução do usuário de só diagnosticar naquele momento; executada na `ACAO-0016`.

### REC-0005 — 2026-09-11 — ChatGPT/Codex

- **Status:** Não executado
- **Recomendação:** Criar padronização de ambiente com `README_AMBIENTE.md`, `.env.example` e avaliar Docker.
- **Motivo:** O projeto pode ser trabalhado por agentes e máquinas diferentes com versões e dependências diferentes.
- **Prioridade:** Alta
- **Ação relacionada:** `ACAO-0001`

## Histórico — continuação

### ACAO-0002 — 2026-09-11 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Documentação de ambiente
- **Status:** Concluído
- **Resumo:**
  - Foi criado `README_AMBIENTE.md` para padronizar e explicar o ambiente de execução, desenvolvimento e build entre máquinas, desenvolvedores e agentes de IA.
  - O documento diferencia problemas de ambiente, build, configuração e código e registra os pontos que ainda estão **A confirmar**.
- **O que foi feito:**
  - Documentado o ambiente observado: Windows 10 build 19045, PowerShell 5.1, Node local 20.20.2, Node do Electron 20.18.1, ABIs 115 e 128, pnpm 9.15.9, Corepack 0.34.6 e Electron 32.3.3.
  - Documentado o uso obrigatório de pnpm e do lockfile, sem definir ainda versões oficiais de Node e pnpm.
  - Documentados scripts conhecidos, resultados atuais, desenvolvimento por `tsx/cjs`, dependência de preload compilado e diferenças entre desenvolvimento e distribuição.
  - Documentados SQLite, `userData`, PostgreSQL apenas testado/configurado, variáveis conhecidas, arquivos sensíveis e dependências nativas.
  - Docker foi registrado como opcional/parcial, mas nenhum arquivo Docker foi criado.
  - `docker-compose.yml` não foi criado porque o runtime principal usa SQLite e não depende de serviço externo de banco.
  - `.env.example` não foi criado porque não foi identificada variável manual obrigatória; `VITE_DEV_SERVER_URL` é definida pelo script de desenvolvimento atual.
  - `CONTEXTO_TOTAL.md` foi atualizado apenas nos pontos necessários para referenciar a nova documentação e o próximo passo.
- **Por que foi feito:**
  - Para reduzir divergências de Node, pnpm, ABI nativo, banco e fluxo de build e impedir que falhas de ambiente sejam corrigidas equivocadamente como bugs de código.
- **Arquivos criados ou atualizados:**
  - Criado `README_AMBIENTE.md`.
  - Atualizado `HISTORICO_AGENTES.md` com esta entrada.
  - Atualizado `CONTEXTO_TOTAL.md` para refletir a existência da documentação de ambiente.
- **Código-fonte e configuração:**
  - Nenhum arquivo de código-fonte foi alterado.
  - `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, arquivos `tsconfig` e configurações de build não foram alterados.
  - Nenhuma dependência foi instalada ou atualizada nesta ação.
- **Riscos ou pendências:**
  - Node e pnpm oficiais continuam **A confirmar**.
  - O fluxo de preload em instalação limpa continua **A confirmar**.
  - O isolamento entre banco de desenvolvimento, teste e produção continua **A confirmar**.
  - A execução real do aplicativo empacotado continua pendente de smoke test.
  - `REC-0005` foi atendida apenas quanto ao `README_AMBIENTE.md`; a necessidade de `.env.example` e Docker deve ser reavaliada conforme o ambiente evoluir.
- **Próxima ação recomendada:**
  - Validar uma instalação limpa, executar o fluxo de desenvolvimento, confirmar a geração do preload e identificar com segurança o diretório `userData` usado pelo banco de desenvolvimento, sem iniciar ainda correções amplas.

### REC-0006 — 2026-09-11 — Codex

- **Status:** Executado
- **Recomendação:** Tornar o fluxo `pnpm dev` autocontido e seguro, gerando o preload, preparando `better-sqlite3` para a ABI do Electron e usando um `userData` exclusivo de desenvolvimento.
- **Motivo:** Em instalação limpa, o Electron falha por ABI antes de abrir a interface; o preload não é criado automaticamente e o script atual pode abrir o banco real em `%APPDATA%\Electron`.
- **Prioridade:** Crítica
- **Ações relacionadas:** diagnóstico em `ACAO-0003`; execução concluída em `ACAO-0004`.

### ACAO-0003 — 2026-09-11 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Validação de ambiente / Instalação limpa / Desenvolvimento
- **Status:** Concluído
- **Resultado do fluxo:** Parcial
- **Resumo:**
  - Foi simulada uma instalação limpa, com remoção de `node_modules`, remoção de `app-host/dist/main` e `app-host/dist/renderer` e uso de uma loja pnpm temporária vazia.
  - Foram validados instalação com lockfile, Corepack, geração do preload, ABI de `better-sqlite3`, abertura do Electron, rota inicial e localização do banco.
  - O fluxo limpo não abre a aplicação sem preparação manual.
- **O que foi encontrado:**
  - `corepack enable` passou, mas, pela ausência de `packageManager`, o Corepack selecionou e baixou pnpm 12.3.4 em vez do pnpm 9.15.9 inicialmente observado.
  - O pnpm 12.3.4 avisou que ignora `pnpm.onlyBuiltDependencies` no `package.json` na localização atual dessa configuração.
  - `pnpm install --frozen-lockfile` passou em aproximadamente 2 min 27 s, com 598 pacotes baixados e nenhum pacote reutilizado da loja anterior.
  - `better-sqlite3` executou `prebuild-install || node-gyp rebuild --release`; não houve saída de `node-gyp`, portanto o uso de binário pré-compilado é provável, mas o ramo exato fica **A confirmar**.
  - A instalação não criou `app-host/dist/main/preload.js`.
  - `pnpm dev` iniciou Vite e Electron, mas o Electron falhou antes de abrir a aplicação porque `better-sqlite3` estava compilado para ABI 115 e o Electron exige ABI 128.
  - O erro do módulo nativo apareceu como rejeição não tratada e o processo precisou ser encerrado manualmente.
  - `pnpm --filter @sudo-sys/app-host electron:dev:preload` gerou o preload em aproximadamente 9,2 s.
  - `pnpm exec electron-rebuild -f -w better-sqlite3` reconstruiu o módulo para Electron em aproximadamente 3,5 s.
  - Após essas duas preparações manuais, Vite e Electron abriram a página `http://localhost:5173/#/setup` com o título `SudoSys — Folha de Pagamento`.
  - Alterar apenas `APPDATA` e `LOCALAPPDATA` no processo não isolou `app.getPath('userData')` no Windows. O aplicativo abriu `C:\Users\holdi\AppData\Roaming\Electron\banco\sudosys.db`.
  - O arquivo principal do banco real manteve tamanho e data, mas os arquivos WAL/SHM foram observados com o horário do teste. Como eles não foram inventariados antes, o efeito persistente fica **A confirmar**. Nenhum arquivo do banco foi apagado ou inspecionado.
  - O parâmetro explícito `--user-data-dir` isolou corretamente o banco em uma pasta temporária. Nesse ambiente descartável, o aplicativo inseriu 2.445 CBOs e abriu a tela de setup.
- **Classificação dos achados:**
  - **Ambiente:** Corepack escolhe pnpm dinamicamente; instalação depende de rede; ABI 115 do Node diverge da ABI 128 do Electron; módulo nativo depende do último rebuild realizado.
  - **Script:** `pnpm dev` não gera o preload nem reconstrói `better-sqlite3` para Electron.
  - **Build:** o desenvolvimento via `tsx/cjs` continua diferente do JavaScript usado na distribuição; os riscos de imports internos por `/src` permanecem.
  - **Configuração:** `packageManager` e `.node-version` estão ausentes; pnpm 12 ignora a configuração atual de `onlyBuiltDependencies`; não existe `userData` exclusivo de desenvolvimento.
  - **Código:** nenhum novo erro funcional de código foi confirmado porque a primeira falha ocorreu na carga do módulo nativo. Os avisos de protocolo Autofill no DevTools não impediram a abertura da tela.
- **O que foi mudado:**
  - Nenhum arquivo de código-fonte, lógica da aplicação, manifest, lockfile, `tsconfig` ou configuração de build foi alterado.
  - Os `node_modules` existentes foram removidos e recriados pela instalação limpa.
  - `app-host/dist/main` e `app-host/dist/renderer` foram removidos; `app-host/dist/main` foi recriado pelo script de preload.
  - O pacote antigo em `app-host/dist/electron` não pôde ser removido porque `app.asar` permaneceu bloqueado pelo Windows, mesmo sem processo Electron visível. Ele não participou do teste de desenvolvimento.
  - Foi criada uma loja pnpm temporária e um `userData` temporário apenas para validação.
  - O pnpm global foi restaurado para 9.15.9 após o teste com pnpm 12.3.4.
  - A loja pnpm, o banco isolado e os demais arquivos temporários da validação foram removidos ao final.
  - `README_AMBIENTE.md`, `HISTORICO_AGENTES.md` e `CONTEXTO_TOTAL.md` foram atualizados com os resultados confirmados.
- **O que foi melhorado:**
  - O fluxo real de instalação e desenvolvimento passou a ter evidência reproduzível.
  - Ficou clara a diferença entre falha de instalação, falha de script, incompatibilidade de ABI e risco de dados locais.
  - Foi confirmado um modo seguro de isolar o banco em validações futuras usando `--user-data-dir` explícito.
- **Por que foi feito:**
  - Para verificar se os erros observados são de ambiente ou script antes de modificar código e para impedir que agentes dependam de artefatos gerados anteriormente.
- **Arquivos envolvidos:**
  - `CONTEXTO_TOTAL.md`
  - `HISTORICO_AGENTES.md`
  - `README_AMBIENTE.md`
  - `package.json` — analisado, não alterado.
  - `app-host/package.json` — analisado, não alterado.
  - `app-host/electron-dev.cjs` — analisado, não alterado.
  - `app-host/src/main.ts` — analisado, não alterado.
  - `app-host/src/db/database.ts` — analisado, não alterado.
- **Impacto esperado:**
  - Reduzir o risco de corrigir código para compensar ambiente incorreto, executar `pnpm dev` com ABI incompatível ou abrir dados reais durante testes.
- **Riscos ou observações:**
  - Uma instalação limpa passa, mas não deixa o desenvolvimento pronto para uso.
  - `pnpm dev` não isola o banco e pode abrir dados reais do usuário.
  - A preparação de `better-sqlite3` para Electron pode torná-lo incompatível com o Node local até nova reinstalação ou rebuild.
  - O estado dos arquivos WAL/SHM do banco real não deve ser alterado sem autorização e análise específica.
  - O diretório temporário de validação continha apenas dados descartáveis e foi removido após o registro.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0006`: criar um fluxo único e seguro de desenvolvimento que gere o preload, prepare a dependência nativa para Electron e use `userData` exclusivo de desenvolvimento.
- **Próxima ação sugerida:**
  - Executar somente a `REC-0006`, com uma alteração pequena e revisável no fluxo de desenvolvimento, antes de avançar para correções de build ou regras de negócio.

### REC-0007 — 2026-09-11 — Codex

- **Status:** Executado
- **Recomendação:** Validar e fixar versões oficiais de Node e pnpm, incluindo `packageManager` e arquivo de versão do Node, sem realizar upgrades em lote.
- **Motivo:** Sem versões fixas, o Corepack pode selecionar outra versão do pnpm e alterar o tratamento de scripts de dependências nativas.
- **Prioridade:** Alta
- **Ações relacionadas:** recomendada na `ACAO-0004`; executada provisoriamente na `ACAO-0005`.

### ACAO-0004 — 2026-09-11 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Correção de ambiente / Script de desenvolvimento / Isolamento de dados
- **Status:** Concluído
- **Resumo:**
  - A `REC-0006` foi executada com uma alteração pequena no script do `app-host` e uma entrada no `.gitignore`.
  - `pnpm dev` passou a gerar o preload, reconstruir `better-sqlite3` para a ABI do Electron e iniciar o aplicativo com um `userData` exclusivo de desenvolvimento.
- **O que foi encontrado:**
  - O script raiz já coordenava Vite e Electron; portanto, não foi necessário alterá-lo.
  - O comando existente `electron:dev:preload` já gerava o arquivo correto em `app-host/dist/main/preload.js`.
  - `@electron/rebuild` 4.0.4 já estava instalado na raiz e pôde ser chamado pelo workspace `app-host`.
  - O parâmetro `--user-data-dir=../.dev-user-data` é resolvido a partir de `app-host` para `<raiz-do-projeto>/.dev-user-data`.
  - O banco real e seus arquivos WAL/SHM já existiam antes da validação; seus tamanhos e datas permaneceram iguais durante e depois do novo `pnpm dev`.
- **O que foi mudado:**
  - `app-host/package.json`: criado `electron:dev:prepare`; `electron:dev` passou a executar a preparação e a informar `--user-data-dir=../.dev-user-data` ao Electron.
  - `.gitignore`: adicionado `/.dev-user-data/` para impedir versionamento de banco, configuração ou cache de desenvolvimento.
  - `README_AMBIENTE.md`: documentado o novo fluxo, a preparação automática, o caminho de dados e as pendências restantes.
  - `CONTEXTO_TOTAL.md`: atualizado o estado da `REC-0006`, o fluxo atual e a próxima recomendação.
  - `HISTORICO_AGENTES.md`: registrada esta ação e atualizada a `REC-0006` para `Executado`.
  - Nenhuma regra de negócio, código TypeScript, lockfile, dependência, `tsconfig` ou configuração de `electron-builder` foi alterada.
  - Para simular uma instalação limpa, `node_modules` e `app-host/dist/main` foram removidos; ambos foram recriados pelos comandos validados.
- **Scripts criados ou modificados:**
  - Criado `electron:dev:prepare`: `pnpm run electron:dev:preload && pnpm exec electron-rebuild -f -w better-sqlite3`.
  - Modificado `electron:dev` para executar o preparo e iniciar Electron com `--user-data-dir=../.dev-user-data`.
  - O script raiz `pnpm dev` não mudou e continua sendo o único comando necessário ao usuário.
- **Validações executadas:**
  - `pnpm install --frozen-lockfile`: passou com pnpm 9.15.9 em aproximadamente 30 s, reutilizando os 598 pacotes da loja local e sem alterar `pnpm-lock.yaml`.
  - Antes de `pnpm dev`, o preload e `.dev-user-data` não existiam.
  - `pnpm dev`: gerou o preload, concluiu o rebuild nativo, iniciou Vite e Electron e abriu `http://localhost:5173/#/setup`.
  - O banco de desenvolvimento foi criado em `<raiz-do-projeto>/.dev-user-data/banco/sudosys.db` e recebeu o seed de 2.445 CBOs.
  - Não apareceu erro de ABI, preload, IPC ou banco. Permaneceram apenas avisos do DevTools sobre o protocolo Autofill, sem impedir a abertura da aplicação.
  - O processo interativo foi encerrado manualmente e nenhum processo Electron do projeto permaneceu ativo.
  - `git check-ignore` confirmou que o banco de desenvolvimento está coberto por `/.dev-user-data/`.
- **O que foi melhorado:**
  - Uma instalação limpa não depende mais de comandos manuais para preparar o preload ou `better-sqlite3` antes do desenvolvimento.
  - O fluxo padrão deixou de apontar para `%APPDATA%\Electron` e passou a manter dados de desenvolvimento dentro de um diretório explícito, separado e ignorado pelo Git.
  - O comando de uso diário permaneceu simples: `pnpm dev`.
- **Por que foi feito:**
  - Para eliminar a falha de ABI, a dependência de preload previamente gerado e o risco de abrir o banco real do usuário durante desenvolvimento.
- **Arquivos envolvidos:**
  - `.gitignore`
  - `app-host/package.json`
  - `package.json` — analisado, não alterado.
  - `app-host/electron-dev.cjs` — analisado, não alterado.
  - `app-host/src/main.ts` — analisado, não alterado.
  - `README_AMBIENTE.md`
  - `CONTEXTO_TOTAL.md`
  - `HISTORICO_AGENTES.md`
- **Impacto esperado:**
  - `pnpm dev` deve funcionar após instalação limpa com menos risco operacional e sem acessar o banco real pelo caminho padrão observado no Windows.
- **Riscos ou observações:**
  - O rebuild é executado em todo início de desenvolvimento e aumenta o tempo de inicialização.
  - Depois do rebuild para Electron, o mesmo binário nativo pode não carregar diretamente no Node local ABI 115 até nova instalação ou rebuild apropriado.
  - O caminho relativo e o comportamento de `--user-data-dir` foram confirmados no Windows 10; Linux e macOS estão **A confirmar**.
  - O diretório `.dev-user-data` é persistente entre execuções. Apagá-lo reinicia o ambiente de desenvolvimento e não deve ser feito sem confirmar que seus dados podem ser descartados.
  - Os riscos do build distribuído, imports por `/src`, typecheck e lint permanecem fora do escopo desta ação.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0007`: validar e fixar versões oficiais de Node e pnpm sem upgrades em lote.
  - Depois da padronização de versões, executar a `REC-0001` em uma etapa separada.
- **Próxima ação sugerida:**
  - Executar a `REC-0007`, fixando de forma validada as versões de Node e pnpm usadas pelo projeto.

### DEC-0003 — 2026-09-11 — Codex

- **Status:** Ativa / Provisória
- **Decisão:** Usar Node 20.20.2 e pnpm 9.15.9 como baseline de compatibilidade do ambiente atual.
- **Motivo:** Essa combinação já foi validada com instalação congelada, Electron 32.3.3, preload e `better-sqlite3`; trocar a linha do Node nesta etapa ampliaria o escopo.
- **Impacto:** `.node-version`, `packageManager` e `engines` exigem essas versões. Como Node 20 está fora de suporte, a decisão deve ser revista após estabilizar o build.
- **Autor/origem:** Codex
- **Ação relacionada:** `ACAO-0005`

### REC-0008 — 2026-09-11 — Codex

- **Status:** Não executado
- **Recomendação:** Validar uma migração controlada do Node 20 para uma linha LTS suportada, incluindo Electron, `better-sqlite3`, build e distribuição.
- **Motivo:** Node 20 encerrou suporte oficial em 2026-04-30; a versão fixada atualmente é apenas um baseline provisório de compatibilidade.
- **Prioridade:** Alta
- **Ação relacionada:** `ACAO-0005`

### ACAO-0005 — 2026-09-11 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Padronização de ambiente / Node / pnpm
- **Status:** Concluído
- **Resumo:**
  - A `REC-0007` foi executada com a fixação provisória de Node 20.20.2 e pnpm 9.15.9.
  - A combinação foi validada novamente com instalação congelada e execução completa do ambiente de desenvolvimento.
- **O que foi encontrado:**
  - Node local: 20.20.2, ABI 115.
  - Node incorporado ao Electron 32.3.3: 20.18.1, ABI 128.
  - pnpm local: 9.15.9.
  - Corepack: 0.34.6.
  - O `package.json` aceitava qualquer Node `>=20.0.0` e pnpm `>=9.0.0` e não possuía `packageManager`.
  - Não existiam `.node-version`, `.nvmrc`, `.tool-versions` ou configuração equivalente.
  - `@types/node` resolveu para 22.19.19 e continua desalinhado com os runtimes Node 20; a dependência não foi alterada nesta ação.
  - O calendário oficial do Node.js registra que Node 20 encerrou suporte em 2026-04-30. Por isso, a versão escolhida é provisória, apesar de ser a única combinação já validada neste projeto.
- **O que foi mudado:**
  - Criado `.node-version` com `20.20.2`.
  - Adicionado `packageManager: pnpm@9.15.9` ao `package.json` raiz.
  - Ajustado `engines.node` para `20.20.2` e `engines.pnpm` para `9.15.9`.
  - Atualizados `README_AMBIENTE.md`, `CONTEXTO_TOTAL.md` e `HISTORICO_AGENTES.md`.
  - A `REC-0007` foi marcada como `Executado`.
  - Registrada a decisão provisória `DEC-0003`.
  - Nenhum código TypeScript, regra de negócio, dependência ou lockfile foi alterado.
- **O que foi melhorado:**
  - O Corepack agora encontra uma versão explícita de pnpm e deixa de escolher dinamicamente outra versão.
  - Ferramentas compatíveis com `.node-version` passam a identificar o Node esperado.
  - `engines` deixou de aceitar intervalos amplos e passou a sinalizar divergências exatas.
  - Agentes futuros têm um baseline reproduzível para instalação, desenvolvimento e módulos nativos.
- **Por que foi feito:**
  - Para evitar que máquinas e agentes usem versões diferentes de Node e pnpm e produzam erros inconsistentes de lockfile, scripts ou ABI nativo.
- **Arquivos envolvidos:**
  - `.node-version`
  - `package.json`
  - `README_AMBIENTE.md`
  - `CONTEXTO_TOTAL.md`
  - `HISTORICO_AGENTES.md`
  - `app-host/package.json` — analisado, não alterado nesta ação.
  - `pnpm-lock.yaml` — validado, não alterado.
- **Validações executadas:**
  - `node -v`: retornou `v20.20.2`.
  - `pnpm -v`: retornou `9.15.9`.
  - `corepack --version`: retornou `0.34.6`.
  - Electron oculto confirmou Node 20.18.1 e ABI 128.
  - `pnpm install --frozen-lockfile`: passou em aproximadamente 4,1 s, sem alterar o lockfile.
  - `pnpm dev`: gerou o preload, reconstruiu `better-sqlite3`, iniciou Vite e Electron e abriu `http://localhost:5173/#/setup`.
  - O banco continuou em `<raiz-do-projeto>/.dev-user-data/banco/sudosys.db`.
  - Não houve erro de ABI, preload, IPC ou banco; apareceram apenas avisos conhecidos do DevTools sobre Autofill.
  - O processo foi encerrado manualmente e com segurança.
  - O banco real e seus arquivos WAL/SHM mantiveram tamanho e datas inalterados.
- **Impacto esperado:**
  - Instalação e desenvolvimento mais previsíveis, com menor risco de o Corepack selecionar outra versão do pnpm ou de agentes usarem uma linha diferente de Node sem perceber.
- **Riscos ou observações:**
  - Node 20 está fora de suporte e não deve permanecer como padrão definitivo de produção.
  - A migração para Node 22 ou 24 exige validação separada; ela não foi feita nesta ação para evitar upgrade de escopo amplo.
  - `@types/node` 22.19.19 permanece desalinhado e deve ser tratado junto da futura decisão de runtime, sem alteração isolada agora.
  - Linux e macOS permanecem **A confirmar**.
  - Os riscos de build distribuído, imports por `/src`, typecheck e lint continuam pendentes.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0008`: validar futuramente uma migração controlada para Node LTS suportado.
  - Executar agora a `REC-0001` em uma ação separada para corrigir o build dos pacotes internos.
- **Próxima ação sugerida:**
  - Executar somente a `REC-0001`, corrigindo o build dos pacotes internos e eliminando imports por `src` sem misturar upgrades de runtime.

### DEC-0004 — 2026-09-11 — Codex

- **Status:** Ativa
- **Decisão:** Publicar `@sudo-sys/shared` como ESM e `@sudo-sys/domain`, `@sudo-sys/application` e `@sudo-sys/infrastructure` como CommonJS na configuração atual.
- **Motivo:** O renderer Vite consome exports nomeados de `shared`, enquanto o processo principal Electron emitido atualmente usa `require()`.
- **Impacto:** Os pacotes passam a ser consumidos por suas APIs públicas compiladas; mudanças futuras no formato dos módulos exigem validação conjunta da UI, host, desenvolvimento e pacote.
- **Autor/origem:** Codex
- **Ação relacionada:** `ACAO-0006`

### REC-0009 — 2026-09-11 — Codex

- **Status:** Parcial
- **Recomendação:** Finalizar a higiene e os assets da distribuição Electron, copiando o CSV de CBO e o ícone, removendo fontes TypeScript excedentes do ASAR e validando o instalador completo.
- **Motivo:** A distribuição já resolve os pacotes por `dist`, mas ainda inclui fontes desnecessárias e possui assets e etapas finais de empacotamento pendentes.
- **Prioridade:** Alta
- **Ações relacionadas:** recomendada na `ACAO-0006`; executada parcialmente na `ACAO-0020` (renumerada de `ACAO-0014` durante a reconciliação da `ACAO-0021`).

### ACAO-0006 — 2026-09-11 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Correção de build / Pacotes internos / Imports públicos
- **Status:** Concluído
- **Resumo:**
  - A `REC-0001` foi executada com build explícito dos quatro pacotes internos, entradas públicas apontadas para `dist` e remoção dos imports privados por `/src` no `app-host`.
  - O fluxo foi validado em instalação, typecheck, build, desenvolvimento, empacotamento em diretório e smoke test do executável.
- **O que foi encontrado:**
  - Havia 19 imports de `@sudo-sys/infrastructure/src/...` em nove handlers IPC e no renderer de holerite.
  - `shared`, `domain`, `application` e `infrastructure` apontavam `main` e `types` para `src/index.ts`, não possuíam script de build nem saída `dist` existente.
  - O `app-host` emitia 19 `require()` privados preservando `/src` e o ambiente de desenvolvimento os aceitava pelo hook `tsx/cjs`.
  - O pacote `application` não declarava os tipos de Node necessários aos contratos existentes com `Buffer`.
  - O renderer exige `shared` em ESM para preservar exports nomeados; os pacotes usados pelo host atual precisam de CommonJS.
- **O que foi mudado:**
  - `package.json`: criados `build:packages`; `build` e `typecheck` passaram a compilar os pacotes internos primeiro.
  - `app-host/package.json`: o preparo de desenvolvimento passou a compilar os pacotes internos antes do preload e do rebuild nativo.
  - `packages/shared/package.json`: entrada pública em `dist`, `exports`, `files`, script de build e formato ESM.
  - `packages/domain/package.json`, `packages/application/package.json` e `packages/infrastructure/package.json`: entradas públicas em `dist`, `exports`, `files` e scripts de build.
  - `packages/domain/tsconfig.json` e `packages/application/tsconfig.json`: emissão CommonJS com resolução Node, compatível com o host atual.
  - `packages/application/package.json` e `pnpm-lock.yaml`: adicionado `@types/node` 22.19.19, já presente na resolução do lockfile, para compilar os contratos com `Buffer` sem mudar sua lógica.
  - `packages/infrastructure/src/index.ts`: exportados somente o hasher, repositórios e serviço já consumidos pelo `app-host`.
  - Nove handlers IPC e `app-host/src/pdf/HoleriteRenderer.ts`: imports privados substituídos por `@sudo-sys/infrastructure`.
  - `README_AMBIENTE.md`, `CONTEXTO_TOTAL.md` e `HISTORICO_AGENTES.md`: atualizados com o fluxo e as evidências.
  - Nenhuma regra de negócio, cálculo trabalhista, autenticação, autorização ou dado real foi alterado.
- **Scripts criados ou modificados:**
  - Criado `pnpm build:packages`, na ordem `shared`, `domain`, `application` e `infrastructure`.
  - `pnpm build` agora executa `build:packages` antes da UI e do `app-host`.
  - `pnpm typecheck` agora prepara os `dist` internos antes de verificar todos os workspaces.
  - `electron:dev:prepare` agora executa `pnpm -w run build:packages` antes do preload e de `electron-rebuild`.
- **Validações executadas:**
  - `pnpm install --frozen-lockfile`: passou com Node 20.20.2 e pnpm 9.15.9, sem alterar a resolução além da declaração de `@types/node` no importer de `application`.
  - `pnpm typecheck`: passou em todos os workspaces.
  - `pnpm build`: passou; `shared`, `domain`, `application` e `infrastructure` geraram JavaScript e declarações em `dist`.
  - `pnpm dev`: compilou os pacotes internos, gerou o preload, reconstruiu `better-sqlite3`, abriu Vite/Electron em `http://localhost:5173/#/setup` e continuou usando `<raiz>/.dev-user-data`.
  - Para simular um clone sem saídas prévias, os quatro diretórios `packages/*/dist` foram removidos; o próprio `pnpm dev` recriou todos os `dist/index.js` antes de abrir o aplicativo.
  - O banco real em `%APPDATA%\Electron\banco` e seus arquivos WAL/SHM mantiveram tamanho e datas durante as validações.
  - O comando padrão `pnpm --filter @sudo-sys/app-host dist` não concluiu porque um `app.asar` antigo no diretório de saída estava bloqueado pelo Windows.
  - O comando equivalente com saída isolada gerou `app-host/dist/electron-rec0001-v2/win-unpacked/SudoSys.exe`.
  - O smoke test abriu `file:///.../app.asar/dist/renderer/index.html#/setup`, sem `MODULE_NOT_FOUND`, erro de preload ou ABI de `better-sqlite3`, usando `userData` temporário. Os processos e dados temporários foram removidos ao final.
  - Não restaram imports por `@sudo-sys/*/src/...` no código-fonte ou no JavaScript gerado. Os quatro pacotes resolvem para seus respectivos `dist/index.js`.
- **O que foi melhorado:**
  - A distribuição Electron deixou de depender de imports privados para arquivos TypeScript crus dos pacotes internos.
  - O mesmo comando de build prepara os pacotes na ordem necessária e o desenvolvimento preserva o fluxo autocontido.
  - O typecheck geral passou a funcionar e o executável empacotado teve sua inicialização comprovada.
- **Por que foi feito:**
  - Para evitar falhas de `MODULE_NOT_FOUND` no executável e reduzir a diferença entre a resolução tolerada pelo desenvolvimento e o JavaScript disponível na distribuição.
- **Arquivos envolvidos:**
  - `package.json`
  - `pnpm-lock.yaml`
  - `app-host/package.json`
  - `app-host/src/ipc/handlers/authHandlers.ts`
  - `app-host/src/ipc/handlers/empresaHandlers.ts`
  - `app-host/src/ipc/handlers/feriasHandlers.ts`
  - `app-host/src/ipc/handlers/folhaHandlers.ts`
  - `app-host/src/ipc/handlers/funcionarioHandlers.ts`
  - `app-host/src/ipc/handlers/pontoHandlers.ts`
  - `app-host/src/ipc/handlers/relatorioHandlers.ts`
  - `app-host/src/ipc/handlers/rescisaoHandlers.ts`
  - `app-host/src/ipc/handlers/rubricaHandlers.ts`
  - `app-host/src/pdf/HoleriteRenderer.ts`
  - `packages/shared/package.json`
  - `packages/domain/package.json`
  - `packages/domain/tsconfig.json`
  - `packages/application/package.json`
  - `packages/application/tsconfig.json`
  - `packages/infrastructure/package.json`
  - `packages/infrastructure/src/index.ts`
  - `README_AMBIENTE.md`
  - `CONTEXTO_TOTAL.md`
  - `HISTORICO_AGENTES.md`
- **Impacto esperado:**
  - Builds e pacotes Electron mais previsíveis, com uma API pública explícita para os pacotes internos e menor risco de falha na resolução de módulos.
- **Riscos ou observações:**
  - O `electron-builder` ainda copiou fontes TypeScript dos workspaces para o ASAR, embora nenhum JavaScript empacotado as importe. Isso aumenta o pacote e expõe fontes sem necessidade.
  - O CSV completo de CBO não está em `app-host/dist/main/data/cbo_lista.csv`; o ícone configurado também permanece ausente.
  - A saída padrão do `dist` continua bloqueada por um artefato antigo nesta máquina; o pacote foi validado em uma saída isolada.
  - O instalador completo, Linux, macOS, assinatura e notarização permanecem **A confirmar**.
  - `@types/node` 22.19.19 continua desalinhado com Node 20; não houve troca de versão para evitar ampliar o escopo.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0009`: finalizar assets e higiene do pacote Electron em uma ação separada.
  - `REC-0002`: remover a credencial padrão conhecida em uma ação de segurança separada.
- **Próxima ação sugerida:**
  - Executar somente a `REC-0009`, copiando os assets exigidos, removendo fontes excedentes do ASAR e validando o instalador completo sem alterar regras de negócio.

### ACAO-0007 — 2026-09-11 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Fechamento de etapa / Conferência para commit / Handoff
- **Status:** Concluído
- **Resumo:**
  - O estado do Git e os documentos técnicos foram conferidos após a conclusão da `REC-0001`.
  - Foi preparado o handoff para que outro agente continue o trabalho sem repetir ou desfazer as ações concluídas.
- **O que foi encontrado:**
  - A `ACAO-0006` registra as validações de instalação, typecheck, build, desenvolvimento e smoke test do pacote Electron.
  - `CONTEXTO_TOTAL.md` marca a `REC-0001` como `Executado` e indica a `REC-0009` como próxima ação.
  - `README_AMBIENTE.md` documenta o build dos pacotes internos, os imports públicos, o preparo automático do desenvolvimento e as limitações restantes.
  - O estado preparado para commit contém somente código de integração, configuração, lockfile e documentação relacionados às ações registradas; não contém `dist`, `.dev-user-data` ou banco local.
- **O que foi mudado:**
  - Adicionada esta entrada de fechamento e handoff ao `HISTORICO_AGENTES.md`.
  - Atualizada em `CONTEXTO_TOTAL.md` a referência da última ação registrada.
  - Nenhum código, regra de negócio, cálculo, autenticação, autorização, dependência ou banco foi alterado nesta ação.
- **Handoff para o próximo agente:**
  - **Agente sugerido:** Claude.
  - Antes de qualquer alteração, ler `CONTEXTO_TOTAL.md`, `HISTORICO_AGENTES.md` e `README_AMBIENTE.md`.
  - A próxima ação recomendada é a `REC-0009`.
  - A `REC-0009` deve copiar o CSV completo de CBO para o pacote, corrigir o ícone ausente, excluir fontes TypeScript excedentes do ASAR quando isso for seguro e validar o instalador completo.
  - Não alterar ainda regras de negócio, cálculos trabalhistas, autenticação ou autorização durante a `REC-0009`.
- **Arquivos envolvidos:**
  - `CONTEXTO_TOTAL.md`
  - `HISTORICO_AGENTES.md`
  - `README_AMBIENTE.md` — conferido, sem ajuste nesta ação.
- **Validações consideradas:**
  - `pnpm install --frozen-lockfile`: passou na `ACAO-0006`.
  - `pnpm typecheck`: passou na `ACAO-0006`.
  - `pnpm build`: passou na `ACAO-0006`.
  - `pnpm dev`: passou na `ACAO-0006`, inclusive sem `dist` interno prévio.
  - Smoke test do executável empacotado: passou na `ACAO-0006`.
  - As validações longas não foram repetidas porque não houve alteração técnica após seus resultados.
- **Impacto esperado:**
  - Permitir que o próximo agente retome a estabilização da distribuição a partir de um commit rastreável e de um escopo claramente delimitado.
- **Riscos ou observações:**
  - A `REC-0009` ainda não foi iniciada.
  - O instalador completo, os assets pendentes e a exclusão de fontes TypeScript do ASAR continuam sem validação final.
- **Próxima ação sugerida:**
  - Claude deve executar somente a `REC-0009`, após ler os três documentos de referência.

### ACAO-0008 — 2026-09-11 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Correção de cálculo / Migration de banco / Recuperação de trabalho perdido
- **Status:** Concluído
- **Resumo:**
  - Duas correções haviam sido feitas e validadas numa sessão anterior (redutor de IRRF da Lei 15.270/2025 e uma migration 054 com CHECK constraint em `regime_irrf`), mas nunca chegaram a ser commitadas — o ambiente onde foram feitas divergia deste, e o trabalho foi perdido. Esta ação refaz as duas correções neste ambiente e garante que cada uma termine com commit e push antes de ser considerada concluída.
  - Também foi feito o push do commit `62e0803` (do Codex, `chore: stabilize internal package build and dev environment`), que estava local e à frente de `origin/main`, sem ter sido enviado ao remoto ainda.
- **O que foi encontrado:**
  - `calcularIRRF` em `packages/infrastructure/src/services/CalculoFolha.ts` aplicava o redutor da Lei 15.270/2025 sobre `rendimentoTributavel = base` (já líquida de INSS e da dedução de dependentes/simplificado), não sobre o salário bruto. Isso fazia com que funcionários com bruto acima do teto de R$7.350 (ex: R$8.500) ainda recebessem redução indevida do IRRF, por a base líquida cair abaixo do teto.
  - Cenário de teste (bruto R$8.500, 2 dependentes, tabela tradicional, competência 2026-01): IRRF calculado incorretamente em ≈R$1.023,83 antes da correção; esperado ≈R$1.052,77 (tabela cheia, sem redução).
  - `app-host/src/db/database.ts` não tinha nenhuma migration 054; a última era `053_funcionario_regime_irrf`, que criava a coluna `regime_irrf` sem nenhuma restrição de valores aceitos.
  - Banco de dev real (`.dev-user-data/banco/sudosys.db`) estava com 0 registros em `funcionarios` — sem risco de dado existente violar o novo CHECK.
- **O que foi mudado:**
  - `packages/infrastructure/src/services/CalculoFolha.ts`: `calcularIRRF` ganhou um 5º parâmetro opcional `salarioBruto`; o redutor da Lei 15.270/2025 passou a usar `salarioBruto ?? base` como `rendimentoTributavel`. A tabela progressiva de IRRF continua usando a base já líquida, normalmente.
  - `app-host/src/ipc/handlers/folhaHandlers.ts` (linha do cálculo de IRRF): a chamada de `calcularIRRF` passou a incluir `baseIrrf` (soma de proventos com `incide_irrf`, calculada antes de subtrair o INSS) como 5º argumento.
  - `app-host/src/db/database.ts`: adicionada `054_funcionario_regime_irrf_check`, recriando `funcionarios` (padrão SQLite de recriação de tabela para adicionar CHECK — `ALTER TABLE ADD CONSTRAINT` não existe no SQLite) com `CHECK (regime_irrf IN ('dependentes', 'simplificado'))` na coluna `regime_irrf`. Nenhum índice ou trigger próprio de `funcionarios` foi encontrado no histórico de migrations, então não havia nada além da tabela para recriar; FKs de outras tabelas (`folha_lancamentos`, `ferias`, `ponto`, `rescisoes`) apontam pelo nome e continuaram válidas.
  - Migration 054 aplicada diretamente no banco de dev real (`.dev-user-data/banco/sudosys.db`), após validação numa cópia e com backup do arquivo original salvo em `.dev-user-data/banco/backup_pre_054_<timestamp>/` (dentro de `.dev-user-data`, portanto fora do controle de versão).
- **Validações executadas:**
  - `pnpm typecheck`: passou em todos os workspaces após cada uma das duas correções.
  - Redutor de IRRF: cenário R$8.500/2 dependentes/tradicional/2026-01 recalculado manualmente com a lógica corrigida → IRRF = R$1.052,77 (esperado).
  - Migration 054 testada primeiro numa cópia isolada do banco de dev real (arquivo `.db` + `.db-wal` + `.db-shm` copiados para preservar dados não checkpointados): `sqlite_master` confirmou o CHECK presente na tabela final; contagem de linhas de `funcionarios` preservada (0 antes e depois); `PRAGMA integrity_check` retornou `ok`; `PRAGMA foreign_key_check` retornou limpo; `INSERT` com `regime_irrf = 'invalido'` foi rejeitado pelo CHECK; `INSERT` com `regime_irrf = 'simplificado'` foi aceito normalmente.
  - Só depois dessa validação a migration foi aplicada ao banco de dev real, com backup prévio do arquivo original.
- **Por que foi feito:**
  - As duas correções já haviam sido implementadas e validadas antes, mas o trabalho foi perdido por nunca ter sido commitado nem enviado ao remoto entre sessões/ambientes diferentes. O usuário pediu que desta vez cada correção terminasse com commit e push antes de ser considerada concluída, para eliminar esse risco.
- **Arquivos envolvidos:**
  - `packages/infrastructure/src/services/CalculoFolha.ts`
  - `app-host/src/ipc/handlers/folhaHandlers.ts`
  - `app-host/src/db/database.ts`
  - `HISTORICO_AGENTES.md`
  - `CONTEXTO_TOTAL.md`
- **Commits e push:**
  - Push do commit pendente do Codex: `62e0803` (`chore: stabilize internal package build and dev environment`) — `origin/main` avançou de `0273154` para `62e0803`.
  - Fix do redutor IRRF: commit `76fe2b9` (`fix(irrf): redutor Lei 15.270/2025 usa salario bruto, nao base liquida`) — pushed para `origin/main`.
  - Migration 054 + este registro: commitados e pushed juntos (`feat(db): adiciona CHECK constraint em regime_irrf (migration 054)`) — ver `git log origin/main` para o hash exato, gerado após este registro ser escrito.
- **Riscos ou observações:**
  - O banco de dev real usado para testar e aplicar a migration tinha 0 funcionários cadastrados; a migration não foi testada com volume real de dados nem com valores de `regime_irrf` fora do domínio esperado (porque não existiam). Se o banco de produção/dev de outro ambiente tiver dados, rodar `SELECT DISTINCT regime_irrf FROM funcionarios` antes de aplicar lá.
  - O parâmetro `salarioBruto` em `calcularIRRF` é opcional (`salarioBruto ?? base`) para não quebrar chamadas existentes que não o passem; qualquer novo call site do cálculo de IRRF deve passar esse parâmetro para se beneficiar da correção.
  - Este é o segundo agente (depois do Codex) a registrar ações neste arquivo no mesmo dia; a numeração sequencial `ACAO-0008` foi confirmada lendo as entradas anteriores antes de escrever esta.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0009` (do Codex) continua pendente: finalizar assets e higiene do pacote Electron.
  - Recomenda-se validar a migration 054 novamente antes de aplicá-la em qualquer banco com funcionários já cadastrados, repetindo o passo de `SELECT DISTINCT regime_irrf` primeiro.
- **Próxima ação sugerida:**
  - Executar a `REC-0009` (assets/instalador Electron) ou, alternativamente, `REC-0002`/`REC-0003` (segurança/testes automatizados), conforme prioridade do usuário.

### ACAO-0009 — 2026-09-11 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Diagnóstico / Registro de contexto
- **Status:** Concluído
- **Resumo:**
  - O usuário pediu para registrar em `ipcRouter.ts` três handlers IPC supostamente "órfãos": `custosHandlers.ts`, `extrasHandlers.ts`, `quickCalcHandlers.ts` (existiam como arquivo mas nunca eram chamados).
  - Investigação mostrou que os três arquivos estão **vazios (0 bytes)** — não é um caso de "handler implementado mas não registrado", é ausência total de implementação. Não há função `register*Handlers()`, nem canal IPC, nem lógica de negócio em nenhum dos três.
  - Nenhum código foi alterado ou registrado. Apenas este diagnóstico foi documentado, por decisão do usuário.
- **O que foi encontrado:**
  - `app-host/src/ipc/handlers/custosHandlers.ts`, `extrasHandlers.ts` e `quickCalcHandlers.ts`: todos com 0 bytes.
  - `app-host/src/ipc/ipcRouter.ts`: registra apenas `empresa`, `auth`, `funcionario`, `rubrica`, `ferias`, `rescisao`, `ponto`, `folha`, `admin`, `relatorio`, `cbo`, `documentos` — nenhuma menção a `custos`, `extras` ou `quickcalc`.
  - `app-host/src/preload.ts`: nenhuma ocorrência de `custos`, `extras` ou `quickcalc` na API `electronAPI` exposta via `contextBridge` — não há contrato IPC nenhum do lado do renderer para esses três domínios.
  - `packages/ui/src/pages/extras/ExtrasPage.tsx`: também **0 bytes** (vazio) — não existe UI de "Extras" para testar.
  - `packages/ui/src/pages/custos/CustosSimuladorPage.tsx` (199 linhas): não faz nenhuma chamada IPC (`window.electronAPI.*`/`ipcRenderer`); parece ser um simulador local, sem dependência de backend.
  - `packages/ui/src/pages/quickcalc/QuickCalcPage.tsx` (214 linhas): chama apenas `window.electronAPI.listFuncionarios(...)`, que já existe e já está registrado via `funcionarioHandlers.ts`. Não chama nenhum canal `quickcalc:*`.
- **O que foi mudado:**
  - Nenhum arquivo de código-fonte foi alterado. Só este registro em `HISTORICO_AGENTES.md`.
- **Por que foi feito:**
  - Registrar os três handlers em `ipcRouter.ts` sem conteúdo neles não teria efeito funcional, e implementar a lógica de negócio de `custos`, `extras` e `quickcalc` do zero (canais, payloads, regras) estaria inventando comportamento não especificado — fora do escopo de uma tarefa de "registro de handler existente". O usuário foi consultado e optou por só documentar o achado nesta ação, sem implementar nada agora.
- **Arquivos envolvidos (analisados, nenhum alterado):**
  - `app-host/src/ipc/handlers/custosHandlers.ts`
  - `app-host/src/ipc/handlers/extrasHandlers.ts`
  - `app-host/src/ipc/handlers/quickCalcHandlers.ts`
  - `app-host/src/ipc/ipcRouter.ts`
  - `app-host/src/preload.ts`
  - `packages/ui/src/pages/extras/ExtrasPage.tsx`
  - `packages/ui/src/pages/custos/CustosSimuladorPage.tsx`
  - `packages/ui/src/pages/quickcalc/QuickCalcPage.tsx`
- **Riscos ou observações:**
  - `CustosSimuladorPage.tsx` e `QuickCalcPage.tsx` têm UI substancial (199 e 214 linhas) mas rodam sem qualquer handler de backend correspondente — se a intenção original era persistir ou calcular algo no processo principal, essa parte nunca foi implementada.
  - `ExtrasPage.tsx` e `extrasHandlers.ts` não têm nem UI nem backend — é um recurso puramente conceitual neste momento, sem nenhuma pista (rota, sidebar, tipo compartilhado) do que "Extras" deveria fazer.
  - Recriar esses três recursos do zero exige decisão de produto (o que cada um deve calcular/persistir), não é um "registro" mecânico como os handlers já existentes.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0010`: definir com o usuário o escopo funcional de `custos`, `extras` e `quickcalc` (canais IPC, payloads, regra de negócio) antes de implementar qualquer backend para eles — Status: Não executado.
- **Próxima ação sugerida:**
  - Retomar `REC-0009` (assets/instalador Electron) ou aguardar definição de escopo do usuário para os três recursos vazios.

### ACAO-0010 — 2026-09-11 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Diagnóstico / Levantamento de cobertura RBAC
- **Status:** Concluído
- **Resumo:**
  - Levantamento de quais rotas do frontend (`packages/ui/src/app/Router.tsx`) têm algum guard de permissão e quais não têm nenhum, a pedido do usuário. Nenhuma mudança de código foi feita — é só o achado, para o Jeremias decidir com calma quais rotas precisam de restrição e com qual granularidade (a distinção `operador`/`visualizador` hoje não existe em lugar nenhum).
- **O que foi encontrado:**
  - `Router.tsx`: das 14 rotas registradas, só `/admin` tem guard (`RequireAdmin`). As outras 13 (`/dashboard`, `/empresas`, `/funcionarios`, `/folha`, `/rubricas`, `/ferias`, `/rescisao`, `/ponto`, `/custos`, `/quickcalc`, `/relatorios`, `/cbo`, `/documentos`) não têm nenhum wrapper de permissão — renderizam para qualquer usuário autenticado.
  - `packages/ui/src/permissions/guards.tsx`: `RequireAdmin` usa `usePermission().isAdmin` e redireciona para o Dashboard se não for admin. Comentário no próprio arquivo já deixa claro que essa checagem é só de UI (esconder tela) e não substitui a checagem no backend.
  - `packages/ui/src/permissions/usePermission.ts`: só distingue `isAdmin` (role === `'admin'`). Não existe checagem ou distinção de UI para os papéis `operador` e `visualizador` (`packages/ui/src/state/sessionSlice.ts` define `role: 'admin' | 'operador' | 'visualizador'`) — os dois são tratados de forma idêntica em todo o frontend hoje.
  - `app-host/src/ipc/authGuard.ts` (gate central de IPC, adicionado antes desta ação): por padrão, todo canal exige sessão autenticada, qualquer papel. Só 4 canais em `CANAIS_ADMIN` exigem especificamente papel `admin`: `usuario:list`, `usuario:create`, `usuario:delete`, `admin:backup`. Todos os demais ~76 canais (Folha, Rescisão, Funcionários, Relatórios, etc.) são acessíveis a qualquer usuário logado, incluindo `visualizador`.
  - Ou seja: a única distinção de papel que existe hoje, tanto na UI quanto no backend, é "é admin" vs "não é admin" — e mesmo essa distinção, no backend, cobre só 4 canais específicos de gestão de usuários/backup, não a tela `/admin` como um todo.
- **O que foi mudado:**
  - Nenhum arquivo de código-fonte foi alterado. Só este registro em `HISTORICO_AGENTES.md`.
- **Por que foi feito:**
  - O usuário pediu o levantamento antes de decidir quais rotas (ex.: Folha) realmente precisam de restrição — não é óbvio que devam ser admin-only, podendo caber um papel intermediário (`operador`) que hoje nem existe como distinção prática no código.
- **Arquivos envolvidos (analisados, nenhum alterado):**
  - `packages/ui/src/app/Router.tsx`
  - `packages/ui/src/app/routes.ts`
  - `packages/ui/src/permissions/guards.tsx`
  - `packages/ui/src/permissions/usePermission.ts`
  - `packages/ui/src/state/sessionSlice.ts`
  - `app-host/src/ipc/authGuard.ts`
- **Riscos ou observações:**
  - Se a intenção de produto é ter 3 níveis reais de acesso (`admin`/`operador`/`visualizador`), falta tanto a matriz de permissões por módulo quanto os guards de UI correspondentes — hoje só existe o binário admin/não-admin.
  - Qualquer novo canal IPC que não for explicitamente adicionado a `CANAIS_PUBLICOS` ou `CANAIS_ADMIN` em `authGuard.ts` fica protegido por padrão (fail-safe) — mas só até o nível "exige login", não até um papel específico, a menos que alguém o adicione a `CANAIS_ADMIN`.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0011`: aguardar decisão do Jeremias sobre quais rotas/canais precisam de restrição por papel (e com qual granularidade — admin-only, operador+, etc.) antes de aplicar qualquer guard novo — Status: Não executado.
- **Próxima ação sugerida:**
  - Aguardar decisão do usuário sobre `REC-0011` antes de tocar em `Router.tsx`, `guards.tsx` ou `authGuard.ts`.

### ACAO-0011 — 2026-09-11 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Diagnóstico / Levantamento de branches remotas não mergeadas
- **Status:** Concluído
- **Resumo:**
  - Investigação das 3 branches remotas não mergeadas em `main` (`canhoto-wip`, `feature/core-foundation`, `feature/empresas-flow`), a pedido do usuário. Nenhum merge, delete ou outra alteração foi feito — só levantamento e avaliação de obsolescência.
- **O que foi encontrado:**
  - **`canhoto-wip`** (3 commits: `6d1135f`, `28cba88`, `3a781ff`; base `7c8c8b0`, já em `main`): as mudanças em `app-host/src/pdf/HoleriteRenderer.ts` ajustavam coordenadas de um "canhoto" (recibo) rotacionado no PDF do holerite. Esse conceito foi **substituído em `main`** pelo commit `e06fb6c` ("Substitui canhoto rotacionado do holerite por faixa de assinatura horizontal") — design diferente, torna essa parte da branch obsoleta. `scripts/seed-test.ps1` (217 linhas, seed de dados via CDP) **não existe em `main`**. Achado mais relevante: `scripts/test-holerite.ps1` **em `main` está desatualizado/quebrado** — ainda referencia `window.electronAPI.folhaGerarPdf`, que não existe mais em `app-host/src/preload.ts` (a API atual é `gerarHolerite`). A versão desse mesmo script na branch `canhoto-wip` já usa o nome correto `gerarHolerite`.
  - **`feature/core-foundation`** (8 commits; base `150b2bf`, o **primeiro commit do repositório** — história 100% paralela a `main`): implementa uma reescrita completa em Clean Architecture, usando driver `sqlite3` assíncrono em vez do `better-sqlite3` síncrono usado hoje, com DI (`compositionRoot`), DTOs e ports incompatíveis com o `app-host` atual. Empresas/Funcionários, `AppShell`, dashboard e login foram todos reimplementados de forma mais completa em `main` depois (ex.: `empresaHandlers.ts` tem 529 linhas em `main` contra uma implementação equivalente bem mais simples nesta branch). Achado sem equivalente em `main`: um domínio inteiro de **"Chamados"** (entidade, repositório SQLite, casos de uso, handlers IPC) e um modelo de usuário com bcrypt + verificação de e-mail — nenhum dos dois existe em `main` hoje, nem como conceito.
  - **`feature/empresas-flow`** (2 commits: `56c2690`, `d140562`; base também `150b2bf`, primeiro commit do repo): é o scaffolding mais antigo do projeto (`package.json` v0.0.1, pnpm@8.15.0). `empresaHandlers.ts` da branch tem 113 linhas com formato de resposta (`{ok, error}`) e imports por caminho relativo incompatíveis com a arquitetura atual do `app-host`.
- **O que foi mudado:**
  - Nenhum arquivo de código-fonte foi alterado, nenhuma branch foi mesclada ou deletada. Só este registro em `HISTORICO_AGENTES.md`.
- **Avaliação por branch:**
  - `canhoto-wip`: **majoritariamente obsoleta**, com 1 achado recuperável (fix do nome da API em `scripts/test-holerite.ts` — `main` está com o script de teste quebrado) e 1 arquivo potencialmente útil (`scripts/seed-test.ps1`, não existe em `main`).
  - `feature/core-foundation`: **obsoleta na maior parte** (arquitetura abandonada, incompatível com o runtime atual), mas contém 1 achado sem equivalente em `main` (domínio de "Chamados" + modelo de usuário com bcrypt/verificação de e-mail) — não é recuperável tecnicamente por incompatibilidade de arquitetura, mas é uma decisão de produto/escopo que talvez nunca tenha sido levada ao `main`.
  - `feature/empresas-flow`: **100% obsoleta** — scaffolding inicial do projeto, totalmente superado pela implementação atual de `main`.
- **Por que foi feito:**
  - O usuário pediu o levantamento antes de decidir se e como recuperar ou descartar cada branch — nenhuma decisão de merge/delete foi tomada nesta ação.
- **Arquivos envolvidos (analisados, nenhum alterado):**
  - `app-host/src/pdf/HoleriteRenderer.ts`, `scripts/test-holerite.ps1`, `scripts/seed-test.ps1` (via `origin/canhoto-wip`)
  - Diversos arquivos de `packages/domain`, `packages/application`, `packages/infrastructure`, `app-host/src/ipc`, `packages/ui/src` (via `origin/feature/core-foundation`)
  - `app-host/src/ipc/handlers/empresaHandlers.ts`, `packages/infrastructure/src/repositories/SqliteEmpresaRepository.ts`, `package.json` (via `origin/feature/empresas-flow`)
- **Riscos ou observações:**
  - O script `scripts/test-holerite.ps1` em `main` está referenciando uma API que não existe mais (`folhaGerarPdf` → `gerarHolerite`) — isso é um bug real em `main`, independente do destino da branch `canhoto-wip`, e pode ser corrigido separadamente sem precisar recuperar a branch.
  - O domínio de "Chamados" (suporte/tickets) da `feature/core-foundation` não está documentado em nenhum outro lugar (`CONTEXTO_TOTAL.md` não menciona esse escopo) — vale confirmar com o usuário se ainda é um recurso desejado antes de descartar a branch de vez.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0012`: corrigir `scripts/test-holerite.ps1` em `main` para usar `gerarHolerite` em vez de `folhaGerarPdf` (bug de script de teste, independente do destino das branches) — Status: Não executado.
  - `REC-0013`: confirmar com o usuário se o domínio "Chamados" (visto em `feature/core-foundation`) ainda é um recurso desejado antes de decidir o destino final dessa branch — Status: Não executado.
- **Próxima ação sugerida:**
  - Aguardar decisão do usuário sobre o destino de cada branch (manter, deletar, ou recuperar partes específicas como o fix de `test-holerite.ps1` e/ou `seed-test.ps1`).

### ACAO-0012 — 2026-09-11 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Diagnóstico / Investigação de TODO pendente
- **Status:** Concluído
- **Resumo:**
  - Investigação do TODO em `relatorioHandlers.ts:115` (campos `competencia.vt`/`competencia.vr` do motor de Relatórios Personalizados sempre retornam `0`, comentário "buscar de lançamentos" pendente). Nenhuma correção foi aplicada — só diagnóstico e estimativa de tamanho, a pedido do usuário.
- **O que foi encontrado:**
  - `app-host/src/ipc/handlers/relatorioHandlers.ts:115`: dentro de `relatorio:executar`, ao montar os campos de nível 1.1, `vt`/`vr` são hardcoded em `0` (`else if (key === 'vt' || key === 'vr') dadosComp[campo.id] = 0 // TODO: buscar de lancamentos`), enquanto `salario_bruto`/`inss`/`irrf`/`fgts`/`liquido` já são lidos de `folha_holerites`.
  - Os campos `competencia.vt` e `competencia.vr` (`packages/shared/src/constants/camposRelatorio.ts:19-20`) são colunas selecionáveis no construtor de Relatórios Personalizados — qualquer relatório do usuário que inclua essas colunas hoje sempre mostra `0`.
  - Diferente de INSS/IRRF/FGTS (persistidos como lançamentos automáticos em `folha_lancamentos` a cada `folha:calcular`, correção `[11a]` desta sessão), **VT/VR nunca são inseridos como lançamento automaticamente**. `app-host/src/ipc/handlers/folhaHandlers.ts` só auto-gera lançamentos para as rubricas `0100` (INSS), `0101` (IRRF) e `0202` (FGTS).
  - VT/VR existem em dois lugares desconectados do cálculo de folha: (1) campos diretos em `funcionarios` — `vale_transporte` (`INTEGER DEFAULT 0`, parece flag sim/não) e `vale_refeicao` (`REAL DEFAULT 0`, valor fixo mensal), usados só em `funcionarioHandlers.ts` (CRUD) e `FichaFuncionarioRenderer.ts` (exibição na ficha do funcionário); (2) rubricas catalogadas `0102` (Vale Transporte, desconto 6% percentual) e `0103` (Vale Refeição, desconto fixo) no seed `031b_rubricas_seed`, que só geram lançamento se alguém adicionar manualmente via `LancamentosEditor.tsx` para aquela competência — sem garantia de que isso tenha sido feito para nenhum funcionário.
- **O que foi mudado:**
  - Nenhum arquivo de código-fonte foi alterado. Só este registro em `HISTORICO_AGENTES.md`.
- **Avaliação de tamanho da correção:**
  - Não é troca simples de constante por query — há duas leituras possíveis com resultados diferentes, sem uma claramente correta sem decisão de produto: (1) somar lançamentos com rubrica `0102`/`0103` (troca pequena, mas frágil — mostraria `0` para a maioria dos funcionários, já que nada gera esse lançamento automaticamente); (2) ler direto de `funcionarios.vale_transporte`/`vale_refeicao` (troca pequena, mas reflete a configuração atual do funcionário, não necessariamente o valor daquela competência histórica). A correção arquiteturalmente correta — VT/VR passarem a ser lançamentos automáticos em `folha:calcular`, como INSS/IRRF/FGTS — é trabalho novo de cálculo/persistência, mesma categoria de tamanho da `REC-0004` (recálculo de folha transacional/idempotente) já pendente, fora do escopo desta sessão.
- **Por que foi feito:**
  - O usuário pediu o diagnóstico e a estimativa de tamanho antes de decidir qual abordagem seguir (leitura imprecisa rápida vs. cálculo automático correto) — nenhuma decisão foi tomada nesta ação.
- **Arquivos envolvidos (analisados, nenhum alterado):**
  - `app-host/src/ipc/handlers/relatorioHandlers.ts`
  - `packages/shared/src/constants/camposRelatorio.ts`
  - `app-host/src/ipc/handlers/folhaHandlers.ts`
  - `app-host/src/db/database.ts` (schema de `funcionarios` e seed de rubricas)
  - `app-host/src/ipc/handlers/funcionarioHandlers.ts`
  - `app-host/src/pdf/FichaFuncionarioRenderer.ts`
- **Riscos ou observações:**
  - Se alguém corrigir esse TODO lendo só `funcionarios.vale_transporte`/`vale_refeicao` sem entender que são configuração atual (não histórico), relatórios de competências passadas podem ficar sutilmente errados se o funcionário mudou de VT/VR depois.
  - O mesmo problema estrutural (ausência de lançamento automático) provavelmente afeta qualquer outro relatório ou tela que dependa de "quanto foi de VT/VR" numa competência específica — não é exclusivo deste TODO.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0014`: decidir com o usuário se VT/VR devem passar a ser lançamentos automáticos em `folha:calcular` (correção arquitetural, maior) ou se um valor aproximado (lançamento manual existente, ou campo de configuração do funcionário) é aceitável por ora para o relatório personalizado — Status: Não executado.
- **Próxima ação sugerida:**
  - Aguardar decisão do usuário sobre `REC-0014` antes de tocar em `relatorioHandlers.ts:115`.

### ACAO-0013 — 2026-09-11 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Sincronização de documentação / Contexto
- **Status:** Concluído
- **Resumo:**
  - `CONTEXTO_TOTAL.md` foi sincronizado com o histórico até `ACAO-0012`. Ele ainda apontava `ACAO-0008` como última ação registrada e não listava as recomendações `REC-0010` a `REC-0014`, o que podia confundir agentes futuros sobre o estado real do projeto.
- **O que foi mudado:**
  - `CONTEXTO_TOTAL.md`: seção 1 (`Última ação registrada` → `ACAO-0012`, com nota explícita de que foi só diagnóstico sobre VT/VR, sem correção de código; `Próxima ação recomendada` → lista das recomendações ativas em vez de uma única); seção 7 (adicionadas as entradas `REC-0010`, `REC-0011`, `REC-0012`, `REC-0013`, `REC-0014`, no mesmo formato das existentes); seção 10 (`Próximo passo recomendado` reescrita para listar todas as recomendações pendentes, sem escolher uma automaticamente).
  - `HISTORICO_AGENTES.md`: esta entrada (`ACAO-0013`), registrando a sincronização.
  - Nenhum código-fonte, regra de negócio, cálculo, autenticação, autorização ou relatório foi alterado.
- **O que foi melhorado:**
  - Agentes futuros terão uma visão resumida (`CONTEXTO_TOTAL.md`) coerente com o histórico detalhado (`HISTORICO_AGENTES.md`), sem precisar ler as 12 entradas de histórico para saber que `ACAO-0009` a `ACAO-0012` existem e o que geraram.
- **Por que foi feito:**
  - Evitar divergência entre `CONTEXTO_TOTAL.md` e `HISTORICO_AGENTES.md` — o usuário identificou que o resumo estava 4 ações atrasado em relação ao histórico.
- **Arquivos envolvidos:**
  - `CONTEXTO_TOTAL.md`
  - `HISTORICO_AGENTES.md`
  - `README_AMBIENTE.md` — lido para conferência, não alterado (nenhuma informação nova de ambiente surgiu nas ações `ACAO-0009` a `ACAO-0012`).
- **Riscos ou observações:**
  - Nenhuma prioridade foi atribuída ou reordenada entre as recomendações pendentes — isso continua sendo decisão do usuário, não desta sincronização.
  - `REC-0014` foi marcada explicitamente como "não executar sem decisão explícita do usuário", conforme instrução recebida.
- **Recomendações deixadas para próximos agentes:**
  - Nenhuma nova recomendação — esta ação só sincronizou documentação existente.
- **Próxima ação sugerida:**
  - Decidir se a próxima execução será `REC-0009`, `REC-0002`, `REC-0003` ou `REC-0014` (ou outra das recomendações pendentes listadas em `CONTEXTO_TOTAL.md`).

### ACAO-0014 — 2026-09-11 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Correção de segurança / Schema / Backend / UI
- **Status:** Concluído
- **Resumo:**
  - Executada a `REC-0002`: eliminada a exposição da credencial padrão (`admin@sudosys.local` / `admin123`) e implementado fluxo de troca obrigatória de senha no primeiro login desse usuário, via flag `must_change_password` checado no login e uma tela nova que bloqueia o acesso ao restante do sistema até a troca.
- **O que foi encontrado (diagnóstico, Passo 1 pedido pelo usuário):**
  - O seed do admin (`035b_usuario_admin_seed`, `app-host/src/db/database.ts:321-325`) roda dentro de `runMigrations()`, chamada incondicionalmente por `initDatabase()` (`app-host/src/main.ts:96`) — **sem nenhum gate de ambiente**. Confirmado que roda em todo ambiente, inclusive no instalador final para clientes, não só em dev.
  - `authHandlers.ts:25-34` trocava o hash placeholder do seed pelo hash real de `admin123` na primeira inicialização — outro ponto onde a senha padrão era fixada em código.
  - `LoginPage.tsx:166` (antes da correção) exibia literalmente `Primeiro acesso? Use admin@sudosys.local / admin123` na tela de login, em texto visível a qualquer pessoa com acesso ao instalador — agravava o risco descrito em `REC-0002`, então foi removido junto (não estava listado explicitamente na recomendação original, mas é parte do mesmo risco e é uma remoção trivial de uma linha).
  - Não existia nenhuma tela ou canal IPC de "trocar senha" no sistema (Passo 3 pedido pelo usuário) — precisou ser criado do zero. Reportado ao usuário antes de implementar (Passo 5): escopo cabia numa única tarefa (1 migration + 1 canal IPC + 1 tela nova), sem abrir escopo maior.
- **O que foi mudado:**
  - `app-host/src/db/database.ts`: nova migration `055_usuario_must_change_password` — `ALTER TABLE usuarios ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0` e `UPDATE usuarios SET must_change_password = 1 WHERE email = 'admin@sudosys.local'` (marca só o admin seed; usuários criados depois via `usuario:create`/`auth:register` nascem com `0`, decisão consistente com o escopo da REC — o risco é especificamente a credencial padrão conhecida, não senhas escolhidas por um admin ao criar outro usuário).
  - `packages/shared/src/types/usuario.ts`: `Usuario.must_change_password: number`; novos tipos `TrocarSenhaPayload` e `TrocarSenhaResult`.
  - `packages/infrastructure/src/repositories/SqliteUsuarioRepository.ts`: novo método `updateSenhaEClearMustChange(id, senha_hash)` — grava o novo hash e zera o flag numa única instrução.
  - `app-host/src/ipc/handlers/authHandlers.ts`: novo canal `auth:trocarSenha` — valida a senha atual (`hasher.verify`) contra o hash existente, grava o novo hash com `updateSenhaEClearMustChange` e atualiza o `tokenMap` em memória. Não foi adicionado a `CANAIS_PUBLICOS` em `authGuard.ts` — fica protegido pelo gate padrão (exige sessão via `WebContents`, já amarrada no login), consistente com o modelo de segurança existente.
  - `app-host/src/preload.ts` e `packages/ui/src/electron.d.ts`: expõem `trocarSenha(payload)` no `electronAPI`.
  - `packages/ui/src/api/ipcClient.ts`: método `trocarSenha` no cliente IPC do renderer, com fallback de modo browser (sem Electron) igual aos demais métodos de auth.
  - `packages/ui/src/pages/login/LoginPage.tsx`: `onLogin` passou a receber `mustChangePassword: boolean` (lido de `res.usuario.must_change_password === 1`) em vez de não receber argumento; removido o texto que expunha a credencial padrão no rodapé da tela.
  - `packages/ui/src/pages/login/TrocarSenhaPage.tsx` (novo arquivo): tela no mesmo padrão visual do `LoginPage.tsx` — campos "Senha atual", "Nova senha" (mínimo 8 caracteres, validado no cliente) e "Confirmar nova senha"; chama `ipcClient.trocarSenha` usando o token já presente em `useSessionStore`.
  - `packages/ui/src/app/App.tsx`: novo estado `'change-password'` no state machine (`loading | setup | login | change-password | main`). Login com `must_change_password = 1` vai para `'change-password'` em vez de `'main'`; só ao concluir a troca (`onDone`) o estado avança para `'main'`. Não há como pular essa tela e acessar rotas do `AppRouter` sem passar por ela.
- **Reaproveitamento (Passo 3):** confirmado que não havia tela de troca de senha existente para reaproveitar — a única coisa parecida (`AdminPage.tsx`) é o formulário de criação de usuário, que já usa `usuario:create`/`hasher.hash` sem relação com troca de senha do próprio usuário logado. Nada foi duplicado; a lógica de hash (`SimplePasswordHasher`) e o padrão de resposta (`{success, error}`) foram reaproveitados dos handlers de auth já existentes.
- **Validação:**
  - `pnpm typecheck` (todos os 7 workspaces) passou limpo após as mudanças.
  - **Achado de ambiente, não relacionado ao código desta ação:** neste ambiente novo (casa), `packages/application/node_modules/@types/node` não estava linkado apesar de declarado em `package.json` e presente no lockfile — `pnpm typecheck`/`pnpm dev` falhavam com `Cannot find name 'Buffer'` mesmo em arquivos não tocados por esta ação (`FileStore.ts`, `PdfRenderer.ts`). Reproduzido também fazendo `git stash` das mudanças desta ação, confirmando que não é causado por elas. Corrigido rodando `pnpm install --frozen-lockfile` novamente (aceitando a recriação completa de `node_modules` que o pnpm propôs) — depois disso o link apareceu e todo o typecheck passou. Não há indicação de que isso afete outros ambientes; registrado aqui para o caso de reaparecer.
  - Teste via UI real (Passo 4), com `pnpm dev` rodando o Electron real (`--remote-debugging-port=9222`) e interação via Chrome DevTools Protocol (script Node ad-hoc, mesmo princípio de `scripts/cdp-test.mjs`, não commitado — descartado ao final): banco de dev resetado (`.dev-user-data` removido); completado o setup wizard via `window.electronAPI.saveConfig(...)`; login com `admin@sudosys.local` / `admin123` **forçou** a tela "Troca de Senha Obrigatória" antes de qualquer outra coisa; preenchida a troca (senha atual `admin123`, nova `teste12345`) e confirmado que o Dashboard (`AppShell`, ribbon, menu, botão "Sair") foi liberado normalmente após a troca; logout e novo login com `teste12345` foram direto ao Dashboard, **sem** pedir troca de senha novamente. Os quatro passos do fluxo bateram com o esperado.
- **Por que foi feito:**
  - `REC-0002` (Crítica): a credencial padrão documentada e hardcoded no seed, replicada em todo ambiente incluindo produção, era um risco de acesso não autorizado conhecido e trivial de explorar — qualquer instalação nova do produto nasce com esse usuário/senha até alguém trocar manualmente, o que hoje não era nem possível de fazer pela UI.
- **Arquivos envolvidos:**
  - `app-host/src/db/database.ts`
  - `app-host/src/ipc/handlers/authHandlers.ts`
  - `app-host/src/preload.ts`
  - `packages/infrastructure/src/repositories/SqliteUsuarioRepository.ts`
  - `packages/shared/src/types/usuario.ts`
  - `packages/ui/src/api/ipcClient.ts`
  - `packages/ui/src/app/App.tsx`
  - `packages/ui/src/electron.d.ts`
  - `packages/ui/src/pages/login/LoginPage.tsx`
  - `packages/ui/src/pages/login/TrocarSenhaPage.tsx` (novo)
- **Riscos ou observações:**
  - O flag `must_change_password` só é setado automaticamente para o usuário seed (`admin@sudosys.local`). Se algum admin resetar a senha de outro usuário manualmente direto no banco (fora da UI) para um valor "padrão" combinado fora do sistema, esse flag não é ativado — o mecanismo cobre especificamente o seed automático, que era o escopo pedido.
  - `auth:register` continua fora do gate central de `authGuard.ts` (decisão de outro agente, documentada em `authGuard.ts:38-41`) — não alterado nesta ação, fora de escopo da `REC-0002`.
  - O achado de ambiente (`@types/node` não linkado nesta máquina) não tem relação com a REC-0002, mas foi corrigido no processo de validação porque bloqueava totalmente `pnpm dev`/`pnpm typecheck`; não foi feita nenhuma mudança de versão ou configuração, só reinstalação de dependências.
- **Recomendações deixadas para próximos agentes:**
  - Nenhuma nova recomendação. `REC-0002` passa para `Executado` em `CONTEXTO_TOTAL.md` e nesta seção.
- **Próxima ação sugerida:**
  - Retomar a priorização já listada em `CONTEXTO_TOTAL.md` (`REC-0009`, `REC-0003`, `REC-0008`, etc.), conforme decisão do usuário.

### ACAO-0015 — 2026-09-12 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Testes automatizados / Framework de testes
- **Status:** Concluído
- **Resumo:**
  - Executada parcialmente a `REC-0003`, por instrução explícita do usuário de não expandir escopo: criada suíte automatizada só para o motor de cálculo IRRF/INSS/FGTS (`packages/infrastructure/src/services/CalculoFolha.ts`), cobrindo os 4 cenários de IRRF (isenção total, faixa de transição do redutor, acima do teto, desconto simplificado) e 1 teste de guarda de competência (redutor da Lei 15.270/2025 não se aplica antes de 2026-01), além de checagem dos valores de INSS e FGTS usados nesses mesmos cenários. Rescisão, Férias, Ponto e demais áreas ficam fora desta ação.
- **O que foi encontrado (Passo 1 pedido pelo usuário):**
  - Nenhum framework de teste configurado em nenhum lugar do monorepo — sem `vitest`/`jest` em nenhum `package.json` da raiz ou dos workspaces, e nenhum dos dois presentes no store do pnpm (`node_modules/.pnpm`). Confirma o que já estava registrado em `CONTEXTO_TOTAL.md` ("não há framework de testes configurado").
- **O que foi mudado:**
  - `packages/infrastructure/package.json`: adicionado `vitest` como devDependency e script `"test": "vitest run"`. Instalada primeiro a versão mais recente (`5.0.0`), que gerou aviso de peer dependency (exige `vite@^6/7/8`, mas o monorepo usa `vite@5.4.21` fixado pela UI); removida e reinstalada como `vitest@^3.2.4` (resolveu `3.2.7`), compatível com `vite@5.x` — sem avisos de peer dependency.
  - `packages/infrastructure/tsconfig.json`: adicionado `"exclude": ["src/**/*.test.ts"]`. Sem isso, `pnpm --filter @sudo-sys/infrastructure build` compilava o arquivo de teste para `dist/services/CalculoFolha.test.js` (+`.d.ts`, + `.map`), poluindo o pacote publicado (`files: ["dist"]` no `package.json` o incluiria). Descoberto rodando o build depois de criar o teste e inspecionando `dist/`; corrigido e revalidado (rebuild limpo confirma que não sobra mais nenhum arquivo de teste em `dist/`).
  - `packages/infrastructure/src/services/CalculoFolha.test.ts` (novo arquivo): 7 testes — 4 cenários de `calcularIRRF` (A: bruto 2800/0 dep/tradicional → R$0,00; B: bruto 6000/0 dep/tradicional → R$385,10; C: bruto 8500/2 dep/tradicional → R$1.052,77; D: bruto 4500/0 dep/simplificado → R$0,00), 1 teste de guarda de competência (mesma base do cenário B, mas competência `2025-12` em vez de `2026-01` → R$564,85, valor da tabela cheia sem redutor), 1 teste com os 4 valores de `calcularINSS` usados nos cenários acima (R$227,69 / R$641,51 / R$988,09 / R$431,51) e 1 teste de `calcularFGTS` (8% sobre R$2.800 e R$6.000).
  - `package.json` (raiz): adicionado script `"test": "pnpm --filter @sudo-sys/infrastructure test"`, para existir um comando único e óbvio (`pnpm test`) sem precisar saber o nome do workspace.
- **Verificação dos valores esperados (antes de escrever as asserções):** os 5 valores de IRRF, os 4 de INSS e os 2 de FGTS pedidos pelo usuário foram recalculados manualmente a partir do código atual de `CalculoFolha.ts` (tabelas INSS 2026-01, tabela IRRF vigente desde 2025-05, redutor da Lei 15.270/2025) antes de escrever o teste — todos batem exatamente com os valores informados pelo usuário como já confirmados nesta sessão. O teste de guarda de competência reaproveita a mesma base de cálculo (bruto − INSS) do cenário B para isolar exclusivamente o efeito do gate de competência do redutor, em vez de recalcular o INSS de 2025-12 (que usa uma tabela diferente e daria um número final diferente do R$564,85 esperado) — essa escolha foi deliberada para testar o comportamento específico pedido, não uma coincidência.
- **Validações executadas:**
  - `pnpm --filter @sudo-sys/infrastructure test` (e o atalho `pnpm test` na raiz): **7/7 testes passaram** contra o código atual, sem nenhum ajuste de valor esperado necessário.
  - `pnpm typecheck` (todos os 7 workspaces): passou limpo depois de adicionar o teste e o `exclude` no `tsconfig.json`.
  - `pnpm --filter @sudo-sys/infrastructure build`: rebuild limpo (`dist` removido antes) confirmado sem nenhum arquivo `*.test.*` na saída.
- **Por que foi feito:**
  - `REC-0003` (Crítica): o motor de IRRF já teve um bug real corrigido nesta sessão (Lei 15.270/2025 usando a base errada para o redutor, corrigido na `ACAO-0008`) e não havia nenhuma proteção automatizada contra regressão — só validação manual pontual. Esta suíte fixa os 4 cenários e a guarda de competência já validados manualmente como comportamento esperado, para que qualquer mudança futura em `CalculoFolha.ts` que quebre esses casos seja pega antes de chegar a produção.
- **Arquivos envolvidos:**
  - `packages/infrastructure/package.json`
  - `packages/infrastructure/tsconfig.json`
  - `packages/infrastructure/src/services/CalculoFolha.test.ts` (novo)
  - `package.json`
- **Riscos ou observações:**
  - Cobertura deliberadamente restrita ao motor IRRF/INSS/FGTS, por instrução explícita do usuário — Rescisão, Férias, Ponto e o restante dos cálculos trabalhistas mencionados na `REC-0003` original continuam sem nenhum teste automatizado. Por isso `REC-0003` foi marcada como `Parcialmente executado`, não `Executado`.
  - A suíte testa `calcularIRRF`/`calcularINSS`/`calcularFGTS` isoladamente (unção pura, sem banco/IPC) — não cobre o ponto de integração em `folhaHandlers.ts` que monta `baseIrrf` a partir dos lançamentos da competência; um teste de integração desse trecho continua fora do escopo desta ação.
  - `vitest` ficou instalado só como devDependency de `packages/infrastructure`, não na raiz nem em outros workspaces — qualquer suíte futura em outro pacote precisa da mesma decisão de instalação (e da mesma checagem de compatibilidade de peer dependency com a versão de `vite` já fixada pela UI).
- **Recomendações deixadas para próximos agentes:**
  - Nenhuma nova recomendação. `REC-0003` passa para `Parcialmente executado` em `CONTEXTO_TOTAL.md` e nesta seção; o escopo restante (Rescisão, Férias, Ponto e demais cálculos) continua pendente de decisão do usuário sobre prioridade.
- **Próxima ação sugerida:**
  - Retomar a priorização já listada em `CONTEXTO_TOTAL.md` (`REC-0009`, `REC-0008`, `REC-0010` a `REC-0014`, e o restante de `REC-0003`), conforme decisão do usuário.

### ACAO-0016 — 2026-09-12 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Correção de confiabilidade / Transação / Schema
- **Status:** Concluído
- **Resumo:**
  - Executados os itens 1 e 2 do diagnóstico da `REC-0004` (item 3 — lock de concorrência — ficou de fora por instrução do usuário, virou `REC-0015`): o recálculo de folha em `folha:calcular` (`folhaHandlers.ts`) agora roda inteiro dentro de uma única transação SQLite (`runInTransaction`), e `folha_lancamentos` ganhou `UNIQUE(folha_id, funcionario_id, rubrica_codigo, origem)` via migration `056`.
- **Diagnóstico prévio (conversa anterior a esta ação, sem código alterado):** confirmado que o cálculo era uma sequência de `.run()` soltos sem transação; que um crash no meio do processo podia deixar holerite com totais novos e lançamentos com os antigos (ou vice-versa) tanto dentro de um funcionário quanto entre funcionários da mesma folha; que lançamentos manuais já sobreviviam corretamente ao recálculo (não eram apagados nem duplicados); e que não havia nenhum controle de concorrência nem constraint de unicidade em `folha_lancamentos`.
- **ITEM 1 — Transação:**
  - `app-host/src/ipc/handlers/folhaHandlers.ts`: todo o corpo do recálculo (loop de todos os funcionários da folha — `upsertHolerite` → `deleteLancamentosAutomaticos` → até 3 `addLancamento` por funcionário — mais `recalcularTotaisFolha` e `update({status: 'processada'})` no final) passou a rodar dentro de `runInTransaction(db, () => { ... })`, importado de `@sudo-sys/infrastructure`.
  - **Granularidade escolhida:** uma transação única para a folha inteira (todos os funcionários), não uma transação por funcionário — mesmo padrão de `023_cbo_completo.ts` (uma transação por operação, não uma por linha/iteração do loop). Justificativa registrada em comentário no próprio código: o diagnóstico anterior identificou inconsistência possível em dois níveis — dentro de um funcionário (holerite com totais novos + lançamentos com os antigos) e entre funcionários (alguns recalculados, outros não, folha nunca marcada `'processada'`). Uma transação por funcionário resolveria só o primeiro nível; só a transação única cobre os dois.
  - `packages/infrastructure/src/index.ts`: `runInTransaction` (que já existia em `db/sqlite/SqliteTx.ts` desde antes, mas nunca tinha sido exportado nem usado fora do seed de CBO) passou a ser exportado publicamente, para o `app-host` poder importá-lo pela API pública do pacote (mesmo padrão dos demais exports, sem import por `/src`).
- **ITEM 2 — Constraint UNIQUE:**
  - Antes de aplicar: rodado um script ad-hoc (Electron real, banco de produção em `%APPDATA%\Electron\banco\sudosys.db`, aberto em modo `readonly`, sem gravação) checando `GROUP BY folha_id, funcionario_id, rubrica_codigo, origem HAVING COUNT(*) > 1` em `folha_lancamentos` — **zero grupos duplicados encontrados** (o banco real tinha só 1 lançamento no total). Confirmado que a migration é segura de aplicar nesse banco.
  - `app-host/src/db/database.ts`: nova migration `056_folha_lancamentos_unique` — mesmo padrão de recriação de tabela da migration `054` (SQLite não suporta `ALTER TABLE ADD CONSTRAINT`): `PRAGMA foreign_keys = OFF`, cria `folha_lancamentos_new` com `UNIQUE(folha_id, funcionario_id, rubrica_codigo, origem)`, copia os dados, `DROP`+`RENAME`, `PRAGMA foreign_keys = ON`. Nenhuma outra tabela tem FK apontando para `folha_lancamentos.id`, então não há cascata a ajustar.
- **Validação (Passo pedido pelo usuário):**
  - Criado `packages/infrastructure/src/repositories/SqliteFolhaRepository.test.ts` (3 testes novos, usando banco SQLite real em memória com o schema pós-migration 056, na mesma camada de teste do `REC-0003` — não foi possível testar o handler `folha:calcular` em si porque ele vive no `app-host`, que depende do módulo `electron` e não tem framework de teste configurado; os testes cobrem os mesmos métodos de repositório e o mesmo `runInTransaction` que o handler usa, na mesma sequência de chamadas):
    1. **Rollback completo:** simulado um `throw` dentro do callback passado a `runInTransaction` (sem tocar em `folhaHandlers.ts` — só no callback de teste), entre `deleteLancamentosAutomaticos` e o `addLancamento` do automático novo. Confirmado: o holerite continua com os totais **antigos** e o lançamento automático antigo continua existindo — nada mudou, exatamente como esperado de uma transação atômica.
    2. **Idempotência:** o mesmo ciclo `upsertHolerite`→`deleteLancamentosAutomaticos`→`addLancamento` (dentro de `runInTransaction`) rodado duas vezes seguidas — confirmado 1 único lançamento automático (não duplicou) e o lançamento manual intacto (mesmo valor, mesma linha).
    3. **Constraint em ação:** inserir manualmente duas linhas `automatico` com a mesma `folha_id`+`funcionario_id`+`rubrica_codigo` fora do fluxo de delete-então-insert agora lança `UNIQUE constraint failed`, provando que a proteção não depende só da lógica da aplicação.
  - `pnpm --filter @sudo-sys/infrastructure test`: **10/10 testes passaram** (7 da suíte do `REC-0003` + 3 novos), sem alterar nenhum valor esperado da suíte de IRRF/INSS/FGTS.
  - `pnpm typecheck` (todos os 7 workspaces): passou limpo.
  - `pnpm --filter @sudo-sys/infrastructure build`: rebuild limpo confirmou que os dois arquivos de teste (o do `REC-0003` e o novo) continuam fora de `dist/` (exclude já configurado na `ACAO-0015`).
- **Achado de ambiente durante a validação (não é bug de código, registrado para o próximo agente não se confundir):** ao rodar `pnpm --filter @sudo-sys/infrastructure test` pela primeira vez após esta sessão, os 3 testes novos falharam com erro de ABI do `better-sqlite3` (`NODE_MODULE_VERSION 128` vs `115` exigido) — porque o binário nativo tinha sido recompilado para a ABI do Electron (128) durante o teste de UI da `ACAO-0014`/`ACAO-0016` anterior, e `vitest` roda sob Node puro (ABI 115). `pnpm rebuild better-sqlite3` não teve efeito (não reconstrói de fato quando o pacote já tem um binário presente, mesmo que para a ABI errada). A correção foi rodar `prebuild-install`/`node-gyp rebuild --release` diretamente dentro de `node_modules/.pnpm/better-sqlite3@11.10.0/node_modules/better-sqlite3` para forçar o binário de volta à ABI do Node. **Consequência prática:** depois de rodar os testes, `pnpm dev`/o Electron real vão precisar reconstruir `better-sqlite3` de novo para a ABI do Electron antes de abrir — isso já acontece automaticamente hoje via `electron:dev:prepare` (que roda `electron-rebuild -f -w better-sqlite3` antes de todo `pnpm dev`), então não é uma ação manual nova, mas explica por que alternar entre "rodar os testes" e "rodar o app" nesta máquina exige esse rebuild de ida e volta.
- **Por que foi feito:**
  - `REC-0004` (Alta): o diagnóstico anterior confirmou que a ausência de transação era uma lacuna real (não só teórica) e que a peça técnica para resolvê-la (`runInTransaction`) já existia no projeto, sem uso. A constraint UNIQUE fecha a mesma lacuna por um segundo caminho independente (schema, não só lógica de aplicação), coerente com o que o diagnóstico anterior apontou sobre `folha_lancamentos` não ter nenhuma proteção de unicidade ao contrário de `folha_holerites`.
- **Arquivos envolvidos:**
  - `app-host/src/db/database.ts`
  - `app-host/src/ipc/handlers/folhaHandlers.ts`
  - `packages/infrastructure/src/index.ts`
  - `packages/infrastructure/src/repositories/SqliteFolhaRepository.test.ts` (novo)
- **Riscos ou observações:**
  - **A constraint nova vale para `origem = 'manual'` também, não só `'automatico'`.** Não foi encontrada nenhuma trava na UI (`LancamentosEditor.tsx`) impedindo hoje o usuário de adicionar dois lançamentos manuais com a mesma rubrica na mesma folha+funcionário (ex.: dois adiantamentos sob o mesmo código de rubrica) — com a migration `056`, isso passaria a ser rejeitado com `UNIQUE constraint failed` em vez de aceito. Implementado assim porque foi a especificação explícita do usuário e não há dado real hoje que dependa desse comportamento (confirmado na checagem pré-migration), mas fica registrado como um risco funcional a observar: se esse padrão de uso for legítimo e necessário, a constraint precisará ser revista (ex.: incluir algo que diferencie múltiplos manuais da mesma rubrica, como um `sequencial`, ou restringir o `UNIQUE` só a `origem = 'automatico'` via índice parcial).
  - **Addendum (`ACAO-0017`):** esse risco se confirmou real e foi corrigido — a migration `056` foi trocada de `UNIQUE` de tabela (todos os `origem`) para um índice único parcial (só `origem = 'automatico'`), antes de rodar em qualquer banco real. Ver `ACAO-0017` para o detalhamento.
  - O item 3 do diagnóstico (lock de concorrência) foi deliberadamente deixado de fora, por instrução do usuário — ver `REC-0015` abaixo.
  - A transação única cobre `folha:calcular` (recálculo). Outros handlers de folha com múltiplas escritas (`folha:lancamentos:add`, `folha:lancamentos:delete`) continuam com escrita única cada um, então não têm o mesmo risco de estado parcial — não precisaram de mudança.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0015` (Nova) — **Status:** Não executado. **Recomendação:** Implementar um lock de concorrência para `folha:calcular` (ex.: campo/estado `status = 'calculando'` checado no início do handler, rejeitando uma segunda chamada sobreposta para a mesma folha). **Motivo:** item 3 do diagnóstico da `REC-0004` — hoje não existe nenhum controle de concorrência; a proteção atual contra "clicar calcular duas vezes rápido" é só um efeito colateral do event loop síncrono de um único processo Node, não uma garantia deliberada. **Só é necessário se/quando o sistema deixar de ser single-user/single-instância** (hoje documentado como tal); não é uma correção urgente enquanto essa premissa se mantiver. **Prioridade:** Não definida — a confirmar com o usuário se/quando o cenário multiusuário for avaliado. **Origem:** Claude. **Data:** 2026-09-12. **Referência:** `ACAO-0016`.
- **Próxima ação sugerida:**
  - Retomar a priorização já listada em `CONTEXTO_TOTAL.md` (`REC-0009`, `REC-0008`, `REC-0010` a `REC-0013`, `REC-0015`, e o restante de `REC-0003`), conforme decisão do usuário. `REC-0014` continua bloqueada até decisão explícita.

### ACAO-0017 — 2026-09-12 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Correção de escopo (ajuste de uma tarefa anterior deste mesmo agente)
- **Status:** Concluído
- **Resumo:**
  - Corrigido o escopo da migration `056` (introduzida na `ACAO-0016`, `REC-0004`): o usuário identificou que o `UNIQUE(folha_id, funcionario_id, rubrica_codigo, origem)` de tabela inteira bloqueava também lançamentos **manuais** duplicados (mesma rubrica, mesma folha+funcionário) — um caso de uso legítimo (ex.: dois adiantamentos manuais na mesma competência) que nunca foi um problema real. O problema original da `REC-0004` (item d do diagnóstico) era só a ausência de proteção de schema para os lançamentos **automáticos**. Isso não é um bug novo introduzido por mim nesta ação — é uma correção do escopo que eu mesmo tinha implementado largo demais na `ACAO-0016`.
- **Confirmação antes de mexer na migration 056:** checado, via Electron real, se `056_folha_lancamentos_unique` já tinha sido aplicada em algum banco real (produção em `%APPDATA%\Electron\banco\sudosys.db`, e o de dev em `.dev-user-data`) — **não tinha rodado em nenhum dos dois** (o de dev nem existia; o de produção não tinha a entrada em `_migrations`). Por isso a migration `056` foi **editada diretamente**, em vez de criar uma `057` nova — não há histórico de migration já aplicada para preservar.
- **O que foi mudado:**
  - `app-host/src/db/database.ts`: a migration `056_folha_lancamentos_unique` deixou de recriar a tabela `folha_lancamentos` com `UNIQUE` de coluna e passou a ser um `CREATE UNIQUE INDEX idx_folha_lancamentos_automatico_unico ON folha_lancamentos(folha_id, funcionario_id, rubrica_codigo, origem) WHERE origem = 'automatico'` — um índice único **parcial**, sem precisar do padrão de recriação de tabela (SQLite permite `CREATE INDEX` direto; só `ADD CONSTRAINT` de coluna exige recriar a tabela, que era o caso anterior).
  - `packages/infrastructure/src/repositories/SqliteFolhaRepository.test.ts`: schema do banco de teste atualizado para refletir o índice parcial (em vez do `UNIQUE` de coluna); comentário do arquivo atualizado explicando a correção de escopo; teste da constraint renomeado para deixar claro que é sobre o índice parcial; adicionado 1 teste novo confirmando que dois lançamentos manuais com a mesma rubrica agora são aceitos sem erro (regressão que a versão anterior teria introduzido).
- **Validações executadas:**
  - Rodado o SQL exato da migration corrigida direto num banco SQLite real (fora do harness de teste, script ad-hoc) inserindo: 2 automáticos duplicados → rejeitado com `UNIQUE constraint failed` (comportamento preservado); 2 manuais duplicados → aceito sem erro (regressão corrigida).
  - `pnpm --filter @sudo-sys/infrastructure test`: **11/11 testes passaram** (7 do `REC-0003` + 4 da `REC-0004`, um a mais que antes por causa do novo teste de "manual duplicado permitido"). Nenhum teste precisou ser corrigido por ter assumido a constraint ampla incorretamente — o teste de rollback e o de idempotência já usavam só `origem = 'automatico'` nos casos de duplicação, então continuaram válidos como estavam; só o teste da constraint em si precisou de rename e o novo teste foi adicionado.
  - `pnpm typecheck` (todos os 7 workspaces): passou limpo.
- **Por que foi feito:**
  - O usuário identificou corretamente que a correção da `ACAO-0016` tinha escopo maior do que o problema documentado na `REC-0004`/diagnóstico original — a constraint devia proteger só contra duplicação dos automáticos gerados por `folha:calcular`, não restringir o uso de lançamentos manuais, que é uma área do sistema fora do escopo da `REC-0004`.
- **Arquivos envolvidos:**
  - `app-host/src/db/database.ts`
  - `packages/infrastructure/src/repositories/SqliteFolhaRepository.test.ts`
- **Riscos ou observações:**
  - Nenhum risco novo introduzido. O item de risco registrado na `ACAO-0016` sobre a constraint ampla está resolvido por esta ação (ver addendum na `ACAO-0016`).
  - Como a migration `056` foi editada em vez de virar uma `057`, qualquer ambiente que por algum motivo já tivesse rodado a versão antiga da `056` (nenhum encontrado nesta checagem) ficaria com o schema errado e precisaria de intervenção manual — não é o caso de nenhum banco conhecido hoje, mas vale confirmar de novo em qualquer ambiente que não foi checado aqui antes de considerar a migration definitivamente segura em todo lugar.
- **Recomendações deixadas para próximos agentes:**
  - Nenhuma nova recomendação.
- **Próxima ação sugerida:**
  - Retomar a priorização já listada em `CONTEXTO_TOTAL.md`, conforme decisão do usuário.

### ACAO-0018 — 2026-09-12 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Implementação (motor isolado, sem integração)
- **Status:** Concluído — **motor implementado, integração pendente (decisão de produto)**
- **Resumo:**
  - Item [7a]: implementados de verdade os 5 stubs de `packages/domain/src/formula/` (`FormulaTokenizer`, `FormulaAst`, `FormulaParser`, `FormulaEvaluator`, `FormulaValidator`), para a gramática já documentada em `VariablesDictionaryPage.tsx` (operadores `+ - * / ( )`, 15 variáveis nomeadas). **Não** foi conectado a `folhaHandlers.ts`, `LancamentosEditor.tsx` ou `RubricaForm.tsx` — por instrução explícita do usuário, a integração é uma decisão de produto separada. O motor continua sem nenhum consumidor em runtime, exatamente como diagnosticado na conversa anterior a esta ação.
- **O que foi implementado:**
  - `FormulaAst.ts`: tipo `FormulaNode` (união discriminada: `numero`, `variavel`, `unario`, `binario`).
  - `FormulaTokenizer.ts`: tokeniza números (com ponto decimal), identificadores (`[A-Za-z_][A-Za-z0-9_]*`), operadores `+ - * /` e parênteses; lança `FormulaSyntaxError` em caractere desconhecido ou número malformado (ex.: `1.2.3`).
  - `FormulaParser.ts`: parser recursivo descendente com a gramática padrão de precedência (`expressao := termo (('+'|'-') termo)*`, `termo := fator (('*'|'/') fator)*`, `fator := '-'? primario`, `primario := NUMERO | IDENTIFICADOR | '(' expressao ')'`). Suporta unário negativo (`-SALARIO`). Lança `FormulaSyntaxError` para: fórmula vazia, parêntese não fechado, operando faltando, operador duplicado (ex.: `"5 + + 3"`, pois `+` não é aceito como início de `fator`), token sobrando após uma expressão válida (ex.: `"5 5"`).
  - `FormulaEvaluator.ts`: `evaluate(formula, ctx)` — faz parse e avalia a AST contra o contexto recebido. **Não busca dado nenhum sozinho** (conforme pedido): toda variável vem de `ctx: Record<string, number>`.
  - `FormulaValidator.ts`: `validate(formula)` — faz parse (capturando erro de sintaxe sem lançar, retornando `{valid: false, errors: [...]}`) e depois verifica se toda variável referenciada está entre as 15 documentadas (`VARIAVEIS_CONHECIDAS`, exportada). **Mudança de assinatura em relação ao stub original** (`validate(_ast: unknown)` → `validate(formula: string)`): decidido porque o stub nunca teve consumidor (dead code) e, para detectar erro de sintaxe como pedido, o validator precisa ser dono do parse — se só recebesse a AST já pronta, uma fórmula sintaticamente inválida nunca chegaria a ele.
  - `packages/domain/src/formula/DiasUteis.ts` (novo arquivo, não um stub pré-existente): `contarDiasUteis(competencia: string): number` — conta dias de segunda a sexta de uma competência `"AAAA-MM"` (mesma convenção de string usada em `folha_competencias.competencia`/`diasDoMes()` de `CalculoFolha.ts`). Implementado porque, conforme já levantado no diagnóstico anterior, não existia nenhuma função reutilizável de "contar dias úteis do mês" em lugar nenhum do projeto — só detecção de fim de semana embutida no renderer de PDF do espelho de ponto. **Não considera feriados** (nenhuma fonte de feriados existe no projeto hoje). Não foi conectada a `DIAS_UTEIS` como variável de contexto — isso também é integração, fora do escopo.
  - `packages/domain/src/formula/index.ts`: passou a exportar os 5 arquivos acima (antes só exportava `FormulaEvaluator`).
- **Decisões de comportamento tomadas e documentadas em código (pedido explícito do usuário para reportar):**
  - **Variável ausente do `ctx` em tempo de avaliação:** `FormulaEvaluator` lança `FormulaEvaluationError` (`"Variável desconhecida no contexto: X"`), em vez de tratar como `0` silenciosamente. Motivo: um valor de rubrica errado por variável esquecida no contexto é pior do que a rubrica falhar de forma visível.
  - **Divisão por zero:** `FormulaEvaluator` lança `FormulaEvaluationError` (`"Divisão por zero."`), em vez de propagar `Infinity`/`NaN`. Motivo: numa folha de pagamento, um `Infinity`/`NaN` gravado silenciosamente como valor de lançamento é um risco financeiro maior do que interromper o cálculo com um erro claro no momento em que ele acontece.
- **Validações executadas:**
  - Criada `packages/domain/src/formula/Formula.test.ts` (25 testes, `vitest`, mesmo padrão do `REC-0003`): os 3 exemplos reais documentados na UI (`SALARIO * 0.05`, `SALARIO_HORA * 1.5 * HORAS_EXTRAS_50`, `BASE_INSS * 0.08`); precedência de operador (`"2 + 3 * 4"` → `14`, não `20`); parênteses simples e aninhados; unário negativo; divisão combinada com subtração; divisão por zero direta e via subexpressão (ambas lançam); variável ausente do contexto (lança); 6 casos de erro de sintaxe no parser (parêntese não fechado, operador duplicado, operando faltando, fórmula vazia/só espaço, caractere desconhecido, token sobrando); validator aceitando os 3 exemplos e as 15 variáveis individualmente, rejeitando variável desconhecida (com nome exato no erro), rejeitando os 2 erros de sintaxe sem tentar avaliar, e reportando múltiplos erros de uma vez (`"FOO + BAR"` → 2 erros); `contarDiasUteis` para janeiro/2026 (22 dias úteis) e fevereiro/2026 (20 dias úteis) — valores conferidos por script Node antes de escrever a asserção, não chutados.
  - `pnpm --filter @sudo-sys/domain test`: **25/25 passaram** na primeira execução, sem precisar ajustar nenhuma implementação.
  - Instalado `vitest@^3.2.4` em `packages/domain` (mesma versão do `REC-0003`, compatível com `vite@5.x` já fixado pela UI, sem aviso de peer dependency) e adicionado script `"test"`; `packages/domain/tsconfig.json` ganhou `exclude` do arquivo de teste (mesmo ajuste já feito em `infrastructure` no `REC-0003`) — confirmado rebuild limpo sem `*.test.*` em `dist/`.
  - `package.json` (raiz): `"test"` passou a rodar `domain` e depois `infrastructure` (`pnpm --filter @sudo-sys/domain test && pnpm --filter @sudo-sys/infrastructure test`) — `pnpm test`: **36/36 testes passaram** (25 novos + 11 já existentes).
  - `pnpm typecheck` (todos os 7 workspaces): passou limpo.
- **Por que foi feito:**
  - O usuário pediu explicitamente para construir só o motor, deixando a integração (onde e como conectar ao cálculo de folha) para decisão de produto posterior — a gramática e as variáveis já estavam de fato documentadas em código de UI (`VariablesDictionaryPage.tsx`), então não havia ambiguidade de design a resolver para essa parte.
- **Arquivos envolvidos:**
  - `packages/domain/src/formula/FormulaAst.ts`
  - `packages/domain/src/formula/FormulaTokenizer.ts`
  - `packages/domain/src/formula/FormulaParser.ts`
  - `packages/domain/src/formula/FormulaEvaluator.ts`
  - `packages/domain/src/formula/FormulaValidator.ts`
  - `packages/domain/src/formula/DiasUteis.ts` (novo)
  - `packages/domain/src/formula/index.ts`
  - `packages/domain/src/formula/Formula.test.ts` (novo)
  - `packages/domain/package.json`
  - `packages/domain/tsconfig.json`
  - `package.json`
- **Riscos ou observações:**
  - **O motor continua sem nenhum consumidor em runtime.** Nenhuma rubrica em produção usa `modo_valor = 'formula'` hoje (confirmado no diagnóstico anterior) e nada em `folhaHandlers.ts`/`LancamentosEditor.tsx`/`RubricaForm.tsx` foi tocado — esta ação não muda o comportamento observável do sistema para nenhum usuário. `[7a]` **não deve ser marcado como totalmente concluído** enquanto a integração não for decidida e feita.
  - `VariableDictionary.ts` (stub irmão em `packages/domain/src/formula/`) **não foi tocado** — fora do escopo explícito desta tarefa (só os 5 arquivos listados + a utilidade de dias úteis).
  - A lista `VARIAVEIS_CONHECIDAS` em `FormulaValidator.ts` duplica manualmente os 15 nomes já existentes em `packages/ui/src/pages/rubricas/VariablesDictionaryPage.tsx` (`FORMULA_VARIAVEIS`) — não há hoje um pacote compartilhado entre UI e domínio para essa lista viver uma única vez. Se um dos dois lugares for atualizado no futuro (nova variável), o outro precisa ser atualizado manualmente até essa duplicação ser resolvida — provavelmente parte natural do trabalho de integração.
  - `contarDiasUteis` não considera feriados nem tem teste de virada de ano/ano bissexto além dos dois meses testados — suficiente para provar a lógica de dias úteis Mon-Sex, mas quem for integrar `DIAS_UTEIS` de verdade deve avaliar se feriados importam para o caso de uso real antes de usar em produção.
- **Recomendações deixadas para próximos agentes:**
  - Nenhuma nova `REC` formal — a decisão de integração (onde plugar o motor: botão "calcular a partir da fórmula" em `LancamentosEditor.tsx`? Automático em `folha:calcular` como um novo tipo de lançamento?) foi explicitamente reservada para o usuário decidir com o Jeremias, fora do escopo de uma recomendação técnica unilateral.
- **Próxima ação sugerida:**
  - Aguardar decisão do usuário/Jeremias sobre o desenho da integração do motor de fórmulas ao fluxo de cálculo de folha, antes de qualquer código novo nessa área.

### ACAO-0019 — 2026-09-12 — Claude

- **Autor da ação:** Claude
- **Tipo de ação:** Integração de UI (item `[7a]`, agora concluído)
- **Status:** Concluído
- **Resumo:**
  - Conectado o motor de fórmulas (`ACAO-0018`) ao `LancamentosEditor.tsx`: botão manual "ƒ" que aparece só quando a rubrica selecionada tem `modo_valor = 'formula'`. Ao clicar, resolve o contexto real (funcionário + competência + ponto + holerite já calculado, se existir), valida a fórmula, avalia e preenche o campo Valor — sem travar o campo (o usuário ainda pode editar manualmente depois). Sob demanda, sem preview em tempo real, por decisão do usuário (evitar reprocessamento a cada tecla). `[7a]` agora está de fato conectado — não é mais só motor isolado.
- **Pré-requisito confirmado antes de começar:** `pnpm --filter @sudo-sys/domain test` — 25/25 passando (motor da `ACAO-0018` intacto).
- **PASSO 1 — como o usuário adiciona um lançamento hoje:** modal `LancamentoFormModal` (aberto pelo botão "+ Lançamento" do `LancamentosEditor.tsx`), com um `<select>` de rubrica que já recebe o array completo `Rubrica[]` como prop — `handleRubrica()` já fazia `rubricas.find(...)`, então o objeto completo (incluindo `modo_valor` e `formula`) **já estava disponível no cliente antes desta ação**, sem precisar de nenhum fetch novo. `referencia` e `valor` eram (e continuam sendo) campos de texto digitados manualmente.
- **PASSO 2 — o que foi implementado:**
  - `packages/ui/src/pages/folha/LancamentosEditor.tsx`: `LancamentoFormModal` passou a receber `funcionario: Funcionario | null` e `folha: FolhaCompetencia` como novas props (o pai já tinha ambos disponíveis). Adicionado botão "ƒ" ao lado do campo Valor, visível quando `rubricaSelecionada?.modo_valor === 'formula' && rubricaSelecionada.formula` — mesmo caractere "ƒ" já usado em `RubricasPage.tsx` ("ƒ Variáveis de Fórmula"), para consistência visual.
  - `resolverContextoFormula(funcionario, folha)`: função nova que monta o `ctx: Record<string,number>` das 15 variáveis:
    - `SALARIO`/`CARGA_HORARIA`/`VALE_REFEICAO`/`PLANO_SAUDE`: direto do objeto `Funcionario` já em memória (prop `funcionarios`, sem IPC novo).
    - `SALARIO_HORA`/`DIAS_MES`/`SALARIO_DIA`/`DIAS_UTEIS`: computados no cliente — `DIAS_UTEIS` via `contarDiasUteis` (de `@sudo-sys/domain`, `ACAO-0018`); `DIAS_MES` via uma função local de uma linha (`calcularDiasMes`, mesma fórmula de `diasDoMes()` em `CalculoFolha.ts`, mas o `app-host` não é importável no renderer — replicar essa linha específica foi mais simples que criar infraestrutura de compartilhamento só para isso).
    - `HORAS_TRABALHADAS`/`HORAS_EXTRAS_50`/`HORAS_EXTRAS_100`/`HORAS_FALTA`: via `window.electronAPI.espelhoPonto(empresaId, funcionarioId, mes, ano)` — canal IPC que **já existia**, nenhum novo.
    - `BASE_INSS`/`BASE_IRRF`/`BASE_FGTS`: via `window.electronAPI.getHolerite(folhaId, funcionarioId)` — também **já existia**. Ver decisão de fallback abaixo.
  - Fluxo do clique: `FormulaValidator().validate(formula)` primeiro — se inválida, mostra `formulaError` sem tentar avaliar; senão resolve o contexto (`resolverContextoFormula`, assíncrono, com estado `calculandoFormula` desabilitando o botão) e roda `FormulaEvaluator().evaluate(formula, ctx)`, preenchendo `form.valor` com `resultado.toFixed(2)` em caso de sucesso, ou mostrando a mensagem de `FormulaEvaluationError` em caso de falha (variável ausente, divisão por zero). O campo continua um `<input>` normal — nada foi desabilitado ou travado.
  - `packages/ui/package.json`: adicionada dependência `@sudo-sys/domain` (nova — a UI nunca tinha consumido esse pacote).
- **Decisões de fallback tomadas (Passo 4 do pedido — nenhuma exigiu parar e perguntar, mas todas registradas como pedido):**
  - `HORAS_*` sem nenhum ponto registrado: `ponto:espelho` já retorna totais zerados quando não há `registros_ponto` (confirmado lendo `SqlitePontoRepository.espelho()` — usa `reduce` com acumulador inicial zero sobre array vazio, não lança erro). **0 é o valor real** ("não bateu ponto ainda"), não uma aproximação — não havia decisão de produto real aqui.
  - `BASE_INSS`/`BASE_IRRF`: lidos de `folha_holerites` via `getHolerite`, se a folha já tiver sido calculada ao menos uma vez para aquele funcionário; se não, **fallback 0** — não há base ainda, é o estado real do sistema antes do primeiro `folha:calcular`. Sem ambiguidade de produto: é literalmente "ainda não foi calculado".
  - `BASE_FGTS`: **achado do Passo 2** — `folha_holerites` não tem coluna própria de base de FGTS (só `valor_fgts`, o valor já calculado); diferente de `base_inss`/`base_irrf`, que são persistidas diretamente. Decidido **recuperar a base de forma matematicamente exata**: como `calcularFGTS(base) = base * 0.08` sempre (sem faixas/teto), a conta inversa `valor_fgts / 0.08` reproduz o valor original exatamente (a menos de um resíduo de centavos por causa do arredondamento já aplicado ao gravar `valor_fgts`, que é desprezível). Não tratei isso como "decisão de produto que exige parar" porque a derivação é uma inversão determinística de uma fórmula já existente no código, não uma escolha arbitrária — mas está reportada aqui explicitamente para o usuário poder rever se discordar.
  - `CARGA_HORARIA = 0` (edge case defensivo, não uma decisão de produto): `SALARIO_HORA` usa `cargaHoraria > 0 ? salario / cargaHoraria : 0`, evitando `Infinity` entrar no contexto por um cadastro de funcionário incomum.
- **Achado técnico não trivial (bloqueou a integração até ser resolvido):** `@sudo-sys/domain` era publicado como **CommonJS** (decisão `DEC-0004`, pensada para o processo principal Electron). Ao importar `FormulaEvaluator`/`FormulaValidator`/`contarDiasUteis` no `packages/ui` (bundled via Vite/Rollup), o build falhava com `"X is not exported by dist/index.js"` para **todos** os nomes importados — não um problema específico de `contarDiasUteis`, confirmado isolando um nome por vez. Diagnosticado: o CJS interop do Rollup não conseguia enxergar através da cadeia de `export * from` (`__exportStar` em tempo de execução) usada nos barrels (`formula/index.ts` → `index.ts`), mesmo com o shape de exports **comprovadamente correto** em runtime (`require('@sudo-sys/domain')` de dentro de `packages/ui` listava `contarDiasUteis` normalmente). Como `@sudo-sys/domain` nunca teve nenhum consumidor real em CommonJS (`app-host` nunca o importa — confirmado por `grep`), a decisão original da `DEC-0004` não se aplicava na prática para este pacote. Resolvido migrando `packages/domain` para o mesmo padrão **ESM** já usado e comprovadamente funcional em `@sudo-sys/shared` (`"type": "module"`, condição `"import"` no `exports`, removido o override `module: CommonJS`/`moduleResolution: node` do `tsconfig.json` do pacote, voltando a herdar `ESNext`/`bundler` do `tsconfig.base.json`) — e trocando os barrels de `export *` para reexportações nomeadas explícitas (mais robusto para bundlers em geral, não só uma correção pontual). `packages/application`, único outro lugar que referencia `@sudo-sys/domain` (só `import type`, código morto), não foi afetado — tipos não dependem do formato de módulo de saída.
- **Validações executadas:**
  - `pnpm typecheck` (todos os 7 workspaces): passou limpo após a migração de `domain` para ESM.
  - `pnpm test` (raiz): **36/36 testes passaram** (25 do motor de fórmulas + 11 de folha/IRRF), sem nenhum ajuste necessário.
  - `pnpm build` (raiz, incluindo `app-host`): passou limpo — confirma que `app-host` (que não usa `domain`, só `type import` morto em `application`) continua buildando normalmente após a mudança de formato de módulo.
  - **Teste via UI real (Passo 3, Electron real + CDP)**: banco de dev resetado; setup wizard concluído via IPC; criada empresa (`EMP01`), funcionário real (`Joao da Silva`, `salario_base: 3000`, `carga_horaria` padrão 220), rubrica `0900` com `modo_valor: 'formula'` e `formula: 'SALARIO * 0.05'`, e uma folha aberta (competência `2026-02`, ainda não calculada). Navegado pela UI real até "Folha de Pagamento" → selecionada a folha → selecionado o funcionário → "+ Lançamento" → selecionada a rubrica `0900` (botão "ƒ" apareceu, texto "Fórmula da rubrica: SALARIO \* 0.05" visível) → clicado "ƒ" → campo Valor preenchido com **150.00** (= 3000 × 0.05, exatamente o esperado) → clicado "Adicionar" → lançamento persistido e visível na grade (`0900 | Bonus Formula Teste | provento | 0 | 150,00 | manual`). **Caminho de erro**: criada uma segunda rubrica `0901` com fórmula inválida (`"SALARIO * (0.05"`, parêntese não fechado); ao clicar "ƒ", mensagem clara exibida — `"Fórmula inválida: Parêntese não fechado (encontrado "fim da fórmula" na posição 15)."` — sem crash, sem preencher o campo.
- **PASSO 4 — nenhuma variável exigiu parar e reportar antes de decidir:** todos os casos levantados (HORAS_* sem ponto, BASE_INSS/IRRF sem cálculo prévio, BASE_FGTS sem coluna própria) tiveram fallback/derivação defensável e sem ambiguidade real de produto — documentados no código e nesta entrada, não decididos silenciosamente sem registro.
- **Por que foi feito:**
  - Completar a integração do motor de fórmulas construído na `ACAO-0018`, por pedido explícito do usuário, com preenchimento assistido (não automático/obrigatório) do campo de valor — decisão já tomada pelo usuário de ser sob demanda, não em tempo real, para não gastar processamento a cada edição de fórmula.
- **Arquivos envolvidos:**
  - `packages/ui/src/pages/folha/LancamentosEditor.tsx`
  - `packages/ui/package.json`
  - `packages/domain/package.json`
  - `packages/domain/tsconfig.json`
  - `packages/domain/src/index.ts`
  - `packages/domain/src/formula/index.ts`
- **Riscos ou observações:**
  - O botão "ƒ" só recalcula quando clicado — se o funcionário/competência/ponto mudar depois de o valor já ter sido preenchido (e antes de salvar), o usuário precisa clicar de novo; isso é o comportamento pedido (sob demanda), não um bug.
  - `BASE_FGTS` derivada por divisão (`valor_fgts / 0.08`) deixa de ser exata se `calcularFGTS` algum dia ganhar faixas/teto/lógica não-linear — quem alterar `calcularFGTS` no futuro precisa lembrar de rever essa derivação também (não há teste automatizado ligando os dois pontos, por estarem em pacotes diferentes — `infrastructure` vs `domain`/`ui`).
  - A migração de `domain` para ESM não foi validada num pacote consumidor CommonJS de verdade (porque não existe nenhum) — se algum dia `app-host` precisar importar `domain` diretamente (não apenas `application`'s `import type` morto), isso pode exigir ajuste, já que `app-host` compila para CommonJS. Registrado para não ser surpresa futura.
  - Nenhum teste automatizado novo cobre `resolverContextoFormula` ou o botão "ƒ" em si (é código de UI, o projeto não tem framework de teste de componentes/E2E configurado) — a validação desta ação foi toda manual via CDP, não repetível automaticamente numa suíte.
- **Recomendações deixadas para próximos agentes:**
  - Nenhuma nova recomendação formal.
- **Próxima ação sugerida:**
  - Retomar a priorização das recomendações pendentes já listadas em `CONTEXTO_TOTAL.md`, conforme decisão do usuário.

### ACAO-0020 — 2026-09-11 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Correção de build / Assets / Empacotamento Electron
- **Status:** Parcial
- **Resumo:**
  - A `REC-0009` foi executada quanto à inclusão do CSV completo de CBO, exclusão de fontes TypeScript, geração do pacote e instalador NSIS e smoke test isolado.
  - O ícone oficial e a execução real do instalador permanecem pendentes por ausência de asset válido e risco de alterar o ambiente instalado do usuário.
- **O que foi encontrado:**
  - O único CSV completo está em `app-host/src/data/cbo_lista.csv`, com 99.372 bytes.
  - A migration `023_cbo_completo` procura o arquivo em `dist/main/data/cbo_lista.csv` no runtime compilado.
  - Não existe `.ico`, `.icns`, PNG ou SVG de aplicação no repositório; o caminho configurado `app-host/build/icon.ico` não existe e o `electron-builder` usa o ícone padrão do Electron.
  - O ASAR anterior continha 147 arquivos TypeScript dos workspaces e mais 14 arquivos TypeScript de dependências de PostgreSQL.
  - O coletor de dependências locais do `electron-builder` avalia os workspaces a partir da raiz do repositório; por isso, o padrão eficaz usa `packages/<workspace>/src`.
- **O que foi mudado:**
  - `app-host/package.json`: adicionado um `FileSet` que copia `src/data/cbo_lista.csv` para `dist/main/data/cbo_lista.csv` no pacote.
  - `app-host/package.json`: adicionadas exclusões para os diretórios `src` dos quatro workspaces e para todos os arquivos `.ts`/`.tsx` do ASAR.
  - `README_AMBIENTE.md`: documentado o fluxo, as evidências e as limitações restantes.
  - `CONTEXTO_TOTAL.md`: atualizado o build atual, a última ação, o status da `REC-0009` e o próximo passo.
  - `HISTORICO_AGENTES.md`: registrada esta ação e atualizado o status da `REC-0009`.
  - Nenhum arquivo TypeScript, regra de negócio, cálculo, autenticação, autorização, dependência ou lockfile foi alterado.
- **Validações executadas:**
  - `pnpm install --frozen-lockfile`: passou em 3,3 s com pnpm 9.15.9.
  - `pnpm typecheck`: passou em todos os workspaces.
  - `pnpm build`: passou; o Vite processou 1.646 módulos e o `app-host` compilou normalmente.
  - Pacote Electron em diretório: gerado com sucesso em saída isolada.
  - Instalador NSIS: gerado com sucesso, com 84.843.224 bytes e SHA-256 `CE00DE9F17830B573F383C4158EFFC2318BE10F8EB8C1BE7EBA64C3EDA81884E`.
  - Inspeção do ASAR final: zero `.ts`/`.tsx`, zero diretórios `src` dos workspaces e zero imports JavaScript para `@sudo-sys/*/src`.
  - CSV no ASAR: presente em `dist/main/data/cbo_lista.csv`, com 99.372 bytes e SHA-256 idêntico à origem.
  - Smoke test: o executável abriu `#/setup` sem `MODULE_NOT_FOUND`, erro de preload, ABI ou CSV ausente.
  - Banco temporário do smoke test: tabela `cbo` criada com 2.495 registros.
  - O `userData` temporário foi removido e os quatro processos do pacote foram encerrados; nenhum processo permaneceu ativo.
  - O banco real em `%APPDATA%\Electron\banco` e seus arquivos WAL/SHM mantiveram os metadados previamente registrados.
- **O que foi melhorado:**
  - A migration de CBO passa a encontrar o arquivo completo no pacote final.
  - O ASAR deixa de distribuir fontes TypeScript cruas e conteúdo interno dos diretórios `src` dos workspaces.
  - A geração do instalador Windows foi comprovada e o payload executável passou em smoke test com dados isolados.
- **Por que foi feito:**
  - Para encerrar os riscos de asset ausente e fontes cruas identificados após a correção dos imports públicos, sem alterar comportamento funcional.
- **Arquivos envolvidos:**
  - `app-host/package.json`
  - `app-host/src/data/cbo_lista.csv` — analisado, não alterado.
  - `app-host/src/db/migrations/023_cbo_completo.ts` — analisado, não alterado.
  - `README_AMBIENTE.md`
  - `CONTEXTO_TOTAL.md`
  - `HISTORICO_AGENTES.md`
- **Riscos ou observações:**
  - O instalador e os executáveis estão sem assinatura (`NotSigned`).
  - O instalador não foi executado para evitar alterar atalhos, registro ou uma instalação existente; instalação e desinstalação reais permanecem **A confirmar**.
  - Um ícone oficial continua ausente. Nenhum asset foi inventado ou gerado nesta ação.
  - A saída padrão pode continuar bloqueada por um `app.asar` antigo nesta máquina; as validações usaram diretórios isolados.
  - Linux, macOS, assinatura Windows e notarização macOS permanecem **A confirmar**.
- **Recomendações deixadas para próximos agentes:**
  - `REC-0009` permanece parcial: fornecer um asset oficial e validar instalação/desinstalação do NSIS em uma máquina virtual ou ambiente Windows descartável.
  - Executar a `REC-0002` em ação separada, mediante autorização, por ser o próximo risco crítico bem delimitado.
- **Próxima ação sugerida:**
  - Executar somente a `REC-0002`, após autorização específica, sem misturar RBAC ou outras recomendações.
- **Nota de reconciliação:**
  - Esta ação foi registrada originalmente como `ACAO-0014` no histórico local e renumerada para `ACAO-0020` durante a reconciliação da `ACAO-0021`, evitando colisão com a `ACAO-0014` remota sem apagar nenhum histórico válido.

### ACAO-0021 — 2026-09-14 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Reconciliação Git / Documentação / Merge
- **Status:** Concluído
- **Resumo:**
  - Reconciliada a divergência entre o ambiente local e `origin/main`: havia 1 commit local e 10 commits remotos.
  - O merge apresentava conflitos documentais em `CONTEXTO_TOTAL.md` e `HISTORICO_AGENTES.md`, além de colisão do ID `ACAO-0014`.
  - As ações remotas `ACAO-0014` a `ACAO-0019` foram preservadas integralmente; a ação local de empacotamento Electron/`REC-0009`, originalmente `ACAO-0014`, foi preservada e renumerada para `ACAO-0020`.
  - O histórico dos dois lados, as decisões técnicas vigentes e as pendências marcadas como **A confirmar** foram preservados.
  - Nenhuma nova REC foi iniciada nesta reconciliação.
- **O que foi mudado:**
  - `HISTORICO_AGENTES.md`: conflitos resolvidos, colisão de ID eliminada e esta ação registrada.
  - `CONTEXTO_TOTAL.md`: estado reconciliado, última ação e referências da `REC-0009` atualizados.
  - `README_AMBIENTE.md`: referências do empacotamento atualizadas para `ACAO-0020`; existência de `pnpm test` e publicação ESM de `@sudo-sys/domain` refletidas conforme os manifests recebidos do remoto.
  - Nenhuma regra de negócio, cálculo trabalhista, autenticação, autorização, RBAC, relatório ou dependência foi alterada nesta reconciliação.
- **Riscos ou observações:**
  - `REC-0009` permanece **Parcial**; ícone oficial, assinatura e instalação/desinstalação controladas continuam pendentes ou **A confirmar**.
  - A reconciliação não alterou prioridades nem escolheu qual REC pendente deve ser executada em seguida.
- **Próxima ação sugerida:**
  - Revisar o merge commit reconciliado e, somente após aprovação, decidir separadamente qual recomendação pendente priorizar.

### ACAO-0022 — 2026-09-14 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Melhoria UI/UX
- **Status:** Concluído
- **Resumo:**
  - Melhorado o primeiro contato com o Dashboard para orientar o usuário a selecionar uma empresa e acessar as áreas mais usadas com menos ambiguidade.
  - Removidos os quatro indicadores sem dados reais e a tabela de atividade recente com registros fictícios; o Dashboard agora comunica explicitamente quando uma informação ainda não possui integração.
- **O que foi melhorado:**
  - Cabeçalho com hierarquia mais clara, saudação, descrição objetiva e destaque separado para a competência atual.
  - Bloco de contexto mostra a empresa ativa ou orienta o primeiro passo, com ação clara para selecionar ou trocar empresa.
  - Criados atalhos para Empresas, Funcionários, Folha mensal e Documentos usando somente rotas já existentes.
  - Atalhos que dependem de empresa ficam desabilitados quando não há empresa ativa e explicam o que o usuário precisa fazer primeiro.
  - A seção de atividade recente passou a usar um estado vazio honesto, em vez de apresentar datas, usuários e operações de demonstração como se fossem dados reais.
- **Arquivos alterados:**
  - `packages/ui/src/pages/dashboard/DashboardPage.tsx`
  - `HISTORICO_AGENTES.md`
- **Por que foi feito:**
  - O Dashboard é a primeira tela após o login e tinha alto impacto visual, mas não oferecia uma ação principal clara e misturava placeholders com conteúdo fictício. A mudança melhora orientação, legibilidade e confiança sem tocar em regras funcionais.
- **Riscos ou observações:**
  - Risco baixo: a alteração é restrita à apresentação e à navegação para rotas existentes; não adiciona consulta, persistência, regra de negócio, cálculo, autenticação, autorização ou dependência.
  - O Dashboard continua sem indicadores ou histórico integrados a dados reais. Isso agora está explícito para o usuário, sem inventar informação.
  - `CONTEXTO_TOTAL.md` não foi alterado porque a fase e o estado técnico geral do projeto não mudaram.
- **Validações executadas:**
  - `pnpm install --frozen-lockfile`: passou; o lockfile já estava atualizado e nenhuma dependência foi alterada. A primeira invocação foi bloqueada pelo ambiente (`EPERM` ao consultar o diretório pai); a repetição em sessão Windows interativa passou normalmente.
  - `pnpm typecheck`: passou em todos os workspaces.
  - `pnpm test`: 36/36 testes passaram (25 em `domain` e 11 em `infrastructure`).
  - `pnpm build`: passou; Vite processou 1.673 módulos e o `app-host` compilou normalmente.
  - `pnpm dev`: Vite, preload, rebuild de `better-sqlite3`, Electron e SQLite isolado iniciaram sem erro funcional; permaneceram apenas os avisos conhecidos de Autofill do DevTools.
  - Validação visual isolada do Dashboard via CDP em viewport de aproximadamente 1267 × 740: conteúdo renderizado sem overflow, ações disponíveis e desabilitadas coerentes com a ausência de empresa e estado vazio legível.
  - `git diff --check`: passou após o registro final, sem erros de whitespace.
- **Próxima recomendação:**
  - Em uma próxima rodada pequena de UI/UX, revisar o shell de navegação para diferenciar melhor comandos disponíveis de comandos ainda sem ação e reduzir a sensação de controles inativos, sem alterar RBAC ou regras dos módulos.
  - Nenhuma nova REC foi criada nesta ação.

### ACAO-0023 — 2026-09-14 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Melhoria UI/UX
- **Status:** Concluído
- **Área melhorada:**
  - Shell principal de navegação, especificamente o menu lateral e a faixa superior de comandos.
- **Arquivos alterados:**
  - `packages/ui/src/components/layout/Sidebar.tsx`
  - `packages/ui/src/components/layout/RibbonBar.tsx`
  - `HISTORICO_AGENTES.md`
- **O que mudou visualmente:**
  - O menu lateral passou a identificar sete áreas que dependem de empresa: Funcionários, Folha de Pagamento, Férias, Rescisão, Ponto, QuickCalc e Documentos.
  - Sem empresa ativa, esses itens ficam atenuados, recebem marcador e tooltip explicativo, e o topo do menu mostra a orientação “Selecione uma empresa para usar os itens marcados”. As rotas continuam clicáveis e preservam seus estados vazios existentes.
  - Com empresa ativa, a orientação e o estado de espera desaparecem, sem mudar o destino ou o comportamento das rotas.
  - A faixa “Cadastros” passou a refletir as ações realmente registradas pela página atual. Novo, Editar, Excluir e Atualizar deixam de parecer ativos quando não se aplicam à tela.
  - Comandos ainda sem implementação são desabilitados e identificados como “Em breve”; ações conhecidas, mas não disponíveis na tela atual, aparecem como “Nesta tela” e têm tooltip “indisponível nesta tela”.
- **Por que foi feito:**
  - O shell apresentava comandos sem ação com aparência interativa e não diferenciava módulos que precisam de contexto de empresa. A mudança reduz cliques sem resultado e explica pré-requisitos sem criar bloqueios ou prometer funções inexistentes.
- **Riscos ou observações:**
  - Risco baixo: a alteração é restrita a apresentação, acessibilidade e ligação da faixa ao store de ações já existente.
  - Nenhuma rota foi removida ou bloqueada; nenhum guard, papel, permissão, autenticação, autorização ou RBAC foi alterado.
  - Relatórios não foi marcado como dependente porque a configuração de modelos continua acessível sem empresa; apenas a execução já exige empresa na própria página.
  - `CONTEXTO_TOTAL.md` não foi alterado porque a fase e o estado técnico geral do projeto não mudaram.
- **Validações executadas:**
  - `pnpm install --frozen-lockfile`: passou; lockfile já atualizado e nenhuma dependência alterada.
  - `pnpm typecheck`: passou em todos os workspaces.
  - `pnpm test`: 36/36 testes passaram (25 em `domain` e 11 em `infrastructure`).
  - `pnpm build`: passou; Vite processou 1.673 módulos e o `app-host` compilou normalmente.
  - `pnpm dev`: Vite, preload, rebuild de `better-sqlite3`, Electron e SQLite isolado iniciaram sem erro funcional; permaneceram apenas os avisos conhecidos de Autofill do DevTools.
  - Validação visual isolada do shell no renderer, em viewport de 1267 × 740: sete itens ficaram em espera sem empresa e zero após simular uma empresa somente no store; a orientação acompanhou o estado e não houve overflow horizontal ou vertical.
  - O binário local de `better-sqlite3` foi restaurado para o ABI do Node após a validação Electron, sem alterar arquivo versionado, e a suíte final passou.
  - `git diff --check`, busca por marcadores de conflito e `git status -sb` foram executados antes do commit.
- **Próxima melhoria recomendada:**
  - Em uma rodada pequena separada, revisar a barra de menus e a toolbar secundária do `AppShell` para deixar explícitos ou remover visualmente controles sem ação, preservando os comandos reais registrados por cada página.
  - Nenhuma nova REC foi criada nesta ação.

### ACAO-0024 — 2026-09-14 — Claude (Sonnet 5)

- **Autor da ação:** Claude
- **Tipo de ação:** Diagnóstico e validação de build (REC-0009)
- **Status:** Parcialmente executado
- **Resumo:**
  - Diagnóstico dos 3 achados de `REC-0009` (CSV de CBO, ícone do instalador, fontes `.ts` no ASAR), seguido de build real do instalador Windows (NSIS) e inspeção do `app.asar` gerado para confirmar cada item na prática, não só na configuração.
- **Achados:**
  - CSV de CBO: já corrigido em ação anterior (`ACAO-0020`) — `app-host/package.json` (`build.files`) já empacota `src/data/cbo_lista.csv` em `dist/main/data`, path que `023_cbo_completo.ts` espera em runtime. Confirmado presente no `app.asar` real (`asar list`).
  - Fontes `.ts` no ASAR: já corrigido em ação anterior (`ACAO-0020`) — `build.files` já exclui `packages/*/src` e `**/*.{ts,tsx}`. Confirmado 0 arquivos `.ts`/`.tsx` no `app.asar` real (2047 entradas inspecionadas).
  - Ícone do instalador: **ainda pendente**. `build.win.icon` aponta para `build/icon.ico`, mas esse arquivo não existe no repositório. O build confirmou via log do electron-builder: `default Electron icon is used — reason=application icon is not set`. Não é erro de configuração, é asset ausente.
- **O que foi feito:**
  - `pnpm run build` (tsc) em `app-host` e `pnpm --filter @sudo-sys/app-host dist` (electron-builder, NSIS, win-x64) — build real executado do zero.
  - `asar list` no `app.asar` gerado (`dist/electron/win-unpacked/resources/app.asar`) para confirmar CSV presente e ausência de `.ts`.
  - Nenhum código, config ou asset foi alterado — os dois achados de CSV/ASAR já estavam corretos, só faltava confirmação prática.
- **Por que foi feito:**
  - `REC-0009` (Alta) pedia diagnóstico antes de correção, e correção mecânica só do que fosse puramente mecânico. Dois dos três itens já estavam corrigidos por ação anterior; o terceiro exige um asset visual que não existe no repo — decisão de produto explicitamente fora do meu escopo (instrução de não inventar/gerar ícone placeholder).
- **Arquivos envolvidos:**
  - Nenhum arquivo de código ou configuração foi alterado.
  - `dist/electron/` (novo, não versionado, saída de build local): `win-unpacked/`, `SudoSys Setup 1.0.0.exe`, blockmap.
  - `HISTORICO_AGENTES.md`, `CONTEXTO_TOTAL.md`.
- **Riscos ou observações:**
  - O instalador gerado nesta validação não é assinado (`NotSigned`) e não foi executado/instalado, para evitar alterar atalhos, registro ou instalação existente.
  - O instalador continua saindo com o ícone genérico do Electron até que um `.ico` oficial seja fornecido em `app-host/build/icon.ico`.
  - Diretórios de builds anteriores (`dist/electron-rec0009*`) não foram tocados nem removidos.
- **Próxima ação sugerida:**
  - `REC-0009` permanece parcial: fornecer um `.ico` oficial em `app-host/build/icon.ico` (decisão visual do Jeremias) e, só depois, validar instalação/desinstalação do NSIS numa VM ou ambiente Windows descartável.

### ACAO-0025 — 2026-09-14 — Codex

- **Autor da ação:** Codex
- **Tipo de ação:** Melhoria UI/UX / Recuperação de sessão interrompida
- **Status:** Concluído
- **Resumo:**
  - Recuperada e revisada a melhoria iniciada antes do fechamento inesperado do terminal, sem descartar ou refazer o trabalho existente.
  - A barra de menus e a toolbar secundária do `AppShell` agora distinguem controles reais de elementos ainda sem implementação, concluindo a melhoria recomendada ao final da `ACAO-0023` sem iniciar nova REC.
- **O que foi encontrado na retomada:**
  - `packages/ui/src/app/AppShell.tsx` já continha uma alteração coerente e completa para o escopo: menus e dropdowns sem ação estavam desabilitados e identificados como “Em breve”; Novo, Excluir, Editar e Atualizar continuavam ligados ao store de ações da página e eram desabilitados somente na ausência do callback correspondente.
  - `HISTORICO_AGENTES.md` não tinha uma entrada para a melhoria atual e continha apenas duas remoções acidentais de indentação dentro da `ACAO-0014`; essas alterações não descreviam o trabalho e quebravam a hierarquia Markdown daquela entrada antiga.
  - O próximo ID disponível era `ACAO-0025`; nenhuma nova recomendação foi criada ou iniciada.
- **O que foi mudado:**
  - `packages/ui/src/app/AppShell.tsx`: removido o hover que fazia a barra de menus parecer funcional; os seis menus foram desabilitados, atenuados e receberam identificação “Em breve”.
  - `packages/ui/src/app/AppShell.tsx`: Anexos, Processos e Filtro deixaram de parecer dropdowns ativos e passaram a indicar explicitamente que ainda não estão disponíveis.
  - `packages/ui/src/app/AppShell.tsx`: botões reais da toolbar secundária passaram a usar o estado nativo `disabled` quando a página não registra a ação, mantendo clique e destaque visual somente quando existe callback.
  - `HISTORICO_AGENTES.md`: restaurada a indentação original das duas linhas da `ACAO-0014` e adicionada esta entrada de recuperação e conclusão.
  - `CONTEXTO_TOTAL.md` e `README_AMBIENTE.md` não foram alterados porque a fase, as recomendações e o ambiente do projeto não mudaram.
- **Validações executadas:**
  - `pnpm install --frozen-lockfile`: passou com lockfile já atualizado e sem alteração de dependências.
  - `pnpm typecheck`: passou em todos os workspaces.
  - `pnpm test`: 36/36 testes passaram (25 em `domain` e 11 em `infrastructure`). A primeira execução encontrou `better-sqlite3` preparado para o ABI 128 do Electron; o binário foi restaurado para o ABI 115 do Node pelo procedimento já documentado na `ACAO-0016`, e a suíte completa passou na repetição.
  - `pnpm build`: passou; Vite processou 1.673 módulos e o `app-host` compilou normalmente.
  - `pnpm dev`: Vite, preload, rebuild de `better-sqlite3`, Electron e SQLite isolado iniciaram sem erro funcional; permaneceram apenas os avisos conhecidos de Autofill do DevTools. O perfil isolado estava em `#/setup`, e nenhum dado foi gravado apenas para forçar a abertura do `AppShell`.
  - Após encerrar o Electron, o binário local de `better-sqlite3` foi restaurado para o ABI do Node, sem alterar arquivo versionado.
  - `git diff --check`: executado após o registro final, sem erros de whitespace.
- **Riscos ou observações:**
  - Risco baixo: a mudança é exclusivamente visual e de estado dos controles; não altera rotas, regras de negócio, cálculos, autenticação, autorização, RBAC, banco, dependências ou contratos IPC.
  - Os comandos reais registrados por cada página foram preservados. Menus, Anexos, Processos e Filtro continuam sem implementação funcional, mas agora isso está explícito e não induz o usuário a esperar resposta ao clique.
- **Próxima ação sugerida:**
  - Nenhuma nova tarefa ou REC foi iniciada nesta ação; a priorização futura continua dependente de decisão do usuário.

### ACAO-0026 — 2026-09-14 — Claude (Sonnet 5)

- **Autor da ação:** Claude
- **Tipo de ação:** Correção de script de teste manual (REC-0012)
- **Status:** Concluído
- **Resumo:**
  - `scripts/test-holerite.ps1` chamava `window.electronAPI.folhaGerarPdf`, API que não existe mais no `preload.ts` atual. Corrigido para usar a API real (`gerarHolerite`) e validado gerando um PDF de verdade contra o banco de dev real.
- **O que foi encontrado:**
  - `folhaGerarPdf` não existe em `app-host/src/preload.ts`. A API real equivalente é `gerarHolerite(payload: { folhaId: number; funcionarioId?: number })` → canal `folha:gerar-holerite` (`preload.ts:271-272`).
  - O handler real (`folhaHandlers.ts:219-306`) não aceita mais rubricas/totais/bases no payload — ele lê o holerite já calculado no banco (`SqliteFolhaRepository.getHolerite`) a partir de `folhaId`/`funcionarioId`. O payload hardcoded do script antigo (rubricas, totais, bases) não tem mais correspondência na API atual.
  - `folha:calcular` (`folhaHandlers.ts:87-123`) só gera holerite para funcionários que já têm ao menos 1 lançamento não-automático na folha (`if (lancamentos.length === 0) continue`) — um funcionário sem nenhum lançamento manual é ignorado silenciosamente, sem erro.
  - Todo canal fora de `CANAIS_PUBLICOS` (`authGuard.ts`) exige sessão real vinculada ao `WebContents` — o script precisa logar antes de chamar `gerarHolerite`, o que a versão antiga não fazia (provavelmente dependia de um login manual prévio feito por um humano na mesma janela).
  - O perfil de dev real (`.dev-user-data`) nunca tinha passado pelo Setup Wizard (`config.json` inexistente), embora o banco (`sudosys.db`) já tivesse dado real de sessões anteriores (empresa id=1). Achado à parte, não é regressão desta REC.
  - `authHandlers.ts:25-34` reseta a senha do admin seed para `admin123` a cada início do processo principal (condição `currentHash.startsWith('$argon2id$')` é sempre verdadeira para qualquer hash argon2 válido, incluindo um já trocado) — comportamento pré-existente, fora do escopo da REC-0012, não alterado nesta ação, só documentado porque foi o que permitiu login real nesta validação.
  - `scripts/seed-test.ps1`, citado como possível mesmo tipo de problema (Passo 5 pedido pelo usuário): **não existe em nenhum lugar do repositório** (busca completa, fora de `node_modules`). Não há nada para corrigir ou reportar sob esse nome.
- **O que foi mudado:**
  - `scripts/test-holerite.ps1`: reescrito mantendo a mesma estrutura (CDP sobre WebSocket, `Cdp-Eval`, `Report`) e o mesmo propósito (gerar 1 holerite de teste via automação, fora da UI). Etapa 1 verifica `typeof electronAPI.gerarHolerite`; Etapa 2 descobre empresa/folha/funcionário reais via `listEmpresas`/`listFolhas`/`listFuncionarios` (sem payload hardcoded); Etapa 3 chama `calcularFolha` (idempotente, `REC-0004`); Etapa 4 chama `gerarHolerite({folhaId, funcionarioId})` e valida que `data.filePath` termina em `.pdf`.
- **Por que foi feito:**
  - `REC-0012` (Baixa prioridade, script de teste manual não afeta runtime) — corrigir o nome de API desatualizado, mantendo o script utilizável para validação manual futura de geração de holerite.
- **Validações executadas:**
  - Leitura direta de `preload.ts` e `folhaHandlers.ts` para confirmar a API real (não presumido por nome).
  - `pnpm dev` real (Vite + Electron, `--user-data-dir=../.dev-user-data`, `--remote-debugging-port=9222`) iniciado para teste ponta a ponta contra o banco de dev real.
  - Sessão real via `electronAPI.login({email:'admin@sudosys.local', senha:'admin123'})` — sucesso confirmado (a senha citada acima é resetada a cada start do processo, não foi adivinhada).
  - Ambiente de dev real não tinha nenhum funcionário com lançamento apto a gerar holerite; criei dados mínimos de teste via IPC real, com autorização explícita do usuário: empresa "Empresa Teste REC-0012" (id=2), funcionário "Funcionario Teste REC-0012" (id=2), folha competência 2026-09 (id=2), 1 lançamento manual de Salário Base (rubrica `0001`, R$3500,00). Esses registros permanecem no banco de dev real (`​.dev-user-data/banco/sudosys.db`) — não foram removidos.
  - `scripts/test-holerite.ps1` corrigido executado de verdade (via PowerShell, não simulado): as 4 etapas retornaram `[OK]`, incluindo a geração do PDF.
  - PDF gerado confirmado em disco: `C:\Users\holdi\Downloads\holerite_2026-09_Funcionario_Teste_REC_0012_1789406720370.pdf`, 4198 bytes, `file` confirma `PDF document, version 1.3, 1 page(s)`. Arquivo permanece em Downloads.
  - `pnpm --filter @sudo-sys/infrastructure test` e `pnpm --filter @sudo-sys/domain test`: 36/36 passaram (verificado antes e depois desta ação; a suíte de infraestrutura só passa com `better-sqlite3` no ABI do Node — precisou ser restaurado do ABI do Electron usado pelo `pnpm dev`, mesma rotina já documentada na `ACAO-0016`/`ACAO-0023`/`ACAO-0025`).
  - Processos `pnpm dev`/Vite/Electron abertos para o teste foram encerrados ao final (verificado via `Get-CimInstance Win32_Process`, nenhum processo relacionado a `sudo-sys` permaneceu ativo).
- **Arquivos envolvidos:**
  - `scripts/test-holerite.ps1` (alterado).
  - `HISTORICO_AGENTES.md`, `CONTEXTO_TOTAL.md` (registro desta ação e status da `REC-0012`).
  - Nenhum arquivo de código de produção/runtime foi alterado.
- **Riscos ou observações:**
  - Dados de teste (empresa/funcionário/folha/lançamento/holerite id=2) permanecem no banco de dev real por decisão explícita do usuário durante a execução — não são dados fictícios inventados sem aviso, mas também não foram removidos ao final; se o próximo agente ou o usuário quiser um banco de dev "limpo", isso precisa de limpeza manual.
  - O achado sobre `authHandlers.ts:25-34` (reset de senha do admin a cada start) e sobre `.dev-user-data` nunca ter passado pelo Setup Wizard não foram corrigidos — são observações de ambiente fora do escopo da `REC-0012`, registradas aqui só para não se perderem. **Retificação (`ACAO-0027`): a descrição "reset a cada start" estava imprecisa — é um bootstrap de senha padrão que roda uma única vez (só enquanto o hash ainda é o placeholder da migration `035b`); depois disso o reset nunca mais dispara. Detalhe e evidência empírica na `ACAO-0027`.**
  - Risco de código é nulo: a única alteração de arquivo é um script de teste manual, não referenciado por `pnpm dev`, `pnpm build`, `pnpm test` ou pelo runtime da aplicação.
- **Próxima ação sugerida:**
  - `REC-0012` está concluída. Nenhuma nova REC foi criada.
  - Se desejado, limpar manualmente a empresa/funcionário/folha de teste (id=2) do banco de dev real e o PDF de teste em Downloads.

### ACAO-0027 — 2026-09-14 — Claude (Sonnet 5)

- **Autor da ação:** Claude
- **Tipo de ação:** Extensão/correção da `REC-0002` (enforcement de `must_change_password` no backend) + retificação de achado anterior
- **Status:** Concluído
- **Resumo:**
  - Diagnóstico anterior (mesma sessão, relatado ao usuário antes desta ação) encontrou que `must_change_password` só era respeitado pelo roteamento do frontend (`App.tsx`) — nenhum handler de IPC verificava o flag no backend, então uma chamada de IPC direta (fora da UI) contornava a troca de senha obrigatória. Corrigido no gate central (`authGuard.ts`), a única checagem de sessão que já existia no backend para todos os canais.
  - Esta ação também retifica um achado impreciso relatado antes, na mesma sessão: eu havia dito que `authHandlers.ts` "reseta a senha do admin para `admin123` a cada start do app". Isso está **errado** — é um bootstrap de senha padrão que roda uma única vez. Detalhe abaixo.
- **Retificação do achado anterior (reset a cada start):**
  - `authHandlers.ts:24-34` checa `currentHash.startsWith('$argon2id$')` antes de sobrescrever a senha do admin por `admin123`. Eu presumi que qualquer hash real bateria com esse prefixo — errado: o hasher real do projeto (`SimplePasswordHasher`, `packages/infrastructure/src/auth/Argon2PasswordHasher.ts`, apesar do nome do arquivo) gera hashes no formato `pbkdf2:<salt>:<hash>`, não argon2. O único valor que bate com `$argon2id$` é o placeholder literal gravado pela migration `035b_usuario_admin_seed`. Uma vez que o hash é trocado (por este próprio bootstrap ou por uma troca real via `auth:trocarSenha`), ele vira `pbkdf2:...` e a condição fica permanentemente falsa para aquele usuário — o bloco nunca mais mexe na senha dele.
  - Testei isso de forma real, não só lendo o código: recriei em memória a tabela `usuarios` com o seed exato da `035b`+`055` (placeholder + `must_change_password=1`) e rodei a lógica exata do bloco usando as classes reais compiladas (`SqliteUsuarioRepository`, `SimplePasswordHasher`) 3 vezes em sequência, com uma troca real de senha no meio. Resultado: start 1 (hash=placeholder) reseta para `pbkdf2(admin123)`; start 2 (hash já `pbkdf2`) não mexe; depois de uma troca real via `updateSenhaEClearMustChange`, start 3 também não mexe — a senha escolhida pelo usuário permanece válida e `admin123` deixa de funcionar. Confirmei também contra o banco de dev real (leitura direta, só-leitura): o hash do admin lá já é `pbkdf2:...`, ou seja, já passou do bootstrap único.
  - Conclusão: não anula a `REC-0002`. `must_change_password` não é zerado por este bloco (só `updateSenhaEClearMustChange`, chamado por uma troca real, zera). O achado real e válido, que esta ação corrige, é outro: a ausência de enforcement de `must_change_password` no backend (abaixo).
- **O que foi encontrado (achado real, sendo corrigido nesta ação):**
  - `must_change_password` é lido do backend só na resposta de `auth:login`/`auth:trocarSenha` (`Usuario.must_change_password: number`, `packages/shared/src/types/usuario.ts:7`) e usado só pelo `App.tsx` para decidir entre renderizar `LoginPage`, `TrocarSenhaPage` ou o app principal. Nenhum `ipcMain.handle` verificava esse flag antes de executar o canal.
  - O gate central já existente, `app-host/src/ipc/authGuard.ts` (introduzido no commit `0273154`, "Adiciona gate central de autenticação de IPC e RBAC básico no frontend", julho/2026), intercepta `ipcMain.handle` globalmente e já roda **no backend** — não no frontend, apesar do nome do commit sugerir RBAC "no frontend" (isso é só a parte de UX/rota; a proteção real, incluindo `CANAIS_PUBLICOS`/`CANAIS_ADMIN`, sempre esteve no processo principal). Era o lugar certo para adicionar a checagem, sem precisar tocar nos ~80 handlers individuais.
  - Bug adicional descoberto ao planejar a correção: `auth:trocarSenha` (`authHandlers.ts`) atualiza sua própria sessão em memória (`tokenMap`, indexado por token) mas nunca atualizava a sessão do `authGuard.ts` (`sessionsByWebContentsId`, indexada por `WebContents`) — são dois mecanismos de sessão paralelos e independentes. Se eu tivesse adicionado a checagem só no `authGuard.ts` sem corrigir isso, a troca de senha continuaria funcionando, mas o gate ficaria vendo `must_change_password=1` para sempre naquela sessão (dado obsoleto), bloqueando todo o resto mesmo depois de uma troca real bem-sucedida — quebraria o caminho feliz.
- **O que foi mudado:**
  - `app-host/src/ipc/authGuard.ts`: novo `Set` `CANAIS_PERMITIDOS_COM_TROCA_PENDENTE`, contendo só `'auth:trocarSenha'` — é o único canal que `TrocarSenhaPage.tsx` chama (confirmado lendo o componente; não há botão de logout nem outra chamada nessa tela). `auth:logout`/`auth:me`/`auth:login` não precisam entrar nessa lista porque já estão em `CANAIS_PUBLICOS` e nunca chegam a esta checagem (retornam antes, no topo de `installIpcAuthGuard`). Dentro do listener envolvido, logo após confirmar que existe sessão válida e antes da checagem de `CANAIS_ADMIN`: se `user.must_change_password === 1` e o canal não está na lista permitida, lança `'Troca de senha obrigatória pendente. Use a tela de troca de senha antes de continuar.'`.
  - `app-host/src/ipc/handlers/authHandlers.ts`: no handler `auth:trocarSenha`, o parâmetro do evento (antes `_e`, não usado) passou a se chamar `e` e, após `updateSenhaEClearMustChange` ter sucesso, chama `setSessionUser(e, updated)` — sincroniza a sessão do `authGuard.ts` com o usuário atualizado (`must_change_password=0`), evitando que o gate continue bloqueando depois de uma troca real.
- **Por que foi feito:**
  - Extensão da `REC-0002`: a troca de senha obrigatória só valia enquanto o usuário navegasse pela UI normal; qualquer chamada de IPC direta (renderer malicioso, DevTools, ou uma automação como as usadas nas sessões anteriores desta mesma conversa) contornava a obrigatoriedade por completo, sem nenhum bloqueio no backend — mesma classe de risco que a `REC-0002` original endereçou (credencial padrão conhecida usável sem fricção).
- **Validações executadas:**
  - `pnpm --filter @sudo-sys/app-host typecheck`: passou.
  - **Passo 3 (IPC direto via CDP, mesmo método das sessões anteriores):** logado como `admin@sudosys.local`/`admin123` real (`must_change_password=1` real, não simulado) contra o banco de dev real. `listFuncionarios()` → rejeitado com a nova mensagem (`Error invoking remote method 'funcionario:list': Error: Troca de senha obrigatória pendente...`). `trocarSenha` com token inválido → rejeitado pela lógica interna do próprio handler (`Sessão inválida.`), não pelo gate — confirma que o canal passa pelo gate mesmo com `must_change_password=1`. `trocarSenha` real (senha atual `admin123` → nova senha de teste) → `{success:true}`. `listFuncionarios()` logo em seguida, na mesma sessão → `{ok:true, count:1}` — confirma que o fix de sincronização de sessão funcionou e o caminho normal foi liberado de verdade.
  - **Passo 4 (UI real, não IPC direto):** completado o Setup Wizard via `setup:save-config` (necessário para a UI sair de `#/setup` e chegar em `LoginPage`; nada relacionado a autenticação foi alterado por isso). Recarreguei o renderer (`Page.reload`) e confirmei `LoginPage` real renderizada (`document.title === 'SudoSys — Acesso ao Sistema'`, input de e-mail presente). Preenchi os campos via o setter nativo de `value` + evento `input` real (não `window.electronAPI` direto) e disparei um `click()` real no botão "Entrar" — sem interação de mouse, mas eventos DOM genuínos, mesmo padrão já usado nos scripts `.ps1` do projeto. Como a senha do admin já havia sido trocada de verdade no Passo 3 (`must_change_password` já `0`), o login foi direto para o Dashboard/`AppShell` (sem cair em `TrocarSenhaPage`) — confirma o caminho feliz normal (usuário sem troca pendente) não quebrou. Com a mesma sessão real da UI, `listFuncionarios()` retornou `{ok:true, count:1}`. Não tentei validar visualmente uma página específica de listagem (ex. `/funcionarios`) além disso — não é o ponto sensível desta mudança (é lógica de frontend inalterada) e o guardrail de no máximo 2 tentativas em rota de UI se aplicaria.
  - `pnpm test` (raiz): 36/36 passaram (25 `domain` + 11 `infrastructure`) — `better-sqlite3` restaurado ao ABI do Node antes de rodar, mesma rotina já documentada em ações anteriores.
  - `pnpm typecheck` (raiz, todos os workspaces): passou.
  - Processos `pnpm dev`/Vite/Electron abertos para os testes foram encerrados ao final (confirmado via `Get-CimInstance Win32_Process`, nenhum processo relacionado a `sudo-sys` permaneceu ativo).
- **Arquivos envolvidos:**
  - `app-host/src/ipc/authGuard.ts` (alterado — checagem de `must_change_password` + doc comment).
  - `app-host/src/ipc/handlers/authHandlers.ts` (alterado — sincroniza sessão do `authGuard` após troca de senha real).
  - `HISTORICO_AGENTES.md`, `CONTEXTO_TOTAL.md` (registro desta ação, retificação do achado da `ACAO-0026` e status da `REC-0002`).
- **Riscos ou observações:**
  - A senha do admin no banco de dev real (`.dev-user-data/banco/sudosys.db`) foi trocada de verdade durante os testes do Passo 3/4 e não é mais `admin123`; `must_change_password` para esse usuário agora é `0`. O valor novo não foi registrado aqui de propósito, por ser credencial de um ambiente de dev compartilhado — se precisar resetá-la, é preciso um fluxo de administração (não existe "esqueci minha senha" no sistema hoje) ou UPDATE direto no banco de dev.
  - Dados de teste da `ACAO-0026` (empresa/funcionário/folha id=2) continuam no banco de dev real, agora também usados para validar esta ação; não removidos.
  - Nenhum outro canal, rota, papel, RBAC ou regra de negócio foi alterado. A mudança é estritamente aditiva ao gate existente: sessões sem `must_change_password=1` (a esmagadora maioria, já que só o admin seed nasce com essa flag) não sentem nenhuma diferença de comportamento.
  - Se no futuro outra tela além de `TrocarSenhaPage` precisar funcionar durante `must_change_password=1` (ex. um botão de logout visível nessa tela), o canal correspondente precisa ser adicionado a `CANAIS_PERMITIDOS_COM_TROCA_PENDENTE` explicitamente — hoje só `auth:trocarSenha` está lá porque é só o que a tela chama.
- **Próxima ação sugerida:**
  - Nenhuma nova REC. Esta ação fecha a lacuna de enforcement encontrada durante o diagnóstico da `REC-0002` nesta mesma sessão; a `REC-0002` permanece "Executado", agora com a ressalva de que o enforcement é também no backend, não só na UI.

### ACAO-0028 — 2026-09-14 — Codex

* **Autor da ação:** Codex
* **Tipo de ação:** Documentação / Coordenação entre agentes
* **Status:** Concluído
* **Resumo:**

  * Foram criados arquivos de coordenação entre agentes para registrar bloqueios, comunicação e decisões técnicas vigentes.

* **O que foi mudado:**

  * Criado `BLOQUEIOS_AGENTES.md`.
  * Criado `COMUNICACAO_AGENTES.md`, incluindo a mensagem inicial `MSG-0001` sobre separação de responsabilidades.
  * Criado `DECISOES_TECNICAS.md`, consolidando fielmente `DEC-0001` a `DEC-0005`; a `DEC-0005` foi incluída porque substitui parcialmente a `DEC-0004` e já estava registrada no projeto.
  * Atualizado `CONTEXTO_TOTAL.md` para citar os seis arquivos de leitura obrigatória, explicar suas funções e refletir esta ação como a mais recente.
  * Atualizado `README_AMBIENTE.md` porque seu fluxo de leitura inicial também orienta agentes antes de alterar scripts, dependências, build ou configuração.

* **O que foi melhorado:**

  * Melhor coordenação entre ChatGPT, Claude, Codex e outros agentes.
  * Menor risco de sobrescrever trabalho incompleto ou confundir tarefas de agentes diferentes.
  * Decisões técnicas vigentes ficam mais fáceis de consultar sem substituir o histórico completo.

* **Por que foi feito:**

  * Para permitir que os agentes tenham liberdade de propor melhorias sem perder alinhamento, histórico e responsabilidade.

* **Diagnóstico de alteração preexistente:**

  * `scripts/test-holerite.ps1` estava limpo no início desta ação. A alteração observada anteriormente era intencional, relacionada à `REC-0012`, registrada na `ACAO-0026` e commitada em `96fc492`; o script não foi tocado nesta ação.
  * Nenhum bloqueio ativo foi identificado no working tree no início desta ação.

* **Arquivos envolvidos:**

  * `BLOQUEIOS_AGENTES.md`
  * `COMUNICACAO_AGENTES.md`
  * `DECISOES_TECNICAS.md`
  * `CONTEXTO_TOTAL.md`
  * `HISTORICO_AGENTES.md`
  * `README_AMBIENTE.md`

* **Validações executadas:**

  * `git status -sb` e `git diff --stat` foram conferidos antes da alteração; o working tree estava limpo.
  * `git diff -- scripts/test-holerite.ps1` não mostrou alteração pendente.
  * `git diff --check`, busca por marcadores de conflito e conferência do escopo documental foram executados após as edições.
  * Testes de código não foram executados porque a ação altera somente arquivos Markdown e não modifica código, scripts funcionais, dependências ou configuração de build.

* **Riscos ou observações:**

  * Os novos arquivos são índices e instrumentos de coordenação; `CONTEXTO_TOTAL.md`, `HISTORICO_AGENTES.md` e `README_AMBIENTE.md` continuam sendo as fontes já definidas para estado, histórico e ambiente.
  * Bloqueios resolvidos, mensagens e decisões antigas não devem ser apagados; seus status devem ser atualizados preservando o histórico.
  * Nenhuma nova REC, decisão técnica ou tarefa funcional foi iniciada.

* **Próxima ação sugerida:**

  * Antes de nova tarefa funcional, verificar se existe alteração não commitada e consultar bloqueios, mensagens e decisões; se surgir trabalho residual, diagnosticar e decidir seu destino separadamente.

### ACAO-0029 — 2026-09-14 — Claude (Sonnet 5)

* **Autor da ação:** Claude (Sonnet 5)
* **Tipo de ação:** Diagnóstico / Registro de pendência (nenhuma alteração funcional)
* **Status:** Concluído (só diagnóstico; a tarefa original não foi executada nesta sessão)
* **Resumo:**

  * Foi solicitado mover o projeto para fora de uma pasta sincronizada pelo OneDrive (`C:\Users\holdi\OneDrive\Documentos\sudo-sys`), sob a alegação de que essa sincronização já teria causado três vezes o bug de ABI mismatch do `better-sqlite3` numa sessão de trabalho anterior.
  * Antes de mover qualquer coisa, foi verificado `git status -sb` (árvore limpa, sem trabalho não commitado de outro agente) e o ambiente real desta sessão.
  * A verificação encontrou uma divergência: esta sessão já roda em `C:\Users\JEREeGABI\Documents\sistema\sudo-sys`, que **não** está em pasta sincronizada por OneDrive, e não existe usuário `holdi` nem o path `C:\Users\holdi\...` citado na tarefa nesta máquina. A documentação existente (`CONTEXTO_TOTAL.md`, `README_AMBIENTE.md`) também referencia o usuário `holdi` e o caminho `C:\Users\holdi\AppData\Roaming\Electron\banco\sudosys.db`, evidenciando que essas instruções e boa parte do histórico documentado se referem a uma máquina/sessão diferente desta.
  * Diante da divergência, o usuário foi consultado e orientou registrar isso apenas como pendência (nova REC), sem mover pastas, reinstalar dependências nem executar os demais passos da tarefa original nesta sessão.
* **O que foi encontrado:**

  * `git status -sb` → árvore limpa (`## main...origin/main`), nenhuma mudança pendente de outro agente.
  * `git remote -v` → `origin` aponta para `https://github.com/Jerezincoc/sudo-sys`, consistente com o repositório esperado.
  * Não existe `C:\Users\holdi` nesta máquina; os usuários locais existentes incluem `JEREeGABI`, entre outros.
  * O path de trabalho atual (`C:\Users\JEREeGABI\Documents\sistema\sudo-sys`) já está fora de qualquer pasta de sincronização de nuvem conhecida (não é subpasta de `OneDrive`).
* **O que foi mudado:**

  * Nenhum arquivo de código-fonte, dependência, `node_modules` ou configuração de build foi alterado.
  * Nenhuma pasta foi criada, copiada ou movida.
  * Apenas documentação: esta entrada em `HISTORICO_AGENTES.md`, a `REC-0016` e a atualização de `CONTEXTO_TOTAL.md`.
* **Por que foi feito:**

  * Para não executar uma migração de pasta baseada numa premissa de ambiente (path/usuário `holdi`, OneDrive) que não corresponde ao ambiente real desta sessão, evitando ação destrutiva ou confusa sobre o path errado.
* **Arquivos envolvidos:**

  * `HISTORICO_AGENTES.md`
  * `CONTEXTO_TOTAL.md`
* **Validações executadas:**

  * `git status -sb`, `git remote -v`, listagem de `C:\Users\` e tentativa de acesso a `C:\Users\holdi\OneDrive\Documentos\sudo-sys` (inexistente).
* **Riscos ou observações:**

  * Se a máquina/sessão do usuário `holdi` (com OneDrive) ainda existir separadamente, a tarefa original de migração de path continua válida **lá**, não nesta sessão/máquina. Esta ação não descarta nem invalida essa necessidade — apenas confirma que não se aplica a este ambiente.
  * Documentação existente (`CONTEXTO_TOTAL.md` §8, `README_AMBIENTE.md` §9) cita o path `C:\Users\holdi\AppData\Roaming\Electron\banco\sudosys.db` como observação de ambiente; deve ser lida como referente à máquina original de diagnóstico, não necessariamente a esta.
* **Recomendações deixadas para próximos agentes:**

  * `REC-0016`: confirmar em qual máquina/sessão (usuário `holdi`, OneDrive) o bug de ABI mismatch do `better-sqlite3` por sincronização de `node_modules` ocorreu, e se essa migração de path ainda é necessária lá. Nesta sessão (`JEREeGABI`, fora de OneDrive), não há indício do mesmo risco.
* **Próxima ação sugerida:**

  * Aguardar confirmação do usuário sobre qual máquina/sessão precisa da migração de path antes de repetir esta tarefa; não presumir que o path atual desta sessão precisa de qualquer mudança.

### ACAO-0030 — 2026-09-14 — Claude (Sonnet 5)

* **Autor da ação:** Claude (Sonnet 5)
* **Tipo de ação:** Diagnóstico de segurança / Varredura sistemática de autenticação e autorização em IPC (nenhuma correção aplicada)
* **Status:** Concluído (diagnóstico completo; correções ficam para tarefa separada, por guardrail explícito do usuário)
* **Resumo:**

  * Varredura completa de todos os canais IPC (`ipcMain.handle`) do projeto, cruzando cada um com o gate central `authGuard.ts` (commit `0273154`) e com a distinção de papel (`admin` vs. não-admin) usada no frontend (`RequireAdmin`), para achar deliberadamente gaps do mesmo tipo dos já corrigidos por acaso em `REC-0002`/`ACAO-0027` (canal que escapa da checagem central de sessão/senha obrigatória).
  * Encontrado e **confirmado na prática via IPC direto (CDP)** um gap real e não documentado antes: os canais `setup:save-config` e `setup:get-config` são públicos (`CANAIS_PUBLICOS` em `authGuard.ts`) e o handler nunca verifica `isInitialized()` — ficam abertos, sem qualquer sessão, para sempre, não só durante o wizard inicial.
  * Nenhuma correção foi aplicada nesta ação — só diagnóstico, teste e registro, por guardrail explícito do usuário.
* **PASSO 1 — Lista completa de canais IPC (`ipcMain.handle`), por arquivo:**

  * `ipcRouter.ts`: `shell:open-path`.
  * `setupHandlers.ts`: `setup:check-initialized`, `setup:test-database`, `setup:save-config`, `setup:get-config`.
  * `authHandlers.ts`: `auth:login`, `auth:trocarSenha`, `auth:logout`, `auth:register`, `auth:me`, `usuario:list`, `usuario:create`, `usuario:delete`.
  * `adminHandlers.ts`: `admin:backup`.
  * `cboHandlers.ts`: `cbo:list`, `cbo:list-grupos`, `cbo:list-subgrupo`, `cbo:search`.
  * `documentosHandlers.ts`: `doc:contrato`, `doc:aditivo`, `doc:vale`, `doc:advertencia`.
  * `empresaHandlers.ts`: `empresa:list`, `empresa:get`, `empresa:create`, `empresa:update`, `empresa:delete`, `empresa:export`, `dialog:open-file`, `empresa:import`.
  * `feriasHandlers.ts`: `ferias:list`, `ferias:listByFuncionario`, `ferias:get`, `ferias:create`, `ferias:update`, `ferias:delete`, `ferias:gerar-pdf`.
  * `folhaHandlers.ts`: `folha:list`, `folha:get`, `folha:create`, `folha:update`, `folha:fechar`, `folha:lancamentos:list`, `folha:lancamentos:add`, `folha:lancamentos:delete`, `folha:calcular`, `folha:holerites:list`, `folha:holerites:get`, `folha:gerar-holerite`.
  * `funcionarioHandlers.ts`: `funcionario:list`, `funcionario:get`, `funcionario:create`, `funcionario:update`, `funcionario:delete`, `funcionario:gerar-ficha-pdf`.
  * `pontoHandlers.ts`: `ponto:list`, `ponto:get`, `ponto:create`, `ponto:update`, `ponto:delete`, `ponto:espelho`, `ponto:gerar-espelho-pdf`.
  * `relatorioHandlers.ts`: `relatorio:list`, `relatorio:get`, `relatorio:create`, `relatorio:update`, `relatorio:delete`, `relatorio:executar`, `relatorio:gerar-pdf`.
  * `rescisaoHandlers.ts`: `rescisao:list`, `rescisao:get`, `rescisao:create`, `rescisao:update`, `rescisao:delete`, `rescisao:calcular`, `rescisao:gerar-pdf`.
  * `rubricaHandlers.ts`: `rubrica:list`, `rubrica:get`, `rubrica:create`, `rubrica:update`, `rubrica:delete`.
  * `custosHandlers.ts`, `extrasHandlers.ts`, `quickCalcHandlers.ts`: 0 bytes, nenhum canal registrado (confirmado com `wc -l`; consistente com `REC-0010`).
  * Total: **81 canais IPC ativos**, todos via `ipcMain.handle` — nenhum uso de `ipcMain.on` foi encontrado em todo o `app-host/src` (`grep` recursivo sem resultado), então não existe canal "fire-and-forget" escapando do mecanismo de interceptação do `authGuard`.
* **PASSO 2 — Todos os canais passam pelo gate central:**

  * `main.ts:94` chama `installIpcAuthGuard()` antes de `registerSetupHandlers()` (linha 95) e de `registerAllHandlers()` (linha 97) — confirmado por leitura direta do arquivo. Como `installIpcAuthGuard()` substitui `ipcMain.handle` globalmente antes do primeiro registro real, **todos** os 81 canais (setup incluso) passam pela versão interceptada, mesmo os que depois se revelam "públicos".
  * "Público" aqui não significa "fora do gate" — significa que o gate, ao interceptar, decide devolver o handler original sem checagem porque o canal está em `CANAIS_PUBLICOS`. Não existe registro de canal antes da instalação do gate nem uso de `ipcMain.on` para escapar dessa interceptação.
* **PASSO 3 — Cruzamento com RBAC do frontend:**

  * A única distinção de papel no frontend é `isAdmin` (`usePermission.ts`), usada em `RequireAdmin` (só a rota `/admin`) e em `Sidebar.tsx` (esconder o grupo de navegação `ADMIN`). Não há nenhuma outra checagem de papel (`role ===`/`papel ===`) em `packages/ui/src` — busca recursiva não encontrou mais nenhuma ocorrência.
  * Os canais chamados pela `AdminPage.tsx` (`usuario:list`, `usuario:create`, `usuario:delete`, `admin:backup`) são exatamente os 4 canais em `CANAIS_ADMIN` no backend — não há assimetria nova aqui (frontend e backend concordam).
  * Não foi encontrado nenhum canal que devesse ter restrição de papel adicional e não tem, além do que já está documentado e em aberto na `REC-0011` (ausência de distinção prática entre `operador` e `visualizador`, tanto no frontend quanto no backend — não é uma assimetria, é uma lacuna simétrica já conhecida).
* **PASSO 4 — Testes reais via IPC direto (CDP), sem sessão:**

  * Ambiente: `pnpm dev` real, banco de desenvolvimento isolado (`.dev-user-data`, não o banco real do usuário), Electron com `--remote-debugging-port=9222`, script `scripts/cdp-authguard-scan.ps1` criado para esta varredura (chama `window.electronAPI.*` via `Runtime.evaluate` do CDP, sem nunca chamar `login`).
  * `listFolhas(1)` sem sessão → **rejeitado**: `Error: Sessão inválida. Faça login novamente.` (gate funcionando).
  * `listUsuarios()` sem sessão → **rejeitado**: mesma mensagem (gate funcionando; e mesmo com sessão de não-admin teria caído na checagem `CANAIS_ADMIN`, não testada aqui por já estar coberta por `usuario:list` sem sessão nenhuma, cenário mais permissivo).
  * `saveConfig({database:{type:'sqlite'}, empresa:{razaoSocial:'AUTHGUARD_SCAN_PROBE_ACAO0030'}})` sem sessão, com `checkInitialized() === false` → **aceito** (`{"success":true}`), e `getConfig()` subsequente confirmou a gravação.
  * Repetido com `checkInitialized() === true` (sistema já inicializado pelo probe anterior) e um payload adversarial (`database.type: 'postgresql'`, `host: 'attacker-controlled.example'`, `user: 'pwn'`) → **aceito de novo**, sem nenhuma checagem de sessão, papel ou estado de inicialização. `getConfig()` confirmou a sobrescrita completa do `config.json`, incluindo a seção `database`.
  * **Confirmado na prática:** qualquer código capaz de chamar `window.electronAPI.saveConfig(...)` — sem login, a qualquer momento, mesmo com o sistema já configurado — pode reescrever a configuração inteira do app, inclusive a conexão de banco. Não houve dano real: o teste rodou contra `.dev-user-data` (isolado, gitignored), e o `config.json` poluído pelo probe foi removido ao final da ação; o banco SQLite de desenvolvimento (`banco/sudosys.db`) não foi tocado.
* **PASSO 5 — Tabela final (canal | protegido por authGuard | restrição de role no backend | gap | severidade):**

  | Canal | `authGuard` (sessão) | Role no backend | Gap | Severidade |
  |---|---|---|---|---|
  | `setup:check-initialized` | Público (esperado) | — | Não | — |
  | `setup:test-database` | Público (esperado — necessário para o wizard testar conexão antes de haver usuário) | — | Não | — |
  | `setup:save-config` | Público, **sem checar `isInitialized()`** | — | **Sim — reescreve config/DB a qualquer momento, sem sessão** | **Crítica** |
  | `setup:get-config` | Público, **sem checar `isInitialized()`** | — | **Sim — pode expor connection string/dados de empresa sem sessão** | **Alta** |
  | `auth:login` | Público (esperado) | — | Não | — |
  | `auth:logout` | Público (esperado) | — | Não | — |
  | `auth:me` | Público (esperado — apenas ecoa dado do token informado) | — | Não | — |
  | `auth:register` | **Público, mas com checagem própria de admin via `requestingToken`** (mecanismo próprio, não o gate central por `webContents`) | Sim (própria) | Parcial — canal não usado por nenhuma tela hoje, mas alcançável direto; se um token de admin vazar, contorna o gate central | Baixa |
  | `auth:trocarSenha` | Sessão exigida (não está em `CANAIS_PUBLICOS`); liberado mesmo com `must_change_password=1` | — | Não (comportamento intencional, é o único canal que precisa funcionar nesse estado) | — |
  | `usuario:list` / `usuario:create` / `usuario:delete` | Sessão + admin | Sim (`CANAIS_ADMIN`) | Não | — |
  | `admin:backup` | Sessão + admin | Sim (`CANAIS_ADMIN`) | Não | — |
  | `shell:open-path` | Sessão | Não (qualquer papel autenticado) | Não é gap novo — mesma lacuna simétrica da `REC-0011` | Baixa (referência `REC-0011`) |
  | `cbo:*` (4 canais) | Sessão | Não | Não é gap novo (dado de referência, baixo risco) | — |
  | `doc:*` (4 canais) | Sessão | Não | Não é gap novo — `REC-0011` | Baixa (referência `REC-0011`) |
  | `empresa:*` (8 canais, incl. `dialog:open-file`) | Sessão | Não | Não é gap novo — `REC-0011` | Baixa (referência `REC-0011`) |
  | `ferias:*` (7 canais) | Sessão | Não | Não é gap novo — `REC-0011` | Baixa (referência `REC-0011`) |
  | `folha:*` (12 canais — dados de folha/salário) | Sessão (confirmado por teste real) | Não | Não é gap novo — `REC-0011` | Média (referência `REC-0011`, mas dado mais sensível) |
  | `funcionario:*` (6 canais — dados pessoais/salariais) | Sessão | Não | Não é gap novo — `REC-0011` | Média (referência `REC-0011`) |
  | `ponto:*` (7 canais) | Sessão | Não | Não é gap novo — `REC-0011` | Baixa (referência `REC-0011`) |
  | `relatorio:*` (7 canais) | Sessão | Não | Não é gap novo — `REC-0011` | Baixa (referência `REC-0011`) |
  | `rescisao:*` (7 canais) | Sessão | Não | Não é gap novo — `REC-0011` | Baixa (referência `REC-0011`) |
  | `rubrica:*` (5 canais) | Sessão | Não | Não é gap novo — `REC-0011` | Baixa (referência `REC-0011`) |

  * As linhas marcadas "Não é gap novo — `REC-0011`" representam a lacuna já registrada (ausência de matriz de RBAC além de admin/não-admin) — não são achados novos desta varredura, só confirmação de que continuam assim, sem nenhuma assimetria entre frontend e backend.
* **O que foi encontrado (achados novos, fora da `REC-0011` já conhecida):**

  * `setup:save-config`/`setup:get-config` públicos e sem checagem de `isInitialized()` — achado novo, confirmado na prática, mesma classe de risco do `REC-0002` original (canal que deveria ter deixado de ser acessível após um certo estado do sistema, mas ficou aberto). Já havia uma menção genérica em `CONTEXTO_TOTAL.md` §5 ("canais de setup públicos após a inicialização"), mas nunca virou uma `REC` numerada nem foi testado na prática — esta ação fecha essa lacuna de registro e comprova o risco com evidência real.
  * `auth:register` usando mecanismo de autorização próprio (token como parâmetro) em vez do gate central por `webContents` — achado novo, severidade baixa dado que não há consumidor de UI hoje.
* **O que foi mudado:**

  * Nenhum código de produção foi alterado (guardrail explícito da tarefa: só diagnóstico).
  * Criado `scripts/cdp-authguard-scan.ps1` — script de teste reutilizável para reproduzir esta varredura (mesmo padrão do `scripts/cdp-test.ps1` já existente).
  * `.dev-user-data/config.json`, poluído pelos dois probes do Passo 4, foi removido ao final para deixar o ambiente de desenvolvimento limpo para o próximo `pnpm dev` (o wizard de setup volta a rodar do zero); `.dev-user-data/banco/sudosys.db` (dado de dev, não o banco real) não foi tocado.
  * `HISTORICO_AGENTES.md` (esta entrada) e `CONTEXTO_TOTAL.md` (`REC-0017` e `REC-0018`) atualizados.
* **Por que foi feito:**

  * Para achar deliberadamente, antes de um incidente real, canais IPC que repetem o padrão dos dois gaps já corrigidos por acaso (`REC-0002`/`ACAO-0027`): checagem de autenticação ausente ou incompleta em um canal que deveria exigi-la.
* **Arquivos envolvidos:**

  * `app-host/src/ipc/authGuard.ts` — lido, não alterado.
  * `app-host/src/ipc/ipcRouter.ts` — lido, não alterado.
  * `app-host/src/main.ts` — lido, não alterado.
  * `app-host/src/ipc/handlers/*.ts` (todos os 14 arquivos não vazios) — lidos/grepados, não alterados.
  * `app-host/src/setup/configManager.ts` — lido, não alterado.
  * `app-host/src/preload.ts` — lido, não alterado.
  * `packages/ui/src/permissions/usePermission.ts`, `guards.tsx`, `components/layout/Sidebar.tsx`, `app/Router.tsx`, `pages/admin/AdminPage.tsx` — lidos, não alterados.
  * Criado: `scripts/cdp-authguard-scan.ps1`.
  * Atualizados: `HISTORICO_AGENTES.md`, `CONTEXTO_TOTAL.md`.
* **Validações executadas:**

  * `git status -sb` verificado antes de iniciar (árvore limpa) e novamente ao longo da ação.
  * `pnpm dev` real contra `.dev-user-data` isolado, com `--remote-debugging-port=9222`.
  * Testes de IPC direto via CDP (`Runtime.evaluate`) para `listFolhas`, `listUsuarios`, `checkInitialized`, `getConfig`, `saveConfig` (duas vezes, antes e depois de `initialized=true`), sem nenhum `login()` chamado em nenhum momento.
  * Processos `electron.exe`/`node.exe` iniciados por esta ação foram encerrados por PID específico ao final (não foi usado `taskkill` genérico por nome de imagem).
* **Riscos ou observações:**

  * **Trabalho em paralelo de outro agente detectado durante a ação:** no meio da varredura, `git status -sb` passou a mostrar `packages/ui/src/pages/empresas/EmpresasPage.tsx` modificado (209 inserções/49 remoções) e diretórios não rastreados `.codex-pnpm-9-copy/`, `.codex-pnpml-copy/`, `.codex-pnpm-runtime/` — nenhum desses foi criado por esta ação. Consistente com o Codex trabalhando em paralelo nesta mesma árvore. Esses arquivos **não foram tocados, lidos em detalhe nem incluídos no commit desta ação** — só `HISTORICO_AGENTES.md` e `CONTEXTO_TOTAL.md` foram adicionados via `git add` explícito, conforme guardrail da tarefa. Registrado aqui para o próximo agente não confundir essas mudanças com as desta ação.
  * `setup:save-config`/`setup:get-config` continuam vulneráveis em produção — nenhuma correção foi aplicada, por guardrail explícito desta tarefa (só diagnóstico). Ver `REC-0017`.
  * `auth:register` continua com o mecanismo próprio de autorização — ver `REC-0018`.
  * `REC-0011` (matriz de RBAC além de admin/não-admin) permanece a lacuna estrutural mais ampla; nada nesta varredura contradiz ou substitui essa recomendação já existente.
* **Recomendações deixadas para próximos agentes:**

  * `REC-0017`: corrigir `setup:save-config` (e considerar `setup:get-config`) para checar `isInitialized()` e recusar chamadas fora do fluxo legítimo do wizard após a primeira inicialização — ou, alternativamente, trazer esses canais para dentro do gate central de sessão assim que `initialized=true`. Prioridade crítica — risco de reescrita da configuração/conexão de banco sem autenticação, confirmado na prática.
  * `REC-0018`: avaliar se `auth:register` deve ser removido (não tem consumidor de UI) ou migrado para usar o gate central por `webContents` como os demais canais admin, em vez de seu próprio mecanismo de token por parâmetro.
* **Próxima ação sugerida:**

  * Corrigir `REC-0017` em uma tarefa separada, dedicada e pequena (guardrail desta ação foi só diagnóstico); antes de começar, confirmar com o Codex se `EmpresasPage.tsx` já foi commitado, para não colidir com esse trabalho em paralelo.

### ACAO-0031 — 2026-09-14 — Codex

* **Autor da ação:** Codex
* **Tipo de ação:** Melhoria pequena de UI/UX
* **Status:** Implementação concluída; publicação pendente por restrição do ambiente
* **Área melhorada:**

  * Tela e listagem de Empresas, sem alteração de lógica funcional.

* **O que foi mudado:**

  * Adicionado cabeçalho local compacto com título, resumo e ação primária "Nova empresa".
  * Busca ampliada e identificada por label acessível; o texto de apoio agora explicita código, razão social, nome fantasia e CNPJ.
  * Filtro de status passou a funcionar visualmente como controle segmentado, com grupo e estado selecionado expostos por atributos ARIA.
  * Adicionada faixa de contexto com quantidade exibida, total cadastrado, ativas, inativas e selecionadas.
  * Adicionada ação "Limpar filtros" quando existe busca ou filtro de status ativo.
  * O seletor geral ganhou rótulo acessível, tooltip, estado parcial e cálculo correto sobre as linhas visíveis; os seletores individuais também receberam rótulos contextuais.
  * O estado sem cadastro agora orienta a criação da primeira empresa e oferece a ação "Nova empresa".
  * O estado sem resultado de busca/filtro passou a ser distinto e oferece a ação "Limpar filtros".
  * O botão de importação manteve o fluxo existente e ganhou ícone e semântica de menu expandido.

* **Lógica preservada:**

  * Foram mantidos os callbacks, APIs e fluxos atuais de carregamento, seleção, navegação por teclado, importação, exportação, impressão, criação, edição, inativação, reativação e exclusão.
  * Nenhum backend, regra de negócio, cálculo, autenticação, autorização, RBAC, banco, migration, contrato IPC ou dependência foi alterado.

* **Arquivos alterados:**

  * `packages/ui/src/pages/empresas/EmpresasPage.tsx`
  * `HISTORICO_AGENTES.md`

* **Validações executadas:**

  * Typecheck dos seis workspaces executáveis: passou; a UI também foi verificada isoladamente após o ajuste final. A invocação literal de `pnpm typecheck` foi bloqueada pela política de acesso do sandbox ao caminho pai do workspace, e o mesmo conjunto de builds/typechecks foi executado por workspace através de um drive virtual local.
  * `pnpm test`: 36/36 testes passaram (25 em `domain` e 11 em `infrastructure`). O binário de `better-sqlite3` estava no ABI 128 do Electron; foi restaurado para o ABI 115 do Node pelo procedimento já documentado e a suíte passou na repetição.
  * Build: os quatro pacotes internos compilaram, a UI passou pelo TypeScript, o Vite processou 1.673 módulos e gerou o bundle, e o `app-host` compilou. A etapa do Vite foi chamada diretamente pela API do mesmo pacote porque o sandbox não permite ao Node resolver os links do pnpm acima do workspace.
  * Desenvolvimento: servidor Vite iniciado em `http://127.0.0.1:5173`; documento, entrada e módulo de Empresas responderam HTTP 200, e os marcadores dos novos estados foram confirmados no módulo transformado. O controlador visual integrado não inicializou por erro interno de metadados do sandbox, e o sandbox também impediu manter o Electron gráfico aberto; por isso não houve inspeção visual interativa ou screenshot nesta sessão.
  * `git diff --check`: passou sem erros de whitespace.
  * `git status -sb`: conferido antes da edição e antes do commit.

* **Riscos ou observações:**

  * Risco baixo: a alteração está restrita à composição visual e à acessibilidade da listagem.
  * A pasta `.git` está disponível apenas para leitura nesta sessão, impedindo atualizar o índice do checkout principal; o commit foi preparado em clone temporário. O acesso HTTPS a `github.com:443` também foi bloqueado em duas tentativas, portanto o push permaneceu pendente.
  * `scripts/cdp-authguard-scan.ps1` apareceu como arquivo não rastreado durante a execução, não foi criado por esta tarefa e foi preservado fora do commit.
  * `CONTEXTO_TOTAL.md` não foi alterado porque a fase, as recomendações e o estado técnico geral do projeto não mudaram.

* **Próxima recomendação:**

  * Em uma rodada separada, aplicar o mesmo padrão de cabeçalho, contexto de listagem e estados vazios às telas de Funcionários e Rubricas, preservando seus fluxos atuais.
  * Nenhuma nova REC foi criada nesta ação.

### ACAO-0032 — 2026-09-14 — Claude (Sonnet 5)

* **Autor da ação:** Claude (Sonnet 5)
* **Tipo de ação:** Correção de segurança / Gate central de IPC
* **Status:** Concluído
* **Resumo:**

  * Corrigida a `REC-0017` (crítica): `setup:save-config` e `setup:get-config` estavam em `CANAIS_PUBLICOS` no `authGuard.ts` e nunca checavam `isInitialized()`, permitindo reescrever ou ler a configuração inteira do app (inclusive a seção `database`) sem sessão nenhuma, mesmo com o sistema já inicializado — achado e confirmado na prática na `ACAO-0030`.
  * Regra implementada: os dois canais continuam públicos (sem sessão) **somente enquanto `isInitialized() === false`** — propósito legítimo do wizard de primeira configuração. Uma vez `isInitialized() === true`, passam a exigir sessão autenticada **e** papel admin, no mesmo padrão de `CANAIS_ADMIN` já existente.
  * Escopo estritamente limitado à `REC-0017`, por guardrail explícito do usuário — `REC-0018` (mecanismo próprio de `auth:register`) e `REC-0011` (matriz de RBAC além de admin/não-admin) não foram tocadas.
* **PASSO 1 — Código anterior e causa raiz:**

  * `app-host/src/ipc/authGuard.ts`, `CANAIS_PUBLICOS` incluía `'setup:save-config'` e `'setup:get-config'` lado a lado com `setup:check-initialized`/`setup:test-database` (que são legitimamente sempre públicos). `installIpcAuthGuard()` só tinha dois ramos: canal em `CANAIS_PUBLICOS` → delega direto ao handler original, sem nenhuma checagem; canal fora dessa lista → exige sessão (e, se em `CANAIS_ADMIN`, também papel admin). Não existia nenhum ramo intermediário que considerasse o estado `isInitialized()` — por isso os dois canais de escrita/leitura de config ficavam permanentemente abertos, tratados exatamente como `auth:login`/`auth:me`.
* **PASSO 2 — Regra implementada (`app-host/src/ipc/authGuard.ts`):**

  * Removidos `'setup:save-config'` e `'setup:get-config'` de `CANAIS_PUBLICOS`.
  * Criado o novo conjunto `CANAIS_SETUP_SO_ANTES_DE_INICIALIZAR = new Set(['setup:save-config', 'setup:get-config'])`.
  * Extraída a lógica de sessão/senha-pendente/role para uma função compartilhada `exigirSessaoEAutorizacao(channel, event, exigeAdmin)`, reaproveitada tanto pelo fluxo normal de canal protegido quanto pelo novo ramo.
  * `installIpcAuthGuard()` ganhou um terceiro ramo: se o canal está em `CANAIS_SETUP_SO_ANTES_DE_INICIALIZAR`, chama `isInitialized()` (importado de `../setup/configManager`) a cada invocação; se `false`, delega direto ao handler original (sem checagem, igual ao wizard sempre funcionou); se `true`, chama `exigirSessaoEAutorizacao(channel, event, true)` — mesma exigência de `CANAIS_ADMIN`.
  * `isInitialized()` é síncrona e lê o `config.json` do disco a cada chamada — sem cache, sem risco de decisão desatualizada entre inicializar e a checagem seguinte.
* **PASSO 3 — Testes reais via IPC direto (CDP), sem login, nos 3 cenários pedidos:**

  * Ambiente: `pnpm dev` real, banco/config de desenvolvimento isolados em `.dev-user-data` (não o banco real do usuário), `--remote-debugging-port=9222`; `.dev-user-data/config.json` removido antes do teste para garantir `isInitialized() === false` no início. Script criado: `scripts/cdp-rec0017-verify.ps1`.
  * **(a) `isInitialized() === false`, sem sessão:** `checkInitialized()` retornou `false`; `saveConfig({database:{type:'sqlite'}, empresa:{razaoSocial:'REC0017_CENARIO_A_PREINIT'}})` **funcionou** (`{"success":true}`) — wizard de primeiro uso não quebrou.
  * **(b) `isInitialized() === true` (após o probe do cenário a), sem sessão:** `checkInitialized()` confirmou `true`; `saveConfig(...)` com um payload adversarial (`database.type:'postgresql'`, `host:'attacker-controlled.example'`, `user:'pwn'`) foi **rejeitado**: `Error: Sessão inválida. Faça login novamente.`; `getConfig()` também foi **rejeitado** com a mesma mensagem — o ataque original confirmado na `ACAO-0030` não funciona mais.
  * **(c) `isInitialized() === true`, com sessão admin válida:** login como `admin@sudosys.local` retornou `must_change_password: 1` (seed fresco do banco de dev) — `saveConfig`/`getConfig` foram corretamente bloqueados pela checagem de troca de senha pendente (comportamento herdado da extensão da `REC-0002`, não um bug desta correção). Repetido o cenário após `auth:trocarSenha` (saindo do estado `must_change_password`): login novo como admin, `saveConfig({database:{type:'sqlite'}, empresa:{razaoSocial:'REC0017_CENARIO_C_ADMIN_OK'}})` **funcionou** (`{"success":true}`) e `getConfig()` subsequente **refletiu o probe** — caminho legítimo de admin ajustando config depois do setup continua funcionando. Sessão encerrada com `logout` ao final.
  * Os três cenários batem exatamente com o pedido: wizard legítimo intacto, ataque sem sessão bloqueado, caminho de admin autenticado preservado.
* **PASSO 4 — Regressão:**

  * `pnpm typecheck` (raiz, compila os 4 pacotes internos antes dos workspaces): passou em todos os workspaces, incluindo `app-host` (onde `authGuard.ts` foi alterado) e `packages/ui` (que tem `EmpresasPage.tsx` com trabalho não commitado do Codex — não tocado por esta ação, só confirmado que o typecheck geral continua passando).
  * `pnpm test` (raiz — `domain` + `infrastructure`): na primeira tentativa, 4 testes falharam em `SqliteFolhaRepository.test.ts` por `NODE_MODULE_VERSION` incompatível (`better-sqlite3` ainda compilado para ABI 128 do Electron, deixado assim pelo `pnpm dev` usado no Passo 3) — problema de ambiente conhecido e documentado em `README_AMBIENTE.md`, não relacionado à mudança de código. Corrigido com `npx prebuild-install` dentro do pacote `better-sqlite3` (reconstruiu para o ABI 115 do Node local). Repetido: **36/36 testes passaram** (25 em `domain`, 11 em `infrastructure`).
* **O que foi mudado:**

  * `app-host/src/ipc/authGuard.ts`: lógica descrita no Passo 2.
  * Criado `scripts/cdp-rec0017-verify.ps1` (script de verificação reutilizável, mesmo padrão de `scripts/cdp-test.ps1` e `scripts/cdp-authguard-scan.ps1` já existentes).
  * `.dev-user-data/config.json`, poluído pelos probes dos cenários (a)/(b)/(c), foi removido ao final para deixar o ambiente de desenvolvimento limpo para o próximo `pnpm dev` (o wizard volta a rodar do zero); `.dev-user-data/banco/sudosys.db` (dado de dev, não o banco real) não foi tocado.
  * `HISTORICO_AGENTES.md` (esta entrada) e `CONTEXTO_TOTAL.md` (`REC-0017` marcada como Executado) atualizados.
  * Nenhum outro arquivo de código foi tocado. Em particular, `packages/ui/src/pages/empresas/EmpresasPage.tsx` (trabalho não commitado do Codex, visto pela primeira vez na `ACAO-0030`) e qualquer diretório `.codex-pnpm-*-copy/` continuam fora do escopo desta ação — não foram lidos em detalhe, alterados nem incluídos no `git add`.
* **Por que foi feito:**

  * Fechar, na prática e com teste real, o gap crítico de autenticação encontrado e confirmado na varredura sistemática da `ACAO-0030` — mesma classe de risco da `REC-0002` original (canal público que deveria ter deixado de ser acessível depois de um certo estado do sistema).
* **Arquivos envolvidos:**

  * `app-host/src/ipc/authGuard.ts`
  * `app-host/src/setup/configManager.ts` — lido (import de `isInitialized`), não alterado.
  * `app-host/src/main.ts` — lido para confirmar a ordem de instalação do gate, não alterado.
  * Criado: `scripts/cdp-rec0017-verify.ps1`.
  * Atualizados: `HISTORICO_AGENTES.md`, `CONTEXTO_TOTAL.md`.
* **Validações executadas:**

  * `git status -sb` conferido antes de iniciar e antes do commit, para garantir que `EmpresasPage.tsx` e quaisquer `.codex-pnpm-*-copy/` não entrassem no `git add`.
  * `pnpm --filter @sudo-sys/app-host typecheck` e `pnpm typecheck` (raiz, todos os workspaces): passou.
  * `pnpm test` (raiz): 36/36 após corrigir o ABI de `better-sqlite3` para Node local.
  * Testes reais via IPC direto (CDP), três cenários descritos no Passo 3.
  * Processos `electron.exe`/`node.exe` iniciados por esta ação foram encerrados por PID específico ao final de cada rodada (não foi usado `taskkill` genérico por nome de imagem).
* **Riscos ou observações:**

  * `isInitialized()` agora é chamada em toda invocação de `setup:save-config`/`setup:get-config` (leitura de arquivo síncrona) — custo desprezível dado que são canais de baixa frequência (wizard inicial e ajustes administrativos pontuais), não um caminho quente do sistema.
  * O comportamento de `must_change_password` bloqueando `setup:save-config`/`setup:get-config` mesmo para admin recém-logado é intencional e consistente com a extensão da `REC-0002` (`ACAO-0027`) — não foi criada uma exceção nova para esses canais entrarem em `CANAIS_PERMITIDOS_COM_TROCA_PENDENTE`, porque não há necessidade funcional conhecida de mexer em config antes de trocar a senha obrigatória.
  * `REC-0018` (mecanismo próprio de `auth:register`) e `REC-0011` (matriz de RBAC) permanecem como estavam — fora do escopo desta tarefa.
  * `packages/ui/src/pages/empresas/EmpresasPage.tsx` continua com trabalho não commitado do Codex (`ACAO-0031`, registrado nesta mesma sessão do arquivo); esta ação não interferiu nele.
* **Recomendações deixadas para próximos agentes:**

  * Nenhuma REC nova. `REC-0017` marcada como Executado em `CONTEXTO_TOTAL.md`.
* **Próxima ação sugerida:**

  * Confirmar com o Codex se `EmpresasPage.tsx` já pode ser commitado/enviado, já que o push dele ficou pendente por restrição de ambiente (relatado na `ACAO-0031`). Depois, avaliar `REC-0018` e `REC-0011` como próximas tarefas de segurança, se priorizadas pelo usuário.
