(function () {
  var STORAGE_KEY = 'aria-roadshow-theme-state-v1';
  var FALLBACK_THEME = 'aria';
  var manifestPromise = null;
  var currentManifest = null;
  var currentState = null;

  function clamp(value, min, max, fallback) {
    var numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(max, Math.max(min, numeric));
  }

  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function normalizeHex(value, fallback) {
    if (typeof value !== 'string') return fallback;
    var trimmed = value.trim();
    if (/^#([0-9a-fA-F]{6})$/.test(trimmed)) return trimmed.toLowerCase();
    if (/^#([0-9a-fA-F]{3})$/.test(trimmed)) {
      return '#' + trimmed.slice(1).split('').map(function (char) { return char + char; }).join('').toLowerCase();
    }
    return fallback;
  }

  function parseColor(input) {
    if (typeof input !== 'string') return null;
    var value = input.trim();
    if (!value) return null;
    if (value[0] === '#') {
      var hex = normalizeHex(value, null);
      if (!hex) return null;
      return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16),
        a: 1
      };
    }
    var rgbaMatch = value.match(/^rgba?\(([^)]+)\)$/i);
    if (!rgbaMatch) return null;
    var parts = rgbaMatch[1].split(',').map(function (part) { return part.trim(); });
    if (parts.length < 3) return null;
    var r = clamp(parts[0], 0, 255, 0);
    var g = clamp(parts[1], 0, 255, 0);
    var b = clamp(parts[2], 0, 255, 0);
    var a = parts[3] == null ? 1 : clamp(parts[3], 0, 1, 1);
    return { r: r, g: g, b: b, a: a };
  }

  function rgbaString(color, alphaOverride) {
    if (!color) return 'rgba(0, 0, 0, 0)';
    var alpha = alphaOverride == null ? color.a : alphaOverride;
    return 'rgba(' + Math.round(color.r) + ', ' + Math.round(color.g) + ', ' + Math.round(color.b) + ', ' + alpha.toFixed(3) + ')';
  }

  function mixColors(a, b, ratio) {
    var baseA = parseColor(a);
    var baseB = parseColor(b);
    if (!baseA || !baseB) return a;
    var t = clamp(ratio, 0, 1, 0);
    return rgbaString({
      r: baseA.r + (baseB.r - baseA.r) * t,
      g: baseA.g + (baseB.g - baseA.g) * t,
      b: baseA.b + (baseB.b - baseA.b) * t,
      a: baseA.a + (baseB.a - baseA.a) * t
    });
  }

  function tintColor(color, mode, amount) {
    if (!amount) return color;
    return mixColors(color, mode === 'dark' ? '#000000' : '#ffffff', clamp(amount, 0, 1, 0));
  }

  function shiftDepth(color, mode, depthRatio) {
    if (depthRatio === 0) return color;
    if (mode === 'dark') {
      return depthRatio > 0
        ? mixColors(color, '#000000', Math.min(depthRatio * 0.65, 0.42))
        : mixColors(color, '#f8fafc', Math.min(Math.abs(depthRatio) * 0.24, 0.18));
    }
    return depthRatio > 0
      ? mixColors(color, '#111827', Math.min(depthRatio * 0.22, 0.16))
      : mixColors(color, '#ffffff', Math.min(Math.abs(depthRatio) * 0.48, 0.32));
  }

  function applyAlpha(color, multiplier, fallbackAlpha) {
    var parsed = parseColor(color);
    if (!parsed) return color;
    var baseAlpha = parsed.a == null ? fallbackAlpha : parsed.a;
    return rgbaString(parsed, Math.min(1, Math.max(0, baseAlpha * multiplier)));
  }

  function toThemeMap(manifest) {
    return (manifest && Array.isArray(manifest.presets) ? manifest.presets : []).reduce(function (acc, preset) {
      if (preset && preset.key) acc[preset.key] = preset;
      return acc;
    }, {});
  }

  function createFallbackState() {
    return { version: 1, activeTheme: FALLBACK_THEME, overrides: {} };
  }

  function sanitizeAdjustments(raw, preset) {
    if (!isPlainObject(raw)) return {};
    var defaults = preset.defaults || {};
    return {
      accentPrimary: normalizeHex(raw.accentPrimary, defaults.accentPrimary),
      accentSecondary: normalizeHex(raw.accentSecondary, defaults.accentSecondary),
      bgDepth: clamp(raw.bgDepth, 0, 100, defaults.bgDepth),
      cardOpacity: clamp(raw.cardOpacity, 0, 100, defaults.cardOpacity),
      borderStrength: clamp(raw.borderStrength, 0, 100, defaults.borderStrength),
      shadowStrength: clamp(raw.shadowStrength, 0, 100, defaults.shadowStrength),
      radius: clamp(raw.radius, 0, 100, defaults.radius),
      titleWeight: clamp(raw.titleWeight, 0, 100, defaults.titleWeight),
      gridStrength: clamp(raw.gridStrength, 0, 100, defaults.gridStrength),
      glowStrength: clamp(raw.glowStrength, 0, 100, defaults.glowStrength),
      density: raw.density === 'loose' || raw.density === 'compact' ? raw.density : defaults.density
    };
  }

  function sanitizeState(raw, manifest) {
    var presets = toThemeMap(manifest);
    if (!presets[FALLBACK_THEME]) return createFallbackState();
    if (!isPlainObject(raw)) return createFallbackState();
    var activeTheme = typeof raw.activeTheme === 'string' && presets[raw.activeTheme] ? raw.activeTheme : FALLBACK_THEME;
    var overrides = {};
    if (isPlainObject(raw.overrides)) {
      Object.keys(raw.overrides).forEach(function (key) {
        var preset = presets[key];
        if (!preset || preset.readonly) return;
        overrides[key] = sanitizeAdjustments(raw.overrides[key], preset);
      });
    }
    return {
      version: 1,
      activeTheme: activeTheme,
      overrides: overrides
    };
  }

  function resolveAdjustments(state, preset) {
    if (!preset) return null;
    if (preset.readonly) return sanitizeAdjustments(preset.defaults, preset);
    var override = state && state.overrides ? state.overrides[preset.key] : null;
    return sanitizeAdjustments(Object.assign({}, preset.defaults, override || {}), preset);
  }

  function setVar(name, value) {
    document.documentElement.style.setProperty(name, value);
  }

  function computeVariables(preset, adjustments) {
    var base = preset.base || {};
    var defaults = preset.defaults || adjustments;
    var mode = base.mode === 'light' ? 'light' : 'dark';
    var depthRatio = ((adjustments.bgDepth - defaults.bgDepth) || 0) / 100;
    var cardMultiplier = clamp(adjustments.cardOpacity / 100, 0.25, 1.2, 1);
    var borderMultiplier = clamp(adjustments.borderStrength / 100, 0.12, 1.1, 1);
    var glowMultiplier = clamp(adjustments.glowStrength / 100, 0, 1.2, 0.4);
    var gridMultiplier = clamp(adjustments.gridStrength / 100, 0, 1.1, 0.48);
    var shadowMultiplier = clamp(adjustments.shadowStrength / 100, 0, 1.2, 0.78);
    var radiusRatio = clamp(adjustments.radius / 100, 0, 1, defaults.radius / 100);
    var densityScale = adjustments.density === 'loose' ? 1.08 : adjustments.density === 'compact' ? 0.93 : 1;
    var titleWeight = Math.round(580 + adjustments.titleWeight * 3.1);

    var accentPrimary = adjustments.accentPrimary;
    var accentSecondary = adjustments.accentSecondary;
    var accentWarm = base.accentWarm || accentPrimary;
    var accentRose = base.accentRose || accentSecondary;
    var accentSuccess = base.accentSuccess || accentSecondary;

    var backgroundStart = shiftDepth(base.backgroundStart, mode, depthRatio);
    var backgroundMid = shiftDepth(base.backgroundMid, mode, depthRatio * 0.85);
    var backgroundEnd = shiftDepth(base.backgroundEnd, mode, depthRatio * 1.05);
    var frameStart = shiftDepth(base.frameStart, mode, depthRatio * 0.7);
    var frameEnd = shiftDepth(base.frameEnd, mode, depthRatio * 0.8);
    var panelBase = applyAlpha(tintColor(base.panelBase, mode, depthRatio * 0.8), cardMultiplier, 0.84);
    var panelStrong = applyAlpha(tintColor(base.panelStrong, mode, depthRatio * 0.6), cardMultiplier, 0.94);
    var panelSoft = applyAlpha(base.panelSoft, cardMultiplier, 0.03);
    var controlBase = applyAlpha(tintColor(base.controlBase, mode, depthRatio * 0.35), cardMultiplier, 0.72);
    var stroke = applyAlpha(base.strokeBase, borderMultiplier, 0.18);
    var strokeSoft = applyAlpha(base.strokeBase, borderMultiplier * 0.66, 0.12);
    var strokeSubtle = applyAlpha(base.strokeBase, borderMultiplier * 0.44, 0.08);
    var strokeStrong = applyAlpha(base.strokeStrong, borderMultiplier, 0.32);
    var gridLine = applyAlpha(base.gridColor, gridMultiplier, 0.045);
    var bodyGlowA = applyAlpha(base.backgroundGlowA, glowMultiplier, 0.1);
    var bodyGlowB = applyAlpha(base.backgroundGlowB, glowMultiplier, 0.12);
    var bodyGlowC = applyAlpha(base.backgroundGlowC, glowMultiplier * 0.92, 0.08);
    var frameGlowA = applyAlpha(base.frameGlowA, glowMultiplier, 0.1);
    var frameGlowB = applyAlpha(base.frameGlowB, glowMultiplier, 0.12);
    var shadowColor = parseColor(base.shadowColor || (mode === 'light' ? 'rgba(31,41,55,0.08)' : 'rgba(0,0,0,0.48)'));
    var shadowAlpha = clamp((shadowColor ? shadowColor.a : 0.48) * shadowMultiplier, 0.04, 0.72, 0.48);
    var shadowBlur = Math.round(48 + shadowMultiplier * 52);
    var shadowSpread = Math.round(14 + shadowMultiplier * 18);
    var frameRadius = Math.round(18 + radiusRatio * 14);
    var radiusLg = Math.round(14 + radiusRatio * 14);
    var radiusMd = Math.round(10 + radiusRatio * 10);
    var radiusSm = Math.round(8 + radiusRatio * 8);
    var padX = Math.round(38 * densityScale);
    var padY = Math.round(34 * densityScale);
    var padBottom = Math.round(32 * densityScale);
    var sectionGap = Math.round(18 * densityScale);
    var gridGap = Math.round(16 * densityScale);

    return {
      mode: mode,
      bodyBg: 'linear-gradient(180deg, ' + backgroundStart + ' 0%, ' + backgroundMid + ' 42%, ' + backgroundEnd + ' 100%)',
      bodyGlowA: bodyGlowA,
      bodyGlowB: bodyGlowB,
      bodyGlowC: bodyGlowC,
      gridLine: gridLine,
      gridOpacity: String(clamp(gridMultiplier, 0, 1.2, 0.48)),
      frameBg: 'linear-gradient(180deg, ' + frameStart + ' 0%, ' + frameEnd + ' 100%)',
      frameGlowA: frameGlowA,
      frameGlowB: frameGlowB,
      frameBorder: stroke,
      frameInnerBorder: strokeSubtle,
      frameGrid: applyAlpha(base.gridColor, gridMultiplier * 0.9, 0.045),
      frameShadow: '0 24px ' + shadowBlur + 'px ' + rgbaString(shadowColor, shadowAlpha) + ', 0 10px ' + shadowSpread + 'px rgba(0, 0, 0, ' + (mode === 'light' ? '0.03' : '0.12') + ')',
      controlBg: controlBase,
      controlBgStrong: applyAlpha(controlBase, mode === 'light' ? 1.04 : 1.12, 0.88),
      controlBorder: strokeSoft,
      surfaceBg: panelBase,
      surfaceStrong: panelStrong,
      surfaceSoft: panelSoft,
      surfaceSubtle: applyAlpha(base.panelSoft || base.panelBase, cardMultiplier * 0.82, 0.025),
      surfaceAccent: applyAlpha(accentPrimary, mode === 'light' ? 0.08 : 0.06, 0.06),
      surfaceHighlight: applyAlpha(accentPrimary, 0.55 + glowMultiplier * 0.2, 0.55),
      surfaceSuccessBorder: applyAlpha(base.accentSuccess || accentSuccess, borderMultiplier * 0.54, 0.26),
      surfaceSuccessBg: 'linear-gradient(180deg, ' + applyAlpha(base.accentSuccess || accentSuccess, 0.12 + glowMultiplier * 0.06, 0.08) + ', ' + panelSoft + ')',
      stroke: stroke,
      strokeSoft: strokeSoft,
      strokeSubtle: strokeSubtle,
      strokeStrong: strokeStrong,
      titleWeight: String(titleWeight),
      frameRadius: frameRadius + 'px',
      radiusLg: radiusLg + 'px',
      radiusMd: radiusMd + 'px',
      radiusSm: radiusSm + 'px',
      innerPadX: padX + 'px',
      innerPadY: padY + 'px',
      innerPadBottom: padBottom + 'px',
      sectionGap: sectionGap + 'px',
      gridGap: gridGap + 'px',
      densityScale: densityScale.toFixed(2),
      selection: applyAlpha(accentPrimary, mode === 'light' ? 0.16 : 0.22, 0.22),
      textPrimary: base.textPrimary,
      textSecondary: base.textSecondary,
      textTertiary: base.textTertiary,
      accentPrimary: accentPrimary,
      accentSecondary: accentSecondary,
      accentWarm: accentWarm,
      accentRose: accentRose,
      accentSuccess: accentSuccess
    };
  }

  function applyThemeState(state, manifest, shouldPersist) {
    var sanitized = sanitizeState(state, manifest);
    var presets = toThemeMap(manifest);
    var preset = presets[sanitized.activeTheme] || presets[FALLBACK_THEME];
    if (!preset) return createFallbackState();
    var adjustments = resolveAdjustments(sanitized, preset);
    var vars = computeVariables(preset, adjustments);

    document.body.dataset.theme = preset.key;
    document.body.dataset.themeMode = vars.mode;

    setVar('--roadshow-text-primary', vars.textPrimary);
    setVar('--roadshow-text-secondary', vars.textSecondary);
    setVar('--roadshow-text-tertiary', vars.textTertiary);
    setVar('--roadshow-accent-primary', vars.accentPrimary);
    setVar('--roadshow-accent-secondary', vars.accentSecondary);
    setVar('--roadshow-accent-warm', vars.accentWarm);
    setVar('--roadshow-accent-rose', vars.accentRose);
    setVar('--roadshow-accent-success', vars.accentSuccess);
    setVar('--roadshow-body-bg', vars.bodyBg);
    setVar('--roadshow-body-glow-a', vars.bodyGlowA);
    setVar('--roadshow-body-glow-b', vars.bodyGlowB);
    setVar('--roadshow-body-glow-c', vars.bodyGlowC);
    setVar('--roadshow-grid-line', vars.gridLine);
    setVar('--roadshow-grid-opacity', vars.gridOpacity);
    setVar('--roadshow-frame-bg', vars.frameBg);
    setVar('--roadshow-frame-glow-a', vars.frameGlowA);
    setVar('--roadshow-frame-glow-b', vars.frameGlowB);
    setVar('--roadshow-frame-border', vars.frameBorder);
    setVar('--roadshow-frame-inner-border', vars.frameInnerBorder);
    setVar('--roadshow-frame-grid', vars.frameGrid);
    setVar('--roadshow-frame-shadow', vars.frameShadow);
    setVar('--roadshow-control-bg', vars.controlBg);
    setVar('--roadshow-control-bg-strong', vars.controlBgStrong);
    setVar('--roadshow-control-border', vars.controlBorder);
    setVar('--roadshow-surface-bg', vars.surfaceBg);
    setVar('--roadshow-surface-strong', vars.surfaceStrong);
    setVar('--roadshow-surface-soft', vars.surfaceSoft);
    setVar('--roadshow-surface-subtle', vars.surfaceSubtle);
    setVar('--roadshow-surface-accent', vars.surfaceAccent);
    setVar('--roadshow-surface-highlight', vars.surfaceHighlight);
    setVar('--roadshow-surface-success-border', vars.surfaceSuccessBorder);
    setVar('--roadshow-surface-success-bg', vars.surfaceSuccessBg);
    setVar('--roadshow-stroke', vars.stroke);
    setVar('--roadshow-stroke-soft', vars.strokeSoft);
    setVar('--roadshow-stroke-subtle', vars.strokeSubtle);
    setVar('--roadshow-stroke-strong', vars.strokeStrong);
    setVar('--roadshow-title-weight', vars.titleWeight);
    setVar('--roadshow-frame-radius', vars.frameRadius);
    setVar('--roadshow-radius-lg', vars.radiusLg);
    setVar('--roadshow-radius-md', vars.radiusMd);
    setVar('--roadshow-radius-sm', vars.radiusSm);
    setVar('--roadshow-inner-pad-x', vars.innerPadX);
    setVar('--roadshow-inner-pad-y', vars.innerPadY);
    setVar('--roadshow-inner-pad-bottom', vars.innerPadBottom);
    setVar('--roadshow-section-gap', vars.sectionGap);
    setVar('--roadshow-grid-gap', vars.gridGap);
    setVar('--roadshow-density-scale', vars.densityScale);
    setVar('--roadshow-selection', vars.selection);

    currentState = sanitized;
    if (shouldPersist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      } catch (error) {
        console.warn('roadshow theme persistence failed', error);
      }
    }
    window.parent && window.parent.postMessage({ type: 'aria-theme-state', state: sanitized }, '*');
    window.dispatchEvent(new CustomEvent('aria-roadshow-theme-change', { detail: { preset: preset, state: sanitized } }));
    return sanitized;
  }

  function getStoredState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createFallbackState();
      return JSON.parse(raw);
    } catch (error) {
      return createFallbackState();
    }
  }

  function loadManifest() {
    if (!manifestPromise) {
      manifestPromise = fetch('./roadshow-theme-presets.json', { cache: 'no-store' })
        .then(function (response) { return response.json(); })
        .then(function (manifest) {
          currentManifest = manifest;
          return manifest;
        })
        .catch(function (error) {
          console.warn('roadshow theme manifest failed', error);
          throw error;
        });
    }
    return manifestPromise;
  }

  function initThemeEngine() {
    loadManifest()
      .then(function (manifest) {
        var sanitized = applyThemeState(getStoredState(), manifest, true);
        window.parent && window.parent.postMessage({ type: 'aria-theme-engine-ready', state: sanitized }, '*');
      })
      .catch(function () {
        currentState = createFallbackState();
      });
  }

  window.addEventListener('message', function (event) {
    if (!event.data || !event.data.type) return;
    if (event.data.type === 'aria-theme-sync') {
      loadManifest()
        .then(function (manifest) {
          applyThemeState(event.data.state, manifest, true);
        })
        .catch(function () {});
    }
    if (event.data.type === 'aria-theme-request-state') {
      if (currentState) {
        window.parent && window.parent.postMessage({ type: 'aria-theme-state', state: currentState }, '*');
      }
    }
  });

  window.ARIARoadshowTheme = {
    getState: function () { return currentState || createFallbackState(); },
    getManifest: function () { return currentManifest; },
    apply: function (state) {
      if (!currentManifest) return createFallbackState();
      return applyThemeState(state, currentManifest, true);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeEngine, { once: true });
  } else {
    initThemeEngine();
  }
})();
