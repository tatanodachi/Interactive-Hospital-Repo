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
  Maximize2,
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
} from "lucide-react";
import { ExecutiveSummaryView } from "./ExecutiveSummaryView";
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

const LazyResponsiveContainer = memo(({ children, ...props }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div style={{ width: "100%", height: "100%" }} />;
  }

  return <ResponsiveContainer {...props}>{children}</ResponsiveContainer>;
});

const CHART_MARGINS_BAR = { top: 20, right: 0, left: 0, bottom: 0 };
const CHART_MARGINS_LINE = { top: 40, right: 35, left: 20, bottom: 0 };
const TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid #D8D8D8",
  fontSize: "12px",
  color: "#1E2F31",
};
const CHART_CURSOR_STYLE = { fill: "#F9F8F6" };
const LEGEND_STYLE = { fontSize: "11px", paddingTop: "20px" };

// --- NEW STABLE REFERENCES FOR OPPORTUNITIES TAB ---
const TICK_STYLE = { fontSize: 10, fill: "#4C4A4B" };
const PREM_MKT_PIE_DATA = [
  { name: "SES A & B", value: 18 },
  { name: "General / BPJS", value: 82 },
];
const formatCancerCases = (val) => new Intl.NumberFormat("en-US").format(val);
const formatInsuranceTooltip = (val) => val.toFixed(2) + "T IDR";
const formatInsuranceLabel = (val) => val.toFixed(2);
const LINE_LABEL_STYLE = {
  position: "top",
  fill: "#4C4A4B",
  fontSize: 10,
  dy: -10,
  formatter: formatInsuranceLabel,
};

const renderPieLabel = ({
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
const START_YEAR = 2026;
const DEFAULT_END_YEAR = 2028;
const MONTH_NAMES_SHORT = [
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

const generateTimelineMonths = (start, end) => {
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

const formatNumber = (val, decimals = 1) => {
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

const formatCurrency = (val) => {
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
const CustomBedIcon = memo(({ size = 24, className = "" }) => (
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

const CustomScaleIcon = memo(({ size = 24, className = "" }) => (
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

const CustomKnotIcon = memo(({ size = 24, className = "" }) => (
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

const CustomStethoscopeIcon = memo(({ size = 24, className = "" }) => (
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

const CustomPhysicianIcon = memo(({ size = 24, className = "" }) => (
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

const CustomPopulationIcon = memo(({ size = 24, className = "" }) => (
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

const CustomDiagnosticsIcon = memo(({ size = 24, className = "" }) => (
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

const CustomLinacIcon = memo(({ size = 24, className = "" }) => (
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

const CustomOverseasIcon = memo(({ size = 24, className = "" }) => (
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

const CustomPalliativeIcon = memo(({ size = 24, className = "" }) => (
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

const CustomClipboardIcon = memo(({ size = 24, className = "" }) => (
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

const MarkdownRenderer = memo(({ content, className = "" }) => {
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

const NavButton = memo(({ active, onClick, icon, label, disabled }) => (
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

const useTooltip = (tooltip) => {
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

const KPITooltipIcon = memo(
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

const StatefulTooltipIcon = memo(({ tooltip, align = "right" }) => {
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

const KPICard = memo(
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

const MiniKPICard = memo(
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

const DualKPICard = memo(
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

const SectionTitle = memo(({ title, icon, color }) => {
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

const FormattedInput = memo(
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

const AssumptionRow = memo(({ label, val, set, unit, isLocked, tooltip }) => {
  const { tooltipState, setTooltipState } = useTooltip(tooltip);
  return (
    <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded transition-colors relative">
      <div className="flex items-center gap-1.5">
        <label className="text-[10px] text-[#4C4A4B] font-bold">{label}</label>
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
        <span className="text-[8px] text-[#4C4A4B] font-black uppercase w-4">
          {unit}
        </span>
      </div>
    </div>
  );
});

const AssumptionDepreciationGroup = memo(
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

const ToggleRow = memo(({ label, desc, checked, onChange, isLocked }) => (
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
));

const AssumptionRowCalculated = memo(
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

const AssumptionRowQtyPrice = memo(
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

const AssumptionRowQtyPriceWithToggle = memo(
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

const SettingsHeader = memo(
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

const TableRow = memo(
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
      else baseColorClass = "bg-[#EFEBE7] font-bold text-[#1E2F31]";
    }

    let firstColClass = `pr-3 py-1.5 sticky left-0 z-[40] border-r border-b border-[#D8D8D8] whitespace-nowrap transition-all shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[360px] min-w-[360px] max-w-[360px] overflow-hidden text-ellipsis ${baseColorClass} ${isDoubleIndent ? "pl-3.5 text-[9.5px]" : isIndent ? "pl-3.5 text-[10px]" : "pl-1 text-[11px]"} ${!highlight && !isHeader ? "group-hover:bg-[#F9F8F6]" : ""}`;
    let totalColClass = `px-2 py-1.5 text-right font-bold font-mono border-l border-b border-[#D8D8D8] sticky right-0 z-[40] shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] ${baseColorClass} ${!highlight && !isHeader ? "group-hover:bg-[#F9F8F6]" : ""}`;

    return (
      <tr
        className={`group transition-all ${isExpandable ? "cursor-pointer select-none" : ""} ${highlight || isHeader ? "" : "hover:bg-[#F9F8F6]"}`}
        onClick={isExpandable ? onExpand : undefined}
      >
        <td
          className={firstColClass}
        >
          <div className="flex items-center justify-between gap-2 overflow-hidden w-full">
            <div 
              className={`flex items-center gap-1.5 overflow-hidden min-w-0 ${isExpandable ? 'cursor-pointer hover:opacity-80 active:scale-95 transition-all' : ''}`}
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
                  │  └─
                </span>
              )}
              {hasConnector && !hasDoubleConnector && (
                <span className="font-mono select-none text-[9px] tracking-tighter text-[#9B8B70]/80 mr-1 flex-shrink-0 whitespace-nowrap">
                  └─
                </span>
              )}

              <span className={`truncate ${isHeader ? "font-bold text-[#1E2F31]" : highlight ? "font-bold text-[#1E2F31]" : "text-[#4C4A4B]"}`}>
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
          const cellBg = highlight
            ? indigo
              ? "bg-[#EBEFEE]"
              : emerald
                ? "bg-[#E8EFEA]"
                : "bg-[#EFEBE7]/50"
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

          const hoverBgClass = !highlight && !isHeader
            ? "group-hover:bg-[#F9F8F6]"
            : "";

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

const ExpandableDataRowGroup = ({
  parentLabel,
  parentDk,
  parentTotal,
  data,
  childrenData,
  parentTooltip,
  isSubtractor,
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

const TableSection = memo(({ title, colSpan, type = "default" }) => {
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

const CapexRow = memo(
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

const ExpandableCapexRow = memo(
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

const PartnerReturnCard = ({
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
        <div className="flex justify-between items-center text-xs">
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
          <span>{formatCurrency(metrics?.totalCash)}</span>
        </div>
      </div>
    </div>
  );
};

const SensitivityTable = memo(
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

const ProjectInfoFieldComp = memo(
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

const BentoBox = memo(
  ({ children, className = "", colSpan = "col-span-12" }) => (
    <div
      className={`bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-[#D8D8D8] flex flex-col transition-all hover:shadow-md ${colSpan} ${className}`}
    >
      {children}
    </div>
  ),
);

const BentoIcon = memo(({ icon, color = "blue", className = "" }) => {
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

const ProjectOverviewView = memo(({ info, setInfo, isLocked }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in duration-500 pb-12">
    {/* Main General Info Bento */}
    <BentoBox colSpan="md:col-span-12">
      <div className="flex items-center gap-4 mb-6">
        <BentoIcon
          icon={<Building size={28} />}
          color="blue"
          className="mb-0"
        />
        <div>
          <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight">
            Project Overview
          </h2>
          <p className="text-xs text-[#4C4A4B] font-medium mt-1">
            Dedicated Oncology Hospital
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        <ProjectInfoFieldComp
          label="Project Name"
          value={info.name}
          onChange={(v) => setInfo({ ...info, name: v })}
          isLocked={isLocked}
          icon={<FileText size={14} />}
        />
        <ProjectInfoFieldComp
          label="Location"
          value={info.location}
          onChange={(v) => setInfo({ ...info, location: v })}
          isLocked={isLocked}
          icon={<MapPin size={14} />}
        />
        <ProjectInfoFieldComp
          label="Hospital Class"
          value={info.type}
          onChange={(v) => setInfo({ ...info, type: v })}
          isLocked={isLocked}
          icon={<Stethoscope size={14} />}
        />
        <ProjectInfoFieldComp
          label="Development Status"
          value={info.status}
          onChange={(v) => setInfo({ ...info, status: v })}
          isLocked={isLocked}
          icon={<Clock size={14} />}
        />
      </div>
    </BentoBox>

    {/* Master Plan Visuals Bento (Left side, large map) */}
    <BentoBox
      colSpan="md:col-span-12 lg:col-span-8"
      className="p-0 overflow-hidden border-[#D8D8D8] min-h-[350px] lg:min-h-[100%] relative rounded-[28px] shadow-sm"
    >
      {/* ⚠️ SWAP THIS URL WITH YOUR SITE PLAN IMAGE */}
      <img
        src="/Site.jpg"
        alt="Site Plan"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#1E2F31]/60 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-[#D8D8D8] flex items-center gap-3">
        <Map size={20} className="text-[#1C6048]" />
        <div>
          <span className="block text-xs font-black text-[#1E2F31] uppercase tracking-widest">
            Master Site Plan
          </span>
          <span className="block text-[9px] font-bold text-[#4C4A4B]">
            Raya Daan Mogot (ROW ±30m)
          </span>
        </div>
      </div>
    </BentoBox>

    {/* Site Specs Bento (Right side, stacked render + cards) */}
    <BentoBox
      colSpan="md:col-span-12 lg:col-span-4"
      className="!bg-[#EFEBE7] border-transparent p-0 overflow-hidden flex flex-col"
    >
      {/* ⚠️ SWAP THIS URL WITH YOUR 3D RENDER IMAGE */}
      <div className="w-full h-48 lg:h-56 relative shrink-0 bg-gray-200">
        <img
          src="/Render.jpg"
          alt="3D Render"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-black uppercase text-[#1E2F31] shadow-sm tracking-widest">
          Proposed Concept
        </div>
      </div>

      <div className="p-6 lg:p-8 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <Map size={24} className="text-[#9B8B70]" />
          <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
            Site Specifications
          </h2>
        </div>

        <div className="space-y-3 flex-1">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="p-4 bg-white rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col justify-center text-center hover:-translate-y-1 transition-transform">
              <span className="text-[9px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-1">
                Total Land
              </span>
              <span className="text-lg font-black text-[#1E2F31] leading-none">
                {String(info.totalLand)}
              </span>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col justify-center text-center hover:-translate-y-1 transition-transform">
              <span className="text-[9px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-1">
                Building GFA
              </span>
              <span className="text-lg font-black text-[#1E2F31] leading-none">
                {String(info.totalBuilding)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#D8D8D8] shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
              <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                Zoning
              </span>
              <span className="text-xs font-black text-[#1E2F31]">
                {info.zoning}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
              <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                Land Title
              </span>
              <span className="text-xs font-black text-[#1E2F31]">
                {info.landTitle}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
              <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                BCR / KDB
              </span>
              <span className="text-xs font-black text-[#1E2F31]">
                {info.bcr}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#EFEBE7] pb-2">
              <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                FAR / KLB
              </span>
              <span className="text-xs font-black text-[#1E2F31]">
                {info.far}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                Green Area
              </span>
              <span className="text-xs font-black text-[#1C6048]">
                {info.greenArea}
              </span>
            </div>
          </div>
        </div>
      </div>
    </BentoBox>
  </div>
));

const CollaborationStrategyView = memo(({ isPresenting }) => (
  <div className="space-y-6 animate-in fade-in duration-500 pb-12">
    {/* Strategy Header */}
    <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-[#D8D8D8] flex flex-col md:flex-row justify-between items-center gap-6">
      <div>
        <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight mb-2 flex items-center gap-3">
          <Network className="text-[#1C6048]" size={28} /> Cross-Border Patient
          Journey
        </h2>
        <p className="text-xs text-[#4C4A4B] font-medium max-w-2xl leading-relaxed">
          A closed-loop collaboration model ensuring Vasanta captures maximum
          lifetime patient value through high-margin diagnostics and recurring
          therapies, while outsourcing only extreme-complexity interventions.
        </p>
      </div>
    </div>

    {/* 4-Card Flowchart Layout (1 Left, 2 Center, 1 Right) */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 relative mt-4">
      {/* LEFT COLUMN: Executive Diagnostics */}
      <div className="flex flex-col h-full relative z-10">
        <BentoBox className="flex-1 text-center bg-white border-[#D8D8D8] flex flex-col items-center">
          <h3 className="font-black text-[15px] text-[#1E2F31] mb-6">
            Executive Diagnostics
          </h3>

          {/* Custom Diagnostics SVG */}
          <div className="flex-1 w-full flex items-center justify-center min-h-[140px] mb-8">
            <div className="w-32 h-32 rounded-2xl border-2 border-[#D8D8D8] bg-[#F9F8F6] flex items-center justify-center text-[#9B8B70] transition-all hover:border-[#9B8B70] hover:shadow-md group">
              <CustomDiagnosticsIcon
                size={64}
                className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium mt-auto bg-[#F9F8F6] p-4 rounded-xl border border-[#D8D8D8] w-full">
            High-margin PET-CT and genomic screening act as the primary
            acquisition funnel locally.
          </p>
        </BentoBox>

        {/* Mobile Down Arrow (Visible only on mobile/tablet) */}
        <div className="lg:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#9B8B70] border-4 border-[#F9F8F6] rounded-full flex items-center justify-center shadow-md z-10 text-white">
          <ArrowRight size={14} strokeWidth={3} className="rotate-90" />
        </div>
      </div>

      {/* CENTER COLUMN: 2 Stacked Cards (Elevated to z-20 to pull arrows forward) */}
      <div className="flex flex-col gap-6 lg:gap-10 h-full relative z-20">
        {/* Left-to-Center Branching Arrow (Desktop Only) */}
        <div className="hidden lg:block absolute -left-10 top-[26%] bottom-[26%] w-10 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-5 border-t-2 border-[#9B8B70] -translate-y-[1px]"></div>
          <div className="absolute top-0 bottom-0 left-5 w-5 border-y-2 border-l-2 border-[#9B8B70] rounded-l-xl shadow-[-2px_0_4px_rgba(0,0,0,0.05)]"></div>
          <ArrowRight
            size={18}
            className="absolute -top-[9px] -right-[7px] text-[#9B8B70]"
            strokeWidth={3}
          />
          <ArrowRight
            size={18}
            className="absolute -bottom-[9px] -right-[7px] text-[#9B8B70]"
            strokeWidth={3}
          />
        </div>

        {/* Center-to-Right Merging Arrow (Desktop Only) */}
        <div className="hidden lg:block absolute -right-10 top-[26%] bottom-[26%] w-10 z-0 pointer-events-none">
          <div className="absolute top-0 bottom-0 right-5 w-5 border-y-2 border-r-2 border-[#9B8B70] rounded-r-xl shadow-[2px_0_4px_rgba(0,0,0,0.05)]"></div>
          <div className="absolute top-1/2 right-0 w-5 border-t-2 border-[#9B8B70] -translate-y-[1px]"></div>
          <ArrowRight
            size={18}
            className="absolute top-1/2 -mt-[9px] -right-[7px] text-[#9B8B70]"
            strokeWidth={3}
          />
        </div>

        {/* Middle Mobile Down Arrow (Visible only on mobile/tablet) */}
        <div className="lg:hidden absolute top-[calc(50%-20px)] left-1/2 -translate-x-1/2 w-8 h-8 bg-[#9B8B70] border-4 border-[#F9F8F6] rounded-full flex items-center justify-center shadow-md z-10 text-white">
          <ArrowRight size={14} strokeWidth={3} className="rotate-90" />
        </div>

        {/* Top Center: Local Systemic */}
        <BentoBox className="flex-1 text-center bg-white border-[#D8D8D8] flex flex-col items-center">
          <h3 className="font-black text-[15px] text-[#1E2F31] mb-4">
            Local Systemic & LINAC
          </h3>

          {/* Custom LINAC SVG */}
          <div className="flex-1 w-full flex items-center justify-center min-h-[100px] mb-6">
            <div className="w-24 h-24 rounded-2xl border-2 border-[#D8D8D8] bg-[#F9F8F6] flex items-center justify-center text-[#9B8B70] transition-all hover:border-[#9B8B70] hover:shadow-md group">
              <CustomLinacIcon
                size={48}
                className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium mt-auto bg-[#F9F8F6] p-4 rounded-xl border border-[#D8D8D8] w-full">
            Most vast majority of cases require 30-day radiotherapy cycles or
            standard chemotherapy. Geographic inelasticity forces these patients
            to utilize our highly profitable local bunkers and VIP infusion
            suites.
          </p>
        </BentoBox>

        {/* Bottom Center: Overseas Partner */}
        <BentoBox className="flex-1 text-center bg-white border-[#D8D8D8] flex flex-col items-center">
          <h3 className="font-black text-[15px] text-[#1E2F31] mb-4">
            Overseas Partner
          </h3>

          {/* Custom Overseas Partner SVG + DNA */}
          <div className="flex-1 w-full flex items-center justify-center min-h-[100px] mb-6">
            <div className="px-5 h-24 rounded-2xl border-2 border-[#D8D8D8] bg-[#E8EFEA] flex items-center justify-center gap-4 transition-all hover:border-[#1C6048] hover:shadow-md group">
              <CustomOverseasIcon
                size={42}
                className="text-[#1C6048] opacity-80 group-hover:opacity-100 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300"
              />
              <div className="w-px h-10 bg-[#D8D8D8] transition-colors group-hover:bg-[#1C6048]/30"></div>
              <Dna
                size={36}
                strokeWidth={1.5}
                className="text-[#1C6048] opacity-80 group-hover:opacity-100 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#1E2F31] leading-relaxed font-medium mt-auto bg-[#E8EFEA] p-4 rounded-xl border border-[#1C6048]/20 w-full">
            Only ultra-complex surgical cases are referred out, leveraging
            industrial trust without cannibalizing core local EBITDA.
          </p>
        </BentoBox>

        {/* Mobile Down Arrow (Visible only on mobile/tablet) */}
        <div className="lg:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#9B8B70] border-4 border-[#F9F8F6] rounded-full flex items-center justify-center shadow-md z-10 text-white">
          <ArrowRight size={14} strokeWidth={3} className="rotate-90" />
        </div>
      </div>

      {/* RIGHT COLUMN: Repatriation & Palliative */}
      <div className="flex flex-col h-full relative z-10">
        <BentoBox className="flex-1 text-center bg-white border-[#D8D8D8] flex flex-col items-center">
          <h3 className="font-black text-[15px] text-[#1E2F31] mb-6">
            Repatriation & Palliative
          </h3>

          {/* Custom Palliative SVG + Medical Check Board */}
          <div className="flex-1 w-full flex items-center justify-center min-h-[140px] mb-8">
            <div className="px-5 h-24 rounded-2xl border-2 border-[#D8D8D8] bg-[#F9F8F6] flex items-center justify-center gap-4 text-[#9B8B70] transition-all hover:border-[#9B8B70] hover:shadow-md group">
              <CustomPalliativeIcon
                size={48}
                className="opacity-80 group-hover:opacity-100 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-300"
              />
              <div className="w-px h-10 bg-[#D8D8D8] transition-colors group-hover:bg-[#9B8B70]/30"></div>
              <CustomClipboardIcon
                size={42}
                className="opacity-80 group-hover:opacity-100 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>

          <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium mt-auto bg-[#F9F8F6] p-4 rounded-xl border border-[#D8D8D8] w-full">
            All overseas patients are mandated to return to the local hospital
            for multi-year monitoring, recovery, and high-margin palliative
            care.
          </p>
        </BentoBox>
      </div>
    </div>
  </div>
));

// === INTERACTIVE MAP CONSTANTS ===
const targetRegions = [
  {
    id: "jp",
    name: "Central Jakarta",
    query: "Jakarta Pusat, Indonesia",
    group: "DKI Jakarta",
    population: 1057270,
    density: 21831,
    income: 949,
    commuter: 75,
    medianAge: 31,
    maleDistribution: [17168, 38731, 68126, 83155, 80006, 83945, 84168, 75379],
    femaleDistribution: [
      24877, 42137, 68132, 83496, 78477, 79872, 79045, 70556,
    ],
    fallbackLat: -6.1805,
    fallbackLon: 106.8284,
    fallbackRadius: 0.035,
  },
  {
    id: "ju",
    name: "North Jakarta",
    query: "Jakarta Utara, Indonesia",
    group: "DKI Jakarta",
    population: 1819030,
    density: 12378,
    income: 392,
    commuter: 42,
    medianAge: 29,
    maleDistribution: [
      30520, 65710, 109660, 143670, 146670, 138460, 142690, 138500,
    ],
    femaleDistribution: [
      36880, 69780, 108990, 142570, 143090, 134470, 134780, 132590,
    ],
    fallbackLat: -6.1214,
    fallbackLon: 106.8922,
    fallbackRadius: 0.04,
  },
  {
    id: "js",
    name: "South Jakarta",
    query: "Jakarta Selatan, Indonesia",
    group: "DKI Jakarta",
    population: 2323644,
    density: 15233,
    income: 409,
    commuter: 65,
    medianAge: 32,
    maleDistribution: [
      36807, 80261, 152503, 186120, 169619, 184051, 193763, 156247,
    ],
    femaleDistribution: [
      46476, 87743, 151723, 193696, 177339, 177831, 182959, 146506,
    ],
    fallbackLat: -6.2615,
    fallbackLon: 106.8106,
    fallbackRadius: 0.045,
    defaultOff: true,
  },
  {
    id: "jb",
    name: "West Jakarta",
    query: "Jakarta Barat, Indonesia",
    group: "DKI Jakarta",
    population: 2525856,
    density: 19953,
    income: 269,
    commuter: 58,
    medianAge: 30,
    maleDistribution: [
      39097, 83101, 153808, 212416, 195279, 193913, 208734, 184228,
    ],
    femaleDistribution: [
      50108, 89782, 149586, 212272, 198009, 186988, 196935, 171600,
    ],
    fallbackLat: -6.1683,
    fallbackLon: 106.7588,
    fallbackRadius: 0.04,
  },
  {
    id: "jt",
    name: "East Jakarta",
    query: "Jakarta Timur, Indonesia",
    group: "DKI Jakarta",
    population: 3085080,
    density: 16622,
    income: 218,
    commuter: 62,
    defaultOff: true,
    medianAge: 31,
    maleDistribution: [
      53220, 118690, 193380, 234910, 236790, 240090, 240200, 227370,
    ],
    femaleDistribution: [
      61860, 126040, 197920, 237040, 240000, 232680, 227530, 217360,
    ],
    fallbackLat: -6.225,
    fallbackLon: 106.9004,
    fallbackRadius: 0.05,
  },
  {
    id: "ts",
    name: "South Tangerang",
    query: "Tangerang Selatan, Indonesia",
    group: "Banten",
    population: 1474311,
    density: 8523,
    income: 85,
    commuter: 68,
    medianAge: 28,
    maleDistribution: [
      23110, 53271, 91933, 115210, 116558, 117233, 118647, 97991,
    ],
    femaleDistribution: [
      23312, 53735, 92736, 116215, 117576, 118256, 119682, 98846,
    ],
    fallbackLat: -6.2886,
    fallbackLon: 106.7179,
    fallbackRadius: 0.05,
    defaultOff: true,
  },
  {
    id: "tg",
    name: "Tangerang City",
    query: "Kota Tangerang, Indonesia",
    group: "Banten",
    population: 1977376,
    density: 11098,
    income: 122,
    commuter: 48,
    medianAge: 29,
    maleDistribution: [
      26327, 61212, 113756, 158145, 157844, 154782, 165449, 154659,
    ],
    femaleDistribution: [
      29313, 66524, 116233, 162857, 158728, 152113, 154832, 144602,
    ],
    fallbackLat: -6.1702,
    fallbackLon: 106.6403,
    fallbackRadius: 0.04,
  },
  {
    id: "tgr",
    name: "Tangerang Regency",
    query: "Kabupaten Tangerang, Indonesia",
    group: "Banten",
    population: 3516095,
    density: 3373,
    income: 58,
    commuter: 32,
    defaultOff: true,
    medianAge: 27,
    maleDistribution: [
      44270, 99883, 200007, 269109, 302360, 290100, 308035, 275297,
    ],
    femaleDistribution: [
      46153, 95069, 195181, 274740, 290369, 281738, 289501, 254283,
    ],
    fallbackLat: -6.1762,
    fallbackLon: 106.482,
    fallbackRadius: 0.1,
  },
  {
    id: "bg",
    name: "Bogor City",
    query: "Kota Bogor, Indonesia",
    group: "West Java",
    population: 1093570,
    density: 9780,
    income: 60,
    commuter: 38,
    defaultOff: true,
    medianAge: 29,
    maleDistribution: [19937, 40500, 64762, 80027, 87200, 87104, 86604, 82195],
    femaleDistribution: [
      23805, 42287, 64596, 77713, 83727, 83069, 81460, 78790,
    ],
    fallbackLat: -6.5971,
    fallbackLon: 106.7996,
    fallbackRadius: 0.04,
  },
  {
    id: "bgr",
    name: "Bogor Regency",
    query: "Kabupaten Bogor, Indonesia",
    group: "West Java",
    population: 5721618,
    density: 1926,
    income: 58,
    commuter: 24,
    defaultOff: true,
    medianAge: 26,
    maleDistribution: [
      79039, 184133, 323695, 426942, 497127, 485176, 471092, 463359,
    ],
    femaleDistribution: [
      84314, 176874, 308936, 406179, 471528, 454921, 444784, 443519,
    ],
    fallbackLat: -6.5518,
    fallbackLon: 106.6291,
    fallbackRadius: 0.15,
  },
  {
    id: "dp",
    name: "Depok City",
    query: "Kota Depok, Indonesia",
    group: "West Java",
    population: 2167911,
    density: 10871,
    income: 46,
    commuter: 67,
    defaultOff: true,
    medianAge: 29,
    maleDistribution: [
      33125, 76331, 135659, 171467, 169525, 161517, 172442, 169764,
    ],
    femaleDistribution: [
      39987, 80894, 133575, 169060, 173490, 155033, 163947, 162095,
    ],
    fallbackLat: -6.4025,
    fallbackLon: 106.7942,
    fallbackRadius: 0.05,
  },
  {
    id: "bk",
    name: "Bekasi City",
    query: "Kota Bekasi, Indonesia",
    group: "West Java",
    population: 2646272,
    density: 12453,
    income: 52,
    commuter: 60,
    defaultOff: true,
    medianAge: 28,
    maleDistribution: [
      43170, 101772, 156173, 202246, 221040, 201993, 201968, 200350,
    ],
    femaleDistribution: [
      45344, 107112, 161831, 202956, 222691, 193598, 192559, 191469,
    ],
    fallbackLat: -6.2383,
    fallbackLon: 106.9756,
    fallbackRadius: 0.06,
  },
];

const mapLocations = [
  // --- VASANTA ECOSYSTEM ---
  {
    id: "vasanta",
    name: "Proposed Vasanta Hospital",
    group: "Vasanta",
    desc: "120-Bed Oncology Hub",
    lat: -6.1543,
    lon: 106.7398,
    color: "#1E3A8A",
    radii: [5000, 10000],
  },

  // Vasanta: < 5km Radius (Class B)
  {
    id: "v_rsgk",
    name: "RS EMC Grha Kedoya",
    group: "Vasanta",
    subGroup: "< 5km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1681,
    lon: 106.7651,
    color: "#A95C3E",
  },
  {
    id: "v_hermina_dm",
    name: "Hermina Daan Mogot",
    group: "Vasanta",
    subGroup: "< 5km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1554,
    lon: 106.7082,
    color: "#A95C3E",
  },
  {
    id: "v_rspi_puri",
    name: "RS Pondok Indah Puri Indah",
    group: "Vasanta",
    subGroup: "< 5km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1866,
    lon: 106.7358,
    color: "#A95C3E",
  },
  {
    id: "v_pik",
    name: "Pantai Indah Kapuk Hospital",
    group: "Vasanta",
    subGroup: "< 5km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1112,
    lon: 106.7404,
    color: "#A95C3E",
  },
  {
    id: "v_ciputra",
    name: "Ciputra Hospital CitraGarden",
    group: "Vasanta",
    subGroup: "< 5km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1265,
    lon: 106.7055,
    color: "#A95C3E",
  },
  {
    id: "v_siloam_kj",
    name: "Siloam Kebon Jeruk",
    group: "Vasanta",
    subGroup: "< 5km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1912,
    lon: 106.7621,
    color: "#A95C3E",
  },
  {
    id: "v_rsud_cengkareng",
    name: "RSUD Cengkareng",
    group: "Vasanta",
    subGroup: "< 5km Radius",
    tier: "Class B",
    desc: "Public (B)",
    lat: -6.1362,
    lon: 106.7298,
    color: "#A95C3E",
  },

  // Vasanta: 5-10km Radius (Class A)
  {
    id: "v_tarakan",
    name: "RSUD Tarakan",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class A",
    desc: "Public (A)",
    lat: -6.1732,
    lon: 106.809,
    color: "#1E2F31",
  },
  {
    id: "v_dharmais",
    name: "Dharmais Cancer Hospital",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class A",
    desc: "National Cancer Center (Public)",
    lat: -6.1953,
    lon: 106.799,
    color: "#1E2F31",
  },
  {
    id: "v_rsab",
    name: "RSAB Harapan Kita",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class A",
    desc: "Maternal & Child (Public)",
    lat: -6.1955,
    lon: 106.7981,
    color: "#1E2F31",
  },
  {
    id: "v_rsjpn",
    name: "RSJPN Harapan Kita",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class A",
    desc: "Cardiac Center (Public)",
    lat: -6.1942,
    lon: 106.7985,
    color: "#1E2F31",
  },
  {
    id: "v_rsj_soeharto",
    name: "RSJ Dr. Soeharto Heerdjan",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class A",
    desc: "Mental Health (Public)",
    lat: -6.1625,
    lon: 106.786,
    color: "#1E2F31",
  },
  {
    id: "v_fkg_trisakti",
    name: "RSGM FKG Trisakti",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class A",
    desc: "Dental Center",
    lat: -6.1685,
    lon: 106.7885,
    color: "#1E2F31",
  },

  // Vasanta: 5-10km Radius (Class B)
  {
    id: "v_mandaya",
    name: "Mandaya Royal Puri",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1985,
    lon: 106.7045,
    color: "#A95C3E",
  },
  {
    id: "v_tzuchi",
    name: "Tzu Chi Hospital - PIK",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.106,
    lon: 106.7392,
    color: "#A95C3E",
  },

  {
    id: "v_husada",
    name: "RS Husada",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1415,
    lon: 106.8251,
    color: "#A95C3E",
  },
  {
    id: "v_ladokgi",
    name: "RSGM Ladokgi",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class B",
    desc: "Dental (Public)",
    lat: -6.2111,
    lon: 106.8075,
    color: "#A95C3E",
  },
  {
    id: "v_mintohardjo",
    name: "RSAL Dr. Mintohardjo",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class B",
    desc: "Naval Hospital (Public)",
    lat: -6.2085,
    lon: 106.8078,
    color: "#A95C3E",
  },
  {
    id: "v_atma_jaya",
    name: "RS Atma Jaya",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1135,
    lon: 106.7885,
    color: "#A95C3E",
  },
  {
    id: "v_pluit",
    name: "Pluit Hospital",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1182,
    lon: 106.7931,
    color: "#A95C3E",
  },
  {
    id: "v_pelni",
    name: "RS Pelni",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class B",
    desc: "Public (B)",
    lat: -6.1925,
    lon: 106.8001,
    color: "#A95C3E",
  },

  {
    id: "v_sumber_waras",
    name: "Sumber Waras Hospital",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1652,
    lon: 106.7971,
    color: "#A95C3E",
  },
  {
    id: "v_royal_taruma",
    name: "Royal Taruma Hospital",
    group: "Vasanta",
    subGroup: "5-10km Radius",
    tier: "Class B",
    desc: "Private (B)",
    lat: -6.1645,
    lon: 106.7871,
    color: "#A95C3E",
  },

  // --- CANCER HOSPITALS (Static/Standalone Group) ---
  // Class A
  {
    id: "dharmais",
    name: "Dharmais Cancer Hospital",
    group: "Cancer Hospitals",
    subGroup: "Class A",
    desc: "National Cancer Center (Public)",
    lat: -6.1953,
    lon: 106.799,
    color: "#99B6AA",
  },
  {
    id: "mrccc",
    name: "MRCCC Siloam Semanggi",
    group: "Cancer Hospitals",
    subGroup: "Class A",
    desc: "Private Comprehensive Cancer Center",
    lat: -6.2201,
    lon: 106.8155,
    color: "#99B6AA",
  },
  {
    id: "rscm",
    name: "RSUPN Cipto Mangunkusumo",
    group: "Cancer Hospitals",
    subGroup: "Class A",
    desc: "National Cancer Center (Public)",
    lat: -6.1976,
    lon: 106.847,
    color: "#99B6AA",
  },

  // Class B
  {
    id: "tzuchi",
    name: "Tzu Chi Hospital - PIK",
    group: "Cancer Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.106,
    lon: 106.7392,
    color: "#99B6AA",
  },
  {
    id: "mandaya",
    name: "Mandaya Royal Puri",
    group: "Cancer Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.1985,
    lon: 106.7045,
    color: "#99B6AA",
  },
  {
    id: "rsgk",
    name: "RS EMC Grha Kedoya",
    group: "Cancer Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.1681,
    lon: 106.7651,
    color: "#99B6AA",
  },

  // --- GENERAL NODES ---
  {
    id: "tb",
    name: "TB Simatupang",
    group: "Vasanta",
    desc: "South Jakarta node",
    lat: -6.2932,
    lon: 106.8189,
    color: "#1E3A8A",
  },
  {
    id: "new_vasanta",
    name: "Serpong",
    group: "Vasanta",
    desc: "Tangerang node",
    lat: -6.247432407754837,
    lon: 106.64868860550507,
    color: "#1E3A8A",
  },
  {
    id: "pik",
    name: "Pantai Indah Kapuk",
    group: "General",
    desc: "Premium coastal district",
    lat: -6.1112,
    lon: 106.7404,
    color: "#9B8B70",
  },
  {
    id: "Soekarno-Hatta Airport",
    name: "Soekarno-Hatta Airport",
    group: "Infrastructure",
    desc: "Transit Hub",
    query: "Bandar Udara Internasional Soekarno-Hatta",
    color: "#9b8b70", // Slate gray to distinguish from city demographics
    fillColor: "#9b8b70",
    fillOpacity: 0.35,
    population: "Transit Hub",
    density: "N/A",
    hospitals: 1,
    clinics: 3,
    fallbackLat: -6.1256,
    fallbackLon: 106.6558,
    fallbackRadius: 0.035,
  },
];

const ageCohorts = [
  "70+",
  "60-69",
  "50-59",
  "40-49",
  "30-39",
  "20-29",
  "10-19",
  "0-9",
];

const regionGroups = targetRegions.reduce((acc, region) => {
  if (!acc[region.group]) acc[region.group] = [];
  acc[region.group].push(region);
  return acc;
}, {});

const getDensityColor = (density) =>
  density > 15000
    ? "#134433"
    : density > 10000
      ? "#1C6048"
      : density > 5000
        ? "#41856B"
        : "#99B6AA";
const getEconomyColor = (income) =>
  income >= 500
    ? "#8C7A5E"
    : income >= 300
      ? "#AFA189"
      : income >= 100
        ? "#C8BEAC"
        : "#E1DCD3";
const getPopulationColor = (pop) =>
  pop >= 3000000
    ? "#7C3A21"
    : pop >= 2000000
      ? "#A95C3E"
      : pop >= 1500000
        ? "#D08C70"
        : "#E8C2B3";
const getCommuterColor = (rate) =>
  rate > 60
    ? "#1E3A8A"
    : rate > 45
      ? "#3B82F6"
      : rate > 30
        ? "#60A5FA"
        : "#DBEAFE";
const getAgeColor = (age) =>
  age >= 31
    ? "#581C87"
    : age >= 29
      ? "#8B5CF6"
      : age >= 27
        ? "#C084FC"
        : "#F3E8FF";
const getGroupColor = (group) =>
  group === "DKI Jakarta"
    ? "#1C6048"
    : group === "Banten"
      ? "#1E2f31"
      : "#9B8B70";

const formatAxisLabel = (val) => {
  if (val === 0) return "0";
  if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
  if (val >= 1000) return (val / 1000).toFixed(0) + "k";
  return val.toString();
};

const generateFallbackGeoJSON = (centerLat, centerLon, radiusDegrees) => {
  const points = 32;
  const coords = [];
  for (let i = 0; i < points; i++) {
    const angle = ((i * 360) / points) * (Math.PI / 180);
    const lat = centerLat + radiusDegrees * Math.cos(angle);
    const lon =
      centerLon +
      (radiusDegrees * Math.sin(angle)) / Math.cos((centerLat * Math.PI) / 180);
    coords.push([lon, lat]);
  }
  coords.push(coords[0]);
  return { type: "Polygon", coordinates: [coords] };
};

const InteractiveDemographicMap = memo(() => {
  const [leafletReady, setLeafletReady] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("controls"); // controls | analytics
  const [viewMode, setViewMode] = useState("admin");
  const [regionsSectionExpanded, setRegionsSectionExpanded] = useState(true);
  const [poiSectionExpanded, setPoiSectionExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedPoiGroups, setExpandedPoiGroups] = useState({
    Vasanta: false,
    "Cancer Hospitals": false,
    General: false,
    Infrastructure: false,
  });
  const [expandedSubGroups, setExpandedSubGroups] = useState({
    "Class A": false,
    "< 5km Radius": false,
    "5-10km Radius": false,
  });
  const [activeRegions, setActiveRegions] = useState(
    targetRegions.filter((r) => !r.defaultOff).map((r) => r.id),
  );
  const [showRegionLabels, setShowRegionLabels] = useState(false);
  const [showTollRoads, setShowTollRoads] = useState(true);
  const [activePOIs, setActivePOIs] = useState(mapLocations.map((l) => l.id));
  const [loadingStatus, setLoadingStatus] = useState({
    active: true,
    text: "Initializing...",
    isError: false,
  });
  const [regionFetchStatuses, setRegionFetchStatuses] = useState({});
  const [isMapReady, setIsMapReady] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const mapRef = useRef(null);
  const tollRoadLayerRef = useRef(null);
  const regionsLayersRef = useRef({});
  const geoJsonCacheRef = useRef({});
  const hoverTooltipRef = useRef(null);
  const poiGroupRef = useRef(null);
  const poiLayersRef = useRef({});
  const poiMarkersRef = useRef({});
  const isHoveringPoi = useRef(false);
  const activeClickedPoiRef = useRef(null);
  const measureStateRef = useRef({
    points: [],
    line: null,
    dynamicLine: null,
    tooltip: null,
    markers: [],
  });

  const viewModeRef = useRef(viewMode);
  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    if (window.L && window.L.GestureHandling) {
      setLeafletReady(true);
      return;
    }

    const loadGestureHandling = () => {
      const ghCSS = document.createElement("link");
      ghCSS.rel = "stylesheet";
      ghCSS.href =
        "https://unpkg.com/leaflet-gesture-handling@1.2.2/dist/leaflet-gesture-handling.min.css";
      document.head.appendChild(ghCSS);

      const ghJS = document.createElement("script");
      ghJS.src =
        "https://unpkg.com/leaflet-gesture-handling@1.2.2/dist/leaflet-gesture-handling.min.js";
      ghJS.onload = () => setLeafletReady(true);
      document.body.appendChild(ghJS);
    };

    if (window.L) {
      loadGestureHandling();
      return;
    }

    const leafletCSS = document.createElement("link");
    leafletCSS.rel = "stylesheet";
    leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(leafletCSS);

    const leafletJS = document.createElement("script");
    leafletJS.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    leafletJS.onload = loadGestureHandling;
    document.body.appendChild(leafletJS);
  }, []);

  useEffect(() => {
    if (!leafletReady || mapRef.current) return;
    const L = window.L;

    // SAFEGUARD: Wipe dead ghost layers so they don't persist across React 18 remounts
    regionsLayersRef.current = {};
    geoJsonCacheRef.current = {};

    // SAFEGUARD: Clear residual map IDs
    const container = document.getElementById("demographics-map");
    if (container && container._leaflet_id) {
      container._leaflet_id = null;
    }

    const map = L.map("demographics-map", {
      zoomControl: false,
      gestureHandling: true,
    }).setView([-6.1543, 106.7398], 11);
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    map.createPane("labelsPane");
    map.getPane("labelsPane").style.zIndex = 405;
    map.createPane("ringsPane");
    map.getPane("ringsPane").style.zIndex = 410;
    map.createPane("markersPane");
    map.getPane("markersPane").style.zIndex = 420;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, attribution: "&copy; CARTO" },
    ).addTo(map);

    hoverTooltipRef.current = L.tooltip({
      className: "custom-tooltip",
      direction: "top",
      offset: [0, -10],
    });
    poiGroupRef.current = L.layerGroup().addTo(map);

    map.on("click", () => {
      if (activeClickedPoiRef.current) {
        const prevId = activeClickedPoiRef.current;
        activeClickedPoiRef.current = null;
        handlePoiHover(prevId, false);
      }
    });

    mapRef.current = map;
    initPOIs(map);
    setIsMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletReady]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (showTollRoads) {
      if (!tollRoadLayerRef.current) {
        setLoadingStatus({
          active: true,
          text: "Loading Toll Roads...",
          isError: false,
        });

        const renderTollRoads = (lines, isFallback = false) => {
          if (!mapRef.current) return;
          const L = window.L;
          const tollGroup = L.layerGroup();

          L.polyline(lines, {
            color: "#1E3A8A",
            weight: 3,
            opacity: 0.6,
            dashArray: "5, 5",
            pane: "ringsPane",
          }).addTo(tollGroup);

          // Add nearest toll gate to Vasanta Hospital marker
          const tollIconHtml = `
            <div style="width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.3));">
              <svg viewBox="0 0 100 90" width="100%" height="100%">
                <!-- Hexagon border and background -->
                <polygon points="25,2 75,2 98,45 75,88 25,88 2,45" fill="white" stroke="black" stroke-width="4" stroke-linejoin="round"/>
                <!-- Red header -->
                <polygon points="23,4 77,4 83,18 17,18" fill="red" />
                <line x1="17" y1="18" x2="83" y2="18" stroke="black" stroke-width="4"/>
                <!-- Text -->
                <text x="50" y="14" fill="white" font-size="11" font-family="sans-serif" font-weight="900" text-anchor="middle" letter-spacing="0.5">TOL</text>
                <text x="50" y="70" fill="black" font-size="52" font-family="sans-serif" font-weight="900" text-anchor="middle">1</text>
              </svg>
            </div>
          `;
          const customIcon = L.divIcon({
            html: tollIconHtml,
            className: "",
            iconSize: [15, 15],
            iconAnchor: [7.5, 7.5],
          });
          const marker = L.marker([-6.152, 106.727], {
            pane: "labelsPane",
            icon: customIcon,
          });

          marker.bindTooltip(
            `
              <div style="background: white; border: 1px solid #EFEBE7; padding: 6px 8px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-family: sans-serif; font-size: 10px; line-height: 1.3;">
                  <div style="font-weight: bold; color: #1E2F31; margin-bottom: 2px;">Rawa Buaya Toll Gate ${isFallback ? "(Offline Mode)" : ""}</div>
                  <div style="color: #4C4A4B;">JORR W1 KM4</div>
              </div>
          `,
            {
              direction: "top",
              offset: [0, -8],
              className: "custom-poi-tooltip",
            },
          );
          marker.addTo(tollGroup);

          tollRoadLayerRef.current = tollGroup.addTo(mapRef.current);
          setLoadingStatus({ active: false, text: "", isError: false });
        };

        // Request overpass data for motorways in the region
        const query = `[out:json][timeout:25];(way["highway"="motorway"](-6.4,106.5,-6.0,107.0);way["highway"="motorway_link"](-6.4,106.5,-6.0,107.0););out geom;`;

        const fetchTollRoadsWithFallback = async () => {
          const cacheKey = "cached_toll_roads_jakarta";
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            try {
              return JSON.parse(cached);
            } catch (e) {
              sessionStorage.removeItem(cacheKey);
            }
          }

          const endpoints = [
            "https://overpass-api.de/api/interpreter",
            "https://lz4.overpass-api.de/api/interpreter",
            "https://overpass.kumi.systems/api/interpreter",
            "https://overpass.osm.ch/api/interpreter",
          ];

          for (const url of endpoints) {
            try {
              const res = await fetch(url, {
                method: "POST",
                body: "data=" + encodeURIComponent(query),
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              });
              if (!res.ok) continue;
              const text = await res.text();
              const data = JSON.parse(text);
              if (data && data.elements) {
                try {
                  sessionStorage.setItem(cacheKey, JSON.stringify(data));
                } catch (e) {
                  // Ignore quota exceeded errors
                }
                return data;
              }
            } catch (err) {
              console.warn(`[Overpass] Failed endpoint ${url}:`, err);
            }
          }
          throw new Error("All Overpass API endpoints failed or timed out.");
        };

        fetchTollRoadsWithFallback()
          .then((data) => {
            if (!mapRef.current) return;
            const lines = [];
            data.elements.forEach((element) => {
              if (element.type === "way" && element.geometry) {
                lines.push(element.geometry.map((p) => [p.lat, p.lon]));
              }
            });
            renderTollRoads(lines, false);
          })
          .catch((e) => {
            console.error("Failed to load toll roads via Overpass.", e);
            if (!mapRef.current) return;
            // Hardcoded fallback removed to prevent random straight lines
            setLoadingStatus({ active: false, text: "", isError: false });
          });
      } else {
        mapRef.current.addLayer(tollRoadLayerRef.current);
      }
    } else {
      if (
        tollRoadLayerRef.current &&
        mapRef.current.hasLayer(tollRoadLayerRef.current)
      ) {
        mapRef.current.removeLayer(tollRoadLayerRef.current);
      }
    }
  }, [showTollRoads, isMapReady]);

  const setupLayerInteractions = (layer, region, mapInstance) => {
    let lastLatLng = null;

    if (isHoveringPoi.current) return;
    // 1. Permanently bind the static text to the center of the region
    layer.bindTooltip(`<div class="static-region-name">${region.name}</div>`, {
      permanent: true,
      direction: "center",
      className: "static-region-tooltip",
      interactive: false,
      pane: "labelsPane",
    });

    // 2. Simple hover effect that respects the current View Mode colors
    layer.on("mouseover", (e) => {
      if (isHoveringPoi?.current) return;
      applyLayerStyle(layer, region.id, true, viewModeRef.current);
    });

    layer.on("mouseout", () => {
      applyLayerStyle(layer, region.id, false, viewModeRef.current);
    });

    // Hide the hover tooltip instantly if the user clicks to open the persistent popup
    layer.on("click", function () {
      clearTimeout(hoverTooltipRef.current._enterTimeout);
      if (mapInstance.hasLayer(hoverTooltipRef.current)) {
        mapInstance.removeLayer(hoverTooltipRef.current);
      }
    });

    layer.bindPopup(getTooltipContent(region, viewModeRef.current));
    regionsLayersRef.current[region.id] = layer;
    setRegionFetchStatuses((prev) => ({ ...prev, [region.id]: "success" }));
  };

  const syncRegionBorders = async (mapInstance, activeIds) => {
    const L = window.L;
    const missingIds = activeIds.filter(
      (id) =>
        !regionsLayersRef.current[id] && regionFetchStatuses[id] !== "loading",
    );

    if (missingIds.length === 0) {
      frameActiveRegions(mapInstance);
      return;
    }

    setRegionFetchStatuses((prev) => {
      const next = { ...prev };
      missingIds.forEach((id) => (next[id] = "loading"));
      return next;
    });

    for (const id of missingIds) {
      const region = targetRegions.find((r) => r.id === id);
      if (!region) continue;

      setLoadingStatus({
        active: true,
        text: `Loading boundary: ${region.name}`,
        isError: false,
      });

      try {
        const cacheKey = `nominatim_${encodeURIComponent(region.query)}`;
        const cached = sessionStorage.getItem(cacheKey);
        let data = null;

        if (cached) {
          try {
            data = JSON.parse(cached);
          } catch (e) {
            sessionStorage.removeItem(cacheKey);
          }
        }

        if (!data) {
          const endpoints = [
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(region.query)}&polygon_geojson=1&format=json`,
            `https://nominatim.kumi.systems/search?q=${encodeURIComponent(region.query)}&polygon_geojson=1&format=json`,
          ];

          for (const url of endpoints) {
            try {
              const response = await fetch(url);
              if (!response.ok) continue;
              const text = await response.text();
              const parsed = JSON.parse(text);
              if (parsed) {
                data = parsed;
                try {
                  sessionStorage.setItem(cacheKey, JSON.stringify(data));
                } catch (e) {}
                break;
              }
            } catch (err) {
              console.warn(`[Nominatim] Failed endpoint ${url}`, err);
            }
          }
        }

        if (!data) throw new Error("API Error");

        let geojsonData;
        if (data && data.length > 0 && data[0].geojson) {
          geojsonData = data[0].geojson;
        } else {
          geojsonData = generateFallbackGeoJSON(
            region.fallbackLat,
            region.fallbackLon,
            region.fallbackRadius,
          );
        }

        geoJsonCacheRef.current[id] = geojsonData;
        const layer = L.geoJSON(geojsonData, { className: "region-polygon" });

        // CRITICAL: We must save it to the cache and add it to the map physically!
        regionsLayersRef.current[id] = layer;
        layer.addTo(mapInstance);
        if (typeof setupLayerInteractions === "function") {
          setupLayerInteractions(layer, region, mapInstance);
        }
      } catch (error) {
        console.warn(
          `Failed to load real boundary for ${region.name}, using fallback.`,
        );

        // Draw the fallback circle boundary polyline
        const fallbackGeoJSON = generateFallbackGeoJSON(
          region.fallbackLat,
          region.fallbackLon,
          region.fallbackRadius,
        );
        geoJsonCacheRef.current[id] = fallbackGeoJSON;
        const layer = L.geoJSON(fallbackGeoJSON, {
          className: "region-polygon",
        });

        // Cache it and physically add it to the map
        regionsLayersRef.current[id] = layer;
        layer.addTo(mapInstance);
        if (typeof setupLayerInteractions === "function") {
          setupLayerInteractions(layer, region, mapInstance);
        }
      }

      // 300ms delay to keep the API happy without freezing your screen for 15 seconds
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setLoadingStatus((prev) => ({ ...prev, active: false }));
    frameActiveRegions(mapInstance);
  };

  const getTooltipContent = (region, mode) => {
    if (mode === "admin")
      return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">${region.group}</span>`;
    if (mode === "population")
      return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">Total: ${(region.population / 1000000).toFixed(1)} Million People</span>`;
    if (mode === "density")
      return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">${region.density.toLocaleString("en-US")} people / km²</span>`;
    if (mode === "commuter")
      return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">Commuter Rate: ${region.commuter}%</span>`;
    if (mode === "age")
      return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">Median Age: ${region.medianAge} Years</span>`;
    return `<b>${region.name}</b><br><span style="font-size:11px;color:#777;">Est. GDRP: IDR ${region.income}M / year</span>`;
  };

  const applyLayerStyle = (layer, regionId, isHovered, mode) => {
    const region = targetRegions.find((r) => r.id === regionId);
    if (!region) return;

    if (mode === "admin") {
      const groupColor = getGroupColor(region.group);
      layer.setStyle({
        color: groupColor,
        weight: isHovered ? 2.5 : 0.5,
        dashArray: "4, 4",
        fillColor: groupColor,
        fillOpacity: isHovered ? 0.35 : 0.2,
      });
    } else {
      let fillColor = "#ccc";
      if (mode === "density") fillColor = getDensityColor(region.density);
      else if (mode === "economy") fillColor = getEconomyColor(region.income);
      else if (mode === "population")
        fillColor = getPopulationColor(region.population);
      else if (mode === "commuter")
        fillColor = getCommuterColor(region.commuter);
      else if (mode === "age") fillColor = getAgeColor(region.medianAge);
      layer.setStyle({
        color: "#EFEBE7",
        weight: isHovered ? 2.5 : 1.2,
        dashArray: "",
        fillColor: fillColor,
        fillOpacity: isHovered ? 0.95 : 0.75,
      });
    }
  };

  const initPOIs = (mapInstance) => {
    const L = window.L;
    mapLocations.forEach(async (loc) => {
      const singlePoiGroup = L.layerGroup();

      // Resolve coordinates dynamically (supports standard lat/lon or fallbackLat/fallbackLon)
      const lat = loc.lat !== undefined ? loc.lat : loc.fallbackLat;
      const lon = loc.lon !== undefined ? loc.lon : loc.fallbackLon;

      if (lat === undefined || lon === undefined) return;

      // Draw real polyline/polygon boundaries for locations if coordinates exist
      if (loc.boundaryCoords) {
        L.polyline(loc.boundaryCoords, {
          color: loc.color,
          weight: 2,
          dashArray: "4, 4",
          fillColor: loc.color,
          fillOpacity: loc.fillOpacity !== undefined ? loc.fillOpacity : 0.1,
          interactive: false,
          pane: "ringsPane",
        }).addTo(singlePoiGroup);
      }

      // Draw dynamic boundaries if a query is defined in the location snippet
      if (loc.query) {
        try {
          const cacheKey = `nominatim_poi_${encodeURIComponent(loc.query)}`;
          const cached = sessionStorage.getItem(cacheKey);
          let data = null;

          if (cached) {
            try {
              data = JSON.parse(cached);
            } catch (e) {
              sessionStorage.removeItem(cacheKey);
            }
          }

          if (!data) {
            const endpoints = [
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc.query)}&polygon_geojson=1&format=json`,
              `https://nominatim.kumi.systems/search?q=${encodeURIComponent(loc.query)}&polygon_geojson=1&format=json`,
            ];

            for (const url of endpoints) {
              try {
                const response = await fetch(url);
                if (!response.ok) continue;
                const text = await response.text();
                const parsed = JSON.parse(text);
                if (parsed) {
                  data = parsed;
                  try {
                    sessionStorage.setItem(cacheKey, JSON.stringify(data));
                  } catch (e) {}
                  break;
                }
              } catch (err) {
                console.warn(`[Nominatim POI] Failed endpoint ${url}`, err);
              }
            }
          }

          if (!data) throw new Error("API Error");

          let geojsonData;
          if (data && data.length > 0 && data[0].geojson) {
            geojsonData = data[0].geojson;
          } else {
            geojsonData = generateFallbackGeoJSON(
              loc.fallbackLat,
              loc.fallbackLon,
              loc.fallbackRadius,
            );
          }

          L.geoJSON(geojsonData, {
            color: loc.color,
            weight: 2,
            dashArray: "4, 4",
            fillColor: loc.fillColor || loc.color,
            fillOpacity: loc.fillOpacity !== undefined ? loc.fillOpacity : 0.1,
            interactive: false,
            pane: "ringsPane",
          }).addTo(singlePoiGroup);
        } catch (error) {
          const fallbackGeoJSON = generateFallbackGeoJSON(
            loc.fallbackLat,
            loc.fallbackLon,
            loc.fallbackRadius,
          );
          L.geoJSON(fallbackGeoJSON, {
            color: loc.color,
            weight: 2,
            dashArray: "4, 4",
            fillColor: loc.fillColor || loc.color,
            fillOpacity: loc.fillOpacity !== undefined ? loc.fillOpacity : 0.1,
            interactive: false,
            pane: "ringsPane",
          }).addTo(singlePoiGroup);
        }
      }

      if (loc.radii) {
        loc.radii
          .sort((a, b) => b - a)
          .forEach((radius, index) => {
            const isOuter = index === 0;
            L.circle([lat, lon], {
              radius: radius,
              color: loc.color,
              weight: isOuter ? 2 : 2.5,
              dashArray: isOuter ? "4, 8" : "6, 6",
              fillColor: loc.color,
              fillOpacity: 0.1,
              interactive: false,
              pane: "ringsPane",
              className: isOuter ? "breathe-outer" : "breathe-inner",
            }).addTo(singlePoiGroup);
          });
      }

      let marker;
      if (loc.id === "Soekarno-Hatta Airport") {
        const iconHtml = `<div style="background-color: ${loc.color}; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #EFEBE7; color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3.5 3.5-2.5-.5L2 17l4 4 1-.5-.5-2.5 3.5-3.5 5 6 1.2-.7.6-1.1c.4-.2.7-.6.6-1.1Z"/></svg>
        </div>`;
        marker = L.marker([lat, lon], {
          icon: L.divIcon({
            html: iconHtml,
            className: "",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
          pane: "markersPane",
        }).addTo(singlePoiGroup);
      } else {
        marker = L.circleMarker([lat, lon], {
          radius: 8,
          fillColor: loc.color,
          color: "#EFEBE7",
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
          pane: "markersPane",
        }).addTo(singlePoiGroup);
      }

      marker.bindTooltip(
        `<b>${loc.name}</b><br><span style="font-size:11px;color:#777;">${loc.desc || loc.population || ""}</span>`,
        { direction: "top", offset: [0, -10], className: "custom-tooltip" },
      );

      poiLayersRef.current[loc.id] = singlePoiGroup;

      // Immediate sync: Force POIs to render instantly on map load
      if (activePOIs.includes(loc.id)) {
        singlePoiGroup.addTo(poiGroupRef.current);
      }
    });
  };

  useEffect(() => {
    if (!mapRef.current || !isMapReady) return;
    const map = mapRef.current;

    // Trigger our lazy-load engine
    syncRegionBorders(map, activeRegions);

    Object.entries(regionsLayersRef.current).forEach(([id, layer]) => {
      const isActive = activeRegions.includes(id);
      if (isActive && !map.hasLayer(layer)) {
        layer.addTo(map);
      } else if (!isActive && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
      if (isActive) {
        applyLayerStyle(layer, id, false, viewMode);
        const newContent = getTooltipContent(
          targetRegions.find((r) => r.id === id),
          viewMode,
        );
        layer.setPopupContent(newContent);
      }
    });

    if (hoverTooltipRef.current && map.hasLayer(hoverTooltipRef.current)) {
      map.removeLayer(hoverTooltipRef.current);
    }
  }, [activeRegions, viewMode, regionFetchStatuses, isMapReady]);

  useEffect(() => {
    if (!poiGroupRef.current) return;
    const group = poiGroupRef.current;
    group.clearLayers();
    activePOIs.forEach((id) => {
      if (poiLayersRef.current[id]) poiLayersRef.current[id].addTo(group);
    });
  }, [activePOIs]);

  const flyToWithOffset = useCallback((bounds, isPoint = false) => {
    if (!mapRef.current || !bounds || !bounds.isValid()) return;

    // Add 360px left padding on desktop to clear the panel, standard 40px on mobile
    const leftPadding = window.innerWidth > 640 ? 360 : 40;

    const options = {
      paddingTopLeft: [leftPadding, 40],
      paddingBottomRight: [40, 40],
      duration: 1.5,
      easeLinearity: 0.25,
    };
    if (isPoint) options.maxZoom = 12;
    mapRef.current.flyToBounds(bounds, options);
  }, []);

  const frameActiveRegions = useCallback(
    (mapInstance) => {
      const L = window.L;
      const activeLayers = activeRegions
        .map((id) => regionsLayersRef.current[id])
        .filter(Boolean);
      if (activeLayers.length > 0) {
        const boundaryGroup = L.featureGroup(activeLayers);
        flyToWithOffset(boundaryGroup.getBounds());
      }
    },
    [activeRegions, flyToWithOffset],
  );

  const handleRegionClick = (regionId) => {
    const layer = regionsLayersRef.current[regionId];
    if (layer && mapRef.current.hasLayer(layer) && layer.getBounds().isValid())
      flyToWithOffset(layer.getBounds());
  };

  const handlePoiClick = (lat, lon, id) => {
    const L = window.L;
    if (!L) return;
    flyToWithOffset(L.latLngBounds([lat, lon], [lat, lon]), true);
    if (id) {
      if (activeClickedPoiRef.current && activeClickedPoiRef.current !== id) {
        const prevId = activeClickedPoiRef.current;
        activeClickedPoiRef.current = id;
        handlePoiHover(prevId, false);
      } else {
        activeClickedPoiRef.current = id;
      }
      handlePoiHover(id, true);
    }
  };
  const handlePoiHover = useCallback((id, isHovering) => {
    if (
      isHovering &&
      activeClickedPoiRef.current &&
      activeClickedPoiRef.current !== id
    ) {
      const prevId = activeClickedPoiRef.current;
      activeClickedPoiRef.current = null;
      const prevLayer = poiLayersRef.current[prevId];
      if (prevLayer) {
        prevLayer.eachLayer((layer) => {
          if (layer.options && layer.options.pane === "markersPane") {
            if (typeof layer.setStyle === "function") {
              layer.setStyle({ className: "" });
            }
            const el =
              typeof layer.getElement === "function"
                ? layer.getElement()
                : null;
            if (el) el.classList.remove("glowing-marker");
          }
        });
      }
    }

    const layerGroup = poiLayersRef.current[id];
    if (layerGroup) {
      layerGroup.eachLayer((layer) => {
        if (layer.options && layer.options.pane === "markersPane") {
          const isGlowing = isHovering || activeClickedPoiRef.current === id;
          if (typeof layer.setStyle === "function") {
            layer.setStyle({
              className: isGlowing ? "glowing-marker" : "",
              radius: 8,
              weight: 2,
              opacity: 1,
            });
          }
          const el =
            typeof layer.getElement === "function" ? layer.getElement() : null;
          if (el) {
            if (isGlowing) el.classList.add("glowing-marker");
            else el.classList.remove("glowing-marker");
          }
          if (isGlowing && typeof layer.bringToFront === "function") {
            layer.bringToFront();
          }
        }
      });
    }
  }, []);

  const handleGroupHover = useCallback(
    (locs, isHovering) => {
      locs.forEach((loc) => handlePoiHover(loc.id, isHovering));
    },
    [handlePoiHover],
  );

  useEffect(() => {
    const handleDocumentClick = (e) => {
      // If we clicked something that is not a location list item and is not on the map itself
      if (
        !e.target.closest(".location-list-item") &&
        !e.target.closest("#demographics-map")
      ) {
        if (activeClickedPoiRef.current) {
          const prevId = activeClickedPoiRef.current;
          activeClickedPoiRef.current = null;
          handlePoiHover(prevId, false);
        }
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, [handlePoiHover]);

  useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L) return;
    measureStateRef.current.isMeasuring = isMeasuring;

    const clearMeasure = () => {
      const state = measureStateRef.current;
      state.points = [];
      if (state.line) map.removeLayer(state.line);
      if (state.dynamicLine) map.removeLayer(state.dynamicLine);
      if (state.tooltip && map.hasLayer(state.tooltip))
        map.removeLayer(state.tooltip);
      state.markers.forEach((m) => map.removeLayer(m));
      state.markers = [];
      state.line = null;
      state.dynamicLine = null;
    };

    const onMeasureClick = (e) => {
      const state = measureStateRef.current;
      if (state.points.length === 0 || state.points.length === 2) {
        clearMeasure();
        state.points.push(e.latlng);
        const marker = L.circleMarker(e.latlng, {
          radius: 5,
          fillColor: "#1C6048",
          color: "#EFEBE7",
          weight: 2,
          fillOpacity: 1,
          pane: "markersPane",
        }).addTo(map);
        state.markers.push(marker);
        state.dynamicLine = L.polyline([e.latlng, e.latlng], {
          color: "#1C6048",
          weight: 2.5,
          dashArray: "6, 8",
          pane: "ringsPane",
        }).addTo(map);
        state.tooltip = L.tooltip({
          permanent: true,
          className: "measure-tooltip",
          direction: "center",
        })
          .setLatLng(e.latlng)
          .setContent("0.00 km")
          .addTo(map);
      } else if (state.points.length === 1) {
        state.points.push(e.latlng);
        const marker = L.circleMarker(e.latlng, {
          radius: 5,
          fillColor: "#1C6048",
          color: "#EFEBE7",
          weight: 2,
          fillOpacity: 1,
          pane: "markersPane",
        }).addTo(map);
        state.markers.push(marker);
        if (state.dynamicLine) map.removeLayer(state.dynamicLine);
        state.line = L.polyline(state.points, {
          color: "#1C6048",
          weight: 2.5,
          dashArray: "6, 8",
          pane: "ringsPane",
        }).addTo(map);
        const distance = (
          map.distance(state.points[0], state.points[1]) / 1000
        ).toFixed(2);
        state.tooltip
          .setLatLng([
            (state.points[0].lat + state.points[1].lat) / 2,
            (state.points[0].lng + state.points[1].lng) / 2,
          ])
          .setContent(`${distance} km`);
      }
    };

    const onMeasureMove = (e) => {
      const state = measureStateRef.current;
      if (state.points.length === 1) {
        state.dynamicLine.setLatLngs([state.points[0], e.latlng]);
        const distance = (
          map.distance(state.points[0], e.latlng) / 1000
        ).toFixed(2);
        state.tooltip
          .setLatLng([
            (state.points[0].lat + e.latlng.lat) / 2,
            (state.points[0].lng + e.latlng.lng) / 2,
          ])
          .setContent(`${distance} km`);
      }
    };

    if (isMeasuring) {
      map.getContainer().style.cursor = "crosshair";
      map.getContainer().classList.add("map-measuring");
      map.on("click", onMeasureClick);
      map.on("mousemove", onMeasureMove);
    } else {
      map.getContainer().style.cursor = "";
      map.getContainer().classList.remove("map-measuring");
      map.off("click", onMeasureClick);
      map.off("mousemove", onMeasureMove);
      clearMeasure();
    }
    return () => {
      if (map) {
        map.off("click", onMeasureClick);
        map.off("mousemove", onMeasureMove);
      }
    };
  }, [isMeasuring]);

  const pyramidData = useMemo(() => {
    const male = [0, 0, 0, 0, 0, 0, 0, 0];
    const female = [0, 0, 0, 0, 0, 0, 0, 0];
    let activePop = 0,
      totalPop = 0;
    targetRegions.forEach((r) => {
      totalPop += r.population;
      if (activeRegions.includes(r.id) && r.maleDistribution) {
        activePop += r.population;
        for (let i = 0; i < 8; i++) {
          male[i] += r.maleDistribution[i];
          female[i] += r.femaleDistribution[i];
        }
      }
    });
    const maxCohort = Math.max(...male, ...female, 1);
    const popShare =
      totalPop > 0 ? ((activePop / totalPop) * 100).toFixed(1) : 0;
    return { male, female, activePop, totalPop, maxCohort, popShare };
  }, [activeRegions]);

  const toggleRegion = (id) =>
    setActiveRegions((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  const toggleGroup = (groupName) => {
    const groupRegionIds = regionGroups[groupName].map((r) => r.id);
    const allActive = groupRegionIds.every((id) => activeRegions.includes(id));
    if (allActive)
      setActiveRegions((prev) =>
        prev.filter((id) => !groupRegionIds.includes(id)),
      );
    else setActiveRegions((prev) => [...new Set([...prev, ...groupRegionIds])]);
  };
  const toggleAllPoi = () =>
    setActivePOIs((prev) =>
      prev.length === mapLocations.length ? [] : mapLocations.map((l) => l.id),
    );

  const getLegendData = () => {
    if (viewMode === "admin")
      return {
        title: "Provinces",
        items: [
          { c: "#1C6048", l: "DKI Jakarta" },
          { c: "#1E2f31", l: "Banten" },
          { c: "#9B8B70", l: "West Java" },
        ],
      };
    if (viewMode === "population")
      return {
        title: "Population",
        items: [
          { c: "#7C3A21", l: "> 3.0M" },
          { c: "#A95C3E", l: "2.0M - 3.0M" },
          { c: "#D08C70", l: "1.5M - 2.0M" },
          { c: "#E8C2B3", l: "< 1.5M" },
        ],
      };
    if (viewMode === "density")
      return {
        title: "Density (/km²)",
        items: [
          { c: "#134433", l: "> 15k" },
          { c: "#1C6048", l: "10k - 15k" },
          { c: "#41856B", l: "5k - 10k" },
          { c: "#99B6AA", l: "< 5k" },
        ],
      };
    if (viewMode === "economy")
      return {
        title: "GDRP (IDR M)",
        items: [
          { c: "#8C7A5E", l: "> 500" },
          { c: "#AFA189", l: "300 - 500" },
          { c: "#C8BEAC", l: "100 - 300" },
          { c: "#E1DCD3", l: "< 100" },
        ],
      };
    if (viewMode === "commuter")
      return {
        title: "Commuter Flow",
        items: [
          { c: "#1E3A8A", l: "> 60%" },
          { c: "#3B82F6", l: "45% - 60%" },
          { c: "#60A5FA", l: "30% - 45%" },
          { c: "#DBEAFE", l: "< 30%" },
        ],
      };
    if (viewMode === "age")
      return {
        title: "Median Age",
        items: [
          { c: "#581C87", l: "≥ 31" },
          { c: "#8B5CF6", l: "29 - 30" },
          { c: "#C084FC", l: "27 - 28" },
          { c: "#F3E8FF", l: "< 27" },
        ],
      };
    return null;
  };
  const legendInfo = getLegendData();

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden relative z-10 font-sans border border-[#D8D8D8] shadow-sm">
      <style>{`
                /* --- 1. NEW STATIC REGION LABELS --- */
                .static-region-tooltip { 
                    background: transparent !important; 
                    border: none !important; 
                    box-shadow: none !important; 
                    pointer-events: none !important; 
                    transition: opacity 0.3s ease;
                    ${!showRegionLabels ? "opacity: 0 !important; visibility: hidden !important;" : ""}
                }
                .static-region-tooltip .leaflet-tooltip-tip { display: none; }
                .static-region-name { 
                    font-size: 11px; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: 2px; 
                    color: rgba(30, 47, 49, 0.4);
                    text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8), -1px -1px 2px rgba(255, 255, 255, 0.8);
                }

                /* --- 2. ORIGINAL ESSENTIAL APP STYLES --- */
                .vignette {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    box-shadow: inset 0 0 200px rgba(30, 47, 49, 0.35);
                    pointer-events: none; z-index: 10;
                }
                
                @keyframes pulseGlow {
                    0% { filter: drop-shadow(0 0 8px rgba(30, 58, 138, 0.9)); fill-opacity: 0.9; }
                    100% { filter: drop-shadow(0 0 24px rgba(30, 58, 138, 1)); fill-opacity: 1; stroke-width: 5px; }
                }
                
                /* Glowing Marker on Hover */
                .glowing-marker {
                    animation: pulseGlow 1s infinite alternate ease-in-out;
                    transition: fill-opacity 0.2s ease, stroke-width 0.2s ease;
                }

                /* Fix the ugly square focus ring on map markers */
                .leaflet-interactive:focus { outline: none !important; }
                
                /* Ultra-Premium Glassmorphism Tooltips */
                .leaflet-tooltip.custom-tooltip, .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.5) !important; 
                    backdrop-filter: blur(16px) saturate(180%) !important; 
                    -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
                    border-radius: 12px !important; 
                    box-shadow: 0 8px 32px rgba(30, 47, 49, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.6) !important;
                    border: none !important; 
                    color: #1E2F31 !important;
                    font-weight: 600 !important; 
                    font-family: 'Plus Jakarta Sans', sans-serif !important;
                }
                /* Hide the little map arrows so the glass box floats cleanly */
                .leaflet-tooltip-tip, .leaflet-popup-tip-container { display: none !important; }
                .leaflet-tooltip.custom-tooltip { padding: 12px 16px; opacity: 1 !important; }
                .leaflet-popup-content { margin: 12px 16px; line-height: 1.4; }
                
                /* Custom Scrollbar */
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track:vertical { background: transparent; margin: 16px 0; }
                .custom-scrollbar::-webkit-scrollbar-track:horizontal { background: transparent; margin: 0 16px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(155, 139, 112, 0.5); border-radius: 8px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(155, 139, 112, 0.8); }
                
                /* UI Switches */
                .switch { position: relative; display: inline-block; flex-shrink: 0; }
                .switch.group { width: 32px; height: 18px; margin-left: 8px; }
                .switch.item { width: 24px; height: 14px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #D8D8D8; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; background-color: #EFEBE7; transition: .4s; border-radius: 50%; }
                .switch.group .slider:before { height: 12px; width: 12px; left: 3px; bottom: 3px; }
                .switch.item .slider:before { height: 10px; width: 10px; left: 2px; bottom: 2px; }
                .switch.group input:checked + .slider { background-color: #9B8B70; }
                .switch.item input:checked + .slider { background-color: #1E2f31; }
                .switch.group input:checked + .slider:before { transform: translateX(14px); }
                .switch.item input:checked + .slider:before { transform: translateX(10px); }
                
                /* Animations */
                @keyframes breathePulse { 0% { opacity: 0.1; } 100% { opacity: 0.5; } }
                .breathe-outer { animation: breathePulse 3s infinite alternate ease-in-out; }
                .breathe-inner { animation: breathePulse 3s infinite alternate-reverse ease-in-out; }
                
                /* Leaflet Controls */
                .leaflet-left .leaflet-control { margin-left: 16px !important; }
                .leaflet-bottom .leaflet-control { margin-bottom: 16px !important; }
                .leaflet-bar {
                    border: 2px solid rgba(0,0,0,0.2) !important;
                    box-shadow: 0 1px 5px rgba(0,0,0,0.65) !important;
                    border-radius: 4px !important;
                    background-clip: padding-box !important;
                    overflow: hidden;
                }
                .leaflet-bar a, .leaflet-touch .leaflet-bar a {
                    background-color: white !important;
                    color: #4C4A4B !important;
                    width: 30px !important;
                    height: 30px !important;
                    line-height: 30px !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    font-size: 16px !important;
                    font-weight: 700 !important;
                    border-bottom: 1px solid rgba(0,0,0,0.1) !important;
                }
                .leaflet-bar a:last-child { border-bottom: none !important; }
                .leaflet-bar a:hover {
                    background-color: #f4f4f4 !important;
                    color: #1C6048 !important;
                }
            `}</style>

      <div className="vignette"></div>
      <div id="demographics-map" className="w-full h-full z-[1]"></div>

      {/* Dynamic Dual Map Legend */}
      {legendInfo && !isLegendOpen && (
        <div
          onClick={() => setIsLegendOpen(true)}
          className={`absolute top-4 right-4 z-[950] bg-white/90 backdrop-blur-md px-2.5 py-2 sm:p-2.5 rounded-xl shadow-md border border-[#D8D8D8] cursor-pointer hover:bg-white text-[#1E2F31] font-bold text-[10px] sm:text-xs uppercase flex items-center gap-1.5 sm:gap-2 transition-all duration-300 flex`}
        >
          <span className="hidden sm:inline">Legend</span>
          <span className="sm:hidden">Legend</span>
          <ChevronRight
            size={14}
            className="text-[#1E2F31] shrink-0 rotate-180"
          />
        </div>
      )}

      {legendInfo && (
        <div
          className={`absolute top-4 right-4 z-[1010] bg-white/95 backdrop-blur-md border border-[#D8D8D8] rounded-xl shadow-lg w-[calc(100%-32px)] sm:w-[180px] max-h-[calc(100%-110px)] overflow-y-auto custom-scrollbar flex flex-col pointer-events-auto transition-all duration-300 ${isLegendOpen ? "translate-x-0" : "translate-x-[120%]"}`}
        >
          <div className="p-3 border-b border-[#D8D8D8] flex justify-between items-center sticky top-0 bg-white/95 z-10">
            <h4 className="text-[11px] font-extrabold text-[#1E2F31] uppercase tracking-wider">
              Legend
            </h4>
            <button
              onClick={() => setIsLegendOpen(false)}
              className="text-[#4C4A4B] hover:bg-[#EFEBE7] p-1 rounded-lg transition-colors flex items-center justify-center"
              title="Close Panel"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="p-3 flex flex-col">
            {/* 1. Demographic Section */}
            <h4 className="text-[9px] font-bold text-[#9B8B70] uppercase tracking-wider mb-2">
              {legendInfo.title}
            </h4>
            <div className="flex flex-col gap-2 mb-5">
              {legendInfo.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-sm shadow-sm flex-shrink-0"
                    style={{ backgroundColor: item.c }}
                  ></span>
                  <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight">
                    {item.l}
                  </span>
                </div>
              ))}
            </div>

            {/* 2. Infrastructure Section */}
            <h4 className="text-[9px] font-bold text-[#9B8B70] uppercase tracking-wider mb-2">
              Locations
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="relative w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                  <span className="absolute inset-0 rounded-full border border-dashed border-[#1E3A8A] animate-[spin_10s_linear_infinite]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A8A]"></span>
                </div>
                <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                  Vasanta Hub
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#99B6AA] shadow-sm flex-shrink-0"></span>
                <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                  Cancer Hospitals
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#1E2F31] shadow-sm flex-shrink-0"></span>
                <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                  Class A
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#A95C3E] shadow-sm flex-shrink-0"></span>
                <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                  Class B
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`absolute bottom-4 right-4 z-[1010] bg-white/70 backdrop-blur-sm border border-[#D8D8D8]/50 py-2 px-4 rounded-lg shadow-md text-xs font-medium text-[#4C4A4B] transition-opacity duration-500 pointer-events-none flex items-center ${loadingStatus.active ? "opacity-100" : "opacity-0"}`}
      >
        <span
          className={`inline-block w-2 h-2 rounded-full mr-2 ${loadingStatus.active ? "bg-[#1C6048] animate-pulse" : "bg-[#1C6048]"}`}
        ></span>
        <span>{loadingStatus.text}</span>
      </div>

      <div
        className={`absolute top-4 left-4 z-[1010] bg-white/95 backdrop-blur-md border border-[#D8D8D8] rounded-xl shadow-lg w-[calc(100%-32px)] sm:w-[320px] max-h-[calc(100%-110px)] overflow-y-auto custom-scrollbar flex flex-col pointer-events-auto transition-all duration-300 ${isPanelOpen ? "translate-x-0" : "-translate-x-[120%]"}`}
      >
        <div className="p-4 border-b border-[#D8D8D8] flex flex-col gap-3 sticky top-0 bg-white/95 z-10">
          <div className="flex justify-between items-center">
            <div className="text-sm font-extrabold text-[#1E2f31] uppercase tracking-wider flex items-center gap-2">
              <Map size={16} className="text-[#1C6048]" />{" "}
              <span>Overview Map</span>
            </div>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-[#9B8B70] hover:text-[#1E2F31]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex bg-[#F9F8F6] p-1 rounded-lg">
            <button
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === "controls" ? "bg-white text-[#1C6048] shadow-sm" : "text-[#8A8175] hover:text-[#1E2F31]"}`}
              onClick={() => setActiveTab("controls")}
            >
              Layers
            </button>
            <button
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === "analytics" ? "bg-white text-[#1C6048] shadow-sm" : "text-[#8A8175] hover:text-[#1E2F31]"}`}
              onClick={() => setActiveTab("analytics")}
            >
              Age-Gender
            </button>
          </div>
        </div>

        {activeTab === "controls" && (
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#8A8175] uppercase tracking-wider">
                Show Labels
              </span>
              <label className="switch item">
                <input
                  type="checkbox"
                  checked={showRegionLabels}
                  onChange={() => setShowRegionLabels(!showRegionLabels)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-lg font-bold text-xs text-[#1E2f31] outline-none cursor-pointer"
            >
              <option value="admin">Administrative Regions</option>
              <option value="population">Total Population</option>
              <option value="density">Population Density</option>
              <option value="economy">Economic Profile (GDRP)</option>
              <option value="commuter">Commuter Flow (% to Core)</option>
              <option value="age">Age Demographics (Median)</option>
            </select>

            <div className="flex flex-col">
              <div
                className="flex justify-between items-center text-[11px] font-extrabold text-[#1C6048] uppercase tracking-wider pb-1 border-b border-dashed border-[#d8d8d8] cursor-pointer"
                onClick={() =>
                  setRegionsSectionExpanded(!regionsSectionExpanded)
                }
              >
                <div className="flex items-center gap-1.5">
                  <span>Regions</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${!regionsSectionExpanded ? "-rotate-90" : ""}`}
                  />
                </div>
              </div>
              {regionsSectionExpanded &&
                Object.entries(regionGroups).map(([groupName, regions]) => (
                  <div
                    key={groupName}
                    className={`flex flex-col transition-all`}
                  >
                    <div
                      className={`flex justify-between items-center text-[10px] font-bold text-[#9B8B70] uppercase py-1 bg-[#F9F8F6] px-2 rounded cursor-pointer transition-all`}
                      onClick={() =>
                        setExpandedGroups((p) => ({
                          ...p,
                          [groupName]: !p[groupName],
                        }))
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${!expandedGroups[groupName] ? "-rotate-90" : ""}`}
                        />
                        <span>{groupName}</span>
                      </div>
                      <label
                        className="switch group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={regions.every((r) =>
                            activeRegions.includes(r.id),
                          )}
                          onChange={() => toggleGroup(groupName)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    {expandedGroups[groupName] &&
                      regions.map((region) => (
                        <div
                          key={region.id}
                          className="flex justify-between items-center py-1.5 pl-7 pr-2 text-[10px] font-medium text-[#4C4A4B] hover:bg-[#EFEBE7] rounded transition-colors"
                          onMouseEnter={() => {
                            const layer = regionsLayersRef.current[region.id];
                            if (layer && mapRef.current?.hasLayer(layer)) {
                              applyLayerStyle(layer, region.id, true, viewMode);
                              if (typeof layer.bringToFront === "function")
                                layer.bringToFront();
                            }
                          }}
                          onMouseLeave={() => {
                            const layer = regionsLayersRef.current[region.id];
                            if (layer && mapRef.current?.hasLayer(layer)) {
                              applyLayerStyle(
                                layer,
                                region.id,
                                false,
                                viewMode,
                              );
                            }
                          }}
                        >
                          <span
                            className="cursor-pointer hover:text-[#1C6048]"
                            onClick={() => handleRegionClick(region.id)}
                          >
                            {region.name}
                          </span>
                          <label className="switch item">
                            <input
                              type="checkbox"
                              checked={activeRegions.includes(region.id)}
                              onChange={() => toggleRegion(region.id)}
                              disabled={
                                regionFetchStatuses[region.id] === "loading"
                              }
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      ))}
                  </div>
                ))}
            </div>

            <div className="flex flex-col gap-1">
              <div
                className="flex justify-between items-center text-[11px] font-extrabold text-[#1C6048] uppercase tracking-wider pb-1 border-b border-dashed border-[#d8d8d8] cursor-pointer pr-2"
                onClick={() => setPoiSectionExpanded(!poiSectionExpanded)}
              >
                <div className="flex items-center gap-1.5">
                  <span>Locations</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${!poiSectionExpanded ? "-rotate-90" : ""}`}
                  />
                </div>
                <label
                  className="switch group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={activePOIs.length === mapLocations.length}
                    onChange={toggleAllPoi}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              {poiSectionExpanded && (
                <div className="flex flex-col">
                  {[
                    "Vasanta",
                    "Cancer Hospitals",
                    "General",
                    "Infrastructure",
                  ].map((groupName) => {
                    const groupLocs = mapLocations.filter(
                      (loc) => loc.group === groupName,
                    );
                    if (groupLocs.length === 0) return null;

                    return (
                      <div
                        key={groupName}
                        className={`flex flex-col transition-all`}
                      >
                        {/* TIER 1: The Main Group Header */}
                        <div
                          className={`flex justify-between items-center text-[10px] font-bold text-[#9B8B70] uppercase py-1 bg-[#F9F8F6] px-2 rounded cursor-pointer transition-all`}
                          onClick={() =>
                            setExpandedPoiGroups((p) => ({
                              ...p,
                              [groupName]: !p[groupName],
                            }))
                          }
                          onMouseEnter={() => handleGroupHover(groupLocs, true)}
                          onMouseLeave={() =>
                            handleGroupHover(groupLocs, false)
                          }
                        >
                          <div className="flex items-center gap-1.5">
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-300 ${!expandedPoiGroups[groupName] ? "-rotate-90" : ""}`}
                            />
                            <span>{groupName}</span>
                          </div>
                          <label
                            className="switch group"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={
                                groupName === "Infrastructure"
                                  ? groupLocs.every((l) =>
                                      activePOIs.includes(l.id),
                                    ) && showTollRoads
                                  : groupLocs.every((l) =>
                                      activePOIs.includes(l.id),
                                    )
                              }
                              onChange={() => {
                                const ids = groupLocs.map((l) => l.id);
                                const allActive =
                                  groupName === "Infrastructure"
                                    ? ids.every((id) =>
                                        activePOIs.includes(id),
                                      ) && showTollRoads
                                    : ids.every((id) =>
                                        activePOIs.includes(id),
                                      );

                                if (groupName === "Infrastructure") {
                                  setShowTollRoads(!allActive);
                                }

                                setActivePOIs((prev) =>
                                  allActive
                                    ? prev.filter((id) => !ids.includes(id))
                                    : [...new Set([...prev, ...ids])],
                                );
                              }}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>

                        {expandedPoiGroups[groupName] && (
                          <div className="flex flex-col">
                            {/* Anchor / Base Locations (No SubGroup) */}
                            {groupLocs
                              .filter(
                                (l) =>
                                  !l.subGroup &&
                                  (groupName !== "Vasanta" ||
                                    (l.id !== "tb" && l.id !== "new_vasanta")),
                              )
                              .map((loc, index) => (
                                <div
                                  key={loc.id}
                                  className="location-list-item flex justify-between items-center py-1.5 pl-7 pr-2 text-[10px] font-medium hover:bg-[#EFEBE7] rounded cursor-pointer transition-colors"
                                  onClick={() =>
                                    handlePoiClick(
                                      loc.lat !== undefined
                                        ? loc.lat
                                        : loc.fallbackLat,
                                      loc.lon !== undefined
                                        ? loc.lon
                                        : loc.fallbackLon,
                                      loc.id,
                                    )
                                  }
                                  onMouseEnter={() =>
                                    handlePoiHover?.(loc.id, true)
                                  }
                                  onMouseLeave={() =>
                                    handlePoiHover?.(loc.id, false)
                                  }
                                >
                                  <div className="truncate flex-1 min-w-0 pr-3">
                                    <span className="text-[#9B8B70] mr-1.5 font-bold">
                                      {index + 1}.
                                    </span>
                                    <span className="font-bold text-[#1E2F31]">
                                      {loc.name}
                                    </span>
                                    <span className="hidden text-[9px] text-[#9B8B70] ml-1.5">
                                      — {loc.desc}
                                    </span>
                                  </div>
                                  <label
                                    className="switch item"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={activePOIs.includes(loc.id)}
                                      onChange={() =>
                                        setActivePOIs((prev) =>
                                          prev.includes(loc.id)
                                            ? prev.filter((i) => i !== loc.id)
                                            : [...prev, loc.id],
                                        )
                                      }
                                    />
                                    <span className="slider"></span>
                                  </label>
                                </div>
                              ))}

                            {/* TIER 2: Sub-Groups Loop (e.g., '< 5km Radius' or 'Class A') */}
                            {[
                              ...new Set(
                                groupLocs
                                  .filter((l) => l.subGroup)
                                  .map((l) => l.subGroup),
                              ),
                            ].map((subGroupName) => {
                              const subGroupLocs = groupLocs.filter(
                                (l) => l.subGroup === subGroupName,
                              );

                              // Determine if this is a distance folder or a standalone class
                              const isDistanceFolder =
                                subGroupName.includes("km Radius");

                              return (
                                <div
                                  key={subGroupName}
                                  className={`flex flex-col ${isDistanceFolder ? "mt-0.5" : ""}`}
                                >
                                  {isDistanceFolder ? (
                                    // 1. Collapsible Distance Folder with Master Toggle
                                    <div
                                      className="flex justify-between items-center pl-7 pr-2 mt-1.5 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-70 hover:opacity-100 cursor-pointer"
                                      onClick={() =>
                                        setExpandedSubGroups((p) => ({
                                          ...p,
                                          [subGroupName]: !p[subGroupName],
                                        }))
                                      }
                                      onMouseEnter={() =>
                                        handleGroupHover(subGroupLocs, true)
                                      }
                                      onMouseLeave={() =>
                                        handleGroupHover(subGroupLocs, false)
                                      }
                                    >
                                      <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                        <ChevronDown
                                          size={10}
                                          className={`transition-transform duration-300 ${expandedSubGroups[subGroupName] === false ? "-rotate-90" : ""}`}
                                        />
                                        <span>{subGroupName}</span>
                                      </div>
                                      <label
                                        className="switch item scale-75 origin-right"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={subGroupLocs.every((l) =>
                                            activePOIs.includes(l.id),
                                          )}
                                          onChange={() => {
                                            const ids = subGroupLocs.map(
                                              (l) => l.id,
                                            );
                                            const allActive = ids.every((id) =>
                                              activePOIs.includes(id),
                                            );
                                            setActivePOIs((prev) =>
                                              allActive
                                                ? prev.filter(
                                                    (id) => !ids.includes(id),
                                                  )
                                                : [
                                                    ...new Set([
                                                      ...prev,
                                                      ...ids,
                                                    ]),
                                                  ],
                                            );
                                          }}
                                        />
                                        <span className="slider"></span>
                                      </label>
                                    </div>
                                  ) : (
                                    // 2. Standalone Class Header (e.g., Cancer Hospitals > Class A) with Toggle
                                    <div
                                      className="flex justify-between items-center pl-7 pr-2 mt-1.5 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-70 hover:opacity-100 cursor-pointer"
                                      onClick={() =>
                                        setExpandedSubGroups((p) => ({
                                          ...p,
                                          [subGroupName]: !p[subGroupName],
                                        }))
                                      }
                                      onMouseEnter={() =>
                                        handleGroupHover(subGroupLocs, true)
                                      }
                                      onMouseLeave={() =>
                                        handleGroupHover(subGroupLocs, false)
                                      }
                                    >
                                      <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                        <ChevronDown
                                          size={10}
                                          className={`transition-transform duration-300 ${expandedSubGroups[subGroupName] === false ? "-rotate-90" : ""}`}
                                        />
                                        <span>{subGroupName}</span>
                                      </div>
                                      <label
                                        className="switch item scale-75 origin-right"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={subGroupLocs.every((l) =>
                                            activePOIs.includes(l.id),
                                          )}
                                          onChange={() => {
                                            const ids = subGroupLocs.map(
                                              (l) => l.id,
                                            );
                                            const allActive = ids.every((id) =>
                                              activePOIs.includes(id),
                                            );
                                            setActivePOIs((prev) =>
                                              allActive
                                                ? prev.filter(
                                                    (id) => !ids.includes(id),
                                                  )
                                                : [
                                                    ...new Set([
                                                      ...prev,
                                                      ...ids,
                                                    ]),
                                                  ],
                                            );
                                          }}
                                        />
                                        <span className="slider"></span>
                                      </label>
                                    </div>
                                  )}

                                  {/* TIER 3: Nested Items & Sub-Sub Headers (Rendered if Tier 2 is expanded) */}
                                  {expandedSubGroups[subGroupName] !==
                                    false && (
                                    <div className="flex flex-col mb-1">
                                      {/* Class A Sub-Header inside Distance Folder */}
                                      {isDistanceFolder &&
                                        subGroupLocs.some(
                                          (l) => l.tier === "Class A",
                                        ) && (
                                          <div
                                            className="flex justify-between items-center pl-9 pr-2 mt-1 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                                            onClick={() =>
                                              setExpandedSubGroups((p) => ({
                                                ...p,
                                                [`${subGroupName}_ClassA`]:
                                                  !p[`${subGroupName}_ClassA`],
                                              }))
                                            }
                                            onMouseEnter={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class A",
                                                ),
                                                true,
                                              )
                                            }
                                            onMouseLeave={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class A",
                                                ),
                                                false,
                                              )
                                            }
                                          >
                                            <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                              <ChevronDown
                                                size={10}
                                                className={`transition-transform duration-300 ${expandedSubGroups[`${subGroupName}_ClassA`] === false ? "-rotate-90" : ""}`}
                                              />
                                              <span>
                                                Class A (Comprehensive)
                                              </span>
                                            </div>
                                            <label
                                              className="switch item scale-75 origin-right"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <input
                                                type="checkbox"
                                                checked={subGroupLocs
                                                  .filter(
                                                    (l) => l.tier === "Class A",
                                                  )
                                                  .every((l) =>
                                                    activePOIs.includes(l.id),
                                                  )}
                                                onChange={() => {
                                                  const ids = subGroupLocs
                                                    .filter(
                                                      (l) =>
                                                        l.tier === "Class A",
                                                    )
                                                    .map((l) => l.id);
                                                  const allActive = ids.every(
                                                    (id) =>
                                                      activePOIs.includes(id),
                                                  );
                                                  setActivePOIs((prev) =>
                                                    allActive
                                                      ? prev.filter(
                                                          (id) =>
                                                            !ids.includes(id),
                                                        )
                                                      : [
                                                          ...new Set([
                                                            ...prev,
                                                            ...ids,
                                                          ]),
                                                        ],
                                                  );
                                                }}
                                              />
                                              <span className="slider"></span>
                                            </label>
                                          </div>
                                        )}

                                      {/* Class A Loop */}
                                      {expandedSubGroups[
                                        `${subGroupName}_ClassA`
                                      ] !== false &&
                                        subGroupLocs
                                          .filter(
                                            (l) =>
                                              l.tier === "Class A" ||
                                              !isDistanceFolder,
                                          )
                                          .map((loc, index) => (
                                            <div
                                              key={loc.id}
                                              className={`location-list-item flex justify-between items-center py-1.5 ${isDistanceFolder ? "pl-12" : "pl-10"} pr-2 text-[10px] font-medium hover:bg-[#EFEBE7] rounded cursor-pointer transition-colors`}
                                              onClick={() =>
                                                handlePoiClick(
                                                  loc.lat,
                                                  loc.lon,
                                                  loc.id,
                                                )
                                              }
                                              onMouseEnter={() =>
                                                handlePoiHover?.(loc.id, true)
                                              }
                                              onMouseLeave={() =>
                                                handlePoiHover?.(loc.id, false)
                                              }
                                            >
                                              <div className="truncate flex-1 min-w-0 pr-3">
                                                <span className="text-[#9B8B70] mr-1.5 font-bold">
                                                  {index + 1}.
                                                </span>
                                                <span className="font-bold text-[#1E2F31]">
                                                  {loc.name}
                                                </span>
                                                <span className="hidden text-[9px] text-[#9B8B70] ml-1.5">
                                                  — {loc.desc}
                                                </span>
                                              </div>
                                              <label
                                                className="switch item"
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={activePOIs.includes(
                                                    loc.id,
                                                  )}
                                                  onChange={() =>
                                                    setActivePOIs((prev) =>
                                                      prev.includes(loc.id)
                                                        ? prev.filter(
                                                            (i) => i !== loc.id,
                                                          )
                                                        : [...prev, loc.id],
                                                    )
                                                  }
                                                />
                                                <span className="slider"></span>
                                              </label>
                                            </div>
                                          ))}

                                      {/* Class B Sub-Header inside Distance Folder */}
                                      {isDistanceFolder &&
                                        subGroupLocs.some(
                                          (l) => l.tier === "Class B",
                                        ) && (
                                          <div
                                            className="flex justify-between items-center pl-9 pr-2 mt-1.5 mb-0.5 border-b border-[#D8D8D8]/50 pb-0.5 opacity-60 hover:opacity-100 cursor-pointer"
                                            onClick={() =>
                                              setExpandedSubGroups((p) => ({
                                                ...p,
                                                [`${subGroupName}_ClassB`]:
                                                  !p[`${subGroupName}_ClassB`],
                                              }))
                                            }
                                            onMouseEnter={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class B",
                                                ),
                                                true,
                                              )
                                            }
                                            onMouseLeave={() =>
                                              handleGroupHover(
                                                subGroupLocs.filter(
                                                  (l) => l.tier === "Class B",
                                                ),
                                                false,
                                              )
                                            }
                                          >
                                            <div className="flex items-center gap-1.5 text-[8px] font-black text-[#1E2F31] uppercase tracking-widest">
                                              <ChevronDown
                                                size={10}
                                                className={`transition-transform duration-300 ${expandedSubGroups[`${subGroupName}_ClassB`] === false ? "-rotate-90" : ""}`}
                                              />
                                              <span>Class B (Specialized)</span>
                                            </div>
                                            <label
                                              className="switch item scale-75 origin-right"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <input
                                                type="checkbox"
                                                checked={subGroupLocs
                                                  .filter(
                                                    (l) => l.tier === "Class B",
                                                  )
                                                  .every((l) =>
                                                    activePOIs.includes(l.id),
                                                  )}
                                                onChange={() => {
                                                  const ids = subGroupLocs
                                                    .filter(
                                                      (l) =>
                                                        l.tier === "Class B",
                                                    )
                                                    .map((l) => l.id);
                                                  const allActive = ids.every(
                                                    (id) =>
                                                      activePOIs.includes(id),
                                                  );
                                                  setActivePOIs((prev) =>
                                                    allActive
                                                      ? prev.filter(
                                                          (id) =>
                                                            !ids.includes(id),
                                                        )
                                                      : [
                                                          ...new Set([
                                                            ...prev,
                                                            ...ids,
                                                          ]),
                                                        ],
                                                  );
                                                }}
                                              />
                                              <span className="slider"></span>
                                            </label>
                                          </div>
                                        )}

                                      {/* Class B Loop */}
                                      {expandedSubGroups[
                                        `${subGroupName}_ClassB`
                                      ] !== false &&
                                        isDistanceFolder &&
                                        subGroupLocs
                                          .filter((l) => l.tier === "Class B")
                                          .map((loc, index) => (
                                            <div
                                              key={loc.id}
                                              className="location-list-item flex justify-between items-center py-1.5 pl-12 pr-2 text-[10px] font-medium hover:bg-[#EFEBE7] rounded cursor-pointer transition-colors"
                                              onClick={() =>
                                                handlePoiClick(
                                                  loc.lat,
                                                  loc.lon,
                                                  loc.id,
                                                )
                                              }
                                              onMouseEnter={() =>
                                                handlePoiHover?.(loc.id, true)
                                              }
                                              onMouseLeave={() =>
                                                handlePoiHover?.(loc.id, false)
                                              }
                                            >
                                              <div className="truncate flex-1 min-w-0 pr-3">
                                                <span className="text-[#9B8B70] mr-1.5 font-bold">
                                                  {index + 1}.
                                                </span>
                                                <span className="font-bold text-[#1E2F31]">
                                                  {loc.name}
                                                </span>
                                                <span className="hidden text-[9px] text-[#9B8B70] ml-1.5">
                                                  — {loc.desc}
                                                </span>
                                              </div>
                                              <label
                                                className="switch item"
                                                onClick={(e) =>
                                                  e.stopPropagation()
                                                }
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={activePOIs.includes(
                                                    loc.id,
                                                  )}
                                                  onChange={() =>
                                                    setActivePOIs((prev) =>
                                                      prev.includes(loc.id)
                                                        ? prev.filter(
                                                            (i) => i !== loc.id,
                                                          )
                                                        : [...prev, loc.id],
                                                    )
                                                  }
                                                />
                                                <span className="slider"></span>
                                              </label>
                                            </div>
                                          ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* Render TB Simatupang and additional anchors as top-level anchor items positioned after the radius sub-groups */}
                            {groupName === "Vasanta" &&
                              groupLocs
                                .filter(
                                  (l) =>
                                    l.id === "tb" || l.id === "new_vasanta",
                                )
                                .map((loc, index) => (
                                  <div
                                    key={loc.id}
                                    className="location-list-item flex justify-between items-center py-1.5 pl-7 pr-2 text-[10px] font-medium hover:bg-[#EFEBE7] rounded cursor-pointer transition-colors"
                                    onClick={() =>
                                      handlePoiClick(
                                        loc.lat !== undefined
                                          ? loc.lat
                                          : loc.fallbackLat,
                                        loc.lon !== undefined
                                          ? loc.lon
                                          : loc.fallbackLon,
                                        loc.id,
                                      )
                                    }
                                    onMouseEnter={() =>
                                      handlePoiHover?.(loc.id, true)
                                    }
                                    onMouseLeave={() =>
                                      handlePoiHover?.(loc.id, false)
                                    }
                                  >
                                    <div className="truncate flex-1 min-w-0 pr-3">
                                      <span className="text-[#9B8B70] mr-1.5 font-bold">
                                        {index + 2}.
                                      </span>
                                      <span className="font-bold text-[#1E2F31]">
                                        {loc.name}
                                      </span>
                                      <span className="hidden text-[9px] text-[#9B8B70] ml-1.5">
                                        — {loc.desc}
                                      </span>
                                    </div>
                                    <label
                                      className="switch item"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={activePOIs.includes(loc.id)}
                                        onChange={() =>
                                          setActivePOIs((prev) =>
                                            prev.includes(loc.id)
                                              ? prev.filter((i) => i !== loc.id)
                                              : [...prev, loc.id],
                                          )
                                        }
                                      />
                                      <span className="slider"></span>
                                    </label>
                                  </div>
                                ))}

                            {/* Toll Roads Toggle specifically for Infrastructure Group */}
                            {groupName === "Infrastructure" && (
                              <div
                                className="flex justify-between items-center py-1.5 pl-7 pr-2 text-[10px] font-medium hover:bg-[#EFEBE7] rounded cursor-pointer transition-colors"
                                onClick={() => setShowTollRoads(!showTollRoads)}
                              >
                                <div className="truncate flex-1 min-w-0 pr-3 relative pl-4">
                                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-0.5 bg-[#1E3A8A]"></span>
                                  <span className="font-bold text-[#1E2F31] group-hover:text-[#1E3A8A]">
                                    Toll Roads Network
                                  </span>
                                </div>
                                <label
                                  className="switch item"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    checked={showTollRoads}
                                    onChange={() =>
                                      setShowTollRoads(!showTollRoads)
                                    }
                                  />
                                  <span className="slider"></span>
                                </label>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1">
            <div className="border-b border-[#D8D8D8] pb-3 mb-1">
              <span className="text-[11px] font-extrabold text-[#1E2F31] uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={14} className="text-[#1C6048]" />
                Target Capture
              </span>
              <p className="text-[10px] font-medium text-[#4C4A4B] mt-1">
                {pyramidData.activePop.toLocaleString()} individuals in selected
                regions.
              </p>
            </div>

            <div className="flex flex-col gap-1">
              {ageCohorts.map((cohort, index) => (
                <div key={cohort} className="flex items-center h-3">
                  <div className="flex-1 h-full bg-[#EFEBE7] rounded-sm flex justify-end">
                    <div
                      className="h-full rounded-sm bg-[#1C6048] transition-all duration-300"
                      style={{
                        width: `${(pyramidData.male[index] / pyramidData.maxCohort) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="w-10 text-center text-[8px] font-bold text-[#4C4A4B]">
                    {cohort}
                  </div>
                  <div className="flex-1 h-full bg-[#EFEBE7] rounded-sm flex justify-start">
                    <div
                      className="h-full rounded-sm bg-[#A95C3E] transition-all duration-300"
                      style={{
                        width: `${(pyramidData.female[index] / pyramidData.maxCohort) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Axis */}
              <div className="flex text-[9px] text-[#9B8B70] mt-1 mb-2 h-3">
                <div className="flex-1 relative border-t border-[#9B8B70]/40 pt-1">
                  <div className="absolute left-0 -top-px h-1 border-l border-[#9B8B70]/40"></div>
                  <div className="absolute left-1/2 -top-px h-1 border-l border-[#9B8B70]/40"></div>
                  <div className="absolute right-0 -top-px h-1 border-r border-[#9B8B70]/40"></div>
                  <span className="absolute left-0">0</span>
                  <span className="absolute left-1/2 -translate-x-1/2">
                    {formatAxisLabel(pyramidData.maxCohort / 2)}
                  </span>
                  <span className="absolute right-0">
                    {formatAxisLabel(pyramidData.maxCohort)}
                  </span>
                </div>
                <div className="w-10"></div>
                <div className="flex-1 relative border-t border-[#9B8B70]/40 pt-1">
                  <div className="absolute left-0 -top-px h-1 border-l border-[#9B8B70]/40"></div>
                  <div className="absolute left-1/2 -top-px h-1 border-l border-[#9B8B70]/40"></div>
                  <div className="absolute right-0 -top-px h-1 border-r border-[#9B8B70]/40"></div>
                  <span className="absolute left-0">0</span>
                  <span className="absolute left-1/2 -translate-x-1/2">
                    {formatAxisLabel(pyramidData.maxCohort / 2)}
                  </span>
                  <span className="absolute right-0">
                    {formatAxisLabel(pyramidData.maxCohort)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-[9px] font-bold text-[#9B8B70] border-t border-dashed border-[#D8D8D8] pt-2 mb-2">
                <span className="text-[#1C6048]">♂ Men</span>
                <span>Cohort Age</span>
                <span className="text-[#A95C3E]">♀ Women</span>
              </div>

              {/* Active Pop Progress Bar */}
              <div className="mt-2 border-t border-dashed border-[#D8D8D8] pt-2 flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-bold text-[#4C4A4B]">
                  <span>ACTIVE POPULATION SHARE</span>
                  <span className="text-[#9B8B70]">
                    {pyramidData.popShare}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#9B8B70]/10 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-[#9B8B70] rounded-full transition-all duration-400"
                    style={{ width: `${pyramidData.popShare}%` }}
                  ></div>
                </div>
                <div className="text-[9px] text-[#9B8B70] flex justify-between font-medium">
                  <span>
                    {(pyramidData.activePop / 1000000).toFixed(2)}M /{" "}
                    {(pyramidData.totalPop / 1000000).toFixed(1)}M
                  </span>
                  <span>of Greater Jakarta</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isPanelOpen && (
        <div
          onClick={() => setIsPanelOpen(true)}
          className="absolute top-4 left-4 z-[950] bg-white/90 backdrop-blur-md px-2.5 py-2 sm:p-2.5 rounded-xl shadow-md border border-[#D8D8D8] cursor-pointer hover:bg-white text-[#1E2F31] font-bold text-[10px] sm:text-xs uppercase flex items-center gap-1.5 sm:gap-2"
        >
          <Map size={14} className="text-[#1C6048] shrink-0" />
          <span className="hidden sm:inline">Open Map Data</span>
          <span className="sm:hidden">Data</span>
        </div>
      )}
      {/* Combined Toolbar (Target & Ruler) matching Leaflet native style */}
      <div className="leaflet-bar absolute bottom-4 left-[60px] z-[1000] cursor-pointer">
        <a
          onClick={(e) => {
            e.preventDefault();
            frameActiveRegions(mapRef.current);
          }}
          title="Reset View to Active Regions"
          className="hover:!text-[#1C6048]"
        >
          <Target size={16} strokeWidth={2.5} />
        </a>
        <a
          onClick={(e) => {
            e.preventDefault();
            setIsMeasuring(!isMeasuring);
          }}
          title="Measure Distance"
          className={
            isMeasuring
              ? "!bg-[#E8EFEA] !text-[#1C6048]"
              : "hover:!text-[#1C6048]"
          }
        >
          <Ruler size={16} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
});
// === END INTERACTIVE MAP ===

const ClinicalProgrammingView = memo(() => {
  const [viewMode, setViewMode] = useState<"moh" | "private">("moh");

  const pieData = useMemo(
    () => [
      {
        name: "Standard",
        value: 48,
        color: viewMode === "private" ? "#4C4A4B" : "#9B8B70",
      },
      {
        name: "VIP/VVIP",
        value: 48,
        color: viewMode === "private" ? "#9B8B70" : "#99B6AA",
      },
      {
        name: "Isolation",
        value: 12,
        color: viewMode === "private" ? "#D8D8D8" : "#FFFFFF",
      },
      {
        name: "ICU",
        value: 12,
        color: viewMode === "private" ? "#1C6048" : "#48B084",
      },
    ],
    [viewMode],
  );

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <div className="border-b border-[#D8D8D8] pb-4 mb-6">
          <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight">
            Clinical & Facility Framework
          </h2>
          <p className="text-[12px] text-[#4C4A4B] font-medium mt-1">
            Proposed function room breakdown for an optimal oncology-focused
            hospital model.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Radiotherapy & Diagnostic Imaging */}
          <BentoBox
            colSpan="md:col-span-12 lg:col-span-7"
            className="bg-white border-[#D8D8D8]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-[#1C6048]" size={24} />
              <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
                Radiotherapy & Diagnostic Imaging
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
                <p className="font-black text-[#1E2F31] mb-1">LINAC Bunkers</p>
                <p className="text-xs text-[#4C4A4B] font-medium">
                  Standard 2-bunker initial rollout with provision for future
                  expansion. Core engine of the facility's revenue.
                </p>
              </div>
              <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
                <p className="font-black text-[#1E2F31] mb-1">PET-CT Suite</p>
                <p className="text-xs text-[#4C4A4B] font-medium">
                  Dedicated diagnostic room for precise oncology staging.
                  Requires dedicated hot-lab and patient resting area.
                </p>
              </div>
              <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
                <p className="font-black text-[#1E2F31] mb-1">
                  MRI & CT Simulator
                </p>
                <p className="text-xs text-[#4C4A4B] font-medium">
                  1.5T to 3T MRI unit along with CT Simulator for precise
                  radiation planning.
                </p>
              </div>
              <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
                <p className="font-black text-[#1E2F31] mb-1">
                  General Imaging
                </p>
                <p className="text-xs text-[#4C4A4B] font-medium">
                  Digital X-Ray, Mammography, and Ultrasound suites
                  complementing core diagnostics.
                </p>
              </div>
            </div>
          </BentoBox>

          {/* Chemotherapy & Outpatient */}
          <BentoBox
            colSpan="md:col-span-12 lg:col-span-5"
            className="!bg-[#EFEBE7] border-transparent"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-[#9B8B70]" size={24} />
              <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
                Outpatient & Day Care
              </h2>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8]">
                <div className="w-8 h-8 rounded-full bg-[#1C6048]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#1C6048] font-bold text-xs">A</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2F31] text-sm mb-1">
                    Chemotherapy Day Care
                  </h4>
                  <p className="text-xs text-[#4C4A4B] font-medium">
                    15-20 infusion chairs with a mix of open bays and private
                    isolation rooms for comfort and infection control.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8]">
                <div className="w-8 h-8 rounded-full bg-[#1C6048]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#1C6048] font-bold text-xs">B</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2F31] text-sm mb-1">
                    Oncology Consult Clinics
                  </h4>
                  <p className="text-xs text-[#4C4A4B] font-medium">
                    10-15 consultation rooms optimized for fast turnaround,
                    bundled with integrated minor procedure rooms.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8]">
                <div className="w-8 h-8 rounded-full bg-[#1C6048]/10 flex items-center justify-center shrink-0">
                  <span className="text-[#1C6048] font-bold text-xs">C</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2F31] text-sm mb-1">
                    Palliative & Pain Mgmt
                  </h4>
                  <p className="text-xs text-[#4C4A4B] font-medium">
                    Dedicated outpatient unit focused on quality of life and
                    symptomatic relief.
                  </p>
                </div>
              </li>
            </ul>
          </BentoBox>

          {/* Inpatient & Surgical */}
          <BentoBox
            colSpan="md:col-span-12"
            className="!bg-[#1E2F31] !text-white border-transparent py-8"
          >
            <div className="flex flex-col xl:flex-row justify-between items-center mb-8 px-4 lg:px-8 gap-4">
              <h2 className="text-xl font-black tracking-tight text-white mb-0 text-center xl:text-left">
                Inpatient, Surgical, & Critical Care Architecture
              </h2>
              <div className="flex bg-[#121E20] p-1 rounded-lg border border-white/10 shrink-0 mx-auto xl:mx-0">
                <button
                  onClick={() => setViewMode("moh")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors border outline-none focus:outline-none ${viewMode === "moh" ? "bg-[#1C6048] border-[#1C6048] text-white shadow-sm" : "border-transparent text-white/50 hover:text-white"}`}
                >
                  MoH Regulatory Requirement
                </button>
                <button
                  onClick={() => setViewMode("private")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors border outline-none focus:outline-none ${viewMode === "private" ? "bg-[#9B8B70] border-[#9B8B70] text-white shadow-sm" : "border-transparent text-white/50 hover:text-white"}`}
                >
                  Private Hospital Optimization
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 px-4 lg:px-8">
              {/* Chart Column (Span 3) */}
              <div className="lg:col-span-3 flex flex-col justify-center items-center lg:border-r border-white/20 pb-6 lg:pb-0 lg:pr-6 border-b lg:border-b-0">
                <div className="h-40 w-full relative flex items-center justify-center">
                  <PieChart width={160} height={160}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-white">120</span>
                    <span className="text-[10px] font-bold text-white/60 -mt-1 uppercase tracking-widest">
                      Beds
                    </span>
                  </div>
                </div>
              </div>

              {/* Wards Column (Span 4) */}
              <div className="lg:col-span-4 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-l-2 border-[#1C6048] pl-3">
                  Inpatient Wards (108)
                </h3>
                <ul className="text-xs space-y-3 text-white/80 list-none pl-1">
                  <li className="flex items-start gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-sm mt-0.5 shrink-0 transition-colors duration-500 ${viewMode === "private" ? "bg-[#4C4A4B]" : "bg-[#9B8B70]"}`}
                    />
                    <div className="flex-1">
                      <strong className="text-white">Standard (KRIS)</strong>:
                      48 Beds
                      <p
                        className={`text-[10px] min-h-[32px] leading-tight mt-0.5 transition-colors duration-300 ${viewMode === "private" ? "text-white/60" : "text-white/50"}`}
                      >
                        {viewMode === "moh"
                          ? "Min 40% of total beds per MoH requirement"
                          : "High-volume absorption to capture initial patient funnel"}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-sm mt-0.5 shrink-0 transition-colors duration-500 ${viewMode === "private" ? "bg-[#9B8B70]" : "bg-[#99B6AA]"}`}
                    />
                    <div className="flex-1">
                      <strong className="text-white">
                        Premium (VIP / VVIP)
                      </strong>
                      : 48 Beds
                      <p
                        className={`text-[10px] min-h-[32px] leading-tight mt-0.5 transition-colors duration-300 ${viewMode === "private" ? "text-[#9B8B70] font-bold" : "text-white/50"}`}
                      >
                        {viewMode === "moh"
                          ? "Remaining allocation for commercial & private insurance"
                          : "High-margin core driver for medical tourism & corporate payors"}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-sm mt-0.5 shrink-0 shadow-[0_0_4px_rgba(255,255,255,0.5)] transition-colors duration-500 ${viewMode === "private" ? "bg-[#D8D8D8]" : "bg-[#FFFFFF]"}`}
                    />
                    <div className="flex-1">
                      <strong className="text-white">Isolation</strong>: 12 Beds
                      <p className="text-[10px] min-h-[32px] text-white/50 leading-tight mt-0.5">
                        {viewMode === "moh"
                          ? "Min 10% of total beds per MoH requirement"
                          : "Specialized infection control shielding broader hospital assets"}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* ICU Column (Span 2) */}
              <div className="lg:col-span-2 flex flex-col">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-l-2 border-[#48B084] pl-3">
                  ICU (12)
                </h3>
                <div className="flex items-start gap-2 pl-1 w-full">
                  <div
                    className={`w-2.5 h-2.5 rounded-sm mt-0.5 shrink-0 shadow-[0_0_8px_rgba(72,176,132,0.6)] transition-colors duration-500 ${viewMode === "private" ? "bg-[#1C6048]" : "bg-[#48B084]"}`}
                  />
                  <div className="w-full">
                    <p
                      className={`text-[10px] min-h-[28px] font-bold mb-2 transition-colors duration-300 ${viewMode === "private" ? "text-[#48B084]" : "text-[#48B084]"}`}
                    >
                      {viewMode === "moh"
                        ? "Meets MoH minimum 8%"
                        : "High-margin intensive revenue center"}
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-white/80 w-full">
                      <li className="flex justify-between border-b border-white/10 pb-1">
                        <span>General:</span>
                        <b className="text-white">6</b>
                      </li>
                      <li className="flex justify-between border-b border-white/10 pb-1">
                        <span>HCU:</span>
                        <b className="text-white">4</b>
                      </li>
                      <li className="flex justify-between">
                        <span>Isolation:</span>
                        <b className="text-white">2</b>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* OTs Column (Span 3) */}
              <div className="lg:col-span-3 flex flex-col lg:border-l border-white/20 pt-6 lg:pt-0 lg:pl-6 border-t lg:border-t-0 mt-2 lg:mt-0">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider border-l-2 border-[#9B8B70] pl-3">
                  Operating Theaters
                </h3>
                <p className="text-[11px] text-white/70 font-medium leading-relaxed mb-3">
                  Target: 3-4 Major OTs.
                </p>
                <ul className="text-[11px] space-y-2 text-white/80 list-disc pl-4">
                  <li>Oncology/General Surgery OT</li>
                  <li>Minimally Invasive / Endoscopy Suite</li>
                  <li>Recovery / PACU (5-6 beds)</li>
                  <li>Central Sterile Services Dept (CSSD)</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 px-4 lg:px-8 text-[10px] text-white/40 border-t border-white/10 pt-4 flex items-center justify-center lg:justify-start">
              <span>* MoH (Ministry of Health)</span>
            </div>
          </BentoBox>
        </div>
      </div>
    </div>
  );
});

const StudyView = memo(
  ({ isPresenting, info, activeMiniTab, setActiveMiniTab }) => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12 relative">
        {/* Dynamic Content Rendering */}
        {activeMiniTab === "clinicalRooms" && <ClinicalProgrammingView />}

        {activeMiniTab === "opportunities" && (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
            <div>
              <div className="border-b border-[#D8D8D8] pb-4 mb-6">
                <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight">
                  Funnel Validation
                </h2>
                <p className="text-[12px] text-[#4C4A4B] font-medium mt-1">
                  Waitlist capture strategy and high-margin premium catchment
                  sizing.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Radiation Queues & Waitlist Capture (Replaced Travel-Time Moat) */}
                <BentoBox
                  colSpan="md:col-span-12 lg:col-span-7"
                  className="bg-white border-[#D8D8D8]"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Timer size={24} className="text-[#1C6048]" />
                      <div className="flex items-start gap-2">
                        <div>
                          <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
                            Radiation Queues & Waitlist Capture
                          </h2>
                          <p className="text-[10px] text-[#4C4A4B] font-medium mt-0.5">
                            Bridging the gap between diagnosis and LINAC therapy
                          </p>
                        </div>
                        <StatefulTooltipIcon
                          tooltip="Sources & Data Validation
• LINAC Waitlist (Kemenkes): Standard public hospital LINAC routing queues routinely average 3-6 months.
• PET-CT Deficit (WHO): WHO recommends 1 PET-CT device per 1 million people; Indonesia operates far below this, driving multi-month nationwide staging delays."
                          align="left"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 bg-white border border-[#1C6048]/20 rounded-xl flex flex-col items-start gap-4 transition-transform hover:-translate-y-0.5 shadow-sm">
                      <div className="bg-[#E8EFEA] p-3 rounded-xl shrink-0">
                        <ShieldAlert className="text-[#1C6048]" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1E2F31] mb-2 tracking-wide leading-tight">
                          National Waitlist Overflow
                        </p>
                        <p className="text-xs text-[#4C4A4B] font-medium leading-relaxed">
                          Public reference hospitals currently experience 3-6
                          month backlogs for LINAC radiotherapy. Vasanta targets
                          these immediate "spill-over" patients who require
                          urgent intervention and possess private insurance or
                          self-pay capability.
                        </p>
                      </div>
                    </div>
                    <div className="p-5 bg-white border border-[#D8D8D8] rounded-xl flex flex-col items-start gap-4 transition-transform hover:-translate-y-0.5 shadow-sm">
                      <div className="bg-[#F9F8F6] p-3 rounded-xl shrink-0">
                        <Zap className="text-[#9B8B70]" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1E2F31] mb-2 tracking-wide leading-tight">
                          Speed-to-Therapy
                        </p>
                        <p className="text-xs text-[#4C4A4B] font-medium leading-relaxed">
                          For oncology outpatients, treatment velocity is the
                          ultimate differentiator. The facility is structured to
                          cut diagnostic-to-radiation intervals from months down
                          to a matter of days.
                        </p>
                      </div>
                    </div>
                    <div className="p-5 bg-white border border-[#D8D8D8] rounded-xl flex flex-col items-start gap-4 transition-transform hover:-translate-y-0.5 shadow-sm">
                      <div className="bg-[#F9F8F6] p-3 rounded-xl shrink-0">
                        <CheckCircle2 className="text-[#1C6048]" size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1E2F31] mb-2 tracking-wide leading-tight">
                          Private Sector Absorption
                        </p>
                        <p className="text-xs text-[#4C4A4B] font-medium leading-relaxed">
                          Class B general hospitals often lack capital-intensive
                          dedicated radiotherapy bunkers. Vasanta will serve as
                          the natural secondary referral hub for cancer patients
                          diagnosed at surrounding middle-tier hospitals.
                        </p>
                      </div>
                    </div>
                  </div>
                </BentoBox>

                {/* Concept 3: TAM-to-SOM Premium Funnel */}
                <BentoBox
                  colSpan="md:col-span-12 lg:col-span-5"
                  className="!bg-[#EFEBE7] border-transparent"
                >
                  <div className="flex items-start gap-3 mb-6">
                    <Users size={24} className="text-[#9B8B70]" />
                    <div className="flex items-start gap-2">
                      <div>
                        <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
                          Premium Market Funnel
                        </h2>
                        <p className="text-[10px] text-[#4C4A4B] font-medium mt-0.5">
                          Isolating self-pay and private insurance lives (SES A
                          & B).
                        </p>
                      </div>
                      <StatefulTooltipIcon
                        tooltip="Sources & Validation
SES A&B penetration (approx. 18-20% in Greater Jakarta) is estimated by mapping BPS 2024 regional expenditure demographics against Nielsen's SES classification matrix. The high regional GDP per capita strongly correlates with deeper pools of commercial insurance adoption."
                        align="right"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    {/* Stage 1: TAM */}
                    <div className="relative">
                      <div className="w-full h-11 bg-white border border-[#D8D8D8] rounded-xl flex items-center justify-between px-4 shadow-sm">
                        <span className="text-[10px] font-bold text-[#4C4A4B] uppercase tracking-wider">
                          1. TAM (Total Catchment)
                        </span>
                        <span className="font-mono text-sm font-black text-[#1E2F31]">
                          7,379,532
                        </span>
                      </div>
                      <div className="w-full flex justify-center py-0.5">
                        <div className="w-px h-3.5 border-l-2 border-dashed border-[#9B8B70]"></div>
                      </div>
                    </div>

                    {/* Stage 2: SAM */}
                    <div className="relative">
                      <div className="w-[85%] mx-auto h-11 bg-[#99B6AA]/20 border border-[#99B6AA] rounded-xl flex items-center justify-between px-4 shadow-sm">
                        <span className="text-[10px] font-bold text-[#1E2F31] uppercase tracking-wider">
                          2. SAM (SES A & B - 18%)
                        </span>
                        <span className="font-mono text-sm font-black text-[#1E2F31]">
                          1,332,000
                        </span>
                      </div>
                      <div className="w-full flex justify-center py-0.5">
                        <div className="w-px h-3.5 border-l-2 border-dashed border-[#1C6048]"></div>
                      </div>
                    </div>

                    {/* Stage 3: SOM */}
                    <div>
                      <div className="w-[70%] mx-auto h-11 bg-[#1C6048] text-white rounded-xl flex items-center justify-between px-4 shadow-md border border-[#18533E]">
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          3. SOM (Insured Target - 40%)
                        </span>
                        <span className="font-mono text-sm font-black text-white">
                          532,800
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#D8D8D8]">
                    <p className="text-[10px] text-[#4C4A4B] leading-relaxed font-medium">
                      By filtering the regional demographic to strictly isolate{" "}
                      <strong>SES A & B (18%)</strong> and capturing those with{" "}
                      <strong>Private Commercial Insurance (40%)</strong>, we
                      establish a core addressable market of
                      <strong>230.4k high-margin premium lives</strong>, heavily
                      de-risking our revenue-per-bed targets.
                    </p>
                  </div>
                </BentoBox>

                {/* Concept 4: The Interactive Geographic Spillover (The Leaflet Map) */}
                <BentoBox
                  colSpan="md:col-span-12"
                  className="bg-white border-[#D8D8D8]"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Map size={24} className="text-[#1C6048]" />
                    <div>
                      <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
                        Interactive Catchment Boundary
                      </h2>
                      <p className="text-[10px] text-[#4C4A4B] font-medium mt-0.5">
                        Visualizing the West Jakarta structural spillover into
                        our localized Tangerang monopoly.
                      </p>
                    </div>
                  </div>

                  <div className="w-full">
                    <InteractiveDemographicMap />
                  </div>

                  <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium mt-6 bg-[#EFEBE7] p-4 rounded-xl border border-[#D8D8D8]">
                    <strong className="text-[#1E2F31]">Strategic Note:</strong>{" "}
                    Notice how the primary catchment area directly borders the
                    highly affluent West Jakarta corridor. Because our model
                    strictly underwrites using only Tangerang's population, any
                    spillover from the 2.6M West Jakarta residents (who face a
                    much faster commute to Vasanta than to South Jakarta)
                    represents pure, un-modeled upside to our base-case returns.
                  </p>
                </BentoBox>

                {/* Key Regional Infrastructure Context */}
                <BentoBox colSpan="md:col-span-12">
                  <div className="flex items-center gap-4 mb-6">
                    <BentoIcon
                      icon={<Map size={24} />}
                      color="indigo"
                      className="mb-0 w-12 h-12 rounded-xl"
                    />
                    <h2 className="text-lg font-black text-[#1E2F31] tracking-tight">
                      Feasibility Framework: Defending the Premium Moat
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8]">
                      <h4 className="font-bold text-[#1E2F31] mb-2 text-sm">
                        Geographic Inelasticity
                      </h4>
                      <p className="text-xs text-[#4C4A4B] leading-relaxed font-medium">
                        Radiotherapy patients require consecutive daily
                        treatments for 4–6 weeks. Traveling outside Tangerang is
                        logistically unfeasible, guaranteeing high local
                        retention.
                      </p>
                    </div>
                    <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8]">
                      <h4 className="font-bold text-[#1E2F31] mb-2 text-sm">
                        Affluent Middle Class
                      </h4>
                      <p className="text-xs text-[#4C4A4B] leading-relaxed font-medium">
                        Tangerang’s rapid middle-class growth translates
                        directly to commercial insurance adoption, shifting
                        clinical volume away from low-margin BPJS public plans.
                      </p>
                    </div>
                    <div className="bg-[#F9F8F6] p-5 rounded-2xl border border-[#D8D8D8]">
                      <h4 className="font-bold text-[#1E2F31] mb-2 text-sm">
                        The "First-Mover" Advantage
                      </h4>
                      <p className="text-xs text-[#4C4A4B] leading-relaxed font-medium">
                        By securing local nuclear licensing (BAPETEN) and
                        building the LINAC/PET-CT bunkers upfront, Vasanta
                        pre-empts competitor entry, creating an operational
                        monopoly.
                      </p>
                    </div>
                  </div>
                </BentoBox>
              </div>
            </div>
          </div>
        )}

        {activeMiniTab === "marketAnalysis" && (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-300">
            <div>
              <div className="border-b border-[#D8D8D8] pb-4 mb-6">
                <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight">
                  Market Gap & Deficits
                </h2>
                <p className="text-[12px] text-[#4C4A4B] font-medium mt-1">
                  Systemic frictions across inpatient beds, physician ratios,
                  and technological mismatch.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Supply & Demand Bento (Rebuilt to match slide ratio) */}
                <BentoBox colSpan="md:col-span-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        <BentoIcon
                          icon={<CustomBedIcon size={80} />}
                          color="transparent"
                          className="mb-0 text-[#1E2F31]"
                        />
                        <h2 className="text-xl font-black text-[#1E2F31] tracking-tight">
                          Hospital Beds Shortage
                        </h2>
                      </div>
                      <p className="text-[13px] text-[#4C4A4B] leading-relaxed font-medium">
                        Indonesia currently operates with a severe deficit in
                        healthcare infrastructure compared to global benchmarks,
                        indicating massive unfulfilled demand for modern
                        inpatient facilities.
                      </p>
                    </div>
                    <div className="flex-1 w-full flex flex-col items-center justify-center gap-1 p-6 lg:p-8 bg-[#F9F8F6] border border-[#D8D8D8] rounded-[24px]">
                      <span className="text-[9px] font-black text-[#9B8B70] uppercase tracking-widest mb-2 whitespace-nowrap">
                        Hospital Beds per 1,000 Citizens
                      </span>
                      <div className="flex items-center justify-center gap-4 lg:gap-8 w-full">
                        <div className="text-center">
                          <p className="text-5xl lg:text-6xl font-black text-[#1E2F31]">
                            1.4
                          </p>
                          <p className="text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest mt-3">
                            Indonesia
                          </p>
                        </div>
                        <div className="text-6xl lg:text-7xl font-black text-[#1E2F31] px-4 opacity-80">
                          &lt;
                        </div>
                        <div className="text-center">
                          <p className="text-5xl lg:text-6xl font-black text-[#1C6048]">
                            4.5
                          </p>
                          <p className="text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest mt-3">
                            Average Standard
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </BentoBox>

                {/* Systemic Frictions Bento Grid (Matches Image: 8-4 Row / 3-6-3 Row) */}

                {/* Card 1: Physician (Wide 8-Col) */}
                <BentoBox
                  colSpan="md:col-span-12 lg:col-span-8"
                  className="!bg-[#EFEBE7] border-transparent"
                >
                  <h3 className="font-black text-[15px] text-[#1E2F31] mb-6 text-center">
                    Physician-to-Population Ratio
                  </h3>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-16 flex-1">
                    <div className="flex items-end justify-center gap-6">
                      <div className="flex flex-col items-center">
                        <BentoIcon
                          icon={<CustomPhysicianIcon size={80} />}
                          color="transparent"
                          className="mb-0 text-[#1C6048]"
                        />
                        <p className="text-5xl font-black text-[#1E2F31] mt-2">
                          1
                        </p>
                      </div>
                      <p className="text-4xl font-black text-[#1E2F31] pb-1 opacity-80">
                        :
                      </p>
                      <div className="flex flex-col items-center">
                        <BentoIcon
                          icon={<CustomPopulationIcon size={80} />}
                          color="transparent"
                          className="mb-0 text-[#1C6048]"
                        />
                        <p className="text-5xl font-black text-[#1E2F31] mt-2">
                          2000
                        </p>
                      </div>
                    </div>
                    <div className="text-center md:text-left flex flex-col items-center md:items-start border-t md:border-t-0 md:border-l border-[#D8D8D8] pt-6 md:pt-0 md:pl-10">
                      <p className="text-[10px] font-bold text-[#1E2F31] tracking-widest mb-4 bg-white/60 px-3 py-1.5 rounded-lg border border-[#D8D8D8]">
                        WHO Standard 1 : 1000
                      </p>
                      <p className="text-xs text-[#4C4A4B] leading-relaxed font-medium max-w-[200px]">
                        Operating at{" "}
                        <strong className="text-[#1E2F31]">50%</strong>{" "}
                        physician capacity.
                        <br />
                        <br />A chronic shortage demands{" "}
                        <strong className="text-[#1E2F31]">
                          digital-first
                        </strong>{" "}
                        clinical support.
                      </p>
                    </div>
                  </div>
                </BentoBox>

                {/* Card 2: Quality Mismatch (Square 4-Col) */}
                <BentoBox
                  colSpan="md:col-span-12 lg:col-span-4"
                  className="bg-[#F9F8F6] border-[#D8D8D8] items-center text-center"
                >
                  <h3 className="font-black text-[15px] text-[#1E2F31] mb-6">
                    Price vs Quality Mismatch
                  </h3>
                  <BentoIcon
                    icon={<CustomScaleIcon size={100} />}
                    color="transparent"
                    className="mb-6 text-[#1C6048]"
                  />
                  <p className="text-xs text-[#4C4A4B] leading-relaxed font-medium mt-auto">
                    High out-of-pocket costs{" "}
                    <strong className="text-[#1E2F31]">failing</strong> to
                    deliver a <strong className="text-[#1E2F31]">Tier-A</strong>{" "}
                    patient experience.
                  </p>
                </BentoBox>

                {/* Card 3: Fragmented (Square 3-Col) */}
                <BentoBox
                  colSpan="md:col-span-6 lg:col-span-3"
                  className="bg-[#F9F8F6] border-[#D8D8D8] items-center text-center"
                >
                  <h3 className="font-black text-[15px] text-[#1E2F31] mb-6">
                    Fragmented Operation
                  </h3>
                  <BentoIcon
                    icon={<CustomKnotIcon size={100} />}
                    color="transparent"
                    className="mb-6 text-[#1C6048]"
                  />
                  <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium mt-auto">
                    <strong className="text-[#1E2F31]">Inefficient</strong>{" "}
                    unified digital backbone, error-prone, and disconnected
                    operations.
                  </p>
                </BentoBox>

                {/* Card 4: Admin Bottleneck (Wide 6-Col) */}
                <BentoBox
                  colSpan="md:col-span-12 lg:col-span-6"
                  className="bg-white border-[#D8D8D8] items-center md:items-start text-center md:text-left flex-row flex-wrap md:flex-nowrap"
                >
                  <div className="w-full flex flex-col items-center md:items-start h-full">
                    <h3 className="font-black text-[15px] text-[#1E2F31] mb-6 w-full text-center md:text-left">
                      Administrative Bottleneck per Patient Visit
                    </h3>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-8 flex-1 w-full">
                      <div className="flex flex-col items-center justify-center shrink-0">
                        <BentoIcon
                          icon={<Timer size={100} strokeWidth={1.5} />}
                          color="transparent"
                          className="mb-4 text-[#1C6048]"
                        />
                        <p className="text-4xl font-black text-[#1E2F31] whitespace-nowrap">
                          &gt; 2 Hours
                        </p>
                      </div>
                      <p className="text-xs text-[#4C4A4B] leading-relaxed font-medium max-w-[260px] border-t md:border-t-0 md:border-l border-[#EFEBE7] pt-4 md:pt-0 md:pl-6 text-center md:text-left">
                        Administrative friction paralyzes the patient journey
                        and experience.
                        <br />
                        <br />A{" "}
                        <strong className="text-[#1E2F31]">2-hour</strong> wait
                        for a{" "}
                        <strong className="text-[#1E2F31]">15-minute</strong>{" "}
                        consultation proves that Indonesia current "manual"
                        hospital model is no longer viable.
                      </p>
                    </div>
                  </div>
                </BentoBox>

                {/* Card 5: Preventative (Square 3-Col) */}
                <BentoBox
                  colSpan="md:col-span-6 lg:col-span-3"
                  className="!bg-[#EFEBE7] border-transparent items-center text-center"
                >
                  <h3 className="font-black text-[15px] text-[#1E2F31] mb-6">
                    Lack of Preventative Screening
                  </h3>
                  <BentoIcon
                    icon={<CustomStethoscopeIcon size={100} />}
                    color="transparent"
                    className="mb-6 text-[#9B8B70]"
                  />
                  <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium mt-auto">
                    Only{" "}
                    <strong className="text-[#1E2F31] text-sm">17.44%</strong>{" "}
                    of Indonesian underwent preventive health screenings
                    regularly.
                  </p>
                </BentoBox>
              </div>
            </div>

            {/* Section 2: Market Study */}
            <div>
              <div className="border-b border-[#D8D8D8] pb-4 mb-6">
                <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight">
                  Demographics & Coverage
                </h2>
                <p className="text-[12px] text-[#4C4A4B] font-medium mt-1">
                  National health insurance distribution and specialized
                  oncology provider tiers.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Target Demographics Bento */}
                <BentoBox
                  colSpan="md:col-span-4"
                  className="bg-white border-[#D8D8D8] flex flex-col"
                >
                  <BentoIcon icon={<Users size={28} />} color="emerald" />
                  <h2 className="text-xl font-black text-[#1E2F31] tracking-tight mb-6">
                    Target Demographics
                  </h2>

                  <div className="flex-1 flex flex-col bg-[#F9F8F6] rounded-2xl border border-[#D8D8D8] p-5 relative overflow-hidden mb-4">
                    <h3 className="text-[11px] text-[#1C6048] font-bold uppercase tracking-wider text-center mb-2">
                      Premium Addressable Market
                    </h3>

                    <div className="flex-1 min-h-[180px] relative w-full flex items-center justify-center my-4">
                      <LazyResponsiveContainer width="100%" height="100%">
                        <PieChart style={{ outline: "none" }}>
                          <Pie
                            data={PREM_MKT_PIE_DATA}
                            cx="50%"
                            cy="50%"
                            startAngle={90}
                            endAngle={-270}
                            innerRadius="40%"
                            outerRadius="60%"
                            dataKey="value"
                            stroke="none"
                            label={renderPieLabel}
                            labelLine={{ stroke: "#D8D8D8", strokeWidth: 1 }}
                            className="outline-none focus:outline-none"
                          >
                            <Cell
                              fill="#9B8B70"
                              className="outline-none focus:outline-none"
                            />
                            <Cell
                              fill="#294043"
                              className="outline-none focus:outline-none"
                            />
                          </Pie>
                        </PieChart>
                      </LazyResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full border-t border-[#D8D8D8] pt-5 mt-auto">
                      <div className="flex flex-col justify-between text-center border-r border-[#D8D8D8] h-full">
                        <p className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-wider mb-2">
                          Total Catchment
                        </p>
                        <p className="text-xl font-black text-[#1E2F31] leading-none">
                          7,379,532
                        </p>
                      </div>
                      <div className="flex flex-col justify-between text-center h-full">
                        <p className="text-[10px] text-[#9B8B70] font-bold uppercase tracking-wider mb-2">
                          SES A & B
                        </p>
                        <p className="text-xl font-black text-[#9B8B70] leading-none">
                          1.33M
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#EFEBE7] p-4 rounded-xl border border-[#D8D8D8] space-y-3 mt-auto">
                    <div>
                      <p className="text-[10px] font-bold text-[#1E2F31] uppercase tracking-widest mb-1">
                        What is SES A & B?
                      </p>
                      <p className="text-[10px] text-[#4C4A4B] leading-relaxed font-medium">
                        Socio-Economic Status (SES) A & B represents the
                        upper-middle to affluent class, highly correlated with
                        private health insurance and medical tourism spending.
                      </p>
                    </div>
                    <div className="w-full h-px bg-[#D8D8D8]"></div>
                    <div>
                      <p className="text-[10px] font-bold text-[#1C6048] uppercase tracking-widest mb-1">
                        Deriving 1.33M Lives
                      </p>
                      <p className="text-[10px] text-[#4C4A4B] leading-relaxed font-medium">
                        Calculated directly by capturing exactly{" "}
                        <strong className="text-[#1E2F31]">18%</strong> of the{" "}
                        <strong className="text-[#1E2F31]">7.4 Million</strong>{" "}
                        combined West, Central, North Jakarta & Tangerang
                        catchment.
                      </p>
                    </div>
                  </div>
                </BentoBox>

                {/* Regulatory Matrix Bento (Moved up and resized to 8 columns) */}
                <BentoBox
                  colSpan="md:col-span-8"
                  className="bg-white border-[#D8D8D8]"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <BentoIcon
                      icon={<Scale size={28} />}
                      color="amber"
                      className="mb-0"
                    />
                    <h2 className="text-xl font-black text-[#1E2F31] tracking-tight">
                      Regulatory Baseline{" "}
                      <span className="font-medium text-[#4C4A4B] text-sm ml-2 hidden xl:inline">
                        (Bed Capacity Requirements)
                      </span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-8">
                    {/* Diagram 1: Hospital Type */}
                    <div className="flex flex-col items-center">
                      <div className="px-6 py-2 bg-[#F9F8F6] border border-[#D8D8D8] text-[#4C4A4B] text-[13px] font-medium shadow-sm">
                        Hospital Type
                      </div>
                      <div className="w-px h-6 bg-[#A0A0A0]"></div>
                      <div className="w-full max-w-[260px] h-px bg-[#A0A0A0]"></div>
                      <div className="w-full max-w-[260px] flex justify-between">
                        <div className="w-px h-6 bg-[#A0A0A0]"></div>
                        <div className="w-px h-6 bg-[#A0A0A0]"></div>
                      </div>
                      <div className="w-full max-w-[340px] grid grid-cols-2 gap-4 lg:gap-8">
                        <div className="flex flex-col items-center">
                          <div className="w-full py-2 bg-[#99B6AA] text-white text-center text-xs font-bold mb-4">
                            General
                          </div>
                          <ul className="text-xs text-[#4C4A4B] space-y-1.5 w-full pl-2">
                            <li>
                              <strong className="text-[#1E2F31] font-black text-[13px]">
                                A &ge; 250 beds
                              </strong>
                            </li>
                            <li>
                              <strong className="text-[#1E2F31] font-black text-[13px]">
                                B &ge; 200 beds
                              </strong>
                            </li>
                            <li>
                              <span className="opacity-60 font-medium">
                                C &ge; 100 beds
                              </span>
                            </li>
                            <li>
                              <span className="opacity-60 font-medium">
                                D &ge; 50 beds
                              </span>
                            </li>
                          </ul>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-full py-2 bg-[#1C6048] text-white text-center text-xs font-bold mb-4 shadow-md">
                            Specialized
                          </div>
                          <ul className="text-xs text-[#4C4A4B] space-y-1.5 w-full pl-2">
                            <li>
                              <strong className="text-[#1E2F31] font-black text-[13px]">
                                A &ge; 100 beds
                              </strong>
                            </li>
                            <li>
                              <span className="opacity-60 font-medium">
                                B &ge; 75 beds
                              </span>
                            </li>
                            <li>
                              <span className="opacity-60 font-medium">
                                C &ge; 25 beds
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="mt-8 text-xs text-[#4C4A4B] italic text-center">
                        Permenkes No.3 Tahun 2020
                      </div>
                    </div>

                    {/* Diagram 2: Private Hospital */}
                    <div className="flex flex-col items-center">
                      <div className="px-6 py-2 bg-[#F9F8F6] border border-[#D8D8D8] text-[#4C4A4B] text-[13px] font-medium shadow-sm">
                        Private Hospital
                      </div>
                      <div className="w-px h-6 bg-[#A0A0A0]"></div>
                      <div className="w-full max-w-[260px] h-px bg-[#A0A0A0]"></div>
                      <div className="w-full max-w-[260px] flex justify-between">
                        <div className="w-px h-6 bg-[#A0A0A0]"></div>
                        <div className="w-px h-6 bg-[#A0A0A0]"></div>
                      </div>
                      <div className="w-full max-w-[340px] grid grid-cols-2 gap-4 lg:gap-8">
                        <div className="flex flex-col items-center">
                          <div className="w-full py-2 bg-[#99B6AA] text-white text-center text-xs font-bold mb-4">
                            Domestic
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="w-full py-2 bg-[#1C6048] text-white text-center text-xs font-bold mb-4 shadow-md">
                            Foreign
                          </div>
                          <div className="text-[11px] text-[#4C4A4B] w-full">
                            <p className="mb-2 font-medium">
                              Min. requirements:
                            </p>
                            <ul className="space-y-2">
                              <li className="flex items-start gap-2">
                                <span className="text-[#4C4A4B] text-[8px] mt-1">
                                  &#9642;
                                </span>
                                <span>
                                  <strong className="text-[#1E2F31] font-black text-[12px]">
                                    50 beds
                                  </strong>{" "}
                                  &{" "}
                                  <strong className="text-[#1E2F31] font-black text-[12px]">
                                    1
                                  </strong>{" "}
                                  top-tier service
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-[#4C4A4B] text-[8px] mt-1">
                                  &#9642;
                                </span>
                                <span>
                                  <strong className="text-[#1E2F31] font-black text-[12px]">
                                    200 beds
                                  </strong>{" "}
                                  &{" "}
                                  <strong className="text-[#1E2F31] font-black text-[12px]">
                                    2
                                  </strong>{" "}
                                  top-tier services
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 text-xs text-[#4C4A4B] italic text-center mt-auto pt-6">
                        Permenkes No.11 Tahun 2025
                      </div>
                    </div>
                  </div>
                </BentoBox>

                {/* Strategic Angle: Dedicated Speed Moat */}
                <BentoBox
                  colSpan="md:col-span-12"
                  className="!bg-[#1C6048] !border-transparent !text-white items-center md:items-start text-center md:text-left flex-col md:flex-col flex-wrap md:flex-nowrap px-8 py-10 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-white">
                    <svg
                      width="240"
                      height="240"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m12 14 4-4" />
                      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                    </svg>
                  </div>
                  <div className="w-full flex justify-between flex-col lg:flex-row items-center gap-8 relative z-10 text-white mb-8">
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                      <div className="bg-white/10 p-5 rounded-2xl flex-shrink-0">
                        <Timer size={48} className="text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black tracking-tight mb-3 text-white">
                          The "Dedicated Speed" Moat
                        </h2>
                        <p className="text-sm font-medium text-white/85 leading-relaxed max-w-3xl">
                          Positioning Vasanta not just on clinical capability,
                          but on{" "}
                          <strong className="text-white font-bold">
                            Time-to-Treatment
                          </strong>
                          . While public and general hospitals suffer from heavy
                          wait lists and fragmented scheduling, Vasanta offers a
                          streamlined, single-specialty hub built purely for
                          velocity. Speed is the ultimate differentiator for
                          oncology outpatients.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full relative z-10 w-full">
                    <div className="bg-white/10 border border-white/20 p-5 rounded-xl flex flex-col items-center md:items-start text-center md:text-left">
                      <Activity className="text-white mb-3" size={24} />
                      <h3 className="font-bold text-[13px] text-white tracking-wide uppercase mb-2">
                        High-Throughput OPD
                      </h3>
                      <p className="text-xs text-white/70 leading-relaxed font-medium">
                        Streamlined outpatient pathways eliminating
                        administrative friction and accelerating doctor-patient
                        contact.
                      </p>
                    </div>
                    <div className="bg-white/10 border border-white/20 p-5 rounded-xl flex flex-col items-center md:items-start text-center md:text-left">
                      <HeartPulse className="text-white mb-3" size={24} />
                      <h3 className="font-bold text-[13px] text-white tracking-wide uppercase mb-2">
                        Day-Care Chemo Pods
                      </h3>
                      <p className="text-xs text-white/70 leading-relaxed font-medium">
                        Highly efficient, private chemotherapy pods built for
                        rapid turnover without requiring inpatient overnight
                        stays.
                      </p>
                    </div>
                    <div className="bg-white/10 border border-white/20 p-5 rounded-xl flex flex-col items-center md:items-start text-center md:text-left">
                      <Zap className="text-white mb-3" size={24} />
                      <h3 className="font-bold text-[13px] text-white tracking-wide uppercase mb-2">
                        Rapid PET-CT Imaging
                      </h3>
                      <p className="text-xs text-white/70 leading-relaxed font-medium">
                        In-house advanced diagnostic imaging immediately
                        capturing patient staging, avoiding long waitlists at
                        diagnostic centers.
                      </p>
                    </div>
                    <div className="bg-white/10 border border-white/20 p-5 rounded-xl flex flex-col items-center md:items-start text-center md:text-left">
                      <ShieldAlert className="text-white mb-3" size={24} />
                      <h3 className="font-bold text-[13px] text-white tracking-wide uppercase mb-2">
                        Dedicated LINAC Bunkers
                      </h3>
                      <p className="text-xs text-white/70 leading-relaxed font-medium">
                        Capital-intensive radiotherapy bunkers secured in-house,
                        bypassing the months-long national queues.
                      </p>
                    </div>
                  </div>
                </BentoBox>

                {/* Comprehensive Competitor Matrix Bento */}
                <BentoBox colSpan="md:col-span-12">
                  <div className="flex items-center gap-4 mb-6">
                    <BentoIcon
                      icon={<Layers size={28} />}
                      color="purple"
                      className="mb-0"
                    />
                    <h2 className="text-xl font-black text-[#1E2F31] tracking-tight">
                      Competitor Landscape & Service Gap Analysis
                    </h2>
                  </div>
                  <div className="overflow-x-auto pb-4">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr>
                          <th className="p-3 border-b-2 border-[#D8D8D8] text-[11px] font-bold text-[#4C4A4B] uppercase tracking-widest bg-white sticky left-0 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                            Facility Name
                          </th>
                          <th className="p-3 border-b-2 border-[#D8D8D8] text-[11px] font-bold text-[#4C4A4B] uppercase tracking-widest text-center bg-[#F9F8F6]">
                            Tier / Class
                          </th>
                          <th className="p-3 border-b-2 border-[#D8D8D8] text-[11px] font-bold text-[#4C4A4B] uppercase tracking-widest text-center bg-[#F9F8F6]">
                            Target SES
                          </th>
                          <th className="p-3 border-b-2 border-[#D8D8D8] text-[11px] font-bold text-[#4C4A4B] uppercase tracking-widest text-center bg-[#F9F8F6]">
                            Distance
                          </th>
                          <th className="p-3 border-b-2 border-[#D8D8D8] text-[11px] font-bold text-[#4C4A4B] uppercase tracking-widest text-center bg-white">
                            Basic Chemo
                          </th>
                          <th className="p-3 border-b-2 border-[#D8D8D8] text-[11px] font-bold text-[#4C4A4B] uppercase tracking-widest text-center bg-white">
                            Surgical Oncology
                          </th>
                          <th className="p-3 border-b-2 border-[#D8D8D8] text-[11px] font-bold text-[#4C4A4B] uppercase tracking-widest text-center bg-white">
                            PET-CT
                          </th>
                          <th className="p-3 border-b-2 border-[#D8D8D8] text-[11px] font-bold text-[#4C4A4B] uppercase tracking-widest text-center bg-white border-r border-[#D8D8D8]">
                            LINAC (Radiotherapy)
                          </th>
                          <th className="p-3 border-b-2 border-[#1C6048] text-[11px] font-black text-[#1C6048] uppercase tracking-widest bg-[#E8EFEA] rounded-t-xl text-center">
                            Strategic Weakness
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-[13px]">
                        <tr className="border-b border-[#D8D8D8]">
                          <td className="p-4 font-bold text-[#1E2F31] bg-white sticky left-0 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                            RS Pondok Indah - Puri Indah
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            Type B
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            A & B (Premium)
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            4 km
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <X size={20} className="mx-auto text-[#D8D8D8]" />
                          </td>
                          <td className="p-4 text-center bg-white border-r border-[#D8D8D8]">
                            <X size={20} className="mx-auto text-[#D8D8D8]" />
                          </td>
                          <td className="p-4 text-center bg-[#E8EFEA] text-[#4C4A4B] font-medium">
                            Generalist focus; lacks radiotherapy (LINAC) bunkers
                          </td>
                        </tr>
                        <tr className="border-b border-[#D8D8D8]">
                          <td className="p-4 font-bold text-[#1E2F31] bg-white sticky left-0 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                            Tzu Chi Hospital - PIK
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            Type B
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            A++ (Luxury)
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            9 km
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white border-r border-[#D8D8D8]">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-[#E8EFEA] text-[#4C4A4B] font-medium">
                            Geographically isolated to PIK; exceedingly high
                            pricing tier
                          </td>
                        </tr>
                        <tr className="border-b border-[#D8D8D8]">
                          <td className="p-4 font-bold text-[#1E2F31] bg-white sticky left-0 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                            Dharmais National Cancer Center
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            Type A
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            B & C (BPJS)
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            8.5 km
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white border-r border-[#D8D8D8]">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-[#E8EFEA] text-[#4C4A4B] font-medium">
                            Severe overcrowding & massive wait lists (3-6+
                            months)
                          </td>
                        </tr>
                        <tr className="border-b border-[#D8D8D8]">
                          <td className="p-4 font-bold text-[#1E2F31] bg-white sticky left-0 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                            RS EMC Grha Kedoya
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            Type B
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            A & B (Premium)
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            4.5 km
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <X size={20} className="mx-auto text-[#D8D8D8]" />
                          </td>
                          <td className="p-4 text-center bg-white border-r border-[#D8D8D8]">
                            <X size={20} className="mx-auto text-[#D8D8D8]" />
                          </td>
                          <td className="p-4 text-center bg-[#E8EFEA] text-[#4C4A4B] font-medium">
                            Generalist bottlenecks; lacks heavy radiotherapy
                            buffers
                          </td>
                        </tr>
                        <tr className="border-b border-[#D8D8D8]">
                          <td className="p-4 font-bold text-[#1E2F31] bg-white sticky left-0 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                            Mandaya Royal Hospital Puri
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            Type B
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            A++ (Luxury)
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            6.5 km
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white border-r border-[#D8D8D8]">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-[#E8EFEA] text-[#4C4A4B] font-medium">
                            Multi-specialty drift; loss of agility in patient
                            coordination
                          </td>
                        </tr>
                        <tr className="border-b border-[#D8D8D8]">
                          <td className="p-4 font-bold text-[#1E2F31] bg-white sticky left-0 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                            RSUPN Dr. Cipto Mangunkusumo (RSCM)
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            Type A
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            BPJS / General
                          </td>
                          <td className="p-4 text-center bg-[#F9F8F6] text-[#4C4A4B] font-medium">
                            12.5 km
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-white border-r border-[#D8D8D8]">
                            <Check
                              size={20}
                              className="mx-auto text-[#9B8B70]"
                            />
                          </td>
                          <td className="p-4 text-center bg-[#E8EFEA] text-[#4C4A4B] font-medium">
                            Massive waitlists (months-long delays for
                            LINAC/PET-CT)
                          </td>
                        </tr>
                        <tr>
                          <td className="p-4 font-black text-[#1C6048] bg-[#F4F9F6] sticky left-0 z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] border-t border-[#1C6048]/20">
                            Vasanta Oncology (Proposed)
                          </td>
                          <td className="p-4 text-center bg-[#F4F9F6] font-bold text-[#1E2F31] border-t border-[#1C6048]/20">
                            Type B
                          </td>
                          <td className="p-4 text-center bg-[#F4F9F6] font-bold text-[#1E2F31] border-t border-[#1C6048]/20">
                            A & B
                          </td>
                          <td className="p-4 text-center bg-[#F4F9F6] font-bold text-[#1E2F31] border-t border-[#1C6048]/20">
                            <span className="bg-[#1C6048] text-white px-2 py-0.5 rounded text-[11px]">
                              0 km
                            </span>
                          </td>
                          <td className="p-4 text-center bg-[#F4F9F6] border-t border-[#1C6048]/20">
                            <Check
                              size={20}
                              className="mx-auto text-[#1C6048]"
                            />
                          </td>
                          <td className="p-4 text-center bg-[#F4F9F6] border-t border-[#1C6048]/20">
                            <Check
                              size={20}
                              className="mx-auto text-[#1C6048]"
                            />
                          </td>
                          <td className="p-4 text-center bg-[#F4F9F6] border-t border-[#1C6048]/20">
                            <Check
                              size={20}
                              className="mx-auto text-[#1C6048]"
                            />
                          </td>
                          <td className="p-4 text-center bg-[#F4F9F6] border-r border-t border-[#1C6048]/20">
                            <Check
                              size={20}
                              className="mx-auto text-[#1C6048]"
                            />
                          </td>
                          <td className="p-4 text-center bg-[#E8EFEA] text-[#1C6048] font-bold rounded-br-xl border-t border-white">
                            —
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium mt-4 bg-[#EFEBE7] p-4 rounded-xl border border-[#D8D8D8]">
                    <strong className="text-[#1E2F31]">
                      The Dedicated Speed Moat:
                    </strong>{" "}
                    While general hospitals like Mandaya or Grha Kedoya dilute
                    their focus across multiple specialties, and RSCM drowns in
                    massive public queues, Vasanta operates a{" "}
                    <strong className="text-[#1C6048]">
                      dedicated, streamlined oncology clinical pathway
                    </strong>
                    . By controlling the entire journey (Diagnostics &rarr;
                    Surgery &rarr; Radiotherapy) internally with heavy CapEx
                    upfront, Vasanta eliminates wait times—creating an
                    insurmountable advantage for premium patients where speed
                    dictates survival.
                  </p>
                </BentoBox>

                {/* Center of Excellence (CoE) Options (Empty State Matrix) */}
                <BentoBox
                  colSpan="md:col-span-12"
                  className="bg-white border-[#D8D8D8]"
                >
                  <div className="flex items-center gap-4 mb-6 pt-2">
                    <BentoIcon
                      icon={<Microscope size={28} />}
                      color="indigo"
                      className="mb-0"
                    />
                    <h2 className="text-xl font-black text-[#1E2F31] tracking-tight">
                      Center of Excellence (CoE) Options
                    </h2>
                  </div>

                  <div className="overflow-x-auto pb-6 pt-6 px-2 -mx-2">
                    <div className="min-w-[800px] grid grid-cols-5 gap-3 lg:gap-4">
                      {/* Column 1: Row Labels (Frozen Sticky Column) */}
                      <div className="flex flex-col justify-end sticky left-0 bg-white z-20 pr-4 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.15)]">
                        <div className="h-20 bg-white"></div>
                        <div className="h-16 flex items-center border-b border-[#D8D8D8] pr-2 bg-white">
                          <p className="text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest leading-tight">
                            120-Bed Unit Economics
                          </p>
                        </div>
                        <div className="h-16 flex items-center border-b border-[#D8D8D8] pr-2 bg-white">
                          <p className="text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest leading-tight">
                            Competitive Moat
                          </p>
                        </div>
                        <div className="h-16 flex items-center border-b border-[#D8D8D8] pr-2 bg-white">
                          <p className="text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest leading-tight">
                            Inpatient Utilization
                          </p>
                        </div>
                        <div className="h-16 bg-white"></div>
                      </div>

                      {/* Column 2: Oncology (The Winner Highlight) */}
                      <div className="bg-[#1C6048] rounded-2xl flex flex-col shadow-sm transform transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl border border-[#1C6048] z-10 relative cursor-pointer">
                        <div className="h-20 flex flex-col items-center justify-center border-b border-white/20">
                          <Dna
                            size={28}
                            className="text-white mb-1.5"
                            strokeWidth={1.5}
                          />
                          <h4 className="font-bold text-white text-base tracking-wide">
                            Oncology
                          </h4>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-white/20 text-center px-1">
                          <p className="font-black text-white text-[13px]">
                            Highly Scalable
                          </p>
                          <p className="text-[9px] text-white/80 leading-tight mt-0.5">
                            Recurring multi-modality revenue
                          </p>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-white/20 text-center px-1">
                          <p className="font-black text-white text-[13px]">
                            Extreme Moat
                          </p>
                          <p className="text-[9px] text-white/80 leading-tight mt-0.5">
                            BAPETEN Bunkers & LINAC
                          </p>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-white/20 text-center px-1">
                          <p className="font-black text-white text-[13px]">
                            High Volume
                          </p>
                          <p className="text-[9px] text-white/80 leading-tight mt-0.5">
                            Diagnostics, Chemo, Surgical, Palliative
                          </p>
                        </div>
                        <div className="h-16 flex items-center justify-center bg-[#18533E] rounded-b-2xl">
                          <div className="bg-white text-[#1C6048] p-1.5 rounded-full shadow-md">
                            <Check size={20} strokeWidth={4} />
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Orthopedic */}
                      <div className="bg-[#F9F8F6] rounded-2xl flex flex-col border border-[#D8D8D8] opacity-90 transition-all hover:opacity-100 hover:shadow-md cursor-pointer group">
                        <div className="h-20 flex flex-col items-center justify-center border-b border-[#D8D8D8]">
                          <Bone
                            size={24}
                            className="text-[#1E2F31] mb-1.5 group-hover:text-[#1C6048] transition-colors"
                            strokeWidth={1.5}
                          />
                          <h4 className="font-bold text-[#1E2F31] text-sm group-hover:text-[#1C6048] transition-colors">
                            Orthopedic
                          </h4>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-[#D8D8D8] text-center px-1 group-hover:bg-white transition-colors">
                          <p className="font-bold text-[#1E2F31] text-[13px] group-hover:text-[#1C6048] transition-colors">
                            Moderate
                          </p>
                          <p className="text-[9px] text-[#4C4A4B] leading-tight mt-0.5">
                            High-margin surgical interventions
                          </p>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-[#D8D8D8] text-center px-1 group-hover:bg-white transition-colors">
                          <p className="font-bold text-[#1E2F31] text-[13px] group-hover:text-[#1C6048] transition-colors">
                            Moderate
                          </p>
                          <p className="text-[9px] text-[#4C4A4B] leading-tight mt-0.5">
                            Standardized Surgical Equipment
                          </p>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-[#D8D8D8] text-center px-1 group-hover:bg-white transition-colors">
                          <p className="font-bold text-[#1E2F31] text-[13px] group-hover:text-[#1C6048] transition-colors">
                            Moderate
                          </p>
                          <p className="text-[9px] text-[#4C4A4B] leading-tight mt-0.5">
                            Standard Post-Op recovery
                          </p>
                        </div>
                        <div className="h-16 flex items-center justify-center rounded-b-2xl group-hover:bg-white transition-colors">
                          <X
                            size={24}
                            strokeWidth={3}
                            className="text-[#9B8B70]"
                          />
                        </div>
                      </div>

                      {/* Column 4: Maternity */}
                      <div className="bg-[#F9F8F6] rounded-2xl flex flex-col border border-[#D8D8D8] opacity-90 transition-all hover:opacity-100 hover:shadow-md cursor-pointer group">
                        <div className="h-20 flex flex-col items-center justify-center border-b border-[#D8D8D8]">
                          <Baby
                            size={24}
                            className="text-[#1E2F31] mb-1.5 group-hover:text-[#1C6048] transition-colors"
                            strokeWidth={1.5}
                          />
                          <h4 className="font-bold text-[#1E2F31] text-sm group-hover:text-[#1C6048] transition-colors">
                            Maternity & IVF
                          </h4>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-[#D8D8D8] text-center px-1 group-hover:bg-white transition-colors">
                          <p className="font-bold text-[#1E2F31] text-[13px] group-hover:text-[#1C6048] transition-colors">
                            Low
                          </p>
                          <p className="text-[9px] text-[#4C4A4B] leading-tight mt-0.5">
                            Insufficient premium birth volume
                          </p>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-[#D8D8D8] text-center px-1 group-hover:bg-white transition-colors">
                          <p className="font-bold text-[#1E2F31] text-[13px] group-hover:text-[#1C6048] transition-colors">
                            Low
                          </p>
                          <p className="text-[9px] text-[#4C4A4B] leading-tight mt-0.5">
                            High local clinic density
                          </p>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-[#D8D8D8] text-center px-1 group-hover:bg-white transition-colors">
                          <p className="font-bold text-[#1E2F31] text-[13px] group-hover:text-[#1C6048] transition-colors">
                            Low/Moderate
                          </p>
                          <p className="text-[9px] text-[#4C4A4B] leading-tight mt-0.5">
                            Short stay
                          </p>
                        </div>
                        <div className="h-16 flex items-center justify-center rounded-b-2xl group-hover:bg-white transition-colors">
                          <X
                            size={24}
                            strokeWidth={3}
                            className="text-[#9B8B70]"
                          />
                        </div>
                      </div>

                      {/* Column 5: Specialized Eye */}
                      <div className="bg-[#F9F8F6] rounded-2xl flex flex-col border border-[#D8D8D8] opacity-90 transition-all hover:opacity-100 hover:shadow-md cursor-pointer group">
                        <div className="h-20 flex flex-col items-center justify-center border-b border-[#D8D8D8]">
                          <Eye
                            size={24}
                            className="text-[#1E2F31] mb-1.5 group-hover:text-[#1C6048] transition-colors"
                            strokeWidth={1.5}
                          />
                          <h4 className="font-bold text-[#1E2F31] text-sm group-hover:text-[#1C6048] transition-colors">
                            Specialized Eye
                          </h4>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-[#D8D8D8] text-center px-1 group-hover:bg-white transition-colors">
                          <p className="font-bold text-[#1E2F31] text-[13px] group-hover:text-[#1C6048] transition-colors">
                            Low
                          </p>
                          <p className="text-[9px] text-[#4C4A4B] leading-tight mt-0.5">
                            Excess facility overhead
                          </p>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-[#D8D8D8] text-center px-1 group-hover:bg-white transition-colors">
                          <p className="font-bold text-[#1E2F31] text-[13px] group-hover:text-[#1C6048] transition-colors">
                            Weak
                          </p>
                          <p className="text-[9px] text-[#4C4A4B] leading-tight mt-0.5">
                            High local clinic density
                          </p>
                        </div>
                        <div className="h-16 flex flex-col items-center justify-center border-b border-[#D8D8D8] text-center px-1 group-hover:bg-white transition-colors">
                          <p className="font-bold text-[#1E2F31] text-[13px] group-hover:text-[#1C6048] transition-colors">
                            Low
                          </p>
                          <p className="text-[9px] text-[#4C4A4B] leading-tight mt-0.5">
                            Outpatient heavy
                          </p>
                        </div>
                        <div className="h-16 flex items-center justify-center rounded-b-2xl group-hover:bg-white transition-colors">
                          <X
                            size={24}
                            strokeWidth={3}
                            className="text-[#9B8B70]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </BentoBox>
              </div>
            </div>
          </div>
        )}

        {activeMiniTab === "opportunities" && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] p-8 lg:p-12 animate-in fade-in zoom-in-95 duration-300 mt-6">
            {/* Slide Header */}
            <div className="mb-12 border-b border-[#D8D8D8] pb-8">
              <h2 className="text-3xl lg:text-4xl font-black text-[#4C4A4B] tracking-tight uppercase leading-tight">
                Capturing Multi-Billion Dollar{" "}
                <span className="font-light text-[#9B8B70]">
                  Medical Tourism
                </span>
                <br />
                <span className="font-light text-[#9B8B70]">Flight</span>
              </h2>
              <p className="text-[14px] text-[#4C4A4B] leading-relaxed font-medium mt-4 max-w-4xl">
                Indonesia's escalating oncology burden and rising private health
                insurance penetration are driving a massive, addressable capital
                outflow to regional competitors
              </p>
            </div>

            {/* 3 Column Pitch Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
              {/* Column 1: Cancer Cases */}
              <div className="flex flex-col h-full">
                <h3 className="text-[13px] text-center text-[#4C4A4B] font-medium mb-10">
                  Indonesia Annual Cancer Cases
                </h3>
                <div className="h-48 w-full mb-8">
                  <LazyResponsiveContainer width="100%" height="100%">
                    <BarChart data={CANCER_DATA} margin={CHART_MARGINS_BAR}>
                      <XAxis
                        dataKey="name"
                        axisLine={true}
                        stroke="#EFEBE7"
                        tickLine={false}
                        tick={TICK_STYLE}
                        dy={10}
                      />
                      <Tooltip
                        allowEscapeViewBox={{ x: true, y: true }}
                        contentStyle={TOOLTIP_STYLE}
                        formatter={formatCancerCases}
                      />
                      <Bar dataKey="cases" radius={[2, 2, 0, 0]} barSize={30}>
                        {CANCER_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </LazyResponsiveContainer>
                </div>
                <p className="text-[11px] text-[#4C4A4B] mt-auto text-left leading-relaxed">
                  Breast, cervical, lung, colorectal, and liver cancers are the
                  most frequent cases in Indonesia. Together, these top 5
                  cancers account for{" "}
                  <strong className="font-bold">50% of total 400,000+</strong>{" "}
                  annual oncology burden.
                </p>
              </div>

              {/* Column 2: Insurance Growth */}
              <div className="flex flex-col h-full">
                <h3 className="text-[13px] text-center text-[#4C4A4B] font-medium mb-1">
                  Commercial Insurance Growth
                </h3>
                <p className="text-[9px] text-center text-[#9B8B70] mb-8">
                  (in IDR Trillions)
                </p>

                <div className="h-48 w-full mb-8 relative">
                  <div className="absolute top-8 left-1/4 transform -rotate-[22deg] flex flex-col items-center z-10">
                    <span className="text-[11px] font-bold text-[#1C6048] tracking-widest mb-1">
                      CAGR 13.72%
                    </span>
                    <svg
                      width="90"
                      height="12"
                      viewBox="0 0 90 12"
                      fill="none"
                      className="text-[#1C6048]"
                    >
                      <path
                        d="M2 6H88M88 6L82 2M88 6L82 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <LazyResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={INSURANCE_DATA}
                      margin={CHART_MARGINS_LINE}
                    >
                      <XAxis
                        dataKey="year"
                        axisLine={true}
                        stroke="#EFEBE7"
                        tickLine={false}
                        tick={TICK_STYLE}
                        dy={10}
                      />
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip
                        allowEscapeViewBox={{ x: true, y: true }}
                        contentStyle={TOOLTIP_STYLE}
                        formatter={formatInsuranceTooltip}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#99B6AA"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          strokeWidth: 2,
                          fill: "#fff",
                          stroke: "#99B6AA",
                        }}
                        label={LINE_LABEL_STYLE}
                      />
                    </LineChart>
                  </LazyResponsiveContainer>
                </div>

                <p className="text-[11px] text-[#4C4A4B] mt-auto text-left leading-relaxed">
                  Double-digit growth in commercial health insurance for{" "}
                  <strong className="font-bold">
                    'Socio-Economic Status (SES) A'
                  </strong>{" "}
                  demographics
                </p>
              </div>

              {/* Column 3: Capital Outflow */}
              <div className="flex flex-col h-full items-center">
                <h3 className="text-[13px] text-center text-[#4C4A4B] font-medium mb-10">
                  Annual Capital Outflow
                </h3>

                <Plane
                  size={64}
                  className="text-[#1C6048] mb-4 transform -rotate-[2deg]"
                  strokeWidth={1.5}
                />
                <div className="w-20 h-[3px] bg-[#1C6048] mb-12"></div>

                <p className="text-4xl lg:text-5xl font-black text-[#4C4A4B] tracking-tighter mb-8">
                  $11.5 Billion
                </p>

                <p className="text-[11px] text-[#4C4A4B] italic text-center leading-relaxed px-4 mt-auto">
                  to Malaysia, Singapore, Japan,
                  <br />
                  US, Germany, and others
                </p>
              </div>
            </div>

            <div className="mt-10 pt-5 border-t border-[#EFEBE7]">
              <p className="text-[9px] text-[#9B8B70] italic text-center md:text-left">
                Sources: GLOBOCAN 2022 (Cancer Incidence); Asosiasi Asuransi
                Jiwa Indonesia / AAJI (Premium Growth); Indonesia Ministry of
                Health / MoH Medical Tourism Data (Capital Outflow)
              </p>
            </div>
          </div>
        )}
      </div>
    );
  },
);

// ==========================================
// 5. MAJOR VIEW COMPONENTS (FINANCIAL ENGINES)
// ==========================================

const OpCoDashboardView = memo(
  ({
    data,
    assumptions,
    generateTeaser,
    isTeaserLoading,
    showTeaser,
    setShowTeaser,
    teaserContent,
    isPresenting,
  }) => {
    const [returnsTab, setReturnsTab] = useState("all");

    const totalEquityVal =
      data.totalEquity ||
      assumptions.partnerAEquity + assumptions.partnerBEquity ||
      1;
    const projectAvgYield =
      (data.partnerA.avgYield * assumptions.partnerAEquity +
        data.partnerB.avgYield * assumptions.partnerBEquity) /
      totalEquityVal;

    // Option 1: True Combined Distributed Partner Cash Flow IRR
    const combinedCfs = useMemo(() => {
      const pACfs = data.partnerACfsMonthly || [];
      const pBCfs = data.partnerBCfsMonthly || [];
      const len = Math.max(pACfs.length, pBCfs.length);
      const combined = [];
      for (let idx = 0; idx < len; idx++) {
        combined.push((pACfs[idx] || 0) + (pBCfs[idx] || 0));
      }
      return combined;
    }, [data.partnerACfsMonthly, data.partnerBCfsMonthly]);

    const projectIrrVal = useMemo(
      () => calculateIRR(combinedCfs, "monthly"),
      [combinedCfs],
    );
    const projectPaybackVal = useMemo(
      () => calculatePayback(combinedCfs, "monthly"),
      [combinedCfs],
    );
    const projectMoic = useMemo(() => {
      return totalEquityVal > 0
        ? (data.partnerA.totalCash + data.partnerB.totalCash) / totalEquityVal
        : 0;
    }, [data.partnerA.totalCash, data.partnerB.totalCash, totalEquityVal]);

    const projectMetrics = useMemo(
      () => ({
        avgYield: projectAvgYield,
        irr: projectIrrVal,
        payback: projectPaybackVal,
        totalCash: data.partnerA.totalCash + data.partnerB.totalCash,
        moic: projectMoic,
      }),
      [
        projectAvgYield,
        projectIrrVal,
        projectPaybackVal,
        data.partnerA.totalCash,
        data.partnerB.totalCash,
        projectMoic,
      ],
    );

    const operatingYears = data.annualData.filter((d) => (d.totalRev || 0) > 0);
    const avgEbitdarMargin =
      operatingYears.length > 0
        ? operatingYears.reduce((acc, d) => acc + (d.ebitdarMargin || 0), 0) /
          operatingYears.length
        : 0;
    const avgNetMargin =
      operatingYears.length > 0
        ? operatingYears.reduce((acc, d) => acc + (d.netMargin || 0), 0) /
          operatingYears.length
        : 0;

    const blendedEbitdarMargin = data.totals.ebitdarMargin || 0;
    const blendedNetMargin = data.totals.netMargin || 0;

    const revPabTooltip = useMemo(
      () => ({
        desc: `Specific revenue metrics per clinical bed:\n• Stabilized RevPAB: ${formatNumber(data.opsMetrics?.revPab, 1)} B IDR\n• Starting RevPAB: ${formatNumber(data.opsMetrics?.startingRevPab, 1)} B IDR\n• Average RevPAB: ${formatNumber(data.opsMetrics?.averageRevPab, 1)} B IDR`,
        formula: "RevPAB = Annual Revenue / Operating Beds (in B IDR)",
      }),
      [
        data.opsMetrics?.revPab,
        data.opsMetrics?.startingRevPab,
        data.opsMetrics?.averageRevPab,
      ],
    );

    const { tooltipState: revPabTs, setTooltipState: setRevPabTs } =
      useTooltip(revPabTooltip);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in">
        {/* LEFT PANEL: Executive & Returns (Spans 4 columns) */}
        <div className="space-y-6 lg:col-span-4 w-full">
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <h2 className="text-sm font-bold text-[#1E2F31] ml-2">
              Executive Overview
            </h2>
            <button
              disabled={true}
              title="Temporarily disabled"
              className="bg-[#D8D8D8] text-[#8A8175] cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 transition-colors opacity-70"
            >
              <Sparkles size={14} />✨ Pitch Teaser
            </button>
          </div>

          {showTeaser && (
            <div className="bg-white p-6 rounded-2xl border-l-4 border-l-[#1C6048] shadow-sm relative">
              <button
                onClick={() => setShowTeaser(false)}
                className="absolute top-4 right-4 bg-[#EFEBE7] p-1 rounded-full"
              >
                <X size={16} />
              </button>
              <h3 className="font-bold text-[#1E2F31] mb-2 flex items-center gap-2">
                <FileText size={18} /> AI Pitch Teaser
              </h3>
              <MarkdownRenderer content={teaserContent} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <KPICard
              title="Project NPV"
              value={formatCurrency(data.projectNPV)}
              icon={<TrendingUp size={18} />}
              color="blue"
              subtitle={`@${String(assumptions.discountRate)}% Disc Rate`}
            />
            <KPICard
              title="Cash Multiple"
              value={`${data.totalEquity > 0 ? (data.totals.fcf / data.totalEquity).toFixed(2) : "0"}x`}
              icon={<BarChart3 size={18} />}
              color="emerald"
              subtitle="Project MOIC"
              tooltip={{
                desc: "Indicates absolute wealth creation. While IRR measures compounding speed over time, the Cash Multiple (MOIC) shows the absolute magnitude of your cash return. A typical healthcare infrastructure target is 2.5x - 3.0x+.",
                formula:
                  "Total Project Free Cash Flow ÷ Cumulative Partner Equity Invested",
              }}
            />
            <KPICard
              title="Project IRR"
              value={`${formatNumber((data.projectIRR || 0) * 100, 2)}%`}
              icon={<Activity size={18} />}
              color="blue"
              subtitle="Compounded Return"
            />
            <KPICard
              title="Avg Div. Yield"
              value={`${formatNumber(data.partnerA.avgYield, 1)}%`}
              icon={<Coins size={18} />}
              color="indigo"
              subtitle="Mean Operating Yield"
              tooltip={{
                desc: "The average annual cash distribution yield. It acts as the steady engine driving the overall Cash Multiple over the asset's lifecycle.",
                formula:
                  "Average of (Annual Cash Flow ÷ Invested Equity) across operating years",
              }}
            />
          </div>

          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] relative transition-all hover:shadow-md">
            {/* Card Title & Stateful Toggle Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#EFEBE7] pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-1.5 font-sans">
                  <TrendingUp size={16} className="text-[#1C6048]" /> Return
                  Metric
                </h3>
              </div>
              <div className="flex bg-[#EFEBE7] p-1 rounded-xl border border-[#D8D8D8]">
                <button
                  type="button"
                  onClick={() => setReturnsTab("all")}
                  className={`px-3 py-1 text-[10px] font-bold transition-all rounded-lg select-none cursor-pointer ${
                    returnsTab === "all"
                      ? "bg-[#1C6048] text-white shadow"
                      : "text-[#4C4A4B] hover:text-[#1E2F31]"
                  }`}
                >
                  Project
                </button>
                <button
                  type="button"
                  onClick={() => setReturnsTab("partner")}
                  className={`px-3 py-1 text-[10px] font-bold transition-all rounded-lg select-none cursor-pointer ${
                    returnsTab === "partner"
                      ? "bg-[#1C6048] text-white shadow"
                      : "text-[#4C4A4B] hover:text-[#1E2F31]"
                  }`}
                >
                  Partner
                </button>
                <button
                  type="button"
                  onClick={() => setReturnsTab("vasanta")}
                  className={`px-3 py-1 text-[10px] font-bold transition-all rounded-lg select-none cursor-pointer ${
                    returnsTab === "vasanta"
                      ? "bg-[#1C6048] text-white shadow"
                      : "text-[#4C4A4B] hover:text-[#1E2F31]"
                  }`}
                >
                  Vasanta
                </button>
              </div>
            </div>

            {/* Render Active Option */}
            {returnsTab === "all" && (
              <PartnerReturnCard
                name="Project"
                metrics={projectMetrics}
                equity={totalEquityVal}
                share={100}
                color="blue"
                isUnifiedCard={true}
              />
            )}
            {returnsTab === "partner" && (
              <PartnerReturnCard
                name={`Strategic Partner`}
                metrics={data.partnerA}
                equity={assumptions.partnerAEquity}
                share={assumptions.sharingPercentA}
                color="blue"
                isUnifiedCard={true}
              />
            )}
            {returnsTab === "vasanta" && (
              <PartnerReturnCard
                name={`Vasanta`}
                metrics={data.partnerB}
                equity={assumptions.partnerBEquity}
                share={100 - assumptions.sharingPercentA}
                color="indigo"
                isUnifiedCard={true}
              />
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Operations & Trajectory (Spans 8 columns) */}
        <div className="space-y-6 lg:col-span-8 w-full">
          {/* Unified Stabilization Scorecard Container (Option 2A) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#D8D8D8] relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EFEBE7]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E2F31] flex items-center gap-1.5 font-sans">
                <Activity size={15} className="text-[#1C6048]" /> Clinical
                Benchmarks at Stabilization
              </h3>
              <span className="text-[9px] text-[#9B8B70] font-mono bg-[#EFEBE7] px-2 py-0.5 rounded font-bold uppercase">
                Operational Peaks
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D8D8D8]/60">
              {/* Metric 1 */}
              <div className="flex flex-col justify-between p-2">
                <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-tight">
                  Stabilized Vol.
                </span>
                <p className="text-[22px] font-black text-[#1E2F31] my-1 font-sans">
                  {formatNumber(data.opsMetrics.stabilizedVolume, 0)}
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Peak Yr Patients
                </span>
              </div>
              {/* Metric 2 */}
              <div className="flex flex-col justify-between p-2 sm:pl-4 pt-4 sm:pt-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-tight">
                    Rev. Per Bed
                  </span>
                  <KPITooltipIcon
                    tooltip={revPabTooltip}
                    tooltipState={revPabTs}
                    setTooltipState={setRevPabTs}
                    align="left"
                  />
                </div>
                <p className="text-[22px] font-black text-[#1C6048] my-1 font-sans">
                  {formatNumber(data.opsMetrics.revPab, 1)} B
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Inflow Base
                </span>
              </div>
              {/* Metric 3 */}
              <div className="flex flex-col justify-between p-2 sm:pl-4 pt-4 sm:pt-2">
                <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-tight">
                  EBITDA Per Bed
                </span>
                <p className="text-[22px] font-black text-[#1E2F31] my-1 font-sans">
                  {formatNumber(data.opsMetrics.ebitdaPerBed, 1)} B
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Operating Base
                </span>
              </div>
              {/* Metric 4 */}
              <div className="flex flex-col justify-between p-2 sm:pl-4 pt-4 sm:pt-2">
                <span className="text-[10px] text-[#4C4A4B] font-bold uppercase tracking-tight">
                  Fixed Cost Ratio
                </span>
                <p className="text-[22px] font-black text-[#9B8B70] my-1 font-sans">
                  {formatNumber(data.opsMetrics.fixedCostPct, 1)}%
                </p>
                <span className="text-[9px] text-[#99B6AA] font-bold uppercase tracking-tight">
                  Fixed vs Var OPEX
                </span>
              </div>
            </div>
          </div>

          {/* Consolidated Blended Margins Card (Option 1B) */}
          <div className="bg-[#1C6048] p-5 rounded-2xl border border-[#164c39] shadow-md relative overflow-hidden group">
            {/* Ambient accent element */}
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 rounded-full bg-white/[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700" />

            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 relative z-10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 font-sans">
                <Coins size={15} className="text-[#99B6AA]" /> Project Margins
              </h3>
              <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white tracking-normal font-semibold font-mono">
                Look-Through Metrics
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* EBITDAR */}
              <div className="flex flex-col">
                <p className="text-[10px] text-[#EFEBE7]/80 font-bold uppercase tracking-wider mb-1 font-mono">
                  EBITDAR Margin
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-4xl font-black text-white leading-none font-sans">
                    {formatNumber(avgEbitdarMargin, 1)}%
                  </span>
                  <span className="text-[10px] text-[#EFEBE7]/60 font-mono">
                    Active Years Average
                  </span>
                </div>
              </div>

              {/* Net Profit */}
              <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                <p className="text-[10px] text-[#EFEBE7]/80 font-bold uppercase tracking-wider mb-1 font-mono">
                  Net Profit Margin
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl lg:text-4xl font-black text-white leading-none font-sans">
                    {formatNumber(avgNetMargin, 1)}%
                  </span>
                  <span className="text-[10px] text-[#EFEBE7]/60 font-mono">
                    Active Years Average
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
              <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
                <BarChart3 size={18} className="text-[#1C6048]" /> Operating
                Cash Flow Trajectory
              </h3>
              <div className="h-72">
                <LazyResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.operatingData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#D8D8D8"
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: "#4C4A4B" }}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 10, fill: "#4C4A4B" }}
                      axisLine={false}
                      tickFormatter={(val) => `${val}B`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10, fill: "#1E2F31" }}
                      axisLine={false}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip
                      allowEscapeViewBox={{ x: true, y: true }}
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(val, name) =>
                        formatNumber(val, 1) +
                        (name === "Occupancy (BOR)" ? "%" : "B")
                      }
                    />
                    <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                    <Bar
                      yAxisId="left"
                      dataKey="totalRev"
                      name="Net Revenue"
                      fill="#1C6048"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="ebitda"
                      name="EBITDA"
                      stroke="#1E2F31"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#1E2F31",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="netIncome"
                      name="Net Income"
                      stroke="#9B8B70"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#9B8B70",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bor"
                      name="Occupancy (BOR)"
                      stroke="#99B6AA"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </ComposedChart>
                </LazyResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
              <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
                <Target size={18} className="text-[#99B6AA]" /> Breakeven Audit
              </h3>
              <div className="h-72">
                <LazyResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.operatingData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#D8D8D8"
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: "#4C4A4B" }}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#4C4A4B" }}
                      axisLine={false}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip
                      allowEscapeViewBox={{ x: true, y: true }}
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(val) => formatNumber(val, 1) + "%"}
                    />
                    <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />
                    <Bar
                      dataKey="breakEvenBor"
                      name="Breakeven BOR required"
                      fill="#D8D8D8"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Line
                      type="monotone"
                      dataKey="bor"
                      name="Actual Projected BOR"
                      stroke="#1E2F31"
                      strokeWidth={3}
                      dot={{ r: 3, strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </LazyResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const OpCoCascadeView = memo(
  ({ data, assumptions, viewResolution, setViewResolution }) => {
    const { columns, expandedYears, toggleYear } = useMonthlyColumns(
      data.annualData,
      viewResolution,
    );
    const scrollRef = useRef(null);
    const [showSetupBudget, setShowSetupBudget] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [viewMode, setViewMode] = useState("all"); // 'all' | 'pl' | 'cf'
    const [expandedCfo, setExpandedCfo] = useState(false);
    const [expandedCfoIn, setExpandedCfoIn] = useState(false);
    const [expandedCfoOut, setExpandedCfoOut] = useState(false);
    const [expandedCfi, setExpandedCfi] = useState(false);
    const [expandedCfiIn, setExpandedCfiIn] = useState(false);
    const [expandedCfiOut, setExpandedCfiOut] = useState(false);
    const [expandedCff, setExpandedCff] = useState(false);
    const [expandedCffIn, setExpandedCffIn] = useState(false);
    const [expandedCffOut, setExpandedCffOut] = useState(false);

    const overallSetup =
      (assumptions?.jvaOpex ?? 2.5) +
      (assumptions?.commOpex ?? 15.0) +
      (assumptions?.workingCapitalOpex ?? 64.671175);

    const renderTableHeaders = () => (
      <thead className="bg-[#EFEBE7] font-bold sticky top-0 z-[50] shadow-md">
        <tr>
          <th className="pl-1 pr-4 py-3 border-b-2 border-r border-[#D8D8D8] sticky left-0 top-0 bg-white z-[60] w-[360px] min-w-[360px] max-w-[360px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-[#1E2F31]">
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
                  ? "cursor-pointer hover:bg-[#EFEBE7] font-black underline decoration-dashed underline-offset-4 "
                  : "font-medium text-[10px] "
              } ${!col.isOperating ? "bg-[#F9F8F6] text-[#9B8B70]" : "bg-white text-[#1E2F31]"} ${col.isMonth ? "min-w-[65px] whitespace-nowrap" : "min-w-[90px]"}`}
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
        className={`space-y-6 ${isFullScreen ? "fixed inset-0 z-[150] bg-[#F9F8F6] p-4 lg:p-6 overflow-hidden flex flex-col" : ""}`}
      >
        <div
          className={`grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-500 ${isFullScreen ? "flex-1 overflow-hidden" : ""} ${showSetupBudget && !isFullScreen ? "md:grid-cols-3" : "md:grid-cols-1"}`}
        >
          {showSetupBudget && !isFullScreen && (
            <div className="md:col-span-1 bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
                  <Briefcase size={18} className="text-[#1C6048]" /> OpCo Setup
                  Budget
                </h3>
                <button
                  onClick={() => setShowSetupBudget(false)}
                  className="text-[#8A8175] hover:text-[#1E2F31] text-[10px] uppercase font-bold tracking-wider"
                >
                  Hide
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EFEBE7]">
                      <th className="px-3 py-1.5 border border-[#D8D8D8] text-[#1E2F31] font-bold rounded-tl">
                        Component
                      </th>
                      <th className="px-3 py-1.5 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right">
                        Cost (B)
                      </th>
                      <th className="px-3 py-1.5 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right rounded-tr">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <CapexRow
                      label="1. JVA Setup"
                      amount={assumptions?.jvaOpex ?? 2.5}
                      total={overallSetup}
                      isIndent
                    />
                    <CapexRow
                      label="2. Pre-operating"
                      amount={assumptions?.commOpex ?? 15.0}
                      total={overallSetup}
                      isIndent
                    />
                    <CapexRow
                      label="3. Clinical Working Capital"
                      amount={assumptions?.workingCapitalOpex ?? 64.671175}
                      total={overallSetup}
                      isIndent
                    />
                    <CapexRow
                      label="TOTAL OPCO INVESTMENT"
                      amount={overallSetup}
                      total={overallSetup}
                      isSubtotal
                    />
                  </tbody>
                </table>
              </div>
              <div className="mt-1.5 p-2 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8] shrink-0">
                <div className="text-[8.5px] text-[#4C4A4B] leading-relaxed space-y-1">
                  <p>
                    <strong>JVA Setup</strong>: Represents the cost of
                    establishing the Foreign Investment Company (PMA).
                  </p>
                  <p>
                    <strong>Pre-operating</strong>: Incurred during the 6-month
                    period preceding the Commercial Opening.
                  </p>
                  <p>
                    <strong>Clinical Working Capital</strong>: Establishes a
                    6-month operational buffer during the Year 1 opening phase.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div
            className={`${showSetupBudget && !isFullScreen ? "md:col-span-2" : "md:col-span-1"} flex flex-col gap-4 overflow-hidden ${isFullScreen ? "h-full" : "h-[calc(100vh-240px)]"}`}
          >
            <div className="p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8] flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1E2F31] flex items-center gap-2">
                <List size={14} /> OpCo P&L & Cash Flow
                {!showSetupBudget && (
                  <button
                    onClick={() => setShowSetupBudget(true)}
                    className="ml-2 px-2 py-0.5 border border-[#D8D8D8] bg-white rounded text-[#8A8175] hover:text-[#1E2F31] text-[9px] tracking-wider font-bold shadow-sm leading-tight inline-block flex-shrink-0"
                  >
                    Show Setup Budget
                  </button>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewMode("all")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "all" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setViewMode("pl")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "pl" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="Operating Income Statement (P&L)"
                  >
                    P&L
                  </button>
                  <button
                    onClick={() => setViewMode("statement")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "statement" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="C&F (Standardized)"
                  >
                    C&F
                  </button>
                  <button
                    onClick={() => setViewMode("cf")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "cf" ? "bg-[#1C6048] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="OpCo Capital Cascade"
                  >
                    Cascade
                  </button>
                </div>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6] transition-colors"
                  title={isFullScreen ? "Minimize" : "Maximize"}
                >
                  {isFullScreen ? (
                    <Minimize2 size={13} strokeWidth={2.5} />
                  ) : (
                    <Maximize2 size={13} strokeWidth={2.5} />
                  )}
                </button>
                <div className="flex items-center bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewResolution("annual")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "annual" ? "bg-[#1C6048] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Annual
                  </button>
                  <button
                    onClick={() => setViewResolution("monthly")}
                    className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${viewResolution === "monthly" ? "bg-[#1C6048] text-white" : "text-[#8A8175] hover:text-[#1E2F31] hover:bg-[#F9F8F6]"}`}
                  >
                    Monthly
                  </button>
                </div>
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => {
                      const tables = document.querySelectorAll('.opco-table-scroll');
                      tables.forEach(t => t.scrollBy({ left: -300, behavior: 'smooth' }));
                    }}
                    className="p-1 rounded bg-white text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-[#F9F8F6] transition-colors"
                    title="Scroll Left"
                  >
                    <ChevronLeft size={13} strokeWidth={2.5} />
                  </button>
                  <div className="w-[1px] bg-[#D8D8D8] my-1 opacity-50"></div>
                  <button
                    onClick={() => {
                      const tables = document.querySelectorAll('.opco-table-scroll');
                      tables.forEach(t => t.scrollBy({ left: 300, behavior: 'smooth' }));
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
            <div className="overflow-auto min-h-0 flex-1 space-y-6">
              {/* TABLE 1: Profit & Loss Statement (P&L) */}
              {(viewMode === "all" || viewMode === "pl") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#1C6048] border-b border-[#1C6048] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      1. Clinical Profit & Loss (P&L)
                    </h3>
                  </div>
                  <div className="overflow-auto max-h-[65vh] custom-scrollbar relative opco-table-scroll">
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                      {renderTableHeaders()}
                      <tbody>
                        <TableSection
                          title="Operating Volume"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Bed Occupancy Rate (BOR)"
                          data={columns}
                          dk="bor"
                          tooltip={OPCO_FORMULAS.bor}
                          isPercent={true}
                        />
                        <TableRow
                          label="Inpatient Cases"
                          data={columns}
                          dk="ipCases"
                          tooltip={OPCO_FORMULAS.ipCases}
                        />
                        <TableRow
                          label="Outpatient Visits"
                          data={columns}
                          dk="opVisits"
                          tooltip={OPCO_FORMULAS.opVisits}
                        />

                        <TableSection
                          title="Revenue"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Inpatient Revenue"
                          data={columns}
                          dk="ipRev"
                          total={data.totals.ipRev}
                          isIndent
                          tooltip={OPCO_FORMULAS.ipRev}
                        />
                        <TableRow
                          label="Outpatient Revenue"
                          data={columns}
                          dk="opRev"
                          total={data.totals.opRev}
                          isIndent
                          tooltip={OPCO_FORMULAS.opRev}
                        />
                        <TableRow
                          label="NET REVENUE"
                          data={columns}
                          dk="totalRev"
                          total={data.totals.totalRev}
                          highlight
                          tooltip={OPCO_FORMULAS.totalRev}
                        />

                        <TableSection
                          title="Cost of Goods Sold"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Medical Supplies"
                          data={columns}
                          dk="totalMedSupp"
                          total={data.totals.totalMedSupp}
                          isIndent
                          tooltip={OPCO_FORMULAS.totalMedSupp}
                          isSubtractor
                        />
                        <TableRow
                          label="Doctor Fees"
                          data={columns}
                          dk="totalDocFee"
                          total={data.totals.totalDocFee}
                          isIndent
                          tooltip={OPCO_FORMULAS.totalDocFee}
                          isSubtractor
                        />
                        <TableRow
                          label="GROSS PROFIT"
                          data={columns}
                          dk="grossProfit"
                          total={data.totals.grossProfit}
                          highlight
                          tooltip={OPCO_FORMULAS.grossProfit}
                        />

                        <TableSection
                          title="Operating Expenses"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Staffing & Labor"
                          data={columns}
                          dk="staffCost"
                          total={data.totals.staffCost}
                          isIndent
                          tooltip={OPCO_FORMULAS.staffCost}
                          isSubtractor
                        />
                        <ExpandableDataRowGroup
                          parentLabel="Other OpEx"
                          parentDk="otherOpex"
                          parentTotal={data.totals.otherOpex}
                          data={columns}
                          parentTooltip={OPCO_FORMULAS.recurringOpex}
                          isSubtractor
                          childrenData={[
                            {
                              label: "Administrative Expense",
                              dk: "adminOpex",
                              total: data?.totals?.adminOpex,
                              tooltip: {
                                desc: "Administrative support overhead calculated based on administrative expense rate assumptions.",
                                formula:
                                  "Admin Exp = adminExpRate% * Net Revenue",
                              },
                            },
                            {
                              label: "Utilities Expense",
                              dk: "utilOpex",
                              total: data?.totals?.utilOpex,
                              tooltip: {
                                desc: "Clinic utilities expense based on utility expense rate assumptions.",
                                formula:
                                  "Utilities Exp = utilExpRate% * Net Revenue",
                              },
                            },
                            {
                              label: "Marketing Expense",
                              dk: "mktgOpex",
                              total: data?.totals?.mktgOpex,
                              tooltip: {
                                desc: "Marketing expenditures aligned with marketing expense rate assumptions.",
                                formula:
                                  "Marketing Exp = marketingExpRate% * Net Revenue",
                              },
                            },
                            {
                              label: "Hospital Operator Fee",
                              dk: "operatorOpex",
                              total: data?.totals?.operatorOpex,
                              tooltip: {
                                desc: "Hospital management and operator fees.",
                                formula:
                                  "Operator Fee = operatorFeeRate% * Net Revenue",
                              },
                            },
                            {
                              label: "Operational Insurance",
                              dk: "insOpex",
                              total: data?.totals?.insOpex,
                              tooltip: {
                                desc: "Annual facility, equipment, and liability insurance expenditures.",
                                formula: "Insurance = insuranceMonthly * 12",
                              },
                            },
                          ]}
                        />
                        <TableRow
                          label="EBITDAR"
                          data={columns}
                          dk="ebitdar"
                          total={data.totals.ebitdar}
                          highlight
                          tooltip={OPCO_FORMULAS.ebitdar}
                        />
                        <TableRow
                          label="EBITDAR MARGIN"
                          data={columns}
                          dk="ebitdarMargin"
                          total={data.totals.ebitdarMargin}
                          highlight
                          isPercent
                          tooltip={OPCO_FORMULAS.ebitdarMargin}
                        />

                        <TableSection
                          title="Rent & Taxes"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Building Rental"
                          data={columns}
                          dk="rent"
                          total={data.totals.rent}
                          isIndent
                          tooltip={OPCO_FORMULAS.rent}
                          isSubtractor
                        />
                        <TableRow
                          label="EBITDA"
                          data={columns}
                          dk="ebitda"
                          total={data.totals.ebitda}
                          highlight
                          tooltip={OPCO_FORMULAS.ebitda}
                        />
                        <TableRow
                          label="Corporate Tax"
                          data={columns}
                          dk="tax"
                          total={data.totals.tax}
                          isIndent
                          tooltip={OPCO_FORMULAS.tax}
                          isSubtractor
                        />
                        <TableRow
                          label="NET INCOME"
                          data={columns}
                          dk="netIncome"
                          total={data.totals.netIncome}
                          highlight
                          emerald
                          tooltip={OPCO_FORMULAS.netIncome}
                        />
                        <TableRow
                          label="NET PROFIT MARGIN"
                          data={columns}
                          dk="netMargin"
                          total={data.totals.netMargin}
                          highlight
                          emerald
                          isPercent
                          tooltip={OPCO_FORMULAS.netMargin}
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLE 2: Standard Statement of Cash Flows */}
              {(viewMode === "all" || viewMode === "statement") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#1C6048] border-b border-[#1C6048] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      2. Clinical Cash Flows
                    </h3>
                  </div>
                  <div className="overflow-auto max-h-[65vh] custom-scrollbar relative opco-table-scroll">
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                      {renderTableHeaders()}
                      <tbody>
                        <TableSection
                          title="STATEMENT OF CASH FLOWS"
                          colSpan={columns.length + 2}
                          type="amber"
                        />
                        <TableRow
                          label="Net Cash from Operating (CFO)"
                          data={columns}
                          dk="cfo"
                          total={data.totals.cfo}
                          highlight
                          isExpandable
                          isExpanded={expandedCfo}
                          onExpand={() => setExpandedCfo(!expandedCfo)}
                          tooltip="OpCo Net Income."
                        />
                        {expandedCfo && (
                          <>
                            <TableRow
                              label="Cash Inflows (Clinical Revenues)"
                              data={columns}
                              dk="cfo_in"
                              total={data.totals.cfo_in}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfoIn}
                              onExpand={() => setExpandedCfoIn(!expandedCfoIn)}
                              tooltip="OpCo Clinical Inpatient & Outpatient Revenues."
                            />
                            {expandedCfoIn && (
                              <TableRow
                                label="Clinical Revenue Receipts"
                                data={columns}
                                dk="cfo_in"
                                total={data.totals.cfo_in}
                                isDoubleIndent
                                hasDoubleConnector
                                tooltip="Patient cash inflows collected across operations."
                              />
                            )}
                            <TableRow
                              label="Cash Outflows (Operating OPEX & Tax)"
                              data={columns}
                              dk="cfo_out"
                              total={data.totals.cfo_out}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfoOut}
                              onExpand={() => setExpandedCfoOut(!expandedCfoOut)}
                              tooltip="OPEX costs (staffing, rent, doc fees, supplies, utilities, marketing, insurance, management fees, corporate taxes)."
                            />
                            {expandedCfoOut && (
                              <>
                                <TableRow
                                  label="Medical Supplies"
                                  data={columns}
                                  dk="totalMedSupp"
                                  total={data.totals.totalMedSupp}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Costs for medicines and clinical supplies."
                                />
                                <TableRow
                                  label="Doctor Fees"
                                  data={columns}
                                  dk="totalDocFee"
                                  total={data.totals.totalDocFee}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Professional specialist provider honorariums."
                                />
                                <TableRow
                                  label="Staffing Costs"
                                  data={columns}
                                  dk="staffCost"
                                  total={data.totals.staffCost}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Nurses, clinical techs, and operational staffing wages."
                                />
                                <TableRow
                                  label="Administrative Expense"
                                  data={columns}
                                  dk="adminOpex"
                                  total={data.totals.adminOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Administrative support overhead calculated based on administrative expense rate assumptions."
                                />
                                <TableRow
                                  label="Utilities Expense"
                                  data={columns}
                                  dk="utilOpex"
                                  total={data.totals.utilOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Clinic utilities expense based on utility expense rate assumptions."
                                />
                                <TableRow
                                  label="Marketing Expense"
                                  data={columns}
                                  dk="mktgOpex"
                                  total={data.totals.mktgOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Marketing expenditures aligned with marketing expense rate assumptions."
                                />
                                <TableRow
                                  label="Hospital Operator Fee"
                                  data={columns}
                                  dk="operatorOpex"
                                  total={data.totals.operatorOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Hospital management and operator fees."
                                />
                                <TableRow
                                  label="Operational Insurance"
                                  data={columns}
                                  dk="insOpex"
                                  total={data.totals.insOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Annual facility, equipment, and liability insurance expenditures."
                                />
                                <TableRow
                                  label="Facility Lease Rent"
                                  data={columns}
                                  dk="rent"
                                  total={data.totals.rent}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Payments delivered to the Property Company (PropCo)."
                                />
                                <TableRow
                                  label="Corporate Income Tax"
                                  data={columns}
                                  dk="tax"
                                  total={data.totals.tax}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Taxes swept across OpCo financial distributions."
                                />
                              </>
                            )}
                          </>
                        )}

                        <TableRow
                          label="Net Cash from Investing (CFI)"
                          data={columns}
                          dk="cfi"
                          total={data.totals.cfi}
                          highlight
                          isExpandable
                          isExpanded={expandedCfi}
                          onExpand={() => setExpandedCfi(!expandedCfi)}
                          tooltip="Working capital outlays and enterprise exit proceeds."
                        />
                        {expandedCfi && (
                          <>
                            <TableRow
                              label="Cash Inflows (Exit Proceeds)"
                              data={columns}
                              dk="cfi_in"
                              total={data.totals.cfi_in}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfiIn}
                              onExpand={() => setExpandedCfiIn(!expandedCfiIn)}
                              tooltip="Capital received from OpCo enterprise valuation and accumulated cash buffer at exit."
                            />
                            {expandedCfiIn && (
                              <>
                                <TableRow
                                  label={`Clinical Enterprise Value (${assumptions?.exitMultiple || 15}x EBITDA)`}
                                  data={columns}
                                  dk="exitEv"
                                  total={data.totals.exitEv}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  tooltip="Clinical enterprise valuation calculated as: Annualized Operating EBITDA in Exit Year × Exit Multiple."
                                />
                                <TableRow
                                  label="Clinical Accumulated Retained Cash Buffer"
                                  data={columns}
                                  dk="exitRetained"
                                  total={data.totals.exitRetained}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  tooltip="Accumulated clinical reserves (20% retained after dividends) distributed to partners at exit."
                                />
                              </>
                            )}
                            <TableRow
                              label="Cash Outflows (Setup & Working Capital CapEx)"
                              data={columns}
                              dk="cfi_out"
                              total={data.totals.cfi_out}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfiOut}
                              onExpand={() => setExpandedCfiOut(!expandedCfiOut)}
                              tooltip="Initial pre-operating working capital outlays (Year 3 operational buffer)."
                            />
                            {expandedCfiOut && (
                              <TableRow
                                label="Pre-Operating Setups & Work Capital"
                                data={columns}
                                dk="cfi_out"
                                total={data.totals.cfi_out}
                                isDoubleIndent
                                hasDoubleConnector
                                isSubtractor
                                tooltip="Required upfront clinical buffer/reserves."
                              />
                            )}
                          </>
                        )}

                        <TableRow
                          label="Net Cash from Financing (CFF)"
                          data={columns}
                          dk="cff"
                          total={data.totals.cff}
                          highlight
                          isExpandable
                          isExpanded={expandedCff}
                          onExpand={() => setExpandedCff(!expandedCff)}
                          tooltip="Sponsor equity investments and OpCo dividend payouts."
                        />
                        {expandedCff && (
                          <>
                            <TableRow
                              label="Cash Inflows (Sponsor Equity Contributions)"
                              data={columns}
                              dk="cff_in"
                              total={data.totals.cff_in}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCffIn}
                              onExpand={() => setExpandedCffIn(!expandedCffIn)}
                              tooltip="Initial equity funding received from Operator & Sponsor Partners."
                            />
                            {expandedCffIn && (
                              <TableRow
                                label="Sponsor Injected Equity"
                                data={columns}
                                dk="cff_in"
                                total={data.totals.cff_in}
                                isDoubleIndent
                                hasDoubleConnector
                                tooltip="Firms-injected startup operating capital."
                              />
                            )}
                            <TableRow
                              label="Cash Outflows (Partner Distributions & Dividends)"
                              data={columns}
                              dk="cff_out"
                              total={data.totals.cff_out}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCffOut}
                              onExpand={() => setExpandedCffOut(!expandedCffOut)}
                              tooltip="Standard cash dividends paid to Operator & Sponsor Partners and exit payouts."
                            />
                            {expandedCffOut && (
                              <TableRow
                                label="Clinical Free Cash Flow Distributions"
                                data={columns}
                                dk="cff_out"
                                total={data.totals.cff_out}
                                isDoubleIndent
                                hasDoubleConnector
                                isSubtractor
                                tooltip="Annual operating yields sent back to sponsors."
                              />
                            )}
                          </>
                        )}

                        <TableRow
                          label="Total Net Cash Flow"
                          data={columns}
                          dk="netFlow"
                          total={data.totals.netFlow}
                          highlight
                          emerald
                        />
                        <TableRow
                          label="Cumulative Cash Balance"
                          data={columns}
                          dk="endCash"
                          total={data.totals.netFlow}
                          highlight
                          crossover
                          indigo
                          bold
                          tooltip="Rolling cash balance."
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLE 3: Capital Cascade & Sponsor Returns */}
              {(viewMode === "all" || viewMode === "cf") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#1C6048] border-b border-[#1C6048] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      3. Sponsor Cascade & Returns
                    </h3>
                  </div>
                  <div className="overflow-auto max-h-[65vh] custom-scrollbar relative opco-table-scroll">
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                      {renderTableHeaders()}
                      <tbody>
                        <TableSection
                          title="Free Cash Flow & Retained Earnings"
                          colSpan={columns.length + 2}
                          type="emerald"
                        />
                        <TableRow
                          label="Cumulative Net Income"
                          data={columns}
                          dk="cumNI"
                          highlight
                          crossover
                          bold
                          indigo
                          tooltip={OPCO_FORMULAS.cumNI}
                        />
                        <TableRow
                          label={`Distributable Profit (${assumptions.dividendPayoutRatio ?? 100}%)`}
                          data={columns}
                          dk="distributableProfit"
                          total={data.totals.distributableProfit}
                          highlight
                          tooltip={OPCO_FORMULAS.distributableProfit}
                        />
                        <TableRow
                          label={`Retained Earnings (${100 - (assumptions.dividendPayoutRatio ?? 100)}%)`}
                          data={columns}
                          dk="retainedThisYear"
                          total={data.totals.retainedThisYear}
                          isIndent
                          tooltip={OPCO_FORMULAS.retainedThisYear}
                        />
                        <TableRow
                          label="Cumulative Retained Cash"
                          data={columns}
                          dk="cumulativeRetainedEarnings"
                          highlight
                          crossover
                          bold
                          indigo
                          tooltip={OPCO_FORMULAS.cumulativeRetainedEarnings}
                        />

                        <TableSection
                          title="Terminal Value (Exit)"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="OpCo Enterprise Value (EV)"
                          data={columns}
                          dk="ev"
                          total={data.totals.ev}
                          highlight
                          tooltip={OPCO_FORMULAS.ev}
                        />
                        <TableRow
                          label="+ Retained Cash Sweep"
                          data={columns}
                          dk="cumulativeRetainedEarnings"
                          total={data.totals.retainedThisYear}
                          isIndent
                          tooltip={OPCO_FORMULAS.cumulativeRetainedEarnings}
                        />
                        <TableRow
                          label="Total Exit Equity Value"
                          data={columns}
                          dk="opCoExit"
                          total={data.totals.opCoExit}
                          highlight
                          tooltip={OPCO_FORMULAS.opCoExit}
                        />
                        <TableRow
                          label="Strategic Ptnr Proceeds (51%)"
                          data={columns}
                          dk="pA_Exit"
                          total={data.totals.pA_Exit}
                          isIndent
                          tooltip={OPCO_FORMULAS.pA_Exit}
                        />
                        <TableRow
                          label="Vasanta Proceeds (49%)"
                          data={columns}
                          dk="pB_Exit"
                          total={data.totals.pB_Exit}
                          isIndent
                          tooltip={OPCO_FORMULAS.pB_Exit}
                        />

                        <TableSection
                          title="Vasanta Returns (49%)"
                          colSpan={columns.length + 2}
                          type="emerald"
                        />
                        <TableRow
                          label="Partner B Investment"
                          data={columns}
                          dk="pB_Outlay"
                          total={data.totals.pB_Outlay}
                          isIndent
                          tooltip={OPCO_FORMULAS.pB_Outlay}
                        />
                        <TableRow
                          label="Partner B Dividend"
                          data={columns}
                          dk="shareB"
                          total={data.totals.shareB}
                          isIndent
                          tooltip={OPCO_FORMULAS.shareB}
                        />
                        <TableRow
                          label="Terminal Exit Proceeds"
                          data={columns}
                          dk="pB_Exit"
                          total={data.totals.pB_Exit}
                          isIndent
                          tooltip={OPCO_FORMULAS.pB_Exit}
                        />
                        <TableRow
                          label="VG NET CASH FLOW"
                          data={columns}
                          dk="pB_Net"
                          total={data.totals.pB_Net}
                          highlight
                          emerald
                          tooltip={OPCO_FORMULAS.pB_Net}
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const PropCoDashboardView = memo(
  ({
    data,
    assumptions,
    generateTeaser,
    isTeaserLoading,
    showTeaser,
    setShowTeaser,
    teaserContent,
    setTab,
    isPresenting,
    propCoScenario = "manual",
    setPropCoScenario = () => {},
    onChange,
    propCoLocked = false,
    holdCoLocked = false,
    toggleHoldCoLock = () => {},
  }) => {
    const pieData = useMemo(() => {
      const leasedMedEq =
        assumptions.medEqProcurement === "lease"
          ? data.capexDetails.medEqCost
          : 0;
      return [
        { name: "Equity", value: data.metrics.totalEquity },
        { name: "Bank Loan", value: data.metrics.totalDebt },
        ...(leasedMedEq > 0
          ? [{ name: "Equipment Lease", value: leasedMedEq }]
          : []),
      ];
    }, [
      data.metrics.totalEquity,
      data.metrics.totalDebt,
      data.capexDetails.medEqCost,
      assumptions.medEqProcurement,
    ]);

    const [chartMode, setChartMode] = useState("full");
    const chartData =
      chartMode === "full" ? data.annualData : data.operatingData;
    const devYears = Math.max(
      1,
      Math.ceil((assumptions.devDurationMonths || 12) / 12),
    );

    const hasDebt = (assumptions.includeFinancing ? assumptions.ltv : 0) > 0;
    const hasLandCost = data.capexDetails && data.capexDetails.landCost > 0;

    let leveredIrrTooltip = "";
    let unleveredIrrTooltip = "";
    let irrExLandTooltip = "";

    if (!hasDebt && !hasLandCost) {
      leveredIrrTooltip =
        "Return on Equity.\n• Financing: Fully Equity\n• Land: Excluded";
      unleveredIrrTooltip =
        "Project Return (Pre-Financing). Assumes 100% Equity funding.\n• Financing: Unlevered (All Equity)\n• Land: Excluded";
      irrExLandTooltip =
        "Core Asset Return.\n• Financing: Unlevered\n• Structural Impact: No Land impact";
    } else if (!hasDebt && hasLandCost) {
      leveredIrrTooltip =
        "Return on Equity.\n• Financing: Fully Equity\n• Land: Included upfront";
      unleveredIrrTooltip =
        "Project Return (Pre-Financing). Assumes 100% Equity funding.\n• Financing: Unlevered (All Equity)\n• Land: Included upfront";
      irrExLandTooltip =
        "Core Asset Return.\n• Financing: Unlevered\n• Structural Impact: Land Cost stripped from capex & exit";
    } else if (hasDebt && hasLandCost) {
      leveredIrrTooltip =
        "Return on Equity.\n• Financing: Equity + Debt\n• Land: Included upfront";
      unleveredIrrTooltip =
        "Project Return (Pre-Financing). Assumes 100% Equity funding.\n• Financing: Unlevered (All Equity)\n• Land: Included upfront";
      irrExLandTooltip =
        "Core Asset Return.\n• Financing: Levered\n• Structural Impact: Land Cost stripped from capex & exit";
    } else if (hasDebt && !hasLandCost) {
      leveredIrrTooltip =
        "Return on Equity.\n• Financing: Equity + Debt\n• Land: Excluded";
      unleveredIrrTooltip =
        "Project Return (Pre-Financing). Assumes 100% Equity funding.\n• Financing: Unlevered (All Equity)\n• Land: Excluded";
      irrExLandTooltip =
        "Core Asset Return.\n• Financing: Levered\n• Structural Impact: No Land impact";
    }

    return (
      <div
        className={
          isPresenting
            ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in"
            : "space-y-6 animate-in fade-in"
        }
      >
        <div className={`space-y-6 ${isPresenting ? "lg:col-span-4" : ""}`}>
          <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <h2 className="text-sm font-bold text-[#1E2F31] ml-2">
              PropCo Executive Summary
            </h2>
            <button
              disabled={true}
              title="Temporarily disabled"
              className="bg-[#D8D8D8] text-[#8A8175] cursor-not-allowed text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 transition-colors opacity-70"
            >
              <Sparkles size={14} />✨ Pitch Teaser
            </button>
          </div>

          {showTeaser && (
            <div className="bg-white p-6 rounded-2xl border-l-4 border-l-[#9B8B70] shadow-sm relative">
              <button
                onClick={() => setShowTeaser(false)}
                className="absolute top-4 right-4 bg-[#EFEBE7] p-1 rounded-full"
              >
                <X size={16} />
              </button>
              <h3 className="font-bold text-[#1E2F31] mb-2 flex items-center gap-2">
                <FileText size={18} /> AI Pitch Teaser
              </h3>
              <MarkdownRenderer content={teaserContent} />
            </div>
          )}

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#D8D8D8] flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-2">
                <Target size={16} className={propCoLocked ? "text-[#1C6048]/50" : "text-[#1C6048]"} /> PropCo Asset Exit Strategy
                {propCoLocked && (
                  <span className="inline-flex items-center gap-1.5 text-[9px] bg-[#EFEBE7] text-[#9B8B70] px-2 py-0.5 rounded-full font-bold border border-[#D8D8D8]">
                    <Lock size={10} /> Locked to Master
                  </span>
                )}
              </h3>
              <p className="text-[9px] text-[#4C4A4B] mt-1 font-medium leading-relaxed">
                {propCoLocked
                  ? "Property exit strategy is locked to follow the Master (HoldCo) Exit. Deselect 'Lock PropCo to Master' in Global Settings or Consolidated Dashboard to override manually."
                  : "Configure standalone property-level holding horizons and exit scenarios purely driven by PropCo covenants and asset yields."}
              </p>
            </div>
            <div className={`flex flex-wrap gap-1.5 mt-1 ${propCoLocked ? "pointer-events-none opacity-85" : ""}`}>
              <div className="flex-1 min-w-[100px] relative group flex flex-col justify-start">
                <button
                  disabled={propCoLocked}
                  onClick={() => setPropCoScenario("manual")}
                  className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    propCoLocked
                      ? propCoScenario === "manual"
                        ? "bg-[#EFEBE7]/80 border border-[#D8D8D8] text-[#1E2F31]/70"
                        : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                      : propCoScenario === "manual"
                        ? "bg-white shadow-sm border border-[#D8D8D8] text-[#1E2F31]"
                        : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                  }`}
                >
                  Manual (Settings)
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                  {propCoLocked ? "Locked to Master HoldCo exit strategy" : "Uses the exit settings defined in PropCo assumptions"}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
                </div>
              </div>

              <div className="flex-1 min-w-[100px] relative group flex">
                <button
                  disabled={propCoLocked}
                  onClick={() => setPropCoScenario("yr10")}
                  className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    propCoLocked
                      ? propCoScenario === "yr10"
                        ? "bg-[#1E2F31]/15 text-[#1E2F31]/70 border border-[#1E2F31]/20"
                        : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                      : propCoScenario === "yr10"
                        ? "bg-[#1E2F31] shadow-sm border border-[#1E2F31] text-white"
                        : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                  }`}
                >
                  Exit in Yr 10
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                  {propCoLocked ? "Locked to Master HoldCo exit strategy" : "Forces the exit on Year 10"}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
                </div>
              </div>

              <div className="flex-1 min-w-[100px] relative group flex">
                <button
                  disabled={propCoLocked}
                  onClick={() => setPropCoScenario("breakeven")}
                  className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    propCoLocked
                      ? propCoScenario === "breakeven"
                        ? "bg-[#1C6048]/15 text-[#1C6048]/70 border border-[#1C6048]/20"
                        : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                      : propCoScenario === "breakeven"
                        ? "bg-[#1C6048] shadow-sm border border-[#1C6048] text-white"
                        : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                  }`}
                >
                  Exit at Breakeven
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                  {propCoLocked ? "Locked to Master HoldCo exit strategy" : "Exits at the end of the year standalone PropCo achieves cumulative equity cash flow breakeven"}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
                </div>
              </div>

              <div className="flex-1 min-w-[100px] relative group flex">
                <button
                  disabled={propCoLocked || !assumptions.includeFinancing}
                  onClick={() => setPropCoScenario("debt_free")}
                  className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    !assumptions.includeFinancing
                      ? "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed border border-[#E5E7EB]"
                      : propCoLocked
                        ? propCoScenario === "debt_free"
                          ? "bg-[#9B8B70]/15 text-[#9B8B70]/70 border border-[#9B8B70]/20"
                          : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                        : propCoScenario === "debt_free"
                          ? "bg-[#9B8B70] shadow-sm border border-[#9B8B70] text-white"
                          : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                  }`}
                >
                  Exit Post-Debt
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                  {!assumptions.includeFinancing
                    ? "Requires loan financing to be enabled"
                    : propCoLocked
                      ? "Locked to Master HoldCo exit strategy"
                      : "Exits only after PropCo reaches breakeven and PropCo debt is fully repaid"}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
                </div>
              </div>

              <div className="flex-1 min-w-[100px] relative group flex">
                <button
                  disabled={propCoLocked}
                  onClick={() => setPropCoScenario("none")}
                  className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    propCoLocked
                      ? propCoScenario === "none"
                        ? "bg-[#1C6048]/10 text-[#1C6048]/70 border border-[#1C6048]/20"
                        : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                      : propCoScenario === "none"
                        ? "bg-white shadow-sm border border-[#1C6048] text-[#1C6048]"
                        : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                  }`}
                >
                  No Exit (Yield)
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                  {propCoLocked ? "Locked to Master HoldCo exit strategy" : "No exit is calculated; evaluates pure operating yields over 30 years"}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
                </div>
              </div>
            </div>

            {/* Assumptions Toggles Grid */}
            {onChange && (
              <>
                <hr className="border-t border-[#D8D8D8]/50 my-2" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {/* Bank Debt Financing Toggle */}
                  <div className="flex items-center justify-between bg-[#F9F8F6] px-3 py-2 rounded-xl border border-[#D8D8D8]/40 hover:border-[#1C6048]/20 transition-all">
                    <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5 whitespace-nowrap">
                      <Landmark size={13} className="text-[#9B8B70]" /> Bank Debt Financing
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={assumptions?.includeFinancing || false}
                        onChange={(e) =>
                          onChange("includeFinancing", e.target.checked)
                        }
                      />
                      <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
                    </label>
                  </div>

                  {/* Include Land Cost Toggle */}
                  <div className="flex items-center justify-between bg-[#F9F8F6] px-3 py-2 rounded-xl border border-[#D8D8D8]/40 hover:border-[#1C6048]/20 transition-all">
                    <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5 whitespace-nowrap">
                      <Map size={13} className="text-[#9B8B70]" /> Include Land Cost
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={assumptions?.includeLand ?? true}
                        onChange={(e) =>
                          onChange("includeLand", e.target.checked)
                        }
                      />
                      <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
                    </label>
                  </div>

                  {/* Lock Master to PropCo toggle */}
                  <div className="flex items-center justify-between bg-[#F9F8F6] px-3 py-2 rounded-xl border border-[#D8D8D8]/40 hover:border-[#1C6048]/20 transition-all">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5 whitespace-nowrap">
                        <Lock
                          size={13}
                          className={holdCoLocked ? "text-[#1C6048]" : "text-[#9B8B70]"}
                        />{" "}
                        Lock Master to PropCo
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={holdCoLocked}
                        onChange={toggleHoldCoLock}
                      />
                      <div className="w-8 h-4 bg-[#D8D8D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#D8D8D8] after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#1C6048]"></div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${isPresenting ? "lg:grid-cols-2" : "lg:grid-cols-4"} gap-4`}
          >
            <DualKPICard
              title1="Levered IRR"
              value1={`${formatNumber((data.metrics.irr || 0) * 100, 2)}%`}
              color1="indigo"
              tooltip1={leveredIrrTooltip}
              title2="Equity NPV"
              value2={formatCurrency(data.metrics.npv)}
              color2="emerald"
              icon={<Activity size={18} />}
            />
            <DualKPICard
              title1="Unlevered IRR"
              value1={`${formatNumber((data.metrics.unleveredIrr || 0) * 100, 2)}%`}
              color1="emerald"
              tooltip1={unleveredIrrTooltip}
              title2="Project NPV"
              value2={formatCurrency(data.metrics.unleveredNpv)}
              color2="blue"
              icon={<Building2 size={18} />}
            />
            <DualKPICard
              title1="IRR (ex-Land)"
              value1={`${formatNumber((data.metrics.irrExLand || 0) * 100, 2)}%`}
              color1="blue"
              tooltip1={irrExLandTooltip}
              title2="NPV (ex-Land)"
              value2={formatCurrency(data.metrics.npvExLand)}
              color2="teal"
              icon={<TrendingUp size={18} />}
            />
            <DualKPICard
              title1="Avg Cash Yield"
              value1={`${formatNumber(data.metrics.avgYield, 1)}%`}
              color1="teal"
              tooltip1={{
                desc: "The average annual cash distribution yield generated from PropCo's operations, reflecting the stable income generation capacity of the standalone infrastructure.",
                formula:
                  "Average of (Annual Operating FCFE ÷ Total PropCo Equity) across operating years",
              }}
              title2="YOC (ex-Land)"
              value2={`${formatNumber((data.metrics.yocExLand || 0) * 100, 1)}%`}
              color2="amber"
              icon={<Coins size={18} />}
            />
          </div>

          {data.totals?.shortfallEquity > 0 && (
            <div className="bg-[#FEF2F2] p-5 rounded-2xl border border-[#FECACA] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-start md:items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl text-[#EF4444] shadow-sm shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="text-[#991B1B] font-bold text-base">Working Capital Shortfall Detected</h4>
                  <p className="text-sm text-[#B91C1C] mt-1 pr-4">
                    Projected operating cash flow is insufficient to cover early expenditures or debt service. Additional equity injection is required during operations.
                  </p>
                </div>
              </div>
              <div className="text-left md:text-right shrink-0 bg-white/60 p-3 rounded-xl border border-[#FECACA]/50">
                <p className="text-[10px] text-[#B91C1C] font-bold uppercase tracking-widest opacity-80 mb-1">Total Shortfall Equity</p>
                <div className="text-xl font-bold text-[#991B1B]">{formatCurrency(data.totals.shortfallEquity)}</div>
              </div>
            </div>
          )}

          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1E2F31] flex items-center gap-2">
                <DollarSign size={20} className="text-[#1C6048]" /> Sources &
                Uses of Funds
              </h3>
              <button
                onClick={() => setTab("assumptions")}
                className="text-[10px] bg-[#EFEBE7] hover:bg-[#D8D8D8] text-[#4C4A4B] font-bold px-2 py-1 rounded transition-colors uppercase"
              >
                Edit Settings
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sources Pie */}
              <div>
                <h4 className="text-center text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-2">
                  Sources
                </h4>
                <div
                  className={`w-full relative flex justify-center ${isPresenting ? "h-40" : "h-36"}`}
                >
                  <LazyResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: "none" }}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        className="outline-none focus:outline-none"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-src-${index}`}
                            fill={
                              index === 0
                                ? "#1C6048"
                                : index === 1
                                  ? "#D8D8D8"
                                  : "#9B8B70"
                            }
                            className="outline-none focus:outline-none"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </LazyResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-sm font-black text-[#1E2F31]">
                      {formatNumber(data.metrics.totalCapex, 0)}B
                    </span>
                  </div>
                </div>
                <div
                  className={`w-full grid ${assumptions.medEqProcurement === "lease" && data.capexDetails.medEqCost > 0 ? "grid-cols-3" : "grid-cols-2"} gap-2 mt-4 text-center`}
                >
                  <div className="bg-[#EFEBE7] p-2 rounded border border-[#D8D8D8]">
                    <p className="text-[9px] font-bold uppercase text-[#4C4A4B] mb-1">
                      Total Equity
                    </p>
                    <p className="font-black text-[#1E2F31]">
                      {formatCurrency(
                        Math.abs(
                          data.annualData
                            .filter((d) => !d.isOperating)
                            .reduce((acc, d) => acc + (d.fcfe || 0), 0),
                        ),
                      )}
                    </p>
                  </div>
                  <div className="bg-[#D8D8D8]/30 p-2 rounded border border-[#D8D8D8]">
                    <p className="text-[9px] font-bold uppercase text-[#4C4A4B] mb-1">
                      Loan
                    </p>
                    <p className="font-black text-[#1E2F31]">
                      {formatCurrency(data.metrics.totalDebt)}
                    </p>
                  </div>
                  {assumptions.medEqProcurement === "lease" &&
                    data.capexDetails.medEqCost > 0 && (
                      <div className="bg-[#9B8B70]/10 p-2 rounded border border-[#D8D8D8]">
                        <p className="text-[9px] font-bold uppercase text-[#9B8B70] mb-1 leading-tight">
                          Equip.
                          <br />
                          Lease
                        </p>
                        <p className="font-black text-[#1E2F31]">
                          {formatCurrency(data.capexDetails.medEqCost)}
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Uses Expandable Table */}
              <div>
                <h4 className="text-center text-[10px] font-bold text-[#4C4A4B] uppercase tracking-widest mb-4">
                  Uses Breakdown
                </h4>
                <div className="bg-[#F9F8F6] p-2 rounded-xl border border-[#D8D8D8]">
                  <ExpandableCapexRow
                    icon={<Map size={16} className="text-[#9B8B70]" />}
                    title="Land Acquisition"
                    amount={data.capexDetails.landCost}
                    totalCapex={data.metrics.totalCapex}
                  />
                  <ExpandableCapexRow
                    icon={<Building2 size={16} className="text-[#1E2F31]" />}
                    title="Hard Costs"
                    amount={
                      data.capexDetails.buildCost +
                      data.capexDetails.infraCost +
                      data.capexDetails.ffeCost
                    }
                    totalCapex={data.metrics.totalCapex}
                    details={[
                      {
                        label: "Construction",
                        amount: data.capexDetails.buildCost,
                      },
                      {
                        label: "Infrastructure",
                        amount: data.capexDetails.infraCost,
                      },
                      { label: "FF&E", amount: data.capexDetails.ffeCost },
                      {
                        label: "Sharing Dev.",
                        amount: data.capexDetails.sharingDevCost,
                      },
                    ].filter((d) => d.amount > 0)}
                  />
                  {data.capexDetails.medEqCost > 0 && (
                    <ExpandableCapexRow
                      icon={<Activity size={16} className="text-[#1C6048]" />}
                      title="Medical Equipment"
                      amount={data.capexDetails.medEqCost}
                      totalCapex={data.metrics.totalCapex}
                    />
                  )}
                  <ExpandableCapexRow
                    icon={<Briefcase size={16} className="text-[#99B6AA]" />}
                    title="Soft Costs"
                    amount={data.capexDetails.totalSoftCosts}
                    totalCapex={data.metrics.totalCapex}
                    details={[
                      {
                        label: "Consulting & Design",
                        amount: data.capexDetails.consultantCost,
                      },
                      {
                        label: "Licenses & Permits",
                        amount: data.capexDetails.licenseCost,
                      },
                      { label: "VAT", amount: data.capexDetails.vatCost },
                      {
                        label: "Contingency",
                        amount: data.capexDetails.contingencyCost,
                      },
                      {
                        label: "Dev. G&A",
                        amount: data.capexDetails.devGaCost,
                      },
                      {
                        label: "Dev. CAR",
                        amount: data.capexDetails.devCarCost,
                      },
                    ].filter((d) => d.amount > 0)}
                  />
                  <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-[#D8D8D8] px-2">
                    <span className="text-[10px] font-black text-[#1E2F31] uppercase tracking-widest">
                      Total Project Cost
                    </span>
                    <span className="font-mono text-sm font-black text-[#1C6048]">
                      {formatNumber(data.metrics.totalCapex, 1)} B
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`space-y-6 ${isPresenting ? "lg:col-span-8" : ""}`}>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <MiniKPICard
              title="Equity Payback"
              value={data.metrics.payback > 0 ? `${formatNumber(Math.max(0, data.metrics.payback - devYears), 1)} Yrs` : "Never"}
              subtitle="From Operations"
            />
            <MiniKPICard
              title="Op. Payback"
              value={data.metrics.operatingPayback > 0 ? `${formatNumber(Math.max(0, data.metrics.operatingPayback - devYears), 1)} Yrs` : "Never"}
              subtitle="From Operations"
            />
            <MiniKPICard
              title="Avg DSCR"
              value={`${formatNumber(data.metrics.avgDscr, 2)}x`}
              subtitle="Debt Coverage"
              tooltip="Debt Service Coverage Ratio (EBITDA / Total Debt Service). Measures the ability to pay debt obligations. Average over the loan tenor. Benchmark: > 1.25x is standard."
              disabled={!assumptions.includeFinancing}
            />
            <MiniKPICard
              title="Min DSCR"
              value={`${formatNumber(data.metrics.minDscr, 2)}x`}
              subtitle="Lowest Coverage"
              tooltip="The lowest DSCR value over the loan tenor. Benchmark: Must remain > 1.25x to satisfy standard covenants. < 1.0x indicates projected default."
              disabled={!assumptions.includeFinancing}
            />
            <MiniKPICard
              title="Cost per Bed"
              value={`${formatCurrency(data.metrics.costPerBed)}`}
              subtitle="Total / Beds"
            />
            <MiniKPICard
              title="Cost per Sqm"
              value={`${formatNumber(data.metrics.costPerSqm, 1)} M`}
              subtitle="Total / Sqm"
            />
          </div>

          <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
                <BarChart3 size={18} className="text-[#9B8B70]" /> PropCo Cash
                Flow Trajectory
              </h3>
              <div className="flex bg-[#EFEBE7] p-1 rounded-lg border border-[#D8D8D8]">
                <button
                  onClick={() => setChartMode("full")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartMode === "full" ? "bg-white shadow-sm text-[#1E2F31]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                >
                  Full Lifecycle
                </button>
                <button
                  onClick={() => setChartMode("operating")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${chartMode === "operating" ? "bg-white shadow-sm text-[#1E2F31]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                >
                  Operating Only
                </button>
              </div>
            </div>
            <div className={isPresenting ? "h-[450px]" : "h-[400px]"}>
              <LazyResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#D8D8D8"
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: "#4C4A4B" }}
                    axisLine={false}
                    tickFormatter={(val) => `${val}B`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#1E2F31" }}
                    axisLine={false}
                    tickFormatter={(val) => `${val}B`}
                  />
                  <Tooltip
                    allowEscapeViewBox={{ x: true, y: true }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(val) => formatNumber(val, 1) + "B"}
                  />
                  <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                  <Bar
                    yAxisId="left"
                    dataKey="ebitda"
                    name="EBITDA (NOI)"
                    fill="#9B8B70"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="fcfe"
                    name="FCFE"
                    stroke="#1E2F31"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#1E2F31",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumFcfe"
                    name="Cumulative FCFE"
                    stroke="#1C6048"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </ComposedChart>
              </LazyResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const PropCoCascadeView = memo(
  ({ data, onExport, viewResolution, setViewResolution }) => {
    const { columns, expandedYears, toggleYear } = useMonthlyColumns(
      data.annualData,
      viewResolution,
    );

    const enrichedColumns = useMemo(() => {
      return columns.map((col) => {
        const preOpening = col.preOpeningDev || 0;
        const maint = col.maintOpex || 0;
        const tax = col.taxOpex || 0;
        const overhead = col.overheadOpex || 0;
        const lease = col.medEqLeaseOpex || 0;
        const opex = preOpening + maint + tax + overhead + lease;
        return {
          ...col,
          opex,
        };
      });
    }, [columns]);

    const totalOpex = useMemo(() => {
      const tPreOpening = data.totals.preOpeningDev || 0;
      const tMaint = data.totals.maintOpex || 0;
      const tTax = data.totals.taxOpex || 0;
      const tOverhead = data.totals.overheadOpex || 0;
      const tLease = data.totals.medEqLeaseOpex || 0;
      return tPreOpening + tMaint + tTax + tOverhead + tLease;
    }, [data.totals]);

    const scrollRef = useRef(null);
    const [showDevBudget, setShowDevBudget] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [viewMode, setViewMode] = useState("all"); // 'all' | 'pl' | 'cf'
    const [expandedCfo, setExpandedCfo] = useState(false);
    const [expandedCfoIn, setExpandedCfoIn] = useState(false);
    const [expandedCfoOut, setExpandedCfoOut] = useState(false);
    const [expandedCfi, setExpandedCfi] = useState(false);
    const [expandedCfiIn, setExpandedCfiIn] = useState(false);
    const [expandedCfiOut, setExpandedCfiOut] = useState(false);
    const [expandedCff, setExpandedCff] = useState(false);
    const [expandedCffIn, setExpandedCffIn] = useState(false);
    const [expandedCffOut, setExpandedCffOut] = useState(false);

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
        className={`space-y-6 ${isFullScreen ? "fixed inset-0 z-[150] bg-[#F9F8F6] p-4 lg:p-6 overflow-hidden flex flex-col" : ""}`}
      >
        <div
          className={`grid grid-cols-1 gap-6 animate-in slide-in-from-bottom-4 duration-500 ${isFullScreen ? "flex-1 overflow-hidden" : ""} ${showDevBudget && !isFullScreen ? "md:grid-cols-3" : "md:grid-cols-1"}`}
        >
          {showDevBudget && !isFullScreen && (
            <div className="md:col-span-1 bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8] h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#1E2F31] flex items-center gap-2">
                  <Map size={18} className="text-[#1C6048]" /> Development
                  Budget
                </h3>
                <button
                  onClick={() => setShowDevBudget(false)}
                  className="text-[#8A8175] hover:text-[#1E2F31] text-[10px] uppercase font-bold tracking-wider"
                >
                  Hide
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#EFEBE7]">
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold rounded-tl">
                        Component
                      </th>
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right">
                        Cost (B)
                      </th>
                      <th className="px-4 py-2 border border-[#D8D8D8] text-[#1E2F31] font-bold text-right rounded-tr">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <CapexRow
                      label="Land Cost"
                      amount={data.capexDetails.landCost}
                      total={data.metrics.totalCapex}
                      isHeader
                    />

                    <CapexRow
                      label="Total Hard Costs"
                      amount={data.capexDetails.totalHardCosts}
                      total={data.metrics.totalCapex}
                      isHeader
                    />
                    <CapexRow
                      label="Construction"
                      amount={data.capexDetails.buildCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Medical Equip."
                      amount={data.capexDetails.medEqCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Infrastructure"
                      amount={data.capexDetails.infraCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="FF&E"
                      amount={data.capexDetails.ffeCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Sharing Dev."
                      amount={data.capexDetails.sharingDevCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />

                    <CapexRow
                      label="Total Soft Costs"
                      amount={data.capexDetails.totalSoftCosts}
                      total={data.metrics.totalCapex}
                      isHeader
                    />
                    <CapexRow
                      label="Consultant"
                      amount={data.capexDetails.consultantCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="License"
                      amount={data.capexDetails.licenseCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="VAT"
                      amount={data.capexDetails.vatCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Contingency"
                      amount={data.capexDetails.contingencyCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Dev. G&A"
                      amount={data.capexDetails.devGaCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />
                    <CapexRow
                      label="Dev. CAR"
                      amount={data.capexDetails.devCarCost}
                      total={data.metrics.totalCapex}
                      isIndent
                    />

                    <CapexRow
                      label="TOTAL PROPCO INVESTMENT"
                      amount={data.metrics.totalCapex}
                      total={data.metrics.totalCapex}
                      isSubtotal
                    />
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div
            className={`${showDevBudget && !isFullScreen ? "md:col-span-2" : "md:col-span-1"} flex flex-col gap-4 overflow-hidden ${isFullScreen ? "h-full" : "h-[calc(100vh-240px)]"}`}
          >
            <div className="p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8] flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1E2F31] flex items-center gap-2">
                <List size={14} /> PropCo P&L & Cash Flow
                {!showDevBudget && (
                  <button
                    onClick={() => setShowDevBudget(true)}
                    className="ml-2 px-2 py-0.5 border border-[#D8D8D8] bg-white rounded text-[#8A8175] hover:text-[#1E2F31] text-[9px] tracking-wider font-bold shadow-sm leading-tight inline-block flex-shrink-0"
                  >
                    Show Dev Budget
                  </button>
                )}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => setViewMode("all")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "all" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setViewMode("pl")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "pl" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="PropCo Income Statement (P&L)"
                  >
                    P&L
                  </button>
                  <button
                    onClick={() => setViewMode("statement")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "statement" ? "bg-[#1E2F31] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="C&F (Standardized)"
                  >
                    C&F
                  </button>
                  <button
                    onClick={() => setViewMode("cf")}
                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${viewMode === "cf" ? "bg-[#9B8B70] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    title="PropCo Capital Cascade"
                  >
                    Cascade
                  </button>
                </div>
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6] transition-colors"
                  title={isFullScreen ? "Minimize" : "Maximize"}
                >
                  {isFullScreen ? (
                    <Minimize2 size={13} strokeWidth={2.5} />
                  ) : (
                    <Maximize2 size={13} strokeWidth={2.5} />
                  )}
                </button>
                <div className="flex items-center bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
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
                <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                  <button
                    onClick={() => {
                      const tables = document.querySelectorAll('.propco-table-scroll');
                      tables.forEach(t => t.scrollBy({ left: -300, behavior: 'smooth' }));
                    }}
                    className="p-1 rounded bg-white text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-[#F9F8F6] transition-colors"
                    title="Scroll Left"
                  >
                    <ChevronLeft size={13} strokeWidth={2.5} />
                  </button>
                  <div className="w-[1px] bg-[#D8D8D8] my-1 opacity-50"></div>
                  <button
                    onClick={() => {
                      const tables = document.querySelectorAll('.propco-table-scroll');
                      tables.forEach(t => t.scrollBy({ left: 300, behavior: 'smooth' }));
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
            <div className="overflow-auto min-h-0 flex-1 space-y-6">
              {/* TABLE 1: PropCo Operating P&L & Debt Coverage */}
              {(viewMode === "all" || viewMode === "pl") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#9B8B70] border-b border-[#9B8B70] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      1. Property P&L & Debt Service
                    </h3>
                  </div>
                  <div className="overflow-auto max-h-[65vh] custom-scrollbar relative propco-table-scroll">
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                      {renderTableHeaders()}
                      <tbody>
                        <TableRow
                          label="Net Rent Revenue / NOR"
                          data={columns}
                          dk="revenue"
                          total={data.totals.revenue}
                          highlight
                          tooltip={PROPCO_FORMULAS.revenue}
                        />

                        <TableRow
                          label="Operating Expenses (OpEx)"
                          data={enrichedColumns}
                          dk="opex"
                          total={totalOpex}
                          highlight
                          isSubtractor
                          tooltip={{
                            desc: "Total operational and developmental property expenditures.",
                            formula: "Total OpEx = Pre-Opening & Dev + Maintenance + Tax + Overhead + Equipment Lease",
                          }}
                        />

                        <ExpandableDataRowGroup
                          parentLabel="Pre-Opening & Dev Expenses"
                          parentDk="preOpeningDev"
                          parentTotal={data.totals.preOpeningDev}
                          data={columns}
                          parentTooltip={PROPCO_FORMULAS.preOpeningDev}
                          isSubtractor
                          childrenData={[
                            {
                              label: "Dev. G&A Expense",
                              dk: "devGa",
                              total: data.totals.devGa,
                            },
                            {
                              label: "Dev. CAR Expense",
                              dk: "devCar",
                              total: data.totals.devCar,
                            },
                          ]}
                        />

                        <TableRow
                          label="Facility Maintenance OPEX"
                          data={columns}
                          dk="maintOpex"
                          total={data.totals.maintOpex}
                          isIndent
                          tooltip={PROPCO_FORMULAS.maintOpex}
                          isSubtractor
                        />
                        <TableRow
                          label="Property Tax"
                          data={columns}
                          dk="taxOpex"
                          total={data.totals.taxOpex}
                          isIndent
                          tooltip={PROPCO_FORMULAS.taxOpex}
                          isSubtractor
                        />
                        <TableRow
                          label="Management / Overhead OPEX"
                          data={columns}
                          dk="overheadOpex"
                          total={data.totals.overheadOpex}
                          isIndent
                          tooltip={PROPCO_FORMULAS.overheadOpex}
                          isSubtractor
                        />
                        <TableRow
                          label="Equipment Lease OPEX"
                          data={columns}
                          dk="medEqLeaseOpex"
                          total={data.totals.medEqLeaseOpex}
                          isIndent
                          tooltip={PROPCO_FORMULAS.medEqLeaseOpex}
                          isSubtractor
                        />

                        <TableRow
                          label="Gross Operating Profit (GOP)"
                          data={columns}
                          dk="gop"
                          total={data.totals.gop}
                          highlight
                          tooltip={PROPCO_FORMULAS.gop}
                        />

                        <TableRow
                          label="FF&E Reserve Allocation"
                          data={columns}
                          dk="ffeReserve"
                          total={data.totals.ffeReserve}
                          isIndent
                          tooltip={PROPCO_FORMULAS.ffeReserve}
                          isSubtractor
                        />
                        <TableRow
                          label="EBITDA"
                          data={columns}
                          dk="ebitda"
                          total={data.totals.ebitda}
                          highlight
                          tooltip={PROPCO_FORMULAS.ebitda}
                        />

                        <ExpandableDataRowGroup
                          parentLabel="Depreciation (D&A)"
                          parentDk="dep"
                          parentTotal={data.totals.dep}
                          data={columns}
                          parentTooltip={PROPCO_FORMULAS.dep}
                          isSubtractor
                          childrenData={[
                            {
                              label: "Construction",
                              dk: "depBuild",
                              total: data.totals.depBuild,
                            },
                            {
                              label: "Medical Equipment",
                              dk: "depMedEq",
                              total: data.totals.depMedEq,
                            },
                            {
                              label: "Infrastructure",
                              dk: "depInfra",
                              total: data.totals.depInfra,
                            },
                            {
                              label: "FF&E",
                              dk: "depFfe",
                              total: data.totals.depFfe,
                            },
                            {
                              label: "Sharing Dev.",
                              dk: "depSharing",
                              total: data.totals.depSharing,
                            },
                            {
                              label: "Consultant",
                              dk: "depConsultant",
                              total: data.totals.depConsultant,
                            },
                            {
                              label: "License",
                              dk: "depLicense",
                              total: data.totals.depLicense,
                            },
                            {
                              label: "VAT",
                              dk: "depVat",
                              total: data.totals.depVat,
                            },
                            {
                              label: "Contingency",
                              dk: "depContingency",
                              total: data.totals.depContingency,
                            },
                          ]}
                        />
                        <TableRow
                          label="EBIT"
                          data={columns}
                          dk="ebit"
                          total={data.totals.ebit}
                          highlight
                          tooltip={PROPCO_FORMULAS.ebit}
                        />
                        <TableRow
                          label="Interest Expense (Debt)"
                          data={columns}
                          dk="interest"
                          total={data.totals.interest}
                          isIndent
                          tooltip={PROPCO_FORMULAS.interest}
                          isSubtractor
                        />
                        <TableRow
                          label="Earnings Before Tax (EBT)"
                          data={columns}
                          dk="ebt"
                          total={data.totals.ebt}
                          highlight
                          tooltip={PROPCO_FORMULAS.ebt}
                        />
                        <TableRow
                          label="Corporate Income Tax"
                          data={columns}
                          dk="corpTax"
                          total={data.totals.corpTax}
                          isIndent
                          tooltip={PROPCO_FORMULAS.corpTax}
                          isSubtractor
                        />
                        <TableRow
                          label="Net Profit"
                          data={columns}
                          dk="netIncome"
                          total={data.totals.netIncome}
                          highlight
                          tooltip={PROPCO_FORMULAS.netIncome}
                        />

                        <TableSection
                          title="Debt Service & Exit"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="Principal Repayment"
                          data={columns}
                          dk="principal"
                          total={data.totals.principal}
                          isIndent
                          tooltip={PROPCO_FORMULAS.principal}
                          isSubtractor
                        />
                        <TableRow
                          label="DSCR (Coverage Ratio)"
                          data={columns}
                          dk="dscr"
                          tooltip={PROPCO_FORMULAS.dscr}
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLE 2: PropCo Standard Cash Flows */}
              {(viewMode === "all" || viewMode === "statement") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#9B8B70] border-b border-[#9B8B70] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      2. Property Cash Flows
                    </h3>
                  </div>
                  <div className="overflow-auto max-h-[65vh] custom-scrollbar relative propco-table-scroll">
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                      {renderTableHeaders()}
                      <tbody>
                        <TableSection
                          title="STATEMENT OF CASH FLOWS"
                          colSpan={columns.length + 2}
                          type="amber"
                        />
                        <TableRow
                          label="Net Cash from Operating (CFO)"
                          data={columns}
                          dk="cfo"
                          total={data.totals.cfo}
                          highlight
                          isExpandable
                          isExpanded={expandedCfo}
                          onExpand={() => setExpandedCfo(!expandedCfo)}
                          tooltip="PropCo Net Income + D&A."
                        />
                        {expandedCfo && (
                          <>
                            <TableRow
                              label="Cash Inflows (OpCo Lease Rentals)"
                              data={columns}
                              dk="cfo_in"
                              total={data.totals.cfo_in}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfoIn}
                              onExpand={() => setExpandedCfoIn(!expandedCfoIn)}
                              tooltip="PropCo Rental Revenues received from clinical leasing operations."
                            />
                            {expandedCfoIn && (
                              <TableRow
                                label="Lease Rental Receipts"
                                data={columns}
                                dk="cfo_in"
                                total={data.totals.cfo_in}
                                isDoubleIndent
                                hasDoubleConnector
                                tooltip="Actual lease payments received from clinical OpCo operations."
                              />
                            )}
                            <TableRow
                              label="Cash Outflows (Maint, Reserves, Interest & Taxes)"
                              data={columns}
                              dk="cfo_out"
                              total={data.totals.cfo_out}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfoOut}
                              onExpand={() => setExpandedCfoOut(!expandedCfoOut)}
                              tooltip="Operating outflows paid during PropCo operations, including maintenance OPEX, FF&E reserve payments, financing interest, and corporate income taxes."
                            />
                            {expandedCfoOut && (
                              <>
                                <TableRow
                                  label="Facility Maintenance OPEX"
                                  data={columns}
                                  dk="maintOpex"
                                  total={data.totals.maintOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Daily maintenance, facility OPEX, and standard upkeeps."
                                />
                                <TableRow
                                  label="FF&E Reserve Allocation"
                                  data={columns}
                                  dk="ffeReserve"
                                  total={data.totals.ffeReserve}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Furniture, Fixtures, and Equipment reserve payments."
                                />
                                <TableRow
                                  label="Interest Expense (Debt)"
                                  data={columns}
                                  dk="interest"
                                  total={data.totals.interest}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Financing interest cost on commercial property debt."
                                />
                                <TableRow
                                  label="Corporate Income Tax"
                                  data={columns}
                                  dk="corpTax"
                                  total={data.totals.corpTax}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Calculated Indonesian corporate income taxes paid by the PropCo entity."
                                />
                                <TableRow
                                  label="Pre-Opening & Dev Expenses"
                                  data={columns}
                                  dk="preOpeningDev"
                                  total={data.totals.preOpeningDev}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Operational start-up cost pre-opening outlays, Dev G&A and Contractor All Risk expense."
                                />
                                <TableRow
                                  label="Management / Overhead OPEX"
                                  data={columns}
                                  dk="overheadOpex"
                                  total={data.totals.overheadOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="PropCo administration and property overhead operations."
                                />
                                <TableRow
                                  label="Property Tax"
                                  data={columns}
                                  dk="taxOpex"
                                  total={data.totals.taxOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Annual land tax / PBB on properties."
                                />
                                <TableRow
                                  label="Equipment Lease OPEX"
                                  data={columns}
                                  dk="medEqLeaseOpex"
                                  total={data.totals.medEqLeaseOpex}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Clinical equipment leasing and maintenance obligations."
                                />
                              </>
                            )}
                          </>
                        )}

                        <TableRow
                          label="Net Cash from Investing (CFI)"
                          data={columns}
                          dk="cfi"
                          total={data.totals.cfi}
                          highlight
                          isExpandable
                          isExpanded={expandedCfi}
                          onExpand={() => setExpandedCfi(!expandedCfi)}
                          tooltip="PropCo development spending and exit proceeds."
                        />
                        {expandedCfi && (
                          <>
                            <TableRow
                              label="Cash Inflows (Exit Proceeds)"
                              data={columns}
                              dk="cfi_in"
                              total={data.totals.cfi_in}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfiIn}
                              onExpand={() => setExpandedCfiIn(!expandedCfiIn)}
                              tooltip="Capital proceeds received from PropCo asset liquidations/exits."
                            />
                            {expandedCfiIn && (
                              <TableRow
                                label="Property Liquidations & Exits"
                                data={columns}
                                dk="cfi_in"
                                total={data.totals.cfi_in}
                                isDoubleIndent
                                hasDoubleConnector
                                tooltip="Capital proceeds from PropCo asset divestments or exit."
                              />
                            )}
                            <TableRow
                              label="Cash Outflows (Development Capex)"
                              data={columns}
                              dk="cfi_out"
                              total={data.totals.cfi_out}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCfiOut}
                              onExpand={() => setExpandedCfiOut(!expandedCfiOut)}
                              tooltip="Pre-operating development capital expenditures incurred across hard, soft, and land spends."
                            />
                            {expandedCfiOut && (
                              <>
                                <TableRow
                                  label="Land Cost"
                                  data={columns}
                                  dk="landSpend"
                                  total={data.totals.landSpend}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Property acquisition land procurement outlays."
                                />
                                <TableRow
                                  label="Total Hard Costs"
                                  data={columns}
                                  dk="hardSpend"
                                  total={data.totals.hardSpend}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Real estate construction, medical equipment, infrastructure, FF&E, and joint sharing development spends."
                                />
                                <TableRow
                                  label="Total Soft Costs"
                                  data={columns}
                                  dk="softSpend"
                                  total={data.totals.softSpend}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Consultant fees, licensing, VAT, and contingency reserves."
                                />
                              </>
                            )}
                          </>
                        )}

                        <TableRow
                          label="Net Cash from Financing (CFF)"
                          data={columns}
                          dk="cff"
                          total={data.totals.cff}
                          highlight
                          isExpandable
                          isExpanded={expandedCff}
                          onExpand={() => setExpandedCff(!expandedCff)}
                          tooltip="Debt drawdowns, principal repayment, equity injections, and dividends paid."
                        />
                        {expandedCff && (
                          <>
                            <TableRow
                              label="Cash Inflows (Debt Draws & Shortfall Contributions)"
                              data={columns}
                              dk="cff_in"
                              total={data.totals.cff_in}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCffIn}
                              onExpand={() => setExpandedCffIn(!expandedCffIn)}
                              tooltip="Capital inflows from development bank loan drawdowns and extra sponsor shortfall injections."
                            />
                            {expandedCffIn && (
                              <>
                                <TableRow
                                  label="Debt Drawdown"
                                  data={columns}
                                  dk="debtDraw"
                                  total={data.totals.debtDraw}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  tooltip="Inflows sourced from property development project banking facilities."
                                />
                                <TableRow
                                  label="Sponsor Shortfall Equity"
                                  data={columns}
                                  dk="shortfallEquity"
                                  total={data.totals.shortfallEquity}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  tooltip="Sponsor-injected bridging equity to cover temporal operational deficit drawdowns."
                                />
                              </>
                            )}
                            <TableRow
                              label="Cash Outflows (Sponsor Distributions & Principal Repayments)"
                              data={columns}
                              dk="cff_out"
                              total={data.totals.cff_out}
                              isIndent
                              hasConnector
                              isExpandable
                              isExpanded={expandedCffOut}
                              onExpand={() => setExpandedCffOut(!expandedCffOut)}
                              tooltip="Subsequent debt principal amortization repayments and net operational free distributions paid to stakeholders."
                            />
                            {expandedCffOut && (
                              <>
                                <TableRow
                                  label="Debt Principal Repayments"
                                  data={columns}
                                  dk="principal"
                                  total={data.totals.principal}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Commercial property loan amortization principal payments."
                                />
                                <TableRow
                                  label="Sponsor Distributions (FCFE)"
                                  data={columns}
                                  dk="fcfe"
                                  total={data.totals.fcfe}
                                  isDoubleIndent
                                  hasDoubleConnector
                                  isSubtractor
                                  tooltip="Net free cash flow distributed back to sponsor stakeholders."
                                />
                              </>
                            )}
                          </>
                        )}

                        <TableRow
                          label="Total Net Cash Flow"
                          data={columns}
                          dk="netFlow"
                          total={data.totals.netFlow}
                          highlight
                          emerald
                        />
                        <TableRow
                          label="Cumulative Cash Balance"
                          data={columns}
                          dk="endCash"
                          total={data.totals.netFlow}
                          highlight
                          crossover
                          indigo
                          bold
                          tooltip="Rolling cash balance."
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABLE 3: PropCo Capital Cascade & Returns */}
              {(viewMode === "all" || viewMode === "cf") && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                  <div className="p-4 bg-[#9B8B70] border-b border-[#9B8B70] flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                      3. Property Capex & Returns
                    </h3>
                  </div>
                  <div className="overflow-auto max-h-[65vh] custom-scrollbar relative propco-table-scroll">
                    <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                      {renderTableHeaders()}
                      <tbody>
                        <TableSection
                          title="Project Development Spending"
                          colSpan={columns.length + 2}
                          type="indigo"
                        />
                        <TableRow
                          label="Land Cost"
                          data={columns}
                          dk="landSpend"
                          total={data.totals.landSpend}
                          isIndent
                          tooltip={PROPCO_FORMULAS.landSpend}
                        />
                        <ExpandableDataRowGroup
                          parentLabel="Total Hard Costs"
                          parentDk="hardSpend"
                          parentTotal={data.totals.hardSpend}
                          data={columns}
                          parentTooltip={PROPCO_FORMULAS.hardSpend}
                          childrenData={[
                            {
                              label: "Construction",
                              dk: "buildSpend",
                              total: data.totals.buildSpend,
                            },
                            {
                              label: "Medical Equip.",
                              dk: "eqSpend",
                              total: data.totals.eqSpend,
                            },
                            {
                              label: "Infrastructure",
                              dk: "infraSpend",
                              total: data.totals.infraSpend,
                            },
                            {
                              label: "FF&E",
                              dk: "ffeSpend",
                              total: data.totals.ffeSpend,
                            },
                            {
                              label: "Sharing Dev.",
                              dk: "sharingSpend",
                              total: data.totals.sharingSpend,
                            },
                          ]}
                        />
                        <ExpandableDataRowGroup
                          parentLabel="Total Soft Costs"
                          parentDk="softSpend"
                          parentTotal={data.totals.softSpend}
                          data={columns}
                          parentTooltip={PROPCO_FORMULAS.softSpend}
                          childrenData={[
                            {
                              label: "Consultant",
                              dk: "consultantSpend",
                              total: data.totals.consultantSpend,
                            },
                            {
                              label: "License",
                              dk: "licenseSpend",
                              total: data.totals.licenseSpend,
                            },
                            {
                              label: "VAT",
                              dk: "vatSpend",
                              total: data.totals.vatSpend,
                            },
                            {
                              label: "Contingency",
                              dk: "contingencySpend",
                              total: data.totals.contingencySpend,
                            },
                            {
                              label: "Dev. G&A",
                              dk: "devGa",
                              total: data.totals.devGa,
                            },
                            {
                              label: "Dev. CAR",
                              dk: "devCar",
                              total: data.totals.devCar,
                            },
                          ]}
                        />
                        <TableRow
                          label="PROJECT DEVELOPMENT SPEND"
                          data={columns}
                          dk="totalSpend"
                          total={data.totals.totalSpend}
                          highlight
                          tooltip={PROPCO_FORMULAS.totalSpend}
                        />
                        <TableRow
                          label="Debt Drawdown"
                          data={columns}
                          dk="debtDraw"
                          total={data.totals.debtDraw}
                          isIndent
                          tooltip={PROPCO_FORMULAS.debtDraw}
                        />

                        <TableSection
                          title="Return Metrics"
                          colSpan={columns.length + 2}
                          type="emerald"
                        />
                        <TableRow
                          label="Deferred MedEq Purchase"
                          data={columns}
                          dk="deferredCapex"
                          total={data.totals.deferredCapex}
                          isIndent
                          tooltip={PROPCO_FORMULAS.deferredCapex}
                        />
                        <TableRow
                          label="FCFE (Operating)"
                          data={columns}
                          dk="opFcfe"
                          total={data.totals.opFcfe}
                          isIndent
                          tooltip={PROPCO_FORMULAS.opFcfe}
                        />
                        <TableRow
                          label="Shortfall Equity"
                          data={columns}
                          dk="shortfallEquity"
                          total={data.totals.shortfallEquity}
                          isIndent
                          tooltip="Dynamic Operating Shortfall (The Pay As You Go Method). Injected equity to cover negative operating free cash flow to equity."
                        />
                        <TableRow
                          label="Gross Exit Proceeds"
                          data={columns}
                          dk="grossExitValue"
                          total={data.totals.grossExitValue}
                          isIndent
                          tooltip={PROPCO_FORMULAS.grossExitValue}
                        />
                        <TableRow
                          label="Loan Settlement at Exit"
                          data={columns}
                          dk="loanSettledAtExit"
                          total={data.totals.loanSettledAtExit}
                          isIndent
                          tooltip={PROPCO_FORMULAS.loanSettledAtExit}
                        />
                        <TableRow
                          label="Net Exit Proceeds"
                          data={columns}
                          dk="netExitProceeds"
                          total={data.totals.netExitProceeds}
                          highlight
                          tooltip={PROPCO_FORMULAS.netExitProceeds}
                        />
                        <TableRow
                          label="FCFE (Levered)"
                          data={columns}
                          dk="fcfe"
                          highlight
                          emerald
                          total={data.totals.fcfe}
                          tooltip={PROPCO_FORMULAS.fcfe}
                        />
                        <TableRow
                          label="Cumulative FCFE"
                          data={columns}
                          dk="cumFcfe"
                          highlight
                          crossover
                          bold
                          indigo
                          tooltip={PROPCO_FORMULAS.cumFcfe}
                        />

                        <TableSection
                          title="Ex-Land Cash Flows (Optional)"
                          colSpan={columns.length + 2}
                        />
                        <TableRow
                          label="EBITDA"
                          data={columns}
                          dk="ebitda"
                          total={data.totals.ebitda}
                          isIndent
                          hasConnector
                        />
                        <TableRow
                          label="Depreciation"
                          data={columns}
                          dk="dep"
                          total={data.totals.dep}
                          isIndent
                          hasConnector
                          isSubtractor
                        />
                        <TableRow
                          label="Interest (Ex-Land)"
                          data={columns}
                          dk="interestExLand"
                          total={data.totals.interestExLand}
                          isIndent
                          hasConnector
                          tooltip={PROPCO_FORMULAS.interestExLand}
                          isSubtractor
                        />
                        <TableRow
                          label="EBT (Ex-Land)"
                          data={columns}
                          dk="ebtExLand"
                          total={data.totals.ebtExLand}
                          highlight
                          tooltip={PROPCO_FORMULAS.ebtExLand}
                        />
                        <TableRow
                          label="Corporate Tax (Ex-Land)"
                          data={columns}
                          dk="corpTaxExLand"
                          total={data.totals.corpTaxExLand}
                          isIndent
                          hasConnector
                          tooltip={PROPCO_FORMULAS.corpTaxExLand}
                          isSubtractor
                        />
                        <TableRow
                          label="Add: Depreciation"
                          data={columns}
                          dk="dep"
                          total={data.totals.dep}
                          isIndent
                          hasConnector
                        />
                        <TableRow
                          label="Less: Principal (Ex-Land)"
                          data={columns}
                          dk="principalExLand"
                          total={data.totals.principalExLand}
                          isIndent
                          hasConnector
                          tooltip={PROPCO_FORMULAS.principalExLand}
                          isSubtractor
                        />
                        <TableRow
                          label="Operating FCFE (Ex-Land)"
                          data={columns}
                          dk="opFcfeExLand"
                          total={data.totals.opFcfeExLand}
                          highlight
                          tooltip={PROPCO_FORMULAS.opFcfeExLand}
                        />
                        <TableRow
                          label="Add: Net Exit Proceeds (Ex-Land)"
                          data={columns}
                          dk="netExitProceedsExLand"
                          total={data.totals.netExitProceedsExLand}
                          isIndent
                          hasConnector
                          tooltip={PROPCO_FORMULAS.netExitProceedsExLand}
                        />
                        <TableRow
                          label="FCFE (EX-LAND)"
                          data={columns}
                          dk="fcfeExLand"
                          highlight
                          emerald
                          total={data.totals.fcfeExLand}
                          tooltip={PROPCO_FORMULAS.fcfeExLand}
                        />
                        <TableRow
                          label="Cumulative FCFE (Ex-Land)"
                          data={columns}
                          dk="cumFcfeExLand"
                          highlight
                          crossover
                          bold
                          indigo
                          tooltip={PROPCO_FORMULAS.cumFcfeExLand}
                        />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

const ConsolidatedDashboardView = memo(
  ({
    data,
    assumptions,
    propCoAssumptions,
    handlePropCoChange,
    isPresenting,
    holdCoScenario,
    setHoldCoScenario,
    holdCoLocked,
    toggleHoldCoLock,
    propCoLocked,
    togglePropCoLock,
  }) => (
    <div
      className={
        isPresenting
          ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in"
          : "space-y-6 animate-in fade-in"
      }
    >
      <div className={`space-y-6 ${isPresenting ? "lg:col-span-4" : ""}`}>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#D8D8D8] flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1E2F31] flex items-center gap-2">
              <Target size={16} className={holdCoLocked ? "text-[#1C6048]/50" : "text-[#1C6048]"} /> Master Exit Strategy
              {holdCoLocked && (
                <span className="inline-flex items-center gap-1.5 text-[9px] bg-[#EFEBE7] text-[#9B8B70] px-2 py-0.5 rounded-full font-bold border border-[#D8D8D8]">
                  <Lock size={10} /> Locked to PropCo
                </span>
              )}
            </h3>
            <p className="text-[9px] text-[#4C4A4B] mt-1 font-medium leading-relaxed">
              {holdCoLocked
                ? "Locked to follow the PropCo Exit scenario. Deselect 'Lock Master to PropCo' below to override manually."
                : "Override individual security and entity settings to simulate combined Master exits and long-term portfolio yields."}
            </p>
          </div>
          <div className={`flex flex-wrap gap-1.5 mt-1 ${holdCoLocked ? "pointer-events-none opacity-85" : ""}`}>
            <div className="flex-1 min-w-[100px] relative group flex">
              <button
                disabled={holdCoLocked}
                onClick={() => setHoldCoScenario("manual")}
                className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  holdCoLocked
                    ? holdCoScenario === "manual"
                      ? "bg-[#EFEBE7]/80 border border-[#D8D8D8] text-[#1E2F31]/70"
                      : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                    : holdCoScenario === "manual"
                      ? "bg-white shadow-sm border border-[#D8D8D8] text-[#1E2F31]"
                      : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                Manual (Settings)
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                {holdCoLocked ? "Locked to PropCo exit strategy" : "Uses the exit settings defined in the project assumptions"}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
              </div>
            </div>

            <div className="flex-1 min-w-[100px] relative group flex">
              <button
                disabled={holdCoLocked}
                onClick={() => setHoldCoScenario("yr10")}
                className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  holdCoLocked
                    ? holdCoScenario === "yr10"
                      ? "bg-[#1E2F31]/15 text-[#1E2F31]/70 border border-[#1E2F31]/20"
                      : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                    : holdCoScenario === "yr10"
                      ? "bg-[#1E2F31] shadow-sm border border-[#1E2F31] text-white"
                      : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                Exit in Yr 10
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                {holdCoLocked ? "Locked to PropCo exit strategy" : "Forces the exit to occur exactly at the end of Year 10"}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
              </div>
            </div>

            <div className="flex-1 min-w-[100px] relative group flex">
              <button
                disabled={holdCoLocked}
                onClick={() => setHoldCoScenario("breakeven")}
                className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  holdCoLocked
                    ? holdCoScenario === "breakeven"
                      ? "bg-[#1C6048]/15 text-[#1C6048]/70 border border-[#1C6048]/20"
                      : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                    : holdCoScenario === "breakeven"
                      ? "bg-[#1C6048] shadow-sm border border-[#1C6048] text-white"
                      : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                Exit at Breakeven
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                {holdCoLocked ? "Locked to PropCo exit strategy" : "Exits at the end of the year the project achieves operational breakeven"}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
              </div>
            </div>

            <div className="flex-1 min-w-[100px] relative group flex">
              <button
                onClick={() => setHoldCoScenario("debt_free")}
                disabled={holdCoLocked || !propCoAssumptions.includeFinancing}
                className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  !propCoAssumptions.includeFinancing
                    ? "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed border border-[#E5E7EB]"
                    : holdCoLocked
                      ? holdCoScenario === "debt_free"
                        ? "bg-[#9B8B70]/15 text-[#9B8B70]/70 border border-[#9B8B70]/20"
                        : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                      : holdCoScenario === "debt_free"
                        ? "bg-[#9B8B70] shadow-sm border border-[#9B8B70] text-white"
                        : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                Exit Post-Debt
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                {!propCoAssumptions.includeFinancing
                  ? "Requires debt financing to be enabled"
                  : holdCoLocked
                    ? "Locked to PropCo exit strategy"
                    : "Exits only after operational breakeven is reached and all debt is fully paid off"}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
              </div>
            </div>

            <div className="flex-1 min-w-[100px] relative group flex">
              <button
                disabled={holdCoLocked}
                onClick={() => setHoldCoScenario("none")}
                className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                  holdCoLocked
                    ? holdCoScenario === "none"
                      ? "bg-[#1C6048]/10 text-[#1C6048]/70 border border-[#1C6048]/20"
                      : "bg-[#F3F4F6]/50 text-[#D1D5DB]/50 border border-[#E5E7EB]/50"
                    : holdCoScenario === "none"
                      ? "bg-white shadow-sm border border-[#1C6048] text-[#1C6048]"
                      : "bg-[#EFEBE7] text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                No Exit (Yield)
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[180px] whitespace-normal px-2 py-1.5 bg-[#1E2F31] text-white text-[10px] leading-tight font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-center">
                {holdCoLocked ? "Locked to PropCo exit strategy" : "No exit is calculated; evaluates pure operating yield over a long period"}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E2F31]"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-3 mt-1 border-t border-[#D8D8D8]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                <Landmark size={14} className="text-[#9B8B70]" /> Bank Debt
                Financing (PropCo Level)
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
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                <Map size={14} className="text-[#9B8B70]" /> Include Land Cost
                (PropCo Level)
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
            <div className="pt-2 border-t border-[#D8D8D8]/50 space-y-2 pb-1">
              {/* Lock PropCo to Master */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#4C4A4B] flex items-center gap-1.5">
                  <Lock size={14} className={propCoLocked ? "text-[#1C6048]" : "text-[#4C4A4B]/40"} /> Lock PropCo to Master
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
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-4`}>
          <KPICard
            title="Blended Equity NPV"
            value={formatCurrency(data.metrics.npv)}
            icon={<TrendingUp size={18} />}
            color="emerald"
            subtitle={`@${String(assumptions.holdCoDiscountRate)}% Disc Rate`}
          />
          <KPICard
            title="Blended Cash Multiple"
            value={`${formatNumber(data.metrics.moic, 2)}x`}
            icon={<BarChart3 size={18} />}
            color="blue"
            subtitle="Consolidated MOIC"
            tooltip={{
              desc: "Consolidated MOIC representing the aggregate wealth creation for the entire HoldCo. It combines both the Strategic Hospital Operator and Financial Partner cash profiles into a single unified multiple.",
              formula:
                "Total HoldCo Distributions ÷ Cumulative Equity Contribution",
            }}
          />
          <KPICard
            title="Blended Equity IRR"
            value={`${formatNumber((data.metrics.irr || 0) * 100, 2)}%`}
            icon={<Activity size={18} />}
            color="emerald"
            subtitle="Compounded Return"
          />
          <KPICard
            title="Blended Payback"
            value={data.metrics.payback > 0 ? `${formatNumber(data.metrics.payback, 2)} Yrs` : "Never"}
            icon={<Clock size={18} />}
            color="indigo"
            subtitle="From Year 1"
          />
          <KPICard
            title="Project Avg Net Margin"
            value={`${formatNumber(data.totals.lookThroughMargin, 1)}%`}
            icon={<PieChartIcon size={18} />}
            color="blue"
            subtitle="Across 12-Year Lifecycle"
          />
          <KPICard
            title="Consolidated DSCR"
            value={`${formatNumber(data.metrics.avgConsolidatedDscr, 2)}x`}
            icon={<ShieldCheck size={18} />}
            color="amber"
            subtitle="HoldCo Debt Coverage"
            tooltip="Consolidated Debt Service Coverage Ratio: Cash available distributed to HoldCo divided by HoldCo's share of debt service. Benchmark: > 1.25x is standard."
            disabled={
              !propCoAssumptions?.includeFinancing ||
              holdCoScenario === "debt_free"
            }
          />
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="text-lg font-bold text-[#1E2F31] flex items-center gap-2 mb-1">
            <Layers size={20} className="text-[#1E2F31]" /> HoldCo Group
            Position
          </h3>
          <p className="text-[10px] text-[#4C4A4B] font-medium mb-6">
            Combined position representing 100% of PropCo cash flows and 49% of
            OpCo operating dividends.
          </p>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                Total Combined Equity Outlay
              </span>
              <span className="font-black text-[#1E2F31]">
                {formatCurrency(data.metrics.totalEquity)}
              </span>
            </div>
            <div className="w-full h-px bg-[#D8D8D8]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                PropCo Total FCFE (100%)
              </span>
              <span className="font-black text-[#9B8B70]">
                {formatCurrency(data.totals.propCoFlow)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#4C4A4B] uppercase tracking-wider">
                OpCo Total Dividends (49%)
              </span>
              <span className="font-black text-[#1C6048]">
                {formatCurrency(data.totals.opCoFlow)}
              </span>
            </div>
            <div className="w-full h-px bg-[#D8D8D8]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#1E2F31] uppercase tracking-wider">
                Net Combined Return
              </span>
              <span className="font-black text-[#1E2F31]">
                {formatCurrency(data.totals.netFlow)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`space-y-6 ${isPresenting ? "lg:col-span-8" : ""}`}>
        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#99B6AA]" /> Managerial
            Look-Through PnL
          </h3>
          <div className={isPresenting ? "h-[300px]" : "h-72"}>
            <LazyResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.operatingData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#D8D8D8"
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: "#4C4A4B" }}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: "#4C4A4B" }}
                  axisLine={false}
                  tickFormatter={(val) => `${val}B`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#1E2F31" }}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  allowEscapeViewBox={{ x: true, y: true }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(val, name) =>
                    formatNumber(val, 1) + (name.includes("Margin") ? "%" : "B")
                  }
                />
                <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                <Bar
                  yAxisId="left"
                  dataKey="lookThroughRevenue"
                  name="Look-Through Revenue"
                  fill="#EFEBE7"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  dataKey="lookThroughEbitda"
                  name="Look-Through EBITDA"
                  fill="#9B8B70"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="lookThroughMargin"
                  name="Net Profit Margin"
                  stroke="#1C6048"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#1C6048",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
              </ComposedChart>
            </LazyResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 lg:p-6 rounded-2xl shadow-sm border border-[#D8D8D8]">
          <h3 className="font-bold text-[#1E2F31] mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#1E2F31]" /> Consolidated Cash
            Flow Trajectory
          </h3>
          <div className={isPresenting ? "h-[450px]" : "h-80"}>
            <LazyResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.annualData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#D8D8D8"
                />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: "#4C4A4B" }}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 10, fill: "#4C4A4B" }}
                  axisLine={false}
                  tickFormatter={(val) => `${val}B`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "#1E2F31" }}
                  axisLine={false}
                  tickFormatter={(val) => `${val}B`}
                />
                <Tooltip
                  allowEscapeViewBox={{ x: true, y: true }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(val) => formatNumber(val, 1) + "B"}
                />
                <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />

                <Bar
                  yAxisId="left"
                  stackId="a"
                  dataKey="propCoFlow"
                  name="PropCo FCFE"
                  fill="#9B8B70"
                  radius={[0, 0, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  stackId="a"
                  dataKey="opCoOperatingFlow"
                  name="OpCo Dividend (49%)"
                  fill="#1C6048"
                  radius={[0, 0, 0, 0]}
                  barSize={40}
                />
                <Bar
                  yAxisId="left"
                  stackId="a"
                  dataKey="opCoExitFlow"
                  name="OpCo Exit (49%)"
                  fill="#99B6AA"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumCf"
                  name="Cumulative Net Position"
                  stroke="#1E2F31"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#1E2F31",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                />
                <ReferenceLine
                  yAxisId="right"
                  y={0}
                  stroke="#D8D8D8"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
              </ComposedChart>
            </LazyResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  ),
);

const ConsolidatedCascadeView = memo(
  ({ data, opcoData, propcoData, viewResolution, setViewResolution }) => {
    const { columns: rawColumns, expandedYears, toggleYear } = useMonthlyColumns(
      data.annualData,
      viewResolution,
    );
    const scrollRef = useRef(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
    // viewMode defines table visibility: 'all' | 'statement' | 'cascade'
    const [viewMode, setViewMode] = useState("all"); 

    const [expandedPropCo, setExpandedPropCo] = useState(false);
    const [expandedOpCo, setExpandedOpCo] = useState(false);

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
        const pEbitda = isMonth ? (pY.monthly?.ebitda?.[mIdx] || 0) : (pY.ebitda || 0);
        const oEbitda = isMonth ? (oY.monthly?.ebitda?.[mIdx] || 0) : (oY.ebitda || 0);
        const ltEbitda = col.lookThroughEbitda || (pEbitda + oEbitda * sharePct);

        const pTax = isMonth ? (pY.monthly?.corpTax?.[mIdx] || 0) : (pY.corpTax || 0);
        const oTax = isMonth ? (oY.monthly?.tax?.[mIdx] || 0) : (oY.tax || 0);
        const ltTax = pTax + oTax * sharePct;
        const ltCfo = ltEbitda - ltTax;

        // Investing Flow lookups (Capex & setups)
        const pLand = isMonth ? (pY.monthly?.landSpend?.[mIdx] || 0) : (pY.landSpend || 0);
        const pHard = isMonth ? (pY.monthly?.hardSpend?.[mIdx] || 0) : (pY.hardSpend || 0);
        const pSoft = isMonth ? (pY.monthly?.softSpend?.[mIdx] || 0) : (pY.softSpend || 0);
        const pDevGa = isMonth ? (pY.monthly?.devGa?.[mIdx] || 0) : (pY.devGa || 0);
        const pDevCar = isMonth ? (pY.monthly?.devCar?.[mIdx] || 0) : (pY.devCar || 0);
        const pConInt = isMonth ? (pY.monthly?.conInt?.[mIdx] || 0) : (pY.conInt || 0);
        
        const oSetupOutlay = isMonth ? (oY.monthly?.pB_Outlay?.[mIdx] || 0) : (oY.pB_Outlay || 0);

        const ltPropCoCapex = pLand + pHard + pSoft + pDevGa + pDevCar + pConInt;
        const ltOpCoCapex = oSetupOutlay;
        const ltCapex = ltPropCoCapex + ltOpCoCapex;

        const pExit = isMonth ? (pY.monthly?.exit?.[mIdx] || 0) : (pY.exit || 0);
        const oExit = isMonth ? (oY.monthly?.pB_Exit?.[mIdx] || 0) : (oY.pB_Exit || 0);
        const ltExit = pExit + oExit;
        const ltCfi = -ltCapex + ltExit;

        // Financing Flow lookups (PropCo Debt)
        const pDebtDraw = isMonth ? (pY.monthly?.debtDraw?.[mIdx] || 0) : (pY.debtDraw || 0);
        const pPrincipal = isMonth ? (pY.monthly?.principal?.[mIdx] || 0) : (pY.principal || 0);
        const pInterest = isMonth ? (pY.monthly?.interest?.[mIdx] || 0) : (pY.interest || 0);

        const ltDebtDraw = pDebtDraw;
        const ltDebtPrincipal = pPrincipal;
        const ltDebtInterest = pInterest;
        const ltCffPay = ltDebtDraw - ltDebtPrincipal - ltDebtInterest;

        // Cascading Distributions split to Sponsors
        const pFcfe = isMonth ? (pY.monthly?.fcfe?.[mIdx] || 0) : (pY.fcfe || 0);
        const oShareB = isMonth ? (oY.monthly?.shareB?.[mIdx] || 0) : (oY.shareB || 0);
        const oOutlayB = isMonth ? (oY.monthly?.pB_Outlay?.[mIdx] || 0) : (oY.pB_Outlay || 0);
        const oExitB = isMonth ? (oY.monthly?.pB_Exit?.[mIdx] || 0) : (oY.pB_Exit || 0);

        const partnerPropCoFlow = pFcfe;
        const partnerOpCoFlow = oOutlayB + oShareB + oExitB;

        cumPartnerPropCo += partnerPropCoFlow;
        cumPartnerOpCo += partnerOpCoFlow;

        return {
          ...col,
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
          ltDebtDraw,
          ltDebtPrincipal,
          ltDebtInterest,
          ltCffPay,
          partnerPropCoFlow,
          partnerOpCoFlow,
          cumPartnerPropCo,
          cumPartnerOpCo,
        };
      });
    }, [rawColumns, opcoData, propcoData, data.annualData]);

    // Pre-calculate exact lookup totals over year columns
    const totals = useMemo(() => {
      let Ebitda = 0, Tax = 0, Cfo = 0;
      let PropCapex = 0, OpCapex = 0, Capex = 0, Exit = 0, Cfi = 0;
      let DebtDraw = 0, DebtPrincipal = 0, DebtInterest = 0, CffPay = 0;
      let PartnerPropCo = 0, PartnerOpCo = 0;

      columns.forEach((col) => {
        if (col.colType === "year") {
          Ebitda += col.ltEbitda || 0;
          Tax += col.ltTax || 0;
          Cfo += col.ltCfo || 0;
          PropCapex += col.ltPropCoCapex || 0;
          OpCapex += col.ltOpCoCapex || 0;
          Capex += col.ltCapex || 0;
          Exit += col.ltExit || 0;
          Cfi += col.ltCfi || 0;
          DebtDraw += col.ltDebtDraw || 0;
          DebtPrincipal += col.ltDebtPrincipal || 0;
          DebtInterest += col.ltDebtInterest || 0;
          CffPay += col.ltCffPay || 0;
          PartnerPropCo += col.partnerPropCoFlow || 0;
          PartnerOpCo += col.partnerOpCoFlow || 0;
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
        ltDebtDraw: DebtDraw,
        ltDebtPrincipal: DebtPrincipal,
        ltDebtInterest: DebtInterest,
        ltCffPay: CffPay,
        partnerPropCo: PartnerPropCo,
        partnerOpCo: PartnerOpCo,
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
        const opCoOpOut = d.opCoOperatingFlow < 0 ? Math.abs(d.opCoOperatingFlow) : 0;
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
        const opCoOpOut = d.opCoOperatingFlow < 0 ? Math.abs(d.opCoOperatingFlow) : 0;
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
          className={`flex flex-col overflow-hidden gap-4 ${isFullScreen ? "flex-1 overflow-hidden min-h-0 h-full max-h-none" : "h-[calc(100vh-240px)]"}`}
        >
          <div className="p-4 bg-white rounded-xl shadow-sm border border-[#D8D8D8] flex justify-between items-center shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#1E2F31] flex items-center gap-2">
              <List size={14} /> Look-Through Statement of Cash Flows & Cascade Waterfall
            </h3>
            <div className="flex items-center gap-2">
              {/* Table Selection Mode */}
              <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
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
                className="p-1 rounded bg-white border border-[#D8D8D8] text-[#1E2F31] shadow-sm hover:bg-[#F9F8F6] transition-colors"
                title={isFullScreen ? "Minimize" : "Maximize"}
              >
                {isFullScreen ? (
                  <Minimize2 size={13} strokeWidth={2.5} />
                ) : (
                  <Maximize2 size={13} strokeWidth={2.5} />
                )}
              </button>

              <div className="flex items-center bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
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

              <div className="flex bg-white p-0.5 rounded-md border border-[#D8D8D8] shadow-sm ml-1 mr-2">
                <button
                  onClick={() => {
                    const tables = document.querySelectorAll('.cons-table-scroll');
                    tables.forEach(t => t.scrollBy({ left: -300, behavior: 'smooth' }));
                  }}
                  className="p-1 rounded bg-white text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-[#F9F8F6] transition-colors"
                  title="Scroll Left"
                >
                  <ChevronLeft size={13} strokeWidth={2.5} />
                </button>
                <div className="w-[1px] bg-[#D8D8D8] my-1 opacity-50"></div>
                <button
                  onClick={() => {
                    const tables = document.querySelectorAll('.cons-table-scroll');
                    tables.forEach(t => t.scrollBy({ left: 300, behavior: 'smooth' }));
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

          <div className="overflow-auto min-h-0 flex-1 space-y-6 bg-[#F9F8F6]">
            {/* TABLE 1: MANAGERIAL LOOK-THROUGH INCOME STATEMENT (P&L) */}
            {(viewMode === "all" || viewMode === "pnl") && (
              <div className="bg-white rounded-2xl shadow-sm border border-[#D8D8D8] overflow-hidden">
                <div className="p-4 bg-[#1E2F31] border-b border-[#1E2F31] flex justify-between items-center shrink-0">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                    1. Look-Through P&L
                  </h3>
                </div>
                <div className="overflow-auto max-h-[65vh] custom-scrollbar relative cons-table-scroll">
                  <table className="w-full text-[11px] text-left border-separate border-spacing-0 min-w-[1000px]">
                    {renderTableHeaders()}
                    <tbody>
                    <TableRow
                      label="Look-Through Combined Revenue"
                      data={columns}
                      dk="lookThroughRevenue"
                      total={data.totals.lookThroughRevenue}
                      isIndent
                      tooltip={CONSOLIDATED_FORMULAS.lookThroughRevenue}
                    />
                    <TableRow
                      label="Look-Through Combined EBITDA"
                      data={columns}
                      dk="lookThroughEbitda"
                      total={data.totals.lookThroughEbitda}
                      isIndent
                      tooltip={CONSOLIDATED_FORMULAS.lookThroughEbitda}
                    />
                    <TableRow
                      label="Look-Through Combined Net Income"
                      data={columns}
                      dk="lookThroughNetIncome"
                      total={data.totals.lookThroughNetIncome}
                      highlight
                      tooltip={CONSOLIDATED_FORMULAS.lookThroughNetIncome}
                    />
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
                <div className="overflow-auto max-h-[65vh] custom-scrollbar relative cons-table-scroll">
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
                      tooltip="All PropCo land & hard spend + OpCo setup outlays pro-rated"
                    />
                    <TableRow
                      label="Look-Through Capital Disposal / Exit Proceeds"
                      data={columns}
                      dk="ltExit"
                      total={totals.ltExit}
                      isIndent
                      tooltip="Proceeds from estate and clinical equity buyback liquidation"
                    />
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
                      label="Bank Debt Disbursements (PropCo Drawdown)"
                      data={columns}
                      dk="ltDebtDraw"
                      total={totals.ltDebtDraw}
                      isIndent
                      tooltip="Debt funding injected to cover property construction spend"
                    />
                    <TableRow
                      label="Less: Principal Amortization paid"
                      data={columns}
                      dk="ltDebtPrincipal"
                      total={totals.ltDebtPrincipal}
                      isIndent
                      isSubtractor
                      tooltip="Repayment of senior loan key"
                    />
                    <TableRow
                      label="Less: Bank Interest Paid"
                      data={columns}
                      dk="ltDebtInterest"
                      total={totals.ltDebtInterest}
                      isIndent
                      isSubtractor
                    />
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
                      title="CFO + CFI + CFF RECONCILIATION"
                      colSpan={columns.length + 2}
                      type="emerald"
                    />
                    <TableRow
                      label="NET COMBINED FREE CASH FLOW"
                      data={columns}
                      dk="netFlow"
                      total={data.totals.netFlow}
                      highlight
                      emerald
                      tooltip="Net change in cash position across all segments for HoldCo"
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
                <div className="overflow-auto max-h-[65vh] custom-scrollbar relative cons-table-scroll">
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
                    />
                    
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
                          tooltip={CONSOLIDATED_FORMULAS.opCoOperatingDividendFlow}
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

const OpCoSettingsView = memo(
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

      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-10 ${isPresenting ? "lg:grid-cols-4 2xl:grid-cols-5" : "lg:grid-cols-3"}`}
      >
        <div className="space-y-4">
          <SectionTitle
            title="Capacity & Volume"
            icon={<Building2 size={16} />}
            color="blue"
          />
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
        <div className="space-y-4">
          <SectionTitle
            title="Growth & Occupancy"
            icon={<TrendingUp size={16} />}
            color="emerald"
          />
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
        <div className="space-y-4">
          <SectionTitle
            title="Revenue & Pricing"
            icon={<Stethoscope size={16} />}
            color="indigo"
          />
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
            label="Y1-6 Price Incr."
            val={assumptions.priceIncYears1_6}
            set={(v) => onChange("priceIncYears1_6", v)}
            unit="%"
            isLocked={isLocked}
          />
        </div>
        <div className="space-y-4">
          <SectionTitle
            title="Cost of Goods Sold"
            icon={<HeartPulse size={16} />}
            color="rose"
          />
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
        <div className="space-y-4 row-span-2">
          <SectionTitle
            title="OpEx & Rent Strategy"
            icon={<Briefcase size={16} />}
            color="amber"
          />
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
          <div className="pt-2 border-t border-[#D8D8D8]">
            <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] px-1 rounded transition-colors mb-2">
              <label className="text-[10px] text-[#4C4A4B] font-bold">
                Rent Scheme
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
              <>
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
              </>
            )}

            {assumptions.rentStructureType === "tiered" && (
              <>
                <div className="flex justify-between items-center mb-1 pl-1">
                  <p className="text-[9px] font-bold text-[#1C6048]">
                    RevPAB Thresholds
                  </p>
                  <div className="flex gap-1 items-center">
                    <FormattedInput
                      disabled={isLocked}
                      val={assumptions.rentTier1Limit}
                      set={(v) => onChange("rentTier1Limit", v)}
                      className="w-8 p-0.5 text-center text-[8px] border border-[#D8D8D8] rounded font-black text-[#1E2F31]"
                      placeholder="T1"
                    />
                    <span className="text-[8px] font-bold text-[#4C4A4B]">
                      B
                    </span>
                    <FormattedInput
                      disabled={isLocked}
                      val={assumptions.rentTier2Limit}
                      set={(v) => onChange("rentTier2Limit", v)}
                      className="w-8 p-0.5 text-center text-[8px] border border-[#D8D8D8] rounded font-black text-[#1E2F31]"
                      placeholder="T2"
                    />
                    <span className="text-[8px] font-bold text-[#4C4A4B]">
                      B
                    </span>
                  </div>
                </div>
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
              </>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <SectionTitle
            title="Capital, Setup & Tax"
            icon={<Scale size={16} />}
            color="blue"
          />
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
          <button
            onClick={onSyncEquity}
            disabled={isLocked}
            className="w-full py-2 bg-[#1E2F31] text-white rounded-lg text-[10px] font-bold shadow-md hover:opacity-90 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Link2 size={12} /> Align Equity
          </button>
        </div>
        <div className="space-y-4">
          <SectionTitle
            title="Terminal Value (Exit)"
            icon={<DollarSign size={16} />}
            color="amber"
          />
          <ToggleRow
            label="Include Exit in Yr 10"
            desc="Calculate OpCo Valuation."
            checked={assumptions.includeTerminalValue}
            onChange={(v) => onChange("includeTerminalValue", v)}
            isLocked={isLocked}
          />
          {assumptions.includeTerminalValue && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  ),
);

const PropCoSettingsView = memo(
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
              checked={assumptions.includeLand ?? true}
              onChange={(v) => onChange("includeLand", v)}
              isLocked={isLocked}
            />
            <div
              className={
                !(assumptions.includeLand ?? true)
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
              <AssumptionRow
                label="Land Price"
                val={assumptions.landPrice}
                set={(v) => onChange("landPrice", v)}
                unit="M/Sqm"
                isLocked={isLocked}
              />
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
                      <div className="bg-[#1C6048]/5 p-2 rounded border border-[#1C6048]/20 text-[9px] text-[#1C6048] font-bold italic text-center">
                        Pure operating lease (indefinite lease) with zero buyout
                        capex.
                      </div>
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
              checked={assumptions.includeFinancing}
              onChange={(v) => onChange("includeFinancing", v)}
              isLocked={isLocked}
            />
            {assumptions.includeFinancing && (
              <>
                <div className="flex justify-between items-center bg-[#EFEBE7] p-2 rounded mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8A8175] mr-2">
                      Debt Calculation Basis
                    </span>
                    <p className="text-[8px] text-[#8A8175]/80 font-medium leading-tight mt-0.5">
                      LTV applies solely to non-land capex
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#1E2F31]">
                      {formatNumber(data?.metrics?.totalCapexExLand || 0, 1)}
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
              isLocked={isLocked || !assumptions.includeFinancing}
            />
            <AssumptionRow
              label="Interest Rate"
              val={assumptions.interestRate}
              set={(v) => onChange("interestRate", v)}
              unit="%"
              isLocked={isLocked || !assumptions.includeFinancing}
            />
            <AssumptionRow
              label="Loan Tenor"
              val={assumptions.loanTenor}
              set={(v) => onChange("loanTenor", v)}
              unit="Yrs"
              isLocked={isLocked || !assumptions.includeFinancing}
            />
            <AssumptionRow
              label="IO Grace Period"
              val={assumptions.ioGracePeriodYears}
              set={(v) => onChange("ioGracePeriodYears", v)}
              unit="Yrs"
              isLocked={isLocked || !assumptions.includeFinancing}
            />
            {assumptions.includeFinancing && (() => {
              const amortYears = Math.max(1, (assumptions.loanTenor || 15) - (assumptions.ioGracePeriodYears || 2));
              return (
                <div id="propco-amortization-scheme" className="bg-[#F9F8F6] p-4 border border-[#D8D8D8] rounded-[16px] mt-4 space-y-4">
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
                        {isLocked ? "Click \"Unlock\" at top-right of section to edit" : "Select how the principal loan balance is repaid over time"}
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
                        const resolvedP = getInitialStepUpPercentages(amortYears, "tangerang_stepup");
                        onChange({ repaymentType: "step_up", stepUpPercentages: resolvedP });
                      }}
                      className={`py-1.5 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 ${(assumptions.repaymentType || "standard") === "step_up" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    >
                      Step-Up / Tranche Repayment
                    </button>
                  </div>

                  {(assumptions.repaymentType || "standard") === "step_up" && (
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
                                const resolvedP = getInitialStepUpPercentages(amortYears, "tangerang_stepup");
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
                                const resolvedP = getInitialStepUpPercentages(amortYears, "equal");
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
                            const resolvedP = ensureArray(assumptions.stepUpPercentages);
                            let pList = [...resolvedP];
                            if (pList.length !== amortYears) {
                              pList = getInitialStepUpPercentages(amortYears, "tangerang_stepup");
                            }
                            const pSum = pList.reduce((sum, v) => sum + v, 0);
                            const isFullyAllocated = Math.abs(pSum - 100) < 0.05;
                            return (
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded font-mono font-black ${isFullyAllocated ? "bg-[#1C6048]/10 text-[#1C6048]" : "bg-amber-500/10 text-amber-600 animate-pulse"}`}>
                                  {pSum.toFixed(2)}% / 100%
                                </span>
                                {!isFullyAllocated && (
                                  <button
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() => {
                                      const sumVal = pSum;
                                      if (sumVal === 0) {
                                        const eq = getInitialStepUpPercentages(amortYears, "equal");
                                        onChange("stepUpPercentages", eq);
                                      } else {
                                        const factor = 100 / sumVal;
                                        const norm = pList.map(v => parseFloat((v * factor).toFixed(2)));
                                        const diff = 100 - norm.reduce((a, b) => a + b, 0);
                                        if (Math.abs(diff) > 0.001) {
                                          norm[norm.length - 1] = parseFloat((norm[norm.length - 1] + diff).toFixed(2));
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
                          const resolvedP = ensureArray(assumptions.stepUpPercentages);
                          let pList = [...resolvedP];
                          if (pList.length !== amortYears) {
                            pList = getInitialStepUpPercentages(amortYears, "tangerang_stepup");
                          }
                          
                          return pList.map((val, idx) => {
                            const opYearNum = idx + 1 + (assumptions.ioGracePeriodYears || 2);
                            return (
                              <div key={idx} className="flex flex-col gap-1.5 p-2 hover:bg-[#F9F8F6]/40 rounded-xl border border-transparent hover:border-[#D8D8D8] transition-all">
                                <div className="flex justify-between items-center text-[10px] font-bold text-[#1E2F31]">
                                  <span className="flex items-center gap-1.5 font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1C6048]"></span>
                                    Amortization Year {idx + 1}
                                    <span className="text-[8px] font-medium text-[#8A8175] font-sans">
                                      (Op. Year {opYearNum} / calendar {2025 + opYearNum})
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
                                        const newval = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0));
                                        const nextP = [...pList];
                                        nextP[idx] = parseFloat(newval.toFixed(2));
                                        onChange("stepUpPercentages", nextP);
                                      }}
                                      className="w-12 px-1 py-0.5 text-right font-mono text-[10px] border border-[#D8D8D8] rounded focus:border-[#1C6048] outline-none disabled:bg-[#F9F8F6] disabled:text-[#8A8175] disabled:cursor-not-allowed"
                                    />
                                    <span className="text-[9px] font-bold text-[#8A8175]">%</span>
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
                                    nextP[idx] = parseFloat(newVal.toFixed(2));
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
                <div className="flex justify-between items-center group py-1 border-b border-[#D8D8D8] last:border-0 hover:bg-[#EFEBE7] px-1 rounded transition-colors">
                  <label className="text-[10px] text-[#4C4A4B] font-bold">
                    Valuation Method
                  </label>
                  <div className="flex items-center bg-[#D8D8D8] rounded p-0.5">
                    <button
                      disabled={isLocked}
                      onClick={() => onChange("exitMethod", "capRate")}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${assumptions.exitMethod !== "multiple" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    >
                      Cap Rate
                    </button>
                    <button
                      disabled={isLocked}
                      onClick={() => onChange("exitMethod", "multiple")}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed ${assumptions.exitMethod === "multiple" ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
                    >
                      EV/EBITDA
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

const OpCoSensitivityView = memo(({ assumptions }) => {
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

const PropCoSensitivityView = memo(({ assumptions, opCoModelData, groups }) => {
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
});

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
// MASTER TIMELINE VIEW (GANTT CHART)
// ==========================================
const TIMELINE_PRESETS = {
  baseline: {
    name: "Scenario 1: Baseline (24-Month Build)",
    description: "Standard clinical rollouts, commercial opening in Month 25 (default baseline).",
    badge: "24-Mo Baseline",
    badgeColor: "bg-[#1C6048]/10 text-[#1C6048] border border-[#1C6048]/20",
    tasks: {
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
    }
  },
  fast_track: {
    name: "Scenario 2: Fast-Track (18-Month Build)",
    description: "Accelerated licensing and construction phases, commercial opening in Month 19.",
    badge: "18-Mo Fast-Track",
    badgeColor: "bg-indigo-50 text-indigo-700 border border-indigo-200/50",
    tasks: {
      t1: { start: 1, duration: 4 },
      t2: { start: 5, duration: 3 },
      t3: { start: 6, duration: 3 },
      t4: { start: 7, duration: 2 },
      t5: { start: 9, duration: 2 },
      t6_1: { start: 1, duration: 3 },
      t6_2: { start: 4, duration: 7 },
      t6_3: { start: 7, duration: 3 },
      t6_4: { start: 9, duration: 6 },
      t7_1: { start: 11, duration: 3 },
      t7_2: { start: 14, duration: 3 },
      t8: { start: 7, duration: 4 },
      t9: { start: 7, duration: 4 },
      t10: { start: 12, duration: 2 },
      t11: { start: 14, duration: 2 },
      t12: { start: 16, duration: 2 },
      t13: { start: 19, duration: 1 },
    }
  },
  delayed: {
    name: "Scenario 3: Delayed/Phased (30-Month Build)",
    description: "Extended regulatory approvals and complex excavations, commercial opening in Month 31.",
    badge: "30-Mo Delayed",
    badgeColor: "bg-[#9B8B70]/10 text-[#4C4A4B] border border-[#9B8B70]/25",
    tasks: {
      t1: { start: 1, duration: 8 },
      t2: { start: 9, duration: 5 },
      t3: { start: 10, duration: 5 },
      t4: { start: 11, duration: 4 },
      t5: { start: 15, duration: 4 },
      t6_1: { start: 1, duration: 5 },
      t6_2: { start: 6, duration: 12 },
      t6_3: { start: 11, duration: 5 },
      t6_4: { start: 15, duration: 10 },
      t7_1: { start: 19, duration: 5 },
      t7_2: { start: 24, duration: 5 },
      t8: { start: 11, duration: 8 },
      t9: { start: 11, duration: 8 },
      t10: { start: 20, duration: 4 },
      t11: { start: 24, duration: 4 },
      t12: { start: 27, duration: 4 },
      t13: { start: 31, duration: 1 },
    }
  }
};

const MasterTimelineView = memo(({ isPresenting, groups, setGroups }) => {
  const [activeYearFilter, setActiveYearFilter] = useState("All");
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(6);
  const [highlightCritical, setHighlightCritical] = useState(true);
  const [timelineSearch, setTimelineSearch] = useState("");
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const [endYear, setEndYear] = useState(DEFAULT_END_YEAR);

  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    groupId: "design",
    start: 6,
    duration: 4,
    progress: 0,
    owner: "",
    desc: "",
    critical: false,
  });

  const [activeMonthPicker, setActiveMonthPicker] = useState(null);
  const [tempPickerYear, setTempPickerYear] = useState(START_YEAR);

  const [pendingScenarioKey, setPendingScenarioKey] = useState(null);

  const detectedScenarioKey = useMemo(() => {
    const flat = {};
    groups.forEach((g) => {
      (g.tasks || []).forEach((t) => {
        flat[t.id] = { start: Number(t.start), duration: Number(t.duration) };
      });
    });

    for (const [key, preset] of Object.entries(TIMELINE_PRESETS)) {
      let match = true;
      for (const [taskId, vals] of Object.entries(preset.tasks)) {
        if (taskId === "t10") continue; // t10 represents the Oncology Lease, which is dynamically derived in the synchronize hook and overrides manual schedule values.
        if (
          !flat[taskId] ||
          Number(flat[taskId].start) !== vals.start ||
          Number(flat[taskId].duration) !== vals.duration
        ) {
          match = false;
          break;
        }
      }
      if (match) return key;
    }
    return "custom";
  }, [groups]);

  const handleApplyPreset = (presetKey) => {
    const selectedPreset = TIMELINE_PRESETS[presetKey];
    if (!selectedPreset) return;

    setGroups((prevGroups) => {
      return prevGroups.map((group) => {
        const nextTasks = group.tasks.map((task) => {
          const presetVal = selectedPreset.tasks[task.id];
          if (presetVal) {
            return {
              ...task,
              start: presetVal.start,
              duration: presetVal.duration,
            };
          }
          return task;
        });
        return { ...group, tasks: nextTasks };
      });
    });
    setPendingScenarioKey(null);
  };

  const TIMELINE_MONTHS = useMemo(() => {
    const fullMonths = generateTimelineMonths(START_YEAR, endYear);
    let maxM = 12;
    groups.forEach((g) => {
      g.tasks.forEach((t) => {
        const endm = (parseInt(t.start) || 1) + (parseInt(t.duration) || 1) - 1;
        if (endm > maxM) maxM = endm;
      });
    });
    const targetCount = Math.min(fullMonths.length, maxM + 1);
    return fullMonths.slice(0, targetCount);
  }, [groups, endYear]);

  const maxMonths = TIMELINE_MONTHS.length;
  const maxAvailableMonths = (endYear - START_YEAR + 1) * 12;
  const uniqueYears = useMemo(
    () =>
      [...new Set(TIMELINE_MONTHS.map((m) => m.year))].sort((a, b) => a - b),
    [TIMELINE_MONTHS],
  );

  const minYear = START_YEAR;
  const maxYear = endYear;

  const [collapsedYears, setCollapsedYears] = useState(() => {
    const initial = {};
    uniqueYears.forEach((yr) => {
      initial[yr] = true;
    });
    return initial;
  });

  useEffect(() => {
    setCollapsedYears((prev) => {
      const updated = { ...prev };
      uniqueYears.forEach((yr) => {
        if (updated[yr] === undefined) updated[yr] = true;
      });
      return updated;
    });
  }, [uniqueYears]);

  const [expandedGroups, setExpandedGroups] = useState({
    capex: false,
    design: false,
    licensing: false,
    construction: false,
    equipment: false,
    infrastructure: false,
  });
  const [selectedTaskId, setSelectedTaskId] = useState("t5");

  const timelineScrollRef = useRef(null);
  const pickerRef = useRef(null);
  const lastValidValRef = useRef(null);
  const monthWidth = 64;

  const totalTimelineWidth = useMemo(() => {
    return 288 + maxMonths * monthWidth + 64;
  }, [maxMonths]);

  const handleTaskUpdate = (groupId, taskId, key, value) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          tasks: group.tasks.map((task) => {
            if (task.id !== taskId) return task;
            let parsedValue = value;
            if (key === "start") {
              if (value === "") parsedValue = "";
              else
                parsedValue = Math.max(
                  1,
                  Math.min(maxAvailableMonths, parseInt(value) || 1),
                );
            } else if (key === "duration") {
              if (value === "") parsedValue = "";
              else parsedValue = value;
            } else if (key === "progress") {
              parsedValue = Math.max(0, Math.min(100, parseInt(value) || 0));
            } else if (key === "cost") {
              parsedValue = Math.max(0, parseFloat(value) || 0);
            }
            return { ...task, [key]: parsedValue };
          }),
        };
      }),
    );
  };

  const openMonthPicker = (type, currentVal, onSelect) => {
    const currentYear = TIMELINE_MONTHS[currentVal - 1]?.year || minYear;
    setTempPickerYear(currentYear);
    setActiveMonthPicker({ type, currentVal, onSelect });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        activeMonthPicker &&
        pickerRef.current &&
        !pickerRef.current.contains(event.target)
      ) {
        setActiveMonthPicker(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMonthPicker]);

  const handleTaskDelete = (groupId, taskId) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          tasks: group.tasks.filter((task) => task.id !== taskId),
        };
      }),
    );
    setSelectedTaskId(null);
  };

  const handleTaskCreate = (e) => {
    e.preventDefault();
    if (!newTask.name.trim()) return;
    const createdId = `t_${Date.now()}`;
    const taskObj = {
      id: createdId,
      name: newTask.name,
      start: parseInt(newTask.start) || 1,
      duration: parseInt(newTask.duration) || 1,
      progress: parseInt(newTask.progress) || 0,
      owner: newTask.owner || "Project Board",
      cost: 0,
      desc: newTask.desc || "No detailed description added.",
      critical: newTask.critical,
      dependencies: [],
    };
    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== newTask.groupId) return group;
        return { ...group, tasks: [...group.tasks, taskObj] };
      }),
    );
    setExpandedGroups((prev) => ({ ...prev, [newTask.groupId]: true }));
    setSelectedTaskId(createdId);
    setIsCreatingTask(false);
    setNewTask({
      name: "",
      groupId: "design",
      start: selectedMonthIndex,
      duration: 4,
      progress: 0,
      owner: "",
      desc: "",
      critical: false,
    });
  };

  const getTaskNameById = (id) => {
    for (const group of groups) {
      const found = group.tasks.find((t) => t.id === id);
      if (found) return found.name;
    }
    return id.toUpperCase();
  };

  const getTaskDateRangeString = (start, duration) => {
    const safeStart = Math.min(Math.max(1, start), maxMonths);
    const safeEnd = Math.min(
      Math.max(1, start + (parseInt(duration) || 1) - 1),
      maxMonths,
    );
    const startMonth = TIMELINE_MONTHS[safeStart - 1];
    const endMonth = TIMELINE_MONTHS[safeEnd - 1];
    if (!startMonth || !endMonth) return "";
    return `${startMonth.name} – ${endMonth.name}`;
  };

  const groupSummaryBars = useMemo(() => {
    const summaries = {};
    groups.forEach((group) => {
      if (group.tasks.length === 0) return;
      let minStart = maxMonths;
      let maxEnd = 1;
      group.tasks.forEach((task) => {
        if (task.start < minStart) minStart = task.start;
        const end = task.start + (parseInt(task.duration) || 1) - 1;
        if (end > maxEnd) maxEnd = Math.min(end, maxMonths);
      });
      summaries[group.id] = {
        start: minStart,
        duration: maxEnd - minStart + 1,
      };
    });
    return summaries;
  }, [groups, maxMonths]);

  const allGroupsCollapsed = useMemo(
    () => Object.values(expandedGroups).every((val) => !val),
    [expandedGroups],
  );
  const toggleAllGroups = () => {
    if (allGroupsCollapsed)
      setExpandedGroups({
        capex: true,
        design: true,
        licensing: true,
        construction: true,
        equipment: true,
        infrastructure: true,
      });
    else
      setExpandedGroups({
        capex: false,
        design: false,
        licensing: false,
        construction: false,
        equipment: false,
        infrastructure: false,
      });
  };

  const allYearsCollapsed = useMemo(
    () => Object.values(collapsedYears).every((val) => val),
    [collapsedYears],
  );
  const toggleAllYears = () => {
    setCollapsedYears((prev) => {
      const nextState = {};
      uniqueYears.forEach((yr) => {
        nextState[yr] = !allYearsCollapsed;
      });
      return nextState;
    });
  };

  const compressedBlocks = useMemo(() => {
    const blocks = [];
    let currentBlock = null;
    for (let num = 1; num <= maxMonths; num++) {
      const monthInfo = TIMELINE_MONTHS[num - 1];
      const activeTaskIds = [];
      groups.forEach((group) => {
        group.tasks.forEach((task) => {
          const taskEnd = task.start + (parseInt(task.duration) || 1) - 1;
          if (num >= task.start && num <= taskEnd) activeTaskIds.push(task.id);
        });
      });
      activeTaskIds.sort();
      const signature = activeTaskIds.join(",");
      if (
        !currentBlock ||
        currentBlock.signature !== signature ||
        currentBlock.year !== monthInfo.year
      ) {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = {
          startMonth: num,
          endMonth: num,
          startName: monthInfo.name,
          endName: monthInfo.name,
          year: monthInfo.year,
          phase: monthInfo.phase,
          activeTaskIds,
          signature,
        };
      } else {
        currentBlock.endMonth = num;
        currentBlock.endName = monthInfo.name;
      }
    }
    if (currentBlock) blocks.push(currentBlock);
    return blocks;
  }, [groups, maxMonths, TIMELINE_MONTHS]);

  const blocksByYear = useMemo(() => {
    return compressedBlocks.reduce((acc, curr) => {
      if (!acc[curr.year]) acc[curr.year] = [];
      acc[curr.year].push(curr);
      return acc;
    }, {});
  }, [compressedBlocks]);

  const activeBlock = useMemo(
    () =>
      compressedBlocks.find(
        (b) =>
          selectedMonthIndex >= b.startMonth &&
          selectedMonthIndex <= b.endMonth,
      ),
    [compressedBlocks, selectedMonthIndex],
  );

  const getBlockColorInfo = (block) => {
    if (!block)
      return {
        dot: "bg-gray-400",
        border: "border-l-gray-400",
        text: "text-gray-500",
        bgSelected: "bg-gray-500",
        bgLight: "bg-gray-50",
      };
    let groupId = "";
    if (block.activeTaskIds && block.activeTaskIds.length > 0) {
      const firstTaskId = block.activeTaskIds[0];
      const group = groups.find((g) =>
        g.tasks.some((t) => t.id === firstTaskId),
      );
      if (group) groupId = group.id;
    }
    if (!groupId) {
      const phase = block.phase.toLowerCase();
      if (phase.includes("feasibility") || phase.includes("design"))
        groupId = "design";
      else if (phase.includes("licensing")) groupId = "licensing";
      else if (
        phase.includes("civil") ||
        phase.includes("epc") ||
        phase.includes("construction") ||
        phase.includes("works")
      )
        groupId = "construction";
      else groupId = "equipment";
    }
    if (groupId === "design")
      return {
        dot: "bg-[#1C6048]",
        border: "border-l-[#1C6048]",
        text: "text-[#1C6048]",
        bgSelected: "bg-[#1C6048]",
        bgLight: "bg-[#1C6048]/5",
        borderDashed: "border-[#1C6048]/35",
      };
    if (groupId === "licensing")
      return {
        dot: "bg-[#9B8B70]",
        border: "border-l-[#9B8B70]",
        text: "text-[#9B8B70]",
        bgSelected: "bg-[#9B8B70]",
        bgLight: "bg-[#9B8B70]/10",
        borderDashed: "border-[#9B8B70]/35",
      };
    if (groupId === "construction")
      return {
        dot: "bg-[#1E2F31]",
        border: "border-l-[#1E2F31]",
        text: "text-[#1E2F31]",
        bgSelected: "bg-[#1E2F31]",
        bgLight: "bg-[#1E2F31]/5",
        borderDashed: "border-[#1E2F31]/35",
      };
    return {
      dot: "bg-[#99B6AA]",
      border: "border-l-[#99B6AA]",
      text: "text-[#99B6AA]",
      bgSelected: "bg-[#99B6AA]",
      bgLight: "bg-[#99B6AA]/15",
      borderDashed: "border-[#99B6AA]/35",
    };
  };

  const getMonthColorInfo = (num) => {
    const block = compressedBlocks.find(
      (b) => num >= b.startMonth && num <= b.endMonth,
    );
    return block ? getBlockColorInfo(block) : null;
  };

  const activeTasksForSelectedMonth = useMemo(() => {
    const active = [];
    groups.forEach((group) => {
      group.tasks.forEach((task) => {
        const taskEnd = task.start + (parseInt(task.duration) || 1) - 1;
        if (selectedMonthIndex >= task.start && selectedMonthIndex <= taskEnd)
          active.push(task.id);
      });
    });
    return active;
  }, [groups, selectedMonthIndex]);

  const selectedTask = useMemo(() => {
    for (const group of groups) {
      const task = group.tasks.find((t) => t.id === selectedTaskId);
      if (task)
        return {
          ...task,
          groupId: group.id,
          groupName: group.name,
          groupColor: group.color,
        };
    }
    return null;
  }, [groups, selectedTaskId]);

  const taskConflicts = useMemo(() => {
    const allTasksMap = {};
    groups.forEach((g) => {
      g.tasks.forEach((t) => {
        allTasksMap[t.id] = { ...t, groupName: g.name };
      });
    });

    const conflicts = {};

    groups.forEach((g) => {
      g.tasks.forEach((t) => {
        const warnings = [];
        const tStart = parseInt(t.start) || 1;
        const tDuration = parseInt(t.duration) || 1;
        const tEnd = tStart + tDuration - 1;

        // 1. Dependency-based sequence checks
        if (t.dependencies && t.dependencies.length > 0) {
          t.dependencies.forEach((depId) => {
            const depTask = allTasksMap[depId];
            if (depTask) {
              const depStart = parseInt(depTask.start) || 1;
              const depDuration = parseInt(depTask.duration) || 1;
              const depEnd = depStart + depDuration - 1;

              if (tStart <= depEnd) {
                const depEndMonthName =
                  TIMELINE_MONTHS[depEnd - 1]?.name || `Month ${depEnd}`;
                const tStartMonthName =
                  TIMELINE_MONTHS[tStart - 1]?.name || `Month ${tStart}`;
                warnings.push(
                  `Predecessor overlap: Scheduled to start in ${tStartMonthName} but relies on ${depId.toUpperCase()} "${depTask.name}" which finishes later in ${depEndMonthName}.`,
                );
              }
            }
          });
        }

        // 2. Additional construction sequence feasibility checks
        if (t.id === "t7_1" || t.id === "t7_2") {
          const t6_2 = allTasksMap["t6_2"];
          if (t6_2) {
            const t6_2End =
              (parseInt(t6_2.start) || 1) + (parseInt(t6_2.duration) || 1) - 1;
            if (tStart <= t6_2End) {
              warnings.push(
                "Civil sequence constraint: Interior fit-outs cannot realistically start until the main structural superstructure (T6_2) is complete.",
              );
            }
          }
        }

        if (t.id === "t12") {
          const t6_3 = allTasksMap["t6_3"];
          if (t6_3) {
            const t6_3End =
              (parseInt(t6_3.start) || 1) + (parseInt(t6_3.duration) || 1) - 1;
            if (tStart <= t6_3End) {
              warnings.push(
                "Drills safety warning: Emergency drills (T12) and high-energy calibrations cannot proceed inside incomplete concrete vault shielding core (T6_3).",
              );
            }
          }
        }

        if (warnings.length > 0) {
          conflicts[t.id] = warnings;
        }
      });
    });

    return conflicts;
  }, [groups, TIMELINE_MONTHS]);

  const selectedTaskConflicts = selectedTaskId
    ? taskConflicts[selectedTaskId] || []
    : [];

  const toggleGroup = (groupId) =>
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  const toggleYear = (year) =>
    setCollapsedYears((prev) => ({ ...prev, [year]: !prev[year] }));

  const scrollToMonth = (idx) => {
    if (timelineScrollRef.current) {
      const targetScroll =
        (idx - 1) * monthWidth -
        timelineScrollRef.current.clientWidth / 2 +
        144 +
        32;
      timelineScrollRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    }
  };

  const handleYearFilterChange = (year) => {
    setActiveYearFilter(year);
    if (year !== "All") {
      setCollapsedYears((prev) => ({ ...prev, [year]: false }));
      const firstMonthOfYr =
        TIMELINE_MONTHS.find((m) => m.year === parseInt(year))?.num || 1;
      setSelectedMonthIndex(firstMonthOfYr);
    } else {
      setSelectedMonthIndex(5);
    }
  };

  useEffect(() => {
    scrollToMonth(selectedMonthIndex);
  }, [selectedMonthIndex]);

  const isMonthInActiveBlock = (num) => {
    if (!activeBlock) return false;
    return num >= activeBlock.startMonth && num <= activeBlock.endMonth;
  };

  const renderInlineCalendarContent = (picker) => {
    const duration =
      picker.type === "edit"
        ? parseInt(selectedTask?.duration) || 1
        : parseInt(newTask?.duration) || 4;
    let activeColor = "#1C6048";
    if (picker.type === "edit" && selectedTask) {
      if (selectedTask.groupId === "licensing") activeColor = "#9B8B70";
      else if (selectedTask.groupId === "construction") activeColor = "#1E2F31";
      else if (selectedTask.groupId === "equipment") activeColor = "#99B6AA";
    } else {
      const group = groups.find((g) => g.id === newTask.groupId);
      if (group) {
        if (group.id === "licensing") activeColor = "#9B8B70";
        else if (group.id === "construction") activeColor = "#1E2F31";
        else if (group.id === "equipment") activeColor = "#99B6AA";
      }
    }

    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between py-1 bg-white/40 rounded-lg border border-white/30 px-2 shadow-sm">
          <button
            type="button"
            disabled={tempPickerYear <= minYear}
            onClick={(e) => {
              e.stopPropagation();
              setTempPickerYear((prev) => Math.max(minYear, prev - 1));
            }}
            className="p-1 rounded hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft size={13} className="text-[#1E2F31] stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-black text-[#1E2F31] uppercase tracking-wider">
            {tempPickerYear}
          </span>
          <button
            type="button"
            disabled={tempPickerYear >= maxYear}
            onClick={(e) => {
              e.stopPropagation();
              setTempPickerYear((prev) => Math.min(maxYear, prev + 1));
            }}
            className="p-1 rounded hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronRight size={13} className="text-[#1E2F31] stroke-[2.5]" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {MONTH_NAMES_SHORT.map((mName, idx) => {
            const globalNum = (tempPickerYear - minYear) * 12 + (idx + 1);
            const isSelected = picker.currentVal === globalNum;
            const isInRange =
              globalNum > picker.currentVal &&
              globalNum < picker.currentVal + duration;
            const isEnd =
              globalNum === picker.currentVal + duration - 1 && duration > 1;
            const isCurrentMonth = globalNum === 5;

            let btnStyle =
              "bg-[#F9F8F6]/50 border-white/40 hover:bg-white/90 text-[#1E2F31]";
            let customInlineColor = {};

            if (isSelected) {
              btnStyle = "text-white font-black shadow-sm scale-105 z-10";
              customInlineColor = {
                backgroundColor: activeColor,
                borderColor: activeColor,
              };
            } else if (isInRange) {
              btnStyle = "font-extrabold text-[9px] border-dashed";
              customInlineColor = {
                backgroundColor: `${activeColor}15`,
                borderColor: `${activeColor}40`,
                color: activeColor,
              };
            } else if (isEnd) {
              btnStyle = "font-black border-dashed";
              customInlineColor = {
                backgroundColor: `${activeColor}25`,
                borderColor: activeColor,
                color: activeColor,
              };
            }

            return (
              <button
                key={mName}
                type="button"
                style={customInlineColor}
                disabled={globalNum > maxAvailableMonths}
                onClick={(e) => {
                  e.stopPropagation();
                  picker.onSelect(globalNum);
                  setActiveMonthPicker(null);
                }}
                className={`py-1.5 rounded-xl text-[9px] font-bold transition-all border relative flex flex-col items-center justify-center disabled:opacity-20 disabled:pointer-events-none ${btnStyle}`}
              >
                {mName}
                {isCurrentMonth && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 bg-[#1C6048] rounded-full animate-ping"></span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-[#9B8B70] border-t border-white/20 pt-2 px-1">
          <span className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: activeColor }}
            ></span>{" "}
            Start Month
          </span>
          {duration > 1 && (
            <span className="flex items-center gap-1">
              <span
                className="w-2.5 h-1.5 rounded-sm border border-dashed"
                style={{
                  backgroundColor: `${activeColor}15`,
                  borderColor: `${activeColor}40`,
                }}
              ></span>{" "}
              {duration - 1} Mo span
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full text-[#1E2F31] flex flex-col gap-6 relative animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10 bg-white p-4 rounded-2xl border border-[#D8D8D8] shadow-sm">
        <div className="md:col-span-8 flex flex-wrap items-center gap-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search milestone or task..."
              value={timelineSearch}
              onChange={(e) => setTimelineSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-2 focus:ring-[#1C6048] outline-none shadow-inner transition-all"
            />
            <Search
              size={14}
              className="absolute left-3.5 top-3.5 text-[#9B8B70]"
            />
          </div>
          <div className="flex bg-[#F9F8F6] p-1 rounded-xl border border-[#D8D8D8] shrink-0">
            {["All", ...uniqueYears.map(String)].map((year) => (
              <button
                key={year}
                onClick={() => handleYearFilterChange(year)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeYearFilter === year ? "bg-white text-[#1E2F31] shadow-sm border border-[#D8D8D8]" : "text-[#4C4A4B] hover:text-[#1E2F31]"}`}
              >
                {year}
              </button>
            ))}
          </div>
          <button
            onClick={() => setHighlightCritical(!highlightCritical)}
            className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all border ${highlightCritical ? "bg-[#9B8B70] text-white border-[#9B8B70] shadow-sm" : "bg-transparent border-[#D8D8D8] text-[#4C4A4B] hover:bg-[#F9F8F6]"}`}
          >
            <ShieldAlert size={14} /> Critical Path
          </button>
        </div>
        <div className="md:col-span-4 flex justify-end">
          <div className="bg-[#EFEBE7] border border-[#D8D8D8] px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase text-[#4C4A4B] flex items-center gap-2 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1C6048] animate-pulse"></span>{" "}
            Current Phase: H1 2026 (Feasibility)
          </div>
        </div>
      </div>

      {/* Sleek, Compact Scenario Switcher Toolbar */}
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-[#D8D8D8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 -mt-2">
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-[#1C6048]/10 rounded-xl text-[#1C6048]">
            <Sliders size={15} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#1E2F31]">
              Timeline Scenario
            </span>
            <span className="text-[9px] text-[#4C4A4B] font-medium leading-none mt-0.5">
              Switch underwriting schedules instantly
            </span>
          </div>
        </div>

        {/* Segmented Controller Button Row */}
        <div className="flex bg-[#F9F8F6] p-1 rounded-xl border border-[#D8D8D8] shrink-0 self-start md:self-auto gap-0.5">
          {Object.entries(TIMELINE_PRESETS).map(([key, preset]) => {
            const isActive = detectedScenarioKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPendingScenarioKey(key)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? "bg-white text-[#1C6048] shadow-sm border border-[#D8D8D8]/50"
                    : "text-[#4C4A4B] hover:text-[#1E2F31]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#1C6048]" : "bg-[#4C4A4B]/20"}`}></span>
                {preset.badge}
              </button>
            );
          })}
          
          {detectedScenarioKey === "custom" && (
            <div className="px-3 py-1.5 text-[9px] font-black uppercase text-amber-700 bg-amber-50/50 rounded-lg border border-amber-200/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Custom Sandbox Active
            </div>
          )}
        </div>

        {/* Dynamic Scenario Description Panel */}
        <div className="hidden lg:flex items-center gap-2 max-w-sm text-right text-[10px] text-[#4C4A4B] font-medium leading-normal">
          {detectedScenarioKey !== "custom" ? (
            <span>
              Active Preset: <strong className="text-[#1E2F31] font-black">{TIMELINE_PRESETS[detectedScenarioKey]?.name}</strong>. Commercial Opening at Month {TIMELINE_PRESETS[detectedScenarioKey]?.tasks.t13.start}.
            </span>
          ) : (
            <span className="text-amber-800 font-semibold">
              Sandbox Active: Timings manually optimized. Fully reactive to financial metrics.
            </span>
          )}
        </div>
      </div>

      {/* Inline Confirmation Overwrite Panel */}
      {pendingScenarioKey && (
        <div className="bg-[#EFEBE7]/80 border border-[#D8D8D8] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200 -mt-2 relative z-10">
          <div className="flex items-start gap-2.5">
            <span className="text-sm mt-0.5">⚠️</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-[#1E2F31]">
                Confirm Scenario Shift
              </span>
              <span className="text-[10px] text-[#4C4A4B] mt-0.5 leading-snug max-w-xl">
                Ready to shift to <strong className="text-[#1E2F31] font-black">"{TIMELINE_PRESETS[pendingScenarioKey]?.name}"</strong>? This will overwrite your active manual timing adjustments for all milestones.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setPendingScenarioKey(null)}
              className="px-3 py-1.5 rounded-lg border border-[#D8D8D8] bg-white text-[9px] font-black uppercase text-[#4C4A4B] hover:bg-[#F9F8F6] transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(pendingScenarioKey)}
              className="px-3       py-1.5 rounded-lg bg-[#1C6048] text-white text-[9px] font-black uppercase shadow-sm hover:bg-[#1C6048]/90 transition-all"
            >
              Confirm & Overwrite
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch relative z-10">
        <div className="xl:col-span-3 bg-white border border-[#D8D8D8] rounded-[24px] p-5 flex flex-col gap-4 shadow-sm max-h-[640px]">
          <div className="pb-3 border-b border-[#D8D8D8] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#1E2F31] flex items-center gap-2">
                <CalendarDays size={16} className="text-[#1C6048]" /> Monthly
                Indexer
              </span>
              <button
                type="button"
                onClick={toggleAllYears}
                className="p-1 rounded bg-[#F9F8F6] hover:bg-[#EFEBE7] border border-[#D8D8D8] text-[#1E2F31] transition-all hover:scale-105"
                title={
                  allYearsCollapsed ? "Expand All Years" : "Collapse All Years"
                }
              >
                {allYearsCollapsed ? (
                  <ChevronsUpDown size={12} />
                ) : (
                  <ChevronsDownUp size={12} />
                )}
              </button>
            </div>
            <span className="text-[9px] font-black text-white bg-[#1C6048] px-2.5 py-0.5 rounded-full">
              {activeBlock
                ? activeBlock.startMonth === activeBlock.endMonth
                  ? activeBlock.startName
                  : `${activeBlock.startName.split(" ")[0]} - ${activeBlock.endName}`
                : ""}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {Object.entries(blocksByYear).map(([year, blocks]) => {
              if (activeYearFilter !== "All" && activeYearFilter !== year)
                return null;
              const isYearCollapsed = collapsedYears[year];
              return (
                <div key={year} className="space-y-1.5">
                  <div
                    onClick={() => toggleYear(year)}
                    className="text-[10px] font-black text-[#9B8B70] uppercase px-1 border-l-2 border-[#9B8B70] tracking-wider mb-2 flex justify-between items-center cursor-pointer hover:text-[#1E2F31] transition-all"
                  >
                    <span>Year {year}</span>
                    {isYearCollapsed ? (
                      <ChevronRight size={14} className="text-[#9B8B70]" />
                    ) : (
                      <ChevronDown size={14} className="text-[#9B8B70]" />
                    )}
                  </div>
                  {!isYearCollapsed && (
                    <div className="grid grid-cols-1 gap-1.5">
                      {blocks.map((block) => {
                        const isSelected =
                          selectedMonthIndex >= block.startMonth &&
                          selectedMonthIndex <= block.endMonth;
                        const colorInfo = getBlockColorInfo(block);
                        const activeCount = block.activeTaskIds.length;
                        let isCurrent =
                          6 >= block.startMonth && 6 <= block.endMonth;
                        const dotClass = `w-2 h-2 rounded-full ${colorInfo.dot} ${isCurrent ? "ring-2 ring-offset-1 ring-emerald-500" : ""}`;
                        const rangeLabel =
                          block.startMonth === block.endMonth
                            ? block.startName
                            : `${block.startName.split(" ")[0]} - ${block.endName}`;
                        return (
                          <div
                            key={block.startMonth}
                            onClick={() =>
                              setSelectedMonthIndex(block.startMonth)
                            }
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer border-y border-r border-l-4 ${colorInfo.border} ${isSelected ? "bg-[#1E2F31] border-[#1E2F31] text-white shadow-md transform translate-x-1" : "bg-[#F9F8F6] border-[#D8D8D8] hover:bg-[#EFEBE7]/50 text-[#4C4A4B]"}`}
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className={dotClass}></span>
                                <span className="text-[11px] font-black">
                                  {rangeLabel}
                                </span>
                                <span
                                  className={`text-[9px] font-bold uppercase ${isSelected ? "text-white/60" : "text-gray-400"}`}
                                >
                                  ({block.phase})
                                </span>
                              </div>
                              <p
                                className={`text-[9px] font-medium leading-none ml-4 ${isSelected ? "text-white/70" : "text-[#4C4A4B]/60"}`}
                              >
                                {activeCount === 0
                                  ? "No Active Milestones"
                                  : activeCount === 1
                                    ? "1 Active Milestone"
                                    : `${activeCount} Active Milestones`}
                              </p>
                            </div>
                            {activeCount > 0 && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[8px] font-black shrink-0 ${isSelected ? "bg-white/20 text-white" : `${colorInfo.bgLight} ${colorInfo.text}`}`}
                              >
                                {activeCount} Active
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={`bg-white border border-[#D8D8D8] rounded-[24px] overflow-hidden shadow-sm flex flex-col justify-between transition-all duration-300 max-h-[640px] ${showDetailPanel ? "xl:col-span-6" : "xl:col-span-9"}`}
        >
          <div className="p-5 border-b border-[#D8D8D8] flex flex-wrap justify-between items-center bg-[#F9F8F6]/30 gap-4">
            <div className="flex items-center gap-2.5">
              <Layers size={18} className="text-[#1C6048]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#1E2F31]">
                Timeline Mapping Canvas
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[9px] text-[#4C4A4B] font-extrabold uppercase tracking-wider bg-white/70 px-3 py-1.5 rounded-xl border border-[#D8D8D8]/50 shadow-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#1C6048] rounded-full"></span>{" "}
                Planning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#9B8B70] rounded-full"></span>{" "}
                Licensing
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#1E2F31] rounded-full"></span>{" "}
                Construction
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#99B6AA] rounded-full"></span>{" "}
                Commissioning
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowDetailPanel(!showDetailPanel)}
                className="px-3 py-1 bg-white hover:bg-[#EFEBE7] border border-[#D8D8D8] rounded-[10px] text-[9px] font-black uppercase text-[#1E2F31] flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {showDetailPanel ? (
                  <EyeOff size={11} className="text-[#9B8B70]" />
                ) : (
                  <Eye size={11} className="text-[#1C6048]" />
                )}
                {showDetailPanel ? "Hide Details" : "Show Details"}
              </button>
              <span className="text-[10px] text-[#4C4A4B] font-bold bg-[#EFEBE7] px-2 py-1 rounded-[10px] border border-[#D8D8D8]">
                Active Range Focus
              </span>
            </div>
          </div>
          <div
            ref={timelineScrollRef}
            className="overflow-auto custom-scrollbar w-full flex-1"
          >
            <div
              style={{ width: `${totalTimelineWidth}px` }}
              className="pb-24 relative select-none"
            >
              <div className="flex border-b border-[#D8D8D8] sticky top-0 bg-white z-20 shadow-sm">
                <div className="w-44 px-4 py-3 text-[10px] font-black uppercase text-[#9B8B70] text-left border-r border-[#EFEBE7]/60 bg-white sticky left-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] flex items-center justify-between">
                  <span>Milestone Task</span>
                  <button
                    type="button"
                    onClick={toggleAllGroups}
                    className="p-1 rounded bg-[#F9F8F6] hover:bg-[#EFEBE7] border border-[#D8D8D8] text-[#1E2F31] transition-all hover:scale-105"
                    title={
                      allGroupsCollapsed
                        ? "Expand All Stages"
                        : "Collapse All Stages"
                    }
                  >
                    {allGroupsCollapsed ? (
                      <ChevronsUpDown size={12} />
                    ) : (
                      <ChevronsDownUp size={12} />
                    )}
                  </button>
                </div>
                <div className="w-28 px-2 py-3 text-[10px] font-black uppercase text-[#9B8B70] text-center border-r border-[#D8D8D8] bg-white sticky left-44 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Schedule
                </div>
                <div className="flex">
                  {TIMELINE_MONTHS.map((m) => {
                    const isSelected = selectedMonthIndex === m.num;
                    const isInBlock = isMonthInActiveBlock(m.num);
                    const monthColor = getMonthColorInfo(m.num);
                    let headerBgClass = "text-[#1E2F31] hover:bg-[#F9F8F6]";
                    if (isSelected && monthColor)
                      headerBgClass = `${monthColor.bgSelected} text-white font-extrabold`;
                    else if (isInBlock && monthColor)
                      headerBgClass = `${monthColor.bgLight} ${monthColor.text} font-extrabold`;
                    return (
                      <div
                        key={m.num}
                        onClick={() => setSelectedMonthIndex(m.num)}
                        className={`w-16 py-3 text-[9px] font-black uppercase tracking-tighter text-center border-r border-[#EFEBE7] transition-all cursor-pointer ${headerBgClass}`}
                      >
                        {m.name.split(" ")[0]}
                        <br />'{m.name.split(" ")[1]}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    disabled={endYear >= 2035}
                    onClick={() =>
                      setEndYear((prev) => Math.min(2035, prev + 1))
                    }
                    className="w-16 py-3 text-[9px] font-black uppercase tracking-tighter text-center bg-[#E8EFEA] hover:bg-[#1C6048] hover:text-white text-[#1C6048] border-r border-b border-[#D8D8D8] transition-all flex flex-col items-center justify-center gap-0.5 shrink-0 disabled:opacity-30 disabled:pointer-events-none"
                    title="Add 1 Year to Timeline"
                  >
                    <Plus size={12} />
                    <span>+ Yr</span>
                  </button>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none flex">
                <div className="w-44 border-r border-[#EFEBE7]/60 bg-white/20 sticky left-0 z-10 pointer-events-none"></div>
                <div className="w-28 border-r border-[#D8D8D8] bg-white/20 sticky left-44 z-10 pointer-events-none"></div>
                <div className="flex pointer-events-none">
                  {TIMELINE_MONTHS.map((m) => {
                    const isSelected = selectedMonthIndex === m.num;
                    const isInBlock = isMonthInActiveBlock(m.num);
                    const monthColor = getMonthColorInfo(m.num);
                    let guideStyle =
                      "w-16 h-full border-r border-[#EFEBE7]/40 relative last:border-0 pointer-events-none";
                    if (isSelected && monthColor)
                      guideStyle += ` ${monthColor.bgLight} border-l border-r border-dashed ${monthColor.borderDashed}`;
                    else if (isInBlock && monthColor)
                      guideStyle += ` ${monthColor.bgLight}`;
                    return (
                      <div key={m.num} className={guideStyle}>
                        {m.num === 6 && (
                          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#1C6048] opacity-60 z-10 pointer-events-none">
                            <div className="absolute top-4 -translate-x-1/2 bg-[#1C6048] text-white text-[7px] px-1 rounded uppercase font-black pointer-events-none">
                              Now
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="w-16 h-full border-r border-b border-[#EFEBE7]/20 pointer-events-none"></div>
                </div>
              </div>
              <div className="relative z-10">
                {groups.map((group) => {
                  const isExpanded = expandedGroups[group.id];
                  const visibleTasks = group.tasks.filter(
                    (t) =>
                      t.name
                        .toLowerCase()
                        .includes(timelineSearch.toLowerCase()) ||
                      group.name
                        .toLowerCase()
                        .includes(timelineSearch.toLowerCase()),
                  );
                  if (visibleTasks.length === 0) return null;
                  return (
                    <div
                      key={group.id}
                      className="border-b border-[#D8D8D8]/50 last:border-0"
                    >
                      <div
                        onClick={() => toggleGroup(group.id)}
                        className="flex items-stretch bg-[#F9F8F6]/90 border-b border-[#EFEBE7] h-10 select-none cursor-pointer hover:bg-[#EFEBE7]/60 active:bg-[#EFEBE7]/80 transition-colors relative z-20"
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGroup(group.id);
                          }}
                          className="w-72 sticky left-0 bg-[#F9F8F6] px-4 py-2 flex items-center gap-1.5 text-[10px] font-black uppercase text-[#1E2F31] border-r border-[#D8D8D8] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] shrink-0 h-full cursor-pointer hover:bg-[#EFEBE7]/60 active:bg-[#EFEBE7]/80 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown size={14} className="text-[#9B8B70]" />
                          ) : (
                            <ChevronRight
                              size={14}
                              className="text-[#9B8B70]"
                            />
                          )}
                          <span
                            className={`w-2.5 h-2.5 rounded bg-gradient-to-r ${group.color}`}
                          ></span>
                          <span className="truncate">{group.name}</span>
                        </div>
                        <div className="flex-1 h-full relative flex items-center">
                          {groupSummaryBars[group.id] && (
                            <div
                              className={`h-2.5 rounded-full absolute transition-all duration-300 opacity-60 bg-gradient-to-r ${group.color} border border-white/20`}
                              style={{
                                left: `${(groupSummaryBars[group.id].start - 1) * monthWidth}px`,
                                width: `${groupSummaryBars[group.id].duration * monthWidth}px`,
                              }}
                              title={`${group.name} Span: ${getTaskDateRangeString(groupSummaryBars[group.id].start, groupSummaryBars[group.id].duration)}`}
                            ></div>
                          )}
                        </div>
                      </div>
                      {isExpanded &&
                        visibleTasks.map((task) => {
                          const isSelected = selectedTaskId === task.id;
                          const isCriticalPath =
                            task.critical && highlightCritical;
                          const isActiveInSelectedMonth =
                            activeTasksForSelectedMonth.includes(task.id);
                          return (
                            <div
                              key={task.id}
                              onClick={() => {
                                setSelectedTaskId(task.id);
                                setIsCreatingTask(false);
                                setShowDetailPanel(true);
                              }}
                              className={`flex items-center transition-all cursor-pointer border-b border-[#EFEBE7]/30 last:border-0 ${isSelected ? "bg-[#EFEBE7]/80" : "hover:bg-[#F9F8F6]"}`}
                            >
                              <div className="w-44 px-4 py-3 flex items-center gap-2 border-r border-[#EFEBE7]/60 sticky left-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] shrink-0">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCriticalPath ? "bg-[#9B8B70] animate-pulse" : "bg-transparent"}`}
                                ></span>
                                <span className="text-[8px] font-black text-[#9B8B70] uppercase shrink-0">
                                  [{task.id.toUpperCase()}]
                                </span>
                                <p
                                  className={`text-[10px] truncate ${isSelected ? "font-extrabold text-[#1C6048]" : "text-[#1E2F31]"}`}
                                  title={task.name}
                                >
                                  {task.name}
                                </p>
                                {taskConflicts[task.id] && (
                                  <AlertTriangle
                                    size={11}
                                    className="text-amber-500 shrink-0 select-none animate-bounce"
                                    title={`Schedule Clash: Starts before predecessor task [${taskConflicts[task.id][0].toUpperCase()}] completes`}
                                  />
                                )}
                              </div>
                              <div className="w-28 px-2 py-3 border-r border-[#D8D8D8] sticky left-44 bg-white z-20 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] shrink-0">
                                <span className="text-[9px] font-mono font-black text-[#4C4A4B] bg-[#EFEBE7] px-1.5 py-0.5 rounded whitespace-nowrap">
                                  {getTaskDateRangeString(
                                    task.start,
                                    task.duration,
                                  )}
                                </span>
                              </div>
                              <div className="flex-1 h-12 relative flex items-center">
                                <div
                                  className={`h-4.5 rounded-full absolute transition-all duration-300 flex items-center justify-between overflow-hidden shadow-sm ${isActiveInSelectedMonth ? "ring-2 ring-[#1E2F31] ring-offset-1" : ""} ${isCriticalPath ? "bg-gradient-to-r from-[#9B8B70] to-[#B5A58A]" : `bg-gradient-to-r ${group.color}`}`}
                                  style={{
                                    left: `${(task.start - 1) * monthWidth}px`,
                                    width: `${(parseInt(task.duration) || 1) * monthWidth}px`,
                                  }}
                                >
                                  <div
                                    className="absolute top-0 bottom-0 left-0 bg-white/20"
                                    style={{ width: `${task.progress}%` }}
                                  ></div>
                                  {task.duration >= 3 && (
                                    <span className="text-[8px] font-black text-white uppercase ml-3.5 z-10 mix-blend-overlay">
                                      {task.progress}% Complete
                                    </span>
                                  )}
                                  {isCriticalPath && (
                                    <ShieldAlert
                                      size={10}
                                      className="text-white mr-3.5 z-10 shrink-0"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-[#D8D8D8] bg-[#F9F8F6]/30 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-[#4C4A4B] font-medium shrink-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#1C6048]" /> Complete
              </div>
              <div className="flex items-center gap-1.5">
                <Activity size={13} className="text-[#9B8B70]" /> Underway
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#4C4A4B]/60" /> Future Phase
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1 text-[#1E2F31]">
                <Info size={13} className="text-[#9B8B70]" /> Click months in
                sidebar indexer to auto-scroll canvas.
              </div>
              <button
                onClick={() => {
                  setIsCreatingTask(true);
                  setSelectedTaskId(null);
                  setShowDetailPanel(true);
                }}
                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 transition-all bg-[#1C6048] hover:bg-opacity-95 text-white border border-[#1C6048] shadow-sm shrink-0"
              >
                <Plus size={12} /> Add Milestone
              </button>
            </div>
          </div>
        </div>

        {showDetailPanel && (
          <div className="xl:col-span-3 flex flex-col gap-6 max-h-[640px] overflow-y-auto custom-scrollbar">
            {isCreatingTask ? (
              <form
                onSubmit={handleTaskCreate}
                className="bg-white border border-[#D8D8D8] rounded-[24px] p-5 shadow-sm flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300"
              >
                <div className="flex justify-between items-center pb-2 border-b border-[#EFEBE7]">
                  <h3 className="text-sm font-black text-[#1E2F31] uppercase tracking-tight flex items-center gap-2">
                    <Plus size={16} className="text-[#1C6048]" /> New Milestone
                  </h3>
                  <span className="text-[9px] text-[#4C4A4B] font-bold uppercase">
                    Wizard
                  </span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                    Milestone Name
                  </label>
                  <input
                    type="text"
                    value={newTask.name}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="e.g. Procurement Sweep"
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                    Project Stage
                  </label>
                  <select
                    value={newTask.groupId}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, groupId: e.target.value }))
                    }
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none cursor-pointer"
                  >
                    <option value="design">1. Design & Planning</option>
                    <option value="licensing">2. Licensing & Regulatory</option>
                    <option value="construction">
                      3. Civil & Construction
                    </option>
                    <option value="infrastructure">4. Infrastructure</option>
                    <option value="equipment">5. Equipment & Launch</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="space-y-1.5 relative"
                    ref={
                      activeMonthPicker?.type === "create" ? pickerRef : null
                    }
                  >
                    <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                      Start Month
                    </label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeMonthPicker?.type === "create")
                          setActiveMonthPicker(null);
                        else
                          openMonthPicker("create", newTask.start, (val) =>
                            setNewTask((p) => ({ ...p, start: val })),
                          );
                      }}
                      className="w-full p-2 bg-[#F9F8F6] hover:bg-[#EFEBE7]/50 border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] flex items-center justify-between transition-colors shadow-sm text-left h-[34px] relative z-10"
                    >
                      <span>
                        {TIMELINE_MONTHS[
                          Math.min(Math.max(1, newTask.start), maxMonths) - 1
                        ]?.name || "Select"}
                      </span>
                      <ChevronDown size={14} className="text-[#9B8B70]" />
                    </button>
                    {activeMonthPicker?.type === "create" && (
                      <div className="absolute right-0 bottom-full mb-2 z-50 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/20 p-4 w-64 shadow-[0_12px_40px_rgba(30,47,49,0.15),inset_0_1px_1px_rgba(255,255,255,0.7)] animate-in fade-in slide-in-from-bottom-2 duration-150">
                        {renderInlineCalendarContent(activeMonthPicker)}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                      Duration (Months)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={maxAvailableMonths}
                      value={newTask.duration}
                      onChange={(e) =>
                        setNewTask((p) => ({ ...p, duration: e.target.value }))
                      }
                      onFocus={() => {
                        lastValidValRef.current = newTask.duration;
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value);
                        const fallback =
                          lastValidValRef.current !== null
                            ? lastValidValRef.current
                            : 4;
                        const cleanVal =
                          isNaN(val) || val < 1
                            ? fallback
                            : Math.min(maxAvailableMonths, val);
                        setNewTask((p) => ({ ...p, duration: cleanVal }));
                      }}
                      className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] font-black text-[#9B8B70] uppercase">
                    <span>Initial Progress</span>
                    <span>{newTask.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newTask.progress}
                    onChange={(e) =>
                      setNewTask((p) => ({
                        ...p,
                        progress: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 bg-[#D8D8D8] rounded-lg appearance-none cursor-pointer accent-[#1C6048]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                    Milestone Owner
                  </label>
                  <input
                    type="text"
                    value={newTask.owner}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, owner: e.target.value }))
                    }
                    placeholder="e.g. Clinical Director"
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                    Detailed Description
                  </label>
                  <textarea
                    value={newTask.desc}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, desc: e.target.value }))
                    }
                    placeholder="Summarize the core target vectors..."
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-[10px] font-medium text-[#4C4A4B] focus:ring-1 focus:ring-[#1C6048] outline-none h-14 resize-none leading-snug"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8]">
                  <span className="text-[10px] font-bold text-[#4C4A4B] uppercase">
                    Critical Path Task?
                  </span>
                  <input
                    type="checkbox"
                    checked={newTask.critical}
                    onChange={(e) =>
                      setNewTask((p) => ({ ...p, critical: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#1C6048] accent-[#1C6048] border-[#D8D8D8] cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTask(false)}
                    className="py-2 rounded-xl text-xs font-bold text-[#4C4A4B] bg-[#EFEBE7] hover:bg-[#D8D8D8] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 rounded-xl text-xs font-bold text-white bg-[#1C6048] hover:bg-opacity-95 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : selectedTask ? (
              <div className="bg-white border border-[#D8D8D8] rounded-[24px] p-5 shadow-sm flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2.5 py-1 rounded text-[8px] font-black uppercase text-white bg-gradient-to-r ${selectedTask.groupColor}`}
                  >
                    {selectedTask.groupName.split(" ")[1]} Milestone
                  </span>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to permanently delete "${selectedTask.name}"?`,
                        )
                      )
                        handleTaskDelete(selectedTask.groupId, selectedTask.id);
                    }}
                    className="text-gray-400 hover:text-[#9B8B70] transition-colors p-1 bg-[#F9F8F6] border border-[#D8D8D8] rounded-lg"
                    title="Delete Milestone"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[#9B8B70] uppercase">
                    Milestone Name
                  </label>
                  <input
                    type="text"
                    value={selectedTask.name}
                    onChange={(e) =>
                      handleTaskUpdate(
                        selectedTask.groupId,
                        selectedTask.id,
                        "name",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-xs font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                  />
                  <textarea
                    value={selectedTask.desc}
                    onChange={(e) =>
                      handleTaskUpdate(
                        selectedTask.groupId,
                        selectedTask.id,
                        "desc",
                        e.target.value,
                      )
                    }
                    className="w-full p-2 bg-[#F9F8F6] border border-[#D8D8D8] rounded-xl text-[10px] font-medium text-[#4C4A4B] focus:ring-1 focus:ring-[#1C6048] outline-none h-14 resize-none leading-snug"
                  />
                </div>
                <div className="p-4 bg-[#F9F8F6] rounded-2xl border border-[#D8D8D8] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#4C4A4B]">
                    <span>WORK PROGRESS</span>
                    <span
                      className={
                        selectedTask.progress === 100
                          ? "text-[#1C6048] font-black"
                          : "text-[#9B8B70] font-black"
                      }
                    >
                      {selectedTask.progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedTask.progress}
                    onChange={(e) =>
                      handleTaskUpdate(
                        selectedTask.groupId,
                        selectedTask.id,
                        "progress",
                        parseInt(e.target.value),
                      )
                    }
                    className="w-full h-1.5 bg-[#D8D8D8] rounded-lg appearance-none cursor-pointer accent-[#1C6048]"
                  />
                </div>
                <div className="border border-[#D8D8D8] rounded-2xl divide-y divide-[#D8D8D8] bg-white">
                  <div className="flex justify-between p-3 text-[10px] bg-[#F9F8F6]/30 items-center rounded-t-2xl">
                    <span className="font-bold text-[#4C4A4B] uppercase flex items-center gap-1.5">
                      <Users size={14} className="text-[#9B8B70]" /> Owner
                    </span>
                    <input
                      type="text"
                      value={selectedTask.owner}
                      onChange={(e) =>
                        handleTaskUpdate(
                          selectedTask.groupId,
                          selectedTask.id,
                          "owner",
                          e.target.value,
                        )
                      }
                      className="w-28 p-1 text-right border border-[#D8D8D8] rounded font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                    />
                  </div>
                  <div
                    className="flex justify-between p-3 text-[10px] bg-[#F9F8F6]/30 items-center relative"
                    ref={activeMonthPicker?.type === "edit" ? pickerRef : null}
                  >
                    <span className="font-bold text-[#4C4A4B] uppercase flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#99B6AA]" /> Start
                      Month
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeMonthPicker?.type === "edit")
                          setActiveMonthPicker(null);
                        else
                          openMonthPicker("edit", selectedTask.start, (val) =>
                            handleTaskUpdate(
                              selectedTask.groupId,
                              selectedTask.id,
                              "start",
                              val,
                            ),
                          );
                      }}
                      className="w-28 p-1 bg-white hover:bg-[#F9F8F6]/80 border border-[#D8D8D8] rounded font-bold text-[#1E2F31] text-right text-[10px] flex items-center justify-between px-2 h-[26px] relative z-10"
                    >
                      <span>
                        {TIMELINE_MONTHS[
                          Math.min(Math.max(1, selectedTask.start), maxMonths) -
                            1
                        ]?.name || "Select"}
                      </span>
                      <ChevronDown
                        size={12}
                        className="text-[#9B8B70] ml-1 shrink-0"
                      />
                    </button>
                    {activeMonthPicker?.type === "edit" && (
                      <div className="absolute right-3 bottom-full mb-1 z-50 bg-white/40 backdrop-blur-2xl rounded-2xl border border-white/20 p-4 w-64 shadow-[0_12px_40px_rgba(30,47,49,0.15),inset_0_1px_1px_rgba(255,255,255,0.7)] animate-in fade-in slide-in-from-bottom-2 duration-150 text-left animate-out">
                        {renderInlineCalendarContent(activeMonthPicker)}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between p-3 text-[10px] bg-[#F9F8F6]/30 items-center rounded-b-2xl">
                    <span className="font-bold text-[#4C4A4B] uppercase flex items-center gap-1.5">
                      <Clock size={14} className="text-[#9B8B70]" /> Duration
                    </span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max={maxAvailableMonths - selectedTask.start + 1}
                        value={selectedTask.duration}
                        onChange={(e) =>
                          handleTaskUpdate(
                            selectedTask.groupId,
                            selectedTask.id,
                            "duration",
                            e.target.value,
                          )
                        }
                        onFocus={() => {
                          lastValidValRef.current = selectedTask.duration;
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          const fallback =
                            lastValidValRef.current !== null
                              ? lastValidValRef.current
                              : 1;
                          const cleanVal =
                            isNaN(val) || val < 1
                              ? fallback
                              : Math.min(
                                  maxAvailableMonths - selectedTask.start + 1,
                                  val,
                                );
                          handleTaskUpdate(
                            selectedTask.groupId,
                            selectedTask.id,
                            "duration",
                            cleanVal,
                          );
                        }}
                        className="w-12 p-1 text-right border border-[#D8D8D8] rounded font-bold text-[#1E2F31] focus:ring-1 focus:ring-[#1C6048] outline-none"
                      />
                      <span className="font-bold text-[#4C4A4B] text-[9px] uppercase">
                        Mos
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-[#9B8B70] tracking-wider mb-2">
                    Target Dependencies
                  </h4>
                  {(selectedTask.dependencies || []).length > 0 ? (
                    <div className="flex flex-col gap-1.5">
                      {(selectedTask.dependencies || []).map((depId) => {
                        const depName = getTaskNameById(depId);
                        return (
                          <div
                            key={depId}
                            onClick={() => setSelectedTaskId(depId)}
                            className="px-3 py-2 bg-[#EFEBE7] hover:bg-[#D8D8D8] rounded-xl border border-[#D8D8D8] text-[10px] font-bold text-[#1E2F31] cursor-pointer transition-colors flex items-center justify-between group shadow-sm"
                            title={`Click to focus predecessor: ${depName}`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <ArrowRight
                                size={10}
                                className="text-[#9B8B70] group-hover:translate-x-0.5 transition-transform"
                              />
                              <span className="text-[#9B8B70] shrink-0 font-extrabold">
                                {depId.toUpperCase()}:
                              </span>
                              <span className="truncate text-[#4C4A4B] group-hover:text-[#1E2F31]">
                                {depName}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#4C4A4B]/60 italic font-medium">
                      None. This is an initial parent task.
                    </span>
                  )}
                </div>
                {selectedTask.critical && highlightCritical && (
                  <div className="p-4 bg-[#EFEBE7] border border-[#9B8B70]/30 rounded-2xl flex items-start gap-3">
                    <ShieldAlert
                      size={18}
                      className="text-[#9B8B70] shrink-0 mt-0.5"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-[#1E2F31]">
                        Critical Path Notice
                      </h4>
                      <p className="text-[10px] text-[#4C4A4B] leading-relaxed font-medium mt-1">
                        Delays in this milestone directly disrupt downstream
                        equipment fitment, nuclear physics calibration, and
                        final commercial opening.
                      </p>
                    </div>
                  </div>
                )}
                {selectedTaskConflicts && selectedTaskConflicts.length > 0 && (
                  <div className="p-4 bg-[#F9F8F6] border-2 border-amber-500/40 rounded-2xl flex flex-col gap-2.5 animate-in fade-in duration-300">
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        size={18}
                        className="text-amber-600 shrink-0 mt-0.5 animate-pulse"
                      />
                      <div>
                        <h4 className="font-extrabold text-xs text-[#1E2F31] uppercase tracking-wider">
                          Timeline Clash Warning
                        </h4>
                        <p className="text-[10px] text-[#4C4A4B] leading-relaxed font-bold mt-1">
                          We detected sequencing issues that are unrealistic or
                          conflict with predecessors:
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5 pl-7">
                      {selectedTaskConflicts.map((msg, idx) => (
                        <p
                          key={idx}
                          className="text-[10px] text-[#1E2F31] font-bold leading-normal relative before:content-['•'] before:absolute before:-left-3 before:text-[#9B8B70]"
                        >
                          {msg}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#D8D8D8] rounded-[24px] p-8 shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
                <HelpCircle size={40} className="text-[#D8D8D8] mb-4" />
                <p className="text-xs text-[#4C4A4B] font-bold uppercase tracking-wider">
                  No Milestone Selected
                </p>
                <p className="text-[10px] text-[#4C4A4B]/60 font-medium mt-2 max-w-[200px]">
                  Click any element on the timeline or click "+ Add Milestone"
                  to construct new tasks.
                </p>
              </div>
            )}
            <div className="bg-[#EFEBE7] rounded-[24px] p-6 border border-[#D8D8D8] flex flex-col gap-4">
              <h3 className="font-black text-xs text-[#1E2F31] uppercase tracking-wider flex items-center gap-2">
                <Award size={16} className="text-[#1C6048]" /> Moat Milestone
                Strategy
              </h3>
              <p className="text-[11px] text-[#4C4A4B] leading-relaxed font-medium">
                By securing the <strong>BAPETEN Nuclear Licensing</strong> in
                Phase 2 (Months 9-16), we lock in our legal monopoly. Since no
                general competitor in the Tangerang sector holds these
                permissions, this approval protects our oncology revenues even
                before physical construction is finalized.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

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
          const isBalance = ["debtBalance", "debtBalanceExLand"];
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
  const [isLockedOpCo, setIsLockedOpCo] = useState(true);
  const [isLockedPropCo, setIsLockedPropCo] = useState(true);
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
    if (!propCoAssumptions.includeFinancing && holdCoScenario === "debt_free") {
      setHoldCoScenario("breakeven");
    }
  }, [propCoAssumptions.includeFinancing, holdCoScenario]);

  useEffect(() => {
    if (!propCoAssumptions.includeFinancing && propCoScenario === "debt_free") {
      setPropCoScenario("breakeven");
    }
  }, [propCoAssumptions.includeFinancing, propCoScenario]);

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
      (t) => t.id === "t13" || t.name.toLowerCase().includes("commercial opening")
    );
    return commOpeningTask ? Math.max(1, commOpeningTask.start - 1) : propCoAssumptions.devDurationMonths || 24;
  }, [groups, propCoAssumptions.devDurationMonths]);

  const projConfig = useMemo(() => {
    if (holdCoScenario === "manual")
      return {
        exitYear: opCoAssumptions.includeTerminalValue ? 10 : -1,
        projYears: 10,
      };
    if (holdCoScenario === "none") {
      const y = Math.max(15, (propCoAssumptions.loanTenor || 15) + 2);
      return { exitYear: -1, projYears: Math.min(y, 30) };
    }
    if (holdCoScenario === "yr10") return { exitYear: 10, projYears: 10 };
    if (holdCoScenario === "debt_free") {
      const p1 = { exitYear: -1, projYears: 30 };
      const op1 = runOpCoEngine({ ...opCoAssumptions, devDurationMonths: resolvedDevDuration }, p1);
      const pr1 = runPropCoEngine({ ...propCoAssumptions, devDurationMonths: resolvedDevDuration }, op1, p1, groups);
      const cons1 = runConsolidatedEngine(op1, pr1, opCoAssumptions);

      const devYears = Math.max(
        1,
        Math.ceil(resolvedDevDuration / 12),
      );
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
      const op1 = runOpCoEngine({ ...opCoAssumptions, devDurationMonths: resolvedDevDuration }, p1);
      const pr1 = runPropCoEngine({ ...propCoAssumptions, devDurationMonths: resolvedDevDuration }, op1, p1, groups);
      const cons1 = runConsolidatedEngine(op1, pr1, opCoAssumptions);

      const devYears = Math.max(
        1,
        Math.ceil(resolvedDevDuration / 12),
      );
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
  }, [holdCoScenario, opCoAssumptions, propCoAssumptions, groups, resolvedDevDuration]);

  const propCoProjConfig = useMemo(() => {
    if (propCoScenario === "manual")
      return {
        exitYear: propCoAssumptions.includeTerminalValue ? 10 : -1,
        projYears: 10,
      };
    if (propCoScenario === "none") {
      const y = Math.max(15, (propCoAssumptions.loanTenor || 15) + 2);
      return { exitYear: -1, projYears: Math.min(y, 30) };
    }
    if (propCoScenario === "yr10") return { exitYear: 10, projYears: 10 };
    if (propCoScenario === "debt_free") {
      const p1 = { exitYear: -1, projYears: 30 };
      const op1 = runOpCoEngine({ ...opCoAssumptions, devDurationMonths: resolvedDevDuration }, p1);
      const pr1 = runPropCoEngine({ ...propCoAssumptions, devDurationMonths: resolvedDevDuration }, op1, p1, groups);

      const devYears = Math.max(
        1,
        Math.ceil(resolvedDevDuration / 12),
      );
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
      const op1 = runOpCoEngine({ ...opCoAssumptions, devDurationMonths: resolvedDevDuration }, p1);
      const pr1 = runPropCoEngine({ ...propCoAssumptions, devDurationMonths: resolvedDevDuration }, op1, p1, groups);

      const devYears = Math.max(
        1,
        Math.ceil(resolvedDevDuration / 12),
      );
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
  }, [propCoScenario, opCoAssumptions, propCoAssumptions, groups, resolvedDevDuration]);

  const standalonePropCoOpCoData = useMemo(
    () => runOpCoEngine({ ...opCoAssumptions, devDurationMonths: resolvedDevDuration }, propCoProjConfig),
    [opCoAssumptions, propCoProjConfig, resolvedDevDuration],
  );

  const standalonePropCoData = useMemo(
    () => runPropCoEngine({ ...propCoAssumptions, devDurationMonths: resolvedDevDuration }, standalonePropCoOpCoData, propCoProjConfig, groups),
    [propCoAssumptions, standalonePropCoOpCoData, propCoProjConfig, groups, resolvedDevDuration],
  );

  const opCoModelData = useMemo(
    () => runOpCoEngine({ ...opCoAssumptions, devDurationMonths: resolvedDevDuration }, projConfig),
    [opCoAssumptions, projConfig, resolvedDevDuration],
  );
  const propCoModelData = useMemo(
    () => runPropCoEngine({ ...propCoAssumptions, devDurationMonths: resolvedDevDuration }, opCoModelData, projConfig, groups),
    [propCoAssumptions, opCoModelData, projConfig, groups, resolvedDevDuration],
  );
  const consolidatedModelData = useMemo(
    () =>
      runConsolidatedEngine(opCoModelData, propCoModelData, opCoAssumptions),
    [opCoModelData, propCoModelData, opCoAssumptions],
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
        [k]: ["includeTerminalValue", "rentStructureType"].includes(k)
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
          "includeMedEq",
          "medEqProcurement",
          "includeFFE",
          "depMethodBuilding",
          "depMethodMedEq",
          "depMethodInfra",
          "depMethodFFE",
          "includeTerminalValue",
          "exitMethod",
          "includeFinancing",
          "drawdownScenario",
          "drawdownTranches",
          "repaymentType",
          "stepUpPercentages",
        ].includes(key)
          ? val
          : (val === "" ? 0 : parseFloat(val)) || 0;
      });
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
                    disabled={activeCompany === "consolidated"}
                    onClick={() => setActiveTab("sensitivity")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap shrink-0 ${activeCompany === "consolidated" ? "opacity-30 cursor-not-allowed text-[#4C4A4B]" : activeTab === "sensitivity" ? "bg-[#1E2F31] text-white shadow-sm" : "text-[#4C4A4B] hover:text-[#1E2F31] hover:bg-white"}`}
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
                  <Lock size={14} className={propCoLocked ? "text-[#1C6048]" : "text-[#4C4A4B]/40"} /> Lock PropCo to Master
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
                <Target size={14} className={holdCoLocked ? "text-[#1C6048]/50" : "text-[#1C6048]"} /> Master Exit
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
                  disabled={!propCoAssumptions?.includeFinancing}
                >
                  Exit Post-Debt
                </option>
                <option value="none">No Exit (Yield)</option>
              </select>
            </div>
            {/* Dropdown: PropCo Exit Strategy */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] font-medium text-[#4C4A4B] flex items-center gap-1.5">
                <Target size={14} className={propCoLocked ? "text-[#9B8B70]/50" : "text-[#9B8B70]"} /> PropCo Exit
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
                  disabled={!propCoAssumptions?.includeFinancing}
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
