// ── Phase 4 闭环测试：prompts 版本化 + computeAiStats 矩阵 + runWeekly + aiops 路由 ──
// 覆盖四块（全部离线，不连库不调 Gemini）：
//   1) src/config/prompts.js 导出形状：版本号格式、系统提示 G2 红线文案、
//      周报提示必须含 JSON 模式触发咒语（aiService.callGemini 靠精确子串开 JSON 模式）；
//   2) computeAiStats 纯函数矩阵：空 / 单类 / 混合 / 未知枚举容忍（023 无 CHECK 约束，
//      'suggestion'/'refused' 等保留值与任意陌生值都不许 crash 周报）；
//   3) runWeekly：deps 注入假 supabase（chainMock）+ 假 callModel——成功路径落库形状、
//      Gemini 抛错/返回垃圾时 hypotheses=[] 但 stats 照存、取数失败向上抛；
//   4) aiops 路由 HTTP 层（supertest + require.cache 预注入，照 mockPayDeps 模式）：
//      run-weekly 鉴权三态（无 secret 503 fail-closed / 错 secret 401 / 对 secret 200）、
//      reports 分页列表、复核裁决（400/404/审计行）。
// 为什么预注入：aiops.js 在模块加载时 require db/adminAuth/aiAnalysisService，
// 必须先把假模块塞进 require.cache 再 require 路由，真实文件体才不会执行。
const path = require('path');
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const express = require('express');
const { makeSupabase } = require('./helpers/supabaseChainMock');

// 确保离线确定性：aiService.js 在模块加载时捕获 GEMINI_API_KEY——
// 先删掉，保证默认 callModel 路径永远走「无 key 抛错 → hypotheses=[]」而非真网络调用。
delete process.env.GEMINI_API_KEY;

// ── require.cache 预注入（照 tests/helpers/mockPayDeps.js 的 inject 手法）────────
function inject(relFromTest, exportsObj) {
  const abs = require.resolve(path.join(__dirname, relFromTest));
  require.cache[abs] = {
    id: abs, filename: abs, loaded: true, exports: exportsObj, children: [], paths: [],
  };
}

// 可替换的假 supabase：每个用例用 setDb 换一套按表预置的结果，calls 供断言链式调用
const dbState = { client: makeSupabase({}).client };
let dbCalls = [];
function setDb(tableResults) {
  const m = makeSupabase(tableResults);
  dbState.client = m.client;
  dbCalls = m.calls;
  return m.calls;
}

inject('../src/config/db', { getClient: () => dbState.client, initDB: () => dbState.client });
// requireAdmin 直通并挂身份（口令/JWT 校验不在本文件被测范围，reviewed_by 断言要用身份）
inject('../src/middleware/adminAuth', {
  requireAdmin: (req, res, next) => {
    req.adminEmail = 'admin@test.local';
    req.adminAuthMethod = 'jwt-2fa';
    next();
  },
});

// 注入完成后再 require 被测模块（顺序是负载承重的——先 require 就会命中真实文件）
const { AGENT_PROMPT_VERSION, buildSystemPrompt, buildWeeklyAnalysisPrompt } = require('../src/config/prompts');
const { computeAiStats, runWeekly } = require('../src/services/aiAnalysisService');
const aiopsRouter = require('../src/routes/aiops');

// 最小 express app：复刻 src/app.js 的挂载方式（json body + /api/aiops 前缀）
function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/aiops', aiopsRouter);
  return app;
}

// ── 1) prompts.js 导出形状 ──────────────────────────────────────────────────────
describe('prompts.js：G4 版本化单一来源的导出形状', () => {
  it('AGENT_PROMPT_VERSION 是 YYYY-MM-DD.N 格式的版本号', () => {
    assert.match(AGENT_PROMPT_VERSION, /^\d{4}-\d{2}-\d{2}\.\d+$/);
  });

  it('buildSystemPrompt 保留 G2 红线文案（agentService 搬入后行为零变化）', () => {
    const prompt = buildSystemPrompt({ role: 'public' });
    assert.match(prompt, /NO tools for money movement/);
    assert.match(prompt, /clicks the corresponding action in the platform UI/);
    assert.match(prompt, /role is: public/);
  });

  it('buildSystemPrompt：lang 与 memory 注入分支与原实现一致', () => {
    const prompt = buildSystemPrompt({ role: 'employer', lang: 'zh', memory: { stacks: ['Siemens'] } });
    assert.match(prompt, /Preferred reply language: zh/);
    assert.match(prompt, /Siemens/);
    // 无 lang / 空 memory 时不注入对应段落
    const bare = buildSystemPrompt({ role: 'employer', memory: {} });
    assert.equal(/Preferred reply language/.test(bare), false);
    assert.equal(/Known user profile/.test(bare), false);
  });

  it('buildWeeklyAnalysisPrompt 含 JSON 模式触发咒语 + 序列化后的 stats', () => {
    const stats = { total_events: 7, error_rate: 0.1429 };
    const prompt = buildWeeklyAnalysisPrompt(stats);
    // aiService.callGemini 靠这个精确子串开 responseMimeType=application/json
    assert.match(prompt, /Output EXACTLY this JSON structure/);
    assert.match(prompt, /"total_events":7/);
    // 人审纪律写进提示词：模型被明确告知产出只是建议
    assert.match(prompt, /human review/);
  });
});

// ── 2) computeAiStats 矩阵 ──────────────────────────────────────────────────────
describe('computeAiStats：ai_events 聚合纯函数', () => {
  it('空数组 → 全零统计（error_rate 不出 NaN）', () => {
    const stats = computeAiStats([]);
    assert.equal(stats.total_events, 0);
    assert.equal(stats.error_rate, 0);
    assert.deepEqual(stats.by_decision_type, {});
    assert.deepEqual(stats.top_tools, []);
  });

  it('非数组输入（null/undefined）容忍为全零', () => {
    assert.equal(computeAiStats(null).total_events, 0);
    assert.equal(computeAiStats(undefined).total_events, 0);
  });

  it('单类事件：3 条 intent_parse success', () => {
    const rows = Array.from({ length: 3 }, () => ({ decision_type: 'intent_parse', tool_called: null, outcome: 'success' }));
    const stats = computeAiStats(rows);
    assert.equal(stats.total_events, 3);
    assert.deepEqual(stats.by_decision_type, { intent_parse: 3 });
    assert.deepEqual(stats.by_outcome, { success: 3 });
    assert.equal(stats.error_rate, 0);
    assert.equal(stats.tool_calls.total, 0); // intent_parse 不进工具维度
  });

  it('混合事件：错误率与工具排行（按次数降序）', () => {
    const rows = [
      { decision_type: 'intent_parse', outcome: 'success' },
      { decision_type: 'tool_call', tool_called: 'get_rates', outcome: 'success' },
      { decision_type: 'tool_call', tool_called: 'get_rates', outcome: 'error' },
      { decision_type: 'tool_call', tool_called: 'search_engineers', outcome: 'success' },
      { decision_type: 'tool_call', tool_called: 'get_rates', outcome: 'success' },
      { decision_type: 'intent_parse', outcome: 'error' },
    ];
    const stats = computeAiStats(rows);
    assert.equal(stats.total_events, 6);
    assert.equal(stats.error_rate, Math.round((2 / 6) * 10000) / 10000);
    assert.equal(stats.tool_calls.total, 4);
    assert.equal(stats.tool_calls.errors, 1);
    assert.deepEqual(stats.top_tools, [
      { tool: 'get_rates', total: 3, errors: 1 },
      { tool: 'search_engineers', total: 1, errors: 0 },
    ]);
  });

  it('未知枚举容忍：保留值/任意陌生值/缺失字段/脏行都不 crash', () => {
    const rows = [
      { decision_type: 'suggestion', outcome: 'success' },   // 023 注释保留值，今天无代码写入
      { decision_type: 'escalation', outcome: 'refused' },   // 保留 outcome
      { decision_type: 'banana', outcome: 'weird' },         // 完全陌生的值：按字面计数
      { decision_type: 'tool_call', outcome: 'success' },    // tool_called 缺失 → 'unknown'
      {},                                                    // 全缺失 → unknown/unknown
      null,                                                  // 脏行：跳过
    ];
    const stats = computeAiStats(rows);
    assert.equal(stats.total_events, 5); // null 行被跳过
    assert.equal(stats.by_decision_type.suggestion, 1);
    assert.equal(stats.by_decision_type.banana, 1);
    assert.equal(stats.by_decision_type.unknown, 1);
    assert.equal(stats.by_outcome.refused, 1);
    assert.equal(stats.by_outcome.weird, 1);
    assert.deepEqual(stats.top_tools, [{ tool: 'unknown', total: 1, errors: 0 }]);
  });
});

// ── 3) runWeekly：deps 注入纯逻辑 ───────────────────────────────────────────────
describe('runWeekly：周度分析（假 supabase + 假 callModel）', () => {
  const eventRows = [
    { decision_type: 'intent_parse', tool_called: null, outcome: 'success', created_at: '2026-07-20T00:00:00Z' },
    { decision_type: 'tool_call', tool_called: 'get_rates', outcome: 'error', created_at: '2026-07-21T00:00:00Z' },
  ];

  it('成功路径：stats 聚合 + 假设白名单裁剪 + prompt_version/status 落库形状', async () => {
    const m = makeSupabase({
      ai_events: { data: eventRows, error: null },
      ai_improvement_reports: { data: { id: 9, status: 'draft' }, error: null },
    });
    const report = await runWeekly({
      supabase: m.client,
      // 模型返回 {hypotheses:[...]}，其中夹带多余键 evil——必须被白名单裁掉
      callModel: async (prompt) => {
        assert.match(prompt, /Output EXACTLY this JSON structure/); // 周报提示走版本化文件
        return JSON.stringify({
          hypotheses: [{ title: 't1', evidence: 'e1', proposed_change: 'p1', risk: 'r1', evil: 'x' }],
        });
      },
    });
    assert.deepEqual(report, { id: 9, status: 'draft' });

    const ins = m.calls.find((c) => c.table === 'ai_improvement_reports' && c.method === 'insert');
    const row = ins.args[0];
    assert.equal(row.prompt_version, AGENT_PROMPT_VERSION); // 版本可追溯
    assert.equal(row.status, 'draft');                      // 永远 draft 起步（人审闭环）
    assert.equal(row.stats.total_events, 2);
    assert.equal(row.stats.error_rate, 0.5);
    assert.deepEqual(row.hypotheses, [{ title: 't1', evidence: 'e1', proposed_change: 'p1', risk: 'r1' }]);
    assert.match(row.period_start, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(row.period_end, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('Gemini 抛错不炸：hypotheses=[] 且 stats 照存', async () => {
    const m = makeSupabase({
      ai_events: { data: eventRows, error: null },
      ai_improvement_reports: { data: { id: 10 }, error: null },
    });
    await runWeekly({
      supabase: m.client,
      callModel: async () => { throw new Error('GEMINI_API_KEY not configured'); },
    });
    const ins = m.calls.find((c) => c.table === 'ai_improvement_reports' && c.method === 'insert');
    assert.deepEqual(ins.args[0].hypotheses, []);
    assert.equal(ins.args[0].stats.total_events, 2); // 底账照存
  });

  it('Gemini 返回非 JSON 垃圾：同样降级为 hypotheses=[]', async () => {
    const m = makeSupabase({
      ai_events: { data: eventRows, error: null },
      ai_improvement_reports: { data: { id: 11 }, error: null },
    });
    await runWeekly({ supabase: m.client, callModel: async () => 'sorry I cannot do JSON today' });
    const ins = m.calls.find((c) => c.table === 'ai_improvement_reports' && c.method === 'insert');
    assert.deepEqual(ins.args[0].hypotheses, []);
  });

  it('ai_events 取数失败是真错误：向上抛（不出假的空报告）', async () => {
    const m = makeSupabase({
      ai_events: { data: null, error: { message: 'connection refused' } },
    });
    await assert.rejects(runWeekly({ supabase: m.client, callModel: async () => '{}' }));
  });
});

// ── 4) aiops 路由 HTTP 层 ───────────────────────────────────────────────────────
describe('POST /api/aiops/run-weekly：cron 鉴权三态', () => {
  const app = makeApp();
  let savedSecret;

  beforeEach(() => {
    savedSecret = process.env.AIOPS_CRON_SECRET;
    // 每用例干净的假库：ai_events 空 + 报告插入成功（走通路径要用）
    setDb({
      ai_events: { data: [], error: null },
      ai_improvement_reports: { data: { id: 1, status: 'draft' }, error: null },
    });
  });
  afterEach(() => {
    // 快照恢复：不污染同进程其它用例的环境
    if (savedSecret === undefined) delete process.env.AIOPS_CRON_SECRET;
    else process.env.AIOPS_CRON_SECRET = savedSecret;
  });

  it('AIOPS_CRON_SECRET 未配置 → 503 fail-closed（绝不裸奔）', async () => {
    delete process.env.AIOPS_CRON_SECRET;
    const res = await request(app).post('/api/aiops/run-weekly');
    assert.equal(res.status, 503);
  });

  it('缺 Authorization 头 → 401', async () => {
    process.env.AIOPS_CRON_SECRET = 'test-cron-secret';
    const res = await request(app).post('/api/aiops/run-weekly');
    assert.equal(res.status, 401);
  });

  it('错误 secret → 401（恒时比较不泄露长度）', async () => {
    process.env.AIOPS_CRON_SECRET = 'test-cron-secret';
    const res = await request(app)
      .post('/api/aiops/run-weekly')
      .set('Authorization', 'Bearer wrong-secret-of-different-length');
    assert.equal(res.status, 401);
  });

  it('正确 secret → 200，报告落库（GEMINI 无 key 时 hypotheses 空但 stats 照存）', async () => {
    process.env.AIOPS_CRON_SECRET = 'test-cron-secret';
    const res = await request(app)
      .post('/api/aiops/run-weekly')
      .set('Authorization', 'Bearer test-cron-secret');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.data.id, 1);
    // 落库确实发生（默认 callModel 无 GEMINI_API_KEY 会抛 → 降级路径，插入仍执行）
    const ins = dbCalls.find((c) => c.table === 'ai_improvement_reports' && c.method === 'insert');
    assert.deepEqual(ins.args[0].hypotheses, []);
    assert.equal(ins.args[0].prompt_version, AGENT_PROMPT_VERSION);
  });
});

describe('GET/PUT /api/aiops/reports：admin 人审看板接口', () => {
  const app = makeApp();

  it('GET /reports：默认分页（page=0, limit=12 → range 0..11）+ 响应形状', async () => {
    const rows = [{ id: 2, status: 'draft' }, { id: 1, status: 'reviewed' }];
    setDb({ ai_improvement_reports: { data: rows, error: null, count: 2 } });
    const res = await request(app).get('/api/aiops/reports');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.deepEqual(res.body.data.reports, rows);
    assert.equal(res.body.data.total, 2);
    const range = dbCalls.find((c) => c.table === 'ai_improvement_reports' && c.method === 'range');
    assert.deepEqual(range.args, [0, 11]); // clampPagination 默认口径
  });

  it('GET /reports?status=draft：合法 status 下发 eq 过滤；非法值宽松忽略', async () => {
    setDb({ ai_improvement_reports: { data: [], error: null, count: 0 } });
    await request(app).get('/api/aiops/reports?status=draft');
    assert.ok(dbCalls.find((c) => c.method === 'eq' && c.args[0] === 'status' && c.args[1] === 'draft'));

    setDb({ ai_improvement_reports: { data: [], error: null, count: 0 } });
    await request(app).get('/api/aiops/reports?status=hack');
    assert.equal(dbCalls.find((c) => c.method === 'eq'), undefined); // 非法值不进查询
  });

  it('PUT /reports/:id：裁决成功 → reviewed_by 记 admin 身份 + admin_audit_logs 审计行', async () => {
    setDb({
      ai_improvement_reports: { data: [{ id: 5, status: 'reviewed' }], error: null },
      admin_audit_logs: { data: null, error: null },
    });
    const res = await request(app).put('/api/aiops/reports/5').send({ status: 'reviewed' });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, 5);

    const upd = dbCalls.find((c) => c.table === 'ai_improvement_reports' && c.method === 'update');
    assert.equal(upd.args[0].status, 'reviewed');
    assert.equal(upd.args[0].reviewed_by, 'admin@test.local'); // requireAdmin 挂上的身份
    assert.ok(upd.args[0].reviewed_at);
    // 审计行（fire-and-forget，但 insert 调用在响应前已同步发生）
    const audit = dbCalls.find((c) => c.table === 'admin_audit_logs' && c.method === 'insert');
    assert.match(audit.args[0].action, /^PUT \/api\/aiops\/reports/);
    assert.deepEqual(audit.args[0].meta, { bodyKeys: ['status'] }); // 只记键名不记值
  });

  it('PUT /reports/:id：非法 status（含改回 draft）→ 400', async () => {
    setDb({ ai_improvement_reports: { data: [], error: null } });
    const res = await request(app).put('/api/aiops/reports/5').send({ status: 'draft' });
    assert.equal(res.status, 400);
  });

  it('PUT /reports/:id：非数字 id → 400；不存在的 id（0 行更新）→ 404', async () => {
    const bad = await request(app).put('/api/aiops/reports/abc').send({ status: 'reviewed' });
    assert.equal(bad.status, 400);

    setDb({
      ai_improvement_reports: { data: [], error: null },
      admin_audit_logs: { data: null, error: null },
    });
    const missing = await request(app).put('/api/aiops/reports/999').send({ status: 'reviewed' });
    assert.equal(missing.status, 404);
  });
});
