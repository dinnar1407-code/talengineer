const express = require('express');
const crypto = require('crypto'); // 用于生成 Stripe 幂等键的随机后缀
const router = express.Router();
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { emailMilestoneFunded, emailMilestoneReleased, emailPaymentFailed } = require('../services/email');
const { createNotification } = require('../services/notificationService');

// 统一 Stripe 工厂（固定 apiVersion，见 src/config/stripe.js）
const stripe = require('../config/stripe').getStripe();

const { PLATFORM_FEE, feeFor } = require('../config/fees'); // 全局费率 + 单需求覆盖（founding 让利经 demands.fee_pct）
const { sendPayout } = require('../services/payout'); // 放款 provider 抽象（stripe/manual/payoneer）

// ── Get platform fee rate (public) ────────────────────────────────────────────
// 返回当前平台抽佣比例，供前端透明展示"抽佣后到手金额"。
// 无需鉴权：这只是一个公开的比例常量（不涉及任何用户数据或资金操作），
// 而且前端必须从后端取这个值，避免页面里硬编码 15% 与 fees.js 配置漂移。
router.get('/fee-rate', (req, res) => {
  res.json({ platform_fee: PLATFORM_FEE });
});

// ── Fund Milestone ────────────────────────────────────────────────────────────
// Creates a real Stripe Checkout Session. The milestone is only marked 'funded'
// after Stripe confirms payment (webhook / verified confirm-funding).
router.post('/fund-milestone', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { milestone_id, demand_id, phase_name } = req.body;

    if (!milestone_id || !demand_id) {
      return res.status(400).json({ error: 'Missing milestone_id or demand_id' });
    }

    // ── Idempotency check: already funded? ──────────────────────────────────
    const { data: existing, error: fetchErr } = await supabase
      .from('project_milestones')
      .select('id, status, amount, phase_name, demand_id')
      .eq('id', milestone_id)
      .single();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    // 归属校验：body 传入的 demand_id 必须与里程碑在库中的真实归属一致，防止跨项目伪造参数
    if (String(existing.demand_id) !== String(demand_id)) {
      return res.status(400).json({ error: 'demand_id does not match this milestone' });
    }

    // 仅该项目的雇主本人才能为里程碑发起托管支付
    const { data: ownerDemand, error: ownerErr } = await supabase
      .from('demands')
      .select('employer_id')
      .eq('id', demand_id)
      .single();
    if (ownerErr || !ownerDemand) return res.status(404).json({ error: 'Project not found' });
    if (ownerDemand.employer_id !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    if (existing.status === 'funded' || existing.status === 'released') {
      return res.json({
        status: 'ok',
        idempotent: true,
        message: `Milestone already ${existing.status}. No action taken.`,
      });
    }

    // 状态机校验：只有 locked（待托管）或 payment_failed（付款失败重试）才允许发起支付，
    // 其他状态（releasing/disputed/completed 等）创建支付会话会导致扣款但状态不变
    if (existing.status !== 'locked' && existing.status !== 'payment_failed') {
      return res.status(409).json({ error: `Cannot fund milestone with status: ${existing.status}. Must be 'locked' or 'payment_failed'.` });
    }

    // 金额以数据库里的托管额为准，不信任客户端传入的 amount，防止少付多标
    const escrowAmount = parseFloat(existing.amount);
    if (!escrowAmount || escrowAmount <= 0) {
      return res.status(400).json({ error: 'Invalid milestone amount' });
    }

    // ── Create Stripe Checkout Session ──────────────────────────────────────
    // 必须真实收款：这里只创建支付会话，funded 状态仅由 webhook/confirm-funding
    // 在 Stripe 确认 payment_status==='paid' 后写入，杜绝凭空标记托管
    // 默认域名与 workorder.js 保持一致，避免生产环境漏配 DOMAIN 时回跳到 localhost
    const domain = process.env.DOMAIN || 'https://talengineer.us';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Milestone Escrow: ${phase_name || existing.phase_name || `Milestone #${milestone_id}`}` },
          unit_amount: Math.round(escrowAmount * 100), // cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: { milestone_id: String(milestone_id), demand_id: String(demand_id) },
      payment_intent_data: { metadata: { milestone_id: String(milestone_id), demand_id: String(demand_id) } },
      success_url: `${domain}/finance?session_id={CHECKOUT_SESSION_ID}&milestone_id=${milestone_id}&demand_id=${demand_id}`,
      cancel_url: `${domain}/finance?canceled=true`,
    });

    res.json({
      status: 'ok',
      url: session.url,
      session_id: session.id,
      message: `Redirecting to Stripe Checkout: $${escrowAmount} for [${phase_name || existing.phase_name}].`,
    });

  } catch (err) {
    console.error('[Payment] Fund milestone error:', err);
    res.status(500).json({ error: 'Failed to fund milestone. Please try again.' });
  }
});

// ── Release Milestone ─────────────────────────────────────────────────────────
router.post('/release-milestone', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { milestone_id, demand_id } = req.body;

    if (!milestone_id || !demand_id) {
      return res.status(400).json({ error: 'Missing milestone_id or demand_id' });
    }

    // ── Idempotency check: already released? ────────────────────────────────
    const { data: milestone, error: msErr } = await supabase
      .from('project_milestones')
      .select('id, status, amount, phase_name, stripe_transfer_id')
      .eq('id', milestone_id)
      .single();

    if (msErr || !milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    if (milestone.status === 'released') {
      return res.json({
        status: 'ok',
        idempotent: true,
        message: 'Milestone already released. No duplicate transfer made.',
        stripe_transfer_id: milestone.stripe_transfer_id,
      });
    }

    if (milestone.status !== 'funded') {
      return res.status(400).json({ error: `Cannot release milestone with status: ${milestone.status}. Must be 'funded' first.` });
    }

    // ── Verify requester is the employer for this demand ────────────────────
    // fee_pct 一并取出：费率必须在 demand 就位后才能确定（单需求覆盖 → 全局回退）
    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .select('employer_id, assigned_engineer_id, fee_pct')
      .eq('id', demand_id)
      .single();
    if (demandErr || !demand) return res.status(404).json({ error: 'Project not found' });
    if (demand.employer_id !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    // ── Calculate payout（费率经 feeFor：founding 客户可为单需求设 fee_pct）──────
    const totalAmount = parseFloat(milestone.amount) || 0;
    const platformFee = totalAmount * feeFor(demand);
    const engineerPayout = totalAmount - platformFee;

    // ── Atomically claim the release (race condition guard) ─────────────────
    // 条件更新抢占放款资格：并发请求中只有一个能把 funded 改成 releasing，防止重复转账
    const { data: claimed, error: claimErr } = await supabase
      .from('project_milestones')
      .update({ status: 'releasing' })
      .eq('id', milestone_id)
      .eq('status', 'funded')
      .select('id');
    if (claimErr) throw claimErr;
    if (!claimed || claimed.length === 0) {
      return res.status(409).json({ error: 'Milestone release already in progress or completed. Please refresh.' });
    }

    let stripeTransferId = null;
    let manualPayoutId   = null;

    try {
      if (demand?.assigned_engineer_id && process.env.STRIPE_SECRET_KEY) {
        const { data: talent } = await supabase
          .from('talents')
          .select('id, stripe_account_id, payout_provider')
          .eq('id', demand.assigned_engineer_id)
          .single();

        // 放款经 provider 抽象分发（stripe 转账 / manual 登记线下打款 / payoneer 未配置抛错）。
        // 幂等键语义不变：并发防重靠 funded→releasing 原子抢占，随机后缀避免失败重试被旧幂等记录卡住。
        const payoutResult = await sendPayout({
          supabase, stripe, talent,
          milestone: { id: milestone_id },
          amount: engineerPayout,
          description: `TalEngineer payout: ${milestone.phase_name}`,
          metadata: { milestone_id, demand_id },
          idempotencyKey: `release-${milestone_id}-${crypto.randomUUID()}`,
        });
        stripeTransferId = payoutResult.transferId;
        manualPayoutId   = payoutResult.manualPayoutId;
        if (stripeTransferId) console.log(`[Payment] Stripe transfer ${stripeTransferId}: $${engineerPayout}`);
        if (manualPayoutId)   console.log(`[Payment] Manual payout #${manualPayoutId} registered: $${engineerPayout} (offline processing)`);
      } else {
        console.log(`[Payment] Skipping payout — no engineer assigned or Stripe key missing. Payout: $${engineerPayout}`);
      }
    } catch (transferErr) {
      // 转账失败回滚为 funded，释放守卫以便后续重试
      const { error: rollbackErr } = await supabase
        .from('project_milestones')
        .update({ status: 'funded' })
        .eq('id', milestone_id)
        .eq('status', 'releasing');
      // 回滚失败会让里程碑永久卡在 releasing 无法重试放款，必须 CRITICAL 告警人工修库
      if (rollbackErr) {
        console.error(`[Payment] CRITICAL: failed to roll back milestone ${milestone_id} from 'releasing' to 'funded' after transfer error: ${rollbackErr.message}`);
      }
      throw transferErr;
    }

    // ── Mark as released (store transfer ID for idempotency) ────────────────
    const { data: finalized, error: finalErr } = await supabase
      .from('project_milestones')
      .update({
        status: 'released',
        ...(stripeTransferId && { stripe_transfer_id: stripeTransferId }),
      })
      .eq('id', milestone_id)
      .eq('status', 'releasing') // only the request holding the claim finalizes
      .select('id');
    // 转账已发生但落库失败/0 行会造成资金已出、状态未变，必须告警以便人工修库（含 transfer id）
    if (finalErr || !finalized || finalized.length === 0) {
      console.error(`[Payment] CRITICAL: transfer succeeded but failed to mark milestone ${milestone_id} as released. transfer=${stripeTransferId || 'none'}, error=${finalErr?.message || 'no rows updated'}`);
    }

    console.log(`[Payment] Milestone ${milestone_id} released. Total: $${totalAmount}, Fee: $${platformFee}, Payout: $${engineerPayout}`);

    // Notify engineer (email + in-app)；manual provider 文案注明线下打款处理中
    if (demand?.assigned_engineer_id) {
      const { data: talent } = await supabase.from('talents').select('name, contact').eq('id', demand.assigned_engineer_id).single();
      if (talent?.contact) {
        emailMilestoneReleased({ engineerEmail: talent.contact, engineerName: talent.name, phaseName: milestone.phase_name, payout: engineerPayout }).catch(console.error);
        createNotification({
          user_email: talent.contact,
          type: 'milestone_released',
          title: `Funds released: ${milestone.phase_name}`,
          body: manualPayoutId
            ? `$${engineerPayout.toFixed(2)} approved — offline payout is being processed by the platform.`
            : `$${engineerPayout.toFixed(2)} has been sent to your Stripe account.`,
          link: `/workorder/${milestone_id}`,
          demand_id: parseInt(demand_id),
        });
      }
    }

    // fire-and-forget 触发：企业 webhook + TalScore 重算（模块由并行任务落盘，惰性 require 全捕获，绝不影响放款主流程）
    try {
      const { dispatchWebhook } = require('../services/webhookService');
      dispatchWebhook(supabase, { userId: demand.employer_id, event: 'milestone.released', payload: { milestone_id, demand_id, payout: engineerPayout } }).catch(() => {});
    } catch { /* webhookService 尚未就绪 */ }
    try {
      const { recomputeTalScore } = require('../services/talScore');
      if (demand?.assigned_engineer_id) recomputeTalScore(supabase, demand.assigned_engineer_id).catch(() => {});
    } catch { /* talScore 尚未就绪 */ }

    res.json({
      status: 'ok',
      payout_details: {
        total: totalAmount,
        platform_fee: platformFee,
        engineer_payout: engineerPayout,
      },
      stripe_transfer_id: stripeTransferId,
      message: `Funds released. Platform fee: $${platformFee.toFixed(2)}.`,
    });

  } catch (err) {
    console.error('[Payment] Release milestone error:', err);
    res.status(500).json({ error: 'Failed to release milestone. Please try again.' });
  }
});

// ── Stripe Webhook ────────────────────────────────────────────────────────────
// Must be mounted BEFORE express.json() — uses raw body
router.post('/webhook', async (req, res) => {
  const sig    = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    // fail-closed：未配置签名密钥时返回 503 让 Stripe 重试，而不是静默吞掉事件导致漏单
    console.error('[Webhook] STRIPE_WEBHOOK_SECRET not set — rejecting webhook so Stripe will retry.');
    return res.status(503).json({ error: 'Webhook not configured: STRIPE_WEBHOOK_SECRET missing' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, secret);
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = getClient();

  if (event.type === 'checkout.session.completed') {
    const session    = event.data.object;
    const milestoneId = session.metadata?.milestone_id;

    if (milestoneId) {
      // 条件更新：locked 与 payment_failed（付款失败后重试）都是合法的待付款状态；
      // 同时取回 demand_id，后续以 DB 中的真实归属为准，不信任 metadata.demand_id
      // 落盘 payment_intent：纠纷判雇主时按它原路退款（refunds.create 需要）
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null;
      const { data: fundedRows, error: fundErr } = await supabase
        .from('project_milestones')
        .update({ status: 'funded', ...(paymentIntentId && { stripe_payment_intent: paymentIntentId }) })
        .eq('id', milestoneId)
        .in('status', ['locked', 'payment_failed'])
        .select('id, demand_id');
      if (fundErr) {
        // 落库失败返回 500 让 Stripe 重试，避免已收款但状态未更新
        console.error(`[Webhook] Failed to mark milestone ${milestoneId} as funded:`, fundErr.message);
        return res.status(500).json({ error: 'Failed to update milestone status' });
      }
      if (!fundedRows || fundedRows.length === 0) {
        // 0 行说明里程碑不在可付款状态（重复事件或状态机异常），告警并跳过后续通知，防止重复事件重复发信
        console.error(`[Webhook] checkout.session.completed for milestone ${milestoneId} updated 0 rows — milestone not in locked/payment_failed state.`);
      } else {
        // 使用 DB 查出的真实 demand_id 更新需求状态，metadata 可能被构造或与里程碑不符
        const realDemandId = fundedRows[0].demand_id;
        if (realDemandId) {
          await supabase
            .from('demands')
            .update({ status: 'in_progress' })
            .eq('id', realDemandId);
        }

        console.log(`[Webhook] Milestone ${milestoneId} funded via Stripe webhook.`);

        // fire-and-forget 企业 webhook（惰性 require，绝不影响入账主流程）
        try {
          const { data: dOwner } = await supabase.from('demands').select('employer_id').eq('id', realDemandId).single();
          if (dOwner?.employer_id) {
            const { dispatchWebhook } = require('../services/webhookService');
            dispatchWebhook(supabase, { userId: dOwner.employer_id, event: 'milestone.funded', payload: { milestone_id: milestoneId, demand_id: realDemandId } }).catch(() => {});
          }
        } catch { /* webhookService 尚未就绪 */ }

        // Notify assigned engineer
        if (realDemandId) {
          const { data: demand } = await supabase.from('demands').select('title, assigned_engineer_id').eq('id', realDemandId).single();
          if (demand?.assigned_engineer_id) {
            const { data: talent } = await supabase.from('talents').select('name, contact').eq('id', demand.assigned_engineer_id).single();
            const { data: ms } = await supabase.from('project_milestones').select('phase_name, amount').eq('id', milestoneId).single();
            if (talent?.contact && ms) {
              emailMilestoneFunded({ engineerEmail: talent.contact, engineerName: talent.name, projectTitle: demand.title, phaseName: ms.phase_name, amount: ms.amount }).catch(console.error);
              createNotification({
                user_email: talent.contact,
                type: 'milestone_funded',
                title: `Milestone funded: ${ms.phase_name}`,
                body: `$${ms.amount} is now held in escrow for "${demand.title}". You can check in to begin work.`,
                link: `/workorder/${milestoneId}`,
                demand_id: parseInt(realDemandId),
              });
            }
          }
        }
      }
    }
  }

  // ── Payment failed ──────────────────────────────────────────────────────────
  if (event.type === 'payment_intent.payment_failed') {
    const intent      = event.data.object;
    const milestoneId = intent.metadata?.milestone_id;
    const demandId    = intent.metadata?.demand_id;

    if (milestoneId) {
      await supabase
        .from('project_milestones')
        .update({ status: 'payment_failed' })
        .eq('id', milestoneId)
        .eq('status', 'locked');

      console.warn(`[Webhook] Payment failed for milestone ${milestoneId}. Reason: ${intent.last_payment_error?.message}`);
    }

    if (demandId) {
      await supabase
        .from('demands')
        .update({ status: 'payment_failed' })
        .eq('id', demandId)
        .eq('status', 'open');
    }

    // Notify employer
    if (milestoneId) {
      const { data: ms } = await supabase.from('project_milestones').select('phase_name, demand_id').eq('id', milestoneId).single();
      if (ms) {
        const { data: demand } = await supabase.from('demands').select('title, contact').eq('id', ms.demand_id).single();
        if (demand?.contact) {
          emailPaymentFailed({ employerEmail: demand.contact, projectTitle: demand.title, phaseName: ms.phase_name }).catch(console.error);
        }
      }
    }
  }

  // ── Dispute (chargeback) created ────────────────────────────────────────────
  if (event.type === 'charge.dispute.created') {
    const dispute     = event.data.object;
    const milestoneId = dispute.metadata?.milestone_id;

    // Freeze any funded milestone tied to this charge
    if (milestoneId) {
      await supabase
        .from('project_milestones')
        .update({ status: 'disputed' })
        .eq('id', milestoneId)
        .in('status', ['funded', 'locked']);
    }

    console.error(`[Webhook] Dispute created — charge ${dispute.charge}, amount $${(dispute.amount / 100).toFixed(2)}, reason: ${dispute.reason}`);
  }

  // ── Transfer failed (engineer payout failed) ────────────────────────────────
  if (event.type === 'transfer.failed') {
    const transfer    = event.data.object;
    const milestoneId = transfer.metadata?.milestone_id;

    if (milestoneId) {
      // Roll back to funded so it can be retried
      await supabase
        .from('project_milestones')
        .update({ status: 'funded', stripe_transfer_id: null })
        .eq('id', milestoneId)
        .eq('status', 'released');
    }

    console.error(`[Webhook] Transfer failed — ${transfer.id}, milestone ${milestoneId || 'unknown'}`);
  }

  res.json({ received: true });
});

// ── Confirm funding (legacy client-side fallback) ─────────────────────────────
router.post('/confirm-funding', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { session_id, milestone_id } = req.body;
    if (!session_id || !milestone_id) return res.status(400).json({ error: 'Missing params' });

    // 必须向 Stripe 核实该 session 真实存在且已支付，杜绝凭 milestone_id 伪造托管状态
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(session_id);
    } catch (stripeErr) {
      return res.status(400).json({ error: 'Invalid Stripe session' });
    }
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed for this session' });
    }
    // session 必须是为该里程碑创建的，防止复用其他订单的已付 session
    if (String(session.metadata?.milestone_id) !== String(milestone_id)) {
      return res.status(400).json({ error: 'Session does not match this milestone' });
    }

    const { data: milestone, error: msErr } = await supabase
      .from('project_milestones')
      .select('id, status, amount, demand_id')
      .eq('id', milestone_id)
      .single();
    if (msErr || !milestone) return res.status(404).json({ error: 'Milestone not found' });

    // 实付金额必须与里程碑托管额一致，防止小额支付标记大额托管
    if (session.amount_total !== Math.round(parseFloat(milestone.amount) * 100)) {
      return res.status(400).json({ error: 'Paid amount does not match milestone amount' });
    }

    // 仅该 demand 的雇主本人可确认托管
    const { data: demand, error: demandErr } = await supabase
      .from('demands')
      .select('employer_id')
      .eq('id', milestone.demand_id)
      .single();
    if (demandErr || !demand) return res.status(404).json({ error: 'Project not found' });
    if (demand.employer_id !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    // 条件更新：locked 与 payment_failed（重试）都允许转 funded，并用 .select() 校验实际生效行数
    // 同步落盘 payment_intent（与 webhook 路径一致），供纠纷判雇主时原路退款
    const confirmIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null;
    const { data: confirmedRows, error: confirmErr } = await supabase
      .from('project_milestones')
      .update({ status: 'funded', ...(confirmIntentId && { stripe_payment_intent: confirmIntentId }) })
      .eq('id', milestone_id)
      .in('status', ['locked', 'payment_failed'])
      .select('id');
    if (confirmErr) {
      console.error(`[Payment] confirm-funding DB error for milestone ${milestone_id}:`, confirmErr.message);
      return res.status(500).json({ error: 'Failed to update milestone status' });
    }
    if (!confirmedRows || confirmedRows.length === 0) {
      // 竞态兜底：0 行可能是 webhook 已抢先入账，再查一次当前状态区分"已成功"与"非法状态"
      const { data: current } = await supabase
        .from('project_milestones')
        .select('status')
        .eq('id', milestone_id)
        .single();
      if (current && ['funded', 'releasing', 'released'].includes(current.status)) {
        // 资金确已入账（webhook 先到），幂等返回成功让前端正常显示，而非误报 409
        return res.json({ ok: true, idempotent: true });
      }
      // 其他状态才是真正的异常（如 disputed），返回 409 而非假装成功
      console.error(`[Payment] confirm-funding for milestone ${milestone_id} updated 0 rows — not in locked/payment_failed state (current: ${current?.status || 'unknown'}).`);
      return res.status(409).json({ error: 'Milestone is not awaiting funding (already funded or in another state).' });
    }
    await supabase.from('demands').update({ status: 'in_progress' }).eq('id', milestone.demand_id);

    res.json({ status: 'ok' });
  } catch (err) {
    // 真实错误记录到日志，客户端只收到通用文案
    console.error('[payment]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
