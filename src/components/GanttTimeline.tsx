'use client';
import { useState } from 'react';
import { MilestoneItem, resolveMilestones } from '@/lib/calculator';

const TYPE_ICONS: Record<string, string> = { '研发': '🔵', '注册': '🟣', '融资': '🟡', '商业化': '🟢' };
const TYPE_CLS: Record<string, string> = {
  '研发': 'bg-blue-100 text-blue-800',
  '注册': 'bg-purple-100 text-purple-800',
  '融资': 'bg-amber-100 text-amber-800',
  '商业化': 'bg-green-100 text-green-800',
};

interface Props {
  scenario: string;
  milestonesBest: MilestoneItem[];
  milestonesBase: MilestoneItem[];
}

function MilestoneTable({ items, label }: { items: MilestoneItem[]; label: string }) {
  const resolved = resolveMilestones(items);

  const c2Item = resolved.find(m => m.desc.includes('二类') && m.bold);
  const c3Item = resolved.find(m => m.desc.includes('三类') && m.bold);
  const c2End = c2Item ? c2Item.endM : '?';
  const c3End = c3Item ? c3Item.endM : '?';

  return (
    <div>
      <p className="text-xs sm:text-[13px] text-gray-600 mb-4">
        {label} · M1=2026年7月 · ★ 关键里程碑: 二类获批M{c2End} / 三类获批M{c3End}
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3 text-left border-b-2 border-blue-200 w-16">ID</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3 text-left border-b-2 border-blue-200 w-24">时间</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3 text-left border-b-2 border-blue-200 w-14">工期</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3 text-left border-b-2 border-blue-200">里程碑</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3 text-left border-b-2 border-blue-200">KPI</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3 text-left border-b-2 border-blue-200 w-20">前置</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3 text-left border-b-2 border-blue-200 w-16">类型</th>
            </tr>
          </thead>
          <tbody>
            {resolved.map((m, i) => {
              const duration = m.endM - m.startM + 1;
              const predLabel = m.predecessorId ? `${m.predecessorId}${m.lagMonths >= 0 ? '+' : ''}${m.lagMonths}月` : '—';
              return (
                <tr key={m.id + '-' + i} className={`${m.bold ? 'font-bold' : ''} even:bg-gray-50/50`}>
                  <td className="py-2 px-3 border-b border-gray-100 text-gray-500 font-mono text-xs">{m.id}</td>
                  <td className="py-2 px-3 border-b border-gray-100">M{m.startM}–M{m.endM}</td>
                  <td className="py-2 px-3 border-b border-gray-100 text-center">{duration}月</td>
                  <td className="py-2 px-3 border-b border-gray-100">{m.desc}</td>
                  <td className="py-2 px-3 border-b border-gray-100">{m.kpi}</td>
                  <td className="py-2 px-3 border-b border-gray-100 text-xs text-gray-600">{predLabel}</td>
                  <td className="py-2 px-3 border-b border-gray-100">
                    <span className={`inline-block px-2 py-0.5 rounded-xl text-[11px] font-semibold ${TYPE_CLS[m.type] || 'bg-gray-100 text-gray-800'}`}>
                      {TYPE_ICONS[m.type] || ''} {m.type}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-0.5 text-[11px] text-gray-500 mt-3 px-1">
        <span><b className="text-gray-700">M</b> = 月份</span>
        <span><b className="text-gray-700">M1</b> = 2026.07</span>
        <span><b className="text-gray-700">M12</b> = 2027.06</span>
        <span><b className="text-gray-700">M24</b> = 2028.06</span>
        <span><b className="text-gray-700">M36</b> = 2029.06</span>
        <span><b className="text-gray-700">M48</b> = 2030.06</span>
        <span><b className="text-gray-700">M60</b> = 2031.06</span>
        <span className="text-gray-300">|</span>
        <span>Lag = 前置活动结束后的等待月数</span>
      </div>
    </div>
  );
}

export default function GanttTimeline({ scenario, milestonesBest, milestonesBase }: Props) {
  const [activeCase, setActiveCase] = useState<'best' | 'base'>('best');
  const isDelayed = scenario === 'delayed';

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 my-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[22px] font-bold text-gray-800">
          里程碑明细表 — M1至M60{isDelayed ? ' ⚠️延迟情景' : ''}
        </h2>
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button
            onClick={() => setActiveCase('best')}
            className={`px-4 py-1.5 text-xs font-semibold transition-all ${activeCase === 'best' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            🚀 Best Case
          </button>
          <button
            onClick={() => setActiveCase('base')}
            className={`px-4 py-1.5 text-xs font-semibold transition-all ${activeCase === 'base' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            📊 Base Case
          </button>
        </div>
      </div>

      {activeCase === 'best' ? (
        <MilestoneTable items={milestonesBest} label="Best Case — 最乐观进度，所有活动按最短工期" />
      ) : (
        <MilestoneTable items={milestonesBase} label="Base Case — 保守进度，考虑延迟和缓冲期" />
      )}

      <div className="mt-4 rounded-lg p-3 px-4 text-[12px] flex items-start gap-2 bg-amber-50 border border-amber-300 text-amber-800 leading-relaxed">
        💡 <b>前置依赖</b>：修改某活动的结束月份或工期后，所有依赖该活动的后续里程碑会自动重新推算。可在参数面板「里程碑」标签页中编辑每个活动的起止月份和前置关系。
      </div>
    </section>
  );
}
