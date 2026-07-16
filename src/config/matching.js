// ── 撮合池配置（落地第一步 #3"入网硬门槛"的开关化实现）────────────────────────
// 背景：设计文档定的 #3 是"工程师进池前 AI 筛选达标，verified_score 作硬门槛"，
// 但当时池子里老工程师的历史分全是 0（#1 的旧 bug 所致），立刻开门槛会当场清空撮合池，
// 故决定暂缓。这里把门槛做成环境变量开关：代码先上线、默认关闭（阈值 0 = 不过滤），
// 等池子分数积累够了，在 Railway 设 MIN_POOL_VERIFIED_SCORE=60 即可拧开，无需改代码。
//
// 作用范围：只影响 Matchmaker 的推荐候选池（AI 冷邮件 + smart_match 通知），
// 不影响公开人才列表展示，也不影响工程师主动申请——门槛管"平台背书推荐谁"，
// 不剥夺任何人自主接单的机会（与路径 A"平台精选并背书"的定位一致）。
// 仿照 src/config/fees.js 的模式：env 可调 + 越界回退默认值。

const raw = Number(process.env.MIN_POOL_VERIFIED_SCORE);

// 仅接受 0-100 的整数；非法/缺失一律回退 0（门槛关闭），配置错误不至于清空撮合池。
const MIN_POOL_VERIFIED_SCORE =
  Number.isInteger(raw) && raw >= 0 && raw <= 100 ? raw : 0;

module.exports = { MIN_POOL_VERIFIED_SCORE };
