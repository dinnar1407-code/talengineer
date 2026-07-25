// ── /pools：企业认证人才池（W2-3）——雇主登录态控制台页 ─────────────────────────
// 雇主按条件（认证方向/等级、最低 TalScore、地区）建私有人才池：左栏=我的池列表+新建表单，
// 右栏=选中池的详情（criteria 摘要、候选预览、成员表、加/移成员）。
// 接口：GET/POST /api/pools、GET /api/pools/:id、GET /:id/candidates、POST/DELETE /:id/members。
// 登录态：localStorage 'tal_user'（{email,name,role,token}），未登录跳 /onboarding。
// 外壳：ConsoleShell（与 finance/talent 同一登录态壳）；语言 en/zh 内联 dict + || en 回退；
// SSR 首帧：useLang 客户端才生效，挂载前渲染合法英文加载态（不产生 hydration mismatch）。
import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ConsoleShell from '../components/ConsoleShell';
import TalScoreBadge from '../components/TalScoreBadge';
import { useToast } from '../components/Toast';
import { useLang } from '../hooks/useLang';
import { useTheme } from '../hooks/useTheme';
// 页内文案字典：已迁至 lib/i18n/pools.js（2026-07-24 机械搬移）
import { DICT } from '../lib/i18n/pools';
import styles from './pools.module.css';

const LS_USER_KEY = 'tal_user';

// 四个认证方向（cert_tracks 种子 key，口径与 pages/certification.jsx / src/config/training.js 一致）
// 九语标签：术语取自 lib/i18n/glossary.js TERMS.controls/robotics/machineVision（PLC 保持
// KEEP_ENGLISH），electrical 沿用本页 en/zh 既有的短称口径（非 glossary 的长称"电气柜设计"）。
const TRACKS = [
  { key: 'plc',        en: 'PLC & Controls', zh: 'PLC 与控制', es: 'PLC y control',        vi: 'PLC & Điều khiển',  hi: 'PLC और कंट्रोल',    fr: 'PLC et contrôle-commande',  de: 'PLC & Steuerungstechnik', ja: 'PLC・制御',   ko: 'PLC 및 제어' },
  { key: 'robotics',   en: 'Robotics',       zh: '机器人',      es: 'Robótica',              vi: 'Robot công nghiệp', hi: 'रोबोटिक्स',        fr: 'Robotique',                  de: 'Robotik',                  ja: 'ロボティクス', ko: '로보틱스' },
  { key: 'vision',     en: 'Machine Vision', zh: '机器视觉',    es: 'Visión artificial',     vi: 'Thị giác máy',      hi: 'मशीन विज़न',        fr: 'Vision industrielle',        de: 'Bildverarbeitung',         ja: 'マシンビジョン', ko: '머신 비전' },
  { key: 'electrical', en: 'Electrical',     zh: '电气',        es: 'Eléctrica',             vi: 'Điện',              hi: 'इलेक्ट्रिकल',      fr: 'Électricité',                 de: 'Elektrotechnik',                 ja: '電気',        ko: '전기' },
];

export default function Pools() {
  const router = useRouter();
  const toast = useToast();
  const [lang, setLang] = useLang();
  const { theme, setTheme } = useTheme();
  const d = { ...DICT.en, ...(DICT[lang] || {}) }; // 缺 key 按 key 回退英文

  const [user, setUser] = useState(null);          // 登录态（null=未恢复/未登录）
  const [pools, setPools] = useState(null);        // 池列表（null=加载中）
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);      // 选中池详情（含 members）
  const [candidates, setCandidates] = useState(null);

  // 新建表单
  const [name, setName] = useState('');
  const [selTracks, setSelTracks] = useState([]);
  const [minLevel, setMinLevel] = useState('');
  const [minScore, setMinScore] = useState('');
  const [regionsText, setRegionsText] = useState('');
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);      // 正在加/移的 talent_id（防连点）

  // ── 登录态恢复：无 tal_user 一律跳 /onboarding（本页是纯登录态控制台）──────────
  useEffect(() => {
    let stored = null;
    try { stored = localStorage.getItem(LS_USER_KEY); } catch { /* 隐私模式无 localStorage */ }
    if (!stored) { router.replace('/onboarding'); return; }
    try {
      setUser(JSON.parse(stored));
    } catch {
      try { localStorage.removeItem(LS_USER_KEY); } catch { /* 忽略 */ }
      router.replace('/onboarding');
    }
  }, [router]);

  // 带 JWT 的 fetch 封装（本页全部接口都要登录态）
  const authFetch = useCallback((url, opts = {}) => fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${user?.token || ''}`,
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {}),
    },
  }), [user]);

  // ── 池列表 ───────────────────────────────────────────────────────────────────
  const loadPools = useCallback(async () => {
    try {
      const r = await authFetch('/api/pools');
      if (!r.ok) throw new Error('pools');
      const j = await r.json();
      setPools(j.data || []);
    } catch { setPools([]); toast.error(d.errGeneric); }
  }, [authFetch, toast, d.errGeneric]);

  useEffect(() => { if (user?.token) loadPools(); }, [user, loadPools]);

  // ── 选中池：并行拉详情 + 候选预览 ─────────────────────────────────────────────
  const openPool = useCallback(async (id) => {
    setSelectedId(id);
    setDetail(null);
    setCandidates(null);
    try {
      const [dr, cr] = await Promise.all([
        authFetch(`/api/pools/${id}`),
        authFetch(`/api/pools/${id}/candidates`),
      ]);
      // 详情拉取失败视为错误（而非"加载中"）：否则右栏会永远卡在 Loading…
      if (!dr.ok) throw new Error('detail');
      setDetail((await dr.json()).data);
      setCandidates(cr.ok ? (await cr.json()).data : []);
    } catch {
      toast.error(d.errGeneric);
      setSelectedId(null);
    }
  }, [authFetch, toast, d.errGeneric]);

  // ── 新建池 ───────────────────────────────────────────────────────────────────
  async function createPool(e) {
    e.preventDefault();
    if (!name.trim() || creating) return;
    // 组装 criteria：留空的维度不发（后端 schema 全可选）
    const criteria = {};
    if (selTracks.length) criteria.tracks = selTracks;
    if (minLevel) criteria.min_level = Number(minLevel);
    if (minScore !== '' && !Number.isNaN(Number(minScore))) criteria.min_tal_score = Number(minScore);
    const regions = regionsText.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10);
    if (regions.length) criteria.regions = regions;

    setCreating(true);
    try {
      const r = await authFetch('/api/pools', { method: 'POST', body: JSON.stringify({ name: name.trim(), criteria }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'create');
      toast.success(d.createdOk);
      setName(''); setSelTracks([]); setMinLevel(''); setMinScore(''); setRegionsText('');
      await loadPools();
      if (j.data?.id) openPool(j.data.id); // 新建后直接进详情
    } catch { toast.error(d.errGeneric); }
    setCreating(false);
  }

  // ── 加/移成员、删池 ──────────────────────────────────────────────────────────
  async function addMember(talentId) {
    if (busyId) return;
    setBusyId(talentId);
    try {
      const r = await authFetch(`/api/pools/${selectedId}/members`, {
        method: 'POST', body: JSON.stringify({ talent_id: talentId }),
      });
      const j = await r.json();
      // 400 时后端给的是可读原因（如不满足认证门槛），如实展示；其余用通用文案
      if (!r.ok) { toast.error(r.status === 400 && j.error ? j.error : d.errGeneric); }
      else { toast.success(d.addedOk); await openPool(selectedId); }
    } catch { toast.error(d.errGeneric); }
    setBusyId(null);
  }

  async function removeMember(talentId) {
    if (busyId) return;
    setBusyId(talentId);
    try {
      const r = await authFetch(`/api/pools/${selectedId}/members/${talentId}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('remove');
      toast.success(d.removedOk);
      await openPool(selectedId);
    } catch { toast.error(d.errGeneric); }
    setBusyId(null);
  }

  async function deletePool() {
    if (!selectedId) return;
    if (!window.confirm(d.confirmDelete)) return;
    try {
      const r = await authFetch(`/api/pools/${selectedId}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('delete');
      toast.success(d.deletedOk);
      setSelectedId(null); setDetail(null); setCandidates(null);
      await loadPools();
    } catch { toast.error(d.errGeneric); }
  }

  // ── 渲染小件 ─────────────────────────────────────────────────────────────────
  const trackLabel = (key) => {
    const t = TRACKS.find((x) => x.key === key);
    return t ? (t[lang] || t.en) : key;
  };

  // criteria 摘要 chips（无条件时给"未设条件"说明）
  function CriteriaChips({ criteria }) {
    const c = criteria || {};
    const chips = [];
    (c.tracks || []).forEach((t) => chips.push(`🎓 ${trackLabel(t)}`));
    if (c.min_level) chips.push(d.critLevel.replace('{n}', c.min_level));
    if (c.min_tal_score != null) chips.push(d.critScore.replace('{n}', c.min_tal_score));
    (c.regions || []).forEach((r) => chips.push(d.critRegion.replace('{r}', r)));
    if (!chips.length) return <span className={styles.muted}>{d.noCriteria}</span>;
    return (
      <div className={styles.critChips}>
        {chips.map((label, i) => <span key={i} className={styles.critChip}>{label}</span>)}
      </div>
    );
  }

  // 工程师认证徽章（口径与 /talent 浏览卡一致：track·L{level}）
  const certBadges = (certs) => (Array.isArray(certs) ? certs : []).map((c) => (
    <span key={c.track_key} className={styles.badge}>🎓 {c.track_key}·L{c.level}</span>
  ));

  const head = (
    <Head>
      <title>{d.metaTitle} | Talengineer</title>
      <meta name="description" content={d.metaDescription} />
      {/* 登录态控制台页：不进 sitemap/llms.txt，也不让搜索引擎收录 */}
      <meta name="robots" content="noindex" />
    </Head>
  );

  // SSR / 登录态未恢复：渲染合法英文加载态（useLang/localStorage 客户端才生效）
  if (!user) {
    return (
      <>
        {head}
        <div className={styles.ssrLoading}>Loading…</div>
      </>
    );
  }

  return (
    <>
      {head}
      <ConsoleShell
        user={user}
        active="pools"
        title={d.title}
        subtitle={d.subtitle}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
      >
        <div className={styles.layout}>
          {/* ── 左栏：池列表 + 新建表单 ── */}
          <div className={styles.panel}>
            <h2 className={styles.sectionTitle}>{d.myPools}</h2>
            {pools === null ? (
              <div className={styles.muted}>{d.loading}</div>
            ) : pools.length === 0 ? (
              <div className={styles.empty}>
                <div>{d.emptyPools}</div>
                <div className={styles.muted}>{d.emptyPoolsHint}</div>
              </div>
            ) : (
              <div className={styles.poolList}>
                {pools.map((p) => (
                  <button
                    key={p.id}
                    className={`${styles.poolItem} ${selectedId === p.id ? styles.poolItemActive : ''}`}
                    onClick={() => openPool(p.id)}
                  >
                    <span className={styles.poolName}>{p.name}</span>
                    <span className={styles.poolMeta}>👥 {p.member_count} {d.membersCount}</span>
                  </button>
                ))}
              </div>
            )}

            <h2 className={styles.sectionTitle}>{d.newPool}</h2>
            <form className={styles.form} onSubmit={createPool}>
              <label className={styles.label}>{d.poolName}</label>
              <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder={d.poolNamePh} maxLength={80} required />

              <label className={styles.label}>{d.tracksLabel}</label>
              <div className={styles.chipRow}>
                {TRACKS.map((t) => (
                  <button
                    type="button"
                    key={t.key}
                    className={`${styles.chip} ${selTracks.includes(t.key) ? styles.chipActive : ''}`}
                    onClick={() => setSelTracks((prev) => (prev.includes(t.key) ? prev.filter((k) => k !== t.key) : [...prev, t.key]))}
                  >
                    {t[lang] || t.en}
                  </button>
                ))}
              </div>

              <label className={styles.label}>{d.minLevelLabel}</label>
              <select className={styles.input} value={minLevel} onChange={(e) => setMinLevel(e.target.value)}>
                <option value="">{d.anyLevel}</option>
                <option value="1">L1+</option>
                <option value="2">L2+</option>
                <option value="3">L3</option>
              </select>

              <label className={styles.label}>{d.minScoreLabel}</label>
              <input className={styles.input} type="number" min={0} max={100} value={minScore} onChange={(e) => setMinScore(e.target.value)} placeholder={d.minScorePh} />

              <label className={styles.label}>{d.regionsLabel}</label>
              <input className={styles.input} value={regionsText} onChange={(e) => setRegionsText(e.target.value)} placeholder={d.regionsPh} />

              <button type="submit" className={styles.btnPrimary} disabled={creating || !name.trim()}>
                {creating ? d.creating : d.createBtn}
              </button>
            </form>
          </div>

          {/* ── 右栏：选中池详情 ── */}
          <div className={styles.panel}>
            {!selectedId ? (
              <div className={styles.empty}>{d.selectPool}</div>
            ) : detail === null ? (
              <div className={styles.muted}>{d.loading}</div>
            ) : (
              <>
                <div className={styles.detailHead}>
                  <h2 className={styles.detailTitle}>{detail.name}</h2>
                  <button className={styles.btnDanger} onClick={deletePool}>{d.deletePool}</button>
                </div>

                <h3 className={styles.subTitle}>{d.criteriaTitle}</h3>
                <CriteriaChips criteria={detail.criteria} />

                {/* 成员表：显示当前档案 + 加入时快照 */}
                <h3 className={styles.subTitle}>{d.membersTitle} ({(detail.members || []).length})</h3>
                {(detail.members || []).length === 0 ? (
                  <div className={styles.muted}>{d.emptyMembers}</div>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr><th>{d.thEngineer}</th><th>{d.thSnapshot}</th><th>{d.thAdded}</th><th>{d.thAction}</th></tr>
                      </thead>
                      <tbody>
                        {detail.members.map((m) => (
                          <tr key={m.talent_id}>
                            <td>
                              <div className={styles.candName}>{m.talent?.name || `#${m.talent_id}`}</div>
                              <div className={styles.candMeta}>
                                {m.talent && <TalScoreBadge score={m.talent.tal_score} />}
                                {m.talent?.region && <span className={styles.badge}>📍 {m.talent.region}</span>}
                              </div>
                            </td>
                            <td>
                              <div className={styles.candMeta}>
                                {m.snapshot?.tal_score != null && <span className={styles.badge}>🏅 {m.snapshot.tal_score}</span>}
                                {certBadges(m.snapshot?.certs)}
                              </div>
                            </td>
                            <td className={styles.muted}>{m.added_at ? new Date(m.added_at).toLocaleDateString() : '—'}</td>
                            <td>
                              <button className={styles.btnGhost} disabled={busyId === m.talent_id} onClick={() => removeMember(m.talent_id)}>
                                {d.removeBtn}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 候选预览：满足 criteria 且未入池的工程师（后端已排好 tal_score 降序）*/}
                <h3 className={styles.subTitle}>{d.candidatesTitle}</h3>
                {candidates === null ? (
                  <div className={styles.muted}>{d.loading}</div>
                ) : candidates.length === 0 ? (
                  <div className={styles.muted}>{d.emptyCandidates}</div>
                ) : (
                  <div className={styles.candList}>
                    {candidates.map((t) => (
                      <div key={t.id} className={styles.candidateCard}>
                        <div className={styles.candTop}>
                          <span className={styles.candName}>{t.name}</span>
                          <button className={styles.btnPrimarySmall} disabled={busyId === t.id} onClick={() => addMember(t.id)}>
                            {d.addBtn}
                          </button>
                        </div>
                        <div className={styles.candMeta}>
                          <TalScoreBadge score={t.tal_score} />
                          {t.region && <span className={styles.badge}>📍 {t.region}</span>}
                          {certBadges(t.certs)}
                        </div>
                        {t.skills && <div className={styles.candSkills}>🔧 {t.skills}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </ConsoleShell>
    </>
  );
}
