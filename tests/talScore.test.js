// ── TalScore 质量分（talScore）单元测试 ────────────────────────────────────────
// TalScore 是工程师综合质量分（0-100，四档 tier），用于排序与邀请制路由的门槛。
// computeTalScore 是纯函数（不碰数据库），四个维度加权：
//   AI 筛选分 25% + 平台认证 25% + 评分 30%（贝叶斯） + 可靠性 20%。
// 纯函数 + 显式输入，逐维度与 tier 边界逐分支测到。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { computeTalScore, tierFor } = require('../src/services/talScore');

// 便捷构造：一条有效认证（track_key + level）
const cert = (track_key, level) => ({ track_key, level });

describe('computeTalScore（四维加权总分）', () => {

  it('全零新人：仅拿评分贝叶斯先验(21) + 无纠纷奖励(10)，tier=bronze', () => {
    const r = computeTalScore({
      verifiedScore: 0, certifications: [], avgRating: 0, reviewCount: 0,
      completedOrders: 0, disputes: 0,
    });
    assert.equal(r.breakdown.ai, 0);
    assert.equal(r.breakdown.certification, 0);
    // 贝叶斯先验 (0*0 + 3.5*5)/(0+5)=3.5 → 3.5/5*30 = 21
    assert.equal(r.breakdown.rating, 21);
    // 无完单(0) + 无纠纷(10) = 10
    assert.equal(r.breakdown.reliability, 10);
    assert.equal(r.score, 31);
    assert.equal(r.tier, 'bronze');
  });

  it('满分工程师：四维全满 → 100，tier=platinum', () => {
    const r = computeTalScore({
      verifiedScore: 100, certifications: [cert('plc', 3)], avgRating: 5, reviewCount: 50,
      completedOrders: 20, disputes: 0,
    });
    assert.equal(r.breakdown.ai, 25);
    assert.equal(r.breakdown.certification, 25);
    assert.ok(r.breakdown.rating > 29); // 贝叶斯逼近 5 → 逼近 30
    assert.equal(r.breakdown.reliability, 20);
    assert.ok(r.score >= 99);
    assert.equal(r.tier, 'platinum');
  });

  it('AI 筛选分线性映射到 0-25', () => {
    assert.equal(computeTalScore({ verifiedScore: 80, certifications: [], reviewCount: 0, completedOrders: 0, disputes: 0 }).breakdown.ai, 20);
    assert.equal(computeTalScore({ verifiedScore: 50, certifications: [], reviewCount: 0, completedOrders: 0, disputes: 0 }).breakdown.ai, 12.5);
  });
});

describe('平台认证维度（每方向取最高级，L1=8/L2=16/L3=25，封顶25）', () => {

  it('等级点数映射：L1=8 / L2=16 / L3=25', () => {
    assert.equal(computeTalScore({ verifiedScore: 0, certifications: [cert('plc', 1)], reviewCount: 0, completedOrders: 0, disputes: 0 }).breakdown.certification, 8);
    assert.equal(computeTalScore({ verifiedScore: 0, certifications: [cert('plc', 2)], reviewCount: 0, completedOrders: 0, disputes: 0 }).breakdown.certification, 16);
    assert.equal(computeTalScore({ verifiedScore: 0, certifications: [cert('plc', 3)], reviewCount: 0, completedOrders: 0, disputes: 0 }).breakdown.certification, 25);
  });

  it('同方向多张证只取最高级（L1+L3 → 25，不叠加）', () => {
    const r = computeTalScore({ verifiedScore: 0, certifications: [cert('plc', 1), cert('plc', 3)], reviewCount: 0, completedOrders: 0, disputes: 0 });
    assert.equal(r.breakdown.certification, 25);
  });

  it('多方向累加后封顶 25（plc L2 + robotics L2 = 32 → 25）', () => {
    const r = computeTalScore({ verifiedScore: 0, certifications: [cert('plc', 2), cert('robotics', 2)], reviewCount: 0, completedOrders: 0, disputes: 0 });
    assert.equal(r.breakdown.certification, 25);
  });

  it('两方向 L1（8+8=16）未到封顶时如实累加', () => {
    const r = computeTalScore({ verifiedScore: 0, certifications: [cert('plc', 1), cert('vision', 1)], reviewCount: 0, completedOrders: 0, disputes: 0 });
    assert.equal(r.breakdown.certification, 16);
  });
});

describe('评分维度（贝叶斯 (avg*n+3.5*5)/(n+5) 映射 0-30）', () => {

  it('评价数少时向先验 3.5 收缩，不被单条好评拉满', () => {
    // avg=5, n=1 → (5+17.5)/6 = 3.75 → /5*30 = 22.5
    const r = computeTalScore({ verifiedScore: 0, certifications: [], avgRating: 5, reviewCount: 1, completedOrders: 0, disputes: 0 });
    assert.equal(r.breakdown.rating, 22.5);
  });

  it('评价数多时逼近真实均分', () => {
    // avg=4, n=45 → (180+17.5)/50 = 3.95 → /5*30 = 23.7
    const r = computeTalScore({ verifiedScore: 0, certifications: [], avgRating: 4, reviewCount: 45, completedOrders: 0, disputes: 0 });
    assert.equal(r.breakdown.rating, 23.7);
  });
});

describe('可靠性维度（完单封顶10 + 无纠纷10，纠纷率>10%归0）', () => {

  it('完单数封顶 10（20 单也只给 10）+ 无纠纷 10 = 20', () => {
    const r = computeTalScore({ verifiedScore: 0, certifications: [], reviewCount: 0, completedOrders: 20, disputes: 0 });
    assert.equal(r.breakdown.reliability, 20);
  });

  it('纠纷率 > 10%（5 单 1 纠纷=20%）：可靠性归 0', () => {
    const r = computeTalScore({ verifiedScore: 0, certifications: [], reviewCount: 0, completedOrders: 5, disputes: 1 });
    assert.equal(r.breakdown.reliability, 0);
  });

  it('纠纷率 <= 10%（20 单 1 纠纷=5%）：保留完单分但失去无纠纷奖励', () => {
    const r = computeTalScore({ verifiedScore: 0, certifications: [], reviewCount: 0, completedOrders: 20, disputes: 1 });
    assert.equal(r.breakdown.reliability, 10); // min(20,10)=10 + 无奖励(有纠纷)
  });

  it('零完单但有纠纷：视为高风险，可靠性归 0', () => {
    const r = computeTalScore({ verifiedScore: 0, certifications: [], reviewCount: 0, completedOrders: 0, disputes: 1 });
    assert.equal(r.breakdown.reliability, 0);
  });
});

describe('tierFor（四档边界）', () => {
  it('按阈值分档：>=85 platinum，>=70 gold，>=55 silver，其余 bronze', () => {
    assert.equal(tierFor(85), 'platinum');
    assert.equal(tierFor(84), 'gold');
    assert.equal(tierFor(70), 'gold');
    assert.equal(tierFor(69), 'silver');
    assert.equal(tierFor(55), 'silver');
    assert.equal(tierFor(54), 'bronze');
    assert.equal(tierFor(0), 'bronze');
  });
});
