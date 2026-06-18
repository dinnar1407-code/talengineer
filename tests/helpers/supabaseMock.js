// ── 手写 Supabase 客户端 Mock（零依赖，不连真实数据库/网络）────────────────────
// 为什么要 mock：被测代码（如 ownership.js）通过 supabase 客户端做链式查询
//   supabase.from('demands').select('id, employer_id').eq('id', x).single()
// 真跑会连云端 Postgres——单元测试既慢又不稳定，还会污染数据。
// 这里手写一个“长得像 Supabase 客户端”的假对象：链式方法都返回自身（builder），
// 直到 .single() / .maybeSingle() 这种“终结方法”才返回一个 resolve 成预设数据的 Promise。
//
// 设计要点：
// 1) 按“表名”预置每张表要返回的结果，调用方只关心 from(table) 拿到什么。
// 2) 记录所有链式调用（calls），测试里可以断言“确实带了 status='accepted' 这个过滤条件”。
// 3) 终结方法读取该表预置结果；若预置为数组，则按调用顺序逐个弹出（支持同一表查多次返回不同值）。

/**
 * 创建一个假的 Supabase 客户端。
 *
 * @param {Object<string, ({data:any,error:any})|Array<{data:any,error:any}>>} tableResults
 *   形如 { demands: { data:{...}, error:null }, talents: { data:null, error:null } }
 *   值可以是单个 {data,error}（每次终结都返回它），
 *   也可以是数组（按调用顺序依次返回，适合同一表被查多次的场景）。
 * @returns {{ client: object, calls: object[] }}
 *   client：传给被测函数的假客户端；calls：记录的调用日志，便于断言过滤条件。
 */
function createSupabaseMock(tableResults = {}) {
  const calls = [];
  // 每张表用一个游标记录“已被终结几次”，配合数组结果实现“多次查询返回不同值”。
  const cursors = {};

  function nextResult(table) {
    const preset = tableResults[table];
    // 没预置就给个安全的空结果，避免 undefined 解构报错。
    if (preset === undefined) return { data: null, error: null };
    if (Array.isArray(preset)) {
      const i = cursors[table] || 0;
      cursors[table] = i + 1;
      // 数组用尽后重复返回最后一个，避免越界 undefined。
      return preset[i] !== undefined ? preset[i] : preset[preset.length - 1];
    }
    return preset;
  }

  // 创建一个查询构造器（builder）：链式方法返回自身，终结方法返回 Promise。
  function makeBuilder(table) {
    const builder = {
      // 链式（非终结）方法：记录调用并返回自身，模拟 PostgREST 的可链式 API。
      select(...args) { calls.push({ table, method: 'select', args }); return builder; },
      eq(...args)     { calls.push({ table, method: 'eq', args }); return builder; },
      update(...args) { calls.push({ table, method: 'update', args }); return builder; },
      insert(...args) { calls.push({ table, method: 'insert', args }); return builder; },
      order(...args)  { calls.push({ table, method: 'order', args }); return builder; },
      // 终结方法：返回 resolve 成预置结果的 Promise。
      single()      { calls.push({ table, method: 'single' });      return Promise.resolve(nextResult(table)); },
      maybeSingle() { calls.push({ table, method: 'maybeSingle' }); return Promise.resolve(nextResult(table)); },
      // 让 builder 成为 thenable：当代码直接 await 链（如 update().eq()）而非调用终结方法时，
      // PostgREST 也会执行查询。这里把 await 的结果也对齐成 {data,error}，避免“await 到一个普通对象”的语义偏差。
      then(resolve, reject) { return Promise.resolve(nextResult(table)).then(resolve, reject); },
    };
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

module.exports = { createSupabaseMock };
