'use client';
import { useState } from 'react';
import { MilestoneItem, resolveMilestones } from '@/lib/calculator';

const MAX_M = 60;

const PHASES = [
  { id: 'discovery',   name: 'Phase 0', subtitle: '发现与验证',    icon: '🔬', bestIds: ['seed', 'cdmo', 'pilot'],                       baseIds: ['seed', 'cdmo', 'pilot'],                       funding: '种子轮 ¥400–600万', deliverable: '原型验收+数据采集' },
  { id: 'development', name: 'Phase 1', subtitle: '研发与注册',    icon: '⚙️', bestIds: ['algo', 'iso', 'c2_reg', 'baxter_sign'],       baseIds: ['algo', 'iso', 'c2_reg', 'baxter_sign'],       funding: '—',                 deliverable: '★ 二类证获批' },
  { id: 'launch',      name: 'Phase 2', subtitle: '首轮商业化',    icon: '🚀', bestIds: ['c2_deploy', 'baxter_m2'],                     baseIds: ['c2_deploy', 'baxter_m2'],                     funding: '经销商 ¥300万',     deliverable: '部署率≥90%' },
  { id: 'expansion',   name: 'Phase 3', subtitle: 'C3上市与扩张',  icon: '📈', bestIds: ['c3_reg', 'c3_deploy1'],                       baseIds: ['c3_reg', 'c3_deploy1'],                       funding: '经销商 ¥200万',     deliverable: '★ 三类证获批' },
  { id: 'scale',       name: 'Phase 4', subtitle: '规模化增长',    icon: '🏭', bestIds: ['c3_scale', 'c3_expand'],                      baseIds: ['c3_scale', 'c3_expand'],                      funding: 'A轮(可选)',         deliverable: '累计520–780床' },
];

const TYPE_BAR: Record<string, string> = {
  '研发': 'bg-blue-500',
  '注册': 'bg-purple-500',
  '融资': 'bg-amber-500',
  '商业化': 'bg-green-600',
};

interface Props {
  milestonesBest: MilestoneItem[];
  milestonesBase: MilestoneItem[];
}

function getRange(milestones: MilestoneItem[], ids: string[]) {
  const matched = milestones.filter(m => ids.includes(m.id));
  if (matched.length === 0) return { start: 0, end: 0 };
  return {
    start: Math.min(...matched.map(m => m.startM)),
    end: Math.max(...matched.map(m => m.endM)),
  };
}

/** Assign milestones to rows to avoid visual overlap */
function assignRows(items: MilestoneItem[]): number[] {
  const rows: { s: number; e: number }[][] = [];
  return items.map(m => {
    for (let r = 0; r < rows.length; r++) {
      if (!rows[r].some(b => m.startM <= b.e + 1 && m.endM >= b.s - 1)) {
        rows[r].push({ s: m.startM, e: m.endM });
        return r;
      }
    }
    rows.push([{ s: m.startM, e: m.endM }]);
    return rows.length - 1;
  });
}

export default function PhaseTimeline({ milestonesBest, milestonesBase }: Props) {
  const [activeCase, setActiveCase] = useState<'best' | 'base'>('best');
  const milestones = activeCase === 'best' ? milestonesBest : milestonesBase;
  const resolved = resolveMilestones(milestones);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 sm:p-8 my-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <h2 className="text-xl sm:text-[22px] font-bold text-slate-800 tracking-wide">项目阶段时间轴</h2>
          <p className="text-xs sm:text-[13px] text-slate-600 mt-1">5个Phase · 关键活动/交付物/融资节点</p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button
            onClick={() => setActiveCase('best')}
            className={`px-3 py-1 text-xs font-semibold transition-all ${activeCase === 'best' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            🚀 Best
          </button>
          <button
            onClick={() => setActiveCase('base')}
            className={`px-3 py-1 text-xs font-semibold transition-all ${activeCase === 'base' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            📊 Base
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Year axis header */}
          <div className="flex">
            <div className="w-[130px] sm:w-[170px] shrink-0 border-r border-gray-200" />
            <div className="flex-1 flex border-b-2 border-gray-300">
              {[1, 2, 3, 4, 5].map(y => (
                <div key={y} className={`flex-1 text-center py-1.5 ${y > 1 ? 'border-l border-gray-300' : ''}`}>
                  <div className="text-xs font-bold text-gray-700">Year {y}</div>
                  <div className="text-[10px] text-gray-500">{2025 + y}.07 – {2026 + y}.06</div>
                </div>
              ))}
            </div>
          </div>

          {/* Phase swim lanes */}
          {PHASES.map((phase, phaseIdx) => {
            const phaseIds = activeCase === 'best' ? phase.bestIds : phase.baseIds;
            const range = getRange(resolved, phaseIds);
            const phaseMs = resolved.filter(m => phaseIds.includes(m.id));
            const rows = assignRows(phaseMs);
            const maxRow = rows.length > 0 ? Math.max(...rows) + 1 : 1;

            return (
              <div key={phase.id} className={`flex ${phaseIdx < PHASES.length - 1 ? 'border-b border-gray-100' : ''}`}>
                {/* Phase label */}
                <div className="w-[130px] sm:w-[170px] shrink-0 py-3 pr-3 border-r border-gray-200 flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{phase.icon}</span>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 leading-tight">{phase.name}</div>
                      <div className="text-[10px] text-slate-600">{phase.subtitle}</div>
                    </div>
                  </div>
                  <div className="mt-1.5 space-y-0.5">
                    <div className="text-[10px] text-amber-700 truncate" title={phase.funding}>💰 {phase.funding}</div>
                    <div className="text-[10px] text-cyan-700 truncate" title={phase.deliverable}>🎯 {phase.deliverable}</div>
                  </div>
                </div>

                {/* Timeline area */}
                <div className="flex-1 relative py-2" style={{ minHeight: 40 + maxRow * 18 + 24 }}>
                  {/* Year grid lines */}
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="absolute top-0 bottom-0 border-l border-dashed border-gray-100"
                         style={{ left: `${(i * 12) / MAX_M * 100}%` }} />
                  ))}

                  {/* Phase range bar */}
                  {range.start > 0 && (
                    <div
                      className={`absolute h-[18px] rounded-md flex items-center px-1.5 overflow-hidden ${
                        activeCase === 'best'
                          ? 'bg-green-500/15 border border-green-500/30'
                          : 'bg-blue-500/15 border border-blue-500/30'
                      }`}
                      style={{
                        left: `${(range.start - 1) / MAX_M * 100}%`,
                        width: `${Math.max(3, (range.end - range.start + 1) / MAX_M * 100)}%`,
                        top: 8,
                      }}
                    >
                      <span className={`text-[9px] sm:text-[10px] font-mono font-semibold whitespace-nowrap ${
                        activeCase === 'best' ? 'text-green-700' : 'text-blue-700'
                      }`}>
                        M{range.start}–{range.end}
                      </span>
                    </div>
                  )}

                  {/* Individual milestone bars */}
                  {phaseMs.map((m, i) => {
                    const left = (m.startM - 1) / MAX_M * 100;
                    const width = Math.max(2, (m.endM - m.startM + 1) / MAX_M * 100);
                    const row = rows[i];
                    const top = 34 + row * 18;
                    const barColor = TYPE_BAR[m.type] || 'bg-gray-500';
                    const isFunding = m.type === '融资';
                    const isKey = m.bold;
                    const shortDesc = m.desc.replace('★ ', '');
                    const displayLabel = shortDesc.length > 10 ? shortDesc.substring(0, 10) + '…' : shortDesc;

                    return (
                      <div
                        key={m.id}
                        className={`absolute h-[14px] rounded ${barColor} opacity-80 flex items-center px-0.5 shadow-sm cursor-default`}
                        style={{ left: `${left}%`, width: `${width}%`, top, minWidth: 8 }}
                        title={`${m.desc}\nM${m.startM}–M${m.endM} (${m.endM - m.startM + 1}月)\nKPI: ${m.kpi}`}
                      >
                        <span className="text-[8px] sm:text-[9px] text-white font-medium whitespace-nowrap truncate">
                          {isFunding ? '💰 ' : isKey ? '★ ' : ''}{displayLabel}
                        </span>
                      </div>
                    );
                  })}

                  {/* Milestone labels below bars */}
                  <div className="absolute left-0 right-0 flex flex-wrap gap-x-2 gap-y-0 px-1"
                       style={{ top: 36 + maxRow * 18 }}>
                    {phaseMs.map(m => {
                      const isFunding = m.type === '融资';
                      const isKey = m.bold;
                      const label = m.desc.replace('★ ', '');
                      return (
                        <span key={m.id} className="text-[9px] text-gray-500 whitespace-nowrap">
                          {isFunding ? '💰' : isKey ? '★' : '·'} {label}
                          <span className="text-gray-400 ml-0.5">M{m.startM}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600">
        <span className="font-semibold text-gray-700">图例：</span>
        <span className="flex items-center gap-1"><i className="inline-block w-3 h-2.5 rounded-sm bg-blue-500" /> 研发</span>
        <span className="flex items-center gap-1"><i className="inline-block w-3 h-2.5 rounded-sm bg-purple-500" /> 注册</span>
        <span className="flex items-center gap-1"><i className="inline-block w-3 h-2.5 rounded-sm bg-amber-500" /> 融资</span>
        <span className="flex items-center gap-1"><i className="inline-block w-3 h-2.5 rounded-sm bg-green-600" /> 商业化</span>
        <span className="text-gray-300">|</span>
        <span>★ 关键交付</span>
        <span>💰 融资节点</span>
        <span className="text-gray-300">|</span>
        <span><b className="text-gray-700">M1</b> = 2026.07</span>
        <span><b className="text-gray-700">M60</b> = 2031.06</span>
      </div>
    </section>
  );
}
