// IMPORTANT: Sentry must be initialized before anything else
require('../instrument.js');

/**
 * Custom Next.js + Express + Socket.IO server.
 *
 * Routing:
 *   /api/*       → Express routes (existing src/app.js)
 *   /socket.io/* → Socket.IO (auto-handled by the http.Server)
 *   everything   → Next.js (SSR/static pages)
 */

require('dotenv').config();
const http = require('http');
const next = require('next');

const app = require('./app');          // existing Express app
const { initDB } = require('./config/db');
const { attachSocket } = require('./socketServer');
const { cspHeaderValue } = require('./config/csp'); // 页面直出链路的 CSP（与 /api 的 helmet 同源同值）

const PORT = process.env.PORT || 4000;
const dev  = process.env.NODE_ENV !== 'production';

async function main() {
  // 1. Boot database (skip if env vars missing — lets Next.js pages still load locally)
  if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
    initDB();
  } else {
    console.warn('⚠️  [DB] SUPABASE_URL/KEY not set — API routes will be unavailable, but UI pages will still load.');
  }

  // 2. Prepare Next.js
  const nextApp = next({ dev, dir: process.cwd() });
  const handle  = nextApp.getRequestHandler();
  await nextApp.prepare();

  // 3. Build the HTTP server on top of the Express app
  const server = http.createServer((req, res) => {
    // Route API calls to Express
    if (req.url.startsWith('/api/') || req.url.startsWith('/socket.io/')) {
      return app(req, res);
    }
    // Everything else → Next.js
    // 页面路径绕过 Express 中间件链，helmet 的 CSP 到不了这里——手动补同一份头（防 XSS 主战场就是 HTML 页面）。
    res.setHeader('Content-Security-Policy', cspHeaderValue);
    return handle(req, res);
  });

  // 4. Attach Socket.IO（统一实现：握手 JWT 鉴权 + 房间归属校验，见 src/socketServer.js）
  const io = attachSocket(server);
  global.io = io;

  server.listen(PORT, () => {
    console.log(`\n🚀 Talengineer running on http://localhost:${PORT}`);
    console.log(`   Mode: ${dev ? 'development' : 'production'}\n`);
  });

  // ── 优雅关闭（审计 P3 修复）────────────────────────────────────────────────
  // Railway 每次重新部署都会给旧实例发 SIGTERM；此前无处理器 = 在途请求和 socket
  // 连接被硬杀。现在：先关 socket.io（断开客户端），再 server.close 等在途 HTTP
  // 请求做完才退出；10 秒还没排空就强制退出（防有连接一直不断导致老实例挂着不死）。
  const shutdown = (signal) => {
    console.log(`[Shutdown] Received ${signal}, draining connections...`);
    io.close();
    server.close(() => {
      console.log('[Shutdown] Drained cleanly. Bye.');
      process.exit(0);
    });
    setTimeout(() => {
      console.warn('[Shutdown] Drain timeout (10s), forcing exit.');
      process.exit(1);
    }, 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
