import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
import styles from './trust.module.css';

// 站点根 URL：canonical / OG 用（与 /hire/[track]、/pricing 等页统一口径）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 页内文案词典：Wave 0 只做 en / zh 两套（其余 7 语后续跟进）。
// 诚实纪律：每条信任声明都对应真实代码实体，不夸大、不编造成交统计。
// 数字来源：举证 5 天 (src/routes/disputes.js)、KYC 24h (src/routes/kyc.js)、
// 税表签名 URL 5 分钟 (src/routes/tax.js)、围栏默认 500m (src/utils/geo.js)。
const UI = {
  en: {
    metaTitle: 'Trust Center — Escrow, Disputes & Verification | Talengineer',
    metaDesc:
      'How Talengineer protects both sides: milestone escrow that releases only on approval, a 5-day evidence dispute process with refunds to your original card, KYC and tax verification, and a GPS + QC-photo evidence chain for on-site work.',
    kicker: 'Trust Center',
    heroTitle: 'Trust is infrastructure, not a slogan.',
    heroSub:
      'Every claim on this page maps to something the platform actually does — escrow that holds your money until you approve, a dispute process with a fixed evidence window, verified identities, and an evidence trail for on-site delivery. Here is exactly how each works.',
    ctaPost: 'Post a Project — Free',

    // ── 托管资金流四步 ──────────────────────────────────────────────
    escrowTag: 'Escrow',
    escrowTitle: 'How your money is held',
    escrowLead:
      'Funds are held securely and released only when you approve each deliverable — a milestone is marked funded only after the payment actually clears, and it releases only on your approval.',
    escrowSteps: [
      { icon: '💳', n: '1', title: 'Fund', desc: 'You fund a milestone through Stripe Checkout. It is marked funded only after Stripe confirms the payment — nothing is ever “held” on trust.' },
      { icon: '🔧', n: '2', title: 'Deliver', desc: 'The engineer works the milestone. On-site check-ins and completion photos are logged against it as it progresses.' },
      { icon: '✅', n: '3', title: 'Approve', desc: 'You review the deliverable. Funds move only when you approve — the platform never auto-releases on a timer.' },
      { icon: '🔓', n: '4', title: 'Release', desc: 'On approval, escrow releases to the engineer minus the platform fee, with a duplicate-transfer guard so a release can never fire twice.' },
    ],

    // ── 纠纷与退款流程 ──────────────────────────────────────────────
    disputeTag: 'Disputes & refunds',
    disputeTitle: 'What happens if something goes wrong',
    disputeLead:
      'If you are not satisfied, opening a dispute freezes the milestone before any money moves. Both sides submit evidence within a fixed window, an admin reviews it, and the outcome determines where the escrowed funds go — including a full refund to your original card.',
    disputeSteps: [
      { icon: '🚩', n: '1', title: 'Open', desc: 'Either party to the project can open a dispute on a funded milestone. Doing so immediately freezes it to “disputed” — no funds can move.' },
      { icon: '📎', n: '2', title: 'Evidence', desc: 'Both sides have a 5-day window to submit evidence. Each party’s side is recorded server-side from their role — it cannot be spoofed.' },
      { icon: '👤', n: '3', title: 'Admin review', desc: 'A platform admin reviews the milestone spec and both evidence submissions before any funds move.' },
      { icon: '↩️', n: '4', title: 'Resolution', desc: 'The admin rules for the engineer, for the employer, or a split. Rule for the employer and the full escrowed amount is refunded to the original card; a split refunds the balance not awarded.' },
    ],
    disputeNote:
      'Only one open dispute can exist per milestone, and a resolution is protected by an atomic guard so it can never double-pay or double-refund.',

    // ── 身份与合规核验 ─────────────────────────────────────────────
    verifyTag: 'Identity & compliance',
    verifyTitle: 'Who you are actually working with',
    verifyLead:
      'Payment protection only matters if the people on the other side are real and accountable. Identity, tax, and insurance documents are verified before they count — and sensitive files never sit behind a public URL.',
    verifyCards: [
      { icon: '🪪', title: 'Business KYC', meta: 'Reviewed within 24h', desc: 'Employers submit company details for verification. Status moves from pending to verified after our team reviews the submission — typically within 24 hours.' },
      { icon: '📄', title: 'W-9 tax documents', meta: '5-min signed access', desc: 'Tax forms are stored in a private bucket that denies all public access. Even an admin can only view a file through a signed link that expires after 5 minutes.' },
      { icon: '🛡️', title: 'Insurance & credentials', meta: 'Expiry tracked · admin-reviewed', desc: 'Certificates of insurance and platform credentials are uploaded with issue and expiry dates, then verified or rejected by an admin — self-reported claims do not count on their own.' },
    ],

    // ── 现场交付证据链 ─────────────────────────────────────────────
    fieldTag: 'On-site evidence chain',
    fieldTitle: 'Proof the work actually happened',
    fieldLead:
      'For on-site commissioning, the platform builds an evidence trail so a remote employer can trust a job done a continent away — location and delivery photos are captured against the milestone itself.',
    fieldCards: [
      { icon: '📍', title: 'GPS check-in', meta: 'Server-side geofence', desc: 'At check-in, the platform computes the distance from the job site on the server (clients cannot fake it) and records it against the milestone. Check-ins outside the geofence still succeed but are flagged for the employer to see.' },
      { icon: '🎓', title: 'Certified before check-in', meta: 'Gated at the door', desc: 'A valid platform certification is required before an engineer can check in on-site — a second gate on top of assignment, so a revoked badge stops work at the door.' },
      { icon: '📷', title: 'QC delivery photos', meta: 'Logged to the milestone', desc: 'On completion, the engineer submits photos and notes that attach to the milestone, giving the employer a visual record to approve against before any funds release.' },
    ],

    finalTitle: 'Protection you can see, on your first order',
    finalSub: 'Post a project for free. Fund one milestone into escrow and watch every safeguard on this page work before you approve.',

    // 诚实空态说明：我们尚无真实成交统计，因此用 founding cohort 叙事而非编造数字。
    cohortNote:
      'Talengineer is in its founding phase. We do not publish “companies served” counts we cannot yet stand behind — the protections above are what an early customer relies on, and they are live in the product today.',
  },

  zh: {
    metaTitle: '信任中心 — 托管、纠纷与核验 | Talengineer',
    metaDesc:
      'Talengineer 如何保护买卖双方：验收才放款的里程碑托管、5 天举证的纠纷流程（可原路退回你的卡）、KYC 与税务核验，以及现场作业的 GPS + 质检照片证据链。',
    kicker: '信任中心',
    heroTitle: '信任是基建，不是口号。',
    heroSub:
      '本页每一条声明都对应平台真实在做的事——验收前托管你的钱、有固定举证窗口的纠纷流程、经核验的身份，以及现场交付的证据链。下面逐条说明它们怎么运作。',
    ctaPost: '免费发布项目',

    escrowTag: '资金托管',
    escrowTitle: '你的钱是怎么被托管的',
    escrowLead:
      '资金被安全托管，只有你验收每项交付后才释放——里程碑只有在付款真正到账后才标记为已托管，且只在你批准时放款。',
    escrowSteps: [
      { icon: '💳', n: '1', title: '注资', desc: '你通过 Stripe Checkout 为里程碑注资。只有 Stripe 确认付款后才标记为已托管——绝不凭信任"假装"托管。' },
      { icon: '🔧', n: '2', title: '交付', desc: '工程师推进里程碑。现场签到与完工照片会随进度一并记录在该里程碑上。' },
      { icon: '✅', n: '3', title: '验收', desc: '你审阅交付物。资金只在你批准时流动——平台绝不按倒计时自动放款。' },
      { icon: '🔓', n: '4', title: '放款', desc: '验收通过后，托管扣除平台费放款给工程师，并有重复转账守卫，放款绝不会触发两次。' },
    ],

    disputeTag: '纠纷与退款',
    disputeTitle: '万一出问题会怎样',
    disputeLead:
      '若你不满意，开纠纷会在任何资金流动前先冻结里程碑。双方在固定窗口内提交证据，admin 复核，结果决定托管资金的去向——包括原路退回你的卡。',
    disputeSteps: [
      { icon: '🚩', n: '1', title: '开纠纷', desc: '项目任一当事方都可对已托管里程碑开纠纷。开纠纷会立即把它冻结为"争议中"——没有任何资金能流动。' },
      { icon: '📎', n: '2', title: '举证', desc: '双方有 5 天窗口提交证据。每一方属于哪一侧由服务端按其身份判定——无法伪造。' },
      { icon: '👤', n: '3', title: 'admin 复核', desc: '在任何资金流动前，平台 admin 会审阅里程碑规格与双方的证据。' },
      { icon: '↩️', n: '4', title: '裁决', desc: 'admin 判给工程师、判给雇主，或分账。判给雇主则托管全额原路退回原卡；分账则退回未判给对方的那部分。' },
    ],
    disputeNote:
      '每个里程碑同一时间只能有一个未决纠纷，且裁决由原子守卫保护，绝不会重复打款或重复退款。',

    verifyTag: '身份与合规',
    verifyTitle: '你到底在和谁合作',
    verifyLead:
      '只有当对面的人真实且可追责，付款保护才有意义。身份、税务与保险文件在生效前都会被核验——敏感文件也绝不裸挂在公开 URL 后面。',
    verifyCards: [
      { icon: '🪪', title: '企业 KYC', meta: '24 小时内复核', desc: '雇主提交公司信息核验。经我们团队复核后，状态由待审转为已验证——通常在 24 小时内。' },
      { icon: '📄', title: 'W-9 税务文件', meta: '5 分钟短时访问', desc: '税表存放在拒绝一切公开访问的私有桶里。即便是 admin，也只能通过 5 分钟即过期的签名链接查看文件。' },
      { icon: '🛡️', title: '保险与资质', meta: '追踪有效期 · admin 复核', desc: '保险凭证（COI）与平台资质带签发/到期日上传，再由 admin 核验通过或退回——自述声明本身不作数。' },
    ],

    fieldTag: '现场交付证据链',
    fieldTitle: '证明活儿真的干了',
    fieldLead:
      '对现场调试，平台会构建一条证据链，让隔着一个大洲的远程雇主也能信任现场完成的活——位置与交付照片都记录在里程碑本身上。',
    fieldCards: [
      { icon: '📍', title: 'GPS 签到', meta: '服务端地理围栏', desc: '签到时，平台在服务端计算距工地的距离（客户端无法造假）并记录在里程碑上。越出围栏的签到照常成功，但会被标记供雇主查看。' },
      { icon: '🎓', title: '签到前须持证', meta: '门口把关', desc: '工程师到场签到前必须持有效平台认证——这是指派之外的第二道门，证被吊销就当场拦在门口。' },
      { icon: '📷', title: '质检交付照片', meta: '记录到里程碑', desc: '完工时工程师提交照片与说明，附在里程碑上，让雇主在放款前有可视记录可据以验收。' },
    ],

    finalTitle: '第一单就能看得见的保护',
    finalSub: '免费发布项目。为一个里程碑注资入托管，在你验收前亲眼看本页每一道防护如何生效。',

    cohortNote:
      'Talengineer 处于 founding 起步阶段。我们不发布尚无法背书的"已服务 N 家企业"数字——上述保护才是早期客户真正依赖的东西，且它们今天已在产品里生效。',
  },
};

export default function Trust() {
  const [lang, setLang] = useLang();
  const t = UI[lang] || UI.en;

  const canonical = `${SITE}/trust`;
  const ogImage = `${SITE}/og.png`;

  // 四步流程组件：水平流（带箭头），移动端自动换行、箭头转竖向（CSS 控制）。
  // 不用图片，纯 CSS + 语义 token 画流程。
  function Flow({ steps }) {
    return (
      <div className={styles.flowRow}>
        {steps.map((s, i) => (
          <div key={s.n} className={styles.flowItem}>
            <div className={styles.flowStep}>
              <div className={styles.flowIcon} aria-hidden="true">{s.icon}</div>
              <div className={styles.flowNum}>{s.n}</div>
              <div className={styles.flowTitle}>{s.title}</div>
              <p className={styles.flowDesc}>{s.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={styles.flowArrow} aria-hidden="true">→</div>
            )}
          </div>
        ))}
      </div>
    );
  }

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
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Hero：信任是基建不是口号 ──────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{t.kicker}</p>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSub}>{t.heroSub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{t.ctaPost}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 托管资金流四步 ─────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.escrowTag}</span>
          <h2 className={styles.sectionTitle}>{t.escrowTitle}</h2>
          <p className={styles.lead}>{t.escrowLead}</p>
          <Flow steps={t.escrowSteps} />
        </div>

        {/* ── 纠纷与退款流程 ─────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.disputeTag}</span>
          <h2 className={styles.sectionTitle}>{t.disputeTitle}</h2>
          <p className={styles.lead}>{t.disputeLead}</p>
          <Flow steps={t.disputeSteps} />
          <p className={styles.note}>{t.disputeNote}</p>
        </div>

        {/* ── 身份与合规核验 ─────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.verifyTag}</span>
          <h2 className={styles.sectionTitle}>{t.verifyTitle}</h2>
          <p className={styles.lead}>{t.verifyLead}</p>
          <div className={styles.infoGrid}>
            {t.verifyCards.map((c) => (
              <div key={c.title} className={styles.infoCard}>
                <div className={styles.infoIcon} aria-hidden="true">{c.icon}</div>
                <div className={styles.infoTitle}>{c.title}</div>
                <div className={styles.infoMeta}>{c.meta}</div>
                <p className={styles.infoDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 现场交付证据链 ─────────────────────────────────────────── */}
        <div className={styles.block}>
          <span className={styles.tag}>{t.fieldTag}</span>
          <h2 className={styles.sectionTitle}>{t.fieldTitle}</h2>
          <p className={styles.lead}>{t.fieldLead}</p>
          <div className={styles.infoGrid}>
            {t.fieldCards.map((c) => (
              <div key={c.title} className={styles.infoCard}>
                <div className={styles.infoIcon} aria-hidden="true">{c.icon}</div>
                <div className={styles.infoTitle}>{c.title}</div>
                <div className={styles.infoMeta}>{c.meta}</div>
                <p className={styles.infoDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
          {/* 诚实空态：founding 叙事，不编造成交统计 */}
          <p className={styles.cohortNote}>{t.cohortNote}</p>
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
          © 2026 Talengineer.us · <Link href="/pricing">Pricing</Link> ·{' '}
          <Link href="/talent">Find Engineers</Link> ·{' '}
          <Link href="/rates">Rate Benchmarks</Link>
        </p>
      </footer>
    </div>
  );
}
