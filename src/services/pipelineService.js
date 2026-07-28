// ── 撮合 Pipeline 看板：路由与 agent 工具的【唯一】实现 ──────────────────────
// 为什么要抽这一层：src/routes/pipeline.js（admin 在 /admin 看板上手点）和三个 agent 工具
// （list/create/update_pipeline_lead，admin 在 ChatBot 里说人话）必须是同一套逻辑。
// 两处最怕分叉的是：
//   1) STAGES 白名单——分叉后 agent 那条路能写进一个前端根本不认识的 stage，
//      看板分组里凭空多出一列，或者那条线索干脆从所有列里消失（谁都不查它）；
//   2) 部分更新语义——"body 里没这个键"必须等于"别碰这一列"。写成
//      `patch.note = fields.note || null` 这种无条件赋值，只想改 stage 的一次调用
//      会把 note / next_action 一起清空。它不报错、不掉行，只是安静地抹掉人工撮合
//      攒了几周的跟进记录，而且两份独立实现里几乎不可能同时被发现。
// 所以两条调用路径共用本文件，实现永远只有一份。参照 services/messageService.js。
//
// 表 matchmaking_pipeline（迁移 020）：RLS deny-all，读写一律走服务端 service key。
// 因此本文件【不做】归属过滤——这张表整体就是平台自己的内部销售笔记，没有"属于某个用户
// 的行"这个概念。访问控制全部在入口：路由是 requireAdmin，工具是 roles:['admin']
// （registry 另外强制 ctx.user.adm2fa === true，与后台 TOTP 同一条杠）。

// stage 白名单：数据库无 CHECK 约束，故在应用层守门，避免写入非法阶段污染看板分组。
// 单一来源——路由、update 校验、工具 schema 的 enum 三处全部引用这一个数组。
const STAGES = ['lead', 'contacted', 'interested', 'scoped', 'matched', 'quoted', 'signed', 'delivered', 'lost'];

// 部分更新只认这几列。company / line / contact 不在其中：与重构前的 PUT 完全一致
// （改公司名/线别属于建错了线索，走新建，不在推进流程里顺手改）。
const PATCHABLE_FIELDS = ['stage', 'note', 'next_action', 'next_action_at', 'demand_id'];

// ── 错误契约（与 messageService 同款）─────────────────────────────────────────
// 两个调用方要的东西不一样，所以错误同时带 code 与人话 message：
//   - 工具侧：registry.call 把抛出的 Error 直接包成 { ok:false, error: err.message } 给模型/
//     用户看，所以 .message 必须是一句人话（"Invalid stage" 不是人话）。
//   - 路由侧：HTTP 状态码与响应体文案是既有对外契约，一个字都不能变，所以路由【只按 code
//     分派】、绝不透传 message。两边文案从此可以各自演进而互不影响。
class PipelineError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'PipelineError';
    this.code = code; // 'invalid_company' | 'invalid_stage' | 'invalid_demand_id' | 'db_error'
  }
}

/**
 * 看板列表（可按阶段过滤）。
 *
 * @param {object} supabase 已初始化的 Supabase 客户端
 * @param {string} [stage]  阶段过滤。⚠️ 非法值【被忽略、返回全部】，这是有意的宽松处理：
 *                          前端一个笔误不该让 admin 看到一块空白看板而以为线索没了。
 *                          工具那条路不靠这条兜底——它的 schema 用 enum: STAGES 把非法值
 *                          挡在调用之前（模型拿到"这个 stage 不存在"的明确报错，好过
 *                          悄悄拿到全量board 然后当成某一列汇报给用户）。
 * @returns {Promise<object[]>} 最近 200 行，updated_at 倒序
 * @throws {PipelineError} code='db_error'
 */
async function listLeads({ supabase, stage }) {
  let query = supabase
    .from('matchmaking_pipeline')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(200);
  // 只有传了合法 stage 才过滤；非法值忽略、返回全部（宽松处理，避免前端笔误导致空看板）
  if (stage && STAGES.includes(stage)) {
    query = query.eq('stage', stage);
  }
  const { data, error } = await query;
  if (error) {
    console.error('[pipelineService] list failed:', error);
    throw new PipelineError('db_error', 'Could not load the pipeline board. Please try again.');
  }
  return data || [];
}

/**
 * 新增线索。stage 一律落 'lead'——线索只能从头开始推进，不给"直接建一条 signed"的口子。
 *
 * @param {object} supabase
 * @param {string} company 必填且非空白
 * @param {string} [line]  仅接受 'us'；其余（含缺省）一律 'cn'
 * @param {string} [contact] 对方联系人（这张表里存的是【客户公司的】联系人，不是调用者身份）
 * @param {string} [note]
 * @throws {PipelineError} code='invalid_company' | 'db_error'
 */
async function createLead({ supabase, company, line, contact, note }) {
  // company 为必填：一条没有公司名的线索没有意义，直接挡在入口
  if (typeof company !== 'string' || company.trim().length === 0) {
    throw new PipelineError('invalid_company', 'Tell me which company this lead is for — a lead without a company name is not usable.');
  }
  // line 仅接受 cn/us；其余（含缺省）回退到数据库默认的 'cn'
  const cleanLine = line === 'us' ? 'us' : 'cn';

  const { data, error } = await supabase
    .from('matchmaking_pipeline')
    .insert({
      company: company.trim(),
      line: cleanLine,
      contact: contact || null,
      note: note || null,
      stage: 'lead',
    })
    .select()
    .single();
  if (error) {
    console.error('[pipelineService] create failed:', error);
    throw new PipelineError('db_error', 'Could not save that lead. Please try again.');
  }
  return data;
}

/**
 * 由"调用方给了哪些键"构造 UPDATE 的 patch —— 部分更新语义的唯一实现。
 *
 * 契约（两条路径逐字相同）：
 *   - 键【不在】fields 里（或值是 undefined）→ 该列完全不出现在 patch 里，DB 不碰它；
 *   - 键在、值是 null / ''（HTTP 传 null，工具传空串）→ 显式清空成 NULL；
 *   - 键在、值有内容 → 写入该值。
 *
 * ⚠️ 判定用 `!== undefined` 而不是 `key in fields`：zod 对缺省的 optional 字段确实不会
 * 造出这个键（v4 实测），但这一条不该建立在"验证库当前版本的行为"上——真让它某天
 * 变成 `{ note: undefined }`，`in` 判定会把 note 一路带进 patch 变成 null，安静抹掉记录。
 * 两种形状用 `!== undefined` 都是安全的，所以只认这一种判定。
 *
 * @param {object} fields 原始入参（路由传 req.body，工具传 args；未知键一律忽略）
 * @returns {object} 至少含 updated_at 的 patch
 * @throws {PipelineError} code='invalid_stage' | 'invalid_demand_id'
 */
function buildUpdatePatch(fields = {}) {
  const patch = { updated_at: new Date().toISOString() };

  if (fields.stage !== undefined) {
    if (!STAGES.includes(fields.stage)) {
      throw new PipelineError('invalid_stage', `"${fields.stage}" is not a pipeline stage. Valid stages are: ${STAGES.join(', ')}.`);
    }
    // stage 是 NOT NULL 列，故此处【不做】 `|| null` 清空——阶段只能推进到另一个阶段
    patch.stage = fields.stage;
  }
  // 文本列：空值（null / ''）即清空，与重构前的 `note || null` 逐字等价
  if (fields.note !== undefined) patch.note = fields.note || null;
  if (fields.next_action !== undefined) patch.next_action = fields.next_action || null;
  if (fields.next_action_at !== undefined) patch.next_action_at = fields.next_action_at || null;

  if (fields.demand_id !== undefined) {
    // demand_id 允许清空（null / ''）；传值则须为正整数，否则视作非法输入
    if (fields.demand_id === null || fields.demand_id === '') {
      patch.demand_id = null;
    } else {
      const n = Number(fields.demand_id);
      if (!Number.isInteger(n) || n <= 0) {
        throw new PipelineError('invalid_demand_id', 'The project id must be a positive whole number, or empty to unlink the project.');
      }
      patch.demand_id = n;
    }
  }

  return patch;
}

/**
 * 推进阶段 / 编辑备注与下一步 / 关联需求（部分更新，见 buildUpdatePatch）。
 * @param {object}        supabase
 * @param {number|string} id     行 id（路由给字符串路径参数，工具给整数，PostgREST 两者皆可）
 * @param {object}        fields 原始入参，键的有无即意图
 * @throws {PipelineError} code='invalid_stage' | 'invalid_demand_id' | 'db_error'
 */
async function updateLead({ supabase, id, fields }) {
  const patch = buildUpdatePatch(fields);

  const { data, error } = await supabase
    .from('matchmaking_pipeline')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('[pipelineService] update failed:', error);
    throw new PipelineError('db_error', 'Could not update that lead. Please try again.');
  }
  return data;
}

module.exports = { STAGES, PATCHABLE_FIELDS, PipelineError, listLeads, createLead, buildUpdatePatch, updateLead };
