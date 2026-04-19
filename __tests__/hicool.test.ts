import { describe, expect, it } from 'vitest';
import { calculate } from '../src/lib/calculator';
import { DEFAULT_MODEL } from '../src/lib/defaults';
import {
  HICOOL_LIMITS,
  HICOOL_TITLES,
  buildDefaultHicoolSections,
  buildHicoolAuditNotes,
} from '../src/lib/hicool';

describe('HICOOL seeded content', () => {
  const scenario = DEFAULT_MODEL.active_scenario || 'neutral';
  const so = DEFAULT_MODEL.scenario_overrides?.[scenario];
  const result = calculate(
    DEFAULT_MODEL.global,
    DEFAULT_MODEL.yearly,
    DEFAULT_MODEL.opex,
    DEFAULT_MODEL.milestones_best,
    so,
  );

  it('keeps all seeded sections within their limits', () => {
    const sections = buildDefaultHicoolSections(DEFAULT_MODEL, result);

    for (const key of Object.keys(HICOOL_TITLES) as Array<keyof typeof HICOOL_TITLES>) {
      expect(sections[key].length).toBeLessThanOrEqual(HICOOL_LIMITS[key]);
    }
  });

  it('builds audit notes with version and timestamp labels', () => {
    const audit = buildHicoolAuditNotes(DEFAULT_MODEL, result, null, Date.now());

    expect(audit.projectOverview.bpLabel).toContain('BP');
    expect(audit.projectOverview.fpLabel).toContain('FP');
    expect(audit.projectOverview.simulatorTimestamp.length).toBeGreaterThan(0);
    expect(audit.teamIntro.roadshowLabel.length).toBeGreaterThan(0);
  });
});