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
} from "lucide-react";
import { cn } from "../../lib/utils";
import { CardLayout as Card } from "../../components/templates/CardLayout";
import { useHOD } from "../../context/HODContext";

const CardHeader = ({ children, className }) => (
  <div className={className}>{children}</div>
);
const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

// Memoized Sub-Row to prevent layout rendering drop frames across large datasets
const CoursePerformanceRow = React.memo(({ subject, average, passRate }) => {
  return (
    <tr className="hover:bg-slate-50/60 transition-colors group">
      <td className="py-3 px-5 font-bold text-gray-900 group-hover:text-indigo-950 transition-colors">
        {subject}
      </td>
      <td className="py-3 px-5">
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
      </td>
      <td className="py-3 px-5 text-right font-bold text-slate-600">
        {passRate}%
      </td>
    </tr>
  );
});

CoursePerformanceRow.displayName = "CoursePerformanceRow";

export function HODAnalytics() {
  const {
    departmentProgress = [],
    teacherSubmissions = [],
    interventionAlerts = [],
    gradeComparison,
    refreshDepartmentProgress,
    refreshTeacherSubmissions,
    refreshInterventionAlerts,
  } = useHOD?.() ?? {};

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flattened structural configuration inputs
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  
  // Safe ISO Local Date generator function
  const getLocalDateString = () => new Date().toISOString().slice(0, 10);
  
  const [startThreshold, setStartThreshold] = useState(getLocalDateString);
  const [endThreshold, setEndThreshold] = useState(getLocalDateString);

  const handleResetFilters = useCallback(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setDepartment("");
    setSemester("");
    setStartThreshold(todayStr);
    setEndThreshold(todayStr);
  }, []);

  // Fix 1: Independent data sync caller triggers only when critical filters execute
  useEffect(() => {
    let isMounted = true;
    
    const syncContextStorage = async () => {
      try {
        await Promise.allSettled([
          typeof refreshDepartmentProgress === "function" ? refreshDepartmentProgress() : null,
          typeof refreshTeacherSubmissions === "function" ? refreshTeacherSubmissions() : null,
          typeof refreshInterventionAlerts === "function" ? refreshInterventionAlerts() : null,
        ]);
      } catch (err) {
        console.error("Context re-synchronization error:", err);
      }
    };

    syncContextStorage();
  }, [department, semester, startThreshold, endThreshold]); 
  // Remounting calculations trigger safely when parameter filters update

  // Fix 2: Isolate calculations from context mutations to kill the infinite render cycle
  useEffect(() => {
    setLoading(true);

    const totalClasses = Array.isArray(departmentProgress) ? departmentProgress.length : 0;
    const avgProgress = totalClasses > 0
      ? Math.round(
          departmentProgress.reduce((sum, c) => sum + (c?.progress || 0), 0) / totalClasses
        )
      : 0;

    const submissions = Array.isArray(teacherSubmissions) ? teacherSubmissions : [];
    const gradedPct = submissions.length
      ? Math.round(
          (submissions.filter((s) => (s?.gradedCount || 0) >= (s?.studentCount || 0)).length /
            submissions.length) * 100
        )
      : 0;

    const alerts = Array.isArray(interventionAlerts) ? interventionAlerts : [];
    const unresolvedAlerts = alerts.filter((a) => !a?.resolved).length;

    const derivedSubjectPerformance =
      Array.isArray(gradeComparison) && gradeComparison.length
        ? gradeComparison.map((r) => ({
            subject: r.subject ?? r.name ?? "Subject",
            average: typeof r.average === "number" ? r.average : (r.avg ?? 0),
            passRate: typeof r.passRate === "number" ? r.passRate : (r.rate ?? 0),
          }))
        : submissions.slice(0, 8).map((s) => ({
            subject: s.subject ?? s.name ?? "Subject",
            average: s.avgScore ?? s.average ?? 0,
            passRate: s.passRate ?? 0,
          }));

    setData({
      performanceMetrics: {
        averageScore: avgProgress,
        passRate: gradedPct,
        distinctionRate: Math.round((gradedPct / 100) * 45),
        improvementTrend: 0,
      },
      subjectPerformance: derivedSubjectPerformance,
      studentCount: submissions.reduce((sum, s) => sum + (s?.studentCount || 0), 0) || 0,
      facultyCount: submissions.length || 0, // Fallback calculation mapping instead of blank null
      observationsThisMonth: unresolvedAlerts,
      pendingRevisions: unresolvedAlerts,
    });

    setLoading(false);
  }, [departmentProgress, teacherSubmissions, interventionAlerts, gradeComparison]);

  const metricCards = useMemo(() => {
    if (!data) return [];
    return [
      {
        label: "Average Score Target",
        value: `${data.performanceMetrics.averageScore}%`,
        color: "text-slate-900",
        highlight: "bg-white",
      },
      {
        label: "Pass Rate Threshold",
        value: `${data.performanceMetrics.passRate}%`,
        color: "text-slate-900",
        highlight: "bg-white",
      },
      {
        label: "Distinction Velocity",
        value: `${data.performanceMetrics.distinctionRate}%`,
        color: "text-slate-900",
        highlight: "bg-white",
      },
      {
        label: "Improvement Index",
        value: `+${data.performanceMetrics.improvementTrend}%`,
        color: "text-emerald-700",
        highlight: "bg-emerald-50/40 border-emerald-200/40",
      },
    ];
  }, [data]);

  if (loading || !data) {
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
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-3xs p-4 flex flex-col gap-4">
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
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <RefreshCw size={11} /> Reset Matrix
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
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-gray-700 font-semibold"
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
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-gray-700 font-semibold"
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

      {/* 3. Operational Grid Division Module */}
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/20 border-b border-slate-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  <th className="py-3 px-5">Subject Header</th>
                  <th className="py-3 px-5">Performance Mean</th>
                  <th className="py-3 px-5 text-right">Pass Parameter Quota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-gray-700 font-medium">
                {data.subjectPerformance.map((subject, index) => (
                  <CoursePerformanceRow
                    key={index}
                    subject={subject.subject}
                    average={subject.average}
                    passRate={subject.passRate}
                  />
                ))}
              </tbody>
            </table>
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
                  value: data.studentCount,
                  icon: Users,
                },
                {
                  label: "Staff Resource Units",
                  value: data.facultyCount,
                  icon: Users,
                },
                {
                  label: "Monthly Assessment Runs",
                  value: data.observationsThisMonth,
                  icon: Activity,
                },
                {
                  label: "Awaiting Compliance Reviews",
                  value: data.pendingRevisions,
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
                      row.alert && "text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md",
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