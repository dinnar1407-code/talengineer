# 月度市场报告 Runbook（W2-2）

每月出一期《自动化人才市场月报》的固定流程。全程人审发布——脚本只负责起草，
没有任何自动发布路径。

## 流程总览

```
跑脚本（AI 起草，draft: true）→ Terry 终审 → draft 翻 false → commit → 部署即发布
```

## 步骤

### 1. 跑生成脚本

```bash
node scripts/gen-market-report.js          # 默认当前月
node scripts/gen-market-report.js 2026-08  # 或显式指定 YYYY-MM
```

- 数据源是**生产环境**的实时聚合 API（本地无 .env，真数据只在生产）：
  - `/api/talent/rate-benchmarks`（必需；失败脚本直接退出，不写报告）
  - `/api/coverage/summary`（可选；端点未部署时返回 404，该节自动跳过并在
    stdout 标注——F1 覆盖端点上线后无需改脚本，下月自动带上覆盖表）
- 产物：`content/playbook/market-report-{YYYY-MM}-en.md` 与 `-zh.md`，
  frontmatter 自带 `draft: true`。

### 2. 落盘 ≠ 发布（发布门控）

`lib/playbook.js` 的 `getAllPlaybookMeta()` / `getAllPlaybookSlugs()` 默认过滤
`draft: true` 的文章，所以草稿：

- 不出现在 /playbook 索引页；
- 不出现在 sitemap.xml（sitemap 走同一个 `getAllPlaybookMeta()`）；
- 不生成文章页路由（getStaticPaths 走 `getAllPlaybookSlugs()`）。

草稿可以放心 commit 入库存档，对外完全不可见。

### 3. Terry 终审

逐条核对：

- 数字与生产 API 当时返回一致（快照日期在 frontmatter `date` 与正文首段）；
- 无第三方统计混入（月报纪律：只用平台自有聚合数据）；
- 双语文案口径一致。

### 4. 放行：draft 翻 false

终审通过后，把两个文件 frontmatter 里的 `draft: true` 改为 `draft: false`
（或整行删掉——缺失即视为已发布），并删掉正文顶部的「草稿待终审」引用块。

### 5. commit + 部署即发布

文章页是构建期静态生成（fallback: false），**必须重新部署**才会上线：

```bash
git add content/playbook/market-report-*.md
git commit -m "publish: 2026-XX market report"
# push 需 Terry 授权（Railway 自动部署 main）
```

部署完成后验证：/playbook 索引出现该期月报、文章页可访问、sitemap.xml 含其 URL。

## 注意事项

- **不发邮件**：newsletter 订阅只落库，站内没有发送引擎。月报是站内内容 +
  lead capture，任何"报告已发送到邮箱"的表述都是谎言，禁止出现。
- **诚实空态**：样本小（如某地区只有 1 位工程师）照样发布并展示 count，
  这是 founding 叙事的一部分；绝不编数或隐藏样本量。
- **日期排序**：frontmatter `date` 必须保持零填充的 `YYYY-MM-DD`——
  playbook 列表按日期字符串字典序倒排，格式乱了排序就错。
- frontmatter 是手写单行解析器：值不能换行，不支持数组/嵌套 YAML。
