// ── 工程师控制台项目归一化测试（lib/consoleProjects.js）─────────────────────────
//
// 被修的 bug：/api/finance/ledger 改由 project_milestones 供数之后，返回粒度从
// 「一个 (需求, 工程师) 对一行」变成了「一条里程碑一行」。pages/console.jsx 仍把台账行
// 1:1 映射成项目卡，于是一个有 N 个里程碑的项目变出 N 张同 demandId 的卡，
// 每张卡又各自挂上该项目的【完整】里程碑数组；随后
//   const allMs = projList.flatMap(p => p.milestones)
// 里每条里程碑出现 N 次，「托管中资金」与「已放款」直接乘以 N。
// 任务书里的例子：3 个里程碑（released $8k / funded $8k / released $6k）
// 会显示 Escrow $24,000（真值 $8,000）、Released $42,000（真值 $14,000）。
//
// 之所以能潜伏至今：/api/finance/ledger 过去恒返回 []，页面一直落在 DEMO_PROJECTS 兜底上。
// 真里程碑一出现就会立刻触发——而那正是 round 1 改这条接口的目的。
//
// 本文件测的是抽出来的纯函数（pages/*.jsx 在本仓没有测试脚手架，
// 而 lib/ 下的纯逻辑走 node:test 是既定模式，见 navConfig / iaLibs / playbookContent）。
// ESM 模块用 await import() 加载，与 iaLibs.test.js 同一手法。

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');

let buildEngineerProjects, sumMilestoneAmounts;
before(async () => {
  ({ buildEngineerProjects, sumMilestoneAmounts } = await import('../lib/consoleProjects.js'));
});

// 任务书里的具体事故场景：一个需求、3 条里程碑。
const MS_P1 = [
  { id: 1, phase_name: 'M1', status: 'released', amount: 8000 },
  { id: 2, phase_name: 'M2', status: 'funded',   amount: 8000 },
  { id: 3, phase_name: 'M3', status: 'released', amount: 6000 },
];
// /api/finance/ledger 对同一需求返回的三行（一条里程碑一行，字段名见 src/routes/finance.js）
const LEDGER_P1 = MS_P1.map((m) => ({
  id: m.id, demand_id: 5, project_title: 'Line-3 SCADA',
  employer_email: 'boss@acme.com', engineer_email: 'eng@x.com',
  total_amount: m.amount, status: m.status, created_at: '2026-07-01T00:00:00Z',
}));

describe('buildEngineerProjects —— 台账按项目去重', () => {
  it('同一 demand 的 N 条里程碑只产出 1 个项目条目', () => {
    const projects = buildEngineerProjects(LEDGER_P1, {
      titleByDemand: { 5: 'Line-3 SCADA' },
      milestonesByDemand: { 5: MS_P1 },
    });
    assert.equal(projects.length, 1, '3 条里程碑 → 1 个项目，不是 3 个');
    assert.equal(projects[0].demandId, 5);
  });

  it('去重后再汇总，托管中/已放款金额不再被乘以 N（回归事故本身）', () => {
    const projects = buildEngineerProjects(LEDGER_P1, { milestonesByDemand: { 5: MS_P1 } });

    // 复刻 pages/console.jsx 的派生指标算法（:441-447）
    const projList = projects.map((p) => ({ ...p, milestones: MS_P1 }));
    const allMs = projList.flatMap((p) => p.milestones);
    const held = allMs.filter((m) => ['funded', 'completed'].includes(m.status))
      .reduce((s, m) => s + Number(m.amount || 0), 0);
    const released = allMs.filter((m) => m.status === 'released')
      .reduce((s, m) => s + Number(m.amount || 0), 0);

    assert.equal(allMs.length, 3, '每条里程碑只应出现一次');
    assert.equal(held, 8000);      // 修复前：24000
    assert.equal(released, 14000); // 修复前：42000
  });

  it('多个项目各自独立去重，互不干扰，且保持台账原有顺序', () => {
    const rows = [
      ...LEDGER_P1,
      { demand_id: 9, employer_email: 'other@b.com', total_amount: 1000 },
      { demand_id: 9, employer_email: 'other@b.com', total_amount: 2000 },
    ];
    const projects = buildEngineerProjects(rows);
    assert.deepEqual(projects.map((p) => p.demandId), [5, 9]);
  });
});

describe('buildEngineerProjects —— 预算是项目总值，不是某一条里程碑的金额', () => {
  it('里程碑已加载：budgetAmount = 全部里程碑金额之和', () => {
    const [p] = buildEngineerProjects(LEDGER_P1, { milestonesByDemand: { 5: MS_P1 } });
    assert.equal(p.budgetAmount, 22000);
    assert.notEqual(p.budgetAmount, 8000, '不能只拿任意一条台账行的 total_amount 当预算');
  });

  it('里程碑还在路上：退回台账行求和（同一批数据），而不是 $0 或单条金额', () => {
    const [p] = buildEngineerProjects(LEDGER_P1, { milestonesByDemand: {} });
    assert.equal(p.budgetAmount, 22000);
  });

  it('金额是字符串或缺失时按 0 计，不产生 NaN（NaN 会让整块金额区渲染成 $NaN）', () => {
    const [p] = buildEngineerProjects([
      { demand_id: 5, total_amount: '1500.50' },
      { demand_id: 5, total_amount: null },
      { demand_id: 5 },
    ]);
    assert.equal(p.budgetAmount, 1500.5);
  });
});

describe('buildEngineerProjects —— 输出外形与边界', () => {
  it('外形与 DEMO_PROJECTS / 雇主分支一致：demandId / name / meta / budgetAmount', () => {
    const [p] = buildEngineerProjects(LEDGER_P1, {
      titleByDemand: { 5: 'Line-3 SCADA' },
      milestonesByDemand: { 5: MS_P1 },
    });
    assert.deepEqual(Object.keys(p).sort(), ['budgetAmount', 'demandId', 'meta', 'name'].sort());
    assert.equal(p.name, 'Line-3 SCADA');
    assert.equal(p.meta, 'boss@acme.com', 'meta = 对方（雇主）邮箱');
  });

  it('没有会话标题时回退到 "Project #<id>"（与旧行为一致）', () => {
    const [p] = buildEngineerProjects([{ demand_id: 42, total_amount: 100 }]);
    assert.equal(p.name, 'Project #42');
  });

  it('meta 取该项目第一条非空的雇主邮箱（首行为空也不会丢）', () => {
    const [p] = buildEngineerProjects([
      { demand_id: 5, employer_email: null, total_amount: 100 },
      { demand_id: 5, employer_email: 'boss@acme.com', total_amount: 100 },
    ]);
    assert.equal(p.meta, 'boss@acme.com');
  });

  it('null / undefined / 空台账 → 空数组（页面据此落到演示兜底，不能抛）', () => {
    assert.deepEqual(buildEngineerProjects(null), []);
    assert.deepEqual(buildEngineerProjects(undefined), []);
    assert.deepEqual(buildEngineerProjects([]), []);
  });

  it('demand_id 缺失的脏行被丢弃，不会凑出一个 undefined 假项目', () => {
    const projects = buildEngineerProjects([
      { demand_id: null, total_amount: 999 },
      { total_amount: 999 },
      { demand_id: 5, total_amount: 100 },
    ]);
    assert.equal(projects.length, 1);
    assert.equal(projects[0].demandId, 5);
  });
});

describe('sumMilestoneAmounts', () => {
  it('求和并容忍字符串/缺失金额', () => {
    assert.equal(sumMilestoneAmounts([{ amount: 1 }, { amount: '2.5' }, {}, null]), 3.5);
    assert.equal(sumMilestoneAmounts([]), 0);
    assert.equal(sumMilestoneAmounts(null), 0);
  });
});
