const { getClient } = require('../config/db');
const { generateMatchEmail } = require('./aiService');
const { sendOutreachEmail } = require('../config/email');
const { createNotification } = require('./notificationService');
const { MIN_POOL_VERIFIED_SCORE } = require('../config/matching'); // 入网门槛开关（默认 0=关闭）

// ── Keyword scorer ────────────────────────────────────────────────────────────
const STOP_WORDS = new Set(['the','and','or','in','at','to','for','of','a','an',
  'with','on','is','are','be','that','this','have','has','will','can','must',
  'not','from','by','as','it','its','we','our','your','all','any','more']);

function extractKeywords(text) {
  if (!text) return [];
  return text.toLowerCase()
    .split(/[\s,;/\\()\-\.]+/)
    .map(w => w.replace(/[^a-z0-9#\+]/g, ''))
    .filter(w => w.length >= 2 && !STOP_WORDS.has(w));
}

// 多因子撮合评分（路径 A·精英策展）：在"技能重叠"基础上叠加质量信号，
// 让高分/高评价/可接单的工程师排名更靠前。所有因子都来自 talents 行（纯函数，便于测试）。
//   - 技能重叠 overlap×100：核心匹配度（0-100）
//   - verified_score×0.3：AI 技术筛选分（质量基石，权重从 0.2 提到 0.3）
//   - avg_rating 映射 0-20：历史口碑（5 分制 ×4），评价数太少则打折避免单条好评刷榜
//   - availability：available 不扣分、busy 轻扣、unavailable 重扣（别推不接单的人）
function scoreEngineer(engineer, demandKeywords) {
  const verified = engineer.verified_score || 0;

  // 1) 技能重叠（无关键词时退化为只看质量信号）
  let overlapScore = 0;
  if (demandKeywords.length) {
    const engText = ((engineer.skills || '') + ' ' + (engineer.name || '')).toLowerCase();
    const hits = demandKeywords.filter(kw => engText.includes(kw)).length;
    overlapScore = (hits / demandKeywords.length) * 100;
  }

  // 2) 评价口碑：avg_rating(1-5) → 0-20 分；评价数 <3 时按比例打折，防"1 条 5 星"刷榜
  const rating = engineer.avg_rating || 0;
  const reviewCount = engineer.review_count || 0;
  const confidence = reviewCount >= 3 ? 1 : reviewCount / 3;
  const ratingScore = rating * 4 * confidence;

  // 3) 可用性：能接单优先
  const availPenalty = engineer.availability === 'unavailable' ? -40
    : engineer.availability === 'busy' ? -15
    : 0;

  return overlapScore + verified * 0.3 + ratingScore + availPenalty;
}

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

    // 2. Build keyword set from demand
    const demandKeywords = extractKeywords(
      (demand.role_required || '') + ' ' + (demand.description || '')
    );
    console.log(`🔑 [Matchmaker] Keywords (${demandKeywords.length}): ${demandKeywords.slice(0, 10).join(', ')}`);

    // 3. Resolve region hint
    const demandRegion = (demand.region && !['null', 'undefined'].includes(demand.region))
      ? demand.region : 'US';
    const regionHint = demandRegion.includes('MX') ? 'MX'
      : demandRegion.includes('CA') ? 'CA'
      : demandRegion.includes('VN') || demandRegion.toLowerCase().includes('vietnam') ? 'VN'
      : demandRegion.includes('IN') || demandRegion.toLowerCase().includes('india') ? 'IN'
      : 'US';

    // 4. Fetch candidates from region, score by keyword overlap, take top 5
    // 入网硬门槛（落地第一步 #3，env 开关）：阈值 >0 时只让筛选达标的工程师进推荐池。
    // 默认 0 = 关闭（老工程师历史分未补齐前开门槛会清空池子）。详见 src/config/matching.js。
    let candidateQuery = supabase
      .from('talents')
      .select('*')
      .ilike('region', `%${regionHint}%`);
    if (MIN_POOL_VERIFIED_SCORE > 0) {
      candidateQuery = candidateQuery.gte('verified_score', MIN_POOL_VERIFIED_SCORE);
    }
    const { data: candidates, error: talentErr } = await candidateQuery
      .order('verified_score', { ascending: false })
      .limit(30); // fetch wider pool for scoring

    if (talentErr || !candidates || candidates.length === 0) {
      console.log(`⚠️ [Matchmaker] No engineers found in region "${regionHint}".`);
      return;
    }

    const scored = candidates
      .map(e => ({ ...e, _score: scoreEngineer(e, demandKeywords) }))
      .sort((a, b) => b._score - a._score);

    const matches = scored.slice(0, 5);
    console.log(`🎯 [Matchmaker] Top ${matches.length} match(es) in ${regionHint}.`);

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

        // In-app notification for engineer
        createNotification({
          user_email: engineer.contact,
          type: 'smart_match',
          title: `Smart Match: "${demand.title}"`,
          body: `You've been matched to a new project in your area. Check it out!`,
          link: `/talent`,
          demand_id: demand.id,
        });

        results.sent++;

      } catch (err) {
        // One engineer failing does NOT stop others
        results.failed++;
        results.errors.push({ engineer: engineer.name, error: err.message });
        console.error(`❌ [Matchmaker] Failed to process ${engineer.name} after ${MAX_RETRIES} attempts:`, err.message);
      }
    }

    // Notify employer that matching is complete
    if (results.sent > 0 && demand.contact) {
      createNotification({
        user_email: demand.contact,
        type: 'smart_match',
        title: `${results.sent} engineer${results.sent > 1 ? 's' : ''} matched to "${demand.title}"`,
        body: 'Smart matching complete. Engineers have been notified and may apply soon.',
        link: `/finance?tab=applications&demand=${demand.id}`,
        demand_id: demand.id,
      });
    }

    console.log(`✅ [Matchmaker] Done — sent: ${results.sent}, failed: ${results.failed}`);
    if (results.errors.length) {
      console.error('[Matchmaker] Errors:', JSON.stringify(results.errors));
    }

  } catch (err) {
    console.error(`🚨 [Matchmaker] Fatal error for Demand #${demandId}:`, err);
  }
}

module.exports = { runMatchmaker, scoreEngineer, extractKeywords };
