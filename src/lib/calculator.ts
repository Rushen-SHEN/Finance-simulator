// ARIA Financial Model Calculator — BPcc v3.2
// Full breakdown: OpEx 8 items, COGS sub-items, distributor channel, milestones, funding
// Scenario system: neutral / optimistic / conservative × aggressive / standard timeline

export type Scenario = 'neutral' | 'optimistic' | 'conservative';
export type Timeline = 'aggressive' | 'standard';

export interface ScenarioOverrides {
  rr_base: number;
  growth_y6: number;
  growth_y7: number;
  growth_y8: number;
  growth_y9: number;
  growth_y10: number;
  bed_growth_factor: number;    // multiplier on deployment: 1.0=neutral, 1.15=optimistic, 0.85=conservative
  opex_growth_y6: number;       // independent OpEx growth for Y6-Y10
  opex_growth_y7: number;
  opex_growth_y8: number;
  opex_growth_y9: number;
  opex_growth_y10: number;
  cogs_rate_target: number;     // target COGS rate for Y6-Y10 (e.g. 0.34)
  salary_growth: number;        // Y6-Y10 salary growth rate (headcount capped, reflects raises only, e.g. 0.08)
}

export interface GlobalInputs {
  // Pricing (元/bed)
  price_hw_c2: number;
  price_hw_c3: number;
  price_upgrade: number;
  price_saas_c2: number;
  price_saas_c3: number;
  price_saas_c3_bulk: number;
  // BOM — COGS sub-items (元/bed)
  bom_sensor: number;       // 传感器模组
  bom_edge_compute: number; // 边缘计算模块
  bom_housing: number;      // 外壳结构件
  bom_cable_pcb: number;    // 线缆/PCB
  bom_assembly: number;     // 组装测试
  bom_packaging: number;    // 包装物流
  // Derived totals (computed)
  bom_c2: number;
  bom_c3: number;
  bom_upgrade: number;
  // C3 additional cost over C2 (额外传感器+认证成本)
  bom_c3_premium: number;
  // Rates
  rr_base: number;
  // Baxter channel
  baxter_hw_commission: number;
  baxter_saas_commission: number;
  // Channel structured: license & milestone
  license_amount: number;       // 前期授权金 (元), default 3000000
  license_year: number;         // 到账年份 (1-based), default 2 (Y2)
  milestone_payment: number;    // 里程碑付款 (元), default 2000000
  milestone_year: number;       // 到账年份 (1-based), default 3 (Y3)
  // ROI value anchors
  value_anchor_c2: number;
  value_anchor_c3: number;
  // Post-Class-III annual revenue growth rate (e.g. 0.30 = 30%)
  post_class3_growth: number;
  // Per-year growth rates for Y6-Y10 (neutral defaults, overridden by scenario)
  growth_y6: number;
  growth_y7: number;
  growth_y8: number;
  growth_y9: number;
  growth_y10: number;
  // SOM / Sensitivity
  sam_midpoint: number;           // SAM中值 (万元), default 275000 = 27.5亿
  sensitivity_bed_swing: number;  // 敏感性摆幅, default 0.15 = ±15%
  // Salary breakdown
  headcount: number[];            // [Y1..Y5] number of employees
  avg_salary: number[];           // [Y1..Y5] average salary per person (元/year)
}

export interface OpExDetail {
  salary: number[];       // 薪资社保 [Y1..Y5]
  cdmo_nre: number[];     // CDMO NRE
  pilot_bom: number[];    // 试产样机BOM
  cro: number[];          // CRO/临床
  reg: number[];          // 注册审评
  compliance: number[];   // 合规质量
  patent_ai: number[];    // 专利/咨询/AI
  travel_ops: number[];   // 差旅/运营/CMO
}

export interface FundingInputs {
  seed_min: number;       // 种子轮最小
  seed_max: number;       // 种子轮最大
  seed_dilution: number;  // 稀释比例
  preA_min: number;
  preA_max: number;
  preA_dilution: number;
  seriesA_min: number;
  seriesA_max: number;
  seriesA_dilution: number;
}

export interface MilestoneItem {
  id: string;
  desc: string;
  kpi: string;
  type: '研发' | '注册' | '融资' | '商业化';
  bold: boolean;
  startM: number;        // start month (1–60)
  endM: number;          // end month (1–60)
  predecessorId: string | null;  // id of predecessor activity
  lagMonths: number;     // months after predecessor ends before this starts
  manualStart: boolean;  // true = user-set start; false = auto from predecessor
}

/**
 * Resolve milestone schedule by propagating predecessor dependency chains.
 * Uses iterative topological resolution (max 20 passes) to handle arbitrary
 * predecessor DAGs. Items with `manualStart: true` are anchored and not moved.
 *
 * @param items - Array of milestone items with optional predecessor references
 * @returns New array with resolved start/end months preserving original durations
 */
export function resolveMilestones(items: MilestoneItem[]): MilestoneItem[] {
  const resolved = items.map(m => ({ ...m }));
  // Topological resolve — iterate until stable (max 20 passes for safety)
  for (let pass = 0; pass < 20; pass++) {
    let changed = false;
    for (const m of resolved) {
      if (m.manualStart || !m.predecessorId) continue;
      const pred = resolved.find(p => p.id === m.predecessorId);
      if (!pred) continue;
      const duration = m.endM - m.startM; // preserve duration
      const newStart = pred.endM + m.lagMonths + 1;
      if (newStart !== m.startM) {
        m.startM = newStart;
        m.endM = newStart + duration;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return resolved;
}

export interface YearlyInputs {
  direct_c2: number[];
  direct_c3: number[];
  baxter_c2: number[];
  baxter_c3: number[];
  planned_upgrade: number[];
  depreciation: number[];
  baxter_license: number[];
}

export interface ModelInputs {
  global: GlobalInputs;
  yearly: YearlyInputs;
  yearly_base: YearlyInputs;
  opex: OpExDetail;
  funding: FundingInputs;
  milestones_best: MilestoneItem[];
  milestones_base: MilestoneItem[];
  annotations: Record<string, string>;
  active_scenario: Scenario;
  active_timeline: Timeline;
  scenario_overrides: Record<Scenario, ScenarioOverrides>;
}

export interface YearlyCalc {
  direct_c2: number;
  direct_c3: number;
  baxter_c2: number;
  baxter_c3: number;
  total_new: number;
  actual_upgrade: number;
  cumulative_beds: number;
  active_paying: number;
  hw_direct: number;
  hw_baxter: number;
  upgrade_revenue: number;
  saas_direct: number;
  saas_baxter: number;
  baxter_license: number;
  total_revenue: number;
  cogs: number;
  gross_profit: number;
  opex: number;
  opex_detail: { salary: number; cdmo_nre: number; pilot_bom: number; cro: number; reg: number; compliance: number; patent_ai: number; travel_ops: number };
  ebitda: number;
  depreciation: number;
  net_profit: number;
  gross_margin: number | null;
  net_margin: number | null;
  opex_ratio: number | null;
}

export interface CalcResult {
  years: YearlyCalc[];
  cumulative_net_profit: number;
  bom_c2: number;
  bom_c3: number;
  bom_upgrade: number;
}

const DEFAULT_FIRST_YEAR_FACTOR = [0, 0.375, 0.5, 0.5, 0.5];

/**
 * Derive FIRST_YEAR_FACTOR from milestone schedule.
 * Key logic: C2 registration approval month determines when Y2 hardware revenue begins.
 * C3 registration month determines when C3 deployment revenue begins.
 * Each year = 12 months: Y1=M1-12, Y2=M13-24, Y3=M25-36, Y4=M37-48, Y5=M49-60
 */
export function deriveFirstYearFactor(milestones: MilestoneItem[]): number[] {
  const resolved = resolveMilestones(milestones);
  const factors = [0, 0, 0.5, 0.5, 0.5]; // defaults for Y3-Y5

  // Y1: No commercial deployment (always 0)
  factors[0] = 0;

  // Y2 factor: based on C2 registration completion
  const c2Reg = resolved.find(m => m.id === 'c2_reg');
  if (c2Reg) {
    // C2 reg endM determines when deployment can start
    // Deployment starts the month after approval
    const deployStartM = c2Reg.endM + 1;
    // Y2 spans M13-M24. How many selling months in Y2?
    const y2Start = 13;
    const y2End = 24;
    if (deployStartM > y2End) {
      factors[1] = 0; // C2 not approved until after Y2
    } else if (deployStartM <= y2Start) {
      factors[1] = 0.5; // Full half-year selling
    } else {
      const sellingMonths = y2End - deployStartM + 1;
      factors[1] = Math.max(0, sellingMonths / 12);
    }
  }

  // Y3 factor: if C3 reg happens in Y3, adjust factor
  const c3Reg = resolved.find(m => m.id === 'c3_reg');
  if (c3Reg) {
    const deployStartM = c3Reg.endM + 1;
    const y3Start = 25;
    const y3End = 36;
    // C3 deployment only affects new C3 beds in that year
    // We use a blended factor: existing C2 SaaS runs full year,
    // but new C3 HW revenue starts after approval
    if (deployStartM > y3End) {
      // C3 not approved in Y3 — only C2 renewals, partial year for any new C2
      factors[2] = 0.5;
    } else if (deployStartM <= y3Start) {
      factors[2] = 0.5;
    } else {
      const sellingMonths = y3End - deployStartM + 1;
      factors[2] = Math.max(0.25, sellingMonths / 12); // at least 0.25 for existing SaaS
    }
  }

  return factors;
}

/**
 * Derive deployment gating from milestone schedule.
 * Returns the fraction of planned deployments that can actually happen each year,
 * based on when C2 and C3 approvals occur.
 * C2 beds can only deploy after C2 approval. C3 beds can only deploy after C3 approval.
 */
export function deriveDeploymentGating(milestones: MilestoneItem[]): { c2Gate: number[]; c3Gate: number[] } {
  const resolved = resolveMilestones(milestones);
  const c2Gate = [0, 1, 1, 1, 1]; // Y1 always 0, Y2-5 default open
  const c3Gate = [0, 0, 1, 1, 1]; // Y1-2 always 0, Y3-5 default open

  const c2Reg = resolved.find(m => m.id === 'c2_reg');
  if (c2Reg) {
    const deployStartM = c2Reg.endM + 1;
    for (let yr = 0; yr < 5; yr++) {
      const yStart = yr * 12 + 1;
      const yEnd = (yr + 1) * 12;
      if (deployStartM > yEnd) {
        c2Gate[yr] = 0; // not approved yet
      } else if (deployStartM <= yStart) {
        c2Gate[yr] = 1; // full year
      } else {
        c2Gate[yr] = (yEnd - deployStartM + 1) / 12; // fraction of year
      }
    }
  }

  const c3Reg = resolved.find(m => m.id === 'c3_reg');
  if (c3Reg) {
    const deployStartM = c3Reg.endM + 1;
    for (let yr = 0; yr < 5; yr++) {
      const yStart = yr * 12 + 1;
      const yEnd = (yr + 1) * 12;
      if (deployStartM > yEnd) {
        c3Gate[yr] = 0; // not approved yet
      } else if (deployStartM <= yStart) {
        c3Gate[yr] = 1; // full year
      } else {
        c3Gate[yr] = (yEnd - deployStartM + 1) / 12; // fraction of year
      }
    }
  }

  return { c2Gate, c3Gate };
}

/**
 * Compute Bill of Materials costs from sub-component inputs.
 * C2 = sum of 6 sub-components; C3 = C2 base + c3_premium; Upgrade = 60% base + premium.
 *
 * @param g - Global inputs containing BOM sub-component costs
 * @returns Object with c2, c3, and upgrade BOM totals (元/bed)
 */
export function computeBOM(g: GlobalInputs) {
  const base = g.bom_sensor + g.bom_edge_compute + g.bom_housing + g.bom_cable_pcb + g.bom_assembly + g.bom_packaging;
  return {
    c2: base,
    c3: base + g.bom_c3_premium,
    upgrade: Math.round(base * 0.6 + g.bom_c3_premium),
  };
}

/** Merge GlobalInputs with scenario overrides to produce effective parameters */
export function mergeScenario(g: GlobalInputs, so: ScenarioOverrides): { rr: number; growths: number[]; bedFactor: number; opexGrowths: number[]; cogsRate: number } {
  return {
    rr: so.rr_base,
    growths: [so.growth_y6, so.growth_y7, so.growth_y8, so.growth_y9, so.growth_y10],
    bedFactor: so.bed_growth_factor,
    opexGrowths: [so.opex_growth_y6, so.opex_growth_y7, so.opex_growth_y8, so.opex_growth_y9, so.opex_growth_y10],
    cogsRate: so.cogs_rate_target,
  };
}

/** Derive baxter_license array from structured license/milestone inputs */
export function deriveLicenseArray(g: GlobalInputs): number[] {
  const arr = [0, 0, 0, 0, 0];
  if (g.license_year >= 1 && g.license_year <= 5) arr[g.license_year - 1] += g.license_amount;
  if (g.milestone_year >= 1 && g.milestone_year <= 5) arr[g.milestone_year - 1] += g.milestone_payment;
  return arr;
}

/**
 * Core financial model engine. Computes 10-year projections:
 * - Y1-Y5: Bottom-up from deployment schedules, milestone gating, cohort-based SaaS renewal
 * - Y6-Y10: Top-down growth-rate projection from Y5 baseline
 *
 * COGS is charged only on direct-sale beds (not Baxter/distributor channel).
 * Revenue includes: HW direct, HW Baxter commission, upgrade, SaaS direct, SaaS Baxter, license fees.
 *
 * @param g - Global pricing, BOM, rate, and channel parameters
 * @param y - Yearly deployment schedules (5 years)
 * @param opex - Operating expense breakdown (8 categories × 5 years)
 * @param milestones - Optional milestone schedule for deployment gating and first-year factor derivation
 * @param scenarioOverride - Optional scenario override (neutral/optimistic/conservative) for rr, growth, COGS
 * @returns CalcResult with 10 YearlyCalc entries and cumulative metrics
 */
export function calculate(g: GlobalInputs, y: YearlyInputs, opex: OpExDetail, milestones?: MilestoneItem[], scenarioOverride?: ScenarioOverrides): CalcResult {
  const bom = computeBOM(g);
  const rr = scenarioOverride ? scenarioOverride.rr_base : g.rr_base;
  const bedFactor = scenarioOverride ? scenarioOverride.bed_growth_factor : 1.0;
  const years: YearlyCalc[] = [];
  const directCohorts: { c2: number; c3: number }[] = [];
  const baxterCohorts: { c2: number; c3: number }[] = [];
  let cumBeds = 0;
  const fyFactors = milestones ? deriveFirstYearFactor(milestones) : DEFAULT_FIRST_YEAR_FACTOR;
  const gating = milestones ? deriveDeploymentGating(milestones) : { c2Gate: [0, 1, 1, 1, 1], c3Gate: [0, 0, 1, 1, 1] };

  for (let i = 0; i < 5; i++) {
    // Gate deployments by approval timing
    const c2g = gating.c2Gate[i];
    const c3g = gating.c3Gate[i];
    const dC2 = Math.round((y.direct_c2[i] || 0) * c2g * bedFactor);
    const dC3 = Math.round((y.direct_c3[i] || 0) * c3g * bedFactor);
    const bC2 = Math.round((y.baxter_c2[i] || 0) * c2g * bedFactor);
    const bC3 = Math.round((y.baxter_c3[i] || 0) * c3g * bedFactor);
    const totalNew = dC2 + dC3 + bC2 + bC3;

    const plannedUpg = y.planned_upgrade[i] || 0;
    let actualUpg = 0;
    if (plannedUpg > 0 && i >= 2) {
      let survivingC2 = 0;
      for (let j = 0; j < i; j++) {
        const yearsElapsed = i - j;
        const cohortC2 = (directCohorts[j]?.c2 || 0) + (baxterCohorts[j]?.c2 || 0);
        survivingC2 += cohortC2 * Math.pow(rr, yearsElapsed);
      }
      actualUpg = Math.min(plannedUpg, Math.floor(survivingC2));
    }

    const hwDirect = dC2 * g.price_hw_c2 + dC3 * g.price_hw_c3;
    const hwBaxter = (bC2 * g.price_hw_c2 + bC3 * g.price_hw_c3) * g.baxter_hw_commission;
    const upgradeRev = actualUpg * g.price_upgrade;

    const fyf = fyFactors[i] ?? 0.5;
    let saasDirect = 0;
    let saasBaxter = 0;

    for (let j = 0; j < i; j++) {
      const elapsed = i - j;
      const survRate = Math.pow(rr, elapsed);
      const dc = directCohorts[j];
      if (dc) {
        saasDirect += dc.c2 * g.price_saas_c2 * survRate;
        saasDirect += dc.c3 * g.price_saas_c3 * survRate;
      }
      const bc = baxterCohorts[j];
      if (bc) {
        saasBaxter += bc.c2 * g.price_saas_c2 * survRate * g.baxter_saas_commission;
        saasBaxter += bc.c3 * g.price_saas_c3 * survRate * g.baxter_saas_commission;
      }
    }

    saasDirect += (dC2 * g.price_saas_c2 + dC3 * g.price_saas_c3) * fyf;
    saasBaxter += (bC2 * g.price_saas_c2 + bC3 * g.price_saas_c3) * fyf * g.baxter_saas_commission;

    const license = y.baxter_license[i] || 0;
    const totalRevenue = hwDirect + hwBaxter + upgradeRev + saasDirect + saasBaxter + license;

    // COGS: only direct-sale beds bear ARIA's BOM cost.
    // Baxter/distributor channel beds are manufactured by Baxter; ARIA receives commission only.
    const totalC2 = dC2 + bC2;
    const totalC3 = dC3 + bC3;
    const cogs = dC2 * bom.c2 + dC3 * bom.c3 + actualUpg * bom.upgrade;
    const grossProfit = totalRevenue - cogs;

    // OpEx from detail breakdown
    const od = {
      salary: opex.salary[i] || 0,
      cdmo_nre: opex.cdmo_nre[i] || 0,
      pilot_bom: opex.pilot_bom[i] || 0,
      cro: opex.cro[i] || 0,
      reg: opex.reg[i] || 0,
      compliance: opex.compliance[i] || 0,
      patent_ai: opex.patent_ai[i] || 0,
      travel_ops: opex.travel_ops[i] || 0,
    };
    const totalOpex = od.salary + od.cdmo_nre + od.pilot_bom + od.cro + od.reg + od.compliance + od.patent_ai + od.travel_ops;

    const ebitda = grossProfit - totalOpex;
    const dep = y.depreciation[i] || 0;
    const netProfit = ebitda - dep;

    directCohorts.push({ c2: dC2, c3: dC3 });
    baxterCohorts.push({ c2: bC2, c3: bC3 });

    let activePaying = 0;
    if (i === 0) activePaying = 0;
    else if (i === 1) activePaying = totalNew;
    else {
      const prev = years[i - 1].active_paying;
      activePaying = Math.round(prev * rr + totalNew + actualUpg);
    }

    cumBeds += totalNew;

    years.push({
      direct_c2: dC2, direct_c3: dC3, baxter_c2: bC2, baxter_c3: bC3,
      total_new: totalNew, actual_upgrade: actualUpg,
      cumulative_beds: cumBeds, active_paying: activePaying,
      hw_direct: hwDirect, hw_baxter: hwBaxter, upgrade_revenue: upgradeRev,
      saas_direct: saasDirect, saas_baxter: saasBaxter, baxter_license: license,
      total_revenue: totalRevenue,
      cogs, gross_profit: grossProfit,
      opex: totalOpex, opex_detail: od,
      ebitda, depreciation: dep, net_profit: netProfit,
      gross_margin: totalRevenue > 0 ? grossProfit / totalRevenue : null,
      net_margin: totalRevenue > 0 ? netProfit / totalRevenue : null,
      opex_ratio: totalRevenue > 0 ? totalOpex / totalRevenue : null,
    });
  }

  // === Y6-Y10: Growth-rate projection from Y5 baseline ===
  // Use unrounded intermediate values to prevent cumulative rounding drift
  const growthRates = scenarioOverride
    ? [scenarioOverride.growth_y6, scenarioOverride.growth_y7, scenarioOverride.growth_y8, scenarioOverride.growth_y9, scenarioOverride.growth_y10]
    : [g.growth_y6, g.growth_y7, g.growth_y8, g.growth_y9, g.growth_y10];
  const opexGrowths = scenarioOverride
    ? [scenarioOverride.opex_growth_y6, scenarioOverride.opex_growth_y7, scenarioOverride.opex_growth_y8, scenarioOverride.opex_growth_y9, scenarioOverride.opex_growth_y10]
    : growthRates.map(r => r * 0.5); // fallback: half revenue growth
  const cogsRate = scenarioOverride ? scenarioOverride.cogs_rate_target : -1; // -1 = use auto from Y5

  // Carry unrounded intermediate values to prevent compounding rounding errors
  let raw_hwDirect = years[4].hw_direct;
  let raw_hwBaxter = years[4].hw_baxter;
  let raw_upgradeRev = years[4].upgrade_revenue;
  let raw_saasDirect = years[4].saas_direct;
  let raw_saasBaxter = years[4].saas_baxter;
  let raw_salary = years[4].opex_detail.salary;
  let raw_reg = years[4].opex_detail.reg;
  let raw_compliance = years[4].opex_detail.compliance;
  let raw_patent_ai = years[4].opex_detail.patent_ai;
  let raw_travel_ops = years[4].opex_detail.travel_ops;
  let raw_dep = years[4].depreciation;
  let raw_newBeds = years[4].total_new;

  for (let p = 0; p < 5; p++) {
    const prev = years[4 + p];
    const gr = growthRates[p];
    const scale = 1 + gr;

    // Scale unrounded revenue components, then round for display
    raw_hwDirect *= scale;
    raw_hwBaxter *= scale;
    raw_upgradeRev *= scale;
    raw_saasDirect *= scale;
    raw_saasBaxter *= scale;

    const hwDirect = Math.round(raw_hwDirect);
    const hwBaxter = Math.round(raw_hwBaxter);
    const upgradeRev = Math.round(raw_upgradeRev);
    const saasDirect = Math.round(raw_saasDirect);
    const saasBaxter = Math.round(raw_saasBaxter);
    const license = 0; // no one-off license fees in projection years
    const totalRevenue = hwDirect + hwBaxter + upgradeRev + saasDirect + saasBaxter + license;

    // COGS: use scenario target rate or auto-derive from Y5
    const effectiveCogsRate = cogsRate > 0 ? cogsRate : (prev.total_revenue > 0 ? prev.cogs / prev.total_revenue : 0.35);
    const cogs = Math.round(totalRevenue * effectiveCogsRate);
    const grossProfit = totalRevenue - cogs;

    // OpEx: salary grows at its own rate (headcount capped), other items use general OpEx growth
    const opexGr = 1 + opexGrowths[p];
    const salaryGr = 1 + (scenarioOverride?.salary_growth ?? 0.08);
    raw_salary *= salaryGr;
    raw_reg *= opexGr;
    raw_compliance *= opexGr;
    raw_patent_ai *= opexGr;
    raw_travel_ops *= opexGr;
    const od = {
      salary: Math.round(raw_salary),
      cdmo_nre: 0,
      pilot_bom: 0,
      cro: 0,
      reg: Math.round(raw_reg),
      compliance: Math.round(raw_compliance),
      patent_ai: Math.round(raw_patent_ai),
      travel_ops: Math.round(raw_travel_ops),
    };
    const totalOpex = od.salary + od.cdmo_nre + od.pilot_bom + od.cro + od.reg + od.compliance + od.patent_ai + od.travel_ops;

    const ebitda = grossProfit - totalOpex;
    // Depreciation: office/IT/R&D assets grow with headcount (salary rate), not revenue
    raw_dep *= salaryGr;
    const dep = Math.round(raw_dep);
    const netProfit = ebitda - dep;

    // Beds: estimate new beds from revenue growth (unrounded intermediate)
    raw_newBeds *= scale;
    const newBeds = Math.round(raw_newBeds);
    cumBeds += newBeds;
    const activePaying = Math.round(prev.active_paying * rr + newBeds);

    years.push({
      direct_c2: 0, direct_c3: 0, baxter_c2: 0, baxter_c3: 0, // not itemized in projection
      total_new: newBeds, actual_upgrade: 0,
      cumulative_beds: cumBeds, active_paying: activePaying,
      hw_direct: hwDirect, hw_baxter: hwBaxter, upgrade_revenue: upgradeRev,
      saas_direct: saasDirect, saas_baxter: saasBaxter, baxter_license: license,
      total_revenue: totalRevenue,
      cogs, gross_profit: grossProfit,
      opex: totalOpex, opex_detail: od,
      ebitda, depreciation: dep, net_profit: netProfit,
      gross_margin: totalRevenue > 0 ? grossProfit / totalRevenue : null,
      net_margin: totalRevenue > 0 ? netProfit / totalRevenue : null,
      opex_ratio: totalRevenue > 0 ? totalOpex / totalRevenue : null,
    });
  }

  return {
    years,
    cumulative_net_profit: years.reduce((s, yr) => s + yr.net_profit, 0),
    bom_c2: bom.c2, bom_c3: bom.c3, bom_upgrade: bom.upgrade,
  };
}

// ============================================================
// BP Traceability — Mapping Blocks
// ============================================================

export interface MappingBlock {
  id: string;
  label: string;
  bpSection: string;
  description: string;
}

export const MAPPING_BLOCKS: MappingBlock[] = [
  { id: '§5→§1.5', label: '核心财务指标', bpSection: 'BP §1.5 / §9.2', description: 'Y1-Y10 收入、EBITDA、净利润、ARR' },
  { id: '§3.1→§5.3', label: '渠道经济模型', bpSection: 'BP §5.3', description: '经销商佣金、授权金、SaaS分成' },
  { id: '§3.2→§5.4', label: '商业化床位曲线', bpSection: 'BP §5.4 / §9.3', description: '直销/经销商 C2/C3 部署计划、升级路径' },
  { id: '§5→§9', label: 'EBITDA盈亏平衡', bpSection: 'BP §9 融资与盈亏', description: 'EBITDA转正时间、融资窗口' },
  { id: '§2.1→§11', label: '里程碑与注册', bpSection: 'BP §11 里程碑', description: 'C2/C3注册时间、商业化部署节奏' },
  { id: '§3.2→§1.5', label: '增长假设', bpSection: 'BP §1.5 增长', description: 'Y6-Y10 增长率曲线' },
  { id: '§5.3→§1.5', label: 'ARR与续费', bpSection: 'BP §1.5 ARR', description: 'SaaS续费率、活跃床位、ARR' },
];

/** Parameter group → affected mapping block IDs */
export const PARAM_MAPPING: Record<string, string[]> = {
  pricing:    ['§5→§1.5', '§3.1→§5.3'],
  bom:        ['§5→§1.5', '§3.1→§5.3'],
  channel:    ['§3.1→§5.3', '§5.3→§1.5'],
  deploy:     ['§5→§1.5', '§3.2→§5.4', '§5→§9'],
  opex:       ['§5→§1.5', '§5→§9'],
  milestones: ['§3.2→§5.4', '§2.1→§11'],
  growth:     ['§5→§1.5', '§3.2→§1.5'],
  renewal:    ['§5.3→§1.5', '§5→§1.5'],
  funding:    ['§5→§9'],
};

/** Given a list of changed parameter groups, return all affected mapping block IDs */
export function getAffectedMappings(changedGroups: string[]): string[] {
  const set = new Set<string>();
  for (const group of changedGroups) {
    const blocks = PARAM_MAPPING[group];
    if (blocks) blocks.forEach(b => set.add(b));
  }
  return Array.from(set).sort();
}

// ============================================================
// Parameter Validation
// ============================================================

export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validate model inputs against reasonable business bounds.
 * Checks pricing ranges, renewal rate, commission rates, growth rates, and deployment totals.
 *
 * @param model - Complete model inputs to validate
 * @returns Array of validation warnings with field name, message, and severity
 */
export function validateModel(model: ModelInputs): ValidationWarning[] {
  const w: ValidationWarning[] = [];
  const g = model.global;

  if (g.price_hw_c2 < 30000 || g.price_hw_c2 > 200000)
    w.push({ field: 'price_hw_c2', message: 'C2硬件价格超出合理范围 (3-20万)', severity: 'warning' });
  if (g.price_hw_c3 < 50000 || g.price_hw_c3 > 300000)
    w.push({ field: 'price_hw_c3', message: 'C3硬件价格超出合理范围 (5-30万)', severity: 'warning' });
  if (g.rr_base < 0.5 || g.rr_base > 0.95)
    w.push({ field: 'rr_base', message: '续费率超出合理范围 (50%-95%)', severity: 'error' });
  if (g.baxter_hw_commission < 0.05 || g.baxter_hw_commission > 0.40)
    w.push({ field: 'baxter_hw_commission', message: '硬件佣金超出合理范围 (5%-40%)', severity: 'warning' });

  const growths = [g.growth_y6, g.growth_y7, g.growth_y8, g.growth_y9, g.growth_y10];
  for (let i = 0; i < growths.length; i++) {
    if (growths[i] < -0.3 || growths[i] > 1.0)
      w.push({ field: `growth_y${i + 6}`, message: `Y${i + 6}增长率超出合理范围 (-30%~100%)`, severity: 'warning' });
  }

  // Check deployment arrays have reasonable totals
  const totalBestBeds = model.yearly.direct_c2.reduce((s, v) => s + v, 0) + model.yearly.direct_c3.reduce((s, v) => s + v, 0)
    + model.yearly.baxter_c2.reduce((s, v) => s + v, 0) + model.yearly.baxter_c3.reduce((s, v) => s + v, 0);
  if (totalBestBeds === 0)
    w.push({ field: 'deploy', message: 'Best Case 5年部署床位总数为0', severity: 'error' });

  return w;
}
