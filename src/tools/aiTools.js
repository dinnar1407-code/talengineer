// ── AI 工具（首批 3 个，Phase 1）─────────────────────────────────────────────
// 形状已定稿（实现者勿改 name/parameters/roles）；handler 由实现 agent 填充。
// 通用约束同 readTools.js 顶部注释（ctx 形状 / G1 身份 scope / 错误处理）。
const { register } = require('./registry');

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
  handler: async (_args, _ctx) => { throw new Error('NOT_IMPLEMENTED'); },
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
  handler: async (_args, _ctx) => { throw new Error('NOT_IMPLEMENTED'); },
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
  handler: async (_args, _ctx) => { throw new Error('NOT_IMPLEMENTED'); },
});
