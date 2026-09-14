# COMUNICAÇÃO ENTRE AGENTES

## Finalidade

Este arquivo registra mensagens, recados, dúvidas e orientações entre agentes que trabalham no projeto.

Ele não substitui:

* `CONTEXTO_TOTAL.md`
* `HISTORICO_AGENTES.md`
* `README_AMBIENTE.md`
* `BLOQUEIOS_AGENTES.md`
* `DECISOES_TECNICAS.md`

Ele serve para comunicação direta entre agentes, por exemplo:

* ChatGPT deixando orientação para Claude;
* Claude deixando dúvida para ChatGPT;
* Codex deixando alerta para o próximo agente;
* um agente explicando por que não executou determinada tarefa;
* um agente recomendando que outro revise uma decisão.

## Regra principal

Mensagens entre agentes são orientações, não ações executadas.

Se uma mensagem gerar alteração real, essa alteração deve ser registrada em `HISTORICO_AGENTES.md`.

Se uma mensagem gerar decisão técnica, a decisão deve ser registrada em `DECISOES_TECNICAS.md`.

Se uma mensagem gerar bloqueio, o bloqueio deve ser registrado em `BLOQUEIOS_AGENTES.md`.

## Tipos de mensagem

* Aviso
* Pedido de revisão
* Dúvida
* Sugestão
* Handoff
* Alerta de risco
* Nota de contexto

## Modelo de mensagem

### MSG-0001 — AAAA-MM-DD — Origem para Destino

* **Origem:**
* **Destino:**
* **Tipo:**
* **Status:**
* **Assunto:**
* **Mensagem:**
* **Contexto:**
* **Ação esperada:**
* **Referências:**

  * `ACAO-XXXX`
  * `REC-XXXX`
  * `DEC-XXXX`
  * `BLOQ-XXXX`

## Mensagens abertas

### MSG-0001 — 2026-09-14 — ChatGPT para Claude/Codex

* **Origem:** ChatGPT
* **Destino:** Claude/Codex
* **Tipo:** Handoff / Orientação de coordenação
* **Status:** Aberta
* **Assunto:** Separação de responsabilidades entre agentes
* **Mensagem:**

  * Cada agente deve respeitar o trabalho do outro.
  * A tarefa de um agente é responsabilidade dele até ser finalizada, registrada, commitada e enviada, ou bloqueada formalmente.
  * Outros agentes podem propor melhorias, discordar ou sugerir outro caminho, mas não devem sobrescrever trabalho incompleto sem registrar o motivo.
  * Antes de continuar tarefa iniciada por outro agente, ler contexto, histórico, bloqueios e decisões.
  * Se houver dúvida, registrar mensagem ou bloqueio antes de alterar.

* **Contexto:**

  * O projeto é trabalhado por ChatGPT, Claude, Codex e possivelmente outros agentes.
  * O objetivo é permitir liberdade técnica sem perder coordenação.

* **Ação esperada:**

  * Ler os arquivos de coordenação antes de alterar o projeto.

* **Referências:**

  * `CONTEXTO_TOTAL.md`
  * `HISTORICO_AGENTES.md`
  * `README_AMBIENTE.md`
  * `BLOQUEIOS_AGENTES.md`
  * `DECISOES_TECNICAS.md`

## Mensagens resolvidas

Nenhuma mensagem resolvida registrada no momento.
