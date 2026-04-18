'use client';
import { useState } from 'react';
import { CalcResult } from '@/lib/calculator';
import { YEAR_LABELS, MONTH_LABELS, PHASE_LABELS, BP_TARGETS } from '@/lib/defaults';

function wan(n: number) {
  const v = n / 10000;
  if (v === 0) return '¥0';
  return (v >= 0 ? '¥' : '−¥') + Math.abs(v).toFixed(0) + '万';
}
function pct(n: number | null) {
  if (n === null) return '—';
  return (n * 100).toFixed(1) + '%';
}

const SCENARIO_NAMES: Record<string, string> = {
  neutral: '中性情景',
  optimistic: '乐观情景',
  conservative: '保守情景',
  delayed: '延迟情景',
};

interface Props { resultBest: CalcResult; resultBase: CalcResult; scenario: string; }

function CaseToggle({ activeCase, onChange }: { activeCase: 'best' | 'base'; onChange: (c: 'best' | 'base') => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-300">
      <button
        onClick={() => onChange('best')}
        className={`px-3 py-1 text-xs font-semibold transition-all ${activeCase === 'best' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
      >
        🚀 Best
      </button>
      <button
        onClick={() => onChange('base')}
        className={`px-3 py-1 text-xs font-semibold transition-all ${activeCase === 'base' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
      >
        📊 Base
      </button>
    </div>
  );
}

function TableHeader() {
  return (
    <thead>
      <tr>
        <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200 w-[180px]">项目</th>
        {YEAR_LABELS.map((l, i) => (
          <th key={i} className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200">
            {l}<br /><small className="font-normal text-gray-500">{MONTH_LABELS[i]}</small>
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default function FinancialTable({ resultBest, resultBase, scenario }: Props) {
  const [activeCase, setActiveCase] = useState<'best' | 'base'>('best');
  const result = activeCase === 'best' ? resultBest : resultBase;
  const y = result.years;

  const cumNetProfits: number[] = [];
  let acc = 0;
  y.forEach(yr => { acc += yr.net_profit; cumNetProfits.push(acc); });

  const scenarioLabel = SCENARIO_NAMES[scenario] || '中性情景';
  const caseLabel = activeCase === 'best' ? 'Best Case' : 'Base Case';

  return (
    <>
      {/* Module 1: 部署与收入 */}
      <section data-export-module className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 my-5">
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg sm:text-[22px] font-bold text-gray-800">部署与收入</h2>
            <span className="text-[11px] bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 px-3 py-0.5 rounded-full font-medium border border-amber-200/50">⭐ 重点</span>
          </div>
          <CaseToggle activeCase={activeCase} onChange={setActiveCase} />
        </div>
        <p className="text-xs sm:text-[13px] text-gray-600 mb-5">{caseLabel} · {scenarioLabel} · 直销+合作经销商渠道 · M1=2026年7月</p>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse text-[13px]">
            <TableHeader />
            <tbody>
              <SectionRow label="📋 部署 (直销+合作经销商)" />
              <Row label="阶段" values={PHASE_LABELS} bold />
              <Row label="直销 C2" values={y.map(v => v.direct_c2.toString())} />
              <Row label="直销 C3" values={y.map(v => v.direct_c3.toString())} />
              <Row label="经销商 C2" values={y.map(v => v.baxter_c2.toString())} />
              <Row label="经销商 C3" values={y.map(v => v.baxter_c3.toString())} highlight />
              <Row label="升级 C2→C3" values={y.map(v => v.actual_upgrade.toString())} />
              <Row label="累计床位" values={y.map(v => v.cumulative_beds.toString())} bold />
              <Row label="活跃付费" values={y.map(v => '~' + v.active_paying)} />

              <SectionRow label="💰 收入明细 (6条线)" />
              <Row label="硬件直销" values={y.map(v => wan(v.hw_direct))} highlight />
              <Row label="硬件经销商(15%)" values={y.map(v => wan(v.hw_baxter))} />
              <Row label="升级服务" values={y.map(v => wan(v.upgrade_revenue))} />
              <Row label="SaaS直销" values={y.map(v => wan(v.saas_direct))} purple />
              <Row label="SaaS 经销商(35%)" values={y.map(v => wan(v.saas_baxter))} purple />
              <Row label="授权金+里程碑" values={y.map(v => wan(v.baxter_license))} highlight />
              <TotalRow label="总收入" values={y.map(v => wan(v.total_revenue))} />
              <Row label="YoY增长" values={y.map((v, i) => i === 0 ? '—' : y[i-1].total_revenue === 0 ? '—' : ((v.total_revenue - y[i-1].total_revenue) / y[i-1].total_revenue * 100).toFixed(1) + '%')} green />
            </tbody>
          </table>
        </div>
      </section>

      {/* Module 2: 成本与毛利 */}
      <section data-export-module className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 my-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg sm:text-[22px] font-bold text-gray-800">成本与毛利 — {caseLabel}</h2>
          <CaseToggle activeCase={activeCase} onChange={setActiveCase} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse text-[13px]">
            <TableHeader />
            <tbody>
              <Row label="总收入" values={y.map(v => wan(v.total_revenue))} bold />
              <Row label="COGS" values={y.map(v => wan(v.cogs))} />
              <TotalRow label="毛利" values={y.map(v => wan(v.gross_profit))} positive />
              <Row label="毛利率" values={y.map(v => pct(v.gross_margin))} green />
              <Row label="BP目标收入" values={BP_TARGETS.total_revenue.map(v => v ? `¥${v}万` : '—')} faded />
            </tbody>
          </table>
        </div>
      </section>

      {/* Module 3: 盈利预测 */}
      <section data-export-module className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 my-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg sm:text-[22px] font-bold text-gray-800">盈利预测 — {caseLabel}</h2>
          <CaseToggle activeCase={activeCase} onChange={setActiveCase} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full border-collapse text-[13px]">
            <TableHeader />
            <tbody>
              <Row label="毛利" values={y.map(v => wan(v.gross_profit))} />
              <Row label="OpEx" values={y.map(v => wan(v.opex))} />
              <TotalRow label="EBITDA" values={y.map(v => wan(v.ebitda))} colorize />
              <Row label="BP目标EBITDA" values={BP_TARGETS.ebitda.map(v => `${v >= 0 ? '¥' : '−¥'}${Math.abs(v)}万`)} faded />
              <Row label="折旧摊销" values={y.map(v => wan(v.depreciation))} />
              <TotalRow label="净利润" values={y.map(v => wan(v.net_profit))} colorize />
              <Row label="累计净利润" values={cumNetProfits.map(v => wan(v))} colorize />
              <Row label="净利率" values={y.map(v => pct(v.net_margin))} />
              <Row label="OpEx/收入" values={y.map(v => pct(v.opex_ratio))} />
            </tbody>
          </table>
        </div>

        {(() => {
          const ebitdaIdx = y.findIndex(v => v.ebitda > 0);
          const netIdx = y.findIndex(v => v.net_profit > 0);
          return (
            <div className="mt-4 rounded-lg p-3 px-4 text-[12px] flex items-start gap-2 bg-green-50 border border-green-300 text-green-800 leading-relaxed">
              💡 <b>盈利节点</b>：
              EBITDA {ebitdaIdx >= 0 ? `Year ${ebitdaIdx + 1} 转正` : '五年内未转正'} ·
              净利润 {netIdx >= 0 ? `Year ${netIdx + 1} 转正` : '五年内未转正'} ·
              累计净利润 {wan(cumNetProfits[4])}
            </div>
          );
        })()}
      </section>
    </>
  );
}

function SectionRow({ label }: { label: string }) {
  return (
    <tr><td colSpan={6} className="bg-blue-50 text-[11px] text-blue-600 uppercase tracking-wider font-semibold py-1.5 px-3.5">{label}</td></tr>
  );
}

function Row({ label, values, bold, highlight, purple, green, colorize, faded }: {
  label: string; values: string[]; bold?: boolean; highlight?: boolean; purple?: boolean; green?: boolean; colorize?: boolean; faded?: boolean;
}) {
  return (
    <tr className="even:bg-gray-50/50">
      <td className={`py-2 px-3.5 border-b border-gray-100 ${bold ? 'font-semibold' : ''} ${faded ? 'text-gray-500 text-xs' : ''}`}>{label}</td>
      {values.map((v, i) => {
        let cls = 'py-2 px-3.5 border-b border-gray-100 whitespace-nowrap';
        if (highlight) cls += ' text-blue-600 font-bold';
        if (purple) cls += ' text-purple-600 font-semibold';
        if (green) cls += ' text-green-600';
        if (faded) cls += ' text-gray-500 text-xs';
        if (colorize) {
          if (v.startsWith('−')) cls += ' text-red-600';
          else if (v !== '¥0' && v !== '—') cls += ' text-green-600';
        }
        return <td key={i} className={cls}>{v}</td>;
      })}
    </tr>
  );
}

function TotalRow({ label, values, positive, colorize }: { label: string; values: string[]; positive?: boolean; colorize?: boolean }) {
  return (
    <tr className="bg-blue-50/30">
      <td className="py-2 px-3.5 border-b border-gray-100 font-bold">{label}</td>
      {values.map((v, i) => {
        let cls = 'py-2 px-3.5 border-b border-gray-100 font-bold whitespace-nowrap';
        if (positive) cls += ' text-green-600';
        if (colorize) {
          if (v.startsWith('−')) cls += ' text-red-600';
          else if (v !== '¥0') cls += ' text-green-600';
        }
        return <td key={i} className={cls}>{v}</td>;
      })}
    </tr>
  );
}
