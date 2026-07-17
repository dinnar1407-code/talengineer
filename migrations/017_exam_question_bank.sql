-- Migration 017: 考试题库池（2026-07-16 用户决定：每方向×等级预生成 20 套题，开考随机抽用）
--
-- 背景：此前 /exam/start 每次实时生成一套题（防背题，但考生量大时费 token）。
-- 改为题库池：按 方向×等级×语言 维度各存 N 套，开考随机抽一套复用；池子未满时
-- 边用边生成补池。既保留"随机 + 池子够大"的防背题效果，又让 token 花费在池子填满后
-- 降为零（后续开考纯复用）。语言入池维度：中文考生抽中文套、英文考生抽英文套，不串味。
--
-- 判分不变：抽中的那套完整题（含答案键）仍复制进 exam_attempts.questions，
-- 下发时照旧剥掉答案键（sanitizeQuestions），服务端判分。
-- 全部语句幂等，可安全重放。

CREATE TABLE IF NOT EXISTS public.exam_question_bank (
  id         SERIAL PRIMARY KEY,
  track_id   INTEGER NOT NULL REFERENCES public.cert_tracks(id) ON DELETE CASCADE,
  level      INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  lang       VARCHAR(5) NOT NULL DEFAULT 'en',   -- 'en' / 'zh'，按语言分池
  questions  JSONB NOT NULL,                     -- 一整套题（含 answer_index/explanation）
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_exam_bank_track_level_lang ON public.exam_question_bank(track_id, level, lang);

-- RLS deny-all（仅后端 service_role 访问，与 013/015/016 一致）
ALTER TABLE public.exam_question_bank ENABLE ROW LEVEL SECURITY;
