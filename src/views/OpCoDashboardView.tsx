import { calculateIRR, calculatePayback } from "../financialEngine";
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
  Sparkles,
  X,
  FileText,
  BarChart3,
  Coins,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  MarkdownRenderer,
  KPICard,
  PartnerReturnCard,
  KPITooltipIcon,
  TOOLTIP_STYLE,
  LEGEND_STYLE,
  useTooltip,
} from "../App";

export const OpCoDashboardView = memo(
  ({
    data,
    assumptions,
    generateTeaser,
    isTeaserLoading,
    showTeaser,
    setShowTeaser,
    teaserContent,
    isPresenting,
  }) => {
    const [returnsTab, setReturnsTab] = useState("all");

    const totalEquityVal =
      data.totalEquity ||
      assumptions.partnerAEquity + assumptions.partnerBEquity ||
      1;
    const projectAvgYield =
      (data.partnerA.avgYield * assumptions.partnerAEquity +
        data.partnerB.avgYield * assumptions.partnerBEquity) /
      totalEquityVal;

    // Option 1: True Combined Distributed Partner Cash Flow IRR
    const combinedCfs = useMemo(() => {
      const pACfs = data.partnerACfsMonthly || [];
      const pBCfs = data.partnerBCfsMonthly || [];
      const len = Math.max(pACfs.length, pBCfs.length);
      const combined = [];
      for (let idx = 0; idx < len; idx++) {
        combined.push((pACfs[idx] || 0) + (pBCfs[idx] || 0));
      }
      return combined;
    }, [data.partnerACfsMonthly, data.partnerBCfsMonthly]);

    const projectIrrVal = useMemo(
      () => calculateIRR(combinedCfs, "monthly"),
      [combinedCfs],
    );
    const projectPaybackVal = useMemo(
      () => calculatePayback(combinedCfs, "monthly"),
      [combinedCfs],
    );
    const projectMoic = useMemo(() => {
      return totalEquityVal > 0
        ? (data.partnerA.totalCash + data.partnerB.totalCash) / totalEquityVal
        : 0;
    }, [data.partnerA.totalCash, data.partnerB.totalCash, totalEquityVal]);

    const projectMetrics = useMemo(
      () => ({
        avgYield: projectAvgYield,
        irr: projectIrrVal,
        payback: projectPaybackVal,
        totalCash: data.partnerA.totalCash + data.partnerB.totalCash,
        moic: projectMoic,
      }),
      [
        projectAvgYield,
        projectIrrVal,
        projectPaybackVal,
        data.partnerA.totalCash,
        data.partnerB.totalCash,
        projectMoic,
      ],
    );

    const operatingYears = data.annualData.filter((d) => (d.totalRev || 0) > 0);
    const avgEbitdarMargin =
      operatingYears.length > 0
        ? operatingYears.reduce((acc, d) => acc + (d.ebitdarMargin || 0), 0) /
          operatingYears.length
        : 0;
    const avgNetMargin =
      operatingYears.length > 0
        ? operatingYears.reduce((acc, d) => acc + (d.netMargin || 0), 0) /
          operatingYears.length
        : 0;

    const blendedEbitdarMargin = data.totals.ebitdarMargin || 0;
    const blendedNetMargin = data.totals.netMargin || 0;

    const revPabTooltip = useMemo(
      () => ({
        desc: `Specific revenue metrics per clinical bed:\n• Stabilized RevPAB: ${formatNumber(data.opsMetrics?.revPab, 1)} B IDR\n• Starting RevPAB: ${formatNumber(data.opsMetrics?.startingRevPab, 1)} B IDR\n• Average RevPAB: ${formatNumber(data.opsMetrics?.averageRevPab, 1)} B IDR`,
        formula: "RevPAB = Annual Revenue / Operating Beds (in B IDR)",
      }),
      [
        data.opsMetrics?.revPab,
        data.opsMetrics?.startingRevPab,
        data.opsMetrics?.averageRevPab,
      ],
    );

    const { tooltipState: revPabTs, setTooltipState: setRevPabTs } =
      useTooltip(revPabTooltip);

    const npvTooltip = useMemo(() => ({
      desc: "The net present value of all projected free cash flows discounted back to Year 1 (2026) using the selected hurdle rate.",
      formula: "NPV = Sum of [FCF_t / (1 + r)^t] across years"
    }), []);
    
    const moicTooltip = useMemo(() => ({
      desc: "Indicates absolute wealth creation. While IRR measures compounding speed over time, the Cash Multiple (MOIC) shows the absolute magnitude of your cash return. A typical healthcare infrastructure target is 2.5x - 3.0x+.",
      formula: "Total Project Free Cash Flow ÷ Cumulative Partner Equity Invested"
    }), []);

    const irrTooltip = useMemo(() => ({
      desc: "The Internal Rate of Return (IRR) of the project's cumulative free cash flows. Measures the annual compounded rate of return on invested equity.",
      formula: "IRR is the rate 'r' at which NPV of all cash flows equals zero"
    }), []);

    const yieldTooltip = useMemo(() => ({
      desc: "The average annual cash distribution yield. It acts as the steady engine driving the overall Cash Multiple over the asset's lifecycle.",
      formula: "Average of (Annual Cash Flow ÷ Invested Equity) across operating years"
    }), []);

    const { tooltipState: npvTs, setTooltipState: setNpvTs } = useTooltip(npvTooltip);
    const { tooltipState: moicTs, setTooltipState: setMoicTs } = useTooltip(moicTooltip);
    const { tooltipState: irrTs, setTooltipState: setIrrTs } = useTooltip(irrTooltip);
    const { tooltipState: yieldTs, setTooltipState: setYieldTs } = useTooltip(yieldTooltip);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start animate-in fade-in w-full max-w-full">
        {/* COLUMN 1: Executive, Returns tab, and Blended Margins */}
        <div className="space-y-6 w-full flex flex-col justify-start">
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <h2 className="text-sm font-bold text-[#1E2F31] ml-2">
              Executive Overview
            </h2>
            <button
              disabled={true}
              title="Temporarily disabled"
              className="bg-[#D8D8D8] text-[#8A8175] cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 transition-colors opacity-70"
            >
              <Sparkles size={14} />✨ Pitch Teaser
            </button>
          </div>

          {showTeaser && (
            <div className="bg-white p-6 rounded-2xl border-l-4 border-l-[#1C6048] shadow-sm relative">
              <button
                onClick={() => setShowTeaser(false)}
                className="absolute top-4 right-4 bg-[#EFEBE7] p-1 rounded-full"
              >
                <X size={16} />
              </button>
              <h3 className="font-bold text-[#1E2F31] mb-2 flex items-center gap-2">
                <FileText size={18} /> AI Pitch Teaser
              </h3>
              <MarkdownRenderer content={teaserContent} />
            </div>
          )}

          {/* Returns Tab Selector Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D8D8D8] relative transition-all hover:shadow-md">
            {/* Card Title & Stateful Toggle Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#EFEBE7] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-1.5 font-sans">
                  <TrendingUp size={16} className="text-[#1C6048]" /> Return
                  Metric
                </h3>
              </div>
              <div className="flex bg-[#EFEBE7] p-1 rounded-xl border border-[#D8D8D8]">
                <button
                  type="button"
                  onClick={() => setReturnsTab("all")}
                  className={`px-3 py-1 text-[10px] font-bold transition-all rounded-lg select-none cursor-pointer ${
                    returnsTab === "all"
                      ? "bg-[#1C6048] text-white shadow"
                      : "text-[#4C4A4B] hover:text-[#1E2F31]"
                  }`}
                >
                  Project
                </button>
                <button
                  type="button"
                  onClick={() => setReturnsTab("partner")}
                  className={`px-3 py-1 text-[10px] font-bold transition-all rounded-lg select-none cursor-pointer ${
                    returnsTab === "partner"
                      ? "bg-[#1C6048] text-white shadow"
                      : "text-[#4C4A4B] hover:text-[#1E2F31]"
                  }`}
                >
                  Partner
                </button>
                <button
                  type="button"
                  onClick={() => setReturnsTab("vasanta")}
                  className={`px-3 py-1 text-[10px] font-bold transition-all rounded-lg select-none cursor-pointer ${
                    returnsTab === "vasanta"
                      ? "bg-[#1C6048] text-white shadow"
                      : "text-[#4C4A4B] hover:text-[#1E2F31]"
                  }`}
                >
                  Vasanta
                </button>
              </div>
            </div>

            {/* Render Active Option */}
            {returnsTab === "all" && (
              <PartnerReturnCard
                name="Project"
                metrics={projectMetrics}
                equity={totalEquityVal}
                share={100}
                color="blue"
                isUnifiedCard={true}
              />
            )}
            {returnsTab === "partner" && (
              <PartnerReturnCard
                name={`Strategic Partner`}
                metrics={data.partnerA}
                equity={assumptions.partnerAEquity}
                share={assumptions.sharingPercentA}
                color="blue"
                isUnifiedCard={true}
              />
            )}
            {returnsTab === "vasanta" && (
              <PartnerReturnCard
                name={`Vasanta`}
                metrics={data.partnerB}
                equity={assumptions.partnerBEquity}
                share={100 - assumptions.sharingPercentA}
                color="indigo"
                isUnifiedCard={true}
              />
            )}
          </div>

          {/* Consolidated Blended Margins Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#D8D8D8] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 rounded-full bg-[#1C6048]/[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700" />

            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EFEBE7] relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2F31] flex items-center gap-1.5 font-sans">
                <Coins size={15} className="text-[#1C6048]" /> Project Margins
              </h3>
              <span className="text-[9px] text-[#1C6048] font-mono bg-[#EFEBE7] px-2 py-0.5 rounded font-bold uppercase">
                Look-Through Metrics
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              {/* EBITDAR */}
              <div className="flex flex-col">
                <p className="text-[10px] text-[#1C6048] font-black uppercase tracking-widest mb-1">
                  EBITDAR Margin
                </p>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-[#1C6048] leading-none font-sans">
                    {formatNumber(avgEbitdarMargin, 1)}%
                  </span>
                  <span className="text-[8px] lg:text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-tight font-mono mt-1">
                    Active Years Avg
                  </span>
                </div>
              </div>

              {/* Net Profit */}
              <div className="flex flex-col border-l border-[#D8D8D8]/50 pl-4">
                <p className="text-[10px] text-[#1E2F31] font-black uppercase tracking-widest mb-1">
                  Net Profit Margin
                </p>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-[#1E2F31] leading-none font-sans">
                    {formatNumber(avgNetMargin, 1)}%
                  </span>
                  <span className="text-[8px] lg:text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-tight font-mono mt-1">
                    Active Years Avg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Performance KPIs & Clinical Scorecards */}
        <div className="space-y-6 w-full flex flex-col justify-start">
          {/* Unified Investment Return Cockpit Panel */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D8D8D8] relative overflow-visible transition-all hover:shadow-md">
            {/* Cockpit Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EFEBE7]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2F31] flex items-center gap-1.5 font-sans">
                <Coins size={15} className="text-[#1C6048]" /> Investment Return Cockpit
              </h3>
              <span className="text-[9px] text-[#1C6048] font-mono bg-[#EFEBE7] px-2 py-0.5 rounded font-bold uppercase">
                Integrated Returns
              </span>
            </div>

            {/* 2x2 Grid with Thin Hairline Internal Border Dividers */}
            <div className="grid grid-cols-2 relative z-10">
              {/* Quadrant 1: Project IRR */}
              <div className="flex flex-col pr-4 pb-4 border-r border-b border-[#D8D8D8]/50 relative group">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#1C6048]">
                  <span className="flex items-center gap-1.5">
                    <Activity size={12} className="text-[#1C6048]" /> Project IRR
                  </span>
                  <KPITooltipIcon
                    tooltip={irrTooltip}
                    tooltipState={irrTs}
                    setTooltipState={setIrrTs}
                  />
                </div>
                <span className="text-2xl font-black text-[#1C6048] my-1 font-sans leading-none tracking-tight">
                  {formatNumber((data.projectIRR || 0) * 100, 2)}%
                </span>
                <span className="text-[8px] lg:text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-tight">
                  Compounded Return
                </span>
              </div>

              {/* Quadrant 2: Project NPV */}
              <div className="flex flex-col pl-4 pb-4 border-b border-[#D8D8D8]/50 relative group">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#1E2F31]">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-[#1C6048]" /> Project NPV
                  </span>
                  <KPITooltipIcon
                    tooltip={npvTooltip}
                    tooltipState={npvTs}
                    setTooltipState={setNpvTs}
                  />
                </div>
                <span className="text-2xl font-black text-[#1E2F31] my-1 font-sans leading-none tracking-tight">
                  {formatCurrency(data.projectNPV)}
                </span>
                <span className="text-[8px] lg:text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-tight">
                  @{String(assumptions.discountRate)}% Disc Rate
                </span>
              </div>

              {/* Quadrant 3: Cash Multiple */}
              <div className="flex flex-col pr-4 pt-4 border-r border-[#D8D8D8]/50 relative group">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#1E2F31]">
                  <span className="flex items-center gap-1.5">
                    <BarChart3 size={12} className="text-[#9B8B70]" /> Cash Multiple
                  </span>
                  <KPITooltipIcon
                    tooltip={moicTooltip}
                    tooltipState={moicTs}
                    setTooltipState={setMoicTs}
                  />
                </div>
                <span className="text-2xl font-black text-[#1E2F31] my-1 font-sans leading-none tracking-tight">
                  {data.totalEquity > 0 ? (data.totals.fcf / data.totalEquity).toFixed(2) : "0"}x
                </span>
                <span className="text-[8px] lg:text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-tight">
                  Project MOIC
                </span>
              </div>

              {/* Quadrant 4: Avg Div. Yield */}
              <div className="flex flex-col pl-4 pt-4 relative group">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#9B8B70]">
                  <span className="flex items-center gap-1.5">
                    <Coins size={12} className="text-[#9B8B70]" /> Avg Div. Yield
                  </span>
                  <KPITooltipIcon
                    tooltip={yieldTooltip}
                    tooltipState={yieldTs}
                    setTooltipState={setYieldTs}
                  />
                </div>
                <span className="text-2xl font-black text-[#9B8B70] my-1 font-sans leading-none tracking-tight">
                  {formatNumber(data.partnerA.avgYield, 1)}%
                </span>
                <span className="text-[8px] lg:text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-tight">
                  Mean Operating Yield
                </span>
              </div>
            </div>
          </div>

          {/* Unified Stabilization Scorecard Container - Telemetry Bento Grid */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D8D8D8] relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EFEBE7]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2F31] flex items-center gap-1.5 font-sans">
                <Activity size={15} className="text-[#1C6048]" /> Clinical Benchmarks at Stabilization
              </h3>
              <span className="text-[9px] text-[#9B8B70] font-mono bg-[#EFEBE7] px-2 py-0.5 rounded font-bold uppercase">
                Peak Ops
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Metric 1 */}
              <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D8D8D8]/50 flex flex-col justify-between">
                <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-tight">
                  Stabilized Vol.
                </span>
                <p className="text-xl font-black text-[#1E2F31] my-1 font-sans leading-none">
                  {formatNumber(data.opsMetrics.stabilizedVolume, 0)}
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Peak Patients
                </span>
              </div>
              {/* Metric 2 */}
              <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D8D8D8]/50 flex flex-col justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-tight">
                    Rev. Per Bed
                  </span>
                  <KPITooltipIcon
                    tooltip={revPabTooltip}
                    tooltipState={revPabTs}
                    setTooltipState={setRevPabTs}
                    align="left"
                  />
                </div>
                <p className="text-xl font-black text-[#1C6048] my-1 font-sans leading-none">
                  {formatNumber(data.opsMetrics.revPab, 1)} B
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Inflow Base
                </span>
              </div>
              {/* Metric 3 */}
              <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D8D8D8]/50 flex flex-col justify-between">
                <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-tight">
                  EBITDA / Bed
                </span>
                <p className="text-xl font-black text-[#1E2F31] my-1 font-sans leading-none">
                  {formatNumber(data.opsMetrics.ebitdaPerBed, 1)} B
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Operating Base
                </span>
              </div>
              {/* Metric 4 */}
              <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D8D8D8]/50 flex flex-col justify-between">
                <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-tight">
                  Fixed Cost %
                </span>
                <p className="text-xl font-black text-[#9B8B70] my-1 font-sans leading-none">
                  {formatNumber(data.opsMetrics.fixedCostPct, 1)}%
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Fixed vs Var
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3: Multi-Year Trajectory & Charts */}
        <div className="space-y-6 w-full flex flex-col justify-start">
          {/* Chart 1: Cash Flow Trajectory */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <h3 className="font-bold text-[#1E2F31] mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
              <BarChart3 size={16} className="text-[#1C6048]" /> Operating Trajectory
            </h3>
            <div className="h-64">
              <LazyResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.operatingData || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#D8D8D8"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                    tickFormatter={(val) => `${val}B`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#1E2F31" }}
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    allowEscapeViewBox={{ x: true, y: true }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val, name) =>
                      formatNumber(val, 1) +
                      (name === "Occupancy (BOR)" ? "%" : "B")
                    }
                  />
                  <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                  <Bar
                    yAxisId="left"
                    dataKey="totalRev"
                    name="Net Revenue"
                    fill="#1C6048"
                    radius={[4, 4, 0, 0]}
                    barSize={14}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="ebitda"
                    name="EBITDA"
                    stroke="#1E2F31"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: "#1E2F31",
                      strokeWidth: 1.5,
                      stroke: "#fff",
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="netIncome"
                    name="Net Income"
                    stroke="#9B8B70"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: "#9B8B70",
                      strokeWidth: 1.5,
                      stroke: "#fff",
                    }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bor"
                    name="Occupancy (BOR)"
                    stroke="#99B6AA"
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              </LazyResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Breakeven Audit */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <h3 className="font-bold text-[#1E2F31] mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Target size={16} className="text-[#99B6AA]" /> Breakeven Audit
            </h3>
            <div className="h-64">
              <LazyResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.operatingData || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#D8D8D8"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    allowEscapeViewBox={{ x: true, y: true }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val) => formatNumber(val, 1) + "%"}
                  />
                  <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />
                  <Bar
                    dataKey="breakEvenBor"
                    name="Breakeven BOR"
                    fill="#D8D8D8"
                    radius={[4, 4, 0, 0]}
                    barSize={14}
                  />
                  <Line
                    type="monotone"
                    dataKey="bor"
                    name="Projected BOR"
                    stroke="#1E2F31"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, strokeWidth: 1.5 }}
                  />
                </ComposedChart>
              </LazyResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
