import { runOpCoEngine, runPropCoEngine, DEFAULT_OPCO_ASSUMPTIONS, DEFAULT_PROPCO_ASSUMPTIONS } from "./src/financialEngine.js";

const opCo = runOpCoEngine(DEFAULT_OPCO_ASSUMPTIONS);
const propCo = runPropCoEngine(DEFAULT_PROPCO_ASSUMPTIONS, opCo);

console.log("Payback with exit:", propCo.metrics.payback);
console.log("Payback without exit:", propCo.metrics.operatingPayback);
