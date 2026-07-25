# 九语正文全站铺开 — 术语表 + 架构 + 分批 方案（2026-07-24 已拍板）

> **Terry 决策（2026-07-24 深夜）**：①架构选 B（抽共享层）②Tier 1+2 全铺 ③playbook 文章全译 ④法务页跟译（draft 门保留，终审时法务内容与译文一并审）。
>
> **执行细则（架构 B 落地形态）**：
> - 页面 UI 字典抽到 **`lib/i18n/<页面>.js`**（不能放 pages/ 内——Next 会把 .js 当路由）；页面 `import { DICT } from '../lib/i18n/<页面>'`，取值仍用 `DICT[lang] || DICT.en` 惯用式，不引第三方 i18n 库。
> - **hire 矩阵/职业页/国别指南正文本就在 lib 数据模块**（hireMatrix/occupations/regionGuides）——原地补 7 语，不抽取。navConfig/Navbar 账号字串/ChatBot/ConsoleShell 已九语，不动。
> - **完整性测试是架构 B 的核心收益**：新增 tests/i18nParity.test.js——lib/i18n 全模块 + lib 数据模块深度键校验（每语键集与 en 完全一致、值非空），漏译/多键直接红灯。
> - **playbook 全译配套机制**：文章 frontmatter 加 `group`（翻译组键）；索引页按当前 UI 语言过滤显示（缺译回退 en）替代现在的语言分区；文章页加同组语言切换带。月报生成脚本本轮仍出 en/zh（每月 9 语草稿会把终审队列撑爆），扩语言另议。
> - 白皮书 md 正文暂不译（待终审的草稿，改动会作废译文）；页面外壳字典照抽照译。
> - 翻译灌注主力 = Sonnet 5（每页/每文一 agent，强制引用 glossary+诚实红线：数字/链接/来源注释原样带过）；复审关卡 = 高档位模型按语言横切（es/vi/hi/ja/ko/fr/de 各一个 QA agent 跨全站盯术语一致性与语气）。

## 关键发现（改变规模判断）

站点**已有 10 页是完整九语**（inline 九语字典，2026-07-17 首页重写批）：index、console、finance、onboarding、messages/index、warroom、enterprise、rates、talent、training。
真正缺口 = **约 25 个 en/zh 页**（Wave 0-2 + 今日 IA 批）：pricing、trust、how-it-works、hire/*（index+track+industry）、occupations/*、talscore、certification、about、contact、resources、calculator、coverage、case-studies、developers、referral、guides/index、playbook/index、whitepaper、pools、privacy、terms、dispute/[id]。
特殊：guides/[region] 已是四语（en/zh/es/vi），只需补 5 语。playbook 文章正文是**每语一个 .md 文件**（不是内联字典），单独决策。

结论：**九语内联字典是本仓库已跑通的模式**，铺开=照抄 index.jsx 先例，非从零。

---

## 一、术语表（glossary）— 先锁，防露馅

核心洞察：**很多技术词在所有语言里都保持英文原样**——工业自动化工程师全球都直接说 PLC/SCADA，把它译成印地语短语反而是错的。术语表主职是「标记保留英文的词」+「锁定要译的词」。

### A. 全语言保留英文（proper noun / 行业通用英文，永不译）
`PLC` · `SCADA` · `HMI` · `DCS` · `TalScore` · `WarRoom`（产品名）· `KYC` · `COI` · `W-9` · `Stripe` · `Allen-Bradley` / `Siemens` / `FANUC` 等品牌 · 各软件名（TIA Portal / Studio 5000 / Ignition…）

### B. 要译且必须锁定统一译法（每语一个标准词，建 glossary 表）
| 概念 | 说明（en） | 备注 |
|---|---|---|
| escrow | 里程碑托管资金 | 各语金融术语，非直译 |
| milestone | 阶段付款节点 | |
| certification / certified | 平台认证 / 持证 | |
| screening / practical screen | 实操筛选 | 非"面试" |
| verified score | 已验证分数 | 档案上展示的分 |
| machine vision | 机器视觉 | |
| robotics / controls / electrical | 三方向名 | 与 /hire 方向页同口径 |
| platform fee | 平台费 | |
| founding client | 创始客户 | 前 5 单 5% |
| take-home | 到手金额 | 工程师侧 |
| dispute / evidence window | 纠纷 / 举证窗口 | |

产物：`lib/i18n/glossary.js` 或一份 md，9 语 × 上述词 = 一次性锁定，所有翻译 agent 强制引用。**这是防"同词多译""机翻腔"的唯一有效手段**。

---

## 二、架构决策（要你选）

### 选项 A：内联九语字典（匹配现有 10 页模式）—— 推荐
- 每页 `const DICT = { en:{...}, zh:{...}, es:{...}, ... }`，照 index.jsx / talent.jsx 现成写法。
- ✅ 零重构风险（不碰已跑通的 10 页）；✅ 全站单一模式无认知负担；✅ 完全可并行；✅ 符合仓库现状与你"简单优先"的偏好。
- ❌ 页面文件膨胀 3-4 倍；❌ 改一句文案要动 9 个子对象；加第 10 语要翻遍全站。

### 选项 B：抽共享 i18n 层（per-locale 或 co-located locale 模块）
- 把正文抽到 `pages/foo.i18n.js` 或 `locales/{lang}/foo.json`。
- ✅ 页面文件干净、翻译单文件、加语言集中；❌ **要动那 10 个已跑通的九语页**（首页+整个登录后台）→ 回归风险砸在最核心资产上；❌ 结构性改动、迁移成本高；❌ 仓库此前刻意不上 i18n 库。

**我的建议：选 A。** 理由：维护痛点是真的，但①现役 10 页已是内联，重构要拿首页和后台冒险换 DX；②"翻译者"是 AI agent 读 glossary，不是人肉翻译团队，B 的单文件收益打折；③PMF 优先期不值得为内部 DX 动核心页。若你更看重长期整洁，可折中：**只对本次转换的 25 页 co-locate 到 `*.i18n.js`，10 个现役页不动**——但会短期两套模式并存。

---

## 三、分批范围（按业务价值，Tier 1 先上）

### Tier 1 — 外联转化门面（先做，直接服务 PMF 门面）
pricing、trust、how-it-works、hire/index、hire/[track]、hire/[track]/[industry]、occupations/[role]、occupations/index、talscore、certification —— 潜客评估时必经之路。

### Tier 2 — 支撑内容与工具
about、contact、resources、calculator、coverage、case-studies、developers、referral、guides/index、guides/[region]（补 5 语）、playbook/index、whitepaper。

### Tier 3 — 边缘 / 建议缓
- **privacy / terms**：法务草稿，Terry 还没终审——**翻译未定稿的法律文本 9 语是浪费**，建议等 draft 翻 false 再译（甚至法律页长期只留 en/zh 也可接受）。
- **pools**：登录态雇主功能，非公开门面，优先级低。
- **dispute/[id]**：交易内页，登录态。

### playbook 文章正文（单独决策）
14 篇 × 7 语 = 98 个新 .md 文件。长文 SEO 内容，en/zh 已覆盖主力市场，外壳（导航/页脚/相关带）已九语。
**建议：本轮不译文章正文**（或只译 2-3 篇旗舰）。范围控制点，避免体量爆炸。

---

## 四、执行形态（选定后）

1. **术语表先行**（1 agent）：出 glossary 9 语，你或母语抽查关键语种。
2. **并行翻译**（Sonnet 5 主力，每页 1 agent，吃 glossary + 诚实红线：数字原样带过不改写）。
3. **质量复审关卡**（更高档位模型，专盯 hi/vi/ko 术语与语气）——降风险，不替代母语校验。
4. 全绿（测试+build）→ 分批提交 → 部署。

**强烈建议**：西班牙语、越南语（对应墨西哥线、越南建厂线两个业务重点市场）对外主推前留一次母语者抽查——这层算力买不到。

---

## 需要你拍板的 4 件事
1. 架构：**选 A（内联，推荐）** 还是 B（抽共享层）？
2. 范围：Tier 1+2 全铺？还是先只 Tier 1（门面）验证质量再续？
3. playbook 文章正文：不译 / 译 2-3 篇旗舰 / 全译？
4. 法务页 privacy/terms：跟译 还是 等 Terry 法务终审后再说（推荐后者）？
