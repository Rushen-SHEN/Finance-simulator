'use client';
import { MilestoneItem, resolveMilestones } from '@/lib/calculator';

interface Props {
  milestonesBest: MilestoneItem[];
  milestonesBase: MilestoneItem[];
}

interface PhaseInfo {
  id: string;
  name: string;
  icon: string;
  color: string;        // gradient from
  borderColor: string;
  activities: string[];
  funding: string;
  deployment: string;
  keyMilestone: string;
  bestIds: string[];     // milestone ids that define this phase's timing
  baseIds: string[];
}

const PHASES: PhaseInfo[] = [
  {
    id: 'discovery',
    name: 'Phase 0 · 发现与验证',
    icon: '🔬',
    color: 'from-slate-600/20 to-slate-700/10',
    borderColor: 'border-slate-500/40',
    activities: ['CDMO签约', '功能原型开发', '40床科研部署', '三模态数据采集'],
    funding: '种子轮 ¥400–600万',
    deployment: '40床科研(非商业)',
    keyMilestone: '原型验收 + 数据采集通过',
    bestIds: ['seed', 'cdmo', 'pilot'],
    baseIds: ['seed', 'cdmo', 'pilot'],
  },
  {
    id: 'development',
    name: 'Phase 1 · 研发与注册',
    icon: '⚙️',
    color: 'from-blue-600/20 to-indigo-600/10',
    borderColor: 'border-blue-500/40',
    activities: ['算法训练 AUROC≥0.78', 'ISO13485体系审核', '二类注册审评', '合作经销商渠道签约'],
    funding: '—',
    deployment: '—',
    keyMilestone: '★ 二类医疗器械证获批',
    bestIds: ['algo', 'iso', 'c2_reg', 'baxter_sign'],
    baseIds: ['algo', 'iso', 'c2_reg', 'baxter_sign'],
  },
  {
    id: 'launch',
    name: 'Phase 2 · 首轮商业化',
    icon: '🚀',
    color: 'from-green-600/20 to-emerald-600/10',
    borderColor: 'border-green-500/40',
    activities: ['C2商业化部署', '直销+经销商双渠道', '经销商里程碑付款', '三类注册审评启动'],
    funding: '经销商授权金 ¥300万',
    deployment: '110床(Best) / 90床(Base)',
    keyMilestone: '部署率≥90% + 三类注册提交',
    bestIds: ['c2_deploy', 'baxter_m2'],
    baseIds: ['c2_deploy', 'baxter_m2'],
  },
  {
    id: 'expansion',
    name: 'Phase 3 · C3上市与扩张',
    icon: '📈',
    color: 'from-purple-600/20 to-violet-600/10',
    borderColor: 'border-purple-500/40',
    activities: ['★ 三类证获批', 'C3商业化 + C2→C3升级', '经销商渠道放量', '经销商里程碑 ¥200万'],
    funding: '经销商里程碑 ¥200万',
    deployment: '140床+40升级(Best) / 120+30(Base)',
    keyMilestone: '★ 三类注册证获批',
    bestIds: ['c3_reg', 'c3_deploy1'],
    baseIds: ['c3_reg', 'c3_deploy1'],
  },
  {
    id: 'scale',
    name: 'Phase 4 · 规模化增长',
    icon: '🏭',
    color: 'from-amber-600/20 to-orange-600/10',
    borderColor: 'border-amber-500/40',
    activities: ['经销商大规模分销', 'C3产线扩产', '全国重点城市覆盖', 'EBITDA持续为正'],
    funding: 'A轮(可选，如需)',
    deployment: '180+50升级→260新增',
    keyMilestone: '累计520–780床',
    bestIds: ['c3_scale', 'c3_expand'],
    baseIds: ['c3_scale', 'c3_expand'],
  },
];

function getPhaseRange(milestones: MilestoneItem[], ids: string[]): { start: number; end: number } {
  const resolved = resolveMilestones(milestones);
  const matched = resolved.filter(m => ids.includes(m.id));
  if (matched.length === 0) return { start: 0, end: 0 };
  return {
    start: Math.min(...matched.map(m => m.startM)),
    end: Math.max(...matched.map(m => m.endM)),
  };
}

export default function PhaseOverview({ milestonesBest, milestonesBase }: Props) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 sm:p-8 my-5 relative overflow-hidden">
      {/* Accent lines */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-96 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-0.5 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h2 className="text-xl sm:text-[22px] font-bold text-slate-800 tracking-wide">项目阶段总览</h2>
          <p className="text-xs sm:text-[13px] text-slate-600 mt-1">5个Phase · M1=2026年7月 · 从发现验证到规模化增长</p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500" /> Best Case</span>
          <span className="flex items-center gap-1.5 text-blue-600"><span className="w-2 h-2 rounded-full bg-blue-500" /> Base Case</span>
        </div>
      </div>

      {/* Phase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {PHASES.map((phase, idx) => {
          const best = getPhaseRange(milestonesBest, phase.bestIds);
          const base = getPhaseRange(milestonesBase, phase.baseIds);

          return (
            <div key={phase.id} className={`relative rounded-xl bg-gradient-to-br ${phase.color} border ${phase.borderColor} p-4 backdrop-blur-sm`}>
              {/* Phase number connector */}
              {idx < PHASES.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-slate-300 z-10" />
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{phase.icon}</span>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider leading-tight">{phase.name}</span>
              </div>

              {/* Timing badges */}
              <div className="flex gap-1.5 mb-3">
                <span className="px-2 py-0.5 rounded-md bg-green-500/15 text-green-700 text-[11px] font-mono font-semibold border border-green-500/25">
                  M{best.start}–{best.end}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 text-[11px] font-mono font-semibold border border-blue-500/25">
                  M{base.start}–{base.end}
                </span>
              </div>

              {/* Key activities */}
              <div className="space-y-1 mb-3">
                {phase.activities.map((a, i) => (
                  <div key={i} className={`text-[11px] leading-relaxed ${a.startsWith('★') ? 'text-cyan-700 font-semibold' : 'text-slate-600'}`}>
                    {a.startsWith('★') ? '' : '·'} {a}
                  </div>
                ))}
              </div>

              {/* Funding & Deployment */}
              <div className="border-t border-slate-300/60 pt-2 space-y-1">
                <div className="text-[11px] text-amber-700">💰 {phase.funding}</div>
                <div className="text-[11px] text-green-700">🛏️ {phase.deployment}</div>
              </div>

              {/* Key milestone */}
              <div className="mt-2 px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">关键交付</div>
                <div className="text-[11px] text-slate-700 font-medium">{phase.keyMilestone}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline bar */}
      <div className="mt-6 relative">
        <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-slate-400 via-cyan-500 to-purple-500 rounded-full" style={{ width: '100%' }} />
        </div>
        <div className="flex justify-between mt-1">
          {['M1', 'M12', 'M24', 'M36', 'M48', 'M60'].map(m => (
            <span key={m} className="text-[11px] text-slate-500 font-mono">{m}</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 leading-relaxed">
        <span className="font-semibold text-slate-600">图例：</span>
        <span><b className="text-slate-700">M</b> = 月份（Month）</span>
        <span><b className="text-slate-700">M1</b> = 2026年7月，种子轮融资启动</span>
        <span><b className="text-slate-700">M12</b> = 2027年6月，首年结束</span>
        <span><b className="text-slate-700">M24</b> = 2028年6月</span>
        <span><b className="text-slate-700">M36</b> = 2029年6月</span>
        <span><b className="text-slate-700">M60</b> = 2031年6月，五年规划终点</span>
        <span className="text-slate-300">|</span>
        <span>🟢 Best = 最乐观进度</span>
        <span>🔵 Base = 保守基准进度</span>
      </div>
    </section>
  );
}
