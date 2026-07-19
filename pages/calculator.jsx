import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
import styles from './calculator.module.css';

// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 四个方向（与 /hire/[track] 同口径）。方向本身不改地区费率区间，仅用于给"这次估算"打标签，
// 让展示的对比报告更贴合场景（例：北美 · PLC · 远程 · 200 小时）。
const TRACKS = [
  { key: 'plc',        label: { en: 'PLC & Controls',  zh: 'PLC 与控制' } },
  { key: 'robotics',   label: { en: 'Robotics',        zh: '机器人' } },
  { key: 'vision',     label: { en: 'Machine Vision',  zh: '机器视觉' } },
  { key: 'electrical', label: { en: 'Electrical',      zh: '电气' } },
];

// 各地区费率区间（数字，$/hr）。来源 = 与 /hire/[track].jsx 的 REGIONS 及 /rates 地区基准同口径；
// 当 /api/talent/rate-benchmarks 该地区无实时数据时回退到本静态表。
const REGIONS = [
  { key: 'na',    label: { en: 'North America',          zh: '北美' },       range: [75, 140] },
  { key: 'we',    label: { en: 'Western Europe',         zh: '西欧' },       range: [70, 120] },
  { key: 'ee',    label: { en: 'Eastern Europe',         zh: '东欧' },       range: [40, 75] },
  { key: 'latam', label: { en: 'Mexico & Latin America', zh: '墨西哥及拉美' }, range: [35, 65] },
  { key: 'cn',    label: { en: 'China',                  zh: '中国' },       range: [35, 70] },
  { key: 'sea',   label: { en: 'Southeast Asia',         zh: '东南亚' },     range: [30, 55] },
  { key: 'sa',    label: { en: 'India & South Asia',     zh: '印度及南亚' },  range: [25, 50] },
];

// 平台费率（与 /pricing、定价一页纸同口径）：标准 15%，founding 客户（前 5 单）5%。
const FEE_STANDARD = 0.15;
const FEE_FOUNDING = 0.05;

// 页内双语文案（en/zh）。
const T = {
  en: {
    title: 'Cost Calculator — Platform vs Local Hire',
    metaDesc: 'Estimate what a verified, escrow-protected automation engineer costs on Talengineer versus hiring a local full-time engineer. Free, transparent, no signup required.',
    kicker: 'Cost Calculator',
    heroTitle: 'What will this engineer actually cost you?',
    heroSub: 'Compare a verified, escrow-protected Talengineer match against the true cost of a local full-time hire. Numbers use live platform rate benchmarks where available.',
    inputsTitle: 'Your project',
    fieldTrack: 'Discipline',
    fieldRegion: 'Engineer region',
    fieldHours: 'Estimated hours',
    fieldEngagement: 'Engagement',
    engRemote: 'Remote',
    engOnsite: 'On-site / hybrid',
    resultTitle: 'Talengineer platform plan',
    labelLabor: 'Engineer labor',
    labelFee: 'Platform escrow fee (15%)',
    labelTotal: 'Total (standard 15%)',
    labelFounding: 'Total as founding client (5%)',
    perProject: 'for this project',
    sourceLive: 'Rates from live platform benchmarks for this region.',
    sourceFallback: 'Rates from regional reference ranges (no live benchmark for this region yet).',
    onsiteNote: 'On-site / hybrid uses the upper half of the regional range — on-site commissioning carries a premium.',
    remoteNote: 'Remote work uses the lower half of the regional range.',
    vsTitle: 'vs hiring a local full-time engineer',
    vsIntro: 'The platform number above is the near-complete cost. A local full-time hire carries costs that never show up on the hourly rate:',
    vs1Title: 'Time-to-hire',
    vs1Body: 'In markets like the US, controls-engineer searches routinely stretch past 60 days. Your line stays down while you search.',
    vs2Title: 'Benefits & payroll burden',
    vs2Body: 'A salary is only part of it — benefits, insurance, payroll taxes and overhead are layered on top of every full-time hire.',
    vs3Title: 'Idle cost',
    vs3Body: 'You pay a full-time salary between projects too. On the platform you pay for the hours a project actually needs — nothing when there is no work.',
    vs4Title: 'Verified before they start',
    vs4Body: 'Every matched engineer is platform-certified and works under milestone escrow — first milestone not satisfied, full refund.',
    honestNote: 'We deliberately do not put a dollar figure on the local-hire side — the real number depends on your market, role and benefits. The point is the categories of cost you avoid.',
    leadTitle: 'Want this comparison in your inbox?',
    leadBody: 'Drop your email and we will send the full breakdown as a report you can share with your team. No spam, unsubscribe anytime.',
    leadPlaceholder: 'you@company.com',
    leadBtn: 'Subscribe & receive report',
    leadBtnSending: 'Sending…',
    leadOk: 'Thanks — you are subscribed. The full report is on its way.',
    leadAlready: 'You are already on the list — thanks for coming back.',
    leadErr: 'Something went wrong. Please check the email and try again.',
    leadInvalid: 'Please enter a valid email address.',
    ctaTitle: 'Ready to see real matches?',
    ctaBody: 'Post your project free and match with pre-screened, certified engineers under milestone escrow.',
    ctaBtn: 'Post a Project — Free',
    pricingLink: 'See full pricing',
    hoursUnit: 'hours',
  },
  zh: {
    title: '成本计算器 — 平台 vs 本地雇佣',
    metaDesc: '估算在 Talengineer 上雇佣一位经过验证、托管保障的自动化工程师，与本地全职雇佣相比的成本。免费、透明、无需注册。',
    kicker: '成本计算器',
    heroTitle: '这位工程师到底要花你多少钱？',
    heroSub: '把 Talengineer 上一位经过验证、托管保障的匹配，与本地全职雇佣的真实成本做对比。有实时数据的地区用平台实时费率基准。',
    inputsTitle: '你的项目',
    fieldTrack: '方向',
    fieldRegion: '工程师地区',
    fieldHours: '预估工时',
    fieldEngagement: '用工形态',
    engRemote: '远程',
    engOnsite: '驻场 / 混合',
    resultTitle: 'Talengineer 平台方案',
    labelLabor: '工程师劳务',
    labelFee: '平台托管费（15%）',
    labelTotal: '合计（标准 15%）',
    labelFounding: 'Founding 客户合计（5%）',
    perProject: '本项目',
    sourceLive: '费率来自该地区的平台实时基准。',
    sourceFallback: '费率来自地区参考区间（该地区暂无实时基准）。',
    onsiteNote: '驻场 / 混合取地区区间的上半段——现场调试有溢价。',
    remoteNote: '远程工作取地区区间的下半段。',
    vsTitle: 'vs 本地全职雇佣一位工程师',
    vsIntro: '上面的平台数字已接近全部成本。而本地全职雇佣，还有一些永远不会体现在时薪上的成本：',
    vs1Title: '招聘周期',
    vs1Body: '在美国这类市场，控制工程师招聘动辄超过 60 天。搜寻期间你的产线一直停着。',
    vs2Title: '社保与用工负担',
    vs2Body: '薪资只是一部分——社保、保险、工资税与管理成本，会叠加在每一个全职岗位之上。',
    vs3Title: '闲置成本',
    vs3Body: '项目间歇期你照样要付全职薪资。在平台上你只为项目真正需要的工时付费——没活时不产生成本。',
    vs4Title: '上岗前已验证',
    vs4Body: '每位匹配的工程师都经过平台认证，并在里程碑托管下工作——首个里程碑不满意，全额退款。',
    honestNote: '我们刻意不给本地雇佣一侧标一个具体金额——真实数字取决于你所在市场、岗位与福利。重点是你能省掉的这几类成本。',
    leadTitle: '想把这份对比发到你邮箱？',
    leadBody: '留下邮箱，我们会把完整对比整理成一份可与团队分享的报告发给你。不发垃圾邮件，随时可退订。',
    leadPlaceholder: 'you@company.com',
    leadBtn: '订阅并接收报告',
    leadBtnSending: '发送中…',
    leadOk: '谢谢——你已订阅，完整报告即将送达。',
    leadAlready: '你已经在订阅列表里了——欢迎回来。',
    leadErr: '出了点问题，请检查邮箱后重试。',
    leadInvalid: '请输入有效的邮箱地址。',
    ctaTitle: '想看看真实的匹配？',
    ctaBody: '免费发布项目，在里程碑托管下与经过预审、持证的工程师匹配。',
    ctaBtn: '免费发布项目',
    pricingLink: '查看完整定价',
    hoursUnit: '小时',
  },
};

// 金额格式化：四舍五入到整数 + 千分位，前缀 $。
function fmt(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

// 把一个金额区间格式化为 "$低 – $高"（低高相等时只显示一个）。
function fmtRange(low, high) {
  return low === high ? fmt(low) : `${fmt(low)} – ${fmt(high)}`;
}

// 在实时基准数组里为选中地区找匹配项：地区名不区分大小写地相等或互相包含即算命中。
// talents.region 是自由文本，做模糊匹配；空字符串不参与，避免误命中。
// 子串包含只允许长度≥4 的词参与：两字母 key（如 'na'/'sa'）会与 'china'/'vietnam'/'usa'
// 误配，导致选北美却静默用中国实时费率还标注 live——审查确认的真 bug。相等匹配不受限；
// 配不上宁可回退静态区间表，也不给贴错地区的"实时"数字。
function matchBenchmark(regionObj, benchmarks) {
  if (!Array.isArray(benchmarks)) return null;
  const targets = [regionObj.label.en.toLowerCase(), String(regionObj.key || '').toLowerCase()];
  return (
    benchmarks.find((b) => {
      const r = String(b.region || '').toLowerCase();
      if (!r) return false;
      return targets.some(
        (t) => r === t || (t.length >= 4 && r.includes(t)) || (r.length >= 4 && t.includes(r))
      );
    }) || null
  );
}

// 邮箱基础校验（前端只做轻校验，真正的权威校验在后端 zod）。
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Calculator() {
  const [lang, setLang] = useLang();
  const t = T[lang] || T.en;

  // 表单状态
  const [track, setTrack] = useState('plc');
  const [regionKey, setRegionKey] = useState('na');
  const [hours, setHours] = useState(200);
  const [engagement, setEngagement] = useState('remote'); // 'remote' | 'onsite'

  // 实时费率基准（页面加载时拉一次；失败则为 null，全程回退静态表）
  const [benchmarks, setBenchmarks] = useState(null);

  // Lead capture 状态：idle | sending | ok | already | error | invalid
  const [email, setEmail] = useState('');
  const [leadState, setLeadState] = useState('idle');

  // 页面加载：拉取公开的费率基准。失败静默回退（不弹错、不阻断计算）。
  useEffect(() => {
    let cancelled = false;
    fetch('/api/talent/rate-benchmarks')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        setBenchmarks(json && Array.isArray(json.data) ? json.data : null);
      })
      .catch(() => {
        // 静默：拉不到实时数据就用静态参考区间，页面照常可用。
        if (!cancelled) setBenchmarks(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const regionObj = useMemo(() => REGIONS.find((r) => r.key === regionKey) || REGIONS[0], [regionKey]);

  // 计算：实时基准优先，回退静态区间；再按用工形态取半段区间；乘工时与平台费。
  const calc = useMemo(() => {
    const bench = matchBenchmark(regionObj, benchmarks);
    const usedLive =
      !!bench && Number.isFinite(bench.min) && Number.isFinite(bench.max) && bench.max > 0;
    const [low, high] = usedLive ? [bench.min, bench.max] : regionObj.range;

    const mid = Math.round((low + high) / 2);
    // 远程取下半段 [low, mid]，驻场/混合取上半段 [mid, high]（现场调试溢价）。
    const [rateLow, rateHigh] = engagement === 'onsite' ? [mid, high] : [low, mid];

    const h = Math.max(0, Number(hours) || 0);
    const laborLow = rateLow * h;
    const laborHigh = rateHigh * h;

    return {
      usedLive,
      rateLow,
      rateHigh,
      laborLow,
      laborHigh,
      feeLow: laborLow * FEE_STANDARD,
      feeHigh: laborHigh * FEE_STANDARD,
      totalLow: laborLow * (1 + FEE_STANDARD),
      totalHigh: laborHigh * (1 + FEE_STANDARD),
      foundingLow: laborLow * (1 + FEE_FOUNDING),
      foundingHigh: laborHigh * (1 + FEE_FOUNDING),
    };
  }, [regionObj, benchmarks, engagement, hours]);

  async function handleSubscribe(e) {
    e.preventDefault();
    if (leadState === 'sending') return;
    if (!EMAIL_RE.test(email.trim())) {
      setLeadState('invalid');
      return;
    }
    setLeadState('sending');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'calculator', lang }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setLeadState(json.already ? 'already' : 'ok');
      } else {
        setLeadState('error');
      }
    } catch (err) {
      // 网络等异常：给用户可重试的错误提示，不吞错。
      console.error('[calculator] subscribe failed', err);
      setLeadState('error');
    }
  }

  const canonical = `${SITE}/calculator`;
  const ogImage = `${SITE}/og.png`;

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${t.title} | Talengineer`}</title>
        <meta name="description" content={t.metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t.title} />
        <meta property="og:description" content={t.metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.title} />
        <meta name="twitter:description" content={t.metaDesc} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSub}>{t.heroSub}</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* ── 输入面板 ─────────────────────────────── */}
          <div className={styles.inputsCard}>
            <h2 className={styles.cardTitle}>{t.inputsTitle}</h2>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t.fieldTrack}</span>
              <select
                className={styles.select}
                value={track}
                onChange={(e) => setTrack(e.target.value)}
              >
                {TRACKS.map((tr) => (
                  <option key={tr.key} value={tr.key}>
                    {tr.label[lang] || tr.label.en}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t.fieldRegion}</span>
              <select
                className={styles.select}
                value={regionKey}
                onChange={(e) => setRegionKey(e.target.value)}
              >
                {REGIONS.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label[lang] || r.label.en}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>
                {t.fieldHours}: <strong className={styles.hoursValue}>{hours} {t.hoursUnit}</strong>
              </span>
              <input
                type="range"
                min="20"
                max="2000"
                step="20"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className={styles.range}
              />
              <input
                type="number"
                min="0"
                step="10"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className={styles.numberInput}
              />
            </label>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t.fieldEngagement}</span>
              <div className={styles.segmented}>
                <button
                  type="button"
                  className={engagement === 'remote' ? styles.segActive : styles.seg}
                  onClick={() => setEngagement('remote')}
                >
                  {t.engRemote}
                </button>
                <button
                  type="button"
                  className={engagement === 'onsite' ? styles.segActive : styles.seg}
                  onClick={() => setEngagement('onsite')}
                >
                  {t.engOnsite}
                </button>
              </div>
            </div>
          </div>

          {/* ── 结果面板：平台方案 ─────────────────────── */}
          <div className={styles.resultCard}>
            <h2 className={styles.cardTitle}>{t.resultTitle}</h2>

            <div className={styles.lineItem}>
              <span>{t.labelLabor}</span>
              <span className={styles.num}>{fmtRange(calc.laborLow, calc.laborHigh)}</span>
            </div>
            <div className={styles.lineItem}>
              <span>{t.labelFee}</span>
              <span className={styles.num}>{fmtRange(calc.feeLow, calc.feeHigh)}</span>
            </div>
            <div className={styles.totalItem}>
              <span>{t.labelTotal}</span>
              <span className={styles.totalNum}>{fmtRange(calc.totalLow, calc.totalHigh)}</span>
            </div>
            <div className={styles.foundingItem}>
              <span>{t.labelFounding}</span>
              <span className={styles.num}>{fmtRange(calc.foundingLow, calc.foundingHigh)}</span>
            </div>

            <p className={styles.sourceNote}>
              {calc.usedLive ? t.sourceLive : t.sourceFallback}
              {' '}
              {engagement === 'onsite' ? t.onsiteNote : t.remoteNote}
            </p>
            <Link href="/pricing" className={styles.pricingLink}>{t.pricingLink} →</Link>
          </div>
        </div>

        {/* ── 定性对比：本地全职雇佣 ─────────────────────── */}
        <div className={styles.vsBlock}>
          <h2 className={styles.sectionTitle}>{t.vsTitle}</h2>
          <p className={styles.vsIntro}>{t.vsIntro}</p>
          <div className={styles.vsGrid}>
            <div className={styles.vsCard}>
              <h3>{t.vs1Title}</h3>
              <p>{t.vs1Body}</p>
            </div>
            <div className={styles.vsCard}>
              <h3>{t.vs2Title}</h3>
              <p>{t.vs2Body}</p>
            </div>
            <div className={styles.vsCard}>
              <h3>{t.vs3Title}</h3>
              <p>{t.vs3Body}</p>
            </div>
            <div className={styles.vsCard}>
              <h3>{t.vs4Title}</h3>
              <p>{t.vs4Body}</p>
            </div>
          </div>
          <p className={styles.honestNote}>{t.honestNote}</p>
        </div>

        {/* ── Lead capture ──────────────────────────────── */}
        <div className={styles.leadBlock}>
          <h2 className={styles.leadTitle}>{t.leadTitle}</h2>
          <p className={styles.leadBody}>{t.leadBody}</p>
          <form className={styles.leadForm} onSubmit={handleSubscribe}>
            <input
              type="email"
              className={styles.emailInput}
              placeholder={t.leadPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (leadState === 'invalid' || leadState === 'error') setLeadState('idle');
              }}
              aria-label={t.leadPlaceholder}
            />
            <button
              type="submit"
              className={styles.leadBtn}
              disabled={leadState === 'sending'}
            >
              {leadState === 'sending' ? t.leadBtnSending : t.leadBtn}
            </button>
          </form>
          {leadState === 'ok' && <p className={styles.leadMsgOk}>{t.leadOk}</p>}
          {leadState === 'already' && <p className={styles.leadMsgOk}>{t.leadAlready}</p>}
          {leadState === 'invalid' && <p className={styles.leadMsgErr}>{t.leadInvalid}</p>}
          {leadState === 'error' && <p className={styles.leadMsgErr}>{t.leadErr}</p>}
        </div>
      </div>

      {/* ── 底部 CTA ───────────────────────────────────── */}
      <div className={styles.finalCta}>
        <h2>{t.ctaTitle}</h2>
        <p>{t.ctaBody}</p>
        <Link href="/talent" className={styles.btnPrimary}>{t.ctaBtn}</Link>
      </div>

      <footer className={styles.footer}>
        <p>
          © 2025 Talengineer.us · <Link href="/talent">Find Engineers</Link> ·{' '}
          <Link href="/rates">Rate Benchmarks</Link> ·{' '}
          <Link href="/pricing">Pricing</Link>
        </p>
      </footer>
    </div>
  );
}
