// ── AI 工具（首批 3 个，Phase 1）─────────────────────────────────────────────
// 形状已定稿（实现者勿改 name/parameters/roles）；handler 由实现 agent 填充。
// 通用约束同 readTools.js 顶部注释（ctx 形状 / G1 身份 scope / 错误处理）。
const { register } = require('./registry');
const { parseDemand } = require('../services/aiService');
// 只用纯函数（extractKeywords/scoreEngineer）——runMatchmaker 有外发副作用，G3 禁入。
const { extractKeywords, scoreEngineer } = require('../services/matchmakerService');

// ── 共用：安全版 parseDemand ─────────────────────────────────────────────────
// 为什么包一层：aiService.parseDemand 失败时抛的是底层错误（fetch/JSON.parse），
// 文案对模型/用户没有意义还可能带内部细节；这里统一转成人话，原始错误只进日志
// （registry.call 会把 throw 包装成 {ok:false,error}，所以这里只管抛"语义化"错误）。
// 输出白名单化：parseDemand 实际只产出 4 个键（title/role_required/
// standardized_description/milestones）——显式挑选，防 AI 多吐的野字段透传出去，
// 也绝不假设 region/budget 等不存在的键（契约修正 #4）。
async function parseDemandSafe(text) {
  let parsed;
  try {
    parsed = await parseDemand(text);
  } catch (err) {
    console.error('[aiTools] parseDemand failed:', err);
    throw new Error('AI parsing is temporarily unavailable. Please try again in a moment.');
  }
  if (!parsed || typeof parsed.title !== 'string' || !parsed.title.trim()) {
    throw new Error('AI could not extract a structured demand from that text. Please add more detail and try again.');
  }
  return {
    title: parsed.title,
    role_required: parsed.role_required || '',
    standardized_description: parsed.standardized_description || '',
    milestones: Array.isArray(parsed.milestones)
      ? parsed.milestones.map((m) => ({ phase_name: m.phase_name, percentage: m.percentage }))
      : [],
  };
}

// ── 7. parse_demand（public/employer）────────────────────────────────────────
// 实现要点：直接调 src/services/aiService.js 的 parseDemand(text)——返回
// { title, role_required, standardized_description, milestones:[{phase_name,percentage}] }。
// 只生成草稿数据返回给调用方，绝不落库（落库要走 create_demand_draft，且需 employer 角色）。
// agentService/前端把本工具产出当作可确认的草稿卡（draft）渲染。
register({
  name: 'parse_demand',
  description:
    'Parse a free-form project need (any language) into a structured demand draft: ' +
    'professional English title, required roles/skills, standardized description, and ' +
    'suggested payment milestones. Does NOT save anything — returns a draft for the user to review.',
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        minLength: 5,
        maxLength: 8000,
        description: 'The raw project description as written by the client.',
      },
    },
    required: ['text'],
  },
  roles: ['public', 'employer'],
  // 纯"解析→返回草稿"：不碰数据库，落库要走 create_demand_draft（employer 角色）。
  handler: async (args) => parseDemandSafe(args.text),
});

// ── 8. draft_sow（employer）──────────────────────────────────────────────────
// 实现要点：先 parseDemand(text) 拿结构化结果，再组织成一份完整 SoW 草稿
// （scope/objectives/deliverables + 里程碑表：phase_name/percentage/说明）。
// 可以在 parseDemand 输出之上再调一次 aiService.callGemini 润色成 SoW 文本，
// 也可以纯模板拼装——但一律不落库、不发送，返回草稿对象由用户在 UI 决定。
register({
  name: 'draft_sow',
  description:
    'Draft a Statement of Work (SoW) with milestone breakdown from a free-form project ' +
    'description. Returns the draft text/structure only — nothing is saved or sent.',
  parameters: {
    type: 'object',
    properties: {
      text: {
        type: 'string',
        minLength: 5,
        maxLength: 8000,
        description: 'The raw project description to turn into a SoW draft.',
      },
    },
    required: ['text'],
  },
  roles: ['employer'],
  // 纯模板拼装（不二次调 AI）：aiService 没有导出 callGemini，且模板产出确定性强、
  // 零额外失败面；milestones 的 percentage 是 0-1 小数，展示层转成百分比标签。
  handler: async (args) => {
    const draft = await parseDemandSafe(args.text);
    const milestones = draft.milestones.map((m) => ({
      phase_name: m.phase_name,
      percentage: m.percentage,
      percent_label: `${Math.round((Number(m.percentage) || 0) * 100)}%`,
    }));
    const sowText = [
      `# Statement of Work — ${draft.title}`,
      '',
      '## Required Roles & Skills',
      draft.role_required || 'To be defined',
      '',
      '## Scope of Work',
      draft.standardized_description || 'To be defined',
      '',
      '## Milestones & Payment Schedule',
      ...(milestones.length
        ? milestones.map((m, i) => `${i + 1}. ${m.phase_name} — ${m.percent_label} of total budget`)
        : ['To be defined with the assigned engineer.']),
      '',
      '## Payment Terms',
      'Funds are held in platform escrow per milestone and released upon employer approval in the TalEngineer UI.',
    ].join('\n');
    // 返回结构化草稿 + 可直接展示的 SoW 文本；一律不落库、不发送（G2/G3）。
    return { ...draft, milestones, sow_text: sowText };
  },
});

// ── 9. get_match_recommendations（employer/admin）────────────────────────────
// ⚠️ 契约修正（以代码实态为准）：原契约写"调 matchmakerService.runMatchmaker"，
// 但 runMatchmaker 是副作用函数——会给工程师发外联邮件+站内通知且无返回值，
// 从工具里调用=撞 G3 红线（无外发工具）。正确实现：复用 matchmakerService 导出的
// 纯函数 extractKeywords + scoreEngineer 只算不发：
//   1) 归属校验：demands.select('id, employer_id, role_required, description, region')
//      .eq('id', demandId).single()；非 admin 且 employer_id !== ctx.user.userId
//      → throw new Error('Project not found or not yours')（不区分不存在/无权，防枚举）。
//   2) 候选池：照 runMatchmaker 的 regionHint 推导 + talents ilike region 过滤 limit 30。
//   3) extractKeywords(role_required+' '+description) → scoreEngineer 排序取前 5。
//   4) 返回 PUBLIC_TALENT_FIELDS 白名单字段 + match_score，绝不带 contact。
register({
  name: 'get_match_recommendations',
  description:
    'Rank the best-matching engineers for one of your posted projects (skill overlap, ' +
    'verified score, ratings, availability). Read-only scoring — no emails or invitations are sent.',
  parameters: {
    type: 'object',
    properties: {
      demandId: { type: 'integer', minimum: 1, description: 'Id of a demand you own.' },
    },
    required: ['demandId'],
  },
  roles: ['employer', 'admin'],
  handler: async (args, ctx) => {
    const supabase = ctx.supabase;
    // 延迟 require：readTools 的 module.exports 是重赋值，模块加载期取会在循环依赖下
    // 拿到旧的空对象；handler 运行时所有模块已加载完毕，此时取才稳。
    const { PUBLIC_TALENT_FIELDS } = require('./readTools');

    // 1) 归属校验（防 IDOR）：非 admin 必须是该 demand 的雇主本人；
    //    不存在/无权一律同一文案，不区分二者，防 id 枚举探测。
    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .select('id, employer_id, role_required, description, region')
      .eq('id', args.demandId)
      .single();
    const isAdmin = ctx.user?.role === 'admin';
    if (demandErr || !demand || (!isAdmin && demand.employer_id !== ctx.user?.userId)) {
      throw new Error('Project not found or not yours');
    }

    // 2) 候选池：regionHint 推导照抄 matchmakerService.runMatchmaker（101-107 行），
    //    但只查 PUBLIC_TALENT_FIELDS 白名单（绝不 select('*')——那会把 contact 等 PII 捞进来）。
    const demandRegion = (demand.region && !['null', 'undefined'].includes(demand.region))
      ? demand.region : 'US';
    const regionHint = demandRegion.includes('MX') ? 'MX'
      : demandRegion.includes('CA') ? 'CA'
      : demandRegion.includes('VN') || demandRegion.toLowerCase().includes('vietnam') ? 'VN'
      : demandRegion.includes('IN') || demandRegion.toLowerCase().includes('india') ? 'IN'
      : 'US';
    const { data: candidates, error: talentErr } = await supabase
      .from('talents')
      .select(PUBLIC_TALENT_FIELDS)
      .ilike('region', `%${regionHint}%`)
      .order('verified_score', { ascending: false })
      .limit(30);
    if (talentErr) {
      console.error('[aiTools] get_match_recommendations candidate query failed:', talentErr);
      throw new Error('Could not load candidate engineers. Please try again.');
    }

    // 3) 只算不发（G3）：复用 matchmaker 的纯函数打分，取前 5；行内只有白名单字段，
    //    展开安全，绝不带 contact。
    const keywords = extractKeywords((demand.role_required || '') + ' ' + (demand.description || ''));
    const matches = (candidates || [])
      .map((e) => ({ ...e, match_score: Math.round(scoreEngineer(e, keywords) * 10) / 10 }))
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 5);

    return { demand_id: demand.id, region_hint: regionHint, matches };
  },
});
