// Storage with named profile support
import { ModelInputs, YearlyInputs } from './calculator';
import { DEFAULT_MODEL } from './defaults';

const KEY_ACTIVE = 'aria-model-v3';
const KEY_PROFILES = 'aria-profiles-v3';
const KEY_AUDIT = 'aria-audit-log';
const MAX_AUDIT_ENTRIES = 50;

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
  const mergeYearly = (src?: Partial<YearlyInputs>, def?: YearlyInputs): YearlyInputs => {
    const base = def || d.yearly;
    return {
      direct_c2: src?.direct_c2 || [...base.direct_c2],
      direct_c3: src?.direct_c3 || [...base.direct_c3],
      baxter_c2: src?.baxter_c2 || [...base.baxter_c2],
      baxter_c3: src?.baxter_c3 || [...base.baxter_c3],
      planned_upgrade: src?.planned_upgrade || [...base.planned_upgrade],
      depreciation: src?.depreciation || [...base.depreciation],
      baxter_license: src?.baxter_license || [...base.baxter_license],
    };
  };
  return {
    global: { ...d.global, ...(partial.global || {}) },
    yearly: mergeYearly(partial.yearly, d.yearly),
    yearly_base: mergeYearly(partial.yearly_base, d.yearly_base),
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
    milestones_best: partial.milestones_best || d.milestones_best.map(m => ({ ...m })),
    milestones_base: partial.milestones_base || d.milestones_base.map(m => ({ ...m })),
    annotations: { ...d.annotations, ...(partial.annotations || {}) },
    active_scenario: partial.active_scenario || d.active_scenario,
    active_timeline: partial.active_timeline || d.active_timeline,
    scenario_overrides: partial.scenario_overrides
      ? {
          neutral: { ...d.scenario_overrides.neutral, ...(partial.scenario_overrides.neutral || {}) },
          optimistic: { ...d.scenario_overrides.optimistic, ...(partial.scenario_overrides.optimistic || {}) },
          conservative: { ...d.scenario_overrides.conservative, ...(partial.scenario_overrides.conservative || {}) },
        }
      : structuredClone(d.scenario_overrides),
  };
}

// ============================================================
// Audit Log
// ============================================================

export interface AuditEntry {
  timestamp: string;
  tab: string;
  field: string;
  oldValue: string;
  newValue: string;
  affectedMappings: string[];
}

export function appendAuditEntry(entry: Omit<AuditEntry, 'timestamp'>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY_AUDIT);
    const log: AuditEntry[] = raw ? JSON.parse(raw) : [];
    log.unshift({ ...entry, timestamp: new Date().toISOString() });
    if (log.length > MAX_AUDIT_ENTRIES) log.length = MAX_AUDIT_ENTRIES;
    localStorage.setItem(KEY_AUDIT, JSON.stringify(log));
  } catch { /* ignore */ }
}

export function loadAuditLog(): AuditEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY_AUDIT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
