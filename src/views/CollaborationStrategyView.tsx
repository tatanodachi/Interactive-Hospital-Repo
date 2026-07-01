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
  Network,
  Dna,
  Share2,
  Copy,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  Database,
  CloudLightning,
  UserCheck
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
  CustomDiagnosticsIcon,
  CustomLinacIcon,
  CustomOverseasIcon,
  CustomPalliativeIcon,
  CustomClipboardIcon,
} from "../App";

export const CollaborationStrategyView = memo(({
  isPresenting,
  user,
  currentProjectId,
  projectOwnerId,
  projectInfo,
  isCloudSync,
  setIsCloudSync,
  cloudStatus,
  collabCodeInput,
  setCollabCodeInput,
  collabError,
  setCollabError,
  collabSuccess,
  setCollabSuccess,
  handleJoinWorkspace,
  collabEmailInput,
  setCollabEmailInput,
  collabEmailList,
  handleAddCollaborator,
  handleRemoveCollaborator,
  joinedProjects,
  handleLeaveWorkspace,
  onLoadProject
}: any) => {
  const [copiedToken, setCopiedToken] = useState(false);

  // Compute Active Collaboration Code (Option A)
  const activeCollabToken = useMemo(() => {
    if (!user) return "";
    const ownerId = projectOwnerId || user.uid;
    const projId = currentProjectId || "default";
    try {
      return btoa(`${ownerId}:${projId}`);
    } catch {
      return `${ownerId}:${projId}`;
    }
  }, [user, projectOwnerId, currentProjectId]);

  const isOwner = !user || !projectOwnerId || projectOwnerId === user.uid;

  const handleCopyToken = () => {
    if (!activeCollabToken) return;
    navigator.clipboard.writeText(activeCollabToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16">
      
      {/* 1. STRATEGIC ROADMAP SECTION */}
      <div className="space-y-6">
        <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-sm border border-[#D8D8D8] flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl font-black text-[#1E2F31] tracking-tight mb-2 flex items-center gap-3">
              <Network className="text-[#1C6048]" size={28} /> Cross-Border Patient Journey Strategy
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

            <div className="lg:hidden absolute -bottom-5 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#9B8B70] border-4 border-[#F9F8F6] rounded-full flex items-center justify-center shadow-md z-10 text-white">
              <ArrowRight size={14} strokeWidth={3} className="rotate-90" />
            </div>
          </div>

          {/* CENTER COLUMN: 2 Stacked Cards */}
          <div className="flex flex-col gap-6 lg:gap-10 h-full relative z-20">
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

            <div className="hidden lg:block absolute -right-10 top-[26%] bottom-[26%] w-10 z-0 pointer-events-none">
              <div className="absolute top-0 bottom-0 right-5 w-5 border-y-2 border-r-2 border-[#9B8B70] rounded-r-xl shadow-[2px_0_4px_rgba(0,0,0,0.05)]"></div>
              <div className="absolute top-1/2 right-0 w-5 border-t-2 border-[#9B8B70] -translate-y-[1px]"></div>
              <ArrowRight
                size={18}
                className="absolute top-1/2 -mt-[9px] -right-[7px] text-[#9B8B70]"
                strokeWidth={3}
              />
            </div>

            <div className="lg:hidden absolute top-[calc(50%-20px)] left-1/2 -translate-x-1/2 w-8 h-8 bg-[#9B8B70] border-4 border-[#F9F8F6] rounded-full flex items-center justify-center shadow-md z-10 text-white">
              <ArrowRight size={14} strokeWidth={3} className="rotate-90" />
            </div>

            {/* Top Center: Local Systemic */}
            <BentoBox className="flex-1 text-center bg-white border-[#D8D8D8] flex flex-col items-center">
              <h3 className="font-black text-[15px] text-[#1E2F31] mb-4">
                Local Systemic & LINAC
              </h3>

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

      {/* 2. REAL-TIME TEAM COLLABORATION CONTROLS (OPTIONS A & B) */}
      <div className="space-y-6 pt-4 border-t border-[#D8D8D8]">
        <div>
          <h2 className="text-xl font-black text-[#1E2F31] tracking-tight mb-1 flex items-center gap-2">
            <CloudLightning className="text-[#1C6048]" size={24} /> Real-Time Cloud Workspace Collaboration
          </h2>
          <p className="text-xs text-[#4C4A4B] font-medium leading-relaxed">
            Link and synchronize your financial models across your team. Teammates can view and modify operating and property assumptions in real-time.
          </p>
        </div>

        {!user ? (
          <div className="bg-white rounded-[24px] border border-dashed border-[#D8D8D8] p-8 text-center max-w-2xl mx-auto shadow-sm">
            <Database className="mx-auto text-gray-300 mb-3 animate-pulse" size={40} />
            <h3 className="font-bold text-[#1E2F31] text-sm mb-1">Collaboration Server Offline</h3>
            <p className="text-xs text-[#4C4A4B] max-w-md mx-auto mb-5 leading-relaxed">
              To activate Option A (Workspace Link Sharing) and Option B (Direct Email Collaborators), you must sign in to secure Cloud Database Synchronization first.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#1C6048] bg-[#1C6048]/10 px-4 py-2 rounded-xl">
              <Info size={14} /> Use the "Cloud Sync" switch at the top-right header to log in or register.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Column: Connection status and Workspace sharing code (Option A) */}
            <div className="md:col-span-5 flex flex-col gap-6">
              
              {/* Workspace Settings Card */}
              <div className="bg-white rounded-[24px] border border-[#D8D8D8] p-6 shadow-sm flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1C6048] animate-ping"></div>
                    <span className="text-xs font-bold text-[#1C6048] uppercase tracking-wider font-mono">Live Sync Active</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">Owner: {isOwner ? "You" : "Collaborator Workspace"}</div>
                </div>

                <div className="mb-5">
                  <h3 className="font-black text-sm text-[#1E2F31] mb-1">Active Project</h3>
                  <div className="p-3 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8] flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-[#1E2F31]">{projectInfo.name || "Vasanta Hospital Project"}</span>
                      <span className="block text-[10px] text-gray-500 font-mono mt-0.5">ID: {currentProjectId || "default"}</span>
                    </div>
                  </div>
                </div>

                {/* Option A Display: Workspace Access Token */}
                <div className="mt-auto pt-4 border-t border-[#EFEBE7]">
                  <h4 className="text-xs font-black text-[#1E2F31] mb-1 flex items-center gap-1.5">
                    <Share2 size={13} className="text-[#9B8B70]" /> Option A: Share Workspace Access Token
                  </h4>
                  <p className="text-[10px] text-[#4C4A4B] leading-relaxed mb-3">
                    Copy and send this encrypted workspace token to your teammate. They can paste it to gain complete, real-time shared access.
                  </p>
                  
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[#F9F8F6] p-2.5 rounded-xl border border-[#D8D8D8] text-[10px] font-mono text-gray-600 truncate break-all select-all select-none">
                      {activeCollabToken}
                    </div>
                    <button
                      onClick={handleCopyToken}
                      className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 shrink-0 transition-all ${
                        copiedToken 
                          ? "bg-[#1C6048] text-white" 
                          : "bg-[#EFEBE7] text-[#1E2F31] hover:bg-[#9B8B70] hover:text-white"
                      }`}
                    >
                      {copiedToken ? <Check size={14} /> : <Copy size={14} />}
                      {copiedToken ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Manage Collaborators (Option B) and Joined Workspaces */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Option B: Authorized Collaborators Card */}
              <div className="bg-white rounded-[24px] border border-[#D8D8D8] p-6 shadow-sm">
                <h3 className="font-black text-sm text-[#1E2F31] mb-1 flex items-center gap-1.5">
                  <UserCheck size={16} className="text-[#1C6048]" /> Option B: Authorized Teammate Emails
                </h3>
                <p className="text-xs text-[#4C4A4B] mb-4">
                  Only individuals with emails registered below are securely granted cloud write permission to this specific project.
                </p>

                {isOwner ? (
                  <div className="space-y-4">
                    {/* Add collaborator */}
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="teammate@example.com"
                        value={collabEmailInput}
                        onChange={(e) => setCollabEmailInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#D8D8D8] focus:outline-none focus:border-[#1C6048] bg-[#F9F8F6] font-mono"
                      />
                      <button
                        onClick={handleAddCollaborator}
                        className="px-4 py-2 bg-[#1C6048] hover:bg-[#154634] text-white rounded-xl text-xs font-black flex items-center gap-1 transition-colors"
                      >
                        <Plus size={14} /> Add User
                      </button>
                    </div>

                    {/* Collaborator list */}
                    <div className="space-y-2 mt-2">
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">Current Collaborators ({collabEmailList.length})</span>
                      {collabEmailList.length === 0 ? (
                        <p className="text-[11px] text-gray-400 italic bg-[#F9F8F6] p-3 rounded-xl border border-[#D8D8D8]">
                          No collaborator emails registered yet. Standard public write rules apply until you restrict access by registering the first email.
                        </p>
                      ) : (
                        <div className="max-h-36 overflow-y-auto space-y-1.5">
                          {collabEmailList.map((email: string) => (
                            <div key={email} className="flex justify-between items-center bg-[#F9F8F6] px-3 py-2 rounded-lg border border-[#D8D8D8]">
                              <span className="text-xs font-mono text-gray-700">{email}</span>
                              <button
                                onClick={() => handleRemoveCollaborator(email)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Revoke Access"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#F9F8F6] rounded-xl border border-[#D8D8D8] text-xs">
                    <p className="font-bold text-[#1E2F31] flex items-center gap-1 mb-1">
                      <Lock size={13} /> Collaborator Mode
                    </p>
                    <p className="text-[#4C4A4B] leading-relaxed">
                      You are editing a project owned by <span className="font-semibold font-mono">{projectOwnerId}</span>. Under PSAK and secure rules, only the original project owner is authorized to add or revoke collaborator emails.
                    </p>
                  </div>
                )}
              </div>

              {/* Join Team Workspace (Option A/B Integration Form) */}
              <div className="bg-white rounded-[24px] border border-[#D8D8D8] p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="font-black text-sm text-[#1E2F31] mb-1">Join Another Team Workspace</h3>
                  <p className="text-[11px] text-[#4C4A4B]">
                    Paste the shared Workspace Access Token from your colleague to download and lock their assumptions onto your screen.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste Workspace Access Token..."
                    value={collabCodeInput}
                    onChange={(e) => setCollabCodeInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#D8D8D8] focus:outline-none focus:border-[#1C6048] bg-[#F9F8F6] font-mono"
                  />
                  <button
                    onClick={handleJoinWorkspace}
                    className="px-4 py-2 bg-[#9B8B70] hover:bg-[#85765D] text-white rounded-xl text-xs font-black transition-colors"
                  >
                    Join
                  </button>
                </div>

                {collabError && (
                  <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-medium">
                    <AlertCircle size={14} /> {collabError}
                  </div>
                )}
                {collabSuccess && (
                  <div className="p-2.5 bg-[#E8EFEA] text-[#1C6048] border border-[#1C6048]/20 rounded-xl flex items-center gap-2 text-xs font-semibold">
                    <Check size={14} /> {collabSuccess}
                  </div>
                )}

                {/* List of joined Collaborative Workspaces */}
                {joinedProjects.length > 0 && (
                  <div className="pt-2">
                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono mb-2">My Collaborative Workspaces ({joinedProjects.length})</span>
                    <div className="space-y-2">
                      {joinedProjects.map((proj) => {
                        const isCurrentActive = currentProjectId === proj.id && projectOwnerId === proj.ownerId;
                        return (
                          <div 
                            key={`${proj.ownerId}_${proj.id}`} 
                            className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                              isCurrentActive 
                                ? "bg-[#1C6048]/5 border-[#1C6048]" 
                                : "bg-white border-[#D8D8D8] hover:border-[#9B8B70]"
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#1E2F31]">{proj.name}</span>
                                {isCurrentActive && (
                                  <span className="bg-[#1C6048] text-[#EFEBE7] px-1.5 py-0.5 rounded text-[8px] uppercase font-black font-mono tracking-widest">Active</span>
                                )}
                              </div>
                              <span className="block text-[10px] text-gray-500 font-mono mt-0.5">Owner: {proj.ownerEmail}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {!isCurrentActive && (
                                <button
                                  onClick={() => onLoadProject(user.uid, proj.id, proj.ownerId)}
                                  className="px-2.5 py-1 bg-[#1E2F31] text-[#EFEBE7] hover:bg-[#1C6048] rounded-lg text-[10px] font-black transition-colors"
                                >
                                  Load
                                </button>
                              )}
                              <button
                                onClick={() => handleLeaveWorkspace(proj.id, proj.ownerId)}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                                title="Leave Workspace"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CollaborationStrategyView.displayName = "CollaborationStrategyView";
