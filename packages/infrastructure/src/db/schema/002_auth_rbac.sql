-- packages/infrastructure/src/db/schema/002_auth_rbac.sql
PRAGMA foreign_keys = ON;

-- =========================
-- Usuários
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
  id                TEXT PRIMARY KEY,               -- UUID
  nome              TEXT NOT NULL,
  email             TEXT NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,                  -- resultado do hasher (ex.: argon2id)
  password_salt     TEXT NOT NULL,                  -- salt separado (ou embutido no hash; mantemos por clareza)
  is_active         INTEGER NOT NULL DEFAULT 1,      -- 1/0

  -- Preparado para verificação de e-mail (placeholder)
  email_verified_at TEXT,                            -- datetime quando verificado
  verify_token      TEXT,                            -- token local (futuro: enviado por e-mail)
  verify_token_expires_at TEXT,                      -- datetime

  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- =========================
-- Roles
-- =========================
CREATE TABLE IF NOT EXISTS roles (
  id          TEXT PRIMARY KEY,                      -- UUID
  nome        TEXT NOT NULL UNIQUE,                  -- ex: ADMIN, GERENTE, OPERADOR, LEITOR
  descricao   TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Relação usuário -> role (um usuário pode ter várias roles se você quiser)
CREATE TABLE IF NOT EXISTS usuario_roles (
  usuario_id  TEXT NOT NULL,
  role_id     TEXT NOT NULL,
  PRIMARY KEY (usuario_id, role_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- =========================
-- Permissões por módulo (RBAC)
-- "modulo" é string para ser flexível (FOLHA, FERIAS, RESCISAO, ...)
-- "acao" permite granularidade (VIEW, EDIT, DELETE, EXPORT_PDF, ADMIN_CONFIG, etc.)
-- =========================
CREATE TABLE IF NOT EXISTS role_permissoes (
  role_id     TEXT NOT NULL,
  modulo      TEXT NOT NULL,
  acao        TEXT NOT NULL,
  allowed     INTEGER NOT NULL DEFAULT 1,            -- 1/0
  PRIMARY KEY (role_id, modulo, acao),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_role_permissoes_modulo ON role_permissoes(modulo);

-- =========================
-- Escopo por empresa
-- Define quais empresas o usuário pode acessar.
-- Se vazio: por padrão, não acessa nenhuma (fail-closed).
-- =========================
CREATE TABLE IF NOT EXISTS usuario_empresas (
  usuario_id  TEXT NOT NULL,
  empresa_id  TEXT NOT NULL,
  PRIMARY KEY (usuario_id, empresa_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usuario_empresas_empresa ON usuario_empresas(empresa_id);

-- =========================
-- Um "admin local" (para mudanças controladas) pode ser implementado por role "ADMIN"
-- e permissões ADMIN_* no role_permissoes. A criação do usuário inicial pode ser seed/código.
-- =========================