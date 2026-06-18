// ── 越权防护核心：assertDemandParticipant 的单元测试 ─────────────────────────
// 这是刚修的 IDOR（水平越权）防护核心，最该测。被测函数纯靠传入的 supabase 客户端
// 做判定，所以我们用手写 mock 喂预设数据，覆盖每一条判定分支。
//
// node:test 是 Node 内置测试框架（v18+ 稳定），用 `node --test` 运行，无需安装任何库。
// describe/it 组织用例，assert 来自内置 node:assert/strict（断言不通过即抛错→用例失败）。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { assertDemandParticipant } = require('../src/middleware/ownership');
const { createSupabaseMock } = require('./helpers/supabaseMock');

describe('assertDemandParticipant（demand 当事方判定 / IDOR 防护）', () => {

  it('demand 不存在时：allowed=false 且 demand=null（让调用方自行决定 404/403）', async () => {
    // demands 表查不到（data=null + 有 error），模拟 .single() 找不到行的情形。
    const { client } = createSupabaseMock({
      demands: { data: null, error: { code: 'PGRST116', message: 'not found' } },
    });

    const res = await assertDemandParticipant(client, 999, { userId: 1, role: 'employer' });

    assert.equal(res.allowed, false);
    assert.equal(res.demand, null);
  });

  it('雇主当事方：demand.employer_id === user.userId → 放行', async () => {
    const { client } = createSupabaseMock({
      demands: { data: { id: 10, employer_id: 42 }, error: null },
    });

    const res = await assertDemandParticipant(client, 10, { userId: 42, role: 'employer' });

    assert.equal(res.allowed, true);
    assert.deepEqual(res.demand, { id: 10, employer_id: 42 });
  });

  it('admin 角色：即使不是雇主也直接放行（平台处理纠纷/客服需要）', async () => {
    // employer_id 故意设为别人（99），但 admin 仍应放行。
    const { client } = createSupabaseMock({
      demands: { data: { id: 10, employer_id: 99 }, error: null },
    });

    const res = await assertDemandParticipant(client, 10, { userId: 7, role: 'admin' });

    assert.equal(res.allowed, true);
    assert.equal(res.demand.id, 10);
  });

  it('工程师参与方：user_id→talents.id→demand_applications 命中 → 放行', async () => {
    // demands 命中但 employer_id 不是该用户；talents 反查到 talent.id=500；
    // demand_applications 命中一条申请记录 → 应判为参与方。
    const { client } = createSupabaseMock({
      demands: { data: { id: 10, employer_id: 99 }, error: null },
      talents: { data: { id: 500 }, error: null },
      demand_applications: { data: { id: 7001 }, error: null },
    });

    const res = await assertDemandParticipant(client, 10, { userId: 8, role: 'engineer' });

    assert.equal(res.allowed, true);
  });

  it('非当事方（既非雇主、又没 talent 档案）：allowed=false', async () => {
    // 纯雇主类用户但不是本单雇主：talents 反查为 null → 直接判否，不再查 applications。
    const { client, calls } = createSupabaseMock({
      demands: { data: { id: 10, employer_id: 99 }, error: null },
      talents: { data: null, error: null },
    });

    const res = await assertDemandParticipant(client, 10, { userId: 8, role: 'employer' });

    assert.equal(res.allowed, false);
    assert.equal(res.demand.id, 10); // demand 仍然带回，供调用方使用
    // 既然 talent 都没有，就不该再去查 demand_applications 表（短路优化的验证）。
    assert.ok(!calls.some(c => c.table === 'demand_applications'),
      '没有 talent 档案时不应再查 demand_applications');
  });

  it('工程师有 talent 档案，但对该 demand 没有任何申请：allowed=false', async () => {
    const { client } = createSupabaseMock({
      demands: { data: { id: 10, employer_id: 99 }, error: null },
      talents: { data: { id: 500 }, error: null },
      demand_applications: { data: null, error: null }, // 没申请记录
    });

    const res = await assertDemandParticipant(client, 10, { userId: 8, role: 'engineer' });

    assert.equal(res.allowed, false);
  });

  it('requireAssigned=true：会额外加 status="accepted" 过滤；仅已指派工程师算当事方', async () => {
    // 验证“强归属”模式确实把 status='accepted' 作为额外过滤条件下发给查询。
    const { client, calls } = createSupabaseMock({
      demands: { data: { id: 10, employer_id: 99 }, error: null },
      talents: { data: { id: 500 }, error: null },
      demand_applications: { data: { id: 7001 }, error: null }, // 已指派
    });

    const res = await assertDemandParticipant(
      client, 10, { userId: 8, role: 'engineer' }, { requireAssigned: true }
    );

    assert.equal(res.allowed, true);
    // 断言确实带了 .eq('status', 'accepted') 这个过滤条件（防止以后误删该约束）。
    const statusFilter = calls.find(
      c => c.method === 'eq' && c.args && c.args[0] === 'status' && c.args[1] === 'accepted'
    );
    assert.ok(statusFilter, "requireAssigned=true 时应下发 status='accepted' 过滤条件");
  });

  it('requireAssigned=false（默认）：不应下发 status 过滤（申请过即可）', async () => {
    const { client, calls } = createSupabaseMock({
      demands: { data: { id: 10, employer_id: 99 }, error: null },
      talents: { data: { id: 500 }, error: null },
      demand_applications: { data: { id: 7001 }, error: null },
    });

    await assertDemandParticipant(client, 10, { userId: 8, role: 'engineer' }); // 默认 false

    const statusFilter = calls.find(c => c.method === 'eq' && c.args && c.args[0] === 'status');
    assert.equal(statusFilter, undefined, '默认模式不应限制 application 的 status');
  });

  it('边界：user 为 undefined 不应崩溃（可选链兜底），判为非当事方', async () => {
    // 安全相关函数遇到异常输入应“fail-closed”：不放行、也不抛异常导致 500。
    const { client } = createSupabaseMock({
      demands: { data: { id: 10, employer_id: 99 }, error: null },
      talents: { data: null, error: null },
    });

    const res = await assertDemandParticipant(client, 10, undefined);

    assert.equal(res.allowed, false);
  });
});
