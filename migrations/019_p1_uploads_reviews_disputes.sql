-- Migration 019: P1 大工程配套 —— 双向评价 + 税务文件 + 纠纷时限 + 存储桶
--
-- 1) employer_reviews：工程师→雇主的反向评价（此前只有雇主→工程师单向）。
--    唯一键 (demand_id, reviewer_email)：一单一评，与 engineer_reviews 的防重语义一致。
-- 2) tax_documents：W-9 等税务文件登记表。文件本体放**私有**桶 tax-docs（含 TIN 等敏感信息，
--    绝不入公开桶），storage_path 记桶内路径，访问一律走服务端签发的短时签名 URL。
-- 3) disputes.evidence_deadline：纠纷开启时写入举证截止（开启后 5 天，由代码写入），
--    流程正规化第一步（时限可见、可催办）。
-- 4) storage.buckets：uploads（公开：头像/作品集/完工照片/COI）、tax-docs（私有：税务文件）。
--    幂等插入；对象读写均由服务端 service key 执行，不开放客户端直传。

CREATE TABLE IF NOT EXISTS public.employer_reviews (
  id             BIGSERIAL PRIMARY KEY,
  demand_id      BIGINT NOT NULL,
  employer_id    BIGINT NOT NULL,
  reviewer_email TEXT   NOT NULL,
  reviewer_name  TEXT,
  rating         INT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (demand_id, reviewer_email)
);
CREATE INDEX IF NOT EXISTS idx_employer_reviews_employer ON public.employer_reviews (employer_id);
ALTER TABLE public.employer_reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.tax_documents (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL,
  talent_id    BIGINT,
  doc_type     TEXT NOT NULL DEFAULT 'w9',
  storage_path TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'submitted',  -- submitted | received | rejected
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  reviewed_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_tax_documents_user ON public.tax_documents (user_id);
ALTER TABLE public.tax_documents ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS evidence_deadline TIMESTAMPTZ;

INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true)  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('tax-docs', 'tax-docs', false) ON CONFLICT (id) DO NOTHING;
