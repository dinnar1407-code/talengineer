// ── 资金台账数据源修复的 HTTP 级集成测试 ──────────────────────────────────────
// 被测两条路由，共同的病根都是"查了一张生产库里不存在 / 恒为空的表"：
//   1) GET /api/finance/ledger  —— 原来查 financial_ledgers（0 行死表），永远返回空数组；
//      改为查 project_milestones（真正的资金系统之实），作用域严格由服务端解析。
//   2) GET /api/admin/stats     —— 原来查 `ledgers`（生产库压根没这张表），营收恒为 0；
//      改为查 project_milestones，并按 demands.fee_pct 单需求费率覆盖计佣。
//
// 这里的断言对应的是真实事故面，别删：
//   - 雇主/工程师的作用域必须由 req.user 服务端解析，客户端传什么都不能扩大范围（越权读账本）；
//   - 工程师是两跳（users.id → talents.id → demands.assigned_engineer_id），少跳一步就查不到；
//   - 没有任何项目的账号必须拿到空数组而不是 500；
//   - founding 让利单（fee_pct=0.05）不能按标准 15% 计营收。
//
// 框架：node:test + supertest（非 Jest）。db/auth/adminAuth 用 require.cache 预注入假模块
// （helpers/mockPayDeps.js，与 paymentRoutes/disputeRoutes 两套测试同一手法）。

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');

const { installPayDeps } = require('./helpers/mockPayDeps');
const deps = installPayDeps();
const financeRouter = require('../src/routes/finance'); // 注入之后再加载
const adminRouter   = require('../src/routes/admin');
const { PLATFORM_FEE } = require('../src/config/fees');

const app = express();
app.use(express.json());
app.use('/api/finance', financeRouter);
app.use('/api/admin', adminRouter);

const EMPLOYER = { userId: 42, email: 'boss@acme.com', role: 'employer' };
const ENGINEER = { userId: 77, email: 'eng@x.com',     role: 'engineer' };

// 便捷：找某表某方法的调用（读过滤条件 / payload）
const findCall = (calls, table, method) => calls.find((c) => c.table === table && c.method === method);
const allCalls = (calls, table, method) => calls.filter((c) => c.table === table && c.method === method);

beforeEach(() => { deps.reset(); });

// ── GET /api/finance/ledger ───────────────────────────────────────────────────
describe('GET /api/finance/ledger —— 台账改由 project_milestones 供数', () => {

  it('未带 auth → 401', async () => {
    deps.setUser(null);
    const res = await request(app).get('/api/finance/ledger');
    assert.equal(res.status, 401);
  });

  it('雇主：作用域按 employer_id = req.user.userId 服务端解析，只取自己项目下的里程碑', async () => {
    const calls = deps.setDb({
      demands: { data: [{ id: 5 }, { id: 9 }], error: null },
      project_milestones: {
        data: [
          { id: 101, demand_id: 5, amount: 12000, status: 'funded', created_at: '2026-07-02T00:00:00Z',
            demands: { title: 'Line A retrofit', contact: 'boss@acme.com', talents: { contact: 'eng@x.com' } } },
        ],
        error: null,
      },
    });
    deps.setUser(EMPLOYER);

    const res = await request(app).get('/api/finance/ledger');
    assert.equal(res.status, 200);

    // 作用域来自 JWT 里的 userId，而不是任何客户端输入
    const scope = findCall(calls, 'demands', 'eq');
    assert.deepEqual(scope.args, ['employer_id', 42]);

    // 里程碑只在自己那两个 demand 里取
    const inCall = findCall(calls, 'project_milestones', 'in');
    assert.deepEqual(inCall.args, ['demand_id', [5, 9]]);

    // 映射成前端 pages/finance.jsx 期望的行结构（字段名不能改，前端零改动）
    assert.deepEqual(res.body.data, [{
      id: 101,
      demand_id: 5,
      project_title: 'Line A retrofit',
      employer_email: 'boss@acme.com',
      engineer_email: 'eng@x.com',
      total_amount: 12000,
      status: 'funded',
      created_at: '2026-07-02T00:00:00Z',
    }]);
  });

  it('雇主：客户端传 email / demand_id 一律无效，绝不能借此读到别人的账本', async () => {
    const calls = deps.setDb({
      demands: { data: [{ id: 5 }], error: null },
      project_milestones: { data: [], error: null },
    });
    deps.setUser(EMPLOYER);

    const res = await request(app)
      .get('/api/finance/ledger?email=victim@other.com&demand_id=999&employer_id=1');
    assert.equal(res.status, 200);

    // 只有一个 demands 过滤条件，且值是 JWT 的 userId
    const demandFilters = allCalls(calls, 'demands', 'eq');
    assert.equal(demandFilters.length, 1);
    assert.deepEqual(demandFilters[0].args, ['employer_id', 42]);
    // 里程碑范围仍只是自己的项目
    assert.deepEqual(findCall(calls, 'project_milestones', 'in').args, ['demand_id', [5]]);
    // 任何调用的参数里都不该出现被冒充的邮箱
    assert.equal(JSON.stringify(calls).includes('victim@other.com'), false);
  });

  it('工程师：两跳解析（users.id → talents.id → demands.assigned_engineer_id）', async () => {
    const calls = deps.setDb({
      talents: { data: { id: 3 }, error: null },       // user_id 77 对应的 talent 档案
      demands: { data: [{ id: 5 }], error: null },
      project_milestones: {
        data: [
          { id: 201, demand_id: 5, amount: 8000, status: 'released', created_at: '2026-07-05T00:00:00Z',
            demands: { title: 'PLC upgrade', contact: 'boss@acme.com', talents: { contact: 'eng@x.com' } } },
        ],
        error: null,
      },
    });
    deps.setUser(ENGINEER);

    const res = await request(app).get('/api/finance/ledger');
    assert.equal(res.status, 200);

    // 第一跳：talents.user_id = JWT userId
    assert.deepEqual(findCall(calls, 'talents', 'eq').args, ['user_id', 77]);
    // 第二跳：demands.assigned_engineer_id = talents.id（不是 users.id —— 少跳一步就永远查不到）
    assert.deepEqual(findCall(calls, 'demands', 'eq').args, ['assigned_engineer_id', 3]);
    assert.deepEqual(findCall(calls, 'project_milestones', 'in').args, ['demand_id', [5]]);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].engineer_email, 'eng@x.com');
  });

  it('工程师没有 talents 档案 → 空数组 200，不是 500，也不去查里程碑', async () => {
    const calls = deps.setDb({
      talents: { data: null, error: null },
      project_milestones: { data: [{ id: 999 }], error: null }, // 一旦被查到就说明作用域漏了
    });
    deps.setUser(ENGINEER);

    const res = await request(app).get('/api/finance/ledger');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, []);
    assert.equal(calls.some((c) => c.table === 'project_milestones'), false);
  });

  it('雇主一个项目都没有 → 空数组 200，且不查里程碑', async () => {
    const calls = deps.setDb({
      demands: { data: [], error: null },
      project_milestones: { data: [{ id: 999 }], error: null },
    });
    deps.setUser(EMPLOYER);

    const res = await request(app).get('/api/finance/ledger');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, []);
    assert.equal(calls.some((c) => c.table === 'project_milestones'), false);
  });

  it('admin 没有 talents 档案 → 空数组（admin 不是任何一笔资金的当事方，本接口不给全量）', async () => {
    deps.setDb({ talents: { data: null, error: null } });
    deps.setUser({ userId: 1, email: 'admin@t.com', role: 'admin' });

    const res = await request(app).get('/api/finance/ledger');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, []);
  });

  it('status 原样透传里程碑真实词汇，不做任何改写', async () => {
    deps.setDb({
      demands: { data: [{ id: 5 }], error: null },
      project_milestones: {
        data: ['locked', 'funded', 'releasing', 'completed', 'released', 'payment_failed', 'disputed']
          .map((s, i) => ({ id: i, demand_id: 5, amount: 1, status: s, created_at: 'x', demands: null })),
        error: null,
      },
    });
    deps.setUser(EMPLOYER);

    const res = await request(app).get('/api/finance/ledger');
    assert.deepEqual(
      res.body.data.map((r) => r.status),
      ['locked', 'funded', 'releasing', 'completed', 'released', 'payment_failed', 'disputed'],
    );
  });

  it('里程碑查询报错 → 500（不静默吞成空账本）', async () => {
    deps.setDb({
      demands: { data: [{ id: 5 }], error: null },
      project_milestones: { data: null, error: { message: 'db down' } },
    });
    deps.setUser(EMPLOYER);

    const res = await request(app).get('/api/finance/ledger');
    assert.equal(res.status, 500);
  });

  it('绝不再查那张 0 行死表 financial_ledgers', async () => {
    const calls = deps.setDb({
      demands: { data: [{ id: 5 }], error: null },
      project_milestones: { data: [], error: null },
    });
    deps.setUser(EMPLOYER);

    await request(app).get('/api/finance/ledger');
    assert.equal(calls.some((c) => c.table === 'financial_ledgers'), false);
  });
});

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
describe('GET /api/admin/stats —— 营收改由 project_milestones × 单需求费率算', () => {

  // 六条并发查询按 Promise.all 数组顺序消费预置结果：
  // users → demands → talents → project_milestones(最近10条) → project_milestones(全量已放款) → notifications
  function setStatsDb({ recent = [], released = [], count = 0 } = {}) {
    return deps.setDb({
      users:        { data: [], error: null, count: 8 },
      demands:      { data: [], error: null, count: 3 },
      talents:      { data: [], error: null, count: 1 },
      project_milestones: [
        { data: recent,   error: null, count },
        { data: released, error: null },
      ],
      notifications: { data: null, error: null, count: 5 },
    });
  }

  it('绝不再查生产库里不存在的 `ledgers` 表', async () => {
    const calls = setStatsDb();
    await request(app).get('/api/admin/stats');
    assert.equal(calls.some((c) => c.table === 'ledgers'), false);
  });

  it('营收：founding 让利单按自己的 fee_pct 计，其余回退全局 PLATFORM_FEE', async () => {
    setStatsDb({
      released: [
        { amount: 10000, demands: { fee_pct: 0.05 } }, // founding 5%
        { amount: 20000, demands: { fee_pct: null } }, // 无覆盖 → 全局费率
      ],
    });

    const res = await request(app).get('/api/admin/stats');
    assert.equal(res.status, 200);
    // 与路由内 reduce 完全相同的运算顺序，避免浮点比较误差
    assert.equal(res.body.revenue, 10000 * 0.05 + 20000 * PLATFORM_FEE);
    // 关键回归：绝不能把让利单也按 15% 计（那样会虚报 1000）
    assert.notEqual(res.body.revenue, (10000 + 20000) * PLATFORM_FEE);
  });

  it('营收：fee_pct 非法（负数/≥1/非数字）一律回退全局费率，不接受脏数据', async () => {
    setStatsDb({
      released: [
        { amount: 1000, demands: { fee_pct: -0.5 } },
        { amount: 1000, demands: { fee_pct: 1.5 } },
        { amount: 1000, demands: { fee_pct: 'abc' } },
        { amount: 1000, demands: null },
      ],
    });

    const res = await request(app).get('/api/admin/stats');
    assert.equal(res.body.revenue, 4 * (1000 * PLATFORM_FEE));
  });

  it('营收只统计已放款里程碑：查询下发 status=released，且不受最近10条列表的 limit 影响', async () => {
    const calls = setStatsDb({ released: [{ amount: 100, demands: { fee_pct: 0 } }] });
    await request(app).get('/api/admin/stats');

    // 全量营收查询带了 status=released 过滤
    const statusFilter = allCalls(calls, 'project_milestones', 'eq')
      .find((c) => c.args[0] === 'status' && c.args[1] === 'released');
    assert.ok(statusFilter, '营收查询必须下发 status=released 过滤');

    // 两条独立查询：最近列表有 limit(10)，营收查询没有（否则营收会悄悄变成"最近10条的营收"）
    const limits = allCalls(calls, 'project_milestones', 'limit');
    assert.equal(limits.length, 1);
    assert.deepEqual(limits[0].args, [10]);
  });

  it('响应外形不变：counts.ledgers / recent.ledgers 键名保留，行字段用 total_amount', async () => {
    setStatsDb({
      count: 7,
      recent: [{ id: 11, demand_id: 5, amount: 3000, status: 'funded', created_at: '2026-07-01T00:00:00Z' }],
    });

    const res = await request(app).get('/api/admin/stats');
    assert.equal(res.body.counts.ledgers, 7);
    // pages/admin.jsx 读的是 total_amount（里程碑表列名是 amount，须映射）
    assert.deepEqual(res.body.recent.ledgers, [{
      id: 11, demand_id: 5, total_amount: 3000, status: 'funded', created_at: '2026-07-01T00:00:00Z',
    }]);
  });

  it('营收查询失败 → 营收为 0 但如实记日志（不再像旧 `ledgers` 那样静默）', async () => {
    deps.setDb({
      users:        { data: [], error: null, count: 8 },
      demands:      { data: [], error: null, count: 3 },
      talents:      { data: [], error: null, count: 1 },
      project_milestones: [
        { data: [], error: null, count: 0 },
        { data: null, error: { message: 'boom' } },
      ],
      notifications: { data: null, error: null, count: 5 },
    });

    const origErr = console.error;
    const logged = [];
    console.error = (...a) => logged.push(a.join(' '));
    try {
      const res = await request(app).get('/api/admin/stats');
      assert.equal(res.status, 200);
      assert.equal(res.body.revenue, 0);
      assert.ok(logged.some((l) => l.includes('revenue query failed')), '查询失败必须留下日志');
    } finally {
      console.error = origErr;
    }
  });
});
