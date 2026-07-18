// 发件箱重放的纯决策逻辑：抽成纯函数便于 node:test 覆盖（IndexedDB 只能在浏览器测）。
// 为什么单独一层：排序/失败分类/标记解析都是无副作用的决策，测清楚它们等于测清楚重放的骨架。

// 按 createdAt 升序排序（稳定）：createdAt 相同则用 id 兜底，保证顺序确定、可测。
// 用展开拷贝再排序，避免原地修改调用方传入的数组（纯函数不应有副作用）。
function orderOps(ops) {
  return [...ops].sort(
    (a, b) => a.createdAt - b.createdAt || String(a.id).localeCompare(String(b.id))
  );
}

// 把 HTTP 状态码分成两类：
// - status=0/undefined 表示 fetch 直接抛错（网络断），5xx/429 是服务端临时问题 → 'retry'（保留 pending 下次再发）
// - 其余 4xx 是业务拒绝（如 400 参数错、409 冲突）→ 'fail'（终态失败，重发也没用）
function classifyFailure(status) {
  if (!status || status >= 500 || status === 429) return 'retry';
  return 'fail';
}

// 解析 QC 图消息标记：'[qc-image:abc/1.jpg]' → { kind:'qc-image', path:'abc/1.jpg' }
// 非标记文本、空路径（'[qc-image:]'）一律返回 null，交给调用方当普通消息处理。
function markerParse(text) {
  const m = /^\[qc-image:(.+)\]$/.exec(text || '');
  return m && m[1] ? { kind: 'qc-image', path: m[1] } : null;
}

module.exports = { orderOps, classifyFailure, markerParse };
