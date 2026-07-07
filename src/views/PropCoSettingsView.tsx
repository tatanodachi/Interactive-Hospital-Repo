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
  Link2,
  Landmark,
  Plus,
  Trash2,
  DollarSign,
  Map,
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
} from "../App";

export const PropCoSettingsView = memo(
  ({
    assumptions,
    data,
    onChange,
    isLocked,
    onToggleLock,
    onSave,
    saveStatus,
    onReset,
    onValidate,
    isCloudSync,
    isPresenting,
    resolvedDevDuration,
  }) => {
    const buildCostForUi =
      (assumptions.buildArea * assumptions.buildCost) / 1000;
    const medEqFullValueUi = assumptions.includeMedEq
      ? (assumptions.capexMedEqQty * assumptions.capexMedEqPrice) / 1000
      : 0;
    const medEqCostForUi =
      (assumptions.medEqProcurement || "lease_operating") === "lease_operating"
        ? 0
        : medEqFullValueUi;
    const infraCostForUi =
      (assumptions.capexInfraQty * assumptions.capexInfraPrice) / 1000;
    const ffeCostForUi = assumptions.includeFFE
      ? (assumptions.capexFFEQty * assumptions.capexFFEPrice) / 1000
      : 0;
    const sharingDevCostForUi =
      (assumptions.capexSharingDevQty * assumptions.capexSharingDevPrice) /
      1000;
    const consultantBaseUi =
      buildCostForUi + ffeCostForUi + infraCostForUi + medEqFullValueUi;
    const licenseBaseUi = consultantBaseUi;

    const consultantCostUi =
      consultantBaseUi * ((assumptions.capexConsultantPct || 0) / 100);
    const licenseCostUi =
      licenseBaseUi * ((assumptions.capexLicensePct || 0) / 100);
    const vatBaseUi =
      consultantCostUi +
      buildCostForUi +
      ffeCostForUi +
      infraCostForUi +
      medEqCostForUi +
      sharingDevCostForUi;
    const vatCostUi = vatBaseUi * ((assumptions.capexVat || 0) / 100);
    const contingencyBaseUi =
      licenseCostUi +
      consultantCostUi +
      buildCostForUi +
      medEqCostForUi +
      ffeCostForUi +
      infraCostForUi +
      sharingDevCostForUi +
      vatCostUi;
    const contingencyCostUi =
      contingencyBaseUi * ((assumptions.capexContingencyPct || 0) / 100);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] p-5 lg:p-8 mb-12 text-xs">
        <SettingsHeader
          title="PropCo Configuration"
          icon={<Settings className="text-[#9B8B70]" />}
          onToggleLock={onToggleLock}
          isLocked={isLocked}
          onSave={onSave}
          saveStatus={saveStatus}
          onReset={onReset}
          onValidate={onValidate}
          isCloudSync={isCloudSync}
        />

        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-10 ${isPresenting ? "lg:grid-cols-4 2xl:grid-cols-5" : "lg:grid-cols-3"}`}
        >
          <div className="space-y-4">
            <SectionTitle
              title="Asset Linking"
              icon={<Link2 size={16} />}
              color="indigo"
            />
            <ToggleRow
              label="Link Rent to OpCo"
              desc="Use OpCo building rent expense."
              checked={assumptions.linkToOpCo}
              onChange={(v) => onChange("linkToOpCo", v)}
              isLocked={isLocked}
            />
            {!assumptions.linkToOpCo && (
              <>
                <AssumptionRow
                  label="Manual Base Rent Y1"
                  val={assumptions.manualBaseRent}
                  set={(v) => onChange("manualBaseRent", v)}
                  unit="B"
                  isLocked={isLocked}
                />
                <AssumptionRow
                  label="Rent Escalation/Yr"
                  val={assumptions.manualRentEscalation}
                  set={(v) => onChange("manualRentEscalation", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </>
            )}
          </div>
          <div className="space-y-4">
            <SectionTitle
              title="Land & Construction"
              icon={<Map size={16} />}
              color="emerald"
            />
            <ToggleRow
              label="Include Land Cost"
              desc="Calculate Land Acquisition."
              checked={
                (assumptions.includeLand ?? true) && !assumptions.isLandLeased
              }
              onChange={(v) => onChange("includeLand", v)}
              isLocked={isLocked || assumptions.isLandLeased}
            />
            <ToggleRow
              label="Lease Land Instead of Buy"
              desc="Use a Ground Lease model."
              checked={assumptions.isLandLeased || false}
              onChange={(v) => onChange("isLandLeased", v)}
              isLocked={isLocked}
            />
            <div
              className={
                !(assumptions.includeLand ?? true) && !assumptions.isLandLeased
                  ? "opacity-50 pointer-events-none"
                  : ""
              }
            >
              <AssumptionRow
                label="Land Area"
                val={assumptions.landArea}
                set={(v) => onChange("landArea", v)}
                unit="Sqm"
                isLocked={isLocked}
              />
              {!assumptions.isLandLeased ? (
                <AssumptionRow
                  label="Land Purchase Price"
                  val={assumptions.landPrice}
                  set={(v) => onChange("landPrice", v)}
                  unit="M/Sqm"
                  isLocked={isLocked}
                />
              ) : (
                <>
                  <AssumptionRow
                    label="Ground Lease Rate"
                    val={assumptions.monthlyLandLeaseRateSqm || 45000}
                    set={(v) => onChange("monthlyLandLeaseRateSqm", v)}
                    unit="/Sqm/Mo"
                    isLocked={isLocked}
                    tooltip="Starts at base rate and dynamically increments at the specified percentage and period (e.g. 5% every 5 years)."
                  />
                  <AssumptionRow
                    label="Lease Rate Increment"
                    val={assumptions.landLeaseIncrementPct !== undefined ? assumptions.landLeaseIncrementPct : 5}
                    set={(v) => onChange("landLeaseIncrementPct", v)}
                    unit="%"
                    isLocked={isLocked}
                    tooltip="The percentage rate escalation for each adjustment period (e.g., 5%)."
                  />
                  <AssumptionRow
                    label="Lease Increment Period"
                    val={assumptions.landLeaseIncrementYears || 5}
                    set={(v) => onChange("landLeaseIncrementYears", v)}
                    unit="Yrs"
                    isLocked={isLocked}
                    tooltip="Number of years between lease rate adjustments (e.g., every 5 years)."
                  />
                  <AssumptionRow
                    label="Lease Term"
                    val={assumptions.landLeaseTermYears || 15}
                    set={(v) => onChange("landLeaseTermYears", v)}
                    unit="Yrs"
                    isLocked={isLocked}
                  />
                </>
              )}
            </div>
            <AssumptionRow
              label="Building Area"
              val={assumptions.buildArea}
              set={(v) => onChange("buildArea", v)}
              unit="Sqm"
              isLocked={isLocked}
            />
            <AssumptionRow
              label="Construction Cost"
              val={assumptions.buildCost}
              set={(v) => onChange("buildCost", v)}
              unit="M/Sqm"
              isLocked={isLocked}
            />
            <AssumptionRow
              label="Year 1 Capex Draw"
              val={assumptions.equityDrawYear1Pct ?? 100}
              set={(v) =>
                onChange(
                  "equityDrawYear1Pct",
                  Math.min(100, Math.max(0, parseFloat(v) || 0)),
                )
              }
              unit="%"
              isLocked={isLocked || resolvedDevDuration <= 12}
            />
          </div>
          <div className="space-y-4">
            <SectionTitle
              title="Other Capex & VAT"
              icon={<Calculator size={16} />}
              color="rose"
            />
            <AssumptionRowCalculated
              label="Consultant"
              pctVal={assumptions.capexConsultantPct}
              setPct={(v) => onChange("capexConsultantPct", v)}
              calculatedVal={consultantCostUi}
              isLocked={isLocked}
            />
            <AssumptionRowCalculated
              label="License/Permit"
              pctVal={assumptions.capexLicensePct}
              setPct={(v) => onChange("capexLicensePct", v)}
              calculatedVal={licenseCostUi}
              isLocked={isLocked}
            />
            <AssumptionRowQtyPriceWithToggle
              label="Medical Equip."
              qtyVal={assumptions.capexMedEqQty}
              priceVal={assumptions.capexMedEqPrice}
              setQty={(v) => onChange("capexMedEqQty", v)}
              setPrice={(v) => onChange("capexMedEqPrice", v)}
              checked={assumptions.includeMedEq}
              onToggle={(v) => onChange("includeMedEq", v)}
              isLocked={isLocked}
            />

            {assumptions.includeMedEq && (
              <div className="pl-3 pr-1 py-2 bg-[#F9F8F6] border-b border-[#D8D8D8] space-y-2 rounded-lg ml-2 border-l-2 border-l-[#1C6048]">
                <div className="flex justify-between items-center group">
                  <label className="text-[10px] text-[#4C4A4B] font-bold">
                    Strategy
                  </label>
                  <div className="flex items-center gap-0.5 bg-[#D8D8D8] rounded p-0.5">
                    <button
                      disabled={isLocked}
                      onClick={() => onChange("medEqProcurement", "buy")}
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed ${(assumptions.medEqProcurement || "lease_operating") !== "lease" && (assumptions.medEqProcurement || "lease_operating") !== "lease_operating" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
                    >
                      Buy
                    </button>
                    <button
                      disabled={isLocked}
                      onClick={() => onChange("medEqProcurement", "lease")}
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed ${assumptions.medEqProcurement === "lease" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
                    >
                      Lease-to-Own
                    </button>
                    <button
                      disabled={isLocked}
                      onClick={() =>
                        onChange("medEqProcurement", "lease_operating")
                      }
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed ${(assumptions.medEqProcurement || "lease_operating") === "lease_operating" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
                    >
                      Pure Lease
                    </button>
                  </div>
                </div>
                {((assumptions.medEqProcurement || "lease_operating") ===
                  "lease" ||
                  (assumptions.medEqProcurement || "lease_operating") ===
                    "lease_operating") && (
                  <>
                    <AssumptionRow
                      label="Lease Cost (Mo)"
                      val={assumptions.medEqLeaseMonthly}
                      set={(v) => onChange("medEqLeaseMonthly", v)}
                      unit="B"
                      isLocked={isLocked}
                    />
                    {assumptions.medEqProcurement === "lease" && (
                      <>
                        <AssumptionRow
                          label="Purchase Year (Op)"
                          val={assumptions.medEqPurchaseOpYear}
                          set={(v) => onChange("medEqPurchaseOpYear", v)}
                          unit="Yr"
                          isLocked={isLocked}
                        />
                        <div className="flex justify-between items-center bg-[#EFEBE7] p-2 rounded">
                          <span className="text-[10px] uppercase font-bold text-[#8A8175] mr-2">
                            Purchase Amount
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#1E2F31]">
                              {formatNumber(medEqCostForUi * 1000, 0)}
                            </span>
                            <span className="text-[10px] text-[#8A8175] font-bold">
                              M
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    {(assumptions.medEqProcurement || "lease_operating") ===
                      "lease_operating" && (
                      <>
                        <AssumptionRow
                          label="Lease Escalation"
                          val={assumptions.medEqLeaseEscalationPct !== undefined ? assumptions.medEqLeaseEscalationPct : 5}
                          set={(v) => onChange("medEqLeaseEscalationPct", v)}
                          unit="%"
                          isLocked={isLocked}
                        />
                        <AssumptionRow
                          label="Escalation Step"
                          val={assumptions.medEqLeaseEscalationYears || 3}
                          set={(v) => onChange("medEqLeaseEscalationYears", v)}
                          unit="Yrs"
                          isLocked={isLocked}
                        />
                        <div className="bg-[#1C6048]/5 p-2 rounded border border-[#1C6048]/20 text-[9px] text-[#1C6048] font-bold italic text-center">
                          Pure operating lease (indefinite lease) with zero buyout
                          capex. Escalates by {assumptions.medEqLeaseEscalationPct !== undefined ? assumptions.medEqLeaseEscalationPct : 5}% every {assumptions.medEqLeaseEscalationYears || 3} years.
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            <AssumptionRowQtyPriceWithToggle
              label="FF&E"
              qtyVal={assumptions.capexFFEQty}
              priceVal={assumptions.capexFFEPrice}
              setQty={(v) => onChange("capexFFEQty", v)}
              setPrice={(v) => onChange("capexFFEPrice", v)}
              checked={assumptions.includeFFE}
              onToggle={(v) => onChange("includeFFE", v)}
              isLocked={isLocked}
            />
            <AssumptionRowQtyPrice
              label="Infrastructure"
              qtyVal={assumptions.capexInfraQty}
              priceVal={assumptions.capexInfraPrice}
              setQty={(v) => onChange("capexInfraQty", v)}
              setPrice={(v) => onChange("capexInfraPrice", v)}
              isLocked={isLocked}
            />
            <AssumptionRowQtyPrice
              label="Sharing Dev."
              qtyVal={assumptions.capexSharingDevQty}
              priceVal={assumptions.capexSharingDevPrice}
              setQty={(v) => onChange("capexSharingDevQty", v)}
              setPrice={(v) => onChange("capexSharingDevPrice", v)}
              isLocked={isLocked}
            />
            <AssumptionRowCalculated
              label="Capex VAT"
              pctVal={assumptions.capexVat}
              setPct={(v) => onChange("capexVat", v)}
              calculatedVal={vatCostUi}
              isLocked={isLocked}
            />
            <AssumptionRowCalculated
              label="Contingency"
              pctVal={assumptions.capexContingencyPct}
              setPct={(v) => onChange("capexContingencyPct", v)}
              calculatedVal={contingencyCostUi}
              isLocked={isLocked}
            />
          </div>
          <div className="space-y-4">
            <SectionTitle
              title="Financing Structure"
              icon={<Landmark size={16} />}
              color="blue"
            />
            <ToggleRow
              label="Include Debt Financing"
              desc="Use bank loan for construction."
              checked={assumptions?.includeFinancing || false}
              onChange={(v) => onChange("includeFinancing", v)}
              isLocked={isLocked}
            />
            {assumptions?.includeFinancing && (
              <>
                <div id="propco-idc-treatment-selector" className="bg-[#F9F8F6] p-4 border border-[#D8D8D8] rounded-[16px] mb-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#1C6048] tracking-wider block">
                        IDC Treatment (Construction Interest)
                      </span>
                      <span className="text-[9px] text-[#4C4A4B] font-medium font-mono">
                        Select Interest During Construction (IDC) payment and accounting treatment
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 bg-[#D8D8D8]/55 p-1 rounded-xl">
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => onChange("idcTreatment", "cash_pay")}
                      className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 ${(assumptions.idcTreatment || "cash_pay") === "cash_pay" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    >
                      Cash-Pay (PSAK 26)
                    </button>
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => onChange("idcTreatment", "capitalized_loan")}
                      className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 ${(assumptions.idcTreatment || "cash_pay") === "capitalized_loan" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    >
                      Capitalized to Loan
                    </button>
                  </div>
                  <p className="text-[9px] text-[#4C4A4B] leading-snug font-medium">
                    {(assumptions.idcTreatment || "cash_pay") === "cash_pay"
                      ? "Interest during construction is paid monthly in cash using equity, and capitalized as part of the building qualifying asset cost under PSAK 26 (Biaya Pinjaman)."
                      : "Interest during construction is capitalized (rolled) into the loan principal, increasing the outstanding bank loan balance with no up-front cash outflows."}
                  </p>
                </div>

                <ToggleRow
                  label="Include Pre-Op in Debt Sizing"
                  desc="Base LTV on Capex inclusive of Pre-Op Costs (Dev G&A, CAR)."
                  checked={assumptions.includePreOpInLtv ?? true}
                  onChange={(v) => onChange("includePreOpInLtv", v)}
                  isLocked={isLocked}
                />
                <ToggleRow
                  label="Include Land in Debt Sizing"
                  desc="Base LTV on Capex inclusive of Land Purchase cost (PropCo Land)."
                  checked={assumptions.includeLandInLtv ?? false}
                  onChange={(v) => onChange("includeLandInLtv", v)}
                  isLocked={isLocked}
                />
                <div className="flex justify-between items-center bg-[#EFEBE7] p-2 rounded mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8A8175] mr-2">
                      Debt Calculation Basis
                    </span>
                    <p className="text-[8px] text-[#8A8175]/80 font-medium leading-tight mt-0.5">
                      {(assumptions.includePreOpInLtv ?? true)
                        ? (assumptions.includeLandInLtv ? "LTV applies to all upfront capex (including land)" : "LTV applies to all non-land capex")
                        : (assumptions.includeLandInLtv ? "LTV applies to capex including land but excluding pre-op costs" : "LTV applies to capex excluding land & pre-op costs")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#1E2F31]">
                      {formatNumber(data?.metrics?.debtSizingBase || 0, 1)}
                    </span>
                    <span className="text-[10px] text-[#8A8175] font-bold">
                      B
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-white p-2 border border-[#D8D8D8] rounded mb-2 shadow-sm">
                  <label className="text-[10px] font-bold uppercase text-[#4C4A4B]">
                    Drawdown Scenario
                  </label>
                  <div className="flex items-center gap-0.5 bg-[#D8D8D8] rounded p-0.5">
                    <button
                      disabled={isLocked}
                      onClick={() => onChange("drawdownScenario", "monthly")}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed ${assumptions.drawdownScenario === "monthly" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
                    >
                      Monthly Basis
                    </button>
                    <button
                      disabled={isLocked}
                      onClick={() => onChange("drawdownScenario", "tranches")}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed ${(assumptions.drawdownScenario || "tranches") === "tranches" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
                    >
                      Tranche-Based
                    </button>
                  </div>
                </div>

                {(assumptions.drawdownScenario || "tranches") ===
                  "tranches" && (
                  <div className="bg-white p-2 border border-[#D8D8D8] rounded mb-2 shadow-sm space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold uppercase text-[#4C4A4B]">
                        Drawdown Tranches (%)
                      </label>
                      <button
                        disabled={isLocked}
                        onClick={() => {
                          const newT = [
                            ...(assumptions.drawdownTranches || [
                              20, 40, 60, 80, 100,
                            ]),
                          ];
                          newT.push(100);
                          onChange("drawdownTranches", newT);
                        }}
                        className="text-[10px] font-bold text-[#1C6048] hover:underline flex items-center"
                      >
                        <Plus className="w-3 h-3 mr-0.5" /> Add
                      </button>
                    </div>
                    <p className="text-[8px] text-[#8A8175]/80 font-medium leading-tight mb-2">
                      Set construction progress thresholds at which debt is
                      evenly drawn.
                    </p>
                    <div className="space-y-1">
                      {(
                        assumptions.drawdownTranches || [20, 40, 60, 80, 100]
                      ).map((tranche, idx, arr) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-[#8A8175] w-12 shrink-0">
                            Tranche {idx + 1}
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={tranche}
                            disabled={isLocked || idx === arr.length - 1}
                            onChange={(e) => {
                              const newT = [...arr];
                              newT[idx] = parseFloat(e.target.value) || 0;
                              onChange("drawdownTranches", newT);
                            }}
                            className="flex-1 px-1.5 py-0.5 text-[10px] border border-[#D8D8D8] rounded font-mono font-medium outline-none focus:border-[#1C6048] disabled:opacity-50"
                          />
                          <span className="text-[9px] font-bold text-[#8A8175]">
                            %
                          </span>
                          <button
                            disabled={
                              isLocked ||
                              idx === arr.length - 1 ||
                              arr.length <= 1
                            }
                            onClick={() => {
                              const newT = arr.filter((_, i) => i !== idx);
                              onChange("drawdownTranches", newT);
                            }}
                            className="p-0.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <AssumptionRow
              label="Loan To Value (LTV)"
              val={assumptions.ltv}
              set={(v) => onChange("ltv", v)}
              unit="%"
              isLocked={isLocked || !assumptions?.includeFinancing}
            />
            <AssumptionRow
              label="Interest Rate"
              val={assumptions.interestRate}
              set={(v) => onChange("interestRate", v)}
              unit="%"
              isLocked={isLocked || !assumptions?.includeFinancing}
            />
            <AssumptionRow
              label="Loan Tenor"
              val={assumptions.loanTenor}
              set={(v) => onChange("loanTenor", v)}
              unit="Yrs"
              isLocked={isLocked || !assumptions?.includeFinancing}
            />
            <AssumptionRow
              label="IO Grace Period"
              val={assumptions.ioGracePeriodYears}
              set={(v) => onChange("ioGracePeriodYears", v)}
              unit="Yrs"
              isLocked={isLocked || !assumptions?.includeFinancing}
            />
            {assumptions?.includeFinancing &&
              (() => {
                const amortYears = Math.max(
                  1,
                  (assumptions.loanTenor || 15) -
                    (assumptions.ioGracePeriodYears || 2),
                );
                return (
                  <div
                    id="propco-amortization-scheme"
                    className="bg-[#F9F8F6] p-4 border border-[#D8D8D8] rounded-[16px] mt-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-[#1C6048] tracking-wider block">
                            Amortization Scheme
                          </span>
                          {isLocked && (
                            <span className="text-[8px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              Locked
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-[#4C4A4B] font-medium font-mono">
                          {isLocked
                            ? 'Click "Unlock" at top-right of section to edit'
                            : "Select how the principal loan balance is repaid over time"}
                        </span>
                      </div>
                    </div>

                    {/* Repayment Type Tabs */}
                    <div className="grid grid-cols-2 gap-1 bg-[#D8D8D8]/55 p-1 rounded-xl">
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => onChange("repaymentType", "standard")}
                        className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 ${(assumptions.repaymentType || "standard") === "standard" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                      >
                        Standard Sinking Fund
                      </button>
                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => {
                          const resolvedP = getInitialStepUpPercentages(
                            amortYears,
                            "tangerang_stepup",
                          );
                          onChange({
                            repaymentType: "step_up",
                            stepUpPercentages: resolvedP,
                          });
                        }}
                        className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 ${(assumptions.repaymentType || "standard") === "step_up" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                      >
                        Step-Up / Tranche Repayment
                      </button>
                    </div>

                    {(assumptions.repaymentType || "standard") ===
                      "step_up" && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                        {/* Presets and Status Block */}
                        <div className="p-3 bg-white border border-[#D8D8D8] rounded-2xl flex flex-col gap-2 shadow-sm">
                          <div className="flex justify-between items-center text-[10px] font-bold text-[#4C4A4B]">
                            <span>SCHEDULING PRESETS</span>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                disabled={isLocked}
                                onClick={() => {
                                  const resolvedP = getInitialStepUpPercentages(
                                    amortYears,
                                    "tangerang_stepup",
                                  );
                                  onChange("stepUpPercentages", resolvedP);
                                }}
                                className="px-2 py-0.5 bg-[#EFEBE7] hover:bg-[#D8D8D8]/80 disabled:hover:bg-[#EFEBE7] border border-[#D8D8D8] text-[9px] font-black text-[#1C6048] rounded-[6px] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Step-Up
                              </button>
                              <button
                                type="button"
                                disabled={isLocked}
                                onClick={() => {
                                  const resolvedP = getInitialStepUpPercentages(
                                    amortYears,
                                    "equal",
                                  );
                                  onChange("stepUpPercentages", resolvedP);
                                }}
                                className="px-2 py-0.5 bg-[#EFEBE7] hover:bg-[#D8D8D8]/80 disabled:hover:bg-[#EFEBE7] border border-[#D8D8D8] text-[9px] font-black text-[#1C6048] rounded-[6px] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Equal Division
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1 border-t border-[#D8D8D8] mt-1 text-[9px] font-bold text-[#4C4A4B]">
                            <span>ALLOCATED PRINCIPAL SUM</span>
                            {(() => {
                              const resolvedP = ensureArray(
                                assumptions.stepUpPercentages,
                              );
                              let pList = [...resolvedP];
                              if (pList.length !== amortYears) {
                                pList = getInitialStepUpPercentages(
                                  amortYears,
                                  "tangerang_stepup",
                                );
                              }
                              const pSum = pList.reduce((sum, v) => sum + v, 0);
                              const isFullyAllocated =
                                Math.abs(pSum - 100) < 0.05;
                              return (
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded font-mono font-black ${isFullyAllocated ? "bg-[#1C6048]/10 text-[#1C6048]" : "bg-amber-500/10 text-amber-600 animate-pulse"}`}
                                  >
                                    {pSum.toFixed(2)}% / 100%
                                  </span>
                                  {!isFullyAllocated && (
                                    <button
                                      type="button"
                                      disabled={isLocked}
                                      onClick={() => {
                                        const sumVal = pSum;
                                        if (sumVal === 0) {
                                          const eq =
                                            getInitialStepUpPercentages(
                                              amortYears,
                                              "equal",
                                            );
                                          onChange("stepUpPercentages", eq);
                                        } else {
                                          const factor = 100 / sumVal;
                                          const norm = pList.map((v) =>
                                            parseFloat((v * factor).toFixed(2)),
                                          );
                                          const diff =
                                            100 -
                                            norm.reduce((a, b) => a + b, 0);
                                          if (Math.abs(diff) > 0.001) {
                                            norm[norm.length - 1] = parseFloat(
                                              (
                                                norm[norm.length - 1] + diff
                                              ).toFixed(2),
                                            );
                                          }
                                          onChange("stepUpPercentages", norm);
                                        }
                                      }}
                                      className="text-[9px] font-black bg-amber-500 hover:bg-amber-600 text-white px-2 py-0.5 rounded-[6px] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Auto-Balance
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Step-Up Year-by-Year Sliders List */}
                        <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2 border border-[#D8D8D8] rounded-[16px] p-2 bg-white">
                          {(() => {
                            const resolvedP = ensureArray(
                              assumptions.stepUpPercentages,
                            );
                            let pList = [...resolvedP];
                            if (pList.length !== amortYears) {
                              pList = getInitialStepUpPercentages(
                                amortYears,
                                "tangerang_stepup",
                              );
                            }

                            return pList.map((val, idx) => {
                              const opYearNum =
                                idx + 1 + (assumptions.ioGracePeriodYears || 2);
                              return (
                                <div
                                  key={idx}
                                  className="flex flex-col gap-1.5 p-2 hover:bg-[#F9F8F6]/40 rounded-xl border border-transparent hover:border-[#D8D8D8] transition-all"
                                >
                                  <div className="flex justify-between items-center text-[10px] font-bold text-[#1E2F31]">
                                    <span className="flex items-center gap-1.5 font-mono">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                                      Amortization Year {idx + 1}
                                      <span className="text-[8px] font-medium text-[#8A8175] font-sans">
                                        (Op. Year {opYearNum} / calendar{" "}
                                        {2025 + opYearNum})
                                      </span>
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={val}
                                        disabled={isLocked}
                                        onChange={(e) => {
                                          const newval = Math.max(
                                            0,
                                            Math.min(
                                              100,
                                              parseFloat(e.target.value) || 0,
                                            ),
                                          );
                                          const nextP = [...pList];
                                          nextP[idx] = parseFloat(
                                            newval.toFixed(2),
                                          );
                                          onChange("stepUpPercentages", nextP);
                                        }}
                                        className="w-12 px-1 py-0.5 text-right font-mono text-[10px] border border-[#D8D8D8] rounded focus:border-[#1C6048] outline-none disabled:bg-[#F9F8F6] disabled:text-[#8A8175] disabled:cursor-not-allowed"
                                      />
                                      <span className="text-[9px] font-bold text-[#8A8175]">
                                        %
                                      </span>
                                    </div>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={val}
                                    disabled={isLocked}
                                    onChange={(e) => {
                                      const newVal = parseFloat(e.target.value);
                                      const nextP = [...pList];
                                      nextP[idx] = parseFloat(
                                        newVal.toFixed(2),
                                      );
                                      onChange("stepUpPercentages", nextP);
                                    }}
                                    className="w-full h-2.5 md:h-2 bg-[#D8D8D8] rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 accent-[#1C6048] outline-none transition-all my-1.5 py-0.5 focus:ring-1 focus:ring-[#1C6048]"
                                  />
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            <AssumptionRow
              label="Discount Rate"
              val={assumptions.discountRate}
              set={(v) => onChange("discountRate", v)}
              unit="%"
              isLocked={isLocked}
            />
          </div>
          <div className="space-y-4">
            <SectionTitle
              title="Depreciation (D&A)"
              icon={<Calculator size={16} />}
              color="teal"
            />
            <AssumptionDepreciationGroup
              label="Building"
              methodVal={assumptions.depMethodBuilding}
              lifeVal={assumptions.depLifeBuilding}
              setMethod={(v) => onChange("depMethodBuilding", v)}
              setLife={(v) => onChange("depLifeBuilding", v)}
              isLocked={isLocked}
            />
            <AssumptionDepreciationGroup
              label="Infrastructure"
              methodVal={assumptions.depMethodInfra}
              lifeVal={assumptions.depLifeInfra}
              setMethod={(v) => onChange("depMethodInfra", v)}
              setLife={(v) => onChange("depLifeInfra", v)}
              isLocked={isLocked}
            />
            <AssumptionDepreciationGroup
              label="Med. Equip."
              methodVal={assumptions.depMethodMedEq}
              lifeVal={assumptions.depLifeMedEq}
              setMethod={(v) => onChange("depMethodMedEq", v)}
              setLife={(v) => onChange("depLifeMedEq", v)}
              isLocked={isLocked}
            />
            <AssumptionDepreciationGroup
              label="FF&E"
              methodVal={assumptions.depMethodFFE}
              lifeVal={assumptions.depLifeFFE}
              setMethod={(v) => onChange("depMethodFFE", v)}
              setLife={(v) => onChange("depLifeFFE", v)}
              isLocked={isLocked}
            />
            <AssumptionDepreciationGroup
              label="Soft Cost Amort."
              methodVal={assumptions.depMethodSoftCost}
              lifeVal={assumptions.depLifeSoftCost}
              setMethod={(v) => onChange("depMethodSoftCost", v)}
              setLife={(v) => onChange("depLifeSoftCost", v)}
              isLocked={isLocked}
            />
          </div>
          <div className="space-y-4">
            <SectionTitle
              title="Operating Expenses"
              icon={<Briefcase size={16} />}
              color="rose"
            />
            <AssumptionRow
              label="Maintenance Rate"
              val={assumptions.maintRate}
              set={(v) => onChange("maintRate", v)}
              unit="%"
              isLocked={isLocked}
            />
            <AssumptionRow
              label="Property Tax Rate"
              val={assumptions.propTaxRate}
              set={(v) => onChange("propTaxRate", v)}
              unit="%"
              isLocked={isLocked}
            />
            <AssumptionRow
              label="Dev. G&A (monthly)"
              val={assumptions.devGaMonthly}
              set={(v) => onChange("devGaMonthly", v)}
              unit="B/Mo"
              isLocked={isLocked}
            />
            <AssumptionRow
              label="Dev. CAR (% of build)"
              val={assumptions.devCarPct}
              set={(v) => onChange("devCarPct", v)}
              unit="% Total"
              isLocked={isLocked}
            />
            <AssumptionRow
              label="Op. Overhead"
              val={assumptions.opOverheadMonthly}
              set={(v) => onChange("opOverheadMonthly", v)}
              unit="B/Mo"
              isLocked={isLocked}
            />
            <AssumptionRow
              label="Overhead Incr."
              val={assumptions.opOverheadInc}
              set={(v) => onChange("opOverheadInc", v)}
              unit="%"
              isLocked={isLocked}
            />
            <AssumptionRow
              label="FF&E Reserve"
              val={assumptions.ffeReservePct}
              set={(v) => onChange("ffeReservePct", v)}
              unit="%"
              isLocked={isLocked}
            />
            <AssumptionRow
              label="Corporate Tax"
              val={assumptions.corporateTax}
              set={(v) => onChange("corporateTax", v)}
              unit="%"
              isLocked={isLocked}
            />
          </div>
          <div className="space-y-4">
            <SectionTitle
              title="Terminal Value (Exit)"
              icon={<DollarSign size={16} />}
              color="amber"
            />
            <ToggleRow
              label="Include Exit in Yr 10"
              desc="Calculate Terminal Value."
              checked={assumptions.includeTerminalValue}
              onChange={(v) => onChange("includeTerminalValue", v)}
              isLocked={isLocked}
            />
            {assumptions.includeTerminalValue && (
              <>
                <AssumptionRow
                  label="Exit Year"
                  val={assumptions.exitYear || 10}
                  set={(v) => onChange("exitYear", v)}
                  isLocked={isLocked}
                  min={1}
                  max={30}
                />
                <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded transition-colors">
                  <label className="text-[10px] text-[#4C4A4B] font-bold">
                    Valuation Method
                  </label>
                  <div className="flex items-center bg-[#D8D8D8] rounded p-0.5">
                    <button
                      disabled={isLocked || assumptions.isLandLeased}
                      onClick={() => onChange("exitMethod", "capRate")}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${assumptions.exitMethod !== "multiple" && assumptions.exitMethod !== "dcf" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    >
                      Cap Rate
                    </button>
                    <button
                      disabled={isLocked || assumptions.isLandLeased}
                      onClick={() => onChange("exitMethod", "multiple")}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${assumptions.exitMethod === "multiple" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    >
                      EV/EBITDA
                    </button>
                    <button
                      disabled={isLocked || !assumptions.isLandLeased}
                      onClick={() => onChange("exitMethod", "dcf")}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${assumptions.exitMethod === "dcf" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    >
                      Remaining Lease DCF
                    </button>
                  </div>
                </div>
                {assumptions.exitMethod === "multiple" ? (
                  <AssumptionRow
                    label="Exit Multiple"
                    val={assumptions.exitMultiple}
                    set={(v) => onChange("exitMultiple", v)}
                    unit="x"
                    isLocked={isLocked}
                  />
                ) : assumptions.exitMethod === "dcf" ? (
                  <div className="py-2 px-1 text-[10px] text-[#4C4A4B] bg-[#1E2F31]/5 rounded border border-[#D8D8D8] text-center">
                    Values discounted at {assumptions.discountRate}% (Project Discount Rate) over remaining lease term.
                  </div>
                ) : (
                  <AssumptionRow
                    label="Exit Cap Rate"
                    val={assumptions.exitCapRate}
                    set={(v) => onChange("exitCapRate", v)}
                    unit="%"
                    isLocked={isLocked}
                  />
                )}
                <AssumptionRow
                  label="Selling Costs"
                  val={assumptions.sellingCosts}
                  set={(v) => onChange("sellingCosts", v)}
                  unit="%"
                  isLocked={isLocked}
                />
              </>
            )}
          </div>

          {/* NEW EQUIPMENT LIST TABLE COLUMN */}
          <div className="space-y-4 lg:col-span-2">
            <SectionTitle
              title="Medical Equipment Breakdown"
              icon={<Activity size={16} />}
              color="indigo"
            />
            <div className="bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-[#EFEBE7] border-b border-[#D8D8D8]">
                  <tr>
                    <th className="px-3 py-2 font-bold text-[#1E2F31]">
                      Category / Item
                    </th>
                    <th className="px-3 py-2 font-bold text-[#1E2F31] text-center">
                      Qty
                    </th>
                    <th className="px-3 py-2 font-bold text-[#1E2F31] text-right">
                      Est. Unit (B)
                    </th>
                    <th className="px-3 py-2 font-bold text-[#1E2F31] text-right">
                      Total (B)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {assumptions.includeMedEq ? (
                    <>
                      <tr className="border-b border-[#EFEBE7] hover:bg-[#F9F8F6]">
                        <td className="px-3 py-2 font-bold text-[#4C4A4B]">
                          Diagnostic Imaging (MRI & CT)
                        </td>
                        <td className="px-3 py-2 text-center text-[#4C4A4B]">
                          2
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          12.5
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          25.0
                        </td>
                      </tr>
                      <tr className="border-b border-[#EFEBE7] hover:bg-[#F9F8F6]">
                        <td className="px-3 py-2 font-bold text-[#4C4A4B]">
                          PET-CT Scanner (Oncology Staging)
                        </td>
                        <td className="px-3 py-2 text-center text-[#4C4A4B]">
                          1
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          20.0
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          20.0
                        </td>
                      </tr>
                      <tr className="border-b border-[#EFEBE7] hover:bg-[#F9F8F6]">
                        <td className="px-3 py-2 font-bold text-[#4C4A4B]">
                          LINAC (Radiotherapy Systems)
                        </td>
                        <td className="px-3 py-2 text-center text-[#4C4A4B]">
                          1
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          25.0
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          25.0
                        </td>
                      </tr>
                      <tr className="border-b border-[#EFEBE7] hover:bg-[#F9F8F6]">
                        <td className="px-3 py-2 font-bold text-[#4C4A4B]">
                          Brachytherapy & Dosimetry QA
                        </td>
                        <td className="px-3 py-2 text-center text-[#4C4A4B]">
                          1
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          10.0
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          10.0
                        </td>
                      </tr>
                      <tr className="border-b border-[#EFEBE7] hover:bg-[#F9F8F6]">
                        <td className="px-3 py-2 font-bold text-[#4C4A4B]">
                          Cath Lab & Angiography Systems
                        </td>
                        <td className="px-3 py-2 text-center text-[#4C4A4B]">
                          1
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          22.0
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          22.0
                        </td>
                      </tr>
                      <tr className="border-b border-[#EFEBE7] hover:bg-[#F9F8F6]">
                        <td className="px-3 py-2 font-bold text-[#4C4A4B]">
                          Operating Room (OR) Subsystems
                        </td>
                        <td className="px-3 py-2 text-center text-[#4C4A4B]">
                          6
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          3.0
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          18.0
                        </td>
                      </tr>
                      <tr className="border-b border-[#EFEBE7] hover:bg-[#F9F8F6]">
                        <td className="px-3 py-2 font-bold text-[#4C4A4B]">
                          Radiology (X-Ray / USG / Mammo)
                        </td>
                        <td className="px-3 py-2 text-center text-[#4C4A4B]">
                          8
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          1.25
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          10.0
                        </td>
                      </tr>
                      <tr className="border-b border-[#EFEBE7] hover:bg-[#F9F8F6]">
                        <td className="px-3 py-2 font-bold text-[#4C4A4B]">
                          Chemo Prep & General Medical
                        </td>
                        <td className="px-3 py-2 text-center text-[#4C4A4B]">
                          Lot
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          12.0
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          12.0
                        </td>
                      </tr>
                      <tr className="border-b border-[#EFEBE7] hover:bg-[#F9F8F6]">
                        <td className="px-3 py-2 font-bold text-[#4C4A4B]">
                          Health Information Systems & IT
                        </td>
                        <td className="px-3 py-2 text-center text-[#4C4A4B]">
                          Lot
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          8.0
                        </td>
                        <td className="px-3 py-2 text-right text-[#4C4A4B]">
                          8.0
                        </td>
                      </tr>
                      <tr className="bg-[#EFEBE7]/50 font-black relative group">
                        <td
                          className="px-3 py-3 text-[#1C6048] uppercase tracking-widest text-xs"
                          colSpan={3}
                        >
                          <div className="flex items-center gap-2">
                            Total Medical Equipment Budget
                            {assumptions.medEqProcurement === "lease" && (
                              <span className="px-2 py-0.5 bg-[#9B8B70] text-white text-[9px] rounded-full uppercase tracking-wider">
                                Leased (Informational)
                              </span>
                            )}
                            {(assumptions.medEqProcurement ||
                              "lease_operating") === "lease_operating" && (
                              <span className="px-2 py-0.5 bg-[#9B8B70] text-white text-[9px] rounded-full uppercase tracking-wider">
                                Pure Lease (Informational)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-[#1C6048] text-xs">
                          {(
                            (assumptions.capexMedEqQty *
                              assumptions.capexMedEqPrice) /
                            1000
                          ).toFixed(1)}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-6 text-center text-[#9B8B70] italic"
                      >
                        Medical Equipment is excluded in current assumptions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
