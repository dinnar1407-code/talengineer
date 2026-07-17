// 纠纷裁决的资金分配纯函数（从 routes/disputes.js 抽出，便于单测）。
//
// 语义约定：
// - resolutionAmount 是判给工程师一方的"毛额"（从托管额里划走的部分，平台费从中抽取）。
//   注意：这与旧内联逻辑不同——旧逻辑把 resolution_amount 当作工程师净到手额，
//   导致"托管总额 - 工程师净额"里混进了平台费，雇主该退多少算不清。
//   毛额语义下：工程师净到手 = 毛额 ×(1-费率)，雇主退款 = 托管总额 - 毛额，账目自洽。
// - resolved_employer 全额退款时平台不抽费（服务未成立，平台收费无依据）。
// - resolved_split 未显式给 resolutionAmount 时默认对半分（毛额 = 总额一半）。
function computeResolutionSplit({ resolution, totalAmount, resolutionAmount, platformFee }) {
  const total = Number(totalAmount) || 0;

  let engineerGross;
  if (resolution === 'resolved_engineer') {
    engineerGross = total;
  } else if (resolution === 'resolved_employer') {
    engineerGross = 0;
  } else if (resolution === 'resolved_split') {
    const amt = parseFloat(resolutionAmount);
    // 显式金额需为正数且不超托管总额（超额部分截断，防止转出超过托管的资金）
    engineerGross = Number.isFinite(amt) && amt > 0 ? Math.min(amt, total) : total * 0.5;
  } else {
    throw new Error(`Unknown resolution: ${resolution}`);
  }

  const engineerPayout = engineerGross * (1 - platformFee);
  const employerRefund = Math.max(0, total - engineerGross);

  return { engineerGross, engineerPayout, employerRefund };
}

module.exports = { computeResolutionSplit };
