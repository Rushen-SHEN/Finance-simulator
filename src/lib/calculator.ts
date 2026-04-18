// ARIA Financial Model Calculator
// Replicates the Excel Calc sheet logic in TypeScript

export interface GlobalInputs {
  price_hw_c2: number;
  price_hw_c3: number;
  price_upgrade: number;
  price_saas_c2: number;
  price_saas_c3: number;
  cogs_hw_c2: number;
  cogs_hw_c3: number;
  cogs_upgrade: number;
  rr_base: number;
  factor_saas_y2: number;
  factor_saas_y3: number;
  factor_saas_y4: number;
  factor_saas_y5: number;
  // COGS reduction
  use_shared_hub: number;
  supplier_discount: number;
  yield_improvement: number;
}

export interface YearlyInputs {
  new_c2_beds: number[];    // [Y1..Y5]
  new_c3_beds: number[];
  planned_upgrade: number[];
  opex: number[];           // in 元
  depreciation: number[];   // in 元
}

export interface YearlyCalc {
  // Deployment
  new_c2_beds: number;
  new_c3_beds: number;
  planned_upgrade: number;
  upgrade_cap: number;
  actual_upgrade: number;
  cumulative_commercial: number;
  active_paying: number;
  // Revenue
  hw_revenue: number;
  upgrade_revenue: number;
  saas_revenue: number;
  total_revenue: number;
  // Cost
  cogs: number;
  gross_profit: number;
  // Profit
  opex: number;
  ebitda: number;
  depreciation: number;
  net_profit: number;
  // Ratios
  gross_margin: number | null;
  net_margin: number | null;
  opex_ratio: number | null;
}

export interface CalcResult {
  years: YearlyCalc[];
  cumulative_net_profit: number;
  effective_c2_bom: number;
  effective_c3_bom: number;
  effective_upgrade_cogs: number;
}

const EDGE_MODULE_BASELINE = 20000;
const HUB_SAVING_PER_BED = 2167; // rounded from 2166.67

export function calculateEffectiveBOM(g: GlobalInputs) {
  const hubSaving = g.use_shared_hub ? HUB_SAVING_PER_BED : 0;
  const c2_bom = (g.cogs_hw_c2 - hubSaving) * (1 - g.supplier_discount) * (1 - g.yield_improvement);
  const c3_bom = (g.cogs_hw_c3 - hubSaving) * (1 - g.supplier_discount) * (1 - g.yield_improvement);
  const upgrade_cogs = g.cogs_upgrade * (1 - g.supplier_discount) * (1 - g.yield_improvement);
  return { c2_bom, c3_bom, upgrade_cogs };
}

export function calculate(g: GlobalInputs, y: YearlyInputs): CalcResult {
  const { c2_bom, c3_bom, upgrade_cogs } = calculateEffectiveBOM(g);
  const rr = g.rr_base;
  const years: YearlyCalc[] = [];

  // Track cumulative beds for upgrade cap and SaaS
  let cumC2 = 0; // cumulative class II beds deployed
  let cumC3 = 0;
  const c2_by_year: number[] = []; // new c2 beds each year
  const c3_by_year: number[] = [];
  const upgrade_by_year: number[] = [];

  for (let i = 0; i < 5; i++) {
    const newC2 = y.new_c2_beds[i] || 0;
    const newC3 = y.new_c3_beds[i] || 0;
    const plannedUpg = y.planned_upgrade[i] || 0;

    // Upgrade cap: only Y4 has meaningful value
    // Y4 cap = Y2_c2 × rr² + Y3_c2 × rr
    let upgradeCap = 0;
    if (i >= 3) {
      // Y2 is index 1, Y3 is index 2
      const y2c2 = c2_by_year[1] || 0;
      const y3c2 = c2_by_year[2] || 0;
      upgradeCap = y2c2 * rr * rr + y3c2 * rr;
    }
    const actualUpgrade = Math.min(plannedUpg, upgradeCap > 0 ? upgradeCap : plannedUpg);

    // Hardware revenue
    const hwRevenue = newC2 * g.price_hw_c2 + newC3 * g.price_hw_c3;
    const upgradeRevenue = actualUpgrade * g.price_upgrade;

    // SaaS revenue calculation
    let saasRevenue = 0;
    const saasFactors = [0, g.factor_saas_y2, g.factor_saas_y3, g.factor_saas_y4, g.factor_saas_y5];

    if (i === 0) {
      // Y1: no commercial revenue
      saasRevenue = 0;
    } else if (i === 1) {
      // Y2: new C2 beds × C2 SaaS × factor_y2
      saasRevenue = newC2 * g.price_saas_c2 * saasFactors[1];
    } else if (i === 2) {
      // Y3: Y2 renewals + new Y3 beds
      const y2Renew = (c2_by_year[1] || 0) * rr * g.price_saas_c2;
      const y3New = newC2 * g.price_saas_c2 * saasFactors[2];
      saasRevenue = y2Renew + y3New;
    } else if (i === 3) {
      // Y4: Y2 double-renewed + Y3 renewed + upgrade SaaS + new C3 SaaS
      const y2DoubleRenew = (c2_by_year[1] || 0) * rr * rr * g.price_saas_c3; // upgraded to C3
      const y3Renew = (c2_by_year[2] || 0) * rr * g.price_saas_c3; // upgraded to C3 
      const newC3Saas = newC3 * g.price_saas_c3 * saasFactors[3];
      saasRevenue = y2DoubleRenew + y3Renew + newC3Saas;
    } else if (i === 4) {
      // Y5: surviving C3 renewals + new C3 SaaS
      // Y4 total active beds × rr × C3 price + new C3 × factor
      const prevActive = years[3] ? years[3].active_paying : 0;
      const renewSaas = prevActive * rr * g.price_saas_c3;
      const newC3Saas = newC3 * g.price_saas_c3 * saasFactors[4];
      saasRevenue = renewSaas + newC3Saas;
    }

    const totalRevenue = hwRevenue + upgradeRevenue + saasRevenue;

    // COGS
    const cogs = newC2 * c2_bom + newC3 * c3_bom + actualUpgrade * upgrade_cogs;
    const grossProfit = totalRevenue - cogs;

    // OpEx (already adjusted in Excel via OPEX_Drivers reduction)
    const opex = y.opex[i] || 0;
    const ebitda = grossProfit - opex;
    const dep = y.depreciation[i] || 0;
    const netProfit = ebitda - dep;

    // Track
    c2_by_year.push(newC2);
    c3_by_year.push(newC3);
    upgrade_by_year.push(actualUpgrade);
    cumC2 += newC2;
    cumC3 += newC3 + actualUpgrade;

    // Active paying beds (approximate with renewal decay)
    let activePaying = 0;
    if (i === 0) activePaying = 0;
    else if (i === 1) activePaying = newC2;
    else {
      // Previous active × rr + new beds
      const prevActive = years[i - 1] ? years[i - 1].active_paying : 0;
      activePaying = prevActive * rr + newC2 + newC3 + actualUpgrade;
    }

    years.push({
      new_c2_beds: newC2,
      new_c3_beds: newC3,
      planned_upgrade: plannedUpg,
      upgrade_cap: upgradeCap,
      actual_upgrade: actualUpgrade,
      cumulative_commercial: i === 0 ? 0 : (years[i - 1] ? years[i - 1].cumulative_commercial : 0) + newC2 + newC3,
      active_paying: Math.round(activePaying),
      hw_revenue: hwRevenue,
      upgrade_revenue: upgradeRevenue,
      saas_revenue: saasRevenue,
      total_revenue: totalRevenue,
      cogs,
      gross_profit: grossProfit,
      opex,
      ebitda,
      depreciation: dep,
      net_profit: netProfit,
      gross_margin: totalRevenue > 0 ? grossProfit / totalRevenue : null,
      net_margin: totalRevenue > 0 ? netProfit / totalRevenue : null,
      opex_ratio: totalRevenue > 0 ? opex / totalRevenue : null,
    });
  }

  const cumNetProfit = years.reduce((s, y) => s + y.net_profit, 0);

  return {
    years,
    cumulative_net_profit: cumNetProfit,
    effective_c2_bom: c2_bom,
    effective_c3_bom: c3_bom,
    effective_upgrade_cogs: upgrade_cogs,
  };
}
