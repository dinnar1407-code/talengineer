import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLang } from '../hooks/useLang';
import { DICT } from '../lib/i18n/coverage';
import styles from './coverage.module.css';

// ── 覆盖地图页（W2-1）────────────────────────────────────────────────────────
// 展示平台工程师的地区覆盖：每个地区一张卡（工程师数/可接单数/认证数/TalScore 档位
// 分布条/方向徽章）+ 全站方向汇总条 + founding cohort 叙事段。
// 数据源 = 公开聚合端点 /api/coverage/summary（实时真数，5 分钟缓存），零 PII。
// 诚实空态原则：数字小是事实，不编造统计——文案定位为"实时数据 + 创始工程师群体"。

// 站点根 URL：canonical / OG / JSON-LD 用（照 hire/[track].jsx 模板）。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 页面正文 en/zh 字典已迁至 lib/i18n/coverage.js（2026-07-24，架构 B 迁移）。
// 四大认证方向的展示名（cert_tracks 种子 key → 标签；与 /hire/[track] 口径一致）。
// 未来若出现未知 track_key，回退显示原始 key，不炸页面。
const TRACK_LABELS = {
  plc: { en: 'PLC Programming', zh: 'PLC 编程', es: 'Programación de PLC', vi: 'Lập trình PLC', hi: 'PLC प्रोग्रामिंग', fr: 'Programmation PLC', de: 'PLC-Programmierung', ja: 'PLCプログラミング', ko: 'PLC 프로그래밍' },
  robotics: { en: 'Robotics', zh: '机器人', es: 'Robótica', vi: 'Robot công nghiệp', hi: 'रोबोटिक्स', fr: 'Robotique', de: 'Robotik', ja: 'ロボティクス', ko: '로보틱스' },
  vision: { en: 'Machine Vision', zh: '机器视觉', es: 'Visión artificial', vi: 'Thị giác máy', hi: 'मशीन विज़न', fr: 'Vision industrielle', de: 'Bildverarbeitung', ja: 'マシンビジョン', ko: '머신 비전' },
  electrical: { en: 'Electrical', zh: '电气', es: 'Eléctrica', vi: 'Điện', hi: 'इलेक्ट्रिकल', fr: 'Électricité', de: 'Elektrotechnik', ja: '電気', ko: '전기' },
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
        <title>{d.metaTitle} | Talengineer</title>
        <meta name="description" content={d.metaDescription} />
        <link rel="canonical" href={`${SITE}/coverage`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${d.metaTitle} | Talengineer`} />
        <meta property="og:description" content={d.metaDescription} />
        <meta property="og:url" content={`${SITE}/coverage`} />
        <meta property="og:image" content={`${SITE}/og.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${d.metaTitle} | Talengineer`} />
        <meta name="twitter:description" content={d.metaDescription} />
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
                  <span className={styles.metaAvailable}>{r.available} {r.available === 1 ? d.availableNow : d.availableNowPlural}</span>
                  <span className={styles.metaCertified}>🎓 {r.certified} {r.certified === 1 ? d.certifiedLabel : d.certifiedLabelPlural}</span>
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
