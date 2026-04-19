export type RoadshowThemeDensity = 'loose' | 'standard' | 'compact';

export type RoadshowThemeKey = 'aria' | 'industrial' | 'tech' | 'minimal' | 'sequoia';

export interface RoadshowThemeAdjustments {
  accentPrimary: string;
  accentSecondary: string;
  bgDepth: number;
  cardOpacity: number;
  borderStrength: number;
  shadowStrength: number;
  radius: number;
  titleWeight: number;
  gridStrength: number;
  glowStrength: number;
  density: RoadshowThemeDensity;
}

export interface RoadshowThemeBase {
  mode: 'dark' | 'light';
  backgroundStart: string;
  backgroundMid: string;
  backgroundEnd: string;
  backgroundGlowA: string;
  backgroundGlowB: string;
  backgroundGlowC: string;
  frameStart: string;
  frameEnd: string;
  frameGlowA: string;
  frameGlowB: string;
  panelBase: string;
  panelStrong: string;
  panelSoft: string;
  controlBase: string;
  strokeBase: string;
  strokeStrong: string;
  gridColor: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accentWarm: string;
  accentRose: string;
  accentSuccess: string;
  shadowColor: string;
}

export interface RoadshowThemePreset {
  key: RoadshowThemeKey;
  name: string;
  kind: 'baseline' | 'preset';
  readonly: boolean;
  description: string;
  keywords: string[];
  guidance: string[];
  defaults: RoadshowThemeAdjustments;
  base: RoadshowThemeBase;
}

export interface RoadshowThemeManifest {
  version: number;
  defaultTheme: RoadshowThemeKey;
  presets: RoadshowThemePreset[];
}

export interface RoadshowThemeState {
  version: number;
  activeTheme: RoadshowThemeKey;
  overrides: Partial<Record<RoadshowThemeKey, Partial<RoadshowThemeAdjustments>>>;
}

export const ROADSHOW_THEME_STORAGE_KEY = 'aria-roadshow-theme-state-v1';
export const ROADSHOW_THEME_FALLBACK: RoadshowThemeKey = 'aria';

type RangeControlKey = Exclude<keyof RoadshowThemeAdjustments, 'accentPrimary' | 'accentSecondary' | 'density'>;

export const ROADSHOW_THEME_RANGE_FIELDS: Array<{
  key: RangeControlKey;
  label: string;
  min: number;
  max: number;
}> = [
  { key: 'bgDepth', label: '背景深浅', min: 0, max: 100 },
  { key: 'cardOpacity', label: '卡片透明度', min: 0, max: 100 },
  { key: 'borderStrength', label: '边框强度', min: 0, max: 100 },
  { key: 'shadowStrength', label: '阴影强度', min: 0, max: 100 },
  { key: 'radius', label: '圆角大小', min: 0, max: 100 },
  { key: 'titleWeight', label: '标题字重', min: 0, max: 100 },
  { key: 'gridStrength', label: '页面网格强度', min: 0, max: 100 },
  { key: 'glowStrength', label: '光晕强度', min: 0, max: 100 },
];

export const ROADSHOW_THEME_DENSITY_OPTIONS: Array<{
  value: RoadshowThemeDensity;
  label: string;
  description: string;
}> = [
  { value: 'loose', label: '宽松', description: '更强调留白和呼吸感' },
  { value: 'standard', label: '标准', description: '兼顾信息量与舒适度' },
  { value: 'compact', label: '紧凑', description: '适合工程化和高密度展示' },
];

export function createDefaultRoadshowThemeState(defaultTheme: RoadshowThemeKey = ROADSHOW_THEME_FALLBACK): RoadshowThemeState {
  return {
    version: 1,
    activeTheme: defaultTheme,
    overrides: {},
  };
}

export function presetMap(manifest: RoadshowThemeManifest | null): Record<RoadshowThemeKey, RoadshowThemePreset> {
  const result = {} as Record<RoadshowThemeKey, RoadshowThemePreset>;
  manifest?.presets.forEach((preset) => {
    result[preset.key] = preset;
  });
  return result;
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

export function normalizeHexColor(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed
      .slice(1)
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
      .toLowerCase()}`;
  }
  return fallback;
}

function sanitizeAdjustments(raw: unknown, preset: RoadshowThemePreset): RoadshowThemeAdjustments {
  const source = typeof raw === 'object' && raw !== null ? raw as Partial<RoadshowThemeAdjustments> : {};
  const defaults = preset.defaults;

  return {
    accentPrimary: normalizeHexColor(source.accentPrimary, defaults.accentPrimary),
    accentSecondary: normalizeHexColor(source.accentSecondary, defaults.accentSecondary),
    bgDepth: clamp(source.bgDepth, 0, 100, defaults.bgDepth),
    cardOpacity: clamp(source.cardOpacity, 0, 100, defaults.cardOpacity),
    borderStrength: clamp(source.borderStrength, 0, 100, defaults.borderStrength),
    shadowStrength: clamp(source.shadowStrength, 0, 100, defaults.shadowStrength),
    radius: clamp(source.radius, 0, 100, defaults.radius),
    titleWeight: clamp(source.titleWeight, 0, 100, defaults.titleWeight),
    gridStrength: clamp(source.gridStrength, 0, 100, defaults.gridStrength),
    glowStrength: clamp(source.glowStrength, 0, 100, defaults.glowStrength),
    density: source.density === 'loose' || source.density === 'compact' ? source.density : defaults.density,
  };
}

export function sanitizeRoadshowThemeState(raw: unknown, manifest: RoadshowThemeManifest | null): RoadshowThemeState {
  if (!manifest) return createDefaultRoadshowThemeState();
  const presets = presetMap(manifest);
  if (typeof raw !== 'object' || raw === null) {
    return createDefaultRoadshowThemeState(manifest.defaultTheme || ROADSHOW_THEME_FALLBACK);
  }

  const source = raw as Partial<RoadshowThemeState>;
  const activeTheme =
    typeof source.activeTheme === 'string' && source.activeTheme in presets
      ? source.activeTheme as RoadshowThemeKey
      : manifest.defaultTheme || ROADSHOW_THEME_FALLBACK;

  const overrides: RoadshowThemeState['overrides'] = {};

  if (source.overrides && typeof source.overrides === 'object') {
    for (const key of Object.keys(source.overrides) as RoadshowThemeKey[]) {
      const preset = presets[key];
      if (!preset || preset.readonly) continue;
      overrides[key] = sanitizeAdjustments(source.overrides[key], preset);
    }
  }

  return {
    version: 1,
    activeTheme,
    overrides,
  };
}

export function resolveThemeAdjustments(
  manifest: RoadshowThemeManifest | null,
  state: RoadshowThemeState | null,
  themeKey: RoadshowThemeKey
) {
  const preset = manifest?.presets.find((item) => item.key === themeKey) ?? null;
  if (!preset) return null;
  if (preset.readonly) return sanitizeAdjustments(preset.defaults, preset);
  return sanitizeAdjustments(
    {
      ...preset.defaults,
      ...(state?.overrides?.[themeKey] ?? {}),
    },
    preset
  );
}

export function readRoadshowThemeState(manifest: RoadshowThemeManifest | null) {
  if (typeof window === 'undefined') return createDefaultRoadshowThemeState();
  try {
    const raw = window.localStorage.getItem(ROADSHOW_THEME_STORAGE_KEY);
    if (!raw) return createDefaultRoadshowThemeState(manifest?.defaultTheme || ROADSHOW_THEME_FALLBACK);
    return sanitizeRoadshowThemeState(JSON.parse(raw), manifest);
  } catch {
    return createDefaultRoadshowThemeState(manifest?.defaultTheme || ROADSHOW_THEME_FALLBACK);
  }
}

export function writeRoadshowThemeState(state: RoadshowThemeState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ROADSHOW_THEME_STORAGE_KEY, JSON.stringify(state));
}
