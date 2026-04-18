# Next Steps

> 本文件是自动续行触发器。如果这里有明确的下一步，Agent 应直接执行，无需询问。

## 当前切入点

**Phase**: 4
**Task**: 清理 legacy 首页与旧参数面板的 lint gate，并为 ARIA v2 计算引擎补 golden regression checks。
**Agent**: GitHub Copilot / NEXUS orchestration
**验收标准**:
- [ ] `npm run lint` 通过，不再报 `set-state-in-effect` 与 `refs during render`
- [ ] ARIA v2 baseline 与命名 scenario 的关键数值有自动化校验
- [ ] `/`、`/dashboard`、`/parameters` 三个入口的职责已在文档中明确

---

## 工作队列

### P0 — 阻塞器
1. 清理 legacy React hook lint 问题，恢复 repo 质量门禁绿色状态 — Frontend Developer

### P1 — 高优先级
1. 为 `src/lib/calculation-engine.ts` 建立 baseline/scenario golden checks — Test Results Analyzer
2. 写清 `/` 与 ARIA v2 两条产品面在导航与 README 中的边界 — ArchitectUX

### P2 — 常规
1. 为导出链路增加模型版本和来源标记 — project-manager-senior
2. 将 ARIA v2 回归验证接入 pre-merge 检查 — EvidenceQA

### 已阻塞 / 延后
- legacy 首页迁移到统一 v2 引擎 — 原因：需先完成 lint hardening 与数字回归锁定
