# PRD: ARIA Financial Model Simulator

## 1. Product Overview

**Product Name:** ARIA Financial Model Simulator  
**Version:** 1.0  
**Date:** 2026-04-18  

An interactive web-based financial dashboard for the ARIA ICU Delirium Monitoring System business plan. Users can view 5-year financial projections, adjust input parameters (pricing, bed deployment, costs, renewal rates), and see real-time updates to revenue, profitability, and key metrics. All user modifications persist across sessions.

## 2. Goals

- Replicate the investor pitch dashboard (from the HTML reference) as an interactive web app
- Use the Excel financial model (`ARIA_9_2_Model_refined_cost.xlsx`) as the data source
- Allow users to modify key assumptions and see updated charts/tables instantly
- Persist user-modified data so changes survive page reloads
- Deploy as a Vercel-hosted application

## 3. Target Users

- Founders / management team adjusting financial scenarios
- Potential investors reviewing the business plan
- Advisors performing sensitivity analysis

## 4. Feature Specification

### 4.1 Dashboard Overview (Read-Only Display)

| Section | Content | Source Sheet |
|---------|---------|-------------|
| Header Bar | Logo, scenario pills (Neutral/Optimistic/Conservative/Delayed), parameter toggle | — |
| Status Strip | M1 start date, current phase, funding status, cumulative beds, patent status, team size | Static |
| KPI Cards | Clinical pain point, competitive landscape, regulatory path, Beijing deployment | Static |
| Market Funnel | TAM / SAM / SOM visualization | Static |
| Business Model | Pricing table (Class II / III / Upgrade), Hospital ROI cards | `Inputs_Global` |
| P&L Summary | 5-year financial table (Revenue, COGS, Gross Profit, OpEx, EBITDA, Net Profit) | `Dashboard` / `Calc` |
| Revenue Charts | Stacked bar (Hardware/Upgrade/SaaS) + Structure % chart | `Calc` |
| Profitability Charts | EBITDA & Net Profit bar/line + Cumulative vs Active Beds | `Calc` |
| Funding Plan | 3-round cards (Seed / Pre-A / Series A) + summary KPIs | Static |
| Gantt Timeline | M1–M60 milestone Gantt chart | Static |
| Assumptions & Risks | Color-coded risk cards (Red/Yellow/Green) | Static |

### 4.2 Editable Parameters (User Can Modify)

| Parameter | Source | Default |
|-----------|--------|---------|
| Class II hardware price (元/bed) | `Inputs_Global.price_hw_c2` | 80,000 |
| Class III hardware price (元/bed) | `Inputs_Global.price_hw_c3` | 120,000 |
| Upgrade service price (元/bed) | `Inputs_Global.price_upgrade` | 40,000 |
| Class II SaaS annual fee (元/bed/yr) | `Inputs_Global.price_saas_c2` | 25,000 |
| Class III SaaS annual fee (元/bed/yr) | `Inputs_Global.price_saas_c3` | 40,000 |
| Class II hardware BOM (元/bed) | `Inputs_Global.cogs_hw_c2` | 55,000 |
| Class III hardware BOM (元/bed) | `Inputs_Global.cogs_hw_c3` | 70,000 |
| Upgrade service COGS (元/bed) | `Inputs_Global.cogs_upgrade` | 15,000 |
| Base renewal rate | `Inputs_Global.rr_base` | 0.75 |
| New Class II beds/year | `Inputs_Yearly` rows | [0, 100, 100, 0, 0] |
| New Class III beds/year | `Inputs_Yearly` rows | [0, 0, 0, 100, 200] |
| Planned upgrade beds/year | `Inputs_Yearly` rows | [0, 0, 0, 131, 0] |
| OpEx/year (元) | `Inputs_Yearly` rows | [3.5M, 5M, 6.5M, 11M, 13M] |
| Depreciation/year (元) | `Inputs_Yearly` rows | [200K, 300K, 300K, 300K, 400K] |
| COGS reduction: shared edge hub (0/1) | `COGS_Drivers` | 1 |
| COGS reduction: supplier discount | `COGS_Drivers` | 0.08 |
| COGS reduction: yield improvement | `COGS_Drivers` | 0.05 |

### 4.3 Real-Time Calculation Engine

When any parameter changes, recalculate the full `Calc` sheet logic:

1. **Effective BOM** = Baseline BOM × (1 - supplier_discount) × (1 - yield_improvement) - hub_saving
2. **Hardware Revenue** = new_beds × unit_price per year
3. **Upgrade Revenue** = actual_upgrade_beds × upgrade_price
4. **SaaS Revenue** = active_paying_beds × SaaS_fee × billing_factor (with renewal decay)
5. **COGS** = new_beds × effective_BOM + upgrade_beds × effective_upgrade_COGS
6. **Gross Profit** = Total Revenue - COGS
7. **EBITDA** = Gross Profit - OpEx
8. **Net Profit** = EBITDA - D&A

### 4.4 Data Persistence

- User-modified parameters saved to browser `localStorage`
- "Reset to Default" button restores original Excel values
- Parameters panel shows which values differ from defaults

### 4.5 Scenario Switching

Four pre-built scenarios modify renewal rate + timeline assumptions:
- **Neutral**: Base case (rr=0.75)
- **Optimistic**: rr=0.85, all milestones on time
- **Conservative**: rr=0.60, revenue -15%
- **Delayed**: Milestones +6 months, Y4 EBITDA reduced

## 5. Technical Architecture

```
Next.js 14 (App Router)
├── /app
│   ├── page.tsx           — Main dashboard
│   ├── layout.tsx         — Root layout
│   └── api/
│       └── data/route.ts  — API: load Excel → JSON
├── /components
│   ├── Header.tsx
│   ├── StatusStrip.tsx
│   ├── KPICards.tsx
│   ├── MarketFunnel.tsx
│   ├── BusinessModel.tsx
│   ├── FinancialTable.tsx
│   ├── RevenueCharts.tsx
│   ├── ProfitCharts.tsx
│   ├── FundingPlan.tsx
│   ├── GanttTimeline.tsx
│   ├── Assumptions.tsx
│   └── ParameterPanel.tsx
├── /lib
│   ├── excel.ts           — Read Excel at build/runtime
│   ├── calculator.ts      — Financial calculation engine
│   └── defaults.ts        — Default values from Excel
└── /public
    └── data/model.json    — Pre-extracted Excel data (build-time)
```

**Stack:**
- Next.js 14 + TypeScript + Tailwind CSS
- Chart.js (via react-chartjs-2) for charts
- xlsx library for Excel parsing at build time
- localStorage for persistence
- Vercel for deployment

## 6. Data Flow

```
Excel File (build time)
  → /lib/excel.ts parses all sheets → /public/data/model.json
  → App loads model.json as defaults
  → User edits → localStorage overrides
  → calculator.ts recomputes → UI updates
  → "Reset" clears localStorage → back to defaults
```

## 7. Non-Functional Requirements

- Responsive: desktop + tablet + mobile
- Language: Chinese (matching original dashboard)
- Print-friendly: CSS print styles for PDF export
- PNG export per section (html2canvas)
- Load time < 2s on Vercel
- No server-side state needed (all client-side calculation)

## 8. Success Criteria

- All 11 Excel sheets' data accurately reflected in the dashboard
- Parameter changes produce correct recalculated values matching Excel formulas
- User modifications persist across browser sessions
- Successfully deployed and accessible on Vercel
