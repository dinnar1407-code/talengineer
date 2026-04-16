-- ── Disputes ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disputes (
  id                  SERIAL PRIMARY KEY,
  milestone_id        INTEGER NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
  demand_id           INTEGER NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
  opened_by_email     VARCHAR(200),
  reason              TEXT NOT NULL,
  employer_evidence   TEXT,
  engineer_evidence   TEXT,
  admin_decision      TEXT,
  resolution_amount   DECIMAL(10,2),   -- amount released to engineer (0 = full refund to client)
  status              VARCHAR(30) DEFAULT 'open'
                        CHECK (status IN ('open', 'under_review', 'resolved_engineer', 'resolved_employer', 'resolved_split')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  resolved_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_disputes_milestone ON disputes(milestone_id);
CREATE INDEX IF NOT EXISTS idx_disputes_demand    ON disputes(demand_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status    ON disputes(status);

-- ── Enterprise API Keys ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  key_hash    VARCHAR(64) NOT NULL UNIQUE,   -- SHA-256 of the key
  key_prefix  VARCHAR(16) NOT NULL,          -- e.g. "TE_abc123" for display
  last_used   TIMESTAMPTZ,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user   ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash   ON api_keys(key_hash);
