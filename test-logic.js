import fs from 'fs';

const file = fs.readFileSync('./src/App.tsx', 'utf8');

function evaluateLogic() {
  const assumptions = {
      buildArea: 13000,
      buildCost: 11.5,
      capexMedEqQty: 1,
      capexMedEqPrice: 150000,
      capexInfraQty: 8310,
      capexInfraPrice: 0.7,
      capexFFEQty: 1,
      capexFFEPrice: 26000,
      capexConsultantPct: 2.5,
      capexLicensePct: 1.5,
      capexSharingDevQty: 5361,
      capexSharingDevPrice: 0.8,
      capexVat: 11,
      devCarPct: 0.15,
      capexContingencyPct: 2,
      depLifeBuilding: 20,
      depLifeMedEq: 10,
      depLifeInfra: 20,
      depLifeFFE: 20,
      includeMedEq: true,
      medEqProcurement: 'lease',
      includeFFE: true
  };
  
  const buildCost = (assumptions.buildArea * assumptions.buildCost) / 1000;
  const medEqFullValue = assumptions.includeMedEq
    ? (assumptions.capexMedEqQty * assumptions.capexMedEqPrice) / 1000
    : 0;
  const medEqCost =
    assumptions.medEqProcurement !== "lease" ? medEqFullValue : 0;
  const infraCost =
    (assumptions.capexInfraQty * assumptions.capexInfraPrice) / 1000;
  const ffeCost = assumptions.includeFFE
    ? (assumptions.capexFFEQty * assumptions.capexFFEPrice) / 1000
    : 0;
  const sharingDevCost =
    (assumptions.capexSharingDevQty * assumptions.capexSharingDevPrice) / 1000;
  const totalHardCosts = buildCost + medEqCost + infraCost + ffeCost + sharingDevCost;

  const coreCostForPct = buildCost + ffeCost + medEqFullValue + infraCost + sharingDevCost;
  const consultantCost =
    coreCostForPct * ((assumptions.capexConsultantPct || 0) / 100);
  const licenseCost =
    coreCostForPct * ((assumptions.capexLicensePct || 0) / 100);
  const vatBase =
    consultantCost +
    buildCost +
    ffeCost +
    medEqFullValue +
    infraCost +
    sharingDevCost;
  const vatCost = vatBase * ((assumptions.capexVat || 0) / 100);
  const contingencyBase =
    licenseCost +
    consultantCost +
    buildCost +
    ffeCost +
    medEqFullValue +
    infraCost +
    sharingDevCost +
    vatCost;
  const contingencyCost =
    contingencyBase * ((assumptions.capexContingencyPct || 0) / 100);

  const landCost = 0;
  const totalCapex =
    landCost +
    buildCost +
    medEqCost +
    infraCost +
    ffeCost +
    consultantCost +
    licenseCost +
    sharingDevCost +
    vatCost +
    contingencyCost;
  const totalSoftCosts = totalCapex - landCost - totalHardCosts;

  const buildBasis =
    buildCost +
    (coreCostForPct > 0 ? (totalSoftCosts * buildCost) / coreCostForPct : 0);
  let medEqBasis =
    medEqCost +
    (coreCostForPct > 0 ? (totalSoftCosts * medEqFullValue) / coreCostForPct : 0);
  const infraBasis =
    infraCost + sharingDevCost +
    (coreCostForPct > 0 ? (totalSoftCosts * (infraCost + sharingDevCost)) / coreCostForPct : 0);
  const ffeBasis =
    ffeCost +
    (coreCostForPct > 0 ? (totalSoftCosts * ffeCost) / coreCostForPct : 0);

  console.log("totalSoftCosts:", totalSoftCosts);
  console.log("buildBasis:", buildBasis, "dep/mo:", buildBasis / 20 / 12);
  console.log("infraBasis:", infraBasis, "dep/mo:", infraBasis / 20 / 12);
  console.log("ffeBasis:", ffeBasis, "dep/mo:", ffeBasis / 20 / 12);
  console.log("medEqBasis:", medEqBasis, "dep/mo:", medEqBasis / 10 / 12);
}

evaluateLogic();
