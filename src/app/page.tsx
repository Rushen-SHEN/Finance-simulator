'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ModelInputs, calculate, CalcResult } from '@/lib/calculator';
import { DEFAULT_MODEL } from '@/lib/defaults';
import { loadModel, saveModel, clearModel } from '@/lib/storage';
import { exportPDF, exportPNG } from '@/lib/exportUtils';
import Header from '@/components/Header';
import StatusStrip from '@/components/StatusStrip';
import PhaseOverview from '@/components/PhaseOverview';
import PhaseTimeline from '@/components/PhaseTimeline';
import MarketSection from '@/components/MarketSection';
import BusinessModel from '@/components/BusinessModel';
import FinancialTable from '@/components/FinancialTable';
import RevenueCharts from '@/components/RevenueCharts';
import ProfitCharts from '@/components/ProfitCharts';
import FundingPlan from '@/components/FundingPlan';
import GanttTimeline from '@/components/GanttTimeline';
import Assumptions from '@/components/Assumptions';
import ParameterPanel from '@/components/ParameterPanel';

const CODE_HASH = 'c50281c3dd92d836d2ba7702fad19f778404cddd49059afc7b2e6e537f436ea7';

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Home() {
  const [model, setModel] = useState<ModelInputs>(structuredClone(DEFAULT_MODEL));
  const [showParams, setShowParams] = useState(false);
  const [scenario, setScenario] = useState<string>('neutral');
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModel(loadModel());
    setMounted(true);
    if (typeof window !== 'undefined' && sessionStorage.getItem('aria-unlocked') === '1') {
      setUnlocked(true);
    }
  }, []);

  const handleUnlock = useCallback(async () => {
    const hash = await sha256(code);
    if (hash === CODE_HASH) {
      setUnlocked(true);
      setCodeError(false);
      sessionStorage.setItem('aria-unlocked', '1');
    } else {
      setCodeError(true);
    }
  }, [code]);

  const resultBest: CalcResult = calculate(model.global, model.yearly, model.opex, model.milestones_best);
  const resultBase: CalcResult = calculate(model.global, model.yearly, model.opex, model.milestones_base);

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

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center px-4">
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-8 sm:p-10 max-w-sm w-full text-center backdrop-blur-md shadow-2xl">
          <div className="text-3xl mb-3">🔐</div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">ARIA 财务模型</h1>
          <p className="text-sm text-slate-400 mb-6">输入Rushen的手机号尾号</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={code}
            onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setCodeError(false); }}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            className={`w-full text-center text-2xl tracking-[0.5em] font-mono py-3 rounded-lg bg-slate-800 border ${codeError ? 'border-red-500 shake' : 'border-slate-600'} text-slate-100 outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600 placeholder:text-lg placeholder:tracking-normal`}
            placeholder="****"
            autoFocus
          />
          {codeError && <p className="text-red-400 text-xs mt-2">验证码错误，请重试</p>}
          <button
            onClick={handleUnlock}
            className="mt-5 w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors"
          >
            进入面板
          </button>
          <p className="text-[11px] text-slate-600 mt-4">财务数据受密码保护 · 仅限授权人员访问</p>
        </div>
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

      <div ref={printRef} className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-12">
        <StatusStrip />

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

        <div data-export-module>
          <PhaseOverview milestonesBest={model.milestones_best} milestonesBase={model.milestones_base} />
        </div>
        <div data-export-module>
          <PhaseTimeline milestonesBest={model.milestones_best} milestonesBase={model.milestones_base} />
        </div>

        <div data-export-module><MarketSection /></div>
        <div data-export-module><BusinessModel global={model.global} result={resultBest} /></div>
        <FinancialTable resultBest={resultBest} resultBase={resultBase} scenario={scenario} />
        <div data-export-module><RevenueCharts result={resultBest} /></div>
        <div data-export-module><ProfitCharts result={resultBest} /></div>
        <div data-export-module><FundingPlan result={resultBest} scenario={scenario} funding={model.funding} /></div>
        <div data-export-module><GanttTimeline scenario={scenario} milestonesBest={model.milestones_best} milestonesBase={model.milestones_base} /></div>
        <div data-export-module><Assumptions scenario={scenario} global={model.global} result={resultBest} /></div>

        <footer className="text-center py-8 border-t border-slate-600/50 mt-8 text-xs text-slate-300">
          <div>ARIA 财务模型模拟器 v3.2 | BPcc 2026-04 | 直销+合作经销商双引擎 | 全参数可调+存档</div>
          <div className="text-amber-300 font-medium mt-1">
            ⚠️ 所有预测均为推算，非已确认事实。项目当前处于原型开发阶段，无外部融资，无已授权专利。
          </div>
        </footer>
      </div>
    </div>
  );
}
