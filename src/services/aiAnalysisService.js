// ── Phase 4 自优化闭环：ai_events 周度聚合 + Gemini 改进假设起草（永远人审）───────
// 职责边界（Level 1 纪律，见 docs/ai/level1-charter.md）：
//   本服务只做「聚合统计 + 起草假设 + 落库 draft 报告」三件事。它不改任何配置、
//   不动任何提示词、不触碰任何业务表——改进假设永远以 status='draft' 进
//   ai_improvement_reports，由 admin 在人审看板里 reviewed/dismissed。
//   本仓库不存在任何自主改配置的代码路径。
//
// 设计要点（为什么这样写）：
//   - computeAiStats 是纯函数：输入 ai_events 行数组、输出统计对象，零 I/O——
//     这样测试矩阵（空/单类/混合/未知枚举）不需要任何 mock。
//   - 对未知枚举容忍：ai_events.decision_type/outcome 没有 DB CHECK 约束（023 只有注释），
//     'suggestion'/'escalation'/'refused' 等保留值今天没有代码写入，但未来可能出现——
//     统计时按字面值计数即可，绝不因为陌生值 crash 周报。
//   - runWeekly 的 Gemini 调用失败「不炸」：假设起草是锦上添花，聚合统计才是每周
//     必须留痕的底账——callModel 抛错时 hypotheses=[]，stats 照常落库。
//   - deps 注入（{supabase, callModel}）沿用 agentService.runAgentChat 的测试缝：
//     默认走 getClient() / aiService.callGemini，测试传假实现跑纯逻辑。
const { getClient } = require('../config/db');
const { callGemini } = require('./aiService');
const { AGENT_PROMPT_VERSION, buildWeeklyAnalysisPrompt } = require('../config/prompts');

const WEEKLY_WINDOW_DAYS = 7; // 分析窗口：近 7 天（与 GH Actions 周频一致）
const MAX_EVENT_ROWS = 10000; // 有界取数：防事件量暴涨拖垮单次请求（当前量级远小于此）
const MAX_HYPOTHESES = 10;    // 假设条数上限：防模型话痨污染人审看板

/**
 * 纯函数：把 ai_events 行数组聚合成统计对象。
 * 只依赖 decision_type / outcome / tool_called 三列；缺失/陌生值一律进 'unknown' 或按字面计数。
 * @param {Array<{decision_type?:string, tool_called?:string|null, outcome?:string}>} rows
 * @returns {{total_events:number, by_decision_type:Object, by_outcome:Object,
 *            error_rate:number, tool_calls:{total:number, errors:number, by_tool:Object},
 *            top_tools:Array<{tool:string, total:number, errors:number}>}}
 */
function computeAiStats(rows) {
  const stats = {
    total_events: 0,
    by_decision_type: {}, // 按 decision_type 计数（含未来的 suggestion/escalation 等陌生值）
    by_outcome: {},       // 按 outcome 计数（含未来的 refused 等陌生值）
    error_rate: 0,        // outcome==='error' 的占比（0~1，保留 4 位小数）
    tool_calls: { total: 0, errors: 0, by_tool: {} },
    top_tools: [],        // 按调用次数降序的工具排行（≤10）
  };
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!row || typeof row !== 'object') continue; // 脏行容忍：跳过而非 crash
    stats.total_events += 1;

    // decision_type / outcome：陌生枚举按字面值计数（不做白名单过滤——见文件头说明）
    const dt = typeof row.decision_type === 'string' && row.decision_type ? row.decision_type : 'unknown';
    stats.by_decision_type[dt] = (stats.by_decision_type[dt] || 0) + 1;
    const oc = typeof row.outcome === 'string' && row.outcome ? row.outcome : 'unknown';
    stats.by_outcome[oc] = (stats.by_outcome[oc] || 0) + 1;

    // 工具维度：只统计 tool_call 事件（intent_parse 的 tool_called 恒为 null）
    if (dt === 'tool_call') {
      const tool = typeof row.tool_called === 'string' && row.tool_called ? row.tool_called : 'unknown';
      stats.tool_calls.total += 1;
      const entry = stats.tool_calls.by_tool[tool] || { total: 0, errors: 0 };
      entry.total += 1;
      if (oc === 'error') {
        entry.errors += 1;
        stats.tool_calls.errors += 1;
      }
      stats.tool_calls.by_tool[tool] = entry;
    }
  }
  // 错误率 = error 事件 / 全部事件（分母为 0 时保持 0，避免 NaN 进 jsonb）
  const errorCount = stats.by_outcome.error || 0;
  stats.error_rate = stats.total_events > 0
    ? Math.round((errorCount / stats.total_events) * 10000) / 10000
    : 0;
  // 工具排行：调用次数降序，取前 10（同次数时按名称字典序保证输出稳定可断言）
  stats.top_tools = Object.entries(stats.tool_calls.by_tool)
    .map(([tool, v]) => ({ tool, total: v.total, errors: v.errors }))
    .sort((a, b) => b.total - a.total || a.tool.localeCompare(b.tool))
    .slice(0, 10);
  return stats;
}

/**
 * 解析模型返回的假设 JSON：容忍 markdown 围栏 / 顶层数组 / {hypotheses:[...]} 两种形状；
 * 逐条白名单裁剪成 {title, evidence, proposed_change, risk} 四字段（防模型夹带任意键进 jsonb）。
 * 解析失败向上抛，由 runWeekly 的 try/catch 归入「Gemini 失败 → hypotheses=[]」。
 */
function parseHypotheses(text) {
  const cleaned = String(text || '').replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.hypotheses) ? parsed.hypotheses : [];
  return list
    .filter((h) => h && typeof h === 'object')
    .slice(0, MAX_HYPOTHESES)
    .map((h) => ({
      title: String(h.title || ''),
      evidence: String(h.evidence || ''),
      proposed_change: String(h.proposed_change || ''),
      risk: String(h.risk || ''),
    }));
}

/**
 * 跑一次周度分析：取近 7 天 ai_events → 聚合 stats → Gemini 起草假设 → 落库 draft 报告。
 * @param {object} [deps] 测试注入点 { supabase?, callModel?, now? }——默认真实 DB / Gemini。
 * @returns {Promise<object>} 新建的 ai_improvement_reports 行
 */
async function runWeekly(deps = {}) {
  const supabase = 'supabase' in deps ? deps.supabase : getClient();
  const callModel = deps.callModel || callGemini;
  const now = deps.now ? new Date(deps.now) : new Date();
  const since = new Date(now.getTime() - WEEKLY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  // 取数：只拿聚合需要的三列 + created_at（idx_ai_events_created 已覆盖时间过滤）。
  // 取数失败是真错误（没有数据就没有报告），向上抛给路由层统一 500——
  // 与「Gemini 失败不炸」区别开：底账取不到时静默出一份空报告反而是造假。
  const { data: rows, error } = await supabase
    .from('ai_events')
    .select('decision_type, tool_called, outcome, created_at')
    .gte('created_at', since.toISOString())
    .limit(MAX_EVENT_ROWS);
  if (error) throw error;

  const stats = computeAiStats(rows || []);

  // Gemini 起草假设：失败（网络/无 key/返回非 JSON）一律降级为空数组，stats 照存
  let hypotheses = [];
  try {
    const text = await callModel(buildWeeklyAnalysisPrompt(stats), 0.4, 2000);
    hypotheses = parseHypotheses(text);
  } catch (err) {
    console.error('[aiAnalysis] hypothesis drafting failed (stats still stored):', err?.message || err);
    hypotheses = [];
  }

  // 落库：永远 draft 起步（人审闭环）；prompt_version 记当前提示词版本，事后可追溯
  const { data: report, error: insErr } = await supabase
    .from('ai_improvement_reports')
    .insert({
      period_start: since.toISOString().slice(0, 10),
      period_end: now.toISOString().slice(0, 10),
      stats,
      hypotheses,
      prompt_version: AGENT_PROMPT_VERSION,
      status: 'draft',
    })
    .select()
    .single();
  if (insErr) throw insErr;
  return report;
}

module.exports = { computeAiStats, runWeekly, WEEKLY_WINDOW_DAYS };
