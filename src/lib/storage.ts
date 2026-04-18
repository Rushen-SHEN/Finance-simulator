'use client';

import { GlobalInputs, YearlyInputs } from './calculator';
import { DEFAULT_GLOBAL, DEFAULT_YEARLY } from './defaults';

const STORAGE_KEY = 'aria-model-inputs';

interface StoredInputs {
  global: GlobalInputs;
  yearly: YearlyInputs;
}

export function loadInputs(): StoredInputs {
  if (typeof window === 'undefined') {
    return { global: { ...DEFAULT_GLOBAL }, yearly: structuredClone(DEFAULT_YEARLY) };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredInputs;
      return {
        global: { ...DEFAULT_GLOBAL, ...parsed.global },
        yearly: {
          new_c2_beds: parsed.yearly?.new_c2_beds || [...DEFAULT_YEARLY.new_c2_beds],
          new_c3_beds: parsed.yearly?.new_c3_beds || [...DEFAULT_YEARLY.new_c3_beds],
          planned_upgrade: parsed.yearly?.planned_upgrade || [...DEFAULT_YEARLY.planned_upgrade],
          opex: parsed.yearly?.opex || [...DEFAULT_YEARLY.opex],
          depreciation: parsed.yearly?.depreciation || [...DEFAULT_YEARLY.depreciation],
        },
      };
    }
  } catch {
    // ignore parse errors
  }
  return { global: { ...DEFAULT_GLOBAL }, yearly: structuredClone(DEFAULT_YEARLY) };
}

export function saveInputs(global: GlobalInputs, yearly: YearlyInputs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ global, yearly }));
}

export function clearInputs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
