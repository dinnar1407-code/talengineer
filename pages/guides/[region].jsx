import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { useLang } from '../../hooks/useLang';
import { REGIONS, getGuidePaths, hasGuide, getGuide } from '../../lib/regionGuides';
import styles from './guides.module.css';

// 站点根 URL：canonical / OG 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 三个地域的显示名与旗帜（内链“其他地域”用）。
const REGION_META = {
  mexico: { flag: '🇲🇽', name: { en: 'Mexico', zh: '墨西哥', es: 'México', vi: 'Mexico' } },
  vietnam: { flag: '🇻🇳', name: { en: 'Vietnam', zh: '越南', es: 'Vietnam', vi: 'Việt Nam' } },
  thailand: { flag: '🇹🇭', name: { en: 'Thailand', zh: '泰国', es: 'Tailandia', vi: 'Thái Lan' } },
};

// 三个方向母页（内链“按方向招募”用）。
const SPECIALTIES = [
  { slug: 'plc', name: { en: 'PLC & Controls', zh: 'PLC 与控制', es: 'PLC y control', vi: 'PLC & điều khiển' } },
  { slug: 'robotics', name: { en: 'Robotics', zh: '机器人', es: 'Robótica', vi: 'Robot' } },
  { slug: 'vision', name: { en: 'Machine Vision', zh: '机器视觉', es: 'Visión artificial', vi: 'Thị giác máy' } },
];

// UI 标签（章节标题、按钮等），en/zh/es/vi 四套；其余语言回退到 en。
const UI = {
  en: {
    home: 'Guides',
    heroPost: 'Post a Project — Free',
    heroBrowse: 'Browse engineers',
    statusTitle: 'The local hiring reality',
    solutionTitle: 'How TalEngineer staffs your line',
    projectsTitle: 'Common project types',
    ratesTitle: 'Rate ranges by region',
    localBandLabel: 'Local band',
    regionCol: 'Region',
    rateCol: 'Hourly (USD)',
    linksTitle: 'Explore',
    bySpecialty: 'Hire by specialty',
    otherGuides: 'Other regions',
    resources: 'Resources',
    rates: 'Rate benchmarks',
    pricing: 'Pricing & escrow',
    ctaHeading: 'Ready to staff your line?',
    ctaBody: 'Post your project and match with pre-screened, certified engineers — local and cross-border. Milestone escrow protects both sides.',
  },
  zh: {
    home: '指南',
    heroPost: '免费发布项目',
    heroBrowse: '浏览工程师',
    statusTitle: '当地用人现状',
    solutionTitle: 'TalEngineer 如何为你的产线配人',
    projectsTitle: '常见项目类型',
    ratesTitle: '各地区费率区间',
    localBandLabel: '本地区间',
    regionCol: '地区',
    rateCol: '时薪（美元）',
    linksTitle: '了解更多',
    bySpecialty: '按方向招募',
    otherGuides: '其他地域',
    resources: '资源',
    rates: '费率基准',
    pricing: '定价与托管',
    ctaHeading: '准备好为产线配人了吗？',
    ctaBody: '发布项目，与经过预审、持证的本地与跨境工程师精准匹配。里程碑托管保障双方权益。',
  },
  es: {
    home: 'Guías',
    heroPost: 'Publica un proyecto — Gratis',
    heroBrowse: 'Ver ingenieros',
    statusTitle: 'La realidad de contratación local',
    solutionTitle: 'Cómo TalEngineer dota tu línea',
    projectsTitle: 'Tipos de proyecto comunes',
    ratesTitle: 'Rangos de tarifa por región',
    localBandLabel: 'Tarifa local',
    regionCol: 'Región',
    rateCol: 'Por hora (USD)',
    linksTitle: 'Explorar',
    bySpecialty: 'Contratar por especialidad',
    otherGuides: 'Otras regiones',
    resources: 'Recursos',
    rates: 'Tarifas de referencia',
    pricing: 'Precios y garantía',
    ctaHeading: '¿Listo para dotar tu línea?',
    ctaBody: 'Publica tu proyecto y conecta con ingenieros certificados y preevaluados — locales y transfronterizos. El depósito por hitos protege a ambas partes.',
  },
  vi: {
    home: 'Hướng dẫn',
    heroPost: 'Đăng dự án — Miễn phí',
    heroBrowse: 'Xem kỹ sư',
    statusTitle: 'Thực tế tuyển dụng địa phương',
    solutionTitle: 'TalEngineer bố trí nhân sự cho dây chuyền của bạn',
    projectsTitle: 'Các loại dự án thường gặp',
    ratesTitle: 'Khoảng giá theo khu vực',
    localBandLabel: 'Mức giá địa phương',
    regionCol: 'Khu vực',
    rateCol: 'Theo giờ (USD)',
    linksTitle: 'Khám phá',
    bySpecialty: 'Tuyển theo chuyên môn',
    otherGuides: 'Khu vực khác',
    resources: 'Tài nguyên',
    rates: 'Bảng giá tham khảo',
    pricing: 'Định giá & ký quỹ',
    ctaHeading: 'Sẵn sàng bố trí nhân sự cho dây chuyền?',
    ctaBody: 'Đăng dự án và kết nối với kỹ sư đã được sàng lọc, có chứng nhận — địa phương và xuyên biên giới. Ký quỹ theo cột mốc bảo vệ cả hai bên.',
  },
};

export default function RegionGuide({ data }) {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;
  // 内容仅覆盖该地域声明的语言，其余（含 es/vi 为 null 的泰国）回退到 en。
  const c = data.content[lang] || data.content.en;
  const regionName = REGION_META[data.region].name[lang] || REGION_META[data.region].name.en;

  const canonical = `${SITE}/guides/${data.region}`;
  const ogImage = `${SITE}/og.png`;

  // Service 结构化数据：地域用人服务。
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: `Industrial Automation Staffing — ${regionName}`,
    name: c.title,
    description: c.sub,
    areaServed: regionName,
    url: canonical,
    provider: { '@type': 'Organization', name: 'Talengineer', url: SITE },
  };

  const otherGuides = Object.keys(REGION_META).filter((r) => r !== data.region);

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${c.title} | Talengineer`}</title>
        <meta name="description" content={c.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={c.title} />
        <meta property="og:description" content={c.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={c.title} />
        <meta name="twitter:description" content={c.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      {/* 面包屑：指南 → 当前地域 */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/talent">{u.home}</Link>
        <span className={styles.sep}>/</span>
        <span>{regionName}</span>
      </nav>

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.flag} aria-hidden="true">{data.flag}</div>
          <h1 className={styles.heroTitle}>{c.title}</h1>
          <p className={styles.heroSub}>{c.sub}</p>
          <div className={styles.heroBtns}>
            <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
            <Link href="/talent" className={styles.btnGhost}>{u.heroBrowse}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* 当地用人现状（结构性事实，无编造数字） */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.statusTitle}</h2>
          <p className={styles.lead}>{c.status1}</p>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{c.status2}</p>
        </div>

        {/* TalEngineer 双供给方案 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.solutionTitle}</h2>
          <div className={styles.solutionGrid}>
            {c.solutions.map((s) => (
              <div key={s.h} className={styles.solutionCard}>
                <h3 className={styles.solutionH}>{s.h}</h3>
                <p className={styles.solutionP}>{s.p}</p>
              </div>
            ))}
          </div>
          {c.thaiNote && <p className={styles.thaiNote}>{c.thaiNote}</p>}
        </div>

        {/* 常见项目类型 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.projectsTitle}</h2>
          <div className={styles.chips}>
            {c.projects.map((p) => (
              <span key={p} className={styles.chip}>{p}</span>
            ))}
          </div>
        </div>

        {/* 费率区间：本地高亮 + 跨境对比表（与 /rates 同源） */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.ratesTitle}</h2>
          <div className={styles.localBand}>
            <span className={styles.localBandLabel}>
              {u.localBandLabel} · {data.localRegion[lang] || data.localRegion.en}
            </span>
            <span className={styles.localBandValue}>{data.localBand}</span>
          </div>
          <table className={styles.rateTable}>
            <thead>
              <tr>
                <th>{u.regionCol}</th>
                <th>{u.rateCol}</th>
              </tr>
            </thead>
            <tbody>
              {REGIONS.map((r) => (
                <tr
                  key={r.region.en}
                  className={r.region.en === data.localRegion.en ? styles.rateRowLocal : undefined}
                >
                  <td>{r.region[lang] || r.region.en}</td>
                  <td>{r.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.note}>{c.ratesNote}</p>
        </div>

        {/* 内链：按方向招募 + 其他地域 + 资源 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.linksTitle}</h2>

          <p className={styles.note} style={{ marginTop: 0, marginBottom: 4 }}>{u.bySpecialty}</p>
          <div className={styles.linkList}>
            {SPECIALTIES.map((s) => (
              <Link key={s.slug} href={`/hire/${s.slug}`} className={styles.linkItem}>
                {s.name[lang] || s.name.en} →
              </Link>
            ))}
          </div>

          <p className={styles.note} style={{ marginBottom: 4 }}>{u.otherGuides}</p>
          <div className={styles.linkList}>
            {otherGuides.map((r) => (
              <Link key={r} href={`/guides/${r}`} className={styles.linkItem}>
                {REGION_META[r].flag} {REGION_META[r].name[lang] || REGION_META[r].name.en} →
              </Link>
            ))}
          </div>

          <p className={styles.note} style={{ marginBottom: 4 }}>{u.resources}</p>
          <div className={styles.linkList}>
            <Link href="/rates" className={styles.linkItem}>{u.rates} →</Link>
            <Link href="/pricing" className={styles.linkItem}>{u.pricing} →</Link>
          </div>
        </div>
      </div>

      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <Link href="/talent" className={styles.btnPrimary}>{u.heroPost}</Link>
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

// 三个地域静态预渲染。
export async function getStaticPaths() {
  return {
    paths: getGuidePaths(),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  if (!hasGuide(params.region)) return { notFound: true };
  return { props: { data: getGuide(params.region) } };
}
