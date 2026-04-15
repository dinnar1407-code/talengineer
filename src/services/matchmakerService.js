const { getClient } = require('../config/db');
const { generateMatchEmail } = require('./aiService');
const { sendOutreachEmail } = require('../config/email');

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000; // 1s, 2s, 4s

/**
 * Retry an async function with exponential backoff.
 */
async function withRetry(fn, label, maxRetries = MAX_RETRIES) {
  let lastErr;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries) {
        const delay = RETRY_BASE_MS * Math.pow(2, attempt - 1);
        console.warn(`⚠️ [Matchmaker] ${label} failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

async function runMatchmaker(demandId) {
  console.log(`\n🔍 [Matchmaker] Processing Demand #${demandId}...`);
  try {
    const supabase = getClient();
    if (!supabase) return;

    // 1. Fetch demand
    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .select('*')
      .eq('id', demandId)
      .single();

    if (demandErr || !demand) {
      console.log(`❌ [Matchmaker] Demand #${demandId} not found.`);
      return;
    }

    console.log(`📍 [Matchmaker] "${demand.title}" | Region: ${demand.region}`);

    // 2. Resolve region hint
    const demandRegion = (demand.region && !['null', 'undefined'].includes(demand.region))
      ? demand.region : 'US';
    const regionHint = demandRegion.includes('MX') ? 'MX'
      : demandRegion.includes('CA') ? 'CA' : 'US';

    // 3. Find matching engineers (uses idx_talents_region_score)
    const { data: matches, error: talentErr } = await supabase
      .from('talents')
      .select('*')
      .ilike('region', `%${regionHint}%`)
      .order('verified_score', { ascending: false })
      .limit(3);

    if (talentErr || !matches || matches.length === 0) {
      console.log(`⚠️ [Matchmaker] No engineers found in region "${regionHint}".`);
      return;
    }

    console.log(`🎯 [Matchmaker] Found ${matches.length} engineer(s) in ${regionHint}.`);

    // 4. Track results per engineer
    const results = { sent: 0, failed: 0, errors: [] };

    for (const engineer of matches) {
      try {
        // 4a. Generate personalised email (with retry)
        const emailBody = await withRetry(
          () => generateMatchEmail(
            demand.title,
            demand.description,
            demand.budget,
            engineer.name,
            engineer.skills,
            engineer.region,
          ),
          `generateMatchEmail for ${engineer.name}`
        );

        const htmlBody = emailBody.split('\n').map(line => `<p>${line}</p>`).join('');

        // 4b. Create pending ledger entry (idempotent — skip if already exists)
        const { error: ledgerErr } = await supabase
          .from('ledgers')
          .insert([{
            demand_id: demand.id,
            employer_id: demand.employer_id || 1,
            employer_email: demand.contact,
            engineer_id: engineer.id,
            engineer_email: engineer.contact,
            total_amount: parseFloat((demand.budget || '0').toString().replace(/[^0-9.]/g, '')) || 1000,
            status: 'pending',
          }])
          .select()
          .maybeSingle(); // won't throw if duplicate

        if (ledgerErr && ledgerErr.code !== '23505') {
          console.warn(`⚠️ [Matchmaker] Ledger insert failed for ${engineer.name}:`, ledgerErr.message);
        }

        // 4c. Send email (with retry)
        await withRetry(
          () => sendOutreachEmail(
            engineer.contact,
            `TalEngineer Match: ${demand.title}`,
            htmlBody,
          ),
          `sendEmail to ${engineer.contact}`
        );

        console.log(`✉️ [Matchmaker] Email sent → ${engineer.name} <${engineer.contact}>`);
        results.sent++;

      } catch (err) {
        // One engineer failing does NOT stop others
        results.failed++;
        results.errors.push({ engineer: engineer.name, error: err.message });
        console.error(`❌ [Matchmaker] Failed to process ${engineer.name} after ${MAX_RETRIES} attempts:`, err.message);
      }
    }

    console.log(`✅ [Matchmaker] Done — sent: ${results.sent}, failed: ${results.failed}`);
    if (results.errors.length) {
      console.error('[Matchmaker] Errors:', JSON.stringify(results.errors));
    }

  } catch (err) {
    console.error(`🚨 [Matchmaker] Fatal error for Demand #${demandId}:`, err);
  }
}

module.exports = { runMatchmaker };
