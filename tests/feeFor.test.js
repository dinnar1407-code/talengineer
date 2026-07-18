// ── 单需求费率覆盖（feeFor）单元测试 ──────────────────────────────────────────
// founding 客户让利：demands.fee_pct 合法则覆盖全局费率，空/非法回退 PLATFORM_FEE。
// 钱路径入口函数，逐分支测到。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { feeFor, PLATFORM_FEE } = require('../src/config/fees');

describe('feeFor', () => {
  it('demand 为空 → 全局费率', () => {
    assert.equal(feeFor(null), PLATFORM_FEE);
    assert.equal(feeFor(undefined), PLATFORM_FEE);
  });

  it('fee_pct 未设置/为 null → 全局费率', () => {
    assert.equal(feeFor({}), PLATFORM_FEE);
    assert.equal(feeFor({ fee_pct: null }), PLATFORM_FEE);
  });

  it('合法覆盖：0.05 → 0.05（founding 价）', () => {
    assert.equal(feeFor({ fee_pct: 0.05 }), 0.05);
    assert.equal(feeFor({ fee_pct: '0.05' }), 0.05); // NUMERIC 列经 supabase 可能回字符串
  });

  it('零费率是合法覆盖（完全免佣）', () => {
    assert.equal(feeFor({ fee_pct: 0 }), 0);
  });

  it('非法值回退全局：>=1 / 负数 / 非数字', () => {
    assert.equal(feeFor({ fee_pct: 1 }), PLATFORM_FEE);
    assert.equal(feeFor({ fee_pct: 1.5 }), PLATFORM_FEE);
    assert.equal(feeFor({ fee_pct: -0.1 }), PLATFORM_FEE);
    assert.equal(feeFor({ fee_pct: 'abc' }), PLATFORM_FEE);
  });
});
