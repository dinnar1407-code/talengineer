// ── Matchmaker 外联时写的那条"待处理台账"修复测试 ────────────────────────────
// 病根：src/services/matchmakerService.js 往 `ledgers` 表 insert —— 生产库没有这张表，
// 于是这条 insert 自上线起每次都失败；失败只被 warn 掉、不挡外联邮件，所以谁都没发现。
// 真表名是 financial_ledgers，且它只有 employer_email / engineer_email 两个邮箱列，
// 没有 employer_id / engineer_id —— 那两个键就算表名改对了也会让 insert 报错。
//
// 另一处：total_amount 原来兜底成 `|| 1000` —— 预算栏解析不出数字时凭空造一个金额写进财务表。
// 现在改为跳过这条台账并告警，绝不发明数字。
//
// 框架：node:test + require.cache 预注入假模块（与 oauthIdentity.test.js 同一手法）。

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { makeSupabase } = require('./helpers/supabaseChainMock');

// ── 预注入假依赖（必须在 require(matchmakerService) 之前）─────────────────────
const dbState = { client: null };
const sentEmails = [];

function inject(relPath, exportsObj) {
  const abs = require.resolve(relPath);
  require.cache[abs] = { id: abs, filename: abs, loaded: true, exports: exportsObj, children: [], paths: [] };
}
inject('../src/config/db', { getClient: () => dbState.client });
inject('../src/services/aiService', { generateMatchEmail: async () => 'Hi there.\nGreat fit.' });
inject('../src/config/email', { sendOutreachEmail: async (to, subj) => { sentEmails.push({ to, subj }); } });
inject('../src/services/notificationService', { createNotification: () => {} });

const { runMatchmaker } = require('../src/services/matchmakerService'); // 注入之后再加载

const DEMAND = {
  id: 5, employer_id: 42, contact: 'boss@acme.com', title: 'Line A retrofit',
  description: 'Siemens PLC commissioning', role_required: 'PLC engineer',
  region: 'US', budget: '$12,000',
};
const ENGINEER = { id: 3, name: 'Ann', contact: 'eng@x.com', skills: 'Siemens PLC', region: 'US', verified_score: 90 };

// 用给定预算跑一轮撮合，返回 supabase 调用记录
async function runWith(budget) {
  sentEmails.length = 0;
  const { client, calls } = makeSupabase({
    demands: { data: { ...DEMAND, budget }, error: null },
    talents: { data: [ENGINEER], error: null },
    financial_ledgers: { data: null, error: null },
  });
  dbState.client = client;
  await runMatchmaker(5);
  return calls;
}

beforeEach(() => { dbState.client = null; });

describe('Matchmaker 台账写入', () => {

  it('写入目标是 financial_ledgers，绝不再写不存在的 `ledgers` 表', async () => {
    const calls = await runWith('$12,000');
    assert.ok(calls.some((c) => c.table === 'financial_ledgers' && c.method === 'insert'));
    assert.equal(calls.some((c) => c.table === 'ledgers'), false);
  });

  it('insert 只带 financial_ledgers 真实存在的列（不含 employer_id / engineer_id）', async () => {
    const calls = await runWith('$12,000');
    const ins = calls.find((c) => c.table === 'financial_ledgers' && c.method === 'insert');
    assert.deepEqual(ins.args[0], [{
      demand_id: 5,
      employer_email: 'boss@acme.com',
      engineer_email: 'eng@x.com',
      total_amount: 12000,
      status: 'pending',
    }]);
    // 显式再断一次：这两个键在生产表上不存在，混进去整条 insert 就会报错
    assert.equal('employer_id' in ins.args[0][0], false);
    assert.equal('engineer_id' in ins.args[0][0], false);
  });

  it('预算解析不出金额（"面议"）→ 跳过台账，绝不再兜底捏造 1000', async () => {
    const calls = await runWith('面议');
    assert.equal(calls.some((c) => c.table === 'financial_ledgers' && c.method === 'insert'), false);
  });

  it('预算为空 → 同样跳过（旧代码这里会写一条 1000 的假账）', async () => {
    const calls = await runWith(null);
    assert.equal(calls.some((c) => c.table === 'financial_ledgers' && c.method === 'insert'), false);
  });

  it('跳过台账不影响外联主流程：邮件照发', async () => {
    await runWith('TBD');
    assert.equal(sentEmails.length, 1);
    assert.equal(sentEmails[0].to, 'eng@x.com');
  });
});
