const fs = require('fs');
let settings = fs.readFileSync('src/views/PropCoSettingsView.tsx', 'utf8');

const targetUI = `                  <AssumptionRow
                    label="Lease Increment Period"
                    val={assumptions.landLeaseIncrementYears || 5}
                    set={(v) => onChange("landLeaseIncrementYears", v)}
                    unit="Yrs"
                    isLocked={isLocked}
                    tooltip="How often the ground lease rate escalates (e.g., every 5 years)."
                  />
                </>`;
                
const replaceUI = `                  <AssumptionRow
                    label="Lease Increment Period"
                    val={assumptions.landLeaseIncrementYears || 5}
                    set={(v) => onChange("landLeaseIncrementYears", v)}
                    unit="Yrs"
                    isLocked={isLocked}
                    tooltip="How often the ground lease rate escalates (e.g., every 5 years)."
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
} else {
  // Try alternative format if tooltip is different or missing
  const targetUI2 = `                  <AssumptionRow
                    label="Lease Increment Period"
                    val={assumptions.landLeaseIncrementYears || 5}
                    set={(v) => onChange("landLeaseIncrementYears", v)}
                    unit="Yrs"
                    isLocked={isLocked}
                  />
                </>`;
  const replaceUI2 = `                  <AssumptionRow
                    label="Lease Increment Period"
                    val={assumptions.landLeaseIncrementYears || 5}
                    set={(v) => onChange("landLeaseIncrementYears", v)}
                    unit="Yrs"
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
  if (settings.includes(targetUI2)) {
    settings = settings.replace(targetUI2, replaceUI2);
  } else {
      console.log("Not found target UI in PropCoSettingsView.tsx");
  }
}

// Remove it from the exit section if it's there
const targetRemove = `                <ToggleRow
                  label="Assume Lease Renewal / Relocation at Exit"
                  desc="If true, terminal value is not set to 0 when exiting after land lease expires."
                  checked={!!assumptions.assumeLeaseRenewal}
                  onChange={(v) => onChange("assumeLeaseRenewal", v)}
                  isLocked={isLocked}
                />`;

const exitSection = `                <AssumptionRow
                  label="Selling Costs"
                  val={assumptions.sellingCosts}
                  set={(v) => onChange("sellingCosts", v)}
                  unit="%"
                  isLocked={isLocked}
                />
` + targetRemove + `
              </>`;

const exitSectionReplace = `                <AssumptionRow
                  label="Selling Costs"
                  val={assumptions.sellingCosts}
                  set={(v) => onChange("sellingCosts", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </>`;

if (settings.includes(exitSection)) {
    settings = settings.replace(exitSection, exitSectionReplace);
}

fs.writeFileSync('src/views/PropCoSettingsView.tsx', settings);
console.log("PropCo UI updated.");
