export type EntityType =
  | "hospital_opco"
  | "real_estate"
  | "retail_opco"
  | "clinic_opco"
  | "residential"
  | "node_aggregation";

export interface EntityConfig {
  id: string;
  name: string;
  type: EntityType;
  assumptions: any; // Base assumptions for the entity, cast as needed
  aggregateChildren?: string[]; // IDs of children to aggregate if type is node_aggregation
}

export interface EntityModelData {
  id: string;
  type: EntityType;
  annualData: AnnualData[];
  monthly?: MonthlyData;
  totals: EngineTotals;
  metrics?: any;
  [key: string]: any;
}

export interface OpCoAssumptions {
  beds: number;
  alos: number;
  opIpRatio: number;
  borStart: number;
  borMax: number;
  borIncrement: number;
  ipRevenue: number;
  opRevenue: number;
  priceIncYears1_6: number;
  priceIncYears7_plus: number;
  monthlyStaffCost: number;
  staffInf: number;
  ipMedSupply: number;
  opMedSupply: number;
  medSupplyInf: number;
  adminExpRate: number;
  utilExpRate: number;
  mktgExpRate: number;
  operatorFeeRate: number;
  insuranceMonthly: number;
  docFeeIp: number;
  docFeeOp: number;
  rentStructureType: string;
  rentFlatEbitdarRate: number;
  rentRevRate: number;
  rentProfitRate: number;
  rentTier1Rate: number;
  rentTier2Rate: number;
  rentTier3Rate: number;
  rentTier1Limit: number;
  rentTier2Limit: number;
  corporateTax: number;
  partnerAEquity: number;
  partnerBEquity: number;
  jvaOpex: number;
  commOpex: number;
  workingCapitalOpex: number;
  sharingPercentA: number;
  equitySplitY1: number;
  discountRate: number;
  holdCoDiscountRate: number;
  includeTerminalValue: boolean;
  exitYear?: number;
  exitMultiple: number;
  sellingCosts: number;
  dividendPayoutRatio: number;
  devDurationMonths?: number;
  includeFinancing?: boolean;
  ltvRatio?: number;
  interestRate?: number;
  amortizationYears?: number;
  loanTenor?: number;
  ioGracePeriodYears?: number;
  [key: string]: any;
}

export interface PropCoAssumptions {
  linkToOpCo: boolean;
  manualBaseRent: number;
  manualRentEscalation: number;
  includeLand: boolean;
  isLandLeased?: boolean;
  monthlyLandLeaseRateSqm?: number;
  landLeaseTermYears?: number;
  landArea: number;
  landPrice: number;
  buildArea: number;
  buildCost: number;
  includeMedEq: boolean;
  medEqProcurement: string;
  medEqLeaseMonthly: number;
  medEqPurchaseOpYear: number;
  medEqPurchaseAmount: number;
  capexMedEqQty: number;
  capexMedEqPrice: number;
  capexInfraQty: number;
  capexInfraPrice: number;
  includeFFE: boolean;
  capexFFEQty: number;
  capexFFEPrice: number;
  capexSharingDevQty: number;
  capexSharingDevPrice: number;
  capexContingencyPct: number;
  capexConsultantPct: number;
  capexLicensePct: number;
  capexVat: number;
  devDurationMonths: number;
  equityDrawYear1Pct: number;
  devGaMonthly: number;
  devCarPct: number;
  opOverheadMonthly: number;
  opMaintExLandPct?: number;
  opTaxExLandPct?: number;
  opFfeReservePct?: number;
  depMethodBuilding?: string;
  depMethodMedEq?: string;
  depMethodInfra?: string;
  depMethodFFE?: string;
  includeTerminalValue?: boolean;
  exitYear?: number;
  exitMethod?: string;
  exitCapRate?: number;
  exitMultiple?: number;
  sellingCosts?: number;
  corporateTax?: number;
  includeFinancing?: boolean;
  includePreOpInLtv?: boolean;
  drawdownScenario?: string;
  drawdownTranches?: number[];
  repaymentType?: string;
  stepUpPercentages?: number[];
  interestRate?: number;
  ltvRatio?: number;
  amortizationYears?: number;
  dsraMonths?: number;
  discountRate?: number;
  [key: string]: any;
}

export interface MonthlyData {
  [key: string]: number[];
}

export interface AnnualData {
  year: string;
  isOperating: boolean;
  [key: string]: any;
}

export interface EngineTotals {
  [key: string]: number;
}

export interface OpCoModelData {
  annualData: AnnualData[];
  monthly?: MonthlyData;
  totals: EngineTotals;
  irrPartnerA?: number;
  irrPartnerB?: number;
  paybackPartnerA?: number;
  paybackPartnerB?: number;
  npvPartnerA?: number;
  npvPartnerB?: number;
  npvCombined?: number;
  [key: string]: any;
}

export interface PropCoModelData {
  annualData: AnnualData[];
  monthly?: MonthlyData;
  totals: EngineTotals;
  irrProject?: number;
  irrEquity?: number;
  paybackEquity?: number;
  moic?: number;
  peakDebt?: number;
  [key: string]: any;
}

export interface HoldCoAssumptions {
  includeFinancing: boolean;
  ltvRatio: number;
  interestRate: number;
  loanTenor: number;
  ioGracePeriodYears: number;
}

export interface ConsolidatedModelData {
  annualData: AnnualData[];
  totals: EngineTotals;
  irrConsolidated?: number;
  npvConsolidated?: number;
  [key: string]: any;
}

export interface ProjConfig {
  projYears?: number;
  exitYear?: number;
}
