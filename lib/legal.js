// 法务页（/privacy /terms）内容的"构建期数据层"（IA 改版 §B1）。
//
// 与 lib/playbook.js / lib/whitepaper.js 同一约束：只在 getStaticProps（Node 构建环境）
// 里调用，可以安全地用 fs 读本地 markdown；Next.js 会把它从客户端 bundle 里剔除，
// 纯 ESM 的 marked 也不会打进浏览器。
//
// 为什么不复用 content/playbook/：
// 法务文档不是文章——不该出现在 /playbook 索引、文章路由或 RSS 类聚合里，
// 且它有自己的发布门控语义（draft: true = 带 noindex + 草稿横幅的"诚实草稿"，
// Terry 法务终审通过后翻成 false 才算正式发布）。独立目录 content/legal/ 边界最清晰。
//
// frontmatter 解析直接复用 playbook 的 parseFrontmatter（单一实现，避免第三份正则漂移）。
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
// 带 .js 扩展名：Node 原生 ESM（单测里 await import 本文件）要求显式扩展名；
// Next/webpack 两种写法都认，取交集（与 lib/whitepaper.js 同一手法）。
import { parseFrontmatter } from './playbook.js';

// 法务 markdown 目录：每份文档×语言一个文件（privacy.en.md / privacy.zh.md / terms.*.md）。
const LEGAL_DIR = path.join(process.cwd(), 'content', 'legal');

// 白名单：只认识这两份文档、两种语言。
// 为什么用白名单而不是直接拼路径：doc/lang 会进入文件路径拼接，
// 虽然调用方都是页面里写死的常量，防御性拦一道能杜绝任何路径穿越意外
// （与 lib/whitepaper.js 对 lang 做正则校验是同一纪律）。
const DOCS = ['privacy', 'terms'];
const LANGS = ['en', 'zh'];

/**
 * 读取指定法务文档的指定语言版本：元数据 + 渲染好的 HTML 正文。
 * 找不到文件或参数不合法时返回 null（页面侧对 zh 用 || en 回退，en 缺失则构建期抛错）。
 *
 * @param {string} doc 'privacy' | 'terms'
 * @param {string} lang 'en' | 'zh'
 * @returns {{doc:string, lang:string, title:string, description:string, date:string, draft:boolean, html:string}|null}
 */
export function getLegalDoc(doc, lang) {
  if (!DOCS.includes(doc) || !LANGS.includes(lang)) return null;

  const file = path.join(LEGAL_DIR, `${doc}.${lang}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = parseFrontmatter(raw);

  return {
    doc,
    lang,
    title: data.title || '',
    description: data.description || '',
    date: data.date || '',
    // draft 判定与 lib/playbook.js 的 isDraft 同一严格口径：只有字面量 'true' 算草稿。
    // 手写 frontmatter 解析器里所有值都是字符串，这样翻发布只有一种明确写法
    // （draft: false 或整行删掉），不会因为大小写/空格意外把草稿放出去——
    // 反过来也不会因为乱写把已发布文档误标成草稿。
    draft: String(data.draft || '').trim() === 'true',
    // marked 渲染的是仓库内的静态 markdown（非用户输入），页面用
    // dangerouslySetInnerHTML 注入是安全的（与 playbook/whitepaper 同一前提）。
    html: marked.parse(content),
  };
}
