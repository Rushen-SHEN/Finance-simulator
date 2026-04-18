import { MilestoneItem } from '@/lib/calculator';

const TYPE_ICONS: Record<string, string> = { '研发': '🔵', '注册': '🟣', '融资': '🟡', '商业化': '🟢' };
const TYPE_CLS: Record<string, string> = { '研发': 'bg-blue-100 text-blue-800', '注册': 'bg-purple-100 text-purple-800', '融资': 'bg-amber-100 text-amber-800', '商业化': 'bg-green-100 text-green-800' };

interface Props { scenario: string; milestones: MilestoneItem[]; }

function parseMonth(m: string): number {
  const match = m.match(/M(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function buildGanttBars(milestones: MilestoneItem[]) {
  const barColorMap: Record<string, string> = {
    '研发': 'bg-gradient-to-r from-blue-600 to-blue-400',
    '注册': 'bg-gradient-to-r from-purple-600 to-purple-400',
    '融资': 'bg-gradient-to-r from-amber-500 to-amber-400',
    '商业化': 'bg-gradient-to-r from-green-600 to-green-400',
  };

  return milestones.map(m => {
    const parts = m.month.replace(/\s|⚠️/g, '').split('–');
    const startM = parseMonth(parts[0]);
    const endM = parts.length > 1 ? parseMonth(parts[1]) : startM;
    const left = ((startM - 1) / 60 * 100).toFixed(1) + '%';
    const width = (Math.max(1, endM - startM + 1) / 60 * 100).toFixed(1) + '%';
    const isMilestone = m.bold && startM === endM;
    return {
      label: m.desc.substring(0, 16),
      left,
      width,
      text: m.month,
      cls: barColorMap[m.type] || barColorMap['商业化'],
      isMilestone,
      milestonePos: ((startM - 0.5) / 60 * 100).toFixed(1) + '%',
    };
  });
}

export default function GanttTimeline({ scenario, milestones }: Props) {
  const isDelayed = scenario === 'delayed';
  const bars = buildGanttBars(milestones);

  // Find C2 and C3 approval months
  const c2Item = milestones.find(m => m.desc.includes('二类') && m.bold);
  const c3Item = milestones.find(m => m.desc.includes('三类') && m.bold);
  const c2Month = c2Item ? parseMonth(c2Item.month.split('–').pop() || 'M15') : 15;
  const c3Month = c3Item ? parseMonth(c3Item.month.split('–').pop() || 'M31') : 31;

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 my-5">
      <h2 className="text-[22px] font-bold text-gray-800 mb-1">里程碑时间表 — M1至M60{isDelayed ? ' (延迟+3个月)' : ''}</h2>
      <p className="text-[13px] text-gray-500 mb-6">M1=2026年7月 · ★ 关键里程碑: 二类获批M{c2Month} / 三类获批M{c3Month} · 可在参数面板编辑</p>

      <div className="overflow-x-auto">
        {/* Year headers */}
        <div className="flex" style={{ paddingLeft: 180 }}>
          {['Year 1 (M1–12)', 'Year 2 (M13–24)', 'Year 3 (M25–36)', 'Year 4 (M37–48)', 'Year 5 (M49–60)'].map((label, i) => (
            <div key={i} className={`flex-1 text-center text-xs text-gray-500 font-semibold py-1 ${i > 0 ? 'border-l-2 border-dashed border-gray-200' : ''}`}>
              {label}
            </div>
          ))}
        </div>

        {/* Gantt bars from milestones */}
        {bars.map((bar, i) => (
          <div key={i} className="flex items-center my-0.5" style={{ minHeight: 26 }}>
            <div className="w-[180px] flex-shrink-0 text-xs text-gray-800 pr-2.5 text-right font-medium truncate">{bar.label}</div>
            <div className="flex-1 relative h-[22px]">
              {bar.isMilestone ? (
                <div
                  className="absolute top-[-1px] w-5 h-5 bg-green-600 rotate-45 rounded-sm shadow-md"
                  style={{ left: bar.milestonePos }}
                />
              ) : (
                <div
                  className={`absolute h-[18px] rounded-md top-[2px] flex items-center justify-center text-white text-[10px] font-semibold shadow-sm ${bar.cls}`}
                  style={{ left: bar.left, width: bar.width }}
                >
                  {bar.text}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex gap-4 text-xs text-gray-500 mt-3.5" style={{ paddingLeft: 180 }}>
          <span className="flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-sm bg-blue-600" /> 研发</span>
          <span className="flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-sm bg-purple-600" /> 注册</span>
          <span className="flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-sm bg-amber-500" /> 融资</span>
          <span className="flex items-center gap-1"><i className="inline-block w-3 h-3 rounded-sm bg-green-600" /> 商业化</span>
          <span className="flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 bg-green-600 rotate-45 rounded-sm" /> ★关键里程碑</span>
        </div>
      </div>

      {/* Milestone Table */}
      <h3 className="text-[15px] text-gray-500 font-semibold mt-6 mb-3">里程碑明细表</h3>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200">月份</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200">里程碑</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200">关键KPI</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200">类型</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m, i) => (
              <tr key={i} className={`${m.bold ? 'font-bold' : ''} even:bg-gray-50/50`}>
                <td className="py-2 px-3.5 border-b border-gray-100">{m.month}</td>
                <td className="py-2 px-3.5 border-b border-gray-100">{m.desc}</td>
                <td className="py-2 px-3.5 border-b border-gray-100">{m.kpi}</td>
                <td className="py-2 px-3.5 border-b border-gray-100">
                  <span className={`inline-block px-2.5 py-0.5 rounded-xl text-[11px] font-semibold ${TYPE_CLS[m.type] || 'bg-gray-100 text-gray-800'}`}>
                    {TYPE_ICONS[m.type] || ''} {m.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
