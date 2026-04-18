import { GlobalInputs, YearlyInputs } from './calculator';

export const DEFAULT_GLOBAL: GlobalInputs = {
  price_hw_c2: 80000,
  price_hw_c3: 120000,
  price_upgrade: 40000,
  price_saas_c2: 25000,
  price_saas_c3: 40000,
  cogs_hw_c2: 55000,
  cogs_hw_c3: 70000,
  cogs_upgrade: 15000,
  rr_base: 0.75,
  factor_saas_y2: 0.5,
  factor_saas_y3: 0.5,
  factor_saas_y4: 0.8,
  factor_saas_y5: 0.5,
  use_shared_hub: 1,
  supplier_discount: 0.08,
  yield_improvement: 0.05,
};

export const DEFAULT_YEARLY: YearlyInputs = {
  new_c2_beds: [0, 100, 100, 0, 0],
  new_c3_beds: [0, 0, 0, 100, 200],
  planned_upgrade: [0, 0, 0, 131, 0],
  opex: [3325000, 4200000, 4623000, 7345000, 8645000],
  depreciation: [200000, 300000, 300000, 300000, 400000],
};

export const YEAR_LABELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
export const MONTH_LABELS = ['M1–M12', 'M13–M24', 'M25–M36', 'M37–M48', 'M49–M60'];
export const PHASE_LABELS = ['P1–P2 研发', 'P3→P4 二类', 'P5 扩张', 'P6→P7 三类', 'P7 规模化'];
