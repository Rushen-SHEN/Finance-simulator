import { CalcResult, GlobalInputs } from '@/lib/calculator';

interface Props { resultBest: CalcResult; resultBase: CalcResult; global: GlobalInputs; }

export default function MarketSection({ resultBest, resultBase, global: g }: Props) {
  const y5best = resultBest.years[4];
  const y5base = resultBase.years[4];
  // Year 6-8 projection using per-year growth rates
  const y6revBest = y5best.total_revenue * (1 + g.growth_y6);
  const y7revBest = y6revBest * (1 + g.growth_y7);
  const y8revBest = y7revBest * (1 + g.growth_y8);
  const y6revBase = y5base.total_revenue * (1 + g.growth_y6);
  const y7revBase = y6revBase * (1 + g.growth_y7);
  const y8revBase = y7revBase * (1 + g.growth_y8);

  // Build SOM yearly arrays (Y1-Y8) for the growth dashboard
  const bestRev = [
    ...resultBest.years.map(y => y.total_revenue),
    y6revBest, y7revBest, y8revBest,
  ];
  const baseRev = [
    ...resultBase.years.map(y => y.total_revenue),
    y6revBase, y7revBase, y8revBase,
  ];
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
            <div className="text-xs text-gray-600">SOM · Year 8 (外推)</div>
            <div className="flex items-baseline gap-2 my-1">
              <span className="text-[20px] font-extrabold text-orange-600">🚀 {fmtWan(y8revBest)}</span>
              <span className="text-[13px] text-gray-400">/</span>
              <span className="text-[16px] font-bold text-blue-500">📊 {fmtWan(y8revBase)}</span>
            </div>
            <div className="text-xs text-gray-600 leading-relaxed">Y6 +{(g.growth_y6 * 100).toFixed(0)}% → Y7 +{(g.growth_y7 * 100).toFixed(0)}% → Y8 +{(g.growth_y8 * 100).toFixed(0)}% · 全国扩张</div>
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
                {['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8'].map(l => (
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
        <p className="text-[10px] text-gray-400 mt-1.5">Y6-Y8 标注 ⁺ 为外推值，基于参数面板设定增长率</p>
      </div>

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
