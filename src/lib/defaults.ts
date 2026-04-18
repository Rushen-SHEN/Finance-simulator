// ARIA defaults — calibrated to BP §9.2/9.3/9.4 (April 2026)
import { GlobalInputs, YearlyInputs } from './calculator';

export const DEFAULT_GLOBAL: GlobalInputs = {
  // Pricing per BP §5.3
  price_hw_c2: 65000,
  price_hw_c3: 85000,
  price_upgrade: 25000,
  price_saas_c2: 25000,
  price_saas_c3: 40000,
  price_saas_c3_bulk: 35000,   // 5-year large customer
  // BOM — blended defaults calibrated to BP §9.2 COGS
  bom_c2: 32000,               // small batch
  bom_c3: 21500,               // mass production
  bom_upgrade: 28000,
  // Rates
  rr_base: 0.70,               // BP default (was 0.75)
  // Baxter channel
  baxter_hw_commission: 0.15,
  baxter_saas_commission: 0.35,
  // ROI value anchors
  value_anchor_c2: 62500,      // ¥6.25万/bed/yr
  value_anchor_c3: 80000,      // ¥8.0万/bed/yr
};

// BP §9.3 deployment plan
export const DEFAULT_YEARLY: YearlyInputs = {
  //                        Y1    Y2    Y3    Y4    Y5
  direct_c2:              [  0,   80,   50,    0,    0],
  direct_c3:              [  0,    0,   30,   60,   60],
  baxter_c2:              [  0,   30,    0,    0,    0],
  baxter_c3:              [  0,    0,   60,  120,  200],
  planned_upgrade:        [  0,    0,   40,   50,    0],
  // OpEx total per BP §9.4 (元)
  opex:                   [4800000, 3610000, 4640000, 5040000, 5660000],
  depreciation:           [ 200000,  250000,  250000,  300000,  300000],
  // Baxter licensing+milestones (元) per BP §9.3
  baxter_license:         [      0, 3000000, 2000000,       0,       0],
};

// OpEx breakdown (read-only reference for display, per BP §9.4)
export const OPEX_DETAIL = {
  labels: ['薪资社保', 'CDMO NRE', '试产样机BOM', 'CRO/临床', '注册审评', '合规质量', '专利/咨询/AI', '差旅/运营/CMO'],
  //              Y1       Y2       Y3       Y4       Y5
  salary:   [1420000, 1730000, 2740000, 3620000, 4110000],
  cdmo_nre: [ 800000,       0,       0,       0,       0],
  pilot_bom:[1280000,       0,       0,       0,       0],
  cro:      [ 300000,  800000,  400000,       0,       0],
  reg:      [ 350000,  150000,  350000,  100000,   50000],
  compliance:[ 200000, 150000,  200000,  250000,  300000],
  patent_ai: [ 300000, 380000,  400000,  420000,  450000],
  travel_ops:[ 150000, 400000,  550000,  650000,  750000],
};

// BP §9.2 target values for reference/validation (万元)
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
