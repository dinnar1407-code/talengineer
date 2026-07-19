// Dynamic sitemap for SEO
// Generates XML sitemap including engineer profile pages and project pages
import { getAllPlaybookMeta } from '../lib/playbook';
import { getMatrixPaths } from '../lib/hireMatrix';
import { getGuidePaths } from '../lib/regionGuides';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 内容引擎的行业落地页方向（与 pages/hire/[track].jsx 保持一致）。
const HIRE_TRACKS = ['plc', 'robotics', 'vision', 'electrical'];

function SitemapXML() { return null; }

export async function getServerSideProps({ res }) {
  let engineers = [];
  let demands   = [];

  try {
    const { getClient } = require('../src/config/db');
    const supabase = getClient();

    // 注：talents/demands 只有 created_at，没有 updated_at 列——
    // 原来查 updated_at 会报错被 catch 吞掉，导致 sitemap 只剩静态页（缺 engineer/project 页，损 SEO）
    const [engRes, demRes] = await Promise.all([
      supabase.from('talents').select('id, created_at').order('id'),
      supabase.from('demands').select('id, created_at').eq('status', 'open').order('id'),
    ]);
    engineers = engRes.data || [];
    demands   = demRes.data || [];
  } catch { /* silently fallback to static pages only */ }

  const staticPages = [
    { url: '',          priority: '1.0', changefreq: 'weekly' },
    { url: '/talent',   priority: '0.9', changefreq: 'daily' },
    { url: '/rates',    priority: '0.8', changefreq: 'daily' },
    { url: '/playbook', priority: '0.8', changefreq: 'weekly' },
    // Wave 0 能力独立页（竞对改善计划 2026-07-18）：定价/信任/质量分/认证漏斗
    { url: '/pricing',       priority: '0.8', changefreq: 'monthly' },
    { url: '/trust',         priority: '0.7', changefreq: 'monthly' },
    { url: '/talscore',      priority: '0.7', changefreq: 'monthly' },
    { url: '/certification', priority: '0.7', changefreq: 'monthly' },
    { url: '/enterprise', priority: '0.7', changefreq: 'monthly' },
    { url: '/finance',  priority: '0.6', changefreq: 'weekly' },
    ...HIRE_TRACKS.map(track => ({
      url: `/hire/${track}`, priority: '0.7', changefreq: 'monthly',
    })),
    // W1-1 垂直页矩阵（方向×行业）与建厂地域指南：路由枚举复用页面同一数据源，防漂移
    ...getMatrixPaths().map(({ params }) => ({
      url: `/hire/${params.track}/${params.industry}`, priority: '0.7', changefreq: 'monthly',
    })),
    ...getGuidePaths().map(({ params }) => ({
      url: `/guides/${params.region}`, priority: '0.7', changefreq: 'monthly',
    })),
    // W1-3/W1-5 增长基建页
    { url: '/calculator',   priority: '0.7', changefreq: 'monthly' },
    { url: '/case-studies', priority: '0.6', changefreq: 'weekly' },
  ];

  // 内容引擎文章页：以 frontmatter 的 date 作为 lastmod。
  const playbookUrls = getAllPlaybookMeta().map(a => ({
    url: `/playbook/${a.slug}`,
    priority: '0.6',
    changefreq: 'monthly',
    lastmod: a.date || undefined,
  }));

  const engineerUrls = engineers.map(e => ({
    url: `/engineer/${e.id}`,
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: e.created_at?.split('T')[0],
  }));

  const demandUrls = demands.map(d => ({
    url: `/project/${d.id}`,
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: d.created_at?.split('T')[0],
  }));

  const allUrls = [...staticPages, ...playbookUrls, ...engineerUrls, ...demandUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${BASE}${u.url}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(xml);
  res.end();

  return { props: {} };
}

export default SitemapXML;
