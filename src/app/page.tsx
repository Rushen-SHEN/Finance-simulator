'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ModelInputs, calculate, CalcResult } from '@/lib/calculator';
import { DEFAULT_MODEL } from '@/lib/defaults';
import { loadModel, saveModel, clearModel } from '@/lib/storage';
import { exportPDF, exportPNG } from '@/lib/exportUtils';
import Header from '@/components/Header';
import StatusStrip from '@/components/StatusStrip';
import PhaseOverview from '@/components/PhaseOverview';
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
  const [model, setModel] = useState<ModelInputs>(structuredClone(DEFAULT_MODEL));
  const [showParams, setShowParams] = useState(false);
  const [scenario, setScenario] = useState<string>('neutral');
  const [mounted, setMounted] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModel(loadModel());
    setMounted(true);
  }, []);

  const result: CalcResult = calculate(model.global, model.yearly, model.opex, model.milestones_best);

  const handleModelChange = useCallback((m: ModelInputs) => {
    setModel(m);
    saveModel(m);
  }, []);

  const handleReset = useCallback(() => {
    clearModel();
    setModel(structuredClone(DEFAULT_MODEL));
    setScenario('neutral');
  }, []);

  const handleScenario = useCallback((s: string) => {
    setScenario(s);
    setModel(prev => {
      let rr = 0.70;
      switch (s) {
        case 'optimistic': rr = 0.85; break;
        case 'conservative': rr = 0.55; break;
        case 'delayed': rr = 0.70; break;
      }
      const next = { ...prev, global: { ...prev.global, rr_base: rr } };
      saveModel(next);
      return next;
    });
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (!printRef.current) return;
    await exportPDF(printRef.current, `ARIA-BP-${scenario}`);
  }, [scenario]);

  const handleExportPNG = useCallback(async () => {
    if (!printRef.current) return;
    await exportPNG(printRef.current, `ARIA-BP-${scenario}`);
  }, [scenario]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="text-slate-500 text-lg animate-pulse">Loading ARIA...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      <Header
        scenario={scenario}
        onScenario={handleScenario}
        onToggleParams={() => setShowParams(p => !p)}
        onExportPDF={handleExportPDF}
        onExportPNG={handleExportPNG}
      />

      <div ref={printRef} className="max-w-[1200px] mx-auto px-6 pb-12">
        <StatusStrip />
        <PhaseOverview milestonesBest={model.milestones_best} milestonesBase={model.milestones_base} />

        {showParams && (
          <div data-no-export>
            <ParameterPanel
              model={model}
              onModelChange={handleModelChange}
              onReset={handleReset}
              onClose={() => setShowParams(false)}
            />
          </div>
        )}

        <MarketSection />
        <BusinessModel global={model.global} result={result} />
        <FinancialTable result={result} scenario={scenario} />
        <RevenueCharts result={result} />
        <ProfitCharts result={result} />
        <FundingPlan result={result} scenario={scenario} funding={model.funding} />
        <GanttTimeline scenario={scenario} milestonesBest={model.milestones_best} milestonesBase={model.milestones_base} />
        <Assumptions scenario={scenario} global={model.global} result={result} />

        <footer className="text-center py-8 border-t border-slate-700/40 mt-8 text-xs text-slate-500">
          <div>ARIA 财务模型模拟器 v3.2 | BPcc 2026-04 | 直销+Baxter双引擎 | 全参数可调+存档</div>
          <div className="text-amber-400/70 font-medium mt-1">
            ⚠️ 所有预测均为推算，非已确认事实。项目当前处于原型开发阶段，无外部融资，无已授权专利。
          </div>
        </footer>
      </div>
    </div>
  );
}
