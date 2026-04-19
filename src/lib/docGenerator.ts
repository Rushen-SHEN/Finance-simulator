// Document generation: Financial Plan from model state + BP section patching
import { ModelInputs, CalcResult, resolveMilestones, MAPPING_BLOCKS, PARAM_MAPPING, computeBOM, calculate } from './calculator';

// ============================================================
// Helpers
// ============================================================

const fmtWan = (v: number) => Math.round(v / 10000).toLocaleString('en-US');
const fmtPct = (v: number | null) => v == null ? '—' : `${Math.round(v * 100)}%`;
const fmtGrowth = (cur: number, prev: number) => prev === 0 ? '—' : `${((cur / prev - 1) * 100).toFixed(1)}%`;
const fmtSOM = (revWan: number, samWan: number) => samWan === 0 ? '—' : `${((revWan / samWan) * 100).toFixed(2)}%`;

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// ============================================================
// Financial Plan Generator
// ============================================================

export function generateFinancialPlan(
  model: ModelInputs,
  resultBest: CalcResult,
  resultBase: CalcResult,
  prevVersion: string = 'v2.2'
): { content: string; version: string } {
  const g = model.global;
  const yrs = resultBest.years;
  const sam = g.sam_midpoint;
  const swing = g.sensitivity_bed_swing;

  // Bump version
  const match = prevVersion.match(/v(\d+)\.(\d+)/);
  const major = match ? parseInt(match[1]) : 2;
  const minor = match ? parseInt(match[2]) + 1 : 3;
  const version = `v${major}.${minor}`;

  // EBITDA turn-positive year
  const ebitdaYear = yrs.findIndex(y => y.ebitda > 0);
  const ebitdaYearLabel = ebitdaYear >= 0 ? `Y${ebitdaYear + 1}` : '未转正';
  const ebitdaVal = ebitdaYear >= 0 ? fmtWan(yrs[ebitdaYear].ebitda) : '—';

  // Resolved milestones
  const msBest = resolveMilestones(model.milestones_best);
  const c2Reg = msBest.find(m => m.id === 'c2_reg');
  const c2RegMonth = c2Reg ? `M${c2Reg.endM}` : 'M15';

  const content = `# ARIA 财务及项目里程碑计划

**版本**: ${version}（参数面板自动生成）
**生效日期**: ${todayStr()}
**EBITDA转正**: ${ebitdaYearLabel}（¥${ebitdaVal}万）| Y10: ¥${fmtWan(yrs[9].ebitda)}万
**核心假设**: 授权金¥${fmtWan(model.yearly.baxter_license[0] + model.yearly.baxter_license[1])}万在Y2到账；续约率固定${Math.round(g.rr_base * 100)}%；二类证获批（${c2RegMonth}）后按年增长${Math.round(g.post_class3_growth * 100)}%计算收入与SOM

---

## 执行摘要

| 指标 | 数值 |
|---|---|
| 增长启动点 | **二类证获批后即进入放量周期**（${c2RegMonth}，Year ${ebitdaYear >= 0 ? ebitdaYear + 1 : '?'}） |
| ${ebitdaYearLabel} EBITDA转正点 | **¥${ebitdaVal}万** |
| 5年收入（Y1-Y5） | Y1 **¥${fmtWan(yrs[0].total_revenue)}** → Y5 **¥${fmtWan(yrs[4].total_revenue)}万** |
| 10年收入（Y1-Y10） | Y1 **¥${fmtWan(yrs[0].total_revenue)}** → Y10 **¥${fmtWan(yrs[9].total_revenue)}万** |
| 5年EBITDA | Y1 **¥${fmtWan(yrs[0].ebitda)}万** → ${ebitdaYearLabel} **¥${ebitdaVal}万** → Y5 **¥${fmtWan(yrs[4].ebitda)}万** |
| 10年EBITDA | Y1 **¥${fmtWan(yrs[0].ebitda)}万** → ${ebitdaYearLabel} **¥${ebitdaVal}万** → Y10 **¥${fmtWan(yrs[9].ebitda)}万** |
| Y10 ARR（续约率${Math.round(g.rr_base * 100)}%） | **¥${Math.round(yrs[9].active_paying * g.price_saas_c2 / 10000)}万** |
| SOM穿透率（SAM中值¥${(sam / 10000).toFixed(1)}亿） | Y5 **${fmtSOM(yrs[4].total_revenue / 10000, sam)}** · Y10 **${fmtSOM(yrs[9].total_revenue / 10000, sam)}** |
| 融资需求 | ¥${fmtWan(model.funding.seed_min + model.funding.preA_min)}–${fmtWan(model.funding.seed_max + model.funding.preA_max + model.funding.seriesA_max)}万（种子轮+Pre-A；A轮可选） |

---

## 0. Simulator 集成说明

### 0.1 当前架构（v3.2 单页模式）

Finance Simulator 采用单页应用 + 抽屉式参数面板架构：

| 路由 | 功能 | 状态 |
|------|------|------|
| \`/\` | 主模拟器：财务表、图表、融资规划、里程碑甘特图、假设面板 | ✅ 生产 |
| \`/bp-mapping\` | BP 数据一致性审计：冲突检测 + 审计报告导出 | ✅ 生产 |
| \`/roadshow\` | 路演稿 | ✅ 生产 |
| \`/qa\` | 投资人答疑 | ✅ 生产 |

### 0.2 核心代码文件

| 文件 | 用途 |
|------|------|
| \`src/lib/calculator.ts\` | BPcc v3.1 计算引擎（Y1-Y5精算 + Y6-Y10增长率推演） |
| \`src/lib/defaults.ts\` | 全量默认参数（Best/Base Case、里程碑、OpEx明细） |
| \`src/lib/bp-reference.ts\` | BP权威数据（10年主表、SOM、渠道参数）+ \`detectConflicts()\` 冲突检测 |
| \`src/lib/storage.ts\` | localStorage存档 + Profile管理 + 审计日志 |
| \`src/lib/archiveStore.ts\` | IndexedDB版本化文档存档（Financial Plan / BP / Roadshow） |
| \`src/lib/docGenerator.ts\` | 文档生成引擎（从参数面板自动生成Financial Plan + 更新BP） |

---

## 1. BP 数据映射表（Source → BP章节）

> **命名规范**：映射ID采用 \`§源章节→§目标章节\` 格式，与 \`calculator.ts\` 中的 \`MAPPING_BLOCKS\` 一一对应。

| 映射ID | 标签 | 数据块源 | BP定位 | 内容 | Simulator参数组 |
|---|---|---|---|---|---|
${MAPPING_BLOCKS.map(b => {
  const groups = Object.entries(PARAM_MAPPING).filter(([, ids]) => ids.includes(b.id)).map(([g]) => g).join(', ');
  return `| \`${b.id}\` | ${b.label} | ${b.bpSection} | ${b.description} | ${groups} |`;
}).join('\n')}

---

## 2. 时间线与里程碑（10年）

### 2.1 年度里程碑总览

| 年份 | 累计床位 | EBITDA(万元) | 关键事件 |
|---|---:|---:|---|
${yrs.map((yr, i) => `| Y${i + 1} | ${yr.cumulative_beds.toLocaleString()} | ${fmtWan(yr.ebitda)} | ${i === 0 ? '原型+试点+注册检验' : i === (ebitdaYear) ? `**EBITDA转正** · ${c2RegMonth}二类获批` : `商业化Y${i + 1}`} |`).join('\n')}

### 2.2 里程碑明细（Best Case）

| ID | 描述 | KPI | 类型 | 开始 | 结束 | 前置 |
|---|---|---|---|---:|---:|---|
${msBest.map(m => `| ${m.id} | ${m.desc} | ${m.kpi} | ${m.type} | M${m.startM} | M${m.endM} | ${m.predecessorId || '—'} |`).join('\n')}

---

## 3. SOM与商业化路径

### 3.1 渠道条款参数

| 参数 | 当前值 | 备注 |
|---|---:|---|
| 前期授权金 | ${fmtWan(model.yearly.baxter_license[0] || model.yearly.baxter_license[1])} | 万元 |
| 里程碑付款 | ${fmtWan(model.yearly.baxter_license[2])} | 万元 |
| 硬件分成 | ${Math.round(g.baxter_hw_commission * 100)}% | 经销商净销售额 |
| SaaS分成 | ${Math.round(g.baxter_saas_commission * 100)}% | 经销商净收入 |
| 续约率 | ${Math.round(g.rr_base * 100)}% | 固定 |

### 3.2 SOM十年增长曲线

| 年份 | 总收入(万元) | 同比增速 | SOM穿透率 | 累计商业床位 | 活跃付费床位 |
|---|---:|---:|---:|---:|---:|
${yrs.map((yr, i) => {
  const rev = yr.total_revenue / 10000;
  const prevRev = i > 0 ? yrs[i - 1].total_revenue / 10000 : 0;
  return `| Y${i + 1} | ${Math.round(rev).toLocaleString()} | ${fmtGrowth(rev, prevRev)} | ${fmtSOM(rev, sam)} | ${yr.cumulative_beds.toLocaleString()} | ${yr.active_paying.toLocaleString()} |`;
}).join('\n')}

---

## 4. 基准增速假设

| 年份 | 增长率 |
|---|---:|
| Y6 | ${Math.round(g.growth_y6 * 100)}% |
| Y7 | ${Math.round(g.growth_y7 * 100)}% |
| Y8 | ${Math.round(g.growth_y8 * 100)}% |
| Y9 | ${Math.round(g.growth_y9 * 100)}% |
| Y10 | ${Math.round(g.growth_y10 * 100)}% |

---

## 5. 财务模型（Best Case）

### 5.1 十年财务主表（万元）

| 项目 | ${yrs.map((_, i) => `Y${i + 1}`).join(' | ')} |
|---|${yrs.map(() => '---:').join('|')}|
| **总收入** | ${yrs.map(yr => `**${fmtWan(yr.total_revenue)}**`).join(' | ')} |
| 授权金/里程碑 | ${yrs.map(yr => fmtWan(yr.baxter_license)).join(' | ')} |
| 商业化收入 | ${yrs.map(yr => fmtWan(yr.total_revenue - yr.baxter_license)).join(' | ')} |
| **总COGS** | ${yrs.map(yr => `**${fmtWan(yr.cogs)}**`).join(' | ')} |
| COGS率 | ${yrs.map(yr => fmtPct(yr.total_revenue > 0 ? yr.cogs / yr.total_revenue : null)).join(' | ')} |
| **毛利** | ${yrs.map(yr => `**${fmtWan(yr.gross_profit)}**`).join(' | ')} |
| 毛利率 | ${yrs.map(yr => fmtPct(yr.gross_margin)).join(' | ')} |
| **总OpEx** | ${yrs.map(yr => `**${fmtWan(yr.opex)}**`).join(' | ')} |
| **EBITDA** | ${yrs.map(yr => `**${fmtWan(yr.ebitda)}**`).join(' | ')} |
| EBITDA率 | ${yrs.map(yr => fmtPct(yr.total_revenue > 0 ? yr.ebitda / yr.total_revenue : null)).join(' | ')} |
| **净利润** | ${yrs.map(yr => `**${fmtWan(yr.net_profit)}**`).join(' | ')} |

### 5.2 ARR分析（续约率${Math.round(g.rr_base * 100)}%）

| 年份 | 累计商业床位 | 活跃付费床位 | ARR(万元) |
|---|---:|---:|---:|
${yrs.filter((_, i) => i > 0).map((yr, i) => {
  const arrVal = yr.active_paying * g.price_saas_c2 / 10000;
  return `| Y${i + 2} | ${yr.cumulative_beds.toLocaleString()} | ${yr.active_paying.toLocaleString()} | ${Math.round(arrVal).toLocaleString()} |`;
}).join('\n')}

---

## 6. 敏感性分析（续约率锁定${Math.round(g.rr_base * 100)}%）

### 6.1 床位增速敏感性（Y10影响）

| 场景 | Y10收入 | Y10 EBITDA | 对基准影响 |
|---|---:|---:|---|
| 乐观(+${Math.round(swing * 100)}%) | ¥${fmtWan(Math.round(yrs[9].total_revenue * (1 + swing)))}万 | ¥${fmtWan(Math.round(yrs[9].ebitda * (1 + swing)))}万 | +${Math.round(swing * 100)}% |
| 基准 | ¥${fmtWan(yrs[9].total_revenue)}万 | ¥${fmtWan(yrs[9].ebitda)}万 | 基准 |
| 保守(-${Math.round(swing * 100)}%) | ¥${fmtWan(Math.round(yrs[9].total_revenue * (1 - swing)))}万 | ¥${fmtWan(Math.round(yrs[9].ebitda * (1 - swing)))}万 | -${Math.round(swing * 100)}% |

### 6.2 里程碑延迟敏感性

| 情景 | 二类获批 | EBITDA转正 |
|---|---|---|
| Best case | ${c2Reg ? `M${c2Reg.endM - 1}` : 'M14'} | **${ebitdaYearLabel}** |
| 基准 | ${c2RegMonth} | **${ebitdaYearLabel}** |

---

## 7. 融资规划

| 轮次 | 金额范围(万元) | 稀释比例 |
|---|---|---:|
| 种子轮 | ${fmtWan(model.funding.seed_min)}–${fmtWan(model.funding.seed_max)} | ${(model.funding.seed_dilution * 100).toFixed(1)}% |
| Pre-A | ${fmtWan(model.funding.preA_min)}–${fmtWan(model.funding.preA_max)} | ${(model.funding.preA_dilution * 100).toFixed(1)}% |
| A轮(可选) | ${fmtWan(model.funding.seriesA_min)}–${fmtWan(model.funding.seriesA_max)} | ${(model.funding.seriesA_dilution * 100).toFixed(1)}% |

累计稀释: ${((1 - (1 - model.funding.seed_dilution) * (1 - model.funding.preA_dilution) * (1 - model.funding.seriesA_dilution)) * 100).toFixed(1)}% · 创始人持股: ${(((1 - model.funding.seed_dilution) * (1 - model.funding.preA_dilution) * (1 - model.funding.seriesA_dilution)) * 100).toFixed(1)}%

---

## 8. BOM成本结构

| 组件 | 成本(元) | 占比 |
|---|---:|---:|
| 传感器模组 | ${g.bom_sensor.toLocaleString()} | ${Math.round(g.bom_sensor / (g.bom_sensor + g.bom_edge_compute + g.bom_housing + g.bom_cable_pcb + g.bom_assembly + g.bom_packaging) * 100)}% |
| 边缘计算模块 | ${g.bom_edge_compute.toLocaleString()} | ${Math.round(g.bom_edge_compute / (g.bom_sensor + g.bom_edge_compute + g.bom_housing + g.bom_cable_pcb + g.bom_assembly + g.bom_packaging) * 100)}% |
| 外壳结构件 | ${g.bom_housing.toLocaleString()} | ${Math.round(g.bom_housing / (g.bom_sensor + g.bom_edge_compute + g.bom_housing + g.bom_cable_pcb + g.bom_assembly + g.bom_packaging) * 100)}% |
| 线缆/PCB | ${g.bom_cable_pcb.toLocaleString()} | ${Math.round(g.bom_cable_pcb / (g.bom_sensor + g.bom_edge_compute + g.bom_housing + g.bom_cable_pcb + g.bom_assembly + g.bom_packaging) * 100)}% |
| 组装测试 | ${g.bom_assembly.toLocaleString()} | ${Math.round(g.bom_assembly / (g.bom_sensor + g.bom_edge_compute + g.bom_housing + g.bom_cable_pcb + g.bom_assembly + g.bom_packaging) * 100)}% |
| 包装物流 | ${g.bom_packaging.toLocaleString()} | ${Math.round(g.bom_packaging / (g.bom_sensor + g.bom_edge_compute + g.bom_housing + g.bom_cable_pcb + g.bom_assembly + g.bom_packaging) * 100)}% |
| **C2 BOM合计** | **${computeBOM(g).c2.toLocaleString()}** | 100% |
| C3额外成本 | ${g.bom_c3_premium.toLocaleString()} | — |
| **C3 BOM合计** | **${computeBOM(g).c3.toLocaleString()}** | — |

---

## 9. 人工成本与OpEx明细（Y1-Y5）

### 9.1 薪资分解（人数 × 人均薪资）

| 项目 | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---:|---:|---:|---:|---:|
| 团队人数 | ${g.headcount.join(' | ')} |
| 人均薪资(万) | ${g.avg_salary.map(v => Math.round(v / 10000)).join(' | ')} |
| **薪资合计(万)** | ${g.headcount.map((h, i) => Math.round(h * g.avg_salary[i] / 10000)).join(' | ')} |

### 9.2 OpEx明细（万元）

| 项目 | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---:|---:|---:|---:|---:|
| 薪资社保 | ${model.opex.salary.map(v => Math.round(v / 10000)).join(' | ')} |
| CDMO NRE | ${model.opex.cdmo_nre.map(v => Math.round(v / 10000)).join(' | ')} |
| 试产样机BOM | ${model.opex.pilot_bom.map(v => Math.round(v / 10000)).join(' | ')} |
| CRO/临床 | ${model.opex.cro.map(v => Math.round(v / 10000)).join(' | ')} |
| 注册审评 | ${model.opex.reg.map(v => Math.round(v / 10000)).join(' | ')} |
| 合规质量 | ${model.opex.compliance.map(v => Math.round(v / 10000)).join(' | ')} |
| 专利/咨询/AI | ${model.opex.patent_ai.map(v => Math.round(v / 10000)).join(' | ')} |
| 差旅/运营/CMO | ${model.opex.travel_ops.map(v => Math.round(v / 10000)).join(' | ')} |
| **合计** | ${[0,1,2,3,4].map(i => Math.round(Object.values(model.opex).reduce((s, arr) => s + (arr[i] || 0), 0) / 10000)).join(' | ')} |

> Y6-10 薪资按 OpEx增速 逐年复利推演。CDMO/CRO/试产在Y6+归零。

---

## 10. 版本记录

| 版本 | 日期 | 主要变化 |
|---|---|---|
| ${version} | ${todayStr()} | 参数面板自动生成 — 基于当前模型参数 |

---

**文件管理**:
- 本文件由参数面板自动生成，基于 \`src/lib/docGenerator.ts\`
- **Finance Simulator 是所有财务数据的单一真值来源 (Single Source of Truth)**
- 所有数据变更均通过 §1 BP映射表追踪同步
- BP全文权威源：\`docs/ARIA_BP_External_clean.md\`（v2.2，财务数据从Simulator同步）
`;

  return { content, version };
}

// ============================================================
// BP Section Patcher
// ============================================================

/**
 * Patch specific numerical sections in the BP document.
 * Finds known tables/data blocks and replaces numbers with current model outputs.
 * Returns the patched content + new version string.
 */
export function patchBPSections(
  bpContent: string,
  model: ModelInputs,
  resultBest: CalcResult
): { content: string; version: string } {
  let patched = bpContent;
  const yrs = resultBest.years;
  const g = model.global;

  // Bump BP version: find **版本** or **Version** line and increment
  const versionMatch = patched.match(/\*\*版本\*\*:\s*v?(\d+)\.(\d+)/);
  let bpVersion = 'v2.1';
  if (versionMatch) {
    const newMinor = parseInt(versionMatch[2]) + 1;
    bpVersion = `v${versionMatch[1]}.${newMinor}`;
    patched = patched.replace(
      /\*\*版本\*\*:\s*v?\d+\.\d+/,
      `**版本**: ${bpVersion}`
    );
  }

  // Patch §1.5 summary numbers if found — Y5/Y10 revenue
  const revY5 = Math.round(yrs[4].total_revenue / 10000);
  const revY10 = Math.round(yrs[9].total_revenue / 10000);

  // Patch common financial summary patterns
  const replacements: [RegExp, string][] = [
    [/Y5[^\n]*?¥[\d,]+万/g, `Y5 ¥${revY5.toLocaleString()}万`],
    [/Y10[^\n]*?¥[\d,]+万/g, `Y10 ¥${revY10.toLocaleString()}万`],
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(patched)) {
      patched = patched.replace(pattern, replacement);
    }
  }

  // Append a live-data section with current simulator state
  // This ensures all parameter panel changes (headcount, salary, OpEx, COGS) are captured
  const liveSection = `

---

## 附录: Simulator 实时数据快照

> ⚠ 以下数据由参数面板自动同步，${todayStr()} 生成

### A1. 人工成本（Y1-Y5）

| 项目 | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---:|---:|---:|---:|---:|
| 团队人数 | ${g.headcount.join(' | ')} |
| 人均薪资(万) | ${g.avg_salary.map(v => Math.round(v / 10000)).join(' | ')} |
| 薪资合计(万) | ${g.headcount.map((h, i) => Math.round(h * g.avg_salary[i] / 10000)).join(' | ')} |

### A2. 十年财务主表（万元）

| 项目 | ${yrs.map((_, i) => `Y${i + 1}`).join(' | ')} |
|---|${yrs.map(() => '---:').join('|')}|
| 总收入 | ${yrs.map(yr => Math.round(yr.total_revenue / 10000).toLocaleString()).join(' | ')} |
| COGS | ${yrs.map(yr => Math.round(yr.cogs / 10000).toLocaleString()).join(' | ')} |
| 毛利 | ${yrs.map(yr => Math.round(yr.gross_profit / 10000).toLocaleString()).join(' | ')} |
| OpEx | ${yrs.map(yr => Math.round(yr.opex / 10000).toLocaleString()).join(' | ')} |
| EBITDA | ${yrs.map(yr => Math.round(yr.ebitda / 10000).toLocaleString()).join(' | ')} |
| 净利润 | ${yrs.map(yr => Math.round(yr.net_profit / 10000).toLocaleString()).join(' | ')} |

### A3. OpEx明细（Y1-Y5，万元）

| 项目 | Y1 | Y2 | Y3 | Y4 | Y5 |
|---|---:|---:|---:|---:|---:|
| 薪资社保 | ${model.opex.salary.map(v => Math.round(v / 10000)).join(' | ')} |
| CDMO NRE | ${model.opex.cdmo_nre.map(v => Math.round(v / 10000)).join(' | ')} |
| 试产样机 | ${model.opex.pilot_bom.map(v => Math.round(v / 10000)).join(' | ')} |
| CRO/临床 | ${model.opex.cro.map(v => Math.round(v / 10000)).join(' | ')} |
| 注册审评 | ${model.opex.reg.map(v => Math.round(v / 10000)).join(' | ')} |
| 合规质量 | ${model.opex.compliance.map(v => Math.round(v / 10000)).join(' | ')} |
| 专利/AI | ${model.opex.patent_ai.map(v => Math.round(v / 10000)).join(' | ')} |
| 差旅/运营 | ${model.opex.travel_ops.map(v => Math.round(v / 10000)).join(' | ')} |
| **合计** | ${[0,1,2,3,4].map(i => Math.round(Object.values(model.opex).reduce((s, arr) => s + (arr[i] || 0), 0) / 10000)).join(' | ')} |
`;

  // Remove old live-data section if exists and append fresh one
  patched = patched.replace(/\n---\n\n## 附录: Simulator 实时数据快照[\s\S]*$/, '');
  patched += liveSection;

  // Add/update timestamp
  const updateNote = `\n> 🔄 自动更新于 ${todayStr()} — 数据来源: Finance Simulator 参数面板\n`;
  if (!patched.includes('自动更新于')) {
    patched += updateNote;
  } else {
    patched = patched.replace(/\n> 🔄 自动更新于[^\n]+\n/, updateNote);
  }

  return { content: patched, version: bpVersion };
}

// ============================================================
// Roadshow Data Extraction
// ============================================================

/** Extract data updates for the roadshow HTML slides from model + results */
export function extractRoadshowUpdates(model: ModelInputs, resultBest: CalcResult): Record<string, string> {
  const yrs = resultBest.years;
  const g = model.global;
  const fmt = (v: number) => `¥${Math.round(v / 10000).toLocaleString()} 万`;
  const fmt0 = (v: number) => v === 0 ? '¥0' : fmt(v);
  const fmtP = (v: number) => `¥${(v / 10000).toFixed(1)} 万`;
  const ebitdaYear = yrs.findIndex(y => y.ebitda > 0);
  const y5Beds = yrs[4].cumulative_beds || 1; // avoid division by zero

  // ROI calculation: annualized cost vs value anchor over 3-year period
  const c2AnnualCost = (g.price_hw_c2 / 3 + g.price_saas_c2);
  const c3AnnualCost = (g.price_hw_c3 / 3 + g.price_saas_c3);
  const c3uAnnualCost = (g.price_upgrade / 3 + g.price_saas_c3);
  const c2ROI = g.value_anchor_c2 > 0 ? Math.round((g.value_anchor_c2 / c2AnnualCost - 1) * 100) : 0;
  const c3ROI = g.value_anchor_c3 > 0 ? Math.round((g.value_anchor_c3 / c3AnnualCost - 1) * 100) : 0;
  const c3uROI = g.value_anchor_c3 > 0 ? Math.round((g.value_anchor_c3 / c3uAnnualCost - 1) * 100) : 0;
  // 5-year bulk discount ROI
  const c3_5yrAnnualCost = (g.price_hw_c3 / 5 + g.price_saas_c3_bulk);
  const c3_5yrROI = g.value_anchor_c3 > 0 ? Math.round((g.value_anchor_c3 / c3_5yrAnnualCost - 1) * 100) : 0;

  return {
    // --- EBITDA ---
    'ebitda-positive': ebitdaYear >= 0 ? `第 ${ebitdaYear + 1} 年` : '未转正',
    'ebitda-year-inline': ebitdaYear >= 0 ? `Year ${ebitdaYear + 1}` : 'N/A',

    // --- Revenue totals ---
    'y2-revenue': fmt(yrs[1].total_revenue),
    'y3-revenue': fmt(yrs[2].total_revenue),
    'y4-revenue': fmt(yrs[3].total_revenue),
    'y5-revenue': fmt(yrs[4].total_revenue),
    'y5-revenue-detail': fmt(yrs[4].total_revenue),
    'y10-revenue': fmt(yrs[9].total_revenue),
    'y10-ebitda': fmt(yrs[9].ebitda),

    // --- Y2 revenue description ---
    'y2-revenue-desc': `硬件直销 ${fmt(yrs[1].hw_direct)}；授权金 + 里程碑 ${fmt(yrs[1].baxter_license)}；SaaS 及分成收入开始形成。`,

    // --- Bed counts ---
    'y2-beds': `${yrs[1].cumulative_beds} 床`,
    'y3-beds': `${yrs[2].cumulative_beds} 床`,
    'y4-beds': `${yrs[3].cumulative_beds} 床`,
    'y5-beds': `${yrs[4].cumulative_beds} 床`,

    // --- Inline bed descriptions ---
    'y2-beds-inline': `${yrs[1].cumulative_beds}`,
    'beds-expansion-desc': `${yrs[2].cumulative_beds} → ${yrs[3].cumulative_beds} → ${yrs[4].cumulative_beds}`,

    // --- Bar chart percentages (relative to Y5 beds) ---
    'y2-beds-pct': `${Math.round((yrs[1].cumulative_beds / y5Beds) * 100)}`,
    'y3-beds-pct': `${Math.round((yrs[2].cumulative_beds / y5Beds) * 100)}`,
    'y4-beds-pct': `${Math.round((yrs[3].cumulative_beds / y5Beds) * 100)}`,
    'y5-beds-pct': '100',

    // --- Pricing ---
    'c2-hw-price': `¥${(g.price_hw_c2 / 10000).toFixed(1)} 万 / 床`,
    'c2-saas-price': `¥${(g.price_saas_c2 / 10000).toFixed(1)} 万 / 床 / 年`,
    'c3-hw-price': `¥${(g.price_hw_c3 / 10000).toFixed(1)} 万 / 床`,
    'c3-saas-price': `¥${(g.price_saas_c3 / 10000).toFixed(1)} 万 / 床 / 年`,
    'c3-saas-bulk': `¥${(g.price_saas_c3_bulk / 10000).toFixed(1)} 万`,

    // --- Pricing summary table ---
    'c2-hw-tbl': `¥${(g.price_hw_c2 / 10000).toFixed(1)} 万`,
    'c3-hw-tbl': `¥${(g.price_hw_c3 / 10000).toFixed(1)} 万`,
    'c2-saas-tbl': `¥${(g.price_saas_c2 / 10000).toFixed(1)} 万 / 年`,
    'c3-saas-tbl': `¥${(g.price_saas_c3 / 10000).toFixed(1)} 万 / 年`,
    'upgrade-tbl': `¥${(g.price_upgrade / 10000).toFixed(1)} 万 / 床`,

    // --- ROI ---
    'roi-c2-new': `+${c2ROI}%`,
    'roi-c2-cost': `年化费用 ${fmtP(c2AnnualCost)} / 床`,
    'roi-c2-anchor': `价值锚点 ${fmtP(g.value_anchor_c2)} / 床 / 年`,
    'roi-c3-new': `+${c3ROI}%`,
    'roi-c3-cost': `年化费用 ${fmtP(c3AnnualCost)} / 床`,
    'roi-c3-anchor': `价值锚点 ${fmtP(g.value_anchor_c3)} / 床 / 年`,
    'roi-c3u': `+${c3uROI}%`,
    'roi-c3u-cost': `年化费用 ${fmtP(c3uAnnualCost)} / 床`,
    'roi-c3u-anchor': `价值锚点 ${fmtP(g.value_anchor_c3)} / 床 / 年`,
    'roi-c3-5yr': `+${c3_5yrROI}%`,

    // --- Revenue breakdown table (Y2, Y3, Y5) ---
    'rev-hw-y2': fmt0(yrs[1].hw_direct),
    'rev-hw-y3': fmt0(yrs[2].hw_direct),
    'rev-hw-y5': fmt0(yrs[4].hw_direct),
    'rev-hwshare-y2': fmt0(yrs[1].hw_baxter),
    'rev-hwshare-y3': fmt0(yrs[2].hw_baxter),
    'rev-hwshare-y5': fmt0(yrs[4].hw_baxter),
    'rev-upgrade-y2': fmt0(yrs[1].upgrade_revenue),
    'rev-upgrade-y3': fmt0(yrs[2].upgrade_revenue),
    'rev-upgrade-y5': fmt0(yrs[4].upgrade_revenue),
    'rev-saas-y2': fmt0(yrs[1].saas_direct),
    'rev-saas-y3': fmt0(yrs[2].saas_direct),
    'rev-saas-y5': fmt0(yrs[4].saas_direct),
    'rev-saasshare-y2': fmt0(yrs[1].saas_baxter),
    'rev-saasshare-y3': fmt0(yrs[2].saas_baxter),
    'rev-saasshare-y5': fmt0(yrs[4].saas_baxter),
    'rev-license-y2': fmt0(yrs[1].baxter_license),
    'rev-license-y3': fmt0(yrs[2].baxter_license),
    'rev-license-y5': fmt0(yrs[4].baxter_license),

    // --- Funding ---
    'seed-range': `¥${Math.round(model.funding.seed_min / 10000)}-${Math.round(model.funding.seed_max / 10000)} 万`,
    'preA-range': `¥${Math.round(model.funding.preA_min / 10000)}-${Math.round(model.funding.preA_max / 10000)} 万`,
    'seriesA-range': `¥${Math.round(model.funding.seriesA_min / 10000)}-${Math.round(model.funding.seriesA_max / 10000)} 万`,

    // --- Rates ---
    'renewal-rate': `${Math.round(g.rr_base * 100)}%`,
    'hw-commission': `${Math.round(g.baxter_hw_commission * 100)}%`,
    'saas-commission': `${Math.round(g.baxter_saas_commission * 100)}%`,

    // --- SOM chart data ---
    'som-chart-beds': JSON.stringify(yrs.map(yr => yr.cumulative_beds)),
    'som-chart-revenue': JSON.stringify(yrs.map(yr => Math.round(yr.total_revenue / 10000))),

    // --- Scenario comparison (三情景对比) ---
    ...buildScenarioFields(model, resultBest),
  };
}

/** Compute scenario comparison data-fields for the roadshow scenario slide */
function buildScenarioFields(model: ModelInputs, neutralResult: CalcResult): Record<string, string> {
  const so = model.scenario_overrides;
  if (!so) return {};

  const fmtW = (v: number) => `¥${Math.round(v / 10000).toLocaleString()} 万`;
  const fmtPctR = (v: number) => `${(v * 100).toFixed(1)}%`;

  // Compute all three scenarios
  const scenarios: Record<string, { result: CalcResult; rr: number; cogsRate: number }> = {};
  for (const key of ['neutral', 'optimistic', 'conservative'] as const) {
    const override = so[key];
    const result = calculate(model.global, model.yearly, model.opex, model.milestones_best, override);
    scenarios[key] = { result, rr: override?.rr_base ?? model.global.rr_base, cogsRate: override?.cogs_rate_target ?? 0.34 };
  }

  const nY10 = scenarios.neutral.result.years[9];
  const oY10 = scenarios.optimistic.result.years[9];
  const cY10 = scenarios.conservative.result.years[9];
  const nY5 = scenarios.neutral.result.years[4];
  const oY5 = scenarios.optimistic.result.years[4];
  const cY5 = scenarios.conservative.result.years[4];

  const ebitdaMargin = (yr: { ebitda: number; total_revenue: number }) =>
    yr.total_revenue > 0 ? `${((yr.ebitda / yr.total_revenue) * 100).toFixed(1)}%` : '—';

  return {
    // Neutral
    'sc-neutral-rr': `${Math.round(scenarios.neutral.rr * 100)}%`,
    'sc-neutral-cogs': `${Math.round(scenarios.neutral.cogsRate * 100)}%`,
    'sc-neutral-y5-rev': fmtW(nY5.total_revenue),
    'sc-neutral-y10-rev': fmtW(nY10.total_revenue),
    'sc-neutral-y5-ebitda': fmtW(nY5.ebitda),
    'sc-neutral-y10-ebitda': fmtW(nY10.ebitda),
    'sc-neutral-y10-margin': ebitdaMargin(nY10),
    'sc-neutral-y5-beds': `${nY5.cumulative_beds} 床`,
    'sc-neutral-y10-beds': `${nY10.cumulative_beds} 床`,

    // Optimistic
    'sc-opt-rr': `${Math.round(scenarios.optimistic.rr * 100)}%`,
    'sc-opt-cogs': `${Math.round(scenarios.optimistic.cogsRate * 100)}%`,
    'sc-opt-y5-rev': fmtW(oY5.total_revenue),
    'sc-opt-y10-rev': fmtW(oY10.total_revenue),
    'sc-opt-y5-ebitda': fmtW(oY5.ebitda),
    'sc-opt-y10-ebitda': fmtW(oY10.ebitda),
    'sc-opt-y10-margin': ebitdaMargin(oY10),
    'sc-opt-y5-beds': `${oY5.cumulative_beds} 床`,
    'sc-opt-y10-beds': `${oY10.cumulative_beds} 床`,
    'sc-opt-rev-delta': `+${Math.round((oY10.total_revenue / nY10.total_revenue - 1) * 100)}%`,
    'sc-opt-ebitda-delta': `+${Math.round((oY10.ebitda / Math.max(nY10.ebitda, 1) - 1) * 100)}%`,

    // Conservative
    'sc-con-rr': `${Math.round(scenarios.conservative.rr * 100)}%`,
    'sc-con-cogs': `${Math.round(scenarios.conservative.cogsRate * 100)}%`,
    'sc-con-y5-rev': fmtW(cY5.total_revenue),
    'sc-con-y10-rev': fmtW(cY10.total_revenue),
    'sc-con-y5-ebitda': fmtW(cY5.ebitda),
    'sc-con-y10-ebitda': fmtW(cY10.ebitda),
    'sc-con-y10-margin': ebitdaMargin(cY10),
    'sc-con-y5-beds': `${cY5.cumulative_beds} 床`,
    'sc-con-y10-beds': `${cY10.cumulative_beds} 床`,
    'sc-con-rev-delta': `${Math.round((cY10.total_revenue / nY10.total_revenue - 1) * 100)}%`,
    'sc-con-ebitda-delta': cY10.ebitda < 0 ? '亏损' : `${Math.round((cY10.ebitda / Math.max(nY10.ebitda, 1) - 1) * 100)}%`,

    // Growth rates
    'sc-neutral-growth': `${Math.round((so.neutral?.growth_y6 ?? 0.30) * 100)}%→${Math.round((so.neutral?.growth_y10 ?? 0.25) * 100)}%`,
    'sc-opt-growth': `${Math.round((so.optimistic?.growth_y6 ?? 0.40) * 100)}%→${Math.round((so.optimistic?.growth_y10 ?? 0.30) * 100)}%`,
    'sc-con-growth': `${Math.round((so.conservative?.growth_y6 ?? 0.20) * 100)}%→${Math.round((so.conservative?.growth_y10 ?? 0.15) * 100)}%`,
  };
}
