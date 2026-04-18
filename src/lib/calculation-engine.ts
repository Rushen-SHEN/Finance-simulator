'use client';

import modelJson from '@/data/financial-model.v2.0.json';

export type MappingBlockId =
  | 'M-01'
  | 'M-02'
  | 'M-03'
  | 'M-04'
  | 'M-05'
  | 'M-06'
  | 'M-07';

export type MetricId =
  | 'revenue'
  | 'cogs'
  | 'grossProfit'
  | 'opex'
  | 'ebitda'
  | 'netProfit'
  | 'arr'
  | 'beds'
  | 'activeBeds'
  | 'somPenetration'
  | 'yoyGrowthRate';

export interface ScenarioParameters {
  licenseFeeYear: number;
  licenseFeeAmount: number;
  milestonePaymentYear: number;
  milestonePaymentAmount: number;
  hwRevenueShare: number;
  saasRevenueShare: number;
  renewalRate: number;
  bedDeploymentCurve: number[];
}

export interface CalculatedMetrics {
  years: string[];
  revenue: number[];
  cogs: number[];
  grossProfit: number[];
  opex: number[];
  ebitda: number[];
  netProfit: number[];
  arr: number[];
  beds: number[];
  activeBeds: number[];
  somPenetration: number[];
  yoyGrowthRate: Array<number | null>;
}

export interface ParameterChange {
  parameterId: keyof ScenarioParameters;
  oldValue: number | number[];
  newValue: number | number[];
  affectedMetrics: MetricId[];
  impactedMappings: MappingBlockId[];
}

export interface AuditRecord {
  timestamp: string;
  scenarioId: string;
  parameterChange: ParameterChange;
}

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

type MetricSeries = Record<MetricId, number[] | Array<number | null>>;

const baseline = modelJson.scenarioSnapshots.baseline.parameters as ScenarioParameters;
const baselineMetrics = modelJson.baselineMetrics;
const metricConfig: Record<keyof ScenarioParameters, { affectedMetrics: MetricId[]; impactedMappings: MappingBlockId[] }> = {
  licenseFeeYear: { affectedMetrics: ['revenue', 'ebitda', 'netProfit'], impactedMappings: ['M-02', 'M-04', 'M-01'] },
  licenseFeeAmount: { affectedMetrics: ['revenue', 'ebitda', 'netProfit'], impactedMappings: ['M-02', 'M-04', 'M-01'] },
  milestonePaymentYear: { affectedMetrics: ['revenue', 'ebitda', 'netProfit'], impactedMappings: ['M-02', 'M-04', 'M-05'] },
  milestonePaymentAmount: { affectedMetrics: ['revenue', 'ebitda', 'netProfit'], impactedMappings: ['M-02', 'M-04', 'M-05'] },
  hwRevenueShare: { affectedMetrics: ['revenue', 'grossProfit', 'ebitda'], impactedMappings: ['M-02', 'M-01'] },
  saasRevenueShare: { affectedMetrics: ['revenue', 'grossProfit', 'arr', 'ebitda'], impactedMappings: ['M-02', 'M-07', 'M-01'] },
  renewalRate: { affectedMetrics: ['arr', 'revenue', 'ebitda', 'activeBeds'], impactedMappings: ['M-07', 'M-01'] },
  bedDeploymentCurve: { affectedMetrics: ['beds', 'activeBeds', 'revenue', 'arr', 'somPenetration', 'ebitda'], impactedMappings: ['M-03', 'M-06', 'M-01', 'M-05'] },
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function cloneBaseline(): CalculatedMetrics {
  return {
    years: [...baselineMetrics.years],
    revenue: [...baselineMetrics.revenue],
    cogs: [...baselineMetrics.cogs],
    grossProfit: [...baselineMetrics.grossProfit],
    opex: [...baselineMetrics.opex],
    ebitda: [...baselineMetrics.ebitda],
    netProfit: [...baselineMetrics.netProfit],
    arr: [...baselineMetrics.arr],
    beds: [...baselineMetrics.beds],
    activeBeds: [...baselineMetrics.activeBeds],
    somPenetration: [...baselineMetrics.somPenetration],
    yoyGrowthRate: [...baselineMetrics.yoyGrowthRate],
  };
}

function addOneOffShift(series: number[], fromYear: number, fromAmount: number, toYear: number, toAmount: number): number[] {
  const next = [...series];
  if (fromYear >= 1 && fromYear <= next.length) {
    next[fromYear - 1] -= fromAmount;
  }
  if (toYear >= 1 && toYear <= next.length) {
    next[toYear - 1] += toAmount;
  }
  return next;
}

function numberArrayDelta(values: number[], fallback = 1): number[] {
  return values.map((value, index) => {
    const base = baseline.bedDeploymentCurve[index] || 0;
    if (base === 0) {
      return value === 0 ? 1 : fallback;
    }
    return value / base;
  });
}

export function calculateMetrics(params: ScenarioParameters): CalculatedMetrics {
  const result = cloneBaseline();
  const bedRatios = numberArrayDelta(params.bedDeploymentCurve, 1);
  const hardwareFactor = (1 - params.hwRevenueShare) / (1 - baseline.hwRevenueShare);
  const saasFactor = (1 - params.saasRevenueShare) / (1 - baseline.saasRevenueShare);

  const baseCommercialRevenue = baselineMetrics.revenue.map((value, index) => {
    let oneOff = 0;
    if (index + 1 === baseline.licenseFeeYear) {
      oneOff += baseline.licenseFeeAmount;
    }
    if (index + 1 === baseline.milestonePaymentYear) {
      oneOff += baseline.milestonePaymentAmount;
    }
    return value - oneOff;
  });

  const revenue = [...result.revenue];
  const cogs = [...result.cogs];
  const grossProfit = [...result.grossProfit];
  const ebitda = [...result.ebitda];
  const netProfit = [...result.netProfit];
  const arr = [...result.arr];

  const activeBeds = params.bedDeploymentCurve.map((beds) => Math.round(beds * params.renewalRate));

  const revenueWithShiftedLicense = addOneOffShift(
    revenue,
    baseline.licenseFeeYear,
    baseline.licenseFeeAmount,
    params.licenseFeeYear,
    params.licenseFeeAmount
  );
  const revenueWithOneOffs = addOneOffShift(
    revenueWithShiftedLicense,
    baseline.milestonePaymentYear,
    baseline.milestonePaymentAmount,
    params.milestonePaymentYear,
    params.milestonePaymentAmount
  );

  for (let index = 0; index < result.years.length; index += 1) {
    const baselineActiveBeds = baselineMetrics.activeBeds[index] || 0;
    const activeBedFactor = baselineActiveBeds > 0 ? activeBeds[index] / baselineActiveBeds : bedRatios[index];
    const commercialFactor = 0.65 * bedRatios[index] * hardwareFactor + 0.35 * activeBedFactor * saasFactor;
    const commercialRevenue = round(baseCommercialRevenue[index] * commercialFactor);

    let oneOffRevenue = revenueWithOneOffs[index] - baseCommercialRevenue[index];
    if (index + 1 === baseline.licenseFeeYear) {
      oneOffRevenue -= baseline.licenseFeeAmount;
    }
    if (index + 1 === baseline.milestonePaymentYear) {
      oneOffRevenue -= baseline.milestonePaymentAmount;
    }
    if (index + 1 === params.licenseFeeYear) {
      oneOffRevenue += params.licenseFeeAmount;
    }
    if (index + 1 === params.milestonePaymentYear) {
      oneOffRevenue += params.milestonePaymentAmount;
    }

    revenue[index] = round(Math.max(0, commercialRevenue + oneOffRevenue));
    const cogsRatio = baselineMetrics.cogs[index] / Math.max(baseCommercialRevenue[index], 1);
    cogs[index] = round(Math.max(0, commercialRevenue * cogsRatio));
    grossProfit[index] = round(revenue[index] - cogs[index]);
    ebitda[index] = round(grossProfit[index] - result.opex[index]);
    netProfit[index] = round(baselineMetrics.netProfit[index] + (ebitda[index] - baselineMetrics.ebitda[index]) * 0.9);

    const baselineArrPerBed = baselineActiveBeds > 0 ? baselineMetrics.arr[index] / baselineActiveBeds : 0.7;
    arr[index] = round(Math.max(0, activeBeds[index] * baselineArrPerBed * saasFactor));
  }

  result.revenue = revenue;
  result.cogs = cogs;
  result.grossProfit = grossProfit;
  result.ebitda = ebitda;
  result.netProfit = netProfit;
  result.arr = arr;
  result.beds = [...params.bedDeploymentCurve];
  result.activeBeds = activeBeds;
  result.somPenetration = revenue.map((value) => round((value / modelJson.samBaseline) * 100));
  result.yoyGrowthRate = revenue.map((value, index) => {
    if (index === 0 || revenue[index - 1] === 0) {
      return null;
    }
    return round(((value - revenue[index - 1]) / revenue[index - 1]) * 100);
  });

  return result;
}

export function getBreakEvenYear(ebitda: number[]): number | null {
  const index = ebitda.findIndex((value) => value > 0);
  return index === -1 ? null : index + 1;
}

export function compareScenarios(params1: ScenarioParameters, params2: ScenarioParameters): ParameterChange[] {
  const keys = Object.keys(metricConfig) as Array<keyof ScenarioParameters>;

  return keys.flatMap((key) => {
    const oldValue = params1[key];
    const newValue = params2[key];
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      return [];
    }

    return [{
      parameterId: key,
      oldValue,
      newValue,
      affectedMetrics: metricConfig[key].affectedMetrics,
      impactedMappings: metricConfig[key].impactedMappings,
    }];
  });
}

export function calculateImpact(oldParams: ScenarioParameters, newParams: ScenarioParameters): {
  changes: ParameterChange[];
  oldMetrics: CalculatedMetrics;
  newMetrics: CalculatedMetrics;
  metricDeltas: MetricSeries;
  breakEvenShift: { old: number | null; new: number | null };
} {
  const oldMetrics = calculateMetrics(oldParams);
  const newMetrics = calculateMetrics(newParams);
  const changes = compareScenarios(oldParams, newParams);

  const metricIds: MetricId[] = [
    'revenue',
    'cogs',
    'grossProfit',
    'opex',
    'ebitda',
    'netProfit',
    'arr',
    'beds',
    'activeBeds',
    'somPenetration',
    'yoyGrowthRate',
  ];

  const metricDeltas = metricIds.reduce<MetricSeries>((accumulator, metricId) => {
    const next = newMetrics[metricId];
    const previous = oldMetrics[metricId];
    accumulator[metricId] = next.map((value, index) => {
      const prevValue = previous[index];
      if (value === null || prevValue === null) {
        return null;
      }
      return round(value - prevValue);
    });
    return accumulator;
  }, {} as MetricSeries);

  return {
    changes,
    oldMetrics,
    newMetrics,
    metricDeltas,
    breakEvenShift: {
      old: getBreakEvenYear(oldMetrics.ebitda),
      new: getBreakEvenYear(newMetrics.ebitda),
    },
  };
}

export function generateAuditRecord(
  oldParams: ScenarioParameters,
  newParams: ScenarioParameters,
  scenarioId: string
): AuditRecord | null {
  const [firstChange] = compareScenarios(oldParams, newParams);
  if (!firstChange) {
    return null;
  }

  return {
    timestamp: new Date().toISOString(),
    scenarioId,
    parameterChange: firstChange,
  };
}

export function identifyAffectedMappings(changes: ParameterChange[]): Set<MappingBlockId> {
  const blocks = new Set<MappingBlockId>();
  changes.forEach((change) => {
    change.impactedMappings.forEach((block) => blocks.add(block));
  });
  return blocks;
}

export function validateParameters(params: ScenarioParameters): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (params.licenseFeeYear < 1 || params.licenseFeeYear > 10) {
    errors.push('License fee year must stay within Y1-Y10.');
  }
  if (params.milestonePaymentYear < 1 || params.milestonePaymentYear > 10) {
    errors.push('Milestone payment year must stay within Y1-Y10.');
  }
  if (params.hwRevenueShare < 0.1 || params.hwRevenueShare > 0.25) {
    errors.push('Hardware revenue share must stay within 10%-25%.');
  }
  if (params.saasRevenueShare < 0.25 || params.saasRevenueShare > 0.5) {
    errors.push('SaaS revenue share must stay within 25%-50%.');
  }
  if (params.renewalRate < 0.5 || params.renewalRate > 0.85) {
    errors.push('Renewal rate must stay within 50%-85%.');
  }
  if (Math.abs(params.renewalRate - baseline.renewalRate) > 0.001) {
    warnings.push('Renewal rate is a strategy-locked parameter. Non-baseline values require board review.');
  }
  if (params.bedDeploymentCurve.length !== 10) {
    errors.push('Bed deployment curve must contain 10 yearly values.');
  }
  for (let index = 1; index < params.bedDeploymentCurve.length; index += 1) {
    if (params.bedDeploymentCurve[index] < params.bedDeploymentCurve[index - 1]) {
      errors.push(`Bed deployment must be non-decreasing. Y${index + 1} is below Y${index}.`);
      break;
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

export function getBaselineParameters(): ScenarioParameters {
  return structuredClone(baseline);
}