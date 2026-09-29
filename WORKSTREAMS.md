# Frentes futuras — SUDO SYS 2.0

Esta é uma proposta de decomposição, não autorização para execução. Cada frente deve virar tarefa/branch própria após seus bloqueios serem resolvidos.

## Mapa de dependências

```text
Decisões P0
├── Contratos de arquitetura
│   ├── Fundação Core
│   ├── Fundação UI/Tauri
│   └── Persistência/Storage
├── Ambiente e CI/CD
└── Segurança/Identidade
        ↓
Modelo de domínio transversal
├── Escritórios/Empresas/Pessoas
├── Rubricas/Fórmulas/Acumuladores
└── Vigências/Auditoria
        ↓
Processos de negócio
├── Folha
├── Férias
├── Rescisão
├── 13º
├── Jornada/Ponto
├── Benefícios/CCT
└── eSocial/Documentos
```

## WS-00 — Fechamento de decisões arquiteturais

- Entrega futura: ADRs/propostas para OD-001 a OD-010.
- Dependências: nenhuma implementação.
- Paralelismo: protocolos, jobs, segurança, backup e testes podem ser analisados por agentes distintos; integração final exige Jeremias.
- Estado: **[ABERTO]**, bloqueia todas as fundações executáveis.

## WS-01 — Ambiente reproduzível e CI/CD

- Entrega futura: versões fixadas, bootstrap, checks, builds multiplataforma e pipeline.
- Dependências: OD-009 e OD-010; parte depende de OD-006/OD-007.
- Pode iniciar: somente matriz de alternativas e requisitos.
- Estado: **[ABERTO]**.

## WS-02 — Contratos e esqueleto do Core modular

- Entrega futura: solução .NET, regras de dependência e módulos vazios mínimos.
- Dependências: OD-001, OD-009, OD-010, OD-013 e OD-014.
- Estado: **[ABERTO]**; não criar esqueleto antes das decisões.

## WS-03 — Fundação UI, Design System e Tauri

- Entrega futura: shell, tokens iniciais, acessibilidade, workspace mínimo e integração contratual sem regras de negócio.
- Dependências: OD-001, OD-009, OD-010 e OD-024.
- Paralelismo: pesquisa de UX e catálogo de componentes podem ocorrer sem implementação.
- Estado: **[ABERTO]**.

## WS-04 — PostgreSQL, tenancy e storage

- Entrega futura: baseline PostgreSQL, modelo físico de Escritório, migrations e storage providers.
- Dependências: OD-004, OD-010, OD-012, OD-013, OD-014 e OD-015.
- Estado: **[ABERTO]**.

## WS-05 — Identidade, licença e autorização

- Entrega futura: autenticação/sessão/licença e modelo LOW/MEDIUM/HIGH/MASTER personalizável.
- Dependências: OD-003, OD-007, OD-012 e OD-015.
- Estado: **[ABERTO]**.

## WS-06 — Auditoria, logs, observabilidade e jobs

- Entrega futura: contratos transversais de auditoria, execução assíncrona e diagnóstico.
- Dependências: OD-002, OD-007, OD-011, OD-013 e OD-015.
- Estado: **[ABERTO]**.

## WS-07 — Modelo Escritório → Empresa → Pessoa → Vínculo

- Entrega futura: modelo de domínio e casos de uso sem interface definitiva.
- Dependências: WS-02, WS-04, WS-05, OD-016 e regras de vigência/auditoria.
- Estado: **[ABERTO]**.

## WS-08 — Tabelas, rubricas, fórmulas, acumuladores e médias

- Entrega futura: especificações executáveis e motor determinístico com memória de cálculo.
- Dependências: WS-02, WS-04, WS-06, OD-014, OD-019, OD-020 e OD-022.
- Paralelismo futuro: gramática; catálogo de variáveis; tabelas/vigências; acumuladores/médias; testes dourados.
- Estado: **[ABERTO]**.

## WS-09 — Folha e Movimento → Cálculo

- Entrega futura: domínio e fluxo da folha; depois UI crítica de validação.
- Dependências: WS-03, WS-07, WS-08, OD-002, OD-008 e OD-021.
- Estado: **[ABERTO]**.

## WS-10 — Férias, Rescisão e 13º

- Entrega futura: três processos separados, compartilhando contratos aprovados de histórico/médias.
- Dependências: WS-07, WS-08, WS-09 e OD-021.
- Paralelismo futuro: cada processo pode ter agente próprio após congelamento dos contratos comuns.
- Estado: **[ABERTO]**.

## WS-11 — Jornada, escalas e ponto

- Entrega futura: horários/jornadas/escalas, ponto manual e integração validada com movimentos.
- Dependências: WS-03, WS-07, WS-09 e decisões específicas de ponto.
- Estado: **[ABERTO]**.

## WS-12 — Benefícios, Sindicato e CCT

- Entrega futura: cadastros com vigência e contratos para folha/médias.
- Dependências: WS-07, WS-08, OD-020 e OD-022.
- Estado: **[ABERTO]**.

## WS-13 — eSocial e integrações

- Entrega futura: pipeline versionado de eventos/retornos e certificado abstrato.
- Dependências: WS-05, WS-06, WS-07, WS-09, OD-007 e OD-018.
- Estado: **[ABERTO]**.

## WS-14 — TecnoFormas, documentos e relatórios

- Entrega futura: formato de template, editor e renderização rastreável.
- Dependências: WS-03, WS-04, WS-05, WS-06 e OD-023.
- Paralelismo futuro: runtime/renderização e editor visual em branches distintas após contrato do formato.
- Estado: **[ABERTO]**.

## WS-15 — Migração/convivência do legado

- Entrega futura: inventário, mapeamento, ferramenta e reconciliação somente se aprovados.
- Dependências: OD-017 e modelos estáveis das frentes de destino.
- Estado: **[ABERTO]**; até lá, apenas preservar.

## Regras para distribuir trabalho

1. Nenhum agente executa uma frente apenas porque ela aparece aqui.
2. Resolver contratos compartilhados antes dos consumidores reduz conflitos.
3. Agentes paralelos devem evitar os mesmos arquivos e declarar integração esperada.
4. Toda frente inclui testes, documentação, timeline e commit próprio.
5. Se um bloqueio permanecer, entregar proposta/ADR — nunca implementação baseada em hipótese.
