import { useState } from 'react';
import styles from './ChatBot.module.css';

export default function ChatBot() {
  const [open, setOpen]       = useState(false);
  const [badge, setBadge]     = useState(true);
  const [messages, setMessages] = useState([
    { role: 'agent', html: '长官，我是小麦穗！后台四大Agent已部署完毕，您可以直接对我用大白话发号施令（比如："帮我在蒙特雷招一个懂西门子的，预算1500美金"）。' },
  ]);
  const [input, setInput]   = useState('');
  const [sending, setSending] = useState(false);

  function toggle() {
    setOpen(v => !v);
    setBadge(false);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput('');

    setMessages(prev => [...prev, { role: 'user', html: text }]);
    const loadId = Date.now();
    setMessages(prev => [...prev, { role: 'agent', html: '🌾 收到长官指令，正在调用后台 Agent...', id: loadId }]);

    const lower = text.toLowerCase();
    if (lower.includes('钱') || lower.includes('财务') || lower.includes('放款') || lower.includes('escrow') || lower.includes('pay')) {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== loadId).concat([{ role: 'agent', html: '<b>💳 AI-CFO 资金报告：</b><br/>长官，托管账户中有 $1,500 处于锁定状态。<br/><a href="/finance" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">进入财务大盘</a>' }]));
        setSending(false);
      }, 800);
      return;
    }
    if (lower.includes('人') || lower.includes('工程师') || lower.includes('talent') || lower.includes('engineer')) {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== loadId).concat([{ role: 'agent', html: '<b>🛡️ Ghost HR 汇报：</b><br/>3 名墨西哥高级 PLC 专家正待您查看。<br/><a href="/talent" style="display:inline-block;margin-top:8px;padding:6px 12px;background:#0056b3;color:#fff;border-radius:6px;">查看最新工程师</a>' }]));
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
        ? `<b>✅ AI-PM 已接管：</b><br/><i>${result.parsed_summary.title}</i><br/>资金已切分为 ${result.parsed_summary.milestones.length} 个里程碑，正在寻访 ${result.parsed_summary.region} 工程师！`
        : '<span style="color:#ef4444;">解析失败，请重新描述需求。</span>';
      setMessages(prev => prev.filter(m => m.id !== loadId).concat([{ role: 'agent', html: reply }]));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== loadId).concat([{ role: 'agent', html: '<span style="color:#ef4444;">网络连接中断，请稍后再试。</span>' }]));
    }
    setSending(false);
  }

  return (
    <>
      <div className={styles.avatar} onClick={toggle}>
        <img src="/img/avatar.jpg" alt="AI" onError={e => { e.target.src = 'https://i.imgur.com/rM1iCqV.jpeg'; }} />
        {badge && <div className={styles.badge}>1</div>}
      </div>

      {open && (
        <div className={styles.chatbox}>
          <div className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/img/avatar.jpg" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} onError={e => { e.target.src = 'https://i.imgur.com/rM1iCqV.jpeg'; }} alt="" />
              小麦穗 (Platform Owner)
            </div>
            <span className={styles.close} onClick={toggle}>×</span>
          </div>
          <div className={styles.body}>
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? styles.msgUser : styles.msgAgent} dangerouslySetInnerHTML={{ __html: m.html }} />
            ))}
          </div>
          <div className={styles.inputRow}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Send an order..." onKeyPress={e => e.key === 'Enter' && send()} />
            <button onClick={send} disabled={sending}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
