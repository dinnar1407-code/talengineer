const { getClient } = require('../config/db');
const webpush = require('web-push');

// VAPID 只配置一次（模块加载时）。env 缺失或非法都视为"推送未启用"，只在首次告警一次，
// 避免每条通知都刷屏。配置失败绝不能让 require 抛错影响主应用。
let vapidReady = false;
let vapidWarned = false;
(function initVapid() {
  try {
    const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(VAPID_SUBJECT || 'mailto:support@talengineer.us', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      vapidReady = true;
    }
  } catch (err) {
    console.error('[Push] Invalid VAPID config — web push disabled:', err.message);
  }
})();

/**
 * Fire-and-forget web push to all of a user's browser subscriptions.
 * Never throws. Subscriptions that return 404/410 (gone) are pruned from the table.
 */
async function sendWebPush(supabase, user_email, payload) {
  // VAPID 未配置：静默跳过，只在首次 warn 一次
  if (!vapidReady) {
    if (!vapidWarned) {
      console.warn('[Push] VAPID keys not configured — skipping web push.');
      vapidWarned = true;
    }
    return;
  }
  try {
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, subscription')
      .eq('user_email', user_email);
    if (error || !subs || subs.length === 0) return;
    const body = JSON.stringify(payload);
    await Promise.all(subs.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, body);
      } catch (err) {
        // 404/410 = 订阅已失效（用户清了浏览器/退订），删掉这条脏数据；其余错误仅记录
        if (err && (err.statusCode === 404 || err.statusCode === 410)) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', row.endpoint);
        } else {
          console.error('[Push] send failed:', err && err.message);
        }
      }
    }));
  } catch (err) {
    console.error('[Push] dispatch failed:', err.message);
  }
}

/**
 * Fire-and-forget notification creator.
 * Never throws — errors are logged only so callers don't need to catch.
 */
async function createNotification({ user_email, type, title, body = null, link = null, demand_id = null }) {
  if (!user_email || !type || !title) return;
  try {
    const supabase = getClient();
    if (!supabase) return;
    await supabase.from('notifications').insert([{ user_email, type, title, body, link, demand_id }]);
    // 站内通知落库成功后，异步推送到用户浏览器（fire-and-forget，绝不影响通知创建）
    sendWebPush(supabase, user_email, { title, body: body || '', link: link || '/' });
  } catch (err) {
    console.error('[Notification] Failed to create notification:', err.message);
  }
}

module.exports = { createNotification };
