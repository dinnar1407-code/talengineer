const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000; // Using 4000 to avoid conflict with Wheat Community (3737)

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Mock Database (To be replaced with SQLite/Postgres) ---
const db = {
    engineers: [],
    projects: []
};

// --- Routes ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Talengineer API' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Talengineer Server is running on http://localhost:${PORT}`);
    console.log(`   Domain binding ready: www.talengineer.us`);
});
