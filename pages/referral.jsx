// ── 推荐计划页（/referral，W2-4）──────────────────────────────────────────────
// 模板照 pages/hire/[track].jsx：useLang + en/zh 内联 dict（|| en 兜底）+ canonical/OG
// + JSON-LD + module.css 全 var(--token)。SSR 首帧是合法英文（useLang 客户端才生效，
// user/config 都在 useEffect 里取，SSR 渲染未登录 + 无横幅的默认态，无 hydration 风险）。
//
// 数字纪律：奖励金额未定价（config.reward_usd=null）——页面在 null 时完全隐藏金额区块，
// 只展示规则文案。enabled=false 时展示"即将上线 + 现在就能领码（归因从今天算数）"。
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { DICT as UI } from '../lib/i18n/referral';
import styles from './referral.module.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// en/zh 文案字典已迁至 lib/i18n/referral.js（2026-07-24，架构 B 迁移）
// 状态 → 徽章样式类名映射（未知状态兜底为 void 样式）
const BADGE_CLASS = {
  attributed: 'badgeAttributed',
  vested: 'badgeVested',
  void: 'badgeVoid',
};

export default function ReferralPage() {
  const [lang, setLang] = useLang();
  const u = UI[lang] || UI.en;

  // 登录态：localStorage 'tal_user'（客户端才有；SSR 恒为 null → 渲染登录 CTA）
  const [user, setUser] = useState(null);
  // /api/referral/config：enabled + reward_usd（null 隐藏金额）。SSR 无 cfg → 不渲染横幅。
  const [cfg, setCfg] = useState(null);
  // /api/referral/me：{code, referrals}；'error' 表示加载失败
  const [me, setMe] = useState(null);
  const [meError, setMeError] = useState(false);
  const [copied, setCopied] = useState(false);

  // 读登录态（仅客户端）
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tal_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.token) setUser(parsed);
      }
    } catch { /* 本地存储损坏视为未登录 */ }
  }, []);

  // 拉公开配置（决定"已上线/即将上线"横幅）
  useEffect(() => {
    let alive = true;
    fetch('/api/referral/config')
      .then((r) => r.json())
      .then((j) => { if (alive && j && j.data) setCfg(j.data); })
      .catch(() => { /* 配置拉不到就不显示横幅，页面其余部分照常 */ });
    return () => { alive = false; };
  }, []);

  // 登录后拉我的码 + 推荐列表（服务端会在此时懒生成码 + 懒评估兑现）
  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetch('/api/referral/me', { headers: { Authorization: `Bearer ${user.token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('load failed'))))
      .then((j) => { if (alive && j && j.data) setMe(j.data); })
      .catch(() => { if (alive) setMeError(true); });
    return () => { alive = false; };
  }, [user]);

  // 复制推荐码到剪贴板（失败静默——按钮文案不变即可感知）
  const copyCode = () => {
    if (!me || !me.code) return;
    try {
      navigator.clipboard.writeText(me.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    } catch { /* 老浏览器无 clipboard API：静默 */ }
  };

  const canonical = `${SITE}/referral`;
  const ogImage = `${SITE}/og.png`;

  // WebPage 结构化数据（页面内容本身，不含任何金额数字）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: UI.en.title,
    description: UI.en.sub,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'Talengineer', url: SITE },
  };

  const statusLabel = (s) => {
    if (s === 'vested') return u.stVested;
    if (s === 'void') return u.stVoid;
    return u.stAttributed;
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>{`${u.title} | Talengineer`}</title>
        <meta name="description" content={u.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={u.title} />
        <meta property="og:description" content={u.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={u.title} />
        <meta name="twitter:description" content={u.sub} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>{u.kicker}</p>
          <h1 className={styles.heroTitle}>{u.title}</h1>
          <p className={styles.heroSub}>{u.sub}</p>
        </div>
        {/* 上线状态横幅：cfg 拉到后才渲染（SSR 无横幅，避免闪错文案） */}
        {cfg && (
          <div className={cfg.enabled ? `${styles.banner} ${styles.bannerLive}` : styles.banner}>
            {cfg.enabled ? u.live : u.comingSoon}
          </div>
        )}
      </div>

      <div className={styles.container}>
        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.howTitle}</h2>
          <div className={styles.stepGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepTag}>{u.step1t}</div>
              <p className={styles.stepDesc}>{u.step1b}</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepTag}>{u.step2t}</div>
              <p className={styles.stepDesc}>{u.step2b}</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepTag}>{u.step3t}</div>
              <p className={styles.stepDesc}>{u.step3b}</p>
            </div>
          </div>
          <p className={styles.note}>{u.ruleNote}</p>
        </div>

        {/* 金额区块：reward_usd 未定价（null）时整块隐藏——数字纪律，不编数字 */}
        {cfg && typeof cfg.reward_usd === 'number' && (
          <div className={styles.block}>
            <h2 className={styles.sectionTitle}>{u.rewardTitle}</h2>
            <p className={styles.lead}>${cfg.reward_usd}</p>
          </div>
        )}

        <div className={styles.block}>
          <h2 className={styles.sectionTitle}>{u.myTitle}</h2>
          {!user && (
            <>
              <p className={`${styles.lead} ${styles.leadMuted}`}>{u.loginLead}</p>
              <Link href="/onboarding" className={styles.btnPrimary}>{u.loginCta}</Link>
            </>
          )}
          {user && meError && (
            <p className={`${styles.lead} ${styles.leadMuted}`}>{u.loadError}</p>
          )}
          {user && !meError && !me && (
            <p className={`${styles.lead} ${styles.leadMuted}`}>{u.loading}</p>
          )}
          {user && me && (
            <>
              <div className={styles.codeBox}>
                <span className={styles.codeText}>{me.code}</span>
                <button type="button" className={styles.copyBtn} onClick={copyCode}>
                  {copied ? u.copied : u.copy}
                </button>
              </div>

              <h2 className={styles.sectionTitle} style={{ marginTop: 32 }}>{u.listTitle}</h2>
              {(!me.referrals || me.referrals.length === 0) ? (
                <p className={`${styles.lead} ${styles.leadMuted}`}>{u.empty}</p>
              ) : (
                <table className={styles.refTable}>
                  <thead>
                    <tr>
                      <th>{u.colWho}</th>
                      <th>{u.colStatus}</th>
                      <th>{u.colDate}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {me.referrals.map((r) => (
                      <tr key={r.id}>
                        <td>{r.referred_email || '—'}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[BADGE_CLASS[r.status] || 'badgeVoid']}`}>
                            {statusLabel(r.status)}
                          </span>
                        </td>
                        <td>{r.created_at ? String(r.created_at).slice(0, 10) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </div>
  );
}
