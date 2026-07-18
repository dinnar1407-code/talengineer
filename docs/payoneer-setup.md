# Payoneer 跨境收款开通清单（B7 · 平台侧已就绪，等商务开通）

平台侧现状：放款已走 provider 抽象（`src/services/payout/`），工程师 `talents.payout_provider`
可设 `stripe`（默认）/ `manual`（线下打款，admin 标记+凭证）/ `payoneer`（本清单开通后启用）。

## Terry 需要做的

1. **申请 Payoneer 企业账户**：https://www.payoneer.com/business/ → 选 Mass Payouts（批量付款）方案，
   提交公司资料（TalEngineer 运营主体）。审批通常 1-3 周。
2. **申请 Payoneer Payouts API 权限**：开通后向客户经理申请 API（Mass Payouts API），
   拿到 `program_id` + API 凭据。
3. **凭据入 Railway env**：`PAYONEER_PROGRAM_ID` / `PAYONEER_API_KEY`（命名可与实现对齐后调整）。
4. **回来告诉我**：我把 `src/services/payout/index.js` 的 payoneer 分支从抛错替换为真实
   Payouts API 调用（收款人邀请注册 → payout 提交 → 状态回查），并补测试。

## 过渡方案（现在就能用）

拉美/东南亚工程师暂设 `payout_provider='manual'`：放款审批通过后系统登记 `manual_payouts`
（pending），你经任意渠道（Wise/银行电汇）线下打款后在 admin 标记 paid 并留凭证。
