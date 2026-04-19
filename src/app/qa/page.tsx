'use client';

import { useState, useMemo } from 'react';
import { ModelInputs, calculate, CalcResult } from '@/lib/calculator';
import { DEFAULT_MODEL, BP_TARGETS } from '@/lib/defaults';
import { loadModel } from '@/lib/storage';
import {
  BP_MAIN_TABLE, BP_SOM,
  DataConflict, detectConflicts,
} from '@/lib/bp-reference';

const YEAR_LABELS = ['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10'];

// ARIA Finance Plan v2.0 data (BPccR2 §9.2 Best Case, Y1-Y5 only)
const FP_VERSION = 'Finance Plan v2.0';
const BP_VERSION = 'BP v2.1 (2026-04-19)';

export default function QAPage() {
  const [model, setModel] = useState<ModelInputs>(structuredClone(DEFAULT_MODEL));
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'linkage' | 'som' | 'scenarios'>('linkage');

  if (!initialized && typeof window !== 'undefined') {
    const saved = loadModel();
    if (JSON.stringify(saved) !== JSON.stringify(model)) setModel(saved);
    setInitialized(true);
  }

  const resultBest: CalcResult = useMemo(
    () => calculate(model.global, model.yearly, model.opex, model.milestones_best),
    [model]
  );

  const growthRates = useMemo(
    () => [model.global.growth_y6, model.global.growth_y7, model.global.growth_y8, model.global.growth_y9, model.global.growth_y10],
    [model.global]
  );

  const conflicts: DataConflict[] = useMemo(
    () => detectConflicts(resultBest, model.global.rr_base, growthRates),
    [resultBest, model.global.rr_base, growthRates]
  );

  const liveData = useMemo(() => {
    const yrs = resultBest.years;
    return {
      cumBeds: yrs.map(y => y.cumulative_beds),
      ebitda: yrs.map(y => Math.round(y.ebitda / 10000)),
      revenue: yrs.map(y => Math.round(y.total_revenue / 10000)),
    };
  }, [resultBest]);

  const basePath = process.env.NODE_ENV === 'production' ? '/Finance-simulator' : '';

  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B0F1A] via-[#111827] to-[#0B0F1A] border-b border-slate-700/50 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-[1000px] mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <a href={`${basePath}/`} className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black text-sm">A</span>
            </a>
            <div>
              <b className="text-lg text-white tracking-wider font-black">ARIA</b>
              <span className="text-[11px] text-cyan-400 font-mono tracking-widest ml-2">路演答疑</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`${basePath}/`} className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-900/50 text-slate-300 text-xs hover:bg-slate-800/50 transition-all">← 模拟器</a>
            <a href={`${basePath}/roadshow`} className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-900/50 text-slate-300 text-xs hover:bg-slate-800/50 transition-all">🎤 路演</a>
            <a href={`${basePath}/bp-mapping`} className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-900/50 text-slate-300 text-xs hover:bg-slate-800/50 transition-all">BP映射</a>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 pb-12 pt-4">
        {/* Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-slate-600 bg-slate-800/50 mb-6">
          {([
            { key: 'linkage' as const, label: '数据联动' },
            { key: 'som' as const, label: 'SOM曲线' },
            { key: 'scenarios' as const, label: '情景说明' },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === t.key
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'linkage' && (
          <div className="space-y-6">
            {/* Conflict summary */}
            <div className={`p-4 rounded-xl border ${
              conflicts.length > 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-green-500/30 bg-green-500/5'
            }`}>
              <div className="text-sm font-bold mb-1 text-white">
                {conflicts.length > 0 ? `⚠️ 发现 ${conflicts.length} 处数据冲突` : '✓ 所有数据与BP一致'}
              </div>
              <div className="text-xs text-slate-400">{BP_VERSION} · {FP_VERSION} (BPccR2 §9.2) · 容差: 5%</div>
            </div>

            {/* Revenue comparison — 3-way */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">收入对比 (万元)</h3>
              <div className="rounded-xl border border-slate-700 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="text-left px-3 py-2 text-slate-400 font-medium">年份</th>
                      <th className="text-right px-2 py-2 text-amber-400/80 font-medium text-xs">{BP_VERSION.split(' (')[0]}</th>
                      <th className="text-right px-2 py-2 text-violet-400/80 font-medium text-xs">{FP_VERSION}</th>
                      <th className="text-right px-2 py-2 text-cyan-400/80 font-medium text-xs">模拟器</th>
                      <th className="text-right px-2 py-2 text-slate-400 font-medium text-xs">BP差异</th>
                    </tr>
                  </thead>
                  <tbody>
                    {YEAR_LABELS.map((label, i) => {
                      const bp = BP_MAIN_TABLE.total_revenue[i];
                      const fp = BP_TARGETS.total_revenue[i];
                      const sim = liveData.revenue[i];
                      const diff = bp > 0 ? ((sim - bp) / bp * 100).toFixed(1) : '—';
                      const isConflict = bp > 0 && Math.abs(sim - bp) / bp > 0.05;
                      return (
                        <tr key={label} className={`border-t border-slate-700/50 ${isConflict ? 'bg-amber-500/5' : ''}`}>
                          <td className="px-3 py-2 text-slate-300 font-mono">{label}</td>
                          <td className="px-2 py-2 text-right text-amber-400/70 font-mono">{bp.toLocaleString()}</td>
                          <td className="px-2 py-2 text-right text-violet-400/70 font-mono">{fp > 0 ? fp.toLocaleString() : <span className="text-slate-600">—</span>}</td>
                          <td className={`px-2 py-2 text-right font-mono ${isConflict ? 'text-amber-400' : 'text-cyan-300'}`}>{sim.toLocaleString()}</td>
                          <td className={`px-2 py-2 text-right font-mono text-xs ${isConflict ? 'text-amber-400' : 'text-slate-500'}`}>{diff === '—' ? '—' : `${diff}%`}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EBITDA comparison — 3-way */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">EBITDA对比 (万元)</h3>
              <div className="rounded-xl border border-slate-700 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="text-left px-3 py-2 text-slate-400 font-medium">年份</th>
                      <th className="text-right px-2 py-2 text-amber-400/80 font-medium text-xs">{BP_VERSION.split(' (')[0]}</th>
                      <th className="text-right px-2 py-2 text-violet-400/80 font-medium text-xs">{FP_VERSION}</th>
                      <th className="text-right px-2 py-2 text-cyan-400/80 font-medium text-xs">模拟器</th>
                      <th className="text-right px-2 py-2 text-slate-400 font-medium text-xs">BP差异</th>
                    </tr>
                  </thead>
                  <tbody>
                    {YEAR_LABELS.map((label, i) => {
                      const bp = BP_MAIN_TABLE.ebitda[i];
                      const fp = BP_TARGETS.ebitda[i];
                      const sim = liveData.ebitda[i];
                      const absBp = Math.abs(bp);
                      const diff = absBp > 0 ? ((sim - bp) / absBp * 100).toFixed(1) : (sim === bp ? '0.0' : '—');
                      const isConflict = absBp > 0 ? Math.abs(sim - bp) / absBp > 0.05 : Math.abs(sim - bp) > 50;
                      const hasFp = fp !== 0 || i === 0; // Y1 can be 0 legitimately for EBITDA but BP_TARGETS has -180
                      return (
                        <tr key={label} className={`border-t border-slate-700/50 ${isConflict ? 'bg-amber-500/5' : ''}`}>
                          <td className="px-3 py-2 text-slate-300 font-mono">{label}</td>
                          <td className="px-2 py-2 text-right text-amber-400/70 font-mono">{bp.toLocaleString()}</td>
                          <td className="px-2 py-2 text-right text-violet-400/70 font-mono">{hasFp && i < 5 ? fp.toLocaleString() : <span className="text-slate-600">—</span>}</td>
                          <td className={`px-2 py-2 text-right font-mono ${isConflict ? 'text-amber-400' : 'text-cyan-300'}`}>{sim.toLocaleString()}</td>
                          <td className={`px-2 py-2 text-right font-mono text-xs ${isConflict ? 'text-amber-400' : 'text-slate-500'}`}>{diff}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Beds comparison */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">累计床位对比</h3>
              <div className="rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="text-left px-3 py-2 text-slate-400 font-medium">年份</th>
                      <th className="text-right px-2 py-2 text-amber-400/80 font-medium text-xs">{BP_VERSION.split(' (')[0]}</th>
                      <th className="text-right px-2 py-2 text-cyan-400/80 font-medium text-xs">模拟器</th>
                    </tr>
                  </thead>
                  <tbody>
                    {YEAR_LABELS.map((label, i) => {
                      const bp = BP_SOM.cumulative_beds[i];
                      const sim = liveData.cumBeds[i];
                      const isConflict = bp > 0 && Math.abs(sim - bp) / bp > 0.05;
                      return (
                        <tr key={label} className={`border-t border-slate-700/50 ${isConflict ? 'bg-amber-500/5' : ''}`}>
                          <td className="px-3 py-2 text-slate-300 font-mono">{label}</td>
                          <td className="px-2 py-2 text-right text-amber-400/70 font-mono">{bp.toLocaleString()}</td>
                          <td className={`px-2 py-2 text-right font-mono ${isConflict ? 'text-amber-400' : 'text-cyan-300'}`}>{sim.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Version legend */}
            <div className="flex flex-wrap gap-3 p-3 rounded-xl border border-slate-700/50 bg-slate-800/20">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400/70" />
                <span className="text-[11px] text-slate-400">{BP_VERSION}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-violet-400/70" />
                <span className="text-[11px] text-slate-400">{FP_VERSION} (BPccR2 §9.2 Best Case, Y1-Y5)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400/70" />
                <span className="text-[11px] text-slate-400">模拟器实时计算</span>
              </div>
            </div>

            {/* Roadshow data anchors */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">路演稿数据锚点</h3>
              <div className="text-xs text-slate-500 mb-2">路演稿中硬编码的数据 vs BP v2.1</div>
              <div className="space-y-2">
                {[
                  { label: 's17 Y5收入', roadshow: '¥1,665万', bp: '¥2,049万', ok: false },
                  { label: 's17 Y3收入', roadshow: '¥1,259万', bp: '¥1,212万', ok: false },
                  { label: 's17 Y4收入', roadshow: '¥1,398万', bp: '¥1,576万', ok: false },
                  { label: 's17 Y2收入', roadshow: '¥932万', bp: '¥932万', ok: true },
                  { label: 's16 SOM床位曲线', roadshow: '0→110→290→520→780', bp: '一致', ok: true },
                ].map(row => (
                  <div key={row.label} className={`flex items-center justify-between p-3 rounded-lg ${
                    row.ok ? 'bg-green-500/5 border border-green-500/20' : 'bg-amber-500/5 border border-amber-500/20'
                  }`}>
                    <span className="text-xs text-slate-300">{row.label}</span>
                    <span className={`text-xs font-mono ${row.ok ? 'text-green-400' : 'text-amber-400'}`}>
                      {row.ok ? `${row.roadshow} ✓` : `路演:${row.roadshow} ≠ BP:${row.bp}`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-slate-600 mt-2">
                注: 路演稿s17中的Y3/Y4/Y5收入基于旧模型，与BP v2.1有偏差。模拟器参数联动后路演页面会黄色高亮标出差异。
              </div>
            </div>
          </div>
        )}

        {activeTab === 'som' && (
          <div className="space-y-6">
            <div className="text-xs text-slate-400 mb-2">BP v2.1: 二类获批后30%年增长 · SAM中值¥27.5B</div>

            {/* SVG SOM Chart */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-3">SOM 10年增长曲线 (收入)</h3>
              <svg viewBox="0 0 400 200" className="w-full max-w-[600px] mx-auto">
                <line x1="40" y1="170" x2="380" y2="170" stroke="rgba(130,188,255,0.2)" strokeWidth="1"/>
                <line x1="40" y1="130" x2="380" y2="130" stroke="rgba(130,188,255,0.08)" strokeWidth="0.5"/>
                <line x1="40" y1="90" x2="380" y2="90" stroke="rgba(130,188,255,0.08)" strokeWidth="0.5"/>
                <line x1="40" y1="50" x2="380" y2="50" stroke="rgba(130,188,255,0.08)" strokeWidth="0.5"/>
                <text x="2" y="174" fill="rgba(157,176,201,0.6)" fontSize="8" fontFamily="monospace">0</text>
                <text x="2" y="134" fill="rgba(157,176,201,0.6)" fontSize="8" fontFamily="monospace">2500</text>
                <text x="2" y="94" fill="rgba(157,176,201,0.6)" fontSize="8" fontFamily="monospace">5000</text>
                <text x="2" y="54" fill="rgba(157,176,201,0.6)" fontSize="8" fontFamily="monospace">7500</text>
                {(() => {
                  const maxVal = 8000;
                  const bpPoints = BP_MAIN_TABLE.total_revenue.map((v, i) => `${50 + i * 36},${170 - (v / maxVal) * 130}`).join(' ');
                  const simPoints = liveData.revenue.map((v, i) => `${50 + i * 36},${170 - (v / maxVal) * 130}`).join(' ');
                  return (
                    <>
                      <polyline points={bpPoints} fill="none" stroke="rgba(255,191,102,0.8)" strokeWidth="2" strokeDasharray="4 3"/>
                      <polyline points={simPoints} fill="none" stroke="rgba(85,213,255,0.9)" strokeWidth="2"/>
                      {BP_MAIN_TABLE.total_revenue.map((v, i) => (
                        <circle key={`bp-${i}`} cx={50 + i * 36} cy={170 - (v / maxVal) * 130} r="3" fill="rgba(255,191,102,0.8)" stroke="rgba(4,8,18,0.8)" strokeWidth="1.5"/>
                      ))}
                      {liveData.revenue.map((v, i) => (
                        <circle key={`sim-${i}`} cx={50 + i * 36} cy={170 - (v / maxVal) * 130} r="3" fill="rgba(85,213,255,0.9)" stroke="rgba(4,8,18,0.8)" strokeWidth="1.5"/>
                      ))}
                    </>
                  );
                })()}
                {YEAR_LABELS.map((label, i) => (
                  <text key={label} x={50 + i * 36} y="185" fill="rgba(157,176,201,0.6)" fontSize="7" fontFamily="monospace" textAnchor="middle">{label}</text>
                ))}
                <line x1="50" y1="15" x2="70" y2="15" stroke="rgba(85,213,255,0.9)" strokeWidth="2"/>
                <text x="74" y="18" fill="rgba(157,176,201,0.8)" fontSize="7">模拟器</text>
                <line x1="120" y1="15" x2="140" y2="15" stroke="rgba(255,191,102,0.8)" strokeWidth="2" strokeDasharray="4 3"/>
                <text x="144" y="18" fill="rgba(157,176,201,0.8)" fontSize="7">BP v2.1</text>
              </svg>
            </div>

            {/* SOM table */}
            <div className="rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/80">
                    <th className="text-left px-3 py-2 text-slate-400 font-medium">年份</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">收入(万)</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">同比</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">SOM穿透</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">活跃床位</th>
                  </tr>
                </thead>
                <tbody>
                  {YEAR_LABELS.map((label, i) => (
                    <tr key={label} className="border-t border-slate-700/50">
                      <td className="px-3 py-2 text-slate-300 font-mono">{label}</td>
                      <td className="px-3 py-2 text-right text-slate-300 font-mono">{BP_MAIN_TABLE.total_revenue[i].toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-slate-400 font-mono">{i <= 1 ? '—' : '30%'}</td>
                      <td className="px-3 py-2 text-right text-slate-400 font-mono">{BP_SOM.som_penetration[i] > 0 ? (BP_SOM.som_penetration[i] * 100).toFixed(2) + '%' : '—'}</td>
                      <td className="px-3 py-2 text-right text-cyan-400 font-mono">{BP_SOM.active_paying[i].toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ARR + SOM formulas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/30">
                <h4 className="text-sm font-bold text-slate-200 mb-2">ARR计算公式</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>ARR = 活跃付费床位 × ¥0.7万/床/年</div>
                  <div>活跃付费床位 = 累计商业床位 × 续约率(70%)</div>
                  <div className="text-cyan-400 mt-2">Y10目标: 2,100床 × ¥0.7万 = ¥1,470万 ARR</div>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/30">
                <h4 className="text-sm font-bold text-slate-200 mb-2">SOM穿透率</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>穿透率 = 总收入(万) / SAM中值(¥27.5B) × 100%</div>
                  <div>Y5: 0.75% | Y10: 2.77%</div>
                  <div className="text-slate-500">市场远未饱和，仍有10倍扩张空间</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scenarios' && (
          <div className="space-y-6">
            {/* Glossary */}
            <div className="p-5 rounded-xl border border-slate-700 bg-slate-800/30">
              <h3 className="text-sm font-bold text-slate-200 mb-3">📖 术语表 (Glossary)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                {[
                  ['ARR', 'Annual Recurring Revenue — 年度经常性收入，SaaS订阅模式下按年计算的可预期收入'],
                  ['EBITDA', 'Earnings Before Interest, Taxes, Depreciation & Amortization — 息税折旧摊销前利润'],
                  ['SOM', 'Serviceable Obtainable Market — 可获得服务市场，实际可触达的市场规模'],
                  ['SAM', 'Serviceable Available Market — 可服务市场，产品理论可覆盖的市场总量'],
                  ['SaaS', 'Software as a Service — 软件即服务，按订阅周期收费的云/端软件模式'],
                  ['BOM', 'Bill of Materials — 物料清单，硬件产品的原材料与零部件成本'],
                  ['COGS', 'Cost of Goods Sold — 销货成本，直接用于生产产品的费用总和'],
                  ['OpEx', 'Operating Expenses — 运营支出，研发/销售/管理等日常经营开支'],
                  ['P&L', 'Profit & Loss Statement — 损益表，记录收入与支出的财务报表'],
                  ['CDMO', 'Contract Development & Manufacturing Organization — 合同研发与生产机构'],
                  ['CRO', 'Contract Research Organization — 合同研究组织，承接临床试验外包'],
                  ['NRE', 'Non-Recurring Engineering — 一次性工程费用，首次开模/认证等不重复成本'],
                  ['NMPA', '国家药品监督管理局 — 中国医疗器械注册审批的主管部门'],
                  ['C2/C3', '二类/三类医疗器械 — 按风险等级分类，C2由省局审批，C3由NMPA审批'],
                  ['谵妄 (Delirium)', 'ICU常见急性脑功能障碍，表现为意识模糊、注意力涣散，发生率60-80%'],
                  ['边缘AI (Edge AI)', '在设备端本地运行的AI推理，无需上传云端，满足医疗数据隐私与实时性要求'],
                  ['ROI', 'Return on Investment — 投资回报率，此处指医院采购ARIA的经济效益'],
                  ['Pre-A / Series A', '融资轮次 — Pre-A为天使轮后首次机构融资，Series A为首轮正式风险投资'],
                  ['续约率 (Renewal Rate)', 'SaaS客户年度续费比例，直接影响ARR存量和LTV'],
                  ['穿透率 (Penetration)', 'SOM占SAM比例，反映市场渗透深度'],
                ].map(([term, desc]) => (
                  <div key={term} className="py-1.5 border-b border-slate-700/30">
                    <span className="text-cyan-300 font-mono font-bold">{term}</span>
                    <span className="text-slate-400 ml-1.5">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scenario cards */}
            {[
              { key: 'neutral', icon: '◆', title: '中性 (Neutral)', color: 'cyan', border: 'border-cyan-500/20 bg-cyan-500/5',
                items: [
                  ['续约率', '70% (BPccR2 [注A13] 基准)'],
                  ['增长率', 'Y6-Y10 均30% (二类获批后统一增速)'],
                  ['EBITDA转正', 'Y2 (百特授权金¥300万支撑)'],
                  ['算法', '底层引擎从BOM逐级构建P&L (Y1-Y5)，Y6-Y10按增长率投射，OpEx增速为收入增速的50% (运营杠杆)'],
                  ['对标', '推想/鹰瞳规模化期30-50%增速区间内'],
                ]},
              { key: 'optimistic', icon: '▲', title: '乐观 (Optimistic)', color: 'green', border: 'border-green-500/20 bg-green-500/5',
                items: [
                  ['续约率', '85% (+15pp vs 基准)'],
                  ['影响', 'SaaS续约收入大幅提升，Y10 EBITDA +18%'],
                  ['触发条件', '产品黏性超预期，医院IT预算充裕'],
                  ['算法', '同中性引擎，仅调整rr_base参数。续约率提升直接影响SaaS存量收入(cohort survival model)，不改变硬件部署计划'],
                  ['BP对标', 'Y10床位3,450 / 收入¥8,979万 / EBITDA¥3,885万'],
                ]},
              { key: 'conservative', icon: '▼', title: '保守 (Conservative)', color: 'amber', border: 'border-amber-500/20 bg-amber-500/5',
                items: [
                  ['续约率', '55% (-15pp vs 基准)'],
                  ['影响', 'SaaS续约收入下滑，Y10 EBITDA -18%'],
                  ['触发条件', '中国医院SaaS付费意愿低于预期'],
                  ['算法', '同中性引擎，rr_base=0.55。续约率下降对Year 3+影响显著(SaaS存量按55%衰减)，硬件收入不受影响'],
                  ['BP对标', 'Y10床位2,550 / 收入¥6,239万 / EBITDA¥2,699万'],
                ]},
              { key: 'delayed', icon: '◇', title: '延迟 (Delayed)', color: 'rose', border: 'border-rose-500/20 bg-rose-500/5',
                items: [
                  ['续约率', '70% (与中性相同)'],
                  ['影响', '里程碑节奏整体后移，不改变单床经济性'],
                  ['触发条件', 'NMPA审批延迟、试点医院协调困难'],
                  ['算法', '里程碑DAG中的C2/C3获批时点后移→自动触发deploymentGating重算→首年销售因子(firstYearFactor)随审批月份联动调整'],
                  ['关键机制', 'deriveFirstYearFactor(): C2审批月→Y2可售月数/12; deriveDeploymentGating(): 逐年逐类(C2/C3)计算部署门控系数; 即使延迟至M20, Y2 EBITDA仍可转正(百特授权金保障)'],
                ]},
            ].map(scenario => (
              <div key={scenario.key} className={`p-5 rounded-xl border ${scenario.border}`}>
                <div className={`text-sm font-bold text-${scenario.color}-300 mb-3`}>{scenario.icon} {scenario.title}</div>
                <div className="space-y-2">
                  {scenario.items.map(([label, value]) => (
                    <div key={label} className="text-xs text-slate-400">
                      <b className="text-slate-300">{label}:</b> {value}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Milestone delay sensitivity */}
            <div className="p-5 rounded-xl border border-slate-700 bg-slate-800/30">
              <h3 className="text-sm font-bold text-slate-200 mb-3">里程碑延迟敏感性 (BP §6.2)</h3>
              <div className="rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="text-left px-3 py-2 text-slate-400">情景</th>
                      <th className="text-center px-3 py-2 text-slate-400">二类获批</th>
                      <th className="text-center px-3 py-2 text-slate-400">三类获批</th>
                      <th className="text-center px-3 py-2 text-slate-400">EBITDA转正</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Best', c2: 'M14', c3: 'M28', ebitda: 'Y2', color: 'text-green-400' },
                      { label: '基准', c2: 'M15', c3: 'M29', ebitda: 'Y2', color: 'text-cyan-400' },
                      { label: '保守', c2: 'M17', c3: 'M31', ebitda: 'Y2*', color: 'text-amber-400' },
                      { label: '悲观', c2: 'M20', c3: 'M36', ebitda: 'Y3', color: 'text-rose-400' },
                    ].map(row => (
                      <tr key={row.label} className="border-t border-slate-700/50">
                        <td className={`px-3 py-2 ${row.color}`}>{row.label}</td>
                        <td className="px-3 py-2 text-center text-slate-300 font-mono">{row.c2}</td>
                        <td className="px-3 py-2 text-center text-slate-300 font-mono">{row.c3}</td>
                        <td className={`px-3 py-2 text-center font-mono ${row.color}`}>{row.ebitda}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">* 百特授权金¥300万支撑下Y2仍可转正，概率85%+</div>
            </div>

            {/* Growth benchmark */}
            <div className="p-5 rounded-xl border border-slate-700 bg-slate-800/30">
              <h3 className="text-sm font-bold text-slate-200 mb-3">增速对标 (BP §4.1)</h3>
              <div className="rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="text-left px-3 py-2 text-slate-400">阶段</th>
                      <th className="text-center px-3 py-2 text-slate-400">推想</th>
                      <th className="text-center px-3 py-2 text-slate-400">鹰瞳</th>
                      <th className="text-center px-3 py-2 text-cyan-400">ARIA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { stage: '上市前2年', iv: '10-40%', ad: '20-50%', aria: '30%' },
                      { stage: '上市后2-5年', iv: '50-80%', ad: '60-80%', aria: '30%' },
                      { stage: '规模化期', iv: '30-50%', ad: '25-40%', aria: '30%' },
                    ].map(row => (
                      <tr key={row.stage} className="border-t border-slate-700/50">
                        <td className="px-3 py-2 text-slate-300">{row.stage}</td>
                        <td className="px-3 py-2 text-center text-slate-400 font-mono">{row.iv}</td>
                        <td className="px-3 py-2 text-center text-slate-400 font-mono">{row.ad}</td>
                        <td className="px-3 py-2 text-center text-cyan-400 font-mono font-bold">{row.aria}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">ARIA采用统一30%增速，位于推想/鹰瞳规模化增速区间内</div>
            </div>
          </div>
        )}

        <footer className="text-center py-6 border-t border-slate-600/50 mt-8 text-xs text-slate-400">
          ARIA 路演答疑数据面板 · {BP_VERSION} · {FP_VERSION}
        </footer>
      </div>
    </div>
  );
}
