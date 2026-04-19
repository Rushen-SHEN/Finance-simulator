import { DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST, DEFAULT_SCENARIO_OVERRIDES, DEFAULT_YEARLY_BASE, DEFAULT_MILESTONES_BASE } from './src/lib/defaults';
import { calculate } from './src/lib/calculator';

// ==========================================
// Scenario A: Neutral (rr=70%) — used in BP v2.2
// ==========================================
const soN = DEFAULT_SCENARIO_OVERRIDES.neutral;
const bestN = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST, soN);

console.log('=== NEUTRAL (rr=0.70) Best Case ===');
for (let i = 0; i < 10; i++) {
  const y = bestN.years[i];
  console.log(`Y${i+1}: Rev=${Math.round(y.total_revenue/10000)}w COGS=${Math.round(y.cogs/10000)}w OpEx=${Math.round(y.opex/10000)}w EBITDA=${Math.round(y.ebitda/10000)}w NP=${Math.round(y.net_profit/10000)}w Beds=${y.cumulative_beds} Active=${y.active_paying} GM=${y.total_revenue>0?(y.gross_margin!*100).toFixed(0)+'%':'---'}`);
}

// ==========================================
// Scenario B: Optimistic (rr=85%) — FP claims this
// ==========================================
const soO = DEFAULT_SCENARIO_OVERRIDES.optimistic;
const bestO = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST, soO);

console.log('');
console.log('=== OPTIMISTIC (rr=0.85) Best Case ===');
for (let i = 0; i < 10; i++) {
  const y = bestO.years[i];
  console.log(`Y${i+1}: Rev=${Math.round(y.total_revenue/10000)}w COGS=${Math.round(y.cogs/10000)}w OpEx=${Math.round(y.opex/10000)}w EBITDA=${Math.round(y.ebitda/10000)}w NP=${Math.round(y.net_profit/10000)}w Beds=${y.cumulative_beds} Active=${y.active_paying} GM=${y.total_revenue>0?(y.gross_margin!*100).toFixed(0)+'%':'---'}`);
}

// ==========================================
// Scenario C: Custom — rr=85% but neutral growth rates (what FP might actually be)
// ==========================================
const soCustom = { ...soN, rr_base: 0.85 };
const bestC = calculate(DEFAULT_GLOBAL, DEFAULT_YEARLY, DEFAULT_OPEX, DEFAULT_MILESTONES_BEST, soCustom);

console.log('');
console.log('=== CUSTOM (rr=0.85 + neutral growth) Best Case ===');
for (let i = 0; i < 10; i++) {
  const y = bestC.years[i];
  console.log(`Y${i+1}: Rev=${Math.round(y.total_revenue/10000)}w COGS=${Math.round(y.cogs/10000)}w OpEx=${Math.round(y.opex/10000)}w EBITDA=${Math.round(y.ebitda/10000)}w NP=${Math.round(y.net_profit/10000)}w Beds=${y.cumulative_beds} Active=${y.active_paying}`);
}

// ==========================================
// OpEx detail for Optimistic
// ==========================================
console.log('');
console.log('=== OPTIMISTIC OpEx Detail Y1-Y5 ===');
for (let i = 0; i < 5; i++) {
  const od = bestO.years[i].opex_detail;
  console.log(`Y${i+1}: Sal=${Math.round(od.salary/10000)}w NRE=${Math.round(od.cdmo_nre/10000)}w PilBOM=${Math.round(od.pilot_bom/10000)}w CRO=${Math.round(od.cro/10000)}w Reg=${Math.round(od.reg/10000)}w Comp=${Math.round(od.compliance/10000)}w Pat=${Math.round(od.patent_ai/10000)}w Trav=${Math.round(od.travel_ops/10000)}w TOTAL=${Math.round(bestO.years[i].opex/10000)}w`);
}

// ==========================================
// Revenue detail for Optimistic
// ==========================================
console.log('');
console.log('=== OPTIMISTIC Revenue Detail Y1-Y5 ===');
for (let i = 0; i < 5; i++) {
  const y = bestO.years[i];
  console.log(`Y${i+1}: HWD=${Math.round(y.hw_direct/10000)}w HWB=${Math.round(y.hw_baxter/10000)}w Upg=${Math.round(y.upgrade_revenue/10000)}w SaasD=${Math.round(y.saas_direct/10000)}w SaasB=${Math.round(y.saas_baxter/10000)}w Lic=${Math.round(y.baxter_license/10000)}w TOTAL=${Math.round(y.total_revenue/10000)}w`);
}

// ==========================================
// FP v2.3 claimed values for comparison
// ==========================================
console.log('');
console.log('=== FP v2.3 CLAIMED VALUES ===');
const fpRev = [0, 879, 3399, 8424, 11267, 14647, 19041, 24753, 30942, 38677];
const fpEBITDA = [-578, 99, 1973, 6223, 8958, 7973, 10450, 13712, 17245, 21651];
const fpBeds = [0, 287, 2033, 4393, 7403, 11316, 16403, 23016, 31282, 41615];
const fpOpEx = [578, 716, 1054, 1202, 1355, 0, 0, 0, 0, 0]; // Y6-10 not in FP detail
for (let i = 0; i < 10; i++) {
  const simN = bestN.years[i];
  const simO = bestO.years[i];
  const revNDiff = fpRev[i] > 0 ? ((Math.round(simN.total_revenue/10000) / fpRev[i]) * 100).toFixed(0) : '---';
  const revODiff = fpRev[i] > 0 ? ((Math.round(simO.total_revenue/10000) / fpRev[i]) * 100).toFixed(0) : '---';
  console.log(`Y${i+1}: FP_Rev=${fpRev[i]}w SimN_Rev=${Math.round(simN.total_revenue/10000)}w(${revNDiff}%) SimO_Rev=${Math.round(simO.total_revenue/10000)}w(${revODiff}%) | FP_EBITDA=${fpEBITDA[i]}w SimN=${Math.round(simN.ebitda/10000)}w SimO=${Math.round(simO.ebitda/10000)}w | FP_Beds=${fpBeds[i]} SimN=${simN.cumulative_beds} SimO=${simO.cumulative_beds}`);
}
