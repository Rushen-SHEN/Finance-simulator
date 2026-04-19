import { CalcResult } from '@/lib/calculator';

interface Props { resultBest: CalcResult; resultBase: CalcResult; }

export default function MarketSection({ resultBest, resultBase }: Props) {
  const y5best = resultBest.years[4];
  const y5base = resultBase.years[4];

  // Build SOM yearly arrays (Y1-Y10) from calculator results
  const bestRev = resultBest.years.map(y => y.total_revenue);
  const baseRev = resultBase.years.map(y => y.total_revenue);
  const yoyGrowth = (arr: number[]) =>
    arr.map((v, i) => (i === 0 || arr[i - 1] <= 0) ? null : ((v / arr[i - 1]) - 1) * 100);
  const bestGrowth = yoyGrowth(bestRev);
  const baseGrowth = yoyGrowth(baseRev);

  const fmtWan = (n: number) => { const v = n / 10000; return v >= 10000 ? `¥${(v / 10000).toFixed(1)}亿` : `¥${Math.round(v)}万`; };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 my-5">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-[22px] font-bold text-gray-800">市场机会 — 中国ICU谵妄监测</h2>
        <span className="text-[11px] bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 px-3 py-0.5 rounded-full font-medium border border-amber-200/50">⭐ 重点</span>
      </div>
      <p className="text-xs sm:text-[13px] text-gray-600 mb-6">TAM → SAM → SOM 漏斗 | 基于中国ICU广义床位口径15–25万张</p>

      <div className="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-7">
        {/* Funnel */}
        <div className="flex flex-col gap-3.5">
          <div className="rounded-xl px-5 py-4 border-l-4 border-blue-600 bg-gradient-to-r from-blue-50 to-white w-full">
            <div className="text-xs text-gray-600">TAM · 全口径ICU</div>
            <div className="text-[22px] font-extrabold text-blue-600 my-1">¥54–150亿/年</div>
            <div className="text-xs text-gray-600 leading-relaxed">15–25万张ICU床位 × 年化收入（硬件摊销+SaaS）</div>
          </div>
          <div className="rounded-xl px-5 py-4 border-l-4 border-purple-600 bg-gradient-to-r from-purple-50 to-white w-[85%]">
            <div className="text-xs text-gray-600">SAM · 三级医院ICU</div>
            <div className="text-[22px] font-extrabold text-purple-600 my-1">¥15–40亿/年</div>
            <div className="text-xs text-gray-600 leading-relaxed">修正: 支付能力60% × 数据基础70% × 临床成熟度50–80%</div>
          </div>
          <div className="rounded-xl px-5 py-4 border-l-4 border-green-600 bg-gradient-to-r from-green-50 to-white w-[58%]">
            <div className="text-xs text-gray-600">SOM · Year 5</div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-[20px] font-extrabold text-green-600">🚀 {fmtWan(y5best.total_revenue)}</span>
              <span className="text-[13px] text-gray-400">/</span>
              <span className="text-[16px] font-bold text-blue-500">📊 {fmtWan(y5base.total_revenue)}</span>
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">{y5best.cumulative_beds}床(Best) / {y5base.cumulative_beds}床(Base) · 三类获批+规模放量</div>
          </div>
          <div className="rounded-xl px-5 py-4 border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-white w-[42%]">
            <div className="text-xs text-gray-600">SOM · Year 10 (外推)</div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-[20px] font-extrabold text-orange-600">🚀 {fmtWan(resultBest.years[9]?.total_revenue ?? 0)}</span>
              <span className="text-[13px] text-gray-400">/</span>
              <span className="text-[16px] font-bold text-blue-500">📊 {fmtWan(resultBase.years[9]?.total_revenue ?? 0)}</span>
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">Y6–Y10 增长率复合外推 · 全国扩张+生态延伸</div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <KPICard icon="🏥" label="临床痛点" value="60–80%" color="text-blue-600" detail="ICU谵妄发生率 · 漏诊率~40% / 中国CAM-ICU规范评估率仅30% / 低活动型死亡率25–35%" />
          <KPICard icon="🌍" label="竞争格局" value="全球首创" color="text-green-600" detail="FDA/CE/NMPA已获批同类: 0 / 非接触床垫+多模态+谵妄 / DARMA/谷奇仅生命体征" />
          <KPICard icon="📋" label="法规路径" value="分步注册" color="text-purple-600" detail="M18 二类获批(辅助监测) / M36 三类获批(预警诊断) / 创新通道缩短30–50%" />
          <KPICard icon="🏛️" label="北京落地" value="6家候选" color="text-blue-600" detail="协和/301/北大人民等三甲 / 北京三级ICU ~2,000床 / 首台套补贴30%" />
        </div>
      </div>

      {/* SOM Year-by-Year Growth Dashboard */}
      <div className="mt-8">
        <h3 className="text-[15px] font-bold text-gray-800 mb-3">SOM 逐年收入与增长率</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-2 py-2 text-gray-500 font-medium border-b border-gray-200 w-28"></th>
                {['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10'].map(l => (
                  <th key={l} className={`text-center px-2 py-2 font-medium border-b border-gray-200 ${parseInt(l.slice(1)) > 5 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {l}{parseInt(l.slice(1)) > 5 ? ' ⁺' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-2 py-2 text-gray-600 font-medium border-b border-gray-100">🚀 Best 收入</td>
                {bestRev.map((v, i) => (
                  <td key={i} className={`text-center px-2 py-2 font-bold border-b border-gray-100 ${i >= 5 ? 'text-orange-600 bg-orange-50/50' : 'text-green-600'}`}>{fmtWan(v)}</td>
                ))}
              </tr>
              <tr>
                <td className="px-2 py-2 text-gray-600 font-medium border-b border-gray-100">🚀 YoY 增长</td>
                {bestGrowth.map((v, i) => (
                  <td key={i} className={`text-center px-2 py-2 border-b border-gray-100 ${i >= 5 ? 'bg-orange-50/50' : ''} ${v !== null && v > 0 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                    {v !== null ? `${v > 0 ? '+' : ''}${v.toFixed(0)}%` : '—'}
                  </td>
                ))}
              </tr>
              <tr className="bg-blue-50/30">
                <td className="px-2 py-2 text-gray-600 font-medium border-b border-gray-100">📊 Base 收入</td>
                {baseRev.map((v, i) => (
                  <td key={i} className={`text-center px-2 py-2 font-bold border-b border-gray-100 ${i >= 5 ? 'text-orange-500 bg-orange-50/30' : 'text-blue-600'}`}>{fmtWan(v)}</td>
                ))}
              </tr>
              <tr className="bg-blue-50/30">
                <td className="px-2 py-2 text-gray-600 font-medium border-b border-gray-100">📊 YoY 增长</td>
                {baseGrowth.map((v, i) => (
                  <td key={i} className={`text-center px-2 py-2 border-b border-gray-100 ${i >= 5 ? 'bg-orange-50/30' : ''} ${v !== null && v > 0 ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                    {v !== null ? `${v > 0 ? '+' : ''}${v.toFixed(0)}%` : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">Y6-Y10 标注 ⁺ 为增长率外推值，基于参数面板设定增长率</p>
      </div>

      {/* SOM Revenue Curve Chart */}
      <SOMChart bestRev={bestRev} baseRev={baseRev} />

      {/* Benchmark: China AI Medical Device Companies */}
      <div className="mt-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200 p-4">
        <h3 className="text-[13px] font-bold text-gray-700 mb-2.5">📌 对标中国AI医疗器械公司</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left px-2 py-1.5 text-gray-500 font-medium">公司</th>
                <th className="text-left px-2 py-1.5 text-gray-500 font-medium">产品</th>
                <th className="text-left px-2 py-1.5 text-gray-500 font-medium">获批后增长率</th>
                <th className="text-left px-2 py-1.5 text-gray-500 font-medium">ARIA可比性</th>
              </tr>
            </thead>
            <tbody>
              <BenchmarkRow company="鹰瞳科技" product="AI眼底筛查" growth="获批后3年CAGR ~70-90%" comparability="SaaS模型类似" highlight="green" />
              <BenchmarkRow company="推想医疗" product="AI肺部CT" growth="获批后2年收入 0→¥1.08亿" comparability="AI+影像硬件" highlight="blue" />
              <BenchmarkRow company="联影医疗" product="高端影像设备" growth="早期CAGR ~30-40%" comparability="硬件+SaaS混合" highlight="purple" />
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
          ARIA定位: 非接触多模态AI + 硬件(C2/C3) + SaaS · 获批后增长预期介于鹰瞳(纯SaaS)和联影(重硬件)之间 · Y3-Y5 目标CAGR 50-80%
        </p>
      </div>
    </section>
  );
}

function KPICard({ icon, label, value, color, detail }: { icon: string; label: string; value: string; color: string; detail: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-[22px] mb-1.5">{icon}</div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`text-xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-gray-600 mt-1.5 leading-relaxed">
        {detail.split(' / ').map((line, i) => <span key={i}>{line}<br /></span>)}
      </div>
    </div>
  );
}

const highlightColors: Record<string, string> = { green: 'text-green-600', blue: 'text-blue-600', purple: 'text-purple-600' };

function BenchmarkRow({ company, product, growth, comparability, highlight }: { company: string; product: string; growth: string; comparability: string; highlight: string }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-white/60 transition">
      <td className="px-2 py-2 font-bold text-gray-800">{company}</td>
      <td className="px-2 py-2 text-gray-600">{product}</td>
      <td className={`px-2 py-2 font-bold ${highlightColors[highlight] || 'text-gray-700'}`}>{growth}</td>
      <td className="px-2 py-2 text-gray-500">{comparability}</td>
    </tr>
  );
}

/* =============== SOM Revenue Curve Chart =============== */

function SOMChart({ bestRev, baseRev }: { bestRev: number[]; baseRev: number[] }) {
  // Convert to 百万 (millions)
  const bestM = bestRev.map(v => v / 1_000_000);
  const baseM = baseRev.map(v => v / 1_000_000);
  const allVals = [...bestM, ...baseM];
  const maxVal = Math.max(...allVals, 1);

  // Chart layout constants
  const W = 680, H = 300;
  const pad = { top: 20, right: 30, bottom: 40, left: 60 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  // Scales
  const xStep = plotW / 9; // 10 points, 9 intervals
  const x = (i: number) => pad.left + i * xStep;

  // Round up max to a nice tick
  const niceMax = Math.ceil(maxVal / 5) * 5 || 5;
  const y = (v: number) => pad.top + plotH - (v / niceMax) * plotH;

  // Y-axis ticks
  const tickCount = 5;
  const yTicks = Array.from({ length: tickCount + 1 }, (_, i) => (niceMax / tickCount) * i);

  // Build polyline points
  const pts = (arr: number[]) => arr.map((v, i) => `${x(i)},${y(v)}`).join(' ');

  // TAM/SAM reference bands (in 百万)
  const tamLow = 5400, tamHigh = 15000; // ¥54-150亿 = 5400-15000百万
  const samLow = 1500, samHigh = 4000;  // ¥15-40亿 = 1500-4000百万
  // Only show SAM if it fits in chart, otherwise show a marker at top
  const samInChart = samLow < niceMax;

  return (
    <div className="mt-8">
      <h3 className="text-[15px] font-bold text-gray-800 mb-3">SOM 收入曲线 — Best Case vs Base Case</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[720px]" style={{ minWidth: 480 }}>
          {/* Grid lines */}
          {yTicks.map(t => (
            <g key={t}>
              <line x1={pad.left} y1={y(t)} x2={W - pad.right} y2={y(t)} stroke="#e5e7eb" strokeWidth={0.7} />
              <text x={pad.left - 6} y={y(t) + 3.5} textAnchor="end" fontSize={10} fill="#9ca3af">
                {t >= 100 ? `${(t / 100).toFixed(0)}亿` : `${t.toFixed(0)}`}
              </text>
            </g>
          ))}

          {/* SAM band (if visible) */}
          {samInChart && (
            <g>
              <rect x={pad.left} y={y(Math.min(samHigh, niceMax))} width={plotW}
                height={Math.max(y(samLow) - y(Math.min(samHigh, niceMax)), 0)}
                fill="#a78bfa" opacity={0.07} />
              <line x1={pad.left} y1={y(Math.min(samLow, niceMax))} x2={W - pad.right} y2={y(Math.min(samLow, niceMax))}
                stroke="#a78bfa" strokeWidth={0.8} strokeDasharray="4,3" />
              <text x={W - pad.right - 2} y={y(Math.min(samLow, niceMax)) - 4} textAnchor="end" fontSize={9} fill="#7c3aed">
                SAM 下限 ¥15亿
              </text>
            </g>
          )}

          {/* Best Case line */}
          <polyline points={pts(bestM)} fill="none" stroke="#16a34a" strokeWidth={2.2} strokeLinejoin="round" />
          {bestM.map((v, i) => (
            <circle key={`b${i}`} cx={x(i)} cy={y(v)} r={3} fill="#16a34a" stroke="white" strokeWidth={1.2} />
          ))}

          {/* Base Case line */}
          <polyline points={pts(baseM)} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinejoin="round" strokeDasharray="6,3" />
          {baseM.map((v, i) => (
            <circle key={`a${i}`} cx={x(i)} cy={y(v)} r={2.5} fill="#2563eb" stroke="white" strokeWidth={1} />
          ))}

          {/* Value labels at Y5 and Y10 for Best */}
          {[4, 9].map(i => (
            <text key={`lb${i}`} x={x(i)} y={y(bestM[i]) - 10} textAnchor="middle" fontSize={10} fontWeight={700} fill="#16a34a">
              ¥{bestM[i] >= 100 ? `${(bestM[i] / 100).toFixed(2)}亿` : `${bestM[i].toFixed(1)}百万`}
            </text>
          ))}
          {/* Value labels at Y5 and Y10 for Base */}
          {[4, 9].map(i => (
            <text key={`la${i}`} x={x(i)} y={y(baseM[i]) + 16} textAnchor="middle" fontSize={10} fontWeight={600} fill="#2563eb">
              ¥{baseM[i] >= 100 ? `${(baseM[i] / 100).toFixed(2)}亿` : `${baseM[i].toFixed(1)}百万`}
            </text>
          ))}

          {/* X-axis labels */}
          {['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10'].map((l, i) => (
            <text key={l} x={x(i)} y={H - pad.bottom + 18} textAnchor="middle" fontSize={10}
              fill={i >= 5 ? '#ea580c' : '#6b7280'} fontWeight={i === 4 || i === 9 ? 700 : 400}>
              {l}
            </text>
          ))}

          {/* Projection zone marker */}
          <rect x={x(5) - xStep / 2} y={pad.top} width={plotW - 4.5 * xStep} height={plotH} fill="#f97316" opacity={0.04} rx={4} />
          <text x={x(7)} y={pad.top + 12} textAnchor="middle" fontSize={9} fill="#ea580c" opacity={0.6}>Y6-Y10 外推区间</text>

          {/* Legend */}
          <g transform={`translate(${pad.left + 8}, ${pad.top + 6})`}>
            <line x1={0} y1={0} x2={18} y2={0} stroke="#16a34a" strokeWidth={2.2} />
            <circle cx={9} cy={0} r={2.5} fill="#16a34a" />
            <text x={22} y={3.5} fontSize={10} fill="#16a34a" fontWeight={600}>Best Case SOM</text>

            <line x1={0} y1={16} x2={18} y2={16} stroke="#2563eb" strokeWidth={2} strokeDasharray="6,3" />
            <circle cx={9} cy={16} r={2} fill="#2563eb" />
            <text x={22} y={19.5} fontSize={10} fill="#2563eb" fontWeight={600}>Base Case SOM</text>

            <line x1={0} y1={32} x2={18} y2={32} stroke="#a78bfa" strokeWidth={0.8} strokeDasharray="4,3" />
            <text x={22} y={35.5} fontSize={10} fill="#7c3aed">SAM 可及市场</text>
          </g>

          {/* Axis labels */}
          <text x={4} y={pad.top + plotH / 2} textAnchor="middle" fontSize={10} fill="#9ca3af"
            transform={`rotate(-90, 4, ${pad.top + plotH / 2})`}>
            年收入 (百万元)
          </text>
        </svg>
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
        TAM ¥54–150亿/年（中国ICU广义床位15–25万张 × 年化收入） · SAM ¥15–40亿/年（三级医院口径 × 支付/数据/临床过滤） · SOM = 模型实际计算收入 · Y6-Y10为增长率外推
      </p>
    </div>
  );
}
