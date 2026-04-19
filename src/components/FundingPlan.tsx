import { CalcResult, FundingInputs, GlobalInputs } from '@/lib/calculator';

function wan(n: number) {
  const v = n / 10000;
  return (v >= 0 ? '' : '−') + '¥' + Math.abs(v).toFixed(0) + '万';
}

interface Props { result: CalcResult; scenario: string; funding: FundingInputs; global: GlobalInputs; }

export default function FundingPlan({ result, scenario, funding, global: g }: Props) {
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

  // Funding advisory calculations
  const seedMax = f.seed_max / 10000;
  const seedMin = f.seed_min / 10000;
  const y1Loss = -(y[0]?.net_profit || 0) / 10000;
  const seedBuffer = seedMax - y1Loss;
  const licenseAmount = (g.license_amount || 0) / 10000;
  const milestoneAmount = (g.milestone_payment || 0) / 10000;
  const cashAfterSeedAndY2 = f.seed_max + (y[0]?.net_profit || 0) + (y[1]?.net_profit || 0);
  const needPreA = cashAfterSeedAndY2 < 0;
  const cashAfterPreA = cashAfterSeedAndY2 + f.preA_max + (y[2]?.net_profit || 0);
  const needSeriesA = cashAfterPreA < 0;
  let cumNP = 0;
  const cumByYear = y.slice(0, 5).map(yr => { cumNP += yr.net_profit; return cumNP; });
  const cumBreakEvenYear = cumByYear.findIndex(c => c >= 0);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 my-5">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-[22px] font-bold text-gray-800">融资规划 — ¥{totalMin.toFixed(0)}–{totalMax.toFixed(0)}万轻量融资</h2>
        <span className="text-[11px] bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 px-3 py-0.5 rounded-full font-medium border border-amber-200/50">⭐ 重点</span>
      </div>
      <p className="text-xs sm:text-[13px] text-gray-600 mb-6">2–3轮 · 合作经销商授权金可替代Pre-A · {ebitdaLabel}后现金流自给 · 当前: {scenarioLabel}情景</p>

      {/* ===== Smart Funding Advisory ===== */}
      <div className={`rounded-xl p-4 mb-5 text-[13px] leading-relaxed space-y-3 ${seedBuffer < 0 ? 'bg-red-50 border-2 border-red-300' : seedBuffer < 50 ? 'bg-amber-50 border border-amber-300' : 'bg-blue-50 border border-blue-200'}`}>
        <div className="font-bold text-gray-800 flex items-center gap-2">
          📊 融资需求智能分析
          <span className="text-[10px] font-normal text-gray-500">基于模型实时计算</span>
        </div>

        {/* Seed round */}
        <div className={`rounded-lg p-3 ${seedBuffer < 0 ? 'bg-red-100/50' : 'bg-white/80'}`}>
          <div className="font-semibold text-blue-700 mb-1">🏦 种子轮 SEED — Y1覆盖分析</div>
          <div className="text-gray-700">
            Y1亏损 <span className="font-bold text-red-600">¥{y1Loss.toFixed(0)}万</span> · 种子轮 ¥{seedMin.toFixed(0)}–{seedMax.toFixed(0)}万
            {seedBuffer >= 50 && <span className="text-green-600 font-medium"> · ✅ 余量充足 (¥{seedBuffer.toFixed(0)}万)</span>}
            {seedBuffer >= 0 && seedBuffer < 50 && <span className="text-amber-600 font-medium"> · ⚠️ 余量仅¥{seedBuffer.toFixed(0)}万</span>}
            {seedBuffer < 0 && <span className="text-red-600 font-bold"> · 🚨 缺口¥{Math.abs(seedBuffer).toFixed(0)}万！</span>}
          </div>
          <div className="text-gray-600 mt-1 text-[12px]">
            建议分两期到账：<span className="text-blue-600">第1期 M1 ¥{Math.round(seedMin * 0.6)}万</span> (CDMO+原型) ·
            <span className="text-blue-600"> 第2期 M6 ¥{Math.round(seedMax - seedMin * 0.6)}万</span> (试点+CRO)
          </div>
        </div>

        {/* Pre-A */}
        <div className="rounded-lg p-3 bg-white/80">
          <div className="font-semibold text-purple-700 mb-1">💜 Pre-A轮 — M13~M15到账</div>
          <div className="text-gray-700">
            Y2 EBITDA: <span className={y[1]?.ebitda >= 0 ? 'text-green-600 font-medium' : 'text-red-600'}>{y[1]?.ebitda >= 0 ? '+' : ''}{((y[1]?.ebitda || 0) / 10000).toFixed(0)}万</span>
            · 非稀释收入: 经销商授权金 ¥{licenseAmount.toFixed(0)}万 + 里程碑 ¥{milestoneAmount.toFixed(0)}万
          </div>
          {needPreA ? (
            <div className="text-amber-600 text-[12px] mt-1">⚠️ 种子轮后Y2末现金 ¥{(cashAfterSeedAndY2 / 10000).toFixed(0)}万 → 需Pre-A补充</div>
          ) : (
            <div className="text-green-600 text-[12px] mt-1">✅ 种子轮后Y2末现金 +¥{(cashAfterSeedAndY2 / 10000).toFixed(0)}万 → 经销商授权金可替代大部分Pre-A</div>
          )}
        </div>

        {/* Series A */}
        <div className={`rounded-lg p-3 ${needSeriesA ? 'bg-amber-100/50' : 'bg-green-50/80'}`}>
          <div className="font-semibold text-amber-700 mb-1">🟡 A轮评估</div>
          {ebitdaPositiveYear >= 0 && ebitdaPositiveYear <= 1 && !needSeriesA ? (
            <div className="text-green-700">✅ EBITDA Year {ebitdaPositiveYear + 1}转正{cumBreakEvenYear >= 0 ? `，累计Year ${cumBreakEvenYear + 1}回正` : ''} → <b>不需要A轮融资</b></div>
          ) : needSeriesA ? (
            <div className="text-amber-700">⚠️ 前期累计亏损尚未完全回补 → 建议保留A轮 ¥{(f.seriesA_min / 10000).toFixed(0)}–{(f.seriesA_max / 10000).toFixed(0)}万</div>
          ) : (
            <div className="text-green-700">✅ 现金流充裕，A轮可选。可将A轮最低设为¥0。</div>
          )}
        </div>
      </div>

      <div className="rounded-lg p-3 px-4 mb-5 text-[13px] flex items-start gap-2 bg-green-50 border border-green-300 text-green-800 leading-relaxed">
        💡 <b>关键优势</b>：合作经销商授权金+里程碑=¥{(licenseAmount + milestoneAmount).toFixed(0)}万，可部分或完全替代Pre-A轮融资，大幅降低稀释。EBITDA {ebitdaLabel}转正后无需A轮。
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
          round="PRE-A轮 (或经销商替代)"
          amount={`¥${(f.preA_min / 10000).toFixed(0)}–${(f.preA_max / 10000).toFixed(0)}万`}
          timing="📅 M13–M15 (2027年7–9月)"
          use="注册审评(35%) · CMO备料(30%) / 质量体系(20%) · 运营(15%)"
          valuation={`经销商授权金可覆盖50–75% · 稀释 ${(f.preA_dilution * 100).toFixed(0)}%`}
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
        <SummaryCard label="创始团队持股" value={`~${founderPct}%`} color="text-green-600" detail="经销商替代Pre-A时最优" />
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
      <div className="text-xs text-gray-600 uppercase tracking-wider font-semibold">{round}</div>
      <div className={`text-2xl font-extrabold my-2 ${amountColor}`}>{amount}</div>
      <div className="text-xs text-orange-500 font-medium">{timing}</div>
      <div className="text-xs text-gray-600 mt-2.5 leading-relaxed">
        {use.split(' / ').map((l, i) => <span key={i}>{l}<br /></span>)}
      </div>
      <div className="text-xs text-purple-600 mt-2">{valuation}</div>
    </div>
  );
}

function SummaryCard({ label, value, color, detail }: { label: string; value: string; color: string; detail?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`text-[22px] font-extrabold ${color}`}>{value}</div>
      {detail && <div className="text-xs text-gray-500 mt-1">{detail}</div>}
    </div>
  );
}
