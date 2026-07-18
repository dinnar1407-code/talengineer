// CSP 白名单单一来源：Express(helmet，覆盖 /api) 与 Next 页面直出（nextServer 手动 setHeader）共用。
// 为什么抽出来：nextServer 的页面路径绕过 Express 中间件链，helmet 的 CSP 到不了 HTML 页面——
// 而 CSP 防 XSS 主要就是护 HTML。两条链路引同一份指令表，防止各改各的漂移。
// 'unsafe-inline' 供 Next pages-router 内联运行时；'unsafe-eval' 仅开发环境（React Refresh/HMR 需要），
// 生产构建不需要 eval，故 prod 不放开，收窄 XSS 面。
const directives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", 'https://js.stripe.com', ...(process.env.NODE_ENV !== 'production' ? ["'unsafe-eval'"] : [])],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", 'data:', 'blob:', 'https://*.supabase.co'],
  connectSrc: ["'self'", 'https://*.supabase.co', 'https://api.stripe.com', 'wss:', 'https://*.ingest.sentry.io'],
  frameSrc: ['https://js.stripe.com', 'https://checkout.stripe.com'],
  workerSrc: ["'self'"],
  // 以下与 helmet 默认集对齐：页面链路手动 set 时也要有同等强度，两条链路输出一致。
  baseUri: ["'self'"],
  fontSrc: ["'self'", 'https:', 'data:'],
  formAction: ["'self'"],
  frameAncestors: ["'self'"],
  objectSrc: ["'none'"],
  scriptSrcAttr: ["'none'"],
  upgradeInsecureRequests: [],
};

// camelCase → kebab-case（upgradeInsecureRequests 这类无值指令只输出名字）
const kebab = (s) => s.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
const cspHeaderValue = Object.entries(directives)
  .map(([k, v]) => (v.length ? `${kebab(k)} ${v.join(' ')}` : kebab(k)))
  .join(';');

module.exports = { directives, cspHeaderValue };
