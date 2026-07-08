import { CONSOLIDATED_FORMULAS } from "../formulaTooltips";
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
  ChevronsUpDown,
  ChevronsDownUp,
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
  TableSection,
} from "../App";

export const ConsolidatedCascadeView = memo(
  ({
    data,
    opcoData,
    propcoData,
    opcoAssumptions,
    viewResolution,
    setViewResolution,
    holdCoAssumptions,
    handleHoldCoChange,
  }) => {
    const {
      columns: rawColumns,
      expandedYears,
      toggleYear,
    } = useMonthlyColumns(data.annualData, viewResolution);
    const scrollRef = useRef(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // viewMode defines table visibility: 'all' | 'statement' | 'cascade'
    const [viewMode, setViewMode] = useState("all");

    const [expandedPropCo, setExpandedPropCo] = useState(false);
    const [expandedOpCo, setExpandedOpCo] = useState(false);
    const [expandedPropCoDebt, setExpandedPropCoDebt] = useState(false);
    const [expandedOpCoDebt, setExpandedOpCoDebt] = useState(false);
    const [expandedRevenue, setExpandedRevenue] = useState(false);
    const [expandedEbitda, setExpandedEbitda] = useState(false);
    const [expandedNetIncome, setExpandedNetIncome] = useState(false);
    const [expandedAdj, setExpandedAdj] = useState(false);
    const [expandedOpCoAdj, setExpandedOpCoAdj] = useState(false);
    const [expandedLtCapex, setExpandedLtCapex] = useState(false);
    const [expandedPropCoLt, setExpandedPropCoLt] = useState(false);
    const [expandedOpCoLt, setExpandedOpCoLt] = useState(false);
    const [expandedLtExit, setExpandedLtExit] = useState(false);
    const [expandedHoldCo, setExpandedHoldCo] = useState(false);
    const [expandedCashAvailable, setExpandedCashAvailable] = useState(false);

    // Enrich columns on the fly with true look-through accounting values
    const columns = useMemo(() => {
      let cumPartnerPropCo = 0;
      let cumPartnerOpCo = 0;

      return rawColumns.map((col) => {
        const yr = col.parentYear || col.year;
        const yrIdx = data.annualData.findIndex((d) => d.year === yr);

        const pY = propcoData?.annualData?.[yrIdx] || {};
        const oY = opcoData?.annualData?.[yrIdx] || {};

        const isMonth = col.colType === "month";
        let mIdx = 0;
        if (isMonth) {
          const match = col.defaultLabel.match(/M(\d+)/);
          if (match) mIdx = parseInt(match[1]) - 1;
        }

        const sharePct = 0.49;

        // Operating Flow lookups
        const pEbitda = isMonth
          ? pY.monthly?.ebitda?.[mIdx] || 0
          : pY.ebitda || 0;
        const oEbitda = isMonth
          ? oY.monthly?.ebitda?.[mIdx] || 0
          : oY.ebitda || 0;
        const ltEbitda = col.lookThroughEbitda || pEbitda + oEbitda * sharePct;

        const pTax = isMonth
          ? pY.monthly?.corpTax?.[mIdx] || 0
          : pY.corpTax || 0;
        const oTax = isMonth ? oY.monthly?.tax?.[mIdx] || 0 : oY.tax || 0;
        const ltTax = pTax + oTax * sharePct;
        const ltCfo = ltEbitda - ltTax;

        // Investing Flow lookups (Capex & setups)
        const pLand = isMonth
          ? pY.monthly?.landSpend?.[mIdx] || 0
          : pY.landSpend || 0;
        const pHard = isMonth
          ? pY.monthly?.hardSpend?.[mIdx] || 0
          : pY.hardSpend || 0;
        const pSoft = isMonth
          ? pY.monthly?.softSpend?.[mIdx] || 0
          : pY.softSpend || 0;
        const pDevGa = isMonth ? pY.monthly?.devGa?.[mIdx] || 0 : pY.devGa || 0;
        const pDevCar = isMonth
          ? pY.monthly?.devCar?.[mIdx] || 0
          : pY.devCar || 0;
        const pConInt = isMonth
          ? pY.monthly?.conInt?.[mIdx] || 0
          : pY.conInt || 0;

        const oSetupOutlay = isMonth
          ? oY.monthly?.pB_Outlay?.[mIdx] || 0
          : oY.pB_Outlay || 0;

        const ltPropCoCapex =
          pLand + pHard + pSoft + pDevGa + pDevCar + pConInt;
        const ltOpCoCapex = Math.abs(oSetupOutlay);
        const ltCapex = ltPropCoCapex + ltOpCoCapex;

        const pExit = isMonth ? pY.monthly?.exit?.[mIdx] || 0 : pY.exit || 0;
        const oExit = isMonth
          ? oY.monthly?.pB_Exit?.[mIdx] || 0
          : oY.pB_Exit || 0;
        const ltExit = pExit + oExit;
        const ltCfi = -ltCapex + ltExit;

        // Financing Flow lookups (PropCo Debt)
        const pDebtDraw = isMonth
          ? pY.monthly?.debtDraw?.[mIdx] || 0
          : pY.debtDraw || 0;
        const pPrincipal = isMonth
          ? pY.monthly?.principal?.[mIdx] || 0
          : pY.principal || 0;
        const pInterest = isMonth
          ? pY.monthly?.interest?.[mIdx] || 0
          : pY.interest || 0;

        // Financing Flow lookups (OpCo Debt)
        const oDebtDraw = isMonth
          ? oY.monthly?.debtDraw?.[mIdx] || 0
          : oY.debtDraw || 0;
        const oPrincipal = isMonth
          ? oY.monthly?.principal?.[mIdx] || 0
          : oY.principal || 0;
        const oInterest = isMonth
          ? oY.monthly?.interest?.[mIdx] || 0
          : oY.interest || 0;

        // Financing Flow lookups (HoldCo Debt)
        const hDebtDraw = isMonth
          ? data.annualData[yrIdx]?.monthly?.holdCoDebtDraw?.[mIdx] || 0
          : data.annualData[yrIdx]?.holdCoDebtDraw || 0;
        const hPrincipal = isMonth
          ? data.annualData[yrIdx]?.monthly?.holdCoPrincipal?.[mIdx] || 0
          : data.annualData[yrIdx]?.holdCoPrincipal || 0;
        const hInterest = isMonth
          ? data.annualData[yrIdx]?.monthly?.holdCoInterest?.[mIdx] || 0
          : data.annualData[yrIdx]?.holdCoInterest || 0;

        const ltDebtDraw = pDebtDraw + oDebtDraw + hDebtDraw;
        const ltDebtPrincipal = pPrincipal + oPrincipal + hPrincipal;
        const ltDebtInterest = pInterest + oInterest + hInterest;
        
        const isCashPayIdc = (propcoData?.assumptions?.idcTreatment || "cash_pay") === "cash_pay";
        const pCapitalizedInterest = !pY.isOperating && !isCashPayIdc ? pInterest : 0;
        const pCashInterest = pInterest - pCapitalizedInterest;
        
        const pCffPay = pDebtDraw - pPrincipal - pCashInterest;
        const oCffPay = oDebtDraw - oPrincipal - oInterest;
        const hCffPay = hDebtDraw - hPrincipal - hInterest;
        const ltCffPay = ltDebtDraw - ltDebtPrincipal - (pCashInterest + oInterest + hInterest);

        // Cascading Distributions split to Sponsors
        const pFcfe = isMonth ? pY.monthly?.fcfe?.[mIdx] || 0 : pY.fcfe || 0;
        const oShareB = isMonth
          ? oY.monthly?.shareB?.[mIdx] || 0
          : oY.shareB || 0;
        const oOutlayB = isMonth
          ? oY.monthly?.pB_Outlay?.[mIdx] || 0
          : oY.pB_Outlay || 0;
        const oExitB = isMonth
          ? oY.monthly?.pB_Exit?.[mIdx] || 0
          : oY.pB_Exit || 0;

        const partnerPropCoFlow = pFcfe;
        const partnerOpCoFlow = oOutlayB + oShareB + oExitB;

        cumPartnerPropCo += partnerPropCoFlow;
        cumPartnerOpCo += partnerOpCoFlow;

        const actualHoldCoCf = isMonth
          ? data.annualData[yrIdx]?.monthly?.holdCoCashFlowAfterDebt?.[mIdx] || 0
          : data.annualData[yrIdx]?.holdCoCashFlowAfterDebt || 0;

        const pRevenue = isMonth
          ? pY.monthly?.revenue?.[mIdx] || 0
          : pY.revenue || 0;
        const oRevenueShare = (isMonth
          ? oY.monthly?.totalRev?.[mIdx] || 0
          : oY.totalRev || 0) * sharePct;

        const pEbitdaVal = pEbitda;
        const oEbitdaShare = oEbitda * sharePct;

        const pNetIncome = isMonth
          ? pY.monthly?.netIncome?.[mIdx] || 0
          : pY.netIncome || 0;
        const oNetIncomeShare = (isMonth
          ? oY.monthly?.netIncome?.[mIdx] || 0
          : oY.netIncome || 0) * sharePct;

        const ltCfoCfiCffSum = ltCfo + ltCfi + ltCffPay;
        const holdCoAdjustment = actualHoldCoCf - ltCfoCfiCffSum;

        const pCfo = pEbitda - pTax;
        const pCfi = -ltPropCoCapex + pExit;
        const adjPropCo = partnerPropCoFlow - (pCfo + pCfi + pCffPay);

        const oCfo = oEbitda - oTax;
        const adjOpCo = oShareB - (sharePct * oCfo) - oCffPay;
        const oNetIncomeProxy = (oNetIncomeShare / sharePct);
        const adjOpCoRetained = oShareB - oNetIncomeShare;
        const adjOpCoDistributableShare = oShareB;
        const adjOpCoNetIncomeShare = -oNetIncomeShare;
        const adjOpCoNonCash = -sharePct * (oEbitda - oTax - oNetIncomeProxy);
        const adjOpCoDebt = -oCffPay;

        const propCoFlowVal = isMonth
          ? data.annualData[yrIdx]?.monthly?.propCoFlow?.[mIdx] || 0
          : data.annualData[yrIdx]?.propCoFlow || 0;
        const opCoFlowVal = isMonth
          ? data.annualData[yrIdx]?.monthly?.opCoFlow?.[mIdx] || 0
          : data.annualData[yrIdx]?.opCoFlow || 0;

        let holdCoDistToPropCo = 0;
        let holdCoDistToOpCo = 0;
        let netIncomeFromPropCo = 0;
        let netIncomeFromOpCo = 0;

        if (isMonth) {
          holdCoDistToPropCo = propCoFlowVal < 0 ? Math.abs(propCoFlowVal) : 0;
          holdCoDistToOpCo = opCoFlowVal < 0 ? Math.abs(opCoFlowVal) : 0;
          netIncomeFromPropCo = propCoFlowVal > 0 ? propCoFlowVal : 0;
          netIncomeFromOpCo = opCoFlowVal > 0 ? opCoFlowVal : 0;
        } else {
          const monthlyProp = data.annualData[yrIdx]?.monthly?.propCoFlow;
          const monthlyOp = data.annualData[yrIdx]?.monthly?.opCoFlow;
          if (monthlyProp) {
            monthlyProp.forEach((val) => {
              if (val < 0) holdCoDistToPropCo += Math.abs(val);
              else netIncomeFromPropCo += val;
            });
          } else {
            holdCoDistToPropCo = propCoFlowVal < 0 ? Math.abs(propCoFlowVal) : 0;
            netIncomeFromPropCo = propCoFlowVal > 0 ? propCoFlowVal : 0;
          }

          if (monthlyOp) {
            monthlyOp.forEach((val) => {
              if (val < 0) holdCoDistToOpCo += Math.abs(val);
              else netIncomeFromOpCo += val;
            });
          } else {
            holdCoDistToOpCo = opCoFlowVal < 0 ? Math.abs(opCoFlowVal) : 0;
            netIncomeFromOpCo = opCoFlowVal > 0 ? opCoFlowVal : 0;
          }
        }

        let holdCoAllocToPropCo = 0;
        let holdCoAllocToOpCo = 0;

        if (isMonth) {
          if (hDebtDraw > 0) {
            const propCoOutlay = Math.max(0, -propCoFlowVal);
            const opCoOutlay = Math.max(0, -opCoFlowVal);
            const totalOutlay = propCoOutlay + opCoOutlay;
            if (totalOutlay > 0) {
              holdCoAllocToPropCo = hDebtDraw * (propCoOutlay / totalOutlay);
              holdCoAllocToOpCo = hDebtDraw * (opCoOutlay / totalOutlay);
            } else {
              holdCoAllocToPropCo = hDebtDraw * 0.5;
              holdCoAllocToOpCo = hDebtDraw * 0.5;
            }
          }
        } else {
          const monthlyDraws = data.annualData[yrIdx]?.monthly?.holdCoDebtDraw;
          const monthlyProp = data.annualData[yrIdx]?.monthly?.propCoFlow;
          const monthlyOp = data.annualData[yrIdx]?.monthly?.opCoFlow;
          if (monthlyDraws && monthlyProp && monthlyOp) {
            for (let m = 0; m < 12; m++) {
              const mDraw = monthlyDraws[m] || 0;
              if (mDraw > 0) {
                const propVal = monthlyProp[m] || 0;
                const opVal = monthlyOp[m] || 0;
                const propCoOutlay = Math.max(0, -propVal);
                const opCoOutlay = Math.max(0, -opVal);
                const totalOutlay = propCoOutlay + opCoOutlay;
                if (totalOutlay > 0) {
                  holdCoAllocToPropCo += mDraw * (propCoOutlay / totalOutlay);
                  holdCoAllocToOpCo += mDraw * (opCoOutlay / totalOutlay);
                } else {
                  holdCoAllocToPropCo += mDraw * 0.5;
                  holdCoAllocToOpCo += mDraw * 0.5;
                }
              }
            }
          } else {
            if (hDebtDraw > 0) {
              const propCoOutlay = Math.max(0, -propCoFlowVal);
              const opCoOutlay = Math.max(0, -opCoFlowVal);
              const totalOutlay = propCoOutlay + opCoOutlay;
              if (totalOutlay > 0) {
                holdCoAllocToPropCo = hDebtDraw * (propCoOutlay / totalOutlay);
                holdCoAllocToOpCo = hDebtDraw * (opCoOutlay / totalOutlay);
              } else {
                holdCoAllocToPropCo = hDebtDraw * 0.5;
                holdCoAllocToOpCo = hDebtDraw * 0.5;
              }
            }
          }
        }

        return {
          ...col,
          pRevenue,
          oRevenueShare,
          pEbitdaVal,
          oEbitdaShare,
          pNetIncome,
          oNetIncomeShare,
          pEbitda,
          oEbitda,
          ltEbitda,
          pTax,
          oTax,
          ltTax,
          ltCfo,
          pLand,
          pHard,
          pSoft,
          pDevGa,
          pDevCar,
          pConInt,
          ltPropCoCapex,
          ltOpCoCapex,
          ltCapex,
          pExit,
          oExit,
          ltExit,
          ltCfi,
          pDebtDraw,
          pDebtPrincipal: pPrincipal,
          pDebtInterest: pCashInterest,
          pCapitalizedInterest,
          pCffPay,
          oDebtDraw,
          oDebtPrincipal: oPrincipal,
          oDebtInterest: oInterest,
          oCffPay,
          holdCoDebtDraw: hDebtDraw,
          holdCoPrincipal: hPrincipal,
          holdCoInterest: hInterest,
          ltDebtDraw,
          ltDebtPrincipal,
          ltDebtInterest,
          ltCffPay,
          partnerPropCoFlow,
          partnerOpCoFlow,
          cumPartnerPropCo,
          cumPartnerOpCo,
          actualHoldCoCf,
          ltCfoCfiCffSum,
          holdCoAdjustment,
          adjPropCo,
          adjOpCo,
          adjOpCoRetained,
          adjOpCoDistributableShare,
          adjOpCoNetIncomeShare,
          adjOpCoNonCash,
          adjOpCoDebt,
          holdCoDistToPropCo,
          holdCoDistToOpCo,
          holdCoAllocToPropCo,
          holdCoAllocToOpCo,
          netIncomeFromPropCo,
          netIncomeFromOpCo,
        };
      });
    }, [rawColumns, opcoData, propcoData, data.annualData]);

    // Pre-calculate exact lookup totals over year columns
    const totals = useMemo(() => {
      let Ebitda = 0,
        Tax = 0,
        Cfo = 0;
      let PropCapex = 0,
        OpCapex = 0,
        Capex = 0,
        Exit = 0,
        Cfi = 0;
      let PDebtDraw = 0,
        PDebtPrincipal = 0,
        PDebtInterest = 0,
        PCapitalizedInterest = 0,
        PCffPay = 0,
        ODebtDraw = 0,
        ODebtPrincipal = 0,
        ODebtInterest = 0,
        OCffPay = 0,
        HDebtDraw = 0,
        HDebtPrincipal = 0,
        HDebtInterest = 0,
        DebtDraw = 0,
        DebtPrincipal = 0,
        DebtInterest = 0,
        CffPay = 0;
      let PartnerPropCo = 0,
        PartnerOpCo = 0;
      let LtCfoCfiCffSum = 0,
        HoldCoAdjustment = 0,
        AdjPropCo = 0,
        AdjOpCo = 0,
        AdjOpCoRetained = 0,
        AdjOpCoDistributableShare = 0,
        AdjOpCoNetIncomeShare = 0,
        AdjOpCoNonCash = 0,
        AdjOpCoDebt = 0;
      let PRevenue = 0,
        ORevenueShare = 0,
        PEbitdaVal = 0,
        OEbitdaShare = 0,
        PNetIncome = 0,
        ONetIncomeShare = 0;
      let PLand = 0,
        PHard = 0,
        PSoft = 0,
        PDevGa = 0,
        PDevCar = 0,
        PConInt = 0,
        PExit = 0,
        OExit = 0;
      let HoldCoDistToPropCo = 0,
        HoldCoDistToOpCo = 0,
        HoldCoAllocToPropCo = 0,
        HoldCoAllocToOpCo = 0,
        NetIncomeFromPropCo = 0,
        NetIncomeFromOpCo = 0;

      columns.forEach((col) => {
        if (col.colType === "year" || (viewResolution === "monthly" && col.colType === "month")) {
          Ebitda += col.ltEbitda || 0;
          Tax += col.ltTax || 0;
          Cfo += col.ltCfo || 0;
          PropCapex += col.ltPropCoCapex || 0;
          OpCapex += col.ltOpCoCapex || 0;
          Capex += col.ltCapex || 0;
          Exit += col.ltExit || 0;
          Cfi += col.ltCfi || 0;
          PDebtDraw += col.pDebtDraw || 0;
          PDebtPrincipal += col.pDebtPrincipal || 0;
          PDebtInterest += col.pDebtInterest || 0;
          PCapitalizedInterest += col.pCapitalizedInterest || 0;
          PCffPay += col.pCffPay || 0;
          ODebtDraw += col.oDebtDraw || 0;
          ODebtPrincipal += col.oDebtPrincipal || 0;
          ODebtInterest += col.oDebtInterest || 0;
          OCffPay += col.oCffPay || 0;
          HDebtDraw += col.holdCoDebtDraw || 0;
          HDebtPrincipal += col.holdCoPrincipal || 0;
          HDebtInterest += col.holdCoInterest || 0;
          DebtDraw += col.ltDebtDraw || 0;
          DebtPrincipal += col.ltDebtPrincipal || 0;
          DebtInterest += col.ltDebtInterest || 0;
          CffPay += col.ltCffPay || 0;
          PartnerPropCo += col.partnerPropCoFlow || 0;
          PartnerOpCo += col.partnerOpCoFlow || 0;
          LtCfoCfiCffSum += col.ltCfoCfiCffSum || 0;
          HoldCoAdjustment += col.holdCoAdjustment || 0;
          AdjPropCo += col.adjPropCo || 0;
          AdjOpCo += col.adjOpCo || 0;
          AdjOpCoRetained += col.adjOpCoRetained || 0;
          AdjOpCoDistributableShare += col.adjOpCoDistributableShare || 0;
          AdjOpCoNetIncomeShare += col.adjOpCoNetIncomeShare || 0;
          AdjOpCoNonCash += col.adjOpCoNonCash || 0;
          AdjOpCoDebt += col.adjOpCoDebt || 0;
          PRevenue += col.pRevenue || 0;
          ORevenueShare += col.oRevenueShare || 0;
          PEbitdaVal += col.pEbitdaVal || 0;
          OEbitdaShare += col.oEbitdaShare || 0;
          PNetIncome += col.pNetIncome || 0;
          ONetIncomeShare += col.oNetIncomeShare || 0;
          PLand += col.pLand || 0;
          PHard += col.pHard || 0;
          PSoft += col.pSoft || 0;
          PDevGa += col.pDevGa || 0;
          PDevCar += col.pDevCar || 0;
          PConInt += col.pConInt || 0;
          PExit += col.pExit || 0;
          OExit += col.oExit || 0;
          HoldCoDistToPropCo += col.holdCoDistToPropCo || 0;
          HoldCoDistToOpCo += col.holdCoDistToOpCo || 0;
          HoldCoAllocToPropCo += col.holdCoAllocToPropCo || 0;
          HoldCoAllocToOpCo += col.holdCoAllocToOpCo || 0;
          NetIncomeFromPropCo += col.netIncomeFromPropCo || 0;
          NetIncomeFromOpCo += col.netIncomeFromOpCo || 0;
        }
      });

      return {
        ltEbitda: Ebitda,
        ltTax: Tax,
        ltCfo: Cfo,
        ltPropCoCapex: PropCapex,
        ltOpCoCapex: OpCapex,
        ltCapex: Capex,
        ltExit: Exit,
        ltCfi: Cfi,
        pDebtDraw: PDebtDraw,
        pDebtPrincipal: PDebtPrincipal,
        pDebtInterest: PDebtInterest,
        pCapitalizedInterest: PCapitalizedInterest,
        pCffPay: PCffPay,
        oDebtDraw: ODebtDraw,
        oDebtPrincipal: ODebtPrincipal,
        oDebtInterest: ODebtInterest,
        oCffPay: OCffPay,
        holdCoDebtDraw: HDebtDraw,
        holdCoPrincipal: HDebtPrincipal,
        holdCoInterest: HDebtInterest,
        ltDebtDraw: DebtDraw,
        ltDebtPrincipal: DebtPrincipal,
        ltDebtInterest: DebtInterest,
        ltCffPay: CffPay,
        partnerPropCo: PartnerPropCo,
        partnerOpCo: PartnerOpCo,
        ltCfoCfiCffSum: LtCfoCfiCffSum,
        holdCoAdjustment: HoldCoAdjustment,
        adjPropCo: AdjPropCo,
        adjOpCo: AdjOpCo,
        adjOpCoRetained: AdjOpCoRetained,
        adjOpCoDistributableShare: AdjOpCoDistributableShare,
        adjOpCoNetIncomeShare: AdjOpCoNetIncomeShare,
        adjOpCoNonCash: AdjOpCoNonCash,
        adjOpCoDebt: AdjOpCoDebt,
        pRevenue: PRevenue,
        oRevenueShare: ORevenueShare,
        pEbitdaVal: PEbitdaVal,
        oEbitdaShare: OEbitdaShare,
        pNetIncome: PNetIncome,
        oNetIncomeShare: ONetIncomeShare,
        pLand: PLand,
        pHard: PHard,
        pSoft: PSoft,
        pDevGa: PDevGa,
        pDevCar: PDevCar,
        pConInt: PConInt,
        pExit: PExit,
        oExit: OExit,
        holdCoDistToPropCo: HoldCoDistToPropCo,
        holdCoDistToOpCo: HoldCoDistToOpCo,
        holdCoAllocToPropCo: HoldCoAllocToPropCo,
        holdCoAllocToOpCo: HoldCoAllocToOpCo,
        netIncomeFromPropCo: NetIncomeFromPropCo,
        netIncomeFromOpCo: NetIncomeFromOpCo,
      };
    }, [columns]);

    const chartData = useMemo(() => {
      let cumInflow = 0;
      let cumOutflow = 0;

      return data.annualData.map((d) => {
        const year = d.year;
        const propCoIn = d.propCoFlow > 0 ? d.propCoFlow : 0;
        const opCoOpIn = d.opCoOperatingFlow > 0 ? d.opCoOperatingFlow : 0;
        const opCoExitIn = d.opCoExitFlow > 0 ? d.opCoExitFlow : 0;
        const yrInflow = propCoIn + opCoOpIn + opCoExitIn;

        const propCoOut = d.propCoFlow < 0 ? Math.abs(d.propCoFlow) : 0;
        const opCoOpOut =
          d.opCoOperatingFlow < 0 ? Math.abs(d.opCoOperatingFlow) : 0;
        const opCoExitOut = d.opCoExitFlow < 0 ? Math.abs(d.opCoExitFlow) : 0;
        const yrOutflow = propCoOut + opCoOpOut + opCoExitOut;

        cumInflow += yrInflow;
        cumOutflow += yrOutflow;

        return {
          year,
          inflow: Number(yrInflow.toFixed(2)),
          outflow: Number(yrOutflow.toFixed(2)),
          cumInflow: Number(cumInflow.toFixed(2)),
          cumOutflow: Number(cumOutflow.toFixed(2)),
          netFlow: Number(d.netFlow.toFixed(2)),
        };
      });
    }, [data.annualData]);

    const stats = useMemo(() => {
      let totalInjections = 0;
      let totalReturns = 0;

      data.annualData.forEach((d) => {
        const propCoIn = d.propCoFlow > 0 ? d.propCoFlow : 0;
        const opCoOpIn = d.opCoOperatingFlow > 0 ? d.opCoOperatingFlow : 0;
        const opCoExitIn = d.opCoExitFlow > 0 ? d.opCoExitFlow : 0;
        totalReturns += propCoIn + opCoOpIn + opCoExitIn;

        const propCoOut = d.propCoFlow < 0 ? Math.abs(d.propCoFlow) : 0;
        const opCoOpOut =
          d.opCoOperatingFlow < 0 ? Math.abs(d.opCoOperatingFlow) : 0;
        const opCoExitOut = d.opCoExitFlow < 0 ? Math.abs(d.opCoExitFlow) : 0;
        totalInjections += propCoOut + opCoOpOut + opCoExitOut;
      });

      const ratio = totalInjections > 0 ? totalReturns / totalInjections : 0;
      const netSurplus = totalReturns - totalInjections;

      return {
        totalInjections,
        totalReturns,
        ratio,
        netSurplus,
      };
    }, [data.annualData]);

    const allExpanded =
      expandedPropCo &&
      expandedOpCo &&
      expandedPropCoDebt &&
      expandedOpCoDebt &&
      expandedRevenue &&
      expandedEbitda &&
      expandedNetIncome &&
      expandedAdj &&
      expandedOpCoAdj;

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
              } bg-[#EFEBE7] ${!col.isOperating ? "text-[#9B8B70]" : "text-[#1E2F31]"} ${col.isMonth ? "min-w-[65px] whitespace-nowrap" : "min-w-[90px]"}`}
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
        className={`space-y-6 ${isFullScreen ? "fixed inset-0 z-[150] bg-[#F9F8F6] p-4 lg:p-6 pb-24 overflow-y-auto flex flex-col" : ""}`}
      >
        {/* Double Table Waterfall Stack */}
        <div
          className={`flex flex-col gap-4 overflow-hidden ${isFullScreen ? "h-full" : "h-[calc(100vh-240px)]"}`}
        >
          <div className="p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8] flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 shrink-0">
            <div className="flex items-center justify-between w-full lg:w-auto">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1E2F31] flex items-center gap-2 min-w-0">
                <List size={14} className="shrink-0" /> <span className="truncate">Look-Through Statement of Cash Flows & Cascade Waterfall</span>
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
              {/* Table Selection Mode */}
              <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm">
                <button
                  onClick={() => setViewMode("all")}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "all" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setViewMode("pnl")}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "pnl" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  title="Look-Through Income Statement (P&L)"
                >
                  P&L
                </button>
                <button
                  onClick={() => setViewMode("statement")}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "statement" ? "bg-[#1E2F31] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  title="Statement of Cash Flows (C&F)"
                >
                  C&F
                </button>
                <button
                  onClick={() => setViewMode("cascade")}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "cascade" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  title="Capital Cascade & Sponsor distributions"
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
                  className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "monthly" ? "bg-[#9B8B70] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                >
                  Monthly
                </button>
              </div>

              <button
                onClick={() => {
                  const newState = !allExpanded;
                  setExpandedPropCo(newState);
                  setExpandedOpCo(newState);
                  setExpandedPropCoDebt(newState);
                  setExpandedOpCoDebt(newState);
                  setExpandedRevenue(newState);
                  setExpandedEbitda(newState);
                  setExpandedNetIncome(newState);
                  setExpandedAdj(newState);
                  setExpandedOpCoAdj(newState);
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-white border border-[#D8D8D8] text-[#4C4A4B] shadow-sm hover:text-[#1E2F31] hover:bg-[#F9F8F6] transition-colors text-[10px] font-bold uppercase tracking-wider"
                title={allExpanded ? "Collapse All Items" : "Expand All Items"}
              >
                {allExpanded ? <ChevronsUpDown size={12} /> : <ChevronsDownUp size={12} />}
                <span className="hidden sm:inline">{allExpanded ? "Collapse" : "Expand"}</span>
              </button>

              <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm">
                <button
                  onClick={() => {
                    const tables =
                      document.querySelectorAll(".cons-table-scroll");
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
                      document.querySelectorAll(".cons-table-scroll");
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
            className={`${viewMode === "all" ? "overflow-y-auto pr-1" : "overflow-y-hidden"} overflow-x-hidden min-h-0 flex-1 space-y-6 bg-[#F9F8F6]`}
          >
            {/* TABLE 1: MANAGERIAL LOOK-THROUGH INCOME STATEMENT (P&L) */}
            {(viewMode === "all" || viewMode === "pnl") && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                <div className="p-4 bg-[#1E2F31] border-b border-[#1E2F31] flex justify-between items-center shrink-0">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    1. Look-Through P&L
                  </h3>
                </div>
                <div
                  className={`custom-scrollbar table-scrollbar-offset relative cons-table-scroll ${viewMode === "all" ? "overflow-x-auto" : "overflow-auto max-h-[calc(100vh-320px)]"}`}
                >
                  <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                    {renderTableHeaders()}
                    <tbody>
                      <TableRow
                        label="Look-Through Combined Revenue"
                        data={columns}
                        dk="lookThroughRevenue"
                        total={data.totals.lookThroughRevenue}
                        isIndent
                        isExpandable
                        isExpanded={expandedRevenue}
                        onExpand={() => setExpandedRevenue(!expandedRevenue)}
                        tooltip={CONSOLIDATED_FORMULAS.lookThroughRevenue}
                      />
                      {expandedRevenue && (
                        <>
                          <TableRow
                            label="PropCo Rental Revenue (100% Share)"
                            data={columns}
                            dk="pRevenue"
                            total={totals.pRevenue}
                            isDoubleIndent
                            hasConnector
                            tooltip="PropCo's 100% direct lease rental revenue"
                          />
                          <TableRow
                            label="OpCo Net Clinical Revenue (49% Share)"
                            data={columns}
                            dk="oRevenueShare"
                            total={totals.oRevenueShare}
                            isDoubleIndent
                            hasConnector
                            tooltip="49% of OpCo's total net clinical operating revenue"
                          />
                        </>
                      )}
                      <TableRow
                        label="Look-Through Combined EBITDA"
                        data={columns}
                        dk="lookThroughEbitda"
                        total={data.totals.lookThroughEbitda}
                        isIndent
                        isExpandable
                        isExpanded={expandedEbitda}
                        onExpand={() => setExpandedEbitda(!expandedEbitda)}
                        tooltip={CONSOLIDATED_FORMULAS.lookThroughEbitda}
                      />
                      {expandedEbitda && (
                        <>
                          <TableRow
                            label="PropCo EBITDA (100% Share)"
                            data={columns}
                            dk="pEbitdaVal"
                            total={totals.pEbitdaVal}
                            isDoubleIndent
                            hasConnector
                          />
                          <TableRow
                            label="OpCo EBITDA (49% Share)"
                            data={columns}
                            dk="oEbitdaShare"
                            total={totals.oEbitdaShare}
                            isDoubleIndent
                            hasConnector
                          />
                        </>
                      )}
                      <TableRow
                        label="Look-Through Combined Net Income"
                        data={columns}
                        dk="lookThroughNetIncome"
                        total={data.totals.lookThroughNetIncome}
                        highlight
                        isExpandable
                        isExpanded={expandedNetIncome}
                        onExpand={() => setExpandedNetIncome(!expandedNetIncome)}
                        tooltip={CONSOLIDATED_FORMULAS.lookThroughNetIncome}
                      />
                      {expandedNetIncome && (
                        <>
                          <TableRow
                            label="PropCo Net Income (100% Share)"
                            data={columns}
                            dk="pNetIncome"
                            total={totals.pNetIncome}
                            isDoubleIndent
                            hasConnector
                          />
                          <TableRow
                            label="OpCo Net Income (49% Share)"
                            data={columns}
                            dk="oNetIncomeShare"
                            total={totals.oNetIncomeShare}
                            isDoubleIndent
                            hasConnector
                          />
                        </>
                      )}
                      <TableRow
                        label="Blended Combined Net Margin (%)"
                        data={columns}
                        dk="lookThroughMargin"
                        total={data.totals.lookThroughMargin}
                        highlight
                        isPercent
                        indigo
                        tooltip={CONSOLIDATED_FORMULAS.lookThroughMargin}
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TABLE 2: ACCOUNTING STANDARD STATEMENT OF CASH FLOWS */}
            {(viewMode === "all" || viewMode === "statement") && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                <div className="p-4 bg-[#1E2F31] border-b border-[#1E2F31] flex justify-between items-center shrink-0">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    2. Look-Through Cash Flows
                  </h3>
                </div>
                <div
                  className={`custom-scrollbar table-scrollbar-offset relative cons-table-scroll ${viewMode === "all" ? "overflow-x-auto" : "overflow-auto max-h-[calc(100vh-320px)]"}`}
                >
                  <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                    {renderTableHeaders()}
                    <tbody>
                      {/* OPERATING CFO */}
                      <TableRow
                        label="1. Cash Flow from Operating Activities"
                        data={columns}
                        isHeader
                      />
                      <TableRow
                        label="Look-Through Combined Operating EBITDA"
                        data={columns}
                        dk="ltEbitda"
                        total={totals.ltEbitda}
                        isIndent
                        tooltip="Combines 100% of PropCo EBITDA and 49% of OpCo operating EBITDA (eliminating internal rents)"
                      />
                      <TableRow
                        label="Less: Corporate Income Taxes Paid"
                        data={columns}
                        dk="ltTax"
                        total={totals.ltTax}
                        isIndent
                        isSubtractor
                        tooltip="PropCo tax + 49% share of clinical OpCo tax"
                      />
                      <TableRow
                        label="Net Cash from Operating Activities (CFO)"
                        data={columns}
                        dk="ltCfo"
                        total={totals.ltCfo}
                        highlight
                        indigo
                        tooltip="Cash surplus generated from pure medical and rental business segments"
                      />

                      {/* INVESTING CFI */}
                      <TableRow
                        label="2. Cash Flow from Investing Activities"
                        data={columns}
                        isHeader
                      />
                      <TableRow
                        label="Look-Through Construction Capex & Setups"
                        data={columns}
                        dk="ltCapex"
                        total={totals.ltCapex}
                        isIndent
                        isSubtractor
                        isExpandable={true}
                        isExpanded={expandedLtCapex}
                        onExpand={() => setExpandedLtCapex(!expandedLtCapex)}
                        tooltip="All PropCo land & hard spend + OpCo setup outlays pro-rated. Click to expand full breakdown."
                      />
                      {expandedLtCapex && (
                        <>
                          {/* PropCo Subgroup */}
                          <TableRow
                            label="PropCo: Development Outlays (100% Share)"
                            data={columns}
                            dk="ltPropCoCapex"
                            total={totals.ltPropCoCapex}
                            isDoubleIndent={true}
                            hasConnector={true}
                            isSubtractor={true}
                            highlight={true}
                            isExpandable={true}
                            isExpanded={expandedPropCoLt}
                            onExpand={() => setExpandedPropCoLt(!expandedPropCoLt)}
                            tooltip="Subtotal of PropCo's land purchase, construction, soft fees, dev G&A, and interest during construction. Click to toggle breakdown."
                          />
                          {expandedPropCoLt && (
                            <>
                              <TableRow
                                label="Land Acquisition & Site Prep"
                                data={columns}
                                dk="pLand"
                                total={totals.pLand}
                                isTripleIndent={true}
                                hasDoubleConnector={true}
                                isSubtractor={true}
                                tooltip="PropCo's Land Acquisition and Site Preparation cost"
                              />
                              <TableRow
                                label="Hard Costs / Construction"
                                data={columns}
                                dk="pHard"
                                total={totals.pHard}
                                isTripleIndent={true}
                                hasDoubleConnector={true}
                                isSubtractor={true}
                                tooltip="Direct Construction and hardware development budgets"
                              />
                              <TableRow
                                label="Soft Costs"
                                data={columns}
                                dk="pSoft"
                                total={totals.pSoft}
                                isTripleIndent={true}
                                hasDoubleConnector={true}
                                isSubtractor={true}
                                tooltip="Design, licenses, engineering fees and soft dev costs"
                              />
                              <TableRow
                                label="Development G&A"
                                data={columns}
                                dk="pDevGa"
                                total={totals.pDevGa}
                                isTripleIndent={true}
                                hasDoubleConnector={true}
                                isSubtractor={true}
                                tooltip="PropCo's Development-phase General & Administrative expense"
                              />
                              <TableRow
                                label="Contractor's All Risk (CAR) Insurance"
                                data={columns}
                                dk="pDevCar"
                                total={totals.pDevCar}
                                isTripleIndent={true}
                                hasDoubleConnector={true}
                                isSubtractor={true}
                                tooltip="Contractor's All Risk construction-phase insurance"
                              />
                              <TableRow
                                label="Capitalized Construction Interest (IDC)"
                                data={columns}
                                dk="pConInt"
                                total={totals.pConInt}
                                isTripleIndent={true}
                                hasDoubleConnector={true}
                                isSubtractor={true}
                                tooltip="Interest During Construction (IDC) capitalized under PSAK 26 (if enabled)"
                              />
                            </>
                          )}

                          {/* OpCo Subgroup */}
                          <TableRow
                            label="OpCo: Pre-Operating Setups (49% Share)"
                            data={columns}
                            dk="ltOpCoCapex"
                            total={totals.ltOpCoCapex}
                            isDoubleIndent={true}
                            hasConnector={true}
                            isSubtractor={true}
                            highlight={true}
                            isExpandable={true}
                            isExpanded={expandedOpCoLt}
                            onExpand={() => setExpandedOpCoLt(!expandedOpCoLt)}
                            tooltip="Subtotal of OpCo's pre-operating setup outlays (pro-rated to HoldCo's 49% share). Click to toggle breakdown."
                          />
                          {expandedOpCoLt && (
                            <TableRow
                              label="Pre-Operating Setup Outlay"
                              data={columns}
                              dk="ltOpCoCapex"
                              total={totals.ltOpCoCapex}
                              isTripleIndent={true}
                              hasDoubleConnector={true}
                              isSubtractor={true}
                              tooltip="OpCo's Pre-Operating setups/pre-operating capital expenditures pro-rated to HoldCo's 49% share"
                            />
                          )}
                        </>
                      )}
                      <TableRow
                        label="Look-Through Capital Disposal / Exit Proceeds"
                        data={columns}
                        dk="ltExit"
                        total={totals.ltExit}
                        isIndent
                        isExpandable={true}
                        isExpanded={expandedLtExit}
                        onExpand={() => setExpandedLtExit(!expandedLtExit)}
                        tooltip="Proceeds from estate and clinical equity buyback liquidation. Click to expand breakdown."
                      />
                      {expandedLtExit && (
                        <>
                          <TableRow
                            label="PropCo Exit Proceeds"
                            data={columns}
                            dk="pExit"
                            total={totals.pExit}
                            isDoubleIndent={true}
                            hasConnector={true}
                            tooltip="PropCo's property, land, or building exit proceeds (100% share)"
                          />
                          <TableRow
                            label="OpCo Exit Proceeds (49% Share)"
                            data={columns}
                            dk="oExit"
                            total={totals.oExit}
                            isDoubleIndent={true}
                            hasConnector={true}
                            tooltip="OpCo's clinical enterprise value disposal or equity buyback pro-rated to HoldCo's 49% share"
                          />
                        </>
                      )}
                      <TableRow
                        label="Net Cash from Investing Activities (CFI)"
                        data={columns}
                        dk="ltCfi"
                        total={totals.ltCfi}
                        highlight
                        indigo
                      />

                      {/* FINANCING CFF */}
                      <TableRow
                        label="3. Cash Flow from Financing Activities"
                        data={columns}
                        isHeader
                      />
                      <TableRow
                        label="PropCo Debt Financing"
                        data={columns}
                        dk="pCffPay"
                        total={totals.pCffPay}
                        isIndent
                        isExpandable
                        isExpanded={expandedPropCoDebt}
                        onExpand={() => setExpandedPropCoDebt(!expandedPropCoDebt)}
                      />
                      {expandedPropCoDebt && (
                        <>
                          <TableRow
                            label="PropCo Debt Drawdown"
                            data={columns}
                            dk="pDebtDraw"
                            total={totals.pDebtDraw}
                            isDoubleIndent
                            tooltip="Debt funding injected to cover property construction spend"
                          />
                          <TableRow
                            label="Less: PropCo Principal Amortization"
                            data={columns}
                            dk="pDebtPrincipal"
                            total={totals.pDebtPrincipal}
                            isDoubleIndent
                            isSubtractor
                          />
                          <TableRow
                            label="Less: PropCo Bank Interest Paid (Cash)"
                            data={columns}
                            dk="pDebtInterest"
                            total={totals.pDebtInterest}
                            isDoubleIndent
                            isSubtractor
                          />
                          <TableRow
                            label="* Capitalized IDC (Non-Cash)"
                            data={columns}
                            dk="pCapitalizedInterest"
                            total={totals.pCapitalizedInterest}
                            isDoubleIndent
                            tooltip="Interest accrued during pre-operations is capitalized into the loan balance, requiring no cash outflow."
                          />
                        </>
                      )}
                      
                      <TableRow
                        label="OpCo Debt Financing"
                        data={columns}
                        dk="oCffPay"
                        total={totals.oCffPay}
                        isIndent
                        isExpandable
                        isExpanded={expandedOpCoDebt}
                        onExpand={() => setExpandedOpCoDebt(!expandedOpCoDebt)}
                      />
                      {expandedOpCoDebt && (
                        <>
                          <TableRow
                            label="OpCo Debt Drawdown"
                            data={columns}
                            dk="oDebtDraw"
                            total={totals.oDebtDraw}
                            isDoubleIndent
                            tooltip="Debt funding injected to cover clinical operations"
                          />
                          <TableRow
                            label="Less: OpCo Principal Amortization"
                            data={columns}
                            dk="oDebtPrincipal"
                            total={totals.oDebtPrincipal}
                            isDoubleIndent
                            isSubtractor
                          />
                          <TableRow
                            label="Less: OpCo Bank Interest Paid"
                            data={columns}
                            dk="oDebtInterest"
                            total={totals.oDebtInterest}
                            isDoubleIndent
                            isSubtractor
                          />
                        </>
                      )}
                      <TableRow
                        label="Net Cash from Financing Activities (CFF)"
                        data={columns}
                        dk="ltCffPay"
                        total={totals.ltCffPay}
                        highlight
                        indigo
                      />

                      {/* RECONCILIATION SUMMARY */}
                      <TableSection
                        title="HOLDCO CASH FLOW RECONCILIATION"
                        colSpan={columns.length + 2}
                        type="emerald"
                      />
                      <TableRow
                        label="Look-Through Proxy Cash Flow (CFO + CFI + CFF)"
                        data={columns}
                        dk="ltCfoCfiCffSum"
                        total={totals.ltCfoCfiCffSum}
                        highlight
                        emerald
                      />
                      <TableRow
                        label="OpCo Retained Earnings & Non-Cash Adjustments"
                        data={columns}
                        dk="holdCoAdjustment"
                        total={totals.holdCoAdjustment}
                        isIndent
                        isExpandable
                        isExpanded={expandedAdj}
                        onExpand={() => setExpandedAdj(!expandedAdj)}
                        tooltip="Reconciles proxy look-through statement with true HoldCo distributable cash by adjusting for OpCo working capital, non-cash depreciation, and earnings retention."
                      />
                      {expandedAdj && (
                        <>
                          <TableRow
                            label="PropCo Timing & Non-Cash Adjustments"
                            data={columns}
                            dk="adjPropCo"
                            total={totals.adjPropCo}
                            isDoubleIndent
                            hasDoubleConnector
                          />
                          <TableRow
                            label="OpCo Retained Earnings & Debt Distributable Adjustment"
                            data={columns}
                            dk="adjOpCo"
                            total={totals.adjOpCo}
                            isDoubleIndent
                            hasDoubleConnector
                            isExpandable
                            isExpanded={expandedOpCoAdj}
                            onExpand={() => setExpandedOpCoAdj(!expandedOpCoAdj)}
                          />
                          {expandedOpCoAdj && (
                            <>
                              <TableRow
                                label="Add: OpCo Distributable Cash Share"
                                data={columns}
                                dk="adjOpCoDistributableShare"
                                total={totals.adjOpCoDistributableShare}
                                isTripleIndent
                                hasTripleConnector
                              />
                              <TableRow
                                label="Less: OpCo Net Income Share"
                                data={columns}
                                dk="adjOpCoNetIncomeShare"
                                total={totals.adjOpCoNetIncomeShare}
                                isTripleIndent
                                hasTripleConnector
                              />
                              <TableRow
                                label="Add / (Less): OpCo Non-Cash & Expense Adjustments"
                                data={columns}
                                dk="adjOpCoNonCash"
                                total={totals.adjOpCoNonCash}
                                isTripleIndent
                                hasTripleConnector
                              />
                              <TableRow
                                label="Add / (Less): OpCo Debt Financing Flows"
                                data={columns}
                                dk="adjOpCoDebt"
                                total={totals.adjOpCoDebt}
                                isTripleIndent
                                hasTripleConnector
                              />
                            </>
                          )}
                        </>
                      )}
                      <TableRow
                        label="NET DISTRIBUTABLE HOLDCO CASH FLOW"
                        data={columns}
                        dk="holdCoCashFlowAfterDebt"
                        total={data.annualData.reduce(
                          (acc, d) => acc + (d.holdCoCashFlowAfterDebt || 0),
                          0,
                        )}
                        highlight
                        emerald
                        bold
                        tooltip="Actual net distributable cash generated at the HoldCo level after all OpCo/PropCo retentions and debt service."
                      />
                      <TableRow
                        label="Consolidated DSCR Cash Buffer"
                        data={columns}
                        dk="dscrBuffer"
                        total={data.annualData.reduce(
                          (acc, d) => acc + (d.dscrBuffer || 0),
                          0,
                        )}
                        tooltip="The monetary variance between total combined cash flow available for debt service and total combined debt service."
                      />
                      <TableRow
                        label="Cumulative Combined Cash Position"
                        data={columns}
                        dk="cumCf"
                        highlight
                        crossover
                        bold
                        indigo
                        tooltip="Aggregated wealth balance after net investment offsets"
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TABLE 3: CAPITAL CASCADE & WATERFALL WATERFALL */}
            {(viewMode === "all" || viewMode === "cascade") && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                <div className="p-4 bg-[#1E2F31] border-b border-[#1E2F31] flex justify-between items-center shrink-0">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    3. Look-Through Cascade & Waterfall
                  </h3>
                </div>
                <div
                  className={`custom-scrollbar table-scrollbar-offset relative cons-table-scroll ${viewMode === "all" ? "overflow-x-auto" : "overflow-auto max-h-[calc(100vh-320px)]"}`}
                >
                  <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                    {renderTableHeaders()}
                    <tbody>
                      <TableRow
                        label="HoldCo Cash Available for Outflows"
                        data={columns}
                        dk="netFlow"
                        total={data.totals.netFlow}
                        highlight
                        emerald
                        isExpandable
                        isExpanded={expandedCashAvailable}
                        onExpand={() => setExpandedCashAvailable(!expandedCashAvailable)}
                      />
                      {expandedCashAvailable && (
                        <>
                          <TableRow
                            label={<span className="italic text-[#1C6048]">↳ Return / Cash Dist. from PropCo (Property)</span>}
                            data={columns}
                            dk="netIncomeFromPropCo"
                            total={totals.netIncomeFromPropCo}
                            isIndent
                            hasConnector
                            tooltip="Operating or exit-level cash flows distributed by PropCo up to HoldCo."
                          />
                          <TableRow
                            label={<span className="italic text-[#1C6048]">↳ Return / Cash Dist. from OpCo (Clinical)</span>}
                            data={columns}
                            dk="netIncomeFromOpCo"
                            total={totals.netIncomeFromOpCo}
                            isIndent
                            hasConnector
                            tooltip="Clinical operations cash distributions paid by OpCo up to HoldCo."
                          />
                          <TableRow
                            label={<span className="italic text-[#9B8B70]">↳ Funding to PropCo (Construction / Land Outlay)</span>}
                            data={columns}
                            dk="holdCoDistToPropCo"
                            total={totals.holdCoDistToPropCo}
                            isIndent
                            hasConnector
                            isSubtractor
                            tooltip="HoldCo cash funding transferred to PropCo to cover development-phase capital deficits."
                          />
                          <TableRow
                            label={<span className="italic text-[#9B8B70]">↳ Funding to OpCo (Clinical Setup Outlay)</span>}
                            data={columns}
                            dk="holdCoDistToOpCo"
                            total={totals.holdCoDistToOpCo}
                            isIndent
                            hasConnector
                            isSubtractor
                            tooltip="HoldCo cash funding transferred to OpCo to cover pre-operating phase clinical setup outlays."
                          />
                        </>
                      )}
                      <TableRow
                        label={<span className="italic text-[#9B8B70]">of which: Pre-Debt Operating Shortfall Equity</span>}
                        data={columns}
                        dk="netFlowShortfall"
                        total={data.totals.netFlowShortfall}
                        isIndent
                        hasConnector
                        tooltip="Equity injected specifically to cover consolidated operating deficits at the HoldCo level."
                      />
                      
                      {holdCoAssumptions?.includeFinancing && (
                        <>
                          <TableRow
                            label="HoldCo Debt Drawdown"
                            data={columns}
                            dk="holdCoDebtDraw"
                            total={totals.holdCoDebtDraw}
                            isIndent
                            isExpandable={totals.holdCoDebtDraw > 0}
                            isExpanded={expandedHoldCo}
                            onExpand={() => setExpandedHoldCo(!expandedHoldCo)}
                          />
                          {expandedHoldCo && (
                            <>
                              <TableRow
                                label={<span className="italic text-[#8A8175]">↳ Distributed to OpCo Equity (Clinical)</span>}
                                data={columns}
                                dk="holdCoAllocToOpCo"
                                total={totals.holdCoAllocToOpCo}
                                isDoubleIndent
                                hasDoubleConnector
                              />
                              <TableRow
                                label={<span className="italic text-[#8A8175]">↳ Distributed to PropCo Equity (Property)</span>}
                                data={columns}
                                dk="holdCoAllocToPropCo"
                                total={totals.holdCoAllocToPropCo}
                                isDoubleIndent
                                hasDoubleConnector
                              />
                            </>
                          )}
                          <TableRow
                            label="HoldCo Interest Expense"
                            data={columns}
                            dk="holdCoInterest"
                            total={
                              data.annualData.reduce(
                                (acc, d) => acc + (d.holdCoInterest || 0),
                                0,
                              )
                            }
                            isIndent
                            isSubtractor
                          />
                          <TableRow
                            label="HoldCo Principal Repayment"
                            data={columns}
                            dk="holdCoPrincipal"
                            total={
                              data.annualData.reduce(
                                (acc, d) => acc + (d.holdCoPrincipal || 0),
                                0,
                              )
                            }
                            isIndent
                            isSubtractor
                          />
                          <TableRow
                            label="HoldCo Debt Balance"
                            data={columns}
                            dk="holdCoDebtBalance"
                            isIndent
                          />
                          <TableRow
                            label="HoldCo Cash Flow (After Debt)"
                            data={columns}
                            dk="holdCoCashFlowAfterDebt"
                            total={data.annualData.reduce(
                              (acc, d) =>
                                acc + (d.holdCoCashFlowAfterDebt || 0),
                              0,
                            )}
                            bold
                            highlight
                          />
                          <TableRow
                            label={<span className="italic text-[#9B8B70]">of which: Post-Debt Operating Shortfall Equity</span>}
                            data={columns}
                            dk="holdCoCashFlowAfterDebtShortfall"
                            total={data.annualData.reduce(
                              (acc, d) =>
                                acc + (d.holdCoCashFlowAfterDebtShortfall || 0),
                              0,
                            )}
                            isIndent
                            hasConnector
                          />
                        </>
                      )}

                      <TableRow
                        label="Sponsor Cascade 1: Real Estate Partner (100% PropCo FCFE)"
                        data={columns}
                        dk="partnerPropCoFlow"
                        total={totals.partnerPropCo}
                        isHeader
                        isExpandable
                        isExpanded={expandedPropCo}
                        onExpand={() => setExpandedPropCo((prev) => !prev)}
                        tooltip={CONSOLIDATED_FORMULAS.propCoFlow}
                      />
                      {expandedPropCo && (
                        <>
                          <TableRow
                            label="PropCo Investment"
                            data={columns}
                            dk="propCoInvestmentFlow"
                            total={data.totals.propCoInvestmentFlow}
                            isIndent
                            hasConnector
                            tooltip={CONSOLIDATED_FORMULAS.propCoInvestmentFlow}
                          />
                          <TableRow
                            label="PropCo Operating FCFE"
                            data={columns}
                            dk="propCoOperatingFlow"
                            total={data.totals.propCoOperatingFlow}
                            isIndent
                            hasConnector
                            tooltip={CONSOLIDATED_FORMULAS.propCoOperatingFlow}
                          />
                          <TableRow
                            label={<span className="italic text-[#9B8B70]">of which: PropCo Operating Shortfall Equity</span>}
                            data={columns}
                            dk="propCoShortfall"
                            total={data.totals.propCoShortfall}
                            isDoubleIndent
                            hasDoubleConnector
                            tooltip="Equity injected specifically to cover operating deficits in the early years."
                          />
                          <TableRow
                            label="PropCo Exit Proceeds"
                            data={columns}
                            dk="propCoExitFlow"
                            total={data.totals.propCoExitFlow}
                            isIndent
                            hasConnector
                            tooltip={CONSOLIDATED_FORMULAS.propCoExitFlow}
                          />
                        </>
                      )}

                      <TableRow
                        label="Sponsor Cascade 2: Clinical Operator (49% OpCo Dividends)"
                        data={columns}
                        dk="partnerOpCoFlow"
                        total={totals.partnerOpCo}
                        isHeader
                        isExpandable
                        isExpanded={expandedOpCo}
                        onExpand={() => setExpandedOpCo((prev) => !prev)}
                        tooltip={CONSOLIDATED_FORMULAS.opCoFlow}
                      />
                      {expandedOpCo && (
                        <>
                          <TableRow
                            label="OpCo Investment"
                            data={columns}
                            dk="opCoInvestmentFlow"
                            total={data.totals.opCoInvestmentFlow}
                            isIndent
                            hasConnector
                            tooltip={CONSOLIDATED_FORMULAS.opCoInvestmentFlow}
                          />
                          <TableRow
                            label="OpCo Operating Dividend"
                            data={columns}
                            dk="opCoOperatingDividendFlow"
                            total={data.totals.opCoOperatingDividendFlow}
                            isIndent
                            hasConnector
                            tooltip={
                              CONSOLIDATED_FORMULAS.opCoOperatingDividendFlow
                            }
                          />
                          <TableRow
                            label="OpCo Exit Proceeds"
                            data={columns}
                            dk="opCoExitFlow"
                            total={data.totals.opCoExitFlow}
                            isIndent
                            hasConnector
                            tooltip={CONSOLIDATED_FORMULAS.opCoExitFlow}
                          />
                        </>
                      )}

                      <TableSection
                        title="CUMULATIVE CASCADE STATUS"
                        colSpan={columns.length + 2}
                      />
                      <TableRow
                        label="Cumulative Real Estate Sponsor Cash Flow"
                        data={columns}
                        dk="cumPartnerPropCo"
                        bold
                      />
                      <TableRow
                        label="Cumulative Clinical Operator Sponsor Cash Flow"
                        data={columns}
                        dk="cumPartnerOpCo"
                        bold
                      />
                      <TableRow
                        label="Cumulative HoldCo Cash Flow"
                        data={columns}
                        dk="cumCf"
                        bold
                        highlight
                      />
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
