import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
// 复用 onboarding 的向导样式（卡片/进度条/按钮），保证视觉一致，不重复造 CSS
import styles from './onboarding.module.css';

const LS_USER_KEY = 'tal_user';

// i18n：与全站一致的页内 DICT 模式（en/zh 先行，其它语言回退英文）
const DICT = {
  en: {
    title: 'Certification Center',
    subtitle: 'Get certified by track and level. A valid platform certification is required before official on-site assignment.',
    myCerts: 'My Certifications', noCerts: 'No certifications yet — pick a track below and start with L1.',
    startExam: 'Start Exam', viewPath: 'Learning Path', locked: 'Locked',
    certified: 'Certified', nextLevel: 'Next', history: 'Exam History',
    examTitle: 'Certification Exam', timeLeft: 'Time left', submit: 'Submit Answers', submitting: 'Grading…',
    answerPh: 'Type your answer here…',
    resultPassed: '✅ Passed AI grading — pending admin review', resultFailed: '❌ Below the pass line',
    resultManual: '📝 Received — will be graded manually by our team',
    overall: 'Overall feedback', perQ: 'Per-question feedback', back: '← Back to tracks',
    pathTitle: 'Learning Path', estHours: 'Estimated study hours', practice: 'Hands-on practice', examTips: 'Exam tips',
    uploadedCourses: 'Instructor courses', pathLoading: 'Generating your learning path…',
    statusMap: { in_progress: 'In progress', submitted: 'Manual grading', ai_passed: 'Pending review', ai_failed: 'Not passed', certified: '🎓 Certified', rejected: 'Rejected', expired: 'Expired' },
    engineersOnly: 'The Certification Center is for engineer accounts. Please sign in as an engineer.',
  },
  zh: {
    title: '认证中心',
    subtitle: '按技能方向分级考证。持有效平台认证，才能获得现场正式工作的指派授权。',
    myCerts: '我的认证', noCerts: '还没有认证——从下面选个方向，从 L1 开始。',
    startExam: '开始考核', viewPath: '学习路径', locked: '未解锁',
    certified: '已认证', nextLevel: '下一级', history: '考核记录',
    examTitle: '认证考核', timeLeft: '剩余时间', submit: '交卷', submitting: '评分中…',
    answerPh: '在这里作答…',
    resultPassed: '✅ AI 评分通过——等待平台复核发证', resultFailed: '❌ 未达及格线',
    resultManual: '📝 已收到答卷——将由平台人工阅卷',
    overall: '总体评价', perQ: '逐题反馈', back: '← 返回方向列表',
    pathTitle: '学习路径', estHours: '预计学习时长（小时）', practice: '动手练习', examTips: '考核提示',
    uploadedCourses: '讲师课程', pathLoading: '正在生成学习路径…',
    statusMap: { in_progress: '进行中', submitted: '人工阅卷中', ai_passed: '待复核', ai_failed: '未通过', certified: '🎓 已发证', rejected: '已驳回', expired: '已超时' },
    engineersOnly: '认证中心仅对工程师账号开放，请用工程师身份登录。',
  },
};

export default function Training() {
  const router = useRouter();
  const toast = useToast();
  const [lang] = useLang();
  const d = DICT[lang] || DICT.en;

  const [currentUser, setCurrentUser] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [rules, setRules] = useState(null);
  const [my, setMy] = useState({ certifications: [], attempts: [] });
  // view: tracks(主界面) | path(学习路径) | exam(答题) | result(成绩)
  const [view, setView] = useState('tracks');
  const [activeTrack, setActiveTrack] = useState(null);
  const [activeLevel, setActiveLevel] = useState(1);
  // 学习路径
  const [path, setPath] = useState(null);
  const [uploadedCourses, setUploadedCourses] = useState([]);
  const [pathLoading, setPathLoading] = useState(false);
  // 考试
  const [exam, setExam] = useState(null);       // {attempt_id, questions, deadline}
  const [answers, setAnswers] = useState([]);
  const [remaining, setRemaining] = useState(null); // 秒
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(LS_USER_KEY);
    if (!stored) { router.push('/finance'); return; }
    try {
      const user = JSON.parse(stored);
      if (user.role !== 'engineer') { setCurrentUser({ notEngineer: true }); return; }
      setCurrentUser(user);
    } catch { router.push('/finance'); }
  }, []);

  useEffect(() => {
    fetch('/api/training/tracks').then(r => r.json()).then(res => {
      if (res.status === 'ok') { setTracks(res.data); setRules(res.rules); }
    }).catch(() => {});
  }, []);

  function loadMy(user) {
    fetch('/api/training/my', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => r.json())
      .then(res => { if (res.status === 'ok') setMy({ certifications: res.certifications, attempts: res.attempts }); })
      .catch(() => {});
  }
  useEffect(() => { if (currentUser?.token) loadMy(currentUser); }, [currentUser]);

  // 考试倒计时（展示用；真正的超时判定在服务端 deadline）
  useEffect(() => {
    if (view !== 'exam' || !exam?.deadline) return undefined;
    timerRef.current = setInterval(() => {
      const left = Math.max(0, Math.floor((new Date(exam.deadline).getTime() - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) clearInterval(timerRef.current);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [view, exam]);

  function heldLevel(trackKey) {
    const cert = my.certifications.find(c => c.track_key === trackKey);
    return cert ? cert.level : null;
  }

  async function openPath(track, level) {
    setActiveTrack(track); setActiveLevel(level); setView('path'); setPath(null); setPathLoading(true);
    try {
      const res = await fetch(`/api/training/path/${track.track_key}/${level}?lang=${lang === 'zh' ? 'zh' : 'en'}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const data = await res.json();
      if (res.ok) { setPath(data.path); setUploadedCourses(data.uploaded_courses || []); }
      else toast.error(data.error || 'Failed to load learning path.');
    } catch { toast.error('Network error.'); }
    setPathLoading(false);
  }

  async function startExam(track, level) {
    setActiveTrack(track); setActiveLevel(level);
    try {
      const res = await fetch('/api/training/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ track_key: track.track_key, level, lang: lang === 'zh' ? 'zh' : 'en' }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Cannot start exam.'); return; }
      setExam(data);
      setAnswers(data.questions.map(() => ''));
      setResult(null);
      setView('exam');
    } catch { toast.error('Network error.'); }
  }

  async function submitExam() {
    if (submitting || !exam) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/training/exam/${exam.attempt_id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify({ answers: answers.map(a => ({ a })), lang: lang === 'zh' ? 'zh' : 'en' }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Submit failed.'); setSubmitting(false); return; }
      setResult(data);
      setView('result');
      loadMy(currentUser);
    } catch { toast.error('Network error.'); }
    setSubmitting(false);
  }

  if (currentUser?.notEngineer) {
    return (
      <>
        <Head><title>{`${d.title} | TalEngineer`}</title></Head>
        <Navbar />
        <div className={styles.layout}><div className={styles.card}><p>{d.engineersOnly}</p></div></div>
      </>
    );
  }

  const fmtTime = (sec) => `${String(Math.floor((sec || 0) / 60)).padStart(2, '0')}:${String((sec || 0) % 60).padStart(2, '0')}`;
  const trackName = (t) => (lang === 'zh' ? t?.name_zh : t?.name_en) || t?.name_en;

  return (
    <>
      <Head><title>{`${d.title} | TalEngineer`}</title></Head>
      <Navbar />
      <div className={styles.layout}>
        <div className={styles.card} style={{ maxWidth: 860 }}>

          {/* ── 主界面：方向卡片 + 我的认证 + 历史 ── */}
          {view === 'tracks' && (
            <div className={styles.stepContent}>
              <h1 style={{ marginBottom: 4 }}>🎓 {d.title}</h1>
              <p style={{ color: 'var(--muted)', marginBottom: 20 }}>{d.subtitle}</p>

              <h3 style={{ margin: '12px 0 8px' }}>{d.myCerts}</h3>
              {my.certifications.length === 0
                ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>{d.noCerts}</p>
                : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    {my.certifications.map(c => (
                      <span key={c.track_key} style={{ background: '#065f46', color: '#fff', borderRadius: 16, padding: '4px 12px', fontSize: 13, fontWeight: 700 }}>
                        🎓 {lang === 'zh' ? c.track_name_zh : c.track_name_en} · L{c.level}
                      </span>
                    ))}
                  </div>
                )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginTop: 16 }}>
                {tracks.map(t => {
                  const held = heldLevel(t.track_key);
                  const next = (held || 0) + 1;
                  const maxed = rules && held >= rules.max_level;
                  return (
                    <div key={t.track_key} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 800, marginBottom: 4 }}>{trackName(t)}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', minHeight: 34, marginBottom: 8 }}>{t.description}</div>
                      <div style={{ fontSize: 13, marginBottom: 10 }}>
                        {held ? `${d.certified}: L${held}` : '—'}
                        {!maxed && <span style={{ color: 'var(--muted)' }}>　{d.nextLevel}: L{next}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!maxed && (
                          <button className={styles.btnNext} style={{ flex: 1 }} onClick={() => startExam(t, next)}>
                            {d.startExam} L{next}
                          </button>
                        )}
                        <button className={styles.btnNext} style={{ flex: 1, opacity: 0.8 }} onClick={() => openPath(t, Math.min(next, rules?.max_level || 3))}>
                          {d.viewPath}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {my.attempts.length > 0 && (
                <>
                  <h3 style={{ margin: '22px 0 8px' }}>{d.history}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                      <tbody>
                        {my.attempts.map(a => (
                          <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '6px 8px' }}>{lang === 'zh' ? a.cert_tracks?.name_zh : a.cert_tracks?.name_en} · L{a.level}</td>
                            <td style={{ padding: '6px 8px' }}>{(d.statusMap[a.status]) || a.status}</td>
                            <td style={{ padding: '6px 8px' }}>{a.score != null ? `${a.score}/100` : '—'}</td>
                            <td style={{ padding: '6px 8px', color: 'var(--muted)' }}>{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── 学习路径 ── */}
          {view === 'path' && (
            <div className={styles.stepContent}>
              <button style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0, marginBottom: 10 }} onClick={() => setView('tracks')}>{d.back}</button>
              <h2>📚 {trackName(activeTrack)} · L{activeLevel} {d.pathTitle}</h2>
              {pathLoading && <p style={{ color: 'var(--muted)' }}>{d.pathLoading}</p>}
              {path?.content && (
                <div>
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>{d.estHours}: {path.content.estimated_hours}</p>
                  {(path.content.modules || []).map((m, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{i + 1}. {m.name}</div>
                      <ul style={{ margin: '0 0 8px 18px', fontSize: 14 }}>
                        {(m.topics || []).map((tp, j) => <li key={j}>{tp}</li>)}
                      </ul>
                      {m.practice && <div style={{ fontSize: 13, background: 'var(--secondary)', borderRadius: 8, padding: '8px 10px' }}>🔧 {d.practice}: {m.practice}</div>}
                    </div>
                  ))}
                  {path.content.exam_tips && <p style={{ fontSize: 14 }}>💡 {d.examTips}: {path.content.exam_tips}</p>}
                </div>
              )}
              {uploadedCourses.length > 0 && (
                <>
                  <h3 style={{ marginTop: 16 }}>{d.uploadedCourses}</h3>
                  {uploadedCourses.map(c => (
                    <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                      <div style={{ fontWeight: 700 }}>{c.title}</div>
                      {c.content_url && <a href={c.content_url} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>Open course →</a>}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── 考核答题 ── */}
          {view === 'exam' && exam && (
            <div className={styles.stepContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>📝 {trackName(activeTrack)} · L{activeLevel} {d.examTitle}</h2>
                <span style={{ fontWeight: 800, fontSize: 18, color: remaining != null && remaining < 300 ? '#ef4444' : 'inherit' }}>
                  ⏱ {d.timeLeft} {fmtTime(remaining)}
                </span>
              </div>
              {exam.questions.map((q, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Q{i + 1}. {q.q}</div>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    style={{ width: '100%' }}
                    placeholder={d.answerPh}
                    value={answers[i] || ''}
                    onChange={e => setAnswers(prev => prev.map((a, j) => (j === i ? e.target.value : a)))}
                  />
                </div>
              ))}
              <button className={styles.btnNext} disabled={submitting || remaining === 0} onClick={submitExam}>
                {submitting ? d.submitting : d.submit}
              </button>
            </div>
          )}

          {/* ── 成绩 ── */}
          {view === 'result' && result && (
            <div className={styles.stepContent}>
              <h2>
                {result.result === 'ai_passed' ? d.resultPassed
                  : result.result === 'manual_review' ? d.resultManual
                  : d.resultFailed}
              </h2>
              {result.score != null && (
                <p style={{ fontSize: 40, fontWeight: 800, margin: '10px 0' }}>
                  {result.score}<span style={{ fontSize: 16, color: 'var(--muted)' }}> / 100（{lang === 'zh' ? '及格线' : 'pass'} {result.pass_score}）</span>
                </p>
              )}
              {result.overall_feedback && <p style={{ fontSize: 14 }}>{d.overall}: {result.overall_feedback}</p>}
              {Array.isArray(result.per_question) && (
                <>
                  <h3 style={{ margin: '14px 0 6px' }}>{d.perQ}</h3>
                  {result.per_question.map((g, i) => (
                    <div key={i} style={{ fontSize: 13, borderBottom: '1px solid var(--border)', padding: '6px 0' }}>
                      Q{i + 1}: <b>{g.score}/100</b> — {g.feedback}
                    </div>
                  ))}
                </>
              )}
              <button className={styles.btnNext} style={{ marginTop: 16 }} onClick={() => { setView('tracks'); loadMy(currentUser); }}>{d.back}</button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
