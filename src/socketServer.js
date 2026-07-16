// ── Socket.IO 统一初始化（带握手鉴权 + 房间归属校验）───────────────────────────
// 背景（审计 P2）：此前两个入口各自 new Server({cors:{origin:'*'}})，无任何鉴权：
//   1) 任意人（含未登录）可连 socket、join 任意 project_<id> 房间，读写该项目聊天室；
//   2) senderRole/senderName 全信客户端自报，可冒充雇主/工程师发言；
//   3) 两入口手写两份 handler，已发生过实参签名漂移（质检/日报在其中一个入口坏掉）。
// 本模块把 socket 逻辑收敛为单一实现，两个入口（nextServer.js / server.js）共用：
//   - io.use() 握手中间件校验 JWT（与 REST 侧同一 JWT_SECRET），拒绝匿名连接；
//   - joinRoom 复用 REST 侧的 assertDemandParticipant 判定"是不是这单的当事方"；
//   - 业务事件先检查 socket 已加入对应房间（即已通过归属校验）才处理；
//   - 身份字段（角色）取自 JWT 而非客户端自报，杜绝冒充。
// CORS：站点本身同源连接不受影响；跨域白名单用 ALLOWED_ORIGINS（逗号分隔）配置，
// 默认只放行生产域名与本地开发，替代原先的 '*' 通配。

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const { getClient } = require('./config/db');
const { assertDemandParticipant } = require('./middleware/ownership');
const {
  translateTechnicalMessage,
  generateDailyReport,
  generateNudgeMessage,
  analyzeQualityImage,
} = require('./services/aiService');

const JWT_SECRET = process.env.JWT_SECRET;

// 跨域白名单：默认生产域名 + 本地开发；需要额外来源时设 ALLOWED_ORIGINS 环境变量。
const DEFAULT_ORIGINS = [
  'https://talengineer.us',
  'https://www.talengineer.us',
  'http://localhost:4000',
  'http://localhost:3000',
];
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : DEFAULT_ORIGINS;

/**
 * 校验该 socket 是否已加入某项目房间（即 joinRoom 时已通过当事方校验）。
 * 所有业务事件都必须先过这道闸，防止"不 join 直接发事件"绕过归属校验。
 */
function inProjectRoom(socket, projectId) {
  return socket.rooms.has(`project_${projectId}`);
}

/**
 * 在给定的 http.Server 上挂载带鉴权的 Socket.IO，并返回 io 实例。
 * 两个入口（nextServer.js / server.js）都调用这里，保证行为一致。
 */
function attachSocket(server) {
  const io = new Server(server, { cors: { origin: allowedOrigins } });

  // 握手鉴权：客户端需以 io({ auth: { token } }) 连接，token 与 REST 侧同一 JWT。
  // 校验失败直接拒绝连接（前端会收到 connect_error）。
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, JWT_SECRET);
      // 与 REST 中间件保持同样的身份形状 { userId, email, role }
      socket.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
      return next();
    } catch (err) {
      return next(new Error('Authentication required'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id} (user ${socket.user.userId})`);

    // 加入项目聊天室：先校验"是不是这单的当事方"（雇主/申请过的工程师/admin）。
    socket.on('joinRoom', async ({ projectId }) => {
      try {
        const supabase = getClient();
        if (!supabase || !projectId) {
          return socket.emit('messageError', { error: 'Unable to join room.' });
        }
        const { allowed } = await assertDemandParticipant(supabase, projectId, socket.user);
        if (!allowed) {
          return socket.emit('messageError', { error: 'You are not a participant of this project.' });
        }
        socket.join(`project_${projectId}`);
        console.log(`[Socket] ${socket.user.role} (user ${socket.user.userId}) joined room project_${projectId}`);
      } catch (err) {
        console.error('[Socket] joinRoom error:', err);
        socket.emit('messageError', { error: 'Unable to join room.' });
      }
    });

    socket.on('chatMessage', async (data) => {
      try {
        if (!inProjectRoom(socket, data.projectId)) {
          return socket.emit('messageError', { error: 'Join the project room first.' });
        }
        // 角色取自 JWT（不信客户端自报），翻译方向由真实角色决定
        const senderRole = socket.user.role;
        const sourceLang = senderRole === 'employer' ? 'Chinese (Mandarin)' : 'Spanish';
        const targetLang = senderRole === 'employer' ? 'Spanish' : 'Chinese (Mandarin)';
        const translatedText = await translateTechnicalMessage(data.text, sourceLang, targetLang);

        const supabase = getClient();
        if (supabase) {
          await supabase.from('project_messages').insert([{
            demand_id: data.projectId,
            sender_role: senderRole,
            sender_name: data.senderName,
            original_text: data.text,
            translated_text: translatedText,
          }]);
        }

        io.to(`project_${data.projectId}`).emit('message', {
          senderId: socket.id,
          senderRole,
          senderName: data.senderName || senderRole,
          originalText: data.text,
          translatedText,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[Socket] Translation error:', err);
        socket.emit('messageError', { error: 'Failed to translate message.' });
      }
    });

    socket.on('requestDailyReport', async ({ projectId }) => {
      try {
        if (!inProjectRoom(socket, projectId)) {
          return socket.emit('messageError', { error: 'Join the project room first.' });
        }
        const supabase = getClient();
        const messages = supabase
          ? (await supabase.from('project_messages').select('*').eq('demand_id', projectId).limit(50)).data
          : [];
        // generateDailyReport 期望字符串形式的聊天记录，直接传对象数组会在 prompt 里变成 [object Object]
        const historyText = messages && messages.length > 0
          ? messages.map((m) => `[${m.sender_name}]: ${m.original_text}`).join('\n')
          : '(No recent chat history found. Provide general status assuming project just started.)';
        const report = await generateDailyReport(historyText);
        io.to(`project_${projectId}`).emit('message', {
          isAIPM: true,
          senderName: '🤖 AI-PM Daily Report',
          originalText: report,
          translatedText: report,
        });
      } catch (err) {
        socket.emit('messageError', { error: 'Failed to generate report.' });
      }
    });

    socket.on('requestNudge', async ({ projectId }) => {
      try {
        if (!inProjectRoom(socket, projectId)) {
          return socket.emit('messageError', { error: 'Join the project room first.' });
        }
        const nudge = await generateNudgeMessage(projectId);
        io.to(`project_${projectId}`).emit('message', {
          isAIPM: true,
          senderName: '🤖 AI-PM Nudge',
          originalText: nudge,
          translatedText: nudge,
        });
      } catch (err) {
        socket.emit('messageError', { error: 'Failed to generate nudge.' });
      }
    });

    socket.on('uploadQualityImage', async ({ projectId, imageData, context }) => {
      try {
        if (!inProjectRoom(socket, projectId)) {
          return socket.emit('messageError', { error: 'Join the project room first.' });
        }
        // analyzeQualityImage 签名为 (base64Data, mimeType, projectContext)：需先把前端传来的 dataURL 拆成 mimeType 与纯 base64
        const parts = imageData.split(';');
        const mimeType = parts[0].split(':')[1];
        const base64Data = parts[1].split(',')[1];
        const analysis = await analyzeQualityImage(base64Data, mimeType, context || '');
        // 返回值是 {verdict, feedback_es, feedback_zh} 对象，需拼成文本再发给前端，否则会显示 [object Object]
        const qcMessageEs = `**Verdict: ${analysis.verdict}**<br/>${analysis.feedback_es}`;
        const qcMessageZh = `**质检结果: ${analysis.verdict}**<br/>${analysis.feedback_zh}`;
        io.to(`project_${projectId}`).emit('message', {
          isIOT: true,
          senderName: '📷 AI Quality Control',
          originalText: qcMessageEs,
          translatedText: qcMessageZh,
        });
      } catch (err) {
        socket.emit('messageError', { error: 'Failed to analyse image.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = { attachSocket };
