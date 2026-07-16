// IMPORTANT: Sentry must be initialized before anything else
// （审计 P2：此前仅 nextServer.js 加载 instrument，start:legacy 模式下 Sentry 完全未初始化）
require('../instrument.js');

const app = require('./app');
const http = require('http');
const { initDB } = require('./config/db');
const { attachSocket } = require('./socketServer');

const PORT = process.env.PORT || 4000;

// Initialize database
initDB();

const server = http.createServer(app);

// Socket.IO 统一实现（握手 JWT 鉴权 + 房间归属校验，见 src/socketServer.js）。
// 此前本文件手写一份与 nextServer.js 漂移的无鉴权 socket 逻辑（审计 P2：
// 任意人可 join 任意项目房间读写聊天；QC/日报处理器与生产入口签名漂移），
// 现收敛为单一来源，两入口行为一致。
const io = attachSocket(server);
global.io = io; // attach to global for external routes (like IoT webhook)

server.listen(PORT, () => {
    console.log(`🚀 Talengineer Core Services running on http://localhost:${PORT}`);
    console.log(`   WebSockets enabled for Babel War Room`);
    console.log(`   Domain binding ready: www.talengineer.us`);
});

// ── 优雅关闭（与 nextServer.js 相同策略）──────────────────────────────────────
// 收到 SIGTERM/SIGINT：关 socket → 等在途请求排空 → 退出；10 秒兜底强退。
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
