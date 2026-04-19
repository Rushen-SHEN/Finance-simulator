# Decision Log

> 每次架构、技术、产品决策时更新。格式：D-NNN。

---

### D-001 ARIA v2 以独立路由先落地
- **决策**：先以 `/dashboard` 与 `/parameters` 两条独立路由接入 ARIA v2，而不是直接替换现有 `/` 首页。
- **原因**：需要先保住现有首页工作流和导出链路，同时把 ARIA v2 的 traceability 与 finance plan contract 快速落到仓库。
- **备选方案**：直接重写 `/`；或只写文档不落代码。
- **代价**：短期内会形成 legacy `/` 与 ARIA v2 并存的双模型入口，带来认知歧义。
- **日期**：2026-04-19

### D-002 Hardening 优先级高于继续扩功能
- **决策**：下一阶段先清理 lint gate、补 golden regression checks、再决定是否把 `/` 迁移到 v2 引擎。
- **原因**：当前 `next build` 已通过，真正阻塞发布质量的是 lint 规则失败与缺少数值回归保护。
- **备选方案**：继续堆 README、导出增强、场景库等 P1 能力。
- **代价**：短期内新功能节奏放缓，但可避免在不稳定基线之上继续扩展。
- **日期**：2026-04-19

### D-003 路演页主题系统采用“外层控制台 + 内层只读 ARIA 基线”架构
- **决策**：保留 `public/roadshow-slides.html` 作为路演正文载体，不重写页面内容；在 `src/app/roadshow/page.tsx` 增加主题控制台，并通过 `postMessage` 把主题状态同步给 iframe 内的主题引擎。
- **原因**：当前 `/roadshow` 本身就是 iframe 包裹静态 HTML 的结构。沿用这个边界最容易保证 ARIA 视觉基线不被 React 重构污染，同时能让打印页、刷新恢复和异常回退继续工作。
- **备选方案**：直接把整份路演稿迁回 React；或只做浅层配色切换。
- **代价**：主题定义需要同时服务 React 控制台与静态 HTML 主题引擎，因此新增了独立的 `public/roadshow-theme-presets.json` 和运行时校验逻辑。
- **日期**：2026-04-19
