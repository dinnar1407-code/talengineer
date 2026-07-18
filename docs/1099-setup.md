# 1099 / Stripe Express 税表开通清单

> 面向平台运营（admin）。目标：让通过 Stripe Connect 收款的美国工程师，在年度报税季能拿到平台代开的 **1099-NEC**（或 Stripe 代生成的等价税表），满足美国税务合规。
>
> 前置：本平台已具备 W-9 采集能力（`/api/tax/w9` + admin「Tax Docs」审核队列），工程师入网时会先交 W-9。1099 是"年底汇总付款额并出表"这一步。

---

## 一、背景：为什么要做这件事

- **W-9**：收款方（工程师）向付款方（平台）**提供**纳税人信息（姓名/TIN）。这一步平台已经在做。
- **1099-NEC**：付款方（平台）在年底向 IRS 和收款方**申报**"这一年付了多少钱"。单个收款方年付 ≥ **$600** 就必须出表。
- Stripe Connect 提供 **Stripe Express**（Connect 账户的自助面板）与 **1099 tax reporting**（Stripe 代为计算、生成、投递税表）两项能力，平台开通后可把绝大部分工作自动化。

## 二、开通步骤（Stripe Dashboard）

1. **确认 Connect 已启用**
   - Dashboard → **Connect** → Overview，确认平台已是 Connect 平台账户（本平台跨境放款已在用 `transfers.create`，此项通常已就绪）。

2. **开启 1099 税表功能**
   - Dashboard → **Connect** → **Tax reporting**（或 Tax forms）。
   - 选择表种 **1099-NEC**（服务性质的非雇员报酬，对应工程师劳务）。
   - 设置 **filing entity**（平台法律实体名称、EIN、地址）——这是出现在税表"付款方"栏的信息。

3. **配置阈值与税年**
   - 确认联邦阈值 **$600**（部分州阈值更低，Stripe 会按州自动处理）。
   - 选择 **tax year**（当前申报年度）。

4. **补齐收款方信息**
   - Stripe 会核对每个 Connect 账户的 **W-9 / tax details**（姓名、TIN、地址）。
   - 缺信息的账户会被标为 "needs attention"——需提醒对应工程师在 Stripe Express 里补全。

5. **审阅 & 投递**
   - 报税季（通常次年 1 月）Stripe 生成税表草稿 → 平台在 Tax reporting 页 **review** → **file & deliver**。
   - 可选 **e-delivery**（工程师在 Stripe Express 里电子签收）或邮寄。

## 三、平台侧对接要点

- **W-9 已采集**：admin「Tax Docs」面板负责人工核验 W-9（`received` / 退回）。1099 出表前应确保对应工程师的 W-9 状态为 `received`。
- **付款额来源**：1099 金额 = 平台通过 Stripe 向该 Connect 账户 `transfers.create` 的年度累计（扣除平台佣金后的净放款）。Stripe 的 tax reporting 会**自动**按 Connect 账户汇总，无需平台手工加总。
- **manual / payoneer 收款方不走 Stripe 1099**：payout provider 为 `manual`（线下打款）或 `payoneer` 的工程师，不在 Stripe 1099 覆盖内，需平台按各自渠道单独处理税务申报。

## 四、给工程师的提示（可放进 onboarding 文案）

- 收款前请在 **Stripe Express** 完成身份与税务信息（W-9）填写。
- 年付 ≥ $600 者，次年 1 月会收到 **1099-NEC**（电子或邮寄）。
- 信息不全会导致税表无法投递、后续放款受限，请及时在 Stripe Express 补全。

## 五、待办（运营 checklist）

- [ ] Dashboard → Connect → Tax reporting 启用 1099-NEC
- [ ] 填写 filing entity（实体名 / EIN / 地址）
- [ ] 核对当前税年与 $600 阈值
- [ ] 排查 "needs attention" 的 Connect 账户，提醒补全 W-9
- [ ] 报税季 review + file & deliver

---

**参考**：Stripe Docs → *Connect* → *Tax reporting for platforms*（1099-K / 1099-NEC / 1099-MISC）。开通细节以 Stripe Dashboard 当前 UI 为准。
