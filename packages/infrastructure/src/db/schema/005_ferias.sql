-- packages/infrastructure/src/db/schema/005_ferias.sql
PRAGMA foreign_keys = ON;

-- =========================
-- Períodos de Férias (controle)
-- =========================
CREATE TABLE IF NOT EXISTS ferias_periodos (
  id                TEXT PRIMARY KEY,              -- UUID
  empresa_id         TEXT NOT NULL,
  funcionario_id     TEXT NOT NULL,

  periodo_aquisitivo_inicio TEXT,                  -- YYYY-MM-DD (opcional)
  periodo_aquisitivo_fim    TEXT,                  -- YYYY-MM-DD (opcional)

  gozo_inicio       TEXT NOT NULL,                 -- YYYY-MM-DD
  gozo_fim          TEXT NOT NULL,                 -- YYYY-MM-DD

  dias_gozo         INTEGER NOT NULL DEFAULT 0,     -- calculável pela UI, mas armazenamos
  observacoes       TEXT,

  template          TEXT NOT NULL DEFAULT 'formal',
  status            TEXT NOT NULL DEFAULT 'ABERTO', -- ABERTO | FECHADO | CANCELADO
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ferias_empresa ON ferias_periodos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ferias_funcionario ON ferias_periodos(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_ferias_gozo_inicio ON ferias_periodos(gozo_inicio);

-- =========================
-- Lançamentos do Recibo de Férias
-- Mesma filosofia: usuário decide tudo.
-- =========================
CREATE TABLE IF NOT EXISTS ferias_lancamentos (
  id                    TEXT PRIMARY KEY,          -- UUID
  ferias_id              TEXT NOT NULL,
  rubrica_id            TEXT,                       -- opcional
  rubrica_nome_snap     TEXT NOT NULL,
  rubrica_tipo_snap     TEXT NOT NULL,              -- PROVENTO | DESCONTO
  rubrica_categoria_snap TEXT NOT NULL,

  modo_valor            TEXT NOT NULL,              -- MANUAL | FORMULA
  formula_snap          TEXT,
  quantidade            REAL,
  valor_centavos        INTEGER NOT NULL DEFAULT 0,
  observacao            TEXT,

  ordem                 INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (ferias_id) REFERENCES ferias_periodos(id) ON DELETE CASCADE,
  FOREIGN KEY (rubrica_id) REFERENCES rubricas(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ferias_lancamentos_ferias ON ferias_lancamentos(ferias_id);
CREATE INDEX IF NOT EXISTS idx_ferias_lancamentos_ordem ON ferias_lancamentos(ferias_id, ordem);

-- =========================
-- Guard rails mínimos
-- =========================
CREATE TRIGGER IF NOT EXISTS trg_ferias_lancamentos_valid_insert
BEFORE INSERT ON ferias_lancamentos
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.rubrica_tipo_snap NOT IN ('PROVENTO', 'DESCONTO')
      THEN RAISE(ABORT, 'ferias_lancamentos.rubrica_tipo_snap inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor NOT IN ('MANUAL', 'FORMULA')
      THEN RAISE(ABORT, 'ferias_lancamentos.modo_valor inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor = 'FORMULA' AND (NEW.formula_snap IS NULL OR trim(NEW.formula_snap) = '')
      THEN RAISE(ABORT, 'ferias_lancamentos.formula_snap obrigatória quando modo_valor=FORMULA')
    END;
END;

CREATE TRIGGER IF NOT EXISTS trg_ferias_lancamentos_valid_update
BEFORE UPDATE ON ferias_lancamentos
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.rubrica_tipo_snap NOT IN ('PROVENTO', 'DESCONTO')
      THEN RAISE(ABORT, 'ferias_lancamentos.rubrica_tipo_snap inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor NOT IN ('MANUAL', 'FORMULA')
      THEN RAISE(ABORT, 'ferias_lancamentos.modo_valor inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor = 'FORMULA' AND (NEW.formula_snap IS NULL OR trim(NEW.formula_snap) = '')
      THEN RAISE(ABORT, 'ferias_lancamentos.formula_snap obrigatória quando modo_valor=FORMULA')
    END;
END;