import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { DICT as T } from '../lib/i18n/calculator';
import { pageJsonLd } from '../lib/jsonLd';
import styles from './calculator.module.css';

// 结构化数据（schema.org）。固定取 en 文案——JSON-LD 是给机器读的单一事实源，
// 跟着 UI 语言变会让同一个 @id 在不同语言下出现互相矛盾的描述。见 lib/jsonLd.js。
const JSON_LD = pageJsonLd({
  path: '/calculator',
  type: 'WebPage',
  name: T.en.title,
  description: T.en.metaDesc,
});


// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 四个方向（与 /hire/[track] 同口径）。方向本身不改地区费率区间，仅用于给"这次估算"打标签，
// 让展示的对比报告更贴合场景（例：北美 · PLC · 远程 · 200 小时）。
const TRACKS = [
  { key: 'plc',        label: { en: 'PLC & Controls',  zh: 'PLC 与控制', es: 'PLC y control', vi: 'PLC & Điều khiển', hi: 'PLC और कंट्रोल', fr: 'PLC et contrôle-commande', de: 'PLC & Steuerungstechnik', ja: 'PLC・制御', ko: 'PLC 및 제어' } },
  { key: 'robotics',   label: { en: 'Robotics',        zh: '机器人', es: 'Robótica', vi: 'Robot công nghiệp', hi: 'रोबोटिक्स', fr: 'Robotique', de: 'Robotik', ja: 'ロボティクス', ko: '로보틱스' } },
  { key: 'vision',     label: { en: 'Machine Vision',  zh: '机器视觉', es: 'Visión artificial', vi: 'Thị giác máy', hi: 'मशीन विज़न', fr: 'Vision industrielle', de: 'Bildverarbeitung', ja: 'マシンビジョン', ko: '머신 비전' } },
  { key: 'electrical', label: { en: 'Electrical',      zh: '电气', es: 'Eléctrica', vi: 'Điện', hi: 'इलेक्ट्रिकल', fr: 'Électricité', de: 'Elektrotechnik', ja: '電気', ko: '전기' } },
];

// 各地区费率区间（数字，$/hr）。来源 = 与 /hire/[track].jsx 的 REGIONS 及 /rates 地区基准同口径；
// 当 /api/talent/rate-benchmarks 该地区无实时数据时回退到本静态表。
const REGIONS = [
  { key: 'na',    label: { en: 'North America',          zh: '北美', es: 'Norteamérica', vi: 'Bắc Mỹ', hi: 'उत्तरी अमेरिका', fr: 'Amérique du Nord', de: 'Nordamerika', ja: '北米', ko: '북미' },       range: [75, 140] },
  { key: 'we',    label: { en: 'Western Europe',         zh: '西欧', es: 'Europa Occidental', vi: 'Tây Âu', hi: 'पश्चिमी यूरोप', fr: 'Europe de l’Ouest', de: 'Westeuropa', ja: '西ヨーロッパ', ko: '서유럽' },       range: [70, 120] },
  { key: 'ee',    label: { en: 'Eastern Europe',         zh: '东欧', es: 'Europa del Este', vi: 'Đông Âu', hi: 'पूर्वी यूरोप', fr: 'Europe de l’Est', de: 'Osteuropa', ja: '東ヨーロッパ', ko: '동유럽' },       range: [40, 75] },
  { key: 'latam', label: { en: 'Mexico & Latin America', zh: '墨西哥及拉美', es: 'México y Latinoamérica', vi: 'Mexico & Mỹ Latinh', hi: 'मेक्सिको और लैटिन अमेरिका', fr: 'Mexique et Amérique latine', de: 'Mexiko & Lateinamerika', ja: 'メキシコ・中南米', ko: '멕시코 및 라틴아메리카' }, range: [35, 65] },
  { key: 'cn',    label: { en: 'China',                  zh: '中国', es: 'China', vi: 'Trung Quốc', hi: 'चीन', fr: 'Chine', de: 'China', ja: '中国', ko: '중국' },       range: [35, 70] },
  { key: 'sea',   label: { en: 'Southeast Asia',         zh: '东南亚', es: 'Sudeste Asiático', vi: 'Đông Nam Á', hi: 'दक्षिण-पूर्व एशिया', fr: 'Asie du Sud-Est', de: 'Südostasien', ja: '東南アジア', ko: '동남아시아' },     range: [30, 55] },
  { key: 'sa',    label: { en: 'India & South Asia',     zh: '印度及南亚', es: 'India y el sur de Asia', vi: 'Ấn Độ & Nam Á', hi: 'भारत और दक्षिण एशिया', fr: 'Inde et Asie du Sud', de: 'Indien & Südasien', ja: 'インド・南アジア', ko: '인도 및 남아시아' },  range: [25, 50] },
];

// 平台费率（与 /pricing、定价一页纸同口径）：标准 15%，founding 客户（前 5 单）5%。
const FEE_STANDARD = 0.15;
const FEE_FOUNDING = 0.05;

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
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

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </div>
  );
}
