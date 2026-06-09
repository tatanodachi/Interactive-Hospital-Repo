const fs = require('fs');
let code = fs.readFileSync('src/ExecutiveSummaryView.tsx', 'utf8');

const narrativeStepsRegex = /const narrativeSteps = \[\n([\s\S]*?)\n  \];/;
const match = code.match(narrativeStepsRegex);

if (match) {
  let stepsString = match[1];
  
  const bIndex = stepsString.indexOf('title: "3. Budget Information",');
  const aIndex = stepsString.indexOf('title: "4. Asset Information",');
  
  const budgetStart = stepsString.lastIndexOf('    {', bIndex);
  const assetStart = stepsString.lastIndexOf('    {', aIndex);
  
  const finalIndex = stepsString.length; // it matches inner content
  
  const budgetStr = stepsString.substring(budgetStart, assetStart);
  let assetStr = stepsString.substring(assetStart, finalIndex); 
  
  const newBudgetStr = budgetStr.replace('3. Budget Information', '4. Budget Information');
  const newAssetStr = assetStr.replace('4. Asset Information', '3. Asset Information');
  
  const beforeBudget = stepsString.substring(0, budgetStart);
  let newAssetStrClean = newAssetStr.replace(/\s*$/, '') + ',\n';
  let newBudgetStrClean = newBudgetStr.replace(/,\s*$/, '');
  
  const swapped = beforeBudget + newAssetStrClean + newBudgetStrClean;
  
  code = code.replace(stepsString, swapped);
  code = code.replace(/\["Financial", "Market", "Budget", "Asset"\]/g, '["Financial", "Market", "Asset", "Budget"]');
  
  fs.writeFileSync('src/ExecutiveSummaryView.tsx', code);
  console.log("Swapped successfully.");
} else {
  console.log("Could not find narrative steps array.");
}
