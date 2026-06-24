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

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in">
        {/* LEFT PANEL: Executive & Returns (Spans 4 columns) */}
        <div className="space-y-6 lg:col-span-4 w-full">
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

          <div className="grid grid-cols-2 gap-4">
            <KPICard
              title="Project NPV"
              value={formatCurrency(data.projectNPV)}
              icon={<TrendingUp size={18} />}
              color="blue"
              subtitle={`@${String(assumptions.discountRate)}% Disc Rate`}
            />
            <KPICard
              title="Cash Multiple"
              value={`${data.totalEquity > 0 ? (data.totals.fcf / data.totalEquity).toFixed(2) : "0"}x`}
              icon={<BarChart3 size={18} />}
              color="emerald"
              subtitle="Project MOIC"
              tooltip={{
                desc: "Indicates absolute wealth creation. While IRR measures compounding speed over time, the Cash Multiple (MOIC) shows the absolute magnitude of your cash return. A typical healthcare infrastructure target is 2.5x - 3.0x+.",
                formula:
                  "Total Project Free Cash Flow ÷ Cumulative Partner Equity Invested",
              }}
            />
            <KPICard
              title="Project IRR"
              value={`${formatNumber((data.projectIRR || 0) * 100, 2)}%`}
              icon={<Activity size={18} />}
              color="blue"
              subtitle="Compounded Return"
            />
            <KPICard
              title="Avg Div. Yield"
              value={`${formatNumber(data.partnerA.avgYield, 1)}%`}
              icon={<Coins size={18} />}
              color="indigo"
              subtitle="Mean Operating Yield"
              tooltip={{
                desc: "The average annual cash distribution yield. It acts as the steady engine driving the overall Cash Multiple over the asset's lifecycle.",
                formula:
                  "Average of (Annual Cash Flow ÷ Invested Equity) across operating years",
              }}
            />
          </div>

          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] relative transition-all hover:shadow-md">
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
        </div>

        {/* RIGHT PANEL: Operations & Trajectory (Spans 8 columns) */}
        <div className="space-y-6 lg:col-span-8 w-full">
          {/* Unified Stabilization Scorecard Container (Option 2A) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D8D8D8] relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EFEBE7]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2F31] flex items-center gap-1.5 font-sans">
                <Activity size={15} className="text-[#1C6048]" /> Clinical
                Benchmarks at Stabilization
              </h3>
              <span className="text-[9px] text-[#9B8B70] font-mono bg-[#EFEBE7] px-2 py-0.5 rounded font-bold uppercase">
                Operational Peaks
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D8D8D8]/60">
              {/* Metric 1 */}
              <div className="flex flex-col justify-between p-2">
                <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-tight">
                  Stabilized Vol.
                </span>
                <p className="text-[22px] font-black text-[#1E2F31] my-1 font-sans">
                  {formatNumber(data.opsMetrics.stabilizedVolume, 0)}
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Peak Yr Patients
                </span>
              </div>
              {/* Metric 2 */}
              <div className="flex flex-col justify-between p-2 sm:pl-4 pt-4 sm:pt-2">
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
                <p className="text-[22px] font-black text-[#1C6048] my-1 font-sans">
                  {formatNumber(data.opsMetrics.revPab, 1)} B
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Inflow Base
                </span>
              </div>
              {/* Metric 3 */}
              <div className="flex flex-col justify-between p-2 sm:pl-4 pt-4 sm:pt-2">
                <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-tight">
                  EBITDA Per Bed
                </span>
                <p className="text-[22px] font-black text-[#1E2F31] my-1 font-sans">
                  {formatNumber(data.opsMetrics.ebitdaPerBed, 1)} B
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Operating Base
                </span>
              </div>
              {/* Metric 4 */}
              <div className="flex flex-col justify-between p-2 sm:pl-4 pt-4 sm:pt-2">
                <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-tight">
                  Fixed Cost Ratio
                </span>
                <p className="text-[22px] font-black text-[#9B8B70] my-1 font-sans">
                  {formatNumber(data.opsMetrics.fixedCostPct, 1)}%
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Fixed vs Var OPEX
                </span>
              </div>
            </div>
          </div>

          {/* Consolidated Blended Margins Card (Option 1B) */}
          <div className="bg-[#1C6048] p-5 rounded-2xl border border-[#164c39] shadow-md relative overflow-hidden group">
            {/* Ambient accent element */}
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 rounded-full bg-white/[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700" />

            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-sans">
                <Coins size={15} className="text-[#99B6AA]" /> Project Margins
              </h3>
              <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white tracking-normal font-semibold font-mono">
                Look-Through Metrics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* EBITDAR */}
              <div className="flex flex-col">
                <p className="text-[10px] text-[#EFEBE7]/80 font-bold uppercase tracking-wider mb-1 font-mono">
                  EBITDAR Margin
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-4xl font-black text-white leading-none font-sans">
                    {formatNumber(avgEbitdarMargin, 1)}%
                  </span>
                  <span className="text-[10px] text-[#EFEBE7]/60 font-mono">
                    Active Years Average
                  </span>
                </div>
              </div>

              {/* Net Profit */}
              <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                <p className="text-[10px] text-[#EFEBE7]/80 font-bold uppercase tracking-wider mb-1 font-mono">
                  Net Profit Margin
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-4xl font-black text-white leading-none font-sans">
                    {formatNumber(avgNetMargin, 1)}%
                  </span>
                  <span className="text-[10px] text-[#EFEBE7]/60 font-mono">
                    Active Years Average
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
              <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
                <BarChart3 size={18} className="text-[#1C6048]" /> Operating
                Cash Flow Trajectory
              </h3>
              <div className="h-72">
                <LazyResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.operatingData}>
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
                      barSize={18}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="ebitda"
                      name="EBITDA"
                      stroke="#1E2F31"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#1E2F31",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="netIncome"
                      name="Net Income"
                      stroke="#9B8B70"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#9B8B70",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bor"
                      name="Occupancy (BOR)"
                      stroke="#99B6AA"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </LazyResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
              <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
                <Target size={18} className="text-[#99B6AA]" /> Breakeven Audit
              </h3>
              <div className="h-72">
                <LazyResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.operatingData}>
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
                      name="Breakeven BOR required"
                      fill="#D8D8D8"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Line
                      type="monotone"
                      dataKey="bor"
                      name="Actual Projected BOR"
                      stroke="#1E2F31"
                      strokeWidth={3}
                      dot={{ r: 3, strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </LazyResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
