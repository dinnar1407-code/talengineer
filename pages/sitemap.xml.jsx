// Dynamic sitemap for SEO
// Generates XML sitemap including engineer profile pages and project pages

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

function SitemapXML() { return null; }

export async function getServerSideProps({ res }) {
  let engineers = [];
  let demands   = [];

  try {
    const { getClient } = require('../src/config/db');
    const supabase = getClient();

    const [engRes, demRes] = await Promise.all([
      supabase.from('talents').select('id, updated_at').order('id'),
      supabase.from('demands').select('id, updated_at').eq('status', 'open').order('id'),
    ]);
    engineers = engRes.data || [];
    demands   = demRes.data || [];
  } catch { /* silently fallback to static pages only */ }

  const staticPages = [
    { url: '',          priority: '1.0', changefreq: 'weekly' },
    { url: '/talent',   priority: '0.9', changefreq: 'daily' },
    { url: '/rates',    priority: '0.8', changefreq: 'daily' },
    { url: '/enterprise', priority: '0.7', changefreq: 'monthly' },
    { url: '/finance',  priority: '0.6', changefreq: 'weekly' },
  ];

  const engineerUrls = engineers.map(e => ({
    url: `/engineer/${e.id}`,
    priority: '0.7',
    changefreq: 'weekly',
    lastmod: e.updated_at?.split('T')[0],
  }));

  const demandUrls = demands.map(d => ({
    url: `/project/${d.id}`,
    priority: '0.6',
    changefreq: 'weekly',
    lastmod: d.updated_at?.split('T')[0],
  }));

  const allUrls = [...staticPages, ...engineerUrls, ...demandUrls];

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
