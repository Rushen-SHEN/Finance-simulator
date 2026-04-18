'use client';
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

interface Props { result: CalcResult; scenario: string; }

export default function FinancialTable({ result, scenario }: Props) {
  const y = result.years;
  const cumNetProfits: number[] = [];
  let acc = 0;
  y.forEach(yr => { acc += yr.net_profit; cumNetProfits.push(acc); });

  const scenarioLabel = SCENARIO_NAMES[scenario] || '中性情景';

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 my-5">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-[22px] font-bold text-gray-800">五年财务预测 — {scenarioLabel}</h2>
        <span className="text-[11px] bg-red-50 text-red-600 px-3 py-0.5 rounded-full font-medium">🔥 红杉关注</span>
      </div>
      <p className="text-[13px] text-gray-500 mb-6">直销+Baxter渠道 | SaaS续约率{(y.length > 1 ? (result.years[0].opex > 0 ? '70%' : '70%') : '70%')} | 授权金+里程碑 | M1=2026年7月</p>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200 w-[180px]">项目</th>
              {YEAR_LABELS.map((l, i) => (
                <th key={i} className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200">
                  {l}<br /><small className="font-normal text-gray-400">{MONTH_LABELS[i]}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SectionRow label="📋 部署 (直销+Baxter)" />
            <Row label="阶段" values={PHASE_LABELS} bold />
            <Row label="直销 C2" values={y.map(v => v.direct_c2.toString())} />
            <Row label="直销 C3" values={y.map(v => v.direct_c3.toString())} />
            <Row label="Baxter C2" values={y.map(v => v.baxter_c2.toString())} />
            <Row label="Baxter C3" values={y.map(v => v.baxter_c3.toString())} highlight />
            <Row label="升级 C2→C3" values={y.map(v => v.actual_upgrade.toString())} />
            <Row label="累计床位" values={y.map(v => v.cumulative_beds.toString())} bold />
            <Row label="活跃付费" values={y.map(v => '~' + v.active_paying)} />

            <SectionRow label="💰 收入明细 (6条线)" />
            <Row label="硬件直销" values={y.map(v => wan(v.hw_direct))} highlight />
            <Row label="硬件Baxter(15%)" values={y.map(v => wan(v.hw_baxter))} />
            <Row label="升级服务" values={y.map(v => wan(v.upgrade_revenue))} />
            <Row label="SaaS直销" values={y.map(v => wan(v.saas_direct))} purple />
            <Row label="SaaS Baxter(35%)" values={y.map(v => wan(v.saas_baxter))} purple />
            <Row label="授权金+里程碑" values={y.map(v => wan(v.baxter_license))} highlight />
            <TotalRow label="总收入" values={y.map(v => wan(v.total_revenue))} />
            <Row label="BP目标" values={BP_TARGETS.total_revenue.map(v => v ? `¥${v}万` : '—')} faded />
            <Row label="YoY增长" values={y.map((v, i) => i === 0 ? '—' : y[i-1].total_revenue === 0 ? '—' : ((v.total_revenue - y[i-1].total_revenue) / y[i-1].total_revenue * 100).toFixed(1) + '%')} green />

            <SectionRow label="📦 成本与毛利" />
            <Row label="COGS" values={y.map(v => wan(v.cogs))} />
            <TotalRow label="毛利" values={y.map(v => wan(v.gross_profit))} positive />
            <Row label="毛利率" values={y.map(v => pct(v.gross_margin))} />

            <SectionRow label="📈 盈利" />
            <Row label="OpEx" values={y.map(v => wan(v.opex))} />
            <TotalRow label="EBITDA" values={y.map(v => wan(v.ebitda))} colorize />
            <Row label="BP目标EBITDA" values={BP_TARGETS.ebitda.map(v => `${v >= 0 ? '¥' : '−¥'}${Math.abs(v)}万`)} faded />
            <Row label="折旧摊销" values={y.map(v => wan(v.depreciation))} />
            <TotalRow label="净利润" values={y.map(v => wan(v.net_profit))} colorize />
            <Row label="累计净利润" values={cumNetProfits.map(v => wan(v))} colorize />
          </tbody>
        </table>
      </div>
    </section>
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
      <td className={`py-2 px-3.5 border-b border-gray-100 ${bold ? 'font-semibold' : ''} ${faded ? 'text-gray-400 text-[11px]' : ''}`}>{label}</td>
      {values.map((v, i) => {
        let cls = 'py-2 px-3.5 border-b border-gray-100 whitespace-nowrap';
        if (highlight) cls += ' text-blue-600 font-bold';
        if (purple) cls += ' text-purple-600 font-semibold';
        if (green) cls += ' text-green-600';
        if (faded) cls += ' text-gray-400 text-[11px]';
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
