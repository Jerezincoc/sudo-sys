-- packages/infrastructure/src/db/schema/012_chamados.sql
PRAGMA foreign_keys = ON;

-- =========================
-- Chamados / Demandas
-- =========================
CREATE TABLE IF NOT EXISTS chamados (
  id              TEXT PRIMARY KEY,              -- UUID
  empresa_id      TEXT NOT NULL,                 -- Vínculo essencial com a empresa
  criador_id      TEXT NOT NULL,                 -- Usuário que abriu o chamado
  responsavel_id  TEXT,                          -- Usuário que atendeu o chamado (pode ser nulo até assumirem)
  titulo          TEXT NOT NULL,
  descricao       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'ABERTO', -- ABERTO, EM_ANDAMENTO, CONCLUIDO, CANCELADO
  prioridade      TEXT NOT NULL DEFAULT 'NORMAL', -- BAIXA, NORMAL, ALTA, URGENTE
  concluido_em    TEXT,                          -- ISO date
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (criador_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chamados_empresa ON chamados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chamados_criador ON chamados(criador_id);
CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status);
