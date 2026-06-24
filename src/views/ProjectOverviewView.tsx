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
  Building,
  FileText,
  MapPin,
  Stethoscope,
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
  BentoBox,
  BentoIcon,
  ProjectInfoFieldComp,
} from "../App";
import {
  OPCO_FORMULAS,
  PROPCO_FORMULAS,
  CONSOLIDATED_FORMULAS,
} from "../formulaTooltips";

export const ProjectOverviewView = memo(({ info, setInfo, isLocked }: any) => (
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
