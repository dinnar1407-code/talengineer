// IndexedDB 包装（stub)：T2 会替换为真实现。stub 保证并行任务可编译、可 build。
// 契约：库名 tal-offline，stores: mirror / outbox / meta。
async function openDb() { return null; }
async function mirrorGet() { return null; }
async function mirrorPut() {}
async function mirrorClearAll() {}
module.exports = { openDb, mirrorGet, mirrorPut, mirrorClearAll };
