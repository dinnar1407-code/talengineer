// Matchmaker 多因子评分单元测试（落地第一步 #2）
// 纯函数 scoreEngineer / extractKeywords，无需数据库或网络。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { scoreEngineer, extractKeywords } = require('../src/services/matchmakerService');

test('无关键词且无质量信号 → 0 分', () => {
  assert.equal(scoreEngineer({}, []), 0);
});

test('verified_score 以 0.3 权重计入（无关键词时）', () => {
  // 100 * 0.3 = 30
  assert.equal(scoreEngineer({ verified_score: 100 }, []), 30);
});

test('技能完全重叠 → 100 分重叠分', () => {
  const eng = { skills: 'Siemens PLC, SCADA', name: 'A' };
  // 关键词 plc/scada 都命中 → 2/2*100 = 100
  assert.equal(scoreEngineer(eng, ['plc', 'scada']), 100);
});

test('技能部分重叠按比例', () => {
  const eng = { skills: 'PLC programming', name: 'B' };
  // 命中 plc，未命中 robotics → 1/2*100 = 50
  assert.equal(scoreEngineer(eng, ['plc', 'robotics']), 50);
});

test('评价口碑：足够评价数(≥3)满额计入 0-20', () => {
  // rating 5 * 4 * confidence(1) = 20
  assert.equal(scoreEngineer({ avg_rating: 5, review_count: 3 }, []), 20);
});

test('评价口碑：评价数不足按比例打折（防单条好评刷榜）', () => {
  // rating 5 * 4 * confidence(1/3) ≈ 6.67
  const s = scoreEngineer({ avg_rating: 5, review_count: 1 }, []);
  assert.ok(Math.abs(s - 6.6667) < 0.01, `期望≈6.67，实际 ${s}`);
});

test('可用性惩罚：unavailable 重扣、busy 轻扣、available 不扣', () => {
  assert.equal(scoreEngineer({ availability: 'unavailable' }, []), -40);
  assert.equal(scoreEngineer({ availability: 'busy' }, []), -15);
  assert.equal(scoreEngineer({ availability: 'available' }, []), 0);
});

test('综合排序：高匹配+高分+可接单 应高于 低匹配+busy+未验证', () => {
  const good = { skills: 'PLC SCADA', verified_score: 90, avg_rating: 5, review_count: 5, availability: 'available' };
  const weak = { skills: 'welding', verified_score: 0, availability: 'busy' };
  const kws = ['plc', 'scada'];
  assert.ok(scoreEngineer(good, kws) > scoreEngineer(weak, kws));
});

test('extractKeywords 过滤停用词与短词', () => {
  const kws = extractKeywords('Senior PLC Programmer for the Siemens S7 system');
  assert.ok(kws.includes('plc'));
  assert.ok(kws.includes('siemens'));
  assert.ok(!kws.includes('the'));  // 停用词被过滤
});
