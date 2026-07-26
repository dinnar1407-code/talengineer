// ── Agent 写操作审计（Wave B / B1）───────────────────────────────────────────
// 表结构与记账纪律见 migrations/026_agent_actions.sql。这里只提供三个动作：
//   begin()    写前插 pending 行；**抛错即表示不许执行**（registry 据此拒绝工具调用）
//   complete() 写后回填 ok/error
//   findRecentDuplicate() 近重复防护
//
// 为什么 begin 抛错要阻断执行：审计的全部价值在于没有缺口。先执行后记账，一旦记账失败
// 就出现"做了但查不到"的行，这张表也就不能作为追责依据了。读工具不走这里（无副作用，
// 且 ai_events 已逐次埋点）。
const crypto = require('crypto');

// 近重复窗口：防的是 agent 循环把同一个动作重试两遍（同一轮对话内），
// 不是严格幂等——用户过几分钟故意再做一次同样的事应该被允许。
const DEDUPE_WINDOW_SEC = 60;
// 入参落库上限：正常工具参数远小于此；超了截断存摘要，防超长文本把表撑爆
const MAX_ARGS_CHARS = 4000;

/**
 * 稳定序列化：对象键递归排序后再 JSON.stringify。
 * 不做排序的话 {a:1,b:2} 和 {b:2,a:1} 会算出两个不同的哈希，近重复防护就会漏掉——
 * 而模型两次生成同一组参数时，键序恰恰是不保证的。
 */
function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

function hashArgs(args) {
  return crypto.createHash('sha256').update(canonicalJson(args || {})).digest('hex');
}

// 入参落库前裁剪：超长时不整条丢弃（那样审计就瞎了），只标记截断并留下开头
function truncateArgs(args) {
  const json = canonicalJson(args || {});
  if (json.length <= MAX_ARGS_CHARS) return args || {};
  return { _truncated: true, _preview: json.slice(0, MAX_ARGS_CHARS) };
}

/**
 * 近重复检查：最近 DEDUPE_WINDOW_SEC 秒内是否有同一人、同一工具、同一参数的成功调用。
 * @returns {Promise<boolean>} true = 是重复，调用方应拒绝执行
 */
async function findRecentDuplicate(supabase, { userId, tool, argsHash }) {
  if (userId == null) return false; // 匿名调用没有稳定主体，不做去重
  const since = new Date(Date.now() - DEDUPE_WINDOW_SEC * 1000).toISOString();
  const { data, error } = await supabase
    .from('agent_actions')
    .select('id')
    .eq('user_id', userId)
    .eq('tool', tool)
    .eq('args_hash', argsHash)
    .eq('status', 'ok')
    .gte('created_at', since)
    .limit(1);
  if (error) {
    // 去重查不了不该阻断正常操作——它是防手滑不是防攻击。但要留痕。
    console.error('[agentAudit] duplicate check failed:', error);
    return false;
  }
  return Array.isArray(data) && data.length > 0;
}

/**
 * 写前记账。成功返回行 id；**失败抛错**（调用方必须据此拒绝执行工具）。
 */
async function begin(supabase, { userId, role, tool, tier, args, argsHash, confirmed, source, ip }) {
  const { data, error } = await supabase
    .from('agent_actions')
    .insert([{
      user_id: userId ?? null,
      role: role || 'public',
      tool,
      tier,
      args: truncateArgs(args),
      args_hash: argsHash,
      status: 'pending',
      confirmed: confirmed === true,
      source: source || 'agent',
      ip: ip || null,
    }])
    .select('id')
    .single();
  if (error) {
    console.error('[agentAudit] begin failed:', error);
    throw new Error('Audit log unavailable');
  }
  return data.id;
}

/**
 * 写后回填。这里的失败【不】阻断——工具已经执行完了，再拒绝也收不回来；
 * 留下的 pending 行本身就是"执行过但结果未知"的信号，比谎报成功有用。
 */
async function complete(supabase, id, { ok, error: errMsg }) {
  try {
    const { error } = await supabase
      .from('agent_actions')
      .update({
        status: ok ? 'ok' : 'error',
        error: ok ? null : String(errMsg || '').slice(0, 500),
        completed_at: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) console.error('[agentAudit] complete failed:', error);
  } catch (err) {
    console.error('[agentAudit] complete threw:', err);
  }
}

module.exports = { begin, complete, findRecentDuplicate, hashArgs, canonicalJson, DEDUPE_WINDOW_SEC };
