# Playbook 内容 Taxonomy 与生产节奏（竞对改善 W1-2，2026-07-18；分类激活状态 2026-07-24 更新）

## Taxonomy（frontmatter 字段，`lib/playbook.js` 解析，未标注有回退默认）

| 字段 | 取值 | 说明 |
|---|---|---|
| `type` | `guide` 指南 / `market-data` 市场数据 / `certification` 认证解读 / `case` 案例 | 列表页 chip 筛选 + 卡片徽章 |
| `track` | `plc` / `robotics` / `vision` / `electrical` / `general` | 技术方向（与认证四方向同口径） |
| `audience` | `employer` / `engineer` / `both` | 受众 |
| `group` | 翻译组键（默认 = 自身 slug） | 同一文章的各语言版本共享同一 group（i18n 全站铺开 2026-07-24，见下） |

默认回退：`guide` / `general` / `both` / `group=slug`（旧文未标注时兜底，现存 18 篇已全部标注）。

## 翻译组机制（`group` 字段 + slug 约定，2026-07-24）

**机制**：同一篇文章的不同语言版本（各自独立的 .md 文件、各自独立的 slug）通过共享同一个
`group` 值关联成"翻译组"。`lib/playbook.js` 把 `group` 带进 meta（缺省回退自身 slug——
独立文章天然各成一组）；`lib/playbookGroups.js` 的 `selectGroupVariants` 是索引页的挑选逻辑。

- **索引页 `/playbook`**：不再按语言分区——每组只出一张卡：当前 UI 语言的变体优先，
  缺译回退 en，连 en 都没有就取组内现存的那篇。组内有其他语言时卡片带「也提供: EN/中文/…」徽章。
  SSR 首帧恒为 en 行为（useLang 首帧 'en'，完整 en 集合）。
- **文章页 `/playbook/<slug>`**：同组存在其他已发布语言版本时，文首出「Read in: English / 中文 / …」
  切换带，链到兄弟 slug。草稿（draft: true）不会出现在切换带里（沿用发布门控）。

**未来译文的 slug 约定**：非 en 变体 slug = **`<group>-<lang>`**（如 `how-talscore-is-computed-zh`），
除非该语言有更自然的 slug（自然 slug 优先，SEO 友好）；**en 变体保留裸 group 作为 slug**（不加 `-en` 后缀）。
历史例外：月报对 `market-report-2026-07-en` / `-zh` 的 en 侧带 `-en` 后缀（生成脚本沿用既有命名），
它们共享 `group: market-report-2026-07`；新文一律按上述约定走。

**现状（2026-07-24）**：18 篇里唯一的多语言组是草稿月报对（group `market-report-2026-07`）；
其余 16 篇各成一组（group = 自身 slug）——en/zh 各文今天是独立文章而非互译对照，不合并组。

## 各维度激活状态（2026-07-24）

| 维度 | 状态 | 说明 |
|---|---|---|
| `type` 筛选 | ✅ 已激活（W1-2） | 列表页第一排 chips；`case` 取值本身休眠（见下） |
| `audience` 筛选 | ✅ **已激活（2026-07-24）** | 列表页第二排 chips（employer / engineer；`both` 文章两边都命中）。与 4 篇工程师受众文章同批上线——互为激活理由：没有工程师文章时受众筛选是空态，没有筛选时工程师文章沉底 |
| `track` 筛选 | 💤 保持休眠 | **激活阈值：全库 ≥20 篇 且 每个非 general 方向 ≥2 篇**。现状（18 篇）：plc=4、robotics=1、vision=0、electrical=0、general=13——robotics/vision/electrical 开了就是空态或单篇态，不达阈值不上 |
| `case` 类型 | 💤 保持休眠 | **激活条件：首个真实完单产出案例后**（模板见 docs/pmf/case-template.md）。诚实红线：没有真实完单就没有案例，绝不编造 |

## 生产节奏（Field Nation 月更 460 篇不追量，追垂直精准+节奏可见）

- **每周 1 篇**：AI 起草 → Terry 终审定调 → 提交发布（随下一次部署上线）
- 选题优先级：① 服务 PMF 外联的行业/地域组合（与 /hire 垂直矩阵联动）② 独家数据（/rates 行情→market-data 类）③ 认证解读（漏斗页联动）④ 成单后案例（case 类，达激活条件后）
- 语言：中英对照优先（一个主题两个文件、slug 各自独立），单语亦可
- 每篇必带：canonical（框架自动）、内链（≥2 条指向 /pricing /certification /rates /hire/* 相关页）、frontmatter 三字段齐全
- 数字红线：平台数字每页只写一次，旁注单一来源（fees.js / training.js / talScore.js / hireMatrix REGIONS）；市场/需求陈述只做结构性表述；外部主张必须带来源 URL，否则删

## 工程师受众文章（2026-07-24 首批 4 篇已上线）

全机制类（数字全部单一来源、直接上线，en 先行）：

- [x] `how-engineer-payouts-work` — 托管流/85% 到手/Stripe Connect+线下打款/纠纷冻结+5 天举证/账本（← src/config/fees.js、src/routes/disputes.js）
- [x] `how-certification-exams-work` — 10 题=5 选择/3 场景/2 分析、40 分钟、70 分及格、AI 评分+人工复核、L1→L3 递进、7 天冷却、20 套题库（← src/config/training.js）
- [x] `how-talscore-is-computed` — 权重 25/25/30/20、贝叶斯先验 3.5★×5、可靠性规则+纠纷率 >10% 红线、档位 85/70/55（← src/services/talScore.js）
- [x] `getting-matched-on-talengineer` — 认证硬门槛、TalScore 排序、档案完整度、入网 AI 筛选、里程碑范围化（只讲公开机制，不暴露 matching.js 内部、不承诺匹配率）

### 工程师文章后续队列（按需排产，机制类可直接上线；市场判断类走 draft 待终审）

- [ ] 各国工程师收款实务（Stripe Express 覆盖国清单变化快，写前先核官方来源，无来源不写）→ zh 对照版优先（工程师侧中文读者多）
- [ ] 4 篇首批文章的 zh 对照版（slug 各自独立）
- [ ] 认证备考向：某方向 L1→L2 实际考什么（考纲结构性描述，不泄题库）
- [ ] 完单后：首单工程师视角案例（与 case 类型激活同时机）

## 待发布队列（雇主/双受众线，延续既有）

- [x] 费率透明双语对（why-our-platform-fee-is-public / platform-fee-transparency，2026-07-18 AI 起草，**待 Terry 终审**）
- [ ] 下一篇建议：墨西哥线选题与 /guides/mexico 联动（外联主打市场）
- [ ] vision / electrical 方向零文章——为 track 维度达阈值，优先补 vision（已有 /hire/vision 及行业矩阵页可内链）
