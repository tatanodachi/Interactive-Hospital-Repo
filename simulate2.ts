
const calculatePMT = (rate, nper, pv) =>
  rate === 0 ? -(pv / nper) : -(pv * rate) / (1 - Math.pow(1 + rate, -nper));

const calculatePayback = (cfs) => {
  if (!cfs || cfs.length === 0) return 0;
  let cumulative = 0;
  for (let i = 0; i < cfs.length; i++) {
    let prevCumulative = cumulative;
    cumulative += cfs[i] || 0;
    if (cumulative >= 0 && prevCumulative < 0)
      return i + Math.abs(prevCumulative) / (cfs[i] || 1);
  }
  return 0; // Return 0 if the project never catches up, preventing fake extrapolation
};

const calculateIRR = (cfs) => {
  if (!cfs || cfs.length === 0) return 0;
  let rate = 0.1;
  for (let i = 0; i < 100; i++) {
    let npv = 0,
      dNpv = 0;
    for (let t = 0; t < cfs.length; t++) {
      const val = cfs[t] || 0;
      npv += val / Math.pow(1 + rate, t);
      if (t > 0) dNpv -= (t * val) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(dNpv) < 1e-10) break;
    let newRate = rate - npv / dNpv;
    if (Math.abs(newRate - rate) < 1e-6) return newRate;
    rate = newRate;
  }
  return 0;
};

const calculateNPV = (cfs, rate) =>
  !cfs
    ? 0
    : cfs.reduce(
        (acc, val, i) => acc + (val || 0) / Math.pow(1 + (rate || 12) / 100, i),
        0,
      );

const DEFAULT_OPCO_ASSUMPTIONS = {
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
  workingCapitalOpex: 64.6,
  sharingPercentA: 51.0,
  equitySplitY1: 100,
  discountRate: 12,
  holdCoDiscountRate: 11,
  includeTerminalValue: true,
  exitMultiple: 15,
  sellingCosts: 0,
  dividendPayoutRatio: 80,
};

const DEFAULT_PROPCO_ASSUMPTIONS = {
  linkToOpCo: true,
  manualBaseRent: 35,
  manualRentEscalation: 3,
  includeLand: false,
  landArea: 12643,
  landPrice: 15,
  buildArea: 13000,
  buildCost: 11.5,
  includeMedEq: true,
  medEqProcurement: "lease",
  medEqLeaseMonthly: 0.375,
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
  capexCarPct: 0.15,
  capexVat: 11,
  devDurationMonths: 24,
  equityDrawYear1Pct: 100,
  constructionOpexMonthly: 0.5,
  opOverheadMonthly: 0.2,
  opOverheadInc: 4,
  ffeReservePct: 2,
  includeFinancing: false,
  ltv: 70,
  interestRate: 8.5,
  loanTenor: 15,
  ioGracePeriodYears: 3,
  maintRate: 0,
  propTaxRate: 0,
  corporateTax: 22,
  discountRate: 11,
  depLifeBuilding: 20,
  depMethodBuilding: "SL",
  depLifeInfra: 20,
  depMethodInfra: "SL",
  depLifeMedEq: 10,
  depMethodMedEq: "SL",
  depLifeFFE: 20,
  depMethodFFE: "SL",
  includeTerminalValue: true,
  exitMethod: "multiple",
  exitCapRate: 8.5,
  exitMultiple: 15,
  sellingCosts: 0,
};

const CANCER_DATA = [
  { name: "Breast", cases: 66271, fill: "#1C6048" },
  { name: "Lung", cases: 38904, fill: "#9B8B70" },
  { name: "Cervical", cases: 36964, fill: "#99B6AA" },
  { name: "Colorectal", cases: 35676, fill: "#EFEBE7" },
  { name: "Liver", cases: 23805, fill: "#D8D8D8" },
];

const INSURANCE_DATA = [
  { year: "2021", value: 14.3 },
  { year: "2022", value: 16.2 },
  { year: "2023", value: 18.8 },
  { year: "2024", value: 21.4 },
  { year: "2025", value: 24.1 },
  { year: "2026", value: 27.2 },
];

const apiKey = "";
const callGemini = async (prompt, systemInstruction) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          throw new Error(`Client Error: ${response.status}`); // Don't retry 4xx errors
        }
        throw new Error("API Error");
      }
      const result = await response.json();
      return (
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response generated."
      );
    } catch (error) {
      if (error.message.includes("Client Error") || i === 4) throw error;
      await new Promise((res) => setTimeout(Math.pow(2, i) * 1000, res));
    }
  }
};

// ==========================================
// 2. FINANCIAL ENGINES
// ==========================================
const runOpCoEngine = (assumptions, config) => {
  const requestedYears = config?.projYears || 10;
  const projYears = Math.min(requestedYears, 30);

  let exitYear = null;
  if (config?.exitYear !== undefined && config.exitYear !== null) {
    exitYear = Math.min(config.exitYear, 30);
  } else if (assumptions.includeTerminalValue) {
    exitYear = 10;
  }
  const totalEquity = assumptions.partnerAEquity + assumptions.partnerBEquity;
  let annualData = [],
    projectCfs = [],
    partnerACfs = [],
    partnerBCfs = [];
  let cumulativeNetIncome = 0,
    partnerA_CumCF = 0,
    partnerB_CumCF = 0,
    cumulativeRetainedEarnings = 0;

  const preOp = [
    { k: "jvaOpex", y: "Year 1", split: assumptions.equitySplitY1 / 100 },
    {
      k: "commOpex",
      y: "Year 2",
      split: (100 - assumptions.equitySplitY1) / 100,
    },
  ];
  preOp.forEach((p) => {
    const net = -assumptions[p.k];
    cumulativeNetIncome += net;
    const pA_Outlay = -assumptions.partnerAEquity * p.split;
    const pB_Outlay = -assumptions.partnerBEquity * p.split;
    partnerA_CumCF += pA_Outlay;
    partnerB_CumCF += pB_Outlay;

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
      recurringOpex: 0,
      ebitdar: 0,
      rent: 0,
      ebitda: net,
      tax: 0,
      netIncome: net,
      cumNI: cumulativeNetIncome,
      distributableProfit: 0,
      retainedThisYear: 0,
      cumulativeRetainedEarnings: 0,
      shareA: 0,
      shareB: 0,
      pA_Outlay,
      pA_Div: 0,
      pA_Net: pA_Outlay,
      pA_Cum: partnerA_CumCF,
      pA_Yield: 0,
      pB_Outlay,
      pB_Div: 0,
      pB_Net: pB_Outlay,
      pB_Cum: partnerB_CumCF,
      pB_Yield: 0,
      fcf: pA_Outlay + pB_Outlay,
      ebitdaMargin: 0,
      netMargin: 0,
      roe: 0,
      breakEvenBor: 0,
      bor: 0,
      ev: 0,
    });
    partnerACfs.push(pA_Outlay);
    partnerBCfs.push(pB_Outlay);
    projectCfs.push(pA_Outlay + pB_Outlay);
  });

  for (let i = 1; i <= projYears; i++) {
    let bor = Math.min(
      assumptions.borMax / 100,
      assumptions.borStart / 100 + (i - 1) * (assumptions.borIncrement / 100),
    );
    let bedDays = assumptions.beds * 365 * bor;
    let ipCases = bedDays / assumptions.alos;
    let opVisits = ipCases * assumptions.opIpRatio;
    let priceMultiplier = 1;
    for (let j = 2; j <= i; j++)
      priceMultiplier *=
        1 +
        (j <= 6
          ? assumptions.priceIncYears1_6
          : assumptions.priceIncYears7_plus) /
          100;

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

    let rent = 0;
    if (assumptions.rentStructureType === "flatEbitdar") {
      rent =
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
      rent = revRent + profitRent;
    } else {
      // Default: tiered structure
      let currentRevPab =
        assumptions.beds > 0 ? totalRev / assumptions.beds : 0;
      let rentRate = 0;
      if (currentRevPab < assumptions.rentTier1Limit)
        rentRate = assumptions.rentTier1Rate;
      else if (currentRevPab < assumptions.rentTier2Limit)
        rentRate = assumptions.rentTier2Rate;
      else rentRate = assumptions.rentTier3Rate;
      rent = ebitdar > 0 ? (rentRate / 100) * ebitdar : 0;
    }

    let ebitda = ebitdar - rent;
    let tax = ebitda > 0 ? ebitda * (assumptions.corporateTax / 100) : 0;
    let netIncome = ebitda - tax;

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

    let prevCumNI = cumulativeNetIncome;
    cumulativeNetIncome += netIncome;

    let availableForDistribution = Math.max(
      0,
      cumulativeNetIncome > 0
        ? prevCumNI < 0
          ? cumulativeNetIncome
          : netIncome
        : 0,
    );
    let distributableProfit =
      availableForDistribution *
      ((assumptions.dividendPayoutRatio ?? 100) / 100);
    let retainedThisYear = availableForDistribution - distributableProfit;
    cumulativeRetainedEarnings += retainedThisYear;

    let opCoExit = 0,
      pA_Exit = 0,
      pB_Exit = 0,
      ev = 0;
    if (exitYear !== null && i === exitYear) {
      ev = ebitda * (assumptions.exitMultiple || 30);
      if (assumptions.sellingCosts) {
        ev = ev * (1 - assumptions.sellingCosts / 100);
      }
      opCoExit = ev + cumulativeRetainedEarnings;
      pA_Exit = opCoExit * (assumptions.sharingPercentA / 100);
      pB_Exit = opCoExit * ((100 - assumptions.sharingPercentA) / 100);
    }

    let shareA = distributableProfit * (assumptions.sharingPercentA / 100);
    let shareB =
      distributableProfit * ((100 - assumptions.sharingPercentA) / 100);

    partnerA_CumCF += shareA + pA_Exit;
    partnerB_CumCF += shareB + pB_Exit;

    annualData.push({
      year: `Year ${i + 2}`,
      isOperating: true,
      ipRev,
      opRev,
      totalRev,
      totalMedSupp,
      totalDocFee,
      grossProfit,
      staffCost,
      recurringOpex,
      ebitdar,
      rent,
      ebitda,
      tax,
      netIncome,
      cumNI: cumulativeNetIncome,
      distributableProfit,
      retainedThisYear,
      cumulativeRetainedEarnings,
      shareA,
      shareB,
      opCoExit,
      pA_Exit,
      pB_Exit,
      ev,
      pA_Outlay: 0,
      pA_Div: shareA + pA_Exit,
      pA_Net: shareA + pA_Exit,
      pA_Cum: partnerA_CumCF,
      pB_Outlay: 0,
      pB_Div: shareB + pB_Exit,
      pB_Net: shareB + pB_Exit,
      pB_Cum: partnerB_CumCF,
      pA_Yield:
        assumptions.partnerAEquity > 0
          ? (shareA / assumptions.partnerAEquity) * 100
          : 0,
      pB_Yield:
        assumptions.partnerBEquity > 0
          ? (shareB / assumptions.partnerBEquity) * 100
          : 0,
      fcf:
        netIncome + (i === 1 ? assumptions.workingCapitalOpex : 0) + opCoExit,
      ebitdaMargin: totalRev > 0 ? (ebitda / totalRev) * 100 : 0,
      netMargin: totalRev > 0 ? (netIncome / totalRev) * 100 : 0,
      roe: totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0,
      breakEvenBor: breakEvenBor * 100,
      bor: bor * 100,
      ipCases,
      opVisits,
      fixedCosts: fixedTotal,
      varCosts: grossProfit - ebitdar,
    });
    partnerACfs.push(shareA + pA_Exit);
    partnerBCfs.push(shareB + pB_Exit);
    projectCfs.push(
      netIncome + (i === 1 ? assumptions.workingCapitalOpex : 0) + opCoExit,
    );
  }

  const operatingData = annualData.filter((d) => d.isOperating);
  const stabilizedYear =
    operatingData.find((y) => y.bor >= assumptions.borMax) ||
    operatingData[operatingData.length - 1] ||
    operatingData[0];

  return {
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
      opCoExit: annualData.reduce((acc, d) => acc + (d.opCoExit || 0), 0),
      pA_Exit: annualData.reduce((acc, d) => acc + (d.pA_Exit || 0), 0),
      pB_Exit: annualData.reduce((acc, d) => acc + (d.pB_Exit || 0), 0),
    },
    opsMetrics: {
      stabilizedVolume:
        (stabilizedYear?.ipCases || 0) + (stabilizedYear?.opVisits || 0),
      revPab:
        assumptions.beds > 0
          ? ((stabilizedYear?.totalRev || 0) * 1000) / assumptions.beds
          : 0,
      ebitdaPerBed:
        assumptions.beds > 0
          ? ((stabilizedYear?.ebitda || 0) * 1000) / assumptions.beds
          : 0,
      fixedCostPct:
        ((stabilizedYear?.fixedCosts || 0) /
          ((stabilizedYear?.fixedCosts || 0) +
            (stabilizedYear?.varCosts || 0) || 1)) *
        100,
      beds: assumptions.beds,
    },
    totalEquity,
    projectIRR: calculateIRR(projectCfs),
    projectNPV: calculateNPV(projectCfs, assumptions.discountRate),
    partnerA: {
      irr: calculateIRR(partnerACfs),
      payback: calculatePayback(partnerACfs),
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
      irr: calculateIRR(partnerBCfs),
      payback: calculatePayback(partnerBCfs),
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
  };
};

const runPropCoEngine = (assumptions, opCoModelData, config) => {
  const requestedYears = config?.projYears || 10;
  const projYears = Math.min(requestedYears, 30);

  let exitYear = null;
  if (config?.exitYear !== undefined && config.exitYear !== null) {
    exitYear = Math.min(config.exitYear, 30);
  } else if (assumptions.includeTerminalValue) {
    exitYear = 10;
  }
  let annualData = [],
    equityCfs = [],
    equityCfsExLand = [],
    unleveredCfs = [],
    operatingCfs = [];
  const landCost =
    (assumptions.includeLand ?? true)
      ? (assumptions.landArea * assumptions.landPrice) / 1000
      : 0;
  const buildCost = (assumptions.buildArea * assumptions.buildCost) / 1000;
  const medEqCost =
    assumptions.includeMedEq && assumptions.medEqProcurement !== "lease"
      ? (assumptions.capexMedEqQty * assumptions.capexMedEqPrice) / 1000
      : 0;
  const infraCost =
    (assumptions.capexInfraQty * assumptions.capexInfraPrice) / 1000;
  const ffeCost = assumptions.includeFFE
    ? (assumptions.capexFFEQty * assumptions.capexFFEPrice) / 1000
    : 0;
  const totalHardCosts = buildCost + medEqCost + infraCost + ffeCost;

  const coreCostForPct = buildCost + ffeCost + medEqCost + infraCost;
  const consultantCost =
    coreCostForPct * ((assumptions.capexConsultantPct || 0) / 100);
  const licenseCost =
    coreCostForPct * ((assumptions.capexLicensePct || 0) / 100);
  const carCost = buildCost * ((assumptions.capexCarPct || 0) / 100);
  const sharingDevCost =
    (assumptions.capexSharingDevQty * assumptions.capexSharingDevPrice) / 1000;
  const vatBase =
    consultantCost +
    buildCost +
    ffeCost +
    medEqCost +
    infraCost +
    sharingDevCost;
  const vatCost = vatBase * ((assumptions.capexVat || 0) / 100);
  const contingencyBase =
    licenseCost +
    consultantCost +
    buildCost +
    ffeCost +
    medEqCost +
    infraCost +
    sharingDevCost +
    vatCost;
  const contingencyCost =
    contingencyBase * ((assumptions.capexContingencyPct || 0) / 100);

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
    contingencyCost;
  const totalSoftCosts = totalCapex - landCost - totalHardCosts;
  const effectiveLtv = assumptions.includeFinancing ? assumptions.ltv : 0;
  const totalDebt = totalCapex * (effectiveLtv / 100);
  const totalEquity = totalCapex - totalDebt;

  const ioYears = assumptions.ioGracePeriodYears || 0;
  const amortizingTenor = Math.max(1, assumptions.loanTenor - ioYears);
  const postIoPmt = Math.abs(
    calculatePMT(assumptions.interestRate / 100, amortizingTenor, totalDebt),
  );
  const totalCapexExLand = totalCapex - landCost;
  const totalDebtExLand = totalCapexExLand * (effectiveLtv / 100);
  const totalEquityExLand = totalCapexExLand - totalDebtExLand;
  const postIoPmtExLand = Math.abs(
    calculatePMT(
      assumptions.interestRate / 100,
      amortizingTenor,
      totalDebtExLand,
    ),
  );

  const buildBasis =
    buildCost +
    (totalHardCosts > 0 ? (totalSoftCosts * buildCost) / totalHardCosts : 0);
  let medEqBasis =
    medEqCost +
    (totalHardCosts > 0 ? (totalSoftCosts * medEqCost) / totalHardCosts : 0);
  const infraBasis =
    infraCost +
    (totalHardCosts > 0 ? (totalSoftCosts * infraCost) / totalHardCosts : 0);
  const ffeBasis =
    ffeCost +
    (totalHardCosts > 0 ? (totalSoftCosts * ffeCost) / totalHardCosts : 0);

  const devYears = Math.max(
    1,
    Math.ceil((assumptions.devDurationMonths || 12) / 12),
  );
  let outstandingDebt = totalDebt,
    outstandingDebtExLand = totalDebtExLand,
    equityCum = 0,
    equityCumExLand = 0;

  for (let i = 1; i <= devYears; i++) {
    const monthsThisYear = Math.min(
      12,
      Math.max(0, (assumptions.devDurationMonths || 24) - (i - 1) * 12),
    );
    const overheadOpex =
      (assumptions.constructionOpexMonthly || 0) * monthsThisYear +
      carCost / devYears;

    let eqDrawBase, eqDrawExLandBase, capDrawBase;
    if (devYears > 1) {
      const y1Pct = (assumptions.equityDrawYear1Pct ?? 50) / 100;
      if (i === 1) {
        eqDrawBase = totalEquity * y1Pct;
        eqDrawExLandBase = totalEquityExLand * y1Pct;
        capDrawBase = totalCapex * y1Pct;
      } else {
        eqDrawBase = (totalEquity * (1 - y1Pct)) / (devYears - 1);
        eqDrawExLandBase = (totalEquityExLand * (1 - y1Pct)) / (devYears - 1);
        capDrawBase = (totalCapex * (1 - y1Pct)) / (devYears - 1);
      }
    } else {
      eqDrawBase = totalEquity;
      eqDrawExLandBase = totalEquityExLand;
      capDrawBase = totalCapex;
    }

    const eqDraw = -eqDrawBase - overheadOpex;
    const eqDrawExLand = -eqDrawExLandBase - overheadOpex;
    equityCum += eqDraw;
    equityCumExLand += eqDrawExLand;
    equityCfs.push(eqDraw);
    equityCfsExLand.push(eqDrawExLand);
    unleveredCfs.push(-capDrawBase - overheadOpex);
    operatingCfs.push(eqDraw);
    annualData.push({
      year: `Year ${i}`,
      isOperating: false,
      debtBalance: totalDebt,
      debtBalanceExLand: totalDebtExLand,
      fcfe: eqDraw,
      cumFcfe: equityCum,
      fcfeExLand: eqDrawExLand,
      cumFcfeExLand: equityCumExLand,
    });
  }

  let avgDscr = 0,
    avgYield = 0;
  const opCoRents = opCoModelData.annualData
    .filter((d) => d.isOperating)
    .map((d) => d.rent);
  let bvB = buildBasis,
    bvM = medEqBasis,
    bvI = infraBasis,
    bvF = ffeBasis;

  for (let i = 1; i <= projYears; i++) {
    let revenue = assumptions.linkToOpCo
      ? opCoRents[i - 1] || 0
      : assumptions.manualBaseRent *
        Math.pow(1 + assumptions.manualRentEscalation / 100, i - 1);
    const maint = buildCost * (assumptions.maintRate / 100),
      taxOp = totalCapex * (assumptions.propTaxRate / 100);
    const overhead =
      assumptions.opOverheadMonthly *
      12 *
      Math.pow(1 + assumptions.opOverheadInc / 100, i - 1);
    const reserve = revenue * (assumptions.ffeReservePct / 100);

    let medEqLeaseOpex = 0;
    let deferredCapex = 0;

    if (assumptions.includeMedEq && assumptions.medEqProcurement === "lease") {
      if (i < (assumptions.medEqPurchaseOpYear || 4)) {
        medEqLeaseOpex = (assumptions.medEqLeaseMonthly || 0.375) * 12;
      } else if (i === (assumptions.medEqPurchaseOpYear || 4)) {
        deferredCapex = (assumptions.medEqPurchaseAmount || 150000) / 1000;
        bvM += deferredCapex;
        medEqBasis += deferredCapex;
      }
    }

    const ebitda =
      revenue - maint - taxOp - overhead - reserve - medEqLeaseOpex;

    let interest = 0,
      principal = 0,
      interestExLand = 0,
      principalExLand = 0;
    if (outstandingDebt > 0.01) {
      interest = outstandingDebt * (assumptions.interestRate / 100);
      principal =
        i <= ioYears ? 0 : Math.min(outstandingDebt, postIoPmt - interest);
      outstandingDebt -= principal;
    }
    if (outstandingDebtExLand > 0.01) {
      interestExLand = outstandingDebtExLand * (assumptions.interestRate / 100);
      principalExLand =
        i <= ioYears
          ? 0
          : Math.min(outstandingDebtExLand, postIoPmtExLand - interestExLand);
      outstandingDebtExLand -= principalExLand;
    }

    const calcDep = (bv, basis, life, method) => {
      if (method === "DDB") return Math.min(bv * (2 / life), bv);
      return Math.min(basis / life, bv); // Default to Straight Line
    };
    const d1 = calcDep(
      bvB,
      buildBasis,
      assumptions.depLifeBuilding || 20,
      assumptions.depMethodBuilding,
    );
    bvB -= d1;
    const d2 =
      assumptions.includeMedEq &&
      assumptions.medEqProcurement === "lease" &&
      i < (assumptions.medEqPurchaseOpYear || 4)
        ? 0
        : calcDep(
            bvM,
            medEqBasis,
            assumptions.depLifeMedEq || 10,
            assumptions.depMethodMedEq,
          );
    bvM -= d2;
    const d3 = calcDep(
      bvI,
      infraBasis,
      assumptions.depLifeInfra || 20,
      assumptions.depMethodInfra,
    );
    bvI -= d3;
    const d4 = calcDep(
      bvF,
      ffeBasis,
      assumptions.depLifeFFE || 20,
      assumptions.depMethodFFE,
    );
    bvF -= d4;
    const dep = d1 + d2 + d3 + d4;

    const ebt = ebitda - interest - dep;
    const tax = ebt > 0 ? ebt * (assumptions.corporateTax / 100) : 0;
    const netIncome = ebt - tax;

    let exit = 0,
      exitExLand = 0,
      exitUnlev = 0;
    if (exitYear !== null && i === exitYear) {
      let tv =
        assumptions.exitMethod === "multiple"
          ? ebitda * assumptions.exitMultiple
          : ebitda / (assumptions.exitCapRate / 100);
      if (tv > 0) {
        const cost = tv * (assumptions.sellingCosts / 100);
        exit = tv - cost - outstandingDebt;
        exitUnlev = tv - cost;
        exitExLand = tv - cost - outstandingDebtExLand - landCost;
        outstandingDebt = 0;
        outstandingDebtExLand = 0;
      }
    }

    const unleveredFcff =
      ebitda -
      dep -
      (ebitda - dep > 0
        ? (ebitda - dep) * (assumptions.corporateTax / 100)
        : 0) +
      dep +
      exitUnlev -
      deferredCapex;
    unleveredCfs.push(unleveredFcff);

    const opFcfe = netIncome + dep - principal - deferredCapex;
    const fcfe = opFcfe + exit;
    const fcfeExLand =
      ebitda -
      interestExLand -
      dep -
      (ebitda - interestExLand - dep > 0
        ? (ebitda - interestExLand - dep) * (assumptions.corporateTax / 100)
        : 0) +
      dep -
      principalExLand +
      exitExLand -
      deferredCapex;

    equityCum += fcfe;
    equityCumExLand += fcfeExLand;
    equityCfs.push(fcfe);
    equityCfsExLand.push(fcfeExLand);
    operatingCfs.push(opFcfe);

    const dscr = principal + interest > 0 ? ebitda / (principal + interest) : 0;
    avgDscr += dscr;
    avgYield += totalEquity > 0 ? (opFcfe / totalEquity) * 100 : 0;

    annualData.push({
      year: `Year ${i + devYears}`,
      isOperating: true,
      revenue,
      maintOpex: maint,
      taxOpex: taxOp,
      overheadOpex: overhead,
      ffeReserve: reserve,
      medEqLeaseOpex,
      ebitda,
      interest,
      principal,
      debtBalance: outstandingDebt,
      dep,
      corpTax: tax,
      netIncome,
      deferredCapex,
      fcfe,
      cumFcfe: equityCum,
      dscr,
      yield: totalEquity > 0 ? (opFcfe / totalEquity) * 100 : 0,
      fcfeExLand,
      cumFcfeExLand: equityCumExLand,
      interestExLand,
      principalExLand,
      debtBalanceExLand: outstandingDebtExLand,
      exit,
      netExitProceeds: exit,
      ebt,
      netExitProceedsExLand: exitExLand,
      ebtExLand: ebitda - interestExLand - dep,
      corpTaxExLand:
        ebitda - interestExLand - dep > 0
          ? (ebitda - interestExLand - dep) * (assumptions.corporateTax / 100)
          : 0,
    });
  }

  const operatingData = annualData.filter((d) => d.isOperating);

  return {
    annualData,
    operatingData,
    metrics: {
      totalCapex,
      totalDebt,
      totalEquity,
      irr: calculateIRR(equityCfs),
      npv: calculateNPV(equityCfs, assumptions.discountRate),
      unleveredIrr: calculateIRR(unleveredCfs),
      unleveredNpv: calculateNPV(unleveredCfs, assumptions.discountRate),
      irrExLand: calculateIRR(equityCfsExLand),
      npvExLand: calculateNPV(equityCfsExLand, assumptions.discountRate),
      payback: calculatePayback(equityCfs),
      operatingPayback: calculatePayback(operatingCfs),
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
        equityCfs.reduce((acc, val) => (val > 0 ? acc + val : acc), 0) /
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
      ebitda: annualData.reduce((acc, d) => acc + (d.ebitda || 0), 0),
      interest: annualData.reduce((acc, d) => acc + (d.interest || 0), 0),
      principal: annualData.reduce((acc, d) => acc + (d.principal || 0), 0),
      ds: annualData.reduce(
        (acc, d) => acc + (d.interest || 0) + (d.principal || 0),
        0,
      ),
      dep: annualData.reduce((acc, d) => acc + (d.dep || 0), 0),
      ebt: annualData.reduce((acc, d) => acc + (d.ebt || 0), 0),
      corpTax: annualData.reduce((acc, d) => acc + (d.corpTax || 0), 0),
      netIncome: annualData.reduce((acc, d) => acc + (d.netIncome || 0), 0),
      deferredCapex: annualData.reduce(
        (acc, d) => acc + (d.deferredCapex || 0),
        0,
      ),
      fcfe: annualData.reduce((acc, d) => acc + (d.fcfe || 0), 0),
      netExitProceeds: annualData.reduce(
        (acc, d) => acc + (d.netExitProceeds || 0),
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
    },
  };
};

const runConsolidatedEngine = (opCoData, propCoData, opCoAssumptions) => {
  let annualData = [],
    consolidatedCfs = [];
  let cumCf = 0;
  let avgConsolidatedDscr = 0;
  let operatingYearsWithDebt = 0;

  const totalPropCoEq = propCoData.metrics.totalEquity;
  const totalOpCoEq = opCoAssumptions.partnerBEquity; // 49% HoldCo Share
  const totalConsolidatedEquity = totalPropCoEq + totalOpCoEq;

  propCoData.annualData.forEach((pData, i) => {
    const oData = opCoData.annualData[i] || {
      shareB: 0,
      pB_Outlay: 0,
      pB_Exit: 0,
      isOperating: pData.isOperating,
      year: pData.year,
    };

    // FCFE & pB_Outlay are negative during investment, positive during returns
    const propCoFlow = pData.fcfe || 0;
    const opCoOperatingFlow = (oData.pB_Outlay || 0) + (oData.shareB || 0);
    const opCoExitFlow = oData.pB_Exit || 0;
    const opCoFlow = opCoOperatingFlow + opCoExitFlow;
    const netFlow = propCoFlow + opCoFlow;

    cumCf += netFlow;
    consolidatedCfs.push(netFlow);

    // Look-Through PnL Metrics
    const sharePct = (100 - opCoAssumptions.sharingPercentA) / 100;
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

    // Consolidated DSCR Math
    if (pData.isOperating) {
      const ds = (pData.principal || 0) + (pData.interest || 0);
      if (ds > 0) {
        const cashAvailable = (pData.ebitda || 0) + opCoOperatingFlow;
        avgConsolidatedDscr += cashAvailable / ds;
        operatingYearsWithDebt++;
      }
    }

    annualData.push({
      year: pData.year,
      isOperating: pData.isOperating,
      propCoFlow,
      opCoOperatingFlow,
      opCoExitFlow,
      opCoFlow,
      netFlow,
      cumCf,
      lookThroughRevenue,
      lookThroughEbitda,
      lookThroughNetIncome,
      lookThroughMargin,
    });
  });

  const totals = {
    propCoFlow: annualData.reduce((acc, d) => acc + d.propCoFlow, 0),
    opCoOperatingFlow: annualData.reduce(
      (acc, d) => acc + d.opCoOperatingFlow,
      0,
    ),
    opCoExitFlow: annualData.reduce((acc, d) => acc + d.opCoExitFlow, 0),
    opCoFlow: annualData.reduce((acc, d) => acc + d.opCoFlow, 0),
    netFlow: annualData.reduce((acc, d) => acc + d.netFlow, 0),
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
  };
  totals.lookThroughMargin =
    totals.lookThroughRevenue > 0
      ? (totals.lookThroughNetIncome / totals.lookThroughRevenue) * 100
      : 0;

  return {
    annualData,
    operatingData: annualData.filter((d) => d.isOperating),
    metrics: {
      totalEquity: totalConsolidatedEquity,
      irr: calculateIRR(consolidatedCfs),
      npv: calculateNPV(consolidatedCfs, opCoAssumptions.holdCoDiscountRate),
      payback: calculatePayback(consolidatedCfs),
      moic:
        totalConsolidatedEquity > 0
          ? consolidatedCfs.reduce(
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
  };
};
const projConfig = { exitYear: 10, projYears: 10 };
const opCoData = runOpCoEngine(DEFAULT_OPCO_ASSUMPTIONS, projConfig);
const propCoData = runPropCoEngine(DEFAULT_PROPCO_ASSUMPTIONS, opCoData, projConfig);
const consolidatedData = runConsolidatedEngine(opCoData, propCoData, DEFAULT_OPCO_ASSUMPTIONS);

console.log('OpCo Metrics:', opCoData.metrics);
console.log('OpCo Totals:', opCoData.totals);
console.log('PropCo Metrics:', propCoData.metrics);
console.log('PropCo Totals:', propCoData.totals);
console.log('Consolidated Metrics:', consolidatedData.metrics);


console.log('OpCo partnerA:', opCoData.partnerA);
console.log('Dev CAR:', propCoData.totals.devCar);
