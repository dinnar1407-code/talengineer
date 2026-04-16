-- ── Demand Applications ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demand_applications (
  id            SERIAL PRIMARY KEY,
  demand_id     INTEGER NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
  engineer_id   INTEGER NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  message       TEXT,
  status        VARCHAR(20) DEFAULT 'pending'
                  CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(demand_id, engineer_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_demand   ON demand_applications(demand_id);
CREATE INDEX IF NOT EXISTS idx_applications_engineer ON demand_applications(engineer_id);

-- ── Stripe Connect payout flag on talents ────────────────────────────────────
ALTER TABLE talents ADD COLUMN IF NOT EXISTS payout_enabled BOOLEAN DEFAULT FALSE;

-- ── Password reset tokens (for custom auth users) ────────────────────────────
-- Note: we use short-lived JWTs instead of a table, so no table needed here.
