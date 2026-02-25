-- packages/infrastructure/src/db/schema/007_extras.sql
PRAGMA foreign_keys = ON;

-- =========================
-- Pagamentos Extras (cabeçalho)
-- =========================
CREATE TABLE IF NOT EXISTS extras_pagamentos (
  id                TEXT PRIMARY KEY,               -- UUID
  empresa_id         TEXT NOT NULL,
  funcionario_id     TEXT NOT NULL,

  data_pagamento     TEXT NOT NULL,                  -- YYYY-MM-DD
  titulo             TEXT NOT NULL,                  -- ex: "Comissão Janeiro", "Bônus Performance"
  observacoes        TEXT,

  template           TEXT NOT NULL DEFAULT 'formal',
  status             TEXT NOT NULL DEFAULT 'ABERTO', -- ABERTO | FECHADO | CANCELADO
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_extras_empresa ON extras_pagamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_extras_funcionario ON extras_pagamentos(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_extras_data ON extras_pagamentos(data_pagamento);

-- =========================
-- Lançamentos do Extra
-- =========================
CREATE TABLE IF NOT EXISTS extras_lancamentos (
  id                    TEXT PRIMARY KEY,          -- UUID
  extra_id              TEXT NOT NULL,
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

  FOREIGN KEY (extra_id) REFERENCES extras_pagamentos(id) ON DELETE CASCADE,
  FOREIGN KEY (rubrica_id) REFERENCES rubricas(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_extras_lancamentos_extra ON extras_lancamentos(extra_id);
CREATE INDEX IF NOT EXISTS idx_extras_lancamentos_ordem ON extras_lancamentos(extra_id, ordem);

-- =========================
-- Guard rails mínimos
-- =========================
CREATE TRIGGER IF NOT EXISTS trg_extras_lancamentos_valid_insert
BEFORE INSERT ON extras_lancamentos
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.rubrica_tipo_snap NOT IN ('PROVENTO', 'DESCONTO')
      THEN RAISE(ABORT, 'extras_lancamentos.rubrica_tipo_snap inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor NOT IN ('MANUAL', 'FORMULA')
      THEN RAISE(ABORT, 'extras_lancamentos.modo_valor inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor = 'FORMULA' AND (NEW.formula_snap IS NULL OR trim(NEW.formula_snap) = '')
      THEN RAISE(ABORT, 'extras_lancamentos.formula_snap obrigatória quando modo_valor=FORMULA')
    END;
END;

CREATE TRIGGER IF NOT EXISTS trg_extras_lancamentos_valid_update
BEFORE UPDATE ON extras_lancamentos
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.rubrica_tipo_snap NOT IN ('PROVENTO', 'DESCONTO')
      THEN RAISE(ABORT, 'extras_lancamentos.rubrica_tipo_snap inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor NOT IN ('MANUAL', 'FORMULA')
      THEN RAISE(ABORT, 'extras_lancamentos.modo_valor inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor = 'FORMULA' AND (NEW.formula_snap IS NULL OR trim(NEW.formula_snap) = '')
      THEN RAISE(ABORT, 'extras_lancamentos.formula_snap obrigatória quando modo_valor=FORMULA')
    END;
END;