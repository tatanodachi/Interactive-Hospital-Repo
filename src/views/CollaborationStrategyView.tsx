import React, { memo, useState, useRef, useMemo, useEffect } from "react";
import {
  Briefcase,
  Target,
  Settings,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronRight,
  Calculator,
  PieChart,
  Activity,
  TrendingUp,
  Info,
  Users,
  Clock,
  ArrowRight,
  Lock,
  Unlock,
  RefreshCw,
  Network,
  Dna,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";
import {
  useMonthlyColumns,
  formatCurrency,
  formatNumber,
  formatPercent,
  StatefulTooltipIcon,
  LazyResponsiveContainer,
  TableRow,
  NavButton,
  BentoBox,
  CustomDiagnosticsIcon,
  CustomLinacIcon,
  CustomOverseasIcon,
  CustomPalliativeIcon,
  CustomClipboardIcon,
} from "../App";
import {
  OPCO_FORMULAS,
  PROPCO_FORMULAS,
  CONSOLIDATED_FORMULAS,
} from "../formulaTooltips";

export const CollaborationStrategyView = memo(({ isPresenting }: any) => (
  <div className="space-y-6 animate-in fade-in duration-500 pb-12">
    {/* Strategy Header */}
    <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-[#D8D8D8] flex flex-col md:flex-row justify-between items-center gap-6">
      <div>
        <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight mb-2 flex items-center gap-3">
          <Network className="text-[#1C6048]" size={28} /> Cross-Border Patient
          Journey
        </h2>
        <p className="text-xs text-[#4C4A4B] font-medium max-w-2xl leading-relaxed">
          A closed-loop collaboration model ensuring Vasanta captures maximum
          lifetime patient value through high-margin diagnostics and recurring
          therapies, while outsourcing only extreme-complexity interventions.
        </p>
      </div>
    </div>

    {/* 4-Card Flowchart Layout (1 Left, 2 Center, 1 Right) */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 relative mt-4">
      {/* LEFT COLUMN: Executive Diagnostics */}
      <div className="flex flex-col h-full relative z-10">
        <BentoBox className="flex-1 text-center bg-white border-[#D8D8D8] flex flex-col items-center">
          <h3 className="font-black text-[15px] text-[#1E2F31] mb-6">
            Executive Diagnostics
          </h3>

          {/* Custom Diagnostics SVG */}
          <div className="flex-1 w-full flex items-center justify-center min-h-[140px] mb-8">
            <div className="w-32 h-32 rounded-2xl border-2 border-[#D8D8D8] bg-[#F9F8F6] flex items-center justify-center text-[#9B8B70] transition-all hover:border-[#9B8B70] hover:shadow-md group">
              <CustomDiagnosticsIcon
                size={64}
                className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium mt-auto bg-[#F9F8F6] p-4 rounded-xl border border-[#D8D8D8] w-full">
            High-margin PET-CT and genomic screening act as the primary
            acquisition funnel locally.
          </p>
        </BentoBox>

        {/* Mobile Down Arrow (Visible only on mobile/tablet) */}
        <div className="lg:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#9B8B70] border-4 border-[#F9F8F6] rounded-full flex items-center justify-center shadow-md z-10 text-white">
          <ArrowRight size={14} strokeWidth={3} className="rotate-90" />
        </div>
      </div>

      {/* CENTER COLUMN: 2 Stacked Cards (Elevated to z-20 to pull arrows forward) */}
      <div className="flex flex-col gap-6 lg:gap-10 h-full relative z-20">
        {/* Left-to-Center Branching Arrow (Desktop Only) */}
        <div className="hidden lg:block absolute -left-10 top-[26%] bottom-[26%] w-10 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-5 border-t-2 border-[#9B8B70] -translate-y-[1px]"></div>
          <div className="absolute top-0 bottom-0 left-5 w-5 border-y-2 border-l-2 border-[#9B8B70] rounded-l-xl shadow-[-2px_0_4px_rgba(0,0,0,0.05)]"></div>
          <ArrowRight
            size={18}
            className="absolute -top-[9px] -right-[7px] text-[#9B8B70]"
            strokeWidth={3}
          />
          <ArrowRight
            size={18}
            className="absolute -bottom-[9px] -right-[7px] text-[#9B8B70]"
            strokeWidth={3}
          />
        </div>

        {/* Center-to-Right Merging Arrow (Desktop Only) */}
        <div className="hidden lg:block absolute -right-10 top-[26%] bottom-[26%] w-10 z-0 pointer-events-none">
          <div className="absolute top-0 bottom-0 right-5 w-5 border-y-2 border-r-2 border-[#9B8B70] rounded-r-xl shadow-[2px_0_4px_rgba(0,0,0,0.05)]"></div>
          <div className="absolute top-1/2 right-0 w-5 border-t-2 border-[#9B8B70] -translate-y-[1px]"></div>
          <ArrowRight
            size={18}
            className="absolute top-1/2 -mt-[9px] -right-[7px] text-[#9B8B70]"
            strokeWidth={3}
          />
        </div>

        {/* Middle Mobile Down Arrow (Visible only on mobile/tablet) */}
        <div className="lg:hidden absolute top-[calc(50%-20px)] left-1/2 -translate-x-1/2 w-8 h-8 bg-[#9B8B70] border-4 border-[#F9F8F6] rounded-full flex items-center justify-center shadow-md z-10 text-white">
          <ArrowRight size={14} strokeWidth={3} className="rotate-90" />
        </div>

        {/* Top Center: Local Systemic */}
        <BentoBox className="flex-1 text-center bg-white border-[#D8D8D8] flex flex-col items-center">
          <h3 className="font-black text-[15px] text-[#1E2F31] mb-4">
            Local Systemic & LINAC
          </h3>

          {/* Custom LINAC SVG */}
          <div className="flex-1 w-full flex items-center justify-center min-h-[100px] mb-6">
            <div className="w-24 h-24 rounded-2xl border-2 border-[#D8D8D8] bg-[#F9F8F6] flex items-center justify-center text-[#9B8B70] transition-all hover:border-[#9B8B70] hover:shadow-md group">
              <CustomLinacIcon
                size={48}
                className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium mt-auto bg-[#F9F8F6] p-4 rounded-xl border border-[#D8D8D8] w-full">
            Most vast majority of cases require 30-day radiotherapy cycles or
            standard chemotherapy. Geographic inelasticity forces these patients
            to utilize our highly profitable local bunkers and VIP infusion
            suites.
          </p>
        </BentoBox>

        {/* Bottom Center: Overseas Partner */}
        <BentoBox className="flex-1 text-center bg-white border-[#D8D8D8] flex flex-col items-center">
          <h3 className="font-black text-[15px] text-[#1E2F31] mb-4">
            Overseas Partner
          </h3>

          {/* Custom Overseas Partner SVG + DNA */}
          <div className="flex-1 w-full flex items-center justify-center min-h-[100px] mb-6">
            <div className="px-5 h-24 rounded-2xl border-2 border-[#D8D8D8] bg-[#E8EFEA] flex items-center justify-center gap-4 transition-all hover:border-[#1C6048] hover:shadow-md group">
              <CustomOverseasIcon
                size={42}
                className="text-[#1C6048] opacity-80 group-hover:opacity-100 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300"
              />
              <div className="w-px h-10 bg-[#D8D8D8] transition-colors group-hover:bg-[#1C6048]/30"></div>
              <Dna
                size={36}
                strokeWidth={1.5}
                className="text-[#1C6048] opacity-80 group-hover:opacity-100 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#1E2F31] leading-relaxed font-medium mt-auto bg-[#E8EFEA] p-4 rounded-xl border border-[#1C6048]/20 w-full">
            Only ultra-complex surgical cases are referred out, leveraging
            industrial trust without cannibalizing core local EBITDA.
          </p>
        </BentoBox>

        {/* Mobile Down Arrow (Visible only on mobile/tablet) */}
        <div className="lg:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#9B8B70] border-4 border-[#F9F8F6] rounded-full flex items-center justify-center shadow-md z-10 text-white">
          <ArrowRight size={14} strokeWidth={3} className="rotate-90" />
        </div>
      </div>

      {/* RIGHT COLUMN: Repatriation & Palliative */}
      <div className="flex flex-col h-full relative z-10">
        <BentoBox className="flex-1 text-center bg-white border-[#D8D8D8] flex flex-col items-center">
          <h3 className="font-black text-[15px] text-[#1E2F31] mb-6">
            Repatriation & Palliative
          </h3>

          {/* Custom Palliative SVG + Medical Check Board */}
          <div className="flex-1 w-full flex items-center justify-center min-h-[140px] mb-8">
            <div className="px-5 h-24 rounded-2xl border-2 border-[#D8D8D8] bg-[#F9F8F6] flex items-center justify-center gap-4 text-[#9B8B70] transition-all hover:border-[#9B8B70] hover:shadow-md group">
              <CustomPalliativeIcon
                size={48}
                className="opacity-80 group-hover:opacity-100 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300"
              />
              <div className="w-px h-10 bg-[#D8D8D8] transition-colors group-hover:bg-[#9B8B70]/30"></div>
              <CustomClipboardIcon
                size={42}
                className="opacity-80 group-hover:opacity-100 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium mt-auto bg-[#F9F8F6] p-4 rounded-xl border border-[#D8D8D8] w-full">
            All overseas patients are mandated to return to the local hospital
            for multi-year monitoring, recovery, and high-margin palliative
            care.
          </p>
        </BentoBox>
      </div>
    </div>
  </div>
));
