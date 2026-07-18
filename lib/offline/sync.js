// 同步引擎（stub）：T2 会替换为真实现（mirrorFetch SWR + runSync 全局触发绑定）。
async function mirrorFetch(domain, fetcher) { return fetcher ? fetcher() : null; }
function runSync() {}
module.exports = { mirrorFetch, runSync };
