# DECISÕES TÉCNICAS DO PROJETO

## Finalidade

Este arquivo registra decisões técnicas vigentes do projeto.

Ele existe para evitar que decisões importantes fiquem perdidas dentro do `HISTORICO_AGENTES.md`.

O `HISTORICO_AGENTES.md` continua sendo a fonte histórica completa. Este arquivo é um índice das decisões que ainda importam para o estado atual.

## Regras

* Não apagar decisões antigas.
* Se uma decisão deixar de valer, marcar como "Substituída" ou "Cancelada".
* Toda decisão deve ter ID.
* Toda decisão deve indicar origem, data, motivo e impacto.
* Se a decisão veio de uma ACAO ou REC, referenciar.
* Não registrar sugestão como decisão.
* Sugestões devem ficar como REC ou mensagem em `COMUNICACAO_AGENTES.md`.

## Status possíveis

* Ativa
* Provisória
* Substituída
* Cancelada
* A confirmar

## Modelo de decisão

### DEC-0001 — Título da decisão

* **Status:**
* **Data:**
* **Autor/origem:**
* **Decisão:**
* **Motivo:**
* **Impacto:**
* **Riscos:**
* **Quando revisar:**
* **Referências:**

  * `ACAO-XXXX`
  * `REC-XXXX`

## Decisões vigentes

### DEC-0001 — Assumir temporariamente o projeto como monólito modular Electron

* **Status:** Ativa
* **Data:** 2026-09-11
* **Autor/origem:** Codex
* **Decisão:** Assumir temporariamente o projeto como monólito modular Electron.
* **Motivo:** A Clean Architecture existe parcialmente, mas não governa o runtime atual.
* **Impacto:** Priorizar estabilização, handlers mais finos, serviços por módulo, repositórios encapsulados e contratos IPC validados em runtime.
* **Riscos:** A estrutura física pode sugerir uma arquitetura mais madura do que a realmente executada e levar a trabalho duplicado ou feito na camada errada.
* **Quando revisar:** A confirmar.
* **Referências:**

  * `ACAO-0001`

### DEC-0002 — Evitar grandes refatorações antes da estabilização

* **Status:** Ativa
* **Data:** 2026-09-11
* **Autor/origem:** Codex
* **Decisão:** Não realizar refatorações grandes antes de corrigir riscos críticos, build, segurança e testes.
* **Motivo:** Reduzir o risco de quebrar comportamento existente.
* **Impacto:** Mudanças devem ser pequenas, rastreáveis e registradas.
* **Riscos:** A confirmar.
* **Quando revisar:** Após corrigir os riscos críticos e estabelecer validações suficientes de build, segurança e testes.
* **Referências:**

  * `ACAO-0001`

### DEC-0003 — Baseline provisório de Node e pnpm

* **Status:** Provisória
* **Data:** 2026-09-11
* **Autor/origem:** Codex
* **Decisão:** Usar Node 20.20.2 e pnpm 9.15.9 como baseline de compatibilidade do ambiente atual.
* **Motivo:** Essa combinação foi validada com instalação congelada, Electron 32.3.3, preload e `better-sqlite3`; trocar a linha do Node durante a estabilização ampliaria o escopo.
* **Impacto:** `.node-version`, `packageManager` e `engines` exigem essas versões.
* **Riscos:** Node 20 está fora de suporte; `@types/node` 22.19.19 permanece desalinhado com os runtimes Node 20; dependências nativas exigem atenção ao ABI do Node e do Electron.
* **Quando revisar:** Após estabilizar o build, por meio da migração controlada prevista na `REC-0008`.
* **Referências:**

  * `ACAO-0005`
  * `REC-0008`

### DEC-0004 — Formato de módulos dos pacotes internos

* **Status:** Substituída
* **Data:** 2026-09-11
* **Autor/origem:** Codex
* **Decisão:** Publicar `@sudo-sys/shared` como ESM e `@sudo-sys/domain`, `@sudo-sys/application` e `@sudo-sys/infrastructure` como CommonJS na configuração então vigente.
* **Motivo:** O renderer Vite consome exports nomeados de `shared`, enquanto o processo principal Electron emitido usa `require()`.
* **Impacto:** Os consumidores usam as APIs públicas compiladas em `dist`; mudanças de formato exigem validação conjunta da UI, host, desenvolvimento e pacote Electron. A decisão foi substituída apenas na parte que definia `@sudo-sys/domain` como CommonJS, por meio da `DEC-0005`; `shared` permanece ESM e `application`/`infrastructure` permanecem CommonJS.
* **Riscos:** Alterar o formato de um pacote sem validar todos os consumidores pode quebrar bundling ou resolução em runtime.
* **Quando revisar:** Se mudar o formato de módulos ou surgir novo consumidor entre renderer e processo principal.
* **Referências:**

  * `ACAO-0006`
  * `DEC-0005`

### DEC-0005 — Publicar o pacote domain como ESM

* **Status:** Ativa
* **Data:** 2026-09-12
* **Autor/origem:** Claude
* **Decisão:** Publicar `@sudo-sys/domain` como ESM, revisando somente a parte de `DEC-0004` específica a esse pacote. `@sudo-sys/application` e `@sudo-sys/infrastructure` continuam CommonJS.
* **Motivo:** A integração do motor de fórmulas com a UI na `ACAO-0019` mostrou que o formato CommonJS de `domain` não era resolvido corretamente pelo bundle Vite/Rollup; não existia consumidor real CommonJS desse pacote.
* **Impacto:** `packages/domain` segue o padrão ESM de `@sudo-sys/shared`, com condição `import` e configuração herdada de `ESNext`/`bundler`.
* **Riscos:** Se o `app-host`, compilado para CommonJS, passar a importar `@sudo-sys/domain` diretamente, será necessária nova validação e possivelmente um ajuste de interoperabilidade.
* **Quando revisar:** Antes de introduzir um consumidor CommonJS real de `@sudo-sys/domain`.
* **Referências:**

  * `ACAO-0019`
  * `DEC-0004`
