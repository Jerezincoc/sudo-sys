# Ambiente — SUDO SYS 2.0

Documento central e vivo do ambiente. Atualize-o sempre que versão, requisito, ferramenta, topologia ou procedimento mudar. Não trate o ambiente legado como seleção automática do 2.0.

## 1. Matriz pretendida para o 2.0

| Área | Estado | Decisão/versão |
|---|---|---|
| Core | [FECHADO] | C#/.NET multiplataforma |
| .NET SDK | [ABERTO] | TBD |
| UI | [FECHADO] | React + TypeScript |
| Node.js | [ABERTO] | TBD para o 2.0 |
| Package manager | [ABERTO] | TBD para o 2.0 |
| Desktop | [FECHADO] | Tauri, sem regra de negócio |
| Rust toolchain | [ABERTO] | TBD |
| Banco | [FECHADO] | PostgreSQL |
| PostgreSQL versão | [ABERTO] | TBD |
| Git | [FECHADO] | Controle de versão e branches por tarefa |
| Docker/containers | [ABERTO] | Aplicabilidade e versões TBD |
| CI/CD | [ABERTO] | TBD |
| IDE | [ABERTO] | Opcional; nenhuma IDE obrigatória definida |

## 2. Sistemas operacionais

- **[FECHADO]** O Core deve ser multiplataforma e não depender diretamente de APIs exclusivas do Windows.
- **[PARCIALMENTE FECHADO]** Windows, Linux e macOS fazem parte da intenção arquitetural.
- **[ABERTO]** Matriz oficial de versões suportadas para Desktop, Core e servidor.
- **[ABERTO]** Prioridade de lançamento por sistema operacional. Windows primeiro foi cogitado, não aprovado como compromisso de release.

## 3. Topologias e requisitos

### Local/individual

**[FECHADO]** Desktop, Core, PostgreSQL e storage podem residir na mesma máquina, com instalação simples para um usuário.

**[ABERTO]** Instalação/serviço do PostgreSQL, ciclo de vida do Core, backup, descoberta, consumo mínimo, atualização e portas.

### Servidor próprio

**[FECHADO]** Vários clientes podem usar uma fonte autoritativa hospedada no escritório/rede.

**[ABERTO]** Sistemas suportados, TLS, DNS/descoberta, firewall, certificados, storage de rede, disponibilidade, backup e dimensionamento.

### Cloud

**[FECHADO]** O mesmo Core pode operar hospedado com PostgreSQL e storage apropriados.

**[ABERTO]** Provedor, regiões, isolamento físico/lógico, orquestração, banco gerenciado, object storage, observabilidade e recuperação de desastre.

## 4. Configuração por ambiente

**[PARCIALMENTE FECHADO]** A topologia será selecionada por configuração/oferta vinculada à licença.

Categorias esperadas, ainda sem nomes nem formatos aprovados:

- endereço/descoberta do Core;
- conexão do PostgreSQL, disponível apenas ao Core;
- provedor e raiz do storage;
- identidade do Escritório/licença;
- URLs externas e integrações;
- certificados e segredos;
- telemetria/logs;
- política de atualização.

**[ABERTO]** Nomes das variáveis, arquivos de configuração, precedência, segredo local, distribuição e rotação. **Portas são TBD**; não reservar números silenciosamente.

## 5. Ambiente observado na criação deste documento

Observação em `2026-09-29T13:49:31-03:00`, apenas para diagnóstico do host e do legado:

| Item | Detectado |
|---|---|
| SO do host | Windows |
| Git | 2.53.0.windows.1 |
| Node.js | 20.20.2 |
| pnpm | Manifesto legado fixa 9.15.9; execução não foi confirmada no sandbox |
| .NET SDK | Não detectado |
| .NET runtime | 5.0.10 e 6.0.10 x86 detectados; não são baseline do 2.0 |
| Rust/Cargo | Não detectado |
| PostgreSQL CLI (`psql`) | Não detectado |
| Docker CLI | Não detectado |

Essas ausências não são falhas do produto ainda; a implementação do 2.0 não começou.

## 6. Baseline do legado — não reutilizar como decisão

O `main` inspecionado contém Electron + TypeScript + SQLite, Node `20.20.2` e pnpm `9.15.9`. Há documentação operacional do legado em `README_AMBIENTE.md`.

**[FECHADO]** Esses valores servem somente para reproduzir e preservar o sistema antigo. Qualquer adoção no 2.0 requer decisão própria.

## 7. Checklist ao alterar ambiente

1. Obter decisão quando o item estiver aberto.
2. Registrar versão exata e política de atualização/suporte.
3. Atualizar scripts/manifests somente em tarefa autorizada.
4. Validar todas as topologias afetadas.
5. Atualizar este documento, [OPEN_DECISIONS.md](OPEN_DECISIONS.md) e [AGENT_TIMELINE.md](AGENT_TIMELINE.md).
