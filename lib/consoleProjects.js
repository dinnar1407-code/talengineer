// ── 工程师控制台「项目列表」归一化（纯函数，供 pages/console.jsx 使用）──────────
//
// 为什么要有这个文件：
// /api/finance/ledger 的返回粒度是「一条里程碑一行」（雇主页 pages/finance.jsx 的托管
// 交易表正是按这个粒度渲染的，不能改接口形状）。而控制台的「项目卡」粒度是「一个项目一行」。
// console.jsx 早期把台账行 1:1 映射成项目，那时接口恰好一个 (需求, 工程师) 对返一行，
// 看起来没问题；台账改由 project_milestones 供数之后，一个有 3 个里程碑的项目
// 会变出 3 张同 demandId 的项目卡，而每张卡又各自挂上该项目的完整里程碑数组
// → 汇总时 flatMap 出来的里程碑被数了 3 遍，「托管中资金 / 已放款」直接翻 3 倍
// （$8,000 显示成 $24,000）。这是资金数字，必须按项目去重后再汇总。
//
// 抽成 lib 纯函数的原因：pages/*.jsx 在本仓没有测试脚手架，而 lib/ 下的纯逻辑
// （navConfig / hireMatrix / occupations …）是有 node:test 覆盖的既定模式。
// 把「去重 + 金额聚合」这段真正会算错钱的逻辑放这里，才测得到。

/**
 * 里程碑金额求和。
 * @param {Array<{amount?: number|string}>} milestones
 * @returns {number}
 */
export function sumMilestoneAmounts(milestones) {
  return (milestones || []).reduce((sum, m) => sum + (Number(m?.amount) || 0), 0);
}

/**
 * 把「一里程碑一行」的台账压成「一项目一行」的项目列表。
 *
 * @param {Array<{demand_id?: any, employer_email?: string, total_amount?: number|string}>} ledgerRows
 *        /api/finance/ledger 的返回数组（null/undefined 按空处理）。
 * @param {object}  [opts]
 * @param {object}  [opts.titleByDemand]      demand_id → 项目标题（来自消息线程）。
 * @param {object}  [opts.milestonesByDemand] demand_id → 里程碑数组（/api/finance/milestones）。
 * @returns {Array<{demandId: any, name: string, meta: string, budgetAmount: number}>}
 *          每个真实项目恰好一条，顺序按台账首次出现的先后（台账已按 created_at 倒序）。
 */
export function buildEngineerProjects(ledgerRows, opts = {}) {
  const { titleByDemand = {}, milestonesByDemand = {} } = opts;

  // Map 天然按插入顺序迭代，去重的同时保住台账原有的排序，无需额外排序步骤。
  const byDemand = new Map();

  for (const row of ledgerRows || []) {
    const demandId = row?.demand_id;
    // demand_id 缺失的行无法归属到任何项目，直接丢弃（比归到 undefined 这个假项目下安全）。
    if (demandId == null) continue;

    const existing = byDemand.get(demandId);
    if (existing) {
      // 同一项目的后续里程碑：只累加金额。meta（对方邮箱）取第一条非空的即可——
      // 同一项目的所有里程碑本来就共享同一个雇主。
      existing.ledgerTotal += Number(row.total_amount) || 0;
      if (!existing.meta) existing.meta = row.employer_email || '';
    } else {
      byDemand.set(demandId, {
        demandId,
        name: titleByDemand[demandId] || `Project #${demandId}`,
        meta: row.employer_email || '',
        ledgerTotal: Number(row.total_amount) || 0,
      });
    }
  }

  return [...byDemand.values()].map((p) => {
    // 预算 = 项目总值 = 该项目全部里程碑金额之和（不是任意一条里程碑的金额）。
    // 优先用 milestonesByDemand：它和项目卡上的 msCount/进度条同源，数字互相对得上；
    // 里程碑还在路上（逐 demand 异步拉取）时退回台账行求和——同一批数据的另一个出口，
    // 因此不会前后矛盾，只是避免加载途中 budget 闪一下 $0。
    const ms = milestonesByDemand[p.demandId];
    const budgetAmount = ms && ms.length ? sumMilestoneAmounts(ms) : p.ledgerTotal;
    return { demandId: p.demandId, name: p.name, meta: p.meta, budgetAmount };
  });
}
