import React, { useState } from "react";
import { Info, Building2, Stethoscope, Landmark } from "lucide-react";

interface LifetimePnLTableProps {
  opCoData: any;
  propCoData: any;
  consolidatedData?: any;
}

const formatNumber = (val: number) => {
  if (val === null || val === undefined) return "";
  const isNegative = val < 0;
  const absVal = Math.abs(val);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(absVal || 0);
  return isNegative ? `(${formatted})` : formatted;
};

export const LifetimePnLTable: React.FC<LifetimePnLTableProps> = ({
  opCoData,
  propCoData,
  consolidatedData,
}) => {
  const [activeSegment, setActiveSegment] = useState<
    "opco" | "propco" | "holdco"
  >("holdco");

  if (!propCoData?.totals || !opCoData?.totals) return null;

  const pTotals = propCoData.totals;
  const oTotals = opCoData.totals;
  const cTotals = consolidatedData?.totals || {};

  let revenue = 0;
  let rows: any[] = [];
  let advisoryText = "";

  if (activeSegment === "propco") {
    // PropCo Revenue (Rent from OpCo)
    revenue = pTotals.revenue || 0;

    // Pre-opening expenses (Dev G&A, Dev CAR)
    const devGa = pTotals.devGa || 0;
    const devCar = pTotals.devCar || 0;
    const preOpening = devGa + devCar;

    // Property Operating Expenses
    const maintOpex = pTotals.maintOpex || 0;
    const taxOpex = pTotals.taxOpex || 0;
    const overheadOpex = pTotals.overheadOpex || 0;
    const medEqLeaseOpex = pTotals.medEqLeaseOpex || 0;

    const opExSubtotal =
      preOpening + maintOpex + taxOpex + overheadOpex + medEqLeaseOpex;
    const gop = revenue - opExSubtotal;
    const ffeReserves = pTotals.ffeReserve || 0;
    const ebitda = pTotals.ebitda || 0;
    const depreciation = pTotals.dep || 0;
    const ebit = ebitda - depreciation;
    const interest = pTotals.interest || 0;
    const ebt = ebit - interest;
    const tax = pTotals.corpTax || 0;
    const netProfit = pTotals.netIncome || 0;

    rows = [
      { label: "Net Rent Revenue / NOR", value: revenue, isBold: true },
      {
        label: "Operating Expenses (OpEx)",
        value: -opExSubtotal,
        isBold: true,
        isHeader: true,
      },
      { label: "Pre-Opening & Dev Expenses", value: -preOpening, indent: true },
      { label: "Facility Maintenance OPEX", value: -maintOpex, indent: true },
      { label: "Property Tax", value: -taxOpex, indent: true },
      {
        label: "Management / Overhead OPEX",
        value: -overheadOpex,
        indent: true,
      },
      { label: "Equipment Lease OPEX", value: -medEqLeaseOpex, indent: true },
      {
        label: "Gross Operating Profit (GOP)",
        value: gop,
        isBold: true,
        bgColor: "bg-[#1C6048]/5",
      },
      {
        label: "Finance & Reserves",
        value: -ffeReserves,
        isBold: true,
        isHeader: true,
      },
      { label: "FF&E Reserve Allocation", value: -ffeReserves, indent: true },
      { label: "EBITDA", value: ebitda, isBold: true, bgColor: "bg-[#F9F8F6]" },
      {
        label: "Depreciation & Amortization",
        value: -depreciation,
        indent: true,
      },
      { label: "EBIT", value: ebit, isBold: true, bgColor: "bg-[#F4F1EE]" },
      { label: "Interest Expense (Debt)", value: -interest, indent: true },
      {
        label: "EBT",
        value: ebit - interest,
        isBold: true,
        bgColor: "bg-[#F4F1EE]",
      },
      { label: "Corporate Income Tax", value: -tax, indent: true },
      { label: "Net Profit", value: netProfit, isBold: true, isFooter: true },
    ];
    advisoryText =
      "PSAK Advisory: Pre-opening development expenses (Dev G&A, Dev CAR) may require immediate expense treatment per PSAK 19. They are currently captured in PropCo expenses prior to operations.";
  } else if (activeSegment === "opco") {
    // OpCo Revenue
    revenue = oTotals.totalRev || 0;

    // Clinical Direct Costs
    const medSupplies = oTotals.totalMedSupp || 0;
    const docFees = oTotals.totalDocFee || 0;
    const clinicalDirectCosts = medSupplies + docFees;

    // Net Clinical Margin
    const netClinicalMargin = revenue - clinicalDirectCosts;

    // Administrative & Facility Overheads
    const staffCosts = oTotals.staffCost || 0;
    const otherOpEx = oTotals.otherOpex || 0;
    const preOpening =
      (opCoData.setupDetails?.jvaOpex || 0) +
      (opCoData.setupDetails?.commOpex || 0);
    const overheadsSubtotal = preOpening + staffCosts + otherOpEx;

    // OpCo EBITDAR (GOP)
    const ebitdar = oTotals.ebitdar || 0;

    // Fixed Obligations
    const rent = oTotals.rent || 0;
    const ebitda = oTotals.ebitda || 0;
    const tax = oTotals.tax || 0;
    const netProfit = oTotals.netIncome || 0;

    rows = [
      { label: "Gross Patient Service Revenue", value: revenue, isBold: true },
      {
        label: "Clinical Direct Costs (COGS)",
        value: -clinicalDirectCosts,
        isBold: true,
        isHeader: true,
      },
      {
        label: "Medical Supplies & Pharmacy",
        value: -medSupplies,
        indent: true,
      },
      { label: "Physician & Consultation Fees", value: -docFees, indent: true },
      {
        label: "Net Clinical Margin",
        value: netClinicalMargin,
        isBold: true,
        bgColor: "bg-[#1C6048]/10 text-[#1C6048]",
      },
      {
        label: "Administrative & Facility Overheads",
        value: -overheadsSubtotal,
        isBold: true,
        isHeader: true,
      },
      { label: "Pre-Opening Start-up Costs", value: -preOpening, indent: true },
      {
        label: "Personnel Expenses (Clinical & Admin)",
        value: -staffCosts,
        indent: true,
      },
      {
        label: "G&A Overheads (Util, Mktg, Ins)",
        value: -otherOpEx,
        indent: true,
      },
      {
        label: "EBITDAR (GOP)",
        value: ebitdar,
        isBold: true,
        bgColor: "bg-[#F9F8F6]",
      },
      {
        label: "Fixed Facility Expenses",
        value: -rent,
        isBold: true,
        isHeader: true,
      },
      { label: "Property Lease Expense (Rent)", value: -rent, indent: true },
      { label: "EBITDA", value: ebitda, isBold: true, bgColor: "bg-[#F9F8F6]" },
      { label: "Provision for Income Tax", value: -tax, indent: true },
      {
        label: "Net Operating Income (NOI)",
        value: netProfit,
        isBold: true,
        isFooter: true,
      },
    ];
    advisoryText =
      "The Clinical Throughput Waterfall tracks hospital performance from Gross Patient Revenues down to Net Clinical Margins, distinguishing variable clinical costs from fixed facility overheads.";
  } else if (activeSegment === "holdco") {
    // Look-Through P&L Waterfall
    const ltRevenue = cTotals.lookThroughRevenue || 0;
    const ltEbitda = cTotals.lookThroughEbitda || 0;
    const ltNetIncome = cTotals.lookThroughNetIncome || 0;
    const holdCoInterest = cTotals.holdCoInterest || 0;

    const pRevenue = pTotals.revenue || 0;
    const pEbitda = pTotals.ebitda || 0;
    const opCoClinicalRevenueShare = ltRevenue - pRevenue;
    const opCoEbitdaShare = ltEbitda - pEbitda;

    const ltOpEx = ltRevenue - ltEbitda;
    const pOpEx = pRevenue - pEbitda;
    const opCoOpExShare = opCoClinicalRevenueShare - opCoEbitdaShare;

    const entityBelowTheLine = ltEbitda - ltNetIncome;
    const finalHoldCoNi = ltNetIncome - holdCoInterest;

    // Set revenue so percentages work relative to Consolidated Revenue
    revenue = ltRevenue;

    rows = [
      {
        label: "Gross Consolidated Revenue",
        value: ltRevenue,
        isBold: true,
      },
      { label: "PropCo Asset Revenue (Rent)", value: pRevenue, indent: true },
      {
        label: "HoldCo Share of Clinical Revenue",
        value: opCoClinicalRevenueShare,
        indent: true,
      },
      {
        label: "Consolidated Operating Expenses",
        value: -ltOpEx,
        isBold: true,
      },
      { label: "PropCo Facility & Land Opex", value: -pOpEx, indent: true },
      {
        label: "HoldCo Share of Clinical Opex",
        value: -opCoOpExShare,
        indent: true,
      },
      {
        label: "Consolidated EBITDA",
        value: ltEbitda,
        isBold: true,
        bgColor: "bg-[#1E2F31]/5",
      },
      {
        label: "Depreciation, Entity Interest & Taxes",
        value: -entityBelowTheLine,
        indent: true,
      },
      {
        label: "Consolidated Net Income (Pre-HoldCo)",
        value: ltNetIncome,
        isBold: true,
      },
      {
        label: "HoldCo Debt Interest",
        value: -holdCoInterest,
        indent: true,
      },
      {
        label: "Net Income to HoldCo Equity",
        value: finalHoldCoNi,
        isBold: true,
        isFooter: true,
      },
    ];
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
      {/* Segmented Controller */}
      <div className="p-4 bg-[#F4F1EE] border-b border-[#D8D8D8] flex justify-between items-center">
        <h4 className="text-xs font-bold text-[#1E2F31] uppercase tracking-wider">
          Lifetime P&L Summary
        </h4>
        <div className="flex bg-[#EFEBE7] p-1 rounded-lg border border-[#D8D8D8]">
          <button
            onClick={() => setActiveSegment("opco")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${
              activeSegment === "opco"
                ? "bg-[#1C6048] text-white shadow-sm"
                : "text-[#8A8175] hover:bg-[#D8D8D8]/50"
            }`}
          >
            <Stethoscope size={14} />
            Clinical OpCo
          </button>
          <button
            onClick={() => setActiveSegment("propco")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${
              activeSegment === "propco"
                ? "bg-[#1C6048] text-white shadow-sm"
                : "text-[#8A8175] hover:bg-[#D8D8D8]/50"
            }`}
          >
            <Building2 size={14} />
            Property PropCo
          </button>
          <button
            onClick={() => setActiveSegment("holdco")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-[11px] font-bold transition-all ${
              activeSegment === "holdco"
                ? "bg-[#1C6048] text-white shadow-sm"
                : "text-[#8A8175] hover:bg-[#D8D8D8]/50"
            }`}
          >
            <Landmark size={14} />
            HoldCo VG
          </button>
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#1E2F31] text-white/90">
            <th className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider border-r border-white/5">
              {activeSegment === "opco"
                ? "Clinical Operations Lifecycle"
                : activeSegment === "propco"
                  ? "Infrastructure Investment Lifecycle"
                  : "Consolidated Venture Lifecycle"}
            </th>
            <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider border-r border-white/5 w-[120px]">
              Amount (IDR B)
            </th>
            <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider w-[70px]">
              % of Revenue
            </th>
          </tr>
        </thead>
        <tbody className="text-[11px]">
          {rows.map((row, idx) => {
            const pct =
              revenue > 0 && row.value !== null
                ? (row.value / revenue) * 100
                : 0;
            const isSubRow = row.indent;

            return (
              <tr
                key={idx}
                className={`border-b border-[#D8D8D8]/40 hover:bg-[#F9F8F6] transition-colors ${row.isFooter ? "bg-[#EFEBE7] font-black" : row.isHeader ? "bg-[#F4F1EE]" : row.bgColor || ""}`}
              >
                <td
                  className={`px-4 py-2.5 ${row.isBold ? "font-bold text-[#1E2F31]" : "text-[#4C4A4B]"} ${isSubRow ? "pl-8 border-l-2 border-[#1C6048]/20" : ""}`}
                >
                  {row.label}
                </td>
                <td
                  className={`px-4 py-2.5 text-right font-display whitespace-nowrap border-l border-[#D8D8D8]/40 ${row.isBold ? "font-bold" : ""}`}
                >
                  {row.value !== null ? formatNumber(row.value) : ""}
                </td>
                <td className="px-4 py-2.5 text-center font-display text-[#8A8175] border-l border-[#D8D8D8]/40">
                  {row.value !== null &&
                  row.value !== 0 &&
                  !row.label.includes("Revenue / NOR")
                    ? `${Math.abs(pct).toFixed(1)}%`
                    : ""}
                  {row.label.includes("Revenue / NOR") ? "100%" : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
