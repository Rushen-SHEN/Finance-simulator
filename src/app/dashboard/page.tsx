'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import modelJson from '@/data/financial-model.v2.0.json';
import { calculateImpact, calculateMetrics, getBaselineParameters, getBreakEvenYear, type MappingBlockId } from '@/lib/calculation-engine';
import { BreakEvenIndicator, MappingImpactSummary, MetricCard, SensitivityPanel, TraceDrawer, VersionBadge, type MappingReference } from '@/components/metric-trace-badges';

type ScenarioKey = keyof typeof modelJson.scenarioSnapshots;

function buildMappingIndex(): Partial<Record<MappingBlockId, MappingReference>> {
  return modelJson.mappingBlocks.reduce<Partial<Record<MappingBlockId, MappingReference>>>((accumulator, mapping) => {
    accumulator[mapping.blockId as MappingBlockId] = mapping as MappingReference;
    return accumulator;
  }, {});
}

export default function DashboardPage() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('baseline');
  const [selectedMappings, setSelectedMappings] = useState<MappingReference[] | null>(null);

  const mappingIndex = useMemo(() => buildMappingIndex(), []);
  const baselineParams = useMemo(() => getBaselineParameters(), []);
  const scenarioParams = modelJson.scenarioSnapshots[scenarioKey].parameters;
  const baselineMetrics = useMemo(() => calculateMetrics(baselineParams), [baselineParams]);
  const scenarioMetrics = useMemo(() => calculateMetrics(scenarioParams), [scenarioParams]);
  const impact = useMemo(() => calculateImpact(baselineParams, scenarioParams), [baselineParams, scenarioParams]);
  const affectedMappings = impact.changes.length > 0 ? new Set(impact.changes.flatMap((change) => change.impactedMappings)) : new Set<MappingBlockId>();

  const y10 = 9;
  const metricCards = [
    { title: 'Revenue', value: scenarioMetrics.revenue[y10], unit: '万元', mappingIds: ['M-01'] as MappingBlockId[] },
    { title: 'EBITDA', value: scenarioMetrics.ebitda[y10], unit: '万元', mappingIds: ['M-04'] as MappingBlockId[], highlight: scenarioMetrics.ebitda[y10] > 0 },
    { title: 'ARR', value: scenarioMetrics.arr[y10], unit: '万元', mappingIds: ['M-07'] as MappingBlockId[] },
    { title: 'SOM', value: scenarioMetrics.somPenetration[y10].toFixed(2), unit: '%', mappingIds: ['M-03'] as MappingBlockId[] },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-100">
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">ARIA Finance Plan</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Traceable 10-Year Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">Keep Finance-simulator aligned with ARIA finance plan v2.0, and expose exactly which BP blocks move when assumptions change.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900">Main Simulator</Link>
              <Link href="/parameters" className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/20">Open Parameters</Link>
            </div>
          </div>
          <div className="mt-4">
            <VersionBadge
              modelVersion={modelJson.modelVersion}
              sourcePlanVersion={modelJson.sourcePlanVersion}
              lastSyncDate={modelJson.lastSyncDate}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {(Object.keys(modelJson.scenarioSnapshots) as ScenarioKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setScenarioKey(key)}
              className={`rounded-lg px-4 py-2 text-sm transition ${scenarioKey === key ? 'bg-cyan-500 text-slate-950' : 'border border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800'}`}
            >
              {modelJson.scenarioSnapshots[key].label}
            </button>
          ))}
        </div>

        {affectedMappings.size > 0 ? (
          <div className="mb-6">
            <MappingImpactSummary
              affectedMappings={affectedMappings}
              allMappings={mappingIndex}
              onViewTrace={(blockId) => {
                const mapping = mappingIndex[blockId];
                if (mapping) {
                  setSelectedMappings([mapping]);
                }
              }}
            />
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          {metricCards.map((card) => (
            <MetricCard
              key={card.title}
              title={card.title}
              value={card.value}
              unit={card.unit}
              highlight={card.highlight}
              mappings={card.mappingIds.map((mappingId) => mappingIndex[mappingId]).filter(Boolean) as MappingReference[]}
              onOpenTrace={setSelectedMappings}
            />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">10-Year Projection</h2>
                <p className="text-sm text-slate-400">Selected scenario: {modelJson.scenarioSnapshots[scenarioKey].description}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-400">
                    <th className="px-3 py-2">Year</th>
                    <th className="px-3 py-2 text-right">Revenue</th>
                    <th className="px-3 py-2 text-right">EBITDA</th>
                    <th className="px-3 py-2 text-right">ARR</th>
                    <th className="px-3 py-2 text-right">Beds</th>
                    <th className="px-3 py-2 text-right">SOM</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioMetrics.years.map((year, index) => (
                    <tr key={year} className="border-b border-slate-900/70">
                      <td className="px-3 py-2 font-medium text-white">{year}</td>
                      <td className="px-3 py-2 text-right text-slate-300">{scenarioMetrics.revenue[index].toLocaleString('zh-CN')}</td>
                      <td className={`px-3 py-2 text-right font-medium ${scenarioMetrics.ebitda[index] >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{scenarioMetrics.ebitda[index].toLocaleString('zh-CN')}</td>
                      <td className="px-3 py-2 text-right text-slate-300">{scenarioMetrics.arr[index].toLocaleString('zh-CN')}</td>
                      <td className="px-3 py-2 text-right text-slate-300">{scenarioMetrics.beds[index].toLocaleString('zh-CN')}</td>
                      <td className="px-3 py-2 text-right text-slate-300">{scenarioMetrics.somPenetration[index].toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <BreakEvenIndicator
              baselineYear={getBreakEvenYear(baselineMetrics.ebitda)}
              scenarioYear={getBreakEvenYear(scenarioMetrics.ebitda)}
            />
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold">Scenario deltas</h2>
              <div className="space-y-3">
                <SensitivityPanel metricName="Y10 Revenue" baselineValue={baselineMetrics.revenue[y10]} scenarioValue={scenarioMetrics.revenue[y10]} unit="万元" />
                <SensitivityPanel metricName="Y10 EBITDA" baselineValue={baselineMetrics.ebitda[y10]} scenarioValue={scenarioMetrics.ebitda[y10]} unit="万元" />
                <SensitivityPanel metricName="Y10 ARR" baselineValue={baselineMetrics.arr[y10]} scenarioValue={scenarioMetrics.arr[y10]} unit="万元" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TraceDrawer mappings={selectedMappings ?? []} isOpen={selectedMappings !== null} onClose={() => setSelectedMappings(null)} />
    </div>
  );
}