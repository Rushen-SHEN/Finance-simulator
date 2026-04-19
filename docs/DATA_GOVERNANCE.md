# ARIA Data Governance — Single Source of Truth

## Policy

**Finance Simulator (`aria-simulator`) is the Single Source of Truth for all financial data.**

All downstream documents — including BP (`ARIA_BP_External_clean.md`), Financial Plan (`ARIA_Financial_Plan.md`), and roadshow materials — must derive their financial figures from simulator output. No document may contain hand-edited financial data that contradicts the simulator.

## Update Workflow

1. **Change parameters** → Edit `src/lib/defaults.ts` (scenario overrides, milestones, yearly inputs, OpEx)
2. **Run simulator** → Verify output on the web app or via `npx tsx extract_data.ts`
3. **Update BP** → Transfer simulator output into `docs/ARIA_BP_External_clean.md` §1.5, §9.1–§9.6
4. **Regenerate DOCX** → Run pandoc + style_docx pipeline

## Primary Scenario

- **Timeline**: Best Case (`DEFAULT_YEARLY` + `DEFAULT_MILESTONES_BEST`)
- **Scenario**: Neutral (`DEFAULT_SCENARIO_OVERRIDES.neutral`)
- **Key params**: rr_base=0.70, growth Y6–Y10 = 30/30/30/25/25%, COGS target = 34%

## Extraction Script

Run `npx tsx extract_data.ts` from the project root to output all financial data used in the BP.

## History

| Date | Action |
|---|---|
| 2026-04-19 | v2.2 — Reversed source of truth: simulator → BP (was BP → simulator in v2.1) |
