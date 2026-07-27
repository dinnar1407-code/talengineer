// ── 结构化数据（schema.org / JSON-LD）共用构造器 ─────────────────────────────
// 为什么抽出来：站内此前每个页面各写一份 JSON-LD，Organization 块也各写各的。对搜索引擎
// 影响不大，但对 AI 解析影响很大——同一个组织被写成 N 个没有关联的节点，模型无法把
// "Talengineer" 归并成一个实体，也就难以把各页事实挂到同一个主体上。
//
// 解法：每个页面输出一个 @graph，里面同时含【本页节点】+【Organization】+【WebSite】，
// 且三者的 @id 全站固定。同一个 @id 在不同页面重复出现，消费方（Google / LLM 抓取器）
// 会把它们合并成一个实体，各页的事实自然挂到同一主体上。
//
// 语言约定：JSON-LD 固定英文（与站内既有 9 语页面的做法一致——见 pages/index.jsx 注释）。
// 结构化数据是给机器读的单一事实源，跟着 UI 语言变会让同一个 @id 出现互相矛盾的描述。
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://talengineer.us';

// 全站固定的实体 ID。改这两个值等于换了一个组织身份，别动。
const ORG_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;

// 组织节点：与 pages/index.jsx 的 orgJsonLd 同源（logo / description 保持一致）
const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Talengineer',
  url: SITE,
  logo: `${SITE}/img/logo-macaw.svg`,
  description:
    'Global marketplace for certified industrial-automation engineers — PLC, robotics, '
    + 'machine vision, and electrical — with milestone escrow and cross-border project delivery.',
};

const WEBSITE = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'Talengineer',
  url: SITE,
  publisher: { '@id': ORG_ID },
};

/**
 * 去掉标题里的品牌后缀。
 * 几个页面的 metaTitle 是给 <title> 用的、自带 " | Talengineer"，直接塞进 schema 的 name
 * 会变成 "Trust Center — … | Talengineer"，读起来像标题不像实体名。
 */
function stripBrand(text) {
  return String(text || '').replace(/\s*[|｜]\s*Talengineer\s*$/i, '').trim();
}

/**
 * 构造一页的 JSON-LD（@graph 形式）。
 * @param {object} p
 * @param {string} p.path        站内路径，以 / 开头，如 '/trust'
 * @param {string} p.name        实体名（会自动剥掉 " | Talengineer" 后缀）
 * @param {string} p.description 一句话描述
 * @param {string} [p.type]      本页节点的 schema 类型，默认 WebPage
 * @param {object} [p.extra]     并入本页节点的额外字段（如 CollectionPage 的 hasPart）
 * @returns {object} 可直接 JSON.stringify 进 <script type="application/ld+json">
 */
function pageJsonLd({ path, name, description, type = 'WebPage', extra = {} }) {
  const url = `${SITE}${path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': type,
        '@id': `${url}#page`,
        url,
        name: stripBrand(name),
        description: String(description || '').trim(),
        inLanguage: 'en',
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': ORG_ID },
        ...extra,
      },
      ORGANIZATION,
      WEBSITE,
    ],
  };
}

/**
 * FAQ 结构化数据（可并入 pageJsonLd 的 extra，或单独输出）。
 * AI 检索最吃这一类：问题与答案成对、自包含、不依赖上下文。
 * @param {Array<{q:string,a:string}>} faqs
 */
function faqEntity(faqs) {
  return {
    '@type': 'FAQPage',
    mainEntity: (faqs || []).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

module.exports = { pageJsonLd, faqEntity, stripBrand, ORGANIZATION, WEBSITE, ORG_ID, WEBSITE_ID, SITE };
