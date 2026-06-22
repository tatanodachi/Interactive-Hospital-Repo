import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const theGoodOne = `              {col.colType === "year" ? (
                <div className="flex items-center justify-end gap-1.5 text-[#1C6048]">
                  <span className="text-[14px] font-black">{expandedYears[col.defaultLabel] ? "-" : "+"}</span>
                  <div className="flex flex-col items-center">
                    <span className="border-b-[1.5px] border-dashed border-transparent group-hover:border-current pb-[2px]">{String(col.defaultLabel)}</span>
                    {String(col.defaultLabel).startsWith("Year ") && !isNaN(Number(String(col.defaultLabel).replace("Year ", ""))) && (
                      <span className="text-[10px] font-mono font-normal tracking-tight border-b-[1.5px] border-dashed border-transparent group-hover:border-current pb-[2px]">
                        ({2025 + Number(String(col.defaultLabel).replace("Year ", ""))})
                      </span>
                    )}
                  </div>
                </div>
              ) : (`;

const target1 = `              {col.colType === "year" ? (
                <div className="flex items-center justify-end gap-1">
                  {expandedYears[col.defaultLabel] ? "-" : "+"}
                  <div className="flex flex-col items-end leading-[1.1]">
                    <span className="border-b-[1.5px] border-dashed border-current pb-0.5">{String(col.defaultLabel)}</span>
                    {String(col.defaultLabel).startsWith("Year ") && !isNaN(Number(String(col.defaultLabel).replace("Year ", ""))) && (
                      <span className="text-[9px] opacity-75 font-mono font-medium tracking-tight mt-0.5">
                        {2025 + Number(String(col.defaultLabel).replace("Year ", ""))}
                      </span>
                    )}
                  </div>
                </div>
              ) : (`

content = content.replace(target1, theGoodOne);

fs.writeFileSync('src/App.tsx', content);
