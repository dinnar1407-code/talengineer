const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const { initDB } = require('./config/db');
const { translateTechnicalMessage } = require('./services/aiService');

const PORT = process.env.PORT || 4000;

// Initialize database
initDB();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // User joins a project specific chat room
    socket.on('joinRoom', ({ projectId, userRole }) => {
        socket.join(`project_${projectId}`);
        console.log(`[Socket] ${userRole} joined room project_${projectId}`);
    });

    // Handle real-time translation chat
    socket.on('chatMessage', async (data) => {
        try {
            console.log(`[Socket] Received message from ${data.senderRole}: ${data.text}`);
            
            // Assume Employer speaks Chinese, Engineer speaks Spanish/English depending on region
            // Simplified for prototype: Employer->ZH, Engineer->ES. 
            // In a real app we'd fetch the user's preferred language from the database.
            let sourceLang = data.senderRole === 'employer' ? 'Chinese (Mandarin)' : 'Spanish';
            let targetLang = data.senderRole === 'employer' ? 'Spanish' : 'Chinese (Mandarin)';

            // Call Gemini to translate
            const translatedText = await translateTechnicalMessage(data.text, sourceLang, targetLang);
            console.log(`[Socket] Translated to ${targetLang}: ${translatedText}`);

            // Broadcast to the specific project room
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

    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Talengineer Core Services running on http://localhost:${PORT}`);
    console.log(`   WebSockets enabled for Babel War Room`);
    console.log(`   Domain binding ready: www.talengineer.us`);
});
