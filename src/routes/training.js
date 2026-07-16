// ── 培训与考核认证路由（/api/training）───────────────────────────────────────
// 流程：选方向 → AI 学习路径（缓存）→ 限时考核（服务端出题/计时/评分）
//       → AI 出分（ai_passed/ai_failed）→ admin 复核 → 发证（platform_certifications）
// 安全要点：
//   - 考题服务端生成落库，返回给前端的不含任何参考答案；
//   - 限时以服务端 deadline 为准（客户端时间不可信）；
//   - AI 出题/评分失败一律 fail-closed：出题失败不开考、评分失败转 submitted 待人工复核；
//   - 发证必须过 admin 复核（现场作业授权事关安全，人工把最后一关）。

const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { generateExamQuestions, gradeExamAnswers, generateLearningPath } = require('../services/aiService');
const { createNotification } = require('../services/notificationService');
const { getValidCertifications } = require('../services/certService');
const { canStartExam, isExpired, summarizeGrading } = require('../utils/examRules');
const { QUESTIONS_PER_EXAM, EXAM_MINUTES, PASS_SCORE, RETAKE_COOLDOWN_DAYS, MAX_LEVEL } = require('../config/training');

// 通用错误返回（错误脱敏风格与其他路由一致）
function fail(res, err, tag) {
  console.error(`[training:${tag}]`, err);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}

// 当前登录用户 → talent 档案（工程师才有）；无档案返回 null
async function talentFromUser(supabase, userId) {
  const { data } = await supabase.from('talents').select('id, name, contact').eq('user_id', userId).single();
  return data || null;
}

async function trackByKey(supabase, trackKey) {
  const { data } = await supabase.from('cert_tracks')
    .select('id, track_key, name_en, name_zh')
    .eq('track_key', trackKey).eq('is_active', true).single();
  return data || null;
}

// ── 公开：认证方向列表 + 考核规则（前端展示用）────────────────────────────────
router.get('/tracks', async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase.from('cert_tracks')
      .select('track_key, name_en, name_zh, description')
      .eq('is_active', true).order('id');
    if (error) throw error;
    res.json({
      status: 'ok',
      data: data || [],
      rules: {
        questions: QUESTIONS_PER_EXAM, minutes: EXAM_MINUTES, pass_score: PASS_SCORE,
        cooldown_days: RETAKE_COOLDOWN_DAYS, max_level: MAX_LEVEL,
      },
    });
  } catch (err) { fail(res, err, 'tracks'); }
});

// ── 公开：某工程师的有效平台认证（非 PII，engineer 主页徽章用）────────────────
router.get('/certs/:talentId', async (req, res) => {
  try {
    const supabase = getClient();
    const certs = await getValidCertifications(supabase, Number(req.params.talentId));
    res.json({ status: 'ok', data: certs });
  } catch (err) { fail(res, err, 'certs'); }
});

// ── 学习路径：AI 生成 + training_courses 缓存（type='uploaded' 的人工课程一并返回）──
router.get('/path/:trackKey/:level', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const level = Number(req.params.level);
    if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) {
      return res.status(400).json({ error: 'Invalid level.' });
    }
    const track = await trackByKey(supabase, req.params.trackKey);
    if (!track) return res.status(404).json({ error: 'Track not found.' });

    // 该方向×等级的全部课程：AI 大纲（至多一条，作缓存）+ 人工上传课程（预留接口）
    const { data: courses, error } = await supabase.from('training_courses')
      .select('id, type, title, content, content_url')
      .eq('track_id', track.id).eq('level', level).eq('is_active', true);
    if (error) throw error;

    let aiPath = (courses || []).find((c) => c.type === 'ai_generated') || null;
    if (!aiPath) {
      // 首次访问：生成并落库缓存（同方向等级全员共享，不必每人烧一次 Gemini）
      const lang = req.query.lang === 'zh' ? 'zh' : 'en';
      const generated = await generateLearningPath(track.name_en, level, lang);
      const { data: inserted, error: insErr } = await supabase.from('training_courses')
        .insert([{ track_id: track.id, level, type: 'ai_generated', title: generated.title || `${track.name_en} L${level}`, content: generated }])
        .select('id, type, title, content, content_url').single();
      if (insErr) throw insErr;
      aiPath = inserted;
    }

    res.json({
      status: 'ok',
      path: aiPath,
      uploaded_courses: (courses || []).filter((c) => c.type === 'uploaded'),
    });
  } catch (err) { fail(res, err, 'path'); }
});

// ── 开考：校验资格 → AI 出题 → 建考核记录（服务端计时）────────────────────────
router.post('/exam/start', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const talent = await talentFromUser(supabase, req.user.userId);
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found. Publish your profile first.' });

    const { track_key, level: rawLevel, lang } = req.body || {};
    const level = Number(rawLevel);
    const track = await trackByKey(supabase, track_key);
    if (!track) return res.status(404).json({ error: 'Track not found.' });

    // 把自己名下已超时的 in_progress 考卷先判 expired（避免卡死"有进行中考试"）
    await supabase.from('exam_attempts')
      .update({ status: 'expired' })
      .eq('talent_id', talent.id).eq('status', 'in_progress')
      .lt('deadline', new Date().toISOString());

    // 取资格判定所需事实
    const [{ data: activeAttempts }, { data: certRows }, { data: lastFailRows }] = await Promise.all([
      supabase.from('exam_attempts').select('id').eq('talent_id', talent.id).eq('status', 'in_progress').limit(1),
      supabase.from('platform_certifications').select('level, revoked, expires_at')
        .eq('talent_id', talent.id).eq('track_id', track.id).eq('revoked', false),
      supabase.from('exam_attempts').select('reviewed_at, submitted_at')
        .eq('talent_id', talent.id).eq('track_id', track.id).eq('level', level)
        .in('status', ['ai_failed', 'rejected'])
        .order('created_at', { ascending: false }).limit(1),
    ]);

    const validCert = (certRows || []).find((c) => !c.expires_at || new Date(c.expires_at) > new Date());
    const lastFail = (lastFailRows || [])[0];
    const verdict = canStartExam({
      level,
      heldLevel: validCert ? validCert.level : null,
      hasActiveAttempt: (activeAttempts || []).length > 0,
      lastFailedAt: lastFail ? (lastFail.reviewed_at || lastFail.submitted_at) : null,
      now: new Date(),
    });
    if (!verdict.ok) {
      const msgs = {
        invalid_level: [400, 'Invalid level.'],
        active_attempt: [409, 'You already have an exam in progress. Finish or wait for it to expire.'],
        already_certified: [400, 'You already hold this certification level (or higher) for this track.'],
        level_locked: [400, `You must hold the L${level - 1} certification of this track before attempting L${level}.`],
        cooldown: [429, `Please wait ${RETAKE_COOLDOWN_DAYS} days after a failed attempt before retaking this exam.`],
      };
      const [code, msg] = msgs[verdict.reason] || [400, 'Cannot start exam.'];
      return res.status(code).json({ error: msg, reason: verdict.reason });
    }

    // AI 出题（fail-closed：出题失败直接 503，绝不用兜底题开考）
    const questions = await generateExamQuestions(track.name_en, level, QUESTIONS_PER_EXAM, lang === 'zh' ? 'zh' : 'en');
    const deadline = new Date(Date.now() + EXAM_MINUTES * 60 * 1000).toISOString();

    const { data: attempt, error: insErr } = await supabase.from('exam_attempts')
      .insert([{ talent_id: talent.id, track_id: track.id, level, questions, deadline }])
      .select('id, deadline').single();
    if (insErr) throw insErr;

    res.json({
      status: 'ok',
      attempt_id: attempt.id,
      questions, // 只有题面，无参考答案
      deadline: attempt.deadline,
      minutes: EXAM_MINUTES,
      pass_score: PASS_SCORE,
    });
  } catch (err) { fail(res, err, 'exam/start'); }
});

// ── 交卷：服务端判超时 → AI 整卷评分 → ai_passed/ai_failed（评分失败转人工）────
router.post('/exam/:id/submit', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const talent = await talentFromUser(supabase, req.user.userId);
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found.' });

    const { data: attempt } = await supabase.from('exam_attempts')
      .select('id, talent_id, track_id, level, status, questions, deadline')
      .eq('id', req.params.id).single();
    if (!attempt || attempt.talent_id !== talent.id) {
      return res.status(404).json({ error: 'Exam not found.' }); // 不区分"不存在/不是你的"，防探测
    }
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ error: 'This exam is not in progress.' });
    }
    if (isExpired(attempt.deadline, new Date())) {
      await supabase.from('exam_attempts').update({ status: 'expired' }).eq('id', attempt.id);
      return res.status(410).json({ error: 'Exam time expired. You may start a new attempt.' });
    }

    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    if (answers.length !== attempt.questions.length) {
      return res.status(400).json({ error: `Expected ${attempt.questions.length} answers.` });
    }
    const submittedAt = new Date().toISOString();
    const lang = req.body?.lang === 'zh' ? 'zh' : 'en';

    let grading = null;
    try {
      grading = await gradeExamAnswers(attempt.questions, answers, lang);
    } catch (aiErr) {
      // fail-closed：AI 评不了 → 转 submitted 待 admin 人工阅卷，绝不默认通过
      console.error('[training:grade] AI 评分失败，转人工复核:', aiErr.message);
      await supabase.from('exam_attempts').update({
        status: 'submitted', answers, submitted_at: submittedAt,
        review_note: 'AI grading unavailable — needs manual grading.',
      }).eq('id', attempt.id);
      return res.json({ status: 'ok', result: 'manual_review', message: 'Answers received. Grading will be completed manually by our team.' });
    }

    const { score, passed } = summarizeGrading(grading.per_question.map((g) => g.score));
    const newStatus = passed ? 'ai_passed' : 'ai_failed';
    await supabase.from('exam_attempts').update({
      status: newStatus, answers, ai_grading: grading, score, submitted_at: submittedAt,
    }).eq('id', attempt.id);

    // 通知工程师（fire-and-forget）；通过者提示"等待平台复核发证"
    createNotification({
      user_email: req.user.email,
      type: 'exam_result',
      title: passed ? `Exam passed (${score}/100) — pending review` : `Exam not passed (${score}/100)`,
      body: passed
        ? 'Congratulations! Our team will review and issue your certification shortly.'
        : `You may retake this exam after the ${RETAKE_COOLDOWN_DAYS}-day cooldown.`,
      link: '/training',
    });

    res.json({
      status: 'ok',
      result: newStatus,
      score,
      pass_score: PASS_SCORE,
      per_question: grading.per_question,
      overall_feedback: grading.overall_feedback,
      message: passed ? 'Passed AI grading — certification pending admin review.' : 'Below the pass line — study the feedback and retake after cooldown.',
    });
  } catch (err) { fail(res, err, 'exam/submit'); }
});

// ── 我的考核记录与证书 ────────────────────────────────────────────────────────
router.get('/my', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const talent = await talentFromUser(supabase, req.user.userId);
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found.' });

    const [certs, { data: attempts, error }] = await Promise.all([
      getValidCertifications(supabase, talent.id),
      supabase.from('exam_attempts')
        .select('id, level, status, score, started_at, deadline, submitted_at, review_note, cert_tracks(track_key, name_en, name_zh)')
        .eq('talent_id', talent.id)
        .order('created_at', { ascending: false }).limit(20),
    ]);
    if (error) throw error;
    res.json({ status: 'ok', certifications: certs, attempts: attempts || [] });
  } catch (err) { fail(res, err, 'my'); }
});

// ── Admin：待复核列表（ai_passed 优先，也含 ai_failed 申诉/人工阅卷 submitted）──
router.get('/admin/pending', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase.from('exam_attempts')
      .select('id, level, status, score, questions, answers, ai_grading, submitted_at, review_note, talents(id, name, contact), cert_tracks(track_key, name_en, name_zh)')
      .in('status', ['ai_passed', 'submitted', 'ai_failed'])
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: true }).limit(50);
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) { fail(res, err, 'admin/pending'); }
});

// ── Admin：复核发证/驳回 ──────────────────────────────────────────────────────
router.post('/admin/:id/review', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const approve = req.body?.approve === true;
    const note = typeof req.body?.note === 'string' ? req.body.note.slice(0, 500) : '';

    const { data: attempt } = await supabase.from('exam_attempts')
      .select('id, talent_id, track_id, level, status, talents(contact, name), cert_tracks(name_en, name_zh, track_key)')
      .eq('id', req.params.id).single();
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    if (!['ai_passed', 'ai_failed', 'submitted'].includes(attempt.status)) {
      return res.status(400).json({ error: `Attempt is already ${attempt.status}.` });
    }

    if (approve) {
      // 发证：talent×track 唯一，升级原地更新 level（历史可溯 exam_attempts）
      const { error: upsertErr } = await supabase.from('platform_certifications')
        .upsert(
          { talent_id: attempt.talent_id, track_id: attempt.track_id, level: attempt.level, exam_attempt_id: attempt.id, issued_at: new Date().toISOString(), revoked: false, revoke_reason: null },
          { onConflict: 'talent_id,track_id' },
        );
      if (upsertErr) throw upsertErr;
    }

    const newStatus = approve ? 'certified' : 'rejected';
    const { error: updErr } = await supabase.from('exam_attempts').update({
      status: newStatus, reviewed_by: 'admin', reviewed_at: new Date().toISOString(), review_note: note,
    }).eq('id', attempt.id);
    if (updErr) throw updErr;

    createNotification({
      user_email: attempt.talents?.contact,
      type: 'certification',
      title: approve
        ? `🎓 Certified: ${attempt.cert_tracks?.name_en} L${attempt.level}`
        : 'Certification review result',
      body: approve
        ? 'You are now authorized for official on-site assignments in this track.'
        : (note || 'Your exam did not pass the review. You may retake it after the cooldown.'),
      link: '/training',
    });

    res.json({ status: 'ok', result: newStatus });
  } catch (err) { fail(res, err, 'admin/review'); }
});

module.exports = router;
