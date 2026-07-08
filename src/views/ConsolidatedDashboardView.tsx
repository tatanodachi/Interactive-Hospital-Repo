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
  Landmark,
  BarChart3,
  ShieldCheck,
  Layers,
  Map,
  AlertCircle,
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
  ReferenceLine,
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
  KPICard,
  TOOLTIP_STYLE,
  LEGEND_STYLE,
} from "../App";

export const ConsolidatedDashboardView = memo(
  ({
    data,
    opcoData,
    propcoData,
    assumptions,
    propCoAssumptions,
    handlePropCoChange,
    holdCoAssumptions,
    handleHoldCoChange,
    isPresenting,
    holdCoScenario,
    setHoldCoScenario,
    holdCoLocked,
    toggleHoldCoLock,
    propCoLocked,
    togglePropCoLock,
  }) => {
    const debtTotals = useMemo(() => {
      let pDebtDraw = 0, holdCoDebtDraw = 0, ltDebtDraw = 0;
      let pDebtPrincipal = 0, holdCoPrincipal = 0, ltDebtPrincipal = 0;
      let pDebtInterest = 0, holdCoInterest = 0, ltDebtInterest = 0;
      let pLoanSettledAtExit = 0;
      let pCapitalizedInterest = 0;
      let holdCoAllocatedToPropCo = 0;
      let holdCoAllocatedToOpCo = 0;

      data.annualData.forEach((d, i) => {
        const pY = propcoData?.annualData[i] || {};
        
        const pdD = pY.debtDraw || 0;
        const pdP = pY.principal || 0;
        const pdI = pY.interest || 0;
        const pSettled = pY.loanSettledAtExit || 0;
        
        // During development, interest is capitalized if not cash pay
        const isCashPayIdc = (propcoData?.assumptions?.idcTreatment || "cash_pay") === "cash_pay";
        if (!pY.isOperating && !isCashPayIdc) {
            pCapitalizedInterest += pdI;
        }
        
        const hdD = d.holdCoDebtDraw || 0;
        const hdP = d.holdCoPrincipal || 0;
        const hdI = d.holdCoInterest || 0;
        
        pDebtDraw += pdD;
        pDebtPrincipal += pdP;
        pDebtInterest += pdI;
        pLoanSettledAtExit += pSettled;
        
        holdCoDebtDraw += hdD;
        holdCoPrincipal += hdP;
        holdCoInterest += hdI;
        
        ltDebtDraw += (pdD + hdD);
        ltDebtPrincipal += (pdP + hdP + pSettled);
        ltDebtInterest += (pdI + hdI);

        // Calculate month-by-month distribution of HoldCo draws
        if (d.monthly && d.monthly.holdCoDebtDraw) {
          for (let m = 0; m < 12; m++) {
            const mDraw = d.monthly.holdCoDebtDraw[m] || 0;
            if (mDraw > 0) {
              const mPropFlow = d.monthly.propCoFlow ? d.monthly.propCoFlow[m] || 0 : 0;
              const mOpFlow = d.monthly.opCoFlow ? d.monthly.opCoFlow[m] || 0 : 0;
              
              const propCoOutlay = Math.max(0, -mPropFlow);
              const opCoOutlay = Math.max(0, -mOpFlow);
              const totalOutlay = propCoOutlay + opCoOutlay;
              
              if (totalOutlay > 0) {
                holdCoAllocatedToPropCo += mDraw * (propCoOutlay / totalOutlay);
                holdCoAllocatedToOpCo += mDraw * (opCoOutlay / totalOutlay);
              } else {
                holdCoAllocatedToPropCo += mDraw * 0.5;
                holdCoAllocatedToOpCo += mDraw * 0.5;
              }
            }
          }
        } else {
          const yPropFlow = d.propCoFlow || 0;
          const yOpFlow = d.opCoFlow || 0;
          const propCoOutlay = Math.max(0, -yPropFlow);
          const opCoOutlay = Math.max(0, -yOpFlow);
          const totalOutlay = propCoOutlay + opCoOutlay;
          if (totalOutlay > 0) {
            holdCoAllocatedToPropCo += hdD * (propCoOutlay / totalOutlay);
            holdCoAllocatedToOpCo += hdD * (opCoOutlay / totalOutlay);
          } else {
            holdCoAllocatedToPropCo += hdD * 0.5;
            holdCoAllocatedToOpCo += hdD * 0.5;
          }
        }
      });

      return {
        pDebtDraw, pDebtPrincipal, pDebtInterest, pLoanSettledAtExit, pCapitalizedInterest,
        holdCoDebtDraw, holdCoPrincipal, holdCoInterest,
        ltDebtDraw, ltDebtPrincipal, ltDebtInterest,
        holdCoAllocatedToPropCo, holdCoAllocatedToOpCo
      };
    }, [data.annualData, propcoData]);

    return (
      <div
        className={
          isPresenting
            ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in"
            : "space-y-6 animate-in fade-in"
        }
      >
        <div className={`space-y-6 ${isPresenting ? "lg:col-span-4" : ""}`}>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#D8D8D8] flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-2">
              <Target
                size={16}
                className={
                  holdCoLocked ? "text-[#1C6048]/50" : "text-[#1C6048]"
                }
              />{" "}
              Master Exit Strategy
              {holdCoLocked && (
                <span className="inline-flex items-center gap-1.5 text-[9px] bg-[#EFEBE7] text-[#9B8B70] px-2 py-0.5 rounded-full font-bold border border-[#D8D8D8]">
                  <Lock size={10} /> Locked to PropCo
                </span>
              )}
            </h3>
            <p className="text-[9px] text-[#4C4A4B] mt-1 font-medium leading-relaxed">
              {holdCoLocked
                ? "Locked to follow the PropCo Exit scenario. Deselect 'Lock Master to PropCo' below to override manually."
                : "Override individual security and entity settings to simulate combined Master exits and long-term portfolio yields."}
            </p>
          </div>
          <div
            className={`flex flex-wrap gap-1.5 mt-1 ${holdCoLocked ? "pointer-events-none opacity-85" : ""}`}
          >
            <div className="flex-1 min-w-[100px] relative group flex">
              <button
                disabled={holdCoLocked}
                onClick={() => setHoldCoScenario("manual")}
                className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  holdCoLocked
                    ? holdCoScenario === "manual"
                      ? "bg-[#EFEBE7]/80 border border-[#D8D8D8] text-[#1E2F31]/70"
                      : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                    : holdCoScenario === "manual"
                      ? "bg-white shadow-sm border border-[#D8D8D8] text-[#1E2F31]"
                      : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                Manual (Settings)
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                {holdCoLocked
                  ? "Locked to PropCo exit strategy"
                  : "Uses the exit settings defined in the project assumptions"}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
              </div>
            </div>

            <div className="flex-1 min-w-[100px] relative group flex">
              <button
                disabled={holdCoLocked}
                onClick={() => setHoldCoScenario("yr10")}
                className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  holdCoLocked
                    ? holdCoScenario === "yr10"
                      ? "bg-[#1E2F31]/15 text-[#1E2F31]/70 border border-[#1E2F31]/20"
                      : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                    : holdCoScenario === "yr10"
                      ? "bg-[#1E2F31] shadow-sm border border-[#1E2F31] text-white"
                      : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                Exit in Yr 10
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                {holdCoLocked
                  ? "Locked to PropCo exit strategy"
                  : "Forces the exit to occur exactly at the end of Year 10"}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
              </div>
            </div>

            <div className="flex-1 min-w-[100px] relative group flex">
              <button
                disabled={holdCoLocked}
                onClick={() => setHoldCoScenario("breakeven")}
                className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  holdCoLocked
                    ? holdCoScenario === "breakeven"
                      ? "bg-[#1C6048]/15 text-[#1C6048]/70 border border-[#1C6048]/20"
                      : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                    : holdCoScenario === "breakeven"
                      ? "bg-[#1C6048] shadow-sm border border-[#1C6048] text-white"
                      : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                Exit at Breakeven
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                {holdCoLocked
                  ? "Locked to PropCo exit strategy"
                  : "Exits at the end of the year the project achieves operational breakeven"}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
              </div>
            </div>

            <div className="flex-1 min-w-[100px] relative group flex">
              <button
                onClick={() => setHoldCoScenario("debt_free")}
                disabled={
                  holdCoLocked ||
                  (!propCoAssumptions?.includeFinancing &&
                    !holdCoAssumptions?.includeFinancing)
                }
                className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  !propCoAssumptions?.includeFinancing &&
                  !holdCoAssumptions?.includeFinancing
                    ? "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed border border-[#E5E7EB]"
                    : holdCoLocked
                      ? holdCoScenario === "debt_free"
                        ? "bg-[#9B8B70]/15 text-[#9B8B70]/70 border border-[#9B8B70]/20"
                        : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                      : holdCoScenario === "debt_free"
                        ? "bg-[#9B8B70] shadow-sm border border-[#9B8B70] text-white"
                        : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                Exit Post-Debt
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                {!propCoAssumptions?.includeFinancing &&
                !holdCoAssumptions?.includeFinancing
                  ? "Requires debt financing to be enabled"
                  : holdCoLocked
                    ? "Locked to PropCo exit strategy"
                    : "Exits only after operational breakeven is reached and all debt is fully paid off"}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
              </div>
            </div>

            <div className="flex-1 min-w-[100px] relative group flex">
              <button
                disabled={holdCoLocked}
                onClick={() => setHoldCoScenario("none")}
                className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  holdCoLocked
                    ? holdCoScenario === "none"
                      ? "bg-[#1C6048]/10 text-[#1C6048]/70 border border-[#1C6048]/20"
                      : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                    : holdCoScenario === "none"
                      ? "bg-white shadow-sm border border-[#1C6048] text-[#1C6048]"
                      : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                No Exit (Yield)
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                {holdCoLocked
                  ? "Locked to PropCo exit strategy"
                  : "No exit is calculated; evaluates pure operating yield over a long period"}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-3 mt-1 border-t border-[#D8D8D8]">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5 select-none">
                  <Landmark size={14} className="text-[#1E2F31]" /> Bank Debt
                  Financing (HoldCo Level)
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    disabled={false}
                    checked={holdCoAssumptions?.includeFinancing || false}
                    onChange={(e) =>
                      handleHoldCoChange("includeFinancing", e.target.checked)
                    }
                  />
                  <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
                </label>
              </div>
              {holdCoAssumptions?.includeFinancing && (
                <div className="pl-5 flex flex-col gap-2 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#4C4A4B] select-none">LTV Ratio (%)</span>
                    <input
                      type="number"
                      disabled={false}
                      className="w-16 bg-white border border-[#D8D8D8] rounded px-2 py-1 text-[10px] text-right text-[#1E2F31] font-bold focus:outline-none focus:border-[#1C6048]"
                      value={holdCoAssumptions?.ltvRatio || 0}
                      onChange={(e) => handleHoldCoChange("ltvRatio", parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#4C4A4B] select-none">Interest Rate (%)</span>
                    <input
                      type="number"
                      disabled={false}
                      className="w-16 bg-white border border-[#D8D8D8] rounded px-2 py-1 text-[10px] text-right text-[#1E2F31] font-bold focus:outline-none focus:border-[#1C6048]"
                      value={holdCoAssumptions?.interestRate || 0}
                      onChange={(e) => handleHoldCoChange("interestRate", parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#4C4A4B] select-none">Loan Tenor (Yrs)</span>
                    <input
                      type="number"
                      disabled={false}
                      className="w-16 bg-white border border-[#D8D8D8] rounded px-2 py-1 text-[10px] text-right text-[#1E2F31] font-bold focus:outline-none focus:border-[#1C6048]"
                      value={holdCoAssumptions?.loanTenor || 0}
                      onChange={(e) => handleHoldCoChange("loanTenor", parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#4C4A4B] select-none">IO Grace Period (Yrs)</span>
                    <input
                      type="number"
                      disabled={false}
                      className="w-16 bg-white border border-[#D8D8D8] rounded px-2 py-1 text-[10px] text-right text-[#1E2F31] font-bold focus:outline-none focus:border-[#1C6048]"
                      value={holdCoAssumptions?.ioGracePeriodYears || 0}
                      onChange={(e) => handleHoldCoChange("ioGracePeriodYears", parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                <Landmark size={14} className="text-[#9B8B70]" /> Bank Debt
                Financing (PropCo Level)
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={propCoAssumptions?.includeFinancing || false}
                  onChange={(e) =>
                    handlePropCoChange("includeFinancing", e.target.checked)
                  }
                />
                <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                <Map size={14} className="text-[#9B8B70]" /> Include Land Cost
                (PropCo Level)
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={propCoAssumptions?.includeLand ?? true}
                  onChange={(e) =>
                    handlePropCoChange("includeLand", e.target.checked)
                  }
                />
                <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
              </label>
            </div>
            <div className="pt-2 border-t border-[#D8D8D8]/50 space-y-2 pb-1">
              {/* Lock PropCo to Master */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                  <Lock
                    size={14}
                    className={
                      propCoLocked ? "text-[#1C6048]" : "text-[#4C4A4B]/40"
                    }
                  />{" "}
                  Lock PropCo to Master
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={propCoLocked}
                    onChange={togglePropCoLock}
                  />
                  <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-4`}>
          <div className="col-span-2 flex flex-col">
            <KPICard
              title="Blended Equity NPV"
              value={formatCurrency(data.metrics.npv)}
              icon={<TrendingUp size={18} />}
              color="emerald"
              subtitle={`@${String(assumptions.holdCoDiscountRate)}% Disc Rate`}
            />
          </div>
          <KPICard
            title="Blended Equity IRR"
            value={`${formatNumber((data.metrics.irr || 0) * 100, 2)}%`}
            icon={<Activity size={18} />}
            color="emerald"
            subtitle="Compounded Return"
          />
          <KPICard
            title="Blended Payback"
            value={
              data.metrics.payback > 0
                ? `${formatNumber(data.metrics.payback, 2)} Yrs`
                : "Never"
            }
            icon={<Clock size={18} />}
            color="indigo"
            subtitle="From Year 1"
          />
          <KPICard
            title="Project Avg Net Margin"
            value={`${formatNumber(data.totals.lookThroughMargin, 1)}%`}
            icon={<PieChart size={18} />}
            color="blue"
            subtitle="Across 12-Year Lifecycle"
          />
          <KPICard
            title="Consolidated DSCR"
            value={`${formatNumber(data.metrics.avgConsolidatedDscr, 2)}x`}
            icon={<ShieldCheck size={18} />}
            color="amber"
            subtitle="HoldCo Debt Coverage"
            tooltip="Consolidated Debt Service Coverage Ratio: Cash available distributed to HoldCo divided by HoldCo's share of debt service. Benchmark: > 1.25x is standard."
            disabled={
              (!propCoAssumptions?.includeFinancing &&
                !holdCoAssumptions?.includeFinancing) ||
              holdCoScenario === "debt_free"
            }
          />
          <div className="col-span-2 flex flex-col">
            <KPICard
              title="Sponsor Capital Shortfall"
              value={formatCurrency(data.totals.holdCoCashFlowAfterDebtShortfall)}
              icon={<AlertCircle size={18} />}
              color="indigo"
              subtitle="Cumulative Deficit Support"
              tooltip="Sponsor Capital Shortfall: The cumulative additional operating equity infusions required to support negative look-through combined cash flows and debt service."
            />
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="text-lg font-bold text-[#1E2F31] flex items-center gap-2 mb-1">
            <Layers size={20} className="text-[#1E2F31]" /> HoldCo Group
            Position
          </h3>
          <p className="text-[10px] text-[#4C4A4B] font-medium mb-6">
            Combined position representing 100% of PropCo cash flows and 49% of
            OpCo operating dividends.
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                Total Combined Equity Outlay
              </span>
              <span className="font-black text-[#1E2F31]">
                {formatCurrency(data.metrics.totalEquity)}
              </span>
            </div>
            <div className="w-full h-px bg-[#D8D8D8]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                PropCo Total FCFE (100%)
              </span>
              <span className="font-black text-[#9B8B70]">
                {formatCurrency(data.totals.propCoFlow)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                OpCo Total Dividends (49%)
              </span>
              <span className="font-black text-[#1C6048]">
                {formatCurrency(data.totals.opCoFlow)}
              </span>
            </div>
            <div className="w-full h-px bg-[#D8D8D8]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#1E2F31] uppercase tracking-wider">
                Net Combined Return
              </span>
              <span className="font-black text-[#1E2F31]">
                {formatCurrency(data.totals.netFlow)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`space-y-6 ${isPresenting ? "lg:col-span-8" : ""}`}>
        {/* Capital Structure Summary Block - Ledger Strip Layout */}
        <div className="bg-white rounded-xl shadow-sm border border-[#D8D8D8] overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#D8D8D8]/50 shrink-0">
          
          {/* Total Consolidated Equity */}
          <div className="flex-1 p-5 relative overflow-hidden group hover:bg-[#F9F8F6]/50 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
              <Calculator size={56} />
            </div>
            <div className="flex flex-col h-full relative z-10">
              <span className="text-[10px] uppercase font-bold text-[#8A8175] tracking-wider mb-1">Total Equity Funded</span>
              <span className="text-2xl font-black text-[#1C6048] tracking-tight">{formatCurrency(data.metrics.totalEquity)}</span>
              
              <div className="mt-6 pt-3 border-t border-[#D8D8D8]/50 text-[10px] text-[#8A8175] flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span>OpCo Equity</span>
                  <span className="font-bold text-gray-800">{formatCurrency(assumptions.partnerBEquity)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>PropCo Equity</span>
                  <span className="font-bold text-gray-800">{formatCurrency(propcoData?.metrics?.totalEquity || 0)}</span>
                </div>
                {data.totals?.holdCoCashFlowAfterDebtShortfall > 0 && (
                  <div className="flex justify-between items-center">
                    <span>HoldCo Shortfall</span>
                    <span className="font-bold text-gray-800">{formatCurrency(data.totals.holdCoCashFlowAfterDebtShortfall)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Consolidated Debt Drawn */}
          <div className="flex-1 p-5 relative overflow-hidden group hover:bg-[#F9F8F6]/50 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
              <Briefcase size={56} />
            </div>
            <div className="flex flex-col h-full relative z-10">
              <span className="text-[10px] uppercase font-bold text-[#8A8175] tracking-wider mb-1">Peak Loan Balance</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">{formatCurrency(debtTotals.ltDebtDraw + debtTotals.pCapitalizedInterest)}</span>
              
              <div className="mt-6 pt-3 border-t border-[#D8D8D8]/50 text-[10px] text-[#8A8175] flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span>PropCo Debt (Property)</span>
                  <span className="font-bold text-gray-800">{formatCurrency(debtTotals.pDebtDraw + debtTotals.pCapitalizedInterest)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>HoldCo Debt (Consolidated Level)</span>
                  <span className="font-bold text-gray-800">{formatCurrency(debtTotals.holdCoDebtDraw)}</span>
                </div>
                {debtTotals.holdCoDebtDraw > 0 && (
                  <div className="pl-3 py-1 flex flex-col gap-1 border-l-2 border-[#1C6048]/20 bg-[#F9F8F6]/40 rounded-r text-[9px] text-[#8A8175] my-0.5">
                    <div className="flex justify-between items-center px-1">
                      <span>↳ Distributed to PropCo Equity</span>
                      <span className="font-semibold text-[#1E2F31]">{formatCurrency(debtTotals.holdCoAllocatedToPropCo)}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span>↳ Distributed to OpCo Equity</span>
                      <span className="font-semibold text-[#1E2F31]">{formatCurrency(debtTotals.holdCoAllocatedToOpCo)}</span>
                    </div>
                  </div>
                )}
                <div className="w-full h-px bg-[#D8D8D8]/30 my-0.5"></div>
                <div className="flex justify-between items-center">
                  <span>Base Debt Drawn</span>
                  <span className="font-medium text-gray-600">{formatCurrency(debtTotals.ltDebtDraw)}</span>
                </div>
                {debtTotals.pCapitalizedInterest > 0 && (
                  <div className="flex justify-between items-center text-[#99B6AA]">
                    <span>+ Capitalized IDC</span>
                    <span className="font-medium">{formatCurrency(debtTotals.pCapitalizedInterest)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Consolidated Principal Paid */}
          <div className="flex-1 p-5 relative overflow-hidden group hover:bg-[#F9F8F6]/50 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target size={56} />
            </div>
            <div className="flex flex-col h-full relative z-10">
              <span className="text-[10px] uppercase font-bold text-[#8A8175] tracking-wider mb-1">Total Principal Repaid</span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">{formatCurrency(debtTotals.ltDebtPrincipal)}</span>
              
              <div className="mt-6 pt-3 border-t border-[#D8D8D8]/50 text-[10px] text-[#8A8175] flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span>PropCo Amortization</span>
                  <span className="font-bold text-gray-800">{formatCurrency(debtTotals.pDebtPrincipal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>HoldCo Amortization</span>
                  <span className="font-bold text-gray-800">{formatCurrency(debtTotals.holdCoPrincipal)}</span>
                </div>
                {debtTotals.pLoanSettledAtExit > 0 && (
                  <div className="flex justify-between items-center">
                    <span>PropCo Settled at Exit</span>
                    <span className="font-bold text-gray-800">{formatCurrency(debtTotals.pLoanSettledAtExit)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Consolidated Interest Paid */}
          <div className="flex-1 p-5 relative overflow-hidden group hover:bg-[#F9F8F6]/50 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity size={56} />
            </div>
            <div className="flex flex-col h-full relative z-10">
              <span className="text-[10px] uppercase font-bold text-[#8A8175] tracking-wider mb-1">Cash Interest Paid</span>
              <span className="text-2xl font-black text-[#1C6048] tracking-tight">
                {formatCurrency(debtTotals.ltDebtInterest - debtTotals.pCapitalizedInterest)}
              </span>
              
              <div className="mt-6 pt-3 border-t border-[#D8D8D8]/50 text-[10px] text-[#8A8175] flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span>PropCo Interest (Cash)</span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(debtTotals.pDebtInterest - debtTotals.pCapitalizedInterest)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>HoldCo Interest</span>
                  <span className="font-bold text-gray-800">{formatCurrency(debtTotals.holdCoInterest)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#99B6AA]" /> Managerial
            Look-Through PnL
          </h3>
          <div className={isPresenting ? "h-[300px]" : "h-72"}>
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
                    (String(name).includes("Margin") ? "%" : "B")
                  }
                />
                <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                <Bar
                  yAxisId="left"
                  dataKey="lookThroughRevenue"
                  name="Look-Through Revenue"
                  fill="#EFEBE7"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  dataKey="lookThroughEbitda"
                  name="Look-Through EBITDA"
                  fill="#9B8B70"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="lookThroughMargin"
                  name="Net Profit Margin"
                  stroke="#1C6048"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#1C6048",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
              </ComposedChart>
            </LazyResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#1E2F31]" /> Consolidated Cash
            Flow Trajectory
          </h3>
          <div className={isPresenting ? "h-[450px]" : "h-80"}>
            <LazyResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data?.annualData || []}>
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
                  stackId="a"
                  dataKey="propCoFlow"
                  name="PropCo FCFE"
                  fill="#9B8B70"
                  radius={[0, 0, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  stackId="a"
                  dataKey="opCoOperatingFlow"
                  name="OpCo Dividend (49%)"
                  fill="#1C6048"
                  radius={[0, 0, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  stackId="a"
                  dataKey="opCoExitFlow"
                  name="OpCo Exit (49%)"
                  fill="#99B6AA"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumCf"
                  name="Cumulative Net Position"
                  stroke="#1E2F31"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#1E2F31",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
                <ReferenceLine
                  yAxisId="right"
                  y={0}
                  stroke="#D8D8D8"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </LazyResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
});
