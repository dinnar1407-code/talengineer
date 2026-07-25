// ── 九语「事实数字」跨语言一致性测试（2026-07-25 九语工程收尾补齐）────────────
//
// 为什么单独一个测试：tests/i18nParity.test.js 守的是**结构**（键集一致、数组等长、
// 叶子非空），它挡不住"译文把 15% 写成 20%""把 $35–65/hr 写成 35–65 $/h"这类
// 数值/写法漂移——而这恰恰是九语工程里最贵的一类事故：平台费、founding 让利、
// 举证窗口天数、费率区间的单一来源都在代码里（src/config/fees.js、
// src/routes/disputes.js、src/services/talScore.js），任何语言的正文都只是它们的
// 展示副本，一旦某一语的数字飘了，页面就在对那个市场的用户说谎。
//
// 【红线范围：只管"事实数字"，不管所有数字】
// 入红线：货币金额（$35–65）与百分比（15%）——这两类的单一来源都在代码里，
//         语言间没有任何合理理由写得不一样。
// 不入红线：日期、序数、计数词、战略名里的数字（如「中国+1」/「China-plus-one」）
//         ——各语言书写习惯本就不同（en "July 2026" vs zh "2026 年 7 月"），
//         强求一致只会制造噪音、逼后人加一堆豁免，反而稀释红线的严肃性。
//
// 两条独立断言：
//   ① 值一致：同一叶子上，各语言的货币/百分比 token 多重集必须与 en 完全相同
//             （多一个、少一个、值不同，都红灯）。
//   ② 写法规范：任何语言都不许把货币符号写在数字后面（法语 `65 $`）、
//             也不许在数字与 % 之间留空格（德语 `15 %`）——两者都会让
//             "同一个数字"在不同语言里长得不一样，也是①的常见破口。
//
// 覆盖面：lib/i18n/*.js 全部导出 + lib/hireMatrix|occupations|regionGuides
//        + content/playbook 的翻译组（按 frontmatter group 配对，en 变体为基准）。
// 语言节点靠形状自动探测（任何含 en 且至少含另一个语言码的对象），因此新增字典
// 模块/新增语言块不需要回来登记——白拿守护。
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const I18N_DIR = path.join(ROOT, 'lib', 'i18n');
const PLAYBOOK_DIR = path.join(ROOT, 'content', 'playbook');

const ALL_LANGS = ['en', 'zh', 'es', 'vi', 'hi', 'fr', 'de', 'ja', 'ko'];
const LANG_SET = new Set(ALL_LANGS);

// glossary.js 是术语表（TERMS 的 note 字段里会举例说明各语译法，天然含跨语言
// 不对称的说明文字），不是展示文案，跳过。
const SKIP_I18N_FILES = new Set(['glossary.js']);

// ── token 抽取 ───────────────────────────────────────────────────────────
// 货币：`$35`、`$35–65`、`$35 – $65`、`$1,200` 等（连接号含 - – — − 四种写法）。
const CURRENCY_RE = /\$\s*\d[\d.,]*(?:\s*[-–—−]\s*\$?\s*\d[\d.,]*)*/g;
// 百分比：`15%`、`15 %`（含不间断空格）、`0.10%`。
const PERCENT_RE = /\d[\d.,]*\s*%/g;

// 去掉数字尾巴上的标点（千分位逗号后必跟数字，句读逗号/句号不跟——收尾即可）。
function trimTrailingPunct(s) {
  return s.replace(/[.,]+$/, '');
}

// 货币规范形：把一处货币表述**拆成一个个金额**。
// `$35–65`、`$35 – $65`、西语的 "entre $35 y $65" 都归一为 ['$35','$65']——
// 区间连写还是拆成两句是排版/句法差异，不是事实漂移；真正要盯的是"哪些金额出现过"。
// 小数点/千分位写法**保留原样**（`3.5` vs `3,5` 是真漂移，要红灯）。
function canonCurrency(raw) {
  const nums = raw.match(/\d[\d.,]*/g) || [];
  return nums.map((n) => '$' + trimTrailingPunct(n));
}

// 百分比规范形：去掉空白（`15 %` → `15%`），值本身原样保留。
function canonPercent(raw) {
  return trimTrailingPunct(raw.replace(/\s+/g, '').replace(/%$/, '')) + '%';
}

function extractFactNumbers(text) {
  if (typeof text !== 'string') return [];
  const out = [];
  for (const m of text.match(CURRENCY_RE) || []) out.push(...canonCurrency(m));
  for (const m of text.match(PERCENT_RE) || []) out.push(canonPercent(m));
  return out.sort();
}

// 多重集比较 → 返回人类可读的差异描述；一致时返回 null。
function diffMultiset(enTokens, langTokens) {
  const count = (arr) => arr.reduce((m, t) => m.set(t, (m.get(t) || 0) + 1), new Map());
  const a = count(enTokens);
  const b = count(langTokens);
  const missing = [];
  const extra = [];
  for (const [t, n] of a) {
    const d = n - (b.get(t) || 0);
    if (d > 0) missing.push(`${t}×${d}`);
  }
  for (const [t, n] of b) {
    const d = n - (a.get(t) || 0);
    if (d > 0) extra.push(`${t}×${d}`);
  }
  if (!missing.length && !extra.length) return null;
  const parts = [];
  if (missing.length) parts.push(`缺 en 有的 [${missing.join(', ')}]`);
  if (extra.length) parts.push(`多出 en 没有的 [${extra.join(', ')}]`);
  return parts.join('；');
}

// 集合比较（只看"出现过哪些值"，不看出现几次）→ 长文用。
// 为什么长文放宽到集合：字典是短 UI 串，一句对一句，次数理应一致；而长文翻译有
// 正当的复述自由（en 写 "the fee"、译文写"15% 的费用"把隐含引用显化，是好翻译
// 不是漂移）。集合比较仍然守住两条真红线：**丢值**（en 有的数字译文整个没了 =
// 信息丢失）与**造值**（译文冒出 en 没有的数字 = 编造）。
function diffSet(enTokens, langTokens, accepted) {
  const a = new Set(enTokens);
  const b = new Set(langTokens);
  const okMissing = new Set(accepted?.missing || []);
  const okExtra = new Set(accepted?.extra || []);
  const missing = [...a].filter((t) => !b.has(t) && !okMissing.has(t));
  const extra = [...b].filter((t) => !a.has(t) && !okExtra.has(t));
  if (!missing.length && !extra.length) return null;
  const parts = [];
  if (missing.length) parts.push(`丢了 en 有的值 [${missing.join(', ')}]`);
  if (extra.length) parts.push(`冒出 en 没有的值 [${extra.join(', ')}]`);
  return parts.join('；');
}

// ── 写法规范违例探测 ─────────────────────────────────────────────────────
// 货币符号写在数字后面（法语/加法语排版习惯 `65 $`）——一律不许：
// 数字与货币符号必须与 en 同形（`$65`）。
const CURRENCY_AFTER_RE = /\d[\d.,]*\s*[$€£]/g;
// 数字与百分号之间留空白（德语/法语排版习惯 `15 %`，含不间断空格 U+00A0）。
const PERCENT_SPACED_RE = /\d[\d.,]*\s+%/g;

function formatViolations(text) {
  if (typeof text !== 'string') return [];
  const out = [];
  for (const m of text.match(CURRENCY_AFTER_RE) || []) {
    out.push(`货币符号写在了数字后面: "${m}"（应为 $ 在前，与 en 同形）`);
  }
  for (const m of text.match(PERCENT_SPACED_RE) || []) {
    // 用 JSON.stringify 暴露不间断空格，否则报错信息里肉眼看不出差别。
    out.push(`数字与 % 之间有空白: ${JSON.stringify(m)}（应紧贴，与 en 同形）`);
  }
  return out;
}

// ── 语言节点探测：任何「含 en 且至少含另一个语言码」的普通对象 ─────────────
// 命中 DICT（顶层 lang 键）、TRACKS[track]（lang 块混着 serviceType/skills）、
// RATES_NOTE、hireMatrix 的行内 {en,zh,...} 标签、regionGuides GUIDES[region] 等
// 所有形态，新增结构不需要回来登记。
function isLangNode(node) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return false;
  const keys = Object.keys(node);
  if (!keys.includes('en')) return false;
  return keys.some((k) => k !== 'en' && LANG_SET.has(k));
}

// 收集模块里所有语言节点（trail 用于报错定位）。
function collectLangNodes(node, trail, out, seen) {
  if (!node || typeof node !== 'object') return;
  if (seen.has(node)) return; // 防御自引用/共享引用导致的重复与死循环
  seen.add(node);
  if (isLangNode(node)) {
    out.push({ trail, node });
    return; // 语言节点内部由 compare 负责，不再往下找嵌套语言节点
  }
  if (Array.isArray(node)) {
    node.forEach((child, i) => collectLangNodes(child, `${trail}[${i}]`, out, seen));
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'function') continue; // 参数化文案，内容无法静态比对
    collectLangNodes(v, `${trail}.${k}`, out, seen);
  }
}

// 与 en 并行遍历同一棵子树，在字符串叶子上比数字。结构不一致时静默跳过——
// 那是 i18nParity 的职责，本测试不重复报同一个错。
function compareNumbers(enNode, langNode, lang, trail, problems) {
  if (typeof enNode === 'string') {
    if (typeof langNode !== 'string') return;
    const d = diffMultiset(extractFactNumbers(enNode), extractFactNumbers(langNode));
    if (d) {
      problems.push(
        `${trail}（${lang}）事实数字与 en 不一致：${d}\n    en : ${enNode.slice(0, 160)}\n    ${lang} : ${langNode.slice(0, 160)}`
      );
    }
    return;
  }
  if (Array.isArray(enNode)) {
    if (!Array.isArray(langNode)) return;
    enNode.forEach((child, i) => {
      if (i < langNode.length) compareNumbers(child, langNode[i], lang, `${trail}[${i}]`, problems);
    });
    return;
  }
  if (enNode && typeof enNode === 'object') {
    if (!langNode || typeof langNode !== 'object') return;
    for (const [k, v] of Object.entries(enNode)) {
      if (k in langNode) compareNumbers(v, langNode[k], lang, `${trail}.${k}`, problems);
    }
  }
}

// 子树里所有字符串叶子（写法规范检查用）。
function collectStrings(node, trail, out, seen) {
  if (typeof node === 'string') {
    out.push({ trail, text: node });
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (seen.has(node)) return;
  seen.add(node);
  if (Array.isArray(node)) {
    node.forEach((c, i) => collectStrings(c, `${trail}[${i}]`, out, seen));
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (typeof v === 'function') continue;
    collectStrings(v, `${trail}.${k}`, out, seen);
  }
}

// ── 被测模块清单 ─────────────────────────────────────────────────────────
const i18nFiles = fs
  .readdirSync(I18N_DIR)
  .filter((f) => f.endsWith('.js') && !SKIP_I18N_FILES.has(f))
  .sort();

// lib/ 下正文内嵌在数据结构里的三个模块（不在 lib/i18n，但同样是九语正文）。
// 它们是 ESM，用 await import() 加载（与 tests/playbookContent.test.js 同法）。
const DATA_MODULES = ['hireMatrix.js', 'occupations.js', 'regionGuides.js'];

// 取一个数据模块里"能遍历到九语正文"的根对象清单。
// hireMatrix 把数据直接 export（REGIONS/RATES_NOTE/…），遍历导出对象即可；
// regionGuides 与 occupations 只导出访问器（GUIDES / OCCUPATIONS 是模块私有），
// 必须先用 paths 访问器枚举出每个页面的数据包再遍历——否则只能扫到一堆函数，
// 静默扫出 0 个语言节点（下面的 nodes.length > 0 断言就是防这个静默失守）。
function moduleRoots(mod) {
  if (typeof mod.getGuidePaths === 'function' && typeof mod.getGuide === 'function') {
    return mod
      .getGuidePaths()
      .map((p) => (typeof p === 'string' ? p : p?.params?.region))
      .filter(Boolean)
      .map((region) => mod.getGuide(region));
  }
  if (typeof mod.getOccupationPaths === 'function' && typeof mod.getOccupationPage === 'function') {
    return mod
      .getOccupationPaths()
      .map((p) => (typeof p === 'string' ? p : p?.params?.role))
      .filter(Boolean)
      .map((role) => mod.getOccupationPage(role));
  }
  return [mod];
}

function auditLangNodes(nodes) {
  const problems = [];
  for (const { trail, node } of nodes) {
    for (const lang of Object.keys(node)) {
      if (lang === 'en' || !LANG_SET.has(lang)) continue;
      compareNumbers(node.en, node[lang], lang, trail, problems);
    }
  }
  return problems;
}

describe('lib/i18n 字典：事实数字（货币/百分比）跨语言一致', () => {
  for (const file of i18nFiles) {
    it(`${file} 各语言数字与 en 一致`, () => {
      const mod = require(path.join(I18N_DIR, file));
      const nodes = [];
      collectLangNodes(mod, `lib/i18n/${file}`, nodes, new Set());
      assert.ok(nodes.length > 0, `lib/i18n/${file} 没探测到任何语言节点（导出形状变了？）`);
      const problems = auditLangNodes(nodes);
      assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
    });
  }
});

describe('lib 数据模块（hireMatrix/occupations/regionGuides）：事实数字跨语言一致', () => {
  for (const file of DATA_MODULES) {
    it(`${file} 各语言数字与 en 一致`, async () => {
      const mod = await import(path.join(ROOT, 'lib', file));
      const nodes = [];
      moduleRoots(mod).forEach((r, i) =>
        collectLangNodes(r, `lib/${file}#${i}`, nodes, new Set())
      );
      assert.ok(nodes.length > 0, `lib/${file} 没探测到任何语言节点（导出形状变了？）`);
      const problems = auditLangNodes(nodes);
      assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
    });
  }
});

describe('九语正文：数字写法规范（$ 在前、% 紧贴）', () => {
  it('lib/i18n 全模块无违例', () => {
    const problems = [];
    for (const file of i18nFiles) {
      const mod = require(path.join(I18N_DIR, file));
      const strings = [];
      collectStrings(mod, `lib/i18n/${file}`, strings, new Set());
      for (const { trail, text } of strings) {
        for (const v of formatViolations(text)) problems.push(`${trail}: ${v}`);
      }
    }
    assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
  });

  it('lib 数据模块无违例', async () => {
    const problems = [];
    for (const file of DATA_MODULES) {
      const mod = await import(path.join(ROOT, 'lib', file));
      const strings = [];
      moduleRoots(mod).forEach((r, i) => collectStrings(r, `lib/${file}#${i}`, strings, new Set()));
      for (const { trail, text } of strings) {
        for (const v of formatViolations(text)) problems.push(`${trail}: ${v}`);
      }
    }
    assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
  });
});

// ── playbook 翻译组 ──────────────────────────────────────────────────────
// 文章按 frontmatter 的 group 配对（文件名后缀不可靠：原始文章可能是 zh，
// 英文版反而带 -en 后缀）；每组以 lang: en 的变体为基准，组内没有 en 变体的
// （如只有 zh 的独立文章）跳过。
// 比对文本 = title + description + 正文（剥掉 HTML 注释——那是维护者备注，
// 里面故意写着代码里的数字清单，不是给用户看的展示文案）。
function stripHtmlComments(s) {
  return s.replace(/<!--[\s\S]*?-->/g, ' ');
}

// ── 已审阅并接受的跨语言差异（键 = `${group}|${lang}`）────────────────────
// 加条目之前先自问一遍：这个数字是不是**平台自己的事实**（平台费、founding 让利、
// 举证天数、费率区间）？是就去改内容，不要往这里加豁免——豁免多了红线就废了。
// 只有"同一事实在两种语言里的地道写法不同"才配进这张表，且必须写清 why。
const ACCEPTED_PLAYBOOK_DIFFS = {
  'platform-fee-transparency|zh': {
    missing: ['0%'],
    why:
      'en 变体引述竞对广告语 "0% commission"，而本文的**原始语言是 zh**（-en.md 才是译文），' +
      '中文市场这句口号的地道说法就是「0 佣金」。这是第三方口号的本地化转述，' +
      '不是平台事实数字——本页真正的平台数字（15% / 5%）两语完全一致。',
  },
};

function readPlaybookVariants(parseFrontmatter) {
  const files = fs.readdirSync(PLAYBOOK_DIR).filter((f) => f.endsWith('.md'));
  return files
    .map((f) => {
      const raw = fs.readFileSync(path.join(PLAYBOOK_DIR, f), 'utf8');
      const { data, content } = parseFrontmatter(raw);
      if (!data || !data.lang) return null;
      return {
        file: f,
        lang: data.lang,
        group: data.group || data.slug || f.replace(/\.md$/, ''),
        text: stripHtmlComments(
          [data.title || '', data.description || '', content || ''].join('\n')
        ),
      };
    })
    .filter(Boolean);
}

describe('content/playbook 翻译组：事实数字与 en 变体一致', () => {
  it('每个翻译组的各语言变体数字与 en 一致', async () => {
    const { parseFrontmatter } = await import('../lib/playbook.js');
    const variants = readPlaybookVariants(parseFrontmatter);
    assert.ok(variants.length > 0, 'content/playbook 没解析出任何文章');

    const groups = new Map();
    for (const v of variants) {
      if (!groups.has(v.group)) groups.set(v.group, []);
      groups.get(v.group).push(v);
    }

    const problems = [];
    for (const [key, list] of groups) {
      const base = list.find((v) => v.lang === 'en');
      if (!base) continue; // 组内无 en 基准（zh 独立文章）
      const baseTokens = extractFactNumbers(base.text);
      for (const v of list) {
        if (v === base) continue;
        const accepted = ACCEPTED_PLAYBOOK_DIFFS[`${key}|${v.lang}`];
        const d = diffSet(baseTokens, extractFactNumbers(v.text), accepted);
        if (d) problems.push(`翻译组 ${key} 的 ${v.file}（${v.lang}）：${d}`);
      }
    }
    assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
  });

  it('各语言变体的数字写法规范（$ 在前、% 紧贴）', async () => {
    const { parseFrontmatter } = await import('../lib/playbook.js');
    const problems = [];
    for (const v of readPlaybookVariants(parseFrontmatter)) {
      for (const msg of formatViolations(v.text)) problems.push(`${v.file}: ${msg}`);
    }
    assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
  });
});
