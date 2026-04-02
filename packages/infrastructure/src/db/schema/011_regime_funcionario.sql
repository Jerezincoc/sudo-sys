-- packages/infrastructure/src/db/schema/011_regime_funcionario.sql
-- Adiciona suporte a Folha A (CLT oficial) e Folha B (informal/PJ/avulso)
--
-- Folha A → regime = 'A'  — exige dados completos, calcula encargos (INSS, FGTS, IRRF)
-- Folha B → regime = 'B'  — só nome + salário obrigatórios, sem encargos formais
--
-- Os campos ctps, ctps_serie, pis só fazem sentido na Folha A,
-- mas ficam na mesma tabela para simplicidade. A app controla a obrigatoriedade.

PRAGMA foreign_keys = ON;

ALTER TABLE funcionarios ADD COLUMN regime         TEXT NOT NULL DEFAULT 'A';   -- 'A' | 'B'
ALTER TABLE funcionarios ADD COLUMN ctps           TEXT;                         -- nº carteira  (Folha A)
ALTER TABLE funcionarios ADD COLUMN ctps_serie     TEXT;                         -- série CTPS   (Folha A)
ALTER TABLE funcionarios ADD COLUMN pis            TEXT;                         -- PIS/PASEP    (Folha A)

CREATE INDEX IF NOT EXISTS idx_funcionarios_regime ON funcionarios(regime);

-- Garante que valores inválidos não entrem
-- (SQLite não tem CHECK nativo com ALTER TABLE, então usamos trigger)
CREATE TRIGGER IF NOT EXISTS trg_funcionarios_regime_insert
  BEFORE INSERT ON funcionarios
BEGIN
  SELECT CASE
    WHEN NEW.regime NOT IN ('A','B')
    THEN RAISE(ABORT, 'regime deve ser A ou B')
  END;
END;

CREATE TRIGGER IF NOT EXISTS trg_funcionarios_regime_update
  BEFORE UPDATE OF regime ON funcionarios
BEGIN
  SELECT CASE
    WHEN NEW.regime NOT IN ('A','B')
    THEN RAISE(ABORT, 'regime deve ser A ou B')
  END;
END;
