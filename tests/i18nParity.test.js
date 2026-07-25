// ── lib/i18n 语言字典完整性测试（架构 B 的核心收益）───────────────────────
// 守护 2026-07-24 九语全站铺开工程的三条红线：
//   1. 结构无洞：每个字典模块以 en 为基准，其余每种语言的深层键结构必须与 en
//      完全一致（递归键集相同、数组等长、叶子值为非空字符串）——漏译一个键、
//      多打一个键、把数组砍短，直接红灯。
//   2. 语言无缺：REQUIRED_LANGS 清单声明每个模块必须具备的语言列表，缺语言红灯。
//   3. 登记纪律：lib/i18n/ 下每新增一个模块都必须在 REQUIRED_LANGS 登记，
//      忘了登记也红灯——防止"迁了页面但没人守护"的静默缺口。
//
// 【模块风格约定】lib/i18n/ 字典模块统一 CommonJS 纯数据（`module.exports = { DICT }`，
// 样板见 lib/i18n/rates.js 头注释），与 lib/navConfig.js / lib/i18n/glossary.js 同一
// 先例：node --test 直接 require 零配置，Next webpack 对 CJS 互操作正常。
// 因此本测试用同步 require() 加载——后续批次不要把字典写成 ESM。
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const I18N_DIR = path.join(__dirname, '..', 'lib', 'i18n');

// 站点固定的 9 种语言（与 Navbar LANGS / useLang / navConfig.test.js 同口径）。
const ALL_LANGS = ['en', 'zh', 'es', 'vi', 'hi', 'fr', 'de', 'ja', 'ko'];

// ── REQUIRED_LANGS 清单：模块名（不含 .js）→ 该模块必须具备的语言列表 ──────
// 后续批次每迁一个页面，就在这里追加一行 `<页面名>: ALL_LANGS,`
// （个别页若刻意只做部分语言，写实际列表并注明原因）。
// 2026-07-24 三期收尾：全部模块九语灌注完毕，二期 EN_ZH 过渡清单已清零。
const REQUIRED_LANGS = {
  rates: ALL_LANGS, // /rates 费率基准页（2026-07-24 试点迁移，九语全量）
  pricing: ALL_LANGS, // /pricing 定价页（2026-07-24 全流程试点：en/zh 原样搬移 + 7 语按 glossary 灌注）
  // ── 二期九语全量批次（2026-07-24 sweep）──────────────────────────────
  index: ALL_LANGS, // 首页
  console: ALL_LANGS, // /console 控制台
  finance: ALL_LANGS, // /finance 财务
  onboarding: ALL_LANGS, // /onboarding 入驻流程
  warroom: ALL_LANGS, // /warroom 项目聊天室
  'messages-index': ALL_LANGS, // /messages 消息列表
  training: ALL_LANGS, // /training 培训
  talent: ALL_LANGS, // /talent 工程师目录
  enterprise: ALL_LANGS, // /enterprise 企业版
  // ── 三期九语灌注批次（2026-07-24，原二期 en/zh 过渡页全量转九语）──────
  trust: ALL_LANGS,
  talscore: ALL_LANGS, // 另导出 RULES（语言字典，见 EXTRA_LANG_EXPORTS）
  certification: ALL_LANGS, // 另导出 FUNNEL/ANTICHEAT（语言字典，见 EXTRA_LANG_EXPORTS）
  calculator: ALL_LANGS,
  'how-it-works': ALL_LANGS,
  about: ALL_LANGS,
  contact: ALL_LANGS,
  resources: ALL_LANGS,
  'hire-index': ALL_LANGS, // 另导出 TRACK_BLURBS（赛道优先结构，专属测试见下）
  'hire-track': ALL_LANGS, // 另导出 TRACKS（赛道优先结构，专属测试见下）
  'hire-track-industry': ALL_LANGS,
  'occupations-role': ALL_LANGS,
  'occupations-index': ALL_LANGS,
  coverage: ALL_LANGS,
  'case-studies': ALL_LANGS,
  developers: ALL_LANGS,
  referral: ALL_LANGS,
  'guides-index': ALL_LANGS,
  'playbook-index': ALL_LANGS,
  whitepaper: ALL_LANGS,
  pools: ALL_LANGS,
  privacy: ALL_LANGS,
  terms: ALL_LANGS,
  'dispute-id': ALL_LANGS,
};

// ── 顶层可缺键豁免清单（模块名 → 允许 7 语（es/vi/hi/fr/de/ja/ko）缺失的顶层键）──
// 机制保留给未来"en/zh 先行、7 语后补"的功能文案；豁免行三期补翻后必须删掉。
// 2026-07-24 三期收尾：enterprise/finance/talent 的豁免键已全部补翻，清单清零，
// 全站恢复全量红线。en/zh 任何时候不享受豁免。
const OPTIONAL_TOP_KEYS = {};

// ── DICT 之外的"语言优先"额外导出（顶层键=语言码），复用同一套形状比对 ────
// hire-index.TRACK_BLURBS / hire-track.TRACKS 是"赛道优先"结构（顶层键=赛道，
// 语言嵌在内层，TRACKS 还混有语言无关的 serviceType/skills），套不进这套
// lang→en 比对，用文件末尾的专属测试守护。
const EXTRA_LANG_EXPORTS = {
  talscore: ['RULES'],
  certification: ['FUNNEL', 'ANTICHEAT'],
};

// glossary.js 是术语表（TERMS/STYLE 结构，非页面字典），有专属测试
// tests/glossary.test.js，此处跳过。
const SKIP_FILES = new Set(['glossary.js']);

const dictFiles = fs
  .readdirSync(I18N_DIR)
  .filter((f) => f.endsWith('.js') && !SKIP_FILES.has(f))
  .sort();

// ── 递归结构比对：node 与 en 基准的形状必须完全一致 ─────────────────────
// trail 记录路径（如 DICT.zh.aboutBody1 / DICT.ja.items[2].title），红灯时直接定位。
// optionalKeys（Set，可选）：仅顶层生效的可缺键豁免（见 OPTIONAL_TOP_KEYS），
// 递归进入子层后不再传递——豁免只允许"整键缺失"，不允许结构走样。
function assertSameShape(enNode, node, lang, trail, optionalKeys) {
  if (Array.isArray(enNode)) {
    assert.ok(Array.isArray(node), `${trail}（${lang}）应为数组（en 基准是数组）`);
    assert.equal(node.length, enNode.length, `${trail}（${lang}）数组长度与 en 不一致`);
    enNode.forEach((child, i) => assertSameShape(child, node[i], lang, `${trail}[${i}]`));
  } else if (enNode !== null && typeof enNode === 'object') {
    assert.ok(
      node !== null && typeof node === 'object' && !Array.isArray(node),
      `${trail}（${lang}）应为对象（en 基准是对象）`
    );
    const enKeys = Object.keys(enNode).sort();
    const langKeys = Object.keys(node).sort();
    if (optionalKeys) {
      // 豁免模式：只允许缺 optionalKeys 里登记的键，绝不允许多出野键。
      const extra = langKeys.filter((k) => !enKeys.includes(k));
      assert.deepEqual(extra, [], `${trail}（${lang}）多打了 en 基准没有的键`);
      const missing = enKeys.filter((k) => !langKeys.includes(k));
      const unexcused = missing.filter((k) => !optionalKeys.has(k));
      assert.deepEqual(
        unexcused,
        [],
        `${trail}（${lang}）缺键且不在 OPTIONAL_TOP_KEYS 豁免清单内`
      );
    } else {
      assert.deepEqual(
        langKeys,
        enKeys,
        `${trail}（${lang}）键集与 en 不一致（缺译或多打了键）`
      );
    }
    for (const k of enKeys) {
      if (!(k in node)) continue; // 仅豁免模式下可能走到：该键已被豁免缺失
      assertSameShape(enNode[k], node[k], lang, `${trail}.${k}`);
    }
  } else if (typeof enNode === 'function') {
    // 参数化文案（如 warroom.joinedMsg(name)、training.studyLine(n)）：
    // en 基准是函数时，其余语言同位置也必须是函数（内容无法静态比对）。
    assert.equal(
      typeof node,
      'function',
      `${trail}（${lang}）应为函数（en 基准是参数化文案函数）`
    );
  } else if (typeof enNode === 'number') {
    // 语言无关数值数据（如 index.categories[].count/rate）：各语言同位置必须同为有限数。
    assert.ok(
      typeof node === 'number' && Number.isFinite(node),
      `${trail}（${lang}）应为有限数值（en 基准是数值），实际: ${JSON.stringify(node)}`
    );
  } else {
    // 叶子：一律要求非空字符串（en 与 en 自比时也走这里，顺带守住 en 基准本身）。
    assert.ok(
      typeof node === 'string' && node.trim().length > 0,
      `${trail}（${lang}）必须是非空字符串，实际: ${JSON.stringify(node)}`
    );
  }
}

describe('lib/i18n 字典模块自动发现与登记纪律', () => {
  it('lib/i18n/ 下每个字典模块都已在 REQUIRED_LANGS 登记', () => {
    for (const file of dictFiles) {
      const name = file.replace(/\.js$/, '');
      assert.ok(
        Object.prototype.hasOwnProperty.call(REQUIRED_LANGS, name),
        `lib/i18n/${file} 未在 REQUIRED_LANGS 登记——迁移配方第 4 步漏了（见 lib/i18n/rates.js 头注释）`
      );
    }
  });

  it('REQUIRED_LANGS 不引用不存在的模块（防改名/删除后清单腐化）', () => {
    const names = new Set(dictFiles.map((f) => f.replace(/\.js$/, '')));
    for (const name of Object.keys(REQUIRED_LANGS)) {
      assert.ok(names.has(name), `REQUIRED_LANGS.${name} 对应的 lib/i18n/${name}.js 不存在`);
    }
  });
});

for (const file of dictFiles) {
  const name = file.replace(/\.js$/, '');
  // CJS 纯数据模块，直接同步 require（模块风格约定见文件头注释）。
  const mod = require(path.join(I18N_DIR, file));

  describe(`lib/i18n/${file} 九语键结构完整性`, () => {
    it('导出 DICT 且含 en 基准', () => {
      assert.ok(mod && typeof mod === 'object', `lib/i18n/${file} 导出异常`);
      assert.ok(
        mod.DICT && typeof mod.DICT === 'object' && !Array.isArray(mod.DICT),
        `lib/i18n/${file} 必须导出 DICT 对象（module.exports = { DICT }）`
      );
      assert.ok(
        mod.DICT.en && typeof mod.DICT.en === 'object',
        `lib/i18n/${file} 的 DICT 缺 en 基准（SSR 首帧兜底语言）`
      );
    });

    it('REQUIRED_LANGS 声明的语言全部存在', () => {
      const required = REQUIRED_LANGS[name] || [];
      for (const lang of required) {
        assert.ok(
          mod.DICT[lang] !== undefined,
          `lib/i18n/${file} 缺语言 ${lang}（REQUIRED_LANGS 要求 ${required.join('/')}）`
        );
      }
    });

    it('每种已有语言与 en 深层键结构完全一致、值非空', () => {
      // 遍历 DICT 里实际存在的所有语言（含 en 自比，顺带校验 en 叶子非空）；
      // 同时挡住 DICT 里混入非语言码的野键。
      for (const lang of Object.keys(mod.DICT)) {
        assert.ok(
          ALL_LANGS.includes(lang),
          `lib/i18n/${file} 的 DICT 含未知语言码 "${lang}"（合法: ${ALL_LANGS.join('/')}）`
        );
        // 顶层可缺键豁免只给 7 语（en 是基准、zh 是二期完整语言，不享受豁免）。
        const optional =
          OPTIONAL_TOP_KEYS[name] && lang !== 'en' && lang !== 'zh'
            ? new Set(OPTIONAL_TOP_KEYS[name])
            : undefined;
        assertSameShape(mod.DICT.en, mod.DICT[lang], lang, `DICT.${lang}`, optional);
      }
    });

    // DICT 之外的"语言优先"额外导出，跟 DICT 用同一套红线（语言齐 + 形状同 en）。
    for (const exp of EXTRA_LANG_EXPORTS[name] || []) {
      it(`额外导出 ${exp} 语言齐全且与 en 结构一致`, () => {
        const dict = mod[exp];
        assert.ok(
          dict && typeof dict === 'object' && !Array.isArray(dict),
          `lib/i18n/${file} 缺额外导出 ${exp}（EXTRA_LANG_EXPORTS 已登记）`
        );
        for (const lang of REQUIRED_LANGS[name] || []) {
          assert.ok(dict[lang] !== undefined, `lib/i18n/${file} 的 ${exp} 缺语言 ${lang}`);
        }
        for (const lang of Object.keys(dict)) {
          assert.ok(
            ALL_LANGS.includes(lang),
            `lib/i18n/${file} 的 ${exp} 含未知语言码 "${lang}"`
          );
          assertSameShape(dict.en, dict[lang], lang, `${exp}.${lang}`);
        }
      });
    }
  });
}

// ── 赛道优先结构的专属守护（顶层键=赛道，语言嵌在内层）─────────────────────
describe('lib/i18n/hire-index.js TRACK_BLURBS 赛道文案语言齐全', () => {
  const { TRACK_BLURBS } = require(path.join(I18N_DIR, 'hire-index.js'));
  it('每条赛道文案 en/zh 齐全且为非空字符串', () => {
    assert.ok(TRACK_BLURBS && Object.keys(TRACK_BLURBS).length > 0, '缺 TRACK_BLURBS');
    for (const [track, blurb] of Object.entries(TRACK_BLURBS)) {
      // 各语言互为形状基准（叶子字符串），en 缺失或空串直接红灯。
      for (const lang of REQUIRED_LANGS['hire-index']) {
        assert.ok(
          typeof blurb[lang] === 'string' && blurb[lang].trim().length > 0,
          `TRACK_BLURBS.${track}.${lang} 必须是非空字符串`
        );
      }
    }
  });
});

describe('lib/i18n/hire-track.js TRACKS 赛道字典语言齐全', () => {
  const { TRACKS } = require(path.join(I18N_DIR, 'hire-track.js'));
  it('每条赛道含语言无关字段 + 各语言块与 en 结构一致', () => {
    assert.ok(TRACKS && Object.keys(TRACKS).length > 0, '缺 TRACKS');
    for (const [track, def] of Object.entries(TRACKS)) {
      // 语言无关字段：serviceType（结构化数据用）+ skills（标签数组）。
      assert.ok(
        typeof def.serviceType === 'string' && def.serviceType.trim().length > 0,
        `TRACKS.${track}.serviceType 必须是非空字符串`
      );
      assert.ok(
        Array.isArray(def.skills) && def.skills.length > 0,
        `TRACKS.${track}.skills 必须是非空数组`
      );
      // 语言块：REQUIRED_LANGS 声明的语言必须齐，且形状与 en 完全一致。
      for (const lang of REQUIRED_LANGS['hire-track']) {
        assert.ok(def[lang] !== undefined, `TRACKS.${track} 缺语言块 ${lang}`);
        assertSameShape(def.en, def[lang], lang, `TRACKS.${track}.${lang}`);
      }
    }
  });
});
