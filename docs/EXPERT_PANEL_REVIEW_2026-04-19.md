# ARIA Finance Simulator — Expert Panel Review Report
**Date:** 2026-04-19  
**Reviewer:** NEXUS Expert Panel

---

## Executive Summary

The ARIA Finance Simulator is a remarkably ambitious solo-developer project that implements a complete financial modeling pipeline for a medical device startup. It delivers a 10-year financial projection engine, three scenario variants across two timelines, a comprehensive BP/FP data governance system with conflict detection, roadshow slide generation, and export automation — all deployed as a static Next.js application on GitHub Pages. The architectural decision to make the simulator the "Single Source of Truth" for all downstream documents (Business Plan, Financial Plan, Roadshow) is sound and well-executed through a traceability matrix that links parameter changes to affected document sections.

The codebase demonstrates strong domain-specific engineering: the calculator engine correctly models cohort-based SaaS renewal decay, milestone-driven deployment gating, and BOM cost sub-components. The change tracking and conflict detection systems (`changeTracker.ts`, `bp-reference.ts`) create a robust audit trail that is rare even in commercial financial tools. The UI implements a full investor-grade dashboard with parameter panel, multi-format export, and profile management.

However, the project has significant gaps in testing (zero automated tests), accessibility (minimal a11y), input validation (insufficient sanitization at system boundaries), and code documentation (sparse inline comments). The codebase also suffers from a tightly-coupled state management pattern in `page.tsx` that will impede future maintenance. These are addressable issues that don't diminish the overall technical achievement.

---

## Dimension Scores

| Dimension | Score | Grade |
|-----------|-------|-------|
| A. Architecture & Structure | 7.5/10 | B+ |
| B. Code Quality & Logic | 7.0/10 | B |
| C. Data Auditability | 9.0/10 | A |
| D. Automation & CI/CD | 5.0/10 | C |
| E. Security | 5.5/10 | C+ |
| F. UX & Accessibility | 6.0/10 | B− |
| G. Documentation | 7.0/10 | B |
| **Overall** | **6.7/10** | **B** |

---

## Detailed Findings

### A. Architecture & Structure (7.5/10)

**Strengths:**
- **Clean module separation.** The `src/lib/` directory cleanly separates concerns: `calculator.ts` (engine), `defaults.ts` (data), `bp-reference.ts` (audit reference), `storage.ts` (persistence), `changeTracker.ts` (delta detection), `docGenerator.ts` (output), `archiveStore.ts` (versioned storage), and `exportUtils.ts` (export). Each module has a single responsibility.
- **Data flow is architecturally correct.** The pipeline `defaults → calculator → results → docGenerator/bp-reference → UI` enforces the Single Source of Truth principle. The `MAPPING_BLOCKS` and `PARAM_MAPPING` constants in `calculator.ts` create an explicit traceability matrix from parameter groups to affected BP sections.
- **Multi-route application structure.** Four distinct pages (`/`, `/bp-mapping`, `/qa`, `/roadshow`) serve different audiences (developer, auditor, investor) while sharing the same data model.
- **Dual timeline support.** Both Best Case and Base Case have separate milestone schedules and yearly inputs, resolved through the same `calculate()` function — good code reuse.

**Weaknesses:**
- **Monolithic state management in `page.tsx`.** The main page manages ~15 state variables with `useState`, including model data, change detection, UI state, and archive state. The initialization logic conditionally calls `setState` during render (the `if (!initialized && typeof window !== 'undefined')` pattern). This works but is fragile — `useEffect` or `useSyncExternalStore` would be more appropriate.
- **Repeated initialization pattern.** The same `if (!initialized && typeof window !== 'undefined')` pattern is duplicated across `page.tsx`, `bp-mapping/page.tsx`, `qa/page.tsx`, and `roadshow/page.tsx`. This should be extracted to a shared hook.
- **No shared state management.** Each page independently calls `loadModel()` and `calculate()`. If a user modifies parameters on the main page and navigates to `/bp-mapping`, changes are reflected via localStorage, but there's no shared React context or store.
- **Component decomposition is uneven.** `ParameterPanel.tsx` is ~300+ lines with complex milestone editing, profile management, and scenario controls all in one component.

---

### B. Code Quality & Logic (7.0/10)

**Strengths:**
- **TypeScript strict mode enabled.** `tsconfig.json` has `"strict": true`, enforcing null checks, strict function types, and other safety measures.
- **Calculator engine is well-structured.** The `calculate()` function correctly implements:
  - Cohort-based SaaS renewal with compounding decay: `Math.pow(rr, elapsed)`
  - Deployment gating from milestone schedules via `deriveDeploymentGating()`
  - First-year factor derivation from C2/C3 registration timing via `deriveFirstYearFactor()`
  - BOM computation with sub-component breakdown via `computeBOM()`
  - COGS correctly charged only on direct-sale beds, not Baxter channel beds
- **Milestone schedule resolution is robust.** The `resolveMilestones()` function uses iterative topological resolution with a safety limit of 20 passes to handle predecessor chains.
- **Model validation exists.** `validateModel()` checks reasonable bounds for pricing, renewal rates, growth rates, and deployment totals.

**Weaknesses:**
- **Potential numerical precision issue in Y6-Y10.** The projection loop scales all revenue components proportionally by `(1 + gr)`. This compounds rounding errors over 5 years since each year builds on the previous year's rounded values.
- **Active paying beds calculation inconsistency.** Y2 `activePaying` is set to `totalNew` (ignoring renewal), while Y3+ uses `prev.active_paying * rr + totalNew + actualUpg`. This creates a minor discontinuity.
- **No unit tests.** `package.json` has no test runner. No `__tests__` directory exists. For a financial calculator handling investor-facing data, this is a significant risk.
- **`bom_c3` in defaults is inconsistent with `computeBOM`.** The hardcoded value `bom_c3: 21500` happens to match the computed result, but if sub-components change, the hardcoded value won't update.
- **`mergeWithDefaults` doesn't deep-validate array lengths.** If a saved model has truncated arrays, the merge uses the saved (shorter) array. The calculator uses `|| 0` fallback, but this could silently produce incorrect results.

---

### C. Data Auditability & Governance (9.0/10)

**Strengths:**
- **Comprehensive SOT enforcement architecture.** `BP_MAIN_TABLE`, `BP_SOM`, `BP_CHANNEL` constants serve as canonical reference data. `detectConflicts()` automatically compares simulator output with 5% tolerance and severity classification (critical >20%, warning >5%).
- **Full traceability matrix.** `MAPPING_BLOCKS` and `PARAM_MAPPING` create a bidirectional mapping: parameter group → affected BP sections and BP section → parameter dependencies. `changeTracker.ts` uses this to generate precise impact reports.
- **Roadshow data point tracking.** `ROADSHOW_DATA_POINTS` maps ~50 individual roadshow slide data points to expected BP values with per-field change highlighting.
- **IndexedDB versioned archive.** `archiveStore.ts` stores full model snapshots with timestamps, version numbers, and type classification.
- **Audit log in localStorage.** A capped (50-entry) audit log of individual field changes with timestamps and affected mapping IDs.
- **Stale document detection.** Both `bp-mapping/page.tsx` and `roadshow/page.tsx` check if the latest archive snapshot matches the current model state.

**Weaknesses:**
- **Audit log cap at 50 entries is low.** Active parameter tuning could consume 50 entries in a single session with no export option.
- **No cryptographic integrity check on archived data.** `ArchiveEntry` in IndexedDB has no hash/checksum to detect tampering.
- **`BP_MAIN_TABLE` is manually maintained.** Reference data must be manually updated when simulator defaults change — no automated sync.

---

### D. Automation & CI/CD (5.0/10)

**Strengths:**
- **Clean GitHub Pages deployment.** `deploy.yml` is minimal and correct with proper permissions and concurrency settings.
- **NPM caching enabled** via `cache: npm` in setup-node.
- **Correct basePath configuration** for static hosting.

**Weaknesses:**
- **Zero automated testing.** No test framework installed. No CI validation before deployment.
- **No lint step in CI.** ESLint is configured but not run before building.
- **No type-checking step.** No `tsc --noEmit` step to catch type errors.
- **No dependency vulnerability scanning.** No `npm audit`, Dependabot, or Snyk.
- **No build caching for Next.js.** Rebuilds from scratch each deployment.
- **Document generation is manual.** `build_bp_docx.py` and `extract_data.ts` are not integrated into CI.

---

### E. Security (5.5/10)

**Strengths:**
- **Access control via hash-based PIN.** SHA-256 hash-checked unlock mechanism. Actual PIN never stored in source code.
- **Session-scoped unlock** via `sessionStorage`.
- **No server-side attack surface.** Static export eliminates API/database injection vectors.
- **Proper use of `structuredClone`** for defensive copying.

**Weaknesses:**
- **PIN security is weak.** 4-digit numeric PIN = only 10,000 combinations, trivially brute-forceable client-side.
- **No input sanitization on parameter values.** `ParameterPanel.tsx` passes raw numeric values without range clamping.
- **No origin validation on postMessage in roadshow iframe.** The `MessageEvent` handler doesn't check `event.origin`.
- **No Content Security Policy** in layout.
- **`xlsx` dependency vulnerability risk.** v0.18.5 has known issues (used only for export, but still a supply chain concern).

---

### F. UX & Accessibility (6.0/10)

**Strengths:**
- **Polished visual design.** Professional dark-mode dashboard with clear visual hierarchy.
- **Best/Base case toggle** available on every major table.
- **Scenario selector strip** with color-coded pills.
- **Auto-save with indicator** (60-second interval with timestamp).
- **Dirty state tracking** with unsaved changes warning.
- **Profile management** for named parameter sets.
- **Mobile-responsive tables** with horizontal scrolling.

**Weaknesses:**
- **No ARIA attributes.** Minimal accessibility: no `role` attributes, no `aria-label`, no skip navigation, no focus management.
- **Color contrast issues.** `text-slate-400` on dark backgrounds may not meet WCAG AA.
- **No keyboard navigation** for milestone editor drag-and-drop.
- **Mixed language UI** without proper `lang` attributes on English sections.
- **Minimal loading state.** No skeleton screens or progressive loading.
- **No error boundary.** Calculator errors crash the entire app with no recovery.

---

### G. Documentation (7.0/10)

**Strengths:**
- **`DATA_GOVERNANCE.md`** is excellent — concisely defines SOT policy, workflow, primary scenario, and extraction script.
- **`PRD.md`** is comprehensive with feature spec, architecture, data flow, and success criteria.
- **Inline comments in `calculator.ts`** provide domain context (传感器模组, 边缘计算模块, etc.)
- **`AGENTS.md` and `CLAUDE.md`** exist for AI pair programming guidance.
- **Annotations system** in `DEFAULT_ANNOTATIONS` embeds explanations surfaced in UI.

**Weaknesses:**
- **No README with setup instructions.** Only default Next.js README.
- **No API documentation.** Calculator engine's public functions lack JSDoc.
- **PRD is outdated.** References Next.js 14, Vercel, Excel parsing — not matching current implementation.
- **No architecture diagram.** Data flow is implicit from code reading.
- **Stale FP document** (`ARIA_Financial_Plan_v2.3 (1).md`) still exists without in-file warning.

---

## Critical Issues (Must Fix)

1. **Zero automated tests for the financial calculator.** The `calculate()` function produces investor-facing numbers with no regression tests. A single bug could invalidate all downstream documents. *Impact: HIGH. Fix: Add vitest + snapshot tests for each scenario.*

2. **No CI quality gates.** Every push to `main` deploys without linting, type-checking, or testing. A broken build could go live. *Impact: HIGH. Fix: Add `npm run lint`, `tsc --noEmit`, and test steps to deploy.yml.*

3. **Weak client-side PIN protection.** 4-digit numeric PIN with client-side SHA-256 is trivially brute-forceable. *Impact: MEDIUM. Fix: Accept as a speed bump or move to proper auth.*

4. **No origin validation on postMessage in roadshow iframe.** Cross-origin message injection possible. *Impact: MEDIUM. Fix: Add `event.origin` guard.*

5. **Accumulated rounding drift in Y6-Y10 projections.** `Math.round()` compounds through 5 years of growth-rate projection. *Impact: LOW-MEDIUM. Fix: Carry unrounded intermediate values and only round for display.*

---

## Improvement Recommendations (Priority Order)

| # | Recommendation | Effort |
|---|----------------|--------|
| 1 | Add automated testing framework (vitest + unit tests for calculator) | M |
| 2 | Add CI quality gates (lint, typecheck, test steps in deploy.yml) | S |
| 3 | Extract shared initialization hook (`useModelInit()`) | S |
| 4 | Add React Error Boundary with "Reset to defaults" recovery | S |
| 5 | Add postMessage origin validation in roadshow | S |
| 6 | Introduce shared state management (React Context or Zustand) | M |
| 7 | Add a11y basics (aria-label, contrast, keyboard nav, skip nav) | M |
| 8 | Add JSDoc to calculator engine public functions | S |
| 9 | Automate BP reference data sync from simulator defaults at build time | M |
| 10 | Add input range clamping in ParameterPanel setters | S |

---

## Team Performance Evaluation

### Developer: Ruth SHEN (Solo Developer + AI Pair Programming)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Technical Competence | 8/10 | Strong TypeScript, deep SaaS financial modeling (cohort decay, renewal rates, deployment gating) |
| Architecture Decisions | 8.5/10 | SOT architecture is the project's crown jewel — traceability matrix from params → BP → roadshow |
| Code Quality Discipline | 6.5/10 | Clean code, but zero tests for financial software is a significant gap |
| Product Thinking | 9/10 | Exceptional feature anticipation: change tracking, stale warnings, audit export, profile management |
| Velocity & Output | 9.5/10 | 50 commits, 4 routes, 15+ components, full calc engine, doc gen, conflict detection — exceptional for solo |
| Security Awareness | 5/10 | PIN system is weak, missing origin validation, no CSP |
| Accessibility | 4/10 | Minimal a11y despite professional visual design |

**Areas for Growth:**
- Testing discipline — financial calculations demand regression testing
- Accessibility awareness — the app excludes users with disabilities
- State management patterns — learning React Context/Zustand would improve architecture
- Security mindset — PIN system and missing origin validation need attention

**Overall Assessment: A−**  
Ruth has delivered a production-quality financial tool that exceeds what most solo developers could accomplish in the same timeframe. The SOT governance architecture and conflict detection system are genuinely innovative. The main gaps (testing, a11y, security) are common in fast-moving solo projects and are all addressable without architectural changes.

### AI Pair Programming Effectiveness

The codebase shows clear signs of effective human-AI collaboration:
- **Consistent code style** throughout all files suggests AI-assisted generation with human review
- **Comprehensive type definitions** in `calculator.ts` (15+ interfaces) are thorough in a way that suggests AI-generated structure refined by human domain knowledge
- **Business logic correctness** (cohort renewal decay, COGS only on direct sales) indicates strong human oversight — AI alone would not correctly model these domain-specific rules
- **The traceability matrix** (`MAPPING_BLOCKS`, `PARAM_MAPPING`, `ROADSHOW_DATA_POINTS`) likely emerged from human-AI iteration
- **The absence of tests** paradoxically suggests heavy AI reliance for implementation velocity, with human judgment prioritizing features over test coverage

The collaboration pattern: human provides domain requirements and architectural vision → AI generates implementation → human reviews and refines business logic. An effective pattern for rapid prototyping of complex domain applications.

---

## Conclusion

The ARIA Finance Simulator is a technically impressive solo-developer achievement that solves a real problem — maintaining consistency across financial documents for an investor pitch. Its strongest feature is the data governance architecture: the SOT principle enforced through a traceability matrix, conflict detection with severity classification, and versioned archiving creates an audit trail that many enterprise financial tools lack.

The primary risks are the complete absence of automated testing (critical for financial software), minimal security controls, and accessibility gaps. These are all solvable with moderate effort and should be prioritized before the simulator is used in formal investor presentations.

**Final Grade: B (7.0/10)** — A strong foundation with clear paths to an A-grade product through testing, CI hardening, and accessibility improvements.
