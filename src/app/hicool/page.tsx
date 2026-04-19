'use client';

import { useEffect, useMemo, useState } from 'react';
import { calculate, ModelInputs } from '@/lib/calculator';
import { detectChanges } from '@/lib/changeTracker';
import { listArchives, saveArchive } from '@/lib/archiveStore';
import { loadModel } from '@/lib/storage';
import {
  HICOOL_LIMITS,
  HICOOL_TITLES,
  HicoolDraft,
  HicoolSectionKey,
  buildDefaultHicoolSections,
  buildHicoolSourceStamp,
  loadHicoolDraft,
  saveHicoolDraft,
} from '@/lib/hicool';

type HicoolArchivePayload = {
  draft: HicoolDraft;
  archivedAt: number;
  sourceStamp: ReturnType<typeof buildHicoolSourceStamp>;
};

const SECTION_ORDER: HicoolSectionKey[] = [
  'projectOverview',
  'productFeatures',
  'marketCapability',
  'teamIntro',
  'businessProgress',
  'investmentHighlights',
];

const SECTION_MAPPING: Record<HicoolSectionKey, string[]> = {
  projectOverview: ['Revenue', 'Milestones'],
  productFeatures: ['BOM', 'Pricing', 'Channel'],
  marketCapability: ['Deployment', 'Growth', 'Renewal', 'Funding'],
  teamIntro: ['Milestones'],
  businessProgress: ['Revenue', 'Funding', 'Milestones', 'Deployment'],
  investmentHighlights: ['Revenue', 'Growth', 'Pricing', 'Funding'],
};

const fmtTime = (ts: number) => new Date(ts).toLocaleString('zh-CN', { hour12: false });

export default function HicoolPage() {
  const [model, setModel] = useState<ModelInputs | null>(null);
  const [draft, setDraft] = useState<HicoolDraft | null>(null);
  const [archives, setArchives] = useState<Array<{ id: number; label: string; timestamp: number }>>([]);
  const [status, setStatus] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const current = loadModel();
    const scenario = current.active_scenario || 'neutral';
    const so = current.scenario_overrides?.[scenario];
    const result = calculate(current.global, current.yearly, current.opex, current.milestones_best, so);
    const loaded = loadHicoolDraft();

    if (loaded) {
      setDraft(loaded);
    } else {
      const seeded: HicoolDraft = {
        sections: buildDefaultHicoolSections(current, result),
        baselineModelSnapshot: current,
        reviewedForChangeKey: {},
        submissionVersion: 'HICOOL-V1',
        isSubmissionVersion: false,
        lastSavedAt: Date.now(),
      };
      setDraft(seeded);
      saveHicoolDraft(seeded);
    }

    setModel(current);
    setHydrated(true);

    void (async () => {
      const rows = await listArchives('hicool');
      setArchives(rows.filter((r) => r.id !== undefined).map((r) => ({ id: r.id as number, label: r.label, timestamp: r.timestamp })));
    })();
  }, []);

  const sourceStamp = useMemo(() => buildHicoolSourceStamp(Date.now()), [draft?.lastSavedAt]);

  const changeReport = useMemo(() => {
    if (!model || !draft) return null;
    return detectChanges(draft.baselineModelSnapshot, model);
  }, [model, draft]);

  const changeKey = useMemo(() => {
    if (!changeReport || !changeReport.hasChanges) return '';
    const groups = changeReport.changedGroups.map((g) => g.group).join('|');
    const impacts = changeReport.affectedRoadshowSlides.join('|');
    return `${groups}::${impacts}`;
  }, [changeReport]);

  const impacted = useMemo(() => {
    if (!changeReport || !changeReport.hasChanges) return new Set<HicoolSectionKey>();
    const groups = new Set(changeReport.changedGroups.map((g) => g.group));
    return new Set(
      SECTION_ORDER.filter((section) => SECTION_MAPPING[section].some((g) => groups.has(g))),
    );
  }, [changeReport]);

  const saveAll = (next: HicoolDraft, msg = '已保存草稿') => {
    saveHicoolDraft(next);
    setDraft(next);
    setStatus(`${msg}（${fmtTime(Date.now())}）`);
  };

  const saveSection = (key: HicoolSectionKey, value: string) => {
    if (!draft) return;
    saveAll(
      {
        ...draft,
        sections: { ...draft.sections, [key]: value },
        lastSavedAt: Date.now(),
      },
      `${HICOOL_TITLES[key]}已保存`,
    );
  };

  const markReviewed = (key: HicoolSectionKey) => {
    if (!draft || !changeKey) return;
    saveAll(
      {
        ...draft,
        reviewedForChangeKey: { ...draft.reviewedForChangeKey, [key]: changeKey },
        lastSavedAt: Date.now(),
      },
      `${HICOOL_TITLES[key]}已标记人工审核`,
    );
  };

  const acceptParameterChanges = () => {
    if (!draft || !model) return;
    saveAll(
      {
        ...draft,
        baselineModelSnapshot: model,
        reviewedForChangeKey: {},
        lastSavedAt: Date.now(),
      },
      '已接受参数变更并更新审核基线',
    );
  };

  const archiveCurrent = async () => {
    if (!draft || !model) return;
    const payload: HicoolArchivePayload = {
      draft,
      archivedAt: Date.now(),
      sourceStamp,
    };
    const label = `${draft.submissionVersion}${draft.isSubmissionVersion ? ' [申报版]' : ''}`;
    await saveArchive({
      timestamp: Date.now(),
      version: draft.submissionVersion,
      type: 'hicool',
      label,
      content: JSON.stringify(payload, null, 2),
      modelSnapshot: model,
    });
    const rows = await listArchives('hicool');
    setArchives(rows.filter((r) => r.id !== undefined).map((r) => ({ id: r.id as number, label: r.label, timestamp: r.timestamp })));
    setStatus(`已整体存档：${label}`);
  };

  const restoreArchive = async (id: number) => {
    const rows = await listArchives('hicool');
    const target = rows.find((r) => r.id === id);
    if (!target) return;
    try {
      const payload = JSON.parse(target.content) as HicoolArchivePayload;
      saveAll(
        {
          ...payload.draft,
          lastSavedAt: Date.now(),
        },
        `已加载存档：${target.label}`,
      );
    } catch {
      setStatus('存档解析失败，请重新生成该版本');
    }
  };

  if (!hydrated || !draft || !model) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm text-gray-500">HICOOL 申报信息页加载中...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">HICOOL 申报信息（联动版）</h1>
          <div className="text-sm text-gray-600">
            <div>BP: {sourceStamp.bpVersion} ({sourceStamp.bpFile})</div>
            <div>FP: {sourceStamp.fpVersion} ({sourceStamp.fpFile})</div>
            <div>Simulator 时间戳: {sourceStamp.simulatorTimestamp}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm">
            <div className="mb-1 text-gray-600">申报版本号（人工标注）</div>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={draft.submissionVersion}
              onChange={(e) => setDraft({ ...draft, submissionVersion: e.target.value })}
              onBlur={() => saveAll({ ...draft, lastSavedAt: Date.now() }, '已保存申报版本号')}
            />
          </label>

          <label className="text-sm flex items-end gap-2">
            <input
              type="checkbox"
              checked={draft.isSubmissionVersion}
              onChange={(e) => {
                const next = { ...draft, isSubmissionVersion: e.target.checked, lastSavedAt: Date.now() };
                setDraft(next);
                saveHicoolDraft(next);
              }}
            />
            <span>标记为当前申报版本</span>
          </label>

          <div className="text-sm text-gray-600 md:text-right">
            <div>最近保存: {fmtTime(draft.lastSavedAt)}</div>
            <div>{status || '可编辑后单栏保存或整体存档'}</div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-amber-50 p-4 text-sm">
        <div className="font-medium">参数变更审查</div>
        {!changeReport?.hasChanges && <p className="mt-1 text-gray-700">当前 simulator 参数与审核基线一致，无需新增人工审核。</p>}
        {changeReport?.hasChanges && (
          <div className="mt-2 space-y-2">
            <p className="text-gray-800">
              检测到参数变化：{changeReport.changedGroups.map((g) => g.label).join('、')}。以下栏目需人工审核并接受。
            </p>
            <button
              className="rounded-md border border-amber-600 px-3 py-1.5 text-amber-700 hover:bg-amber-100"
              onClick={acceptParameterChanges}
            >
              接受参数变更并更新审核基线
            </button>
          </div>
        )}
      </section>

      <section className="grid gap-4">
        {SECTION_ORDER.map((key) => {
          const content = draft.sections[key] || '';
          const limit = HICOOL_LIMITS[key];
          const over = content.length > limit;
          const needsReview = impacted.has(key);
          const reviewed = !!changeKey && draft.reviewedForChangeKey[key] === changeKey;

          return (
            <article key={key} className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">{HICOOL_TITLES[key]}</h2>
                <div className="flex items-center gap-2 text-xs">
                  {needsReview && !reviewed && (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">需人工审核</span>
                  )}
                  {needsReview && reviewed && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">已人工审核</span>
                  )}
                  <span className={over ? 'text-red-600' : 'text-gray-500'}>
                    {content.length}/{limit}
                  </span>
                </div>
              </div>

              <textarea
                className="min-h-36 w-full rounded-md border p-3 text-sm leading-6"
                value={content}
                onChange={(e) => {
                  const next = {
                    ...draft,
                    sections: { ...draft.sections, [key]: e.target.value },
                  };
                  setDraft(next);
                }}
              />

              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={() => saveSection(key, content)}
                >
                  保存本栏
                </button>

                {needsReview && !reviewed && (
                  <button
                    className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                    onClick={() => markReviewed(key)}
                  >
                    标记为已人工审核
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">存档与回载</h2>
          <div className="flex gap-2">
            <button
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
              onClick={() => saveAll({ ...draft, lastSavedAt: Date.now() }, '已保存全部栏目草稿')}
            >
              保存全部草稿
            </button>
            <button
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              onClick={archiveCurrent}
            >
              整体存档（IndexedDB）
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {archives.length === 0 && <p className="text-sm text-gray-500">暂无存档记录。</p>}
          {archives.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2">
              <div className="text-sm">
                <div className="font-medium">{a.label}</div>
                <div className="text-gray-500">{fmtTime(a.timestamp)}</div>
              </div>
              <button
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={() => restoreArchive(a.id)}
              >
                加载此版本
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
