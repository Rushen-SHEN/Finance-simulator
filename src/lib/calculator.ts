// ARIA Financial Model Calculator — BPcc v3.1
// Full breakdown: OpEx 8 items, COGS sub-items, distributor channel, milestones, funding

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
  // ROI value anchors
  value_anchor_c2: number;
  value_anchor_c3: number;
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

/** Resolve milestone schedule: propagate predecessor chains */
export function resolveMilestones(items: MilestoneItem[]): MilestoneItem[] {
  const byId = new Map(items.map(m => [m.id, { ...m }]));
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
  opex: OpExDetail;
  funding: FundingInputs;
  milestones_best: MilestoneItem[];
  milestones_base: MilestoneItem[];
  annotations: Record<string, string>;
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

export function computeBOM(g: GlobalInputs) {
  const base = g.bom_sensor + g.bom_edge_compute + g.bom_housing + g.bom_cable_pcb + g.bom_assembly + g.bom_packaging;
  return {
    c2: base,
    c3: base + g.bom_c3_premium,
    upgrade: Math.round(base * 0.6 + g.bom_c3_premium),
  };
}

export function calculate(g: GlobalInputs, y: YearlyInputs, opex: OpExDetail, milestones?: MilestoneItem[]): CalcResult {
  const bom = computeBOM(g);
  const rr = g.rr_base;
  const years: YearlyCalc[] = [];
  const directCohorts: { c2: number; c3: number }[] = [];
  const baxterCohorts: { c2: number; c3: number }[] = [];
  let cumBeds = 0;
  const fyFactors = milestones ? deriveFirstYearFactor(milestones) : DEFAULT_FIRST_YEAR_FACTOR;

  for (let i = 0; i < 5; i++) {
    const dC2 = y.direct_c2[i] || 0;
    const dC3 = y.direct_c3[i] || 0;
    const bC2 = y.baxter_c2[i] || 0;
    const bC3 = y.baxter_c3[i] || 0;
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

    const totalC2 = dC2 + bC2;
    const totalC3 = dC3 + bC3;
    const cogs = totalC2 * bom.c2 + totalC3 * bom.c3 + actualUpg * bom.upgrade;
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

  return {
    years,
    cumulative_net_profit: years.reduce((s, yr) => s + yr.net_profit, 0),
    bom_c2: bom.c2, bom_c3: bom.c3, bom_upgrade: bom.upgrade,
  };
}
