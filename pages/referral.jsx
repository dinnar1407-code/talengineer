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
import { useLang } from '../hooks/useLang';
import styles from './referral.module.css';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// en/zh 文案字典（页面正文 en/zh 两套即可；9 语只在 Navbar 等外壳组件）
const UI = {
  en: {
    kicker: 'Referral Program',
    title: 'Refer a friend to Talengineer',
    sub: 'Know an automation engineer looking for global projects — or a factory that needs one? Share your personal code and get credit when they succeed on the platform.',
    comingSoon: 'The referral program is launching soon. You can already claim your code below — every sign-up you refer from today counts toward your rewards.',
    live: 'The referral program is live. Share your code and start referring.',
    howTitle: 'How it works',
    step1t: '1 · Get your code',
    step1b: 'Sign in and claim your personal referral code on this page.',
    step2t: '2 · Share it',
    step2b: 'Your friend enters the code when creating their Talengineer account.',
    step3t: '3 · It vests',
    step3b: 'When the person you referred completes their first released milestone — as an employer or an engineer — the referral vests.',
    rewardTitle: 'Reward',
    myTitle: 'My referral code',
    loginLead: 'Sign in to claim your referral code. Referrals are attributed from the day your friend signs up.',
    loginCta: 'Sign in to get your code',
    copy: 'Copy',
    copied: 'Copied!',
    loadError: 'Could not load your referral info. Please try again later.',
    listTitle: 'People you referred',
    colWho: 'Referred',
    colStatus: 'Status',
    colDate: 'Date',
    empty: 'No referrals yet — share your code to get started.',
    stAttributed: 'Attributed',
    stVested: 'Vested',
    stVoid: 'Void',
    ruleNote:
      'Vesting rule: a referral vests when the referred user completes their first released milestone on the platform. Reward details will be announced at launch. Self-referrals are not eligible.',
    loading: 'Loading…',
  },
  zh: {
    kicker: '推荐计划',
    title: '把朋友推荐到 Talengineer',
    sub: '认识正在找全球项目的自动化工程师，或需要工程师的工厂？分享你的专属推荐码，他们在平台上做成事，你就能获得奖励。',
    comingSoon: '推荐计划即将上线。你现在就可以在下方领取推荐码——从今天起你推荐的每个注册都会计入奖励归因。',
    live: '推荐计划已上线。分享你的推荐码，开始推荐吧。',
    howTitle: '如何运作',
    step1t: '1 · 领取推荐码',
    step1b: '登录后在本页领取你的专属推荐码。',
    step2t: '2 · 分享出去',
    step2b: '朋友注册 Talengineer 账号时填入你的推荐码。',
    step3t: '3 · 达成兑现',
    step3b: '当你推荐的人完成平台上第一个放款（released）里程碑——无论作为雇主还是工程师——这条推荐即告兑现。',
    rewardTitle: '奖励',
    myTitle: '我的推荐码',
    loginLead: '登录后即可领取推荐码。推荐归因从朋友注册当天开始计算。',
    loginCta: '登录领取推荐码',
    copy: '复制',
    copied: '已复制！',
    loadError: '推荐信息加载失败，请稍后重试。',
    listTitle: '我推荐的人',
    colWho: '被推荐人',
    colStatus: '状态',
    colDate: '日期',
    empty: '还没有推荐记录——分享你的码，从第一个开始。',
    stAttributed: '已归因',
    stVested: '已兑现',
    stVoid: '已作废',
    ruleNote:
      '兑现规则：被推荐用户在平台上完成第一个放款（released）里程碑时，该条推荐即告兑现。具体奖励将在正式上线时公布。自己推荐自己不计入。',
    loading: '加载中…',
  },
};

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
        <title>{`${UI.en.title} | Talengineer`}</title>
        <meta name="description" content={UI.en.sub} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={UI.en.title} />
        <meta property="og:description" content={UI.en.sub} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={UI.en.title} />
        <meta name="twitter:description" content={UI.en.sub} />
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

      <footer className={styles.footer}>
        <p>
          © 2025 Talengineer.us · <Link href="/talent">Find Engineers</Link> ·{' '}
          <Link href="/rates">Rate Benchmarks</Link> ·{' '}
          <Link href="/playbook">Playbook</Link>
        </p>
      </footer>
    </div>
  );
}
