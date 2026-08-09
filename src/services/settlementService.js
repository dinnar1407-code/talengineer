// ── 里程碑入账结算（单一实现，宪法 W1/W2 的落点）────────────────────────────────
// 背景（P1 治理）：此前 webhook checkout.session.completed 与 confirm-funding 各自
// 内联实现"标记 funded + 落盘 payment_intent + demands → in_progress"，且已发生行为
// 漂移：webhook 路径入账后发工程师通知 + 企业 webhook，confirm-funding 路径什么都不发
// ——当 confirm-funding 在竞态中先赢（恰是 webhook 延迟/丢失需要它兜底的场景），
// 工程师收不到"里程碑已托管"通知。本模块把结算收敛为唯一实现，两个入口都调用：
//   - 条件更新 locked/payment_failed → funded 天然幂等，重复事件/双路径竞态只有一个赢家；
//   - 通知只由条件更新的赢家发送（恰好一次），输家拿 settled:false 自行决定响应语义；
//   - demand_id 一律取自条件更新返回的 DB 行，绝不消费调用方传入的 metadata（零信任）；
//   - DB 错误一律抛出，由调用方按 fail-closed 三态响应（webhook → 500 让 Stripe 重试）。

const { emailMilestoneFunded } = require('./email');
const { createNotification } = require('./notificationService');

/**
 * 结算一笔里程碑托管入账。
 * @returns {Promise<{settled: boolean, demandId?: number}>}
 *   settled=false 表示里程碑不在待付款状态（重复事件 / 双路径竞态输家 / 状态机异常），
 *   调用方自行区分"已被对方入账"与"真异常"。DB 错误直接抛出（携带 supabase error）。
 */
async function settleMilestoneFunding({ supabase, milestoneId, paymentIntentId = null, source = 'unknown' }) {
  // 条件更新：locked 与 payment_failed（付款失败后重试）都是合法的待付款状态。
  // 落盘 payment_intent：纠纷判雇主时按它原路退款（refunds.create 需要）。
  const { data: fundedRows, error: fundErr } = await supabase
    .from('project_milestones')
    .update({ status: 'funded', ...(paymentIntentId && { stripe_payment_intent: paymentIntentId }) })
    .eq('id', milestoneId)
    .in('status', ['locked', 'payment_failed'])
    .select('id, demand_id');
  if (fundErr) {
    // 抛给调用方走 fail-closed：webhook 返回 500 让 Stripe 重试，避免已收款但状态未更新
    throw Object.assign(new Error(`Failed to mark milestone ${milestoneId} as funded: ${fundErr.message}`), { cause: fundErr });
  }
  if (!fundedRows || fundedRows.length === 0) {
    return { settled: false };
  }

  // 赢家路径：demand_id 以条件更新返回的 DB 行为准（metadata 可能被构造或与里程碑不符）
  const realDemandId = fundedRows[0].demand_id;
  if (realDemandId) {
    const { error: demandErr } = await supabase.from('demands').update({ status: 'in_progress' }).eq('id', realDemandId);
    // CRITICAL 告警而非抛错（与 release 路径"转账已发生但落库失败"的处置一致，payment.js）：
    // 里程碑此刻已 funded，若在此抛错让 webhook 500，Stripe 重试只会命中 0 行分支、
    // 修不了卡在 open 的 demand，反而让重试配额空转。人工修库是唯一出路，故必须留下告警。
    if (demandErr) {
      console.error(`[Settlement] CRITICAL: milestone ${milestoneId} funded but failed to move demand ${realDemandId} to in_progress: ${demandErr.message} — manual repair required.`);
    }
  }

  console.log(`[Settlement] Milestone ${milestoneId} funded (source: ${source}).`);

  // ── 赢家恰好一次的通知副作用（fire-and-forget 语义：失败绝不影响入账结果）──────
  // 整段 try/catch 包住：结算已成功落库，通知链路的任何异常只记录、不上抛，
  // 否则 webhook 会因通知查询失败而 500，诱导 Stripe 重试一笔已入账的事件。
  try {
    // fire-and-forget 企业 webhook（惰性 require，绝不影响入账主流程）
    if (realDemandId) {
      try {
        const { data: dOwner } = await supabase.from('demands').select('employer_id').eq('id', realDemandId).single();
        if (dOwner?.employer_id) {
          const { dispatchWebhook } = require('./webhookService');
          dispatchWebhook(supabase, { userId: dOwner.employer_id, event: 'milestone.funded', payload: { milestone_id: milestoneId, demand_id: realDemandId } }).catch(() => {});
        }
      } catch { /* webhookService 尚未就绪 */ }
    }

    // 通知被指派的工程师（邮件 + 应用内）
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
  } catch (notifyErr) {
    console.error(`[Settlement] Milestone ${milestoneId} funded but notification side-effects failed:`, notifyErr);
  }

  return { settled: true, demandId: realDemandId };
}

module.exports = { settleMilestoneFunding };
