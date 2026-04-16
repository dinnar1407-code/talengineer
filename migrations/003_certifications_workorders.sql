-- ── Engineer Certifications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engineer_certifications (
  id           SERIAL PRIMARY KEY,
  talent_id    INTEGER NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  cert_name    VARCHAR(200) NOT NULL,
  cert_type    VARCHAR(100),           -- e.g. OSHA-10, Electrical License, Siemens
  cert_number  VARCHAR(100),
  issuing_org  VARCHAR(200),
  issue_date   DATE,
  expiry_date  DATE,
  file_url     TEXT,                   -- Supabase Storage public URL
  status       VARCHAR(20) DEFAULT 'pending'
                 CHECK (status IN ('pending', 'verified', 'rejected')),
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certs_talent ON engineer_certifications(talent_id);
CREATE INDEX IF NOT EXISTS idx_certs_status ON engineer_certifications(status);

-- ── Work Order Check-ins ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_order_checkins (
  id                SERIAL PRIMARY KEY,
  milestone_id      INTEGER NOT NULL REFERENCES project_milestones(id) ON DELETE CASCADE,
  demand_id         INTEGER NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
  engineer_id       INTEGER NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  checkin_time      TIMESTAMPTZ DEFAULT NOW(),
  checkin_lat       DECIMAL(10,7),
  checkin_lng       DECIMAL(10,7),
  checkout_time     TIMESTAMPTZ,
  completion_notes  TEXT,
  photos            JSONB DEFAULT '[]',   -- array of photo URLs
  status            VARCHAR(20) DEFAULT 'checked_in'
                      CHECK (status IN ('checked_in', 'completed', 'approved')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(milestone_id, engineer_id)
);

CREATE INDEX IF NOT EXISTS idx_workorder_milestone  ON work_order_checkins(milestone_id);
CREATE INDEX IF NOT EXISTS idx_workorder_engineer   ON work_order_checkins(engineer_id);
CREATE INDEX IF NOT EXISTS idx_workorder_demand     ON work_order_checkins(demand_id);
