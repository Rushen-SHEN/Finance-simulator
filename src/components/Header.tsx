'use client';

import Link from 'next/link';
import { useState } from 'react';

interface HeaderProps {
  scenario: string;
  onScenario: (s: string) => void;
  onToggleParams: () => void;
  onExportPDF?: () => Promise<void>;
  onExportPNG?: () => Promise<void>;
}

const scenarios = [
  { key: 'neutral', label: '中性', icon: '◆' },
  { key: 'optimistic', label: '乐观', icon: '▲' },
  { key: 'conservative', label: '保守', icon: '▼' },
  { key: 'delayed', label: '延迟', icon: '◇' },
];

export default function Header({ scenario, onScenario, onToggleParams, onExportPDF, onExportPNG }: HeaderProps) {
  const [exporting, setExporting] = useState<'pdf' | 'png' | null>(null);

  const handleExport = async (type: 'pdf' | 'png') => {
    const fn = type === 'pdf' ? onExportPDF : onExportPNG;
    if (!fn) return;
    setExporting(type);
    try { await fn(); } finally { setExporting(null); }
  };

  return (
    <div className="bg-gradient-to-r from-[#0B0F1A] via-[#111827] to-[#0B0F1A] border-b border-slate-700/50 sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black text-sm tracking-tighter">A</span>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0B0F1A] animate-pulse" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <b className="text-lg text-white tracking-wider font-black">ARIA</b>
              <span className="text-[11px] text-cyan-400 font-mono tracking-widest">v3.2</span>
            </div>
            <span className="text-[11px] text-slate-300 tracking-wide hidden sm:inline">ICU谵妄预警 · 财务模型模拟器</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-900/50 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
            >
              ARIA Dashboard
            </Link>
            <Link
              href="/parameters"
              className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-900/50 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all"
            >
              ARIA Parameters
            </Link>
          </div>

          <div className="flex rounded-lg overflow-hidden border border-slate-600 bg-slate-900/50 backdrop-blur-sm">
            {scenarios.map(s => (
              <button
                key={s.key}
                onClick={() => onScenario(s.key)}
                className={`px-2.5 sm:px-3.5 py-1.5 text-xs font-medium transition-all ${
                  scenario === s.key
                    ? 'bg-gradient-to-b from-cyan-500/20 to-cyan-600/10 text-cyan-300 shadow-inner shadow-cyan-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={onToggleParams}
            className="px-3 sm:px-3.5 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/5 text-cyan-300 text-xs font-medium hover:bg-cyan-500/15 hover:border-cyan-500/50 transition-all shadow-sm shadow-cyan-500/5"
          >
            ⚙ 参数
          </button>

          <div className="flex rounded-lg overflow-hidden border border-slate-600 bg-slate-900/50">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all disabled:opacity-40 border-r border-slate-600"
            >
              {exporting === 'pdf' ? '⏳' : '📄'} PDF
            </button>
            <button
              onClick={() => handleExport('png')}
              disabled={exporting !== null}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all disabled:opacity-40"
            >
              {exporting === 'png' ? '⏳' : '🖼️'} PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
