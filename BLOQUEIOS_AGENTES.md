# BLOQUEIOS DE AGENTES DO PROJETO

## Finalidade

Este arquivo registra áreas, módulos, arquivos, decisões ou tarefas que não devem ser alterados por agentes sem verificação prévia.

Ele existe para evitar:

* sobrescrever trabalho incompleto;
* mexer em módulo em andamento;
* desfazer decisão pendente;
* misturar tarefas de agentes diferentes;
* continuar uma tarefa sem entender o estado deixado.

## Como usar

Antes de alterar qualquer arquivo relevante, todo agente deve verificar se existe bloqueio ativo relacionado.

Bloqueios resolvidos não devem ser apagados. Devem ser marcados como "Resolvido", preservando o histórico.

## Status possíveis

* Ativo
* Resolvido
* Pausado
* Aguardando decisão do usuário
* A confirmar

## Modelo de bloqueio

### BLOQ-0001 — AAAA-MM-DD — Nome do agente

* **Status:**
* **Autor do bloqueio:**
* **Área afetada:**
* **Arquivos afetados:**
* **Motivo do bloqueio:**
* **O que estava sendo feito:**
* **O que já foi feito:**
* **O que ainda falta:**
* **Riscos se outro agente mexer:**
* **Quem pode continuar:**
* **Condição para desbloquear:**
* **Próxima ação segura:**
* **Referências:**

  * `ACAO-XXXX`
  * `REC-XXXX`
  * `DEC-XXXX`

## Bloqueios ativos

Nenhum bloqueio ativo registrado no momento.

## Bloqueios resolvidos

Nenhum bloqueio resolvido registrado no momento.
