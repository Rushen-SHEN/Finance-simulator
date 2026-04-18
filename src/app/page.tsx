'use client';

import { useState, useCallback, useEffect } from 'react';
import { GlobalInputs, YearlyInputs, calculate, CalcResult } from '@/lib/calculator';
import { DEFAULT_GLOBAL, DEFAULT_YEARLY } from '@/lib/defaults';
import { loadInputs, saveInputs, clearInputs } from '@/lib/storage';
import Header from '@/components/Header';
import StatusStrip from '@/components/StatusStrip';
import MarketSection from '@/components/MarketSection';
import BusinessModel from '@/components/BusinessModel';
import FinancialTable from '@/components/FinancialTable';
import RevenueCharts from '@/components/RevenueCharts';
import ProfitCharts from '@/components/ProfitCharts';
import FundingPlan from '@/components/FundingPlan';
import GanttTimeline from '@/components/GanttTimeline';
import Assumptions from '@/components/Assumptions';
import ParameterPanel from '@/components/ParameterPanel';

export default function Home() {
  const [global, setGlobal] = useState<GlobalInputs>(DEFAULT_GLOBAL);
  const [yearly, setYearly] = useState<YearlyInputs>(structuredClone(DEFAULT_YEARLY));
  const [showParams, setShowParams] = useState(false);
  const [scenario, setScenario] = useState<string>('neutral');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const { global: g, yearly: y } = loadInputs();
    setGlobal(g);
    setYearly(y);
    setMounted(true);
  }, []);

  const result: CalcResult = calculate(global, yearly);

  const handleGlobalChange = useCallback((key: keyof GlobalInputs, value: number) => {
    setGlobal(prev => {
      const next = { ...prev, [key]: value };
      saveInputs(next, yearly);
      return next;
    });
  }, [yearly]);

  const handleYearlyChange = useCallback((key: keyof YearlyInputs, idx: number, value: number) => {
    setYearly(prev => {
      const next = { ...prev, [key]: [...prev[key]] };
      next[key][idx] = value;
      saveInputs(global, next);
      return next;
    });
  }, [global]);

  const handleReset = useCallback(() => {
    clearInputs();
    setGlobal({ ...DEFAULT_GLOBAL });
    setYearly(structuredClone(DEFAULT_YEARLY));
    setScenario('neutral');
  }, []);

  const handleScenario = useCallback((s: string) => {
    setScenario(s);
    const base = { ...DEFAULT_GLOBAL };
    switch (s) {
      case 'optimistic': base.rr_base = 0.85; break;
      case 'conservative': base.rr_base = 0.60; break;
      case 'delayed': base.rr_base = 0.75; break;
      default: base.rr_base = 0.75;
    }
    setGlobal(prev => ({ ...prev, rr_base: base.rr_base }));
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <Header
        scenario={scenario}
        onScenario={handleScenario}
        onToggleParams={() => setShowParams(p => !p)}
      />

      <div className="max-w-[1200px] mx-auto px-6 pb-12">
        <StatusStrip />

        {showParams && (
          <ParameterPanel
            global={global}
            yearly={yearly}
            onGlobalChange={handleGlobalChange}
            onYearlyChange={handleYearlyChange}
            onReset={handleReset}
            onClose={() => setShowParams(false)}
          />
        )}

        <MarketSection />
        <BusinessModel global={global} result={result} />
        <FinancialTable result={result} />
        <RevenueCharts result={result} />
        <ProfitCharts result={result} />
        <FundingPlan />
        <GanttTimeline />
        <Assumptions />

        <footer className="text-center py-8 border-t border-gray-200 mt-8 text-xs text-gray-500">
          <div>ARIA 财务模型模拟器 v2.0 | 基于商业计划书 2026年4月版 | 升级按活跃存量封顶</div>
          <div className="text-orange-500 font-medium mt-1">
            ⚠️ 所有预测均为推算，非已确认事实。项目当前处于原型开发阶段，无外部融资，无已授权专利。
          </div>
        </footer>
      </div>
    </div>
  );
}
