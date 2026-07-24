// ── 内容层发布门控测试（lib/playbook draft 过滤 + lib/whitepaper loader 形状）──
// Wave2 F6 的发布门控红线：draft: true 的文章绝不能被 getAllPlaybookMeta /
// getAllPlaybookSlugs 返回——/playbook 索引页、sitemap、getStaticPaths 全走这两个
// 函数，漏了任何一个，月报/白皮书草稿一落盘就被公开收录。
//
// 测试策略：直接读仓库里的真实 content/ 文件（fs，全离线不连库）。仓库里恒有
//   - 已发布文章：plc-programmer-hourly-rates-2026（draft 缺失 = 已发布）
//   - 草稿月报：market-report-2026-07-en / -zh（frontmatter draft: true）
// 用它们做真实回归网，比造临时目录更贴近生产行为。
//
// 为什么用动态 import：lib/playbook.js / lib/whitepaper.js 是 ESM（依赖纯 ESM 的
// marked），node:test 的 CJS 测试文件里用 await import() 加载最稳。
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// 仓库里恒定存在的样本（若被删除/更名，测试应当直接失败提醒维护者更新样本）。
const PUBLISHED_SLUG = 'plc-programmer-hourly-rates-2026';
const DRAFT_SLUGS = ['market-report-2026-07-en', 'market-report-2026-07-zh'];

describe('lib/playbook —— draft 发布门控（默认过滤草稿）', () => {

  it('parseFrontmatter：解析 draft 字段（字符串原样返回）', async () => {
    const { parseFrontmatter } = await import('../lib/playbook.js');
    const { data, content } = parseFrontmatter(
      '---\ntitle: T\ndraft: true\n---\nbody here'
    );
    assert.equal(data.title, 'T');
    assert.equal(data.draft, 'true'); // 手写解析器一律返回字符串，布尔化在上层做
    assert.equal(content, 'body here');
  });

  it('getAllPlaybookMeta：不含任何 draft 文章，且含已发布样本', async () => {
    const { getAllPlaybookMeta } = await import('../lib/playbook.js');
    const metas = getAllPlaybookMeta();
    const slugs = metas.map((m) => m.slug);

    // 草稿月报绝不能出现（sitemap 与 /playbook 索引都吃这个函数的输出）。
    for (const draftSlug of DRAFT_SLUGS) {
      assert.equal(slugs.includes(draftSlug), false, `草稿 ${draftSlug} 泄漏进了 meta 列表`);
    }
    // 已发布文章必须还在（过滤器不能误伤旧文——旧文没有 draft 字段）。
    assert.equal(slugs.includes(PUBLISHED_SLUG), true);
    // 返回的每一条都必须是非草稿。
    for (const m of metas) {
      assert.equal(m.draft, false, `meta 列表出现 draft=true 的条目：${m.slug}`);
    }
  });

  it('getAllPlaybookSlugs：同样不含草稿（getStaticPaths 的输入）', async () => {
    const { getAllPlaybookSlugs } = await import('../lib/playbook.js');
    const slugs = getAllPlaybookSlugs();
    for (const draftSlug of DRAFT_SLUGS) {
      assert.equal(slugs.includes(draftSlug), false, `草稿 ${draftSlug} 泄漏进了 slug 列表`);
    }
    assert.equal(slugs.includes(PUBLISHED_SLUG), true);
  });

  it('getPlaybookBySlug：单篇读取仍能取到草稿并带 draft:true（loader 不承担门控职责）', async () => {
    const { getPlaybookBySlug } = await import('../lib/playbook.js');
    const draft = getPlaybookBySlug(DRAFT_SLUGS[0]);
    assert.ok(draft, '草稿文件应能被单篇 loader 读到');
    assert.equal(draft.draft, true);
    // 已发布文章 draft 应为 false。
    const published = getPlaybookBySlug(PUBLISHED_SLUG);
    assert.ok(published);
    assert.equal(published.draft, false);
  });
});

describe('lib/whitepaper —— loader 形状（与 playbook 共享 frontmatter 实现的薄测）', () => {

  it('getWhitepaper(en/zh)：返回完整形状，草稿期 draft=true，正文已渲染成 HTML', async () => {
    const { getWhitepaper } = await import('../lib/whitepaper.js');
    for (const lang of ['en', 'zh']) {
      const wp = getWhitepaper(lang);
      assert.ok(wp, `content/whitepaper/${lang}.md 应存在且可解析`);
      assert.equal(wp.lang, lang);
      assert.ok(wp.title.length > 0);
      assert.ok(wp.description.length > 0);
      assert.match(wp.date, /^\d{4}-\d{2}-\d{2}$/); // 日期保持零填充 YYYY-MM-DD
      assert.equal(wp.draft, true); // 白皮书当前处于草稿期（终审后此断言随内容一起更新）
      assert.match(wp.html, /<h2/); // marked 渲染产生了章节标题（/whitepaper 目录预览依赖 h2）
    }
  });

  it('getWhitepaper：不存在的语言/非法参数返回 null 不抛错', async () => {
    const { getWhitepaper } = await import('../lib/whitepaper.js');
    assert.equal(getWhitepaper('fr'), null);        // 两位字母但无对应文件
    assert.equal(getWhitepaper('../x'), null);      // 非法参数被防御正则拦下
    assert.equal(getWhitepaper(''), null);
  });
});
