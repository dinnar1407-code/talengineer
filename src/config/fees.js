// 平台抽佣比例（take rate）单一配置来源。
// 之前 payment/workorder/disputes 各自硬编码 0.15，存在"改一处漏三处"的隐患；
// 集中到这里，保证三条放款/裁决路径用的是同一个比例。
//
// 可通过环境变量 PLATFORM_FEE_PCT 调整（路径 A·精英策展可上调到 0.20-0.25 体现质量溢价）。
// 默认 0.15，且仅接受 [0,1) 区间的合法值，否则回退默认——保证零行为变化。
const parsed = parseFloat(process.env.PLATFORM_FEE_PCT);
const PLATFORM_FEE = Number.isFinite(parsed) && parsed >= 0 && parsed < 1 ? parsed : 0.15;

// 单需求费率覆盖（founding 客户让利）：demands.fee_pct 合法（0<=x<1）时优先，
// 空/非法一律回退全局 PLATFORM_FEE。三条放款/裁决路径统一经此函数取费率，
// 保证"改一处漏三处"的老问题不在覆盖逻辑上重演。
function feeFor(demand) {
  const v = demand ? parseFloat(demand.fee_pct) : NaN;
  return Number.isFinite(v) && v >= 0 && v < 1 ? v : PLATFORM_FEE;
}

module.exports = { PLATFORM_FEE, feeFor };
