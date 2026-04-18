'use client';

import { GlobalInputs, YearlyInputs } from '@/lib/calculator';
import { DEFAULT_GLOBAL, DEFAULT_YEARLY, YEAR_LABELS } from '@/lib/defaults';

interface Props {
  global: GlobalInputs;
  yearly: YearlyInputs;
  onGlobalChange: (key: keyof GlobalInputs, value: number) => void;
  onYearlyChange: (key: keyof YearlyInputs, idx: number, value: number) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function ParameterPanel({ global, yearly, onGlobalChange, onYearlyChange, onReset, onClose }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 my-4 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">📐 参数调整面板</h2>
        <div className="flex gap-2">
          <button onClick={onReset} className="px-3 py-1 text-xs rounded-lg border border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors">
            🔄 恢复默认
          </button>
          <button onClick={onClose} className="px-3 py-1 text-xs rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
            ✕ 关闭
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">修改下方参数后，所有图表和表格实时更新。黄色背景 = 已修改（与默认值不同）</p>

      {/* Pricing */}
      <h3 className="text-sm font-semibold text-blue-600 mb-2 mt-4">定价参数</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <ParamInput label="二类硬件(元/床)" value={global.price_hw_c2} defaultVal={DEFAULT_GLOBAL.price_hw_c2} onChange={v => onGlobalChange('price_hw_c2', v)} />
        <ParamInput label="三类硬件(元/床)" value={global.price_hw_c3} defaultVal={DEFAULT_GLOBAL.price_hw_c3} onChange={v => onGlobalChange('price_hw_c3', v)} />
        <ParamInput label="升级单价(元/床)" value={global.price_upgrade} defaultVal={DEFAULT_GLOBAL.price_upgrade} onChange={v => onGlobalChange('price_upgrade', v)} />
        <ParamInput label="二类SaaS(元/年)" value={global.price_saas_c2} defaultVal={DEFAULT_GLOBAL.price_saas_c2} onChange={v => onGlobalChange('price_saas_c2', v)} />
        <ParamInput label="三类SaaS(元/年)" value={global.price_saas_c3} defaultVal={DEFAULT_GLOBAL.price_saas_c3} onChange={v => onGlobalChange('price_saas_c3', v)} />
        <ParamInput label="三类大客户SaaS" value={global.price_saas_c3_bulk} defaultVal={DEFAULT_GLOBAL.price_saas_c3_bulk} onChange={v => onGlobalChange('price_saas_c3_bulk', v)} />
      </div>

      {/* BOM & Rates */}
      <h3 className="text-sm font-semibold text-blue-600 mb-2">BOM与续约率</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <ParamInput label="二类BOM(元/床)" value={global.bom_c2} defaultVal={DEFAULT_GLOBAL.bom_c2} onChange={v => onGlobalChange('bom_c2', v)} />
        <ParamInput label="三类BOM(元/床)" value={global.bom_c3} defaultVal={DEFAULT_GLOBAL.bom_c3} onChange={v => onGlobalChange('bom_c3', v)} />
        <ParamInput label="升级BOM(元/床)" value={global.bom_upgrade} defaultVal={DEFAULT_GLOBAL.bom_upgrade} onChange={v => onGlobalChange('bom_upgrade', v)} />
        <ParamInput label="基准续约率" value={global.rr_base} defaultVal={DEFAULT_GLOBAL.rr_base} onChange={v => onGlobalChange('rr_base', v)} step={0.05} />
      </div>

      {/* Baxter Channel */}
      <h3 className="text-sm font-semibold text-purple-600 mb-2">Baxter渠道参数</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <ParamInput label="硬件分成比例" value={global.baxter_hw_commission} defaultVal={DEFAULT_GLOBAL.baxter_hw_commission} onChange={v => onGlobalChange('baxter_hw_commission', v)} step={0.01} />
        <ParamInput label="SaaS分成比例" value={global.baxter_saas_commission} defaultVal={DEFAULT_GLOBAL.baxter_saas_commission} onChange={v => onGlobalChange('baxter_saas_commission', v)} step={0.01} />
        <ParamInput label="C2价值锚(元/年)" value={global.value_anchor_c2} defaultVal={DEFAULT_GLOBAL.value_anchor_c2} onChange={v => onGlobalChange('value_anchor_c2', v)} />
        <ParamInput label="C3价值锚(元/年)" value={global.value_anchor_c3} defaultVal={DEFAULT_GLOBAL.value_anchor_c3} onChange={v => onGlobalChange('value_anchor_c3', v)} />
      </div>

      {/* Yearly Inputs */}
      <h3 className="text-sm font-semibold text-purple-600 mb-2 mt-4">年度部署计划</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left py-1.5 px-2 text-gray-500 font-medium w-[140px]">参数</th>
              {YEAR_LABELS.map(l => <th key={l} className="text-center py-1.5 px-2 text-gray-500 font-medium">{l}</th>)}
            </tr>
          </thead>
          <tbody>
            <YearlyRow label="直销 C2 床位" values={yearly.direct_c2} defaults={DEFAULT_YEARLY.direct_c2} onChange={(i, v) => onYearlyChange('direct_c2', i, v)} />
            <YearlyRow label="直销 C3 床位" values={yearly.direct_c3} defaults={DEFAULT_YEARLY.direct_c3} onChange={(i, v) => onYearlyChange('direct_c3', i, v)} />
            <YearlyRow label="Baxter C2" values={yearly.baxter_c2} defaults={DEFAULT_YEARLY.baxter_c2} onChange={(i, v) => onYearlyChange('baxter_c2', i, v)} />
            <YearlyRow label="Baxter C3" values={yearly.baxter_c3} defaults={DEFAULT_YEARLY.baxter_c3} onChange={(i, v) => onYearlyChange('baxter_c3', i, v)} />
            <YearlyRow label="计划升级" values={yearly.planned_upgrade} defaults={DEFAULT_YEARLY.planned_upgrade} onChange={(i, v) => onYearlyChange('planned_upgrade', i, v)} />
            <YearlyRow label="授权金(万元)" values={yearly.baxter_license.map(v => v / 10000)} defaults={DEFAULT_YEARLY.baxter_license.map(v => v / 10000)} onChange={(i, v) => onYearlyChange('baxter_license', i, v * 10000)} />
            <YearlyRow label="OpEx(万元)" values={yearly.opex.map(v => v / 10000)} defaults={DEFAULT_YEARLY.opex.map(v => v / 10000)} onChange={(i, v) => onYearlyChange('opex', i, v * 10000)} />
            <YearlyRow label="折旧(万元)" values={yearly.depreciation.map(v => v / 10000)} defaults={DEFAULT_YEARLY.depreciation.map(v => v / 10000)} onChange={(i, v) => onYearlyChange('depreciation', i, v * 10000)} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ParamInput({ label, value, defaultVal, onChange, step = 1000 }: {
  label: string; value: number; defaultVal: number; onChange: (v: number) => void; step?: number;
}) {
  const modified = value !== defaultVal;
  return (
    <div>
      <label className="text-[11px] text-gray-500 block mb-0.5">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full px-2 py-1.5 text-xs border rounded-lg outline-none focus:ring-1 focus:ring-blue-400 ${
          modified ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-gray-200'
        }`}
      />
    </div>
  );
}

function YearlyRow({ label, values, defaults, onChange }: {
  label: string; values: number[]; defaults: number[]; onChange: (idx: number, val: number) => void;
}) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-1.5 px-2 font-medium text-gray-700">{label}</td>
      {values.map((v, i) => {
        const modified = v !== defaults[i];
        return (
          <td key={i} className="py-1 px-1 text-center">
            <input
              type="number"
              value={v}
              onChange={e => onChange(i, Number(e.target.value))}
              className={`w-full px-1.5 py-1 text-xs border rounded text-center outline-none focus:ring-1 focus:ring-blue-400 ${
                modified ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-gray-200'
              }`}
            />
          </td>
        );
      })}
    </tr>
  );
}
