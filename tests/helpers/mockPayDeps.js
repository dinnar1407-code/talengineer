// ── 支付/纠纷路由 HTTP 集成测试的依赖注入 Mock（require.cache 预注入）─────────────
// node:test 没有 jest.mock，无法在运行时拦截 require。这里用"预注入 require.cache"的手法：
// 在被测 router 被 require 之前，先把伪造的模块塞进 require.cache[绝对路径]。这样 Node
// 命中缓存直接返回假模块，真实文件体（连数据库/Stripe 的代码）根本不会执行。
//
// 关键约束：src/routes/payment.js 与 disputes.js 在【模块加载时】就执行
//   const stripe = require('../config/stripe').getStripe();
// 因此假 stripe 必须在 require(router) 之前注入，且 getStripe() 返回的是一个引用稳定的
// 单例假对象（router 只会捕获一次）。我们让该假对象的方法委托到可重编程的 recorder 上，
// 于是即使 router 早已捕获引用，每个用例仍能重新设定 create/retrieve/... 的行为与断言其入参。
//
// getClient() 则是在每次请求处理函数内部调用的，所以每个用例可用 setDb(...) 换一套假数据。

const path = require('path');
const { makeSupabase } = require('./supabaseChainMock');

// ── 可编程 recorder：记录每次调用的入参（calls），行为经 .impl 可替换 ─────────────
// 用法：deps.stripe.transfers.create.impl = async (args) => {...}；
//       assert.equal(deps.stripe.transfers.create.calls[0][0].amount, 85000)
function makeFn(defaultImpl) {
  const def = defaultImpl || (async () => ({}));
  const f = function (...args) {
    f.calls.push(args);
    return f.impl.apply(this, args);
  };
  f.calls = [];
  f._def = def;
  f.impl = def;
  f.reset = () => { f.calls.length = 0; f.impl = f._def; };
  return f;
}

function installPayDeps() {
  // ── 可变状态：每个用例通过 setUser/setDb 改写 ────────────────────────────────
  const authState = { user: null };
  const dbState = { client: makeSupabase({}).client };

  // ── 假 Stripe（引用稳定的单例；方法为可编程 recorder）────────────────────────
  const stripe = {
    checkout: {
      sessions: {
        create: makeFn(async () => ({ id: 'cs_test', url: 'https://stripe.test/checkout/cs_test' })),
        retrieve: makeFn(async () => ({ payment_status: 'paid', metadata: {}, amount_total: 0, payment_intent: null })),
      },
    },
    transfers: { create: makeFn(async () => ({ id: 'tr_test' })) },
    refunds: { create: makeFn(async () => ({ id: 're_test' })) },
    paymentIntents: { search: makeFn(async () => ({ data: [] })) },
    webhooks: { constructEvent: makeFn(() => ({ type: 'unknown', data: { object: {} } })) },
  };
  const stripeFns = [
    stripe.checkout.sessions.create,
    stripe.checkout.sessions.retrieve,
    stripe.transfers.create,
    stripe.refunds.create,
    stripe.paymentIntents.search,
    stripe.webhooks.constructEvent,
  ];

  // ── 假 email（全部 no-op recorder，仅记录调用）────────────────────────────────
  const emailNames = [
    'emailMilestoneFunded', 'emailMilestoneReleased', 'emailPaymentFailed',
    'emailEngineerAssigned', 'emailNewApplication', 'emailPasswordReset',
    'emailRequestReview', 'emailNewMessage', 'emailVerifyEmail',
  ];
  const email = {};
  emailNames.forEach((n) => { email[n] = makeFn(async () => ({})); });

  // ── 假通知服务（no-op recorder）────────────────────────────────────────────────
  const notify = makeFn(async () => {});

  // ── 假鉴权：requireAuth 按 authState.user 注入 req.user（null → 401）──────────
  const fakeAuth = {
    requireAuth(req, res, next) {
      if (!authState.user) return res.status(401).json({ error: 'Unauthorized: missing token' });
      req.user = authState.user;
      next();
    },
    requireRole: () => (req, res, next) => next(),
  };
  // requireAdmin 直通（口令校验不在本次被测范围）
  const fakeAdminAuth = { requireAdmin: (req, res, next) => next() };

  // ── 把假模块塞入 require.cache（用绝对路径作 key，与 router 内 require 的解析一致）──
  function inject(relFromHelper, exportsObj) {
    const abs = require.resolve(path.join(__dirname, relFromHelper));
    require.cache[abs] = {
      id: abs, filename: abs, loaded: true, exports: exportsObj, children: [], paths: [],
    };
  }
  inject('../../src/config/db', { getClient: () => dbState.client, initDB: () => dbState.client });
  inject('../../src/config/stripe', { getStripe: () => stripe, STRIPE_API_VERSION: '2023-10-16' });
  inject('../../src/middleware/auth', fakeAuth);
  inject('../../src/middleware/adminAuth', fakeAdminAuth);
  inject('../../src/services/email', email);
  inject('../../src/services/notificationService', { createNotification: notify });

  const deps = {
    stripe,
    email,
    notify,
    dbCalls: [],
    // 设置当前登录用户；传 null 表示未登录（requireAuth 会 401）
    setUser(user) { authState.user = user; },
    // 用一组按表名分组的预置结果重建假 supabase，返回 calls 便于断言下发的过滤条件/payload
    setDb(tableResults) {
      const m = makeSupabase(tableResults);
      dbState.client = m.client;
      deps.dbCalls = m.calls;
      return m.calls;
    },
    // 每个用例前清空：recorder 调用记录与行为、登录态、假数据库
    reset() {
      stripeFns.forEach((f) => f.reset());
      emailNames.forEach((n) => email[n].reset());
      notify.reset();
      authState.user = null;
      const m = makeSupabase({});
      dbState.client = m.client;
      deps.dbCalls = m.calls;
    },
  };

  return deps;
}

module.exports = { installPayDeps };
