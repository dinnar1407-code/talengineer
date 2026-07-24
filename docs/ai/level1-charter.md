# Level 1 章程（脚手架版，2026-07-24）

> 来源方法论：Obsidian《AI-Native改造方案-方法论与计划-2026-07-18》Phase 4 / Level 1。
> 本文件是 Level 1 的**治理章程 + 现状登记**。本批（Wave 2 × Phase 4）只建脚手架：
> 提示词版本化（G4）、周度自优化人审闭环（Phase 4）、本章程。**不引入任何自主行为。**

## 一、四条硬护栏（照抄方法论，一条不减）

1. **跑满一季度再评估**：Level 0（人审一切）必须稳定运行满一个季度，才允许评估是否升 Level 1。
   评估是「允许开始讨论」，不是「自动升级」。
2. **只改 Level 0 配置**：即使将来进入 Level 1，AI 可自主调整的范围也仅限 Level 0 已版本化的
   配置（如提示词参数），绝不触碰代码、资金、证书、纠纷、数据结构。
3. **永远人审**：每一次配置变更提案都必须经人（Terry/admin）在看板上明确批准后才生效；
   没有「先执行后补审」。
4. **连续 3 轮无产出即停（熔断）**：如果连续 3 个周期的改进假设都未被采纳（全部 dismissed
   或无假设），自优化循环自动停摆，由人决定是否重启——防止低质量提案空转刷存在感。

## 二、当前状态

| 项 | 值 |
|---|---|
| 当前等级 | **Level 0**（人审一切） |
| Level 0 起算日 | **2026-07-19**（AI-Native 融合工程上线生产日） |
| 最早允许评估 Level 1 的日期 | **2026-10-19**（起算日 + 一个季度） |
| 周度自优化闭环 | 已建（GH Actions `ai-weekly.yml` → `POST /api/aiops/run-weekly` → `ai_improvement_reports` draft → admin 人审看板 reviewed/dismissed） |
| 自主执行路径 | **不存在**（见第四节声明） |

## 三、提示词版本化清单（G4）

版本号单一来源：`src/config/prompts.js` 的 `AGENT_PROMPT_VERSION`（当前 `2026-07-24.1`，
变更日志在该文件头）。周报落库时记录 `ai_improvement_reports.prompt_version`。

**已版本化（已搬入 prompts.js）**：
- `buildSystemPrompt` —— Agent 系统提示（G2 红线写死），2026-07-24 从 `agentService.js` 原样搬入。
- `buildWeeklyAnalysisPrompt` —— Phase 4 周度分析提示，2026-07-24 新增。

**待搬（`src/services/aiService.js` 的内联提示，后续批次逐步纳管）**：
- `parseDemand`（需求解析 SoW）
- `generateTechQuestion` / `gradeTechAnswer`（技术筛选）
- `generateExamQuestions` / `gradeExamAnswers`（认证考试）
- `generateLearningPath` / `generateLessonContent` / `generateModuleQuiz`（培训内容）
- `generateMatchEmail` / `translateTechnicalMessage` / `generateDailyReport` / `generateNudgeMessage`（项目协作）
- `analyzeQualityImage`（Nexus-QC 视觉质检）
- `parseGhostProfile` / `generateGhostOutreachEmail`（Ghost HR）

## 四、声明：本仓库不存在任何自主改配置代码路径

截至本文件写入日（2026-07-24）：

- `ai_improvement_reports` 的假设（hypotheses）**只会**被写成 `status='draft'`，唯一的状态出口是
  admin 在人审看板上的 `reviewed` / `dismissed`（`PUT /api/aiops/reports/:id`，requireAdmin + 审计行）。
- 代码库中**没有**任何读取 hypotheses 并回写配置/提示词/参数的函数、任务或端点。
- 工具注册表（`src/tools/registry.js`）本批零新增（10 个工具计数断言不动）；G1-G5 红线照旧。
- 若未来任何变更引入「AI 提案 → 自动应用」路径，必须先修订本章程并经 Terry 批准——
  在那之前，此类 PR 一律视为违反红线。

## 五、登记在案的待办（非本批范围）

- **采纳率信号（suggestion / user_accepted 闭环）——本批明确砍掉（critic 裁定）**：
  ChatBot「确认发布」走通用 `/api/demand/submit`（人工发单同路），在那里挂 `userAccepted:true`
  会把非 AI 发单计入分子；且 `publishDraft` 是全新 body 新建 demand、`parse_demand` 草稿无 id、
  `ai_events` 无关联列——分子分母不同源，算出来的采纳率是假数字（违反数字纪律）。
  **待 draft→publish 携带真实关联 id（如 ai_events 增加 draft_id/session_id 列）后再启。**
- aiService.js 内联提示搬入 prompts.js（见第三节待搬清单）。
- 熔断（3-strikes）目前是章程纪律 + 人工执行（看板上连续 3 期全 dismissed 即停 cron）；
  若周报量变大，可在 runWeekly 里加自动检测——属 Level 1 评估后的工作。
