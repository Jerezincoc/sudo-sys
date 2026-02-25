-- packages/infrastructure/src/db/schema/008_ponto.sql
PRAGMA foreign_keys = ON;

-- =========================
-- Jornadas / Espelho (cabeçalho por período)
-- Ex.: 01/02/2026 a 29/02/2026
-- =========================
CREATE TABLE IF NOT EXISTS ponto_periodos (
  id                TEXT PRIMARY KEY,               -- UUID
  empresa_id         TEXT NOT NULL,
  funcionario_id     TEXT NOT NULL,

  periodo_inicio     TEXT NOT NULL,                  -- YYYY-MM-DD
  periodo_fim        TEXT NOT NULL,                  -- YYYY-MM-DD
  observacoes        TEXT,

  template           TEXT NOT NULL DEFAULT 'formal',
  status             TEXT NOT NULL DEFAULT 'ABERTO', -- ABERTO | FECHADO | CANCELADO
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ponto_periodos_empresa ON ponto_periodos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ponto_periodos_funcionario ON ponto_periodos(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_ponto_periodos_inicio ON ponto_periodos(periodo_inicio);

-- =========================
-- Batidas (eventos)
-- Guardamos timestamp local (texto ISO) e tipo livre (ENTRADA/SAIDA/INTERVALO etc.)
-- O "tipo" é opcional: dá pra operar só com ordem/horário, se preferir.
-- =========================
CREATE TABLE IF NOT EXISTS ponto_batidas (
  id              TEXT PRIMARY KEY,                  -- UUID
  ponto_periodo_id TEXT NOT NULL,

  dia             TEXT NOT NULL,                     -- YYYY-MM-DD (para agrupar rapidamente)
  hora            TEXT NOT NULL,                     -- HH:MM (simples e suficiente para offline)
  tipo            TEXT,                              -- ex: ENTRADA, SAIDA, INTERVALO_INI, INTERVALO_FIM
  observacao      TEXT,

  ordem           INTEGER NOT NULL DEFAULT 0,         -- ordenação de exibição no dia
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (ponto_periodo_id) REFERENCES ponto_periodos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ponto_batidas_periodo ON ponto_batidas(ponto_periodo_id);
CREATE INDEX IF NOT EXISTS idx_ponto_batidas_dia ON ponto_batidas(ponto_periodo_id, dia);
CREATE INDEX IF NOT EXISTS idx_ponto_batidas_ordem ON ponto_batidas(ponto_periodo_id, dia, ordem);

-- =========================
-- Guard rails mínimos (sem impor regras trabalhistas)
-- Apenas garante formato e ordem mínima por constraints simples.
-- =========================
CREATE TRIGGER IF NOT EXISTS trg_ponto_batidas_valid_insert
BEFORE INSERT ON ponto_batidas
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.dia IS NULL OR length(NEW.dia) <> 10
      THEN RAISE(ABORT, 'ponto_batidas.dia inválido (esperado YYYY-MM-DD)')
    END;

  SELECT
    CASE
      WHEN NEW.hora IS NULL OR length(NEW.hora) < 4
      THEN RAISE(ABORT, 'ponto_batidas.hora inválido (esperado HH:MM)')
    END;
END;

CREATE TRIGGER IF NOT EXISTS trg_ponto_batidas_valid_update
BEFORE UPDATE ON ponto_batidas
FOR EACH ROW
BEGIN
  SELECT
    CASE
      WHEN NEW.dia IS NULL OR length(NEW.dia) <> 10
      THEN RAISE(ABORT, 'ponto_batidas.dia inválido (esperado YYYY-MM-DD)')
    END;

  SELECT
    CASE
      WHEN NEW.hora IS NULL OR length(NEW.hora) < 4
      THEN RAISE(ABORT, 'ponto_batidas.hora inválido (esperado HH:MM)')
    END;
END;