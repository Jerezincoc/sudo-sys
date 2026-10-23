# SUDO SYS 2.0

Monorepo do SUDO SYS 2.0. A documentação e as decisões estão em [docs/](docs/README.md); comece por [docs/HANDOFF_SUDO_SYS_2.md](docs/HANDOFF_SUDO_SYS_2.md).

| Pasta | Conteúdo |
|---|---|
| `src/core` | Solução .NET, um projeto por módulo |
| `src/api` | Host ASP.NET Core (REST + SignalR) |
| `src/ui` | React + TypeScript |
| `src/desktop` | Shell Tauri |
| `tests` | Unitários, arquitetura, integração, contrato, E2E e golden |
| `tools` | Scripts de ambiente e CI |
| `docs` | Fonte de verdade do 2.0 |

O código legado vive nas branches `backup/*` e não faz parte desta árvore.
