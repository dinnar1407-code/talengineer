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
const { Server } = require('socket.io');

const app = require('./app');          // existing Express app
const { initDB, getClient } = require('./config/db');
const {
  translateTechnicalMessage,
  generateDailyReport,
  generateNudgeMessage,
  analyzeQualityImage,
} = require('./services/aiService');

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
    return handle(req, res);
  });

  // 4. Attach Socket.IO
  const io = new Server(server, { cors: { origin: '*' } });
  global.io = io;

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('joinRoom', ({ projectId, userRole }) => {
      socket.join(`project_${projectId}`);
      console.log(`[Socket] ${userRole} joined room project_${projectId}`);
    });

    socket.on('chatMessage', async (data) => {
      try {
        const sourceLang = data.senderRole === 'employer' ? 'Chinese (Mandarin)' : 'Spanish';
        const targetLang = data.senderRole === 'employer' ? 'Spanish' : 'Chinese (Mandarin)';
        const translatedText = await translateTechnicalMessage(data.text, sourceLang, targetLang);

        const supabase = getClient();
        if (supabase) {
          await supabase.from('project_messages').insert([{
            demand_id: data.projectId,
            sender_role: data.senderRole,
            sender_name: data.senderName,
            original_text: data.text,
            translated_text: translatedText,
          }]);
        }

        io.to(`project_${data.projectId}`).emit('message', {
          senderId: socket.id,
          senderRole: data.senderRole,
          senderName: data.senderName || data.senderRole,
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
        const supabase = getClient();
        const messages = supabase
          ? (await supabase.from('project_messages').select('*').eq('demand_id', projectId).limit(50)).data
          : [];
        const report = await generateDailyReport(messages || []);
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
        const analysis = await analyzeQualityImage(imageData, context);
        io.to(`project_${projectId}`).emit('message', {
          isIOT: true,
          senderName: '📷 AI Quality Control',
          originalText: analysis,
          translatedText: analysis,
        });
      } catch (err) {
        socket.emit('messageError', { error: 'Failed to analyse image.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`\n🚀 Talengineer running on http://localhost:${PORT}`);
    console.log(`   Mode: ${dev ? 'development' : 'production'}\n`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
