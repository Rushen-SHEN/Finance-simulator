// ARIA defaults — BPcc v3.1 full breakdown (April 2026)
import { GlobalInputs, YearlyInputs, OpExDetail, FundingInputs, MilestoneItem, ModelInputs } from './calculator';

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
  value_anchor_c2: 62500,
  value_anchor_c3: 80000,
};

export const DEFAULT_YEARLY: YearlyInputs = {
  direct_c2:       [  0,  80,  50,   0,   0],
  direct_c3:       [  0,   0,  30,  60,  60],
  baxter_c2:       [  0,  30,   0,   0,   0],
  baxter_c3:       [  0,   0,  60, 120, 200],
  planned_upgrade: [  0,   0,  40,  50,   0],
  depreciation:    [200000, 250000, 250000, 300000, 300000],
  baxter_license:  [0, 3000000, 2000000, 0, 0],
};

export const DEFAULT_OPEX: OpExDetail = {
  salary:     [1420000, 1730000, 2740000, 3620000, 4110000],
  cdmo_nre:   [ 800000,       0,       0,       0,       0],
  pilot_bom:  [1280000,       0,       0,       0,       0],
  cro:        [ 300000,  800000,  400000,       0,       0],
  reg:        [ 350000,  150000,  350000,  100000,   50000],
  compliance: [ 200000,  150000,  200000,  250000,  300000],
  patent_ai:  [ 300000,  380000,  400000,  420000,  450000],
  travel_ops: [ 150000,  400000,  550000,  650000,  750000],
};

export const DEFAULT_FUNDING: FundingInputs = {
  seed_min: 4000000,
  seed_max: 6000000,
  seed_dilution: 0.175,
  preA_min: 4000000,
  preA_max: 6000000,
  preA_dilution: 0.10,
  seriesA_min: 0,
  seriesA_max: 4000000,
  seriesA_dilution: 0.10,
};

export const DEFAULT_MILESTONES_BEST: MilestoneItem[] = [
  { id: 'seed',        desc: '种子轮融资完成',                    kpi: '¥400–600万到账',        type: '融资',   bold: false, startM: 1,  endM: 3,  predecessorId: null,     lagMonths: 0, manualStart: true },
  { id: 'cdmo',        desc: 'CDMO签约+功能原型',                 kpi: '原型验收通过',          type: '研发',   bold: false, startM: 1,  endM: 6,  predecessorId: null,     lagMonths: 0, manualStart: true },
  { id: 'pilot',       desc: '2家医院40床科研部署',               kpi: '三模态数据采集通过',    type: '研发',   bold: false, startM: 4,  endM: 6,  predecessorId: 'cdmo',   lagMonths: -3, manualStart: false },
  { id: 'algo',        desc: '算法训练与测试',                    kpi: 'AUROC≥0.78',           type: '研发',   bold: false, startM: 7,  endM: 12, predecessorId: 'cdmo',   lagMonths: 0, manualStart: false },
  { id: 'iso',         desc: 'ISO13485质量体系联调',              kpi: '体系审核通过',          type: '注册',   bold: false, startM: 9,  endM: 12, predecessorId: 'cdmo',   lagMonths: 2, manualStart: false },
  { id: 'baxter_sign', desc: 'Baxter渠道授权签约',               kpi: '授权金¥300万到账',      type: '商业化', bold: true,  startM: 13, endM: 15, predecessorId: 'iso',    lagMonths: 0, manualStart: false },
  { id: 'c2_reg',      desc: '★ 二类医疗器械证获批',             kpi: '注册证到手 · 创新通道', type: '注册',   bold: true,  startM: 14, endM: 15, predecessorId: 'iso',    lagMonths: 1, manualStart: false },
  { id: 'c2_deploy',   desc: '110床C2商业化(直销80+Baxter30)',    kpi: '部署率≥90%',           type: '商业化', bold: false, startM: 16, endM: 24, predecessorId: 'c2_reg', lagMonths: 0, manualStart: false },
  { id: 'baxter_m2',   desc: 'Baxter里程碑¥200万',               kpi: '里程碑付款',            type: '商业化', bold: false, startM: 25, endM: 27, predecessorId: 'c2_deploy', lagMonths: 0, manualStart: false },
  { id: 'c3_reg',      desc: '★ 三类注册证获批',                 kpi: '注册证到手',            type: '注册',   bold: true,  startM: 28, endM: 31, predecessorId: 'c2_deploy', lagMonths: 3, manualStart: false },
  { id: 'c3_deploy1',  desc: 'C3商业化 · 140床新增+40升级',       kpi: '累计290床',             type: '商业化', bold: false, startM: 25, endM: 36, predecessorId: 'c2_deploy', lagMonths: 0, manualStart: false },
  { id: 'c3_scale',    desc: '规模放量 · 180 C3新增+50升级',      kpi: '累计520床',             type: '商业化', bold: false, startM: 37, endM: 48, predecessorId: 'c3_deploy1', lagMonths: 0, manualStart: false },
  { id: 'c3_expand',   desc: '全面扩张 · 260 C3新增',             kpi: '累计780床',             type: '商业化', bold: false, startM: 49, endM: 60, predecessorId: 'c3_scale', lagMonths: 0, manualStart: false },
];

export const DEFAULT_MILESTONES_BASE: MilestoneItem[] = [
  { id: 'seed',        desc: '种子轮融资完成',                    kpi: '¥400–600万到账',        type: '融资',   bold: false, startM: 1,  endM: 4,  predecessorId: null,     lagMonths: 0, manualStart: true },
  { id: 'cdmo',        desc: 'CDMO签约+功能原型',                 kpi: '原型验收通过',          type: '研发',   bold: false, startM: 1,  endM: 8,  predecessorId: null,     lagMonths: 0, manualStart: true },
  { id: 'pilot',       desc: '2家医院40床科研部署',               kpi: '三模态数据采集通过',    type: '研发',   bold: false, startM: 5,  endM: 8,  predecessorId: 'cdmo',   lagMonths: -4, manualStart: false },
  { id: 'algo',        desc: '算法训练与测试',                    kpi: 'AUROC≥0.78',           type: '研发',   bold: false, startM: 9,  endM: 15, predecessorId: 'cdmo',   lagMonths: 0, manualStart: false },
  { id: 'iso',         desc: 'ISO13485质量体系联调',              kpi: '体系审核通过',          type: '注册',   bold: false, startM: 11, endM: 15, predecessorId: 'cdmo',   lagMonths: 2, manualStart: false },
  { id: 'baxter_sign', desc: 'Baxter渠道授权签约',               kpi: '授权金¥300万到账',      type: '商业化', bold: true,  startM: 16, endM: 18, predecessorId: 'iso',    lagMonths: 0, manualStart: false },
  { id: 'c2_reg',      desc: '★ 二类医疗器械证获批',             kpi: '注册证到手 · 创新通道', type: '注册',   bold: true,  startM: 17, endM: 18, predecessorId: 'iso',    lagMonths: 1, manualStart: false },
  { id: 'c2_deploy',   desc: '90床C2商业化(直销60+Baxter30)',     kpi: '部署率≥85%',           type: '商业化', bold: false, startM: 19, endM: 27, predecessorId: 'c2_reg', lagMonths: 0, manualStart: false },
  { id: 'baxter_m2',   desc: 'Baxter里程碑¥200万',               kpi: '里程碑付款',            type: '商业化', bold: false, startM: 28, endM: 30, predecessorId: 'c2_deploy', lagMonths: 0, manualStart: false },
  { id: 'c3_reg',      desc: '★ 三类注册证获批',                 kpi: '注册证到手',            type: '注册',   bold: true,  startM: 31, endM: 35, predecessorId: 'c2_deploy', lagMonths: 3, manualStart: false },
  { id: 'c3_deploy1',  desc: 'C3商业化 · 120床新增+30升级',       kpi: '累计240床',             type: '商业化', bold: false, startM: 28, endM: 40, predecessorId: 'c2_deploy', lagMonths: 0, manualStart: false },
  { id: 'c3_scale',    desc: '规模放量 · 150 C3新增+40升级',      kpi: '累计430床',             type: '商业化', bold: false, startM: 41, endM: 52, predecessorId: 'c3_deploy1', lagMonths: 0, manualStart: false },
  { id: 'c3_expand',   desc: '全面扩张 · 200 C3新增',             kpi: '累计630床',             type: '商业化', bold: false, startM: 53, endM: 60, predecessorId: 'c3_scale', lagMonths: 0, manualStart: false },
];

export const DEFAULT_ANNOTATIONS: Record<string, string> = {
  'pricing': 'BP §5.3 价值定价法 · C2按ICU监测市场替代定价 · C3按预警诊断增值溢价 · 大客户5年期享¥3.5万折扣',
  'bom': 'C2小批量BOM ¥3.2万 · C3量产BOM ¥2.15万(含传感器+边缘计算+外壳+PCB+组装+包装) · CDMO代工模式',
  'renewal': 'BP §7.2 基准续约率70% · 中国医院SaaS付费培育期 · 乐观85% 保守55%',
  'baxter': 'Baxter渠道: HW分成15% SaaS分成35% · 授权金¥200万+里程碑¥300万 · 可替代Pre-A轮融资',
  'opex': 'BP §9.4 OpEx拆分 · Y1含CDMO NRE ¥80万+样机BOM ¥128万 · 薪资按研发6人→12人→18人→25人→30人规划',
  'funding': '轻量融资策略 · Baxter授权金可覆盖50-75% Pre-A需求 · EBITDA Y2转正后无需A轮',
  'milestones': 'C2 M14-15获批(创新通道) · C3 M28-31获批 · 比行业平均快30% · M1=2026年7月',
  'deployment': 'Y2: 直销80+Baxter30=110 · Y3起Baxter C3大幅放量 · Y5 Baxter占比>75%',
  'roi': 'C2 ¥6.25万/床/年(ICU平均减少1.2天住院+降低并发症) · C3 ¥8万/床/年(预警+诊断双重价值)',
};

export const DEFAULT_MODEL: ModelInputs = {
  global: DEFAULT_GLOBAL,
  yearly: DEFAULT_YEARLY,
  opex: DEFAULT_OPEX,
  funding: DEFAULT_FUNDING,
  milestones_best: DEFAULT_MILESTONES_BEST,
  milestones_base: DEFAULT_MILESTONES_BASE,
  annotations: DEFAULT_ANNOTATIONS,
};

export const BP_TARGETS = {
  total_revenue: [0, 932, 1259, 1398, 1665],
  total_cogs:    [0, 352,  498,  527,  559],
  gross_profit:  [0, 580,  761,  871, 1106],
  opex:          [480, 361, 464,  504,  566],
  ebitda:        [-480, 219, 297, 367, 540],
  net_profit:    [-500, 194, 272, 337, 510],
};

export const YEAR_LABELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
export const MONTH_LABELS = ['M1–12', 'M13–24', 'M25–36', 'M37–48', 'M49–60'];
export const PHASE_LABELS = ['原型+试点', '二类商业化', '三类商业化', '规模放量', '全面扩张'];

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
