-- packages/infrastructure/src/db/schema/004_folha.sql
PRAGMA foreign_keys = ON;

-- =========================
-- Folhas (por funcionário e competência)
-- =========================
CREATE TABLE IF NOT EXISTS folhas (
  id              TEXT PRIMARY KEY,               -- UUID
  empresa_id      TEXT NOT NULL,
  funcionario_id  TEXT NOT NULL,
  competencia     TEXT NOT NULL,                  -- "YYYY-MM"
  observacoes     TEXT,

  template        TEXT NOT NULL DEFAULT 'formal', -- template preferido para o PDF desta folha
  status          TEXT NOT NULL DEFAULT 'ABERTA', -- ABERTA | FECHADA | CANCELADA (flexível)
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE
);

-- Evita duplicar folha do mesmo funcionário na mesma competência
CREATE UNIQUE INDEX IF NOT EXISTS ux_folhas_func_comp
  ON folhas(funcionario_id, competencia);

CREATE INDEX IF NOT EXISTS idx_folhas_empresa ON folhas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_folhas_competencia ON folhas(competencia);

-- =========================
-- Lançamentos da folha
-- Cada linha é um item que o usuário decidiu incluir.
-- "valor_centavos" pode ser digitado manualmente OU calculado via fórmula (mas sempre opcional).
-- Guardamos também um "snapshot" da rubrica (nome/tipo/categoria) para estabilidade histórica.
-- =========================
CREATE TABLE IF NOT EXISTS folha_lancamentos (
  id                  TEXT PRIMARY KEY,           -- UUID
  folha_id            TEXT NOT NULL,
  rubrica_id          TEXT,                        -- NULL permitido (Quick item ad-hoc, se você quiser)
  rubrica_nome_snap   TEXT NOT NULL,               -- nome no momento do lançamento
  rubrica_tipo_snap   TEXT NOT NULL,               -- PROVENTO | DESCONTO no momento do lançamento
  rubrica_categoria_snap TEXT NOT NULL,

  modo_valor          TEXT NOT NULL,               -- MANUAL | FORMULA
  formula_snap        TEXT,                        -- fórmula usada (se aplicável)
  quantidade          REAL,                        -- opcional (HORAS, DIAS etc.)
  valor_centavos      INTEGER NOT NULL DEFAULT 0,  -- resultado final deste lançamento em centavos
  observacao          TEXT,

  ordem               INTEGER NOT NULL DEFAULT 0,  -- para ordenar no recibo/PDF
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (folha_id) REFERENCES folhas(id) ON DELETE CASCADE,
  FOREIGN KEY (rubrica_id) REFERENCES rubricas(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_folha_lancamentos_folha ON folha_lancamentos(folha_id);
CREATE INDEX IF NOT EXISTS idx_folha_lancamentos_rubrica ON folha_lancamentos(rubrica_id);
CREATE INDEX IF NOT EXISTS idx_folha_lancamentos_ordem ON folha_lancamentos(folha_id, ordem);

-- =========================
-- Guard rails mínimos com triggers (sem “automatizar” nada)
-- =========================
CREATE TRIGGER IF NOT EXISTS trg_folha_lancamentos_valid_insert
BEFORE INSERT ON folha_lancamentos
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.rubrica_tipo_snap NOT IN ('PROVENTO', 'DESCONTO')
      THEN RAISE(ABORT, 'folha_lancamentos.rubrica_tipo_snap inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor NOT IN ('MANUAL', 'FORMULA')
      THEN RAISE(ABORT, 'folha_lancamentos.modo_valor inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor = 'FORMULA' AND (NEW.formula_snap IS NULL OR trim(NEW.formula_snap) = '')
      THEN RAISE(ABORT, 'folha_lancamentos.formula_snap obrigatória quando modo_valor=FORMULA')
    END;
END;

CREATE TRIGGER IF NOT EXISTS trg_folha_lancamentos_valid_update
BEFORE UPDATE ON folha_lancamentos
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.rubrica_tipo_snap NOT IN ('PROVENTO', 'DESCONTO')
      THEN RAISE(ABORT, 'folha_lancamentos.rubrica_tipo_snap inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor NOT IN ('MANUAL', 'FORMULA')
      THEN RAISE(ABORT, 'folha_lancamentos.modo_valor inválido')
    END;

  SELECT
    CASE
      WHEN NEW.modo_valor = 'FORMULA' AND (NEW.formula_snap IS NULL OR trim(NEW.formula_snap) = '')
      THEN RAISE(ABORT, 'folha_lancamentos.formula_snap obrigatória quando modo_valor=FORMULA')
    END;
END;