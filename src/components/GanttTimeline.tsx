interface Props { scenario: string; }

export default function GanttTimeline({ scenario }: Props) {
  const isDelayed = scenario === 'delayed';
  const delay = isDelayed ? 3 : 0; // months
  const c2Month = 15 + delay;  // BP: M14-15 (was M18)
  const c3Month = 31 + delay;  // BP: M28-31 (was M36)

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
  { label: '二类审评', bars: [{ left: '18%', width: '7%', text: 'M11–15', cls: 'bg-gradient-to-r from-purple-600 to-purple-400' }] },
  { label: '★ 二类获批(M15)', bars: [], milestone: '24%' },
  { label: 'Baxter授权签约', bars: [{ left: '20%', width: '5%', text: 'M13–15', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
  { label: '二类商业化', bars: [{ left: '25%', width: '15%', text: 'M16–24', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
  { label: '三类审评', bars: [{ left: '38%', width: '14%', text: 'M24–31', cls: 'bg-gradient-to-r from-purple-600 to-purple-400' }] },
  { label: '★ 三类获批(M31)', bars: [], milestone: '51%' },
  { label: '三类首年+升级', bars: [{ left: '52%', width: '28%', text: 'M32–48', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
  { label: '全面扩张', bars: [{ left: '80%', width: '20%', text: 'M49–60', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
];

const milestones = [
  { month: 'M1–M6', desc: 'CDMO签约+功能原型+2家医院40床科研部署', kpi: '三模态数据采集通过', type: '🔵 研发', typeCls: 'bg-blue-100 text-blue-800', bold: false },
  { month: 'M1–M3', desc: '种子轮融资完成', kpi: '¥400–600万到账', type: '🟡 融资', typeCls: 'bg-amber-100 text-amber-800', bold: false },
  { month: 'M7–M12', desc: '算法训练与测试', kpi: 'AUROC≥0.78', type: '🔵 研发', typeCls: 'bg-blue-100 text-blue-800', bold: false },
  { month: 'M9–M12', desc: 'ISO13485质量体系联调', kpi: '体系审核通过', type: '🟣 注册', typeCls: 'bg-purple-100 text-purple-800', bold: false },
  { month: 'M13–M15', desc: 'Baxter渠道授权签约', kpi: '授权金¥300万到账', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: true },
  { month: 'M14–M15', desc: '★ 二类医疗器械证获批', kpi: '注册证到手 · 创新通道', type: '🟣 注册', typeCls: 'bg-purple-100 text-purple-800', bold: true },
  { month: 'M16–M24', desc: '110床C2商业化(直销80+Baxter30)', kpi: '部署率≥90%', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
  { month: 'M25–M27', desc: 'Baxter里程碑¥200万', kpi: '里程碑付款', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
  { month: 'M28–M31', desc: '★ 三类注册证获批', kpi: '注册证到手', type: '🟣 注册', typeCls: 'bg-purple-100 text-purple-800', bold: true },
  { month: 'M25–M36', desc: 'C3商业化 · 140床新增+40升级', kpi: '累计290床', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
  { month: 'M37–M48', desc: '规模放量 · 180 C3新增+50升级', kpi: '累计520床', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
  { month: 'M49–M60', desc: '全面扩张 · 260 C3新增', kpi: '累计780床', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
];

// Delayed scenario: +3 months shift on key milestones
const ganttRowsDelayed = [
  { label: 'CDMO原型+试点', bars: [{ left: '0%', width: '10%', text: 'M1–6', cls: 'bg-gradient-to-r from-blue-600 to-blue-400' }] },
  { label: '算法验证', bars: [{ left: '10%', width: '10%', text: 'M7–12', cls: 'bg-gradient-to-r from-blue-600 to-blue-400' }] },
  { label: '种子轮融资', bars: [{ left: '0%', width: '5%', text: 'M1–3', cls: 'bg-gradient-to-r from-amber-500 to-amber-400' }] },
  { label: 'ISO13485联调', bars: [{ left: '13%', width: '5%', text: 'M9–12', cls: 'bg-gradient-to-r from-purple-600 to-purple-400' }] },
  { label: '二类审评(延迟)', bars: [{ left: '18%', width: '12%', text: 'M11–18', cls: 'bg-gradient-to-r from-purple-600 to-purple-400' }] },
  { label: '★ 二类获批(M18)', bars: [], milestone: '29%' },
  { label: 'Baxter授权签约', bars: [{ left: '25%', width: '5%', text: 'M16–18', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
  { label: '二类商业化', bars: [{ left: '30%', width: '15%', text: 'M19–27', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
  { label: '三类审评(延迟)', bars: [{ left: '43%', width: '17%', text: 'M27–34', cls: 'bg-gradient-to-r from-purple-600 to-purple-400' }] },
  { label: '★ 三类获批(M34)', bars: [], milestone: '56%' },
  { label: '三类首年+升级', bars: [{ left: '57%', width: '23%', text: 'M35–48', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
  { label: '全面扩张', bars: [{ left: '80%', width: '20%', text: 'M49–60', cls: 'bg-gradient-to-r from-green-600 to-green-400' }] },
];

const milestonesDelayed = [
  { month: 'M1–M6', desc: 'CDMO签约+功能原型+2家医院40床科研部署', kpi: '三模态数据采集通过', type: '🔵 研发', typeCls: 'bg-blue-100 text-blue-800', bold: false },
  { month: 'M1–M3', desc: '种子轮融资完成', kpi: '¥400–600万到账', type: '🟡 融资', typeCls: 'bg-amber-100 text-amber-800', bold: false },
  { month: 'M7–M12', desc: '算法训练与测试', kpi: 'AUROC≥0.78', type: '🔵 研发', typeCls: 'bg-blue-100 text-blue-800', bold: false },
  { month: 'M9–M12', desc: 'ISO13485质量体系联调', kpi: '体系审核通过', type: '🟣 注册', typeCls: 'bg-purple-100 text-purple-800', bold: false },
  { month: 'M16–M18', desc: 'Baxter渠道授权签约(延迟)', kpi: '授权金¥300万到账', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: true },
  { month: 'M18 ⚠️', desc: '★ 二类获批(延迟+3个月)', kpi: '注册证到手', type: '🟣 注册', typeCls: 'bg-orange-100 text-orange-800', bold: true },
  { month: 'M19–M27', desc: '110床C2商业化(延迟)', kpi: '部署率≥90%', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
  { month: 'M25–M27', desc: 'Baxter里程碑¥200万', kpi: '里程碑付款', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
  { month: 'M34 ⚠️', desc: '★ 三类获批(延迟+3个月)', kpi: '注册证到手', type: '🟣 注册', typeCls: 'bg-orange-100 text-orange-800', bold: true },
  { month: 'M35–M48', desc: 'C3商业化+升级(延迟)', kpi: '累计520床', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
  { month: 'M49–M60', desc: '全面扩张 · 260 C3新增', kpi: '累计780床', type: '🟢 商业化', typeCls: 'bg-green-100 text-green-800', bold: false },
];
