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
  BentoBox, BentoIcon, SectionTitle, MarkdownRenderer, START_YEAR, 
  DEFAULT_END_YEAR, MONTH_NAMES_SHORT, generateTimelineMonths,
  CustomBedIcon, CustomScaleIcon, CustomStethoscopeIcon, CustomPhysicianIcon, 
  CustomClipboardIcon, CustomDiagnosticsIcon, formatCurrency, formatNumber,
  AssumptionRow, StatefulTooltipIcon, NavButton
} from "../App";
  
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
export { ClinicalProgrammingView };
