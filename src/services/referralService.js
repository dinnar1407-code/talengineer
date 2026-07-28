// ── 推荐计划（W2-4）业务逻辑：码生成 / 注册归因 / 读侧懒兑现 ────────────────────
// 设计原则（本批红线）：
// 1. 零钱路径改动——兑现不挂 milestone 释放钩子，而是"读侧懒评估"：
//    在 GET /api/referral/me 与 admin 列表加载时批量检查被推荐用户是否已出现
//    第一个 released 里程碑，是则条件更新 attributed → vested（.eq('status','attributed')
//    保幂等/防并发：同一条被两个请求同时评估也只会有一次状态迁移生效）。
// 2. fail-open——归因/兑现的任何失败都不允许影响注册或页面主路径，
//    错误进 console.error，函数吞掉异常返回空结果（与 auth.js scoreFromToken 同纪律）。
// 3. 依赖注入——所有函数把 supabase client 作为第一个参数传入（不在本模块 getClient()），
//    单元测试直接喂 tests/helpers/supabaseChainMock 即可，无需 require.cache 预注入。
//
// ⚠️ demands.assigned_engineer_id 列真实存在（migration 012 建列、014 加索引）；
//    ownership.js / workorder.js 里"没有该列"的旧注释是过时的，勿信。
const crypto = require('crypto');
const { VESTING_RULE } = require('../config/referral');
const { feeFor } = require('../config/fees');

// 推荐码字符集：标准 base32（大写字母 + 2-7），刻意排除 0/1/8/9 等易混淆字符，
// 口头转述/手抄不易出错。8 位 → 32^8 ≈ 1.1 万亿组合，撞码概率极低，撞了靠唯一索引 + 重试兜底。
const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const CODE_LENGTH = 8;

/**
 * 生成一个 8 位大写 base32 随机推荐码。
 * 用 crypto.randomInt（CSPRNG）而非 Math.random：推荐码是对外凭证，不能可预测。
 */
function generateCode() {
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return out;
}

/**
 * 取用户的推荐码；没有则生成并写入 users.referral_code（冲突重试 3 次）。
 *
 * 并发/冲突处理：
 * - 写入带 .is('referral_code', null) 守卫：并发请求先写赢的保留，后写的 0 行命中，
 *   回读已存在的码返回——同一用户永远只有一个码。
 * - 撞码（uq_users_referral_code 唯一索引 → 23505）：换一个码重试，最多 3 次。
 *
 * @param {object} supabase Supabase client（依赖注入）
 * @param {number} userId  users.id（生产为 bigint 数字）
 * @returns {Promise<string>} 推荐码
 */
async function getOrCreateCode(supabase, userId) {
  // 先查现有码：绝大多数请求走这条快路径
  const { data: user, error } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', userId)
    .single();
  if (error) throw error;
  if (user && user.referral_code) return user.referral_code;

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode();
    // .is('referral_code', null)：只允许"从无到有"，防止并发把别人刚领的码覆盖掉
    const { data: updated, error: upErr } = await supabase
      .from('users')
      .update({ referral_code: code })
      .eq('id', userId)
      .is('referral_code', null)
      .select('referral_code')
      .single();
    if (!upErr && updated && updated.referral_code) return updated.referral_code;
    // 23505 = 唯一索引撞码：换码再试
    if (upErr && upErr.code === '23505') continue;
    // 其余情况（如并发请求已写入码导致 0 行命中）：回读，有码就用
    const { data: again } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', userId)
      .single();
    if (again && again.referral_code) return again.referral_code;
  }
  throw new Error('Failed to allocate referral code after retries');
}

/**
 * 注册归因（fail-open，永不 throw）：按推荐码找 referrer，拦截自荐，落一条 referrals。
 *
 * 调用点：auth.js POST /register 成功后、POST /oauth-token 新建用户后（fire-and-forget）。
 * 自荐拦截：referrer.id 不能等于新用户 id，且邮箱（大小写不敏感）不能相同——
 * 防"自己推荐自己薅奖励"。重复归因靠 uq_referrals_referred_user 唯一索引兜底（23505 静默）。
 *
 * @param {object} supabase Supabase client
 * @param {{newUserId:number, newUserEmail:string, referralCode:string}} params
 * @returns {Promise<{attributed:boolean, reason?:string, referrerId?:number}>}
 */
async function attributeReferral(supabase, { newUserId, newUserEmail, referralCode }) {
  try {
    if (!referralCode || typeof referralCode !== 'string') {
      return { attributed: false, reason: 'no_code' };
    }
    // 归一化：去空格、转大写（码生成侧全大写，用户手输可能小写）
    const code = referralCode.trim().toUpperCase();
    // 格式白名单：只接受 base32 字符集，长度封顶——非法输入直接丢弃，
    // 不带进任何查询（防注入面，也省一次无意义的库查询）
    if (!/^[A-Z2-7]{4,32}$/.test(code)) {
      return { attributed: false, reason: 'bad_format' };
    }

    // 按码找 referrer：maybeSingle——码不存在不是错误，只是不归因
    const { data: referrer, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('referral_code', code)
      .maybeSingle();
    if (error || !referrer) return { attributed: false, reason: 'code_not_found' };

    // 自荐拦截：同 id 或同邮箱（大小写不敏感）都算自己推荐自己
    const sameId = String(referrer.id) === String(newUserId);
    const sameEmail = !!(referrer.email && newUserEmail
      && String(referrer.email).toLowerCase() === String(newUserEmail).toLowerCase());
    if (sameId || sameEmail) return { attributed: false, reason: 'self_referral' };

    const { error: insErr } = await supabase.from('referrals').insert({
      referrer_user_id: referrer.id,
      referred_user_id: newUserId,
      code,
      status: 'attributed',
    });
    if (insErr) {
      // 23505 = 该用户已被推荐过（一人只能被推荐一次）：幂等静默，不是错误
      if (insErr.code === '23505') return { attributed: false, reason: 'already_referred' };
      throw insErr;
    }
    return { attributed: true, referrerId: referrer.id };
  } catch (err) {
    // fail-open：归因失败绝不向上抛（调用方是注册主路径）
    console.error('[Referral] attribution failed (fail-open):', err);
    return { attributed: false, reason: 'error' };
  }
}

/**
 * 读侧懒兑现（批量）：对一批 referrals 行，检查其中 attributed 的被推荐用户
 * 是否已出现第一个 released 里程碑，是则条件更新为 vested，并算出奖励金额
 * （REFERRAL_REWARD_RULE = 'first_milestone_platform_fee'：该里程碑金额 × 平台实际费率）。
 *
 * 判定口径（VESTING_RULE = 'first_released_milestone'）：
 * - employer 侧：demand.employer_id = 被推荐用户 id，且该 demand 下有 released 里程碑；
 * - engineer 侧：milestone.demand_id → demands.assigned_engineer_id → talents.id
 *   且 talents.user_id = 被推荐用户 id（多次查询在 JS 组装，不依赖 FK embedding）。
 *
 * 批量纪律：全部 attributed 的 referred ids 一次收集，talents/demands/milestones
 * 各一次 .in() 查询（demands 分 employer/engineer 两侧各一次），禁止每人一查的 N+1。
 * vest 更新逐行条件更新 .eq('status','attributed')：并发下只有一次迁移生效（幂等）。
 *
 * 任何一步失败：console.error 后返回已得结果——懒评估失败不能拖垮 /me 或 admin 列表。
 *
 * @param {object} supabase Supabase client
 * @param {Array<{id:number, referred_user_id:number, status:string}>} referralRows
 * @returns {Promise<Map<number, {vested_at:string, vest_evidence:{milestone_id:string, rule:string, reward_usd:number}}>>}
 *   referral id → 本次刚兑现的信息（调用方据此合并展示，无需回读数据库）
 */
async function evaluateVesting(supabase, referralRows) {
  const result = new Map();
  try {
    const attributed = (referralRows || []).filter(
      (r) => r && r.status === 'attributed' && r.referred_user_id != null
    );
    if (attributed.length === 0) return result;

    const referredIds = [...new Set(attributed.map((r) => r.referred_user_id))];

    // ① 被推荐用户中的工程师：user_id → talents.id 映射（engineer 侧判定要用）
    const { data: talents, error: tErr } = await supabase
      .from('talents')
      .select('id, user_id')
      .in('user_id', referredIds);
    if (tErr) throw tErr;
    const talentToUser = new Map();
    (talents || []).forEach((t) => talentToUser.set(t.id, t.user_id));

    // ② demand → 被推荐用户 映射（两侧各一次批量查询），顺带把 fee_pct 一起取回——
    // 奖励金额 = 首个达标里程碑金额 × 该 demand 的实际费率（founding 客户 5%/标准 15%
    // 各不相同，fee_pct 缺失时 feeFor() 自动回退全局 PLATFORM_FEE，同一套费率单一来源）。
    // 一个 demand 可能同时对应两个不同的被推荐人（该 demand 的雇主 + 被指派的工程师
    // 都恰好是被推荐用户），两边都要能各自兑现，所以是 demand id → 用户 id 数组。
    const demandToUser = new Map();
    const demandFeePct = new Map(); // demand_id → fee_pct（可能是 null，交给 feeFor 处理回退）
    // employer 侧：被推荐用户自己发的需求
    const { data: empDemands, error: dErr } = await supabase
      .from('demands')
      .select('id, employer_id, fee_pct')
      .in('employer_id', referredIds);
    if (dErr) throw dErr;
    (empDemands || []).forEach((d) => {
      const arr = demandToUser.get(d.id) || [];
      arr.push(d.employer_id);
      demandToUser.set(d.id, arr);
      demandFeePct.set(d.id, d.fee_pct);
    });

    // engineer 侧：被推荐用户（作为工程师）被指派的需求。
    // demands.assigned_engineer_id 存的是 talents.id（migration 012），经 ① 的映射换回 user id。
    const talentIds = [...talentToUser.keys()];
    if (talentIds.length > 0) {
      const { data: engDemands, error: eErr } = await supabase
        .from('demands')
        .select('id, assigned_engineer_id, fee_pct')
        .in('assigned_engineer_id', talentIds);
      if (eErr) throw eErr;
      (engDemands || []).forEach((d) => {
        const uid = talentToUser.get(d.assigned_engineer_id);
        if (uid == null) return;
        // 追加而非覆盖：employer 侧已占的 demand 仍要记下 engineer 侧这个用户
        const arr = demandToUser.get(d.id) || [];
        if (!arr.includes(uid)) arr.push(uid);
        demandToUser.set(d.id, arr);
        demandFeePct.set(d.id, d.fee_pct);
      });
    }

    const demandIds = [...demandToUser.keys()];
    if (demandIds.length === 0) return result;

    // ③ 一次 .in() 查出这些 demand 下所有 released 里程碑（升序取"第一个"作证据），
    // 带上 amount——奖励金额的计算基础。
    //
    // 计费基数依赖的不变量（与 src/routes/admin.js 营收口径同一条）：
    // project_milestones.amount = 这条里程碑「最终真正计费的金额」。纠纷分账（resolved_split）
    // 时 src/routes/disputes.js 已把 amount 改写为判给工程师的毛额，故此处无需为纠纷做特例。
    // 这一点在这里比在 admin 更要紧：下面的 reward_usd 是一次性快照，算错了永远不会自我纠正。
    const { data: released, error: mErr } = await supabase
      .from('project_milestones')
      .select('id, demand_id, amount')
      .eq('status', 'released')
      .in('demand_id', demandIds)
      .order('id', { ascending: true });
    if (mErr) throw mErr;

    // user id → 命中的第一个达标里程碑（含 amount/demand_id，供下一步算奖励金额）
    const userToMilestone = new Map();
    (released || []).forEach((m) => {
      for (const uid of demandToUser.get(m.demand_id) || []) {
        if (!userToMilestone.has(uid)) userToMilestone.set(uid, m);
      }
    });
    if (userToMilestone.size === 0) return result;

    // ④ 达标的逐行条件更新：.eq('status','attributed') 保幂等（并发评估只成功一次）。
    // 奖励金额 = 里程碑金额 × 该 demand 的实际费率，四舍五入到分——算出来直接快照进
    // vest_evidence.reward_usd，之后 PLATFORM_FEE_PCT 环境变量再调整也不会改写这条历史记录
    // （兑现是一次性事件，不是每次读都重算的实时公式）。
    const nowIso = new Date().toISOString();
    for (const r of attributed) {
      const milestone = userToMilestone.get(r.referred_user_id);
      if (milestone == null) continue;
      const feePct = feeFor({ fee_pct: demandFeePct.get(milestone.demand_id) });
      const rewardUsd = Math.round(Number(milestone.amount || 0) * feePct * 100) / 100;
      const evidence = { milestone_id: milestone.id, rule: VESTING_RULE, reward_usd: rewardUsd };
      const { error: upErr } = await supabase
        .from('referrals')
        .update({ status: 'vested', vested_at: nowIso, vest_evidence: evidence })
        .eq('id', r.id)
        .eq('status', 'attributed');
      if (upErr) {
        console.error('[Referral] vest update failed:', upErr);
        continue;
      }
      result.set(r.id, { vested_at: nowIso, vest_evidence: evidence });
    }
    return result;
  } catch (err) {
    // 懒评估是尽力而为：失败只记日志，页面照常返回未兑现状态
    console.error('[Referral] evaluateVesting failed:', err);
    return result;
  }
}

/**
 * 邮箱打码：'someone@example.com' → 'so***@example.com'。
 * /api/referral/me 给 referrer 看"我推荐了谁"时用——被推荐人的完整邮箱是 PII，
 * 打码后既能认出是谁（自己发出去的邀请），又不完整泄露。
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return null;
  const at = email.indexOf('@');
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  // 本地部分只有 1-2 位时，local.slice(0,2) 会把整个本地部分连同 *** 一起吐出去
  // （***什么都没遮住），等于泄露完整邮箱；恒留至少 1 位不打码，其余打码。
  return `${local.slice(0, Math.min(2, local.length - 1))}***@${domain}`;
}

module.exports = { generateCode, getOrCreateCode, attributeReferral, evaluateVesting, maskEmail };
