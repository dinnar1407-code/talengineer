import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useLang } from '../../hooks/useLang';
import styles from './occupations.module.css';

// 站点根 URL：canonical / OG 用（与 /hire/[track] 同一约定）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 索引页文案（en/zh 两套，其余 7 语回退英文）。
// 诚实红线：本页只做导览（职业按方向分组 + 一句话说明），不写任何统计数字。
const UI = {
  en: {
    kicker: 'Occupations',
    title: 'Hire by Role Title',
    sub: 'Browse the industrial automation roles you can hire on TalEngineer — grouped by certification track, each with a dedicated page covering duties, skills, regional rates and the certification path behind the title.',
    lead:
      'Job titles and certification tracks are not the same thing. A title like "SCADA engineer" tells you what someone does day to day; a track tells you how the platform screens and certifies them. These pages map the common titles onto our four tracks — PLC & Controls, Robotics, Machine Vision and Electrical — so you can start from the role you are actually hiring for.',
    viewRole: 'View role',
    ctaHeading: 'Ready to hire?',
    ctaBody: 'Post your project and match with pre-screened, certified engineers. Milestone escrow protects both sides.',
    ctaBtn: 'Post a Project — Free',
  },
  zh: {
    kicker: '职业目录',
    title: '按职位名招聘',
    sub: '浏览可以在 TalEngineer 上招到的工业自动化职位——按认证方向分组，每个职位都有专页，覆盖职责、技能、地区费率与这个头衔背后的认证路径。',
    lead:
      '职位名和认证方向不是一回事。"SCADA 工程师"这样的头衔说的是一个人每天做什么；认证方向说的是平台如何筛选并认证他。这些页面把常见职位名映射到我们的四条方向——PLC 与控制、机器人、机器视觉、电气——让你从真正要招的那个职位出发。',
    viewRole: '查看职位',
    ctaHeading: '准备好招募了吗？',
    ctaBody: '发布项目，与经过预审、持证的工程师精准匹配。里程碑托管保障双方权益。',
    ctaBtn: '免费发布项目',
  },
};

export default function OccupationsIndex({ groups }) {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;

  const canonical = `${SITE}/occupations`;
  const ogImage = `${SITE}/og.png`;

  // CollectionPage + ItemList 结构化数据：告诉搜索引擎这是 6 个职业页的目录页。
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: UI.en.title,
    description: UI.en.sub,
    url: canonical,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: groups
        .flatMap((g) => g.roles)
        .map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: r.name.en,
          url: `${SITE}/occupations/${r.role}`,
        })),
    },
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${u.title} | Talengineer`}</title>
        <meta name="description" content={u.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={u.title} />
        <meta property="og:description" content={u.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={u.title} />
        <meta name="twitter:description" content={u.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{u.kicker}</p>
          <h1 className={styles.heroTitle}>{u.title}</h1>
          <p className={styles.heroSub}>{u.sub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* 导语：解释"职位名 vs 认证方向"的映射逻辑 */}
        <div className={styles.block}>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.lead}</p>
        </div>

        {/* ── 按认证方向分组的职业卡（组标题链去方向母页）────────── */}
        {groups.map((g) => (
          <div key={g.track} className={styles.block}>
            <h2 className={styles.sectionTitle}>
              <Link href={`/hire/${g.track}`} className={styles.groupTitleLink}>
                {g.kicker[lang] || g.kicker.en}
              </Link>
            </h2>
            <div className={styles.roleGrid}>
              {g.roles.map((r) => (
                <Link key={r.role} href={`/occupations/${r.role}`} className={styles.roleCard}>
                  <div className={styles.roleName}>{r.name[lang] || r.name.en}</div>
                  <p className={styles.roleSub}>{r.sub[lang] || r.sub.en}</p>
                  <span className={styles.roleMore}>{u.viewRole} →</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── 底部 CTA + 全站共享页脚 ───────────────────────────── */}
      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <Link href="/talent" className={styles.btnPrimary}>{u.ctaBtn}</Link>
      </div>

      <Footer lang={lang} />
    </div>
  );
}

// 构建期把 6 个职业按方向分组（数据全部来自 lib 单一来源，页面不手写清单）。
export async function getStaticProps() {
  const { getRolesForTrack, getOccupationPage } = await import('../../lib/occupations.js');
  const { getTrackMeta } = await import('../../lib/hireMatrix.js');

  // 方向展示顺序与 /hire/[track] 的 4 方向一致；scada-engineer 因认证归属
  // 会出现在 plc 组下（lib/occupations.js 的刻意设计，见其文件头注释）。
  const TRACK_ORDER = ['plc', 'robotics', 'vision', 'electrical'];

  const groups = TRACK_ORDER.map((track) => {
    const meta = getTrackMeta(track);
    return {
      track,
      kicker: meta.kicker,
      roles: getRolesForTrack(track).map(({ role, name }) => {
        // 卡片描述直接复用职业页 hero 的 sub（同一来源，不另写一份摘要）。
        const page = getOccupationPage(role);
        return { role, name, sub: { en: page.content.en.sub, zh: page.content.zh.sub } };
      }),
    };
  });

  return { props: { groups } };
}
