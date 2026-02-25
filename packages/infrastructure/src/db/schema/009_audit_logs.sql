-- packages/infrastructure/src/db/schema/009_audit_logs.sql
PRAGMA foreign_keys = ON;

-- =========================
-- Audit Logs
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              TEXT PRIMARY KEY,                 -- UUID
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),

  usuario_id      TEXT,                              -- pode ser NULL (ações do sistema no bootstrap)
  empresa_id      TEXT,                              -- pode ser NULL (ex.: login, configuração global)
  modulo          TEXT NOT NULL,                     -- ex: AUTH, EMPRESAS, RUBRICAS, FOLHA, FERIAS...
  acao            TEXT NOT NULL,                     -- ex: CREATE, UPDATE, DELETE, EXPORT_PDF, LOGIN...
  entidade        TEXT,                              -- ex: "rubricas", "folhas"
  entidade_id     TEXT,                              -- id do registro impactado

  descricao       TEXT,                              -- texto amigável (curto)
  payload_json    TEXT,                              -- snapshot do que mudou (opcional)
  ip_origem       TEXT,                              -- offline: pode ficar NULL, mas deixa preparado
  app_version     TEXT,                              -- versão do app (útil p/ debug)

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON audit_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_empresa ON audit_logs(empresa_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_modulo ON audit_logs(modulo);
CREATE INDEX IF NOT EXISTS idx_audit_logs_acao ON audit_logs(acao);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entidade ON audit_logs(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);