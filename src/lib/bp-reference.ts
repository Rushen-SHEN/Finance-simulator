// BP Source of Truth — ARIA_Financial_Plan_latest.md v2.1 (2026-04-19)
// This module holds the canonical BP data for conflict detection and audit

import { CalcResult } from './calculator';

/** BP v2.1 10-year financial main table (万元) */
export const BP_MAIN_TABLE = {
  total_revenue:  [0, 932, 1212, 1576, 2049, 2664, 3463, 4502, 5853, 7609],
  license_milestone: [0, 300, 200, 0, 0, 0, 0, 0, 0, 0],
  commercial_revenue: [0, 632, 1012, 1576, 2049, 2664, 3463, 4502, 5853, 7609],
  total_cogs:     [0, 354, 485, 599, 697, 906, 1177, 1531, 1990, 2587],
  cogs_rate:      [0, 0.38, 0.40, 0.38, 0.34, 0.34, 0.34, 0.34, 0.34, 0.34],
  gross_profit:   [0, 578, 727, 977, 1352, 1758, 2286, 2971, 3863, 5022],
  gross_margin:   [0, 0.62, 0.60, 0.62, 0.66, 0.66, 0.66, 0.66, 0.66, 0.66],
  total_opex:     [480, 361, 464, 504, 566, 755, 940, 1170, 1420, 1730],
  ebitda:         [-480, 217, 263, 473, 786, 1003, 1346, 1801, 2443, 3292],
  ebitda_margin:  [0, 0.23, 0.22, 0.30, 0.38, 0.38, 0.39, 0.40, 0.42, 0.43],
  net_profit:     [-500, 192, 241, 434, 742, 914, 1195, 1581, 2106, 2798],
  arr:            [0, 54, 142, 255, 383, 588, 833, 1078, 1274, 1470],
};

/** BP v2.1 SOM growth curve */
export const BP_SOM = {
  cumulative_beds:  [0, 110, 290, 520, 780, 1200, 1700, 2200, 2600, 3000],
  active_paying:    [0, 77, 203, 364, 546, 840, 1190, 1540, 1820, 2100],
  som_penetration:  [0, 0.0034, 0.0044, 0.0057, 0.0075, 0.0097, 0.0126, 0.0164, 0.0213, 0.0277],
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

/** Funding plan from BP §9 */
export const BP_FUNDING = {
  seed: { min: 500, max: 600, desc: 'CDMO NRE、40台样机、薪资与注册前准备' },
  preA: { min: 300, max: 500, desc: '二类获批后商业化启动与渠道放大' },
  seriesA: { min: 0, max: 500, desc: '用于加速扩张，非生存必需' },
};

/** Roadshow slide data points that should be live-linked */
export const ROADSHOW_DATA_POINTS = [
  { slideId: 's9',  field: 'ebitda_positive_year', label: 'EBITDA转正时点', bpValue: 'Year 2', unit: '' },
  { slideId: 's16', field: 'y5_revenue',           label: 'Y5总收入',      bpValue: '¥2,049万', unit: '万' },
  { slideId: 's16', field: 'som_y1_beds',          label: 'Y1累计床位',    bpValue: '0',  unit: '床' },
  { slideId: 's16', field: 'som_y2_beds',          label: 'Y2累计床位',    bpValue: '110',  unit: '床' },
  { slideId: 's16', field: 'som_y3_beds',          label: 'Y3累计床位',    bpValue: '290',  unit: '床' },
  { slideId: 's16', field: 'som_y4_beds',          label: 'Y4累计床位',    bpValue: '520',  unit: '床' },
  { slideId: 's16', field: 'som_y5_beds',          label: 'Y5累计床位',    bpValue: '780',  unit: '床' },
  { slideId: 's17', field: 'y2_revenue',           label: 'Y2总收入',      bpValue: '¥932万', unit: '万' },
  { slideId: 's17', field: 'y3_revenue',           label: 'Y3总收入',      bpValue: '¥1,212万', unit: '万' },
  { slideId: 's17', field: 'y5_revenue_detail',    label: 'Y5总收入(详情页)', bpValue: '¥1,665万', unit: '万' },
];

/** Source → BP Section mapping block definitions with full detail from BP */
export interface MappingBlockDetail {
  id: string;
  source: string;
  bpSection: string;
  content: string;
  trigger: string;
  checkFields: string[];
}

export const BP_MAPPING_BLOCKS: MappingBlockDetail[] = [
  {
    id: 'M-01', source: '§5 主表', bpSection: '§1.5 摘要',
    content: 'Y2/Y5/Y10 收入、EBITDA、ARR、SOM',
    trigger: '任一核心财务指标变化',
    checkFields: ['total_revenue', 'ebitda', 'net_profit', 'arr'],
  },
  {
    id: 'M-02', source: '§3.1', bpSection: '§5.3 渠道战略',
    content: '授权金¥300万、分成条款(HW15% SaaS35%)',
    trigger: '授权金/分成条款变化',
    checkFields: ['license_fee', 'hw_commission', 'saas_commission'],
  },
  {
    id: 'M-03', source: '§3.2', bpSection: '§5.4 SOM章节',
    content: 'Y5/Y10 SOM穿透率、累计床位',
    trigger: '商业化速度变化',
    checkFields: ['cumulative_beds', 'som_penetration'],
  },
  {
    id: 'M-04', source: '§5 主表', bpSection: '§9 融资规划',
    content: '年度EBITDA、融资窗口',
    trigger: '融资/利润预测变化',
    checkFields: ['ebitda', 'funding'],
  },
  {
    id: 'M-05', source: '§2.1', bpSection: '§11 里程碑',
    content: '年度监管+商业里程碑表',
    trigger: '审批时点变化',
    checkFields: ['milestones'],
  },
  {
    id: '§3.2→§1.5', source: '§3.2 SOM曲线', bpSection: '§1.5 增长启动点',
    content: '"二类获批后即进入放量周期"',
    trigger: '增速假设变化',
    checkFields: ['growth_rates'],
  },
  {
    id: '§5.3→§1.5', source: '§5.3 ARR公式', bpSection: '§1.5 ARR数据',
    content: 'ARR = 活跃付费床位 × 年化单床SaaS收入',
    trigger: '续约率/单价变化',
    checkFields: ['arr', 'renewal_rate', 'saas_per_bed'],
  },
];

/** Sensitivity scenarios from BP §6 */
export const BP_SENSITIVITY = {
  optimistic: {
    label: '乐观(+15%)',
    y6_bed_growth: 0.616,
    y10_beds: 3450,
    y10_revenue: 8979,
    y10_ebitda: 3885,
    vs_base: '+18%',
  },
  neutral: {
    label: '基准',
    y6_bed_growth: 0.538,
    y10_beds: 3000,
    y10_revenue: 7609,
    y10_ebitda: 3292,
    vs_base: '基准',
  },
  conservative: {
    label: '保守(-15%)',
    y6_bed_growth: 0.458,
    y10_beds: 2550,
    y10_revenue: 6239,
    y10_ebitda: 2699,
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
