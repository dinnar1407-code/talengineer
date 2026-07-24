// ── 导航/页脚配置完整性测试（lib/navConfig.js）────────────────────────────
// 守护 2026-07 菜单改版的三条红线（方案 §A3）：
//   1. 零死链：MENU + FOOTER_COLUMNS 里的每个 href 都必须解析到真实存在的页面文件
//      （静态页直接查 pages/ 目录；/hire/* /guides/* /occupations/* 动态路由用
//      各自 lib 数据源解析 slug——与 getStaticPaths 同一单一来源，防手写漂移）；
//      并且禁止 href === '/'（首页当占位死链的旧病）与裸 '#'。
//   2. 九语无缺：每个 label 对象 9 种语言齐全且非空（certCenter 七语缺失类问题永不复发）。
//   3. 结构稳定：key 全局唯一、FOOTER_COLUMNS 恰好 5 列（Footer 组件 6 列 grid 锁死品牌列 + 5 链接列）。
//
// navConfig 本身是 CJS 纯数据（可直接 require）；hireMatrix/regionGuides/occupations
// 是 ESM，按仓库既定模式（iaLibs.test.js / playbookContent.test.js）用 await import() 加载。
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { LINKS, MENU, FOOTER_COLUMNS, FOOTER_META, CTA_POST_PROJECT, t } = require('../lib/navConfig');

// 站点固定的 9 种语言（与 Navbar LANGS / useLang 同口径）。
const LANG_CODES = ['en', 'zh', 'es', 'vi', 'hi', 'fr', 'de', 'ja', 'ko'];

const PAGES_DIR = path.join(__dirname, '..', 'pages');

// 页内锚点白名单：当前导航/页脚配置不允许任何锚点链接（旧首页页脚的 '#resources'
// 已改为真实页 /resources）。将来若刻意要加锚点入口，先在这里登记再进配置。
const ANCHOR_ALLOWLIST = new Set([]);

// ── 收集配置里出现的所有链接对象（MENU 下拉项 + 扁平项 + 页脚 5 列 + CTA）──
function collectLinks() {
  const links = [];
  for (const group of MENU) {
    if (group.link) links.push({ from: `MENU[${group.key}]`, ...group.link });
    for (const l of group.items || []) links.push({ from: `MENU[${group.key}]`, ...l });
  }
  for (const col of FOOTER_COLUMNS) {
    for (const l of col.links) links.push({ from: `FOOTER[${col.key}]`, ...l });
  }
  links.push({ from: 'CTA_POST_PROJECT', ...CTA_POST_PROJECT });
  return links;
}

// ── href → 真实页面文件解析器 ────────────────────────────────────────────
// 静态映射：pages/<path>.jsx 或 pages/<path>/index.jsx 存在即通过。
// 动态路由：/hire/<track>、/guides/<region>、/occupations/<role> 交给各自的
// lib 数据源判定 slug 是否真实（与页面 getStaticPaths 用的是同一批函数）。
async function resolvesToPage(href) {
  if (href.startsWith('#')) return ANCHOR_ALLOWLIST.has(href);

  const clean = href.split('#')[0].split('?')[0];
  if (!clean.startsWith('/')) return false; // 只允许站内绝对路径

  const rel = clean.slice(1); // 去掉开头的 '/'
  if (fs.existsSync(path.join(PAGES_DIR, `${rel}.jsx`))) return true;
  if (fs.existsSync(path.join(PAGES_DIR, rel, 'index.jsx'))) return true;

  // 动态路由 resolver（slug 必须被数据源认可，光有 [param].jsx 文件不算数）
  const m = clean.match(/^\/(hire|guides|occupations)\/([^/]+)$/);
  if (m) {
    const [, base, slug] = m;
    if (base === 'hire') {
      const { getTrackMeta } = await import('../lib/hireMatrix.js');
      return Boolean(getTrackMeta(slug));
    }
    if (base === 'guides') {
      // 注意：lib/regionGuides.js 内部有一行 extensionless import（`from './hireMatrix'`），
      // Next 的 webpack 能解析，但原生 Node ESM 会 ERR_MODULE_NOT_FOUND，无法直接 import。
      // 该文件不在本次改动范围内，这里退而求其次：从源码文本提取 GUIDES 的顶层 slug 键
      // （仍然是同一单一来源文件，只是读取方式不同）。
      return getGuideSlugsFromSource().has(slug);
    }
    if (base === 'occupations') {
      const { getOccupationPage } = await import('../lib/occupations.js');
      return Boolean(getOccupationPage(slug));
    }
  }
  return false;
}

// ── /guides/* 的 slug 来源：解析 lib/regionGuides.js 源码里 GUIDES 的顶层键 ──
// （原因见上：该文件的 extensionless import 让原生 Node ESM 无法加载它本身）
function getGuideSlugsFromSource() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'regionGuides.js'), 'utf8');
  const start = src.indexOf('const GUIDES = {');
  assert.ok(start >= 0, 'lib/regionGuides.js 里找不到 const GUIDES 定义（结构变了请更新本解析器）');
  const body = src.slice(start, src.indexOf('\n};', start));
  // 顶层 slug 键的形状固定为两空格缩进的 `  mexico: {`
  const slugs = new Set([...body.matchAll(/^ {2}([a-z][a-z0-9-]*): \{/gm)].map((m) => m[1]));
  assert.ok(slugs.size > 0, 'GUIDES 顶层 slug 解析结果为空（结构变了请更新本解析器）');
  return slugs;
}

// ── label 对象九语齐全断言（复用于链接 label / 分组 label / 页脚列标题）──
function assertLabelComplete(label, where) {
  assert.ok(label && typeof label === 'object', `${where}: label 必须是九语对象`);
  for (const code of LANG_CODES) {
    assert.equal(typeof label[code], 'string', `${where}: 缺少 ${code} 翻译`);
    assert.ok(label[code].trim().length > 0, `${where}: ${code} 翻译为空串`);
  }
}

describe('lib/navConfig —— 零死链（每个 href 都解析到真实页面）', () => {
  it('MENU + FOOTER + CTA 的每个 href 都能解析到真实页面文件', async () => {
    for (const l of collectLinks()) {
      assert.ok(
        await resolvesToPage(l.href),
        `${l.from} → ${l.key} 的 href "${l.href}" 解析不到任何真实页面（死链）`
      );
    }
  });

  it("禁止 href === '/'（首页占位死链）与裸 '#'", () => {
    for (const l of collectLinks()) {
      assert.notEqual(l.href, '/', `${l.from} → ${l.key}：href 不允许是 '/'（历史上 About/Contact 曾这样装死链）`);
      assert.notEqual(l.href, '#', `${l.from} → ${l.key}：href 不允许是裸 '#'`);
    }
  });
});

describe('lib/navConfig —— 九语完整性', () => {
  it('每个链接的 label 九语齐全且非空', () => {
    for (const l of collectLinks()) {
      assertLabelComplete(l.label, `${l.from} → ${l.key}`);
    }
  });

  it('每个 MENU 分组 label、页脚列标题、FOOTER_META 文案九语齐全', () => {
    for (const group of MENU) assertLabelComplete(group.label, `MENU 分组 ${group.key}`);
    for (const col of FOOTER_COLUMNS) assertLabelComplete(col.title, `页脚列 ${col.key}`);
    assertLabelComplete(FOOTER_META.tagline, 'FOOTER_META.tagline');
    assertLabelComplete(FOOTER_META.copyright, 'FOOTER_META.copyright');
  });

  it('t() 取词：已知语言取对应文案，未知语言回退英文（SSR 首帧规则）', () => {
    assert.equal(t(LINKS.about.label, 'zh'), LINKS.about.label.zh);
    assert.equal(t(LINKS.about.label, 'xx'), LINKS.about.label.en);
    assert.equal(t(null, 'en'), '');
  });
});

describe('lib/navConfig —— 结构稳定性', () => {
  it('LINKS 注册表：对象键与 key 字段一致（key 全局唯一的保证）', () => {
    for (const [objKey, link] of Object.entries(LINKS)) {
      assert.equal(link.key, objKey, `LINKS.${objKey} 的 key 字段（${link.key}）与对象键不一致`);
    }
  });

  it('MENU 分组 key 唯一；每列/每分组内不出现重复链接 key', () => {
    const groupKeys = MENU.map((g) => g.key);
    assert.equal(new Set(groupKeys).size, groupKeys.length, 'MENU 分组 key 重复');

    for (const group of MENU) {
      if (!group.items) continue;
      const keys = group.items.map((l) => l.key);
      assert.equal(new Set(keys).size, keys.length, `MENU[${group.key}] 内链接 key 重复`);
    }
    for (const col of FOOTER_COLUMNS) {
      const keys = col.links.map((l) => l.key);
      assert.equal(new Set(keys).size, keys.length, `页脚列 ${col.key} 内链接 key 重复`);
    }
  });

  it('FOOTER_COLUMNS 恰好 5 列（Footer 组件 6 列 grid = 品牌列 + 5 链接列，锁死）', () => {
    assert.equal(FOOTER_COLUMNS.length, 5);
    const colKeys = FOOTER_COLUMNS.map((c) => c.key);
    assert.equal(new Set(colKeys).size, colKeys.length, '页脚列 key 重复');
  });

  it('MENU 结构约定：每项要么是下拉（items）要么是扁平（link），二者必居其一', () => {
    for (const group of MENU) {
      const isDropdown = Array.isArray(group.items) && group.items.length > 0;
      const isFlat = Boolean(group.link);
      assert.ok(isDropdown !== isFlat, `MENU[${group.key}] 必须且只能是下拉或扁平之一`);
    }
  });
});
