import re

with open('src/views/PropCoSettingsView.tsx', 'r') as f:
    content = f.read()

start_marker = r'<div\s*className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-10 \${isPresenting \? "lg:grid-cols-4 2xl:grid-cols-5" : "lg:grid-cols-3"}`}\s*>'

end_marker = r'      </div>\n    \);\n  \},\n\);'

start_match = re.search(start_marker, content)
end_match = re.search(end_marker, content)

if not start_match or not end_match:
    print("Could not find start or end markers")
    exit(1)

pre_content = content[:start_match.start()]
post_content = content[end_match.start():]

main_content = content[start_match.end():end_match.start()]

sections = re.split(r'<div className="space-y-4">', main_content)

section_map = {}
for sec in sections:
    if not sec.strip():
        continue
    # Extract title
    title_match = re.search(r'title="([^"]+)"', sec)
    if title_match:
        title = title_match.group(1)
        # Remove the <SectionTitle ... /> component
        sec_content = re.sub(r'<SectionTitle[^>]+/>', '', sec, flags=re.DOTALL)
        # Remove the trailing </div> from the section
        sec_content = sec_content.rstrip()
        if sec_content.endswith('</div>'):
            sec_content = sec_content[:-6]
        
        section_map[title] = sec_content.strip()

print("Found sections:", section_map.keys())

# Now we construct the new grid

new_grid = """
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
          <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col space-y-4 md:col-span-1 lg:col-span-3">
            <div className="text-[11px] font-black text-[#1E2F31] uppercase tracking-wider border-b border-[#D8D8D8] pb-2.5 flex items-center gap-2">
              <Landmark size={16} className="text-[#9B8B70]" />
              <span>Financing & Exit Strategies</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            <div className="overflow-x-auto">
              ___MEDICAL_EQUIPMENT___
            </div>
          </div>
"""

new_grid = new_grid.replace('___ASSET_LINKING___', section_map.get('Asset Linking', ''))
new_grid = new_grid.replace('___LAND_AND_CONSTRUCTION___', section_map.get('Land & Construction', ''))
new_grid = new_grid.replace('___OTHER_CAPEX___', section_map.get('Other Capex & VAT', ''))
new_grid = new_grid.replace('___DEPRECIATION___', section_map.get('Depreciation (D&A)', ''))
new_grid = new_grid.replace('___OPERATING_EXPENSES___', section_map.get('Operating Expenses', ''))
new_grid = new_grid.replace('___FINANCING___', section_map.get('Financing Structure', ''))
new_grid = new_grid.replace('___TERMINAL_VALUE___', section_map.get('Terminal Value (Exit)', ''))
new_grid = new_grid.replace('___MEDICAL_EQUIPMENT___', section_map.get('Medical Equipment Breakdown', ''))

with open('src/views/PropCoSettingsView.tsx', 'w') as f:
    f.write(pre_content + new_grid + post_content)
print("Done rewriting.")
