import {
  OpCoAssumptions,
  PropCoAssumptions,
  HoldCoAssumptions,
  OpCoModelData,
  PropCoModelData,
  ConsolidatedModelData,
  ProjConfig,
  EngineTotals,
  EntityModelData,
} from "./types";

export const applySafeMathPrecision = <T>(data: T): T => {
  if (data === null || data === undefined) return data;
  if (typeof data === "number") {
    // Strategic Precision Rounding Wrapper to eliminate IEEE 754 float precision errors
    return Number(Math.round(data * 1e6) / 1e6) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => applySafeMathPrecision(item)) as unknown as T;
  }
  if (typeof data === "object") {
    const roundedObj: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        roundedObj[key] = applySafeMathPrecision((data as any)[key]);
      }
    }
    return roundedObj as T;
  }
  return data;
};

export const calculatePMT = (rate: number, nper: number, pv: number): number =>
  rate === 0 ? -(pv / nper) : -(pv * rate) / (1 - Math.pow(1 + rate, -nper));

export const calculatePayback = (
  cfs: number[],
  frequency: string = "annual",
): number => {
  if (!cfs || cfs.length === 0) return 0;
  let cumulative = 0;
  for (let i = 0; i < cfs.length; i++) {
    let prevCumulative = cumulative;
    cumulative += cfs[i] || 0;
    if (cumulative >= 0 && prevCumulative < 0) {
      const fraction = Math.abs(prevCumulative) / (cfs[i] || 1);
      const periods = i + fraction;
      return frequency === "monthly" ? periods / 12 : periods;
    }
  }
  return 0; // Return 0 if the project never catches up, preventing fake extrapolation
};

export const calculateIRR = (
  cfs: number[],
  frequency: string = "annual",
): number => {
  if (!cfs || cfs.length === 0) return 0;
  let rate = frequency === "monthly" ? 0.01 : 0.1;
  for (let i = 0; i < 150; i++) {
    let npv = 0,
      dNpv = 0;
    for (let t = 0; t < cfs.length; t++) {
      const val = cfs[t] || 0;
      npv += val / Math.pow(1 + rate, t);
      if (t > 0) dNpv -= (t * val) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(dNpv) < 1e-12) break;
    let newRate = rate - npv / dNpv;
    if (Math.abs(newRate - rate) < 1e-7) {
      if (frequency === "monthly") {
        const annualEquivalent = Math.pow(1 + newRate, 12) - 1;
        if (isNaN(annualEquivalent) || !isFinite(annualEquivalent)) return 0;
        return annualEquivalent;
      }
      return newRate;
    }
    rate = newRate;
  }
  return 0;
};

export const calculateNPV = (
  cfs: number[],
  rate: number,
  frequency: string = "annual",
): number => {
  if (!cfs) return 0;
  const discountRate = rate || 12;
  if (frequency === "monthly") {
    const rMonthly = Math.pow(1 + discountRate / 100, 1 / 12) - 1;
    return cfs.reduce(
      (acc, val, t) => acc + (val || 0) / Math.pow(1 + rMonthly, t),
      0,
    );
  }
  return cfs.reduce(
    (acc, val, i) => acc + (val || 0) / Math.pow(1 + discountRate / 100, i),
    0,
  );
};

export const DEFAULT_HOLDCO_ASSUMPTIONS: HoldCoAssumptions = {
  includeFinancing: true,
  ltvRatio: 100,
  interestRate: 8.25,
  loanTenor: 15,
  ioGracePeriodYears: 2,
};

export const DEFAULT_OPCO_ASSUMPTIONS: OpCoAssumptions = {
  beds: 120,
  alos: 4,
  opIpRatio: 40,
  borStart: 45,
  borMax: 65,
  borIncrement: 5,
  ipRevenue: 25,
  opRevenue: 0.5,
  priceIncYears1_6: 6,
  priceIncYears7_plus: 5,
  monthlyStaffCost: 3.8,
  staffInf: 4,
  ipMedSupply: 4.5,
  opMedSupply: 0.2,
  medSupplyInf: 3,
  adminExpRate: 2,
  utilExpRate: 5,
  mktgExpRate: 2,
  operatorFeeRate: 2.5,
  insuranceMonthly: 52.3,
  docFeeIp: 16,
  docFeeOp: 24,
  rentStructureType: "flatEbitdar",
  rentFlatEbitdarRate: 15,
  rentRevRate: 6,
  rentProfitRate: 2,
  rentTier1Rate: 15,
  rentTier2Rate: 15,
  rentTier3Rate: 15,
  rentTier1Limit: 1.8,
  rentTier2Limit: 2.2,
  corporateTax: 22,
  partnerAEquity: 41.87,
  partnerBEquity: 40.23,
  jvaOpex: 2.5,
  commOpex: 15,
  workingCapitalOpex: 64.671175,
  sharingPercentA: 51.0,
  equitySplitY1: 100,
  discountRate: 12,
  holdCoDiscountRate: 11,
  includeTerminalValue: true,
  exitMultiple: 15,
  sellingCosts: 0,
  dividendPayoutRatio: 80,
  includeFinancing: false,
  ltvRatio: 0,
  interestRate: 8.25,
  loanTenor: 15,
  ioGracePeriodYears: 2,
  amortizationYears: 10,
};

export const DEFAULT_PROPCO_ASSUMPTIONS: PropCoAssumptions = {
  linkToOpCo: true,
  manualBaseRent: 35,
  manualRentEscalation: 3,
  includeLand: false,
  isLandLeased: false,
  monthlyLandLeaseRateSqm: 45000,
  landLeaseTermYears: 15,
  landLeaseIncrementPct: 5,
  landLeaseIncrementYears: 5,
  landArea: 12643,
  landPrice: 15,
  buildArea: 13000,
  buildCost: 11.5,
  includeMedEq: true,
  medEqProcurement: "lease_operating",
  medEqLeaseMonthly: 0.875,
  medEqLeaseEscalationPct: 5,
  medEqLeaseEscalationYears: 3,
  medEqPurchaseOpYear: 4,
  medEqPurchaseAmount: 150000,
  capexMedEqQty: 1,
  capexMedEqPrice: 150000,
  capexInfraQty: 8310,
  capexInfraPrice: 0.7,
  includeFFE: true,
  capexFFEQty: 1,
  capexFFEPrice: 26000,
  capexSharingDevQty: 5361,
  capexSharingDevPrice: 0.8,
  capexContingencyPct: 2,
  capexConsultantPct: 2.5,
  capexLicensePct: 1.5,
  capexVat: 11,
  devDurationMonths: 24,
  equityDrawYear1Pct: 100,
  devGaMonthly: 0.5,
  devCarPct: 0.15,
  opOverheadMonthly: 0.2,
  opOverheadInc: 4,
  ffeReservePct: 2,
  includeFinancing: false,
  idcTreatment: "cash_pay",
  includePreOpInLtv: false,
  includeLandInLtv: false,
  drawdownScenario: "tranches",
  drawdownTranches: [20, 40, 60, 80, 100],
  ltv: 80,
  interestRate: 8.25,
  loanTenor: 15,
  ioGracePeriodYears: 2,
  repaymentType: "step_up",
  stepUpPercentages: [2, 2, 3, 3, 6, 6, 8, 8, 10, 10, 14, 14, 14],
  maintRate: 0,
  propTaxRate: 0,
  corporateTax: 22,
  useFinalTax: false,
  finalTaxRate: 10,
  discountRate: 11,
  depLifeBuilding: 20,
  depMethodBuilding: "SL",
  depLifeInfra: 20,
  depMethodInfra: "SL",
  depLifeMedEq: 10,
  depMethodMedEq: "SL",
  depLifeFFE: 20,
  depMethodFFE: "SL",
  depLifeSoftCost: 20,
  depMethodSoftCost: "SL",
  includeTerminalValue: true,
  exitYear: 10,
  exitMethod: "multiple",
  exitCapRate: 8.5,
  exitMultiple: 15,
  sellingCosts: 0,
};

export const CANCER_DATA = [
  { name: "Breast", cases: 66271, fill: "#1C6048" },
  { name: "Lung", cases: 38904, fill: "#9B8B70" },
  { name: "Cervical", cases: 36964, fill: "#99B6AA" },
  { name: "Colorectal", cases: 35676, fill: "#EFEBE7" },
  { name: "Liver", cases: 23805, fill: "#D8D8D8" },
];

export const INSURANCE_DATA = [
  { year: "2021", value: 14.3 },
  { year: "2022", value: 16.2 },
  { year: "2023", value: 18.8 },
  { year: "2024", value: 21.4 },
  { year: "2025", value: 24.1 },
  { year: "2026", value: 27.2 },
];

export const callGemini = async (prompt: string, systemInstruction: string) => {
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemInstruction }),
      });
      if (!response.ok) {
        let errMsg = "API Error";
        try {
          const errJson = await response.json();
          errMsg = errJson.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const result = await response.json();
      return result.text || "No response generated.";
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === 2) throw error;
      await new Promise((res) => setTimeout(res, Math.pow(2, i) * 1000));
    }
  }
};

// ==========================================
// 2. FINANCIAL ENGINES
// ==========================================
export const runOpCoEngine = (
  assumptions: OpCoAssumptions,
  config?: ProjConfig,
): OpCoModelData => {
  const requestedYears = config?.projYears || 10;
  const projYears = Math.min(requestedYears, 30);
  const totalDevMonths = assumptions.devDurationMonths || 24;

  let exitYear = null;
  if (config?.exitYear !== undefined && config.exitYear !== null) {
    exitYear = Math.min(config.exitYear, 30);
  } else if (assumptions.includeTerminalValue) {
    exitYear = 10;
  }

  // OpCo Level Debt parameters
  const includeFinancing = assumptions.includeFinancing || false;
  const ltvRatio = assumptions.ltvRatio || 0;
  const interestRate = assumptions.interestRate || 10;
  const loanTenor = assumptions.loanTenor || 15;
  const ioGracePeriodYears = assumptions.ioGracePeriodYears || 0;

  const totalCap = assumptions.partnerAEquity + assumptions.partnerBEquity;
  const totalDebt = includeFinancing ? totalCap * (ltvRatio / 100) : 0;
  const totalEquity = totalCap - totalDebt;

  const resolvedPartnerAEquity = includeFinancing
    ? totalEquity * (assumptions.sharingPercentA / 100)
    : assumptions.partnerAEquity;

  const resolvedPartnerBEquity = includeFinancing
    ? totalEquity * ((100 - assumptions.sharingPercentA) / 100)
    : assumptions.partnerBEquity;

  let annualData = [],
    projectCfsMonthly = [],
    partnerACfsMonthly = [],
    partnerBCfsMonthly = [];
  let cumulativeNetIncome = 0,
    partnerA_CumCF = 0,
    partnerB_CumCF = 0,
    cumulativeRetainedEarnings = 0;

  let outstandingDebt = 0;
  let idcAccumulated = 0;

  let preOpMonthlyDebtDraws: number[] = [];
  let preOpMonthlyIdc: number[] = [];
  let preOpMonthlyDebtBalance: number[] = [];

  // Simulate pre-operating months based on totalDevMonths
  for (let m = 1; m <= totalDevMonths; m++) {
    const isY1 = m <= 12;
    const split = isY1
      ? assumptions.equitySplitY1 / 100
      : (100 - assumptions.equitySplitY1) / 100;

    // jvaOpex occurs 100% in Month 1, commOpex occurs across last 6 months pro-rata
    let net_month = 0;
    if (m === 1) {
      net_month = -assumptions.jvaOpex;
    } else if (m >= totalDevMonths - 5 && m <= totalDevMonths) {
      net_month = -assumptions.commOpex / 6;
    }

    cumulativeNetIncome += net_month;
    // Adjust outlays to span the entire totalDevMonths
    // A simplified approach: divide the required equity evenly over the months
    // but preserving the Y1 vs Y2+ split.
    // If devDurationMonths is 24, Y1 has 12, Y2 has 12.
    // Let's use a simpler spread for equityOutlay based on totalDevMonths.
    // The original outlay formula divded by 12 for Y1 and Y2 respectively.
    const splitFactor = isY1
      ? assumptions.equitySplitY1 / 100
      : (100 - assumptions.equitySplitY1) / 100;
    const monthsInThisSplit = isY1
      ? Math.min(12, totalDevMonths)
      : Math.max(1, totalDevMonths - 12);
    const m_pA_Outlay =
      (-resolvedPartnerAEquity * splitFactor) / monthsInThisSplit;
    const m_pB_Outlay =
      (-resolvedPartnerBEquity * splitFactor) / monthsInThisSplit;

    // Debt draw monthly during pre-operating phase
    let m_debtDraw = 0;
    let m_idc = 0;
    if (includeFinancing) {
      m_debtDraw = totalDebt / totalDevMonths;
      m_idc = outstandingDebt * (interestRate / 100 / 12);
      outstandingDebt += m_debtDraw + m_idc;
      idcAccumulated += m_idc;
    }

    preOpMonthlyDebtDraws.push(m_debtDraw);
    preOpMonthlyIdc.push(m_idc);
    preOpMonthlyDebtBalance.push(outstandingDebt);

    partnerA_CumCF += m_pA_Outlay;
    partnerB_CumCF += m_pB_Outlay;

    partnerACfsMonthly.push(m_pA_Outlay);
    partnerBCfsMonthly.push(m_pB_Outlay);
    projectCfsMonthly.push(m_pA_Outlay + m_pB_Outlay + m_debtDraw);
  }

  // Pre-operating years: Create annual reporting blocks based on devYears
  const devYearsCount = Math.ceil(totalDevMonths / 12) || 1;
  const preOp = [];

  for (let y = 1; y <= devYearsCount; y++) {
    const isY1 = y === 1;
    const split = isY1
      ? assumptions.equitySplitY1 / 100
      : (100 - assumptions.equitySplitY1) / 100;
    const monthsInThisYear = Math.min(12, totalDevMonths - (y - 1) * 12);

    let netThisYear = 0;
    // Jva occurs in year 1
    if (isY1) netThisYear += -assumptions.jvaOpex;

    // CommOpex occurs ONLY in the exact last 6 months of totalDevMonths.
    for (let m = 0; m < monthsInThisYear; m++) {
      const monthIndex = (y - 1) * 12 + m;
      if (monthIndex >= totalDevMonths - 6 && monthIndex < totalDevMonths) {
        netThisYear += -(assumptions.commOpex / 6);
      }
    }

    preOp.push({
      y: `Year ${y}`,
      split: split,
      startM: (y - 1) * 12 + 1,
      net: netThisYear,
      months: monthsInThisYear,
    });
  }

  preOp.forEach((p, idx) => {
    const net = p.net;
    // Split the outlay properly for the year block
    const pA_Outlay =
      -resolvedPartnerAEquity *
      p.split *
      (p.months /
        (idx === 0
          ? Math.min(12, totalDevMonths)
          : Math.max(1, totalDevMonths - 12)));
    const pB_Outlay =
      -resolvedPartnerBEquity *
      p.split *
      (p.months /
        (idx === 0
          ? Math.min(12, totalDevMonths)
          : Math.max(1, totalDevMonths - 12)));

    let monthly: { [key: string]: any } = {
      ipRev: [],
      opRev: [],
      totalRev: [],
      totalMedSupp: [],
      totalDocFee: [],
      grossProfit: [],
      staffCost: [],
      recurringOpex: [],
      ebitdar: [],
      rent: [],
      ebitda: [],
      revPab: [],
      tax: [],
      netIncome: [],
      cumNI: [],
      debtDraw: [],
      interest: [],
      principal: [],
      debtBalance: [],
      distributableProfit: [],
      retainedThisYear: [],
      cumulativeRetainedEarnings: [],
      shareA: [],
      shareB: [],
      opCoExit: [],
      pA_Exit: [],
      pB_Exit: [],
      ev: [],
      pA_Div: [],
      pA_Net: [],
      pA_Outlay: [],
      pA_Cum: [],
      pB_Div: [],
      pB_Net: [],
      pB_Outlay: [],
      pB_Cum: [],
      fcf: [],
      bor: [],
      pA_Yield: [],
      pB_Yield: [],
      ipCases: [],
      opVisits: [],
      otherOpex: [],
      adminOpex: [],
      utilOpex: [],
      mktgOpex: [],
      operatorOpex: [],
      insOpex: [],
    };

    for (let m = 0; m < 12; m++) {
      monthly.ipRev.push(0);
      monthly.opRev.push(0);
      monthly.totalRev.push(0);
      monthly.totalMedSupp.push(0);
      monthly.totalDocFee.push(0);
      monthly.grossProfit.push(0);
      monthly.staffCost.push(0);

      // Check the exact month in the overall projection
      const monthIndex = p.startM + m - 1;

      let m_recOpex = 0;
      if (monthIndex === 0) {
        m_recOpex = assumptions.jvaOpex;
      } else if (
        monthIndex >= totalDevMonths - 6 &&
        monthIndex < totalDevMonths
      ) {
        m_recOpex = assumptions.commOpex / 6;
      }

      let m_ebitdar = -m_recOpex;
      let m_ebitda = -m_recOpex;
      let m_netInc = -m_recOpex;

      monthly.recurringOpex.push(m_recOpex);
      monthly.ebitdar.push(m_ebitdar);
      monthly.rent.push(0);
      monthly.ebitda.push(m_ebitda);
      monthly.tax.push(0);
      monthly.netIncome.push(m_netInc);
      monthly.revPab.push(0);

      monthly.otherOpex.push(m_recOpex);
      monthly.adminOpex.push(0);
      monthly.utilOpex.push(0);
      monthly.mktgOpex.push(0);
      monthly.operatorOpex.push(0);
      monthly.insOpex.push(0);

      // Cumulative Net Income chain
      let cum_net_up_to_month = 0;
      let prior_net = 0;
      for (let prev = 0; prev < idx; prev++) prior_net += preOp[prev].net;

      let currentMonthNet = 0;
      for (let pm = 0; pm <= m; pm++) {
        const pmIndex = p.startM + pm - 1;
        if (pmIndex === 0) {
          currentMonthNet += -assumptions.jvaOpex;
        } else if (pmIndex >= totalDevMonths - 6 && pmIndex < totalDevMonths) {
          currentMonthNet += -(assumptions.commOpex / 6);
        }
      }

      cum_net_up_to_month = prior_net + currentMonthNet;
      monthly.cumNI.push(cum_net_up_to_month);

      monthly.distributableProfit.push(0);
      monthly.retainedThisYear.push(0);
      monthly.cumulativeRetainedEarnings.push(0);
      monthly.shareA.push(0);
      monthly.shareB.push(0);
      monthly.opCoExit.push(0);
      monthly.pA_Exit.push(0);
      monthly.pB_Exit.push(0);
      monthly.ev.push(0);
      monthly.pA_Div.push(0);

      // Cumulative Outlays
      let pA_CumVal = 0;
      let pB_CumVal = 0;

      const m_pA_OutlayMonth = p.months > 0 ? pA_Outlay / p.months : 0;
      const m_pB_OutlayMonth = p.months > 0 ? pB_Outlay / p.months : 0;

      let prior_pA_Outlay = 0;
      let prior_pB_Outlay = 0;
      for (let prev = 0; prev < idx; prev++) {
        const pastP = preOp[prev];
        const pastFactor =
          pastP.months /
          (prev === 0
            ? Math.min(12, totalDevMonths)
            : Math.max(1, totalDevMonths - 12));
        prior_pA_Outlay +=
          -resolvedPartnerAEquity * pastP.split * pastFactor;
        prior_pB_Outlay +=
          -resolvedPartnerBEquity * pastP.split * pastFactor;
      }

      if (m < p.months) {
        pA_CumVal = prior_pA_Outlay + m_pA_OutlayMonth * (m + 1);
        pB_CumVal = prior_pB_Outlay + m_pB_OutlayMonth * (m + 1);
      } else {
        pA_CumVal = prior_pA_Outlay + pA_Outlay;
        pB_CumVal = prior_pB_Outlay + pB_Outlay;
      }

      // Monthly debt tracking
      const m_draw = preOpMonthlyDebtDraws[monthIndex] || 0;
      const m_interest = preOpMonthlyIdc[monthIndex] || 0;
      const m_balance = preOpMonthlyDebtBalance[monthIndex] || 0;

      monthly.debtDraw.push(m_draw);
      monthly.interest.push(m_interest);
      monthly.principal.push(0);
      monthly.debtBalance.push(m_balance);

      monthly.pA_Net.push(m < p.months ? m_pA_OutlayMonth : 0);
      monthly.pA_Outlay.push(m < p.months ? m_pA_OutlayMonth : 0);
      monthly.pA_Cum.push(pA_CumVal);
      monthly.pB_Div.push(0);
      monthly.pB_Net.push(m < p.months ? m_pB_OutlayMonth : 0);
      monthly.pB_Outlay.push(m < p.months ? m_pB_OutlayMonth : 0);
      monthly.pB_Cum.push(pB_CumVal);
      monthly.fcf.push(m < p.months ? m_pA_OutlayMonth + m_pB_OutlayMonth + m_draw : 0);
      monthly.bor.push(0);
      monthly.pA_Yield.push(0);
      monthly.pB_Yield.push(0);
      monthly.ipCases.push(0);
      monthly.opVisits.push(0);
    }

    let priorNI = 0;
    for (let prev = 0; prev < idx; prev++) priorNI += preOp[prev].net;
    let prior_pA_Outlay_Total = 0;
    for (let prev = 0; prev < idx; prev++) {
      const pastP = preOp[prev];
      const pastFactor =
        pastP.months /
        (prev === 0
          ? Math.min(12, totalDevMonths)
          : Math.max(1, totalDevMonths - 12));
      prior_pA_Outlay_Total +=
        -resolvedPartnerAEquity * pastP.split * pastFactor;
    }

    let prior_pB_Outlay_Total = 0;
    for (let prev = 0; prev < idx; prev++) {
      const pastP = preOp[prev];
      const pastFactor =
        pastP.months /
        (prev === 0
          ? Math.min(12, totalDevMonths)
          : Math.max(1, totalDevMonths - 12));
      prior_pB_Outlay_Total +=
        -resolvedPartnerBEquity * pastP.split * pastFactor;
    }

    const yearDebtDraw = preOpMonthlyDebtDraws.slice(p.startM - 1, p.startM - 1 + p.months).reduce((a, b) => a + b, 0);
    const yearInterest = preOpMonthlyIdc.slice(p.startM - 1, p.startM - 1 + p.months).reduce((a, b) => a + b, 0);
    const yearDebtBalance = preOpMonthlyDebtBalance[p.startM - 1 + p.months - 1] || 0;

    annualData.push({
      year: p.y,
      isOperating: false,
      ipRev: 0,
      opRev: 0,
      totalRev: 0,
      totalMedSupp: 0,
      totalDocFee: 0,
      grossProfit: 0,
      staffCost: 0,
      recurringOpex: -p.net,
      otherOpex: -p.net,
      revPab: 0,
      adminOpex: 0,
      utilOpex: 0,
      mktgOpex: 0,
      operatorOpex: 0,
      insOpex: 0,
      ebitdar: p.net,
      rent: 0,
      ebitda: net,
      tax: 0,
      netIncome: net,
      cumNI: priorNI + p.net,
      distributableProfit: 0,
      retainedThisYear: 0,
      cumulativeRetainedEarnings: 0,
      shareA: 0,
      shareB: 0,
      pA_Outlay,
      pA_Div: 0,
      pA_Net: pA_Outlay,
      pA_Cum: prior_pA_Outlay_Total + pA_Outlay,
      pA_Yield: 0,
      pB_Outlay,
      pB_Div: 0,
      pB_Net: pB_Outlay,
      pB_Cum: prior_pB_Outlay_Total + pB_Outlay,
      pB_Yield: 0,
      debtDraw: yearDebtDraw,
      interest: yearInterest,
      principal: 0,
      debtBalance: yearDebtBalance,
      fcf: pA_Outlay + pB_Outlay + yearDebtDraw,
      ebitdaMargin: 0,
      ebitdarMargin: 0,
      netMargin: 0,
      roe: 0,
      breakEvenBor: 0,
      bor: 0,
      ev: 0,
      monthly,
    });
  });

  const transitionOpMonths =
    totalDevMonths % 12 === 0 ? 0 : 12 - (totalDevMonths % 12);
  if (transitionOpMonths > 0 && annualData.length > 0) {
    const tYear = annualData[annualData.length - 1];
    const mo = tYear.monthly;

    // Use Year 1 operating parameters for the transition months
    const i = 1;
    const currentYear = 2025 + devYearsCount;
    const daysInYear =
      (currentYear % 4 === 0 && currentYear % 100 !== 0) ||
      currentYear % 400 === 0
        ? 366
        : 365;

    let bor = Math.min(assumptions.borMax / 100, assumptions.borStart / 100);
    let bedDays = assumptions.beds * daysInYear * bor;
    let ipCases = bedDays / assumptions.alos;
    let opVisits = ipCases * assumptions.opIpRatio;
    let priceMultiplier = 1;

    let ipRev = (ipCases * (assumptions.ipRevenue * priceMultiplier)) / 1000;
    let opRev = (opVisits * (assumptions.opRevenue * priceMultiplier)) / 1000;
    let totalRev = ipRev + opRev;

    let costMultiplier = 1;
    let totalMedSupp =
      ((ipCases * assumptions.ipMedSupply +
        opVisits * assumptions.opMedSupply) *
        costMultiplier) /
      1000;
    let totalDocFee =
      (assumptions.docFeeIp / 100) * ipRev +
      (assumptions.docFeeOp / 100) * opRev;
    let grossProfit = totalRev - totalMedSupp - totalDocFee;

    let staffCost = assumptions.monthlyStaffCost * 12;
    let otherOpex =
      ((assumptions.adminExpRate +
        assumptions.utilExpRate +
        assumptions.mktgExpRate +
        assumptions.operatorFeeRate) /
        100) *
        totalRev +
      (assumptions.insuranceMonthly * 12) / 1000;
    let recurringOpex = staffCost + otherOpex;
    let ebitdar = grossProfit - recurringOpex;

    let annualRent = 0;
    if (assumptions.rentStructureType === "flatEbitdar") {
      annualRent =
        ebitdar > 0
          ? ((assumptions.rentFlatEbitdarRate ?? 15) / 100) * ebitdar
          : 0;
    } else if (assumptions.rentStructureType === "revAndProfit") {
      let revRent = ((assumptions.rentRevRate ?? 5) / 100) * totalRev;
      let remainingProfit = Math.max(0, ebitdar - revRent);
      annualRent =
        revRent +
        (remainingProfit > 0
          ? ((assumptions.rentProfitRate ?? 10) / 100) * remainingProfit
          : 0);
    } else {
      let currentRevPab =
        assumptions.beds > 0 ? totalRev / assumptions.beds : 0;
      let rentRate =
        currentRevPab < assumptions.rentTier1Limit
          ? assumptions.rentTier1Rate
          : currentRevPab < assumptions.rentTier2Limit
            ? assumptions.rentTier2Rate
            : assumptions.rentTier3Rate;
      annualRent = ebitdar > 0 ? (rentRate / 100) * ebitdar : 0;
    }

    const startM = 12 - transitionOpMonths + 1;
    let ytdEbitda = 0;
    let cumNI_startOfYear = cumulativeNetIncome;
    for (let m = startM; m <= 12; m++) {
      const days = new Date(currentYear, m, 0).getDate();
      let m_ipCases = ipCases * (days / daysInYear);
      let m_opVisits = opVisits * (days / daysInYear);
      let m_ipRev = ipRev * (days / daysInYear);
      let m_opRev = opRev * (days / daysInYear);
      let m_totalRev = totalRev * (days / daysInYear);
      let m_totalMedSupp = totalMedSupp * (days / daysInYear);
      let m_totalDocFee = totalDocFee * (days / daysInYear);
      let m_grossProfit = grossProfit * (days / daysInYear);
      let m_staffCost = staffCost / 12;

      let m_adminOpex =
        ((assumptions.adminExpRate || 0) / 100) *
        totalRev *
        (days / daysInYear);
      let m_utilOpex =
        ((assumptions.utilExpRate || 0) / 100) * totalRev * (days / daysInYear);
      let m_mktgOpex =
        ((assumptions.mktgExpRate || 0) / 100) * totalRev * (days / daysInYear);
      let m_operatorOpex =
        ((assumptions.operatorFeeRate || 0) / 100) *
        totalRev *
        (days / daysInYear);
      let m_insOpex = (assumptions.insuranceMonthly || 0) / 1000;
      let m_otherOpex =
        m_adminOpex + m_utilOpex + m_mktgOpex + m_operatorOpex + m_insOpex;

      let m_recurringOpex = m_staffCost + m_otherOpex;

      let m_ebitdar = m_grossProfit - m_recurringOpex;
      let m_rent = annualRent * (days / daysInYear);
      let m_ebitda = m_ebitdar - m_rent;

      ytdEbitda += m_ebitda;
      let m_tax =
        m === 12 && ytdEbitda > 0
          ? ytdEbitda * (assumptions.corporateTax / 100)
          : 0;
      let m_netIncome = m_ebitda - m_tax;

      let prevCumNI = cumulativeNetIncome;
      cumulativeNetIncome += m_netIncome;

      let m_availableForDistribution = 0;
      if (m === 12) {
        m_availableForDistribution = Math.max(
          0,
          cumulativeNetIncome > 0
            ? cumNI_startOfYear < 0
              ? cumulativeNetIncome
              : cumulativeNetIncome - cumNI_startOfYear
            : 0,
        );
      }
      let m_distributableProfit =
        m_availableForDistribution *
        ((assumptions.dividendPayoutRatio ?? 100) / 100);
      let m_retainedThisYear =
        m_availableForDistribution - m_distributableProfit;

      cumulativeRetainedEarnings += m_retainedThisYear;
      let m_shareA =
        m_distributableProfit * ((assumptions.sharingPercentA ?? 51) / 100);
      let m_shareB =
        m_distributableProfit * (1 - (assumptions.sharingPercentA ?? 51) / 100);

      mo.ipCases[m - 1] = m_ipCases;
      mo.opVisits[m - 1] = m_opVisits;
      mo.ipRev[m - 1] = m_ipRev;
      mo.opRev[m - 1] = m_opRev;
      mo.totalRev[m - 1] = m_totalRev;
      mo.totalMedSupp[m - 1] = m_totalMedSupp;
      mo.totalDocFee[m - 1] = m_totalDocFee;
      mo.grossProfit[m - 1] = m_grossProfit;
      mo.staffCost[m - 1] = m_staffCost;
      mo.adminOpex[m - 1] = m_adminOpex;
      mo.utilOpex[m - 1] = m_utilOpex;
      mo.mktgOpex[m - 1] = m_mktgOpex;
      mo.operatorOpex[m - 1] = m_operatorOpex;
      mo.insOpex[m - 1] = m_insOpex;
      mo.otherOpex[m - 1] = m_otherOpex;
      mo.recurringOpex[m - 1] = m_recurringOpex;
      mo.ebitdar[m - 1] = m_ebitdar;
      mo.rent[m - 1] = m_rent;
      mo.ebitda[m - 1] = m_ebitda;
      mo.tax[m - 1] = m_tax;
      mo.netIncome[m - 1] = m_netIncome;
      let m_revPab = assumptions.beds > 0 ? (m_totalRev * 12) / assumptions.beds : 0;
      if (!mo.revPab) mo.revPab = [];
      mo.revPab[m - 1] = m_revPab;
      mo.cumNI[m - 1] = cumulativeNetIncome;
      mo.distributableProfit[m - 1] = m_distributableProfit;
      mo.retainedThisYear[m - 1] = m_retainedThisYear;
      mo.cumulativeRetainedEarnings[m - 1] = cumulativeRetainedEarnings;
      mo.shareA[m - 1] = m_shareA;
      mo.shareB[m - 1] = m_shareB;
      mo.opCoExit[m - 1] = 0;
      mo.pA_Exit[m - 1] = 0;
      mo.pB_Exit[m - 1] = 0;
      mo.ev[m - 1] = 0;
      mo.pA_Div[m - 1] = m_shareA;
      mo.pA_Net[m - 1] = m_shareA;
      mo.pA_Outlay[m - 1] = 0;
      mo.pA_Cum[m - 1] = 0; // will recalculate later
      mo.pB_Div[m - 1] = m_shareB;
      mo.pB_Net[m - 1] = m_shareB;
      mo.pB_Outlay[m - 1] = 0;
      mo.pB_Cum[m - 1] = 0;
      mo.fcf[m - 1] = m_netIncome;
      mo.bor[m - 1] = bor;
      mo.pA_Yield[m - 1] = 0;
      mo.pB_Yield[m - 1] = 0;

      tYear.ipRev += m_ipRev;
      tYear.opRev += m_opRev;
      tYear.totalRev += m_totalRev;
      tYear.totalMedSupp += m_totalMedSupp;
      tYear.totalDocFee += m_totalDocFee;
      tYear.grossProfit += m_grossProfit;
      tYear.staffCost += m_staffCost;
      tYear.recurringOpex += m_recurringOpex;
      tYear.ebitdar += m_ebitdar;
      tYear.rent += m_rent;
      tYear.ebitda += m_ebitda;
      tYear.tax += m_tax;
      tYear.netIncome += m_netIncome;
      tYear.distributableProfit += m_distributableProfit;
      tYear.retainedThisYear += m_retainedThisYear;
      tYear.shareA += m_shareA;
      tYear.shareB += m_shareB;
      tYear.pA_Div += m_shareA;
      tYear.pB_Div += m_shareB;
      tYear.pA_Net += m_shareA;
      tYear.pB_Net += m_shareB;
      tYear.fcf += m_netIncome;
    }
    tYear.revPab = assumptions.beds > 0 ? tYear.totalRev / assumptions.beds : 0;
  }

  const initialOperatingDebt = outstandingDebt;
  const rMonthly = interestRate / 100 / 12;
  const ioGraceMonths = ioGracePeriodYears * 12;
  const loanTenorMonths = loanTenor * 12;
  const amortizingTenorMonths = Math.max(1, loanTenorMonths - ioGraceMonths);
  const pmt = (includeFinancing && initialOperatingDebt > 0 && rMonthly > 0)
    ? (initialOperatingDebt * rMonthly) / (1 - Math.pow(1 + rMonthly, -amortizingTenorMonths))
    : (initialOperatingDebt > 0 ? initialOperatingDebt / amortizingTenorMonths : 0);

  // Operating years
  for (let i = 1; i <= projYears; i++) {
    const currentYear = 2025 + devYearsCount + i;
    const daysInYear =
      (currentYear % 4 === 0 && currentYear % 100 !== 0) ||
      currentYear % 400 === 0
        ? 366
        : 365;

    let bor = Math.min(
      assumptions.borMax / 100,
      assumptions.borStart / 100 + (i - 1) * (assumptions.borIncrement / 100),
    );
    let bedDays = assumptions.beds * daysInYear * bor;
    let ipCases = bedDays / assumptions.alos;
    let opVisits = ipCases * assumptions.opIpRatio;
    let priceMultiplier = 1;
    for (let j = 2; j <= i; j++) {
      priceMultiplier *=
        1 +
        (j <= 6
          ? assumptions.priceIncYears1_6
          : assumptions.priceIncYears7_plus) /
          100;
    }

    let ipRev = (ipCases * (assumptions.ipRevenue * priceMultiplier)) / 1000;
    let opRev = (opVisits * (assumptions.opRevenue * priceMultiplier)) / 1000;
    let totalRev = ipRev + opRev;

    let costMultiplier = Math.pow(1 + assumptions.medSupplyInf / 100, i - 1);
    let totalMedSupp =
      ((ipCases * assumptions.ipMedSupply +
        opVisits * assumptions.opMedSupply) *
        costMultiplier) /
      1000;
    let totalDocFee =
      (assumptions.docFeeIp / 100) * ipRev +
      (assumptions.docFeeOp / 100) * opRev;
    let grossProfit = totalRev - totalMedSupp - totalDocFee;

    let staffCost =
      assumptions.monthlyStaffCost *
      12 *
      Math.pow(1 + assumptions.staffInf / 100, i - 1);
    let otherOpex =
      ((assumptions.adminExpRate +
        assumptions.utilExpRate +
        assumptions.mktgExpRate +
        assumptions.operatorFeeRate) /
        100) *
        totalRev +
      (assumptions.insuranceMonthly * 12) / 1000;
    let recurringOpex = staffCost + otherOpex;

    let ebitdar = grossProfit - recurringOpex;

    // Calculate annual rent structure
    let annualRent = 0;
    if (assumptions.rentStructureType === "flatEbitdar") {
      annualRent =
        ebitdar > 0
          ? ((assumptions.rentFlatEbitdarRate ?? 15) / 100) * ebitdar
          : 0;
    } else if (assumptions.rentStructureType === "revAndProfit") {
      let revRent = ((assumptions.rentRevRate ?? 5) / 100) * totalRev;
      let remainingProfit = ebitdar - revRent;
      let profitRent =
        remainingProfit > 0
          ? ((assumptions.rentProfitRate ?? 10) / 100) * remainingProfit
          : 0;
      annualRent = revRent + profitRent;
    } else {
      let currentRevPab =
        assumptions.beds > 0 ? totalRev / assumptions.beds : 0;
      let rentRate = 0;
      if (currentRevPab < assumptions.rentTier1Limit)
        rentRate = assumptions.rentTier1Rate;
      else if (currentRevPab < assumptions.rentTier2Limit)
        rentRate = assumptions.rentTier2Rate;
      else rentRate = assumptions.rentTier3Rate;
      annualRent = ebitdar > 0 ? (rentRate / 100) * ebitdar : 0;
    }

    // Run 12 months for Operating Year i
    let monthly = {
      ipRev: [],
      opRev: [],
      totalRev: [],
      revPab: [],
      totalMedSupp: [],
      totalDocFee: [],
      grossProfit: [],
      staffCost: [],
      recurringOpex: [],
      ebitdar: [],
      rent: [],
      ebitda: [],
      tax: [],
      netIncome: [],
      cumNI: [],
      distributableProfit: [],
      retainedThisYear: [],
      cumulativeRetainedEarnings: [],
      shareA: [],
      shareB: [],
      opCoExit: [],
      pA_Exit: [],
      pB_Exit: [],
      ev: [],
      pA_Div: [],
      pA_Net: [],
      pA_Outlay: [],
      pA_Cum: [],
      pB_Div: [],
      pB_Net: [],
      pB_Outlay: [],
      pB_Cum: [],
      fcf: [],
      bor: [],
      pA_Yield: [],
      pB_Yield: [],
      ipCases: [],
      opVisits: [],
      otherOpex: [],
      adminOpex: [],
      utilOpex: [],
      mktgOpex: [],
      operatorOpex: [],
      insOpex: [],
      debtDraw: [],
      interest: [],
      principal: [],
      debtBalance: [],
    };

    let year_ipRev = 0,
      year_opRev = 0,
      year_totalRev = 0,
      year_totalMedSupp = 0,
      year_totalDocFee = 0,
      year_grossProfit = 0,
      year_staffCost = 0,
      year_recurringOpex = 0,
      year_otherOpex = 0,
      year_adminOpex = 0,
      year_utilOpex = 0,
      year_mktgOpex = 0,
      year_operatorOpex = 0,
      year_insOpex = 0,
      year_ebitdar = 0,
      year_rent = 0,
      year_ebitda = 0,
      year_tax = 0,
      year_netIncome = 0,
      year_distributableProfit = 0,
      year_retainedThisYear = 0,
      year_shareA = 0,
      year_shareB = 0,
      year_opCoExit = 0,
      year_pA_Exit = 0,
      year_pB_Exit = 0,
      year_ev = 0;

    let ytdEbitda = 0;
    let ytdEbt = 0;
    let year_interest = 0;
    let year_principal = 0;
    let year_debtDraw = 0;
    let cumNI_startOfYear = cumulativeNetIncome;
    for (let m = 1; m <= 12; m++) {
      const days = new Date(currentYear, m, 0).getDate();

      let m_ipCases = ipCases * (days / daysInYear);
      let m_opVisits = opVisits * (days / daysInYear);

      let m_ipRev = ipRev * (days / daysInYear);
      let m_opRev = opRev * (days / daysInYear);
      let m_totalRev = totalRev * (days / daysInYear);
      let m_totalMedSupp = totalMedSupp * (days / daysInYear);
      let m_totalDocFee = totalDocFee * (days / daysInYear);
      let m_grossProfit = grossProfit * (days / daysInYear);
      let m_staffCost = staffCost / 12;

      let m_adminOpex =
        ((assumptions.adminExpRate || 0) / 100) *
        totalRev *
        (days / daysInYear);
      let m_utilOpex =
        ((assumptions.utilExpRate || 0) / 100) * totalRev * (days / daysInYear);
      let m_mktgOpex =
        ((assumptions.mktgExpRate || 0) / 100) * totalRev * (days / daysInYear);
      let m_operatorOpex =
        ((assumptions.operatorFeeRate || 0) / 100) *
        totalRev *
        (days / daysInYear);
      let m_insOpex = (assumptions.insuranceMonthly || 0) / 1000;
      let m_otherOpex =
        m_adminOpex + m_utilOpex + m_mktgOpex + m_operatorOpex + m_insOpex;

      let m_recurringOpex = m_staffCost + m_otherOpex;

      let m_ebitdar = m_grossProfit - m_recurringOpex;

      // Distributed monthly:
      let m_rent = annualRent * (days / daysInYear);
      let m_ebitda = m_ebitdar - m_rent;

      // Debt service calculation for the month
      let m_debtDraw = 0;
      let m_interest = 0;
      let m_principal = 0;
      let opMonthIdx = (i - 1) * 12 + (m - 1);
      let elapsedProjectMonth = totalDevMonths + opMonthIdx + 1;
      if (includeFinancing && outstandingDebt > 0) {
        m_interest = outstandingDebt * rMonthly;
        if (elapsedProjectMonth <= ioGraceMonths) {
          m_principal = 0;
        } else if (elapsedProjectMonth <= loanTenorMonths) {
          m_principal = Math.min(outstandingDebt, pmt - m_interest);
          if (m_principal < 0) m_principal = 0;
        } else {
          // If we reached the end of the loan tenor and there is still debt, pay it all off
          m_principal = outstandingDebt;
        }
        outstandingDebt -= m_principal;
      }
      year_interest += m_interest;
      year_principal += m_principal;
      year_debtDraw += m_debtDraw;

      ytdEbitda += m_ebitda;
      ytdEbt += (m_ebitda - m_interest);

      let m_tax =
        m === 12 && ytdEbt > 0
          ? ytdEbt * (assumptions.corporateTax / 100)
          : 0;
      let m_netIncome = m_ebitda - m_interest - m_tax;

      let prevCumNI = cumulativeNetIncome;
      cumulativeNetIncome += m_netIncome;

      let m_availableForDistribution = 0;
      if (m === 12) {
        m_availableForDistribution = Math.max(
          0,
          cumulativeNetIncome > 0
            ? cumNI_startOfYear < 0
              ? cumulativeNetIncome
              : cumulativeNetIncome - cumNI_startOfYear
            : 0,
        );
        // Principal repayment reduces distributable profit
        m_availableForDistribution = Math.max(0, m_availableForDistribution - year_principal);
      }

      let m_distributableProfit =
        m_availableForDistribution *
        ((assumptions.dividendPayoutRatio ?? 100) / 100);
      let m_retainedThisYear =
        m_availableForDistribution - m_distributableProfit;

      if (m === 12) {
        cumulativeRetainedEarnings += m_retainedThisYear;
      }

      let m_shareA =
        m_distributableProfit * (assumptions.sharingPercentA / 100);
      let m_shareB =
        m_distributableProfit * ((100 - assumptions.sharingPercentA) / 100);

      let m_ev = 0,
        m_opCoExit = 0,
        m_pA_Exit = 0,
        m_pB_Exit = 0;
      if (exitYear !== null && i === exitYear && m === 12) {
        let annualEbitda = ebitdar - annualRent;
        m_ev = annualEbitda * (assumptions.exitMultiple || 30);
        if (assumptions.sellingCosts) {
          m_ev = m_ev * (1 - assumptions.sellingCosts / 100);
        }
        
        // Outstanding debt is settled at exit!
        const debtBeforeExit = outstandingDebt;
        m_opCoExit = m_ev + cumulativeRetainedEarnings - debtBeforeExit;
        if (m_opCoExit < 0) m_opCoExit = 0;
        outstandingDebt = 0;

        m_pA_Exit = m_opCoExit * (assumptions.sharingPercentA / 100);
        m_pB_Exit = m_opCoExit * ((100 - assumptions.sharingPercentA) / 100);
      }

      partnerA_CumCF += m_shareA + m_pA_Exit;
      partnerB_CumCF += m_shareB + m_pB_Exit;

      partnerACfsMonthly.push(m_shareA + m_pA_Exit);
      partnerBCfsMonthly.push(m_shareB + m_pB_Exit);

      const wcOpex_month =
        i === 1 && m === 1 ? -assumptions.workingCapitalOpex : 0;
      let m_fcf = m_netIncome + wcOpex_month + m_opCoExit;
      projectCfsMonthly.push(m_fcf);

      // Store monthly snapshots
      monthly.ipCases.push(m_ipCases);
      monthly.opVisits.push(m_opVisits);
      monthly.ipRev.push(m_ipRev);
      monthly.opRev.push(m_opRev);
      monthly.totalRev.push(m_totalRev);
      monthly.totalMedSupp.push(m_totalMedSupp);
      monthly.totalDocFee.push(m_totalDocFee);
      monthly.grossProfit.push(m_grossProfit);
      monthly.staffCost.push(m_staffCost);
      monthly.recurringOpex.push(m_recurringOpex);
      monthly.otherOpex.push(m_otherOpex);
      monthly.adminOpex.push(m_adminOpex);
      monthly.utilOpex.push(m_utilOpex);
      monthly.mktgOpex.push(m_mktgOpex);
      monthly.operatorOpex.push(m_operatorOpex);
      monthly.insOpex.push(m_insOpex);
      monthly.ebitdar.push(m_ebitdar);
      monthly.rent.push(m_rent);
      monthly.ebitda.push(m_ebitda);
      monthly.tax.push(m_tax);
      monthly.netIncome.push(m_netIncome);
      monthly.cumNI.push(cumulativeNetIncome);
      monthly.distributableProfit.push(m_distributableProfit);
      monthly.retainedThisYear.push(m_retainedThisYear);
      monthly.cumulativeRetainedEarnings.push(cumulativeRetainedEarnings);
      monthly.shareA.push(m_shareA);
      monthly.shareB.push(m_shareB);
      monthly.opCoExit.push(m_opCoExit);
      monthly.pA_Exit.push(m_pA_Exit);
      monthly.pB_Exit.push(m_pB_Exit);
      monthly.ev.push(m_ev);
      monthly.pA_Div.push(m_shareA + m_pA_Exit);
      monthly.pA_Net.push(m_shareA + m_pA_Exit);
      monthly.pA_Cum.push(partnerA_CumCF);
      monthly.pB_Div.push(m_shareB + m_pB_Exit);
      monthly.pB_Net.push(m_shareB + m_pB_Exit);
      monthly.pB_Cum.push(partnerB_CumCF);
      monthly.pA_Outlay.push(0);
      monthly.pB_Outlay.push(0);
      monthly.fcf.push(m_fcf);
      monthly.bor.push(bor * 100);
      let m_revPab = assumptions.beds > 0 ? (m_totalRev * 12) / assumptions.beds : 0;
      monthly.revPab.push(m_revPab);

      monthly.debtDraw.push(m_debtDraw);
      monthly.interest.push(m_interest);
      monthly.principal.push(m_principal);
      monthly.debtBalance.push(outstandingDebt);

      monthly.pA_Yield.push(
        resolvedPartnerAEquity > 0
          ? (m_shareA / resolvedPartnerAEquity) * 100
          : 0,
      );
      monthly.pB_Yield.push(
        resolvedPartnerBEquity > 0
          ? (m_shareB / resolvedPartnerBEquity) * 100
          : 0,
      );

      // Accumulate monthly aggregates for Annual Spreadsheets
      year_ipRev += m_ipRev;
      year_opRev += m_opRev;
      year_totalRev += m_totalRev;
      year_totalMedSupp += m_totalMedSupp;
      year_totalDocFee += m_totalDocFee;
      year_grossProfit += m_grossProfit;
      year_staffCost += m_staffCost;
      year_recurringOpex += m_recurringOpex;
      year_otherOpex += m_otherOpex;
      year_adminOpex += m_adminOpex;
      year_utilOpex += m_utilOpex;
      year_mktgOpex += m_mktgOpex;
      year_operatorOpex += m_operatorOpex;
      year_insOpex += m_insOpex;
      year_ebitdar += m_ebitdar;
      year_rent += m_rent;
      year_ebitda += m_ebitda;
      year_tax += m_tax;
      year_netIncome += m_netIncome;
      year_distributableProfit += m_distributableProfit;
      year_retainedThisYear += m_retainedThisYear;
      year_shareA += m_shareA;
      year_shareB += m_shareB;
      year_opCoExit += m_opCoExit;
      year_pA_Exit += m_pA_Exit;
      year_pB_Exit += m_pB_Exit;
      year_ev += m_ev;
    }

    const fixedTotal = staffCost + (assumptions.insuranceMonthly * 12) / 1000;
    const varRate =
      totalRev > 0
        ? (totalMedSupp +
            totalDocFee +
            ((assumptions.adminExpRate +
              assumptions.utilExpRate +
              assumptions.mktgExpRate +
              assumptions.operatorFeeRate) /
              100) *
              totalRev) /
          totalRev
        : 0;

    const breakEvenRev = 1 - varRate > 0 ? fixedTotal / (1 - varRate) : 0;
    const breakEvenBor = totalRev > 0 ? (breakEvenRev / totalRev) * bor : 0;

    annualData.push({
      year: `Year ${i + devYearsCount}`,
      isOperating: true,
      ipRev: year_ipRev,
      opRev: year_opRev,
      totalRev: year_totalRev,
      totalMedSupp: year_totalMedSupp,
      totalDocFee: year_totalDocFee,
      grossProfit: year_grossProfit,
      staffCost: year_staffCost,
      recurringOpex: year_recurringOpex,
      otherOpex: year_otherOpex,
      adminOpex: year_adminOpex,
      utilOpex: year_utilOpex,
      mktgOpex: year_mktgOpex,
      operatorOpex: year_operatorOpex,
      insOpex: year_insOpex,
      ebitdar: year_ebitdar,
      rent: year_rent,
      ebitda: year_ebitda,
      tax: year_tax,
      netIncome: year_netIncome,
      cumNI: cumulativeNetIncome,
      distributableProfit: year_distributableProfit,
      retainedThisYear: year_retainedThisYear,
      cumulativeRetainedEarnings,
      shareA: year_shareA,
      shareB: year_shareB,
      opCoExit: year_opCoExit,
      pA_Exit: year_pA_Exit,
      pB_Exit: year_pB_Exit,
      ev: year_ev,
      pA_Outlay: 0,
      pA_Div: year_shareA + year_pA_Exit,
      pA_Net: year_shareA + year_pA_Exit,
      pA_Cum: partnerA_CumCF,
      pB_Outlay: 0,
      pB_Div: year_shareB + year_pB_Exit,
      pB_Net: year_shareB + year_pB_Exit,
      pB_Cum: partnerB_CumCF,
      pA_Yield:
        resolvedPartnerAEquity > 0
          ? (year_shareA / resolvedPartnerAEquity) * 100
          : 0,
      pB_Yield:
        resolvedPartnerBEquity > 0
          ? (year_shareB / resolvedPartnerBEquity) * 100
          : 0,
      debtDraw: year_debtDraw,
      interest: year_interest,
      principal: year_principal,
      debtBalance: outstandingDebt,
      fcf:
        year_netIncome +
        (i === 1 ? -assumptions.workingCapitalOpex : 0) +
        year_opCoExit,
      ebitdaMargin: year_totalRev > 0 ? (year_ebitda / year_totalRev) * 100 : 0,
      ebitdarMargin:
        year_totalRev > 0 ? (year_ebitdar / year_totalRev) * 100 : 0,
      netMargin: year_totalRev > 0 ? (year_netIncome / year_totalRev) * 100 : 0,
      roe: totalEquity > 0 ? (year_netIncome / totalEquity) * 100 : 0,
      breakEvenBor: breakEvenBor * 100,
      bor: bor * 100,
      ipCases,
      opVisits,
      revPab: assumptions.beds > 0 ? year_totalRev / assumptions.beds : 0,
      fixedCosts: fixedTotal,
      varCosts: grossProfit - ebitdar,
      monthly,
    });
  }

  // Add CF Statement Standard Items for OpCo
  annualData = annualData.map((d) => {
    const cfo = d.netIncome;
    const cfo_in = d.totalRev || 0;
    const cfo_out = cfo - cfo_in;

    const isY3 = d.isOperating && d.year === "Year 3";
    const cfi =
      (isY3 ? -(assumptions.workingCapitalOpex || 0) : 0) + (d.opCoExit || 0);
    const cfi_in = d.opCoExit || 0;
    const cfi_out = isY3 ? -(assumptions.workingCapitalOpex || 0) : 0;

    const exitEv = d.ev || 0;
    const exitRetained = d.opCoExit ? Math.max(0, d.opCoExit - (d.ev || 0)) : 0;

    const sponsorEquity = -((d.pA_Outlay || 0) + (d.pB_Outlay || 0));
    const distributions =
      -((d.shareA || 0) + (d.shareB || 0)) -
      ((d.pA_Exit || 0) + (d.pB_Exit || 0));

    const cff_in = sponsorEquity + (d.debtDraw || 0);
    const cff_out = distributions - (d.principal || 0);
    const cff = cff_in + cff_out;

    const netFlow = cfo + cfi + cff;

    if (d.monthly) {
      d.monthly.cfo = d.monthly.netIncome.map((x) => x);
      d.monthly.cfo_in = d.monthly.totalRev.map((x) => x || 0);
      d.monthly.cfo_out = d.monthly.netIncome.map(
        (x, i) => x - (d.monthly.totalRev[i] || 0),
      );

      d.monthly.cfi = d.monthly.opCoExit.map(
        (x, i) =>
          (isY3 && i === 0 ? -(assumptions.workingCapitalOpex || 0) : 0) + x,
      );
      d.monthly.cfi_in = d.monthly.opCoExit.map((x) => x || 0);
      d.monthly.cfi_out = d.monthly.opCoExit.map((_, i) =>
        isY3 && i === 0 ? -(assumptions.workingCapitalOpex || 0) : 0,
      );

      d.monthly.exitEv = (d.monthly.ev || []).map((x) => x || 0);
      d.monthly.exitRetained = d.monthly.opCoExit.map((x, i) => {
        const ev_val = (d.monthly.ev || [])[i] || 0;
        return x ? Math.max(0, x - ev_val) : 0;
      });

      d.monthly.sponsorEquity = d.monthly.pA_Outlay.map(
        (_, i) =>
          -((d.monthly.pA_Outlay[i] || 0) + (d.monthly.pB_Outlay[i] || 0)),
      );
      d.monthly.distributions = d.monthly.shareA.map(
        (_, i) =>
          -((d.monthly.shareA[i] || 0) + (d.monthly.shareB[i] || 0)) -
          ((d.monthly.pA_Exit[i] || 0) + (d.monthly.pB_Exit[i] || 0)),
      );

      d.monthly.cff_in = d.monthly.sponsorEquity.map(
        (eq, i) => eq + (d.monthly.debtDraw[i] || 0),
      );
      d.monthly.cff_out = d.monthly.distributions.map(
        (dist, i) => dist - (d.monthly.principal[i] || 0),
      );
      d.monthly.cff = d.monthly.cff_in.map((x, i) => x + d.monthly.cff_out[i]);

      d.monthly.netFlow = d.monthly.cfo.map(
        (x, i) => x + d.monthly.cfi[i] + d.monthly.cff[i],
      );
    }

    return {
      ...d,
      cfo,
      cfo_in,
      cfo_out,
      cfi,
      cfi_in,
      cfi_out,
      cff,
      cff_in,
      cff_out,
      netFlow,
      exitEv,
      exitRetained,
      sponsorEquity,
      distributions,
    };
  });

  let currentCash = 0;
  annualData = annualData.map((d) => {
    currentCash += d.netFlow;
    return { ...d, endCash: currentCash };
  });

  const operatingData = annualData.filter((d) => d.isOperating);
  const stabilizedYear =
    operatingData.find((y) => y.bor >= assumptions.borMax) ||
    operatingData[operatingData.length - 1] ||
    operatingData[0];

  return applySafeMathPrecision({
    assumptions,
    annualData,
    operatingData,
    totals: {
      totalRev: annualData.reduce((acc, d) => acc + (d.totalRev || 0), 0),
      ipRev: annualData.reduce((acc, d) => acc + (d.ipRev || 0), 0),
      opRev: annualData.reduce((acc, d) => acc + (d.opRev || 0), 0),
      totalMedSupp: annualData.reduce(
        (acc, d) => acc + (d.totalMedSupp || 0),
        0,
      ),
      totalDocFee: annualData.reduce((acc, d) => acc + (d.totalDocFee || 0), 0),
      grossProfit: annualData.reduce((acc, d) => acc + (d.grossProfit || 0), 0),
      recurringOpex: annualData.reduce(
        (acc, d) => acc + (d.recurringOpex || 0),
        0,
      ),
      staffCost: annualData.reduce((acc, d) => acc + (d.staffCost || 0), 0),
      otherOpex: annualData.reduce((acc, d) => acc + (d.otherOpex || 0), 0),
      adminOpex: annualData.reduce((acc, d) => acc + (d.adminOpex || 0), 0),
      utilOpex: annualData.reduce((acc, d) => acc + (d.utilOpex || 0), 0),
      mktgOpex: annualData.reduce((acc, d) => acc + (d.mktgOpex || 0), 0),
      operatorOpex: annualData.reduce(
        (acc, d) => acc + (d.operatorOpex || 0),
        0,
      ),
      insOpex: annualData.reduce((acc, d) => acc + (d.insOpex || 0), 0),
      ebitdar: annualData.reduce((acc, d) => acc + (d.ebitdar || 0), 0),
      rent: annualData.reduce((acc, d) => acc + (d.rent || 0), 0),
      ebitda: annualData.reduce((acc, d) => acc + (d.ebitda || 0), 0),
      tax: annualData.reduce((acc, d) => acc + (d.tax || 0), 0),
      netIncome: annualData.reduce((acc, d) => acc + (d.netIncome || 0), 0),
      distributableProfit: annualData.reduce(
        (acc, d) => acc + (d.distributableProfit || 0),
        0,
      ),
      fcf: annualData.reduce((acc, d) => acc + (d.fcf || 0), 0),
      shareA: annualData.reduce((acc, d) => acc + (d.shareA || 0), 0),
      shareB: annualData.reduce((acc, d) => acc + (d.shareB || 0), 0),
      retainedThisYear: annualData.reduce(
        (acc, d) => acc + (d.retainedThisYear || 0),
        0,
      ),
      ev: annualData.reduce((acc, d) => acc + (d.ev || 0), 0),
      exitEv: annualData.reduce((acc, d) => acc + (d.exitEv || 0), 0),
      exitRetained: annualData.reduce(
        (acc, d) => acc + (d.exitRetained || 0),
        0,
      ),
      opCoExit: annualData.reduce((acc, d) => acc + (d.opCoExit || 0), 0),
      pA_Exit: annualData.reduce((acc, d) => acc + (d.pA_Exit || 0), 0),
      pB_Exit: annualData.reduce((acc, d) => acc + (d.pB_Exit || 0), 0),
      pA_Outlay: annualData.reduce((acc, d) => acc + (d.pA_Outlay || 0), 0),
      pB_Outlay: annualData.reduce((acc, d) => acc + (d.pB_Outlay || 0), 0),
      interest: annualData.reduce((acc, d) => acc + (d.interest || 0), 0),
      principal: annualData.reduce((acc, d) => acc + (d.principal || 0), 0),
      debtDraw: annualData.reduce((acc, d) => acc + (d.debtDraw || 0), 0),
      sponsorEquity: annualData.reduce((acc, d) => acc + (d.sponsorEquity || 0), 0),
      distributions: annualData.reduce((acc, d) => acc + (d.distributions || 0), 0),
      cfo: annualData.reduce((acc, d) => acc + (d.cfo || 0), 0),
      cfo_in: annualData.reduce((acc, d) => acc + (d.cfo_in || 0), 0),
      cfo_out: annualData.reduce((acc, d) => acc + (d.cfo_out || 0), 0),
      cfi: annualData.reduce((acc, d) => acc + (d.cfi || 0), 0),
      cfi_in: annualData.reduce((acc, d) => acc + (d.cfi_in || 0), 0),
      cfi_out: annualData.reduce((acc, d) => acc + (d.cfi_out || 0), 0),
      cff: annualData.reduce((acc, d) => acc + (d.cff || 0), 0),
      cff_in: annualData.reduce((acc, d) => acc + (d.cff_in || 0), 0),
      cff_out: annualData.reduce((acc, d) => acc + (d.cff_out || 0), 0),
      netFlow: annualData.reduce((acc, d) => acc + (d.netFlow || 0), 0),
      ebitdarMargin:
        annualData.reduce((acc, d) => acc + (d.totalRev || 0), 0) > 0
          ? (annualData.reduce((acc, d) => acc + (d.ebitdar || 0), 0) /
              annualData.reduce((acc, d) => acc + (d.totalRev || 0), 0)) *
            100
          : 0,
      netMargin:
        annualData.reduce((acc, d) => acc + (d.totalRev || 0), 0) > 0
          ? (annualData.reduce((acc, d) => acc + (d.netIncome || 0), 0) /
              annualData.reduce((acc, d) => acc + (d.totalRev || 0), 0)) *
            100
          : 0,
    },
    opsMetrics: {
      stabilizedVolume:
        (stabilizedYear?.ipCases || 0) + (stabilizedYear?.opVisits || 0),
      revPab:
        assumptions.beds > 0
          ? (stabilizedYear?.totalRev || 0) / assumptions.beds
          : 0,
      startingRevPab:
        assumptions.beds > 0 && operatingData.length > 0
          ? (operatingData[0]?.totalRev || 0) / assumptions.beds
          : 0,
      averageRevPab:
        assumptions.beds > 0 && operatingData.length > 0
          ? operatingData.reduce((acc, y) => acc + (y.totalRev || 0), 0) /
            operatingData.length /
            assumptions.beds
          : 0,
      ebitdaPerBed:
        assumptions.beds > 0
          ? (stabilizedYear?.ebitda || 0) / assumptions.beds
          : 0,
      fixedCostPct:
        ((stabilizedYear?.fixedCosts || 0) /
          ((stabilizedYear?.fixedCosts || 0) +
            (stabilizedYear?.varCosts || 0) || 1)) *
        100,
      beds: assumptions.beds,
    },
    setupDetails: {
      jvaOpex: assumptions.jvaOpex ?? 2.5,
      commOpex: assumptions.commOpex ?? 15.0,
      workingCapitalOpex: assumptions.workingCapitalOpex ?? 64.671175,
    },
    totalEquity,
    projectIRR: calculateIRR(projectCfsMonthly, "monthly"),
    projectNPV: calculateNPV(
      projectCfsMonthly,
      assumptions.discountRate,
      "monthly",
    ),
    partnerA: {
      irr: calculateIRR(partnerACfsMonthly, "monthly"),
      payback: calculatePayback(partnerACfsMonthly, "monthly"),
      totalCash: annualData.reduce(
        (acc, d) => acc + (d.shareA || 0) + (d.pA_Exit || 0),
        0,
      ),
      moic:
        assumptions.partnerAEquity > 0
          ? annualData.reduce(
              (acc, d) => acc + (d.shareA || 0) + (d.pA_Exit || 0),
              0,
            ) / assumptions.partnerAEquity
          : 0,
      avgYield:
        operatingData.length > 0
          ? operatingData.reduce((a, b) => a + (b.pA_Yield || 0), 0) /
            operatingData.length
          : 0,
    },
    partnerB: {
      irr: calculateIRR(partnerBCfsMonthly, "monthly"),
      payback: calculatePayback(partnerBCfsMonthly, "monthly"),
      totalCash: annualData.reduce(
        (acc, d) => acc + (d.shareB || 0) + (d.pB_Exit || 0),
        0,
      ),
      moic:
        assumptions.partnerBEquity > 0
          ? annualData.reduce(
              (acc, d) => acc + (d.shareB || 0) + (d.pB_Exit || 0),
              0,
            ) / assumptions.partnerBEquity
          : 0,
      avgYield:
        operatingData.length > 0
          ? operatingData.reduce((a, b) => a + (b.pB_Yield || 0), 0) /
            operatingData.length
          : 0,
    },
    projectCfsMonthly,
    partnerACfsMonthly,
    partnerBCfsMonthly,
  });
};

export const runPropCoEngine = (
  assumptions: PropCoAssumptions,
  opCoModelData?: OpCoModelData | null,
  config?: ProjConfig,
  groups: any[] = [],
): PropCoModelData => {
  const requestedYears = config?.projYears || 10;
  const projYears = Math.min(requestedYears, 30);

  // Link Timeline Capex
  const allTasks = (groups || []).flatMap((g) => g.tasks || []);
  const hasTimeline = allTasks.length > 0;

  const commOpeningTask = allTasks.find(
    (t) =>
      t.id === "t13" || t.name.toLowerCase().includes("commercial opening"),
  );
  const totalDevMonths =
    hasTimeline && commOpeningTask
      ? Math.max(1, commOpeningTask.start - 1)
      : assumptions.devDurationMonths || 24;

  const getTaskTimingDistribution = (matchStrs) => {
    const monthly = new Array(projYears * 12).fill(0);
    const tasks = allTasks.filter((t) =>
      matchStrs.some((str) => t.name.toLowerCase().includes(str.toLowerCase())),
    );
    if (tasks.length === 0) return null;

    let totalActiveMonths = 0;
    tasks.forEach((task) => {
      totalActiveMonths += Math.max(1, task.duration);
    });

    tasks.forEach((task) => {
      const s = Math.max(0, task.start - 1);
      const d = Math.max(1, task.duration);
      for (let m = s; m < s + d && m < monthly.length; m++) {
        monthly[m] += 1 / totalActiveMonths;
      }
    });
    return monthly;
  };

  const constrTiming = getTaskTimingDistribution([
    "structure",
    "construction",
    "piling",
    "foundation",
    "mep",
    "civil",
    "bunker",
  ]);
  const eqTiming = getTaskTimingDistribution([
    "asset lease",
    "equipment",
    "medical equip",
  ]);
  const infraTiming = getTaskTimingDistribution(["infrastructure"]);
  const ffeTiming = getTaskTimingDistribution([
    "ff&e",
    "interior",
    "fit-out",
    "furniture",
  ]);
  const sharingTiming = getTaskTimingDistribution(["sharing"]);
  const consultantTiming = getTaskTimingDistribution([
    "consultant",
    "feasibility",
    "architectural",
    "layouts",
  ]);
  const licenseTiming = getTaskTimingDistribution([
    "licens",
    "permit",
    "clearance",
  ]);
  const landTiming = getTaskTimingDistribution(["land"]);

  let exitYear = null;
  if (config?.exitYear !== undefined && config.exitYear !== null) {
    exitYear = Math.min(config.exitYear, 30);
  } else if (assumptions.includeTerminalValue) {
    exitYear = 10;
  }
  let annualData = [],
    equityCfsMonthly = [],
    equityCfsExLandMonthly = [],
    unleveredCfsMonthly = [],
    operatingCfsMonthly = [],
    devGaMonthly = [],
    devCarMonthly = [],
    hardSpendMonthly = [],
    softSpendMonthly = [],
    totalSpendMonthly = [];

  const landCost =
    (assumptions.includeLand ?? true) && !assumptions.isLandLeased
      ? (assumptions.landArea * assumptions.landPrice) / 1000
      : 0;
  const buildCost = (assumptions.buildArea * assumptions.buildCost) / 1000;
  const medEqFullValue = assumptions.includeMedEq
    ? (assumptions.capexMedEqQty * assumptions.capexMedEqPrice) / 1000
    : 0;
  const medEqCost =
    assumptions.medEqProcurement === "lease_operating" ? 0 : medEqFullValue;
  const infraCost =
    (assumptions.capexInfraQty * assumptions.capexInfraPrice) / 1000;
  const ffeCost = assumptions.includeFFE
    ? (assumptions.capexFFEQty * assumptions.capexFFEPrice) / 1000
    : 0;
  const sharingDevCost =
    (assumptions.capexSharingDevQty * assumptions.capexSharingDevPrice) / 1000;
  const totalHardCosts =
    buildCost + medEqCost + infraCost + ffeCost + sharingDevCost;

  const upfrontMedEq =
    assumptions.medEqProcurement !== "lease" &&
    assumptions.medEqProcurement !== "lease_operating"
      ? medEqCost
      : 0;
  const leasedMedEq = medEqCost - upfrontMedEq;

  const consultantBase = buildCost + ffeCost + infraCost + medEqFullValue;
  const licenseBase = consultantBase;

  const upfrontConsultantCost =
    consultantBase * ((assumptions.capexConsultantPct || 0) / 100);
  const upfrontLicenseCost =
    licenseBase * ((assumptions.capexLicensePct || 0) / 100);
  const deferredConsultantCost = 0;
  const deferredLicenseCost = 0;

  const consultantCost = upfrontConsultantCost + deferredConsultantCost;
  const licenseCost = upfrontLicenseCost + deferredLicenseCost;

  const upfrontVatBase =
    upfrontConsultantCost +
    buildCost +
    ffeCost +
    infraCost +
    upfrontMedEq +
    sharingDevCost;
  const upfrontVatCost = upfrontVatBase * ((assumptions.capexVat || 0) / 100);
  const deferredVatBase = deferredConsultantCost + leasedMedEq;
  const deferredVatCost = deferredVatBase * ((assumptions.capexVat || 0) / 100);

  const vatCost = upfrontVatCost + deferredVatCost;

  const carCost = buildCost * ((assumptions.devCarPct || 0) / 100);
  // totalDevMonths is pre-calculated based on the timeline above
  const devGaTotalCost = (assumptions.devGaMonthly || 0) * totalDevMonths;

  const upfrontContingencyBase =
    upfrontLicenseCost +
    upfrontConsultantCost +
    buildCost +
    ffeCost +
    infraCost +
    sharingDevCost +
    upfrontVatCost +
    upfrontMedEq;
  const upfrontContingencyCost =
    upfrontContingencyBase * ((assumptions.capexContingencyPct || 0) / 100);
  const deferredContingencyBase =
    deferredLicenseCost +
    deferredConsultantCost +
    leasedMedEq +
    deferredVatCost;
  const deferredContingencyCost =
    deferredContingencyBase * ((assumptions.capexContingencyPct || 0) / 100);

  const contingencyCost = upfrontContingencyCost + deferredContingencyCost;

  const deferredSoftCosts =
    deferredConsultantCost +
    deferredLicenseCost +
    deferredVatCost +
    deferredContingencyCost;

  const totalCapex =
    landCost +
    buildCost +
    medEqCost +
    infraCost +
    ffeCost +
    consultantCost +
    licenseCost +
    sharingDevCost +
    vatCost +
    carCost +
    devGaTotalCost +
    contingencyCost;

  const upfrontTotalCapex = totalCapex - leasedMedEq - deferredSoftCosts;

  const totalSoftCosts = totalCapex - landCost - totalHardCosts;
  const upfrontSoftCosts = totalSoftCosts - deferredSoftCosts;
  const effectiveLtv = assumptions.includeFinancing ? assumptions.ltv : 0;

  const totalCapexExLand = upfrontTotalCapex - landCost;
  const devAndCarCost = devGaTotalCost + carCost;
  const baseForDebtSizing = (assumptions.includeLandInLtv ?? false) ? upfrontTotalCapex : totalCapexExLand;
  const debtSizingBase =
    (assumptions.includePreOpInLtv ?? true)
      ? baseForDebtSizing
      : baseForDebtSizing - devAndCarCost;

  const totalDebt = Math.max(0, debtSizingBase) * (effectiveLtv / 100);
  const totalEquity = upfrontTotalCapex - totalDebt;

  const ioYears = assumptions.ioGracePeriodYears || 0;
  const ioGraceMonths = ioYears * 12;
  const loanTenorMonths = (assumptions.loanTenor || 15) * 12;
  const amortizingTenorMonths = Math.max(1, loanTenorMonths - ioGraceMonths);
  const rateMonthly = assumptions.interestRate / 100 / 12;

  const postIoPmtMonthly = Math.abs(
    calculatePMT(rateMonthly, amortizingTenorMonths, totalDebt),
  );

  const baseForDebtSizingExLand = totalCapexExLand;
  const debtSizingBaseExLand =
    (assumptions.includePreOpInLtv ?? true)
      ? baseForDebtSizingExLand
      : baseForDebtSizingExLand - devAndCarCost;
  const totalDebtExLand = (assumptions.includeLandInLtv ?? false)
    ? Math.max(0, debtSizingBaseExLand) * (effectiveLtv / 100)
    : totalDebt;
  const totalEquityExLand = Math.max(0, totalCapexExLand) - totalDebtExLand;
  const postIoPmtExLandMonthly = Math.abs(
    calculatePMT(rateMonthly, amortizingTenorMonths, totalDebtExLand),
  );

  const vatRate = (assumptions.capexVat || 0) / 100;
  const contingencyRate = (assumptions.capexContingencyPct || 0) / 100;

  // Proportional VAT allocation (Licenses excluded)
  const buildVat = buildCost * vatRate;
  const medEqVatUpfront = upfrontMedEq * vatRate;
  const infraVat = infraCost * vatRate;
  const ffeVat = ffeCost * vatRate;
  const sharingVat = sharingDevCost * vatRate;
  const consultantVat = upfrontConsultantCost * vatRate;

  // Proportional Contingency allocation
  const buildContingency = (buildCost + buildVat) * contingencyRate;
  const medEqContingencyUpfront =
    (upfrontMedEq + medEqVatUpfront) * contingencyRate;
  const infraContingency = (infraCost + infraVat) * contingencyRate;
  const ffeContingency = (ffeCost + ffeVat) * contingencyRate;
  const sharingContingency = (sharingDevCost + sharingVat) * contingencyRate;
  const consultantContingency =
    (upfrontConsultantCost + consultantVat) * contingencyRate;
  const licenseContingency = upfrontLicenseCost * contingencyRate;

  const buildBasis = buildCost;
  let medEqBasis = upfrontMedEq;
  const infraBasis = infraCost;
  const ffeBasis = ffeCost;
  const sharingBasis = sharingDevCost;

  let consultantBasis = upfrontConsultantCost;
  let licenseBasis = upfrontLicenseCost;
  let vatBasis = upfrontVatCost;
  let contingencyBasis = upfrontContingencyCost;

  const devYears = Math.max(1, Math.ceil(totalDevMonths / 12));

  let outstandingDebt = 0,
    outstandingDebtExLand = 0,
    equityCum = 0,
    equityCumExLand = 0;

  let debtDrawsMonthly = [];
  let idcMonthly = [];
  let idcExLandMonthly = [];
  let landSpendMonthly = [];
  let buildSpendMonthlyArr = [];
  let eqSpendMonthlyArr = [];
  let infraSpendMonthlyArr = [];
  let ffeSpendMonthlyArr = [];
  let sharingSpendMonthlyArr = [];
  let consultantSpendMonthlyArr = [];
  let licenseSpendMonthlyArr = [];
  let vatSpendMonthlyArr = [];
  let contingencySpendMonthlyArr = [];

  const genericCapex = totalCapex - consultantCost - licenseCost - leasedMedEq;

  const devAndCarCostForGeneric = devGaTotalCost + carCost;
  const baseForGenericDebtSizing = (assumptions.includeLandInLtv ?? false) ? genericCapex : genericCapex - landCost;
  const genericDebtSizingBase =
    (assumptions.includePreOpInLtv ?? true)
      ? baseForGenericDebtSizing
      : baseForGenericDebtSizing - devAndCarCostForGeneric;
  const baseForGenericDebtSizingExLand = genericCapex - landCost;
  const genericDebtSizingBaseExLand =
    (assumptions.includePreOpInLtv ?? true)
      ? baseForGenericDebtSizingExLand
      : baseForGenericDebtSizingExLand - devAndCarCostForGeneric;
  const genericPreOpExclusion =
    (assumptions.includePreOpInLtv ?? true) ? 0 : devAndCarCostForGeneric;

  const genericEquity =
    genericDebtSizingBase * (1 - effectiveLtv / 100) + genericPreOpExclusion;
  const genericEquityExLand =
    genericDebtSizingBaseExLand * (1 - effectiveLtv / 100) +
    genericPreOpExclusion;

  let cumNonLandCapex = 0;
  let cumDebtDrawn = 0;

  // Run development phase month-by-month
  for (let md = 1; md <= totalDevMonths; md++) {
    const devYearOfThisMonth = Math.ceil(md / 12);
    const m_ga = assumptions.devGaMonthly || 0;

    let m_hard = 0,
      m_soft = 0,
      capDrawBase_month = 0,
      eqDrawBase_month = 0,
      eqDrawExLandBase_month = 0;
    let fallback_m_car = 0;

    let m_build = 0,
      m_eq = 0,
      m_infra = 0,
      m_ffe = 0,
      m_sharing = 0;
    let m_consultant = 0,
      m_license = 0,
      m_vat = 0,
      m_contingency = 0;

    if (hasTimeline) {
      // Hard Costs Month
      const t_land = landTiming
        ? landCost * (landTiming[md - 1] || 0)
        : md === 1
          ? landCost
          : 0;
      const t_build = constrTiming
        ? buildCost * (constrTiming[md - 1] || 0)
        : buildCost / totalDevMonths;
      const t_eq = eqTiming
        ? upfrontMedEq * (eqTiming[md - 1] || 0)
        : upfrontMedEq / totalDevMonths;
      const t_infra = infraTiming
        ? infraCost * (infraTiming[md - 1] || 0)
        : infraCost / totalDevMonths;
      const t_ffe = ffeTiming
        ? ffeCost * (ffeTiming[md - 1] || 0)
        : ffeCost / totalDevMonths;
      const t_sharing = sharingTiming
        ? sharingDevCost * (sharingTiming[md - 1] || 0)
        : sharingDevCost / totalDevMonths;

      // Soft Costs Month
      const t_consultant = consultantTiming
        ? upfrontConsultantCost * (consultantTiming[md - 1] || 0)
        : md >= 2 && md <= 7
          ? upfrontConsultantCost / 6
          : 0;
      const t_license = licenseTiming
        ? upfrontLicenseCost * (licenseTiming[md - 1] || 0)
        : md === 1
          ? upfrontLicenseCost
          : 0;

      // Pro-rata VAT, Contingency, CAR based on core spend this month
      const core_spend =
        t_build + t_eq + t_infra + t_ffe + t_sharing + t_consultant + t_license;
      const total_core_cost =
        buildCost +
        upfrontMedEq +
        infraCost +
        ffeCost +
        sharingDevCost +
        upfrontConsultantCost +
        upfrontLicenseCost;
      const pct_of_core =
        total_core_cost > 0 ? core_spend / total_core_cost : 1 / totalDevMonths;

      const t_vat = upfrontVatCost * pct_of_core;
      const t_contingency = upfrontContingencyCost * pct_of_core;
      const t_car = constrTiming
        ? carCost * (constrTiming[md - 1] || 0)
        : carCost / totalDevMonths;

      fallback_m_car = t_car;

      m_build = t_build;
      m_eq = t_eq;
      m_infra = t_infra;
      m_ffe = t_ffe;
      m_sharing = t_sharing;
      m_consultant = t_consultant;
      m_license = t_license;
      m_vat = t_vat;
      m_contingency = t_contingency;

      m_hard = t_build + t_eq + t_infra + t_ffe + t_sharing;
      m_soft = t_consultant + t_license + t_vat + t_contingency;
      const m_preOp = t_car + m_ga;

      const m_land_final = landTiming
        ? landCost * (landTiming[md - 1] || 0)
        : md === 1
          ? landCost
          : 0;

      capDrawBase_month =
        m_land_final +
        m_hard +
        m_soft +
        m_preOp; // INCLUDING LAND

      const baseForMDebtSizing = (assumptions.includeLandInLtv ?? false) ? capDrawBase_month : capDrawBase_month - m_land_final;
      const m_debtSizingBase =
        (assumptions.includePreOpInLtv ?? true)
          ? baseForMDebtSizing
          : baseForMDebtSizing - m_preOp;
      const baseForMDebtSizingExLand = capDrawBase_month - m_land_final;
      const m_debtSizingBaseExLand =
        (assumptions.includePreOpInLtv ?? true)
          ? baseForMDebtSizingExLand
          : baseForMDebtSizingExLand - m_preOp;
      const m_preOpExclusion =
        (assumptions.includePreOpInLtv ?? true) ? 0 : m_preOp;

      eqDrawBase_month =
        m_debtSizingBase * (1 - effectiveLtv / 100) + m_preOpExclusion;
      eqDrawExLandBase_month =
        m_debtSizingBaseExLand * (1 - effectiveLtv / 100) + m_preOpExclusion;
    } else {
      let genericCapDraw_month, genericEqDraw_month, genericEqDrawExLand_month;
      if (devYears > 1) {
        const y1Pct = (assumptions.equityDrawYear1Pct ?? 50) / 100;
        if (devYearOfThisMonth === 1) {
          genericCapDraw_month = (genericCapex * y1Pct) / 12;
          genericEqDraw_month = (genericEquity * y1Pct) / 12;
          genericEqDrawExLand_month = (genericEquityExLand * y1Pct) / 12;
        } else {
          const remainingMonths = totalDevMonths - 12;
          genericCapDraw_month = (genericCapex * (1 - y1Pct)) / remainingMonths;
          genericEqDraw_month = (genericEquity * (1 - y1Pct)) / remainingMonths;
          genericEqDrawExLand_month =
            (genericEquityExLand * (1 - y1Pct)) / remainingMonths;
        }
      } else {
        genericCapDraw_month = genericCapex / totalDevMonths;
        genericEqDraw_month = genericEquity / totalDevMonths;
        genericEqDrawExLand_month = genericEquityExLand / totalDevMonths;
      }

      let m_consultantCost = 0;
      if (md >= 2 && md <= 7) m_consultantCost = upfrontConsultantCost / 6;

      let m_licenseCost = 0;
      if (md === 1) m_licenseCost = upfrontLicenseCost;

      capDrawBase_month =
        genericCapDraw_month + m_consultantCost + m_licenseCost;
      eqDrawBase_month =
        genericEqDraw_month +
        (m_consultantCost + m_licenseCost) * (1 - effectiveLtv / 100);
      eqDrawExLandBase_month =
        genericEqDrawExLand_month +
        (m_consultantCost + m_licenseCost) * (1 - effectiveLtv / 100);

      m_hard =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * (totalHardCosts - leasedMedEq)) /
            upfrontTotalCapex
          : 0;
      m_soft =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * upfrontSoftCosts) / upfrontTotalCapex
          : 0;

      m_build =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * buildCost) / upfrontTotalCapex
          : 0;
      m_eq =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * upfrontMedEq) / upfrontTotalCapex
          : 0;
      m_infra =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * infraCost) / upfrontTotalCapex
          : 0;
      m_ffe =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * ffeCost) / upfrontTotalCapex
          : 0;
      m_sharing =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * sharingDevCost) / upfrontTotalCapex
          : 0;

      m_consultant =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * upfrontConsultantCost) / upfrontTotalCapex
          : 0;
      m_license =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * upfrontLicenseCost) / upfrontTotalCapex
          : 0;
      m_vat =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * upfrontVatCost) / upfrontTotalCapex
          : 0;
      m_contingency =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * upfrontContingencyCost) / upfrontTotalCapex
          : 0;

      const buildSpendMonthly =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * buildCost) / upfrontTotalCapex
          : 0;
      fallback_m_car = buildSpendMonthly * ((assumptions.devCarPct || 0) / 100);
    }

    let m_land_final = 0;
    if (hasTimeline) {
      m_land_final = landTiming
        ? landCost * (landTiming[md - 1] || 0)
        : md === 1
          ? landCost
          : 0;
    } else {
      m_land_final =
        upfrontTotalCapex > 0
          ? (capDrawBase_month * landCost) / upfrontTotalCapex
          : 0;
    }

    // Track debt drawn based on capEx base month
    let m_debtDraw = 0;
    const m_nonLandCapex = Math.max(0, capDrawBase_month - m_land_final);
    const m_drawBase = (assumptions.includeLandInLtv ?? false) ? capDrawBase_month : m_nonLandCapex;
    const totalSizingBase = (assumptions.includeLandInLtv ?? false) ? upfrontTotalCapex : totalCapexExLand;

    if (assumptions.drawdownScenario === "tranches" && totalSizingBase > 0) {
      cumNonLandCapex += m_drawBase;
      const progress = cumNonLandCapex / totalSizingBase;

      const tranches: number[] = ensureArray(
        assumptions.drawdownTranches || [20, 40, 60, 80, 100],
      ).map(Number);
      const p = progress * 100 + 0.0001; // Allow for floating point precision

      let targetTrancheDebtPct = 0;
      for (let tIdx = 0; tIdx < tranches.length; tIdx++) {
        if (p >= tranches[tIdx] || md === totalDevMonths) {
          targetTrancheDebtPct = tranches[tIdx];
        }
      }
      if (md === totalDevMonths) targetTrancheDebtPct = 100;

      const targetDebtDrawn = totalDebt * (targetTrancheDebtPct / 100);

      m_debtDraw = Math.max(0, targetDebtDrawn - cumDebtDrawn);
      cumDebtDrawn += m_debtDraw;
    } else {
      m_debtDraw = m_drawBase * (effectiveLtv / 100);
    }

    const m_debtDrawExLand = (assumptions.includeLandInLtv ?? false)
      ? (assumptions.drawdownScenario === "tranches"
          ? (totalSizingBase > 0 ? m_debtDraw * (totalCapexExLand / totalSizingBase) : 0)
          : m_nonLandCapex * (effectiveLtv / 100))
      : m_debtDraw;

    // IDC calculated on PRIOR balance (before this month's draw)
    const m_idc = outstandingDebt * rateMonthly;
    const m_idcExLand = outstandingDebtExLand * rateMonthly;

    const isCashPayIdc = (assumptions.idcTreatment || "cash_pay") === "cash_pay";

    if (isCashPayIdc) {
      outstandingDebt += m_debtDraw;
      outstandingDebtExLand += m_debtDrawExLand;
    } else {
      outstandingDebt += m_debtDraw + m_idc;
      outstandingDebtExLand += m_debtDrawExLand + m_idcExLand;
    }

    const m_eqDraw = isCashPayIdc
      ? -(capDrawBase_month + m_idc - m_debtDraw)
      : -(capDrawBase_month - m_debtDraw);

    const m_eqDrawExLand = isCashPayIdc
      ? -(Math.max(0, capDrawBase_month - m_land_final) + m_idcExLand - m_debtDrawExLand)
      : -(Math.max(0, capDrawBase_month - m_land_final) - m_debtDrawExLand);

    const m_unleveredCf = -capDrawBase_month;

    const m_preOp = m_ga + fallback_m_car;
    const projectSpend_month = m_land_final + m_hard + m_soft + m_preOp + (isCashPayIdc ? m_idc : 0);

    landSpendMonthly.push(m_land_final);
    hardSpendMonthly.push(m_hard);
    softSpendMonthly.push(m_soft);
    totalSpendMonthly.push(projectSpend_month);
    debtDrawsMonthly.push(m_debtDraw);
    idcMonthly.push(m_idc);
    idcExLandMonthly.push(m_idcExLand);

    buildSpendMonthlyArr.push(m_build);
    eqSpendMonthlyArr.push(m_eq);
    infraSpendMonthlyArr.push(m_infra);
    ffeSpendMonthlyArr.push(m_ffe);
    sharingSpendMonthlyArr.push(m_sharing);

    consultantSpendMonthlyArr.push(m_consultant);
    licenseSpendMonthlyArr.push(m_license);
    vatSpendMonthlyArr.push(m_vat);
    contingencySpendMonthlyArr.push(m_contingency);

    equityCfsMonthly.push(m_eqDraw);
    equityCfsExLandMonthly.push(m_eqDrawExLand);
    unleveredCfsMonthly.push(m_unleveredCf);
    operatingCfsMonthly.push(m_eqDraw);
    devGaMonthly.push(m_ga);
    devCarMonthly.push(fallback_m_car);
    equityCum += m_eqDraw;
    equityCumExLand += m_eqDrawExLand;
  }

  const peakEquityRequired = Math.abs(equityCum);
  const peakTotalInvestment = totalSpendMonthly.reduce((a, b) => a + b, 0);

  // Push annual development summaries
  for (let i = 1; i <= devYears; i++) {
    const monthsThisYear = Math.min(
      12,
      Math.max(0, totalDevMonths - (i - 1) * 12),
    );
    const ga_year = devGaMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const car_year = devCarMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);

    const eqDraw_year = equityCfsMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const eqDrawExLand_year = equityCfsExLandMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const unleveredCf_year = unleveredCfsMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);

    const land_year = landSpendMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const hard_year = hardSpendMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const soft_year = softSpendMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const totalSpend_year = totalSpendMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const debtDraw_year = debtDrawsMonthly
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);

    // Detailed aggregations
    const build_year = buildSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const eq_year = eqSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const infra_year = infraSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const ffe_year = ffeSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const sharing_year = sharingSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);

    const consultant_year = consultantSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const license_year = licenseSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const vat_year = vatSpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);
    const contingency_year = contingencySpendMonthlyArr
      .slice((i - 1) * 12, i * 12)
      .reduce((a, b) => a + b, 0);

    let monthly = {
      debtBalance: [],
      debtBalanceExLand: [],
      fcfe: [],
      fcfeExLand: [],
      debtDraw: [],
      landSpend: [],
      buildSpend: [],
      eqSpend: [],
      infraSpend: [],
      ffeSpend: [],
      sharingSpend: [],
      consultantSpend: [],
      licenseSpend: [],
      vatSpend: [],
      contingencySpend: [],
      cumFcfe: [],
      cumFcfeExLand: [],
      devGa: [],
      devCar: [],
      gop: [],
      ebitda: [],
      ebit: [],
      ebt: [],
      netIncome: [],
      corpTax: [],
      ebtExLand: [],
      corpTaxExLand: [],
      interest: [],
      interestExLand: [],
      dep: [],
      hardSpend: [],
      softSpend: [],
      totalSpend: [],
      unleveredCf: [],
    };
    for (let m = 0; m < 12; m++) {
      const mIdx = (i - 1) * 12 + m;
      const m_fcfe = equityCfsMonthly[mIdx] || 0;
      const m_fcfeExLand = equityCfsExLandMonthly[mIdx] || 0;
      const m_ga = devGaMonthly[mIdx] || 0;
      const m_car = devCarMonthly[mIdx] || 0;
      const m_land = landSpendMonthly[mIdx] || 0;
      const m_hard = hardSpendMonthly[mIdx] || 0;
      const m_soft = softSpendMonthly[mIdx] || 0;
      const m_total = totalSpendMonthly[mIdx] || 0;
      const m_debtDraw = debtDrawsMonthly[mIdx] || 0;

      const m_build = buildSpendMonthlyArr[mIdx] || 0;
      const m_eq = eqSpendMonthlyArr[mIdx] || 0;
      const m_infra = infraSpendMonthlyArr[mIdx] || 0;
      const m_ffe = ffeSpendMonthlyArr[mIdx] || 0;
      const m_sharing = sharingSpendMonthlyArr[mIdx] || 0;

      const m_consultant = consultantSpendMonthlyArr[mIdx] || 0;
      const m_license = licenseSpendMonthlyArr[mIdx] || 0;
      const m_vat = vatSpendMonthlyArr[mIdx] || 0;
      const m_contingency = contingencySpendMonthlyArr[mIdx] || 0;

      const m_unleveredCf = unleveredCfsMonthly[mIdx] || 0;
      const m_idc = idcMonthly[mIdx] || 0;
      const m_idcExLand = idcExLandMonthly[mIdx] || 0;
      const m_ebitda = -(m_ga + m_car);
      const m_ebt = m_ebitda - m_idc;
      const m_ebtExLand = m_ebitda - m_idcExLand;

      monthly.debtBalance.push(outstandingDebt);
      monthly.debtBalanceExLand.push(outstandingDebtExLand);
      monthly.fcfe.push(m_fcfe);
      monthly.fcfeExLand.push(m_fcfeExLand);
      monthly.devGa.push(m_ga);
      monthly.devCar.push(m_car);
      monthly.landSpend.push(m_land);
      monthly.buildSpend.push(m_build);
      monthly.eqSpend.push(m_eq);
      monthly.infraSpend.push(m_infra);
      monthly.ffeSpend.push(m_ffe);
      monthly.sharingSpend.push(m_sharing);
      monthly.consultantSpend.push(m_consultant);
      monthly.licenseSpend.push(m_license);
      monthly.vatSpend.push(m_vat);
      monthly.contingencySpend.push(m_contingency);
      monthly.hardSpend.push(m_hard);
      monthly.softSpend.push(m_soft);
      monthly.totalSpend.push(m_total);
      monthly.debtDraw.push(m_debtDraw);
      monthly.unleveredCf.push(m_unleveredCf);
      monthly.ebitda.push(m_ebitda);
      monthly.ebt.push(m_ebt);
      monthly.ebtExLand.push(m_ebtExLand);
      monthly.netIncome.push(m_ebt);
      monthly.corpTax.push(0);
      monthly.corpTaxExLand.push(0);
      monthly.interest.push(m_idc);
      monthly.interestExLand.push(m_idcExLand);
      monthly.dep.push(0);
      monthly.cumFcfe.push(
        equityCfsMonthly.slice(0, mIdx + 1).reduce((a, b) => a + b, 0),
      );
      monthly.cumFcfeExLand.push(
        equityCfsExLandMonthly.slice(0, mIdx + 1).reduce((a, b) => a + b, 0),
      );
    }

    const interest_year = monthly.interest.reduce((a, b) => a + b, 0);
    const interestExLand_year = monthly.interestExLand.reduce(
      (a, b) => a + b,
      0,
    );

    annualData.push({
      year: `Year ${i}`,
      isOperating: false,
      revenue: 0,
      preOpeningDev: ga_year + car_year,
      gop: -(ga_year + car_year),
      ebitda: -(ga_year + car_year),
      ebit: -(ga_year + car_year),
      ebt: -(ga_year + car_year) - interest_year,
      ebtExLand: -(ga_year + car_year) - interestExLand_year,
      netIncome: -(ga_year + car_year) - interest_year,
      corpTax: 0,
      corpTaxExLand: 0,
      interest: interest_year,
      interestExLand: interestExLand_year,
      dep: 0,
      debtBalance:
        monthly.debtBalance[monthly.debtBalance.length - 1] || outstandingDebt,
      debtBalanceExLand:
        monthly.debtBalanceExLand[monthly.debtBalanceExLand.length - 1] ||
        outstandingDebtExLand,
      devGa: ga_year,
      devCar: car_year,
      landSpend: land_year,
      buildSpend: build_year,
      eqSpend: eq_year,
      infraSpend: infra_year,
      ffeSpend: ffe_year,
      sharingSpend: sharing_year,
      consultantSpend: consultant_year,
      licenseSpend: license_year,
      vatSpend: vat_year,
      contingencySpend: contingency_year,
      hardSpend: hard_year,
      softSpend: soft_year,
      totalSpend: totalSpend_year,
      debtDraw: debtDraw_year,
      unleveredCf: unleveredCf_year,
      fcfe: eqDraw_year,
      cumFcfe: equityCfsMonthly.slice(0, i * 12).reduce((a, b) => a + b, 0),
      dscrBuffer: 0,
      fcfeExLand: eqDrawExLand_year,
      cumFcfeExLand: equityCfsExLandMonthly
        .slice(0, i * 12)
        .reduce((a, b) => a + b, 0),
      monthly,
    });
  }

  let avgDscr = 0,
    avgYield = 0;
  const opCoRents =
    opCoModelData?.annualData
      ?.filter((d) => d.isOperating)
      ?.map((d) => d.rent) || [];
  const totalIdcAccumulated = idcMonthly.reduce((a, b) => a + b, 0);
  const isCashPayIdc = (assumptions.idcTreatment || "cash_pay") === "cash_pay";
  const capitalizedBldgIdc = isCashPayIdc ? totalIdcAccumulated : 0;

  // Track book values of each component (base, vat, contingency) separately
  let bvB_base = buildCost + capitalizedBldgIdc,
    bvB_vat = buildVat,
    bvB_contingency = buildContingency;

  let bvM_base = upfrontMedEq,
    bvM_vat = medEqVatUpfront,
    bvM_contingency = medEqContingencyUpfront;

  let bvI_base = infraCost,
    bvI_vat = infraVat,
    bvI_contingency = infraContingency;

  let bvF_base = ffeCost,
    bvF_vat = ffeVat,
    bvF_contingency = ffeContingency;

  let bvSharing_base = sharingDevCost,
    bvSharing_vat = sharingVat,
    bvSharing_contingency = sharingContingency;

  let bvConsultant_base = upfrontConsultantCost,
    bvConsultant_vat = consultantVat,
    bvConsultant_contingency = consultantContingency;

  let bvLicense_base = upfrontLicenseCost,
    bvLicense_vat = 0,
    bvLicense_contingency = licenseContingency;

  // Active calculation bases for depreciations (allows deferred cost additions)
  let buildBasis_base = buildCost + capitalizedBldgIdc;
  let buildBasis_vat = buildVat;
  let buildBasis_contingency = buildContingency;

  let medEqBasis_base = upfrontMedEq;
  let medEqBasis_vat = medEqVatUpfront;
  let medEqBasis_contingency = medEqContingencyUpfront;

  let infraBasis_base = infraCost;
  let infraBasis_vat = infraVat;
  let infraBasis_contingency = infraContingency;

  let ffeBasis_base = ffeCost;
  let ffeBasis_vat = ffeVat;
  let ffeBasis_contingency = ffeContingency;

  let sharingBasis_base = sharingDevCost;
  let sharingBasis_vat = sharingVat;
  let sharingBasis_contingency = sharingContingency;

  let consultantBasis_base = upfrontConsultantCost;
  let consultantBasis_vat = consultantVat;
  let consultantBasis_contingency = consultantContingency;

  let licenseBasis_base = upfrontLicenseCost;
  let licenseBasis_vat = 0;
  let licenseBasis_contingency = licenseContingency;

  const initialDebtAtStartOfOperations = outstandingDebt;
  const initialDebtAtStartOfOperationsExLand = outstandingDebtExLand;

  const repaymentType = assumptions.repaymentType || "standard";
  let stepUpPercentages = ensureArray(assumptions.stepUpPercentages);
  if (repaymentType === "step_up" && stepUpPercentages.length === 0) {
    const amortYears = Math.max(
      1,
      (assumptions.loanTenor || 15) - (assumptions.ioGracePeriodYears || 2),
    );
    stepUpPercentages = getInitialStepUpPercentages(
      amortYears,
      "tangerang_stepup",
    );
  }

  // Run operating phase month-by-month and group annually
  for (let i = 1; i <= projYears; i++) {
    let annualRevenue = assumptions.linkToOpCo
      ? opCoRents[i - 1] || 0
      : assumptions.manualBaseRent *
        Math.pow(1 + assumptions.manualRentEscalation / 100, i - 1);
    const maint_year = buildCost * (assumptions.maintRate / 100),
      taxOp_year = totalCapex * (assumptions.propTaxRate / 100);
    const overhead_year =
      assumptions.opOverheadMonthly *
      12 *
      Math.pow(1 + assumptions.opOverheadInc / 100, i - 1);

    let monthly = {
      revenue: [],
      maintOpex: [],
      taxOpex: [],
      overheadOpex: [],
      ffeReserve: [],
      medEqLeaseOpex: [],
      gop: [],
      ebitda: [],
      ebit: [],
      interest: [],
      principal: [],
      interestExLand: [],
      principalExLand: [],
      dep: [],
      ebt: [],
      corpTax: [],
      netIncome: [],
      deferredCapex: [],
      fcfe: [],
      cumFcfe: [],
      fcfeExLand: [],
      cumFcfeExLand: [],
      unleveredCf: [],
      shortfallEquity: [],
      opFcfe: [],
      exit: [],
      exitExLand: [],
      debtBalance: [],
      debtBalanceExLand: [],
      avgDscr: [],
      avgYield: [],
      yocExLand: [],
      landSpend: [],
      buildSpend: [],
      eqSpend: [],
      infraSpend: [],
      ffeSpend: [],
      sharingSpend: [],
      consultantSpend: [],
      licenseSpend: [],
      vatSpend: [],
      contingencySpend: [],
      hardSpend: [],
      softSpend: [],
      totalSpend: [],
      debtDraw: [],
    };

    let year_revenue = 0,
      year_maint = 0,
      year_taxOp = 0,
      year_overhead = 0,
      year_reserve = 0,
      year_medEqLease = 0,
      year_gop = 0,
      year_ebitda = 0,
      year_ebit = 0,
      year_interest = 0,
      year_principal = 0,
      year_interestExLand = 0,
      year_principalExLand = 0,
      year_dep = 0,
      year_depBuild = 0,
      year_depMedEq = 0,
      year_depInfra = 0,
      year_depFfe = 0,
      year_depSharing = 0,
      year_depConsultant = 0,
      year_depLicense = 0,
      year_depVat = 0,
      year_depContingency = 0,
      year_depSoft = 0,
      year_ebt = 0,
      year_tax = 0,
      year_netIncome = 0,
      year_deferredCapex = 0,
      year_fcfe = 0,
      year_fcfeExLand = 0,
      year_unleveredCf = 0,
      year_opFcfe = 0,
      year_opFcfeExLand = 0,
      year_shortfallEquity = 0,
      year_exit = 0,
      year_exitExLand = 0,
      year_loanSettledAtExit = 0,
      year_grossExitValue = 0;

    let ytdEbt = 0;
    for (let m = 1; m <= 12; m++) {
      // Distributed monthly:
      let m_revenue = annualRevenue / 12;
      const m_maint = maint_year / 12,
        m_taxOp = taxOp_year / 12;
      const m_overhead =
        assumptions.opOverheadMonthly *
        Math.pow(1 + assumptions.opOverheadInc / 100, i - 1);
      const m_reserve = m_revenue * (assumptions.ffeReservePct / 100);

      let m_medEqLeaseOpex = 0;
      let m_deferredCapex = 0;

      // Leased equipment monthly calculations
      if (assumptions.includeMedEq) {
        if (assumptions.medEqProcurement === "lease") {
          const purchaseYear = assumptions.medEqPurchaseOpYear || 4;
          if (i < purchaseYear) {
            m_medEqLeaseOpex = assumptions.medEqLeaseMonthly ?? 0.875;
          } else if (i === purchaseYear) {
            if (m <= 3) {
              const m_deferredHard = leasedMedEq / 3;
              const m_defConsultant = deferredConsultantCost / 3;
              const m_defLicense = deferredLicenseCost / 3;

              const m_defMedEqVat =
                (leasedMedEq * (assumptions.capexVat || 0)) / 100 / 3;
              const m_defConsultantVat =
                (deferredConsultantCost * (assumptions.capexVat || 0)) /
                100 /
                3;

              const m_defMedEqContingency =
                ((leasedMedEq +
                  (leasedMedEq * (assumptions.capexVat || 0)) / 100) *
                  (assumptions.capexContingencyPct || 0)) /
                100 /
                3;
              const m_defConsultantContingency =
                ((deferredConsultantCost +
                  (deferredConsultantCost * (assumptions.capexVat || 0)) /
                    100) *
                  (assumptions.capexContingencyPct || 0)) /
                100 /
                3;
              const m_defLicenseContingency =
                (deferredLicenseCost * (assumptions.capexContingencyPct || 0)) /
                100 /
                3;

              m_deferredCapex =
                m_deferredHard +
                m_defConsultant +
                m_defLicense +
                m_defMedEqVat +
                m_defConsultantVat +
                m_defMedEqContingency +
                m_defConsultantContingency +
                m_defLicenseContingency;

              bvM_base += m_deferredHard;
              medEqBasis_base += m_deferredHard;
              bvM_vat += m_defMedEqVat;
              medEqBasis_vat += m_defMedEqVat;
              bvM_contingency += m_defMedEqContingency;
              medEqBasis_contingency += m_defMedEqContingency;

              bvConsultant_base += m_defConsultant;
              consultantBasis_base += m_defConsultant;
              bvConsultant_vat += m_defConsultantVat;
              consultantBasis_vat += m_defConsultantVat;
              bvConsultant_contingency += m_defConsultantContingency;
              consultantBasis_contingency += m_defConsultantContingency;

              bvLicense_base += m_defLicense;
              licenseBasis_base += m_defLicense;
              bvLicense_contingency += m_defLicenseContingency;
              licenseBasis_contingency += m_defLicenseContingency;
            }
          }
        } else if (assumptions.medEqProcurement === "lease_operating") {
          const baseRate = assumptions.medEqLeaseMonthly ?? 0.875;
          const incYears = assumptions.medEqLeaseEscalationYears || 3;
          const incPct = assumptions.medEqLeaseEscalationPct !== undefined ? assumptions.medEqLeaseEscalationPct : 5;
          const incrementsCount = Math.floor((i - 1) / incYears);
          m_medEqLeaseOpex = baseRate * Math.pow(1 + incPct / 100, incrementsCount);
        }
      }

      let m_landLeaseOpex = 0;
      if (
        assumptions.isLandLeased &&
        i <= (assumptions.landLeaseTermYears || 15)
      ) {
        // Convert from IDR/sqm/month to Billions/month
        // Starting base rate (e.g., 45000) and increment by custom % every custom years
        const baseRate = assumptions.monthlyLandLeaseRateSqm || 45000;
        const incYears = assumptions.landLeaseIncrementYears || 5;
        const incPct = assumptions.landLeaseIncrementPct !== undefined ? assumptions.landLeaseIncrementPct : 5;
        const incrementsCount = Math.floor((i - 1) / incYears);
        const rateRp = baseRate * Math.pow(1 + incPct / 100, incrementsCount);
        m_landLeaseOpex = (rateRp * assumptions.landArea) / 1_000_000_000;
      }

      const m_gop =
        m_revenue -
        m_maint -
        m_taxOp -
        m_overhead -
        m_medEqLeaseOpex -
        m_landLeaseOpex;
      const m_ebitda = m_gop - m_reserve;

      const m_op = (i - 1) * 12 + m;
      const elapsedProjectMonth = totalDevMonths + m_op;
      let m_interest = 0,
        m_principal = 0,
        m_interestExLand = 0,
        m_principalExLand = 0;

      if (outstandingDebt > 0.01) {
        m_interest = outstandingDebt * rateMonthly;
        if (elapsedProjectMonth <= ioGraceMonths) {
          m_principal = 0;
        } else if (repaymentType === "step_up") {
          const amortYearIdx = Math.floor((elapsedProjectMonth - 1 - ioGraceMonths) / 12);
          if (elapsedProjectMonth >= loanTenorMonths) {
            m_principal = outstandingDebt;
          } else {
            const yearPct = stepUpPercentages[amortYearIdx] || 0;
            const annualPrincipal =
              initialDebtAtStartOfOperations * (yearPct / 100);
            m_principal = Math.min(outstandingDebt, annualPrincipal / 12);
          }
        } else {
          m_principal = Math.min(
            outstandingDebt,
            postIoPmtMonthly - m_interest,
          );
        }
        outstandingDebt -= m_principal;
      }
      if (outstandingDebtExLand > 0.01) {
        m_interestExLand = outstandingDebtExLand * rateMonthly;
        if (elapsedProjectMonth <= ioGraceMonths) {
          m_principalExLand = 0;
        } else if (repaymentType === "step_up") {
          const amortYearIdx = Math.floor((elapsedProjectMonth - 1 - ioGraceMonths) / 12);
          if (elapsedProjectMonth >= loanTenorMonths) {
            m_principalExLand = outstandingDebtExLand;
          } else {
            const yearPct = stepUpPercentages[amortYearIdx] || 0;
            const annualPrincipalExLand =
              initialDebtAtStartOfOperationsExLand * (yearPct / 100);
            m_principalExLand = Math.min(
              outstandingDebtExLand,
              annualPrincipalExLand / 12,
            );
          }
        } else {
          m_principalExLand = Math.min(
            outstandingDebtExLand,
            postIoPmtExLandMonthly - m_interestExLand,
          );
        }
        outstandingDebtExLand -= m_principalExLand;
      }

      const calcDep = (bv, basis, life, method) => {
        if (method === "DDB") return Math.min(bv * (2 / life), bv);
        return Math.min(basis / life, bv);
      };

      // 1. Construction (Building)
      const m_dB_base =
        calcDep(
          bvB_base,
          buildBasis_base,
          assumptions.depLifeBuilding || 20,
          assumptions.depMethodBuilding,
        ) / 12;
      bvB_base -= m_dB_base;
      const m_dB_vat =
        calcDep(
          bvB_vat,
          buildBasis_vat,
          assumptions.depLifeBuilding || 20,
          assumptions.depMethodBuilding,
        ) / 12;
      bvB_vat -= m_dB_vat;
      const m_dB_contingency =
        calcDep(
          bvB_contingency,
          buildBasis_contingency,
          assumptions.depLifeBuilding || 20,
          assumptions.depMethodBuilding,
        ) / 12;
      bvB_contingency -= m_dB_contingency;
      const m_d1 = m_dB_base;

      // 2. Medical Equipment
      let m_dM_base = 0;
      let m_dM_vat = 0;
      let m_dM_contingency = 0;
      if (
        !(
          assumptions.includeMedEq &&
          assumptions.medEqProcurement === "lease" &&
          i < (assumptions.medEqPurchaseOpYear || 4)
        )
      ) {
        m_dM_base =
          calcDep(
            bvM_base,
            medEqBasis_base,
            assumptions.depLifeMedEq || 10,
            assumptions.depMethodMedEq,
          ) / 12;
        bvM_base -= m_dM_base;
        m_dM_vat =
          calcDep(
            bvM_vat,
            medEqBasis_vat,
            assumptions.depLifeMedEq || 10,
            assumptions.depMethodMedEq,
          ) / 12;
        bvM_vat -= m_dM_vat;
        m_dM_contingency =
          calcDep(
            bvM_contingency,
            medEqBasis_contingency,
            assumptions.depLifeMedEq || 10,
            assumptions.depMethodMedEq,
          ) / 12;
        bvM_contingency -= m_dM_contingency;
      }
      const m_d2 = m_dM_base;

      // 3. Infrastructure
      const m_dI_base =
        calcDep(
          bvI_base,
          infraBasis_base,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvI_base -= m_dI_base;
      const m_dI_vat =
        calcDep(
          bvI_vat,
          infraBasis_vat,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvI_vat -= m_dI_vat;
      const m_dI_contingency =
        calcDep(
          bvI_contingency,
          infraBasis_contingency,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvI_contingency -= m_dI_contingency;
      const m_d3 = m_dI_base;

      // 4. FF&E
      const m_dF_base =
        calcDep(
          bvF_base,
          ffeBasis_base,
          assumptions.depLifeFFE || 20,
          assumptions.depMethodFFE,
        ) / 12;
      bvF_base -= m_dF_base;
      const m_dF_vat =
        calcDep(
          bvF_vat,
          ffeBasis_vat,
          assumptions.depLifeFFE || 20,
          assumptions.depMethodFFE,
        ) / 12;
      bvF_vat -= m_dF_vat;
      const m_dF_contingency =
        calcDep(
          bvF_contingency,
          ffeBasis_contingency,
          assumptions.depLifeFFE || 20,
          assumptions.depMethodFFE,
        ) / 12;
      bvF_contingency -= m_dF_contingency;
      const m_d4 = m_dF_base;

      // 5. Sharing Development
      const m_dSharing_base =
        calcDep(
          bvSharing_base,
          sharingBasis_base,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvSharing_base -= m_dSharing_base;
      const m_dSharing_vat =
        calcDep(
          bvSharing_vat,
          sharingBasis_vat,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvSharing_vat -= m_dSharing_vat;
      const m_dSharing_contingency =
        calcDep(
          bvSharing_contingency,
          sharingBasis_contingency,
          assumptions.depLifeInfra || 20,
          assumptions.depMethodInfra,
        ) / 12;
      bvSharing_contingency -= m_dSharing_contingency;
      const m_dSharing = m_dSharing_base;

      // 6. Consultant & Design (Soft Cost)
      const m_dConsultant_base =
        calcDep(
          bvConsultant_base,
          consultantBasis_base,
          assumptions.depLifeSoftCost || 20,
          assumptions.depMethodSoftCost || "SL",
        ) / 12;
      bvConsultant_base -= m_dConsultant_base;
      const m_dConsultant_vat =
        calcDep(
          bvConsultant_vat,
          consultantBasis_vat,
          assumptions.depLifeSoftCost || 20,
          assumptions.depMethodSoftCost || "SL",
        ) / 12;
      bvConsultant_vat -= m_dConsultant_vat;
      const m_dConsultant_contingency =
        calcDep(
          bvConsultant_contingency,
          consultantBasis_contingency,
          assumptions.depLifeSoftCost || 20,
          assumptions.depMethodSoftCost || "SL",
        ) / 12;
      bvConsultant_contingency -= m_dConsultant_contingency;
      const m_dConsultant = m_dConsultant_base;

      // 7. Licenses & Permits (Soft Cost, exempt from VAT)
      const m_dLicense_base =
        calcDep(
          bvLicense_base,
          licenseBasis_base,
          assumptions.depLifeSoftCost || 20,
          assumptions.depMethodSoftCost || "SL",
        ) / 12;
      bvLicense_base -= m_dLicense_base;
      const m_dLicense_vat = 0;
      const m_dLicense_contingency =
        calcDep(
          bvLicense_contingency,
          licenseBasis_contingency,
          assumptions.depLifeSoftCost || 20,
          assumptions.depMethodSoftCost || "SL",
        ) / 12;
      bvLicense_contingency -= m_dLicense_contingency;
      const m_dLicense = m_dLicense_base;

      // Sum all components of VAT & Contingency
      const m_dVat =
        m_dB_vat +
        m_dM_vat +
        m_dI_vat +
        m_dF_vat +
        m_dSharing_vat +
        m_dConsultant_vat +
        m_dLicense_vat;
      const m_dContingency =
        m_dB_contingency +
        m_dM_contingency +
        m_dI_contingency +
        m_dF_contingency +
        m_dSharing_contingency +
        m_dConsultant_contingency +
        m_dLicense_contingency;

      const m_d5 = m_dConsultant + m_dLicense + m_dVat + m_dContingency;
      const m_dep = m_d1 + m_d2 + m_d3 + m_d4 + m_dSharing + m_d5;

      const m_ebt = m_ebitda - m_interest - m_dep;

      ytdEbt += m_ebt;
      const m_tax = assumptions.useFinalTax
        ? m_revenue * ((assumptions.finalTaxRate ?? 10) / 100)
        : (m === 12 && ytdEbt > 0 ? ytdEbt * (assumptions.corporateTax / 100) : 0);
      const m_netIncome = m_ebt - m_tax;

      let m_exit = 0,
        m_exitExLand = 0,
        m_exitUnlev = 0,
        m_loanSettledAtExit = 0,
        m_grossExitValue = 0;

      if (exitYear !== null && i === exitYear && m === 12) {
         let medEqLease_year = 0;
        if (
          assumptions.includeMedEq &&
          assumptions.medEqProcurement === "lease_operating"
        ) {
          const baseRate = assumptions.medEqLeaseMonthly ?? 0.875;
          const incYears = assumptions.medEqLeaseEscalationYears || 3;
          const incPct = assumptions.medEqLeaseEscalationPct !== undefined ? assumptions.medEqLeaseEscalationPct : 5;
          const incrementsCount = Math.floor((i - 1) / incYears);
          const escalatedRate = baseRate * Math.pow(1 + incPct / 100, incrementsCount);
          medEqLease_year = escalatedRate * 12;
        }

        let landLease_year = 0;
        if (
          assumptions.isLandLeased &&
          i <= (assumptions.landLeaseTermYears || 15)
        ) {
          // Starting base rate (e.g., 45000) and increment by custom % every custom years
          const baseRate = assumptions.monthlyLandLeaseRateSqm || 45000;
          const incYears = assumptions.landLeaseIncrementYears || 5;
          const incPct = assumptions.landLeaseIncrementPct !== undefined ? assumptions.landLeaseIncrementPct : 5;
          const incrementsCount = Math.floor((i - 1) / incYears);
          const rateRp = baseRate * Math.pow(1 + incPct / 100, incrementsCount);
          landLease_year =
            ((rateRp * assumptions.landArea) / 1_000_000_000) * 12;
        }

        let noi =
          annualRevenue -
          maint_year -
          taxOp_year -
          overhead_year -
          annualRevenue * (assumptions.ffeReservePct / 100) -
          medEqLease_year -
          landLease_year;

        let tv = 0;
        if (assumptions.exitMethod === "dcf") {
          const remainingYears =
            (assumptions.landLeaseTermYears || 15) - exitYear;
          if (remainingYears > 0) {
            const r = (assumptions.discountRate || 10) / 100;
            // Project cash flows for the remaining lease term
            for (let y = 1; y <= remainingYears; y++) {
              const projYear = exitYear + y;
              let projRev = assumptions.linkToOpCo
                ? opCoRents[projYear - 1] || opCoRents[opCoRents.length - 1]
                : assumptions.manualBaseRent *
                  Math.pow(
                    1 + assumptions.manualRentEscalation / 100,
                    projYear - 1,
                  );

              const projOverhead =
                assumptions.opOverheadMonthly *
                12 *
                Math.pow(1 + assumptions.opOverheadInc / 100, projYear - 1);

              // Calculate lease land opex with the custom incremental logic for terminal projection years
              const projBaseRate = assumptions.monthlyLandLeaseRateSqm || 45000;
              const projIncYears = assumptions.landLeaseIncrementYears || 5;
              const projIncPct = assumptions.landLeaseIncrementPct !== undefined ? assumptions.landLeaseIncrementPct : 5;
              const projIncrements = Math.floor((projYear - 1) / projIncYears);
              const projRateRp = projBaseRate * Math.pow(1 + projIncPct / 100, projIncrements);
              const projLandLease_year =
                ((projRateRp * assumptions.landArea) / 1_000_000_000) * 12;

              const projNoi =
                projRev -
                maint_year -
                taxOp_year -
                projOverhead -
                projRev * (assumptions.ffeReservePct / 100) -
                medEqLease_year -
                projLandLease_year;

              tv += projNoi / Math.pow(1 + r, y);
            }
          }
        } else if (assumptions.exitMethod === "multiple") {
          tv = noi * assumptions.exitMultiple;
        } else {
          tv = noi / (assumptions.exitCapRate / 100);
        }

        if (tv > 0) {
          const cost = tv * (assumptions.sellingCosts / 100);
          m_grossExitValue = tv - cost;
          m_loanSettledAtExit = outstandingDebt;

          m_exit = tv - cost - outstandingDebt;
          m_exitUnlev = tv - cost;
          m_exitExLand = tv - cost - outstandingDebtExLand - landCost;
          outstandingDebt = 0;
          outstandingDebtExLand = 0;
        }
      }

      const m_unleveredCf =
        m_ebitda -
        m_dep -
        (assumptions.useFinalTax
          ? m_revenue * ((assumptions.finalTaxRate ?? 10) / 100)
          : (m_ebitda - m_dep > 0
            ? (m_ebitda - m_dep) * (assumptions.corporateTax / 100)
            : 0)) +
        m_dep +
        m_exitUnlev -
        m_deferredCapex;

      const m_opFcfe = m_netIncome + m_dep - m_principal - m_deferredCapex;
      const m_shortfallEquity = m_opFcfe < 0 ? Math.abs(m_opFcfe) : 0;
      const m_fcfe = m_opFcfe + m_exit;

      const m_fcfeExLand =
        m_ebitda -
        m_interestExLand -
        m_dep -
        (assumptions.useFinalTax
          ? m_revenue * ((assumptions.finalTaxRate ?? 10) / 100)
          : (m_ebitda - m_interestExLand - m_dep > 0
            ? (m_ebitda - m_interestExLand - m_dep) *
              (assumptions.corporateTax / 100)
            : 0)) +
        m_dep -
        m_principalExLand +
        m_exitExLand -
        m_deferredCapex;

      equityCum += m_fcfe;
      equityCumExLand += m_fcfeExLand;

      equityCfsMonthly.push(m_fcfe);
      equityCfsExLandMonthly.push(m_fcfeExLand);
      unleveredCfsMonthly.push(m_unleveredCf);
      operatingCfsMonthly.push(m_opFcfe);

      // Store monthly snapshots
      monthly.revenue.push(m_revenue);
      monthly.maintOpex.push(m_maint);
      monthly.taxOpex.push(m_taxOp);
      monthly.overheadOpex.push(m_overhead);
      monthly.ffeReserve.push(m_reserve);
      monthly.medEqLeaseOpex.push(m_medEqLeaseOpex);
      monthly.gop.push(m_gop);
      monthly.ebitda.push(m_ebitda);
      const m_ebit = m_ebitda - m_dep;
      monthly.ebit.push(m_ebit);
      monthly.interest.push(m_interest);
      monthly.principal.push(m_principal);
      monthly.interestExLand.push(m_interestExLand);
      monthly.principalExLand.push(m_principalExLand);
      monthly.hardSpend.push(0);
      monthly.softSpend.push(0);
      monthly.totalSpend.push(0);
      monthly.dep.push(m_dep);
      monthly.ebt.push(m_ebt);
      monthly.corpTax.push(m_tax);
      monthly.netIncome.push(m_netIncome);
      monthly.deferredCapex.push(m_deferredCapex);
      monthly.fcfe.push(m_fcfe);
      monthly.cumFcfe.push(equityCum);
      monthly.fcfeExLand.push(m_fcfeExLand);
      monthly.cumFcfeExLand.push(equityCumExLand);
      monthly.unleveredCf.push(m_unleveredCf);
      monthly.shortfallEquity.push(m_shortfallEquity);
      monthly.opFcfe.push(m_opFcfe);
      monthly.exit.push(m_exit);
      monthly.exitExLand.push(m_exitExLand);
      monthly.debtBalance.push(outstandingDebt);
      monthly.debtBalanceExLand.push(outstandingDebtExLand);
      monthly.avgDscr.push(
        m_interest + m_principal > 0
          ? m_ebitda / (m_interest + m_principal)
          : 5,
      );
      monthly.avgYield.push(
        totalCapex > 0 ? ((m_revenue * 12) / totalCapex) * 100 : 0,
      );
      monthly.yocExLand.push(
        totalCapexExLand > 0 ? ((m_ebitda * 12) / totalCapexExLand) * 100 : 0,
      );

      monthly.landSpend.push(0);
      monthly.buildSpend.push(0);
      monthly.eqSpend.push(0);
      monthly.infraSpend.push(0);
      monthly.ffeSpend.push(0);
      monthly.sharingSpend.push(0);
      monthly.consultantSpend.push(0);
      monthly.licenseSpend.push(0);
      monthly.vatSpend.push(0);
      monthly.contingencySpend.push(0);
      monthly.hardSpend.push(0);
      monthly.softSpend.push(0);
      monthly.totalSpend.push(0);
      monthly.debtDraw.push(0);

      year_revenue += m_revenue;
      year_maint += m_maint;
      year_taxOp += m_taxOp;
      year_overhead += m_overhead;
      year_reserve += m_reserve;
      year_medEqLease += m_medEqLeaseOpex;
      year_gop += m_gop;
      year_ebitda += m_ebitda;
      year_ebit += m_ebit;
      year_interest += m_interest;
      year_principal += m_principal;
      year_interestExLand += m_interestExLand;
      year_principalExLand += m_principalExLand;
      year_dep += m_dep;
      year_depBuild += m_d1;
      year_depMedEq += m_d2;
      year_depInfra += m_d3;
      year_depFfe += m_d4;
      year_depSharing += m_dSharing;
      year_depConsultant += m_dConsultant;
      year_depLicense += m_dLicense;
      year_depVat += m_dVat;
      year_depContingency += m_dContingency;
      year_depSoft += m_d5;
      year_ebt += m_ebt;
      year_tax += m_tax;
      year_netIncome += m_netIncome;
      year_deferredCapex += m_deferredCapex;
      year_fcfe += m_fcfe;
      year_fcfeExLand += m_fcfeExLand;
      year_unleveredCf += m_unleveredCf;
      year_opFcfe += m_opFcfe;
      year_shortfallEquity += m_shortfallEquity;
      year_opFcfeExLand += m_fcfeExLand - m_exitExLand;
      year_exit += m_exit;
      year_exitExLand += m_exitExLand;
      year_loanSettledAtExit += m_loanSettledAtExit;
      year_grossExitValue += m_grossExitValue;
    }

    const dscr =
      year_principal + year_interest > 0
        ? year_ebitda / (year_principal + year_interest)
        : 0;
    avgDscr += dscr;
    avgYield += totalEquity > 0 ? (year_opFcfe / totalEquity) * 100 : 0;

    annualData.push({
      year: `Year ${i + devYears}`,
      isOperating: true,
      revenue: year_revenue,
      preOpeningDev: 0,
      maintOpex: year_maint,
      taxOpex: year_taxOp,
      overheadOpex: year_overhead,
      ffeReserve: year_reserve,
      medEqLeaseOpex: year_medEqLease,
      gop: year_gop,
      ebitda: year_ebitda,
      ebit: year_ebit,
      interest: year_interest,
      principal: year_principal,
      debtBalance: outstandingDebt,
      dep: year_dep,
      depBuild: year_depBuild,
      depMedEq: year_depMedEq,
      depInfra: year_depInfra,
      depFfe: year_depFfe,
      depSharing: year_depSharing,
      depConsultant: year_depConsultant,
      depLicense: year_depLicense,
      depVat: year_depVat,
      depContingency: year_depContingency,
      depSoft: year_depSoft,
      corpTax: year_tax,
      netIncome: year_netIncome,
      deferredCapex: year_deferredCapex,
      opFcfe: year_opFcfe,
      shortfallEquity: year_shortfallEquity,
      fcfe: year_fcfe,
      cumFcfe: equityCum,
      dscr,
      dscrBuffer: year_ebitda - (year_principal + year_interest),
      yield: totalEquity > 0 ? (year_opFcfe / totalEquity) * 100 : 0,
      opFcfeExLand: year_opFcfeExLand,
      fcfeExLand: year_fcfeExLand,
      cumFcfeExLand: equityCumExLand,
      interestExLand: year_interestExLand,
      principalExLand: year_principalExLand,
      debtBalanceExLand: outstandingDebtExLand,
      landSpend: 0,
      buildSpend: 0,
      eqSpend: 0,
      infraSpend: 0,
      ffeSpend: 0,
      sharingSpend: 0,
      consultantSpend: 0,
      licenseSpend: 0,
      vatSpend: 0,
      contingencySpend: 0,
      hardSpend: 0,
      softSpend: 0,
      totalSpend: 0,
      debtDraw: 0,
      exit: year_exit,
      loanSettledAtExit: year_loanSettledAtExit,
      grossExitValue: year_grossExitValue,
      netExitProceeds: year_exit,
      ebt: year_ebt,
      netExitProceedsExLand: year_exitExLand,
      ebtExLand: year_ebitda - year_interestExLand - year_dep,
      corpTaxExLand: assumptions.useFinalTax
        ? year_revenue * ((assumptions.finalTaxRate ?? 10) / 100)
        : (year_ebitda - year_interestExLand - year_dep > 0
          ? (year_ebitda - year_interestExLand - year_dep) *
            (assumptions.corporateTax / 100)
          : 0),
      monthly,
    });
  }

  // Add CF Statement Standard Items for PropCo
  annualData = annualData.map((d) => {
    const cfo = (d.netIncome || 0) + (d.dep || 0);
    const cfo_in = d.revenue || 0;
    const cfo_out = cfo - cfo_in;

    const cfi =
      -((d.hardSpend || 0) + (d.softSpend || 0) + (d.landSpend || 0) + (d.deferredCapex || 0)) +
      (d.exit || 0);
    const cfi_in = d.exit || 0;
    const cfi_out = -(
      (d.hardSpend || 0) +
      (d.softSpend || 0) +
      (d.landSpend || 0) +
      (d.deferredCapex || 0)
    );

    const cff =
      (d.debtDraw || 0) -
      (d.principal || 0) -
      (d.fcfe || 0);
    const cff_in = (d.debtDraw || 0) + ((d.fcfe || 0) < 0 ? -(d.fcfe || 0) : 0);
    const cff_out = -(d.principal || 0) - ((d.fcfe || 0) > 0 ? (d.fcfe || 0) : 0);

    const netFlow = cfo + cfi + cff;

    if (d.monthly) {
      d.monthly.cfo = Array.from(
        { length: 12 },
        (_, i) => (d.monthly?.netIncome?.[i] || 0) + (d.monthly?.dep?.[i] || 0),
      );
      d.monthly.cfo_in = Array.from(
        { length: 12 },
        (_, i) => d.monthly?.revenue?.[i] || 0,
      );
      d.monthly.cfo_out = d.monthly.cfo.map(
        (x, i) => x - (d.monthly.cfo_in[i] || 0),
      );

      d.monthly.cfi = Array.from(
        { length: 12 },
        (_, i) =>
          -(
            (d.monthly?.hardSpend?.[i] || 0) +
            (d.monthly?.softSpend?.[i] || 0) +
            (d.monthly?.landSpend?.[i] || 0) +
            (d.monthly?.deferredCapex?.[i] || 0)
          ) + (d.monthly?.exit?.[i] || 0),
      );
      d.monthly.cfi_in = Array.from(
        { length: 12 },
        (_, i) => d.monthly?.exit?.[i] || 0,
      );
      d.monthly.cfi_out = Array.from(
        { length: 12 },
        (_, i) =>
          -(
            (d.monthly?.hardSpend?.[i] || 0) +
            (d.monthly?.softSpend?.[i] || 0) +
            (d.monthly?.landSpend?.[i] || 0) +
            (d.monthly?.deferredCapex?.[i] || 0)
          ),
      );

      d.monthly.cff = Array.from(
        { length: 12 },
        (_, i) =>
          (d.monthly?.debtDraw?.[i] || 0) -
          (d.monthly?.principal?.[i] || 0) -
          (d.monthly?.fcfe?.[i] || 0),
      );
      d.monthly.cff_in = Array.from(
        { length: 12 },
        (_, i) =>
          (d.monthly?.debtDraw?.[i] || 0) +
          ((d.monthly?.fcfe?.[i] || 0) < 0 ? -(d.monthly?.fcfe?.[i] || 0) : 0),
      );
      d.monthly.cff_out = Array.from(
        { length: 12 },
        (_, i) =>
          -(d.monthly?.principal?.[i] || 0) -
          ((d.monthly?.fcfe?.[i] || 0) > 0 ? (d.monthly?.fcfe?.[i] || 0) : 0),
      );

      d.monthly.netFlow = d.monthly.cfo.map(
        (x, i) => x + d.monthly.cfi[i] + d.monthly.cff[i],
      );
    }

    return {
      ...d,
      cfo,
      cfo_in,
      cfo_out,
      cfi,
      cfi_in,
      cfi_out,
      cff,
      cff_in,
      cff_out,
      netFlow,
    };
  });

  let currentCash = 0;
  annualData = annualData.map((d) => {
    currentCash += d.netFlow;
    return { ...d, endCash: currentCash };
  });

  const operatingData = annualData.filter((d) => d.isOperating);

  return applySafeMathPrecision({
    assumptions,
    annualData,
    operatingData,
    metrics: {
      totalCapex,
      upfrontTotalCapex,
      totalCapexExLand,
      debtSizingBase,
      totalDebt,
      totalEquity: peakEquityRequired,
      totalInvestment: peakTotalInvestment,
      irr: calculateIRR(equityCfsMonthly, "monthly"),
      npv: calculateNPV(equityCfsMonthly, assumptions.discountRate, "monthly"),
      unleveredIrr: calculateIRR(unleveredCfsMonthly, "monthly"),
      unleveredNpv: calculateNPV(
        unleveredCfsMonthly,
        assumptions.discountRate,
        "monthly",
      ),
      irrExLand: calculateIRR(equityCfsExLandMonthly, "monthly"),
      npvExLand: calculateNPV(
        equityCfsExLandMonthly,
        assumptions.discountRate,
        "monthly",
      ),
      payback: calculatePayback(equityCfsMonthly, "monthly"),
      operatingPayback: calculatePayback(operatingCfsMonthly, "monthly"),
      avgDscr: projYears > 0 ? avgDscr / projYears : 0,
      minDscr:
        operatingData.filter((d) => d.principal + d.interest > 0).length > 0
          ? Math.min(
              ...operatingData
                .filter((d) => d.principal + d.interest > 0)
                .map((d) => d.dscr),
            )
          : 0,
      avgYield: projYears > 0 ? avgYield / projYears : 0,
      moic:
        equityCfsMonthly.reduce((acc, val) => (val > 0 ? acc + val : acc), 0) /
        totalEquity,
      costPerBed:
        opCoModelData?.opsMetrics?.beds > 0
          ? totalCapex / opCoModelData.opsMetrics.beds
          : 0,
      costPerSqm:
        assumptions.buildArea > 0
          ? (totalCapex * 1000) / assumptions.buildArea
          : 0,
      yocExLand:
        projYears > 0
          ? operatingData.reduce((acc, d) => acc + d.ebitda, 0) /
            projYears /
            totalCapexExLand
          : 0,
    },
    totals: {
      revenue: annualData.reduce((acc, d) => acc + (d.revenue || 0), 0),
      devGa: annualData.reduce((acc, d) => acc + (d.devGa || 0), 0),
      devCar: annualData.reduce((acc, d) => acc + (d.devCar || 0), 0),
      preOpeningDev: annualData.reduce(
        (acc, d) => acc + (d.devGa || 0) + (d.devCar || 0),
        0,
      ),
      maintOpex: annualData.reduce((acc, d) => acc + (d.maintOpex || 0), 0),
      taxOpex: annualData.reduce((acc, d) => acc + (d.taxOpex || 0), 0),
      overheadOpex: annualData.reduce(
        (acc, d) => acc + (d.overheadOpex || 0),
        0,
      ),
      ffeReserve: annualData.reduce((acc, d) => acc + (d.ffeReserve || 0), 0),
      medEqLeaseOpex: annualData.reduce(
        (acc, d) => acc + (d.medEqLeaseOpex || 0),
        0,
      ),
      gop: annualData.reduce((acc, d) => acc + (d.gop || 0), 0),
      ebitda: annualData.reduce((acc, d) => acc + (d.ebitda || 0), 0),
      ebit: annualData.reduce((acc, d) => acc + (d.ebit || 0), 0),
      interest: annualData.reduce((acc, d) => acc + (d.interest || 0), 0),
      principal: annualData.reduce((acc, d) => acc + (d.principal || 0), 0),
      ds: annualData.reduce(
        (acc, d) => acc + (d.interest || 0) + (d.principal || 0),
        0,
      ),
      dep: annualData.reduce((acc, d) => acc + (d.dep || 0), 0),
      depBuild: annualData.reduce((acc, d) => acc + (d.depBuild || 0), 0),
      depMedEq: annualData.reduce((acc, d) => acc + (d.depMedEq || 0), 0),
      depInfra: annualData.reduce((acc, d) => acc + (d.depInfra || 0), 0),
      depFfe: annualData.reduce((acc, d) => acc + (d.depFfe || 0), 0),
      depSharing: annualData.reduce((acc, d) => acc + (d.depSharing || 0), 0),
      depConsultant: annualData.reduce(
        (acc, d) => acc + (d.depConsultant || 0),
        0,
      ),
      depLicense: annualData.reduce((acc, d) => acc + (d.depLicense || 0), 0),
      depVat: annualData.reduce((acc, d) => acc + (d.depVat || 0), 0),
      depContingency: annualData.reduce(
        (acc, d) => acc + (d.depContingency || 0),
        0,
      ),
      depSoft: annualData.reduce((acc, d) => acc + (d.depSoft || 0), 0),
      ebt: annualData.reduce((acc, d) => acc + (d.ebt || 0), 0),
      corpTax: annualData.reduce((acc, d) => acc + (d.corpTax || 0), 0),
      netIncome: annualData.reduce((acc, d) => acc + (d.netIncome || 0), 0),
      cfo: annualData.reduce((acc, d) => acc + (d.cfo || 0), 0),
      cfo_in: annualData.reduce((acc, d) => acc + (d.cfo_in || 0), 0),
      cfo_out: annualData.reduce((acc, d) => acc + (d.cfo_out || 0), 0),
      cfi: annualData.reduce((acc, d) => acc + (d.cfi || 0), 0),
      cfi_in: annualData.reduce((acc, d) => acc + (d.cfi_in || 0), 0),
      cfi_out: annualData.reduce((acc, d) => acc + (d.cfi_out || 0), 0),
      cff: annualData.reduce((acc, d) => acc + (d.cff || 0), 0),
      cff_in: annualData.reduce((acc, d) => acc + (d.cff_in || 0), 0),
      cff_out: annualData.reduce((acc, d) => acc + (d.cff_out || 0), 0),
      netFlow: annualData.reduce((acc, d) => acc + (d.netFlow || 0), 0),
      dscrBuffer: annualData.reduce((acc, d) => acc + (d.dscrBuffer || 0), 0),
      deferredCapex: annualData.reduce(
        (acc, d) => acc + (d.deferredCapex || 0),
        0,
      ),
      landSpend: annualData.reduce((acc, d) => acc + (d.landSpend || 0), 0),
      buildSpend: annualData.reduce((acc, d) => acc + (d.buildSpend || 0), 0),
      eqSpend: annualData.reduce((acc, d) => acc + (d.eqSpend || 0), 0),
      infraSpend: annualData.reduce((acc, d) => acc + (d.infraSpend || 0), 0),
      ffeSpend: annualData.reduce((acc, d) => acc + (d.ffeSpend || 0), 0),
      sharingSpend: annualData.reduce(
        (acc, d) => acc + (d.sharingSpend || 0),
        0,
      ),
      consultantSpend: annualData.reduce(
        (acc, d) => acc + (d.consultantSpend || 0),
        0,
      ),
      licenseSpend: annualData.reduce(
        (acc, d) => acc + (d.licenseSpend || 0),
        0,
      ),
      vatSpend: annualData.reduce((acc, d) => acc + (d.vatSpend || 0), 0),
      contingencySpend: annualData.reduce(
        (acc, d) => acc + (d.contingencySpend || 0),
        0,
      ),
      hardSpend: annualData.reduce((acc, d) => acc + (d.hardSpend || 0), 0),
      softSpend: annualData.reduce((acc, d) => acc + (d.softSpend || 0), 0),
      totalSpend: annualData.reduce((acc, d) => acc + (d.totalSpend || 0), 0),
      debtDraw: annualData.reduce((acc, d) => acc + (d.debtDraw || 0), 0),
      fcfe: annualData.reduce((acc, d) => acc + (d.fcfe || 0), 0),
      opFcfe: annualData.reduce((acc, d) => acc + (d.opFcfe || 0), 0),
      shortfallEquity: annualData.reduce(
        (acc, d) => acc + (d.shortfallEquity || 0),
        0,
      ),
      netExitProceeds: annualData.reduce(
        (acc, d) => acc + (d.netExitProceeds || 0),
        0,
      ),
      loanSettledAtExit: annualData.reduce(
        (acc, d) => acc + (d.loanSettledAtExit || 0),
        0,
      ),
      grossExitValue: annualData.reduce(
        (acc, d) => acc + (d.grossExitValue || 0),
        0,
      ),
      interestExLand: annualData.reduce(
        (acc, d) => acc + (d.interestExLand || 0),
        0,
      ),
      principalExLand: annualData.reduce(
        (acc, d) => acc + (d.principalExLand || 0),
        0,
      ),
      ebtExLand: annualData.reduce((acc, d) => acc + (d.ebtExLand || 0), 0),
      corpTaxExLand: annualData.reduce(
        (acc, d) => acc + (d.corpTaxExLand || 0),
        0,
      ),
      netExitProceedsExLand: annualData.reduce(
        (acc, d) => acc + (d.netExitProceedsExLand || 0),
        0,
      ),
      opFcfeExLand: annualData.reduce(
        (acc, d) => acc + (d.opFcfeExLand || 0),
        0,
      ),
      fcfeExLand: annualData.reduce((acc, d) => acc + (d.fcfeExLand || 0), 0),
    },
    capexDetails: {
      landCost,
      buildCost,
      totalHardCosts,
      totalSoftCosts,
      totalCapex,
      medEqCost,
      infraCost,
      ffeCost,
      consultantCost,
      licenseCost,
      vatCost,
      contingencyCost,
      sharingDevCost,
      devGaCost: annualData
        .filter((d) => !d.isOperating)
        .reduce((acc, d) => acc + (d.devGa || 0), 0),
      devCarCost: annualData
        .filter((d) => !d.isOperating)
        .reduce((acc, d) => acc + (d.devCar || 0), 0),
    },
    equityCfsMonthly,
    equityCfsExLandMonthly,
    unleveredCfsMonthly,
    operatingCfsMonthly,
  });
};

export const runNodeAggregationEngine = (
  entities: EntityModelData[],
  config: ProjConfig,
): ConsolidatedModelData => {
  // Option A (Dynamic Entities) placeholder logic for abstract consolidation.
  // Instead of static opCoData + propCoData, this engine iterates array of EntityModelData.

  let annualData: any[] = [];
  // For now, return empty placeholder aligning to ConsolidatedModelData shape
  return applySafeMathPrecision({
    annualData,
    totals: {},
    irrConsolidated: 0,
    npvConsolidated: 0,
  });
};

export const runConsolidatedEngine = (
  opCoData: OpCoModelData | null,
  propCoData: PropCoModelData | null,
  opCoAssumptions: OpCoAssumptions,
  holdCoAssumptions: HoldCoAssumptions = DEFAULT_HOLDCO_ASSUMPTIONS,
): ConsolidatedModelData => {
  let annualData = [],
    consolidatedCfs = [];
  let cumCf = 0;
  let avgConsolidatedDscr = 0;
  let operatingYearsWithDebt = 0;

  const totalPropCoEq = propCoData.metrics.totalEquity;
  const totalOpCoEq = opCoAssumptions.partnerBEquity; // 49% HoldCo Share

  let holdCoOutstandingDebt = 0;
  let holdCoPmt = 0;
  let hasStartedHoldCoAmortization = false;
  let operatingMonthCounter = 0;

  let cumNetFlowOp = 0;
  let minCumNetFlowOp = 0;
  let cumHoldCoCashFlowAfterDebtOp = 0;
  let minCumHoldCoCashFlowAfterDebtOp = 0;

  propCoData.annualData.forEach((pData, i) => {
    const oData = opCoData.annualData[i] || {
      shareB: 0,
      pB_Outlay: 0,
      pB_Exit: 0,
      isOperating: pData.isOperating,
      year: pData.year,
    };

    // FCFE & pB_Outlay are negative during investment, positive during returns
    const propCoInvestmentFlow = !pData.isOperating ? pData.fcfe || 0 : 0;
    const propCoExitFlow = pData.isOperating ? pData.exit || 0 : 0;
    const propCoOperatingFlow = pData.isOperating
      ? (pData.fcfe || 0) - propCoExitFlow
      : 0;
    const propCoShortfall = pData.isOperating ? (pData.shortfallEquity || 0) : 0;

    const propCoFlow =
      propCoInvestmentFlow + propCoOperatingFlow + propCoExitFlow;
    const opCoInvestmentFlow = oData.pB_Outlay || 0;
    const opCoOperatingDividendFlow = oData.shareB || 0;
    const opCoExitFlow = oData.pB_Exit || 0;
    const opCoFlow =
      opCoInvestmentFlow + opCoOperatingDividendFlow + opCoExitFlow;
    const netFlow = propCoFlow + opCoFlow;

    let monthly = {
      propCoInvestmentFlow: [],
      propCoOperatingFlow: [],
      propCoShortfall: [],
      propCoExitFlow: [],
      propCoFlow: [],
      opCoInvestmentFlow: [],
      opCoOperatingDividendFlow: [],
      opCoExitFlow: [],
      opCoFlow: [],
      netFlow: [],
      netFlowShortfall: [],
      holdCoDebtDraw: [],
      holdCoInterest: [],
      holdCoPrincipal: [],
      holdCoDebtBalance: [],
      holdCoCashFlowAfterDebt: [],
      holdCoCashFlowAfterDebtShortfall: [],
      cumCf: [],
      lookThroughRevenue: [],
      lookThroughEbitda: [],
      lookThroughNetIncome: [],
      lookThroughMargin: [],
    };

    const sharePct = (100 - opCoAssumptions.sharingPercentA) / 100;
    let yearHoldCoDebtDraw = 0;
    let yearHoldCoInterest = 0;
    let yearHoldCoPrincipal = 0;

    for (let m = 0; m < 12; m++) {
      const pSnapshot = pData.monthly || {};
      const oSnapshot = oData.monthly || {};

      const m_pFcfe = (pSnapshot.fcfe || [])[m] || 0;
      const m_pExit = (pSnapshot.exit || [])[m] || 0;

      const m_propCoInvestmentFlow = !pData.isOperating ? m_pFcfe : 0;
      const m_propCoExitFlow = pData.isOperating ? m_pExit : 0;
      const m_propCoOperatingFlow = pData.isOperating ? m_pFcfe - m_pExit : 0;
      const m_propCoShortfall = pData.isOperating ? Math.max(0, -m_propCoOperatingFlow) : 0;
      const m_propCoFlow =
        m_propCoInvestmentFlow + m_propCoOperatingFlow + m_propCoExitFlow;

      const m_opCoInvestmentFlow = (oSnapshot.pB_Outlay || [])[m] || 0;
      const m_opCoOperatingDividendFlow = (oSnapshot.shareB || [])[m] || 0;
      const m_opCoExitFlow = (oSnapshot.pB_Exit || [])[m] || 0;
      const m_opCoFlow =
        m_opCoInvestmentFlow + m_opCoOperatingDividendFlow + m_opCoExitFlow;
      const m_netFlow = m_propCoFlow + m_opCoFlow;

      // HoldCo Debt Logic
      let m_holdCoDraw = 0;
      let m_holdCoInterest = 0;
      let m_holdCoPrincipal = 0;

      if (holdCoAssumptions?.includeFinancing) {
        if (m_netFlow < 0 && !pData.isOperating) {
          m_holdCoDraw =
            Math.abs(m_netFlow) * ((holdCoAssumptions?.ltvRatio || 0) / 100);
        }

        m_holdCoInterest =
          holdCoOutstandingDebt *
          ((holdCoAssumptions?.interestRate || 0) / 100 / 12);

        if (pData.isOperating) {
          if (!hasStartedHoldCoAmortization) {
            const ioMonths = (holdCoAssumptions?.ioGracePeriodYears || 0) * 12;
            const tenorMonths = (holdCoAssumptions?.loanTenor || 15) * 12;
            const amortMonths = Math.max(1, tenorMonths - ioMonths);
            const rMonthly = (holdCoAssumptions?.interestRate || 0) / 100 / 12;

            holdCoPmt =
              holdCoOutstandingDebt > 0 && rMonthly > 0
                ? (holdCoOutstandingDebt * rMonthly) /
                  (1 - Math.pow(1 + rMonthly, -amortMonths))
                : holdCoOutstandingDebt > 0
                  ? holdCoOutstandingDebt / amortMonths
                  : 0;
            hasStartedHoldCoAmortization = true;
          }

          const ioMonths = (holdCoAssumptions?.ioGracePeriodYears || 0) * 12;
          const tenorMonths = (holdCoAssumptions?.loanTenor || 15) * 12;
          const totalDevMonths = opCoAssumptions.devDurationMonths || 24;
          const elapsedProjectMonth = totalDevMonths + operatingMonthCounter + 1;

          if (elapsedProjectMonth <= ioMonths) {
            m_holdCoPrincipal = 0;
          } else if (elapsedProjectMonth <= tenorMonths) {
            m_holdCoPrincipal = Math.min(
              holdCoOutstandingDebt,
              holdCoPmt - m_holdCoInterest,
            );
          } else {
            m_holdCoPrincipal = holdCoOutstandingDebt;
          }

          if (m_holdCoPrincipal < 0) m_holdCoPrincipal = 0;

          operatingMonthCounter++;
        }

        holdCoOutstandingDebt += m_holdCoDraw - m_holdCoPrincipal;
      }

      const m_holdCoCashFlowAfterDebt =
        m_netFlow + m_holdCoDraw - m_holdCoInterest - m_holdCoPrincipal;

      yearHoldCoDebtDraw += m_holdCoDraw;
      yearHoldCoInterest += m_holdCoInterest;
      yearHoldCoPrincipal += m_holdCoPrincipal;

      const m_ltRev =
        ((pSnapshot.revenue || [])[m] || 0) +
        ((oSnapshot.totalRev || [])[m] || 0) * sharePct;
      const m_ltEbitda =
        ((pSnapshot.ebitda || [])[m] || 0) +
        ((oSnapshot.ebitda || [])[m] || 0) * sharePct;
      const m_ltNi =
        ((pSnapshot.netIncome || [])[m] || 0) +
        ((oSnapshot.netIncome || [])[m] || 0) * sharePct;

      let m_netFlowShortfall = 0;
      let m_holdCoCashFlowAfterDebtShortfall = 0;
      if (pData.isOperating) {
        cumNetFlowOp += m_netFlow;
        if (cumNetFlowOp < minCumNetFlowOp) {
          m_netFlowShortfall = minCumNetFlowOp - cumNetFlowOp;
          minCumNetFlowOp = cumNetFlowOp;
        }

        cumHoldCoCashFlowAfterDebtOp += m_holdCoCashFlowAfterDebt;
        if (cumHoldCoCashFlowAfterDebtOp < minCumHoldCoCashFlowAfterDebtOp) {
          m_holdCoCashFlowAfterDebtShortfall = minCumHoldCoCashFlowAfterDebtOp - cumHoldCoCashFlowAfterDebtOp;
          minCumHoldCoCashFlowAfterDebtOp = cumHoldCoCashFlowAfterDebtOp;
        }
      }

      monthly.propCoInvestmentFlow.push(m_propCoInvestmentFlow);
      monthly.propCoOperatingFlow.push(m_propCoOperatingFlow);
      monthly.propCoShortfall.push(m_propCoShortfall);
      monthly.propCoExitFlow.push(m_propCoExitFlow);
      monthly.propCoFlow.push(m_propCoFlow);
      monthly.opCoInvestmentFlow.push(m_opCoInvestmentFlow);
      monthly.opCoOperatingDividendFlow.push(m_opCoOperatingDividendFlow);
      monthly.opCoExitFlow.push(m_opCoExitFlow);
      monthly.opCoFlow.push(m_opCoFlow);
      monthly.netFlow.push(m_netFlow);
      monthly.netFlowShortfall.push(m_netFlowShortfall);
      monthly.holdCoDebtDraw.push(m_holdCoDraw);
      monthly.holdCoInterest.push(m_holdCoInterest);
      monthly.holdCoPrincipal.push(m_holdCoPrincipal);
      monthly.holdCoDebtBalance.push(holdCoOutstandingDebt);
      monthly.holdCoCashFlowAfterDebt.push(m_holdCoCashFlowAfterDebt);
      monthly.holdCoCashFlowAfterDebtShortfall.push(m_holdCoCashFlowAfterDebtShortfall);

      const previousCumCf =
        monthly.cumCf.length > 0
          ? monthly.cumCf[monthly.cumCf.length - 1]
          : cumCf;
      monthly.cumCf.push(previousCumCf + m_holdCoCashFlowAfterDebt);

      m_ltRev > 0
        ? monthly.lookThroughMargin.push((m_ltNi / m_ltRev) * 100)
        : monthly.lookThroughMargin.push(0);
      monthly.lookThroughRevenue.push(m_ltRev);
      monthly.lookThroughEbitda.push(m_ltEbitda);
      monthly.lookThroughNetIncome.push(m_ltNi);
    }

    const holdCoCashFlowAfterDebt =
      netFlow + yearHoldCoDebtDraw - yearHoldCoInterest - yearHoldCoPrincipal;
    cumCf += holdCoCashFlowAfterDebt;
    consolidatedCfs.push(holdCoCashFlowAfterDebt);

    // Look-Through PnL Metrics
    const lookThroughRevenue =
      (pData.revenue || 0) + (oData.totalRev || 0) * sharePct;
    const lookThroughEbitda =
      (pData.ebitda || 0) + (oData.ebitda || 0) * sharePct;
    const lookThroughNetIncome =
      (pData.netIncome || 0) + (oData.netIncome || 0) * sharePct;
    const lookThroughMargin =
      lookThroughRevenue > 0
        ? (lookThroughNetIncome / lookThroughRevenue) * 100
        : 0;

    let dscrBuffer = 0;
    // Consolidated DSCR Math
    if (pData.isOperating) {
      if (holdCoAssumptions?.includeFinancing) {
        const ds = yearHoldCoInterest + yearHoldCoPrincipal;
        const cashAvailable =
          netFlow + yearHoldCoInterest + yearHoldCoPrincipal; // Pre-debt cash flow at HoldCo
        dscrBuffer = cashAvailable - ds;
        if (ds > 0) {
          avgConsolidatedDscr += cashAvailable / ds;
          operatingYearsWithDebt++;
        }
      } else {
        const ds = (pData.principal || 0) + (pData.interest || 0);
        const cashAvailable = (pData.ebitda || 0) + opCoOperatingDividendFlow;
        dscrBuffer = cashAvailable - ds;
        if (ds > 0) {
          avgConsolidatedDscr += cashAvailable / ds;
          operatingYearsWithDebt++;
        }
      }
    }

    annualData.push({
      year: pData.year,
      isOperating: pData.isOperating,
      dscrBuffer,
      propCoInvestmentFlow,
      propCoOperatingFlow,
      propCoShortfall,
      propCoExitFlow,
      propCoFlow,
      opCoInvestmentFlow,
      opCoOperatingDividendFlow,
      opCoExitFlow,
      opCoFlow,
      netFlow,
      netFlowShortfall: monthly.netFlowShortfall.reduce((acc, val) => acc + val, 0),
      holdCoDebtDraw: yearHoldCoDebtDraw,
      holdCoInterest: yearHoldCoInterest,
      holdCoPrincipal: yearHoldCoPrincipal,
      holdCoDebtBalance: holdCoOutstandingDebt,
      holdCoCashFlowAfterDebt,
      holdCoCashFlowAfterDebtShortfall: monthly.holdCoCashFlowAfterDebtShortfall.reduce((acc, val) => acc + val, 0),
      cumCf,
      lookThroughRevenue,
      lookThroughEbitda,
      lookThroughNetIncome,
      lookThroughMargin,
      monthly,
    });
  });

  const totals: EngineTotals = {
    propCoInvestmentFlow: annualData.reduce(
      (acc, d) => acc + d.propCoInvestmentFlow,
      0,
    ),
    propCoOperatingFlow: annualData.reduce(
      (acc, d) => acc + d.propCoOperatingFlow,
      0,
    ),
    propCoShortfall: annualData.reduce((acc, d) => acc + (d.propCoShortfall || 0), 0),
    propCoExitFlow: annualData.reduce((acc, d) => acc + d.propCoExitFlow, 0),
    propCoFlow: annualData.reduce((acc, d) => acc + d.propCoFlow, 0),
    opCoInvestmentFlow: annualData.reduce(
      (acc, d) => acc + d.opCoInvestmentFlow,
      0,
    ),
    opCoOperatingDividendFlow: annualData.reduce(
      (acc, d) => acc + d.opCoOperatingDividendFlow,
      0,
    ),
    opCoExitFlow: annualData.reduce((acc, d) => acc + d.opCoExitFlow, 0),
    opCoFlow: annualData.reduce((acc, d) => acc + d.opCoFlow, 0),
    netFlow: annualData.reduce((acc, d) => acc + d.netFlow, 0),
    netFlowShortfall: annualData.reduce((acc, d) => acc + (d.netFlowShortfall || 0), 0),
    holdCoCashFlowAfterDebtShortfall: annualData.reduce((acc, d) => acc + (d.holdCoCashFlowAfterDebtShortfall || 0), 0),
    lookThroughRevenue: annualData.reduce(
      (acc, d) => acc + (d.lookThroughRevenue || 0),
      0,
    ),
    lookThroughEbitda: annualData.reduce(
      (acc, d) => acc + (d.lookThroughEbitda || 0),
      0,
    ),
    lookThroughNetIncome: annualData.reduce(
      (acc, d) => acc + (d.lookThroughNetIncome || 0),
      0,
    ),
    holdCoDebtDraw: annualData.reduce(
      (acc, d) => acc + (d.holdCoDebtDraw || 0),
      0,
    ),
    holdCoInterest: annualData.reduce(
      (acc, d) => acc + (d.holdCoInterest || 0),
      0,
    ),
    holdCoPrincipal: annualData.reduce(
      (acc, d) => acc + (d.holdCoPrincipal || 0),
      0,
    ),
    holdCoCashFlowAfterDebt: annualData.reduce(
      (acc, d) => acc + (d.holdCoCashFlowAfterDebt || 0),
      0,
    ),
  };
  totals.lookThroughMargin =
    totals.lookThroughRevenue > 0
      ? (totals.lookThroughNetIncome / totals.lookThroughRevenue) * 100
      : 0;

  // Compile monthly consolidated cash flows for monthly compounding IRR/NPV
  let consolidatedCfsMonthly = [];
  for (let i = 0; i < annualData.length; i++) {
    const mData = annualData[i].monthly;
    if (mData && mData.holdCoCashFlowAfterDebt) {
      for (let m = 0; m < mData.holdCoCashFlowAfterDebt.length; m++) {
        consolidatedCfsMonthly.push(mData.holdCoCashFlowAfterDebt[m]);
      }
    }
  }

  const holdCoShortfall = totals.holdCoCashFlowAfterDebtShortfall || 0;
  const totalConsolidatedEquity = totalPropCoEq + totalOpCoEq + holdCoShortfall;

  return applySafeMathPrecision({
    annualData,
    operatingData: annualData.filter((d) => d.isOperating),
    metrics: {
      totalEquity: totalConsolidatedEquity,
      irr: calculateIRR(consolidatedCfsMonthly, "monthly"),
      npv: calculateNPV(
        consolidatedCfsMonthly,
        opCoAssumptions.holdCoDiscountRate,
        "monthly",
      ),
      payback: calculatePayback(consolidatedCfsMonthly, "monthly"),
      moic:
        totalConsolidatedEquity > 0
          ? consolidatedCfsMonthly.reduce(
              (acc, val) => (val > 0 ? acc + val : acc),
              0,
            ) / totalConsolidatedEquity
          : 0,
      avgConsolidatedDscr:
        operatingYearsWithDebt > 0
          ? avgConsolidatedDscr / operatingYearsWithDebt
          : 0,
    },
    totals,
    consolidatedCfsMonthly,
  });
};

export const getInitialStepUpPercentages = (
  amortYears: number,
  presetType: string = "tangerang_stepup",
): number[] => {
  if (amortYears <= 0) return [];
  if (presetType === "tangerang_stepup" && amortYears === 13) {
    return [2, 2, 3, 3, 6, 6, 8, 8, 10, 10, 14, 14, 14];
  }
  if (presetType === "tangerang_stepup") {
    // Scale Tangerang step-up to general amortYears
    const basePreset = [2, 2, 3, 3, 6, 6, 8, 8, 10, 10, 14, 14, 14];
    const result = [];
    for (let i = 0; i < amortYears; i++) {
      const ratio = i / (amortYears - 1 || 1);
      const baseIdx = ratio * (basePreset.length - 1);
      const low = Math.floor(baseIdx);
      const high = Math.min(basePreset.length - 1, Math.ceil(baseIdx));
      const val =
        basePreset[low] +
        (basePreset[high] - basePreset[low]) * (baseIdx - low);
      result.push(val);
    }
    // Normalize to sum of 100
    const sum = result.reduce((a, b) => a + b, 0);
    const rounded = result.map((v) => parseFloat(((v / sum) * 100).toFixed(2)));
    // Adjust any rounding error in the final element to guarantee exactly 100%
    const currentSum = rounded.reduce((a, b) => a + b, 0);
    const diff = 100 - currentSum;
    if (Math.abs(diff) > 0.001) {
      rounded[rounded.length - 1] = parseFloat(
        (rounded[rounded.length - 1] + diff).toFixed(2),
      );
    }
    return rounded;
  }
  // Equal division
  const pct = parseFloat((100 / amortYears).toFixed(2));
  const result = Array(amortYears).fill(pct);
  const currentSum = result.reduce((a, b) => a + b, 0);
  const diff = 100 - currentSum;
  if (Math.abs(diff) > 0.001) {
    result[result.length - 1] = parseFloat(
      (result[result.length - 1] + diff).toFixed(2),
    );
  }
  return result;
};

export const ensureArray = (val: any): any[] => {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") {
    const arr = [];
    let i = 0;
    while (i in val) {
      arr.push(val[i]);
      i++;
    }
    if (arr.length > 0) return arr;
    return Object.values(val);
  }
  return [];
};
