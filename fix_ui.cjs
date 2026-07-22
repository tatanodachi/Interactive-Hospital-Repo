const fs = require('fs');
let content = fs.readFileSync('src/views/ConsolidatedDashboardView.tsx', 'utf8');

const targetStr = `                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#4C4A4B] select-none">IO Grace Period (Yrs)</span>
                    <input
                      type="number"
                      disabled={false}
                      className="w-16 bg-white border border-[#D8D8D8] rounded px-2 py-1 text-[10px] text-right text-[#1E2F31] font-bold focus:outline-none focus:border-[#1C6048]"
                      value={holdCoAssumptions?.ioGracePeriodYears || 0}
                      onChange={(e) => handleHoldCoChange("ioGracePeriodYears", parseFloat(e.target.value))}
                    />
                  </div>
                </div>`;

const replacementStr = `                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#4C4A4B] select-none">IO Grace Period (Yrs)</span>
                    <input
                      type="number"
                      disabled={false}
                      className="w-16 bg-white border border-[#D8D8D8] rounded px-2 py-1 text-[10px] text-right text-[#1E2F31] font-bold focus:outline-none focus:border-[#1C6048]"
                      value={holdCoAssumptions?.ioGracePeriodYears || 0}
                      onChange={(e) => handleHoldCoChange("ioGracePeriodYears", parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#D8D8D8]">
                    <span className="text-[10px] font-bold text-[#4C4A4B] select-none">Repayment Type</span>
                    <select
                      className="bg-white border border-[#D8D8D8] rounded px-2 py-1 text-[10px] font-bold focus:border-[#1C6048] outline-none text-[#1E2F31]"
                      value={holdCoAssumptions?.repaymentType || "standard"}
                      onChange={(e) => handleHoldCoChange("repaymentType", e.target.value)}
                    >
                      <option value="standard">Standard (Annuity)</option>
                      <option value="step_up">Step-Up / Tranche</option>
                    </select>
                  </div>
                  {(holdCoAssumptions?.repaymentType === "step_up" || !holdCoAssumptions?.repaymentType) && (
                    <div className="mt-2 space-y-2">
                      <div className="max-h-[160px] overflow-y-auto pr-1 space-y-2 border border-[#D8D8D8] rounded-lg p-2 bg-white">
                        {(() => {
                          const amortYears = Math.max(1, (holdCoAssumptions?.loanTenor || 15) - (holdCoAssumptions?.ioGracePeriodYears || 2));
                          const resolvedP = ensureArray(holdCoAssumptions?.stepUpPercentages);
                          let pList = [...resolvedP];
                          if (pList.length !== amortYears) {
                            pList = getInitialStepUpPercentages(amortYears, "tangerang_stepup");
                          }
                          return pList.map((val, idx) => {
                            const opYearNum = idx + 1 + (holdCoAssumptions?.ioGracePeriodYears || 2);
                            return (
                              <div key={idx} className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-[#1E2F31]">Year {opYearNum}</span>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={val}
                                      onChange={(e) => {
                                        const newval = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                                        const nextP = [...pList];
                                        nextP[idx] = parseFloat(newval.toFixed(2));
                                        handleHoldCoChange("stepUpPercentages", nextP);
                                      }}
                                      className="w-12 p-0.5 text-right text-[10px] border border-[#D8D8D8] rounded focus:border-[#1C6048] outline-none"
                                    />
                                    <span className="text-[9px] font-bold text-[#8A8175]">%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      {(() => {
                        const amortYears = Math.max(1, (holdCoAssumptions?.loanTenor || 15) - (holdCoAssumptions?.ioGracePeriodYears || 2));
                        const resolvedP = ensureArray(holdCoAssumptions?.stepUpPercentages);
                        let pList = [...resolvedP];
                        if (pList.length !== amortYears) pList = getInitialStepUpPercentages(amortYears, "tangerang_stepup");
                        const pSum = pList.reduce((sum, v) => sum + v, 0);
                        const isFullyAllocated = Math.abs(pSum - 100) < 0.05;
                        return (
                          <div className="flex items-center justify-between gap-2 text-[9px] font-bold">
                            <span className={isFullyAllocated ? "text-[#1C6048]" : "text-amber-600"}>Total: {pSum.toFixed(2)}%</span>
                            {!isFullyAllocated && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (pSum === 0) {
                                    handleHoldCoChange("stepUpPercentages", getInitialStepUpPercentages(amortYears, "equal"));
                                  } else {
                                    const factor = 100 / pSum;
                                    const norm = pList.map((v) => parseFloat((v * factor).toFixed(2)));
                                    const diff = 100 - norm.reduce((a, b) => a + b, 0);
                                    if (Math.abs(diff) > 0.001) norm[norm.length - 1] = parseFloat((norm[norm.length - 1] + diff).toFixed(2));
                                    handleHoldCoChange("stepUpPercentages", norm);
                                  }
                                }}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-0.5 rounded transition-colors"
                              >
                                Auto-Balance
                              </button>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/views/ConsolidatedDashboardView.tsx', content.replace(targetStr, replacementStr));
  console.log("Success");
} else {
  console.log("Target not found");
}
