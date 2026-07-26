// ── 工具确认令牌（Wave B / B2）───────────────────────────────────────────────
// 用途：tier='confirm' 的工具（T2 状态迁移类）不由 agent 直接执行——registry 先返回一份
// 「提案 + 令牌」，前端渲染确认卡，用户点了才拿令牌回来执行。
//
// 令牌绑死四件事，每一件都堵一个具体的伪造方式：
//   purpose   —— 防令牌混用：登录 JWT 不能当确认令牌使（照 auth.js 的 score_token 先例）
//   userId    —— 防 A 的令牌确认成 B 的动作
//   tool      —— 防拿"改个人简介"的令牌去执行"投递项目"
//   argsHash  —— 防「预览的是 A，执行的是 B」：令牌里只存哈希，参数由前端回传，
//                服务端重算哈希比对。这样确认的必然就是用户看到的那份。
//
// ⚠️ 已知边界（不是疏漏，是权衡）：令牌绑定单个动作但**不是一次性**的。TTL 内重放会把
// 用户自己的动作再做一遍——这不是提权，最常见的成因是用户双击。60 秒内的同参重复由
// agent_actions 的近重复防护挡掉（见 agentAudit.findRecentDuplicate）。要做真一次性
// 需要额外的已用令牌表，收益不抵复杂度，等真出现滥用再加。
const jwt = require('jsonwebtoken');
const { hashArgs } = require('./agentAudit');

const PURPOSE = 'tool_confirm';
const TTL_SECONDS = 300; // 5 分钟：够用户读完确认卡再决定，又不至于长到能揣着到处用

/**
 * 签发确认令牌。
 * @param {object} p { userId:number|string, tool:string, args:object }
 * @returns {string} JWT
 */
function issue({ userId, tool, args }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(
    { purpose: PURPOSE, userId, tool, argsHash: hashArgs(args) },
    secret,
    { expiresIn: TTL_SECONDS },
  );
}

/**
 * 校验确认令牌与本次提交的参数是否严丝合缝。
 * 失败一律返回 {ok:false, error}，绝不抛——调用方是路由，需要的是可回给用户的文案。
 * @param {string} token
 * @param {object} p { userId, tool, args } 本次请求实际要执行的身份/工具/参数
 */
function verify(token, { userId, tool, args }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return { ok: false, error: 'Server misconfiguration.' };
  if (!token || typeof token !== 'string') return { ok: false, error: 'Missing confirmation token.' };

  let payload;
  try {
    payload = jwt.verify(token, secret);
  } catch (err) {
    // 过期与伪造给同一句话：区分开来等于告诉试探者"签名对了只是过期了"
    return { ok: false, error: 'This confirmation has expired. Please ask again.' };
  }

  if (payload.purpose !== PURPOSE) return { ok: false, error: 'Invalid confirmation token.' };
  // String() 归一：JWT 里的数字与 req.user.userId 的类型在不同路径下可能一个是 number 一个是 string
  if (String(payload.userId) !== String(userId)) return { ok: false, error: 'Invalid confirmation token.' };
  if (payload.tool !== tool) return { ok: false, error: 'Invalid confirmation token.' };
  if (payload.argsHash !== hashArgs(args)) {
    // 参数被改过——用户确认的不是这份。文案说清楚，因为这也可能是前端 bug 而非攻击。
    return { ok: false, error: 'The action changed since you confirmed it. Please try again.' };
  }
  return { ok: true };
}

module.exports = { issue, verify, PURPOSE, TTL_SECONDS };
