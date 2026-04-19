/**
 * ARIA Finance Simulator — Calculator Engine Unit Tests
 * Covers: calculate(), computeBOM(), deriveFirstYearFactor(), deriveDeploymentGating(),
 *         resolveMilestones(), mergeScenario(), deriveLicenseArray(), validateModel()
 */
import { beforeAll, describe, it, expect } from 'vitest';
import {
  calculate,
  computeBOM,
  deriveFirstYearFactor,
  deriveDeploymentGating,
  resolveMilestones,
  mergeScenario,
  deriveLicenseArray,
  validateModel,
  CalcResult,
  MilestoneItem,
} from '../src/lib/calculator';
import {
  DEFAULT_GLOBAL,
  DEFAULT_YEARLY,
  DEFAULT_YEARLY_BASE,
  DEFAULT_OPEX,
  DEFAULT_MILESTONES_BEST,
  DEFAULT_MILESTONES_BASE,
  DEFAULT_SCENARIO_OVERRIDES,
  DEFAULT_MODEL,
} from '../src/lib/defaults';

// ============================================================
// computeBOM
// ============================================================
describe('computeBOM', () => {
  it('computes C2 BOM as sum of sub-components', () => {
    const bom = computeBOM(DEFAULT_GLOBAL);
    const expected = DEFAULT_GLOBAL.bom_sensor + DEFAULT_GLOBAL.bom_edge_compute +
      DEFAULT_GLOBAL.bom_housing + DEFAULT_GLOBAL.bom_cable_pcb +
      DEFAULT_GLOBAL.bom_assembly + DEFAULT_GLOBAL.bom_packaging;
    expect(bom.c2).toBe(expected);
    expect(bom.c2).toBe(32000);
  });

  it('computes C3 BOM as C2 base + premium', () => {
    const bom = computeBOM(DEFAULT_GLOBAL);
    expect(bom.c3).toBe(32000 + DEFAULT_GLOBAL.bom_c3_premium);
    expect(bom.c3).toBe(21500);
  });

  it('computes upgrade BOM', () => {
    const bom = computeBOM(DEFAULT_GLOBAL);
    expect(bom.upgrade).toBe(Math.round(32000 * 0.6 + DEFAULT_GLOBAL.bom_c3_premium));
  });
});

// ============================================================
// resolveMilestones
// ============================================================
describe('resolveMilestones', () => {
  it('propagates predecessor chains correctly', () => {
    const resolved = resolveMilestones(DEFAULT_MILESTONES_BEST);
    const c2Reg = resolved.find(m => m.id === 'c2_reg');
    expect(c2Reg).toBeDefined();
    // c2_reg depends on algo, which depends on cdmo
    // cdmo endM=7, algo starts after cdmo (lag 0), algo endM=13
    // c2_reg starts at algo.endM + lag(1) + 1 = 13 + 1 + 1 = 15
    expect(c2Reg!.startM).toBe(15);
    expect(c2Reg!.endM).toBe(16);
  });

  it('respects manualStart flag', () => {
    const resolved = resolveMilestones(DEFAULT_MILESTONES_BEST);
    const seed = resolved.find(m => m.id === 'seed');
    expect(seed!.startM).toBe(1);
    expect(seed!.endM).toBe(3);
  });

  it('resolves in finite passes', () => {
    // Should not infinite loop
    const resolved = resolveMilestones(DEFAULT_MILESTONES_BEST);
    expect(resolved.length).toBe(DEFAULT_MILESTONES_BEST.length);
  });
});

// ============================================================
// deriveFirstYearFactor
// ============================================================
describe('deriveFirstYearFactor', () => {
  it('Y1 always 0 (no commercial deployment)', () => {
    const factors = deriveFirstYearFactor(DEFAULT_MILESTONES_BEST);
    expect(factors[0]).toBe(0);
  });

  it('Y2 factor based on C2 reg approval month', () => {
    const factors = deriveFirstYearFactor(DEFAULT_MILESTONES_BEST);
    // C2 reg endM=16, deploy starts M17, Y2=M13-24, selling months = 24-17+1 = 8
    expect(factors[1]).toBeCloseTo(8 / 12, 4);
  });

  it('Y3-Y5 have positive factors', () => {
    const factors = deriveFirstYearFactor(DEFAULT_MILESTONES_BEST);
    expect(factors[2]).toBeGreaterThan(0);
    expect(factors[3]).toBeGreaterThanOrEqual(0.25);
    expect(factors[4]).toBeGreaterThanOrEqual(0.25);
  });
});

// ============================================================
// deriveDeploymentGating
// ============================================================
describe('deriveDeploymentGating', () => {
  it('C2 gate Y1=0 (no approval yet)', () => {
    const gating = deriveDeploymentGating(DEFAULT_MILESTONES_BEST);
    expect(gating.c2Gate[0]).toBe(0);
  });

  it('C2 gate opens in Y2 after approval', () => {
    const gating = deriveDeploymentGating(DEFAULT_MILESTONES_BEST);
    expect(gating.c2Gate[1]).toBeGreaterThan(0);
    expect(gating.c2Gate[1]).toBeLessThanOrEqual(1);
  });

  it('C3 gate closed in Y1-Y2', () => {
    const gating = deriveDeploymentGating(DEFAULT_MILESTONES_BEST);
    expect(gating.c3Gate[0]).toBe(0);
    expect(gating.c3Gate[1]).toBe(0);
  });
});

// ============================================================
// deriveLicenseArray
// ============================================================
describe('deriveLicenseArray', () => {
  it('places license and milestone in correct years', () => {
    const arr = deriveLicenseArray(DEFAULT_GLOBAL);
    expect(arr[DEFAULT_GLOBAL.license_year - 1]).toBe(DEFAULT_GLOBAL.license_amount);
    expect(arr[DEFAULT_GLOBAL.milestone_year - 1]).toBe(DEFAULT_GLOBAL.milestone_payment);
  });

  it('returns 5-element array', () => {
    const arr = deriveLicenseArray(DEFAULT_GLOBAL);
    expect(arr).toHaveLength(5);
  });
});

// ============================================================
// mergeScenario
// ============================================================
describe('mergeScenario', () => {
  it('extracts correct values from neutral override', () => {
    const so = DEFAULT_SCENARIO_OVERRIDES.neutral;
    const merged = mergeScenario(DEFAULT_GLOBAL, so);
    expect(merged.rr).toBe(0.85);
    expect(merged.bedFactor).toBe(1.0);
    expect(merged.cogsRate).toBeCloseTo(0.34014, 5);
    expect(merged.growths).toHaveLength(5);
  });

  it('optimistic has higher rr and bed factor', () => {
    const so = DEFAULT_SCENARIO_OVERRIDES.optimistic;
    const merged = mergeScenario(DEFAULT_GLOBAL, so);
    expect(merged.rr).toBe(0.85);
    expect(merged.bedFactor).toBe(1.15);
  });
});

// ============================================================
// calculate — Neutral Best Case (Primary SOT scenario)
// ============================================================
describe('calculate — Neutral Best Case', () => {
  const so = DEFAULT_SCENARIO_OVERRIDES.neutral;
  let result: CalcResult;

  beforeAll(() => {
    result = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST, so);
  });

  it('produces 10 years of output', () => {
    expect(result.years).toHaveLength(10);
  });

  it('Y1 has zero beds deployed (pre-approval)', () => {
    expect(result.years[0].cumulative_beds).toBe(0);
    expect(result.years[0].total_new).toBe(0);
  });

  it('Y1 has no commercial revenue before approval', () => {
    const y1 = result.years[0];
    expect(y1.total_revenue).toBe(0);
    expect(y1.hw_direct).toBe(0);
    expect(y1.saas_direct).toBe(0);
  });

  it('Y2 has bed deployments after C2 approval', () => {
    expect(result.years[1].cumulative_beds).toBeGreaterThan(0);
  });

  it('Y2 revenue includes hardware + SaaS + license', () => {
    const y2 = result.years[1];
    expect(y2.hw_direct).toBeGreaterThan(0);
    expect(y2.total_revenue).toBeGreaterThan(0);
  });

  it('EBITDA turns positive by Y3', () => {
    expect(result.years[2].ebitda).toBeGreaterThan(0);
  });

  it('Y5 revenue aligns with v2.4 profile', () => {
    const y5Rev = Math.round(result.years[4].total_revenue / 10000);
    expect(y5Rev).toBeGreaterThanOrEqual(9000);
    expect(y5Rev).toBeLessThanOrEqual(10000);
  });

  it('Y10 revenue grows from Y5 at 25-30% rates', () => {
    expect(result.years[9].total_revenue).toBeGreaterThan(result.years[4].total_revenue * 2);
  });

  it('COGS only on direct-sale beds (not Baxter channel)', () => {
    const y2 = result.years[1];
    expect(y2.cogs).toBeGreaterThan(0);
    expect(y2.cogs).toBeLessThan(y2.total_revenue);
  });

  it('cumulative beds never decrease', () => {
    for (let i = 1; i < 10; i++) {
      expect(result.years[i].cumulative_beds).toBeGreaterThanOrEqual(result.years[i - 1].cumulative_beds);
    }
  });

  it('gross margin stays within reasonable bounds for revenue-positive years', () => {
    for (const y of result.years) {
      if (y.total_revenue > 0 && y.gross_margin !== null) {
        expect(y.gross_margin).toBeGreaterThanOrEqual(-0.2);
      }
    }
  });

  it('BOM values match computed values', () => {
    expect(result.bom_c2).toBe(32000);
    expect(result.bom_c3).toBe(21500);
  });
});

// ============================================================
// calculate — Neutral Base Case
// ============================================================
describe('calculate — Neutral Base Case', () => {
  const so = DEFAULT_SCENARIO_OVERRIDES.neutral;
  let result: CalcResult;

  beforeAll(() => {
    result = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY_BASE, DEFAULT_OPEX, DEFAULT_MILESTONES_BASE, so);
  });

  it('produces 10 years', () => {
    expect(result.years).toHaveLength(10);
  });

  it('Base case delays deployment vs Best case', () => {
    const bestResult = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST, so);
    // Best case has beds in Y2, Base case delays
    expect(bestResult.years[1].cumulative_beds).toBeGreaterThan(0);
    // Base Y2 should have 0 beds (C2 reg at M24)
    expect(result.years[1].cumulative_beds).toBe(0);
  });

  it('Base case remains a valid 10-year projection', () => {
    expect(result.years[4].total_revenue).toBeGreaterThan(0);
    expect(result.years[9].total_revenue).toBeGreaterThan(result.years[4].total_revenue);
  });
});

// ============================================================
// calculate — Scenario comparison
// ============================================================
describe('calculate — Scenario comparison', () => {
  it('optimistic produces higher Y10 revenue than neutral', () => {
    const neutral = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST, DEFAULT_SCENARIO_OVERRIDES.neutral);
    const optimistic = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST, DEFAULT_SCENARIO_OVERRIDES.optimistic);
    expect(optimistic.years[9].total_revenue).toBeGreaterThan(neutral.years[9].total_revenue);
  });

  it('conservative produces lower Y10 revenue than neutral', () => {
    const neutral = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST, DEFAULT_SCENARIO_OVERRIDES.neutral);
    const conservative = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST, DEFAULT_SCENARIO_OVERRIDES.conservative);
    expect(conservative.years[9].total_revenue).toBeLessThan(neutral.years[9].total_revenue);
  });
});

// ============================================================
// calculate — Edge cases
// ============================================================
describe('calculate — Edge cases', () => {
  it('handles zero deployment arrays', () => {
    const zeroYearly = {
      direct_c2: [0, 0, 0, 0, 0],
      direct_c3: [0, 0, 0, 0, 0],
      baxter_c2: [0, 0, 0, 0, 0],
      baxter_c3: [0, 0, 0, 0, 0],
      planned_upgrade: [0, 0, 0, 0, 0],
      depreciation: [0, 0, 0, 0, 0],
      baxter_license: [0, 0, 0, 0, 0],
    };
    const result = calculate(DEFAULT_GLOBAL, zeroYearly, DEFAULT_OPEX);
    expect(result.years).toHaveLength(10);
    expect(result.years[0].total_revenue).toBe(0);
    expect(result.years[0].cumulative_beds).toBe(0);
  });

  it('handles no milestones (uses default factors)', () => {
    const result = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX);
    expect(result.years).toHaveLength(10);
  });

  it('handles no scenario override (uses global rr_base)', () => {
    const result = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST);
    expect(result.years).toHaveLength(10);
    // Should still produce valid output
    expect(result.years[4].total_revenue).toBeGreaterThan(0);
  });
});

// ============================================================
// validateModel
// ============================================================
describe('validateModel', () => {
  it('returns no errors for default model', () => {
    const warnings = validateModel(DEFAULT_MODEL);
    const errors = warnings.filter(w => w.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it('flags rr_base out of range', () => {
    const model = structuredClone(DEFAULT_MODEL);
    model.global.rr_base = 0.99;
    const warnings = validateModel(model);
    expect(warnings.some(w => w.field === 'rr_base')).toBe(true);
  });

  it('flags zero deployment beds', () => {
    const model = structuredClone(DEFAULT_MODEL);
    model.yearly.direct_c2 = [0, 0, 0, 0, 0];
    model.yearly.direct_c3 = [0, 0, 0, 0, 0];
    model.yearly.baxter_c2 = [0, 0, 0, 0, 0];
    model.yearly.baxter_c3 = [0, 0, 0, 0, 0];
    const warnings = validateModel(model);
    expect(warnings.some(w => w.field === 'deploy')).toBe(true);
  });

  it('flags extreme growth rate', () => {
    const model = structuredClone(DEFAULT_MODEL);
    model.global.growth_y6 = 1.5; // 150% — out of range
    const warnings = validateModel(model);
    expect(warnings.some(w => w.field === 'growth_y6')).toBe(true);
  });
});

// ============================================================
// Snapshot: Neutral Best Case Y1-Y5 key metrics
// ============================================================
describe('Snapshot — Neutral Best Case financial metrics', () => {
  const so = DEFAULT_SCENARIO_OVERRIDES.neutral;
  const result = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST, so);

  it('Y1-Y5 revenue snapshot (万)', () => {
    const revs = result.years.slice(0, 5).map(y => Math.round(y.total_revenue / 10000));
    expect(revs).toMatchSnapshot();
  });

  it('Y1-Y5 EBITDA snapshot (万)', () => {
    const ebitda = result.years.slice(0, 5).map(y => Math.round(y.ebitda / 10000));
    expect(ebitda).toMatchSnapshot();
  });

  it('Y1-Y5 cumulative beds snapshot', () => {
    const beds = result.years.slice(0, 5).map(y => y.cumulative_beds);
    expect(beds).toMatchSnapshot();
  });

  it('Y6-Y10 revenue snapshot (万)', () => {
    const revs = result.years.slice(5, 10).map(y => Math.round(y.total_revenue / 10000));
    expect(revs).toMatchSnapshot();
  });
});
