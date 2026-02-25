-- packages/infrastructure/src/db/schema/003_rubricas.sql
PRAGMA foreign_keys = ON;

-- =========================
-- Rubricas
-- =========================
CREATE TABLE IF NOT EXISTS rubricas (
  id            TEXT PRIMARY KEY,                -- UUID (imutável)
  empresa_id    TEXT,                            -- NULL = rubrica global (padrão do sistema)
                                                  -- NOT NULL = rubrica custom da empresa
  nome          TEXT NOT NULL,
  tipo          TEXT NOT NULL,                   -- "PROVENTO" | "DESCONTO"
  categoria     TEXT NOT NULL,                   -- ex: "Salário", "Benefícios", "Impostos", "Outros"
  modo_valor    TEXT NOT NULL,                   -- "MANUAL" | "FORMULA"
  formula       TEXT,                            -- string da fórmula (somente se modo_valor = FORMULA)
  is_active     INTEGER NOT NULL DEFAULT 1,      -- 1/0
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Indexes para busca rápida
CREATE INDEX IF NOT EXISTS idx_rubricas_nome ON rubricas(nome);
CREATE INDEX IF NOT EXISTS idx_rubricas_empresa ON rubricas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_rubricas_tipo ON rubricas(tipo);
CREATE INDEX IF NOT EXISTS idx_rubricas_categoria ON rubricas(categoria);

-- Regras mínimas de consistência (SQLite CHECK)
-- 1) tipo válido
-- 2) modo_valor válido
-- 3) se modo_valor = FORMULA, formula não pode ser NULL/vazia
-- Observação: SQLite trata CHECK em INSERT/UPDATE; não “valida lógica avançada” aqui.
CREATE TABLE IF NOT EXISTS rubricas_constraints_guard (
  one_row INTEGER PRIMARY KEY CHECK (one_row = 1),
  guard   INTEGER NOT NULL CHECK (
    1 = 1
  )
);

-- CHECKs diretamente na tabela (SQLite permite, mas não alterar fácil depois).
-- Como já criamos a tabela acima sem CHECKs, aplicamos validações via triggers (mais evolutivo).
CREATE TRIGGER IF NOT EXISTS trg_rubricas_tipo_valid
BEFORE INSERT ON rubricas
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.tipo NOT IN ('PROVENTO', 'DESCONTO')
      THEN RAISE(ABORT, 'rubricas.tipo inválido')
    END;
  SELECT
    CASE
      WHEN NEW.modo_valor NOT IN ('MANUAL', 'FORMULA')
      THEN RAISE(ABORT, 'rubricas.modo_valor inválido')
    END;
  SELECT
    CASE
      WHEN NEW.modo_valor = 'FORMULA' AND (NEW.formula IS NULL OR trim(NEW.formula) = '')
      THEN RAISE(ABORT, 'rubricas.formula obrigatória quando modo_valor=FORMULA')
    END;
END;

CREATE TRIGGER IF NOT EXISTS trg_rubricas_tipo_valid_update
BEFORE UPDATE ON rubricas
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.tipo NOT IN ('PROVENTO', 'DESCONTO')
      THEN RAISE(ABORT, 'rubricas.tipo inválido')
    END;
  SELECT
    CASE
      WHEN NEW.modo_valor NOT IN ('MANUAL', 'FORMULA')
      THEN RAISE(ABORT, 'rubricas.modo_valor inválido')
    END;
  SELECT
    CASE
      WHEN NEW.modo_valor = 'FORMULA' AND (NEW.formula IS NULL OR trim(NEW.formula) = '')
      THEN RAISE(ABORT, 'rubricas.formula obrigatória quando modo_valor=FORMULA')
    END;
END;