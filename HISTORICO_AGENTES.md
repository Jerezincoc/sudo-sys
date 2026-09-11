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

- **Status:** Não executado
- **Recomendação:** Remover credencial padrão fixa e exigir criação ou troca de senha no primeiro uso.
- **Motivo:** Existe risco de segurança por credenciais conhecidas.
- **Prioridade:** Crítica
- **Ação relacionada:** `ACAO-0001`

### REC-0003 — 2026-09-11 — Codex

- **Status:** Não executado
- **Recomendação:** Criar testes automatizados para cálculos trabalhistas críticos.
- **Motivo:** Rescisão, férias, ponto, INSS e IRRF têm risco funcional e fiscal.
- **Prioridade:** Crítica
- **Ação relacionada:** `ACAO-0001`

### REC-0004 — 2026-09-11 — Codex

- **Status:** Não executado
- **Recomendação:** Tornar o recálculo da folha transacional e idempotente.
- **Motivo:** Evitar dados parcialmente atualizados em caso de erro.
- **Prioridade:** Alta
- **Ação relacionada:** `ACAO-0001`

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

- **Status:** Não executado
- **Recomendação:** Finalizar a higiene e os assets da distribuição Electron, copiando o CSV de CBO e o ícone, removendo fontes TypeScript excedentes do ASAR e validando o instalador completo.
- **Motivo:** A distribuição já resolve os pacotes por `dist`, mas ainda inclui fontes desnecessárias e possui assets e etapas finais de empacotamento pendentes.
- **Prioridade:** Alta
- **Ação relacionada:** `ACAO-0006`

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
