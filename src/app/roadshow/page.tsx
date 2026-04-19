'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { CalcResult, ModelInputs, calculate } from '@/lib/calculator';
import { DEFAULT_MODEL } from '@/lib/defaults';
import {
  createDefaultRoadshowThemeState,
  presetMap,
  readRoadshowThemeState,
  resolveThemeAdjustments,
  ROADSHOW_THEME_DENSITY_OPTIONS,
  ROADSHOW_THEME_FALLBACK,
  ROADSHOW_THEME_RANGE_FIELDS,
  RoadshowThemeAdjustments,
  RoadshowThemeDensity,
  RoadshowThemeKey,
  RoadshowThemeManifest,
  RoadshowThemePreset,
  RoadshowThemeState,
  sanitizeRoadshowThemeState,
  writeRoadshowThemeState,
} from '@/lib/roadshow-theme';
import { loadModel } from '@/lib/storage';
import { extractRoadshowUpdates } from '@/lib/docGenerator';

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/Finance-simulator' : '';

const ARIA_FALLBACK_MANIFEST: RoadshowThemeManifest = {
  version: 1,
  defaultTheme: ROADSHOW_THEME_FALLBACK,
  presets: [
    {
      key: 'aria',
      name: 'ARIA',
      kind: 'baseline',
      readonly: true,
      description:
        '当前现有路演界面的原始主题。用于保留 ARIA 项目当前演示风格，确保在新增主题功能后仍可随时回退到稳定版本。',
      keywords: ['基线主题', '默认主题', '稳定回退', '原始 ARIA'],
      guidance: [
        '这是当前基线主题',
        '建议保留作为稳定版本',
        '如需实验，请切换到其他主题或复制当前参数后再调整',
      ],
      defaults: {
        accentPrimary: '#55d5ff',
        accentSecondary: '#3df0d1',
        bgDepth: 78,
        cardOpacity: 84,
        borderStrength: 58,
        shadowStrength: 78,
        radius: 78,
        titleWeight: 84,
        gridStrength: 48,
        glowStrength: 36,
        density: 'standard',
      },
      base: {
        mode: 'dark',
        backgroundStart: '#03070f',
        backgroundMid: '#06101d',
        backgroundEnd: '#040811',
        backgroundGlowA: 'rgba(61, 240, 209, 0.10)',
        backgroundGlowB: 'rgba(85, 213, 255, 0.12)',
        backgroundGlowC: 'rgba(110, 162, 255, 0.08)',
        frameStart: 'rgba(7, 15, 29, 0.98)',
        frameEnd: 'rgba(5, 10, 20, 0.98)',
        frameGlowA: 'rgba(61, 240, 209, 0.10)',
        frameGlowB: 'rgba(85, 213, 255, 0.12)',
        panelBase: 'rgba(10, 21, 39, 0.84)',
        panelStrong: 'rgba(9, 19, 36, 0.94)',
        panelSoft: 'rgba(255, 255, 255, 0.03)',
        controlBase: 'rgba(5, 12, 24, 0.72)',
        strokeBase: 'rgba(130, 188, 255, 0.18)',
        strokeStrong: 'rgba(130, 208, 255, 0.32)',
        gridColor: 'rgba(101, 165, 255, 0.045)',
        textPrimary: '#e9f1ff',
        textSecondary: '#9db0c9',
        textTertiary: '#7590b2',
        accentWarm: '#ffbf66',
        accentRose: '#ff8a94',
        accentSuccess: '#56e39f',
        shadowColor: 'rgba(0, 0, 0, 0.48)',
      },
    },
  ],
};

function themeStatePreview(
  activeTheme: RoadshowThemeKey,
  preset: RoadshowThemePreset | null,
  adjustments: RoadshowThemeAdjustments | null
) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    activeTheme,
    themeName: preset?.name ?? activeTheme,
    readonly: preset?.readonly ?? false,
    adjustments,
  };
}

function createDownload(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function RoadshowPage() {
  const [model] = useState<ModelInputs>(() => {
    if (typeof window === 'undefined') return structuredClone(DEFAULT_MODEL);
    return loadModel();
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [iframeReady, setIframeReady] = useState(false);
  const [themeManifest, setThemeManifest] = useState<RoadshowThemeManifest | null>(null);
  const [themeState, setThemeState] = useState<RoadshowThemeState>(createDefaultRoadshowThemeState());
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [definitionOpen, setDefinitionOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadManifest() {
      try {
        const response = await fetch(`${BASE_PATH}/roadshow-theme-presets.json`, { cache: 'no-store' });
        const manifest = await response.json() as RoadshowThemeManifest;
        if (cancelled) return;
        setThemeManifest(manifest);
        setThemeState(readRoadshowThemeState(manifest));
      } catch {
        if (cancelled) return;
        setThemeManifest(ARIA_FALLBACK_MANIFEST);
        setThemeState(createDefaultRoadshowThemeState('aria'));
        setFeedback('主题配置加载失败，已安全回退到 ARIA。');
      }
    }

    loadManifest();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 2400);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'aria-pending-count') {
        setPendingCount(event.data.count);
      }

      if (!themeManifest) return;

      if (event.data?.type === 'aria-theme-engine-ready' || event.data?.type === 'aria-theme-state') {
        const nextState = sanitizeRoadshowThemeState(event.data.state, themeManifest);
        setThemeState(nextState);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [themeManifest]);

  useEffect(() => {
    if (!themeManifest) return;
    writeRoadshowThemeState(themeState);

    if (!iframeReady || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage({ type: 'aria-theme-sync', state: themeState }, '*');
  }, [iframeReady, themeManifest, themeState]);

  const resultBest: CalcResult = useMemo(
    () => calculate(model.global, model.yearly, model.opex, model.milestones_best),
    [model]
  );

  // Derive data updates to send to iframe (using shared generator)
  const dataUpdates = useMemo(() => extractRoadshowUpdates(model, resultBest), [model, resultBest]);

  useEffect(() => {
    if (!iframeReady || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage({ type: 'aria-data-update', updates: dataUpdates }, '*');
  }, [dataUpdates, iframeReady]);

  const presets = useMemo(() => presetMap(themeManifest), [themeManifest]);
  const activePreset = presets[themeState.activeTheme] ?? null;
  const activeAdjustments = useMemo(
    () => resolveThemeAdjustments(themeManifest, themeState, themeState.activeTheme),
    [themeManifest, themeState]
  );
  const currentAccent = activeAdjustments?.accentPrimary ?? '#55d5ff';
  const currentAccentSoft = `${currentAccent}22`;
  const currentSecondary = activeAdjustments?.accentSecondary ?? '#3df0d1';

  const handleAcceptAll = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: 'aria-accept-all' }, '*');
  };

  const handlePrint = () => {
    const url = `${BASE_PATH}/roadshow-slides.html`;
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    } else {
      // 弹窗被拦截时，回退：直接打印当前页
      window.print();
    }
  };

  const syncThemeState = (nextState: RoadshowThemeState) => {
    if (!themeManifest) return;
    const sanitized = sanitizeRoadshowThemeState(nextState, themeManifest);
    setThemeState(sanitized);
  };

  const updateTheme = (key: RoadshowThemeKey) => {
    syncThemeState({
      ...themeState,
      activeTheme: key,
    });
    setThemeMenuOpen(false);
    setDefinitionOpen(true);
  };

  const updateAdjustment = <K extends keyof RoadshowThemeAdjustments>(
    key: K,
    value: RoadshowThemeAdjustments[K]
  ) => {
    if (!themeManifest || !activePreset || activePreset.readonly || !activeAdjustments) return;

    syncThemeState({
      ...themeState,
      overrides: {
        ...themeState.overrides,
        [activePreset.key]: {
          ...activeAdjustments,
          [key]: value,
        },
      },
    });
  };

  const handleRestoreDefault = () => {
    if (!themeManifest) return;
    const overrides = { ...themeState.overrides };
    delete overrides[themeState.activeTheme];
    syncThemeState({
      ...themeState,
      overrides,
    });
    setFeedback(`${activePreset?.name ?? '当前主题'}已恢复默认。`);
  };

  const handleExport = () => {
    const payload = themeStatePreview(themeState.activeTheme, activePreset, activeAdjustments);
    createDownload(`roadshow-theme-${themeState.activeTheme}.json`, JSON.stringify(payload, null, 2));
    setFeedback('已导出当前主题配置。');
  };

  const handleCopy = async () => {
    const payload = themeStatePreview(themeState.activeTheme, activePreset, activeAdjustments);
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setFeedback('当前参数已复制到剪贴板。');
    } catch {
      setFeedback('复制失败，请改用“导出主题配置”。');
    }
  };

  const handleImportPayload = (payload: unknown) => {
    if (!themeManifest) return;

    const source = payload as
      | Partial<RoadshowThemeState>
      | {
          activeTheme?: RoadshowThemeKey;
          adjustments?: Partial<RoadshowThemeAdjustments>;
        };

    if (
      source &&
      typeof source === 'object' &&
      'adjustments' in source &&
      source.adjustments &&
      typeof source.adjustments === 'object'
    ) {
      const themeKey =
        typeof source.activeTheme === 'string' && source.activeTheme in presets
          ? source.activeTheme
          : themeState.activeTheme;

      const nextState = sanitizeRoadshowThemeState(
        {
          ...themeState,
          activeTheme: themeKey,
          overrides: {
            ...themeState.overrides,
            [themeKey]: source.adjustments,
          },
        },
        themeManifest
      );
      setThemeState(nextState);
      setDefinitionOpen(true);
      setFeedback('主题配置已导入。');
      return;
    }

    const nextState = sanitizeRoadshowThemeState(source, themeManifest);
    setThemeState(nextState);
    setDefinitionOpen(true);
    setFeedback('主题配置已导入。');
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      handleImportPayload(JSON.parse(text));
    } catch {
      setFeedback('导入失败，文件内容不是有效的主题 JSON。');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-[#040812] text-slate-100">
      <div className="fixed right-4 top-4 z-50 flex max-w-[min(720px,calc(100vw-24px))] flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-600/50 bg-black/55 p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setThemeMenuOpen((open) => !open)}
            className="rounded-xl border px-3 py-2 text-xs font-medium transition-all"
            style={{ borderColor: currentAccentSoft, color: currentAccent, backgroundColor: '#050d18cc' }}
          >
            主题
          </button>
          <button
            type="button"
            onClick={() => setDefinitionOpen(true)}
            className="rounded-xl border border-slate-500/50 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 transition-all hover:border-slate-400/70"
          >
            风格定义
          </button>
          <button
            type="button"
            onClick={handleRestoreDefault}
            className="rounded-xl border border-slate-500/50 bg-slate-950/80 px-3 py-2 text-xs text-slate-200 transition-all hover:border-slate-400/70"
          >
            恢复默认
          </button>
        </div>

        <a
          href={`${BASE_PATH}/`}
          className="rounded-xl border border-slate-600/50 bg-black/60 px-3 py-2 text-xs text-slate-300 backdrop-blur-md transition-all hover:bg-black/80"
        >
          ← 模拟器
        </a>
        <a
          href={`${BASE_PATH}/qa`}
          className="rounded-xl border border-slate-600/50 bg-black/60 px-3 py-2 text-xs text-slate-300 backdrop-blur-md transition-all hover:bg-black/80"
        >
          📊 答疑
        </a>
        <a
          href={`${BASE_PATH}/bp-mapping`}
          className="rounded-xl border border-slate-600/50 bg-black/60 px-3 py-2 text-xs text-slate-300 backdrop-blur-md transition-all hover:bg-black/80"
        >
          BP映射
        </a>
        {pendingCount > 0 && (
          <button
            type="button"
            onClick={handleAcceptAll}
            className="animate-pulse rounded-xl border border-amber-500/50 bg-amber-500/20 px-3 py-2 text-xs font-medium text-amber-300 backdrop-blur-md transition-all hover:bg-amber-500/30"
          >
            ✓ 接受全部更新 ({pendingCount})
          </button>
        )}
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-xl border border-slate-600/50 bg-black/60 px-3 py-2 text-xs text-slate-300 backdrop-blur-md transition-all hover:bg-black/80"
        >
          🖨 PDF
        </button>
      </div>

      {themeMenuOpen && (
        <div className="fixed right-4 top-[74px] z-50 w-[320px] rounded-[26px] border border-slate-600/45 bg-[#07111fcc] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.46)] backdrop-blur-2xl">
          <div className="mb-2 px-1">
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">主题预设</div>
            <div className="mt-1 text-sm text-slate-200">切换不会改写 ARIA 基线主题</div>
          </div>
          <div className="grid gap-2">
            {themeManifest?.presets.map((preset) => {
              const active = preset.key === themeState.activeTheme;
              const accent = resolveThemeAdjustments(themeManifest, themeState, preset.key)?.accentPrimary ?? '#55d5ff';
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => updateTheme(preset.key)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                    active ? 'shadow-[0_12px_30px_rgba(0,0,0,0.28)]' : 'border-slate-700/70 bg-slate-950/60 hover:border-slate-500/70'
                  }`}
                  style={{
                    borderColor: active ? `${accent}66` : undefined,
                    background: active ? `linear-gradient(135deg, ${accent}1e, rgba(7,17,31,0.92))` : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100">{preset.name}</span>
                    {preset.key === 'aria' && (
                      <>
                        <span className="rounded-full border border-slate-500/60 bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300">
                          默认
                        </span>
                        <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-200">
                          基线
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-slate-400">{preset.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {definitionOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/28 backdrop-blur-[2px]">
          <div className="h-full w-[min(380px,calc(100vw-24px))] overflow-y-auto border-l border-slate-700/60 bg-[#06101ddf] px-4 pb-8 pt-20 shadow-[-24px_0_64px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
            <div className="sticky top-0 z-10 mb-4 rounded-3xl border border-slate-700/60 bg-[#07111fe8] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-slate-400">风格定义</div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-100">当前主题：{activePreset?.name ?? 'ARIA'}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{activePreset?.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDefinitionOpen(false)}
                  className="rounded-xl border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 transition-all hover:border-slate-400/70"
                >
                  关闭
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {activePreset?.keywords.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border px-2.5 py-1 text-[11px]"
                    style={{ borderColor: `${currentAccent}40`, backgroundColor: `${currentAccent}12`, color: currentAccent }}
                  >
                    {item}
                  </span>
                ))}
              </div>

              {activePreset?.readonly && (
                <div className="mt-4 rounded-2xl border border-cyan-400/25 bg-cyan-500/8 p-3 text-sm leading-6 text-cyan-100">
                  {activePreset.guidance.map((item) => (
                    <div key={item}>• {item}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <section className="rounded-3xl border border-slate-700/50 bg-[#07111fcc] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.26em] text-slate-400">主题参数</div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3">
                    <div className="text-xs text-slate-400">主强调色</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border border-white/30" style={{ backgroundColor: currentAccent }} />
                      <span className="font-mono text-slate-100">{activeAdjustments?.accentPrimary}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3">
                    <div className="text-xs text-slate-400">次强调色</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border border-white/30" style={{ backgroundColor: currentSecondary }} />
                      <span className="font-mono text-slate-100">{activeAdjustments?.accentSecondary}</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3">
                    <div className="text-xs text-slate-400">信息密度</div>
                    <div className="mt-2 text-slate-100">
                      {ROADSHOW_THEME_DENSITY_OPTIONS.find((option) => option.value === activeAdjustments?.density)?.label ?? '标准'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-3">
                    <div className="text-xs text-slate-400">ARIA 保护</div>
                    <div className="mt-2 text-slate-100">{activePreset?.readonly ? '只读基线主题' : '当前主题可微调'}</div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-700/50 bg-[#07111fcc] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.26em] text-slate-400">微调控制</div>
                    <div className="mt-1 text-sm text-slate-300">调整后即时预览，并自动保存到本地。</div>
                  </div>
                  {activePreset?.readonly && (
                    <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1 text-[11px] text-cyan-100">
                      ARIA 只读
                    </span>
                  )}
                </div>

                <div className={`mt-4 space-y-4 ${activePreset?.readonly ? 'opacity-65' : ''}`}>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      ['accentPrimary', '主强调色'],
                      ['accentSecondary', '次强调色'],
                    ] as const).map(([key, label]) => (
                      <label key={key} className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-3">
                        <div className="text-xs text-slate-400">{label}</div>
                        <div className="mt-3 flex items-center gap-3">
                          <input
                            type="color"
                            value={activeAdjustments?.[key] ?? '#55d5ff'}
                            disabled={activePreset?.readonly}
                            onChange={(event) => updateAdjustment(key, event.target.value as RoadshowThemeAdjustments[typeof key])}
                            className="h-10 w-10 cursor-pointer rounded-xl border border-slate-600 bg-transparent disabled:cursor-not-allowed"
                          />
                          <div className="font-mono text-sm text-slate-100">{activeAdjustments?.[key]}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {ROADSHOW_THEME_RANGE_FIELDS.map((field) => (
                    <label key={field.key} className="block rounded-2xl border border-slate-700/60 bg-slate-950/55 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-100">{field.label}</span>
                        <span className="font-mono text-xs text-slate-400">{activeAdjustments?.[field.key] ?? 0}</span>
                      </div>
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        value={activeAdjustments?.[field.key] ?? field.min}
                        disabled={activePreset?.readonly}
                        onChange={(event) =>
                          updateAdjustment(field.key, Number(event.target.value) as RoadshowThemeAdjustments[typeof field.key])
                        }
                        className="mt-3 w-full accent-cyan-400 disabled:cursor-not-allowed"
                      />
                    </label>
                  ))}

                  <div className="rounded-2xl border border-slate-700/60 bg-slate-950/55 p-3">
                    <div className="text-sm text-slate-100">信息密度</div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {ROADSHOW_THEME_DENSITY_OPTIONS.map((option) => {
                        const active = activeAdjustments?.density === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            disabled={activePreset?.readonly}
                            onClick={() => updateAdjustment('density', option.value as RoadshowThemeDensity)}
                            className={`rounded-2xl border px-3 py-3 text-left transition-all ${
                              active ? 'text-white' : 'border-slate-700/60 bg-slate-950/50 text-slate-300'
                            } disabled:cursor-not-allowed`}
                            style={
                              active
                                ? {
                                    borderColor: `${currentAccent}55`,
                                    background: `linear-gradient(135deg, ${currentAccent}22, rgba(7,17,31,0.92))`,
                                  }
                                : undefined
                            }
                          >
                            <div className="text-sm font-medium">{option.label}</div>
                            <div className="mt-1 text-[11px] leading-5 text-slate-400">{option.description}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-700/50 bg-[#07111fcc] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.26em] text-slate-400">操作</div>
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    onClick={handleRestoreDefault}
                    className="rounded-2xl border border-slate-600/60 bg-slate-950/60 px-4 py-3 text-left text-sm text-slate-100 transition-all hover:border-slate-400/70"
                  >
                    恢复默认
                    <div className="mt-1 text-xs leading-5 text-slate-400">
                      仅恢复当前主题的默认参数，不切换主题类型。
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-2xl border border-slate-600/60 bg-slate-950/60 px-4 py-3 text-left text-sm text-slate-100 transition-all hover:border-slate-400/70"
                  >
                    复制当前参数
                    <div className="mt-1 text-xs leading-5 text-slate-400">
                      适合从 ARIA 派生实验配置，不会改写 ARIA 本体。
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={handleExport}
                    className="rounded-2xl border border-slate-600/60 bg-slate-950/60 px-4 py-3 text-left text-sm text-slate-100 transition-all hover:border-slate-400/70"
                  >
                    导出主题配置
                    <div className="mt-1 text-xs leading-5 text-slate-400">导出当前主题与参数的 JSON 快照。</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => importRef.current?.click()}
                    className="rounded-2xl border border-slate-600/60 bg-slate-950/60 px-4 py-3 text-left text-sm text-slate-100 transition-all hover:border-slate-400/70"
                  >
                    导入主题配置
                    <div className="mt-1 text-xs leading-5 text-slate-400">支持恢复已导出的主题参数。</div>
                  </button>
                  <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-slate-600/60 bg-black/70 px-4 py-2 text-xs text-slate-200 shadow-[0_16px_36px_rgba(0,0,0,0.34)] backdrop-blur-xl">
          {feedback}
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={`${BASE_PATH}/roadshow-slides.html`}
        className="h-full w-full border-0"
        title="ARIA 路演稿"
        onLoad={() => {
          setIframeReady(true);
          iframeRef.current?.contentWindow?.postMessage({ type: 'aria-theme-request-state' }, '*');
        }}
      />
    </div>
  );
}
