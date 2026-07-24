import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import styles from './contact.module.css';

// 站点根 URL：canonical / OG 用（照 /hire/[track] 房型模板）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// ── 诚实红线 ──────────────────────────────────────────────────────────────────
// 本页零平台数字、零编造承诺：不写"24 小时内回复"之类我们尚无数据支撑的 SLA，
// 预期文案只如实说明 founding 阶段"真人阅读、尽快回复"。联系路径只列真实存在的
// 三条：邮箱 hello@talengineer.us、发单 /talent、工程师入驻 /talent。

// 文案字典：en/zh 两套全量，其余语言回退英文（全站 `|| en` 约定，SSR 首帧英文）。
const DICT = {
  en: {
    kicker: 'Contact',
    title: 'Talk to Talengineer',
    sub: 'Whether you are hiring, applying as an engineer, or just have a question — pick the route below that fits, and it will land in front of the right process.',

    // ── 三张联系卡 ─────────────────────────────────────────────────────────
    card1Title: 'Email us',
    card1Body:
      'General questions, partnerships, press, billing or account issues — one address covers them all. Write in whichever of our 9 languages you prefer.',
    card1Cta: 'hello@talengineer.us',
    card2Title: 'Hiring? Post a project',
    card2Body:
      'The fastest way to get an answer about your project is to post it: describe the need in natural language, AI structures it into a scope of work with milestones, and matched certified engineers come back to you. Posting is free — you fund escrow only after choosing an engineer.',
    card2Cta: 'Post a Project — Free →',
    card3Title: 'Engineer? Apply to join',
    card3Body:
      'Applying and being listed is free. You will go through a hands-on AI technical screening in your specialty, and can then take platform certification exams — certification is what makes you assignable to projects.',
    card3Cta: 'Apply as an Engineer →',

    // ── 诚实预期（不编 SLA）───────────────────────────────────────────────
    expectTitle: 'What to expect',
    expectBody:
      'We are a founding-stage platform, and every message to hello@talengineer.us is read by a human. We reply as quickly as we can — but we would rather tell you that honestly than promise a response-time guarantee we cannot yet stand behind. If you are already on an active project, the fastest channel is your project chat (it is live-translated), and the work-order dispute flow if something has gone wrong.',
  },

  zh: {
    kicker: '联系我们',
    title: '与 Talengineer 对话',
    sub: '无论你是要招人、要以工程师身份入驻，还是只有一个问题——选择下面合适的入口，它会直达对应的流程。',

    card1Title: '写邮件给我们',
    card1Body:
      '一般咨询、合作、媒体、账单或账号问题——一个地址全覆盖。用平台支持的 9 种语言中你顺手的那种写就行。',
    card1Cta: 'hello@talengineer.us',
    card2Title: '要招人？直接发布项目',
    card2Body:
      '关于你项目的问题，最快的解答方式就是把它发出来：用自然语言描述需求，AI 会将其结构化为带里程碑的工作范围，匹配到的持证工程师会来响应你。发布免费——选定工程师之后才需要注资托管。',
    card2Cta: '免费发布项目 →',
    card3Title: '工程师？申请入驻',
    card3Body:
      '申请与上架均不收费。你会先经过所报方向的实操型 AI 技术筛选，之后可参加平台认证考试——持有认证，才能被指派到项目。',
    card3Cta: '以工程师身份申请 →',

    expectTitle: '你可以期待什么',
    expectBody:
      '我们是一个 founding 阶段的平台，发到 hello@talengineer.us 的每封邮件都由真人阅读。我们会尽快回复——但我们宁可诚实地这样说，也不承诺一个目前还无法兑现的响应时限。如果你已在进行中的项目里，最快的通道是项目聊天（实时互译）；出了问题，则走工单的纠纷流程。',
  },
};

export default function Contact() {
  const [lang, setLang] = useLang();
  // 全站约定：只有 en/zh 有全量文案，其余语言回退英文（SSR 首帧也是英文）。
  const d = DICT[lang] || DICT.en;

  const canonical = `${SITE}/contact`;
  const ogImage = `${SITE}/og.png`;

  // ContactPage 结构化数据：标记这是平台的联系页，主实体指向 Organization
  // 及其唯一的公开联系邮箱（不写电话/地址等尚未公开的字段——诚实红线）。
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: d.title,
    description: d.sub,
    url: canonical,
    mainEntity: {
      '@type': 'Organization',
      name: 'Talengineer',
      url: SITE,
      email: 'hello@talengineer.us',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@talengineer.us',
        contactType: 'customer support',
      },
    },
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${d.title} | Talengineer`}</title>
        <meta name="description" content={d.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={d.title} />
        <meta property="og:description" content={d.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={d.title} />
        <meta name="twitter:description" content={d.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{d.kicker}</p>
          <h1 className={styles.heroTitle}>{d.title}</h1>
          <p className={styles.heroSub}>{d.sub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 三张联系卡：邮箱 / 雇主发单 / 工程师入驻 ─────────────────── */}
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.cardIcon} aria-hidden="true">✉️</div>
            <h2 className={styles.cardTitle}>{d.card1Title}</h2>
            <p className={styles.cardBody}>{d.card1Body}</p>
            {/* mailto 直达唯一公开邮箱 */}
            <a href="mailto:hello@talengineer.us" className={styles.cardCta}>
              {d.card1Cta}
            </a>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon} aria-hidden="true">🏭</div>
            <h2 className={styles.cardTitle}>{d.card2Title}</h2>
            <p className={styles.cardBody}>{d.card2Body}</p>
            <Link href="/talent" className={styles.cardCta}>{d.card2Cta}</Link>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon} aria-hidden="true">🛠️</div>
            <h2 className={styles.cardTitle}>{d.card3Title}</h2>
            <p className={styles.cardBody}>{d.card3Body}</p>
            <Link href="/talent" className={styles.cardCta}>{d.card3Cta}</Link>
          </div>
        </div>

        {/* ── 诚实预期块：不编 SLA，只说真人阅读+尽快回复 ─────────────── */}
        <div className={styles.expectBlock}>
          <h2 className={styles.sectionTitle}>{d.expectTitle}</h2>
          <p className={styles.lead}>{d.expectBody}</p>
        </div>
      </div>

      <Footer lang={lang} />
    </div>
  );
}
