const fs = require('fs');

const content = fs.readFileSync('src/views/PropCoSettingsView.tsx.bak', 'utf8');

const startMarker = /<div\s*className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-10 \${isPresenting \? "lg:grid-cols-4 2xl:grid-cols-5" : "lg:grid-cols-3"}`}\s*>/;
const endMarker = /      <\/div>\n    \);\n  \},\n\);/;

const startMatch = startMarker.exec(content);
const endMatch = endMarker.exec(content);

const preContent = content.substring(0, startMatch.index);
const postContent = content.substring(endMatch.index);
const mainContent = content.substring(startMatch.index + startMatch[0].length, endMatch.index);

const getSection = (title) => {
  const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`<SectionTitle[\\s\\S]*?title="${escapedTitle}"[\\s\\S]*?color="[^"]+"\\s*/>([\\s\\S]*?)(?=\\s*<div className="space-y-4|\\s*</div\\s*>\\s*$|$)`);
  const match = re.exec(mainContent);
  if (match) {
    let secContent = match[1].trim();
    if (secContent.endsWith('</div>')) {
      secContent = secContent.substring(0, secContent.length - 6).trim();
    }
    return secContent;
  }
  console.log("Could not find section:", title);
  return '';
}

const sectionMap = {
  'Asset Linking': getSection('Asset Linking'),
  'Land & Construction': getSection('Land & Construction'),
  'Other Capex & VAT': getSection('Other Capex & VAT'),
  'Financing Structure': getSection('Financing Structure'),
  'Depreciation (D&A)': getSection('Depreciation (D&A)'),
  'Operating Expenses': getSection('Operating Expenses'),
  'Terminal Value (Exit)': getSection('Terminal Value (Exit)'),
  'Medical Equipment Breakdown': getSection('Medical Equipment Breakdown')
};

let newGrid = `
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 grid-flow-dense">
          
          {/* CARD 1: ASSET CORE & LAND */}
          <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col space-y-4">
            <div className="text-[11px] font-black text-[#1E2F31] uppercase tracking-wider border-b border-[#D8D8D8] pb-2.5 flex items-center gap-2">
              <Map size={16} className="text-[#9B8B70]" />
              <span>Asset Core & Land</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="text-[9px] font-black uppercase text-[#9B8B70] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B8B70]"></span>
                  Asset Linking
                </div>
                <div className="space-y-1">
                  ___ASSET_LINKING___
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[9px] font-black uppercase text-[#9B8B70] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B8B70]"></span>
                  Land & Construction
                </div>
                <div className="space-y-1">
                  ___LAND_AND_CONSTRUCTION___
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: HARD CAPEX & DEVELOPMENT */}
          <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col space-y-4 md:col-span-2">
            <div className="text-[11px] font-black text-[#1E2F31] uppercase tracking-wider border-b border-[#D8D8D8] pb-2.5 flex items-center gap-2">
              <Building2 size={16} className="text-[#9B8B70]" />
              <span>Hard Capex & Development</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="text-[9px] font-black uppercase text-[#9B8B70] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B8B70]"></span>
                  Other Capex & VAT
                </div>
                <div className="space-y-1">
                  ___OTHER_CAPEX___
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-[9px] font-black uppercase text-[#9B8B70] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9B8B70]"></span>
                    Depreciation (D&A)
                  </div>
                  <div className="space-y-1">
                    ___DEPRECIATION___
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[9px] font-black uppercase text-[#9B8B70] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9B8B70]"></span>
                    Operating Expenses
                  </div>
                  <div className="space-y-1">
                    ___OPERATING_EXPENSES___
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* CARD 3: FINANCING & EXIT STRATEGIES */}
          <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col space-y-4 lg:col-span-3">
            <div className="text-[11px] font-black text-[#1E2F31] uppercase tracking-wider border-b border-[#D8D8D8] pb-2.5 flex items-center gap-2">
              <Landmark size={16} className="text-[#9B8B70]" />
              <span>Financing & Exit Strategies</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-2">
                <div className="text-[9px] font-black uppercase text-[#9B8B70] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B8B70]"></span>
                  Financing Structure
                </div>
                <div className="space-y-1">
                  ___FINANCING___
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[9px] font-black uppercase text-[#9B8B70] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B8B70]"></span>
                  Terminal Value (Exit)
                </div>
                <div className="space-y-1">
                  ___TERMINAL_VALUE___
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: MEDICAL EQUIPMENT BREAKDOWN */}
          <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col space-y-4 md:col-span-2 lg:col-span-3">
            <div className="text-[11px] font-black text-[#1E2F31] uppercase tracking-wider border-b border-[#D8D8D8] pb-2.5 flex items-center gap-2">
              <Activity size={16} className="text-[#9B8B70]" />
              <span>Medical Equipment Breakdown</span>
            </div>
            <div className="overflow-x-auto w-full">
              ___MEDICAL_EQUIPMENT___
            </div>
          </div>
        </div>
`;

newGrid = newGrid.replace('___ASSET_LINKING___', sectionMap['Asset Linking'] || '');
newGrid = newGrid.replace('___LAND_AND_CONSTRUCTION___', sectionMap['Land & Construction'] || '');
newGrid = newGrid.replace('___OTHER_CAPEX___', sectionMap['Other Capex & VAT'] || '');
newGrid = newGrid.replace('___DEPRECIATION___', sectionMap['Depreciation (D&A)'] || '');
newGrid = newGrid.replace('___OPERATING_EXPENSES___', sectionMap['Operating Expenses'] || '');
newGrid = newGrid.replace('___FINANCING___', sectionMap['Financing Structure'] || '');
newGrid = newGrid.replace('___TERMINAL_VALUE___', sectionMap['Terminal Value (Exit)'] || '');
newGrid = newGrid.replace('___MEDICAL_EQUIPMENT___', sectionMap['Medical Equipment Breakdown'] || '');

fs.writeFileSync('src/views/PropCoSettingsView.tsx', preContent + newGrid + postContent);
console.log("Done rewriting.");
