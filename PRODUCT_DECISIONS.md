# Decisões de produto — SUDO SYS 2.0

Este documento consolida somente decisões funcionais reconstruídas do zero. Detalhes não expressamente fechados permanecem abertos, mesmo quando existe comportamento semelhante no legado.

## PD-001 — Escritório, licença e isolamento

- **[FECHADO]** Escritório é a unidade raiz de isolamento do produto, ainda que o nome técnico futuro possa ser tenant/workspace.
- **[FECHADO]** Um Escritório pode conter várias empresas. A mesma empresa e o mesmo CNPJ podem existir em Escritórios diferentes sem comunicação automática entre eles.
- **[FECHADO]** Dados, configurações, usuários, pessoas, vínculos, folhas, documentos, rubricas e históricos são isolados por Escritório.
- **[PARCIALMENTE FECHADO]** A licença se vincula ao Escritório e participa da configuração da topologia/oferta. Regras de ativação, planos, contingência e enforcement não foram definidas.
- **[ABERTO]** Forma técnica do isolamento: banco, schema, coluna de tenant, instalação separada ou combinação.

## PD-002 — Empresas, estabelecimentos, filiais e grupos

- **[FECHADO]** Cada empresa/estabelecimento mantém identidade, cadastro, obrigações, folhas e históricos próprios.
- **[FECHADO]** Matriz e filial são reconhecidas pela raiz comum do CNPJ; isso não equivale a grupo econômico.
- **[FECHADO]** Grupo econômico é uma relação declarada e própria, sem eleger artificialmente uma empresa como dona.
- **[FECHADO]** Relação existente não significa permissão irrestrita de compartilhamento. Trânsito de trabalhadores, reaproveitamento cadastral, relatórios e documentos devem ser controláveis.
- **[PARCIALMENTE FECHADO]** Agrupamentos operacionais também devem ser possíveis sem afirmar uma natureza jurídica inexistente.
- **[ABERTO]** Regras detalhadas de compartilhamento, transferência, consolidação e permissões entre empresas relacionadas.

## PD-003 — Pessoa e vínculos/relações

- **[FECHADO]** Pessoa não é sinônimo de funcionário. Dados pessoais são distintos dos vínculos/relações mantidos com empresas/estabelecimentos.
- **[FECHADO]** Uma pessoa pode possuir relações sucessivas ou simultâneas, como CLT, autônomo, prestador PF, prestador PJ e pró-labore, conforme categorias futuramente aprovadas.
- **[FECHADO]** Vínculos possuem período, natureza e contexto próprios; encerrar um vínculo não apaga a pessoa nem seu histórico.
- **[PARCIALMENTE FECHADO]** Deve ser possível favorecer o trânsito/reaproveitamento entre empresas relacionadas sem fundir históricos.
- **[ABERTO]** Escopo exato do cadastro de Pessoa dentro do Escritório, regras de deduplicação por CPF, consentimento/LGPD e visibilidade entre empresas.

## PD-004 — Tabelas empresariais e legais

- **[FECHADO]** Tabelas e parâmetros que mudam no tempo devem possuir vigência e permitir reprodução histórica.
- **[FECHADO]** Valores do passado não podem ser reinterpretados silenciosamente por uma tabela atual.
- **[PARCIALMENTE FECHADO]** O produto terá tabelas oficiais/internas e tabelas/configurações empresariais onde a operação exigir.
- **[ABERTO]** Governança de publicação, precedência, atualização, correção retroativa e customização das tabelas.

## PD-005 — Rubricas, vigências e incidências

- **[FECHADO]** Rubrica é uma unidade configurável de cálculo/escrituração, com código, identificação, natureza, comportamento e histórico.
- **[FECHADO]** Alterações relevantes usam vigência/versionamento; não se sobrescreve a definição histórica já usada.
- **[FECHADO]** Incidências legais e financeiras são explícitas e auditáveis.
- **[FECHADO]** O sistema sugere padrões e alerta divergências, mas segue o princípio de conformidade assistiva para usuários autorizados.
- **[PARCIALMENTE FECHADO]** Rubricas podem ser padrão, empresariais ou aplicáveis a contextos específicos; herança, sobrescrita e catálogo oficial ainda não foram detalhados.
- **[ABERTO]** Taxonomia completa de incidências, precedência e processo de homologação de rubricas.

## PD-006 — Fórmulas e catálogo de variáveis

- **[FECHADO]** O motor oferece `V(código)` para obter valor e `R(código)` para obter referência/quantidade de outra rubrica.
- **[FECHADO]** Há um catálogo controlado de variáveis por identificadores compactos (`A` a `Z`, seguindo para `AA`, `AB` etc.), cada qual com significado documentado.
- **[FECHADO]** Fórmulas devem ser determinísticas, validáveis, explicáveis e protegidas contra ciclos/dependências inválidas.
- **[FECHADO]** O usuário precisa consultar a memória de cálculo e a origem de valores usados.
- **[PARCIALMENTE FECHADO]** Funções adicionais, tipos, precisão, arredondamento, ordem de avaliação e escopos de variáveis serão especificados antes da implementação.
- **[ABERTO]** Gramática formal, sandbox, versionamento do motor e política de compatibilidade.

## PD-007 — Editor compacto e descritivo

- **[FECHADO]** A mesma regra deve poder ser vista/editada em forma compacta para usuários experientes e em forma descritiva/assistida para compreensão.
- **[FECHADO]** As duas representações não podem divergir; devem mapear para uma única expressão canônica.
- **[ABERTO]** Modelo de edição, validação incremental, autocomplete, mensagens de erro e round-trip entre representações.

## PD-008 — Acumuladores e relações financeiras

- **[FECHADO]** O sistema precisa representar bases, acumuladores e relações financeiras entre rubricas/processamentos sem depender de totais opacos.
- **[FECHADO]** A composição de cada acumulador deve ser rastreável e respeitar competência e vigência.
- **[PARCIALMENTE FECHADO]** Relações poderão apoiar bases legais, médias, provisões, encargos e relatórios.
- **[ABERTO]** Modelo formal de acumuladores, eventos de atualização, fechamento/reabertura e ajustes retroativos.

## PD-009 — Médias legais

- **[FECHADO]** Médias legais são um mecanismo explícito e reutilizável, não fórmulas escondidas em cada processo.
- **[FECHADO]** A memória deve revelar períodos, verbas, descartes, divisores e regras usados.
- **[PARCIALMENTE FECHADO]** Férias, 13º e rescisão poderão consumir mecanismos de média compartilhados, respeitando suas regras próprias.
- **[ABERTO]** Catálogo de estratégias, precedência entre lei/CCT/configuração e tratamento de afastamentos, admissões e lacunas.

## PD-010 — Folha: Movimento → Cálculo

- **[FECHADO]** O fluxo conceitual separa Movimento de Cálculo.
- **[FECHADO]** Movimento reúne fatos e lançamentos da competência; Cálculo produz resultados, bases, incidências, alertas e memória.
- **[FECHADO]** Recalcular não pode apagar a origem do movimento nem tornar o resultado inexplicável.
- **[PARCIALMENTE FECHADO]** A tela de confecção da folha é a tela crítica para validar UX e produtividade.
- **[ABERTO]** Estados da competência, fechamento/reabertura, idempotência, concorrência, recálculo parcial e retificações.

## PD-011 — Férias

- **[FECHADO]** Férias constituem processo próprio, integrado à pessoa/vínculo, folha, médias, documentos e histórico.
- **[FECHADO]** Períodos aquisitivos, concessivos, gozo, abono e pagamentos precisam permanecer rastreáveis por vigência.
- **[ABERTO]** Fluxo detalhado, parcelamento, coletivas, antecipações, cancelamentos, integração com ponto/eSocial e casos especiais.

## PD-012 — Rescisão

- **[FECHADO]** Rescisão constitui processo próprio e auditável, baseado no vínculo, históricos, rubricas, médias e parâmetros vigentes.
- **[FECHADO]** Resultado deve apresentar memória de cálculo e preservar o fechamento histórico.
- **[ABERTO]** Motivos, etapas, reversão, complementares, integrações, eventos e matriz completa de regras.

## PD-013 — 13º salário

- **[FECHADO]** O 13º é processo próprio, não apenas uma rubrica comum.
- **[FECHADO]** Deve integrar avos, adiantamentos, folha, rescisão, médias, incidências e histórico.
- **[ABERTO]** Fluxo de parcelas, competências, ajustes e casos especiais.

## PD-014 — Horários, jornadas, escalas e ponto manual

- **[FECHADO]** Horário, jornada e escala são conceitos relacionados, porém distintos e historizados.
- **[FECHADO]** O produto suporta ponto manual/operacional e geração de documentos/espelhos quando aplicável.
- **[FECHADO]** Seleção de horário é exemplo aprovado de janela contextual com prévia, sem abandonar o cadastro em andamento.
- **[PARCIALMENTE FECHADO]** Ponto poderá alimentar movimentos e cálculos após validação humana e regras definidas.
- **[ABERTO]** Captura automática, banco de horas, tolerâncias, marcações, apuração, dispositivos e requisitos regulatórios.

## PD-015 — Benefícios

- **[FECHADO]** Benefícios são cadastros/regras reutilizáveis vinculáveis a pessoas ou vínculos, com vigência e reflexos rastreáveis.
- **[PARCIALMENTE FECHADO]** Podem originar proventos, descontos, custos e documentos.
- **[ABERTO]** Catálogo inicial, elegibilidade, coparticipação, integração com folha e importações.

## PD-016 — Sindicato e CCT

- **[FECHADO]** Sindicato e instrumentos coletivos possuem vigência e contexto de aplicação.
- **[FECHADO]** Regras coletivas precisam ser rastreáveis até a fonte aplicada ao cálculo/processo.
- **[PARCIALMENTE FECHADO]** O sistema deve ajudar a sugerir/aplicar regras sem substituir a decisão profissional.
- **[ABERTO]** Critérios de enquadramento, precedência, conflitos entre instrumentos, ingestão e revisão de conteúdo.

## PD-017 — eSocial

- **[FECHADO]** eSocial é módulo próprio integrado aos domínios, não fonte primária de verdade do produto.
- **[FECHADO]** Eventos, versões, payloads, recibos, retornos e erros precisam de histórico e rastreabilidade.
- **[ABERTO]** Escopo inicial de eventos, filas, certificados, contingência, retificação, fechamento e convivência de leiautes.

## PD-018 — Permissões e perfis

- **[FECHADO]** Perfis-base: LOW, MEDIUM, HIGH e MASTER.
- **[FECHADO]** Perfis podem ser copiados e personalizados; os níveis são pontos de partida, não o único mecanismo de autorização.
- **[FECHADO]** Ações sensíveis e prosseguimentos após alertas relevantes exigem autorização e auditoria.
- **[PARCIALMENTE FECHADO]** Permissões devem alcançar módulos, ações e contextos de dados.
- **[ABERTO]** Matriz completa, herança, negações, escopo por empresa, segregação de funções e recuperação do MASTER.

## PD-019 — Histórico, vigências, auditoria e logs

- **[FECHADO]** Mudanças relevantes preservam autor, data/hora, antes/depois, contexto e justificativa quando necessária.
- **[FECHADO]** Versionamento por vigência é preferível a sobrescrever fatos relevantes.
- **[FECHADO]** Auditoria funcional e logs técnicos são conceitos diferentes, ambos necessários.
- **[FECHADO]** Prosseguir após alerta relevante deixa trilha explícita.
- **[ABERTO]** Retenção, imutabilidade, acesso, anonimização, exportação, correlação e conteúdo proibido nos logs.

## PD-020 — TecnoFormas, documentos e relatórios

- **[FECHADO]** TecnoFormas é a capacidade de criar/compor modelos de documentos e relatórios do produto.
- **[FECHADO]** Documentos gerados precisam identificar modelo/versão, dados de origem e momento da geração.
- **[FECHADO]** Relatórios e documentos devem respeitar permissões, contexto do Escritório e histórico.
- **[PARCIALMENTE FECHADO]** O editor deverá oferecer composição visual rica sem mover regras trabalhistas para a UI.
- **[ABERTO]** Formato de template, componentes, expressões, renderização, assinatura, fontes, PDF, importação/exportação e versionamento.

## Regra transversal

**[FECHADO]** Nada neste documento autoriza reutilizar a implementação antiga como especificação. Reaproveitamento deve ser proposto, avaliado e aprovado separadamente.
