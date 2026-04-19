'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GlobalInputs, YearlyInputs, OpExDetail, FundingInputs, MilestoneItem, ModelInputs, CalcResult, resolveMilestones, PARAM_MAPPING, MAPPING_BLOCKS, validateModel, Scenario, Timeline, ScenarioOverrides, calculate, deriveLicenseArray } from '@/lib/calculator';
import { DEFAULT_MODEL, YEAR_LABELS, OPEX_LABELS, COGS_LABELS, DEFAULT_ANNOTATIONS, DEFAULT_SCENARIO_OVERRIDES } from '@/lib/defaults';
import { listProfiles, saveProfile, loadProfile, deleteProfile, ProfileEntry, saveModel } from '@/lib/storage';
import { ArchiveEntry, listArchives, deleteArchive, downloadFile } from '@/lib/archiveStore';

interface Props {
  model: ModelInputs;
  resultBest: CalcResult;
  resultBase: CalcResult;
  onModelChange: (m: ModelInputs) => void;
  onReset: () => void;
  onClose: () => void;
  archiveVersion?: number;  // increment to trigger archive refresh
}

type TabKey = 'pricing' | 'cogs' | 'deploy' | 'opex' | 'funding' | 'milestones' | 'projection' | 'notes' | 'profiles';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'pricing', label: '定价/渠道', icon: '💰' },
  { key: 'cogs', label: 'BOM/COGS', icon: '🔧' },
  { key: 'deploy', label: '部署/SOM', icon: '🏥' },
  { key: 'opex', label: 'OpEx', icon: '📊' },
  { key: 'funding', label: '融资', icon: '🏦' },
  { key: 'milestones', label: '里程碑', icon: '🎯' },
  { key: 'projection', label: '测算/ARR', icon: '📈' },
  { key: 'notes', label: '注释', icon: '📝' },
  { key: 'profiles', label: '存档', icon: '💾' },
];

const TAB_PARAM_GROUP: Partial<Record<TabKey, string>> = {
  pricing: 'pricing', cogs: 'bom', deploy: 'deploy', opex: 'opex',
  funding: 'funding', milestones: 'milestones', projection: 'growth',
};

export default function ParameterPanel({ model, resultBest, resultBase, onModelChange, onReset, onClose, archiveVersion }: Props) {
  const [tab, setTab] = useState<TabKey>('pricing');
  const [profiles, setProfiles] = useState<ProfileEntry[]>([]);
  const [profileName, setProfileName] = useState('');
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<number | null>(null);
  const [autoSaveCount, setAutoSaveCount] = useState(0);

  // Snapshot at panel open to detect dirty state
  const openSnapshotRef = useRef<string>(JSON.stringify(model));
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(JSON.stringify(model) !== openSnapshotRef.current);
  }, [model]);

  const [profilesLoaded, setProfilesLoaded] = useState(false);
  if (!profilesLoaded) {
    setProfiles(listProfiles());
    setProfilesLoaded(true);
  }

  // Archive sidebar state
  const [showArchive, setShowArchive] = useState(false);
  const [archives, setArchives] = useState<ArchiveEntry[]>([]);

  const refreshArchives = useCallback(async () => {
    try {
      const all = await listArchives();
      setArchives(all);
    } catch { /* ignore */ }
  }, []);

  // Load archives when sidebar opens or archiveVersion changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (showArchive) refreshArchives(); }, [showArchive, archiveVersion, refreshArchives]);

  // Auto-save every 60s when dirty
  useEffect(() => {
    const timer = setInterval(() => {
      if (JSON.stringify(model) !== openSnapshotRef.current) {
        saveModel(model);
        setLastAutoSave(Date.now());
        setAutoSaveCount(c => c + 1);
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [model]);

  // Close handler — show dialog if dirty, otherwise close directly
  const handleClose = useCallback(() => {
    if (isDirty) {
      setShowCloseDialog(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleCloseSave = useCallback(() => {
    saveModel(model);
    setShowCloseDialog(false);
    onClose();
  }, [model, onClose]);

  const handleCloseSaveAs = useCallback(() => {
    setShowCloseDialog(false);
    setTab('profiles');
  }, []);

  const handleCloseDiscard = useCallback(() => {
    setShowCloseDialog(false);
    onClose();
  }, [onClose]);

  const g = model.global;
  const y = model.yearly;
  const yb = model.yearly_base;
  const ox = model.opex;
  const f = model.funding;
  const activeScenario = model.active_scenario || 'neutral';
  const activeTimeline = model.active_timeline || 'aggressive';
  const so = model.scenario_overrides?.[activeScenario] || DEFAULT_SCENARIO_OVERRIDES[activeScenario];

  // Calculate results for current scenario + timeline combination
  const currentYearly = activeTimeline === 'aggressive' ? model.yearly : model.yearly_base;
  const currentMs = activeTimeline === 'aggressive' ? model.milestones_best : model.milestones_base;
  const scenarioResult = calculate(model.global, currentYearly, model.opex, currentMs, so);

  const setScenario = useCallback((s: Scenario) => {
    onModelChange({ ...model, active_scenario: s });
  }, [model, onModelChange]);

  const setTimeline = useCallback((t: Timeline) => {
    onModelChange({ ...model, active_timeline: t });
  }, [model, onModelChange]);

  const setSO = useCallback((key: keyof ScenarioOverrides, val: number) => {
    const nextOverrides = { ...model.scenario_overrides, [activeScenario]: { ...so, [key]: val } };
    onModelChange({ ...model, scenario_overrides: nextOverrides });
  }, [model, onModelChange, activeScenario, so]);

  const setG = useCallback((key: keyof GlobalInputs, val: number) => {
    onModelChange({ ...model, global: { ...model.global, [key]: val } });
  }, [model, onModelChange]);

  const setY = useCallback((key: keyof YearlyInputs, idx: number, val: number) => {
    const next = { ...model.yearly, [key]: [...model.yearly[key]] };
    next[key][idx] = val;
    onModelChange({ ...model, yearly: next });
  }, [model, onModelChange]);

  const setYBase = useCallback((key: keyof YearlyInputs, idx: number, val: number) => {
    const next = { ...model.yearly_base, [key]: [...model.yearly_base[key]] };
    next[key][idx] = val;
    onModelChange({ ...model, yearly_base: next });
  }, [model, onModelChange]);

  const setOx = useCallback((key: keyof OpExDetail, idx: number, val: number) => {
    const next = { ...model.opex, [key]: [...model.opex[key]] };
    next[key][idx] = val;
    onModelChange({ ...model, opex: next });
  }, [model, onModelChange]);

  const setF = useCallback((key: keyof FundingInputs, val: number) => {
    onModelChange({ ...model, funding: { ...model.funding, [key]: val } });
  }, [model, onModelChange]);

  const [deployCase, setDeployCase] = useState<'best' | 'base'>('best');
  const [msCase, setMsCase] = useState<'best' | 'base'>('best');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  const editMs = msCase === 'best' ? model.milestones_best : model.milestones_base;
  const otherMs = msCase === 'best' ? model.milestones_base : model.milestones_best;
  const msKey = msCase === 'best' ? 'milestones_best' : 'milestones_base';
  const otherLabel = msCase === 'best' ? 'Base' : 'Best';

  const setMilestone = useCallback((idx: number, field: keyof MilestoneItem, val: string | boolean | number) => {
    let next = editMs.map((m, i) => {
      if (i !== idx) return m;
      const updated = { ...m, [field]: val };
      // If user manually sets startM or endM, mark as manual
      if (field === 'startM') updated.manualStart = true;
      return updated;
    });
    // Resolve predecessor chains and persist resolved values
    next = resolveMilestones(next);
    onModelChange({ ...model, [msKey]: next });
  }, [model, onModelChange, editMs, msKey]);

  const addMilestone = useCallback(() => {
    const newId = 'ms_' + Date.now().toString(36);
    const item: MilestoneItem = { id: newId, desc: '新活动', kpi: '', type: '商业化', bold: false, startM: 1, endM: 3, predecessorId: null, lagMonths: 0, manualStart: true };
    onModelChange({ ...model, [msKey]: [...editMs, item] });
  }, [model, onModelChange, editMs, msKey]);

  const removeMilestone = useCallback((idx: number) => {
    const removedId = editMs[idx].id;
    const next = editMs.filter((_, i) => i !== idx).map(m =>
      m.predecessorId === removedId ? { ...m, predecessorId: null, manualStart: true } : m
    );
    onModelChange({ ...model, [msKey]: next });
  }, [model, onModelChange, editMs, msKey]);

  const moveMilestone = useCallback((idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= editMs.length) return;
    const next = [...editMs];
    [next[idx], next[target]] = [next[target], next[idx]];
    onModelChange({ ...model, [msKey]: next });
  }, [model, onModelChange, editMs, msKey]);

  const handleDragDrop = useCallback((fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const next = [...editMs];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onModelChange({ ...model, [msKey]: next });
  }, [model, onModelChange, editMs, msKey]);

  const setAnnotation = useCallback((key: string, val: string) => {
    onModelChange({ ...model, annotations: { ...model.annotations, [key]: val } });
  }, [model, onModelChange]);

  const handleSaveProfile = useCallback(() => {
    if (!profileName.trim()) return;
    saveProfile(profileName.trim(), model);
    saveModel(model);
    openSnapshotRef.current = JSON.stringify(model);
    setProfiles(listProfiles());
    setProfileName('');
  }, [profileName, model]);

  const handleLoadProfile = useCallback((name: string) => {
    const data = loadProfile(name);
    if (data) {
      onModelChange(data);
      openSnapshotRef.current = JSON.stringify(data);
    }
  }, [onModelChange]);

  const handleDeleteProfile = useCallback((name: string) => {
    deleteProfile(name);
    setProfiles(listProfiles());
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl p-0 my-5 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-96 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-700/50 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-cyan-500/20">⚙</div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">参数控制台</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-slate-300">实时调整 · 全量存档 · 投资人路演专属</p>
              {isDirty && <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">未保存</span>}
              {lastAutoSave && (
                <span className="text-[11px] text-slate-300">
                  自动保存 {new Date(lastAutoSave).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  {autoSaveCount > 1 && ` (${autoSaveCount}次)`}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowArchive(!showArchive)} className={`px-3 py-1.5 text-xs rounded-lg transition-all ${showArchive ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' : 'bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:bg-slate-600/50'}`}>
            📚 存档历史
          </button>
          <button onClick={() => { saveModel(model); openSnapshotRef.current = JSON.stringify(model); setLastAutoSave(Date.now()); }} className="px-3 py-1.5 text-xs rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all">
            💾 保存
          </button>
          <button onClick={onReset} className="px-3 py-1.5 text-xs rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-all">
            ↻ 恢复默认
          </button>
          <button onClick={handleClose} className="px-3 py-1.5 text-xs rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:bg-slate-600/50 transition-all">
            ✕ 关闭
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 px-4 pt-3 pb-0 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-2 rounded-t-lg text-xs font-medium transition-all whitespace-nowrap ${
              tab === t.key
                ? 'bg-slate-700/80 text-cyan-400 border-b-2 border-cyan-400 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Scenario + Timeline selector strip */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-700/50 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">场景:</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-600/50">
            {([['neutral', '中性', 'bg-blue-600/25 text-blue-300 border-blue-500/40'], ['optimistic', '乐观', 'bg-green-600/25 text-green-300 border-green-500/40'], ['conservative', '保守', 'bg-orange-600/25 text-orange-300 border-orange-500/40']] as const).map(([key, label, activeClass]) => (
              <button key={key} onClick={() => setScenario(key as Scenario)}
                className={`px-3 py-1.5 text-xs font-medium transition-all ${activeScenario === key ? activeClass : 'text-slate-400 hover:text-slate-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">时间线:</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-600/50">
            <button onClick={() => setTimeline('aggressive')}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${activeTimeline === 'aggressive' ? 'bg-cyan-600/25 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`}>
              🚀 激进
            </button>
            <button onClick={() => setTimeline('standard')}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${activeTimeline === 'standard' ? 'bg-amber-600/25 text-amber-300' : 'text-slate-400 hover:text-slate-200'}`}>
              📊 标准
            </button>
          </div>
        </div>
        <div className="ml-auto text-[10px] text-slate-500">
          场景=市场假设(增速/续约/部署) · 时间线=里程碑进度(激进=Best Case / 标准=Base Case)
        </div>
      </div>

      {/* Content + Archive Sidebar */}
      <div className="flex">
      {/* Main Content */}
      <div className={`px-6 py-5 min-h-[320px] ${showArchive ? 'flex-1 min-w-0' : 'w-full'}`}>
        <BPBadges tabKey={tab} />

        {/* ===== PRICING ===== */}
        {tab === 'pricing' && (
          <div className="space-y-4">
            <SectionTitle>产品定价 (元/床) — 共通参数</SectionTitle>
            <NoteBar text={model.annotations.pricing} annotationKey="pricing" onChange={setAnnotation} />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <DarkInput label="二类硬件" value={g.price_hw_c2} def={DEFAULT_MODEL.global.price_hw_c2} onChange={v => setG('price_hw_c2', v)} />
              <DarkInput label="三类硬件" value={g.price_hw_c3} def={DEFAULT_MODEL.global.price_hw_c3} onChange={v => setG('price_hw_c3', v)} />
              <DarkInput label="升级服务" value={g.price_upgrade} def={DEFAULT_MODEL.global.price_upgrade} onChange={v => setG('price_upgrade', v)} />
              <DarkInput label="二类SaaS/年" value={g.price_saas_c2} def={DEFAULT_MODEL.global.price_saas_c2} onChange={v => setG('price_saas_c2', v)} />
              <DarkInput label="三类SaaS/年" value={g.price_saas_c3} def={DEFAULT_MODEL.global.price_saas_c3} onChange={v => setG('price_saas_c3', v)} />
              <DarkInput label="大客户5年SaaS/年" value={g.price_saas_c3_bulk} def={DEFAULT_MODEL.global.price_saas_c3_bulk} onChange={v => setG('price_saas_c3_bulk', v)} />
            </div>

            <SectionTitle>合作经销商渠道条款 (§3.1)</SectionTitle>
            <NoteBar text={model.annotations.baxter} annotationKey="baxter" onChange={setAnnotation} />
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['百特 (Baxter)', '迈瑞 (Mindray)', '其他'] as const).map(opt => {
                const current = model.annotations.distributor || '百特 (Baxter)';
                const isActive = current === opt;
                return (
                  <button key={opt} onClick={() => setAnnotation('distributor', opt)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${isActive ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-slate-800/50 border-slate-600/40 text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                    {isActive ? '✓ ' : ''}{opt}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DarkInput label="经销商 HW分成" value={g.baxter_hw_commission} def={DEFAULT_MODEL.global.baxter_hw_commission} onChange={v => setG('baxter_hw_commission', v)} step={0.01} />
              <DarkInput label="经销商 SaaS分成" value={g.baxter_saas_commission} def={DEFAULT_MODEL.global.baxter_saas_commission} onChange={v => setG('baxter_saas_commission', v)} step={0.01} />
            </div>

            <SectionTitle>授权金 & 里程碑付款</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DarkInput label="前期授权金 (元)" value={g.license_amount} def={DEFAULT_MODEL.global.license_amount} onChange={v => setG('license_amount', v)} step={100000} />
              <DarkInput label="授权金到账年 (Y)" value={g.license_year} def={DEFAULT_MODEL.global.license_year} onChange={v => setG('license_year', v)} step={1} />
              <DarkInput label="里程碑付款 (元)" value={g.milestone_payment} def={DEFAULT_MODEL.global.milestone_payment} onChange={v => setG('milestone_payment', v)} step={100000} />
              <DarkInput label="里程碑到账年 (Y)" value={g.milestone_year} def={DEFAULT_MODEL.global.milestone_year} onChange={v => setG('milestone_year', v)} step={1} />
            </div>
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3 text-[11px] text-slate-400">
              {(() => { const la = deriveLicenseArray(g); return `推算: ${la.map((v, i) => `Y${i + 1}=¥${(v / 10000).toFixed(0)}万`).join(' · ')}`; })()}
            </div>

            <ScenarioBlock scenario={activeScenario} title="关键比率">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ScenarioDarkInput label="SaaS续约率" value={so.rr_base} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].rr_base} onChange={v => setSO('rr_base', v)} step={0.05} scenario={activeScenario} />
                <DarkInput label="三类后年增长率" value={g.post_class3_growth} def={DEFAULT_MODEL.global.post_class3_growth} onChange={v => setG('post_class3_growth', v)} step={0.05} />
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                {activeScenario === 'optimistic' ? '🟢 乐观: 续约率85% — 产品粘性强、SaaS价值锚点高' :
                 activeScenario === 'conservative' ? '🟠 保守: 续约率55% — 中国医院SaaS付费培育期较长' :
                 '🔵 中性: 续约率70% — BP基准假设'}
              </div>
            </ScenarioBlock>

            <SectionTitle>ROI价值锚点 (元/床/年)</SectionTitle>
            <NoteBar text={model.annotations.roi} annotationKey="roi" onChange={setAnnotation} />
            <div className="grid grid-cols-2 gap-3">
              <DarkInput label="C2创造价值" value={g.value_anchor_c2} def={DEFAULT_MODEL.global.value_anchor_c2} onChange={v => setG('value_anchor_c2', v)} />
              <DarkInput label="C3创造价值" value={g.value_anchor_c3} def={DEFAULT_MODEL.global.value_anchor_c3} onChange={v => setG('value_anchor_c3', v)} />
            </div>
            <SectionTitle>SOM / 敏感性参数</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <DarkInput label="SAM中值 (万元)" value={g.sam_midpoint} def={DEFAULT_MODEL.global.sam_midpoint} onChange={v => setG('sam_midpoint', v)} step={10000} />
              <DarkInput label="敏感性摆幅 (±)" value={g.sensitivity_bed_swing} def={DEFAULT_MODEL.global.sensitivity_bed_swing} onChange={v => setG('sensitivity_bed_swing', v)} step={0.05} />
            </div>
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3 text-[11px] text-slate-400">
              SAM中值 = ¥{(g.sam_midpoint / 10000).toFixed(1)}亿 · 敏感性 = ±{Math.round(g.sensitivity_bed_swing * 100)}% · Y5 SOM穿透率 = {g.sam_midpoint > 0 ? ((scenarioResult.years[4].total_revenue / 10000 / g.sam_midpoint) * 100).toFixed(2) : '—'}%
            </div>
          </div>
        )}

        {/* ===== COGS ===== */}
        {tab === 'cogs' && (
          <div className="space-y-4">
            <SectionTitle>BOM成本拆分 (元/床) — C2基准</SectionTitle>
            <NoteBar text={model.annotations.bom} annotationKey="bom" onChange={setAnnotation} />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(Object.keys(COGS_LABELS) as (keyof typeof COGS_LABELS)[]).map(key => (
                <DarkInput
                  key={key}
                  label={COGS_LABELS[key]}
                  value={g[key as keyof GlobalInputs] as number}
                  def={DEFAULT_MODEL.global[key as keyof GlobalInputs] as number}
                  onChange={v => setG(key as keyof GlobalInputs, v)}
                />
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
              <div className="text-xs text-slate-400 mb-2">计算结果</div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-slate-500">C2 BOM = </span><span className="text-cyan-400 font-bold">¥{((g.bom_sensor + g.bom_edge_compute + g.bom_housing + g.bom_cable_pcb + g.bom_assembly + g.bom_packaging) / 10000).toFixed(2)}万</span></div>
                <div><span className="text-slate-500">C3 BOM = </span><span className="text-cyan-400 font-bold">¥{((g.bom_sensor + g.bom_edge_compute + g.bom_housing + g.bom_cable_pcb + g.bom_assembly + g.bom_packaging + g.bom_c3_premium) / 10000).toFixed(2)}万</span></div>
                <div><span className="text-slate-500">升级 BOM = </span><span className="text-cyan-400 font-bold">¥{(((g.bom_sensor + g.bom_edge_compute + g.bom_housing + g.bom_cable_pcb + g.bom_assembly + g.bom_packaging) * 0.6 + g.bom_c3_premium) / 10000).toFixed(2)}万</span></div>
              </div>
            </div>

            {/* COGS Y1-5 per-year breakdown */}
            <SectionTitle>COGS 年度明细 (Y1–5, 万元)</SectionTitle>
            <div className="overflow-x-auto rounded-lg border border-slate-700/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800/80">
                    <th className="text-left px-3 py-2 text-cyan-400 font-semibold w-[120px]">COGS明细</th>
                    {YEAR_LABELS.map(l => <th key={l} className="text-right px-2 py-2 text-cyan-400 font-semibold">{l}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const bom_c2 = scenarioResult.bom_c2;
                    const bom_c3 = scenarioResult.bom_c3;
                    const bom_upg = scenarioResult.bom_upgrade;
                    const fmtW = (n: number) => { const v = n / 10000; return v === 0 ? '—' : `${Math.round(v)}`; };
                    return (
                      <>
                        <tr className="border-t border-slate-700/30">
                          <td className="px-3 py-2 text-slate-400">直销C2 × ¥{(bom_c2/10000).toFixed(2)}万</td>
                          {scenarioResult.years.slice(0, 5).map((yr, i) => (
                            <td key={i} className="text-right px-2 py-2 font-mono text-slate-300">{fmtW(yr.direct_c2 * bom_c2)}</td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-700/30">
                          <td className="px-3 py-2 text-slate-400">直销C3 × ¥{(bom_c3/10000).toFixed(2)}万</td>
                          {scenarioResult.years.slice(0, 5).map((yr, i) => (
                            <td key={i} className="text-right px-2 py-2 font-mono text-slate-300">{fmtW(yr.direct_c3 * bom_c3)}</td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-700/30">
                          <td className="px-3 py-2 text-slate-400">升级 × ¥{(bom_upg/10000).toFixed(2)}万</td>
                          {scenarioResult.years.slice(0, 5).map((yr, i) => (
                            <td key={i} className="text-right px-2 py-2 font-mono text-slate-300">{fmtW(yr.actual_upgrade * bom_upg)}</td>
                          ))}
                        </tr>
                        <tr className="border-t border-cyan-500/20 bg-cyan-500/5">
                          <td className="px-3 py-2 text-cyan-300 font-bold">COGS合计</td>
                          {scenarioResult.years.slice(0, 5).map((yr, i) => (
                            <td key={i} className="text-right px-2 py-2 font-mono text-cyan-300 font-bold">{fmtW(yr.cogs)}</td>
                          ))}
                        </tr>
                        <tr className="border-t border-slate-700/30">
                          <td className="px-3 py-2 text-amber-400/80">COGS比率</td>
                          {scenarioResult.years.slice(0, 5).map((yr, i) => {
                            const rate = yr.total_revenue > 0 ? (yr.cogs / yr.total_revenue * 100) : 0;
                            return (
                              <td key={i} className={`text-right px-2 py-2 font-mono ${rate > 50 ? 'text-red-400' : rate > 40 ? 'text-amber-400' : 'text-green-400'}`}>
                                {yr.total_revenue > 0 ? `${rate.toFixed(0)}%` : '—'}
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="border-t border-slate-700/30 bg-slate-800/20">
                          <td className="px-3 py-2 text-slate-400 font-medium">毛利</td>
                          {scenarioResult.years.slice(0, 5).map((yr, i) => (
                            <td key={i} className={`text-right px-2 py-2 font-mono font-medium ${yr.gross_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmtW(yr.gross_profit)}</td>
                          ))}
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg p-2 bg-slate-800/50 border border-slate-700/30 text-[11px] text-slate-500">
              📐 COGS = Σ(直销C2×BOM_C2 + 直销C3×BOM_C3 + 升级×BOM_升级) · 经销商渠道=佣金模式,不计BOM · 毛利 = 总收入−COGS
            </div>
          </div>
        )}

        {/* ===== DEPLOY ===== */}
        {tab === 'deploy' && (
          <div className="space-y-4">
            <SectionTitle>年度部署计划 (床位数) — 时间线: {activeTimeline === 'aggressive' ? '🚀 激进' : '📊 标准'}</SectionTitle>
            <NoteBar text={model.annotations.deployment} annotationKey="deployment" onChange={setAnnotation} />

            <ScenarioBlock scenario={activeScenario} title="部署乘数">
              <div className="grid grid-cols-3 gap-3">
                <ScenarioDarkInput label="部署量系数" value={so.bed_growth_factor} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].bed_growth_factor} onChange={v => setSO('bed_growth_factor', v)} step={0.05} scenario={activeScenario} />
              </div>
              <div className="mt-2 text-[10px] text-slate-500">
                {activeScenario === 'optimistic' ? '🟢 乐观: 部署×1.15 — 渠道加速+医院接受度高' :
                 activeScenario === 'conservative' ? '🟠 保守: 部署×0.85 — 渠道铺设延迟/竞品干扰' :
                 '🔵 中性: 部署×1.0 — BP基准计划'}
              </div>
            </ScenarioBlock>

            <div className="flex gap-2 mb-2">
              <button onClick={() => setDeployCase('best')} className={`px-3 py-1 rounded text-xs font-bold transition ${deployCase === 'best' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>Best Case</button>
              <button onClick={() => setDeployCase('base')} className={`px-3 py-1 rounded text-xs font-bold transition ${deployCase === 'base' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>Base Case</button>
            </div>
            {deployCase === 'best' ? (
              <DarkTable>
                <DarkRow label="直销 C2" values={y.direct_c2} defaults={DEFAULT_MODEL.yearly.direct_c2} onChange={(i, v) => setY('direct_c2', i, v)} />
                <DarkRow label="直销 C3" values={y.direct_c3} defaults={DEFAULT_MODEL.yearly.direct_c3} onChange={(i, v) => setY('direct_c3', i, v)} />
                <DarkRow label="经销商 C2" values={y.baxter_c2} defaults={DEFAULT_MODEL.yearly.baxter_c2} onChange={(i, v) => setY('baxter_c2', i, v)} />
                <DarkRow label="经销商 C3" values={y.baxter_c3} defaults={DEFAULT_MODEL.yearly.baxter_c3} onChange={(i, v) => setY('baxter_c3', i, v)} />
                <DarkRow label="升级 C2→C3" values={y.planned_upgrade} defaults={DEFAULT_MODEL.yearly.planned_upgrade} onChange={(i, v) => setY('planned_upgrade', i, v)} />
              </DarkTable>
            ) : (
              <DarkTable>
                <DarkRow label="直销 C2" values={yb.direct_c2} defaults={DEFAULT_MODEL.yearly_base.direct_c2} onChange={(i, v) => setYBase('direct_c2', i, v)} />
                <DarkRow label="直销 C3" values={yb.direct_c3} defaults={DEFAULT_MODEL.yearly_base.direct_c3} onChange={(i, v) => setYBase('direct_c3', i, v)} />
                <DarkRow label="经销商 C2" values={yb.baxter_c2} defaults={DEFAULT_MODEL.yearly_base.baxter_c2} onChange={(i, v) => setYBase('baxter_c2', i, v)} />
                <DarkRow label="经销商 C3" values={yb.baxter_c3} defaults={DEFAULT_MODEL.yearly_base.baxter_c3} onChange={(i, v) => setYBase('baxter_c3', i, v)} />
                <DarkRow label="升级 C2→C3" values={yb.planned_upgrade} defaults={DEFAULT_MODEL.yearly_base.planned_upgrade} onChange={(i, v) => setYBase('planned_upgrade', i, v)} />
              </DarkTable>
            )}

            {/* SOM / Beds / ARR real-time display */}
            <SectionTitle>市场机会 — {activeScenario === 'optimistic' ? '🟢乐观' : activeScenario === 'conservative' ? '🟠保守' : '🔵中性'} × {activeTimeline === 'aggressive' ? '🚀激进' : '📊标准'} 时间线</SectionTitle>
            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800/80">
                    <th className="text-left px-3 py-2 text-cyan-400 font-semibold w-[120px]">指标</th>
                    {['Y1','Y2','Y3','Y4','Y5','Y6','Y7','Y8','Y9','Y10'].map(l => (
                      <th key={l} className="text-right px-2 py-2 text-slate-400 font-semibold">{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-700/30">
                    <td className="px-3 py-2 text-slate-300 font-medium">累计床位</td>
                    {scenarioResult.years.map((yr, i) => (
                      <td key={i} className="text-right px-2 py-2 text-slate-200 font-mono">{yr.cumulative_beds.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-slate-700/30">
                    <td className="px-3 py-2 text-slate-300 font-medium">活跃付费床位</td>
                    {scenarioResult.years.map((yr, i) => (
                      <td key={i} className="text-right px-2 py-2 text-green-400 font-mono">{yr.active_paying.toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-slate-700/30">
                    <td className="px-3 py-2 text-slate-300 font-medium">总收入 (万)</td>
                    {scenarioResult.years.map((yr, i) => (
                      <td key={i} className="text-right px-2 py-2 text-cyan-400 font-mono">{Math.round(yr.total_revenue / 10000).toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-slate-700/30">
                    <td className="px-3 py-2 text-slate-300 font-medium">SOM穿透率</td>
                    {scenarioResult.years.map((yr, i) => (
                      <td key={i} className="text-right px-2 py-2 text-purple-400 font-mono">
                        {yr.total_revenue > 0 && g.sam_midpoint > 0 ? ((yr.total_revenue / 10000 / g.sam_midpoint) * 100).toFixed(2) + '%' : '—'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-cyan-500/20 bg-cyan-500/5">
                    <td className="px-3 py-2 text-cyan-300 font-bold">ARR (万)</td>
                    {scenarioResult.years.map((yr, i) => {
                      const saasPerBed = i < 5 ? g.price_saas_c2 : g.price_saas_c2; // simplified
                      const arr = yr.active_paying * saasPerBed / 10000;
                      return <td key={i} className="text-right px-2 py-2 text-cyan-300 font-mono font-bold">{Math.round(arr).toLocaleString()}</td>;
                    })}
                  </tr>
                  <tr className="border-t border-slate-700/30">
                    <td className="px-3 py-2 text-slate-300 font-medium">EBITDA (万)</td>
                    {scenarioResult.years.map((yr, i) => (
                      <td key={i} className={`text-right px-2 py-2 font-mono font-bold ${yr.ebitda >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.round(yr.ebitda / 10000).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== OPEX ===== */}
        {tab === 'opex' && (
          <div className="space-y-4">
            <SectionTitle>薪资分解 (人数 × 平均薪资)</SectionTitle>
            <DarkTable>
              <DarkRow label="团队人数" values={g.headcount} defaults={DEFAULT_MODEL.global.headcount} onChange={(i, v) => {
                const hc = [...g.headcount]; hc[i] = v;
                const sal = [...(ox.salary)]; sal[i] = v * g.avg_salary[i];
                onModelChange({ ...model, global: { ...g, headcount: hc }, opex: { ...ox, salary: sal } });
              }} />
              <DarkRow label="人均薪资(万)" values={g.avg_salary.map(v => v / 10000)} defaults={DEFAULT_MODEL.global.avg_salary.map(v => v / 10000)} onChange={(i, v) => {
                const as2 = [...g.avg_salary]; as2[i] = v * 10000;
                const sal = [...(ox.salary)]; sal[i] = g.headcount[i] * v * 10000;
                onModelChange({ ...model, global: { ...g, avg_salary: as2 }, opex: { ...ox, salary: sal } });
              }} />
              <tr className="border-t border-cyan-500/30">
                <td className="py-2 px-2 text-xs font-bold text-cyan-400">薪资合计 (万)</td>
                {[0,1,2,3,4].map(i => (
                  <td key={i} className="py-2 px-1 text-center text-xs font-bold text-cyan-400">{(g.headcount[i] * g.avg_salary[i] / 10000).toFixed(0)}</td>
                ))}
              </tr>
            </DarkTable>

            <SectionTitle>其他运营费用明细 (万元)</SectionTitle>
            <NoteBar text={model.annotations.opex} annotationKey="opex" onChange={setAnnotation} />
            <DarkTable>
              {(Object.keys(OPEX_LABELS) as (keyof OpExDetail)[]).filter(k => k !== 'salary').map(key => (
                <DarkRow
                  key={key}
                  label={OPEX_LABELS[key]}
                  values={ox[key].map(v => v / 10000)}
                  defaults={DEFAULT_MODEL.opex[key].map(v => v / 10000)}
                  onChange={(i, v) => setOx(key, i, v * 10000)}
                />
              ))}
              <tr className="border-t border-cyan-500/30">
                <td className="py-2 px-2 text-xs font-bold text-cyan-400">合计 OpEx</td>
                {[0,1,2,3,4].map(i => {
                  const total = (Object.keys(OPEX_LABELS) as (keyof OpExDetail)[]).reduce((s, k) => s + (ox[k][i] || 0), 0);
                  return <td key={i} className="py-2 px-1 text-center text-xs font-bold text-cyan-400">{(total / 10000).toFixed(0)}</td>;
                })}
              </tr>
            </DarkTable>

            <ScenarioBlock scenario={activeScenario} title="Y6-Y10 OpEx增长率">
              <div className="grid grid-cols-5 gap-3">
                <ScenarioDarkInput label="Y6 OpEx增速" value={so.opex_growth_y6} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].opex_growth_y6} onChange={v => setSO('opex_growth_y6', v)} step={0.01} scenario={activeScenario} />
                <ScenarioDarkInput label="Y7 OpEx增速" value={so.opex_growth_y7} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].opex_growth_y7} onChange={v => setSO('opex_growth_y7', v)} step={0.01} scenario={activeScenario} />
                <ScenarioDarkInput label="Y8 OpEx增速" value={so.opex_growth_y8} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].opex_growth_y8} onChange={v => setSO('opex_growth_y8', v)} step={0.01} scenario={activeScenario} />
                <ScenarioDarkInput label="Y9 OpEx增速" value={so.opex_growth_y9} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].opex_growth_y9} onChange={v => setSO('opex_growth_y9', v)} step={0.01} scenario={activeScenario} />
                <ScenarioDarkInput label="Y10 OpEx增速" value={so.opex_growth_y10} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].opex_growth_y10} onChange={v => setSO('opex_growth_y10', v)} step={0.01} scenario={activeScenario} />
              </div>
              <div className="mt-1 text-[10px] text-slate-500">
                Finance Plan: 33%→25%→24%→21%→22% (团队扩编+市场开拓+经营杠杆)
              </div>
            </ScenarioBlock>

            <ScenarioBlock scenario={activeScenario} title="Y6-Y10 COGS目标比率">
              <div className="grid grid-cols-2 gap-3">
                <ScenarioDarkInput label="COGS目标率" value={so.cogs_rate_target} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].cogs_rate_target} onChange={v => setSO('cogs_rate_target', v)} step={0.01} scenario={activeScenario} />
              </div>
              <div className="mt-1 text-[10px] text-slate-500">
                Finance Plan: Y5及以后COGS率保持34% (规模效应稳定)
              </div>
            </ScenarioBlock>
          </div>
        )}

        {/* ===== FUNDING ===== */}
        {tab === 'funding' && (
          <div className="space-y-4">
            <SectionTitle>融资参数 (万元)</SectionTitle>
            <NoteBar text={model.annotations.funding} annotationKey="funding" onChange={setAnnotation} />

            {/* ===== FUNDING ADVISORY — 融资需求智能分析 ===== */}
            {(() => {
              const yrs = resultBest.years;
              const w = (v: number) => (v / 10000).toFixed(0);
              const y1Loss = -yrs[0].net_profit;
              const seedMax = f.seed_max / 10000;
              const seedMin = f.seed_min / 10000;
              const seedBuffer = seedMax - y1Loss / 10000;
              const ebitdaPosIdx = yrs.findIndex(y => y.ebitda > 0);
              // Cumulative net profit year by year
              let cumNP = 0;
              const cumByYear = yrs.slice(0, 5).map(y => { cumNP += y.net_profit; return cumNP; });
              const cumBreakEvenYear = cumByYear.findIndex(c => c >= 0);
              // License income from baxter (non-dilutive)
              const licenseY2 = model.global.license_amount / 10000;
              const milestoneY3 = model.global.milestone_payment / 10000;
              // Y2 cumulative position after seed funding
              const cashAfterSeedAndY2 = f.seed_max + yrs[0].net_profit + yrs[1].net_profit;
              const needPreA = cashAfterSeedAndY2 < 0;
              // Series A need: if by end of Y3 cumulative (with seed + preA) still negative
              const cashAfterPreA = cashAfterSeedAndY2 + f.preA_max + yrs[2].net_profit;
              const needSeriesA = cashAfterPreA < 0;

              return (
                <div className="rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/30 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-cyan-400">📊 融资需求智能分析</span>
                    <span className="text-[10px] text-slate-500">基于当前模型参数实时计算</span>
                  </div>

                  {/* Cash flow waterfall */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-semibold mb-1">年度现金流瀑布 (万元)</div>
                    {yrs.slice(0, 5).map((yr, i) => {
                      const rev = yr.total_revenue / 10000;
                      const opex = yr.opex / 10000;
                      const cogs = yr.cogs / 10000;
                      const ebitda = yr.ebitda / 10000;
                      const cum = cumByYear[i] / 10000;
                      return (
                        <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
                          <span className="text-slate-500 w-6">Y{i + 1}</span>
                          <span className="text-slate-400">收入</span><span className={`w-12 text-right ${rev > 0 ? 'text-green-400' : 'text-slate-500'}`}>{rev.toFixed(0)}</span>
                          <span className="text-slate-600">−</span>
                          <span className="text-slate-400">成本</span><span className="w-12 text-right text-orange-400">{(cogs + opex).toFixed(0)}</span>
                          <span className="text-slate-600">=</span>
                          <span className="text-slate-400">EBITDA</span><span className={`w-14 text-right font-bold ${ebitda >= 0 ? 'text-green-400' : 'text-red-400'}`}>{ebitda >= 0 ? '+' : ''}{ebitda.toFixed(0)}</span>
                          <span className="text-slate-600 mx-1">│</span>
                          <span className="text-slate-500">累计</span><span className={`w-14 text-right ${cum >= 0 ? 'text-green-300' : 'text-red-300'}`}>{cum >= 0 ? '+' : ''}{cum.toFixed(0)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-700/50 pt-3 space-y-2.5">
                    {/* Seed round advisory */}
                    <div className={`rounded-lg p-3 text-[11px] leading-relaxed ${seedBuffer < 50 ? 'bg-red-500/10 border border-red-500/30' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                      <div className="font-bold text-blue-400 mb-1">🏦 种子轮 SEED — M1~M3到账</div>
                      <div className="text-slate-300">
                        <span className="text-red-400 font-bold">Y1亏损 ¥{w(y1Loss)}万</span> ← 种子轮需完全覆盖
                      </div>
                      <div className="text-slate-400 mt-1">
                        建议<b className="text-slate-200">分两期到账</b>：
                        <span className="text-cyan-400"> 第1期 M1: ¥{Math.round(seedMin * 0.6)}万</span> (CDMO签约+原型开发+云环境) ·
                        <span className="text-cyan-400"> 第2期 M6: ¥{Math.round(seedMax - seedMin * 0.6)}万</span> (试点部署+CRO启动)
                      </div>
                      {seedBuffer < 50 && seedBuffer >= 0 && (
                        <div className="text-amber-400 mt-1 font-medium">⚠️ 种子轮上限¥{seedMax.toFixed(0)}万 ≥ Y1亏损¥{w(y1Loss)}万，但余量仅¥{seedBuffer.toFixed(0)}万，建议增加种子轮金额</div>
                      )}
                      {seedBuffer < 0 && (
                        <div className="text-red-400 mt-1 font-bold">🚨 种子轮上限¥{seedMax.toFixed(0)}万 &lt; Y1亏损¥{w(y1Loss)}万！缺口¥{Math.abs(seedBuffer).toFixed(0)}万，必须增加种子轮金额或压缩Y1支出</div>
                      )}
                    </div>

                    {/* Pre-A advisory */}
                    <div className="rounded-lg p-3 text-[11px] leading-relaxed bg-purple-500/10 border border-purple-500/30">
                      <div className="font-bold text-purple-400 mb-1">💜 Pre-A轮 — M13~M15到账</div>
                      <div className="text-slate-300">
                        Y2 EBITDA: <span className={yrs[1].ebitda >= 0 ? 'text-green-400' : 'text-red-400'}>{yrs[1].ebitda >= 0 ? '+' : ''}{w(yrs[1].ebitda)}万</span>
                        {yrs[1].ebitda >= 0 ? ' (已转正)' : ' (仍为负)'}
                      </div>
                      <div className="text-slate-400 mt-1">
                        经销商授权金 <span className="text-cyan-400">¥{licenseY2.toFixed(0)}万 (M8~M10)</span> + 里程碑 <span className="text-cyan-400">¥{milestoneY3.toFixed(0)}万 (M26~M28)</span> = 非稀释收入¥{(licenseY2 + milestoneY3).toFixed(0)}万
                      </div>
                      {needPreA ? (
                        <div className="text-amber-400 mt-1 font-medium">⚠️ 种子轮后Y2末现金余额 ¥{(cashAfterSeedAndY2 / 10000).toFixed(0)}万 → 需Pre-A补充运营资金</div>
                      ) : (
                        <div className="text-green-400 mt-1">✅ 种子轮后Y2末现金余额 ¥{(cashAfterSeedAndY2 / 10000).toFixed(0)}万 → 经销商授权金可替代大部分Pre-A</div>
                      )}
                    </div>

                    {/* Series A advisory */}
                    <div className={`rounded-lg p-3 text-[11px] leading-relaxed ${needSeriesA ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
                      <div className="font-bold text-amber-400 mb-1">🟡 A轮 (可选) — M25~M30</div>
                      {ebitdaPosIdx >= 0 && ebitdaPosIdx <= 1 ? (
                        <>
                          <div className="text-green-400">✅ EBITDA Year {ebitdaPosIdx + 1}已转正{cumBreakEvenYear >= 0 ? `，累计现金流Year ${cumBreakEvenYear + 1}回正` : ''}</div>
                          {!needSeriesA ? (
                            <div className="text-green-300 mt-1 font-medium">→ <b>不需要A轮融资</b>。Y{(ebitdaPosIdx || 1) + 2}起现金流自给。可将A轮最低设为¥0。</div>
                          ) : (
                            <div className="text-amber-300 mt-1">→ 虽EBITDA已转正，但前期累计亏损尚未回补。建议保留小额A轮作为安全垫。</div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="text-red-400">⚠️ EBITDA至Y2仍未转正 (Year {ebitdaPosIdx >= 0 ? ebitdaPosIdx + 1 : '?'}转正)</div>
                          <div className="text-amber-300 mt-1">→ 建议保留A轮融资 ¥{(f.seriesA_min / 10000).toFixed(0)}–{(f.seriesA_max / 10000).toFixed(0)}万，确保注册审评期间现金流安全</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FundingCard title="种子轮 SEED" color="from-blue-500/20 to-blue-600/10 border-blue-500/30">
                <DarkInput label="最低金额" value={f.seed_min / 10000} def={DEFAULT_MODEL.funding.seed_min / 10000} onChange={v => setF('seed_min', v * 10000)} />
                <DarkInput label="最高金额" value={f.seed_max / 10000} def={DEFAULT_MODEL.funding.seed_max / 10000} onChange={v => setF('seed_max', v * 10000)} />
                <DarkInput label="稀释比例" value={f.seed_dilution} def={DEFAULT_MODEL.funding.seed_dilution} onChange={v => setF('seed_dilution', v)} step={0.01} />
              </FundingCard>
              <FundingCard title="PRE-A轮" color="from-purple-500/20 to-purple-600/10 border-purple-500/30">
                <DarkInput label="最低金额" value={f.preA_min / 10000} def={DEFAULT_MODEL.funding.preA_min / 10000} onChange={v => setF('preA_min', v * 10000)} />
                <DarkInput label="最高金额" value={f.preA_max / 10000} def={DEFAULT_MODEL.funding.preA_max / 10000} onChange={v => setF('preA_max', v * 10000)} />
                <DarkInput label="稀释比例" value={f.preA_dilution} def={DEFAULT_MODEL.funding.preA_dilution} onChange={v => setF('preA_dilution', v)} step={0.01} />
              </FundingCard>
              <FundingCard title="A轮(可选)" color="from-amber-500/20 to-amber-600/10 border-amber-500/30">
                <DarkInput label="最低金额" value={f.seriesA_min / 10000} def={DEFAULT_MODEL.funding.seriesA_min / 10000} onChange={v => setF('seriesA_min', v * 10000)} />
                <DarkInput label="最高金额" value={f.seriesA_max / 10000} def={DEFAULT_MODEL.funding.seriesA_max / 10000} onChange={v => setF('seriesA_max', v * 10000)} />
                <DarkInput label="稀释比例" value={f.seriesA_dilution} def={DEFAULT_MODEL.funding.seriesA_dilution} onChange={v => setF('seriesA_dilution', v)} step={0.01} />
              </FundingCard>
            </div>
            <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 mt-2">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><span className="text-slate-500">总融资 = </span><span className="text-cyan-400 font-bold">¥{((f.seed_min + f.preA_min + f.seriesA_min) / 10000).toFixed(0)}–{((f.seed_max + f.preA_max + f.seriesA_max) / 10000).toFixed(0)}万</span></div>
                <div><span className="text-slate-500">累计稀释 = </span><span className="text-cyan-400 font-bold">{((1 - (1 - f.seed_dilution) * (1 - f.preA_dilution) * (1 - f.seriesA_dilution)) * 100).toFixed(1)}%</span></div>
                <div><span className="text-slate-500">创始人持股 = </span><span className="text-green-400 font-bold">{(((1 - f.seed_dilution) * (1 - f.preA_dilution) * (1 - f.seriesA_dilution)) * 100).toFixed(1)}%</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MILESTONES ===== */}
        {tab === 'milestones' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <SectionTitle>里程碑计划 — 前置依赖自动推算</SectionTitle>
              <div className="flex gap-2">
                <div className="flex rounded-lg overflow-hidden border border-slate-600/50">
                  <button onClick={() => setMsCase('best')} className={`px-3 py-1.5 text-xs font-medium transition-all ${msCase === 'best' ? 'bg-green-600/30 text-green-400 border-r border-green-500/30' : 'text-slate-400 hover:text-slate-200'}`}>🚀 Best</button>
                  <button onClick={() => setMsCase('base')} className={`px-3 py-1.5 text-xs font-medium transition-all ${msCase === 'base' ? 'bg-blue-600/30 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}>📊 Base</button>
                </div>
                <button onClick={addMilestone} className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all">+ 添加</button>
              </div>
            </div>
            <NoteBar text={model.annotations.milestones} annotationKey="milestones" onChange={setAnnotation} />

            <p className="text-xs text-slate-300">设置前置活动后，该活动的开始月份 = 前置活动结束月份 + Lag + 1。修改前置活动时所有依赖链自动重算。拖拽卡片可调整顺序。</p>
            <p className="text-[11px] text-slate-500">时间线: Best=激进时间线, Base=标准时间线。切换场景面板顶部的时间线选择器时自动使用对应里程碑。</p>

            {/* Milestone → EBITDA impact preview */}
            <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
              <div className="text-[11px] text-slate-400 mb-1 font-semibold">里程碑→EBITDA 联动影响 (当前时间线: {msCase === 'best' ? '🚀激进' : '📊标准'})</div>
              <div className="flex gap-4 text-[11px]">
                {[1,2,3,4].map(yi => {
                  const ebitda = (msCase === 'best' ? resultBest : resultBase).years[yi]?.ebitda ?? 0;
                  return (
                    <span key={yi} className={ebitda >= 0 ? 'text-green-400' : 'text-red-400'}>
                      Y{yi + 1}: ¥{Math.round(ebitda / 10000)}万
                    </span>
                  );
                })}
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">EBITDA转正: Y{((msCase === 'best' ? resultBest : resultBase).years.findIndex(yr => yr.ebitda > 0) + 1) || '?'}</span>
              </div>
            </div>

            {/* Resolved preview */}
            {(() => {
              const resolved = resolveMilestones(editMs);
              const otherResolved = resolveMilestones(otherMs);
              // Build a lookup for cross-reference by ID
              const otherMap = new Map(otherResolved.map(m => [m.id, m]));

              return (
                <div className="space-y-2">
                  {editMs.map((m, i) => {
                    const rm = resolved[i];
                    const duration = m.endM - m.startM + 1;
                    const resolvedDuration = rm.endM - rm.startM + 1;
                    const isAutoShifted = !m.manualStart && m.predecessorId && (rm.startM !== m.startM);
                    const otherRef = otherMap.get(m.id);
                    const isDragOver = dropIdx === i && dragIdx !== null && dragIdx !== i;

                    return (
                      <div
                        key={m.id}
                        draggable
                        onDragStart={e => {
                          setDragIdx(i);
                          e.dataTransfer.effectAllowed = 'move';
                          if (e.currentTarget instanceof HTMLElement) {
                            e.currentTarget.style.opacity = '0.5';
                          }
                        }}
                        onDragEnd={e => {
                          if (e.currentTarget instanceof HTMLElement) {
                            e.currentTarget.style.opacity = '1';
                          }
                          if (dragIdx !== null && dropIdx !== null && dragIdx !== dropIdx) {
                            handleDragDrop(dragIdx, dropIdx);
                          }
                          setDragIdx(null);
                          setDropIdx(null);
                        }}
                        onDragOver={e => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          setDropIdx(i);
                        }}
                        onDragLeave={() => { if (dropIdx === i) setDropIdx(null); }}
                        className={`rounded-xl bg-slate-800/50 border p-3 space-y-2 cursor-grab active:cursor-grabbing transition-all ${
                          m.bold ? 'border-cyan-500/40' : 'border-slate-700/50'
                        } ${isDragOver ? 'border-cyan-400/70 bg-cyan-500/5 shadow-lg shadow-cyan-500/10' : ''}`}
                      >
                        {/* Row 1: Drag handle + ID + Description + KPI + Type + Bold + Delete */}
                        <div className="flex gap-2 items-center flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 cursor-grab text-sm select-none" title="拖拽排序">⠇</span>
                            <div className="flex flex-col gap-0.5">
                              <button onClick={() => moveMilestone(i, -1)} disabled={i === 0} className="text-slate-400 hover:text-cyan-400 disabled:opacity-20 text-xs leading-none px-0.5">▲</button>
                              <button onClick={() => moveMilestone(i, 1)} disabled={i === editMs.length - 1} className="text-slate-400 hover:text-cyan-400 disabled:opacity-20 text-xs leading-none px-0.5">▼</button>
                            </div>
                          </div>
                          <input value={m.id} onChange={e => setMilestone(i, 'id', e.target.value)} className="w-24 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-500/50" placeholder="id" />
                          <input value={m.desc} onChange={e => setMilestone(i, 'desc', e.target.value)} className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 min-w-[120px] sm:min-w-[180px]" placeholder="活动描述" />
                          <input value={m.kpi} onChange={e => setMilestone(i, 'kpi', e.target.value)} className="w-36 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50" placeholder="KPI" />
                          <select value={m.type} onChange={e => setMilestone(i, 'type', e.target.value)} className="bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50">
                            <option value="研发">🔵 研发</option>
                            <option value="注册">🟣 注册</option>
                            <option value="融资">🟡 融资</option>
                            <option value="商业化">🟢 商业化</option>
                          </select>
                          <label className="flex items-center gap-1 text-xs text-slate-300"><input type="checkbox" checked={m.bold} onChange={e => setMilestone(i, 'bold', e.target.checked)} className="accent-cyan-500" /> ★</label>
                          <button onClick={() => removeMilestone(i)} className="text-red-400 hover:text-red-300 text-xs px-1.5">✕</button>
                        </div>

                        {/* Row 2: Start/End/Duration + Predecessor + Lag */}
                        <div className="flex gap-2 items-center flex-wrap text-xs">
                          <span className="text-slate-300 w-12">开始M</span>
                          <input type="number" value={m.startM} min={1} max={60} onChange={e => { const v = parseInt(e.target.value) || 1; setMilestone(i, 'startM', v); }} className="w-16 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 text-center" />
                          <span className="text-slate-300 w-12">结束M</span>
                          <input type="number" value={m.endM} min={m.startM} max={60} onChange={e => { const v = parseInt(e.target.value) || m.startM; setMilestone(i, 'endM', v); }} className="w-16 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 text-center" />
                          <span className="text-slate-300">工期: <span className="text-white font-semibold">{duration}月</span></span>

                          <span className="text-slate-500 mx-1">|</span>

                          <span className="text-slate-300">前置:</span>
                          <select
                            value={m.predecessorId || ''}
                            onChange={e => {
                              const val = e.target.value || null;
                              let next = editMs.map((item, j) => j === i ? { ...item, predecessorId: val, manualStart: !val } : item);
                              next = resolveMilestones(next);
                              onModelChange({ ...model, [msKey]: next });
                            }}
                            className="bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 max-w-[120px]"
                          >
                            <option value="">无</option>
                            {editMs.filter(other => other.id !== m.id).map(other => (
                              <option key={other.id} value={other.id}>{other.id}</option>
                            ))}
                          </select>

                          {m.predecessorId && (
                            <>
                              <span className="text-slate-300">Lag:</span>
                              <input type="number" value={m.lagMonths} onChange={e => setMilestone(i, 'lagMonths', parseInt(e.target.value) || 0)} className="w-14 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 text-center" />
                              <span className="text-slate-300">月</span>
                            </>
                          )}

                          {isAutoShifted && (
                            <span className="text-amber-300 text-xs ml-1">→ 实际M{rm.startM}–M{rm.endM} ({resolvedDuration}月)</span>
                          )}
                        </div>

                        {/* Row 3: Cross-scenario reference */}
                        {otherRef && (
                          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-700/20 border border-slate-700/30">
                            <span className="text-xs text-slate-300 flex-shrink-0">{msCase === 'best' ? '📊' : '🚀'} {otherLabel}参考:</span>
                            <span className="text-xs font-mono text-slate-200">
                              M{otherRef.startM}–M{otherRef.endM}
                              <span className="text-slate-400 ml-1">({otherRef.endM - otherRef.startM + 1}月)</span>
                            </span>
                            {otherRef.startM !== rm.startM || otherRef.endM !== rm.endM ? (
                              <span className="text-xs text-amber-300 ml-1">
                                Δ{otherRef.startM - rm.startM >= 0 ? '+' : ''}{otherRef.startM - rm.startM}月开始
                                {otherRef.endM !== rm.endM && (<>, Δ{otherRef.endM - rm.endM >= 0 ? '+' : ''}{otherRef.endM - rm.endM}月结束</>)}
                              </span>
                            ) : (
                              <span className="text-xs text-green-300 ml-1">✓ 一致</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ===== PROJECTION ===== */}
        {tab === 'projection' && (() => {
          const fmtWan = (n: number) => { const v = n / 10000; return v >= 10000 ? `${(v / 10000).toFixed(2)}亿` : `${Math.round(v)}万`; };

          const scRevs: number[] = scenarioResult.years.map(yr => yr.total_revenue);

          return (
            <div className="space-y-4">
              <SectionTitle>1–10年测算 — {activeScenario === 'optimistic' ? '🟢乐观' : activeScenario === 'conservative' ? '🟠保守' : '🔵中性'} × {activeTimeline === 'aggressive' ? '🚀激进' : '📊标准'}</SectionTitle>
              <p className="text-xs text-slate-300">Y1–5 由模型自动计算 · Y6–10 基于Y5按场景增长率推演 · 行业对标: 推想30-50% / 鹰瞳25-40%</p>

              <ScenarioBlock scenario={activeScenario} title="Y6-Y10 收入增长率">
                <div className="grid grid-cols-5 gap-3">
                  <ScenarioDarkInput label="Y6 增长率" value={so.growth_y6} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].growth_y6} onChange={v => setSO('growth_y6', v)} step={0.05} scenario={activeScenario} />
                  <ScenarioDarkInput label="Y7 增长率" value={so.growth_y7} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].growth_y7} onChange={v => setSO('growth_y7', v)} step={0.05} scenario={activeScenario} />
                  <ScenarioDarkInput label="Y8 增长率" value={so.growth_y8} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].growth_y8} onChange={v => setSO('growth_y8', v)} step={0.05} scenario={activeScenario} />
                  <ScenarioDarkInput label="Y9 增长率" value={so.growth_y9} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].growth_y9} onChange={v => setSO('growth_y9', v)} step={0.05} scenario={activeScenario} />
                  <ScenarioDarkInput label="Y10 增长率" value={so.growth_y10} def={DEFAULT_SCENARIO_OVERRIDES[activeScenario].growth_y10} onChange={v => setSO('growth_y10', v)} step={0.05} scenario={activeScenario} />
                </div>
              </ScenarioBlock>

              <SectionTitle>10年收入 + EBITDA 预览</SectionTitle>
              <div className="overflow-x-auto rounded-lg border border-slate-700/50">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="text-left px-3 py-2 text-cyan-400 font-semibold w-[100px]">指标</th>
                      {Array.from({ length: 10 }, (_, i) => (
                        <th key={i} className={`text-right px-2 py-2 font-semibold ${i < 5 ? 'text-cyan-400' : 'text-orange-400'}`}>
                          Y{i + 1}{i >= 5 ? ' ⬆' : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-700/30">
                      <td className="px-3 py-2 text-slate-400">收入</td>
                      {scRevs.map((r, i) => (
                        <td key={i} className={`text-right px-2 py-2 font-mono ${i < 5 ? 'text-slate-200' : 'text-orange-300'}`}>{fmtWan(r)}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-700/30">
                      <td className="px-3 py-2 text-slate-400">YoY</td>
                      {scRevs.map((r, i) => {
                        const pct = i === 0 ? null : scRevs[i - 1] === 0 ? null : (r / scRevs[i - 1] - 1) * 100;
                        const isAnomaly = pct !== null && (pct > 200 || pct < -50);
                        return (
                          <td key={i} className={`text-right px-2 py-2 font-mono ${isAnomaly ? 'text-amber-400' : 'text-slate-400'}`}>
                            {pct === null ? '—' : `${pct.toFixed(0)}%`}
                            {isAnomaly && <span className="text-[8px] block text-amber-500">⚠</span>}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-t border-slate-700/30">
                      <td className="px-3 py-2 text-slate-400">EBITDA</td>
                      {scenarioResult.years.map((yr, i) => (
                        <td key={i} className={`text-right px-2 py-2 font-mono font-bold ${yr.ebitda >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {fmtWan(yr.ebitda)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-cyan-500/20 bg-cyan-500/5">
                      <td className="px-3 py-2 text-cyan-300 font-bold">ARR</td>
                      {scenarioResult.years.map((yr, i) => {
                        const arr = yr.active_paying * g.price_saas_c2 / 10000;
                        return <td key={i} className="text-right px-2 py-2 text-cyan-300 font-mono font-bold">{fmtWan(arr * 10000)}</td>;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* YoY anomaly explanation for Base/standard timeline */}
              {activeTimeline === 'standard' && (
                <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 leading-relaxed">
                  ⚠ <strong>标准时间线 YoY 异常说明:</strong> Base Case中Y3首年商业化→Y4仅续约收入(死亡谷/无新硬件+授权金消失)→Y5 C3大规模部署反弹。这是有意的保守场景设计，非计算错误。
                </div>
              )}

              {/* EBITDA breakdown reference table */}
              <SectionTitle>EBITDA 成本结构参考</SectionTitle>
              {(() => {
                const bom_c2 = scenarioResult.bom_c2;
                const bom_c3 = scenarioResult.bom_c3;
                const bom_upg = scenarioResult.bom_upgrade;
                return (
              <div className="overflow-x-auto rounded-lg border border-slate-700/50">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-800/80">
                      <th className="text-left px-3 py-2 text-cyan-400 font-semibold w-[100px]">成本项</th>
                      {Array.from({ length: 10 }, (_, i) => (
                        <th key={i} className={`text-right px-2 py-2 font-semibold ${i < 5 ? 'text-cyan-400' : 'text-orange-400'}`}>
                          Y{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-700/30">
                      <td className="px-3 py-2 text-slate-400">薪资合计</td>
                      {scenarioResult.years.map((yr, i) => (
                        <td key={i} className="text-right px-2 py-2 font-mono text-slate-300">{fmtWan(yr.opex_detail.salary)}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-700/30">
                      <td className="px-3 py-2 text-slate-400">其他OpEx</td>
                      {scenarioResult.years.map((yr, i) => {
                        const otherOpex = yr.opex - yr.opex_detail.salary;
                        return <td key={i} className="text-right px-2 py-2 font-mono text-slate-300">{fmtWan(otherOpex)}</td>;
                      })}
                    </tr>
                    <tr className="border-t border-slate-700/30 bg-slate-800/20">
                      <td className="px-3 py-2 text-slate-400 font-medium">OpEx 合计</td>
                      {scenarioResult.years.map((yr, i) => (
                        <td key={i} className="text-right px-2 py-2 font-mono text-slate-200 font-medium">{fmtWan(yr.opex)}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-700/30">
                      <td className="px-3 py-2 text-slate-500 text-[10px] pl-5">┗ 直销C2</td>
                      {scenarioResult.years.map((yr, i) => {
                        const v = i < 5 ? yr.direct_c2 * bom_c2 : yr.cogs * 0.4;
                        return <td key={i} className="text-right px-2 py-2 font-mono text-slate-500 text-[10px]">{fmtWan(v)}</td>;
                      })}
                    </tr>
                    <tr className="border-t border-slate-700/20">
                      <td className="px-3 py-2 text-slate-500 text-[10px] pl-5">┗ 直销C3</td>
                      {scenarioResult.years.map((yr, i) => {
                        const v = i < 5 ? yr.direct_c3 * bom_c3 : yr.cogs * 0.4;
                        return <td key={i} className="text-right px-2 py-2 font-mono text-slate-500 text-[10px]">{fmtWan(v)}</td>;
                      })}
                    </tr>
                    <tr className="border-t border-slate-700/20">
                      <td className="px-3 py-2 text-slate-500 text-[10px] pl-5">┗ 升级 COGS</td>
                      {scenarioResult.years.map((yr, i) => {
                        const v = i < 5 ? yr.actual_upgrade * bom_upg : 0;
                        return <td key={i} className="text-right px-2 py-2 font-mono text-slate-500 text-[10px]">{v > 0 ? fmtWan(v) : '—'}</td>;
                      })}
                    </tr>
                    <tr className="border-t border-slate-700/30 bg-slate-800/20">
                      <td className="px-3 py-2 text-slate-400 font-medium">COGS 合计</td>
                      {scenarioResult.years.map((yr, i) => (
                        <td key={i} className="text-right px-2 py-2 font-mono text-slate-200 font-medium">{fmtWan(yr.cogs)}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-700/30">
                      <td className="px-3 py-2 text-amber-400/80" title="COGS比率 = COGS ÷ 总收入 × 100%&#10;Y1-5: BOM驱动 (C2×单台BOM + C3×单台BOM + 升级×BOM)&#10;Y6-10: 按目标COGS率推演">COGS比率 ⓘ</td>
                      {scenarioResult.years.map((yr, i) => {
                        const rate = yr.total_revenue > 0 ? (yr.cogs / yr.total_revenue * 100) : 0;
                        return (
                          <td key={i} className={`text-right px-2 py-2 font-mono ${rate > 50 ? 'text-red-400' : rate > 40 ? 'text-amber-400' : 'text-green-400'}`}>
                            {yr.total_revenue > 0 ? `${rate.toFixed(0)}%` : '—'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-t border-cyan-500/20 bg-cyan-500/5">
                      <td className="px-3 py-2 text-cyan-300 font-bold">EBITDA</td>
                      {scenarioResult.years.map((yr, i) => (
                        <td key={i} className={`text-right px-2 py-2 font-mono font-bold ${yr.ebitda >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {fmtWan(yr.ebitda)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
                );
              })()}
              <div className="rounded-lg p-3 bg-slate-800/50 border border-slate-700/30 text-[11px] text-slate-500 leading-relaxed space-y-1">
                <div>📐 <strong>EBITDA</strong> = 总收入 − COGS − OpEx合计 （即 毛利 − 运营费用）</div>
                <div>📐 <strong>COGS比率</strong> = COGS ÷ 总收入 × 100%</div>
                <div>　　Y1-5: COGS = Σ(直销C2 × BOM_C2 + 直销C3 × BOM_C3 + 升级 × BOM_升级)  ⚠经销商渠道不计BOM</div>
                <div>　　Y6-10: COGS = 总收入 × 目标COGS率 ({(so.cogs_rate_target * 100).toFixed(0)}%)</div>
                <div>📐 <strong>薪资合计</strong> (Y1-5) = 团队人数 × 人均薪资 （OpEx tab 手动设置）</div>
                <div>　　Y6-10: 薪资<sub>Yn</sub> = 薪资<sub>Yn-1</sub> × (1 + OpEx增速<sub>Yn</sub>)</div>
                <div>　　当前: Y6={(so.opex_growth_y6 * 100).toFixed(0)}% → Y7={(so.opex_growth_y7 * 100).toFixed(0)}% → Y8={(so.opex_growth_y8 * 100).toFixed(0)}% → Y9={(so.opex_growth_y9 * 100).toFixed(0)}% → Y10={(so.opex_growth_y10 * 100).toFixed(0)}%</div>
                <div>📐 <strong>其他OpEx</strong> (Y6-10): 注册/合规/专利/差旅按同比例增长，CDMO/CRO/试产归零</div>
              </div>

              <div className="rounded-lg p-3 bg-slate-800/50 border border-slate-700/30 text-xs text-slate-400 leading-relaxed">
                💡 Y1–5由部署量×定价×SaaS续约自动计算。Y6–10按场景增长率推演。ARR = 活跃付费床位 × 年化单床SaaS (¥{(g.price_saas_c2 / 10000).toFixed(2)}万/床)。续约率={Math.round(so.rr_base * 100)}%。
              </div>
            </div>
          );
        })()}

        {/* ===== NOTES ===== */}
        {tab === 'notes' && (
          <div className="space-y-4">
            <SectionTitle>假设与依据注释 (路演答疑用)</SectionTitle>
            <p className="text-xs text-slate-300">每条注释对应一个模块。投资人提问时可引用。修改后自动存档。</p>
            {Object.keys(DEFAULT_ANNOTATIONS).map(key => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">{key}</label>
                <textarea
                  value={model.annotations[key] || ''}
                  onChange={e => setAnnotation(key, e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500/50 resize-y leading-relaxed"
                />
              </div>
            ))}
          </div>
        )}

        {/* ===== PROFILES ===== */}
        {tab === 'profiles' && (
          <div className="space-y-4">
            <SectionTitle>参数存档管理</SectionTitle>
            <p className="text-xs text-slate-300">命名保存当前全部参数，随时加载回复。支持多套方案对比。</p>

            <div className="flex gap-2">
              <input
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                placeholder="输入存档名称（如：路演版、保守测算）"
                className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-500/50"
                onKeyDown={e => e.key === 'Enter' && handleSaveProfile()}
              />
              <button onClick={handleSaveProfile} disabled={!profileName.trim()} className="px-4 py-2 text-xs rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold disabled:opacity-30 hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
                💾 保存
              </button>
            </div>

            {profiles.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">暂无存档 · 保存一个开始吧</div>
            ) : (
              <div className="space-y-2">
                {profiles.map(p => (
                  <div key={p.name} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
                    <div>
                      <div className="text-sm text-white font-semibold">{p.name}</div>
                      <div className="text-xs text-slate-400">{new Date(p.timestamp).toLocaleString('zh-CN')}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleLoadProfile(p.name)} className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all">加载</button>
                      <button onClick={() => { saveProfile(p.name, model); setProfiles(listProfiles()); }} className="px-3 py-1.5 text-xs rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 transition-all">覆盖</button>
                      <button onClick={() => handleDeleteProfile(p.name)} className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all">删除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Archive Sidebar */}
      {showArchive && (
        <div className="w-72 flex-shrink-0 border-l border-slate-700/50 bg-slate-900/60 px-4 py-5 overflow-y-auto max-h-[600px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-purple-300">📚 存档历史</h3>
            <button onClick={() => setShowArchive(false)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
          </div>
          {archives.length === 0 ? (
            <p className="text-xs text-slate-500">暂无存档。接受参数变更后将自动生成。</p>
          ) : (
            <div className="space-y-2">
              {archives.map(a => (
                <div key={a.id} className={`rounded-lg border p-2.5 space-y-1.5 ${
                  a.type === 'financial_plan' ? 'border-cyan-500/30 bg-cyan-500/5' :
                  a.type === 'bp' ? 'border-green-500/30 bg-green-500/5' :
                  'border-purple-500/30 bg-purple-500/5'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      a.type === 'financial_plan' ? 'text-cyan-400' :
                      a.type === 'bp' ? 'text-green-400' : 'text-purple-400'
                    }`}>
                      {a.type === 'financial_plan' ? '📄 Financial Plan' :
                       a.type === 'bp' ? '📋 BP' : '📊 Roadshow'}
                    </span>
                    <span className="text-[10px] text-slate-500">{a.version}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{a.label}</p>
                  <p className="text-[10px] text-slate-500">{new Date(a.timestamp).toLocaleString('zh-CN')}</p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        if (a.modelSnapshot) {
                          onModelChange(a.modelSnapshot);
                        }
                      }}
                      className="px-2 py-0.5 text-[10px] rounded bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/50 transition-all"
                    >
                      加载参数
                    </button>
                    <button
                      onClick={() => {
                        const ext = a.type === 'roadshow' ? '.html' : '.md';
                        const name = a.type === 'financial_plan' ? 'ARIA_Financial_Plan' :
                                     a.type === 'bp' ? 'ARIA_BP' : 'ARIA_Roadshow';
                        downloadFile(a.content, `${name}_${a.version}${ext}`);
                      }}
                      className="px-2 py-0.5 text-[10px] rounded bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-600/50 transition-all"
                    >
                      下载
                    </button>
                    <button
                      onClick={async () => {
                        if (a.id) {
                          await deleteArchive(a.id);
                          refreshArchives();
                        }
                      }}
                      className="px-2 py-0.5 text-[10px] rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Validation warnings */}
      {(() => {
        const warnings = validateModel(model);
        if (warnings.length === 0) return null;
        return (
          <div className="px-6 pb-3">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
              <p className="text-[11px] font-semibold text-amber-300">⚠ 参数校验</p>
              {warnings.map((w, i) => (
                <p key={i} className={`text-[11px] ${w.severity === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
                  {w.severity === 'error' ? '❌' : '⚠️'} {w.message}
                </p>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Close confirmation dialog */}
      {showCloseDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
          <div className="bg-slate-800 border border-slate-600/60 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg">⚠️</div>
              <div>
                <h3 className="text-white font-bold text-sm">参数已修改</h3>
                <p className="text-[11px] text-slate-400">关闭前是否保存当前修改？</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={handleCloseDiscard} className="px-4 py-2 text-xs rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all">
                不保存
              </button>
              <button onClick={handleCloseSaveAs} className="px-4 py-2 text-xs rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-all">
                命名存档
              </button>
              <button onClick={handleCloseSave} className="px-4 py-2 text-xs rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition-all">
                💾 保存并关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Sub-components ----

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-slate-200 tracking-wide flex items-center gap-2">{children}</h3>;
}

function BPBadges({ tabKey }: { tabKey: TabKey }) {
  const group = TAB_PARAM_GROUP[tabKey];
  if (!group) return null;
  const blockIds = PARAM_MAPPING[group] || [];
  if (blockIds.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      <span className="text-[10px] text-slate-500 self-center">影响BP:</span>
      {blockIds.map(id => {
        const block = MAPPING_BLOCKS.find(b => b.id === id);
        return (
          <span key={id} className="rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 px-2 py-0.5 text-[10px] font-medium" title={block?.description || ''}>
            {id} {block?.label || ''}
          </span>
        );
      })}
    </div>
  );
}

function NoteBar({ text, annotationKey, onChange }: { text: string; annotationKey: string; onChange: (key: string, val: string) => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="rounded-lg bg-slate-800/40 border border-slate-700/40 px-3 py-2 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
      <span className="text-cyan-500 mt-0.5">ℹ</span>
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={e => onChange(annotationKey, e.target.value)}
          onBlur={() => setEditing(false)}
          rows={2}
          className="flex-1 bg-transparent text-slate-300 outline-none resize-y text-[11px] leading-relaxed"
        />
      ) : (
        <span onClick={() => setEditing(true)} className="flex-1 cursor-pointer hover:text-slate-200 transition-colors">
          {text} <span className="text-cyan-500/50 ml-1">✎</span>
        </span>
      )}
    </div>
  );
}

function DarkInput({ label, value, def, onChange, step = 1000 }: {
  label: string; value: number; def: number; onChange: (v: number) => void; step?: number;
}) {
  const modified = value !== def;
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-0.5 uppercase tracking-wider">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full px-2.5 py-1.5 text-xs rounded-lg outline-none transition-all ${
          modified
            ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/10'
            : 'bg-slate-800/50 border border-slate-700/50 text-slate-300'
        } focus:border-cyan-500/60 focus:shadow-md focus:shadow-cyan-500/10`}
      />
    </div>
  );
}

function DarkTable({ children }: { children: React.ReactNode }) {
  const editLabels = YEAR_LABELS.slice(0, 5);
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 px-2 text-slate-500 font-medium w-[120px] bg-slate-800/30">参数</th>
            {editLabels.map(l => <th key={l} className="text-center py-2 px-2 text-slate-500 font-medium bg-slate-800/30">{l}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function DarkRow({ label, values, defaults, onChange }: {
  label: string; values: number[]; defaults: number[]; onChange: (idx: number, val: number) => void;
}) {
  return (
    <tr className="border-b border-slate-700/30">
      <td className="py-1.5 px-2 font-medium text-slate-300 text-xs">{label}</td>
      {values.map((v, i) => {
        const modified = Math.abs(v - defaults[i]) > 0.001;
        return (
          <td key={i} className="py-1 px-1 text-center">
            <input
              type="number"
              value={v}
              onChange={e => onChange(i, Number(e.target.value))}
              className={`w-full px-1.5 py-1 text-xs rounded text-center outline-none transition-all ${
                modified
                  ? 'bg-cyan-500/10 border border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-300'
              } focus:border-cyan-500/60`}
            />
          </td>
        );
      })}
    </tr>
  );
}

function FundingCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${color} border p-4 space-y-3`}>
      <div className="text-xs text-slate-300 font-bold uppercase tracking-wider">{title}</div>
      {children}
    </div>
  );
}

const SCENARIO_COLORS: Record<string, { border: string; bg: string; text: string; label: string }> = {
  neutral: { border: 'border-blue-500/40', bg: 'bg-blue-500/8', text: 'text-blue-300', label: '🔵 中性' },
  optimistic: { border: 'border-green-500/40', bg: 'bg-green-500/8', text: 'text-green-300', label: '🟢 乐观' },
  conservative: { border: 'border-orange-500/40', bg: 'bg-orange-500/8', text: 'text-orange-300', label: '🟠 保守' },
};

function ScenarioBlock({ scenario, title, children }: { scenario: string; title: string; children: React.ReactNode }) {
  const c = SCENARIO_COLORS[scenario] || SCENARIO_COLORS.neutral;
  return (
    <div className={`rounded-xl ${c.bg} border ${c.border} p-4 space-y-3`}>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{c.label} — {title}</span>
        <span className="text-[10px] text-slate-500">场景专属参数</span>
      </div>
      {children}
    </div>
  );
}

function ScenarioDarkInput({ label, value, def, onChange, step = 0.01, scenario }: {
  label: string; value: number; def: number; onChange: (v: number) => void; step?: number; scenario: string;
}) {
  const modified = Math.abs(value - def) > 0.0001;
  const c = SCENARIO_COLORS[scenario] || SCENARIO_COLORS.neutral;
  return (
    <div>
      <label className={`text-xs block mb-0.5 uppercase tracking-wider ${c.text}`}>{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full px-2.5 py-1.5 text-xs rounded-lg outline-none transition-all ${
          modified
            ? `${c.bg} border ${c.border} ${c.text} shadow-sm`
            : 'bg-slate-800/50 border border-slate-700/50 text-slate-300'
        } focus:border-cyan-500/60 focus:shadow-md focus:shadow-cyan-500/10`}
      />
    </div>
  );
}
