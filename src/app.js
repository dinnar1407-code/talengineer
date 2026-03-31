const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Mock DB for MVP testing before Postgres
const db = {
    demands: [],
    talents: [],
    milestones: []
};

// API Routes
app.post('/api/talent/screen_question', async (req, res) => {
    // Simulated AI Screener Response for testing
    const { skills, level } = req.body;
    res.json({
        status: 'ok',
        question: `You are a ${level} engineer with ${skills}. A Siemens S7-1500 PLC is showing a red SF error while communicating with a G120C drive. What are your first 3 troubleshooting steps?`
    });
});

app.post('/api/talent/screen_verify', async (req, res) => {
    // Simulated AI Grading for testing
    const { answer } = req.body;
    res.json({
        passed: true,
        score: 92,
        feedback: "Excellent understanding of Profinet diagnostics and hardware configuration."
    });
});

app.post('/api/talent/submit_profile', (req, res) => {
    const profile = { id: Date.now(), ...req.body, status: 'available', receivedAt: new Date().toISOString() };
    db.talents.push(profile);
    res.json({ status: 'ok', id: profile.id });
});

app.post('/api/auth/register', (req, res) => {
    const { email, role, name } = req.body;
    // Simplified auth for testing
    res.json({ status: 'ok', email, role, name });
});

app.get('/api/finance/ledger', (req, res) => {
    const { email } = req.query;
    // Return dummy data for testing the UI
    res.json({
        status: 'ok',
        data: [
            {
                demand_id: '1082',
                employer_email: 'terry.qin@outlook.com',
                engineer_email: 'juan.perez@mexico.com',
                hourly_rate: 85,
                hours_worked: 40,
                total_amount: 3400,
                status: 'pending'
            }
        ]
    });
});

// Serve HTML pages
app.get('/talent', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'talent.html'));
});

app.get('/finance', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'finance.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = app;
