// ── 签名分数凭证（score_token）的单元测试 ────────────────────────────────────
// 落地第二步硬化：注册时的 AI 筛选分改为凭服务端签名的 score_token 落库，
// 防止前端自报高分刷撮合排名。scoreFromToken 是唯一的解分入口，
// 这里穷举各种伪造/异常凭证，断言"除合法签名外一律得 0 分、且永不抛错"。

// 必须在 require auth.js 之前设好密钥：auth.js 在模块加载时读取 process.env.JWT_SECRET。
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-score-token';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const { scoreFromToken } = require('../src/routes/auth');

const SECRET = process.env.JWT_SECRET;

describe('scoreFromToken（签名分数凭证解析）', () => {

  it('合法凭证：返回签名里的分数', () => {
    const token = jwt.sign({ score: 85, purpose: 'screen_score' }, SECRET, { expiresIn: '30m' });
    assert.equal(scoreFromToken(token), 85);
  });

  it('凭证缺失（undefined/空串）：返回 0', () => {
    assert.equal(scoreFromToken(undefined), 0);
    assert.equal(scoreFromToken(''), 0);
  });

  it('错误密钥签名（伪造凭证）：返回 0', () => {
    const forged = jwt.sign({ score: 100, purpose: 'screen_score' }, 'attacker-secret');
    assert.equal(scoreFromToken(forged), 0);
  });

  it('拿登录 JWT 冒充（purpose 不对）：返回 0', () => {
    const loginLike = jwt.sign({ userId: 1, email: 'a@b.c', role: 'engineer' }, SECRET);
    assert.equal(scoreFromToken(loginLike), 0);
  });

  it('已过期的凭证：返回 0', () => {
    const expired = jwt.sign({ score: 90, purpose: 'screen_score' }, SECRET, { expiresIn: '-1s' });
    assert.equal(scoreFromToken(expired), 0);
  });

  it('分数越界/非整数：返回 0', () => {
    const over = jwt.sign({ score: 999, purpose: 'screen_score' }, SECRET);
    const frac = jwt.sign({ score: 66.6, purpose: 'screen_score' }, SECRET);
    const neg  = jwt.sign({ score: -5, purpose: 'screen_score' }, SECRET);
    assert.equal(scoreFromToken(over), 0);
    assert.equal(scoreFromToken(frac), 0);
    assert.equal(scoreFromToken(neg), 0);
  });

  it('乱七八糟的非 JWT 字符串：返回 0 且不抛错', () => {
    assert.equal(scoreFromToken('not.a.jwt'), 0);
    assert.equal(scoreFromToken('x'.repeat(500)), 0);
  });
});
