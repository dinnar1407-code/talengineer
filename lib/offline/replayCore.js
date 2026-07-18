// 重放纯决策逻辑（stub）：T2 会替换为真实现（orderOps/classifyFailure/markerParse）。
function orderOps(ops) { return ops; }
function classifyFailure() { return 'retry'; }
function markerParse() { return null; }
module.exports = { orderOps, classifyFailure, markerParse };
