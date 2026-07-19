# Playbook 内容 Taxonomy 与生产节奏（竞对改善 W1-2，2026-07-18）

## Taxonomy（frontmatter 三字段，`lib/playbook.js` 解析，未标注有回退默认）

| 字段 | 取值 | 说明 |
|---|---|---|
| `type` | `guide` 指南 / `market-data` 市场数据 / `certification` 认证解读 / `case` 案例 | 列表页 chip 筛选 + 卡片徽章 |
| `track` | `plc` / `robotics` / `vision` / `electrical` / `general` | 技术方向（与认证四方向同口径） |
| `audience` | `employer` / `engineer` / `both` | 受众 |

默认回退：`guide` / `general` / `both`（旧文未标注时兜底，现存 10 篇已全部标注）。

## 生产节奏（Field Nation 月更 460 篇不追量，追垂直精准+节奏可见）

- **每周 1 篇**：AI 起草 → Terry 终审定调 → 提交发布（随下一次部署上线）
- 选题优先级：① 服务 PMF 外联的行业/地域组合（与 /hire 垂直矩阵联动）② 独家数据（/rates 行情→market-data 类）③ 认证解读（漏斗页联动）④ 成单后案例（case 类，模板见 docs/pmf/case-template.md）
- 语言：中英对照优先（一个主题两个文件、slug 各自独立），单语亦可
- 每篇必带：canonical（框架自动）、内链（≥2 条指向 /pricing /certification /rates /hire/* 相关页）、frontmatter 三字段齐全

## 待发布队列

- [x] 费率透明双语对（why-our-platform-fee-is-public / platform-fee-transparency，2026-07-18 AI 起草，**待 Terry 终审**）
- [ ] 下一篇建议：墨西哥线选题与 /guides/mexico 联动（外联主打市场）
