// ── 企业认证人才池（W2-3）测试：src/routes/pools.js + entV1.js 只读池端点 ─────────
// 覆盖范围：
// 1. criteria zod schema：全可选、.strip() 丢未知键、tracks<=4 / min_level 1-3 /
//    min_tal_score 0-100 / regions<=10 的边界。
// 2. 纯函数：buildCertLevelMap（过期/最高级）、meetsCertCriteria（判定矩阵）、
//    matchesRegions（JS 子串匹配，大小写不敏感）。
// 3. HTTP 级：行级属主 404 防枚举（非属主与不存在同一响应）、candidates 过滤逻辑
//    （region 绝不进 .or()/.ilike DSL——直接断言 mock 调用记录里没有这两个方法）、
//    成员加入的证书校验与快照落库。
// 4. entV1 只读池端点：API key 归属过滤 + anti-enum 404。
//
// 为什么用 require.cache 预注入（照 tests/helpers/mockPayDeps.js 的手法）：
// pools.js / entV1.js 在【模块加载时】就 require 了 db/auth/apikeys，node:test 没有
// jest.mock，只能在 require 被测 router 之前把假模块塞进 require.cache，
// 让 Node 命中缓存、真实文件体（连数据库的代码）根本不执行。
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const express = require('express');
const request = require('supertest');
const { makeSupabase } = require('./helpers/supabaseChainMock');

// ── 可变状态：每个用例通过 setUser / setApiKeyUser / setDb 改写 ──────────────────
const authState = { user: null };   // JWT 登录态（/api/pools 用）
const keyState  = { userId: null }; // API key 身份（/api/v1/ent 用）
const dbState   = { client: makeSupabase({}).client };
let dbCalls = [];

function setUser(user) { authState.user = user; }
function setApiKeyUser(userId) { keyState.userId = userId; }
function setDb(tableResults) {
  const m = makeSupabase(tableResults);
  dbState.client = m.client;
  dbCalls = m.calls;
  return m.calls;
}

// require.cache 预注入：绝对路径作 key，与 router 内 require 的解析一致
function inject(relFromTest, exportsObj) {
  const abs = require.resolve(path.join(__dirname, relFromTest));
  require.cache[abs] = {
    id: abs, filename: abs, loaded: true, exports: exportsObj, children: [], paths: [],
  };
}
inject('../src/config/db', { getClient: () => dbState.client, initDB: () => dbState.client });
inject('../src/middleware/auth', {
  requireAuth(req, res, next) {
    if (!authState.user) return res.status(401).json({ error: 'Unauthorized: missing token' });
    req.user = authState.user;
    next();
  },
  requireRole: () => (req, res, next) => next(),
});
// entV1.js 从 ./apikeys 解构 requireApiKey；假版按 keyState 注入 req.apiKeyUserId
inject('../src/routes/apikeys', {
  requireApiKey(req, res, next) {
    if (!keyState.userId) return res.status(401).json({ error: 'Invalid or revoked API key.' });
    req.apiKeyUserId = keyState.userId;
    next();
  },
  router: express.Router(),
});

// 注入之后再加载被测 router（它们在加载时就捕获 db/auth/apikeys 引用）
const poolsRouter = require('../src/routes/pools');
const entV1Router = require('../src/routes/entV1');
const { criteriaSchema, buildCertLevelMap, meetsCertCriteria, matchesRegions } = poolsRouter;

// 复刻 src/app.js 的挂载方式（集成批会挂 /api/pools；/api/v1/ent 已在线上）
const app = express();
app.use(express.json());
app.use('/api/pools', poolsRouter);
app.use('/api/v1/ent', entV1Router);

const EMPLOYER = { userId: 42, email: 'emp@x.com', role: 'employer' };

// 便捷：从 dbCalls 里找某表某方法的调用（读 insert/update 的 payload 或断言过滤条件）
function findCall(calls, table, method, predicate) {
  return calls.find((c) => c.table === table && c.method === method && (!predicate || predicate(c)));
}

beforeEach(() => {
  setUser(EMPLOYER); // 默认已登录雇主；未登录用例显式 setUser(null)
  setApiKeyUser(null);
  setDb({});
});

// ═══════════════════════════ 1. criteria schema ═══════════════════════════════
describe('criteriaSchema（圈选条件校验）', () => {
  it('合法完整条件通过，未声明字段被 .strip() 静默丢弃', () => {
    const r = criteriaSchema.safeParse({
      tracks: ['plc', 'vision'], min_level: 2, min_tal_score: 60, regions: ['US', 'MX'],
      evil_extra: 'DROP TABLE', // 未声明字段
    });
    assert.equal(r.success, true);
    assert.deepEqual(r.data.tracks, ['plc', 'vision']);
    assert.equal('evil_extra' in r.data, false, '.strip() 应丢弃未声明字段');
  });

  it('空对象 {} 合法（全部条件可选）', () => {
    assert.equal(criteriaSchema.safeParse({}).success, true);
  });

  it('tracks 超过 4 个 → 拒绝', () => {
    const r = criteriaSchema.safeParse({ tracks: ['a', 'b', 'c', 'd', 'e'] });
    assert.equal(r.success, false);
  });

  it('track key 含非法字符（大写/符号）→ 拒绝', () => {
    assert.equal(criteriaSchema.safeParse({ tracks: ['PLC'] }).success, false);
    assert.equal(criteriaSchema.safeParse({ tracks: ['plc,or(x)'] }).success, false);
  });

  it('min_level 越界（0 / 4 / 小数）→ 拒绝', () => {
    assert.equal(criteriaSchema.safeParse({ min_level: 0 }).success, false);
    assert.equal(criteriaSchema.safeParse({ min_level: 4 }).success, false);
    assert.equal(criteriaSchema.safeParse({ min_level: 1.5 }).success, false);
  });

  it('min_tal_score 越界（-1 / 101）→ 拒绝', () => {
    assert.equal(criteriaSchema.safeParse({ min_tal_score: -1 }).success, false);
    assert.equal(criteriaSchema.safeParse({ min_tal_score: 101 }).success, false);
  });

  it('regions 超过 10 个 → 拒绝', () => {
    const r = criteriaSchema.safeParse({ regions: Array.from({ length: 11 }, (_, i) => `r${i}`) });
    assert.equal(r.success, false);
  });
});

// ═══════════════════════════ 2. 纯函数 ════════════════════════════════════════
describe('buildCertLevelMap（证书批量折叠）', () => {
  it('过滤过期证、每方向取最高级、NULL expires_at 视为长期有效', () => {
    const past   = new Date(Date.now() - 86400000).toISOString();
    const future = new Date(Date.now() + 86400000).toISOString();
    const map = buildCertLevelMap([
      { talent_id: 1, level: 1, expires_at: null,   cert_tracks: { track_key: 'plc' } },
      { talent_id: 1, level: 3, expires_at: future, cert_tracks: { track_key: 'plc' } },      // 同方向取最高
      { talent_id: 1, level: 2, expires_at: past,   cert_tracks: { track_key: 'vision' } },   // 过期不算
      { talent_id: 2, level: 2, expires_at: null,   cert_tracks: { track_key: 'robotics' } },
      { talent_id: 2, level: 1, expires_at: null,   cert_tracks: null },                       // 无方向脏数据忽略
    ]);
    assert.deepEqual(map.get(1), { plc: 3 });
    assert.deepEqual(map.get(2), { robotics: 2 });
  });
});

describe('meetsCertCriteria（证书门槛判定矩阵）', () => {
  it('指定 tracks + min_level：命中方向且等级达标 → 通过；等级不够 → 不通过', () => {
    const criteria = { tracks: ['plc'], min_level: 2 };
    assert.equal(meetsCertCriteria({ plc: 2 }, criteria), true);
    assert.equal(meetsCertCriteria({ plc: 1 }, criteria), false);
    assert.equal(meetsCertCriteria({ vision: 3 }, criteria), false, '方向不匹配即使高级也不通过');
    assert.equal(meetsCertCriteria({}, criteria), false, '无证不通过');
  });

  it('只指定 tracks（min_level 缺省 1）：持该方向任意有效证即可', () => {
    assert.equal(meetsCertCriteria({ plc: 1 }, { tracks: ['plc'] }), true);
  });

  it('只指定 min_level：任一方向达到该级即可', () => {
    assert.equal(meetsCertCriteria({ vision: 2 }, { min_level: 2 }), true);
    assert.equal(meetsCertCriteria({ vision: 1 }, { min_level: 2 }), false);
  });

  it('无证书条件：一律通过（含无证工程师）', () => {
    assert.equal(meetsCertCriteria({}, {}), true);
    assert.equal(meetsCertCriteria({}, { min_tal_score: 80 }), true);
  });
});

describe('matchesRegions（JS 子串匹配，绝不进 DSL）', () => {
  it('未设 regions → 一律通过；子串命中大小写不敏感；不命中 → false', () => {
    assert.equal(matchesRegions('US/CA/MX', undefined), true);
    assert.equal(matchesRegions('US/CA/MX', []), true);
    assert.equal(matchesRegions('United States (US)', ['us']), true);
    assert.equal(matchesRegions('Vietnam', ['US', 'MX']), false);
    assert.equal(matchesRegions(null, ['US']), false, 'region 为空的工程师不命中');
  });

  it('恶意 region 条件（含逗号/括号）只是普通子串，不会破坏任何查询', () => {
    // runAutoInvite 的 .or(region.ilike.%r%) 会被这种输入破坏；JS 子串匹配免疫
    assert.equal(matchesRegions('US/CA', ['x),or(id.gt.0']), false);
  });
});

// ═══════════════════════════ 3. /api/pools HTTP ═══════════════════════════════
describe('POST /api/pools（建池）', () => {
  it('未登录 → 401', async () => {
    setUser(null);
    const res = await request(app).post('/api/pools').send({ name: 'A 队' });
    assert.equal(res.status, 401);
  });

  it('建池成功：employer_id 取自登录态（不信任 body），criteria 落库', async () => {
    const calls = setDb({
      talent_pools: { data: { id: 7, name: 'A 队', criteria: { tracks: ['plc'] } }, error: null },
    });
    const res = await request(app).post('/api/pools')
      .send({ name: 'A 队', criteria: { tracks: ['plc'] }, employer_id: 999 }); // 伪造属主应被忽略
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    const ins = findCall(calls, 'talent_pools', 'insert');
    assert.ok(ins, '应有 insert 调用');
    assert.equal(ins.args[0][0].employer_id, 42, '归属必须来自 JWT，而非 body');
    assert.deepEqual(ins.args[0][0].criteria, { tracks: ['plc'] });
  });

  it('criteria 非法（min_level=9）→ 400，不落库', async () => {
    const calls = setDb({});
    const res = await request(app).post('/api/pools')
      .send({ name: 'A 队', criteria: { min_level: 9 } });
    assert.equal(res.status, 400);
    assert.equal(findCall(calls, 'talent_pools', 'insert'), undefined);
  });

  it('缺 name → 400', async () => {
    const res = await request(app).post('/api/pools').send({ criteria: {} });
    assert.equal(res.status, 400);
  });
});

describe('行级属主 404 防枚举（非属主与不存在同一响应）', () => {
  it('GET /api/pools/:id：池属于别人 → 404（与不存在完全同形）', async () => {
    setDb({ talent_pools: { data: { id: 7, employer_id: 99 }, error: null } }); // 别人的池
    const resOther = await request(app).get('/api/pools/7');
    assert.equal(resOther.status, 404);

    setDb({ talent_pools: { data: null, error: { code: 'PGRST116' } } }); // 不存在
    const resMissing = await request(app).get('/api/pools/7');
    assert.equal(resMissing.status, 404);
    assert.deepEqual(resOther.body, resMissing.body, '两种情况响应体必须一致，防枚举');
  });

  it('PUT /api/pools/:id：非属主 → 404，且不发生 update', async () => {
    const calls = setDb({ talent_pools: { data: { id: 7, employer_id: 99 }, error: null } });
    const res = await request(app).put('/api/pools/7').send({ name: '改名' });
    assert.equal(res.status, 404);
    assert.equal(findCall(calls, 'talent_pools', 'update'), undefined);
  });

  it('DELETE /api/pools/:id：非属主 → 404，且不发生 delete', async () => {
    const calls = setDb({ talent_pools: { data: { id: 7, employer_id: 99 }, error: null } });
    const res = await request(app).delete('/api/pools/7');
    assert.equal(res.status, 404);
    assert.equal(findCall(calls, 'talent_pools', 'delete'), undefined);
    assert.equal(findCall(calls, 'talent_pool_members', 'delete'), undefined);
  });

  it('GET /api/pools/:id/candidates：非属主 → 404，不触发 talents 扫描', async () => {
    const calls = setDb({ talent_pools: { data: { id: 7, employer_id: 99 }, error: null } });
    const res = await request(app).get('/api/pools/7/candidates');
    assert.equal(res.status, 404);
    assert.equal(findCall(calls, 'talents', 'select'), undefined);
  });
});

describe('GET /api/pools（我的池列表 + member_count）', () => {
  it('只查自己的池；member_count 一次 .in() 批量计数', async () => {
    const calls = setDb({
      talent_pools: { data: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }], error: null },
      talent_pool_members: { data: [{ pool_id: 1 }, { pool_id: 1 }, { pool_id: 2 }], error: null },
    });
    const res = await request(app).get('/api/pools');
    assert.equal(res.status, 200);
    assert.equal(res.body.data[0].member_count, 2);
    assert.equal(res.body.data[1].member_count, 1);
    const eq = findCall(calls, 'talent_pools', 'eq');
    assert.deepEqual(eq.args, ['employer_id', 42], '必须按登录用户过滤');
    const inCall = findCall(calls, 'talent_pool_members', 'in');
    assert.deepEqual(inCall.args, ['pool_id', [1, 2]], '成员计数必须批量 .in()，禁 N+1');
  });
});

describe('GET /api/pools/:id/candidates（criteria 过滤）', () => {
  // 预置：criteria = plc 方向 L2 起 + 最低分 60 + 地区含 US
  const POOL = {
    id: 7, employer_id: 42, name: 'A 队',
    criteria: { tracks: ['plc'], min_level: 2, min_tal_score: 60, regions: ['US'] },
  };
  const TALENTS = [
    { id: 1, name: 'Alice', region: 'United States (US)', tal_score: 90 }, // plc L2 → 应入选
    { id: 2, name: 'Binh',  region: 'Vietnam',            tal_score: 80 }, // region 不匹配 → 出局
    { id: 3, name: 'Carl',  region: 'US/CA',              tal_score: 70 }, // plc 仅 L1 → 出局
    { id: 4, name: 'Dana',  region: 'US',                 tal_score: 65 }, // 无证 → 出局
  ];
  const CERTS = [
    { talent_id: 1, level: 2, expires_at: null, cert_tracks: { track_key: 'plc' } },
    { talent_id: 2, level: 3, expires_at: null, cert_tracks: { track_key: 'plc' } },
    { talent_id: 3, level: 1, expires_at: null, cert_tracks: { track_key: 'plc' } },
  ];

  it('region JS 过滤 + 证书等级过滤 + certs 附带；min_tal_score 走 DB 侧 .gte', async () => {
    const calls = setDb({
      talent_pools: { data: POOL, error: null },
      talents: { data: TALENTS, error: null },
      talent_pool_members: { data: [], error: null },
      platform_certifications: { data: CERTS, error: null },
    });
    const res = await request(app).get('/api/pools/7/candidates');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].id, 1);
    assert.deepEqual(res.body.data[0].certs, [{ track_key: 'plc', level: 2 }]);
    // min_tal_score 是数字，允许走 DB 侧 .gte
    const gte = findCall(calls, 'talents', 'gte');
    assert.deepEqual(gte.args, ['tal_score', 60]);
    // 证书必须一次 .in() 批量拉（禁 N+1）
    const certIn = findCall(calls, 'platform_certifications', 'in');
    assert.ok(certIn, '证书过滤必须批量 .in()');
    assert.equal(findCall(calls, 'platform_certifications', 'eq', (c) => c.args[0] === 'revoked').args[1], false);
  });

  it('雇主可控 regions 绝不进 .or()/.ilike DSL（防注入红线）', async () => {
    const evilPool = { ...POOL, criteria: { ...POOL.criteria, regions: ['x),or(id.gt.0'] } };
    const calls = setDb({
      talent_pools: { data: evilPool, error: null },
      talents: { data: TALENTS, error: null },
      talent_pool_members: { data: [], error: null },
      platform_certifications: { data: CERTS, error: null },
    });
    const res = await request(app).get('/api/pools/7/candidates');
    assert.equal(res.status, 200);
    // 核心断言：整条链路对任何表都没有调用过 .or() / .ilike()
    assert.equal(calls.some((c) => c.method === 'or'), false, 'regions 不许拼进 .or()');
    assert.equal(calls.some((c) => c.method === 'ilike'), false, 'regions 不许拼进 .ilike()');
    // 恶意子串谁都不命中 → 空结果，而非注入放大
    assert.deepEqual(res.body.data, []);
  });

  it('已入池成员从候选里剔除', async () => {
    setDb({
      talent_pools: { data: POOL, error: null },
      talents: { data: TALENTS, error: null },
      talent_pool_members: { data: [{ talent_id: 1 }], error: null }, // Alice 已在池里
      platform_certifications: { data: CERTS, error: null },
    });
    const res = await request(app).get('/api/pools/7/candidates');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, [], '唯一合格者已入池 → 候选为空');
  });
});

describe('POST /api/pools/:id/members（手动加成员）', () => {
  const POOL = { id: 7, employer_id: 42, name: 'A 队', criteria: { tracks: ['plc'], min_level: 2 } };

  it('满足证书门槛 → 落库，快照记录 {tal_score, certs, added_reason:manual}', async () => {
    const calls = setDb({
      talent_pools: { data: POOL, error: null },
      talents: { data: { id: 5, tal_score: 77 }, error: null },
      platform_certifications: { data: [{ talent_id: 5, level: 2, expires_at: null, cert_tracks: { track_key: 'plc' } }], error: null },
      talent_pool_members: { data: null, error: null },
    });
    const res = await request(app).post('/api/pools/7/members').send({ talent_id: 5 });
    assert.equal(res.status, 200);
    const ins = findCall(calls, 'talent_pool_members', 'insert');
    assert.ok(ins, '应有成员 insert');
    const row = ins.args[0][0];
    assert.equal(row.pool_id, 7);
    assert.equal(row.talent_id, 5);
    assert.deepEqual(row.snapshot, {
      tal_score: 77,
      certs: [{ track_key: 'plc', level: 2 }],
      added_reason: 'manual',
    });
  });

  it('证书等级不达标（plc 仅 L1）→ 400，不落库', async () => {
    const calls = setDb({
      talent_pools: { data: POOL, error: null },
      talents: { data: { id: 5, tal_score: 77 }, error: null },
      platform_certifications: { data: [{ talent_id: 5, level: 1, expires_at: null, cert_tracks: { track_key: 'plc' } }], error: null },
    });
    const res = await request(app).post('/api/pools/7/members').send({ talent_id: 5 });
    assert.equal(res.status, 400);
    assert.equal(findCall(calls, 'talent_pool_members', 'insert'), undefined);
  });

  it('工程师不存在 → 404', async () => {
    setDb({
      talent_pools: { data: POOL, error: null },
      talents: { data: null, error: { code: 'PGRST116' } },
    });
    const res = await request(app).post('/api/pools/7/members').send({ talent_id: 12345 });
    assert.equal(res.status, 404);
  });

  it('talent_id 非法（负数/非数字）→ 400', async () => {
    setDb({ talent_pools: { data: POOL, error: null } });
    const res = await request(app).post('/api/pools/7/members').send({ talent_id: -1 });
    assert.equal(res.status, 400);
    const res2 = await request(app).post('/api/pools/7/members').send({ talent_id: 'abc' });
    assert.equal(res2.status, 400);
  });

  it('重复加入（唯一索引 23505）→ 幂等成功', async () => {
    setDb({
      talent_pools: { data: POOL, error: null },
      talents: { data: { id: 5, tal_score: 77 }, error: null },
      platform_certifications: { data: [{ talent_id: 5, level: 2, expires_at: null, cert_tracks: { track_key: 'plc' } }], error: null },
      talent_pool_members: { data: null, error: { code: '23505' } },
    });
    const res = await request(app).post('/api/pools/7/members').send({ talent_id: 5 });
    assert.equal(res.status, 200);
    assert.equal(res.body.idempotent, true);
  });
});

describe('DELETE /api/pools/:id/members/:talentId（移出成员）', () => {
  it('属主移出成员 → ok，delete 带 pool_id + talent_id 双条件', async () => {
    const calls = setDb({
      talent_pools: { data: { id: 7, employer_id: 42 }, error: null },
      talent_pool_members: { data: null, error: null },
    });
    const res = await request(app).delete('/api/pools/7/members/5');
    assert.equal(res.status, 200);
    assert.ok(findCall(calls, 'talent_pool_members', 'delete'));
    assert.ok(findCall(calls, 'talent_pool_members', 'eq', (c) => c.args[0] === 'pool_id' && c.args[1] === 7));
    assert.ok(findCall(calls, 'talent_pool_members', 'eq', (c) => c.args[0] === 'talent_id' && c.args[1] === 5));
  });
});

describe('GET /api/pools/:id（详情：成员走 PII 白名单批量 join）', () => {
  it('成员批量 .in() 取白名单字段并合并 snapshot', async () => {
    const calls = setDb({
      talent_pools: { data: { id: 7, employer_id: 42, name: 'A 队', criteria: {} }, error: null },
      talent_pool_members: { data: [{ talent_id: 5, snapshot: { added_reason: 'manual' }, added_at: '2026-07-24T00:00:00Z' }], error: null },
      talents: { data: [{ id: 5, name: 'Eve', tal_score: 88 }], error: null },
    });
    const res = await request(app).get('/api/pools/7');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.members.length, 1);
    assert.equal(res.body.data.members[0].talent.name, 'Eve');
    // 白名单红线：对 talents 的 select 里绝不能出现 PII 列
    const sel = findCall(calls, 'talents', 'select');
    assert.ok(sel);
    assert.doesNotMatch(sel.args[0], /contact|stripe_account_id|user_id|\*/, 'talents 查询不得包含 PII 列或 *');
    const inCall = findCall(calls, 'talents', 'in');
    assert.deepEqual(inCall.args, ['id', [5]], '成员档案必须批量 .in()，禁 N+1');
  });
});

// ═══════════════════════════ 4. entV1 只读池端点 ═══════════════════════════════
describe('entV1 GET /api/v1/ent/pools（企业 API 只读列表）', () => {
  it('无有效 API key → 401', async () => {
    const res = await request(app).get('/api/v1/ent/pools');
    assert.equal(res.status, 401);
  });

  it('按 apiKeyUserId 过滤，返回 member_count', async () => {
    setApiKeyUser(42);
    const calls = setDb({
      talent_pools: { data: [{ id: 1, name: 'A' }], error: null, count: 1 },
      talent_pool_members: { data: [{ pool_id: 1 }, { pool_id: 1 }], error: null },
    });
    const res = await request(app).get('/api/v1/ent/pools');
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 1);
    assert.equal(res.body.data[0].member_count, 2);
    const eq = findCall(calls, 'talent_pools', 'eq');
    assert.deepEqual(eq.args, ['employer_id', 42], '必须按 API key 绑定的企业过滤');
  });
});

describe('entV1 GET /api/v1/ent/pools/:id（anti-enum 404 + PII 白名单）', () => {
  it('池属于别的企业 → 404（与不存在同形，防枚举）', async () => {
    setApiKeyUser(42);
    setDb({ talent_pools: { data: { id: 7, employer_id: 99 }, error: null } });
    const resOther = await request(app).get('/api/v1/ent/pools/7');
    assert.equal(resOther.status, 404);

    setDb({ talent_pools: { data: null, error: { code: 'PGRST116' } } });
    const resMissing = await request(app).get('/api/v1/ent/pools/7');
    assert.equal(resMissing.status, 404);
    assert.deepEqual(resOther.body, resMissing.body);
  });

  it('属主取详情：成员 talent 数据只含白名单字段，且不回传 employer_id', async () => {
    setApiKeyUser(42);
    const calls = setDb({
      talent_pools: { data: { id: 7, employer_id: 42, name: 'A 队', criteria: {} }, error: null },
      talent_pool_members: { data: [{ talent_id: 5, snapshot: null, added_at: '2026-07-24T00:00:00Z' }], error: null },
      talents: { data: [{ id: 5, name: 'Eve' }], error: null },
    });
    const res = await request(app).get('/api/v1/ent/pools/7');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.members[0].talent.name, 'Eve');
    assert.equal('employer_id' in res.body.data, false, '不回传内部主键 employer_id');
    const sel = findCall(calls, 'talents', 'select');
    assert.doesNotMatch(sel.args[0], /contact|stripe_account_id|user_id|\*/, 'talents 查询不得包含 PII 列或 *');
  });
});
