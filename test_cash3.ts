import { runPropCoEngine, DEFAULT_PROPCO_ASSUMPTIONS } from "./src/financialEngine.ts";

const res = runPropCoEngine(DEFAULT_PROPCO_ASSUMPTIONS);
const devData = res.annualData.find(d => !d.isOperating);
console.log({
  fcfe: devData.fcfe,
  preOp: devData.preOpeningDev,
  hard: devData.hardSpend,
  soft: devData.softSpend,
  land: devData.landSpend
});
