import { runPropCoEngine } from "../financialEngine";
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
  SensitivityTable,
} from "../App";
import {
  OPCO_FORMULAS,
  PROPCO_FORMULAS,
  CONSOLIDATED_FORMULAS,
} from "../formulaTooltips";

export const PropCoSensitivityView = memo(
  ({ assumptions, opCoModelData, groups }: any) => {
    const costSteps = [9, 10, 11.5, 13, 14];
    const rateSteps = [8, 9, 10.5, 12, 13];
    const paybackMatrix = costSteps.map((bc) =>
      rateSteps.map(
        (ir) =>
          runPropCoEngine(
            { ...assumptions, buildCost: bc, interestRate: ir },
            opCoModelData,
            null,
            groups,
          ).metrics.operatingPayback || 0,
      ),
    );
    return (
      <SensitivityTable
        title="Operating Payback Sensitivity"
        subtitle="Interest Rate vs. Build Cost"
        xLabel="Rate"
        yLabel="Cost"
        xValues={rateSteps}
        yValues={costSteps}
        matrix={paybackMatrix}
        formatFn={(v) => (v === 0 ? "Never" : formatNumber(v, 1) + " Yrs")}
        reverseColors
      />
    );
  },
);
