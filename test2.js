const assumptions = {
  landArea: 12643,
  landPrice: 15,
  buildArea: 13000,
  buildCost: 11.5,
  includeMedEq: true,
  medEqProcurement: "lease",
  medEqLeaseMonthly: 0.375,
  medEqPurchaseOpYear: 4,
  medEqPurchaseAmount: 150000,
  capexMedEqQty: 1,
  capexMedEqPrice: 150000,
  capexInfraQty: 8310,
  capexInfraPrice: 0.7,
  includeFFE: true,
  capexFFEQty: 1,
  capexFFEPrice: 26000,
  capexSharingDevQty: 5361,
  capexSharingDevPrice: 0.8,
  capexContingencyPct: 2,
  capexConsultantPct: 2.5,
  capexLicensePct: 1.5,
  capexVat: 11,
  devDurationMonths: 24,
  equityDrawYear1Pct: 100,
  devGaMonthly: 0.5,
  devCarPct: 0.15,
  depLifeBuilding: 20,
  depMethodBuilding: "SL",
  depLifeMedEq: 10,
  depMethodMedEq: "SL",
  depLifeInfra: 20,
  depMethodInfra: "SL",
  depLifeFFE: 20,
  depMethodFFE: "SL",
  depLifeSoftCost: 20,
  depMethodSoftCost: "SL",
  projYears: 30
};

const landCost = (assumptions.landArea * assumptions.landPrice) / 1000;
const buildCost = (assumptions.buildArea * assumptions.buildCost) / 1000;
const medEqCost = assumptions.includeMedEq ? (assumptions.capexMedEqQty * assumptions.capexMedEqPrice) / 1000 : 0;
const infraCost = (assumptions.capexInfraQty * assumptions.capexInfraPrice) / 1000;
const ffeCost = assumptions.includeFFE ? (assumptions.capexFFEQty * assumptions.capexFFEPrice) / 1000 : 0;
const sharingDevCost = (assumptions.capexSharingDevQty * assumptions.capexSharingDevPrice) / 1000;
const totalHardCosts = buildCost + medEqCost + infraCost + ffeCost + sharingDevCost;

const consultantBase = buildCost + ffeCost + infraCost + medEqCost;
const consultantCost = consultantBase * (assumptions.capexConsultantPct / 100);
const licenseCost = consultantBase * (assumptions.capexLicensePct / 100);
const vatBase = consultantCost + licenseCost + buildCost + ffeCost + infraCost + sharingDevCost;
const vatCost = vatBase * (assumptions.capexVat / 100);
const carCost = buildCost * (assumptions.devCarPct / 100);
const devGaTotalCost = assumptions.devGaMonthly * assumptions.devDurationMonths;
const contingencyBase = licenseCost + consultantCost + buildCost + medEqCost + ffeCost + infraCost + sharingDevCost + vatCost;
const contingencyCost = contingencyBase * (assumptions.capexContingencyPct / 100);

const totalCapex = landCost + buildCost + medEqCost + infraCost + ffeCost + consultantCost + licenseCost + sharingDevCost + vatCost + carCost + devGaTotalCost + contingencyCost;
const upfrontMedEq = assumptions.medEqProcurement !== "lease" ? medEqCost : 0;
const totalSoftCosts = totalCapex - landCost - totalHardCosts;

console.log("Total Capex:", totalCapex);
console.log("Total Hard Costs:", totalHardCosts);
console.log("Total Soft Costs:", totalSoftCosts);
console.log("devGaTotalCost:", devGaTotalCost);
console.log("carCost:", carCost);

const buildBasis = buildCost;
const medEqBasis = upfrontMedEq;
const infraBasis = infraCost + sharingDevCost;
const ffeBasis = ffeCost;
const softCostBasis = totalSoftCosts - devGaTotalCost - carCost;
const softCostBasisInc = totalSoftCosts; // if we didn't subtract

console.log("softCostBasis (excl):", softCostBasis);
console.log("softCostBasis (incl):", softCostBasisInc);

let bvB = buildBasis, bvI = infraBasis, bvF = ffeBasis, bvS_excl = softCostBasis, bvS_incl = softCostBasisInc;

const calcDep = (bv, basis, life, method) => {
  if (method === "DDB") return Math.min(bv * (2 / life), bv);
  return Math.min(basis / life, bv);
};

let totalDandA_excl = 0;
let totalDandA_incl = 0;
for (let i = 1; i <= assumptions.projYears; i++) {
   const m_d1 = calcDep(bvB, buildBasis, assumptions.depLifeBuilding, assumptions.depMethodBuilding);
   bvB -= m_d1;
   const m_d3 = calcDep(bvI, infraBasis, assumptions.depLifeInfra, assumptions.depMethodInfra);
   bvI -= m_d3;
   const m_d4 = calcDep(bvF, ffeBasis, assumptions.depLifeFFE, assumptions.depMethodFFE);
   bvF -= m_d4;
   
   const m_d5_excl = calcDep(bvS_excl, softCostBasis, assumptions.depLifeSoftCost, assumptions.depMethodSoftCost);
   bvS_excl -= m_d5_excl;
   totalDandA_excl += m_d1 + m_d3 + m_d4 + m_d5_excl;

   const m_d5_incl = calcDep(bvS_incl, softCostBasisInc, assumptions.depLifeSoftCost, assumptions.depMethodSoftCost);
   bvS_incl -= m_d5_incl;
   totalDandA_incl += m_d1 + m_d3 + m_d4 + m_d5_incl;
}

console.log("Total D&A (excl Dev Ga & Car):", totalDandA_excl);
console.log("Total D&A (incl Dev Ga & Car):", totalDandA_incl);
