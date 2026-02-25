-- packages/infrastructure/src/db/schema/001_init.sql
PRAGMA foreign_keys = ON;

-- =========================
-- Empresas
-- =========================
CREATE TABLE IF NOT EXISTS empresas (
  id              TEXT PRIMARY KEY,              -- UUID
  nome            TEXT NOT NULL,
  cnpj            TEXT,                           -- opcional (nem todo mundo vai preencher)
  fantasia        TEXT,
  endereco        TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_empresas_nome ON empresas(nome);

-- =========================
-- Funcionários
-- =========================
CREATE TABLE IF NOT EXISTS funcionarios (
  id              TEXT PRIMARY KEY,              -- UUID
  empresa_id      TEXT NOT NULL,
  nome            TEXT NOT NULL,
  cpf             TEXT,                           -- opcional, validar na app
  email           TEXT,                           -- opcional
  cargo           TEXT,
  admissao_data   TEXT,                           -- ISO date (YYYY-MM-DD)
  desligamento_data TEXT,                         -- ISO date (YYYY-MM-DD)
  salario_mensal  INTEGER NOT NULL DEFAULT 0,      -- centavos (Money)
  salario_por_hora INTEGER NOT NULL DEFAULT 0,     -- centavos (Money)
  ativo           INTEGER NOT NULL DEFAULT 1,      -- 1/0
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_funcionarios_empresa ON funcionarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_funcionarios_nome ON funcionarios(nome);

-- =========================
-- Documentos (base genérica)
-- Cada módulo vai preencher "tipo" e "referencia_id" (id do registro do módulo)
-- e salvar o caminho do PDF exportado, template escolhido etc.
-- =========================
CREATE TABLE IF NOT EXISTS documentos (
  id              TEXT PRIMARY KEY,               -- UUID
  empresa_id      TEXT,                            -- pode ser NULL no QuickCalc
  funcionario_id  TEXT,                            -- pode ser NULL no QuickCalc
  tipo            TEXT NOT NULL,                   -- ex: FOLHA, FERIAS, RESCISAO, EXTRA, PONTO, QUICKCALC, CUSTOS
  referencia_id   TEXT,                            -- id do agregado (ex folha_id) - opcional
  competencia     TEXT,                            -- ex: "2026-02" (opcional)
  titulo          TEXT NOT NULL,                   -- nome amigável do documento
  template        TEXT NOT NULL DEFAULT 'formal',   -- formal | moderno | intuitivo (string)
  pdf_path        TEXT,                            -- caminho final exportado (se já gerou)
  payload_json    TEXT NOT NULL,                   -- snapshot do documento (dados para re-render)
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL,
  FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo);
CREATE INDEX IF NOT EXISTS idx_documentos_empresa ON documentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_documentos_funcionario ON documentos(funcionario_id);