-- Migration 001: Add performance indexes
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- ── talents ──────────────────────────────────────────────────────────────────
-- Matchmaker queries by region + verified_score
CREATE INDEX IF NOT EXISTS idx_talents_region
  ON talents (region);

CREATE INDEX IF NOT EXISTS idx_talents_verified_score
  ON talents (verified_score DESC);

CREATE INDEX IF NOT EXISTS idx_talents_region_score
  ON talents (region, verified_score DESC);

-- ── demands ───────────────────────────────────────────────────────────────────
-- Filter by status (open/in_progress/completed)
CREATE INDEX IF NOT EXISTS idx_demands_status
  ON demands (status);

CREATE INDEX IF NOT EXISTS idx_demands_employer_id
  ON demands (employer_id);

-- ── project_milestones ────────────────────────────────────────────────────────
-- Lookup milestones by demand (most common query)
CREATE INDEX IF NOT EXISTS idx_milestones_demand_id
  ON project_milestones (demand_id);

CREATE INDEX IF NOT EXISTS idx_milestones_status
  ON project_milestones (status);

-- ── project_messages (WarRoom chat) ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_demand_id
  ON project_messages (demand_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON project_messages (created_at DESC);

-- ── financial_ledgers ─────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ledgers_employer_email
  ON financial_ledgers (employer_email);

CREATE INDEX IF NOT EXISTS idx_ledgers_engineer_email
  ON financial_ledgers (engineer_email);

CREATE INDEX IF NOT EXISTS idx_ledgers_demand_id
  ON financial_ledgers (demand_id);

-- ── users ─────────────────────────────────────────────────────────────────────
-- Login lookup by email (likely already has unique index, but just in case)
CREATE INDEX IF NOT EXISTS idx_users_email
  ON users (email);
