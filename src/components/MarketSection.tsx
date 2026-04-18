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
