# Protocolo de agentes — SUDO SYS 2.0

Estas regras são obrigatórias para agentes humanos e de IA que atuem no reinício.

## 1. Fonte de verdade

1. Os Markdown em `docs/sudo-sys-2/` são a fonte de verdade do 2.0.
2. Conversas, prompts, memórias, protótipos e documentos do legado não substituem esta base.
3. Em conflito, interromper a parte afetada, registrar a divergência e solicitar decisão de Jeremias.
4. Não reinterpretar item **[FECHADO]**. Mudança arquitetural ou funcional exige discussão e registro explícito.
5. Usar exatamente os status definidos em [README.md](README.md).

## 2. Git e isolamento do trabalho

1. Atualizar `main` por fast-forward antes de iniciar.
2. Criar branch própria a partir da `main` atualizada; nunca trabalhar diretamente em `main`.
3. Uma branch deve ter objetivo e escopo claros.
4. Não fazer merge em `main` como parte da tarefa sem autorização explícita.
5. Tarefa deve estar fechada, testada e commitada antes de PR/merge.
6. Não fazer merge quando houver risco de conflito, decisão aberta ou alteração sobreposta sem Jeremias.
7. Não incluir mudanças alheias ou arquivos fora do escopo no commit.

## 3. Ciclo obrigatório da tarefa

### Início

- ler a base documental e instruções do repositório;
- inspecionar branch/status/diff e dependências;
- verificar bloqueios em [OPEN_DECISIONS.md](OPEN_DECISIONS.md);
- acrescentar entrada de início em [AGENT_TIMELINE.md](AGENT_TIMELINE.md).

### Execução

- alterar somente o escopo autorizado;
- preservar o projeto antigo até decisão explícita;
- não escolher tecnologia, regra legal ou comportamento em item aberto;
- documentar pressupostos e buscar Jeremias quando mudarem o resultado;
- evitar duplicação e coordenar arquivos compartilhados entre agentes.

### Encerramento

- executar testes e validações proporcionais ao risco;
- revisar diff e garantir que não há segredos/dados pessoais;
- atualizar decisões, ambiente e pendências afetadas;
- acrescentar entrada final append-only na timeline;
- criar commit focal e reportar branch, commit, arquivos, testes e decisões pendentes.

## 4. Decisões

- Proposta não é decisão.
- Código existente não é decisão do 2.0.
- Recomendação de agente não é decisão de Jeremias.
- Ao fechar uma decisão, registrar escopo, alternativas, consequências e itens desbloqueados.
- Se uma decisão for parcialmente fechada, listar claramente o que continua aberto.

## 5. Trabalho paralelo

- Usar [WORKSTREAMS.md](WORKSTREAMS.md) para escolher frentes com baixo acoplamento.
- Declarar arquivos esperados antes de editar documentos centrais compartilhados.
- Preferir contratos/documentação aprovados antes de módulos consumidores.
- Não iniciar frente bloqueada; produzir análise/proposta separada se autorizado.
- Um agente responsável integra alterações conflitantes somente após decisão de Jeremias.

## 6. Proteção do legado

Até decisão explícita, é proibido:

- apagar, mover, renomear ou reformatar em massa o código antigo;
- converter o legado gradualmente e chamar isso de 2.0;
- usar schemas, IPC, cálculos ou permissões antigas como especificação;
- executar migração destrutiva ou alterar dados reais;
- misturar correção do legado com fundação do 2.0 na mesma branch.

Inventários e provas de conceito devem ser read-only ou isolados e claramente rotulados.

## 7. Escalonamento para Jeremias

Solicitar decisão quando:

- o trabalho depende de item **[ABERTO]**;
- duas fontes aprovadas parecem divergir;
- seria necessário alterar item **[FECHADO]**;
- há risco de perda de dados, quebra de compatibilidade ou conflito de merge;
- o escopo precisa incluir legado, produção, credenciais ou serviço externo;
- os critérios de aceite não permitem determinar conclusão.
