# Next Steps

> 本文件是自动续行触发器。如果这里有明确的下一步，Agent 应直接执行，无需询问。

## 当前切入点

**Phase**: 5（Launch Prep）
**Task**: 完成 `/roadshow` 主题系统可视回归检查与 audit log 连接，然后进入发布准备。Source-of-Truth + 变更检测 + IndexedDB存档 已完成。
**Agent**: GitHub Copilot / NEXUS orchestration
**验收标准**:
- [x] `ARIA` 作为默认/基线/回退主题独立存在，且切回后不受其他主题污染
- [x] `/roadshow` 具备五套预设主题、风格定义面板、微调、恢复默认、导入导出与 localStorage 容错
- [ ] 在真实浏览器中完成五套主题切换、抽屉面板、刷新恢复、异常 localStorage 回退的人工走查
- [ ] `appendAuditEntry()` 在 ParameterPanel 参数修改时被调用，Notes tab 显示修改历史
- [x] ~~参数修改时显示实时数值影响 diff~~ → ChangeBanner 显示受影响BP章节+路演页
- [x] ~~Dashboard 支持 baseline vs scenario 并排灵敏度对比面板~~ → SAM中值+敏感性摆幅参数已加入定价tab
- [x] `npm run build` 通过，无阻塞性错误

### 路演主题系统接手须知（2026-04-19）

- 主题清单在 `public/roadshow-theme-presets.json`，`aria` 是只读基线主题，任何后续实验主题都不能覆盖它。
- iframe 内主题应用在 `public/roadshow-theme-engine.js` + `public/roadshow-theme-system.css`，外层控制台在 `src/app/roadshow/page.tsx`。
- 当前存储键为 `aria-roadshow-theme-state-v1`；如果主题状态损坏或字段缺失，设计上必须自动回退到 `ARIA`。
- `roadshow-slides.html` 正文结构没有重写，后续如果改视觉，优先补 preset/token 和覆盖层，不要直接漂移 ARIA 原始 CSS。

---

## ⚠️ 重要变更通知（2026-04-19）

### BP 源文件已迁入工作区（已合并更新）
以下 BP 权威文档已从 OneDrive 迁入 `docs/`，所有 Agent 应以此为数据源：
- `docs/ARIA_BP_External.md` — BP全文 v2.0（38.9KB），含§1-§11全章节
- `docs/ARIA_Financial_Plan_latest.md` — 财务计划 **v2.2 合并版**，含10年主表+SOM曲线+§0 Simulator集成说明+§1 BP映射表
- ~~`docs/integration/ARIA_FINANCE_PLAN_V2.md`~~ — **已删除**，内容已合并入上述财务计划

> **映射ID规范变更**：映射表不再使用 M-01~M-07 编号，改用 `§源章节→§目标章节` 格式（如 `§5→§1.5`），与 `calculator.ts` MAPPING_BLOCKS 完全对齐。避免与里程碑月份 M1~M60 混淆。

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

### P1 — 高优先级
1. **Audit Log 写入端连接** — `appendAuditEntry()` 从未被调用；需在 ParameterPanel 的参数修改回调中插入写入，并在 Notes tab 展示修改历史 — Frontend Developer

### 已完成 P1（2026-04-19 Source-of-Truth 迭代）
- ~~**参数修改实时数值影响 (Impact Diff)**~~ → 由 `ChangeBanner` 组件替代：显示受影响BP章节+路演页列表，用户点击"接受变更"后自动重新生成文档
- ~~**Baseline vs Scenario 并排灵敏度面板**~~ → SAM中值(275000万) + 敏感性摆幅(±15%) 参数已加入定价tab，Y5 SOM穿透率实时显示

### P2 — 常规
1. 为导出链路增加模型版本和来源标记 — project-manager-senior
2. 将 ARIA v2 回归验证接入 pre-merge 检查 — EvidenceQA
3. `/qa` 答疑页内容完善 — Content

### 已完成（可归档）
- ~~Source-of-Truth 参数面板架构~~ — changeTracker + ChangeBanner + docGenerator + archiveStore（IndexedDB）完成，参数面板驱动BP+路演+财务计划自动更新
- ~~SAM/敏感性参数缺口~~ — sam_midpoint(275000万) + sensitivity_bed_swing(±15%) 已加入 GlobalInputs + defaults + 定价tab UI
- ~~清理 legacy React hook lint 问题~~ — 已在 v3.2 中解决
- ~~为 `/dashboard` 和 `/parameters` 建立路由~~ — 已合并为单页模式，ParameterPanel 为抽屉
- ~~legacy 首页迁移~~ — 已统一为 BPcc v3.1 引擎
