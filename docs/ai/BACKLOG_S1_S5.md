# S1-S5 Sprint Backlog

基线提交：`98b2b4d`

## S1 — Legacy Hardening

**目标**：恢复 repo 的 lint 质量门禁，先稳住旧首页与参数面板。

任务：
- 修复 `src/app/page.tsx` 中的 `setState in effect` 模式。
- 修复 `src/components/ParameterPanel.tsx` 中 render 期 ref 读取与 effect 内直接 setState。
- 移除 legacy 面板中的未使用变量。
- 回归验证 `/` 首页：打开参数面板、保存、恢复默认、导出 PDF/PNG。

完成定义：
- `npm run lint` 通过。
- `/` 行为与当前 commit 前一致。

## S2 — ARIA v2 Regression Lock

**目标**：把 finance plan v2 的关键数字锁成可重复验证的黄金基线。

任务：
- 为 baseline、`scenarioSlowBreakEven`、`scenarioWeakRenewal` 写 golden checks。
- 覆盖 Y2 EBITDA、Y10 Revenue、Y10 EBITDA、Y10 ARR、break-even year、affected mappings。
- 补一条最小 route smoke 验证 `/dashboard` 与 `/parameters` 正常渲染。

完成定义：
- 新增 regression harness 可重复运行。
- baseline 数字与 `financial-model.v2.0.json` 精确一致。

## S3 — Route Contract Convergence

**目标**：解释并收敛 legacy `/` 与 ARIA v2 双入口的产品语义。

任务：
- 在 README 和界面文案中明确 `/` 是 legacy simulator，`/dashboard` 与 `/parameters` 是 ARIA v2 traceable surface。
- 评估是否继续并存，还是为 `/` 引入共享 adapter / v2 引擎迁移路径。
- 对比 baseline KPI，确认差异是预期还是 bug。

完成定义：
- 路由职责不再模糊。
- 有明确的 converged / coexistence 决策记录。

## S4 — Governance and Operator Docs

**目标**：补齐审计、操作、导出标记等治理信息。

任务：
- 文档化参数审计要求、场景使用规范、导出标识要求。
- 在导出或页面 footer 规划模型版本和 source plan version 露出。
- 为 reviewer 准备操作说明，避免用错入口或场景。

完成定义：
- 操作文档齐备。
- 审计要求和版本标记有明确落点。

## S5 — Release Readiness Review

**目标**：在 release 前做事实性验收，而不是继续脑补需求。

任务：
- 复跑 lint、build、golden checks、route smoke。
- 人工 review `/`、`/dashboard`、`/parameters` 三个入口。
- 形成 READY / NEEDS WORK 结论与证据清单。

完成定义：
- 有明确发布结论。
- 剩余问题都已进入 `KNOWN_ISSUES.md`。