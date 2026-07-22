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
  Building2,
  Stethoscope,
  HeartPulse,
  Scale,
  Link2,
  DollarSign,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
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
  LazyResponsiveContainer,
  TableRow,
  NavButton,
  SettingsHeader,
  SectionTitle,
  ToggleRow,
  AssumptionRow,
  AssumptionRowCalculated,
  AssumptionRowQtyPriceWithToggle,
  AssumptionRowQtyPrice,
  AssumptionDepreciationGroup,
  getInitialStepUpPercentages,
  ensureArray,
  FormattedInput,
} from "../App";

export const OpCoSettingsView = memo(
  ({
    assumptions,
    onChange,
    onSyncEquity,
    onValidate,
    isLocked,
    onToggleLock,
    onSave,
    saveStatus,
    onReset,
    isCloudSync,
    isPresenting,
  }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] p-5 lg:p-8 mb-12 text-xs">
      <SettingsHeader
        title="OpCo Configuration"
        icon={<Settings className="text-[#1C6048]" />}
        onToggleLock={onToggleLock}
        isLocked={isLocked}
        onSave={onSave}
        saveStatus={saveStatus}
        onReset={onReset}
        onValidate={onValidate}
        isCloudSync={isCloudSync}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 grid-flow-dense">
        {/* CARD 1: CLINICAL CORE & CAPACITY */}
        <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col space-y-4">
          <div className="text-[11px] font-black text-[#1E2F31] uppercase tracking-wider border-b border-[#D8D8D8] pb-2.5 flex items-center gap-2">
            <Building2 size={16} className="text-[#1C6048]" />
            <span>Clinical Core & Capacity</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase text-[#1C6048] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                Capacity Metrics
              </div>
              <div className="space-y-1">
                <AssumptionRow
                  label="Total Beds"
                  val={assumptions.beds}
                  set={(v) => onChange("beds", v)}
                  unit="Beds"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Avg Length of Stay"
                  val={assumptions.alos}
                  set={(v) => onChange("alos", v)}
                  unit="Days"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="OP:IP Case Ratio"
                  val={assumptions.opIpRatio}
                  set={(v) => onChange("opIpRatio", v)}
                  unit="X"
                  isLocked={isLocked}
                  tooltip="Ratio of ambulatory/outpatient visits per single inpatient admission. Oncology centers typically experience high ratios (30:1 - 50:1) compared to general hospitals (10:1 - 20:1) due to repetitive daily or weekly cycles of outpatient radiotherapy (LINAC) and chemotherapy sessions."
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase text-[#1C6048] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                Occupancy & Growth
              </div>
              <div className="space-y-1">
                <AssumptionRow
                  label="Starting BOR"
                  val={assumptions.borStart}
                  set={(v) => onChange("borStart", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Max BOR"
                  val={assumptions.borMax}
                  set={(v) => onChange("borMax", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Annual BOR Growth"
                  val={assumptions.borIncrement}
                  set={(v) => onChange("borIncrement", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: REVENUE & CLINICAL COGS */}
        <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col space-y-4">
          <div className="text-[11px] font-black text-[#1E2F31] uppercase tracking-wider border-b border-[#D8D8D8] pb-2.5 flex items-center gap-2">
            <Stethoscope size={16} className="text-[#1C6048]" />
            <span>Revenue & Clinical COGS</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase text-[#1C6048] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                Revenue Tariffs
              </div>
              <div className="space-y-1">
                <AssumptionRow
                  label="Rev/IP Case"
                  val={assumptions.ipRevenue}
                  set={(v) => onChange("ipRevenue", v)}
                  unit="M"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Rev/OP Visit"
                  val={assumptions.opRevenue}
                  set={(v) => onChange("opRevenue", v)}
                  unit="M"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Cross Border Vol."
                  val={assumptions.crossBorderVolume}
                  set={(v) => onChange("crossBorderVolume", v)}
                  unit="p.a."
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Net Qual. Rev"
                  val={assumptions.crossBorderRevenuePerPatient}
                  set={(v) => onChange("crossBorderRevenuePerPatient", v)}
                  unit="M"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Referral Fee Pct"
                  val={assumptions.crossBorderFeePct}
                  set={(v) => onChange("crossBorderFeePct", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Y1-6 Price Incr."
                  val={assumptions.priceIncYears1_6}
                  set={(v) => onChange("priceIncYears1_6", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase text-[#1C6048] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                Supplies & Physician Fee
              </div>
              <div className="space-y-1">
                <AssumptionRow
                  label="Med Supply IP"
                  val={assumptions.ipMedSupply}
                  set={(v) => onChange("ipMedSupply", v)}
                  unit="M"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Med Supply OP"
                  val={assumptions.opMedSupply}
                  set={(v) => onChange("opMedSupply", v)}
                  unit="M"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Doctor Fee IP"
                  val={assumptions.docFeeIp}
                  set={(v) => onChange("docFeeIp", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Doctor Fee OP"
                  val={assumptions.docFeeOp}
                  set={(v) => onChange("docFeeOp", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: OPEX & RENTAL FACILITY STRATEGY */}
        <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col space-y-4 md:col-span-2">
          <div className="text-[11px] font-black text-[#1E2F31] uppercase tracking-wider border-b border-[#D8D8D8] pb-2.5 flex items-center gap-2">
            <Briefcase size={16} className="text-[#1C6048]" />
            <span>OpEx & Rental Facility Strategy</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase text-[#1C6048] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                Staffing & Admin Overheads
              </div>
              <div className="space-y-1">
                <AssumptionRow
                  label="Staff Cost (Mo)"
                  val={assumptions.monthlyStaffCost}
                  set={(v) => onChange("monthlyStaffCost", v)}
                  unit="B"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Staff Inflation"
                  val={assumptions.staffInf}
                  set={(v) => onChange("staffInf", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Admin Rate"
                  val={assumptions.adminExpRate}
                  set={(v) => onChange("adminExpRate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Marketing Rate"
                  val={assumptions.mktgExpRate}
                  set={(v) => onChange("mktgExpRate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Utilities Rate"
                  val={assumptions.utilExpRate}
                  set={(v) => onChange("utilExpRate", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Hospital Operator Fee"
                  val={assumptions.operatorFeeRate}
                  set={(v) => onChange("operatorFeeRate", v)}
                  unit="%"
                  isLocked={isLocked}
                  tooltip="Hospital operator fee rate as a percentage of Net Revenue."
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase text-[#1C6048] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                PropCo Leaseback (Rental Rent-Scheme)
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-[#D8D8D8]/60 space-y-3">
                <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] px-1 rounded transition-colors">
                  <label className="text-[10px] text-[#4C4A4B] font-bold">
                    Rent Scheme Structure
                  </label>
                  <select
                    disabled={isLocked}
                    value={assumptions.rentStructureType}
                    onChange={(e) => onChange("rentStructureType", e.target.value)}
                    className="p-1 bg-[#F9F8F6] border border-[#D8D8D8] rounded text-[9px] font-bold text-[#1E2F31] outline-none cursor-pointer"
                  >
                    <option value="flatEbitdar">Flat EBITDAR %</option>
                    <option value="tiered">Tiered RevPAB</option>
                    <option value="revAndProfit">% Rev + % Profit</option>
                  </select>
                </div>

                {assumptions.rentStructureType === "flatEbitdar" && (
                  <AssumptionRow
                    label="Flat Rent (EBITDAR)"
                    val={assumptions.rentFlatEbitdarRate}
                    set={(v) => onChange("rentFlatEbitdarRate", v)}
                    unit="%"
                    isLocked={isLocked}
                  />
                )}

                {assumptions.rentStructureType === "revAndProfit" && (
                  <div className="space-y-1">
                    <AssumptionRow
                      label="Rent from Net Rev"
                      val={assumptions.rentRevRate}
                      set={(v) => onChange("rentRevRate", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                    <AssumptionRow
                      label="Rent from Profit"
                      val={assumptions.rentProfitRate}
                      set={(v) => onChange("rentProfitRate", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                  </div>
                )}

                {assumptions.rentStructureType === "tiered" && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1 pl-1">
                      <p className="text-[9px] font-bold text-[#1C6048]">
                        RevPAB Thresholds
                      </p>
                      <div className="flex gap-1.5 items-center">
                        <FormattedInput
                          disabled={isLocked}
                          val={assumptions.rentTier1Limit}
                          set={(v) => onChange("rentTier1Limit", v)}
                          className="w-10 p-0.5 text-center text-[8px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-[#F9F8F6]"
                          placeholder="T1"
                        />
                        <span className="text-[8px] font-bold text-[#4C4A4B]">
                          B
                        </span>
                        <FormattedInput
                          disabled={isLocked}
                          val={assumptions.rentTier2Limit}
                          set={(v) => onChange("rentTier2Limit", v)}
                          className="w-10 p-0.5 text-center text-[8px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-[#F9F8F6]"
                          placeholder="T2"
                        />
                        <span className="text-[8px] font-bold text-[#4C4A4B]">
                          B
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <AssumptionRow
                        label={`Tier 1 (<${assumptions.rentTier1Limit}B)`}
                        val={assumptions.rentTier1Rate}
                        set={(v) => onChange("rentTier1Rate", v)}
                        unit="%"
                        isLocked={isLocked}
                      />
                      <AssumptionRow
                        label={`Tier 2 (<${assumptions.rentTier2Limit}B)`}
                        val={assumptions.rentTier2Rate}
                        set={(v) => onChange("rentTier2Rate", v)}
                        unit="%"
                        isLocked={isLocked}
                      />
                      <AssumptionRow
                        label={`Tier 3 (>${assumptions.rentTier2Limit}B)`}
                        val={assumptions.rentTier3Rate}
                        set={(v) => onChange("rentTier3Rate", v)}
                        unit="%"
                        isLocked={isLocked}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: CAPITAL STRUCTURE, SHAREHOLDING & EXIT */}
        <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col space-y-4">
          <div className="text-[11px] font-black text-[#1E2F31] uppercase tracking-wider border-b border-[#D8D8D8] pb-2.5 flex items-center gap-2">
            <Scale size={16} className="text-[#1C6048]" />
            <span>Capital, Shares & Exit Valuation</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase text-[#1C6048] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                Equity Shareholding
              </div>
              <div className="space-y-1">
                <AssumptionRow
                  label="Dividend Payout Ratio"
                  val={assumptions.dividendPayoutRatio ?? 100}
                  set={(v) => onChange("dividendPayoutRatio", v)}
                  unit="%"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Strategic Ptnr Eq."
                  val={assumptions.partnerAEquity}
                  set={(v) => onChange("partnerAEquity", v)}
                  unit="B"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Vasanta Equity"
                  val={assumptions.partnerBEquity}
                  set={(v) => onChange("partnerBEquity", v)}
                  unit="B"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Strategic Ptnr Share"
                  val={assumptions.sharingPercentA}
                  set={(v) => onChange("sharingPercentA", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </div>
              <button
                onClick={onSyncEquity}
                disabled={isLocked}
                className="w-full py-1.5 bg-[#1E2F31] text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow hover:opacity-90 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Link2 size={12} /> Align Equity
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase text-[#1C6048] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                Hurdles & Valuation Exit
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <AssumptionRow
                    label="OpCo Disc. Rate"
                    val={assumptions.discountRate}
                    set={(v) => onChange("discountRate", v)}
                    unit="%"
                    isLocked={isLocked}
                  />
                  <AssumptionRow
                    label="HoldCo Disc. Rate"
                    val={assumptions.holdCoDiscountRate}
                    set={(v) => onChange("holdCoDiscountRate", v)}
                    unit="%"
                    isLocked={isLocked}
                  />
                </div>
                
                <ToggleRow
                  label="Include Exit in Yr 10"
                  desc="Enable valuation liquidity."
                  checked={assumptions.includeTerminalValue}
                  onChange={(v) => onChange("includeTerminalValue", v)}
                  isLocked={isLocked}
                />

                {assumptions.includeTerminalValue && (
                  <div className="space-y-1 bg-white p-2.5 rounded-xl border border-[#D8D8D8]/40">
                    <AssumptionRow
                      label="Exit Year"
                      val={assumptions.exitYear || 10}
                      set={(v) => onChange("exitYear", v)}
                      isLocked={isLocked}
                      min={1}
                      max={30}
                    />
                    <AssumptionRow
                      label="Exit Multiple"
                      val={assumptions.exitMultiple}
                      set={(v) => onChange("exitMultiple", v)}
                      unit="x"
                      isLocked={isLocked}
                    />

                    <AssumptionRow
                      label="Selling Costs"
                      val={assumptions.sellingCosts}
                      set={(v) => onChange("sellingCosts", v)}
                      unit="%"
                      isLocked={isLocked}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: OPCO DEBT FINANCING */}
        <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col space-y-4">
          <div className="text-[11px] font-black text-[#1E2F31] uppercase tracking-wider border-b border-[#D8D8D8] pb-2.5 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#1C6048]" />
            <span>OpCo Debt Financing</span>
          </div>
          <div className="flex flex-col space-y-3 justify-between h-full">
            <div className="space-y-3">
              <div className="text-[9px] font-black uppercase text-[#1C6048] tracking-widest mb-1.5 pb-1 border-b border-[#D8D8D8]/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                Debt Parameters
              </div>

              <ToggleRow
                label="Enable OpCo Debt Financing"
                desc="Apply leverage model to capital structure."
                checked={assumptions.includeFinancing || false}
                onChange={(v) => onChange("includeFinancing", v)}
                isLocked={isLocked}
              />

              {assumptions.includeFinancing && (
                <div className="space-y-1 bg-white p-3 rounded-xl border border-[#D8D8D8]/40">
                  <AssumptionRow
                    label="LTV Ratio"
                    val={assumptions.ltvRatio}
                    set={(v) => onChange("ltvRatio", v)}
                    unit="%"
                    isLocked={isLocked}
                  />
                  <AssumptionRow
                    label="Interest Rate"
                    val={assumptions.interestRate}
                    set={(v) => onChange("interestRate", v)}
                    unit="%"
                    isLocked={isLocked}
                  />
                  <AssumptionRow
                    label="Loan Tenor"
                    val={assumptions.loanTenor}
                    set={(v) => onChange("loanTenor", v)}
                    unit="Yrs"
                    isLocked={isLocked}
                  />
                  <AssumptionRow
                    label="I/O Grace Period"
                    val={assumptions.ioGracePeriodYears}
                    set={(v) => onChange("ioGracePeriodYears", v)}
                    unit="Yrs"
                    isLocked={isLocked}
                  />
                </div>
              )}
            </div>
            
            {!assumptions.includeFinancing && (
              <div className="p-4 bg-white/50 border border-dashed border-[#D8D8D8] rounded-xl flex items-center justify-center text-center text-[10px] text-[#4C4A4B] font-medium h-24">
                Toggle leverage to configure LTV, tenure, grace periods, and amortization curves.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ),
);
