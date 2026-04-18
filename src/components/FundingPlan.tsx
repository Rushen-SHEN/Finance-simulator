import { CalcResult, FundingInputs } from '@/lib/calculator';

function wan(n: number) {
  const v = n / 10000;
  return (v >= 0 ? '' : '−') + '¥' + Math.abs(v).toFixed(0) + '万';
}

interface Props { result: CalcResult; scenario: string; funding: FundingInputs; }

export default function FundingPlan({ result, scenario, funding }: Props) {
  const y = result.years;
  const cumLossY1 = y[0]?.net_profit || 0;
  const cumTotal = result.cumulative_net_profit;
  const ebitdaPositiveYear = y.findIndex(v => v.ebitda > 0);
  const ebitdaLabel = ebitdaPositiveYear >= 0 ? `Year ${ebitdaPositiveYear + 1}` : '未转正';
  const scenarioLabel = scenario === 'neutral' ? '中性' : scenario === 'optimistic' ? '乐观' : scenario === 'conservative' ? '保守' : '延迟';

  const f = funding;
  const totalMin = (f.seed_min + f.preA_min + f.seriesA_min) / 10000;
  const totalMax = (f.seed_max + f.preA_max + f.seriesA_max) / 10000;
  const founderPct = ((1 - f.seed_dilution) * (1 - f.preA_dilution) * (1 - f.seriesA_dilution) * 100).toFixed(0);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 my-5">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-[22px] font-bold text-gray-800">融资规划 — ¥{totalMin.toFixed(0)}–{totalMax.toFixed(0)}万轻量融资</h2>
        <span className="text-[11px] bg-red-50 text-red-600 px-3 py-0.5 rounded-full font-medium">🔥 红杉关注</span>
      </div>
      <p className="text-[13px] text-gray-500 mb-6">2–3轮 · Baxter授权金可替代Pre-A · {ebitdaLabel}后现金流自给 · 当前: {scenarioLabel}情景</p>

      <div className="rounded-lg p-3 px-4 mb-5 text-[13px] flex items-start gap-2 bg-green-50 border border-green-300 text-green-800 leading-relaxed">
        💡 <b>关键优势</b>：Baxter授权金+里程碑=¥500万，可部分或完全替代Pre-A轮融资，大幅降低稀释。EBITDA {ebitdaLabel}转正后无需A轮。
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FundCard
          round="种子轮 · SEED"
          amount={`¥${(f.seed_min / 10000).toFixed(0)}–${(f.seed_max / 10000).toFixed(0)}万`}
          timing="📅 M1–M3 (2026年7–9月)"
          use="CDMO原型(40%) · 试点部署(25%) / 算法验证(20%) · 云/工具(15%)"
          valuation={`稀释 ${(f.seed_dilution * 100).toFixed(0)}%`}
          color="border-blue-600" amountColor="text-blue-600"
        />
        <FundCard
          round="PRE-A轮 (或Baxter替代)"
          amount={`¥${(f.preA_min / 10000).toFixed(0)}–${(f.preA_max / 10000).toFixed(0)}万`}
          timing="📅 M13–M15 (2027年7–9月)"
          use="注册审评(35%) · CMO备料(30%) / 质量体系(20%) · 运营(15%)"
          valuation={`Baxter授权金可覆盖50–75% · 稀释 ${(f.preA_dilution * 100).toFixed(0)}%`}
          color="border-purple-600" amountColor="text-purple-600"
        />
        <FundCard
          round="A轮(可选)"
          amount={`¥${(f.seriesA_min / 10000).toFixed(0)}–${(f.seriesA_max / 10000).toFixed(0)}万`}
          timing="📅 M25–M30 (如需)"
          use="三类审评(25%) · 扩产(20%) / 仅在EBITDA未转正时启动 / 否则不需要"
          valuation={`EBITDA Y2已转正时无需 · 稀释 ${(f.seriesA_dilution * 100).toFixed(0)}%`}
          color="border-gray-400" amountColor="text-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
        <SummaryCard label="总融资(最轻量)" value={`¥${totalMin.toFixed(0)}–${totalMax.toFixed(0)}万`} color="text-blue-600" />
        <SummaryCard label="创始团队持股" value={`~${founderPct}%`} color="text-green-600" detail="Baxter替代Pre-A时最优" />
        <SummaryCard label="Y1亏损覆盖" value={wan(cumLossY1)} color={cumLossY1 < 0 ? 'text-red-600' : 'text-green-600'} detail="种子轮覆盖" />
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
