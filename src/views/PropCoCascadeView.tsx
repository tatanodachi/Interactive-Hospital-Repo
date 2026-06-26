import { PROPCO_FORMULAS } from "../formulaTooltips";
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
  List,
  ChevronLeft,
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
  ExpandableDataRowGroup,
  TableSection,
  CapexRow,
} from "../App";

export const PropCoCascadeView = memo(
  ({ data, onExport, viewResolution, setViewResolution }) => {
    const { columns, expandedYears, toggleYear } = useMonthlyColumns(
      data.annualData,
      viewResolution,
    );

    const enrichedColumns = useMemo(() => {
      return columns.map((col) => {
        const preOpening = col.preOpeningDev || 0;
        const maint = col.maintOpex || 0;
        const tax = col.taxOpex || 0;
        const overhead = col.overheadOpex || 0;
        const lease = col.medEqLeaseOpex || 0;
        const opex = preOpening + maint + tax + overhead + lease;
        return {
          ...col,
          opex,
        };
      });
    }, [columns]);

    const totalOpex = useMemo(() => {
      const tPreOpening = data.totals.preOpeningDev || 0;
      const tMaint = data.totals.maintOpex || 0;
      const tTax = data.totals.taxOpex || 0;
      const tOverhead = data.totals.overheadOpex || 0;
      const tLease = data.totals.medEqLeaseOpex || 0;
      return tPreOpening + tMaint + tTax + tOverhead + tLease;
    }, [data.totals]);

    const scrollRef = useRef(null);
    const [showDevBudget, setShowDevBudget] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [viewMode, setViewMode] = useState("all"); // 'all' | 'pl' | 'cf'
    const [expandedCfo, setExpandedCfo] = useState(false);
    const [expandedCfoIn, setExpandedCfoIn] = useState(false);
    const [expandedCfoOut, setExpandedCfoOut] = useState(false);
    const [expandedCfi, setExpandedCfi] = useState(false);
    const [expandedCfiIn, setExpandedCfiIn] = useState(false);
    const [expandedCfiOut, setExpandedCfiOut] = useState(false);
    const [expandedCff, setExpandedCff] = useState(false);
    const [expandedCffIn, setExpandedCffIn] = useState(false);
    const [expandedCffOut, setExpandedCffOut] = useState(false);

    const renderTableHeaders = () => (
      <thead className="bg-[#EFEBE7] font-bold sticky top-0 z-[50] shadow-md">
        <tr>
          <th className="pl-1 pr-4 py-3 border-b-2 border-r border-[#D8D8D8] sticky left-0 top-0 bg-[#EFEBE7] z-[60] w-[360px] min-w-[360px] max-w-[360px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-[#1E2F31]">
            Line Item
          </th>
          {columns.map((col, i) => (
            <th
              key={i}
              onClick={
                col.colType === "year"
                  ? () => toggleYear(col.defaultLabel)
                  : undefined
              }
              className={`px-3 py-3 text-right border-b-2 border-r border-[#D8D8D8] ${
                col.colType === "year"
                  ? "cursor-pointer hover:bg-white font-black underline decoration-dashed underline-offset-4 "
                  : "font-medium text-[10px] "
              } bg-[#EFEBE7] ${!col.isOperating ? "text-[#8A8175]" : "text-[#1E2F31]"} ${col.isMonth ? "min-w-[65px] whitespace-nowrap" : "min-w-[90px]"}`}
            >
              {col.colType === "year" ? (
                <div className="flex items-center justify-end gap-1">
                  {expandedYears[col.defaultLabel] ? "-" : "+"}
                  {String(col.defaultLabel)}
                </div>
              ) : (
                <div className="text-center w-full">
                  {String(col.defaultLabel)}
                </div>
              )}
            </th>
          ))}
          <th className="px-4 py-3 text-right bg-[#EFEBE7] text-[#1E2F31] sticky right-0 top-0 z-[60] border-l border-b-2 border-[#D8D8D8] shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
            Total
          </th>
        </tr>
      </thead>
    );

    return (
      <div
        className={`space-y-6 ${isFullScreen ? "fixed inset-0 z-[150] bg-[#F9F8F6] p-4 lg:p-6 overflow-hidden flex flex-col" : ""}`}
      >
        <div
          className={`grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-500 ${isFullScreen ? "flex-1 overflow-hidden" : ""} ${showDevBudget && !isFullScreen ? "md:grid-cols-3" : "md:grid-cols-1"}`}
        >
          {showDevBudget && !isFullScreen && (
            <div className="md:col-span-1 bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
                  <Map size={18} className="text-[#1C6048]" /> Development
                  Budget
                </h3>
                <button
                  onClick={() => setShowDevBudget(false)}
                  className="text-[#8A8175] hover:text-[#1E2F31] text-[10px] uppercase font-bold tracking-wider"
                >
                  Hide
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EFEBE7]">
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold rounded-tl">
                        Component
                      </th>
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right">
                        Cost (B)
                      </th>
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right rounded-tr">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <CapexRow
                      label="Land Cost"
                      amount={data.capexDetails.landCost}
                      total={data.metrics.totalCapex}
                      isHeader
                    />

                    <CapexRow
                      label="Total Hard Costs"
                      amount={data.capexDetails.totalHardCosts}
                      total={data.metrics.totalCapex}
                      isHeader
                    />
                    <CapexRow
                      label="Construction"
                      amount={data.capexDetails.buildCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Medical Equip."
                      amount={data.capexDetails.medEqCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Infrastructure"
                      amount={data.capexDetails.infraCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="FF&E"
                      amount={data.capexDetails.ffeCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Sharing Dev."
                      amount={data.capexDetails.sharingDevCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />

                    <CapexRow
                      label="Total Soft Costs"
                      amount={data.capexDetails.totalSoftCosts}
                      total={data.metrics.totalCapex}
                      isHeader
                    />
                    <CapexRow
                      label="Consultant"
                      amount={data.capexDetails.consultantCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="License"
                      amount={data.capexDetails.licenseCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="VAT"
                      amount={data.capexDetails.vatCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Contingency"
                      amount={data.capexDetails.contingencyCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Pre-Operating Costs"
                      amount={
                        data.capexDetails.devGaCost +
                        data.capexDetails.devCarCost
                      }
                      total={data.metrics.totalCapex}
                      isHeader
                    />
                    <CapexRow
                      label="Dev. G&A"
                      amount={data.capexDetails.devGaCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Dev. CAR"
                      amount={data.capexDetails.devCarCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />

                    <CapexRow
                      label="TOTAL PROPCO INVESTMENT"
                      amount={data.metrics.totalCapex}
                      total={data.metrics.totalCapex}
                      isSubtotal
                    />
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div
            className={`${showDevBudget && !isFullScreen ? "md:col-span-2" : "md:col-span-1"} flex flex-col gap-4 overflow-hidden ${isFullScreen ? "h-full" : "h-[calc(100vh-240px)]"}`}
          >
            <div className="p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8] flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1E2F31] flex items-center gap-2">
                <List size={14} /> PropCo P&L & Cash Flow
                {!showDevBudget && (
                  <button
                    onClick={() => setShowDevBudget(true)}
                    className="ml-2 px-2 py-0.5 border border-[#D8D8D8] bg-white rounded text-[#8A8175] hover:text-[#1E2F31] text-[9px] tracking-wider font-bold shadow-sm leading-tight inline-block flex-shrink-0"
                  >
                    Show Dev Budget
                  </button>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewMode("all")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "all" ? "bg-[#1E2F31] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setViewMode("pl")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "pl" ? "bg-[#1E2F31] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="PropCo Income Statement (P&L)"
                  >
                    P&L
                  </button>
                  <button
                    onClick={() => setViewMode("statement")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "statement" ? "bg-[#1E2F31] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="C&F (Standardized)"
                  >
                    C&F
                  </button>
                  <button
                    onClick={() => setViewMode("cf")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "cf" ? "bg-[#1E2F31] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="PropCo Capital Cascade"
                  >
                    Cascade
                  </button>
                </div>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6] transition-colors"
                  title={isFullScreen ? "Minimize" : "Maximize"}
                >
                  {isFullScreen ? (
                    <Minimize2 size={13} strokeWidth={2.5} />
                  ) : (
                    <Maximize2 size={13} strokeWidth={2.5} />
                  )}
                </button>
                <div className="flex items-center bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewResolution("annual")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "annual" ? "bg-[#1C6048] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => setViewResolution("monthly")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "monthly" ? "bg-[#1E2F31] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Monthly
                  </button>
                </div>
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => {
                      const tables = document.querySelectorAll(
                        ".propco-table-scroll",
                      );
                      tables.forEach((t) =>
                        t.scrollBy({ left: -300, behavior: "smooth" }),
                      );
                    }}
                    className="p-1 rounded bg-white text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-[#F9F8F6] transition-colors"
                    title="Scroll Left"
                  >
                    <ChevronLeft size={13} strokeWidth={2.5} />
                  </button>
                  <div className="w-[1px] bg-[#D8D8D8] my-1 opacity-50"></div>
                  <button
                    onClick={() => {
                      const tables = document.querySelectorAll(
                        ".propco-table-scroll",
                      );
                      tables.forEach((t) =>
                        t.scrollBy({ left: 300, behavior: "smooth" }),
                      );
                    }}
                    className="p-1 rounded bg-white text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-[#F9F8F6] transition-colors"
                    title="Scroll Right"
                  >
                    <ChevronRight size={13} strokeWidth={2.5} />
                  </button>
                </div>
                <span className="text-[10px] bg-white text-[#4C4A4B] border border-[#D8D8D8] px-2 py-1 rounded font-bold uppercase shadow-sm">
                  IDR Billions
                </span>
              </div>
            </div>
            <div
              className={`${viewMode === "all" ? "overflow-y-auto pr-1" : "overflow-y-hidden"} overflow-x-hidden min-h-0 flex-1 space-y-6`}
            >
              {/* TABLE 1: PropCo Operating P&L & Debt Coverage */}
              {(viewMode === "all" || viewMode === "pl") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#1E2F31] border-b border-[#1E2F31] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      1. Property P&L & Debt Service
                    </h3>
                  </div>
                  <div
                    className={`custom-scrollbar relative propco-table-scroll ${viewMode === "all" ? "overflow-x-auto" : "overflow-auto max-h-[calc(100vh-320px)]"}`}
                  >
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                      {renderTableHeaders()}
                      <tbody>
                        <TableRow
                          label="Net Rent Revenue / NOR"
                          data={columns}
                          dk="revenue"
                          total={data.totals.revenue}
                          highlight
                          tooltip={PROPCO_FORMULAS.revenue}
                        />

                        <TableRow
                          label="Operating Expenses (OpEx)"
                          data={enrichedColumns}
                          dk="opex"
                          total={totalOpex}
                          highlight
                          isSubtractor
                          tooltip={{
                            desc: "Total operational and developmental property expenditures.",
                            formula:
                              "Total OpEx = Pre-Opening & Dev + Maintenance + Tax + Overhead + Equipment Lease",
                          }}
                        />

                        <ExpandableDataRowGroup
                          parentLabel="Pre-Opening & Dev Expenses"
                          parentDk="preOpeningDev"
                          parentTotal={data.totals.preOpeningDev}
                          data={columns}
                          parentTooltip={PROPCO_FORMULAS.preOpeningDev}
                          isSubtractor
                          childrenData={[
                            {
                              label: "Dev. G&A Expense",
                              dk: "devGa",
                              total: data.totals.devGa,
                            },
                            {
                              label: "Dev. CAR Expense",
                              dk: "devCar",
                              total: data.totals.devCar,
                            },
                          ]}
                        />

                        <TableRow
                          label="Facility Maintenance OPEX"
                          data={columns}
                          dk="maintOpex"
                          total={data.totals.maintOpex}
                          isIndent
                          tooltip={PROPCO_FORMULAS.maintOpex}
                          isSubtractor
                        />
                        <TableRow
                          label="Property Tax"
                          data={columns}
                          dk="taxOpex"
                          total={data.totals.taxOpex}
                          isIndent
                          tooltip={PROPCO_FORMULAS.taxOpex}
                          isSubtractor
                        />
                        <TableRow
                          label="Management / Overhead OPEX"
                          data={columns}
                          dk="overheadOpex"
                          total={data.totals.overheadOpex}
                          isIndent
                          tooltip={PROPCO_FORMULAS.overheadOpex}
                          isSubtractor
                        />
                        <TableRow
                          label="Equipment Lease OPEX"
                          data={columns}
                          dk="medEqLeaseOpex"
                          total={data.totals.medEqLeaseOpex}
                          isIndent
                          tooltip={PROPCO_FORMULAS.medEqLeaseOpex}
                          isSubtractor
                        />

                        <TableRow
                          label="Gross Operating Profit (GOP)"
                          data={columns}
                          dk="gop"
                          total={data.totals.gop}
                          highlight
                          tooltip={PROPCO_FORMULAS.gop}
                        />

                        <TableRow
                          label="FF&E Reserve Allocation"
                          data={columns}
                          dk="ffeReserve"
                          total={data.totals.ffeReserve}
                          isIndent
                          tooltip={PROPCO_FORMULAS.ffeReserve}
                          isSubtractor
                        />
                        <TableRow
                          label="EBITDA"
                          data={columns}
                          dk="ebitda"
                          total={data.totals.ebitda}
                          highlight
                          tooltip={PROPCO_FORMULAS.ebitda}
                        />

                        <ExpandableDataRowGroup
                          parentLabel="Depreciation (D&A)"
                          parentDk="dep"
                          parentTotal={data.totals.dep}
                          data={columns}
                          parentTooltip={PROPCO_FORMULAS.dep}
                          isSubtractor
                          childrenData={[
                            {
                              label: "Construction",
                              dk: "depBuild",
                              total: data.totals.depBuild,
                            },
                            {
                              label: "Medical Equipment",
                              dk: "depMedEq",
                              total: data.totals.depMedEq,
                            },
                            {
                              label: "Infrastructure",
                              dk: "depInfra",
                              total: data.totals.depInfra,
                            },
                            {
                              label: "FF&E",
                              dk: "depFfe",
                              total: data.totals.depFfe,
                            },
                            {
                              label: "Sharing Dev.",
                              dk: "depSharing",
                              total: data.totals.depSharing,
                            },
                            {
                              label: "Consultant",
                              dk: "depConsultant",
                              total: data.totals.depConsultant,
                            },
                            {
                              label: "License",
                              dk: "depLicense",
                              total: data.totals.depLicense,
                            },
                            {
                              label: "VAT",
                              dk: "depVat",
                              total: data.totals.depVat,
                            },
                            {
                              label: "Contingency",
                              dk: "depContingency",
                              total: data.totals.depContingency,
                            },
                          ]}
                        />
                        <TableRow
                          label="EBIT"
                          data={columns}
                          dk="ebit"
                          total={data.totals.ebit}
                          highlight
                          tooltip={PROPCO_FORMULAS.ebit}
                        />
                        <TableRow
                          label="Interest Expense (Debt)"
                          data={columns}
                          dk="interest"
                          total={data.totals.interest}
                          isIndent
                          tooltip={PROPCO_FORMULAS.interest}
                          isSubtractor
                        />
                        <TableRow
                          label="Earnings Before Tax (EBT)"
                          data={columns}
                          dk="ebt"
                          total={data.totals.ebt}
                          highlight
                          tooltip={PROPCO_FORMULAS.ebt}
                        />
                        <TableRow
                          label="Corporate Income Tax"
                          data={columns}
                          dk="corpTax"
                          total={data.totals.corpTax}
                          isIndent
                          tooltip={PROPCO_FORMULAS.corpTax}
                          isSubtractor
                        />
                        <TableRow
                          label="Net Profit"
                          data={columns}
                          dk="netIncome"
                          total={data.totals.netIncome}
                          highlight
                          tooltip={PROPCO_FORMULAS.netIncome}
                        />

                        <TableSection
                          title="Debt Service & Exit"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Principal Repayment"
                          data={columns}
                          dk="principal"
                          total={data.totals.principal}
                          isIndent
                          tooltip={PROPCO_FORMULAS.principal}
                          isSubtractor
                        />
                        <TableRow
                          label="DSCR (Coverage Ratio)"
                          data={columns}
                          dk="dscr"
                          tooltip={PROPCO_FORMULAS.dscr}
                        />
                        <TableRow
                          label="DSCR Cash Buffer"
                          data={columns}
                          dk="dscrBuffer"
                          total={data.totals.dscrBuffer}
                          tooltip="The monetary variance between cash flow available for debt service and total debt service."
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLE 2: PropCo Standard Cash Flows */}
              {(viewMode === "all" || viewMode === "statement") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#1E2F31] border-b border-[#1E2F31] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      2. Property Cash Flows
                    </h3>
                  </div>
                  <div
                    className={`custom-scrollbar relative propco-table-scroll ${viewMode === "all" ? "overflow-x-auto" : "overflow-auto max-h-[calc(100vh-320px)]"}`}
                  >
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                      {renderTableHeaders()}
                      <tbody>
                        <TableSection
                          title="STATEMENT OF CASH FLOWS"
                          colSpan={columns.length + 2}
                          type="amber"
                        />
                        <TableRow
                          label="Net Cash from Operating (CFO)"
                          data={columns}
                          dk="cfo"
                          total={data.totals.cfo}
                          highlight
                          isExpandable
                          isExpanded={expandedCfo}
                          onExpand={() => setExpandedCfo(!expandedCfo)}
                          tooltip="PropCo Net Income + D&A."
                        />
                        {expandedCfo && (
                          <>
                            <TableRow
                              label="Cash Inflows (OpCo Lease Rentals)"
                              data={columns}
                              dk="cfo_in"
                              total={data.totals.cfo_in}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfoIn}
                              onExpand={() => setExpandedCfoIn(!expandedCfoIn)}
                              tooltip="PropCo Rental Revenues received from clinical leasing operations."
                            />
                            {expandedCfoIn && (
                              <TableRow
                                label="Lease Rental Receipts"
                                data={columns}
                                dk="cfo_in"
                                total={data.totals.cfo_in}
                                isDoubleIndent
                                hasDoubleConnector
                                tooltip="Actual lease payments received from clinical OpCo operations."
                              />
                            )}
                            <TableRow
                              label="Cash Outflows (Maint, Reserves, Interest & Taxes)"
                              data={columns}
                              dk="cfo_out"
                              total={data.totals.cfo_out}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfoOut}
                              onExpand={() =>
                                setExpandedCfoOut(!expandedCfoOut)
                              }
                              tooltip="Operating outflows paid during PropCo operations, including maintenance OPEX, FF&E reserve payments, financing interest, and corporate income taxes."
                            />
                            {expandedCfoOut && (
                              <>
                                <TableRow
                                  label="Facility Maintenance OPEX"
                                  data={columns}
                                  dk="maintOpex"
                                  total={data.totals.maintOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Daily maintenance, facility OPEX, and standard upkeeps."
                                />
                                <TableRow
                                  label="FF&E Reserve Allocation"
                                  data={columns}
                                  dk="ffeReserve"
                                  total={data.totals.ffeReserve}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Furniture, Fixtures, and Equipment reserve payments."
                                />
                                <TableRow
                                  label="Interest Expense (Debt)"
                                  data={columns}
                                  dk="interest"
                                  total={data.totals.interest}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Financing interest cost on commercial property debt."
                                />
                                <TableRow
                                  label="Corporate Income Tax"
                                  data={columns}
                                  dk="corpTax"
                                  total={data.totals.corpTax}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Calculated Indonesian corporate income taxes paid by the PropCo entity."
                                />
                                <TableRow
                                  label="Pre-Opening & Dev Expenses"
                                  data={columns}
                                  dk="preOpeningDev"
                                  total={data.totals.preOpeningDev}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Operational start-up cost pre-opening outlays, Dev G&A and Contractor All Risk expense."
                                />
                                <TableRow
                                  label="Management / Overhead OPEX"
                                  data={columns}
                                  dk="overheadOpex"
                                  total={data.totals.overheadOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="PropCo administration and property overhead operations."
                                />
                                <TableRow
                                  label="Property Tax"
                                  data={columns}
                                  dk="taxOpex"
                                  total={data.totals.taxOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Annual land tax / PBB on properties."
                                />
                                <TableRow
                                  label="Equipment Lease OPEX"
                                  data={columns}
                                  dk="medEqLeaseOpex"
                                  total={data.totals.medEqLeaseOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Clinical equipment leasing and maintenance obligations."
                                />
                              </>
                            )}
                          </>
                        )}

                        <TableRow
                          label="Net Cash from Investing (CFI)"
                          data={columns}
                          dk="cfi"
                          total={data.totals.cfi}
                          highlight
                          isExpandable
                          isExpanded={expandedCfi}
                          onExpand={() => setExpandedCfi(!expandedCfi)}
                          tooltip="PropCo development spending and exit proceeds."
                        />
                        {expandedCfi && (
                          <>
                            <TableRow
                              label="Cash Inflows (Exit Proceeds)"
                              data={columns}
                              dk="cfi_in"
                              total={data.totals.cfi_in}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfiIn}
                              onExpand={() => setExpandedCfiIn(!expandedCfiIn)}
                              tooltip="Capital proceeds received from PropCo asset liquidations/exits."
                            />
                            {expandedCfiIn && (
                              <TableRow
                                label="Property Liquidations & Exits"
                                data={columns}
                                dk="cfi_in"
                                total={data.totals.cfi_in}
                                isDoubleIndent
                                hasDoubleConnector
                                tooltip="Capital proceeds from PropCo asset divestments or exit."
                              />
                            )}
                            <TableRow
                              label="Cash Outflows (Development Capex)"
                              data={columns}
                              dk="cfi_out"
                              total={data.totals.cfi_out}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfiOut}
                              onExpand={() =>
                                setExpandedCfiOut(!expandedCfiOut)
                              }
                              tooltip="Pre-operating development capital expenditures incurred across hard, soft, and land spends."
                            />
                            {expandedCfiOut && (
                              <>
                                <TableRow
                                  label="Land Cost"
                                  data={columns}
                                  dk="landSpend"
                                  total={data.totals.landSpend}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Property acquisition land procurement outlays."
                                />
                                <TableRow
                                  label="Total Hard Costs"
                                  data={columns}
                                  dk="hardSpend"
                                  total={data.totals.hardSpend}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Real estate construction, medical equipment, infrastructure, FF&E, and joint sharing development spends."
                                />
                                <TableRow
                                  label="Total Soft Costs"
                                  data={columns}
                                  dk="softSpend"
                                  total={data.totals.softSpend}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Consultant fees, licensing, VAT, and contingency reserves."
                                />
                                <TableRow
                                  label="Pre-Operating Costs"
                                  data={columns}
                                  dk="preOpeningDev"
                                  total={data.totals.preOpeningDev}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Pre-opening direct operational outlays including Dev G&A and CAR."
                                />
                              </>
                            )}
                          </>
                        )}

                        <TableRow
                          label="Net Cash from Financing (CFF)"
                          data={columns}
                          dk="cff"
                          total={data.totals.cff}
                          highlight
                          isExpandable
                          isExpanded={expandedCff}
                          onExpand={() => setExpandedCff(!expandedCff)}
                          tooltip="Debt drawdowns, principal repayment, equity injections, and dividends paid."
                        />
                        {expandedCff && (
                          <>
                            <TableRow
                              label="Cash Inflows (Debt Draws & Shortfall Contributions)"
                              data={columns}
                              dk="cff_in"
                              total={data.totals.cff_in}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCffIn}
                              onExpand={() => setExpandedCffIn(!expandedCffIn)}
                              tooltip="Capital inflows from development bank loan drawdowns and extra sponsor shortfall injections."
                            />
                            {expandedCffIn && (
                              <>
                                <TableRow
                                  label="Debt Drawdown"
                                  data={columns}
                                  dk="debtDraw"
                                  total={data.totals.debtDraw}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  tooltip="Inflows sourced from property development project banking facilities."
                                />
                                <TableRow
                                  label="Sponsor Shortfall Equity"
                                  data={columns}
                                  dk="shortfallEquity"
                                  total={data.totals.shortfallEquity}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  tooltip="Sponsor-injected bridging equity to cover temporal operational deficit drawdowns."
                                />
                              </>
                            )}
                            <TableRow
                              label="Cash Outflows (Sponsor Distributions & Principal Repayments)"
                              data={columns}
                              dk="cff_out"
                              total={data.totals.cff_out}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCffOut}
                              onExpand={() =>
                                setExpandedCffOut(!expandedCffOut)
                              }
                              tooltip="Subsequent debt principal amortization repayments and net operational free distributions paid to stakeholders."
                            />
                            {expandedCffOut && (
                              <>
                                <TableRow
                                  label="Debt Principal Repayments"
                                  data={columns}
                                  dk="principal"
                                  total={data.totals.principal}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Commercial property loan amortization principal payments."
                                />
                                <TableRow
                                  label="Sponsor Distributions (FCFE)"
                                  data={columns}
                                  dk="fcfe"
                                  total={data.totals.fcfe}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Net free cash flow distributed back to sponsor stakeholders."
                                />
                              </>
                            )}
                          </>
                        )}

                        <TableRow
                          label="Total Net Cash Flow"
                          data={columns}
                          dk="netFlow"
                          total={data.totals.netFlow}
                          highlight
                          emerald
                        />
                        <TableRow
                          label="Cumulative Cash Balance"
                          data={columns}
                          dk="endCash"
                          total={data.totals.netFlow}
                          highlight
                          crossover
                          indigo
                          bold
                          tooltip="Rolling cash balance."
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLE 3: PropCo Capital Cascade & Returns */}
              {(viewMode === "all" || viewMode === "cf") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#1E2F31] border-b border-[#1E2F31] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      3. Property Capex & Returns
                    </h3>
                  </div>
                  <div
                    className={`custom-scrollbar relative propco-table-scroll ${viewMode === "all" ? "overflow-x-auto" : "overflow-auto max-h-[calc(100vh-320px)]"}`}
                  >
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                      {renderTableHeaders()}
                      <tbody>
                        <TableSection
                          title="Project Development Spending"
                          colSpan={columns.length + 2}
                          type="indigo"
                        />
                        <TableRow
                          label="Land Cost"
                          data={columns}
                          dk="landSpend"
                          total={data.totals.landSpend}
                          isIndent
                          tooltip={PROPCO_FORMULAS.landSpend}
                        />
                        <ExpandableDataRowGroup
                          parentLabel="Total Hard Costs"
                          parentDk="hardSpend"
                          parentTotal={data.totals.hardSpend}
                          data={columns}
                          parentTooltip={PROPCO_FORMULAS.hardSpend}
                          childrenData={[
                            {
                              label: "Construction",
                              dk: "buildSpend",
                              total: data.totals.buildSpend,
                            },
                            {
                              label: "Medical Equip.",
                              dk: "eqSpend",
                              total: data.totals.eqSpend,
                            },
                            {
                              label: "Infrastructure",
                              dk: "infraSpend",
                              total: data.totals.infraSpend,
                            },
                            {
                              label: "FF&E",
                              dk: "ffeSpend",
                              total: data.totals.ffeSpend,
                            },
                            {
                              label: "Sharing Dev.",
                              dk: "sharingSpend",
                              total: data.totals.sharingSpend,
                            },
                          ]}
                        />
                        <ExpandableDataRowGroup
                          parentLabel="Total Soft Costs"
                          parentDk="softSpend"
                          parentTotal={data.totals.softSpend}
                          data={columns}
                          parentTooltip={PROPCO_FORMULAS.softSpend}
                          childrenData={[
                            {
                              label: "Consultant",
                              dk: "consultantSpend",
                              total: data.totals.consultantSpend,
                            },
                            {
                              label: "License",
                              dk: "licenseSpend",
                              total: data.totals.licenseSpend,
                            },
                            {
                              label: "VAT",
                              dk: "vatSpend",
                              total: data.totals.vatSpend,
                            },
                            {
                              label: "Contingency",
                              dk: "contingencySpend",
                              total: data.totals.contingencySpend,
                            },
                          ]}
                        />
                        <ExpandableDataRowGroup
                          parentLabel="Pre-Operating Costs"
                          parentDk="preOpeningDev"
                          parentTotal={data.totals.preOpeningDev}
                          data={columns}
                          parentTooltip="Pre-opening direct operational outlays including Dev G&A and CAR."
                          childrenData={[
                            {
                              label: "Dev. G&A",
                              dk: "devGa",
                              total: data.totals.devGa,
                            },
                            {
                              label: "Dev. CAR",
                              dk: "devCar",
                              total: data.totals.devCar,
                            },
                          ]}
                        />
                        <TableRow
                          label="PROJECT DEVELOPMENT SPEND"
                          data={columns}
                          dk="totalSpend"
                          total={data.totals.totalSpend}
                          highlight
                          tooltip={PROPCO_FORMULAS.totalSpend}
                        />
                        <TableRow
                          label="Debt Drawdown"
                          data={columns}
                          dk="debtDraw"
                          total={data.totals.debtDraw}
                          isIndent
                          tooltip={PROPCO_FORMULAS.debtDraw}
                        />

                        <TableSection
                          title="Return Metrics"
                          colSpan={columns.length + 2}
                          type="emerald"
                        />
                        <TableRow
                          label="Deferred MedEq Purchase"
                          data={columns}
                          dk="deferredCapex"
                          total={data.totals.deferredCapex}
                          isIndent
                          tooltip={PROPCO_FORMULAS.deferredCapex}
                        />
                        <TableRow
                          label="FCFE (Operating)"
                          data={columns}
                          dk="opFcfe"
                          total={data.totals.opFcfe}
                          isIndent
                          tooltip={PROPCO_FORMULAS.opFcfe}
                        />
                        <TableRow
                          label={<span className="italic text-[#1E2F31] opacity-85">of which: Shortfall Equity</span>}
                          data={columns}
                          dk="shortfallEquity"
                          total={data.totals.shortfallEquity}
                          isDoubleIndent
                          hasDoubleConnector
                          tooltip="Dynamic Operating Shortfall (The Pay As You Go Method). Injected equity to cover negative operating free cash flow to equity."
                        />
                        <TableRow
                          label="Gross Exit Proceeds"
                          data={columns}
                          dk="grossExitValue"
                          total={data.totals.grossExitValue}
                          isIndent
                          tooltip={PROPCO_FORMULAS.grossExitValue}
                        />
                        <TableRow
                          label="Loan Settlement at Exit"
                          data={columns}
                          dk="loanSettledAtExit"
                          total={data.totals.loanSettledAtExit}
                          isIndent
                          tooltip={PROPCO_FORMULAS.loanSettledAtExit}
                        />
                        <TableRow
                          label="Net Exit Proceeds"
                          data={columns}
                          dk="netExitProceeds"
                          total={data.totals.netExitProceeds}
                          highlight
                          tooltip={PROPCO_FORMULAS.netExitProceeds}
                        />
                        <TableRow
                          label="FCFE (Levered)"
                          data={columns}
                          dk="fcfe"
                          highlight
                          emerald
                          total={data.totals.fcfe}
                          tooltip={PROPCO_FORMULAS.fcfe}
                        />
                        <TableRow
                          label="Cumulative FCFE"
                          data={columns}
                          dk="cumFcfe"
                          highlight
                          crossover
                          bold
                          indigo
                          tooltip={PROPCO_FORMULAS.cumFcfe}
                        />

                        <TableSection
                          title="Ex-Land Cash Flows (Optional)"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="EBITDA"
                          data={columns}
                          dk="ebitda"
                          total={data.totals.ebitda}
                          isIndent
                          hasConnector
                        />
                        <TableRow
                          label="Depreciation"
                          data={columns}
                          dk="dep"
                          total={data.totals.dep}
                          isIndent
                          hasConnector
                          isSubtractor
                        />
                        <TableRow
                          label="Interest (Ex-Land)"
                          data={columns}
                          dk="interestExLand"
                          total={data.totals.interestExLand}
                          isIndent
                          hasConnector
                          tooltip={PROPCO_FORMULAS.interestExLand}
                          isSubtractor
                        />
                        <TableRow
                          label="EBT (Ex-Land)"
                          data={columns}
                          dk="ebtExLand"
                          total={data.totals.ebtExLand}
                          highlight
                          tooltip={PROPCO_FORMULAS.ebtExLand}
                        />
                        <TableRow
                          label="Corporate Tax (Ex-Land)"
                          data={columns}
                          dk="corpTaxExLand"
                          total={data.totals.corpTaxExLand}
                          isIndent
                          hasConnector
                          tooltip={PROPCO_FORMULAS.corpTaxExLand}
                          isSubtractor
                        />
                        <TableRow
                          label="Add: Depreciation"
                          data={columns}
                          dk="dep"
                          total={data.totals.dep}
                          isIndent
                          hasConnector
                        />
                        <TableRow
                          label="Less: Principal (Ex-Land)"
                          data={columns}
                          dk="principalExLand"
                          total={data.totals.principalExLand}
                          isIndent
                          hasConnector
                          tooltip={PROPCO_FORMULAS.principalExLand}
                          isSubtractor
                        />
                        <TableRow
                          label="Operating FCFE (Ex-Land)"
                          data={columns}
                          dk="opFcfeExLand"
                          total={data.totals.opFcfeExLand}
                          highlight
                          tooltip={PROPCO_FORMULAS.opFcfeExLand}
                        />
                        <TableRow
                          label="Add: Net Exit Proceeds (Ex-Land)"
                          data={columns}
                          dk="netExitProceedsExLand"
                          total={data.totals.netExitProceedsExLand}
                          isIndent
                          hasConnector
                          tooltip={PROPCO_FORMULAS.netExitProceedsExLand}
                        />
                        <TableRow
                          label="FCFE (EX-LAND)"
                          data={columns}
                          dk="fcfeExLand"
                          highlight
                          emerald
                          total={data.totals.fcfeExLand}
                          tooltip={PROPCO_FORMULAS.fcfeExLand}
                        />
                        <TableRow
                          label="Cumulative FCFE (Ex-Land)"
                          data={columns}
                          dk="cumFcfeExLand"
                          highlight
                          crossover
                          bold
                          indigo
                          tooltip={PROPCO_FORMULAS.cumFcfeExLand}
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
