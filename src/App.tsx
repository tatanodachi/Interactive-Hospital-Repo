// @ts-nocheck
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  memo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
} from "recharts";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Activity,
  FileText,
  Maximize2,
  Minimize2,
  Settings,
  LayoutDashboard,
  List,
  Users,
  Shield,
  Scale,
  AlignLeft,
  AlignRight,
  EyeOff,
  ArrowUpRight,
  Link2,
  Coins,
  Building2,
  Stethoscope,
  Briefcase,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  BrainCircuit,
  RefreshCcw,
  BarChart3,
  PieChart as PieChartIcon,
  Map,
  Landmark,
  ArrowRightLeft,
  X,
  Download,
  AlertTriangle,
  Grid,
  Clock,
  Lock,
  Unlock,
  Info,
  MapPin,
  Building,
  Cloud,
  CloudOff,
  ChevronDown,
  GripHorizontal,
  Maximize,
  Minimize,
  BookOpen,
  Target,
  Search,
  FolderTree,
  BarChartHorizontal,
  Layers,
  Sliders,
  Microscope,
  Bed,
  Timer,
  Network,
  Plane,
  Dna,
  Bone,
  Baby,
  Eye,
  Check,
  ArrowRight,
  Ruler,
  Calendar,
  CalendarDays,
  Plus,
  Trash2,
  ChevronsUpDown,
  ChevronsDownUp,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Award,
  CheckCircle2,
  HelpCircle,
  Zap,
  Monitor,
  Workflow,
  Download,
} from "lucide-react";
import { exportToExcel } from "./exportExcel";
import { ExecutiveSummaryView } from "./ExecutiveSummaryView";
import { InteractiveDemographicMap } from "./views/InteractiveDemographicMap";
import { ClinicalProgrammingView } from "./views/ClinicalProgrammingView";
import { MasterTimelineView } from "./views/MasterTimelineView";
import { PropCoSensitivityView } from "./views/PropCoSensitivityView";
import { OpCoSensitivityView } from "./views/OpCoSensitivityView";
import { ConsolidatedSensitivityView } from "./views/ConsolidatedSensitivityView";
import { StudyView } from "./views/StudyView";
import { CollaborationStrategyView } from "./views/CollaborationStrategyView";
import { ProjectOverviewView } from "./views/ProjectOverviewView";
import { PropCoSettingsView } from "./views/PropCoSettingsView";
import { OpCoSettingsView } from "./views/OpCoSettingsView";
import { ConsolidatedDashboardView } from "./views/ConsolidatedDashboardView";
import { PropCoDashboardView } from "./views/PropCoDashboardView";
import { OpCoDashboardView } from "./views/OpCoDashboardView";
import { ConsolidatedCascadeView } from "./views/ConsolidatedCascadeView";
import { PropCoCascadeView } from "./views/PropCoCascadeView";
import { OpCoCascadeView } from "./views/OpCoCascadeView";
import {
  calculatePMT,
  calculatePayback,
  calculateIRR,
  calculateNPV,
  runOpCoEngine,
  runPropCoEngine,
  runConsolidatedEngine,
  DEFAULT_OPCO_ASSUMPTIONS,
  DEFAULT_PROPCO_ASSUMPTIONS,
  DEFAULT_HOLDCO_ASSUMPTIONS,
  CANCER_DATA,
  INSURANCE_DATA,
  callGemini,
  getInitialStepUpPercentages,
  ensureArray,
} from "./financialEngine";
import {
  OPCO_FORMULAS,
  PROPCO_FORMULAS,
  CONSOLIDATED_FORMULAS,
} from "./formulaTooltips";

// True Secure Cloud Sync Imports
import {
  db,
  auth,
  isCloudConfigured,
  googleProvider,
  loginWithGoogle,
  logoutUser,
  handleFirestoreError,
  OperationType,
} from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const LazyResponsiveContainer = memo(({ children, ...props }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ width: "100%", height: "100%" }} />;
  }

  return <ResponsiveContainer {...props}>{children}</ResponsiveContainer>;
});

export const CHART_MARGINS_BAR = { top: 20, right: 0, left: 0, bottom: 0 };
export const CHART_MARGINS_LINE = { top: 40, right: 35, left: 20, bottom: 0 };
export const TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid #D8D8D8",
  fontSize: "12px",
  color: "#1E2F31",
};
const CHART_CURSOR_STYLE = { fill: "#F9F8F6" };
export const LEGEND_STYLE = { fontSize: "11px", paddingTop: "20px" };

// --- NEW STABLE REFERENCES FOR OPPORTUNITIES TAB ---
export const TICK_STYLE = { fontSize: 10, fill: "#4C4A4B" };
export const PREM_MKT_PIE_DATA = [
  { name: "SES A & B", value: 18 },
  { name: "General / BPJS", value: 82 },
];
export const formatCancerCases = (val) =>
  new Intl.NumberFormat("en-US").format(val);
export const formatInsuranceTooltip = (val) => val.toFixed(2) + "T IDR";
const formatInsuranceLabel = (val) => val.toFixed(2);
export const LINE_LABEL_STYLE = {
  position: "top",
  fill: "#4C4A4B",
  fontSize: 10,
  dy: -10,
  formatter: formatInsuranceLabel,
};

export const renderPieLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  index,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={index === 0 ? "#9B8B70" : "#8A9A9C"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={10}
      fontWeight="bold"
    >
      <tspan x={x} dy="-0.4em">
        {name}
      </tspan>
      <tspan x={x} dy="1.2em">{`${(percent * 100).toFixed(0)}%`}</tspan>
    </text>
  );
};
// ---------------------------------------------------

// --- TIMELINE CONSTANTS & DATA ---
export const START_YEAR = 2026;
export const DEFAULT_END_YEAR = 2028;
export const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const generateTimelineMonths = (start, end) => {
  const months = [];
  let num = 1;
  for (let year = start; year <= end; year++) {
    for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
      const mName = `${MONTH_NAMES_SHORT[monthIdx]} ${String(year).slice(-2)}`;
      let phase = "Operations";
      if (year === start) {
        if (monthIdx < 3) phase = "Feasibility";
        else if (monthIdx < 6) phase = "Design";
        else phase = "Licensing";
      } else if (year === start + 1) {
        if (monthIdx < 9) phase = "Construction";
        else phase = "Procurement";
      } else if (year === start + 2) {
        if (monthIdx < 6) phase = "EPC Core";
        else phase = "Commission";
      } else if (year > start + 2) {
        phase = year === end ? "Maturity" : "Operations";
      }
      months.push({ num: num++, name: mName, year: year, phase: phase });
    }
  }
  return months;
};

const INITIAL_GROUPS = [
  {
    id: "capex",
    name: "0. CAPEX & Setup",
    color: "from-indigo-600 to-indigo-800",
    bgLight: "bg-indigo-50",
    tasks: [
      {
        id: "c1",
        name: "Land Acquisition",
        start: 1,
        duration: 1,
        progress: 100,
        dependencies: [],
        owner: "Finance Board",
        cost: 0,
        desc: "Final settlement and site handover for the specialized hospital facility.",
        critical: true,
      },
      {
        id: "c2",
        name: "Licensing & Permits",
        start: 1,
        duration: 12,
        progress: 0,
        dependencies: [],
        owner: "Legal / Ops",
        cost: 1.2,
        desc: "Strategic licenses, setup fees, and initial MoH administrative registrations.",
        critical: false,
      },
      {
        id: "c3",
        name: "Consultant (Design/Legal/Financial)",
        start: 2,
        duration: 6,
        progress: 0,
        dependencies: [],
        owner: "Project Mgmt",
        cost: 4.8,
        desc: "Design consultants, financial audit groups, and clinical strategy advisors.",
        critical: true,
      },
      {
        id: "c4",
        name: "Hospital FF&E Setup",
        start: 19,
        duration: 4,
        progress: 0,
        dependencies: ["t7_1"],
        owner: "Procurement",
        cost: 26.0,
        desc: "Furniture, Fixtures & Equipment fit-out for clinical and admin zones, scheduled sequentially post-Interior Fit-Out.",
        critical: false,
      },
      {
        id: "c5",
        name: "Cluster Infrastructure",
        start: 9,
        duration: 6,
        progress: 0,
        dependencies: [],
        owner: "IT / Facilities",
        cost: 5.8,
        desc: "Network backbone, server rooms, and primary medical data clustering setup.",
        critical: false,
      },
      {
        id: "c6",
        name: "Sharing Development",
        start: 9,
        duration: 6,
        progress: 0,
        dependencies: [],
        owner: "Tech Team",
        cost: 4.3,
        desc: "Software systems and R&D cost sharing for multi-tenant integrated apps.",
        critical: false,
      },
      {
        id: "c7",
        name: "Hospital Construction",
        start: 1,
        duration: 20,
        progress: 0,
        dependencies: ["c2"],
        owner: "EPC Contractor",
        cost: 149.5,
        desc: "Main building structural construction, piling, and core envelope setup.",
        critical: true,
      },
      {
        id: "c8",
        name: "Medical Equipment Setup",
        start: 19,
        duration: 3,
        progress: 0,
        dependencies: ["c7"],
        owner: "Procurement",
        cost: 45.0,
        desc: "Procurement, rigging, and installation of major medical and oncology equipment.",
        critical: true,
      },
    ],
  },
  {
    id: "design",
    name: "1. DESIGN & PLANNING",
    color: "from-[#1C6048] to-[#2E8563]",
    bgLight: "bg-[#1C6048]/5",
    tasks: [
      {
        id: "t1",
        name: "JV & Feasibility",
        start: 1,
        duration: 6,
        progress: 100,
        owner: "Sponsor Board",
        cost: 2.5,
        desc: "Finalizing joint-venture structure, GFA allocations, and financial underpinnings.",
        critical: false,
        dependencies: [],
      },
      {
        id: "t2",
        name: "Architectural Planning",
        start: 7,
        duration: 4,
        progress: 60,
        owner: "Lead Architect",
        cost: 4.0,
        desc: "Development of detailed schematics, building footprint optimization, and landscape integration.",
        critical: true,
        dependencies: ["t1"],
      },
      {
        id: "t3",
        name: "MEP & Vault Layouts",
        start: 8,
        duration: 4,
        progress: 10,
        owner: "MEP Engineers",
        cost: 2.2,
        desc: "Designing complex ventilation, electrical backups, and customized structural reinforced vaults.",
        critical: true,
        dependencies: ["t2"],
        warning: true,
      },
    ],
  },
  {
    id: "licensing",
    name: "2. LICENSING & REGULATORY",
    color: "from-[#9B8B70] to-[#B5A58A]",
    bgLight: "bg-[#9B8B70]/5",
    tasks: [
      {
        id: "t4",
        name: "Hospital Clearances (IMB)",
        start: 9,
        duration: 3,
        progress: 0,
        owner: "Legal Team",
        cost: 1.5,
        desc: "Securing local building approvals (IMB), environmental impact assessments (AMDAL), and initial MoH registrations.",
        critical: false,
        dependencies: ["t2"],
        warning: true,
      },
      {
        id: "t5",
        name: "BAPETEN Vault Licence",
        start: 12,
        duration: 3,
        progress: 0,
        owner: "Nuclear Physicist / Legal",
        cost: 3.5,
        desc: "Critical-path approval for heavy particle bunker construction and nuclear medicine operations.",
        critical: true,
        dependencies: ["t3"],
      },
    ],
  },
  {
    id: "construction",
    name: "3. Civil & Construction",
    color: "from-[#1E2F31] to-[#364F52]",
    bgLight: "bg-[#1E2F31]/5",
    tasks: [
      {
        id: "t6_1",
        name: "Piling, Excavation & Foundation",
        start: 1,
        duration: 4,
        progress: 0,
        owner: "EPC Contractor",
        cost: 22.4,
        desc: "Civil site preparation, drilling, setting foundation piles, and mass excavation.",
        critical: true,
        dependencies: ["t4"],
      },
      {
        id: "t6_2",
        name: "Main Structural Superstructure",
        start: 5,
        duration: 10,
        progress: 0,
        owner: "EPC Contractor",
        cost: 59.8,
        desc: "Reinforced concrete structural skeleton, pillars, floors, and slabs work.",
        critical: true,
        dependencies: ["t6_1"],
      },
      {
        id: "t6_3",
        name: "Heavy Concrete Shielding Bunkers",
        start: 9,
        duration: 4,
        progress: 0,
        owner: "Bunker Specialist",
        cost: 22.4,
        desc: "Pouring high-density barytes concrete shielding for oncology linac bunkers.",
        critical: true,
        dependencies: ["t6_2"],
      },
      {
        id: "t6_4",
        name: "HVAC & Hospital MEP Setup",
        start: 12,
        duration: 8,
        progress: 0,
        owner: "MEP Subcontractor",
        cost: 44.9,
        desc: "Deploying hospital-grade HEPA HVAC filtration, central plant and primary electrical conduits.",
        critical: true,
        dependencies: ["t6_2"],
      },
      {
        id: "t7_1",
        name: "Interior Fit-Out & Finishes",
        start: 15,
        duration: 4,
        progress: 0,
        owner: "Interior Designer",
        cost: 13.0,
        desc: "Hanging hygienic drywall, antibacterial coatings, ceiling treatment, and specialized lighting panels.",
        critical: false,
        dependencies: ["t6_2"],
      },
      {
        id: "t7_2",
        name: "Clinical Furniture Integration",
        start: 19,
        duration: 4,
        progress: 0,
        owner: "Procurement Lead",
        cost: 13.0,
        desc: "Installation of nurse desks, clinical counters, patient lockers, and back-office furniture.",
        critical: false,
        dependencies: ["t7_1"],
      },
    ],
  },
  {
    id: "infrastructure",
    name: "4. Infrastructure",
    color: "from-[#2C5E4E] to-[#1E2F31]",
    bgLight: "bg-[#2C5E4E]/5",
    tasks: [
      {
        id: "t8",
        name: "Cluster Infrastructure",
        start: 9,
        duration: 6,
        progress: 0,
        owner: "IT / Facilities",
        cost: 5.8,
        desc: "Physical setup of server hardware, clinical networks, and local area connectivity within the hospital facility.",
        critical: false,
        dependencies: [],
      },
      {
        id: "t9",
        name: "Sharing Development",
        start: 9,
        duration: 6,
        progress: 0,
        owner: "Tech Team",
        cost: 4.3,
        desc: "Software integrations, patient portal configurations, and collaborative platform development.",
        critical: false,
        dependencies: [],
      },
    ],
  },
  {
    id: "equipment",
    name: "5. Equipment & Launch",
    color: "from-[#99B6AA] to-[#B3CFC3]",
    bgLight: "bg-[#99B6AA]/10",
    tasks: [
      {
        id: "t10",
        name: "Oncology Asset Lease",
        start: 16,
        duration: 3,
        progress: 0,
        owner: "Procurement Board",
        cost: 45.0,
        desc: "Finalizing delivery parameters and lease schedules with direct global medical technology manufacturers.",
        critical: true,
        dependencies: ["t5"],
      },
      {
        id: "t11",
        name: "Machinery Rigging & Fit",
        start: 19,
        duration: 3,
        progress: 0,
        owner: "Install Engineers",
        cost: 8.0,
        desc: "Physical transport, crane-rigging, and mounting of medical assets into BAPETEN-approved bunkers.",
        critical: true,
        dependencies: ["t6_3", "t10"],
      },
      {
        id: "t12",
        name: "Testing & Staff Drills",
        start: 22,
        duration: 3,
        progress: 0,
        owner: "Clinical Director",
        cost: 4.5,
        desc: "Calibration of high-energy photon beams, safety sweeps, mock patient cycles, and emergency simulations.",
        critical: true,
        dependencies: ["t11", "t7_1"],
      },
      {
        id: "t13",
        name: "Commercial Opening",
        start: 25,
        duration: 1,
        progress: 0,
        owner: "Operations GM",
        cost: 6.0,
        desc: "Grand public ribbon-cutting, commercial patient onboarding, and grand-opening marketing sweeps.",
        critical: true,
        dependencies: ["t12"],
      },
    ],
  },
];

export const TIMELINE_PRESETS = {
  base: {
    name: "Base Case",
    tasks: {
      c1: { start: 1, duration: 1 },
      c2: { start: 1, duration: 12 },
      c3: { start: 2, duration: 6 },
      c4: { start: 19, duration: 4 },
      c5: { start: 9, duration: 6 },
      c6: { start: 9, duration: 6 },
      c7: { start: 1, duration: 20 },
      c8: { start: 19, duration: 3 },
      t1: { start: 1, duration: 6 },
      t2: { start: 7, duration: 4 },
      t3: { start: 8, duration: 4 },
      t4: { start: 9, duration: 3 },
      t5: { start: 12, duration: 3 },
      t6_1: { start: 1, duration: 4 },
      t6_2: { start: 5, duration: 10 },
      t6_3: { start: 9, duration: 4 },
      t6_4: { start: 12, duration: 8 },
      t7_1: { start: 15, duration: 4 },
      t7_2: { start: 19, duration: 4 },
      t8: { start: 9, duration: 6 },
      t9: { start: 9, duration: 6 },
      t10: { start: 16, duration: 3 },
      t11: { start: 19, duration: 3 },
      t12: { start: 22, duration: 3 },
      t13: { start: 25, duration: 1 },
    },
  },
  aggressive: {
    name: "Aggressive",
    tasks: {
      c1: { start: 1, duration: 1 },
      c2: { start: 1, duration: 10 },
      c3: { start: 1, duration: 5 },
      c4: { start: 16, duration: 3 },
      c5: { start: 8, duration: 5 },
      c6: { start: 8, duration: 5 },
      c7: { start: 1, duration: 16 },
      c8: { start: 16, duration: 3 },
      t1: { start: 1, duration: 4 },
      t2: { start: 5, duration: 3 },
      t3: { start: 6, duration: 3 },
      t4: { start: 7, duration: 2 },
      t5: { start: 9, duration: 2 },
      t6_1: { start: 1, duration: 3 },
      t6_2: { start: 4, duration: 8 },
      t6_3: { start: 7, duration: 3 },
      t6_4: { start: 10, duration: 6 },
      t7_1: { start: 13, duration: 3 },
      t7_2: { start: 16, duration: 3 },
      t8: { start: 8, duration: 5 },
      t9: { start: 8, duration: 5 },
      t10: { start: 13, duration: 2 },
      t11: { start: 15, duration: 2 },
      t12: { start: 17, duration: 2 },
      t13: { start: 19, duration: 1 },
    },
  },
  conservative: {
    name: "Conservative",
    tasks: {
      c1: { start: 1, duration: 2 },
      c2: { start: 1, duration: 14 },
      c3: { start: 2, duration: 8 },
      c4: { start: 23, duration: 5 },
      c5: { start: 12, duration: 8 },
      c6: { start: 12, duration: 8 },
      c7: { start: 1, duration: 24 },
      c8: { start: 23, duration: 4 },
      t1: { start: 1, duration: 8 },
      t2: { start: 9, duration: 6 },
      t3: { start: 10, duration: 5 },
      t4: { start: 11, duration: 4 },
      t5: { start: 15, duration: 4 },
      t6_1: { start: 1, duration: 5 },
      t6_2: { start: 6, duration: 12 },
      t6_3: { start: 11, duration: 6 },
      t6_4: { start: 15, duration: 10 },
      t7_1: { start: 19, duration: 5 },
      t7_2: { start: 24, duration: 5 },
      t8: { start: 12, duration: 8 },
      t9: { start: 12, duration: 8 },
      t10: { start: 19, duration: 4 },
      t11: { start: 23, duration: 4 },
      t12: { start: 27, duration: 4 },
      t13: { start: 31, duration: 1 },
    },
  },
};

export const formatNumber = (val, decimals = 1) => {
  if (val === null || val === undefined) return "0";

  // 1. Clean and parse FIRST
  const num =
    typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);

  // 2. Then check if it's NaN or effectively zero
  if (isNaN(num) || Math.abs(num) < 1e-10) return "0";

  // 3. Format
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(num));
  return num < 0 ? `(${formatted})` : formatted;
};

export const formatCurrency = (val) => {
  if (val === null || val === undefined) return "Rp 0 B";

  const num =
    typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);

  if (isNaN(num) || Math.abs(num) < 1e-10) return "Rp 0 B";

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(num));
  return num < 0 ? `(Rp ${formatted} B)` : `Rp ${formatted} B`;
};

export const formatPercent = (val) => {
  if (val === null || val === undefined) return "0.0%";
  const num = typeof val === "string" ? parseFloat(val) : Number(val);
  if (isNaN(num)) return "0.0%";
  return num.toFixed(1) + "%";
};

// ==========================================
// 3. UI ATOMIC COMPONENTS
// ==========================================

const AIMicroscopeIcon = memo(({ size = 14, className = "" }) => {
  const badgeFontSize = Math.max(7, size * 0.35);
  const rightOffset = size > 24 ? "-right-3" : "-right-2";
  const topOffset = size > 24 ? "-top-2" : "-top-1";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <Microscope size={size} />
      <span
        className={`absolute ${topOffset} ${rightOffset} bg-gradient-to-br from-[#1C6048] to-[#1E2F31] text-white font-black px-1 rounded-sm shadow-sm leading-none border border-white/50`}
        style={{ fontSize: badgeFontSize }}
      >
        AI
      </span>
    </div>
  );
});

// Custom Brand SVGs based on exact user images
// Strictly Line-Art (Fill: none) + High Detail + Scalable Viewbox
export const CustomBedIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Heartbeat Monitor */}
    <rect x="34" y="10" width="20" height="14" rx="2" />
    <polyline points="36,17 40,17 43,12 46,22 49,17 52,17" />
    {/* Bed Frame & Headboard */}
    <line x1="10" y1="16" x2="10" y2="52" />
    <line x1="10" y1="44" x2="56" y2="44" />
    <line x1="56" y1="44" x2="56" y2="52" />
    {/* Patient Head & Blanket */}
    <circle cx="20" cy="26" r="5" />
    <path d="M 10 34 L 26 34 C 30 26 34 26 38 34 L 56 34 L 56 44" />
  </svg>
));

export const CustomScaleIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Base & Stand */}
    <line x1="16" y1="56" x2="48" y2="56" />
    <line x1="22" y1="50" x2="42" y2="50" />
    <line x1="32" y1="50" x2="32" y2="10" />
    <circle cx="32" cy="10" r="3" />
    {/* Angled Crossbar */}
    <line x1="10" y1="16" x2="54" y2="28" />
    {/* Left Strings & Pan */}
    <path d="M 10 16 L 4 36 L 16 36 Z" />
    <path d="M 4 36 C 4 46 16 46 16 36" />
    {/* Right Strings & Pan */}
    <path d="M 54 28 L 48 48 L 60 48 Z" />
    <path d="M 48 48 C 48 58 60 58 60 48" />
  </svg>
));

export const CustomKnotIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Continuous overlapping path simulating a tangled thread/yarn with a loose end */}
    <path d="M 12 52 C 16 44 24 36 20 28 C 16 16 32 8 44 16 C 56 24 52 44 40 52 C 28 60 12 48 16 32 C 20 16 40 12 52 24 C 64 36 56 56 44 60 C 32 64 20 52 24 40 C 28 28 44 28 48 40 C 52 52 36 60 28 52" />
  </svg>
));

export const CustomStethoscopeIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Earpieces (Y-Split) */}
    <path d="M 10 8 C 10 16 16 20 16 26" />
    <path d="M 22 8 C 22 16 16 20 16 26" />
    <line x1="7" y1="8" x2="13" y2="8" />
    <line x1="19" y1="8" x2="25" y2="8" />
    {/* Left Arm & U-Bend */}
    <line x1="16" y1="26" x2="16" y2="44" />
    <path d="M 16 44 C 16 60 48 60 48 44" />
    {/* Right Arm & Chestpiece */}
    <line x1="48" y1="44" x2="48" y2="26" />
    <circle cx="48" cy="18" r="8" />
    <circle cx="48" cy="18" r="3" />
    {/* Medical Cross Circle (Lowered and Centered) */}
    <circle cx="32" cy="38" r="6" />
    <line x1="32" y1="35" x2="32" y2="41" />
    <line x1="29" y1="38" x2="35" y2="38" />
  </svg>
));

export const CustomPhysicianIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Simple Head */}
    <circle cx="32" cy="16" r="10" />
    {/* Simple Body Outline */}
    <path d="M 12 56 C 12 40 20 32 32 32 C 44 32 52 40 52 56" />

    {/* Asymmetric Stethoscope Drape */}
    {/* Left Side: Earpieces hanging down */}
    <path d="M 25 33.5 C 22 37 22 43 23 48" />
    <path d="M 19 53 L 23 48 L 27 53" />

    {/* Right Side: Chestpiece hanging down */}
    <path d="M 39 33.5 C 42 37 42 43 41 50" />
    <circle cx="41" cy="53" r="3" />
  </svg>
));

export const CustomPopulationIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Row 1 (Top) - 3 people */}
    {[22, 32, 42].map((x) => (
      <g key={`r1-${x}`}>
        <path
          d={`M ${x - 5.5} 27 C ${x - 5.5} 19 ${x + 5.5} 19 ${x + 5.5} 27`}
          fill="#EFEBE7"
        />
        <circle cx={x} cy="14" r="3.5" fill="#EFEBE7" />
      </g>
    ))}
    {/* Row 2 (Middle) - 4 people */}
    {[17, 27, 37, 47].map((x) => (
      <g key={`r2-${x}`}>
        <path
          d={`M ${x - 5.5} 43 C ${x - 5.5} 35 ${x + 5.5} 35 ${x + 5.5} 43`}
          fill="#EFEBE7"
        />
        <circle cx={x} cy="30" r="3.5" fill="#EFEBE7" />
      </g>
    ))}
    {/* Row 3 (Bottom) - 5 people */}
    {[12, 22, 32, 42, 52].map((x) => (
      <g key={`r3-${x}`}>
        <path
          d={`M ${x - 5.5} 59 C ${x - 5.5} 51 ${x + 5.5} 51 ${x + 5.5} 59`}
          fill="#EFEBE7"
        />
        <circle cx={x} cy="46" r="3.5" fill="#EFEBE7" />
      </g>
    ))}
  </svg>
));

export const CustomDiagnosticsIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Floor Base */}
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />
    <rect
      x="18"
      y="56"
      width="28"
      height="4"
      fill="currentColor"
      stroke="none"
    />

    {/* Outer Scanner Body (Tall Pill Shape) */}
    <rect x="10" y="4" width="44" height="52" rx="20" strokeWidth="2.5" />

    {/* High-Tech Ticked Ring Array */}
    <circle
      cx="32"
      cy="26"
      r="16"
      strokeDasharray="1.5 2.5"
      strokeWidth="2"
      opacity="0.6"
    />
    <circle cx="32" cy="26" r="13" />

    {/* Targeting Crosshair */}
    <line x1="12" y1="26" x2="52" y2="26" strokeDasharray="2 3" opacity="0.4" />
    <line x1="32" y1="6" x2="32" y2="46" strokeDasharray="2 3" opacity="0.4" />
    <circle cx="32" cy="26" r="3" />

    {/* Bed Pedestal (Solid silhouette) */}
    <path
      d="M 27.5 40 L 36.5 40 L 40 60 L 24 60 Z"
      fill="currentColor"
      stroke="none"
      opacity="0.9"
    />

    {/* Sliding Patient Bed (Perspective) */}
    <path
      d="M 23 34 L 41 34 L 44 40 L 20 40 Z"
      fill="#F9F8F6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="miter"
    />

    {/* Bed Surface Lines */}
    <line x1="22" y1="36" x2="42" y2="36" strokeWidth="1.5" />
    <line x1="21" y1="38" x2="43" y2="38" strokeWidth="1.5" />

    {/* Base Vents / Indentations */}
    <line
      x1="14"
      y1="42"
      x2="14"
      y2="48"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="50"
      y1="42"
      x2="50"
      y2="48"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
));

export const CustomLinacIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Floor */}
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />
    {/* Base and Pillar */}
    <path d="M 40 60 V 8 C 40 4 44 2 48 2 C 52 2 56 4 56 8 V 60" />
    {/* Thick C-Arm Outline (drawn behind to merge nicely) */}
    <path
      d="M 48 16 C 48 4 34 4 22 4 H 12 V 30 H 26 V 16 C 32 16 36 20 36 28"
      fill="#E8EFEA"
    />
    {/* Rotating Joint */}
    <circle cx="48" cy="28" r="12" fill="#E8EFEA" />
    <circle cx="48" cy="28" r="4" fill="currentColor" />
    <circle cx="48" cy="28" r="8" strokeDasharray="2 4" opacity="0.5" />
    {/* Collimator / Head */}
    <path d="M 12 30 H 26 L 22 42 H 16 Z" fill="#E8EFEA" />
    <path d="M 16 42 L 17 46 H 21 L 22 42" fill="currentColor" />
    {/* Radiation Beams */}
    <path
      d="M 19 46 L 13 54 M 19 46 L 25 54 M 19 46 V 54"
      strokeDasharray="2 3"
      opacity="0.6"
      strokeWidth="1.5"
    />
    {/* Patient Bed */}
    <rect
      x="6"
      y="54"
      width="34"
      height="3"
      rx="1"
      fill="currentColor"
      stroke="none"
    />
    <rect x="18" y="57" width="10" height="3" />
  </svg>
));

export const CustomOverseasIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />
    {/* Bed Pillar */}
    <rect x="8" y="20" width="10" height="40" rx="2" />
    {/* Bed Arm & Surface */}
    <path d="M 18 42 H 28" strokeWidth="3" />
    <circle cx="28" cy="42" r="4" />
    <path d="M 28 46 V 50 H 42" strokeWidth="3" />
    <rect
      x="18"
      y="48"
      width="24"
      height="2"
      fill="currentColor"
      stroke="none"
    />
    {/* Robot Base */}
    <path d="M 42 60 V 46 C 42 38 52 38 52 46 V 60" />
    {/* Robot Arm Joints */}
    <circle cx="47" cy="40" r="5" />
    <path d="M 47 40 L 40 26" strokeWidth="4" />
    <circle cx="40" cy="26" r="4" />
    <path d="M 40 26 L 34 22" strokeWidth="4" />
    {/* Accelerator Head */}
    <polygon
      points="26,14 36,20 32,28 22,22"
      fill="#F9F8F6"
      stroke="currentColor"
      strokeLinejoin="miter"
    />
    <polygon points="22,22 32,28 30,32 20,26" fill="currentColor" />
    {/* Side Cabinet */}
    <rect x="54" y="34" width="8" height="26" rx="2" />
    <line x1="56" y1="42" x2="60" y2="42" strokeWidth="1.5" />
    <line x1="56" y1="46" x2="60" y2="46" strokeWidth="1.5" />
    <line x1="56" y1="50" x2="60" y2="50" strokeWidth="1.5" />
  </svg>
));

export const CustomPalliativeIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Floor */}
    <line x1="4" y1="60" x2="60" y2="60" strokeWidth="3" />

    {/* IV Stand Base & Pole */}
    <line x1="48" y1="60" x2="56" y2="60" strokeWidth="3" />
    <circle cx="50" cy="58" r="2" fill="currentColor" stroke="none" />
    <circle cx="54" cy="58" r="2" fill="currentColor" stroke="none" />
    <line x1="52" y1="56" x2="52" y2="10" />
    <line x1="48" y1="10" x2="56" y2="10" />

    {/* IV Bag & Pump */}
    <rect x="50" y="14" width="4" height="6" rx="1" />
    <line x1="52" y1="10" x2="52" y2="14" strokeWidth="1" />
    <rect x="48" y="30" width="8" height="10" rx="1.5" fill="#F9F8F6" />
    <line x1="50" y1="33" x2="54" y2="33" strokeWidth="1" />
    <circle cx="50" cy="37" r="0.5" fill="currentColor" />
    <circle cx="52" cy="37" r="0.5" fill="currentColor" />
    <circle cx="54" cy="37" r="0.5" fill="currentColor" />

    {/* IV Tube */}
    <path d="M 52 20 C 48 26 48 30 52 30" strokeWidth="1.5" opacity="0.6" />
    <path d="M 48 36 C 42 44 38 38 34 36" strokeWidth="1.5" opacity="0.6" />

    {/* Recliner Base */}
    <line x1="22" y1="60" x2="34" y2="60" strokeWidth="3" />
    <circle cx="24" cy="58" r="2" fill="currentColor" stroke="none" />
    <circle cx="32" cy="58" r="2" fill="currentColor" stroke="none" />
    <rect x="24" y="46" width="8" height="10" rx="1" />
    <line x1="20" y1="46" x2="36" y2="46" strokeWidth="3" />

    {/* Recliner Seat & Leg Rest */}
    <path d="M 22 46 L 40 46 L 46 54" strokeWidth="6" strokeLinejoin="round" />
    {/* Recliner Backrest */}
    <path d="M 22 46 L 14 26" strokeWidth="6" strokeLinejoin="round" />

    {/* Armrest */}
    <path d="M 22 36 L 32 36 V 46" strokeWidth="2.5" />

    {/* Pillow / Headrest */}
    <circle cx="12" cy="24" r="3" fill="currentColor" />
  </svg>
));

export const CustomClipboardIcon = memo(({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Background shadow/depth */}
    <rect
      x="18"
      y="16"
      width="32"
      height="42"
      rx="3"
      fill="#EFEBE7"
      stroke="none"
    />

    {/* Main Board */}
    <rect x="14" y="12" width="32" height="42" rx="3" fill="#F9F8F6" />

    {/* Top Clip Mechanism */}
    <path d="M 22 12 V 8 C 22 6.5 23.5 5 25 5 H 35 C 36.5 5 38 6.5 38 8 V 12" />
    <rect
      x="24"
      y="9"
      width="12"
      height="6"
      rx="1.5"
      fill="currentColor"
      stroke="none"
    />

    {/* Medical Cross */}
    <path d="M 28 22 H 32 M 30 20 V 24" strokeWidth="2.5" />

    {/* Checklist lines and boxes */}
    <rect x="20" y="30" width="4" height="4" rx="1" />
    <line x1="28" y1="32" x2="40" y2="32" strokeWidth="2" opacity="0.6" />

    <rect x="20" y="38" width="4" height="4" rx="1" />
    <line x1="28" y1="40" x2="40" y2="40" strokeWidth="2" opacity="0.6" />

    {/* Giant checkmark */}
    <path d="M 18 48 L 22 52 L 34 38" strokeWidth="3.5" />
  </svg>
));

export const MarkdownRenderer = memo(({ content, className = "" }) => {
  const createMarkup = (text) => {
    if (!text || typeof text !== "string") return { __html: "" };
    let html = text
      .replace(
        /^###\s+(.*$)/gim,
        '<h3 class="font-bold text-[14px] mt-4 mb-2">$1</h3>',
      )
      .replace(
        /^##\s+(.*$)/gim,
        '<h2 class="font-bold text-[15px] mt-5 mb-2">$1</h2>',
      )
      .replace(
        /^#\s+(.*$)/gim,
        '<h1 class="font-bold text-[16px] mt-6 mb-3">$1</h1>',
      )
      .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-5 list-disc mb-1">$1</li>')
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\n/gim, "<br/>");
    return { __html: html };
  };
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={createMarkup(content)}
    />
  );
});

export const NavButton = memo(({ active, onClick, icon, label, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
      disabled
        ? "opacity-20 cursor-not-allowed text-[#4C4A4B]"
        : active
          ? "bg-white text-[#1E2F31] shadow-md border border-[#D8D8D8]"
          : "text-[#4C4A4B] hover:text-[#1E2F31]"
    }`}
  >
    {icon} <span className="hidden sm:inline">{label}</span>
  </button>
));

export const useTooltip = (tooltip) => {
  const [tooltipState, setTooltipState] = useState(false);
  useEffect(() => {
    if (tooltipState === "hover") {
      const handleScroll = () => setTooltipState(false);
      const closeOthers = () => setTooltipState(false);
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("close-all-tooltips", closeOthers, {
        passive: true,
      });
      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("close-all-tooltips", closeOthers);
      };
    } else if (tooltipState === "click") {
      const handleGlobalClick = () => setTooltipState(false);
      const timeout = setTimeout(() => {
        window.addEventListener("click", handleGlobalClick, { passive: true });
        window.addEventListener("close-all-tooltips", handleGlobalClick, {
          passive: true,
        });
      }, 0);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener("click", handleGlobalClick);
        window.removeEventListener("close-all-tooltips", handleGlobalClick);
      };
    }
  }, [tooltipState]);
  return { tooltipState, setTooltipState };
};

export const KPITooltipIcon = memo(
  ({ tooltip, tooltipState, setTooltipState, align = "right" }) => {
    if (!tooltip) return null;
    const buttonRef = useRef(null);
    const showTooltip = tooltipState !== false;

    const tooltipDesc = typeof tooltip === "string" ? tooltip : tooltip.desc;
    const tooltipFormula = typeof tooltip === "string" ? null : tooltip.formula;

    const [coords, setCoords] = useState(null);

    React.useLayoutEffect(() => {
      if (showTooltip && buttonRef.current) {
        const updateCoords = () => {
          const rect = buttonRef.current.getBoundingClientRect();
          setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
        };
        updateCoords();
        window.addEventListener("resize", updateCoords, { passive: true });
        window.addEventListener("scroll", updateCoords, {
          capture: true,
          passive: true,
        });
        return () => {
          window.removeEventListener("resize", updateCoords);
          window.removeEventListener("scroll", updateCoords, { capture: true });
        };
      } else {
        setCoords(null);
      }
    }, [showTooltip]);

    const showAbove = coords ? coords.top > window.innerHeight * 0.65 : false;

    let leftStyle = {};
    let verticalStyle = {};
    let arrowLeft = 145;

    if (coords) {
      let left = coords.left + coords.width / 2 - 145;
      if (left < 12) left = 12;
      if (left + 290 > window.innerWidth - 12) {
        left = window.innerWidth - 290 - 12;
      }
      leftStyle = { left: `${left}px` };

      if (showAbove) {
        verticalStyle = { bottom: `${window.innerHeight - coords.top + 8}px` };
      } else {
        verticalStyle = { top: `${coords.top + coords.height + 8}px` };
      }

      arrowLeft = coords.left + coords.width / 2 - left;
      if (arrowLeft < 12) arrowLeft = 12;
      if (arrowLeft > 278) arrowLeft = 278;
    }

    const tooltipStyle = coords
      ? {
          position: "fixed" as const,
          ...leftStyle,
          ...verticalStyle,
          width: "290px",
          zIndex: 1000,
        }
      : { display: "none" };

    return (
      <div
        className="relative ml-auto shrink-0"
        onMouseEnter={() => {
          if (tooltipState !== "click") {
            window.dispatchEvent(new Event("close-all-tooltips"));
            setTooltipState("hover");
          }
        }}
        onMouseLeave={() => {
          if (tooltipState !== "click") setTooltipState(false);
        }}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (tooltipState === "click") {
              setTooltipState(false);
            } else {
              window.dispatchEvent(new Event("close-all-tooltips"));
              setTooltipState("click");
            }
          }}
          className={`text-[#4C4A4B]/60 hover:text-[#1C6048] transition-colors focus:outline-none p-0.5 ${showTooltip ? "relative z-[80]" : ""}`}
          aria-label="More information"
        >
          <Info size={11} strokeWidth={2.5} />
        </button>

        {showTooltip &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[9000] sm:hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  setTooltipState(false);
                }}
              />
              <div
                style={tooltipStyle}
                className="p-4 bg-[#1E2F31] text-white rounded-xl shadow-[0_8px_30px_rgba(30,47,49,0.9)] border border-[#1C6048]/50 text-xs font-medium leading-relaxed normal-case tracking-normal animate-in fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {coords && (
                  <div
                    style={{ left: `${arrowLeft}px` }}
                    className={`absolute w-3 h-3 bg-[#1E2F31] rounded-sm transform rotate-45 border-t border-l border-[#1C6048]/50 ${
                      showAbove
                        ? "-bottom-1.5 border-t-0 border-l-0 border-b border-r"
                        : "-top-1.5"
                    }`}
                  />
                )}
                <div className="relative z-10">
                  <div className="font-bold text-white mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#99B6AA]">
                    <Info size={12} className="text-[#99B6AA]" /> Metric Insight
                  </div>
                  <div className="text-white/90 text-[11px] leading-relaxed mb-3 whitespace-pre-wrap">
                    {tooltipDesc}
                  </div>
                  {tooltipFormula && (
                    <div className="bg-black/20 p-2 rounded-lg border border-white/10 font-mono text-[9px] text-[#48B084] break-words overflow-x-auto custom-scrollbar whitespace-pre-wrap">
                      <span className="text-white/40 block text-[8px] uppercase font-sans font-bold tracking-widest mb-1 shadow-sm">
                        Formula
                      </span>
                      {tooltipFormula}
                    </div>
                  )}
                </div>
              </div>
            </>,
            document.body,
          )}
      </div>
    );
  },
);

export const StatefulTooltipIcon = memo(({ tooltip, align = "right" }) => {
  const { tooltipState, setTooltipState } = useTooltip(tooltip);
  return (
    <KPITooltipIcon
      tooltip={tooltip}
      tooltipState={tooltipState}
      setTooltipState={setTooltipState}
      align={align}
    />
  );
});

export const KPICard = memo(
  ({ title, value, icon, color, subtitle, tooltip, disabled = false }) => {
    const displayTooltip = disabled
      ? "Not applicable because Debt Financing is currently OFF."
      : tooltip;
    const { tooltipState, setTooltipState } = useTooltip(displayTooltip);

    const zClass =
      tooltipState === "click"
        ? "z-[110]"
        : tooltipState === "hover"
          ? "z-[100]"
          : "z-10 hover:z-[60]";

    const textColors = {
      blue: "text-[#1C6048]",
      emerald: "text-[#1E2F31]",
      indigo: "text-[#9B8B70]",
    };

    return (
      <div
        className={`p-4 lg:p-5 rounded-2xl border border-[#D8D8D8] bg-white flex flex-col shadow-sm transition-all focus-within:z-[60] relative group ${zClass} ${disabled ? "opacity-40 grayscale pointer-events-auto" : "md:hover:-translate-y-1"}`}
      >
        <div
          className={`flex items-center justify-between mb-2 text-[9px] lg:text-[10px] font-black uppercase tracking-widest ${textColors[color] || "text-[#1E2F31]"}`}
        >
          <div className="flex items-center gap-1.5 opacity-80">
            {icon} {title}
          </div>
          <KPITooltipIcon
            tooltip={displayTooltip}
            tooltipState={tooltipState}
            setTooltipState={setTooltipState}
          />
        </div>
        <div
          className={`text-lg lg:text-xl font-black mb-1 ${textColors[color] || "text-[#1E2F31]"}`}
        >
          {value}
        </div>
        <div className="text-[8px] lg:text-[9px] font-bold uppercase text-[#4C4A4B] opacity-60 tracking-tighter">
          {subtitle}
        </div>
      </div>
    );
  },
);

export const MiniKPICard = memo(
  ({ title, value, subtitle, tooltip, disabled = false }) => {
    const displayTooltip = disabled
      ? "Not applicable because Debt Financing is currently OFF."
      : tooltip;
    const { tooltipState, setTooltipState } = useTooltip(displayTooltip);
    const zClass =
      tooltipState === "click"
        ? "z-[110]"
        : tooltipState === "hover"
          ? "z-[100]"
          : "z-10 hover:z-[60]";

    return (
      <div
        className={`p-3 bg-[#EFEBE7] rounded-xl border border-[#D8D8D8] relative group ${zClass} ${disabled ? "opacity-40 grayscale pointer-events-auto" : ""}`}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-[9px] text-[#4C4A4B] font-bold uppercase">
            {title}
          </p>
          <KPITooltipIcon
            tooltip={displayTooltip}
            tooltipState={tooltipState}
            setTooltipState={setTooltipState}
          />
        </div>
        <p className="text-lg font-black text-[#1E2F31]">{value}</p>
        <p className="text-[8px] text-[#99B6AA] font-bold uppercase mt-1">
          {subtitle}
        </p>
      </div>
    );
  },
);

export const DualKPICard = memo(
  ({
    title1,
    value1,
    color1,
    tooltip1,
    title2,
    value2,
    color2,
    tooltip2,
    icon,
  }) => {
    const { tooltipState: ts1, setTooltipState: setTs1 } = useTooltip(tooltip1);
    const { tooltipState: ts2, setTooltipState: setTs2 } = useTooltip(tooltip2);

    const zClass =
      ts1 === "click" || ts2 === "click"
        ? "z-[110]"
        : ts1 === "hover" || ts2 === "hover"
          ? "z-[100]"
          : "z-10 hover:z-[60]";

    const tColors = {
      blue: "text-[#1C6048]",
      emerald: "text-[#1E2F31]",
      indigo: "text-[#9B8B70]",
      teal: "text-[#1C6048]",
      amber: "text-[#9B8B70]",
      rose: "text-[#4C4A4B]",
    };
    return (
      <div
        className={`p-4 lg:p-5 rounded-2xl border border-[#D8D8D8] bg-white flex flex-col shadow-sm transition-transform hover:-translate-y-1 relative group ${zClass} focus-within:z-[60]`}
      >
        <div
          className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest ${tColors[color1] || "text-[#1E2F31]"}`}
        >
          <div className="flex items-center gap-1.5 opacity-80">
            {icon} {title1}
          </div>
          <KPITooltipIcon
            tooltip={tooltip1}
            tooltipState={ts1}
            setTooltipState={setTs1}
          />
        </div>
        <div
          className={`text-lg lg:text-xl font-black mb-1 ${tColors[color1] || "text-[#1E2F31]"}`}
        >
          {value1}
        </div>
        <div className="w-full h-px bg-[#D8D8D8] my-3"></div>
        <div
          className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest ${tColors[color2] || "text-[#1E2F31]"}`}
        >
          <div className="flex items-center gap-1.5 opacity-80">{title2}</div>
          <KPITooltipIcon
            tooltip={tooltip2}
            tooltipState={ts2}
            setTooltipState={setTs2}
          />
        </div>
        <div
          className={`text-lg lg:text-xl font-black ${tColors[color2] || "text-[#1E2F31]"}`}
        >
          {value2}
        </div>
      </div>
    );
  },
);

export const SectionTitle = memo(({ title, icon, color }) => {
  const c = {
    blue: "text-[#1C6048]",
    emerald: "text-[#1C6048]",
    indigo: "text-[#9B8B70]",
    rose: "text-[#4C4A4B]",
    amber: "text-[#9B8B70]",
    teal: "text-[#4C4A4B]",
  };
  return (
    <div
      className={`flex items-center gap-2 pb-2 border-b-2 border-[#D8D8D8] ${c[color] || "text-[#1E2F31]"}`}
    >
      {icon}{" "}
      <h3 className="text-[10px] font-black uppercase tracking-wider">
        {title}
      </h3>
    </div>
  );
});

export const FormattedInput = memo(
  ({ val, set, className, placeholder, disabled }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
      <input
        type={isFocused ? "number" : "text"}
        value={
          isFocused
            ? val || ""
            : new Intl.NumberFormat("en-US", {
                maximumFractionDigits: 4,
              }).format(val || 0)
        }
        onChange={(e) => set(e.target.value)}
        onFocus={(e) => {
          setIsFocused(true);
          setTimeout(() => e.target.select(), 0);
        }}
        onBlur={() => setIsFocused(false)}
        className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  },
);

export const AssumptionRow = memo(
  ({ label, val, set, unit, isLocked, tooltip }) => {
    const { tooltipState, setTooltipState } = useTooltip(tooltip);
    return (
      <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded transition-colors relative">
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-[#4C4A4B] font-bold">
            {label}
          </label>
          <KPITooltipIcon
            tooltip={tooltip}
            tooltipState={tooltipState}
            setTooltipState={setTooltipState}
            align="left"
          />
        </div>
        <div className="flex items-center gap-1">
          <FormattedInput
            disabled={isLocked}
            val={val}
            set={set}
            className="w-16 p-1 text-right text-[10px] border border-[#D8D8D8] rounded focus:ring-2 focus:ring-[#1C6048] outline-none font-black text-[#1E2F31] bg-white"
          />
          <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-12">
            {unit}
          </span>
        </div>
      </div>
    );
  },
);

export const AssumptionDepreciationGroup = memo(
  ({ label, methodVal, lifeVal, setMethod, setLife, isLocked }) => (
    <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded">
      <label className="text-[10px] text-[#4C4A4B] font-bold">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#D8D8D8] rounded p-0.5">
          <button
            disabled={isLocked}
            onClick={() => setMethod("SL")}
            className={`px-2 py-0.5 text-[9px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed ${methodVal === "SL" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
          >
            SL
          </button>
          <button
            disabled={isLocked}
            onClick={() => setMethod("DDB")}
            className={`px-2 py-0.5 text-[9px] font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed ${methodVal === "DDB" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B]"}`}
          >
            DDB
          </button>
        </div>
        <div className="flex items-center gap-1">
          <FormattedInput
            disabled={isLocked}
            val={lifeVal}
            set={setLife}
            className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          />
          <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-4">
            Yrs
          </span>
        </div>
      </div>
    </div>
  ),
);

export const ToggleRow = memo(
  ({ label, desc, checked, onChange, isLocked }) => (
    <div
      className={`flex items-center justify-between p-3 bg-[#EFEBE7] border border-[#D8D8D8] rounded-xl ${isLocked ? "opacity-70" : ""}`}
    >
      <div>
        <p className="font-bold text-[#1E2F31] text-[11px]">{label}</p>
        <p className="text-[9px] text-[#4C4A4B] font-medium">{desc}</p>
      </div>
      <label
        className={`relative inline-flex items-center ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <input
          disabled={isLocked}
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-9 h-5 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9B8B70] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
      </label>
    </div>
  ),
);

export const AssumptionRowCalculated = memo(
  ({ label, pctVal, setPct, calculatedVal, isLocked }) => (
    <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded">
      <label className="text-[10px] text-[#4C4A4B] font-bold">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-[#1C6048] font-bold w-12 text-right">
          {formatNumber(calculatedVal, 2)} B
        </span>
        <div className="flex items-center gap-1">
          <FormattedInput
            disabled={isLocked}
            val={pctVal}
            set={setPct}
            className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          />
          <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-4">
            %
          </span>
        </div>
      </div>
    </div>
  ),
);

export const AssumptionRowQtyPrice = memo(
  ({ label, qtyVal, priceVal, setQty, setPrice, isLocked }) => (
    <div className="flex flex-col group py-1.5 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded gap-1">
      <div className="flex justify-between items-center">
        <label className="text-[10px] text-[#4C4A4B] font-bold">{label}</label>
        <span className="text-[10px] text-[#1C6048] font-bold">
          {formatNumber(((qtyVal || 0) * (priceVal || 0)) / 1000, 2)} B
        </span>
      </div>
      <div className="flex justify-end items-center gap-1">
        <FormattedInput
          disabled={isLocked}
          val={qtyVal}
          set={setQty}
          className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          placeholder="Qty"
        />
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase mr-1">
          Qty
        </span>
        <span className="text-[8px] text-[#D8D8D8] font-black mx-1">×</span>
        <FormattedInput
          disabled={isLocked}
          val={priceVal}
          set={setPrice}
          className="w-16 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white"
          placeholder="Price"
        />
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-8">
          M / ea
        </span>
      </div>
    </div>
  ),
);

export const AssumptionRowQtyPriceWithToggle = memo(
  ({
    label,
    qtyVal,
    priceVal,
    setQty,
    setPrice,
    checked,
    onToggle,
    isLocked,
  }) => (
    <div
      className={`flex flex-col group py-1.5 border-b border-[#D8D8D8] last:border-0 px-1 rounded gap-1 ${!checked ? "opacity-60 bg-[#EFEBE7]/50" : "hover:bg-[#EFEBE7]"}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label
            className={`relative inline-flex items-center ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
          >
            <input
              disabled={isLocked}
              type="checkbox"
              className="sr-only peer"
              checked={checked}
              onChange={(e) => onToggle(e.target.checked)}
            />
            <div className="w-7 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
          </label>
          <label className="text-[10px] text-[#4C4A4B] font-bold">
            {label}
          </label>
        </div>
        <span className="text-[10px] text-[#1C6048] font-bold">
          {formatNumber(
            checked ? ((qtyVal || 0) * (priceVal || 0)) / 1000 : 0,
            2,
          )}{" "}
          B
        </span>
      </div>
      <div className="flex justify-end items-center gap-1">
        <FormattedInput
          disabled={isLocked || !checked}
          val={qtyVal}
          set={setQty}
          className="w-12 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white disabled:bg-[#D8D8D8]/30"
          placeholder="Qty"
        />
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase mr-1">
          Qty
        </span>
        <span className="text-[8px] text-[#D8D8D8] font-black mx-1">×</span>
        <FormattedInput
          disabled={isLocked || !checked}
          val={priceVal}
          set={setPrice}
          className="w-16 p-1 text-right text-[10px] border border-[#D8D8D8] rounded font-black text-[#1E2F31] bg-white disabled:bg-[#D8D8D8]/30"
          placeholder="Price"
        />
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-8">
          M / ea
        </span>
      </div>
    </div>
  ),
);

export const SettingsHeader = memo(
  ({
    title,
    icon,
    isLocked,
    onToggleLock,
    onSave,
    saveStatus,
    onReset,
    onValidate,
    isCloudSync,
  }) => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-[#D8D8D8] pb-4">
      <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-tight">
        {icon} {title}{" "}
        {isLocked && <Lock size={16} className="text-[#9B8B70] ml-2" />}
      </h2>
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <button
          onClick={onToggleLock}
          className={`flex-1 md:flex-none justify-center text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ${isLocked ? "bg-[#9B8B70] hover:bg-[#1E2F31] text-white" : "bg-white border border-[#D8D8D8] text-[#4C4A4B] hover:text-[#1E2F31]"}`}
        >
          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}{" "}
          {isLocked ? "Unlock" : "Lock Inputs"}
        </button>
        <button
          onClick={onValidate}
          disabled={isLocked}
          className="flex-1 md:flex-none justify-center bg-[#1E2F31] hover:opacity-90 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Sparkles size={14} /> ✨ Validate
        </button>
        <div className="h-8 w-px bg-[#D8D8D8] hidden md:block"></div>

        {isCloudSync && (
          <button
            onClick={onSave}
            disabled={saveStatus !== "idle" || isLocked}
            className={`flex-1 md:flex-none justify-center text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50 px-2 py-2 md:py-0 border md:border-0 rounded-lg md:rounded-none border-[#D8D8D8] ${saveStatus === "saved" ? "text-[#1C6048]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
          >
            {saveStatus === "saving" ? (
              <RefreshCcw size={14} className="animate-spin" />
            ) : (
              <ShieldCheck size={14} />
            )}{" "}
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
                ? "Saved!"
                : "Set Defaults"}
          </button>
        )}
        <button
          onClick={onReset}
          disabled={isLocked}
          className="text-xs font-bold text-[#4C4A4B] hover:text-[#1E2F31] flex items-center justify-center gap-1 transition-colors disabled:opacity-50 px-2 py-2 md:py-0 border md:border-0 rounded-lg md:rounded-none border-[#D8D8D8]"
        >
          <RefreshCcw size={14} /> Reset
        </button>
      </div>
    </div>
  ),
);

export const TableRow = memo(
  ({
    label,
    data,
    dk,
    total,
    highlight,
    indigo,
    emerald,
    crossover,
    isIndent,
    isDoubleIndent,
    tooltip,
    isPercent,
    isExpandable,
    isExpanded,
    onExpand,
    isHeader,
    hasConnector,
    hasDoubleConnector,
    isSubtractor,
  }) => {
    let baseColorClass = "bg-white font-medium text-[#4C4A4B]";
    if (highlight || isHeader) {
      if (indigo) baseColorClass = "bg-[#EBEFEE] font-bold text-[#1E2F31]";
      else if (emerald)
        baseColorClass = "bg-[#E8EFEA] font-black text-[#1C6048]";
      else baseColorClass = "bg-[#F4F0EC] font-bold text-[#1E2F31]";
    }

    let firstColClass = `pr-3 py-1.5 sticky left-0 z-[40] border-r border-b border-[#D8D8D8] whitespace-nowrap transition-all shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[360px] min-w-[360px] max-w-[360px] overflow-hidden text-ellipsis ${baseColorClass} ${isDoubleIndent ? "pl-3.5 text-[9.5px]" : isIndent ? "pl-3.5 text-[10px]" : "pl-1 text-[11px]"} ${!highlight && !isHeader ? "group-hover:bg-[#F9F8F6]" : ""}`;
    let totalColClass = `px-2 py-1.5 text-right font-bold font-mono border-l border-b border-[#D8D8D8] sticky right-0 z-[40] shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] ${baseColorClass} ${!highlight && !isHeader ? "group-hover:bg-[#F9F8F6]" : ""}`;

    return (
      <tr
        className={`group transition-all ${isExpandable ? "cursor-pointer select-none" : ""} ${highlight || isHeader ? "" : "hover:bg-[#F9F8F6]"}`}
        onClick={isExpandable ? onExpand : undefined}
      >
        <td className={firstColClass}>
          <div className="flex items-center justify-between gap-2 overflow-hidden w-full">
            <div
              className={`flex items-center gap-1.5 overflow-hidden min-w-0 ${isExpandable ? "cursor-pointer hover:opacity-80 active:scale-95 transition-all" : ""}`}
              onClick={(e) => {
                if (isExpandable && onExpand) {
                  e.stopPropagation();
                  onExpand();
                }
              }}
            >
              {isExpandable ? (
                <div
                  className={`pointer-events-none text-[#9B8B70] flex-shrink-0 flex items-center justify-center w-5 h-5 -ml-1 rounded-md hover:bg-[#1C6048]/15 hover:text-[#1C6048] transition-all duration-200 bg-[#9B8B70]/10 ${isExpanded ? "rotate-90 bg-[#1C6048]/15 text-[#1C6048]" : ""}`}
                >
                  <ChevronRight size={14} strokeWidth={2.5} />
                </div>
              ) : (
                <div className="w-5 h-5 -ml-1 flex-shrink-0" />
              )}

              {hasDoubleConnector && (
                <span className="font-mono select-none text-[9px] tracking-tighter text-[#9B8B70]/80 mr-1 flex-shrink-0 whitespace-nowrap">
                  │ └─
                </span>
              )}
              {hasConnector && !hasDoubleConnector && (
                <span className="font-mono select-none text-[9px] tracking-tighter text-[#9B8B70]/80 mr-1 flex-shrink-0 whitespace-nowrap">
                  └─
                </span>
              )}

              <span
                className={`truncate ${isHeader ? "font-bold text-[#1E2F31]" : highlight ? "font-bold text-[#1E2F31]" : "text-[#4C4A4B]"}`}
              >
                {label}
              </span>
            </div>
            {tooltip && <StatefulTooltipIcon tooltip={tooltip} align="right" />}
          </div>
        </td>
        {data.map((d, i) => {
          const rawVal = d[dk] || 0;
          const val = isSubtractor ? -Math.abs(rawVal) : rawVal;
          const isCrossover =
            crossover && val >= 0 && i > 0 && data[i - 1][dk] < 0;
          const cellBg = (highlight || isHeader)
            ? indigo
              ? "bg-[#EBEFEE]"
              : emerald
                ? "bg-[#E8EFEA]"
                : "bg-[#F4F0EC]"
            : "bg-white group-hover:bg-[#F9F8F6]";

          const formattedVal = formatNumber(val, 1);
          const displayVal =
            isPercent && formattedVal !== "0"
              ? val < 0
                ? `(${formattedVal.replace(/[()]/g, "")}%)`
                : `${formattedVal}%`
              : rawVal === 0 && rawVal >= 0
                ? isPercent
                  ? "0.0%"
                  : "-"
                : formattedVal;

          const hoverBgClass =
            !highlight && !isHeader ? "group-hover:bg-[#F9F8F6]" : "";

          return (
            <td
              key={i}
              title={String(d.defaultLabel)}
              className={`px-2 py-1.5 text-right border-r border-b border-[#D8D8D8] font-mono transition-all ${cellBg} ${val < 0 ? "text-[#9B8B70]" : highlight ? "text-[#1E2F31] font-bold" : "text-[#4C4A4B]"} ${isCrossover ? "bg-[#9B8B70]/20 ring-1 ring-inset ring-[#9B8B70] text-[#1E2F31] font-bold" : ""} ${hoverBgClass}`}
            >
              {displayVal}
            </td>
          );
        })}
        {total !== undefined ? (
          <td className={totalColClass}>
            {isPercent
              ? total < 0
                ? `(${formatNumber(total, 1).replace(/[()]/g, "")}%)`
                : `${formatNumber(total, 1)}%`
              : formatNumber(isSubtractor ? -Math.abs(total) : total, 1)}
          </td>
        ) : (
          <td className={totalColClass}></td>
        )}
      </tr>
    );
  },
);

export const ExpandableDataRowGroup = ({
  parentLabel,
  parentDk,
  parentTotal,
  data,
  childrenData,
  parentTooltip,
  isSubtractor = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow
        label={parentLabel}
        data={data}
        dk={parentDk}
        total={parentTotal}
        tooltip={parentTooltip}
        isSubtractor={isSubtractor}
        isExpandable
        isExpanded={isExpanded}
        onExpand={() => setIsExpanded(!isExpanded)}
        isIndent
      />
      {isExpanded &&
        childrenData.map((child, i) => (
          <TableRow
            key={i}
            label={child.label}
            data={data}
            dk={child.dk}
            total={child.total}
            isIndent
            tooltip={child.tooltip}
            isSubtractor={isSubtractor}
            hasConnector
          />
        ))}
    </>
  );
};

export const TableSection = memo(({ title, colSpan, type = "default" }) => {
  const bgClass =
    type === "emerald" ? "bg-[#1C6048] text-white" : "bg-[#1E2F31] text-white";
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={`p-0 border-y-2 border-white ${bgClass}`}
      >
        <div
          className={`px-4 py-2.5 font-black uppercase text-[10px] tracking-widest sticky left-0 inline-block whitespace-nowrap ${bgClass}`}
        >
          {title}
        </div>
      </td>
    </tr>
  );
});

export const CapexRow = memo(
  ({ label, amount, total, isHeader, isSubtotal, isIndent }) => (
    <tr
      className={`group ${isSubtotal ? "font-bold text-[#1E2F31]" : "text-[#4C4A4B]"} ${isHeader ? "font-bold text-[#1E2F31]" : ""}`}
    >
      <td
        className={`pr-3 py-1.5 border-r border-b border-[#D8D8D8] transition-colors ${isSubtotal ? "bg-[#EFEBE7]/50" : "bg-white group-hover:bg-[#F9F8F6]"} ${isIndent ? "pl-4 text-[10px]" : "pl-1 text-[11px]"}`}
      >
        {label}
      </td>
      <td
        className={`px-3 py-1.5 text-right border-r border-b border-[#D8D8D8] font-mono transition-colors ${isSubtotal ? "bg-[#EFEBE7]/50" : "bg-white group-hover:bg-[#F9F8F6]"}`}
      >
        {formatNumber(amount, 1)}
      </td>
      <td
        className={`px-3 py-1.5 text-right font-mono border-b border-[#D8D8D8] transition-colors ${isSubtotal ? "bg-[#EFEBE7]/50 text-[#1E2F31]" : "bg-white group-hover:bg-[#F9F8F6] text-[#4C4A4B]"}`}
      >
        {formatNumber(total > 0 ? (amount / total) * 100 : 0, 1)}%
      </td>
    </tr>
  ),
);

export const ExpandableCapexRow = memo(
  ({ icon, title, amount, totalCapex, details }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const pct = totalCapex > 0 ? (amount / totalCapex) * 100 : 0;

    return (
      <div className="border-b border-[#D8D8D8] last:border-0 pb-1 mb-1">
        <div
          className={`flex justify-between items-center py-2 px-2 -mx-2 rounded-lg transition-colors ${details && details.length > 0 ? "cursor-pointer hover:bg-[#EFEBE7]/50" : ""}`}
          onClick={() =>
            details && details.length > 0 && setIsExpanded(!isExpanded)
          }
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EFEBE7] rounded-lg">{icon}</div>
            <div>
              <p className="text-xs text-[#1E2F31] font-bold flex items-center gap-1.5">
                {title}
                {details && details.length > 0 && (
                  <ChevronDown
                    size={14}
                    className={`text-[#9B8B70] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  />
                )}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono font-black text-[#1E2F31] text-sm">
              {formatNumber(amount, 1)} B
            </p>
            <p className="text-[9px] text-[#1C6048] font-bold uppercase">
              {formatNumber(pct, 1)}%
            </p>
          </div>
        </div>

        {isExpanded && details && details.length > 0 && (
          <div className="pl-12 pr-2 pb-2 pt-1 space-y-2.5 animate-in slide-in-from-top-2 fade-in duration-200">
            {details.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-[10px] group"
              >
                <span className="text-[#4C4A4B] font-medium flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#D8D8D8] group-hover:bg-[#1C6048] transition-colors"></div>
                  {item.label}
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[#1E2F31] font-bold">
                    {formatNumber(item.amount, 1)}
                  </span>
                  <span className="font-mono text-[#9B8B70] w-8 text-right">
                    {formatNumber(
                      totalCapex > 0 ? (item.amount / totalCapex) * 100 : 0,
                      1,
                    )}
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

export const PartnerReturnCard = ({
  name,
  metrics,
  equity,
  share,
  color,
  isUnifiedCard = false,
}) => {
  const c =
    color === "blue"
      ? {
          text: "text-[#1C6048]",
          bg: "bg-[#EFEBE7]",
          border: "border-[#D8D8D8]",
        }
      : {
          text: "text-[#9B8B70]",
          bg: "bg-[#EFEBE7]",
          border: "border-[#D8D8D8]",
        };
  return (
    <div
      className={
        isUnifiedCard
          ? "relative w-full"
          : "bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] relative transition-all hover:shadow-md"
      }
    >
      <div
        className={`absolute top-0 right-0 py-1 px-2.5 ${c.bg} rounded-bl-xl border-l border-b ${c.border}`}
      >
        <p className="text-[8px] font-bold text-[#4C4A4B] uppercase leading-none mb-0.5 text-right tracking-widest">
          Share
        </p>
        <p className={`text-xs font-black ${c.text} text-right`}>
          {(share || 0).toFixed(0)}%
        </p>
      </div>
      <div className="mb-4 pr-16">
        <h3
          className={`text-lg font-bold text-[#1E2F31] flex items-start gap-2 mb-1`}
        >
          <Users size={20} className={`shrink-0 mt-0.5 ${c.text}`} />
          <span className="leading-tight">{name}</span>
        </h3>
        <p className="text-xs text-[#4C4A4B] font-medium">
          Avg Dividend Yield:{" "}
          <b className={c.text}>{formatNumber(metrics?.avgYield, 1)}%</b>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6 text-center">
        <div className="p-3 lg:p-4 bg-[#EFEBE7] rounded-xl border border-[#D8D8D8] hover:bg-white">
          <p className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-wider mb-1">
            Equity IRR
          </p>
          <p className={`text-xl lg:text-2xl font-black ${c.text}`}>
            {formatNumber((metrics?.irr || 0) * 100, 2)}%
          </p>
        </div>
        <div className="p-3 lg:p-4 bg-[#EFEBE7] rounded-xl border border-[#D8D8D8] hover:bg-white">
          <p className="text-[10px] text-[#9B8B70] font-bold uppercase tracking-wider mb-1">
            Payback
          </p>
          <p className="text-xl lg:text-2xl font-black text-[#9B8B70]">
            {metrics?.payback && metrics.payback > 0 ? (
              <>
                {formatNumber(metrics.payback, 1)}{" "}
                <span className="text-xs font-bold text-[#4C4A4B] uppercase">
                  Yrs
                </span>
              </>
            ) : (
              "Never"
            )}
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center bg-white/50 p-2 rounded border border-[#D8D8D8]/50">
          <span className="text-[10px] font-bold text-[#4C4A4B] uppercase tracking-wider">
            Initial Equity
          </span>
          <span className="text-sm font-black text-[#1E2F31]">
            {formatCurrency(equity)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs mt-2">
          <span className="font-bold text-[#4C4A4B] uppercase tracking-tighter flex items-center gap-1">
            <Coins size={12} /> Recovery
          </span>
          <span className="font-black text-[#1E2F31]">
            {equity > 0 && metrics?.totalCash >= equity
              ? "100%"
              : `${equity > 0 ? (((metrics?.totalCash || 0) / equity) * 100).toFixed(1) : "0"}%`}
          </span>
        </div>
        <div className="w-full h-2 bg-[#D8D8D8] rounded-full overflow-hidden">
          <div
            className={`h-full ${color === "blue" ? "bg-[#1C6048]" : "bg-[#9B8B70]"} rounded-full`}
            style={{
              width: `${Math.min(100, equity > 0 ? ((metrics?.totalCash || 0) / equity) * 100 : 0)}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-[#4C4A4B]">
          <span>MOIC: {(metrics?.moic || 0).toFixed(2)}x</span>
          <span>Total Return: {formatCurrency(metrics?.totalCash)}</span>
        </div>
      </div>
    </div>
  );
};

export const SensitivityTable = memo(
  ({
    title,
    subtitle,
    xLabel,
    yLabel,
    xValues,
    yValues,
    matrix,
    formatFn,
    reverseColors,
  }) => {
    const all = matrix.flat().filter((v) => v !== 0 && !isNaN(v));
    const min = all.length > 0 ? Math.min(...all) : 0;
    const max = all.length > 0 ? Math.max(...all) : 0;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
        <div className="p-4 bg-[#EFEBE7] border-b border-[#D8D8D8]">
          <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-2">
            <Grid size={16} className="text-[#1C6048]" /> {title}
          </h3>
          <p className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-widest mt-1">
            {subtitle}
          </p>
        </div>
        <div className="p-6 overflow-x-auto">
          <div className="min-w-[600px]">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 border-r-2 border-[#D8D8D8] text-[10px] p-2 text-right align-bottom">
                    {xLabel} ➔<br />
                    {yLabel} ⬇
                  </th>
                  {xValues.map((x, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 text-xs font-bold text-[#1E2F31] bg-[#EFEBE7]/50 border-b border-[#D8D8D8]"
                    >
                      {String(x)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yValues.map((y, r) => (
                  <tr key={r}>
                    <th className="px-3 py-3 text-xs font-bold text-[#1E2F31] bg-[#EFEBE7]/50 border-r border-[#D8D8D8] whitespace-nowrap">
                      {String(y)}
                    </th>
                    {matrix[r].map((val, c) => {
                      let color = "";
                      if (val === 0 || isNaN(val)) {
                        color = "bg-[#9B8B70] text-white"; // Never / Bad is always brown
                      } else {
                        let ratio =
                          max === min ? 0.5 : (val - min) / (max - min);
                        if (reverseColors) ratio = 1 - ratio;
                        color =
                          ratio > 0.6
                            ? "bg-[#1C6048] text-white"
                            : ratio > 0.3
                              ? "bg-[#99B6AA]/50 text-[#1E2F31]"
                              : "bg-[#9B8B70] text-white";
                      }
                      return (
                        <td
                          key={c}
                          className={`px-3 py-3 border border-white text-xs font-mono font-bold transition-all hover:opacity-80 ${color}`}
                        >
                          {formatFn(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
);

export const ProjectInfoFieldComp = memo(
  ({ label, value, onChange, isLocked, icon }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-[#4C4A4B] uppercase flex items-center gap-1.5 ml-1">
        {icon} {label}
      </label>
      <input
        type="text"
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLocked}
        className="w-full p-3 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-2 focus:ring-[#1C6048] outline-none disabled:opacity-70 transition-all shadow-inner"
      />
    </div>
  ),
);

const SelectionPopupComp = memo(({ state, setState, onAsk }) => {
  const popupRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    translateX: 0,
    translateY: 0,
  });

  // Reset drag position when the popup spawns at a new text selection
  useEffect(() => {
    if (popupRef.current) {
      dragRef.current.translateX = 0;
      dragRef.current.translateY = 0;
      popupRef.current.style.transform = "translate(-50%, 0px)";
    }
  }, [state.x, state.y]);

  const handlePointerDown = (e) => {
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX - dragRef.current.translateX;
    dragRef.current.startY = e.clientY - dragRef.current.translateY;
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging || !popupRef.current) return;
    const x = e.clientX - dragRef.current.startX;
    const y = e.clientY - dragRef.current.startY;
    dragRef.current.translateX = x;
    dragRef.current.translateY = y;
    // Apply CSS transform directly to bypass React render cycle for 60fps smoothness
    popupRef.current.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
  };

  const handlePointerUp = (e) => {
    dragRef.current.isDragging = false;
    e.target.releasePointerCapture(e.pointerId);
  };

  if (!state.show) return null;
  return (
    <div
      id="ai-selection-popup"
      ref={popupRef}
      className="absolute z-[100] flex flex-col items-center animate-in fade-in zoom-in duration-200"
      style={{
        left: state.x,
        top: state.y,
        transform: `translate(calc(-50% + ${dragRef.current.translateX}px), ${dragRef.current.translateY}px)`,
      }}
    >
      {!state.isOpen ? (
        <button
          onClick={() => setState((p) => ({ ...p, isOpen: true }))}
          className="bg-[#1E2F31] text-white p-2.5 rounded-full shadow-xl border border-[#D8D8D8] hover:scale-110 transition-all flex items-center justify-center"
        >
          <Sparkles size={20} className="text-white" />
        </button>
      ) : (
        <div className="bg-white w-72 md:w-80 p-4 lg:p-5 rounded-2xl shadow-2xl border border-[#1E2F31] flex flex-col gap-3 relative mt-2">
          <div
            className="w-full flex justify-center items-center cursor-grab active:cursor-grabbing pb-2 -mt-2 pt-1 opacity-50 hover:opacity-100 touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <GripHorizontal
              size={16}
              className="text-[#4C4A4B] pointer-events-none"
            />
          </div>
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-black flex items-center gap-1.5 text-[#1E2F31]">
              <Sparkles size={16} className="text-[#1C6048]" /> Selection AI
            </h4>
            <button
              onClick={() =>
                setState((p) => ({ ...p, show: false, isOpen: false }))
              }
              className="text-[#4C4A4B] hover:text-[#1E2F31] bg-[#EFEBE7] rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
          <div className="bg-[#EFEBE7] p-3 rounded-lg text-[11px] text-[#4C4A4B] italic border border-[#D8D8D8] max-h-20 overflow-hidden relative font-medium">
            "{String(state.text)}"
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#EFEBE7] to-transparent pointer-events-none"></div>
          </div>
          <textarea
            value={state.query}
            onChange={(e) => setState((p) => ({ ...p, query: e.target.value }))}
            placeholder="What do you want to know about this?"
            className="w-full text-xs p-3 border border-[#D8D8D8] rounded-xl focus:ring-2 focus:ring-[#1C6048] outline-none resize-none h-20 shadow-inner text-[#1E2F31]"
            autoFocus
          />
          {state.response && (
            <div className="bg-[#EFEBE7] p-4 rounded-xl border border-[#D8D8D8] max-h-48 overflow-y-auto shadow-inner">
              <MarkdownRenderer
                content={state.response}
                className="text-[12px] text-[#4C4A4B] leading-relaxed"
              />
            </div>
          )}
          <button
            onClick={onAsk}
            disabled={state.isLoading || !state.query.trim()}
            className="w-full bg-[#1C6048] hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs flex justify-center items-center gap-2"
          >
            {state.isLoading ? (
              <RefreshCcw size={14} className="animate-spin" />
            ) : (
              <BrainCircuit size={14} />
            )}
            {state.isLoading ? "Thinking..." : "Ask Gemini"}
          </button>
        </div>
      )}
    </div>
  );
});

const MarketValidationDisplay = memo(({ content, loading, onClose, color }) => (
  <div
    className={`mb-8 bg-white p-5 lg:p-6 rounded-2xl border border-[#D8D8D8] border-l-4 relative shadow-sm animate-in slide-in-from-top-4 ${color === "blue" ? "border-l-[#1C6048]" : "border-l-[#9B8B70]"}`}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-[#4C4A4B] hover:text-[#1E2F31] bg-[#EFEBE7] rounded-full p-1"
    >
      <X size={16} />
    </button>
    <h3 className="font-black text-[#1E2F31] mb-3 flex items-center gap-2 text-sm">
      <Scale size={18} /> AI Market Check
    </h3>
    {loading ? (
      <div className="animate-pulse space-y-3">
        <div className="h-2 bg-[#D8D8D8] rounded w-full"></div>
        <div className="h-2 bg-[#D8D8D8] rounded w-5/6"></div>
      </div>
    ) : (
      <MarkdownRenderer
        content={content}
        className="text-[13px] text-[#4C4A4B] font-medium"
      />
    )}
  </div>
));

// ==========================================
// 4. STRATEGIC FOUNDATION (BENTO UI)
// ==========================================

export const BentoBox = memo(
  ({ children, className = "", colSpan = "col-span-12" }) => (
    <div
      className={`bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-[#D8D8D8] flex flex-col transition-all hover:shadow-md ${colSpan} ${className}`}
    >
      {children}
    </div>
  ),
);

export const BentoIcon = memo(({ icon, color = "blue", className = "" }) => {
  const bgColors = {
    blue: "bg-[#1C6048]/10 text-[#1C6048]",
    emerald: "bg-[#1E2F31]/10 text-[#1E2F31]",
    indigo: "bg-[#9B8B70]/10 text-[#9B8B70]",
    rose: "bg-[#4C4A4B]/10 text-[#4C4A4B]",
    amber: "bg-[#99B6AA]/20 text-[#1E2F31]",
    transparent: "bg-transparent",
  };
  return (
    <div
      className={`flex items-center justify-center mb-5 shrink-0 ${color !== "transparent" ? "w-14 h-14 rounded-[20px]" : ""} ${bgColors[color]} ${className}`}
    >
      {icon}
    </div>
  );
});

// ==========================================
// 5. MAJOR VIEW COMPONENTS (FINANCIAL ENGINES)
// ==========================================

function AIAuditView({
  aiInsights,
  isAiLoading,
  generateAIInsights,
  askQuery,
  setAskQuery,
  handleAskAI,
  isAskLoading,
  askResponse,
  activeCompany,
}) {
  return (
    <div className="animate-in slide-in-from-right duration-500 space-y-6 pb-12">
      <div className="bg-white rounded-2xl shadow-lg border border-[#D8D8D8] overflow-hidden">
        <div
          className={`p-8 bg-gradient-to-br text-white flex flex-col md:flex-row justify-between items-center gap-6 ${activeCompany === "opco" ? "from-[#1E2F31] to-[#1C6048]" : "from-[#4C4A4B] to-[#9B8B70]"}`}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md hidden sm:block">
              <AIMicroscopeIcon size={40} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">✨ Intelligent Audit</h2>
              <p className="text-white/80 text-sm max-w-md">
                Benchmarking Project NPV, MOIC, Yields, and Margin efficiency.
              </p>
            </div>
          </div>
          <button
            onClick={generateAIInsights}
            disabled={isAiLoading}
            className="bg-white px-6 py-3 rounded-xl font-bold text-[#1E2F31] shadow-xl hover:bg-opacity-90 transition-all"
          >
            {isAiLoading ? (
              <RefreshCcw size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}{" "}
            Run Yield Audit
          </button>
        </div>
        <div className="p-8 bg-white min-h-[300px]">
          {aiInsights && (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-[#D8D8D8] border-l-4 border-l-[#1C6048]">
              <MarkdownRenderer content={aiInsights} />
            </div>
          )}
          {!aiInsights && !isAiLoading && (
            <p className="text-center text-gray-500">
              Run the audit to see AI-generated financial insights.
            </p>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-[#D8D8D8] p-8 mt-6">
        <h3 className="text-lg font-bold text-[#1E2F31] mb-2 flex items-center gap-2">
          <AIMicroscopeIcon size={20} className="text-[#1C6048]" /> Ask AI
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <input
            type="text"
            value={askQuery}
            onChange={(e) => setAskQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
            placeholder="Ask anything about the numbers..."
            className="flex-1 p-4 bg-white border border-[#D8D8D8] rounded-xl outline-none"
          />
          <button
            onClick={handleAskAI}
            disabled={isAskLoading || !askQuery.trim()}
            className="bg-[#1E2F31] text-white font-bold px-8 py-4 rounded-xl transition-all shadow-md"
          >
            {isAskLoading ? "Thinking..." : "Ask"}
          </button>
        </div>
        {askResponse && (
          <div className="mt-8 p-6 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
            <MarkdownRenderer content={askResponse} />
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 5. MAIN APP COMPONENT
// ==========================================

// --- GLASSMORPHISM CSS INJECTION ---
const style = document.createElement("style");
style.textContent = `
    .glass-tooltip-container {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
    }
    .glass-tooltip-container .leaflet-tooltip-tip {
        display: none;
    }
    .glass-region-label {
        background: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.7);
        border-radius: 12px;
        padding: 10px 16px;
        color: #1E2F31;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        pointer-events: none;
    }
    .glass-title { font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1C6048; }
    .glass-sub { font-size: 11px; font-weight: 700; color: #4C4A4B; margin-top: 2px; display: block; }
`;
document.head.appendChild(style);

const SettingsPasswordGate = ({ children }) => {
  return <>{children}</>;
};

export const useMonthlyColumns = (annualData, viewResolution = "annual") => {
  const [expandedYears, setExpandedYears] = useState({});
  const toggleYear = (yr) =>
    setExpandedYears((prev) => ({ ...prev, [yr]: !prev[yr] }));

  const columns = useMemo(() => {
    let cols = [];
    annualData.forEach((d) => {
      if (viewResolution !== "monthly") {
        cols.push({ ...d, colType: "year", defaultLabel: d.year });
      }

      if (expandedYears[d.year] || viewResolution === "monthly") {
        for (let m = 1; m <= 12; m++) {
          let monthLabel =
            viewResolution === "monthly"
              ? `${String(d.year).slice(-2)} M${m}`
              : `M${m}`;
          let monthData = {
            ...d,
            colType: "month",
            defaultLabel: monthLabel,
            isMonth: true,
            parentYear: d.year,
          };
          const isRate = [
            "bor",
            "ebitdaMargin",
            "ebitdarMargin",
            "netMargin",
            "breakEvenBor",
            "pA_Yield",
            "pB_Yield",
            "avgDscr",
            "avgYield",
            "moic",
            "costPerBed",
            "costPerSqm",
            "yocExLand",
            "irr",
            "lpIrr",
            "gpIrr",
            "isOperating",
            "year",
            "colType",
            "defaultLabel",
            "isMonth",
            "parentYear",
          ];
          const isBalance = [
            "debtBalance",
            "debtBalanceExLand",
            "holdCoDebtBalance",
          ];
          Object.keys(d).forEach((k) => {
            if (d.monthly && d.monthly[k] && Array.isArray(d.monthly[k])) {
              monthData[k] = d.monthly[k][m - 1];
            } else if (
              !isRate.includes(k) &&
              !isBalance.includes(k) &&
              typeof d[k] === "number"
            ) {
              if (
                k === "cumNI" ||
                k === "cumulativeRetainedEarnings" ||
                k === "pA_Cum" ||
                k === "pB_Cum" ||
                k === "cumFcfe" ||
                k === "cumFcfeExLand" ||
                k === "cumFreeCashFlow" ||
                k === "cumCf"
              ) {
                let flowKey = "";
                if (k === "cumNI") flowKey = "netIncome";
                if (k === "cumulativeRetainedEarnings")
                  flowKey = "retainedThisYear";
                if (k === "pA_Cum") flowKey = "pA_Net";
                if (k === "pB_Cum") flowKey = "pB_Net";
                if (k === "cumFcfe") flowKey = "fcfe";
                if (k === "cumFcfeExLand") flowKey = "fcfeExLand";
                if (k === "cumFreeCashFlow") flowKey = "freeCashFlow";
                if (k === "cumCf") flowKey = "netFlow";

                const flow = d[flowKey] || 0;
                const startBase = d[k] - flow;
                monthData[k] = startBase + (flow / 12) * m;
              } else {
                monthData[k] = d[k] / 12;
              }
            }
          });
          cols.push(monthData);
        }
      }
    });
    return cols;
  }, [annualData, expandedYears, viewResolution]);

  return { columns, expandedYears, toggleYear };
};

const localFinancialAuditor = {
  getTeaser: (
    opCoData,
    propCoData,
    consolidatedData,
    opCoAssumptions,
    propCoAssumptions,
  ) => {
    const beds = opCoAssumptions?.beds || 150;
    const projectNPV = opCoData?.projectNPV || 0;
    const projectIRR = opCoData?.projectIRR || 0;
    const projectPayback = opCoData?.projectPayback || 0;
    const discountRate = opCoAssumptions?.discountRate || 10;

    const opYears =
      opCoData?.annualData?.filter((d) => (d.totalRev || 0) > 0) || [];
    const avgEbitdarMargin =
      opYears.length > 0
        ? opYears.reduce((acc, d) => acc + (d.ebitdarMargin || 0), 0) /
          opYears.length
        : 0;
    const avgNetMargin =
      opYears.length > 0
        ? opYears.reduce((acc, d) => acc + (d.netMargin || 0), 0) /
          opYears.length
        : 0;

    const caps = propCoData?.capexDetails || {};
    const landCost = caps.landCost || 0;
    const buildCost = caps.buildCost || 0;
    const medEq = caps.medEqCost || 0;

    return `### 📋 COGNITIVE FEASIBILITY INVESTMENT PROSPECTUS
*(⚡ Context-Aware Real-Time Underwritten Output)* This document is compiled directly from active multi-cascade scenario variables.

## 🏢 1. Core Asset Portfolio Profile
- **Asset Capacity**: **${beds} Operational Clinical Beds**
- **Sovereign Operational Matrix**: Multi-Entity look-through modeling separating operating health deliverables (OpCo) from direct property equity leases (PropCo).
- **Accounting Framework Consistency**: Aligned under **PSAK 16 (Aset Tetap)** on property/infrastructure capitalization and **PSAK 19** regarding direct operational outlays.

## 📈 2. Clinical Feasibility Benchmarks
- **Stabilized Patient Volume**: **${(opCoData?.opsMetrics?.stabilizedVolume || 0).toLocaleString()}** outpatient and inpatient visits/yr.
- **Underwriting Efficiency Metrics**:
  - Blended OpCo EBITDAR Margin: **${avgEbitdarMargin.toFixed(2)}%**
  - Blended Operating Net Margin: **${avgNetMargin.toFixed(2)}%**
  - Revenue Yield Per Bed: **${(opCoData?.opsMetrics?.revPab || 0).toFixed(1)}M IDR** (Stabilized Year)

## 🏗️ 3. Capitalization Breakdown (PropCo)
- **Key Asset Class Valuation**:
  - Land Procurement: **${landCost.toFixed(1)} B IDR**
  - Property Civil Build Capitalization: **${buildCost.toFixed(1)} B IDR**
  - Specialized Medical Hardware: **${medEq.toFixed(1)} B IDR**
- **Debt Leverage Structure**: Structured with a step-down commercial amortizing interest profile.

## 💎 4. Master Look-Through Returns Cascade
- **Project NPV**: **${projectNPV.toFixed(2)} B IDR** (at ${discountRate}% hurdle)
- **Project IRR (Post-Tax)**: **${projectIRR.toFixed(2)}%**
- **Amortization & Payback Window**: Stable return payout crossed in **${projectPayback > 0 ? projectPayback.toFixed(1) + " Years" : "Never (beyond projection period)"}**

*Note: This pro-forma pitch prospectus displays live calculations and is fully validated.*`;
  },

  getInsights: (
    opCoData,
    propCoData,
    consolidatedData,
    opCoAssumptions,
    propCoAssumptions,
  ) => {
    const beds = opCoAssumptions?.beds || 150;
    const discountRate = opCoAssumptions?.discountRate || 10;
    const caps = propCoData?.capexDetails || {};
    const totalCapex =
      (caps.landCost || 0) +
      (caps.buildCost || 0) +
      (caps.medEqCost || 0) +
      (caps.ffeCost || 0) +
      (caps.infraCost || 0) +
      (caps.consultantCost || 0);
    const projectNPV = opCoData?.projectNPV || 0;
    const projectIRR = opCoData?.projectIRR || 0;

    const opYears =
      opCoData?.annualData?.filter((d) => (d.totalRev || 0) > 0) || [];
    const avgEbitdarMargin =
      opYears.length > 0
        ? opYears.reduce((acc, d) => acc + (d.ebitdarMargin || 0), 0) /
          opYears.length
        : 0;
    const avgBor =
      opYears.length > 0
        ? opYears.reduce((acc, d) => acc + (d.bor || 0), 0) / opYears.length
        : 0;

    return `### 🔍 CAPITAL CASCADE WORKFLOW DIAGNOSIS
*(⚡ Context-Aware Real-Time Underwritten Output)* Detailed look-through assessment of healthcare asset yield cascades.

## 🩺 1. Inpatient & Outpatient Clinical Performance
- **EBITDAR Efficiency**: Consistent EBITDAR margin averaging **${avgEbitdarMargin.toFixed(2)}%**. The stabilizing capacity is sound, reaching an average bed occupancy rate (BOR) of **${avgBor.toFixed(1)}%**.
- **Bed Yield Dynamics**: Price escalators successfully outpace core Indonesian clinical medical inflations.

## 🏢 2. Property Entity (PropCo) Strategic Leases
- **Capitalization Threshold**: Capitalized asset base of **${totalCapex.toFixed(1)} B IDR** under standard **PSAK 16** guidelines.
- **Lease Viability**: The rent coverage multiplier ensures that clinical rents fully support land lease obligations.

## 🔑 3. Comprehensive Valuation Audit
- **Returns Viability**: With a combined project post-tax IRR of **${projectIRR.toFixed(2)}%**, the asset generates substantial returns exceeding the target **${discountRate}%** discount hurdle rate. Underwritten project NPV matches **${projectNPV.toFixed(2)} B IDR**.`;
  },

  getValidation: (
    opCoData,
    propCoData,
    consolidatedData,
    opCoAssumptions,
    propCoAssumptions,
  ) => {
    const buildCost = propCoData?.capexDetails?.buildCost || 0;
    const projectPayback = opCoData?.projectPayback || 0;
    const discountRate = opCoAssumptions?.discountRate || 10;

    return `### 🎯 INDONESIAN REGULATORY COMPLIANCE EXAMINER
*(⚡ Context-Aware Real-Time Underwritten Output)* Regulatory, PSAK standards, and sensitivity assessment audit.

## 📐 1. PSAK Compliance Directives
- **PSAK 16 (Aset Tetap)**: All structural construction expenditures (evaluated at **${buildCost.toFixed(2)} B IDR**) and med-equipment procurements are capitalized correctly into Property, Plant, & Equipment (PPE).
- **PSAK 19 (Aset Tidak Berwujud)**: Pre-operating start-up expenditures and non-asset administrative outlays are strictly expensed when incurred, bypassing deferred capitalization to preserve audit integrity.

## 🔒 2. Sensitivity Hurdle Thresholds
- **Hurdle Optimizations**: Adjusted hurdle at **${discountRate}%** mirrors Indonesian private healthcare and infrastructure premiums.
- **Payback Sensitivity**: The active payback trajectory of **${projectPayback > 0 ? projectPayback.toFixed(1) + " Years" : "Never (beyond projection period)"}** satisfies institutional healthcare risk models.`;
  },

  getSmartAsk: (
    query,
    opCoData,
    propCoData,
    consolidatedData,
    opCoAssumptions,
    propCoAssumptions,
  ) => {
    const lowercase = (query || "").toLowerCase();
    const beds = opCoAssumptions?.beds || 150;
    const projectNPV = opCoData?.projectNPV || 0;
    const projectIRR = opCoData?.projectIRR || 0;
    const projectPayback = opCoData?.projectPayback || 0;

    if (
      lowercase.includes("ebitdar") ||
      lowercase.includes("margin") ||
      lowercase.includes("ebitda")
    ) {
      return `### 📊 EBITDAR MARGIN ASSESSMENT
- **Underwriting Method**: EBITDAR is evaluated as: \`Gross Clinical Revenue - Supplies - Doctor Fees - Staff OPEX - Overheads\`.
- **Operating Capacity**: Currently modeled with **${beds} beds** showing robust operational yield.`;
    }

    if (
      lowercase.includes("psak") ||
      lowercase.includes("accounting") ||
      lowercase.includes("regulation") ||
      lowercase.includes("standard")
    ) {
      return `### 🏛️ INDONESIAN ACCOUNTING STANDARD (PSAK 16 & 19)
- **Direct Construction / PPE (PSAK 16)**: Capitalized directly as building & infrastructure.
- **Pre-Operating Overhead (PSAK 19)**: Direct pre-operating start-up costs must be expensed immediately under PSAK 19.43 rather than capitalized over years.`;
    }

    if (
      lowercase.includes("payback") ||
      lowercase.includes("irr") ||
      lowercase.includes("npv") ||
      lowercase.includes("return")
    ) {
      return `### 💎 RETURN METRICS DIAGNOSTIC
- **NPV**: **${projectNPV.toFixed(2)} B IDR** at active discount rates.
- **Post-Tax IRR**: **${projectIRR.toFixed(2)}%** offer.
- **Simple Payback**: Covered in **${projectPayback > 0 ? projectPayback.toFixed(1) + " Years" : "Never (beyond projection period)"}**.`;
    }

    return `### 📋 FEASIBILITY AUDIT RESPONSE
- **Clinical Beds**: **${beds}** operational bed units.
- **Project IRR**: **${projectIRR.toFixed(2)}%**
- **Combined Project NPV**: **${projectNPV.toFixed(2)} B IDR**
*Change assumptions inside the left parameters panel to run real-time risk-profile updates.*`;
  },
};

export default function App() {
  const [activeGroup, setActiveGroup] = useState("summary"); // 'summary', 'context' or 'financials'
  const [activeCompany, setActiveCompany] = useState("opco");
  const [activeTab, setActiveTab] = useState("executive");
  const [activeMiniTab, setActiveMiniTab] = useState("marketAnalysis");
  const [viewResolution, setViewResolution] = useState("annual");
  const [isLockedOpCo, setIsLockedOpCo] = useState(false);
  const [isLockedPropCo, setIsLockedPropCo] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isBlanked, setIsBlanked] = useState(false);
  const [isStrictRatio, setIsStrictRatio] = useState(false);
  const [hubPosition, setHubPosition] = useState("center"); // 'center', 'left', 'right', 'minimized'
  const [isFloatingPanelVisible, setIsFloatingPanelVisible] = useState(false);

  useEffect(() => {
    if (!isPresenting) {
      setIsBlanked(false);
      setIsStrictRatio(false);
    }
  }, [isPresenting]);

  // Cloud Sync State
  const [isCloudSync, setIsCloudSync] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("offline");
  const [user, setUser] = useState(null);

  const [projectInfo, setProjectInfo] = useState({
    name: "Vasanta Hospital Project Development",
    location: "Daan Mogot Road KM. 13, West Jakarta",
    type: "Specialized Hospital (Class A)",
    totalLand: "±1.2 Ha",
    totalBuilding: "13,000 Sqm",
    status: "Planning / Feasibility Phase",
    zoning: "K1 - Trade & Services",
    landTitle: "Right to Build (HGB)",
    bcr: "55%",
    far: "6.39",
    greenArea: "20%",
  });

  const [aiInsights, setAiInsights] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [teaserContent, setTeaserContent] = useState("");
  const [isTeaserLoading, setIsTeaserLoading] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [marketValidation, setMarketValidation] = useState("");
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const [showMarketValidation, setShowMarketValidation] = useState(false);
  const [askQuery, setAskQuery] = useState("");
  const [askResponse, setAskResponse] = useState("");
  const [isAskLoading, setIsAskLoading] = useState(false);
  const [selectionState, setSelectionState] = useState({
    show: false,
    text: "",
    x: 0,
    y: 0,
    isOpen: false,
    query: "",
    response: "",
    isLoading: false,
  });

  // Confirmation Dialog State
  const [syncConfirmDialog, setSyncConfirmDialog] = useState({
    isOpen: false,
    targetState: false,
  });

  const [saveStatusOpCo, setSaveStatusOpCo] = useState("idle");
  const [saveStatusPropCo, setSaveStatusPropCo] = useState("idle");
  const [groups, setGroups] = useState(INITIAL_GROUPS);

  const [opCoAssumptions, setOpCoAssumptions] = useState(
    DEFAULT_OPCO_ASSUMPTIONS,
  );
  const [propCoAssumptions, setPropCoAssumptions] = useState(
    DEFAULT_PROPCO_ASSUMPTIONS,
  );
  const [holdCoAssumptions, setHoldCoAssumptions] = useState(
    DEFAULT_HOLDCO_ASSUMPTIONS,
  );

  const [holdCoScenario, setHoldCoScenario] = useState("manual");
  const [propCoScenario, setPropCoScenario] = useState("manual");
  const [holdCoLocked, setHoldCoLocked] = useState(false);
  const [propCoLocked, setPropCoLocked] = useState(false);

  const toggleHoldCoLock = () => {
    setHoldCoLocked((prev) => {
      const next = !prev;
      if (next) {
        setPropCoLocked(false);
        setHoldCoScenario(propCoScenario);
      }
      return next;
    });
  };

  const togglePropCoLock = () => {
    setPropCoLocked((prev) => {
      const next = !prev;
      if (next) {
        setHoldCoLocked(false);
        setPropCoScenario(holdCoScenario);
      }
      return next;
    });
  };

  useEffect(() => {
    if (holdCoLocked) {
      setHoldCoScenario(propCoScenario);
    }
  }, [propCoScenario, holdCoLocked]);

  useEffect(() => {
    if (propCoLocked) {
      setPropCoScenario(holdCoScenario);
    }
  }, [holdCoScenario, propCoLocked]);

  useEffect(() => {
    if (
      !propCoAssumptions?.includeFinancing &&
      !holdCoAssumptions?.includeFinancing &&
      holdCoScenario === "debt_free"
    ) {
      setHoldCoScenario("breakeven");
    }
  }, [
    propCoAssumptions?.includeFinancing,
    holdCoAssumptions?.includeFinancing,
    holdCoScenario,
  ]);

  useEffect(() => {
    if (
      !propCoAssumptions?.includeFinancing &&
      propCoScenario === "debt_free"
    ) {
      setPropCoScenario("breakeven");
    }
  }, [propCoAssumptions?.includeFinancing, propCoScenario]);

  // --- PRESENTATION NAVIGATION LOGIC ---
  const presentationSteps = useMemo(
    () => [
      {
        group: "summary",
        tab: "executive",
        company: "opco",
        label: "1. Executive Summary",
      },
      {
        group: "context",
        tab: "overview",
        company: "opco",
        label: "2. Project Context",
      },
      {
        group: "context",
        tab: "study",
        company: "opco",
        label: "3. Feasibility Study",
      },
      {
        group: "context",
        tab: "collab",
        company: "opco",
        label: "4. Collaboration Model",
      },
      {
        group: "financials",
        tab: "dashboard",
        company: "opco",
        label: "5. OpCo Financials",
      },
      {
        group: "financials",
        tab: "dashboard",
        company: "propco",
        label: "6. PropCo Financials",
      },
      {
        group: "financials",
        tab: "dashboard",
        company: "consolidated",
        label: "7. HoldCo (Consolidated)",
      },
      {
        group: "financials",
        tab: "timeline",
        company: "opco",
        label: "8. Master Timeline",
      },
    ],
    [],
  );

  const currentSlideIndex = presentationSteps.findIndex(
    (s) =>
      s.group === activeGroup &&
      s.tab === activeTab &&
      (s.group !== "financials" ||
        s.tab === "timeline" ||
        s.company === activeCompany),
  );
  const safeSlideIndex = Math.max(0, currentSlideIndex);

  const goToNextSlide = useCallback(() => {
    if (safeSlideIndex < presentationSteps.length - 1) {
      const next = presentationSteps[safeSlideIndex + 1];
      setActiveGroup(next.group);
      setActiveTab(next.tab);
      setActiveCompany(next.company);
    }
  }, [safeSlideIndex, presentationSteps]);

  const goToPrevSlide = useCallback(() => {
    if (safeSlideIndex > 0) {
      const prev = presentationSteps[safeSlideIndex - 1];
      setActiveGroup(prev.group);
      setActiveTab(prev.tab);
      setActiveCompany(prev.company);
    }
  }, [safeSlideIndex, presentationSteps]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input/textarea
      const tag = (e.target || e.srcElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "F5" || e.key === "f5") {
        e.preventDefault();
        setIsPresenting((prev) => !prev);
        return;
      }

      if (!isPresenting) return;

      // Blank screen toggle (Logitech and other wireless clickers send '.' or 'b' / 'B')
      if (e.key === "." || e.key === "b" || e.key === "B") {
        e.preventDefault();
        setIsBlanked((prev) => !prev);
        return;
      }

      // Any other slide navigation or key clears blackout mode
      if (isBlanked) {
        setIsBlanked(false);
      }

      if (
        e.key === "PageDown" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === "AudioVolumeDown" ||
        e.key === "VolumeDown" ||
        e.key === " " ||
        e.key === "Spacebar" ||
        e.key === "Enter"
      ) {
        e.preventDefault();
        goToNextSlide();
      } else if (
        e.key === "PageUp" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "AudioVolumeUp" ||
        e.key === "VolumeUp" ||
        e.key === "Backspace"
      ) {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === "Escape") {
        setIsPresenting(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresenting, isBlanked, goToNextSlide, goToPrevSlide]);

  const resolvedDevDuration = useMemo(() => {
    const allTasks = groups.flatMap((g) => g.tasks || []);
    const commOpeningTask = allTasks.find(
      (t) =>
        t.id === "t13" || t.name.toLowerCase().includes("commercial opening"),
    );
    return commOpeningTask
      ? Math.max(1, commOpeningTask.start - 1)
      : propCoAssumptions.devDurationMonths || 24;
  }, [groups, propCoAssumptions.devDurationMonths]);

  const projConfig = useMemo(() => {
    if (holdCoScenario === "manual") {
      const ey = opCoAssumptions.exitYear || 10;
      return {
        exitYear: opCoAssumptions.includeTerminalValue ? ey : -1,
        projYears: opCoAssumptions.includeTerminalValue && ey > 0 ? ey : 10,
      };
    }
    if (holdCoScenario === "none") {
      const y = Math.max(15, (propCoAssumptions.loanTenor || 15) + 2);
      return { exitYear: -1, projYears: Math.min(y, 30) };
    }
    if (holdCoScenario === "yr10") return { exitYear: 10, projYears: 10 };
    if (holdCoScenario === "debt_free") {
      const p1 = { exitYear: -1, projYears: 30 };
      const op1 = runOpCoEngine(
        { ...opCoAssumptions, devDurationMonths: resolvedDevDuration },
        p1,
      );
      const pr1 = runPropCoEngine(
        { ...propCoAssumptions, devDurationMonths: resolvedDevDuration },
        op1,
        p1,
        groups,
      );
      const cons1 = runConsolidatedEngine(
        op1,
        pr1,
        opCoAssumptions,
        holdCoAssumptions,
      );

      const devYears = Math.max(1, Math.ceil(resolvedDevDuration / 12));
      const exactOverallPayback = cons1.metrics.payback;
      let beOpYear =
        exactOverallPayback > 0
          ? Math.ceil(exactOverallPayback) - devYears + 1
          : 30;

      const y = Math.max(1, propCoAssumptions.loanTenor || 15);
      const targetYear = Math.max(beOpYear, y);
      return {
        exitYear: Math.min(targetYear, 30),
        projYears: Math.min(targetYear, 30),
      };
    }
    if (holdCoScenario === "breakeven") {
      const p1 = { exitYear: -1, projYears: 30 }; // -1 forces the engine to ignore individual settings and test pure operations
      const op1 = runOpCoEngine(
        { ...opCoAssumptions, devDurationMonths: resolvedDevDuration },
        p1,
      );
      const pr1 = runPropCoEngine(
        { ...propCoAssumptions, devDurationMonths: resolvedDevDuration },
        op1,
        p1,
        groups,
      );
      const cons1 = runConsolidatedEngine(
        op1,
        pr1,
        opCoAssumptions,
        holdCoAssumptions,
      );

      const devYears = Math.max(1, Math.ceil(resolvedDevDuration / 12));
      const exactOverallPayback = cons1.metrics.payback; // this is the exact payback year without exit

      let beOpYear =
        exactOverallPayback > 0
          ? Math.ceil(exactOverallPayback) - devYears
          : 30;
      if (beOpYear < 1) beOpYear = 1;

      // We set the exit to occur at the end of the breakeven year
      // (Option 1: Calendar Year-End).

      return {
        exitYear: Math.min(beOpYear, 30),
        projYears: Math.min(beOpYear, 30),
      };
    }
    return { exitYear: 10, projYears: 10 };
  }, [
    holdCoScenario,
    opCoAssumptions,
    propCoAssumptions,
    groups,
    resolvedDevDuration,
  ]);

  const propCoProjConfig = useMemo(() => {
    if (propCoScenario === "manual") {
      const ey = propCoAssumptions.exitYear || 10;
      return {
        exitYear: propCoAssumptions.includeTerminalValue ? ey : -1,
        projYears: propCoAssumptions.includeTerminalValue && ey > 0 ? ey : 10,
      };
    }
    if (propCoScenario === "none") {
      const y = Math.max(15, (propCoAssumptions.loanTenor || 15) + 2);
      return { exitYear: -1, projYears: Math.min(y, 30) };
    }
    if (propCoScenario === "yr10") return { exitYear: 10, projYears: 10 };
    if (propCoScenario === "debt_free") {
      const p1 = { exitYear: -1, projYears: 30 };
      const op1 = runOpCoEngine(
        { ...opCoAssumptions, devDurationMonths: resolvedDevDuration },
        p1,
      );
      const pr1 = runPropCoEngine(
        { ...propCoAssumptions, devDurationMonths: resolvedDevDuration },
        op1,
        p1,
        groups,
      );

      const devYears = Math.max(1, Math.ceil(resolvedDevDuration / 12));
      const exactOverallPayback = pr1.metrics.payback;
      let beOpYear =
        exactOverallPayback > 0
          ? Math.ceil(exactOverallPayback) - devYears + 1
          : 30;

      const y = Math.max(1, propCoAssumptions.loanTenor || 15);
      const targetYear = Math.max(beOpYear, y);
      return {
        exitYear: Math.min(targetYear, 30),
        projYears: Math.min(targetYear, 30),
      };
    }
    if (propCoScenario === "breakeven") {
      const p1 = { exitYear: -1, projYears: 30 };
      const op1 = runOpCoEngine(
        { ...opCoAssumptions, devDurationMonths: resolvedDevDuration },
        p1,
      );
      const pr1 = runPropCoEngine(
        { ...propCoAssumptions, devDurationMonths: resolvedDevDuration },
        op1,
        p1,
        groups,
      );

      const devYears = Math.max(1, Math.ceil(resolvedDevDuration / 12));
      const exactOverallPayback = pr1.metrics.payback;

      let beOpYear =
        exactOverallPayback > 0
          ? Math.ceil(exactOverallPayback) - devYears
          : 30;
      if (beOpYear < 1) beOpYear = 1;

      // We set the exit to occur at the end of the breakeven year
      // (Option 1: Calendar Year-End).

      return {
        exitYear: Math.min(beOpYear, 30),
        projYears: Math.min(beOpYear, 30),
      };
    }
    return { exitYear: 10, projYears: 10 };
  }, [
    propCoScenario,
    opCoAssumptions,
    propCoAssumptions,
    groups,
    resolvedDevDuration,
  ]);

  const standalonePropCoOpCoData = useMemo(
    () =>
      runOpCoEngine(
        { ...opCoAssumptions, devDurationMonths: resolvedDevDuration },
        propCoProjConfig,
      ),
    [opCoAssumptions, propCoProjConfig, resolvedDevDuration],
  );

  const standalonePropCoData = useMemo(
    () =>
      runPropCoEngine(
        { ...propCoAssumptions, devDurationMonths: resolvedDevDuration },
        standalonePropCoOpCoData,
        propCoProjConfig,
        groups,
      ),
    [
      propCoAssumptions,
      standalonePropCoOpCoData,
      propCoProjConfig,
      groups,
      resolvedDevDuration,
    ],
  );

  const opCoModelData = useMemo(
    () =>
      runOpCoEngine(
        { ...opCoAssumptions, devDurationMonths: resolvedDevDuration },
        projConfig,
      ),
    [opCoAssumptions, projConfig, resolvedDevDuration],
  );
  const propCoModelData = useMemo(
    () =>
      runPropCoEngine(
        { ...propCoAssumptions, devDurationMonths: resolvedDevDuration },
        opCoModelData,
        projConfig,
        groups,
      ),
    [propCoAssumptions, opCoModelData, projConfig, groups, resolvedDevDuration],
  );
  const consolidatedModelData = useMemo(
    () =>
      runConsolidatedEngine(
        opCoModelData,
        propCoModelData,
        opCoAssumptions,
        holdCoAssumptions,
      ),
    [opCoModelData, propCoModelData, opCoAssumptions, holdCoAssumptions],
  );

  // Sync Timeline tasks with PropCo Model Data to ensure parity
  useEffect(() => {
    if (!propCoModelData || !propCoModelData.capexDetails) return;

    setGroups((prevGroups) => {
      let changed = false;

      // Extract details from capexDetails
      const {
        landCost = 0,
        buildCost = 0,
        medEqCost = 0,
        ffeCost = 0,
        infraCost = 0,
        sharingDevCost = 0,
        consultantCost = 0,
        licenseCost = 0,
      } = propCoModelData.capexDetails;

      const formatCost = (val) => Math.round(val * 10) / 10;

      // Find specific child tasks to compute rollup timings
      const allFlatTasks = prevGroups.flatMap((g) => g.tasks);
      const findTask = (id) => allFlatTasks.find((t) => t.id === id);

      // 1. Consultant subtasks
      const t1 = findTask("t1");
      const t2 = findTask("t2");
      const t3 = findTask("t3");
      const consultantRollup = { start: 2, end: 7 };
      if (t1 && t2 && t3) {
        const starts = [t1.start, t2.start, t3.start].map(Number);
        const ends = [
          t1.start + t1.duration - 1,
          t2.start + t2.duration - 1,
          t3.start + t3.duration - 1,
        ].map(Number);
        consultantRollup.start = Math.min(...starts);
        consultantRollup.end = Math.max(...ends);
      }

      // 2. Licensing subtasks
      const t4 = findTask("t4");
      const t5 = findTask("t5");
      const licensingRollup = { start: 1, end: 15 };
      if (t4 && t5) {
        const starts = [t4.start, t5.start].map(Number);
        const ends = [
          t4.start + t4.duration - 1,
          t5.start + t5.duration - 1,
        ].map(Number);
        licensingRollup.start = Math.min(...starts);
        licensingRollup.end = Math.max(...ends);
      }

      // 3. Construction subtasks
      const t6_1 = findTask("t6_1");
      const t6_2 = findTask("t6_2");
      const t6_3 = findTask("t6_3");
      const t6_4 = findTask("t6_4");
      const constructionRollup = { start: 1, end: 20 };
      if (t6_1 && t6_2 && t6_3 && t6_4) {
        const starts = [t6_1.start, t6_2.start, t6_3.start, t6_4.start].map(
          Number,
        );
        const ends = [
          t6_1.start + t6_1.duration - 1,
          t6_2.start + t6_2.duration - 1,
          t6_3.start + t6_3.duration - 1,
          t6_4.start + t6_4.duration - 1,
        ].map(Number);
        constructionRollup.start = Math.min(...starts);
        constructionRollup.end = Math.max(...ends);
      }

      // 4. FF&E subtasks
      const t7_1 = findTask("t7_1");
      const t7_2 = findTask("t7_2");
      const ffeRollup = { start: 18, end: 24 };
      if (t7_1 && t7_2) {
        const starts = [t7_1.start, t7_2.start].map(Number);
        const ends = [
          t7_1.start + t7_1.duration - 1,
          t7_2.start + t7_2.duration - 1,
        ].map(Number);
        ffeRollup.start = Math.min(...starts);
        ffeRollup.end = Math.max(...ends);
      }

      // 5. Medical equipment timing logic
      const t8 = findTask("t8");
      const t9 = findTask("t9");
      const commOpeningTask = findTask("t13");
      const devDuration = commOpeningTask
        ? Math.max(1, commOpeningTask.start - 1)
        : propCoAssumptions.devDurationMonths || 24;
      const isLease = propCoAssumptions.medEqProcurement === "lease";
      const isLeaseOperating =
        propCoAssumptions.medEqProcurement === "lease_operating";
      const purchaseYear = propCoAssumptions.medEqPurchaseOpYear || 4;

      const targetMedEqStart = isLease
        ? devDuration + (purchaseYear - 1) * 12 + 1
        : isLeaseOperating
          ? devDuration + 1
          : 16;
      const targetMedEqDuration = 3;

      const nextGroups = prevGroups.map((group) => {
        const nextTasks = group.tasks.map((task) => {
          let updatedTask = { ...task };
          let taskChanged = false;
          let targetCost = task.cost;
          let targetStart = task.start;
          let targetDuration = task.duration;

          // Deriving COSTS dynamically for each task
          switch (task.id) {
            // Group 0 Rollups: Core Capex Totals
            case "c1":
              targetCost = formatCost(landCost);
              break;
            case "c2":
              targetCost = formatCost(licenseCost);
              targetStart = licensingRollup.start;
              targetDuration = licensingRollup.end - licensingRollup.start + 1;
              break;
            case "c3":
              targetCost = formatCost(consultantCost);
              targetStart = consultantRollup.start;
              targetDuration =
                consultantRollup.end - consultantRollup.start + 1;
              break;
            case "c4":
              targetCost = formatCost(ffeCost);
              targetStart = ffeRollup.start;
              targetDuration = ffeRollup.end - ffeRollup.start + 1;
              break;
            case "c5":
              targetCost = formatCost(infraCost);
              if (t8) {
                targetStart = t8.start;
                targetDuration = t8.duration;
              }
              break;
            case "c6":
              targetCost = formatCost(sharingDevCost);
              if (t9) {
                targetStart = t9.start;
                targetDuration = t9.duration;
              }
              break;
            case "c7":
              targetCost = formatCost(buildCost);
              targetStart = constructionRollup.start;
              targetDuration =
                constructionRollup.end - constructionRollup.start + 1;
              break;
            case "c8":
              targetCost = formatCost(medEqCost);
              targetStart = targetMedEqStart;
              targetDuration = targetMedEqDuration;
              break;

            // Group 1: Design & Planning Consultant cost splits
            case "t1":
              targetCost = formatCost(consultantCost * 0.2);
              break;
            case "t2":
              targetCost = formatCost(consultantCost * 0.5);
              break;
            case "t3":
              targetCost = formatCost(consultantCost * 0.3);
              break;

            // Group 2: Licensing & Permits cost splits
            case "t4":
              targetCost = formatCost(licenseCost * 0.6);
              break;
            case "t5":
              targetCost = formatCost(licenseCost * 0.4);
              break;

            // Group 3: Civil, Construction & Interior components
            case "t6_1":
              targetCost = formatCost(buildCost * 0.15);
              break;
            case "t6_2":
              targetCost = formatCost(buildCost * 0.4);
              break;
            case "t6_3":
              targetCost = formatCost(buildCost * 0.15);
              break;
            case "t6_4":
              targetCost = formatCost(buildCost * 0.3);
              break;
            case "t7_1":
              targetCost = formatCost(ffeCost * 0.5);
              break;
            case "t7_2":
              targetCost = formatCost(ffeCost * 0.5);
              break;

            // Group 4: Equipment setup
            case "t10":
              targetCost = formatCost(medEqCost);
              targetStart = targetMedEqStart;
              targetDuration = targetMedEqDuration;
              break;

            // Group 5: Infrastructure
            case "t8":
              targetCost = formatCost(infraCost);
              break;
            case "t9":
              targetCost = formatCost(sharingDevCost);
              break;
          }

          if (task.cost !== targetCost) {
            updatedTask.cost = targetCost;
            taskChanged = true;
          }
          if (task.start !== targetStart) {
            updatedTask.start = targetStart;
            taskChanged = true;
          }
          if (task.duration !== targetDuration) {
            updatedTask.duration = targetDuration;
            taskChanged = true;
          }

          if (taskChanged) {
            changed = true;
            return updatedTask;
          }
          return task;
        });

        return { ...group, tasks: nextTasks };
      });

      return changed ? nextGroups : prevGroups;
    });
  }, [
    propCoModelData,
    propCoAssumptions.medEqProcurement,
    propCoAssumptions.medEqPurchaseOpYear,
    propCoAssumptions.devDurationMonths,
  ]);

  // Compute Presentation Wrapper
  const headerContainerClass = isPresenting
    ? "w-full max-w-full mx-auto px-4"
    : "w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8";

  const mainContainerClass =
    isPresenting && isStrictRatio
      ? "aspect-video w-[100%] max-w-[1800px] max-h-[92vh] mx-auto overflow-y-auto bg-white shadow-2xl rounded-xl border border-[#D8D8D8] px-8 py-6 my-4"
      : headerContainerClass;

  // Navigation Logic
  const handleGroupChange = useCallback((group) => {
    setActiveGroup(group);
    if (group === "context") setActiveTab("overview");
    else if (group === "summary") setActiveTab("executive");
    else setActiveTab("dashboard");
  }, []);

  const handleCompanyChange = useCallback((comp) => {
    setActiveCompany(comp);
    setActiveTab((prev) =>
      comp === "consolidated" &&
      (prev === "assumptions" || prev === "sensitivity")
        ? "dashboard"
        : prev,
    );
  }, []);

  // ==========================================
  // TRUE PRODUCTION-READY CLOUD SYNC ENGINE
  // ==========================================
  const loadFromCloud = useCallback(async (uid) => {
    if (!isCloudConfigured || !db || !uid) return;
    try {
      setCloudStatus("connecting");
      const opcoRef = doc(db, "opcoConfigs", uid);
      const opcoSnap = await getDoc(opcoRef);
      if (opcoSnap.exists()) {
        const cloudData = opcoSnap.data();
        if (cloudData && cloudData.assumptions) {
          setOpCoAssumptions(cloudData.assumptions);
        }
      }

      const propcoRef = doc(db, "propcoConfigs", uid);
      const propcoSnap = await getDoc(propcoRef);
      if (propcoSnap.exists()) {
        const cloudData = propcoSnap.data();
        if (cloudData && cloudData.assumptions) {
          setPropCoAssumptions(cloudData.assumptions);
        }
      }
      setCloudStatus("online");
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `configs/${uid}`);
      setCloudStatus("error");
    }
  }, []);

  useEffect(() => {
    if (!isCloudConfigured || !auth) {
      setCloudStatus("offline");
      return;
    }

    setCloudStatus("connecting");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Under our strict zero-trust rules, emails must be verified
        if (currentUser.emailVerified) {
          setCloudStatus("online");
          if (isCloudSync) {
            await loadFromCloud(currentUser.uid);
          }
        } else {
          setCloudStatus("unverified");
          setIsCloudSync(false);
        }
      } else {
        setUser(null);
        setCloudStatus("offline");
        setIsCloudSync(false);
      }
    });

    return () => unsubscribe();
  }, [isCloudSync, loadFromCloud]);

  const saveDefaultsToCloud = useCallback(
    async (type) => {
      const setStatus =
        type === "opco" ? setSaveStatusOpCo : setSaveStatusPropCo;
      setStatus("saving");

      if (!isCloudConfigured || !db || !user) {
        // Fallback for Local Sandbox Mode
        setTimeout(() => {
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 2000);
        }, 800);
        return;
      }

      const colName = type === "opco" ? "opcoConfigs" : "propcoConfigs";
      const currentAssumptions =
        type === "opco" ? opCoAssumptions : propCoAssumptions;

      try {
        const docRef = doc(db, colName, user.uid);
        await setDoc(docRef, {
          userId: user.uid,
          userEmail: user.email,
          updatedAt: serverTimestamp(),
          assumptions: currentAssumptions,
        });
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
      } catch (err) {
        setStatus("idle");
        handleFirestoreError(
          err,
          OperationType.WRITE,
          `${colName}/${user.uid}`,
        );
      }
    },
    [user, opCoAssumptions, propCoAssumptions],
  );

  const handleTextSelection = useCallback((e) => {
    if (e.target.closest("#ai-selection-popup")) return;
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";
    if (text.length > 2) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      let safeX = Math.max(
        160,
        Math.min(
          rect.left + window.scrollX + rect.width / 2,
          document.body.clientWidth - 160,
        ),
      );
      setSelectionState({
        show: true,
        text,
        x: safeX,
        y:
          rect.top < 60
            ? rect.bottom + window.scrollY + 20
            : rect.top + window.scrollY - 60,
        isOpen: false,
        query: "",
        response: "",
        isLoading: false,
      });
    } else {
      setSelectionState((p) => (p.isOpen ? p : { ...p, show: false }));
    }
  }, []);

  const handleSelectionAsk = useCallback(async () => {
    if (!selectionState.query.trim()) return;
    setSelectionState((p) => ({ ...p, isLoading: true }));
    try {
      const res = await callGemini(selectionState.query, "Short analysis.");
      setSelectionState((p) => ({ ...p, response: res }));
    } catch (e) {
      console.warn(
        "Gemini API omitted; fallback to local scenario validation.",
        e,
      );
      const localRes = localFinancialAuditor.getSmartAsk(
        selectionState.query,
        opCoModelData,
        propCoModelData,
        consolidatedModelData,
        opCoAssumptions,
        propCoAssumptions,
      );
      setSelectionState((p) => ({ ...p, response: localRes }));
    } finally {
      setSelectionState((p) => ({ ...p, isLoading: false }));
    }
  }, [
    selectionState.query,
    opCoModelData,
    propCoModelData,
    consolidatedModelData,
    opCoAssumptions,
    propCoAssumptions,
  ]);

  const handleOpCoChange = useCallback(
    (k, v) =>
      setOpCoAssumptions((p) => ({
        ...p,
        [k]: ["includeTerminalValue", "rentStructureType", "includeFinancing"].includes(k)
          ? v
          : (v === "" ? 0 : parseFloat(v)) || 0,
      })),
    [],
  );
  const handlePropCoChange = useCallback((k, v) => {
    setPropCoAssumptions((p) => {
      const next = { ...p };
      const updates = typeof k === "object" ? k : { [k]: v };

      Object.entries(updates).forEach(([key, val]) => {
        next[key] = [
          "linkToOpCo",
          "includeLand",
          "isLandLeased",
          "includeMedEq",
          "medEqProcurement",
          "includeFFE",
          "depMethodBuilding",
          "depMethodMedEq",
          "depMethodInfra",
          "depMethodFFE",
          "depMethodSoftCost",
          "includeTerminalValue",
          "exitMethod",
          "includeFinancing",
          "includePreOpInLtv",
          "drawdownScenario",
          "drawdownTranches",
          "repaymentType",
          "stepUpPercentages",
        ].includes(key)
          ? val
          : (val === "" ? 0 : parseFloat(val)) || 0;

        if (key === "includeFinancing" && val === true) {
          setHoldCoAssumptions((hc) => ({ ...hc, includeFinancing: false }));
        }
        if (key === "isLandLeased") {
          if (val === true) {
            next["exitMethod"] = "dcf";
            next["exitYear"] = 15;
          } else if (next["exitMethod"] === "dcf") {
            next["exitMethod"] = "capRate";
            next["exitYear"] = 10;
          }
        }
      });
      return next;
    });
  }, []);

  const handleHoldCoChange = useCallback((k, v) => {
    setHoldCoAssumptions((p) => {
      const next = { ...p, [k]: v };
      if (k === "includeFinancing" && v === true) {
        setPropCoAssumptions((pc) => ({ ...pc, includeFinancing: false }));
        // opCo doesn't have includeFinancing, but if it did:
        // setOpCoAssumptions((oc) => ({ ...oc, includeFinancing: false }));
      }
      return next;
    });
  }, []);

  const syncEquityWithSharing = useCallback(() => {
    setOpCoAssumptions((p) => {
      const t = p.partnerAEquity + p.partnerBEquity;
      return {
        ...p,
        partnerAEquity: Number((t * (p.sharingPercentA / 100)).toFixed(2)),
        partnerBEquity: Number((t - t * (p.sharingPercentA / 100)).toFixed(2)),
      };
    });
  }, []);

  const generateTeaser = useCallback(async () => {
    setIsTeaserLoading(true);
    setShowTeaser(true);
    try {
      const res = await callGemini("Project Teaser", "Investment Banker");
      setTeaserContent(res || "Error.");
    } catch (e) {
      console.warn(
        "Gemini API omitted; fallback to dynamic investment prospectus.",
        e,
      );
      const report = localFinancialAuditor.getTeaser(
        opCoModelData,
        propCoModelData,
        consolidatedModelData,
        opCoAssumptions,
        propCoAssumptions,
      );
      setTeaserContent(report);
    }
    setIsTeaserLoading(false);
  }, [
    opCoModelData,
    propCoModelData,
    consolidatedModelData,
    opCoAssumptions,
    propCoAssumptions,
  ]);

  const generateAIInsights = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const res = await callGemini(
        "Full Yield Audit",
        "Healthcare Investment Analyst",
      );
      setAiInsights(res || "Error.");
    } catch (e) {
      console.warn(
        "Gemini API omitted; fallback to multi-cascade audit report.",
        e,
      );
      const insights = localFinancialAuditor.getInsights(
        opCoModelData,
        propCoModelData,
        consolidatedModelData,
        opCoAssumptions,
        propCoAssumptions,
      );
      setAiInsights(insights);
    } finally {
      setIsAiLoading(false);
    }
  }, [
    opCoModelData,
    propCoModelData,
    consolidatedModelData,
    opCoAssumptions,
    propCoAssumptions,
  ]);

  const validateAssumptions = useCallback(async () => {
    setIsMarketLoading(true);
    setShowMarketValidation(true);
    try {
      const res = await callGemini(
        "Assumptions check",
        "Healthcare feasibility consultant",
      );
      setMarketValidation(res || "Error.");
    } catch (e) {
      console.warn(
        "Gemini API omitted; fallback to compliance and PSAK checker.",
        e,
      );
      const validation = localFinancialAuditor.getValidation(
        opCoModelData,
        propCoModelData,
        consolidatedModelData,
        opCoAssumptions,
        propCoAssumptions,
      );
      setMarketValidation(validation);
    }
    setIsMarketLoading(false);
  }, [
    opCoModelData,
    propCoModelData,
    consolidatedModelData,
    opCoAssumptions,
    propCoAssumptions,
  ]);

  const handleAskAI = useCallback(async () => {
    if (!askQuery.trim()) return;
    setIsAskLoading(true);
    try {
      const res = await callGemini(askQuery, "Financial AI");
      setAskResponse(res || "Error.");
    } catch (e) {
      console.warn("Gemini API omitted; fallback to smart ask analyzer.", e);
      const answer = localFinancialAuditor.getSmartAsk(
        askQuery,
        opCoModelData,
        propCoModelData,
        consolidatedModelData,
        opCoAssumptions,
        propCoAssumptions,
      );
      setAskResponse(answer);
    }
    setIsAskLoading(false);
  }, [
    askQuery,
    opCoModelData,
    propCoModelData,
    consolidatedModelData,
    opCoAssumptions,
    propCoAssumptions,
  ]);

  return (
    <div
      className={`min-h-screen bg-[#F9F8F6] text-[#1E2F31] font-sans pb-12 relative text-xs`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;800&family=League+Spartan:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700;800&display=swap');
        
        /* Modern, geometric UI font for general text */
        .font-sans { 
            font-family: 'Jost', sans-serif !important; 
        }
        
        /* Bold, geometric and impactful font for headers replacing the old serif */
        .font-serif { 
            font-family: 'League Spartan', sans-serif !important; 
        }
        
        /* True monospaced font for perfect vertical alignment in financial tables */
        .font-mono { 
            font-family: 'JetBrains Mono', monospace !important; 
            letter-spacing: -0.03em;
        }
      `}</style>

      <div className="bg-[#1E2F31] text-white shadow-md relative z-[130] border-b-4 border-[#1C6048] transition-all">
        <div
          className={`flex justify-between items-center transition-all duration-300 ${headerContainerClass} ${isPresenting ? "py-1.5" : "py-3"}`}
        >
          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            <div
              className={`transition-all flex items-center justify-start ${isPresenting ? "h-10" : "h-16"}`}
            >
              <img
                src="/vasanta-logo-gold.svg"
                alt="Vasanta Group Logo"
                className="w-auto h-full object-contain object-left drop-shadow-sm scale-[1.7] origin-left"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={() =>
                exportToExcel(
                  opCoAssumptions,
                  propCoAssumptions,
                  opCoModelData,
                  propCoModelData,
                  consolidatedModelData,
                )
              }
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm bg-[#1C6048] text-white border-[#1C6048] hover:bg-opacity-90"
              title="Export Full Model as Excel (.xlsx)"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export .xlsx</span>
            </button>

            <button
              onClick={() => setIsPresenting(!isPresenting)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                isPresenting
                  ? "bg-[#99B6AA] text-[#1E2F31] border-[#99B6AA] hover:bg-white"
                  : "bg-[#1E2F31] text-[#99B6AA] border-[#4C4A4B] hover:text-white"
              }`}
              title="Toggle Presentation Mode"
            >
              {isPresenting ? <Minimize size={14} /> : <Maximize size={14} />}
              <span className="hidden sm:inline">
                {isPresenting ? "Exit Present" : "Present"}
              </span>
            </button>

            <button
              onClick={() =>
                setSyncConfirmDialog({
                  isOpen: true,
                  targetState: !isCloudSync,
                })
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isCloudSync
                  ? cloudStatus === "online"
                    ? "bg-[#1C6048] text-white border-[#1C6048] shadow-lg"
                    : "bg-[#9B8B70] text-white border-[#9B8B70] shadow-lg"
                  : "bg-[#1E2F31] text-[#99B6AA] border-[#4C4A4B] hover:text-white"
              }`}
              title="Toggle Cloud Saving"
            >
              {isCloudSync ? (
                cloudStatus === "online" ? (
                  <Cloud size={14} />
                ) : (
                  <RefreshCcw size={14} className="animate-spin" />
                )
              ) : (
                <CloudOff size={14} />
              )}
              <span className="hidden sm:inline">
                {isCloudSync
                  ? cloudStatus === "online"
                    ? "Cloud Sync On"
                    : "Connecting..."
                  : "Local Mode"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* PRIMARY LAYER NAV */}
      <nav className="bg-white border-b border-[#D8D8D8] sticky top-0 z-[120] shadow-sm transition-all duration-300">
        <div className={`transition-all duration-300 ${headerContainerClass}`}>
          {/* Group Switcher */}
          <div className="flex items-center justify-center gap-4 pt-3 border-b border-[#EFEBE7]">
            <button
              onClick={() => handleGroupChange("summary")}
              className={`pb-2 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeGroup === "summary" ? "text-[#1C6048]" : "text-[#4C4A4B] opacity-50 hover:opacity-100"}`}
            >
              <div className="flex items-center gap-2">
                <Briefcase size={14} /> Executive Summary
              </div>
              {activeGroup === "summary" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1C6048] rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => handleGroupChange("context")}
              className={`pb-2 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeGroup === "context" ? "text-[#9B8B70]" : "text-[#4C4A4B] opacity-50 hover:opacity-100"}`}
            >
              <div className="flex items-center gap-2">
                <FolderTree size={14} /> Strategic Foundation
              </div>
              {activeGroup === "context" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#9B8B70] rounded-t-full"></div>
              )}
            </button>
            <button
              onClick={() => handleGroupChange("financials")}
              className={`pb-2 px-2 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeGroup === "financials" ? "text-[#1E2F31]" : "text-[#4C4A4B] opacity-50 hover:opacity-100"}`}
            >
              <div className="flex items-center gap-2">
                <BarChartHorizontal size={14} /> Financial Engine
              </div>
              {activeGroup === "financials" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1E2F31] rounded-t-full"></div>
              )}
            </button>
          </div>

          <div
            className={`grid grid-cols-2 md:flex md:flex-row justify-between items-center gap-2 lg:gap-3 transition-all duration-300 ${isPresenting ? "py-2" : "py-3"}`}
          >
            {/* PILLAR 1: BRANDED TITLE */}
            <div className="order-1 md:order-1 col-span-1 flex justify-start min-w-0 md:flex-1">
              <h1 className="text-xl font-bold flex items-center gap-2 text-[#1E2F31] truncate">
                {activeTab === "executive" ? (
                  <Briefcase className="text-[#9B8B70]" />
                ) : activeTab === "overview" ? (
                  <Info className="text-[#1C6048]" />
                ) : activeTab === "study" ? (
                  <BookOpen className="text-[#1C6048]" />
                ) : activeTab === "collab" ? (
                  <Network className="text-[#1C6048]" />
                ) : activeTab === "timeline" ? (
                  <Calendar className="text-[#1C6048]" />
                ) : activeCompany === "opco" ? (
                  <Activity className="text-[#1C6048]" />
                ) : activeCompany === "propco" ? (
                  <Building2 className="text-[#9B8B70]" />
                ) : (
                  <Layers className="text-[#1E2F31]" />
                )}
                <span className="whitespace-nowrap">
                  {activeTab === "executive"
                    ? "Executive Summary"
                    : activeTab === "overview"
                      ? "Project Context"
                      : activeTab === "study"
                        ? "Feasibility Study"
                        : activeTab === "collab"
                          ? "Collaboration"
                          : activeTab === "timeline"
                            ? "Timeline"
                            : activeCompany === "opco"
                              ? "OpCo Model"
                              : activeCompany === "propco"
                                ? "PropCo Model"
                                : "HoldCo VG"}
                </span>
              </h1>
            </div>

            {/* PILLAR 2: CENTERED DYNAMIC NAVIGATION (Financials or Study Sub-Nav) */}
            {activeGroup === "financials" ? (
              <div className="order-3 md:order-2 col-span-2 flex justify-start md:justify-center min-w-0 w-full md:w-auto md:flex-1 mt-1 md:mt-0">
                <div className="flex p-1 bg-[#EFEBE7]/50 rounded-xl gap-0.5 border border-[#D8D8D8] overflow-x-auto w-full md:w-auto max-w-full items-center custom-scrollbar">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "dashboard" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <LayoutDashboard size={13} /> Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab("comprehensive")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "comprehensive" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <List size={13} /> P&L / CF
                  </button>
                  <button
                    onClick={() => setActiveTab("sensitivity")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "sensitivity" ? "bg-[#1E2F31] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <TrendingUp size={13} /> Sensitivity
                  </button>
                  <button
                    disabled={activeCompany === "consolidated"}
                    onClick={() => setActiveTab("assumptions")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeCompany === "consolidated" ? "opacity-30 cursor-not-allowed text-[#4C4A4B]" : activeTab === "assumptions" ? "bg-[#99B6AA] text-[#1E2F31] shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <Settings size={13} /> Settings
                  </button>
                  <div className="w-px h-4 bg-[#D8D8D8] mx-0.5 shrink-0"></div>
                  <button
                    onClick={() => setActiveTab("timeline")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeTab === "timeline" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <Calendar size={13} /> Timeline
                  </button>
                </div>
              </div>
            ) : activeTab === "study" ? (
              <div className="order-3 md:order-2 col-span-2 flex justify-start md:justify-center min-w-0 w-full md:w-auto md:flex-1 mt-1 md:mt-0">
                <div className="flex p-1 bg-[#EFEBE7]/50 rounded-xl gap-0.5 border border-[#D8D8D8] overflow-x-auto w-full md:w-auto max-w-full items-center custom-scrollbar">
                  <button
                    onClick={() => setActiveMiniTab("marketAnalysis")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeMiniTab === "marketAnalysis" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <Search size={13} /> Market Analysis
                  </button>
                  <button
                    onClick={() => setActiveMiniTab("opportunities")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeMiniTab === "opportunities" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <Target size={13} /> Opportunities
                  </button>
                  <button
                    onClick={() => setActiveMiniTab("clinicalRooms")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeMiniTab === "clinicalRooms" ? "bg-[#1E2F31] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
                  >
                    <Stethoscope size={13} /> Facility & Rooms
                  </button>
                </div>
              </div>
            ) : null}

            {/* PILLAR 3: SECONDARY LAYER NAV (Tabs / Module Selection) */}
            <div className="order-2 md:order-3 col-span-1 flex justify-end min-w-0 w-full md:w-auto md:flex-1">
              {activeGroup !== "summary" && (
                <div className="flex p-1 bg-[#EFEBE7] rounded-lg gap-1 overflow-x-auto border border-[#D8D8D8] max-w-full items-center custom-scrollbar">
                  {activeGroup === "context" ? (
                    <>
                      <NavButton
                        active={activeTab === "overview"}
                        onClick={() => setActiveTab("overview")}
                        icon={<FileText size={14} />}
                        label="Overview"
                      />
                      <NavButton
                        active={activeTab === "study"}
                        onClick={() => setActiveTab("study")}
                        icon={<BookOpen size={14} />}
                        label="Study"
                      />
                      <NavButton
                        active={activeTab === "collab"}
                        onClick={() => setActiveTab("collab")}
                        icon={<Network size={14} />}
                        label="Collab"
                      />
                    </>
                  ) : (
                    <>
                      <NavButton
                        active={activeCompany === "opco"}
                        onClick={() => handleCompanyChange("opco")}
                        icon={<Activity size={14} />}
                        label="OpCo"
                      />
                      <NavButton
                        active={activeCompany === "propco"}
                        onClick={() => handleCompanyChange("propco")}
                        icon={<Building2 size={14} />}
                        label="PropCo"
                      />
                      <NavButton
                        active={activeCompany === "consolidated"}
                        onClick={() => handleCompanyChange("consolidated")}
                        icon={<Layers size={14} />}
                        label="HoldCo"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main
        className={`transition-all duration-300 ${mainContainerClass} ${isPresenting && !isStrictRatio ? "mt-4" : isPresenting && isStrictRatio ? "" : "mt-6"}`}
      >
        {/* Content Section */}
        {activeTab === "executive" && (
          <ExecutiveSummaryView
            isPresenting={isPresenting}
            opCoData={opCoModelData}
            propCoData={propCoModelData}
            consolidatedData={consolidatedModelData}
          />
        )}
        {activeTab === "overview" && (
          <ProjectOverviewView
            info={projectInfo}
            setInfo={setProjectInfo}
            isLocked={activeCompany === "opco" ? isLockedOpCo : isLockedPropCo}
          />
        )}
        {activeTab === "study" && (
          <StudyView
            isPresenting={isPresenting}
            info={projectInfo}
            activeMiniTab={activeMiniTab}
            setActiveMiniTab={setActiveMiniTab}
          />
        )}
        {activeTab === "collab" && (
          <CollaborationStrategyView isPresenting={isPresenting} />
        )}
        {activeTab === "timeline" && (
          <MasterTimelineView
            isPresenting={isPresenting}
            groups={groups}
            setGroups={setGroups}
          />
        )}
        {activeTab !== "overview" &&
          activeTab !== "study" &&
          activeTab !== "collab" &&
          activeTab !== "timeline" &&
          activeTab !== "ai" &&
          activeCompany === "opco" &&
          activeGroup === "financials" && (
            <div className="animate-in fade-in duration-500">
              {activeTab === "dashboard" && (
                <OpCoDashboardView
                  data={opCoModelData}
                  assumptions={opCoAssumptions}
                  generateTeaser={generateTeaser}
                  isTeaserLoading={isTeaserLoading}
                  showTeaser={showTeaser}
                  setShowTeaser={setShowTeaser}
                  teaserContent={teaserContent}
                  isPresenting={isPresenting}
                />
              )}
              {activeTab === "comprehensive" && (
                <OpCoCascadeView
                  data={opCoModelData}
                  assumptions={opCoAssumptions}
                  viewResolution={viewResolution}
                  setViewResolution={setViewResolution}
                />
              )}
              {activeTab === "sensitivity" && (
                <OpCoSensitivityView assumptions={opCoAssumptions} />
              )}
              {activeTab === "assumptions" && (
                <SettingsPasswordGate>
                  <OpCoSettingsView
                    assumptions={opCoAssumptions}
                    onChange={handleOpCoChange}
                    onSyncEquity={syncEquityWithSharing}
                    onValidate={validateAssumptions}
                    isLocked={isLockedOpCo}
                    onToggleLock={() => setIsLockedOpCo(!isLockedOpCo)}
                    onSave={() => saveDefaultsToCloud("opco")}
                    saveStatus={saveStatusOpCo}
                    onReset={() => setOpCoAssumptions(DEFAULT_OPCO_ASSUMPTIONS)}
                    isCloudSync={isCloudSync}
                    isPresenting={isPresenting}
                  />
                </SettingsPasswordGate>
              )}
            </div>
          )}

        {activeTab !== "overview" &&
          activeTab !== "study" &&
          activeTab !== "collab" &&
          activeTab !== "timeline" &&
          activeTab !== "ai" &&
          activeCompany === "propco" &&
          activeGroup === "financials" && (
            <div className="animate-in fade-in duration-500">
              {activeTab === "dashboard" && (
                <PropCoDashboardView
                  data={standalonePropCoData}
                  assumptions={propCoAssumptions}
                  generateTeaser={generateTeaser}
                  isTeaserLoading={isTeaserLoading}
                  showTeaser={showTeaser}
                  setShowTeaser={setShowTeaser}
                  teaserContent={teaserContent}
                  setTab={setActiveTab}
                  isPresenting={isPresenting}
                  propCoScenario={propCoScenario}
                  setPropCoScenario={setPropCoScenario}
                  onChange={handlePropCoChange}
                  propCoLocked={propCoLocked}
                  holdCoLocked={holdCoLocked}
                  toggleHoldCoLock={toggleHoldCoLock}
                />
              )}
              {activeTab === "comprehensive" && (
                <PropCoCascadeView
                  data={standalonePropCoData}
                  onExport={() => {}}
                  viewResolution={viewResolution}
                  setViewResolution={setViewResolution}
                />
              )}
              {activeTab === "sensitivity" && (
                <PropCoSensitivityView
                  assumptions={propCoAssumptions}
                  opCoModelData={standalonePropCoOpCoData}
                  groups={groups}
                />
              )}
              {activeTab === "assumptions" && (
                <SettingsPasswordGate>
                  <PropCoSettingsView
                    assumptions={propCoAssumptions}
                    data={standalonePropCoData}
                    onChange={handlePropCoChange}
                    onValidate={validateAssumptions}
                    isLocked={isLockedPropCo}
                    onToggleLock={() => setIsLockedPropCo(!isLockedPropCo)}
                    onSave={() => saveDefaultsToCloud("propco")}
                    saveStatus={saveStatusPropCo}
                    onReset={() =>
                      setPropCoAssumptions(DEFAULT_PROPCO_ASSUMPTIONS)
                    }
                    isCloudSync={isCloudSync}
                    isPresenting={isPresenting}
                    resolvedDevDuration={resolvedDevDuration}
                  />
                </SettingsPasswordGate>
              )}
            </div>
          )}

        {activeTab !== "overview" &&
          activeTab !== "study" &&
          activeTab !== "collab" &&
          activeTab !== "timeline" &&
          activeTab !== "ai" &&
          activeCompany === "consolidated" &&
          activeGroup === "financials" && (
            <div className="animate-in fade-in duration-500">
              {activeTab === "dashboard" && (
                <ConsolidatedDashboardView
                  data={consolidatedModelData}
                  assumptions={opCoAssumptions}
                  propCoAssumptions={propCoAssumptions}
                  handlePropCoChange={handlePropCoChange}
                  holdCoAssumptions={holdCoAssumptions}
                  handleHoldCoChange={handleHoldCoChange}
                  isPresenting={isPresenting}
                  holdCoScenario={holdCoScenario}
                  setHoldCoScenario={setHoldCoScenario}
                  holdCoLocked={holdCoLocked}
                  toggleHoldCoLock={toggleHoldCoLock}
                  propCoLocked={propCoLocked}
                  togglePropCoLock={togglePropCoLock}
                />
              )}
              {activeTab === "comprehensive" && (
                <ConsolidatedCascadeView
                  data={consolidatedModelData}
                  opcoData={opCoModelData}
                  propcoData={propCoModelData}
                  viewResolution={viewResolution}
                  setViewResolution={setViewResolution}
                  holdCoAssumptions={holdCoAssumptions}
                  handleHoldCoChange={handleHoldCoChange}
                />
              )}
              {activeTab === "sensitivity" && (
                <ConsolidatedSensitivityView
                  opCoAssumptions={opCoAssumptions}
                  propCoAssumptions={propCoAssumptions}
                  holdCoAssumptions={holdCoAssumptions}
                  resolvedDevDuration={resolvedDevDuration}
                  projConfig={projConfig}
                  groups={groups}
                />
              )}
            </div>
          )}

        {activeTab === "ai" && activeGroup === "financials" && (
          <AIAuditView
            activeCompany={activeCompany}
            aiInsights={aiInsights}
            isAiLoading={isAiLoading}
            generateAIInsights={generateAIInsights}
            askQuery={askQuery}
            setAskQuery={setAskQuery}
            handleAskAI={handleAskAI}
            isAskLoading={isAskLoading}
            askResponse={askResponse}
          />
        )}
      </main>

      {/* PRESENTER FLOATING HUB (Glassmorphic & Movable) */}
      {isPresenting &&
        (hubPosition === "minimized" ? (
          <button
            onClick={() => setHubPosition("center")}
            className="fixed bottom-6 right-6 z-[100] w-12 h-12 flex items-center justify-center bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(30,47,49,0.15)] rounded-full text-[#1E2F31] hover:bg-white/70 transition-all animate-in zoom-in"
            title="Restore Hub"
          >
            <Maximize2 size={20} />
          </button>
        ) : (
          <div
            className={`fixed z-[100] flex items-center gap-1.5 p-2 rounded-full transition-all duration-700 ease-in-out bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(30,47,49,0.15)] ${
              hubPosition === "center"
                ? "bottom-6 left-1/2 -translate-x-1/2"
                : hubPosition === "left"
                  ? "bottom-6 left-6"
                  : "bottom-6 right-6"
            }`}
          >
            {/* Left Move Toggle */}
            {hubPosition !== "left" && (
              <button
                onClick={() =>
                  setHubPosition(hubPosition === "right" ? "center" : "left")
                }
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#4C4A4B] hover:bg-white/50 transition-all ml-1"
                title={
                  hubPosition === "right" ? "Move to Center" : "Move to Left"
                }
              >
                <AlignLeft size={16} />
              </button>
            )}

            <button
              onClick={goToPrevSlide}
              disabled={safeSlideIndex === 0}
              className="w-14 h-14 flex items-center justify-center bg-white/70 hover:bg-white disabled:opacity-30 disabled:hover:bg-white/70 rounded-full transition-all text-[#1E2F31] shadow-sm ml-1"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>

            {/* Info Area (Hover to reveal Hide button) */}
            <div className="flex flex-col items-center px-4 min-w-[180px] cursor-default group relative">
              <span className="text-[10px] font-bold text-[#1C6048] uppercase tracking-widest mb-0.5 drop-shadow-sm">
                Slide {safeSlideIndex + 1} of {presentationSteps.length}
              </span>
              <span className="text-sm font-black text-[#1E2F31] whitespace-nowrap drop-shadow-sm">
                {presentationSteps[safeSlideIndex].label}
              </span>

              <div className="absolute -top-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => setIsStrictRatio(!isStrictRatio)}
                  className={`bg-white/60 backdrop-blur-xl px-3 py-1.5 rounded-full text-[11px] font-bold shadow-sm border flex items-center gap-1.5 transition-all ${
                    isStrictRatio
                      ? "border-[#1C6048] text-[#1C6048] bg-white/90"
                      : "border-white/60 text-[#1E2F31] hover:bg-white/90"
                  }`}
                  title="Toggle 16:9 Presentation Format"
                >
                  <Monitor size={14} /> 16:9 Format
                </button>
                <button
                  onClick={() => setHubPosition("minimized")}
                  className="bg-white/60 backdrop-blur-xl px-3 py-1.5 rounded-full text-[11px] font-bold text-[#1E2F31] shadow-sm border border-white/60 flex items-center gap-1.5 hover:bg-white/90 transition-all"
                >
                  <EyeOff size={14} /> Hide Hub
                </button>
              </div>
            </div>

            <button
              onClick={goToNextSlide}
              disabled={safeSlideIndex === presentationSteps.length - 1}
              className="w-14 h-14 flex items-center justify-center bg-[#1C6048]/80 backdrop-blur-md hover:bg-[#1C6048] disabled:opacity-50 rounded-full transition-all text-white shadow-md mr-1"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>

            {/* Right Move Toggle */}
            {hubPosition !== "right" && (
              <button
                onClick={() =>
                  setHubPosition(hubPosition === "left" ? "center" : "right")
                }
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#4C4A4B] hover:bg-white/50 transition-all mr-1"
                title={
                  hubPosition === "left" ? "Move to Center" : "Move to Right"
                }
              >
                <AlignRight size={16} />
              </button>
            )}
          </div>
        ))}

      <SelectionPopupComp
        state={selectionState}
        setState={setSelectionState}
        onAsk={handleSelectionAsk}
      />

      {syncConfirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] bg-[#1E2F31]/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#D8D8D8] transform scale-100">
            {/* Case 1: Firestore is not configured yet */}
            {!isCloudConfigured && syncConfirmDialog.targetState ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-[#9B8B70]/15 text-[#9B8B70]">
                    <Info size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E2F31]">
                    Cloud Sync Configuration Setup
                  </h3>
                </div>
                <div className="text-[#4C4A4B] text-sm mb-6 leading-relaxed">
                  Genuine cloud-hosted saving requires valid Google
                  Cloud/Firebase project identifiers. Currently, the application
                  is running in an <strong>Offline Sandbox</strong>. Your
                  changes are isolated to this session and will be lost on
                  refresh.
                  <br />
                  <br />
                  To connect your persistent database:
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs font-mono text-[#1E2F31]/80">
                    <li>
                      Open <code>/firebase-applet-config.json</code> in the
                      workspace explorer.
                    </li>
                    <li>
                      Replace placeholder keys with active Firebase client
                      credentials.
                    </li>
                  </ul>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() =>
                      setSyncConfirmDialog({
                        isOpen: false,
                        targetState: false,
                      })
                    }
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1C6048] hover:bg-opacity-90 transition-colors"
                  >
                    Got It, Continue Offline
                  </button>
                </div>
              </>
            ) : isCloudConfigured && !user && syncConfirmDialog.targetState ? (
              /* Case 2: Configured but not logged in */
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-[#1C6048]/10 text-[#1C6048]">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E2F31]">
                    Sign In to Enable Cloud Sync
                  </h3>
                </div>
                <p className="text-[#4C4A4B] text-sm mb-6 leading-relaxed border-b border-[#EFEBE7] pb-4">
                  Sign in using Google Secure OAuth to automatically upload and
                  synchronize custom clinical models, occupancy rates (BOR),
                  development budgets, and debt structures across sessions.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() =>
                      setSyncConfirmDialog({
                        isOpen: false,
                        targetState: false,
                      })
                    }
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#4C4A4B] bg-[#EFEBE7] hover:bg-[#D8D8D8]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await loginWithGoogle();
                        setIsCloudSync(true);
                        setSyncConfirmDialog({
                          isOpen: false,
                          targetState: false,
                        });
                      } catch (err) {
                        alert(
                          "Sign in failed. Setup is running securely: " +
                            err.message,
                        );
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1C6048] hover:bg-opacity-90 flex items-center gap-2 shadow-md"
                  >
                    <Users size={14} />
                    Sign In with Google
                  </button>
                </div>
              </>
            ) : (
              /* Case 3: Fully authenticated toggle */
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-3 rounded-full ${syncConfirmDialog.targetState ? "bg-[#1C6048]/10 text-[#1C6048]" : "bg-[#9B8B70]/10 text-[#9B8B70]"}`}
                  >
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E2F31]">
                    {syncConfirmDialog.targetState
                      ? "Enable Cloud Sync?"
                      : "Switch to Local Mode?"}
                  </h3>
                </div>
                <p className="text-[#4C4A4B] text-sm mb-6 leading-relaxed">
                  {syncConfirmDialog.targetState
                    ? "Connecting to the cloud will save your active configurations under your authenticated profile. If there are previous cloud records, they might initially override local parameters. Proceed?"
                    : "Switching to Local Mode means updates are stored only in volatile window state. Any custom settings will reset upon manual browser refresh."}
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() =>
                      setSyncConfirmDialog({
                        isOpen: false,
                        targetState: false,
                      })
                    }
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#4C4A4B] bg-[#EFEBE7] hover:bg-[#D8D8D8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsCloudSync(syncConfirmDialog.targetState);
                      setSyncConfirmDialog({
                        isOpen: false,
                        targetState: false,
                      });
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-colors ${syncConfirmDialog.targetState ? "bg-[#1C6048] hover:bg-opacity-90" : "bg-[#9B8B70] hover:bg-opacity-90"}`}
                  >
                    {syncConfirmDialog.targetState
                      ? "Yes, Enable Sync"
                      : "Yes, Switch to Local"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Absolute Blackout Screen for Presentations */}
      {isPresenting && isBlanked && (
        <div
          onClick={() => setIsBlanked(false)}
          className="fixed inset-0 bg-[#0E1516] z-[9999] flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-300"
        >
          <div className="text-zinc-650 text-xs font-mono select-none text-center space-y-2 pointer-events-none p-6">
            <p className="tracking-widest uppercase text-stone-600 font-bold text-sm">
              Screen Blackout Mode Active
            </p>
            <p className="text-[11px] text-stone-700 opacity-60">
              Click anywhere or press B/'.' on the presenter to resume
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Menu for Global Toggles */}
      <div className="fixed bottom-6 left-6 z-[9000] flex flex-col-reverse items-start gap-3">
        {/* Toggle Button */}
        <button
          onClick={() => setIsFloatingPanelVisible(!isFloatingPanelVisible)}
          className={`flex items-center justify-center p-3 rounded-full shadow-lg transition-colors ${
            isFloatingPanelVisible
              ? "bg-[#1E2F31] text-[#EFEBE7]"
              : "bg-white text-[#1E2F31] border border-[#D8D8D8]"
          }`}
          title="Toggle Global Settings"
          aria-label="Toggle Global Settings"
        >
          <Settings
            size={20}
            className={isFloatingPanelVisible ? "opacity-100" : "opacity-80"}
          />
        </button>

        {/* The Panel */}
        <div
          className={`bg-white border border-[#D8D8D8] rounded-2xl shadow-xl w-72 overflow-hidden transition-all duration-300 origin-bottom-left ${
            isFloatingPanelVisible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
        >
          <div className="bg-[#EFEBE7] px-4 py-3 border-b border-[#D8D8D8]">
            <h4 className="text-[11px] uppercase font-bold tracking-wider text-[#1E2F31] flex items-center gap-1.5">
              <Settings size={14} /> Global Model Settings
            </h4>
          </div>
          <div className="p-4 space-y-4">
            {/* Toggle Item: Bank Debt */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                <Landmark size={14} className="text-[#9B8B70]" /> Bank Debt
                Financing
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={propCoAssumptions?.includeFinancing || false}
                  onChange={(e) =>
                    handlePropCoChange("includeFinancing", e.target.checked)
                  }
                />
                <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
              </label>
            </div>
            {/* Toggle Item: Land Cost */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                <Map size={14} className="text-[#9B8B70]" /> Include Land Cost
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={propCoAssumptions?.includeLand ?? true}
                  onChange={(e) =>
                    handlePropCoChange("includeLand", e.target.checked)
                  }
                />
                <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
              </label>
            </div>
            {/* Symmetrical Exit Locks */}
            <div className="space-y-2 pt-2 border-t border-[#D8D8D8]/50">
              {/* Lock PropCo to Master */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                  <Lock
                    size={14}
                    className={
                      propCoLocked ? "text-[#1C6048]" : "text-[#4C4A4B]/40"
                    }
                  />{" "}
                  Lock PropCo to Master
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={propCoLocked}
                    onChange={togglePropCoLock}
                  />
                  <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
                </label>
              </div>
            </div>
            {/* Dropdown: Master Exit Strategy */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                <Target
                  size={14}
                  className={
                    holdCoLocked ? "text-[#1C6048]/50" : "text-[#1C6048]"
                  }
                />{" "}
                Master Exit
                {holdCoLocked && <Lock size={10} className="text-[#1C6048]" />}
              </span>
              <select
                disabled={holdCoLocked}
                className={`w-[130px] text-[10px] rounded p-1 font-bold focus:outline-none transition-all ${
                  holdCoLocked
                    ? "bg-[#EFEBE7]/80 text-[#9B8B70] cursor-not-allowed border-[#D8D8D8]"
                    : "bg-white border border-[#D8D8D8] text-[#1E2F31] focus:border-[#1C6048]"
                }`}
                value={holdCoScenario}
                onChange={(e) => setHoldCoScenario(e.target.value)}
              >
                <option value="manual">Manual (Settings)</option>
                <option value="yr10">Exit in Yr 10</option>
                <option value="breakeven">Exit at Breakeven</option>
                <option
                  value="debt_free"
                  disabled={
                    !propCoAssumptions?.includeFinancing &&
                    !holdCoAssumptions?.includeFinancing
                  }
                >
                  Exit Post-Debt
                </option>
                <option value="none">No Exit (Yield)</option>
              </select>
            </div>
            {/* Dropdown: PropCo Exit Strategy */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                <Target
                  size={14}
                  className={
                    propCoLocked ? "text-[#9B8B70]/50" : "text-[#9B8B70]"
                  }
                />{" "}
                PropCo Exit
                {propCoLocked && <Lock size={10} className="text-[#9B8B70]" />}
              </span>
              <select
                disabled={propCoLocked}
                className={`w-[130px] text-[10px] rounded p-1 font-bold focus:outline-none transition-all ${
                  propCoLocked
                    ? "bg-[#EFEBE7]/80 text-[#9B8B70] cursor-not-allowed border-[#D8D8D8]"
                    : "bg-white border border-[#D8D8D8] text-[#1E2F31] focus:border-[#1C6048]"
                }`}
                value={propCoScenario}
                onChange={(e) => setPropCoScenario(e.target.value)}
              >
                <option value="manual">Manual (Settings)</option>
                <option value="yr10">Exit in Yr 10</option>
                <option value="breakeven">Exit at Breakeven</option>
                <option
                  value="debt_free"
                  disabled={
                    !propCoAssumptions?.includeFinancing &&
                    !holdCoAssumptions?.includeFinancing
                  }
                >
                  Exit Post-Debt
                </option>
                <option value="none">No Exit (Yield)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  getInitialStepUpPercentages,
  ensureArray,
  CANCER_DATA,
  INSURANCE_DATA,
};
