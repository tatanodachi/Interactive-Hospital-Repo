import React, { memo, useState, useEffect, useRef } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Percent, 
  TrendingUp, 
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  DollarSign,
  Building2,
  Users,
  Info,
  Flag
} from "lucide-react";
import { LifetimePnLTable } from "./components/LifetimePnLTable";

interface ExecutiveSummaryViewProps {
  isPresenting: boolean;
  opCoData?: any;
  propCoData?: any;
  consolidatedData?: any;
}

export const ExecutiveSummaryView = memo(({ 
  isPresenting,
  opCoData,
  propCoData,
  consolidatedData 
}: ExecutiveSummaryViewProps) => {
  const [activeNarrativeStep, setActiveNarrativeStep] = useState<number>(0);
  const [showPropCoBreakdown, setShowPropCoBreakdown] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [caretStyle, setCaretStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!showPropCoBreakdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPropCoBreakdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPropCoBreakdown]);

  useEffect(() => {
    const updatePosition = () => {
      if (showPropCoBreakdown && containerRef.current && buttonRef.current) {
        const cardRect = containerRef.current.getBoundingClientRect();
        const buttonRect = buttonRef.current.getBoundingClientRect();
        
        // Horizontal center of the ⓘ button relative to the card's left boundary
        const buttonCenterRelative = (buttonRect.left + buttonRect.width / 2) - cardRect.left;
        
        // Exact vertical bottom of the button relative to the card's top edge
        const buttonBottomRelative = buttonRect.bottom - cardRect.top;
        
        // Define safety margins
        const padding = 12;
        
        // Dynamically compute size to never exceed card boundary on tiny devices
        const tooltipWidth = Math.min(310, cardRect.width - padding * 2);
        
        // Ideal left offset to center the tooltip horizontally relative to the ⓘ button
        const idealLeft = buttonCenterRelative - tooltipWidth / 2;
        
        // Clamp tooltip left boundary strictly inside the parent card
        const minLeft = padding;
        const maxLeft = cardRect.width - tooltipWidth - padding;
        const finalLeft = Math.max(minLeft, Math.min(idealLeft, maxLeft));
        
        // Calculate the pointing caret's horizontal offset in the tooltip coord space
        let caretRelative = buttonCenterRelative - finalLeft;
        
        // Keep the caret from sliding into the rounded corners of the tooltip frame
        caretRelative = Math.max(16, Math.min(caretRelative, tooltipWidth - 16));
        
        setTooltipStyle({
          position: "absolute",
          left: `${finalLeft}px`,
          width: `${tooltipWidth}px`,
          top: `${buttonBottomRelative + 8}px`,
        });
        
        setCaretStyle({
          left: `${caretRelative}px`,
        });
      }
    };

    if (showPropCoBreakdown) {
      updatePosition();
      // Polling handles delayed layout rendering perfectly
      const timer = setTimeout(updatePosition, 50);
      window.addEventListener("resize", updatePosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [showPropCoBreakdown]);

  // Derive dynamic real-time values from the active interactive model calculations:
  const rawIrr = consolidatedData?.metrics?.irr;
  const currentBlendedIrr = rawIrr !== undefined ? `${(rawIrr * 100).toFixed(2)}%` : "18.58%";

  const rawPropCoCapex = propCoData?.metrics?.totalCapex;
  const currentPropCoCapexText = rawPropCoCapex !== undefined ? `IDR ${rawPropCoCapex.toFixed(1)} Billion` : "IDR 406.6 Billion";

  const rawOpCoEquity = opCoData?.totalEquity;
  const currentOpCoEquityText = rawOpCoEquity !== undefined ? `IDR ${rawOpCoEquity.toFixed(2)} Billion` : "IDR 82.17 Billion";

  const rawPayback = consolidatedData?.metrics?.payback;
  const currentPaybackText = rawPayback !== undefined ? `${rawPayback.toFixed(2)} Years` : "5.86 Years";

  const rawBeds = opCoData?.opsMetrics?.beds || 120; // default for preview if undefined
  const currentBedsText = opCoData?.opsMetrics?.beds !== undefined ? `${opCoData.opsMetrics.beds}-bed Capacity` : "120-bed Capacity";

  const stabilizedRevPab = opCoData?.opsMetrics?.revPab;
  const startingRevPab = opCoData?.opsMetrics?.startingRevPab;

  // Efficiency Benchmark Metrics
  const buildArea = propCoData?.assumptions?.buildArea || 13000;
  const buildCost = propCoData?.capexDetails?.buildCost || 120;
  const ffeCost = propCoData?.capexDetails?.ffeCost || 0;
  const medEqCost = propCoData?.capexDetails?.medEqCost || 105;

  const totalCostBasisBillion = buildCost + ffeCost + medEqCost;
  const costPerBedM = rawBeds ? (totalCostBasisBillion * 1000) / rawBeds : 0;
  const costPerSqmM = buildArea ? (totalCostBasisBillion * 1000) / buildArea : 0;

  const narrativeSteps = [
    {
      title: "1. Financial Information",
      subtitle: "Project IRR and Financial Benchmark",
      icon: <TrendingUp className="text-[#1C6048]" size={18} />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#4C4A4B] leading-relaxed">
            Robust clinical operations and defensive underwriting yield attractive base-case returns and durable risk covenants:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-white rounded-lg border border-[#D8D8D8]/60">
              <span className="text-[9px] uppercase font-black text-[#1C6048] block mb-1">Projected Base IRR</span>
              <p className="text-sm font-bold text-[#1E2F31] font-display">{currentBlendedIrr}</p>
              <p className="text-[10px] text-[#4C4A4B] mt-0.5">Blended portfolio equity yield post occupancy stabilization.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#D8D8D8]/60">
              <span className="text-[9px] uppercase font-black text-[#9B8B70] block mb-1">Payback Period</span>
              <p className="text-sm font-bold text-[#1E2F31] font-display">{currentPaybackText}</p>
              <p className="text-[10px] text-[#4C4A4B] mt-0.5">Estimated time to recover the initial project investment capital.</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#D8D8D8]/60">
              <span className="text-[9px] uppercase font-black text-[#1E2F31] block mb-1">Exit Multiple</span>
              <p className="text-sm font-bold text-[#1E2F31] font-display">15x EBITDA</p>
              <p className="text-[10px] text-[#4C4A4B] mt-0.5">Target sector multiple applied for terminal asset valuation.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "2. Market Information",
      subtitle: "Systemic Frictions & Healthcare Deficits",
      icon: <Users className="text-[#1C6048]" size={18} />,
      content: (
        <div className="space-y-4">
          <p className="text-xs text-[#4C4A4B] leading-relaxed">
            Targeting a severe supply-demand mismatch characterized by chronic bed shortages and qualitative capacity failures.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-white rounded-xl border border-[#D8D8D8]/60 flex flex-col justify-between">
              <span className="text-[9px] font-black uppercase text-[#1C6048] tracking-widest mb-1.5 block">Bed Deficit</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-[#1E2F31]">1.4</span>
                <span className="text-xs font-black text-[#1E2F31] opacity-50">&lt;</span>
                <span className="text-xl font-black text-[#1C6048]">4.5</span>
              </div>
              <span className="text-[9px] text-[#8A8175] font-semibold mt-1">Local vs. Global Avg (per 1,000 people)</span>
            </div>
            
            <div className="p-3 bg-white rounded-xl border border-[#D8D8D8]/60 flex flex-col justify-between">
              <span className="text-[9px] font-black uppercase text-[#9B8B70] tracking-widest mb-1.5 block">Physician Ratio</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-[#1E2F31]">1</span>
                <span className="text-lg font-black text-[#1E2F31] opacity-50">:</span>
                <span className="text-xl font-black text-[#1E2F31]">2000</span>
              </div>
              <span className="text-[9px] text-[#8A8175] font-semibold mt-1">WHO standard is 1:1000</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#D8D8D8]/60 flex flex-col justify-between">
              <span className="text-[9px] font-black uppercase text-[#2A4750] tracking-widest mb-1.5 block">Quality Mismatch</span>
              <div className="flex flex-col mt-0.5">
                <span className="text-sm font-black text-[#1E2F31] leading-tight">High Cost</span>
                <span className="text-sm font-bold text-[#8A8175] leading-tight">Non-Tier A Exp.</span>
              </div>
              <span className="text-[9px] text-[#8A8175] font-semibold mt-2">Structural value gap</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#D8D8D8]/60 flex flex-col justify-between">
              <span className="text-[9px] font-black uppercase text-[#1E2F31] tracking-widest mb-1.5 block">Admin Bottleneck</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-[#1E2F31]">&gt;2</span>
                <span className="text-sm font-black text-[#1E2F31]">Hours</span>
              </div>
              <span className="text-[9px] text-[#8A8175] font-semibold mt-1">Average wait per patient visit</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Project & Collaboration",
      subtitle: "Leasehold Synergy & EBITDA-Linked Rental Allocations",
      icon: <Compass className="text-[#1C6048]" size={18} />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
             <div className="p-2.5 bg-[#1C6048] rounded-lg border border-[#1C6048]">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={10} className="text-[#C4DFD2]" />
                  <span className="text-[9px] uppercase font-black text-white tracking-wider">West Jakarta</span>
                </div>
                <p className="text-[10px] text-[#C4DFD2] font-semibold">Daan Mogot</p>
             </div>
             <div className="p-2.5 bg-[#F9F8F6] rounded-lg border border-[#D8D8D8]">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={10} className="text-[#8A8175]" />
                  <span className="text-[9px] uppercase font-black text-[#4C4A4B] tracking-wider">South Jakarta</span>
                </div>
                <p className="text-[10px] text-[#8A8175]">TB Simatupang / Pejaten</p>
             </div>
             <div className="p-2.5 bg-[#F9F8F6] rounded-lg border border-[#D8D8D8]">
                <div className="flex items-center gap-1.5 mb-1">
                  <MapPin size={10} className="text-[#8A8175]" />
                  <span className="text-[9px] uppercase font-black text-[#4C4A4B] tracking-wider">S. Tangerang</span>
                </div>
                <p className="text-[10px] text-[#8A8175]">BSD / Serpong</p>
             </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#D8D8D8] space-y-4">
            <p className="text-xs font-semibold text-[#4C4A4B] leading-relaxed font-sans border-b border-[#D8D8D8]/50 pb-3">
              The dual-entity asset lease provides direct yield flow back to real estate investors while protecting the clinical operational balance sheet:
            </p>
            <div className="grid grid-cols-12 gap-1 items-center px-1">
              <div className="col-span-3 flex flex-col gap-1.5">
                <div className="bg-[#F9F8F6] p-1.5 rounded-lg border border-[#D8D8D8] text-center shadow-sm">
                  <span className="text-[9px] font-black uppercase text-[#4C4A4B] tracking-wider block">Partner (51%)</span>
                </div>
                <div className="bg-[#F9F8F6] p-1.5 rounded-lg border border-[#D8D8D8] text-center shadow-sm">
                  <span className="text-[9px] font-black uppercase text-[#2A4750] tracking-wider block">VG (49%)</span>
                </div>
              </div>

              <div className="col-span-1 flex flex-col justify-around h-14 items-center">
                <ArrowRight size={14} className="text-[#4C4A4B] opacity-40" />
                <ArrowRight size={14} className="text-[#2A4750] opacity-40" />
              </div>

              <div className="col-span-3 bg-[#1C6048] text-white p-2.5 ml-1 rounded-lg text-center shadow-sm">
                <div className="text-sm font-bold leading-tight">OpCo</div>
                <div className="text-[8px] opacity-90 uppercase tracking-widest font-black mt-1">Hospital Operator</div>
              </div>

              <div className="col-span-2 flex justify-center">
                <div className="w-full flex flex-col items-center px-0.5">
                  <span className="text-[8px] text-[#9B8B70] font-black uppercase tracking-wider text-center whitespace-nowrap mb-1">EBITDA Sharing</span>
                  <ArrowRight size={14} className="text-[#9B8B70]" />
                </div>
              </div>

              <div className="col-span-3 bg-[#1E2F31] text-white p-2.5 rounded-lg text-center shadow-sm">
                <div className="text-sm font-bold leading-tight">PropCo</div>
                <div className="text-[8px] opacity-90 uppercase tracking-widest font-black mt-1">Real Estate Asset</div>
              </div>
            </div>
            <div className="text-[10px] text-[#4C4A4B] leading-snug italic text-center opacity-90 pt-1">
              💡 PropCo collects stable yields on physical premises, while OpCo focuses purely on scaling primary patient care metrics.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Budget Information",
      subtitle: "Direct PropCo Development Budgets & Clinical OpCo Startup Capital",
      icon: <Building2 className="text-[#1C6048]" size={18} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#4C4A4B] leading-relaxed">
            Capital requirements are segregated to match institutional developer criteria (PropCo Property assets) and clinical operator models (OpCo Startup capital):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* PropCo Column */}
            <div className="p-4 bg-white rounded-xl border border-[#D8D8D8] flex flex-col justify-between h-full">
              <div className="flex-1">
                <span className="text-[9px] uppercase font-black text-[#1E2F31] block mb-0.5">PropCo Development CapEx</span>
                <p className="text-lg font-bold text-[#1E2F31] font-display mb-3">{currentPropCoCapexText}</p>
                
                {/* PropCo Breakdown List */}
                <div className="border-t border-[#EFEBE7] pt-2 space-y-0.5 text-[10.5px] text-[#4C4A4B]">
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] p-1 rounded font-bold text-[#1E2F31]">
                    <span>Land Cost</span>
                    <span className="text-right">{propCoData?.capexDetails?.landCost !== undefined ? propCoData.capexDetails.landCost.toFixed(1) : "50.0"}</span>
                  </div>

                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] p-1 rounded font-bold text-[#1E2F31] border-t border-[#EFEBE7]/50 pt-1 mt-1">
                    <span>Total Hard Costs</span>
                    <span className="text-right">{propCoData?.capexDetails?.totalHardCosts !== undefined ? propCoData.capexDetails.totalHardCosts.toFixed(1) : "265.0"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] py-0.5 px-2 rounded text-[#6E6C6D]">
                    <span>• Construction</span>
                    <span className="text-right">{propCoData?.capexDetails?.buildCost !== undefined ? propCoData.capexDetails.buildCost.toFixed(1) : "120.0"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] py-0.5 px-2 rounded text-[#6E6C6D]">
                    <span>• Medical Equip.</span>
                    <span className="text-right">{propCoData?.capexDetails?.medEqCost !== undefined ? propCoData.capexDetails.medEqCost.toFixed(1) : "105.0"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] py-0.5 px-2 rounded text-[#6E6C6D]">
                    <span>• Infrastructure</span>
                    <span className="text-right">{propCoData?.capexDetails?.infraCost !== undefined ? propCoData.capexDetails.infraCost.toFixed(1) : "25.0"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] py-0.5 px-2 rounded text-[#6E6C6D]">
                    <span>• FF&E</span>
                    <span className="text-right">{propCoData?.capexDetails?.ffeCost !== undefined ? propCoData.capexDetails.ffeCost.toFixed(1) : "10.0"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] py-0.5 px-2 rounded text-[#6E6C6D]">
                    <span>• Sharing Dev.</span>
                    <span className="text-right">{propCoData?.capexDetails?.sharingDevCost !== undefined ? propCoData.capexDetails.sharingDevCost.toFixed(1) : "5.0"}</span>
                  </div>

                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] p-1 rounded font-bold text-[#1E2F31] border-t border-[#EFEBE7]/50 pt-1 mt-1">
                    <span>Total Soft Costs</span>
                    <span className="text-right">{propCoData?.capexDetails?.totalSoftCosts !== undefined ? propCoData.capexDetails.totalSoftCosts.toFixed(1) : "80.0"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] py-0.5 px-2 rounded text-[#6E6C6D]">
                    <span>• Consultant</span>
                    <span className="text-right">{propCoData?.capexDetails?.consultantCost !== undefined ? propCoData.capexDetails.consultantCost.toFixed(1) : "15.0"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] py-0.5 px-2 rounded text-[#6E6C6D]">
                    <span>• License</span>
                    <span className="text-right">{propCoData?.capexDetails?.licenseCost !== undefined ? propCoData.capexDetails.licenseCost.toFixed(1) : "5.0"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] py-0.5 px-2 rounded text-[#6E6C6D]">
                    <span>• VAT</span>
                    <span className="text-right">{propCoData?.capexDetails?.vatCost !== undefined ? propCoData.capexDetails.vatCost.toFixed(1) : "30.0"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] py-0.5 px-2 rounded text-[#6E6C6D]">
                    <span>• Contingency</span>
                    <span className="text-right">{propCoData?.capexDetails?.contingencyCost !== undefined ? propCoData.capexDetails.contingencyCost.toFixed(1) : "15.0"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] py-0.5 px-2 rounded text-[#6E6C6D]">
                    <span>• Dev. G&A</span>
                    <span className="text-right">{propCoData?.capexDetails?.devGaCost !== undefined ? propCoData.capexDetails.devGaCost.toFixed(1) : "10.0"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] py-0.5 px-2 rounded text-[#6E6C6D]">
                    <span>• Dev. CAR</span>
                    <span className="text-right">{propCoData?.capexDetails?.devCarCost !== undefined ? propCoData.capexDetails.devCarCost.toFixed(1) : "5.0"}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between font-display hover:bg-[#1E2F31]/5 p-1 rounded border-t border-[#1E2F31]/20 pt-1.5 mt-3 text-[#1E2F31] font-black uppercase text-[10px]">
                <span>TOTAL PROPCO INVESTMENT (IDR B)</span>
                <span className="text-right">{propCoData?.metrics?.totalCapex !== undefined ? propCoData.metrics.totalCapex.toFixed(1) : "395.0"}</span>
              </div>
            </div>

            {/* Right Column: OpCo & Efficiency Bento */}
            <div className="flex flex-col gap-3 h-full">
              {/* OpCo Column (Optimized) */}
              <div className="p-3.5 bg-white rounded-xl border border-[#D8D8D8] flex flex-col justify-between flex-1">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="text-[9px] uppercase font-black text-[#1C6048] block mb-0.5">OpCo Startup Capital</span>
                      <p className="text-lg font-bold text-[#1C6048] font-display">{currentOpCoEquityText}</p>
                    </div>
                  </div>
                  
                  {/* OpCo Breakdown List (Compact) */}
                  <div className="border-t border-[#EFEBE7] pt-2 mt-1 space-y-1 text-[10px] text-[#4C4A4B]">
                    <div className="flex justify-between font-display hover:bg-[#F9F8F6] p-0.5 px-1 rounded">
                      <span className="font-semibold text-[#1E2F31]">1. JVA Setup</span>
                      <span className="font-bold text-[#1C6048] text-right">{opCoData?.setupDetails?.jvaOpex !== undefined ? opCoData.setupDetails.jvaOpex.toFixed(2) : "2.50"}</span>
                    </div>
                    <div className="flex justify-between font-display hover:bg-[#F9F8F6] p-0.5 px-1 rounded">
                      <span className="font-semibold text-[#1E2F31]">2. Pre-operating</span>
                      <span className="font-bold text-[#1C6048] text-right">{opCoData?.setupDetails?.commOpex !== undefined ? opCoData.setupDetails.commOpex.toFixed(2) : "15.00"}</span>
                    </div>
                    <div className="flex justify-between font-display hover:bg-[#F9F8F6] p-0.5 px-1 rounded">
                      <span className="font-semibold text-[#1E2F31]">3. Working Capital</span>
                      <span className="font-bold text-[#1C6048] text-right">{opCoData?.setupDetails?.workingCapitalOpex !== undefined ? opCoData.setupDetails.workingCapitalOpex.toFixed(2) : "64.67"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between font-display hover:bg-[#1C6048]/5 p-1 rounded border-t border-[#1C6048]/20 pt-1.5 mt-2 text-[#1C6048] font-black uppercase text-[10px]">
                  <span>TOTAL OPCO (IDR B)</span>
                  <span className="text-right">{rawOpCoEquity !== undefined ? rawOpCoEquity.toFixed(2) : "82.17"}</span>
                </div>
              </div>

              {/* Efficiency Bento */}
              <div className="bg-[#1E2F31] p-3.5 rounded-xl border border-[#D8D8D8] text-[#EFEBE7]">
                 <span className="text-[9px] uppercase font-black text-[#C4DFD2] tracking-wider block mb-2">Efficiency Benchmark</span>
                 <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="border-r border-white/10">
                       <span className="block text-white/60 mb-0.5">Building GFA</span>
                       <span className="font-display font-bold text-white text-sm">{buildArea.toLocaleString()} sqm</span>
                    </div>
                    <div className="pl-1">
                       <span className="block text-white/60 mb-0.5">Cost / Bed</span>
                       <span className="font-display font-bold text-white text-sm">IDR {costPerBedM.toLocaleString('id-ID', {maximumFractionDigits:0})}M</span>
                    </div>
                    <div className="col-span-2 border-t border-white/10 pt-2 mt-1 flex justify-between items-center">
                       <span className="text-white/60">Const., FF&E, MedEq / sqm</span>
                       <span className="font-display font-bold text-[#C4DFD2] text-xs">IDR {costPerSqmM.toLocaleString('id-ID', {maximumFractionDigits:1})}M</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 relative">

      <div className="w-full space-y-6">
        
        {/* 2-Column Split Hybrid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Option 2 Structured Story / Stepper Narrative (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Investment Thesis Card */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#D8D8D8] space-y-6">
              <div className="border-b border-[#EFEBE7] pb-4">
                <h3 className="text-lg font-bold text-[#1E2F31]">Investment Thesis & Execution</h3>
              </div>

            {/* Stepper Steps / Tab Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {narrativeSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveNarrativeStep(idx)}
                  className={`text-left px-3 py-2.5 rounded-xl border transition-all relative flex items-center justify-between gap-2 ${
                    activeNarrativeStep === idx
                      ? "bg-[#1C6048]/5 border-[#1C6048]/50 shadow-sm text-[#1C6048] ring-1 ring-[#1C6048]/20"
                      : "bg-[#F9F8F6] border-[#D8D8D8] opacity-70 hover:opacity-100 hover:bg-white text-[#4C4A4B]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`font-bold font-display ${activeNarrativeStep === idx ? 'text-[#1C6048]' : 'text-[#8A8175]'}`}>0{idx + 1}</span>
                    <span className="font-bold text-[11px] truncate">
                      {["Financial", "Market", "Project & Collaboration", "Budget"][idx]}
                    </span>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeNarrativeStep === idx ? "bg-[#1C6048]" : "bg-transparent"}`}></span>
                </button>
              ))}
            </div>

            {/* Narrative Content Renderer */}
            <div className="p-6 bg-[#F9F8F6] rounded-2xl border border-[#D8D8D8]/60 min-h-[220px] flex flex-col justify-between animate-in fade-in duration-300">
               <div>
                 <div className="flex items-center gap-2.5 mb-1">
                   {narrativeSteps[activeNarrativeStep].icon}
                   <h4 className="font-bold text-base text-[#1E2F31]">
                     {narrativeSteps[activeNarrativeStep].title}
                   </h4>
                 </div>
                 <p className="text-xs text-[#9B8B70] font-black uppercase tracking-wider mb-3 pl-7">
                   {narrativeSteps[activeNarrativeStep].subtitle}
                 </p>
                 <div className="pl-7">
                   {narrativeSteps[activeNarrativeStep].content}
                 </div>
               </div>

               {/* Navigation Controls inside narrative */}
               <div className="flex justify-between items-center pt-4 border-t border-[#EFEBE7] mt-6">
                  <button
                    disabled={activeNarrativeStep === 0}
                    onClick={() => setActiveNarrativeStep(prev => prev - 1)}
                    className="text-xs font-bold text-[#1E2F31] border border-[#D8D8D8] bg-white rounded-lg px-3 py-1.5 hover:bg-[#F9F8F6] disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    Previous Step
                  </button>
                  <button
                    disabled={activeNarrativeStep === narrativeSteps.length - 1}
                    onClick={() => setActiveNarrativeStep(prev => prev + 1)}
                    className="text-xs font-bold text-white bg-[#1C6048] hover:bg-[#154634] rounded-lg px-3.5 py-1.5 flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
                  >
                    Next Step <ArrowRight size={14} />
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Unified Project Fundamentals Dashboard (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Unified Project Fundamentals Ledger Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden p-5 space-y-6">
            
            {/* SECTION I: Key Milestones & Capacity */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#D8D8D8] pb-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#1C6048]">I. Project Milestones & Scale</span>
                <span className="text-[9px] font-sans font-bold text-[#8A8175]">Year 1 = 2026</span>
              </div>
              
              <div className="divide-y divide-[#D8D8D8]/40 border-b border-[#D8D8D8]/40">
                {/* Row 1 */}
                <div className="py-2 flex justify-between items-center hover:bg-[#F9F8F6] px-1 transition-colors">
                  <span className="text-[11px] font-medium text-[#4C4A4B]">Hospital Development Phase</span>
                  <span className="text-xs font-bold font-sans text-[#1E2F31]">
                    {propCoData?.assumptions?.devDurationMonths ? (propCoData.assumptions.devDurationMonths / 12).toFixed(1) : "2.0"} Years
                  </span>
                </div>
                {/* Row 2 */}
                <div className="py-2 flex justify-between items-center hover:bg-[#F9F8F6] px-1 transition-colors">
                  <span className="text-[11px] font-medium text-[#4C4A4B]">Commercial Operations Start</span>
                  <span className="text-xs font-bold font-sans text-[#1C6048]">
                    {propCoData?.assumptions?.devDurationMonths ? `Year ${(Math.ceil(propCoData.assumptions.devDurationMonths / 12) + 1)} (${2025 + Math.ceil(propCoData.assumptions.devDurationMonths / 12) + 1})` : "Year 3 (2028)"}
                  </span>
                </div>
                {/* Row 3 */}
                <div className="py-2 flex justify-between items-center hover:bg-[#F9F8F6] px-1 transition-colors">
                  <span className="text-[11px] font-medium text-[#4C4A4B]">Bed Scale</span>
                  <span className="text-xs font-bold font-sans text-[#1E2F31]">{currentBedsText}</span>
                </div>
                {/* Row 4 */}
                <div className="py-2 flex justify-between items-center hover:bg-[#F9F8F6] px-1 transition-colors">
                  <span className="text-[11px] font-medium text-[#4C4A4B]">Gross Floor Area (GFA)</span>
                  <span className="text-xs font-bold font-sans text-[#1E2F31]">{buildArea.toLocaleString()} sqm</span>
                </div>
              </div>

              {/* Minimal BOR Target Ramp Spark-Section */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-[#4C4A4B]">Occupancy (BOR) Target Ramp</span>
                  <span className="text-[10px] font-bold font-sans text-[#1C6048]">
                    {opCoData?.assumptions?.borStart ? `${opCoData.assumptions.borStart}%` : "45%"} → {opCoData?.assumptions?.borMax ? `${opCoData.assumptions.borMax}%` : "65%"} (+{opCoData?.assumptions?.borIncrement ? `${opCoData.assumptions.borIncrement}%` : "5%"}/Yr)
                  </span>
                </div>
                <div className="h-[74px] w-full relative bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]/50 p-1.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: "Y1", val: 45 },
                      { name: "Y2", val: 50 },
                      { name: "Y3", val: 55 },
                      { name: "Y4", val: 60 },
                      { name: "Y5+", val: 65 },
                    ]} margin={{ top: 5, right: 8, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEBE7" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#8A8175', fontWeight: 600 }} dy={3} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#8A8175' }} domain={[40, 70]} tickFormatter={(val) => val+"%"} />
                      <Tooltip 
                        contentStyle={{ fontSize: '9px', borderRadius: '4px', border: '1px solid #D8D8D8', padding: '3px 6px', backgroundColor: '#1E2F31', color: '#fff' }} 
                        cursor={{ stroke: '#EFEBE7', strokeWidth: 1 }}
                        formatter={(val: number) => [`${val}%`, 'BOR']} 
                        labelStyle={{ color: '#9B8B70', fontWeight: 600, fontSize: '8px' }}
                      />
                      <Line type="monotone" dataKey="val" stroke="#1C6048" strokeWidth={2} dot={{ r: 2, strokeWidth: 1.5, fill: '#fff', stroke: '#1C6048' }} activeDot={{ r: 3, fill: '#1C6048', stroke: '#fff', strokeWidth: 1.5 }} animationDuration={850} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* SECTION II: Capital Commitments */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#D8D8D8] pb-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#1C6048]">II. Capital Commitments & Setup</span>
                <span className="text-[9px] font-sans font-bold text-[#8A8175]">IDR Billions</span>
              </div>
              
              <div className="divide-y divide-[#D8D8D8]/40 border-b border-[#D8D8D8]/40 relative">
                {/* PropCo Asset CapEx row with inline tooltip trigger */}
                <div 
                  ref={containerRef}
                  className="py-2.5 flex justify-between items-center hover:bg-[#F9F8F6] px-1 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium text-[#4C4A4B]">PropCo Asset Development CapEx</span>
                    <button 
                      ref={buttonRef}
                      className="text-[#9B8B70] hover:text-[#1E2F31] transition-colors p-0.5 rounded-full focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPropCoBreakdown(prev => !prev);
                      }}
                      title="Show Breakdown"
                      aria-label="Show Breakdown"
                    >
                      <Info size={13} className="inline opacity-90" />
                    </button>
                  </div>
                  <span className="text-xs font-bold font-sans text-[#1E2F31]">{currentPropCoCapexText}</span>

                  {/* Premium Slate Tooltip overlay for Capital breakdown */}
                  {showPropCoBreakdown && (
                    <div 
                      style={tooltipStyle}
                      className="z-50 bg-[#1E2F31] text-white p-4 rounded-xl shadow-2xl border border-white/10 text-xs text-left animate-in fade-in zoom-in-95 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Dynamic visual anchor caret */}
                      <div 
                        style={caretStyle}
                        className="absolute w-2.5 h-2.5 bg-[#1E2F31] border-t border-l border-white/10 rotate-45 top-[-5px]" 
                      />

                      <div className="border-b border-[#EFEBE7]/20 pb-2 mb-2 flex justify-between items-center relative z-10">
                        <div>
                          <h5 className="font-bold text-[#C4DFD2] uppercase tracking-wider text-[10px] font-display">PropCo Capital Breakdown</h5>
                          <p className="text-[9px] text-[#EFEBE7]/70 font-display">Detailed property asset development allocations in Billions</p>
                        </div>
                        <button 
                          className="text-[#C4DFD2] hover:text-white font-bold p-1 text-[11px] focus:outline-none" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPropCoBreakdown(false);
                          }}
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-2.5 relative z-10">
                        {/* Hard Costs section */}
                        <div>
                          <div className="flex justify-between text-[10px] font-bold text-[#C4DFD2] uppercase tracking-wider mb-1">
                            <span>Hard Costs (Capitalized Assets)</span>
                            <span className="font-display text-[#C4DFD2]">{propCoData?.capexDetails?.totalHardCosts ? `IDR ${propCoData?.capexDetails?.totalHardCosts.toFixed(1)}B` : "N/A"}</span>
                          </div>
                          <div className="pl-2 mt-0.5 space-y-1 text-[11px] text-[#EFEBE7]/80 font-display">
                            <div className="flex justify-between hover:text-white transition-colors">
                              <span>• Construction (Civils/Build)</span>
                              <span>{propCoData?.capexDetails?.buildCost ? `${propCoData?.capexDetails?.buildCost.toFixed(1)} B` : "0.0 B"}</span>
                            </div>
                            <div className="flex justify-between hover:text-white transition-colors">
                              <span>• Medical Equipment Package</span>
                              <span>{propCoData?.capexDetails?.medEqCost ? `${propCoData?.capexDetails?.medEqCost.toFixed(1)} B` : "0.0 B"}</span>
                            </div>
                            <div className="flex justify-between hover:text-white transition-colors">
                              <span>• Mechanical & Infrastructure</span>
                              <span>{propCoData?.capexDetails?.infraCost ? `${propCoData?.capexDetails?.infraCost.toFixed(1)} B` : "0.0 B"}</span>
                            </div>
                            <div className="flex justify-between hover:text-white transition-colors">
                              <span>• FF&E Core Allocation</span>
                              <span>{propCoData?.capexDetails?.ffeCost ? `${propCoData?.capexDetails?.ffeCost.toFixed(1)} B` : "0.0 B"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Soft Costs Section */}
                        <div className="pt-1.5 border-t border-[#EFEBE7]/15">
                          <div className="flex justify-between text-[10px] font-bold text-[#C4DFD2] uppercase tracking-wider mb-1">
                            <span>Soft Costs (Direct Setup Fees)</span>
                            <span className="font-display text-[#C4DFD2]">{propCoData?.capexDetails?.totalSoftCosts ? `IDR ${propCoData?.capexDetails?.totalSoftCosts.toFixed(1)}B` : "N/A"}</span>
                          </div>
                          <p className="text-[9.5px] text-[#EFEBE7]/70 pl-2 leading-normal">
                            Includes VAT {propCoData?.capexDetails?.vatCost ? `(${propCoData?.capexDetails?.vatCost.toFixed(1)} B)` : ""}, municipal licenses, startup G&A, localized builder insurance (Dev CAR), consultant fees {propCoData?.capexDetails?.consultantCost ? `(${propCoData?.capexDetails?.consultantCost.toFixed(1)} B)` : ""}, and pre-operating contingency pools.
                          </p>
                        </div>

                        {/* Land Assets Section */}
                        <div className="pt-1.5 border-t border-[#EFEBE7]/15 flex justify-between text-[10px] font-bold text-[#C4DFD2] uppercase tracking-wider">
                          <span>Land Allocation (Separate Asset)</span>
                          <span className="font-display text-[#C4DFD2]">{propCoData?.capexDetails?.landCost ? `IDR ${propCoData?.capexDetails?.landCost.toFixed(1)}B` : "0.0 B"}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#EFEBE7]/20 flex items-center justify-between text-[9px] text-[#EFEBE7]/60 relative z-10">
                        <span>Total Development Funding:</span>
                        <strong className="text-white font-display">{currentPropCoCapexText}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* OpCo Capital row */}
                <div className="py-2.5 flex justify-between items-center hover:bg-[#F9F8F6] px-1 transition-colors">
                  <span className="text-[11px] font-medium text-[#4C4A4B]">OpCo Clinical Setup Equity</span>
                  <span className="text-xs font-bold font-sans text-[#1C6048]">{currentOpCoEquityText}</span>
                </div>
              </div>
            </div>

            {/* SECTION III: Yields, Returns & Performance */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#D8D8D8] pb-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-[#1C6048]">III. Yields, Returns & Performance</span>
                <span className="text-[9px] font-sans font-bold text-[#8A8175]">Investment & Return Metrics</span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 pt-1 font-sans">
                {/* Row 1, Col 1: Starting RevPAB */}
                <div className="flex flex-col pb-1 border-b border-[#D8D8D8]/40 hover:bg-[#F9F8F6] px-1 rounded transition-colors">
                  <span className="text-[9px] uppercase font-bold text-[#8A8175] tracking-wide">Starting RevPAB (Y1)</span>
                  <span className="text-xs font-bold text-[#1E2F31] mt-0.5">
                    {startingRevPab !== undefined 
                      ? `IDR ${startingRevPab.toFixed(2)} B` 
                      : "IDR 2.13 B"}
                  </span>
                </div>
                {/* Row 1, Col 2: Stabilized RevPAB */}
                <div className="flex flex-col pb-1 border-b border-[#D8D8D8]/40 hover:bg-[#F9F8F6] px-1 rounded transition-colors">
                  <span className="text-[9px] uppercase font-bold text-[#8A8175] tracking-wide">Stabilized RevPAB</span>
                  <span className="text-xs font-bold text-[#1C6048] mt-0.5">
                    {stabilizedRevPab !== undefined 
                      ? `IDR ${stabilizedRevPab.toFixed(2)} B` 
                      : "IDR 3.47 B"}
                  </span>
                </div>

                {/* Row 2, Col 1: EBITDA Share */}
                <div className="flex flex-col pb-1 border-b border-[#D8D8D8]/40 hover:bg-[#F9F8F6] px-1 rounded transition-colors">
                  <span className="text-[9px] uppercase font-bold text-[#8A8175] tracking-wide">EBITDA Share to PropCo</span>
                  <span className="text-xs font-bold text-[#1C6048] mt-0.5">15.0%</span>
                </div>
                {/* Row 2, Col 2: Exit Multiple */}
                <div className="flex flex-col pb-1 border-b border-[#D8D8D8]/40 hover:bg-[#F9F8F6] px-1 rounded transition-colors">
                  <span className="text-[9px] uppercase font-bold text-[#8A8175] tracking-wide">Exit Multiple</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5">15.0x EBITDA</span>
                </div>

                {/* Row 3, Col 1: Blended IRR */}
                <div className="flex flex-col bg-[#1C6048]/5 p-2 rounded-xl border border-[#1C6048]/15 hover:bg-[#1C6048]/10 transition-colors">
                  <span className="text-[8.5px] uppercase font-extrabold text-[#1C6048] tracking-widest">Blended Base IRR</span>
                  <span className="text-sm font-black text-[#1C6048] mt-0.5">{currentBlendedIrr}</span>
                </div>
                {/* Row 3, Col 2: Payback Period */}
                <div className="flex flex-col bg-[#1E2F31]/5 p-2 rounded-xl border border-[#1E2F31]/10 hover:bg-[#1E2F31]/10 transition-colors">
                  <span className="text-[8.5px] uppercase font-extrabold text-[#4C4A4B] tracking-widest">Payback Period</span>
                  <span className="text-sm font-black text-[#1E2F31] mt-0.5">{currentPaybackText}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Lifetime P&L Summary Section */}
        <div className="lg:col-span-12 pt-8">
          <div className="flex flex-col gap-1 mb-6 border-l-4 border-[#1C6048] pl-4">
            <h3 className="text-xl font-bold text-[#1E2F31]">Lifetime Profit & Loss Summary</h3>
            <p className="text-xs text-[#8A8175] font-medium tracking-tight">Consolidated clinical and infrastructure performance across the 10-year operational lifecycle.</p>
          </div>
          
          <div className="w-full">
            <LifetimePnLTable 
              opCoData={opCoData} 
              propCoData={propCoData} 
              consolidatedData={consolidatedData} 
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);
});
