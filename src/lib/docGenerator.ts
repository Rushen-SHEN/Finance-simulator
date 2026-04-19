// Document generation: Financial Plan from model state + BP section patching
import { ModelInputs, CalcResult, resolveMilestones, MAPPING_BLOCKS, PARAM_MAPPING, computeBOM } from './calculator';

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

## 9. OpEx明细（Y1-Y5，万元）

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

---

## 10. 版本记录

| 版本 | 日期 | 主要变化 |
|---|---|---|
| ${version} | ${todayStr()} | 参数面板自动生成 — 基于当前模型参数 |

---

**文件管理**:
- 本文件由参数面板自动生成，基于 \`src/lib/docGenerator.ts\`
- 所有数据变更均通过 §1 BP映射表追踪同步
- BP全文权威源：\`docs/ARIA_BP_External.md\`
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
  // These are best-effort: if the exact pattern isn't found, skip gracefully
  const replacements: [RegExp, string][] = [
    // Revenue figures
    [/Y5[^\n]*?¥[\d,]+万/g, `Y5 ¥${revY5.toLocaleString()}万`],
    [/Y10[^\n]*?¥[\d,]+万/g, `Y10 ¥${revY10.toLocaleString()}万`],
  ];

  for (const [pattern, replacement] of replacements) {
    // Only replace if found — don't corrupt document
    if (pattern.test(patched)) {
      patched = patched.replace(pattern, replacement);
    }
  }

  // Add update timestamp at end
  const updateNote = `\n\n---\n> 🔄 自动更新于 ${todayStr()} — 数据来源: Finance Simulator 参数面板\n`;
  if (!patched.includes('自动更新于')) {
    patched += updateNote;
  } else {
    patched = patched.replace(/\n\n---\n> 🔄 自动更新于[^\n]+\n/, updateNote);
  }

  return { content: patched, version: bpVersion };
}

// ============================================================
// Roadshow Data Extraction
// ============================================================

/** Extract data updates for the roadshow HTML slides from model + results */
export function extractRoadshowUpdates(model: ModelInputs, resultBest: CalcResult): Record<string, string> {
  const yrs = resultBest.years;
  const fmt = (v: number) => `¥${Math.round(v / 10000).toLocaleString()} 万`;
  const ebitdaYear = yrs.findIndex(y => y.ebitda > 0);

  return {
    'ebitda-positive': ebitdaYear >= 0 ? `第 ${ebitdaYear + 1} 年` : '未转正',
    'y2-revenue': fmt(yrs[1].total_revenue),
    'y3-revenue': fmt(yrs[2].total_revenue),
    'y4-revenue': fmt(yrs[3].total_revenue),
    'y5-revenue': fmt(yrs[4].total_revenue),
    'y5-revenue-detail': fmt(yrs[4].total_revenue),
    'y2-beds': `${yrs[1].cumulative_beds} 床`,
    'y3-beds': `${yrs[2].cumulative_beds} 床`,
    'y4-beds': `${yrs[3].cumulative_beds} 床`,
    'y5-beds': `${yrs[4].cumulative_beds} 床`,
    'y10-revenue': fmt(yrs[9].total_revenue),
    'y10-ebitda': fmt(yrs[9].ebitda),
    'renewal-rate': `${Math.round(model.global.rr_base * 100)}%`,
    'hw-commission': `${Math.round(model.global.baxter_hw_commission * 100)}%`,
    'saas-commission': `${Math.round(model.global.baxter_saas_commission * 100)}%`,
  };
}
