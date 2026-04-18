'use client';
import { GlobalInputs, CalcResult } from '@/lib/calculator';

function fmt(n: number) {
  return '¥' + (n / 10000).toFixed(1) + '万';
}
function fmtBed(n: number) {
  return '¥' + (n / 10000).toFixed(1) + '万/床';
}
function pct(n: number) {
  return (n * 100).toFixed(1) + '%';
}

interface Props {
  global: GlobalInputs;
  result: CalcResult;
}

export default function BusinessModel({ global, result }: Props) {
  const c2HwMargin = (global.price_hw_c2 - result.effective_c2_bom) / global.price_hw_c2;
  const c3HwMargin = (global.price_hw_c3 - result.effective_c3_bom) / global.price_hw_c3;
  const upgMargin = (global.price_upgrade - result.effective_upgrade_cogs) / global.price_upgrade;

  const valuePerBed = 62500; // ¥6.25万/bed/year
  const c2AnnualCost = global.price_hw_c2 / 3 + global.price_saas_c2; // 3-year amort
  const c3AnnualCost = global.price_hw_c3 / 3 + global.price_saas_c3;
  const c2ROI = (valuePerBed - c2AnnualCost) / c2AnnualCost;
  const c3ROI = (valuePerBed - c3AnnualCost) / c3AnnualCost;
  const upgAnnualCost = global.price_upgrade / 3 + global.price_saas_c3;
  const upgROI = (valuePerBed - upgAnnualCost) / upgAnnualCost;

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 my-5">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-[22px] font-bold text-gray-800">商业模式 — 硬件+SaaS双引擎</h2>
        <span className="text-[11px] bg-blue-50 text-blue-600 px-3 py-0.5 rounded-full font-medium">投资人关注</span>
      </div>
      <p className="text-[13px] text-gray-500 mb-6">二类/三类双档定价 | 价值定价法 | 医院ROI透明化</p>

      {/* Pricing Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 mb-5">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200 w-[140px]">项目</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200">二类证 · 辅助监测版</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200">三类证 · 预警诊断版</th>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200">升级服务(二类→三类)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="py-2 px-3.5 border-b border-gray-100 font-semibold">硬件定价</td><td className="py-2 px-3.5 border-b border-gray-100 text-blue-600 font-bold">{fmtBed(global.price_hw_c2)}</td><td className="py-2 px-3.5 border-b border-gray-100 text-blue-600 font-bold">{fmtBed(global.price_hw_c3)}</td><td className="py-2 px-3.5 border-b border-gray-100">—</td></tr>
            <tr className="bg-gray-50/50"><td className="py-2 px-3.5 border-b border-gray-100 font-semibold">SaaS订阅</td><td className="py-2 px-3.5 border-b border-gray-100 text-purple-600 font-semibold">{fmtBed(global.price_saas_c2)}/年</td><td className="py-2 px-3.5 border-b border-gray-100 text-purple-600 font-semibold">{fmtBed(global.price_saas_c3)}/年</td><td className="py-2 px-3.5 border-b border-gray-100">升级后按三类计费</td></tr>
            <tr><td className="py-2 px-3.5 border-b border-gray-100 font-semibold">硬件BOM</td><td className="py-2 px-3.5 border-b border-gray-100">{fmtBed(result.effective_c2_bom)}</td><td className="py-2 px-3.5 border-b border-gray-100">{fmtBed(result.effective_c3_bom)}</td><td className="py-2 px-3.5 border-b border-gray-100">{fmtBed(result.effective_upgrade_cogs)}</td></tr>
            <tr className="bg-gray-50/50"><td className="py-2 px-3.5 border-b border-gray-100 font-semibold">毛利率</td><td className="py-2 px-3.5 border-b border-gray-100 text-green-600">{pct(c2HwMargin)}</td><td className="py-2 px-3.5 border-b border-gray-100 text-green-600">{pct(c3HwMargin)}</td><td className="py-2 px-3.5 border-b border-gray-100 text-green-600">{pct(upgMargin)}</td></tr>
          </tbody>
        </table>
      </div>

      {/* ROI Cards */}
      <h3 className="text-[15px] text-gray-500 font-semibold mb-3.5">医院投资回报率 (ROI) — 单床年化 | 创造价值 ¥6.25万/床/年</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ROICard title="二类 · 新购" roi={c2ROI} cost={c2AnnualCost} valuePerBed={valuePerBed} />
        <ROICard title="三类 · 新购 ⚠️" roi={c3ROI} cost={c3AnnualCost} valuePerBed={valuePerBed} danger />
        <ROICard title="三类 · 升级" roi={upgROI} cost={upgAnnualCost} valuePerBed={valuePerBed} />
      </div>

      {c3ROI < 0 && (
        <div className="rounded-lg p-3 px-4 mt-3.5 text-[13px] flex items-start gap-2 bg-orange-50 border border-orange-300 text-orange-800 leading-relaxed">
          ⚠️ <b>三类新购ROI为负</b> — 年化费用({fmt(c3AnnualCost)})超过创造价值({fmt(valuePerBed)})。三类产品主要获客路径应为存量二类客户升级，而非新购。
        </div>
      )}
    </section>
  );
}

function ROICard({ title, roi, cost, valuePerBed, danger }: { title: string; roi: number; cost: number; valuePerBed: number; danger?: boolean }) {
  return (
    <div className={`bg-white border-2 rounded-xl p-5 text-center shadow-sm ${danger ? 'border-red-500' : 'border-gray-200'}`}>
      <div className="text-[13px] text-gray-500 mb-2.5 font-semibold">{title}</div>
      <div className={`text-4xl font-extrabold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {roi >= 0 ? '+' : ''}{pct(roi)}
      </div>
      <div className="text-xs text-gray-500 mt-2.5 leading-relaxed">
        年化费用 {fmt(cost)}/床<br />
        费用占价值 {pct(cost / valuePerBed)}<br />
        {roi >= 0 ? `回收期 ~${Math.round(12 / (1 + roi))}个月` : <b>ROI为负</b>}
      </div>
    </div>
  );
}

function pctx(n: number) { return (n * 100).toFixed(1) + '%'; }
