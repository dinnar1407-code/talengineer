// ── 写工具的属主/状态门禁（Wave B+C）─────────────────────────────────────────
// 这些工具最危险的失效方式不是报错，而是**悄悄作用到别人的数据上**。所以断言分两类：
//   1) 越权时必须失败（不是"返回空"，是明确拒绝）
//   2) 正常路径下 where 条件确实带了 employer_id / status 过滤（读 mock 的 calls 日志）
// 第 2 类是防回归的关键：有人为了"修 bug"删掉一个 .eq()，第 1 类测试仍可能碰巧通过。
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-write-tools';

const registry = require('../src/tools/registry');
const { makeSupabase } = require('./helpers/supabaseChainMock');

const EMPLOYER = { userId: 42, email: 'boss@corp.com', role: 'employer' };
const ENGINEER = { userId: 7, email: 'eng@x.com', role: 'engineer' };

// agent_actions 的三次消费顺序：① 去重查询 ② begin 插入 ③ complete 回填
const AUDIT_OK = [
  { data: [], error: null },
  { data: { id: 1 }, error: null },
  { data: null, error: null },
];

// confirm 层工具在测试里要直接执行，得显式带 confirmed:true（真实路径由 /api/agent/confirm 提供）
const asConfirmed = (user, client) => ({ user, supabase: client, confirmed: true });

describe('update_demand_draft：只能改自己的、且还是 draft 的需求', () => {

  it('正常改：where 同时带 employer_id 与 status=draft', async () => {
    const { client, calls } = makeSupabase({
      agent_actions: AUDIT_OK,
      demands: { data: { id: 5, title: 'new', status: 'draft' }, error: null },
    });
    const res = await registry.call('update_demand_draft', { demand_id: 5, title: 'new' },
      { user: EMPLOYER, supabase: client });
    assert.equal(res.ok, true);

    const eqs = calls.filter((c) => c.table === 'demands' && c.method === 'eq');
    assert.ok(eqs.some((c) => c.args[0] === 'employer_id' && c.args[1] === 42),
      '少了 employer_id 过滤就能改别人的单');
    assert.ok(eqs.some((c) => c.args[0] === 'status' && c.args[1] === 'draft'),
      '少了 status=draft 过滤就能改已上架甚至已注资的活单');
  });

  it('单不存在/不是你的/已发布：明确拒绝，不静默成功', async () => {
    const { client } = makeSupabase({ agent_actions: AUDIT_OK, demands: { data: null, error: null } });
    const res = await registry.call('update_demand_draft', { demand_id: 5, title: 'x' },
      { user: EMPLOYER, supabase: client });
    assert.equal(res.ok, false);
    assert.match(res.error, /No editable draft/i);
  });

  it('一个可改字段都没给：拒绝（别拿空 update 假装成功）', async () => {
    const { client } = makeSupabase({ agent_actions: AUDIT_OK });
    const res = await registry.call('update_demand_draft', { demand_id: 5 },
      { user: EMPLOYER, supabase: client });
    assert.equal(res.ok, false);
  });
});

describe('publish_demand_draft：上架自己的草稿', () => {

  it('不是自己的草稿：拒绝', async () => {
    const { client } = makeSupabase({ agent_actions: AUDIT_OK, demands: { data: null, error: null } });
    const res = await registry.call('publish_demand_draft', { demand_id: 9 }, asConfirmed(EMPLOYER, client));
    assert.equal(res.ok, false);
    assert.match(res.error, /not yours|No draft found/i);
  });

  it('已经上架过：拒绝，并说清当前状态', async () => {
    const { client } = makeSupabase({
      agent_actions: AUDIT_OK,
      demands: { data: { id: 9, title: 'T', status: 'open', contact: 'a@b.c' }, error: null },
    });
    const res = await registry.call('publish_demand_draft', { demand_id: 9 }, asConfirmed(EMPLOYER, client));
    assert.equal(res.ok, false);
    assert.match(res.error, /already open/i);
  });

  it('contact 为空时补上雇主邮箱——否则上架后收不到任何投递通知', async () => {
    const { client, calls } = makeSupabase({
      agent_actions: AUDIT_OK,
      demands: [
        { data: { id: 9, title: 'T', status: 'draft', contact: null }, error: null }, // 查草稿
        { data: { id: 9, title: 'T', status: 'open' }, error: null },                 // 上架后回读
      ],
    });
    const res = await registry.call('publish_demand_draft', { demand_id: 9 }, asConfirmed(EMPLOYER, client));
    assert.equal(res.ok, true);

    const upd = calls.find((c) => c.table === 'demands' && c.method === 'update');
    assert.equal(upd.args[0].status, 'open');
    assert.equal(upd.args[0].contact, 'boss@corp.com');
  });

  it('未确认时不执行（confirm 层）', async () => {
    const { client } = makeSupabase({});
    const res = await registry.call('publish_demand_draft', { demand_id: 9 },
      { user: EMPLOYER, supabase: client }); // 刻意不带 confirmed
    assert.equal(res.needsConfirmation, true);
  });
});

describe('assign_engineer：三道门禁一道都不能少', () => {

  it('不是自己的项目：拒绝（防 IDOR）', async () => {
    const { client } = makeSupabase({
      agent_actions: AUDIT_OK,
      demands: { data: { id: 3, employer_id: 999, title: 'T' }, error: null },
    });
    const res = await registry.call('assign_engineer', { demand_id: 3, engineer_id: 5 },
      asConfirmed(EMPLOYER, client));
    assert.equal(res.ok, false);
    assert.match(res.error, /not yours|No project found/i);
  });

  it('该工程师没投过这个项目：拒绝（防把没投过的人设成收款方）', async () => {
    const { client } = makeSupabase({
      agent_actions: AUDIT_OK,
      demands: { data: { id: 3, employer_id: 42, title: 'T' }, error: null },
      demand_applications: { data: null, error: null },
    });
    const res = await registry.call('assign_engineer', { demand_id: 3, engineer_id: 5 },
      asConfirmed(EMPLOYER, client));
    assert.equal(res.ok, false);
    assert.match(res.error, /has not applied/i);
  });

  it('工程师无有效认证：拒绝（现场正式工作授权门禁）', async () => {
    const { client } = makeSupabase({
      agent_actions: AUDIT_OK,
      demands: { data: { id: 3, employer_id: 42, title: 'T', required_cert_track: null }, error: null },
      demand_applications: { data: { id: 11 }, error: null },
      platform_certifications: { data: [], error: null }, // 无证 → checkAssignEligibility 判不通过
    });
    const res = await registry.call('assign_engineer', { demand_id: 3, engineer_id: 5 },
      asConfirmed(EMPLOYER, client));
    assert.equal(res.ok, false);
    assert.match(res.error, /certification/i);
  });

  it('未确认时不执行（confirm 层，且带外发副作用）', async () => {
    const { client } = makeSupabase({});
    const res = await registry.call('assign_engineer', { demand_id: 3, engineer_id: 5 },
      { user: EMPLOYER, supabase: client });
    assert.equal(res.needsConfirmation, true);
    assert.ok(res.confirmToken);
  });
});

describe('update_my_profile：只动自己的档案', () => {

  it('查档案时按 ctx.user.userId 定位（G1）', async () => {
    const { client, calls } = makeSupabase({
      agent_actions: AUDIT_OK,
      talents: [
        { data: { id: 500 }, error: null },                       // 按 user_id 找到档案
        { data: { id: 500, bio: 'hi' }, error: null },            // update 回读
      ],
    });
    const res = await registry.call('update_my_profile', { bio: 'hi' }, { user: ENGINEER, supabase: client });
    assert.equal(res.ok, true);
    const scoped = calls.find((c) => c.table === 'talents' && c.method === 'eq'
      && c.args[0] === 'user_id' && c.args[1] === 7);
    assert.ok(scoped, '档案必须按已验证身份定位，绝不接受参数指定');
  });

  it('一个字段都没给：拒绝', async () => {
    const { client } = makeSupabase({ agent_actions: AUDIT_OK });
    const res = await registry.call('update_my_profile', {}, { user: ENGINEER, supabase: client });
    assert.equal(res.ok, false);
  });

  it('employer 调不了（角色门控）', async () => {
    const { client } = makeSupabase({});
    const res = await registry.call('update_my_profile', { bio: 'x' }, { user: EMPLOYER, supabase: client });
    assert.equal(res.ok, false);
    assert.match(res.error, /not available for role/);
  });
});

describe('get_platform_stats：admin 只读，且不报任何钱数', () => {

  it('返回计数，且不含营收字段', async () => {
    // 每张表的 count 查询都会消费一次结果；mock 数组用尽后重复最后一个
    const { client } = makeSupabase({
      users: { count: 8, error: null },
      talents: { count: 1, error: null },
      demands: { count: 0, error: null },
      demand_applications: { count: 0, error: null },
      disputes: { count: 0, error: null },
    });
    const res = await registry.call('get_platform_stats', {}, {
      user: { userId: 1, email: 'a@b.c', role: 'admin' }, supabase: client,
    });
    assert.equal(res.ok, true);
    // 数字纪律：/api/admin/stats 的营收算自一张不存在的表（ledgers），这里刻意不复刻
    const json = JSON.stringify(res.data);
    assert.equal(/revenue|earnings|gmv/i.test(json), false, '不得出现任何营收字段');
  });

  it('非 admin 调不了', async () => {
    const { client } = makeSupabase({});
    const res = await registry.call('get_platform_stats', {}, { user: EMPLOYER, supabase: client });
    assert.equal(res.ok, false);
    assert.match(res.error, /not available for role/);
  });
});
