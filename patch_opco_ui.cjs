const fs = require('fs');
let settings = fs.readFileSync('src/views/OpCoSettingsView.tsx', 'utf8');

const targetUI = `                    <ToggleRow
                      label="Assume Lease Renewal / Relocation at Exit"
                      desc="If true, terminal value is not set to 0 when exiting after land lease expires."
                      checked={!!assumptions.assumeLeaseRenewal}
                      onChange={(v) => onChange("assumeLeaseRenewal", v)}
                      isLocked={isLocked}
                    />`;

if (settings.includes(targetUI)) {
  settings = settings.replace(targetUI, '');
  fs.writeFileSync('src/views/OpCoSettingsView.tsx', settings);
  console.log("OpCo UI updated.");
} else {
  console.log("Could not find OpCo target UI.");
}
