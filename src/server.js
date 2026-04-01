const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const { initDB, getClient } = require('./config/db');
const { translateTechnicalMessage, generateDailyReport, generateNudgeMessage, analyzeQualityImage } = require('./services/aiService');

const PORT = process.env.PORT || 4000;

// Initialize database
initDB();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
global.io = io; // attach to global for external routes (like IoT webhook)

io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('joinRoom', ({ projectId, userRole }) => {
        socket.join(`project_${projectId}`);
        console.log(`[Socket] ${userRole} joined room project_${projectId}`);
    });

    socket.on('chatMessage', async (data) => {
        try {
            console.log(`[Socket] Received message from ${data.senderRole}: ${data.text}`);
            
            let sourceLang = data.senderRole === 'employer' ? 'Chinese (Mandarin)' : 'Spanish';
            let targetLang = data.senderRole === 'employer' ? 'Spanish' : 'Chinese (Mandarin)';

            const translatedText = await translateTechnicalMessage(data.text, sourceLang, targetLang);
            console.log(`[Socket] Translated to ${targetLang}: ${translatedText}`);

            // Save to DB
            const supabase = getClient();
            if (supabase) {
                await supabase.from('project_messages').insert([{
                    demand_id: data.projectId,
                    sender_role: data.senderRole,
                    sender_name: data.senderName,
                    original_text: data.text,
                    translated_text: translatedText
                }]);
            }

            io.to(`project_${data.projectId}`).emit('message', {
                senderId: socket.id,
                senderRole: data.senderRole,
                senderName: data.senderName || data.senderRole,
                originalText: data.text,
                translatedText: translatedText,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('[Socket] Translation error:', error);
            socket.emit('messageError', { error: 'Failed to translate message.' });
        }
    });

    // Handle AI-PM specific commands
    socket.on('requestDailyReport', async (data) => {
        try {
            const supabase = getClient();
            if (!supabase) throw new Error("DB not ready");

            const { data: messages, error } = await supabase
                .from('project_messages')
                .select('sender_name, original_text')
                .eq('demand_id', data.projectId)
                .order('created_at', { ascending: true })
                .limit(100);
            
            if (error) throw error;
            
            let historyText = messages && messages.length > 0 
                ? messages.map(m => `[${m.sender_name}]: ${m.original_text}`).join('\n')
                : "(No recent chat history found. Provide general status assuming project just started.)";

            socket.emit('message', {
                senderId: 'nexus-pm',
                senderRole: 'system-pm',
                senderName: '🤖 Nexus-PM',
                originalText: 'Generating daily report...',
                translatedText: '正在为您生成今日现场进度简报...',
                timestamp: new Date().toISOString(),
                isAIPM: true
            });

            const report = await generateDailyReport(historyText);

            // Format markdown to simple HTML for chat
            const formattedReport = report.replace(/\n/g, '<br/>');

            io.to(`project_${data.projectId}`).emit('message', {
                senderId: 'nexus-pm',
                senderRole: 'system-pm',
                senderName: '🤖 Nexus-PM',
                originalText: formattedReport,
                translatedText: formattedReport, // Employer reads Chinese anyway
                timestamp: new Date().toISOString(),
                isAIPM: true
            });

        } catch (error) {
            console.error('[Socket] AI-PM Report error:', error);
        }
    });

    socket.on('requestNudge', async (data) => {
        try {
            socket.emit('message', {
                senderId: 'nexus-pm',
                senderRole: 'system-pm',
                senderName: '🤖 Nexus-PM',
                originalText: 'Generating nudge message...',
                translatedText: '正在自动向工程师发出进度询问...',
                timestamp: new Date().toISOString(),
                isAIPM: true
            });

            const nudgeMsg = await generateNudgeMessage();

            // Save to DB so it has context
            const supabase = getClient();
            if (supabase) {
                await supabase.from('project_messages').insert([{
                    demand_id: data.projectId,
                    sender_role: 'system-pm',
                    sender_name: '🤖 Nexus-PM',
                    original_text: nudgeMsg,
                    translated_text: '请报告今天的现场进度和遇到的阻碍。'
                }]);
            }

            io.to(`project_${data.projectId}`).emit('message', {
                senderId: 'nexus-pm',
                senderRole: 'system-pm',
                senderName: '🤖 Nexus-PM',
                originalText: '【System Ping】 Please report today\'s progress and any blockers.',
                translatedText: nudgeMsg, // Spanish to Engineer
                timestamp: new Date().toISOString(),
                isAIPM: true
            });

        } catch (error) {
            console.error('[Socket] AI-PM Nudge error:', error);
        }
    });

    socket.on('uploadQualityImage', async (data) => {
        try {
            // Tell room that QC is analyzing
            io.to(`project_${data.projectId}`).emit('message', {
                senderId: 'nexus-qc',
                senderRole: 'system-qc',
                senderName: '🔍 AI-QC Inspector',
                originalText: `Submitting image for AI QA Verification...`,
                translatedText: `工程师提交了一张图片进行 AI 质检...`,
                timestamp: new Date().toISOString(),
                isAIPM: true
            });

            // Extract base64 and mime type (e.g. data:image/jpeg;base64,.....)
            const parts = data.imageData.split(';');
            const mimeType = parts[0].split(':')[1];
            const base64Data = parts[1].split(',')[1];

            const result = await analyzeQualityImage(base64Data, mimeType, data.context || '');

            let qcMessageEn = `**Verdict: ${result.verdict}**\n${result.feedback_es}`;
            let qcMessageZh = `**质检结果: ${result.verdict}**\n${result.feedback_zh}`;

            // Save to DB
            const supabase = getClient();
            if (supabase) {
                await supabase.from('project_messages').insert([{
                    demand_id: data.projectId,
                    sender_role: 'system-qc',
                    sender_name: '🔍 AI-QC Inspector',
                    original_text: qcMessageEn,
                    translated_text: qcMessageZh
                }]);
            }

            io.to(`project_${data.projectId}`).emit('message', {
                senderId: 'nexus-qc',
                senderRole: 'system-qc',
                senderName: '🔍 AI-QC Inspector',
                originalText: qcMessageEn.replace(/\n/g, '<br>'),
                translatedText: qcMessageZh.replace(/\n/g, '<br>'),
                timestamp: new Date().toISOString(),
                isAIPM: true
            });

        } catch (error) {
            console.error('[Socket] AI-QC Error:', error);
            socket.emit('messageError', { error: 'Failed to run AI Quality Check.' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Talengineer Core Services running on http://localhost:${PORT}`);
    console.log(`   WebSockets enabled for Babel War Room`);
    console.log(`   Domain binding ready: www.talengineer.us`);
});
