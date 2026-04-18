# Ranked Validation Plan

## 1. Validate lint and runtime stability on legacy `/`

**为什么排第一**：这是当前最直接的质量门禁。只要 lint 仍红，仓库就处于 hardening 未完成状态。

执行：
- 跑 `npm run lint`
- 逐项修复 `src/app/page.tsx` 与 `src/components/ParameterPanel.tsx`
- 手工验证首页、参数面板、保存、恢复默认、导出

通过标准：
- lint 全绿
- legacy 交互无回归

## 2. Validate ARIA v2 numeric parity against the JSON contract

**为什么排第二**：这次集成的核心价值是可信数字，而不是只把新页面渲染出来。

执行：
- 建 baseline 与 named scenario golden checks
- 校验 Y2 EBITDA、Y10 Revenue、Y10 EBITDA、Y10 ARR、break-even year
- 校验 `identifyAffectedMappings()` 输出

通过标准：
- 所有关键指标与 `financial-model.v2.0.json` 一致
- named scenario 偏移符合文档说明

## 3. Validate route coherence and operator understanding

**为什么排第三**：代码稳定且数字正确后，最大的剩余风险是用户把不同入口当成同一模型。

执行：
- 检查 Header、README、集成文档、页面标题
- 对比 `/` 与 ARIA v2 baseline 的差异解释是否清楚
- 确认导出/截图能识别来源页面

通过标准：
- reviewer 能明确说出三个入口的职责
- 没有“哪个页面才是真实数字”这一类歧义

## Ranked Candidate Summary

1. Legacy lint hardening — 先清门禁。
2. ARIA v2 golden regression — 再锁数字。
3. Route contract convergence — 最后收敛产品语义。