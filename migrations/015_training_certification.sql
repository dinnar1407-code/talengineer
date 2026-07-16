-- Migration 015: 培训与考核认证模块
--
-- 业务：工程师按技能方向（PLC/机器人/视觉/电气安全）参加 AI 限时考核，
-- AI 出分后 admin 复核发证（方向×等级 L1-L3）；持有效认证才能被正式指派/到场开工。
-- 设计要点：
--   - 平台认证与 engineer_certifications（外部证书上传审核）是两个概念，独立建表；
--   - talents.level 是自报自由文本仅展示，门禁只读 platform_certifications；
--   - training_courses 的 type='uploaded' + content_url 是人工课程的预留接口（MVP 只用 ai_generated）。
-- 全部语句幂等，可安全重放。

-- ── 认证方向字典 ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cert_tracks (
  id          SERIAL PRIMARY KEY,
  track_key   VARCHAR(50) UNIQUE NOT NULL,   -- 'plc' / 'robotics' / 'vision' / 'electrical'
  name_en     TEXT NOT NULL,
  name_zh     TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 培训课程（AI 生成大纲缓存 + 人工上传课程预留接口）────────────────────────
CREATE TABLE IF NOT EXISTS public.training_courses (
  id          SERIAL PRIMARY KEY,
  track_id    INTEGER NOT NULL REFERENCES public.cert_tracks(id) ON DELETE CASCADE,
  level       INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  type        VARCHAR(20) NOT NULL DEFAULT 'ai_generated' CHECK (type IN ('ai_generated','uploaded')),
  title       TEXT NOT NULL,
  content     JSONB,          -- ai_generated：学习大纲/章节/练习 JSON；uploaded：简介元数据
  content_url TEXT,           -- uploaded：视频/文档外链（预留，MVP 不用）
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_training_courses_track_level ON public.training_courses(track_id, level);

-- ── 考核记录（状态机）────────────────────────────────────────────────────────
-- in_progress(答题中) → submitted(已交卷待AI/AI失败转人工) → ai_passed/ai_failed(AI出分)
-- → certified(admin批准发证) / rejected(admin驳回)；expired=超时未交。
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id           SERIAL PRIMARY KEY,
  talent_id    INTEGER NOT NULL REFERENCES public.talents(id) ON DELETE CASCADE,
  track_id     INTEGER NOT NULL REFERENCES public.cert_tracks(id),
  level        INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  status       VARCHAR(20) NOT NULL DEFAULT 'in_progress'
               CHECK (status IN ('in_progress','submitted','ai_passed','ai_failed','certified','rejected','expired')),
  questions    JSONB NOT NULL,   -- [{"q":"..."}]，服务端生成，不含参考答案
  answers      JSONB,            -- [{"a":"..."}]
  ai_grading   JSONB,            -- {"per_question":[{"score","feedback"}],"overall_feedback"}
  score        INTEGER,          -- 0-100 总分
  started_at   TIMESTAMPTZ DEFAULT now(),
  deadline     TIMESTAMPTZ NOT NULL,   -- 服务端限时：started_at + 考试时长
  submitted_at TIMESTAMPTZ,
  reviewed_by  TEXT,             -- admin 复核人
  review_note  TEXT,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_talent ON public.exam_attempts(talent_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON public.exam_attempts(status);

-- ── 平台认证持证记录 ──────────────────────────────────────────────────────────
-- 每 talent×track 唯一一条，升级时原地更新 level（历史可溯 exam_attempts）。
CREATE TABLE IF NOT EXISTS public.platform_certifications (
  id              SERIAL PRIMARY KEY,
  talent_id       INTEGER NOT NULL REFERENCES public.talents(id) ON DELETE CASCADE,
  track_id        INTEGER NOT NULL REFERENCES public.cert_tracks(id),
  level           INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  exam_attempt_id INTEGER REFERENCES public.exam_attempts(id),
  issued_at       TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ,          -- NULL = 长期有效
  revoked         BOOLEAN DEFAULT false,
  revoke_reason   TEXT,
  UNIQUE (talent_id, track_id)
);
CREATE INDEX IF NOT EXISTS idx_platform_certs_talent ON public.platform_certifications(talent_id);

-- ── 需求可选认证要求（雇主指定本单要求的认证方向）────────────────────────────
ALTER TABLE public.demands ADD COLUMN IF NOT EXISTS required_cert_track VARCHAR(50);

-- ── RLS（跟 013 的 deny-all 策略一致：仅后端 service_role 可访问）─────────────
ALTER TABLE public.cert_tracks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_courses        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_certifications ENABLE ROW LEVEL SECURITY;

-- ── 方向种子数据 ──────────────────────────────────────────────────────────────
INSERT INTO public.cert_tracks (track_key, name_en, name_zh, description) VALUES
  ('plc',        'PLC & Control Systems',  'PLC 与控制系统', 'Allen-Bradley / Siemens / Mitsubishi PLC programming, HMI, commissioning'),
  ('robotics',   'Industrial Robotics',    '工业机器人',     'FANUC / Yaskawa / ABB / KUKA robot programming, integration, safety'),
  ('vision',     'Machine Vision',         '机器视觉',       'Cognex / Keyence vision systems, inspection, calibration'),
  ('electrical', 'Electrical & Safety',    '电气与安全',     'Panel design, wiring, LOTO, field electrical safety')
ON CONFLICT (track_key) DO NOTHING;
