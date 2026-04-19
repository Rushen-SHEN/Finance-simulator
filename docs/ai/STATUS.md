# Project Status

**项目**: ARIA Finance Simulator
**分支**: main
**模式**: NEXUS-Sprint
**当前阶段**: Phase 4→5 — Hardening → Launch Prep
**状态**: 🟢 ON TRACK

---

## Pipeline 状态

| Phase | 名称 | 状态 | 门禁 |
|-------|------|------|------|
| 0 | Discovery | ✅ 完成 | BPccR2 与 ARIA v2 范围已明确 |
| 1 | Strategy | ✅ 完成 | 选 C 协调方案已定版 |
| 2 | Foundation | ✅ 完成 | 数据合约、计算引擎、追踪组件已落库 |
| 3 | Build | ✅ 完成 | 单页模式 + ParameterPanel 抽屉 + /bp-mapping + /roadshow + /qa 已上线 |
| 4 | Hardening | 🟡 进行中 | lint/build通过，GitHub Pages部署成功；剩余3项改善（见下） |
| 5 | Launch | ⏳ 待进入 | 完成 P1 三项后进入 |
| 6 | Operate | ⏳ 未开始 | 待发布后进入维护 |

---

## 当前已实现功能清单

| 模块 | 状态 | 说明 |
|------|------|------|
| BPcc v3.1 计算引擎 | ✅ | Y1-Y5 精确计算 + Y6-Y10 增长率推演，10年全量输出 |
| 4场景切换 | ✅ | 中性/乐观/保守/延迟，Header一键切换 |
| Best/Base双Case | ✅ | 各模块独立切换，部署/里程碑各有Best/Base |
| 参数控制台(9 tabs) | ✅ | 定价/BOM/部署/OpEx/融资/里程碑/测算/注释/存档 |
| BP映射追踪 | ✅ | 7个映射块（§源→§目标格式）+ BPBadges + /bp-mapping冲突检测 + 审计报告导出 |
| 里程碑前置依赖链 | ✅ | predecessor chain拓扑解算 + 部署gating + 拖拽排序 |
| 验证告警 | ✅ | error(红) + warning(黄) 双级别 |
| 存档系统 | ✅ | localStorage profiles + auto-save 60s |
| 审计日志基础设施 | ✅ | AuditEntry接口 + append/load函数已实现 |
| 导出 | ✅ | PDF多页(表头续打) + PNG |
| 路演页 | ✅ | /roadshow 独立页面 |
| 答疑页 | ✅ | /qa 独立页面 |
| GitHub Pages | ✅ | 部署成功，run_attempt:2 |

## 待完成改善项（P1）

| # | 改善项 | 状态 | 说明 |
|---|--------|------|------|
| 1 | Audit Log 写入端 | ⚠️ 未连接 | appendAuditEntry()从未被调用，Notes tab无历史 |
| 2 | Impact Diff数值面板 | ⚠️ 缺失 | BPBadges只有定性标签，无old→new数值diff |
| 3 | Sensitivity并排对比 | ⚠️ 缺失 | 无baseline vs scenario并排对比面板 |

---

## BP 源文件位置（2026-04-19迁入，04-19合并更新）

| 文件 | 路径 | 说明 |
|------|------|------|
| BP全文 v2 | `docs/ARIA_BP_v2_Latest.md` | §1-§11，38.9KB |
| 财务计划 v2.2（合并版） | `docs/ARIA_Financial_Plan_latest.md` | 10年主表+SOM+§0 Simulator集成说明+§1 BP映射表（§源→§目标格式） |
| ~~集成规划~~ | ~~`docs/integration/ARIA_FINANCE_PLAN_V2.md`~~ | **已删除**，内容合并入财务计划 v2.2 |
| BP源数据(code) | `src/lib/bp-reference.ts` | BP_MAIN_TABLE / BP_SOM / detectConflicts() |

> ⚡ 所有Agent应以 `docs/` 下的BP文件为权威数据源，`src/lib/bp-reference.ts` 为代码级数据对照。

---

## 最近更新

| 日期 | 变更 | 负责人 |
|------|------|--------|
| 2026-04-19 | 合并 Financial_Plan v2.1 + FINANCE_PLAN_V2.md → v2.2合并版；映射ID从 M-01~M-07 改为 §源→§目标 格式；新增§0集成说明；删除 FINANCE_PLAN_V2.md | GitHub Copilot |
| 2026-04-19 | BP源文件迁入workspace: `docs/ARIA_BP_v2_Latest.md` + `docs/ARIA_Financial_Plan_latest.md` | GitHub Copilot |
| 2026-04-19 | 完成参考文件(5个)审阅，确认6/7项已实现，3项待改善(audit写入、impact diff、sensitivity对比) | GitHub Copilot |
| 2026-04-19 | GitHub Pages部署成功(run_attempt:2) | GitHub Copilot |
| 2026-04-19 | 推送 `98b2b4d`：新增 ARIA v2 dashboard、parameters、数据合约、计算引擎和追踪组件 | GitHub Copilot |
| 2026-04-19 | `next build` 通过；识别出下一阶段三类阻塞：legacy lint、缺少回归测试、双模型入口歧义 | NEXUS + GitHub Copilot |
