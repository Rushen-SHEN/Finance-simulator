'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ModelInputs, calculate, CalcResult } from '@/lib/calculator';
import { DEFAULT_MODEL, YEAR_LABELS_SHORT } from '@/lib/defaults';
import { loadModel, loadAuditLog, AuditEntry } from '@/lib/storage';
import { listArchives } from '@/lib/archiveStore';
import { detectChanges } from '@/lib/changeTracker';
import {
  BP_MAIN_TABLE, BP_SOM, BP_CHANNEL,
  BP_MAPPING_BLOCKS, ROADSHOW_MAPPING_BLOCKS, ROADSHOW_DATA_POINTS,
  BP_SENSITIVITY, DOC_VERSIONS,
  DataConflict, detectConflicts, generateAuditReport,
} from '@/lib/bp-reference';
import { extractRoadshowUpdates } from '@/lib/docGenerator';

/** Roadshow-to-Simulator mapping section with live conflict detection */
function RoadshowMappingSection({ model, resultBest }: { model: ModelInputs; resultBest: CalcResult }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const liveUpdates = useMemo(
    () => extractRoadshowUpdates(model, resultBest),
    [model, resultBest]
  );

  // Group ROADSHOW_DATA_POINTS by slideId, compare bpValue vs liveValue
  const slideGroups = useMemo(() => {
    const groups: Record<string, { point: typeof ROADSHOW_DATA_POINTS[0]; liveValue: string; changed: boolean }[]> = {};
    for (const pt of ROADSHOW_DATA_POINTS) {
      const live = liveUpdates[pt.field] ?? '';
      const changed = live !== pt.bpValue;
      if (!groups[pt.slideId]) groups[pt.slideId] = [];
      groups[pt.slideId].push({ point: pt, liveValue: live, changed });
    }
    return groups;
  }, [liveUpdates]);

  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">路演 ↔ Simulator 数据映射</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ROADSHOW_MAPPING_BLOCKS.map(block => {
          const slidePoints = slideGroups[block.source] || [];
          const changedCount = slidePoints.filter(p => p.changed).length;
          const isExpanded = expanded === block.id;

          return (
            <div
              key={block.id}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${
                changedCount > 0
                  ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              }`}
              onClick={() => setExpanded(isExpanded ? null : block.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      changedCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                    }`}>{block.id}</span>
                    <span className="text-sm font-bold text-white">{block.content}</span>
                    {changedCount > 0 ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                        {changedCount} 项变更
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">✓ 同步</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-1.5 px-2 py-1 rounded bg-slate-800/60 border border-slate-700/40 inline-block">
                    <span className="text-purple-400/80">{block.sourceLabel}</span>
                    <span className="text-slate-500 mx-1.5">↔</span>
                    <span className="text-cyan-400/80">{block.targetLabel}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1.5">触发: {block.trigger}</div>
                </div>
                <span className="text-slate-500 text-xs">{isExpanded ? '▼' : '▶'}</span>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  {slidePoints.length === 0 ? (
                    <div className="text-xs text-slate-500">无映射数据点。</div>
                  ) : (
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                      {slidePoints.map((sp, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                          sp.changed ? 'bg-amber-500/10' : 'bg-slate-800/30'
                        }`}>
                          <span className="text-slate-400 w-[140px] truncate" title={sp.point.field}>{sp.point.label}</span>
                          <span className={`font-mono ${sp.changed ? 'text-red-400 line-through' : 'text-slate-500'}`}>
                            {sp.point.bpValue.length > 30 ? sp.point.bpValue.slice(0, 30) + '…' : sp.point.bpValue}
                          </span>
                          {sp.changed && (
                            <>
                              <span className="text-slate-600">→</span>
                              <span className="font-mono text-green-400">
                                {sp.liveValue.length > 30 ? sp.liveValue.slice(0, 30) + '…' : sp.liveValue}
                              </span>
                            </>
                          )}
                          {!sp.changed && <span className="text-green-500">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BPMappingPage() {
  const [model, setModel] = useState<ModelInputs>(structuredClone(DEFAULT_MODEL));
  const [initialized, setInitialized] = useState(false);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [staleWarning, setStaleWarning] = useState<string | null>(null);

  if (!initialized && typeof window !== 'undefined') {
    const saved = loadModel();
    if (JSON.stringify(saved) !== JSON.stringify(model)) setModel(saved);
    setAuditLog(loadAuditLog());
    setInitialized(true);
  }

  // Check if BP/FP archives are stale vs current model
  useEffect(() => {
    if (!initialized) return;
    (async () => {
      try {
        const bpArchives = await listArchives('bp');
        const fpArchives = await listArchives('financial_plan');
        if (bpArchives.length === 0 && fpArchives.length === 0) {
          setStaleWarning('尚未生成 BP/财务计划快照。请返回模拟器点击"接受变更"生成文档。');
          return;
        }
        const latest = [...bpArchives, ...fpArchives].sort((a, b) =>
          b.timestamp - a.timestamp
        )[0];
        if (latest.modelSnapshot) {
          const changes = detectChanges(latest.modelSnapshot, model);
          if (changes.changedGroups.length > 0) {
            setStaleWarning(
              `参数已变更（${changes.changedGroups.map(g => g.label).join('、')}），` +
              `BP/财务计划快照尚未更新。请返回模拟器点击"接受变更"以同步文档。`
            );
          } else {
            setStaleWarning(null);
          }
        }
      } catch {
        // IndexedDB unavailable — skip
      }
    })();
  }, [initialized, model]);

  const scenario = model.active_scenario || 'neutral';
  const so = model.scenario_overrides?.[scenario];

  const resultBest: CalcResult = useMemo(
    () => calculate(model.global, model.yearly, model.opex, model.milestones_best, so),
    [model, so]
  );

  const effectiveRR = so?.rr_base ?? model.global.rr_base;
  const growthRates = useMemo(
    () => [
      so?.growth_y6 ?? model.global.growth_y6,
      so?.growth_y7 ?? model.global.growth_y7,
      so?.growth_y8 ?? model.global.growth_y8,
      so?.growth_y9 ?? model.global.growth_y9,
      so?.growth_y10 ?? model.global.growth_y10,
    ],
    [model.global, so]
  );

  const conflicts: DataConflict[] = useMemo(
    () => detectConflicts(resultBest, effectiveRR, growthRates),
    [resultBest, effectiveRR, growthRates]
  );

  const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
  const warningConflicts = conflicts.filter(c => c.severity === 'warning');

  const report = useMemo(
    () => generateAuditReport(conflicts, 'neutral'),
    [conflicts]
  );

  const handleExportReport = useCallback(() => {
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ARIA-audit-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [report]);

  // Check which mapping blocks have conflicts
  const blockConflictMap = useMemo(() => {
    const map: Record<string, DataConflict[]> = {};
    for (const c of conflicts) {
      for (const blockId of c.mappingBlocks) {
        if (!map[blockId]) map[blockId] = [];
        map[blockId].push(c);
      }
    }
    return map;
  }, [conflicts]);

  const basePath = process.env.NODE_ENV === 'production' ? '/Finance-simulator' : '';

  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B0F1A] via-[#111827] to-[#0B0F1A] border-b border-slate-700/50 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <a href={`${basePath}/`} className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black text-sm">A</span>
            </a>
            <div>
              <div className="flex items-baseline gap-2">
                <b className="text-lg text-white tracking-wider font-black">ARIA</b>
                <span className="text-[11px] text-amber-400 font-mono tracking-widest">BP映射</span>
              </div>
              <span className="text-[11px] text-slate-300 tracking-wide">Source → BP 章节数据一致性审计</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`${basePath}/`} className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-900/50 text-slate-300 text-xs hover:bg-slate-800/50 transition-all">
              ← 模拟器
            </a>
            <a href={`${basePath}/roadshow`} className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-900/50 text-slate-300 text-xs hover:bg-slate-800/50 transition-all">
              路演稿
            </a>
            <button
              onClick={() => setShowReport(p => !p)}
              className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 text-amber-300 text-xs font-medium hover:bg-amber-500/15 transition-all"
            >
              {showReport ? '隐藏报告' : '📋 审计报告'}
            </button>
            <button
              onClick={handleExportReport}
              className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-900/50 text-slate-300 text-xs hover:bg-slate-800/50 transition-all"
            >
              ⬇ 导出
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12 pt-4">
        {/* Stale archive warning */}
        {staleWarning && (
          <div className="p-3 rounded-xl border border-orange-500/40 bg-orange-500/10 mb-4 flex items-center justify-between">
            <div className="text-sm text-orange-300">
              <span className="font-bold">⚠ 文档未同步：</span>{staleWarning}
            </div>
            <a href={`${basePath}/`} className="px-3 py-1.5 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-200 text-xs font-medium hover:bg-orange-500/30 transition-all whitespace-nowrap ml-3">
              返回模拟器 →
            </a>
          </div>
        )}

        {/* Conflict summary bar */}
        <div className={`p-4 rounded-xl border mb-6 ${
          criticalConflicts.length > 0
            ? 'border-red-500/30 bg-red-500/5'
            : warningConflicts.length > 0
              ? 'border-amber-500/30 bg-amber-500/5'
              : 'border-green-500/30 bg-green-500/5'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm font-bold text-white">
                {conflicts.length === 0 && `✓ 所有数据与${DOC_VERSIONS.bp}一致`}
                {conflicts.length > 0 && `⚠️ 发现 ${conflicts.length} 处数据冲突`}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                BP版本: {DOC_VERSIONS.bpFile} ({DOC_VERSIONS.bp}) · FP版本: {DOC_VERSIONS.fpFile} ({DOC_VERSIONS.fp}) · 容差: 5% · 严重: &gt;20%偏差
                {criticalConflicts.length > 0 && (
                  <span className="text-red-400 ml-2">🔴 严重: {criticalConflicts.length}</span>
                )}
                {warningConflicts.length > 0 && (
                  <span className="text-amber-400 ml-2">🟡 警告: {warningConflicts.length}</span>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Source of Truth: {DOC_VERSIONS.bpFile} ({DOC_VERSIONS.bp})
            </div>
          </div>
        </div>

        {/* Audit report overlay */}
        {showReport && (
          <div className="mb-6 p-4 rounded-xl border border-slate-700 bg-slate-900/80">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-white">📋 数据一致性审计报告</div>
              <button onClick={handleExportReport} className="text-xs text-cyan-400 hover:text-cyan-300">下载TXT</button>
            </div>
            <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap bg-slate-950/50 rounded-lg p-4 border border-slate-700/50 max-h-[400px] overflow-y-auto">
              {report}
            </pre>
          </div>
        )}

        {/* Mapping blocks grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {BP_MAPPING_BLOCKS.map(block => {
            const blockConflicts = blockConflictMap[block.id] || [];
            const isExpanded = activeBlock === block.id;
            const hasCritical = blockConflicts.some(c => c.severity === 'critical');
            const hasWarning = blockConflicts.length > 0;

            return (
              <div
                key={block.id}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${
                  hasCritical
                    ? 'border-red-500/30 bg-red-500/5 hover:border-red-500/50'
                    : hasWarning
                      ? 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                }`}
                onClick={() => setActiveBlock(isExpanded ? null : block.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        hasCritical ? 'bg-red-500/20 text-red-400' : hasWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>{block.id}</span>
                      <span className="text-sm font-bold text-white">{block.content}</span>
                      {blockConflicts.length > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          hasCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {blockConflicts.length} 冲突
                        </span>
                      )}
                      {blockConflicts.length === 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">✓</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-medium mt-1.5 px-2 py-1 rounded bg-slate-800/60 border border-slate-700/40 inline-block">
                      <span className="text-cyan-400/80">{block.sourceLabel}</span>
                      <span className="text-slate-500 mx-1.5">→</span>
                      <span className="text-amber-400/80">{block.targetLabel}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1.5">触发: {block.trigger}</div>
                  </div>
                  <span className="text-slate-500 text-xs">{isExpanded ? '▼' : '▶'}</span>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-700/50">
                    {blockConflicts.length === 0 ? (
                      <div className="text-xs text-green-400">所有检查字段与BP一致。</div>
                    ) : (
                      <div className="space-y-2">
                        {blockConflicts.map((c, ci) => (
                          <div key={ci} className={`p-2 rounded-lg text-xs ${
                            c.severity === 'critical' ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'
                          }`}>
                            <div className={`font-medium ${c.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                              {c.description}
                            </div>
                            <div className="text-slate-400 mt-1">
                              影响BP章节: {BP_MAPPING_BLOCKS.filter(b => c.mappingBlocks.includes(b.id)).map(b => b.bpSection).join(' / ')}
                            </div>
                            <div className="text-slate-500 mt-0.5">
                              建议: 以ARIA_Financial_Plan_latest.md为准，调整模拟器参数
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 10-year financial main table comparison */}
        <RoadshowMappingSection model={model} resultBest={resultBest} />

        <div className="mb-8">
          <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">§5.2 十年财务主表 — BP vs 模拟器</h2>
          <div className="rounded-xl border border-slate-700 overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead>
                <tr className="bg-slate-800/80">
                  <th className="text-left px-3 py-2 text-slate-400 font-medium sticky left-0 bg-slate-800/80">项目</th>
                  {YEAR_LABELS_SHORT.map(y => (
                    <th key={y} className="text-right px-2 py-2 text-slate-400 font-medium font-mono">{y}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Revenue row */}
                <tr className="border-t border-slate-700/50">
                  <td className="px-3 py-1.5 text-slate-300 font-medium sticky left-0 bg-slate-900/90">总收入 (BP)</td>
                  {BP_MAIN_TABLE.total_revenue.map((v, i) => (
                    <td key={i} className="px-2 py-1.5 text-right text-amber-400/70 font-mono">{v.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="border-t border-slate-700/30">
                  <td className="px-3 py-1.5 text-slate-300 sticky left-0 bg-slate-900/90">总收入 (模拟器)</td>
                  {resultBest.years.map((yr, i) => {
                    const sim = Math.round(yr.total_revenue / 10000);
                    const bp = BP_MAIN_TABLE.total_revenue[i];
                    const isConflict = bp > 0 && Math.abs(sim - bp) / bp > 0.05;
                    return (
                      <td key={i} className={`px-2 py-1.5 text-right font-mono ${isConflict ? 'text-red-400 font-bold' : 'text-cyan-400/70'}`}>
                        {sim.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>

                {/* EBITDA row */}
                <tr className="border-t border-slate-700/50 bg-slate-800/20">
                  <td className="px-3 py-1.5 text-slate-300 font-medium sticky left-0 bg-slate-800/30">EBITDA (BP)</td>
                  {BP_MAIN_TABLE.ebitda.map((v, i) => (
                    <td key={i} className={`px-2 py-1.5 text-right font-mono ${v < 0 ? 'text-rose-400/70' : 'text-amber-400/70'}`}>{v.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="border-t border-slate-700/30 bg-slate-800/20">
                  <td className="px-3 py-1.5 text-slate-300 sticky left-0 bg-slate-800/30">EBITDA (模拟器)</td>
                  {resultBest.years.map((yr, i) => {
                    const sim = Math.round(yr.ebitda / 10000);
                    const bp = BP_MAIN_TABLE.ebitda[i];
                    const absBp = Math.abs(bp);
                    const isConflict = absBp > 0 ? Math.abs(sim - bp) / absBp > 0.05 : Math.abs(sim - bp) > 50;
                    return (
                      <td key={i} className={`px-2 py-1.5 text-right font-mono ${isConflict ? 'text-red-400 font-bold' : sim < 0 ? 'text-rose-400/70' : 'text-cyan-400/70'}`}>
                        {sim.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>

                {/* Net profit row */}
                <tr className="border-t border-slate-700/50">
                  <td className="px-3 py-1.5 text-slate-300 font-medium sticky left-0 bg-slate-900/90">净利润 (BP)</td>
                  {BP_MAIN_TABLE.net_profit.map((v, i) => (
                    <td key={i} className={`px-2 py-1.5 text-right font-mono ${v < 0 ? 'text-rose-400/70' : 'text-amber-400/70'}`}>{v.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="border-t border-slate-700/30">
                  <td className="px-3 py-1.5 text-slate-300 sticky left-0 bg-slate-900/90">净利润 (模拟器)</td>
                  {resultBest.years.map((yr, i) => {
                    const sim = Math.round(yr.net_profit / 10000);
                    const bp = BP_MAIN_TABLE.net_profit[i];
                    const absBp = Math.abs(bp);
                    const isConflict = absBp > 0 ? Math.abs(sim - bp) / absBp > 0.05 : Math.abs(sim - bp) > 50;
                    return (
                      <td key={i} className={`px-2 py-1.5 text-right font-mono ${isConflict ? 'text-red-400 font-bold' : sim < 0 ? 'text-rose-400/70' : 'text-cyan-400/70'}`}>
                        {sim.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>

                {/* OpEx row */}
                <tr className="border-t border-slate-700/50 bg-slate-800/20">
                  <td className="px-3 py-1.5 text-slate-300 font-medium sticky left-0 bg-slate-800/30">OpEx (BP)</td>
                  {BP_MAIN_TABLE.total_opex.map((v, i) => (
                    <td key={i} className="px-2 py-1.5 text-right text-amber-400/70 font-mono">{v.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="border-t border-slate-700/30 bg-slate-800/20">
                  <td className="px-3 py-1.5 text-slate-300 sticky left-0 bg-slate-800/30">OpEx (模拟器)</td>
                  {resultBest.years.map((yr, i) => {
                    const sim = Math.round(yr.opex / 10000);
                    const bp = BP_MAIN_TABLE.total_opex[i];
                    const isConflict = bp > 0 && Math.abs(sim - bp) / bp > 0.05;
                    return (
                      <td key={i} className={`px-2 py-1.5 text-right font-mono ${isConflict ? 'text-red-400 font-bold' : 'text-cyan-400/70'}`}>
                        {sim.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>

                {/* Cumulative beds */}
                <tr className="border-t border-slate-700/50">
                  <td className="px-3 py-1.5 text-slate-300 font-medium sticky left-0 bg-slate-900/90">累计床位 (BP)</td>
                  {BP_SOM.cumulative_beds.map((v, i) => (
                    <td key={i} className="px-2 py-1.5 text-right text-amber-400/70 font-mono">{v.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="border-t border-slate-700/30">
                  <td className="px-3 py-1.5 text-slate-300 sticky left-0 bg-slate-900/90">累计床位 (模拟器)</td>
                  {resultBest.years.map((yr, i) => {
                    const sim = yr.cumulative_beds;
                    const bp = BP_SOM.cumulative_beds[i];
                    const isConflict = bp > 0 && Math.abs(sim - bp) / bp > 0.05;
                    return (
                      <td key={i} className={`px-2 py-1.5 text-right font-mono ${isConflict ? 'text-red-400 font-bold' : 'text-cyan-400/70'}`}>
                        {sim.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>

                {/* ARR */}
                <tr className="border-t border-slate-700/50 bg-slate-800/20">
                  <td className="px-3 py-1.5 text-slate-300 font-medium sticky left-0 bg-slate-800/30">ARR (BP)</td>
                  {BP_MAIN_TABLE.arr.map((v, i) => (
                    <td key={i} className="px-2 py-1.5 text-right text-amber-400/70 font-mono">{v.toLocaleString()}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-[10px] text-slate-500 mt-2 flex gap-4">
            <span>🟡 BP值 (amber) = {DOC_VERSIONS.bpFile} ({DOC_VERSIONS.bp})</span>
            <span>🔵 模拟器值 (cyan) = 当前参数计算结果</span>
            <span>🔴 冲突 (red) = 偏差&gt;5%</span>
          </div>
        </div>

        {/* Channel parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">§3.1 渠道条款参数</h2>
            <div className="rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800/80">
                    <th className="text-left px-3 py-2 text-slate-400 font-medium">参数</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">BP值</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">模拟器</th>
                    <th className="text-center px-3 py-2 text-slate-400 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: '授权金', bp: '¥300万', sim: `¥${(model.yearly.baxter_license[0] / 10000).toFixed(0)}万`, ok: model.yearly.baxter_license[0] === 3000000 || model.yearly.baxter_license[1] === 3000000 },
                    { label: '里程碑付款', bp: '¥200万', sim: `¥${(model.yearly.baxter_license[2] / 10000).toFixed(0)}万`, ok: model.yearly.baxter_license[2] === 2000000 },
                    { label: '硬件分成', bp: `${(BP_CHANNEL.hw_commission * 100).toFixed(0)}%`, sim: `${(model.global.baxter_hw_commission * 100).toFixed(0)}%`, ok: Math.abs(model.global.baxter_hw_commission - BP_CHANNEL.hw_commission) < 0.001 },
                    { label: 'SaaS分成', bp: `${(BP_CHANNEL.saas_commission * 100).toFixed(0)}%`, sim: `${(model.global.baxter_saas_commission * 100).toFixed(0)}%`, ok: Math.abs(model.global.baxter_saas_commission - BP_CHANNEL.saas_commission) < 0.001 },
                    { label: '续约率', bp: `${(BP_CHANNEL.renewal_rate * 100).toFixed(0)}%`, sim: `${(model.global.rr_base * 100).toFixed(0)}%`, ok: Math.abs(model.global.rr_base - BP_CHANNEL.renewal_rate) < 0.001 },
                  ].map(row => (
                    <tr key={row.label} className="border-t border-slate-700/50">
                      <td className="px-3 py-1.5 text-slate-300">{row.label}</td>
                      <td className="px-3 py-1.5 text-right text-amber-400/70 font-mono">{row.bp}</td>
                      <td className={`px-3 py-1.5 text-right font-mono ${row.ok ? 'text-cyan-400/70' : 'text-red-400 font-bold'}`}>{row.sim}</td>
                      <td className="px-3 py-1.5 text-center">{row.ok ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Growth rates */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">§4.1 增长率参数</h2>
            <div className="rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800/80">
                    <th className="text-left px-3 py-2 text-slate-400 font-medium">年份</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">BP增速</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">模拟器</th>
                    <th className="text-center px-3 py-2 text-slate-400 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {growthRates.map((gr, i) => {
                    const bpGr = 0.30;
                    const ok = Math.abs(gr - bpGr) < 0.01;
                    return (
                      <tr key={i} className="border-t border-slate-700/50">
                        <td className="px-3 py-1.5 text-slate-300 font-mono">Y{i + 6}</td>
                        <td className="px-3 py-1.5 text-right text-amber-400/70 font-mono">30%</td>
                        <td className={`px-3 py-1.5 text-right font-mono ${ok ? 'text-cyan-400/70' : 'text-red-400 font-bold'}`}>
                          {(gr * 100).toFixed(0)}%
                        </td>
                        <td className="px-3 py-1.5 text-center">{ok ? '✅' : '❌'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 p-3 rounded-lg border border-slate-700 bg-slate-800/30 text-[11px] text-slate-400">
              <div className="font-bold text-slate-300 mb-1">增速对标结论 (BP §4.1):</div>
              <div>获证后采用统一30%增速，位于推想(30-50%)/鹰瞳(25-40%)规模化增速区间内</div>
            </div>
          </div>
        </div>

        {/* Sensitivity Analysis */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">§6 敏感性分析</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(BP_SENSITIVITY).map(([key, s]: [string, typeof BP_SENSITIVITY[keyof typeof BP_SENSITIVITY]]) => (
              <div key={key} className={`p-4 rounded-xl border ${
                key === 'neutral' ? 'border-cyan-500/30 bg-cyan-500/5' :
                key === 'optimistic' ? 'border-green-500/30 bg-green-500/5' :
                'border-amber-500/30 bg-amber-500/5'
              }`}>
                <div className={`text-xs font-bold mb-2 ${
                  key === 'neutral' ? 'text-cyan-300' : key === 'optimistic' ? 'text-green-300' : 'text-amber-300'
                }`}>{s.label}</div>
                <div className="space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between"><span>Y10床位</span><span className="font-mono text-slate-300">{s.y10_beds.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Y10收入</span><span className="font-mono text-slate-300">¥{s.y10_revenue.toLocaleString()}万</span></div>
                  <div className="flex justify-between"><span>Y10 EBITDA</span><span className="font-mono text-slate-300">¥{s.y10_ebitda.toLocaleString()}万</span></div>
                  <div className="flex justify-between"><span>vs 基准</span><span className={`font-mono ${key === 'neutral' ? 'text-cyan-400' : key === 'optimistic' ? 'text-green-400' : 'text-amber-400'}`}>{s.vs_base}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit log from parameter changes */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">参数变更审计日志</h2>
          {auditLog.length === 0 ? (
            <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50 text-xs text-slate-500">
              暂无参数变更记录。在模拟器中修改参数后，变更将自动记录在此。
            </div>
          ) : (
            <div className="rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800/80">
                    <th className="text-left px-3 py-2 text-slate-400 font-medium">时间</th>
                    <th className="text-left px-3 py-2 text-slate-400 font-medium">标签页</th>
                    <th className="text-left px-3 py-2 text-slate-400 font-medium">字段</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">旧值</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">新值</th>
                    <th className="text-left px-3 py-2 text-slate-400 font-medium">影响块</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.slice(0, 20).map((entry, i) => (
                    <tr key={i} className="border-t border-slate-700/50">
                      <td className="px-3 py-1.5 text-slate-500 font-mono text-[10px]">{new Date(entry.timestamp).toLocaleString('zh-CN')}</td>
                      <td className="px-3 py-1.5 text-slate-300">{entry.tab}</td>
                      <td className="px-3 py-1.5 text-slate-300 font-mono">{entry.field}</td>
                      <td className="px-3 py-1.5 text-right text-rose-400/70 font-mono">{entry.oldValue}</td>
                      <td className="px-3 py-1.5 text-right text-cyan-400/70 font-mono">{entry.newValue}</td>
                      <td className="px-3 py-1.5 text-slate-400">{entry.affectedMappings.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="text-center py-6 border-t border-slate-600/50 text-xs text-slate-400">
          <div>ARIA BP映射审计 · 数据源: ARIA_Financial_Plan_latest.md v2.1 (2026-04-19)</div>
          <div className="text-amber-300 mt-1">冲突数据以 ARIA_Financial_Plan_latest.md 为 Source of Truth</div>
        </div>
      </div>
    </div>
  );
}
