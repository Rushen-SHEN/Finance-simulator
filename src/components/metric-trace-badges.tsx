'use client';

import { useEffect } from 'react';
import type { MappingBlockId } from '@/lib/calculation-engine';

export interface MappingReference {
  blockId: MappingBlockId;
  label: string;
  bpSection: string;
  content: string;
  updateTriggers: string[];
  affectedMetrics: string[];
}

interface MetricTraceBadgesProps {
  mappings: MappingReference[];
  onOpenTrace: (mappings: MappingReference[]) => void;
  compact?: boolean;
}

export function MetricTraceBadges({ mappings, onOpenTrace, compact = false }: MetricTraceBadgesProps) {
  if (mappings.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? 'gap-1' : ''}`}>
      {mappings.map((mapping) => (
        <button
          key={mapping.blockId}
          onClick={() => onOpenTrace([mapping])}
          className={`rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 transition hover:bg-cyan-500/20 ${compact ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs font-semibold'}`}
        >
          {mapping.blockId}
        </button>
      ))}
    </div>
  );
}

interface TraceDrawerProps {
  mappings: MappingReference[];
  isOpen: boolean;
  onClose: () => void;
}

export function TraceDrawer({ mappings, isOpen, onClose }: TraceDrawerProps) {
  if (!isOpen || mappings.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 px-4 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">BP Traceability</h2>
            <p className="text-sm text-slate-400">Link every visible number back to its business plan source block.</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
            Close
          </button>
        </div>

        <div className="space-y-4">
          {mappings.map((mapping) => (
            <div key={mapping.blockId} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">{mapping.blockId}</span>
                <h3 className="font-semibold text-white">{mapping.label}</h3>
              </div>
              <p className="text-sm text-slate-300">{mapping.bpSection}</p>
              <p className="mt-2 text-sm text-slate-400">{mapping.content}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {mapping.affectedMetrics.map((metric) => (
                  <span key={metric} className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-300">
                    {metric}
                  </span>
                ))}
              </div>
              <ul className="mt-3 space-y-1 text-xs text-slate-400">
                {mapping.updateTriggers.map((trigger) => (
                  <li key={trigger}>• {trigger}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  subtitle?: string;
  highlight?: boolean;
  mappings: MappingReference[];
  onOpenTrace: (mappings: MappingReference[]) => void;
}

export function MetricCard({ title, value, unit, subtitle, highlight = false, mappings, onOpenTrace }: MetricCardProps) {
  return (
    <div className={`rounded-2xl border p-5 shadow-lg ${highlight ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/70'}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
          {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        <MetricTraceBadges mappings={mappings} onOpenTrace={onOpenTrace} compact />
      </div>
      <div className="text-3xl font-bold text-white">
        {typeof value === 'number' ? value.toLocaleString('zh-CN') : value}
        {unit ? <span className="ml-2 text-sm font-medium text-slate-400">{unit}</span> : null}
      </div>
    </div>
  );
}

interface MappingImpactSummaryProps {
  affectedMappings: Set<MappingBlockId>;
  allMappings: Partial<Record<MappingBlockId, MappingReference>>;
  onViewTrace: (blockId: MappingBlockId) => void;
}

export function MappingImpactSummary({ affectedMappings, allMappings, onViewTrace }: MappingImpactSummaryProps) {
  if (affectedMappings.size === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <p className="mb-3 text-sm font-semibold text-amber-200">Affected BP mapping blocks</p>
      <div className="flex flex-wrap gap-2">
        {Array.from(affectedMappings).sort().map((blockId) => (
          <button
            key={blockId}
            onClick={() => onViewTrace(blockId)}
            className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-400/20"
          >
            {blockId} {allMappings[blockId] ? `· ${allMappings[blockId]?.label}` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SensitivityPanelProps {
  metricName: string;
  baselineValue: number;
  scenarioValue: number;
  unit: string;
}

export function SensitivityPanel({ metricName, baselineValue, scenarioValue, unit }: SensitivityPanelProps) {
  const delta = scenarioValue - baselineValue;
  const percent = baselineValue === 0 ? 0 : (delta / baselineValue) * 100;
  const tone = delta >= 0 ? 'text-emerald-300' : 'text-rose-300';

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-white">{metricName}</p>
        <p className="text-xs text-slate-400">Baseline vs selected scenario</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-300">{baselineValue.toLocaleString('zh-CN')} → {scenarioValue.toLocaleString('zh-CN')} {unit}</p>
        <p className={`text-xs font-semibold ${tone}`}>{delta >= 0 ? '+' : ''}{delta.toLocaleString('zh-CN')} ({delta >= 0 ? '+' : ''}{percent.toFixed(1)}%)</p>
      </div>
    </div>
  );
}

interface BreakEvenIndicatorProps {
  baselineYear: number | null;
  scenarioYear: number | null;
  onWarning?: (message: string) => void;
}

export function BreakEvenIndicator({ baselineYear, scenarioYear, onWarning }: BreakEvenIndicatorProps) {
  const slipped = baselineYear !== null && scenarioYear !== null && scenarioYear > baselineYear;

  useEffect(() => {
    if (slipped && onWarning) {
      onWarning(`EBITDA break-even moved from Y${baselineYear} to Y${scenarioYear}.`);
    }
  }, [baselineYear, onWarning, scenarioYear, slipped]);

  return (
    <div className={`rounded-2xl border p-5 text-center ${slipped ? 'border-rose-500/30 bg-rose-500/10 text-rose-100' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'}`}>
      <p className="text-xs uppercase tracking-wide text-slate-400">EBITDA Break-Even</p>
      <p className="mt-2 text-3xl font-bold">Y{scenarioYear ?? '—'}</p>
      {baselineYear !== scenarioYear && baselineYear !== null ? <p className="mt-1 text-xs text-slate-300">Baseline Y{baselineYear}</p> : null}
    </div>
  );
}

interface AuditTrailRowProps {
  parameterName: string;
  oldValue: number | number[];
  newValue: number | number[];
  timestamp: string;
  affectedMetrics: string[];
  affectedMappings: MappingBlockId[];
}

function formatValue(value: number | number[]): string {
  return Array.isArray(value) ? value.join(', ') : String(value);
}

export function AuditTrailRow({ parameterName, oldValue, newValue, timestamp, affectedMetrics, affectedMappings }: AuditTrailRowProps) {
  return (
    <tr className="border-t border-slate-800 align-top">
      <td className="px-4 py-3 text-sm text-white">{parameterName}</td>
      <td className="px-4 py-3 text-xs text-slate-400">{formatValue(oldValue)}</td>
      <td className="px-4 py-3 text-xs text-slate-400">{formatValue(newValue)}</td>
      <td className="px-4 py-3 text-xs text-slate-400">{affectedMetrics.join(', ')}</td>
      <td className="px-4 py-3 text-xs text-slate-400">
        <div className="flex flex-wrap gap-1">
          {affectedMappings.map((block) => (
            <span key={block} className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-cyan-300">{block}</span>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-slate-500">{new Date(timestamp).toLocaleString('zh-CN')}</div>
      </td>
    </tr>
  );
}

interface VersionBadgeProps {
  modelVersion: string;
  sourcePlanVersion: string;
  lastSyncDate: string;
}

export function VersionBadge({ modelVersion, sourcePlanVersion, lastSyncDate }: VersionBadgeProps) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300">
      <span>Model {modelVersion}</span>
      <span>•</span>
      <span>{sourcePlanVersion}</span>
      <span>•</span>
      <span>Synced {new Date(lastSyncDate).toLocaleDateString('zh-CN')}</span>
    </div>
  );
}