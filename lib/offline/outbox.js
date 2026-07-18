// 离线发件箱（stub）：T2 会替换为真实现。stub 保证并行任务可编译、可 build。
async function enqueue() { return null; }
async function listPending() { return []; }
async function markFailed() {}
async function markDone() {}
async function replayAll() { return { done: 0, failed: 0, remaining: 0 }; }
async function pendingCount() { return 0; }
module.exports = { enqueue, listPending, markFailed, markDone, replayAll, pendingCount };
