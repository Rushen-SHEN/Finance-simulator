# Known Issues

> 发现新问题或解决旧问题时更新。

## P0 — 阻塞器
| 编号 | 日期 | 现象 | 影响范围 | 临时处置 | Root Cause | Owner | 状态 |
|------|------|------|---------|---------|-----------|------|------|
| P0-001 | 2026-04-19 | `npm run lint` 在 legacy 首页与旧参数面板失败 | 阻止质量门禁进入绿色，影响后续 hardening | 暂以 `next build` 作为集成验收；暂不继续在 legacy 面扩功能 | React 19/新 hook 规则不接受旧的 `setState in effect` 与 render 期 ref 读取模式 | Frontend Developer | Open |

## P1 — 重要质量问题
| 编号 | 日期 | 现象 | 影响范围 | 临时处置 | Root Cause | Owner | 状态 |
|------|------|------|---------|---------|-----------|------|------|
| P1-001 | 2026-04-19 | ARIA v2 计算结果仅靠 build + 人工 spot-check 验证 | 数字回归可能静默漂移，影响 BP 对齐可信度 | 以 `financial-model.v2.0.json` 作为暂时黄金基线 | 仓库尚无 unit/regression harness，也没有 `test` script | Test Results Analyzer | Open |
| P1-002 | 2026-04-19 | `/` 与 `/dashboard`、`/parameters` 并存但边界尚未完全收敛 | 用户可能把两套模型结果当作同一来源 | Header 已加导航；集成文档已说明新旧路线 | 架构上采取了并存接入策略，但尚未完成统一 contract 设计 | ArchitectUX | Open |

## P2 — 次要问题
| 编号 | 日期 | 现象 | 影响范围 | 临时处置 | Owner | 状态 |
|------|------|------|---------|---------|------|------|
| P2-001 | 2026-04-19 | Next 16 识别到多处 lockfile，build 时提示 workspace root warning | 可能造成开发体验噪音，但不阻塞当前构建 | 目前仅记录 warning，后续在 `next.config.ts` 指定 `turbopack.root` | project-manager-senior | Open |

## 已解决
| 编号 | 描述 | 解决日期 | 解决方式 |
|------|------|---------|---------|
| R-001 | ARIA v2 新路由无法落库 | 2026-04-19 | 已提交并推送 `98b2b4d`，新增 dashboard/parameters、数据合约、引擎与追踪组件 |
