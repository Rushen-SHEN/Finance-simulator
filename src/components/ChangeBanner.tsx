'use client';

import { useState } from 'react';
import { ChangeReport } from '@/lib/changeTracker';

interface Props {
  report: ChangeReport;
  onAccept: () => void;
  accepting: boolean;
}

export default function ChangeBanner({ report, onAccept, accepting }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!report.hasChanges) return null;

  return (
    <div className="mx-4 sm:mx-8 my-3 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-lg animate-pulse">⚠</span>
          <div>
            <span className="text-sm font-bold text-amber-300">
              参数已变更 — {report.changedGroups.length}组参数 · {report.affectedMappings.length}个BP映射受影响
            </span>
            {report.affectedRoadshowSlides.length > 0 && (
              <span className="text-xs text-amber-400/70 ml-2">
                · {report.affectedRoadshowSlides.length}个路演页需更新
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1.5 text-xs rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/50 transition-all"
          >
            {expanded ? '收起' : '详情'} ▾
          </button>
          <button
            onClick={onAccept}
            disabled={accepting}
            className="px-4 py-1.5 text-xs rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50"
          >
            {accepting ? '⏳ 生成中...' : '✓ 接受变更 · 导出文档'}
          </button>
        </div>
      </div>

      {/* Detail panel */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-amber-500/20 pt-3">
          {/* Changed groups */}
          <div>
            <h4 className="text-xs font-bold text-amber-300 mb-1.5">变更参数组</h4>
            <div className="flex flex-wrap gap-1.5">
              {report.changedGroups.map(g => (
                <span key={g.group} className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                  {g.label} ({g.fields.length}项)
                </span>
              ))}
            </div>
          </div>

          {/* Affected BP sections */}
          <div>
            <h4 className="text-xs font-bold text-cyan-300 mb-1.5">影响BP章节</h4>
            <div className="flex flex-wrap gap-1.5">
              {report.affectedMappings.map(m => (
                <span key={m.mappingId} className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-medium">
                  {m.mappingId} {m.label}
                </span>
              ))}
            </div>
          </div>

          {/* Affected roadshow pages */}
          {report.affectedRoadshowSlides.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-purple-300 mb-1.5">影响路演页面</h4>
              <div className="flex flex-wrap gap-1.5">
                {report.affectedRoadshowSlides.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-medium">
                    📊 {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What accept will do */}
          <div className="rounded-lg bg-slate-800/40 border border-slate-700/40 p-3 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">点击「接受变更」将：</p>
            <p>1. 📄 自动生成新版 ARIA_Financial_Plan_latest_v2.4.1.md 并存档</p>
            <p>2. 📋 更新 ARIA_BP_External_v2.4.1.md 相应数字表格并存档</p>
            <p>3. 📊 更新路演HTML页面数据</p>
            <p>4. 💾 旧版本保留在存档历史中</p>
          </div>
        </div>
      )}
    </div>
  );
}
