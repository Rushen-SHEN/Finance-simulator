// Storage with named profile support
import { ModelInputs } from './calculator';
import { DEFAULT_MODEL } from './defaults';

const KEY_ACTIVE = 'aria-model-v3';
const KEY_PROFILES = 'aria-profiles-v3';

export interface ProfileEntry {
  name: string;
  timestamp: number;
  data: ModelInputs;
}

export function loadModel(): ModelInputs {
  if (typeof window === 'undefined') return structuredClone(DEFAULT_MODEL);
  try {
    const raw = localStorage.getItem(KEY_ACTIVE);
    if (!raw) return structuredClone(DEFAULT_MODEL);
    const parsed = JSON.parse(raw) as Partial<ModelInputs>;
    return mergeWithDefaults(parsed);
  } catch {
    return structuredClone(DEFAULT_MODEL);
  }
}

export function saveModel(m: ModelInputs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY_ACTIVE, JSON.stringify(m));
  } catch { /* ignore */ }
}

export function clearModel() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY_ACTIVE);
}

// ---- Profile Management ----

export function listProfiles(): ProfileEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY_PROFILES);
    if (!raw) return [];
    return JSON.parse(raw) as ProfileEntry[];
  } catch {
    return [];
  }
}

export function saveProfile(name: string, data: ModelInputs) {
  if (typeof window === 'undefined') return;
  const profiles = listProfiles();
  const existing = profiles.findIndex(p => p.name === name);
  const entry: ProfileEntry = { name, timestamp: Date.now(), data: structuredClone(data) };
  if (existing >= 0) {
    profiles[existing] = entry;
  } else {
    profiles.push(entry);
  }
  try {
    localStorage.setItem(KEY_PROFILES, JSON.stringify(profiles));
  } catch { /* ignore */ }
}

export function loadProfile(name: string): ModelInputs | null {
  const profiles = listProfiles();
  const found = profiles.find(p => p.name === name);
  if (!found) return null;
  return mergeWithDefaults(found.data);
}

export function deleteProfile(name: string) {
  if (typeof window === 'undefined') return;
  const profiles = listProfiles().filter(p => p.name !== name);
  try {
    localStorage.setItem(KEY_PROFILES, JSON.stringify(profiles));
  } catch { /* ignore */ }
}

function mergeWithDefaults(partial: Partial<ModelInputs>): ModelInputs {
  const d = structuredClone(DEFAULT_MODEL);
  return {
    global: { ...d.global, ...(partial.global || {}) },
    yearly: {
      direct_c2: partial.yearly?.direct_c2 || [...d.yearly.direct_c2],
      direct_c3: partial.yearly?.direct_c3 || [...d.yearly.direct_c3],
      baxter_c2: partial.yearly?.baxter_c2 || [...d.yearly.baxter_c2],
      baxter_c3: partial.yearly?.baxter_c3 || [...d.yearly.baxter_c3],
      planned_upgrade: partial.yearly?.planned_upgrade || [...d.yearly.planned_upgrade],
      depreciation: partial.yearly?.depreciation || [...d.yearly.depreciation],
      baxter_license: partial.yearly?.baxter_license || [...d.yearly.baxter_license],
    },
    opex: {
      salary: partial.opex?.salary || [...d.opex.salary],
      cdmo_nre: partial.opex?.cdmo_nre || [...d.opex.cdmo_nre],
      pilot_bom: partial.opex?.pilot_bom || [...d.opex.pilot_bom],
      cro: partial.opex?.cro || [...d.opex.cro],
      reg: partial.opex?.reg || [...d.opex.reg],
      compliance: partial.opex?.compliance || [...d.opex.compliance],
      patent_ai: partial.opex?.patent_ai || [...d.opex.patent_ai],
      travel_ops: partial.opex?.travel_ops || [...d.opex.travel_ops],
    },
    funding: { ...d.funding, ...(partial.funding || {}) },
    milestones: partial.milestones || [...d.milestones.map(m => ({ ...m }))],
    annotations: { ...d.annotations, ...(partial.annotations || {}) },
  };
}
