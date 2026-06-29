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
  TIMELINE_PRESETS,
} from "../App";

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
        if (taskId === "t10" || taskId.startsWith("c")) continue; // Skip dynamically computed rollups (c1-c8) and dynamic medical equipment setup (t10)
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
                <span
                  className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#1C6048]" : "bg-[#4C4A4B]/20"}`}
                ></span>
                {preset.badge || preset.name}
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
              Active Preset:{" "}
              <strong className="text-[#1E2F31] font-black">
                {TIMELINE_PRESETS[detectedScenarioKey]?.name}
              </strong>
              . Commercial Opening at Month{" "}
              {TIMELINE_PRESETS[detectedScenarioKey]?.tasks.t13.start}.
            </span>
          ) : (
            <span className="text-amber-800 font-semibold">
              Sandbox Active: Timings manually optimized. Fully reactive to
              financial metrics.
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
                Ready to shift to{" "}
                <strong className="text-[#1E2F31] font-black">
                  "{TIMELINE_PRESETS[pendingScenarioKey]?.name}"
                </strong>
                ? This will overwrite your active manual timing adjustments for
                all milestones.
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
            className="overflow-auto custom-scrollbar timeline-scrollbar-offset w-full flex-1"
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
export { MasterTimelineView };
