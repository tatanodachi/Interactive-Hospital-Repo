const fs = require('fs');
let settings = fs.readFileSync('src/views/PropCoSettingsView.tsx', 'utf8');

const targetUI = `                  <AssumptionRow
                    label="Lease Term"
                    val={assumptions.landLeaseTermYears || 10}
                    set={(v) => onChange("landLeaseTermYears", v)}
                    unit="Yrs"
                    isLocked={isLocked}
                  />
                </>`;

const replaceUI = `                  <AssumptionRow
                    label="Lease Term"
                    val={assumptions.landLeaseTermYears || 10}
                    set={(v) => onChange("landLeaseTermYears", v)}
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

if (settings.includes(targetUI)) {
  settings = settings.replace(targetUI, replaceUI);
  fs.writeFileSync('src/views/PropCoSettingsView.tsx', settings);
  console.log("PropCo UI updated successfully.");
} else {
  console.log("Not found target UI again.");
}
