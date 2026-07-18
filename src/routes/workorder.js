const express = require('express');
const router  = express.Router();
const crypto  = require('crypto'); // 用于生成放款幂等键的随机后缀
const { getClient } = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { assertDemandParticipant } = require('../middleware/ownership');
const { emailMilestoneReleased, emailRequestReview } = require('../services/email');
const { createNotification } = require('../services/notificationService');
const { checkAssignEligibility } = require('../services/certService'); // 认证兜底门禁（到场开工前二道防线）
const { geofenceCheck } = require('../utils/geo'); // GPS 签到围栏：服务端算距离，警示不拦截

// 统一 Stripe 工厂（固定 apiVersion，见 src/config/stripe.js）
const stripe = require('../config/stripe').getStripe();
const { feeFor } = require('../config/fees'); // 费率：demands.fee_pct 覆盖（founding 让利）→ 回退全局 PLATFORM_FEE
const { sendPayout } = require('../services/payout'); // 放款 provider 抽象（stripe/manual/payoneer）

// ── Get work order status for a milestone ─────────────────────────────────────
router.get('/:milestoneId', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    // 注意：嵌套 select 去掉了 demands 上不存在的列 assigned_engineer_id（原值会让查询 500）。
    const { data: ms } = await supabase
      .from('project_milestones')
      .select('*, demands(id, title, description)')
      .eq('id', req.params.milestoneId)
      .single();

    if (!ms) return res.status(404).json({ error: 'Milestone not found' });

    // ── 归属校验：工单含项目细节，仅该 demand 的当事方/admin 可读 ────────────
    // 防 IDOR：原路由完全无鉴权，任意人改 milestoneId 即可读他人工单。
    const { allowed, demand } = await assertDemandParticipant(supabase, ms.demand_id, req.user);
    if (!demand) return res.status(404).json({ error: 'Project not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const { data: checkin } = await supabase
      .from('work_order_checkins')
      .select('*')
      .eq('milestone_id', req.params.milestoneId)
      .single();

    res.json({ status: 'ok', milestone: ms, checkin: checkin || null });
  } catch (err) {
    // 真实错误记录到日志(供 Sentry/排查)，客户端只收到通用文案，避免泄露数据库/内部细节
    console.error('[workorder]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Engineer: check in ────────────────────────────────────────────────────────
router.post('/:milestoneId/checkin', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { lat, lng } = req.body;

    const { data: talent } = await supabase.from('talents').select('id').eq('user_id', req.user.userId).single();
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found' });

    const { data: ms } = await supabase.from('project_milestones').select('id, demand_id, status').eq('id', req.params.milestoneId).single();
    if (!ms) return res.status(404).json({ error: 'Milestone not found' });
    if (ms.status !== 'funded') return res.status(400).json({ error: 'Milestone must be funded before check-in.' });

    // ── 认证兜底门禁（培训认证模块）────────────────────────────────────────────
    // 主门禁在 demand.js assign；这里是到场开工前的第二道防线，防历史指派/证被吊销后
    // 仍然开工。规则同 assign：持有效平台认证，需求指定方向则须持该方向。
    const { data: gateDemand } = await supabase.from('demands')
      .select('required_cert_track, site_lat, site_lng, site_radius_m').eq('id', ms.demand_id).single();
    const eligibility = await checkAssignEligibility(supabase, talent.id, gateDemand?.required_cert_track || null);
    if (!eligibility.allowed) {
      return res.status(403).json({
        error: 'A valid platform certification is required before on-site check-in. Get certified at /training.',
        reason: eligibility.reason,
      });
    }

    // ── GPS 围栏：与需求站点坐标比对（服务端计算防伪造）。策略 = 警示不拦截：
    // 厂房内 GPS 漂移常见，越界签到照常成功，仅落库标记供雇主/admin 查看。
    const fence = geofenceCheck({
      siteLat: gateDemand?.site_lat, siteLng: gateDemand?.site_lng,
      radiusM: gateDemand?.site_radius_m, lat, lng,
    });

    const { data, error } = await supabase.from('work_order_checkins').upsert({
      milestone_id: parseInt(req.params.milestoneId),
      demand_id: ms.demand_id,
      engineer_id: talent.id,
      checkin_lat: lat || null,
      checkin_lng: lng || null,
      distance_m: fence.distanceM,
      geofence_ok: fence.ok,
      status: 'checked_in',
    }, { onConflict: 'milestone_id,engineer_id' }).select().single();

    if (error) throw error;
    res.json({ status: 'ok', data, fence });
  } catch (err) {
    // 真实错误记录到日志(供 Sentry/排查)，客户端只收到通用文案，避免泄露数据库/内部细节
    console.error('[workorder]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Engineer: submit completion ───────────────────────────────────────────────
router.post('/:milestoneId/complete', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();
    const { notes, photos } = req.body;

    const { data: talent } = await supabase.from('talents').select('id').eq('user_id', req.user.userId).single();
    if (!talent) return res.status(404).json({ error: 'Engineer profile not found' });

    const { data, error } = await supabase
      .from('work_order_checkins')
      .update({ completion_notes: notes || '', photos: photos || [], status: 'completed', checkout_time: new Date().toISOString() })
      .eq('milestone_id', req.params.milestoneId)
      .eq('engineer_id', talent.id)
      .select().single();

    if (error) throw error;
    res.json({ status: 'ok', data });
  } catch (err) {
    // 真实错误记录到日志(供 Sentry/排查)，客户端只收到通用文案，避免泄露数据库/内部细节
    console.error('[workorder]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Employer: approve completion → release funds ──────────────────────────────
router.post('/:milestoneId/approve', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    const { data: ms } = await supabase
      .from('project_milestones')
      .select('id, amount, phase_name, demand_id, stripe_transfer_id, status')
      .eq('id', req.params.milestoneId)
      .single();

    if (!ms) return res.status(404).json({ error: 'Milestone not found' });
    if (ms.status === 'released') return res.json({ status: 'ok', idempotent: true });

    // ── Verify requester is the employer for this demand ────────────────────
    // 放款是雇主专属操作：校验调用者就是该需求的雇主，防止任意登录用户越权放款
    const { data: demand, error: demandErr } = await supabase.from('demands').select('employer_id, assigned_engineer_id, fee_pct').eq('id', ms.demand_id).single();
    if (demandErr || !demand) return res.status(404).json({ error: 'Project not found' });
    if (demand.employer_id !== req.user.userId) return res.status(403).json({ error: 'Forbidden' });

    const { data: checkin } = await supabase.from('work_order_checkins').select('*').eq('milestone_id', req.params.milestoneId).eq('status', 'completed').single();
    if (!checkin) return res.status(400).json({ error: 'Engineer has not submitted work for review yet.' });

    const totalAmount   = parseFloat(ms.amount) || 0;
    const engineerPayout = totalAmount * (1 - feeFor(demand)); // 费率支持单需求覆盖（founding 让利）

    // ── Idempotency guard: atomically claim the milestone before transferring ──
    // 原子抢占：仅当仍为 funded 时置为中间态 releasing（而非直接 released），并发重复请求抢不到行直接退出；
    // 进程若在转账前崩溃，状态停在 releasing 可被发现处理，不会被标成 released 造成静默漏付
    const { data: claimed, error: claimErr } = await supabase
      .from('project_milestones')
      .update({ status: 'releasing' })
      .eq('id', ms.id)
      .eq('status', 'funded') // only claim if still funded (race condition guard)
      .select('id');
    if (claimErr) throw claimErr;
    if (!claimed?.length) {
      return res.status(409).json({ error: 'Milestone is not in funded status or is already being released.' });
    }

    // 抢占成功后才生成幂等键：并发安全由 funded→releasing 原子抢占保证，随机后缀避免失败重试被 Stripe 旧幂等记录卡住
    const idempotencyKey = `release-${ms.id}-${crypto.randomUUID()}`;

    let stripeTransferId = null;
    let manualPayoutId   = null;

    if (demand?.assigned_engineer_id && process.env.STRIPE_SECRET_KEY) {
      const { data: talent } = await supabase.from('talents').select('id, stripe_account_id, payout_provider, name, contact').eq('id', demand.assigned_engineer_id).single();
      try {
        // 放款经 provider 抽象分发（stripe 转账 / manual 登记线下打款 / payoneer 未配置抛错）
        const payoutResult = await sendPayout({
          supabase, stripe, talent,
          milestone: { id: ms.id },
          amount: engineerPayout,
          description: `TalEngineer payout: ${ms.phase_name}`,
          metadata: { milestone_id: String(ms.id), demand_id: String(ms.demand_id) },
          idempotencyKey,
        });
        stripeTransferId = payoutResult.transferId;
        manualPayoutId   = payoutResult.manualPayoutId;
      } catch (transferErr) {
        // 放款失败回滚 releasing→funded，释放守卫以便后续重试，避免标记放款却没有真实打款
        const { error: rollbackErr } = await supabase.from('project_milestones').update({ status: 'funded' }).eq('id', ms.id).eq('status', 'releasing');
        // 回滚失败会让里程碑卡死在 releasing（无人能重试放款），必须高优先级告警人工修库
        if (rollbackErr) {
          console.error(`[WorkOrder] CRITICAL: failed to roll back milestone ${ms.id} from releasing to funded:`, rollbackErr.message);
        }
        throw transferErr;
      }
      if (stripeTransferId || manualPayoutId) {
        emailMilestoneReleased({ engineerEmail: talent.contact, engineerName: talent.name, phaseName: ms.phase_name, payout: engineerPayout }).catch(console.error);
      }
      // In-app: notify engineer of payout；manual provider 文案注明线下打款处理中
      if (talent?.contact) {
        createNotification({
          user_email: talent.contact,
          type: 'milestone_released',
          title: `Funds released: ${ms.phase_name}`,
          body: manualPayoutId
            ? `$${engineerPayout.toFixed(2)} approved — offline payout is being processed by the platform.`
            : `$${engineerPayout.toFixed(2)} has been sent to your Stripe account.`,
          link: `/workorder/${ms.id}`,
          demand_id: ms.demand_id,
        });
        // 双向评价入口：结算后提示工程师评价本次合作的雇主
        createNotification({
          user_email: talent.contact,
          type: 'review_employer',
          title: '评价这次合作的雇主',
          link: `/project/${ms.demand_id}`,
          demand_id: ms.demand_id,
        });
      }
    }

    // 转账成功后才终结状态：.eq('status','releasing') 守卫确保只有持有抢占权的请求能落库 released
    const { data: finalized, error: finalizeErr } = await supabase
      .from('project_milestones')
      .update({ status: 'released', ...(stripeTransferId && { stripe_transfer_id: stripeTransferId }) })
      .eq('id', ms.id)
      .eq('status', 'releasing')
      .select('id');
    // 资金已转出但状态未落库（error 或 0 行命中均算失败，与 payment.js 一致）：高优先级告警，需人工核对该里程碑
    if (finalizeErr || !finalized || finalized.length === 0) {
      console.error(`[WorkOrder] CRITICAL: milestone ${ms.id} transfer ${stripeTransferId || 'n/a'} succeeded but finalize to released failed:`, finalizeErr?.message || 'no rows updated');
    }
    await supabase.from('work_order_checkins').update({ status: 'approved' }).eq('milestone_id', ms.id);

    // fire-and-forget 触发：企业 webhook + TalScore 重算（模块由并行任务落盘，惰性 require 全捕获，绝不影响放款主流程）
    try {
      const { dispatchWebhook } = require('../services/webhookService');
      dispatchWebhook(supabase, { userId: demand.employer_id, event: 'milestone.released', payload: { milestone_id: ms.id, demand_id: ms.demand_id, payout: engineerPayout } }).catch(() => {});
    } catch { /* webhookService 尚未就绪 */ }
    try {
      const { recomputeTalScore } = require('../services/talScore');
      if (demand?.assigned_engineer_id) recomputeTalScore(supabase, demand.assigned_engineer_id).catch(() => {});
    } catch { /* talScore 尚未就绪 */ }

    // Send review request email to employer
    const DOMAIN = process.env.DOMAIN || 'https://talengineer.us';
    const { data: demandFull } = await supabase.from('demands').select('title, users(email), assigned_engineer_id').eq('id', ms.demand_id).single();
    if (demandFull?.users?.email && demand?.assigned_engineer_id) {
      const { data: engineerForReview } = await supabase.from('talents').select('id, name').eq('id', demand.assigned_engineer_id).single();
      if (engineerForReview) {
        emailRequestReview({
          employerEmail: demandFull.users.email,
          engineerName:  engineerForReview.name,
          projectTitle:  demandFull.title,
          reviewUrl:     `${DOMAIN}/engineer/${engineerForReview.id}?review=1&demand_id=${ms.demand_id}`,
        }).catch(console.error);
      }
    }

    res.json({ status: 'ok', payout: engineerPayout, stripe_transfer_id: stripeTransferId, demand_id: ms.demand_id });
  } catch (err) {
    // 真实错误记录到日志(供 Sentry/排查)，客户端只收到通用文案，避免泄露数据库/内部细节
    console.error('[workorder]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ── Generate work order PDF (HTML print page) ─────────────────────────────────
router.get('/:milestoneId/pdf', requireAuth, async (req, res) => {
  try {
    const supabase = getClient();

    // 注意：嵌套 select 去掉了 demands 上不存在的列 assigned_engineer_id（原值会让查询 500）。
    const { data: ms } = await supabase
      .from('project_milestones')
      .select('*, demands(id, title, description, region, contact)')
      .eq('id', req.params.milestoneId)
      .single();

    if (!ms) return res.status(404).json({ error: 'Milestone not found' });

    // ── 归属校验：工单 PDF 含金额/联系方式，仅该 demand 的当事方/admin 可下载 ──
    // 防 IDOR：原路由完全无鉴权，任意人改 milestoneId 即可拉取他人工单 PDF。
    const { allowed, demand } = await assertDemandParticipant(supabase, ms.demand_id, req.user);
    if (!demand) return res.status(404).json({ error: 'Project not found' });
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const { data: checkin } = await supabase
      .from('work_order_checkins')
      .select('*')
      .eq('milestone_id', req.params.milestoneId)
      .single();

    // 工程师信息：demands 没有 assigned_engineer_id 列，改为通过 demand_applications
    // 反查"已被指派（status=accepted）"的工程师 talent.id，再取其姓名/联系方式。
    let engineerName = 'N/A', engineerContact = '';
    const { data: acceptedApp } = await supabase
      .from('demand_applications')
      .select('engineer_id')
      .eq('demand_id', ms.demand_id)
      .eq('status', 'accepted')
      .maybeSingle();
    if (acceptedApp?.engineer_id) {
      const { data: talent } = await supabase.from('talents').select('name, contact').eq('id', acceptedApp.engineer_id).single();
      if (talent) { engineerName = talent.name; engineerContact = talent.contact; }
    }

    // 单据费率与实际放款一致：取 demand.fee_pct（founding 覆盖）→ 回退全局
    const { data: pdfDemand } = await supabase.from('demands').select('fee_pct').eq('id', ms.demand_id).single();
    const totalAmount    = parseFloat(ms.amount) || 0;
    const platformFee    = totalAmount * feeFor(pdfDemand);
    const engineerPayout = totalAmount - platformFee;

    const fmt = (d) => d ? new Date(d).toLocaleString() : 'N/A';
    const statusLabel = { locked: 'Pending', funded: 'Funded — In Escrow', released: 'Released', completed: 'Completed' };

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Work Order #${ms.id} — TalEngineer</title>
<style>
  @page { size: A4; margin: 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111; background: #fff; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0056b3; padding-bottom: 16px; margin-bottom: 24px; }
  .logo { font-size: 20px; font-weight: 800; color: #0056b3; }
  .doc-title { font-size: 13px; color: #6b7280; text-align: right; }
  .doc-id { font-size: 18px; font-weight: 700; color: #111; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .field label { font-size: 11px; color: #6b7280; display: block; margin-bottom: 2px; }
  .field span { font-size: 13px; font-weight: 600; }
  .amounts { background: #f8f9fa; border-radius: 8px; padding: 16px; }
  .amount-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb; }
  .amount-row:last-child { border: none; font-weight: 700; font-size: 15px; padding-top: 8px; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: rgba(0,86,179,.1); color: #0056b3; }
  .notes-box { background: #f8f9fa; border-radius: 6px; padding: 12px; font-size: 12px; line-height: 1.6; white-space: pre-wrap; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  .sig-block { min-height: 60px; border-bottom: 1px solid #111; padding-bottom: 4px; margin-bottom: 6px; }
  .sig-label { font-size: 11px; color: #6b7280; }
  .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #9ca3af; }
  @media print { body { print-color-adjust: exact; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">⚙️ TalEngineer</div>
    <div style="font-size:11px;color:#6b7280;margin-top:4px;">talengineer.us</div>
  </div>
  <div class="doc-title">
    <div>WORK ORDER</div>
    <div class="doc-id">#WO-${String(ms.id).padStart(5, '0')}</div>
    <div style="margin-top:4px;">Generated: ${fmt(new Date())}</div>
  </div>
</div>

<div class="section">
  <div class="section-title">Project Details</div>
  <div class="grid">
    <div class="field"><label>Project Title</label><span>${ms.demands?.title || 'N/A'}</span></div>
    <div class="field"><label>Region</label><span>${ms.demands?.region || 'N/A'}</span></div>
    <div class="field"><label>Milestone</label><span>${ms.phase_name}</span></div>
    <div class="field"><label>Status</label><span class="status-badge">${statusLabel[ms.status] || ms.status}</span></div>
    <div class="field"><label>Project ID</label><span>#${ms.demands?.id || 'N/A'}</span></div>
    <div class="field"><label>Milestone ID</label><span>#${ms.id}</span></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Parties</div>
  <div class="grid">
    <div class="field"><label>Client Contact</label><span>${ms.demands?.contact || 'N/A'}</span></div>
    <div class="field"><label>Assigned Engineer</label><span>${engineerName}</span></div>
    <div class="field"><label></label><span></span></div>
    <div class="field"><label>Engineer Contact</label><span>${engineerContact}</span></div>
  </div>
</div>

${checkin ? `
<div class="section">
  <div class="section-title">Field Work Record</div>
  <div class="grid">
    <div class="field"><label>Check-In Time</label><span>${fmt(checkin.checkin_time || checkin.created_at)}</span></div>
    <div class="field"><label>Completion Time</label><span>${fmt(checkin.checkout_time)}</span></div>
    ${checkin.checkin_lat ? `<div class="field"><label>GPS Location</label><span>${checkin.checkin_lat}, ${checkin.checkin_lng}</span></div>` : ''}
    <div class="field"><label>Work Status</label><span>${checkin.status?.replace('_', ' ').toUpperCase() || 'N/A'}</span></div>
  </div>
  ${checkin.completion_notes ? `
  <div style="margin-top:12px;">
    <div class="section-title">Completion Notes</div>
    <div class="notes-box">${checkin.completion_notes}</div>
  </div>` : ''}
</div>` : ''}

<div class="section">
  <div class="section-title">Payment Summary</div>
  <div class="amounts">
    <div class="amount-row"><span>Milestone Amount</span><span>$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
    <div class="amount-row"><span>Platform Fee (15%)</span><span>−$${platformFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
    <div class="amount-row"><span>Engineer Payout</span><span>$${engineerPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
  </div>
</div>

<div class="signatures">
  <div>
    <div class="sig-block"></div>
    <div class="sig-label">Client Signature &amp; Date</div>
    <div style="margin-top:6px;font-size:12px;color:#6b7280;">${ms.demands?.contact || ''}</div>
  </div>
  <div>
    <div class="sig-block"></div>
    <div class="sig-label">Engineer Signature &amp; Date</div>
    <div style="margin-top:6px;font-size:12px;color:#6b7280;">${engineerName}</div>
  </div>
</div>

<div class="footer">
  This document is automatically generated by TalEngineer. Funds are managed via Stripe escrow.
  For disputes, visit talengineer.us/dispute or email support@talengineer.us
</div>

<script>window.onload = () => window.print();</script>
</body>
</html>`);
  } catch (err) {
    // 真实错误记录到日志(供 Sentry/排查)，客户端只收到通用文案，避免泄露数据库/内部细节
    console.error('[workorder]', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
