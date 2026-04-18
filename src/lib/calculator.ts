// ARIA Financial Model Calculator — BPcc v2
// Matches BP §9.2/9.3/9.4: direct + Baxter channel, dual BOM, OpEx detail

export interface GlobalInputs {
  // Pricing (元/bed)
  price_hw_c2: number;
  price_hw_c3: number;
  price_upgrade: number;
  price_saas_c2: number;
  price_saas_c3: number;
  price_saas_c3_bulk: number; // 5-year large customer
  // BOM (元/bed)
  bom_c2: number;
  bom_c3: number;
  bom_upgrade: number;
  // Rates
  rr_base: number;
  // Baxter channel commissions
  baxter_hw_commission: number;   // 0.15
  baxter_saas_commission: number; // 0.35
  // ROI value anchors (元/bed/yr)
  value_anchor_c2: number;
  value_anchor_c3: number;
}

export interface YearlyInputs {
  direct_c2: number[];       // [Y1..Y5]
  direct_c3: number[];
  baxter_c2: number[];
  baxter_c3: number[];
  planned_upgrade: number[];
  opex: number[];            // total OpEx per year (元)
  depreciation: number[];    // (元)
  baxter_license: number[];  // 授权金+里程碑 (元)
}

export interface YearlyCalc {
  // Deployment
  direct_c2: number;
  direct_c3: number;
  baxter_c2: number;
  baxter_c3: number;
  total_new: number;
  actual_upgrade: number;
  cumulative_beds: number;
  active_paying: number;
  // Revenue detail
  hw_direct: number;
  hw_baxter: number;
  upgrade_revenue: number;
  saas_direct: number;
  saas_baxter: number;
  baxter_license: number;
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
  bom_c2: number;
  bom_c3: number;
  bom_upgrade: number;
}

// First-year SaaS factor (partial year revenue from new deployments)
// Y2 = first commercial year, slower ramp. Y3+ = established channels.
const FIRST_YEAR_FACTOR = [0, 0.375, 0.5, 0.5, 0.5];

export function calculate(g: GlobalInputs, y: YearlyInputs): CalcResult {
  const rr = g.rr_base;
  const years: YearlyCalc[] = [];

  // Track bed cohorts for SaaS renewal (direct channel)
  // Each entry: { c2, c3 } beds deployed that year via direct channel
  const directCohorts: { c2: number; c3: number }[] = [];
  // Baxter cohorts
  const baxterCohorts: { c2: number; c3: number }[] = [];

  let cumBeds = 0;

  for (let i = 0; i < 5; i++) {
    const dC2 = y.direct_c2[i] || 0;
    const dC3 = y.direct_c3[i] || 0;
    const bC2 = y.baxter_c2[i] || 0;
    const bC3 = y.baxter_c3[i] || 0;
    const totalNew = dC2 + dC3 + bC2 + bC3;

    // Upgrades — cap by surviving C2 beds
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

    // === Hardware Revenue ===
    const hwDirect = dC2 * g.price_hw_c2 + dC3 * g.price_hw_c3;
    const hwBaxter = (bC2 * g.price_hw_c2 + bC3 * g.price_hw_c3) * g.baxter_hw_commission;
    const upgradeRev = actualUpg * g.price_upgrade;

    // === SaaS Revenue (cohort-based) ===
    const fyf = FIRST_YEAR_FACTOR[i] || 0.5;
    let saasDirect = 0;
    let saasBaxter = 0;

    // Revenue from prior cohorts (renewed, full year)
    for (let j = 0; j < i; j++) {
      const elapsed = i - j;
      const survRate = Math.pow(rr, elapsed);

      // Direct cohort renewals
      const dc = directCohorts[j];
      if (dc) {
        saasDirect += dc.c2 * g.price_saas_c2 * survRate;
        saasDirect += dc.c3 * g.price_saas_c3 * survRate;
      }

      // Baxter cohort renewals — ARIA gets commission share
      const bc = baxterCohorts[j];
      if (bc) {
        saasBaxter += bc.c2 * g.price_saas_c2 * survRate * g.baxter_saas_commission;
        saasBaxter += bc.c3 * g.price_saas_c3 * survRate * g.baxter_saas_commission;
      }
    }

    // Revenue from THIS year's new deployments (partial year)
    saasDirect += (dC2 * g.price_saas_c2 + dC3 * g.price_saas_c3) * fyf;
    saasBaxter += (bC2 * g.price_saas_c2 + bC3 * g.price_saas_c3) * fyf * g.baxter_saas_commission;

    // Licensing fees
    const license = y.baxter_license[i] || 0;

    const totalRevenue = hwDirect + hwBaxter + upgradeRev + saasDirect + saasBaxter + license;

    // === COGS ===
    const totalC2 = dC2 + bC2;
    const totalC3 = dC3 + bC3;
    const cogs = totalC2 * g.bom_c2 + totalC3 * g.bom_c3 + actualUpg * g.bom_upgrade;
    const grossProfit = totalRevenue - cogs;

    // === OpEx & Profit ===
    const opex = y.opex[i] || 0;
    const ebitda = grossProfit - opex;
    const dep = y.depreciation[i] || 0;
    const netProfit = ebitda - dep;

    // Track cohorts for future SaaS renewals
    directCohorts.push({ c2: dC2, c3: dC3 });
    baxterCohorts.push({ c2: bC2, c3: bC3 });

    // Active paying beds (approximate)
    let activePaying = 0;
    if (i === 0) {
      activePaying = 0;
    } else if (i === 1) {
      activePaying = totalNew;
    } else {
      const prev = years[i - 1].active_paying;
      activePaying = Math.round(prev * rr + totalNew + actualUpg);
    }

    cumBeds += totalNew;

    years.push({
      direct_c2: dC2,
      direct_c3: dC3,
      baxter_c2: bC2,
      baxter_c3: bC3,
      total_new: totalNew,
      actual_upgrade: actualUpg,
      cumulative_beds: cumBeds,
      active_paying: activePaying,
      hw_direct: hwDirect,
      hw_baxter: hwBaxter,
      upgrade_revenue: upgradeRev,
      saas_direct: saasDirect,
      saas_baxter: saasBaxter,
      baxter_license: license,
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

  return {
    years,
    cumulative_net_profit: years.reduce((s, yr) => s + yr.net_profit, 0),
    bom_c2: g.bom_c2,
    bom_c3: g.bom_c3,
    bom_upgrade: g.bom_upgrade,
  };
}
