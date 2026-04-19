// Change detection: compare model snapshots → identify affected BP sections & roadshow pages
import { ModelInputs, GlobalInputs, PARAM_MAPPING, MAPPING_BLOCKS } from './calculator';

export interface ChangeGroup {
  group: string;          // parameter group name (e.g. 'pricing', 'deploy')
  label: string;          // human-readable label
  fields: string[];       // list of changed field names
}

export interface AffectedSection {
  mappingId: string;      // e.g. '§5→§1.5'
  label: string;          // e.g. '核心财务指标'
  bpSection: string;      // e.g. 'BP §1.5 / §9.2'
}

export interface ChangeReport {
  changedGroups: ChangeGroup[];
  affectedMappings: AffectedSection[];
  affectedRoadshowSlides: string[];   // slide descriptions
  hasChanges: boolean;
}

const GROUP_LABELS: Record<string, string> = {
  pricing: '定价参数',
  bom: 'BOM/COGS',
  channel: '渠道条款',
  deploy: '部署计划',
  opex: '运营费用',
  milestones: '里程碑',
  growth: '增长率',
  renewal: '续约参数',
  funding: '融资参数',
  sensitivity: '敏感性参数',
};

// Fields that belong to each parameter group
const PRICING_FIELDS: (keyof GlobalInputs)[] = ['price_hw_c2', 'price_hw_c3', 'price_upgrade', 'price_saas_c2', 'price_saas_c3', 'price_saas_c3_bulk', 'value_anchor_c2', 'value_anchor_c3'];
const BOM_FIELDS: (keyof GlobalInputs)[] = ['bom_sensor', 'bom_edge_compute', 'bom_housing', 'bom_cable_pcb', 'bom_assembly', 'bom_packaging', 'bom_c3_premium'];
const CHANNEL_FIELDS: (keyof GlobalInputs)[] = ['baxter_hw_commission', 'baxter_saas_commission'];
const RENEWAL_FIELDS: (keyof GlobalInputs)[] = ['rr_base'];
const GROWTH_FIELDS: (keyof GlobalInputs)[] = ['post_class3_growth', 'growth_y6', 'growth_y7', 'growth_y8', 'growth_y9', 'growth_y10'];
const SENSITIVITY_FIELDS: (keyof GlobalInputs)[] = ['sam_midpoint', 'sensitivity_bed_swing'];

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

/** Detect which parameter groups changed between two model snapshots. */
export function detectChanges(baseline: ModelInputs, current: ModelInputs): ChangeReport {
  const changedGroups: ChangeGroup[] = [];
  const bg = baseline.global;
  const cg = current.global;

  // Check global fields by group
  function checkGlobalGroup(group: string, fields: (keyof GlobalInputs)[]) {
    const changed = fields.filter(f => bg[f] !== cg[f]);
    if (changed.length > 0) {
      changedGroups.push({ group, label: GROUP_LABELS[group] || group, fields: changed });
    }
  }

  checkGlobalGroup('pricing', PRICING_FIELDS);
  checkGlobalGroup('bom', BOM_FIELDS);
  checkGlobalGroup('channel', CHANNEL_FIELDS);
  checkGlobalGroup('renewal', RENEWAL_FIELDS);
  checkGlobalGroup('growth', GROWTH_FIELDS);
  checkGlobalGroup('sensitivity', SENSITIVITY_FIELDS);

  // Check yearly deploy (Best Case)
  const deployFields: string[] = [];
  for (const key of Object.keys(baseline.yearly) as (keyof typeof baseline.yearly)[]) {
    if (!arraysEqual(baseline.yearly[key], current.yearly[key])) {
      deployFields.push(`yearly.${key}`);
    }
  }
  // Also check Base Case
  for (const key of Object.keys(baseline.yearly_base) as (keyof typeof baseline.yearly_base)[]) {
    if (!arraysEqual(baseline.yearly_base[key], current.yearly_base[key])) {
      deployFields.push(`yearly_base.${key}`);
    }
  }
  if (deployFields.length > 0) {
    changedGroups.push({ group: 'deploy', label: GROUP_LABELS.deploy, fields: deployFields });
  }

  // Check OpEx
  const opexFields: string[] = [];
  for (const key of Object.keys(baseline.opex) as (keyof typeof baseline.opex)[]) {
    if (!arraysEqual(baseline.opex[key], current.opex[key])) {
      opexFields.push(key);
    }
  }
  if (opexFields.length > 0) {
    changedGroups.push({ group: 'opex', label: GROUP_LABELS.opex, fields: opexFields });
  }

  // Check Funding
  const fundingFields: string[] = [];
  for (const key of Object.keys(baseline.funding) as (keyof typeof baseline.funding)[]) {
    if (baseline.funding[key] !== current.funding[key]) {
      fundingFields.push(key);
    }
  }
  if (fundingFields.length > 0) {
    changedGroups.push({ group: 'funding', label: GROUP_LABELS.funding, fields: fundingFields });
  }

  // Check Milestones
  const msChanged = JSON.stringify(baseline.milestones_best) !== JSON.stringify(current.milestones_best) ||
                     JSON.stringify(baseline.milestones_base) !== JSON.stringify(current.milestones_base);
  if (msChanged) {
    changedGroups.push({ group: 'milestones', label: GROUP_LABELS.milestones, fields: ['milestones'] });
  }

  // Compute affected mappings
  const groupNames = changedGroups.map(g => g.group);
  const affectedIds = new Set<string>();
  for (const gn of groupNames) {
    const ids = PARAM_MAPPING[gn];
    if (ids) ids.forEach(id => affectedIds.add(id));
  }
  const affectedMappings: AffectedSection[] = Array.from(affectedIds).map(id => {
    const block = MAPPING_BLOCKS.find(b => b.id === id);
    return {
      mappingId: id,
      label: block?.label || id,
      bpSection: block?.bpSection || '',
    };
  });

  // Determine affected roadshow slides
  const affectedRoadshowSlides: string[] = [];
  if (groupNames.some(g => ['pricing', 'bom', 'deploy', 'opex', 'growth'].includes(g))) {
    affectedRoadshowSlides.push('财务数据页 — 收入/EBITDA/毛利');
  }
  if (groupNames.some(g => ['deploy', 'milestones'].includes(g))) {
    affectedRoadshowSlides.push('里程碑时间线页');
  }
  if (groupNames.some(g => ['funding'].includes(g))) {
    affectedRoadshowSlides.push('融资规划页');
  }
  if (groupNames.some(g => ['channel', 'renewal'].includes(g))) {
    affectedRoadshowSlides.push('商业模式页 — 渠道/续约');
  }
  if (groupNames.some(g => ['sensitivity'].includes(g))) {
    affectedRoadshowSlides.push('敏感性分析页');
  }

  return {
    changedGroups,
    affectedMappings,
    affectedRoadshowSlides,
    hasChanges: changedGroups.length > 0,
  };
}
