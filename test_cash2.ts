import { runPropCoEngine, DEFAULT_PROPCO_ASSUMPTIONS } from "./src/financialEngine.ts";

const res = runPropCoEngine(DEFAULT_PROPCO_ASSUMPTIONS);
console.log(res.annualData.slice(0, 2).map(d => ({
  year: d.year,
  netIncome: d.netIncome,
  dep: d.dep,
  cfo: (d.netIncome||0) + (d.dep||0),
  cfi: -((d.hardSpend||0) + (d.softSpend||0) + (d.landSpend||0)),
  fcfe: d.fcfe,
  debtDraw: d.debtDraw,
  cff: (d.debtDraw||0) - (d.fcfe||0),
  netFlow: d.netFlow,
  preOp: d.preOpeningDev,
  ga: d.devGa,
  car: d.devCar,
  idc: d.interest
})));
