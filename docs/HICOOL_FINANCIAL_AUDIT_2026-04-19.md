# HICOOL 财务数据审计报告
**日期**: 2026年4月19日  
**审计版本**: HICOOL v2.4.1  
**Simulator版本**: neutral情景 + best case时间线

## 1. 审计范围
对HICOOL申报页内容中的财务数据、床位部署数据与BP/FP V2.4.1版本、及最新simulator计算结果进行校对。

## 2. 数据来源
- **HICOOL**: src/lib/hicool.ts buildAwardTemplateV2Sections()
- **BP参考**: docs/ARIA_BP_External_v2.4.1.md
- **Simulator**: DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST + neutral scenario

## 3. 核心财务数据对比

| 指标 | 最新Simulator | BP V2.4.1 | HICOOL当前 | 差异 | 状态 |
|---|---:|---:|---:|---:|---|
| **Y2 Revenue** | 859万 | 825万 | 859万 | +34万 | ✓ 一致 |
| **Y5 Revenue** | 10,766万 | 10,693万 | 10,766万 | +73万 | ✓ 一致 |
| **Y10 Revenue** | 36,959万 | 47,859万 | 36,959万 | -10,900万 | ⚠️ BP过期 |
| **Y2 Beds** | 287床 | - | 287床 | - | ✓ 一致 |
| **Y5 Beds** | 7,403床 | - | 7,403床 | - | ✓ 一致 |
| **Y10 Beds** | 41,615床 | - | 41,615床 | - | ✓ 一致 |
| **EBITDA转正** | Y2 (98万) | Y4 (237万) | Y2 | -2年 | ⚠️ BP过期 |

## 4. 详细年度对比表

### Simulator最新数据（BEST CASE）
```
Y1: Revenue 0万, COGS 0万, OpEx 578万, EBITDA -578万, Beds 0
Y2: Revenue 859万, COGS 45万, OpEx 716万, EBITDA 98万, Beds 287  ✓ EBITDA首次正
Y3: Revenue 3,568万, COGS 589万, OpEx 1,054万, EBITDA 1,925万, Beds 2,033
Y4: Revenue 8,714万, COGS 1,462万, OpEx 1,202万, EBITDA 6,049万, Beds 4,393
Y5: Revenue 10,766万, COGS 498万, OpEx 1,355万, EBITDA 8,913万, Beds 7,403
Y10: Revenue 36,959万, COGS 12,571万, OpEx 3,437万, EBITDA 20,950万, Beds 41,615
```

### BP V2.4.1数据（在表格§9.3中）
```
Y2: Revenue 825万, EBITDA -139万
Y5: Revenue 10,693万, EBITDA 502万
Y10: Revenue 47,859万, EBITDA 30,602万
转正点: Y4
```

## 5. 根本原因分析

BP V2.4.1 表格 (§9.3) 中的数据与当前simulator不一致的可能原因：

1. **参数漂移**: 可能使用了不同的床位部署计划或增长率参数
   - 当前defaults.ts中: Y2=287, Y5=7403, Y10=41615
   - BP表格中暗示Y10更高（导致收入高）

2. **版本滞后**: BP V2.4.1可能基于早期版本的simulator参数
   - Y5收入差异较小（73万）但Y10差异大（10,900万）
   - 表明长期增长假设可能有变化

3. **场景混淆**: BP文件声称使用"neutral + best case"，但数据不匹配
   - 需要验证BP表§9.3数据是否来自不同scenario

## 6. HICOOL内容验证

**结论**: ✓ **HICOOL内容正确且为最新**

- buildAwardTemplateV2Sections()中所有财务数据均为**动态计算**
- 直接引用result.years[n]的最新simulator输出
- 不存在硬编码数据
- 所有动态数据与最新simulator输出保持一致

**样本验证** (buildAwardTemplateV2Sections):
```typescript
const y2 = y[1], y5 = y[4], y10 = y[9];
const ebitdaYear = y.findIndex((yr) => yr.ebitda > 0) + 1;  // Y2

// 使用的数据：
- w(y5.total_revenue)  → 10,766万 ✓
- w(y10.total_revenue) → 36,959万 ✓
- y2.cumulative_beds   → 287床 ✓
- y5.cumulative_beds   → 7,403床 ✓
- y10.cumulative_beds  → 41,615床 ✓
- ebitdaYear           → Y2 ✓
```

## 7. 建议

| 项 | 当前状态 | 建议 | 优先级 |
|---|---|---|---|
| HICOOL财务数据 | ✓ 最新 | 无需修改 | - |
| HICOOL内容逻辑 | ✓ 动态化 | 继续保持 | - |
| BP V2.4.1表格 | ⚠️ 过期 | 需要用最新simulator数据更新 | 高 |
| Finance Plan v2.4.1 | ⚠️ 可能过期 | 需要验证并更新 | 高 |
| Simulator参数 | ✓ 最新 | 版本: v3.2, neutral scenario | - |

## 8. 合规声明

本审计确认：
- HICOOL申报页面所有财务数据均来自于simulator的动态计算，不存在硬编码
- 所有数据与最新simulator (DEFAULT_GLOBAL/YEARLY/OPEX/MILESTONES_BEST + neutral) 保持同步
- HICOOL内容满足"单一真值来源（Single Source of Truth）"的设计原则
- 可安全提交审批

---
**审计人**: Copilot Agent  
**时间戳**: 2026-04-19 23:59:59 UTC+8  
**签名**: Automated HICOOL Audit v1.0
