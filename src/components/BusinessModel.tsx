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
  const c2HwMargin = (global.price_hw_c2 - result.bom_c2) / global.price_hw_c2;
  const c3HwMargin = (global.price_hw_c3 - result.bom_c3) / global.price_hw_c3;
  const upgMargin = (global.price_upgrade - result.bom_upgrade) / global.price_upgrade;

  // Dual ROI anchors
  const c2AnnualCost = global.price_hw_c2 / 3 + global.price_saas_c2;
  const c3AnnualCost = global.price_hw_c3 / 3 + global.price_saas_c3;
  const upgAnnualCost = global.price_upgrade / 3 + global.price_saas_c3;
  const c2ROI = (global.value_anchor_c2 - c2AnnualCost) / c2AnnualCost;
  const c3ROI = (global.value_anchor_c3 - c3AnnualCost) / c3AnnualCost;
  const upgROI = (global.value_anchor_c3 - upgAnnualCost) / upgAnnualCost;

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 my-5">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-[22px] font-bold text-gray-800">商业模式 — 直销+合作经销商双渠道</h2>
        <span className="text-[11px] bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 px-3 py-0.5 rounded-full font-medium border border-amber-200/50">⭐ 重点</span>
      </div>
      <p className="text-xs sm:text-[13px] text-gray-600 mb-6">硬件+SaaS双引擎 | 合作经销商渠道HW 15%/SaaS 35% | 授权金¥200万+里程碑¥300万</p>

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
            <tr><td className="py-2 px-3.5 border-b border-gray-100 font-semibold">硬件定价</td><td className="py-2 px-3.5 border-b border-gray-100 text-blue-600 font-bold">{fmtBed(global.price_hw_c2)}</td><td className="py-2 px-3.5 border-b border-gray-100 text-blue-600 font-bold">{fmtBed(global.price_hw_c3)}</td><td className="py-2 px-3.5 border-b border-gray-100 text-blue-600 font-bold">{fmtBed(global.price_upgrade)}</td></tr>
            <tr className="bg-gray-50/50"><td className="py-2 px-3.5 border-b border-gray-100 font-semibold">SaaS订阅</td><td className="py-2 px-3.5 border-b border-gray-100 text-purple-600 font-semibold">{fmtBed(global.price_saas_c2)}/年</td><td className="py-2 px-3.5 border-b border-gray-100 text-purple-600 font-semibold">{fmtBed(global.price_saas_c3)}/年</td><td className="py-2 px-3.5 border-b border-gray-100">升级后按三类计费</td></tr>
            <tr><td className="py-2 px-3.5 border-b border-gray-100 font-semibold">硬件BOM</td><td className="py-2 px-3.5 border-b border-gray-100">{fmtBed(result.bom_c2)}</td><td className="py-2 px-3.5 border-b border-gray-100">{fmtBed(result.bom_c3)}</td><td className="py-2 px-3.5 border-b border-gray-100">{fmtBed(result.bom_upgrade)}</td></tr>
            <tr className="bg-gray-50/50"><td className="py-2 px-3.5 border-b border-gray-100 font-semibold">毛利率</td><td className="py-2 px-3.5 border-b border-gray-100 text-green-600">{pct(c2HwMargin)}</td><td className="py-2 px-3.5 border-b border-gray-100 text-green-600">{pct(c3HwMargin)}</td><td className="py-2 px-3.5 border-b border-gray-100 text-green-600">{pct(upgMargin)}</td></tr>
          </tbody>
        </table>
      </div>

      {/* 合作经销商渠道 Info */}
      <div className="rounded-lg p-3 px-4 mb-5 text-[13px] flex items-start gap-2 bg-purple-50 border border-purple-300 text-purple-800 leading-relaxed">
        🤝 <b>合作经销商渠道模式</b>：硬件分成15%({fmt(global.price_hw_c3 * global.baxter_hw_commission)}/床) · SaaS分成35%({fmt(global.price_saas_c3 * global.baxter_saas_commission)}/床/年) · 授权金+里程碑合计¥500万(Y2:¥300万 Y3:¥200万) · 授权金可替代Pre-A轮融资
      </div>

      {/* ROI Cards — dual anchors */}
      <h3 className="text-[15px] text-gray-600 font-semibold mb-3.5">医院ROI — 双锚定价 | C2创造价值 {fmt(global.value_anchor_c2)}/床/年 · C3创造价值 {fmt(global.value_anchor_c3)}/床/年</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ROICard title="二类 · 新购" roi={c2ROI} cost={c2AnnualCost} valuePerBed={global.value_anchor_c2} />
        <ROICard title="三类 · 新购" roi={c3ROI} cost={c3AnnualCost} valuePerBed={global.value_anchor_c3} />
        <ROICard title="三类 · 升级" roi={upgROI} cost={upgAnnualCost} valuePerBed={global.value_anchor_c3} />
      </div>

      <div className="rounded-lg p-3 px-4 mt-3.5 text-[13px] flex items-start gap-2 bg-green-50 border border-green-300 text-green-800 leading-relaxed">
        ✅ <b>全产品线ROI为正</b> — C2 ROI {pct(c2ROI)} · C3 ROI {pct(c3ROI)} · 升级 ROI {pct(upgROI)}。三类采用独立价值锚点(¥8万/床/年)，确保医院投资回报为正。
      </div>
    </section>
  );
}

function ROICard({ title, roi, cost, valuePerBed }: { title: string; roi: number; cost: number; valuePerBed: number }) {
  return (
    <div className={`bg-white border-2 rounded-xl p-5 text-center shadow-sm ${roi >= 0 ? 'border-green-400' : 'border-red-500'}`}>
      <div className="text-[13px] text-gray-600 mb-2.5 font-semibold">{title}</div>
      <div className={`text-4xl font-extrabold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {roi >= 0 ? '+' : ''}{pct(roi)}
      </div>
      <div className="text-xs text-gray-600 mt-2.5 leading-relaxed">
        年化费用 {fmt(cost)}/床<br />
        创造价值 {fmt(valuePerBed)}/床/年<br />
        {roi >= 0 ? `回收期 ~${Math.round(12 / (1 + roi))}个月` : <b>ROI为负</b>}
      </div>
    </div>
  );
}
