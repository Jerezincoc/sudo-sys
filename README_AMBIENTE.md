# README DE AMBIENTE — SUDO SYS

## 1. Finalidade deste arquivo

Este arquivo documenta o ambiente recomendado para instalar, rodar, desenvolver, testar, compilar e empacotar o SUDO SYS. Ele existe para reduzir divergências entre máquinas, desenvolvedores e agentes de IA e para evitar que um erro de ambiente seja confundido com erro de código, build ou configuração.

Antes de alterar scripts, dependências, build ou configuração, todo agente ou desenvolvedor deve ler, nesta ordem:

1. `CONTEXTO_TOTAL.md`
2. `HISTORICO_AGENTES.md`
3. `README_AMBIENTE.md`
4. `BLOQUEIOS_AGENTES.md`
5. `COMUNICACAO_AGENTES.md`
6. `DECISOES_TECNICAS.md`

Mudanças relevantes devem seguir as decisões, recomendações, bloqueios e handoffs registrados nesses arquivos. Informações não confirmadas neste documento aparecem como `A confirmar` e não devem ser tratadas como decisões já tomadas.

## 2. Resumo do projeto

- **Tipo:** aplicativo desktop Electron.
- **Stack:** Electron, React, TypeScript, Vite, SQLite, `better-sqlite3` e pnpm monorepo.
- **Banco principal:** SQLite local.
- **PostgreSQL:** é selecionável e testado no wizard, mas não é usado pelo runtime principal. O suporte real a PostgreSQL permanece não implementado ou **A confirmar** quanto ao escopo futuro.
- **Docker:** opcional e parcial. Não é recomendado como ambiente principal da aplicação neste momento.

O renderer fica em `packages/ui`; o processo principal, preload, IPC, banco e empacotamento ficam em `app-host`. Os demais pacotes internos representam contratos compartilhados e camadas arquiteturais parcialmente implementadas.

## 3. Ambiente observado

As versões abaixo foram observadas durante o diagnóstico técnico de 2026-09-11. Elas registram um ambiente em que a instalação e o build foram analisados, mas ainda não constituem versões oficiais ou definitivas do projeto.

| Componente | Versão ou ambiente observado |
|---|---|
| Sistema operacional | Windows 10, build 19045 |
| PowerShell | 5.1 |
| Node local | 20.20.2 |
| Node incorporado ao Electron | 20.18.1 |
| ABI do Node local | 115 |
| ABI do Electron | 128 |
| pnpm antes de `corepack enable` | 9.15.9 |
| pnpm selecionado pelo Corepack sem `packageManager` | 12.3.4 |
| Corepack | 0.34.6 |
| Electron | 32.3.3 |

Essas versões são observadas, não necessariamente definitivas. Uma versão funcionar em uma etapa do fluxo não garante compatibilidade com desenvolvimento, testes Node e empacotamento Electron ao mesmo tempo, especialmente por causa de dependências nativas.

O repositório define UTF-8 e finais de linha LF em `.editorconfig` e `.gitattributes`. No PowerShell 5.1, usar explicitamente UTF-8 ao ler ou gravar arquivos evita exibição ou regravação incorreta de acentos.

## 4. Versões recomendadas

- **Node oficial provisório:** 20.20.2.
- **pnpm oficial provisório:** 9.15.9.
- **Campo `packageManager` no `package.json`:** `pnpm@9.15.9`.
- **`.node-version`:** criado com `20.20.2`.
- **`engines.node`:** `20.20.2`.
- **`engines.pnpm`:** `9.15.9`.
- **`@types/node`:** 22.19.19, ainda desalinhado com o Node local 20.20.2 e com o Node 20.18.1 incorporado ao Electron.

Essas versões foram fixadas pela `ACAO-0005` como baseline provisório de compatibilidade. Elas já haviam passado pela instalação congelada, geração do preload, rebuild de `better-sqlite3` e execução do Electron no Windows 10.

Node 20 encerrou o suporte oficial em 2026-04-30, conforme o [calendário oficial do projeto Node.js](https://github.com/nodejs/Release/blob/main/schedule.json). Por isso, 20.20.2 não é a escolha definitiva de longo prazo. A migração para uma linha LTS suportada exige validação separada com Electron, dependências nativas, build e distribuição e não deve ser feita como upgrade em lote.

Antes de fixar versões, deve-se validar ao menos:

- instalação limpa;
- execução em desenvolvimento;
- typecheck e build;
- carregamento de `better-sqlite3` no Electron;
- execução real do pacote distribuído;
- requisitos dos sistemas operacionais que serão suportados.

Não usar outra versão de Node ou pnpm sem registrar e repetir as validações relevantes. Uma divergência pode mudar o ABI nativo, o comportamento do Corepack e a interpretação das configurações do pnpm.

Na validação limpa, `corepack enable` seguido de `pnpm` selecionou e baixou automaticamente pnpm 12.3.4. Essa versão aceitou o lockfile, mas avisou que não lê mais `pnpm.onlyBuiltDependencies` no `package.json`. Isso confirma que deixar `packageManager` aberto pode mudar o comportamento da instalação, especialmente dos scripts de dependências nativas.

Ao final da validação anterior, o pnpm global da máquina foi restaurado para 9.15.9. A `ACAO-0005` registrou essa versão no projeto para impedir nova seleção dinâmica pelo Corepack.

## 5. Gerenciador de pacotes

O projeto usa pnpm.

- Existe `pnpm-lock.yaml` com `lockfileVersion: 9.0`.
- Existe `pnpm-workspace.yaml`.
- Os pacotes internos usam o protocolo `workspace:*`.
- Não foram identificados lockfiles de npm, Yarn ou Bun.

Não usar:

- `npm install`;
- Yarn;
- Bun.

Usar preferencialmente:

```powershell
corepack enable
pnpm --version
pnpm install --frozen-lockfile
```

`pnpm --version` deve retornar `9.15.9`. O campo `packageManager` permite que o Corepack selecione essa versão. `--frozen-lockfile` evita que uma instalação altere silenciosamente a resolução registrada.

Não usar `npm install`, Yarn ou Bun, pois isso ignora o padrão do workspace e pode criar resolução ou lockfile concorrente.

## 6. Scripts conhecidos

| Comando | Estado atual |
|---|---|
| `pnpm install --frozen-lockfile` | Passou com Node 20.20.2 e pnpm 9.15.9; a validação após fixar versões terminou sem alterar o lockfile. |
| `pnpm dev` | Passou após a `ACAO-0004`: gera o preload, reconstrói `better-sqlite3` para Electron e usa `userData` exclusivo de desenvolvimento. |
| `pnpm build` | Passou após a `ACAO-0006`; compila os quatro pacotes internos antes da UI e do `app-host`. |
| `pnpm dist` | O fluxo equivalente em saída isolada gerou o pacote e o instalador NSIS completo na `ACAO-0020` (ação local renumerada de `ACAO-0014`). A saída padrão ainda pode falhar enquanto o `app.asar` antigo estiver bloqueado pelo Windows; a instalação efetiva do NSIS permanece **A confirmar**. |
| `pnpm typecheck` | Passou após a `ACAO-0006`; o fluxo compila os pacotes internos antes de verificar os workspaces. |
| `pnpm lint` | Falso positivo: retorna sucesso sem executar lint real. |
| `pnpm test` | Existe desde a `ACAO-0015` e executa as suítes de `@sudo-sys/domain` e `@sudo-sys/infrastructure`; na `ACAO-0019`, totalizava 36 testes. |

Scripts adicionais identificados:

- `pnpm --filter @sudo-sys/ui dev`: inicia o Vite.
- `pnpm --filter @sudo-sys/ui build`: executa TypeScript e build do Vite.
- `pnpm --filter @sudo-sys/ui preview`: abre o preview do renderer.
- `pnpm --filter @sudo-sys/app-host electron:dev`: inicia o Electron de desenvolvimento.
- `pnpm --filter @sudo-sys/app-host electron:dev:prepare`: compila os pacotes internos, gera o preload e reconstrói `better-sqlite3` para a ABI do Electron.
- `pnpm --filter @sudo-sys/app-host electron:dev:preload`: executa o `tsc` do `app-host` com emissão mesmo diante de erro; apesar do nome, o projeto TypeScript do host é compilado, não apenas um arquivo isolado.
- `pnpm build:packages`: compila, nesta ordem, `shared`, `domain`, `application` e `infrastructure`.
- `pnpm --filter @sudo-sys/app-host build`: compila o `app-host`.
- `pnpm --filter @sudo-sys/app-host dist`: chama `electron-builder`.

Um build concluído indica apenas que as etapas configuradas terminaram. Ele não comprova que o processo principal inicia, que o preload carrega, que os módulos nativos têm o ABI correto nem que o executável empacotado funciona.

## 7. Desenvolvimento local

O comando `pnpm dev` inicia duas tarefas coordenadas:

1. Vite para o renderer, na porta 5173.
2. Electron após a URL do Vite responder.

O bootstrap `app-host/electron-dev.cjs` registra `tsx/cjs` antes de carregar `src/main`. Isso permite que o desenvolvimento execute arquivos TypeScript diretamente e pode mascarar problemas que aparecem apenas na distribuição, onde o runtime depende de JavaScript compilado.

O main process de desenvolvimento procura o preload em `app-host/dist/main/preload.js`. A instalação de dependências não produz esse arquivo. Desde a `ACAO-0004`, `pnpm dev` chama automaticamente a preparação do host antes de abrir o Electron.

Existe o comando:

```powershell
pnpm --filter @sudo-sys/app-host electron:dev:preload
```

O comando acima gera `app-host/dist/main/preload.js`, mas não precisa mais ser executado manualmente no fluxo normal.

O script `electron:dev:prepare` executa, nesta ordem:

```powershell
pnpm -w run build:packages
pnpm run electron:dev:preload
pnpm exec electron-rebuild -f -w better-sqlite3
```

Assim, uma instalação preparada para o Node local ABI 115 é reconstruída para o Electron ABI 128 antes da carga do banco. O comando `pnpm dev` validado abriu Vite, Electron e a rota `http://localhost:5173/#/setup` sem erro de ABI, preload, IPC ou banco.

Antes de tratar uma falha em `pnpm dev` como bug de código, verificar:

- se `app-host/dist/main/preload.js` existe;
- se foi produzido pelo fluxo atual do projeto;
- se o erro ocorre antes ou depois de o preload ser carregado;
- se `better-sqlite3` está preparado para o ABI do Electron.

Não executar correções improvisadas no código para compensar um artefato de build ausente.

## 8. Build e distribuição Electron

O aplicativo de desenvolvimento e o aplicativo empacotado usam mecanismos diferentes:

- **Desenvolvimento:** `tsx/cjs` permite carregar `.ts` diretamente.
- **Build:** o `app-host` é compilado para CommonJS em `app-host/dist/main`.
- **Distribuição:** o Electron carrega JavaScript compilado e dependências empacotadas no ASAR.

O build pode passar e o executável falhar porque o TypeScript consegue localizar tipos e fontes no workspace durante a compilação, mas o runtime do Electron precisa resolver JavaScript executável.

Desde a `ACAO-0006`, os pacotes internos possuem build explícito e API pública:

- `@sudo-sys/shared` gera ESM em `dist`, necessário para os imports nomeados usados pelo renderer.
- `@sudo-sys/domain` gera ESM em `dist` desde a `ACAO-0019`, para consumo pelo bundle Vite da UI; `@sudo-sys/application` e `@sudo-sys/infrastructure` continuam gerando CommonJS, compatível com o processo principal atual.
- Os manifests apontam `main`, `types` e `exports` para `dist` e declaram `files: ["dist"]`.
- O `app-host` consome `@sudo-sys/infrastructure` pela raiz pública. Imports entre pacotes usando `@sudo-sys/*/src/...` não devem ser criados.
- `pnpm build` e `pnpm typecheck` executam `pnpm build:packages` antes dos workspaces consumidores.

As validações da `ACAO-0006` confirmaram que os `require()` emitidos usam `@sudo-sys/infrastructure`, que os quatro pacotes resolvem para `dist/index.js` e que não há imports por `/src` no código-fonte nem no JavaScript gerado. O pacote de diretório alternativo abriu `#/setup` a partir do `app.asar`, sem erro de módulo, preload ou ABI.

Desde a `ACAO-0020` (ação local originalmente registrada como `ACAO-0014`), a configuração `build.files` também:

- copia `app-host/src/data/cbo_lista.csv` para `dist/main/data/cbo_lista.csv` dentro do ASAR, exatamente no caminho esperado pela migration `023_cbo_completo`;
- exclui os diretórios `src` dos quatro workspaces publicados por `dist`;
- exclui arquivos `.ts` e `.tsx` restantes das dependências empacotadas.

O ASAR final continha zero arquivos `.ts`/`.tsx`, zero diretórios `src` dos workspaces e zero imports JavaScript para `@sudo-sys/*/src`. O CSV empacotado tinha 99.372 bytes e SHA-256 idêntico ao arquivo de origem. Em um `userData` temporário novo, o aplicativo abriu `#/setup` e a tabela `cbo` recebeu 2.495 registros.

Comandos usados para validar o fluxo:

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm dev
pnpm --filter @sudo-sys/app-host dist
```

Limitações restantes:

- Não existe `.ico`, `.icns`, PNG ou SVG de aplicação válido no repositório. O `electron-builder` usa o ícone padrão do Electron; um ícone oficial permanece pendente e não deve ser inventado por agentes.
- A saída padrão de `pnpm --filter @sudo-sys/app-host dist` pode falhar localmente enquanto um `app.asar` antigo permanecer bloqueado pelo Windows.
- O instalador NSIS foi gerado, mas não foi executado porque uma instalação silenciosa pode alterar atalhos, registro e uma instalação existente do usuário. A instalação real permanece **A confirmar**.
- O instalador e os executáveis não estão assinados. Assinatura Windows, assinatura e notarização macOS permanecem **A confirmar**.

Todo pacote de distribuição precisa de smoke test real. Esse teste deve abrir o aplicativo empacotado, verificar o carregamento do processo principal e do preload, abrir o SQLite e executar ao menos um fluxo IPC seguro. Apenas rodar `electron-builder` não atende essa validação.

## 9. Banco de dados e dados locais

O runtime principal usa SQLite por meio de `better-sqlite3`.

O banco é criado em:

```text
{Electron userData}/banco/sudosys.db
```

No desenvolvimento observado no Windows, sem parâmetro explícito de isolamento, o caminho foi:

```text
C:\Users\holdi\AppData\Roaming\Electron\banco\sudosys.db
```

O caminho exato em outros usuários e sistemas continua **A confirmar**.

O SQLite CLI não é obrigatório para rodar o projeto. O mecanismo é fornecido por `better-sqlite3`.

PostgreSQL pode ser selecionado e testado pelo wizard, mas a inicialização normal abre SQLite independentemente dessa escolha. PostgreSQL não deve ser tratado como banco real do runtime enquanto não houver implementação confirmada.

Alterar somente as variáveis `APPDATA` e `LOCALAPPDATA` no processo não desviou `app.getPath('userData')` no teste do Windows. Por isso, o fluxo não depende dessas variáveis.

O script atual fornece explicitamente:

```text
--user-data-dir=../.dev-user-data
```

Como o script roda a partir de `app-host`, o caminho efetivo na raiz do projeto é:

```text
<raiz-do-projeto>/.dev-user-data/banco/sudosys.db
```

Esse diretório está ignorado pelo Git. Na validação da `ACAO-0004`, o banco foi criado nesse caminho, recebeu o seed de 2.445 CBOs e o banco real em `%APPDATA%\Electron` manteve tamanho e datas inalterados. Linux e macOS continuam **A confirmar**.

> Antes de rodar testes destrutivos, seeds ou migrações, confirmar qual banco local está sendo usado e se os dados podem ser descartados.

Backups e restauração do ambiente local devem ser documentados antes de operações que alterem dados reais.

## 10. Variáveis de ambiente e arquivos sensíveis

Não foram encontrados `.env` ou `.env.example`.

A variável identificada no código é:

- `VITE_DEV_SERVER_URL`

Ela parece ser definida pelo próprio script `electron:dev`, atualmente com a URL do servidor Vite. Não criar `.env.example` apenas por causa dessa variável neste momento, pois isso poderia sugerir uma configuração manual que o fluxo atual já fornece.

O aplicativo grava `config.json` em `{Electron userData}`. Esse arquivo pode conter:

- configuração do banco;
- connection string PostgreSQL;
- dados de empresa.

Essas informações são gravadas localmente em texto puro. Nunca copiar seus valores reais para documentação, issues, logs, prompts ou commits. Se variáveis manuais obrigatórias forem introduzidas no futuro, criar `.env.example` apenas com nomes e valores fictícios.

## 11. Dependências nativas e pré-requisitos por sistema

Dependências com artefatos ou instalação específicos da plataforma:

- `better-sqlite3`;
- Electron;
- esbuild.

`better-sqlite3` tenta usar um binário pré-compilado. Se não houver binário compatível, sua instalação recorre ao `node-gyp` e pode exigir:

- Python funcional;
- compilador C/C++;
- **Windows:** Visual Studio Build Tools;
- **Linux:** `build-essential` ou equivalente;
- **macOS:** Xcode Command Line Tools.

Na máquina observada, compilador C/C++, MSBuild, CMake, Make, Ninja, Docker e SQLite CLI não foram encontrados no `PATH`. A instalação funcionou usando os artefatos disponíveis, mas um fallback de compilação nesse ambiente permanece **A confirmar**.

### Risco de ABI

Node local e Electron podem usar ABIs diferentes. No ambiente observado:

- Node local: ABI 115;
- Electron: ABI 128.

O `electron-builder` pode reconstruir dependências nativas para o ABI do Electron. Isso pode deixar `node_modules` adequado ao Electron e incompatível com o Node local. O inverso também pode ocorrer depois de uma reinstalação preparada para Node.

Foi observado que `better-sqlite3` carregou no runtime Node do Electron após reconstrução para Electron, mas falhou no Node local com erro de `NODE_MODULE_VERSION`. Na instalação limpa ocorreu o inverso: carregou no Node ABI 115 e falhou no Electron ABI 128. Esse resultado demonstra um risco real do workflow, não um motivo para trocar a biblioteca automaticamente.

Durante a instalação limpa, o script `prebuild-install || node-gyp rebuild --release` terminou sem saída de `node-gyp`; o uso do binário pré-compilado é provável, mas o ramo executado está **A confirmar**. O pnpm 12 também avisou que ignorou `pnpm.onlyBuiltDependencies` no `package.json`.

Antes de diagnosticar o erro como problema de código, registrar:

- qual comando foi executado por último;
- qual runtime está carregando o módulo;
- versões de Node e Electron;
- ABI esperado e ABI encontrado;
- sistema operacional e arquitetura.

## 12. Docker

**Docker recomendado: Parcial / opcional.**

Docker pode ajudar futuramente em:

- instalação reproduzível de dependências;
- typecheck;
- lint;
- testes unitários;
- build headless do renderer;
- CI Linux;
- serviços auxiliares, caso PostgreSQL vire dependência real.

Docker não deve ser usado agora como base única para:

- uso diário da interface Electron;
- validação real de aplicativo desktop no Windows ou macOS;
- geração confiável de instaladores desktop para todos os sistemas;
- assinatura e notarização;
- validação completa de módulos nativos em todas as plataformas.

Decisões atuais:

- **Dockerfile:** opcional, em etapa futura.
- **`.dockerignore`:** criar somente junto com um Dockerfile.
- **`docker-compose.yml`:** não criar agora.

O runtime usa SQLite e não depende de um serviço de banco separado. Um Compose com PostgreSQL neste momento documentaria uma arquitetura que a aplicação ainda não executa.

## 13. Problemas conhecidos por categoria

| Categoria | Problemas conhecidos |
|---|---|
| Ambiente | Node 20.20.2 e pnpm 9.15.9 fixados provisoriamente; Node 20 está fora de suporte; migração para LTS e validação em Linux/macOS continuam pendentes; risco de ABI nativo permanece. |
| Script | O preparo automático do `pnpm dev` foi corrigido na `ACAO-0004`; o build dos pacotes internos foi integrado na `ACAO-0006`; `pnpm test` existe desde a `ACAO-0015`; o script de lint continua ineficaz. |
| Build | Imports por `/src` e fontes TypeScript excedentes foram removidos do pacote; o CSV de CBO e o instalador NSIS foram gerados e o pacote passou no smoke test. Ícone oficial, assinatura e instalação real continuam pendentes. |
| Configuração | `pnpm lint` é falso positivo; `@types/node` 22.19.19 está desalinhado com o runtime Node 20; PostgreSQL é apenas aparente no runtime; `config.json` pode guardar informação sensível. |
| Código | `pnpm typecheck` passa; demais bugs funcionais estão registrados em `CONTEXTO_TOTAL.md` e `HISTORICO_AGENTES.md`. |

Essa classificação deve ser preservada durante o diagnóstico:

- **Problema de ambiente:** depende da máquina, runtime, ABI, ferramenta ou versão instalada.
- **Problema de build:** nasce na transformação, cópia ou empacotamento dos artefatos.
- **Problema de configuração:** resulta de scripts, manifests ou parâmetros incorretos ou incompletos.
- **Problema de código:** permanece reproduzível após o ambiente e a configuração estarem corretos.

## 14. Fluxo recomendado antes de qualquer correção

Antes de corrigir qualquer erro de execução, o agente deve verificar:

1. Está usando pnpm?
2. Rodou `pnpm install --frozen-lockfile`?
3. Está usando Node compatível?
4. Corepack está habilitado?
5. O preload necessário existe ou foi gerado?
6. O erro ocorre em desenvolvimento, no build ou no aplicativo empacotado?
7. O banco local usado é seguro para testes?
8. O problema é de ambiente, build, configuração ou código?

Também deve registrar as versões de Node, pnpm e Electron e evitar reinstalar ou reconstruir dependências nativas sem entender qual ABI o próximo comando exige.

## 15. Próximas etapas recomendadas

### Fase 1 — Documentação de ambiente

- Criar `README_AMBIENTE.md`.
- **Status:** esta etapa; concluída documentalmente em 2026-09-11 pela `ACAO-0002`.

### Fase 2 — Validar instalação limpa

- Validar `pnpm install --frozen-lockfile`.
- Validar `pnpm dev`.
- Confirmar o fluxo de preload.
- Confirmar se o banco de desenvolvimento está isolado.
- **Status:** concluída em 2026-09-11 pela `ACAO-0004`. O fluxo limpo passou, o preload e o rebuild nativo são automáticos e o banco de desenvolvimento usa `.dev-user-data`.

### Fase 3 — Fixar versões

- Criar `.node-version`.
- Definir `packageManager` no `package.json`.
- Ajustar `engines`.
- Revisar `@types/node`.
- Documentar Corepack.
- **Status:** concluída quanto à fixação na `ACAO-0005`. O alinhamento de `@types/node` e a migração futura para Node LTS suportado permanecem pendentes.

### Fase 4 — Corrigir build/distribuição

- Compilar pacotes internos.
- Remover imports por `/src`.
- Definir exports públicos.
- Garantir preload em instalação limpa.
- Copiar assets necessários.
- Criar smoke test do pacote.
- **Status:** parcial. A `ACAO-0006` concluiu o build dos pacotes internos e a `ACAO-0020` incluiu o CSV, eliminou fontes TypeScript do ASAR, gerou o instalador NSIS e repetiu o smoke test. Permanecem pendentes um ícone oficial, assinatura e execução controlada do instalador.

### Fase 5 — Avaliar Docker

- Criar Dockerfile apenas se fizer sentido para CI ou tarefas headless.
- Não criar `docker-compose.yml` enquanto não houver serviço externo real.

## 16. Referências internas

- **Estado atual do projeto:** `CONTEXTO_TOTAL.md`
- **Histórico detalhado:** `HISTORICO_AGENTES.md`
