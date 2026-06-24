import { ClinicalProgrammingView } from "./ClinicalProgrammingView";
import { InteractiveDemographicMap } from "./InteractiveDemographicMap";
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
  Timer,
  HeartPulse,
  Zap,
  ShieldAlert,
  Layers,
  Check,
  X,
  Microscope,
  Dna,
  Bone,
  Baby,
  Eye,
  Plane,
  Scale,
  CheckCircle2,
  Map,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  LineChart,
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
  BentoBox,
  BentoIcon,
  SectionTitle,
  MarkdownRenderer,
  START_YEAR,
  CustomBedIcon,
  CustomPhysicianIcon,
  CustomPopulationIcon,
  CustomScaleIcon,
  CustomKnotIcon,
  CustomStethoscopeIcon,
  CHART_MARGINS_BAR,
  CHART_MARGINS_LINE,
  TOOLTIP_STYLE,
  TICK_STYLE,
  PREM_MKT_PIE_DATA,
  CANCER_DATA,
  INSURANCE_DATA,
  formatCancerCases,
  formatInsuranceTooltip,
  LINE_LABEL_STYLE,
  renderPieLabel,
} from "../App";
import {
  OPCO_FORMULAS,
  PROPCO_FORMULAS,
  CONSOLIDATED_FORMULAS,
} from "../formulaTooltips";

export const StudyView = memo(
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
                        <RechartsPieChart style={{ outline: "none" }}>
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
                        </RechartsPieChart>
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
