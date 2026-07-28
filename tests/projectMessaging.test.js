// ── 项目消息发送：路由与 agent 工具共用同一份实现 ────────────────────────────
// 这个文件存在的理由只有一个：POST /api/messages 和 send_project_message 抽取成
// services/messageService.js 之后，必须证明【两条路径的行为真的是同一份】，尤其是
//   1) 归属校验（防 IDOR：非当事方不许往别人项目的线程里写）
//   2) 邮件防轰炸（"我上一轮的消息对方读了没"必须在插入之前统计）
// 第 2 条是最容易悄悄坏掉的：统计挪到插入之后就恒 >0，邮件从此永远不发，却不报任何错。
// 所以这里不只断言"结果对"，还断言【统计发生在插入之前】、以及两条路径算出的
// startsNewRound 一模一样。
//
// 依赖注入方式：node:test 的每个测试文件是独立进程，所以直接改 require.cache 打桩
// （与 tests/agentConfirm.test.js 打 config/db 的做法同源），必须在 require 被测模块之前完成。

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-project-messaging';

// ── 打桩：email / notificationService / config/db ────────────────────────────
// 外发是 fire-and-forget，测试靠这两个桩观察"到底发没发邮件"。
const sent = { emails: [], notifications: [] };

const emailPath = require.resolve('../src/services/email');
require.cache[emailPath] = {
  id: emailPath, filename: emailPath, loaded: true,
  exports: {
    emailNewMessage: async (payload) => { sent.emails.push(payload); },
  },
};

const notifPath = require.resolve('../src/services/notificationService');
require.cache[notifPath] = {
  id: notifPath, filename: notifPath, loaded: true,
  exports: {
    createNotification: (payload) => { sent.notifications.push(payload); },
  },
};

const dbState = { client: null };
const dbPath = require.resolve('../src/config/db');
require.cache[dbPath] = {
  id: dbPath, filename: dbPath, loaded: true, exports: { getClient: () => dbState.client },
};

const { sendMessage, MessageError } = require('../src/services/messageService');
const registry = require('../src/tools/registry');
const messagesRouter = require('../src/routes/messages');

const EMPLOYER = { userId: 42, email: 'boss@corp.com', role: 'employer' };
const OUTSIDER = { userId: 99, email: 'nosy@evil.com', role: 'engineer' };

const app = express();
app.use(express.json());
app.use('/api/messages', messagesRouter);
const authHeader = (user) => `Bearer ${jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' })}`;

// agent_actions 的三次消费顺序：① 去重查询 ② begin 插入 ③ complete 回填
const AUDIT_OK = [
  { data: [], error: null },
  { data: { id: 1 }, error: null },
  { data: null, error: null },
];

// fire-and-forget 的通知链要跑完才能观察：每个 setImmediate 边界会把微任务队列排空，
// mock 的 promise 全是立即 resolve 的，几轮足够（不是靠 sleep 赌时间）。
async function flushAsync() {
  for (let i = 0; i < 5; i += 1) await new Promise((r) => setImmediate(r));
}

// ── 可编程假 supabase ────────────────────────────────────────────────────────
// 需要同时支持：count 查询（select(..., {count}) 后直接 await）、insert().select().single()、
// 以及 ownership 助手的 single()/maybeSingle()。按表名预置结果，并记录调用顺序。
function makeDb({ unreadFromMe = 0, participant = true, insertError = null, demand = {} } = {}) {
  const calls = [];
  const demandRow = {
    id: 7, employer_id: participant ? 42 : 1000,
    title: 'Line 3 retrofit', contact: 'boss@corp.com', assigned_engineer_id: 501,
    ...demand,
  };
  const cursors = {};

  function builder(table) {
    const b = {};
    const record = (m) => (...args) => { calls.push({ table, method: m, args }); return b; };
    ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in', 'gte', 'lt',
      'order', 'limit'].forEach((m) => { b[m] = record(m); });

    const finish = () => {
      const i = cursors[table] || 0;
      cursors[table] = i + 1;
      switch (table) {
        case 'messages':
          // 第一次终结 = 防轰炸 count 查询；之后 = insert 回读
          if (i === 0) return { data: null, error: null, count: unreadFromMe };
          return insertError
            ? { data: null, error: insertError }
            : { data: { id: 900, demand_id: 7, content: 'hi' }, error: null };
        case 'demands':
          return { data: demandRow, error: null };
        case 'talents':
          // ownership 的工程师反查（非当事方 → null）/ 通知收件人反查
          return participant
            ? { data: { id: 501, contact: 'eng@x.com' }, error: null }
            : { data: null, error: null };
        case 'demand_applications':
          return { data: participant ? { id: 3 } : null, error: null };
        case 'agent_actions': {
          const j = cursors.__audit || 0;
          cursors.__audit = j + 1;
          return AUDIT_OK[Math.min(j, AUDIT_OK.length - 1)];
        }
        default:
          return { data: null, error: null };
      }
    };

    b.single = () => { calls.push({ table, method: 'single' }); return Promise.resolve(finish()); };
    b.maybeSingle = () => { calls.push({ table, method: 'maybeSingle' }); return Promise.resolve(finish()); };
    b.then = (resolve, reject) => Promise.resolve(finish()).then(resolve, reject);
    return b;
  }

  return { client: { from: (table) => { calls.push({ table, method: 'from' }); return builder(table); } }, calls };
}

// agent_actions 的游标与 messages 共用一个 cursors 对象，但走的是独立键，互不干扰。
const asConfirmed = (user, client) => ({ user, supabase: client, confirmed: true });

beforeEach(() => { sent.emails = []; sent.notifications = []; dbState.client = null; });

// ── 1. 归属校验：两条路径都必须挡住非当事方 ─────────────────────────────────
describe('归属校验：非当事方不许往别人项目的线程里写（防 IDOR）', () => {

  it('路由：403 Forbidden，且一条消息都没插进去', async () => {
    const { client, calls } = makeDb({ participant: false });
    dbState.client = client;
    const res = await request(app).post('/api/messages')
      .set('Authorization', authHeader(OUTSIDER))
      .send({ demand_id: 7, content: 'let me in' });

    assert.equal(res.status, 403);
    assert.deepEqual(res.body, { error: 'Forbidden' });
    assert.equal(calls.some((c) => c.table === 'messages' && c.method === 'insert'), false);
  });

  it('工具：同样被拒（错误文案是给用户看的人话，不是 "Forbidden"）', async () => {
    const { client, calls } = makeDb({ participant: false });
    const res = await registry.call('send_project_message', { demand_id: 7, content: 'let me in' },
      asConfirmed(OUTSIDER, client));

    assert.equal(res.ok, false);
    assert.match(res.error, /not a participant/i);
    assert.equal(calls.some((c) => c.table === 'messages' && c.method === 'insert'), false);
  });
});

// ── 2. 防轰炸：两条路径必须算出同一个 startsNewRound ────────────────────────
describe('邮件防轰炸：两条路径行为完全一致（抽取 messageService 的全部意义）', () => {

  // 观察口径：startsNewRound 是内部量，外部可观测的等价物就是"这次发没发邮件"。
  // 站内通知无论如何都发（只是红点计数），所以顺带断言它恒为 1 条。
  async function viaRoute(unreadFromMe) {
    const { client, calls } = makeDb({ unreadFromMe });
    dbState.client = client;
    const res = await request(app).post('/api/messages')
      .set('Authorization', authHeader(EMPLOYER))
      .send({ demand_id: 7, content: 'ping' });
    await flushAsync();
    return { status: res.status, emails: sent.emails.length, notifications: sent.notifications.length, calls };
  }

  async function viaTool(unreadFromMe) {
    const { client, calls } = makeDb({ unreadFromMe });
    const res = await registry.call('send_project_message', { demand_id: 7, content: 'ping' },
      asConfirmed(EMPLOYER, client));
    await flushAsync();
    return { ok: res.ok, emails: sent.emails.length, notifications: sent.notifications.length, calls };
  }

  it('对方没有我的未读（unread=0）：两条路径都发邮件', async () => {
    const route = await viaRoute(0);
    assert.equal(route.status, 200);
    assert.equal(route.emails, 1, '新一轮的第一条必须发邮件');
    assert.equal(route.notifications, 1);

    sent.emails = []; sent.notifications = [];
    const tool = await viaTool(0);
    assert.equal(tool.ok, true);
    assert.equal(tool.emails, 1);
    assert.equal(tool.notifications, 1);
  });

  it('对方已有我的未读（unread=3）：两条路径都只发站内通知，不发邮件', async () => {
    const route = await viaRoute(3);
    assert.equal(route.emails, 0, '对方本就有未读，再发邮件就是轰炸收件箱');
    assert.equal(route.notifications, 1);

    sent.emails = []; sent.notifications = [];
    const tool = await viaTool(3);
    assert.equal(tool.emails, 0);
    assert.equal(tool.notifications, 1);
  });

  it('未读统计必须发生在插入之前（放到之后会恒 >0，邮件从此永远不发）', async () => {
    for (const run of [viaRoute, viaTool]) {
      sent.emails = []; sent.notifications = [];
      const { calls } = await run(0);
      const msgCalls = calls.filter((c) => c.table === 'messages');
      const countIdx = msgCalls.findIndex((c) => c.method === 'eq' && c.args[0] === 'read' && c.args[1] === false);
      const insertIdx = msgCalls.findIndex((c) => c.method === 'insert');
      assert.notEqual(countIdx, -1, '未读统计查询不见了');
      assert.notEqual(insertIdx, -1, '插入不见了');
      assert.ok(countIdx < insertIdx, `${run.name}: 未读统计必须早于插入`);
    }
  });

  it('统计口径两条路径一致：demand_id + 我自己 + read=false', async () => {
    for (const run of [viaRoute, viaTool]) {
      sent.emails = []; sent.notifications = [];
      const { calls } = await run(0);
      const eqs = calls.filter((c) => c.table === 'messages' && c.method === 'eq').map((c) => c.args);
      assert.ok(eqs.some(([k, v]) => k === 'demand_id' && String(v) === '7'));
      assert.ok(eqs.some(([k, v]) => k === 'sender_email' && v === EMPLOYER.email),
        '必须只统计我自己发出的消息——统计成对方的，防轰炸就反过来了');
      assert.ok(eqs.some(([k, v]) => k === 'read' && v === false));
    }
  });
});

// ── 3. 工具侧的 confirm 纪律与返回形状 ──────────────────────────────────────
describe('send_project_message：confirm 层纪律', () => {

  it('未确认时只回提案 + 令牌，绝不发送（与其它 confirm 工具一致）', async () => {
    const res = await registry.call('send_project_message', { demand_id: 7, content: 'hi' }, {
      user: EMPLOYER,
      // supabase 故意给一个会炸的对象：真执行了就会抛错暴露出来
      supabase: { from() { throw new Error('handler 不该被执行'); } },
    });
    assert.equal(res.ok, false);
    assert.equal(res.needsConfirmation, true);
    assert.equal(res.tool, 'send_project_message');
    assert.ok(res.confirmToken);
    assert.equal(sent.emails.length, 0);
    assert.equal(sent.notifications.length, 0);
  });

  it('注册元数据：confirm 层 + 声明外发副作用 + 线程两端可用', () => {
    const tool = registry.list('engineer').find((t) => t.name === 'send_project_message');
    assert.ok(tool, 'engineer 应能看到本工具');
    assert.equal(tool.tier, 'confirm');
    assert.deepEqual(tool.sideEffects.sort(), ['email', 'notification']);
    assert.deepEqual(tool.roles.sort(), ['employer', 'engineer']);
    // public 永远看不到写能力
    assert.equal(registry.list('public').some((t) => t.name === 'send_project_message'), false);
  });

  it('确认后成功：返回小结构（带 message_id），供确认卡显示成功态', async () => {
    const { client } = makeDb({ unreadFromMe: 0 });
    const res = await registry.call('send_project_message', { demand_id: 7, content: 'hi' },
      asConfirmed(EMPLOYER, client));
    assert.equal(res.ok, true);
    assert.deepEqual(res.data, { demand_id: 7, message_id: 900, sent: true });
  });

  it('落库失败：如实报错，不假装发出去了', async () => {
    const { client } = makeDb({ insertError: { code: '23503', message: 'fk violation' } });
    const res = await registry.call('send_project_message', { demand_id: 7, content: 'hi' },
      asConfirmed(EMPLOYER, client));
    assert.equal(res.ok, false);
    assert.match(res.error, /Could not send the message/i);
  });

  it('超长正文被参数校验挡在 handler 之外（根本走不到服务层）', async () => {
    const res = await registry.call('send_project_message', { demand_id: 7, content: 'x'.repeat(2001) },
      asConfirmed(EMPLOYER, { from() { throw new Error('handler 不该被执行'); } }));
    assert.equal(res.ok, false);
    assert.match(res.error, /Invalid arguments/i);
  });
});

// ── 4. 路由既有契约不许因重构漂移 ───────────────────────────────────────────
describe('POST /api/messages：重构前后响应契约逐条不变', () => {

  it('成功：{ status:"ok", data: 插入行 }', async () => {
    const { client } = makeDb({ unreadFromMe: 0 });
    dbState.client = client;
    const res = await request(app).post('/api/messages')
      .set('Authorization', authHeader(EMPLOYER))
      .send({ demand_id: 7, content: 'hi' });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.data.id, 900);
  });

  it('缺 content：400 + 原文案', async () => {
    const { client } = makeDb({});
    dbState.client = client;
    const res = await request(app).post('/api/messages')
      .set('Authorization', authHeader(EMPLOYER)).send({ demand_id: 7, content: '   ' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'demand_id and content are required' });
  });

  it('超长：400 + 原文案', async () => {
    const { client } = makeDb({});
    dbState.client = client;
    const res = await request(app).post('/api/messages')
      .set('Authorization', authHeader(EMPLOYER))
      .send({ demand_id: 7, content: 'x'.repeat(2001) });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body, { error: 'Message too long (max 2000 chars)' });
  });

  it('离线重放撞唯一约束（23505）：{ ok:true, deduped:true }，不当作错误', async () => {
    const { client } = makeDb({ insertError: { code: '23505', message: 'duplicate key' } });
    dbState.client = client;
    const res = await request(app).post('/api/messages')
      .set('Authorization', authHeader(EMPLOYER))
      .send({ demand_id: 7, content: 'hi', client_msg_id: 'offline-1' });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true, deduped: true });
  });

  it('client_msg_id 原样落库（离线重放幂等键别丢了）', async () => {
    const { client, calls } = makeDb({});
    dbState.client = client;
    await request(app).post('/api/messages')
      .set('Authorization', authHeader(EMPLOYER))
      .send({ demand_id: 7, content: 'hi', client_msg_id: 'offline-1' });
    const ins = calls.find((c) => c.table === 'messages' && c.method === 'insert');
    assert.equal(ins.args[0].client_msg_id, 'offline-1');
  });

  it('不带 client_msg_id 时不写该列（写成 null 会污染 partial 唯一索引的语义）', async () => {
    const { client, calls } = makeDb({});
    dbState.client = client;
    await request(app).post('/api/messages')
      .set('Authorization', authHeader(EMPLOYER)).send({ demand_id: 7, content: 'hi' });
    const ins = calls.find((c) => c.table === 'messages' && c.method === 'insert');
    assert.equal('client_msg_id' in ins.args[0], false);
  });

  it('DB 出错：500 + 通用文案（真实错误只进日志）', async () => {
    const { client } = makeDb({ insertError: { code: '42P01', message: 'relation missing' } });
    dbState.client = client;
    const res = await request(app).post('/api/messages')
      .set('Authorization', authHeader(EMPLOYER)).send({ demand_id: 7, content: 'hi' });
    assert.equal(res.status, 500);
    assert.deepEqual(res.body, { error: 'Something went wrong. Please try again.' });
  });

  it('未登录：401（requireAuth 未被重构绕过）', async () => {
    const res = await request(app).post('/api/messages').send({ demand_id: 7, content: 'hi' });
    assert.equal(res.status, 401);
  });
});

// ── 5. 服务层错误契约 ───────────────────────────────────────────────────────
describe('messageService 错误契约：带 code 的人话错误', () => {

  it('每种失败都是 MessageError 且 code 可分派、message 是人话', async () => {
    const { client } = makeDb({ participant: false });
    await assert.rejects(
      () => sendMessage({ supabase: client, user: OUTSIDER, demandId: 7, content: 'hi' }),
      (err) => {
        assert.ok(err instanceof MessageError);
        assert.equal(err.code, 'forbidden');
        assert.equal(/^forbidden$/i.test(err.message), false, 'message 要给用户/模型看，不能是状态码词');
        return true;
      },
    );
  });
});
