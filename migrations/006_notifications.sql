-- ── Notifications ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL PRIMARY KEY,
  user_email  VARCHAR(200) NOT NULL,
  type        VARCHAR(50)  NOT NULL CHECK (type IN (
                'new_application', 'engineer_assigned', 'milestone_funded',
                'milestone_released', 'new_message', 'smart_match'
              )),
  title       VARCHAR(300) NOT NULL,
  body        TEXT,
  link        TEXT,
  demand_id   INTEGER,
  read        BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread   ON notifications(user_email, read) WHERE read = FALSE;
