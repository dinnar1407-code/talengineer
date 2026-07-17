const express = require('express');
const router  = express.Router();
const crypto  = require('crypto'); // 用于生成纠纷放款幂等键的随机后缀
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { assertDemandParticipant } = require('../middleware/ownership');
// 统一 Stripe 工厂（固定 apiVersion，见 src/config/stripe.js）
const stripe = require('../config/stripe').getStripe();

// 共享管理员口令中间件：替换原先本地的明文 !== 比较（恒时比较 + fail-closed）
const { requireAdmin } = require('../middleware/adminAuth');

const { PLATFORM_FEE } = require('../config/fees'); // 抽佣比例集中配置，默认 15%，可经 PLATFORM_FEE_PCT 调整
const { computeResolutionSplit } = require('../utils/disputeMath'); // 裁决资金分配纯函数（毛额语义，含雇主退款）

// ── Open a dispute ────────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { milestone_id, demand_id, reason } = req.body;
    if (!milestone_id || !reason) return res.status(400).json({ error: 'Missing milestone_id or reason' });

    // Check milestone is funded (can't dispute locked or released)
    const { data: ms } = await supabase.from('project_milestones').select('status, demand_id').eq('id', milestone_id).single();
    if (!ms) return res.status(404).json({ error: 'Milestone not found' });

    // ── 当事方校验：必须在冻结里程碑之前 ─────────────────────────────────────
    // 防止任意登录用户对他人 funded 里程碑开纠纷（开纠纷会把里程碑冻结成 disputed）。
    // 仅该 milestone 对应 demand 的雇主或已指派工程师可开，否则 403。
    const { allowed, demand } = await assertDemandParticipant(supabase, ms.demand_id, req.user, { requireAssigned: true });
    if (!demand) return res.status(404).json({ error: 'Project not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    if (!['funded', 'completed'].includes(ms.status)) return res.status(400).json({ error: `Cannot dispute a milestone with status: ${ms.status}` });

    // Only one open dispute per milestone
    const { data: existing } = await supabase.from('disputes').select('id').eq('milestone_id', milestone_id).eq('status', 'open').single();
    if (existing) return res.status(400).json({ error: 'A dispute is already open for this milestone.' });

    // Freeze milestone
    await supabase.from('project_milestones').update({ status: 'disputed' }).eq('id', milestone_id);

    // demand_id 必须来自里程碑的可信数据（ms.demand_id），而非请求体。
    // 若从 req.body 取，攻击者可传合法 milestone_id + 不同 demand_id，写入错配纠纷，
    // 导致后续裁决转账路由查错 demand、打款给错方或打款失败。
    const { data, error } = await supabase.from('disputes').insert({
      milestone_id, demand_id: ms.demand_id, reason, opened_by_email: req.user.email, status: 'open',
    }).select().single();
    if (error) throw error;

    res.json({ status: 'ok', data });
  } catch (err) {
    console.error('[Disputes] Open error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Get dispute by milestone ──────────────────────────────────────────────────
router.get('/milestone/:milestoneId', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    // ── 归属校验：原路由完全无鉴权，先经 milestone → demand 反查当事方 ───────
    // 由 milestone 取所属 demand_id，再判定调用者是否当事方（雇主/工程师/admin）。
    const { data: ms } = await supabase
      .from('project_milestones')
      .select('demand_id')
      .eq('id', req.params.milestoneId)
      .single();
    if (!ms) return res.status(404).json({ error: 'Milestone not found' });

    const { allowed, demand } = await assertDemandParticipant(supabase, ms.demand_id, req.user);
    if (!demand) return res.status(404).json({ error: 'Project not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('milestone_id', req.params.milestoneId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json({ status: 'ok', data: data || null });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[disputes]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Get dispute by id ─────────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('disputes')
      .select('*, project_milestones(phase_name, amount), demands(title)')
      .eq('id', req.params.id)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Dispute not found' });

    // ── 归属校验：原路由完全无鉴权，按纠纷所属 demand 判定当事方 ─────────────
    // 纠纷行自带 demand_id，直接据此判定调用者是否当事方（雇主/工程师/admin），非当事方 403。
    const { allowed } = await assertDemandParticipant(supabase, data.demand_id, req.user);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[disputes]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Submit evidence ───────────────────────────────────────────────────────────
router.put('/:id/evidence', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { evidence } = req.body;
    // 注意：不再信任请求体里的 party。party 必须由服务端按调用者的归属推断，
    // 否则攻击者可声称自己是 employer，把证据写进对方那一侧的字段。

    // 先取纠纷所属 demand_id，用于当事方判定。
    const { data: dispute, error: dispErr } = await supabase
      .from('disputes')
      .select('id, demand_id')
      .eq('id', req.params.id)
      .single();
    if (dispErr || !dispute) return res.status(404).json({ error: 'Dispute not found' });

    // ── 当事方校验 + 服务端推断 party ───────────────────────────────────────
    // 仅该 demand 的雇主或已指派工程师可提交证据；其余 403。
    const { allowed, demand } = await assertDemandParticipant(supabase, dispute.demand_id, req.user, { requireAssigned: true });
    if (!demand) return res.status(404).json({ error: 'Project not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    // 由归属关系决定写入哪一侧：是该 demand 的雇主 → employer 侧；否则即为参与工程师 → engineer 侧。
    // （admin 不是诉讼当事方，没有"自己一侧"的证据可提交。）
    if (req.user.role === 'admin') return res.status(403).json({ error: 'Admins cannot submit party evidence.' });
    const party = demand.employer_id === req.user.userId ? 'employer' : 'engineer';
    const field = party === 'employer' ? 'employer_evidence' : 'engineer_evidence';

    const { data, error } = await supabase
      .from('disputes')
      .update({ [field]: evidence, status: 'under_review' })
      .eq('id', req.params.id)
      .select().single();

    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[disputes]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Admin: list open disputes ─────────────────────────────────────────────────
router.get('/', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const statusFilter = req.query.status || 'open';
    const { data, error } = await supabase
      .from('disputes')
      .select('*, project_milestones(phase_name, amount), demands(title)')
      .eq('status', statusFilter)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ status: 'ok', data: data || [] });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[disputes]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Admin: resolve dispute ────────────────────────────────────────────────────
router.put('/:id/resolve', requireAdmin, async (req, res) => {
  try {
    const supabase = getClient();
    const { resolution, admin_decision, resolution_amount } = req.body;
    // resolution 白名单校验：拼错的值会消费掉 disputed→releasing 原子守卫且事后无法重试，必须在入口拦截
    const VALID_RESOLUTIONS = ['resolved_engineer', 'resolved_employer', 'resolved_split'];
    if (!VALID_RESOLUTIONS.includes(resolution)) {
      return res.status(400).json({ error: `resolution must be one of: ${VALID_RESOLUTIONS.join(', ')}` });
    }

    const { data: dispute } = await supabase
      .from('disputes')
      .select('*, project_milestones(id, amount, phase_name, demand_id, stripe_payment_intent)')
      .eq('id', req.params.id)
      .single();
    if (!dispute) return res.status(404).json({ error: 'Dispute not found' });

    const ms          = dispute.project_milestones;
    const totalAmount = parseFloat(ms.amount) || 0;

    // resolution_amount 范围校验：必须满足 0 < x <= 里程碑托管总额，否则可能转出超过托管的资金
    if (resolution_amount !== undefined && resolution_amount !== null && resolution_amount !== '') {
      const amt = parseFloat(resolution_amount);
      if (!Number.isFinite(amt) || amt <= 0 || amt > totalAmount) {
        return res.status(400).json({ error: `resolution_amount must be greater than 0 and no more than the escrowed total ($${totalAmount}).` });
      }
    }

    // 资金分配（纯函数，见 src/utils/disputeMath.js）：
    // engineerGross = 判给工程师侧的毛额，engineerPayout = 毛额扣平台费后净到手，
    // employerRefund = 托管总额 - 毛额（resolved_employer 时为全额，平台不抽费）。
    const { engineerGross, engineerPayout, employerRefund } = computeResolutionSplit({
      resolution, totalAmount, resolutionAmount: resolution_amount, platformFee: PLATFORM_FEE,
    });

    // 条件更新原子守卫：并发请求中只有一个能把 disputed 改成 releasing，防管理员双击重复转账
    const { data: claimed, error: claimErr } = await supabase
      .from('project_milestones')
      .update({ status: 'releasing' })
      .eq('id', ms.id)
      .eq('status', 'disputed')
      .select('id');
    if (claimErr) throw claimErr;
    if (!claimed || claimed.length === 0) {
      return res.status(409).json({ error: 'Dispute resolution already in progress or completed. Please refresh.' });
    }

    // 抢占成功后才生成幂等键：并发安全由 disputed→releasing 原子抢占保证，随机后缀避免失败重试被 Stripe 旧幂等记录卡住
    const idempotencyKey = `dispute-${req.params.id}-${crypto.randomUUID()}`;

    // Transfer to engineer if payout > 0
    let stripeTransferId = null;
    try {
      if (engineerPayout > 0 && process.env.STRIPE_SECRET_KEY) {
        const { data: demand } = await supabase.from('demands').select('assigned_engineer_id').eq('id', ms.demand_id).single();
        if (demand?.assigned_engineer_id) {
          const { data: talent } = await supabase.from('talents').select('stripe_account_id').eq('id', demand.assigned_engineer_id).single();
          if (talent?.stripe_account_id) {
            const transfer = await stripe.transfers.create({
              amount: Math.round(engineerPayout * 100),
              currency: 'usd',
              destination: talent.stripe_account_id,
              description: `TalEngineer dispute resolution: ${ms.phase_name}`,
              metadata: { dispute_id: String(req.params.id) },
            }, { idempotencyKey });
            stripeTransferId = transfer.id;
          }
        }
      }
    } catch (transferErr) {
      // 转账失败回滚为 disputed，释放守卫以便后续重试
      const { error: rollbackErr } = await supabase.from('project_milestones').update({ status: 'disputed' }).eq('id', ms.id).eq('status', 'releasing');
      // 回滚失败会让里程碑卡死在 releasing（纠纷无法再次处理），必须高优先级告警人工修库
      if (rollbackErr) {
        console.error(`[Disputes] CRITICAL: failed to roll back milestone ${ms.id} from releasing to disputed:`, rollbackErr.message);
      }
      throw transferErr;
    }

    // ── 雇主退款（原逻辑缺失：托管资金只能给工程师或冻结，判给雇主时钱回不去）──
    // resolved_employer 全额原路退回；resolved_split 退"总额 - 工程师毛额"。
    let stripeRefundId = null;
    let refundFailed   = false;
    if (employerRefund > 0 && process.env.STRIPE_SECRET_KEY) {
      try {
        // 定位原始收款：优先里程碑上落盘的 payment_intent（funding 时写入）；
        // 存量老数据没存过该字段，按 checkout 创建时打的 metadata 兜底搜索 Stripe
        let paymentIntentId = ms.stripe_payment_intent || null;
        if (!paymentIntentId) {
          const found = await stripe.paymentIntents.search({ query: `metadata['milestone_id']:'${ms.id}'`, limit: 1 });
          paymentIntentId = found?.data?.[0]?.id || null;
        }
        if (!paymentIntentId) throw new Error(`No payment intent found for milestone ${ms.id} — cannot refund employer`);

        const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: Math.round(employerRefund * 100), // cents，部分退款
          metadata: { dispute_id: String(req.params.id), milestone_id: String(ms.id) },
          // 幂等键语义与放款一致：并发防重靠 disputed→releasing 原子抢占，随机后缀避免失败重试被旧幂等记录卡住
        }, { idempotencyKey: `refund-${req.params.id}-${crypto.randomUUID()}` });
        stripeRefundId = refund.id;
        console.log(`[Dispute] Stripe refund ${stripeRefundId}: $${employerRefund} → employer (milestone ${ms.id})`);
      } catch (refundErr) {
        if (!stripeTransferId) {
          // 工程师侧尚未动钱：整体回滚为 disputed，裁决可安全重试
          const { error: rollbackErr } = await supabase.from('project_milestones').update({ status: 'disputed' }).eq('id', ms.id).eq('status', 'releasing');
          if (rollbackErr) {
            console.error(`[Disputes] CRITICAL: failed to roll back milestone ${ms.id} from releasing to disputed after refund failure:`, rollbackErr.message);
          }
          throw refundErr;
        }
        // 工程师已收款、雇主退款失败：不可回滚（资金已部分转出），落终态并 CRITICAL 告警，
        // 需人工在 Stripe 后台按 payment_intent metadata(milestone_id) 补退
        refundFailed = true;
        console.error(`[Disputes] CRITICAL: engineer transfer ${stripeTransferId} succeeded but employer refund of $${employerRefund} FAILED for dispute ${req.params.id}: ${refundErr.message}. Refund manually in Stripe (search payment_intent by metadata milestone_id=${ms.id}).`);
      }
    }

    // Update milestone + dispute（先落盘 transfer/refund id；带 releasing 条件，只有持有守卫的请求能终结状态）
    // 终态：全额退回雇主 → refunded；其余（工程师全拿/分账）→ released
    const finalStatus = engineerGross === 0 && employerRefund > 0 ? 'refunded' : 'released';
    await supabase.from('project_milestones').update({ status: finalStatus, ...(stripeTransferId && { stripe_transfer_id: stripeTransferId }) }).eq('id', ms.id).eq('status', 'releasing');
    await supabase.from('disputes').update({
      status: resolution, admin_decision, resolution_amount: engineerPayout,
      ...(stripeRefundId && { stripe_refund_id: stripeRefundId }),
      resolved_at: new Date().toISOString(),
    }).eq('id', req.params.id);

    console.log(`[Dispute] #${req.params.id} resolved as ${resolution}. Engineer payout: $${engineerPayout}, employer refund: $${stripeRefundId ? employerRefund : 0}`);
    res.json({
      status: 'ok', resolution,
      engineer_payout: engineerPayout,
      employer_refund: stripeRefundId ? employerRefund : 0,
      stripe_transfer_id: stripeTransferId,
      stripe_refund_id: stripeRefundId,
      ...(refundFailed && { refund_error: 'Engineer payout succeeded but employer refund failed — resolve manually in Stripe.' }),
    });
  } catch (err) {
    console.error('[Disputes] Resolve error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
