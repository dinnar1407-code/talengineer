# 保险代购探索 — 美国现场工业服务 GL 按单模式调研（W2-6 / F7）

> **⚠️ 调研文档，非承诺。** 本文仅为模式调研与路线建议，不构成任何产品承诺、法律意见或合规结论。所有事实性陈述均附来源 URL；无法核实的信息一律未写入。
>
> 日期：2026-07-24 · 归属：Wave2 Phase4 Level1 计划 F7（纯研究，无代码）

---

## 1. 背景：TalEngineer 现状

- `/trust` 页已有 COI/KYC 叙事：保险凭证（COI）与平台资质带签发/到期日上传，由 admin 人工核验通过或退回，"自述声明本身不作数"，且敏感文件不裸挂公开 URL（见 `pages/trust.jsx` 中 "Insurance & credentials / 保险与资质" 卡片，中英双语已上线）。
- 即：**平台目前是"COI 收取 + 人工验证"模式，尚无任何保险销售/代购/嵌入行为。** 本调研回答的问题是：如果工程师没有保险，平台能不能/该不该帮他"按单买"，以及怎么变现。

---

## 2. 市面可参照的模式盘点

### 2.1 按单/短期直购型保险商（工程师自购，平台只引导）

**Thimble（Simply Business 旗下品牌）**
- 提供按小时/按天/按周/按月的 on-demand General Liability，只在干活时段付费；线上 3 个问题即时报价，5 分钟内出单。（来源：https://www.thimble.com/lp/general-liability-performance-b ；第三方评测 https://bestguide.com/review/thimble/ 、https://tivly.com/thimble-insurance-review ）
- 标准限额 $1M per-occurrence / $2M aggregate；购买后即时在 app 拿到 COI；可免费添加 Additional Insured、无限量生成 COI。（来源：https://www.policybenchmark.com/reviews/thimble/ 、https://startupowl.com/reviews/thimble ）
- 低风险职业的 GL 时租可低至约 $5/小时。（来源：https://startupowl.com/reviews/thimble ）

**NEXT Insurance（ERGO 旗下）**
- 全线上投保，10 分钟内完成申请、购买并拿到 live COI；COI 可即时下载/邮件/短信发送，无限量、免费加 Additional Insured。（来源：https://www.nextinsurance.com/general-liability-insurance/contractors/ 、https://www.nextinsurance.com/blog/certificate-of-insurance-for-contractors/ ）
- 承包商 GL 月费中位数约 $51–$78/月，低至约 $62.50/月档位可见。（来源：https://www.nextinsurance.com/business/general-contractor-insurance/cost/ ）
- 定位是**月付持续保单**而非按单——适合有稳定单量的工程师，不适合"一年接两单"的长尾。

### 2.2 平台嵌入型（embedded broker / API）

**Coverdash**
- 数字商业保险经纪，主打"一行代码"嵌入：合作方在自己平台内提供 quote→rate→bind→checkout 全流程，24–48 小时可上线。（来源：https://www.coverdash.com/partner 、https://pulse2.com/coverdash-13-5-million-funding/ ）
- 明确以"给合作方创造 ancillary revenue（附加收入）+ 提升留存"为卖点；合作网络含 payroll、POS、银行、lender、垂直 SaaS。（来源：https://www.coverdash.com/blog/coverdash-leading-embedded-business-insurance-agency-for-startups-and-smbs-announces-13-5m-in-series-a-funding 、https://techcrunch.com/2023/01/23/bling-capital-coverdash-insurtech/ ）
- 2024-03 完成 $13.5M Series A（Nyca Partners 领投）。（来源：https://pulse2.com/coverdash-13-5-million-funding/ ）

**1099Policy（最贴近"按单代购"的形态）**
- 专为 workforce/labor 平台设计的保险 API：按 assignment（单）给独立承包商出 workers' comp、GL、professional liability、media、cyber 等险种，保单出在**承包商本人名下**，一个 API 完成 quote/bind/verify。（来源：https://www.1099policy.com/ 、https://www.1099policy.com/solutions/labor-platform ）
- 支持即时生效、单日 episodic 保单；保费按单支付，按工种/工资/时长定价；投保凭证在 opt-in 后毫秒级经 API/webhook 回传平台。（来源：https://www.1099policy.com/help/what-is-1099policy 、https://www.1099policy.com/faq 、https://docs.1099policy.com/operation/operation-post-api-v1-assignments ）
- 法定 workers' comp 覆盖 46 州 + DC。（来源：https://www.1099policy.com/faq ）

### 2.3 现场服务撮合平台自身的做法（直接对标）

**Field Nation（现场 IT/工业服务撮合，最直接的对标）**
- 平台上所有 work order 都要求 GL；技师可上传 ≥$1M GL 的 COI 自证。（来源：https://fieldnation.com/insurance-faq 、https://support.fieldnation.com/s/article/Insurance-Overview ）
- **没有自有保单的技师：按 work order 金额的 1.5% 付费，纳入 Field Nation 的平台保单**——未上传 COI 则该费用自动扣除。这就是"平台代保 + 按单抽费"的成熟范本。（来源：https://fieldnation.com/insurance-faq ）
- Occupational Accident Insurance（OAI，职业意外险，workers' comp 的独立承包商替代品）：买家要求时按单 0.5% 收取；已上传有效 Workers' Comp COI 的技师接受含 OAI 的 work order 时可获 0.5% 返还；另有按月 1% 的购买选项（Field Nation 声明不加利润）。（来源：https://fieldnation.com/insurance-faq 、https://support.fieldnation.com/s/article/Occupational-Accident-Insurance ）
- 上传 COI 须把 Field Nation 的地址列为 certificate holder。（来源：https://fieldnation.com/insurance-faq ）

**WorkMarket（ADP 旗下）**
- 公开检索未能找到 WorkMarket 当前保险要求/费率的一手页面，**故不写入具体数字**。仅确认行业通行做法与 Field Nation 同构（COI 上传 + 合规验证），细节留待后续用其官网/支持文档核实。

### 2.4 COI 验证行业惯例（与 /trust 现状对齐）

- COI 标准载体是 **ACORD 25** 表单，覆盖 GL、auto、umbrella、workers' comp 等；完整合规还要求 additional insured endorsement、primary & noncontributory 措辞、waiver of subrogation——**endorsement 缺口是纠纷最常见来源，且 additional insured 必须体现在保单批单里，仅写在 COI 面上不算数**。（来源：https://www.getbcs.com/blog/coi-tracking-checklist-what-to-verify-before-approving-a-vendor 、https://www.getbcs.com/blog/what-is-coi-tracking-how-it-works-and-why-vendor-compliance-depends-on-it ）
- 验证要点：保单起止日期、named insured、certificate holder、限额、endorsements、除外条款；最可靠的验证方式是直接联系 COI 上列明的保险方。（来源：https://www.expirationreminder.com/blog/coi-tracking-checklist-risk-managers 、https://www.business-money.com/announcements/understanding-certificate-of-insurance-verification-a-comprehensive-guide/ ）
- 运营惯例：到期前 60–90 天发起续保提醒；超过 30 天的旧证书视为可能过期（stale）；供应商超过约 25–50 家后，人工/表格追踪开始不可靠。（来源：https://www.expirationreminder.com/blog/coi-tracking-checklist-risk-managers 、https://www.getbcs.com/blog/what-is-coi-tracking-how-it-works-and-why-vendor-compliance-depends-on-it ）
- **对 TalEngineer 的含义**：/trust 现有"上传 + admin 人工核验 + 到期追踪"完全符合行业底线惯例；下一档增强是 endorsement 级校验（不只看 COI 面）与 60–90 天到期提醒自动化——这不需要任何保险牌照。

---

## 3. 牌照/合规红线（决定平台能做到哪一步）

- 未持州保险 producer 牌照者**不得 sell / solicit / negotiate 保险**——这是全美通则。（来源：NAIC Producer Licensing Model Act 相关综述 https://www.insurancejournal.com/magazines/mag-features/2024/02/19/761025.htm ）
- 绝大多数州允许持牌 producer 向**不参与销售/招揽/协商**的无牌照方支付 referral fee，但多数要求付费**不得以成交为条件**；NAIC PLMA §13(D) 允许向不 sell/solicit/negotiate 的人支付报酬，半数以上州已采纳类似条款；仍有少数州明确禁止与无牌照方分佣。（来源：https://www.insurancejournal.com/magazines/mag-features/2024/02/19/761025.htm 、https://accellawgroup.com/wp-content/uploads/ALG-Commission_Sharing_and_Referral_Fees.pdf 、https://content.naic.org/sites/default/files/model-law-chart-pr-70-producers-ability-to-charge-fees-and-collect-commissions.pdf 、华盛顿州官方口径 https://www.insurance.wa.gov/producers-adjusters/licensing-compliance-financial-examinations/compensation-and-disclosure/referral-compensation-and-fees 、纽约州 DFS 意见 https://www.dfs.ny.gov/insurance/ogco2007/rg070616.htm ）
- 嵌入式方案（Coverdash / 1099Policy）的本质：**持牌方是他们，平台只做流量入口/API 集成**，从而绕开自建牌照——这正是它们对平台方的核心价值主张。（来源：https://www.coverdash.com/partner 、https://www.1099policy.com/solutions/labor-platform ）

---

## 4. 可行模式对比表

| 模式 | 形态 | 启动门槛（现场单量/牌照/工程量） | 变现方式 | 风险/短板 |
|---|---|---|---|---|
| **A. 现状+：COI 验证强化** | 继续只收/验 COI，加 endorsement 校验 + 60–90 天到期提醒 | 无单量门槛；**零牌照**；小工程量（提醒已有 expiry 字段基础） | 不直接变现（信任资产，抬高撮合费正当性） | 不解决"工程师没保险"的供给侧摩擦 |
| **B. 导购/推荐链接** | trust/onboarding 页放 Thimble、NEXT 等直购入口，工程师自购按单/按月保单 | 无单量门槛；**多数州允许无牌照 referral，但费用不得以成交为条件，且少数州禁止**——需逐州确认或干脆不收钱纯导流 | 无偿导流（信任+转化）或合规前提下的 referral fee | 变现弱；逐州合规确认成本可能超过收益 |
| **C. 嵌入式经纪（Coverdash 类）** | 一行代码嵌入 quote→bind→checkout，持牌方是 Coverdash | 无硬性单量门槛（但没流量就没意义）；牌照由对方持有；集成号称 24–48h | 平台侧 ancillary revenue（对方明示的合作模式） | 卖的是**月付持续保单**为主，与"按单"场景错位；分成条款需商务谈判 |
| **D. 按单 API 代保（1099Policy 类）** | 每个 assignment 经 API 给工程师出单日/按单 GL/WC/PL 保单，凭证 webhook 回传 | **需要真实、持续的现场单流**（保费按单，无单=无意义）；牌照由对方持有；集成工程量中等（assignment 建模+webhook） | 保费构成中的平台加成/分成（具体条款需商谈，无公开费率，**不臆测**） | 前置条件是撮合闭环真实跑起来；当前 PMF 阶段（3–5 单人工撮合）远未到 |
| **E. Field Nation 式平台统保** | 平台自持 master policy，无 COI 的工程师按单抽 1.5%（GL）/0.5%（OAI）纳入平台保单 | **最高门槛**：需与承保方谈 master policy，本质上平台深度介入保险安排，需要保险专业与规模化单量支撑核保 | 按单费率差价/管理费（Field Nation 实证：GL 1.5%、OAI 0.5%，月付 OAI 1% 且声明不加利润） | 对 TalEngineer 当前体量完全不现实；列为终局参照 |

---

## 5. 推荐路线与触发条件

**分三阶段，每一阶段有明确触发条件，未触发不动：**

### 阶段 0（现在，PMF 期 · 人工撮合 3–5 单）→ 只做模式 A
- 保持 /trust 的"COI 上传 + admin 核验 + 到期追踪"；按行业惯例补两点低成本增强：到期前 60–90 天提醒、核验清单里明确检查 additional insured endorsement 而非仅 COI 面。（惯例来源见 §2.4）
- 客户侧若要求 additional insured，指导工程师用 Thimble/NEXT 的免费 additional insured + 即时 COI 能力自行解决（两家均公开支持，见 §2.1）——平台只给操作指引，不 sell/solicit/negotiate，零牌照风险。
- **不收任何保险相关费用。**

### 阶段 1（触发条件：现场单进入常态化，例如月度稳定有付费现场单，且 ≥1 个客户在合同里硬性要求 COI/additional insured）→ 模式 B（无偿导流版）
- 在 onboarding/trust 页加"没有保险？这些按单/按月方案可即时出 COI"的中性导流区块（Thimble 按单、NEXT 按月），**不收 referral fee**，避开逐州合规确认成本。
- 同期开始与 1099Policy / Coverdash 做无约束的商务摸底（了解分成与最低量要求），为阶段 2 备料。

### 阶段 2（触发条件：月现场单量达到"按单保费值得 API 化"的量级——建议内部阈值定为**月 ≥20 单现场工单且无保险工程师占比 ≥30%**，该阈值为内部经营判断，非外部标准）→ 模式 D
- 接 1099Policy 类按单 API：下单流程内 opt-in，保单出在工程师名下，凭证 webhook 回写平台 COI 记录（与现有 admin 核验流打通）。
- 变现条款以届时商务谈判为准；本文不臆测费率。
- 模式 E（平台统保）仅作为单量再上一个数量级后的终局参照，本阶段不评估。

### 明确不做
- 不自建保险牌照/自营经纪（周期与成本对现阶段无意义）。
- 不在合规确认前收取任何 referral fee（少数州禁止 + "不得以成交为条件"限制，见 §3）。
- 不写入/不引用任何未能核实的 WorkMarket 具体费率。

---

## 6. 来源清单（全量）

- Thimble：https://www.thimble.com/lp/general-liability-performance-b ｜ https://bestguide.com/review/thimble/ ｜ https://tivly.com/thimble-insurance-review ｜ https://www.policybenchmark.com/reviews/thimble/ ｜ https://startupowl.com/reviews/thimble
- NEXT：https://www.nextinsurance.com/general-liability-insurance/contractors/ ｜ https://www.nextinsurance.com/business/general-contractor-insurance/cost/ ｜ https://www.nextinsurance.com/blog/certificate-of-insurance-for-contractors/
- Coverdash：https://www.coverdash.com/partner ｜ https://pulse2.com/coverdash-13-5-million-funding/ ｜ https://techcrunch.com/2023/01/23/bling-capital-coverdash-insurtech/ ｜ https://www.coverdash.com/blog/coverdash-leading-embedded-business-insurance-agency-for-startups-and-smbs-announces-13-5m-in-series-a-funding
- 1099Policy：https://www.1099policy.com/ ｜ https://www.1099policy.com/solutions/labor-platform ｜ https://www.1099policy.com/help/what-is-1099policy ｜ https://www.1099policy.com/faq ｜ https://docs.1099policy.com/operation/operation-post-api-v1-assignments
- Field Nation：https://fieldnation.com/insurance-faq ｜ https://support.fieldnation.com/s/article/Insurance-Overview ｜ https://support.fieldnation.com/s/article/Occupational-Accident-Insurance
- COI 验证惯例：https://www.getbcs.com/blog/coi-tracking-checklist-what-to-verify-before-approving-a-vendor ｜ https://www.getbcs.com/blog/what-is-coi-tracking-how-it-works-and-why-vendor-compliance-depends-on-it ｜ https://www.expirationreminder.com/blog/coi-tracking-checklist-risk-managers ｜ https://www.business-money.com/announcements/understanding-certificate-of-insurance-verification-a-comprehensive-guide/
- 牌照/referral 合规：https://www.insurancejournal.com/magazines/mag-features/2024/02/19/761025.htm ｜ https://accellawgroup.com/wp-content/uploads/ALG-Commission_Sharing_and_Referral_Fees.pdf ｜ https://content.naic.org/sites/default/files/model-law-chart-pr-70-producers-ability-to-charge-fees-and-collect-commissions.pdf ｜ https://www.insurance.wa.gov/producers-adjusters/licensing-compliance-financial-examinations/compensation-and-disclosure/referral-compensation-and-fees ｜ https://www.dfs.ny.gov/insurance/ogco2007/rg070616.htm
