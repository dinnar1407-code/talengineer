// ── WarRoom Socket 层活体集成测试（P1 收官：锁定长连接层的验证边界）────────────────
// 此前 socket 层零自动化覆盖（projectMessaging.test.js 是 REST 测试）。本文件在内存中
// 真正启动 attachSocket 的 http.Server 实例，用 socket.io-client（前端同款依赖）建立
// 真实长连接，锁定 P1 治理确立的四条行为：
//   1) 握手 JWT 鉴权：匿名连接被拒（connect_error）；
//   2) 服务端权威显示名：广播与落库的 sender_name 一律是 JWT 邮箱前缀，客户端自报被无视；
//   3) makeAck 幂等 + ack 语义：落库成功 ok:true / 未入房与非法 payload ok:false；
//   4) re-join 模式（warroom.jsx 泄漏修复的服务端可观测契约）：旧连接断开后不再收到
//      广播，新连接恰好收到一次。
//
// 依赖注入与 mockPayDeps 同一手法：先 require.cache 预注入假 db/ownership/aiService，
// 再 require socketServer（避免真连 Supabase / 真调 Gemini）。JWT_SECRET 必须在
// require 之前设置——socketServer 在模块加载时读取它。

process.env.JWT_SECRET = 'test-socket-secret';

const path = require('path');
const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const jwt = require('jsonwebtoken');
const { io: ioc } = require('socket.io-client');
const { makeSupabase } = require('./helpers/supabaseChainMock');

function inject(relFromHere, exportsObj) {
  const abs = require.resolve(path.join(__dirname, relFromHere));
  require.cache[abs] = { id: abs, filename: abs, loaded: true, exports: exportsObj, children: [], paths: [] };
}

// 假 supabase（链式 mock，与支付测试同款）：每个用例可用 resetDb 换一套预置结果
const dbState = { m: makeSupabase({}) };
function resetDb(tableResults = {}) { dbState.m = makeSupabase(tableResults); return dbState.m.calls; }
inject('../src/config/db', { getClient: () => dbState.m.client, initDB: () => dbState.m.client });

// 假归属校验：默认放行；拒绝场景由用例翻转
const ownershipState = { allowed: true };
inject('../src/middleware/ownership', { assertDemandParticipant: async () => ({ allowed: ownershipState.allowed }) });

// 假 AI：翻译打 TR: 前缀便于断言；其余给最小可用返回
inject('../src/services/aiService', {
  translateTechnicalMessage: async (text) => `TR:${text}`,
  generateDailyReport: async () => 'daily report',
  generateNudgeMessage: async () => 'nudge',
  analyzeQualityImage: async () => ({ verdict: 'PASS', feedback_es: 'ok', feedback_zh: '合格' }),
});

const { attachSocket, makeAck, displayNameOf } = require('../src/socketServer');

// ── 测试服务器与连接工具 ─────────────────────────────────────────────────────────
let server, io, port;
const liveSockets = []; // 每个用例结束时统一断开，防止悬挂连接拖住进程

function connect(token) {
  const s = ioc(`http://127.0.0.1:${port}`, {
    auth: token ? { token } : {},
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
  });
  liveSockets.push(s);
  return s;
}
const tokenFor = (user) => jwt.sign(user, 'test-socket-secret');
const once = (socket, ev) => new Promise((resolve) => socket.once(ev, resolve));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 连接 + 入房，等到 joinedRoom 回执才返回（确定性，不靠时序猜） */
async function connectAndJoin(user, projectId) {
  const s = connect(tokenFor(user));
  await once(s, 'connect');
  const joined = once(s, 'joinedRoom');
  s.emit('joinRoom', { projectId });
  await joined;
  return s;
}

before(async () => {
  server = http.createServer();
  io = attachSocket(server);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
});

after(async () => {
  io.close();
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  ownershipState.allowed = true;
  resetDb({ project_messages: { data: null, error: null } }); // insert 默认成功
});

afterEach(() => {
  while (liveSockets.length) {
    const s = liveSockets.pop();
    if (s.connected || s.active) s.disconnect();
  }
});

// ── 单元：makeAck 与 displayNameOf（导出的唯一实现）─────────────────────────────
describe('makeAck / displayNameOf（唯一实现的单元断言）', () => {
  it('makeAck 幂等：重复调用只回执一次，且首次结果生效', () => {
    const results = [];
    const ack = makeAck((r) => results.push(r));
    ack(true);
    ack(false); // 第二次必须是 no-op，不得覆盖首次回执
    assert.deepEqual(results, [{ ok: true }]);
  });

  it('makeAck 无回调（在线正常发送）时为 no-op，不抛错', () => {
    const ack = makeAck(undefined);
    assert.doesNotThrow(() => { ack(true); ack(false); });
  });

  it('displayNameOf：邮箱前缀优先，无邮箱回退角色', () => {
    assert.equal(displayNameOf({ user: { email: 'pepe.eng@factory.mx', role: 'engineer' } }), 'pepe.eng');
    assert.equal(displayNameOf({ user: { email: null, role: 'employer' } }), 'employer');
  });
});

// ── 集成：真实长连接 ─────────────────────────────────────────────────────────────
describe('WarRoom socket 集成（内存服务器 + 真实 socket.io-client 连接）', () => {
  it('匿名连接（无 token）→ connect_error 拒绝握手', async () => {
    const s = connect(null);
    const err = await once(s, 'connect_error');
    assert.match(err.message, /Authentication required/);
    assert.equal(s.connected, false);
  });

  it('非当事方 joinRoom → messageError，不入房', async () => {
    ownershipState.allowed = false;
    const s = connect(tokenFor({ userId: 9, email: 'x@y.z', role: 'engineer' }));
    await once(s, 'connect');
    const errP = once(s, 'messageError');
    s.emit('joinRoom', { projectId: 7 });
    const err = await errP;
    assert.match(err.error, /not a participant/);
  });

  it('未入房直接 chatMessage → ack ok:false + messageError（闸门生效）', async () => {
    const s = connect(tokenFor({ userId: 9, email: 'x@y.z', role: 'engineer' }));
    await once(s, 'connect');
    const errP = once(s, 'messageError');
    const ack = await new Promise((resolve) => s.emit('chatMessage', { projectId: 7, text: 'hi' }, resolve));
    assert.equal(ack.ok, false);
    assert.match((await errP).error, /Join the project room first/);
  });

  it('非法 payload（text 超 4000 字符）→ ack ok:false + Invalid message payload', async () => {
    const s = await connectAndJoin({ userId: 9, email: 'x@y.z', role: 'engineer' }, 7);
    const errP = once(s, 'messageError');
    const ack = await new Promise((resolve) => s.emit('chatMessage', { projectId: 7, text: 'a'.repeat(4001) }, resolve));
    assert.equal(ack.ok, false);
    assert.match((await errP).error, /Invalid message payload/);
  });

  it('happy path：服务端派生显示名（无视客户端自报）、广播、落库、ack ok:true', async () => {
    const calls = resetDb({ project_messages: { data: null, error: null } });
    const engineer = await connectAndJoin({ userId: 1, email: 'pepe.eng@factory.mx', role: 'engineer' }, 7);
    const employer = await connectAndJoin({ userId: 2, email: 'boss@corp.cn', role: 'employer' }, 7);

    const received = once(employer, 'message');
    // senderName 故意冒充：'Fake CEO' 必须被服务端无视（S2 零信任）
    const ack = await new Promise((resolve) =>
      engineer.emit('chatMessage', { projectId: 7, text: 'hola', senderName: 'Fake CEO' }, resolve));
    const msg = await received;

    assert.equal(ack.ok, true, 'makeAck：落库成功必须回执 ok:true');
    assert.equal(msg.senderName, 'pepe.eng', '显示名必须是 JWT 邮箱前缀，客户端自报的 Fake CEO 必须被无视');
    assert.equal(msg.senderRole, 'engineer', '角色取自 JWT');
    assert.equal(msg.senderId, engineer.id, 'senderId 是发送方连接 id（客户端 isMine 判定依据）');
    assert.equal(msg.originalText, 'hola');
    assert.equal(msg.translatedText, 'TR:hola', '雇主视角收到翻译后的文本');

    const ins = calls.find((c) => c.table === 'project_messages' && c.method === 'insert');
    assert.ok(ins, '消息必须落库 project_messages');
    assert.equal(ins.args[0][0].sender_name, 'pepe.eng', '落库的 sender_name 同样是服务端派生名');
    assert.equal(ins.args[0][0].sender_role, 'engineer');
  });

  it('落库失败 → 仍广播但 ack ok:false（离线重发端不 markDone、不丢队列）', async () => {
    resetDb({ project_messages: { data: null, error: { message: 'db down' } } });
    const engineer = await connectAndJoin({ userId: 1, email: 'pepe.eng@factory.mx', role: 'engineer' }, 7);
    const received = once(engineer, 'message'); // io.to(room) 含发送者自身
    const ack = await new Promise((resolve) =>
      engineer.emit('chatMessage', { projectId: 7, text: 'hola' }, resolve));
    assert.equal(ack.ok, false, '落库失败必须 ack ok:false，让重发端保留队列');
    assert.ok(await received, '广播行为保持原样（落库成败不影响广播）');
  });

  it('re-join 模式（warroom 泄漏修复的契约）：旧连接断开后不再收到广播，新连接恰好收到一次', async () => {
    const user = { userId: 1, email: 'pepe.eng@factory.mx', role: 'engineer' };
    const employer = await connectAndJoin({ userId: 2, email: 'boss@corp.cn', role: 'employer' }, 7);

    // 第一次加入，随后按修复后的客户端模式：新建连接前先 disconnect 旧连接
    const oldSocket = await connectAndJoin(user, 7);
    let oldReceived = 0;
    oldSocket.on('message', () => { oldReceived += 1; });
    oldSocket.disconnect();
    assert.equal(oldSocket.connected, false, '旧连接必须真正断开（修复前它会带着监听器继续自动重连）');

    const newSocket = await connectAndJoin(user, 7);
    let newReceived = 0;
    newSocket.on('message', () => { newReceived += 1; });

    await new Promise((resolve) => employer.emit('chatMessage', { projectId: 7, text: 'ping' }, resolve));
    await sleep(200); // 给广播一个送达窗口

    assert.equal(newReceived, 1, '新连接必须恰好收到一次（无重复投递）');
    assert.equal(oldReceived, 0, '断开的旧连接绝不能再收到广播（泄漏已堵死）');
  });
});
