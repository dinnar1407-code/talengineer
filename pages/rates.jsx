import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
import styles from './rates.module.css';

const DICT = {
  en: { heroBadge: 'Live Market Data', heroTitle: 'Automation Engineer Rate Benchmarks', heroSub: 'Real-time market rates for industrial automation talent by region. Data sourced from active engineer profiles on Talengineer.', filterLabel: 'Filter by skill:', allSkills: 'All Skills', medianRate: 'Median Rate', noData: 'No rate data available yet.', aboutTitle: 'About This Data', aboutBody1: 'Rates are self-reported by engineers on the Talengineer platform and updated in real time. Figures represent hourly rates in USD.', aboutBody2: 'Industrial specialties tracked: PLC programming, SCADA/HMI development, robotics (Fanuc, KUKA, ABB), electrical panel design, Siemens TIA Portal, Rockwell Studio 5000, process control, and more.', browseBtn: 'Browse Available Engineers →', ctaTitle: 'Need to hire an automation engineer?', ctaBody: 'Post your project and get matched with pre-screened engineers. Escrow payment protects both parties.', ctaBtn: 'Post a Project', calcCta: 'Estimate your project cost with the calculator →', bySpecLabel: 'Browse by specialty:', guidesLabel: 'Regional hiring guides:' },
  zh: { heroBadge: '实时市场数据', heroTitle: '自动化工程师费率基准', heroSub: '按地区实时展示工业自动化人才的市场费率，数据来源于 Talengineer 平台的工程师档案。', filterLabel: '按技能筛选：', allSkills: '全部技能', medianRate: '中位费率', noData: '暂无费率数据。', aboutTitle: '关于本数据', aboutBody1: '费率由工程师在 Talengineer 平台自主填报，实时更新，单位为美元/小时。', aboutBody2: '涵盖专业领域：PLC 编程、SCADA/HMI 开发、机器人（Fanuc/KUKA/ABB）、电气面板设计、西门子 TIA Portal、Rockwell Studio 5000、过程控制等。', browseBtn: '浏览在线工程师 →', ctaTitle: '需要招募自动化工程师？', ctaBody: '发布项目，与经过预审的工程师精准匹配。里程碑托管保障双方权益。', ctaBtn: '发布项目', calcCta: '用成本计算器估算项目预算 →', bySpecLabel: '按方向浏览：', guidesLabel: '分国用人指南：' },
  es: { heroBadge: 'Datos en Tiempo Real', heroTitle: 'Tarifas de Ingenieros de Automatización', heroSub: 'Tarifas de mercado en tiempo real para automatización industrial por región.', filterLabel: 'Filtrar por habilidad:', allSkills: 'Todas las Habilidades', medianRate: 'Tarifa Mediana', noData: 'Sin datos de tarifas disponibles.', aboutTitle: 'Sobre estos datos', aboutBody1: 'Las tarifas son reportadas por los ingenieros y se actualizan en tiempo real en USD/hora.', aboutBody2: 'Especialidades: programación PLC, SCADA/HMI, robótica (Fanuc, KUKA, ABB), diseño de paneles, Siemens TIA Portal, Rockwell Studio 5000 y más.', browseBtn: 'Ver Ingenieros Disponibles →', ctaTitle: '¿Necesita contratar un ingeniero?', ctaBody: 'Publique su proyecto y conéctese con ingenieros preseleccionados.', ctaBtn: 'Publicar Proyecto', calcCta: 'Calcula el costo de tu proyecto con la calculadora →', bySpecLabel: 'Explorar por especialidad:', guidesLabel: 'Guías de contratación por país:' },
  vi: { heroBadge: 'Dữ liệu thời gian thực', heroTitle: 'Chuẩn mức giá Kỹ sư Tự động hóa', heroSub: 'Mức giá thị trường thời gian thực cho nhân tài tự động hóa công nghiệp theo khu vực.', filterLabel: 'Lọc theo kỹ năng:', allSkills: 'Tất cả kỹ năng', medianRate: 'Giá trung vị', noData: 'Chưa có dữ liệu giá.', aboutTitle: 'Về dữ liệu này', aboutBody1: 'Mức giá do kỹ sư tự báo cáo trên nền tảng và cập nhật theo thời gian thực (USD/giờ).', aboutBody2: 'Lĩnh vực: lập trình PLC, SCADA/HMI, robot (Fanuc/KUKA/ABB), Siemens TIA Portal, Rockwell Studio 5000 và nhiều hơn nữa.', browseBtn: 'Xem Kỹ sư có sẵn →', ctaTitle: 'Cần tuyển kỹ sư tự động hóa?', ctaBody: 'Đăng dự án và được ghép với kỹ sư đã được sàng lọc.', ctaBtn: 'Đăng Dự Án', calcCta: 'Ước tính chi phí dự án bằng máy tính →', bySpecLabel: 'Duyệt theo chuyên môn:', guidesLabel: 'Cẩm nang tuyển dụng theo quốc gia:' },
  hi: { heroBadge: 'लाइव बाज़ार डेटा', heroTitle: 'ऑटोमेशन इंजीनियर दर बेंचमार्क', heroSub: 'क्षेत्र के अनुसार औद्योगिक ऑटोमेशन प्रतिभा के लिए रियल-टाइम बाज़ार दरें।', filterLabel: 'कौशल द्वारा फ़िल्टर करें:', allSkills: 'सभी कौशल', medianRate: 'मध्यिका दर', noData: 'अभी कोई दर डेटा उपलब्ध नहीं है।', aboutTitle: 'इस डेटा के बारे में', aboutBody1: 'दरें इंजीनियरों द्वारा स्व-रिपोर्ट की गई हैं और USD/घंटे में रियल-टाइम अपडेट होती हैं।', aboutBody2: 'विशेषताएं: PLC प्रोग्रामिंग, SCADA/HMI, रोबोटिक्स, Siemens TIA Portal, Rockwell Studio 5000 आदि।', browseBtn: 'उपलब्ध इंजीनियर देखें →', ctaTitle: 'ऑटोमेशन इंजीनियर की ज़रूरत है?', ctaBody: 'अपना प्रोजेक्ट पोस्ट करें और प्री-स्क्रीन्ड इंजीनियरों से मैच करें।', ctaBtn: 'प्रोजेक्ट पोस्ट करें', calcCta: 'कैलकुलेटर से अपने प्रोजेक्ट की लागत का अनुमान लगाएं →', bySpecLabel: 'विशेषज्ञता के अनुसार देखें:', guidesLabel: 'देश-वार नियुक्ति गाइड:' },
  fr: { heroBadge: 'Données en temps réel', heroTitle: 'Tarifs des Ingénieurs en Automatisation', heroSub: 'Tarifs du marché en temps réel pour les talents en automatisation industrielle par région.', filterLabel: 'Filtrer par compétence :', allSkills: 'Toutes les compétences', medianRate: 'Tarif médian', noData: 'Aucune donnée disponible.', aboutTitle: 'À propos de ces données', aboutBody1: 'Les tarifs sont auto-déclarés par les ingénieurs sur la plateforme et mis à jour en temps réel (USD/heure).', aboutBody2: 'Spécialités : programmation PLC, SCADA/HMI, robotique (Fanuc, KUKA, ABB), Siemens TIA Portal, Rockwell Studio 5000 et plus.', browseBtn: 'Voir les ingénieurs disponibles →', ctaTitle: 'Besoin d\'engager un ingénieur ?', ctaBody: 'Publiez votre projet et soyez mis en relation avec des ingénieurs présélectionnés.', ctaBtn: 'Publier un projet', calcCta: 'Estimez le coût de votre projet avec le calculateur →', bySpecLabel: 'Parcourir par spécialité :', guidesLabel: 'Guides de recrutement par pays :' },
  de: { heroBadge: 'Live-Marktdaten', heroTitle: 'Stundensatz-Benchmarks für Automatisierungsingenieure', heroSub: 'Echtzeit-Marktpreise für Automatisierungstalente nach Region.', filterLabel: 'Nach Fähigkeit filtern:', allSkills: 'Alle Fähigkeiten', medianRate: 'Mediansatz', noData: 'Noch keine Tarifdaten vorhanden.', aboutTitle: 'Über diese Daten', aboutBody1: 'Tarifsätze werden von Ingenieuren auf der Plattform selbst angegeben und in Echtzeit aktualisiert (USD/Stunde).', aboutBody2: 'Spezialgebiete: SPS-Programmierung, SCADA/HMI, Robotik (Fanuc, KUKA, ABB), Siemens TIA Portal, Rockwell Studio 5000 und mehr.', browseBtn: 'Verfügbare Ingenieure ansehen →', ctaTitle: 'Suchen Sie einen Automatisierungsingenieur?', ctaBody: 'Veröffentlichen Sie Ihr Projekt und werden Sie mit vorausgewählten Ingenieuren zusammengebracht.', ctaBtn: 'Projekt veröffentlichen', calcCta: 'Projektkosten mit dem Rechner schätzen →', bySpecLabel: 'Nach Fachgebiet durchsuchen:', guidesLabel: 'Regionale Einstellungsleitfäden:' },
  ja: { heroBadge: 'リアルタイム市場データ', heroTitle: 'オートメーションエンジニア レートベンチマーク', heroSub: '地域別の産業オートメーション人材のリアルタイム市場レート。', filterLabel: 'スキルで絞り込み：', allSkills: '全スキル', medianRate: '中央値レート', noData: 'レートデータはまだありません。', aboutTitle: 'データについて', aboutBody1: 'レートはプラットフォーム上のエンジニアによる自己申告で、リアルタイム更新されます（USD/時間）。', aboutBody2: '対応分野：PLC プログラミング、SCADA/HMI、ロボット（Fanuc/KUKA/ABB）、Siemens TIA Portal、Rockwell Studio 5000 など。', browseBtn: '利用可能なエンジニアを見る →', ctaTitle: 'オートメーションエンジニアが必要ですか？', ctaBody: 'プロジェクトを投稿して、事前審査済みエンジニアとマッチングしましょう。', ctaBtn: 'プロジェクトを投稿', calcCta: 'コスト計算ツールでプロジェクト費用を見積もる →', bySpecLabel: '専門分野で探す：', guidesLabel: '国別採用ガイド：' },
  ko: { heroBadge: '실시간 시장 데이터', heroTitle: '자동화 엔지니어 요율 벤치마크', heroSub: '지역별 산업 자동화 인재의 실시간 시장 요율.', filterLabel: '기술로 필터링:', allSkills: '모든 기술', medianRate: '중앙값 요율', noData: '요율 데이터가 아직 없습니다.', aboutTitle: '데이터 안내', aboutBody1: '요율은 엔지니어가 플랫폼에서 자체 신고하며 실시간으로 업데이트됩니다(USD/시간).', aboutBody2: '전문 분야: PLC 프로그래밍, SCADA/HMI, 로봇(Fanuc/KUKA/ABB), Siemens TIA Portal, Rockwell Studio 5000 등.', browseBtn: '엔지니어 보기 →', ctaTitle: '자동화 엔지니어가 필요하신가요?', ctaBody: '프로젝트를 게시하고 사전 심사된 엔지니어와 매칭되세요.', ctaBtn: '프로젝트 게시', calcCta: '계산기로 프로젝트 비용 추정하기 →', bySpecLabel: '전문 분야별 보기:', guidesLabel: '국가별 채용 가이드:' },
};

// 按方向浏览的四个正门（链向真实存在的 /hire/[track] 页），修复矩阵页弱链入。
// label 走 9 语，与首页 footerSpecialties 口径一致。
const SPECIALTIES = [
  { href: '/hire/plc',        label: { en: 'PLC Programming', zh: 'PLC 编程', es: 'Programación de PLC', vi: 'Lập trình PLC', hi: 'PLC प्रोग्रामिंग', fr: 'Programmation PLC', de: 'PLC-Programmierung', ja: 'PLCプログラミング', ko: 'PLC 프로그래밍' } },
  { href: '/hire/vision',     label: { en: 'Machine Vision', zh: '机器视觉', es: 'Visión artificial', vi: 'Thị giác máy', hi: 'मशीन विज़न', fr: 'Vision industrielle', de: 'Bildverarbeitung', ja: 'マシンビジョン', ko: '머신 비전' } },
  { href: '/hire/robotics',   label: { en: 'Robotics', zh: '机器人', es: 'Robótica', vi: 'Robot', hi: 'रोबोटिक्स', fr: 'Robotique', de: 'Robotik', ja: 'ロボティクス', ko: '로보틱스' } },
  { href: '/hire/electrical', label: { en: 'Panel Design', zh: '电柜设计', es: 'Diseño de tableros', vi: 'Thiết kế tủ điện', hi: 'पैनल डिज़ाइन', fr: "Conception d'armoires", de: 'Schaltschrankdesign', ja: '制御盤設計', ko: '패널 설계' } },
];

// 分国用人指南入口（链向真实存在的 /guides/[region] 页），修复 /guides 零链入孤儿。
const RATE_GUIDES = [
  { href: '/guides/mexico',   label: { en: 'Mexico', zh: '墨西哥', es: 'México', vi: 'Mexico', hi: 'मेक्सिको', fr: 'Mexique', de: 'Mexiko', ja: 'メキシコ', ko: '멕시코' } },
  { href: '/guides/vietnam',  label: { en: 'Vietnam', zh: '越南', es: 'Vietnam', vi: 'Việt Nam', hi: 'वियतनाम', fr: 'Vietnam', de: 'Vietnam', ja: 'ベトナム', ko: '베트남' } },
  { href: '/guides/thailand', label: { en: 'Thailand', zh: '泰国', es: 'Tailandia', vi: 'Thái Lan', hi: 'थाईलैंड', fr: 'Thaïlande', de: 'Thailand', ja: 'タイ', ko: '태국' } },
];

export default function Rates() {
  const [lang, setLang] = useLang();
  const [benchmarks, setBenchmarks] = useState(null);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');

  useEffect(() => {
    fetch('/api/talent/rate-benchmarks')
      .then(r => r.json())
      .then(d => {
        setBenchmarks(d.data || []);
        const allSkills = new Set();
        (d.skills || []).forEach(s => allSkills.add(s));
        setSkills([...allSkills]);
      })
      .catch(() => setBenchmarks([]));
  }, []);

  const filtered = benchmarks
    ? (selectedSkill ? benchmarks.filter(b => b.top_skills?.includes(selectedSkill)) : benchmarks)
    : null;

  const d = DICT[lang] || DICT.en;

  // Dataset JSON-LD（AI-Native Phase 0 语义层）：把费率行情标注为 schema.org 数据集，
  // 让搜索引擎与 AI 爬虫把 /rates 识别为可引用的行业数据源（含公开 JSON 端点）。
  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Industrial Automation Engineer Rate Benchmarks',
    description:
      'Live hourly-rate benchmarks (USD) for industrial automation engineers by region and specialty — PLC, SCADA/HMI, robotics, electrical. Self-reported by active engineers on Talengineer, updated in real time.',
    url: 'https://talengineer.us/rates',
    creator: { '@type': 'Organization', name: 'Talengineer', url: 'https://talengineer.us' },
    isAccessibleForFree: true,
    variableMeasured: ['hourly rate (USD)', 'region', 'specialty', 'sample size'],
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: 'https://talengineer.us/api/talent/rate-benchmarks',
    },
  };

  return (
    <>
      <Head>
        <title>Automation Engineer Rate Benchmarks | Talengineer</title>
        <meta name="description" content="Live market rates for automation and industrial engineers by region. Compare $USD/hr rates for PLC, SCADA, robotics, and electrical engineering." />
        <link rel="canonical" href="https://talengineer.us/rates" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Automation Engineer Rate Benchmarks | Talengineer" />
        <meta property="og:description" content="Live market rates for automation and industrial engineers by region — PLC, SCADA, robotics, and electrical, in $USD/hr." />
        <meta property="og:url" content="https://talengineer.us/rates" />
        <meta property="og:image" content="https://talengineer.us/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Automation Engineer Rate Benchmarks | Talengineer" />
        <meta name="twitter:description" content="Live market rates for automation and industrial engineers by region — PLC, SCADA, robotics, and electrical." />
        <meta name="twitter:image" content="https://talengineer.us/og.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>{d.heroBadge}</div>
          <h1>{d.heroTitle}</h1>
          <p>{d.heroSub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {skills.length > 0 && (
          <div className={styles.filterBar}>
            <span className={styles.filterLabel}>{d.filterLabel}</span>
            <button className={`${styles.chip} ${!selectedSkill ? styles.chipActive : ''}`} onClick={() => setSelectedSkill('')}>{d.allSkills}</button>
            {skills.slice(0, 12).map(s => (
              <button key={s} className={`${styles.chip} ${selectedSkill === s ? styles.chipActive : ''}`} onClick={() => setSelectedSkill(s)}>{s}</button>
            ))}
          </div>
        )}

        {filtered === null ? (
          <div className={styles.grid}>
            {[0,1,2,3,4,5].map(i => <div key={i} className={styles.cardSkeleton} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>{d.noData}</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((b, i) => (
              <div key={i} className={styles.card}>
                <div className={styles.cardRegion}>{b.region}</div>
                <div className={styles.cardRate}>${b.median}<span>/hr</span></div>
                <div className={styles.cardLabel}>{d.medianRate}</div>
                <div className={styles.cardStats}>
                  <div className={styles.stat}><div className={styles.statVal}>${b.min}</div><div className={styles.statLabel}>Min</div></div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}><div className={styles.statVal}>${b.avg}</div><div className={styles.statLabel}>Avg</div></div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}><div className={styles.statVal}>${b.max}</div><div className={styles.statLabel}>Max</div></div>
                </div>
                <div className={styles.cardCount}>{b.count} engineer{b.count !== 1 ? 's' : ''} sampled</div>
                {b.top_skills?.length > 0 && (
                  <div className={styles.skillList}>
                    {b.top_skills.slice(0, 3).map(s => <span key={s} className={styles.skillChip}>{s}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={styles.infoBox}>
          <h2>{d.aboutTitle}</h2>
          <p>{d.aboutBody1}</p>
          <p style={{ marginTop: 12 }}>{d.aboutBody2}</p>
          <Link href="/talent" className={styles.btnBrowse}>{d.browseBtn}</Link>
        </div>

        {/* 高意图交叉入口：成本计算器 CTA + 按方向浏览(/hire) + 分国用人指南(/guides)，
            把费率页流量导向已建成的下游页面，修复弱链/孤儿入口。 */}
        <div className={styles.infoBox}>
          <Link href="/calculator" className={styles.btnBrowse}>{d.calcCta}</Link>
          <p style={{ marginTop: 18, marginBottom: 8, fontWeight: 600 }}>{d.bySpecLabel}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SPECIALTIES.map((s) => (
              <Link key={s.href} href={s.href} className={styles.skillChip} style={{ textDecoration: 'none' }}>
                {s.label[lang] || s.label.en}
              </Link>
            ))}
          </div>
          <p style={{ marginTop: 18, marginBottom: 8, fontWeight: 600 }}>{d.guidesLabel}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RATE_GUIDES.map((g) => (
              <Link key={g.href} href={g.href} className={styles.skillChip} style={{ textDecoration: 'none' }}>
                {g.label[lang] || g.label.en}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.ctaBox}>
          <div>
            <h2>{d.ctaTitle}</h2>
            <p>{d.ctaBody}</p>
          </div>
          <Link href="/finance" className={styles.btnCta2}>{d.ctaBtn}</Link>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>© 2025 Talengineer.us · <Link href="/talent">Find Engineers</Link> · <Link href="/rates">Rate Benchmarks</Link> · <Link href="/enterprise">Enterprise API</Link></p>
      </footer>
    </>
  );
}
