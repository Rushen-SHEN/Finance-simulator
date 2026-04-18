'use client';

interface HeaderProps {
  scenario: string;
  onScenario: (s: string) => void;
  onToggleParams: () => void;
}

const scenarios = [
  { key: 'neutral', label: '📊 中性' },
  { key: 'optimistic', label: '📈 乐观' },
  { key: 'conservative', label: '📉 保守' },
  { key: 'delayed', label: '⏳ 延迟' },
];

export default function Header({ scenario, onScenario, onToggleParams }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-2.5">
          <b className="text-2xl text-blue-600 tracking-wide">ARIA</b>
          <span className="text-sm text-gray-500">谵妄预警智能系统 · 投资人路演版</span>
        </div>
        <div className="flex gap-1">
          {scenarios.map(s => (
            <button
              key={s.key}
              onClick={() => onScenario(s.key)}
              className={`px-4 py-1.5 rounded-full border text-xs cursor-pointer transition-colors ${
                scenario === s.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={onToggleParams}
          className="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 text-xs cursor-pointer hover:border-blue-600 hover:text-blue-600 transition-colors"
        >
          📐 参数面板
        </button>
      </div>
    </div>
  );
}
