-- ── Quote fields on demand_applications ────────────────────────────────────────
ALTER TABLE demand_applications
  ADD COLUMN IF NOT EXISTS quoted_rate   TEXT,
  ADD COLUMN IF NOT EXISTS quoted_days   INTEGER,
  ADD COLUMN IF NOT EXISTS quote_amount  NUMERIC(10,2);

-- ── Portfolio images on talents ──────────────────────────────────────────────
ALTER TABLE talents
  ADD COLUMN IF NOT EXISTS portfolio_images JSONB DEFAULT '[]'::jsonb;
