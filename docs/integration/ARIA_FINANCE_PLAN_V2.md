# ARIA Finance Plan v2 Integration

This repository now includes a dedicated ARIA finance-plan v2 surface alongside the existing simulator home page.

## New routes

- `/dashboard`: read-only 10-year KPI dashboard with BP mapping traceability.
- `/parameters`: scenario workbench for assumption changes, impact review and audit history.

## New files

- `src/data/financial-model.v2.0.json`: versioned ARIA v2 model contract.
- `src/lib/calculation-engine.ts`: pure calculation and scenario-diff utilities.
- `src/components/metric-trace-badges.tsx`: shared UI for M-block badges, trace drawer and audit rows.

## Notes

- The existing `/` route remains unchanged as the main interactive simulator.
- Header navigation now exposes links to the new ARIA routes.
- `npm run build` passes with these additions.
- `npm run lint` still reports pre-existing issues in `src/app/page.tsx` and `src/components/ParameterPanel.tsx`.