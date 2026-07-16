// ── 平台认证门禁（"现场正式工作授权"的判定中枢）──────────────────────────────
// 业务规则（用户 2026-07-16 确认）：工程师可浏览/申请/沟通，但**被正式指派**（assign）
// 前必须持有效平台认证；workorder 到场 checkin 做兜底二道门禁。
// "有效" = platform_certifications 里 未吊销 且 未过期（expires_at 为 NULL 视为长期）。
// 若 demand 指定了 required_cert_track，则必须持有**该方向**的有效证；
// 未指定则持有任一方向的有效证即可（认证内容与单子的匹配由雇主看徽章自行判断）。
//
// 注意：门禁只读 platform_certifications（平台考核颁发，可信），
// 不读 talents.level（自报文本）也不读 engineer_certifications（外部证书，仅参考展示）。

/**
 * 查询某工程师的全部有效平台认证。
 * @returns {Promise<Array<{track_key, track_name_en, track_name_zh, level, issued_at, expires_at}>>}
 */
async function getValidCertifications(supabase, talentId) {
  const { data, error } = await supabase
    .from('platform_certifications')
    .select('level, issued_at, expires_at, revoked, cert_tracks(track_key, name_en, name_zh)')
    .eq('talent_id', talentId)
    .eq('revoked', false);
  if (error) throw error;

  const now = Date.now();
  return (data || [])
    .filter((c) => !c.expires_at || new Date(c.expires_at).getTime() > now)
    .map((c) => ({
      track_key: c.cert_tracks?.track_key,
      track_name_en: c.cert_tracks?.name_en,
      track_name_zh: c.cert_tracks?.name_zh,
      level: c.level,
      issued_at: c.issued_at,
      expires_at: c.expires_at,
    }));
}

/**
 * 门禁判定：该工程师是否有资格被正式指派/到场开工。
 * @param {string|null} requiredTrackKey - demand.required_cert_track（未指定为 null）
 * @returns {Promise<{allowed: boolean, certs: Array, reason: string|null}>}
 *   reason ∈ 'no_certification'（一个证都没有）| 'missing_required_track'（缺指定方向的证）
 */
async function checkAssignEligibility(supabase, talentId, requiredTrackKey) {
  const certs = await getValidCertifications(supabase, talentId);
  if (certs.length === 0) {
    return { allowed: false, certs, reason: 'no_certification' };
  }
  if (requiredTrackKey && !certs.some((c) => c.track_key === requiredTrackKey)) {
    return { allowed: false, certs, reason: 'missing_required_track' };
  }
  return { allowed: true, certs, reason: null };
}

module.exports = { getValidCertifications, checkAssignEligibility };
