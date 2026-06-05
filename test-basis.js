import fs from 'fs';

const extractDefault = (key) => {
  const content = fs.readFileSync('./src/App.tsx', 'utf8');
  const regex = new RegExp(`\\b${key}: ([\\d\\.]+),`);
  const match = content.match(regex);
  if (match) return parseFloat(match[1]);
  return null;
}

const keys = [
  'buildArea', 'buildCost', 'capexMedEqQty', 'capexMedEqPrice', 'capexInfraQty', 'capexInfraPrice',
  'capexFFEQty', 'capexFFEPrice', 'capexConsultantPct', 'capexLicensePct', 'capexSharingDevQty', 'capexSharingDevPrice',
  'capexVat', 'devCarPct', 'capexContingencyPct',
  'depLifeBuilding', 'depLifeMedEq', 'depLifeInfra', 'depLifeFFE'
];

const as = {};
keys.forEach(k => {
  as[k] = extractDefault(k) || 0;
});

const buildCost = (as.buildArea * as.buildCost) / 1000;
const medEqFullValue = (as.capexMedEqQty * as.capexMedEqPrice) / 1000;
const medEqCost = medEqFullValue;
const infraCost = (as.capexInfraQty * as.capexInfraPrice) / 1000;
const ffeCost = (as.capexFFEQty * as.capexFFEPrice) / 1000;
const sharingDevCost = (as.capexSharingDevQty * as.capexSharingDevPrice) / 1000;

const totalHardCosts = buildCost + medEqCost + infraCost + ffeCost + sharingDevCost;

const coreCostForPct = buildCost + ffeCost + medEqFullValue + infraCost + sharingDevCost;
const consultantCost = coreCostForPct * ((as.capexConsultantPct || 0) / 100);
const licenseCost = coreCostForPct * ((as.capexLicensePct || 0) / 100);

const vatBase = consultantCost + buildCost + ffeCost + medEqFullValue + infraCost + sharingDevCost;
const vatCost = vatBase * ((as.capexVat || 0) / 100);

const contingencyBase = licenseCost + consultantCost + buildCost + ffeCost + medEqFullValue + infraCost + sharingDevCost + vatCost;

const contingencyCost = contingencyBase * ((as.capexContingencyPct || 0) / 100);

const landCost = 0; // assuming default
const totalCapex = landCost + buildCost + medEqCost + infraCost + ffeCost + consultantCost + licenseCost + sharingDevCost + vatCost + contingencyCost;

const totalSoftCosts = totalCapex - landCost - totalHardCosts;

console.log('buildCost', buildCost);
console.log('medEq', medEqCost);
console.log('infra', infraCost);
console.log('ffe', ffeCost);
console.log('Total Hard Costs:', totalHardCosts);
console.log('Total Soft Costs:', totalSoftCosts);

const buildBasis = buildCost + (coreCostForPct > 0 ? (totalSoftCosts * buildCost) / coreCostForPct : 0);
const medEqBasis = medEqCost + (coreCostForPct > 0 ? (totalSoftCosts * medEqFullValue) / coreCostForPct : 0);
const infraBasis = infraCost + sharingDevCost + (coreCostForPct > 0 ? (totalSoftCosts * (infraCost + sharingDevCost)) / coreCostForPct : 0);
const ffeBasis = ffeCost + (coreCostForPct > 0 ? (totalSoftCosts * ffeCost) / coreCostForPct : 0);

console.log('buildBasis', buildBasis, 'dep', buildBasis / as.depLifeBuilding / 12);
console.log('medEqBasis', medEqBasis, 'dep', medEqBasis / as.depLifeMedEq / 12);
console.log('infraBasis', infraBasis, 'dep', infraBasis / as.depLifeInfra / 12);
console.log('ffeBasis', ffeBasis, 'dep', ffeBasis / as.depLifeFFE / 12);

console.log('Total dep monthly', (buildBasis / as.depLifeBuilding / 12) + (medEqBasis / as.depLifeMedEq / 12) + (infraBasis / as.depLifeInfra / 12) + (ffeBasis / as.depLifeFFE / 12));
