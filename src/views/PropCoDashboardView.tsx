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
  Landmark,
  Building2,
  Coins,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Map,
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
  useTooltip,
  KPITooltipIcon,
  LazyResponsiveContainer,
  TableRow,
  NavButton,
  MarkdownRenderer,
  DualKPICard,
  MiniKPICard,
  ExpandableCapexRow,
  TOOLTIP_STYLE,
  LEGEND_STYLE,
} from "../App";

export const PropCoDashboardView = memo(
  ({
    data,
    assumptions,
    generateTeaser,
    isTeaserLoading,
    showTeaser,
    setShowTeaser,
    teaserContent,
    setTab,
    isPresenting,
    propCoScenario = "manual",
    setPropCoScenario = (_val: any) => {},
    onChange,
    propCoLocked = false,
    holdCoLocked = false,
    toggleHoldCoLock = () => {},
  }) => {
    const totalIdc = useMemo(() => {
      if (!data?.annualData) return 0;
      return data.annualData
        .filter((d) => !d.isOperating)
        .reduce((acc, d) => acc + (d.interest || 0), 0);
    }, [data?.annualData]);

    const totalFundingRequired = useMemo(() => {
      return (data?.metrics?.totalCapex || 0) + totalIdc;
    }, [data?.metrics?.totalCapex, totalIdc]);

    const pieData = useMemo(() => {
      const leasedMedEq =
        assumptions.medEqProcurement === "lease"
          ? data.capexDetails.medEqCost
          : 0;
      return [
        { name: "Equity", value: data.metrics.totalEquity },
        { name: "Bank Loan", value: data.metrics.totalDebt },
        ...(totalIdc > 0 ? [{ name: "Capitalized IDC", value: totalIdc }] : []),
        ...(leasedMedEq > 0
          ? [{ name: "Equipment Lease", value: leasedMedEq }]
          : []),
      ];
    }, [
      data.metrics.totalEquity,
      data.metrics.totalDebt,
      data.capexDetails.medEqCost,
      assumptions.medEqProcurement,
      totalIdc,
    ]);

    const totalCapexOnly = useMemo(() => {
      if (!data?.capexDetails) return 0;
      return (
        (data.capexDetails.buildCost || 0) +
        (data.capexDetails.infraCost || 0) +
        (data.capexDetails.ffeCost || 0) +
        (data.capexDetails.sharingDevCost || 0) +
        (data.capexDetails.medEqCost || 0) +
        (data.capexDetails.consultantCost || 0) +
        (data.capexDetails.licenseCost || 0) +
        (data.capexDetails.vatCost || 0) +
        (data.capexDetails.contingencyCost || 0)
      );
    }, [data?.capexDetails]);

    const totalOpexOnly = useMemo(() => {
      if (!data?.capexDetails) return 0;
      return (
        (data.capexDetails.devGaCost || 0) +
        (data.capexDetails.devCarCost || 0)
      );
    }, [data?.capexDetails]);

    const [chartMode, setChartMode] = useState("full");
    const chartData =
      chartMode === "full" ? data.annualData : data.operatingData;
    const devYears = Math.max(
      1,
      Math.ceil((assumptions.devDurationMonths || 12) / 12),
    );

    const hasDebt = (assumptions?.includeFinancing ? assumptions?.ltv : 0) > 0;
    const hasLandCost = data.capexDetails && data.capexDetails.landCost > 0;

    let leveredIrrTooltip = "";
    let unleveredIrrTooltip = "";
    let irrExLandTooltip = "";

    if (!hasDebt && !hasLandCost) {
      leveredIrrTooltip =
        "Return on Equity.\n• Financing: Fully Equity\n• Land: Excluded";
      unleveredIrrTooltip =
        "Project Return (Pre-Financing). Assumes 100% Equity funding.\n• Financing: Unlevered (All Equity)\n• Land: Excluded";
      irrExLandTooltip =
        "Core Asset Return.\n• Financing: Unlevered\n• Structural Impact: No Land impact";
    } else if (!hasDebt && hasLandCost) {
      leveredIrrTooltip =
        "Return on Equity.\n• Financing: Fully Equity\n• Land: Included upfront";
      unleveredIrrTooltip =
        "Project Return (Pre-Financing). Assumes 100% Equity funding.\n• Financing: Unlevered (All Equity)\n• Land: Included upfront";
      irrExLandTooltip =
        "Core Asset Return.\n• Financing: Unlevered\n• Structural Impact: Land Cost stripped from capex & exit";
    } else if (hasDebt && hasLandCost) {
      leveredIrrTooltip =
        "Return on Equity.\n• Financing: Equity + Debt\n• Land: Included upfront";
      unleveredIrrTooltip =
        "Project Return (Pre-Financing). Assumes 100% Equity funding.\n• Financing: Unlevered (All Equity)\n• Land: Included upfront";
      irrExLandTooltip =
        "Core Asset Return.\n• Financing: Levered\n• Structural Impact: Land Cost stripped from capex & exit";
    } else if (hasDebt && !hasLandCost) {
      leveredIrrTooltip =
        "Return on Equity.\n• Financing: Equity + Debt\n• Land: Excluded";
      unleveredIrrTooltip =
        "Project Return (Pre-Financing). Assumes 100% Equity funding.\n• Financing: Unlevered (All Equity)\n• Land: Excluded";
      irrExLandTooltip =
        "Core Asset Return.\n• Financing: Levered\n• Structural Impact: No Land impact";
    }

    const { tooltipState: leveredTs, setTooltipState: setLeveredTs } = useTooltip(leveredIrrTooltip);
    const { tooltipState: unleveredTs, setTooltipState: setUnleveredTs } = useTooltip(unleveredIrrTooltip);
    const { tooltipState: exLandTs, setTooltipState: setExLandTs } = useTooltip(irrExLandTooltip);
    const { tooltipState: yieldTs, setTooltipState: setYieldTs } = useTooltip({
      desc: "The average annual cash distribution yield generated from PropCo's operations, reflecting the stable income generation capacity of the standalone infrastructure.",
      formula: "Average of (Annual Operating FCFE ÷ Total PropCo Equity) across operating years",
    });

    return (
      <div className="space-y-6 animate-in fade-in w-full max-w-full">
        {/* Top 4-Column Bento Section (12-Column Granular Bento Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 items-start w-full">
          {/* COLUMN 1: Executive, Exit Strategy & Toggles */}
          <div className="space-y-6 w-full flex flex-col justify-start md:col-span-1 xl:col-span-3">
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-[#D8D8D8]">
              <h2 className="text-sm font-bold text-[#1E2F31] ml-2">
                PropCo Executive Summary
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
              <div className="bg-white p-6 rounded-2xl border-l-4 border-l-[#9B8B70] shadow-sm relative">
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

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#D8D8D8] flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-2">
                  <Target
                    size={16}
                    className={
                      propCoLocked ? "text-[#1C6048]/50" : "text-[#1C6048]"
                    }
                  />{" "}
                  PropCo Asset Exit Strategy
                  {propCoLocked && (
                    <span className="inline-flex items-center gap-1.5 text-[9px] bg-[#EFEBE7] text-[#9B8B70] px-2 py-0.5 rounded-full font-bold border border-[#D8D8D8]">
                      <Lock size={10} /> Locked to Master
                    </span>
                  )}
                </h3>
                <p className="text-[9px] text-[#4C4A4B] mt-1 font-medium leading-relaxed">
                  {propCoLocked
                    ? "Property exit strategy is locked to follow the Master (HoldCo) Exit. Deselect 'Lock PropCo to Master' in Global Settings or Consolidated Dashboard to override manually."
                    : "Configure standalone property-level holding horizons and exit scenarios purely driven by PropCo covenants and asset yields."}
                </p>
              </div>
              <div
                className={`flex flex-wrap gap-1.5 mt-1 ${propCoLocked ? "pointer-events-none opacity-85" : ""}`}
              >
                <div className="flex-1 min-w-[100px] relative group flex flex-col justify-start">
                  <button
                    disabled={propCoLocked}
                    onClick={() => setPropCoScenario("manual")}
                    className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      propCoLocked
                        ? propCoScenario === "manual"
                          ? "bg-[#EFEBE7]/80 border border-[#D8D8D8] text-[#1E2F31]/70"
                          : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                        : propCoScenario === "manual"
                          ? "bg-white shadow-sm border border-[#D8D8D8] text-[#1E2F31]"
                          : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                    }`}
                  >
                    Manual (Settings)
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                    {propCoLocked
                      ? "Locked to Master HoldCo exit strategy"
                      : "Uses the exit settings defined in PropCo assumptions"}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
                  </div>
                </div>

                <div className="flex-1 min-w-[100px] relative group flex">
                  <button
                    disabled={propCoLocked}
                    onClick={() => setPropCoScenario("yr10")}
                    className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      propCoLocked
                        ? propCoScenario === "yr10"
                          ? "bg-[#1E2F31]/15 text-[#1E2F31]/70 border border-[#1E2F31]/20"
                          : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                        : propCoScenario === "yr10"
                          ? "bg-[#1E2F31] shadow-sm border border-[#1E2F31] text-white"
                          : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                    }`}
                  >
                    Exit in Yr 10
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                    {propCoLocked
                      ? "Locked to Master HoldCo exit strategy"
                      : "Forces the exit on Year 10"}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
                  </div>
                </div>

                <div className="flex-1 min-w-[100px] relative group flex">
                  <button
                    disabled={propCoLocked}
                    onClick={() => setPropCoScenario("breakeven")}
                    className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      propCoLocked
                        ? propCoScenario === "breakeven"
                          ? "bg-[#1C6048]/15 text-[#1C6048]/70 border border-[#1C6048]/20"
                          : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                        : propCoScenario === "breakeven"
                          ? "bg-[#1C6048] shadow-sm border border-[#1C6048] text-white"
                          : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                    }`}
                  >
                    Exit at Breakeven
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                    {propCoLocked
                      ? "Locked to Master HoldCo exit strategy"
                      : "Exits at the end of the year standalone PropCo achieves cumulative equity cash flow breakeven"}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
                  </div>
                </div>

                <div className="flex-1 min-w-[100px] relative group flex">
                  <button
                    disabled={propCoLocked || !assumptions?.includeFinancing}
                    onClick={() => setPropCoScenario("debt_free")}
                    className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      !assumptions?.includeFinancing
                        ? "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed border border-[#E5E7EB]"
                        : propCoLocked
                          ? propCoScenario === "debt_free"
                            ? "bg-[#9B8B70]/15 text-[#9B8B70]/70 border border-[#9B8B70]/20"
                            : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                          : propCoScenario === "debt_free"
                            ? "bg-[#9B8B70] shadow-sm border border-[#9B8B70] text-white"
                            : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                    }`}
                  >
                    Exit Post-Debt
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                    {!assumptions?.includeFinancing
                      ? "Requires loan financing to be enabled"
                      : propCoLocked
                        ? "Locked to Master HoldCo exit strategy"
                        : "Exits only after PropCo reaches breakeven and PropCo debt is fully repaid"}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
                  </div>
                </div>

                <div className="flex-1 min-w-[100px] relative group flex">
                  <button
                    disabled={propCoLocked}
                    onClick={() => setPropCoScenario("none")}
                    className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      propCoLocked
                        ? propCoScenario === "none"
                          ? "bg-[#1C6048]/10 text-[#1C6048]/70 border border-[#1C6048]/20"
                          : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                        : propCoScenario === "none"
                          ? "bg-white shadow-sm border border-[#1C6048] text-[#1C6048]"
                          : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                    }`}
                  >
                    No Exit (Yield)
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                    {propCoLocked
                      ? "Locked to Master HoldCo exit strategy"
                      : "No exit is calculated; evaluates pure operating yields over 30 years"}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
                  </div>
                </div>
              </div>

              {/* Assumptions Toggles Grid */}
              {onChange && (
                <>
                  <hr className="border-t border-[#D8D8D8]/50 my-2" />
                  <div className="grid grid-cols-1 gap-2 pt-1 w-full">
                    {/* Bank Debt Financing Toggle */}
                    <div className="flex items-center justify-between bg-[#F9F8F6] px-3 py-2 rounded-xl border border-[#D8D8D8]/40 hover:border-[#1C6048]/20 transition-all">
                      <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5 leading-tight">
                        <Landmark size={13} className="text-[#9B8B70] shrink-0" />{" "}
                        Bank Debt Financing
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={assumptions?.includeFinancing || false}
                          onChange={(e) =>
                            onChange("includeFinancing", e.target.checked)
                          }
                        />
                        <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
                      </label>
                    </div>

                    {/* Include Land Cost Toggle */}
                    <div className="flex items-center justify-between bg-[#F9F8F6] px-3 py-2 rounded-xl border border-[#D8D8D8]/40 hover:border-[#1C6048]/20 transition-all">
                      <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5 leading-tight">
                        <Map size={13} className="text-[#9B8B70] shrink-0" />{" "}
                        Include Land Cost
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={assumptions?.includeLand ?? true}
                          onChange={(e) =>
                            onChange("includeLand", e.target.checked)
                          }
                        />
                        <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
                      </label>
                    </div>

                    {/* Lock Master to PropCo toggle */}
                    <div className="flex items-center justify-between bg-[#F9F8F6] px-3 py-2 rounded-xl border border-[#D8D8D8]/40 hover:border-[#1C6048]/20 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5 leading-tight">
                          <Lock
                            size={13}
                            className={
                              holdCoLocked
                                ? "text-[#1C6048] shrink-0"
                                : "text-[#9B8B70] shrink-0"
                            }
                          />{" "}
                          Lock Master to PropCo
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={holdCoLocked}
                          onChange={toggleHoldCoLock}
                        />
                        <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* COLUMN 2: Underwriting Return Dashboard */}
          <div className="space-y-6 w-full flex flex-col justify-start md:col-span-1 xl:col-span-3">
            {/* Unified Underwriting Return Dashboard */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#D8D8D8] relative overflow-visible transition-all hover:shadow-md">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-4 pb-1.5 border-b border-[#EFEBE7]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2F31] flex items-center gap-1.5 font-sans">
                  <Coins size={14} className="text-[#1C6048]" /> Return Executive Dashboard
                </h3>
                <span className="text-[9px] text-[#1C6048] font-mono bg-[#EFEBE7] px-2 py-0.5 rounded font-bold uppercase">
                  PropCo IRR & NPV
                </span>
              </div>

              {/* 4-Column Mini-Bento Grid with Perfect Vertical Alignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                
                {/* Card 1: Levered (Equity Focused) */}
                <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D8D8D8]/70 flex flex-col justify-between transition-all hover:border-[#1C6048]/50 hover:bg-white shadow-xs">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-1 h-5 mb-2">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#1C6048] font-sans truncate whitespace-nowrap">
                        <Activity size={12} className="text-[#1C6048] shrink-0" /> Levered
                      </span>
                      <div className="shrink-0">
                        <KPITooltipIcon
                          tooltip={leveredIrrTooltip}
                          tooltipState={leveredTs}
                          setTooltipState={setLeveredTs}
                        />
                      </div>
                    </div>

                    {/* Primary Metric: Levered IRR */}
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-[#1C6048] font-sans tracking-tight leading-none whitespace-nowrap">
                        {formatNumber((data.metrics.irr || 0) * 100, 2)}%
                      </span>
                      <span className="text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-wider mt-1 font-mono whitespace-nowrap">
                        Levered IRR
                      </span>
                    </div>
                  </div>

                  {/* Separator Divider */}
                  <div className="w-full h-px bg-[#D8D8D8]/60 my-2.5"></div>

                  {/* Secondary Metric: Equity NPV */}
                  <div className="flex flex-col">
                    <span className="text-base font-black text-[#1E2F31] font-sans tracking-tight leading-none whitespace-nowrap">
                      {formatCurrency(data.metrics.npv)}
                    </span>
                    <span className="text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-wider mt-1 font-mono whitespace-nowrap">
                      Equity NPV
                    </span>
                  </div>
                </div>

                {/* Card 2: Unlevered (Asset Focused) */}
                <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D8D8D8]/70 flex flex-col justify-between transition-all hover:border-[#1C6048]/50 hover:bg-white shadow-xs">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-1 h-5 mb-2">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#1E2F31] font-sans truncate whitespace-nowrap">
                        <Building2 size={12} className="text-[#1C6048] shrink-0" /> Unlevered
                      </span>
                      <div className="shrink-0">
                        <KPITooltipIcon
                          tooltip={unleveredIrrTooltip}
                          tooltipState={unleveredTs}
                          setTooltipState={setUnleveredTs}
                        />
                      </div>
                    </div>

                    {/* Primary Metric: Unlevered IRR */}
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-[#1E2F31] font-sans tracking-tight leading-none whitespace-nowrap">
                        {formatNumber((data.metrics.unleveredIrr || 0) * 100, 2)}%
                      </span>
                      <span className="text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-wider mt-1 font-mono whitespace-nowrap">
                        Unlevered IRR
                      </span>
                    </div>
                  </div>

                  {/* Separator Divider */}
                  <div className="w-full h-px bg-[#D8D8D8]/60 my-2.5"></div>

                  {/* Secondary Metric: Project NPV */}
                  <div className="flex flex-col">
                    <span className="text-base font-black text-[#1E2F31] font-sans tracking-tight leading-none whitespace-nowrap">
                      {formatCurrency(data.metrics.unleveredNpv)}
                    </span>
                    <span className="text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-wider mt-1 font-mono whitespace-nowrap">
                      Project NPV
                    </span>
                  </div>
                </div>

                {/* Card 3: Unlevered ex-Land (Core Asset) */}
                <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D8D8D8]/70 flex flex-col justify-between transition-all hover:border-[#1C6048]/50 hover:bg-white shadow-xs">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-1 h-5 mb-2">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#1E2F31] font-sans truncate whitespace-nowrap">
                        <TrendingUp size={12} className="text-[#1C6048] shrink-0" /> Ex-Land
                      </span>
                      <div className="shrink-0">
                        <KPITooltipIcon
                          tooltip={irrExLandTooltip}
                          tooltipState={exLandTs}
                          setTooltipState={setExLandTs}
                        />
                      </div>
                    </div>

                    {/* Primary Metric: IRR ex-Land */}
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-[#1E2F31] font-sans tracking-tight leading-none whitespace-nowrap">
                        {formatNumber((data.metrics.irrExLand || 0) * 100, 2)}%
                      </span>
                      <span className="text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-wider mt-1 font-mono whitespace-nowrap">
                        IRR (ex-Land)
                      </span>
                    </div>
                  </div>

                  {/* Separator Divider */}
                  <div className="w-full h-px bg-[#D8D8D8]/60 my-2.5"></div>

                  {/* Secondary Metric: NPV ex-Land */}
                  <div className="flex flex-col">
                    <span className="text-base font-black text-[#1E2F31] font-sans tracking-tight leading-none whitespace-nowrap">
                      {formatCurrency(data.metrics.npvExLand)}
                    </span>
                    <span className="text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-wider mt-1 font-mono whitespace-nowrap">
                      NPV (ex-Land)
                    </span>
                  </div>
                </div>

                {/* Card 4: Standalone Yields & YOC */}
                <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D8D8D8]/70 flex flex-col justify-between transition-all hover:border-[#1C6048]/50 hover:bg-white shadow-xs">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-1 h-5 mb-2">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#9B8B70] font-sans truncate whitespace-nowrap">
                        <Coins size={12} className="text-[#9B8B70] shrink-0" /> Yields & YOC
                      </span>
                      <div className="shrink-0">
                        <KPITooltipIcon
                          tooltip={{
                            desc: "The average annual cash distribution yield generated from PropCo's operations, reflecting the stable income generation capacity of the standalone infrastructure.",
                            formula: "Average of (Annual Operating FCFE ÷ Total PropCo Equity) across operating years",
                          }}
                          tooltipState={yieldTs}
                          setTooltipState={setYieldTs}
                        />
                      </div>
                    </div>

                    {/* Primary Metric: Avg Cash Yield */}
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-[#9B8B70] font-sans tracking-tight leading-none whitespace-nowrap">
                        {formatNumber(data.metrics.avgYield, 1)}%
                      </span>
                      <span className="text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-wider mt-1 font-mono whitespace-nowrap">
                        Avg Cash Yield
                      </span>
                    </div>
                  </div>

                  {/* Separator Divider */}
                  <div className="w-full h-px bg-[#D8D8D8]/60 my-2.5"></div>

                  {/* Secondary Metric: YOC ex-Land */}
                  <div className="flex flex-col">
                    <span className="text-base font-black text-[#9B8B70] font-sans tracking-tight leading-none whitespace-nowrap">
                      {formatNumber((data.metrics.yocExLand || 0) * 100, 1)}%
                    </span>
                    <span className="text-[9px] text-[#4C4A4B]/60 font-bold uppercase tracking-wider mt-1 font-mono whitespace-nowrap">
                      YOC (ex-Land)
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* COLUMN 3: Underwriting Metrics Bento */}
          <div className="space-y-6 w-full flex flex-col justify-start md:col-span-1 xl:col-span-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#D8D8D8] w-full flex flex-col justify-start min-h-full">
              {/* Metric Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EFEBE7]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2F31] flex items-center gap-1.5 font-sans">
                  <Activity size={14} className="text-[#1C6048]" /> Key Metrics
                </h3>
              </div>
              
              {/* Mini KPIs Dashboard Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <MiniKPICard
                  title="Equity Payback"
                  value={
                    data.metrics.payback > 0
                      ? `${formatNumber(Math.max(0, data.metrics.payback - devYears), 1)} Yrs`
                      : "Never"
                  }
                  subtitle="From Operations"
                />
                <MiniKPICard
                  title="Op. Payback"
                  value={
                    data.metrics.operatingPayback > 0
                      ? `${formatNumber(Math.max(0, data.metrics.operatingPayback - devYears), 1)} Yrs`
                      : "Never"
                  }
                  subtitle="From Operations"
                />
                <MiniKPICard
                  title="Avg DSCR"
                  value={`${formatNumber(data.metrics.avgDscr, 2)}x`}
                  subtitle="Debt Coverage"
                  tooltip="Debt Service Coverage Ratio (EBITDA / Total Debt Service). Measures the ability to pay debt obligations. Average over the loan tenor. Benchmark: > 1.25x is standard."
                  disabled={!assumptions?.includeFinancing}
                />
                <MiniKPICard
                  title="Min DSCR"
                  value={`${formatNumber(data.metrics.minDscr, 2)}x`}
                  subtitle="Lowest Coverage"
                  tooltip="The lowest DSCR value over the loan tenor. Benchmark: Must remain > 1.25x to satisfy standard covenants. < 1.0x indicates projected default."
                  disabled={!assumptions?.includeFinancing}
                />
                <MiniKPICard
                  title="Cost per Bed"
                  value={`${formatCurrency(data.metrics.costPerBed)}`}
                  subtitle="Total / Beds"
                />
                <MiniKPICard
                  title="Cost per Sqm"
                  value={`${formatNumber(data.metrics.costPerSqm, 1)} M`}
                  subtitle="Total / Sqm"
                />
              </div>
            </div>
          </div>

          {/* COLUMN 4: Capital Allocation (Sources & Uses) */}
          <div className="space-y-6 w-full flex flex-col justify-start md:col-span-1 xl:col-span-3">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D8D8D8]">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#EFEBE7]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2F31] flex items-center gap-1.5 font-sans">
                  <DollarSign size={16} className="text-[#1C6048]" /> Sources & Uses
                </h3>
                <button
                  onClick={() => setTab("assumptions")}
                  className="text-[9px] bg-[#EFEBE7] hover:bg-[#D8D8D8] text-[#4C4A4B] font-bold px-2 py-0.5 rounded transition-colors uppercase"
                >
                  Edit
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {/* Sources Pie Section */}
                <div>
                  <h4 className="text-center text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-1">
                    Sources Allocation
                  </h4>
                  <div className="w-full h-32 relative flex justify-center">
                    <LazyResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart style={{ outline: "none" }}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                          className="outline-none focus:outline-none"
                          stroke="none"
                        >
                          {pieData.map((entry, index) => {
                            let fillColor = "#D8D8D8";
                            if (entry.name === "Equity") fillColor = "#1C6048";
                            if (entry.name === "Capitalized IDC") fillColor = "#99B6AA";
                            if (entry.name === "Equipment Lease") fillColor = "#9B8B70";
                            return (
                              <Cell
                                key={`cell-src-${index}`}
                                fill={fillColor}
                                className="outline-none focus:outline-none"
                              />
                            );
                          })}
                        </Pie>
                      </RechartsPieChart>
                    </LazyResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xs font-black text-[#1E2F31]">
                        {formatNumber(totalFundingRequired, 0)}B
                      </span>
                    </div>
                  </div>

                  <div
                    className="w-full grid gap-1.5 mt-2 text-center"
                    style={{ gridTemplateColumns: `repeat(${pieData.length}, minmax(0, 1fr))` }}
                  >
                    <div className="bg-[#EFEBE7] p-1.5 rounded border border-[#D8D8D8]">
                      <p className="text-[8px] font-bold uppercase text-[#4C4A4B] leading-none mb-1">
                        Equity
                      </p>
                      <p className="font-black text-[11px] text-[#1E2F31] leading-none">
                        {formatCurrency(
                          Math.abs(
                            data.annualData
                              .filter((d) => !d.isOperating)
                              .reduce((acc, d) => acc + (d.fcfe || 0), 0),
                          ),
                        )}
                      </p>
                    </div>
                    <div className="bg-[#D8D8D8]/30 p-1.5 rounded border border-[#D8D8D8]">
                      <p className="text-[8px] font-bold uppercase text-[#4C4A4B] leading-none mb-1">
                        Loan
                      </p>
                      <p className="font-black text-[11px] text-[#1E2F31] leading-none">
                        {formatCurrency(data.metrics.totalDebt)}
                      </p>
                    </div>
                    {totalIdc > 0 && (
                      <div className="bg-[#99B6AA]/10 p-1.5 rounded border border-[#D8D8D8]">
                        <p className="text-[8px] font-bold uppercase text-[#1C6048] leading-none mb-1">
                          IDC
                        </p>
                        <p className="font-black text-[11px] text-[#1C6048] leading-none">
                          {formatCurrency(totalIdc)}
                        </p>
                      </div>
                    )}
                    {assumptions.medEqProcurement === "lease" &&
                      data.capexDetails.medEqCost > 0 && (
                        <div className="bg-[#9B8B70]/10 p-1.5 rounded border border-[#D8D8D8]">
                          <p className="text-[8px] font-bold uppercase text-[#9B8B70] leading-none mb-1">
                            Lease
                          </p>
                          <p className="font-black text-[11px] text-[#1E2F31] leading-none">
                            {formatCurrency(data.capexDetails.medEqCost)}
                          </p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Uses breakdown table */}
                <div>
                  <h4 className="text-center text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-2 border-t border-[#D8D8D8]/50 pt-3">
                    Uses Breakdown
                  </h4>
                  <div className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#D8D8D8] space-y-3">
                    
                    {/* LAND ACQUISITION SECTION */}
                    {data.capexDetails.landCost > 0 && (
                      <div>
                        <div className="text-[8px] font-bold text-[#9B8B70] uppercase tracking-widest mb-1 px-1 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9B8B70]"></span>
                            Land Acquisition
                          </div>
                          <span className="font-mono text-[9px] font-extrabold text-[#9B8B70]">
                            {formatNumber(data.capexDetails.landCost, 1)} B
                          </span>
                        </div>
                        <ExpandableCapexRow
                          icon={<Map size={16} className="text-[#9B8B70]" />}
                          title="Land Acquisition"
                          amount={data.capexDetails.landCost}
                          totalCapex={totalFundingRequired}
                        />
                      </div>
                    )}

                    {/* CAPITAL EXPENDITURES SECTION */}
                    <div className="pt-1.5 border-t border-[#D8D8D8]/50">
                      <div className="text-[8px] font-bold text-[#1C6048] uppercase tracking-widest mb-1 px-1 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                          CapEx
                        </div>
                        <span className="font-mono text-[9px] font-extrabold text-[#1C6048]">
                          {formatNumber(totalCapexOnly, 1)} B
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <ExpandableCapexRow
                          icon={<Building2 size={16} className="text-[#1E2F31]" />}
                          title="Hard Costs"
                          amount={
                            data.capexDetails.buildCost +
                            data.capexDetails.infraCost +
                            data.capexDetails.ffeCost +
                            data.capexDetails.sharingDevCost
                          }
                          totalCapex={totalFundingRequired}
                          details={[
                            {
                              label: "Construction",
                              amount: data.capexDetails.buildCost,
                            },
                            {
                              label: "Infrastructure",
                              amount: data.capexDetails.infraCost,
                            },
                            { label: "FF&E", amount: data.capexDetails.ffeCost },
                            {
                              label: "Sharing Dev.",
                              amount: data.capexDetails.sharingDevCost,
                            },
                          ].filter((d) => d.amount > 0)}
                        />
                        
                        {data.capexDetails.medEqCost > 0 && (
                          <ExpandableCapexRow
                            icon={<Activity size={16} className="text-[#1C6048]" />}
                            title="Medical Equipment"
                            amount={data.capexDetails.medEqCost}
                            totalCapex={totalFundingRequired}
                          />
                        )}

                        <ExpandableCapexRow
                          icon={<Briefcase size={16} className="text-[#99B6AA]" />}
                          title="Soft Costs"
                          amount={
                            data.capexDetails.consultantCost +
                            data.capexDetails.licenseCost +
                            data.capexDetails.vatCost +
                            data.capexDetails.contingencyCost
                          }
                          totalCapex={totalFundingRequired}
                          details={[
                            {
                              label: "Consulting & Design",
                              amount: data.capexDetails.consultantCost,
                            },
                            {
                              label: "Licenses & Permits",
                              amount: data.capexDetails.licenseCost,
                            },
                            { label: "VAT", amount: data.capexDetails.vatCost },
                            {
                              label: "Contingency",
                              amount: data.capexDetails.contingencyCost,
                            },
                          ].filter((d) => d.amount > 0)}
                        />
                      </div>
                    </div>

                    {/* PRE-OPERATING OPEX SECTION */}
                    {(data.capexDetails.devGaCost > 0 || data.capexDetails.devCarCost > 0) && (
                      <div className="pt-1.5 border-t border-[#D8D8D8]/50">
                        <div className="text-[8px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-1 px-1 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4C4A4B]"></span>
                            OpEx
                          </div>
                          <span className="font-mono text-[9px] font-extrabold text-[#4C4A4B]">
                            {formatNumber(totalOpexOnly, 1)} B
                          </span>
                        </div>
                        <ExpandableCapexRow
                          icon={<FileText size={16} className="text-[#4C4A4B]" />}
                          title="Pre-op Costs"
                          amount={
                            data.capexDetails.devGaCost +
                            data.capexDetails.devCarCost
                          }
                          totalCapex={totalFundingRequired}
                          details={[
                            {
                              label: "Dev. G&A (Start-up Admin)",
                              amount: data.capexDetails.devGaCost,
                            },
                            {
                              label: "Dev. CAR (Project Insurance)",
                              amount: data.capexDetails.devCarCost,
                            },
                          ].filter((d) => d.amount > 0)}
                        />
                      </div>
                    )}

                    {/* INTEREST DURING CONSTRUCTION */}
                    {totalIdc > 0 && (
                      <div className="pt-1.5 border-t border-[#D8D8D8]/50">
                        <div className="text-[8px] font-bold text-[#9B8B70] uppercase tracking-widest mb-1 px-1 flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9B8B70]"></span>
                            Financing Cost
                          </div>
                          <span className="font-mono text-[9px] font-extrabold text-[#9B8B70]">
                            {formatNumber(totalIdc, 1)} B
                          </span>
                        </div>
                        <ExpandableCapexRow
                          icon={<Coins size={16} className="text-[#9B8B70]" />}
                          title="Interest During Construction (IDC)"
                          amount={totalIdc}
                          totalCapex={totalFundingRequired}
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-[#D8D8D8] px-2">
                      <span className="text-[9px] font-black text-[#1E2F31] uppercase tracking-wider">
                        Total Funding Required
                      </span>
                      <span className="font-mono text-xs font-black text-[#1C6048]">
                        {formatNumber(totalFundingRequired, 1)} B
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: Full-Width Trajectory Chart (To preserve lifecycle fidelity over 30 years) */}
        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
              <BarChart3 size={18} className="text-[#9B8B70]" /> PropCo Cash Flow Trajectory
            </h3>
            <div className="flex bg-[#EFEBE7] p-1 rounded-lg border border-[#D8D8D8]">
              <button
                onClick={() => setChartMode("full")}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartMode === "full" ? "bg-white shadow-sm text-[#1E2F31]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
              >
                Full Lifecycle
              </button>
              <button
                onClick={() => setChartMode("operating")}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartMode === "operating" ? "bg-white shadow-sm text-[#1E2F31]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
              >
                Operating Only
              </button>
            </div>
          </div>
          <div className="h-96">
            <LazyResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData || []}>
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
                  tickFormatter={(val) => `${val}B`}
                />
                <Tooltip
                  allowEscapeViewBox={{ x: true, y: true }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(val) => formatNumber(val, 1) + "B"}
                />
                <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                <Bar
                  yAxisId="left"
                  dataKey="ebitda"
                  name="EBITDA (NOI)"
                  fill="#9B8B70"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="fcfe"
                  name="FCFE"
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
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumFcfe"
                  name="Cumulative FCFE"
                  stroke="#1C6048"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </LazyResponsiveContainer>
          </div>
        </div>
      </div>
    );
  },
);
