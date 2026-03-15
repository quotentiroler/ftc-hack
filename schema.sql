CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,
  target_value TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  categories TEXT NOT NULL,
  results TEXT NOT NULL,
  model_results TEXT,
  input_analysis TEXT,
  human_verified INTEGER DEFAULT 0,
  human_proof TEXT,
  verified_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  ip_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_scans_created ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_verified ON scans(human_verified);
