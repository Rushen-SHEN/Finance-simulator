import { GlobalInputs, CalcResult } from '@/lib/calculator';

function pct(n: number) { return (n * 100).toFixed(1) + '%'; }

interface Props { scenario: string; global: GlobalInputs; result: CalcResult; }

export default function Assumptions({ scenario, global, result }: Props) {
  const y = result.years;
  const c3AnnualCost = global.price_hw_c3 / 3 + global.price_saas_c3;
  const c3ROI = (global.value_anchor_c3 - c3AnnualCost) / c3AnnualCost;
  const c2AnnualCost = global.price_hw_c2 / 3 + global.price_saas_c2;
  const c2ROI = (global.value_anchor_c2 - c2AnnualCost) / c2AnnualCost;
  const ebitdaPositive = y.findIndex(v => v.ebitda > 0);

  const scenarioLabel = scenario === 'neutral' ? '中性' : scenario === 'optimistic' ? '乐观' : scenario === 'conservative' ? '保守' : '延迟';

  const dynamicAssumptions = [
    { level: 'green', label: 'Baxter渠道', value: `授权金¥500万 · HW 15%/SaaS 35% · 可替代Pre-A轮` },
    { level: ebitdaPositive <= 1 ? 'green' : 'yellow', label: 'EBITDA转正', value: `${ebitdaPositive >= 0 ? `Year ${ebitdaPositive + 1}` : '未转正'} · ${ebitdaPositive <= 1 ? '快速盈利' : '需密切关注'}` },
    { level: 'green', label: '融资需求', value: '¥800–1,600万 · 远低于旧方案¥3,200–4,800万' },
    { level: c2ROI > 0 && c3ROI > 0 ? 'green' : 'yellow', label: '全线ROI', value: `C2: +${pct(c2ROI)} · C3: +${pct(c3ROI)} · 三类独立锚点¥8万` },
    { level: global.rr_base < 0.6 ? 'red' : global.rr_base >= 0.85 ? 'green' : 'yellow', label: `SaaS续约率 (${scenarioLabel})`, value: `${pct(global.rr_base)} · ${global.rr_base < 0.6 ? '极低，收入衰减严重' : global.rr_base >= 0.85 ? '高位，乐观假设' : '中国医院SaaS付费尚在培育期'}` },
    { level: 'red', label: '专利状态', value: '未申报 · 无法律排他性保护' },
    { level: 'red', label: '团队规模', value: '3人创客 · 无NMPA SaMD注册成功经验' },
    { level: scenario === 'delayed' ? 'red' : 'yellow', label: '二类审评', value: scenario === 'delayed' ? 'M18获批(延迟+3月) · NMPA平均6–9个月' : 'M14–15获批 · 创新通道缩短30%' },
    { level: 'yellow', label: '医院合作', value: '6家候选 · 均为初步沟通，无正式协议' },
    { level: 'green', label: '临床痛点', value: 'ICU谵妄60–80% · 充分文献支撑' },
    { level: 'green', label: '产品差异化', value: '全球无已获批同类产品 · 国内首创' },
    { level: 'green', label: '边缘AI合规', value: '数据不出院 · PIPL/等保2.0友好架构' },
  ];

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8 my-5">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-[22px] font-bold text-gray-800">关键假设与风险标记 — {scenarioLabel}情景</h2>
        <span className="text-[11px] bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-600 px-3 py-0.5 rounded-full font-medium border border-amber-200/50">⭐ 重点</span>
      </div>
      <p className="text-xs sm:text-[13px] text-gray-600 mb-6">所有预测均为推算，非已确认事实 · 红色标记需优先关注 · 绿色为新增优势</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {dynamicAssumptions.map((a, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-2.5 shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${dotColor[a.level]}`} />
            <div>
              <div className="text-xs text-gray-600">{a.label}</div>
              <div className="text-[13px] font-semibold text-gray-800">{a.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const dotColor: Record<string, string> = {
  red: 'bg-red-500',
  yellow: 'bg-orange-400',
  green: 'bg-green-500',
};
