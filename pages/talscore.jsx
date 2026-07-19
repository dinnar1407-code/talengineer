import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
import styles from './talscore.module.css';

// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 四维权重与计分口径 —— 单一来源是 src/services/talScore.js，此处照抄核实过的数字。
// AI 筛选 25 + 平台认证 25 + 雇主评分 30 + 可靠性 20 = 100。
const DIMENSIONS = [
  {
    key: 'ai',
    weight: 25,
    color: '#2f74d9',
    en: {
      name: 'AI Technical Screening',
      ask: 'Can they actually do the work — not just talk about it?',
      body: 'Every engineer passes a practical AI technical interview before they can be matched. That 0–100 score maps directly onto 25 points. It is the capability baseline; nobody skips it.',
    },
    zh: {
      name: 'AI 技术筛选',
      ask: '他们是真能干活，还是只会说？',
      body: '每位工程师被匹配前都要通过一套实操型 AI 技术面试。那个 0–100 的分数直接折算成 25 分。这是能力基线，谁都绕不过。',
    },
  },
  {
    key: 'certification',
    weight: 25,
    color: '#8b5cf6',
    en: {
      name: 'Platform Certification',
      ask: 'Can they prove it under exam conditions?',
      body: 'Points come from timed, proctored certification exams — L1 = 8, L2 = 16, L3 = 25 per track, capped at 25. Self-reported résumé skills earn nothing here. Only what was verified counts.',
    },
    zh: {
      name: '平台认证',
      ask: '他们能在考试条件下证明自己吗？',
      body: '分数来自限时监考的认证考试——单方向 L1 = 8、L2 = 16、L3 = 25，封顶 25。简历上自报的技能在这一维一分不给。只有被验证过的才算数。',
    },
  },
  {
    key: 'rating',
    weight: 30,
    color: '#10b981',
    en: {
      name: 'Employer Rating',
      ask: 'Did the engineer deliver on time, every time?',
      body: 'The largest slice — real ratings from employers after real jobs. We use a Bayesian average, not a raw one, so a single glowing review cannot game the number.',
    },
    zh: {
      name: '雇主评分',
      ask: '这位工程师是不是每一次都按时交付？',
      body: '占比最大的一维——来自雇主在真实成交后打的分。我们用贝叶斯平均而非裸均分，所以单独一条好评刷不动这个数字。',
    },
  },
  {
    key: 'reliability',
    weight: 20,
    color: '#f5b301',
    en: {
      name: 'Reliability',
      ask: 'Do they finish what they start, without disputes?',
      body: 'One point per completed order (capped at 10) plus a 10-point no-dispute bonus. But there is a red line: if more than 1 in 10 jobs ends in a dispute, this entire 20-point dimension drops to zero.',
    },
    zh: {
      name: '可靠性',
      ask: '他们能善始善终、不惹纠纷吗？',
      body: '每完成一单计 1 分（封顶 10），外加 10 分的无纠纷奖励。但有一条红线：一旦纠纷率超过十分之一，这整个 20 分的维度直接归零。',
    },
  },
];

// 四档徽章 —— 阈值取自 talScore.js 的 TIER_THRESHOLDS。
const TIERS = [
  { key: 'platinum', color: '#7d93b2', min: 85, en: { name: 'Platinum', range: '85–100' }, zh: { name: '铂金', range: '85–100' } },
  { key: 'gold', color: '#d4af37', min: 70, en: { name: 'Gold', range: '70–84' }, zh: { name: '金', range: '70–84' } },
  { key: 'silver', color: '#9ca3af', min: 55, en: { name: 'Silver', range: '55–69' }, zh: { name: '银', range: '55–69' } },
  { key: 'bronze', color: '#c07a3e', min: 0, en: { name: 'Bronze', range: 'below 55' }, zh: { name: '青铜', range: '低于 55' } },
];

const UI = {
  en: {
    kicker: 'Quality Score',
    title: 'The score is not a black box',
    sub: 'TalScore rolls four verifiable signals into one 0–100 number that employers can sort and gate by. Here is exactly how every point is earned — and how we stop it from being gamed.',
    ctaEmployer: 'Filter engineers by score',
    ctaEngineer: 'How to raise your score',
    dimsTitle: 'Four signals, one number',
    dimsIntro: 'Each dimension answers a question an employer actually cares about. The weights add up to 100.',
    weightLabel: 'weight',
    rulesTitle: 'How the points are calculated',
    ruleCol1: 'Dimension',
    ruleCol2: 'Max',
    ruleCol3: 'How it is earned',
    bayesTitle: 'Why a Bayesian average, not a plain one',
    bayesBody: 'A raw average lets one 5-star review rocket a brand-new engineer to the top of the list. Instead, every engineer starts as if they already had 5 reviews at 3.5 stars — the platform-wide prior. Real reviews then pull the number toward the truth as they accumulate. A veteran with 40 honest reviews reflects their real record; a newcomer with one review does not get to fake a perfect one.',
    disputeTitle: 'The dispute red line',
    disputeBody: 'Reliability is not a nice-to-have — it is a gate. Completed orders and a clean dispute record build it up, but if more than 10% of an engineer’s jobs end in a dispute, the whole 20-point dimension collapses to zero. No partial credit. On industrial sites, a pattern of disputes is disqualifying, and the score treats it that way.',
    liveTitle: 'A live number, not a monthly snapshot',
    liveBody: 'TalScore is recomputed on the events that actually change an engineer’s standing: every completed order, every new review, and every certification issued. There is no monthly batch job to wait for — the moment the underlying facts move, so does the score.',
    liveEvents: [
      { t: 'Order completed', d: 'reliability and, if reviewed, rating update' },
      { t: 'Review submitted', d: 'the Bayesian rating is recalculated' },
      { t: 'Certification issued', d: 'the certification points step up' },
    ],
    tiersTitle: 'Four badge tiers',
    tiersIntro: 'The final 0–100 score maps to a badge employers see at a glance.',
    ctaHeading: 'See the score in action',
    ctaBody: 'Employers sort and gate their shortlist by TalScore. Engineers raise it by getting certified and delivering clean, on-time work.',
  },
  zh: {
    kicker: '质量分',
    title: '分数不是黑箱',
    sub: 'TalScore 把四个可验证的信号汇成一个 0–100 的数字，雇主可以据此排序、设门槛。这里把每一分怎么挣到、我们怎么防刷分，全部讲清楚。',
    ctaEmployer: '按分数筛选工程师',
    ctaEngineer: '怎么提高你的分数',
    dimsTitle: '四个信号，一个数字',
    dimsIntro: '每一维都回答一个雇主真正在意的问题。权重合计 100。',
    weightLabel: '权重',
    rulesTitle: '分数是怎么算出来的',
    ruleCol1: '维度',
    ruleCol2: '满分',
    ruleCol3: '怎么挣到',
    bayesTitle: '为什么用贝叶斯平均，而不是裸均分',
    bayesBody: '裸均分会让一条 5 星好评把一个全新工程师直接顶到榜首。我们的做法是：每位工程师起步时就仿佛已经有了 5 条 3.5 星的评价——这是全站先验。随后真实评价越攒越多，数字就越靠近真相。有 40 条诚实评价的老手反映的是他真实的记录；只有一条评价的新人，没法靠一条满分作假。',
    disputeTitle: '纠纷红线',
    disputeBody: '可靠性不是锦上添花，而是一道门槛。完单和干净的纠纷记录把它撑起来，但只要一位工程师超过 10% 的任务以纠纷收场，这整个 20 分的维度就坍缩到零。没有部分得分。在工业现场，成规律的纠纷是一票否决，分数就这么对待它。',
    liveTitle: '这是实时数字，不是月度快照',
    liveBody: 'TalScore 会在真正改变工程师处境的事件上重算：每一次成单、每一条新评价、每一张发出的证书。不用等月度批处理——底层事实一动，分数就跟着动。',
    liveEvents: [
      { t: '成单', d: '可靠性、以及（若有评价）评分随之更新' },
      { t: '提交评价', d: '贝叶斯评分重新计算' },
      { t: '发放认证', d: '认证维度的点数上调' },
    ],
    tiersTitle: '四档徽章',
    tiersIntro: '最终的 0–100 分映射成雇主一眼可见的徽章。',
    ctaHeading: '看看分数怎么用',
    ctaBody: '雇主按 TalScore 排序、设门槛筛人。工程师靠考取认证、干净准时地交付把它提上去。',
  },
};

// 计分细则表：数字全部与 talScore.js 一致。
const RULES = {
  en: [
    { dim: 'AI Technical Screening', max: '25', how: 'Onboarding AI interview score (0–100) mapped linearly to 0–25.' },
    { dim: 'Platform Certification', max: '25', how: 'Highest level per track: L1 = 8, L2 = 16, L3 = 25. Summed across tracks, capped at 25.' },
    { dim: 'Employer Rating', max: '30', how: 'Bayesian-averaged star rating (prior: 5 reviews at 3.5★) mapped from 0–5 stars onto 0–30.' },
    { dim: 'Reliability', max: '20', how: '1 point per completed order (cap 10) + 10 for a clean record. Dispute rate over 10% → the whole dimension is 0.' },
  ],
  zh: [
    { dim: 'AI 技术筛选', max: '25', how: '入网 AI 面试分（0–100）线性映射到 0–25。' },
    { dim: '平台认证', max: '25', how: '每方向取最高级：L1 = 8、L2 = 16、L3 = 25，跨方向累加后封顶 25。' },
    { dim: '雇主评分', max: '30', how: '贝叶斯平均星级（先验：5 条 3.5★），从 0–5 星映射到 0–30。' },
    { dim: '可靠性', max: '20', how: '每完单 1 分（封顶 10）+ 记录干净 10 分。纠纷率超 10% → 整维归 0。' },
  ],
};

export default function TalScore() {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;
  const rules = RULES[lang] || RULES.en;

  const canonical = `${SITE}/talscore`;
  const ogImage = `${SITE}/og.png`;

  return (
    <div className={styles.page}>
      <Head>
        <title>{`TalScore — how our engineer quality score works | Talengineer`}</title>
        <meta name="description" content={u.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="TalScore — the engineer quality score, explained" />
        <meta property="og:description" content={u.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TalScore — the engineer quality score, explained" />
        <meta name="twitter:description" content={u.sub} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{u.kicker}</p>
          <h1 className={styles.heroTitle}>{u.title}</h1>
          <p className={styles.heroSub}>{u.sub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{u.ctaEmployer}</Link>
            <Link href="/training" className={styles.btnGhost}>{u.ctaEngineer}</Link>
          </div>
          <div className={styles.formula}>
            <span className={styles.formulaTerm} style={{ '--c': DIMENSIONS[0].color }}>25</span>
            <span className={styles.formulaOp}>+</span>
            <span className={styles.formulaTerm} style={{ '--c': DIMENSIONS[1].color }}>25</span>
            <span className={styles.formulaOp}>+</span>
            <span className={styles.formulaTerm} style={{ '--c': DIMENSIONS[2].color }}>30</span>
            <span className={styles.formulaOp}>+</span>
            <span className={styles.formulaTerm} style={{ '--c': DIMENSIONS[3].color }}>20</span>
            <span className={styles.formulaOp}>=</span>
            <span className={styles.formulaTotal}>100</span>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* 四维卡片 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.dimsTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.dimsIntro}</p>
          <div className={styles.dimGrid}>
            {DIMENSIONS.map((d) => {
              const c = d[lang] || d.en;
              return (
                <div key={d.key} className={styles.dimCard} style={{ '--c': d.color }}>
                  <div className={styles.dimHead}>
                    <span className={styles.dimName}>{c.name}</span>
                    <span className={styles.dimWeight}>{d.weight} <em>{u.weightLabel}</em></span>
                  </div>
                  <p className={styles.dimAsk}>{c.ask}</p>
                  <p className={styles.dimBody}>{c.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 计分细则表 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.rulesTitle}</h2>
          <table className={styles.rulesTable}>
            <thead>
              <tr>
                <th>{u.ruleCol1}</th>
                <th>{u.ruleCol2}</th>
                <th>{u.ruleCol3}</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.dim}>
                  <td>{r.dim}</td>
                  <td className={styles.maxCell}>{r.max}</td>
                  <td>{r.how}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.callout}>
            <h3 className={styles.calloutTitle}>{u.bayesTitle}</h3>
            <p className={styles.calloutBody}>{u.bayesBody}</p>
          </div>
          <div className={`${styles.callout} ${styles.calloutDanger}`}>
            <h3 className={styles.calloutTitle}>{u.disputeTitle}</h3>
            <p className={styles.calloutBody}>{u.disputeBody}</p>
          </div>
        </div>

        {/* 四档徽章 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.tiersTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.tiersIntro}</p>
          <div className={styles.tierGrid}>
            {TIERS.map((tr) => {
              const c = tr[lang] || tr.en;
              return (
                <div key={tr.key} className={styles.tierCard} style={{ '--c': tr.color }}>
                  <span className={styles.tierDot} />
                  <span className={styles.tierName}>{c.name}</span>
                  <span className={styles.tierRange}>{c.range}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 事件触发重算 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.liveTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.liveBody}</p>
          <div className={styles.eventRow}>
            {u.liveEvents.map((e) => (
              <div key={e.t} className={styles.eventCard}>
                <div className={styles.eventTrigger}>{e.t}</div>
                <div className={styles.eventArrow}>&#8595;</div>
                <div className={styles.eventEffect}>{e.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <div className={styles.heroBtns} style={{ justifyContent: 'center' }}>
          <Link href="/talent" className={styles.btnPrimary}>{u.ctaEmployer}</Link>
          <Link href="/certification" className={styles.btnGhost}>{u.ctaEngineer}</Link>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>
          © 2025 Talengineer.us · <Link href="/talent">Find Engineers</Link> ·{' '}
          <Link href="/certification">Certification</Link> ·{' '}
          <Link href="/rates">Rate Benchmarks</Link>
        </p>
      </footer>
    </div>
  );
}
