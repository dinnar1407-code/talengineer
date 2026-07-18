import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { useLang } from '../hooks/useLang';
import styles from './developers.module.css';

// 页面文案（中英双套）。代码块/端点路径/事件名是语言无关的常量，放在 DICT 之外。
const DICT = {
  en: {
    heroBadge: 'Developers',
    heroTitle: 'Talengineer API v1',
    heroSub: 'A stable, versioned REST API for enterprise integration. Post demands, browse the engineer directory, track milestones, and receive signed webhooks.',
    authTitle: 'Authentication',
    authDesc: 'All v1 endpoints require an API key. Create one on the Enterprise page, then send it as a Bearer token. Keys are only issued to employer / enterprise accounts.',
    baseUrlLabel: 'Base URL',
    authHeaderLabel: 'Auth header',
    endpointsTitle: 'Endpoints',
    colMethod: 'Method',
    colPath: 'Path',
    colDesc: 'Description',
    webhooksTitle: 'Webhooks',
    webhooksDesc: 'Configure a webhook URL per API key on the Enterprise page. When you save it, we generate a signing secret (shown once). We POST a signed JSON body to your URL on these events:',
    colEvent: 'Event',
    payloadTitle: 'Payload',
    payloadDesc: 'Every delivery is a JSON body with this shape. The signature is computed over the exact bytes of this body.',
    sigTitle: 'Signature verification',
    sigDesc: 'Each request carries an X-TalEngineer-Signature header: the hex HMAC-SHA256 of the raw body, keyed by your webhook secret. Recompute it and compare in constant time:',
    manageBtn: 'Manage API keys & webhooks',
  },
  zh: {
    heroBadge: '开发者',
    heroTitle: 'Talengineer API v1',
    heroSub: '面向企业对接的稳定、带版本的 REST API。发布需求、浏览工程师目录、跟踪里程碑，并接收带签名的 webhook。',
    authTitle: '鉴权',
    authDesc: '所有 v1 端点都需要 API key。在企业版页面创建后，以 Bearer token 方式发送。API key 仅向雇主 / 企业账号发放。',
    baseUrlLabel: '基础 URL',
    authHeaderLabel: '鉴权头',
    endpointsTitle: '端点',
    colMethod: '方法',
    colPath: '路径',
    colDesc: '说明',
    webhooksTitle: 'Webhooks',
    webhooksDesc: '在企业版页面为每个 API key 配置 webhook 地址。保存时我们会生成签名密钥（仅显示一次）。以下事件发生时，我们会向你的地址 POST 一个带签名的 JSON：',
    colEvent: '事件',
    payloadTitle: '负载',
    payloadDesc: '每次投递都是如下结构的 JSON。签名基于这份 body 的原始字节计算。',
    sigTitle: '验签',
    sigDesc: '每个请求带 X-TalEngineer-Signature 头：用你的 webhook secret 对原始 body 做 HMAC-SHA256 的十六进制值。用同一算法复算并做常量时间比对：',
    manageBtn: '管理 API 密钥与 Webhook',
  },
};

// 端点表（路径语言无关，描述双语）。与 src/routes/entV1.js 的实现一一对应。
const ENDPOINTS = [
  { method: 'GET',  path: '/api/v1/ent/demands',                desc: { en: 'List your enterprise demands (paginated: page, limit).', zh: '列出本企业发布的需求（分页参数：page、limit）。' } },
  { method: 'POST', path: '/api/v1/ent/demands',                desc: { en: 'Create a demand. Body: title, description, budget, region.', zh: '创建需求。请求体：title、description、budget、region。' } },
  { method: 'GET',  path: '/api/v1/ent/talents',                desc: { en: 'Browse the public engineer directory (no PII). Query: region, skills, page, limit.', zh: '浏览公开工程师目录（无 PII）。查询参数：region、skills、page、limit。' } },
  { method: 'GET',  path: '/api/v1/ent/demands/:id/milestones', desc: { en: 'List milestones for a demand you own.', zh: '列出本企业某需求的里程碑。' } },
];

// Webhook 事件（与 payment.js / workorder.js / demand.js 触发点一致）。
const EVENTS = [
  { name: 'milestone.funded',   desc: { en: 'An employer funded a milestone into escrow.', zh: '雇主已将某里程碑款项托管。' } },
  { name: 'milestone.released', desc: { en: 'Escrowed funds were released to the engineer.', zh: '托管款项已放款给工程师。' } },
  { name: 'demand.assigned',    desc: { en: 'An engineer was assigned to your demand.', zh: '某工程师已被指派到你的需求。' } },
];

const PAYLOAD_EXAMPLE = `{
  "event": "milestone.funded",
  "payload": { "milestone_id": 123, "demand_id": 45 },
  "timestamp": "2026-07-17T12:00:00.000Z"
}`;

const VERIFY_EXAMPLE = `const crypto = require('crypto');

// Express: capture the RAW body for this route (e.g. express.raw),
// then verify before trusting the payload.
function verifyTalengineerWebhook(rawBody, headerSignature, webhookSecret) {
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)                // the exact bytes we sent
    .digest('hex');

  // Constant-time compare to avoid timing attacks.
  const a = Buffer.from(headerSignature || '', 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Usage inside your handler:
//   const sig = req.headers['x-talengineer-signature'];
//   if (!verifyTalengineerWebhook(req.rawBody, sig, process.env.TE_WEBHOOK_SECRET)) {
//     return res.status(401).end();
//   }`;

export default function Developers() {
  const [lang, setLang] = useLang();
  const d = DICT[lang] || DICT.en;
  const L = DICT[lang] ? lang : 'en'; // 端点/事件描述的语言键（仅 en/zh，其余回退 en）

  return (
    <>
      <Head>
        <title>Developer API Docs | Talengineer</title>
        <meta name="description" content="Talengineer API v1 for developers — authentication, endpoints, and signed webhooks with a Node signature-verification example." />
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
        {/* Authentication */}
        <section className={styles.section}>
          <h2>{d.authTitle}</h2>
          <p className={styles.sectionDesc}>{d.authDesc}</p>
          <p className={styles.sectionDesc}>{d.baseUrlLabel}: <code className={styles.code}>https://talengineer.us/api/v1/ent</code></p>
          <p className={styles.sectionDesc}>{d.authHeaderLabel}: <code className={styles.code}>Authorization: Bearer TE_your_key_here</code></p>
        </section>

        {/* Endpoints */}
        <section className={styles.section}>
          <h2>{d.endpointsTitle}</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>{d.colMethod}</th><th>{d.colPath}</th><th>{d.colDesc}</th></tr>
              </thead>
              <tbody>
                {ENDPOINTS.map(e => (
                  <tr key={e.method + e.path}>
                    <td><span className={`${styles.method} ${styles['m' + e.method]}`}>{e.method}</span></td>
                    <td><code className={styles.code}>{e.path}</code></td>
                    <td>{e.desc[L]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Webhooks */}
        <section className={styles.section}>
          <h2>{d.webhooksTitle}</h2>
          <p className={styles.sectionDesc}>{d.webhooksDesc}</p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>{d.colEvent}</th><th>{d.colDesc}</th></tr>
              </thead>
              <tbody>
                {EVENTS.map(ev => (
                  <tr key={ev.name}>
                    <td><code className={styles.code}>{ev.name}</code></td>
                    <td>{ev.desc[L]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className={styles.subTitle}>{d.payloadTitle}</h3>
          <p className={styles.sectionDesc}>{d.payloadDesc}</p>
          <pre className={styles.codeBlock}>{PAYLOAD_EXAMPLE}</pre>

          <h3 className={styles.subTitle}>{d.sigTitle}</h3>
          <p className={styles.sectionDesc}>{d.sigDesc}</p>
          <pre className={styles.codeBlock}>{VERIFY_EXAMPLE}</pre>

          <Link href="/enterprise" className={styles.manageBtn}>{d.manageBtn}</Link>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>© 2025 Talengineer.us · <Link href="/enterprise">Enterprise API</Link> · <Link href="/talent">Find Engineers</Link> · <Link href="/rates">Rate Benchmarks</Link></p>
      </footer>
    </>
  );
}
