# Next Steps

> 本文件是自动续行触发器。如果这里有明确的下一步，Agent 应直接执行，无需询问。

## 当前切入点

**Phase**: 4 → 5（Hardening → Launch Prep）
**Task**: 完成 audit log 连接、参数影响面板、灵敏度对比三项剩余改善，然后进入发布准备。
**Agent**: GitHub Copilot / NEXUS orchestration
**验收标准**:
- [ ] `appendAuditEntry()` 在 ParameterPanel 参数修改时被调用，Notes tab 显示修改历史
- [ ] 参数修改时显示实时数值影响 diff（old → new + 百分比变化）
- [ ] Dashboard 支持 baseline vs scenario 并排灵敏度对比面板
- [ ] `npm run build` 通过，无阻塞性错误

---

## ⚠️ 重要变更通知（2026-04-19）

### BP 源文件已迁入工作区
以下 BP 权威文档已从 OneDrive 迁入 `docs/`，所有 Agent 应以此为数据源：
- `docs/ARIA_BP_v2_Latest.md` — BP全文 v2（38.9KB），含§1-§11全章节
- `docs/ARIA_Financial_Plan_latest.md` — 财务计划 v2.1（15.0KB），含10年主表+SOM曲线+映射块
- `docs/integration/ARIA_FINANCE_PLAN_V2.md` — 集成规划（已有）

### 参考文件审阅结论（2026-04-19）
对比 BP 参考代码（financial-model.v2.0.json / calculation-engine / dashboard / parameters / metric-trace-badges）与当前 simulator，审阅结论：

**已实现 ✅**（6/7项）：
1. 场景快照 — Header 有4个场景按钮（中性/乐观/保守/延迟）
2. 审计追踪基础设施 — `storage.ts` 有完整 AuditEntry 接口 + appendAuditEntry() + loadAuditLog()
3. BP映射追踪 — 7个 MAPPING_BLOCKS + BPBadges + /bp-mapping 页冲突检测 + 审计报告导出
4. 验证告警UI — ParameterPanel 区分 ❌error (红) / ⚠️warning (黄)
5. Break-Even展示 — ProfitCharts 标题 + FinancialTable 底部callout
6. 版本标记 — Header v3.2

**仍需改善 ⚠️**（3项）→ 见工作队列 P1：

---

## 工作队列

### P0 — 阻塞器
（当前无 P0 阻塞项。lint + build 已通过，GitHub Pages 部署已成功。）

### P1 — 高优先级（审阅发现的3项缺口）
1. **Audit Log 写入端连接** — `appendAuditEntry()` 从未被调用；需在 ParameterPanel 的参数修改回调中插入写入，并在 Notes tab 展示修改历史 — Frontend Developer
2. **参数修改实时数值影响 (Impact Diff)** — 当前 BPBadges 只显示定性影响（哪些M-block），缺少定量数值diff（old→new + %变化）；需新增 ImpactDiff 面板 — Frontend Developer
3. **Baseline vs Scenario 并排灵敏度面板** — 当前 Best/Base 只能切换查看，无法并排对比"默认参数 vs 当前修改"；需在 Dashboard 或 FinancialTable 底部增加 SensitivityPanel — Frontend Developer

### P2 — 常规
1. 为导出链路增加模型版本和来源标记 — project-manager-senior
2. 将 ARIA v2 回归验证接入 pre-merge 检查 — EvidenceQA
3. `/qa` 答疑页内容完善 — Content

### 已完成（可归档）
- ~~清理 legacy React hook lint 问题~~ — 已在 v3.2 中解决
- ~~为 `/dashboard` 和 `/parameters` 建立路由~~ — 已合并为单页模式，ParameterPanel 为抽屉
- ~~legacy 首页迁移~~ — 已统一为 BPcc v3.1 引擎
