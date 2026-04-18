export default function Assumptions() {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 my-5">
      <div className="flex items-center justify-between mb-1.5">
        <h2 className="text-[22px] font-bold text-gray-800">关键假设与风险标记</h2>
        <span className="text-[11px] bg-blue-50 text-blue-600 px-3 py-0.5 rounded-full font-medium">投资人关注</span>
      </div>
      <p className="text-[13px] text-gray-500 mb-6">所有预测均为推算，非已确认事实 · 红色标记需优先关注</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {assumptions.map((a, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-2.5 shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${dotColor[a.level]}`} />
            <div>
              <div className="text-xs text-gray-500">{a.label}</div>
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

const assumptions = [
  { level: 'red', label: '专利状态', value: '未申报 · 无法律排他性保护' },
  { level: 'red', label: '团队规模', value: '3人创客 · 无NMPA SaMD注册成功经验' },
  { level: 'red', label: '三类新购ROI', value: '−21.9% · 年化费用超过创造价值' },
  { level: 'red', label: '融资窗口', value: 'RPN 15(极高) · 现金流断裂风险' },
  { level: 'yellow', label: 'SaaS续约率', value: '75% · 中国医院SaaS付费尚在培育期' },
  { level: 'yellow', label: '价值创造锚点', value: '¥6.25万/床/年 · 缺乏底层经济学拆解' },
  { level: 'yellow', label: '医院合作', value: '6家候选 · 均为初步沟通，无正式协议' },
  { level: 'yellow', label: '二类审评时间', value: 'M18获批(5个月) · NMPA平均6–9个月' },
  { level: 'yellow', label: 'Y4升级可行性', value: '计划150床 → 实际可用131床(缺口19床)' },
  { level: 'green', label: '临床痛点', value: 'ICU谵妄60–80% · 充分文献支撑' },
  { level: 'green', label: '产品差异化', value: '全球无已获批同类产品 · 国内首创' },
  { level: 'green', label: '边缘AI合规', value: '数据不出院 · PIPL/等保2.0友好架构' },
];
