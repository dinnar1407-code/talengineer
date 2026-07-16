-- Migration 016: 培训课程深化——知识点详细课程 + 学习打卡/时长 + 随堂 quiz
-- （2026-07-16 用户反馈：课程只有大纲列表，知识点要能点进去看内容、要打卡记时长、要随堂 quiz）
-- 全部语句幂等，可安全重放。

-- ── 知识点详细课程（AI 生成，按 课程×模块×知识点 缓存，全员共享）──────────────
CREATE TABLE IF NOT EXISTS public.training_lessons (
  id           SERIAL PRIMARY KEY,
  course_id    INTEGER NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  module_index INTEGER NOT NULL,
  topic_index  INTEGER NOT NULL,
  content      JSONB NOT NULL,   -- {title, sections:[{heading,body}], key_points:[], field_example}
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (course_id, module_index, topic_index)
);

-- ── 随堂 quiz（AI 生成，按 课程×模块 缓存；questions 含答案键，绝不整行下发）──
CREATE TABLE IF NOT EXISTS public.training_quizzes (
  id           SERIAL PRIMARY KEY,
  course_id    INTEGER NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  module_index INTEGER NOT NULL,
  questions    JSONB NOT NULL,   -- [{q, options[4], answer_index, explanation}]
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (course_id, module_index)
);

-- ── 随堂 quiz 作答记录（学习进度追踪；练习性质，不影响发证）─────────────────
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id         SERIAL PRIMARY KEY,
  quiz_id    INTEGER NOT NULL REFERENCES public.training_quizzes(id) ON DELETE CASCADE,
  talent_id  INTEGER NOT NULL REFERENCES public.talents(id) ON DELETE CASCADE,
  answers    JSONB,
  score      INTEGER,            -- 0-100
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_talent ON public.quiz_attempts(talent_id);

-- ── 学习打卡/时长（进入课程开始计时，退出结算；服务端时钟为准）───────────────
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id               SERIAL PRIMARY KEY,
  talent_id        INTEGER NOT NULL REFERENCES public.talents(id) ON DELETE CASCADE,
  course_id        INTEGER REFERENCES public.training_courses(id) ON DELETE SET NULL,
  module_index     INTEGER,
  topic_index      INTEGER,
  started_at       TIMESTAMPTZ DEFAULT now(),
  ended_at         TIMESTAMPTZ,
  duration_seconds INTEGER       -- 结算时写入：min(结束-开始, 单次封顶)，防挂机刷时长
);
CREATE INDEX IF NOT EXISTS idx_study_sessions_talent ON public.study_sessions(talent_id);

-- ── RLS（deny-all，仅后端 service_role 访问，与 013/015 一致）─────────────────
ALTER TABLE public.training_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions   ENABLE ROW LEVEL SECURITY;
