import { runOpCoEngine } from "../financialEngine";
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

export const OpCoSensitivityView = memo(({ assumptions }: any) => {
  const borSteps = [45, 55, 65, 75, 85];
  const bedSteps = [80, 100, 120, 140, 160];
  const irrMatrix = borSteps.map((bor) =>
    bedSteps.map(
      (beds) =>
        (runOpCoEngine({ ...assumptions, borMax: bor, beds }).projectIRR || 0) *
        100,
    ),
  );
  return (
    <SensitivityTable
      title="Project IRR Sensitivity"
      subtitle="Beds vs. Max BOR"
      xLabel="Beds"
      yLabel="BOR"
      xValues={bedSteps}
      yValues={borSteps}
      matrix={irrMatrix}
      formatFn={(v) => formatNumber(v, 1) + "%"}
    />
  );
});
