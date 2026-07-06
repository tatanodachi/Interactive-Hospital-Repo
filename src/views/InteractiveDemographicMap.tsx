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

import {
  BentoBox,
  BentoIcon,
  SectionTitle,
  MarkdownRenderer,
  START_YEAR,
  DEFAULT_END_YEAR,
  MONTH_NAMES_SHORT,
  generateTimelineMonths,
  CustomBedIcon,
  CustomScaleIcon,
  CustomStethoscopeIcon,
  CustomPhysicianIcon,
  CustomClipboardIcon,
  CustomDiagnosticsIcon,
  formatCurrency,
  formatNumber,
  AssumptionRow,
  StatefulTooltipIcon,
  NavButton,
} from "../App";

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

  // --- ORTHOPEDIC HOSPITALS (Static/Standalone Group) ---
  // Class A
  {
    id: "mrccc_ortho",
    name: "MRCCC Siloam",
    group: "Orthopedic Hospitals",
    subGroup: "Class A",
    desc: "Private Comprehensive Center",
    lat: -6.2201,
    lon: 106.8155,
    color: "#5E4B8B",
  },
  // Class B
  {
    id: "rs_islam_cempaka_putih",
    name: "Jakarta Islamic Hospital",
    group: "Orthopedic Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.1736,
    lon: 106.8715,
    color: "#5E4B8B",
  },
  {
    id: "mayapada_south_jakarta",
    name: "Mayapada Hospital South Jakarta",
    group: "Orthopedic Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.2915,
    lon: 106.7815,
    color: "#5E4B8B",
  },
  {
    id: "medistra",
    name: "Medistra Hospital",
    group: "Orthopedic Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.2410,
    lon: 106.8340,
    color: "#5E4B8B",
  },
  {
    id: "royal_progress",
    name: "Royal Progress Hospital",
    group: "Orthopedic Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.1364,
    lon: 106.8582,
    color: "#5E4B8B",
  },
  {
    id: "mayapada_tangerang",
    name: "Mayapada Hospital Tangerang",
    group: "Orthopedic Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.2045,
    lon: 106.6493,
    color: "#5E4B8B",
  },
  {
    id: "emc_alam_sutera",
    name: "RS EMC Alam Sutera",
    group: "Orthopedic Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.2411,
    lon: 106.6620,
    color: "#5E4B8B",
  },
  {
    id: "premier_bintaro",
    name: "RS Premier Bintaro",
    group: "Orthopedic Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.2842,
    lon: 106.7275,
    color: "#5E4B8B",
  },

  // --- CARDIOLOGY HOSPITALS ---
  // Class A
  {
    id: "rsjpd_harapan_kita",
    name: "RSJPD Harapan Kita",
    group: "Cardiology Hospitals",
    subGroup: "Class A",
    desc: "National Cardiovascular Center (Public)",
    lat: -6.1972,
    lon: 106.7993,
    color: "#A22A38",
  },
  // Class B
  {
    id: "tzuchi_pik_cardio",
    name: "Tzu Chi Hospital PIK",
    group: "Cardiology Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.106,
    lon: 106.7392,
    color: "#A22A38",
  },
  {
    id: "mayapada_south_jakarta_cardio",
    name: "Mayapada Hospital South Jakarta",
    group: "Cardiology Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.2915,
    lon: 106.7815,
    color: "#A22A38",
  },
  {
    id: "medistra_cardio",
    name: "Medistra Hospital",
    group: "Cardiology Hospitals",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.2410,
    lon: 106.8340,
    color: "#A22A38",
  },
  // Class C
  {
    id: "heartology_cardio",
    name: "Heartology Cardiovascular Hospital",
    group: "Cardiology Hospitals",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.2231,
    lon: 106.7845,
    color: "#A22A38",
  },
  {
    id: "brawijaya_saharjo_cardio",
    name: "Brawijaya Hospital Saharjo",
    group: "Cardiology Hospitals",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.2163,
    lon: 106.8436,
    color: "#A22A38",
  },

  // --- MOTHER AND CHILDREN ---
  // Class B
  {
    id: "m_bunda_jakarta",
    name: "RSIA Bunda Jakarta",
    group: "Mother and Children",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.1950,
    lon: 106.8379,
    color: "#DE829B",
  },
  {
    id: "m_kemang_medical",
    name: "Kemang Medical Care Hospital",
    group: "Mother and Children",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.2811,
    lon: 106.8223,
    color: "#DE829B",
  },
  {
    id: "m_brawijaya_antasari",
    name: "RSIA Brawijaya Antasari",
    group: "Mother and Children",
    subGroup: "Class B",
    desc: "Private (B)",
    lat: -6.2572,
    lon: 106.8083,
    color: "#DE829B",
  },
  // Class C
  {
    id: "m_pratiwi",
    name: "RSIA Pratiwi",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.2163,
    lon: 106.7118,
    color: "#DE829B",
  },
  {
    id: "m_pku_muhammadiyah",
    name: "RSIA PKU Muhammadiyah",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.1925,
    lon: 106.6660,
    color: "#DE829B",
  },
  {
    id: "m_makiyah",
    name: "RSIA Makiyah",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.2114,
    lon: 106.6805,
    color: "#DE829B",
  },
  {
    id: "m_gebang_medika",
    name: "RSIA Gebang Medika",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.1717,
    lon: 106.5954,
    color: "#DE829B",
  },
  {
    id: "m_karunia_bunda",
    name: "RSIA Karunia Bunda",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.1990,
    lon: 106.5880,
    color: "#DE829B",
  },
  {
    id: "m_metro_kebon_jeruk",
    name: "RSIA Metro Hospitals Kebon Jeruk",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.1834,
    lon: 106.7630,
    color: "#DE829B",
  },
  {
    id: "m_jwcc_asih",
    name: "JWCC Asih",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.2443,
    lon: 106.7983,
    color: "#DE829B",
  },
  {
    id: "m_sammarie_wijaya",
    name: "RSIA SamMarie Wijaya",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.2427,
    lon: 106.8125,
    color: "#DE829B",
  },
  {
    id: "m_brawijaya_duren_tiga",
    name: "Brawijaya Hospital Duren Tiga",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.2515,
    lon: 106.8344,
    color: "#DE829B",
  },
  {
    id: "m_santo_yusuf",
    name: "RSIA Santo Yusuf",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.2338,
    lon: 106.6139,
    color: "#DE829B",
  },
  {
    id: "m_eka_pluit",
    name: "RSIA Eka Hospital Pluit",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.1158,
    lon: 106.7891,
    color: "#DE829B",
  },
  {
    id: "m_eka_pik_grand_family",
    name: "Eka Hospital PIK Grand Family",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.1105,
    lon: 106.7378,
    color: "#DE829B",
  },
  {
    id: "m_tambak",
    name: "RSIA Tambak",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.2081,
    lon: 106.8489,
    color: "#DE829B",
  },
  {
    id: "m_assyifa",
    name: "RSIA Assyifa",
    group: "Mother and Children",
    subGroup: "Class C",
    desc: "Private (C)",
    lat: -6.1956,
    lon: 106.6115,
    color: "#DE829B",
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
    id: "kemayoran",
    name: "Kemayoran",
    group: "Vasanta",
    desc: "Central/North Jakarta node",
    lat: -6.150709390197145,
    lon: 106.84302175228443,
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
  const [showQuickTip, setShowQuickTip] = useState(() => {
    try {
      const saved = localStorage.getItem("hcp_map_quick_tip_dismissed");
      return saved !== "true";
    } catch (e) {
      return true;
    }
  });
  const [activeTab, setActiveTab] = useState("controls"); // controls | analytics
  const [viewMode, setViewMode] = useState("admin");
  const [regionsSectionExpanded, setRegionsSectionExpanded] = useState(true);
  const [poiSectionExpanded, setPoiSectionExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedPoiGroups, setExpandedPoiGroups] = useState({
    Vasanta: false,
    "Cancer Hospitals": false,
    "Orthopedic Hospitals": false,
    "Cardiology Hospitals": false,
    "Mother and Children": false,
    General: false,
    Infrastructure: false,
  });
  const [expandedSubGroups, setExpandedSubGroups] = useState({
    "Class A": false,
    "Class B": false,
    "Class C": false,
    "< 5km Radius": false,
    "5-10km Radius": false,
  });
  const [activeRegions, setActiveRegions] = useState(
    targetRegions.filter((r) => !r.defaultOff).map((r) => r.id),
  );
  const [showRegionLabels, setShowRegionLabels] = useState(false);
  const [showTollRoads, setShowTollRoads] = useState(true);
  const [activePOIs, setActivePOIs] = useState(() => {
    return mapLocations
      .filter((loc) => {
        if (loc.subGroup === "< 5km Radius") return false;
        if (loc.subGroup === "5-10km Radius") return false;
        if (loc.group === "Cancer Hospitals") return false;
        if (loc.group === "Orthopedic Hospitals") return false;
        if (loc.group === "Cardiology Hospitals") return false;
        if (loc.group === "Mother and Children") return false;
        if (loc.group === "General") return false;
        return true;
      })
      .map((l) => l.id);
  });
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
      ghJS.crossOrigin = "anonymous";
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
    leafletJS.crossOrigin = "anonymous";
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
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#5E4B8B] shadow-sm flex-shrink-0"></span>
                <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                  Orthopedic Hospitals
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#A22A38] shadow-sm flex-shrink-0"></span>
                <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                  Cardiology Hospitals
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white bg-[#DE829B] shadow-sm flex-shrink-0"></span>
                <span className="text-[10px] font-bold text-[#4C4A4B] leading-tight flex-1">
                  Mother & Children
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
                    "Orthopedic Hospitals",
                    "Cardiology Hospitals",
                    "Mother and Children",
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
                                    (l.id !== "tb" &&
                                      l.id !== "new_vasanta" &&
                                      l.id !== "kemayoran")),
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
                                    l.id === "tb" ||
                                    l.id === "new_vasanta" ||
                                    l.id === "kemayoran",
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

      {/* Floating Interactive "Quick Tip" Card */}
      {showQuickTip && (
        <div className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-[1020] w-[calc(100%-32px)] sm:w-[380px] bg-[#1E2F31]/95 text-[#F9F8F6] border border-[#1C6048]/50 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex-col gap-2.5 transition-all duration-300 pointer-events-auto ${
          isPanelOpen && isLegendOpen
            ? "hidden"
            : isPanelOpen || isLegendOpen
            ? "hidden sm:flex"
            : "flex"
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-[#1C6048]/30 rounded-lg text-[#1C6048] border border-[#1C6048]/20 mt-0.5 flex-shrink-0">
                <Sparkles size={14} className="text-[#9B8B70]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-[#9B8B70] uppercase tracking-wider mb-0.5">
                  Pro-Feasibility Tip
                </span>
                <p className="text-[11px] font-medium leading-relaxed text-[#F9F8F6]/95">
                  Open the <strong className="text-white">Map Data</strong> and <strong className="text-white">Legend</strong> panels for more information.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowQuickTip(false);
                try {
                  localStorage.setItem("hcp_map_quick_tip_dismissed", "true");
                } catch (e) {}
              }}
              className="text-[#F9F8F6]/60 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center -mr-1 -mt-1 flex-shrink-0"
              title="Dismiss Tip"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-0.5 justify-end">
            {!isPanelOpen && (
              <button
                onClick={() => setIsPanelOpen(true)}
                className="px-2.5 py-1 bg-[#1C6048] hover:bg-[#1C6048]/85 text-white font-bold text-[10px] uppercase rounded-md shadow-sm transition-colors cursor-pointer border border-transparent flex items-center gap-1"
              >
                <Map size={10} />
                <span>Open Map Data</span>
              </button>
            )}
            {!isLegendOpen && (
              <button
                onClick={() => setIsLegendOpen(true)}
                className="px-2.5 py-1 bg-[#9B8B70] hover:bg-[#9B8B70]/85 text-[#1E2F31] font-bold text-[10px] uppercase rounded-md shadow-sm transition-colors cursor-pointer border border-transparent flex items-center gap-1"
              >
                <Layers size={10} />
                <span>Open Legend</span>
              </button>
            )}
            {(!isPanelOpen || !isLegendOpen) && (
              <button
                onClick={() => {
                  setIsPanelOpen(true);
                  setIsLegendOpen(true);
                }}
                className="px-2.5 py-1 bg-[#F9F8F6]/10 hover:bg-[#F9F8F6]/20 text-[#F9F8F6] font-bold text-[10px] uppercase rounded-md transition-colors cursor-pointer border border-white/10"
              >
                <span>Open Both</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
// === END INTERACTIVE MAP ===
export { InteractiveDemographicMap };
