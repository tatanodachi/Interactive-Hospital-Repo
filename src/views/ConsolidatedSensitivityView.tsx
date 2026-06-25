import React, { memo, useState, useMemo } from "react";
import {
  Layers,
  Grid,
  AlertTriangle,
  Percent,
  Info,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  formatCurrency,
  formatNumber,
  LazyResponsiveContainer,
  TOOLTIP_STYLE,
  LEGEND_STYLE,
} from "../App";
import {
  runOpCoEngine,
  runPropCoEngine,
  runConsolidatedEngine,
} from "../financialEngine";

interface ScenarioPreset {
  name: string;
  id: string;
  description: string;
  borStart: number; // offset relative to base
  borMax: number;   // offset relative to base
  borIncrement: number; // offset relative to base
  badgeColor: string;
}

const PRESETS: ScenarioPreset[] = [
  {
    name: "Target Baseline",
    id: "baseline",
    description: "Primary base case with planned ramp-up and high stabilized occupancy.",
    borStart: 0,
    borMax: 0,
    borIncrement: 0,
    badgeColor: "bg-[#1C6048]/10 text-[#1C6048] border border-[#1C6048]/20",
  },
  {
    name: "Slower Occupancy Ramp-Up",
    id: "slower_ramp",
    description: "Slower local adoption. Occupancy increment rate drops by 2% p.a.",
    borStart: -5,
    borMax: 0,
    borIncrement: -2,
    badgeColor: "bg-amber-50 text-amber-800 border border-amber-200",
  },
  {
    name: "Delayed & Lower Cap Scenario",
    id: "lower_cap",
    description: "Simulates competitor entry. Stabilized ceiling drops 10%; ramp delayed.",
    borStart: -10,
    borMax: -10,
    borIncrement: -3,
    badgeColor: "bg-orange-50 text-orange-800 border border-orange-200",
  },
  {
    name: "Severe Stress Case",
    id: "severe_stress",
    description: "Hospital fails to gain momentum. Start is low; increment is sluggish.",
    borStart: -15,
    borMax: -15,
    borIncrement: -4,
    badgeColor: "bg-red-50 text-red-800 border border-red-200",
  },
  {
    name: "High Performance Peak",
    id: "high_growth",
    description: "Heavy referral flow. High initial lift and rapid stabilized occupancy.",
    borStart: 5,
    borMax: 10,
    borIncrement: 2,
    badgeColor: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  },
];

export const ConsolidatedSensitivityView = memo(
  ({
    opCoAssumptions,
    propCoAssumptions,
    holdCoAssumptions,
    resolvedDevDuration,
    projConfig,
    groups,
  }: any) => {
    const [selectedPresetId, setSelectedPresetId] = useState("baseline");
    const [matrixMetric, setMatrixMetric] = useState<"irr" | "npv" | "cash">("irr");

    const currentPreset = useMemo(() => {
      return PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
    }, [selectedPresetId]);

    // Compute Base Case (Baseline)
    const baselineOpCo = useMemo(() => {
      return runOpCoEngine(
        { ...opCoAssumptions, devDurationMonths: resolvedDevDuration },
        projConfig
      );
    }, [opCoAssumptions, resolvedDevDuration, projConfig]);

    const baselinePropCo = useMemo(() => {
      return runPropCoEngine(
        { ...propCoAssumptions, devDurationMonths: resolvedDevDuration },
        baselineOpCo,
        projConfig,
        groups
      );
    }, [propCoAssumptions, baselineOpCo, projConfig, groups, resolvedDevDuration]);

    const baselineConsolidated = useMemo(() => {
      return runConsolidatedEngine(
        baselineOpCo,
        baselinePropCo,
        opCoAssumptions,
        holdCoAssumptions
      );
    }, [baselineOpCo, baselinePropCo, opCoAssumptions, holdCoAssumptions]);

    // Compute Selected Preset Case
    const presetOpCoAssumptions = useMemo(() => {
      if (selectedPresetId === "baseline") return opCoAssumptions;
      return {
        ...opCoAssumptions,
        borStart: Math.max(10, Math.min(95, opCoAssumptions.borStart + currentPreset.borStart)),
        borMax: Math.max(20, Math.min(100, opCoAssumptions.borMax + currentPreset.borMax)),
        borIncrement: Math.max(1, Math.min(25, opCoAssumptions.borIncrement + currentPreset.borIncrement)),
      };
    }, [opCoAssumptions, currentPreset, selectedPresetId]);

    const presetOpCo = useMemo(() => {
      return runOpCoEngine(
        { ...presetOpCoAssumptions, devDurationMonths: resolvedDevDuration },
        projConfig
      );
    }, [presetOpCoAssumptions, resolvedDevDuration, projConfig]);

    const presetPropCo = useMemo(() => {
      return runPropCoEngine(
        { ...propCoAssumptions, devDurationMonths: resolvedDevDuration },
        presetOpCo,
        projConfig,
        groups
      );
    }, [propCoAssumptions, presetOpCo, projConfig, groups, resolvedDevDuration]);

    const presetConsolidated = useMemo(() => {
      return runConsolidatedEngine(
        presetOpCo,
        presetPropCo,
        presetOpCoAssumptions,
        holdCoAssumptions
      );
    }, [presetOpCo, presetPropCo, presetOpCoAssumptions, holdCoAssumptions]);

    // Chart data comparison
    const chartData = useMemo(() => {
      return baselineConsolidated.annualData.map((bData, idx) => {
        const pData = presetConsolidated.annualData[idx] || {};
        return {
          year: bData.year,
          "Baseline Cash Flow": Math.round((bData.holdCoCashFlowAfterDebt || 0) * 10) / 10,
          "Scenario Cash Flow": Math.round((pData.holdCoCashFlowAfterDebt || 0) * 10) / 10,
        };
      });
    }, [baselineConsolidated, presetConsolidated]);

    // 2D Matrix calculations
    const borMaxSteps = useMemo(() => {
      const base = opCoAssumptions.borMax;
      return [
        Math.max(30, base - 15),
        Math.max(35, base - 10),
        Math.max(40, base - 5),
        base,
        Math.min(95, base + 5),
        Math.min(100, base + 10),
      ];
    }, [opCoAssumptions.borMax]);

    const borIncrementSteps = useMemo(() => {
      const base = opCoAssumptions.borIncrement;
      return [
        Math.max(1, base - 3),
        Math.max(2, base - 2),
        Math.max(3, base - 1),
        base,
        Math.min(15, base + 1),
        Math.min(20, base + 2),
        Math.min(25, base + 3),
      ];
    }, [opCoAssumptions.borIncrement]);

    const matrixData = useMemo(() => {
      return borMaxSteps.map((maxBor) => {
        return borIncrementSteps.map((inc) => {
          const tempOpCo = runOpCoEngine(
            {
              ...opCoAssumptions,
              borMax: maxBor,
              borIncrement: inc,
              devDurationMonths: resolvedDevDuration,
            },
            projConfig
          );
          const tempPropCo = runPropCoEngine(
            { ...propCoAssumptions, devDurationMonths: resolvedDevDuration },
            tempOpCo,
            projConfig,
            groups
          );
          const tempCons = runConsolidatedEngine(
            tempOpCo,
            tempPropCo,
            opCoAssumptions,
            holdCoAssumptions
          );

          if (matrixMetric === "irr") {
            return (tempCons.metrics.irr || 0) * 100;
          } else if (matrixMetric === "npv") {
            return tempCons.metrics.npv || 0;
          } else {
            return tempCons.totals.holdCoCashFlowAfterDebt || 0;
          }
        });
      });
    }, [
      borMaxSteps,
      borIncrementSteps,
      opCoAssumptions,
      propCoAssumptions,
      holdCoAssumptions,
      resolvedDevDuration,
      projConfig,
      groups,
      matrixMetric,
    ]);

    // Heatmap color generator
    const getCellColor = (val: number, min: number, max: number) => {
      if (val === 0 || isNaN(val)) return "bg-[#9B8B70] text-white";
      const ratio = max === min ? 0.5 : (val - min) / (max - min);
      if (matrixMetric === "irr") {
        if (val < 10) return "bg-red-50 text-red-900 border border-red-200/30";
        if (val < 15) return "bg-amber-50 text-amber-900 border border-amber-200/30";
        if (val < 20) return "bg-[#99B6AA]/30 text-[#1E2F31] border border-[#99B6AA]/40";
        return "bg-[#1C6048] text-white";
      } else {
        if (ratio > 0.7) return "bg-[#1C6048] text-white";
        if (ratio > 0.35) return "bg-[#99B6AA]/30 text-[#1E2F31] border border-[#99B6AA]/40";
        return "bg-red-50 text-red-900 border border-red-200/30";
      }
    };

    const flatMatrix = matrixData.flat().filter((v) => !isNaN(v));
    const matrixMin = flatMatrix.length > 0 ? Math.min(...flatMatrix) : 0;
    const matrixMax = flatMatrix.length > 0 ? Math.max(...flatMatrix) : 0;

    return (
      <div className="space-y-4 animate-in fade-in">
        {/* Sleek Toolbar Header */}
        <div className="p-3 bg-gradient-to-r from-[#1E2F31] to-[#1C6048] rounded-xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[8.5px] bg-[#EFEBE7]/15 border border-[#EFEBE7]/25 px-2 py-0.5 rounded font-black uppercase tracking-wider text-[#E6D3AF]">
                HoldCo Sensitivity
              </span>
              <span className="text-[9.5px] text-[#EFEBE7]/70 font-mono">
                Beds: <strong className="text-white">{opCoAssumptions.beds}</strong> | Base Max BOR: <strong className="text-white">{opCoAssumptions.borMax}%</strong> | Increment: <strong className="text-white">{opCoAssumptions.borIncrement}% p.a.</strong>
              </span>
            </div>
            <h1 className="text-sm font-black tracking-tight mt-0.5">
              Bed Occupancy Rate &amp; Ramp-Up Scenario Modeler
            </h1>
          </div>
          <p className="text-[9.5px] text-[#EFEBE7]/80 max-w-md leading-relaxed">
            Assess consolidated yields under stress parameters. Under performing cases help map exact tipping points for debt and return thresholds.
          </p>
        </div>

        {/* Option 1 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Preset Selector */}
          <div className="lg:col-span-5 bg-white p-3.5 rounded-xl shadow-sm border border-[#D8D8D8] flex flex-col justify-between">
            <div className="mb-2">
              <h2 className="text-xs font-black text-[#1E2F31] flex items-center gap-1.5 uppercase tracking-wide">
                <Layers size={14} className="text-[#1C6048]" /> Preset Risk Scenarios
              </h2>
              <p className="text-[9.5px] text-[#4C4A4B] font-medium mt-0.5">
                Apply standardized market stress factors.
              </p>
            </div>

            {/* Elegant Dropdown implementation to optimize space */}
            <div className="space-y-2 flex-grow flex flex-col justify-center">
              <div>
                <label htmlFor="preset-select" className="block text-[9px] font-black text-[#4C4A4B] uppercase tracking-wider mb-1">
                  Active Scenario Preset
                </label>
                <select
                  id="preset-select"
                  value={selectedPresetId}
                  onChange={(e) => setSelectedPresetId(e.target.value)}
                  className="w-full text-xs font-bold text-[#1E2F31] bg-[#F9F8F6] border border-[#D8D8D8] rounded-lg p-2 focus:ring-1 focus:ring-[#1C6048] focus:border-[#1C6048] outline-none transition-all cursor-pointer"
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.id === "baseline" ? "(Baseline)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Preset Details Display */}
              <div className="p-3 bg-[#F9F8F6]/80 border border-[#D8D8D8]/70 rounded-lg space-y-2 flex-grow flex flex-col justify-between min-h-[90px]">
                <div>
                  <div className="flex justify-between items-center gap-1.5">
                    <span className="text-[10px] font-black text-[#1E2F31] uppercase tracking-wider">
                      Scenario Parameters
                    </span>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider ${currentPreset.badgeColor}`}>
                      {currentPreset.id === "baseline" ? "Base" : "Shock"}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-[#4C4A4B] mt-1 leading-normal font-medium">
                    {currentPreset.description}
                  </p>
                </div>

                {currentPreset.id !== "baseline" ? (
                  <div className="pt-2 border-t border-[#D8D8D8]/40 grid grid-cols-3 gap-2 text-[8.5px] font-mono text-[#4C4A4B]">
                    <div>
                      <span className="block text-[7.5px] text-gray-400 uppercase font-sans font-bold">Start BOR</span>
                      <strong className="text-[#1E2F31] text-[9.5px]">{currentPreset.borStart > 0 ? `+${currentPreset.borStart}` : currentPreset.borStart}%</strong>
                    </div>
                    <div>
                      <span className="block text-[7.5px] text-gray-400 uppercase font-sans font-bold">Max BOR</span>
                      <strong className="text-[#1E2F31] text-[9.5px]">{currentPreset.borMax > 0 ? `+${currentPreset.borMax}` : currentPreset.borMax}%</strong>
                    </div>
                    <div>
                      <span className="block text-[7.5px] text-gray-400 uppercase font-sans font-bold">Ramp Rate</span>
                      <strong className="text-[#1E2F31] text-[9.5px]">{currentPreset.borIncrement > 0 ? `+${currentPreset.borIncrement}` : currentPreset.borIncrement}% p.a.</strong>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[#D8D8D8]/40 text-[8.5px] text-gray-400 italic">
                    All assumptions correspond to the primary baseline values.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preset Visual Impact Comparisons */}
          <div className="lg:col-span-7 bg-white p-3.5 rounded-xl shadow-sm border border-[#D8D8D8] flex flex-col justify-between">
            <div className="mb-2">
              <h2 className="text-xs font-black text-[#1E2F31] flex items-center gap-1.5 uppercase tracking-wide">
                <TrendingUp size={14} className="text-[#1C6048]" /> Combined Financial Impact
              </h2>
              <p className="text-[9.5px] text-[#4C4A4B] font-medium mt-0.5">
                Comparison of HoldCo indicators versus target underwriting baseline.
              </p>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {/* IRR card */}
              <div className="p-2 bg-[#EFEBE7]/30 border border-[#D8D8D8]/70 rounded-lg flex flex-col justify-between">
                <span className="text-[8.5px] font-bold text-[#4C4A4B] uppercase tracking-wider flex items-center gap-0.5">
                  <Percent size={10} className="text-[#1C6048]" /> Combined IRR
                </span>
                <div className="mt-1">
                  <div className="text-sm font-black text-[#1E2F31] font-mono">
                    {formatNumber((presetConsolidated.metrics.irr || 0) * 100, 2)}%
                  </div>
                  <div className="text-[8px] font-mono text-[#4C4A4B]">
                    Base: {formatNumber((baselineConsolidated.metrics.irr || 0) * 100, 2)}%
                  </div>
                </div>
                <div className={`mt-1 text-[8.5px] font-black font-mono ${
                  (presetConsolidated.metrics.irr || 0) >= (baselineConsolidated.metrics.irr || 0)
                    ? "text-[#1C6048]"
                    : "text-red-700"
                }`}>
                  {(presetConsolidated.metrics.irr || 0) >= (baselineConsolidated.metrics.irr || 0) ? "+" : ""}
                  {formatNumber(((presetConsolidated.metrics.irr || 0) - (baselineConsolidated.metrics.irr || 0)) * 100, 2)}% Delta
                </div>
              </div>

              {/* NPV card */}
              <div className="p-2 bg-[#EFEBE7]/30 border border-[#D8D8D8]/70 rounded-lg flex flex-col justify-between">
                <span className="text-[8.5px] font-bold text-[#4C4A4B] uppercase tracking-wider flex items-center gap-0.5">
                  <ArrowUpRight size={10} className="text-[#9B8B70]" /> Combined NPV
                </span>
                <div className="mt-1">
                  <div className="text-sm font-black text-[#1E2F31] font-mono">
                    {formatCurrency(presetConsolidated.metrics.npv)}
                  </div>
                  <div className="text-[8px] font-mono text-[#4C4A4B]">
                    Base: {formatCurrency(baselineConsolidated.metrics.npv)}
                  </div>
                </div>
                <div className={`mt-1 text-[8.5px] font-black font-mono ${
                  (presetConsolidated.metrics.npv || 0) >= (baselineConsolidated.metrics.npv || 0)
                    ? "text-[#1C6048]"
                    : "text-red-700"
                }`}>
                  {formatCurrency((presetConsolidated.metrics.npv || 0) - (baselineConsolidated.metrics.npv || 0))} Delta
                </div>
              </div>

              {/* DSCR card */}
              <div className="p-2 bg-[#EFEBE7]/30 border border-[#D8D8D8]/70 rounded-lg flex flex-col justify-between">
                <span className="text-[8.5px] font-bold text-[#4C4A4B] uppercase tracking-wider flex items-center gap-0.5">
                  <Info size={10} className="text-[#1E2F31]" /> Avg HoldCo DSCR
                </span>
                <div className="mt-1">
                  <div className="text-sm font-black text-[#1E2F31] font-mono">
                    {formatNumber(presetConsolidated.metrics.avgConsolidatedDscr, 2)}x
                  </div>
                  <div className="text-[8px] font-mono text-[#4C4A4B]">
                    Base: {formatNumber(baselineConsolidated.metrics.avgConsolidatedDscr, 2)}x
                  </div>
                </div>
                <div className={`mt-1 text-[8.5px] font-black font-mono ${
                  (presetConsolidated.metrics.avgConsolidatedDscr || 0) >= (baselineConsolidated.metrics.avgConsolidatedDscr || 0)
                    ? "text-[#1C6048]"
                    : "text-red-700"
                }`}>
                  {formatNumber((presetConsolidated.metrics.avgConsolidatedDscr || 0) - (baselineConsolidated.metrics.avgConsolidatedDscr || 0), 2)}x Delta
                </div>
              </div>
            </div>

            {/* Trajectory comparison Chart */}
            <div className="h-28">
              <LazyResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D8D8D8" />
                  <XAxis dataKey="year" tick={{ fontSize: 8, fill: "#4C4A4B" }} axisLine={false} />
                  <YAxis tick={{ fontSize: 8, fill: "#4C4A4B" }} axisLine={false} tickFormatter={(val) => `${val}B`} />
                  <RechartsTooltip contentStyle={TOOLTIP_STYLE} formatter={(val) => `${val}B`} />
                  <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                  <Bar dataKey="Baseline Cash Flow" fill="#D8D8D8" opacity={0.6} barSize={20} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Scenario Cash Flow" fill="#1C6048" barSize={12} radius={[2, 2, 0, 0]} />
                  <ReferenceLine y={0} stroke="#4C4A4B" strokeWidth={1} strokeDasharray="4 4" />
                </ComposedChart>
              </LazyResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Option 2: 2D Sensitivity Matrix */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#D8D8D8] space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h2 className="text-xs font-black text-[#1E2F31] flex items-center gap-1.5 uppercase tracking-wide">
                <Grid size={14} className="text-[#1C6048]" /> Sensitivity Table
              </h2>
              <p className="text-[9.5px] text-[#4C4A4B] font-medium mt-0.5">
                Cross-analyze clinical capacity parameters to explore combined HoldCo return triggers.
              </p>
            </div>

            {/* Metric togglers */}
            <div className="flex p-0.5 bg-[#EFEBE7] rounded-lg border border-[#D8D8D8] max-w-max self-start sm:self-auto">
              <button
                onClick={() => setMatrixMetric("irr")}
                className={`px-2 py-0.5 text-[8.5px] font-black rounded transition-all ${
                  matrixMetric === "irr" ? "bg-white shadow-sm text-[#1E2F31]" : "text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                IRR (%)
              </button>
              <button
                onClick={() => setMatrixMetric("npv")}
                className={`px-2 py-0.5 text-[8.5px] font-black rounded transition-all ${
                  matrixMetric === "npv" ? "bg-white shadow-sm text-[#1E2F31]" : "text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                NPV
              </button>
              <button
                onClick={() => setMatrixMetric("cash")}
                className={`px-2 py-0.5 text-[8.5px] font-black rounded transition-all ${
                  matrixMetric === "cash" ? "bg-white shadow-sm text-[#1E2F31]" : "text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                Total Cash
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-w-full rounded-xl border border-[#D8D8D8] relative">
            <table className="w-full min-w-[620px] text-center border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky left-0 top-0 z-30 border-b border-r border-[#D8D8D8] p-2 text-[9.5px] font-black text-right align-bottom bg-[#F9F8F6] text-[#1E2F31]">
                    Max BOR (%) ⬇ <br />
                    Ramp Speed ➔
                  </th>
                  {borIncrementSteps.map((inc, i) => (
                    <th
                      key={i}
                      className={`p-2 text-[9.5px] font-black border-b border-r last:border-r-0 border-[#D8D8D8] bg-[#EFEBE7] sticky top-0 z-20 ${
                        inc === opCoAssumptions.borIncrement ? "text-[#1C6048] ring-1 ring-[#1C6048]" : "text-[#1E2F31]"
                      }`}
                    >
                      {inc}% p.a. {inc === opCoAssumptions.borIncrement && "(Base)"}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {borMaxSteps.map((maxBor, r) => (
                  <tr key={r}>
                    <th
                      className={`p-2 text-[9.5px] font-black border-r border-b border-[#D8D8D8] bg-[#F9F8F6] text-left whitespace-nowrap sticky left-0 z-10 ${
                        maxBor === opCoAssumptions.borMax ? "text-[#1C6048] ring-1 ring-[#1C6048]" : "text-[#1E2F31]"
                      }`}
                    >
                      {maxBor}% stabilized {maxBor === opCoAssumptions.borMax && "(Base)"}
                    </th>
                    {matrixData[r].map((val, c) => {
                      const isBaseIntersection =
                        borMaxSteps[r] === opCoAssumptions.borMax &&
                        borIncrementSteps[c] === opCoAssumptions.borIncrement;

                      let displayedText = "";
                      if (matrixMetric === "irr") {
                        displayedText = formatNumber(val, 1) + "%";
                      } else if (matrixMetric === "npv") {
                        displayedText = formatCurrency(val);
                      } else {
                        displayedText = formatCurrency(val);
                      }

                      return (
                        <td
                          key={c}
                          className={`p-1.5 text-[10px] font-mono font-bold transition-all border-b border-r last:border-r-0 border-[#D8D8D8]/40 ${getCellColor(
                            val,
                            matrixMin,
                            matrixMax
                          )} ${
                            isBaseIntersection
                              ? "ring-2 ring-[#1E2F31] shadow-sm z-10 scale-105 relative"
                              : ""
                          }`}
                        >
                          <div className="relative">
                            <span>{displayedText}</span>
                            {isBaseIntersection && (
                              <span className="absolute -top-1.5 -right-1 bg-[#1E2F31] text-[6px] text-[#E6D3AF] font-bold px-0.5 rounded border border-[#D8D8D8]">
                                Base
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#EFEBE7]/30 py-1.5 px-3 rounded-lg border border-[#D8D8D8] flex items-start gap-1.5 text-[9px] text-[#4C4A4B] leading-relaxed">
            <AlertTriangle size={13} className="text-[#9B8B70] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1E2F31] font-bold">Look-Through Compliance Insight:</strong> Under clinical forecasting, falling below <strong className="text-[#1E2F31] font-black">55% stabilized bed occupancy</strong> and ramp-up below <strong className="text-[#1E2F31] font-black">3% p.a.</strong> depresses HoldCo yields, dropping IRR below the standard <strong className="text-[#1E2F31] font-bold">12% hurdle rate</strong> and impacting loan-to-value coverage ratios.
            </div>
          </div>
        </div>
      </div>
    );
  }
);
