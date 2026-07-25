import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { DICT as UI, RULES } from '../lib/i18n/talscore';
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
    es: {
      name: 'Evaluación técnica de IA',
      ask: '¿Realmente pueden hacer el trabajo, o solo hablar de él?',
      body: 'Cada ingeniero pasa una entrevista técnica de IA práctica antes de poder ser emparejado. Esa puntuación de 0–100 se mapea directamente a 25 puntos. Es la línea base de capacidad; nadie se la salta.',
    },
    vi: {
      name: 'Sàng lọc kỹ thuật AI',
      ask: 'Họ có thực sự làm được việc — hay chỉ nói suông?',
      body: 'Mọi kỹ sư đều phải vượt qua một bài phỏng vấn kỹ thuật AI thực hành trước khi được ghép nối. Điểm 0–100 đó được ánh xạ trực tiếp thành 25 điểm. Đây là mức nền năng lực; không ai bỏ qua được.',
    },
    hi: {
      name: 'AI तकनीकी स्क्रीनिंग',
      ask: 'क्या वे सच में काम कर सकते हैं — या सिर्फ़ बातें बनाते हैं?',
      body: 'मैच होने से पहले हर इंजीनियर को एक व्यावहारिक AI तकनीकी इंटरव्यू पास करना होता है। वह 0–100 का स्कोर सीधे 25 पॉइंट्स में बदलता है। यह क्षमता की बुनियाद है; इसे कोई नहीं टाल सकता।',
    },
    fr: {
      name: 'Évaluation technique par IA',
      ask: 'Peuvent-ils vraiment faire le travail — pas seulement en parler ?',
      body: 'Chaque ingénieur réussit un entretien technique IA pratique avant de pouvoir être mis en relation. Ce score de 0 à 100 se convertit directement en 25 points. C’est le socle de compétence ; personne n’y échappe.',
    },
    de: {
      name: 'KI-Techniktest',
      ask: 'Können sie die Arbeit wirklich leisten — oder nur darüber reden?',
      body: 'Jeder Ingenieur besteht ein praxisnahes KI-Technikinterview, bevor er vermittelt werden kann. Dieser Score von 0–100 wird direkt auf 25 Punkte abgebildet. Das ist die Kompetenzbasis; daran führt kein Weg vorbei.',
    },
    ja: {
      name: 'AI技術スクリーニング',
      ask: '本当に仕事ができるのか、それとも口先だけなのか？',
      body: 'すべてのエンジニアはマッチング前に実践的なAI技術面接に合格します。その0–100のスコアは直接25点に換算されます。これは能力の基準線であり、誰も省略できません。',
    },
    ko: {
      name: 'AI 기술 스크리닝',
      ask: '실제로 일을 할 수 있는가, 아니면 말뿐인가?',
      body: '모든 엔지니어는 매칭되기 전에 실무형 AI 기술 인터뷰를 통과합니다. 그 0~100점 점수는 25점으로 직접 환산됩니다. 이것이 역량의 기준선이며, 아무도 건너뛸 수 없습니다.',
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
    es: {
      name: 'Certificación de la plataforma',
      ask: '¿Pueden demostrarlo en condiciones de examen?',
      body: 'Los puntos provienen de exámenes de certificación cronometrados y supervisados: L1 = 8, L2 = 16, L3 = 25 por especialidad, con tope de 25. Las habilidades autodeclaradas en el currículum no valen nada aquí. Solo cuenta lo verificado.',
    },
    vi: {
      name: 'Chứng chỉ nền tảng',
      ask: 'Họ có thể chứng minh điều đó trong điều kiện thi cử không?',
      body: 'Điểm số đến từ các kỳ thi chứng chỉ có giám sát, tính giờ — L1 = 8, L2 = 16, L3 = 25 mỗi chuyên môn, tối đa 25. Kỹ năng tự khai trên hồ sơ không được tính điểm ở đây. Chỉ những gì đã được xác minh mới được tính.',
    },
    hi: {
      name: 'प्लेटफ़ॉर्म प्रमाणन',
      ask: 'क्या वे परीक्षा की शर्तों में खुद को साबित कर सकते हैं?',
      body: 'पॉइंट्स समयबद्ध, निगरानी वाली प्रमाणन परीक्षाओं से आते हैं — हर ट्रैक में L1 = 8, L2 = 16, L3 = 25, कैप 25। रेज़्यूमे पर खुद बताए स्किल्स यहाँ कुछ नहीं दिलाते। सिर्फ़ जो सत्यापित हुआ है, वही गिना जाता है।',
    },
    fr: {
      name: 'Certification de la plateforme',
      ask: 'Peuvent-ils le prouver en conditions d’examen ?',
      body: 'Les points proviennent d’examens de certification chronométrés et surveillés — L1 = 8, L2 = 16, L3 = 25 par spécialité, plafonné à 25. Les compétences autodéclarées sur un CV ne rapportent rien ici. Seul ce qui a été vérifié compte.',
    },
    de: {
      name: 'Plattform-Zertifizierung',
      ask: 'Können sie es unter Prüfungsbedingungen beweisen?',
      body: 'Die Punkte stammen aus zeitlich begrenzten, beaufsichtigten Zertifizierungsprüfungen — L1 = 8, L2 = 16, L3 = 25 je Fachrichtung, gedeckelt bei 25. Selbst angegebene Lebenslauf-Kenntnisse zählen hier nichts. Nur Verifiziertes zählt.',
    },
    ja: {
      name: 'プラットフォーム認定',
      ask: '試験条件下で証明できるか？',
      body: 'ポイントは時間制限つき・監督付きの認定試験から得られます——各トラックでL1=8、L2=16、L3=25、上限25。履歴書に自己申告したスキルはこの次元では一切加点されません。検証済みのものだけが対象です。',
    },
    ko: {
      name: '플랫폼 인증',
      ask: '시험 조건에서 이를 증명할 수 있는가?',
      body: '점수는 시간제한이 있고 감독하에 치러지는 인증 시험에서 나옵니다 — 트랙당 L1 = 8, L2 = 16, L3 = 25, 상한 25점. 이력서에 자기 신고한 스킬은 이 항목에서 전혀 점수가 되지 않습니다. 오직 검증된 것만 인정됩니다.',
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
    es: {
      name: 'Calificación del empleador',
      ask: '¿Entregó el ingeniero a tiempo, siempre?',
      body: 'La porción más grande: calificaciones reales de empleadores tras trabajos reales. Usamos un promedio bayesiano, no uno simple, para que una sola reseña entusiasta no pueda manipular el número.',
    },
    vi: {
      name: 'Đánh giá của nhà tuyển dụng',
      ask: 'Kỹ sư có bàn giao đúng hạn, mọi lần không?',
      body: 'Phần chiếm tỷ trọng lớn nhất — đánh giá thật từ nhà tuyển dụng sau các công việc thật. Chúng tôi dùng trung bình Bayesian, không phải trung bình thông thường, nên một đánh giá tuyệt vời duy nhất không thể thao túng con số này.',
    },
    hi: {
      name: 'नियोक्ता रेटिंग',
      ask: 'क्या इंजीनियर हर बार समय पर डिलीवर करता है?',
      body: 'सबसे बड़ा हिस्सा — असली काम के बाद नियोक्ताओं से मिली असली रेटिंग। हम सामान्य औसत की बजाय Bayesian औसत इस्तेमाल करते हैं, ताकि एक अकेला शानदार रिव्यू इस नंबर को गेम न कर सके।',
    },
    fr: {
      name: 'Note de l’employeur',
      ask: 'L’ingénieur a-t-il livré à temps, à chaque fois ?',
      body: 'La part la plus importante — de vraies notes données par des employeurs après de vraies missions. Nous utilisons une moyenne bayésienne, pas une moyenne simple, pour qu’un seul avis élogieux ne puisse pas manipuler le chiffre.',
    },
    de: {
      name: 'Auftraggeber-Bewertung',
      ask: 'Hat der Ingenieur jedes Mal pünktlich geliefert?',
      body: 'Der größte Anteil — echte Bewertungen von Auftraggebern nach echten Aufträgen. Wir verwenden einen Bayes’schen Durchschnitt statt eines einfachen, damit eine einzelne begeisterte Bewertung die Zahl nicht manipulieren kann.',
    },
    ja: {
      name: '雇用者評価',
      ask: 'そのエンジニアは毎回期限どおりに納品しているか？',
      body: '最も比重の大きい次元——実際の案件後に雇用者がつけた本物の評価です。単純平均ではなくベイズ平均を使うため、絶賛レビュー1件だけでこの数値を操作することはできません。',
    },
    ko: {
      name: '고용주 평점',
      ask: '그 엔지니어는 매번 제때 납품했는가?',
      body: '가장 큰 비중을 차지하는 항목 — 실제 작업 후 고용주가 매긴 실제 평점입니다. 단순 평균이 아닌 베이지안 평균을 사용하므로, 극찬 리뷰 하나로 이 숫자를 조작할 수 없습니다.',
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
    es: {
      name: 'Confiabilidad',
      ask: '¿Terminan lo que empiezan, sin disputas?',
      body: 'Un punto por pedido completado (tope de 10) más un bono de 10 puntos por no tener disputas. Pero hay una línea roja: si más de 1 de cada 10 trabajos termina en disputa, toda esta dimensión de 20 puntos cae a cero.',
    },
    vi: {
      name: 'Độ tin cậy',
      ask: 'Họ có hoàn thành trọn vẹn những gì đã bắt đầu, không tranh chấp không?',
      body: '1 điểm mỗi đơn hàng hoàn thành (tối đa 10), cộng thêm 10 điểm thưởng nếu không có tranh chấp. Nhưng có một ranh giới đỏ: nếu hơn 1 trong 10 công việc kết thúc bằng tranh chấp, toàn bộ yếu tố 20 điểm này về thẳng 0.',
    },
    hi: {
      name: 'रिलायबिलिटी',
      ask: 'क्या वे बिना विवाद के जो शुरू करते हैं उसे पूरा करते हैं?',
      body: 'हर पूरे किए ऑर्डर पर 1 पॉइंट (कैप 10), साथ ही बिना विवाद के लिए 10 पॉइंट का बोनस। लेकिन एक रेड लाइन है: अगर 10 में से 1 से ज़्यादा काम विवाद में खत्म होता है, तो यह पूरा 20-पॉइंट वाला आयाम सीधे शून्य पर आ जाता है।',
    },
    fr: {
      name: 'Fiabilité',
      ask: 'Vont-ils au bout de ce qu’ils commencent, sans litige ?',
      body: '1 point par commande terminée (plafond 10) plus une prime de 10 points sans litige. Mais il y a une ligne rouge : si plus d’une mission sur 10 se termine en litige, toute cette dimension de 20 points retombe à zéro.',
    },
    de: {
      name: 'Zuverlässigkeit',
      ask: 'Bringen sie zu Ende, was sie beginnen, ohne Streitfälle?',
      body: '1 Punkt je abgeschlossenem Auftrag (gedeckelt bei 10) plus ein Bonus von 10 Punkten ohne Streitfall. Doch es gibt eine rote Linie: Endet mehr als 1 von 10 Aufträgen in einem Streitfall, fällt diese gesamte 20-Punkte-Dimension auf null.',
    },
    ja: {
      name: '信頼性',
      ask: '紛争なく、始めたことをやり遂げているか？',
      body: '完了案件1件につき1点（上限10点）、加えて紛争なしで10点のボーナス。ただしレッドラインがあります：10件中1件を超える案件が紛争で終わると、この20点分の次元全体が即座にゼロになります。',
    },
    ko: {
      name: '신뢰성',
      ask: '분쟁 없이 시작한 일을 끝까지 마무리하는가?',
      body: '완료 주문당 1점(상한 10점), 여기에 무분쟁 보너스 10점이 더해집니다. 하지만 레드라인이 있습니다: 10건 중 1건을 초과하여 분쟁으로 끝나면 이 20점짜리 항목 전체가 즉시 0점이 됩니다.',
    },
  },
];

// 四档徽章 —— 阈值取自 talScore.js 的 TIER_THRESHOLDS。
const TIERS = [
  {
    key: 'platinum', color: '#7d93b2', min: 85,
    en: { name: 'Platinum', range: '85–100' }, zh: { name: '铂金', range: '85–100' },
    es: { name: 'Platino', range: '85–100' }, vi: { name: 'Bạch kim', range: '85–100' },
    hi: { name: 'प्लेटिनम', range: '85–100' }, fr: { name: 'Platine', range: '85–100' },
    de: { name: 'Platin', range: '85–100' }, ja: { name: 'プラチナ', range: '85–100' },
    ko: { name: '플래티넘', range: '85~100' },
  },
  {
    key: 'gold', color: '#d4af37', min: 70,
    en: { name: 'Gold', range: '70–84' }, zh: { name: '金', range: '70–84' },
    es: { name: 'Oro', range: '70–84' }, vi: { name: 'Vàng', range: '70–84' },
    hi: { name: 'गोल्ड', range: '70–84' }, fr: { name: 'Or', range: '70–84' },
    de: { name: 'Gold', range: '70–84' }, ja: { name: 'ゴールド', range: '70–84' },
    ko: { name: '골드', range: '70~84' },
  },
  {
    key: 'silver', color: '#9ca3af', min: 55,
    en: { name: 'Silver', range: '55–69' }, zh: { name: '银', range: '55–69' },
    es: { name: 'Plata', range: '55–69' }, vi: { name: 'Bạc', range: '55–69' },
    hi: { name: 'सिल्वर', range: '55–69' }, fr: { name: 'Argent', range: '55–69' },
    de: { name: 'Silber', range: '55–69' }, ja: { name: 'シルバー', range: '55–69' },
    ko: { name: '실버', range: '55~69' },
  },
  {
    key: 'bronze', color: '#c07a3e', min: 0,
    en: { name: 'Bronze', range: 'below 55' }, zh: { name: '青铜', range: '低于 55' },
    es: { name: 'Bronce', range: 'menos de 55' }, vi: { name: 'Đồng', range: 'dưới 55' },
    hi: { name: 'ब्रॉन्ज़', range: '55 से कम' }, fr: { name: 'Bronze', range: 'moins de 55' },
    de: { name: 'Bronze', range: 'unter 55' }, ja: { name: 'ブロンズ', range: '55未満' },
    ko: { name: '브론즈', range: '55 미만' },
  },
];

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

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </div>
  );
}
