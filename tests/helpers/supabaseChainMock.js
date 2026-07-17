// ── 手写 Supabase 客户端 Mock（增强版，支持 .in()/.limit() 等链式方法）──────────
// 与 tests/helpers/supabaseMock.js 同一设计（链式方法返回自身，终结方法/await 返回预置结果），
// 但支付/纠纷路由用到了 .in()、.limit() 等原 mock 未覆盖的方法，故单独提供一份更全的实现，
// 避免改动已被其它测试依赖的 supabaseMock.js。
//
// 设计要点：
// 1) 按"表名"预置每张表要返回的结果（{data,error}）。
// 2) 值可为数组：同一张表被多次查询/更新时，按【终结调用顺序】依次返回不同结果
//    （payment/disputes 会对 project_milestones 反复 select→update→update）。数组用尽后重复最后一个。
// 3) 记录所有链式调用（calls），测试可断言"确实带了 .eq('status','releasing')"或读取 update() 的 payload。
// 4) 终结点包括 .single() / .maybeSingle()，以及【直接 await 链】（builder 是 thenable）。

function makeSupabase(tableResults = {}) {
  const calls = [];
  const cursors = {};

  function nextResult(table) {
    const preset = tableResults[table];
    if (preset === undefined) return { data: null, error: null };
    if (Array.isArray(preset)) {
      const i = cursors[table] || 0;
      cursors[table] = i + 1;
      return preset[i] !== undefined ? preset[i] : preset[preset.length - 1];
    }
    return preset;
  }

  function makeBuilder(table) {
    const builder = {};
    // 非终结链式方法：记录调用并返回自身。覆盖 PostgREST 常见过滤/写入方法。
    const chain = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in',
      'is', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'contains', 'match',
      'not', 'or', 'filter', 'order', 'limit', 'range'];
    chain.forEach((m) => {
      builder[m] = (...args) => { calls.push({ table, method: m, args }); return builder; };
    });
    // 终结方法：返回 resolve 成预置结果的 Promise。
    builder.single = () => { calls.push({ table, method: 'single' }); return Promise.resolve(nextResult(table)); };
    builder.maybeSingle = () => { calls.push({ table, method: 'maybeSingle' }); return Promise.resolve(nextResult(table)); };
    // 让 builder 成为 thenable：当代码直接 await 链（如 update().eq().eq()）时也消费一个结果。
    builder.then = (resolve, reject) => Promise.resolve(nextResult(table)).then(resolve, reject);
    return builder;
  }

  const client = {
    from(table) {
      calls.push({ table, method: 'from' });
      return makeBuilder(table);
    },
  };

  return { client, calls };
}

module.exports = { makeSupabase };
