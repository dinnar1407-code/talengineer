// ── ALLOWED_ORIGINS 单一来源（宪法第 1 章铁律 4：同源配置禁止双份维护）──────────
// 背景（P1 治理 D3）：此前 app.js 与 socketServer.js 各自解析一遍 ALLOWED_ORIGINS，
// 且默认值不一致——app.js 默认仅 ['http://localhost:4000']，socketServer 默认含生产域名。
// 未配 env 时 REST CORS 会挡掉生产域名的跨域请求，而 socket 却放行，行为漂移。
// 现收敛为唯一实现：默认放行生产域名 + 本地开发两端口；需要额外来源时设
// ALLOWED_ORIGINS 环境变量（逗号分隔）整体覆盖。

const DEFAULT_ORIGINS = [
  'https://talengineer.us',
  'https://www.talengineer.us',
  'http://localhost:4000',
  'http://localhost:3000',
];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : DEFAULT_ORIGINS;

module.exports = { allowedOrigins, DEFAULT_ORIGINS };
