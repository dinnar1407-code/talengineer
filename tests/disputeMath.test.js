// ── 纠纷裁决资金分配（disputeMath）单元测试 ──────────────────────────────────
// 毛额语义：engineerGross = 判给工程师侧的托管份额（平台费从中抽），
// employerRefund = 托管总额 - 毛额。钱路径必须逐分支测到。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { computeResolutionSplit } = require('../src/utils/disputeMath');

const FEE = 0.15; // 与生产默认 PLATFORM_FEE 一致，但测试自带常量不依赖环境

describe('computeResolutionSplit', () => {
  it('resolved_engineer：工程师全拿（扣平台费），雇主零退款', () => {
    const r = computeResolutionSplit({ resolution: 'resolved_engineer', totalAmount: 1000, platformFee: FEE });
    assert.equal(r.engineerGross, 1000);
    assert.ok(Math.abs(r.engineerPayout - 850) < 1e-9);
    assert.equal(r.employerRefund, 0);
  });

  it('resolved_employer：全额退回雇主，平台不抽费，工程师零到手', () => {
    const r = computeResolutionSplit({ resolution: 'resolved_employer', totalAmount: 1000, platformFee: FEE });
    assert.equal(r.engineerGross, 0);
    assert.equal(r.engineerPayout, 0);
    assert.equal(r.employerRefund, 1000);
  });

  it('resolved_split 默认对半：毛额各半，账目自洽（毛额+退款=总额）', () => {
    const r = computeResolutionSplit({ resolution: 'resolved_split', totalAmount: 1000, platformFee: FEE });
    assert.equal(r.engineerGross, 500);
    assert.ok(Math.abs(r.engineerPayout - 425) < 1e-9); // 500 × 0.85
    assert.equal(r.employerRefund, 500);
    assert.equal(r.engineerGross + r.employerRefund, 1000);
  });

  it('resolved_split 显式毛额：按指定金额分，剩余退雇主', () => {
    const r = computeResolutionSplit({ resolution: 'resolved_split', totalAmount: 1000, resolutionAmount: '300', platformFee: FEE });
    assert.equal(r.engineerGross, 300);
    assert.ok(Math.abs(r.engineerPayout - 255) < 1e-9); // 300 × 0.85
    assert.equal(r.employerRefund, 700);
  });

  it('resolved_split 超额毛额被截断到托管总额，不会转出超托管资金', () => {
    const r = computeResolutionSplit({ resolution: 'resolved_split', totalAmount: 1000, resolutionAmount: 99999, platformFee: FEE });
    assert.equal(r.engineerGross, 1000);
    assert.equal(r.employerRefund, 0);
  });

  it('resolved_split 非法金额（负数/NaN/空）回退默认对半', () => {
    for (const bad of [-5, 'abc', '', null, undefined]) {
      const r = computeResolutionSplit({ resolution: 'resolved_split', totalAmount: 1000, resolutionAmount: bad, platformFee: FEE });
      assert.equal(r.engineerGross, 500, `resolutionAmount=${String(bad)} 应回退对半`);
    }
  });

  it('未知 resolution 抛错（入口白名单之外的值不允许静默分钱）', () => {
    assert.throws(() => computeResolutionSplit({ resolution: 'resolved_wat', totalAmount: 1000, platformFee: FEE }));
  });

  it('totalAmount 非法时按 0 处理，所有产出为 0', () => {
    const r = computeResolutionSplit({ resolution: 'resolved_engineer', totalAmount: 'not-a-number', platformFee: FEE });
    assert.equal(r.engineerGross, 0);
    assert.equal(r.engineerPayout, 0);
    assert.equal(r.employerRefund, 0);
  });
});
