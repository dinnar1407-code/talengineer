-- 021: 五轨工程 —— GPS 围栏字段 + admin 账号化 + 离线消息去重 + analytics SQL 聚合 + qc-images 私有 bucket
-- 全部只增不改，对现有数据零影响。

-- ── 围栏：需求站点坐标 + 签到距离 ─────────────────────────────
ALTER TABLE demands ADD COLUMN IF NOT EXISTS site_lat double precision;
ALTER TABLE demands ADD COLUMN IF NOT EXISTS site_lng double precision;
ALTER TABLE demands ADD COLUMN IF NOT EXISTS site_radius_m integer DEFAULT 500;

ALTER TABLE work_order_checkins ADD COLUMN IF NOT EXISTS distance_m numeric;
ALTER TABLE work_order_checkins ADD COLUMN IF NOT EXISTS geofence_ok boolean;

-- ── admin 账号化：TOTP + 审计日志 ────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id bigserial PRIMARY KEY,
  admin_email text NOT NULL,
  auth_method text NOT NULL,          -- 'jwt-2fa' | 'shared-password'
  action text NOT NULL,               -- 'POST /api/admin/xxx'
  target text,                        -- 资源 id（若有）
  meta jsonb,
  ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_logs (created_at DESC);
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;  -- 服务端 service key 访问，deny-all 与全库一致

-- ── 离线消息去重 ─────────────────────────────────────────────
ALTER TABLE project_messages ADD COLUMN IF NOT EXISTS client_msg_id text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_pm_client_msg
  ON project_messages (demand_id, client_msg_id) WHERE client_msg_id IS NOT NULL;

-- ── QC 图私有 bucket ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('qc-images', 'qc-images', false)
  ON CONFLICT (id) DO NOTHING;

-- ── admin analytics SQL 聚合（替代 Node 端 limit(1000) 内存聚合）──
CREATE OR REPLACE FUNCTION admin_analytics_summary() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT jsonb_build_object(
    'users_total',      (SELECT count(*) FROM users),
    'users_engineers',  (SELECT count(*) FROM users WHERE role = 'engineer'),
    'users_employers',  (SELECT count(*) FROM users WHERE role = 'employer'),
    'demands_total',    (SELECT count(*) FROM demands),
    'demands_assigned', (SELECT count(*) FROM demands WHERE assigned_engineer_id IS NOT NULL),
    'milestones_total', (SELECT count(*) FROM project_milestones),
    'gmv_released',     (SELECT coalesce(sum(amount), 0) FROM project_milestones WHERE status = 'released'),
    'escrow_funded',    (SELECT coalesce(sum(amount), 0) FROM project_milestones WHERE status IN ('funded', 'releasing'))
  );
$$;

CREATE OR REPLACE FUNCTION admin_rates_summary() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT jsonb_build_object(
    'count',    count(*),
    'avg_rate', round(avg(r), 2),
    'min_rate', min(r),
    'max_rate', max(r)
  )
  FROM (
    SELECT (substring(rate FROM '\d+(?:\.\d+)?'))::numeric AS r
    FROM talents WHERE rate ~ '\d'
  ) t;
$$;
