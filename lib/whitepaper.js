// 白皮书内容的"构建期数据层"（Wave2 F6 / W2-7）。
//
// 与 lib/playbook.js 同一约束：只在 getStaticProps（Node 构建环境）里调用，
// 可以安全地用 fs 读本地 markdown；Next.js 会把它从客户端 bundle 里剔除。
//
// 为什么不直接把白皮书放进 content/playbook/：
// 白皮书是一份独立的门控落地页（/whitepaper，邮箱软门 + noindex 草稿期），
// 不是 playbook 索引里的一篇文章——放进去会被文章列表/文章页路由收录，
// 门控逻辑就得在多处打补丁。独立目录 content/whitepaper/{en,zh}.md 边界最清晰。
//
// frontmatter 解析直接复用 playbook 的 parseFrontmatter（单一实现，避免两份正则漂移）。
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
// 带 .js 扩展名：Node 原生 ESM（单测里直接 import 本文件）要求显式扩展名；
// Next/webpack 两种写法都认，取交集。
import { parseFrontmatter } from './playbook.js';

// 白皮书 markdown 目录：每种语言一个文件（en.md / zh.md）。
const WHITEPAPER_DIR = path.join(process.cwd(), 'content', 'whitepaper');

/**
 * 读取指定语言的白皮书：元数据 + 渲染好的 HTML 正文。
 * 找不到该语言文件时返回 null（页面侧用 || en 回退）。
 * @param {string} lang 'en' | 'zh'
 * @returns {{lang:string, title:string, description:string, date:string, draft:boolean, html:string}|null}
 */
export function getWhitepaper(lang) {
  // 语言参数只允许两位小写字母，防御性拦住任何路径拼接意外（虽然调用方是写死的 'en'/'zh'）。
  if (!/^[a-z]{2}$/.test(String(lang))) return null;

  const file = path.join(WHITEPAPER_DIR, `${lang}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = parseFrontmatter(raw);

  return {
    lang,
    title: data.title || '',
    description: data.description || '',
    date: data.date || '',
    // draft 语义与 playbook 一致：字面量 'true' 才算草稿。
    // 页面用它决定是否渲染「Draft — 待终审」横幅；robots noindex 的摘除是
    // 终审后的人工放行动作（登记在收官报告 Terry 待办），不跟 draft 字段自动联动。
    draft: String(data.draft || '').trim() === 'true',
    html: marked.parse(content),
  };
}
