// 撮合 Pipeline 看板路由（PMF 实验）—— 由 pipeline-admin agent 填充（Task 3）
// 人工撮合线索看板：admin 专用，管理出海雇主/美国本土两条线的 lead 从接触到成交的推进。
// 表 matchmaking_pipeline（迁移 020）：RLS deny-all，读写一律走服务端 service key（getClient）。
//
// 列表/新建/更新三段逻辑（含 STAGES 白名单与部分更新语义）都在
// services/pipelineService.js，与 agent 的 list/create/update_pipeline_lead 三个工具
// 共用同一份实现——白名单或部分更新一旦分叉成两份，其中一份把"没传的字段"也写进
// patch，就会安静抹掉人工撮合攒下的跟进记录（详见该文件头注释）。
// 本文件只负责 HTTP 层：解析 body/query、把服务层错误按 code 映射成既有状态码与文案。
const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { requireAdmin } = require('../middleware/adminAuth');
const { PipelineError, listLeads, createLead, updateLead } = require('../services/pipelineService');

// 通用 500：真实错误已在服务层记进日志，客户端只收到通用文案
const GENERIC_500 = { error: 'Something went wrong. Please try again.' };

// ── GET /api/pipeline?stage=lead：看板列表（可按阶段过滤）─────────────────────────
router.get('/', requireAdmin, async (req, res) => {
  try {
    // 非法 stage 由服务层忽略、返回全部（宽松处理，避免前端笔误导致空看板）
    const data = await listLeads({ supabase: getClient(), stage: req.query.stage });
    res.json({ status: 'ok', data });
  } catch (err) {
    // 只按 code 分派、不透传服务层文案：路由的响应体是既有对外契约，
    // 服务层文案是给 agent/模型看的人话，两者刻意解耦（见 pipelineService 的错误契约注释）。
    if (err instanceof PipelineError) return res.status(500).json(GENERIC_500);
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[pipeline:list]', err);
    res.status(500).json(GENERIC_500);
  }
});

// ── POST /api/pipeline：新增线索 ─────────────────────────────────────────────────
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { company, line, contact, note } = req.body;
    const data = await createLead({ supabase: getClient(), company, line, contact, note });
    res.json({ status: 'ok', data });
  } catch (err) {
    if (err instanceof PipelineError) {
      if (err.code === 'invalid_company') return res.status(400).json({ error: 'company is required' });
      return res.status(500).json(GENERIC_500);
    }
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[pipeline:create]', err);
    res.status(500).json(GENERIC_500);
  }
});

// ── PUT /api/pipeline/:id：推进阶段 / 编辑备注与下一步 / 关联需求 ──────────────────
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    // req.body 原样交给服务层：**键的有无就是意图**（没传的字段绝不能被覆盖成 null），
    // 所以这里不做任何解构再重组——那正是部分更新语义被写坏的地方。
    const data = await updateLead({ supabase: getClient(), id: req.params.id, fields: req.body || {} });
    res.json({ status: 'ok', data });
  } catch (err) {
    if (err instanceof PipelineError) {
      if (err.code === 'invalid_stage') return res.status(400).json({ error: 'Invalid stage' });
      if (err.code === 'invalid_demand_id') return res.status(400).json({ error: 'Invalid demand_id' });
      return res.status(500).json(GENERIC_500);
    }
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[pipeline:update]', err);
    res.status(500).json(GENERIC_500);
  }
});

// ── DELETE /api/pipeline/:id：删除线索 ───────────────────────────────────────────
// 刻意【没有】对应的 agent 工具：删除不可逆，而真实工作流是把线索推进到 stage='lost'
// （记录仍在、能复盘）。删除只保留在 UI 上由人手点。见 src/tools/writeTools.js 头部红线。
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { error } = await supabase
      .from('matchmaking_pipeline')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ status: 'ok' });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[pipeline:delete]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
