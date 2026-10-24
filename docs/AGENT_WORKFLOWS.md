# Fluxos de trabalho de agentes — SUDO SYS 2.0

Complementa [AGENT_PROTOCOL.md](AGENT_PROTOCOL.md) e [CONVENTIONS.md](CONVENTIONS.md). Adaptado, sem copiar, de ideias do repositório `soumatheusgomes/vibe-coding-toolkit` (MIT) que não dependem de JavaScript. Nada foi instalado desse repositório.

## 1. Papéis

- **Coordenador (Claude):** planeja, divide o trabalho, delega, revisa e integra. Decide o que vai para a `main` com autorização de Jeremias.
- **Executor (Codex, via CLI):** implementa uma tarefa por vez na branch indicada. Não faz commit, push nem merge, a menos que o coordenador delegue isso na tarefa.
- **Jeremias:** decisões de produto/arquitetura e tudo que exija a máquina dele.

## 2. Contrato de uma tarefa delegada

Toda delegação informa, por escrito:

1. **Objetivo** em uma frase e o critério de aceite verificável.
2. **Branch** onde trabalhar (já criada pelo coordenador).
3. **Arquivos** que pode criar/alterar; todo o resto é proibido.
4. **Decisões fechadas** relevantes e **itens [ABERTO]** que não pode decidir.
5. **Verificação** obrigatória (`dotnet build`, `dotnet test`).
6. **Entrega:** lista de arquivos alterados e resultado dos testes. Sem commit, salvo delegação explícita.

## 3. Trabalho em paralelo (ondas)

Duas tarefas só rodam juntas na mesma onda se **todas** as condições valem:

- nenhuma depende da outra, direta ou indiretamente;
- os conjuntos de arquivos não se sobrepõem;
- não disputam recurso mutável (porta, banco de teste, pasta de build, serviço).

Na dúvida, serializar. Cada tarefa lista `Arquivos`, `Recursos`, `Depende de` e `Responsável`. Uma onda só começa depois que a anterior foi verificada e revisada. Quando houver commit, o coordenador commita uma tarefa por vez e lê o `HEAD` atual, sem supor `HEAD~1`.

## 4. Revisão

- Revisores são somente leitura: não corrigem, não commitam.
- Usar lentes separadas quando valer a pena: qualidade geral, segurança, tipos/C#, arquitetura (dependência só para dentro).
- Achado sem cenário de falha concreto não é achado. Cada item traz `arquivo:linha`, afirmação, cenário de falha e severidade (CRÍTICA, ALTA, MÉDIA, BAIXA).
- Lista vazia de CRÍTICA/ALTA é resultado válido.

## 5. Revisão de segurança (por módulo e antes de release)

Somente leitura, com dados sintéticos. Cobrir: autenticação, sessão e autorização (incluindo isolamento por `office_id`), exposição de segredos em log/erro/CI, injeção (SQL, shell, template, desserialização), upload/caminho de arquivo/SSRF, criptografia e certificado A1, replay de webhook, dependências e scripts de build. Para cada candidato exigir: entrada controlável pelo atacante, caminho alcançável, controle ausente e impacto concreto. Relatório fora do repositório quando contiver detalhe explorável.

## 6. Tamanho de arquivo

Referência: arquivo C# acima de ~300 linhas é sinal de mais de uma responsabilidade. Dividir por responsabilidade (regra de negócio → caso de uso; acesso a dados → repositório; ajudantes de um conceito → tipo próprio), em passos pequenos, um commit por arquivo, rodando build e testes a cada passo. Sem `Utils`/`Helpers` genéricos para sobras; se não há divisão natural, deixar como está e perguntar.
