'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import modelJson from '@/data/financial-model.v2.0.json';
import { calculateImpact, calculateMetrics, generateAuditRecord, getBaselineParameters, identifyAffectedMappings, validateParameters, type AuditRecord, type MappingBlockId, type ScenarioParameters } from '@/lib/calculation-engine';
import { AuditTrailRow, MappingImpactSummary, TraceDrawer, VersionBadge, type MappingReference } from '@/components/metric-trace-badges';

type ScenarioKey = keyof typeof modelJson.scenarioSnapshots;

function buildMappingIndex(): Partial<Record<MappingBlockId, MappingReference>> {
  return modelJson.mappingBlocks.reduce<Partial<Record<MappingBlockId, MappingReference>>>((accumulator, mapping) => {
    accumulator[mapping.blockId as MappingBlockId] = mapping as MappingReference;
    return accumulator;
  }, {});
}

export default function ParametersPage() {
  const [params, setParams] = useState<ScenarioParameters>(getBaselineParameters());
  const [selectedMappings, setSelectedMappings] = useState<MappingReference[] | null>(null);
  const [auditLog, setAuditLog] = useState<AuditRecord[]>([]);

  const mappingIndex = useMemo(() => buildMappingIndex(), []);
  const baselineParams = useMemo(() => getBaselineParameters(), []);
  const validation = useMemo(() => validateParameters(params), [params]);
  const baselineMetrics = useMemo(() => calculateMetrics(baselineParams), [baselineParams]);
  const currentMetrics = useMemo(() => calculateMetrics(params), [params]);
  const impact = useMemo(() => calculateImpact(baselineParams, params), [baselineParams, params]);
  const affectedMappings = useMemo(() => identifyAffectedMappings(impact.changes), [impact.changes]);

  function applyParams(next: ScenarioParameters, scenarioId: string) {
    const record = generateAuditRecord(params, next, scenarioId);
    if (record) {
      setAuditLog((current) => [record, ...current].slice(0, 20));
    }
    setParams(next);
  }

  function updateNumber<K extends Exclude<keyof ScenarioParameters, 'bedDeploymentCurve'>>(key: K, value: ScenarioParameters[K]) {
    applyParams({ ...params, [key]: value }, 'custom');
  }

  function updateBed(yearIndex: number, value: number) {
    const next = [...params.bedDeploymentCurve];
    next[yearIndex] = value;
    applyParams({ ...params, bedDeploymentCurve: next }, 'custom');
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-100">
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-start justify-between gap-4 px-4 py-8 sm:px-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">Scenario Workbench</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">ARIA Parameter Controls</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Run board scenarios locally, see immediate KPI movement, and surface exactly which BP mapping blocks require synchronization.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900">Back to Dashboard</Link>
            <Link href="/" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900">Main Simulator</Link>
          </div>
          <div className="w-full">
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
          {(Object.keys(modelJson.scenarioSnapshots) as ScenarioKey[]).map((scenarioId) => (
            <button
              key={scenarioId}
              onClick={() => applyParams(structuredClone(modelJson.scenarioSnapshots[scenarioId].parameters), scenarioId)}
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              {modelJson.scenarioSnapshots[scenarioId].label}
            </button>
          ))}
          <button onClick={() => { setAuditLog([]); setParams(getBaselineParameters()); }} className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-500/20">Reset</button>
        </div>

        {validation.errors.length > 0 ? (
          <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {validation.errors.map((error) => <div key={error}>• {error}</div>)}
          </div>
        ) : null}
        {validation.warnings.length > 0 ? (
          <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            {validation.warnings.map((warning) => <div key={warning}>• {warning}</div>)}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Adjustable parameters</h2>
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2">License fee year <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">M-02</span></div>
                  <select value={params.licenseFeeYear} onChange={(event) => updateNumber('licenseFeeYear', Number(event.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100">
                    {[1, 2, 3, 4, 5].map((year) => <option key={year} value={year}>Y{year}</option>)}
                  </select>
                </label>
                <label className="text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2">License fee amount <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">M-02</span></div>
                  <input type="range" min="200" max="500" step="10" value={params.licenseFeeAmount} onChange={(event) => updateNumber('licenseFeeAmount', Number(event.target.value))} className="w-full" />
                  <div className="mt-1 text-xs text-slate-400">{params.licenseFeeAmount} 万元</div>
                </label>
                <label className="text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2">Milestone payment year <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">M-05</span></div>
                  <select value={params.milestonePaymentYear} onChange={(event) => updateNumber('milestonePaymentYear', Number(event.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100">
                    {[2, 3, 4, 5, 6].map((year) => <option key={year} value={year}>Y{year}</option>)}
                  </select>
                </label>
                <label className="text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2">Milestone amount <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">M-05</span></div>
                  <input type="range" min="100" max="300" step="10" value={params.milestonePaymentAmount} onChange={(event) => updateNumber('milestonePaymentAmount', Number(event.target.value))} className="w-full" />
                  <div className="mt-1 text-xs text-slate-400">{params.milestonePaymentAmount} 万元</div>
                </label>
                <label className="text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2">Hardware revenue share <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">M-02</span></div>
                  <input type="range" min="0.1" max="0.25" step="0.01" value={params.hwRevenueShare} onChange={(event) => updateNumber('hwRevenueShare', Number(event.target.value))} className="w-full" />
                  <div className="mt-1 text-xs text-slate-400">{(params.hwRevenueShare * 100).toFixed(0)}%</div>
                </label>
                <label className="text-sm text-slate-300">
                  <div className="mb-2 flex items-center gap-2">SaaS revenue share <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">M-07</span></div>
                  <input type="range" min="0.25" max="0.5" step="0.01" value={params.saasRevenueShare} onChange={(event) => updateNumber('saasRevenueShare', Number(event.target.value))} className="w-full" />
                  <div className="mt-1 text-xs text-slate-400">{(params.saasRevenueShare * 100).toFixed(0)}%</div>
                </label>
                <label className="text-sm text-slate-300 md:col-span-2">
                  <div className="mb-2 flex items-center gap-2">Renewal rate <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">M-07</span></div>
                  <input type="range" min="0.5" max="0.85" step="0.01" value={params.renewalRate} onChange={(event) => updateNumber('renewalRate', Number(event.target.value))} className="w-full" />
                  <div className="mt-1 text-xs text-slate-400">{(params.renewalRate * 100).toFixed(1)}%</div>
                </label>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-300">Bed deployment curve <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-300">M-03</span></div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {params.bedDeploymentCurve.map((beds, index) => (
                    <label key={index} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
                      <div className="mb-2 text-xs text-slate-500">Y{index + 1}</div>
                      <input
                        type="number"
                        min="0"
                        value={beds}
                        onChange={(event) => updateBed(index, Number(event.target.value))}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold">Impact summary</h2>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-xs text-slate-500">Y2 EBITDA</div>
                  <div className="mt-2 text-xl font-bold text-white">{baselineMetrics.ebitda[1].toLocaleString('zh-CN')} → {currentMetrics.ebitda[1].toLocaleString('zh-CN')}</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-xs text-slate-500">Y10 Revenue</div>
                  <div className="mt-2 text-xl font-bold text-white">{baselineMetrics.revenue[9].toLocaleString('zh-CN')} → {currentMetrics.revenue[9].toLocaleString('zh-CN')}</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="text-xs text-slate-500">Y10 ARR</div>
                  <div className="mt-2 text-xl font-bold text-white">{baselineMetrics.arr[9].toLocaleString('zh-CN')} → {currentMetrics.arr[9].toLocaleString('zh-CN')}</div>
                </div>
              </div>
            </div>

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
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold">Audit trail</h2>
          {auditLog.length === 0 ? (
            <p className="text-sm text-slate-400">No parameter changes recorded in this session.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="px-4 py-2">Parameter</th>
                    <th className="px-4 py-2">Old</th>
                    <th className="px-4 py-2">New</th>
                    <th className="px-4 py-2">Affected metrics</th>
                    <th className="px-4 py-2">Affected BP blocks</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((entry) => (
                    <AuditTrailRow
                      key={`${entry.timestamp}-${entry.parameterChange.parameterId}`}
                      parameterName={entry.parameterChange.parameterId}
                      oldValue={entry.parameterChange.oldValue}
                      newValue={entry.parameterChange.newValue}
                      timestamp={entry.timestamp}
                      affectedMetrics={entry.parameterChange.affectedMetrics}
                      affectedMappings={entry.parameterChange.impactedMappings}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TraceDrawer mappings={selectedMappings ?? []} isOpen={selectedMappings !== null} onClose={() => setSelectedMappings(null)} />
    </div>
  );
}