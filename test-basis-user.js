const buildCost = 149.5;
const ffeCost = 26;
const infraCost = 5.817;
const medEqFullValue = 150;
const sharingDevCost = 4.2888; // 5361 * 0.8 / 1000

const consultantBase = buildCost + ffeCost + infraCost + medEqFullValue;
const consultantCost = consultantBase * 0.025; // 2.5%

const licenseBase = buildCost + ffeCost + infraCost + medEqFullValue;
const licenseCost = licenseBase * 0.015; // 1.5%

const vatBase = buildCost + ffeCost + infraCost + sharingDevCost + consultantCost;
const vatCost = vatBase * 0.11; // 11%

const contingencyBase = buildCost + ffeCost + infraCost + sharingDevCost + consultantCost + licenseCost + vatCost;
const contingencyCost = contingencyBase * 0.02; // 2%

console.log("Consultant:", consultantCost);
console.log("License:", licenseCost);
console.log("VAT:", vatCost);
console.log("Contingency:", contingencyCost);
