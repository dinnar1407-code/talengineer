// ── AI-Native 工具注册表 + readTools 的单元测试 ──────────────────────────────
// 覆盖四类关键面（全部纯逻辑，注入假 supabase 客户端，不连库不连网）：
//   1. 静态 G1：所有已注册工具的参数 schema 任意层级都不存在 userId/email 类身份字段；
//   2. 角色门控：public 调不了 authed 工具、employer 调不了 admin 工具；
//   3. zod 参数校验：非法入参被拒（{ok:false}），未知键被静默剥离；
//   4. G1 行为面：get_my_projects 的查询确实显式 scope 到 ctx.user.userId
//      （用 mock 的 calls 日志断言过滤条件，防止以后有人误删 .eq()）。
//
// 注意：require('../src/tools/registry') 会连带注册 readTools/aiTools/writeTools
// 全部 10 个工具（registry.js 底部统一 require），所以这里能看到完整工具面。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const registry = require('../src/tools/registry');
const { makeSupabase } = require('./helpers/supabaseChainMock');
const TRAINING = require('../src/config/training');

const ROLES = ['public', 'employer', 'engineer', 'admin'];

// ── 1. 静态断言：G1 身份字段禁入参 ───────────────────────────────────────────
describe('工具注册表：G1 静态检查（参数 schema 无身份字段）', () => {
  // 收集所有角色可见工具的并集（= 全部已注册工具）
  const allTools = new Map();
  for (const r of ROLES) for (const t of registry.list(r)) allTools.set(t.name, t);

  it('至少注册了首批 10 个工具', () => {
    assert.ok(allTools.size >= 10, `期望 ≥10 个工具，实际 ${allTools.size}`);
  });

  it('任何工具的参数 schema 任意层级都不存在 userId/email 类身份字段', () => {
    // 归一化后包含 userid/email，或等于 contact/employerid/ownerid，都算身份字段。
    // 比 registry 的注册期正则更宽（substring 匹配），双保险。
    const isIdentityKey = (key) => {
      const norm = key.toLowerCase().replace(/[-_]/g, '');
      return norm.includes('userid') || norm.includes('email')
        || norm === 'contact' || norm === 'employerid' || norm === 'ownerid';
    };
    const violations = [];
    const scan = (schema, path) => {
      if (!schema || typeof schema !== 'object') return;
      for (const [key, def] of Object.entries(schema.properties || {})) {
        if (isIdentityKey(key)) violations.push([...path, key].join('.'));
        scan(def, [...path, key]);
        if (def && def.items) scan(def.items, [...path, key, '[]']);
      }
    };
    for (const t of allTools.values()) scan(t.parameters, [t.name]);
    assert.deepEqual(violations, [], `发现身份字段入参：${violations.join(', ')}`);
  });

  it('list() 只返回元数据，不暴露 handler/validator', () => {
    for (const t of registry.list('admin')) {
      assert.equal(t.handler, undefined, `${t.name} 不应暴露 handler`);
      assert.equal(t.validator, undefined, `${t.name} 不应暴露 validator`);
    }
  });

  it('角色可见性符合契约：public=4、employer=9、engineer=6、admin=8', () => {
    assert.equal(registry.list('public').length, 4);
    assert.equal(registry.list('employer').length, 9);
    assert.equal(registry.list('engineer').length, 6);
    assert.equal(registry.list('admin').length, 8);
  });
});

// ── 2. 角色门控 ──────────────────────────────────────────────────────────────
describe('工具注册表：角色门控', () => {
  it('public（未登录 ctx.user=null）调不了 authed 工具 get_my_projects', async () => {
    const { client } = makeSupabase({});
    const res = await registry.call('get_my_projects', {}, { user: null, supabase: client });
    assert.equal(res.ok, false);
    assert.match(res.error, /not available for role "public"/);
  });

  it('employer 调不了 admin-only 工具 get_admin_analytics', async () => {
    const res = await registry.call('get_admin_analytics', {}, {
      user: { userId: 42, email: 'a@b.c', role: 'employer' },
      supabase: { rpc: async () => ({ data: { should: 'never reach' }, error: null }) },
    });
    assert.equal(res.ok, false);
    assert.match(res.error, /not available for role "employer"/);
  });

  it('未知工具名：{ok:false} 而非抛异常', async () => {
    const res = await registry.call('no_such_tool', {}, {});
    assert.equal(res.ok, false);
    assert.match(res.error, /Unknown tool/);
  });

  it('admin 可调 get_admin_analytics（rpc 结果原样返回）', async () => {
    const res = await registry.call('get_admin_analytics', {}, {
      user: { userId: 1, email: 'x@y.z', role: 'admin' },
      supabase: { rpc: async (name) => {
        assert.equal(name, 'admin_analytics_summary');
        return { data: { total_users: 5 }, error: null };
      } },
    });
    assert.equal(res.ok, true);
    assert.equal(res.data.total_users, 5);
  });

  it('handler 抛错被包装成 {ok:false}，绝不向上抛裸异常', async () => {
    const res = await registry.call('get_admin_analytics', {}, {
      user: { userId: 1, email: 'x@y.z', role: 'admin' },
      supabase: { rpc: async () => { throw new Error('db exploded'); } },
    });
    assert.equal(res.ok, false);
    assert.equal(res.error, 'db exploded');
  });
});

// ── 3. zod 参数校验 ─────────────────────────────────────────────────────────
describe('工具注册表：zod 参数校验', () => {
  it('search_engineers：limit 超上限（99>10）被拒', async () => {
    const { client } = makeSupabase({});
    const res = await registry.call('search_engineers', { limit: 99 }, { user: null, supabase: client });
    assert.equal(res.ok, false);
    assert.match(res.error, /Invalid arguments: limit/);
  });

  it('search_engineers：maxRate 类型错误（字符串）被拒', async () => {
    const { client } = makeSupabase({});
    const res = await registry.call('search_engineers', { maxRate: 'abc' }, { user: null, supabase: client });
    assert.equal(res.ok, false);
    assert.match(res.error, /Invalid arguments: maxRate/);
  });

  it('get_milestone_status：缺必填 demandId 被拒（不会打到 handler）', async () => {
    const { client, calls } = makeSupabase({});
    const res = await registry.call('get_milestone_status', {}, {
      user: { userId: 1, email: 'x@y.z', role: 'admin' }, supabase: client,
    });
    assert.equal(res.ok, false);
    assert.match(res.error, /Invalid arguments: demandId/);
    assert.equal(calls.length, 0, '校验失败不应发起任何查询');
  });

  it('未知键被静默剥离（模型多传野字段不报错）', async () => {
    const { client } = makeSupabase({ talents: { data: [], error: null } });
    const res = await registry.call('search_engineers', { foo: 'bar', wild: 1 }, { user: null, supabase: client });
    assert.equal(res.ok, true);
    assert.deepEqual(res.data.engineers, []);
  });
});

// ── 4. G1 行为面：get_my_projects 只返回 ctx.user 自己的数据 ─────────────────
describe('get_my_projects：查询显式 scope 到 ctx.user.userId（G1）', () => {
  it('employer：demands 查询必须带 eq(employer_id, ctx.user.userId)', async () => {
    const myDemands = [{ id: 1, title: 'PLC 改造', status: 'open' }];
    const { client, calls } = makeSupabase({ demands: { data: myDemands, error: null } });

    const res = await registry.call('get_my_projects', {}, {
      user: { userId: 42, email: 'boss@corp.com', role: 'employer' }, supabase: client,
    });

    assert.equal(res.ok, true);
    assert.equal(res.data.role, 'employer');
    assert.deepEqual(res.data.projects, myDemands); // 结果=mock 里"该雇主自己的"数据
    const scoped = calls.find((c) => c.table === 'demands' && c.method === 'eq'
      && c.args[0] === 'employer_id' && c.args[1] === 42);
    assert.ok(scoped, 'demands 查询必须显式带 employer_id=ctx.user.userId 过滤');
  });

  it('engineer：两跳都 scope（talents.user_id=自己 → applications.engineer_id=自己的 talent.id + accepted）', async () => {
    const { client, calls } = makeSupabase({
      talents: { data: { id: 500 }, error: null },
      demand_applications: {
        data: [{ status: 'accepted', demands: { id: 9, title: '产线调试', status: 'open' } }],
        error: null,
      },
    });

    const res = await registry.call('get_my_projects', {}, {
      user: { userId: 8, email: 'eng@x.com', role: 'engineer' }, supabase: client,
    });

    assert.equal(res.ok, true);
    assert.deepEqual(res.data.projects, [{ id: 9, title: '产线调试', status: 'open' }]);
    // 第一跳：talents 按自己的 user_id 反查
    assert.ok(calls.some((c) => c.table === 'talents' && c.method === 'eq'
      && c.args[0] === 'user_id' && c.args[1] === 8), 'talents 必须按 ctx.user.userId 反查');
    // 第二跳：applications 按自己的 talent.id + status=accepted
    assert.ok(calls.some((c) => c.table === 'demand_applications' && c.method === 'eq'
      && c.args[0] === 'engineer_id' && c.args[1] === 500), 'applications 必须按自己的 talent.id 过滤');
    assert.ok(calls.some((c) => c.table === 'demand_applications' && c.method === 'eq'
      && c.args[0] === 'status' && c.args[1] === 'accepted'), '只应返回 accepted（被正式指派）的项目');
  });

  it('engineer 无 talent 档案：返回空列表，不再查 applications', async () => {
    const { client, calls } = makeSupabase({ talents: { data: null, error: null } });

    const res = await registry.call('get_my_projects', {}, {
      user: { userId: 8, email: 'eng@x.com', role: 'engineer' }, supabase: client,
    });

    assert.equal(res.ok, true);
    assert.deepEqual(res.data.projects, []);
    assert.ok(!calls.some((c) => c.table === 'demand_applications'), '无档案不应再查 applications');
  });
});

// ── 5. get_milestone_status：当事方校验（防 IDOR）────────────────────────────
describe('get_milestone_status：当事方校验', () => {
  it('非当事方：统一文案拒绝（不区分"不存在"与"无权限"，防 id 枚举）', async () => {
    // demand 存在但属于别人（employer_id=99），当前用户 42 也没有 talent 档案
    const { client } = makeSupabase({
      demands: { data: { id: 10, employer_id: 99 }, error: null },
      talents: { data: null, error: null },
    });

    const res = await registry.call('get_milestone_status', { demandId: 10 }, {
      user: { userId: 42, email: 'a@b.c', role: 'employer' }, supabase: client,
    });

    assert.equal(res.ok, false);
    assert.equal(res.error, 'Project not found or you are not a participant');
  });

  it('雇主当事方：返回该 demand 的里程碑（白名单字段查询）', async () => {
    const milestones = [{ id: 1, phase_name: '设计', percentage: 0.3, amount: 3000, status: 'funded', created_at: 't' }];
    const { client, calls } = makeSupabase({
      demands: { data: { id: 10, employer_id: 42 }, error: null },
      project_milestones: { data: milestones, error: null },
    });

    const res = await registry.call('get_milestone_status', { demandId: 10 }, {
      user: { userId: 42, email: 'a@b.c', role: 'employer' }, supabase: client,
    });

    assert.equal(res.ok, true);
    assert.deepEqual(res.data.milestones, milestones);
    // 里程碑查询必须按 demand_id 过滤，且 select 走白名单（不含 *）
    assert.ok(calls.some((c) => c.table === 'project_milestones' && c.method === 'eq'
      && c.args[0] === 'demand_id' && c.args[1] === 10));
    const sel = calls.find((c) => c.table === 'project_milestones' && c.method === 'select');
    assert.ok(sel && !String(sel.args[0]).includes('*'), '里程碑查询不得 select(*)');
  });
});

// ── 6. 公开读工具的取数行为 ──────────────────────────────────────────────────
describe('search_engineers / get_rates / get_certification_info', () => {
  it('search_engineers：maxRate 按文本费率解析过滤，解析不出数字的不排除', async () => {
    const rows = [
      { id: 1, name: 'A', rate: '$40/hr' },
      { id: 2, name: 'B', rate: '$80/hr' },  // 超上限 → 剔除
      { id: 3, name: 'C', rate: 'negotiable' }, // 解析不出 → 保留
    ];
    const { client, calls } = makeSupabase({ talents: { data: rows, error: null } });

    const res = await registry.call('search_engineers', { maxRate: 50 }, { user: null, supabase: client });

    assert.equal(res.ok, true);
    assert.deepEqual(res.data.engineers.map((e) => e.id), [1, 3]);
    // select 必须走白名单（不含 * 也不含 contact PII 列）
    const sel = calls.find((c) => c.table === 'talents' && c.method === 'select');
    assert.ok(sel && !String(sel.args[0]).includes('*'), '不得 select(*)');
    assert.ok(!String(sel.args[0]).includes('contact'), '白名单不得含 contact');
  });

  it('search_engineers：region/skill 走 ilike 模糊匹配', async () => {
    const { client, calls } = makeSupabase({ talents: { data: [], error: null } });
    await registry.call('search_engineers', { region: 'Mexico', skill: 'SCADA' }, { user: null, supabase: client });
    assert.ok(calls.some((c) => c.method === 'ilike' && c.args[0] === 'region' && c.args[1] === '%Mexico%'));
    assert.ok(calls.some((c) => c.method === 'ilike' && c.args[0] === 'skills' && c.args[1] === '%SCADA%'));
  });

  it('get_rates：按区域聚合 avg/median/min/max/top_skills（首次调用建缓存）', async () => {
    const rows = [
      { region: 'Mexico', rate: '$40/hr', skills: 'PLC, SCADA' },
      { region: 'Mexico', rate: '60', skills: 'Robotics' },
      { region: 'US', rate: '$100', skills: 'SCADA' },
    ];
    const { client } = makeSupabase({ talents: { data: rows, error: null } });

    const res = await registry.call('get_rates', {}, { user: null, supabase: client });

    assert.equal(res.ok, true);
    assert.equal(res.data.currency, 'USD');
    const mx = res.data.benchmarks.find((b) => b.region === 'Mexico');
    assert.deepEqual(
      { count: mx.count, avg: mx.avg, median: mx.median, min: mx.min, max: mx.max },
      { count: 2, avg: 50, median: 50, min: 40, max: 60 }
    );
    assert.equal(res.data.benchmarks[0].region, 'Mexico'); // 按样本量降序
  });

  it('get_rates：region/specialty 过滤在缓存之上生效（本次不再查库）', async () => {
    const { client, calls } = makeSupabase({}); // 不预置数据：命中缓存则不会查库
    const res = await registry.call('get_rates', { region: 'mex' }, { user: null, supabase: client });
    assert.equal(res.ok, true);
    assert.deepEqual(res.data.benchmarks.map((b) => b.region), ['Mexico']);
    assert.equal(calls.length, 0, '缓存未过期时不应查库');

    const bySkill = await registry.call('get_rates', { specialty: 'scada' }, { user: null, supabase: client });
    assert.deepEqual(bySkill.data.benchmarks.map((b) => b.region).sort(), ['Mexico', 'US']);
  });

  it('get_certification_info：tracks 来自 cert_tracks，规则数字与 src/config/training.js 一致', async () => {
    const tracks = [
      { track_key: 'plc', name_en: 'PLC', name_zh: 'PLC 编程', description: 'd1' },
      { track_key: 'robotics', name_en: 'Robotics', name_zh: '机器人', description: 'd2' },
    ];
    const { client } = makeSupabase({ cert_tracks: { data: tracks, error: null } });

    const res = await registry.call('get_certification_info', {}, { user: null, supabase: client });

    assert.equal(res.ok, true);
    assert.deepEqual(res.data.tracks, tracks);
    assert.equal(res.data.levels.length, 3);
    assert.deepEqual(res.data.rules.questions_per_exam, TRAINING.QUESTIONS_PER_EXAM);
    assert.equal(res.data.rules.exam_minutes, TRAINING.EXAM_MINUTES);
    assert.equal(res.data.rules.pass_score, TRAINING.PASS_SCORE);
    assert.equal(res.data.rules.retake_cooldown_days, TRAINING.RETAKE_COOLDOWN_DAYS);
    assert.equal(res.data.rules.max_level, TRAINING.MAX_LEVEL);
  });

  it('get_certification_info：未知 track 报人话错误（{ok:false}）', async () => {
    const { client } = makeSupabase({
      cert_tracks: { data: [{ track_key: 'plc', name_en: 'PLC', name_zh: 'PLC', description: '' }], error: null },
    });
    const res = await registry.call('get_certification_info', { track: 'nope' }, { user: null, supabase: client });
    assert.equal(res.ok, false);
    assert.match(res.error, /Unknown certification track "nope"/);
  });
});
