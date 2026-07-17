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
const { generateExamQuestions, gradeExamAnswers, generateLearningPath, generateLessonContent, generateModuleQuiz } = require('../services/aiService');
const { summarizeStudy, SESSION_CAP_SECONDS } = require('../utils/studyStats');
const { createNotification } = require('../services/notificationService');
const { getValidCertifications } = require('../services/certService');
const { canStartExam, isExpired, summarizeGrading, mergeGrading, selectBankSlot } = require('../utils/examRules');
const { QUESTIONS_PER_EXAM, EXAM_QUESTION_MIX, EXAM_MINUTES, PASS_SCORE, RETAKE_COOLDOWN_DAYS, MAX_LEVEL, EXAM_BANK_SIZE } = require('../config/training');

// 下发考卷前剥掉判分信息：选择题的 answer_index/explanation 绝不能到客户端
// （否则 F12 看网络响应就能抄答案）。完整卷面只存库，判分在服务端进行。
function sanitizeQuestions(questions) {
  return (questions || []).map(({ type, q, options }) => ({ type, q, ...(options ? { options } : {}) }));
}

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

// ── 知识点详细课程：AI 生成 + training_lessons 缓存（课程×模块×知识点 全员共享）──
router.get('/lesson/:trackKey/:level/:moduleIdx/:topicIdx', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const level = Number(req.params.level);
    const moduleIdx = Number(req.params.moduleIdx);
    const topicIdx = Number(req.params.topicIdx);
    if (![level, moduleIdx, topicIdx].every(Number.isInteger) || level < 1 || level > MAX_LEVEL || moduleIdx < 0 || topicIdx < 0) {
      return res.status(400).json({ error: 'Invalid lesson coordinates.' });
    }
    const track = await trackByKey(supabase, req.params.trackKey);
    if (!track) return res.status(404).json({ error: 'Track not found.' });

    // 定位该方向×等级的 AI 大纲课程行（学习路径），拿到 course_id 与模块/知识点名
    const { data: course } = await supabase.from('training_courses')
      .select('id, content').eq('track_id', track.id).eq('level', level)
      .eq('type', 'ai_generated').eq('is_active', true).single();
    if (!course) return res.status(404).json({ error: 'Open the learning path first.' });
    const mod = course.content?.modules?.[moduleIdx];
    const topic = mod?.topics?.[topicIdx];
    if (!mod || !topic) return res.status(404).json({ error: 'Lesson not found in this course.' });

    // 缓存命中直接返回；否则 AI 生成并落库（唯一键防并发重复，冲突时回读）
    const { data: cached } = await supabase.from('training_lessons')
      .select('id, content').eq('course_id', course.id)
      .eq('module_index', moduleIdx).eq('topic_index', topicIdx).maybeSingle();
    if (cached) return res.json({ status: 'ok', lesson: cached.content, module: mod.name, topic });

    const lang = req.query.lang === 'zh' ? 'zh' : 'en';
    const generated = await generateLessonContent(track.name_en, level, mod.name, topic, lang);
    const { error: insErr } = await supabase.from('training_lessons')
      .insert([{ course_id: course.id, module_index: moduleIdx, topic_index: topicIdx, content: generated }]);
    if (insErr && insErr.code !== '23505') throw insErr; // 23505=并发下别人先插入了，用自己生成的返回即可

    res.json({ status: 'ok', lesson: generated, module: mod.name, topic });
  } catch (err) { fail(res, err, 'lesson'); }
});

// ── 随堂 quiz：按模块生成缓存 → 下发去答案版 → 提交服务端判分即时反馈 ─────────
const QUIZ_QUESTIONS = 3; // 每模块随堂练习题数（练习性质，不影响发证）

router.get('/quiz/:trackKey/:level/:moduleIdx', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const level = Number(req.params.level);
    const moduleIdx = Number(req.params.moduleIdx);
    const track = await trackByKey(supabase, req.params.trackKey);
    if (!track) return res.status(404).json({ error: 'Track not found.' });

    const { data: course } = await supabase.from('training_courses')
      .select('id, content').eq('track_id', track.id).eq('level', level)
      .eq('type', 'ai_generated').eq('is_active', true).single();
    const mod = course?.content?.modules?.[moduleIdx];
    if (!mod) return res.status(404).json({ error: 'Module not found.' });

    let quiz = null;
    const { data: cached } = await supabase.from('training_quizzes')
      .select('id, questions').eq('course_id', course.id).eq('module_index', moduleIdx).maybeSingle();
    if (cached) {
      quiz = cached;
    } else {
      const lang = req.query.lang === 'zh' ? 'zh' : 'en';
      const questions = await generateModuleQuiz(track.name_en, level, mod.name, mod.topics, QUIZ_QUESTIONS, lang);
      const { data: inserted, error: insErr } = await supabase.from('training_quizzes')
        .insert([{ course_id: course.id, module_index: moduleIdx, questions }])
        .select('id, questions').single();
      if (insErr) {
        if (insErr.code !== '23505') throw insErr;
        // 并发下别人先插入：回读缓存行（保证 quiz_id 与答案键一致）
        const { data: again } = await supabase.from('training_quizzes')
          .select('id, questions').eq('course_id', course.id).eq('module_index', moduleIdx).single();
        quiz = again;
      } else {
        quiz = inserted;
      }
    }

    // 只下发题面与选项——answer_index/explanation 留在服务端判分时用
    res.json({
      status: 'ok',
      quiz_id: quiz.id,
      module: mod.name,
      questions: quiz.questions.map(({ q, options }) => ({ q, options })),
    });
  } catch (err) { fail(res, err, 'quiz'); }
});

router.post('/quiz/:quizId/submit', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const talent = await talentFromUser(supabase, req.user.userId);
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found.' });

    const { data: quiz } = await supabase.from('training_quizzes')
      .select('id, questions').eq('id', req.params.quizId).single();
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });

    const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ error: `Expected ${quiz.questions.length} answers.` });
    }

    // 逐题判分（quiz 全是选择题，复用考核的判分语义：空答案不误判）
    const perQuestion = quiz.questions.map((q, i) => {
      const raw = answers[i]?.a;
      const picked = raw === '' || raw == null ? NaN : Number(raw);
      const correct = Number.isInteger(picked) && picked === q.answer_index;
      return {
        correct,
        answer_index: q.answer_index,   // 练习性质：判分后把正确答案与解析亮给学员（这是学习环节，不是考核）
        explanation: q.explanation || '',
      };
    });
    const score = Math.round((perQuestion.filter((g) => g.correct).length / quiz.questions.length) * 100);

    // 留档学习进度（fire-and-forget 语义：失败不影响反馈）
    await supabase.from('quiz_attempts')
      .insert([{ quiz_id: quiz.id, talent_id: talent.id, answers, score }])
      .then(() => {}).catch(() => {});

    res.json({ status: 'ok', score, per_question: perQuestion });
  } catch (err) { fail(res, err, 'quiz/submit'); }
});

// ── 学习打卡/时长：进入课程 start，退出 end（服务端时钟结算，单次封顶防挂机）──
router.post('/study/start', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const talent = await talentFromUser(supabase, req.user.userId);
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found.' });

    // 自动结算该学员所有未关闭的旧会话。没正常 end 的（信标丢失/断网）无法知道
    // 真实离开时间，补记封顶 30 分钟——宁可少记不虚记（正常关闭走 end，封顶 4 小时）。
    const STALE_CREDIT_CAP = 30 * 60;
    const { data: openSessions } = await supabase.from('study_sessions')
      .select('id, started_at').eq('talent_id', talent.id).is('ended_at', null);
    for (const s of openSessions || []) {
      const dur = Math.min(Math.floor((Date.now() - new Date(s.started_at).getTime()) / 1000), STALE_CREDIT_CAP);
      await supabase.from('study_sessions')
        .update({ ended_at: new Date().toISOString(), duration_seconds: dur }).eq('id', s.id);
    }

    const { course_id, module_index, topic_index } = req.body || {};
    const { data: session, error } = await supabase.from('study_sessions')
      .insert([{
        talent_id: talent.id,
        course_id: Number.isInteger(course_id) ? course_id : null,
        module_index: Number.isInteger(module_index) ? module_index : null,
        topic_index: Number.isInteger(topic_index) ? topic_index : null,
      }])
      .select('id, started_at').single();
    if (error) throw error;
    res.json({ status: 'ok', session_id: session.id, started_at: session.started_at });
  } catch (err) { fail(res, err, 'study/start'); }
});

router.post('/study/end', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const talent = await talentFromUser(supabase, req.user.userId);
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found.' });

    const { data: session } = await supabase.from('study_sessions')
      .select('id, talent_id, started_at, ended_at').eq('id', req.body?.session_id).single();
    if (!session || session.talent_id !== talent.id) return res.status(404).json({ error: 'Session not found.' });
    if (session.ended_at) return res.json({ status: 'ok', duration_seconds: null }); // 已结算过（幂等）

    // 服务端时钟结算 + 单次封顶（客户端时间不可信，也防挂机刷时长）
    const dur = Math.min(Math.max(0, Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)), SESSION_CAP_SECONDS);
    const { error } = await supabase.from('study_sessions')
      .update({ ended_at: new Date().toISOString(), duration_seconds: dur }).eq('id', session.id);
    if (error) throw error;
    res.json({ status: 'ok', duration_seconds: dur });
  } catch (err) { fail(res, err, 'study/end'); }
});

router.get('/study/summary', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const talent = await talentFromUser(supabase, req.user.userId);
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found.' });

    const { data: sessions, error } = await supabase.from('study_sessions')
      .select('started_at, duration_seconds').eq('talent_id', talent.id)
      .order('started_at', { ascending: false }).limit(1000);
    if (error) throw error;
    res.json({ status: 'ok', ...summarizeStudy(sessions, new Date()) });
  } catch (err) { fail(res, err, 'study/summary'); }
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

    // 题库池取题：池满则随机复用一套（零新增 token），未满则生成一套补池并使用。
    // 三题型混合：5 选择（服务端判分）+ 3 场景短答 + 2 深度分析（AI 评分）。
    // 出题失败仍 fail-closed（不用兜底题开考）。
    const examLang = lang === 'zh' ? 'zh' : 'en';
    const { data: bankRows } = await supabase.from('exam_question_bank')
      .select('id').eq('track_id', track.id).eq('level', level).eq('lang', examLang);
    const slot = selectBankSlot((bankRows || []).length, EXAM_BANK_SIZE, Math.random());

    let questions;
    if (slot.generate) {
      questions = await generateExamQuestions(track.name_en, level, EXAM_QUESTION_MIX, examLang);
      // 入池补库（失败不阻断开考：本次已拿到题，池子下次再补）
      await supabase.from('exam_question_bank')
        .insert([{ track_id: track.id, level, lang: examLang, questions }])
        .then(() => {}).catch(() => {});
    } else {
      const chosenId = bankRows[slot.index].id;
      const { data: chosen, error: bankErr } = await supabase.from('exam_question_bank')
        .select('questions').eq('id', chosenId).single();
      if (bankErr || !chosen) {
        // 极端情况下抽中的套读取失败：退回实时生成，绝不让考生卡住
        questions = await generateExamQuestions(track.name_en, level, EXAM_QUESTION_MIX, examLang);
      } else {
        questions = chosen.questions;
      }
    }
    const deadline = new Date(Date.now() + EXAM_MINUTES * 60 * 1000).toISOString();

    const { data: attempt, error: insErr } = await supabase.from('exam_attempts')
      .insert([{ talent_id: talent.id, track_id: track.id, level, questions, deadline }])
      .select('id, deadline').single();
    if (insErr) throw insErr;

    res.json({
      status: 'ok',
      attempt_id: attempt.id,
      questions: sanitizeQuestions(questions), // 只有题面与选项，答案键/解析绝不下发
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

    // 混合判分：选择题服务端按答案键判（零 AI 成本零误判），
    // 开放题（scenario/analysis，含旧格式无 type 的卷）交给 AI 评分。
    const openItems = attempt.questions
      .map((q, i) => ({ q, i }))
      .filter((x) => !x.q.type || x.q.type !== 'choice');

    let aiPerQuestion = [];
    let overallFeedback = '';
    if (openItems.length > 0) {
      try {
        const aiGrading = await gradeExamAnswers(openItems.map((x) => x.q), openItems.map((x) => answers[x.i]), lang);
        aiPerQuestion = aiGrading.per_question;
        overallFeedback = aiGrading.overall_feedback || '';
      } catch (aiErr) {
        // fail-closed：AI 评不了 → 转 submitted 待 admin 人工阅卷，绝不默认通过
        console.error('[training:grade] AI 评分失败，转人工复核:', aiErr.message);
        await supabase.from('exam_attempts').update({
          status: 'submitted', answers, submitted_at: submittedAt,
          review_note: 'AI grading unavailable — needs manual grading.',
        }).eq('id', attempt.id);
        return res.json({ status: 'ok', result: 'manual_review', message: 'Answers received. Grading will be completed manually by our team.' });
      }
    }

    const perQuestion = mergeGrading(attempt.questions, answers, aiPerQuestion);
    const grading = { per_question: perQuestion, overall_feedback: overallFeedback };
    const { score, passed } = summarizeGrading(perQuestion.map((g) => g.score));
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
