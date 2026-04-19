'use client';

import { useMemo, useState } from 'react';
import { CalcResult, ModelInputs, calculate } from '@/lib/calculator';
import { DEFAULT_MODEL } from '@/lib/defaults';
import { loadModel } from '@/lib/storage';
import SlideContainer from '@/components/roadshow/SlideContainer';
import Slide from '@/components/roadshow/Slide';
import PricingSlide from '@/components/roadshow/slides/PricingSlide';
import styles from '@/components/roadshow/roadshow.module.css';

/** All slide IDs in presentation order. Expand as slides are migrated. */
const SLIDE_IDS = [
  's01-cover',
  's02-problem',
  's03-solution',
  's04-technology',
  's05-clinical',
  's06-market',
  's07-competition',
  's08-traction',
  's09-growth',
  's10-pricing',
  's11-regulatory',
  's12-team',
  's13-milestones',
  's14-funding',
  's15-appendix',
];

function PlaceholderSlide({ id, title, eyebrow }: { id: string; title: string; eyebrow: string }) {
  return (
    <Slide id={id} title={title} eyebrow={eyebrow}>
      <div className={styles.placeholder}>
        <div className={styles.placeholderIcon}>🚧</div>
        <div className={styles.placeholderText}>
          This slide will be migrated from the HTML roadshow in a future phase.
        </div>
      </div>
    </Slide>
  );
}

export default function RoadshowReactPage() {
  const [model] = useState<ModelInputs>(() => {
    if (typeof window === 'undefined') return structuredClone(DEFAULT_MODEL);
    return loadModel();
  });

  const result: CalcResult = useMemo(
    () => calculate(model.global, model.yearly, model.opex, model.milestones_best),
    [model]
  );

  return (
    <SlideContainer slideIds={SLIDE_IDS}>
      <PlaceholderSlide id="s01-cover" title="ARIA" eyebrow="Cover" />
      <PlaceholderSlide id="s02-problem" title="临床痛点" eyebrow="Problem" />
      <PlaceholderSlide id="s03-solution" title="产品方案" eyebrow="Solution" />
      <PlaceholderSlide id="s04-technology" title="核心技术" eyebrow="Technology" />
      <PlaceholderSlide id="s05-clinical" title="临床验证" eyebrow="Clinical Evidence" />
      <PlaceholderSlide id="s06-market" title="市场规模" eyebrow="Market" />
      <PlaceholderSlide id="s07-competition" title="竞争格局" eyebrow="Competition" />
      <PlaceholderSlide id="s08-traction" title="商业化进展" eyebrow="Traction" />
      <PlaceholderSlide id="s09-growth" title="增长模型" eyebrow="Growth Model" />

      {/* ── Phase 1 Pilot: fully migrated pricing slide ── */}
      <PricingSlide model={model} result={result} />

      <PlaceholderSlide id="s11-regulatory" title="法规路径" eyebrow="Regulatory Path" />
      <PlaceholderSlide id="s12-team" title="核心团队" eyebrow="Team" />
      <PlaceholderSlide id="s13-milestones" title="项目阶段里程碑" eyebrow="Milestones" />
      <PlaceholderSlide id="s14-funding" title="融资规划" eyebrow="Funding" />
      <PlaceholderSlide id="s15-appendix" title="附录与引用" eyebrow="Appendix" />
    </SlideContainer>
  );
}
