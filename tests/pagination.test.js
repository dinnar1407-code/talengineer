// ── 分页钳制纯函数 clampPagination 的单元测试 ───────────────────────────────
// 该函数把用户可控的 page/limit 字符串钳制成安全整数，防止越界/一次拉太多导致 500。
// 纯函数最好测：给定输入→断言输出，无需任何 mock。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { clampPagination } = require('../src/utils/pagination');

describe('clampPagination（分页参数钳制）', () => {

  it('默认值：page=0, limit=12', () => {
    assert.deepEqual(clampPagination(), { pageNum: 0, pageSize: 12, from: 0, to: 11 });
  });

  it('正常的字符串入参：正确解析并算出 from/to', () => {
    // page=2, size=10 → from = 2*10 = 20, to = 20+10-1 = 29
    assert.deepEqual(clampPagination('2', '10'), { pageNum: 2, pageSize: 10, from: 20, to: 29 });
  });

  it('负数 page：钳到 0（第一页）', () => {
    const r = clampPagination('-5', '12');
    assert.equal(r.pageNum, 0);
    assert.equal(r.from, 0);
  });

  it('limit 超过上限 50：封顶到 50', () => {
    const r = clampPagination('0', '999');
    assert.equal(r.pageSize, 50);
  });

  it('limit 负数：抬到最小 1（-3 为 truthy，走 Math.max(1, -3) → 1）', () => {
    assert.equal(clampPagination('0', '-3').pageSize, 1);
  });

  it('limit="0" 的特殊性：parseInt("0")=0 为 falsy，因此退回默认 12（而非 1）', () => {
    // 这是当前实现的真实行为：`parseInt('0',10) || 12` 中 0 被当成 falsy，故取默认 12。
    // 把它写成显式用例，既记录了这个“反直觉”行为，也能在以后有人改实现时立刻发现差异。
    assert.equal(clampPagination('0', '0').pageSize, 12);
  });

  it('非数字字符串（NaN）：page→0，limit→默认 12', () => {
    const r = clampPagination('abc', 'xyz');
    assert.equal(r.pageNum, 0);
    assert.equal(r.pageSize, 12);
  });

  it('空字符串：退回默认值', () => {
    const r = clampPagination('', '');
    assert.equal(r.pageNum, 0);
    assert.equal(r.pageSize, 12);
  });

  it('limit 恰好 50（上边界）与 1（下边界）：原样保留', () => {
    assert.equal(clampPagination('0', '50').pageSize, 50);
    assert.equal(clampPagination('0', '1').pageSize, 1);
  });

  it('接受数字类型入参（非仅字符串）', () => {
    assert.deepEqual(clampPagination(3, 5), { pageNum: 3, pageSize: 5, from: 15, to: 19 });
  });
});
