import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  SlidersHorizontal,
  RefreshCw,
  BarChart3,
  GraduationCap,
  Users,
  CalendarRange,
  Activity,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { CardLayout as Card } from "../../components/templates/CardLayout";
import { useHOD } from "../../context/HODContext";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../components/ui/table";

// Explicit Sub-layout wrappers
const CardHeader = ({ children, className }) => (
  <div className={className}>{children}</div>
);
const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

// Helper function to safely isolate date strings
const getLocalDateString = () => {
  const tzoffset = new Date().getTimezoneOffset() * 60000; 
  return new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
};

// Memoized Sub-Row to prevent layout rendering drop frames across large datasets
const CoursePerformanceRow = React.memo(({ subject, average, passRate }) => {
  return (
    <TableRow className="hover:bg-slate-50/60 transition-colors group">
      <TableCell className="py-3 px-5 font-bold text-gray-900 group-hover:text-indigo-950 transition-colors">
        {subject}
      </TableCell>
      <TableCell className="py-3 px-5">
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-gray-700 font-bold">
            {average}%
          </span>
          <div className="w-full max-w-[160px] h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                average >= 85
                  ? "bg-emerald-500"
                  : average >= 75
                    ? "bg-indigo-500"
                    : "bg-amber-500",
              )}
              style={{ width: `${average}%` }}
            />
          </div>
        </div>
      </TableCell>
      <TableCell className="py-3 px-5 text-right font-bold text-slate-600">
        {passRate}%
      </TableCell>
    </TableRow>
  );
});

CoursePerformanceRow.displayName = "CoursePerformanceRow";

// Animated Progress Bar Component
function AnimatedProgressBar({ value, max = 100, label, color = "indigo" }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-900 font-bold">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            color === "emerald" ? "bg-emerald-500" :
            color === "amber" ? "bg-amber-500" :
            color === "rose" ? "bg-rose-500" : "bg-indigo-500"
          )}
        />
      </div>
    </div>
  );
}

// Year-over-Year Performance Trend Component
function PerformanceTrendChart() {
  const years = ["2021/22", "2022/23", "2023/24", "2024/25", "2025/26"];
  const [selectedMetric, setSelectedMetric] = useState("average");
  
  const metrics = useMemo(() => ({
    average: { label: "Average Score", data: [72, 75, 78, 82, 85], color: "indigo" },
    passRate: { label: "Pass Rate", data: [65, 68, 72, 76, 80], color: "emerald" },
    distinction: { label: "Distinction Rate", data: [15, 18, 22, 25, 28], color: "amber" },
  }), []);
  
  const currentMetric = metrics[selectedMetric];
  const maxValue = useMemo(() => Math.max(...currentMetric.data) + 10, [currentMetric.data]);
  
  return (
    <div className="bg-white rounded-xl border border-gray-200/70 shadow-2xs p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-indigo-500" />
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Performance Trend Across Academic Years
          </h3>
        </div>
        <div className="relative">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="average">Average Score</option>
            <option value="passRate">Pass Rate</option>
            <option value="distinction">Distinction Rate</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
      
      <div className="space-y-4">
        {currentMetric.data.map((value, idx) => (
          <AnimatedProgressBar
            key={idx}
            value={value}
            max={maxValue}
            label={years[idx]}
            color={currentMetric.color}
          />
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>Trend: <span className="text-emerald-600 font-bold">+13.9% improvement</span></span>
          <span>Projected Year 3 Target: <span className="font-bold">88%</span></span>
        </div>
      </div>
    </div>
  );
}

export function HODAnalytics() {
  const context = useHOD();
  
  const {
    departmentProgress = [],
    teacherSubmissions = [],
    interventionAlerts = [],
    gradeComparison = [],
    refreshDepartmentProgress,
    refreshTeacherSubmissions,
    refreshInterventionAlerts,
  } = context || {};

  // Operational State Filters
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [startThreshold, setStartThreshold] = useState(() => getLocalDateString());
  const [endThreshold, setEndThreshold] = useState(() => getLocalDateString());
  const [syncLoading, setSyncLoading] = useState(false);

  const handleResetFilters = useCallback(() => {
    const freshDate = getLocalDateString();
    setDepartment("");
    setSemester("");
    setStartThreshold(freshDate);
    setEndThreshold(freshDate);
  }, []);

  // Sync effect context fetching with memory cleanup to prevent race conditions
  useEffect(() => {
    let isMounted = true;
    
    const syncContextStorage = async () => {
      if (!refreshDepartmentProgress && !refreshTeacherSubmissions && !refreshInterventionAlerts) return;
      
      try {
        setSyncLoading(true);
        await Promise.allSettled([
          typeof refreshDepartmentProgress === "function" ? refreshDepartmentProgress() : Promise.resolve(),
          typeof refreshTeacherSubmissions === "function" ? refreshTeacherSubmissions() : Promise.resolve(),
          typeof refreshInterventionAlerts === "function" ? refreshInterventionAlerts() : Promise.resolve(),
        ]);
      } catch (err) {
        console.error("Context re-synchronization error:", err);
      } finally {
        if (isMounted) setSyncLoading(false);
      }
    };

    syncContextStorage();

    return () => {
      isMounted = false;
    };
  }, [department, semester, startThreshold, endThreshold, refreshDepartmentProgress, refreshTeacherSubmissions, refreshInterventionAlerts]);

  // Derived structural calculations cleanly broken into pure workflows
  const dataMetrics = useMemo(() => {
    const totalClasses = (departmentProgress || []).length;
    const avgProgress = totalClasses > 0
      ? Math.round((departmentProgress || []).reduce((sum, c) => sum + (c?.progress || 0), 0) / totalClasses)
      : 0;

    const gradedPct = (teacherSubmissions || []).length
      ? Math.round(
          ((teacherSubmissions || []).filter((s) => (s?.gradedCount || 0) >= (s?.studentCount || 0)).length /
            (teacherSubmissions || []).length) * 100
        )
      : 0;

const unresolvedAlerts = interventionAlerts?.filter((a) => !a?.resolved).length || 0;

    const derivedSubjectPerformance = gradeComparison?.length
      ? gradeComparison.map((r) => ({
          subject: r.subject ?? r.name ?? "Subject",
          average: typeof r.average === "number" ? r.average : (r.avg ?? 0),
          passRate: typeof r.passRate === "number" ? r.passRate : (r.rate ?? 0),
        }))
      : (teacherSubmissions || []).slice(0, 8).map((s) => ({
          subject: s.subject ?? s.name ?? "Subject",
          average: s.avgScore ?? s.average ?? 0,
          passRate: s.passRate ?? 0,
        }));

    const studentCount = (teacherSubmissions || []).reduce((sum, s) => sum + (s?.studentCount || 0), 0);

    return {
      performanceMetrics: {
        averageScore: avgProgress,
        passRate: gradedPct,
        distinctionRate: Math.round((gradedPct / 100) * 45),
        improvementTrend: 0,
      },
      subjectPerformance: derivedSubjectPerformance,
      studentCount,
      facultyCount: teacherSubmissions.length,
      observationsThisMonth: unresolvedAlerts,
      pendingRevisions: unresolvedAlerts,
    };
  }, [departmentProgress, teacherSubmissions, interventionAlerts, gradeComparison]);

  const metricCards = useMemo(() => {
    return [
      {
        label: "Average Score Target",
        value: `${dataMetrics.performanceMetrics.averageScore}%`,
        color: "text-slate-900",
        highlight: "bg-white",
      },
      {
        label: "Pass Rate Threshold",
        value: `${dataMetrics.performanceMetrics.passRate}%`,
        color: "text-slate-900",
        highlight: "bg-white",
      },
      {
        label: "Distinction Velocity",
        value: `${dataMetrics.performanceMetrics.distinctionRate}%`,
        color: "text-slate-900",
        highlight: "bg-white",
      },
      {
        label: "Improvement Index",
        value: `+${dataMetrics.performanceMetrics.improvementTrend}%`,
        color: "text-emerald-700",
        highlight: "bg-emerald-50/40 border-emerald-200/40",
      },
    ];
  }, [dataMetrics]);

  if (syncLoading && !dataMetrics.facultyCount) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-[420px] bg-slate-50/30">
        <div className="relative flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full border-4 border-slate-200/80 border-t-indigo-600 w-9 h-9" />
          <TrendingUp size={14} className="absolute text-indigo-600 animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          Syncing analytics database...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/50 p-6 space-y-6 font-sans antialiased max-w-6xl mx-auto w-full">
      {/* 1. Header & Controls Workspace Container */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <SlidersHorizontal size={13} />
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Analytics Parameter Scope
            </h2>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer border-none bg-transparent"
          >
            <RefreshCw size={11} className={cn(syncLoading && "animate-spin")} /> Reset Matrix
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Department Scope
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-gray-700 font-semibold cursor-pointer"
            >
              <option value="">All Departments</option>
              <option value="computer-science">Computer Science</option>
              <option value="engineering">Engineering</option>
              <option value="business">Business</option>
              <option value="arts">Arts &amp; Humanities</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Academic Cycle
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-gray-700 font-semibold cursor-pointer"
            >
              <option value="">All Semesters</option>
              <option value="fall-2025">Fall 2025</option>
              <option value="spring-2026">Spring 2026</option>
              <option value="summer-2026">Summer 2026</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Start Threshold
            </label>
            <input
              type="date"
              value={startThreshold}
              onChange={(e) => setStartThreshold(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-gray-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              End Threshold
            </label>
            <input
              type="date"
              value={endThreshold}
              onChange={(e) => setEndThreshold(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-gray-600 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. Primary KPI Performance Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            className={cn(
              "p-4 rounded-xl border border-gray-200/70 shadow-3xs flex flex-col justify-between h-[92px]",
              card.highlight,
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {card.label}
            </p>
            <p className={cn("text-2xl font-black tracking-tight", card.color)}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Performance Trend Visualization */}
      <div className="w-full">
        <PerformanceTrendChart />
      </div>

      {/* 4. Operational Grid Division Module */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column Section: Subject Ledger Directory Table */}
        <div className="bg-white rounded-xl border border-gray-200/70 shadow-3xs overflow-hidden lg:col-span-2">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-gray-50/40 flex items-center gap-1.5">
            <BarChart3 size={13} className="text-indigo-500" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-700">
              Course Tracking Profiles
            </h3>
          </div>
<div className="overflow-x-auto">
             <Table>
               <TableHeader>
                 <TableRow className="bg-slate-50/20 border-b border-slate-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                   <TableHead className="py-3 px-5">Subject Header</TableHead>
                   <TableHead className="py-3 px-5">Performance Mean</TableHead>
                   <TableHead className="py-3 px-5 text-right">Pass Parameter Quota</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody className="divide-y divide-slate-100 text-xs text-gray-700 font-medium">
                 {dataMetrics.subjectPerformance.map((subject, index) => (
                   <CoursePerformanceRow
                     key={index}
                     subject={subject.subject}
                     average={subject.average}
                     passRate={subject.passRate}
                   />
                 ))}
               </TableBody>
             </Table>
           </div>
        </div>

        {/* Right Column Section: Meta Analytics Ledger Panels */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="bg-white rounded-xl border border-gray-200/70 shadow-3xs overflow-hidden">
            <CardHeader className="px-4 py-3 border-b border-slate-100 bg-gray-50/40 flex items-center gap-1.5">
              <GraduationCap size={13} className="text-indigo-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-700">
                Department Registry
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs font-semibold text-gray-600">
              {[
                {
                  label: "Total Enrolled Cohort",
                  value: dataMetrics.studentCount,
                  icon: Users,
                },
                {
                  label: "Staff Resource Units",
                  value: dataMetrics.facultyCount,
                  icon: Users,
                },
                {
                  label: "Monthly Assessment Runs",
                  value: dataMetrics.observationsThisMonth,
                  icon: Activity,
                },
                {
                  label: "Awaiting Compliance Reviews",
                  value: dataMetrics.pendingRevisions,
                  icon: Activity,
                  alert: true,
                },
              ].map((row, rIdx) => (
                <div key={rIdx} className="flex justify-between items-center py-0.5">
                  <span className="text-gray-400 font-medium flex items-center gap-1.5">
                    <row.icon size={12} className="text-gray-300" /> {row.label}
                  </span>
                  <span
                    className={cn(
                      "font-black text-xs text-slate-900",
                      row.alert && row.value > 0 && "text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md",
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl border border-gray-200/70 shadow-3xs overflow-hidden">
            <CardHeader className="px-4 py-3 border-b border-slate-100 bg-gray-50/40 flex items-center gap-1.5">
              <CalendarRange size={13} className="text-indigo-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-700">
                Audit Stream
              </h3>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs text-gray-500 font-medium">
              {[
                "5 new lesson plans submitted today",
                "3 observations completed this week",
                "2 grading sheets ready for review",
                "1 faculty development session scheduled",
              ].map((activity, aIdx) => (
                <div key={aIdx} className="flex items-start gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0 group-hover:scale-110 transition-transform" />
                  <p className="leading-normal group-hover:text-slate-800 transition-colors">
                    {activity}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}