import { runPropCoEngine, DEFAULT_PROPCO_ASSUMPTIONS, runOpCoEngine, DEFAULT_OPCO_ASSUMPTIONS, runConsolidatedEngine, DEFAULT_HOLDCO_ASSUMPTIONS } from "./src/financialEngine.ts";
const propco = runPropCoEngine(DEFAULT_PROPCO_ASSUMPTIONS);
const opco = runOpCoEngine(DEFAULT_OPCO_ASSUMPTIONS);
const cons = runConsolidatedEngine(opco, propco, DEFAULT_OPCO_ASSUMPTIONS, DEFAULT_HOLDCO_ASSUMPTIONS);

console.log("PropCo Operating FCFE total:", cons.totals.propCoOperatingFlow);
console.log("PropCo Shortfall total:", cons.totals.propCoShortfall);
console.log("HoldCo Cash Flow totals (Net Distributable):", cons.totals.netDistributableCashFlow);
console.log("HoldCo Cash Available for Outflows:", cons.totals.cashAvailableForOutflows);
console.log("HoldCo array:", cons.annualData.map(d=>d.cashAvailableForOutflows));
