// Formula and description definitions for clinical OpCo, property PropCo, and Consolidated Cascade rows.
// Aligned with Indonesian PSAK 16 / PSAK 19 regulatory frameworks and the look-through model definitions.

export interface TooltipInfo {
  desc: string;
  formula?: string;
}

export const OPCO_FORMULAS: Record<string, TooltipInfo> = {
  bor: {
    desc: "Bed Occupancy Rate (BOR): Percentage of total master hospital beds occupied on average throughout the operational year.",
    formula: "Starts at 'borStart' in Year 1, increments by 'borIncrement' annually, capped at 'borMax' in subsequent years."
  },
  ipCases: {
    desc: "Estimated annual inpatient admissions (Clinical Cases) calculated from Bed Days sold and average length of stay (ALOS).",
    formula: "Inpatient Cases = (Beds * Days in Year * BOR%) / ALOS\n(Note: Days in Year dynamically handles Leap Years: 366 vs 365)"
  },
  opVisits: {
    desc: "Estimated outpatient consults and diagnostic outpatient visits scaled with inpatient case count via the outpatient-inpatient ratio.",
    formula: "Outpatient Visits = Inpatient Cases * opIpRatio"
  },
  ipRev: {
    desc: "Estimated gross clinical revenue from inpatient operations inside the facility, compounded by price escalation multiplier.",
    formula: "Inpatient Revenue = (Inpatient Cases * (ipRevenue Assumption * priceMultiplier)) / 1,000 [in Billion IDR]\n(Note: PriceMultiplier escalates at priceIncYears1_6 then priceIncYears7_plus)"
  },
  opRev: {
    desc: "Estimated gross revenue generated from outpatient visits, outpatient diagnostics, and day-care clinics.",
    formula: "Outpatient Revenue = (Outpatient Visits * (opRevenue Assumption * priceMultiplier)) / 1,000 [in Billion IDR]"
  },
  totalRev: {
    desc: "Net Revenue: Cumulative GAAP revenues generated from clinical clinical services after internal adjustments.",
    formula: "Net Revenue = Inpatient Revenue + Outpatient Revenue"
  },
  totalMedSupp: {
    desc: "Medical and surgical supplies procurement costs, adjusted by clinical medical supplies inflation benchmarks.",
    formula: "Medical Supplies = ((Inpatient Cases * ipMedSupply + Outpatient Visits * opMedSupply) * (1 + medSupplyInf%)^(Year - 1)) / 1,000 [in Billion IDR]"
  },
  totalDocFee: {
    desc: "Proportion of inpatient and outpatient gross clinical revenues paid as fees/commissions to physicians.",
    formula: "Doctor Fees = (docFeeIp% * Inpatient Revenue) + (docFeeOp% * Outpatient Revenue)"
  },
  grossProfit: {
    desc: "Gross Clinical Margin remaining to cover staff, lease rents, and operations after deducting clinical supplies and doctor commissions.",
    formula: "Gross Profit = Net Revenue - Medical Supplies - Doctor Fees"
  },
  staffCost: {
    desc: "Staffing & Labor OPEX covering admin, nurses, support, and doctors' salaries, escalating by staff payroll inflation.",
    formula: "Staff Cost = (monthlyStaffCost * 12) * (1 + staffInf%)^(Year - 1)"
  },
  recurringOpex: {
    desc: "Other Clinical General & Admin support OPEX, calculated as percentage allocations of total Net Revenue.",
    formula: "Other OpEx = (adminExpRate + utilExpRate + marketingExpRate + maintExpRate)% * Net Revenue"
  },
  ebitdar: {
    desc: "Earnings before Interest, Taxes, Depreciation, Amortization, and rent payments (pre-lease operational yield).",
    formula: "EBITDAR = Gross Profit - Staffing - Other OpEx"
  },
  ebitdarMargin: {
    desc: "EBITDAR Margin (%): Represents pre-lease clinical operating profitability relative to total revenues.",
    formula: "EBITDAR Margin = (EBITDAR / Total Revenue) * 100"
  },
  rent: {
    desc: "Annual facility building lease rent paid by clinical entity OpCo to PropCo physical developer.",
    formula: "Calculated via lease structures: Fixed Rent escalation % or EBITDA-linked rent formulas."
  },
  ebitda: {
    desc: "Operating Company earnings before interest, taxation, depreciation, and amortization.",
    formula: "EBITDA = EBITDAR - Building Rental"
  },
  tax: {
    desc: "Indonesian Corporate Income Tax liability on operating entity taxable earnings.",
    formula: "EBT Tax = Max(0, EBITDA) * corporateTax%\n(Note: Under current setup, OpCo has no interest or depreciation, hence EBT = EBITDA)"
  },
  netIncome: {
    desc: "Operating company consolidated net margin available for look-through distributions.",
    formula: "Net Income = EBITDA - Corporate Tax"
  },
  netMargin: {
    desc: "Net Profit Margin: Represents Operating Company's net operating clinical earnings as a percentage of total revenues.",
    formula: "Net Profit Margin = (Net Income / Total Revenue) * 100"
  },
  cumNI: {
    desc: "Cumulative net operating clinical earnings recorded since inception.",
    formula: "Cumulative Net Income (Year t) = Cumulative Net Income (Year t-1) + Net Income (Year t)"
  },
  distributableProfit: {
    desc: "Annual clinical dividends distributed to sponsors at the dividend payout ratio.",
    formula: "Distributable Dividend = Net Income * dividendPayoutRatio%"
  },
  retainedThisYear: {
    desc: "Net profits swept into corporate operating cash reserve to cover operational cash buffers.",
    formula: "Retained Profit = Net Income - Distributable Dividend"
  },
  cumulativeRetainedEarnings: {
    desc: "Clinical capital reserves and cash balances held inside the OpCo accounts.",
    formula: "Cumulative Retained Cash (Year t) = Cumulative Cash (Year t-1) + Retained Profit (Year t)"
  },
  ev: {
    desc: "Operating enterprise appraisal valuation at designated exit year.",
    formula: "Enterprise Value = Stabilized Operational EBITDA * exitMultiple (or Cap Rate equation if designated)"
  },
  opCoExit: {
    desc: "Total look-through clinical valuation distributed upon transaction windup.",
    formula: "Total Exit Equity Value = Enterprise Value + Retained Cash Sweep"
  },
  pA_Exit: {
    desc: "clinical exit proceed share apportioned to Strategic Local entity Partner (51%).",
    formula: "Strategic Proceeds = Total Exit Equity Value * 51%"
  },
  pB_Exit: {
    desc: "clinical exit proceed share apportioned look-through to Vasanta (49%).",
    formula: "Vasanta Proceeds = Total Exit Equity Value * 49%"
  },
  pA_Outlay: {
    desc: "Capital contribution (outlay) by Strategic Local entity Partner (51%) during setup/pre-op years.",
    formula: "Strategic Outlay = OpCo Total Investment * 51% (Negative during setup years)"
  },
  pB_Outlay: {
    desc: "Capital contribution (outlay) apportioned to Vasanta (49%) during setup/pre-op years.",
    formula: "Vasanta Outlay = OpCo Total Investment * 49% (Negative during setup years)"
  },
  shareA: {
    desc: "Strategic Partner's look-through share (51%) of annual clinical dividends.",
    formula: "Strategic Dividend = Distributable Dividend * 51%"
  },
  shareB: {
    desc: "Vasanta's look-through share (49%) of annual clinical dividends.",
    formula: "Vasanta Dividend = Distributable Dividend * 49%"
  },
  pA_Net: {
    desc: "Strategic Partner's net look-through cash yield including outlays, dividends, and exit proceeds.",
    formula: "Strategic Net Flow = Strategic Outlay + Strategic Dividend + Strategic Exit"
  },
  pB_Net: {
    desc: "Vasanta's net look-through cash yield including outlays, dividends, and exit proceeds.",
    formula: "Vasanta Net Flow = Vasanta Outlay + Vasanta Dividend + Vasanta Exit"
  }
};

export const PROPCO_FORMULAS: Record<string, TooltipInfo> = {
  landSpend: {
    desc: "Direct capitalized expenditures for property land plot acquisition.",
    formula: "Capitalized Land Outlay = (landArea * landPrice) / 1,000 [in Billion IDR]"
  },
  hardSpend: {
    desc: "Sum of pre-operating physical asset outlays capitalized as Property, Plant, & Equipment (PPE) under PSAK 16.",
    formula: "Hard Costs = Construction + Medical Equipment + Infrastructure + FF&E + Sharing Development"
  },
  softSpend: {
    desc: "Development overheads, advisory fees, VAT, contingencies, and pre-operating outlays under PSAK 16 & PSAK 19.",
    formula: "Soft Costs = Consultant + License + VAT + Contingency + Dev. G&A + Dev. CAR"
  },
  totalSpend: {
    desc: "Project Development Spending: Combined land, hard, and soft capital outlays during development timeline.",
    formula: "Development Spend = Land CapEx + Total Capitalized Hard Costs + Total Soft Costs"
  },
  debtDraw: {
    desc: "Upfront project development funding drawn from structured building/mortgage construction financing lines.",
    formula: "Debt Drawdown = Upfront Total Capex (Excluding Land) * effectiveLtv%\n(Note: Land, Leased MedEq, and deferred costs are excluded from drawdowns)"
  },
  revenue: {
    desc: "Holding company property rental lease proceeds collected from clinical tenant (OpCo).",
    formula: "Rental Revenue = Matches 'Building Rental' paid by OpCo clinical operations"
  },
  maintOpex: {
    desc: "Ongoing physical structural preservation and capital upkeep charges for property facilities.",
    formula: "Maintenance Expense = Rental Revenue * propCoMaintPct%"
  },
  taxOpex: {
    desc: "Capital property real estate/building taxes (Pajak Bumi dan Bangunan - PBB) and municipal levies.",
    formula: "Building Taxes = buildCost * buildingTaxRate%"
  },
  overheadOpex: {
    desc: "Holding property company administrative, management, and localized operational support expenses.",
    formula: "Overhead Expense = Flat monthly charge or percentage scaled rate based on property assets"
  },
  devGa: {
    desc: "Project developer General & Administrative costs. Pre-operating start-up costs under PSAK 19 must be expensed as incurred.",
    formula: "Total Dev G&A = Monthly Dev. G&A * totalDevMonths\n(Note: Warning shown in audit logs if capitalized vs expensed in P&L)"
  },
  devCar: {
    desc: "Developer's Contractor's All Risk (CAR) construction insurance policies.",
    formula: "CAR Cost = buildCost * devCarPct%"
  },
  ffeReserve: {
    desc: "Reservation sweep taken from rents to fund ongoing replacement cycles of physical furniture and clinical room fittings.",
    formula: "FF&E Reserve = Rental Revenue * ffeReservePct%"
  },
  medEqLeaseOpex: {
    desc: "Operating clinical leases paid for rented medical equipment prior to acquisition buy-out event.",
    formula: "Lease Outlay = medEqLeaseMonthly * Early operational months"
  },
  ebitda: {
    desc: "Property NOI (Net Operating Income) available for debt service and taxes before interest, dep, and corp tax.",
    formula: "EBITDA = Rental Revenue - Maintenance - Land/Building Taxes - Overhead - Dev G&A - Dev CAR - FF&E sweeps - Equipment Leases"
  },
  interest: {
    desc: "Structured interest payments paid over property financing schedule, incorporating interest-only grace periods.",
    formula: "Interest Expense = Outstanding Loan Balance * interestRate%"
  },
  principal: {
    desc: "Amortizing scheduled loan principal repayments paid down to mortgage financier.",
    formula: "Principal Repaid = Monthly mortgage amortization PMT - Interest portion"
  },
  dscr: {
    desc: "Debt Service Coverage Ratio (DSCR): Metric measuring safety buffer of physical property yields relative to debt service.",
    formula: "DSCR = EBITDA (NOI) / (Interest Expense + Principal Repayments)\n(Benchmark: Values above 1.25x are standard for hospital financing)"
  },
  dep: {
    desc: "Annual depreciation charges of capitalized physical facilities, systems, soft costs, and medical equipment.",
    formula: "Under PSAK 16 & PSAK 19: Calculated by Straight-Line (SL) or Double Declining (DB) methods based on asset lives."
  },
  ebt: {
    desc: "Property earnings before tax (accounting taxable profits) after non-cash depreciation and financial interest.",
    formula: "EBT = EBITDA - Interest Expense - Depreciation (D&A)"
  },
  corpTax: {
    desc: "GAAP corporate income tax calculated on property entity's taxable earnings.",
    formula: "Tax Expense = Max(0, EBT) * corporateTax%"
  },
  netIncome: {
    desc: "Property Company net GAAP income remaining after financing, depreciation, and corporate taxes.",
    formula: "Net Income = EBT - Corporate Tax"
  },
  deferredCapex: {
    desc: "Direct cash buyout outflows to acquire physical ownership of previously-leased medical equipment in Year N.",
    formula: "Acquisition Buyout = Leased Med. Equipment Value (occurring at buyout year)"
  },
  netExitProceeds: {
    desc: "Net cash realized from property valuation asset sale after liquidating remaining senior mortgages.",
    formula: "Property Exit Yield = Facility Valuation - Remaining Debt - Land Cost (if separate) - Selling Costs"
  },
  opFcfe: {
    desc: "Levered free cash flow generated purely from rental operations, after interest and principal payments but before exit proceeds.",
    formula: "FCFE (Op) = Net Income + Depreciation - Principal - Deferred Capex"
  },
  fcfe: {
    desc: "Levered Free Cash Flow to Equity measuring actual cash available to property developers and equity sponsors.",
    formula: "FCFE = FCFE (Operating) + Net Exit Proceeds"
  },
  cumFcfe: {
    desc: "Cumulative levered equity cash yield distributed to property sponsors since project launch.",
    formula: "Cumulative FCFE (Year t) = Cumulative FCFE (Year t-1) + FCFE (Year t)"
  },
  interestExLand: {
    desc: "Theoretical property mortgage interest calculated if land purchase was excluded from debt limits.",
    formula: "Outstanding Debt Ex-Land * interestRate%"
  },
  principalExLand: {
    desc: "Theoretical loan principal amortization repayments if land was excluded from financing limits.",
    formula: "Calculated based on Ex-land debt PMT amortization curves"
  },
  ebtExLand: {
    desc: "Theoretical taxable earnings for PropCo under ex-land projection boundaries.",
    formula: "EBT Ex-Land = EBITDA - Interest Ex-Land - Depreciation"
  },
  corpTaxExLand: {
    desc: "Theoretical corporate tax under ex-land projection boundaries.",
    formula: "Tax Ex-Land = Max(0, EBT Ex-Land) * corporateTax%"
  },
  netExitProceedsExLand: {
    desc: "Theoretical net proceeds after subtracting remaining ex-land mortgage balance.",
    formula: "Ex-land Exit Return = Valuation - Outstanding Debt Ex-Land - Land value deduction - transactional cuts"
  },
  opFcfeExLand: {
    desc: "Operational free cash flows (excluding land) before exit proceeds.",
    formula: "FCFE Op (Ex-Land) = Net Income Ex-Land + Dep - Principal Ex-Land - Deferred Purchases"
  },
  fcfeExLand: {
    desc: "Theoretical free cash flows distributed to property sponsors if land is completely omitted from finances.",
    formula: "FCFE (Ex-Land) = FCFE Op (Ex-Land) + Net Exit Proceeds Ex-Land"
  },
  cumFcfeExLand: {
    desc: "Cumulative look-through levered cash yield under ex-land investment borders.",
    formula: "Cumulative FCFE Ex-Land (Year t) = Cumulative Year (t-1) + FCFE Ex-Land (Year t)"
  }
};

export const CONSOLIDATED_FORMULAS: Record<string, TooltipInfo> = {
  propCoOperatingFlow: {
    desc: "Property Company Levered FCFE (Operating) swept directly into the combined financial lookup. Excludes initial investment and terminal exit.",
    formula: "Matches 'FCFE (Operating)' of PropCo Cascade."
  },
  propCoInvestmentFlow: {
    desc: "Initial equity required for PropCo development (Capex, soft costs, and land).",
    formula: "Matches negative total equity required for PropCo phase."
  },
  propCoExitFlow: {
    desc: "Property Company Exit Proceeds swept into the combined financial lookup.",
    formula: "Matches PropCo Net Exit Proceeds."
  },
  propCoFlow: {
    desc: "Property Company Levered FCFE swept directly into the combined financial lookup.",
    formula: "Matches 100% of 'FCFE (Levered)' of PropCo Cascade."
  },
  opCoInvestmentFlow: {
    desc: "Partner B's share (49%) of initial OpCo equity capital requirements.",
    formula: "Matches the 'Outlay' of Partner B in Year 1 and Year 2 in OpCo Cascade."
  },
  opCoOperatingDividendFlow: {
    desc: "Partner B's share (49%) of OpCo distributed clinical dividends from profitable operations.",
    formula: "Matches 'Dividend' of Partner B swept to look-through combined sponsors."
  },
  opCoExitFlow: {
    desc: "Strategic share (49%) of OpCo clinical operations terminal valuation swepped to combined sponsors upon exit.",
    formula: "OpCo Total Exit Equity Value * 49%"
  },
  netFlow: {
    desc: "Net Combined Cash Flow representing total look-through levered equity flows paid to consolidated sponsors.",
    formula: "Combined Cash Flow = PropCo FCFE (100%) + OpCo Dividends (49%) + OpCo Exit Proceeds (49%)"
  },
  cumCf: {
    desc: "Consolidated Cumulative net return position achieved by lookup sponsors across the model duration.",
    formula: "Cumulative Combined cash (Year t) = Cumulative (Year t-1) + Combined Cash Flow (Year t)"
  },
  lookThroughRevenue: {
    desc: "GAAP consolidated revenue representing physical rental income and strategic share of clinical operations.",
    formula: "Look-Through Revenue = OpCo Net Revenue * 49% + PropCo Rental Revenue * 100%"
  },
  lookThroughEbitda: {
    desc: "Consolidated earnings before interest, tax, depreciation, and amortization. Note that internal rental transfers perfectly net out.",
    formula: "Look-Through EBITDA = OpCo EBITDA * 49% + PropCo EBITDA * 100% + Rent adjustments"
  },
  lookThroughNetIncome: {
    desc: "Look-through GAAP net profit representing clinical operations and physical rents.",
    formula: "Look-Through Net Income = OpCo Net Income * 49% + PropCo Net Income * 100%"
  },
  lookThroughMargin: {
    desc: "Standard consolidated Net Margin tracking overall strategic clinical and developer yield and efficiency.",
    formula: "Blended Net Margin = Consolidated Net Income / Consolidated Revenue"
  }
};
