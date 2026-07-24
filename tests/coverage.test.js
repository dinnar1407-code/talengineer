// ── 覆盖地图聚合端点测试（W2-1，src/routes/coverage.js）───────────────────────
// 覆盖两层：
// 1) buildCoverageSummary 纯函数：档位分桶（⚠️ 红线：tal_score NULL/0 必须进 'unrated'
//    绝不落 bronze）、region 归一（trim/空→'Other'）、认证有效性（过期滤除、NULL=长期）、
//    每人每方向只计一次（取最高级）、totals 汇总与地区降序排序。
// 2) HTTP 层（supertest + require.cache 预注入假 db，照 mockPayDeps 模式）：
//    响应形状 {status:'ok', data:{regions,totals}, generated_at}、revoked 在查询侧过滤、
//    5 分钟模块级缓存（第二次请求不再碰数据库）、数据库错误 → 500 通用文案。
// 为什么 mock：套件必须完全离线（无 DB/无网络）；假 supabase 用增强版 chainMock
// （路由里是直接 await 链，thenable 终结正好消费预置结果）。
// 注意用例顺序是有意安排的：缓存是模块级状态，"错误→成功→缓存命中"必须按此顺序跑。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const express = require('express');
const request = require('supertest');
const { makeSupabase } = require('./helpers/supabaseChainMock');

// ── require.cache 预注入：必须在 require 路由之前装好假 db（照 mockPayDeps 模式）──
const dbState = { client: makeSupabase({}).client, calls: [] };
function inject(relFromTest, exportsObj) {
  const abs = require.resolve(path.join(__dirname, relFromTest));
  require.cache[abs] = {
    id: abs, filename: abs, loaded: true, exports: exportsObj, children: [], paths: [],
  };
}
inject('../src/config/db', { getClient: () => dbState.client, initDB: () => dbState.client });

// 注入完成后才 require 被测路由（路由在模块顶部就 require 了 ../config/db）
const coverageRouter = require('../src/routes/coverage');
const { buildCoverageSummary } = coverageRouter;

// 每个 HTTP 用例用 setDb 换一套假数据（getClient 是请求期调用，换引用即生效）
function setDb(tableResults) {
  const m = makeSupabase(tableResults);
  dbState.client = m.client;
  dbState.calls = m.calls;
  return m.calls;
}

// 最小 express app：复刻集成批将在 src/app.js 做的挂载
function makeApp() {
  const app = express();
  app.use('/api/coverage', coverageRouter);
  return app;
}

// 固定日期：已过期 / 未过期（避免依赖真实当前时间的边界）
const EXPIRED = '2020-01-01T00:00:00Z';
const FUTURE = '2999-01-01T00:00:00Z';

describe('buildCoverageSummary 纯函数', () => {
  it('tal_score 为 NULL/0 → 计入 unrated，绝不落进 bronze（红线）', () => {
    const { regions } = buildCoverageSummary([
      { id: 1, region: 'US', tal_score: null, availability: 'busy' },
      { id: 2, region: 'US', tal_score: 0, availability: 'busy' },
    ], []);
    assert.equal(regions.length, 1);
    assert.equal(regions[0].tiers.unrated, 2);
    assert.equal(regions[0].tiers.bronze, 0); // NULL/0 若进 bronze 即公开页造假
  });

  it('真实正分走 tierFor 阈值：54→bronze / 55→silver / 70→gold / 85→platinum', () => {
    const { regions } = buildCoverageSummary([
      { id: 1, region: 'US', tal_score: 54 },
      { id: 2, region: 'US', tal_score: 55 },
      { id: 3, region: 'US', tal_score: 70 },
      { id: 4, region: 'US', tal_score: 85 },
    ], []);
    assert.deepEqual(regions[0].tiers, { platinum: 1, gold: 1, silver: 1, bronze: 1, unrated: 0 });
  });

  it('region 归一：前后空白 trim；NULL/纯空白 → Other', () => {
    const { regions } = buildCoverageSummary([
      { id: 1, region: '  US/CA/MX  ', tal_score: 90 },
      { id: 2, region: 'US/CA/MX', tal_score: 90 },
      { id: 3, region: null, tal_score: 90 },
      { id: 4, region: '   ', tal_score: 90 },
    ], []);
    const names = regions.map((r) => r.region).sort();
    assert.deepEqual(names, ['Other', 'US/CA/MX']);
    assert.equal(regions.find((r) => r.region === 'US/CA/MX').engineers, 2);
    assert.equal(regions.find((r) => r.region === 'Other').engineers, 2);
  });

  it('认证有效性：过期证滤除；expires_at NULL 长期有效；同人同方向多证只计 1 人取最高级', () => {
    const talents = [{ id: 1, region: 'US', tal_score: 90 }];
    const certs = [
      { talent_id: 1, level: 1, expires_at: null, cert_tracks: { track_key: 'plc' } },      // 长期有效 L1
      { talent_id: 1, level: 2, expires_at: FUTURE, cert_tracks: { track_key: 'plc' } },    // 未过期 L2（同方向取最高）
      { talent_id: 1, level: 3, expires_at: EXPIRED, cert_tracks: { track_key: 'plc' } },   // 已过期 L3 不算
      { talent_id: 1, level: 1, expires_at: EXPIRED, cert_tracks: { track_key: 'vision' } },// 该方向唯一一张证已过期 → 方向不出现
    ];
    const { regions, totals } = buildCoverageSummary(talents, certs);
    assert.equal(regions[0].certified, 1);
    // plc 只计 1 人、最高级 L2（过期的 L3 不得抬高 max_level）；vision 不出现
    assert.deepEqual(regions[0].tracks, { plc: { count: 1, max_level: 2 } });
    assert.deepEqual(totals.tracks, { plc: { count: 1, max_level: 2 } });
  });

  it('cert_tracks 为 null（连接缺失行）容忍跳过，不炸也不计数', () => {
    const { regions } = buildCoverageSummary(
      [{ id: 1, region: 'US', tal_score: 90 }],
      [{ talent_id: 1, level: 2, expires_at: null, cert_tracks: null }],
    );
    assert.equal(regions[0].certified, 0);
    assert.deepEqual(regions[0].tracks, {});
  });

  it('多地区聚合：totals 汇总正确、available 计数、regions 按工程师数降序', () => {
    const talents = [
      { id: 1, region: 'US', tal_score: 90, availability: 'available' },
      { id: 2, region: 'US', tal_score: null, availability: 'busy' },
      { id: 3, region: 'MX', tal_score: 60, availability: 'available' },
    ];
    const certs = [
      { talent_id: 1, level: 3, expires_at: null, cert_tracks: { track_key: 'robotics' } },
      { talent_id: 3, level: 1, expires_at: null, cert_tracks: { track_key: 'robotics' } },
    ];
    const { regions, totals } = buildCoverageSummary(talents, certs);
    assert.deepEqual(regions.map((r) => r.region), ['US', 'MX']); // 2 人的 US 排在 1 人的 MX 前
    assert.equal(totals.engineers, 3);
    assert.equal(totals.available, 2);
    assert.equal(totals.certified, 2);
    // totals 的方向汇总跨地区：robotics 共 2 人，最高级 L3
    assert.deepEqual(totals.tracks, { robotics: { count: 2, max_level: 3 } });
  });

  it('空输入 → regions 为空数组，totals 全 0（诚实空态，前端渲染 founding 文案）', () => {
    const { regions, totals } = buildCoverageSummary([], []);
    assert.deepEqual(regions, []);
    assert.deepEqual(totals, { engineers: 0, available: 0, certified: 0, tracks: {} });
  });
});

describe('GET /api/coverage/summary（HTTP 层，注意用例顺序依赖模块级缓存）', () => {
  // 先跑错误用例：此时缓存为空，数据库错误必须走到 500 分支（若先跑成功用例，
  // 缓存命中会把错误用例短路掉）。错误响应必须是通用文案，不泄内部细节。
  it('数据库错误 → 500 + 通用文案（不缓存错误结果）', async () => {
    setDb({ talents: { data: null, error: { message: 'boom', code: 'XX000' } } });
    const res = await request(makeApp()).get('/api/coverage/summary');
    assert.equal(res.status, 500);
    assert.equal(res.body.error, 'Something went wrong. Please try again.');
  });

  it('成功：返回 {status:ok, data:{regions,totals}, generated_at}，认证查询带 revoked=false', async () => {
    const calls = setDb({
      talents: { data: [{ id: 7, region: 'US', tal_score: null, availability: 'available' }], error: null },
      platform_certifications: {
        data: [{ talent_id: 7, level: 2, expires_at: null, cert_tracks: { track_key: 'plc' } }],
        error: null,
      },
    });
    const res = await request(makeApp()).get('/api/coverage/summary');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(res.body.generated_at);
    assert.equal(res.body.data.totals.engineers, 1);
    assert.equal(res.body.data.regions[0].tiers.unrated, 1); // 端到端红线复验：NULL 分进 unrated
    assert.deepEqual(res.body.data.regions[0].tracks, { plc: { count: 1, max_level: 2 } });
    // revoked 必须在查询侧过滤（吊销证绝不进入聚合）
    const revokedFilter = calls.find(
      (c) => c.table === 'platform_certifications' && c.method === 'eq'
        && c.args[0] === 'revoked' && c.args[1] === false,
    );
    assert.ok(revokedFilter, '认证查询必须带 .eq(revoked, false)');
    // 零 PII 断言：响应体里不得出现任何工程师个体字段
    const raw = JSON.stringify(res.body);
    assert.ok(!raw.includes('"name"') && !raw.includes('contact') && !raw.includes('user_id'));
  });

  it('5 分钟缓存：第二次请求命中缓存，返回同一 payload 且完全不碰数据库', async () => {
    // 换一套完全不同的假数据——若缓存生效，这套数据不应被查询也不应体现在响应里
    const calls = setDb({
      talents: { data: [{ id: 99, region: 'ZZ', tal_score: 90 }], error: null },
      platform_certifications: { data: [], error: null },
    });
    const res = await request(makeApp()).get('/api/coverage/summary');
    assert.equal(res.status, 200);
    // 仍是上一用例缓存的聚合结果（US / unrated=1），不是新预置的 ZZ
    assert.equal(res.body.data.regions[0].region, 'US');
    assert.equal(calls.length, 0, '缓存命中时不得发起任何数据库调用');
  });
});
