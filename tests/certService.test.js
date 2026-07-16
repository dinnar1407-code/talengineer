// ── 认证门禁（certService）单元测试 ───────────────────────────────────────────
// "现场正式工作授权"的判定中枢：有效证过滤（吊销/过期）与指派资格判定。
// 用手写 supabase mock（同 ownership 测试模式），不连真实数据库。

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { getValidCertifications, checkAssignEligibility } = require('../src/services/certService');
const { createSupabaseMock } = require('./helpers/supabaseMock');

// 便捷构造：一条 platform_certifications 关联行（含 cert_tracks 内嵌）
function certRow({ track = 'plc', level = 1, expires_at = null, revoked = false } = {}) {
  return {
    level, issued_at: '2026-07-01T00:00:00Z', expires_at, revoked,
    cert_tracks: { track_key: track, name_en: track.toUpperCase(), name_zh: track },
  };
}

describe('getValidCertifications（有效证过滤）', () => {

  it('过滤掉已过期的证，保留长期有效（expires_at=NULL）与未到期的', async () => {
    const { client } = createSupabaseMock({
      platform_certifications: { data: [
        certRow({ track: 'plc', expires_at: null }),                       // 长期有效
        certRow({ track: 'vision', expires_at: '2020-01-01T00:00:00Z' }), // 已过期
        certRow({ track: 'robotics', expires_at: '2099-01-01T00:00:00Z' }), // 未到期
      ], error: null },
    });
    const certs = await getValidCertifications(client, 7);
    assert.deepEqual(certs.map((c) => c.track_key).sort(), ['plc', 'robotics']);
  });

  it('空结果返回空数组；查询报错则抛出（调用方兜底）', async () => {
    const { client: emptyClient } = createSupabaseMock({
      platform_certifications: { data: [], error: null },
    });
    assert.deepEqual(await getValidCertifications(emptyClient, 7), []);

    const { client: errClient } = createSupabaseMock({
      platform_certifications: { data: null, error: new Error('db down') },
    });
    await assert.rejects(() => getValidCertifications(errClient, 7));
  });
});

describe('checkAssignEligibility（指派资格门禁）', () => {

  it('一个证都没有：no_certification 拒绝', async () => {
    const { client } = createSupabaseMock({
      platform_certifications: { data: [], error: null },
    });
    const r = await checkAssignEligibility(client, 7, null);
    assert.equal(r.allowed, false);
    assert.equal(r.reason, 'no_certification');
  });

  it('需求未指定方向：持任一有效证即放行', async () => {
    const { client } = createSupabaseMock({
      platform_certifications: { data: [certRow({ track: 'plc' })], error: null },
    });
    const r = await checkAssignEligibility(client, 7, null);
    assert.equal(r.allowed, true);
  });

  it('需求指定方向：缺该方向的证拒绝（missing_required_track）、持有则放行', async () => {
    const holdings = { data: [certRow({ track: 'plc' })], error: null };

    const { client: c1 } = createSupabaseMock({ platform_certifications: holdings });
    const miss = await checkAssignEligibility(c1, 7, 'vision');
    assert.equal(miss.allowed, false);
    assert.equal(miss.reason, 'missing_required_track');

    const { client: c2 } = createSupabaseMock({ platform_certifications: holdings });
    const hit = await checkAssignEligibility(c2, 7, 'plc');
    assert.equal(hit.allowed, true);
  });

  it('指定方向的证已过期：等同没有，拒绝', async () => {
    const { client } = createSupabaseMock({
      platform_certifications: { data: [certRow({ track: 'vision', expires_at: '2020-01-01T00:00:00Z' })], error: null },
    });
    const r = await checkAssignEligibility(client, 7, 'vision');
    assert.equal(r.allowed, false);
    // 过期证被有效性过滤后一个证都不剩 → no_certification
    assert.equal(r.reason, 'no_certification');
  });
});
