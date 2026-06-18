// ── 归属/当事方校验助手（防 IDOR 越权访问）────────────────────────────────────
// 背景：很多接口按 demand_id / milestone_id 取数据，但只校验"登录"不校验"是不是这单的人"。
// 这会导致水平越权（IDOR）：任意登录用户改一下 URL 里的 id 就能读到别人的项目、消息、纠纷。
// 本文件集中实现"这个用户是不是这个 demand 的当事方"的判定，供各路由复用，避免每处重复写逻辑。
//
// 归属模型（已从生产库核实，demands 没有 assigned_engineer_id / user_id 列）：
//   - 雇主当事方：demands.employer_id === req.user.userId
//   - 工程师参与方：req.user.userId →（talents.user_id）→ talent.id，
//                    再看该 talent.id 是否在该 demand 的 demand_applications 里。
//   - admin 角色：直接放行（平台管理员需要处理纠纷、客服等）。
//
// 设计说明：助手只负责"判定"并返回布尔结果，不直接发 HTTP 响应；
// 由调用方路由决定 403/404 怎么返回，这样能贴合各文件现有的错误处理风格。

/**
 * 判断某用户是否为某 demand 的当事方（雇主 / 参与工程师 / admin）。
 *
 * @param {object} supabase - 已初始化的 Supabase 客户端（来自 getClient()）
 * @param {number|string} demandId - 目标 demand 的 id
 * @param {object} user - req.user，形如 { userId, email, role }
 * @param {object} [opts]
 * @param {boolean} [opts.requireAssigned=false]
 *        true  → 工程师方仅当其 application.status='accepted'（已被正式指派）才算当事方；
 *        false → 只要该工程师对此 demand 提交过申请（任意 status）即算参与方。
 *        （读里程碑等场景用 false 放宽到"申请过即可看"，强归属场景用 true。）
 * @returns {Promise<{ allowed: boolean, demand: object|null }>}
 *          allowed：是否为当事方；demand：查到的 demand 行（含 employer_id），未找到则为 null。
 */
async function assertDemandParticipant(supabase, demandId, user, opts = {}) {
  const { requireAssigned = false } = opts;

  // 先取 demand，确认存在并拿到 employer_id（雇主归属判定的唯一依据）。
  const { data: demand, error: demandErr } = await supabase
    .from('demands')
    .select('id, employer_id')
    .eq('id', demandId)
    .single();

  // demand 不存在：返回 allowed=false 且 demand=null，让调用方决定回 404 还是 403。
  if (demandErr || !demand) return { allowed: false, demand: null };

  // admin 放行（放在取到 demand 之后，保证返回值里带上 demand 供后续使用）。
  // 平台管理员有处理纠纷/客服的合法需要。
  if (user?.role === 'admin') return { allowed: true, demand };

  // 雇主当事方：employer_id 与当前用户一致即放行。
  if (demand.employer_id === user?.userId) return { allowed: true, demand };

  // 工程师参与方：先由 user_id 反查该用户的 talent 档案 id。
  // 没有 talent 档案的用户（纯雇主）自然不是工程师参与方，直接判否。
  const { data: talent } = await supabase
    .from('talents')
    .select('id')
    .eq('user_id', user?.userId)
    .single();
  if (!talent) return { allowed: false, demand };

  // 再看该 talent.id 是否在此 demand 的申请记录里。
  // requireAssigned=true 时只认 status='accepted'（已正式指派的工程师）；
  // 否则只要申请过（任意 status）即算参与方。
  let appQuery = supabase
    .from('demand_applications')
    .select('id')
    .eq('demand_id', demandId)
    .eq('engineer_id', talent.id);
  if (requireAssigned) appQuery = appQuery.eq('status', 'accepted');

  const { data: application } = await appQuery.maybeSingle();

  return { allowed: !!application, demand };
}

module.exports = { assertDemandParticipant };
