const fs = require('fs');

// 1. Engine
let engine = fs.readFileSync('src/financialEngine.ts', 'utf8');

const targetDef = `  exitMethod: "cap_rate",
  exitCapRate: 10,
  exitMultiple: 15,`;
if (engine.includes(targetDef) && !engine.includes("assumeLeaseRenewal: false,")) {
  engine = engine.replace(targetDef, targetDef + '\n  assumeLeaseRenewal: false,');
}

const targetLogic = `        let tv = 0;
        if (assumptions.exitMethod === "dcf") {
          const remainingYears =
            (assumptions.landLeaseTermYears || 10) - exitYear;
          if (remainingYears > 0) {`;

const replaceLogic = `        let tv = 0;
        const isLeaseExpired = assumptions.isLandLeased && exitYear >= (assumptions.landLeaseTermYears || 10);
        
        if (isLeaseExpired && !assumptions.assumeLeaseRenewal) {
          tv = 0; // PropCo terminal value is 0 if the land lease is expired and no renewal is assumed
        } else if (assumptions.exitMethod === "dcf") {
          const remainingYears = (isLeaseExpired && assumptions.assumeLeaseRenewal) 
            ? 20 // Default 20-year renewal projection
            : (assumptions.landLeaseTermYears || 10) - exitYear;
          if (remainingYears > 0) {`;

if (engine.includes(targetLogic)) {
  engine = engine.replace(targetLogic, replaceLogic);
  fs.writeFileSync('src/financialEngine.ts', engine);
  console.log("Engine updated.");
}

// 2. Settings View
let settings = fs.readFileSync('src/views/PropCoSettingsView.tsx', 'utf8');
const targetUI = `                    <AssumptionRow
                      label="Exit Cap Rate (%)"
                      value={assumptions.exitCapRate || 0}
                      onChange={(v) => onChange("exitCapRate", v)}
                      isLocked={isLocked || assumptions.exitMethod !== "cap_rate"}
                    />
                  </div>`;
                  
const replaceUI = `                    <AssumptionRow
                      label="Exit Cap Rate (%)"
                      value={assumptions.exitCapRate || 0}
                      onChange={(v) => onChange("exitCapRate", v)}
                      isLocked={isLocked || assumptions.exitMethod !== "cap_rate"}
                    />
                    <ToggleRow
                      label="Assume Lease Renewal / Relocation at Exit"
                      desc="If true, terminal value is not set to 0 when exiting after land lease expires."
                      checked={!!assumptions.assumeLeaseRenewal}
                      onChange={(v) => onChange("assumeLeaseRenewal", v)}
                      isLocked={isLocked}
                    />
                  </div>`;

if (settings.includes(targetUI)) {
  settings = settings.replace(targetUI, replaceUI);
  fs.writeFileSync('src/views/PropCoSettingsView.tsx', settings);
  console.log("UI updated.");
}

// 3. Types
let types = fs.readFileSync('src/types.ts', 'utf8');
const targetType = `  exitMultiple?: number;
  sellingCosts?: number;`;
const replaceType = `  exitMultiple?: number;
  assumeLeaseRenewal?: boolean;
  sellingCosts?: number;`;
if (types.includes(targetType) && !types.includes('assumeLeaseRenewal?: boolean;')) {
  types = types.replace(targetType, replaceType);
  fs.writeFileSync('src/types.ts', types);
  console.log("Types updated.");
}

