const fs = require('fs');

let settings = fs.readFileSync('src/views/PropCoSettingsView.tsx', 'utf8');

const targetUI = `                <AssumptionRow
                  label="Selling Costs"
                  val={assumptions.sellingCosts}
                  set={(v) => onChange("sellingCosts", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </>`;
                  
const replaceUI = `                <AssumptionRow
                  label="Selling Costs"
                  val={assumptions.sellingCosts}
                  set={(v) => onChange("sellingCosts", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <ToggleRow
                  label="Assume Lease Renewal / Relocation at Exit"
                  desc="If true, terminal value is not set to 0 when exiting after land lease expires."
                  checked={!!assumptions.assumeLeaseRenewal}
                  onChange={(v) => onChange("assumeLeaseRenewal", v)}
                  isLocked={isLocked}
                />
              </>`;

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
} else if (types.includes('exitMethod?: string;')) {
  // alternative
  types = types.replace('exitMethod?: string;', 'exitMethod?: string;\n  assumeLeaseRenewal?: boolean;');
  fs.writeFileSync('src/types.ts', types);
  console.log("Types updated alternative.");
}

