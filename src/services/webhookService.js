// ── 企业 Webhook 派发服务（fire-and-forget，绝不抛出）─────────────────────────────
// 契约见 docs/superpowers/plans/2026-07-17-pmf-p2-growth.md Task 6。
// 钱路径（payment.js webhook funded / workorder.js approve）与撮合（demand.assign）在
// 关键事件成功后调用本函数，把事件推给企业客户配置的 webhook_url。
//
// 设计红线（为什么这样写）：
//   本函数是"副作用通知"，绝不能因为企业方接收端慢/挂/返回错误而拖垮或中断我们的主流程。
//   因此：任何失败（DB 查询失败、单条 key 网络错误、超时、未预期异常）都只 console.warn，
//   函数本身永远 resolve，永不 reject/throw。调用方可安全地 fire-and-forget（不 await 亦可）。

const crypto = require('crypto');

// 单次 POST 的超时（毫秒）：接收端无响应时用 AbortController 主动放弃，避免句柄泄漏/流程卡死。
const WEBHOOK_TIMEOUT_MS = 5000;

/**
 * 给某企业用户所有"启用且配置了 webhook"的 API key 派发一个事件。
 *
 * body = JSON.stringify({ event, payload, timestamp })
 * 签名 = HMAC-SHA256(webhook_secret, body)，放入请求头 'X-TalEngineer-Signature'（十六进制）。
 * 接收方用同一 secret 对收到的原始 body 复算 HMAC，与该头比对即可验证来源与完整性。
 *
 * @param {object} supabase - Supabase 客户端（由调用方注入，便于单元测试用假 client）
 * @param {object} opts
 * @param {number|string} opts.userId - 企业用户 id（对应 api_keys.user_id）
 * @param {string} opts.event  - 事件名，如 'milestone.funded' / 'milestone.released' / 'demand.assigned'
 * @param {object} opts.payload - 事件负载（原样放进 body.payload）
 * @returns {Promise<void>} 永远 resolve
 */
async function dispatchWebhook(supabase, { userId, event, payload }) {
  try {
    // 查该用户所有"启用 + 配置了 webhook_url"的 key。
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('webhook_url, webhook_secret')
      .eq('user_id', userId)
      .eq('active', true)
      .not('webhook_url', 'is', null);

    if (error) {
      console.warn('[webhook] 查询 api_keys 失败，跳过派发：', error.message || error);
      return;
    }
    if (!keys || keys.length === 0) return;

    // body 一次算好：签名与实际发送必须基于同一份字节，接收方复算才能对上。timestamp 用 ISO 字符串。
    const timestamp = new Date().toISOString();
    const body = JSON.stringify({ event, payload, timestamp });

    // 逐条独立派发：单条失败不影响其他条，且各自的错误都被吞在自己的 try 里，绝不冒泡。
    await Promise.all(keys.map(async (k) => {
      // secret 缺失就无法签名 —— 绝不发送未签名请求（宁可不通知，也不让接收方收到无法验签的回调）。
      if (!k.webhook_url || !k.webhook_secret) return;
      try {
        const signature = crypto.createHmac('sha256', k.webhook_secret).update(body).digest('hex');
        // 5s 超时：接收端无响应就主动 abort，避免长时间挂起。
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
        try {
          await fetch(k.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-TalEngineer-Signature': signature },
            body,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timer);
        }
      } catch (err) {
        // 网络错误 / 超时 / DNS 失败等 —— 仅告警，不影响其他 key，也不影响主流程。
        console.warn(`[webhook] 派发到 ${k.webhook_url} 失败：`, err.message || err);
      }
    }));
  } catch (err) {
    // 兜底：任何未预期错误都不能冒泡到主流程（本函数被 fire-and-forget 调用）。
    console.warn('[webhook] dispatchWebhook 未预期错误：', err.message || err);
  }
}

module.exports = { dispatchWebhook };
