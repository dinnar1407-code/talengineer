// 内容引擎的"构建期数据层"。
// 关键约束：本文件只在 getStaticProps / getStaticPaths（Node 构建环境）里调用，
// 因此可以安全地用 fs 读本地 markdown；Next.js 会把它从客户端 bundle 里剔除，
// marked 这样的纯 ESM 依赖也不会打进浏览器。
//
// 为什么用 import 而不是 require：marked v18 是纯 ESM 包（package.json type=module），
// 只能用 import 引入，所以本文件也写成 ESM。
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

// 文章 markdown 的存放目录（相对项目根）。
const CONTENT_DIR = path.join(process.cwd(), 'content', 'playbook');

// 手写正则解析 frontmatter。文件形如：
//   ---
//   title: 文章标题
//   description: 一句话摘要
//   date: 2026-07-17
//   lang: en
//   slug: my-article
//   ---
//   正文（markdown）...
// 不引 gray-matter 的原因：只需解析这几个简单标量字段，手写正则更轻、零额外依赖。
// export 的原因：lib/whitepaper.js 复用同一套 frontmatter 解析（单一实现，避免两份正则漂移）。
export function parseFrontmatter(raw) {
  // 匹配开头被一对 --- 包裹的 frontmatter 块，捕获块内文本与其后的正文。
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const [, frontmatterBlock, content] = match;
  const data = {};

  frontmatterBlock.split('\n').forEach((line) => {
    // 每行按第一个冒号拆成 key: value。
    const m = line.match(/^([a-zA-Z0-9_]+)\s*:\s*(.*)$/);
    if (!m) return;
    let val = m[2].trim();
    // 去掉可选的成对引号（"..." 或 '...'）。
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    data[m[1]] = val;
  });

  return { data, content };
}

// frontmatter 的 draft 字段解析：只有字面量 'true' 视为草稿。
// 为什么这么严格：手写解析器里所有值都是字符串，'false'/缺失/乱写都当已发布，
// 保证旧文（没有 draft 字段）行为零变化。
function isDraft(data) {
  return String(data.draft || '').trim() === 'true';
}

// 读取全部文章的元数据（不渲染正文），按日期倒序返回。
// 供列表页与 sitemap 使用——它们只需要元信息，不需要正文 HTML。
//
// ⚠️ 发布门控红线（Wave2 F6）：默认过滤 draft: true 的文章。
// /playbook 索引页、sitemap、getStaticPaths 全都经过这里（或下面的 getAllPlaybookSlugs），
// 所以"月报/白皮书草稿一落盘就被公开收录"的泄漏路径在此处一次性堵死——
// 草稿在 Terry 终审把 draft 翻成 false 之前，对整个站点不可见。
export function getAllPlaybookMeta() {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
      const { data } = parseFrontmatter(raw);
      const slug = data.slug || f.replace(/\.md$/, '');
      return {
        slug,
        // 翻译组键（i18n 全站铺开 2026-07-24）：同一篇文章的各语言版本共享同一 group，
        // 索引页按组去重展示、文章页据此找同组语言变体。缺省回退到自身 slug——
        // 独立文章（今天的大多数）天然各成一组，旧文零行为变化。
        group: data.group || slug,
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        lang: data.lang || 'en',
        // 内容 taxonomy（竞对改善 W1-2）：type=指南/市场数据/认证解读/案例；
        // track=技术方向；audience=受众。旧文未标注时回退到最常见组合。
        type: data.type || 'guide',
        track: data.track || 'general',
        audience: data.audience || 'both',
        draft: isDraft(data),
      };
    })
    // 默认排除草稿：这是发布门控的唯一实现点，调用方无需（也不能）各自记得过滤。
    .filter((m) => !m.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// 全部文章的 slug 列表，供 getStaticPaths 用。
export function getAllPlaybookSlugs() {
  return getAllPlaybookMeta().map((m) => m.slug);
}

// 读取单篇文章：元数据 + 渲染好的 HTML 正文。供文章页 getStaticProps 用。
// 约定文件名即 slug.md；找不到直接文件时回退到扫描（以 frontmatter 的 slug 匹配）。
export function getPlaybookBySlug(slug) {
  if (!fs.existsSync(CONTENT_DIR)) return null;

  const directFile = path.join(CONTENT_DIR, `${slug}.md`);
  let raw = null;

  if (fs.existsSync(directFile)) {
    raw = fs.readFileSync(directFile, 'utf8');
  } else {
    // 回退：文件名与 slug 不一致时，扫描全目录用 frontmatter.slug 匹配。
    const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const candidate = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
      const { data } = parseFrontmatter(candidate);
      if ((data.slug || f.replace(/\.md$/, '')) === slug) {
        raw = candidate;
        break;
      }
    }
  }

  if (!raw) return null;

  const { data, content } = parseFrontmatter(raw);
  const html = marked.parse(content);

  return {
    slug: data.slug || slug,
    // 翻译组键：与 getAllPlaybookMeta 同一回退规则（缺省 = 自身 slug），
    // 文章页 getStaticProps 用它去 meta 列表里找同组的其他语言变体。
    group: data.group || data.slug || slug,
    title: data.title || '',
    description: data.description || '',
    date: data.date || '',
    lang: data.lang || 'en',
    type: data.type || 'guide',
    track: data.track || 'general',
    audience: data.audience || 'both',
    // draft 也随单篇返回：getStaticPaths 已经不为草稿生成路径（走 getAllPlaybookSlugs），
    // 这里带上只是让调用方（如未来的预览工具）能自行判断，不承担门控职责。
    draft: isDraft(data),
    html,
  };
}
