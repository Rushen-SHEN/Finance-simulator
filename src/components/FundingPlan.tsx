import { CalcResult } from '@/lib/calculator';

function wan(n: number) {
  const v = n / 10000;
  return (v >= 0 ? '' : '−') + '¥' + Math.abs(v).toFixed(0) + '万';
}

interface Props { result: CalcResult; scenario: string; }

export default function FundingPlan({ result, scenario }: Props) {
  const y = result.years;
  // Cumulative loss Y1-Y3
  const cumLossY1Y3 = y.slice(0, 3).reduce((s, v) => s + v.net_profit, 0);
  // Five year cumulative net profit
  const cumTotal = result.cumulative_net_profit;
  // Find first year with EBITDA > 0
  const ebitdaPositiveYear = y.findIndex(v => v.ebitda > 0);
  const ebitdaLabel = ebitdaPositiveYear >= 0 ? `Year ${ebitdaPositiveYear + 1}` : '未转正';

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 my-5">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-[22px] font-bold text-gray-800">融资规划 — 三轮覆盖至EBITDA{ebitdaLabel === '未转正' ? ebitdaLabel : `${ebitdaLabel}转正`}</h2>
        <span className="text-[11px] bg-blue-50 text-blue-600 px-3 py-0.5 rounded-full font-medium">投资人关注</span>
      </div>
      <p className="text-[13px] text-gray-500 mb-6">累计¥3,200–4,800万 | 三轮后创始团队持股~56% | {ebitdaLabel}后现金流自给 · 当前: {scenario === 'neutral' ? '中性' : scenario === 'optimistic' ? '乐观' : scenario === 'conservative' ? '保守' : '延迟'}情景</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FundCard
          round="种子轮 · SEED" amount="¥400–600万" timing="📅 M1–M3 (2026年7–9月)"
          use="CDMO原型(40%) · 试点部署(25%) / 算法验证(20%) · 云/工具(15%)"
          valuation="隐含投后 ¥2,286–3,429万 · 稀释 15–20%"
          color="border-blue-600" amountColor="text-blue-600"
        />
        <FundCard
          round="PRE-A轮" amount="¥800–1,200万" timing="📅 M13–M15 (2027年7–9月)"
          use="注册审评(35%) · CMO备料(30%) / 质量体系(20%) · 运营(15%)"
          valuation="隐含投后 ¥4,571–6,857万 · 稀释 15–20%"
          color="border-purple-600" amountColor="text-purple-600"
        />
        <FundCard
          round="A轮 · SERIES A" amount="¥2,000–3,000万" timing="📅 M25–M30 (2028年7月–2029年1月)"
          use="三类审评(25%) · CMO扩产(20%) / 销售渠道(15%) · 运营储备(40%)"
          valuation="隐含投后 ¥1.14–1.71亿 · 稀释 15–20%"
          color="border-amber-500" amountColor="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
        <SummaryCard label="三轮累计融资" value="¥3,200–4,800万" color="text-blue-600" />
        <SummaryCard label="创始团队持股(三轮后)" value="~56%" color="text-orange-500" detail="(1−17.5%)³ ≈ 56.1%" />
        <SummaryCard label="Y1–3累计亏损" value={wan(cumLossY1Y3)} color={cumLossY1Y3 < 0 ? 'text-red-600' : 'text-green-600'} detail="由融资覆盖" />
        <SummaryCard label="五年累计净利润" value={wan(cumTotal)} color={cumTotal >= 0 ? 'text-green-600' : 'text-red-600'} detail={`EBITDA ${ebitdaLabel}${ebitdaLabel === '未转正' ? '' : '转正'}`} />
      </div>
    </section>
  );
}

function FundCard({ round, amount, timing, use, valuation, color, amountColor }: {
  round: string; amount: string; timing: string; use: string; valuation: string; color: string; amountColor: string;
}) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm border-t-4 ${color}`}>
      <div className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">{round}</div>
      <div className={`text-2xl font-extrabold my-2 ${amountColor}`}>{amount}</div>
      <div className="text-xs text-orange-500 font-medium">{timing}</div>
      <div className="text-xs text-gray-500 mt-2.5 leading-relaxed">
        {use.split(' / ').map((l, i) => <span key={i}>{l}<br /></span>)}
      </div>
      <div className="text-xs text-purple-600 mt-2">{valuation}</div>
    </div>
  );
}

function SummaryCard({ label, value, color, detail }: { label: string; value: string; color: string; detail?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-[22px] font-extrabold ${color}`}>{value}</div>
      {detail && <div className="text-[11px] text-gray-500 mt-1">{detail}</div>}
    </div>
  );
}
