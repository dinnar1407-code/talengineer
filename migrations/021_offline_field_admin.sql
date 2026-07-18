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
-- 两套消息表都要去重列：warroom 走 project_messages（socket），console 收件箱走 messages（REST）。
-- 离线重放打的是 POST /api/messages（messages 表），缺列会让带 client_msg_id 的插入直接失败。
ALTER TABLE project_messages ADD COLUMN IF NOT EXISTS client_msg_id text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_pm_client_msg
  ON project_messages (demand_id, client_msg_id) WHERE client_msg_id IS NOT NULL;

ALTER TABLE messages ADD COLUMN IF NOT EXISTS client_msg_id text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_msg_client_msg
  ON messages (demand_id, client_msg_id) WHERE client_msg_id IS NOT NULL;

-- ── QC 图私有 bucket ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('qc-images', 'qc-images', false)
  ON CONFLICT (id) DO NOTHING;

-- ── admin analytics SQL 聚合（替代 Node 端 limit(1000) 内存聚合）──
-- 返回形状与旧 /api/admin/analytics 端点一致（funnel/pmf/kyc_pending），
-- PMF 信号（复购/纠纷率/口碑/筛选分覆盖）是撮合实验的判定仪表，必须完整保留；
-- 百分比字段沿用旧接口的字符串类型（前端 toFixed 语义），另加 totals 块补充经营总量。
CREATE OR REPLACE FUNCTION admin_analytics_summary() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER AS $$
  WITH d AS (
    SELECT count(*) AS posted,
           count(*) FILTER (WHERE status = 'open') AS open,
           count(*) FILTER (WHERE status IN ('in_progress', 'completed')) AS assigned,
           count(*) FILTER (WHERE status = 'completed') AS completed,
           count(DISTINCT employer_id) FILTER (WHERE employer_id IS NOT NULL) AS unique_employers
    FROM demands
  ),
  rep AS (
    SELECT count(*) AS repeat_employers FROM (
      SELECT employer_id FROM demands
      WHERE employer_id IS NOT NULL
      GROUP BY employer_id HAVING count(*) >= 2
    ) t
  ),
  r AS (SELECT count(*) AS reviews_total, avg(rating)::numeric AS avg_rating FROM engineer_reviews),
  tl AS (
    SELECT count(*) AS talents_total,
           count(*) FILTER (WHERE coalesce(verified_score, 0) > 0) AS talents_scored
    FROM talents
  ),
  ms AS (
    SELECT count(*) AS milestones_total,
           coalesce(sum(amount) FILTER (WHERE status = 'released'), 0) AS gmv_released,
           coalesce(sum(amount) FILTER (WHERE status IN ('funded', 'releasing')), 0) AS escrow_funded
    FROM project_milestones
  ),
  misc AS (
    SELECT (SELECT count(*) FROM demand_applications) AS total_applies,
           (SELECT count(*) FROM disputes) AS disputes_total,
           (SELECT count(*) FROM users WHERE kyc_status = 'pending') AS kyc_pending,
           (SELECT count(*) FROM users) AS users_total,
           (SELECT count(*) FROM users WHERE role = 'engineer') AS users_engineers,
           (SELECT count(*) FROM users WHERE role = 'employer') AS users_employers
  )
  SELECT jsonb_build_object(
    'funnel', jsonb_build_object(
      'posted', d.posted,
      'open', d.open,
      'applied', NULL,
      'assigned', d.assigned,
      'completed', d.completed,
      'total_applies', misc.total_applies,
      'conversion_pct', CASE WHEN d.posted = 0 THEN '0' ELSE round(100.0 * d.assigned / d.posted, 1)::text END
    ),
    'pmf', jsonb_build_object(
      'unique_employers', d.unique_employers,
      'repeat_employers', rep.repeat_employers,
      'repeat_rate_pct', CASE WHEN d.unique_employers = 0 THEN '0' ELSE round(100.0 * rep.repeat_employers / d.unique_employers, 1)::text END,
      'disputes_total', misc.disputes_total,
      'dispute_rate_pct', CASE WHEN d.assigned = 0 THEN '0' ELSE round(100.0 * misc.disputes_total / d.assigned, 1)::text END,
      'avg_rating', CASE WHEN r.reviews_total = 0 THEN NULL ELSE round(r.avg_rating, 2)::text END,
      'reviews_total', r.reviews_total,
      'talents_total', tl.talents_total,
      'talents_scored', tl.talents_scored
    ),
    'kyc_pending', misc.kyc_pending,
    'totals', jsonb_build_object(
      'users_total', misc.users_total,
      'users_engineers', misc.users_engineers,
      'users_employers', misc.users_employers,
      'milestones_total', ms.milestones_total,
      'gmv_released', ms.gmv_released,
      'escrow_funded', ms.escrow_funded
    )
  )
  FROM d, rep, r, tl, ms, misc;
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
