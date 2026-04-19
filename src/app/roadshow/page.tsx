'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ModelInputs, calculate, CalcResult } from '@/lib/calculator';
import { DEFAULT_MODEL } from '@/lib/defaults';
import { loadModel } from '@/lib/storage';

export default function RoadshowPage() {
  const [model, setModel] = useState<ModelInputs>(structuredClone(DEFAULT_MODEL));
  const [initialized, setInitialized] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  if (!initialized && typeof window !== 'undefined') {
    const saved = loadModel();
    if (JSON.stringify(saved) !== JSON.stringify(model)) setModel(saved);
    setInitialized(true);
  }

  const resultBest: CalcResult = useMemo(
    () => calculate(model.global, model.yearly, model.opex, model.milestones_best),
    [model]
  );

  // Derive data updates to send to iframe
  const dataUpdates = useMemo(() => {
    const yrs = resultBest.years;
    const fmt = (v: number) => `¥${Math.round(v / 10000).toLocaleString()} 万`;
    const ebitdaYear = yrs.findIndex(y => y.ebitda > 0);
    return {
      'ebitda-positive': ebitdaYear >= 0 ? `第 ${ebitdaYear + 1} 年` : '未转正',
      'y5-revenue': fmt(yrs[4].total_revenue),
      'y2-revenue': fmt(yrs[1].total_revenue),
      'y3-revenue': fmt(yrs[2].total_revenue),
      'y4-revenue': fmt(yrs[3].total_revenue),
      'y5-revenue-detail': fmt(yrs[4].total_revenue),
      'y2-beds': `${yrs[1].cumulative_beds} 床`,
      'y3-beds': `${yrs[2].cumulative_beds} 床`,
      'y4-beds': `${yrs[3].cumulative_beds} 床`,
      'y5-beds': `${yrs[4].cumulative_beds} 床`,
    };
  }, [resultBest]);

  // Listen for messages from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'aria-pending-count') {
        setPendingCount(e.data.count);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Send data updates to iframe when ready
  useEffect(() => {
    if (!iframeReady || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: 'aria-data-update', updates: dataUpdates },
      '*'
    );
  }, [iframeReady, dataUpdates]);

  const handleAcceptAll = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'aria-accept-all' }, '*');
  };

  const handlePrint = () => {
    iframeRef.current?.contentWindow?.print();
  };

  const basePath = process.env.NODE_ENV === 'production' ? '/Finance-simulator' : '';

  return (
    <div className="fixed inset-0 bg-[#040812]">
      {/* Floating control bar — top-right corner */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <a
          href={`${basePath}/`}
          className="px-3 py-1.5 rounded-lg bg-black/60 border border-slate-600/50 text-slate-300 text-xs backdrop-blur-md hover:bg-black/80 transition-all"
        >
          ← 模拟器
        </a>
        <a
          href={`${basePath}/qa`}
          className="px-3 py-1.5 rounded-lg bg-black/60 border border-slate-600/50 text-slate-300 text-xs backdrop-blur-md hover:bg-black/80 transition-all"
        >
          📊 答疑
        </a>
        <a
          href={`${basePath}/bp-mapping`}
          className="px-3 py-1.5 rounded-lg bg-black/60 border border-slate-600/50 text-slate-300 text-xs backdrop-blur-md hover:bg-black/80 transition-all"
        >
          BP映射
        </a>
        {pendingCount > 0 && (
          <button
            onClick={handleAcceptAll}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-medium backdrop-blur-md hover:bg-amber-500/30 transition-all animate-pulse"
          >
            ✓ 接受全部更新 ({pendingCount})
          </button>
        )}
        <button
          onClick={handlePrint}
          className="px-3 py-1.5 rounded-lg bg-black/60 border border-slate-600/50 text-slate-300 text-xs backdrop-blur-md hover:bg-black/80 transition-all"
        >
          🖨 PDF
        </button>
      </div>

      {/* Full-viewport iframe — 1:1 roadshow.html */}
      <iframe
        ref={iframeRef}
        src={`${basePath}/roadshow-slides.html`}
        className="w-full h-full border-0"
        title="ARIA 路演稿"
        onLoad={() => setIframeReady(true)}
      />
    </div>
  );
}
