'use client';

import { useState, useMemo, useRef } from 'react';
import { ModelInputs, calculate, CalcResult } from '@/lib/calculator';
import { DEFAULT_MODEL } from '@/lib/defaults';
import { loadModel } from '@/lib/storage';
import {
  BP_MAIN_TABLE, BP_SOM,
  DataConflict, detectConflicts,
} from '@/lib/bp-reference';

const YEAR_LABELS = ['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10'];

export default function RoadshowPage() {
  const [model, setModel] = useState<ModelInputs>(structuredClone(DEFAULT_MODEL));
  const [initialized, setInitialized] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'linkage' | 'som' | 'scenarios'>('linkage');
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // Derived live values for comparison
  const liveData = useMemo(() => {
    const yrs = resultBest.years;
    return {
      y2_revenue: Math.round(yrs[1].total_revenue / 10000),
      y3_revenue: Math.round(yrs[2].total_revenue / 10000),
      y5_revenue: Math.round(yrs[4].total_revenue / 10000),
      y10_revenue: Math.round(yrs[9].total_revenue / 10000),
      ebitda_positive_year: yrs.findIndex(y => y.ebitda > 0) + 1,
      cumBeds: yrs.map(y => y.cumulative_beds),
      ebitda: yrs.map(y => Math.round(y.ebitda / 10000)),
      revenue: yrs.map(y => Math.round(y.total_revenue / 10000)),
      netProfit: yrs.map(y => Math.round(y.net_profit / 10000)),
    };
  }, [resultBest]);

  const basePath = process.env.NODE_ENV === 'production' ? '/Finance-simulator' : '';

  return (
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B0F1A] via-[#111827] to-[#0B0F1A] border-b border-slate-700/50 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <a href={`${basePath}/`} className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black text-sm">A</span>
            </a>
            <div>
              <div className="flex items-baseline gap-2">
                <b className="text-lg text-white tracking-wider font-black">ARIA</b>
                <span className="text-[11px] text-cyan-400 font-mono tracking-widest">路演稿</span>
              </div>
              <span className="text-[11px] text-slate-300 tracking-wide">ICU谵妄预警 · 投资人演示版</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`${basePath}/`} className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-900/50 text-slate-300 text-xs hover:bg-slate-800/50 transition-all">
              ← 模拟器
            </a>
            <a href={`${basePath}/bp-mapping`} className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-900/50 text-slate-300 text-xs hover:bg-slate-800/50 transition-all">
              BP映射
            </a>
            <button
              onClick={() => setShowPanel(p => !p)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                showPanel
                  ? 'border-cyan-500/30 bg-cyan-500/15 text-cyan-300'
                  : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {showPanel ? '隐藏数据面板' : '显示数据面板'}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 min-h-0">
        {/* Iframe */}
        <div className={`flex-1 relative ${showPanel ? '' : ''}`}>
          <iframe
            ref={iframeRef}
            src={`${basePath}/roadshow.html`}
            className="w-full h-full border-0"
            style={{ minHeight: 'calc(100vh - 52px)' }}
            title="ARIA 路演稿"
          />
        </div>

        {/* Data linkage panel */}
        {showPanel && (
          <div className="w-[420px] flex-shrink-0 bg-slate-900/95 border-l border-slate-700/50 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 52px)' }}>
            <div className="p-4">
              {/* Tabs */}
              <div className="flex rounded-lg overflow-hidden border border-slate-600 bg-slate-800/50 mb-4">
                {([
                  { key: 'linkage' as const, label: '数据联动' },
                  { key: 'som' as const, label: 'SOM曲线' },
                  { key: 'scenarios' as const, label: '情景说明' },
                ]).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`flex-1 px-3 py-2 text-xs font-medium transition-all ${
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
                <div className="space-y-4">
                  {/* Conflict summary */}
                  <div className={`p-3 rounded-lg border ${
                    conflicts.length > 0
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : 'border-green-500/30 bg-green-500/5'
                  }`}>
                    <div className="text-xs font-bold mb-1">
                      {conflicts.length > 0
                        ? `⚠️ 发现 ${conflicts.length} 处数据冲突`
                        : '✓ 所有数据与BP一致'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      BP版本: v2.1 (2026-04-19) · 容差: 5%
                    </div>
                  </div>

                  {/* Revenue comparison */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">收入对比 (万元)</div>
                    <div className="rounded-lg border border-slate-700 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-800/80">
                            <th className="text-left px-2 py-1.5 text-slate-400 font-medium">年份</th>
                            <th className="text-right px-2 py-1.5 text-slate-400 font-medium">BP值</th>
                            <th className="text-right px-2 py-1.5 text-slate-400 font-medium">模拟器</th>
                            <th className="text-right px-2 py-1.5 text-slate-400 font-medium">差异</th>
                          </tr>
                        </thead>
                        <tbody>
                          {YEAR_LABELS.map((label, i) => {
                            const bp = BP_MAIN_TABLE.total_revenue[i];
                            const sim = liveData.revenue[i];
                            const diff = bp > 0 ? ((sim - bp) / bp * 100).toFixed(1) : '—';
                            const isConflict = bp > 0 && Math.abs(sim - bp) / bp > 0.05;
                            return (
                              <tr key={label} className={`border-t border-slate-700/50 ${isConflict ? 'bg-amber-500/5' : ''}`}>
                                <td className="px-2 py-1 text-slate-300 font-mono">{label}</td>
                                <td className="px-2 py-1 text-right text-slate-400 font-mono">{bp.toLocaleString()}</td>
                                <td className={`px-2 py-1 text-right font-mono ${isConflict ? 'text-amber-400' : 'text-slate-300'}`}>
                                  {sim.toLocaleString()}
                                </td>
                                <td className={`px-2 py-1 text-right font-mono text-[11px] ${isConflict ? 'text-amber-400' : 'text-slate-500'}`}>
                                  {diff === '—' ? '—' : `${diff}%`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* EBITDA comparison */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">EBITDA对比 (万元)</div>
                    <div className="rounded-lg border border-slate-700 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-800/80">
                            <th className="text-left px-2 py-1.5 text-slate-400 font-medium">年份</th>
                            <th className="text-right px-2 py-1.5 text-slate-400 font-medium">BP值</th>
                            <th className="text-right px-2 py-1.5 text-slate-400 font-medium">模拟器</th>
                            <th className="text-right px-2 py-1.5 text-slate-400 font-medium">差异</th>
                          </tr>
                        </thead>
                        <tbody>
                          {YEAR_LABELS.map((label, i) => {
                            const bp = BP_MAIN_TABLE.ebitda[i];
                            const sim = liveData.ebitda[i];
                            const absBp = Math.abs(bp);
                            const diff = absBp > 0 ? ((sim - bp) / absBp * 100).toFixed(1) : (sim === bp ? '0.0' : '—');
                            const isConflict = absBp > 0 ? Math.abs(sim - bp) / absBp > 0.05 : Math.abs(sim - bp) > 50;
                            return (
                              <tr key={label} className={`border-t border-slate-700/50 ${isConflict ? 'bg-amber-500/5' : ''}`}>
                                <td className="px-2 py-1 text-slate-300 font-mono">{label}</td>
                                <td className="px-2 py-1 text-right text-slate-400 font-mono">{bp.toLocaleString()}</td>
                                <td className={`px-2 py-1 text-right font-mono ${isConflict ? 'text-amber-400' : 'text-slate-300'}`}>
                                  {sim.toLocaleString()}
                                </td>
                                <td className={`px-2 py-1 text-right font-mono text-[11px] ${isConflict ? 'text-amber-400' : 'text-slate-500'}`}>
                                  {diff}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Beds comparison */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">累计床位对比</div>
                    <div className="rounded-lg border border-slate-700 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-800/80">
                            <th className="text-left px-2 py-1.5 text-slate-400 font-medium">年份</th>
                            <th className="text-right px-2 py-1.5 text-slate-400 font-medium">BP值</th>
                            <th className="text-right px-2 py-1.5 text-slate-400 font-medium">模拟器</th>
                          </tr>
                        </thead>
                        <tbody>
                          {YEAR_LABELS.map((label, i) => {
                            const bp = BP_SOM.cumulative_beds[i];
                            const sim = liveData.cumBeds[i];
                            const isConflict = bp > 0 && Math.abs(sim - bp) / bp > 0.05;
                            return (
                              <tr key={label} className={`border-t border-slate-700/50 ${isConflict ? 'bg-amber-500/5' : ''}`}>
                                <td className="px-2 py-1 text-slate-300 font-mono">{label}</td>
                                <td className="px-2 py-1 text-right text-slate-400 font-mono">{bp.toLocaleString()}</td>
                                <td className={`px-2 py-1 text-right font-mono ${isConflict ? 'text-amber-400' : 'text-slate-300'}`}>
                                  {sim.toLocaleString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Key anchors from roadshow */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">路演稿数据锚点</div>
                    <div className="text-[11px] text-slate-500 mb-1">路演稿中硬编码的数据点 vs BP v2.1</div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between p-2 rounded bg-amber-500/5 border border-amber-500/20">
                        <span className="text-[11px] text-slate-300">s17 Y5收入</span>
                        <span className="text-[11px] text-amber-400 font-mono">路演:¥1,665万 ≠ BP:¥2,049万</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-amber-500/5 border border-amber-500/20">
                        <span className="text-[11px] text-slate-300">s17 Y3收入</span>
                        <span className="text-[11px] text-amber-400 font-mono">路演:¥1,259万 ≠ BP:¥1,212万</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-amber-500/5 border border-amber-500/20">
                        <span className="text-[11px] text-slate-300">s17 Y4收入</span>
                        <span className="text-[11px] text-amber-400 font-mono">路演:¥1,398万 ≠ BP:¥1,576万</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-green-500/5 border border-green-500/20">
                        <span className="text-[11px] text-slate-300">s17 Y2收入</span>
                        <span className="text-[11px] text-green-400 font-mono">路演:¥932万 = BP:¥932万 ✓</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-green-500/5 border border-green-500/20">
                        <span className="text-[11px] text-slate-300">s16 SOM床位曲线</span>
                        <span className="text-[11px] text-green-400 font-mono">0→110→290→520→780 ✓</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-600 mt-1">
                      注: 路演稿s17中的Y3/Y4/Y5收入数据基于旧模型，与BP v2.1有偏差。建议更新路演稿或确认口径。
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'som' && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">SOM 10年增长曲线</div>
                  <div className="text-[11px] text-slate-400 mb-2">
                    BP v2.1: 二类获批后30%年增长 · SAM中值¥27.5B
                  </div>

                  {/* SVG SOM Chart */}
                  <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-3">
                    <svg viewBox="0 0 400 200" className="w-full">
                      {/* Grid */}
                      <line x1="40" y1="170" x2="380" y2="170" stroke="rgba(130,188,255,0.2)" strokeWidth="1"/>
                      <line x1="40" y1="130" x2="380" y2="130" stroke="rgba(130,188,255,0.08)" strokeWidth="0.5"/>
                      <line x1="40" y1="90" x2="380" y2="90" stroke="rgba(130,188,255,0.08)" strokeWidth="0.5"/>
                      <line x1="40" y1="50" x2="380" y2="50" stroke="rgba(130,188,255,0.08)" strokeWidth="0.5"/>

                      {/* Y-axis labels */}
                      <text x="2" y="174" fill="rgba(157,176,201,0.6)" fontSize="8" fontFamily="monospace">0</text>
                      <text x="2" y="134" fill="rgba(157,176,201,0.6)" fontSize="8" fontFamily="monospace">2500</text>
                      <text x="2" y="94" fill="rgba(157,176,201,0.6)" fontSize="8" fontFamily="monospace">5000</text>
                      <text x="2" y="54" fill="rgba(157,176,201,0.6)" fontSize="8" fontFamily="monospace">7500</text>

                      {/* BP revenue line */}
                      {(() => {
                        const bpRev = BP_MAIN_TABLE.total_revenue;
                        const maxVal = 8000;
                        const points = bpRev.map((v, i) => {
                          const x = 50 + i * 36;
                          const y = 170 - (v / maxVal) * 130;
                          return `${x},${y}`;
                        }).join(' ');
                        return <polyline points={points} fill="none" stroke="rgba(255,191,102,0.8)" strokeWidth="2" strokeDasharray="4 3"/>;
                      })()}

                      {/* Simulator revenue line */}
                      {(() => {
                        const maxVal = 8000;
                        const points = liveData.revenue.map((v, i) => {
                          const x = 50 + i * 36;
                          const y = 170 - (v / maxVal) * 130;
                          return `${x},${y}`;
                        }).join(' ');
                        return <polyline points={points} fill="none" stroke="rgba(85,213,255,0.9)" strokeWidth="2"/>;
                      })()}

                      {/* Dots */}
                      {BP_MAIN_TABLE.total_revenue.map((v, i) => {
                        const maxVal = 8000;
                        const x = 50 + i * 36;
                        const y = 170 - (v / maxVal) * 130;
                        return <circle key={`bp-${i}`} cx={x} cy={y} r="3" fill="rgba(255,191,102,0.8)" stroke="rgba(4,8,18,0.8)" strokeWidth="1.5"/>;
                      })}
                      {liveData.revenue.map((v, i) => {
                        const maxVal = 8000;
                        const x = 50 + i * 36;
                        const y = 170 - (v / maxVal) * 130;
                        return <circle key={`sim-${i}`} cx={x} cy={y} r="3" fill="rgba(85,213,255,0.9)" stroke="rgba(4,8,18,0.8)" strokeWidth="1.5"/>;
                      })}

                      {/* X-axis labels */}
                      {YEAR_LABELS.map((label, i) => (
                        <text key={label} x={50 + i * 36} y="185" fill="rgba(157,176,201,0.6)" fontSize="7" fontFamily="monospace" textAnchor="middle">{label}</text>
                      ))}

                      {/* Legend */}
                      <line x1="50" y1="15" x2="70" y2="15" stroke="rgba(85,213,255,0.9)" strokeWidth="2"/>
                      <text x="74" y="18" fill="rgba(157,176,201,0.8)" fontSize="7">模拟器</text>
                      <line x1="120" y1="15" x2="140" y2="15" stroke="rgba(255,191,102,0.8)" strokeWidth="2" strokeDasharray="4 3"/>
                      <text x="144" y="18" fill="rgba(157,176,201,0.8)" fontSize="7">BP v2.1</text>
                    </svg>
                  </div>

                  {/* SOM detailed table */}
                  <div className="rounded-lg border border-slate-700 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-800/80">
                          <th className="text-left px-2 py-1.5 text-slate-400 font-medium">年份</th>
                          <th className="text-right px-2 py-1.5 text-slate-400 font-medium">收入(万)</th>
                          <th className="text-right px-2 py-1.5 text-slate-400 font-medium">同比</th>
                          <th className="text-right px-2 py-1.5 text-slate-400 font-medium">SOM穿透</th>
                          <th className="text-right px-2 py-1.5 text-slate-400 font-medium">活跃床位</th>
                        </tr>
                      </thead>
                      <tbody>
                        {YEAR_LABELS.map((label, i) => (
                          <tr key={label} className="border-t border-slate-700/50">
                            <td className="px-2 py-1 text-slate-300 font-mono">{label}</td>
                            <td className="px-2 py-1 text-right text-slate-300 font-mono">{BP_MAIN_TABLE.total_revenue[i].toLocaleString()}</td>
                            <td className="px-2 py-1 text-right text-slate-400 font-mono">{i <= 1 ? '—' : '30%'}</td>
                            <td className="px-2 py-1 text-right text-slate-400 font-mono">{BP_SOM.som_penetration[i] > 0 ? (BP_SOM.som_penetration[i] * 100).toFixed(2) + '%' : '—'}</td>
                            <td className="px-2 py-1 text-right text-cyan-400 font-mono">{BP_SOM.active_paying[i].toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ARR explanation */}
                  <div className="p-3 rounded-lg border border-slate-700 bg-slate-800/30">
                    <div className="text-xs font-bold text-slate-300 mb-2">ARR计算公式</div>
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>ARR = 活跃付费床位 × ¥0.7万/床/年</div>
                      <div>活跃付费床位 = 累计商业床位 × 续约率(70%)</div>
                      <div className="text-cyan-400 mt-2">Y10目标: 2,100床 × ¥0.7万 = ¥1,470万 ARR</div>
                    </div>
                  </div>

                  {/* SOM penetration */}
                  <div className="p-3 rounded-lg border border-slate-700 bg-slate-800/30">
                    <div className="text-xs font-bold text-slate-300 mb-2">SOM穿透率</div>
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>穿透率 = 总收入(万) / SAM中值(¥27.5B) × 100%</div>
                      <div>Y5: 0.75% | Y10: 2.77%</div>
                      <div className="text-slate-500">市场远未饱和，仍有10倍扩张空间</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'scenarios' && (
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">情景算法说明</div>

                  {/* Scenario explanations */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
                      <div className="text-xs font-bold text-cyan-300 mb-1">◆ 中性 (Neutral)</div>
                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div><b className="text-slate-300">续约率:</b> 70% (BPccR2 [注A13] 基准)</div>
                        <div><b className="text-slate-300">增长率:</b> Y6-Y10 均30% (二类获批后统一增速)</div>
                        <div><b className="text-slate-300">EBITDA转正:</b> Y2 (百特授权金¥300万支撑)</div>
                        <div><b className="text-slate-300">算法:</b> 底层引擎从BOM逐级构建P&L (Y1-Y5)，Y6-Y10按增长率投射，OpEx增速为收入增速的50% (运营杠杆)</div>
                        <div><b className="text-slate-300">对标:</b> 推想/鹰瞳规模化期30-50%增速区间内</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                      <div className="text-xs font-bold text-green-300 mb-1">▲ 乐观 (Optimistic)</div>
                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div><b className="text-slate-300">续约率:</b> 85% (+15pp vs 基准)</div>
                        <div><b className="text-slate-300">影响:</b> SaaS续约收入大幅提升，Y10 EBITDA +18%</div>
                        <div><b className="text-slate-300">触发条件:</b> 产品黏性超预期，医院IT预算充裕</div>
                        <div><b className="text-slate-300">算法:</b> 同中性引擎，仅调整rr_base参数。续约率提升直接影响SaaS存量收入(cohort survival model)，不改变硬件部署计划</div>
                        <div><b className="text-slate-300">BP对标:</b> Y10床位3,450 / 收入¥8,979万 / EBITDA¥3,885万</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                      <div className="text-xs font-bold text-amber-300 mb-1">▼ 保守 (Conservative)</div>
                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div><b className="text-slate-300">续约率:</b> 55% (-15pp vs 基准)</div>
                        <div><b className="text-slate-300">影响:</b> SaaS续约收入下滑，Y10 EBITDA -18%</div>
                        <div><b className="text-slate-300">触发条件:</b> 中国医院SaaS付费意愿低于预期</div>
                        <div><b className="text-slate-300">算法:</b> 同中性引擎，rr_base=0.55。续约率下降对Year 3+影响显著(SaaS存量按55%衰减)，硬件收入不受影响</div>
                        <div><b className="text-slate-300">BP对标:</b> Y10床位2,550 / 收入¥6,239万 / EBITDA¥2,699万</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/5">
                      <div className="text-xs font-bold text-rose-300 mb-1">◇ 延迟 (Delayed)</div>
                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div><b className="text-slate-300">续约率:</b> 70% (与中性相同)</div>
                        <div><b className="text-slate-300">影响:</b> 里程碑节奏整体后移，不改变单床经济性</div>
                        <div><b className="text-slate-300">触发条件:</b> NMPA审批延迟、试点医院协调困难</div>
                        <div><b className="text-slate-300">算法:</b> 里程碑DAG中的C2/C3获批时点后移→自动触发deploymentGating重算→首年销售因子(firstYearFactor)随审批月份联动调整</div>
                        <div><b className="text-slate-300">关键机制:</b></div>
                        <div className="pl-3">
                          <div>• deriveFirstYearFactor(): C2审批月→Y2可售月数/12</div>
                          <div>• deriveDeploymentGating(): 逐年逐类(C2/C3)计算部署门控系数</div>
                          <div>• 即使延迟至M20, Y2 EBITDA仍可转正(百特授权金保障)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestone delay sensitivity */}
                  <div className="p-3 rounded-lg border border-slate-700 bg-slate-800/30">
                    <div className="text-xs font-bold text-slate-300 mb-2">里程碑延迟敏感性 (BP §6.2)</div>
                    <div className="rounded-lg border border-slate-700 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-800/80">
                            <th className="text-left px-2 py-1.5 text-slate-400">情景</th>
                            <th className="text-center px-2 py-1.5 text-slate-400">二类获批</th>
                            <th className="text-center px-2 py-1.5 text-slate-400">三类获批</th>
                            <th className="text-center px-2 py-1.5 text-slate-400">EBITDA转正</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-slate-700/50">
                            <td className="px-2 py-1 text-green-400">Best</td>
                            <td className="px-2 py-1 text-center text-slate-300 font-mono">M14</td>
                            <td className="px-2 py-1 text-center text-slate-300 font-mono">M28</td>
                            <td className="px-2 py-1 text-center text-green-400 font-mono">Y2</td>
                          </tr>
                          <tr className="border-t border-slate-700/50">
                            <td className="px-2 py-1 text-cyan-400">基准</td>
                            <td className="px-2 py-1 text-center text-slate-300 font-mono">M15</td>
                            <td className="px-2 py-1 text-center text-slate-300 font-mono">M29</td>
                            <td className="px-2 py-1 text-center text-cyan-400 font-mono">Y2</td>
                          </tr>
                          <tr className="border-t border-slate-700/50">
                            <td className="px-2 py-1 text-amber-400">保守</td>
                            <td className="px-2 py-1 text-center text-slate-300 font-mono">M17</td>
                            <td className="px-2 py-1 text-center text-slate-300 font-mono">M31</td>
                            <td className="px-2 py-1 text-center text-amber-400 font-mono">Y2*</td>
                          </tr>
                          <tr className="border-t border-slate-700/50">
                            <td className="px-2 py-1 text-rose-400">悲观</td>
                            <td className="px-2 py-1 text-center text-slate-300 font-mono">M20</td>
                            <td className="px-2 py-1 text-center text-slate-300 font-mono">M36</td>
                            <td className="px-2 py-1 text-center text-rose-400 font-mono">Y3</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">* 百特授权金¥300万支撑下Y2仍可转正，概率85%+</div>
                  </div>

                  {/* Growth benchmark */}
                  <div className="p-3 rounded-lg border border-slate-700 bg-slate-800/30">
                    <div className="text-xs font-bold text-slate-300 mb-2">增速对标 (BP §4.1)</div>
                    <div className="rounded-lg border border-slate-700 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-800/80">
                            <th className="text-left px-2 py-1.5 text-slate-400">阶段</th>
                            <th className="text-center px-2 py-1.5 text-slate-400">推想</th>
                            <th className="text-center px-2 py-1.5 text-slate-400">鹰瞳</th>
                            <th className="text-center px-2 py-1.5 text-cyan-400">ARIA</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-slate-700/50">
                            <td className="px-2 py-1 text-slate-300">上市前2年</td>
                            <td className="px-2 py-1 text-center text-slate-400 font-mono">10-40%</td>
                            <td className="px-2 py-1 text-center text-slate-400 font-mono">20-50%</td>
                            <td className="px-2 py-1 text-center text-cyan-400 font-mono font-bold">30%</td>
                          </tr>
                          <tr className="border-t border-slate-700/50">
                            <td className="px-2 py-1 text-slate-300">上市后2-5年</td>
                            <td className="px-2 py-1 text-center text-slate-400 font-mono">50-80%</td>
                            <td className="px-2 py-1 text-center text-slate-400 font-mono">60-80%</td>
                            <td className="px-2 py-1 text-center text-cyan-400 font-mono font-bold">30%</td>
                          </tr>
                          <tr className="border-t border-slate-700/50">
                            <td className="px-2 py-1 text-slate-300">规模化期</td>
                            <td className="px-2 py-1 text-center text-slate-400 font-mono">30-50%</td>
                            <td className="px-2 py-1 text-center text-slate-400 font-mono">25-40%</td>
                            <td className="px-2 py-1 text-center text-cyan-400 font-mono font-bold">30%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">ARIA采用统一30%增速，位于推想/鹰瞳规模化增速区间内</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
