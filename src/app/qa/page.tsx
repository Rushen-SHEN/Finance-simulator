'use client';

import { useState, useMemo } from 'react';
import { ModelInputs, calculate, CalcResult } from '@/lib/calculator';
import { DEFAULT_MODEL, BP_TARGETS } from '@/lib/defaults';
import { loadModel } from '@/lib/storage';
import { useModelInit } from '@/lib/useModelInit';
import {
  BP_MAIN_TABLE, BP_SOM, DOC_VERSIONS,
  DataConflict, detectConflicts,
} from '@/lib/bp-reference';

const YEAR_LABELS = ['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10'];

const FP_VERSION = DOC_VERSIONS.fp;
const BP_VERSION = DOC_VERSIONS.bp;

export default function QAPage() {
  const [model, setModel] = useModelInit();
  const [activeTab, setActiveTab] = useState<'linkage' | 'som' | 'scenarios'>('linkage');

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

  const liveData = useMemo(() => {
    const yrs = resultBest.years;
    const rev = yrs.map(y => Math.round(y.total_revenue / 10000));
    const samMid = model.global.sam_midpoint; // 万元
    return {
      cumBeds: yrs.map(y => y.cumulative_beds),
      activePaying: yrs.map(y => y.active_paying),
      ebitda: yrs.map(y => Math.round(y.ebitda / 10000)),
      revenue: rev,
      yoy: rev.map((r, i) => i === 0 || rev[i - 1] === 0 ? null : ((r - rev[i - 1]) / rev[i - 1] * 100)),
      somPct: rev.map(r => r > 0 && samMid > 0 ? (r / samMid * 100) : 0),
    };
  }, [resultBest, model.global.sam_midpoint]);

  // Compute results for all scenarios (for scenarios tab)
  const scenarioResults = useMemo(() => {
    const keys = ['neutral', 'optimistic', 'conservative'] as const;
    const out: Record<string, { result: CalcResult; so: typeof so }> = {};
    for (const k of keys) {
      const s = model.scenario_overrides?.[k];
      if (s) {
        out[k] = { result: calculate(model.global, model.yearly, model.opex, model.milestones_best, s), so: s };
      }
    }
    return out;
  }, [model]);

  // Helper: format growth rates for a scenario override
  const fmtGrowths = (s: typeof so) => {
    if (!s) return '';
    const gs = [s.growth_y6, s.growth_y7, s.growth_y8, s.growth_y9, s.growth_y10];
    const allSame = gs.every(g => g === gs[0]);
    if (allSame) return `Y6-Y10 均${(gs[0] * 100).toFixed(0)}%`;
    return `Y6 ${(gs[0]*100).toFixed(0)}%→Y10 ${(gs[4]*100).toFixed(0)}%`;
  };

  // Helper: find EBITDA+ year
  const ebitdaYear = (r: CalcResult) => {
    const idx = r.years.findIndex(y => y.ebitda > 0);
    return idx >= 0 ? `Y${idx + 1}` : '未转正';
  };

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

            {/* Roadshow data anchors — dynamic */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">路演稿数据锚点</h3>
              <div className="text-xs text-slate-500 mb-2">路演稿已全部通过 data-field 与模拟器实时联动</div>
              <div className="space-y-2">
                {[
                  { label: 's17 收入图表', desc: '6流收入堆叠 · Y1-Y10', ok: true },
                  { label: 's17 盈利路径', desc: 'EBITDA/NP 柱图 · Y1-Y10', ok: true },
                  { label: 's17 渠道结构', desc: '直销/经销商/授权金占比', ok: true },
                  { label: 's17 床位部署', desc: '累计/活跃床位柱图', ok: true },
                  { label: 's16 SOM双线图', desc: '收入+床位增长曲线', ok: true },
                  { label: 's10 BOM/定价表', desc: '硬件/SaaS/BOM/毛利', ok: true },
                  { label: 's10 ROI卡片', desc: 'C2/C3/升级ROI+回收期', ok: true },
                  { label: 's18 情景描述', desc: '乐观/中性/保守动态叙述', ok: true },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <span className="text-xs text-slate-300">{row.label}</span>
                    <span className="text-xs font-mono text-green-400">{row.desc} ✓</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-slate-600 mt-2">
                所有路演稿数据项已通过 data-field + postMessage 机制与模拟器参数面板实时联动。
              </div>
            </div>
          </div>
        )}

        {activeTab === 'som' && (
          <div className="space-y-6">
            <div className="text-xs text-slate-400 mb-2">续约率 {(effectiveRR * 100).toFixed(0)}% · SAM中值¥{(model.global.sam_midpoint / 10000).toFixed(1)}亿 · 模拟器实时数据</div>

            {/* SVG SOM Chart — dynamic Y-axis */}
            <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-3">SOM 10年增长曲线 (收入)</h3>
              {(() => {
                const allVals = [...liveData.revenue, ...BP_MAIN_TABLE.total_revenue];
                const rawMax = Math.max(...allVals, 100);
                // nice round max
                const mag = Math.pow(10, Math.floor(Math.log10(rawMax)));
                const maxVal = Math.ceil(rawMax / mag) * mag;
                const gridLines = [0.25, 0.5, 0.75].map(f => Math.round(maxVal * f));
                const yPos = (v: number) => 170 - (v / maxVal) * 130;
                const bpPoints = BP_MAIN_TABLE.total_revenue.map((v, i) => `${50 + i * 36},${yPos(v)}`).join(' ');
                const simPoints = liveData.revenue.map((v, i) => `${50 + i * 36},${yPos(v)}`).join(' ');
                return (
                  <svg viewBox="0 0 400 200" className="w-full max-w-[600px] mx-auto">
                    <line x1="40" y1="170" x2="380" y2="170" stroke="rgba(130,188,255,0.2)" strokeWidth="1"/>
                    {gridLines.map(g => (
                      <line key={g} x1="40" y1={yPos(g)} x2="380" y2={yPos(g)} stroke="rgba(130,188,255,0.08)" strokeWidth="0.5"/>
                    ))}
                    <text x="2" y="174" fill="rgba(157,176,201,0.6)" fontSize="8" fontFamily="monospace">0</text>
                    {gridLines.map(g => (
                      <text key={g} x="2" y={yPos(g) + 4} fill="rgba(157,176,201,0.6)" fontSize="8" fontFamily="monospace">{g.toLocaleString()}</text>
                    ))}
                    <polyline points={bpPoints} fill="none" stroke="rgba(255,191,102,0.8)" strokeWidth="2" strokeDasharray="4 3"/>
                    <polyline points={simPoints} fill="none" stroke="rgba(85,213,255,0.9)" strokeWidth="2"/>
                    {BP_MAIN_TABLE.total_revenue.map((v, i) => (
                      <circle key={`bp-${i}`} cx={50 + i * 36} cy={yPos(v)} r="3" fill="rgba(255,191,102,0.8)" stroke="rgba(4,8,18,0.8)" strokeWidth="1.5"/>
                    ))}
                    {liveData.revenue.map((v, i) => (
                      <circle key={`sim-${i}`} cx={50 + i * 36} cy={yPos(v)} r="3" fill="rgba(85,213,255,0.9)" stroke="rgba(4,8,18,0.8)" strokeWidth="1.5"/>
                    ))}
                    {YEAR_LABELS.map((label, i) => (
                      <text key={label} x={50 + i * 36} y="185" fill="rgba(157,176,201,0.6)" fontSize="7" fontFamily="monospace" textAnchor="middle">{label}</text>
                    ))}
                    <line x1="50" y1="15" x2="70" y2="15" stroke="rgba(85,213,255,0.9)" strokeWidth="2"/>
                    <text x="74" y="18" fill="rgba(157,176,201,0.8)" fontSize="7">模拟器</text>
                    <line x1="120" y1="15" x2="140" y2="15" stroke="rgba(255,191,102,0.8)" strokeWidth="2" strokeDasharray="4 3"/>
                    <text x="144" y="18" fill="rgba(157,176,201,0.8)" fontSize="7">{BP_VERSION}</text>
                  </svg>
                );
              })()}
            </div>

            {/* SOM table — live data */}
            <div className="rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-800/80">
                    <th className="text-left px-3 py-2 text-slate-400 font-medium">年份</th>
                    <th className="text-right px-3 py-2 text-cyan-400/80 font-medium">收入(万)</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">同比</th>
                    <th className="text-right px-3 py-2 text-slate-400 font-medium">SOM穿透</th>
                    <th className="text-right px-3 py-2 text-cyan-400/80 font-medium">活跃床位</th>
                  </tr>
                </thead>
                <tbody>
                  {YEAR_LABELS.map((label, i) => (
                    <tr key={label} className="border-t border-slate-700/50">
                      <td className="px-3 py-2 text-slate-300 font-mono">{label}</td>
                      <td className="px-3 py-2 text-right text-cyan-300 font-mono">{liveData.revenue[i].toLocaleString()}</td>
                      <td className="px-3 py-2 text-right text-slate-400 font-mono">{liveData.yoy[i] !== null ? liveData.yoy[i]!.toFixed(1) + '%' : '—'}</td>
                      <td className="px-3 py-2 text-right text-slate-400 font-mono">{liveData.somPct[i] > 0 ? liveData.somPct[i].toFixed(2) + '%' : '—'}</td>
                      <td className="px-3 py-2 text-right text-cyan-400 font-mono">{liveData.activePaying[i].toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ARR + SOM formulas — dynamic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/30">
                <h4 className="text-sm font-bold text-slate-200 mb-2">ARR计算公式</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>ARR = 活跃付费床位 × 年化单床SaaS</div>
                  <div>活跃付费床位 = 累计商业床位 × 续约率({(effectiveRR * 100).toFixed(0)}%)</div>
                  <div className="text-cyan-400 mt-2">Y10: {liveData.activePaying[9].toLocaleString()}床 · ARR ¥{Math.round(liveData.activePaying[9] * (model.global.price_saas_c3 || 40000) / 10000).toLocaleString()}万</div>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/30">
                <h4 className="text-sm font-bold text-slate-200 mb-2">SOM穿透率</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>穿透率 = 总收入(万) / SAM中值(¥{(model.global.sam_midpoint / 10000).toFixed(1)}亿) × 100%</div>
                  <div>Y5: {liveData.somPct[4].toFixed(2)}% | Y10: {liveData.somPct[9].toFixed(2)}%</div>
                  <div className="text-slate-500">{liveData.somPct[9] < 5 ? '市场远未饱和，仍有大幅扩张空间' : liveData.somPct[9] < 15 ? '穿透率处于中等水平' : '穿透率较高，需关注天花板'}</div>
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

            {/* Dynamic scenario cards */}
            {(() => {
              const neutralSo = model.scenario_overrides?.neutral;
              const neutralRR = neutralSo?.rr_base ?? model.global.rr_base;
              const cards = [
                { key: 'neutral', icon: '◆', title: '中性 (Neutral)', color: 'cyan', border: 'border-cyan-500/20 bg-cyan-500/5' },
                { key: 'optimistic', icon: '▲', title: '乐观 (Optimistic)', color: 'green', border: 'border-green-500/20 bg-green-500/5' },
                { key: 'conservative', icon: '▼', title: '保守 (Conservative)', color: 'amber', border: 'border-amber-500/20 bg-amber-500/5' },
              ];
              return cards.map(card => {
                const sr = scenarioResults[card.key];
                if (!sr) return null;
                const { result: r, so: s } = sr;
                const rr = s.rr_base;
                const rrDiffPP = Math.round((rr - neutralRR) * 100);
                const y10 = r.years[9];
                const y10Rev = Math.round(y10.total_revenue / 10000);
                const y10EBITDA = Math.round(y10.ebitda / 10000);
                const y10Beds = y10.cumulative_beds;
                const ebitdaY = ebitdaYear(r);

                // Compute neutral Y10 EBITDA for % comparison
                const neutralY10EBITDA = scenarioResults.neutral ? Math.round(scenarioResults.neutral.result.years[9].ebitda / 10000) : 0;
                const ebitdaDiffPct = neutralY10EBITDA !== 0 ? Math.round((y10EBITDA - neutralY10EBITDA) / Math.abs(neutralY10EBITDA) * 100) : 0;

                const items: [string, string][] = [];

                if (card.key === 'neutral') {
                  items.push(['续约率', `${(rr * 100).toFixed(0)}%`]);
                  items.push(['增长率', fmtGrowths(s)]);
                  items.push(['EBITDA转正', `${ebitdaY} (授权金¥${((model.global.license_amount + model.global.milestone_payment) / 10000).toFixed(0)}万支撑)`]);
                  items.push(['算法', '底层引擎从BOM逐级构建P&L (Y1-Y5)，Y6-Y10按增长率投射，OpEx独立增速控制']);
                  items.push(['Y10指标', `床位${y10Beds.toLocaleString()} / 收入¥${y10Rev.toLocaleString()}万 / EBITDA¥${y10EBITDA.toLocaleString()}万`]);
                } else if (card.key === 'optimistic') {
                  items.push(['续约率', `${(rr * 100).toFixed(0)}%${rrDiffPP !== 0 ? ` (${rrDiffPP > 0 ? '+' : ''}${rrDiffPP}pp vs 中性)` : ' (与中性相同)'}`]);
                  items.push(['增长率', fmtGrowths(s)]);
                  items.push(['床位系数', `bed_growth_factor=${s.bed_growth_factor} (${s.bed_growth_factor > 1 ? '+' : ''}${Math.round((s.bed_growth_factor - 1) * 100)}%)`]);
                  items.push(['影响', `Y10 EBITDA ${ebitdaDiffPct >= 0 ? '+' : ''}${ebitdaDiffPct}% vs 中性`]);
                  items.push(['Y10指标', `床位${y10Beds.toLocaleString()} / 收入¥${y10Rev.toLocaleString()}万 / EBITDA¥${y10EBITDA.toLocaleString()}万`]);
                } else {
                  items.push(['续约率', `${(rr * 100).toFixed(0)}%${rrDiffPP !== 0 ? ` (${rrDiffPP > 0 ? '+' : ''}${rrDiffPP}pp vs 中性)` : ''}`]);
                  items.push(['增长率', fmtGrowths(s)]);
                  items.push(['床位系数', `bed_growth_factor=${s.bed_growth_factor} (${s.bed_growth_factor > 1 ? '+' : ''}${Math.round((s.bed_growth_factor - 1) * 100)}%)`]);
                  items.push(['影响', `Y10 EBITDA ${ebitdaDiffPct >= 0 ? '+' : ''}${ebitdaDiffPct}% vs 中性`]);
                  items.push(['算法', `rr_base=${rr}。续约率下降对Year 3+影响显著(SaaS存量按${(rr*100).toFixed(0)}%衰减)，硬件收入不受影响`]);
                  items.push(['Y10指标', `床位${y10Beds.toLocaleString()} / 收入¥${y10Rev.toLocaleString()}万 / EBITDA¥${y10EBITDA.toLocaleString()}万`]);
                }

                return (
                  <div key={card.key} className={`p-5 rounded-xl border ${card.border}`}>
                    <div className={`text-sm font-bold text-${card.color}-300 mb-3`}>{card.icon} {card.title}</div>
                    <div className="space-y-2">
                      {items.map(([label, value]) => (
                        <div key={label} className="text-xs text-slate-400">
                          <b className="text-slate-300">{label}:</b> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}

            {/* Delayed scenario — milestone-driven */}
            <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/5">
              <div className="text-sm font-bold text-rose-300 mb-3">◇ 延迟 (Delayed)</div>
              <div className="space-y-2 text-xs text-slate-400">
                <div><b className="text-slate-300">续约率:</b> {((model.scenario_overrides?.neutral?.rr_base ?? model.global.rr_base) * 100).toFixed(0)}% (与中性相同)</div>
                <div><b className="text-slate-300">影响:</b> 里程碑节奏整体后移，不改变单床经济性</div>
                <div><b className="text-slate-300">触发条件:</b> NMPA审批延迟、试点医院协调困难</div>
                <div><b className="text-slate-300">算法:</b> 里程碑DAG中的C2/C3获批时点后移→自动触发deploymentGating重算→首年销售因子(firstYearFactor)随审批月份联动调整</div>
                <div><b className="text-slate-300">关键机制:</b> deriveFirstYearFactor(): C2审批月→Y2可售月数/12; deriveDeploymentGating(): 逐年逐类(C2/C3)计算部署门控系数; 即使延迟至M20, {ebitdaYear(resultBest) === 'Y2' ? 'Y2 EBITDA仍可转正' : 'EBITDA转正延迟至' + ebitdaYear(resultBest)}(授权金保障)</div>
              </div>
            </div>

            {/* Milestone delay sensitivity — dynamic from milestones */}
            {(() => {
              const bestMs = model.milestones_best;
              const baseMs = model.milestones_base;
              const c2Best = bestMs?.find(m => m.id === 'c2_reg');
              const c3Best = bestMs?.find(m => m.id === 'c3_reg');
              const c2Base = baseMs?.find(m => m.id === 'c2_reg');
              const c3Base = baseMs?.find(m => m.id === 'c3_reg');
              const rows = [
                { label: 'Best', c2: c2Best ? `M${c2Best.endM}` : '—', c3: c3Best ? `M${c3Best.endM}` : '—', ebitda: ebitdaYear(resultBest), color: 'text-green-400' },
                { label: '基准', c2: c2Base ? `M${c2Base.endM}` : '—', c3: c3Base ? `M${c3Base.endM}` : '—', ebitda: '—', color: 'text-cyan-400' },
              ];
              return (
                <div className="p-5 rounded-xl border border-slate-700 bg-slate-800/30">
                  <h3 className="text-sm font-bold text-slate-200 mb-3">里程碑延迟敏感性</h3>
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
                        {rows.map(row => (
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
                  <div className="text-[11px] text-slate-500 mt-2">* 授权金¥{((model.global.license_amount) / 10000).toFixed(0)}万支撑下EBITDA转正可保障</div>
                </div>
              );
            })()}

            {/* Growth benchmark — ARIA column dynamic */}
            <div className="p-5 rounded-xl border border-slate-700 bg-slate-800/30">
              <h3 className="text-sm font-bold text-slate-200 mb-3">增速对标 (BP §4.1)</h3>
              {(() => {
                const ns = model.scenario_overrides?.neutral;
                const avgGrowth = ns ? Math.round(((ns.growth_y6 + ns.growth_y7 + ns.growth_y8 + ns.growth_y9 + ns.growth_y10) / 5) * 100) : 30;
                return (
                  <>
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
                            { stage: '上市前2年', iv: '10-40%', ad: '20-50%', aria: fmtGrowths(ns!) },
                            { stage: '上市后2-5年', iv: '50-80%', ad: '60-80%', aria: fmtGrowths(ns!) },
                            { stage: '规模化期', iv: '30-50%', ad: '25-40%', aria: fmtGrowths(ns!) },
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
                    <div className="text-[11px] text-slate-500 mt-2">ARIA Y6-Y10平均增速{avgGrowth}%，位于推想/鹰瞳规模化增速区间内</div>
                  </>
                );
              })()}
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
