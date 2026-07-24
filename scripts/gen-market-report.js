#!/usr/bin/env node
// ── 月度市场报告生成器（Wave2 F6 / W2-2）─────────────────────────────────────
//
// 做什么：拉取生产环境的实时聚合数据，生成双语月报草稿落进 content/playbook/。
// 为什么拉生产而不是本地：本地无 .env、无真实数据（项目纪律：真 API 只打生产）；
// 月报的全部数字必须是平台真实聚合值——诚实空态红线：数字小就小，绝不编造。
//
// 数据源：
//   1) GET https://talengineer.us/api/talent/rate-benchmarks —— 现在就活，必需。
//      失败则整个脚本退出（宁可不出报告，也不出没有数据的报告）。
//   2) GET https://talengineer.us/api/coverage/summary —— 覆盖端点（F1 新建，
//      部署前是 404）。404/失败则跳过该节并在 stdout 标注，不阻断。
//
// 产物：content/playbook/market-report-{YYYY-MM}-{en,zh}.md
//   - frontmatter 带 draft: true（发布门控红线）：lib/playbook.js 默认过滤草稿，
//     所以落盘不等于发布；Terry 终审后把 draft 翻成 false + 重新部署才对外可见。
//   - 顶部显著标注「AI 起草待终审」。
//
// 用法：node scripts/gen-market-report.js [YYYY-MM]
//   不传月份则用当前月。月度流程见 docs/runbooks/monthly-report.md。

const fs = require('fs');
const path = require('path');

const PROD = 'https://talengineer.us';
const OUT_DIR = path.join(__dirname, '..', 'content', 'playbook');

// ── 月份参数：YYYY-MM，默认当前月 ──────────────────────────────────────────
function resolveMonth() {
  const arg = process.argv[2];
  if (arg) {
    if (!/^\d{4}-\d{2}$/.test(arg)) {
      console.error(`[gen-market-report] invalid month "${arg}", expected YYYY-MM`);
      process.exit(1);
    }
    return arg;
  }
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ── 取数：rate-benchmarks 必需，coverage 可选 ──────────────────────────────
async function fetchJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} for ${url}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// 数字格式化：整数原样，非数字/缺失显示 '—'（诚实空态，不用 0 冒充）。
function n(v) {
  return Number.isFinite(v) ? String(Math.round(v)) : '—';
}

// ── 报告正文（en/zh 各一份，同一份数据渲染）───────────────────────────────
// 内容纪律：正文只包含两个数据源返回的真实数字 + 方法论说明 + founding 叙事。
// 不引入任何外部统计。
function buildMarkdown({ lang, month, today, benchmarks, skills, coverage }) {
  const en = lang === 'en';
  const slug = `market-report-${month}-${lang}`;

  const title = en
    ? `Automation Talent Market Report — ${month}`
    : `自动化人才市场月报 — ${month}`;
  const description = en
    ? `Live rate benchmarks and platform coverage for industrial automation engineers, snapshotted ${today} from real Talengineer data.`
    : `工业自动化工程师实时费率基准与平台覆盖快照（${today} 取自 Talengineer 真实数据）。`;

  const lines = [];
  lines.push('---');
  lines.push(`title: ${title}`);
  lines.push(`description: ${description}`);
  lines.push(`date: ${today}`);
  lines.push(`lang: ${lang}`);
  lines.push('type: market-data');
  lines.push('track: general');
  lines.push('audience: employer');
  lines.push(`slug: ${slug}`);
  // 发布门控：draft: true。Terry 终审后翻成 false 才会被 /playbook 索引与 sitemap 收录。
  lines.push('draft: true');
  lines.push('---');
  lines.push('');
  lines.push(
    en
      ? '> **Draft — AI-drafted, pending final review. Not published until approved.**'
      : '> **草稿 — AI 起草，待终审。终审通过前不发布。**'
  );
  lines.push('');
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(
    en
      ? `This is a monthly snapshot of live data on Talengineer, taken on ${today}. Every number below is a real aggregate from active engineer profiles on the platform — nothing is modeled, extrapolated or borrowed from third-party reports. We are a founding-stage marketplace: the sample is small and we publish it anyway, because a small real number beats a large invented one.`
      : `这是 Talengineer 平台实时数据的月度快照，取数时间 ${today}。下面每一个数字都是平台上活跃工程师档案的真实聚合值——没有建模、没有外推、没有借用任何第三方报告。我们是 founding 阶段的市场：样本很小，但我们照样发布，因为一个真实的小数字胜过一个编造的大数字。`
  );
  lines.push('');

  // ── 费率基准表 ──
  lines.push(en ? '## Rate benchmarks by region' : '## 分地区费率基准');
  lines.push('');
  lines.push(
    en
      ? 'Hourly rates in USD, self-reported by engineers on the platform and aggregated per region:'
      : '美元时薪，来自平台工程师自报费率，按地区聚合：'
  );
  lines.push('');
  if (en) {
    lines.push('| Region | Engineers | Median ($/hr) | Range ($/hr) | Average ($/hr) |');
  } else {
    lines.push('| 地区 | 工程师数 | 中位数（$/hr） | 区间（$/hr） | 平均（$/hr） |');
  }
  lines.push('| --- | --- | --- | --- | --- |');
  for (const b of benchmarks) {
    const range =
      Number.isFinite(b.min) && Number.isFinite(b.max)
        ? b.min === b.max
          ? `$${n(b.min)}`
          : `$${n(b.min)}–$${n(b.max)}`
        : '—';
    lines.push(`| ${b.region} | ${n(b.count)} | $${n(b.median)} | ${range} | $${n(b.avg)} |`);
  }
  lines.push('');

  // ── 技能榜 ──
  if (Array.isArray(skills) && skills.length > 0) {
    lines.push(en ? '## Skills currently on the platform' : '## 平台上当前的技能面');
    lines.push('');
    lines.push(
      en
        ? 'Skills listed by engineers on the platform this month:'
        : '本月平台工程师所列技能：'
    );
    lines.push('');
    lines.push(skills.map((s) => `\`${s}\``).join(' · '));
    lines.push('');
  }

  // ── 覆盖概览（端点未部署时整节跳过）──
  if (coverage && Array.isArray(coverage.regions)) {
    lines.push(en ? '## Platform coverage' : '## 平台覆盖');
    lines.push('');
    if (en) {
      lines.push('| Region | Engineers | Certified |');
    } else {
      lines.push('| 地区 | 工程师数 | 已认证 |');
    }
    lines.push('| --- | --- | --- |');
    for (const r of coverage.regions) {
      lines.push(`| ${r.region} | ${n(r.engineers)} | ${n(r.certified)} |`);
    }
    lines.push('');
  }

  // ── 方法论 ──
  lines.push(en ? '## Methodology' : '## 方法论');
  lines.push('');
  lines.push(
    en
      ? [
          '- **Source.** All figures are aggregated live from the public Talengineer API (`/api/talent/rate-benchmarks`) at the snapshot time above. Rates are self-reported by engineers; profiles with a published rate are counted.',
          '- **Sample size.** We show the engineer count per region on purpose. Where the count is 1, the median, min, max and average are the same number — that is what a founding cohort looks like, and we would rather show it than hide it.',
          '- **No third-party data.** This report contains no external market statistics. When we cannot source a number from our own platform, we leave it out.',
          '- **What this is for.** Use these bands as a live reference point when budgeting a project, alongside the [cost calculator](/calculator) and the regional guides.',
        ].join('\n')
      : [
          '- **数据来源。** 全部数字在上述快照时间从 Talengineer 公开 API（`/api/talent/rate-benchmarks`）实时聚合。费率为工程师自报，统计所有已填写费率的档案。',
          '- **样本量。** 我们刻意展示每个地区的工程师数。当数量为 1 时，中位数、最小值、最大值和平均值是同一个数——founding 阶段的样子就是这样，我们宁可展示也不掩饰。',
          '- **不含第三方数据。** 本报告不包含任何外部市场统计。凡是无法从我们自己平台取到的数字，一律不写。',
          '- **用途。** 做项目预算时，把这些区间当作实时参考点，配合[成本计算器](/calculator)与分国别建厂指南使用。',
        ].join('\n')
  );
  lines.push('');
  lines.push(
    en
      ? 'Want next month’s snapshot? Rates update in real time at [/rates](/rates), and you can browse engineers at [/talent](/talent).'
      : '想看下月快照？实时费率见 [/rates](/rates)，工程师目录见 [/talent](/talent)。'
  );
  lines.push('');

  return { slug, markdown: lines.join('\n') };
}

// ── 主流程 ─────────────────────────────────────────────────────────────────
async function main() {
  const month = resolveMonth();
  const today = new Date().toISOString().slice(0, 10);

  // 1) 费率基准：必需。失败即退出，绝不写空数据报告。
  let bench;
  try {
    bench = await fetchJson(`${PROD}/api/talent/rate-benchmarks`);
  } catch (err) {
    console.error('[gen-market-report] rate-benchmarks fetch failed — aborting, no report written.', err.message);
    process.exit(1);
  }
  const benchmarks = Array.isArray(bench && bench.data) ? bench.data : [];
  const skills = Array.isArray(bench && bench.skills) ? bench.skills : [];
  if (benchmarks.length === 0) {
    console.error('[gen-market-report] rate-benchmarks returned no regions — aborting.');
    process.exit(1);
  }

  // 2) 覆盖概览：可选。端点未部署（404）或任何失败都只是跳过该节。
  let coverage = null;
  try {
    const cov = await fetchJson(`${PROD}/api/coverage/summary`);
    coverage = cov && cov.data ? cov.data : cov;
    console.log('[gen-market-report] coverage summary fetched — coverage section included.');
  } catch (err) {
    console.log(
      `[gen-market-report] coverage summary unavailable (${err.status || err.message}) — coverage section skipped. ` +
        'This is expected until /api/coverage/summary is deployed.'
    );
  }

  // 3) 双语渲染 + 落盘（draft: true，落盘≠发布）。
  for (const lang of ['en', 'zh']) {
    const { slug, markdown } = buildMarkdown({ lang, month, today, benchmarks, skills, coverage });
    const outPath = path.join(OUT_DIR, `${slug}.md`);
    fs.writeFileSync(outPath, markdown, 'utf8');
    console.log(`[gen-market-report] wrote ${outPath}`);
  }
  console.log(
    '[gen-market-report] done. Reports are draft: true — they stay invisible to /playbook and the sitemap ' +
      'until Terry reviews and flips draft to false. See docs/runbooks/monthly-report.md.'
  );
}

main().catch((err) => {
  console.error('[gen-market-report] unexpected failure', err);
  process.exit(1);
});
