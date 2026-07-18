// 撮合 Pipeline 看板路由（PMF 实验）—— 由 pipeline-admin agent 填充（Task 3）
// 人工撮合线索看板：admin 专用，管理出海雇主/美国本土两条线的 lead 从接触到成交的推进。
// 表 matchmaking_pipeline（迁移 020）：RLS deny-all，读写一律走服务端 service key（getClient）。
const express = require('express');
const router = express.Router();
const { getClient } = require('../config/db');
const { requireAdmin } = require('../middleware/adminAuth');

// stage 白名单：数据库无 CHECK 约束，故在应用层守门，避免写入非法阶段污染看板分组。
const STAGES = ['lead', 'contacted', 'interested', 'scoped', 'matched', 'quoted', 'signed', 'delivered', 'lost'];

// ── GET /api/pipeline?stage=lead：看板列表（可按阶段过滤）─────────────────────────
router.get('/', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    let query = supabase
      .from('matchmaking_pipeline')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(200);
    // 只有传了合法 stage 才过滤；非法值忽略、返回全部（宽松处理，避免前端笔误导致空看板）
    if (req.query.stage && STAGES.includes(req.query.stage)) {
      query = query.eq('stage', req.query.stage);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[pipeline:list]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── POST /api/pipeline：新增线索 ─────────────────────────────────────────────────
router.post('/', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { company, line, contact, note } = req.body;
    // company 为必填：一条没有公司名的线索没有意义，直接 400 挡在入口
    if (typeof company !== 'string' || company.trim().length === 0) {
      return res.status(400).json({ error: 'company is required' });
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
    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[pipeline:create]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── PUT /api/pipeline/:id：推进阶段 / 编辑备注与下一步 / 关联需求 ──────────────────
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { stage, note, next_action, next_action_at, demand_id } = req.body;

    // 只更新本次显式传入的字段，避免把未提交的列覆盖成 null（部分更新语义）
    const patch = { updated_at: new Date().toISOString() };
    if (stage !== undefined) {
      if (!STAGES.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });
      patch.stage = stage;
    }
    if (note !== undefined) patch.note = note || null;
    if (next_action !== undefined) patch.next_action = next_action || null;
    if (next_action_at !== undefined) patch.next_action_at = next_action_at || null;
    if (demand_id !== undefined) {
      // demand_id 允许清空（null）；传值则须为正整数，否则视作非法输入
      if (demand_id === null || demand_id === '') {
        patch.demand_id = null;
      } else {
        const n = Number(demand_id);
        if (!Number.isInteger(n) || n <= 0) return res.status(400).json({ error: 'Invalid demand_id' });
        patch.demand_id = n;
      }
    }

    const { data, error } = await supabase
      .from('matchmaking_pipeline')
      .update(patch)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[pipeline:update]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── DELETE /api/pipeline/:id：删除线索 ───────────────────────────────────────────
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
