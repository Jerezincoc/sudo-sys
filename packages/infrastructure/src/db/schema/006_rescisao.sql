-- packages/infrastructure/src/db/schema/006_rescisao.sql
PRAGMA foreign_keys = ON;

-- =========================
-- Rescisões (cabeçalho)
-- =========================
CREATE TABLE IF NOT EXISTS rescisoes (
  id                TEXT PRIMARY KEY,              -- UUID
  empresa_id         TEXT NOT NULL,
  funcionario_id     TEXT NOT NULL,

  data_admissao      TEXT,                          -- YYYY-MM-DD (pode puxar do funcionário, mas armazenar snapshot é útil)
  data_desligamento  TEXT NOT NULL,                 -- YYYY-MM-DD
  motivo             TEXT,                          -- texto livre (ex.: "Sem justa causa", "Pedido de demissão"...)
  observacoes        TEXT,

  template           TEXT NOT NULL DEFAULT 'formal',
  status             TEXT NOT NULL DEFAULT 'ABERTA', -- ABERTA | FECHADA | CANCELADA
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rescisoes_empresa ON rescisoes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_rescisoes_funcionario ON rescisoes(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_rescisoes_desligamento ON rescisoes(data_desligamento);

-- =========================
-- Lançamentos da Rescisão
-- Mesmo padrão: usuário decide proventos/descontos.
-- =========================
CREATE TABLE IF NOT EXISTS rescisao_lancamentos (
  id                    TEXT PRIMARY KEY,          -- UUID
  rescisao_id            TEXT NOT NULL,
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

  FOREIGN KEY (rescisao_id) REFERENCES rescisoes(id) ON DELETE CASCADE,
  FOREIGN KEY (rubrica_id) REFERENCES rubricas(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_rescisao_lancamentos_rescisao ON rescisao_lancamentos(rescisao_id);
CREATE INDEX IF NOT EXISTS idx_rescisao_lancamentos_ordem ON rescisao_lancamentos(rescisao_id, ordem);

-- =========================
-- Guard rails mínimos
-- =========================
CREATE TRIGGER IF NOT EXISTS trg_rescisao_lancamentos_valid_insert
BEFORE INSERT ON rescisao_lancamentos
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.rubrica_tipo_snap NOT IN ('PROVENTO', 'DESCONTO')
      THEN RAISE(ABORT, 'rescisao_lancamentos.rubrica_tipo_snap inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor NOT IN ('MANUAL', 'FORMULA')
      THEN RAISE(ABORT, 'rescisao_lancamentos.modo_valor inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor = 'FORMULA' AND (NEW.formula_snap IS NULL OR trim(NEW.formula_snap) = '')
      THEN RAISE(ABORT, 'rescisao_lancamentos.formula_snap obrigatória quando modo_valor=FORMULA')
    END;
END;

CREATE TRIGGER IF NOT EXISTS trg_rescisao_lancamentos_valid_update
BEFORE UPDATE ON rescisao_lancamentos
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.rubrica_tipo_snap NOT IN ('PROVENTO', 'DESCONTO')
      THEN RAISE(ABORT, 'rescisao_lancamentos.rubrica_tipo_snap inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor NOT IN ('MANUAL', 'FORMULA')
      THEN RAISE(ABORT, 'rescisao_lancamentos.modo_valor inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor = 'FORMULA' AND (NEW.formula_snap IS NULL OR trim(NEW.formula_snap) = '')
      THEN RAISE(ABORT, 'rescisao_lancamentos.formula_snap obrigatória quando modo_valor=FORMULA')
    END;
END;