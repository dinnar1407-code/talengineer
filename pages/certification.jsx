import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { DICT as UI, FUNNEL, ANTICHEAT } from '../lib/i18n/certification';
import styles from './certification.module.css';

// 站点根 URL：canonical / OG / JSON-LD 用。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 四方向 × L1–L3 认证矩阵。方向口径与 src/routes/demand.js / pages/hire/[track].jsx 一致；
// 每级含义与考核规则的单一来源是 src/config/training.js（MAX_LEVEL=3，L(n) 须先持 L(n-1)）。
const LEVELS = [
  { n: 1, en: 'Fundamentals', zh: '基础', es: 'Fundamentos', vi: 'Nền tảng', hi: 'बुनियादी', fr: 'Fondamentaux', de: 'Grundlagen', ja: '基礎', ko: '기초' },
  { n: 2, en: 'Independent', zh: '独立', es: 'Independiente', vi: 'Độc lập', hi: 'स्वतंत्र', fr: 'Autonome', de: 'Eigenständig', ja: '独立', ko: '독립' },
  { n: 3, en: 'Expert', zh: '专家', es: 'Experto', vi: 'Chuyên gia', hi: 'विशेषज्ञ', fr: 'Expert', de: 'Experte', ja: 'エキスパート', ko: '전문가' },
];

const TRACKS = [
  {
    key: 'plc',
    en: { name: 'PLC & Controls', cells: ['Executes specified ladder/ST work under guidance', 'Owns a control scope end to end', 'Architects control systems and safety'] },
    zh: { name: 'PLC 与控制', cells: ['在指导下完成范围明确的 ladder/ST 工作', '端到端负责一个控制范围', '架构控制系统，把关安全'] },
    es: { name: 'PLC y control', cells: ['Ejecuta trabajo especificado de ladder/ST bajo supervisión', 'Es responsable de un alcance de control de principio a fin', 'Diseña sistemas de control y seguridad'] },
    vi: { name: 'PLC & Điều khiển', cells: ['Thực hiện công việc ladder/ST được chỉ định dưới sự hướng dẫn', 'Chịu trách nhiệm toàn bộ một phạm vi điều khiển từ đầu đến cuối', 'Kiến trúc hệ thống điều khiển và an toàn'] },
    hi: { name: 'PLC और कंट्रोल', cells: ['निर्देशन में तय ladder/ST काम को अंजाम देता है', 'एंड-टू-एंड एक कंट्रोल स्कोप का ज़िम्मा उठाता है', 'कंट्रोल सिस्टम और सुरक्षा की आर्किटेक्चर करता है'] },
    fr: { name: 'PLC et contrôle-commande', cells: ['Exécute un travail ladder/ST spécifié sous supervision', 'Prend en charge un périmètre de contrôle de bout en bout', 'Conçoit les systèmes de contrôle et la sécurité'] },
    de: { name: 'PLC & Steuerungstechnik', cells: ['Führt festgelegte Ladder-/ST-Arbeiten unter Anleitung aus', 'Verantwortet einen Steuerungsbereich end-to-end', 'Entwirft Steuerungssysteme und Sicherheit'] },
    ja: { name: 'PLC・制御', cells: ['指導のもと指定されたラダー/ST作業を実行', '制御範囲をエンドツーエンドで担当', '制御システムと安全の全体設計を担う'] },
    ko: { name: 'PLC 및 제어', cells: ['지도하에 지정된 래더/ST 작업을 수행', '제어 범위를 처음부터 끝까지 전담', '제어 시스템과 안전을 설계'] },
  },
  {
    key: 'robotics',
    en: { name: 'Robotics', cells: ['Runs taught programs and defined cell work', 'Programs and commissions a cell solo', 'Designs cells, leads multi-robot commissioning'] },
    zh: { name: '机器人', cells: ['执行示教程序与定义明确的工作站活', '独立完成工作站编程与调试', '设计复杂工作站，带队多机联调'] },
    es: { name: 'Robótica', cells: ['Ejecuta programas enseñados y trabajo de celda definido', 'Programa y pone en marcha una celda en solitario', 'Diseña celdas y lidera la puesta en marcha multi-robot'] },
    vi: { name: 'Robot công nghiệp', cells: ['Chạy các chương trình đã được dạy và công việc trạm rõ ràng', 'Tự mình lập trình và chạy thử một trạm', 'Thiết kế trạm, dẫn dắt chạy thử đa robot'] },
    hi: { name: 'रोबोटिक्स', cells: ['सिखाए गए प्रोग्राम व तय सेल काम चलाता है', 'अकेले एक सेल को प्रोग्राम व कमीशन करता है', 'सेल डिज़ाइन करता है, मल्टी-रोबोट कमीशनिंग का नेतृत्व करता है'] },
    fr: { name: 'Robotique', cells: ['Exécute des programmes enseignés et un travail de cellule défini', 'Programme et met en service une cellule en solo', 'Conçoit les cellules, dirige la mise en service multi-robots'] },
    de: { name: 'Robotik', cells: ['Führt eingelernte Programme und definierte Zellenarbeit aus', 'Programmiert und nimmt eine Zelle allein in Betrieb', 'Entwirft Zellen, leitet die Inbetriebnahme mehrerer Roboter'] },
    ja: { name: 'ロボティクス', cells: ['教示済みプログラムと定義済みセル作業を実行', '単独でセルのプログラミングと試運転を行う', 'セルを設計し、複数ロボットの試運転を主導する'] },
    ko: { name: '로보틱스', cells: ['교시된 프로그램과 정의된 셀 작업을 실행', '단독으로 셀을 프로그래밍하고 시운전', '셀을 설계하고 다중 로봇 시운전을 주도'] },
  },
  {
    key: 'vision',
    en: { name: 'Machine Vision', cells: ['Configures inspections and standard lighting', 'Designs robust inspection, calibrates solo', 'Architects demanding vision systems'] },
    zh: { name: '机器视觉', cells: ['配置检测，搭建标准打光', '设计稳健检测，独立标定', '架构高要求的视觉系统'] },
    es: { name: 'Visión artificial', cells: ['Configura inspecciones e iluminación estándar', 'Diseña inspecciones robustas, calibra en solitario', 'Diseña sistemas de visión exigentes'] },
    vi: { name: 'Thị giác máy', cells: ['Cấu hình kiểm tra và chiếu sáng tiêu chuẩn', 'Thiết kế kiểm tra bền vững, tự hiệu chuẩn', 'Kiến trúc các hệ thống thị giác đòi hỏi cao'] },
    hi: { name: 'मशीन विज़न', cells: ['इंस्पेक्शन व स्टैंडर्ड लाइटिंग कॉन्फ़िगर करता है', 'मज़बूत इंस्पेक्शन डिज़ाइन करता है, अकेले कैलिब्रेट करता है', 'मुश्किल विज़न सिस्टम की आर्किटेक्चर करता है'] },
    fr: { name: 'Vision industrielle', cells: ['Configure les inspections et l’éclairage standard', 'Conçoit des inspections robustes, calibre en solo', 'Conçoit des systèmes de vision exigeants'] },
    de: { name: 'Bildverarbeitung', cells: ['Konfiguriert Inspektionen und Standardbeleuchtung', 'Entwirft robuste Inspektionen, kalibriert allein', 'Entwirft anspruchsvolle Bildverarbeitungssysteme'] },
    ja: { name: 'マシンビジョン', cells: ['検査と標準照明を設定する', '堅牢な検査を設計し、単独でキャリブレーションする', '要求水準の高いビジョンシステムを設計する'] },
    ko: { name: '머신 비전', cells: ['검사 및 표준 조명을 구성', '견고한 검사를 설계하고 단독으로 캘리브레이션', '까다로운 비전 시스템을 설계'] },
  },
  {
    key: 'electrical',
    en: { name: 'Electrical', cells: ['Produces standard panel layouts and schematics', 'Designs compliant panels and drives solo', 'Architects power distribution and safety'] },
    zh: { name: '电气', cells: ['完成标准电柜布局与图纸', '独立设计合规的电柜与驱动', '架构配电，把关规范与安全'] },
    es: { name: 'Eléctrica', cells: ['Produce distribuciones y planos de tableros estándar', 'Diseña tableros y variadores conformes en solitario', 'Diseña la distribución de energía y la seguridad'] },
    vi: { name: 'Điện', cells: ['Tạo bố trí tủ điện và sơ đồ tiêu chuẩn', 'Tự mình thiết kế tủ điện và biến tần đạt chuẩn', 'Kiến trúc phân phối điện và an toàn'] },
    hi: { name: 'इलेक्ट्रिकल', cells: ['स्टैंडर्ड पैनल लेआउट व स्कीमैटिक तैयार करता है', 'अकेले कंप्लायंट पैनल व ड्राइव डिज़ाइन करता है', 'पावर डिस्ट्रीब्यूशन व सुरक्षा की आर्किटेक्चर करता है'] },
    fr: { name: 'Électricité', cells: ['Produit des plans et schémas d’armoires standard', 'Conçoit des armoires et variateurs conformes en solo', 'Conçoit la distribution électrique et la sécurité'] },
    de: { name: 'Elektrotechnik', cells: ['Erstellt Standard-Schaltschranklayouts und -pläne', 'Entwirft konforme Schaltschränke und Antriebe allein', 'Entwirft Energieverteilung und Sicherheit'] },
    ja: { name: '電気', cells: ['標準的な制御盤レイアウトと回路図を作成する', '単独で法規に適合した制御盤とドライブを設計する', '配電と安全の全体設計を担う'] },
    ko: { name: '전기', cells: ['표준 패널 배치도와 회로도를 작성', '단독으로 규정을 준수하는 패널과 드라이브를 설계', '배전과 안전을 설계'] },
  },
];

export default function Certification() {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;
  const funnel = FUNNEL[lang] || FUNNEL.en;
  const anticheat = ANTICHEAT[lang] || ANTICHEAT.en;

  const canonical = `${SITE}/certification`;
  const ogImage = `${SITE}/og.png`;

  // JSON-LD：4 方向 × 3 等级的认证体系。credentialCategory=certificate，颁发方=Talengineer。
  const credentialsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Talengineer platform certifications',
    itemListElement: TRACKS.flatMap((track, ti) =>
      LEVELS.map((lvl, li) => ({
        '@type': 'ListItem',
        position: ti * LEVELS.length + li + 1,
        item: {
          '@type': 'EducationalOccupationalCredential',
          name: `${track.en.name} — Level ${lvl.n} (${lvl.en})`,
          description: track.en.cells[li],
          credentialCategory: 'certificate',
          educationalLevel: `L${lvl.n} — ${lvl.en}`,
          competencyRequired: track.en.cells[li],
          recognizedBy: { '@type': 'Organization', name: 'Talengineer', url: SITE },
          url: canonical,
        },
      })),
    ),
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`Certification — a hard gate, not a badge | Talengineer`}</title>
        <meta name="description" content={u.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Talengineer certification — a hard gate for on-site assignment" />
        <meta property="og:description" content={u.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Talengineer certification — a hard gate for on-site assignment" />
        <meta name="twitter:description" content={u.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(credentialsJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{u.kicker}</p>
          <h1 className={styles.heroTitle}>{u.title}</h1>
          <p className={styles.heroSub}>{u.sub}</p>
          <div className={styles.heroBtns}>
            <Link href="/training" className={styles.btnPrimary}>{u.ctaPrimary}</Link>
            <Link href="/talscore" className={styles.btnGhost}>{u.ctaGhost}</Link>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* 4×3 认证矩阵 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.matrixTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.matrixIntro}</p>
          <div className={styles.matrix}>
            {TRACKS.map((track) => {
              const c = track[lang] || track.en;
              return (
                <div key={track.key} className={styles.matrixRow}>
                  <div className={styles.matrixTrack}>{c.name}</div>
                  <div className={styles.matrixCells}>
                    {LEVELS.map((lvl, i) => (
                      <div key={lvl.n} className={styles.matrixCell}>
                        <div className={styles.cellLevel}>
                          L{lvl.n} · {lvl[lang] || lvl.en}
                        </div>
                        <div className={styles.cellDesc}>{c.cells[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className={styles.note}>{u.progressNote}</p>
        </div>

        {/* 认证漏斗 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.funnelTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.funnelIntro}</p>
          <ol className={styles.funnel}>
            {funnel.map((f, i) => (
              <li key={f.step} className={styles.funnelStep}>
                <div className={styles.funnelNum}>{i + 1}</div>
                <div className={styles.funnelBody}>
                  <div className={styles.funnelName}>{f.step}</div>
                  <div className={styles.funnelGate}>{f.gate}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* 反作弊设计 */}
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.antiTitle}</h2>
          <p className={`${styles.lead} ${styles.leadMuted}`}>{u.antiIntro}</p>
          <div className={styles.antiGrid}>
            {anticheat.map((a) => (
              <div key={a.title} className={styles.antiCard}>
                <div className={styles.antiCardTitle}>{a.title}</div>
                <p className={styles.antiBody}>{a.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 与 /training 的关系 */}
        <div className={styles.block}>
          <div className={styles.relCard}>
            <h2 className={styles.relTitle}>{u.relTitle}</h2>
            <p className={styles.relBody}>{u.relBody}</p>
            <Link href="/training" className={styles.btnPrimary}>{u.relCta}</Link>
          </div>
        </div>
      </div>

      <div className={styles.finalCta}>
        <h2>{u.ctaHeading}</h2>
        <p>{u.ctaBody}</p>
        <div className={styles.heroBtns} style={{ justifyContent: 'center' }}>
          <Link href="/training" className={styles.btnPrimary}>{u.ctaPrimary}</Link>
          <Link href="/talscore" className={styles.btnGhost}>{u.ctaGhost}</Link>
        </div>
      </div>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </div>
  );
}
