import { OPCO_FORMULAS } from "../formulaTooltips";
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

export const OpCoCascadeView = memo(
  ({ data, assumptions, viewResolution, setViewResolution }) => {
    const { columns, expandedYears, toggleYear } = useMonthlyColumns(
      data.annualData,
      viewResolution,
    );
    const scrollRef = useRef(null);
    const [showSetupBudget, setShowSetupBudget] = useState(false);
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

    const overallSetup =
      (assumptions?.jvaOpex ?? 2.5) +
      (assumptions?.commOpex ?? 15.0) +
      (assumptions?.workingCapitalOpex ?? 64.671175);

    const renderTableHeaders = () => (
      <thead className="bg-[#EFEBE7] font-bold sticky top-0 z-[50] shadow-md">
        <tr>
          <th className="pl-1 pr-4 py-3 border-b-2 border-r border-[#D8D8D8] sticky left-0 top-0 bg-white z-[60] w-[360px] min-w-[360px] max-w-[360px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-[#1E2F31]">
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
                  ? "cursor-pointer hover:bg-[#EFEBE7] font-black underline decoration-dashed underline-offset-4 "
                  : "font-medium text-[10px] "
              } ${!col.isOperating ? "bg-[#F9F8F6] text-[#9B8B70]" : "bg-white text-[#1E2F31]"} ${col.isMonth ? "min-w-[65px] whitespace-nowrap" : "min-w-[90px]"}`}
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
          className={`grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-500 ${isFullScreen ? "flex-1 overflow-hidden" : ""} ${showSetupBudget && !isFullScreen ? "md:grid-cols-3" : "md:grid-cols-1"}`}
        >
          {showSetupBudget && !isFullScreen && (
            <div className="md:col-span-1 bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
                  <Briefcase size={18} className="text-[#1C6048]" /> OpCo Setup
                  Budget
                </h3>
                <button
                  onClick={() => setShowSetupBudget(false)}
                  className="text-[#8A8175] hover:text-[#1E2F31] text-[10px] uppercase font-bold tracking-wider"
                >
                  Hide
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EFEBE7]">
                      <th className="px-3 py-1.5 border border-[#D8D8D8] text-[#1E2F31] font-bold rounded-tl">
                        Component
                      </th>
                      <th className="px-3 py-1.5 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right">
                        Cost (B)
                      </th>
                      <th className="px-3 py-1.5 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right rounded-tr">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <CapexRow
                      label="1. JVA Setup"
                      amount={assumptions?.jvaOpex ?? 2.5}
                      total={overallSetup}
                      isIndent
                    />
                    <CapexRow
                      label="2. Pre-operating"
                      amount={assumptions?.commOpex ?? 15.0}
                      total={overallSetup}
                      isIndent
                    />
                    <CapexRow
                      label="3. Clinical Working Capital"
                      amount={assumptions?.workingCapitalOpex ?? 64.671175}
                      total={overallSetup}
                      isIndent
                    />
                    <CapexRow
                      label="TOTAL OPCO INVESTMENT"
                      amount={overallSetup}
                      total={overallSetup}
                      isSubtotal
                    />
                  </tbody>
                </table>
              </div>
              <div className="mt-1.5 p-2 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8] shrink-0">
                <div className="text-[8.5px] text-[#4C4A4B] leading-relaxed space-y-1">
                  <p>
                    <strong>JVA Setup</strong>: Represents the cost of
                    establishing the Foreign Investment Company (PMA).
                  </p>
                  <p>
                    <strong>Pre-operating</strong>: Incurred during the 6-month
                    period preceding the Commercial Opening.
                  </p>
                  <p>
                    <strong>Clinical Working Capital</strong>: Establishes a
                    6-month operational buffer during the Year 1 opening phase.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div
            className={`${showSetupBudget && !isFullScreen ? "md:col-span-2" : "md:col-span-1"} flex flex-col gap-4 overflow-hidden ${isFullScreen ? "h-full" : "h-[calc(100vh-240px)]"}`}
          >
            <div className="p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8] flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 shrink-0">
              <div className="flex items-center justify-between w-full lg:w-auto">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#1E2F31] flex items-center gap-2 min-w-0">
                  <List size={14} className="shrink-0" /> <span className="truncate">OpCo P&L & Cash Flow</span>
                  {!showSetupBudget && (
                    <button
                      onClick={() => setShowSetupBudget(true)}
                      className="ml-2 px-2 py-0.5 border border-[#D8D8D8] bg-white rounded text-[#8A8175] hover:text-[#1E2F31] text-[9px] tracking-wider font-bold shadow-sm leading-tight inline-block flex-shrink-0"
                    >
                      Show Setup Budget
                    </button>
                  )}
                </h3>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="lg:hidden p-1.5 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6] transition-colors"
                  title={isFullScreen ? "Minimize" : "Maximize"}
                >
                  {isFullScreen ? (
                    <Minimize2 size={13} strokeWidth={2.5} />
                  ) : (
                    <Maximize2 size={13} strokeWidth={2.5} />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm">
                  <button
                    onClick={() => setViewMode("all")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "all" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setViewMode("pl")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "pl" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="Operating Income Statement (P&L)"
                  >
                    P&L
                  </button>
                  <button
                    onClick={() => setViewMode("statement")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "statement" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="C&F (Standardized)"
                  >
                    C&F
                  </button>
                  <button
                    onClick={() => setViewMode("cf")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "cf" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="OpCo Capital Cascade"
                  >
                    Cascade
                  </button>
                </div>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="hidden lg:block p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6] transition-colors"
                  title={isFullScreen ? "Minimize" : "Maximize"}
                >
                  {isFullScreen ? (
                    <Minimize2 size={13} strokeWidth={2.5} />
                  ) : (
                    <Maximize2 size={13} strokeWidth={2.5} />
                  )}
                </button>
                <div className="flex items-center bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm">
                  <button
                    onClick={() => setViewResolution("annual")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "annual" ? "bg-[#1C6048] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => setViewResolution("monthly")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "monthly" ? "bg-[#1C6048] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Monthly
                  </button>
                </div>
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm">
                  <button
                    onClick={() => {
                      const tables =
                        document.querySelectorAll(".opco-table-scroll");
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
                      const tables =
                        document.querySelectorAll(".opco-table-scroll");
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
              {/* TABLE 1: Profit & Loss Statement (P&L) */}
              {(viewMode === "all" || viewMode === "pl") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#1C6048] border-b border-[#1C6048] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      1. Clinical Profit & Loss (P&L)
                    </h3>
                  </div>
                  <div
                    className={`custom-scrollbar relative opco-table-scroll ${viewMode === "all" ? "overflow-x-auto" : "overflow-auto max-h-[calc(100vh-320px)]"}`}
                  >
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                      {renderTableHeaders()}
                      <tbody>
                        <TableSection
                          title="Operating Volume"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Bed Occupancy Rate (BOR)"
                          data={columns}
                          dk="bor"
                          tooltip={OPCO_FORMULAS.bor}
                          isPercent={true}
                        />
                        <TableRow
                          label="Inpatient Cases"
                          data={columns}
                          dk="ipCases"
                          tooltip={OPCO_FORMULAS.ipCases}
                        />
                        <TableRow
                          label="Outpatient Visits"
                          data={columns}
                          dk="opVisits"
                          tooltip={OPCO_FORMULAS.opVisits}
                        />

                        <TableSection
                          title="Revenue"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Inpatient Revenue"
                          data={columns}
                          dk="ipRev"
                          total={data.totals.ipRev}
                          isIndent
                          tooltip={OPCO_FORMULAS.ipRev}
                        />
                        <TableRow
                          label="Outpatient Revenue"
                          data={columns}
                          dk="opRev"
                          total={data.totals.opRev}
                          isIndent
                          tooltip={OPCO_FORMULAS.opRev}
                        />
                        <TableRow
                          label="NET REVENUE"
                          data={columns}
                          dk="totalRev"
                          total={data.totals.totalRev}
                          highlight
                          tooltip={OPCO_FORMULAS.totalRev}
                        />

                        <TableSection
                          title="Cost of Goods Sold"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Medical Supplies"
                          data={columns}
                          dk="totalMedSupp"
                          total={data.totals.totalMedSupp}
                          isIndent
                          tooltip={OPCO_FORMULAS.totalMedSupp}
                          isSubtractor
                        />
                        <TableRow
                          label="Doctor Fees"
                          data={columns}
                          dk="totalDocFee"
                          total={data.totals.totalDocFee}
                          isIndent
                          tooltip={OPCO_FORMULAS.totalDocFee}
                          isSubtractor
                        />
                        <TableRow
                          label="GROSS PROFIT"
                          data={columns}
                          dk="grossProfit"
                          total={data.totals.grossProfit}
                          highlight
                          tooltip={OPCO_FORMULAS.grossProfit}
                        />

                        <TableSection
                          title="Operating Expenses"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Staffing & Labor"
                          data={columns}
                          dk="staffCost"
                          total={data.totals.staffCost}
                          isIndent
                          tooltip={OPCO_FORMULAS.staffCost}
                          isSubtractor
                        />
                        <ExpandableDataRowGroup
                          parentLabel="Other OpEx"
                          parentDk="otherOpex"
                          parentTotal={data.totals.otherOpex}
                          data={columns}
                          parentTooltip={OPCO_FORMULAS.recurringOpex}
                          isSubtractor
                          childrenData={[
                            {
                              label: "Administrative Expense",
                              dk: "adminOpex",
                              total: data?.totals?.adminOpex,
                              tooltip: {
                                desc: "Administrative support overhead calculated based on administrative expense rate assumptions.",
                                formula:
                                  "Admin Exp = adminExpRate% * Net Revenue",
                              },
                            },
                            {
                              label: "Utilities Expense",
                              dk: "utilOpex",
                              total: data?.totals?.utilOpex,
                              tooltip: {
                                desc: "Clinic utilities expense based on utility expense rate assumptions.",
                                formula:
                                  "Utilities Exp = utilExpRate% * Net Revenue",
                              },
                            },
                            {
                              label: "Marketing Expense",
                              dk: "mktgOpex",
                              total: data?.totals?.mktgOpex,
                              tooltip: {
                                desc: "Marketing expenditures aligned with marketing expense rate assumptions.",
                                formula:
                                  "Marketing Exp = marketingExpRate% * Net Revenue",
                              },
                            },
                            {
                              label: "Hospital Operator Fee",
                              dk: "operatorOpex",
                              total: data?.totals?.operatorOpex,
                              tooltip: {
                                desc: "Hospital management and operator fees.",
                                formula:
                                  "Operator Fee = operatorFeeRate% * Net Revenue",
                              },
                            },
                            {
                              label: "Operational Insurance",
                              dk: "insOpex",
                              total: data?.totals?.insOpex,
                              tooltip: {
                                desc: "Annual facility, equipment, and liability insurance expenditures.",
                                formula: "Insurance = insuranceMonthly * 12",
                              },
                            },
                          ]}
                        />
                        <TableRow
                          label="EBITDAR"
                          data={columns}
                          dk="ebitdar"
                          total={data.totals.ebitdar}
                          highlight
                          tooltip={OPCO_FORMULAS.ebitdar}
                        />
                        <TableRow
                          label="EBITDAR MARGIN"
                          data={columns}
                          dk="ebitdarMargin"
                          total={data.totals.ebitdarMargin}
                          highlight
                          isPercent
                          tooltip={OPCO_FORMULAS.ebitdarMargin}
                        />

                        <TableSection
                          title="Rent & Taxes"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Building Rental"
                          data={columns}
                          dk="rent"
                          total={data.totals.rent}
                          isIndent
                          tooltip={OPCO_FORMULAS.rent}
                          isSubtractor
                        />
                        <TableRow
                          label="EBITDA"
                          data={columns}
                          dk="ebitda"
                          total={data.totals.ebitda}
                          highlight
                          tooltip={OPCO_FORMULAS.ebitda}
                        />
                        {assumptions?.includeFinancing && (
                          <>
                            <TableRow
                              label="Interest Expense"
                              data={columns}
                              dk="interest"
                              total={data.totals.interest}
                              isIndent
                              isSubtractor
                              tooltip="Annual interest expense on OpCo-level debt."
                            />
                            <TableRow
                              label="Principal Repayment"
                              data={columns}
                              dk="principal"
                              total={data.totals.principal}
                              isIndent
                              isSubtractor
                              tooltip="Annual principal repayments on OpCo-level debt."
                            />
                            <TableRow
                              label="Ending Debt Balance"
                              data={columns}
                              dk="debtBalance"
                              total={columns[columns.length - 1]?.debtBalance || 0}
                              isIndent
                              tooltip="Ending outstanding balance of OpCo-level debt."
                            />
                          </>
                        )}
                        <TableRow
                          label="Corporate Tax"
                          data={columns}
                          dk="tax"
                          total={data.totals.tax}
                          isIndent
                          tooltip={OPCO_FORMULAS.tax}
                          isSubtractor
                        />
                        <TableRow
                          label="NET INCOME"
                          data={columns}
                          dk="netIncome"
                          total={data.totals.netIncome}
                          highlight
                          emerald
                          tooltip={OPCO_FORMULAS.netIncome}
                        />
                        <TableRow
                          label="NET PROFIT MARGIN"
                          data={columns}
                          dk="netMargin"
                          total={data.totals.netMargin}
                          highlight
                          emerald
                          isPercent
                          tooltip={OPCO_FORMULAS.netMargin}
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLE 2: Standard Statement of Cash Flows */}
              {(viewMode === "all" || viewMode === "statement") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#1C6048] border-b border-[#1C6048] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      2. Clinical Cash Flows
                    </h3>
                  </div>
                  <div
                    className={`custom-scrollbar relative opco-table-scroll ${viewMode === "all" ? "overflow-x-auto" : "overflow-auto max-h-[calc(100vh-320px)]"}`}
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
                          tooltip="OpCo Net Income."
                        />
                        {expandedCfo && (
                          <>
                            <TableRow
                              label="Cash Inflows (Clinical Revenues)"
                              data={columns}
                              dk="cfo_in"
                              total={data.totals.cfo_in}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfoIn}
                              onExpand={() => setExpandedCfoIn(!expandedCfoIn)}
                              tooltip="OpCo Clinical Inpatient & Outpatient Revenues."
                            />
                            {expandedCfoIn && (
                              <TableRow
                                label="Clinical Revenue Receipts"
                                data={columns}
                                dk="cfo_in"
                                total={data.totals.cfo_in}
                                isDoubleIndent
                                hasDoubleConnector
                                tooltip="Patient cash inflows collected across operations."
                              />
                            )}
                            <TableRow
                              label="Cash Outflows (Operating OPEX & Tax)"
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
                              tooltip="OPEX costs (staffing, rent, doc fees, supplies, utilities, marketing, insurance, management fees, corporate taxes)."
                            />
                            {expandedCfoOut && (
                              <>
                                <TableRow
                                  label="Medical Supplies"
                                  data={columns}
                                  dk="totalMedSupp"
                                  total={data.totals.totalMedSupp}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Costs for medicines and clinical supplies."
                                />
                                <TableRow
                                  label="Doctor Fees"
                                  data={columns}
                                  dk="totalDocFee"
                                  total={data.totals.totalDocFee}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Professional specialist provider honorariums."
                                />
                                <TableRow
                                  label="Staffing Costs"
                                  data={columns}
                                  dk="staffCost"
                                  total={data.totals.staffCost}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Nurses, clinical techs, and operational staffing wages."
                                />
                                <TableRow
                                  label="Administrative Expense"
                                  data={columns}
                                  dk="adminOpex"
                                  total={data.totals.adminOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Administrative support overhead calculated based on administrative expense rate assumptions."
                                />
                                <TableRow
                                  label="Utilities Expense"
                                  data={columns}
                                  dk="utilOpex"
                                  total={data.totals.utilOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Clinic utilities expense based on utility expense rate assumptions."
                                />
                                <TableRow
                                  label="Marketing Expense"
                                  data={columns}
                                  dk="mktgOpex"
                                  total={data.totals.mktgOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Marketing expenditures aligned with marketing expense rate assumptions."
                                />
                                <TableRow
                                  label="Hospital Operator Fee"
                                  data={columns}
                                  dk="operatorOpex"
                                  total={data.totals.operatorOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Hospital management and operator fees."
                                />
                                <TableRow
                                  label="Operational Insurance"
                                  data={columns}
                                  dk="insOpex"
                                  total={data.totals.insOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Annual facility, equipment, and liability insurance expenditures."
                                />
                                <TableRow
                                  label="Facility Lease Rent"
                                  data={columns}
                                  dk="rent"
                                  total={data.totals.rent}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Payments delivered to the Property Company (PropCo)."
                                />
                                <TableRow
                                  label="Corporate Income Tax"
                                  data={columns}
                                  dk="tax"
                                  total={data.totals.tax}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Taxes swept across OpCo financial distributions."
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
                          tooltip="Working capital outlays and enterprise exit proceeds."
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
                              tooltip="Capital received from OpCo enterprise valuation and accumulated cash buffer at exit."
                            />
                            {expandedCfiIn && (
                              <>
                                <TableRow
                                  label={`Clinical Enterprise Value (${assumptions?.exitMultiple || 15}x EBITDA)`}
                                  data={columns}
                                  dk="exitEv"
                                  total={data.totals.exitEv}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  tooltip="Clinical enterprise valuation calculated as: Annualized Operating EBITDA in Exit Year × Exit Multiple."
                                />
                                <TableRow
                                  label="Clinical Accumulated Retained Cash Buffer"
                                  data={columns}
                                  dk="exitRetained"
                                  total={data.totals.exitRetained}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  tooltip="Accumulated clinical reserves (20% retained after dividends) distributed to partners at exit."
                                />
                              </>
                            )}
                            <TableRow
                              label="Cash Outflows (Setup & Working Capital CapEx)"
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
                              tooltip="Initial pre-operating working capital outlays (Year 3 operational buffer)."
                            />
                            {expandedCfiOut && (
                              <TableRow
                                label="Pre-Operating Setups & Work Capital"
                                data={columns}
                                dk="cfi_out"
                                total={data.totals.cfi_out}
                                isDoubleIndent
                                hasDoubleConnector
                                isSubtractor
                                tooltip="Required upfront clinical buffer/reserves."
                              />
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
                          tooltip="Sponsor equity investments and OpCo dividend payouts."
                        />
                        {expandedCff && (
                          <>
                            <TableRow
                              label="Cash Inflows (Sponsor Equity Contributions)"
                              data={columns}
                              dk="cff_in"
                              total={data.totals.cff_in}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCffIn}
                              onExpand={() => setExpandedCffIn(!expandedCffIn)}
                              tooltip="Initial equity funding received from Operator & Sponsor Partners."
                            />
                            {expandedCffIn && (
                              <>
                                <TableRow
                                  label="Sponsor Injected Equity"
                                  data={columns}
                                  dk="sponsorEquity"
                                  total={data.totals.sponsorEquity}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  tooltip="Firms-injected startup operating capital."
                                />
                                {assumptions?.includeFinancing && (
                                  <TableRow
                                    label="OpCo Debt Drawdowns"
                                    data={columns}
                                    dk="debtDraw"
                                    total={data.totals.debtDraw}
                                    isDoubleIndent
                                    hasDoubleConnector
                                    tooltip="Debt drawdowns siphoned to fund clinical setups."
                                  />
                                )}
                              </>
                            )}
                            <TableRow
                              label="Cash Outflows (Partner Distributions & Dividends)"
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
                              tooltip="Standard cash dividends paid to Operator & Sponsor Partners and exit payouts."
                            />
                            {expandedCffOut && (
                              <>
                                <TableRow
                                  label="Clinical Free Cash Flow Distributions"
                                  data={columns}
                                  dk="distributions"
                                  total={data.totals.distributions}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Annual operating yields sent back to sponsors."
                                />
                                {assumptions?.includeFinancing && (
                                  <TableRow
                                    label="Debt Principal Repayments"
                                    data={columns}
                                    dk="principal"
                                    total={data.totals.principal}
                                    isDoubleIndent
                                    hasDoubleConnector
                                    isSubtractor
                                    tooltip="Annual principal repayments siphoned out of distributions."
                                  />
                                )}
                              </>
                            )}
                          </>
                        )}

                        <TableRow
                          label="Project Free Cash Flow (FCF)"
                          data={columns}
                          dk="fcf"
                          total={data.totals.fcf}
                          highlight
                          indigo
                          tooltip="Unlevered Free Cash Flow (Pre-financing, Pre-tax Ex-Land) representing the core asset performance."
                        />
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

              {/* TABLE 3: Capital Cascade & Sponsor Returns */}
              {(viewMode === "all" || viewMode === "cf") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#1C6048] border-b border-[#1C6048] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      3. Sponsor Cascade & Returns
                    </h3>
                  </div>
                  <div
                    className={`custom-scrollbar relative opco-table-scroll ${viewMode === "all" ? "overflow-x-auto" : "overflow-auto max-h-[calc(100vh-320px)]"}`}
                  >
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                      {renderTableHeaders()}
                      <tbody>
                        <TableSection
                          title="Free Cash Flow & Retained Earnings"
                          colSpan={columns.length + 2}
                          type="emerald"
                        />
                        <TableRow
                          label="Cumulative Net Income"
                          data={columns}
                          dk="cumNI"
                          highlight
                          crossover
                          bold
                          indigo
                          tooltip={OPCO_FORMULAS.cumNI}
                        />
                        <TableRow
                          label={`Distributable Profit (${assumptions.dividendPayoutRatio ?? 100}%)`}
                          data={columns}
                          dk="distributableProfit"
                          total={data.totals.distributableProfit}
                          highlight
                          tooltip={OPCO_FORMULAS.distributableProfit}
                        />
                        <TableRow
                          label={`Retained Earnings (${100 - (assumptions.dividendPayoutRatio ?? 100)}%)`}
                          data={columns}
                          dk="retainedThisYear"
                          total={data.totals.retainedThisYear}
                          isIndent
                          tooltip={OPCO_FORMULAS.retainedThisYear}
                        />
                        <TableRow
                          label="Cumulative Retained Cash"
                          data={columns}
                          dk="cumulativeRetainedEarnings"
                          highlight
                          crossover
                          bold
                          indigo
                          tooltip={OPCO_FORMULAS.cumulativeRetainedEarnings}
                        />

                        <TableSection
                          title="Terminal Value (Exit)"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="OpCo Enterprise Value (EV)"
                          data={columns}
                          dk="ev"
                          total={data.totals.ev}
                          highlight
                          tooltip={OPCO_FORMULAS.ev}
                        />
                        <TableRow
                          label="+ Retained Cash Sweep"
                          data={columns}
                          dk="cumulativeRetainedEarnings"
                          total={data.totals.retainedThisYear}
                          isIndent
                          tooltip={OPCO_FORMULAS.cumulativeRetainedEarnings}
                        />
                        <TableRow
                          label="Total Exit Equity Value"
                          data={columns}
                          dk="opCoExit"
                          total={data.totals.opCoExit}
                          highlight
                          tooltip={OPCO_FORMULAS.opCoExit}
                        />
                        <TableRow
                          label="Strategic Ptnr Proceeds (51%)"
                          data={columns}
                          dk="pA_Exit"
                          total={data.totals.pA_Exit}
                          isIndent
                          tooltip={OPCO_FORMULAS.pA_Exit}
                        />
                        <TableRow
                          label="Vasanta Proceeds (49%)"
                          data={columns}
                          dk="pB_Exit"
                          total={data.totals.pB_Exit}
                          isIndent
                          tooltip={OPCO_FORMULAS.pB_Exit}
                        />

                        <TableSection
                          title="Vasanta Returns (49%)"
                          colSpan={columns.length + 2}
                          type="emerald"
                        />
                        <TableRow
                          label="Partner B Investment"
                          data={columns}
                          dk="pB_Outlay"
                          total={data.totals.pB_Outlay}
                          isIndent
                          tooltip={OPCO_FORMULAS.pB_Outlay}
                        />
                        <TableRow
                          label="Partner B Dividend"
                          data={columns}
                          dk="shareB"
                          total={data.totals.shareB}
                          isIndent
                          tooltip={OPCO_FORMULAS.shareB}
                        />
                        <TableRow
                          label="Terminal Exit Proceeds"
                          data={columns}
                          dk="pB_Exit"
                          total={data.totals.pB_Exit}
                          isIndent
                          tooltip={OPCO_FORMULAS.pB_Exit}
                        />
                        <TableRow
                          label="VG NET CASH FLOW"
                          data={columns}
                          dk="pB_Net"
                          total={data.totals.pB_Net}
                          highlight
                          emerald
                          tooltip={OPCO_FORMULAS.pB_Net}
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
