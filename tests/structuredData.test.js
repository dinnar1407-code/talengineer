// ── 结构化数据覆盖与一致性（schema.org / JSON-LD）─────────────────────────────
// 为什么要这条：结构化数据缺失是【静默】的——页面照常渲染、构建照常通过、测试照常绿，
// 只有搜索引擎和 AI 抓取器那边少了东西，人根本发现不了。2026-07-26 一次盘点发现
// 10 个公开页零结构化数据，就是这么攒出来的。所以把"公开页必须有 JSON-LD"钉成测试。
//
// 两类断言：
//   1) 覆盖：pages/ 下每个公开页都输出 application/ld+json（排除表逐条写明理由）
//   2) 一致：lib/jsonLd.js 产出的 @graph 里 Organization/WebSite 的 @id 全站固定不变——
//      这是 AI 侧实体归并的基础，@id 一漂移，各页的事实就挂不到同一个主体上了
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { pageJsonLd, faqEntity, stripBrand, ORG_ID, WEBSITE_ID } = require('../lib/jsonLd');

const PAGES_DIR = path.join(__dirname, '..', 'pages');

// ── 豁免清单：登录后才能用的应用页 + 框架文件。每条都要有理由，不许"先加进来再说" ──
// 判据是「这个 URL 值不值得被搜索引擎和 AI 索引」：应用页不值得（也大多要求登录），
// 营销/内容页值得。新增页面若属前者，加进这里并写明理由；否则就该有 JSON-LD。
const EXEMPT = {
  '_app.jsx': 'Next 框架文件，不是页面',
  '_document.jsx': 'Next 框架文件，不是页面',
  'sitemap.xml.jsx': '输出 XML 不是 HTML',
  'offline.jsx': 'PWA 离线兜底页，不该被索引',
  'login.jsx': '登录页已显式 noindex',
  'reset-password.jsx': '一次性令牌页，不该被索引',
  'verify-email.jsx': '一次性令牌页，不该被索引',
  'admin.jsx': '后台，需 admin + 2FA',
  'console.jsx': '登录后的控制台',
  'finance.jsx': '登录后的托管/财务页',
  'onboarding.jsx': '登录后的建档向导',
  'warroom.jsx': '登录后的项目聊天室',
  'messages/index.jsx': '登录后的消息列表',
  'messages/[demandId].jsx': '登录后的消息详情',
  'dispute/[id].jsx': '登录后的纠纷页',
  'project/[id].jsx': '登录后的项目详情',
  'workorder/[id].jsx': '登录后的现场工单',
};

function listPageFiles(dir = PAGES_DIR, prefix = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...listPageFiles(path.join(dir, entry.name), rel));
    else if (entry.name.endsWith('.jsx')) out.push(rel);
  }
  return out;
}

describe('结构化数据覆盖：每个公开页都要有 JSON-LD', () => {
  const files = listPageFiles();

  it('公开页无一遗漏', () => {
    const missing = [];
    for (const rel of files) {
      if (EXEMPT[rel]) continue; // 豁免（值为 null 的不算豁免，见 EXEMPT 里的说明）
      const src = fs.readFileSync(path.join(PAGES_DIR, rel), 'utf8');
      if (!src.includes('application/ld+json')) missing.push(rel);
    }
    assert.deepEqual(
      missing, [],
      `以下公开页没有结构化数据：\n  ${missing.join('\n  ')}\n`
      + '要么用 lib/jsonLd.js 的 pageJsonLd() 补上，要么加进 EXEMPT 并写明理由。',
    );
  });

  it('豁免清单不引用已不存在的文件（防清单腐化）', () => {
    const existing = new Set(files);
    const stale = Object.keys(EXEMPT).filter((f) => !existing.has(f));
    assert.deepEqual(stale, [], `豁免清单里的文件已不存在：${stale.join(', ')}`);
  });

  it('豁免的都是应用页/框架文件，不含营销内容页', () => {
    // 反向哨兵：万一有人为了让测试变绿，把内容页塞进豁免清单
    const contentish = /^(index|about|pricing|rates|trust|talscore|coverage|contact|resources|whitepaper|training|certification|calculator|case-studies|developers|enterprise|pools|referral|how-it-works)\.jsx$/;
    const smuggled = Object.entries(EXEMPT)
      .filter(([f, reason]) => reason && contentish.test(f))
      .map(([f]) => f);
    assert.deepEqual(smuggled, [], `内容页不该出现在豁免清单里：${smuggled.join(', ')}`);
  });
});

describe('lib/jsonLd：实体 @id 全站固定（AI 侧实体归并的基础）', () => {

  it('@graph 含本页节点 + Organization + WebSite 三节点', () => {
    const g = pageJsonLd({ path: '/trust', name: 'Trust Center', description: 'x' })['@graph'];
    assert.deepEqual(g.map((n) => n['@type']), ['WebPage', 'Organization', 'WebSite']);
  });

  it('Organization / WebSite 的 @id 与常量一致，且不随页面变化', () => {
    const a = pageJsonLd({ path: '/a', name: 'A', description: 'a' })['@graph'];
    const b = pageJsonLd({ path: '/b', name: 'B', description: 'b' })['@graph'];
    for (const g of [a, b]) {
      assert.equal(g[1]['@id'], ORG_ID);
      assert.equal(g[2]['@id'], WEBSITE_ID);
      assert.equal(g[0].publisher['@id'], ORG_ID, '本页节点必须指回同一个 Organization');
      assert.equal(g[0].isPartOf['@id'], WEBSITE_ID);
    }
    // 两个页面的组织节点必须逐字相同——不一致就等于两个组织
    assert.deepEqual(a[1], b[1]);
  });

  it('本页节点 @id 按路径区分（不同页不能撞同一个 @id）', () => {
    const a = pageJsonLd({ path: '/a', name: 'A', description: 'a' })['@graph'][0];
    const b = pageJsonLd({ path: '/b', name: 'B', description: 'b' })['@graph'][0];
    assert.notEqual(a['@id'], b['@id']);
    assert.match(a['@id'], /\/a#page$/);
  });

  it('name 会剥掉 " | Talengineer" 后缀（那是 <title> 的写法，不是实体名）', () => {
    assert.equal(stripBrand('Trust Center — Escrow | Talengineer'), 'Trust Center — Escrow');
    assert.equal(stripBrand('Trust Center'), 'Trust Center');
    const node = pageJsonLd({ path: '/t', name: 'Foo | Talengineer', description: 'd' })['@graph'][0];
    assert.equal(node.name, 'Foo');
  });

  it('type 与 extra 可覆写（CollectionPage 带 hasPart 等）', () => {
    const node = pageJsonLd({
      path: '/c', name: 'C', description: 'd',
      type: 'CollectionPage', extra: { hasPart: [{ '@type': 'WebPage', name: 'x' }] },
    })['@graph'][0];
    assert.equal(node['@type'], 'CollectionPage');
    assert.equal(node.hasPart.length, 1);
  });

  it('faqEntity 产出成对的 Question/Answer（AI 检索最吃这一类）', () => {
    const e = faqEntity([{ q: 'How much?', a: '15% platform fee.' }]);
    assert.equal(e['@type'], 'FAQPage');
    assert.equal(e.mainEntity[0]['@type'], 'Question');
    assert.equal(e.mainEntity[0].name, 'How much?');
    assert.equal(e.mainEntity[0].acceptedAnswer.text, '15% platform fee.');
  });

  it('faqEntity 对空输入不炸', () => {
    assert.deepEqual(faqEntity(undefined).mainEntity, []);
  });
});
