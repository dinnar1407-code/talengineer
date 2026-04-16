-- ── KYC / Company Verification ─────────────────────────────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS kyc_status       TEXT    DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS company_name     TEXT,
  ADD COLUMN IF NOT EXISTS company_website  TEXT,
  ADD COLUMN IF NOT EXISTS company_phone    TEXT,
  ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_reviewed_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS kyc_note         TEXT;

-- ── View tracking on demands ──────────────────────────────────────────────────
ALTER TABLE demands
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_kyc ON users(kyc_status) WHERE kyc_status = 'pending';
