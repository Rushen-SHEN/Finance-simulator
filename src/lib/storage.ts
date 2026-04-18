// Persist user-modified inputs to localStorage
import { GlobalInputs, YearlyInputs } from './calculator';
import { DEFAULT_GLOBAL, DEFAULT_YEARLY } from './defaults';

const KEY = 'aria-model-inputs-v2';

export function loadInputs(): { global: GlobalInputs; yearly: YearlyInputs } {
  if (typeof window === 'undefined') return { global: DEFAULT_GLOBAL, yearly: structuredClone(DEFAULT_YEARLY) };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { global: DEFAULT_GLOBAL, yearly: structuredClone(DEFAULT_YEARLY) };
    const parsed = JSON.parse(raw);
    return {
      global: { ...DEFAULT_GLOBAL, ...parsed.global },
      yearly: {
        direct_c2: parsed.yearly?.direct_c2 || [...DEFAULT_YEARLY.direct_c2],
        direct_c3: parsed.yearly?.direct_c3 || [...DEFAULT_YEARLY.direct_c3],
        baxter_c2: parsed.yearly?.baxter_c2 || [...DEFAULT_YEARLY.baxter_c2],
        baxter_c3: parsed.yearly?.baxter_c3 || [...DEFAULT_YEARLY.baxter_c3],
        planned_upgrade: parsed.yearly?.planned_upgrade || [...DEFAULT_YEARLY.planned_upgrade],
        opex: parsed.yearly?.opex || [...DEFAULT_YEARLY.opex],
        depreciation: parsed.yearly?.depreciation || [...DEFAULT_YEARLY.depreciation],
        baxter_license: parsed.yearly?.baxter_license || [...DEFAULT_YEARLY.baxter_license],
      },
    };
  } catch {
    return { global: DEFAULT_GLOBAL, yearly: structuredClone(DEFAULT_YEARLY) };
  }
}

export function saveInputs(global: GlobalInputs, yearly: YearlyInputs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ global, yearly }));
  } catch { /* quota exceeded — ignore */ }
}

export function clearInputs() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
}
