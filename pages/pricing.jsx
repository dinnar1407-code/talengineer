import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
import styles from './pricing.module.css';

// 站点根 URL：canonical / OG 用（与 /hire/[track] 等页统一口径）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 页内文案词典：Wave 0 只做 en / zh 两套（其余 7 语后续跟进）。
// 数字纪律：15% / 5% / 前 5 单 / 举证 5 天，全部单一来源自 src/config/fees.js、
// docs/pmf/pricing-onepager.md 与 src/routes/disputes.js，页面里不手编任何新数字。
const UI = {
  en: {
    metaTitle: 'Pricing — Transparent Escrow Fees | Talengineer',
    metaDesc:
      'One escrow fee, published up front. Engineers keep 85% of every released milestone; founding employers pay just 5% on their first 5 orders. No agency markup, no gated rates.',
    kicker: 'Pricing',
    heroTitle: 'Transparent pricing. Published up front.',
    heroSub:
      'No login wall to see our fees, no agency markup buried in the rate. One escrow fee on paid milestones — engineers keep the majority of every dollar, employers pay nothing until they approve.',
    ctaPost: 'Post a Project — Free',
    ctaApply: 'Apply as an Engineer',

    // ── 工程师侧（透明轨）──────────────────────────────────────────────
    engTag: 'For engineers',
    engTitle: 'You keep 85% of every milestone',
    engFee: '15%',
    engFeeLabel: 'platform fee, charged only on released milestones',
    engKeepLabel: 'Engineers keep 85% — the fee comes out of the release, never an upfront charge.',
    engWhyTitle: 'Why the 15% earns its keep',
    engWhy: [
      {
        icon: '🎯',
        title: 'Clients come to you',
        desc: 'Matched projects from OEMs and integrators worldwide — no bidding wars, no cold outreach, no lead-gen spend of your own.',
      },
      {
        icon: '🔒',
        title: 'Payment is guaranteed',
        desc: 'The employer funds each milestone into escrow before you start. Your money is already held before you write a line of logic.',
      },
      {
        icon: '⚖️',
        title: 'Disputes are protected',
        desc: 'If a milestone is contested, an admin reviews both sides’ evidence over a 5-day window before any funds move — you are never simply left unpaid.',
      },
      {
        icon: '🏅',
        title: 'Certification opens doors',
        desc: 'Your platform certification is the badge clients hire on. Only certified engineers can be dispatched, so the screen you passed is what wins you the work.',
      },
      {
        icon: '🧰',
        title: 'On-site tooling included',
        desc: 'GPS check-in, QC photo delivery, and a multilingual AI project manager across 9 languages — the field tools come with the platform, not as add-ons.',
      },
    ],

    // ── 雇主侧（founding 轨）──────────────────────────────────────────
    empTag: 'For employers',
    empTitle: '5% for founding clients',
    empFounding: '5%',
    empFoundingLabel: 'escrow fee for founding clients — first 5 orders',
    empStandard: '15%',
    empStandardLabel: 'standard escrow fee',
    empUpfront: '$0 to post & match — you fund a milestone only once you have chosen an engineer.',
    empFoundingNote:
      'The 5% founding rate is a limited PMF-launch offer for the first 5 employers to sign. It is applied per demand, so it holds for each of your first 5 orders.',

    escrowTitle: 'How milestone escrow works',
    escrowSteps: [
      { n: '1', title: 'Fund', desc: 'You fund a milestone into escrow through Stripe Checkout. It is marked funded only after the payment clears.' },
      { n: '2', title: 'Deliver', desc: 'The engineer delivers the milestone — on-site check-ins and completion photos are logged against it.' },
      { n: '3', title: 'Approve', desc: 'You review the deliverable. Funds move only on your approval — nothing releases automatically.' },
      { n: '4', title: 'Release', desc: 'On approval, escrow releases to the engineer minus the platform fee. That fee is the only charge.' },
    ],

    // ── 风险逆转承诺 ─────────────────────────────────────────────────
    riskTitle: 'First milestone not right? Full refund.',
    riskSub:
      'The escrow model exists so your first order carries zero upfront risk. The refund path is built into the product — not a promise in a footer.',
    riskPoints: [
      { title: 'Funds stay in escrow', desc: 'Money you fund is held securely and is never paid to the engineer until you approve the deliverable.' },
      { title: 'Nothing releases while disputed', desc: 'Opening a dispute freezes the milestone. No funds can move while it is under review.' },
      { title: 'Refunded to your original card', desc: 'If the milestone is resolved in your favor, the full escrowed amount is refunded to your original payment method — no store credit, no clawback.' },
    ],

    faqTitle: 'Pricing FAQ',
    faqs: [
      {
        q: 'How is the platform fee calculated?',
        a: 'It is a flat percentage of each released milestone: 15% standard, or 5% for founding clients on their first 5 orders. The rate is read from a single backend configuration, so the fee you see is exactly the fee charged — there is no separate markup.',
      },
      {
        q: 'Who pays the fee — the employer or the engineer?',
        a: 'The employer funds the full milestone amount into escrow. When you approve a release, the platform fee is deducted from that amount and the engineer receives the remainder. On a standard order the engineer keeps 85%; the employer pays no fee beyond funding the milestone.',
      },
      {
        q: 'How do I qualify for the 5% founding rate?',
        a: 'The 5% rate is reserved for the first 5 employers to sign on during our PMF launch, and it applies to each of your first 5 orders. It is set per project, so once you are a founding client the reduced fee travels with your orders.',
      },
      {
        q: 'What is the refund process?',
        a: 'Open a dispute on the milestone. Both sides have a 5-day window to submit evidence, then an admin reviews it. If the dispute is resolved in the employer’s favor, the full escrowed amount is refunded to the original payment method; a split decision refunds the balance not awarded to the engineer.',
      },
      {
        q: 'How do cross-border payments work?',
        a: 'Payments run through Stripe and Stripe Connect. Employers pay by card at checkout; engineers are paid out to their connected Stripe account. Where Stripe payouts are not yet available in an engineer’s country, the platform processes an offline manual payout instead.',
      },
      {
        q: 'Do I get a receipt or invoice?',
        a: 'Yes. Each funding payment runs through Stripe Checkout, which emails a card receipt, and every funded and released milestone is recorded in your Finance dashboard ledger so you have a running record of what was funded, released, and charged.',
      },
    ],

    finalTitle: 'Start with one milestone',
    finalSub: 'Post a project for free and fund only when you have chosen your engineer. Founding-client 5% applies to your first 5 orders.',
  },

  zh: {
    metaTitle: '定价 — 透明托管费率 | Talengineer',
    metaDesc:
      '一笔托管费，明码标价。工程师保留每笔已放款里程碑的 85%；founding 雇主前 5 单仅收 5%。没有中介加价，没有门控费率。',
    kicker: '定价',
    heroTitle: '透明定价，明码标在前面。',
    heroSub:
      '看费率不用登录，费率里也不藏中介加价。只在已付款的里程碑上收一笔托管费——工程师保留每一元的绝大部分，雇主在验收前不付一分钱。',
    ctaPost: '免费发布项目',
    ctaApply: '以工程师身份申请',

    engTag: '面向工程师',
    engTitle: '每笔里程碑你保留 85%',
    engFee: '15%',
    engFeeLabel: '平台费，仅在里程碑放款时收取',
    engKeepLabel: '工程师到手 85%——费用从放款中扣，绝不预收。',
    engWhyTitle: '这 15% 值在哪里',
    engWhy: [
      {
        icon: '🎯',
        title: '客户主动找上门',
        desc: '来自全球设备厂商与集成商的匹配项目——不用低价竞标、不用冷启动获客，也不用自己花钱买线索。',
      },
      {
        icon: '🔒',
        title: '收款有保障',
        desc: '雇主在你开工前就把每个里程碑的资金存入托管。你还没写第一行逻辑，钱已经被锁在托管里。',
      },
      {
        icon: '⚖️',
        title: '纠纷有保护',
        desc: '里程碑一旦有异议，admin 会在 5 天举证窗口内审阅双方证据，之后资金才会流动——绝不会让你白干没钱拿。',
      },
      {
        icon: '🏅',
        title: '认证带来机会',
        desc: '平台认证是客户用人的凭据。只有持证工程师才能被指派，所以你通过的那场筛选，正是帮你拿到活的东西。',
      },
      {
        icon: '🧰',
        title: '现场工具全包',
        desc: 'GPS 签到、质检照片交付、9 语言实时 AI 项目经理——现场工具随平台附带，不是额外收费项。',
      },
    ],

    empTag: '面向雇主',
    empTitle: 'Founding 客户 5%',
    empFounding: '5%',
    empFoundingLabel: 'founding 客户托管费——前 5 单',
    empStandard: '15%',
    empStandardLabel: '标准托管费',
    empUpfront: '发布与匹配 $0——选定工程师后才为里程碑注资。',
    empFoundingNote:
      '5% 的 founding 费率是 PMF 启动期的限量优惠，面向前 5 家签约雇主。它按单需求生效，因此对你前 5 单每一单都成立。',

    escrowTitle: '里程碑托管如何运作',
    escrowSteps: [
      { n: '1', title: '注资', desc: '你通过 Stripe Checkout 把里程碑资金存入托管。付款到账后才标记为已托管。' },
      { n: '2', title: '交付', desc: '工程师交付里程碑——现场签到与完工照片会一并记录在该里程碑上。' },
      { n: '3', title: '验收', desc: '你审阅交付物。资金只在你批准时流动——不会自动放款。' },
      { n: '4', title: '放款', desc: '验收通过后，托管扣除平台费放款给工程师。这笔费用是唯一的收费。' },
    ],

    riskTitle: '首个里程碑不满意？全额退款。',
    riskSub:
      '托管模式的存在，就是为了让你的第一单零预付风险。退款路径写在产品里——不是页脚里的一句承诺。',
    riskPoints: [
      { title: '资金留在托管中', desc: '你注资的钱被安全托管，在你验收交付前绝不会付给工程师。' },
      { title: '争议期间不放款', desc: '开纠纷会冻结该里程碑。复核期间没有任何资金能流动。' },
      { title: '原路退回你的卡', desc: '若里程碑裁决判给你，托管的全额原路退回你的原支付方式——不是储值、不是事后追扣。' },
    ],

    faqTitle: '定价常见问题',
    faqs: [
      {
        q: '平台费怎么算？',
        a: '按每笔已放款里程碑的固定比例收取：标准 15%，founding 客户前 5 单为 5%。费率取自单一的后端配置，所以你看到的费率就是实际收取的费率——没有另外的加价。',
      },
      {
        q: '费用是雇主付还是工程师付？',
        a: '雇主把整笔里程碑金额存入托管。你批准放款时，平台费从这笔金额中扣除，工程师拿到余下部分。标准单里工程师到手 85%；雇主除了为里程碑注资，不再另付费用。',
      },
      {
        q: '怎么才能享受 5% 的 founding 费率？',
        a: '5% 费率留给 PMF 启动期前 5 家签约的雇主，且对你的前 5 单每一单都适用。它按项目设置，所以一旦成为 founding 客户，这个优惠费率会跟着你的订单走。',
      },
      {
        q: '退款流程是怎样的？',
        a: '在里程碑上开纠纷。双方有 5 天窗口提交证据，随后由 admin 复核。若纠纷判给雇主，托管全额原路退回原支付方式；分账裁决则退回未判给工程师的那部分。',
      },
      {
        q: '跨境付款怎么走？',
        a: '付款通过 Stripe 与 Stripe Connect 完成。雇主在结账时刷卡；工程师的款项打到其绑定的 Stripe 账户。若工程师所在国家暂不支持 Stripe 放款，平台会改用线下人工打款处理。',
      },
      {
        q: '有收据或发票吗？',
        a: '有。每笔注资都走 Stripe Checkout，会发送刷卡收据；每一笔已托管与已放款的里程碑都记录在你的资金台账里，让你随时看到注资、放款与收费的完整流水。',
      },
    ],

    finalTitle: '从一个里程碑开始',
    finalSub: '免费发布项目，选定工程师后再注资。Founding 客户 5% 适用于你的前 5 单。',
  },
};

export default function Pricing() {
  const [lang, setLang] = useLang();
  const t = UI[lang] || UI.en;

  const canonical = `${SITE}/pricing`;
  const ogImage = `${SITE}/og.png`;

  // FAQ 结构化数据（AEO）：始终用英文内容，SEO 友好且稳定（照 pages/index.jsx 的 faqJsonLd）。
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: UI.en.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t.metaTitle} />
        <meta property="og:description" content={t.metaDesc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t.metaTitle} />
        <meta name="twitter:description" content={t.metaDesc} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Hero：透明定价宣言 ─────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSub}>{t.heroSub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{t.ctaPost}</Link>
            <Link href="/talent" className={styles.btnGhost}>{t.ctaApply}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 工程师侧（透明轨）───────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.engTag}</span>
          <h2 className={styles.sectionTitle}>{t.engTitle}</h2>
          <div className={styles.priceCard}>
            <div className={styles.priceTag}>{t.engFee}</div>
            <p className={styles.priceLabel}>{t.engFeeLabel}</p>
            <p className={styles.priceMeta}>{t.engKeepLabel}</p>
          </div>

          <h3 className={styles.subTitle}>{t.engWhyTitle}</h3>
          <div className={styles.valueGrid}>
            {t.engWhy.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon} aria-hidden="true">{v.icon}</div>
                <div className={styles.valueTitle}>{v.title}</div>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 雇主侧（founding 轨）────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.empTag}</span>
          <h2 className={styles.sectionTitle}>{t.empTitle}</h2>
          <div className={styles.priceRow}>
            <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
              <div className={styles.priceTag}>{t.empFounding}</div>
              <p className={styles.priceLabel}>{t.empFoundingLabel}</p>
            </div>
            <div className={styles.priceCard}>
              <div className={styles.priceTag}>{t.empStandard}</div>
              <p className={styles.priceLabel}>{t.empStandardLabel}</p>
            </div>
          </div>
          <p className={styles.priceMeta}>{t.empUpfront}</p>
          <p className={styles.note}>{t.empFoundingNote}</p>

          <h3 className={styles.subTitle}>{t.escrowTitle}</h3>
          <div className={styles.stepRow}>
            {t.escrowSteps.map((s) => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum}>{s.n}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 风险逆转承诺 ───────────────────────────────────────────── */}
        <div className={styles.block}>
          <div className={styles.riskBox}>
            <h2 className={styles.riskTitle}>{t.riskTitle}</h2>
            <p className={styles.riskSub}>{t.riskSub}</p>
            <div className={styles.riskPoints}>
              {t.riskPoints.map((p) => (
                <div key={p.title} className={styles.riskPoint}>
                  <div className={styles.riskCheck} aria-hidden="true">✓</div>
                  <div>
                    <div className={styles.riskPointTitle}>{p.title}</div>
                    <p className={styles.riskPointDesc}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 定价 FAQ ───────────────────────────────────────────────── */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{t.faqTitle}</h2>
          <div className={styles.faqList}>
            {t.faqs.map((f) => (
              <div key={f.q} className={styles.faqItem}>
                <div className={styles.faqQ}>{f.q}</div>
                <p className={styles.faqA}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 底部 CTA ─────────────────────────────────────────────────── */}
      <div className={styles.finalCta}>
        <h2>{t.finalTitle}</h2>
        <p>{t.finalSub}</p>
        <Link href="/talent" className={styles.btnPrimary}>{t.ctaPost}</Link>
      </div>

      <footer className={styles.footer}>
        <p>
          © 2026 Talengineer.us · <Link href="/talent">Find Engineers</Link> ·{' '}
          <Link href="/trust">Trust Center</Link> ·{' '}
          <Link href="/rates">Rate Benchmarks</Link>
        </p>
      </footer>
    </div>
  );
}
