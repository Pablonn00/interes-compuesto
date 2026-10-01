CREATE TABLE IF NOT EXISTS empresas (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  ticker TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  rendimiento_medio REAL NOT NULL CHECK (rendimiento_medio > -100 AND rendimiento_medio <= 100)
);

CREATE TABLE IF NOT EXISTS carteras (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  anios INTEGER NOT NULL DEFAULT 10 CHECK (anios BETWEEN 1 AND 50),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS depositos (
  id INTEGER PRIMARY KEY,
  cartera_id INTEGER NOT NULL REFERENCES carteras(id) ON DELETE CASCADE,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id),
  importe REAL NOT NULL CHECK (importe >= 0),
  UNIQUE (cartera_id, empresa_id)
);
