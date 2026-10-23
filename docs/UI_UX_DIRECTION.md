# Direção de UI/UX — SUDO SYS 2.0

## Direção aprovada

**[FECHADO]** A Proposta 2 do protótipo é a referência visual e estrutural inicial. Ela é um ponto de partida para refinamento, não uma especificação pixel-perfect nem autorização para copiar código.

**[FECHADO]** O SUDO SYS é um workspace profissional híbrido:

- **abas de trabalho** preservam atividades independentes em andamento;
- **janelas contextuais/flutuantes internas** selecionam, consultam ou editam algo ligado ao trabalho atual;
- **painéis laterais não modais** oferecem consulta rápida e podem encaminhar para uma aba completa.

Regra mental: **painel = consulta rápida; janela = contexto; aba = trabalho completo**.

## Princípios de experiência

- **[FECHADO]** Desktop-first, orientado a teclado e produtividade durante jornadas longas.
- **[FECHADO]** ERP denso, moderno, legível e de baixa fadiga visual.
- **[FECHADO]** Hierarquia visual forte, tabelas excelentes, ações previsíveis e informação simultânea suficiente.
- **[FECHADO]** Cores comunicam estado, risco e ação; não servem apenas como decoração.
- **[FECHADO]** Evitar aparência genérica de SaaS, dashboards decorativos, excesso de cards, espaços vazios e componentes gigantes.
- **[FECHADO]** Acessibilidade, foco, navegação por teclado, contraste e estados devem fazer parte do Design System.
- **[PARCIALMENTE FECHADO]** O workspace poderá preservar/restaurar a sessão; comportamento e segurança dessa restauração ainda precisam de decisão.

## Design System e temas

- **[FECHADO]** O produto terá Design System próprio.
- **[FECHADO]** Temas serão construídos por tokens sem duplicar componentes.
- **[FECHADO]** Estrutura e ergonomia vêm antes do polimento de cores.
- **[PARCIALMENTE FECHADO]** Temas claro, escuro, grafite, alto contraste e cor de destaque foram exemplos plausíveis, não catálogo final aprovado.
- **[ABERTO]** Tipografia, escala, densidades, tokens, paletas, ícones, motion, breakpoints e persistência das preferências.

## Tela crítica de validação

**[FECHADO]** A tela de Confecção da Folha é a prova principal do design. Ela deve ser validada com volume realista de trabalhadores, rubricas, filtros, alertas, ações, painel lateral e janelas contextuais antes de extrapolar o sistema visual.

**[ABERTO]** Cenários formais de teste de usabilidade, métricas e protótipo refinado.

## Referência do ZIP

Na criação desta documentação estava acessível o arquivo `SUDO SYS UIUX Propostas.zip`, contendo um protótipo HTML e arquivos de suporte. Ele foi usado apenas para confirmar a proveniência da “Proposta 2”. Nenhum arquivo ou código do ZIP foi copiado para o repositório.

**[HIPÓTESE — NÃO IMPLEMENTAR SEM DECISÃO]** Elementos específicos do protótipo podem ser avaliados individualmente em uma futura revisão de UX. A presença no protótipo não os torna requisitos.

## Pendências de UX

- **[ABERTO]** Arquitetura de informação e navegação completa.
- **[ABERTO]** Comportamento de abas, duplicidade, salvamento, fechamento e recuperação.
- **[ABERTO]** Regras de modal versus janela interna versus painel.
- **[ABERTO]** Densidade configurável, responsividade mínima e suporte a múltiplos monitores.
- **[ABERTO]** Padrões de alertas, confirmação consciente e memória de cálculo.
- **[ABERTO]** Seleção de bibliotecas e estratégia de acessibilidade/testes visuais.
