// Finance Simulator is the Single Source of Truth (2026-04-19)
// BP / Financial Plan are downstream documents that must align with simulator output.
// This module holds Financial Plan v2.3 reference data for conflict detection.
// for conflict detection and audit.

import { CalcResult } from './calculator';

/** Financial Plan v2.3 10-year financial main table (万元) */
export const BP_MAIN_TABLE = {
  total_revenue:  [0, 879, 3399, 8424, 11267, 14647, 19041, 24753, 30942, 38677],
  license_milestone: [0, 300, 200, 0, 0, 0, 0, 0, 0, 0],
  commercial_revenue: [0, 579, 3199, 8424, 11267, 14647, 19041, 24753, 30942, 38677],
  total_cogs:     [0, 64, 372, 999, 954, 4980, 6474, 8416, 10520, 13150],
  cogs_rate:      [0, 0.07, 0.11, 0.12, 0.08, 0.34, 0.34, 0.34, 0.34, 0.34],
  gross_profit:   [0, 815, 3027, 7425, 10313, 9667, 12567, 16337, 20421, 25527],
  gross_margin:   [0, 0.93, 0.89, 0.88, 0.92, 0.66, 0.66, 0.66, 0.66, 0.66],
  total_opex:     [578, 716, 1054, 1202, 1355, 1694, 2117, 2625, 3177, 3875],
  ebitda:         [-578, 99, 1973, 6223, 8958, 7973, 10450, 13712, 17245, 21651],
  ebitda_margin:  [0, 0.11, 0.58, 0.74, 0.80, 0.54, 0.55, 0.55, 0.56, 0.56],
  net_profit:     [-598, 74, 1948, 6193, 8928, 7934, 10399, 13646, 17162, 21548],
  arr:            [0, 718, 5368, 12158, 18035, 22408, 28403, 36415, 46155, 58140],
};

/** Financial Plan v2.3 SOM growth curve */
export const BP_SOM = {
  cumulative_beds:  [0, 287, 2033, 4393, 7403, 11316, 16403, 23016, 31282, 41615],
  active_paying:    [0, 287, 2147, 4863, 7214, 8963, 11361, 14566, 18462, 23256],
  som_penetration:  [0, 0.0032, 0.0124, 0.0306, 0.0410, 0.0533, 0.0692, 0.0900, 0.1125, 0.1406],
  yoy_growth:       [0, 0, 2.866, 1.478, 0.338, 0.30, 0.30, 0.30, 0.25, 0.25],
};

/** Channel parameters from BP §3.1 */
export const BP_CHANNEL = {
  license_fee: 300,  // 万元
  milestone_fee: 200, // 万元
  hw_commission: 0.15,
  saas_commission: 0.35,
  renewal_rate: 0.85,
  saas_per_bed: 2.5, // 万元/bed/year
};

/** Funding plan from Financial Plan v2.3 §7 */
export const BP_FUNDING = {
  seed: { min: 600, max: 800, desc: '种子轮' },
  preA: { min: 400, max: 600, desc: 'Pre-A' },
  seriesA: { min: 0, max: 0, desc: 'A轮(可选)' },
};

/** Roadshow slide data points that should be live-linked to simulator output */
export const ROADSHOW_DATA_POINTS = [
  // EBITDA
  { slideId: 's9',  field: 'ebitda-positive',      label: 'EBITDA转正时点',        bpValue: '第 4 年' },
  { slideId: 's16', field: 'ebitda-year-inline',    label: 'EBITDA转正(内联)',       bpValue: 'Year 4' },
  // Revenue totals
  { slideId: 's17', field: 'y2-revenue',            label: 'Y2总收入',              bpValue: '¥464 万' },
  { slideId: 's17', field: 'y3-revenue',            label: 'Y3总收入',              bpValue: '¥341 万' },
  { slideId: 's17', field: 'y4-revenue',            label: 'Y4总收入',              bpValue: '¥883 万' },
  { slideId: 's16', field: 'y5-revenue',            label: 'Y5总收入',              bpValue: '¥1,220 万' },
  { slideId: 's17', field: 'y5-revenue-detail',     label: 'Y5总收入(详情)',         bpValue: '¥1,220 万' },
  { slideId: 's16', field: 'y10-revenue',           label: 'Y10总收入',             bpValue: '¥4,189 万' },
  { slideId: 's16', field: 'y10-ebitda',            label: 'Y10 EBITDA',            bpValue: '¥1,042 万' },
  // Y2 revenue description
  { slideId: 's17', field: 'y2-revenue-desc',       label: 'Y2收入结构描述',         bpValue: '硬件直销 ¥345 万；授权金 + 里程碑 ¥0；SaaS 及分成收入开始形成。' },
  // Bed counts
  { slideId: 's17', field: 'y2-beds',               label: 'Y2累计床位',            bpValue: '73 床' },
  { slideId: 's17', field: 'y3-beds',               label: 'Y3累计床位',            bpValue: '78 床' },
  { slideId: 's17', field: 'y4-beds',               label: 'Y4累计床位',            bpValue: '218 床' },
  { slideId: 's17', field: 'y5-beds',               label: 'Y5累计床位',            bpValue: '398 床' },
  { slideId: 's9',  field: 'y2-beds-inline',        label: 'Y2床位(内联)',           bpValue: '73' },
  { slideId: 's9',  field: 'beds-expansion-desc',   label: '床位扩张描述',           bpValue: '78 → 218 → 398' },
  // Bar chart percentages
  { slideId: 's17', field: 'y2-beds-pct',           label: 'Y2进度条%',             bpValue: '18' },
  { slideId: 's17', field: 'y3-beds-pct',           label: 'Y3进度条%',             bpValue: '20' },
  { slideId: 's17', field: 'y4-beds-pct',           label: 'Y4进度条%',             bpValue: '55' },
  { slideId: 's17', field: 'y5-beds-pct',           label: 'Y5进度条%',             bpValue: '100' },
  // Pricing
  { slideId: 's10', field: 'c2-hw-price',           label: 'C2硬件定价',            bpValue: '¥6.5 万 / 床' },
  { slideId: 's10', field: 'c2-saas-price',         label: 'C2 SaaS定价',           bpValue: '¥2.5 万 / 床 / 年' },
  { slideId: 's10', field: 'c3-hw-price',           label: 'C3硬件定价',            bpValue: '¥8.5 万 / 床' },
  { slideId: 's10', field: 'c3-saas-price',         label: 'C3 SaaS定价',           bpValue: '¥4.0 万 / 床 / 年' },
  { slideId: 's10', field: 'c3-saas-bulk',          label: 'C3 SaaS五年期折扣',     bpValue: '¥3.5 万' },
  { slideId: 's10', field: 'c2-hw-tbl',             label: 'C2硬件(表)',            bpValue: '¥6.5 万' },
  { slideId: 's10', field: 'c3-hw-tbl',             label: 'C3硬件(表)',            bpValue: '¥8.5 万' },
  { slideId: 's10', field: 'c2-saas-tbl',           label: 'C2 SaaS(表)',           bpValue: '¥2.5 万 / 年' },
  { slideId: 's10', field: 'c3-saas-tbl',           label: 'C3 SaaS(表)',           bpValue: '¥4.0 万 / 年' },
  { slideId: 's10', field: 'upgrade-tbl',           label: '升级定价(表)',           bpValue: '¥2.5 万 / 床' },
  // ROI
  { slideId: 's10', field: 'roi-c2-new',            label: 'C2新购ROI',             bpValue: '+34%' },
  { slideId: 's10', field: 'roi-c2-cost',           label: 'C2年化费用',            bpValue: '年化费用 ¥4.7 万 / 床' },
  { slideId: 's10', field: 'roi-c2-anchor',         label: 'C2价值锚点',            bpValue: '价值锚点 ¥6.3 万 / 床 / 年' },
  { slideId: 's10', field: 'roi-c3-new',            label: 'C3新购ROI',             bpValue: '+17%' },
  { slideId: 's10', field: 'roi-c3-cost',           label: 'C3年化费用',            bpValue: '年化费用 ¥6.8 万 / 床' },
  { slideId: 's10', field: 'roi-c3-anchor',         label: 'C3价值锚点',            bpValue: '价值锚点 ¥8.0 万 / 床 / 年' },
  { slideId: 's10', field: 'roi-c3u',               label: 'C3升级ROI',             bpValue: '+66%' },
  { slideId: 's10', field: 'roi-c3u-cost',          label: 'C3升级年化费用',         bpValue: '年化费用 ¥4.8 万 / 床' },
  { slideId: 's10', field: 'roi-c3u-anchor',        label: 'C3升级价值锚点',         bpValue: '价值锚点 ¥8.0 万 / 床 / 年' },
  { slideId: 's10', field: 'roi-c3-5yr',            label: 'C3五年期ROI',            bpValue: '+20%' },
  // Revenue breakdown (from simulator neutral + best case)
  { slideId: 's17', field: 'rev-hw-y2',             label: 'Y2硬件直销',            bpValue: '¥345 万' },
  { slideId: 's17', field: 'rev-hw-y3',             label: 'Y3硬件直销',            bpValue: '¥33 万' },
  { slideId: 's17', field: 'rev-hw-y5',             label: 'Y5硬件直销',            bpValue: '¥510 万' },
  { slideId: 's17', field: 'rev-hwshare-y2',        label: 'Y2硬件分成',            bpValue: '¥20 万' },
  { slideId: 's17', field: 'rev-hwshare-y3',        label: 'Y3硬件分成',            bpValue: '¥0' },
  { slideId: 's17', field: 'rev-hwshare-y5',        label: 'Y5硬件分成',            bpValue: '¥153 万' },
  { slideId: 's17', field: 'rev-upgrade-y2',        label: 'Y2升级收入',            bpValue: '¥0' },
  { slideId: 's17', field: 'rev-upgrade-y3',        label: 'Y3升级收入',            bpValue: '¥0' },
  { slideId: 's17', field: 'rev-upgrade-y5',        label: 'Y5升级收入',            bpValue: '¥68 万' },
  { slideId: 's17', field: 'rev-saas-y2',           label: 'Y2 SaaS直销',           bpValue: '¥88 万' },
  { slideId: 's17', field: 'rev-saas-y3',           label: 'Y3 SaaS直销',           bpValue: '¥96 万' },
  { slideId: 's17', field: 'rev-saas-y5',           label: 'Y5 SaaS直销',           bpValue: '¥312 万' },
  { slideId: 's17', field: 'rev-saasshare-y2',      label: 'Y2 SaaS分成',           bpValue: '¥12 万' },
  { slideId: 's17', field: 'rev-saasshare-y3',      label: 'Y3 SaaS分成',           bpValue: '¥12 万' },
  { slideId: 's17', field: 'rev-saasshare-y5',      label: 'Y5 SaaS分成',           bpValue: '¥178 万' },
  { slideId: 's17', field: 'rev-license-y2',        label: 'Y2授权金+里程碑',        bpValue: '¥0' },
  { slideId: 's17', field: 'rev-license-y3',        label: 'Y3授权金+里程碑',        bpValue: '¥200 万' },
  { slideId: 's17', field: 'rev-license-y5',        label: 'Y5授权金+里程碑',        bpValue: '¥0' },
  // Funding
  { slideId: 's16', field: 'seed-range',            label: '种子轮金额',            bpValue: '¥500-600 万' },
  { slideId: 's16', field: 'preA-range',            label: 'Pre-A金额',             bpValue: '¥300-500 万' },
  { slideId: 's16', field: 'seriesA-range',         label: 'A轮金额',               bpValue: '¥0-500 万' },
  // Rates
  { slideId: 's10', field: 'renewal-rate',          label: '续约率',                bpValue: '70%' },
  { slideId: 's10', field: 'hw-commission',         label: '硬件分成比例',           bpValue: '15%' },
  { slideId: 's10', field: 'saas-commission',       label: 'SaaS分成比例',           bpValue: '35%' },
  // SOM chart
  { slideId: 's16', field: 'som-chart-beds',        label: 'SOM曲线(床位)',          bpValue: '[0,73,78,218,398,632,936,1331,1825,2443]' },
];

/** Document version constants — update here when files change */
export const DOC_VERSIONS = {
  bp: 'BP V2.3',         // ARIA_BP_External_clean.md
  fp: 'FP V2.3',         // ARIA_Financial_Plan
  bpFile: 'ARIA_BP_External_clean.md',
  fpFile: 'ARIA_Financial_Plan_v2.3 (1).md',
  dataGovernance: 'Simulator is Single Source of Truth',
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

/** Roadshow → Simulator mapping blocks for audit display */
export const ROADSHOW_MAPPING_BLOCKS: MappingBlockDetail[] = [
  {
    id: 'RS-s9',
    displayLabel: '路演 s9 市场机会 → Simulator',
    source: 's9', sourceLabel: '路演 s9 市场机会',
    bpSection: 'EBITDA + SOM', targetLabel: 'Simulator 财务主表',
    content: 'EBITDA转正时点、Y2首轮床位数、Y3-Y5床位扩张曲线描述',
    trigger: '部署计划/EBITDA变化',
    checkFields: ['ebitda-positive', 'y2-beds-inline', 'beds-expansion-desc'],
  },
  {
    id: 'RS-s10',
    displayLabel: '路演 s10 商业模式 → Simulator',
    source: 's10', sourceLabel: '路演 s10 商业模式',
    bpSection: '定价 + ROI', targetLabel: 'Simulator 定价参数',
    content: 'C2/C3硬件定价、SaaS定价、升级定价、ROI、渠道分成比例',
    trigger: '定价/渠道条款变化',
    checkFields: ['c2-hw-price', 'c3-hw-price', 'c2-saas-price', 'c3-saas-price', 'roi-c2-new', 'roi-c3-new', 'roi-c3u'],
  },
  {
    id: 'RS-s16',
    displayLabel: '路演 s16 融资与SOM → Simulator',
    source: 's16', sourceLabel: '路演 s16 融资与SOM曲线',
    bpSection: 'SOM + 融资', targetLabel: 'Simulator SOM + 融资参数',
    content: 'SOM十年曲线、融资轮次金额、EBITDA转正年份、Y5总收入',
    trigger: 'SOM/融资/收入变化',
    checkFields: ['som-chart-beds', 'seed-range', 'preA-range', 'y5-revenue', 'ebitda-year-inline'],
  },
  {
    id: 'RS-s17',
    displayLabel: '路演 s17 收入结构 → Simulator',
    source: 's17', sourceLabel: '路演 s17 收入结构与盈利路径',
    bpSection: '收入拆解', targetLabel: 'Simulator 收入计算',
    content: 'Y2-Y5收入总额、床位部署节奏条形图、六项收入明细(Y2/Y3/Y5)',
    trigger: '任何收入/床位参数变化',
    checkFields: ['y2-revenue', 'y3-revenue', 'y5-revenue-detail', 'y2-beds', 'y5-beds', 'rev-hw-y2', 'rev-saas-y5'],
  },
];

/** Sensitivity scenarios from BP v2.2 §9.6 — from simulator sensitivity runs */
export const BP_SENSITIVITY = {
  optimistic: {
    label: '乐观(rr=85%)',
    y10_beds: 398,
    y4_ebitda: 378,
    y5_ebitda: 797,
    y10_revenue: 6961,
    y10_ebitda: 3233,
    vs_base: 'rr=85%',
  },
  neutral: {
    label: '基准(rr=70%)',
    y10_beds: 398,
    y4_ebitda: 237,
    y5_ebitda: 502,
    y10_revenue: 4189,
    y10_ebitda: 1042,
    vs_base: '基准',
  },
  conservative: {
    label: '保守(rr=55%)',
    y10_beds: 398,
    y4_ebitda: 84,
    y5_ebitda: 257,
    y10_revenue: 2383,
    y10_ebitda: -150,
    vs_base: 'rr=55%',
  },
};

export const BP_DELAY_SCENARIOS = {
  best: { c2_approval: 'M16', c3_approval: 'M35', ebitda_positive: 'Y4', mitigation: '创新通道策略' },
  baseline: { c2_approval: 'M16', c3_approval: 'M35', ebitda_positive: 'Y4', mitigation: '沈如申NMPA导航' },
  conservative: { c2_approval: 'M24', c3_approval: 'M49', ebitda_positive: 'Y5(边际转正)', mitigation: 'Pre-A融资' },
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

  // Compare growth rates (Y6-Y10: neutral scenario 30/30/30/25/25)
  const bpGrowthRates = [0.30, 0.30, 0.30, 0.25, 0.25];
  for (let i = 0; i < growthRates.length; i++) {
    const expected = bpGrowthRates[i] ?? 0.30;
    if (Math.abs(growthRates[i] - expected) > 0.01) {
      conflicts.push({
        field: 'growth_rate',
        year: i + 6,
        bpValue: `${(expected * 100).toFixed(0)}%`,
        simValue: `${(growthRates[i] * 100).toFixed(0)}%`,
        severity: 'warning',
        mappingBlocks: ['§3.2→§1.5'],
        description: `Y${i + 6} 增长率: BP=${(expected * 100).toFixed(0)}% vs 模拟器=${(growthRates[i] * 100).toFixed(0)}%`,
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
    `BP版本: v2.3 (2026-04-19) — Simulator is Source of Truth`,
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
      lines.push(`  → 建议: 确认模拟器参数是否正确，若正确则更新BP对应章节`);
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
    lines.push(`✓ 所有指标与BP v2.3一致，无冲突。（Simulator is Source of Truth）`);
  }

  lines.push(`───────────────────────────────────────────`);
  lines.push(`映射块覆盖: 7个Source→BP章节映射`);
  lines.push(`检查范围: Y1-Y10 收入/EBITDA/净利润/OpEx/累计床位/续约率/增长率`);
  lines.push(`容差阈值: 5% (>20% 为严重)`);
  lines.push(`数据治理: Finance Simulator is Single Source of Truth`);

  return lines.join('\n');
}
