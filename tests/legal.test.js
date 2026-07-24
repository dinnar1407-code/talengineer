// ── 法务内容数据层测试（lib/legal.js，IA 改版 §B1 /privacy + /terms）────────────
// 守护两条红线：
//   1. 完整性：privacy/terms 两份文档 × en/zh 两种语言都能加载，标题/正文/日期齐全
//      （页面 getStaticProps 依赖这一点，缺任何一份构建都会出问题）。
//   2. 发布门控：四份文档当前必须全部 draft === true——法务页在 Terry 终审前
//      只能以"noindex + 草稿横幅"的草稿形态存在。终审通过翻 draft:false 时，
//      这条断言会红，逼迫发布者有意识地同步更新本测试——"翻发布"永远是个显式动作。
//
// 为什么用动态 import：lib/legal.js 是 ESM（依赖纯 ESM 的 marked），
// node:test 的 CJS 测试文件里用 await import() 加载最稳（与 playbookContent.test.js 同一模式）。
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// 法务文档与语言的全集（与 lib/legal.js 的白名单同口径）。
const DOCS = ['privacy', 'terms'];
const LANGS = ['en', 'zh'];

describe('lib/legal —— 法务文档加载器', () => {

  it('两份文档 × 两种语言都能加载，且元数据/正文齐全', async () => {
    const { getLegalDoc } = await import('../lib/legal.js');

    for (const docName of DOCS) {
      for (const lang of LANGS) {
        const d = getLegalDoc(docName, lang);
        assert.ok(d, `${docName}.${lang}.md 应能加载（返回了 null）`);
        assert.equal(d.doc, docName);
        assert.equal(d.lang, lang);
        assert.ok(d.title.length > 0, `${docName}.${lang} 缺 title`);
        assert.ok(d.description.length > 0, `${docName}.${lang} 缺 description`);
        // 日期必须是 YYYY-MM-DD（页面 heroDate 与 JSON-LD dateModified 都直接用它）。
        assert.match(d.date, /^\d{4}-\d{2}-\d{2}$/, `${docName}.${lang} 的 date 格式应为 YYYY-MM-DD`);
        // 正文必须是实打实的长文（防 stub/lorem 混进来）：渲染后 HTML 至少上千字符。
        assert.ok(d.html.length > 1000, `${docName}.${lang} 正文过短（${d.html.length} 字符），疑似 stub`);
        // marked 渲染出的应是结构化 HTML（含章节标题），不是一坨纯文本。
        assert.ok(d.html.includes('<h2'), `${docName}.${lang} 正文应含 <h2> 章节`);
      }
    }
  });

  it('发布门控：四份文档当前全部 draft === true（翻发布必须有意识地改这条断言）', async () => {
    const { getLegalDoc } = await import('../lib/legal.js');

    for (const docName of DOCS) {
      for (const lang of LANGS) {
        const d = getLegalDoc(docName, lang);
        // ⚠️ 有意的"强制翻红"断言：Terry 法务终审通过、把 md 的 draft 翻成 false 时，
        // 这里会失败——发布者必须同步把断言改为 false（或删除本用例），
        // 保证"法务页转正"永远是一个被测试见证的显式决定，绝不会静默发生。
        assert.equal(d.draft, true, `${docName}.${lang} 应为草稿（draft: true）；若已通过法务终审，请同步更新本断言`);
      }
    }
  });

  it('白名单防御：未知文档名/语言返回 null 而非抛错或读到意外文件', async () => {
    const { getLegalDoc } = await import('../lib/legal.js');

    assert.equal(getLegalDoc('cookie-policy', 'en'), null);
    assert.equal(getLegalDoc('privacy', 'fr'), null);
    // 路径穿越类输入必须被白名单直接拦下（防御性纪律，与 lib/whitepaper.js 同源）。
    assert.equal(getLegalDoc('../playbook/china-plc-rates', 'en'), null);
  });
});
