// ── 分页参数钳制（clamp）工具 ────────────────────────────────────────────────
// 背景：列表接口的 page / limit 来自用户可控的 query 参数（字符串），
// 直接拿去算 .range(from, to) 很危险——负数、NaN、超大值都会让查询越界或一次拉太多数据。
// 这里把“把字符串解析成安全整数并钳制到合法范围”的逻辑抽成纯函数，
// 既能被路由复用（单一事实来源，避免各处重复写公式），也能被单元测试直接覆盖。
//
// 为什么是纯函数：输入只有两个值、输出只有一个对象，没有任何 I/O / 全局状态，
// 这类函数最适合写单元测试——同样的输入永远得到同样的输出，断言简单可靠。

/**
 * 把原始的 page / limit 字符串钳制成安全的分页参数。
 *
 * @param {string|number} [page='0']   页码（从 0 开始）。负数 / NaN / 非法值 → 0。
 * @param {string|number} [limit='12'] 每页条数。会被钳制到 [1, 50]；NaN / 非法值 → 默认 12。
 * @returns {{ pageNum: number, pageSize: number, from: number, to: number }}
 *   pageNum  钳制后的页码（>= 0）
 *   pageSize 钳制后的每页条数（1 ~ 50）
 *   from     Supabase .range() 的起始索引（含）
 *   to       Supabase .range() 的结束索引（含）
 */
function clampPagination(page = '0', limit = '12') {
  // parseInt 解析失败（NaN/非数字）时，|| 会退回默认值（0 / 12）。
  // 注意：parseInt('') 和 parseInt('abc') 都是 NaN，NaN 为 falsy，所以会走到 || 右侧。
  const pageNum = Math.max(0, parseInt(page, 10) || 0);
  // limit 钳制到 1~50：先 Math.max(1, ...) 保证至少 1，再 Math.min(50, ...) 封顶 50。
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const from = pageNum * pageSize;
  const to = from + pageSize - 1;
  return { pageNum, pageSize, from, to };
}

module.exports = { clampPagination };
