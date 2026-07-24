import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import styles from './coverage.module.css';

// ── 覆盖地图页（W2-1）────────────────────────────────────────────────────────
// 展示平台工程师的地区覆盖：每个地区一张卡（工程师数/可接单数/认证数/TalScore 档位
// 分布条/方向徽章）+ 全站方向汇总条 + founding cohort 叙事段。
// 数据源 = 公开聚合端点 /api/coverage/summary（实时真数，5 分钟缓存），零 PII。
// 诚实空态原则：数字小是事实，不编造统计——文案定位为"实时数据 + 创始工程师群体"。

// 站点根 URL：canonical / OG / JSON-LD 用（照 hire/[track].jsx 模板）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 页面正文 en/zh 两套（全站惯例：页面 body 只做 en/zh，9 语只在 Navbar/ChatBot 壳层）。
const DICT = {
  en: {
    heroBadge: 'Live Coverage Data',
    heroTitle: 'Engineer Coverage Map',
    heroSub: 'Where our industrial automation engineers are — by region, TalScore tier and specialty. Aggregated in real time from active engineer profiles on Talengineer.',
    totalEngineers: 'Engineers',
    totalAvailable: 'Available Now',
    totalCertified: 'Certified',
    totalRegions: 'Regions',
    engineers: 'engineers',
    engineer: 'engineer',
    availableNow: 'available now',
    certifiedLabel: 'certified',
    tierBarLabel: 'TalScore tier distribution:',
    tracksTitle: 'Certification coverage by specialty',
    noTrackData: 'No platform certifications issued yet — our founding engineers are being certified right now.',
    foundingTitle: 'A founding cohort, counted honestly',
    foundingBody1: 'Every number on this page is aggregated live from real engineer profiles and platform certifications — nothing is estimated or inflated. We are early, and we would rather show you a small true number than a big fake one.',
    foundingBody2: 'Our founding cohort of engineers goes through an AI practical screener and platform certification (three levels per specialty) before they can be assigned to projects. Coverage grows as each new engineer is verified.',
    emptyTitle: 'The map starts here',
    emptyBody: 'Our founding engineer cohort is onboarding right now. Every engineer goes through our AI screen and platform certification before they can be assigned to projects — check back soon, or be part of it.',
    tiers: { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze', unrated: 'Unrated' },
    browseBtn: 'Browse Available Engineers →',
    applyBtn: 'Apply as an Engineer',
    ratesCta: 'See rate benchmarks by region →',
    ctaTitle: 'Need an engineer in one of these regions?',
    ctaBody: 'Post your project and get matched with pre-screened, certified engineers. Milestone escrow protects both parties.',
    ctaBtn: 'Post a Project',
    updatedAt: 'Data as of',
  },
  zh: {
    heroBadge: '实时覆盖数据',
    heroTitle: '工程师覆盖地图',
    heroSub: '我们的工业自动化工程师分布在哪里——按地区、TalScore 档位与专业方向展示，数据实时聚合自 Talengineer 平台的工程师档案。',
    totalEngineers: '工程师',
    totalAvailable: '当前可接单',
    totalCertified: '已认证',
    totalRegions: '覆盖地区',
    engineers: '位工程师',
    engineer: '位工程师',
    availableNow: '当前可接单',
    certifiedLabel: '已认证',
    tierBarLabel: 'TalScore 档位分布：',
    tracksTitle: '按方向的认证覆盖',
    noTrackData: '平台认证正在颁发中——创始工程师们正在完成考核认证。',
    foundingTitle: '创始群体，诚实计数',
    foundingBody1: '本页每个数字都实时聚合自真实的工程师档案与平台认证——没有估算，没有注水。我们处在早期，宁可给你看一个小而真的数字，也不给你一个大而假的数字。',
    foundingBody2: '创始工程师群体在被指派项目前，都要通过 AI 实操筛选与平台认证（每个方向三个级别）。每验证一位新工程师，覆盖就多一分。',
    emptyTitle: '地图从这里开始',
    emptyBody: '创始工程师群体正在入驻。每位工程师都要先通过筛选与认证才能被指派项目——欢迎稍后回来，或者成为其中一员。',
    tiers: { platinum: '白金', gold: '金', silver: '银', bronze: '铜', unrated: '未评分' },
    browseBtn: '浏览在线工程师 →',
    applyBtn: '以工程师身份申请',
    ratesCta: '查看各地区费率基准 →',
    ctaTitle: '需要这些地区的工程师？',
    ctaBody: '发布项目，与经过预审、持证的工程师精准匹配。里程碑托管保障双方权益。',
    ctaBtn: '发布项目',
    updatedAt: '数据截至',
  },
};

// 四大认证方向的展示名（cert_tracks 种子 key → 标签；与 /hire/[track] 口径一致）。
// 未来若出现未知 track_key，回退显示原始 key，不炸页面。
const TRACK_LABELS = {
  plc: { en: 'PLC Programming', zh: 'PLC 编程' },
  robotics: { en: 'Robotics', zh: '机器人' },
  vision: { en: 'Machine Vision', zh: '机器视觉' },
  electrical: { en: 'Electrical', zh: '电气' },
};

// 档位配色：半透明底 + 实色字，明暗主题下都清晰（照 TalScoreBadge 的金属色系手法；
// unrated 用中性灰，明确区别于四个质量档——"未评分"不是一种质量评价）。
const TIER_COLORS = {
  platinum: { fg: '#38bdf8', bg: 'rgba(56,189,248,0.55)' },
  gold: { fg: '#f59e0b', bg: 'rgba(245,158,11,0.55)' },
  silver: { fg: '#94a3b8', bg: 'rgba(148,163,184,0.55)' },
  bronze: { fg: '#c2703d', bg: 'rgba(194,112,61,0.55)' },
  unrated: { fg: '#8b8f98', bg: 'rgba(139,143,152,0.28)' },
};

// 分布条/图例的固定展示顺序（高档在前，未评分收尾）
const TIER_ORDER = ['platinum', 'gold', 'silver', 'bronze', 'unrated'];

export default function Coverage() {
  const [lang, setLang] = useLang();
  // data：null = 加载中（渲染骨架屏）；{regions, totals} = 已加载（可能为空数组 → founding 空态）
  const [data, setData] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);

  useEffect(() => {
    fetch('/api/coverage/summary')
      .then((r) => r.json())
      .then((d) => {
        setData(d.data || { regions: [], totals: null });
        setGeneratedAt(d.generated_at || null);
      })
      // 请求失败按空态处理（founding 文案），不渲染错误页
      .catch(() => setData({ regions: [], totals: null }));
  }, []);

  const d = DICT[lang] || DICT.en;

  // 防御性过滤：0 工程师的地区不渲染（聚合端天然不会产出，但前端再兜一层）
  const regions = data ? (data.regions || []).filter((r) => r.engineers > 0) : null;
  const totals = data?.totals || null;

  // Dataset JSON-LD（照 rates.jsx）：把覆盖统计标注为 schema.org 数据集，
  // 让搜索引擎与 AI 爬虫把 /coverage 识别为可引用的数据源（含公开 JSON 端点）。
  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Industrial Automation Engineer Coverage by Region',
    description:
      'Live regional coverage of industrial automation engineers — engineer counts, availability, TalScore tier distribution and certification coverage by specialty (PLC, robotics, machine vision, electrical). Aggregated in real time from active engineer profiles on Talengineer.',
    url: `${SITE}/coverage`,
    creator: { '@type': 'Organization', name: 'Talengineer', url: SITE },
    isAccessibleForFree: true,
    variableMeasured: ['region', 'engineer count', 'availability', 'TalScore tier', 'certified specialty'],
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: `${SITE}/api/coverage/summary`,
    },
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Engineer Coverage Map | Talengineer</title>
        <meta name="description" content="Live regional coverage of industrial automation engineers — counts, availability, TalScore tiers and specialties (PLC, robotics, vision, electrical) by region." />
        <link rel="canonical" href={`${SITE}/coverage`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Engineer Coverage Map | Talengineer" />
        <meta property="og:description" content="Live regional coverage of industrial automation engineers — counts, availability, TalScore tiers and specialties by region." />
        <meta property="og:url" content={`${SITE}/coverage`} />
        <meta property="og:image" content={`${SITE}/og.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Engineer Coverage Map | Talengineer" />
        <meta name="twitter:description" content="Live regional coverage of industrial automation engineers by region and specialty." />
        <meta name="twitter:image" content={`${SITE}/og.png`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
        />
      </Head>

      <Navbar lang={lang} onLangChange={setLang} />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>{d.heroBadge}</div>
          <h1 className={styles.heroTitle}>{d.heroTitle}</h1>
          <p className={styles.heroSub}>{d.heroSub}</p>
        </div>
      </div>

      <div className={styles.container}>
        {/* ── 全站汇总条：工程师/可接单/已认证/覆盖地区 ─────────────────────── */}
        {totals && totals.engineers > 0 && (
          <div className={styles.totalsBar}>
            <div className={styles.totalStat}>
              <div className={styles.totalVal}>{totals.engineers}</div>
              <div className={styles.totalLabel}>{d.totalEngineers}</div>
            </div>
            <div className={styles.totalDivider} />
            <div className={styles.totalStat}>
              <div className={styles.totalVal}>{totals.available}</div>
              <div className={styles.totalLabel}>{d.totalAvailable}</div>
            </div>
            <div className={styles.totalDivider} />
            <div className={styles.totalStat}>
              <div className={styles.totalVal}>{totals.certified}</div>
              <div className={styles.totalLabel}>{d.totalCertified}</div>
            </div>
            <div className={styles.totalDivider} />
            <div className={styles.totalStat}>
              <div className={styles.totalVal}>{regions.length}</div>
              <div className={styles.totalLabel}>{d.totalRegions}</div>
            </div>
          </div>
        )}

        {/* ── 地区卡片网格 ────────────────────────────────────────────────────── */}
        {regions === null ? (
          // 加载骨架（SSR 首帧也是这个分支，保持合法英文/无数据闪烁）
          <div className={styles.grid}>
            {[0, 1, 2].map((i) => <div key={i} className={styles.cardSkeleton} />)}
          </div>
        ) : regions.length === 0 ? (
          // 全空 → founding 空态（诚实文案，不编造数字）
          <div className={styles.emptyBox}>
            <h2>{d.emptyTitle}</h2>
            <p>{d.emptyBody}</p>
            <div className={styles.emptyBtns}>
              <Link href="/talent" className={styles.btnPrimary}>{d.applyBtn}</Link>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            {regions.map((r) => (
              <div key={r.region} className={styles.card}>
                <div className={styles.cardRegion}>{r.region}</div>
                <div className={styles.cardCount}>
                  {r.engineers}
                  <span> {r.engineers === 1 ? d.engineer : d.engineers}</span>
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.metaAvailable}>{r.available} {d.availableNow}</span>
                  <span className={styles.metaCertified}>🎓 {r.certified} {d.certifiedLabel}</span>
                </div>

                {/* 档位分布条：宽度按占比，颜色照 TalScoreBadge 金属色系 */}
                <div className={styles.tierLabel}>{d.tierBarLabel}</div>
                <div className={styles.tierBar}>
                  {TIER_ORDER.filter((t) => r.tiers?.[t] > 0).map((t) => (
                    <div
                      key={t}
                      className={styles.tierSeg}
                      style={{ width: `${(r.tiers[t] / r.engineers) * 100}%`, background: TIER_COLORS[t].bg }}
                      title={`${d.tiers[t]}: ${r.tiers[t]}`}
                    />
                  ))}
                </div>
                <div className={styles.tierLegend}>
                  {TIER_ORDER.filter((t) => r.tiers?.[t] > 0).map((t) => (
                    <span key={t} className={styles.tierChip} style={{ color: TIER_COLORS[t].fg }}>
                      {d.tiers[t]} {r.tiers[t]}
                    </span>
                  ))}
                </div>

                {/* 方向徽章：该地区有认证覆盖的方向（人数 + 最高级）*/}
                {r.tracks && Object.keys(r.tracks).length > 0 && (
                  <div className={styles.trackList}>
                    {Object.entries(r.tracks).map(([key, t]) => (
                      <span key={key} className={styles.trackChip}>
                        {(TRACK_LABELS[key] ? (TRACK_LABELS[key][lang] || TRACK_LABELS[key].en) : key)} · L{t.max_level} × {t.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── 方向汇总条：全站四方向认证覆盖（有工程师才渲染；无认证给诚实文案）── */}
        {totals && totals.engineers > 0 && (
          <div className={styles.infoBox}>
            <h2>{d.tracksTitle}</h2>
            {Object.keys(totals.tracks || {}).length > 0 ? (
              <div className={styles.trackSummary}>
                {Object.entries(totals.tracks).map(([key, t]) => (
                  <div key={key} className={styles.trackSummaryItem}>
                    <div className={styles.trackSummaryName}>
                      {(TRACK_LABELS[key] ? (TRACK_LABELS[key][lang] || TRACK_LABELS[key].en) : key)}
                    </div>
                    <div className={styles.trackSummaryVal}>
                      {t.count} {d.certifiedLabel} · max L{t.max_level}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>{d.noTrackData}</p>
            )}
          </div>
        )}

        {/* ── founding 叙事段：为什么数字小 + 数字为什么可信 ────────────────── */}
        <div className={styles.infoBox}>
          <h2>{d.foundingTitle}</h2>
          <p>{d.foundingBody1}</p>
          <p style={{ marginTop: 12 }}>{d.foundingBody2}</p>
          {generatedAt && (
            <p className={styles.updatedAt}>{d.updatedAt} {new Date(generatedAt).toISOString().slice(0, 16).replace('T', ' ')} UTC</p>
          )}
          <div className={styles.linkRow}>
            <Link href="/talent" className={styles.btnBrowse}>{d.browseBtn}</Link>
            <Link href="/rates" className={styles.btnBrowse}>{d.ratesCta}</Link>
          </div>
        </div>

        {/* ── 底部 CTA（照 rates.jsx）───────────────────────────────────────── */}
        <div className={styles.ctaBox}>
          <div>
            <h2>{d.ctaTitle}</h2>
            <p>{d.ctaBody}</p>
          </div>
          <Link href="/finance" className={styles.btnCta}>{d.ctaBtn}</Link>
        </div>
      </div>

      {/* 共享页脚：链接由 lib/navConfig.js FOOTER_COLUMNS 单一来源驱动（原手写简版页脚已移除） */}
      <Footer lang={lang} />
    </div>
  );
}
