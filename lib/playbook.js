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
function parseFrontmatter(raw) {
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

// 读取全部文章的元数据（不渲染正文），按日期倒序返回。
// 供列表页与 sitemap 使用——它们只需要元信息，不需要正文 HTML。
export function getAllPlaybookMeta() {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
      const { data } = parseFrontmatter(raw);
      return {
        slug: data.slug || f.replace(/\.md$/, ''),
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        lang: data.lang || 'en',
      };
    })
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
    title: data.title || '',
    description: data.description || '',
    date: data.date || '',
    lang: data.lang || 'en',
    html,
  };
}
