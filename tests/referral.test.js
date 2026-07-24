// ── 推荐计划（W2-4）单元测试 ────────────────────────────────────────────────────
// 覆盖四块（全部离线，Supabase 走 tests/helpers/supabaseChainMock）：
// 1. registerSchema 归因字段：referral_code 已显式声明（zod 会静默剥未声明字段，漏声明=前端传了也丢）。
// 2. 码生成：格式（8 位大写 base32）、已有码直接复用、唯一索引撞码（23505）重试、重试耗尽抛错。
// 3. 归因 attributeReferral：归一化、码不存在、自荐拦截（同 id / 同邮箱大小写不敏感）、
//    幂等（已被推荐 23505 静默）、fail-open（任何库错不向上抛——调用方是注册主路径）。
// 4. 懒兑现 evaluateVesting 判定矩阵：employer 侧 / engineer 侧 / 未达标 / 非 attributed 跳过，
//    以及幂等关键断言——vest 更新必须带 .eq('status','attributed') 条件。
//
// chainMock 语义提醒：同一张表的预置结果按【终结调用顺序】依次消费（数组用尽重复最后一个），
// 直接 await 链（thenable）也算一次终结消费——下面各用例的预置数组顺序即查询顺序。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { makeSupabase } = require('./helpers/supabaseChainMock');
const {
  generateCode,
  getOrCreateCode,
  attributeReferral,
  evaluateVesting,
  maskEmail,
} = require('../src/services/referralService');
const { registerSchema } = require('../src/routes/auth');
const { REFERRAL_ENABLED, REFERRAL_REWARD_USD, VESTING_RULE } = require('../src/config/referral');

// ── 1. registerSchema 归因字段 ────────────────────────────────────────────────

describe('registerSchema referral_code（归因字段已声明）', () => {
  it('携带 referral_code 注册：字段被保留（未声明会被 zod 静默剥掉）', () => {
    const r = registerSchema.safeParse({
      email: 'new@user.com', password: 'longpass123', role: 'employer',
      referral_code: 'ABCD2345',
    });
    assert.equal(r.success, true);
    assert.equal(r.data.referral_code, 'ABCD2345');
  });

  it('不带 referral_code：可选字段，注册照常通过', () => {
    const r = registerSchema.safeParse({
      email: 'new@user.com', password: 'longpass123', role: 'engineer',
    });
    assert.equal(r.success, true);
    assert.equal(r.data.referral_code, undefined);
  });

  it('超长 referral_code（> 32 位）：校验失败（防垃圾输入进库查询）', () => {
    const r = registerSchema.safeParse({
      email: 'new@user.com', password: 'longpass123', role: 'employer',
      referral_code: 'X'.repeat(33),
    });
    assert.equal(r.success, false);
  });
});

// ── 2. 码生成 ─────────────────────────────────────────────────────────────────

describe('generateCode / getOrCreateCode（推荐码生成）', () => {
  it('generateCode：恒为 8 位大写 base32（无易混淆的 0/1/8/9）', () => {
    for (let i = 0; i < 50; i++) {
      assert.match(generateCode(), /^[A-Z2-7]{8}$/);
    }
  });

  it('已有码：直接返回，不发起任何 update', async () => {
    const { client, calls } = makeSupabase({
      users: { data: { referral_code: 'EXIST234' }, error: null },
    });
    const code = await getOrCreateCode(client, 42);
    assert.equal(code, 'EXIST234');
    assert.equal(calls.filter((c) => c.method === 'update').length, 0);
  });

  it('无码：生成 8 位 base32 写入，带 .is(referral_code, null) 防并发覆盖守卫', async () => {
    const { client, calls } = makeSupabase({
      users: [
        { data: { referral_code: null }, error: null },       // ① 先查现有码：无
        { data: { referral_code: 'NEWC2345' }, error: null }, // ② update 成功回读
      ],
    });
    const code = await getOrCreateCode(client, 42);
    assert.equal(code, 'NEWC2345');
    // 写入的码符合格式
    const up = calls.find((c) => c.table === 'users' && c.method === 'update');
    assert.ok(up, '应有一次 update');
    assert.match(up.args[0].referral_code, /^[A-Z2-7]{8}$/);
    // "从无到有"守卫：.is('referral_code', null)
    const isGuard = calls.find((c) => c.table === 'users' && c.method === 'is');
    assert.deepEqual(isGuard.args, ['referral_code', null]);
  });

  it('撞码（唯一索引 23505）：换码重试，第三次成功', async () => {
    const { client, calls } = makeSupabase({
      users: [
        { data: { referral_code: null }, error: null },       // 先查：无码
        { data: null, error: { code: '23505' } },             // 第 1 次 update：撞码
        { data: null, error: { code: '23505' } },             // 第 2 次 update：又撞
        { data: { referral_code: 'OKAY2345' }, error: null }, // 第 3 次：成功
      ],
    });
    const code = await getOrCreateCode(client, 42);
    assert.equal(code, 'OKAY2345');
    assert.equal(calls.filter((c) => c.method === 'update').length, 3);
  });

  it('连撞 3 次：重试耗尽，抛错（不无限循环）', async () => {
    const { client } = makeSupabase({
      users: [
        { data: { referral_code: null }, error: null },
        { data: null, error: { code: '23505' } },
        { data: null, error: { code: '23505' } },
        { data: null, error: { code: '23505' } },
      ],
    });
    await assert.rejects(() => getOrCreateCode(client, 42), /Failed to allocate/);
  });
});

// ── 3. 归因 attributeReferral ─────────────────────────────────────────────────

describe('attributeReferral（注册归因，fail-open）', () => {
  it('无码：不归因，不发起任何库查询', async () => {
    const { client, calls } = makeSupabase({});
    const r = await attributeReferral(client, { newUserId: 2, newUserEmail: 'a@b.com', referralCode: undefined });
    assert.equal(r.attributed, false);
    assert.equal(calls.length, 0);
  });

  it('非法格式（含特殊字符）：白名单拦截，不进任何查询（防注入面）', async () => {
    const { client, calls } = makeSupabase({});
    const r = await attributeReferral(client, { newUserId: 2, newUserEmail: 'a@b.com', referralCode: "abc'); drop--" });
    assert.equal(r.attributed, false);
    assert.equal(r.reason, 'bad_format');
    assert.equal(calls.length, 0);
  });

  it('码不存在：不归因（maybeSingle 无行不是错误）', async () => {
    const { client } = makeSupabase({ users: { data: null, error: null } });
    const r = await attributeReferral(client, { newUserId: 2, newUserEmail: 'a@b.com', referralCode: 'ABCD2345' });
    assert.equal(r.attributed, false);
    assert.equal(r.reason, 'code_not_found');
  });

  it('自荐拦截（同 id）：referrer.id === 新用户 id → 不落 referrals', async () => {
    const { client, calls } = makeSupabase({
      users: { data: { id: 42, email: 'ref@x.com' }, error: null },
    });
    const r = await attributeReferral(client, { newUserId: 42, newUserEmail: 'other@x.com', referralCode: 'ABCD2345' });
    assert.equal(r.attributed, false);
    assert.equal(r.reason, 'self_referral');
    assert.equal(calls.filter((c) => c.table === 'referrals').length, 0);
  });

  it('自荐拦截（同邮箱，大小写不敏感）：换个马甲邮箱大小写也拦', async () => {
    const { client, calls } = makeSupabase({
      users: { data: { id: 1, email: 'Foo@Bar.com' }, error: null },
    });
    const r = await attributeReferral(client, { newUserId: 2, newUserEmail: 'foo@bar.com', referralCode: 'ABCD2345' });
    assert.equal(r.attributed, false);
    assert.equal(r.reason, 'self_referral');
    assert.equal(calls.filter((c) => c.table === 'referrals').length, 0);
  });

  it('正常归因：码归一化（去空格转大写）、落 referrals 一行 attributed', async () => {
    const { client, calls } = makeSupabase({
      users: { data: { id: 1, email: 'ref@x.com' }, error: null },
      referrals: { data: null, error: null },
    });
    const r = await attributeReferral(client, { newUserId: 2, newUserEmail: 'new@y.com', referralCode: ' abcd2345 ' });
    assert.equal(r.attributed, true);
    assert.equal(r.referrerId, 1);
    const ins = calls.find((c) => c.table === 'referrals' && c.method === 'insert');
    assert.deepEqual(ins.args[0], {
      referrer_user_id: 1, referred_user_id: 2, code: 'ABCD2345', status: 'attributed',
    });
  });

  it('已被推荐过（唯一索引 23505）：幂等静默，不算错误', async () => {
    const { client } = makeSupabase({
      users: { data: { id: 1, email: 'ref@x.com' }, error: null },
      referrals: { data: null, error: { code: '23505' } },
    });
    const r = await attributeReferral(client, { newUserId: 2, newUserEmail: 'new@y.com', referralCode: 'ABCD2345' });
    assert.equal(r.attributed, false);
    assert.equal(r.reason, 'already_referred');
  });

  it('库错误（非 23505）：fail-open——吞掉不向上抛（注册主路径不能被拖垮）', async () => {
    const { client } = makeSupabase({
      users: { data: { id: 1, email: 'ref@x.com' }, error: null },
      referrals: { data: null, error: { code: 'XX000', message: 'boom' } },
    });
    const r = await attributeReferral(client, { newUserId: 2, newUserEmail: 'new@y.com', referralCode: 'ABCD2345' });
    assert.equal(r.attributed, false);
    assert.equal(r.reason, 'error');
  });
});

// ── 4. 懒兑现 evaluateVesting 判定矩阵 ────────────────────────────────────────

describe('evaluateVesting（读侧懒兑现判定矩阵）', () => {
  it('无 attributed 行：直接返回空 Map，零库查询', async () => {
    const { client, calls } = makeSupabase({});
    const result = await evaluateVesting(client, [
      { id: 1, referred_user_id: 5, status: 'vested' },
      { id: 2, referred_user_id: 6, status: 'void' },
    ]);
    assert.equal(result.size, 0);
    assert.equal(calls.length, 0);
  });

  it('employer 侧达标：被推荐人发的需求下有 released 里程碑 → vested + 证据 + 幂等条件', async () => {
    const { client, calls } = makeSupabase({
      talents: { data: [], error: null },                                  // 被推荐人不是工程师
      demands: { data: [{ id: 100, employer_id: 5 }], error: null },       // employer 侧命中
      project_milestones: { data: [{ id: 900, demand_id: 100 }], error: null },
      referrals: { data: null, error: null },                              // 条件更新成功
    });
    const result = await evaluateVesting(client, [
      { id: 10, referred_user_id: 5, status: 'attributed' },
    ]);
    assert.equal(result.size, 1);
    const v = result.get(10);
    assert.equal(v.vest_evidence.milestone_id, 900);
    assert.equal(v.vest_evidence.rule, 'first_released_milestone');
    // 更新 payload 是状态迁移
    const up = calls.find((c) => c.table === 'referrals' && c.method === 'update');
    assert.equal(up.args[0].status, 'vested');
    assert.ok(up.args[0].vested_at);
    // 幂等关键：条件更新必须带 .eq('status','attributed')（并发下只成功一次）
    const eqs = calls.filter((c) => c.table === 'referrals' && c.method === 'eq').map((c) => c.args);
    assert.ok(eqs.some((a) => a[0] === 'id' && a[1] === 10));
    assert.ok(eqs.some((a) => a[0] === 'status' && a[1] === 'attributed'));
  });

  it('engineer 侧达标：talents.user_id → demands.assigned_engineer_id 链路组装后命中', async () => {
    const { client } = makeSupabase({
      talents: { data: [{ id: 70, user_id: 7 }], error: null },  // 被推荐人是工程师，talent id=70
      demands: [
        { data: [], error: null },                                // employer 侧：无
        { data: [{ id: 200, assigned_engineer_id: 70 }], error: null }, // engineer 侧：被指派
      ],
      project_milestones: { data: [{ id: 901, demand_id: 200 }], error: null },
      referrals: { data: null, error: null },
    });
    const result = await evaluateVesting(client, [
      { id: 11, referred_user_id: 7, status: 'attributed' },
    ]);
    assert.equal(result.size, 1);
    assert.equal(result.get(11).vest_evidence.milestone_id, 901);
  });

  it('同一 demand 的雇主与被指派工程师都是被推荐人：两边都应基于同一个 released 里程碑各自兑现', async () => {
    const { client } = makeSupabase({
      talents: { data: [{ id: 70, user_id: 7 }], error: null },  // 被推荐工程师：talent id=70 → user 7
      demands: [
        { data: [{ id: 100, employer_id: 5 }], error: null },              // employer 侧：demand 100 的雇主是被推荐人 5
        { data: [{ id: 100, assigned_engineer_id: 70 }], error: null },    // engineer 侧：同一 demand 100 指派给被推荐人 7
      ],
      project_milestones: { data: [{ id: 900, demand_id: 100 }], error: null },
      referrals: { data: null, error: null },
    });
    const result = await evaluateVesting(client, [
      { id: 10, referred_user_id: 5, status: 'attributed' },
      { id: 11, referred_user_id: 7, status: 'attributed' },
    ]);
    assert.equal(result.size, 2);
    assert.equal(result.get(10).vest_evidence.milestone_id, 900);
    assert.equal(result.get(11).vest_evidence.milestone_id, 900);
  });

  it('未达标（有需求但无 released 里程碑）：保持 attributed，不发 update', async () => {
    const { client, calls } = makeSupabase({
      talents: { data: [], error: null },
      demands: { data: [{ id: 100, employer_id: 5 }], error: null },
      project_milestones: { data: [], error: null },   // 还没放款
    });
    const result = await evaluateVesting(client, [
      { id: 10, referred_user_id: 5, status: 'attributed' },
    ]);
    assert.equal(result.size, 0);
    assert.equal(calls.filter((c) => c.table === 'referrals' && c.method === 'update').length, 0);
  });

  it('批量：一批行里只兑现达标者，milestones 用一次 .in() 批量查（无 N+1）', async () => {
    const { client, calls } = makeSupabase({
      talents: { data: [], error: null },
      // 两个被推荐人都发过需求，但只有 demand 100 有 released 里程碑
      demands: { data: [{ id: 100, employer_id: 5 }, { id: 101, employer_id: 6 }], error: null },
      project_milestones: { data: [{ id: 900, demand_id: 100 }], error: null },
      referrals: { data: null, error: null },
    });
    const result = await evaluateVesting(client, [
      { id: 10, referred_user_id: 5, status: 'attributed' },
      { id: 12, referred_user_id: 6, status: 'attributed' },
    ]);
    assert.equal(result.size, 1);
    assert.ok(result.get(10));
    assert.equal(result.get(12), undefined);
    // milestones 只查了一次（.in 批量），不是每人一查
    assert.equal(calls.filter((c) => c.table === 'project_milestones' && c.method === 'in').length, 1);
  });

  it('库查询失败：fail-open——返回空结果不向上抛（/me 页面不能被兑现评估拖垮）', async () => {
    const { client } = makeSupabase({
      talents: { data: null, error: { code: 'XX000', message: 'boom' } },
    });
    const result = await evaluateVesting(client, [
      { id: 10, referred_user_id: 5, status: 'attributed' },
    ]);
    assert.equal(result.size, 0);
  });
});

// ── 5. 配置形状 + 邮箱打码 ────────────────────────────────────────────────────

describe('referral 配置与工具函数', () => {
  it('配置形状：默认关闭、金额未定价恒 null（数字纪律）、规则常量正确', () => {
    // 测试环境未设 REFERRAL_ENABLED → 默认 false
    assert.equal(REFERRAL_ENABLED, false);
    assert.equal(REFERRAL_REWARD_USD, null);
    assert.equal(VESTING_RULE, 'first_released_milestone');
  });

  it('maskEmail：打码保留前 2 位 + 域名；本地部分过短时恒留至少 1 位不打码；非法输入返回 null', () => {
    assert.equal(maskEmail('someone@example.com'), 'so***@example.com');
    // 本地部分只有 2 位：不能整段裸露（否则 *** 没遮住任何东西 = 完整邮箱泄露）
    assert.equal(maskEmail('ab@x.io'), 'a***@x.io');
    // 本地部分只有 1 位：同理，一位都不能漏
    assert.equal(maskEmail('a@x.io'), '***@x.io');
    assert.equal(maskEmail('not-an-email'), null);
    assert.equal(maskEmail(null), null);
  });
});
