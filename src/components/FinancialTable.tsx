'use client';
import { CalcResult } from '@/lib/calculator';
import { YEAR_LABELS, MONTH_LABELS, PHASE_LABELS } from '@/lib/defaults';

function wan(n: number) {
  const v = n / 10000;
  if (v === 0) return '¥0';
  return (v >= 0 ? '¥' : '−¥') + Math.abs(v).toFixed(0) + '万';
}
function pct(n: number | null) {
  if (n === null) return '—';
  return (n * 100).toFixed(1) + '%';
}

interface Props { result: CalcResult; }

export default function FinancialTable({ result }: Props) {
  const y = result.years;
  const cumNetProfits: number[] = [];
  let acc = 0;
  y.forEach(yr => { acc += yr.net_profit; cumNetProfits.push(acc); });

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 my-5">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-[22px] font-bold text-gray-800">五年财务预测 — 中性情景</h2>
        <span className="text-[11px] bg-blue-50 text-blue-600 px-3 py-0.5 rounded-full font-medium">投资人关注</span>
      </div>
      <p className="text-[13px] text-gray-500 mb-6">升级按活跃存量封顶 | SaaS按75%续约率逐年衰减 | M1=2026年7月</p>

      <div className="rounded-lg p-3 px-4 mb-3.5 text-[13px] flex items-start gap-2 bg-blue-50 border border-blue-300 text-blue-800 leading-relaxed">
        ℹ️ Y4计划升级{y[3]?.planned_upgrade || 0}床，按续约率衰减后实际可升级{y[3]?.actual_upgrade || 0}床。Y5无二类存量可升级。
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200 w-[160px]">项目</th>
              {YEAR_LABELS.map((l, i) => (
                <th key={i} className="bg-blue-50 text-blue-600 font-semibold py-2.5 px-3.5 text-left border-b-2 border-blue-200">
                  {l}<br /><small className="font-normal text-gray-400">{MONTH_LABELS[i]}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SectionRow label="📋 阶段与部署" />
            <Row label="阶段" values={PHASE_LABELS} bold />
            <Row label="新增二类床位" values={y.map(v => v.new_c2_beds.toString())} />
            <Row label="新增三类床位" values={y.map(v => v.new_c3_beds.toString())} />
            <Row label="升级床位" values={y.map(v => v.actual_upgrade.toString())} />
            <Row label="活跃付费床位" values={y.map(v => '~' + v.active_paying)} />

            <SectionRow label="💰 收入" />
            <Row label="硬件收入" values={y.map(v => wan(v.hw_revenue))} highlight />
            <Row label="升级服务收入" values={y.map(v => wan(v.upgrade_revenue))} />
            <Row label="SaaS收入" values={y.map(v => wan(v.saas_revenue))} purple />
            <TotalRow label="总收入" values={y.map(v => wan(v.total_revenue))} />
            <Row label="YoY增长" values={y.map((v, i) => i === 0 ? '—' : y[i-1].total_revenue === 0 ? '—' : ((v.total_revenue - y[i-1].total_revenue) / y[i-1].total_revenue * 100).toFixed(1) + '%')} green />

            <SectionRow label="📦 成本与毛利" />
            <Row label="COGS" values={y.map(v => wan(v.cogs))} />
            <TotalRow label="毛利" values={y.map(v => wan(v.gross_profit))} positive />
            <Row label="毛利率" values={y.map(v => pct(v.gross_margin))} />

            <SectionRow label="📈 盈利" />
            <Row label="OpEx" values={y.map(v => wan(v.opex))} />
            <TotalRow label="EBITDA" values={y.map(v => wan(v.ebitda))} colorize />
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

function Row({ label, values, bold, highlight, purple, green, colorize }: {
  label: string; values: string[]; bold?: boolean; highlight?: boolean; purple?: boolean; green?: boolean; colorize?: boolean;
}) {
  return (
    <tr className="even:bg-gray-50/50">
      <td className={`py-2 px-3.5 border-b border-gray-100 ${bold ? 'font-semibold' : ''}`}>{label}</td>
      {values.map((v, i) => {
        let cls = 'py-2 px-3.5 border-b border-gray-100 whitespace-nowrap';
        if (highlight) cls += ' text-blue-600 font-bold';
        if (purple) cls += ' text-purple-600 font-semibold';
        if (green) cls += ' text-green-600';
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
