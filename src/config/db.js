const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'talengineer.db'));

function initDB() {
    console.log("🚀 [V3 Architecture] Initializing local SQLite database.");
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            role TEXT NOT NULL,
            name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS talents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT,
            skills TEXT,
            region TEXT,
            rate TEXT,
            pricing_model TEXT,
            level TEXT,
            verified_score INTEGER DEFAULT 0,
            bio TEXT,
            contact TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS demands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employer_id INTEGER,
            title TEXT,
            role_required TEXT,
            region TEXT,
            project_type TEXT,
            location TEXT,
            budget TEXT,
            description TEXT,
            contact TEXT,
            status TEXT DEFAULT 'open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS project_milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            demand_id INTEGER,
            phase_name TEXT,
            percentage REAL,
            amount REAL,
            status TEXT DEFAULT 'locked',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS financial_ledgers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            demand_id INTEGER,
            employer_email TEXT,
            engineer_email TEXT,
            hourly_rate REAL,
            hours_worked REAL,
            total_amount REAL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS project_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            demand_id TEXT,
            sender_role TEXT,
            sender_name TEXT,
            original_text TEXT,
            translated_text TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    return db;
}

module.exports = { initDB, getClient: () => db };
