import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import styles from './index.module.css';

const DICT = {
  en: {
    navHow: 'How it Works', navTalent: 'Find Engineers', navLogin: 'Sign In',
    heroTitle: 'The Last-Mile Infrastructure for Global Equipment Deployment',
    heroSub: 'We connect Chinese manufacturing equipment suppliers with AI-verified, local automation engineers in North America and Mexico. Eliminate visa headaches, slash travel costs, and deploy faster.',
    heroBtn: 'Hire a Local Expert',
    feat1Title: '🛡️ AI-Verified Talent',
    feat1Desc: 'Every engineer on our platform is rigorously tested by our proprietary AI Technical Screener for specific PLC and automation skills.',
    feat2Title: '💰 Milestone Escrow',
    feat2Desc: 'Zero risk for both parties. Funds are held securely and released only upon successful completion of predefined project milestones.',
    feat3Title: '🗣️ Seamless Translation',
    feat3Desc: 'Break the language barrier. Our AI Project Manager translates technical requirements and communication between Chinese suppliers and local engineers in real-time.',
  },
  zh: {
    navHow: '运作模式', navTalent: '找当地工程师', navLogin: '登录控制台',
    heroTitle: '中国智造出海的最后一公里基础设施',
    heroSub: '连接中国设备出海企业与北美、墨西哥本地经AI认证的自动化工程师。免去签证烦恼，砍掉差旅成本，实现海外产线快速交付。',
    heroBtn: '发布海外需求',
    feat1Title: '🛡️ AI 技术面试官',
    feat1Desc: '平台所有入驻工程师均通过自研 AI 考官进行的硬核 PLC 及自动化控制场景题测试，拒绝水分。',
    feat2Title: '💰 里程碑资金托管',
    feat2Desc: '买卖双方零风险。资金安全托管，仅在预设的工程节点（如接线、打点、试运行）成功验收后释放。',
    feat3Title: '🗣️ 无缝跨国协同',
    feat3Desc: '打破语言屏障。我们的 AI 项目经理实时同传中国供应商与海外本地工程师之间的技术文档与对话。',
  },
  es: {
    navHow: 'Cómo funciona', navTalent: 'Encuentra Ingenieros', navLogin: 'Iniciar sesión',
    heroTitle: 'La infraestructura de última milla para el despliegue global de equipos',
    heroSub: 'Conectamos a proveedores chinos de equipos de fabricación con ingenieros locales de automatización verificados por IA en Norteamérica y México.',
    heroBtn: 'Contrata a un experto local',
    feat1Title: '🛡️ Talento verificado por IA',
    feat1Desc: 'Cada ingeniero en nuestra plataforma es evaluado rigurosamente por nuestro Evaluador Técnico de IA patentado.',
    feat2Title: '💰 Depósito en garantía por hitos',
    feat2Desc: 'Cero riesgo para ambas partes. Los fondos se liberan solo tras la finalización exitosa de hitos predefinidos.',
    feat3Title: '🗣️ Traducción fluida',
    feat3Desc: 'Nuestro Gerente de Proyectos de IA traduce los requisitos técnicos y la comunicación en tiempo real.',
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
