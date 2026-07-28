// ── 撮合 Pipeline 看板：路由与 agent 工具共用同一份实现 ──────────────────────
// 这个文件存在的理由只有一个：list/create/update 抽取成 services/pipelineService.js
// 之后，必须证明【两条路径的行为真的是同一份】，尤其是
//   1) STAGES 白名单（分叉后 agent 那条路能写进前端不认识的 stage，看板凭空多一列）
//   2) 部分更新语义（"body 里没这个键" 必须等于 "别碰这一列"）
// 第 2 条是最容易悄悄坏掉的：只想改 stage 的一次调用，会把 note / next_action 一起
// 抹成 null，不报错、不掉行，只是安静地删掉人工撮合攒了几周的跟进记录。
// 所以这里不只断言"结果对"，还直接断言【发给数据库的 patch 里到底有哪些键】——
// 而且两条路径打的是【同一个 mock】，parity 是测出来的，不是声明出来的。
//
// 另外覆盖 admin 工具的两道门：角色门控 + registry 的第二因子门（adm2fa）。
// 后者是 2026-07-27 刚修的漏洞，新加的 admin 工具必须自动继承它，这里是证据。
//
// 依赖注入方式：node:test 的每个测试文件是独立进程，所以直接改 require.cache 打桩
//（与 tests/projectMessaging.test.js 同源），必须在 require 被测模块之前完成。

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-pipeline-board';

const dbState = { client: null };
const dbPath = require.resolve('../src/config/db');
require.cache[dbPath] = {
  id: dbPath, filename: dbPath, loaded: true, exports: { getClient: () => dbState.client },
};

const { makeSupabase } = require('./helpers/supabaseChainMock');
const {
  STAGES, PATCHABLE_FIELDS, PipelineError, buildUpdatePatch,
} = require('../src/services/pipelineService');
const registry = require('../src/tools/registry');
const pipelineRouter = require('../src/routes/pipeline');

const app = express();
app.use(express.json());
app.use('/api/pipeline', pipelineRouter);

// ── 身份 ─────────────────────────────────────────────────────────────────────
// 路由侧：requireAdmin 要 role=admin 且 adm2fa=true（middleware/adminAuth.js）。
// 工具侧：registry.call 要的是同一条杠。两边故意用同一个载荷，跑的就是同一种身份。
const ADMIN = { userId: 1, email: 'admin@talengineer.us', role: 'admin', adm2fa: true };
const ADMIN_NO_2FA = { userId: 1, email: 'admin@talengineer.us', role: 'admin' }; // 普通登录签出的形状
const adminHeader = () => `Bearer ${jwt.sign(ADMIN, process.env.JWT_SECRET, { expiresIn: '1h' })}`;

// agent_actions 的三次消费顺序：① 去重查询 ② begin 插入 ③ complete 回填
const AUDIT_OK = [
  { data: [], error: null },
  { data: { id: 1 }, error: null },
  { data: null, error: null },
];

// 看板里已经躺着的一条线索：note / next_action 都已经填过——正是"部分更新"要保护的东西
const SEED = {
  id: 7, line: 'cn', company: 'Acme Robotics', contact: 'Zhang', stage: 'contacted',
  demand_id: null, note: 'X', next_action: 'Y', next_action_at: null,
};

function makeBoard(rows = { data: SEED, error: null }) {
  return makeSupabase({ matchmaking_pipeline: rows, agent_actions: AUDIT_OK });
}

const adminCtx = (client, user = ADMIN) => ({ user, supabase: client });

// 发给数据库的 patch / insert 载荷（只看看板表，别把审计表的 update 混进来）
const boardCalls = (calls) => calls.filter((c) => c.table === 'matchmaking_pipeline');
const payloadOf = (calls, method) => {
  const call = boardCalls(calls).find((c) => c.method === method);
  // 找不到就当场报清楚：调用方全都是"这次一定写了库"的断言，静默回 undefined 只会让
  // 失败信息变成看不懂的 "Cannot read properties of undefined"（真实原因往往是请求
  // 压根没被放行、在到达服务层之前就 4xx 了）。
  assert.ok(call, `看板表上没有 ${method} 调用——请求可能根本没跑到服务层`);
  return call.args[0];
};
// 比较两条路径的 patch 时要剔掉 updated_at：它是 new Date()，两次调用必然不同
const withoutTimestamp = (patch) => { const { updated_at, ...rest } = patch; return rest; };

beforeEach(() => { dbState.client = null; });

// ════════════════════════════════════════════════════════════════════════════
// 1. 部分更新语义 —— 本次改动最容易写坏的一处
// ════════════════════════════════════════════════════════════════════════════
describe('部分更新：没传的字段绝不能被写进 patch（两条路径同一份实现）', () => {

  it('工具：只传 { id, stage } → patch 里根本没有 note / next_action 这两个键', async () => {
    const { client, calls } = makeBoard();
    const res = await registry.call('update_pipeline_lead', { id: 7, stage: 'interested' }, adminCtx(client));

    assert.equal(res.ok, true);
    const patch = payloadOf(calls, 'update');
    assert.equal('note' in patch, false, 'note 没传就不该出现在 patch 里（出现=会被抹成 null）');
    assert.equal('next_action' in patch, false);
    assert.equal('next_action_at' in patch, false);
    assert.equal('demand_id' in patch, false);
    assert.deepEqual(Object.keys(patch).sort(), ['stage', 'updated_at']);
  });

  it('路由：只传 { stage } → 同样只有 stage + updated_at', async () => {
    const { client, calls } = makeBoard();
    dbState.client = client;
    const res = await request(app).put('/api/pipeline/7')
      .set('Authorization', adminHeader()).send({ stage: 'interested' });

    assert.equal(res.status, 200);
    const patch = payloadOf(calls, 'update');
    assert.equal('note' in patch, false);
    assert.equal('next_action' in patch, false);
    assert.deepEqual(Object.keys(patch).sort(), ['stage', 'updated_at']);
  });

  it('反面：字段仍然可以被【故意】清空（空串 → NULL），否则这层保护就成了"改不动"', async () => {
    // 工具侧只能用空串表达清空（schema 里没有 null 这个类型，见 writeTools 注释）
    const t = makeBoard();
    await registry.call('update_pipeline_lead',
      { id: 7, note: '', next_action: '', next_action_at: '', demand_id: '' }, adminCtx(t.client));
    assert.deepEqual(withoutTimestamp(payloadOf(t.calls, 'update')),
      { note: null, next_action: null, next_action_at: null, demand_id: null });

    // 路由侧两种写法都算清空：显式 null（HTTP JSON 的自然表达）与空串
    const r = makeBoard();
    dbState.client = r.client;
    await request(app).put('/api/pipeline/7').set('Authorization', adminHeader())
      .send({ note: null, next_action: '', demand_id: null });
    assert.deepEqual(withoutTimestamp(payloadOf(r.calls, 'update')),
      { note: null, next_action: null, demand_id: null });
  });

  it('两种意图可以出现在同一次调用里：清空 note 的同时不碰 next_action', async () => {
    const { client, calls } = makeBoard();
    await registry.call('update_pipeline_lead', { id: 7, note: '', stage: 'lost' }, adminCtx(client));
    const patch = payloadOf(calls, 'update');
    assert.equal(patch.note, null, 'note 显式清空');
    assert.equal('next_action' in patch, false, 'next_action 没提到，就必须原样保留');
    assert.equal(patch.stage, 'lost');
  });

  it('updated_at 每次都会被顶上去（两条路径都是）', async () => {
    const t = makeBoard();
    await registry.call('update_pipeline_lead', { id: 7, note: 'n' }, adminCtx(t.client));
    assert.match(payloadOf(t.calls, 'update').updated_at, /^\d{4}-\d{2}-\d{2}T/);

    const r = makeBoard();
    dbState.client = r.client;
    await request(app).put('/api/pipeline/7').set('Authorization', adminHeader()).send({ note: 'n' });
    assert.match(payloadOf(r.calls, 'update').updated_at, /^\d{4}-\d{2}-\d{2}T/);
  });

  it('服务层直测：键不存在 / 值是 undefined，两种形状都不进 patch', () => {
    // zod 对缺省的 optional 字段不会造键（v4 实测），但判定不该建立在验证库的当前行为上：
    // 真变成 { note: undefined }，`key in fields` 那种写法会把 note 一路带进 patch 变成 null。
    assert.deepEqual(withoutTimestamp(buildUpdatePatch({ stage: 'lost' })), { stage: 'lost' });
    assert.deepEqual(withoutTimestamp(buildUpdatePatch({ stage: 'lost', note: undefined })), { stage: 'lost' });
    assert.deepEqual(withoutTimestamp(buildUpdatePatch({})), {});
  });

  it('工具：一个可改字段都没给 → 人话报错，且一次数据库写入都不发生', async () => {
    const { client, calls } = makeBoard();
    const res = await registry.call('update_pipeline_lead', { id: 7 }, adminCtx(client));
    assert.equal(res.ok, false);
    assert.match(res.error, /Tell me what to change/i);
    assert.equal(boardCalls(calls).length, 0, '空更新不该碰看板表');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 2. stage 白名单：两条路径都必须挡住非法阶段
// ════════════════════════════════════════════════════════════════════════════
describe('STAGES 白名单：路由与工具同一份来源', () => {

  it('路由：非法 stage → 400 Invalid stage，且没有发出任何 UPDATE', async () => {
    const { client, calls } = makeBoard();
    dbState.client = client;
    const res = await request(app).put('/api/pipeline/7')
      .set('Authorization', adminHeader()).send({ stage: 'signd', note: 'oops' });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'Invalid stage' });
    assert.equal(boardCalls(calls).some((c) => c.method === 'update'), false,
      '校验失败必须发生在写入之前');
  });

  it('工具：非法 stage 被 schema 的 enum 挡在调用之前（连库都不碰）', async () => {
    const { client, calls } = makeBoard();
    const res = await registry.call('update_pipeline_lead', { id: 7, stage: 'signd' }, adminCtx(client));
    assert.equal(res.ok, false);
    assert.match(res.error, /Invalid arguments: stage/);
    assert.equal(calls.length, 0, '参数校验失败不该发起任何查询（含审计）');
  });

  it('服务层的白名单校验本身仍然是活的（schema 那层将来放宽也挡得住）', () => {
    // 上一条走的是 zod/enum，测不到服务层。这条直接打服务层，保证它不是死代码——
    // 两层是纵深防御，任何一层被绕过另一层都还在。
    assert.throws(() => buildUpdatePatch({ stage: 'signd' }), (err) => {
      assert.ok(err instanceof PipelineError);
      assert.equal(err.code, 'invalid_stage');
      assert.equal(/^invalid stage$/i.test(err.message), false, 'message 要给用户/模型看，不能是状态码词');
      return true;
    });
  });

  it('工具 schema 的 enum 就是服务层的 STAGES（同一个数组，不可能漂移）', () => {
    const tool = registry.list('admin').find((t) => t.name === 'update_pipeline_lead');
    assert.deepEqual(tool.parameters.properties.stage.enum, STAGES);
    const listTool = registry.list('admin').find((t) => t.name === 'list_pipeline_leads');
    assert.deepEqual(listTool.parameters.properties.stage.enum, STAGES);
  });

  it('每个合法 stage 都真的能写进去（白名单不是摆设）', async () => {
    for (const stage of STAGES) {
      const { client, calls } = makeBoard();
      const res = await registry.call('update_pipeline_lead', { id: 7, stage }, adminCtx(client));
      assert.equal(res.ok, true, `${stage} 应被接受`);
      assert.equal(payloadOf(calls, 'update').stage, stage);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 3. demand_id：可清空 / 必须正整数
// ════════════════════════════════════════════════════════════════════════════
describe('demand_id：清空与合法性（两条路径同款）', () => {

  it('路由：非正整数 → 400 Invalid demand_id（"abc" / 0 / 2.5）', async () => {
    for (const bad of ['abc', 0, 2.5]) {
      const { client, calls } = makeBoard();
      dbState.client = client;
      const res = await request(app).put('/api/pipeline/7')
        .set('Authorization', adminHeader()).send({ demand_id: bad });
      assert.equal(res.status, 400, `demand_id=${bad} 应被拒`);
      assert.deepEqual(res.body, { error: 'Invalid demand_id' });
      assert.equal(boardCalls(calls).some((c) => c.method === 'update'), false);
    }
  });

  it('路由：数字字符串按数字落库（"5" → 5），与重构前一致', async () => {
    const { client, calls } = makeBoard();
    dbState.client = client;
    await request(app).put('/api/pipeline/7').set('Authorization', adminHeader()).send({ demand_id: '5' });
    assert.equal(payloadOf(calls, 'update').demand_id, 5);
  });

  it('工具："abc" 走到服务层被拒，回的是人话（不是 "Invalid demand_id"）', async () => {
    const { client } = makeBoard();
    const res = await registry.call('update_pipeline_lead', { id: 7, demand_id: 'abc' }, adminCtx(client));
    assert.equal(res.ok, false);
    assert.match(res.error, /positive whole number/i);
  });

  // 非法 demand_id 一律落不到库里，但【挡在哪一层】不一样，这里如实分开断言：
  //   0 / -3  是合法整数 → 过得了 zod 的 integer 分支 → 由服务层拒，回人话文案；
  //   2.5     既不是整数也不是字符串 → zod 两个分支都不收，压根到不了服务层。
  // 之所以不靠 schema 的 minimum 兜住 0/-3：demand_id 的 union 必须把 string 排在前面
  // （模型只看得到 union 的第一项，见 writeTools.js 那里的注释），minimum 挂在 string
  // 分支上没有意义。少一道 schema 约束，多一句更像人话的错误——净赚。
  for (const [bad, expected] of [[0, /positive whole number/i], [-3, /positive whole number/i],
    [2.5, /Invalid arguments: demand_id/]]) {
    it(`工具：${bad} 被拒且不发起 UPDATE`, async () => {
      const { client, calls } = makeBoard();
      const res = await registry.call('update_pipeline_lead', { id: 7, demand_id: bad }, adminCtx(client));
      assert.equal(res.ok, false);
      assert.match(res.error, expected);
      assert.equal(calls.some((c) => c.op === 'update'), false, '非法值不该发起 UPDATE');
    });
  }

  // 回归绊线：模型看到的 demand_id 必须是 string 类型，否则它发不出 '' 来解除关联，
  // 而且 maxLength 挂在 integer 上会让 Gemini 整个请求 400（打挂 admin 每一轮对话）。
  it('模型侧 schema：demand_id 降级后是 string，且不带数值约束', () => {
    const { toGeminiSchema } = require('../src/services/agentService');
    const upd = registry.list('admin').find((t) => t.name === 'update_pipeline_lead');
    const p = toGeminiSchema(upd.parameters).properties.demand_id;
    assert.equal(p.type, 'string', 'union 第一项必须是 string（toGeminiSchema 只取第一项）');
    assert.equal(p.minimum, undefined, 'string 上不该有 minimum');
    assert.equal(p.maximum, undefined, 'string 上不该有 maximum');
  });

  it('工具：正整数正常关联', async () => {
    const { client, calls } = makeBoard();
    const res = await registry.call('update_pipeline_lead', { id: 7, demand_id: 12 }, adminCtx(client));
    assert.equal(res.ok, true);
    assert.equal(payloadOf(calls, 'update').demand_id, 12);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. 路由 / 工具 parity —— 抽 pipelineService 的全部意义
// ════════════════════════════════════════════════════════════════════════════
describe('路由/工具 parity：同一个 mock 上打出完全相同的数据库调用', () => {

  it('list：同样的 select / order / limit / stage 过滤，一模一样', async () => {
    const r = makeBoard({ data: [SEED], error: null });
    dbState.client = r.client;
    const routeRes = await request(app).get('/api/pipeline?stage=contacted').set('Authorization', adminHeader());
    // 先确认路由这次真的跑通了：不加这条的话，一个 401 会让 calls 变成空数组，
    // 报出来的是一个看不懂的"两边不相等"，而不是"请求根本没被放行"。
    assert.equal(routeRes.status, 200);

    const t = makeBoard({ data: [SEED], error: null });
    const toolRes = await registry.call('list_pipeline_leads', { stage: 'contacted' }, adminCtx(t.client));
    assert.equal(toolRes.ok, true);

    assert.deepEqual(boardCalls(t.calls), boardCalls(r.calls));
    // 顺带钉死取数口径本身（limit 200 / updated_at 倒序）
    assert.ok(boardCalls(r.calls).some((c) => c.method === 'limit' && c.args[0] === 200));
    assert.ok(boardCalls(r.calls).some((c) => c.method === 'order' && c.args[0] === 'updated_at'
      && c.args[1].ascending === false));
    assert.ok(boardCalls(r.calls).some((c) => c.method === 'eq' && c.args[0] === 'stage' && c.args[1] === 'contacted'));
  });

  it('create：同样的 insert 载荷（含 line 归一化与 stage 强制 lead）', async () => {
    const body = { company: '  Acme Robotics  ', line: 'us', contact: 'Zhang', note: 'met at fair' };

    const r = makeBoard();
    dbState.client = r.client;
    const routeRes = await request(app).post('/api/pipeline').set('Authorization', adminHeader()).send(body);
    assert.equal(routeRes.status, 200);

    const t = makeBoard();
    const toolRes = await registry.call('create_pipeline_lead', {
      company: body.company, line: body.line, contact_person: body.contact, note: body.note,
    }, adminCtx(t.client));
    assert.equal(toolRes.ok, true);

    assert.deepEqual(payloadOf(t.calls, 'insert'), payloadOf(r.calls, 'insert'));
    assert.deepEqual(payloadOf(r.calls, 'insert'), {
      company: 'Acme Robotics', line: 'us', contact: 'Zhang', note: 'met at fair', stage: 'lead',
    });
  });

  it('update：把所有可改字段都传满 → 两边算出的 patch 逐字相同', async () => {
    const fields = {
      stage: 'quoted', note: 'sent quote', next_action: 'follow up',
      next_action_at: '2026-08-01T09:00:00Z', demand_id: 12,
    };

    const r = makeBoard();
    dbState.client = r.client;
    const routeRes = await request(app).put('/api/pipeline/7').set('Authorization', adminHeader()).send(fields);
    assert.equal(routeRes.status, 200);

    const t = makeBoard();
    const toolRes = await registry.call('update_pipeline_lead', { id: 7, ...fields }, adminCtx(t.client));
    assert.equal(toolRes.ok, true);

    assert.deepEqual(
      withoutTimestamp(payloadOf(t.calls, 'update')),
      withoutTimestamp(payloadOf(r.calls, 'update')),
    );
  });

  it('update：只改一个字段时也相同（部分更新语义在两条路径上是同一份）', async () => {
    const r = makeBoard();
    dbState.client = r.client;
    const routeRes = await request(app).put('/api/pipeline/7').set('Authorization', adminHeader()).send({ stage: 'lost' });
    assert.equal(routeRes.status, 200);

    const t = makeBoard();
    const toolRes = await registry.call('update_pipeline_lead', { id: 7, stage: 'lost' }, adminCtx(t.client));
    assert.equal(toolRes.ok, true);

    assert.deepEqual(
      Object.keys(withoutTimestamp(payloadOf(t.calls, 'update'))).sort(),
      Object.keys(withoutTimestamp(payloadOf(r.calls, 'update'))).sort(),
    );
  });

  it('PATCHABLE_FIELDS 覆盖的就是路由 PUT 认得的那几列（清单别漂）', () => {
    assert.deepEqual([...PATCHABLE_FIELDS].sort(),
      ['demand_id', 'next_action', 'next_action_at', 'note', 'stage']);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 5. 角色门控 + admin 第二因子门（2026-07-27 修复的漏洞必须自动覆盖新工具）
// ════════════════════════════════════════════════════════════════════════════
describe('三个工具的两道门：角色 + adm2fa', () => {
  const TOOLS = ['list_pipeline_leads', 'create_pipeline_lead', 'update_pipeline_lead'];
  const ARGS = {
    list_pipeline_leads: {},
    create_pipeline_lead: { company: 'Acme' },
    update_pipeline_lead: { id: 7, stage: 'lost' },
  };
  // 真跑到 handler 就会炸，用来证明它压根没被执行
  const EXPLODING = { from() { throw new Error('handler 不该被执行'); } };

  for (const tool of TOOLS) {
    it(`${tool}：employer / engineer / 未登录一律调不动`, async () => {
      for (const user of [
        { userId: 9, email: 'e@x.com', role: 'employer' },
        { userId: 9, email: 'g@x.com', role: 'engineer' },
        null,
      ]) {
        const res = await registry.call(tool, ARGS[tool], { user, supabase: EXPLODING });
        assert.equal(res.ok, false);
        assert.match(res.error, /is not available for role/);
      }
    });

    it(`${tool}：admin 但没过 2FA（普通登录令牌）被拒，且一次查询都不发`, async () => {
      const { client, calls } = makeBoard();
      const res = await registry.call(tool, ARGS[tool], adminCtx(client, ADMIN_NO_2FA));
      assert.equal(res.ok, false, `${tool} 不该对无 adm2fa 的令牌放行`);
      assert.match(res.error, /two-factor/i);
      assert.equal(calls.length, 0, '门必须在任何数据库动作之前');
    });

    it(`${tool}：admin + adm2fa 正常放行（门没把合法 admin 一起挡掉）`, async () => {
      const { client } = makeBoard(tool === 'list_pipeline_leads' ? { data: [SEED], error: null } : { data: SEED, error: null });
      const res = await registry.call(tool, ARGS[tool], adminCtx(client));
      assert.equal(res.ok, true);
    });
  }

  it('路由侧同样要 2FA：普通 admin 令牌 401（HTTP 与工具两边一样高）', async () => {
    dbState.client = makeBoard().client;
    const token = jwt.sign(ADMIN_NO_2FA, process.env.JWT_SECRET, { expiresIn: '1h' });
    const res = await request(app).get('/api/pipeline').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 401);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 6. 路由既有契约不许因重构漂移
// ════════════════════════════════════════════════════════════════════════════
describe('GET /api/pipeline：重构前后逐条不变', () => {

  it('不带 stage：返回全部，不加 stage 过滤', async () => {
    const { client, calls } = makeBoard({ data: [SEED], error: null });
    dbState.client = client;
    const res = await request(app).get('/api/pipeline').set('Authorization', adminHeader());
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok', data: [SEED] });
    assert.equal(boardCalls(calls).some((c) => c.method === 'eq' && c.args[0] === 'stage'), false);
  });

  it('非法 stage 被【忽略】、返回整块看板（前端笔误不该给出空看板）', async () => {
    const { client, calls } = makeBoard({ data: [SEED], error: null });
    dbState.client = client;
    const res = await request(app).get('/api/pipeline?stage=bogus').set('Authorization', adminHeader());
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, [SEED], '非法 stage 不该变成空看板');
    assert.equal(boardCalls(calls).some((c) => c.method === 'eq' && c.args[0] === 'stage'), false,
      '非法 stage 不该被下推成过滤条件');
  });

  it('data 为 null（空表）：返回空数组而不是 null', async () => {
    const { client } = makeBoard({ data: null, error: null });
    dbState.client = client;
    const res = await request(app).get('/api/pipeline').set('Authorization', adminHeader());
    assert.deepEqual(res.body, { status: 'ok', data: [] });
  });

  it('DB 出错：500 + 通用文案', async () => {
    const { client } = makeBoard({ data: null, error: { code: '42P01', message: 'relation missing' } });
    dbState.client = client;
    const res = await request(app).get('/api/pipeline').set('Authorization', adminHeader());
    assert.equal(res.status, 500);
    assert.deepEqual(res.body, { error: 'Something went wrong. Please try again.' });
  });

  it('未鉴权：401', async () => {
    const res = await request(app).get('/api/pipeline');
    assert.equal(res.status, 401);
  });
});

describe('POST /api/pipeline：重构前后逐条不变', () => {

  it('缺 company / 全空白 company：400 + 原文案，且不写库', async () => {
    for (const company of [undefined, '', '   ', 42]) {
      const { client, calls } = makeBoard();
      dbState.client = client;
      const res = await request(app).post('/api/pipeline')
        .set('Authorization', adminHeader()).send({ company, note: 'x' });
      assert.equal(res.status, 400, `company=${JSON.stringify(company)} 应被拒`);
      assert.deepEqual(res.body, { error: 'company is required' });
      assert.equal(boardCalls(calls).some((c) => c.method === 'insert'), false);
    }
  });

  it('line 只认 "us"，其余（含缺省/乱填）一律 cn', async () => {
    for (const [line, expected] of [['us', 'us'], ['cn', 'cn'], ['fr', 'cn'], [undefined, 'cn'], ['US', 'cn']]) {
      const { client, calls } = makeBoard();
      dbState.client = client;
      await request(app).post('/api/pipeline').set('Authorization', adminHeader())
        .send({ company: 'Acme', line });
      assert.equal(payloadOf(calls, 'insert').line, expected, `line=${line} 应归一化成 ${expected}`);
    }
  });

  it('stage 一律强制 lead（body 里写别的也没用）', async () => {
    const { client, calls } = makeBoard();
    dbState.client = client;
    await request(app).post('/api/pipeline').set('Authorization', adminHeader())
      .send({ company: 'Acme', stage: 'signed' });
    assert.equal(payloadOf(calls, 'insert').stage, 'lead');
  });

  it('contact / note 缺省落 null（不落 undefined）', async () => {
    const { client, calls } = makeBoard();
    dbState.client = client;
    await request(app).post('/api/pipeline').set('Authorization', adminHeader()).send({ company: 'Acme' });
    assert.deepEqual(payloadOf(calls, 'insert'), {
      company: 'Acme', line: 'cn', contact: null, note: null, stage: 'lead',
    });
  });

  it('成功：{ status:"ok", data: 插入行 }', async () => {
    const { client } = makeBoard();
    dbState.client = client;
    const res = await request(app).post('/api/pipeline')
      .set('Authorization', adminHeader()).send({ company: 'Acme' });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok', data: SEED });
  });

  it('DB 出错：500 + 通用文案', async () => {
    const { client } = makeBoard({ data: null, error: { code: '23505', message: 'dup' } });
    dbState.client = client;
    const res = await request(app).post('/api/pipeline')
      .set('Authorization', adminHeader()).send({ company: 'Acme' });
    assert.equal(res.status, 500);
    assert.deepEqual(res.body, { error: 'Something went wrong. Please try again.' });
  });
});

describe('PUT /api/pipeline/:id：重构前后逐条不变', () => {

  it('成功：{ status:"ok", data: 更新后的行 }，且按路径 id 定位', async () => {
    const { client, calls } = makeBoard();
    dbState.client = client;
    const res = await request(app).put('/api/pipeline/7')
      .set('Authorization', adminHeader()).send({ stage: 'matched' });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok', data: SEED });
    assert.ok(boardCalls(calls).some((c) => c.method === 'eq' && c.args[0] === 'id' && c.args[1] === '7'));
  });

  it('空 body：只顶 updated_at（重构前就是这个行为，别顺手改成 400）', async () => {
    const { client, calls } = makeBoard();
    dbState.client = client;
    const res = await request(app).put('/api/pipeline/7').set('Authorization', adminHeader()).send({});
    assert.equal(res.status, 200);
    assert.deepEqual(Object.keys(payloadOf(calls, 'update')), ['updated_at']);
  });

  it('DB 出错：500 + 通用文案', async () => {
    const { client } = makeBoard({ data: null, error: { code: '42P01', message: 'relation missing' } });
    dbState.client = client;
    const res = await request(app).put('/api/pipeline/7')
      .set('Authorization', adminHeader()).send({ stage: 'lost' });
    assert.equal(res.status, 500);
    assert.deepEqual(res.body, { error: 'Something went wrong. Please try again.' });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 7. 注册元数据：tier 判断与 G1 改名
// ════════════════════════════════════════════════════════════════════════════
describe('三个工具的注册元数据', () => {
  const byName = (n) => registry.list('admin').find((t) => t.name === n);

  it('tier 与 sideEffects：read / write / write，且一个外发都没有', () => {
    assert.equal(byName('list_pipeline_leads').tier, 'read');
    assert.equal(byName('create_pipeline_lead').tier, 'write');
    assert.equal(byName('update_pipeline_lead').tier, 'write');
    // 改的是平台自己的内部销售笔记，不发任何东西给任何人 → 不声明 sideEffects，
    // 也就【不是】 confirm 层（理由写在 writeTools.js 该工具上方）。
    for (const n of ['list_pipeline_leads', 'create_pipeline_lead', 'update_pipeline_lead']) {
      assert.deepEqual(byName(n).sideEffects, []);
    }
  });

  it('只对 admin 可见：其余三个角色的清单里一个都没有', () => {
    for (const role of ['public', 'employer', 'engineer']) {
      const visible = registry.list(role).map((t) => t.name);
      for (const n of ['list_pipeline_leads', 'create_pipeline_lead', 'update_pipeline_lead']) {
        assert.equal(visible.includes(n), false, `${role} 不该看到 ${n}`);
      }
    }
  });

  it('G1：联系人参数叫 contact_person 而不是 contact（改名而不是放宽正则）', () => {
    const props = byName('create_pipeline_lead').parameters.properties;
    assert.equal('contact' in props, false, 'contact 会被 registry 的 G1 正则在注册期拒掉');
    assert.ok(props.contact_person, '改名后的参数应存在');
  });

  it('可清空的文本字段都没有 minLength（加了就再也表达不出"清空"）', () => {
    const props = byName('update_pipeline_lead').parameters.properties;
    for (const k of ['note', 'next_action', 'next_action_at']) {
      assert.equal(props[k].minLength, undefined, `${k} 不能有 minLength，空串就是"清空"的表达`);
    }
  });

  it('list_pipeline_leads 返回整块看板（count 与 leads 对得上）', async () => {
    const { client } = makeBoard({ data: [SEED, { ...SEED, id: 8 }], error: null });
    const res = await registry.call('list_pipeline_leads', {}, adminCtx(client));
    assert.equal(res.ok, true);
    assert.deepEqual(res.data, { stage: null, count: 2, leads: [SEED, { ...SEED, id: 8 }] });
  });

  it('create_pipeline_lead：company 是必填，schema 层就挡（空串也不行）', async () => {
    for (const args of [{}, { company: '' }]) {
      const res = await registry.call('create_pipeline_lead', args, adminCtx({ from() { throw new Error('不该执行'); } }));
      assert.equal(res.ok, false);
      assert.match(res.error, /Invalid arguments: company/);
    }
  });
});
