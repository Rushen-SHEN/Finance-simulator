'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { ModelInputs, calculate, CalcResult } from '@/lib/calculator';
import { DEFAULT_MODEL } from '@/lib/defaults';
import { loadModel, saveModel, clearModel } from '@/lib/storage';
import { exportPDF, exportPNG } from '@/lib/exportUtils';
import { detectChanges, ChangeReport } from '@/lib/changeTracker';
import { generateFinancialPlan, patchBPSections, extractRoadshowUpdates } from '@/lib/docGenerator';
import { saveArchive } from '@/lib/archiveStore';
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
import ChangeBanner from '@/components/ChangeBanner';

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/Finance-simulator' : '';

/** Trigger a browser download for a text file */
function downloadFile(filename: string, content: string, mime = 'text/markdown') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const CODE_HASH = 'c50281c3dd92d836d2ba7702fad19f778404cddd49059afc7b2e6e537f436ea7';

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Home() {
  const [model, setModel] = useState<ModelInputs>(structuredClone(DEFAULT_MODEL));
  const [showParams, setShowParams] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const scenario = model.active_scenario || 'neutral';
  const activeTimeline = model.active_timeline || 'aggressive';

  // Initialize from localStorage — use layout effect to avoid flash
  const [initialized, setInitialized] = useState(false);
  if (!initialized && typeof window !== 'undefined') {
    const saved = loadModel();
    if (JSON.stringify(saved) !== JSON.stringify(model)) {
      setModel(saved);
    }
    if (sessionStorage.getItem('aria-unlocked') === '1' && !unlocked) {
      setUnlocked(true);
    }
    if (!mounted) setMounted(true);
    setInitialized(true);
  }

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

  const so = model.scenario_overrides?.[scenario];
  const resultBest: CalcResult = calculate(model.global, model.yearly, model.opex, model.milestones_best, so);
  const resultBase: CalcResult = calculate(model.global, model.yearly_base, model.opex, model.milestones_base, so);

  // Change detection — track baseline model (last accepted state)
  const [acceptedModel, setAcceptedModel] = useState<ModelInputs>(structuredClone(DEFAULT_MODEL));
  const [acceptedInit, setAcceptedInit] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [archiveVersion, setArchiveVersion] = useState(0);
  const [lastAcceptMsg, setLastAcceptMsg] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<{ fp?: string; bp?: string; roadshow?: string; fpVersion?: string } | null>(null);

  // Initialize accepted model from localStorage
  if (!acceptedInit && typeof window !== 'undefined') {
    const saved = loadModel();
    setAcceptedModel(structuredClone(saved));
    setAcceptedInit(true);
  }

  const changeReport: ChangeReport = useMemo(
    () => detectChanges(acceptedModel, model),
    [acceptedModel, model]
  );

  // Accept changes: generate documents, archive, update roadshow
  const handleAcceptChanges = useCallback(async () => {
    setAccepting(true);
    setLastAcceptMsg(null);
    try {
      const now = Date.now();

      // 1. Generate Financial Plan
      const fp = generateFinancialPlan(model, resultBest, resultBase);
      await saveArchive({
        timestamp: now,
        version: fp.version,
        type: 'financial_plan',
        label: `参数变更自动生成 — ${changeReport.changedGroups.map(g => g.label).join(', ')}`,
        content: fp.content,
        modelSnapshot: structuredClone(model),
      });

      // 2. Patch BP document (read current, patch numbers)
      let bpContent = '';
      let bpPatched: { content: string; version: string } | null = null;
      try {
        const resp = await fetch(`${BASE_PATH}/docs/ARIA_BP_External.md`);
        if (resp.ok) bpContent = await resp.text();
      } catch { /* ignore — BP may not be fetchable in static build */ }

      if (bpContent) {
        bpPatched = patchBPSections(bpContent, model, resultBest);
        await saveArchive({
          timestamp: now,
          version: bpPatched.version,
          type: 'bp',
          label: `BP数字表格更新 — ${changeReport.affectedMappings.map(m => m.mappingId).join(', ')}`,
          content: bpPatched.content,
          modelSnapshot: structuredClone(model),
        });
      }

      // 3. Save roadshow data snapshot
      const roadshowData = extractRoadshowUpdates(model, resultBest);
      await saveArchive({
        timestamp: now,
        version: fp.version,
        type: 'roadshow',
        label: `路演数据更新`,
        content: JSON.stringify(roadshowData, null, 2),
        modelSnapshot: structuredClone(model),
      });

      // 4. Update baseline
      setAcceptedModel(structuredClone(model));
      setArchiveVersion(v => v + 1);
      setGeneratedDocs({ fp: fp.content, bp: bpPatched?.content, roadshow: JSON.stringify(roadshowData, null, 2), fpVersion: fp.version });
      setLastAcceptMsg(`✅ 已生成 Financial Plan ${fp.version}${bpPatched ? ` + BP更新` : ''} + 路演数据快照`);
    } catch (err) {
      setLastAcceptMsg(`❌ 导出失败: ${err instanceof Error ? err.message : String(err)}`);
    }
    setAccepting(false);
  }, [model, resultBest, resultBase, changeReport]);

  const handleDownloadDocs = useCallback(() => {
    if (!generatedDocs) return;
    if (generatedDocs.fp) downloadFile(`ARIA_Financial_Plan_latest.md`, generatedDocs.fp);
    if (generatedDocs.bp) downloadFile(`ARIA_BP_External_clean.md`, generatedDocs.bp);
    if (generatedDocs.roadshow) downloadFile(`roadshow-data.json`, generatedDocs.roadshow, 'application/json');
  }, [generatedDocs]);

  const handleModelChange = useCallback((m: ModelInputs) => {
    setModel(m);
    saveModel(m);
  }, []);

  const handleReset = useCallback(() => {
    const confirmed = confirm(
      '⚠️ 确认要恢复所有参数到默认值吗？\n\n这将清除所有本地存储数据，包括:\n' +
      '• 所有参数调整\n' +
      '• 自定义场景\n' +
      '• 参数快照\n\n' +
      '此操作无法撤销。继续？'
    );
    if (!confirmed) return;

    clearModel();
    const fresh = structuredClone(DEFAULT_MODEL);
    setModel(fresh);
    setAcceptedModel(structuredClone(fresh));
    setLastAcceptMsg('✅ 已恢复默认值。所有参数已重置，新的制造Overhead乘数已应用 (neutral=2.8×)');
  }, []);

  const handleScenario = useCallback((s: string) => {
    setModel(prev => {
      const next = { ...prev, active_scenario: s as ModelInputs['active_scenario'] };
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
              resultBest={resultBest}
              resultBase={resultBase}
              onModelChange={handleModelChange}
              onReset={handleReset}
              onClose={() => setShowParams(false)}
              archiveVersion={archiveVersion}
            />
          </div>
        )}

        {/* Change detection banner */}
        {showParams && (
          <div data-no-export>
            <ChangeBanner report={changeReport} onAccept={handleAcceptChanges} accepting={accepting} />
            {lastAcceptMsg && (
              <div className="mx-4 sm:mx-8 mb-3 px-4 py-2 rounded-lg border border-slate-700/50 bg-slate-800/50 text-xs text-slate-300 flex items-center justify-between">
                <span>{lastAcceptMsg}</span>
                {generatedDocs && (
                  <button
                    onClick={handleDownloadDocs}
                    className="ml-3 px-3 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-medium transition-colors whitespace-nowrap"
                  >
                    📥 下载文档到本地
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div data-export-module>
          <PhaseOverview milestonesBest={model.milestones_best} milestonesBase={model.milestones_base} />
        </div>
        <div data-export-module>
          <PhaseTimeline milestonesBest={model.milestones_best} milestonesBase={model.milestones_base} />
        </div>

        <div data-export-module><MarketSection resultBest={resultBest} resultBase={resultBase} /></div>
        <div data-export-module><BusinessModel global={model.global} result={resultBest} /></div>
        <FinancialTable resultBest={resultBest} resultBase={resultBase} scenario={scenario} />
        <div data-export-module><RevenueCharts result={resultBest} /></div>
        <div data-export-module><ProfitCharts result={resultBest} /></div>
        <div data-export-module><FundingPlan result={resultBest} scenario={scenario} funding={model.funding} global={model.global} /></div>
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
