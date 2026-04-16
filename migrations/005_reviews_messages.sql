-- ── Engineer Reviews ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engineer_reviews (
  id             SERIAL PRIMARY KEY,
  demand_id      INTEGER NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
  engineer_id    INTEGER NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  reviewer_email VARCHAR(200) NOT NULL,
  rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(demand_id, reviewer_email)  -- one review per project per reviewer
);

CREATE INDEX IF NOT EXISTS idx_reviews_engineer ON engineer_reviews(engineer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_demand   ON engineer_reviews(demand_id);

-- ── Messages ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id           SERIAL PRIMARY KEY,
  demand_id    INTEGER NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
  sender_email VARCHAR(200) NOT NULL,
  sender_name  VARCHAR(200),
  sender_role  VARCHAR(20) CHECK (sender_role IN ('employer', 'engineer')),
  content      TEXT NOT NULL,
  read         BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_demand  ON messages(demand_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender  ON messages(sender_email);

-- ── Engineer Availability ─────────────────────────────────────────────────────
ALTER TABLE talents ADD COLUMN IF NOT EXISTS availability VARCHAR(20) DEFAULT 'available'
  CHECK (availability IN ('available', 'busy', 'unavailable'));
ALTER TABLE talents ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE talents ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE talents ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE talents ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(3,1);
ALTER TABLE talents ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE demands ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
