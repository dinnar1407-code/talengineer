const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

let supabase = null;

function initDB() {
    console.log("🚀 [V13 Architecture] Connecting to Supabase Cloud PostgreSQL...");
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error("🚨 [FATAL] Missing SUPABASE_URL or SUPABASE_KEY in .env");
        process.exit(1);
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
    return supabase;
}

module.exports = { initDB, getClient: () => supabase };
