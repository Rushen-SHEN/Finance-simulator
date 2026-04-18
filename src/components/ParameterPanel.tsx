'use client';

import { useState, useEffect, useCallback } from 'react';
import { GlobalInputs, YearlyInputs, OpExDetail, FundingInputs, MilestoneItem, ModelInputs, resolveMilestones } from '@/lib/calculator';
import { DEFAULT_MODEL, YEAR_LABELS, OPEX_LABELS, COGS_LABELS, DEFAULT_ANNOTATIONS } from '@/lib/defaults';
import { listProfiles, saveProfile, loadProfile, deleteProfile, ProfileEntry } from '@/lib/storage';

interface Props {
  model: ModelInputs;
  onModelChange: (m: ModelInputs) => void;
  onReset: () => void;
  onClose: () => void;
}

type TabKey = 'pricing' | 'cogs' | 'deploy' | 'opex' | 'funding' | 'milestones' | 'notes' | 'profiles';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'pricing', label: '定价', icon: '💰' },
  { key: 'cogs', label: 'BOM/COGS', icon: '🔧' },
  { key: 'deploy', label: '部署', icon: '🏥' },
  { key: 'opex', label: 'OpEx', icon: '📊' },
  { key: 'funding', label: '融资', icon: '🏦' },
  { key: 'milestones', label: '里程碑', icon: '🎯' },
  { key: 'notes', label: '注释', icon: '📝' },
  { key: 'profiles', label: '存档', icon: '💾' },
];

export default function ParameterPanel({ model, onModelChange, onReset, onClose }: Props) {
  const [tab, setTab] = useState<TabKey>('pricing');
  const [profiles, setProfiles] = useState<ProfileEntry[]>([]);
  const [profileName, setProfileName] = useState('');

  useEffect(() => { setProfiles(listProfiles()); }, []);

  const g = model.global;
  const y = model.yearly;
  const ox = model.opex;
  const f = model.funding;

  const setG = useCallback((key: keyof GlobalInputs, val: number) => {
    onModelChange({ ...model, global: { ...model.global, [key]: val } });
  }, [model, onModelChange]);

  const setY = useCallback((key: keyof YearlyInputs, idx: number, val: number) => {
    const next = { ...model.yearly, [key]: [...model.yearly[key]] };
    next[key][idx] = val;
    onModelChange({ ...model, yearly: next });
  }, [model, onModelChange]);

  const setOx = useCallback((key: keyof OpExDetail, idx: number, val: number) => {
    const next = { ...model.opex, [key]: [...model.opex[key]] };
    next[key][idx] = val;
    onModelChange({ ...model, opex: next });
  }, [model, onModelChange]);

  const setF = useCallback((key: keyof FundingInputs, val: number) => {
    onModelChange({ ...model, funding: { ...model.funding, [key]: val } });
  }, [model, onModelChange]);

  const [msCase, setMsCase] = useState<'best' | 'base'>('best');

  const currentMs = msCase === 'best' ? model.milestones_best : model.milestones_base;
  const msKey = msCase === 'best' ? 'milestones_best' : 'milestones_base';

  const setMilestone = useCallback((idx: number, field: keyof MilestoneItem, val: string | boolean | number) => {
    const next = currentMs.map((m, i) => {
      if (i !== idx) return m;
      const updated = { ...m, [field]: val };
      // If user manually sets startM or endM, mark as manual
      if (field === 'startM') updated.manualStart = true;
      return updated;
    });
    // Resolve predecessor chains after edit
    onModelChange({ ...model, [msKey]: next });
  }, [model, onModelChange, currentMs, msKey]);

  const addMilestone = useCallback(() => {
    const newId = 'ms_' + Date.now().toString(36);
    const item: MilestoneItem = { id: newId, desc: '新活动', kpi: '', type: '商业化', bold: false, startM: 1, endM: 3, predecessorId: null, lagMonths: 0, manualStart: true };
    onModelChange({ ...model, [msKey]: [...currentMs, item] });
  }, [model, onModelChange, currentMs, msKey]);

  const removeMilestone = useCallback((idx: number) => {
    const removedId = currentMs[idx].id;
    // Clear predecessor references to deleted item
    const next = currentMs.filter((_, i) => i !== idx).map(m =>
      m.predecessorId === removedId ? { ...m, predecessorId: null, manualStart: true } : m
    );
    onModelChange({ ...model, [msKey]: next });
  }, [model, onModelChange, currentMs, msKey]);

  const setAnnotation = useCallback((key: string, val: string) => {
    onModelChange({ ...model, annotations: { ...model.annotations, [key]: val } });
  }, [model, onModelChange]);

  const handleSaveProfile = useCallback(() => {
    if (!profileName.trim()) return;
    saveProfile(profileName.trim(), model);
    setProfiles(listProfiles());
    setProfileName('');
  }, [profileName, model]);

  const handleLoadProfile = useCallback((name: string) => {
    const data = loadProfile(name);
    if (data) onModelChange(data);
  }, [onModelChange]);

  const handleDeleteProfile = useCallback((name: string) => {
    deleteProfile(name);
    setProfiles(listProfiles());
  }, []);

  const isModified = (val: number, def: number) => val !== def;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl p-0 my-5 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-cyan-500/20">⚙</div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">参数控制台</h2>
            <p className="text-[11px] text-slate-400">实时调整 · 全量存档 · 投资人路演专属</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onReset} className="px-3 py-1.5 text-xs rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:bg-orange-500/20 transition-all">
            ↻ 恢复默认
          </button>
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:bg-slate-600/50 transition-all">
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

      {/* Content */}
      <div className="px-6 py-5 min-h-[320px]">

        {/* ===== PRICING ===== */}
        {tab === 'pricing' && (
          <div className="space-y-4">
            <SectionTitle>产品定价 (元/床)</SectionTitle>
            <NoteBar text={model.annotations.pricing} annotationKey="pricing" onChange={setAnnotation} />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <DarkInput label="二类硬件" value={g.price_hw_c2} def={DEFAULT_MODEL.global.price_hw_c2} onChange={v => setG('price_hw_c2', v)} />
              <DarkInput label="三类硬件" value={g.price_hw_c3} def={DEFAULT_MODEL.global.price_hw_c3} onChange={v => setG('price_hw_c3', v)} />
              <DarkInput label="升级服务" value={g.price_upgrade} def={DEFAULT_MODEL.global.price_upgrade} onChange={v => setG('price_upgrade', v)} />
              <DarkInput label="二类SaaS/年" value={g.price_saas_c2} def={DEFAULT_MODEL.global.price_saas_c2} onChange={v => setG('price_saas_c2', v)} />
              <DarkInput label="三类SaaS/年" value={g.price_saas_c3} def={DEFAULT_MODEL.global.price_saas_c3} onChange={v => setG('price_saas_c3', v)} />
              <DarkInput label="大客户5年SaaS/年" value={g.price_saas_c3_bulk} def={DEFAULT_MODEL.global.price_saas_c3_bulk} onChange={v => setG('price_saas_c3_bulk', v)} />
            </div>
            <SectionTitle>关键比率</SectionTitle>
            <NoteBar text={model.annotations.renewal} annotationKey="renewal" onChange={setAnnotation} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DarkInput label="SaaS续约率" value={g.rr_base} def={DEFAULT_MODEL.global.rr_base} onChange={v => setG('rr_base', v)} step={0.05} />
              <DarkInput label="Baxter HW分成" value={g.baxter_hw_commission} def={DEFAULT_MODEL.global.baxter_hw_commission} onChange={v => setG('baxter_hw_commission', v)} step={0.01} />
              <DarkInput label="Baxter SaaS分成" value={g.baxter_saas_commission} def={DEFAULT_MODEL.global.baxter_saas_commission} onChange={v => setG('baxter_saas_commission', v)} step={0.01} />
            </div>
            <SectionTitle>ROI价值锚点 (元/床/年)</SectionTitle>
            <NoteBar text={model.annotations.roi} annotationKey="roi" onChange={setAnnotation} />
            <div className="grid grid-cols-2 gap-3">
              <DarkInput label="C2创造价值" value={g.value_anchor_c2} def={DEFAULT_MODEL.global.value_anchor_c2} onChange={v => setG('value_anchor_c2', v)} />
              <DarkInput label="C3创造价值" value={g.value_anchor_c3} def={DEFAULT_MODEL.global.value_anchor_c3} onChange={v => setG('value_anchor_c3', v)} />
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
          </div>
        )}

        {/* ===== DEPLOY ===== */}
        {tab === 'deploy' && (
          <div className="space-y-4">
            <SectionTitle>年度部署计划 (床位数)</SectionTitle>
            <NoteBar text={model.annotations.deployment} annotationKey="deployment" onChange={setAnnotation} />
            <DarkTable>
              <DarkRow label="直销 C2" values={y.direct_c2} defaults={DEFAULT_MODEL.yearly.direct_c2} onChange={(i, v) => setY('direct_c2', i, v)} />
              <DarkRow label="直销 C3" values={y.direct_c3} defaults={DEFAULT_MODEL.yearly.direct_c3} onChange={(i, v) => setY('direct_c3', i, v)} />
              <DarkRow label="Baxter C2" values={y.baxter_c2} defaults={DEFAULT_MODEL.yearly.baxter_c2} onChange={(i, v) => setY('baxter_c2', i, v)} />
              <DarkRow label="Baxter C3" values={y.baxter_c3} defaults={DEFAULT_MODEL.yearly.baxter_c3} onChange={(i, v) => setY('baxter_c3', i, v)} />
              <DarkRow label="升级 C2→C3" values={y.planned_upgrade} defaults={DEFAULT_MODEL.yearly.planned_upgrade} onChange={(i, v) => setY('planned_upgrade', i, v)} />
              <DarkRow label="授权金(万)" values={y.baxter_license.map(v => v / 10000)} defaults={DEFAULT_MODEL.yearly.baxter_license.map(v => v / 10000)} onChange={(i, v) => setY('baxter_license', i, v * 10000)} />
              <DarkRow label="折旧(万)" values={y.depreciation.map(v => v / 10000)} defaults={DEFAULT_MODEL.yearly.depreciation.map(v => v / 10000)} onChange={(i, v) => setY('depreciation', i, v * 10000)} />
            </DarkTable>
          </div>
        )}

        {/* ===== OPEX ===== */}
        {tab === 'opex' && (
          <div className="space-y-4">
            <SectionTitle>运营费用明细 (万元)</SectionTitle>
            <NoteBar text={model.annotations.opex} annotationKey="opex" onChange={setAnnotation} />
            <DarkTable>
              {(Object.keys(OPEX_LABELS) as (keyof OpExDetail)[]).map(key => (
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
          </div>
        )}

        {/* ===== FUNDING ===== */}
        {tab === 'funding' && (
          <div className="space-y-4">
            <SectionTitle>融资参数 (万元)</SectionTitle>
            <NoteBar text={model.annotations.funding} annotationKey="funding" onChange={setAnnotation} />
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

            <p className="text-[11px] text-slate-500">设置前置活动后，该活动的开始月份 = 前置活动结束月份 + Lag + 1。修改前置活动时所有依赖链自动重算。</p>

            {/* Resolved preview */}
            {(() => {
              const resolved = resolveMilestones(currentMs);
              return (
                <div className="space-y-2">
                  {currentMs.map((m, i) => {
                    const rm = resolved[i];
                    const duration = m.endM - m.startM + 1;
                    const resolvedDuration = rm.endM - rm.startM + 1;
                    const isAutoShifted = !m.manualStart && m.predecessorId && (rm.startM !== m.startM);

                    return (
                      <div key={m.id} className={`rounded-xl bg-slate-800/50 border p-3 space-y-2 ${m.bold ? 'border-cyan-500/40' : 'border-slate-700/50'}`}>
                        {/* Row 1: ID + Description + KPI + Type + Bold + Delete */}
                        <div className="flex gap-2 items-center flex-wrap">
                          <input value={m.id} onChange={e => setMilestone(i, 'id', e.target.value)} className="w-24 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-[10px] text-cyan-400 font-mono outline-none focus:border-cyan-500/50" placeholder="id" />
                          <input value={m.desc} onChange={e => setMilestone(i, 'desc', e.target.value)} className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 min-w-[180px]" placeholder="活动描述" />
                          <input value={m.kpi} onChange={e => setMilestone(i, 'kpi', e.target.value)} className="w-36 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50" placeholder="KPI" />
                          <select value={m.type} onChange={e => setMilestone(i, 'type', e.target.value)} className="bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50">
                            <option value="研发">🔵 研发</option>
                            <option value="注册">🟣 注册</option>
                            <option value="融资">🟡 融资</option>
                            <option value="商业化">🟢 商业化</option>
                          </select>
                          <label className="flex items-center gap-1 text-xs text-slate-400"><input type="checkbox" checked={m.bold} onChange={e => setMilestone(i, 'bold', e.target.checked)} className="accent-cyan-500" /> ★</label>
                          <button onClick={() => removeMilestone(i)} className="text-red-400/60 hover:text-red-400 text-xs px-1.5">✕</button>
                        </div>

                        {/* Row 2: Start/End/Duration + Predecessor + Lag */}
                        <div className="flex gap-2 items-center flex-wrap text-xs">
                          <span className="text-slate-500 w-12">开始M</span>
                          <input type="number" value={m.startM} min={1} max={60} onChange={e => { const v = parseInt(e.target.value) || 1; setMilestone(i, 'startM', v); }} className="w-16 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 text-center" />
                          <span className="text-slate-500 w-12">结束M</span>
                          <input type="number" value={m.endM} min={m.startM} max={60} onChange={e => { const v = parseInt(e.target.value) || m.startM; setMilestone(i, 'endM', v); }} className="w-16 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 text-center" />
                          <span className="text-slate-500">工期: <span className="text-white font-semibold">{duration}月</span></span>

                          <span className="text-slate-600 mx-1">|</span>

                          <span className="text-slate-500">前置:</span>
                          <select
                            value={m.predecessorId || ''}
                            onChange={e => {
                              const val = e.target.value || null;
                              const next = currentMs.map((item, j) => j === i ? { ...item, predecessorId: val, manualStart: !val } : item);
                              onModelChange({ ...model, [msKey]: next });
                            }}
                            className="bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 max-w-[120px]"
                          >
                            <option value="">无</option>
                            {currentMs.filter(other => other.id !== m.id).map(other => (
                              <option key={other.id} value={other.id}>{other.id}</option>
                            ))}
                          </select>

                          {m.predecessorId && (
                            <>
                              <span className="text-slate-500">Lag:</span>
                              <input type="number" value={m.lagMonths} onChange={e => setMilestone(i, 'lagMonths', parseInt(e.target.value) || 0)} className="w-14 bg-slate-700/50 border border-slate-600/50 rounded-md px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-500/50 text-center" />
                              <span className="text-slate-500">月</span>
                            </>
                          )}

                          {isAutoShifted && (
                            <span className="text-amber-400 text-[10px] ml-1">→ 实际M{rm.startM}–M{rm.endM} ({resolvedDuration}月)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ===== NOTES ===== */}
        {tab === 'notes' && (
          <div className="space-y-4">
            <SectionTitle>假设与依据注释 (路演答疑用)</SectionTitle>
            <p className="text-[11px] text-slate-500">每条注释对应一个模块。投资人提问时可引用。修改后自动存档。</p>
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
            <p className="text-[11px] text-slate-500">命名保存当前全部参数，随时加载回复。支持多套方案对比。</p>

            <div className="flex gap-2">
              <input
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                placeholder="输入存档名称（如：红杉路演版、保守测算）"
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
                      <div className="text-[10px] text-slate-500">{new Date(p.timestamp).toLocaleString('zh-CN')}</div>
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
    </div>
  );
}

// ---- Sub-components ----

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-slate-200 tracking-wide flex items-center gap-2">{children}</h3>;
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
      <label className="text-[10px] text-slate-500 block mb-0.5 uppercase tracking-wider">{label}</label>
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
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700/50">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 px-2 text-slate-500 font-medium w-[120px] bg-slate-800/30">参数</th>
            {YEAR_LABELS.map(l => <th key={l} className="text-center py-2 px-2 text-slate-500 font-medium bg-slate-800/30">{l}</th>)}
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
