// ── 术语表完整性测试（lib/i18n/glossary.js）──────────────────────────────
// 守护 2026-07-24 九语铺开工程的术语基座三条红线：
//   1. 九语无缺：TERMS 每个词条 9 种语言齐全且非空，note 非空（翻译 agent 的
//      引用依据不能有洞）。
//   2. 保留英文纪律：KEEP_ENGLISH 里的词若出现在 TERMS 译文里，必须逐字节原样
//      （不许 plc / Scada 这类改写大小写的形态）；且已知的音译/意译错误形态
//      （西门子式品牌译名、シーメンス 等）绝不允许混进 TERMS——宽松检查，
//      挡住最常见的"机翻露馅"形态。
//   3. STYLE 覆盖全部 9 语且非空。
// 结构同仓库先例 navConfig.test.js：CJS 纯数据直接 require。
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { KEEP_ENGLISH, TERMS, STYLE } = require('../lib/i18n/glossary');

// 站点固定的 9 种语言（与 Navbar LANGS / useLang / navConfig.test.js 同口径）。
const LANG_CODES = ['en', 'zh', 'es', 'vi', 'hi', 'fr', 'de', 'ja', 'ko'];

describe('glossary 结构完整性', () => {
  it('KEEP_ENGLISH 非空、无重复、全为非空字符串', () => {
    assert.ok(Array.isArray(KEEP_ENGLISH) && KEEP_ENGLISH.length > 0, 'KEEP_ENGLISH 必须是非空数组');
    for (const term of KEEP_ENGLISH) {
      assert.ok(typeof term === 'string' && term.trim().length > 0, `KEEP_ENGLISH 含非法项: ${JSON.stringify(term)}`);
    }
    assert.equal(new Set(KEEP_ENGLISH).size, KEEP_ENGLISH.length, 'KEEP_ENGLISH 含重复项');
  });

  it('每个 TERMS 词条 9 种语言齐全且非空，并带 note', () => {
    const keys = Object.keys(TERMS);
    assert.ok(keys.length >= 20, `TERMS 词条数异常偏少: ${keys.length}`);
    for (const key of keys) {
      const entry = TERMS[key];
      assert.ok(typeof entry.note === 'string' && entry.note.trim().length > 0, `TERMS.${key} 缺 note`);
      for (const lang of LANG_CODES) {
        assert.ok(
          typeof entry[lang] === 'string' && entry[lang].trim().length > 0,
          `TERMS.${key} 缺 ${lang} 译法或为空`
        );
      }
      // 词条不许夹带 9 语与 note 之外的未知键（防手滑打错语言码悄悄漏检）
      for (const k of Object.keys(entry)) {
        assert.ok(k === 'note' || LANG_CODES.includes(k), `TERMS.${key} 含未知键 ${k}`);
      }
    }
  });

  it('STYLE 覆盖全部 9 语且非空', () => {
    assert.deepEqual(Object.keys(STYLE).sort(), [...LANG_CODES].sort(), 'STYLE 语言集与 9 语口径不一致');
    for (const lang of LANG_CODES) {
      assert.ok(typeof STYLE[lang] === 'string' && STYLE[lang].trim().length > 0, `STYLE.${lang} 为空`);
    }
  });
});

describe('KEEP_ENGLISH 保留英文纪律（宽松检查）', () => {
  // 收集 TERMS 里全部译文字符串（note 不算——note 是给 agent 的中文说明，允许提及各种形态）
  const allValues = [];
  for (const [key, entry] of Object.entries(TERMS)) {
    for (const lang of LANG_CODES) allValues.push({ key, lang, value: entry[lang] });
  }

  it('KEEP_ENGLISH 词若出现在译文中，必须逐字节原样（不许改写大小写）', () => {
    // 词边界判断：短缩写（OT/SAT 等）会撞上普通单词内部（如 robot 里的 "ot"），
    // 只有独立成词（前后都不是拉丁字母/数字）的出现才算命中。
    const isWordChar = (ch) => ch !== undefined && /[A-Za-z0-9]/.test(ch);
    for (const term of KEEP_ENGLISH) {
      const lower = term.toLowerCase();
      for (const { key, lang, value } of allValues) {
        const vLower = value.toLowerCase();
        let idx = vLower.indexOf(lower);
        while (idx !== -1) {
          const bounded = !isWordChar(value[idx - 1]) && !isWordChar(value[idx + term.length]);
          if (bounded) {
            const found = value.slice(idx, idx + term.length);
            assert.equal(
              found, term,
              `TERMS.${key}.${lang} 里 KEEP_ENGLISH 词「${term}」被改写为「${found}」`
            );
          }
          idx = vLower.indexOf(lower, idx + 1);
        }
      }
    }
  });

  it('已知的音译/意译错误形态不得混进 TERMS 译文', () => {
    // 最常见的"机翻露馅"形态清单：KEEP_ENGLISH 品牌/缩写在各语的本地化写法。
    // （zh 叙述正文允许西门子等固化品牌名——但 TERMS 是平台术语表，品牌名
    //  本就不该出现在这些译文里，出现即说明有词条被机翻污染。）
    const FORBIDDEN = [
      // zh 品牌译名
      '西门子', '罗克韦尔', '基恩士', '霍尼韦尔', '安川电机', '发那科', '库卡',
      // ja 片假名品牌音译
      'シーメンス', 'ロックウェル', 'ファナック', 'クーカ', 'ハネウェル', 'キーエンス',
      // ko 谚文品牌音译
      '지멘스', '화낙', '로크웰', '하니웰', '키엔스',
      // 缩写被音译/全称化的典型错误
      'पीएलसी', 'स्काडा', 'ピーエルシー', '可编程逻辑控制器',
      // 产品名被翻译的典型错误（TalScore / WarRoom 永不译）
      '战情分', 'タルスコア', '탈스코어',
    ];
    for (const bad of FORBIDDEN) {
      for (const { key, lang, value } of allValues) {
        assert.ok(
          !value.includes(bad),
          `TERMS.${key}.${lang} 含禁用形态「${bad}」（对应词应保持英文原样）`
        );
      }
    }
  });
});

// ── 产品展示名的全站遵守情况（DISPLAY_NAMES，2026-07-25 统一后加的回归卫）────
// glossary 里写下规则还不够——规则要能挡住"下一次某语言又把展示名译回去"。
// 这一组扫的是 lib/i18n 全部字典模块的**源文件文本**（而不是 require 后的对象），
// 因为展示名也可能藏在注释、模板串、参数化文案函数体里，读源码才扫得全。
describe('DISPLAY_NAMES 产品展示名九语一致', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const { DISPLAY_NAMES } = require('../lib/i18n/glossary');

  const I18N_DIR = path.join(__dirname, '..', 'lib', 'i18n');

  it('每个展示名词条结构齐全（code/display/brand/retired/note）', () => {
    const keys = Object.keys(DISPLAY_NAMES);
    assert.ok(keys.length > 0, 'DISPLAY_NAMES 为空');
    for (const key of keys) {
      const e = DISPLAY_NAMES[key];
      for (const field of ['note', 'code', 'display', 'brand']) {
        assert.ok(
          typeof e[field] === 'string' && e[field].trim().length > 0,
          `DISPLAY_NAMES.${key}.${field} 必须是非空字符串`
        );
      }
      assert.ok(Array.isArray(e.retired), `DISPLAY_NAMES.${key}.retired 必须是数组`);
      // display 去掉空格后必须等于 code——两者是同一个名字的两种写法，
      // 写岔了说明有人改了其中一个忘了另一个。
      assert.equal(
        e.display.replace(/\s+/g, ''),
        e.code,
        `DISPLAY_NAMES.${key}: display「${e.display}」去空格后应等于 code「${e.code}」`
      );
      assert.ok(
        e.brand.endsWith(e.display),
        `DISPLAY_NAMES.${key}: brand「${e.brand}」应以 display「${e.display}」结尾`
      );
    }
  });

  it('lib/i18n 任何语言字典里都不得出现已退役的本地化展示名', () => {
    const files = fs.readdirSync(I18N_DIR).filter((f) => f.endsWith('.js') && f !== 'glossary.js');
    const problems = [];
    for (const file of files) {
      const lines = fs.readFileSync(path.join(I18N_DIR, file), 'utf8').split('\n');
      for (const key of Object.keys(DISPLAY_NAMES)) {
        for (const retired of DISPLAY_NAMES[key].retired) {
          lines.forEach((line, i) => {
            if (line.includes(retired)) {
              problems.push(
                `lib/i18n/${file}:${i + 1} 出现已退役的 ${key} 本地化展示名「${retired}」` +
                  `——展示名九语统一为「${DISPLAY_NAMES[key].display}」（见 glossary.js §4）`
              );
            }
          });
        }
      }
    }
    assert.deepEqual(problems, [], `\n${problems.join('\n')}\n`);
  });
});
