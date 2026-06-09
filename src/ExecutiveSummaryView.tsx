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
  const currentOpCoEquityText = rawOpCoEquity !== undefined ? `IDR ${rawOpCoEquity.toFixed(2)} Billion` : "IDR 82.10 Billion";

  const rawPayback = consolidatedData?.metrics?.payback;
  const currentPaybackText = rawPayback !== undefined ? `${rawPayback.toFixed(2)} Years` : "5.86 Years";

  const rawBeds = opCoData?.opsMetrics?.beds;
  const currentBedsText = rawBeds !== undefined ? `${rawBeds}-bed Capacity` : "120-bed Capacity";

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
      subtitle: "Capturing Regional Bed Deficits & Demographic Traffic Flow",
      icon: <Users className="text-[#1C6048]" size={18} />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#4C4A4B] leading-relaxed">
            Strategic physical positioning intercepts strong specialized primary/secondary outpatient demand and high-yield healthcare deficits in West Jakarta:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-white rounded-lg border border-[#D8D8D8]/60">
              <span className="text-[9px] uppercase font-black text-[#1C6048] block mb-1">🏥 Local Bed Supply Deficit</span>
              <p className="text-[11px] text-[#4C4A4B] leading-relaxed mt-1">
                Acute shortage of high-standard Class B clinical facilities within a 5km radius, leaving an unserved population center vulnerable.
              </p>
            </div>
            <div className="p-3.5 bg-white rounded-lg border border-[#D8D8D8]/60">
              <span className="text-[9px] uppercase font-black text-[#9B8B70] block mb-1">📍 Demographic Node</span>
              <p className="text-[11px] text-[#4C4A4B] leading-relaxed mt-1">
                1.2 Ha site on Daan Mogot KM. 13 intercepts dense traffic streams, eliminating centralized city commute barriers.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Budget Information",
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
                <p className="text-lg font-bold text-[#1E2F31] font-display">{currentPropCoCapexText}</p>
                <p className="text-[10px] text-[#8A8175] mt-1 mb-2.5 leading-normal">Excludes land acquisition; capitalized and funded by construction debt & target JV equity.</p>
                
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

            {/* OpCo Column */}
            <div className="p-4 bg-white rounded-xl border border-[#D8D8D8] flex flex-col justify-between h-full">
              <div className="flex-1">
                <span className="text-[9px] uppercase font-black text-[#1C6048] block mb-0.5">OpCo Startup Capital</span>
                <p className="text-lg font-bold text-[#1C6048] font-display">{currentOpCoEquityText}</p>
                <p className="text-[10px] text-[#8A8175] mt-1 mb-2.5 leading-normal">Covers JVA legal infrastructure setup, clinical licensing, and initial operational buffers.</p>
                
                {/* OpCo Breakdown List */}
                <div className="border-t border-[#EFEBE7] pt-2 space-y-1.5 text-[11px] text-[#4C4A4B]">
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] p-1 rounded">
                    <span className="font-semibold text-[#1E2F31]">1. JVA Setup</span>
                    <span className="font-bold text-[#1C6048] text-right">{opCoData?.setupDetails?.jvaOpex !== undefined ? opCoData.setupDetails.jvaOpex.toFixed(2) : "2.50"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] p-1 rounded">
                    <span className="font-semibold text-[#1E2F31]">2. Pre-operating</span>
                    <span className="font-bold text-[#1C6048] text-right">{opCoData?.setupDetails?.commOpex !== undefined ? opCoData.setupDetails.commOpex.toFixed(2) : "15.00"}</span>
                  </div>
                  <div className="flex justify-between font-display hover:bg-[#F9F8F6] p-1 rounded">
                    <span className="font-semibold text-[#1E2F31]">3. Clinical Working Capital</span>
                    <span className="font-bold text-[#1C6048] text-right">{opCoData?.setupDetails?.workingCapitalOpex !== undefined ? opCoData.setupDetails.workingCapitalOpex.toFixed(2) : "64.60"}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between font-display hover:bg-[#1C6048]/5 p-1 rounded border-t border-[#1C6048]/20 pt-1.5 mt-3 text-[#1C6048] font-black uppercase text-[10px]">
                <span>TOTAL OPCO INVESTMENT (IDR B)</span>
                <span className="text-right">{rawOpCoEquity !== undefined ? rawOpCoEquity.toFixed(2) : "82.10"}</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Asset Information",
      subtitle: "Leasehold Synergy & EBITDA-Linked Rental Allocations",
      icon: <Compass className="text-[#1C6048]" size={18} />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#4C4A4B] leading-relaxed font-sans">
            The dual-entity asset lease provides direct yield flow back to real estate investors while protecting the clinical operational balance sheet:
          </p>
          <div className="bg-white p-3 rounded-xl border border-[#D8D8D8] space-y-3">
            <div className="grid grid-cols-12 gap-1 items-center">
              <div className="col-span-3 flex flex-col gap-1">
                <div className="bg-[#F9F8F6] p-1 rounded border border-[#D8D8D8] text-center">
                  <span className="text-[8px] font-black uppercase text-[#4C4A4B] tracking-wider block">JV Partners</span>
                </div>
                <div className="bg-[#F9F8F6] p-1 rounded border border-[#D8D8D8] text-center">
                  <span className="text-[8px] font-black uppercase text-[#2A4750] tracking-wider block">VG OpCo</span>
                </div>
              </div>

              <div className="col-span-1 flex flex-col justify-around h-11 items-center">
                <ArrowRight size={12} className="text-[#4C4A4B] opacity-40" />
                <ArrowRight size={12} className="text-[#2A4750] opacity-40" />
              </div>

              <div className="col-span-3 bg-[#1C6048] text-white p-2 ml-1 rounded-lg text-center">
                <div className="text-xs font-bold leading-tight">VG OpCo</div>
                <div className="text-[7.5px] opacity-90 uppercase tracking-widest font-black mt-0.5">Clinical Operator</div>
              </div>

              <div className="col-span-2 flex justify-center">
                <div className="w-full flex flex-col items-center px-0.5">
                  <span className="text-[7px] text-[#9B8B70] font-black uppercase tracking-wider text-center whitespace-nowrap mb-0.5">Rent Flow</span>
                  <ArrowRight size={12} className="text-[#9B8B70]" />
                </div>
              </div>

              <div className="col-span-3 bg-[#1E2F31] text-white p-2 rounded-lg text-center">
                <div className="text-xs font-bold leading-tight">PropCo LLC</div>
                <div className="text-[7.5px] opacity-90 uppercase tracking-widest font-black mt-0.5">Real Estate Asset</div>
              </div>
            </div>
            <div className="text-[9.5px] text-[#4C4A4B] leading-snug italic text-center opacity-90">
              💡 PropCo collects stable yields on physical premises, while OpCo focuses purely on scaling primary patient care metrics.
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 relative">

      <div className="w-full space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D8D8D8] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E2F31] to-[#2A4750] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles size={22} />
             </div>
             <div>
                 <h2 className="text-xl font-bold text-[#1E2F31]">Executive Summary</h2>
                 <p className="text-sm font-medium text-[#4C4A4B] opacity-80">
                   Feasibility summary, key operational milestones, transaction structures, and high-level financial drivers.
                 </p>
             </div>
          </div>
          <div className="flex gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest bg-[#EFEBE7] border border-[#D8D8D8] text-[#1E2F31] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs">
              <ShieldCheck size={13} className="text-[#1C6048]" /> Class A Framework
            </span>
          </div>
        </div>

        {/* 2-Column Split Hybrid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Option 2 Structured Story / Stepper Narrative (7 Columns) */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#D8D8D8] space-y-6">
            <div className="border-b border-[#EFEBE7] pb-4">
              <h3 className="text-lg font-bold text-[#1E2F31]">Strategic Narrative & Phased Roadmap</h3>
            </div>

            {/* Stepper Steps / Tab Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {narrativeSteps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveNarrativeStep(idx)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all relative flex flex-col justify-between h-20 ${
                    activeNarrativeStep === idx
                      ? "bg-white border-[#1C6048] shadow-sm ring-1 ring-[#1C6048]/30"
                      : "bg-[#F9F8F6] border-[#D8D8D8] opacity-70 hover:opacity-100 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-[#1E2F31] font-display">0{idx + 1}</span>
                    <span className={`w-2 h-2 rounded-full ${activeNarrativeStep === idx ? "bg-[#1C6048]" : "bg-transparent"}`}></span>
                  </div>
                  <span className="font-bold text-[#1E2F31] truncate block w-full mt-2">
                    {idx === 0 ? "Financial" : idx === 1 ? "Market" : idx === 2 ? "Budget" : "Asset"}
                  </span>
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

            {/* Persistent Key Milestones Panel */}
            <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8] shadow-sm mt-6">
              <h4 className="text-sm font-bold text-[#1E2F31] font-display flex items-center gap-2 mb-4">
                <Flag size={16} className="text-[#1C6048]" />
                Key Strategic Milestones & Operational Ramp
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-[#D8D8D8]/60 rounded-xl relative overflow-hidden group hover:border-[#1C6048]/30 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#1E2F31]/5 rounded-bl-full -z-0"></div>
                    <span className="text-[10px] text-[#8A8175] font-black uppercase tracking-wider block relative z-10">Hospital Development</span>
                    <strong className="text-2xl text-[#1E2F31] font-display block mt-1 relative z-10">2 Years</strong>
                    <span className="text-xs text-[#4C4A4B] mt-0.5 block relative z-10">Estimated construction & setup phase</span>
                  </div>
                  <div className="p-4 bg-white border border-[#D8D8D8]/60 rounded-xl relative overflow-hidden group hover:border-[#1C6048]/30 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#1C6048]/5 rounded-bl-full -z-0"></div>
                    <span className="text-[10px] text-[#8A8175] font-black uppercase tracking-wider block relative z-10">Start Operational</span>
                    <strong className="text-2xl text-[#1E2F31] font-display block mt-1 relative z-10">Q3 2028</strong>
                    <span className="text-xs text-[#4C4A4B] mt-0.5 block relative z-10">Target operational readiness</span>
                  </div>
                </div>
                
                <div className="p-4 bg-white border border-[#D8D8D8]/60 rounded-xl flex flex-col justify-between group hover:border-[#1C6048]/30 transition-colors">
                  <div className="mb-2 flex items-start justify-between">
                    <span className="text-[10px] text-[#8A8175] font-black uppercase tracking-wider block max-w-[140px]">Bed Occupancy Rate (BOR) Target Ramp</span>
                    <span className="text-[10px] font-bold text-[#1C6048] bg-[#1C6048]/10 px-2 py-0.5 rounded-md">Y1 - Y5+</span>
                  </div>
                  <div className="h-[100px] w-full relative mb-1 mt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { name: "Y1", val: 45 },
                        { name: "Y2", val: 50 },
                        { name: "Y3", val: 55 },
                        { name: "Y4", val: 60 },
                        { name: "Y5+", val: 65 },
                      ]} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEBE7" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#8A8175', fontWeight: 600 }} dy={5} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#8A8175' }} ticks={[40, 50, 60, 70]} domain={[40, 70]} tickFormatter={(val) => val+"%"} />
                        <Tooltip 
                          contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #D8D8D8', padding: '4px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} 
                          cursor={{ stroke: '#EFEBE7', strokeWidth: 1.5 }}
                          formatter={(val: number) => [`${val}%`, 'BOR']} 
                          labelStyle={{ color: '#8A8175', fontWeight: 600, fontSize: '10px' }}
                        />
                        <Line type="monotone" dataKey="val" stroke="#1C6048" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#1C6048' }} activeDot={{ r: 5, fill: '#1C6048', stroke: '#fff', strokeWidth: 2 }} animationDuration={1000} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10.5px] text-[#4C4A4B] leading-relaxed pt-2 border-t border-[#EFEBE7]/60">
                    Starts at <strong className="text-[#1E2F31]">45%</strong> with steady <strong className="text-[#1C6048]">+5%</strong> annual accretion, stabilizing at <strong className="text-[#1E2F31]">65%</strong> structural limit.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Option 3 Financial / KPIs Dashboard (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* KPI Performance Metrics Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D8D8D8] space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#9B8B70] bg-[#9B8B70]/10 px-2 py-0.5 rounded">Financial Pillars</span>
                <h3 className="text-lg font-bold text-[#1E2F31] mt-1">High-Level Assumptions</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Metric Item: PropCo CapEx with clean interactive layout */}
                <div 
                  ref={containerRef}
                  className="relative p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]/80 flex items-center justify-between hover:border-[#1E2F31]/30 transition-all duration-200"
                >
                  <div className="space-y-1 pr-6 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-black tracking-wider text-[#4C4A4B] block">PropCo Investment (Property & Development)</span>
                      <button 
                        ref={buttonRef}
                        className="text-[#9B8B70] hover:text-[#1E2F31] transition-colors p-1 -m-1 rounded-full focus:outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPropCoBreakdown(prev => !prev);
                        }}
                        title="Show Breakdown"
                        aria-label="Show Breakdown"
                      >
                        <Info size={14} className="inline opacity-90" />
                      </button>
                    </div>
                    <span className="text-lg font-bold text-[#1E2F31] font-display">{currentPropCoCapexText}</span>
                    <span className="text-[9px] text-[#8A8175] block">Active calculated development cost (Click ⓘ to expand)</span>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg border border-[#D8D8D8] flex items-center justify-center text-[#1E2F31] shadow-xs shrink-0 font-bold text-xs font-display">
                    Prop
                  </div>

                  {/* Absolute Breakdown Tooltip dynamically positioned relative to the Info button */}
                  {showPropCoBreakdown && (
                    <div 
                      style={tooltipStyle}
                      className="z-50 bg-[#1E2F31] text-white p-4 rounded-xl shadow-2xl border border-white/10 text-xs text-left animate-in fade-in zoom-in-95 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Dynamic Visual Caret pointing directly to ⓘ icon anchor */}
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

                {/* Metric Item: OpCo Setup Costs */}
                <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]/80 flex items-center justify-between hover:border-[#1C6048]/30 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#1C6048] block">OpCo Investment (Setup & Working Capital)</span>
                    <span className="text-lg font-bold text-[#1C6048] font-display">{currentOpCoEquityText}</span>
                    <span className="text-[9px] text-[#8A8175] block">Active required clinical setup funding</span>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg border border-[#D8D8D8] flex items-center justify-center text-[#1C6048] shadow-xs shrink-0 font-bold text-xs font-display">
                    OpCo
                  </div>
                </div>

                {/* Metric Item: Base Case IRR */}
                <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]/80 flex items-center justify-between hover:border-[#1C6048]/30 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#1C6048] block">Projected Base IRR (Blended Equity)</span>
                    <span className="text-lg font-bold text-[#1C6048] font-display">{currentBlendedIrr}</span>
                    <span className="text-[9px] text-[#8A8175] block">Stabilized macro clinical yield</span>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg border border-[#D8D8D8] flex items-center justify-center text-[#1C6048] shadow-xs shrink-0">
                    <TrendingUp size={18} />
                  </div>
                </div>

                {/* Metric Item: Payback Period */}
                <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]/80 flex items-center justify-between hover:border-[#9B8B70]/30 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#9B8B70] block">Equity Payback Period</span>
                    <span className="text-lg font-bold text-[#4C4A4B] font-display">{currentPaybackText}</span>
                    <span className="text-[9px] text-[#8A8175] block">Cumulative cash flow break-even</span>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg border border-[#D8D8D8] flex items-center justify-center text-[#9B8B70] shadow-xs shrink-0">
                    <Zap size={18} />
                  </div>
                </div>

                {/* Metric Item: Exit EBITDA Multiple */}
                <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]/80 flex items-center justify-between hover:border-[#9B8B70]/30 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#9B8B70] block">Exit Valuation Multiple</span>
                    <span className="text-lg font-bold text-[#1E2F31] font-display">15x EBITDA</span>
                    <span className="text-[9px] text-[#8A8175] block">EBITDA multiple applied at investment exit</span>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg border border-[#D8D8D8] flex items-center justify-center text-[#9B8B70] shadow-xs shrink-0">
                    <Compass size={18} />
                  </div>
                </div>

                {/* Metric Item: Total Scale */}
                <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]/80 flex items-center justify-between hover:border-[#2A4750]/30 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#2A4750] block">Specialist Bed Scale</span>
                    <span className="text-lg font-bold text-[#1E2F31] font-display">{currentBedsText}</span>
                    <span className="text-[9px] text-[#8A8175] block">Active clinical design capacity</span>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg border border-[#D8D8D8] flex items-center justify-center text-[#2A4750] shadow-xs shrink-0">
                     <Building2 size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Highlight Footer Banner */}
            <div className="bg-gradient-to-br from-[#1E2F31] to-[#2A4750] text-[#EFEBE7] p-6 rounded-2xl relative overflow-hidden shadow-xs">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform translate-x-4 -translate-y-4">
                 <Activity size={120} />
              </div>
              <h4 className="font-bold text-sm text-white uppercase tracking-widest mb-1">EBITDA Sharing Benchmark</h4>
              <p className="text-xs text-[#EFEBE7] opacity-90 leading-relaxed">
                OpCo lease payments and rental streams are calculated dynamically using flexible structures (flat % EBITDAR rate, revenue & profit splits, or revenue-per-active-bed tiered rates), offering strong downside defense while capturing operational upside during years 3-8 clinical ramp.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
});
