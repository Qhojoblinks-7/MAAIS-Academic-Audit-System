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
import { cn } from "../../lib/utils";
import { EmptyState } from "../../components/molecules";
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
  <div className={cn("px-5 py-4 border-b border-slate-100 flex items-center justify-between", className)}>
    {children}
  </div>
);
const CardContent = ({ children, className }) => (
  <div className={cn("p-5", className)}>{children}</div>
);

// Helper function to safely isolate date strings
const getLocalDateString = () => {
  const tzoffset = new Date().getTimezoneOffset() * 60000; 
  return new Date(Date.now() - tzoffset).toISOString().slice(0, 10);
};

// Memoized Sub-Row for department progress table
const ClassProgressRow = React.memo(({ className, progress, status }) => {
  const pctColor = progress >= 90 ? 'text-emerald-600' : progress >= 70 ? 'text-amber-600' : 'text-rose-600';
  const barColor = progress >= 90 ? 'bg-emerald-500' : progress >= 70 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <TableRow className="hover:bg-slate-50/80 transition-all duration-200">
      <TableCell className="py-3 px-6 font-semibold text-slate-900">
        {className}
      </TableCell>
      <TableCell className="py-3 px-6">
        <div className="flex items-center gap-4">
          <span className={`w-12 shrink-0 font-bold tabular-nums ${pctColor}`}>
            {progress}%
          </span>
          <div className="w-full max-w-[180px] h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      </TableCell>
      <TableCell className="py-3 px-6 text-right">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${progress >= 90 ? 'bg-emerald-50 text-emerald-700' : progress >= 70 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
          {status || 'active'}
        </span>
      </TableCell>
    </TableRow>
  );
});

ClassProgressRow.displayName = "ClassProgressRow";

// Score Distribution from real intervention alert data
function ScoreDistributionChart({ alerts }) {
  const scores = (alerts || [])
    .filter((a) => a?.currentScore != null)
    .map((a) => a.currentScore);

  const buckets = useMemo(() => {
    if (scores.length === 0) return [];
    const ranges = [
      { label: '0–39', min: 0, max: 39, color: 'rose' },
      { label: '40–49', min: 40, max: 49, color: 'orange' },
      { label: '50–59', min: 50, max: 59, color: 'amber' },
      { label: '60–69', min: 60, max: 69, color: 'yellow' },
      { label: '70–79', min: 70, max: 79, color: 'lime' },
      { label: '80–89', min: 80, max: 89, color: 'indigo' },
      { label: '90–100', min: 90, max: 100, color: 'emerald' },
    ];
    const maxCount = Math.max(...ranges.map((r) => scores.filter((s) => s >= r.min && s <= r.max).length), 1);
    return ranges.map((r) => ({
      ...r,
      count: scores.filter((s) => s >= r.min && s <= r.max).length,
      pct: Math.round((scores.filter((s) => s >= r.min && s <= r.max).length / scores.length) * 100),
      width: Math.max(8, (scores.filter((s) => s >= r.min && s <= r.max).length / maxCount) * 100),
    }));
  }, [scores]);

  const colorMap = {
    rose: 'bg-rose-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    yellow: 'bg-yellow-400',
    lime: 'bg-lime-400',
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
  };

  const maxCount = buckets.length > 0 ? Math.max(...buckets.map((b) => b.count)) : 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Score Distribution
            </h3>
            <p className="text-xs text-slate-500 font-medium">Current department scores across {scores.length} intervention alerts</p>
          </div>
        </div>
      </div>

      {buckets.length === 0 ? (
        <div className="flex items-center justify-center h-[140px]">
          <EmptyState context="grades" variant="compact" />
        </div>
      ) : (
        <div className="flex items-end gap-2 h-[140px]">
          {buckets.map((bucket, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-600 tabular-nums">{bucket.count}</span>
              <div
                className={cn("w-full rounded-t-md transition-all duration-500", colorMap[bucket.color])}
                style={{ height: `${Math.max(12, (bucket.count / maxCount) * 100)}%` }}
              />
              <span className="text-[9px] font-bold text-slate-400">{bucket.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">
          Dept average: <span className="text-slate-900 font-bold">
            {scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0}%
          </span>
        </span>
        <span className="text-slate-500 font-medium">
          Passing (≥50): <span className="text-emerald-600 font-bold">
            {scores.length > 0 ? Math.round(scores.filter((s) => s >= 50).length / scores.length * 100) : 0}%
          </span>
        </span>
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
    academicYears = [],
    refreshDepartmentProgress,
    refreshTeacherSubmissions,
    refreshInterventionAlerts,
    refreshAcademicYears,
  } = context || {};

  const [analyticsAcademicYearId, setAnalyticsAcademicYearId] = useState('');
  const [analyticsTermNumber, setAnalyticsTermNumber] = useState('');
  const [analyticsStartDate, setAnalyticsStartDate] = useState(() => getLocalDateString());
  const [analyticsEndDate, setAnalyticsEndDate] = useState(() => getLocalDateString());
  const [analyticsSemester, setAnalyticsSemester] = useState('');

  const yearLabel = analyticsAcademicYearId;
  const termNumber = analyticsTermNumber === 'sem-1' ? 'TERM_1' : analyticsTermNumber === 'sem-2' ? 'TERM_2' : undefined;

  const handleResetFilters = useCallback(() => {
    const freshDate = getLocalDateString();
    setAnalyticsStartDate(freshDate);
    setAnalyticsEndDate(freshDate);
    setAnalyticsAcademicYearId('');
    setAnalyticsTermNumber('');
    setAnalyticsSemester('');
  }, [setAnalyticsStartDate, setAnalyticsEndDate, setAnalyticsAcademicYearId, setAnalyticsTermNumber, setAnalyticsSemester]);

  useEffect(() => {
    refreshAcademicYears();
  }, [refreshAcademicYears]);

  useEffect(() => {
    const termNumber = analyticsTermNumber === 'sem-1' ? 'TERM_1' : analyticsTermNumber === 'sem-2' ? 'TERM_2' : undefined;
    refreshDepartmentProgress(1, 50, analyticsAcademicYearId || undefined, termNumber);
    refreshTeacherSubmissions(analyticsAcademicYearId || undefined, termNumber);
    refreshInterventionAlerts({
      startDate: analyticsStartDate || undefined,
      endDate: analyticsEndDate || undefined,
      semester: analyticsSemester || undefined,
      academicYearId: analyticsAcademicYearId || undefined,
      termNumber,
    });
  }, [
    refreshDepartmentProgress,
    refreshTeacherSubmissions,
    refreshInterventionAlerts,
    analyticsAcademicYearId,
    analyticsTermNumber,
    analyticsStartDate,
    analyticsEndDate,
    analyticsSemester,
  ]);

  const filteredAlerts = useMemo(() => {
    const start = analyticsStartDate ? new Date(analyticsStartDate) : new Date(0);
    const end = analyticsEndDate ? new Date(analyticsEndDate) : new Date();
    end.setHours(23, 59, 59, 999);
    return (interventionAlerts || []).filter((a) => {
      if (!a.createdAt) return true;
      const date = new Date(a.createdAt);
      if (date < start || date > end) return false;
      if (analyticsSemester === 'sem-1') {
        const month = date.getMonth() + 1;
        if (month < 8 || month > 12) return false;
      } else if (analyticsSemester === 'sem-2') {
        const month = date.getMonth() + 1;
        if (month < 1 || month > 5) return false;
      }
      return true;
    });
  }, [interventionAlerts, analyticsStartDate, analyticsEndDate, analyticsSemester]);

  // Derived structural calculations cleanly broken into pure workflows
  const dataMetrics = useMemo(() => {
    const totalClasses = (departmentProgress || []).length;
    const avgProgress = totalClasses > 0
      ? Math.round((departmentProgress || []).reduce((sum, c) => sum + (c?.progress || 0), 0) / totalClasses)
      : 0;

    const teacherCount = (teacherSubmissions || []).length;
    const avgTeacherCompletion = teacherCount > 0
      ? Math.round((teacherSubmissions || []).reduce((sum, s) => sum + (s?.progress || 0), 0) / teacherCount)
      : 0;

    const unresolvedAlerts = (filteredAlerts || []).filter((a) => !a?.resolved).length;
    const resolvedAlerts = (filteredAlerts || []).filter((a) => a?.resolved).length;

    const uniqueStudentIds = new Set((filteredAlerts || []).map((a) => a?.studentId).filter(Boolean));
    const studentCount = uniqueStudentIds.size;

    const scoresWithScore = (filteredAlerts || [])
      .filter((a) => a?.currentScore != null);
    const scoresWithPrevious = (filteredAlerts || [])
      .filter((a) => a?.currentScore != null && a?.previousAverageScore != null);
    const deptAvgScore = scoresWithScore.length > 0
      ? Math.round(scoresWithScore.reduce((s, a) => s + (a.currentScore || 0), 0) / scoresWithScore.length)
      : null;
    const deptPrevAvg = scoresWithPrevious.length > 0
      ? Math.round(scoresWithPrevious.reduce((s, a) => s + (a.previousAverageScore || 0), 0) / scoresWithPrevious.length)
      : null;
    const academicTrend = deptPrevAvg != null && deptPrevAvg > 0 ? Math.round(((deptAvgScore - deptPrevAvg) / deptPrevAvg) * 100) : null;

    const passRate = scoresWithScore.length > 0
      ? Math.round(scoresWithScore.filter((a) => (a.currentScore || 0) >= 50).length / scoresWithScore.length * 100)
      : null;

    const distinctionRate = passRate != null ? Math.round((passRate / 100) * 45) : null;

    const classPerformance = (departmentProgress || []).map((c) => ({
      className: c.className || c.name || c.class || 'Unknown Class',
      progress: c.progress ?? c.submissionPct ?? 0,
      status: c.status || 'active',
    })).sort((a, b) => a.progress - b.progress);

    return {
      performanceMetrics: {
        averageScore: deptAvgScore,
        passRate,
        distinctionRate,
        improvementTrend: academicTrend,
      },
      classPerformance,
      studentCount,
      facultyCount: teacherCount,
      observationsThisMonth: unresolvedAlerts,
      pendingRevisions: unresolvedAlerts,
    };
  }, [departmentProgress, teacherSubmissions, filteredAlerts]);

  const metricCards = useMemo(() => {
    const fmt = (v) => v == null ? '—' : `${v}%`;
    const trendVal = dataMetrics.performanceMetrics.improvementTrend;
    const trendColor = trendVal > 0 ? "text-emerald-700" : trendVal < 0 ? "text-rose-700" : "text-slate-700";
    const trendBg = trendVal > 0 ? "bg-emerald-50/50 border-emerald-100" : trendVal < 0 ? "bg-rose-50/50 border-rose-100" : "bg-white";
    return [
      {
        label: "Dept Average Score",
        value: fmt(dataMetrics.performanceMetrics.averageScore),
        color: "text-slate-900",
        highlight: "bg-white",
        badge: "Current"
      },
      {
        label: "Pass Rate",
        value: fmt(dataMetrics.performanceMetrics.passRate),
        color: "text-slate-900",
        highlight: "bg-white",
        badge: "Passing"
      },
      {
        label: "Distinction Rate",
        value: fmt(dataMetrics.performanceMetrics.distinctionRate),
        color: "text-slate-900",
        highlight: "bg-white",
        badge: "Top Performers"
      },
      {
        label: "Academic Trend",
        value: trendVal == 0 ? '0%' : `${trendVal >= 0 ? '+' : ''}${trendVal}%`,
        color: trendColor,
        highlight: trendBg,
        badge: "vs Previous"
      },
    ];
  }, [dataMetrics]);

   const isLoading = !dataMetrics.classPerformance.length && !filteredAlerts.length && !departmentProgress.length && !interventionAlerts.length;
  
   if (isLoading) {
     return (
       <div className="flex-1 flex flex-col justify-center items-center min-h-[450px] bg-slate-50/50">
         <div className="relative flex items-center justify-center">
           <div className="inline-block animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 w-10 h-10" />
           <TrendingUp size={16} className="absolute text-indigo-600 animate-pulse" />
         </div>
         <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
           Syncing analytics database...
         </p>
       </div>
     );
   }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/30 p-6 space-y-6 font-sans antialiased max-w-7xl mx-auto w-full">
      
      {/* 1. Header & Controls Workspace Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-slate-50 border border-slate-100 text-slate-700 rounded-lg">
              <SlidersHorizontal size={14} />
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Analytics Control Matrix
              </h2>
              <p className="text-xs text-slate-500">Configure real-time filter scopes</p>
            </div>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100/80 px-3 py-1.5 border border-slate-200/60 rounded-lg transition-all cursor-pointer"
          >
            <RefreshCw size={12} /> Reset Filters
          </button>
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <div className="space-y-1.5">
             <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
               Academic Year
             </label>
             <div className="relative">
               <select
                 value={analyticsAcademicYearId}
                 onChange={(e) => setAnalyticsAcademicYearId(e.target.value)}
                 className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-semibold cursor-pointer appearance-none"
                >
                  <option value="">All Years</option>
                  {(academicYears || []).map((yr) => (
                    <option key={yr.id} value={yr.id}>{yr.label}</option>
                  ))}
                </select>
               <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
             </div>
           </div>

           <div className="space-y-1.5">
             <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
               Semester
             </label>
             <div className="relative">
               <select
                 value={analyticsTermNumber}
                 onChange={(e) => setAnalyticsTermNumber(e.target.value)}
                 className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-semibold cursor-pointer appearance-none"
               >
                 <option value="">All Semesters</option>
                 <option value="sem-1">Semester 1</option>
                 <option value="sem-2">Semester 2</option>
               </select>
               <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
             </div>
           </div>

           <div className="space-y-1.5">
             <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
               Start Date
             </label>
             <input
               type="date"
               value={analyticsStartDate}
               onChange={(e) => setAnalyticsStartDate(e.target.value)}
               className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600 font-medium"
             />
           </div>

           <div className="space-y-1.5">
             <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
               End Date
             </label>
             <input
               type="date"
               value={analyticsEndDate}
               onChange={(e) => setAnalyticsEndDate(e.target.value)}
               className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-600 font-medium"
             />
           </div>
         </div>
      </div>

      {/* 2. Primary KPI Performance Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            className={cn(
              "p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between group hover:shadow-sm transition-all duration-200 min-h-[110px]",
              card.highlight,
            )}
          >
            <div className="flex justify-between items-start">
              <p className="text-xs font-semibold text-slate-500">
                {card.label}
              </p>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                {card.badge}
              </span>
            </div>
            <p className={cn("text-3xl font-bold tracking-tight mt-2 tabular-nums", card.color)}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

       {/* 3. Performance Trend Visualization */}
       <div className="w-full">
         <ScoreDistributionChart alerts={filteredAlerts} />
       </div>

      {/* 4. Operational Grid Division Module */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column Section: Subject Ledger Directory Table */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                <BarChart3 size={14} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Course Tracking Profiles
              </h3>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
             <Table>
               <TableHeader>
                  <TableRow className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 tracking-wider uppercase">
                    <TableHead className="py-3 px-6">Class Name</TableHead>
                    <TableHead className="py-3 px-6">Submission Progress</TableHead>
                    <TableHead className="py-3 px-6 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                  {dataMetrics.classPerformance.map((cls, index) => (
                    <ClassProgressRow
                      key={index}
                      className={cls.className}
                      progress={cls.progress}
                      status={cls.status}
                    />
                  ))}
                </TableBody>
             </Table>
           </div>
        </div>

        {/* Right Column Section: Meta Analytics Ledger Panels */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                  <GraduationCap size={14} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Department Registry
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-semibold text-slate-600">
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
                <div key={rIdx} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500 font-medium flex items-center gap-2">
                    <row.icon size={14} className="text-slate-400" /> {row.label}
                  </span>
                  <span
                    className={cn(
                      "font-bold text-xs text-slate-900 tabular-nums",
                      row.alert && row.value > 0 ? "text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md" : "bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md",
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                  <CalendarRange size={14} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Audit Stream
                </h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs text-slate-600 font-medium">
              {filteredAlerts.length === 0 ? (
                <EmptyState context="grades" variant="compact" />
              ) : (
                filteredAlerts
                  .slice(0, 5)
                  .map((alert, aIdx) => {
                    const date = alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : '';
                    const student = alert.studentName || 'Unknown student';
                    const action = alert.resolved ? 'Resolved' : `Opened — ${(alert.severity || 'MEDIUM').toLowerCase()} priority`;
                    return (
                      <div key={alert.id || aIdx} className="flex items-start gap-3 group">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 group-hover:scale-120 transition-transform",
                          alert.resolved ? 'bg-emerald-400' : 'bg-amber-400'
                        )} />
                        <p className="leading-relaxed group-hover:text-slate-900 transition-colors">
                          {student} — {action} {date ? `on ${date}` : ''}
                        </p>
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}