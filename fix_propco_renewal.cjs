const fs = require('fs');

// 1. Types
let types = fs.readFileSync('src/types.ts', 'utf8');
if (!types.includes('assumeLeaseRenewal?: boolean;') && types.includes('exitMethod?: string;')) {
    types = types.replace('exitMethod?: string;', 'exitMethod?: string;\n  assumeLeaseRenewal?: boolean;');
    fs.writeFileSync('src/types.ts', types);
}

// 2. Default Assumptions
let engine = fs.readFileSync('src/financialEngine.ts', 'utf8');
if (!engine.includes('assumeLeaseRenewal: false,')) {
    // Actually it is already in DEFAULT_OPCO_ASSUMPTIONS, let's add to DEFAULT_PROPCO_ASSUMPTIONS
    const pcoDefTarget = '  exitMethod: "cap_rate",\n  exitCapRate: 10,\n  exitMultiple: 15,';
    if (engine.includes(pcoDefTarget)) {
        engine = engine.replace(pcoDefTarget, pcoDefTarget + '\n  assumeLeaseRenewal: false,');
    }
}

// 3. Engine Logic
const targetEngine = `        let tv = 0;
        if (assumptions.exitMethod === "dcf") {
          const remainingYears =
            (assumptions.landLeaseTermYears || 10) - exitYear;
          if (remainingYears > 0) {`;

const replaceEngine = `        let tv = 0;
        const isLeaseExpired = assumptions.isLandLeased && exitYear >= (assumptions.landLeaseTermYears || 10);
        
        if (isLeaseExpired && !assumptions.assumeLeaseRenewal) {
          tv = 0;
        } else if (assumptions.exitMethod === "dcf") {
          const remainingYears = (assumptions.assumeLeaseRenewal && isLeaseExpired)
            ? 20 // Default renewal term
            : (assumptions.landLeaseTermYears || 10) - exitYear;
          if (remainingYears > 0) {`;

if (engine.includes(targetEngine)) {
    engine = engine.replace(targetEngine, replaceEngine);
}

// Fix cap rate / multiple overriding tv=0
const targetEngine2 = `          }
        } else if (assumptions.exitMethod === "multiple") {
          tv = noi * assumptions.exitMultiple;
        } else {
          tv = noi / (assumptions.exitCapRate / 100);
        }`;

const replaceEngine2 = `          }
        } else if (assumptions.exitMethod === "multiple") {
          tv = noi * assumptions.exitMultiple;
        } else {
          tv = noi / (assumptions.exitCapRate / 100);
        }`;
// Wait, actually my replaceEngine made it an `else if`, so I need to check the original structure.
