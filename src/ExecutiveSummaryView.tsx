import React, { memo, useState } from "react";
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
  Users
} from "lucide-react";

export const ExecutiveSummaryView = memo(({ isPresenting }: { isPresenting: boolean }) => {
  const [activeNarrativeStep, setActiveNarrativeStep] = useState<number>(0);

  const narrativeSteps = [
    {
      title: "1. Strategic Location & Market Catapult",
      subtitle: "West Jakarta Catchment Area Focus",
      icon: <MapPin className="text-[#1C6048]" size={18} />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#4C4A4B] leading-relaxed">
            The project leverages a premium <strong>1.2 Ha Land site</strong> on Daan Mogot Road KM. 13. This location directly addresses a massive deficit in high-end, specialized hospital beds (Class A) for the West Jakarta population, bridging the gap between basic BPJS services and luxury private healthcare.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1C6048]/10 text-[#1C6048] px-2 py-1 rounded">
               K1 Zoning Permitted
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#9B8B70]/10 text-[#9B8B70] px-2 py-1 rounded">
               13,000 Sqm GFA
            </span>
          </div>
        </div>
      )
    },
    {
      title: "2. Clean PropCo-OpCo Synergy Structure",
      subtitle: "EBITDA-Linked Real Estate Returns",
      icon: <Users className="text-[#2A4750]" size={18} />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-[#4C4A4B] leading-relaxed">
             We have structured the transaction to fully isolate operating volatility from the underlying real estate asset. 
             Strategic Partners &amp; VG OpCo inject capital and expertise directly into the operational entity, ensuring institutional grade governance.
          </p>

          {/* Clean Flow Diagram */}
          <div className="bg-[#F9F8F6] p-4 rounded-xl border border-[#D8D8D8] space-y-4">
            <div className="grid grid-cols-12 gap-1 items-center">
              {/* Operators Column */}
              <div className="col-span-3 flex flex-col gap-2">
                <div className="bg-white p-2 rounded-lg border border-[#D8D8D8] text-center shadow-xs">
                  <div className="text-[10px] font-black uppercase text-[#4C4A4B] tracking-wider">Partner</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-[#D8D8D8] text-center shadow-xs">
                  <div className="text-[10px] font-black uppercase text-[#2A4750] tracking-wider">VG OpCo</div>
                </div>
              </div>

              {/* Input Arrows */}
              <div className="col-span-1 flex flex-col justify-around h-16 items-center">
                <ArrowRight size={14} className="text-[#4C4A4B] opacity-40" />
                <ArrowRight size={14} className="text-[#2A4750] opacity-40" />
              </div>

              {/* OpCo Core */}
              <div className="col-span-3 bg-[#1C6048] text-white p-3 rounded-xl border border-[#1C6048] text-center shadow-sm">
                <div className="text-xs font-bold leading-tight">OpCo</div>
                <div className="text-[8px] opacity-90 uppercase tracking-wider font-bold mt-1">Hospital Operation</div>
              </div>

              {/* Sharing Arrow */}
              <div className="col-span-2 flex justify-center">
                <div className="w-full flex flex-col items-center px-1">
                  <span className="text-[8px] text-[#9B8B70] font-black uppercase tracking-wider text-center whitespace-nowrap mb-1">EBITDA Share</span>
                  <ArrowRight size={14} className="text-[#9B8B70]" />
                </div>
              </div>

              {/* PropCo Core */}
              <div className="col-span-3 bg-[#1E2F31] text-white p-3 rounded-xl border border-[#1E2F31] text-center shadow-sm">
                <div className="text-xs font-bold leading-tight">PropCo</div>
                <div className="text-[8px] opacity-90 uppercase tracking-wider font-bold mt-1">Asset Owner</div>
              </div>
            </div>
            <div className="text-[10px] text-[#4C4A4B] leading-snug italic text-center opacity-95">
              💡 OpCo shares a specified percentage of EBITDA back to PropCo, aligning incentives perfectly while insulating structural real estate value from early-stage hospital risks.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. Targeted Clinical Positioning & Care Pathway",
      subtitle: "High-Yield Clinical Programming & Specialized Services",
      icon: <Activity className="text-[#1C6048]" size={18} />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#4C4A4B] leading-relaxed">
            Positioning Vasanta Hospital as a high-margin specialist facility focusing on oncology, cardiology, and advanced ob-gyn. This dual-track strategy optimizes both high-volume healthcare coverage and premium private care yield.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2 bg-white rounded-lg border border-[#D8D8D8]/60">
              <span className="text-[9px] uppercase font-black text-[#1C6048] block">Dual-care framework</span>
              <p className="text-[11px] text-[#4C4A4B]">Efficient outpatient flow coupled with premier private hospital care lanes.</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-[#D8D8D8]/60">
              <span className="text-[9px] uppercase font-black text-[#9B8B70] block">Specialist Radiotherapy</span>
              <p className="text-[11px] text-[#4C4A4B]">Advanced cancer pathway equipped with top-tier diagnostics driving outpatient margins.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "4. Strategic Execution Plan & Immediate Ask",
      subtitle: "Phased Roadmap & JV Formation",
      icon: <Compass className="text-[#9B8B70]" size={18} />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#4C4A4B] leading-relaxed">
            The next priority phase secures the definitive joint-venture entity setup and unlocks initial architectural design tranches.
          </p>
          <ul className="space-y-2 text-xs text-[#4C4A4B]">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
              <span>Binding MoU with key management team & target operating partners.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
              <span>Forming structural PropCo agreements and land transfer covenants.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
              <span>Final environmental impact checks matching trade & zoning parameters.</span>
            </li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 relative">
      {/* Diagonal Watermark Overlay */}
      <div className="absolute top-24 left-0 right-0 z-[100] flex justify-center pointer-events-none overflow-hidden h-64">
        <div className="transform -rotate-[8deg] w-[160%] shrink-0 whitespace-nowrap text-center pt-8">
          <p className="text-lg sm:text-xl md:text-3xl lg:text-5xl font-black text-red-600/15 uppercase tracking-[0.4em] select-none">
            DRAFT ON PROGRESS • DRAFT ON PROGRESS • DRAFT ON PROGRESS • DRAFT ON PROGRESS
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D8D8D8] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E2F31] to-[#2A4750] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles size={22} />
             </div>
             <div>
                 <h2 className="text-xl font-bold text-[#1E2F31]">Executive Summary Dashboard</h2>
                 <p className="text-sm font-medium text-[#4C4A4B] opacity-80">
                   Interactive brainstorming canvas combining linear narrative storyboard with high-level financial drivers.
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
            <div className="flex items-center justify-between border-b border-[#EFEBE7] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1C6048] bg-[#1C6048]/10 px-2 py-0.5 rounded">Narrative Flow</span>
                <h3 className="text-lg font-bold text-[#1E2F31] mt-1">Transaction Storyboard</h3>
              </div>
              <div className="text-xs text-[#4C4A4B] font-medium font-mono">
                Step {activeNarrativeStep + 1} of {narrativeSteps.length}
              </div>
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
                    <span className="font-bold text-[#1E2F31] font-mono">0{idx + 1}</span>
                    <span className={`w-2 h-2 rounded-full ${activeNarrativeStep === idx ? "bg-[#1C6048]" : "bg-transparent"}`}></span>
                  </div>
                  <span className="font-bold text-[#1E2F31] truncate block w-full mt-2">
                    {idx === 0 ? "Location" : idx === 1 ? "Structure" : idx === 2 ? "Clinical" : "The Ask"}
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
                {/* Metric Item: Total CapEx */}
                <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]/80 flex items-center justify-between hover:border-[#1E2F31]/30 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#4C4A4B] block">Total Estimated Investment</span>
                    <span className="text-lg font-bold text-[#1E2F31] font-mono">1.25 Trillion IDR</span>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg border border-[#D8D8D8] flex items-center justify-center text-[#1E2F31] shadow-xs shrink-0">
                    <DollarSign size={18} />
                  </div>
                </div>

                {/* Metric Item: Base Case IRR */}
                <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]/80 flex items-center justify-between hover:border-[#1C6048]/30 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#1C6048] block">Projected Base IRR</span>
                    <span className="text-lg font-bold text-[#1C6048] font-mono">18.4% - 22.1%</span>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg border border-[#D8D8D8] flex items-center justify-center text-[#1C6048] shadow-xs shrink-0">
                    <TrendingUp size={18} />
                  </div>
                </div>

                {/* Metric Item: Payback Period */}
                <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]/80 flex items-center justify-between hover:border-[#9B8B70]/30 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#9B8B70] block">Equity Payback Period</span>
                    <span className="text-lg font-bold text-[#4C4A4B] font-mono">5.8 - 6.4 Years</span>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg border border-[#D8D8D8] flex items-center justify-center text-[#9B8B70] shadow-xs shrink-0">
                    <Zap size={18} />
                  </div>
                </div>

                {/* Metric Item: Total Scale */}
                <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]/80 flex items-center justify-between hover:border-[#2A4750]/30 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#2A4750] block">Specialist Bed Scale</span>
                    <span className="text-lg font-bold text-[#1E2F31] font-mono font-sans">250 Capacity Beds</span>
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
                OpCo EBITDA sharing operates on a floor-and-ceiling covenant logic, offering strong downside defense to PropCo bondholders while capturing target operational upside during years 3-8 macro health ramp.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
});
