const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const talentRoutes = require('./routes/talent');
const financeRoutes = require('./routes/finance');
const authRoutes = require('./routes/auth');

app.use('/api/talent', talentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/auth', authRoutes);

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
