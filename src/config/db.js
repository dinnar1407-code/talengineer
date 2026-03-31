const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

let supabase = null;

function initDB() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (supabaseUrl && supabaseKey) {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log("🚀 [V3 Architecture] Connected to PostgreSQL via Supabase.");
    } else {
        console.warn("⚠️ [V3 Architecture] Supabase credentials missing. Falling back to SQLite.");
    }
    return supabase;
}

module.exports = { initDB, getClient: () => supabase };
