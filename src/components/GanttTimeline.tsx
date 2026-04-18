interface Props { scenario: string; }

export default function GanttTimeline({ scenario }: Props) {
  const isDelayed = scenario === 'delayed';
  const delay = isDelayed ? 3 : 0; // months
  const c2Month = 18 + delay;
  const c3Month = 36 + delay;

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 my-5">
      <h2 className="text-[22px] font-bold text-gray-800 mb-1">里程碑时间表 — M1至M60{isDelayed ? ' (延迟+3个月)' : ''}</h2>
      <p className="text-[13px] text-gray-500 mb-6">M1=2026年7月 · ★ 关键里程碑: 二类获批M{c2Month} / 三类获批M{c3Month}</p>

      <div className="overflow-x-auto">
        {/* Year headers */}
        <div className="flex" style={{ paddingLeft: 180 }}>
          {['Year 1 (M1–12)', 'Year 2 (M13–24)', 'Year 3 (M25–36)', 'Year 4 (M37–48)', 'Year 5 (M49–60)'].map((label, i) => (
            <div key={i} className={`flex-1 text-center text-xs text-gray-500 font-semibold py-1 ${i > 0 ? 'border-l-2 border-dashed border-gray-200' : ''}`}>
              {label}
            </div>
          ))}
        </div>

        {(isDelayed ? ganttRowsDelayed : ganttRows).map((row, i) => (
          <div key={i} className="flex items-center my-0.5" style={{ minHeight: 26 }}>
            <div className="w-[180px] flex-shrink-0 text-xs text-gray-800 pr-2.5 text-right font-medium">{row.label}</div>
            <div className="flex-1 relative h-[22px]">
              {row.bars.map((bar, j) => (
                <div
                  key={j}
                  className={`absolute h-[18px] rounded-md top-[2px] flex items-center justify-center text-white text-[10px] font-semibold shadow-sm ${bar.cls}`}
                  style={{ left: bar.left, width: bar.width }}
                >
                  {bar.text}
                </div>
              ))}
              {row.milestone && (
                <div
                  className="absolute top-[-1px] w-5 h-5 bg-green-600 rotate-45 rounded-sm shadow-md"
                  style={{ left: row.milestone }}
                />
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
          <span className="flex items-center gap-1"><i className="inline-block w-2.5 h-2.5 bg-green-600 rotate-45 rounded-sm" /> 关键里程碑</span>
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
            {(isDelayed ? milestonesDelayed : milestones).map((m, i) => (
              <tr key={i} className={`${m.bold ? 'font-bold' : ''} even:bg-gray-50/50`}>
                <td className="py-2 px-3.5 border-b border-gray-100">{m.month}</td>
                <td className="py-2 px-3.5 border-b border-gray-100">{m.desc}</td>
                <td className="py-2 px-3.5 border-b border-gray-100">{m.kpi}</td>
                <td className="py-2 px-3.5 border-b border-gray-100"><span className={`inline-block px-2.5 py-0.5 rounded-xl text-[11px] font-semibold ${m.typeCls}`}>{m.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const ganttRows = [
  { label: 'CDMO原型+试点', bars: [{ left: '0%', width: '10%', text: 'M1–6', cls: 'bg-gradient-to-r from-blue-600 to-blue-400' }] },
  { label: '算法验证', bars: [{ left: '10%', width: '10%', text: 'M7–12', cls: 'bg-gradient-to-r from-blue-600 to-blue-400' }] },
  { label: '种子轮融资', bars: [{ left: '0%', width: '5%', text: 'M1–3', cls: 'bg-gradient-to-r from-amber-500 to-amber-400' }] },
  { label: 'ISO13485联调', bars: [{ left: '13%', width: '5%', text: 'M9–12', cls: 'bg-gradient-to-r from-purple-600 to-purple-400' }] },
  { label: 'Pre-A融资', bars: [{ left: '20%', width: '5%', text: 'M13–15', cls: 'bg-gradient-to-r from-amber-500 to-amber-400' }] },
  { label: '二类审评', bars: [{ left: '20%', width: '10%', text: 'M13–18', cls: 'bg-gradient-to-r from-purple-600 to-purple-400' }] },
  { label: '★ 二类获批', bars: [], milestone: '29%' },
  { label: '二类商业化', bars: [{ left: '30%', width: '10%', text: 'M19–24', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
  { label: 'A轮融资', bars: [{ left: '40%', width: '10%', text: 'M25–30', cls: 'bg-gradient-to-r from-amber-500 to-amber-400' }] },
  { label: '三类审评+二类扩张', bars: [{ left: '40%', width: '20%', text: 'M25–36', cls: 'bg-gradient-to-r from-purple-600 to-purple-400' }] },
  { label: '★ 三类获批', bars: [], milestone: '59%' },
  { label: '三类首年扩张', bars: [{ left: '60%', width: '20%', text: 'M37–48', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
  { label: '三类规模化', bars: [{ left: '80%', width: '20%', text: 'M49–60', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
];

const milestones = [
  { month: 'M1–M6', desc: 'CDMO签约+功能原型+2家医院40床科研部署', kpi: '三模态数据采集通过', type: '🔵 研发', typeCls: 'bg-blue-100 text-blue-800', bold: false },
  { month: 'M1–M3', desc: '种子轮融资完成', kpi: '¥400–600万到账', type: '🟡 融资', typeCls: 'bg-amber-100 text-amber-800', bold: false },
  { month: 'M7–M12', desc: '算法训练与测试', kpi: 'AUROC≥0.78', type: '🔵 研发', typeCls: 'bg-blue-100 text-blue-800', bold: false },
  { month: 'M9–M12', desc: 'ISO13485质量体系联调', kpi: '体系审核通过', type: '🟣 注册', typeCls: 'bg-purple-100 text-purple-800', bold: false },
  { month: 'M13–M15', desc: 'Pre-A轮融资完成', kpi: '¥800–1,200万到账', type: '🟡 融资', typeCls: 'bg-amber-100 text-amber-800', bold: false },
  { month: 'M18', desc: '★ 二类医疗器械证获批', kpi: '注册证到手', type: '🟣 注册', typeCls: 'bg-purple-100 text-purple-800', bold: true },
  { month: 'M19–M24', desc: '100床二类商业化+RWD收集', kpi: '部署率≥90%', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
  { month: 'M25–M30', desc: 'A轮融资完成', kpi: '¥2,000–3,000万到账', type: '🟡 融资', typeCls: 'bg-amber-100 text-amber-800', bold: false },
  { month: 'M36', desc: '★ 三类注册证获批', kpi: '注册证到手', type: '🟣 注册', typeCls: 'bg-purple-100 text-purple-800', bold: true },
  { month: 'M37–M48', desc: '三类首年100床新增+131床升级', kpi: '累计300床', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
  { month: 'M49–M60', desc: '三类扩张200床新增', kpi: '累计500床', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
];

// Delayed scenario: +3 months shift on key milestones
const ganttRowsDelayed = [
  { label: 'CDMO原型+试点', bars: [{ left: '0%', width: '10%', text: 'M1–6', cls: 'bg-gradient-to-r from-blue-600 to-blue-400' }] },
  { label: '算法验证', bars: [{ left: '10%', width: '10%', text: 'M7–12', cls: 'bg-gradient-to-r from-blue-600 to-blue-400' }] },
  { label: '种子轮融资', bars: [{ left: '0%', width: '5%', text: 'M1–3', cls: 'bg-gradient-to-r from-amber-500 to-amber-400' }] },
  { label: 'ISO13485联调', bars: [{ left: '13%', width: '5%', text: 'M9–12', cls: 'bg-gradient-to-r from-purple-600 to-purple-400' }] },
  { label: 'Pre-A融资', bars: [{ left: '20%', width: '5%', text: 'M13–15', cls: 'bg-gradient-to-r from-amber-500 to-amber-400' }] },
  { label: '二类审评(延迟)', bars: [{ left: '20%', width: '15%', text: 'M13–21', cls: 'bg-gradient-to-r from-purple-600 to-purple-400' }] },
  { label: '★ 二类获批(M21)', bars: [], milestone: '34%' },
  { label: '二类商业化', bars: [{ left: '35%', width: '10%', text: 'M22–27', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
  { label: 'A轮融资', bars: [{ left: '45%', width: '10%', text: 'M28–33', cls: 'bg-gradient-to-r from-amber-500 to-amber-400' }] },
  { label: '三类审评(延迟)', bars: [{ left: '45%', width: '20%', text: 'M28–39', cls: 'bg-gradient-to-r from-purple-600 to-purple-400' }] },
  { label: '★ 三类获批(M39)', bars: [], milestone: '64%' },
  { label: '三类首年扩张', bars: [{ left: '65%', width: '18%', text: 'M40–48', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
  { label: '三类规模化', bars: [{ left: '80%', width: '20%', text: 'M49–60', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
];

const milestonesDelayed = [
  { month: 'M1–M6', desc: 'CDMO签约+功能原型+2家医院40床科研部署', kpi: '三模态数据采集通过', type: '🔵 研发', typeCls: 'bg-blue-100 text-blue-800', bold: false },
  { month: 'M1–M3', desc: '种子轮融资完成', kpi: '¥400–600万到账', type: '🟡 融资', typeCls: 'bg-amber-100 text-amber-800', bold: false },
  { month: 'M7–M12', desc: '算法训练与测试', kpi: 'AUROC≥0.78', type: '🔵 研发', typeCls: 'bg-blue-100 text-blue-800', bold: false },
  { month: 'M9–M12', desc: 'ISO13485质量体系联调', kpi: '体系审核通过', type: '🟣 注册', typeCls: 'bg-purple-100 text-purple-800', bold: false },
  { month: 'M13–M15', desc: 'Pre-A轮融资完成', kpi: '¥800–1,200万到账', type: '🟡 融资', typeCls: 'bg-amber-100 text-amber-800', bold: false },
  { month: 'M21 ⚠️', desc: '★ 二类获批(延迟+3个月)', kpi: '注册证到手', type: '🟣 注册', typeCls: 'bg-orange-100 text-orange-800', bold: true },
  { month: 'M22–M27', desc: '100床二类商业化+RWD收集', kpi: '部署率≥90%', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
  { month: 'M28–M33', desc: 'A轮融资完成', kpi: '¥2,000–3,000万到账', type: '🟡 融资', typeCls: 'bg-amber-100 text-amber-800', bold: false },
  { month: 'M39 ⚠️', desc: '★ 三类获批(延迟+3个月)', kpi: '注册证到手', type: '🟣 注册', typeCls: 'bg-orange-100 text-orange-800', bold: true },
  { month: 'M40–M48', desc: '三类首年100床新增+131床升级', kpi: '累计300床', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
  { month: 'M49–M60', desc: '三类扩张200床新增', kpi: '累计500床', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
];
