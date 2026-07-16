// ── Stripe 客户端统一工厂（审计 P2 修复）──────────────────────────────────────
// 背景：此前 4 个路由（payment/workorder/disputes/connect）各自内联
// `require('stripe')(process.env.STRIPE_SECRET_KEY)`，且都未固定 apiVersion——
// SDK 升级或 Stripe 控制台切换默认版本时，4 处行为会一起悄然漂移（资金链路不可接受）。
// 现收敛为单一工厂：实例只建一次，apiVersion 显式固定为 stripe v14 SDK 的默认版本
// '2023-10-16'（与线上现行为完全一致，零行为变化）。将来升级 SDK 大版本时，
// 只需在这一处有意识地更新版本号并配合 Stripe 测试模式回归。
//
// 注：本文件原有的 initStripeConnect / createEscrowSession 是零调用的死代码
// （含一处休眠的硬编码 0.15 佣金，与 src/config/fees.js 的集中配置冲突），已移除。

const Stripe = require('stripe');
require('dotenv').config();

const STRIPE_API_VERSION = '2023-10-16';

let cached;

/**
 * 返回全局唯一的 Stripe 客户端实例（惰性创建）。
 * 与旧内联写法语义一致：key 缺失时实例化不抛错，真正调用 API 时才失败。
 */
function getStripe() {
  if (cached === undefined) {
    cached = Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: STRIPE_API_VERSION });
  }
  return cached;
}

module.exports = { getStripe, STRIPE_API_VERSION };
