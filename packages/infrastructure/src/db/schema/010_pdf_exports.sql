-- packages/infrastructure/src/db/schema/010_pdf_exports.sql
PRAGMA foreign_keys = ON;

-- =========================
-- PDF Exports (histórico)
-- =========================
CREATE TABLE IF NOT EXISTS pdf_exports (
  id              TEXT PRIMARY KEY,                 -- UUID
  documento_id    TEXT NOT NULL,

  template        TEXT NOT NULL,                     -- formal | moderno | intuitivo (string)
  via_dupla       INTEGER NOT NULL DEFAULT 1,         -- 1 = duas vias (Empregador/Empregado)
  cut_line        INTEGER NOT NULL DEFAULT 1,         -- 1 = linha de corte

  file_path       TEXT NOT NULL,                     -- caminho absoluto/relativo no BANCO/pdf/...
  file_name       TEXT NOT NULL,                     -- nome amigável
  file_hash       TEXT,                              -- opcional (ex.: sha256 no futuro)
  generated_at    TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (documento_id) REFERENCES documentos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pdf_exports_documento ON pdf_exports(documento_id);
CREATE INDEX IF NOT EXISTS idx_pdf_exports_generated_at ON pdf_exports(generated_at);
CREATE INDEX IF NOT EXISTS idx_pdf_exports_template ON pdf_exports(template);