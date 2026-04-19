'use client';

import { useMemo, useState } from 'react';
import { CalcResult, ModelInputs, calculate } from '@/lib/calculator';
import { DEFAULT_MODEL } from '@/lib/defaults';
import { loadModel } from '@/lib/storage';
import SlideContainer from '@/components/roadshow/SlideContainer';
import CoverSlide from '@/components/roadshow/slides/CoverSlide';
import ProblemSlide from '@/components/roadshow/slides/ProblemSlide';
import CostSlide from '@/components/roadshow/slides/CostSlide';
import WhyNowSlide from '@/components/roadshow/slides/WhyNowSlide';
import SolutionSlide from '@/components/roadshow/slides/SolutionSlide';
import MarketSlide from '@/components/roadshow/slides/MarketSlide';
import PositioningSlide from '@/components/roadshow/slides/PositioningSlide';
import ClinicalValueSlide from '@/components/roadshow/slides/ClinicalValueSlide';
import FormFactorSlide from '@/components/roadshow/slides/FormFactorSlide';
import PricingSlide from '@/components/roadshow/slides/PricingSlide';
import RegulatorySlide from '@/components/roadshow/slides/RegulatorySlide';
import TeamSlide from '@/components/roadshow/slides/TeamSlide';
import MilestonesSlide from '@/components/roadshow/slides/MilestonesSlide';
import FundingSlide from '@/components/roadshow/slides/FundingSlide';
import ReferencesSlide from '@/components/roadshow/slides/ReferencesSlide';
import GlossarySlide from '@/components/roadshow/slides/GlossarySlide';

/** All slide IDs in presentation order. */
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
  's16-appendix',
  's17-glossary',
];

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
      <CoverSlide />
      <ProblemSlide />
      <CostSlide />
      <WhyNowSlide />
      <SolutionSlide />

      {/* ── Phase 2: Market slide ── */}
      <MarketSlide model={model} result={result} />

      <PositioningSlide />
      <ClinicalValueSlide />
      <FormFactorSlide />

      {/* ── Phase 1: Pricing slide ── */}
      <PricingSlide model={model} result={result} />

      <RegulatorySlide />
      <TeamSlide />
      <MilestonesSlide />

      {/* ── Phase 2: Funding slide ── */}
      <FundingSlide model={model} result={result} />

      <ReferencesSlide />

      {/* ── Glossary: live simulator values ── */}
      <GlossarySlide model={model} result={result} />
    </SlideContainer>
  );
}
