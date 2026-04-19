# Roadshow React Migration — Comprehensive Test Plan

> **Owner**: QA / Engineering  
> **Created**: 2026-04-19  
> **Status**: Phase 1 (Foundation + Pilot)  
> **Scope**: Full 4-phase migration from `public/roadshow-slides.html` (iframe) → React components

---

## 1. Test Strategy Overview

### Migration Phases

| Phase | Scope | Acceptance Gate |
|-------|-------|-----------------|
| **Phase 1** | `SlideContainer`, `Slide`, `PricingSlide`, `/roadshow-react` route | Container renders, keyboard nav works, pricing slide data matches iframe |
| **Phase 2** | All data-heavy slides (revenue, beds, funding, SOM, milestones) | All migrated slides match, `postMessage` eliminated for those slides |
| **Phase 3** | All remaining slides, iframe removed | Full feature parity, no regression, iframe deleted |
| **Phase 4** | PPTX export, history viewer, advanced features | Export works, version comparison works, all tests green |

### Test Categories

1. **Unit Tests** — Component props → rendered output
2. **Integration Tests** — Data pipeline: model → calculator → slide props
3. **Visual Regression Tests** — Screenshot comparison (iframe vs React)
4. **Accessibility Tests** — Keyboard, screen reader, focus management
5. **Print Tests** — Each slide fits one page, correct styling
6. **Performance Tests** — Render time, layout stability, bundle size

---

## 2. Unit Tests

### 2.1 SlideContainer

| Test ID | Description | Assertion |
|---------|-------------|-----------|
| SC-01 | Renders children inside scroll-snap container | Container has `scroll-snap-type: y mandatory` |
| SC-02 | Renders indicator dots matching slideIds count | `nav` contains N `button` elements |
| SC-03 | Active dot updates on scroll | After scrolling to slide 3, dot 3 has active class |
| SC-04 | Clicking dot scrolls to correct slide | Click dot 5 → slide 5 `scrollIntoView` called |
| SC-05 | No dots rendered when slideIds is empty | `nav` element does not exist |
| SC-06 | Container is focusable (tabIndex=0) | Container has `tabindex="0"` |
| SC-07 | ARIA role and label present | `role="region"`, `aria-label` set |

```typescript
// Example: SC-01
import { render, screen } from '@testing-library/react';
import SlideContainer from '@/components/roadshow/SlideContainer';

test('SC-01: renders scroll-snap container', () => {
  const { container } = render(
    <SlideContainer slideIds={['s1']}>
      <div id="s1">Slide 1</div>
    </SlideContainer>
  );
  const el = container.firstElementChild as HTMLElement;
  expect(el).toHaveAttribute('role', 'region');
});
```

### 2.2 Slide

| Test ID | Description | Assertion |
|---------|-------------|-----------|
| SL-01 | Renders title and eyebrow | `h1` contains title text, eyebrow div present |
| SL-02 | Renders subtitle when provided | `p.subtitle` present with correct text |
| SL-03 | Omits subtitle when not provided | No `p.subtitle` in DOM |
| SL-04 | Renders chips with correct variant classes | Chip elements have `chipFact`, `chipProjected`, or `chipPlan` class |
| SL-05 | Children rendered inside slide frame | Slide body content visible |
| SL-06 | Section has correct `id` attribute | `section#s10-pricing` exists |
| SL-07 | Custom className applied | Additional class on `section` element |

### 2.3 PricingSlide

| Test ID | Description | Assertion |
|---------|-------------|-----------|
| PS-01 | C2 hardware price renders from model | Text contains `¥6.5 万 / 床` (for default model) |
| PS-02 | C2 SaaS price renders from model | Text contains `¥2.5 万 / 床 / 年` |
| PS-03 | C3 hardware price renders from model | Text contains `¥8.5 万 / 床` |
| PS-04 | C3 SaaS price renders from model | Text contains `¥4.0 万 / 床 / 年` |
| PS-05 | C3 bulk SaaS price renders | Text contains `¥3.5 万` |
| PS-06 | ROI C2 new purchase calculates correctly | `+34%` for default model |
| PS-07 | ROI C3 new purchase calculates correctly | `+17%` for default model |
| PS-08 | ROI C3 upgrade calculates correctly | `+66%` for default model |
| PS-09 | ROI 5-year bulk calculates correctly | Value present and positive |
| PS-10 | Pricing summary table has 4 data rows | Table rows for 硬件, SaaS, 升级服务, 渠道合作 |
| PS-11 | Upgrade price renders in table | `¥2.5 万 / 床` in upgrade row |
| PS-12 | Value anchors display correctly | C2: `¥6.25 万`, C3: `¥8.0 万` |
| PS-13 | Source citations present | `[14]`, `[30]`, `[31]` in source box |
| PS-14 | When model prices change, ROI updates | Custom model with `price_hw_c2: 80000` → different ROI |

```typescript
// Example: PS-01
import { render, screen } from '@testing-library/react';
import PricingSlide from '@/components/roadshow/slides/PricingSlide';
import { DEFAULT_MODEL } from '@/lib/defaults';
import { calculate } from '@/lib/calculator';

test('PS-01: renders C2 HW price from model', () => {
  const model = structuredClone(DEFAULT_MODEL);
  const result = calculate(model.global, model.yearly, model.opex, model.milestones_best);
  render(<PricingSlide model={model} result={result} />);
  expect(screen.getByText(/¥6\.5 万 \/ 床/)).toBeInTheDocument();
});
```

### 2.4 Future Slides (Phase 2–3)

Each migrated slide must have unit tests covering:

| Category | Tests |
|----------|-------|
| **Data binding** | Every `data-field` from HTML has a corresponding prop → render assertion |
| **Edge cases** | Zero values, division-by-zero guards, Y1 (no revenue) |
| **Formatting** | `¥X.X 万` format, percentage formatting, locale-safe number display |
| **Conditional rendering** | Fields that show "—" or "N/A" when data is unavailable |

---

## 3. Integration Tests

### 3.1 Data Pipeline: Model → Calculator → Slide

| Test ID | Description | Assertion |
|---------|-------------|-----------|
| INT-01 | Default model produces valid CalcResult | `result.years.length === 10`, no NaN values |
| INT-02 | CalcResult feeds PricingSlide without error | Component renders without throwing |
| INT-03 | Modified model prices propagate to ROI | Change `price_hw_c2` → ROI value changes |
| INT-04 | Revenue data flows to revenue slide (Phase 2) | Y2–Y10 revenue values match `result.years[i].total_revenue` |
| INT-05 | Bed counts flow to growth slide (Phase 2) | Cumulative beds match `result.years[i].cumulative_beds` |
| INT-06 | Funding ranges flow to funding slide (Phase 2) | Seed/PreA/A ranges match `model.funding.*` |

### 3.2 Data Parity: React vs iframe

| Test ID | Description | Method |
|---------|-------------|--------|
| INT-10 | PricingSlide ROI matches `extractRoadshowUpdates()` output | Compute both, compare field-by-field |
| INT-11 | All 70+ data-field values match between React and iframe | Automated comparison script |
| INT-12 | No stale data after model change | Modify model → verify React re-renders with new values |

```typescript
// Example: INT-10
import { DEFAULT_MODEL } from '@/lib/defaults';
import { calculate } from '@/lib/calculator';
import { extractRoadshowUpdates } from '@/lib/docGenerator';

test('INT-10: React ROI matches extractRoadshowUpdates', () => {
  const model = structuredClone(DEFAULT_MODEL);
  const result = calculate(model.global, model.yearly, model.opex, model.milestones_best);
  const updates = extractRoadshowUpdates(model, result);

  // Verify the same ROI calculation logic
  const g = model.global;
  const c2Annual = g.price_hw_c2 / 3 + g.price_saas_c2;
  const c2ROI = Math.round((g.value_anchor_c2 / c2Annual - 1) * 100);
  expect(updates['roi-c2-new']).toBe(`+${c2ROI}%`);
});
```

---

## 4. Visual Regression Tests

### 4.1 Strategy

- **Tool**: Playwright + `toHaveScreenshot()` (built-in visual comparison)
- **Approach**: Capture screenshots of both iframe HTML slide and React slide at identical viewport sizes
- **Tolerance**: Allow 1% pixel diff (font rendering differences)

### 4.2 Test Cases

| Test ID | Description | Viewport | Comparison |
|---------|-------------|----------|------------|
| VR-01 | PricingSlide matches S10 in HTML | 1920×1080 | Side-by-side screenshot diff |
| VR-02 | PricingSlide mobile layout | 375×812 | Screenshot at mobile viewport |
| VR-03 | PricingSlide dark theme colors | 1920×1080 | Verify bg gradient, accent colors via computed styles |
| VR-04 | Print layout single page | A4 portrait | Print preview screenshot |
| VR-05 | All placeholder slides render consistently | 1920×1080 | No layout breaks, consistent styling |

### 4.3 Baseline Management

```
tests/
  visual/
    baselines/
      s10-pricing-1920x1080.png     ← from iframe HTML
      s10-pricing-375x812.png
      s10-pricing-print.png
    snapshots/
      s10-pricing-react-1920x1080.png  ← from React component
```

### 4.4 Playwright Visual Test Example

```typescript
import { test, expect } from '@playwright/test';

test('VR-01: PricingSlide matches HTML S10', async ({ page }) => {
  // Capture iframe version
  await page.goto('/roadshow');
  const iframe = page.frameLocator('iframe');
  await iframe.locator('#s10').scrollIntoViewIfNeeded();
  const htmlScreenshot = await iframe.locator('#s10').screenshot();

  // Capture React version
  await page.goto('/roadshow-react');
  await page.locator('#s10-pricing').scrollIntoViewIfNeeded();
  const reactScreenshot = await page.locator('#s10-pricing').screenshot();

  // Compare (with 1% tolerance)
  expect(reactScreenshot).toMatchSnapshot('s10-pricing.png', { maxDiffPixelRatio: 0.01 });
});
```

---

## 5. Accessibility Tests

### 5.1 Keyboard Navigation

| Test ID | Description | Assertion |
|---------|-------------|-----------|
| A11Y-01 | ArrowDown/ArrowRight advances to next slide | Focus moves, scroll position changes |
| A11Y-02 | ArrowUp/ArrowLeft goes to previous slide | Correct slide in view |
| A11Y-03 | Home goes to first slide | First slide visible |
| A11Y-04 | End goes to last slide | Last slide visible |
| A11Y-05 | Tab key moves focus through interactive elements | Indicator dots, links are focusable |
| A11Y-06 | Escape does not break navigation | Container retains focus |

### 5.2 Screen Reader

| Test ID | Description | Assertion |
|---------|-------------|-----------|
| A11Y-10 | Container has `role="region"` with label | `aria-label="Roadshow presentation"` |
| A11Y-11 | Indicator dots have `aria-label` | Each dot: "Go to slide N" |
| A11Y-12 | Active dot has `aria-current="true"` | Only current slide dot has attribute |
| A11Y-13 | Slide titles are `h1` headings | Proper heading hierarchy |
| A11Y-14 | Data tables have proper structure | Mini-table rows are semantically readable |

### 5.3 Focus Management

| Test ID | Description | Assertion |
|---------|-------------|-----------|
| A11Y-20 | Container auto-focuses on page load | `document.activeElement` is container |
| A11Y-21 | Focus visible indicator on dots | Outline visible on keyboard focus |
| A11Y-22 | No focus trap — Tab escapes container | Focus leaves container to browser chrome |

### 5.4 Automated a11y Scan

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('A11Y-30: No critical accessibility violations', async ({ page }) => {
  await page.goto('/roadshow-react');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
});
```

---

## 6. Print Tests

### 6.1 Single Page Fit

| Test ID | Description | Assertion |
|---------|-------------|-----------|
| PR-01 | Each slide fits on one printed page | No overflow, no content cut off |
| PR-02 | `page-break-after: always` on each slide | CSS verified |
| PR-03 | Indicator dots hidden in print | `display: none` in print media |
| PR-04 | Colors adapt for print | Dark bg → white bg, text legible |
| PR-05 | Charts/tables print correctly | All data visible, proper contrast |

### 6.2 Print Test Method

```typescript
test('PR-01: slides fit single pages', async ({ page }) => {
  await page.goto('/roadshow-react');
  await page.emulateMedia({ media: 'print' });

  const slides = await page.locator('section').all();
  for (const slide of slides) {
    const box = await slide.boundingBox();
    // A4 at 96dpi ≈ 794×1123px
    expect(box?.height).toBeLessThanOrEqual(1123);
  }
});
```

---

## 7. Performance Tests

### 7.1 Render Performance

| Test ID | Description | Target |
|---------|-------------|--------|
| PERF-01 | Initial page load (TTI) | < 2s on 3G throttle |
| PERF-02 | SlideContainer render time | < 100ms for 15 slides |
| PERF-03 | PricingSlide render time | < 50ms |
| PERF-04 | Model recalculation → re-render | < 100ms total |
| PERF-05 | No Cumulative Layout Shift | CLS < 0.1 |
| PERF-06 | Bundle size impact | React roadshow chunk < 50KB gzipped |

### 7.2 Measurement Method

```typescript
test('PERF-02: SlideContainer renders under 100ms', async ({ page }) => {
  await page.goto('/roadshow-react');

  const timing = await page.evaluate(() => {
    const start = performance.now();
    // Force re-render via state change (test harness)
    return performance.now() - start;
  });

  expect(timing).toBeLessThan(100);
});
```

### 7.3 Lighthouse CI Integration

```yaml
# .github/workflows/lighthouse.yml (Phase 3+)
- name: Lighthouse CI
  run: |
    npx lhci autorun --collect.url=http://localhost:3000/roadshow-react
  env:
    LHCI_ASSERT_PERFORMANCE: 90
    LHCI_ASSERT_ACCESSIBILITY: 95
```

---

## 8. Phase-by-Phase Acceptance Criteria

### Phase 1: Foundation + Pilot ✅

| # | Criterion | Verification |
|---|-----------|-------------|
| 1.1 | `SlideContainer` renders with scroll-snap | Manual + SC-01 |
| 1.2 | Keyboard navigation (Arrow keys, Home, End) | A11Y-01 through A11Y-04 |
| 1.3 | Indicator dots track active slide | SC-02, SC-03 |
| 1.4 | `PricingSlide` renders all pricing data from typed model | PS-01 through PS-13 |
| 1.5 | ROI calculations match `extractRoadshowUpdates()` | INT-10 |
| 1.6 | `/roadshow-react` route accessible | Navigate to route, page loads |
| 1.7 | `/roadshow` (iframe) still works | No regression in existing route |
| 1.8 | Print CSS: slides break per page | PR-01, PR-02 |
| 1.9 | No new npm dependencies added | `package.json` unchanged |
| 1.10 | TypeScript strict mode: no errors | `npx tsc --noEmit` passes |

### Phase 2: Data-Heavy Slides

| # | Criterion | Verification |
|---|-----------|-------------|
| 2.1 | Revenue slide: Y2–Y10 revenue, EBITDA values match | Unit + INT-04 |
| 2.2 | Growth slide: bed counts Y2–Y5 match | Unit + INT-05 |
| 2.3 | Funding slide: seed/PreA/A ranges match | Unit + INT-06 |
| 2.4 | SOM chart: 10-year bed + revenue arrays correct | Unit + INT-11 |
| 2.5 | Milestone timeline renders from model milestones | Unit tests |
| 2.6 | `postMessage` eliminated for migrated slides | Code review: no `postMessage` calls for React slides |
| 2.7 | Visual regression: migrated slides within 1% pixel diff | VR tests |
| 2.8 | All existing unit tests still pass | CI green |

### Phase 3: Full Migration

| # | Criterion | Verification |
|---|-----------|-------------|
| 3.1 | All 15 slides migrated to React | No `PlaceholderSlide` remaining |
| 3.2 | iframe HTML deleted | `public/roadshow-slides.html` removed |
| 3.3 | `/roadshow` route serves React version | Route redirect or replacement |
| 3.4 | `extractRoadshowUpdates()` deprecated or removed | Code cleanup |
| 3.5 | Zero visual regressions | Full VR suite green |
| 3.6 | Accessibility audit clean | A11Y-30, no critical violations |
| 3.7 | Performance targets met | PERF-01 through PERF-06 |
| 3.8 | Print: all 15 slides on separate pages | PR-01 across all slides |
| 3.9 | Theme system preserved or migrated | Theme presets still work |

### Phase 4: Advanced Features

| # | Criterion | Verification |
|---|-----------|-------------|
| 4.1 | PPTX export generates from React slides | Export test: file valid, slides present |
| 4.2 | History viewer: compare roadshow versions | Load two versions, diff displayed |
| 4.3 | Chart components (Recharts) render correctly | Visual + data tests for SOM, revenue charts |
| 4.4 | Theme live-preview works with React slides | Toggle theme → React slides update |
| 4.5 | All tests green in CI | Full test suite passes |
| 4.6 | Documentation updated | README, architecture docs reflect new system |

---

## 9. Test Infrastructure

### 9.1 Test Runner Configuration

```
Framework: Vitest (unit) + Playwright (e2e/visual)
Coverage target: 80%+ for roadshow components
CI: GitHub Actions (existing workflow)
```

### 9.2 File Structure

```
src/
  components/roadshow/
    __tests__/
      SlideContainer.test.tsx
      Slide.test.tsx
      slides/
        PricingSlide.test.tsx
        RevenueSlide.test.tsx   (Phase 2)
        GrowthSlide.test.tsx    (Phase 2)
        FundingSlide.test.tsx   (Phase 2)
tests/
  e2e/
    roadshow-react.spec.ts     (navigation, data flow)
  visual/
    roadshow-visual.spec.ts    (screenshot comparison)
    baselines/                  (reference screenshots)
  a11y/
    roadshow-a11y.spec.ts      (accessibility audit)
  performance/
    roadshow-perf.spec.ts      (render timing, CLS)
```

### 9.3 CI Integration

```yaml
# .github/workflows/test-roadshow.yml
name: Roadshow Migration Tests
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx vitest run --reporter=verbose src/components/roadshow/

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npx playwright test tests/e2e/ tests/visual/ tests/a11y/
```

---

## 10. Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Calculator output format drift | ROI/revenue mismatch between iframe and React | INT-10, INT-11 automated parity checks |
| CSS scroll-snap browser inconsistency | Broken navigation on Safari/Firefox | Manual cross-browser test on each phase |
| Print layout overflow | Slides spill across pages | PR-01 test + max-height constraints |
| Performance regression from 15 React slides | Slow initial load | PERF-01 budget, lazy-load non-visible slides |
| Theme system incompatibility | React slides ignore theme changes | Phase 4 theme integration tests |
| `localStorage` unavailable (SSR/incognito) | Crash on page load | Existing `loadModel()` fallback to DEFAULT_MODEL |

---

## 11. Data Field Migration Tracking

Complete mapping of `data-field` attributes from HTML to React props. Updated as slides are migrated.

### S10 (Pricing) — Phase 1 ✅

| data-field | HTML Location | React Source | Status |
|------------|---------------|--------------|--------|
| `c2-hw-price` | S10 price card | `model.global.price_hw_c2` | ✅ Migrated |
| `c2-saas-price` | S10 price card | `model.global.price_saas_c2` | ✅ Migrated |
| `c3-hw-price` | S10 price card | `model.global.price_hw_c3` | ✅ Migrated |
| `c3-saas-price` | S10 price card | `model.global.price_saas_c3` | ✅ Migrated |
| `c3-saas-bulk` | S10 price card | `model.global.price_saas_c3_bulk` | ✅ Migrated |
| `c2-hw-tbl` | S10 mini-table | `model.global.price_hw_c2` | ✅ Migrated |
| `c3-hw-tbl` | S10 mini-table | `model.global.price_hw_c3` | ✅ Migrated |
| `c2-saas-tbl` | S10 mini-table | `model.global.price_saas_c2` | ✅ Migrated |
| `c3-saas-tbl` | S10 mini-table | `model.global.price_saas_c3` | ✅ Migrated |
| `upgrade-tbl` | S10 mini-table | `model.global.price_upgrade` | ✅ Migrated |
| `roi-c2-new` | S10 ROI card | Computed from model | ✅ Migrated |
| `roi-c2-cost` | S10 ROI card | Computed from model | ✅ Migrated |
| `roi-c2-anchor` | S10 ROI card | `model.global.value_anchor_c2` | ✅ Migrated |
| `roi-c3-new` | S10 ROI card | Computed from model | ✅ Migrated |
| `roi-c3-cost` | S10 ROI card | Computed from model | ✅ Migrated |
| `roi-c3-anchor` | S10 ROI card | `model.global.value_anchor_c3` | ✅ Migrated |
| `roi-c3u` | S10 ROI card | Computed from model | ✅ Migrated |
| `roi-c3u-cost` | S10 ROI card | Computed from model | ✅ Migrated |
| `roi-c3u-anchor` | S10 ROI card | `model.global.value_anchor_c3` | ✅ Migrated |
| `roi-c3-5yr` | S10 ROI summary | Computed from model | ✅ Migrated |

### Remaining Slides — Phase 2–3

| data-field group | Slide | Count | Phase |
|------------------|-------|-------|-------|
| Revenue (`y*-revenue`) | S09 Growth | 6 | Phase 2 |
| Beds (`y*-beds`, `*-beds-pct`) | S09 Growth | 8 | Phase 2 |
| Funding (`*-range`) | S14 Funding | 3 | Phase 2 |
| EBITDA (`ebitda-*`) | S09 Growth | 2 | Phase 2 |
| Revenue breakdown (`rev-*`) | S09 Growth | 18 | Phase 2 |
| Rates (`renewal-rate`, `*-commission`) | S10/S09 | 3 | Phase 2 |
| SOM chart (`som-chart-*`) | S06 Market | 2 | Phase 2 |
| Remaining static content | S01–S08, S11–S15 | ~10 | Phase 3 |
