// ARIA defaults — BPcc v3.2 full breakdown (April 2026)
import { GlobalInputs, YearlyInputs, OpExDetail, FundingInputs, MilestoneItem, ModelInputs, ScenarioOverrides, Scenario } from './calculator';

export const DEFAULT_GLOBAL: GlobalInputs = {
  price_hw_c2: 65000,
  price_hw_c3: 85000,
  price_upgrade: 25000,
  price_saas_c2: 25000,
  price_saas_c3: 40000,
  price_saas_c3_bulk: 35000,
  // COGS sub-items (C2 base BOM = 32000)
  bom_sensor: 9600,        // 传感器模组 30%
  bom_edge_compute: 8000,  // 边缘计算 25%
  bom_housing: 4800,       // 外壳结构 15%
  bom_cable_pcb: 4160,     // 线缆PCB 13%
  bom_assembly: 3200,      // 组装测试 10%
  bom_packaging: 2240,     // 包装物流 7%
  bom_c2: 32000,
  bom_c3: 21500,
  bom_upgrade: 28000,
  bom_c3_premium: -10500,  // mass production saves; net C3 = base + premium
  rr_base: 0.70,
  baxter_hw_commission: 0.15,
  baxter_saas_commission: 0.35,
  // Channel structured inputs
  license_amount: 3000000,    // 前期授权金 ¥300万
  license_year: 2,            // Y2 到账
  milestone_payment: 2000000, // 里程碑付款 ¥200万
  milestone_year: 3,          // Y3 到账
  value_anchor_c2: 62500,
  value_anchor_c3: 80000,
  post_class3_growth: 0.30,
  growth_y6: 0.30,
  growth_y7: 0.30,
  growth_y8: 0.30,
  growth_y9: 0.25,
  growth_y10: 0.25,
  sam_midpoint: 275000,           // 万元 = 27.5亿
  sensitivity_bed_swing: 0.15,    // ±15%
  // Salary breakdown
  headcount: [6, 12, 18, 25, 30],
  avg_salary: [270000, 144167, 152222, 144800, 137000],
};

// Best Case yearly inputs (BPccR2 §5.4 / §9.3)
export const DEFAULT_YEARLY: YearlyInputs = {
  direct_c2:       [  0,  80,   5,   0,   0],
  direct_c3:       [  0,   0,   0,  50,  60],
  baxter_c2:       [  0,  30,   0,   0,   0],
  baxter_c3:       [  0,   0,   0,  90, 120],
  planned_upgrade: [  0,   0,   0,  40,  50],
  depreciation:    [200000, 200000, 200000, 250000, 250000],
  baxter_license:  [3000000, 0, 2000000, 0, 0],
};

// Base Case yearly inputs (BPccR2 §5.4 / §9.2)
export const DEFAULT_YEARLY_BASE: YearlyInputs = {
  direct_c2:       [  0,   0,  60,   0,   0],
  direct_c3:       [  0,   0,   0,   0,  40],
  baxter_c2:       [  0,   0,  30,   0,   0],
  baxter_c3:       [  0,   0,   0,   0,  80],
  planned_upgrade: [  0,   0,   0,   0,  30],
  depreciation:    [200000, 200000, 200000, 200000, 250000],
  baxter_license:  [0, 3000000, 2000000, 0, 0],
};

export const DEFAULT_OPEX: OpExDetail = {
  salary:     [1620000, 1730000, 2740000, 3620000, 4110000],
  cdmo_nre:   [ 800000,       0,       0,       0,       0],
  pilot_bom:  [1280000,       0,       0,       0,       0],
  cro:        [ 300000,  800000,  400000,       0,       0],
  reg:        [ 350000,  150000,  350000,  100000,   50000],
  compliance: [ 200000,  150000,  200000,  250000,  300000],
  patent_ai:  [ 300000,  380000,  400000,  420000,  450000],
  travel_ops: [ 150000,  400000,  550000,  650000,  750000],
};

export const DEFAULT_FUNDING: FundingInputs = {
  seed_min: 5000000,
  seed_max: 6000000,
  seed_dilution: 0.175,
  preA_min: 3000000,
  preA_max: 5000000,
  preA_dilution: 0.10,
  seriesA_min: 0,
  seriesA_max: 5000000,
  seriesA_dilution: 0.10,
};

// Best Case milestones (BPccR2 §11.1)
export const DEFAULT_MILESTONES_BEST: MilestoneItem[] = [
  { id: 'seed',        desc: '种子轮融资完成',                    kpi: '¥500–600万到账',        type: '融资',   bold: false, startM: 1,  endM: 3,  predecessorId: null,     lagMonths: 0, manualStart: true },
  { id: 'cdmo',        desc: 'CDMO签约+功能原型',                 kpi: '原型验收通过',          type: '研发',   bold: false, startM: 4,  endM: 7,  predecessorId: null,     lagMonths: 0, manualStart: true },
  { id: 'iso',         desc: 'ISO13485质量体系联调',              kpi: '体系审核通过',          type: '注册',   bold: false, startM: 5,  endM: 7,  predecessorId: null,     lagMonths: 0, manualStart: true },
  { id: 'pilot',       desc: '2家医院40床科研部署',               kpi: '三模态数据采集通过',    type: '研发',   bold: false, startM: 10, endM: 12, predecessorId: 'cdmo',   lagMonths: 2, manualStart: false },
  { id: 'algo',        desc: '算法训练与测试',                    kpi: 'AUROC≥0.78',           type: '研发',   bold: false, startM: 8,  endM: 13, predecessorId: 'cdmo',   lagMonths: 0, manualStart: false },
  { id: 'baxter_sign', desc: '合作经销商渠道授权签约',            kpi: '授权金¥300万到账',      type: '商业化', bold: true,  startM: 8,  endM: 10, predecessorId: 'iso',    lagMonths: 0, manualStart: false },
  { id: 'c2_reg',      desc: '★ 二类医疗器械证获批',             kpi: '注册证到手 · 创新通道', type: '注册',   bold: true,  startM: 15, endM: 16, predecessorId: 'algo',   lagMonths: 1, manualStart: false },
  { id: 'c2_deploy',   desc: '110床C2商业化(直销80+经销商30)',    kpi: '部署率≥90%',           type: '商业化', bold: false, startM: 17, endM: 25, predecessorId: 'c2_reg', lagMonths: 0, manualStart: false },
  { id: 'baxter_m2',   desc: '经销商里程碑¥200万',               kpi: '里程碑付款',            type: '商业化', bold: false, startM: 26, endM: 28, predecessorId: 'c2_deploy', lagMonths: 0, manualStart: false },
  { id: 'c3_reg',      desc: '★ 三类注册证获批',                 kpi: '注册证到手',            type: '注册',   bold: true,  startM: 27, endM: 35, predecessorId: 'c2_deploy', lagMonths: 1, manualStart: false },
  { id: 'c3_deploy1',  desc: 'C3商业化 · 140床新增+40升级',       kpi: '累计290床',             type: '商业化', bold: false, startM: 36, endM: 47, predecessorId: 'c3_reg',    lagMonths: 0, manualStart: false },
  { id: 'c3_scale',    desc: '规模放量 · 180 C3新增+50升级',      kpi: '累计520床',             type: '商业化', bold: false, startM: 48, endM: 59, predecessorId: 'c3_deploy1', lagMonths: 0, manualStart: false },
  { id: 'c3_expand',   desc: '全面扩张 · 260 C3新增',             kpi: '累计780床',             type: '商业化', bold: false, startM: 60, endM: 71, predecessorId: 'c3_scale', lagMonths: 0, manualStart: false },
];

// Base Case milestones (BPccR2 §11.1)
export const DEFAULT_MILESTONES_BASE: MilestoneItem[] = [
  { id: 'seed',        desc: '种子轮融资完成',                    kpi: '¥500–600万到账',        type: '融资',   bold: false, startM: 1,  endM: 4,  predecessorId: null,     lagMonths: 0, manualStart: true },
  { id: 'cdmo',        desc: 'CDMO签约+功能原型',                 kpi: '原型验收通过',          type: '研发',   bold: false, startM: 5,  endM: 10, predecessorId: null,     lagMonths: 0, manualStart: true },
  { id: 'iso',         desc: 'ISO13485质量体系联调',              kpi: '体系审核通过',          type: '注册',   bold: false, startM: 11, endM: 16, predecessorId: 'cdmo',   lagMonths: 0, manualStart: false },
  { id: 'pilot',       desc: '2家医院40床科研部署',               kpi: '三模态数据采集通过',    type: '研发',   bold: false, startM: 11, endM: 13, predecessorId: 'cdmo',   lagMonths: 0, manualStart: false },
  { id: 'algo',        desc: '算法训练与测试',                    kpi: 'AUROC≥0.78',           type: '研发',   bold: false, startM: 11, endM: 18, predecessorId: 'cdmo',   lagMonths: 0, manualStart: false },
  { id: 'baxter_sign', desc: '合作经销商渠道授权签约',            kpi: '授权金¥300万到账',      type: '商业化', bold: true,  startM: 17, endM: 22, predecessorId: 'iso',    lagMonths: 0, manualStart: false },
  { id: 'c2_reg',      desc: '★ 二类医疗器械证获批',             kpi: '注册证到手 · 常规审评', type: '注册',   bold: true,  startM: 19, endM: 24, predecessorId: 'algo',   lagMonths: 0, manualStart: false },
  { id: 'c2_deploy',   desc: '90床C2商业化(直销60+经销商30)',     kpi: '部署率≥85%',           type: '商业化', bold: false, startM: 25, endM: 33, predecessorId: 'c2_reg', lagMonths: 0, manualStart: false },
  { id: 'baxter_m2',   desc: '经销商里程碑¥200万',               kpi: '里程碑付款',            type: '商业化', bold: false, startM: 34, endM: 36, predecessorId: 'c2_deploy', lagMonths: 0, manualStart: false },
  { id: 'c3_reg',      desc: '★ 三类注册证获批',                 kpi: '注册证到手',            type: '注册',   bold: true,  startM: 38, endM: 49, predecessorId: 'c2_deploy', lagMonths: 4, manualStart: false },
  { id: 'c3_deploy1',  desc: 'C3商业化 · 120床新增+30升级',       kpi: '累计240床',             type: '商业化', bold: false, startM: 50, endM: 61, predecessorId: 'c3_reg',    lagMonths: 0, manualStart: false },
  { id: 'c3_scale',    desc: '规模放量 · 150 C3新增+40升级',      kpi: '累计430床',             type: '商业化', bold: false, startM: 62, endM: 73, predecessorId: 'c3_deploy1', lagMonths: 0, manualStart: false },
  { id: 'c3_expand',   desc: '全面扩张 · 200 C3新增',             kpi: '累计630床',             type: '商业化', bold: false, startM: 74, endM: 85, predecessorId: 'c3_scale', lagMonths: 0, manualStart: false },
];

export const DEFAULT_ANNOTATIONS: Record<string, string> = {
  'pricing': 'BPccR2 §5.2 价值定价法 · C2按ICU监测市场替代定价 · C3按预警诊断增值溢价 · 大客户5年期享¥3.5万折扣',
  'bom': 'C2小批量BOM ¥3.2万 · C3量产BOM ¥2.15万(含传感器+边缘计算+外壳+PCB+组装+包装) · CDMO代工模式',
  'renewal': 'BPccR2 [注A13] 基准续约率70% · 中国医院SaaS付费培育期 · 乐观85% 保守55%',
  'baxter': '多经销商渠道: HW分成15% SaaS分成35% · 授权金¥300万+里程碑¥200万 · Best M8-10签约/Base M17-22',
  'opex': 'BPccR2 §9.4 OpEx拆分 · Y1含CDMO NRE ¥80万+样机BOM ¥128万 · 薪资按6人→12人→18人→25人→30人',
  'funding': '轻量融资策略 · Best种子轮¥500-600万即可覆盖至EBITDA转正 · Base需¥1,300万+',
  'milestones': 'BPccR2 §11.1 · Best M16二类获批→M35三类 · Base M24二类→M49三类 · M1=2026年7月',
  'deployment': 'Best: Y2直销80+经销商30=110 · Base: Y3直销60+经销商30=90 · Y4 Base为死亡谷(仅SaaS续约)',
  'roi': 'C2 ¥6.25万/床/年(ICU平均减少1.2天住院+降低并发症) · C3 ¥8万/床/年(预警+诊断双重价值)',
};

// ============================================================
// Scenario Overrides Presets
// ============================================================
export const DEFAULT_SCENARIO_OVERRIDES: Record<Scenario, ScenarioOverrides> = {
  neutral: {
    rr_base: 0.70,
    growth_y6: 0.30, growth_y7: 0.30, growth_y8: 0.30, growth_y9: 0.25, growth_y10: 0.25,
    bed_growth_factor: 1.0,
    opex_growth_y6: 0.33, opex_growth_y7: 0.25, opex_growth_y8: 0.24, opex_growth_y9: 0.21, opex_growth_y10: 0.22,
    cogs_rate_target: 0.34,
    salary_growth: 0.08,
    overhead_multiplier: 2.8,
  },
  optimistic: {
    rr_base: 0.85,
    growth_y6: 0.40, growth_y7: 0.38, growth_y8: 0.35, growth_y9: 0.32, growth_y10: 0.30,
    bed_growth_factor: 1.15,
    opex_growth_y6: 0.30, opex_growth_y7: 0.22, opex_growth_y8: 0.20, opex_growth_y9: 0.18, opex_growth_y10: 0.18,
    cogs_rate_target: 0.32,
    salary_growth: 0.05,
    overhead_multiplier: 2.5,
  },
  conservative: {
    rr_base: 0.55,
    growth_y6: 0.20, growth_y7: 0.20, growth_y8: 0.20, growth_y9: 0.18, growth_y10: 0.15,
    bed_growth_factor: 0.85,
    opex_growth_y6: 0.35, opex_growth_y7: 0.28, opex_growth_y8: 0.26, opex_growth_y9: 0.24, opex_growth_y10: 0.24,
    cogs_rate_target: 0.36,
    salary_growth: 0.10,
    overhead_multiplier: 3.2,
  },
};

export const DEFAULT_MODEL: ModelInputs = {
  global: DEFAULT_GLOBAL,
  yearly: DEFAULT_YEARLY,
  yearly_base: DEFAULT_YEARLY_BASE,
  opex: DEFAULT_OPEX,
  funding: DEFAULT_FUNDING,
  milestones_best: DEFAULT_MILESTONES_BEST,
  milestones_base: DEFAULT_MILESTONES_BASE,
  annotations: DEFAULT_ANNOTATIONS,
  active_scenario: 'neutral',
  active_timeline: 'aggressive',
  scenario_overrides: structuredClone(DEFAULT_SCENARIO_OVERRIDES),
};

// BPccR2 §9.2 Best Case targets (万元)
export const BP_TARGETS = {
  total_revenue: [300, 560, 420, 910, 1280, 0, 0, 0, 0, 0],
  total_cogs:    [0, 280, 50, 360, 410, 0, 0, 0, 0, 0],
  gross_profit:  [300, 280, 370, 550, 870, 0, 0, 0, 0, 0],
  opex:          [480, 360, 460, 500, 560, 0, 0, 0, 0, 0],
  ebitda:        [-180, -80, -90, 50, 310, 0, 0, 0, 0, 0],
  net_profit:    [-200, -100, -110, 25, 285, 0, 0, 0, 0, 0],
};

export const YEAR_LABELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10'];
export const YEAR_LABELS_SHORT = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10'];
export const MONTH_LABELS = ['M1–12', 'M13–24', 'M25–36', 'M37–48', 'M49–60', 'M61–72', 'M73–84', 'M85–96', 'M97–108', 'M109–120'];
export const PHASE_LABELS = ['原型+试点', '二类商业化', '三类商业化', '规模放量', '全面扩张', '全国拓展', '深度渗透', '平台升级', '生态延伸', '稳态运营'];

export const OPEX_LABELS: Record<keyof OpExDetail, string> = {
  salary: '薪资社保',
  cdmo_nre: 'CDMO NRE',
  pilot_bom: '试产样机BOM',
  cro: 'CRO/临床',
  reg: '注册审评',
  compliance: '合规质量',
  patent_ai: '专利/咨询/AI',
  travel_ops: '差旅/运营/CMO',
};

export const COGS_LABELS: Record<string, string> = {
  bom_sensor: '传感器模组',
  bom_edge_compute: '边缘计算模块',
  bom_housing: '外壳结构件',
  bom_cable_pcb: '线缆/PCB',
  bom_assembly: '组装测试',
  bom_packaging: '包装物流',
  bom_c3_premium: 'C3额外成本',
};
