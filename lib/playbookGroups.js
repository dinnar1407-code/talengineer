// playbook 翻译组的「按 UI 语言挑展示变体」纯函数（i18n 全站铺开 2026-07-24）。
//
// 为什么单独成文件、不放 lib/playbook.js：
//   lib/playbook.js 依赖 fs / marked，只能在 getStaticProps（Node 构建期）里用；
//   而本函数要在列表页的客户端组件里跑（用户切语言时重新挑选），也要被测试直接引用，
//   所以抽成零依赖的纯模块。放 lib/ 而非 pages/ ——pages/ 里的 .js 会被 Next 当路由。
//
// 挑选规则（与索引页的产品语义一一对应）：
//   每个翻译组只出一张卡——优先当前 UI 语言的变体；缺译回退 en；连 en 都没有
//   就取组内现存的第一篇（比如目前只有 zh 的独立文章，对英文用户也照常可见）。
export function selectGroupVariants(metaList, lang) {
  // 按 group 归并，保持"组首次出现"的顺序——metaList 已是日期倒序，
  // 因此组的展示顺序 = 组内最新一篇的日期倒序，与旧列表页的排序习惯一致。
  const byGroup = new Map();
  metaList.forEach((m) => {
    const key = m.group || m.slug; // 防御：group 缺失时退回 slug（与 lib/playbook.js 同规则）
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key).push(m);
  });

  return Array.from(byGroup.values()).map((variants) => {
    // 三级回退：当前语言 → en → 组内第一篇。
    const chosen =
      variants.find((v) => v.lang === lang) ||
      variants.find((v) => v.lang === 'en') ||
      variants[0];
    // 组内其余语言：给卡片出「也提供: EN/中文/…」小徽章用。
    const otherLangs = variants.filter((v) => v !== chosen).map((v) => v.lang);
    return { ...chosen, otherLangs };
  });
}
