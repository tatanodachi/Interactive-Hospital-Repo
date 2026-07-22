const fs = require('fs');
let engine = fs.readFileSync('src/financialEngine.ts', 'utf8');

const defTarget = `  exitYear: 10,
  exitMethod: "dcf",
  exitCapRate: 8.5,
  exitMultiple: 15,
  sellingCosts: 0,
};`;
const defReplace = `  exitYear: 10,
  exitMethod: "dcf",
  exitCapRate: 8.5,
  exitMultiple: 15,
  assumeLeaseRenewal: false,
  sellingCosts: 0,
};`;

if (engine.includes(defTarget)) {
    engine = engine.replace(defTarget, defReplace);
}

const targetLogic = `        let tv = 0;
        if (assumptions.exitMethod === "dcf") {
          const remainingYears =
            (assumptions.landLeaseTermYears || 10) - exitYear;
          if (remainingYears > 0) {`;

const replaceLogic = `        let tv = 0;
        const isLeaseExpired = assumptions.isLandLeased && exitYear >= (assumptions.landLeaseTermYears || 10);
        
        if (isLeaseExpired && !assumptions.assumeLeaseRenewal) {
          tv = 0;
        } else if (assumptions.exitMethod === "dcf") {
          const remainingYears = (isLeaseExpired && assumptions.assumeLeaseRenewal)
            ? 20 // Default 20 years projection if lease expired but assumed renewed
            : (assumptions.landLeaseTermYears || 10) - exitYear;
            
          if (remainingYears > 0) {`;

if (engine.includes(targetLogic)) {
    engine = engine.replace(targetLogic, replaceLogic);
}

fs.writeFileSync('src/financialEngine.ts', engine);
console.log("Engine logic updated.");
