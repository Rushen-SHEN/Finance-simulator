// BP Source of Truth — ARIA_BP_External.md v2.0 (2026-04-19)
// This module holds the canonical BP data for conflict detection and audit

import { CalcResult } from './calculator';

/** BP v2.0 10-year financial main table (万元) — aligned to ARIA_BP_External.md §9.2 */
export const BP_MAIN_TABLE = {
  total_revenue:  [0, 932, 1259, 1398, 1665, 2164, 2813, 3657, 4754, 6180],
  license_milestone: [0, 300, 200, 0, 0, 0, 0, 0, 0, 0],
  commercial_revenue: [0, 632, 1059, 1398, 1665, 2164, 2813, 3657, 4754, 6180],
  total_cogs:     [0, 352, 498, 527, 559, 727, 945, 1228, 1597, 2076],
  cogs_rate:      [0, 0.38, 0.40, 0.38, 0.34, 0.34, 0.34, 0.34, 0.34, 0.34],
  gross_profit:   [0, 580, 761, 871, 1106, 1437, 1868, 2429, 3157, 4104],
  gross_margin:   [0, 0.62, 0.60, 0.62, 0.66, 0.66, 0.66, 0.66, 0.66, 0.66],
  total_opex:     [500, 361, 464, 504, 566, 735, 916, 1141, 1384, 1684],
  ebitda:         [-500, 219, 297, 367, 540, 702, 952, 1288, 1773, 2420],
  ebitda_margin:  [0, 0.23, 0.24, 0.26, 0.32, 0.32, 0.34, 0.35, 0.37, 0.39],
  net_profit:     [-520, 194, 272, 337, 510, 662, 907, 1238, 1718, 2360],
  arr:            [0, 54, 142, 255, 383, 498, 647, 841, 1093, 1421],
};

/** BP v2.0 SOM growth curve — aligned to ARIA_BP_External.md §9.2 + Y6-Y10 at 30% */
export const BP_SOM = {
  cumulative_beds:  [0, 110, 290, 520, 780, 1014, 1318, 1714, 2228, 2896],
  active_paying:    [0, 77, 203, 364, 546, 710, 923, 1200, 1560, 2028],
  som_penetration:  [0, 0.0034, 0.0046, 0.0051, 0.0061, 0.0079, 0.0102, 0.0133, 0.0173, 0.0225],
  yoy_growth:       [0, 0, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30],
};

/** Channel parameters from BP §3.1 */
export const BP_CHANNEL = {
  license_fee: 300,  // 万元
  milestone_fee: 200, // 万元
  hw_commission: 0.15,
  saas_commission: 0.35,
  renewal_rate: 0.70,
  saas_per_bed: 0.70, // 万元/bed/year
};

/** Funding plan from BP §9.5 */
export const BP_FUNDING = {
  seed: { min: 500, max: 600, desc: 'CDMO NRE+40台试点样机+薪资+CRO/注册/运营' },
  preA: { min: 300, max: 500, desc: '百特授权金可替代部分；Y2已EBITDA转正' },
  seriesA: { min: 0, max: 500, desc: '加速扩张用，非必需' },
};

/** Roadshow slide data points that should be live-linked */
export const ROADSHOW_DATA_POINTS = [
  { slideId: 's9',  field: 'ebitda_positive_year', label: 'EBITDA转正时点', bpValue: 'Year 2', unit: '' },
  { slideId: 's16', field: 'y5_revenue',           label: 'Y5总收入',      bpValue: '¥1,665万', unit: '万' },
  { slideId: 's16', field: 'som_y1_beds',          label: 'Y1累计床位',    bpValue: '0',  unit: '床' },
  { slideId: 's16', field: 'som_y2_beds',          label: 'Y2累计床位',    bpValue: '110',  unit: '床' },
  { slideId: 's16', field: 'som_y3_beds',          label: 'Y3累计床位',    bpValue: '290',  unit: '床' },
  { slideId: 's16', field: 'som_y4_beds',          label: 'Y4累计床位',    bpValue: '520',  unit: '床' },
  { slideId: 's16', field: 'som_y5_beds',          label: 'Y5累计床位',    bpValue: '780',  unit: '床' },
  { slideId: 's17', field: 'y2_revenue',           label: 'Y2总收入',      bpValue: '¥932万', unit: '万' },
  { slideId: 's17', field: 'y3_revenue',           label: 'Y3总收入',      bpValue: '¥1,259万', unit: '万' },
  { slideId: 's17', field: 'y5_revenue_detail',    label: 'Y5总收入(详情页)', bpValue: '¥1,665万', unit: '万' },
];

/** Document version constants — update here when files change */
export const DOC_VERSIONS = {
  bp: 'BP V2.0',         // ARIA_BP_External.md
  fp: 'FP V2.2',         // ARIA_Financial_Plan_latest.md
  bpFile: 'ARIA_BP_External.md',
  fpFile: 'ARIA_Financial_Plan_latest.md',
};

/** Source → BP Section mapping block definitions with full detail from BP */
export interface MappingBlockDetail {
  id: string;
  /** Full display label: e.g. "BP V2.0 §5 主表 → FP V2.2 §1.5 摘要" */
  displayLabel: string;
  source: string;
  sourceLabel: string;   // e.g. "BP V2.0 §5 主表"
  bpSection: string;
  targetLabel: string;   // e.g. "FP V2.2 §1.5 摘要"
  content: string;
  trigger: string;
  checkFields: string[];
}

export const BP_MAPPING_BLOCKS: MappingBlockDetail[] = [
  {
    id: '§5→§1.5',
    displayLabel: `${DOC_VERSIONS.bp} §5 主表 → ${DOC_VERSIONS.fp} §1.5 摘要`,
    source: '§5 主表', sourceLabel: `${DOC_VERSIONS.bp} §5 主表`,
    bpSection: '§1.5 摘要 / §9.2', targetLabel: `${DOC_VERSIONS.fp} §1.5 摘要 / §9.2`,
    content: 'Y1-Y10 收入、EBITDA、净利润、ARR、SOM',
    trigger: '任一核心财务指标变化',
    checkFields: ['total_revenue', 'ebitda', 'net_profit', 'arr'],
  },
  {
    id: '§3.1→§5.3',
    displayLabel: `${DOC_VERSIONS.fp} §3.1 渠道 → ${DOC_VERSIONS.bp} §5.3 渠道战略`,
    source: '§3.1', sourceLabel: `${DOC_VERSIONS.fp} §3.1 渠道`,
    bpSection: '§5.3 渠道战略', targetLabel: `${DOC_VERSIONS.bp} §5.3 渠道战略`,
    content: '授权金¥300万、分成条款(HW15% SaaS35%)',
    trigger: '授权金/分成条款变化',
    checkFields: ['license_fee', 'hw_commission', 'saas_commission'],
  },
  {
    id: '§3.2→§5.4',
    displayLabel: `${DOC_VERSIONS.fp} §3.2 SOM → ${DOC_VERSIONS.bp} §5.4 SOM`,
    source: '§3.2', sourceLabel: `${DOC_VERSIONS.fp} §3.2 SOM`,
    bpSection: '§5.4 SOM章节 / §9.3', targetLabel: `${DOC_VERSIONS.bp} §5.4 SOM / §9.3`,
    content: '直销/经销商 C2/C3 部署计划、升级路径',
    trigger: '商业化速度变化',
    checkFields: ['cumulative_beds', 'som_penetration'],
  },
  {
    id: '§5→§9',
    displayLabel: `${DOC_VERSIONS.bp} §5 主表 → ${DOC_VERSIONS.bp} §9 融资`,
    source: '§5 主表', sourceLabel: `${DOC_VERSIONS.bp} §5 主表`,
    bpSection: '§9 融资与盈亏', targetLabel: `${DOC_VERSIONS.bp} §9 融资与盈亏`,
    content: 'EBITDA转正时间、融资窗口',
    trigger: '融资/利润预测变化',
    checkFields: ['ebitda', 'funding'],
  },
  {
    id: '§2.1→§11',
    displayLabel: `${DOC_VERSIONS.fp} §2.1 里程碑 → ${DOC_VERSIONS.bp} §11 时间表`,
    source: '§2.1', sourceLabel: `${DOC_VERSIONS.fp} §2.1 里程碑`,
    bpSection: '§11 里程碑', targetLabel: `${DOC_VERSIONS.bp} §11 时间表`,
    content: 'C2/C3注册时间、商业化部署节奏',
    trigger: '审批时点变化',
    checkFields: ['milestones'],
  },
  {
    id: '§3.2→§1.5',
    displayLabel: `${DOC_VERSIONS.fp} §3.2 SOM曲线 → ${DOC_VERSIONS.bp} §1.5 增长`,
    source: '§3.2 SOM曲线', sourceLabel: `${DOC_VERSIONS.fp} §3.2 SOM曲线`,
    bpSection: '§1.5 增长启动点', targetLabel: `${DOC_VERSIONS.bp} §1.5 增长启动点`,
    content: '"二类获批后即进入放量周期"',
    trigger: '增速假设变化',
    checkFields: ['growth_rates'],
  },
  {
    id: '§5.3→§1.5',
    displayLabel: `${DOC_VERSIONS.fp} §5.3 ARR → ${DOC_VERSIONS.bp} §1.5 ARR`,
    source: '§5.3 ARR公式', sourceLabel: `${DOC_VERSIONS.fp} §5.3 ARR公式`,
    bpSection: '§1.5 ARR数据', targetLabel: `${DOC_VERSIONS.bp} §1.5 ARR数据`,
    content: 'ARR = 活跃付费床位 × 年化单床SaaS收入',
    trigger: '续约率/单价变化',
    checkFields: ['arr', 'renewal_rate', 'saas_per_bed'],
  },
];

/** Sensitivity scenarios from BP §9.6 — recalculated from Y5=¥1,665万 baseline */
export const BP_SENSITIVITY = {
  optimistic: {
    label: '乐观(+15%)',
    y6_bed_growth: 0.616,
    y10_beds: 2896,
    y10_revenue: 7307,
    y10_ebitda: 2857,
    vs_base: '+18%',
  },
  neutral: {
    label: '基准',
    y6_bed_growth: 0.538,
    y10_beds: 2517,
    y10_revenue: 6182,
    y10_ebitda: 2420,
    vs_base: '基准',
  },
  conservative: {
    label: '保守(-15%)',
    y6_bed_growth: 0.458,
    y10_beds: 2139,
    y10_revenue: 5057,
    y10_ebitda: 1983,
    vs_base: '-18%',
  },
};

export const BP_DELAY_SCENARIOS = {
  best: { c2_approval: 'M14', c3_approval: 'M28', ebitda_positive: 'Y2', mitigation: '前置审评策略' },
  baseline: { c2_approval: 'M15', c3_approval: 'M29', ebitda_positive: 'Y2', mitigation: '沈如申NMPA导航' },
  conservative: { c2_approval: 'M17', c3_approval: 'M31', ebitda_positive: 'Y2(百特授权金支撑)', mitigation: 'Pre-A融资' },
  pessimistic: { c2_approval: 'M20', c3_approval: 'M36', ebitda_positive: 'Y3', mitigation: '降级版本+融资延期' },
};

/** Growth rate benchmark from BP §4.1 */
export const BP_GROWTH_BENCHMARK = {
  inferVISION: { pre_launch: '10–40%', post_2_5y: '50–80%', scale: '30–50%' },
  airdoc: { pre_launch: '20–50%', post_2_5y: '60–80%', scale: '25–40%' },
  aria: { pre_launch: '30%', post_2_5y: '30%', scale: '30%' },
};

// ============================================================
// Conflict Detection
// ============================================================

export interface DataConflict {
  field: string;
  year: number;  // 1-based year index, 0 = global
  bpValue: number | string;
  simValue: number | string;
  severity: 'critical' | 'warning' | 'info';
  mappingBlocks: string[];
  description: string;
}

/**
 * Compare simulator results against BP source-of-truth.
 * Returns list of conflicts for audit reporting.
 */
export function detectConflicts(result: CalcResult, globalRR: number, growthRates: number[]): DataConflict[] {
  const conflicts: DataConflict[] = [];
  const TOLERANCE = 0.05; // 5% tolerance for rounding

  // Compare Y1-Y10 revenue
  for (let i = 0; i < 10; i++) {
    const simRev = Math.round(result.years[i].total_revenue / 10000); // convert to 万
    const bpRev = BP_MAIN_TABLE.total_revenue[i];
    if (bpRev > 0 && Math.abs(simRev - bpRev) / bpRev > TOLERANCE) {
      conflicts.push({
        field: 'total_revenue',
        year: i + 1,
        bpValue: bpRev,
        simValue: simRev,
        severity: Math.abs(simRev - bpRev) / bpRev > 0.2 ? 'critical' : 'warning',
        mappingBlocks: ['§5→§1.5'],
        description: `Y${i + 1} 总收入: BP=${bpRev}万 vs 模拟器=${simRev}万`,
      });
    }
  }

  // Compare Y1-Y10 EBITDA
  for (let i = 0; i < 10; i++) {
    const simEbitda = Math.round(result.years[i].ebitda / 10000);
    const bpEbitda = BP_MAIN_TABLE.ebitda[i];
    const diff = Math.abs(simEbitda - bpEbitda);
    const threshold = Math.abs(bpEbitda) > 0 ? diff / Math.abs(bpEbitda) : (diff > 50 ? 1 : 0);
    if (threshold > TOLERANCE) {
      conflicts.push({
        field: 'ebitda',
        year: i + 1,
        bpValue: bpEbitda,
        simValue: simEbitda,
        severity: threshold > 0.2 ? 'critical' : 'warning',
        mappingBlocks: ['§5→§1.5', '§5→§9'],
        description: `Y${i + 1} EBITDA: BP=${bpEbitda}万 vs 模拟器=${simEbitda}万`,
      });
    }
  }

  // Compare cumulative beds
  for (let i = 0; i < 10; i++) {
    const simBeds = result.years[i].cumulative_beds;
    const bpBeds = BP_SOM.cumulative_beds[i];
    if (bpBeds > 0 && Math.abs(simBeds - bpBeds) / bpBeds > TOLERANCE) {
      conflicts.push({
        field: 'cumulative_beds',
        year: i + 1,
        bpValue: bpBeds,
        simValue: simBeds,
        severity: 'warning',
        mappingBlocks: ['§3.2→§5.4'],
        description: `Y${i + 1} 累计床位: BP=${bpBeds} vs 模拟器=${simBeds}`,
      });
    }
  }

  // Compare channel parameters
  if (Math.abs(globalRR - BP_CHANNEL.renewal_rate) > 0.001) {
    conflicts.push({
      field: 'renewal_rate',
      year: 0,
      bpValue: BP_CHANNEL.renewal_rate,
      simValue: globalRR,
      severity: 'critical',
      mappingBlocks: ['§5.3→§1.5'],
      description: `续约率: BP=${(BP_CHANNEL.renewal_rate * 100).toFixed(0)}% vs 模拟器=${(globalRR * 100).toFixed(0)}%`,
    });
  }

  // Compare growth rates (Y6-Y10 should all be 30%)
  const bpGrowth = 0.30;
  for (let i = 0; i < growthRates.length; i++) {
    if (Math.abs(growthRates[i] - bpGrowth) > 0.01) {
      conflicts.push({
        field: 'growth_rate',
        year: i + 6,
        bpValue: `${(bpGrowth * 100).toFixed(0)}%`,
        simValue: `${(growthRates[i] * 100).toFixed(0)}%`,
        severity: 'warning',
        mappingBlocks: ['§3.2→§1.5'],
        description: `Y${i + 6} 增长率: BP=30% vs 模拟器=${(growthRates[i] * 100).toFixed(0)}%`,
      });
    }
  }

  // Compare OpEx Y1-Y5
  for (let i = 0; i < 5; i++) {
    const simOpex = Math.round(result.years[i].opex / 10000);
    const bpOpex = BP_MAIN_TABLE.total_opex[i];
    if (bpOpex > 0 && Math.abs(simOpex - bpOpex) / bpOpex > TOLERANCE) {
      conflicts.push({
        field: 'total_opex',
        year: i + 1,
        bpValue: bpOpex,
        simValue: simOpex,
        severity: 'warning',
        mappingBlocks: ['§5→§1.5', '§5→§9'],
        description: `Y${i + 1} OpEx: BP=${bpOpex}万 vs 模拟器=${simOpex}万`,
      });
    }
  }

  // Compare net profit
  for (let i = 0; i < 10; i++) {
    const simNP = Math.round(result.years[i].net_profit / 10000);
    const bpNP = BP_MAIN_TABLE.net_profit[i];
    const diff = Math.abs(simNP - bpNP);
    const threshold = Math.abs(bpNP) > 0 ? diff / Math.abs(bpNP) : (diff > 50 ? 1 : 0);
    if (threshold > TOLERANCE) {
      conflicts.push({
        field: 'net_profit',
        year: i + 1,
        bpValue: bpNP,
        simValue: simNP,
        severity: threshold > 0.2 ? 'critical' : 'warning',
        mappingBlocks: ['§5→§1.5'],
        description: `Y${i + 1} 净利润: BP=${bpNP}万 vs 模拟器=${simNP}万`,
      });
    }
  }

  return conflicts.sort((a, b) => {
    const sevOrder = { critical: 0, warning: 1, info: 2 };
    return sevOrder[a.severity] - sevOrder[b.severity] || a.year - b.year;
  });
}

/**
 * Generate printable audit report from conflicts
 */
export function generateAuditReport(conflicts: DataConflict[], scenario: string): string {
  const now = new Date().toLocaleString('zh-CN');
  const lines: string[] = [
    `═══════════════════════════════════════════`,
    `ARIA 数据一致性审计报告`,
    `生成时间: ${now}`,
    `情景模式: ${scenario}`,
    `BP版本: v2.1 (2026-04-19)`,
    `═══════════════════════════════════════════`,
    ``,
  ];

  const critical = conflicts.filter(c => c.severity === 'critical');
  const warnings = conflicts.filter(c => c.severity === 'warning');

  lines.push(`总冲突: ${conflicts.length} (严重: ${critical.length}, 警告: ${warnings.length})`);
  lines.push(``);

  if (critical.length > 0) {
    lines.push(`── 严重冲突 ──────────────────────────────`);
    for (const c of critical) {
      lines.push(`[${c.mappingBlocks.join(',')}] ${c.description}`);
      lines.push(`  → BP章节影响: ${BP_MAPPING_BLOCKS.filter(b => c.mappingBlocks.includes(b.id)).map(b => b.bpSection).join(', ')}`);
      lines.push(`  → 建议: 以BP v2.1为准，调整模拟器参数或确认BP需要更新`);
      lines.push(``);
    }
  }

  if (warnings.length > 0) {
    lines.push(`── 警告 ──────────────────────────────────`);
    for (const c of warnings) {
      lines.push(`[${c.mappingBlocks.join(',')}] ${c.description}`);
    }
    lines.push(``);
  }

  if (conflicts.length === 0) {
    lines.push(`✓ 所有指标与BP v2.1一致，无冲突。`);
  }

  lines.push(`───────────────────────────────────────────`);
  lines.push(`映射块覆盖: 7个Source→BP章节映射`);
  lines.push(`检查范围: Y1-Y10 收入/EBITDA/净利润/OpEx/累计床位/续约率/增长率`);
  lines.push(`容差阈值: 5% (>20% 为严重)`);

  return lines.join('\n');
}
