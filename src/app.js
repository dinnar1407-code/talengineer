const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const Sentry = require('@sentry/node');
require('dotenv').config();

const app = express();

// ── 安全响应头（helmet）─────────────────────────────────────────────────────────
// helmet 是一组中间件的集合，会自动给每个响应加上一批安全相关的 HTTP 头，
// 比如 Strict-Transport-Security(HSTS，强制浏览器走 HTTPS)、X-Content-Type-Options:nosniff
// (禁止浏览器猜测 MIME 类型)、X-Frame-Options:SAMEORIGIN(防点击劫持/iframe 嵌套)等。
// 这些默认头是“保守且安全”的，不会破坏前后端功能，所以放在最前面、所有路由之前。
//
// ⚠️ 为什么 contentSecurityPolicy 先设为 false：
// CSP(内容安全策略)会严格限制页面能加载/执行哪些脚本、样式。Next.js 前端会注入大量
// 内联脚本(inline script)和内联样式，helmet 默认的 CSP 会直接把它们拦掉，导致前端白屏/功能失效。
// 因此这里先关闭 CSP，避免破坏现有前端；CSP 留作后续单独评估、配好白名单(nonce/hash)后再单独开启。
app.use(helmet({ contentSecurityPolicy: false }));

// 移除 X-Powered-By: Express 响应头，避免向外暴露后端框架信息（减少被针对性攻击的线索）。
app.disable('x-powered-by');

// ── Trust proxy（信任反向代理）────────────────────────────────────────────────
// 部署在 Railway 上时，请求先经过它的一层反向代理再到达本应用，客户端真实 IP 被放在
// X-Forwarded-For 头里。若不开启 trust proxy，express 会把代理自己的 IP 当成客户端 IP，
// 导致 express-rate-limit 对所有用户共用同一个 IP 限流（要么误伤、要么形同虚设）。
// 这里设为 1（只信任最靠近应用的"第 1 跳"代理），而不是 true：
// true 会无条件信任整条 X-Forwarded-For 链，攻击者可伪造该头绕过基于 IP 的限流。
app.set('trust proxy', 1);

// ── CORS: whitelist only known origins ───────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-password'],
  credentials: true,
}));

// ── Body parser ───────────────────────────────────────────────────────────────
// Stripe 验签需要原始字节：webhook 路径在 express.json 之前单独用 express.raw 解析，
// req.body 为原始 Buffer；解析后 body-parser 标记 req._body，后面的 express.json 不会二次读流导致 500
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// ── Rate limiting ─────────────────────────────────────────────────────────────
// General API: 100 requests / 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

// Auth endpoints: stricter — 10 requests / 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ── DB 可用性防护（审计 P2 防御纵深）──────────────────────────────────────────
// getClient() 在 SUPABASE_URL/KEY 缺失时返回 null，而 69 处路由调用均未判空——
// 那会在各路由内抛 TypeError 被兜成含糊的 500。这里在所有 /api 路由前单点拦截：
// 数据库未初始化时直接返回语义化的 503（服务暂不可用），运维一眼可辨"是配置问题不是代码 bug"。
// 生产环境 env 恒在，此中间件零开销直接放行。
const { getClient: getDbClient } = require('./config/db');
app.use('/api', (req, res, next) => {
  if (getDbClient()) return next();
  return res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
});

// ── Routes ────────────────────────────────────────────────────────────────────
const talentRoutes  = require('./routes/talent');
const financeRoutes = require('./routes/finance');
const authRoutes    = require('./routes/auth');
const demandRoutes  = require('./routes/demand');
const paymentRoutes = require('./routes/payment');
const iotRoutes     = require('./routes/iot');
const adminRoutes   = require('./routes/admin');
const connectRoutes        = require('./routes/connect');
const certificationsRoutes = require('./routes/certifications');
const workorderRoutes      = require('./routes/workorder');
const { router: apikeysRouter } = require('./routes/apikeys');
const disputesRoutes       = require('./routes/disputes');
const enterpriseRoutes     = require('./routes/enterprise');
const reviewsRoutes        = require('./routes/reviews');
const messagesRoutes       = require('./routes/messages');
const notificationsRoutes  = require('./routes/notifications');
const kycRoutes            = require('./routes/kyc');

app.use('/api/talent',          talentRoutes);
app.use('/api/finance',         financeRoutes);
app.use('/api/auth',            authRoutes);
app.use('/api/demand',          demandRoutes);
app.use('/api/payment',         paymentRoutes);
app.use('/api/iot',             iotRoutes);
app.use('/api/admin',           adminRoutes);
app.use('/api/payment/connect', connectRoutes);
app.use('/api/certifications',  certificationsRoutes);
app.use('/api/workorder',       workorderRoutes);
app.use('/api/apikeys',         apikeysRouter);
app.use('/api/disputes',        disputesRoutes);
app.use('/api/enterprise',      enterpriseRoutes);
app.use('/api/reviews',         reviewsRoutes);
app.use('/api/messages',        messagesRoutes);
app.use('/api/notifications',   notificationsRoutes);
app.use('/api/kyc',             kycRoutes);

// 未匹配的 /api/* 统一返回 404 JSON，避免落入下面的 catch-all 被当成页面返回 200 HTML
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ── Page routes ───────────────────────────────────────────────────────────────
app.get('/talent',  (req, res) => res.sendFile(path.join(__dirname, '../public', 'talent.html')));
app.get('/finance', (req, res) => res.sendFile(path.join(__dirname, '../public', 'finance.html')));
app.get('/warroom', (req, res) => res.sendFile(path.join(__dirname, '../public', 'warroom.html')));
app.get('*',        (req, res) => res.sendFile(path.join(__dirname, '../public', 'index.html')));

// ── Sentry error handler (must be before any other error middleware) ──────────
Sentry.setupExpressErrorHandler(app);

// ── Global error handler（全局错误处理 + 错误信息脱敏）─────────────────────────
// 这是 Express 的“错误处理中间件”：它的回调有 4 个参数 (err, req, res, next)，
// Express 据此识别它专门用来兜底处理上游路由抛出的异常。放在所有路由 use 之后。
// 脱敏原则：真实错误用 console.error 完整记录(同时也已被上面的 Sentry 捕获)，
// 但向客户端只返回通用文案，绝不把数据库/堆栈等内部细节泄露给前端(避免暴露表结构、SQL、路径等)。
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // CORS 报错是“可预期的、对调用方有意义”的提示（origin 不在白名单），保留原文案返回 403。
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message });
  }
  // 记录真实错误（保留完整堆栈，供日志/Sentry 排查），但不回传给客户端。
  console.error('[Server Error]', err);
  // 无论开发还是生产，对客户端一律只返回通用错误，避免信息泄露。
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

module.exports = app;
