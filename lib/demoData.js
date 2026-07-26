// ── 测试阶段演示数据（登录态多屏共享）─────────────────────────────────────────
// 仅当对应真实数据为空 / 请求失败时兜底展示，且必带「🧪 测试数据 · Demo」徽标——
// 真实数据永远优先，这份数据只在"账号下什么都没有"时垫底，不让新用户/演示账号
// 看到一片空白。
//
// 单一定义、多屏共用：Dashboard 指标卡、Projects 时间线、Finance 托管交易表都从
// DEMO_PROJECTS 派生同一组数字——三屏各自独立判断是否要用演示数据（各自的
// "真实数据为空"条件不同），但一旦用上，看到的数字互相对得上，不会一个页面
// 说托管中 $25,500、另一个页面说 $0。
//
// 2026-07 从 pages/console.jsx 抽出（原本三处共用的注释就写着这个意图，
// 但 finance.jsx 从 console.jsx 拆分成独立页面时没跟着抽出来，导致托管页
// 长期没有演示兜底、账号一旦没有真实托管记录就是难看的空态）。
const DEMO_TS = Date.now();
export const demoAgo = (min) => new Date(DEMO_TS - min * 60000).toISOString();

// 项目 + 里程碑：demandId/name/meta/budget/milestones[]/派生字段（msCount/doneCount/pct/needsReview）。
// milestones 字段对齐 /api/finance/milestones 与 project_milestones 表：id/phase_name/status/amount/created_at，
// status 取值 locked/funded/completed/released（与 finance.module.css 的 status_* 类名、
// console.jsx 的托管态判断同一套词汇）。
export const DEMO_PROJECTS = [
  {
    demandId: 'demo-p1', name: 'Line-3 SCADA Retrofit', meta: '🇮🇳 Priya K. · Ignition SCADA', budget: '$22,000',
    milestones: [
      { id: 'demo-p1-m1', phase_name: 'M1 · Requirements & tag database', status: 'released', amount: 8000, created_at: demoAgo(60 * 24 * 20) },
      { id: 'demo-p1-m2', phase_name: 'M2 · SCADA integration', status: 'released', amount: 8000, created_at: demoAgo(60 * 24 * 12) },
      { id: 'demo-p1-m3', phase_name: 'M3 · FAT documentation', status: 'completed', amount: 6000, created_at: demoAgo(60 * 24 * 3) },
    ],
  },
  {
    demandId: 'demo-p2', name: 'Weld-cell #4 Integration', meta: '🇲🇽 Diego R. · Fanuc Robotics', budget: '$18,500',
    milestones: [
      { id: 'demo-p2-m1', phase_name: 'M1 · Cell layout & safety', status: 'released', amount: 6000, created_at: demoAgo(60 * 24 * 14) },
      { id: 'demo-p2-m2', phase_name: 'M2 · Robot programming', status: 'funded', amount: 7500, created_at: demoAgo(60 * 24 * 5) },
      { id: 'demo-p2-m3', phase_name: 'M3 · Commissioning & FAT', status: 'locked', amount: 5000, created_at: demoAgo(60 * 24 * 2) },
    ],
  },
  {
    demandId: 'demo-p3', name: 'Packaging Line VN', meta: '🇻🇳 Minh N. · Siemens TIA', budget: '$31,000',
    milestones: [
      { id: 'demo-p3-m1', phase_name: 'M1 · PLC migration', status: 'funded', amount: 12000, created_at: demoAgo(60 * 24 * 4) },
      { id: 'demo-p3-m2', phase_name: 'M2 · HMI development', status: 'locked', amount: 9000, created_at: demoAgo(60 * 24 * 1) },
      { id: 'demo-p3-m3', phase_name: 'M3 · Line integration', status: 'locked', amount: 10000, created_at: demoAgo(60 * 12) },
    ],
  },
].map((p) => {
  const ms = p.milestones;
  const doneCount = ms.filter((m) => m.status === 'released').length;
  const needsReview = ms.some((m) => ['funded', 'completed'].includes(m.status));
  return { ...p, msCount: ms.length, doneCount, pct: ms.length ? Math.round((doneCount / ms.length) * 100) : 0, needsReview };
});

// Finance 托管页的交易表是「按里程碑一行」，不是「按项目一行」——从 DEMO_PROJECTS 展平派生，
// 字段形状对齐 /api/finance/ledger 真实返回（id/demand_id/total_amount/status + 对方邮箱占位）。
// counterparty 用看起来像真实邮箱但一望而知是占位的地址，不影射任何真实账号。
export const DEMO_LEDGER = DEMO_PROJECTS.flatMap((p) =>
  p.milestones.map((m) => ({
    id: m.id,
    demand_id: p.demandId,
    total_amount: m.amount,
    status: m.status,
    created_at: m.created_at,
    engineer_email: 'engineer@demo.talengineer.us',
    employer_email: 'employer@demo.talengineer.us',
    project_title: p.name,
  }))
);
