# Blocker Escalation Brainstorm

来源：NEXUS expert panel brainstorm，日期 2026-04-19。

## Ranked Blocker Candidates

### 1. Legacy lint gate remains red

- **Severity**：Highest
- **Root cause hypothesis**：legacy 首页和旧参数面板仍使用 React 19 下不被接受的旧模式，主要是 effect 内同步 setState 与 render 期读取 ref。
- **Evidence**：此前 `npm run lint` 在 `src/app/page.tsx` 与 `src/components/ParameterPanel.tsx` 报 hook 规则错误；`next build` 同时通过，说明这是质量门禁而不是编译阻塞。
- **Recommended owner**：Frontend Developer
- **Fastest safe mitigation**：把初始化逻辑改为 lazy state / mount-safe flow，把 dirty-state 判定从 render 期 ref 比较改为 state 或 memo 方案，并移除未使用变量。
- **Durable fix**：统一 client component hook 规范，把 lint 设为 pre-merge 必过项。
- **Validation**：`npm run lint`；手工验证 `/`、参数面板、save/reset/export。

### 2. ARIA v2 lacks regression protection

- **Severity**：High
- **Root cause hypothesis**：新增的 v2 engine 只做了 build 与人工 spot-check，没有 repo-owned regression harness。
- **Evidence**：仓库没有测试脚本，`src/lib/calculation-engine.ts` 也没有 golden check；finance logic 对数字漂移敏感。
- **Recommended owner**：Test Results Analyzer
- **Fastest safe mitigation**：先补 baseline 与两个命名 scenario 的黄金断言。
- **Durable fix**：加入 unit + route smoke checks，覆盖 `calculateMetrics`、`calculateImpact`、`identifyAffectedMappings`、`validateParameters`。
- **Validation**：Y2 EBITDA、Y10 Revenue、Y10 EBITDA、Y10 ARR、break-even、affected mappings 全部与预期一致。

### 3. Dual-model route contract is ambiguous

- **Severity**：Medium
- **Root cause hypothesis**：仓库目前同时暴露 legacy `/` 与 ARIA v2 `/dashboard`、`/parameters`，但尚未把边界写成清晰的产品 contract。
- **Evidence**：Header 已暴露多入口，但根 README 和界面级说明尚未完全收敛；用户可能把两套数字误认为同一来源。
- **Recommended owner**：ArchitectUX
- **Fastest safe mitigation**：明确标注 `/` 为 legacy simulator，ARIA v2 为 traceable plan surface。
- **Durable fix**：最终迁移到统一 model contract，或至少引入 shared adapter。
- **Validation**：README、导航、导出说明都能区分模型来源；baseline KPI 对比结果被明确解释。

## Escalation Trigger

满足任一条件，直接再次调度 NEXUS：

- S1 中 30 分钟内仍无法让 lint 变绿。
- S2 中 baseline 数字与 JSON 合约存在未解释偏差。
- S3 中出现是否替换 `/` 的产品分歧，且没有单一 owner 能拍板。