import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import styles from './index.module.css';

const DICT = {
  en: {
    navHow: 'How it Works', navTalent: 'Find Engineers', navLogin: 'Sign In',
    heroTitle: 'The Global Marketplace for Industrial Automation Talent',
    heroSub: 'We connect equipment manufacturers and system integrators worldwide with AI-verified local automation engineers. North America, Vietnam, India, and beyond — deploy faster, without borders.',
    heroBtn: 'Hire a Local Expert',
    feat1Title: '🛡️ AI-Verified Talent',
    feat1Desc: 'Every engineer passes our proprietary AI Technical Screener for PLC, SCADA, robotics, and automation skills — regardless of location.',
    feat2Title: '💰 Milestone Escrow',
    feat2Desc: 'Zero risk for both parties. Funds are held securely and released only upon successful completion of predefined project milestones.',
    feat3Title: '🗣️ Multilingual AI PM',
    feat3Desc: 'Our AI Project Manager handles real-time translation across English, Chinese, Spanish, Vietnamese, Hindi, and more — zero communication gaps.',
  },
  zh: {
    navHow: '运作模式', navTalent: '找当地工程师', navLogin: '登录控制台',
    heroTitle: '中国智造出海的全球工程师服务平台',
    heroSub: '连接中国出海设备企业与全球本地经AI认证的自动化工程师。覆盖北美、越南、印度等核心市场，无需签证，快速交付。',
    heroBtn: '发布海外需求',
    feat1Title: '🛡️ AI 技术面试官',
    feat1Desc: '平台所有工程师均通过自研 AI 考官的 PLC、SCADA、机器人等专项测试，全球统一标准，拒绝水分。',
    feat2Title: '💰 里程碑资金托管',
    feat2Desc: '买卖双方零风险。资金安全托管，仅在预设工程节点（接线、打点、试运行）成功验收后释放。',
    feat3Title: '🗣️ 多语言 AI 项目经理',
    feat3Desc: '我们的 AI 项目经理支持中英西越印等多语言实时同传，彻底打通跨国技术沟通壁垒。',
  },
  es: {
    navHow: 'Cómo funciona', navTalent: 'Encuentra Ingenieros', navLogin: 'Iniciar sesión',
    heroTitle: 'El mercado global de talento en automatización industrial',
    heroSub: 'Conectamos fabricantes y proveedores de equipos con ingenieros locales verificados por IA en todo el mundo — Norteamérica, Vietnam, India y más.',
    heroBtn: 'Contratar un experto local',
    feat1Title: '🛡️ Talento verificado por IA',
    feat1Desc: 'Cada ingeniero supera nuestro evaluador técnico de IA en PLC, SCADA, robótica y automatización, sin importar su ubicación.',
    feat2Title: '💰 Depósito en garantía por hitos',
    feat2Desc: 'Cero riesgo para ambas partes. Los fondos se liberan solo tras la finalización exitosa de cada hito.',
    feat3Title: '🗣️ IA Multilingüe',
    feat3Desc: 'Nuestro Gestor de Proyectos IA traduce en tiempo real entre inglés, chino, español, vietnamita, hindi y más.',
  },
  vi: {
    navHow: 'Cách hoạt động', navTalent: 'Tìm Kỹ Sư', navLogin: 'Đăng nhập',
    heroTitle: 'Nền tảng toàn cầu cho kỹ sư tự động hóa công nghiệp',
    heroSub: 'Kết nối nhà sản xuất thiết bị và tích hợp hệ thống toàn cầu với kỹ sư tự động hóa địa phương được AI xác minh tại Việt Nam, Ấn Độ, Bắc Mỹ và hơn thế nữa.',
    heroBtn: 'Thuê chuyên gia địa phương',
    feat1Title: '🛡️ Nhân tài được AI xác minh',
    feat1Desc: 'Mọi kỹ sư đều vượt qua bài kiểm tra kỹ thuật AI chuyên biệt về PLC, SCADA, robot và tự động hóa.',
    feat2Title: '💰 Ký quỹ theo cột mốc',
    feat2Desc: 'Không rủi ro cho cả hai bên. Tiền được giữ an toàn và chỉ giải ngân khi hoàn thành từng cột mốc dự án.',
    feat3Title: '🗣️ AI Đa ngôn ngữ',
    feat3Desc: 'Quản lý dự án AI của chúng tôi dịch theo thời gian thực giữa tiếng Anh, Trung, Tây Ban Nha, Việt và Hindi.',
  },
  hi: {
    navHow: 'यह कैसे काम करता है', navTalent: 'इंजीनियर खोजें', navLogin: 'साइन इन',
    heroTitle: 'औद्योगिक स्वचालन प्रतिभा का वैश्विक बाज़ार',
    heroSub: 'हम उपकरण निर्माताओं को भारत, वियतनाम, उत्तरी अमेरिका और दुनिया भर में AI-सत्यापित स्थानीय ऑटोमेशन इंजीनियरों से जोड़ते हैं।',
    heroBtn: 'स्थानीय विशेषज्ञ नियुक्त करें',
    feat1Title: '🛡️ AI-सत्यापित प्रतिभा',
    feat1Desc: 'हर इंजीनियर PLC, SCADA, रोबोटिक्स और ऑटोमेशन के लिए हमारे AI तकनीकी परीक्षण से गुजरता है।',
    feat2Title: '💰 माइलस्टोन एस्क्रो',
    feat2Desc: 'दोनों पक्षों के लिए शून्य जोखिम। प्रत्येक प्रोजेक्ट माइलस्टोन पूरा होने पर ही धनराशि जारी होती है।',
    feat3Title: '🗣️ बहुभाषी AI',
    feat3Desc: 'हमारा AI प्रोजेक्ट मैनेजर अंग्रेजी, चीनी, स्पेनिश, वियतनामी और हिंदी में रियल-टाइम अनुवाद करता है।',
  },
  fr: {
    navHow: 'Comment ça marche', navTalent: 'Trouver des Ingénieurs', navLogin: 'Se connecter',
    heroTitle: 'La marketplace mondiale du talent en automatisation industrielle',
    heroSub: 'Nous connectons les fabricants d\'équipements du monde entier avec des ingénieurs locaux vérifiés par IA — Amérique du Nord, Vietnam, Inde, Europe et au-delà.',
    heroBtn: 'Engager un expert local',
    feat1Title: '🛡️ Talent vérifié par IA',
    feat1Desc: 'Chaque ingénieur passe notre évaluateur technique IA en PLC, SCADA, robotique et automatisation.',
    feat2Title: '💰 Séquestre par jalons',
    feat2Desc: 'Zéro risque pour les deux parties. Les fonds sont libérés uniquement après la validation de chaque jalon.',
    feat3Title: '🗣️ IA Multilingue',
    feat3Desc: 'Notre chef de projet IA traduit en temps réel entre l\'anglais, le chinois, l\'espagnol, le vietnamien, l\'hindi et le français.',
  },
  de: {
    navHow: 'So funktioniert es', navTalent: 'Ingenieure finden', navLogin: 'Anmelden',
    heroTitle: 'Der globale Marktplatz für Industrieautomations-Talente',
    heroSub: 'Wir verbinden Anlagenhersteller weltweit mit KI-verifizierten lokalen Ingenieuren in Nordamerika, Vietnam, Indien, Europa und darüber hinaus.',
    heroBtn: 'Lokalen Experten einstellen',
    feat1Title: '🛡️ KI-verifiziertes Talent',
    feat1Desc: 'Jeder Ingenieur besteht unseren proprietären KI-Technologiescreener für SPS, SCADA, Robotik und Automatisierung.',
    feat2Title: '💰 Meilenstein-Treuhand',
    feat2Desc: 'Null Risiko für beide Seiten. Mittel werden erst nach erfolgreicher Meilensteinabnahme freigegeben.',
    feat3Title: '🗣️ Mehrsprachige KI',
    feat3Desc: 'Unser KI-Projektmanager übersetzt in Echtzeit zwischen Englisch, Chinesisch, Spanisch, Vietnamesisch, Hindi und Deutsch.',
  },
  ja: {
    navHow: '仕組み', navTalent: 'エンジニアを探す', navLogin: 'サインイン',
    heroTitle: '産業オートメーション人材のグローバルマーケット',
    heroSub: '世界中の設備メーカーと、北米・ベトナム・インド・ヨーロッパのAI検証済みエンジニアをつなぐプラットフォーム。',
    heroBtn: '地元の専門家を採用',
    feat1Title: '🛡️ AI認証済みエンジニア',
    feat1Desc: 'すべてのエンジニアがPLC・SCADA・ロボティクス・自動化に特化したAI技術スクリーナーをパス。',
    feat2Title: '💰 マイルストーンエスクロー',
    feat2Desc: '双方ゼロリスク。各マイルストーン完了後にのみ資金が解放されます。',
    feat3Title: '🗣️ 多言語AI',
    feat3Desc: 'AIプロジェクトマネージャーが英語・中国語・スペイン語・ベトナム語・ヒンディー語・日本語をリアルタイムで翻訳。',
  },
  ko: {
    navHow: '이용 방법', navTalent: '엔지니어 찾기', navLogin: '로그인',
    heroTitle: '산업 자동화 인재를 위한 글로벌 마켓플레이스',
    heroSub: '전 세계 설비 제조사와 북미, 베트남, 인도, 유럽의 AI 인증 현지 엔지니어를 연결합니다.',
    heroBtn: '현지 전문가 채용',
    feat1Title: '🛡️ AI 인증 인재',
    feat1Desc: '모든 엔지니어는 PLC, SCADA, 로보틱스, 자동화 분야의 독자적인 AI 기술 심사를 통과합니다.',
    feat2Title: '💰 마일스톤 에스크로',
    feat2Desc: '양측 모두 제로 리스크. 프로젝트 마일스톤 완료 후에만 자금이 지급됩니다.',
    feat3Title: '🗣️ 다국어 AI',
    feat3Desc: 'AI 프로젝트 매니저가 영어, 중국어, 스페인어, 베트남어, 힌디어, 한국어 등을 실시간 통역합니다.',
  },
};

export default function Home() {
  const [lang, setLangState] = useState('en');
  const [chatOpen, setChatOpen] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const [messages, setMessages] = useState([
    { role: 'agent', html: '长官，我是小麦穗！后台四大Agent已部署完毕，您可以直接对我用大白话发号施令（比如："帮我在蒙特雷招一个懂西门子的，预算1500美金"）。' },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tal_lang') || 'en';
    setLangState(saved);
  }, []);

  function setLang(l) {
    setLangState(l);
    localStorage.setItem('tal_lang', l);
  }

  function toggleChat() {
    setChatOpen((v) => !v);
    setBadgeVisible(false);
  }

  async function sendChat() {
    const text = inputVal.trim();
    if (!text || sending) return;
    setSending(true);
    setInputVal('');

    setMessages((prev) => [...prev, { role: 'user', html: text }]);

    const lower = text.toLowerCase();
    const loadId = Date.now();
    setMessages((prev) => [...prev, { role: 'agent', html: '🌾 收到长官指令，正在调用后台 Agent...', id: loadId }]);

    // Local intent shortcuts
    if (lower.includes('钱') || lower.includes('财务') || lower.includes('放款') || lower.includes('escrow') || lower.includes('pay')) {
      setTimeout(() => {
        setMessages((prev) => prev
          .filter((m) => m.id !== loadId)
          .concat([{ role: 'agent', html: '<b>💳 AI-CFO 资金报告：</b><br/>长官，目前您的托管账户中有 $1,500 处于锁定状态。<br/><a href="/finance" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">进入财务大盘</a>' }])
        );
        setSending(false);
      }, 800);
      return;
    }
    if (lower.includes('人') || lower.includes('工程师') || lower.includes('talent') || lower.includes('engineer')) {
      setTimeout(() => {
        setMessages((prev) => prev
          .filter((m) => m.id !== loadId)
          .concat([{ role: 'agent', html: '<b>🛡️ Ghost HR 人才库汇报：</b><br/>长官，我们昨天从 LinkedIn 挖到了 3 名墨西哥的高级 PLC 专家。<br/><a href="/talent" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">查看最新工程师</a>' }])
        );
        setSending(false);
      }, 800);
      return;
    }

    try {
      const res = await fetch('/api/demand/quick_launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: text, employer_email: 'boss@dinnar.com' }),
      });
      const result = await res.json();
      const reply = res.ok && result.parsed_summary
        ? `<b>✅ AI-PM 已接管：</b><br/>长官，您的需求已自动转为国际标书：<i>${result.parsed_summary.title}</i>。<br/>资金已切分为 ${result.parsed_summary.milestones.length} 个里程碑。幽灵猎头正在为您寻访 ${result.parsed_summary.region} 的工程师，一有消息我立刻通知您！`
        : '<span style="color:#ef4444;">抱歉长官，解析意图失败。请重新描述您的工程需求。</span>';

      setMessages((prev) => prev.filter((m) => m.id !== loadId).concat([{ role: 'agent', html: reply }]));
    } catch {
      setMessages((prev) => prev
        .filter((m) => m.id !== loadId)
        .concat([{ role: 'agent', html: '<span style="color:#ef4444;">网络连接中断，请稍后再试。</span>' }])
      );
    }
    setSending(false);
  }

  const d = DICT[lang];

  return (
    <>
      <Head>
        <title>Talengineer | Global Industrial Automation Experts</title>
      </Head>

      {/* Floating chatbot avatar */}
      <div className={styles.agentAvatar} onClick={toggleChat}>
        <img
          src="/img/avatar.jpg"
          alt="AI Agent"
          onError={(e) => { e.target.src = 'https://i.imgur.com/rM1iCqV.jpeg'; }}
        />
        {badgeVisible && <div className={styles.agentBadge}>1</div>}
      </div>

      {chatOpen && (
        <div className={styles.agentChatbox}>
          <div className={styles.chatHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src="/img/avatar.jpg"
                style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://i.imgur.com/rM1iCqV.jpeg'; }}
                alt="avatar"
              />
              小麦穗 (Platform Owner)
            </div>
            <span className={styles.chatClose} onClick={toggleChat}>×</span>
          </div>
          <div className={styles.chatBody}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === 'user' ? styles.msgUser : styles.msgAgent}
                dangerouslySetInnerHTML={{ __html: m.html }}
              />
            ))}
          </div>
          <div className={styles.chatInput}>
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Send an order..."
              onKeyPress={(e) => e.key === 'Enter' && sendChat()}
            />
            <button onClick={sendChat} disabled={sending}>Send</button>
          </div>
        </div>
      )}

      <Navbar lang={lang} onLangChange={setLang} />

      {/* Hero */}
      <section className={styles.hero}>
        <h1>{d.heroTitle}</h1>
        <p>{d.heroSub}</p>
        <Link href="/talent" className={styles.btn}>{d.heroBtn}</Link>
      </section>

      {/* Features */}
      <section id="how-it-works" className={styles.features}>
        {[
          { title: d.feat1Title, desc: d.feat1Desc },
          { title: d.feat2Title, desc: d.feat2Desc },
          { title: d.feat3Title, desc: d.feat3Desc },
        ].map((f, i) => (
          <div key={i} className={styles.featureCard}>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
    </>
  );
}
